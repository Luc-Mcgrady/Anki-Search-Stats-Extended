import { writable, type Writable } from "svelte/store"
import type { GraphsResponse } from "./proto/anki/stats_pb"
import type { CardData, Revlog } from "./search"

export let data: Writable<null | GraphsResponse> = writable(null)
export let not_suspended_data: Writable<null | GraphsResponse> = writable(null)
export let mature_data: Writable<null | GraphsResponse> = writable(null)
export let learn_data: Writable<null | GraphsResponse> = writable(null)
export let relearn_data: Writable<null | GraphsResponse> = writable(null)

export let searchString: Writable<null | string> = writable(null)
export let card_data: Writable<null | CardData[]> = writable(null)
export let revlogs: Writable<null | Revlog[]> = writable(null)

export let include_suspended = writable(false)
export let zero_inclusive = writable(false)

export let burdenOrLoad = writable("Load")
export let tooltip: Writable<Tooltip> = writable({ shown: false })

export type Tooltip = {
    shown: boolean
    x?: number
    y?: number
    text?: string[]
}

export function tooltipX(e: MouseEvent) {
    return e.pageX - (e.pageX / document.body.scrollWidth) * 200
}
