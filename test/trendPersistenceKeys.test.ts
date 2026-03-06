import { TREND_PERSISTENCE_KEYS } from "../src/ts/trendPersistenceKeys"

describe("trend persistence keys", () => {
    test("contains stable, namespaced string keys", () => {
        const keys = Object.values(TREND_PERSISTENCE_KEYS).flatMap((group) =>
            Object.values(group)
        )
        expect(keys.length).toBeGreaterThan(0)
        expect(new Set(keys).size).toBe(keys.length)
        for (const key of keys) {
            expect(key.includes(":")).toBe(true)
        }
    })
})
