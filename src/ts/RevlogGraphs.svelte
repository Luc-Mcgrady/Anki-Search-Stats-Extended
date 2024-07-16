<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import type { CardData, Revlog } from "./search"
    import { burdenOrLoad, other } from "./stores"
    import Candlestick from "./Candlestick.svelte"
    import _ from "lodash"
    import BarScrollable from "./BarScrollable.svelte"
    import type { PieDatum } from "./pie"
    import { MATURE_COLOUR, YOUNG_COLOUR } from "./graph"
    import Pie from "./Pie.svelte"
    import type { BarChart } from "./bar"

    export let revlogData: Revlog[]
    export let cardData: CardData[]
    export let addedCards: Record<number, number>

    let id_card_data: Record<number, CardData>
    let review_day_times: number[]
    let review_day_count: number[]
    let revlog_times: number[]
    let introduced_day_count: number[]
    let reintroduced_day_count: number[]
    let burden: number[]
    let burden_change: number[]
    let day_forgotten: number[]
    let remaining_forgotten: number
    let intervals: number[][]

    const rollover = $other.rollover * 60 * 60 * 1000
    const day_ms = 1000 * 60 * 60 * 24
    const today = Math.floor((Date.now() - rollover) / day_ms)

    $: {
        id_card_data = {}
        for (const card of cardData) {
            id_card_data[card.id] = card
        }
    }

    $: {
        revlog_times = []
        revlog_times[today] = 0
        review_day_times = []
        review_day_times[today] = 0
        review_day_count = []
        review_day_count[today] = 0
        introduced_day_count = []
        introduced_day_count[today] = 0
        reintroduced_day_count = []
        reintroduced_day_count[today] = 0
        day_forgotten = []
        day_forgotten[today] = 0
        intervals = []
        intervals[today] = []
        let forgotten = new Set<number>()
        let card_times: Record<number, number> = {}
        let introduced = new Set<number>()
        let reintroduced = new Set<number>()
        let last_cids: Record<number, Revlog> = {}
        let introduced_day_total_count: number[]

        for (const revlog of revlogData) {
            const day = Math.floor((revlog.id - rollover) / day_ms)

            card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

            review_day_times[day] = (review_day_times[day] ?? 0) + revlog.time
            review_day_count[day] = (review_day_count[day] ?? 0) + 1

            if (revlog.ease == 0 && revlog.ivl == 0) {
                introduced.delete(revlog.cid)
                forgotten.add(revlog.cid)
                if (revlog.lastIvl != 0) {
                    day_forgotten[day] = (day_forgotten[day] ?? 0) + 1
                }
            } else if (!introduced.has(revlog.cid)) {
                introduced_day_count[day] = (introduced_day_count[day] ?? 0) + 1
                if (reintroduced.has(revlog.cid)) {
                    reintroduced_day_count[day] = (reintroduced_day_count[day] ?? 0) + 1
                }
                introduced.add(revlog.cid)
                reintroduced.add(revlog.cid)
                forgotten.delete(revlog.cid)
            }
        }

        for (const revlog of revlogData.reverse()) {
            const day = Math.floor((revlog.id - rollover) / day_ms)

            const after_review = last_cids[revlog.cid]
            // If the card is still learning, use the card data
            const ivl = after_review ? revlog.ivl : id_card_data[revlog.cid].ivl

            for (const intervalDay of _.range(
                day,
                Math.floor((after_review?.id - rollover) / day_ms) || today + 1
            )) {
                intervals[intervalDay] = intervals[intervalDay] ?? []
                intervals[intervalDay][ivl] = (intervals[intervalDay][ivl] ?? 0) + 1
            }

            last_cids[revlog.cid] = revlog
        }

        let running_total = 0
        introduced_day_total_count = introduced_day_count.map((v, i) => {
            running_total += v + (reintroduced_day_count[i] ?? 0) - (day_forgotten[i] ?? 0)
            return running_total
        })

        burden = intervals.map((v, i) => {
            v[0] = 0
            delete v[0]
            return _.sum(v.map((val, ivl) => val / ivl))
        })

        burden_change = burden.map((v, i) => v - (burden[i - 1] || 0))

        for (const card_time of Object.values(card_times)) {
            const key = Math.floor(card_time / 1000)
            revlog_times[key] = (revlog_times[key] ?? 0) + 1
        }

        remaining_forgotten = forgotten.size
    }

    let scroll = 0
    $: realScroll = -Math.abs(scroll)
    let bins = 30
    let binSize = 1
    let scrollOffset = bins * binSize - bins
    $: start = today - bins * binSize - realScroll

    $: burden_start = burden[start] ?? 0

    $: speed_trend_bar = {
        row_colours: ["#fcba03"],
        row_labels: ["Speed Per Review (s)"],
        data: Array.from(review_day_count).map((data, i) => ({
            label: (i - today - scrollOffset).toString(),
            values: [(review_day_times[i] ?? 0) / ((data ?? 0) * 1000)],
        })),
        tick_spacing: 5,
        isDate: true,
    }

    $: introduced_bar = {
        row_colours: ["#13e0eb", "#0c8b91"],
        row_labels: ["Introduced", "Re-introduced"],
        data: Array.from(introduced_day_count)
            .map((v, i) => {
                const introduced = v ?? 0
                const reintroduced = reintroduced_day_count[i] ?? 0
                return {
                    values: [introduced - reintroduced, reintroduced],
                    label: (i - today - scrollOffset).toString(),
                }
            })
            .map((d, i) => d ?? { values: [0, 0], label: (i - today - scrollOffset).toString() }),
        tick_spacing: 5,
        isDate: true,
    }

    $: forgotten_bar = {
        row_colours: ["#330900"],
        row_labels: ["Forgotten"],
        data: Array.from(day_forgotten).map((v, i) => ({
            values: [v ?? 0],
            label: (i - today - scrollOffset).toString(),
        })),
        tick_spacing: 5,
        isDate: true,
    }

    $: burden_change_candlestick = {
        start: burden_start,
        data: Array.from(burden_change).map((delta, i) => ({
            label: (i - today - scrollOffset).toString(),
            delta: delta ?? 0,
        })),
        tick_spacing: 5,
    }

    let time_machine_pie: PieDatum[]
    $: time_machine_intervals = intervals[today + realScroll] ?? []
    $: time_machine_young = _.sum(time_machine_intervals.slice(0, 21))
    $: time_machine_mature = _.sum(time_machine_intervals.slice(21))
    $: time_machine_added = Object.entries(addedCards).reduce(
        (p, [i, v]) => p + (parseInt(i) <= realScroll ? v : 0),
        0
    )
    console.log({ addedCards })
    $: time_machine_min = _.min(Object.entries(addedCards).map(([k, v]) => parseInt(k))) ?? 0
    $: time_machine_pie = [
        {
            label: "Young",
            value: time_machine_young,
            colour: YOUNG_COLOUR,
        },
        {
            label: "Mature",
            value: time_machine_mature,
            colour: MATURE_COLOUR,
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
    }

    let pieLast = 59
    let pieSteps = 10
</script>

<GraphContainer>
    <h1>Time Distribution</h1>
    <IntervalPie
        intervals={revlog_times}
        countDescriptor={"Most Seconds"}
        spectrumFrom={"#fcba03"}
        spectrumTo={"#543e00"}
        bind:last={pieLast}
        bind:steps={pieSteps}
        fillerColour={"blue"}
        legend_left={"Time (s)"}
        include_suspended_option={false}
    ></IntervalPie>
    <p>How many cards have taken the given amount of time to answer over every review</p>
    <p>
        In order to exclude suspended cards from this or the following graphs, you will need to
        manually add "-is:suspended" to your search. Please consider that this may cause
        inconsistencies if you leave it off for the above graphs.
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Time Totals</h1>
    <IntervalPie
        intervals={revlog_times.map((i, a) => i * a)}
        countDescriptor={"Most Seconds"}
        spectrumFrom={"#fcba03"}
        spectrumTo={"#543e00"}
        bind:last={pieLast}
        bind:steps={pieSteps}
        fillerColour={"blue"}
        legend_left={"Per card (s)"}
        legend_right={"Total (s)"}
        totalDescriptor={"Seconds"}
        include_suspended_option={false}
    ></IntervalPie>
    <p>
        The quantity of time that has been spent on cards which have taken the given amount of time
        to answer over every review
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Review Speed Trend</h1>
    <BarScrollable data={speed_trend_bar} bind:bins bind:binSize bind:offset={scroll} average />
    <p>The average amount of time it took you to answer each card on a given day.</p>
</GraphContainer>
<GraphContainer>
    <h1>Introduced</h1>
    <BarScrollable data={introduced_bar} bind:bins bind:binSize bind:offset={scroll} />

    <p>
        A card is introduced when it is shown to you for the first time. A card is re-introduced
        when it is shown to you for the first time after being forgotten.
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Forgotten</h1>
    <BarScrollable data={forgotten_bar} bind:bins bind:binSize bind:offset={scroll} />
    <span>Forgotten cards not yet re-introduced: {remaining_forgotten.toLocaleString()}</span>

    <p>You "forget" a card when you manually mark it as new.</p>
</GraphContainer>
<GraphContainer>
    <h1>{$burdenOrLoad} Trend</h1>
    <Candlestick data={burden_change_candlestick} bind:bins bind:binSize bind:offset={scroll} />
    <p>
        This shows the change in burden over time. A green bar shows a decrease in burden for that
        period of time (improvement) while a red bar shows an increase.
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Card Count Time Machine</h1>
    <Pie data={time_machine_pie} legend_left={"Card Type"} legend_right={"Amount"}></Pie>
    <label>
        <span>
            {-realScroll} days ago:
        </span>
        <span class="scroll">
            {time_machine_min}
            <input type="range" min={time_machine_min} max={0} bind:value={scroll} />
            0
        </span>
    </label>
    <p>Shows your card type counts for a given date</p>
</GraphContainer>
<GraphContainer>
    <h1>Review Interval Time Machine</h1>
    <BarScrollable data={time_machine_bar} left_aligned />
    <label>
        <span>
            {new Date(Date.now() + scroll * day_ms).toLocaleDateString()}:
        </span>
        <span class="scroll">
            {time_machine_min}
            <input type="range" min={time_machine_min} max={0} bind:value={scroll} />
            0
        </span>
    </label>
    <p>Shows your review intervals for a given date</p>
</GraphContainer>

<style>
    label {
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
