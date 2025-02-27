<script lang="ts">
    import * as d3 from "d3"

    import {
        create_scale,
        type HeatmapData,
        type HeatmapDimension,
        type HeatmapSelectionData,
    } from "./heatmap"
    import { tooltip, tooltipShown } from "./stores"
    import { range } from "./utils.svelte"

    const DEFAULT_TOOLTIP_FORMAT = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 2,
    })

    const AXIS_OPACITY = 0.5

    interface Props {
        xAxisLabel?: string
        yAxisLabel?: string

        xAxisTickFormat?: string
        yAxisTickFormat?: string

        xTooltipLabel?: string
        yTooltipLabel?: string
        valueTooltipLabel?: string

        xTooltipFormat?: Intl.NumberFormat
        yTooltipFormat?: Intl.NumberFormat
        valueTooltipFormat?: Intl.NumberFormat

        onSelect?: (data: HeatmapSelectionData) => void

        data: HeatmapData
    }

    const {
        xAxisLabel,
        yAxisLabel,

        xAxisTickFormat,
        yAxisTickFormat,

        xTooltipLabel,
        yTooltipLabel,
        valueTooltipLabel,

        xTooltipFormat = DEFAULT_TOOLTIP_FORMAT,
        yTooltipFormat = DEFAULT_TOOLTIP_FORMAT,
        valueTooltipFormat = DEFAULT_TOOLTIP_FORMAT,

        onSelect,

        data,
    }: Props = $props()

    const width = 640
    const height = 640

    const marginTop = 20
    const marginRight = 20
    const marginBottom = 50
    const marginLeft = 50

    let gx: SVGGElement | undefined = $state()
    let gy: SVGGElement | undefined = $state()

    const x_scale = $derived(create_scale(data.x_dim, [marginLeft, width - marginRight]))
    const y_scale = $derived(create_scale(data.y_dim, [height - marginBottom, marginTop]))

    const color = $derived.by(() => {
        const non_null_data = data.raw_data.filter((x) => x !== undefined)

        let min = Math.min(...non_null_data)
        let max = Math.max(...non_null_data)

        if (min === Infinity) {
            min = Number.MIN_VALUE
        }

        if (max === -Infinity) {
            max = Number.MAX_VALUE
        }

        return d3.scaleLinear(
            [Math.min(...non_null_data), Math.max(...non_null_data)],
            ["cornflowerblue", "red"]
        )
    })

    $effect(() => {
        let xAxisGenerator = d3.axisBottom(x_scale)
        let yAxisGenerator = d3.axisLeft(y_scale)

        if (xAxisTickFormat) {
            xAxisGenerator = xAxisGenerator.tickFormat(d3.format(xAxisTickFormat))
        }

        if (yAxisTickFormat) {
            yAxisGenerator = yAxisGenerator.tickFormat(d3.format(yAxisTickFormat))
        }

        if (gx && gy) {
            d3.select(gx).call(xAxisGenerator)
            d3.select(gy).call(yAxisGenerator)
        }
    })

    /**
     * Gets the value at which the bin with index `idx` in the dimension `dim` starts.
     *
     * @param dim
     * @param idx
     */
    function get_dim_pos(dim: HeatmapDimension, idx: number) {
        // The normalised position in the dimension
        // i.e. from 0-1 where 0 = min value and 1 = max value
        const normal_pos = idx / dim.bin_count

        if (dim.is_logarithmic) {
            const log_start = Math.log10(dim.start_value)
            const log_end = Math.log10(dim.end_value)

            const scale_factor = log_end - log_start
            const relative_pos = normal_pos * scale_factor

            const absolute_pos = log_start + relative_pos

            return Math.pow(10, absolute_pos)
        } else {
            const scale_factor = dim.end_value - dim.start_value
            const relative_pos = normal_pos * scale_factor

            return dim.start_value + relative_pos
        }
    }

    /**
     * Get the x (left) position of cells representing bins with the x index `x_idx` in SVG units
     *
     * @param x_idx the x index of the bin
     */
    function cell_x_pos(x_idx: number): number {
        return x_scale(get_dim_pos(data.x_dim, x_idx))
    }

    /**
     * Get the y (top) position of cells representing bins with the y index `y_idx` in SVG units
     *
     * @param y_idx the y index of the bin
     */
    function cell_y_pos(y_idx: number): number {
        return y_scale(get_dim_pos(data.y_dim, y_idx + 1))
    }

    /**
     * Get the width of cells representing bins with the x index `x_idx` in SVG units
     *
     * @param x_idx the x index of the bin
     */
    function cell_width(x_idx: number): number {
        return cell_x_pos(x_idx + 1) - cell_x_pos(x_idx)
    }

    /**
     * Get the height of cells representing bins with the y index `y_idx` in SVG units
     *
     * @param y_idx the y index of the bin
     */
    function cell_height(y_idx: number): number {
        return cell_y_pos(y_idx) - cell_y_pos(y_idx + 1)
    }

    let hover_data: HeatmapSelectionData | null = $state(null)

    function on_focus(x_idx: number, y_idx: number) {
        return (e: MouseEvent | FocusEvent) => {
            const value = data.raw_data[x_idx + y_idx * data.x_dim.bin_count]

            if (value != undefined) {
                const x_from = get_dim_pos(data.x_dim, x_idx)
                const x_to = get_dim_pos(data.x_dim, x_idx + 1)

                const y_from = get_dim_pos(data.y_dim, y_idx)
                const y_to = get_dim_pos(data.y_dim, y_idx + 1)

                hover_data = {
                    x_idx,
                    y_idx,
                    x_from,
                    x_to,
                    y_from,
                    y_to,
                    value,
                }

                const target_rect = (e.target as unknown as Element).getBoundingClientRect()

                $tooltip = {
                    x: window.scrollX + target_rect.x,
                    y: window.scrollY + target_rect.y + target_rect.height + 16,
                    text: [
                        // N.B. en dashes not hyphens
                        `${yTooltipLabel}: ${yTooltipFormat.format(y_from)} – ${yTooltipFormat.format(y_to)}`,
                        `${xTooltipLabel}: ${xTooltipFormat.format(x_from)} – ${xTooltipFormat.format(x_to)}`,
                        `${valueTooltipLabel}: ${valueTooltipFormat.format(value)}`,
                    ],
                }
                $tooltipShown = true
            }
        }
    }

    function on_blur() {
        $tooltipShown = false
        hover_data = null
    }

    function on_click() {
        if (onSelect !== undefined && hover_data !== null) {
            onSelect(hover_data)
        }
    }
