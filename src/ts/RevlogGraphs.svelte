<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import { catchErrors, type CardData, type Revlog } from "./search"
    import {
        binSize,
        config,
        fatigueLoss,
        pieLast,
        pieSteps,
        scroll,
        searchLimit,
        stability_days,
    } from "./stores"
    import _ from "lodash"
    import BarScrollable from "./BarScrollable.svelte"
    import type { PieDatum } from "./pie"
    import { MATURE_COLOUR, YOUNG_COLOUR } from "./graph"
    import Pie from "./Pie.svelte"
    import { barDateLabeler, barStringLabeler, type BarChart } from "./bar"
    import {
        calculateRevlogStats,
        day_ms,
        easeBarChart,
        today,
        type RevlogBuckets,
    } from "./revlogGraphs"
    import GraphCategory from "./GraphCategory.svelte"
    import Warning from "./Warning.svelte"
    import MatureFilterSelector from "./MatureFilterSelector.svelte"
    import TrendValue from "./TrendValue.svelte"
    import MemorisedBar from "./MemorisedBar.svelte"
    import { CANDLESTICK_GREEN, CANDLESTICK_RED, DeltaIfy } from "./Candlestick"
    import type { TrendLine } from "./trend"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { i18n, i18n_bundle, i18n_pattern } from "./i18n"

    export let revlogData: Revlog[]
    export let cardData: CardData[]
    export let addedCards: Record<number, number>

    $: ({
        day_initial_ease,
        day_initial_reintroduced_ease,
        day_ease,
        fatigue_ease,
        revlog_times,
        time_ease_seconds,
        sibling_time_ease,
        introduced_day_count,
        reintroduced_day_count,
        burden,
        day_forgotten,
        remaining_forgotten,
        intervals,
        interval_ease,
    } = catchErrors(() => calculateRevlogStats(revlogData, cardData)))

    $: burden_change = DeltaIfy(burden)
    $: realScroll = -Math.abs($scroll)
    const bins = 30
    $: start = today - bins * $binSize + realScroll

    $: burden_start = burden[start] ?? 0

    function barLabel(i: number) {
        return (i - today).toString()
    }

    $: introduced_bar = {
        row_colours: ["#13e0eb", "#0c8b91"],
        row_labels: [i18n("introduced"), i18n("re-introduced")],
        data: Array.from(introduced_day_count)
            .map((v, i) => {
                const introduced = v ?? 0
                const reintroduced = reintroduced_day_count[i] ?? 0
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
        data: Array.from(day_forgotten).map((v, i) => ({
            values: [v ?? 0],
            label: barLabel(i),
        })),
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }

    $: time_machine_intervals = intervals[today + realScroll] ?? []
    $: time_machine_young = _.sum(time_machine_intervals.slice(0, 21)) || 0
    $: time_machine_mature = _.sum(time_machine_intervals.slice(21)) || 0
    $: time_machine_added = Object.entries(addedCards).reduce(
        (p, [i, v]) => p + (+i <= realScroll ? v : 0),
        0
    )

    let left_bound_at = "Review"

    function minIndex(vals: Record<number, any>) {
        // The lambda "(k) => parseInt(k)" here is required for reasons beyond my comprehension
        return _.min(Object.keys(vals).map((k) => parseInt(k))) ?? 0
    }

    $: review_leftmost = minIndex(intervals) - today
    $: added_leftmost = minIndex(addedCards)
    let custom_leftmost = 0

    $: time_machine_min = {
        Review: review_leftmost,
        Added: added_leftmost,
        Custom: -Math.abs(custom_leftmost),
    }[left_bound_at]

    let time_machine_pie: PieDatum[]
    $: time_machine_pie = [
        {
            label: i18n("mature-count"),
            value: time_machine_mature,
            colour: MATURE_COLOUR,
        },
        {
            label: i18n("young-count"),
            value: time_machine_young,
            colour: YOUNG_COLOUR,
        },
        {
            label: i18n("new-count"),
            value: time_machine_added - time_machine_young - time_machine_mature,
            colour: "#6baed6",
        },
    ]

    let time_machine_bar: BarChart
    $: time_machine_bar = {
        row_colours: ["#70AFD6"],
        row_labels: [i18n("cards")],
        data: Array.from(time_machine_intervals).map((v, i) => ({
            values: [v ?? 0],
            label: i.toString(),
        })),
        tick_spacing: 5,
        columnLabeler: barStringLabeler(i18n_bundle.getMessage("interval-of")?.value!),
    }

    let stability_time_machine_bar: BarChart
    $: stability_time_machine_bar = {
        row_colours: ["#70AFD6"],
        row_labels: [i18n("cards")],
        data: Array.from($stability_days[today + realScroll] ?? []).map((v, i) => ({
            values: [v ?? 0],
            label: i.toString(),
        })),
        tick_spacing: 5,
        columnLabeler: barStringLabeler(i18n_bundle.getMessage("interval-of")?.value!),
    }

    let include_reintroduced = true
    $: truncated = $searchLimit !== 0
    $: introduced_ease = include_reintroduced ? day_initial_reintroduced_ease : day_initial_ease

    let normalize_ease = false
    $: limit = -1 - $searchLimit

    let mature_filter: keyof RevlogBuckets = "not_learn"

    let fatigue_bin_size = 10
    let interval_scroll = 1
    let interval_bin_size = 1

    let retention_trend = (values: number[]) => (_.sum(values) == 0 ? 0 : 1 - values[3])
    let burden_trend: TrendLine
</script>

<GraphCategory>
    <GraphContainer>
        <h1>{i18n("time-distribution")}</h1>
        <IntervalGraph
            intervals={revlog_times}
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
            intervals={revlog_times.map((i, a) => i * a)}
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
<GraphCategory>
    <GraphContainer>
        <h1>{i18n("introduced")}</h1>
        <BarScrollable
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
                {i18n("introduced-truncated-warning ")}
            </Warning>
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("forgotten")}</h1>
        <BarScrollable
            data={forgotten_bar}
            {bins}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            {limit}
        />
        <span>
            {i18n("forgotten-cards-not-yet-reintroduced", {
                number: remaining_forgotten.toLocaleString(),
            })}
        </span>

        <p>{i18n("forgotten-help")}</p>
        {#if truncated}
            <Warning>{i18n("forgotten-truncated-warning")}</Warning>
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("introductory-rating")}</h1>
        <BarScrollable
            data={easeBarChart(introduced_ease, today, normalize_ease, barDateLabeler)}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
            trend={normalize_ease}
            trend_by={retention_trend}
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
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <GraphContainer>
        <h1>{i18n("load-trend")}</h1>
        <LineOrCandlestick
            data={burden}
            label={i18n("Load")}
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
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("ratings")}</h1>
        <BarScrollable
            data={easeBarChart(day_ease[mature_filter], today, normalize_ease, barDateLabeler)}
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
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("memorised")}</h1>
        <MemorisedBar />
        {#if truncated}
            <Warning>{i18n("memorised-truncated-warning")}</Warning>
        {/if}
        <p>
            {i18n("memorised-help")}
        </p>
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <GraphContainer>
        <h1>{i18n("interval-ratings")}</h1>
        <BarScrollable
            data={easeBarChart(
                interval_ease,
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
    </GraphContainer>
    {#if $config?.badGraphs}
        <GraphContainer>
            <h1>{i18n("naive-sibling-similarity")}</h1>
            <BarScrollable
                data={easeBarChart(
                    sibling_time_ease,
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
            <small><Warning always>{i18n("bad-graph")}</Warning></small>
        </GraphContainer>
        <GraphContainer>
            <h1>{i18n("rating-fatigue")}</h1>
            <BarScrollable
                data={easeBarChart(
                    fatigue_ease[mature_filter],
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
            <small><Warning always>{i18n("bad-graph")}</Warning></small>
        </GraphContainer>
        {#if $fatigueLoss}
            <GraphContainer>
                <h1>{i18n("fsrs-loss-by-fatigue")}</h1>
                <BarScrollable
                    bind:binSize={fatigue_bin_size}
                    data={{
                        row_colours: ["red"],
                        row_labels: ["RMSE"],
                        data: $fatigueLoss[mature_filter].map((v, i) => ({
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
                    {i18n("fsrs-loss-by-fatigue-graph")}
                </p>
                <small><Warning always>{i18n("bad-graph")}</Warning></small>
            </GraphContainer>
        {/if}
    {/if}
    <GraphContainer>
        <h1>{i18n("time-ratings")}</h1>
        <BarScrollable
            data={easeBarChart(
                time_ease_seconds[mature_filter],
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
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <GraphContainer>
        <h1>{i18n("card-count-time-machine")}</h1>
        <Pie
            data={time_machine_pie}
            legend_left={i18n("card-type")}
            legend_right={i18n("amount")}
            percentage
        ></Pie>
        <label>
            <span>
                {i18n("x-days-ago", { days: -realScroll })}
            </span>
            <span class="scroll">
                {time_machine_min}
                <input type="range" min={time_machine_min} max={0} bind:value={$scroll} />
                0
            </span>
        </label>
        <div>
            {i18n("starts-at")}
            <br />
            <label>
                <input type="radio" bind:group={left_bound_at} value="Added" />
                {i18n("first-added")}
            </label>
            <label>
                <input type="radio" bind:group={left_bound_at} value="Review" />
                {i18n("first-review")}
            </label>
            <label>
                <input
                    type="radio"
                    bind:group={left_bound_at}
                    value="Custom"
                    on:click={() => {
                        if (time_machine_min) {
                            custom_leftmost = time_machine_min
                        }
                    }}
                />
                {i18n("custom")}
            </label>
            {#if left_bound_at == "Custom"}
                <input type="number" bind:value={custom_leftmost} />
            {/if}
        </div>
        <span>{i18n("card-count")}: {time_machine_added}</span>
        <p>{i18n("card-count-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("review-interval-time-machine")}</h1>
        <BarScrollable data={time_machine_bar} left_aligned />
        <label class="scroll">
            <span>
                {new Date(Date.now() + $scroll * day_ms).toLocaleDateString()}:
            </span>
            <span class="scroll">
                {time_machine_min}
                <input type="range" min={time_machine_min} max={0} bind:value={$scroll} />
                0
            </span>
        </label>
        <p>{i18n("review-interval-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </GraphContainer>
    {#if $stability_days}
        <GraphContainer>
            <h1>{i18n("stability-time-machine")}</h1>
            <BarScrollable data={stability_time_machine_bar} left_aligned />
            <label class="scroll">
                <span>
                    {new Date(Date.now() + $scroll * day_ms).toLocaleDateString()}:
                </span>
                <span class="scroll">
                    {time_machine_min}
                    <input type="range" min={time_machine_min} max={0} bind:value={$scroll} />
                    0
                </span>
            </label>
            <p>{i18n("stability-time-machine-help")}</p>
            {#if truncated}
                <Warning>{i18n("generic-truncated-warning")}</Warning>
            {/if}
        </GraphContainer>
    {/if}
</GraphCategory>

<style>
    label.scroll {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em 1em;
        align-items: baseline;
        width: 100%;
    }
    .scroll {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.5em 1em;
    }
</style>
