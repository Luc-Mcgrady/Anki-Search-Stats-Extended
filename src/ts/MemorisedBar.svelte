<script lang="ts">
    import { barDateLabeler, SetDateInfinite, type BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { DeltaIfy, type CandlestickGraph } from "./Candlestick"
    import Candlestick from "./Candlestick.svelte"
    import GraphTypeSelector from "./GraphTypeSelector.svelte"
    import LineGraph from "./LineGraph.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { today } from "./revlogGraphs"
    import { catchErrors } from "./search"
    import { card_data, revlogs, searchLimit } from "./stores"
    import type { TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"

    let show = false
    let choice = "trend"
    let data: number[] | undefined = undefined

    let bar_data: BarChart
    let candlestick_data: CandlestickGraph

    let trend_data: TrendLine

    export let offset = 0
    export let bins = 30
    export let binSize = 1

    $: if ($revlogs && $card_data && show)
        data = Array.from(
            catchErrors(() =>
                getMemorisedDays(
                    $revlogs,
                    $card_data,
                    SSEother.deck_configs,
                    SSEother.deck_config_ids
                )
            )
        )

    $: limit = -1 - $searchLimit

    $: truncated = $searchLimit !== 0
    $: learned = (trend_data?.slope || 0) > 0 ? "memorised" : "forgotten"
</script>

{#if data}
    <LineGraph {data} scroll={today} zoom={10}></LineGraph>
{:else if !show}
    <NoGraph faded={false}>
        {#if !truncated}
            <button class="big" on:click={() => (show = true)}>Show?</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>Increase date range</button>
            <button on:click={() => (show = true)}>Show?</button>
        {/if}
    </NoGraph>
{:else}
    <NoGraph>Loading</NoGraph>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }
</style>
