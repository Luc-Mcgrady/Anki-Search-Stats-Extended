<script lang="ts">
    import IntervalPie from "./IntervalPie.svelte";

    export let intervals: Record<number, number>;

    export let spectrumFrom: undefined | string = undefined
    export let spectrumTo: undefined | string = undefined

    let burdens: Record<number, number>
    $: {
        burdens = {...intervals}
        Object.entries(burdens).forEach(([key, val]) => {
            const num_key = parseInt(key)
            burdens[num_key] = val / num_key
        });
    }

</script>

<IntervalPie {spectrumFrom} {spectrumTo} intervals={burdens} legend_title="Intervals: Burden"></IntervalPie>
