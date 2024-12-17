import _ from "lodash"
import type { BarChart, BarDatum } from "./bar"
import { totalCalc } from "./barHelpers"
import type { CardData, Revlog } from "./search"

const rollover = SSEother.rollover ?? 0
export const day_ms = 1000 * 60 * 60 * 24

export function dayFromMs(ms: number) {
    return Math.floor((ms - rollover * 60 * 60 * 1000) / day_ms)
}

export const today = dayFromMs(Date.now())

interface SiblingReview {
    cid: number
    day: number
}

export type revlogBuckets = {
    all: number[][]
    young: number[][]
    mature: number[][]
}

export function IDify<T extends { id: number }>(array: T[]) {
    let id_data: Record<number, T> = {}
    for (const e of array) {
        id_data[e.id] = e
    }
    return id_data
}

export function calculateRevlogStats(
    revlogData: Revlog[],
    cardData: CardData[],
    end: number = today
) {
    let id_card_data = IDify(cardData)

    function emptyArray<T>(init: T): T[] {
        const empty_array: T[] = []
        empty_array[end] = init
        return empty_array
    }

    function initialEase() {
        return [0, 0, 0, 0]
    }

    function emptyRevlogBuckets(): revlogBuckets {
        return {
            all: emptyArray(initialEase()),
            young: emptyArray(initialEase()),
            mature: emptyArray(initialEase()),
        }
    }

    const empty_2d_array = []
    empty_2d_array[end] = []

    let revlog_times: number[] = emptyArray(0)
    let introduced_day_count: number[] = emptyArray(0)
    let reintroduced_day_count: number[] = emptyArray(0)
    let day_forgotten: number[] = emptyArray(0)

    let intervals: number[][] = []

    let day_initial_ease: number[][] = emptyArray(initialEase())
    let day_initial_reintroduced_ease: number[][] = emptyArray(initialEase())

    let day_ease = emptyRevlogBuckets()
    let fatigue_ease = emptyRevlogBuckets()
    let time_ease_seconds = emptyRevlogBuckets()

    let forgotten = new Set<number>()
    let card_times: Record<number, number> = {}
    let introduced = new Set<number>()
    let reintroduced = new Set<number>()
    let last_cids: Record<number, Revlog> = {}
    let burden_revlogs: Revlog[] = []

    let last_siblings: (undefined | SiblingReview)[] = []
    let sibling_time_ease: number[][] = emptyArray(initialEase())
    let day_review_count: number[] = []

    function incrementEase(ease_array: number[][], day: number, ease: number) {
        // Doesn't check for negative ease (manual reschedule)
        ease_array[day] = ease_array[day] ? ease_array[day] : initialEase()
        ease_array[day][ease] += 1
    }

    for (const revlog of revlogData) {
        const day = dayFromMs(revlog.id)
        const ease = revlog.ease - 1
        const second = Math.round(revlog.time / 1000)

        card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

        // Check for reschedules
        if (revlog.time != 0) {
            day_review_count[day] = (day_review_count[day] ?? -1) + 1
            incrementEase(fatigue_ease.all, day_review_count[day], ease)
            incrementEase(day_ease.all, day, ease)
            incrementEase(time_ease_seconds.all, second, ease)
        }

        if (revlog.lastIvl > 0) {
            incrementEase(day_ease.young, day, ease)
            incrementEase(fatigue_ease.young, day_review_count[day], ease)
            incrementEase(time_ease_seconds.young, second, ease)
            if (revlog.lastIvl >= 21) {
                incrementEase(day_ease.mature, day, ease)
                incrementEase(fatigue_ease.mature, day_review_count[day], ease)
                incrementEase(time_ease_seconds.mature, second, ease)

                const last_sibling = last_siblings[revlog.nid]
                if (last_sibling !== undefined && last_sibling.cid != revlog.cid) {
                    incrementEase(sibling_time_ease, day - last_sibling.day, ease)
                }
                last_siblings[revlog.nid] = {
                    cid: revlog.cid,
                    day,
                }
            } else {
                last_siblings[revlog.nid] = undefined
            }
        }
        if (revlog.ease == 0 && revlog.ivl == 0) {
            introduced.delete(revlog.cid)
            forgotten.add(revlog.cid)
            if (revlog.lastIvl != 0) {
                day_forgotten[day] = (day_forgotten[day] ?? 0) + 1
            }
        } else if (!introduced.has(revlog.cid) && revlog.ivl != 0) {
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
        const day = dayFromMs(revlog.id)
        const current = id_card_data[revlog.cid]

        const after_review = last_cids[revlog.cid]
        // If the card is still learning, use the card data
        let ivl = after_review ? revlog.ivl : current.ivl
        ivl = ivl >= 0 ? ivl : 1

        let to = after_review ? dayFromMs(after_review.id) : end

        for (const intervalDay of _.range(day, to)) {
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
    console.log({ time_ease_seconds })

    return {
        day_initial_ease,
        day_initial_reintroduced_ease,
        day_ease,
        fatigue_ease,
        time_ease_seconds,
        sibling_time_ease,
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

function retentionStats(data: BarDatum) {
    return [`${(100 * (1 - data.values[3])).toFixed(2)}% Correct`]
}

export function easeBarChart(
    eases: number[][],
    offset = today,
    normalize = false,
    columnLabeler: BarChart["columnLabeler"] = undefined
): BarChart {
    return {
        row_colours: EASE_COLOURS,
        row_labels: EASE_LABELS,
        data: Array.from(eases).map((data, label) => {
            const sum = _.sum(data)
            let values = [...(data ?? [0, 0, 0, 0])].reverse()
            values = normalize ? values.map((a) => a / sum) : values
            return {
                values,
                label: (label - offset).toString(),
            }
        }),
        tick_spacing: 5,
        reverse_legend: true,
        columnLabeler,
        extraStats: normalize ? retentionStats : totalCalc,
    }
}
