<script lang="ts">
    import { catchErrors, type CardData } from "./search"
    import _ from "lodash"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import {
        burdenOrLoad,
        data,
        graph_mode,
        include_suspended,
        zero_inclusive,
        target_R_days as target_R_days_values,
    } from "./stores"
    import GraphCategory from "./GraphCategory.svelte"
    import { calculateCardDataPies } from "./CardDataPies"
    import BarScrollable from "./BarScrollable.svelte"
    import { barDateLabeler, type BarChart } from "./bar"
    import { EASE_COLOURS, formatRetention } from "./revlogGraphs"
    import { totalCalc } from "./barHelpers"
    import Bar from "./Bar.svelte"

    export let cardData: CardData[] | null

    $: true_zero_inclusive = $zero_inclusive || $graph_mode == "Bar"
    $: ({ lapses, repetitions, lapses_burden, repetitions_burden, target_R_days, lapse_ratios } = catchErrors(
        () => calculateCardDataPies(cardData ?? [], $include_suspended, true_zero_inclusive)
    ))

    let lapse_ratio_bar: BarChart
    $: lapse_ratio_bar = {
        row_colours: ["#bd3f09"],
        row_labels: ["Cards"],
        data: Object.entries(lapse_ratios).map(([key, val])=>({
            values: [val.length],
            label: key
        }))
    }

    let lapse_last = 7
    let lapse_steps = 7

    let repetitions_last = 21
    let repetitions_steps = 7

    $: $target_R_days_values = $data ? target_R_days : []
</script>

<GraphCategory>
    <GraphContainer>
        <h1>Lapse {$burdenOrLoad}</h1>
        <IntervalGraph
            intervals={lapses_burden}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                totalDescriptor: $burdenOrLoad,
                countDescriptor: "Highest Lapse count",
                legend_left: "Lapse count",
                legend_right: `Card ${$burdenOrLoad}`,
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            This graph shows the sum of <code>1 / interval</code>
            for cards which have the given number of lapses. If you plan to suspend cards based on their
            number of lapses, this can help you find a good threshold if you compare it with the count
            graph to the left to see how many cards are giving you how much {$burdenOrLoad}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Lapse Distribution</h1>
        <IntervalGraph
            intervals={lapses}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                countDescriptor: "Highest Lapse Count",
                legend_left: "Lapse count",
                legend_right: "Card count",
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            A card increases its lapse count whenever it is reviewed "again" while not in the
            learning state. Lapses are used to monitor which cards become "leeches". By default,
            whenever the card reaches 7 lapses it becomes tagged as a leech. This value can be
            modified under <code>leech threshold</code>
            in the deck settings.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Lapse Total</h1>
        <IntervalGraph
            intervals={lapses.map((e, i) => e * i)}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                totalDescriptor: "Lapses",
                countDescriptor: "Most Lapses",
                legend_left: "Lapse count",
                legend_right: "Lapse total",
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            This graph shows the number of lapses, total, for each card. E.g if exactly 2 cards have
            3 lapses per card, the lapse total for 3 would be 6.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Lapse Ratios</h1>
        <Bar data={lapse_ratio_bar}/>
        <p>
            The number of lapses a card has divided by its number of repetitions.
            Includes inter-day repetitions.
        </p>
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <!-- Repetition  -->
    <GraphContainer>
        <h1>Repetition {$burdenOrLoad}</h1>
        <IntervalGraph
            intervals={repetitions_burden}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                totalDescriptor: $burdenOrLoad,
                countDescriptor: "Most Repetitions",
                legend_left: "Repetition count",
                legend_right: `Card ${$burdenOrLoad}`,
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>
            This graph shows the sum of <code>1 / interval</code>
            for all cards which have the given number of repetitions.
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>Repetition Distribution</h1>
        <IntervalGraph
            intervals={repetitions}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                countDescriptor: "Most Repetitions",
                legend_left: "Repetition count",
                legend_right: "Card count",
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>A card gains a repetition (commonly called a review) whenever you review it.</p>
    </GraphContainer>
    <GraphContainer>
        <h1>Repetition Total</h1>
        <IntervalGraph
            intervals={repetitions.map((e, i) => e * i)}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                totalDescriptor: "Repetitions",
                countDescriptor: "Most Repetitions",
                legend_left: "Repetitions count",
                legend_right: "Repetition total",
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>
            This graph shows the number of repetitions for each card. E.g if exactly 2 cards have a
            repetitions per card of 3, the repetition total for 3 would be 6.
        </p>
    </GraphContainer>
</GraphCategory>
