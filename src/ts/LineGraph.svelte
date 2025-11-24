<script lang="ts">
    import { renderLineChart } from "./LineGraph"
    import * as d3 from "d3"

    let svg: SVGElement | undefined

    export let label: string
    export let data: number[]

    $: if (svg) {
        d3.select(svg).selectAll("*").remove()
        renderLineChart(svg, data, label)
    }
</script>

<svg bind:this={svg}></svg>
