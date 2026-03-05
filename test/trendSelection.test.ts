import {
    createTrendFromData,
    filteredTrendData,
    nextTrendClickTransition,
    removeTrendById,
    trendColour,
    trendDataInRange,
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

    test("trend colour cycles through palette", () => {
        expect(trendColour(0)).toBe("#e63946")
        expect(trendColour(6)).toBe("#e63946")
    })

    test("removes one trend by id", () => {
        const trends = [
            { id: 1, colour: "#000", trend: { slope: 1, yStart: 0, calcY: (x: number) => x } },
            { id: 2, colour: "#111", trend: { slope: 2, yStart: 0, calcY: (x: number) => x } },
        ]
        expect(removeTrendById(trends as any, 1)).toEqual([trends[1]])
    })
})
