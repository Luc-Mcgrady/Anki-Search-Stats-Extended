import { RevlogBuilder } from "./revlogBuilder"
import {getMemorisedDays} from "../src/ts/MemorisedBar"
import type {DeckConfig} from "../src/ts/config"
import { Revlog } from "../src/ts/search"
import {fsrs} from "ts-fsrs"

const weights = [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621, // Defaults
]
const weights2 = [
    1, 100, 100, 100, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898 // on initial good: 100, no intra-day
]

const mappings = {1: 1, 2: 2}
const configs: Record<number, Partial<DeckConfig>> = {
    1: {id: 1, fsrsWeights: weights, fsrsParams5: weights},
    2: {id: 2, fsrsWeights: weights2, fsrsParams5: weights2}
}



test("Day Timings", ()=>{
    const card = new RevlogBuilder()

    const revlogs = [
        card.review(-3000, 3),
        card.review(-3000, 3),
        card.review(5, 3),
        card.review(10, 3),
        card.review(20, 3),
    ] as Revlog[]

    const memorised = getMemorisedDays(revlogs, [{
        ...card.card(),
        did: 1
    } as any],
    configs,
    mappings).retrievabilityDays
    
    expect(memorised.length).not.toBe(0)
    expect(memorised[0]).toBe(1)
    expect(memorised[5]).toBe(1)
    expect(memorised[15]).toBe(1)
    expect(memorised[16]).not.toBe(0)
})

// https://github.com/open-spaced-repetition/fsrs-rs/blob/a7aaa40498bae992e0be0a1e9a1380e4992aee60/src/inference.rs#L433-L465
test("Stability", ()=>{
    const card = new RevlogBuilder()
    const FSRS = fsrs({w: weights})

    const revlogs = [
        card.review(1, 1),
        card.review(3, 3),
        card.review(21, 3),
        card.review(80, 3),
    ] as Revlog[]

    const memorised = getMemorisedDays(revlogs, [{
        ...card.card(),
        did: 1
    } as any],
    configs,
    mappings).retrievabilityDays

    const OFFSET = 10

    expect(memorised[card.last_review + OFFSET]).toBeCloseTo(FSRS.forgetting_curve(OFFSET, 31.722975))

})

test("Stability On Forget", ()=>{
    const card = new RevlogBuilder()
    const FSRS = fsrs({w: weights})

    const revlogs = [
        card.review(1, 1),
        card.review(3, 3),
        card.review(0, 0),
        card.review(1, 1),
        card.review(3, 3),
        card.review(21, 3),
        card.review(80, 3),
    ] as Revlog[]

    const memorised = getMemorisedDays(revlogs, [{
        ...card.card(),
        did: 1
    } as any],
    configs,
    mappings).retrievabilityDays

    const OFFSET = 10

    expect(memorised[card.last_review + OFFSET]).toBeCloseTo(FSRS.forgetting_curve(OFFSET, 31.722975))

})

test("Leech Detection", () =>{
    const card = new RevlogBuilder()
    
    const revlogs = [
        card.review(-100, 3),
        card.review(100, 3),
        card.review(100, 1)
    ] as Revlog[]

    const leech_probabilities = getMemorisedDays(revlogs, [{
        ...card.card(),
        did: 2
    } as any],
    configs,
    mappings, 1, 0).leech_probabilities

    expect(leech_probabilities[card.card().id]).toBeCloseTo(0.1)
})