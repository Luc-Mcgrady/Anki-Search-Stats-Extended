<script lang="ts">
    import { renderLineChart } from "./LineGraph"
    import { clearChart } from "./graph"

    let svg: SVGElement | undefined

    export let label: string
    export let data: number[]
    export let filter_zeros = true

    $: if (svg) {
        clearChart(svg)
        renderLineChart(svg, data, label, filter_zeros)
    }
</script>

<svg bind:this={svg}></svg>
