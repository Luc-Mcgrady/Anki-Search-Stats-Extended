import { derived, get, writable } from "svelte/store"
import type { SSEconfig, SSEother } from "./config"
import type { getMemorisedDays } from "./MemorisedBar"
import type { GraphsRequest, GraphsResponse } from "./proto/anki/stats_pb"
import { getRevlogs, saveConfigValue, type CardData, type Revlog } from "./search"
import type { Tooltip } from "./tooltip"

// Data related
export let data = writable<null | GraphsResponse>(null)
export let not_suspended_data = writable<null | GraphsResponse>(null)
export let mature_data = writable<null | GraphsResponse>(null)
export let learn_data = writable<null | GraphsResponse>(null)
export let relearn_data = writable<null | GraphsResponse>(null)

export let graphsRequest = writable<null | GraphsRequest>(null)
export let searchString = derived(graphsRequest, (searchRequest) => searchRequest?.search ?? null)
export let searchLimit = derived(graphsRequest, (searchRequest) => searchRequest?.days ?? 0)
export let cids = writable<null | number[]>(null)
export let card_data = writable<null | CardData[]>(null)
export let revlogs = writable<null | Revlog[]>(null)

export let last_forget = writable<null | number[]>(null)

// Pie chart related
export let include_suspended = writable(false)
export let zero_inclusive = writable(false)
export let custom_pie_mode = writable("Count")
export let graph_mode = writable<"Bar" | "Pie">("Pie")

// Config related stats
export let other = writable<SSEother>()
export let config = writable<SSEconfig>()
export let showRevlogStats = writable(false)
export let shownCategories = writable(SSEconfig.categories ?? {})

shownCategories.subscribe(($shownCategories) => saveConfigValue("categories", $shownCategories))

// Revlog graph specific stores
export let pieLast = writable(59)
export let pieSteps = writable(10)
export let scroll = writable(0)
export let binSize = writable(1)

// Graphs which are displayed in sections other than the one in which they are processed
export let target_R_days = writable<number[]>([])
export let memorised_stats = writable<undefined | ReturnType<typeof getMemorisedDays>>(undefined)

//Tooltip related stores
export let tooltip = writable<Tooltip>({
    text: [""],
    x: 0,
    y: 0,
})
export let tooltipShown = writable(false)

const updateRevlogs = () => {
    const $cids = get(cids)
    const $showRevlogStats = get(showRevlogStats)
    const $date_range = get(searchLimit)

    revlogs.set(null)
    if ($showRevlogStats && $cids) {
        return getRevlogs($cids, $date_range).then(revlogs.set)
    }
}

searchString.subscribe(() => showRevlogStats.set(!get(config)?.confirmExpensiveStats || false))
cids.subscribe(updateRevlogs)
showRevlogStats.subscribe(updateRevlogs)
tooltipShown.subscribe(() =>
    setTimeout(() => {
        if (!get(tooltipShown)) {
            tooltip.update(($tooltip) => ({ text: $tooltip.text, x: 0, y: 0 }))
        }
    }, 1000)
)
config.subscribe(($config) =>
    graph_mode.set($config?.graphMode?.toLowerCase() == "bar" ? "Bar" : "Pie")
)
revlogs.subscribe(() => memorised_stats.set(undefined))
