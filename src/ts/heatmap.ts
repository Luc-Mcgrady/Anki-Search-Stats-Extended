import * as d3 from "d3"

export type HeatmapDimension = {
    start_value: number
    end_value: number

    bin_count: number

    is_logarithmic: boolean
}

export type HeatmapData = {
    x_dim: HeatmapDimension
    y_dim: HeatmapDimension

    raw_data: (number | undefined)[]
}

export type HeatmapSelectionData = {
    x_idx: number
    y_idx: number

    x_from: number
    x_to: number

    y_from: number
    y_to: number

    value: number
}

export function create_scale(
    dim: HeatmapDimension,
    range: [number, number]
): d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> {
    if (dim.is_logarithmic) {
        // We are not allowed to use exactly 0 in a log domain so fudge things a little
        return d3.scaleLog([d3.max([dim.start_value, 1])!, dim.end_value], range)
    } else {
        return d3.scaleLinear([dim.start_value, dim.end_value], range)
    }
}
