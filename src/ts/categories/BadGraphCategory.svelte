<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import BarScrollable from "../BarScrollable.svelte"
    import Bar from "../Bar.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import MatureFilterSelector from "../MatureFilterSelector.svelte"
    import MemorisedGraphContainer from "../MemorisedGraphContainer.svelte"
    import { i18n, i18n_bundle, i18n_pattern } from "../i18n"
    import { barStringLabeler, type BarChart } from "../bar"
    import { memorised_stats, searchLimit, revlogStats } from "../stores"
    import { easeBarChart, type RevlogBuckets } from "../revlogGraphs"
    import { browserSearchCids } from "../search"
    import _ from "lodash"
    import * as d3 from "d3"

    $: truncated = $searchLimit !== 0
    let normalize_ease = false
    let mature_filter: keyof RevlogBuckets = "not_learn"
    let interval_scroll = 1
    let interval_bin_size = 1
    let fatigue_bin_size = 10

    let retention_trend = (values: number[]) => (_.sum(values) == 0 ? 0 : 1 - values[3])

    let granularity_power = 1
    const domain: [number, number] = [0.05, 1]
    $: granularity = 20 * Math.pow(2, granularity_power - 1)
    $: leech_bins = d3
        .bin<[string, number], number>()
        .domain(domain)
        .thresholds(granularity)
        .value((a) => 1 - a[1])(Object.entries($memorised_stats?.leech_probabilities ?? []))

    let leech_detection_bar: BarChart
    $: leech_detection_bar = {
        row_colours: ["red"],
        row_labels: [i18n("cards")],
        data: leech_bins.map((bin) => ({
            label: `${((bin.x1 ?? 0) * 100)?.toPrecision(3)}%`,
            values: [bin.length],
            onClick: () => {
                browserSearchCids(bin.map((e) => e[0]))
            },
        })),
        tick_spacing: Math.floor(granularity / 5),
        barWidth: ((domain[1] - domain[0]) * 100) / leech_bins.length,
        columnLabeler: (v, w) => `${(parseFloat(v) - w!).toPrecision(3)}%-${v}`,
    }
</script>

<GraphCategory hidden_title={i18n("bad-graph")} config_name="bad">
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("leech-detector")}</h1>

        <h1>{i18n("leech-detector")}</h1>
        <label>
            {i18n("zoom")}
            <input type="range" min={1} max={6} bind:value={granularity_power} />
        </label>
        <Bar data={leech_detection_bar}></Bar>
        <p>
            {i18n("leech-detector-help")}
            <a href="https://forums.ankiweb.net/t/automated-leech-detection/56887">
                Forum discussion link
            </a>
        </p>
    </MemorisedGraphContainer>
    <GraphContainer>
        <h1>{i18n("naive-sibling-similarity")}</h1>
        <BarScrollable
            data={easeBarChart(
                $revlogStats?.sibling_time_ease ?? [],
                1,
                normalize_ease,
                barStringLabeler(i18n_bundle.getMessage("days-since-sibling-review")?.value!)
            )}
            bind:binSize={interval_bin_size}
            bind:offset={interval_scroll}
            average={normalize_ease}
            left_aligned
            trend={normalize_ease}
            trend_by={retention_trend}
            trend_info={{
                pattern: i18n_pattern("retention-per-day-since-last-sibling-review"),
                percentage: true,
            }}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>
        <p>
            {i18n("naive-sibling-similarity-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("rating-fatigue")}</h1>
        <BarScrollable
            data={easeBarChart(
                ($revlogStats?.fatigue_ease ?? {})[mature_filter] ?? [],
                0,
                normalize_ease,
                barStringLabeler(i18n_bundle.getMessage("x-previous-reviews")?.value!)
            )}
            average={normalize_ease}
            bind:binSize={fatigue_bin_size}
            left_aligned
            trend={normalize_ease}
            trend_by={retention_trend}
            trend_info={{
                pattern: i18n_pattern("retention-per-prior-review-that-day"),
                percentage: true,
            }}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>

        <MatureFilterSelector bind:group={mature_filter} />
        <p>
            {i18n("rating-fatigue-help")}
        </p>
    </GraphContainer>
    <MemorisedGraphContainer>
        <h1 slot="title">{i18n("fsrs-loss-by-fatigue")}</h1>

        <h1>{i18n("fsrs-loss-by-fatigue")}</h1>
        <BarScrollable
            bind:binSize={fatigue_bin_size}
            data={{
                row_colours: ["red"],
                row_labels: ["RMSE"],
                data: $memorised_stats!.fatigueRMSE[mature_filter].map((v, i) => ({
                    label: i.toString(),
                    values: v,
                })),
            }}
            left_aligned
            average
            loss
            trend
            trend_info={{ pattern: i18n_pattern("loss-per-prior-review-that-day") }}
        ></BarScrollable>
        <MatureFilterSelector bind:group={mature_filter}></MatureFilterSelector>
        <p>
            {i18n("fsrs-loss-by-fatigue-help")}
        </p>
    </MemorisedGraphContainer>
</GraphCategory>
