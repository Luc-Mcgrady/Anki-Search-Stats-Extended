<script lang="ts">
    import GraphContainer from "../GraphContainer.svelte"
    import IntervalGraph from "../IntervalGraph.svelte"
    import GraphCategory from "../GraphCategory.svelte"
    import { i18n } from "../i18n"
    import { catchErrors, type CardData } from "../search"
    import { include_suspended, graph_mode, zero_inclusive, card_data } from "../stores"
    import { calculateCardDataPies } from "../CardDataPies"

    let cardData: CardData[] | null = $card_data

    $: true_zero_inclusive = $zero_inclusive || $graph_mode == "Bar"
    $: ({ lapses, lapses_burden } = catchErrors(() =>
        calculateCardDataPies(cardData ?? [], $include_suspended, true_zero_inclusive)
    ))

    let lapse_last = 7
    let lapse_steps = 7
</script>

<GraphCategory hidden_title={i18n("lapse-distribution")} config_name="lapse">
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
