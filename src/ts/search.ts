import { realFetch } from "./root";

async function endpoint(endpoint: string, body: string) {
    const resp = await realFetch(`/_anki/${endpoint}`, {method: "POST", body})
    const blob = await resp.text()
    return JSON.parse(blob)
}

export async function search(search: string) {
    return await endpoint("cardSearch", search) as number[]
}

export interface CardData {
    id: number
    nid: number
    did: number
    ord: number
    mod: number
    usn: number
    type: number
    queue: number
    due: number
    ivl: number
    factor: number
    reps: number
    lapses: number
    left: number
    odue: number
    odid: number
    flags: number
    data: string
}
  

export async function getCardData(cids: number[]) {
    return await endpoint("cardData", JSON.stringify(cids)) as CardData[]
}