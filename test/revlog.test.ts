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
        const out: Revlog = {
            id: this.state.id + ivl * day_ms,
            cid: this.state.cid,
            ivl,
            ease,
            time: time_spent,
            lastIvl: this.state.ivl,
            usn: 0,
            factor: 0,
            type: ivl == 0 ? 4 : (relearn ? 2 : 1)
        }

        this.state = out

        return out
    }

    card() {
        return {
            id: this.state.cid,
            ivl: this.state.ivl
        }
    }
}

const burden_test_builder = new RevlogBuilder()
const burden_test = [burden_test_builder.build(1), burden_test_builder.build(2)]

console.log(burden_test)

const {burden_change, burden} = calculateRevlogStats(burden_test, [burden_test_builder.card()] as any, 2)

test("Burden data", () =>{
    expect(burden).toMatchObject([1, 1, 0.5])
    expect(burden_change).toMatchObject([1, 0, -0.5])
})