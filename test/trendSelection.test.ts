import {
    FIXED_TREND_LINE_DASH,
    DEFAULT_TREND_COLOUR,
    PREVIEW_TREND_LINE_DASH,
    createTrendFromData,
    defaultTrendRange,
    denormalizeTemporalRange,
    emptyTrendSelectionState,
    filteredTrendData,
    isLikelyTimestampMs,
    nextTrendCancelTransition,
    normalizeTemporalRange,
    nextCustomTrendColour,
    nextTrendClickTransition,
    pinnedTrendsForKey,
    removeTrendById,
    storedTemporalRange,
    trendColour,
    trendDataInRange,
    trendPatternBySlope,
    trendRangesEqual,
    upsertPinnedTrendsSnapshot,
    upsertPinnedTrends,
} from "../src/ts/trend"

describe("trend selection helpers", () => {
    test("filters invalid and zero-y points", () => {
        const points = filteredTrendData([
            { x: 0, y: 0 },
            { x: 1, y: 2 },
            { x: Number.NaN, y: 2 },
            { x: 2, y: Number.POSITIVE_INFINITY },
            { x: 3, y: -1 },
        ])

        expect(points).toEqual([
            { x: 1, y: 2 },
            { x: 3, y: -1 },
        ])
    })

    test("selects trend points inclusively regardless of x-order", () => {
        const points = [
            { x: 1, y: 1 },
            { x: 2, y: 4 },
            { x: 3, y: 9 },
            { x: 4, y: 16 },
        ]

        expect(trendDataInRange(points, 2, 4)).toEqual([
            { x: 2, y: 4 },
            { x: 3, y: 9 },
            { x: 4, y: 16 },
        ])
        expect(trendDataInRange(points, 4, 2)).toEqual([
            { x: 2, y: 4 },
            { x: 3, y: 9 },
            { x: 4, y: 16 },
        ])
    })

    test("includes bins that overlap selected range", () => {
        const points = [
            { x: 1, y: 1, rangeStart: 0, rangeEnd: 2 },
            { x: 4, y: 4, rangeStart: 3, rangeEnd: 5 },
            { x: 7, y: 7, rangeStart: 6, rangeEnd: 8 },
        ]

        expect(trendDataInRange(points, 2, 3)).toEqual([
            { x: 1, y: 1, rangeStart: 0, rangeEnd: 2 },
            { x: 4, y: 4, rangeStart: 3, rangeEnd: 5 },
        ])
    })

    test("default trend range uses first and last valid data points", () => {
        expect(
            defaultTrendRange([
                { x: 1, y: 0, rangeStart: 0, rangeEnd: 2 },
                { x: 4, y: 10, rangeStart: 3, rangeEnd: 5 },
                { x: 6, y: 9, rangeStart: 6, rangeEnd: 8 },
                { x: 9, y: 0, rangeStart: 9, rangeEnd: 11 },
            ])
        ).toEqual({ startX: 3, endX: 8 })
    })

    test("computes trend slope from valid points", () => {
        const trend = createTrendFromData([
            { x: 0, y: 0 },
            { x: 1, y: 2 },
            { x: 2, y: 4 },
            { x: 3, y: 6 },
        ])

        expect(trend).toBeDefined()
        expect(trend!.calcY(3) - trend!.calcY(2)).toBeCloseTo(2, 5)
    })

    test("returns no trend with fewer than two valid points", () => {
        expect(
            createTrendFromData([
                { x: 0, y: 0 },
                { x: 1, y: 2 },
            ])
        ).toBeUndefined()
    })

    test("click transition locks range on second click and resets anchor", () => {
        expect(nextTrendClickTransition(undefined, 4)).toEqual({ nextAnchorX: 4 })
        expect(nextTrendClickTransition(4, 9)).toEqual({
            nextAnchorX: undefined,
            range: { startX: 4, endX: 9 },
        })
    })

    test("right click transition cancels only when a draw is in progress", () => {
        expect(nextTrendCancelTransition(undefined)).toEqual({
            nextAnchorX: undefined,
            clearPreview: false,
        })
        expect(nextTrendCancelTransition(4)).toEqual({
            nextAnchorX: undefined,
            clearPreview: true,
        })
    })

    test("trend colour cycles through palette", () => {
        expect(trendColour(0)).toBe("#e63946")
        expect(trendColour(6)).toBe("#e63946")
    })

    test("selects signed pattern by trend slope when provided", () => {
        const remembered = { type: "Text", value: "remembered" } as any
        const forgotten = { type: "Text", value: "forgotten" } as any
        const fallback = { type: "Text", value: "fallback" } as any

        expect(
            trendPatternBySlope({ slope: 0.5 } as any, {
                pattern: fallback,
                positivePattern: remembered,
                negativePattern: forgotten,
            })
        ).toBe(remembered)
        expect(
            trendPatternBySlope({ slope: -0.5 } as any, {
                pattern: fallback,
                positivePattern: remembered,
                negativePattern: forgotten,
            })
        ).toBe(forgotten)
        expect(
            trendPatternBySlope(undefined, {
                pattern: fallback,
                positivePattern: remembered,
                negativePattern: forgotten,
            })
        ).toBe(fallback)
    })

    test("matches trend ranges regardless of click direction", () => {
        expect(trendRangesEqual({ startX: 10, endX: 2 }, { startX: 2, endX: 10 })).toBe(true)
        expect(trendRangesEqual({ startX: 10, endX: 2 }, { startX: 3, endX: 10 })).toBe(false)
    })

    test("detects timestamp values while keeping legacy day values", () => {
        expect(isLikelyTimestampMs(1_700_000_000_000)).toBe(true)
        expect(isLikelyTimestampMs(25_000)).toBe(false)
    })

    test("normalizes and denormalizes temporal ranges", () => {
        const toDay = (value: number) => Math.floor(value / 1000)
        const toMs = (value: number) => value * 1000
        const toDate = (value: number) => `day-${value}`

        expect(
            normalizeTemporalRange({ startX: 1_700_000_000_000, endX: 1_700_000_086_400 }, toDay)
        ).toEqual({
            startX: 1_700_000_000,
            endX: 1_700_000_086,
        })
        expect(normalizeTemporalRange({ startX: 20_000, endX: 20_010 }, toDay)).toEqual({
            startX: 20_000,
            endX: 20_010,
        })
        expect(denormalizeTemporalRange({ startX: 20_000, endX: 20_010 }, toMs)).toEqual({
            startX: 20_000_000,
            endX: 20_010_000,
        })
        expect(storedTemporalRange({ startX: 20_000, endX: 20_010 }, toDate)).toEqual({
            startX: "day-20000",
            endX: "day-20010",
        })
        expect(storedTemporalRange({ startX: "2025-01-01", endX: "2025-01-10" }, toDate)).toEqual({
            startX: "2025-01-01",
            endX: "2025-01-10",
        })
    })

    test("default trend uses black and does not shift custom colour order", () => {
        expect(DEFAULT_TREND_COLOUR).toBe("#000000")
        expect(nextCustomTrendColour([{ kind: "default" }] as any)).toBe("#e63946")
        expect(
            nextCustomTrendColour([{ kind: "default" }, { kind: "custom" }] as any)
        ).toBe("#1d3557")
    })

    test("uses dotted preview line and solid fixed line styles", () => {
        expect(PREVIEW_TREND_LINE_DASH).toBe("4 2")
        expect(FIXED_TREND_LINE_DASH).toBe("none")
    })

    test("builds an empty trend selection state", () => {
        const state = emptyTrendSelectionState()
        expect(state.visibleTrends).toEqual([])
        expect(state.previewTrend).toBeUndefined()
        expect(() => state.removeTrend(1)).not.toThrow()
        expect(() => state.togglePinTrend(1)).not.toThrow()
    })

    test("removes one trend by id", () => {
        const trends = [
            {
                id: 1,
                colour: "#000",
                trend: { slope: 1, yStart: 0, calcY: (x: number) => x },
                startX: 0,
                endX: 1,
                pinned: false,
                kind: "custom",
            },
            {
                id: 2,
                colour: "#111",
                trend: { slope: 2, yStart: 0, calcY: (x: number) => x },
                startX: 1,
                endX: 2,
                pinned: true,
                kind: "custom",
            },
        ]
        expect(removeTrendById(trends as any, 1)).toEqual([trends[1]])
    })

    test("persists pinned trends under a store key", () => {
        SSEconfig.pinnedTrends = {}
        upsertPinnedTrends("chart:test", [
            { startX: 3, endX: 5 },
            { startX: 10, endX: 11 },
        ])

        expect(pinnedTrendsForKey("chart:test")).toEqual([
            { startX: 3, endX: 5 },
            { startX: 10, endX: 11 },
        ])
    })

    test("builds pinned trend snapshots immutably", () => {
        const existing = {
            old: [{ startX: 1, endX: 2 }],
        }
        const next = upsertPinnedTrendsSnapshot(existing, "new", [{ startX: 3, endX: 4 }])

        expect(existing).toEqual({
            old: [{ startX: 1, endX: 2 }],
        })
        expect(next).toEqual({
            old: [{ startX: 1, endX: 2 }],
            new: [{ startX: 3, endX: 4 }],
        })
    })

    test("keeps human-readable pinned trend dates", () => {
        SSEconfig.pinnedTrends = {
            "chart:dates": [{ startX: "2025-01-01", endX: "2025-01-12" }],
        }
        expect(pinnedTrendsForKey("chart:dates")).toEqual([
            { startX: "2025-01-01", endX: "2025-01-12" },
        ])
    })
})
