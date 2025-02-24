<script lang="ts">
    import * as d3 from "d3"
    import { computePosition, flip, shift, offset } from "@floating-ui/dom"

    import type { HeatmapData, HeatmapSelectionData } from "./heatmap"

    const DEFAULT_TOOLTIP_FORMAT = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 2,
    })

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

        data: HeatmapData
    }

    const {
        xAxisLabel,
        yAxisLabel,

        xAxisTickFormat,
        yAxisTickFormat,

        xTooltipLabel = "x",
        yTooltipLabel = "y",
        valueTooltipLabel = "value",

        xTooltipFormat = DEFAULT_TOOLTIP_FORMAT,
        yTooltipFormat = DEFAULT_TOOLTIP_FORMAT,
        valueTooltipFormat = DEFAULT_TOOLTIP_FORMAT,

        data,
    }: Props = $props()

    const width = 640
    const height = 640

    const marginTop = 20
    const marginRight = 20
    const marginBottom = 50
    const marginLeft = 50

    let chart: SVGElement | undefined = $state()

    let gx: SVGGElement | undefined = $state()
    let gy: SVGGElement | undefined = $state()

    let tooltip: HTMLDivElement | undefined = $state()

    const x_scale = $derived(
        d3.scaleLinear([data.x_start, data.x_end], [marginLeft, width - marginRight])
    )
    const y_scale = $derived(
        d3.scaleLinear([data.y_start, data.y_end], [height - marginBottom, marginTop])
    )

    const col_width = $derived((data.x_end - data.x_start) / data.x_bins)
    const row_height = $derived((data.y_end - data.y_start) / data.y_bins)

    const scaled_col_width = $derived(
        Math.abs(x_scale(data.x_start + col_width) - x_scale(data.x_start))
    )
    const scaled_row_height = $derived(
        Math.abs(y_scale(data.y_start + row_height) - y_scale(data.y_start))
    )

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

        // @ts-ignore: @types/d3 seems to be wrong
        d3.select(gx).call(xAxisGenerator)
        // @ts-ignore: @types/d3 seems to be wrong
        d3.select(gy).call(yAxisGenerator)
    })

    // A helper for creating ranges from `start` (inclusive) to `end` (exclusive)
    function* range(start: number, end: number): Generator<number> {
        for (let i = start; i < end; i++) {
            yield i
        }
    }

    let hover_data: HeatmapSelectionData | null = $state(null)

    function on_focus(x_idx: number, y_idx: number) {
        return (e: Event) => {
            const value = data.raw_data[x_idx + y_idx * data.x_bins]

            if (value != undefined) {
                hover_data = {
                    x_idx,
                    y_idx,
                    value,
                }

                computePosition(e.target as Element, tooltip!, {
                    placement: "bottom-start",
                    middleware: [
                        offset(25),
                        flip({ boundary: chart }),
                        shift({ boundary: chart, padding: 5 }),
                    ],
                }).then(({ x, y }) => {
                    Object.assign(tooltip!.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                    })
                })
            }
        }
    }

    function on_blur() {
        return () => {
            hover_data = null
        }
    }
</script>

<svg bind:this={chart} viewBox="0, 0, {width}, {height}" preserveAspectRatio="meet">
    <!-- Axes -->
    <g font-family="sans-serif">
        <!-- X Axis -->
        <g>
            <g bind:this={gx} transform="translate(0,{height - marginBottom})" />

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
            <g bind:this={gy} transform="translate({marginLeft},0)" />

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
        {#each range(0, data.y_bins) as y_idx (y_idx)}
            <g role="row">
                {#each range(0, data.x_bins) as x_idx (x_idx)}
                    {@const value = data.raw_data[x_idx + y_idx * data.x_bins]}

                    {#if value !== undefined}
                        <g role="cell" aria-rowindex={y_idx} aria-colindex={x_idx}>
                            <rect
                                class="bin"
                                x={x_scale(data.x_start + x_idx * col_width)}
                                y={y_scale(data.y_start + (y_idx + 1) * row_height)}
                                width={scaled_col_width}
                                height={scaled_row_height}
                                fill={color(value)}
                                onfocus={on_focus(x_idx, y_idx)}
                                onblur={on_blur()}
                                onmouseenter={on_focus(x_idx, y_idx)}
                                onmouseleave={on_blur()}
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
                x={x_scale(data.x_start + hover_data.x_idx * col_width)}
                y={y_scale(data.y_start + (hover_data.y_idx + 1) * row_height)}
                width={scaled_col_width}
                height={scaled_row_height}
                fill="none"
            />
        {/if}
    </g>
</svg>

<div bind:this={tooltip} class={hover_data ? "hm-tooltip" : "tooltip-hidden"} role="tooltip">
    {#if hover_data !== null}
        {@const x_from = data.x_start + hover_data.x_idx * col_width}
        {@const x_to = data.x_start + (hover_data.x_idx + 1) * col_width}

        {@const y_from = data.y_start + hover_data.y_idx * row_height}
        {@const y_to = data.y_start + (hover_data.y_idx + 1) * row_height}

        <div class="tooltip-x tooltip-label">{xTooltipLabel}:</div>
        <div class="tooltip-x tooltip-from">{xTooltipFormat.format(x_from)}</div>
        <div class="tooltip-x tooltip-separator">&ndash;</div>
        <div class="tooltip-x tooltip-to">{xTooltipFormat.format(x_to)}</div>

        <div class="tooltip-y tooltip-label">{yTooltipLabel}:</div>
        <div class="tooltip-y tooltip-from">{yTooltipFormat.format(y_from)}</div>
        <div class="tooltip-y tooltip-separator">&ndash;</div>
        <div class="tooltip-y tooltip-to">{yTooltipFormat.format(y_to)}</div>

        <div class="tooltip-value tooltip-label">{valueTooltipLabel}:</div>
        <div class="tooltip-value tooltip-data">
            {valueTooltipFormat.format(hover_data.value)}
        </div>
    {/if}
</div>

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

    // We cannot use just `tooltip` because it has global styling outside of svelte
    .hm-tooltip {
        width: max-content;

        display: inline-grid;
        grid-template-columns: max-content 1fr max-content 1fr;

        position: absolute;
        top: 0;
        left: 0;

        border-radius: 4px;
        padding: 0.5rem 1rem;
        background: var(--canvas-overlay);
        color: var(--fg);
    }

    .tooltip-hidden {
        display: none;
    }

    .tooltip-label {
        grid-column: 1;
        text-align: right;
    }

    .tooltip-from {
        grid-column: 2;
        text-align: right;
    }

    .tooltip-separator {
        grid-column: 3;
    }

    .tooltip-to {
        grid-column: 4;
        text-align: left;
    }

    .tooltip-data {
        grid-column: 2 / -1;

        text-align: center;
    }

    .tooltip-from,
    .tooltip-to,
    .tooltip-data {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .tooltip-x {
        grid-row: 1;
    }

    .tooltip-y {
        grid-row: 2;
    }

    .tooltip-value {
        grid-row: 3;
    }
</style>
