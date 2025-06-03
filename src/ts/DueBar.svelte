<script lang="ts">
    import _ from "lodash"
    import Bar from "./Bar.svelte"
    import { barDateLabeler, type BarDatum } from "./bar"
    import type { GraphsResponse_FutureDue } from "./proto/anki/stats_pb"
    import { LEARN_COLOUR, MATURE_COLOUR, RELEARN_COLOUR, YOUNG_COLOUR } from "./graph"
    import { i18n } from "./i18n"

    export let all: GraphsResponse_FutureDue
    export let mature: GraphsResponse_FutureDue
    export let learn: GraphsResponse_FutureDue
    export let relearn: GraphsResponse_FutureDue

    let bars: BarDatum[]
    $: {
        const len = Object.keys(all.futureDue).reduce((a, b) => (a > +b ? a : +b), 0)
        let newbars = _.range(0, len)
        bars = newbars.map((i) => ({
            label: i.toString(),
            values: [0, 0, 0, 0],
        }))

        for (const day in all.futureDue) {
            const all_day = all.futureDue[day] ?? 0
            const mature_day = mature.futureDue[day] ?? 0
            const relearn_day = relearn.futureDue[day] ?? 0
            const learn_day = (learn.futureDue[day] ?? 0) - relearn_day
            const young_day = all_day - learn_day - relearn_day - mature_day

            bars[+day] = {
                label: day,
                values: [mature_day, young_day, relearn_day, learn_day],
            }
        }

        bars = bars.slice(0, 30)
    }
</script>

<Bar
    data={{
        row_colours: [MATURE_COLOUR, YOUNG_COLOUR, RELEARN_COLOUR, LEARN_COLOUR],
        row_labels: [
            i18n("mature-count"),
            i18n("young-count"),
            i18n("relearning-count"),
            i18n("learning-count"),
        ],
        data: bars,
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }}
></Bar>
