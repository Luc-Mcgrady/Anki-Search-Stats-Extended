<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import type { Revlog } from "./search"
    import { burdenOrLoad, other } from "./stores"
    import Candlestick from "./Candlestick.svelte"
    import _ from "lodash"
    import BarScrollable from "./BarScrollable.svelte"

    export let revlog_data: Revlog[]
    let review_day_times: number[]
    let review_day_count: number[]
    //let card_counts: Record<number, number> = {}
    let revlog_times: number[]
    let introduced_day_count: number[]
    let reintroduced_day_count: number[]
    let burden_change: number[]
    let day_forgotten: number[]
    let remaining_forgotten: number

    const rollover = $other.rollover * 60 * 60 * 1000
    const day_ms = 1000 * 60 * 60 * 24
    const today = Math.floor((Date.now() - rollover) / day_ms)

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
        let interval_change: Record<number, number>[] = []
        let last_cids: Record<number, Revlog> = {}
        let introduced_day_total_count: number[]

        for (const revlog of revlog_data) {
            card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

            const day = Math.floor((revlog.id - rollover) / day_ms)

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

            const last_review = last_cids[revlog.cid]
            const last_interval = last_review?.ivl > 0 ? last_review.ivl : 0
            // Anki bug?!? when rescheduling the last_ivl isn't reset for the next revlog so i cant use lastIvl
            interval_change[day] = interval_change[day] ?? {}

            if (revlog.ivl == 0 && last_review) {
                interval_change[day][last_interval] = (interval_change[day][last_interval] ?? 0) - 1
                delete last_cids[revlog.cid]
            } else if (revlog.ivl > 0) {
                interval_change[day][last_interval] = (interval_change[day][last_interval] ?? 0) - 1
                interval_change[day][revlog.ivl] = (interval_change[day][revlog.ivl] ?? 0) + 1

                last_cids[revlog.cid] = revlog
            }
        }

        let running_total = 0
        introduced_day_total_count = introduced_day_count.map((v, i) => {
            running_total += v + (reintroduced_day_count[i] ?? 0) - (day_forgotten[i] ?? 0)
            return running_total
        })

        burden_change = interval_change.map((v, i) => {
            delete v[0]
            return _.sum(Object.entries(v).map(([ivl, val]) => val / parseInt(ivl)))
        })

        for (const card_time of Object.values(card_times)) {
            const key = Math.floor(card_time / 1000)
            revlog_times[key] = (revlog_times[key] ?? 0) + 1
        }

        remaining_forgotten = forgotten.size
    }

    let scroll = 0
    let bins = 30
    let binSize = 1
    let offset = 30
    let scrollOffset = bins * binSize - offset - 1
    $: start = today - bins * binSize - scroll

    $: burden_start = _.sum(burden_change.slice(0, start)) ?? 0

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

    $: console.log({ forgotten_bar, day_forgotten })

    $: burden_change_candlestick = {
        start: burden_start,
        data: Array.from(burden_change).map((delta, i) => ({
            label: (i - today - scrollOffset).toString(),
            delta: delta ?? 0,
        })),
        tick_spacing: 5,
    }
</script>

<GraphContainer>
    <h1>Time Distribution</h1>
    <IntervalPie
        intervals={revlog_times}
        countDescriptor={"Most Seconds"}
        spectrumFrom={"#fcba03"}
        spectrumTo={"#543e00"}
        last={59}
        steps={10}
        fillerColour={"blue"}
        legend_left={"Time (s)"}
    ></IntervalPie>
</GraphContainer>
<GraphContainer>
    <h1>Time Totals</h1>
    <IntervalPie
        intervals={revlog_times.map((i, a) => i * a)}
        countDescriptor={"Most Seconds"}
        spectrumFrom={"#fcba03"}
        spectrumTo={"#543e00"}
        last={59}
        steps={10}
        fillerColour={"blue"}
        legend_left={"Per card (s)"}
        legend_right={"Total (s)"}
        totalDescriptor={"Seconds"}
    ></IntervalPie>
</GraphContainer>
<GraphContainer>
    <h1>Review Speed Trend</h1>
    <BarScrollable data={speed_trend_bar} bind:bins bind:binSize bind:offset={scroll} average />
</GraphContainer>
<GraphContainer>
    <h1>Introduced</h1>
    <BarScrollable data={introduced_bar} bind:bins bind:binSize bind:offset={scroll} />
</GraphContainer>
<GraphContainer>
    <h1>Forgotten</h1>
    <BarScrollable data={forgotten_bar} bind:bins bind:binSize bind:offset={scroll} />
    <span>Remaining forgotten cards: {remaining_forgotten.toLocaleString()}</span>
</GraphContainer>
<GraphContainer>
    <h1>{$burdenOrLoad} Trend</h1>
    <Candlestick data={burden_change_candlestick} bind:bins bind:binSize bind:offset={scroll} />
</GraphContainer>
