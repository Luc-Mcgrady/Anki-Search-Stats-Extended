import _ from "lodash"
import type { CardData, Revlog } from "./search"

const rollover = SSEother.rollover * 60 * 60 * 1000
export const day_ms = 1000 * 60 * 60 * 24
export const today = Math.floor((Date.now() - rollover) / day_ms)

export function calculateRevlogStats(revlogData: Revlog[], cardData: CardData[]) {
    let id_card_data: Record<number, CardData> = {}
    for (const card of cardData) {
        id_card_data[card.id] = card
    }

    let revlog_times = []
    revlog_times[today] = 0
    let review_day_times = []
    review_day_times[today] = 0
    let review_day_count = []
    review_day_count[today] = 0
    let introduced_day_count = []
    introduced_day_count[today] = 0
    let reintroduced_day_count = []
    reintroduced_day_count[today] = 0
    let day_forgotten = []
    day_forgotten[today] = 0
    let intervals: number[][] = []
    intervals[today] = []
    let forgotten = new Set<number>()
    let card_times: Record<number, number> = {}
    let introduced = new Set<number>()
    let reintroduced = new Set<number>()
    let last_cids: Record<number, Revlog> = {}

    for (const revlog of revlogData) {
        const day = Math.floor((revlog.id - rollover) / day_ms)

        card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

        review_day_times[day] = (review_day_times[day] ?? 0) + revlog.time
        review_day_count[day] = (review_day_count[day] ?? 0) + 1

        if (revlog.ease == 0 && revlog.ivl == 0) {
            introduced.delete(revlog.cid)
            forgotten.add(revlog.cid)
            if (revlog.lastIvl != 0) {
                day_forgotten[day] = (day_forgotten[day] ?? 0) + 1
            }
        } else if (!introduced.has(revlog.cid)) {
            introduced_day_count[day] = (introduced_day_count[day] ?? 0) + 1
            if (reintroduced.has(revlog.cid)) {
                reintroduced_day_count[day] = (reintroduced_day_count[day] ?? 0) + 1
            }
            introduced.add(revlog.cid)
            reintroduced.add(revlog.cid)
            forgotten.delete(revlog.cid)
        }
    }

    for (const revlog of revlogData.reverse()) {
        const day = Math.floor((revlog.id - rollover) / day_ms)

        const after_review = last_cids[revlog.cid]
        // If the card is still learning, use the card data
        const ivl = after_review ? revlog.ivl : id_card_data[revlog.cid].ivl

        for (const intervalDay of _.range(
            day,
            Math.floor((after_review?.id - rollover) / day_ms) || today + 1
        )) {
            intervals[intervalDay] = intervals[intervalDay] ?? []
            intervals[intervalDay][ivl] = (intervals[intervalDay][ivl] ?? 0) + 1
        }

        last_cids[revlog.cid] = revlog
    }

    const burden = intervals.map((v, i) => {
        v[0] = 0
        delete v[0]
        return _.sum(v.map((val, ivl) => val / ivl))
    })

    const burden_change = burden.map((v, i) => v - (burden[i - 1] || 0))

    for (const card_time of Object.values(card_times)) {
        const key = Math.floor(card_time / 1000)
        revlog_times[key] = (revlog_times[key] ?? 0) + 1
    }

    const remaining_forgotten = forgotten.size

    return {
        review_day_times,
        review_day_count,
        revlog_times,
        introduced_day_count,
        reintroduced_day_count,
        burden,
        burden_change,
        day_forgotten,
        remaining_forgotten,
        intervals,
    }
}
