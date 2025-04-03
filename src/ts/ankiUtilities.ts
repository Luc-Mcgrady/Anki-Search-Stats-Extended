import type { CardData } from "./search"

export function isNotSuspended(card: CardData) {
    return !isSuspended(card)
}

export function isSuspended(card: CardData) {
    return card.queue === -1
}
