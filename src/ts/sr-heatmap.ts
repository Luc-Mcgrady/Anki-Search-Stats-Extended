import { FSRS } from "ts-fsrs"
import type { HeatmapData } from "./heatmap"
import type { CardData, CardExtraData } from "./search"

interface CardState {
    r: number
    s: number
}

interface CardStateBounds {
    min_r: number
    max_r: number

    min_s: number
    max_s: number
}

export function calculate_sr_heatmap_data(
    card_data: CardData[] | null,
    r_bins: number,
    s_bins: number,
    collection_today_timestamp: number
): HeatmapData | null {
    if (card_data === null) {
        // We have not been given any card data
        return null
    }

    const total_bins = r_bins * s_bins
    const raw_data = new Array(total_bins)

    let card_state_bounds: CardStateBounds | null = null
    const data_points: CardState[] = []
    for (const card_data_entry of card_data) {
        if (card_data_entry.type !== 2) {
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

        if (card_state_bounds === null) {
            card_state_bounds = {
                min_r: r,
                max_r: r,

                min_s: s,
                max_s: s,
            }
        } else {
            card_state_bounds.min_r = Math.min(card_state_bounds.min_r, r)
            card_state_bounds.max_r = Math.max(card_state_bounds.max_r, r)

            card_state_bounds.min_s = Math.min(card_state_bounds.min_s, s)
            card_state_bounds.max_s = Math.max(card_state_bounds.max_s, s)
        }

        data_points.push({ r, s })
    }

    if (card_state_bounds === null) {
        // We have no valid cards
        return null
    }

    const r_bin_width = (card_state_bounds.max_r - card_state_bounds.min_r) / r_bins
    const s_bin_width = (card_state_bounds.max_s - card_state_bounds.min_s) / s_bins

    // Put counts in bins
    for (const data_point of data_points) {
        const raw_r_idx = (data_point.r - card_state_bounds.min_r) / r_bin_width
        const raw_s_idx = (data_point.s - card_state_bounds.min_s) / s_bin_width

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
        x_start: card_state_bounds.min_r,
        x_end: card_state_bounds.max_r,
        x_bins: r_bins,

        y_start: card_state_bounds.min_s,
        y_end: card_state_bounds.max_s,
        y_bins: s_bins,

        raw_data,
    }
}
