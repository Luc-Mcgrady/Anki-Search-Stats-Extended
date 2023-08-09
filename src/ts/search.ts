import { realFetch } from "./root";

export async function search(search: string) {
    const resp = await realFetch("/_anki/cardSearch", {method: "POST", body: search})
    const blob = await resp.text()

    console.log(blob)

    return JSON.parse(blob) as string[]
}