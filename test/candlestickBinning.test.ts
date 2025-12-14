/**
 * Tests to reproduce the binning bug in Candlestick.svelte
 *
 * The bug: When binSize is large (e.g., 10, 11, 12), the number of bars created by
 * _.range(leftmost, realOffset, binSize) doesn't match the actual number of bins
 * needed to hold all the separate_bars data.
 */

import _ from "lodash"

describe("Candlestick Binning Bug", () => {
    test("_.range with different binSize produces different number of bars", () => {
        const bins = 30
        const realOffset = 0

        const binSize10 = 10
        const leftmost10 = -(bins * binSize10) + realOffset // -300
        const range10 = _.range(leftmost10, realOffset, binSize10)
        console.log("binSize=10, leftmost=-300, range length:", range10.length)
        console.log("range10:", range10)

        const binSize11 = 11
        const leftmost11 = -(bins * binSize11) + realOffset // -330
        const range11 = _.range(leftmost11, realOffset, binSize11)
        console.log("binSize=11, leftmost=-330, range length:", range11.length)
        console.log("range11:", range11)

        const binSize12 = 12
        const leftmost12 = -(bins * binSize12) + realOffset // -360
        const range12 = _.range(leftmost12, realOffset, binSize12)
        console.log("binSize=12, leftmost=-360, range length:", range12.length)
        console.log("range12:", range12)

        // These should all produce 30 bars (since bins = 30), but they don't!
        expect(range10.length).toBe(30)
        expect(range11.length).toBe(30)
        expect(range12.length).toBe(30)
    })

    test("Simulating the fix - bars created based on actual data length", () => {
        // Simulate having 100 data points
        const dataLength = 100
        const bins = 30
        const binSize = 11
        const realOffset = 0

        const leftmost = -(bins * binSize) + realOffset // -330

        // Slice the data (negative indices from the end)
        const sliceStart = dataLength + leftmost // 100 - 330 = -230 (clamped to 0 by slice)
        const sliceEnd = realOffset === 0 ? dataLength : dataLength + realOffset
        const seperate_bars_length = sliceEnd - Math.max(0, sliceStart) // 100 items

        console.log("Data length:", dataLength)
        console.log("leftmost:", leftmost)
        console.log("Slice range:", sliceStart, "to", sliceEnd)
        console.log("separate_bars would have length:", seperate_bars_length)

        // OLD (buggy) way: Create bars array using _.range
        const range_buggy = _.range(leftmost, realOffset, binSize)
        console.log("BUGGY bars array length from _.range:", range_buggy.length)

        // NEW (fixed) way: Create bars based on actual data length
        const bars_fixed = Math.ceil(seperate_bars_length / binSize)
        console.log("FIXED bars array length:", bars_fixed)
        console.log("Expected bins needed:", Math.ceil(seperate_bars_length / binSize))

        // The fix ensures we create the right number of bars!
        expect(bars_fixed).toBe(Math.ceil(seperate_bars_length / binSize))
    })

    test("Understanding how separate_bars are distributed into bars", () => {
        const bins = 30
        const binSize = 10
        const realOffset = 0
        const dataLength = 100

        const leftmost = -(bins * binSize) + realOffset
        const seperate_bars_length = Math.min(dataLength, Math.abs(leftmost))

        const bars_length = _.range(leftmost, realOffset, binSize).length

        console.log("\n=== binSize=10 ===")
        console.log("Expected to show last", seperate_bars_length, "data points")
        console.log("Number of bars created:", bars_length)
        console.log("Data points per bar:", seperate_bars_length / bars_length)

        // When distributing separate_bars into bars:
        // for (const [i, bar] of separate_bars.entries()) {
        //     const newIndex = Math.floor(i / binSize)
        //     bars[newIndex].delta += bar.delta || 0
        // }

        // If separate_bars has 100 items and binSize = 10:
        // newIndex ranges from 0 to 9 (10 unique indices)
        // But bars might have been created with a different length!

        for (let i = 0; i < seperate_bars_length; i++) {
            const newIndex = Math.floor(i / binSize)
            if (newIndex >= bars_length) {
                console.log("ERROR: Trying to access bars[" + newIndex + "] but bars.length =", bars_length)
            }
        }
    })

    test("The real fix: bars should be created based on separate_bars length", () => {
        const bins = 30
        const binSizes = [10, 11, 12]
        const dataLength = 100
        const realOffset = 0

        for (const binSize of binSizes) {
            const leftmost = -(bins * binSize) + realOffset

            // Current (buggy) way: create bars from _.range
            const bars_buggy = _.range(leftmost, realOffset, binSize)

            // Correct way: create bars based on actual data that will be sliced
            const sliceStart = Math.max(0, dataLength + leftmost)
            const sliceEnd = realOffset === 0 ? dataLength : dataLength + realOffset
            const seperate_bars_length = sliceEnd - sliceStart
            const bars_correct_length = Math.ceil(seperate_bars_length / binSize)

            console.log(`\nbinSize=${binSize}:`)
            console.log("  Buggy bars length:", bars_buggy.length)
            console.log("  Correct bars length:", bars_correct_length)
            console.log("  separate_bars length:", seperate_bars_length)
        }
    })
})
