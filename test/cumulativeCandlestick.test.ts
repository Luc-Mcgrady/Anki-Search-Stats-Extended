import { DeltaIfy } from "../src/ts/Candlestick"

/**
 * Tests for cumulative mode in candlestick charts (LineOrCandlestick component)
 *
 * The bug: When cumulative mode is enabled and bar width changes, the final
 * cumulative value shown in the candlestick chart is incorrect.
 *
 * Root cause: The candlestick chart works by:
 * 1. Taking a 'start' value (baseline)
 * 2. Adding each 'delta' to compute the cumulative sum
 * 3. Displaying bars showing the changes
 *
 * When cumulative mode is on, the data is pre-cumulated, then DeltaIfy converts
 * it back to deltas. The start value must represent the cumulative sum at the
 * beginning of the visible window.
 */

describe("Cumulative Candlestick Calculations", () => {
    // Sample data representing daily load values
    const sampleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    // Cumulative version: [1, 3, 6, 10, 15, 21, 28, 36, 45, 55]
    const cumulativeData = (() => {
        let sum = 0
        return sampleData.map((value) => {
            sum += value
            return sum
        })
    })()

    test("DeltaIfy correctly converts cumulative data back to deltas", () => {
        const deltas = DeltaIfy(cumulativeData)
        expect(deltas).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    test("Cumulative mode with full data window", () => {
        const bins = 10
        const binSize = 1
        const scroll = 0

        // Calculate leftmost index (matching LineOrCandlestick.svelte logic)
        const realOffset = -Math.abs(scroll)
        const leftmost = -(bins * binSize) + realOffset
        const leftmostIndex = cumulativeData.length + leftmost - 1

        // Start value should be cumulative sum at leftmost point
        const start = leftmostIndex >= 0 ? cumulativeData[leftmostIndex] : 0

        // Get deltas for the visible window
        const deltas = DeltaIfy(cumulativeData)
        const visibleDeltas = deltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

        // Compute final value: start + sum of deltas
        const finalValue = start + visibleDeltas.reduce((sum, d) => sum + d, 0)

        // Final value should equal the last cumulative value
        expect(finalValue).toBe(55)
    })

    test("Cumulative mode with binSize = 2", () => {
        const bins = 5
        const binSize = 2
        const scroll = 0

        const realOffset = -Math.abs(scroll)
        const leftmost = -(bins * binSize) + realOffset
        const leftmostIndex = cumulativeData.length + leftmost - 1

        const start = leftmostIndex >= 0 ? cumulativeData[leftmostIndex] : 0

        const deltas = DeltaIfy(cumulativeData)
        const visibleDeltas = deltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

        // Simulate binning (as done in Candlestick.svelte)
        const binnedDeltas: number[] = []
        for (let i = 0; i < visibleDeltas.length; i += binSize) {
            let sum = 0
            for (let j = 0; j < binSize && i + j < visibleDeltas.length; j++) {
                sum += visibleDeltas[i + j]
            }
            binnedDeltas.push(sum)
        }

        const finalValue = start + binnedDeltas.reduce((sum, d) => sum + d, 0)

        // Final value should still be 55 regardless of binSize
        expect(finalValue).toBe(55)
    })

    test("Cumulative mode with binSize = 3", () => {
        const bins = 4
        const binSize = 3
        const scroll = 0

        const realOffset = -Math.abs(scroll)
        const leftmost = -(bins * binSize) + realOffset // -12
        const leftmostIndex = cumulativeData.length + leftmost - 1 // 10 + (-12) - 1 = -3

        // When leftmostIndex is negative, we're looking beyond the start of data
        const start = leftmostIndex >= 0 ? cumulativeData[leftmostIndex] : 0

        const deltas = DeltaIfy(cumulativeData)
        // slice with negative index: slice(-12) gets last 10 elements (since array length is 10)
        const visibleDeltas = deltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

        const binnedDeltas: number[] = []
        for (let i = 0; i < visibleDeltas.length; i += binSize) {
            let sum = 0
            for (let j = 0; j < binSize && i + j < visibleDeltas.length; j++) {
                sum += visibleDeltas[i + j]
            }
            binnedDeltas.push(sum)
        }

        const finalValue = start + binnedDeltas.reduce((sum, d) => sum + d, 0)

        // Final value should still be 55
        expect(finalValue).toBe(55)
    })

    test("Cumulative mode with scroll offset", () => {
        const bins = 5
        const binSize = 1
        const scroll = -2 // scroll back 2 positions

        const realOffset = -Math.abs(scroll)
        const leftmost = -(bins * binSize) + realOffset // -5 + (-2) = -7
        const leftmostIndex = cumulativeData.length + leftmost - 1 // 10 - 7 - 1 = 2

        const start = leftmostIndex >= 0 ? cumulativeData[leftmostIndex] : 0

        const deltas = DeltaIfy(cumulativeData)
        const visibleDeltas = deltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

        const finalValue = start + visibleDeltas.reduce((sum, d) => sum + d, 0)

        // When scrolled back by 2, we show 5 bins ending 2 positions before the end
        // So we should show indices 3-7 (values 4,5,6,7,8)
        // Cumulative at index 7 is 36
        expect(finalValue).toBe(36)
    })

    test("Cumulative mode with binSize = 2 and scroll = -1", () => {
        const bins = 3
        const binSize = 2
        const scroll = -1

        const realOffset = -Math.abs(scroll)
        const leftmost = -(bins * binSize) + realOffset // -6 + (-1) = -7
        const leftmostIndex = cumulativeData.length + leftmost - 1 // 10 - 7 - 1 = 2

        const start = leftmostIndex >= 0 ? cumulativeData[leftmostIndex] : 0

        const deltas = DeltaIfy(cumulativeData)
        const visibleDeltas = deltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

        const binnedDeltas: number[] = []
        for (let i = 0; i < visibleDeltas.length; i += binSize) {
            let sum = 0
            for (let j = 0; j < binSize && i + j < visibleDeltas.length; j++) {
                sum += visibleDeltas[i + j]
            }
            binnedDeltas.push(sum)
        }

        const finalValue = start + binnedDeltas.reduce((sum, d) => sum + d, 0)

        // Visible deltas are indices 3-8 (values 4,5,6,7,8,9)
        // Cumulative at index 8 is 45
        expect(finalValue).toBe(45)
    })

    test("Edge case: bins * binSize exceeds data length", () => {
        const bins = 20
        const binSize = 1
        const scroll = 0

        const realOffset = -Math.abs(scroll)
        const leftmost = -(bins * binSize) + realOffset // -20
        const leftmostIndex = cumulativeData.length + leftmost - 1 // 10 - 20 - 1 = -11

        // Start should be 0 since we're before the beginning
        const start = leftmostIndex >= 0 ? cumulativeData[leftmostIndex] : 0

        const deltas = DeltaIfy(cumulativeData)
        const visibleDeltas = deltas.slice(leftmost, realOffset === 0 ? undefined : realOffset)

        const finalValue = start + visibleDeltas.reduce((sum, d) => sum + d, 0)

        // Should still give us the full cumulative sum
        expect(finalValue).toBe(55)
    })
})
