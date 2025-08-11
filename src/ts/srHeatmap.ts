import { forgetting_curve } from "ts-fsrs"
import { CardType } from "../../anki/ts/lib/tslib/cards"
import type { HeatmapData, HeatmapDimension } from "./heatmap"
import { getDecay, type CardData, type CardExtraData } from "./search"

export interface CardSRData {
    r: number
    s: number
}

export interface CardSRDataset {
    min_r: number
    max_r: number

    min_s: number
    max_s: number

    card_sr_data: CardSRData[]
}

export function create_card_sr_dataset(
    card_data: CardData[] | null,
    collection_today_timestamp: number
): CardSRDataset | null {
    if (card_data === null) {
        // We have not been given any card data
        return null
    }

    let dataset: CardSRDataset | null = null
    for (const card_data_entry of card_data) {
        if (card_data_entry.type !== CardType.Review) {
            // We don't care about new / [re]learning cards
            continue
        }

        const extra_data: CardExtraData = JSON.parse(card_data_entry.data)

        if (extra_data.s === undefined) {
            // We don't care about non-FSRS cards
            continue
        }

        // N.B. This is a bit of a fudge. Manual rescheduling can make this wrong.
        //      It is how native Anki does it too though.
        const last_review_timestamp = card_data_entry.due - card_data_entry.ivl
        const elapsed_days = collection_today_timestamp - last_review_timestamp

        const s = extra_data.s
        const r = forgetting_curve(getDecay(extra_data), elapsed_days, s)

        const card_sr_data = {
            s,
            r,
        }

        if (dataset === null) {
            dataset = {
                min_r: r,
                max_r: r,

                min_s: s,
                max_s: s,

                card_sr_data: [card_sr_data],
            }
        } else {
            dataset.min_r = Math.min(dataset.min_r, r)
            dataset.max_r = Math.max(dataset.max_r, r)

            dataset.min_s = Math.min(dataset.min_s, s)
            dataset.max_s = Math.max(dataset.max_s, s)

            dataset.card_sr_data.push(card_sr_data)
        }
    }

    return dataset
}

function create_dimension(
    min: number,
    max: number,
    bin_width: number,
    is_logarithmic: boolean
): HeatmapDimension {
    let raw_min = min
    let raw_max = max

    if (is_logarithmic) {
        raw_min = Math.log10(min)
        raw_max = Math.log10(max)
    }

    let nice_min = Math.floor(raw_min / bin_width) * bin_width
    let nice_max = Math.ceil(raw_max / bin_width) * bin_width

    const bin_count = Math.round((nice_max - nice_min) / bin_width)

    if (is_logarithmic) {
        nice_min = Math.pow(10, nice_min)
        nice_max = Math.pow(10, nice_max)
    }

    return {
        start_value: nice_min,
        end_value: nice_max,

        bin_count,

        is_logarithmic,
    }
}

export function calculate_sr_heatmap_data(
    dataset: CardSRDataset | null,
    r_bin_width: number,
    s_bin_width: number,
    s_is_logarithmic: boolean
): HeatmapData | null {
    if (dataset === null) {
        return null
    }

    const r_dim = create_dimension(dataset.min_r, dataset.max_r, r_bin_width, false)
    const s_dim = create_dimension(dataset.min_s, dataset.max_s, s_bin_width, s_is_logarithmic)

    const total_bins = r_dim.bin_count * s_dim.bin_count
    const raw_data = new Array(total_bins)

    // Put counts in bins
    for (const card of dataset.card_sr_data) {
        const raw_r_idx = (card.r - r_dim.start_value) / r_bin_width

        let raw_s_idx
        if (s_is_logarithmic) {
            raw_s_idx = (Math.log10(card.s) - Math.log10(s_dim.start_value)) / s_bin_width
        } else {
            raw_s_idx = (card.s - s_dim.start_value) / s_bin_width
        }

        const clean_r_idx = Math.min(r_dim.bin_count - 1, Math.max(0, Math.floor(raw_r_idx)))
        const clean_s_idx = Math.min(s_dim.bin_count - 1, Math.max(0, Math.floor(raw_s_idx)))

        const raw_data_idx = clean_r_idx + clean_s_idx * r_dim.bin_count

        if (raw_data[raw_data_idx] === undefined) {
            raw_data[raw_data_idx] = 1
        } else {
            raw_data[raw_data_idx] += 1
        }
    }

    return {
        x_dim: r_dim,
        y_dim: s_dim,

        raw_data,
    }
}
