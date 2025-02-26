<script lang="ts">
    import { other } from "./stores"
    import type { CardData } from "./search"

    import Heatmap from "./Heatmap.svelte"
    import type { HeatmapData, HeatmapSelectionData } from "./heatmap"
    import NoGraph from "./NoGraph.svelte"

    import {
        calculate_sr_heatmap_data,
        type CardSRDataset,
        create_card_sr_dataset,
    } from "./srHeatmap"
    import { ConstrainedIntState } from "./utils.svelte"

    const S_FORMAT = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 0,
    })

    const R_FORMAT = new Intl.NumberFormat(navigator.language, {
        style: "percent",
        maximumFractionDigits: 1,
    })

    const R_BIN_WIDTHS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1]

    interface Props {
        cardData: CardData[] | null

        searchString?: string | null
    }

    const {
        cardData,

        searchString,
    }: Props = $props()

    let r_bin_width = $state(0.05)
    let s_bin_width = new ConstrainedIntState(1, 3650, 7)

    const sr_dataset: CardSRDataset | null = $derived(
        create_card_sr_dataset(cardData, $other.days_elapsed)
    )

    $effect(() => {
        // When the dataset changes reset the s_bin_width to something sensible
        if (sr_dataset !== null) {
            s_bin_width.value = (sr_dataset.max_s - sr_dataset.min_r) / 20
        }
    })

    const heatmap_data: HeatmapData | null = $derived(
        calculate_sr_heatmap_data(sr_dataset, r_bin_width, s_bin_width.value)
    )

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
            <select bind:value={r_bin_width}>
                {#each R_BIN_WIDTHS as bin_width}
                    <option value={bin_width}>{R_FORMAT.format(bin_width)}</option>
                {/each}
            </select>
        </label>

        <label>
            S Bins:
            <input type="number" min={1} max={3650} step="1" bind:value={s_bin_width.value} />
        </label>
    </div>

    <Heatmap
        xAxisLabel="Retrievability"
        xAxisTickFormat=".0%"
        yAxisLabel="Stability (days)"
        xTooltipLabel="R"
        yTooltipLabel="S"
        valueTooltipLabel="Cards"
        xTooltipFormat={R_FORMAT}
        yTooltipFormat={S_FORMAT}
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
