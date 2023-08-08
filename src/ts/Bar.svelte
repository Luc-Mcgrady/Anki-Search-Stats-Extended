<script lang="ts">
    import { renderBarChart, type BarChart } from "./bar";

    let svg: SVGElement | null = null

    export let data : BarChart;
    $: {
        if (svg)
            renderBarChart(data,svg as any)
    }
</script>

<svg bind:this={svg}></svg>