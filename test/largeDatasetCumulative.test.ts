/**
 * Tests to reproduce the bug that only appears with "all history" (large datasets)
 *
 * The bug: When you have a large dataset (e.g., years of history) and only display
 * a portion of it (e.g., last 30 bars), the cumulative mode shows different final
 * values depending on bar width.
 */

import { DeltaIfy } from "../src/ts/Candlestick"

function simulateLargeDataset(
    rawData: number[],
    bins: number,
    binSize: number,
    scroll: number
): { start: number; finalValue: number; dataShown: number[] } {
    // Step 1: Compute cumulative data
    let sum = 0
    const processed_data = rawData.map((value) => {
        sum += value ?? 0
        return sum
    })

    // Step 2: Calculate start value
    const realOffset = -Math.abs(scroll)
    const leftmost = -(bins * binSize) + realOffset
    const leftmostIndex = processed_data.length + leftmost - 1

    const start = leftmostIndex >= 0 ? processed_data[leftmostIndex] : 0

    const allDeltas = DeltaIfy(processed_data)

    // Step 3: Slice the data
    const separate_bars = allDeltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

    console.log("Data length:", rawData.length)
    console.log("bins:", bins, "binSize:", binSize)
    console.log("leftmost:", leftmost)
    console.log("leftmostIndex:", leftmostIndex)
    console.log("start:", start)
    console.log("separate_bars.length:", separate_bars.length)

    // Step 4: Bin the deltas (using the FIXED algorithm)
    const numBars = Math.ceil(separate_bars.length / binSize)
    console.log("numBars:", numBars)

    const bars = Array.from({ length: numBars }, () => ({ delta: 0 }))

    // @ts-ignore
    for (const [i, bar_data] of separate_bars.entries()) {
        const newIndex = Math.floor(i / binSize)
        if (newIndex < bars.length) {
            bars[newIndex].delta += bar_data || 0
        }
    }

    const binnedDeltas = bars.map(b => b.delta)

    // Step 5: Calculate final value
    let total = start
    for (const delta of binnedDeltas) {
        total += delta
    }

    return {
        start,
        finalValue: total,
        dataShown: binnedDeltas
    }
}

describe("Large Dataset Cumulative Bug", () => {
    // Simulate years of data (e.g., 3 years = ~1095 days)
    const largeData = Array.from({ length: 1095 }, (_, i) => Math.floor(Math.random() * 5) + 1)
    const expectedFinalCumulative = largeData.reduce((sum, val) => sum + val, 0)

    test("Large dataset: showing last 30 bars with binSize=1", () => {
        const bins = 30
        const binSize = 1
        const result = simulateLargeDataset(largeData, bins, binSize, 0)

        console.log("Expected final cumulative:", expectedFinalCumulative)
        console.log("Actual final value:", result.finalValue)

        // When showing only the last 30 days, the final value should still be the total cumulative
        expect(result.finalValue).toBe(expectedFinalCumulative)
    })

    test("Large dataset: showing last 30 bars with binSize=11", () => {
        const bins = 30
        const binSize = 11
        const result = simulateLargeDataset(largeData, bins, binSize, 0)

        console.log("\n=== binSize=11 ===")
        console.log("Expected final cumulative:", expectedFinalCumulative)
        console.log("Actual final value:", result.finalValue)

        expect(result.finalValue).toBe(expectedFinalCumulative)
    })

    test("Large dataset: showing last 30 bars with binSize=12", () => {
        const bins = 30
        const binSize = 12
        const result = simulateLargeDataset(largeData, bins, binSize, 0)

        console.log("\n=== binSize=12 ===")
        console.log("Expected final cumulative:", expectedFinalCumulative)
        console.log("Actual final value:", result.finalValue)

        expect(result.finalValue).toBe(expectedFinalCumulative)
    })

    test("Understanding the issue with large datasets", () => {
        const dataLength = 1095
        const bins = 30

        console.log("\n=== Analyzing large dataset behavior ===")
        console.log("Total data points:", dataLength)

        for (const binSize of [1, 10, 11, 12]) {
            const realOffset = 0
            const leftmost = -(bins * binSize) + realOffset
            const leftmostIndex = dataLength + leftmost - 1

            // How much data gets sliced?
            const sliceStart = dataLength + leftmost
            const sliceEnd = realOffset === 0 ? dataLength : dataLength + realOffset
            const actualSliceStart = Math.max(0, sliceStart)
            const seperate_bars_length = sliceEnd - actualSliceStart

            console.log(`\nbinSize=${binSize}:`)
            console.log("  leftmost:", leftmost)
            console.log("  leftmostIndex:", leftmostIndex)
            console.log("  Slice from:", actualSliceStart, "to", sliceEnd)
            console.log("  separate_bars length:", seperate_bars_length)
            console.log("  Number of bins created:", Math.ceil(seperate_bars_length / binSize))
            console.log("  Should show data points:", actualSliceStart, "to", sliceEnd - 1)
        }
    })

    test("Edge case: when leftmost goes beyond data start", () => {
        const bins = 30
        const binSize = 50  // Very large bin size
        const result = simulateLargeDataset(largeData, bins, binSize, 0)

        console.log("\n=== Very large binSize=50 ===")
        console.log("Expected final cumulative:", expectedFinalCumulative)
        console.log("Actual final value:", result.finalValue)

        // Should still show correct cumulative total
        expect(result.finalValue).toBe(expectedFinalCumulative)
    })

    test("Comparing binSize 11 and 12 with large dataset", () => {
        const bins = 30

        const result11 = simulateLargeDataset(largeData, bins, 11, 0)
        const result12 = simulateLargeDataset(largeData, bins, 12, 0)

        console.log("\n=== Comparison of binSize 11 vs 12 ===")
        console.log("binSize=11 final:", result11.finalValue)
        console.log("binSize=12 final:", result12.finalValue)
        console.log("Expected:", expectedFinalCumulative)
        console.log("Difference 11:", result11.finalValue - expectedFinalCumulative)
        console.log("Difference 12:", result12.finalValue - expectedFinalCumulative)

        // Both should give the same result!
        expect(result11.finalValue).toBe(expectedFinalCumulative)
        expect(result12.finalValue).toBe(expectedFinalCumulative)
    })

    test("Small window on large dataset - the key scenario", () => {
        // This simulates "all history" with a display window showing only recent data
        const allHistoryLength = 2000  // 5+ years of data
        const displayBins = 30  // Only show last 30 bins

        // Generate realistic data
        const allHistory = Array.from({ length: allHistoryLength }, (_, i) =>
            Math.floor(Math.sin(i / 50) * 2 + 3)  // Varying between 1-5
        )
        const totalCumulative = allHistory.reduce((sum, val) => sum + val, 0)

        console.log("\n=== Small window on large dataset ===")
        console.log("Total history length:", allHistoryLength)
        console.log("Display bins:", displayBins)
        console.log("Total cumulative:", totalCumulative)

        const results = []
        for (const binSize of [10, 11, 12]) {
            const result = simulateLargeDataset(allHistory, displayBins, binSize, 0)
            results.push({ binSize, ...result })
            console.log(`\nbinSize=${binSize}:`)
            console.log("  Final value:", result.finalValue)
            console.log("  Error:", result.finalValue - totalCumulative)
        }

        // All should match the total cumulative
        for (const result of results) {
            expect(result.finalValue).toBe(totalCumulative)
        }
    })
})
