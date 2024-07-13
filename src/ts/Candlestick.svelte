<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickGraph } from "./Candlestick"

    let svg: SVGElement | null = null

    export let data: CandlestickGraph
    $: {
        if (svg && data.data.length) {
            const chart = plotCandlestick(data, svg as any)
        }
    }
</script>

<svg bind:this={svg}></svg>
