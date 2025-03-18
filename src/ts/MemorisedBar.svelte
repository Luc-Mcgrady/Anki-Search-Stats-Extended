<script lang="ts">
    import * as _ from "lodash"
    import { SetDateInfinite } from "./bar"
    import GraphContainer from "./GraphContainer.svelte"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { getMemorisedDays, type LossBin } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { catchErrors } from "./search"
    import {
        binSize,
        card_data,
        difficulty_days,
        fatigueLoss,
        revlogs,
        searchLimit,
        stability_days,
    } from "./stores"
    import type { TrendInfo, TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"
    import { matrix } from "./matrix"
    import { i18n, i18n_pattern } from "./i18n"

    let show = false
    let retrievabilityDays: number[] | undefined = undefined
    let bw_matrix: Record<string, (number | undefined)[]> | undefined = undefined
    let bw_matrix_counts: Record<string, LossBin[]> | undefined = undefined

    $: if ($revlogs && $card_data && show) {
        let data = catchErrors(() =>
            getMemorisedDays($revlogs, $card_data, SSEother.deck_configs, SSEother.deck_config_ids)
        )

        retrievabilityDays = Array.from(data.retrievabilityDays)
        $fatigueLoss = data.fatigueRMSE
        $stability_days = data.stability_days
        $difficulty_days = data.difficulty_days
        bw_matrix_counts = data.bw_matrix

        bw_matrix = Object.fromEntries(
            Object.entries(bw_matrix_counts).map(([r_bin, row]) => {
                const new_row = row.map((bin) =>
                    bin.count > 50 ? (bin.real - bin.predicted) / bin.count : undefined
                )
                new_row.length = 10
                return [r_bin, new_row]
            })
        )
    }

    $: truncated = $searchLimit !== 0
    $: pattern =
        (trend_data?.slope || 0) > 0
            ? i18n_pattern("remembered-per-day")
            : i18n_pattern("forgotten-per-day")

    let trend_info: TrendInfo
    $: trend_info = {
        pattern,
        absolute: true,
    }

    let trend_data: TrendLine
    let svg: SVGElement | undefined = undefined

    function hoverTooltip(x: number, y: number) {
        const data = bw_matrix_counts![x][y]
        const value = ((100 * (data.predicted - data.real)) / data.count).toFixed(1)
        console.log(data)
        return [
            `${i18n("predicted")}: ${data.predicted.toFixed(2)}`,
            `${i18n("actual")}: ${data.real.toFixed(0)}`,
            `${i18n("total")}: ${data.count.toFixed(0)}`,
            `(${data.predicted.toFixed(2)}-${data.real.toFixed(0)})/${data.count.toFixed(0)}=${value}%`,
        ]
    }

    $: if (svg && bw_matrix) {
        matrix({ grid: bw_matrix, hoverTooltip }, svg)
    }
</script>

{#if retrievabilityDays}
    <LineOrCandlestick data={retrievabilityDays} label={i18n("cards")} bind:trend_data />
    <TrendValue info={trend_info} trend={trend_data} n={$binSize} />
{:else if !show}
    <NoGraph faded={false}>
        {#if !truncated}
            <button class="big" on:click={() => (show = true)}>{i18n("show-question")}</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>{i18n("increase-date-range")}</button>
            <button on:click={() => (show = true)}>{i18n("show-question")}</button>
        {/if}
    </NoGraph>
{:else}
    <NoGraph>{i18n("loading")}</NoGraph>
{/if}

{#if bw_matrix}
    <details>
        <summary>B-W matrix</summary>
        <GraphContainer>
            <svg bind:this={svg}></svg>
        </GraphContainer>
    </details>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }
</style>
