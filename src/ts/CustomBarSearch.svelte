<script lang="ts">
    import type { Writable } from "svelte/store"
    import { getQuery, type SearchBarData } from "./CustomBar"
    import { searchJoin } from "./root"
    import { custom_bar_mode, searchString } from "./stores"
    import CancelablePromise, { cancelable } from "cancelable-promise"
    import { i18n } from "./i18n"

    export let data: Writable<SearchBarData>
    export let promise: CancelablePromise<number[]> = CancelablePromise.resolve([])
    let last_search: string
    let last_mode: string

    $: $data.label = searchJoin($searchString, $data.search)
    $: if (last_search !== $data.label || last_mode !== $custom_bar_mode) {
        promise.cancel()
        promise = cancelable(getQuery($data.label, $custom_bar_mode))
        promise.then((result) => {
            $data.value = result
        })
        last_search = $data.label
        last_mode = $custom_bar_mode
    }
</script>

<input type="text" bind:value={$data.search} placeholder={i18n("search-string")} />
<input type="text" bind:value={$data.colour} placeholder={i18n("css-colour")} />
