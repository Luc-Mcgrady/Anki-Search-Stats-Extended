<script lang="ts">
    import * as d3 from "d3"
    import type { HeatmapData } from "./heatmap"

    interface Props {
        width?: number
        height?: number

        marginTop?: number
        marginBottom?: number
        marginLeft?: number
        marginRight?: number

        x_axis_label?: string
        y_axis_label?: string

        data: HeatmapData
    }

    const {
        width = 640,
        height = 640,

        marginTop = 20,
        marginRight = 20,
        marginBottom = 40,
        marginLeft = 40,

        x_axis_label,
        y_axis_label,

        data,
    }: Props = $props()

    let gx: SVGGElement | undefined = $state(undefined)
    let gy: SVGGElement | undefined = $state(undefined)

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

    const color = $derived(
        d3.scaleLinear(
            [Math.min(...data.raw_data), Math.max(...data.raw_data)],
            ["cornflowerblue", "red"]
        )
    )

    $effect(() => {
        // TODO: Pass in tickFormat instead of hard-coding
        d3.select(gx).call(d3.axisBottom(x_scale).tickFormat(d3.format(".0%")))
        d3.select(gy).call(d3.axisLeft(y_scale))
    })

    // A helper for creating ranges from `start` (inclusive) to `end` (exclusive)
    function* range(start: number, end: number): Generator<number> {
        for (let i = start; i < end; i++) {
            yield i
        }
    }
</script>

<svg {width} {height}>
    <!-- Axes -->
    <g font-family="sans-serif">
        <!-- X Axis -->
        <g>
            <g bind:this={gx} transform="translate(0,{height - marginBottom})" />

            {#if x_axis_label}
                <!-- TODO: Actually place label sensibly instead of hard-coding -->
                <text
                    transform="translate({marginLeft +
                        (width - (marginLeft + marginRight)) / 2},{height - 12})"
                    text-anchor="middle"
                    fill="currentColor"
                >
                    {x_axis_label}
                </text>
            {/if}
        </g>

        <!-- Y Axis -->
        <g>
            <g bind:this={gy} transform="translate({marginLeft},0)" />

            {#if y_axis_label}
                <!-- TODO: Actually place label sensibly instead of hard-coding -->
                <text
                    transform="translate(12, {marginTop +
                        (height - (marginTop + marginBottom)) / 2}) rotate(-90)"
                    text-anchor="middle"
                    fill="currentColor"
                >
                    {y_axis_label}
                </text>
            {/if}
        </g>
    </g>

    <!-- Data Points -->
    <g stroke="currentColor" stroke-width="1px">
        {#each range(0, data.y_bins) as y_idx (y_idx)}
            {#each range(0, data.x_bins) as x_idx (x_idx)}
                {@const value = data.raw_data[x_idx + y_idx * data.x_bins]}

                <rect
                    x={x_scale(data.x_start + x_idx * col_width)}
                    y={y_scale(data.y_start + (y_idx + 1) * row_height)}
                    width="{scaled_col_width}px"
                    height="{scaled_row_height}px"
                    fill={color(value)}
                    aria-label="value: {value}"
                />
            {/each}
        {/each}
    </g>
</svg>
