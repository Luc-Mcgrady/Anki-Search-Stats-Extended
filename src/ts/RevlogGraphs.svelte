<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import type { CardData, Revlog } from "./search"
    import { binSize, burdenOrLoad, other, pieLast, pieSteps, scroll } from "./stores"
    import Candlestick from "./Candlestick.svelte"
    import _ from "lodash"
    import BarScrollable from "./BarScrollable.svelte"
    import type { PieDatum } from "./pie"
    import { MATURE_COLOUR, YOUNG_COLOUR } from "./graph"
    import Pie from "./Pie.svelte"
    import { barDateLabeler, barStringLabeler, type BarChart } from "./bar"
    import { calculateRevlogStats, day_ms, easeBarChart, today } from "./revlogGraphs"
    import GraphCategory from "./GraphCategory.svelte"

    export let revlogData: Revlog[]
    export let cardData: CardData[]
    export let addedCards: Record<number, number>

    $: ({
        day_initial_ease,
        day_initial_reintroduced_ease,
        day_ease,
        day_review_ease,
        revlog_times,
        introduced_day_count,
        reintroduced_day_count,
        burden,
        burden_change,
        day_forgotten,
        remaining_forgotten,
        intervals,
    } = calculateRevlogStats(revlogData, cardData))

    $: realScroll = -Math.abs($scroll)
    const bins = 30
    const barOffset = bins * $binSize - bins
    $: start = today - bins * $binSize + realScroll

    $: burden_start = burden[start] ?? 0

    $: introduced_bar = {
        row_colours: ["#13e0eb", "#0c8b91"],
        row_labels: ["Introduced", "Re-introduced"],
        data: Array.from(introduced_day_count)
            .map((v, i) => {
                const introduced = v ?? 0
                const reintroduced = reintroduced_day_count[i] ?? 0
                return {
                    values: [introduced - reintroduced, reintroduced],
                    label: (i - today - barOffset).toString(),
                }
            })
            .map((d, i) => d ?? { values: [0, 0], label: (i - today - barOffset).toString() }),
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }

    $: forgotten_bar = {
        row_colours: ["#330900"],
        row_labels: ["Forgotten"],
        data: Array.from(day_forgotten).map((v, i) => ({
            values: [v ?? 0],
            label: (i - today - barOffset).toString(),
        })),
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }

    $: burden_change_candlestick = {
        start: burden_start,
        data: Array.from(burden_change).map((delta, i) => ({
            label: (i - today - barOffset).toString(),
            delta: delta ?? 0,
        })),
        tick_spacing: 5,
    }

    $: time_machine_intervals = intervals[today + realScroll] ?? []
    $: time_machine_young = _.sum(time_machine_intervals.slice(0, 21)) || 0
    $: time_machine_mature = _.sum(time_machine_intervals.slice(21)) || 0
    $: time_machine_added = Object.entries(addedCards).reduce(
        (p, [i, v]) => p + (parseInt(i) <= realScroll ? v : 0),
        0
    )

    let left_bound_at = "Review"

    function minIndex(vals: Record<number, any>) {
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
            label: "Mature",
            value: time_machine_mature,
            colour: MATURE_COLOUR,
        },
        {
            label: "Young",
            value: time_machine_young,
            colour: YOUNG_COLOUR,
        },
        {
            label: "New",
            value: time_machine_added - time_machine_young - time_machine_mature,
            colour: "#6baed6",
        },
    ]

    let time_machine_bar: BarChart
    $: time_machine_bar = {
        row_colours: ["#70AFD6"],
        row_labels: ["Cards"],
        data: Array.from(time_machine_intervals).map((v, i) => ({
            values: [v ?? 0],
            label: i.toString(),
        })),
        tick_spacing: 5,
        columnLabeler: barStringLabeler("Interval of"),
    }

    let include_reintroduced = false
    $: introduced_ease = include_reintroduced ? day_initial_reintroduced_ease : day_initial_ease

    let normalize_ease = false
</script>

