import { GraphsRequest, GraphsResponse } from "./proto/anki/stats_pb"
import { getCardData, getRevlogs, search } from "./search"
import {
    card_data,
    data,
    learn_data,
    mature_data,
    not_suspended_data,
    relearn_data,
    revlogs,
    searchString,
} from "./stores"

export async function decodeResponse(resp: Response) {
    const blob = await resp.blob()
    const respBuf = await new Response(blob).arrayBuffer()
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

export function searchJoin(user: string | null, added: string) {
    return user ? `(${user}) (${added})` : added
}

function bodySwap(req: string | Uint8Array, newSearch: string) {
    const request = decodeRequest(req)
    request.search = searchJoin(request?.search, newSearch)
    return request.toBinary()
}

async function fetchAndDecode(fetchPromise: Promise<Response>) {
    const resp = await fetchPromise
    return await decodeResponse(resp)
}

export function patchFetch() {
    //@ts-ignore
    fetch = (req: string, headers: Record<string, any>) => {
        if (req == "/_anki/graphs") {
            data.set(null)
            mature_data.set(null)
            learn_data.set(null)
            relearn_data.set(null)
            not_suspended_data.set(null)

            const origBody = headers.body

            function fetchSwappedSearch(criteria: string) {
                headers.body = bodySwap(origBody, criteria)
                return fetchAndDecode(realFetch(req, headers))
            }

            const search_request = decodeRequest(origBody)

            searchString.set(search_request?.search)
            search(search_request?.search).then(getCardData).then(card_data.set)
            search(searchJoin(search_request?.search, "prop:ivl>1"))
                .then(getRevlogs)
                .then(revlogs.set)

            fetchAndDecode(realFetch(req, headers)).then(data.set)
            fetchSwappedSearch("prop:ivl>=21").then(mature_data.set)
            fetchSwappedSearch("is:learn").then(learn_data.set)
            fetchSwappedSearch("is:learn is:review").then(relearn_data.set)
            fetchSwappedSearch("-is:suspended").then(not_suspended_data.set)

            headers.body = origBody
        }
        return realFetch(req, headers)
    }
}
