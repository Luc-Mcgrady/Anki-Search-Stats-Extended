<script lang="ts">
    import Pie from "./Pie.svelte"
    import { burdenOrLoad, custom_pie_mode, searchString } from "./stores"
    import _ from "lodash"
    import NoGraph from "./NoGraph.svelte"
    import { derived, writable, type Writable } from "svelte/store"
    import type { SearchPieData } from "./CustomPie"
    import CustomPieSearch from "./CustomPieSearch.svelte"
    import { onMount } from "svelte"

    const pickable_colours = ["blue", "red", "green", "orange"]
    let pickable_colours_i = 0

    let pie_data: Writable<SearchPieData>[] = []

    onMount(reset)

    function newSearch() {
        pie_data = [
            ...pie_data,
            writable({
                label: $searchString ?? "",
                search: "",
                colour: pickable_colours[pickable_colours_i++],
                value: 0,
            }),
        ]

        pickable_colours_i %= pickable_colours.length
    }

    $: pie_data_values = derived(pie_data, (a) => a)

    function reset() {
        pie_data = []
        newSearch()
    }
</script>

<div class="options">
    <label>
        <input type="radio" bind:group={$custom_pie_mode} value="Count" />
        Count
    </label>
    <label>
        <input type="radio" bind:group={$custom_pie_mode} value={$burdenOrLoad} />
        {$burdenOrLoad}
    </label>
    <label>
        <input type="radio" bind:group={$custom_pie_mode} value="Lapses" />
        Lapses
    </label>
    <label>
        <input type="radio" bind:group={$custom_pie_mode} value="Repetitions" />
        Repetitions
    </label>
</div>

{#if _.sumBy($pie_data_values, (d) => d.value)}
    <Pie data={$pie_data_values} legend_left="Search" legend_right={$custom_pie_mode}></Pie>
{:else}
    <NoGraph></NoGraph>
{/if}
<div class="searches">
    <span>Search</span>
    <span>Colour</span>
    {#each pie_data as data}
        <CustomPieSearch {data}></CustomPieSearch>
    {/each}
    <input type="button" on:click={newSearch} value="New search" />
    <input type="button" on:click={reset} value="Reset" />
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
