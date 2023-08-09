import { SearchRequest, SearchResponse } from "./proto/anki/search_pb";
import { realFetch } from "./root";

/**
 * @description I wrote this function only to learn this endpoint wasn't implemented :(
 * @deprecated
 */
export async function search(search: string) {
    const resp = await realFetch("_anki/cardStats", {method: "POST", body: new SearchRequest({search}).toBinary()})
    const blob = await resp.blob()
    console.log({resp, blob})
    const buffer = await blob.arrayBuffer()
    const array = new Uint8Array(buffer)
    return SearchResponse.fromBinary(array)
}