<script lang="ts">
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import BarScrollable from "../BarScrollable.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import MatureFilterSelector from "../MatureFilterSelector.svelte"
    import { i18n, i18n_bundle, i18n_pattern } from "../i18n"
    import { barDateLabeler, barStringLabeler } from "../bar"
    import { binSize, scroll, searchLimit, revlogStats } from "../stores"
    import { today, easeBarChart, type RevlogBuckets } from "../revlogGraphs"
    import _ from "lodash"

    $: limit = -1 - $searchLimit
    let normalize_ease = false
    let mature_filter: keyof RevlogBuckets = "not_learn"
    let interval_scroll = 1
    let interval_bin_size = 1

    let retention_trend = (values: number[]) => (_.sum(values) == 0 ? 0 : 1 - values[3])
</script>

<GraphCategory hidden_title={i18n("ratings")} config_name="rating">
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("ratings")}</h1>
        <BarScrollable
            slot="graph"
            data={easeBarChart(
                ($revlogStats?.day_ease ?? {})[mature_filter] ?? [],
                today,
                normalize_ease,
                barDateLabeler
            )}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
            trend={normalize_ease}
            trend_by={retention_trend}
            trend_info={{ pattern: i18n_pattern("retention-per-day"), percentage: true }}
            {limit}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>
        <MatureFilterSelector bind:group={mature_filter} />
        <p>
            {i18n("ratings-help")}
        </p>
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("ratings-by-duration")}</h1>
        <BarScrollable
            slot="graph"
            data={easeBarChart(
                ($revlogStats?.day_ease_time ?? {})[mature_filter] ?? [],
                today,
                normalize_ease,
                barDateLabeler
            )}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
            trend={normalize_ease}
            trend_by={retention_trend}
            trend_info={{ pattern: i18n_pattern("retention-per-day"), percentage: true }}
            {limit}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>
        <MatureFilterSelector bind:group={mature_filter} />
        <p>
            {i18n("ratings-by-duration-help")}
        </p>
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("interval-ratings")}</h1>
        <BarScrollable
            slot="graph"
            data={easeBarChart(
                $revlogStats?.interval_ease ?? [],
                1,
                normalize_ease,
                barStringLabeler(i18n_bundle.getMessage("interval-of")?.value!)
            )}
            bind:binSize={interval_bin_size}
            bind:offset={interval_scroll}
            average={normalize_ease}
            left_aligned
            trend={normalize_ease}
            trend_by={retention_trend}
            trend_info={{
                pattern: i18n_pattern("retention-per-day-greater-interval"),
                percentage: true,
            }}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>
        <p>{i18n("interval-ratings-help")}</p>
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("time-ratings")}</h1>
        <BarScrollable
            slot="graph"
            data={easeBarChart(
                ($revlogStats?.time_ease_seconds ?? {})[mature_filter] ?? [],
                0,
                normalize_ease,
                barStringLabeler(i18n_bundle.getMessage("x-seconds")?.value!)
            )}
            average={normalize_ease}
            left_aligned
            trend={normalize_ease}
            trend_by={retention_trend}
            trend_info={{ pattern: i18n_pattern("retention-per-second-spent"), percentage: true }}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>

        <MatureFilterSelector bind:group={mature_filter} />
        <p>
            {i18n("time-ratings-help")}
        </p>
    </RevlogGraphContainer>
</GraphCategory>
