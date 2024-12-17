<script lang="ts">
    import type { BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { card_data, revlogs } from "./stores"

    let show = true
    let data: BarChart

    $: if ($revlogs && $card_data && show)
        data = {
            row_labels: ["MEm"],
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
        }
</script>

{#if data}
    <BarScrollable {data} average />
{:else if !show}
    <NoGraph>Show?</NoGraph>
{:else}
    <NoGraph>Loading</NoGraph>
{/if}
