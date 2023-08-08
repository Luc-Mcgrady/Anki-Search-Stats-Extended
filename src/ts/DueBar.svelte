<script lang="ts">
    import Bar from "./Bar.svelte"
    import type {BarChart, BarDatum} from "./bar"
    import type { GraphsResponse_FutureDue } from "./proto/anki/stats_pb";

    export let all : GraphsResponse_FutureDue
    $: mature = Object.entries(all.futureDue).slice(0,30).map(([key,val]) => {
        return {
            label: key,
            values: [val]
        }
    })
    $: console.log("Due", mature)
</script>


<Bar data={{
    row_colours: ["#31a354", "#74c476", "#fb6a4a" ,"#fd8d3c"],
    row_labels: ["Mature", "Young", "Relearning", "Learning"],
    data: mature,
}}>
</Bar>