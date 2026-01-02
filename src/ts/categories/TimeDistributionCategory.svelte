<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import IntervalGraph from "../IntervalGraph.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import { i18n } from "../i18n"
    import { pieLast, pieSteps, revlogStats } from "../stores"
</script>

<GraphCategory hidden_title={i18n("time-distribution")} config_name="time">
    <GraphContainer>
        <h1>{i18n("time-distribution")}</h1>
        <IntervalGraph
            intervals={$revlogStats?.revlog_times ?? []}
            bind:last={$pieLast}
            bind:steps={$pieSteps}
            include_suspended_option={false}
            pieInfo={{
                countDescriptor: i18n("most-seconds"),
                spectrumFrom: "#fcba03",
                spectrumTo: "#543e00",
                fillerColour: "blue",
                legend_left: i18n("time-in-seconds"),
            }}
        ></IntervalGraph>
        <p>{i18n("time-distribution-help")}</p>
        <p>
            {i18n("suspended-cards-warning")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("time-totals")}</h1>
        <IntervalGraph
            intervals={($revlogStats?.revlog_times ?? []).map((i, a) => i * a)}
            bind:last={$pieLast}
            bind:steps={$pieSteps}
            include_suspended_option={false}
            pieInfo={{
                countDescriptor: i18n("most-seconds"),
                spectrumFrom: "#fcba03",
                spectrumTo: "#543e00",
                fillerColour: "blue",
                legend_left: i18n("seconds-per-card"),
                legend_right: i18n("total-seconds"),
                totalDescriptor: i18n("seconds"),
            }}
        ></IntervalGraph>
        <p>
            {i18n("time-totals-help")}
        </p>
    </GraphContainer>
</GraphCategory>
