import type { TrendRange } from "./trend"

type AxisDatum = {
    label: string
    trendStart?: number
    trendEnd?: number
}

export function trendRangeFromAxisDatum(datum: AxisDatum): TrendRange {
    const startX = datum.trendStart ?? +datum.label
    const endX = datum.trendEnd ?? startX
    return { startX, endX }
}

export function trendMidpointXFromAxisDatum(datum: AxisDatum) {
    const { startX, endX } = trendRangeFromAxisDatum(datum)
    return (startX + endX) / 2
}

export function candlestickDisplayLabelFromIndex(index: number) {
    return (index + 1).toString()
}
