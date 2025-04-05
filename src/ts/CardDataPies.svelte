<script lang="ts">
    import { catchErrors, type CardData } from "./search"
    import _ from "lodash"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import {
        data,
        graph_mode,
        include_suspended,
        zero_inclusive,
        target_R_days as target_R_days_values,
    } from "./stores"
    import GraphCategory from "./GraphCategory.svelte"
    import { calculateCardDataPies } from "./CardDataPies"
    import BarScrollable from "./BarScrollable.svelte"
    import { barDateLabeler } from "./bar"
    import { EASE_COLOURS, formatRetention } from "./revlogGraphs"
    import { totalCalc } from "./barHelpers"
    import { i18n } from "./i18n"

    export let cardData: CardData[] | null

    $: true_zero_inclusive = $zero_inclusive || $graph_mode == "Bar"
    $: ({
        lapses,
        repetitions,
        lapses_burden,
        lapses_avg_burden,
        repetitions_burden,
        repetitions_avg_burden,
        total_burden,
        target_R_days,
    } = catchErrors(() =>
        calculateCardDataPies(cardData ?? [], $include_suspended, true_zero_inclusive)
    ))

    let lapse_last = 7
    let lapse_steps = 7

    let repetitions_last = 21
    let repetitions_steps = 7

    let normalize_burden = false
    let cumulative_burden = false

    $: $target_R_days_values = $data ? target_R_days : []
</script>

<GraphCategory>
    <GraphContainer>
        <h1>{i18n("lapse-load")}</h1>
        <IntervalGraph
            intervals={lapses_burden}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                totalDescriptor: i18n("load"),
                countDescriptor: i18n("highest-lapse-count"),
                legend_left: i18n("lapse-count"),
                legend_right: i18n("card-load"),
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            {i18n("lapse-load-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("lapse-average-load")}</h1>
        <IntervalGraph
            intervals={lapses_avg_burden}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                totalDescriptor: i18n("load"),
                countDescriptor: i18n("highest-lapse-count"),
                legend_left: i18n("lapse-count"),
                legend_right: i18n("card-load"),
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            {i18n("lapse-load-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("lapse-distribution")}</h1>
        <IntervalGraph
            intervals={lapses}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                countDescriptor: i18n("highest-lapse-count"),
                legend_left: i18n("lapse-count"),
                legend_right: i18n("card-count"),
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            {i18n("lapse-distribution-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("lapse-total")}</h1>
        <IntervalGraph
            intervals={lapses.map((e, i) => e * i)}
            bind:steps={lapse_steps}
            bind:last={lapse_last}
            pieInfo={{
                totalDescriptor: i18n("lapses"),
                countDescriptor: i18n("highest-lapse-count"),
                legend_left: i18n("lapse-count"),
                legend_right: i18n("lapse-total"),
                spectrumFrom: "#bd3f09",
                spectrumTo: "#612207",
            }}
            zero_inclusive_option
        ></IntervalGraph>
        <p>
            {i18n("lapse-total-help")}
        </p>
    </GraphContainer>
</GraphCategory>
<GraphCategory>
    <!-- Repetition  -->
    <GraphContainer>
        <h1>{i18n("repetition-load")}</h1>
        <IntervalGraph
            intervals={repetitions_burden
                .map((burden) => (normalize_burden ? (burden / total_burden) * 100 : burden))
                .map((burden, i, last_mapepd_burden) =>
                    cumulative_burden ? _.sum(last_mapepd_burden.slice(1, i)) + burden : burden
                )}
            average={normalize_burden}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                totalDescriptor: i18n("load"),
                countDescriptor: i18n("highest-repetition-count"),
                legend_left: i18n("repetition-count"),
                legend_right: i18n("card-load"),
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>
            {i18n("repetition-load-help")}
        </p>
        <label>
            <input type="checkbox" bind:checked={normalize_burden} />
            {i18n("as-ratio")}
        </label>
        <label>
            <input type="checkbox" bind:checked={cumulative_burden} />
            {i18n("cumulative")}
        </label>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("repetition-avg-load")}</h1>
        <IntervalGraph
            intervals={repetitions_avg_burden}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                totalDescriptor: i18n("load"),
                countDescriptor: i18n("highest-repetition-count"),
                legend_left: i18n("repetition-count"),
                legend_right: i18n("card-load"),
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>
            {i18n("repetition-load-help")}
        </p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("repetition-distribution")}</h1>
        <IntervalGraph
            intervals={repetitions}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                countDescriptor: i18n("highest-repetition-count"),
                legend_left: i18n("repetition-count"),
                legend_right: i18n("card-count"),
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>{i18n("repetition-distribution-help")}</p>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("repetition-total")}</h1>
        <IntervalGraph
            intervals={repetitions.map((e, i) => e * i)}
            bind:steps={repetitions_steps}
            bind:last={repetitions_last}
            pieInfo={{
                totalDescriptor: i18n("total-repetitions"),
                countDescriptor: i18n("highest-repetition-count"),
                legend_left: i18n("repetition-count"),
                legend_right: i18n("repetition-total"),
                spectrumFrom: "#5ca7f7",
                spectrumTo: "#0b4f99",
            }}
        />
        <p>
            {i18n("repetition-total-help")}
        </p>
    </GraphContainer>
</GraphCategory>
