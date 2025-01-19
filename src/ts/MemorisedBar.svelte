<script lang="ts">
    import { SetDateInfinite, type BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { catchErrors } from "./search"
    import { binSize, card_data, revlogs, searchLimit } from "./stores"
    import type { TrendInfo, TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"

    let show = false
    let retrievabilityDays: number[] | undefined = undefined
    let fatigueRMSE: number[][] | undefined = undefined

    $: if ($revlogs && $card_data && show) {
        let data = catchErrors(() =>
            getMemorisedDays($revlogs, $card_data, SSEother.deck_configs, SSEother.deck_config_ids)
        )

        retrievabilityDays = Array.from(data.retrievabilityDays)
        fatigueRMSE = Array.from(data.fatigueRMSE)
    }

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

    let loss_bar: BarChart
    $: if (fatigueRMSE)
        loss_bar = {
            row_colours: ["red"],
            row_labels: ["RMSE"],
            data: fatigueRMSE.map((v, i) => ({
                label: i.toString(),
                values: v,
            })),
        }

    let trend_data: TrendLine
</script>

{#if retrievabilityDays}
    <LineOrCandlestick data={retrievabilityDays} label="Cards" bind:trend_data />
    <TrendValue info={trend_info} trend={trend_data} n={$binSize} />
    <BarScrollable data={loss_bar} left_aligned average loss></BarScrollable>
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
