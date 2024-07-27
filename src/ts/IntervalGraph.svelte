<script lang="ts">
    import { onDestroy } from "svelte"
    import IntervalBar from "./IntervalBar.svelte"
    import type { IntervalPieInfo } from "./IntervalPie"
    import IntervalPie from "./IntervalPie.svelte"
    import NoGraph from "./NoGraph.svelte"
    import { graph_mode, include_suspended } from "./stores"
    export let include_suspended_option = true
    export let intervals: Record<number, number> | null
    export let pieInfo: IntervalPieInfo = {}

    export let steps = 7 // For bar, scroll
    export let last = 21 // for bar, bar_size

    let returnSteps = steps
    let returnLast = last

    $: {
        if ($graph_mode === "Pie") {
            returnLast = last
            returnSteps = steps
        }
    }

    const unsubscibe = graph_mode.subscribe((mode) => {
        if (mode === "Bar") {
            steps = 0
            last = 1
        } else {
            steps = returnSteps
            last = returnLast
        }
    })

    onDestroy(unsubscibe)
</script>

<div>
    <label>
        Pie
        <input type="radio" bind:group={$graph_mode} value="Pie" />
    </label>
    <label>
        Bar
        <input type="radio" bind:group={$graph_mode} value="Bar" />
    </label>
</div>
{#if include_suspended_option}
    <label class="checkbox include-suspended">
        <input type="checkbox" bind:checked={$include_suspended} />
        Include suspended
    </label>
{/if}
{#if intervals}
    {#if $graph_mode == "Pie"}
        <IntervalPie {intervals} {pieInfo} bind:last bind:steps></IntervalPie>
    {:else}
        <IntervalBar {intervals} {pieInfo} bind:binSize={last} bind:offset={steps}></IntervalBar>
    {/if}
{:else}
    <NoGraph></NoGraph>
{/if}

<style>
    label.checkbox {
        user-select: none;
    }

    label.include-suspended {
        display: block;
        margin-top: 0.5em;
    }
</style>
