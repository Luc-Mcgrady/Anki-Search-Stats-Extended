import { get, writable } from "svelte/store"
import type { GraphsResponse } from "./proto/anki/stats_pb"
import type { CardData, Revlog } from "./search"
import type { Tooltip } from "./tooltip"

export let data = writable<null | GraphsResponse>(null)
export let not_suspended_data = writable<null | GraphsResponse>(null)
export let mature_data = writable<null | GraphsResponse>(null)
export let learn_data = writable<null | GraphsResponse>(null)
export let relearn_data = writable<null | GraphsResponse>(null)

export let searchString = writable<null | string>(null)
export let card_data = writable<null | CardData[]>(null)
export let revlogs = writable<null | Revlog[]>(null)

export let include_suspended = writable(false)
export let zero_inclusive = writable(false)

export let burdenOrLoad = writable("Load")
export let other = writable<SSEother>()
export let config = writable<SSEconfig>()
export let showRevlogStats = writable(false)

revlogs.subscribe(() => showRevlogStats.set(!get(config)?.confirmExpensiveStats ?? false))

export let tooltip = writable<Tooltip>({
    text: [""],
    x: 0,
    y: 0,
})
export let tooltipShown = writable(false)
