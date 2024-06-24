<script lang="ts">
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { search as doSearch } from "./search"

    export let search: string

    const pickable_colours = ["blue", "red", "green", "orange"]
    let pickable_colours_i = 0

    let pie_data: PieDatum[] = []

    reset()

    async function getQuery(query: string): Promise<number> {
        const result = await doSearch(`(${query})`)
        return result.length
    }

    async function newSearch() {
        pie_data = [
            ...pie_data,
            {
                label: search,
                colour: pickable_colours[pickable_colours_i++],
                value: await getQuery(search),
            },
        ]

        pickable_colours_i %= pickable_colours.length
    }

    async function onChange(datum: PieDatum) {
        datum.value = await getQuery(datum.label)
        pie_data = [...pie_data]
    }

    function reset() {
        pie_data = []
        newSearch()
    }
</script>

<Pie data={pie_data} legend_left="Search" legend_right="Cards"></Pie>
<div>
    <span>Search</span>
    <span>Colour</span>
    {#each pie_data as pie_data}
        <input
            type="text"
            bind:value={pie_data.label}
            placeholder="Search string"
            on:change={() => onChange(pie_data)}
        />
        <input type="text" bind:value={pie_data.colour} placeholder="Search string" />
    {/each}
    <input type="button" on:click={newSearch} value="New search" />
    <input type="button" on:click={reset} value="Reset" />
</div>

<style>
    div {
        display: grid;
        grid-template-columns: auto auto;
        gap: 1em;
    }
</style>
