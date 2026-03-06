<script lang="ts">
    import * as _ from "lodash"
    import GraphContainer from "./GraphContainer.svelte"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { binSize, memorised_stats } from "./stores"
    import { emptyTrendSelectionState, type TrendInfo, type TrendSelectionState } from "./trend"
    import TrendValue from "./TrendValue.svelte"
    import { matrix } from "./matrix"
    import { i18n, i18n_pattern } from "./i18n"
    import { TREND_PERSISTENCE_KEYS } from "./trendPersistenceKeys"
    import MemorisedCalculator from "./MemorisedCalculator.svelte"

    export let burden: number[] = []

    let retrievabilityDays: number[] | undefined = undefined
    let stable_retrievability_days: number[] | undefined = undefined
    let bw_matrix: Record<string, (number | undefined)[]> | undefined = undefined
    let cardsByBurdenByDays: number[] = []

    enum MemorisedType {
        RETRIEVABILITY,
        NOTES,
        STABLE_RETRIEVABILITY,
        AVERAGE,
        CARDS_BY_BURDEN,
    }

    let memorised_type: MemorisedType = MemorisedType.RETRIEVABILITY

    $: retrievabilityDays = Array.from($memorised_stats?.retrievabilityDays || [])
    $: stable_retrievability_days = Array.from($memorised_stats?.stable_retrievability_days || [])

    $: cardsByBurdenByDays = retrievabilityDays.map(
        (retrievability, i) => (retrievability ?? 0) / (burden[i] ?? 1)
    )

    $: bw_matrix = Object.fromEntries(
        Object.entries($memorised_stats?.bw_matrix || {}).map(([r_bin, row]) => {
            const new_row = row.map((bin) =>
                bin.count > 50 ? (bin.real - bin.predicted) / bin.count : undefined
            )
            new_row.length = 10
            return [r_bin, new_row]
        })
    )

    let trend_info: TrendInfo
    $: trend_info = {
        pattern: i18n_pattern("remembered-per-day"),
        positivePattern: i18n_pattern("remembered-per-day"),
        negativePattern: i18n_pattern("forgotten-per-day"),
        absolute: true,
    }

    let trendSelection: TrendSelectionState = emptyTrendSelectionState()
    let svg: SVGElement | undefined = undefined

    function hoverTooltip(x: number, y: number) {
        const data = $memorised_stats!.bw_matrix[x][y]
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

    let average_r = <number[]>[]
    $: if ($memorised_stats?.totalCards) {
        average_r = _.zip(retrievabilityDays, $memorised_stats.totalCards).map(([r, c]) => {
            // console.log({ r, c })
            return (r ?? 0) / (c ?? 1)
        })
    }

    let memorised_data: number[] = []
    let memorised_label = i18n("cards")
    $: {
        if (memorised_type === MemorisedType.STABLE_RETRIEVABILITY) {
            memorised_data = stable_retrievability_days ?? []
            memorised_label = i18n("cards-and-stability")
        } else if (memorised_type == MemorisedType.NOTES) {
            memorised_data = Array.from($memorised_stats?.noteRetrievabilityDays || [])
            memorised_label = i18n("notes")
        } else if (memorised_type == MemorisedType.CARDS_BY_BURDEN) {
            memorised_data = cardsByBurdenByDays
            memorised_label = i18n("cards-by-burden")
        } else if (memorised_type == MemorisedType.AVERAGE) {
            memorised_data = average_r
            memorised_label = i18n("retrievability")
        } else {
            memorised_data = retrievabilityDays ?? []
            memorised_label = i18n("cards")
        }
    }
</script>

{#if $memorised_stats}
    <LineOrCandlestick
        data={memorised_data}
        label={memorised_label}
        bind:trendSelection
        trendPersistenceKey={TREND_PERSISTENCE_KEYS.memorised.shared}
    />
    <TrendValue
        info={trend_info}
        trend={trendSelection.previewTrend}
        trends={trendSelection.visibleTrends}
        n={$binSize}
        onRemoveTrend={trendSelection.removeTrend}
        onTogglePinTrend={trendSelection.togglePinTrend}
    />
    <div>
        <label>
            <input type="radio" value={MemorisedType.RETRIEVABILITY} bind:group={memorised_type} />
            {i18n("cards")}
        </label>
        <label>
            <input type="radio" value={MemorisedType.NOTES} bind:group={memorised_type} />
            {i18n("notes")}
        </label>
        <label>
            <input type="radio" value={MemorisedType.CARDS_BY_BURDEN} bind:group={memorised_type} />
            {i18n("cards-by-burden")}
        </label>
        <label>
            <input type="radio" value={MemorisedType.AVERAGE} bind:group={memorised_type} />
            {i18n("average-retrievability")}
        </label>
        <label>
            <input
                type="radio"
                value={MemorisedType.STABLE_RETRIEVABILITY}
                bind:group={memorised_type}
            />
            {i18n("retrievability-and-stability")}
        </label>
    </div>
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
