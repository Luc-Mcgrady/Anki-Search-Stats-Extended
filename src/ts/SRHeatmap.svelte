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

    const R_FORMAT = new Intl.NumberFormat(navigator.language, {
        style: "percent",
        maximumFractionDigits: 1,
    })

    const S_FORMAT = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 1,
    })

    const S_BIN_LOG_FORMAT = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 2,
    })

    interface ChartSizeOption {
        name: string
        width: number
        height: number
    }

    const CHART_SIZE: ChartSizeOption[] = [
        { name: "Compact", width: 640, height: 320 },
        { name: "Square", width: 640, height: 640 },
    ]

    const R_BIN_WIDTHS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1]
    const DEFAULT_R_BIN_WIDTH = 0.05

    const S_BIN_WIDTHS_LOG = [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2]
    const DEFAULT_S_BIN_WIDTH_LOG = 0.1

    interface Props {
        cardData: CardData[] | null

        searchString?: string | null
    }

    const {
        cardData,

        searchString,
    }: Props = $props()

    let chart_size = $state(CHART_SIZE[0])

    let s_is_logarithmic: boolean = $state(false)

    let r_bin_width = $state(DEFAULT_R_BIN_WIDTH)
    let s_bin_width_linear = new ConstrainedIntState(1, 3650, 7)
    let s_bin_width_log = $state(DEFAULT_S_BIN_WIDTH_LOG)

    const sr_dataset: CardSRDataset | null = $derived(
        create_card_sr_dataset(cardData, $other.days_elapsed)
    )

    $effect(() => {
        // When the dataset changes reset the s_bin_width to something sensible
        if (sr_dataset !== null) {
            s_bin_width_linear.value = (sr_dataset.max_s - sr_dataset.min_r) / 20
        }
    })

    const heatmap_data: HeatmapData | null = $derived(
        calculate_sr_heatmap_data(
            sr_dataset,
            r_bin_width,
            s_is_logarithmic ? s_bin_width_log : s_bin_width_linear.value,
            s_is_logarithmic
        )
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
        <label id="label_chart_size" for="input_chart_size">Size:</label>
        <select id="input_chart_size" bind:value={chart_size}>
            {#each CHART_SIZE as size}
                <option value={size}>{size.name}</option>
            {/each}
        </select>

        <label id="label_logarithmic_s" for="input_logarithmic_s" class="option-label">
            Log S:
        </label>
        <input id="input_logarithmic_s" type="checkbox" bind:checked={s_is_logarithmic} />

        <label id="label_r_bin_width" for="input_r_bin_width" class="option-label">R Bins:</label>
        <select id="input_r_bin_width" bind:value={r_bin_width}>
            {#each R_BIN_WIDTHS as bin_width}
                <option value={bin_width}>{R_FORMAT.format(bin_width)}</option>
            {/each}
        </select>

        <label id="label_s_bin_width" for="input_s_bin_width" class="option-label">S Bins:</label>
        {#if s_is_logarithmic}
            <select id="input_s_bin_width" bind:value={s_bin_width_log}>
                {#each S_BIN_WIDTHS_LOG as bin_width}
                    <option value={bin_width}>{S_BIN_LOG_FORMAT.format(bin_width)}</option>
                {/each}
            </select>
        {:else}
            <input
                id="input_s_bin_width"
                type="number"
                min={1}
                max={3650}
                step="1"
                bind:value={s_bin_width_linear.value}
            />
        {/if}
    </div>

    <Heatmap
        canvasWidth={chart_size.width}
        canvasHeight={chart_size.height}
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
        gap: 0.5em;
        align-items: baseline;
    }

    .option-label {
        justify-self: right;
    }

    #label_chart_size {
        grid-column: 1;
        grid-row: 1;
    }

    #input_chart_size {
        grid-column: 2;
        grid-row: 1;
    }

    #label_logarithmic_s {
        grid-column: 3;
        grid-row: 1;
    }

    #input_logarithmic_s {
        grid-column: 4;
        grid-row: 1;

        justify-self: left;
    }

    #label_r_bin_width {
        grid-column: 1;
        grid-row: 2;
    }

    #input_r_bin_width {
        grid-column: 2;
        grid-row: 2;
    }

    #label_s_bin_width {
        grid-column: 3;
        grid-row: 2;
    }

    #input_s_bin_width {
        grid-column: 4;
        grid-row: 2;
    }

    input[type="number"] {
        min-width: 5em;
    }
</style>
