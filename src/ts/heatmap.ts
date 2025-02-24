export type HeatmapData = {
    x_start: number
    x_end: number
    x_bins: number

    y_start: number
    y_end: number
    y_bins: number

    raw_data: (number | undefined)[]
}

export type HeatmapSelectionData = {
    x_idx: number
    y_idx: number

    value: number
}
