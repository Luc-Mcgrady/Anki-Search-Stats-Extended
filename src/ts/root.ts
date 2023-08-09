import { GraphsResponse, GraphsRequest } from "./proto/anki/stats_pb";

export async function decodeResponse(resp: Response) {
    const blob = await resp.blob();
    const respBuf = await new Response(blob).arrayBuffer();
    const bytes = new Uint8Array(respBuf)
    return GraphsResponse.fromBinary(bytes)!
}

const decoder = new TextDecoder()
const encoder = new TextEncoder()

export function bodySwap(body: string, newSearch: string) {
    const initial = GraphsRequest.fromBinary(encoder.encode(body))
    console.log({request: body, initial, GraphsRequest})
    initial.search = `(${initial.search}) AND (${newSearch})` 
    return initial.toBinary();
}

export async function fetchAndDecode(fetchPromise: Promise<Response>) 
{
    const resp = await fetchPromise
    return await decodeResponse(resp)
}