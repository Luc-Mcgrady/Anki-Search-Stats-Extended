<script lang="ts">
    import _ from "lodash"
    import { renderBarChart, type BarChart, type ExtraRenderInput } from "./bar"

    let svg: SVGElement | null = null
    export let extraRender = (chart: ExtraRenderInput) => {}

    export let data: BarChart
    $: {
        if (svg && data.data.length) {
            const chart = renderBarChart(data, svg as any)
            extraRender(chart)
        }
    }
</script>

<svg bind:this={svg}></svg>

{#if !data.data.length}
    No data
{/if}

<div class="glossary">
    {#each _.zip(data.row_labels, data.row_colours) as [label, colour]}
        <div>
            <span style={`color:${colour}`}>■&nbsp;</span>
            {label}
        </div>
    {/each}
</div>

<style>
    div.glossary {
        display: flex;
        gap: 1em;
    }
    svg {
        max-height: 70vh;
    }
</style>
