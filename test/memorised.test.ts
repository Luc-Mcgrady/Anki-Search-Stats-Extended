import { RevlogBuilder } from "./revlogBuilder"
import {getMemorisedDays} from "../src/ts/MemorisedBar"
import type {DeckConfig} from "../src/ts/config"
import { Revlog } from "../src/ts/search"

const card = new RevlogBuilder()

const revlogs = [
    card.review(-3000, 1, 3),
    card.review(-3000, 1, 3),
    card.review(5, 1, 3),
    card.review(10, 1, 3),
    card.review(20, 1, 3),
] as Revlog[]

const mappings = {1: 1}
const configs: Record<number, Partial<DeckConfig>> = {1: {id: 1, fsrsWeights: [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621, // Defaults
]}}

test("memorised", ()=>{
    const memorised = getMemorisedDays(revlogs, [{
        ...card.card(),
        did: 1
    } as any],
    configs,
    mappings)
    console.log({memorised})
    expect(memorised.length).not.toBe(0)
    expect(memorised[0]).toBe(1)
    expect(memorised[5]).toBe(1)
    expect(memorised[15]).toBe(1)
    expect(memorised[16]).not.toBe(0)
})