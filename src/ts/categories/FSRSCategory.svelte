<script lang="ts">
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import BarScrollable from "../BarScrollable.svelte"
    import Bar from "../Bar.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import Warning from "../Warning.svelte"
    import MemorisedBar from "../MemorisedBar.svelte"
    import MemorisedGraphContainer from "../MemorisedGraphContainer.svelte"
    import FsrsCalibration from "../FSRSCalibration.svelte"
    import ForgettingCurve from "../ForgettingCurve.svelte"
    import TimeMachineScroll from "../TimeMachineScroll.svelte"
    import { i18n, i18n_bundle, i18n_pattern } from "../i18n"
    import { barDateLabeler, barStringLabeler, barHourLabeler, type BarChart } from "../bar"
    import { memorised_stats, scroll, searchLimit, binSize, revlogStats } from "../stores"
    import { today, day_ms, no_rollover_today } from "../revlogGraphs"
    import { YOUNG_COLOUR, MATURE_COLOUR } from "../graph"
    import type { PieDatum } from "../pie"
    import _ from "lodash"
    import * as d3 from "d3"

    $: truncated = $searchLimit !== 0
    $: realScroll = -Math.abs($scroll)

    enum Average {
        MEDIAN,
        MEAN,
    }

    let average_type = Average.MEDIAN
    let interval_bin_size = 1
    let granularity = 20

    function barLabel(i: number) {
        return (i - today).toString()
    }

    let stability_time_machine_bar: BarChart
    $: stability_time_machine_bar = {
        row_colours: ["#70AFD6"],
        row_labels: [i18n("cards")],
        data: Array.from($memorised_stats?.stability_bins_days[today + realScroll] ?? []).map(
            (v, i) => ({
                values: [v ?? 0],
                label: i.toString(),
            })
        ),
        tick_spacing: 5,
        columnLabeler: barStringLabeler(i18n_bundle.getMessage("stability-of")?.value!),
    }

    $: difficulty_binner = d3
        .bin<[number, number], number>()
        .thresholds(granularity)
        .domain([0, 100])
        .value((a) => a[0])

    $: difficulty_bins = difficulty_binner([
        ...($memorised_stats?.difficulty_days[today + realScroll] ?? []).entries(),
    ])

    let difficulty_time_machine_bar: BarChart
    $: difficulty_time_machine_bar = {
        row_colours: ["red"],
        row_labels: [i18n("card-count")],
        data: Array.from(difficulty_bins).map((v, i) => ({
            values: [_.sumBy(v, (v) => v[1])],
            label: `${v?.[0]?.[0] / 10}`,
        })),
        tick_spacing: difficulty_bins.length / 5,
        barWidth: 10 / difficulty_bins.length + 1,
        columnLabeler: barStringLabeler(i18n_pattern("difficulty-of")),
    }

    function minIndex(vals: Record<number, any>) {
        return _.min(Object.keys(vals).map((k) => parseInt(k))) ?? 0
    }

    $: review_leftmost = minIndex($revlogStats?.intervals ?? {}) - today
    $: time_machine_min = review_leftmost
</script>

<GraphCategory hidden_title="FSRS" config_name="fsrs">
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("memorised")}</h1>
        <MemorisedBar burden={$revlogStats?.burden ?? []} />
        {#if truncated}
            <Warning>{i18n("memorised-truncated-warning")}</Warning>
        {/if}
        <p>
            {i18n("memorised-help")}
        </p>
    </MemorisedGraphContainer>
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("fsrs-calibration")}</h1>
        <FsrsCalibration data={$memorised_stats!.calibration} />
        <p>
            {i18n("fsrs-calibration-help")}
        </p>
    </MemorisedGraphContainer>
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
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("forgetting-curve")}</h1>
        <ForgettingCurve data={$revlogStats?.forgetting_samples ?? []} />
        <p>{i18n("forgetting-curve-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("stability-time-machine")}</h1>
        <BarScrollable data={stability_time_machine_bar} left_aligned />
        <TimeMachineScroll min={time_machine_min} />
        <p>{i18n("stability-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </MemorisedGraphContainer>
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("difficulty-time-machine")}</h1>
        <label class="scroll">
            {i18n("zoom")}
            <input type="range" bind:value={granularity} min={1} max={100} />
        </label>
        <Bar data={difficulty_time_machine_bar} />
        <label class="scroll">
            <span>
                {new Date(Date.now() + $scroll * day_ms).toLocaleDateString()}:
            </span>
            <TimeMachineScroll min={time_machine_min} />
        </label>
        <p>{i18n("difficulty-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </MemorisedGraphContainer>
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("average-stability-over-time")}</h1>
        <BarScrollable
            bind:binSize={interval_bin_size}
            data={{
                row_colours: [YOUNG_COLOUR, MATURE_COLOUR],
                row_labels: [i18n("young"), i18n("mature")],
                data: (average_type == Average.MEAN
                    ? $memorised_stats!.day_means
                    : $memorised_stats!.day_medians
                ).map((day, i) => {
                    const young = _.sum($memorised_stats!.stability_bins_days[i]?.slice(0, 21))
                    const total = _.sum($memorised_stats!.stability_bins_days[i])
                    const young_ratio = young / total
                    return {
                        values: [day * young_ratio, day * (1 - young_ratio)],
                        label: barLabel(i),
                    }
                }),
                columnLabeler: barDateLabeler,
            }}
            average
            trend
            trend_info={{ pattern: i18n_pattern("stability-per-day") }}
        />
        <p>
            {i18n("average-stability-over-time-help")}
        </p>
        <div>
            <label>
                <input type="radio" value={Average.MEDIAN} bind:group={average_type} />
                {i18n("median")}
            </label>
            <label>
                <input type="radio" value={Average.MEAN} bind:group={average_type} />
                {i18n("mean")}
            </label>
        </div>
    </MemorisedGraphContainer>
</GraphCategory>

<style lang="scss">
    label.scroll {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }
</style>
