<script lang="ts">
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie";
    import {search as doSearch} from "./search"

    export let search: string;

    $: passed_search = `(${search}) AND (rated:1 -rated:1:1 AND is:review)`
    $: flunked_search = `(${search}) AND (rated:1 AND rated:1:1 AND is:review)`
    $: learning_search = `(${search}) AND (rated:1 AND -is:review AND is:learn)`

    async function dataGen(): Promise<PieDatum[]> {
        console.log(search)

        const passed = await doSearch(passed_search)
        const flunked = await doSearch(flunked_search)
        const learning = await doSearch(learning_search)

        return [{
            label: "Passed",
            value: passed.length,
            colour: "#74c476"
        },
        {
            label: "Flunked",
            value: flunked.length,
            colour: "#fb6a4a"
        },
        {
            label: "Learning",
            value: learning.length,
            colour: "#fd8d3c"
        }
        ]
    }
</script>

{#await dataGen()}
    Loading...
{:then data}
    <Pie {data}></Pie>
    <small>
            Passed = <code>{passed_search}</code> <br>
            Flunked = <code>{flunked_search}</code> <br>
            Learning = <code>{learning_search}</code> <br>
    </small>
{/await}