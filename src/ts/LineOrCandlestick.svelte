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
    import type { DrawnTrend, TrendLine } from "./trend"

    let type = "total"
    export let data: number[]
    export let label = "value"
    export let up_colour = CANDLESTICK_GREEN
    export let down_colour = CANDLESTICK_RED
    export let cumulative = false

    let bins = 30

    $: limit = -1 - $searchLimit

    function mapIndividualToCumulativeData(data: number[]): number[] {
        let sum = 0
        return data.map((value) => {
            sum += value ?? 0
            return sum
        })
    }

    // Array.from(data) to make sparse array dense
    data = Array.from(data)

    $: processed_data = cumulative ? mapIndividualToCumulativeData(data) : data

    let candlestick_data: CandlestickGraph
    $: if (processed_data)
        candlestick_data = {
            start:
                processed_data[processed_data.length - bins * $binSize - Math.abs($scroll) - 1] ||
                0,
            data: Array.from(DeltaIfy(processed_data)).map((delta, i) => ({
                label: i.toString(),
                delta,
            })),
            tick_spacing: 5,
            up_colour,
            down_colour,
        }

    export let trend_data: DrawnTrend[] = []
    export let current_trend: TrendLine = undefined
    export let removeTrend: (id: number) => void = () => {}
    export let togglePinTrend: (id: number) => void = () => {}
    export let trend_store_key = ""

    $: resolvedTrendStoreKey =
        trend_store_key || `line:${label}:${cumulative ? "cumulative" : "daily"}`
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

{#if type === "total"}
    <LineGraph
        data={processed_data}
        {label}
        trend_store_key={`${resolvedTrendStoreKey}:total`}
        bind:trend_data
        bind:current_trend
        bind:removeTrend
        bind:togglePinTrend
    />
{:else}
    <Candlestick
        data={candlestick_data}
        bind:bins
        bind:binSize={$binSize}
        {limit}
        bind:trend_data
        bind:current_trend
        bind:removeTrend
        bind:togglePinTrend
        trend_store_key={`${resolvedTrendStoreKey}:candlestick`}
        bind:offset={$scroll}
    />
{/if}
