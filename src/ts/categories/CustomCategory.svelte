<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import OldRetentionPie from "../OldRetentionPie.svelte"
    import CustomPie from "../CustomPie.svelte"
    import CustomBar from "../CustomBar.svelte"
    import NoGraph from "../NoGraph.svelte"
    import { i18n } from "../i18n"
    import { data } from "../stores"
</script>

<GraphCategory hidden_title={i18n("custom-bar")} config_name="custom">
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
        <h1>{i18n("custom-bar")}</h1>
        <CustomBar />
        <p>
            {i18n("custom-bar-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("custom-pie")}</h1>
        <CustomPie />
        <p>
            {i18n("custom-pie-help")}
        </p>
    </GraphContainer>
</GraphCategory>
