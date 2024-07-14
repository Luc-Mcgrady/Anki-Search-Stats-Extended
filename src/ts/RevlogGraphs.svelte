<script lang="ts">
    import Bar from "./Bar.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import type { Revlog } from "./search"
    import { burdenOrLoad } from "./stores"
    import { type CandlestickDatum, type CandlestickGraph } from "./Candlestick"
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

    const day_ms = 1000 * 60 * 60 * 24

    $: {
        revlog_times = []
        review_day_times = []
        review_day_count = []
        introduced_day_count = []
        reintroduced_day_count = []
        let card_times: Record<number, number> = {}
        let introduced = new Set<number>()
        let reintroduced = new Set<number>()
        let interval_change: Record<number, number>[] = []
        let day_forgotten: number[] = []
        let last_cids: Record<number, Revlog> = {}
        let introduced_day_total_count: number[]

        for (const revlog of revlog_data) {
            card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

            const day = Math.floor(revlog.id / day_ms)

            review_day_times[day] = (review_day_times[day] ?? 0) + revlog.time
            review_day_count[day] = (review_day_count[day] ?? 0) + 1

            if (revlog.ease == 0 && revlog.ivl == 0) {
                introduced.delete(revlog.cid)
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
    }

    const today = Math.floor(Date.now() / day_ms)
    let bins = 30
    let binSize = 1
    let offset = 30
    let scrollOffset = bins * binSize
    const start = today - offset

    $: review_day_times = review_day_times.splice(start, today)
    $: review_day_count = review_day_count.splice(start, today)

    $: burden_start = _.sum(burden_change.slice(0, start))
    $: burden_change_window = Array.from(burden_change.splice(start, today)).map((v) => v ?? 0)

    $: speed_trend_bar = {
        row_colours: ["#fcba03"],
        row_labels: ["Speed Per Review (s)"],
        data: Array.from(review_day_count).map((data, i) => ({
            label: (i - offset).toString(),
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

    $: burden_change_candlestick = {
        start: burden_start,
        data: burden_change_window.map((delta, i) => ({
            label: (i - offset).toString(),
            delta,
        })),
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
    <Bar data={speed_trend_bar}></Bar>
</GraphContainer>
<GraphContainer>
    <h1>Introduced</h1>
    <BarScrollable data={introduced_bar} bind:bins bind:binSize />
</GraphContainer>
<GraphContainer>
    <h1>{$burdenOrLoad} Trend</h1>
    <Candlestick data={burden_change_candlestick}></Candlestick>
</GraphContainer>
