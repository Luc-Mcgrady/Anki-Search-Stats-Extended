<script lang="ts">
    import ForgettingCurve from "../ForgettingCurve.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import { i18n } from "../i18n"
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import { revlogStats, searchLimit } from "../stores"
    import Warning from "../Warning.svelte"

    // TODO: This should probably be a derrived store
    $: truncated = $searchLimit !== 0
</script>

<GraphCategory hidden_title={i18n("forgetting-curve")} config_name="forgettingCurve">
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("forgetting-curve")}</h1>
        <ForgettingCurve data={$revlogStats?.forgetting_samples ?? []} />
        <p>{i18n("forgetting-curve-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("first-short-term-forgetting-curve")}</h1>
        <ForgettingCurve
            data={$revlogStats?.forgetting_samples_short ?? []}
            xLabel={i18n("forgetting-curve-x-axis-minutes")}
            isShortTerm={true}
            formatInterval={(delta) =>
                i18n("forgetting-curve-tooltip-interval-minutes", {
                    minutes: delta.toFixed(2),
                })}
        />
        <p>{i18n("first-short-term-forgetting-curve-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
</GraphCategory>
