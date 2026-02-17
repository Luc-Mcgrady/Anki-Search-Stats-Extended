import { derived, get, writable, type Readable } from "svelte/store"
import { calculateCardDataPies } from "./CardDataPies"
import { DEFAULT_ORDER, type SSEconfig, type SSEother } from "./config"
import { getMemorisedDays } from "./MemorisedBar"
import type { GraphsRequest, GraphsResponse } from "./proto/anki/stats_pb"
import { calculateRevlogStats } from "./revlogGraphs"
import {
    catchErrors,
    getCardData,
    getRevlogs,
    saveConfigValue,
    type CardData,
    type Revlog,
} from "./search"
import type { Tooltip } from "./tooltip"

// Pie chart related
export let include_suspended = writable(false)
export let zero_inclusive = writable(false)
export let custom_pie_mode = writable("Count")
export let graph_mode = writable<"Bar" | "Pie">("Pie")

// Config related stats
export let other = writable<SSEother>()
export let config = writable<SSEconfig>()
export let shownCategories = writable(SSEconfig.categories ?? {})
export let autoRevlogStats = writable(SSEconfig.autoRevlogStats ?? false)
export let autoMemorisedStats = writable(SSEconfig.autoMemorisedStats ?? false)
export let alwaysAllTime = writable(SSEconfig.alwaysAllTime ?? false)
export let categoryOrder = writable([
    ...(SSEconfig.categoryOrder ?? []).filter((c) => DEFAULT_ORDER.includes(c)),
    ...DEFAULT_ORDER.filter((c) => !(SSEconfig.categoryOrder ?? []).includes(c)),
])
export let showRevlogStats = writable(false)
export let showFsrsStats = writable(SSEconfig.autoMemorisedStats)

function configSubscribe<T>(store: Readable<T>, run: (value: T) => void) {
    let first = true
    return store.subscribe((value) => {
        if (first) {
            first = false
        } else {
            run(value)
        }
    })
}

configSubscribe(shownCategories, ($shownCategories) =>
    saveConfigValue("categories", $shownCategories)
)

configSubscribe(autoRevlogStats, ($autoRevlogStats) => {
    saveConfigValue("autoRevlogStats", $autoRevlogStats)
    if ($autoRevlogStats) {
        showRevlogStats.set($autoRevlogStats)
    }
})

configSubscribe(categoryOrder, ($categoryOrder) => saveConfigValue("categoryOrder", $categoryOrder))

configSubscribe(autoMemorisedStats, ($autoMemorisedStats) => {
    saveConfigValue("autoMemorisedStats", $autoMemorisedStats)
    if ($autoMemorisedStats || !get(showRevlogStats)) {
        showFsrsStats.set($autoMemorisedStats)
    }
})

configSubscribe(alwaysAllTime, ($alwaysAllTime) => saveConfigValue("alwaysAllTime", $alwaysAllTime))

// Data related
export let data = writable<null | GraphsResponse>(null)
export let not_suspended_data = writable<null | GraphsResponse>(null)
export let mature_data = writable<null | GraphsResponse>(null)
export let learn_data = writable<null | GraphsResponse>(null)
export let relearn_data = writable<null | GraphsResponse>(null)

export let graphsRequest = writable<null | GraphsRequest>(null)
export let searchString = derived(graphsRequest, ($graphsRequest) => $graphsRequest?.search ?? null)
export let searchLimit = derived(
    [graphsRequest, alwaysAllTime],
    ([$graphsRequest, $alwaysAllTime]) => ($alwaysAllTime ? 0 : ($graphsRequest?.days ?? 0))
)
export let cids = writable<null | number[]>(null)

// Revlog graph specific stores
export let pieLast = writable(59)
export let pieSteps = writable(10)
export let scroll = writable(0)
export let binSize = writable(1)

//Tooltip related stores
export let tooltip = writable<Tooltip>({
    text: [""],
    x: 0,
    y: 0,
})
export let tooltipShown = writable(false)

cids.subscribe(() => showRevlogStats.set(get(autoRevlogStats) || false))
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

// Stats Data Stores
export let card_data: Readable<CardData[] | null> = derived([cids], ([$cids], set) => {
    set(null)
    if ($cids) {
        catchErrors(() => getCardData($cids ?? [])).then(set)
    }
})

export let revlogs: Readable<Revlog[] | null> = derived(
    [cids, showRevlogStats, searchLimit],
    ([$cids, $showRevlogStats, $searchLimit], set) => {
        set(null)
        if ($cids && $showRevlogStats) {
            catchErrors(() => getRevlogs($cids, $searchLimit)).then(set)
        }
    }
)

export let cardDataStats = derived(
    [card_data, include_suspended, zero_inclusive],
    ([$card_data, $include_suspended, $zero_inclusive]) =>
        calculateCardDataPies($card_data ?? [], $include_suspended, $zero_inclusive)
)
export const revlogStats = writable<ReturnType<typeof calculateRevlogStats> | null>(null)
derived([revlogs, card_data], ([$revlogs, $card_data]) => {
    if (!$revlogs || !$card_data) {
        return null
    }
    return catchErrors(() => calculateRevlogStats($revlogs, $card_data))
}).subscribe(revlogStats.set)
export let last_forget = derived([revlogStats], ([$revlogStats]) => $revlogStats?.last_forget)
export let memorised_stats = writable<ReturnType<typeof getMemorisedDays> | null>()
derived(
    [card_data, revlogs, showFsrsStats, last_forget],
    ([$card_data, $revlogs, $showFsrsStats, $last_forget]) => {
        if ($revlogs && $card_data && $showFsrsStats && $last_forget) {
            return catchErrors(() =>
                getMemorisedDays(
                    $revlogs,
                    $card_data,
                    SSEother.deck_configs,
                    SSEother.deck_config_ids,
                    $last_forget
                )
            )
        } else {
            return null
        }
    }
).subscribe(memorised_stats.set)
