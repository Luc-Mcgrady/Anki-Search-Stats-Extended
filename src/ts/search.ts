import { FSRS5_DEFAULT_DECAY } from "ts-fsrs"
import { realFetch } from "./root"

export function catchErrors<Return>(func: () => Return): Return {
    try {
        return func()
    } catch (e: any) {
        alert(`Search Stats Extended has encountered an error.

--- *** If you have recently updated the addon please ensure you have restarted Anki. *** ---

JS:
${e?.stack ? e.stack : e}`)
        throw e
    }
}

async function endpoint(endpoint: string, body?: string) {
    const resp = await realFetch(`/_anki/${endpoint}`, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/binary" },
    })

    if (!resp.ok) {
        alert(`Search Stats Extended has encountered an error.

--- *** If you have recently updated the addon please ensure you have restarted Anki. *** ---




If the problem persists copy the following information into a github issue (https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/issues/new) with a description of what you were doing at the time:

Fetch Response: ${resp.status}
${await resp.text()}`)
        throw resp.status
    }

    const blob = await resp.text()
    // Handle empty responses (e.g., from writeConfig endpoint)
    if (blob === "") {
        return null
    }
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
    // https://github.com/ankitects/anki/blob/main/pylib/anki/consts.py#L22-L29
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

export interface CardExtraData {
    d?: number
    dr?: number
    pos?: number
    s?: number
    decay?: number
}

export function getExtraDataFromCard(card: CardData): CardExtraData {
    return JSON.parse(card.data)
}

export function getCardDecay(card: CardData) {
    return getDecay(getExtraDataFromCard(card))
}

export function getDecay(data: CardExtraData) {
    return data.decay ?? FSRS5_DEFAULT_DECAY
}

export interface Revlog {
    id: number
    cid: number
    //usn: number
    ease: 0 | 1 | 2 | 3 | 4
    ivl: number
    lastIvl: number
    factor: number
    time: number
    /*
    Learning = 0,
    Review = 1,
    Relearning = 2,
    /// Old Anki versions called this "Cram" or "Early". It's assigned when
    /// reviewing cards before they're due, or when rescheduling is
    /// disabled.
    Filtered = 3,
    Manual = 4,
    Rescheduled = 5,
    */
    type: number
}

export async function openLocaleFolder() {
    await endpoint("openLocaleFolder")
}

export async function getCardData(cids: number[]) {
    return (await endpoint("cardData", JSON.stringify(cids))) as CardData[]
}

export async function saveConfigValue(key: string, value: any) {
    await endpoint("writeConfig", JSON.stringify({ key, value }))
}

export async function getRevlogs(cids: number[], day_range: number) {
    const response = (await endpoint("revlogs", JSON.stringify({ cids, day_range }))) as {
        columns?: string[]
        data?: any[][]
    }

    if (!response.columns || !response.data) {
        alert("Search Stats Extended has been updated. Please restart Anki.")
        return null
    }

    // Build column index map once for efficient lookups
    const idx: Record<string, number> = {}
    response.columns.forEach((col, i) => (idx[col] = i))

    // Convert array-of-arrays to array-of-objects
    // Preallocate array for better performance
    const revlogs = new Array<Revlog>(response.data.length)
    for (let i = 0; i < response.data.length; i++) {
        const row = response.data[i]
        revlogs[i] = {
            id: row[idx.id],
            cid: row[idx.cid],
            ease: row[idx.ease] as 0 | 1 | 2 | 3 | 4,
            ivl: row[idx.ivl],
            lastIvl: row[idx.lastIvl],
            time: row[idx.time],
            factor: row[idx.factor],
            type: row[idx.type],
        }
    }

    return revlogs
}

export function browserSearch(search: string) {
    window.bridgeCommand(`browserSearch:${search}`)
}

export function browserSearchCids(cids: (number | string)[]) {
    browserSearch(`cid:${cids.join(",")}`)
}
