<script lang="ts">
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { search as doSearch, getCardData } from "./search"

    export let search: string
    export let burden_mode = false

    const pickable_colours = ["blue", "red", "green", "orange"]
    let pickable_colours_i = 0

    let pie_data: PieDatum[] = []

    reset()

    async function getQuery(query: string): Promise<number> {
        const result = await doSearch(`(${query})`)
        if (!burden_mode) {
            return result.length
        } else {
            const cards = await getCardData(result)
            return cards.reduce((p, n) => (p += n.ivl ? 1 / n.ivl : 0), 0)
        }
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

    async function refresh() {
        pie_data = await Promise.all(
            pie_data.map(async (a) => ({
                label: a.label,
                colour: a.colour,
                value: await getQuery(a.label),
            }))
        )
    }

    async function onChange(datum: PieDatum) {
        datum.value = await getQuery(datum.label)
        pie_data = [...pie_data]
    }

    function reset() {
        pie_data = []
        newSearch()
    }

    $: legend_right = burden_mode ? "Burden" : "Cards"
</script>

<label>
    Burden:
    <input type="checkbox" bind:checked={burden_mode} on:change={refresh} />
</label>

<Pie data={pie_data} legend_left="Search" {legend_right}></Pie>
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