</script>

<svg viewBox="0, 0, {width}, {height}" preserveAspectRatio="meet">
    <!-- Axes -->
    <g font-family="sans-serif">
        <!-- X Axis -->
        <g>
            <g
                bind:this={gx}
                transform="translate(0,{height - marginBottom})"
                opacity={AXIS_OPACITY}
            />

            {#if xAxisLabel}
                <text
                    transform="translate({marginLeft +
                        (width - (marginLeft + marginRight)) / 2},{height - 12})"
                    text-anchor="middle"
                    fill="currentColor"
                >
                    {xAxisLabel}
                </text>
            {/if}
        </g>

        <!-- Y Axis -->
        <g>
            <g bind:this={gy} transform="translate({marginLeft},0)" opacity={AXIS_OPACITY} />

            {#if yAxisLabel}
                <text
                    transform="translate(12, {marginTop +
                        (height - (marginTop + marginBottom)) / 2}) rotate(-90)"
                    text-anchor="middle"
                    fill="currentColor"
                >
                    {yAxisLabel}
                </text>
            {/if}
        </g>
    </g>

    <!-- Data Points -->
    <g role="grid" stroke="currentColor" stroke-width="1px">
        {#each range(0, data.y_dim.bin_count) as y_idx (y_idx)}
            <g role="row">
                {#each range(0, data.x_dim.bin_count) as x_idx (x_idx)}
                    {@const value = data.raw_data[x_idx + y_idx * data.x_dim.bin_count]}

                    {#if value !== undefined}
                        <g role="cell" aria-rowindex={y_idx} aria-colindex={x_idx}>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <rect
                                class="bin"
                                x={cell_x_pos(x_idx)}
                                y={cell_y_pos(y_idx)}
                                width={cell_width(x_idx)}
                                height={cell_height(y_idx)}
                                fill={color(value)}
                                onfocus={on_focus(x_idx, y_idx)}
                                onblur={on_blur}
                                onmouseenter={on_focus(x_idx, y_idx)}
                                onmouseleave={on_blur}
                                onclick={on_click}
                                role="button"
                                tabindex="0"
                                aria-label="value: {value}"
                            />
                        </g>
                    {/if}
                {/each}
            </g>
        {/each}
    </g>

    <!-- Data Highlight -->
    <g stroke="currentColor" stroke-width="4px">
        {#if hover_data !== null}
            <rect
                class="bin-highlight"
                x={cell_x_pos(hover_data.x_idx)}
                y={cell_y_pos(hover_data.y_idx)}
                width={cell_width(hover_data.x_idx)}
                height={cell_height(hover_data.y_idx)}
                fill="none"
            />
        {/if}
    </g>
</svg>

<style lang="scss">
    .bin {
        pointer-events: fill;
    }

    .bin:focus {
        // Disable outline because we are showing the focussed element in a different way.
        outline: none;
    }

    .bin-highlight {
        pointer-events: none;
    }
</style>
