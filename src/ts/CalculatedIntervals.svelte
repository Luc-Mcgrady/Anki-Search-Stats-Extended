<script lang="ts">
    import type { CardData } from "./search";
    import _ from "lodash";
    import GraphContainer from "./GraphContainer.svelte";
    import IntervalPie from "./IntervalPie.svelte"
    import BurdenPie from "./BurdenPie.svelte"

    export let cardData: CardData[]
    
    let lapses: number[] = []
    let repetitions: number[] = []
    let lapses_burden: number[] = []
    let repetitions_burden: number[] = []

    for (const card of cardData) {
        lapses[card.lapses] = (lapses[card.lapses] ?? 0) + 1
        repetitions[card.reps] = (repetitions[card.reps] ?? 0) + 1
        if (card.ivl > 0) {
            lapses_burden[card.lapses] = (lapses_burden[card.lapses] ?? 0) + (1 / card.ivl)
            repetitions_burden[card.reps] = (repetitions_burden[card.reps] ?? 0) + (1 / card.ivl)
        }
    }
</script>


<GraphContainer>
    <h1>Lapse Distribution</h1>
    <IntervalPie legend_title="Lapse count: Card count" spectrumFrom={"#bd3f09"} spectrumTo={"#612207"} intervals={lapses}/>
</GraphContainer>
<GraphContainer>
    <h1>Lapse Load</h1>
    <IntervalPie legend_title="Lapse count: Card count" spectrumFrom={"#bd3f09"} spectrumTo={"#612207"} intervals={lapses_burden}/>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Distribution</h1>
    <IntervalPie spectrumFrom={"#5ca7f7"} spectrumTo={"#0b4f99"} intervals={repetitions}/>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Load</h1>
    <IntervalPie spectrumFrom={"#5ca7f7"} spectrumTo={"#0b4f99"} intervals={repetitions_burden}/>
</GraphContainer>
