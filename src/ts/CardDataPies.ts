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
    let target_R_days: number[] = []
    const days_elapsed = SSEother.days_elapsed

    for (const card of cardData ?? []) {
        if (include_suspended || card.queue !== -1) {
            if (card.reps > 0) {
                lapses[card.lapses] = (lapses[card.lapses] ?? 0) + 1
                repetitions[card.reps] = (repetitions[card.reps] ?? 0) + 1

                const burden = card.ivl > 0 ? 1 / card.ivl : 1

                lapses_burden[card.lapses] = (lapses_burden[card.lapses] ?? 0) + burden
                const old_lapses_avg_burden = repetitions_avg_burden[card.reps] ?? 0
                lapses_avg_burden[card.reps] =
                    old_lapses_avg_burden + (old_lapses_avg_burden - burden) / lapses[card.reps]

                repetitions_burden[card.reps] = (repetitions_burden[card.reps] ?? 0) + burden
                const old_repetitions_avg_burden = repetitions_avg_burden[card.reps] ?? 0
                repetitions_avg_burden[card.reps] =
                    old_repetitions_avg_burden +
                    (old_repetitions_avg_burden - burden) / repetitions[card.reps]

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

    if (!zero_inclusive) {
        delete lapses[0]
        delete lapses_burden[0]
    }

    return {
        lapses,
        repetitions,
        lapses_burden,
        lapses_avg_burden,
        repetitions_burden,
        repetitions_avg_burden,
        target_R_days,
    }
}
