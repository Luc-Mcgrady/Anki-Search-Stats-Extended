<script lang="ts">
    import { SetDateInfinite } from "./bar"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { catchErrors } from "./search"
    import { binSize, card_data, revlogs, searchLimit } from "./stores"
    import type { TrendInfo, TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"
    import type { LineGraphData } from "./LineGraph"

    let show = false
    let data: number[][] | undefined = undefined

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

    $: truncated = $searchLimit !== 0
    $: label = (trend_data?.slope || 0) > 0 ? "memorised" : "forgotten"

    let trend_info: TrendInfo
    $: trend_info = {
        y: label,
        y_s: label,
        x: "day",
        x_s: "days",
        absolute: true,
    }

    let line_graph: LineGraphData
    $: if (data)
        line_graph = {
            values: data,
            labels: ["cards", "notes"],
            colours: ["steelblue", "orange"],
        }

    let trend_data: TrendLine
</script>

{#if line_graph}
    <LineOrCandlestick data={line_graph} label="Cards" bind:trend_data />
    <TrendValue info={trend_info} trend={trend_data} n={$binSize} />
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
