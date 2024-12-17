import _ from "lodash"
import { type Card, createEmptyCard, type FSRS, fsrs as Fsrs } from "ts-fsrs"
import { dayFromMs, IDify, today } from "./revlogGraphs"
import type { CardData, Revlog } from "./search"

type CardCid = Card & {
    cid: number
}

export function getMemorisedDays(revlogs: Revlog[], cards: CardData[]) {
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
            debugger
        }
        return SSEother.deck_configs[SSEother.deck_config_ids[card.did]]
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

        if (grade == 0 || revlog.time == 0) {
            continue
        }

        const config = card_config(revlog.cid)
        const fsrs = getFsrs(config)

        const now = new Date(revlog.id)

        const new_card = !fsrsCards[revlog.cid]
        const card: CardCid =
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

            fsrs.next(card, now, grade)
        }

        fsrsCards[revlog.cid] = card
    }

    for (const card of Object.values(fsrsCards)) {
        const previous = dayFromMs(card.last_review!.getTime())
        const fsrs = getFsrs(card_config(card.cid))
        forgetting_curve(fsrs, card, previous, today)
    }

    return retrivabilityDays
}