<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickDatum, type CandlestickGraph } from "./Candlestick"
    import { bin } from "d3"

    let svg: SVGElement | null = null

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let data: CandlestickGraph

    $: realOffset = -Math.abs(offset)

    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(-(bins * binSize) + realOffset, realOffset - 1)

    let bars: CandlestickDatum[]
    $: {
        bars = []
        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            if (i % binSize == 0) {
                bars[newIndex] = { ...bar }
            } else {
                bars[newIndex].delta += bar.delta
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
