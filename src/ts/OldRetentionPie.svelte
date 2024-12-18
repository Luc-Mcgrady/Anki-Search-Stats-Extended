<script lang="ts">
    import CancelablePromise, { cancelable } from "cancelable-promise"
    import NoGraph from "./NoGraph.svelte"
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { searchJoin } from "./root"
    import { search as doSearch } from "./search"
    import { searchString } from "./stores"

    $: passed_search = searchJoin($searchString, "rated:1 -rated:1:1 is:review")
    $: flunked_search = searchJoin($searchString, "rated:1 rated:1:1 is:review")
    $: learning_search = searchJoin($searchString, "rated:1 -is:review is:learn")

    let do_learning = true
    let data_fetcher = CancelablePromise.reject<PieDatum[]>()
    $: {
        if ($searchString !== null) {
            data_fetcher.cancel()
            data_fetcher = cancelable(dataGen(do_learning, $searchString))
        }
    }

    async function dataGen(include_learning: boolean, search: string): Promise<PieDatum[]> {
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
    <NoGraph>Loading...</NoGraph>
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
        <span>Passed =</span>
        <span>
            <code>{passed_search}</code>
        </span>
        <span>Flunked =</span>
        <span>
            <code>{flunked_search}</code>
        </span>
        <label>
            <span>
                <input type="checkbox" bind:checked={do_learning} />
                Learning =
            </span>
            <span>
                <code>{learning_search}</code>
            </span>
        </label>
    </small>
{/await}

<style>
    label {
        display: contents;
    }
    small {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.25em;
        max-height: 5em;
        overflow-y: auto;
    }
</style>
