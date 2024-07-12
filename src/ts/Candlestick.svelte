<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickDatum } from "./Candlestick"

    let svg: SVGElement | null = null

    export let data: CandlestickDatum[]
    $: {
        if (svg && data.length) {
            const chart = plotCandlestick(data, svg as any)
        }
    }
</script>

<svg bind:this={svg}></svg>
