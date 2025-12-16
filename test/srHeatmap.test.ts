// Mock the stores module to prevent side effects during import
jest.mock("../src/ts/stores", () => ({
    shownCategories: {
        subscribe: jest.fn()
    }
}))

import { create_card_sr_dataset } from "../src/ts/srHeatmap"
import { CardType } from "../anki/ts/lib/tslib/cards"
import type { CardData } from "../src/ts/search"

test("Normal card uses due field", () => {
    const cards: CardData[] = [{
        id: 1,
        nid: 1,
        did: 1,
        ord: 0,
        mod: 0,
        usn: 0,
        type: CardType.Review,
        queue: 0,
        due: 100,
        ivl: 10,
        factor: 0,
        reps: 0,
        lapses: 0,
        left: 0,
        odue: 0, // Normal card
        odid: 0,
        flags: 0,
        data: JSON.stringify({ s: 5, d: 0.3 })
    }]

    const dataset = create_card_sr_dataset(cards, 100)
    expect(dataset).not.toBeNull()
    expect(dataset!.card_sr_data.length).toBe(1)
})

test("Filtered card uses odue field", () => {
    const cards: CardData[] = [{
        id: 1,
        nid: 1,
        did: 1,
        ord: 0,
        mod: 0,
        usn: 0,
        type: CardType.Review,
        queue: 0,
        due: 50, // Modified by filter
        ivl: 10,
        factor: 0,
        reps: 0,
        lapses: 0,
        left: 0,
        odue: 100, // Original due (filtered card)
        odid: 1,
        flags: 0,
        data: JSON.stringify({ s: 5, d: 0.3 })
    }]

    const dataset = create_card_sr_dataset(cards, 100)
    expect(dataset).not.toBeNull()
    expect(dataset!.card_sr_data.length).toBe(1)
})

test("Skips cards with invalid data", () => {
    const cards: CardData[] = [{
        id: 1,
        nid: 1,
        did: 1,
        ord: 0,
        mod: 0,
        usn: 0,
        type: CardType.Review,
        queue: 0,
        due: 100,
        ivl: 10,
        factor: 0,
        reps: 0,
        lapses: 0,
        left: 0,
        odue: 0,
        odid: 0,
        flags: 0,
        data: JSON.stringify({}) // No FSRS data
    }]

    const dataset = create_card_sr_dataset(cards, 100)
    expect(dataset).toBeNull()
})
