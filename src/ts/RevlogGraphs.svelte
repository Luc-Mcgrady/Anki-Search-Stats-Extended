<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import { browserSearchCids, catchErrors, type CardData, type Revlog } from "./search"
    import {
        binSize,
        cids,
        config,
        last_forget,
        memorised_stats,
        pieLast,
        pieSteps,
        scroll,
        searchLimit,
    } from "./stores"
    import _, { size } from "lodash"
    import BarScrollable from "./BarScrollable.svelte"
    import type { PieDatum } from "./pie"
    import { LEARN_COLOUR, MATURE_COLOUR, RELEARN_COLOUR, YOUNG_COLOUR } from "./graph"
    import Pie from "./Pie.svelte"
    import { barDateLabeler, barHourLabeler, barStringLabeler, type BarChart } from "./bar"
    import {
        calculateRevlogStats,
        day_ms,
        easeBarChart,
        no_rollover_today,
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
    import Bar from "./Bar.svelte"
    import * as d3 from "d3"
    import MemorisedCalculator from "./MemorisedCalculator.svelte"
    import TimeMachineScroll from "./TimeMachineScroll.svelte"
    import FsrsCalibration from "./FSRSCalibration.svelte"
    import ForgettingCurve from "./ForgettingCurve.svelte"

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
        day_review_hours,
        day_filtered_review_hours,
        learn_steps_per_card,
        forgetting_samples,
        forgetting_samples_short,
        last_forget: local_last_forget,
    } = catchErrors(() => calculateRevlogStats(revlogData, cardData)))

    $: $last_forget = local_last_forget
    $: realScroll = -Math.abs($scroll)
    const bins = 30

    function barLabel(i: number) {
        return (i - today).toString()
    }

    enum Average {
        MEDIAN,
        MEAN,
    }

    let average_type = Average.MEDIAN

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
    $: time_machine_intra_day = time_machine_intervals[0] || 0
    $: time_machine_learn = time_machine_intervals[-2] || 0
    $: time_machine_young = _.sum(time_machine_intervals.slice(1, 21)) || 0
    $: time_machine_mature = _.sum(time_machine_intervals.slice(21)) || 0
    $: time_machine_suspended = time_machine_intervals[-1] ?? 0
    $: time_machine_added = Object.entries(addedCards).reduce(
        (p, [i, v]) => p + (+i <= realScroll ? v : 0),
        0
    )

    $: total_intervals = time_machine_mature + time_machine_young + time_machine_intra_day
    $: intervals_mean =
        intervals[today + realScroll].reduce((p, c, i) => p + c * i, 0) / total_intervals

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
            label: i18n("learning-count"),
            value: time_machine_learn,
            colour: LEARN_COLOUR,
        },
        {
            label: i18n("relearning-count"),
            value: time_machine_intra_day - time_machine_learn,
            colour: RELEARN_COLOUR,
        },
        {
            label: i18n("suspended"),
            value: time_machine_suspended,
            colour: "yellow",
        },
        {
            label: i18n("new-count"),
            value:
                time_machine_added -
                time_machine_young -
                time_machine_mature -
                time_machine_intra_day -
                time_machine_suspended,
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

    let range = 7
    let filtered = false

    $: hours_begin = no_rollover_today + realScroll - range + 1
    $: hours_end = no_rollover_today + realScroll + 2
    $: day_range = filtered
        ? day_filtered_review_hours.slice(hours_begin, hours_end)
        : day_review_hours.slice(hours_begin, hours_end)
    $: todays_hours = _.zip(...day_range).map(_.sum)
    let hours_time_machine: BarChart
    $: hours_time_machine = {
        row_colours: ["#70AFD6"],
        row_labels: [i18n("cards")],
        data: Array.from(todays_hours ?? []).map((v, i) => ({
            values: [v ?? 0],
            label: i.toString(),
        })),
        tick_spacing: 6,
        columnLabeler: barHourLabeler,
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

    let granularity = 20
    $: difficulty_binner = d3
        .bin<[number, number], number>()
        .thresholds(granularity)
        .domain([0, 100])
        .value((a) => a[0])
    let difficulty_time_machine_bar: BarChart

    $: difficulty_bins = difficulty_binner([
        ...($memorised_stats?.difficulty_days[today + realScroll] ?? []).entries(),
    ])
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

    $: learn_repetitions = learn_steps_per_card.reduce(
        (learn_repetitions, count) => {
            learn_repetitions[count] = (learn_repetitions[count] ?? 0) + 1
            return learn_repetitions
        },
        {} as Record<number, number>
    )

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

<GraphCategory hidden_title={i18n("time-distribution")} config_name="time">
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
<GraphCategory hidden_title={i18n("introduced")} config_name="introduced">
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
                {i18n("introduced-truncated-warning")}
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
<GraphCategory hidden_title={i18n("ratings")} config_name="rating">
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
<GraphCategory hidden_title={i18n("load-trend")} config_name="load">
    <GraphContainer>
        <h1>{i18n("load-trend")}</h1>
        <LineOrCandlestick
            data={burden}
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
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("learn-reviews-per-card")}</h1>
        <IntervalGraph
            intervals={learn_repetitions}
            pieInfo={{
                countDescriptor: i18n("highest-repetition-count"),
                legend_left: i18n("repetition-count"),
                legend_right: i18n("card-count"),
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <span>{i18n("mean")} = {d3.mean(learn_steps_per_card)?.toFixed(2)}</span>
        <span>{i18n("median")} = {d3.quantile(learn_steps_per_card, 0.5)}</span>
        <p>{i18n("learn-reviews-per-card-help")}</p>
    </GraphContainer>
</GraphCategory>
<GraphCategory hidden_title="FSRS" config_name="fsrs">
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
    <GraphContainer>
        <h1>{i18n("fsrs-calibration")}</h1>
        {#if $memorised_stats}
            <FsrsCalibration data={$memorised_stats.calibration} />
        {:else}
            <MemorisedCalculator />
        {/if}
        <p>
            {i18n("fsrs-calibration-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("first-short-term-forgetting-curve")}</h1>
        {#if $memorised_stats}
            <ForgettingCurve
                data={forgetting_samples_short}
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
        {:else}
            <MemorisedCalculator />
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("forgetting-curve")}</h1>
        {#if $memorised_stats}
            <ForgettingCurve data={forgetting_samples} />
            <p>{i18n("forgetting-curve-help")}</p>
            {#if truncated}
                <Warning>{i18n("generic-truncated-warning")}</Warning>
            {/if}
        {:else}
            <MemorisedCalculator />
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("stability-time-machine")}</h1>
        {#if $memorised_stats}
            <BarScrollable data={stability_time_machine_bar} left_aligned />
            <TimeMachineScroll min={time_machine_min} />
            <p>{i18n("stability-time-machine-help")}</p>
            {#if truncated}
                <Warning>{i18n("generic-truncated-warning")}</Warning>
            {/if}
        {:else}
            <MemorisedCalculator />
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("difficulty-time-machine")}</h1>
        {#if $memorised_stats}
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
        {:else}
            <MemorisedCalculator />
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("average-stability-over-time")}</h1>
        {#if $memorised_stats}
            <BarScrollable
                bind:binSize={interval_bin_size}
                data={{
                    row_colours: [YOUNG_COLOUR, MATURE_COLOUR],
                    row_labels: [i18n("young"), i18n("mature")],
                    data: (average_type == Average.MEAN
                        ? $memorised_stats.day_means
                        : $memorised_stats.day_medians
                    ).map((day, i) => {
                        const young = _.sum($memorised_stats.stability_bins_days[i]?.slice(0, 21))
                        const total = _.sum($memorised_stats.stability_bins_days[i])
                        const young_ratio = young / total
                        return {
                            values: [day * young_ratio, day * (1 - young_ratio)], //* young_ratio, day * (1 - young_ratio)],
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
        {:else}
            <MemorisedCalculator />
        {/if}
    </GraphContainer>
</GraphCategory>
<GraphCategory hidden_title={i18n("card-count-time-machine")} config_name="timeMachine">
    <GraphContainer>
        <h1>{i18n("card-count-time-machine")}</h1>
        <Pie
            data={time_machine_pie}
            legend_left={i18n("card-type")}
            legend_right={i18n("amount")}
            percentage
        ></Pie>
        <TimeMachineScroll min={time_machine_min} />
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
        <span>{i18n("x-total-cards", { val: time_machine_added })}</span>
        <p>{i18n("card-count-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("review-interval-time-machine")}</h1>
        <BarScrollable data={time_machine_bar} left_aligned />
        <TimeMachineScroll min={time_machine_min} />
        <span>{i18n("x-total-cards", { val: total_intervals })}</span>
        <p>{i18n("review-interval-time-machine-help")}</p>
        <span>
            {i18n("mean")} = {intervals_mean.toFixed(2)}
        </span>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("daily-hourly-breakdown")}</h1>
        <div class="options">
            <label>
                {i18n("days")}
                <input type="number" bind:value={range} min={1} max={1 - (time_machine_min ?? 0)} />
            </label>
            <input
                type="button"
                value={i18n("today")}
                on:click={() => {
                    $scroll = 0
                    range = 1
                }}
            />
        </div>
        <Bar data={hours_time_machine}></Bar>
        <label>
            <input type="checkbox" bind:checked={filtered} />
            {i18n("include-filtered")}
        </label>
        <TimeMachineScroll min={time_machine_min} />
        <p>{i18n("daily-hourly-breakdown-help")}</p>
    </GraphContainer>
</GraphCategory>
<GraphCategory hidden_title={i18n("bad-graph")} config_name="bad">
    <GraphContainer>
        <h1>{i18n("leech-detector")}</h1>
        {#if $memorised_stats}
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
        {:else}
            <MemorisedCalculator />
        {/if}
    </GraphContainer>
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
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("fsrs-loss-by-fatigue")}</h1>
        {#if $memorised_stats}
            <BarScrollable
                bind:binSize={fatigue_bin_size}
                data={{
                    row_colours: ["red"],
                    row_labels: ["RMSE"],
                    data: $memorised_stats.fatigueRMSE[mature_filter].map((v, i) => ({
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
        {:else}
            <MemorisedCalculator />
        {/if}
        <p>
            {i18n("fsrs-loss-by-fatigue-help")}
        </p>
    </GraphContainer>
</GraphCategory>

<style lang="scss">
    div.options {
        display: flex;
        justify-content: center;
        gap: 0.5em;
        align-items: baseline;

        label {
            display: contents;
        }
    }
</style>
