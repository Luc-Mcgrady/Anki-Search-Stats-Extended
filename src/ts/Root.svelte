<script lang="ts">
    import DueBar from "./DueBar.svelte"
    import BurdenPie from "./BurdenPie.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import OldRetentionPie from "./OldRetentionPie.svelte"
    import CustomPie from "./CustomPie.svelte"
    import IntraDayDueBar from "./IntraDayDueBar.svelte"
    import {
        data,
        learn_data,
        mature_data,
        not_suspended_data,
        relearn_data,
        searchString,
        card_data,
        include_suspended,
        revlogs,
        tooltip,
        showRevlogStats,
        tooltipShown,
        target_R_days,
    } from "./stores"
    import CardDataPies from "./CardDataPies.svelte"
    import _ from "lodash"
    import RevlogGraphs from "./RevlogGraphs.svelte"
    import { defaultGraphBounds } from "./graph"
    import NoGraph from "./NoGraph.svelte"
    import DayTimings from "./DayTimings.svelte"
    import GraphCategory from "./GraphCategory.svelte"
    import Warning from "./Warning.svelte"
    import BarScrollable from "./BarScrollable.svelte"
    import { EASE_COLOURS, formatRetention } from "./revlogGraphs"
    import { barDateLabeler, type BarDatum } from "./bar"
    import { totalCalc } from "./barHelpers"
    import SRHeatmap from "./SRHeatmap.svelte"
    import { i18n } from "./i18n"

    const { width, height } = defaultGraphBounds()

    let interval_last = 21
    let interval_steps = 7

    $: intervals =
        ($include_suspended
            ? $data?.intervals!.intervals
            : $not_suspended_data?.intervals!.intervals) || {}

    let normalize = true
    $: target_R_day_values = $target_R_days.map((v, i) => [
        v,
        ($data?.futureDue?.futureDue[i] || 0) - ($learn_data?.futureDue?.futureDue[i] || 0) - v,
    ])
    $: target_R_days_bar = {
        row_colours: [EASE_COLOURS[1], EASE_COLOURS[3]], // The EASE_COLOURS are in reverse order
        row_labels: [i18n("pass"), i18n("fail")],
        reverse_legend: true,
        data: target_R_day_values.map((values, label) => ({
            values: normalize ? values.map((a) => a / _.sum(values)) : values,
            label: label.toString(),
        })),
        extraStats: normalize
            ? (bar: BarDatum) => [bar.values[0] ? formatRetention(bar.values[0]) : "No data"]
            : totalCalc,
        columnLabeler: barDateLabeler,
        column_counts: !normalize,
        precision: normalize ? 2 : 0,
    }
</script>

<div style:--graph-width={`${width}px`} style:--graph-height={`${height}px`}>
    <hr />
    <h1 class="header">{i18n("title-search-stats-extended")}</h1>
    <GraphCategory hidden_title={i18n("future-due-types")} config_name="due">
        <GraphContainer>
            <h1>{i18n("future-due-types")}</h1>
            {#if $data?.futureDue && $learn_data?.futureDue && $mature_data?.futureDue && $relearn_data?.futureDue}
                <DueBar
                    all={$data.futureDue}
                    learn={$learn_data.futureDue}
                    mature={$mature_data.futureDue}
                    relearn={$relearn_data?.futureDue}
                />
            {:else}
                <NoGraph></NoGraph>
            {/if}
            <p>
                {i18n("future-due-types-help")}
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>{i18n("future-due-retention")}</h1>
            {#if _.sum($target_R_days) > 0}
                <BarScrollable data={target_R_days_bar} left_aligned average={normalize}
                ></BarScrollable>
            {:else}
                <NoGraph>
                    {i18n("no-data")}
                    <small>{i18n("fsrs-only")}</small>
                </NoGraph>
            {/if}
            <label>
                <input type="checkbox" bind:checked={normalize} />
                {i18n("as-ratio")}
            </label>
            <p>
                {i18n("future-due-retention-help")}
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>{i18n("intra-day-due")}</h1>
            <IntraDayDueBar></IntraDayDueBar>
            <p>
                {i18n("intra-day-due-help")}
            </p>
        </GraphContainer>
    </GraphCategory>
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
    </GraphCategory>
    <GraphCategory hidden_title={i18n("interval-distribution")} config_name="interval">
        <GraphContainer>
            <h1>{i18n("interval-distribution")}</h1>
            <IntervalGraph {intervals} bind:last={interval_last} bind:steps={interval_steps} />
            <p>
                {i18n("interval-distribution-help")}
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>{i18n("interval-load")}</h1>
            <BurdenPie {intervals} bind:last={interval_last} bind:steps={interval_steps} />
            <p>
                {i18n("interval-load-help")}
            </p>
        </GraphContainer>
    </GraphCategory>
    <CardDataPies cardData={$card_data} />
    {#if $showRevlogStats}
        {#if $revlogs && $card_data && $data?.added}
            <RevlogGraphs
                revlogData={$revlogs}
                cardData={$card_data}
                addedCards={$data.added.added}
            />
        {:else}
            <h1 class="header">{i18n("preparing-review-stats")}</h1>
        {/if}
    {:else}
        <GraphCategory>
            <div style:grid-column="1/-1">
                <GraphContainer>
                    <div class="loadOption">
                        <Warning always>
                            <h1>{i18n("review-graphs-warning-title")}</h1>
                            {i18n("review-graphs-warning")}
                        </Warning>
                        <button on:click={() => ($showRevlogStats = true)}>
                            {i18n("review-graphs-prepare-graphs")}
                        </button>
                        <span>
                            {i18n("review-graphs-config-hint")}
                        </span>
                    </div>
                </GraphContainer>
            </div>
        </GraphCategory>
    {/if}
</div>

<div
    class="tooltip"
    style:opacity={$tooltipShown ? 1 : 0}
    style:left={`${$tooltip.x}px`}
    style:top={`${$tooltip.y}px`}
>
    {#each $tooltip?.text ?? [] as text}
        <span>{text}</span>
        <br />
    {/each}
</div>

<style lang="scss">
    h1.header {
        margin: 1.5rem;
    }

    div.tooltip {
        position: absolute;
        opacity: 0;
        white-space: nowrap;
        padding: 15px;
        border-radius: 5px;
        font-size: 15px;
        pointer-events: none;
        transition: opacity var(--transition);
        color: var(--fg);
        background: var(--canvas-overlay);
    }

    div.loadOption {
        background-color: rgba(255, 136, 0, 0.116);
        display: flex;
        flex-direction: column;
        gap: 1em;
        min-height: 500px;

        border-radius: var(--border-radius-medium, 10px);
        margin: -1em;
        padding: 1em;

        button {
            font-size: 2em;
            font-weight: 900;
        }

        & :global(span) {
            border-radius: var(--border-radius-medium, 10px);
            padding: 0.5em;
        }
    }

    :global(.hover-bar) {
        fill: white;
        opacity: 0;

        &:hover {
            opacity: 0.1;
        }
    }
</style>
