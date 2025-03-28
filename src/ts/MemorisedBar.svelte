<script lang="ts">
    import * as _ from "lodash"
    import GraphContainer from "./GraphContainer.svelte"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { binSize, memorised_stats } from "./stores"
    import type { TrendInfo, TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"
    import { matrix } from "./matrix"
    import { i18n, i18n_pattern } from "./i18n"
    import MemorisedCalculator from "./MemorisedCalculator.svelte"
    import type { LossBin } from "./MemorisedBar"

    let retrievabilityDays: number[] | undefined = undefined
    let bw_matrix: Record<string, (number | undefined)[]> | undefined = undefined
    let bw_matrix_counts: Record<string, LossBin[]> | undefined = undefined

    $: retrievabilityDays = Array.from($memorised_stats?.retrievabilityDays || [])

    $: bw_matrix = Object.fromEntries(
        Object.entries($memorised_stats?.bw_matrix || {}).map(([r_bin, row]) => {
            const new_row = row.map((bin) =>
                bin.count > 50 ? (bin.real - bin.predicted) / bin.count : undefined
            )
            new_row.length = 10
            return [r_bin, new_row]
        })
    )

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

{#if $memorised_stats}
    <LineOrCandlestick data={retrievabilityDays} label={i18n("cards")} bind:trend_data />
    <TrendValue info={trend_info} trend={trend_data} n={$binSize} />
{:else}
    <MemorisedCalculator />
{/if}

{#if bw_matrix}
    <details>
        <summary>{i18n("b-w-matrix")}</summary>
        <GraphContainer>
            <svg bind:this={svg}></svg>
        </GraphContainer>
    </details>
{/if}
