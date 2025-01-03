<script lang="ts">
    import { SetDateInfinite } from "./bar"
    import LineGraph from "./LineGraph.svelte"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { catchErrors } from "./search"
    import { card_data, revlogs, searchLimit } from "./stores"

    let show = false
    let data: number[] | undefined = undefined

    $: if ($revlogs && $card_data && show)
        data = Array.from(
            catchErrors(() =>
                getMemorisedDays(
                    $revlogs,
                    $card_data,
                    SSEother.deck_configs,
                    SSEother.deck_config_ids
                )
            )
        )

    $: truncated = $searchLimit !== 0
</script>

{#if data}
    <LineOrCandlestick {data} />
{:else if !show}
    <NoGraph faded={false}>
        {#if !truncated}
            <button class="big" on:click={() => (show = true)}>Show?</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>Increase date range</button>
            <button on:click={() => (show = true)}>Show?</button>
        {/if}
    </NoGraph>
{:else}
    <NoGraph>Loading</NoGraph>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }
</style>
