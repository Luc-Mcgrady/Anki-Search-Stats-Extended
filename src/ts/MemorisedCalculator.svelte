<script lang="ts">
    import { SetDateInfinite } from "./bar"
    import { i18n } from "./i18n"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { catchErrors } from "./search"
    import { card_data, memorised_stats, revlogs, searchLimit } from "./stores"
    $: truncated = $searchLimit !== 0
    let show = false

    $: if ($revlogs && $card_data && show) {
        $memorised_stats = catchErrors(() =>
            getMemorisedDays(
                $revlogs,
                $card_data,
                SSEother.deck_configs,
                SSEother.deck_config_ids,
                2,
                2
            )
        )
    }
</script>

{#if !show}
    <NoGraph faded={false}>
        {#if !truncated}
            <button class="big" on:click={() => (show = true)}>{i18n("show-question")}</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>{i18n("increase-date-range")}</button>
            <button on:click={() => (show = true)}>{i18n("show-question")}</button>
        {/if}
    </NoGraph>
{:else if !memorised_stats}
    <NoGraph>{i18n("loading")}</NoGraph>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }
</style>
