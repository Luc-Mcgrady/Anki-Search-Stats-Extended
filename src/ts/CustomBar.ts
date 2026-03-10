import { getRevlogs, search } from "./search"

export type SearchBarData = {
    label: string,
    search: string,
    colour: string,
    value: number[],
}

export async function getQuery(query: string, mode: string): Promise<number[]> {
    let cids: number[]
    if (!query) {
        query = "*"
    }

    try {
        cids = await search(query)
    } catch {
        return []
    }

    const switch

    switch (mode) {
        case "time-distribution":
            for (const revlog of revlogs) {
                const time = Math.round(revlog.time / 1000)
                if (time < MAX_TIME) {
                    values[time]++
                }
            }
            break
        case "time-totals":
            for (const revlog of revlogs) {
                const time = Math.round(revlog.time / 1000)
                if (time < MAX_TIME) {
                    values[time] += time
                }
            }
            break
    }

    return values
}
