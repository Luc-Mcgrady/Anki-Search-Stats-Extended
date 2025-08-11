<script lang="ts">
    import CancelablePromise, { cancelable } from "cancelable-promise"
    import NoGraph from "./NoGraph.svelte"
    import Pie from "./Pie.svelte"
    import type { PieDatum } from "./pie"
    import { searchJoin } from "./root"
    import { search as doSearch } from "./search"
    import { searchString } from "./stores"
    import { i18n } from "./i18n"
    import { LEARN_COLOUR, RELEARN_COLOUR } from "./graph"

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
                      label: i18n("learning"),
                      value: learning.length,
                      colour: LEARN_COLOUR,
                  },
              ]
            : []

        return [
            {
                label: i18n("passed"),
                value: passed.length,
                colour: "#74c476",
            },
            {
                label: i18n("flunked"),
                value: flunked.length,
                colour: RELEARN_COLOUR,
            },
            ...learning_data,
        ]
    }
</script>

{#await data_fetcher}
    <NoGraph>{i18n("loading")}</NoGraph>
{:then data}
    <Pie legend_left="State" legend_right={i18n("amount")} {data}></Pie>
    <br />
    <p>
        <!-- Doing it with fixed indexes this way is kinda risky but it works-->
        {i18n("todays-retention")} = {data[0].value} /
        {data[0].value + data[1].value} =
        {((100 * data[0].value) / (data[0].value + data[1].value)).toFixed(2)}%
    </p>
    <small>
        <span>{i18n("passed")} =</span>
        <span>
            <code>{passed_search}</code>
        </span>
        <span>{i18n("flunked")} =</span>
        <span>
            <code>{flunked_search}</code>
        </span>
        <label>
            <span>
                <input type="checkbox" bind:checked={do_learning} />
                {i18n("learning")}
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
