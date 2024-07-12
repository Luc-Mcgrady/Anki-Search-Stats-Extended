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
        revlog_times[card_time] = (revlog_times[card_time] ?? 0) + 1
    }

    console.log({ revlog_data, card_times, revlog_times })
</script>

<GraphContainer>
    <IntervalPie intervals={revlog_times}></IntervalPie>
</GraphContainer>
