import type { PieDatum } from "./pie"
import { getCardData, search } from "./search"

export type SearchPieData = PieDatum & { search: string }

export async function getQuery(query: string, mode: string): Promise<number> {
    let cids: number[]
    if (!query) {
        query = "*"
    }

    try {
        cids = await search(query)
    } catch {
        return -1
    }

    if (mode === "Count") {
        return cids.length
    }
    const cards = await getCardData(cids)
    switch (mode) {
        case "Load":
            return cards.reduce((p, n) => (p += n.ivl ? 1 / n.ivl : 0), 0)
        case "Lapses":
            return cards.reduce((p, n) => (p += n.lapses), 0)
        case "Repetitions":
            return cards.reduce((p, n) => (p += n.reps), 0)
        default:
            mode = "Invalid Mode"
            return 0
    }
}
