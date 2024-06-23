import type { SearchRequest } from "./proto/anki/search_pb";
import { GraphsResponse, GraphsRequest } from "./proto/anki/stats_pb";
import { data, learn_data, mature_data, not_suspended_data, relearn_data, searchString } from "./stores";

export async function decodeResponse(resp: Response) {
    const blob = await resp.blob();
    const respBuf = await new Response(blob).arrayBuffer();
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
    return user ? `(${user}) AND (${added})` : added
}

function bodySwap(req: string | Uint8Array, newSearch: string) {
    const request = decodeRequest(req)
    request.search = searchJoin(request?.search, newSearch)
    return request.toBinary();
}

async function fetchAndDecode(fetchPromise: Promise<Response>) 
{
    const resp = await fetchPromise
    return await decodeResponse(resp)
}

export function patchFetch() {

    let search: null | SearchRequest = null
    
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
                return fetchAndDecode(realFetch(req, headers)) // swapSearch(req, "$1 AND prop:ivl>=21")
            }

            search = decodeRequest(origBody)

            searchString.set(search?.search)

            fetchAndDecode(realFetch(req, headers)).then(data.set) // I feel like theres a better way of doing this than tripping the amount of processing needed
            fetchSwappedSearch("prop:ivl>=21").then(mature_data.set)
            fetchSwappedSearch("is:learn").then(learn_data.set)
            fetchSwappedSearch("is:learn is:review").then(relearn_data.set)
            fetchSwappedSearch("-is:suspended").then(not_suspended_data.set)
            
            headers.body = origBody
        }
        return realFetch(req, headers)
    }
}