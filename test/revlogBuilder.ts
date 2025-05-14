import { day_ms, dayFromMs } from "../src/ts/revlogGraphs";
import type { CardData, Revlog } from "../src/ts/search";

let card_id = 0;
let start_id = 1;

export class RevlogBuilder {
    state: Partial<Revlog>

    constructor() {
        this.state = {
            id: start_id++,
            cid: card_id++,
            ivl: 0,
            type: 0,
        }
    }

    get last_review() {
        return dayFromMs(this.state.id)
    }

    review(ivl: number, ease: 0 | 1 | 2 | 3 | 4 = 0, time_spent: number = ease == 0 ? 0 : 10_000) {

        this.state = {
            id: this.state.id + (this.state.ivl > 0 ? this.state.ivl * day_ms : -this.state.ivl),
            cid: this.state.cid,
            ivl,
            ease,
            type: ivl > 0 ? 1 : this.state.type == 0 ? 0 : ivl > 0 ? 1 : ivl == 0 ? 0 : 2,
            time: time_spent,
        }

        return this.state
    }

    wait(ms: number) {
        this.state = {
            ...this.state,
            id: this.state.id + ms
        }
    }

    card(): Partial<CardData> {
        return {
            id: this.state.cid,
            ivl: this.state.ivl,
            did: 1
        }
    }
}