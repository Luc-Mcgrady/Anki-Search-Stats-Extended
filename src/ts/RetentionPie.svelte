<script lang="ts">
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie";
    import {search as doSearch} from "./search"

    export let search: string;

    async function dataGen(): Promise<PieDatum[]> {
        console.log(search)
        const passed = await doSearch(`(${search} AND rated:1:1)`)
        const flunked = await doSearch(`(${search} AND (rated:1 AND -rated:1:1))`)


        return [{
            label: "Passed",
            value: passed.ids.length,
            colour: "#74c476"
        },
        {
            label: "Flunked",
            value: flunked.ids.length,
            colour: "#fb6a4a"
        }
        ]
    }
</script>

{#await dataGen()}
    Loading...
{:then data}
    <Pie {data}></Pie>
{/await}