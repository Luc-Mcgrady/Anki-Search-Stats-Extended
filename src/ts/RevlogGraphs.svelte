<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import type { Revlog } from "./search"

    export let revlog_data: Revlog[]
    let card_times: Record<number, number> = {}
    let card_counts: Record<number, number> = {}
    let revlog_times: number[] = []

    for (const revlog of revlog_data) {
        card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time
        //card_counts[revlog.cid] = (card_times[revlog.cid] ?? 0) + 1
    }

    for (const card_time of Object.values(card_times)) {
        const key = Math.floor(card_time / 1000)
        revlog_times[key] = (revlog_times[key] ?? 0) + 1
    }

    console.log({ revlog_data, card_times, revlog_times })
</script>

<GraphContainer>
    <h1>Time Distribution</h1>
    <IntervalPie
        intervals={revlog_times}
        spectrumFrom={"#fcba03"}
        spectrumTo={"#543e00"}
        totalDescriptor={""}
        last={60}
        legend_left={"Time (s)"}
    ></IntervalPie>
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
