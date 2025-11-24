/**
 * Verify sparse array behavior to understand the actual bug
 */

describe("Verify Sparse Array Behavior", () => {
    test("Does map() really skip sparse slots?", () => {
        const sparse: number[] = []
        sparse[0] = 1
        sparse[2] = 3
        sparse[4] = 5

        console.log("Sparse array:", sparse)
        console.log("sparse.length:", sparse.length)
        console.log("sparse[1]:", sparse[1])

        let mapCallCount = 0
        const mapped = sparse.map((value) => {
            mapCallCount++
            console.log("map called with:", value)
            return value * 2
        })

        console.log("Map was called", mapCallCount, "times")
        console.log("Mapped array:", mapped)
        console.log("mapped[1]:", mapped[1])

        // If map() skips holes, it should only be called 3 times, not 5
        console.log("Does map() skip holes?", mapCallCount < sparse.length)
    })

    test("Does Array.from() fill sparse slots?", () => {
        const sparse: number[] = []
        sparse[0] = 1
        sparse[2] = 3
        sparse[4] = 5

        const dense = Array.from(sparse)

        console.log("\nDense array:", dense)
        console.log("dense.length:", dense.length)
        console.log("dense[1]:", dense[1])

        let mapCallCount = 0
        const mapped = dense.map((value) => {
            mapCallCount++
            return value ?? 0
        })

        console.log("Map was called", mapCallCount, "times")
        console.log("Mapped array:", mapped)
        console.log("Does Array.from() create dense array?", mapCallCount === dense.length)
    })

    test("Cumulative sum with sparse array - the actual bug", () => {
        // Simulate introduced_load_by_day
        const loads: number[] = []
        loads[0] = 1
        loads[5] = 2
        loads[10] = 3

        console.log("\n=== BUGGY VERSION (without Array.from) ===")
        let sum1 = 0
        const cumulative_buggy = loads.map((value) => {
            sum1 += value ?? 0
            console.log("Processing value:", value, "sum now:", sum1)
            return sum1
        })

        console.log("Buggy cumulative:", cumulative_buggy)
        console.log("cumulative_buggy[9]:", cumulative_buggy[9])
        console.log("cumulative_buggy[10]:", cumulative_buggy[10])

        console.log("\n=== FIXED VERSION (with Array.from) ===")
        let sum2 = 0
        const cumulative_fixed = Array.from(loads).map((value) => {
            sum2 += value ?? 0
            return sum2
        })

        console.log("Fixed cumulative:", cumulative_fixed)
        console.log("cumulative_fixed[9]:", cumulative_fixed[9])
        console.log("cumulative_fixed[10]:", cumulative_fixed[10])

        // The difference is crucial!
        expect(cumulative_buggy[9]).toBe(undefined) // Sparse - hole skipped!
        expect(cumulative_fixed[9]).toBe(3) // Dense - all values included
    })

    test("MDN documentation verification", () => {
        // From MDN: "map() calls a provided callbackFn function once for
        // each element in an array, in order, and constructs a new array
        // from the results. callbackFn is invoked only for array indexes
        // which have assigned values (including undefined)."

        const arr = new Array(5)
        arr[0] = 1
        arr[4] = 5

        console.log("\n=== Testing MDN's statement ===")
        console.log("Array created with 'new Array(5)':", arr)
        console.log("arr.length:", arr.length)
        console.log("arr[0]:", arr[0])
        console.log("arr[1]:", arr[1])
        console.log("arr[2] === undefined:", arr[2] === undefined)
        console.log("Has property [2]:", arr.hasOwnProperty(2))

        const mapped = arr.map((v, i) => {
            console.log(`Callback called for index ${i}, value: ${v}`)
            return v * 2
        })

        console.log("Mapped result:", mapped)
        console.log("Callback was only called for indices with assigned values")
    })
})
