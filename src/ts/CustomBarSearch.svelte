<script lang="ts">
    import type { Writable } from "svelte/store"
    import { getQuery, type SearchBarData } from "./CustomBar"
    import { searchJoin } from "./root"
    import { custom_bar_mode, searchString, data as default_data, searchLimit } from "./stores"
    import CancelablePromise, { cancelable } from "cancelable-promise"
    import { i18n } from "./i18n"
    import type { GraphsResponse } from "./proto/anki/stats_pb"

    export let data: Writable<SearchBarData>
    export let promise: CancelablePromise<GraphsResponse | undefined> =
        CancelablePromise.resolve(undefined)
    let last_search: string
    let last_mode: string
    let last_search_limit = $searchLimit
    let search_data: GraphsResponse | undefined

    function updateData() {
        let out = []
        if (search_data?.reviews) {
            let result = search_data.reviews[$custom_bar_mode]

            for (const day in search_data?.reviews?.count ?? []) {
                // Todo add the other types of card as well
                out[SSEother.days_elapsed + +day] =
                    result[day].young + result[day].mature + result[day].relearn + result[day].learn

                if ($custom_bar_mode == "time") {
                    out[SSEother.days_elapsed + +day] /= 60 * 1000
                }
            }
            $data.value = out

            last_mode = $custom_bar_mode
            last_search = $data.label
        }
    }

    $: $data.label = searchJoin($searchString, $data.search)
    $: if (last_search !== $data.label || last_search_limit !== $searchLimit) {
        last_search = $data.label
        last_search_limit = $searchLimit
        promise.cancel()
        if ($data.search == "") {
            promise = new CancelablePromise((resolve) => {
                default_data.subscribe((d) => {
                    if (d) resolve(d)
                })
            })
        } else {
            promise = cancelable(getQuery($data.label, $searchLimit))
        }
        promise.then((result) => {
            search_data = result
            updateData()
        })
    }

    $: if (last_mode !== $custom_bar_mode) {
        updateData()
    }
</script>

<input type="text" bind:value={$data.search} placeholder={i18n("search-string")} />
<input type="text" bind:value={$data.colour} placeholder={i18n("css-colour")} />
