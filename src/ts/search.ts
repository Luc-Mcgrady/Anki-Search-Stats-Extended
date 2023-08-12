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
    card_id: number
    note_id: number
    deck: string
    added: number
    first_review: number
    latest_review: number
    due_date: number
    interval: number
    ease: number
    reviews: number
    average_secs: number
    total_secs: number
    card_type: string
    notetype: string
    custom_data: string
}

export async function getCardData(cids: number[]) {
    return await endpoint("cardData", JSON.stringify(cids)) as CardData[]
}