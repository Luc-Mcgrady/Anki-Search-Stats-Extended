<script lang="ts">
    import { custom_bar_mode, searchLimit, searchString } from "./stores"
    import _ from "lodash"
    import NoGraph from "./NoGraph.svelte"
    import { derived, writable, type Writable } from "svelte/store"
    import type { SearchBarData } from "./CustomBar"
    import CustomBarSearch from "./CustomBarSearch.svelte"
    import { onMount } from "svelte"
    import { i18n } from "./i18n"
    import type { BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { barDateLabeler } from "./bar"

    const pickable_colours = ["blue", "red", "green", "orange"]
    let pickable_colours_i = 0

    let bar_chart_data: Writable<SearchBarData>[] = []

    onMount(reset)

    function newSearch() {
        bar_chart_data = [
            ...bar_chart_data,
            writable({
                label: $searchString ?? "",
                search: "",
                colour: pickable_colours[pickable_colours_i++],
                value: [],
            }),
        ]

        pickable_colours_i %= pickable_colours.length
    }

    $: bar_data_values = derived(bar_chart_data, (a) => a)

    function reset() {
        bar_chart_data = []
        newSearch()
    }

    let binSize = 1
    let offset = 0

    let bar_data: BarChart
    $: {
        const data = $bar_data_values
        const max_len = Math.max(0, ...data.map((d) => d.value?.length ?? 0))
        const combined_data = _.range(-(offset + binSize * 30), max_len).map((i) => ({
            label: i.toString(),
            values: data.map((d) => d.value[i] ?? 0),
        }))

        bar_data = {
            row_labels: data.map((d) => d.label),
            row_colours: data.map((d) => d.colour),
            data: combined_data,
            columnLabeler: barDateLabeler,
            tick_spacing: 5,
        }
    }

    // Todo: Make this a store
    $: limit = -1 - $searchLimit
</script>

<div class="options">
    <label>
        <input type="radio" bind:group={$custom_bar_mode} value="count" />
        {i18n("reviews")}
    </label>
    <label>
        <input type="radio" bind:group={$custom_bar_mode} value="time" />
        {i18n("time-in-minutes")}
    </label>
</div>

{#if _.sumBy($bar_data_values, (d) => _.sum(d.value))}
    <BarScrollable data={bar_data} {limit} bind:offset bind:binSize></BarScrollable>
{:else}
    <NoGraph></NoGraph>
{/if}
<div class="searches">
    <span>{i18n("search")}</span>
    <span>{i18n("colour")}</span>
    {#each bar_chart_data as data}
        <CustomBarSearch {data}></CustomBarSearch>
    {/each}
    <input type="button" on:click={newSearch} value={i18n("new-search")} />
    <input type="button" on:click={reset} value={i18n("reset")} />
</div>

<style>
    div.searches {
        display: grid;
        grid-template-columns: auto auto;
        gap: 1em;
    }
    div.options {
        display: flex;
        gap: 1em;
        justify-content: center;
    }
</style>
