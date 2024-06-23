<script lang="ts">
    import type { CardData } from "./search";
    import _ from "lodash";
    import GraphContainer from "./GraphContainer.svelte";
    import IntervalPie from "./IntervalPie.svelte"
    import BurdenPie from "./BurdenPie.svelte"

    export let cardData: CardData[]
    
    let lapses: number[] = []
    let repetitions: number[] = []

    for (const card of cardData) {
        lapses[card.lapses] = (lapses[card.lapses] ?? 0) + 1
        repetitions[card.reps] = (repetitions[card.reps] ?? 0) + 1
    }

</script>


<GraphContainer>
    <h1>Lapse Distribution</h1>
    <IntervalPie intervals={lapses}/>
</GraphContainer>
<GraphContainer>
    <h1>Lapse Load</h1>
    <BurdenPie intervals={lapses}/>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Distribution</h1>
    <IntervalPie intervals={repetitions}/>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Load</h1>
    <BurdenPie intervals={repetitions}/>
</GraphContainer>
