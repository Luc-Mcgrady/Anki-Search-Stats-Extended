<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickDatum, type CandlestickGraph } from "./Candlestick"
    import { limit_area_width, limitArea } from "./bar"

    let svg: SVGElement | null = null

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let data: CandlestickGraph
    export let limit = 0

    $: realOffset = -Math.abs(offset)

    $: leftmost = -(bins * binSize) + realOffset
    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(leftmost, realOffset == 0 ? undefined : realOffset)

    let bars: CandlestickDatum[]
    $: {
        bars = _.range(leftmost, realOffset, binSize).map((i) => ({
            label: (i + 1).toString(), // I have no idea if +1 is right but at least its consistent with the other graphs
            delta: 0,
        }))

        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            bars[newIndex].delta += bar.delta || 0
        }
    }

    $: {
        if (svg && data.data.length) {
            const chart = plotCandlestick({ ...data, data: bars, bar_width: binSize }, svg as any)

            limitArea(chart, limit_area_width(chart.x, limit, offset, binSize, 1))
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

<svg bind:this={svg}></svg>

<style>
    div.options {
        display: grid;
        grid-template-columns: auto 1fr auto 1fr;
        grid-template-areas: "a a b b";
        gap: 0.5em;
        align-items: baseline;
    }

    label {
        display: contents;
    }

    input {
        min-width: 5em;
    }
</style>
