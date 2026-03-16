<script lang="ts">
    import _ from "lodash"
    import Bar from "./Bar.svelte"
    import { barDateLabeler, type BarDatum } from "./bar"
    import { LEARN_COLOUR, MATURE_COLOUR, RELEARN_COLOUR, YOUNG_COLOUR } from "./graph"
    import { i18n } from "./i18n"
    import { card_data } from "./stores"
    import { browserSearchCurrent, type CardData } from "./search"

    const maxBar = 30
    let bars: BarDatum[] = []
    const days_elapsed = SSEother.days_elapsed

    function calculateBars(card_data: CardData[]) {
        const newbars = _.range(0, maxBar)
        bars = newbars.map((i) => ({
            label: i.toString(),
            values: [0, 0, 0, 0],
        }))
        for (const card of card_data ?? []) {
            if (card.queue == -1) {
                continue
            }
            let due = card.due < 365_000 ? card.due - days_elapsed : 0
            if (card.queue < -1) {
                due = 1
                continue
            }

            let type = (
                {
                    0: 3, // new
                    1: 3, // learn
                    2: 0, // review
                    3: 2, // relearning
                } as const
            )[card.type] as number

            if (type == 0 && card.ivl < 21) {
                type = 1
            }

            if (due < maxBar) {
                bars[due] ??= {
                    label: due.toString(),
                    values: [0, 0, 0, 0],
                    onClick: () => browserSearchCurrent(`prop:due=${due}`),
                }
                bars[due].values[type] += 1
            }
        }

        return bars.slice(0, maxBar)
    }

    let debounceTimer: ReturnType<typeof setTimeout>
    $: {
        clearTimeout(debounceTimer)
        const snapshot = $card_data ?? []
        debounceTimer = setTimeout(() => {
            bars = calculateBars(snapshot)
        }, 0)
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
        inverseFade: true,
        tick_spacing: 5,
        columnLabeler: barDateLabeler,
    }}
></Bar>
