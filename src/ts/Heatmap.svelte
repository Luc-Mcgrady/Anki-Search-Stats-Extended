<script lang="ts">
    import * as d3 from "d3"

    import type { HeatmapData, HeatmapSelectionData } from "./heatmap"
    import { tooltip, tooltipShown } from "./stores"
    import { tooltipX } from "./tooltip"

    interface Props {
        xAxisLabel?: string
        yAxisLabel?: string

        xAxisTickFormat?: string
        yAxisTickFormat?: string

        onSelect?: (data: HeatmapSelectionData) => void

        data: HeatmapData
    }

    const {
        xAxisLabel,
        yAxisLabel,

        xAxisTickFormat,
        yAxisTickFormat,

        onSelect,

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
        return (e: MouseEvent) => {
            const value = data.raw_data[x_idx + y_idx * data.x_bins]

            if (value != undefined) {
                const x_from = data.x_start + x_idx * col_width
                const x_to = data.x_start + (x_idx + 1) * col_width

                const y_from = data.y_start + y_idx * row_height
                const y_to = data.y_start + (y_idx + 1) * row_height

                hover_data = {
                    x_idx,
                    y_idx,
                    x_from,
                    x_to,
                    y_from,
                    y_to,
                    value,
                }

                $tooltip = {
                    x: tooltipX(e),
                    y: e.pageY + row_height,
                    text: [
                        `R: ${x_from.toFixed(2)}-${x_to.toFixed(2)}`,
                        `S: ${y_from.toFixed(2)}-${y_to.toFixed(2)}`,
                        `Cards: ${value}`,
                    ],
                }
                $tooltipShown = true
            }
        }
    }

    function on_blur() {
        $tooltipShown = false
    }

    function on_click() {
        if (onSelect !== undefined && hover_data !== null) {
            onSelect(hover_data)
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
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <rect
                                class="bin"
                                x={x_scale(data.x_start + x_idx * col_width)}
                                y={y_scale(data.y_start + (y_idx + 1) * row_height)}
                                width={scaled_col_width}
                                height={scaled_row_height}
                                fill={color(value)}
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
                x={x_scale(data.x_start + hover_data.x_idx * col_width)}
                y={y_scale(data.y_start + (hover_data.y_idx + 1) * row_height)}
                width={scaled_col_width}
                height={scaled_row_height}
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
