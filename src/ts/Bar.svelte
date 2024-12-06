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

    let glossary: [string | undefined, string | undefined][]

    $: {
        glossary = _.zip(data.row_labels, data.row_colours)
        if (data.reverse_legend) glossary = glossary.reverse()
    }
</script>

{#if !data.data.length}
    <NoGraph></NoGraph>
{:else}
    <div class="glossary">
        {#each glossary as [label, colour]}
            <div>
                <span style={`color:${colour}`}>■&nbsp;</span>
                {label}
            </div>
        {/each}
    </div>
    <svg bind:this={svg}>
        <pattern
            id="stripe"
            patternUnits="userSpaceOnUse"
            width="10"
            height="10"
            patternTransform="rotate(45)"
        >
            <line x1="0" y="0" x2="0" y2="10" stroke="#921717" stroke-width="10" />
        </pattern>
    </svg>
{/if}

<style>
    div.glossary {
        display: flex;
        gap: 1em;
    }
</style>
