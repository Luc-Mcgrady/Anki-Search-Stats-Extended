import _ from "lodash"
import { isNotSuspended } from "./ankiUtilities"
import type { BarChart, BarDatum } from "./bar"
import { totalCalc } from "./barHelpers"
import { i18n } from "./i18n"
import type { CardData, Revlog } from "./search"

const rollover = SSEother.rollover ?? 0
export const rollover_ms = rollover * 60 * 60 * 1000
export const day_ms = 1000 * 60 * 60 * 24

const timezone_offset_mins = new Date().getTimezoneOffset()
const timezone_offset_ms = timezone_offset_mins * 60 * 1000
export function dayFromMs(ms: number) {
    return Math.floor((ms - rollover_ms) / day_ms)
}

export const today = dayFromMs(Date.now())

interface SiblingReview {
    cid: number
    day: number
}

export type Buckets<T> = {
    learn: T
    young: T
    mature: T
    not_learn: T
    all: T
}

export function emptyBuckets<T>(init: () => T): Buckets<T> {
    return {
        learn: init(),
        not_learn: init(),
        young: init(),
        mature: init(),
        all: init(),
    }
}

export type RevlogBuckets = Buckets<number[][]>

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
    include_suspended: boolean,
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

    function emptyRevlogBuckets(): RevlogBuckets {
        return emptyBuckets(() => emptyArray(initialEase()))
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
    let interval_ease = emptyArray(initialEase())
    let day_review_hours = emptyArray(Array(24).fill(0))
    let day_filtered_review_hours = emptyArray(Array(24).fill(0))

    let day_ease = emptyRevlogBuckets()
    let fatigue_ease = emptyRevlogBuckets()
    let time_ease_seconds = emptyRevlogBuckets()

    let forgotten = new Set<number>()
    let card_times: Record<number, number> = {}
    let introduced = new Map<number, Date>()
    let reintroduced = new Map<number, Date>()
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
        const hour = Math.floor(((revlog.id - timezone_offset_ms) % day_ms) / (60 * 60 * 1000))
        const ease = revlog.ease - 1
        const second = Math.round(revlog.time / 1000)
        const card = id_card_data[revlog.cid]

        card_times[revlog.cid] = (card_times[revlog.cid] ?? 0) + revlog.time

        // Check for reschedules
        if (revlog.time != 0) {
            if (revlog.type < 3) {
                day_review_hours[day] ??= Array(24).fill(0)
                day_review_hours[day][hour] = day_review_hours[day][hour] + 1
            }
            day_filtered_review_hours[day] ??= Array(24).fill(0)
            day_filtered_review_hours[day][hour] = day_filtered_review_hours[day][hour] + 1

            day_review_count[day] = (day_review_count[day] ?? -1) + 1
            incrementEase(fatigue_ease.all, day_review_count[day], ease)
            incrementEase(day_ease.all, day, ease)
            incrementEase(time_ease_seconds.all, second, ease)
        }

        incrementEase(interval_ease, revlog.lastIvl < 0 ? 0 : revlog.lastIvl, ease)
        if (revlog.lastIvl > 0) {
            incrementEase(day_ease.not_learn, day, ease)
            incrementEase(fatigue_ease.not_learn, day_review_count[day], ease)
            incrementEase(time_ease_seconds.not_learn, second, ease)
            if (revlog.lastIvl >= 21) {
                incrementEase(day_ease.mature, day, ease)
                incrementEase(fatigue_ease.mature, day_review_count[day], ease)
                incrementEase(time_ease_seconds.mature, second, ease)
                if (card) {
                    const last_sibling = last_siblings[card.nid]
                    if (last_sibling !== undefined && last_sibling.cid != revlog.cid) {
                        incrementEase(sibling_time_ease, day - last_sibling.day, ease)
                    }
                    last_siblings[card.nid] = {
                        cid: revlog.cid,
                        day,
                    }
                }
            } else {
                incrementEase(day_ease.young, day, ease)
                incrementEase(fatigue_ease.young, day_review_count[day], ease)
                incrementEase(time_ease_seconds.young, second, ease)
                if (card) {
                    last_siblings[card.nid] = undefined
                }
            }
        } else {
            incrementEase(day_ease.learn, day, ease)
            incrementEase(fatigue_ease.learn, day_review_count[day], ease)
            incrementEase(time_ease_seconds.learn, second, ease)
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
            introduced.set(revlog.cid, new Date(revlog.id))
            reintroduced.set(revlog.cid, new Date(revlog.id))
            forgotten.delete(revlog.cid)
        }
        if (card) {
            if (revlog.ivl >= 0 || card.ivl < 0) {
                burden_revlogs.push(revlog)
            }
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

        // If the card is suspended
        if (!after_review && current.queue == -1) {
            ivl = -1
        }

        let to = after_review ? dayFromMs(after_review.id) : end + 1

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

    for (const card_time of Object.values(card_times)) {
        const key = Math.floor(card_time / 1000)
        revlog_times[key] = (revlog_times[key] ?? 0) + 1
    }

    const remaining_forgotten = forgotten.size

    let lapse_by_introduced_distribution = new Array<number>() // [ratioBins, countBins]

    for (const card of cardData) {
        if (isNotSuspended(card) || include_suspended) {
            const introduced_date = introduced.get(card.id)
            const reintroduced_date = reintroduced.get(card.id)
            const considered_date = reintroduced_date ?? introduced_date ?? Date.now()
            if (introduced_date && reintroduced_date) {
                const lapse = card.lapses
                const introduced_duration = (Date.now() - considered_date.valueOf()) / day_ms
                const ratio = Math.floor((lapse * 100) / introduced_duration)
                lapse_by_introduced_distribution[ratio] =
                    (lapse_by_introduced_distribution[ratio] ?? 0) + 1
            }
        }
    }

    for (let i = 0; i < lapse_by_introduced_distribution.length; i++) {
        console.log(`Lapse Ratio: ${i}, Count: ${lapse_by_introduced_distribution[i]}`)
    }

    return {
        day_initial_ease,
        day_initial_reintroduced_ease,
        day_ease,
        fatigue_ease,
        time_ease_seconds,
        sibling_time_ease,
        interval_ease,
        revlog_times,
        introduced_day_count,
        reintroduced_day_count,
        burden,
        day_forgotten,
        remaining_forgotten,
        intervals,
        day_review_hours,
        day_filtered_review_hours,
        lapse_by_introduced_distribution,
    }
}

export const EASE_COLOURS = ["#a50026", "#fdbe70", "#b6e076", "#006837"].reverse()
export const EASE_LABELS = [i18n("again"), i18n("hard"), i18n("good"), i18n("easy")].reverse()

export function retentionStats(data: BarDatum) {
    return [_.sum(data.values) ? formatRetention(1 - data.values[3]) : "No data"]
}

export function formatRetention(value: number) {
    return i18n("percent-correct", { percentage: (100 * value).toFixed(2) })
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
