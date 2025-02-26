import { FSRS } from "ts-fsrs"
import { CardType } from "../../anki/ts/lib/tslib/cards"
import type { HeatmapData } from "./heatmap"
import type { CardData, CardExtraData } from "./search"

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
        const r = FSRS.prototype.forgetting_curve(elapsed_days, s)

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

export function calculate_sr_heatmap_data(
    dataset: CardSRDataset | null,
    r_bins: number,
    s_bins: number
): HeatmapData | null {
    if (dataset === null) {
        return null
    }

    const total_bins = r_bins * s_bins
    const raw_data = new Array(total_bins)

    const r_bin_width = (dataset.max_r - dataset.min_r) / r_bins
    const s_bin_width = (dataset.max_s - dataset.min_s) / s_bins

    // Put counts in bins
    for (const card of dataset.card_sr_data) {
        const raw_r_idx = (card.r - dataset.min_r) / r_bin_width
        const raw_s_idx = (card.s - dataset.min_s) / s_bin_width

        const clean_r_idx = Math.min(r_bins - 1, Math.max(0, Math.floor(raw_r_idx)))
        const clean_s_idx = Math.min(s_bins - 1, Math.max(0, Math.floor(raw_s_idx)))

        const raw_data_idx = clean_r_idx + clean_s_idx * r_bins

        if (raw_data[raw_data_idx] === undefined) {
            raw_data[raw_data_idx] = 1
        } else {
            raw_data[raw_data_idx] += 1
        }
    }

    return {
        x_start: dataset.min_r,
        x_end: dataset.max_r,
        x_bins: r_bins,

        y_start: dataset.min_s,
        y_end: dataset.max_s,
        y_bins: s_bins,

        raw_data,
    }
}
