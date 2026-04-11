<script lang="ts">
    import type { BarChart } from "../bar"
    import BarScrollable from "../BarScrollable.svelte"
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import IntervalGraph from "../IntervalGraph.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import { i18n, i18n_pattern } from "../i18n"
    import { pieLast, pieSteps, revlogStats } from "../stores"

    enum AverageType {
        MEAN,
        MEDIAN,
    }

    let averageType = AverageType.MEAN
    let retrievabilityBinSize = 2
    let stabilityBinSize = 2

    function retrievabilityBucketLabeler(label: string, width = 1) {
        const raw = Number(label)
        const start = raw < 0 ? 99 + raw : raw
        const end = Math.min(100, start + width)
        return i18n("retrievability-of", { value: `${start}-${end}%` })
    }

    function stabilityBucketLabeler(label: string, width = 1) {
        const start = Number(label)
        const end = width > 1 ? `${start}-${start + width - 1}` : label
        return i18n("stability-of", { value: end })
    }

    $: retrievabilitySeries =
        averageType === AverageType.MEAN
            ? ($revlogStats?.time_by_retrievability_mean ?? [])
            : ($revlogStats?.time_by_retrievability_median ?? [])

    let retrievabilityTimeBar: BarChart
    $: retrievabilityTimeBar = {
        row_colours: ["#fcba03"],
        row_labels: [i18n("seconds")],
        data: Array.from(retrievabilitySeries).map((value, bucket) => ({
            values: [value ?? 0],
            label: bucket.toString(),
        })),
        tick_spacing: 10,
        columnLabeler: retrievabilityBucketLabeler,
    }

    $: stabilitySeries =
        averageType === AverageType.MEAN
            ? ($revlogStats?.time_by_stability_mean ?? [])
            : ($revlogStats?.time_by_stability_median ?? [])

    let stabilityTimeBar: BarChart
    $: stabilityTimeBar = {
        row_colours: ["#fcba03"],
        row_labels: [i18n("seconds")],
        data: Array.from(stabilitySeries).map((value, bucket) => ({
            values: [value ?? 0],
            label: bucket.toString(),
        })),
        tick_spacing: 10,
        columnLabeler: stabilityBucketLabeler,
    }
</script>

<GraphCategory hidden_title={i18n("time-distribution")} config_name="time">
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("time-distribution")}</h1>
        <IntervalGraph
            slot="graph"
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
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("time-totals")}</h1>
        <IntervalGraph
            slot="graph"
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
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("time-distribution-by-retrievability")}</h1>
        <BarScrollable
            slot="graph"
            data={retrievabilityTimeBar}
            average
            bind:binSize={retrievabilityBinSize}
            trend
            trend_info={{ pattern: i18n_pattern("average-second-per-retrievability-percent") }}
        />
        <div class="toggle">
            <label>
                <input type="radio" value={AverageType.MEAN} bind:group={averageType} />
                {i18n("mean")}
            </label>
            <label>
                <input type="radio" value={AverageType.MEDIAN} bind:group={averageType} />
                {i18n("median")}
            </label>
        </div>
        <p>{i18n("time-distribution-by-retrievability-help")}</p>
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("time-distribution-by-stability")}</h1>
        <BarScrollable
            slot="graph"
            data={stabilityTimeBar}
            average
            left_aligned
            bind:binSize={stabilityBinSize}
            trend
            trend_info={{ pattern: i18n_pattern("average-second-per-stability-day") }}
        />
        <div class="toggle">
            <label>
                <input type="radio" value={AverageType.MEAN} bind:group={averageType} />
                {i18n("mean")}
            </label>
            <label>
                <input type="radio" value={AverageType.MEDIAN} bind:group={averageType} />
                {i18n("median")}
            </label>
        </div>
        <p>{i18n("time-distribution-by-stability-help")}</p>
    </RevlogGraphContainer>
</GraphCategory>

<style>
    div.toggle {
        display: flex;
        gap: 1em;
        margin-top: 0.5em;
    }
</style>
