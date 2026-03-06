import type { StoredTrendRange } from "./config"
import { saveConfigValue } from "./search"
import type { TrendRange } from "./trend"
import { pinnedTrendsForKey, upsertPinnedTrendsSnapshot } from "./trend"
import { needsStoredRangeMigration, parseStoredRanges, toStoredRange } from "./trendPersistence"

type PinnedTrendLoadResult = {
    initialPinnedRanges: TrendRange[]
    migratedStoredRanges: StoredTrendRange[] | undefined
}

let pinnedTrendWriteQueue: Promise<void> = Promise.resolve()

export function loadPinnedTrendRanges(
    trendPersistenceKey: string,
    temporalAxis: boolean
): PinnedTrendLoadResult {
    if (!trendPersistenceKey) {
        return { initialPinnedRanges: [], migratedStoredRanges: undefined }
    }
    const parsedPinnedRanges = parseStoredRanges(
        pinnedTrendsForKey(trendPersistenceKey),
        temporalAxis
    )
    const initialPinnedRanges = parsedPinnedRanges.map((range) => range.normalized)
    const migratedStoredRanges = needsStoredRangeMigration(parsedPinnedRanges)
        ? parsedPinnedRanges.map((range) => range.stored)
        : undefined
    return { initialPinnedRanges, migratedStoredRanges }
}

export function queuePersistStoredPinnedRanges(
    trendPersistenceKey: string,
    storedRanges: StoredTrendRange[],
    save: typeof saveConfigValue = saveConfigValue
) {
    if (!trendPersistenceKey) {
        return Promise.resolve(false)
    }
    pinnedTrendWriteQueue = pinnedTrendWriteQueue
        .catch(() => undefined)
        .then(async () => {
            const previousPinned = SSEconfig.pinnedTrends ?? {}
            const nextPinned = upsertPinnedTrendsSnapshot(
                previousPinned,
                trendPersistenceKey,
                storedRanges
            )
            SSEconfig.pinnedTrends = nextPinned
            try {
                await save("pinnedTrends", nextPinned)
            } catch (error) {
                SSEconfig.pinnedTrends = previousPinned
                throw error
            }
        })

    return pinnedTrendWriteQueue.then(
        () => true,
        (error) => {
            console.warn("Failed to persist pinned trends", error)
            return false
        }
    )
}

export function queuePersistPinnedRanges(
    trendPersistenceKey: string,
    ranges: TrendRange[],
    temporalAxis: boolean,
    save: typeof saveConfigValue = saveConfigValue
) {
    const storedRanges = ranges.map((range) => toStoredRange(range, temporalAxis))
    return queuePersistStoredPinnedRanges(trendPersistenceKey, storedRanges, save)
}

export function __resetPinnedTrendPersistenceQueueForTests() {
    pinnedTrendWriteQueue = Promise.resolve()
}
