import { DeltaIfy } from "../src/ts/Candlestick"
import { calculateRevlogStats, day_ms } from "../src/ts/revlogGraphs"
import type { Revlog } from "../src/ts/search"
import { RevlogBuilder } from "./revlogBuilder"

const burden_revlog_builder1 = new RevlogBuilder()
const burden_revlog_builder2 = new RevlogBuilder()
const burden_revlogs : Revlog[] = [
    burden_revlog_builder1.review(-5000, 3),
    burden_revlog_builder1.review(-6000, 3),
    burden_revlog_builder1.review(1, 3),
    burden_revlog_builder1.review(2, 3),
    burden_revlog_builder1.review(0),
    burden_revlog_builder1.wait(2 * day_ms),
    burden_revlog_builder1.review(-5000, 3),
    burden_revlog_builder1.review(-6000, 3),
    burden_revlog_builder1.review(1, 3),
    burden_revlog_builder1.review(4, 3),

    burden_revlog_builder2.wait(7*day_ms),
    burden_revlog_builder2.review(1) as Revlog,
    burden_revlog_builder2.wait(2*day_ms),
    burden_revlog_builder2.review(-5000) as Revlog, 
].filter(a=>a) as Revlog[]

//Card1: 1, 0.5, 0.5, 0, 0, 1, 0.25, 0.25, 0.25, 0.25 0.25
//Card2: 0, 0,   0,   0, 0, 0, 0,    1,    1,    1    1(learning)
//Total: 1, 0.5, 0.5, 0, 0, 1, 0.25, 1.25, 1.25  1.25 1.25

// console.log(burden_revlogs.map(revlog=>({id: revlog.id / day_ms, ...revlog})))

const end = 10
const {burden, learn_steps_per_card} = calculateRevlogStats(burden_revlogs, [burden_revlog_builder1.card(), burden_revlog_builder2.card()] as any, end)

test("Burden", () =>{
    // expect(burden.length).toEqual(end + 1)
    expect(burden).toMatchObject([1, 0.5, 0.5, 0, 0, 1, 0.25, 1.25, 1.25, 1.25, 1.25])
})

test("Burden delta", () =>{
    expect(DeltaIfy(burden)).toMatchObject([1, -0.5, 0, -0.5, 0, 1, -0.75, 1, 0, 0, 0])
})

test("learn_step_count", ()=>{
    console.log(burden_revlogs)
    expect(learn_steps_per_card).toContain(2)
})
