<script lang="ts">
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import BarScrollable from "../BarScrollable.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import Warning from "../Warning.svelte"
    import { i18n, i18n_pattern } from "../i18n"
    import { barDateLabeler, type BarChart } from "../bar"
    import { binSize, scroll, searchLimit, revlogStats } from "../stores"
    import { today, easeBarChart } from "../revlogGraphs"
    import _ from "lodash"

    const bins = 30
    $: limit = -1 - $searchLimit
    $: truncated = $searchLimit !== 0

    function barLabel(i: number) {
        return (i - today).toString()
    }

    $: introduced_bar = {
        row_colours: ["#13e0eb", "#0c8b91"],
        row_labels: [i18n("introduced"), i18n("re-introduced")],
        data: Array.from($revlogStats?.introduced_day_count ?? [])
            .map((v, i) => {
                const introduced = v ?? 0
                const reintroduced = $revlogStats?.reintroduced_day_count[i] ?? 0
                return {
                    values: [introduced - reintroduced, reintroduced],
                    label: barLabel(i),
                }
            })
            .map((d, i) => d ?? { values: [0, 0], label: barLabel(i) }),
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }

    $: forgotten_bar = {
        row_colours: ["#330900"],
        row_labels: [i18n("forgotten")],
        data: Array.from($revlogStats?.day_forgotten ?? []).map((v, i) => ({
            values: [v ?? 0],
            label: barLabel(i),
        })),
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }

    let include_reintroduced = true
    let normalize_ease = false
    $: introduced_ease = include_reintroduced
        ? ($revlogStats?.day_initial_reintroduced_ease ?? [])
        : ($revlogStats?.day_initial_ease ?? [])

    let retention_trend = (values: number[]) => (_.sum(values) == 0 ? 0 : 1 - values[3])
</script>

<GraphCategory hidden_title={i18n("introduced")} config_name="introduced">
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("introduced")}</h1>
        <BarScrollable
            slot="graph"
            data={introduced_bar}
            {bins}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            {limit}
        />
        <p>
            {i18n("introduced-help")}
        </p>
        {#if truncated}
            <Warning>
                {i18n("introduced-truncated-warning")}
            </Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("forgotten")}</h1>
        <BarScrollable
            slot="graph"
            data={forgotten_bar}
            {bins}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            {limit}
        />
        <span>
            {i18n("forgotten-cards-not-yet-reintroduced", {
                number: ($revlogStats?.remaining_forgotten ?? 0).toLocaleString(),
            })}
        </span>

        <p>{i18n("forgotten-help")}</p>
        {#if truncated}
            <Warning>{i18n("forgotten-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("introductory-rating")}</h1>
        <BarScrollable
            slot="graph"
            data={easeBarChart(introduced_ease, today, normalize_ease, barDateLabeler)}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
            trend={normalize_ease}
            trend_by={(values: number[]) => (_.sum(values) == 0 ? 0 : 1 - values[3])}
            trend_info={{ pattern: i18n_pattern("retention-per-day"), percentage: true }}
            {limit}
        />
        <label>
            <input type="checkbox" bind:checked={include_reintroduced} />
            {i18n("include-re-introduced")}
        </label>
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            {i18n("as-ratio")}
        </label>
        <p>{i18n("introductory-rating-help")}</p>
    </RevlogGraphContainer>
</GraphCategory>
