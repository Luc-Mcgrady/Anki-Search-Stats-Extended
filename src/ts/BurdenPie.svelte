<script lang="ts">
    import IntervalPie from "./IntervalPie.svelte";

    export let intervals: Record<number, number>;
    let burdens: Record<number, number>
    $: {
        burdens = {...intervals}
        Object.entries(burdens).forEach(([key, val]) => {
            const num_key = parseInt(key)
            burdens[num_key] = val / num_key
        });
    }

</script>

<IntervalPie intervals={burdens} legend_title="Burden: Cards"></IntervalPie>

<style>
    span {
        text-align: center;
    }
</style>