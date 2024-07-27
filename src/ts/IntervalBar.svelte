<script lang="ts">
    import _ from "lodash"
    import type { BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import type { IntervalPieInfo } from "./IntervalPie"
    import { YOUNG_COLOUR } from "./graph"

    export let intervals: Record<number, number>
    export let pieInfo: IntervalPieInfo = {}

    export let binSize = 1
    export let offset = 0

    let interval_array: number[] = []
    $: {
        interval_array = []

        for (const [i, val] of Object.entries(intervals)) {
            interval_array[parseInt(i)] = val
        }
    }

    let bar_data: BarChart
    $: bar_data = {
        row_labels: [pieInfo.legend_right ?? "Cards"],
        row_colours: [pieInfo.spectrumFrom ?? YOUNG_COLOUR],
        data: Array.from(interval_array).map((val, i) => ({
            values: [val ?? 0],
            label: i.toString(),
        })),
    }
</script>

<BarScrollable data={bar_data} bind:binSize bind:offset left_aligned></BarScrollable>
