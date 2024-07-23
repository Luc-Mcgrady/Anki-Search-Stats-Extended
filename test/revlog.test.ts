import { calculateRevlogStats, day_ms } from "../src/ts/revlogGraphs"
import { Revlog } from "../src/ts/search"

let card_id = 0;

global.SSEconfig = {}
global.SSEother = {rollover: 4}

class RevlogBuilder {
    state: Partial<Revlog>
    constructor() {
        this.state = {
            id: 0,
            cid: card_id++,
            ivl: 0,
            lastIvl: 0
        }
    }

    review(ivl: number, time_spent: number = 0, ease: 0 | 1 | 2 | 3 | 4 = 0, relearn: boolean = false) {

        this.state = {
            id: this.state.id + (this.state.ivl > 0 ? this.state.ivl * day_ms : -this.state.ivl),
            cid: this.state.cid,
            ivl,
            ease,
            time: time_spent,
            lastIvl: this.state.ivl,
            usn: 0,
            factor: 0,
            type: ivl == 0 ? 4 : (relearn ? 2 : 1)
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

const burden_revlog_builder = new RevlogBuilder()
const burden_revlogs : Revlog[] = [
    burden_revlog_builder.review(-5000),
    burden_revlog_builder.review(-6000),
    burden_revlog_builder.review(1),
    burden_revlog_builder.review(2),
    burden_revlog_builder.review(0),
    burden_revlog_builder.wait(2 * day_ms) as Revlog,
    burden_revlog_builder.review(-5000),
    burden_revlog_builder.review(-6000),
    burden_revlog_builder.review(1),
    burden_revlog_builder.review(4)
]

// console.log(burden_revlogs.map(revlog=>({id: revlog.id / day_ms, ...revlog})))

const {burden_change, burden} = calculateRevlogStats(burden_revlogs, [burden_revlog_builder.card()] as any, 8)

test("Burden", () =>{
    expect(burden).toMatchObject([1, 0.5, 0.5, 0, 0, 1, 0.25, 0.25, 0.25])
})

test("Burden delta", () =>{
    expect(burden_change).toMatchObject([1, -0.5, 0, -0.5, 0 , 1, -0.75, 0, 0])
})