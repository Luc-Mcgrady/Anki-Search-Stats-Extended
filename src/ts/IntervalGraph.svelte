<script lang="ts">
    import { onDestroy } from "svelte"
    import IntervalBar from "./IntervalBar.svelte"
    import type { IntervalPieInfo } from "./IntervalPie"
    import IntervalPie from "./IntervalPie.svelte"
    import NoGraph from "./NoGraph.svelte"
    import { graph_mode, include_suspended, zero_inclusive } from "./stores"
    export let include_suspended_option = true
    export let zero_inclusive_option = false
    export let intervals: Record<number, number> | null
    export let pieInfo: IntervalPieInfo = {}

    export let steps = 7 // For bar, scroll
    export let last = 21 // for bar, bar_size

    let pieSteps = steps
    let pieLast = last

    let barScroll = 0
    let barSize = 1

    $: {
        if ($graph_mode === "Pie") {
            pieLast = last
            pieSteps = steps
        } else {
            barScroll = steps
            barSize = last
        }
    }

    const unsubscibe = graph_mode.subscribe((mode) => {
        if (mode === "Bar") {
            steps = barScroll
            last = barSize
        } else {
            steps = pieSteps
            last = pieLast
        }
    })

    onDestroy(unsubscibe)
</script>

<div class="radio">
    <label>
        <input type="radio" bind:group={$graph_mode} value="Pie" />
        Pie
    </label>
    <label>
        <input type="radio" bind:group={$graph_mode} value="Bar" />
        Bar
    </label>
</div>
<div>
    {#if zero_inclusive_option && $graph_mode == "Pie"}
        <label class="checkbox">
            <input type="checkbox" bind:checked={$zero_inclusive} />
            Zero Inclusive
        </label>
    {/if}
    {#if include_suspended_option}
        <label class="checkbox">
            <input type="checkbox" bind:checked={$include_suspended} />
            Include suspended
        </label>
    {/if}
</div>
{#if intervals}
    {#if $graph_mode == "Pie"}
        <IntervalPie {intervals} {pieInfo} bind:last bind:steps></IntervalPie>
    {:else}
        <IntervalBar
            {intervals}
            {pieInfo}
            bind:binSize={last}
            bind:offset={steps}
            min={zero_inclusive_option ? 0 : 1}
        ></IntervalBar>
    {/if}
{:else}
    <NoGraph></NoGraph>
{/if}

<style>
    label.checkbox {
        user-select: none;
        display: block;
    }

    div.radio {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 1em;
    }
</style>
