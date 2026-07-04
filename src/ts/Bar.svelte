<script lang="ts">
    import _ from "lodash"
    import { renderBarChart, type BarChart, type ExtraRenderInput } from "./bar"
    import NoGraph from "./NoGraph.svelte"

    let svg: SVGElement | null = null
    export let extraRender = (chart: ExtraRenderInput<BarChart>) => {}

    function render() {
        if (svg && data.data.length) {
            const chart = renderBarChart(data, svg as any)
            extraRender(chart)
        }
    }

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

    function glossaryClick(i: number) {
        if (data.hidden_rows) {
            if (data.hidden_rows.has(i)) {
                data.hidden_rows.delete(i)
            } else {
                data.hidden_rows.add(i)
            }
        }
        data = { ...data }
    }

    let hidable = data.hidden_rows !== undefined
</script>

{#if !data.data.length}
    <NoGraph></NoGraph>
{:else}
    <div class="glossary">
        {#each glossary as [label, colour], i}
            {#if hidable}
                <button on:click={() => glossaryClick(i)}>
                    <div style={`opacity:${data.hidden_rows?.has(i) ? 0.5 : 1}`}>
                        <span style={`color:${colour}`}>■&nbsp;</span>
                        {label}
                    </div>
                </button>
            {:else}
                <div>
                    <span style={`color:${colour}`}>■&nbsp;</span>
                    {label}
                </div>
            {/if}
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

    button {
        margin: 0;
        padding: 0;
        border: none;
        background: none;
        display: contents;
    }
</style>
