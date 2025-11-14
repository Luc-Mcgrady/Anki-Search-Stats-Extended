<script lang="ts">
    import {
        CANDLESTICK_GREEN,
        CANDLESTICK_RED,
        DeltaIfy,
        type CandlestickGraph,
    } from "./Candlestick"
    import Candlestick from "./Candlestick.svelte"
    import GraphTypeSelector from "./GraphTypeSelector.svelte"
    import { i18n } from "./i18n"
    import LineGraph from "./LineGraph.svelte"
    import { binSize, scroll, searchLimit } from "./stores"
    import type { TrendLine } from "./trend"

    let type = "total"
    export let data: number[]
    export let label = "value"
    export let up_colour = CANDLESTICK_GREEN
    export let down_colour = CANDLESTICK_RED

    let bins = 30

    $: limit = -1 - $searchLimit

    let candlestick_data: CandlestickGraph
    $: if (data)
        candlestick_data = {
            start: data[data.length - bins * $binSize - Math.abs($scroll) - 1] || 0,
            data: Array.from(DeltaIfy(data)).map((delta, i) => ({
                label: i.toString(),
                delta,
            })),
            tick_spacing: 5,
            up_colour,
            down_colour,
        }

    export let trend_data: TrendLine | undefined = undefined
</script>

<GraphTypeSelector>
    <label>
        <input type="radio" value="total" bind:group={type} />
        {i18n("total")}
    </label>
    <label>
        <input type="radio" value="trend" bind:group={type} />
        {i18n("trend")}
    </label>
</GraphTypeSelector>

{#if type == "total"}
    <LineGraph {data} {label} />
{:else}
    <Candlestick
        data={candlestick_data}
        bind:bins
        bind:binSize={$binSize}
        {limit}
        bind:trend_data
        bind:offset={$scroll}
    />
{/if}
