import { GraphsResponse, GraphsRequest } from "./proto/anki/stats_pb";

export async function decodeResponse(resp: Response) {
    const blob = await resp.blob();
    const respBuf = await new Response(blob).arrayBuffer();
    const bytes = new Uint8Array(respBuf)
    return GraphsResponse.fromBinary(bytes)!
}

const decoder = new TextDecoder()
const encoder = new TextEncoder()

export const realFetch = fetch

export function decodeRequest(req: string | Uint8Array) {
    if (typeof req == "string") {
        req = encoder.encode(req)
    }
    return GraphsRequest.fromBinary(req)
}

export function bodySwap(req: string | Uint8Array, newSearch: string) {
    const request = decodeRequest(req)
    request.search = `(${request.search}) AND (${newSearch})`
    return request.toBinary();
}

export async function fetchAndDecode(fetchPromise: Promise<Response>) 
{
    const resp = await fetchPromise
    return await decodeResponse(resp)
}