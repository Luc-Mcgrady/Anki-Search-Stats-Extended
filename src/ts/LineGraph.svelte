<script lang="ts">
    import { renderLineChart } from "./LineGraph"

    let svg: SVGElement | undefined

    export let data: number[]
    export let scroll: number
    export let zoom: number

    $: if (svg) renderLineChart(svg, data, scroll, zoom)
</script>

<svg bind:this={svg}></svg>
