/**
 * Integration tests that simulate the exact flow through LineOrCandlestick and Candlestick components
 * to verify cumulative mode works correctly with different bar widths
 */

import { DeltaIfy } from "../src/ts/Candlestick"

/**
 * Simulates the exact flow of data through LineOrCandlestick.svelte and Candlestick.svelte
 */
function simulateCumulativeCandlestick(
    rawData: number[],
    bins: number,
    binSize: number,
    scroll: number
): { start: number; finalValue: number; binnedDeltas: number[] } {
    // Step 1: LineOrCandlestick.svelte - compute cumulative data
    let sum = 0
    const processed_data = rawData.map((value) => {
        sum += value ?? 0
        return sum
    })

    // Step 2: LineOrCandlestick.svelte - calculate start and create candlestick data
    const realOffset = -Math.abs(scroll)
    const leftmost = -(bins * binSize) + realOffset
    const leftmostIndex = processed_data.length + leftmost - 1

    const start = leftmostIndex >= 0 ? processed_data[leftmostIndex] : 0

    const allDeltas = DeltaIfy(processed_data)

    // Step 3: Candlestick.svelte - slice the data
    const separate_bars = allDeltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

    // Step 4: Candlestick.svelte - bin the deltas (using the FIXED algorithm)
    const numBars = Math.ceil(separate_bars.length / binSize)
    const bars = Array.from({ length: numBars }, () => ({ delta: 0 }))

    // @ts-ignore
    for (const [i, bar_data] of separate_bars.entries()) {
        const newIndex = Math.floor(i / binSize)
        if (newIndex < bars.length) {
            bars[newIndex].delta += bar_data || 0
        }
    }

    const binnedDeltas = bars.map(b => b.delta)

    // Step 5: plotCandlestick - calculate final value
    let total = start
    for (const delta of binnedDeltas) {
        total += delta
    }
    const finalValue = total

    return { start, finalValue, binnedDeltas }
}

describe("Cumulative Candlestick Integration Tests", () => {
    // Realistic load data: cards introduced per day
    const loadData = [2, 5, 3, 7, 4, 6, 8, 5, 9, 10]
    // Cumulative: [2, 7, 10, 17, 21, 27, 35, 40, 49, 59]
    const expectedFinalCumulative = 59

    test("binSize=1 should show correct final cumulative value", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 10, 1, 0)
        expect(finalValue).toBe(expectedFinalCumulative)
    })

    test("binSize=2 should show correct final cumulative value", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 5, 2, 0)
        expect(finalValue).toBe(expectedFinalCumulative)
    })

    test("binSize=3 should show correct final cumulative value", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 4, 3, 0)
        expect(finalValue).toBe(expectedFinalCumulative)
    })

    test("binSize=5 should show correct final cumulative value", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 2, 5, 0)
        expect(finalValue).toBe(expectedFinalCumulative)
    })

    test("binSize=7 should show correct final cumulative value", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 2, 7, 0)
        expect(finalValue).toBe(expectedFinalCumulative)
    })

    test("binSize=2 with scroll=-1", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 5, 2, -1)
        // With scroll=-1, we're looking at the last 9 values
        // Cumulative at index 8 is 49
        expect(finalValue).toBe(49)
    })

    test("Large binSize that exceeds data", () => {
        const { finalValue } = simulateCumulativeCandlestick(loadData, 1, 20, 0)
        expect(finalValue).toBe(expectedFinalCumulative)
    })

    test("Detailed trace for binSize=2 to understand the bug", () => {
        const bins = 5
        const binSize = 2
        const scroll = 0

        const result = simulateCumulativeCandlestick(loadData, bins, binSize, scroll)

        console.log("Raw data:", loadData)
        console.log("Expected final cumulative:", expectedFinalCumulative)
        console.log("Start value:", result.start)
        console.log("Binned deltas:", result.binnedDeltas)
        console.log("Sum of binned deltas:", result.binnedDeltas.reduce((a, b) => a + b, 0))
        console.log("Final value:", result.finalValue)

        // The final value MUST equal the expected cumulative sum
        expect(result.finalValue).toBe(expectedFinalCumulative)
    })

    test("Detailed trace for binSize=3 to understand the bug", () => {
        const bins = 4
        const binSize = 3
        const scroll = 0

        const result = simulateCumulativeCandlestick(loadData, bins, binSize, scroll)

        console.log("\n=== binSize=3 test ===")
        console.log("Raw data:", loadData)
        console.log("Expected final cumulative:", expectedFinalCumulative)
        console.log("Start value:", result.start)
        console.log("Binned deltas:", result.binnedDeltas)
        console.log("Sum of binned deltas:", result.binnedDeltas.reduce((a, b) => a + b, 0))
        console.log("Final value:", result.finalValue)

        expect(result.finalValue).toBe(expectedFinalCumulative)
    })

    test("Empty data edge case", () => {
        const { finalValue } = simulateCumulativeCandlestick([], 10, 1, 0)
        expect(finalValue).toBe(0)
    })

    test("Single data point", () => {
        const { finalValue } = simulateCumulativeCandlestick([5], 10, 1, 0)
        expect(finalValue).toBe(5)
    })

    test("Varying binSize from 1 to 10 should all give the same result", () => {
        for (let binSize = 1; binSize <= 10; binSize++) {
            const bins = Math.ceil(10 / binSize)
            const { finalValue } = simulateCumulativeCandlestick(loadData, bins, binSize, 0)
            expect(finalValue).toBe(expectedFinalCumulative)
        }
    })
})
