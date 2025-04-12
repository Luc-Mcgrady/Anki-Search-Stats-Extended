import { forgetting_curve } from "ts-fsrs"
import { day_ms } from "./revlogGraphs"
import type { CardData } from "./search"

export function calculateCardDataPies(
    cardData: CardData[],
    include_suspended: boolean,
    zero_inclusive: boolean
) {
    let lapses: number[] = []
    let repetitions: number[] = []
    let lapses_burden: number[] = []
    let lapses_avg_burden: number[] = []
    let repetitions_burden: number[] = []
    let repetitions_avg_burden: number[] = []
    let total_burden = 0
    let target_R_days: number[] = []
    const days_elapsed = SSEother.days_elapsed

    console.log(`cardData (1): ${JSON.stringify(cardData)}, size : ${cardData.length}`)
    for (const card of cardData ?? []) {
        console.log(`card : ${JSON.stringify(card)}`)
        if (include_suspended || card.queue !== -1) {
            if (card.reps > 0) {
                lapses[card.lapses] = (lapses[card.lapses] ?? 0) + 1
                repetitions[card.reps] = (repetitions[card.reps] ?? 0) + 1

                const burden = card.ivl > 0 ? 1 / card.ivl : 1
                total_burden += burden

                lapses_burden[card.lapses] = (lapses_burden[card.lapses] ?? 0) + burden
                const old_lapses_avg_burden = lapses_avg_burden[card.reps] ?? 0
                lapses_avg_burden[card.lapses] =
                    old_lapses_avg_burden + (burden - old_lapses_avg_burden) / lapses[card.lapses]

                repetitions_burden[card.reps] = (repetitions_burden[card.reps] ?? 0) + burden
                const old_repetitions_avg_burden = repetitions_avg_burden[card.reps] ?? 0
                repetitions_avg_burden[card.reps] =
                    old_repetitions_avg_burden +
                    (burden - old_repetitions_avg_burden) / repetitions[card.reps]

                const stability = JSON.parse(card.data).s
                if (stability && card.ivl > 0 && card.type == 2 && card.queue > 0) {
                    let due =
                        card.due < 100_000
                            ? card.due > 0
                                ? card.due - days_elapsed
                                : 0
                            : card.due / day_ms
                    const target_R = forgetting_curve(card.ivl, stability)
                    target_R_days[due] = (target_R_days[due] ?? 0) + target_R
                }
            }
        }
    }

    const load_by_reps_sorted = (cardData ?? [])
        .filter((card) => (include_suspended || card.queue !== -1) && card.reps > 0)
        .map((card) => [card.reps, card.ivl])
        .map(([reps, ivl]) => [reps, 1 / ivl])
        .sort((a, b) => a[0] - b[0])

    const repetitions_bucket_count = 20
    let repetitions_load_buckets = []

    if (load_by_reps_sorted.length > 20) {
        for (let bucket_index = 0; bucket_index < repetitions_bucket_count; bucket_index++) {
            let bucket_max_size = Math.floor(load_by_reps_sorted.length / repetitions_bucket_count)
            const bucket_start = bucket_index * bucket_max_size
            const bucket_end = Math.min(
                (bucket_index + 1) * bucket_max_size,
                load_by_reps_sorted.length
            )
            const bucket_size = bucket_end - bucket_start
            const bucket_data = load_by_reps_sorted.slice(bucket_start, bucket_end)
            const sum_load = bucket_data
                .map(([_, load]) => load)
                .reduce((sum, current) => sum + current, 0)
            const bucket_min_rep = bucket_data[0][0]
            const bucket_max_rep = bucket_data[bucket_size - 1][0]
            repetitions_load_buckets.push({
                start_rep: bucket_min_rep,
                end_rep: bucket_max_rep,
                load: {
                    sum: sum_load,
                    avg: sum_load / bucket_size,
                },
            })
            console.log(
                `Bucket ${bucket_index}: ${bucket_min_rep} - ${bucket_max_rep} reps, sum load: ${sum_load}, avg load: ${sum_load / bucket_size}`
            )
        }
    }

    if (!zero_inclusive) {
        delete lapses[0]
        delete lapses_burden[0]
    }

    const arraysToSanitize = [
        lapses,
        repetitions,
        lapses_burden,
        lapses_avg_burden,
        repetitions_burden,
        repetitions_avg_burden,
    ]

    arraysToSanitize.forEach(sanitize)

    return {
        lapses,
        repetitions,
        lapses_burden,
        lapses_avg_burden,
        repetitions_burden,
        repetitions_avg_burden,
        repetitions_load_buckets,
        total_burden,
        target_R_days,
    }
}

function sanitize(arr: number[]): number[] {
    let maxIndex = arr.length - 1
    for (let i = 0; i <= maxIndex; i++) {
        if (arr[i] === undefined) {
            arr[i] = 0
        }
    }
    return arr
}
