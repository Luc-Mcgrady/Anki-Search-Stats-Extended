<script lang="ts">
    import type { BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { calculateEaseFactors } from "./easeFactor"
    import { i18n } from "./i18n"
    import { catchErrors } from "./search"
    import { card_data } from "./stores"

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
        console.log({ easeFactors, data })
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
    }
</script>

<BarScrollable data={graph} left_aligned></BarScrollable>
