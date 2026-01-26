<script lang="ts">
    import { renderLineChart } from "./LineGraph"

    let svg: SVGElement | undefined

    export let label: string
    export let data: number[]

    $: if (svg) {
        renderLineChart(svg, data, label)
    }
</script>

<svg bind:this={svg}></svg>
