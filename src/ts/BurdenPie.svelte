<script lang="ts">
    import { i18n } from "./i18n"
    import IntervalGraph from "./IntervalGraph.svelte"
    import { burdenOrLoad } from "./stores"

    export let intervals: Record<number, number> | null

    export let last: number = 21
    export let steps: number = 7

    let burdens: Record<number, number>
    $: {
        burdens = { ...intervals }
        Object.entries(burdens).forEach(([key, val]) => {
            burdens[+key] = val / +key
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
