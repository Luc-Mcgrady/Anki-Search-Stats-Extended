<script lang="ts">
    import type { CardData } from "./search";
    import _ from "lodash";
    import GraphContainer from "./GraphContainer.svelte";
    import IntervalPie from "./IntervalPie.svelte"

    export let cardData: CardData[]
    
    let lapses: number[]
    let repetitions: number[] 
    let lapses_burden: number[] 
    let repetitions_burden: number[] 

    let zeroInclusive = false

    $: {
        lapses = []
        repetitions = []
        lapses_burden = []
        repetitions_burden = []

        for (const card of cardData) {
            if (card.reps > 0) {
                lapses[card.lapses] = (lapses[card.lapses] ?? 0) + 1
                repetitions[card.reps] = (repetitions[card.reps] ?? 0) + 1
                if (card.ivl > 0) {
                    lapses_burden[card.lapses] = (lapses_burden[card.lapses] ?? 0) + (1 / card.ivl)
                    repetitions_burden[card.reps] = (repetitions_burden[card.reps] ?? 0) + (1 / card.ivl)
                }
            }
        }

        if (!zeroInclusive) {
            delete lapses[0]
            delete lapses_burden[0]
        }
    }

</script>


<GraphContainer>
    <h1>Lapse Distribution</h1>
    <IntervalPie countDescriptor="Highest Lapse Count" legend_title="Lapse count: Card count" spectrumFrom={"#bd3f09"} spectrumTo={"#612207"} intervals={lapses}/>
    <br>
    <label>
        <input type="checkbox" bind:checked={zeroInclusive}>
        Zero Inclusive?
    </label>
</GraphContainer>
<GraphContainer>
    <h1>Lapse Load</h1>
    <IntervalPie countDescriptor="Highest Lapse Count" legend_title="Lapse count: Card Load" spectrumFrom={"#bd3f09"} spectrumTo={"#612207"} intervals={lapses_burden}/>
    <br>
    <label>
        <input type="checkbox" bind:checked={zeroInclusive}>
        Zero Inclusive?
    </label>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Distribution</h1>
    <IntervalPie countDescriptor="Most Repetitions" legend_title="Repetition count: Card count" spectrumFrom={"#5ca7f7"} spectrumTo={"#0b4f99"} intervals={repetitions}/>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Load</h1>
    <IntervalPie countDescriptor="Most Repetitions" legend_title="Repetition count: Card Load" spectrumFrom={"#5ca7f7"} spectrumTo={"#0b4f99"} intervals={repetitions_burden}/>
</GraphContainer>
