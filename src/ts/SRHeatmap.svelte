<script lang="ts">
    import { other } from "./stores"
    import { browserSearch, type CardData } from "./search"

    import Heatmap from "./Heatmap.svelte"
    import type { HeatmapData, HeatmapSelectionData } from "./heatmap"
    import NoGraph from "./NoGraph.svelte"

    import {
        calculate_sr_heatmap_data,
        type CardSRDataset,
        create_card_sr_dataset,
    } from "./srHeatmap"
    import { ConstrainedIntState } from "./utils.svelte"
    import { defaultGraphBounds } from "./graph"
    import { i18n } from "./i18n"

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

    let enlarged = $state(false)
    const { width, height: default_height } = defaultGraphBounds()
    let height = $derived(enlarged ? default_height * 2 : default_height)

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
            browserSearch(
                `(${searchString})` +
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
            {i18n("enlarged")}
            <div>
                <input type="checkbox" bind:checked={enlarged} />
            </div>
        </label>

        <label>
            {i18n("logarithmic-s")}
            <div>
                <input type="checkbox" bind:checked={s_is_logarithmic} />
            </div>
        </label>

        <label>
            {i18n("r-bin-size")}:
            <select bind:value={r_bin_width}>
                {#each R_BIN_WIDTHS as bin_width}
                    <option value={bin_width}>{R_FORMAT.format(bin_width)}</option>
                {/each}
            </select>
        </label>

        <label>
            {i18n("s-bin-size")}:
            {#if s_is_logarithmic}
                <select bind:value={s_bin_width_log}>
                    {#each S_BIN_WIDTHS_LOG as bin_width}
                        <option value={bin_width}>{S_BIN_LOG_FORMAT.format(bin_width)}</option>
                    {/each}
                </select>
            {:else}
                <input
                    type="number"
                    min={1}
                    max={3650}
                    step="1"
                    bind:value={s_bin_width_linear.value}
                />
            {/if}
        </label>
    </div>

    <Heatmap
        canvasWidth={width}
        canvasHeight={height}
        xAxisLabel={i18n("retrievability")}
        xAxisTickFormat=".0%"
        yAxisLabel={i18n("stability")}
        xTooltipLabel={i18n("retrievability-short")}
        yTooltipLabel={i18n("stability-short")}
        valueTooltipLabel={i18n("cards")}
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
        height: 4em;
    }

    .options label {
        display: contents;
    }

    input[type="number"] {
        min-width: 5em;
    }

    input[type="checkbox"] {
        justify-self: left;
    }
</style>
