<script lang="ts">
    import _, { values } from "lodash";
    import Bar from "./Bar.svelte"
    import type {BarChart, BarDatum} from "./bar"
    import type { GraphsResponse_FutureDue } from "./proto/anki/stats_pb";

    export let all : GraphsResponse_FutureDue
    export let mature : GraphsResponse_FutureDue
    export let learn : GraphsResponse_FutureDue
    export let relearn : GraphsResponse_FutureDue

    let bars: BarDatum[];
    $: {
        const len = Object.keys(all.futureDue).reduce((a, b) => a > parseInt(b) ? a : parseInt(b), 0)
        let newbars = _.range(0, len)
        bars = newbars.map(i=>({
            label: i.toString(),
            values: [0,0,0,0]
        }))

        console.log(bars, len)

        for (const day in all.futureDue) {

            const all_day = all.futureDue[day] ?? 0
            const mature_day = mature.futureDue[day] ?? 0 
            const relearn_day = relearn.futureDue[day] ?? 0
            const learn_day = (learn.futureDue[day] ?? 0) - relearn_day
            const young_day = all_day - learn_day - relearn_day - mature_day

            bars[parseInt(day)] = 
                {
                    label: day,
                    values: [mature_day, young_day, relearn_day, learn_day]
                }
            
        }

        bars = bars.slice(0, 30)
    }

    $: console.log("Due", bars)
</script>


<Bar data={{
    row_colours: ["#31a354", "#74c476", "#fb6a4a", "#fd8d3c"],
    row_labels: ["Mature", "Young", "Relearning", "Learning"],
    data: bars,
}}>
</Bar>