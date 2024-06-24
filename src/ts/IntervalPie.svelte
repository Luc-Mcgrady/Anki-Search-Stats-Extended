<script lang="ts">
    import _ from "lodash";
    import Rainbow from "rainbowvis.js";
    import Pie from "./Pie.svelte";
    import type { PieDatum } from "./pie";
    import { PieDatumFactory } from "./pie";

    export let intervals : Record<number, number>
    export let legend_title = "Intervals: Cards"
    export let countDescriptor = "Last Day"

    let steps = 7;
    let last = 21;
    
    $: {
        if (steps < 1) {
            steps = 1
        }
    }
    $: {
        if (last < 0) {
            last = 0
        }
    }

    $: min = _.min(Object.keys(intervals).filter(k=>k!==undefined).map(parseInt)) ?? 1

    $: step = Math.floor((last - min + 1) / steps);
    $: realLast = steps * step

    const gradient = new Rainbow()

    export let spectrumFrom = "#74C476"
    export let spectrumTo = "#014720"

    $ : {
        gradient.setNumberRange(0,steps + 1)
        gradient.setSpectrum(spectrumFrom, spectrumTo)
    }

    let pie_data: PieDatum[]
    $: {
        pie_data = _.range(min,step*steps,step)
        .map((start,i)=>
            {
                let end = start + step
                if (end > last && last != realLast) {
                    end = realLast
                }

                const count=
                    _.range(start, end)
                    .reduce((n,j)=>n+(intervals[j] || 0), 0)

                return PieDatumFactory(start, end-1, count, `#${gradient.colourAt(i)}`)
            }
        )
        
        if (realLast < last) {
            const filler_start = realLast+min
            const filler_end = last+min-1
            const filler_pie_slice = Object.entries(intervals)
                .filter(([i, _])=>parseInt(i)>=filler_start && parseInt(i)<=filler_end)
                .reduce((n,[_, v])=>n+v, 0)

            pie_data.push(PieDatumFactory(filler_start, filler_end, filler_pie_slice, "gold"))
        }

        const infinite_pie_slice = Object.entries(intervals)
            .filter(([i, _])=>parseInt(i)>last)
            .reduce((n,[_, v])=>n+v, 0)

        pie_data.push(PieDatumFactory(last+min, "Infinity", infinite_pie_slice, "grey"))
    }

    $: pie_values =  Object.values(pie_data).map(d=>d.value)
</script>


<div>
    <label for="interval_pie_last">{countDescriptor}</label>
    <input type="number" id="interval_pie_last" bind:value={last}><br/>
    <label for="interval_pie_step">Steps</label>
    <input type="number" id="interval_pie_step" bind:value={steps}>
</div>
<br>
<Pie data={pie_data} {legend_title}></Pie>

<span>{`Total <${last} = ${
    _.round(_.sum(pie_values.slice(0,-1)), 2)}`
        } <!--Removes the end if not a value--> 
    </span><br>
<span>Total = {_.round(_.sum(pie_values), 2)}</span>

<style>
    div {
        display: grid;
        grid-template-rows: auto auto;
    }

    span {
        text-align: center;
    }
</style>