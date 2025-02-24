<script lang="ts">
    import { other } from "./stores"
    import type { CardData } from "./search"

    import Heatmap from "./Heatmap.svelte"
    import type { HeatmapData, HeatmapSelectionData } from "./heatmap"
    import NoGraph from "./NoGraph.svelte"

    import { calculate_sr_heatmap_data } from "./sr-heatmap"

    interface Props {
        cardData: CardData[] | null

        searchString?: string | null
    }

    const {
        cardData,

        searchString,
    }: Props = $props()

    let r_bins: number = $state(20)
    let s_bins: number = $state(20)

    const heatmap_data: HeatmapData | null = $derived(
        calculate_sr_heatmap_data(cardData, r_bins, s_bins, $other.days_elapsed)
    )

    const s_tooltip_format = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 0,
    })

    const r_tooltip_format = new Intl.NumberFormat(navigator.language, {
        style: "percent",
        maximumFractionDigits: 1,
    })

    function open_browser_search(selection: HeatmapSelectionData) {
        if (searchString !== undefined && searchString !== null) {
            // @ts-ignore Typescript does not know that Anki has added bridgeCommand
            window.bridgeCommand(
                `browserSearch:(${searchString})` +
                    ` prop:r>=${selection.x_from}` +
                    ` prop:r<=${selection.x_to}` +
                    ` prop:s>=${selection.y_from}` +
                    ` prop:s<=${selection.y_to}`
            )
        }
    }
</script>

{#if heatmap_data !== null}
    <div class="options">
        <label>
            R Bins:
            <input type="number" min="10" max="100" step="1" bind:value={r_bins} />
        </label>

        <label>
            S Bins:
            <input type="number" min="10" max="100" step="1" bind:value={s_bins} />
        </label>
    </div>

    <Heatmap
        xAxisLabel="Retrievability"
        xAxisTickFormat=".0%"
        yAxisLabel="Stability (days)"
        xTooltipLabel="R"
        yTooltipLabel="S"
        valueTooltipLabel="Cards"
        xTooltipFormat={r_tooltip_format}
        yTooltipFormat={s_tooltip_format}
        onSelect={open_browser_search}
        data={heatmap_data}
    />
{:else}
    <NoGraph />
{/if}

<style lang="scss">
    .options {
        display: grid;
        grid-template-columns: auto 1fr auto 1fr;
        grid-template-areas: "a a b b";
        gap: 0.5em;
        align-items: baseline;
    }

    label {
        display: contents;
    }

    input {
        min-width: 5em;
    }
</style>
