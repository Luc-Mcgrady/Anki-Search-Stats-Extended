<script lang="ts">
    import { DeltaIfy, type CandlestickGraph } from "./Candlestick"
    import Candlestick from "./Candlestick.svelte"
    import GraphTypeSelector from "./GraphTypeSelector.svelte"
    import LineGraph from "./LineGraph.svelte"
    import { searchLimit } from "./stores"
    import type { TrendLine } from "./trend"

    let type = "total"
    export let data: number[]

    let bins = 30
    let binSize = 1
    let offset = 0

    $: limit = -1 - $searchLimit
    $: learned = (trend_data?.slope || 0) > 0 ? "memorised" : "forgotten"

    let candlestick_data: CandlestickGraph
    $: if (data)
        candlestick_data = {
            start: data[data.length - bins * binSize - Math.abs(offset) - 1] || 0,
            data: Array.from(DeltaIfy(data)).map((delta, i) => ({
                label: i.toString(),
                delta,
            })),
            tick_spacing: 5,
        }

    let trend_data: TrendLine
</script>

<GraphTypeSelector>
    <label>
        <input type="radio" value="total" bind:group={type} />
        total
    </label>
    <label>
        <input type="radio" value="trend" bind:group={type} />
        trend
    </label>
</GraphTypeSelector>

{#if type == "total"}
    <LineGraph {data} />
{:else}
    <Candlestick data={candlestick_data} bind:bins bind:binSize {limit} />
{/if}
