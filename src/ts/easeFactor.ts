import { createEmptyCard } from "ts-fsrs"
import { getFsrs } from "./MemorisedBar"
import { getExtraDataFromCard, type CardData } from "./search"

export function calculateEaseFactors(
    cards: CardData[],
    configs: typeof SSEother.deck_configs,
    config_mapping: typeof SSEother.deck_config_ids
) {
    return cards
        .map((c) => {
            const data = getExtraDataFromCard(c)
            if (!data.s || !data.d || !data.dr) {
                return
            }

            const difficulty = data.d
            const stability = data.s
            const dr = data.dr

            const fsrs = getFsrs(configs[config_mapping[c.did]])
            fsrs.parameters.request_retention = dr

            const fsrsCard = createEmptyCard()
            fsrsCard.difficulty = difficulty
            fsrsCard.stability = stability
            const next = fsrs.next_state(fsrsCard, c.ivl, 3)
            return next.stability / stability
        })
        .filter((a) => a !== undefined)
}
