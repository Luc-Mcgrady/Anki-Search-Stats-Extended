import { realFetch } from "./root"

async function endpoint(endpoint: string, body?: string) {
    try {
        const resp = await realFetch(`/_anki/${endpoint}`, {
            method: "POST",
            body,
            headers: { "Content-Type": "application/binary" },
        })
        const blob = await resp.text()
        return JSON.parse(blob)
    } catch (e: any) {
        // Error handling
        const errorDetails =
            e instanceof Error
                ? `Error: ${e.message}\nStack: ${e.stack}`
                : `Unexpected error: ${JSON.stringify(e)}`

        alert(`Search Stats Extended has encountered an error, 
If you have recently updated the addon please ensure you have restarted Anki.

If the problem persists copy the following information into a github issue along with a description of what you were doing at the time:

${errorDetails}

https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/issues/new
`)
        throw e
    }
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

export async function getRevlogs(cids: number[], day_range: number) {
    return (await endpoint("revlogs", JSON.stringify({ cids, day_range }))) as Revlog[]
}
