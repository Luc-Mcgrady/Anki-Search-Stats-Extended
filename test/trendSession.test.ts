import {
    createGraphTrendSessionState,
    hiddenPinnedRanges,
    mergeTrendRanges,
    mergeVisibleCustomTrends,
    removeTrendFromAll,
} from "../src/ts/trendSession"

describe("trend session helpers", () => {
    test("creates an empty graph trend session state", () => {
        expect(createGraphTrendSessionState()).toEqual({
            visibleTrends: [],
            previewTrend: undefined,
            controller: undefined,
            allTrends: [],
            defaultTrendEnabled: true,
        })
    })

    test("merges only custom visible trends and keeps updates stable", () => {
        const initial = [
            {
                startX: 1,
                endX: 3,
                colour: "#111",
                pinned: true,
                kind: "custom" as const,
            },
            {
                startX: 0,
                endX: 9,
                colour: "#000",
                pinned: false,
                kind: "default" as const,
            },
        ]
        const visible = [
            {
                id: 10,
                startX: 1,
                endX: 3,
                colour: "#222",
                pinned: false,
                kind: "custom" as const,
            },
            {
                id: 11,
                startX: 5,
                endX: 8,
                colour: "#333",
                pinned: true,
                kind: "custom" as const,
            },
            {
                id: 12,
                startX: 0,
                endX: 9,
                colour: "#000",
                pinned: false,
                kind: "default" as const,
            },
        ]

        expect(mergeVisibleCustomTrends(initial as any, visible as any)).toEqual([
            {
                startX: 1,
                endX: 3,
                colour: "#222",
                pinned: false,
                kind: "custom",
            },
            {
                startX: 5,
                endX: 8,
                colour: "#333",
                pinned: true,
                kind: "custom",
            },
        ])
    })

    test("removes selected trend from session state", () => {
        const all = [
            { startX: 1, endX: 3, colour: "#111", pinned: true, kind: "custom" as const },
            { startX: 5, endX: 8, colour: "#333", pinned: false, kind: "custom" as const },
        ]
        const selected = { startX: 1, endX: 3, kind: "custom" as const }
        expect(removeTrendFromAll(all as any, selected as any)).toEqual([all[1]])
    })

    test("computes hidden pinned ranges and merges deduped ranges", () => {
        const all = [
            { startX: 1, endX: 3, colour: "#111", pinned: true, kind: "custom" as const },
            { startX: 10, endX: 12, colour: "#333", pinned: true, kind: "custom" as const },
        ]
        const visible = [{ id: 1, startX: 1, endX: 3, kind: "custom" as const }]
        const hidden = hiddenPinnedRanges(all as any, visible as any)

        expect(hidden).toEqual([{ startX: 10, endX: 12 }])
        expect(
            mergeTrendRanges(hidden, [
                { startX: 10, endX: 12 },
                { startX: 20, endX: 21 },
            ])
        ).toEqual([
            { startX: 10, endX: 12 },
            { startX: 20, endX: 21 },
        ])
    })
})
