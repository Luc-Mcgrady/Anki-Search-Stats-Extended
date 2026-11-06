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

            const fsrs = getFsrs(configs[config_mapping[c.odid || c.did]])

            const memoryState = { difficulty, stability }
            const interval = fsrs.model.nextInterval(memoryState, dr)
            const next = fsrs.model.step({ memoryState, elapsedDays: interval, rating: 3 })
            return next.stability / stability
        })
        .filter((a) => a !== undefined)
}
