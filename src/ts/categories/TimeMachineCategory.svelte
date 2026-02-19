<script lang="ts">
    import RevlogGraphContainer from "../RevlogGraphContainer.svelte"
    import BarScrollable from "../BarScrollable.svelte"
    import Bar from "../Bar.svelte"
    import Pie from "../Pie.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import Warning from "../Warning.svelte"
    import TimeMachineScroll from "../TimeMachineScroll.svelte"
    import { i18n, i18n_bundle } from "../i18n"
    import { barStringLabeler, barHourLabeler, type BarChart } from "../bar"
    import type { PieDatum } from "../pie"
    import { scroll, searchLimit, revlogStats, data } from "../stores"
    import { today, no_rollover_today } from "../revlogGraphs"
    import {
        LEARN_COLOUR,
        MATURE_COLOUR,
        NEW_COLOUR,
        RELEARN_COLOUR,
        SUSPENDED_COLOUR,
        YOUNG_COLOUR,
    } from "../graph"
    import _ from "lodash"

    $: addedCards = $data?.added?.added ?? {}

    $: truncated = $searchLimit !== 0
    $: realScroll = -Math.abs($scroll)

    $: time_machine_intervals = ($revlogStats?.intervals ?? [])[today + realScroll] ?? []
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
        ($revlogStats?.intervals ?? [])[today + realScroll]?.reduce((p, c, i) => p + c * i, 0) /
            total_intervals || 0

    let left_bound_at = "Review"

    function minIndex(vals: Record<number, any>) {
        return _.min(Object.keys(vals).map((k) => parseInt(k))) ?? 0
    }

    $: review_leftmost = minIndex($revlogStats?.intervals ?? {}) - today
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
            colour: SUSPENDED_COLOUR,
        },
        {
            label: i18n("new-count"),
            value:
                time_machine_added -
                time_machine_young -
                time_machine_mature -
                time_machine_intra_day -
                time_machine_suspended,
            colour: NEW_COLOUR,
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
        ? ($revlogStats?.day_filtered_review_hours ?? []).slice(hours_begin, hours_end)
        : ($revlogStats?.day_review_hours ?? []).slice(hours_begin, hours_end)
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
</script>

<GraphCategory hidden_title={i18n("card-count-time-machine")} config_name="timeMachine">
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("card-count-time-machine")}</h1>
        <svelte:fragment slot="graph">
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
        </svelte:fragment>
        <p>{i18n("card-count-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("review-interval-time-machine")}</h1>
        <svelte:fragment slot="graph">
            <BarScrollable data={time_machine_bar} left_aligned />
            <TimeMachineScroll min={time_machine_min} />
            <span>{i18n("x-total-cards", { val: total_intervals })}</span>
            <span>
                {i18n("mean")} = {intervals_mean.toFixed(2)}
            </span>
        </svelte:fragment>
        <p>{i18n("review-interval-time-machine-help")}</p>
        {#if truncated}
            <Warning>{i18n("generic-truncated-warning")}</Warning>
        {/if}
    </RevlogGraphContainer>
    <RevlogGraphContainer>
        <h1 slot="title">{i18n("daily-hourly-breakdown")}</h1>
        <svelte:fragment slot="graph">
            <div class="options">
                <label>
                    {i18n("days")}
                    <input
                        type="number"
                        bind:value={range}
                        min={1}
                        max={1 - (time_machine_min ?? 0)}
                    />
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
        </svelte:fragment>
        <p>{i18n("daily-hourly-breakdown-help")}</p>
    </RevlogGraphContainer>
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
