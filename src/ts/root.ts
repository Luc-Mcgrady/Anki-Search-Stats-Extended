import { GraphsResponse } from "./proto/anki/stats_pb";

export async function decodeResponse(resp: Response) {
    const blob = await resp.blob();
    const respBuf = await new Response(blob).arrayBuffer();
    const bytes = new Uint8Array(respBuf)
    return GraphsResponse.fromBinary(bytes)!
}

export function swapSearch(request: string, newSearch: string) {
    return request.replace(/^(.+)/gm, newSearch + '');
}

export async function fetchAndDecode(
    fetchFunc: (...args:any[])=>Promise<Response>,
    req: string,
    ...args: any[]
    ) 
{
    const resp = await fetchFunc(req, ...args)
    return await decodeResponse(resp)
}