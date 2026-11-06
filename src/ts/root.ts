import { get } from "svelte/store"
import { GraphsRequest, GraphsResponse } from "./proto/anki/stats_pb"
import { search } from "./search"
import { alwaysAllTime, cids, data, graphsRequest, not_suspended_data } from "./stores"

export async function decodeResponse(resp: Response) {
    const respBuf = await resp.arrayBuffer()
    const bytes = new Uint8Array(respBuf)
    return GraphsResponse.fromBinary(bytes)!
}

const encoder = new TextEncoder()

export const realFetch = fetch

function decodeRequest(req: string | Uint8Array) {
    if (typeof req == "string") {
        req = encoder.encode(req)
    }
    return GraphsRequest.fromBinary(req)
}

export function searchJoin(user: string | null, added: string | null): string {
    if (user && added) {
        return `(${user}) (${added})`
    } else if (user && !added) {
        return user!
    } else if (!user && added) {
        return added!
    } else {
        return ""
    }
}

function bodySwap(req: string | Uint8Array, newSearch: string, newLimit?: number) {
    const request = decodeRequest(req)
    request.search = searchJoin(request?.search, newSearch)
    if (newLimit !== undefined) {
        request.days = newLimit
    }
    return request.toBinary()
}

async function fetchAndDecode(fetchPromise: Promise<Response>) {
    const resp = await fetchPromise
    return await decodeResponse(resp)
}

let origBody: any = undefined
let origReq: string = ""
let origHeaders: any = { body: undefined }

export function fetchSwappedSearch(criteria: string, limit?: number) {
    const headers = { ...origHeaders, body: bodySwap(origBody, criteria, limit) }
    return fetchAndDecode(realFetch(origReq, headers))
}

export function patchFetch() {
    //@ts-ignore
    fetch = (req: string, headers: Record<string, any>) => {
        const response = realFetch(req, headers)
        if (req == "/_anki/graphs") {
            data.set(null)

            origReq = req
            origBody = headers.body
            origHeaders = headers

            const search_request = decodeRequest(origBody)

            cids.set(null)
            graphsRequest.set(search_request)

            if (search_request.search === "") {
                cids.set({ all: true })
            } else {
                search(search_request.search).then((ids) => {
                    if (get(graphsRequest) === search_request) cids.set(ids)
                })
            }

            const limit = get(alwaysAllTime) ? 0 : undefined
            const stats =
                limit === undefined || search_request.days === limit
                    ? fetchAndDecode(response.then((resp) => resp.clone()))
                    : fetchSwappedSearch("", limit)
            stats.then(data.set)
            fetchSwappedSearch("-is:suspended", limit).then(not_suspended_data.set)
        }
        return response
    }
}
