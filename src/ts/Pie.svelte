<script lang="ts">
    import _ from "lodash"
    import { defaultGraphBounds } from "./graph"
    import { renderPie, type PieDatum } from "./pie"

    export let data: PieDatum[]
    let svg: SVGElement | null = null

    const bounds = defaultGraphBounds()
    export let legend_left = ""
    export let legend_right = ""

    $: renderPie(data, svg as any, bounds.height / 2)
</script>

<div class="root">
    <svg width={bounds.height} height={bounds.height}>
        <g transform={`translate(${bounds.height / 2},${bounds.height / 2})`} bind:this={svg}></g>
    </svg>

    <div style:max-height={`${bounds.height}px`} class="glossary">
        <div class="grid">
            <span></span>
            <span>{legend_left}:</span>
            <span>{legend_right}</span>
            {#each data as datum}
                <span style:color={datum.colour} class="colour">■&nbsp;</span>
                <span>{datum.label}:</span>
                <span>{_.round(datum.value, 2)}</span>
            {/each}
        </div>
    </div>
</div>

<style>
    div.root {
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    div.grid {
        display: grid;
        grid-template-columns: auto auto auto;
        gap: 0 1em;
    }

    span.colour {
        margin-right: -1em;
    }

    div.glossary {
        overflow-y: auto;
    }
</style>
