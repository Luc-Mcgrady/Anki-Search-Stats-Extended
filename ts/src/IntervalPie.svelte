<script lang="ts">
    import { GraphsResponse } from "./proto/anki/stats_pb";
    import Graph from "./Graph.svelte"
    import Pie from "./Pie.svelte"
    import type {PieDatum} from "./pie"
    import _ from "lodash"
    import Rainbow from "rainbowvis.js"

    export let data: GraphsResponse 

    
    let step = 6;
    let steps = 4;
    
    const intervals = data.intervals!.intervals
    $: last = step*steps

    const gradient = new Rainbow()

    $ : {
        gradient.setNumberRange(0,steps + 1)
        gradient.setSpectrum("#74C476", "#31a354")
    }

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
    <div>
        <label for="interval_pie_step">Days per step</label>
        <input type="number" id="interval_pie_step" bind:value={step}><br/>
        <label for="interval_pie_step">Steps</label>
        <input type="number" id="interval_pie_step" bind:value={steps}>
    </div>
</Graph>

<style>
    div {
        display: grid;
        grid-template-rows: auto auto;
    }
</style>