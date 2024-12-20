<script lang="ts">
    import { barDateLabeler } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { calcTimePerReview } from "./dayTimings"
    import type { GraphsResponse_ReviewCountsAndTimes } from "./proto/anki/stats_pb"
    import { today } from "./revlogGraphs"
    import { searchLimit } from "./stores"
    import TrendValue from "./TrendValue.svelte"

    export let data: GraphsResponse_ReviewCountsAndTimes | undefined
    $: time_spent = data ? calcTimePerReview(data) : []

    let offset = 0

    $: bar = {
        row_colours: ["#fcba03"],
        row_labels: ["Time Spent Per Review (s)"],
        data: Array.from(time_spent).map((data, i) => ({
            label: (i - today).toString(),
            values: [data],
        })),
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }

    $: console.log({ time_spent, data, bar })

    $: limit = -1 - $searchLimit
</script>

<BarScrollable
    data={bar}
    bind:offset
    average
    {limit}
    trend
    trend_info={{
        x: "day",
        y: "average second",
    }}
/>
