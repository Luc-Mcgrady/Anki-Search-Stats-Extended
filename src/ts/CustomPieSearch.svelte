<script lang="ts">
    import type { Writable } from "svelte/store"
    import { getQuery, type SearchPieData } from "./CustomPie"
    import { searchJoin } from "./root"
    import { custom_pie_mode, searchString } from "./stores"
    import CancelablePromise, { cancelable } from "cancelable-promise"

    export let data: Writable<SearchPieData>
    export let promise: CancelablePromise<number> = CancelablePromise.resolve(0)
    let last_search: string

    $: $data.label = searchJoin($searchString, $data.search)
    $: if (last_search !== $data.label) {
        promise.cancel()
        promise = cancelable(getQuery($data.label, $custom_pie_mode))
        promise.then((result) => {
            $data.value = result
        })
        last_search = $data.label
    }
</script>

<input type="text" bind:value={$data.search} placeholder="Search string" />
<input type="text" bind:value={$data.colour} placeholder="CSS Colour" />
