import _ from "lodash"
import {
    type Card,
    createEmptyCard,
    dateDiffInDays,
    type FSRS,
    fsrs as Fsrs,
    type FSRSState,
} from "ts-fsrs"
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
                w: config.fsrsParams5,
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
        // set due date or reschedule
        if (grade == 0) {
            continue
        }
        // cram
        if (revlog.type == 3 && revlog.factor == 0) {
            continue
        }
        if (last_stability[revlog.cid]) {
            const previous = dayFromMs(card.last_review!.getTime())
            const stability = last_stability[revlog.cid]
            forgetting_curve(fsrs, stability, previous, dayFromMs(revlog.id))
        }

        //console.log(grade)
        let memoryState: FSRSState | null = null
        let elapsed = 0
        if (card.last_review) {
            memoryState = card.stability
                ? {
                      difficulty: card.difficulty,
                      stability: card.stability,
                  }
                : null
            const oldDate = new Date(card.last_review.getTime() - 4 * 60 * 60 * 1000)
            oldDate.setHours(0, 0, 0, 0)
            const newDate = new Date(now.getTime() - 4 * 60 * 60 * 1000)
            newDate.setHours(0, 0, 0, 0)
            elapsed = dateDiffInDays(oldDate, newDate)
        }
        const newState = fsrs.next_state(memoryState, elapsed, grade)
        card.last_review = now
        card.stability = newState.stability
        card.difficulty = newState.difficulty
        last_stability[revlog.cid] = card.stability // To prevent "forget" affecting the forgetting curve

        fsrsCards[revlog.cid] = card
    }

    let inaccurate_cids: any[] = []
    let accurate_cids: number[] = []

    for (const [cid, card] of Object.entries(fsrsCards)) {
        const num_cid = parseInt(cid)
        const previous = dayFromMs(card.last_review!.getTime())
        const fsrs = getFsrs(card_config(num_cid)!)
        forgetting_curve(fsrs, last_stability[num_cid], previous, today + 1)
        if (cards_by_id[num_cid].data && JSON.parse(cards_by_id[num_cid].data).s) {
            const expected = last_stability[num_cid]
            const actual = JSON.parse(cards_by_id[num_cid].data).s
            if (Math.abs(expected - actual) > 0.01) {
                inaccurate_cids.push({
                    cid: num_cid,
                    expected: expected.toFixed(2),
                    actual: actual.toFixed(2),
                })
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
