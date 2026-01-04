<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import OldRetentionPie from "../OldRetentionPie.svelte"
    import CustomPie from "../CustomPie.svelte"
    import DayTimings from "../DayTimings.svelte"
    import SRHeatmap from "../SRHeatmap.svelte"
    import EaseFactor from "../EaseFactor.svelte"
    import NoGraph from "../NoGraph.svelte"
    import { i18n } from "../i18n"
    import { data, card_data, searchString } from "../stores"
</script>

<GraphCategory hidden_title={i18n("todays-retention")} config_name="misc">
    <GraphContainer>
        <h1>{i18n("todays-retention")}</h1>
        {#if false && $data?.trueRetention}
            <NoGraph>Placeholder</NoGraph>
        {:else}
            <OldRetentionPie></OldRetentionPie>
        {/if}
        <p>
            {i18n("todays-retention-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("custom-pie")}</h1>
        <CustomPie />
        <p>
            {i18n("custom-pie-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("review-speed-trend")}</h1>
        <DayTimings data={$data?.reviews} />
        <p>
            {i18n("review-speed-trend-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("sxr-heatmap")}</h1>
        <SRHeatmap cardData={$card_data} searchString={$searchString} />
        <p>
            {i18n("sxr-heatmap-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("ease-factors")}</h1>
        <EaseFactor></EaseFactor>
        <p>
            {i18n("ease-factors-help")}
        </p>
    </GraphContainer>
</GraphCategory>
