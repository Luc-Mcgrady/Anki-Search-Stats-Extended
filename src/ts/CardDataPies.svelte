<script lang="ts">
    import type { CardData } from "./search"
    import _ from "lodash"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import { burdenOrLoad, include_suspended, zero_inclusive } from "./stores"
    import ZeroInclusive from "./ZeroInclusive.svelte"

    export let cardData: CardData[]

    let total_lapses: number
    let total_repetitions: number
    let total_under_repetitions: number
    let lapses: number[]
    let repetitions: number[]
    let lapses_burden: number[]
    let repetitions_burden: number[]

    $: {
        total_lapses = 0
        total_repetitions = 0
        total_under_repetitions = 0
        lapses = []
        repetitions = []
        lapses_burden = []
        repetitions_burden = []

        for (const card of cardData) {
            if ($include_suspended || card.queue !== -1) {
                total_lapses += card.lapses
                total_repetitions += card.reps

                if (card.reps < repetitions_last) {
                    total_under_repetitions += card.reps
                }

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

        if (!$zero_inclusive) {
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
    <h1>Lapse {$burdenOrLoad}</h1>
    <IntervalPie
        bind:steps={lapse_steps}
        bind:last={lapse_last}
        totalDescriptor={$burdenOrLoad}
        countDescriptor="Highest Lapse count"
        legend_left="Lapse count"
        legend_right="Card {$burdenOrLoad}"
        spectrumFrom={"#bd3f09"}
        spectrumTo={"#612207"}
        intervals={lapses_burden}
    >
        <br />
        <ZeroInclusive />
    </IntervalPie>
    <p>
        This graph shows the sum of <code>1 / interval</code>
        for cards which have the given number of lapses. If you plan to suspend cards based on their
        number of lapses, this can help you find a good threshold if you compare it with the count graph
        to the left to see how many cards are giving you how much {$burdenOrLoad}
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Lapse Distribution</h1>
    <IntervalPie
        bind:steps={lapse_steps}
        bind:last={lapse_last}
        countDescriptor="Highest Lapse Count"
        legend_left="Lapse count"
        legend_right="Card count"
        spectrumFrom={"#bd3f09"}
        spectrumTo={"#612207"}
        intervals={lapses}
    >
        <br />
        <ZeroInclusive />
    </IntervalPie>
    <p>
        A card increases its lapse count whenever it is reviewed "again" while not in the learning
        state. Lapses are used to monitor which cards become "leeches". By default, whenever the
        card reaches 7 lapses it becomes tagged as a leech. This value can be modified under <code>
            leech threshold
        </code>
        in the deck settings.
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Lapse Total</h1>
    <IntervalPie
        bind:steps={lapse_steps}
        bind:last={lapse_last}
        totalDescriptor="Lapses"
        countDescriptor="Most Lapses"
        legend_left="Lapse count"
        legend_right="Lapse total"
        spectrumFrom={"#bd3f09"}
        spectrumTo={"#612207"}
        intervals={lapses.map((e, i) => e * i)}
    >
        <br />
        <ZeroInclusive />
    </IntervalPie>
    <p>
        This graph shows the number of lapses, total, for each card. E.g if exactly 2 cards have 3
        lapses per card, the lapse total for 3 would be 6.
    </p>
</GraphContainer>
<!-- Repetition  -->
<GraphContainer>
    <h1>Repetition {$burdenOrLoad}</h1>
    <IntervalPie
        bind:steps={repetitions_steps}
        bind:last={repetitions_last}
        totalDescriptor={$burdenOrLoad}
        countDescriptor="Most Repetitions"
        legend_left="Repetition count"
        legend_right="Card {$burdenOrLoad}"
        spectrumFrom={"#5ca7f7"}
        spectrumTo={"#0b4f99"}
        intervals={repetitions_burden}
    />
    <p>
        This graph shows the sum of <code>1 / interval</code>
        for all cards which have the given number of repetitions.
    </p>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Distribution</h1>
    <IntervalPie
        bind:steps={repetitions_steps}
        bind:last={repetitions_last}
        countDescriptor="Most Repetitions"
        legend_left="Repetition count"
        legend_right="Card count"
        spectrumFrom={"#5ca7f7"}
        spectrumTo={"#0b4f99"}
        intervals={repetitions}
    />
    <p>A card gains a repetition (commonly called a review) whenever you review it.</p>
</GraphContainer>
<GraphContainer>
    <h1>Repetition Total</h1>
    <IntervalPie
        bind:steps={repetitions_steps}
        bind:last={repetitions_last}
        totalDescriptor="Repetitions"
        countDescriptor="Most Repetitions"
        legend_left="Repetitions count"
        legend_right="Repetition total"
        spectrumFrom={"#5ca7f7"}
        spectrumTo={"#0b4f99"}
        intervals={repetitions.map((e, i) => e * i)}
    />
    <p>
        This graph shows the number of repetitions for each card. E.g if exactly 2 cards have a
        repetitions per card of 3, the repetition total for 3 would be 6.
    </p>
</GraphContainer>

<style>
    p {
        font-size: small;
        margin-top: 1em;
    }

    h1 {
        border-bottom: 1px var(--border) solid;
    }
</style>
