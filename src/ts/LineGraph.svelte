<script lang="ts">
    import { renderLineChart, type LineGraphData } from "./LineGraph"

    let svg: SVGElement | undefined

    export let label: string
    export let data: LineGraphData

    $: if (svg) renderLineChart(svg, data, label)
</script>

<svg bind:this={svg}></svg>
