<script lang="ts">
    import { renderLineChart } from "./LineGraph"
    import type { DrawnTrend, TrendLine } from "./trend"

    let svg: SVGElement | undefined

    export let label: string
    export let data: number[]
    export let trend_data: DrawnTrend[] = []
    export let current_trend: TrendLine = undefined
    export let removeTrend: (id: number) => void = () => {}

    $: if (svg) {
        renderLineChart(svg, data, label, {
            onTrendsChange: (nextTrends) => {
                trend_data = nextTrends
            },
            onPreviewTrendChange: (nextTrend) => {
                current_trend = nextTrend
            },
            onRemoveReady: (remove) => {
                removeTrend = remove
            },
        })
    }
</script>

<svg bind:this={svg}></svg>
