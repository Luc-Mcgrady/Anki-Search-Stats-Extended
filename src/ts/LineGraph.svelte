<script lang="ts">
    import { renderLineChart } from "./LineGraph"
    import {
        pinnedTrendsForKey,
        type DrawnTrend,
        type TrendLine,
        type TrendRange,
        upsertPinnedTrends,
    } from "./trend"
    import { needsStoredRangeMigration, parseStoredRanges, toStoredRange } from "./trendPersistence"
    import { saveConfigValue } from "./search"

    let svg: SVGElement | undefined

    export let label: string
    export let data: number[]
    export let trend_data: DrawnTrend[] = []
    export let current_trend: TrendLine = undefined
    export let removeTrend: (id: number) => void = () => {}
    export let togglePinTrend: (id: number) => void = () => {}
    export let trend_store_key = ""
    let migrated_temporal_store_keys = new Set<string>()

    async function savePinnedTrends(ranges: TrendRange[]) {
        if (!trend_store_key) {
            return
        }
        const rangesToPersist = ranges.map((range) => toStoredRange(range, true))
        await saveConfigValue("pinnedTrends", upsertPinnedTrends(trend_store_key, rangesToPersist))
    }

    $: if (svg) {
        const storedPinnedRanges = pinnedTrendsForKey(trend_store_key)
        const parsedPinnedRanges = parseStoredRanges(storedPinnedRanges, true)
        const initialPinnedRanges = parsedPinnedRanges.map((range) => range.normalized)
        const needsMigration = needsStoredRangeMigration(parsedPinnedRanges)
        if (needsMigration && !migrated_temporal_store_keys.has(trend_store_key)) {
            migrated_temporal_store_keys.add(trend_store_key)
            const migratedRanges = parsedPinnedRanges.map((range) => range.stored)
            void saveConfigValue(
                "pinnedTrends",
                upsertPinnedTrends(trend_store_key, migratedRanges)
            )
        }

        renderLineChart(svg, data, label, {
            onTrendsChange: (nextTrends) => {
                trend_data = nextTrends
            },
            onPreviewTrendChange: (nextTrend) => {
                current_trend = nextTrend
            },
            onControllerReady: (controller) => {
                removeTrend = controller.removeTrend
                togglePinTrend = controller.togglePin
            },
            initialPinnedTrends: initialPinnedRanges,
            onPinnedRangesChange: (ranges) => {
                void savePinnedTrends(ranges)
            },
        })
    }
</script>

<svg bind:this={svg}></svg>
