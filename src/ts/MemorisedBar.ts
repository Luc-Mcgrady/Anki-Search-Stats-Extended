import _ from "lodash"
import { FSRS, FSRSVersion, generatorParameters } from "ts-fsrs"
import { historicalFSRS, type HistoricalRevlog } from "ts-fsrs-memorized"
import type { CardData, Revlog } from "./search"

export interface LossBin {
    real: number
    predicted: number
    count: number
}

export function getMemorisedDays(
    revlogs: Revlog[],
    cards: CardData[],
    configs: typeof SSEother.deck_configs,
    config_mapping: typeof SSEother.deck_config_ids,
    leech_elapsed_threshold = 10,
    leech_min_reviews = 5
) {
    console.log(`ts-fsrs ${FSRSVersion}`)

    let historicalRevlogs: HistoricalRevlog[] = revlogs
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
                time: new Date(revlog.id),
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
        cards.map((card) => [card.id, { fsrs: presetFsrs[config_mapping[card.did]] }])
    )

    let { sumR } = historicalFSRS(historicalRevlogs, historicalCards)

    const bw_matrix = <number[]>[]
    const stable_retrievability_days = <number[]>[]
    const stability_day_bins = <number[]>[]
    const day_medians = <number[]>[]
    const day_means = <number[]>[]
    const leech_probabilities = <number[]>[]
    const difficulty_day_bins = <number[]>[]

    return {
        retrievabilityDays: sumR,
        stable_retrievability_days,
        fatigueRMSE: [],
        bw_matrix,
        stability_bins_days: stability_day_bins,
        day_medians,
        day_means,
        leech_probabilities,
        difficulty_days: difficulty_day_bins,
    }
}
