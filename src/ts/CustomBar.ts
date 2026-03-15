import type { GraphsResponse } from "./proto/anki/stats_pb"
import { fetchSwappedSearch } from "./root"

export type SearchBarData = {
    label: string
    search: string
    colour: string
    value: number[]
}

export async function getQuery(query: string, dayLimit: number): Promise<GraphsResponse> {
    let cids: number[]
    if (!query) {
        query = "*"
    }
    return await fetchSwappedSearch(query, dayLimit)
}