<GraphCategory>
    <GraphContainer>
        <h1>Time Distribution</h1>
        <IntervalGraph
            intervals={revlog_times}
            bind:last={$pieLast}
            bind:steps={$pieSteps}
            include_suspended_option={false}
            pieInfo={{
                countDescriptor: "Most Seconds",
                spectrumFrom: "#fcba03",
                spectrumTo: "#543e00",
                fillerColour: "blue",
                legend_left: "Time (s)",
            }}
        ></IntervalGraph>
        <p>How many cards have taken the given amount of time to answer over every review</p>
        <p>
            In order to exclude suspended cards from this or the following graphs, you will need to
            manually add "-is:suspended" to your search. Please consider that this may cause
            inconsistencies if you leave it off for the above graphs.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Time Totals</h1>
        <IntervalGraph
            intervals={revlog_times.map((i, a) => i * a)}
            bind:last={$pieLast}
            bind:steps={$pieSteps}
            include_suspended_option={false}
            pieInfo={{
                countDescriptor: "Most Seconds",
                spectrumFrom: "#fcba03",
                spectrumTo: "#543e00",
                fillerColour: "blue",
                legend_left: "Per card (s)",
                legend_right: "Total (s)",
                totalDescriptor: "Seconds",
            }}
        ></IntervalGraph>
        <p>
            The quantity of time that has been spent on cards which have taken the given amount of
            time to answer over every review
        </p>
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <GraphContainer>
        <h1>Introduced</h1>
        <BarScrollable data={introduced_bar} {bins} bind:binSize={$binSize} bind:offset={$scroll} />
        <p>
            A card is introduced when it is shown to you for the first time. A card is re-introduced
            when it is shown to you for the first time after being forgotten.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Forgotten</h1>
        <BarScrollable data={forgotten_bar} {bins} bind:binSize={$binSize} bind:offset={$scroll} />
        <span>Forgotten cards not yet re-introduced: {remaining_forgotten.toLocaleString()}</span>

        <p>You "forget" a card when you manually mark it as new.</p>
    </GraphContainer>
    <GraphContainer>
        <h1>Introductory Rating</h1>
        <BarScrollable
            data={easeBarChart(introduced_ease, today, normalize_ease)}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
        />
        <label>
            <input type="checkbox" bind:checked={include_reintroduced} />
            Include re-introduced
        </label>
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            As Ratio
        </label>
        The first review you gave a newly introduced card. Important for FSRS.
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <GraphContainer>
        <h1>{$burdenOrLoad} Trend</h1>
        <Candlestick
            data={burden_change_candlestick}
            {bins}
            bind:binSize={$binSize}
            bind:offset={$scroll}
        />
        <p>
            This shows the change in {$burdenOrLoad.toLowerCase()} over time. A green bar shows a decrease
            in {$burdenOrLoad.toLowerCase()} for that period of time (improvement) while a red bar shows
            an increase.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Ratings</h1>
        <BarScrollable
            data={easeBarChart(day_ease, today, normalize_ease)}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            As Ratio
        </label>
        <p>
            The rating of every review you did that day, learning or otherwise. Normalizing displays
            it as a percent of all cards reviewed that day.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Review Ratings</h1>
        <BarScrollable
            data={easeBarChart(day_review_ease, today, normalize_ease)}
            bind:binSize={$binSize}
            bind:offset={$scroll}
            average={normalize_ease}
        />
        <label>
            <input type="checkbox" bind:checked={normalize_ease} />
            As Ratio
        </label>
        <p>
            The rating of the first review you did for every card that day. With the ratio,
            calculate <code>(1-again)%</code>
            to get your retention for that day (shown as
            <code>% Correct</code>
            ).
        </p>
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <GraphContainer>
        <h1>Card Count Time Machine</h1>
        <Pie data={time_machine_pie} legend_left={"Card Type"} legend_right={"Amount"} percentage
        ></Pie>
        <label>
            <span>
                {-realScroll} days ago:
            </span>
            <span class="scroll">
                {time_machine_min}
                <input type="range" min={time_machine_min} max={0} bind:value={$scroll} />
                0
            </span>
        </label>
        <div>
            Start at <br />
            <label>
                <input type="radio" bind:group={left_bound_at} value="Added" />
                First added
            </label>
            <label>
                <input type="radio" bind:group={left_bound_at} value="Review" />
                First review
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
                Custom
            </label>
            {#if left_bound_at == "Custom"}
                <input type="number" bind:value={custom_leftmost} />
            {/if}
        </div>
        <span>Total: {time_machine_added}</span>
        <p>Shows your card type counts for a given date</p>
    </GraphContainer>
    <GraphContainer>
        <h1>Review Interval Time Machine</h1>
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
        <p>Shows your review intervals for a given date</p>
    </GraphContainer>
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
