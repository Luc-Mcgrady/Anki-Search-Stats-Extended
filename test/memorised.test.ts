import { RevlogBuilder } from "./revlogBuilder"
import {getMemorisedDays} from "../src/ts/MemorisedBar"

const card = new RevlogBuilder()

const revlogs = [
    card.review(-3000),
    card.review(-3000),
    card.review(5)
]

test("memorised", ()=>{
    console.log(getMemorisedDays(revlogs, [card.card() as any]))
})