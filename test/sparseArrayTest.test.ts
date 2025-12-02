/**
 * Test to understand how sparse arrays behave with map()
 */

describe("Sparse Array Behavior", () => {
    test("map() on sparse array", () => {
        const sparse: number[] = []
        sparse[5] = 10
        sparse[10] = 20

        console.log("Sparse array:", sparse)
        console.log("Length:", sparse.length)
        console.log("sparse[0]:", sparse[0])
        console.log("sparse[1]:", sparse[1])

        // Try to create cumulative
        let sum = 0
        const cumulative = sparse.map((value) => {
            sum += value ?? 0
            return sum
        })

        console.log("Cumulative:", cumulative)
        console.log("cumulative[0]:", cumulative[0])
        console.log("cumulative[4]:", cumulative[4])
        console.log("cumulative[5]:", cumulative[5])

        // The issue: map() skips undefined elements in sparse arrays!
        expect(cumulative.length).toBe(11)
    })

    test("Array.from() on sparse array", () => {
        const sparse: number[] = []
        sparse[5] = 10
        sparse[10] = 20

        // Array.from() converts sparse to dense!
        const dense = Array.from(sparse)

        console.log("\nDense from Array.from():", dense)
        console.log("dense[0]:", dense[0])
        console.log("dense[4]:", dense[4])
        console.log("dense[5]:", dense[5])

        // Now cumulative will work correctly
        let sum = 0
        const cumulative = dense.map((value) => {
            sum += value ?? 0
            return sum
        })

        console.log("Cumulative from dense:", cumulative)
        console.log("cumulative[0]:", cumulative[0])
        console.log("cumulative[4]:", cumulative[4])
        console.log("cumulative[5]:", cumulative[5])
        console.log("cumulative[10]:", cumulative[10])

        expect(cumulative[4]).toBe(0)
        expect(cumulative[5]).toBe(10)
        expect(cumulative[10]).toBe(30)
    })

    test("Understanding the actual bug", () => {
        // Simulate introduced_load_by_day as a sparse array
        const introduced_load_by_day: number[] = []
        // Suppose cards were introduced on days 100, 200, 300
        introduced_load_by_day[100] = 0.5
        introduced_load_by_day[200] = 0.3
        introduced_load_by_day[300] = 0.7

        console.log("\n=== Simulating the bug ===")
        console.log("Sparse array length:", introduced_load_by_day.length)
        console.log("introduced_load_by_day[99]:", introduced_load_by_day[99])
        console.log("introduced_load_by_day[100]:", introduced_load_by_day[100])

        // Cumulative (buggy - using map on sparse)
        let sum1 = 0
        const cumulative_buggy = introduced_load_by_day.map((value) => {
            sum1 += value ?? 0
            return sum1
        })

        console.log("Buggy cumulative length:", cumulative_buggy.length)
        console.log("Buggy cumulative[99]:", cumulative_buggy[99])
        console.log("Buggy cumulative[100]:", cumulative_buggy[100])

        // Cumulative (fixed - using Array.from first)
        let sum2 = 0
        const cumulative_fixed = Array.from(introduced_load_by_day).map((value) => {
            sum2 += value ?? 0
            return sum2
        })

        console.log("Fixed cumulative length:", cumulative_fixed.length)
        console.log("Fixed cumulative[99]:", cumulative_fixed[99])
        console.log("Fixed cumulative[100]:", cumulative_fixed[100])
        console.log("Fixed cumulative[300]:", cumulative_fixed[300])
    })
})
