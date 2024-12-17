<script lang="ts">
    import type { BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { card_data, revlogs, searchLimit } from "./stores"
    import Warning from "./Warning.svelte"

    let show = false
    let data: BarChart

    $: if ($revlogs && $card_data && show) {
        data = {
            row_labels: ["Memorised"],
            row_colours: ["blue"],
            data: Array.from(
                getMemorisedDays(
                    $revlogs,
                    $card_data,
                    SSEother.deck_configs,
                    SSEother.deck_config_ids
                )
            ).map((stab, i) => ({
                label: i.toString(),
                values: [stab],
            })),
            tick_spacing: 5,
        }
    }

    $: truncated = $searchLimit !== 0 // TODO move this into stores.ts
</script>

{#if data}
    <BarScrollable {data} average />
{:else if !show}
    <NoGraph>
        <button on:click={() => (show = true)}>Show?</button>
    </NoGraph>
    {#if truncated}
        <Warning>It is heavily advised you use "All history" for this graph</Warning>
        <br />
        <Warning>
            This graph re-simulates your review history, leaving the beginning out can greatly
            affect the results.
        </Warning>
    {/if}
{:else}
    <NoGraph>Loading</NoGraph>
{/if}
