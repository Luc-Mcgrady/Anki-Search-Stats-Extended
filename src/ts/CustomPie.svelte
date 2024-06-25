<script lang="ts">
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { search as doSearch, getCardData } from "./search"
    import { burdenOrLoad } from "./stores"

    export let search: string
    export let mode = "Count"

    const pickable_colours = ["blue", "red", "green", "orange"]
    let pickable_colours_i = 0

    let pie_data: PieDatum[] = []

    reset()

    async function getQuery(query: string): Promise<number> {
        let cids: number[]
        if (!query) {
            query = "*"
        }

        try {
            cids = await doSearch(query)
        } catch {
            return -1
        }

        if (mode === "Count") {
            return cids.length
        }
        const cards = await getCardData(cids)
        switch (mode) {
            case $burdenOrLoad:
                return cards.reduce((p, n) => (p += n.ivl ? 1 / n.ivl : 0), 0)
            case "Lapses":
                return cards.reduce((p, n) => (p += n.lapses), 0)
            case "Repetitions":
                return cards.reduce((p, n) => (p += n.reps), 0)
            default:
                mode = "Invalid Mode"
                return 0
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
</script>

<div class="options">
    <label>
        <input type="radio" bind:group={mode} on:change={refresh} value="Count" />
        Count
    </label>
    <label>
        <input type="radio" bind:group={mode} on:change={refresh} value={$burdenOrLoad} />
        {$burdenOrLoad}
    </label>
    <label>
        <input type="radio" bind:group={mode} on:change={refresh} value="Lapses" />
        Lapses
    </label>
    <label>
        <input type="radio" bind:group={mode} on:change={refresh} value="Repetitions" />
        Repetitions
    </label>
</div>

<Pie data={pie_data} legend_left="Search" legend_right={mode}></Pie>
<div class="searches">
    <span>Search</span>
    <span>Colour</span>
    {#each pie_data as pie_data}
        <input
            type="text"
            bind:value={pie_data.label}
            placeholder="Search string"
            on:change={() => onChange(pie_data)}
        />
        <input type="text" bind:value={pie_data.colour} placeholder="CSS Colour" />
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
