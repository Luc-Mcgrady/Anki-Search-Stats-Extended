<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import IntervalGraph from "../IntervalGraph.svelte"
    import BurdenPie from "../BurdenPie.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import { i18n } from "../i18n"
    import { data, not_suspended_data, include_suspended } from "../stores"

    let interval_last = 21
    let interval_steps = 7

    $: intervals =
        ($include_suspended
            ? $data?.intervals!.intervals
            : $not_suspended_data?.intervals!.intervals) || {}
</script>

<GraphCategory hidden_title={i18n("interval-distribution")} config_name="interval">
    <GraphContainer>
        <h1>{i18n("interval-distribution")}</h1>
        <IntervalGraph {intervals} bind:last={interval_last} bind:steps={interval_steps} />
        <p>
            {i18n("interval-distribution-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("interval-load")}</h1>
        <BurdenPie {intervals} bind:last={interval_last} bind:steps={interval_steps} />
        <p>
            {i18n("interval-load-help")}
        </p>
    </GraphContainer>
</GraphCategory>
