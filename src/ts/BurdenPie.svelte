<script lang="ts">
    import IntervalGraph from "./IntervalGraph.svelte"
    import { burdenOrLoad } from "./stores"

    export let intervals: Record<number, number>

    export let last: number = 21
    export let steps: number = 7

    let burdens: Record<number, number>
    $: {
        burdens = { ...intervals }
        Object.entries(burdens).forEach(([key, val]) => {
            const num_key = parseInt(key)
            burdens[num_key] = val / num_key
        })
    }
</script>

<IntervalGraph
    bind:last
    bind:steps
    intervals={burdens}
    pieInfo={{
        totalDescriptor: $burdenOrLoad,
        legend_left: "Intervals",
        legend_right: $burdenOrLoad,
    }}
></IntervalGraph>
