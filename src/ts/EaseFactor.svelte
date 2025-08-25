<script lang="ts">
    import * as _ from "lodash"
    import { barStringLabeler, type BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { calculateEaseFactors } from "./easeFactor"
    import { i18n, i18n_pattern } from "./i18n"
    import { catchErrors } from "./search"
    import { card_data } from "./stores"
    import * as d3 from "d3"

    $: easeFactors = catchErrors(() =>
        calculateEaseFactors($card_data ?? [], SSEother.deck_configs, SSEother.deck_config_ids)
    )

    let data = <number[]>[]
    $: {
        data = []
        for (const factor of easeFactors) {
            const index = Math.floor(factor * 100)
            data[index] = (data[index] ?? 0) + 1
        }
        console.log(easeFactors)
    }

    let graph: BarChart
    $: graph = {
        row_labels: [i18n("cards")],
        row_colours: ["steelblue"],
        data: Array.from(data).map((a, i) => ({
            values: [a ?? 0],
            label: (i / 100).toFixed(0),
        })),
        tick_spacing: 5,
        columnLabeler: barStringLabeler(i18n_pattern("factor-of")),
    }

    $: max = (d3.quantile(easeFactors, 0.99) ?? 1) * 100
    const bins = 30
    const offset = 100
    $: binSize = Math.ceil((max - 100) / bins)
</script>

<BarScrollable data={graph} left_aligned {offset} {bins} {binSize}></BarScrollable>
