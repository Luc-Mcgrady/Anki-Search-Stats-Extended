<script lang="ts">
    import {
        CANDLESTICK_GREEN,
        CANDLESTICK_RED,
        DeltaIfy,
        type CandlestickGraph,
    } from "./Candlestick"
    import Candlestick from "./Candlestick.svelte"
    import GraphTypeSelector from "./GraphTypeSelector.svelte"
    import type { LineGraphData } from "./LineGraph"
    import LineGraph from "./LineGraph.svelte"
    import { binSize, scroll, searchLimit } from "./stores"
    import type { TrendLine } from "./trend"

    let type = "total"
    export let data: LineGraphData
    export let label = "value"
    export let up_colour = CANDLESTICK_GREEN
    export let down_colour = CANDLESTICK_RED

    let bins = 30

    $: limit = -1 - $searchLimit

    let candlestick_data: CandlestickGraph
    $: if (data && data.values[0]) {
        // Will only plot the first line in the candlestick
        debugger
        candlestick_data = {
            start:
                data.values[0][data.values[0].length - bins * $binSize - Math.abs($scroll) - 1] ||
                0,
            data: Array.from(DeltaIfy(data.values[0])).map((delta, i) => ({
                label: i.toString(),
                delta,
            })),
            tick_spacing: 5,
            up_colour,
            down_colour,
        }
    }

    export let trend_data: TrendLine | undefined
</script>

<GraphTypeSelector>
    <label>
        <input type="radio" value="total" bind:group={type} />
        Total
    </label>
    <label>
        <input type="radio" value="trend" bind:group={type} />
        Trend
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
