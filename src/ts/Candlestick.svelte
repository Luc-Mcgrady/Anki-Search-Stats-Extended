<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickDatum, type CandlestickGraph } from "./Candlestick"

    let svg: SVGElement | null = null

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let data: CandlestickGraph

    $: realOffset = Math.abs(offset)

    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(
        -(bins * binSize) - realOffset,
        realOffset == 0 ? undefined : -realOffset
    )

    let bars: CandlestickDatum[]
    $: {
        bars = []
        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            if (!bars[newIndex]?.delta) {
                bars[newIndex] = { ...bar }
            } else {
                bars[newIndex].delta += bar.delta || 0
            }
        }
    }

    $: {
        if (svg && data.data.length) {
            const chart = plotCandlestick({ ...data, data: bars, bar_width: binSize }, svg as any)
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
    svg {
        max-height: 70vh;
    }

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
