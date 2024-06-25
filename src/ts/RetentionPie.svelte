<script lang="ts">
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { searchJoin } from "./root"
    import { search as doSearch } from "./search"

    export let search: string

    $: passed_search = searchJoin(search, "rated:1 -rated:1:1 is:review")
    $: flunked_search = searchJoin(search, "rated:1 rated:1:1 is:review")
    $: learning_search = searchJoin(search, "rated:1 -is:review is:learn")

    let do_learning = true
    $: data_fetcher = dataGen(do_learning)

    async function dataGen(include_learning: boolean): Promise<PieDatum[]> {
        const passed = await doSearch(passed_search)
        const flunked = await doSearch(flunked_search)
        const learning = await doSearch(learning_search)

        const learning_data = include_learning
            ? [
                  {
                      label: "Learning",
                      value: learning.length,
                      colour: "#fd8d3c",
                  },
              ]
            : []

        return [
            {
                label: "Passed",
                value: passed.length,
                colour: "#74c476",
            },
            {
                label: "Flunked",
                value: flunked.length,
                colour: "#fb6a4a",
            },
            ...learning_data,
        ]
    }
</script>

{#await data_fetcher}
    Loading...
{:then data}
    <Pie legend_left="State" legend_right="Amount" {data}></Pie>
    <br />
    <p>
        <!-- Doing it with fixed indexes this way is kinda risky but it works-->
        Today's Retention = {data[0].value} /
        {data[0].value + data[1].value} =
        {((100 * data[0].value) / (data[0].value + data[1].value)).toFixed(2)}%
    </p>
    <small>
        Passed = <code>{passed_search}</code>
        <br />
        Flunked =
        <code>{flunked_search}</code>
        <br />

        <label>
            <input type="checkbox" bind:checked={do_learning} />
            Learning =
            <code>{learning_search}</code>
        </label>
        <br />
    </small>
{/await}
