<script lang="ts">
    import _ from "lodash"
    import type { BarChart, BarDatum, ExtraRenderInput } from "./bar"
    import Bar from "./Bar.svelte"

    export let data: BarChart
    export let extraRender = (chart: ExtraRenderInput) => {}

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let average = false
    export let left_aligned = false

    $: realOffset = left_aligned
        ? Math.abs(offset) - data.data.length + bins * binSize + 1
        : -Math.abs(offset)

    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(
        -(bins * binSize) + realOffset,
        realOffset == 0 ? undefined : realOffset
    )

    let bars: BarDatum[]
    $: {
        bars = []
        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            if (!bars[newIndex]?.values) {
                bars[newIndex] = { ...bar, values: bar.values.map((a) => a || 0) }
            } else {
                bars[newIndex].values = bars[newIndex].values.map(
                    (a, i) => a + (bar?.values[i] || 0)
                )
            }
        }
        if (average) {
            bars.map((bar, i) => {
                const count = seperate_bars
                    .slice(i * binSize, (i + 1) * binSize)
                    .reduce((p, n) => p + (_.sum(n.values) > 0 ? 1 : 0), 0)

                bar.values = bar.values.map((a) => a / (count || 1))
            })
        }
    }
</script>

<div class="options">
    <label>
        Bar Width
        <input type="number" bind:value={binSize} />
    </label>
    <label>
        Scroll
        <input type="number" bind:value={offset} step={binSize} />
    </label>
</div>

<Bar data={{ ...data, data: bars, barWidth: binSize }} {extraRender}></Bar>
