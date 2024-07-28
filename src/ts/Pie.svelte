<script lang="ts">
    import _ from "lodash"
    import { defaultGraphBounds } from "./graph"
    import { renderPie, type PieDatum } from "./pie"

    export let data: PieDatum[]
    let svg: SVGElement | null = null

    const bounds = defaultGraphBounds()
    export let legend_left = ""
    export let legend_right = ""
    export let percentage = false

    $: total = _.sumBy(data, (d) => d.value)

    const diameter = 250

    $: renderPie(data, svg as any, diameter / 2)
</script>

<div class="root">
    <svg width={diameter} height={diameter}>
        <g transform={`translate(${diameter / 2},${diameter / 2})`} bind:this={svg}></g>
    </svg>

    <div style:max-height={`${diameter}px`} class="glossary">
        <div
            class="grid"
            style:grid-template-columns={percentage ? "auto auto auto auto" : undefined}
        >
            <span></span>
            <span>{legend_left}:</span>
            <span>{legend_right}</span>
            {#if percentage}
                %
            {/if}
            {#each data as datum}
                <span style:color={datum.colour} class="colour">■&nbsp;</span>
                <span>{datum.label}:</span>
                <span>{_.round(datum.value, 2).toLocaleString()}</span>
                {#if percentage}
                    {_.round((100 * datum.value) / total, 2)}%
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    div.root {
        margin: 1em 0;
        display: grid;
        grid-template-columns: auto auto;
        justify-items: center;
        gap: 1em;
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
