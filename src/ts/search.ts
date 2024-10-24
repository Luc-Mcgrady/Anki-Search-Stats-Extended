import { realFetch } from "./root"

async function endpoint(endpoint: string, body?: string) {
    const resp = await realFetch(`/_anki/${endpoint}`, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/binary" },
    })
    const blob = await resp.text()
    return JSON.parse(blob)
}

export async function search(search: string) {
    return (await endpoint("cardSearch", search)) as number[]
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

export interface Revlog {
    id: number
    cid: number
    //usn: number
    ease: 0 | 1 | 2 | 3 | 4
    ivl: number
    lastIvl: number
    //factor: number
    time: number
    //type: number
}

export async function getCardData(cids: number[]) {
    return (await endpoint("cardData", JSON.stringify(cids))) as CardData[]
}

export async function getRevlogs(cids: number[]) {
    return (await endpoint("revlogs", JSON.stringify(cids))) as Revlog[]
}
