<script lang="ts">
    import { SetDateInfinite } from "./bar"
    import { i18n } from "./i18n"
    import NoGraph from "./NoGraph.svelte"
    import { searchLimit } from "./stores"

    export let badIfTruncated = false
    export let shown: boolean

    $: truncated = $searchLimit !== 0
    export let calculate: () => void
</script>

{#if !shown}
    <NoGraph faded={false}>
        {#if !badIfTruncated || !truncated}
            <button class="big" on:click={calculate}>{i18n("show-question")}</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>{i18n("increase-date-range")}</button>
            <button on:click={calculate}>{i18n("show-question")}</button>
        {/if}
    </NoGraph>
{:else}
    <NoGraph>{i18n("loading")}</NoGraph>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }
</style>
