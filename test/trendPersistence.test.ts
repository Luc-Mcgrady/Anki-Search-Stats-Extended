import {
    fromStoredRange,
    needsStoredRangeMigration,
    parseStoredRanges,
    toStoredRange,
} from "../src/ts/trendPersistence"

describe("trend persistence helpers", () => {
    test("supports numeric non-temporal ranges", () => {
        expect(fromStoredRange({ startX: "2", endX: "4" }, false)).toEqual({
            startX: 2,
            endX: 4,
        })
        expect(toStoredRange({ startX: 2, endX: 4 }, false)).toEqual({ startX: 2, endX: 4 })
        expect(fromStoredRange({ startX: "  -2.5e1  ", endX: ".5" }, false)).toEqual({
            startX: -25,
            endX: 0.5,
        })
        expect(fromStoredRange({ startX: "12abc", endX: "4" }, false)).toBeUndefined()
    })

    test("supports temporal ranges from human-readable formats only", () => {
        const fromDate = fromStoredRange({ startX: "2025-01-01", endX: "2025-01-10" }, true)
        expect(fromDate).toBeDefined()

        const fromNumeric = fromStoredRange({ startX: 10, endX: 20 }, true)
        expect(fromNumeric).toBeUndefined()
    })

    test("parses stored ranges and flags migration when needed", () => {
        const parsed = parseStoredRanges(
            [
                { startX: "2025-01-01", endX: "2025-01-10" },
                { startX: 20, endX: 40 },
            ],
            true
        )

        expect(parsed).toHaveLength(1)
        expect(parsed[0].stored).toEqual(parsed[0].original)
        expect(needsStoredRangeMigration(parsed)).toBe(false)
    })
})
