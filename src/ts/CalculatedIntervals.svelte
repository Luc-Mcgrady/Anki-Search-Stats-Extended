<script lang="ts">
    import type { CardData } from "./search"
    import _ from "lodash"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import { include_suspended } from "./stores"

    export let cardData: CardData[]

    let total_lapses: number
    let total_repetitions: number
    let lapses: number[]
    let repetitions: number[]
    let lapses_burden: number[]
    let repetitions_burden: number[]

    let zeroInclusive = false

    $: {
        total_lapses = 0
        total_repetitions = 0
        lapses = []
        repetitions = []
        lapses_burden = []
        repetitions_burden = []

        console.log(cardData)

        for (const card of cardData) {
            if ($include_suspended || card.queue !== -1) {
                total_lapses += card.lapses
                total_repetitions += card.reps

                if (card.reps > 0) {
                    lapses[card.lapses] = (lapses[card.lapses] ?? 0) + 1
                    repetitions[card.reps] = (repetitions[card.reps] ?? 0) + 1

                    if (card.ivl > 0) {
                        lapses_burden[card.lapses] =
                            (lapses_burden[card.lapses] ?? 0) + 1 / card.ivl
                        repetitions_burden[card.reps] =
                            (repetitions_burden[card.reps] ?? 0) + 1 / card.ivl
                    }
                }
            }
        }

        if (!zeroInclusive) {
            delete lapses[0]
            delete lapses_burden[0]
        }
    }

    let lapse_last = 7
    let lapse_steps = 7

    let repetitions_last = 21
    let repetitions_steps = 7
</script>

<GraphContainer>
    <h1>Lapse Distribution</h1>
    <IntervalPie
        bind:steps={lapse_steps}
        bind:last={lapse_last}
        countDescriptor="Highest Lapse Count"
        legend_title="Lapse count: Card count"
        spectrumFrom={"#bd3f09"}
        spectrumTo={"#612207"}
        intervals={lapses}
    />
    <br />
    <span>Total Lapses = {total_lapses.toLocaleString()}</span>
    <br />
    <label>
        <input type="checkbox" bind:checked={zeroInclusive} />
        Zero Inclusive?
    </label>
</GraphContainer>
<GraphContainer>
    <h1>Lapse Load</h1>
    <IntervalPie
        bind:steps={lapse_steps}
        bind:last={lapse_last}
        countDescriptor="Highest Lapse Count"
        legend_title="Lapse count: Card Load"
        spectrumFrom={"#bd3f09"}
        spectrumTo={"#612207"}
        intervals={lapses_burden}
    />
    <br />
    <label>
        <input type="checkbox" bind:checked={zeroInclusive} />
        Zero Inclusive?
    </label>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Distribution</h1>
    <IntervalPie
        bind:steps={repetitions_steps}
        bind:last={repetitions_last}
        countDescriptor="Most Repetitions"
        legend_title="Repetition count: Card count"
        spectrumFrom={"#5ca7f7"}
        spectrumTo={"#0b4f99"}
        intervals={repetitions}
    />
    <br />
    <span>Total Repetitions = {total_repetitions.toLocaleString()}</span>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Load</h1>
    <IntervalPie
        bind:steps={repetitions_steps}
        bind:last={repetitions_last}
        countDescriptor="Most Repetitions"
        legend_title="Repetition count: Card Load"
        spectrumFrom={"#5ca7f7"}
        spectrumTo={"#0b4f99"}
        intervals={repetitions_burden}
    />
</GraphContainer>

<style>
    label {
        user-select: none;
    }
</style>
