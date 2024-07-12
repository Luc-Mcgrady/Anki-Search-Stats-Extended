<script lang="ts">
    import { lab } from "d3"
    import type { BarChart } from "./bar"
    import Bar from "./Bar.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import type { Revlog } from "./search"

    export let revlog_data: Revlog[]
    let card_times: Record<number, number>
    let review_day_times: number[]
    let review_day_count: number[]
    //let card_counts: Record<number, number> = {}
    let revlog_times: number[]
    let speed_trend_bar: BarChart

    const day_ms = 1000 * 60 * 60 * 24

    $: {
        card_times = {}
        revlog_times = []
        review_day_times = []
        review_day_count = []

        for (const revlog of revlog_data) {
            card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

            const day = Math.floor(revlog.id / day_ms)

            review_day_times[day] = (review_day_times[day] ?? 0) + revlog.time
            review_day_count[day] = (review_day_count[day] ?? 0) + 1
            //card_counts[revlog.cid] = (card_times[revlog.cid] ?? 0) + 1
        }

        const today = Date.now() / day_ms
        const offset = 30

        review_day_times = review_day_times.splice(today - offset, today)
        review_day_count = review_day_count.splice(today - offset, today)

        console.log({ review_day_times, review_day_count })

        for (const card_time of Object.values(card_times)) {
            const key = Math.floor(card_time / 1000)
            revlog_times[key] = (revlog_times[key] ?? 0) + 1
        }

        speed_trend_bar = {
            row_colours: ["yellow"],
            row_labels: ["speed per card"],
            data: review_day_count.map((data, label) => ({
                label: (label - offset).toString(),
                values: [data],
            })),
        }
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
    <h1>Review speed trend</h1>
    <Bar data={speed_trend_bar}></Bar>
</GraphContainer>

<style>
    p {
        font-size: small;
        margin-top: 1em;
    }

    h1 {
        border-bottom: 1px var(--border) solid;
    }
</style>
