<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import type { CardData, Revlog } from "./search"
    import { burdenOrLoad, other } from "./stores"
    import Candlestick from "./Candlestick.svelte"
    import _ from "lodash"
    import BarScrollable from "./BarScrollable.svelte"

    export let revlogData: Revlog[]
    export let cardData: CardData[]

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
        let forgotten = new Set<number>()
        let card_times: Record<number, number> = {}
        let introduced = new Set<number>()
        let reintroduced = new Set<number>()
        let intervals: number[][] = []
        intervals[today] = []
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
    let bins = 30
    let binSize = 1
    let scrollOffset = bins * binSize - bins
    $: start = today - bins * binSize - scroll

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
        manually add "-is:suspended" to your search Please consider that this may cause
        inconsistencies if you leave it off for the above graphs
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
        period of time (improvement) while a red bar shows an increase. This graph is very
        susceptible to rounding errors.
    </p>
</GraphContainer>
