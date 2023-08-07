<script lang="ts">
    import { GraphsResponse } from "./proto/anki/stats_pb";
    import Graph from "./Graph.svelte"
    import Pie from "./Pie.svelte"
    import type {PieDatum} from "./pie"
    import _ from "lodash"
    import Rainbow from "rainbowvis.js"

    export let data: GraphsResponse 

    const gradient = new Rainbow()
    
    let step = 4;
    const steps = 6;
    
    const intervals = data.intervals!.intervals
    $: last = step*steps

    gradient.setNumberRange(0,steps + 1)
    gradient.setSpectrum("#74C476", "#31a354")

    let pie_data: PieDatum[]
    $: pie_data = 
        [..._.range(0,step*steps,step)
        .map((start,i)=>
            {
                const end = start+step

                const count=
                    _.range(start, end+1)
                    .reduce((n,j)=>n+(intervals[j] || 0))

                return {
                    label: `${start}-${end}`,
                    value: count,
                    colour: `#${gradient.colourAt(i)}`
                }
            }
        ), 
        { // The to infinity one
            label: `${last}-Infinity`,
            value: 
                Object.entries(intervals)
                .filter(([i, _])=>parseInt(i)>last)
                .reduce((n,[_, v])=>n+v, 0)
            ,
            colour: `#${gradient.colourAt(steps+1)}`
        }
    ]
    
</script>

<Graph>
    <h1>Interval Distribution</h1>
    <hr/>
    <Pie data={pie_data}></Pie>
    <label for="interval_pie_step"></label>
    <input type="number" id="interval_pie_step" bind:value={step}>
</Graph>