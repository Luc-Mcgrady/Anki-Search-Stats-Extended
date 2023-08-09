<script lang="ts">
    import _ from "lodash";
    import { renderBarChart, type BarChart } from "./bar";

    let svg: SVGElement | null = null

    export let data : BarChart;
    $: {
        if (svg)
            renderBarChart(data,svg as any)
    }
</script>

<svg bind:this={svg}></svg>

<div class="glossary">
    {#each _.zip(data.row_labels, data.row_colours) as [label, colour] }
        <div>
            <span style={`color:${colour}`}>■&nbsp;</span> {label}
        </div>    
    {/each}
</div>

<style>
    div.glossary {
        display: flex;
        gap: 1em;
    }
</style>