import _ from "lodash"
import { type Card, createEmptyCard, type FSRS, fsrs as Fsrs } from "ts-fsrs"
import type { DeckConfig } from "./config"
import { dayFromMs, IDify, today } from "./revlogGraphs"
import type { CardData, Revlog } from "./search"

export function getMemorisedDays(
    revlogs: Revlog[],
    cards: CardData[],
    configs: typeof SSEother.deck_configs,
    config_mapping: typeof SSEother.deck_config_ids
) {
    let deckFsrs: Record<number, FSRS> = {}
    let fsrsCards: Record<number, Card> = {}

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

    function forgetting_curve(fsrs: FSRS, s: number, from: number, to: number) {
        for (const day of _.range(from, to)) {
            const retrievability = fsrs.forgetting_curve(day - from, s)
            retrivabilityDays[day] = (retrivabilityDays[day] || 0) + retrievability
        }
    }

    let last_stability: number[] = []

    for (const revlog of revlogs) {
        const config = card_config(revlog.cid)
        if (!config) {
            continue
        }

        const grade = revlog.ease
        const new_card = !fsrsCards[revlog.cid]
        const now = new Date(revlog.id)
        const fsrs = getFsrs(config)
        let card = fsrsCards[revlog.cid] ?? createEmptyCard(new Date(revlog.cid))

        if (revlog.ivl == 0 && !new_card) {
            card = fsrs.forget(card, now).card
            fsrsCards[revlog.cid] = card
        }
        if (grade == 0) {
            continue
        }
        if (last_stability[revlog.cid]) {
            const previous = dayFromMs(card.last_review!.getTime())
            const stability = last_stability[revlog.cid]
            forgetting_curve(fsrs, stability, previous, dayFromMs(revlog.id))
        }

        //console.log(grade)
        const log = fsrs.next(card, now, grade)
        //console.log(log)
        card = log.card
        last_stability[revlog.cid] = card.stability // To prevent "forget" affecting the forgetting curve

        fsrsCards[revlog.cid] = card
    }

    let inaccurate_cids: any[] = []
    let accurate_cids: number[] = []

    for (const [cid, card] of Object.entries(fsrsCards)) {
        const num_cid = parseInt(cid)
        const previous = dayFromMs(card.last_review!.getTime())
        const fsrs = getFsrs(card_config(num_cid)!)
        forgetting_curve(fsrs, last_stability[num_cid], previous, today)
        if (cards_by_id[num_cid].data && JSON.parse(cards_by_id[num_cid].data).s) {
            const expected = last_stability[num_cid].toFixed(2)
            const actual = JSON.parse(cards_by_id[num_cid].data).s.toFixed(2)
            if (expected != actual) {
                inaccurate_cids.push({ cid: num_cid, expected, actual })
            } else {
                accurate_cids.push(num_cid)
            }
        }
    }

    if (inaccurate_cids.length) {
        console.warn(
            `The stability of the following ${inaccurate_cids.length}/${inaccurate_cids.length + accurate_cids.length} cards differ between SSE and anki:`,
            { inaccurate_cids, accurate_cids }
        )
    }

    return retrivabilityDays
}
