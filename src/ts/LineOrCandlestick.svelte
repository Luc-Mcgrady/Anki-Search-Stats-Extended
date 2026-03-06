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
    import { emptyTrendSelectionState, type DrawnTrend, type TrendLine, type TrendSelectionState } from "./trend"

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

    let visibleTrends: DrawnTrend[] = []
    let previewTrend: TrendLine = undefined
    let removeTrend: (id: number) => void = () => {}
    let togglePinTrend: (id: number) => void = () => {}
    export let trendSelection: TrendSelectionState = emptyTrendSelectionState()
    export let trendPersistenceKey: string

    $: trendSelection = {
        visibleTrends,
        previewTrend,
        removeTrend,
        togglePinTrend,
    }
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
        trendPersistenceKey={`${trendPersistenceKey}:total`}
        bind:trend_data={visibleTrends}
        bind:current_trend={previewTrend}
        bind:removeTrend
        bind:togglePinTrend
    />
{:else}
    <Candlestick
        data={candlestick_data}
        bind:bins
        bind:binSize={$binSize}
        {limit}
        bind:trend_data={visibleTrends}
        bind:current_trend={previewTrend}
        bind:removeTrend
        bind:togglePinTrend
        trendPersistenceKey={`${trendPersistenceKey}:candlestick`}
        bind:offset={$scroll}
    />
{/if}
