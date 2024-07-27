<script lang="ts">
    import _ from "lodash"
    import Rainbow from "rainbowvis.js"
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { PieDatumFactory } from "./pie"
    import type { IntervalPieInfo } from "./IntervalPie"

    export let intervals: Record<number, number>
    export let steps = 7
    export let last = 21

    export let intervalPieInfo: IntervalPieInfo = {}

    $: ({
        legend_left = "Intervals",
        legend_right = "Cards",
        countDescriptor = "Last Day",
        totalDescriptor = "Cards",
        spectrumFrom = "#74C476",
        spectrumTo = "#014720",
        fillerColour = "gold",
    } = intervalPieInfo)

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

    $: min =
        _.min(
            Object.keys(intervals)
                .filter((k) => k !== undefined)
                .map(parseInt)
        ) ?? 1

    $: step = Math.floor((last - min + 1) / steps)
    $: realLast = steps * step + min - 1

    const gradient = new Rainbow()

    $: {
        gradient.setNumberRange(0, steps + 1)
        gradient.setSpectrum(spectrumFrom, spectrumTo)
    }

    let pie_data: PieDatum[]
    $: {
        pie_data = _.range(min, realLast + 1, step).map((start, i) => {
            let end = start + step
            if (end > last && last != realLast) {
                end = realLast
            }

            const count = _.range(start, end).reduce((n, j) => n + (intervals[j] || 0), 0)

            return PieDatumFactory(start, end - 1, count, `#${gradient.colourAt(i)}`)
        })

        if (realLast < last) {
            const filler_start = realLast + 1
            const filler_end = last
            const filler_pie_slice = Object.entries(intervals)
                .filter(([i, _]) => parseInt(i) >= filler_start && parseInt(i) <= filler_end)
                .reduce((n, [_, v]) => n + v, 0)

            pie_data.push(
                PieDatumFactory(filler_start, filler_end, filler_pie_slice, fillerColour ?? "gold")
            )
        }
        const infinite_pie_start = last + 1

        const infinite_pie_slice = Object.entries(intervals)
            .filter(([i, _]) => parseInt(i) >= infinite_pie_start)
            .reduce((n, [_, v]) => n + v, 0)

        pie_data.push(PieDatumFactory(infinite_pie_start, "Infinity", infinite_pie_slice, "grey"))
    }

    $: pie_values = Object.values(pie_data).map((d) => d.value)
</script>

<div class="options">
    <label>
        {countDescriptor}
        <input type="number" bind:value={last} />
    </label>
    <label>
        Steps
        <input type="number" bind:value={steps} />
    </label>
</div>
<slot />
<br />
<Pie data={pie_data} {legend_left} {legend_right}></Pie>

<div class="totals">
    <span>Total {totalDescriptor ?? "Cards"} {"<="} {last}:</span>
    <span>{_.round(_.sum(pie_values.slice(0, -1)), 2).toLocaleString()}</span>
    <span>Total {totalDescriptor}:</span>
    <span>{_.round(_.sum(pie_values), 2).toLocaleString()}</span>
</div>

<style>
    div.options {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em 1em;
        align-items: baseline;
    }

    div.totals {
        display: grid;
        grid-template-columns: auto auto;
        justify-content: start;
        justify-items: start;
        gap: 0 1em;
    }

    span {
        text-align: center;
    }

    label {
        display: contents;
    }
</style>
