import { day_ms } from "../src/ts/revlogGraphs";
import type { Revlog } from "../src/ts/search";

let card_id = 0;
let start_id = 1;

export class RevlogBuilder {
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