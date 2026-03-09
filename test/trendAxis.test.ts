import {
    candlestickDisplayLabelFromIndex,
    trendMidpointXFromAxisDatum,
    trendRangeFromAxisDatum,
} from "../src/ts/trendAxis"

describe("trend axis helpers", () => {
    test("builds trend range from explicit start/end", () => {
        expect(
            trendRangeFromAxisDatum({ label: "42", trendStart: 10, trendEnd: 14 })
        ).toEqual({ startX: 10, endX: 14 })
    })

    test("falls back to label value for point-like datums", () => {
        expect(trendRangeFromAxisDatum({ label: "42" })).toEqual({ startX: 42, endX: 42 })
        expect(trendMidpointXFromAxisDatum({ label: "42" })).toBe(42)
    })

    test("uses one-based candlestick display labels", () => {
        expect(candlestickDisplayLabelFromIndex(0)).toBe("1")
        expect(candlestickDisplayLabelFromIndex(12)).toBe("13")
    })
})
