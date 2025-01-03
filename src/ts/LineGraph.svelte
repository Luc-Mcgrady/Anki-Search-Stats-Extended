<script lang="ts">
    import { renderLineChart } from "./LineGraph"

    let svg: SVGElement | undefined

    export let data: number[]

    $: if (svg) renderLineChart(svg, data)
</script>

<svg bind:this={svg}></svg>
