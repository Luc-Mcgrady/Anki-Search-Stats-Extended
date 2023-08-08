<script lang="ts">
    import { renderBarChart, type BarChart } from "./bar";

    let svg: SVGElement | null = null

    const chart: BarChart = {
        row_labels: ["test", "ahh"],
        row_colours: ["red", "blue"],
        data: [{
            values: [10, 0],
            label: "1"
        },
        {
            values: [20, 10],
            label: "2"
        }]
    }
    $: {
        if (svg)
            renderBarChart(chart,svg as any)
    }
</script>

<svg bind:this={svg}></svg>