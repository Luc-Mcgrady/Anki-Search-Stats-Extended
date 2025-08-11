import _ from "lodash"
import { FSRS, FSRSVersion, generatorParameters, dateDiffInDays } from "ts-fsrs"
import { historicalFSRS, type HistoricalReviewLog } from "ts-fsrs-memorized"
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
        if (rating == 0) {
            continue
        }

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

    let historicalRevlogs: HistoricalReviewLog[] = revlogs
        .filter((revlog) => {
            return !(
                (revlog.ease == 0 && revlog.ivl != 0) ||
                (revlog.type == 3 && revlog.time == 0)
            )
        })
        .map((revlog) => {
            const rating = revlog.ease != 0 ? revlog.ease : -1
            return {
                rating,
                review: new Date(revlog.id),
                cid: revlog.cid,
            }
        })

    let presetFsrs = _.mapValues(
        configs,
        (config) =>
            new FSRS(
                generatorParameters({
                    enable_short_term: true,
                    w: config.fsrsParams5 ? config.fsrsParams5 : config.fsrsWeights,
                })
            )
    )

    let historicalCards = Object.fromEntries(
        cards.map((card) => [card.id, presetFsrs[config_mapping[card.did]]])
    ) as Record<number, FSRS>

    let { historicalRetention } = historicalFSRS(historicalRevlogs, historicalCards)

    const bw_matrix = <number[]>[]
    const stable_retrievability_days = <number[]>[]
    const stability_day_bins = <number[]>[]
    const day_medians = <number[]>[]
    const day_means = <number[]>[]
    const leech_probabilities = <number[]>[]
    const difficulty_day_bins = <number[]>[]
    const calibration = <number[]>[]

    return {
        retrievabilityDays: historicalRetention,
        stable_retrievability_days,
        fatigueRMSE: [],
        bw_matrix,
        stability_bins_days: stability_day_bins,
        day_medians,
        day_means,
        leech_probabilities,
        difficulty_days: difficulty_day_bins,
        calibration,
    }
}
