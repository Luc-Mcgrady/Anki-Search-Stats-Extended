import {
    __resetPinnedTrendPersistenceQueueForTests,
    loadPinnedTrendRanges,
    queuePersistPinnedRanges,
    queuePersistStoredPinnedRanges,
} from "../src/ts/trendPinnedPersistence"

describe("trend pinned persistence", () => {
    beforeEach(() => {
        SSEconfig.pinnedTrends = {}
        __resetPinnedTrendPersistenceQueueForTests()
    })

    test("loads pinned ranges and reports migrated ranges only when needed", () => {
        SSEconfig.pinnedTrends = {
            key: [{ startX: "2025-01-01", endX: "2025-01-02" }],
        }
        const loaded = loadPinnedTrendRanges("key", true)
        expect(loaded.initialPinnedRanges).toHaveLength(1)
        expect(Number.isFinite(loaded.initialPinnedRanges[0].startX)).toBe(true)
        expect(Number.isFinite(loaded.initialPinnedRanges[0].endX)).toBe(true)
        expect(loaded.migratedStoredRanges).toBeUndefined()
    })

    test("serializes queued writes and persists cumulative state", async () => {
        const calls: any[] = []
        const save = jest.fn(async (_key: string, value: unknown) => {
            calls.push(JSON.parse(JSON.stringify(value)))
        })

        await Promise.all([
            queuePersistStoredPinnedRanges("first", [{ startX: 1, endX: 2 }], save as any),
            queuePersistStoredPinnedRanges("second", [{ startX: 3, endX: 4 }], save as any),
        ])

        expect(calls).toEqual([
            {
                first: [{ startX: 1, endX: 2 }],
            },
            {
                first: [{ startX: 1, endX: 2 }],
                second: [{ startX: 3, endX: 4 }],
            },
        ])
        expect(SSEconfig.pinnedTrends).toEqual(calls[1])
    })

    test("rolls back in-memory state when persistence fails", async () => {
        SSEconfig.pinnedTrends = {
            stable: [{ startX: 10, endX: 20 }],
        }
        const save = jest.fn(async () => {
            throw new Error("save failed")
        })
        const warn = jest.spyOn(console, "warn").mockImplementation(() => {})

        const persisted = await queuePersistPinnedRanges(
            "unstable",
            [{ startX: 1, endX: 2 }],
            false,
            save as any
        )

        expect(persisted).toBe(false)
        expect(SSEconfig.pinnedTrends).toEqual({
            stable: [{ startX: 10, endX: 20 }],
        })
        warn.mockRestore()
    })
})
