import * as d3 from "d3"
import _ from "lodash"
import {
    type Card,
    checkParameters,
    createEmptyCard,
    dateDiffInDays,
    default_w,
    type FSRS,
    fsrs as Fsrs,
    type FSRSState,
    FSRSVersion,
    generatorParameters,
} from "ts-fsrs"
import type { LossBar } from "./bar"
import type { DeckConfig } from "./config"
import { type Buckets, dayFromMs, emptyBuckets, IDify, rollover_ms, today } from "./revlogGraphs"
import type { CardData, Revlog } from "./search"

export interface LossBin {
    real: number
    predicted: number
    count: number
}

/**
 * Accurately implements the FSRS outlier filtering logic from the reference Rust code.
 * This function identifies cards whose first review interval is an outlier and returns
 * a set of all revlog IDs belonging to those cards.
 * @param revlogs The full list of review logs.
 * @returns A Set containing the IDs of all revlogs for cards deemed outliers.
 */
function applyOutlierFilter(revlogs: Revlog[]): Set<number> {
    // Step 1: Group revlogs by card and identify the first review interval.
    // An "item" here represents a card's second review and its history.
    type SecondReviewItem = {
        cardId: number
        firstRating: number
        secondRating: number
        deltaT: number
    }
    const secondReviewItems: SecondReviewItem[] = []
    const revlogsByCard = _.groupBy(revlogs, (r) => r.cid)

    for (const cardId in revlogsByCard) {
        const cardRevlogs = revlogsByCard[cardId]
        if (cardRevlogs.length < 2) continue

        const firstReview = cardRevlogs[0]
        const secondReview = cardRevlogs[1]
        const thirdReview = cardRevlogs[2]

        if (firstReview && secondReview && thirdReview) {
            secondReviewItems.push({
                cardId: Number(cardId),
                firstRating: firstReview.ease,
                secondRating: secondReview.ease,
                deltaT: dateDiffInDays(new Date(secondReview.id), new Date(thirdReview.id)),
            })
        }
    }

    // Step 2: Group items by first rating and then by delta_t.
    // groups[firstRating][deltaT] = items[]
    const groups: Record<number, Record<number, SecondReviewItem[]>> = {}
    for (const item of secondReviewItems) {
        const ratingGroup = (groups[item.firstRating] ??= {})
        const deltaTGroup = (ratingGroup[item.deltaT] ??= [])
        deltaTGroup.push(item)
    }

    // This will store the (firstRating, deltaT) pairs that are marked for removal.
    const removedPairs: Record<number, Set<number>> = {
        1: new Set(),
        2: new Set(),
        3: new Set(),
        4: new Set(),
    }

    // Step 3: Apply the filtering logic to each rating group.
    for (const ratingStr in groups) {
        const rating = Number(ratingStr)
        const deltaTGroups = groups[rating]

        let subGroups = Object.entries(deltaTGroups).map(([dt, items]) => ({
            deltaT: Number(dt),
            items: items,
        }))

        // Sort by number of items (asc), then by delta_t (asc).
        // This is equivalent to the Rust code's sort followed by a reverse iteration.
        subGroups.sort((a, b) => {
            if (a.items.length !== b.items.length) {
                return a.items.length - b.items.length
            }
            return a.deltaT - b.deltaT
        })

        const totalInGroup = subGroups.reduce((sum, sg) => sum + sg.items.length, 0)
        const removalThreshold = Math.max(20, Math.floor(totalInGroup / 20))
        let hasBeenRemoved = 0

        for (const subGroup of subGroups) {
            // Phase 1: Unconditionally remove the smallest groups until the threshold is met.
            if (hasBeenRemoved + subGroup.items.length < removalThreshold) {
                hasBeenRemoved += subGroup.items.length
                removedPairs[rating].add(subGroup.deltaT)
                continue
            }

            // Phase 2: Conditionally keep or remove remaining groups.
            const keep = subGroup.items.length >= 6 && subGroup.deltaT <= (rating !== 4 ? 100 : 365)
            if (!keep) {
                removedPairs[rating].add(subGroup.deltaT)
            }
        }
    }

    // Step 4: Identify all revlogs for cards whose first interval was flagged for removal.
    const cardIdToPair = new Map<number, { firstRating: number; deltaT: number }>()
    for (const item of secondReviewItems) {
        cardIdToPair.set(item.cardId, { firstRating: item.firstRating, deltaT: item.deltaT })
    }

    const excludedRevlogIds = new Set<number>()
    for (const revlog of revlogs) {
        const pair = cardIdToPair.get(revlog.cid)
        if (pair && removedPairs[pair.firstRating]?.has(pair.deltaT)) {
            excludedRevlogIds.add(revlog.id)
        }
    }

    // Remove non contiguous revlogs
    const ignoredCids = new Set<number>()
    for (const revlog of revlogs) {
        if (ignoredCids.has(revlog.cid)) {
            excludedRevlogIds.add(revlog.id)
        }
        if (excludedRevlogIds.has(revlog.id)) {
            ignoredCids.add(revlog.cid)
        }
    }

    if (excludedRevlogIds.size > 0) {
        console.log(`Outlier filter excluded ${excludedRevlogIds.size} reviews from stats.`)
    }

    return excludedRevlogIds
}

