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

    build(ivl: number, time_spent: number = 0, ease: 0 | 1 | 2 | 3 | 4 = 0, relearn: boolean = false) {

        this.state = {
            id: this.state.id + (ivl > 0 ? ivl * day_ms : -ivl),
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
            id: this.state.id + ms,
            ...this.state
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
    burden_revlog_builder.build(-5000),
    burden_revlog_builder.build(-6000),
    burden_revlog_builder.build(1),
    burden_revlog_builder.build(2),
    burden_revlog_builder.build(0),
    burden_revlog_builder.wait(2 * day_ms) as Revlog,
    burden_revlog_builder.build(-5000),
    burden_revlog_builder.build(1),
    burden_revlog_builder.build(2)
]

// console.log(burden_revlogs)

const {burden_change, burden} = calculateRevlogStats(burden_revlogs, [burden_revlog_builder.card()] as any, 8)

test("Burden", () =>{
    expect(burden).toMatchObject([1, 1, 0.5])
})

test("Burden delta", () =>{
    expect(burden_change).toMatchObject([1, 0, -0.5])
})