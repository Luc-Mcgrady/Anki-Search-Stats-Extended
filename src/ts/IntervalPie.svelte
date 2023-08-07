<script lang="ts">
    import { GraphsResponse } from "./proto/anki/stats_pb";
    import GraphContainer from "./Graph.svelte"
    import Pie from "./Pie.svelte"
    import type {PieDatum} from "./pie"
    import _ from "lodash"
    import Rainbow from "rainbowvis.js"

    export let data: GraphsResponse 

    
    let steps = 4;
    let last = 21;
    
    $: step = Math.ceil(last / steps);
    $: realLast = steps * step
    
    const intervals = data.intervals!.intervals

    const gradient = new Rainbow()

    $ : {
        gradient.setNumberRange(0,steps + 1)
        gradient.setSpectrum("#74C476", "#014720")
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
            label: `${realLast}-Infinity`,
            value: 
                Object.entries(intervals)
                .filter(([i, _])=>parseInt(i)>realLast)
                .reduce((n,[_, v])=>n+v, 0)
            ,
            colour: "grey"
        }
    ]
    
</script>

<GraphContainer>
    <h1>Interval Distribution</h1>
    <hr/>
    <div>
        <label for="interval_pie_last">Last Day</label>
        <input type="number" id="interval_pie_last" bind:value={last}><br/>
        <label for="interval_pie_step">Steps</label>
        <input type="number" id="interval_pie_step" bind:value={steps}>
    </div>
    <br>
    <Pie data={pie_data}></Pie>
</GraphContainer>

<style>
    div {
        display: grid;
        grid-template-rows: auto auto;
    }
</style>