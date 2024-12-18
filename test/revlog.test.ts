import { calculateRevlogStats, day_ms } from "../src/ts/revlogGraphs"
import { Revlog } from "../src/ts/search"

let card_id = 0;
let start_id = 1;

class RevlogBuilder {
    state: Partial<Revlog>
    constructor() {
        this.state = {
            id: start_id++,
            cid: card_id++,
            ivl: 0,
        }
    }

    review(ivl: number, time_spent: number = 0, ease: 0 | 1 | 2 | 3 | 4 = 0, relearn: boolean = false) {

        this.state = {
            id: this.state.id + (this.state.ivl > 0 ? this.state.ivl * day_ms : -this.state.ivl),
            cid: this.state.cid,
            ivl,
            ease,
            time: time_spent,
        }

        return this.state as Revlog
    }

    wait(ms: number) {
        this.state = {
            ...this.state,
            id: this.state.id + ms
        }
        return this.state
    }

    card() {
        return {
            id: this.state.cid,
            ivl: this.state.ivl
        }
    }
}

const burden_revlog_builder1 = new RevlogBuilder()
const burden_revlog_builder2 = new RevlogBuilder()
const burden_revlogs : Revlog[] = [
    burden_revlog_builder1.review(-5000),
    burden_revlog_builder1.review(-6000),
    burden_revlog_builder1.review(1),
    burden_revlog_builder1.review(2),
    burden_revlog_builder1.review(0),
    burden_revlog_builder1.wait(2 * day_ms) as Revlog,
    burden_revlog_builder1.review(-5000),
    burden_revlog_builder1.review(-6000),
    burden_revlog_builder1.review(1),
    burden_revlog_builder1.review(4),

    burden_revlog_builder2.wait(7*day_ms) as Revlog,
    burden_revlog_builder2.review(1) as Revlog,
    burden_revlog_builder2.wait(2*day_ms) as Revlog,
    burden_revlog_builder2.review(-5000) as Revlog, 
]

//Card1: 1, 0.5, 0.5, 0, 0, 1, 0.25, 0.25, 0.25, 0.25 0.25
//Card2: 0, 0,   0,   0, 0, 0, 0,    1,    1,    1    1(learning)
//Total: 1, 0.5, 0.5, 0, 0, 1, 0.25, 1.25, 1.25  1.25 1.25

// console.log(burden_revlogs.map(revlog=>({id: revlog.id / day_ms, ...revlog})))

const end = 11
const {burden_change, burden, intervals} = calculateRevlogStats(burden_revlogs, [burden_revlog_builder1.card(), burden_revlog_builder2.card()] as any, end)

test("Burden", () =>{
    // expect(burden.length).toEqual(end + 1)
    expect(burden).toMatchObject([1, 0.5, 0.5, 0, 0, 1, 0.25, 1.25, 1.25, 1.25, 1.25])
})

test("Burden delta", () =>{
    expect(burden_change).toMatchObject([1, -0.5, 0, -0.5, 0, 1, -0.75, 1, 0, 0, 0])
})