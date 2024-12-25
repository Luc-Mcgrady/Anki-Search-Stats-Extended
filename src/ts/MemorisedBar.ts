import _ from "lodash"
import { type Card, createEmptyCard, type FSRS, fsrs as Fsrs } from "ts-fsrs"
import type { DeckConfig } from "./config"
import { dayFromMs, IDify, today } from "./revlogGraphs"
import type { CardData, Revlog } from "./search"

type CardCid = Card & {
    cid: number
}

export function getMemorisedDays(
    revlogs: Revlog[],
    cards: CardData[],
    configs: typeof SSEother.deck_configs,
    config_mapping: typeof SSEother.deck_config_ids
) {
    let deckFsrs: Record<number, FSRS> = {}
    let fsrsCards: Record<number, CardCid> = {}

    let cards_by_id = IDify(cards)

    function getFsrs(config: DeckConfig) {
        const id = config.id
        if (!deckFsrs[id]) {
            deckFsrs[id] = Fsrs({
                w: config.fsrsWeights,
            })
        }
        return deckFsrs[id]
    }

    let retrivabilityDays: number[] = []
    function card_config(cid: number) {
        const card = cards_by_id[cid]
        if (!card) {
            return undefined
        }
        return configs[config_mapping[card.did]]
    }

    function forgetting_curve(fsrs: FSRS, card: Card, from: number, to: number) {
        for (const day of _.range(from, to)) {
            const retrievability = fsrs.forgetting_curve(day - from, card.stability)
            retrivabilityDays[day] = retrivabilityDays[day]
                ? retrivabilityDays[day] + retrievability
                : retrievability
        }
    }

    for (const revlog of revlogs) {
        const { ease: grade } = revlog

        const config = card_config(revlog.cid)
        if (!config || grade == 0) {
            continue
        }
        const fsrs = getFsrs(config)

        const now = new Date(revlog.id)

        const new_card = !fsrsCards[revlog.cid]

        let card: CardCid =
            fsrsCards[revlog.cid] ??
            createEmptyCard(new Date(revlog.cid), (card) => ({
                ...card,
                difficulty: fsrs.init_difficulty(grade),
                stability: fsrs.init_stability(grade),
                last_review: now,
                cid: revlog.cid,
            }))

        if (!new_card && revlog.ivl > 0) {
            const previous = dayFromMs(card.last_review!.getTime())
            forgetting_curve(fsrs, card, previous, dayFromMs(revlog.id))

            const log = fsrs.next(card, now, grade)
            card = { ...log.card, cid: card.cid }
        }

        fsrsCards[revlog.cid] = card
    }

    for (const card of Object.values(fsrsCards)) {
        const previous = dayFromMs(card.last_review!.getTime())
        const fsrs = getFsrs(card_config(card.cid)!)
        forgetting_curve(fsrs, card, previous, today)
    }

    return retrivabilityDays
}
