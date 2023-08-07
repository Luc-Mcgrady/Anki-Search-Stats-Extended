import { GraphsResponse } from "./proto/anki/stats_pb";

export async function DecodeResponse(resp: Response) {
    const blob = await resp.blob();
    const respBuf = await new Response(blob).arrayBuffer();
    const bytes = new Uint8Array(respBuf)
    return GraphsResponse.fromBinary(bytes)!
}