export function getMemorisedDays(
    revlogs: Revlog[],
    cards: CardData[],
    configs: typeof SSEother.deck_configs,
    config_mapping: typeof SSEother.deck_config_ids,
    last_forget: number[] = [],
    leech_elapsed_threshold = 10,
    leech_min_reviews = 5
) {
    console.log(`ts-fsrs ${FSRSVersion}`)

    // Apply the new outlier filtering logic at the start.
    const excludedRevlogIds = applyOutlierFilter(revlogs)

    let deckFsrs: Record<number, FSRS> = {}
    let fsrsCards: Record<number, Card> = {}

    let cards_by_id = IDify(cards)

    function getFsrs(config: DeckConfig) {
        const id = config.id
        if (!deckFsrs[id]) {
            const configParams = [
                config.fsrsParams6,
                config.fsrsParams5,
                config.fsrsParams4,
                config.fsrsWeights,
            ]

            const params =
                configParams.find((arr) => Array.isArray(arr) && arr.length > 0) ?? default_w

            deckFsrs[id] = Fsrs(
                generatorParameters({
                    w: checkParameters(params),
                    enable_fuzz: false,
                    enable_short_term: true,
                })
            )
        }
        return deckFsrs[id]
    }

    let retrievabilityDays: number[] = []
    let totalCards: number[] = []
    let noteRetrievabilityDays: number[] = []
    let stable_retrievability_days: number[] = []

    let cardCounts = cards.reduce(
        (p, c) => {
            p[c.nid] = (p[c.nid] ?? 0) + 1
            return p
        },
        <number[]>[]
    )

    function card_config(cid: number) {
        const card = cards_by_id[cid]
        if (!card) {
            return undefined
        }
        return configs[config_mapping[card.did]]
    }

    let stability_day_bins: number[][] = []
    let difficulty_day_bins: number[][] = []

    const calibration_bin_count = 20
    let calibration = <LossBin[]>Array(calibration_bin_count)

    function forgetting_curve(
        fsrs: FSRS,
        s: number,
        from: number,
        to: number,
        card: Card,
        cid: number
    ) {
        for (const day of _.range(from, to)) {
            const retrievability = fsrs.forgetting_curve(day - from, s)
            const card_count = cardCounts[cards_by_id[cid].nid]
            retrievabilityDays[day] = (retrievabilityDays[day] || 0) + retrievability
            totalCards[day] = (totalCards[day] | 0) + 1

            // Ignore deleted notes for note count
            if (card_count) {
                noteRetrievabilityDays[day] =
                    (noteRetrievabilityDays[day] || 0) + retrievability / card_count
            }
            // If the cards not been forgotten
            if (card.stability) {
                const stability_bin = Math.round(s)
                stability_day_bins[day] ??= []
                stability_day_bins[day][stability_bin] =
                    (stability_day_bins[day][stability_bin] || 0) + 1
                const difficulty_bin = Math.round(card.difficulty * 10) - 1
                difficulty_day_bins[day] ??= Array(100).fill(0)
                difficulty_day_bins[day][difficulty_bin] += 1
                function stability_weight(s: number): number {
                    return 1 - Math.exp(-((8 / 365) * s))
                }
                stable_retrievability_days[day] =
                    (stable_retrievability_days[day] || 0) +
                    retrievability * stability_weight(card.stability)
            }
        }
    }

    let last_stability: number[] = []

    const default_bin = { predicted: 0, real: 0, count: 0 }
    function incrementLoss(bin: LossBin | null, predicted: number, real: number) {
        bin ??= { ...default_bin }

        bin.predicted = (bin.predicted || 0) + predicted
        bin.real = (bin.real || 0) + real
        bin.count = (bin.count || 0) + 1

        return bin
    }

    let fatigue_bins: Buckets<LossBin[]> = emptyBuckets(() => [])
    let today_so_far = 0
    let last_date = new Date()

    let bw_matrix_count: Record<number, LossBin[]> = {}
    let day_medians: number[] = []
    let day_means: number[] = []
    let last_day = dayFromMs(revlogs[0].id)
    let probabilities = _.mapValues(
        _.groupBy(revlogs, (r) => r.cid),
        (_) => [1]
    )

    let log: any[] = []
    for (const revlog of revlogs) {
        const config = card_config(revlog.cid)
        if (!config) {
            continue
        }

        const grade = revlog.ease
        const new_card = !fsrsCards[revlog.cid]
        const now = new Date(revlog.id)
        const fsrs = getFsrs(config)
        let card = fsrsCards[revlog.cid] ?? createEmptyCard(new Date(revlog.cid))

        for (let day = last_day; day < dayFromMs(revlog.id); day++) {
            const stabilities = Object.values(last_stability)
            day_medians[day] = d3.quantile(stabilities, 0.5) ?? 0
            day_means[day] = d3.mean(stabilities) ?? 0
        }
        last_day = dayFromMs(revlog.id)

        // on forget
        if (revlog.factor == 0 && revlog.type == 4 && !new_card) {
            card = fsrs.forget(card, now).card
            fsrsCards[revlog.cid] = card
            probabilities[revlog.cid] = [1]
        }
        // set due date or reschedule
        if (grade == 0) {
            continue
        }
        // cram
        if (revlog.type == 3 && revlog.factor == 0) {
            continue
        }
        if (last_stability[revlog.cid]) {
            const previous = dayFromMs(card.last_review!.getTime())
            const stability = last_stability[revlog.cid]
            forgetting_curve(fsrs, stability, previous, dayFromMs(revlog.id), card, revlog.cid)
        }

        let memoryState: FSRSState | null = null
        let elapsed = 0
        if (card.last_review) {
            memoryState = card.stability
                ? {
                      difficulty: card.difficulty,
                      stability: card.stability,
                  }
                : null
            const oldDate = new Date(card.last_review.getTime() - rollover_ms)
            oldDate.setHours(0, 0, 0, 0)
            const newDate = new Date(now.getTime() - rollover_ms)
            newDate.setHours(0, 0, 0, 0)
            elapsed = dateDiffInDays(oldDate, newDate)

            if (newDate.getTime() != last_date.getTime()) {
                today_so_far = 0
                last_date = newDate
            }

            const p = fsrs.forgetting_curve(elapsed, card.stability)
            const y = grade > 1 ? 1 : 0

            let card_type: LossBin[]

            fatigue_bins.all[today_so_far] = incrementLoss(fatigue_bins.all[today_so_far], p, y)

            if (elapsed >= 1) {
                if (elapsed >= leech_elapsed_threshold) {
                    if (!new_card) {
                        const leech_probabilities = probabilities[revlog.cid]
                        for (let j = leech_probabilities.length + y - 1; j >= 0; j--) {
                            leech_probabilities[j] =
                                (leech_probabilities[j] ?? 0) * (1 - p) +
                                (j > 0 ? leech_probabilities[j - 1] * p : 0)
                        }
                    }
                }

                if (!new_card && (last_forget[revlog.cid] ?? 0) < revlog.id) {
                    // B-W matrix
                    if (card.stability > 1) {
                        const r_bin_power = 1.4
                        const r_bin = _.round(
                            Math.pow(
                                r_bin_power,
                                Math.floor(Math.log(card.stability) / Math.log(r_bin_power))
                            ),
                            2
                        )
                        const d_bin = Math.round(card.difficulty)
                        bw_matrix_count[r_bin] ??= []
                        let retention_row = bw_matrix_count[r_bin]
                        retention_row[d_bin] = incrementLoss(retention_row[d_bin], p, y)
                    }

                    // Calibration graph
                    if (!excludedRevlogIds.has(revlog.id)) {
                        let calibration_r_bin =
                            Math.floor(Math.exp(Math.log(calibration_bin_count + 1) * p)) - 1
                        calibration[calibration_r_bin] = incrementLoss(
                            calibration[calibration_r_bin],
                            p,
                            y
                        )
                        log.push({
                            d: card.difficulty,
                            s: card.stability,
                            id: revlog.id,
                            r: p,
                            y: 1,
                        })
                    }
                }

                fatigue_bins.not_learn[today_so_far] = incrementLoss(
                    fatigue_bins.not_learn[today_so_far],
                    p,
                    y
                )
                if (elapsed >= 21) {
                    card_type = fatigue_bins.mature
                } else {
                    card_type = fatigue_bins.young
                }
            } else {
                card_type = fatigue_bins.learn
            }
            card_type[today_so_far] = incrementLoss(card_type[today_so_far], p, y)

            today_so_far += 1
        }
        const newState = fsrs.next_state(memoryState, elapsed, grade)
        card.last_review = now
        card.stability = newState.stability
        card.difficulty = newState.difficulty
        last_stability[revlog.cid] = card.stability // To prevent "forget" affecting the forgetting curve

        fsrsCards[revlog.cid] = card
    }

    console.log(log)

    let inaccurate_cids: any[] = []
    let accurate_cids: number[] = []

    for (const [cid, card] of Object.entries(fsrsCards)) {
        const num_cid = +cid
        const previous = dayFromMs(card.last_review!.getTime())
        const fsrs = getFsrs(card_config(num_cid)!)
        forgetting_curve(fsrs, last_stability[num_cid], previous, today + 1, card, num_cid)
        if (cards_by_id[num_cid].data && JSON.parse(cards_by_id[num_cid].data).s) {
            const expected = last_stability[num_cid]
            const actual = JSON.parse(cards_by_id[num_cid].data).s
            if (Math.abs(expected - actual) > 0.01) {
                inaccurate_cids.push({
                    cid: num_cid,
                    expected: expected.toFixed(2),
                    actual: actual.toFixed(2),
                })
            } else {
                accurate_cids.push(num_cid)
            }
        }
    }

    if (inaccurate_cids.length) {
        const mean_error = _.meanBy(inaccurate_cids, (a) =>
            Math.abs(a.expected - a.actual)
        ).toFixed(2)
        console.warn(
            `The stability of the following ${inaccurate_cids.length}/${
                inaccurate_cids.length + accurate_cids.length
            } cards differ between SSE and anki with a mean error of ${mean_error}:`,
            { inaccurate_cids, accurate_cids }
        )
    }

    const fatigueRMSE = _.mapValues(fatigue_bins, (bins) =>
        bins.map(
            ({ real, predicted, count }) =>
                [((real - predicted) / count) ** 2 * count, count] as LossBar
        )
    )

    const leech_probabilities = _.mapValues(probabilities, (p) =>
        p.length > leech_min_reviews ? _.sum(p) : 1
    )

    return {
        retrievabilityDays,
        totalCards,
        noteRetrievabilityDays,
        stable_retrievability_days,
        fatigueRMSE,
        bw_matrix: bw_matrix_count,
        stability_bins_days: stability_day_bins,
        day_medians,
        day_means,
        leech_probabilities,
        difficulty_days: difficulty_day_bins,
        calibration,
    }
}
