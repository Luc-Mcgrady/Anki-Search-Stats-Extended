<script lang="ts">
    import { renderLineChart } from "./LineGraph"
    import {
        type DrawnTrend,
        type TrendLine,
    } from "./trend"
    import { loadPinnedTrendRanges, queuePersistPinnedRanges, queuePersistStoredPinnedRanges } from "./trendPinnedPersistence"

    let svg: SVGElement | undefined

    export let label: string
    export let data: number[]
    export let trend_data: DrawnTrend[] = []
    export let current_trend: TrendLine = undefined
    export let removeTrend: (id: number) => void = () => {}
    export let togglePinTrend: (id: number) => void = () => {}
    export let trendPersistenceKey: string
    let migrated_temporal_store_keys = new Set<string>()

    $: if (svg) {
        const { initialPinnedRanges, migratedStoredRanges } = loadPinnedTrendRanges(
            trendPersistenceKey,
            true
        )
        if (migratedStoredRanges && !migrated_temporal_store_keys.has(trendPersistenceKey)) {
            migrated_temporal_store_keys.add(trendPersistenceKey)
            void queuePersistStoredPinnedRanges(trendPersistenceKey, migratedStoredRanges)
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
                void queuePersistPinnedRanges(trendPersistenceKey, ranges, true)
            },
        })
    }
</script>

<svg bind:this={svg}></svg>
