<script lang="ts">
    import _ from "lodash";
    import { defaultGraphBounds } from "./graph";
    import { renderPie, type PieDatum } from "./pie";

    export let data: PieDatum[]
    export let legend_title = "Legend"
    let svg: SVGElement | null = null;

    const bounds = defaultGraphBounds()

    $: renderPie(data, svg as any, bounds.height/2)
    
</script>


<div class="root">
    <svg width={bounds.height} height={bounds.height}>
        <g transform={`translate(${bounds.height / 2},${bounds.height / 2})`} bind:this={svg}></g>
    </svg>

    <div style={`max-height:${bounds.height}px`} class="glossary">
        <table>
            <th>{legend_title}</th>
            {#each data as datum}
            <tr>
                <span style="color: {datum.colour};">■&nbsp;</span>
                {datum.label}: {_.round(datum.value, 2)}
            </tr>
            {/each}
        </table>
    </div>
</div>

<style>
    div.root {
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
 
    div.glossary {
        overflow-y: auto;
    }
</style>