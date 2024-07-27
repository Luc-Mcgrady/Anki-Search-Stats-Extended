<script lang="ts">
    import type { IntervalPieInfo } from "./IntervalPie"
    import IntervalPie from "./IntervalPie.svelte"
    import NoGraph from "./NoGraph.svelte"
    import { include_suspended } from "./stores"
    export let include_suspended_option = true
    export let intervals: Record<number, number> | null
    export let pieInfo: IntervalPieInfo = {}

    export let steps = 7
    export let last = 21
</script>

{#if include_suspended_option}
    <label class="checkbox include-suspended">
        <input type="checkbox" bind:checked={$include_suspended} />
        Include suspended
    </label>
{/if}
{#if intervals}
    <IntervalPie {intervals} intervalPieInfo={pieInfo} bind:last bind:steps></IntervalPie>
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
