<script lang="ts">
    import _ from "lodash"
    import {
        limitArea,
        limit_area_width,
        trendLine,
        type BarChart,
        type BarDatum,
        type ExtraRenderInput,
        type TrendLine,
    } from "./bar"
    import Bar from "./Bar.svelte"

    export let data: BarChart
    export let extraRender = (chart: ExtraRenderInput) => {}

    export let min = 1
    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let average = false
    export let left_aligned = false
    export let limit: number = -1
    export let trend = false

    $: absOffset = Math.abs(offset)
    $: realOffset = left_aligned ? absOffset - data.data.length + bins * binSize + min : -absOffset
    $: leftmost = -(bins * binSize) + realOffset

    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(leftmost, realOffset == 0 ? undefined : realOffset)

    export let trend_values: TrendLine = undefined

    function inner_extra_render(chart: ExtraRenderInput) {
        extraRender(chart)

        limitArea(chart, limit_area_width(chart.x, limit, offset, binSize, min, realOffset))

        if (trend) {
            trend_values = trendLine(chart)
        }
    }

    let bars: BarDatum[]
    $: {
        bars = []
        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            if (!bars[newIndex]?.values) {
                bars[newIndex] = { ...bar, values: bar.values.map((a) => a || 0) }
            } else {
                bars[newIndex].values = bars[newIndex].values.map(
                    (a, i) => a + (bar?.values[i] || 0)
                )
            }
        }
        if (average) {
            bars.map((bar, i) => {
                const count = seperate_bars
                    .slice(i * binSize, (i + 1) * binSize)
                    .reduce((p, n) => p + (_.sum(n.values) > 0 ? 1 : 0), 0)

                bar.values = bar.values.map((a) => a / (count || 1))
            })
        }
    }
</script>

<div class="options">
    <label>
        Bar Width
        <input type="number" bind:value={binSize} />
    </label>
    <label>
        Scroll
        <input type="number" bind:value={offset} step={binSize} />
    </label>
</div>

<Bar data={{ ...data, data: bars, barWidth: binSize }} extraRender={inner_extra_render}></Bar>

<style>
    div.options {
        display: grid;
        grid-template-columns: auto 1fr auto 1fr;
        grid-template-areas: "a a b b";
        gap: 0.5em;
        align-items: baseline;
    }

    label {
        display: contents;
    }

    input {
        min-width: 5em;
    }
</style>
