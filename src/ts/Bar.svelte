<script lang="ts">
    import { renderBarChart, type BarChart } from "./bar";

    let svg: SVGElement | null = null

    const chart: BarChart = {
        row_labels: ["test"],
        row_colours: ["red"],
        data: [{
            values: {test: 10},
            label: "1"
        },
        {
            values: {test: 20},
            label: "1"
        }]
    }
    $: {
        if (svg)
            renderBarChart(chart,svg as any)
    }
</script>

<svg bind:this={svg}></svg>