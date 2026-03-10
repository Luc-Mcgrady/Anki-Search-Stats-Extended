<script lang="ts">
    import type { Writable } from "svelte/store"
    import { getQuery, type SearchBarData } from "./CustomBar"
    import { searchJoin } from "./root"
    import { custom_bar_mode, searchString } from "./stores"
    import CancelablePromise, { cancelable } from "cancelable-promise"
    import { i18n } from "./i18n"
    import type { GraphsResponse } from "./proto/anki/stats_pb"

    export let data: Writable<SearchBarData>
    export let promise: CancelablePromise<GraphsResponse | undefined> =
        CancelablePromise.resolve(undefined)
    let last_search: string
    let last_mode: string

    $: $data.label = searchJoin($searchString, $data.search)
    $: if (last_search !== $data.label || last_mode !== $custom_bar_mode) {
        promise.cancel()
        promise = cancelable(getQuery($data.label, $custom_bar_mode))
        promise.then((result) => {
            let out = []
            for (const day in result?.reviews?.count ?? []) {
                // Todo add the other types of card as well
                out[SSEother.days_elapsed + +day] = result?.reviews?.count[day]?.young ?? 0
            }
            $data.value = out
        })
        last_search = $data.label
        last_mode = $custom_bar_mode
    }
</script>

<input type="text" bind:value={$data.search} placeholder={i18n("search-string")} />
<input type="text" bind:value={$data.colour} placeholder={i18n("css-colour")} />
