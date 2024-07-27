<script lang="ts">
    import _ from "lodash"
    import { renderBarChart, type BarChart, type ExtraRenderInput } from "./bar"
    import NoGraph from "./NoGraph.svelte"

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

{#if !data.data.length}
    <NoGraph></NoGraph>
{:else}
    <div class="glossary">
        {#each _.zip(data.row_labels, data.row_colours) as [label, colour]}
            <div>
                <span style={`color:${colour}`}>■&nbsp;</span>
                {label}
            </div>
        {/each}
    </div>
    <svg bind:this={svg}></svg>
{/if}

<style>
    div.glossary {
        display: flex;
        gap: 1em;
    }
</style>
