<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import BarScrollable from "../BarScrollable.svelte"
    import DueBar from "../DueBar.svelte"
    import IntraDayDueBar from "../IntraDayDueBar.svelte"
    import NoGraph from "../NoGraph.svelte"
    import { i18n } from "../i18n"
    import { card_data, cardDataStats, data } from "../stores"
    import { EASE_COLOURS, formatRetention } from "../revlogGraphs"
    import { barDateLabeler, type BarDatum } from "../bar"
    import { totalCalc } from "../barHelpers"
    import _ from "lodash"

    let normalize = true
    $: target_R_days = $cardDataStats.target_R_days
    $: target_R_day_values = _.zip(target_R_days, $cardDataStats.target_R_day_totals).map(
        ([R, total], i) => [R ?? 0, (total ?? 0) - (R ?? 0)]
    )
    $: target_R_days_bar = {
        row_colours: [EASE_COLOURS[1], EASE_COLOURS[3]], // The EASE_COLOURS are in reverse order
        row_labels: [i18n("pass"), i18n("fail")],
        reverse_legend: true,
        data: target_R_day_values.map((values, label) => {
            const sum = _.sum(values)
            return {
                values: normalize && sum !== 0 ? values.map((a) => a / sum) : values,
                label: label.toString(),
            }
        }),
        extraStats: normalize
            ? (bar: BarDatum) => [bar.values[0] ? formatRetention(bar.values[0]) : "No data"]
            : totalCalc,
        columnLabeler: barDateLabeler,
        column_counts: !normalize,
        precision: normalize ? 2 : 0,
        inverseFade: true,
    }
</script>

<GraphCategory hidden_title={i18n("future-due-types")} config_name="due">
    <GraphContainer>
        <h1>{i18n("future-due-types")}</h1>
        {#if $card_data}
            <DueBar />
        {:else}
            <NoGraph />
        {/if}
        <p>
            {i18n("future-due-types-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("future-due-retention")}</h1>
        {#if _.sum(target_R_days) > 0}
            <BarScrollable data={target_R_days_bar} left_aligned average={normalize}
            ></BarScrollable>
        {:else}
            <NoGraph>
                {i18n("no-data")}
                <small>{i18n("fsrs-only")}</small>
            </NoGraph>
        {/if}
        <label>
            <input type="checkbox" bind:checked={normalize} />
            {i18n("as-ratio")}
        </label>
        <p>
            {i18n("future-due-retention-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("intra-day-due")}</h1>
        <IntraDayDueBar></IntraDayDueBar>
        <p>
            {i18n("intra-day-due-help")}
        </p>
    </GraphContainer>
</GraphCategory>
