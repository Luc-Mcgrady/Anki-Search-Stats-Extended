import _ from "lodash"
import { barDateLabeler, type BarChart } from "./bar"
import type { CardData, Revlog } from "./search"

//@ts-ignore
const rollover = SSEother.rollover ?? 4
export const day_ms = 1000 * 60 * 60 * 24
export const today = Math.floor((Date.now() - rollover) / day_ms)

export function calculateRevlogStats(
    revlogData: Revlog[],
    cardData: CardData[],
    end: number = today
) {
    let id_card_data: Record<number, CardData> = {}
    for (const card of cardData) {
        id_card_data[card.id] = card
    }

    function emptyArray<T>(init: T): T[] {
        const empty_array: T[] = []
        empty_array[end] = init
        return empty_array
    }

    function initialEase() {
        return [0, 0, 0, 0]
    }

    const empty_2d_array = []
    empty_2d_array[end] = []

    let revlog_times: number[] = emptyArray(0)
    let introduced_day_count: number[] = emptyArray(0)
    let reintroduced_day_count: number[] = emptyArray(0)
    let day_forgotten: number[] = emptyArray(0)

    let intervals: number[][] = emptyArray([])
    let day_initial_ease: number[][] = emptyArray(initialEase())
    let day_initial_reintroduced_ease: number[][] = emptyArray(initialEase())
    let day_ease: number[][] = emptyArray(initialEase())

    let forgotten = new Set<number>()
    let card_times: Record<number, number> = {}
    let introduced = new Set<number>()
    let reintroduced = new Set<number>()
    let last_cids: Record<number, Revlog> = {}
    let burden_revlogs: Revlog[] = []

    function incrementEase(ease_array: number[][], day: number, ease: number) {
        // Doesn't check for negative ease (manual reschedule)
        ease_array[day] = ease_array[day] ? ease_array[day] : initialEase()
        ease_array[day][ease] += 1
    }

    for (const revlog of revlogData) {
        const day = Math.floor((revlog.id - rollover) / day_ms)
        const ease = revlog.ease - 1

        card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time
        incrementEase(day_ease, day, ease)

        if (revlog.ease == 0 && revlog.ivl == 0) {
            introduced.delete(revlog.cid)
            forgotten.add(revlog.cid)
            if (revlog.lastIvl != 0) {
                day_forgotten[day] = (day_forgotten[day] ?? 0) + 1
            }
        } else if (!introduced.has(revlog.cid)) {
            introduced_day_count[day] = (introduced_day_count[day] ?? 0) + 1

            incrementEase(day_initial_reintroduced_ease, day, ease)
            if (reintroduced.has(revlog.cid)) {
                reintroduced_day_count[day] = (reintroduced_day_count[day] ?? 0) + 1
            } else {
                incrementEase(day_initial_ease, day, ease)
            }
            introduced.add(revlog.cid)
            reintroduced.add(revlog.cid)
            forgotten.delete(revlog.cid)
        }
        if (revlog.ivl >= 0 || id_card_data[revlog.cid].ivl < 0) {
            burden_revlogs.push(revlog)
        }
    }

    // "reduceRight" Used here to iterate backwards, never returns true
    burden_revlogs.reduceRight((_p, revlog) => {
        const day = Math.floor((revlog.id - rollover) / day_ms)

        const after_review = last_cids[revlog.cid]
        // If the card is still learning, use the card data
        const ivl = after_review ? revlog.ivl : id_card_data[revlog.cid].ivl

        for (const intervalDay of _.range(
            day,
            Math.floor((after_review?.id - rollover) / day_ms) || end + 1
        )) {
            intervals[intervalDay] = intervals[intervalDay] ?? []
            intervals[intervalDay][ivl] = (intervals[intervalDay][ivl] ?? 0) + 1
        }

        last_cids[revlog.cid] = revlog

        return undefined
    }, undefined)

    const burden = Array.from(intervals).map((v) => {
        if (!v) {
            return 0
        } else {
            delete v[0]
            return _.sum(v.map((val, ivl) => val / ivl)) ?? 0
        }
    })

    const burden_change = burden.map((v, i) => v - (burden[i - 1] || 0))

    for (const card_time of Object.values(card_times)) {
        const key = Math.floor(card_time / 1000)
        revlog_times[key] = (revlog_times[key] ?? 0) + 1
    }

    const remaining_forgotten = forgotten.size

    return {
        day_initial_ease,
        day_initial_reintroduced_ease,
        day_ease,
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

const EASE_COLOURS = ["#a50026", "#fdbe70", "#b6e076", "#006837"].reverse()
const EASE_LABELS = ["Again", "Hard", "Good", "Easy"].reverse()

export function easeBarChart(eases: number[][], offset = today): BarChart {
    return {
        row_colours: EASE_COLOURS,
        row_labels: EASE_LABELS,
        data: Array.from(eases).map((values, label) => ({
            values: [...(values ?? [0, 0, 0, 0])].reverse(),
            label: (label - offset).toString(),
        })),
        tick_spacing: 5,
        reverse_legend: true,
        columnLabeler: barDateLabeler,
    }
}
