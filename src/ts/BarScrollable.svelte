<script lang="ts">
    import _ from "lodash"
    import type { BarChart, BarDatum, ExtraRenderInput } from "./bar"
    import Bar from "./Bar.svelte"

    export let data: BarChart
    export let extraRender = (chart: ExtraRenderInput) => {}

    export let binSize = 1
    export let offset = 0
    export let bins = 30

    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(-(bins * binSize) + offset, offset - 1)

    let bars: BarDatum[]
    $: {
        bars = []
        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            if (i % binSize == 0) {
                bars[newIndex] = { ...bar, values: [...bar.values] }
            } else {
                bars[newIndex].values = bars[newIndex].values.map((a, i) => a + bar?.values[i] ?? 0)
            }
        }
        console.log({ bars, seperate_bars })
    }
</script>

<div class="options">
    <label>
        Bar Width
        <input type="number" bind:value={binSize} />
    </label>
    <label>
        Scroll
        <input type="number" bind:value={offset} />
    </label>
</div>

<Bar data={{ ...data, data: bars, barWidth: binSize }} {extraRender}></Bar>
