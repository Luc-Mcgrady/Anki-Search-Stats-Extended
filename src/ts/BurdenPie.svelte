<script lang="ts">
    import { i18n } from "./i18n"
    import IntervalGraph from "./IntervalGraph.svelte"

    export let intervals: Record<number, number> | null

    export let last: number = 21
    export let steps: number = 7

    let burdens: Record<number, number>
    $: {
        burdens = { ...intervals }
        Object.entries(burdens).forEach(([key, val]) => {
            const interval = +key
            // Treat interval 0 as interval 1 for load calculation (cards still need to be reviewed)
            burdens[interval] = val / Math.max(interval, 1)
        })
    }
</script>

<IntervalGraph
    bind:last
    bind:steps
    intervals={burdens}
    pieInfo={{
        totalDescriptor: i18n("total-load"),
        legend_left: i18n("intervals"),
        legend_right: i18n("load"),
    }}
></IntervalGraph>
