<script lang="ts">
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import IntervalGraph from "../IntervalGraph.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import Warning from "../Warning.svelte"
    import LineOrCandlestick from "../LineOrCandlestick.svelte"
    import TrendValue from "../TrendValue.svelte"
    import { i18n, i18n_pattern } from "../i18n"
    import { CANDLESTICK_GREEN, CANDLESTICK_RED } from "../Candlestick"
    import type { TrendLine } from "../trend"
    import { binSize, searchLimit, revlogStats } from "../stores"
    import * as d3 from "d3"

    $: truncated = $searchLimit !== 0

    let introduced_load_cumulative_mode = false
    let burden_trend: TrendLine
    let introduced_load_trend: TrendLine

    $: learn_repetitions = ($revlogStats?.learn_steps_per_card ?? []).reduce(
        (learn_repetitions, count) => {
            learn_repetitions[count] = (learn_repetitions[count] ?? 0) + 1
            return learn_repetitions
        },
        {} as Record<number, number>
    )
</script>

<GraphCategory hidden_title={i18n("load-trend")} config_name="load">
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("load-trend")}</h1>
        <LineOrCandlestick
            slot="graph"
            data={$revlogStats?.burden ?? []}
            label={i18n("load")}
            bind:trend_data={burden_trend}
            up_colour={CANDLESTICK_RED}
            down_colour={CANDLESTICK_GREEN}
        />
        <p>
            {i18n("load-trend-help")}
        </p>
        <TrendValue
            trend={burden_trend}
            n={$binSize}
            info={{ pattern: i18n_pattern("burden-per-day") }}
        />
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("introduced-load")}</h1>
        <LineOrCandlestick
            slot="graph"
            data={$revlogStats?.introduced_load_by_day ?? []}
            label={introduced_load_cumulative_mode ? i18n("cumulative-load") : i18n("load")}
            bind:trend_data={introduced_load_trend}
            cumulative={introduced_load_cumulative_mode}
            filter_zeros={false}
        />
        <label>
            <input type="checkbox" bind:checked={introduced_load_cumulative_mode} />
            {i18n("cumulative-mode")}
        </label>
        <p>
            {i18n("introduced-load-help")}
        </p>
        <TrendValue
            trend={introduced_load_trend}
            n={$binSize}
            info={{ pattern: i18n_pattern("introduced-load-per-day") }}
        />
        {#if truncated}
            <Warning>
                {i18n("introduced-load-truncated-warning")}
            </Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("learn-reviews-per-card")}</h1>
        <IntervalGraph
            slot="graph"
            intervals={learn_repetitions}
            pieInfo={{
                countDescriptor: i18n("highest-repetition-count"),
                legend_left: i18n("repetition-count"),
                legend_right: i18n("card-count"),
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <span>
            {i18n("mean")} = {d3.mean($revlogStats?.learn_steps_per_card ?? [])?.toFixed(2)}
        </span>
        <span>{i18n("median")} = {d3.quantile($revlogStats?.learn_steps_per_card ?? [], 0.5)}</span>
        <p>{i18n("learn-reviews-per-card-help")}</p>
    </RevlogGraphContainer>
</GraphCategory>
