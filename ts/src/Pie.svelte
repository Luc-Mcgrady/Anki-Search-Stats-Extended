<script lang="ts">
    import Graph from "./Graph.svelte";
    import { defaultGraphBounds } from "./graph";
    import { renderPie, type PieDatum } from "./pie";

    export let data: PieDatum[]
    let svg: SVGElement | null = null;

    const bounds = defaultGraphBounds()

    $: {
        renderPie(data, svg as any, bounds.height/2)
        console.log(svg)
    }
</script>


<div class="root">
    <svg width={bounds.width} height={bounds.height}>
        <g transform={`translate(${bounds.width / 2},${bounds.height / 2})`} bind:this={svg}></g>
    </svg>

    <div style={`max-height:${bounds.height}px`} class="glossary">
        <table>
            {#each data as datum}
            <tr>
                <span style="color: {datum.colour};">■&nbsp;</span>
                {datum.label}: {datum.value}
            </tr>
            {/each}
        </table>
    </div>
</div>

<style>
    div.root {
        display: flex;
        align-items: center;
    }
 
    div.glossary {
        overflow-y: auto;
    }
</style>