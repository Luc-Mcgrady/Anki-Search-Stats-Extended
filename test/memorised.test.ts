import { RevlogBuilder } from "./revlogBuilder"
import {getMemorisedDays} from "../src/ts/MemorisedBar"
import type {DeckConfig} from "../src/ts/config"

const card = new RevlogBuilder()

const revlogs = [
    card.review(-3000),
    card.review(-3000),
    card.review(5),
    card.review(10),
    card.review(110),
]

const mappings = {1: 1}
const configs: Record<number, Partial<DeckConfig>> = {1: {id: 1, fsrsWeights: [
    0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
    1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621, // Defaults
]}}

test("memorised", ()=>{
    console.log({revlogs})
    const memorised = getMemorisedDays(revlogs, [{
        ...card.card(),
        did: 1
    } as any],
    configs,
    mappings)
    console.log(memorised)
})