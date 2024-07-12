import _ from "lodash"
import { createAxis } from "./bar"

export type CandlestickDatum = {
    delta: number
    label: string
}

type CandlestickDelta = {
    begin: number
    end: number
    label: string
}

export function plotCandlestick(data: CandlestickDatum[], svg: SVGElement) {
    let total = 0

    console.log(data)

    const deltas: CandlestickDelta[] = data.map((datum) => {
        let begin = total
        total += datum.delta
        return {
            begin,
            end: total,
            label: datum.label,
        }
    })

    const max = _.maxBy(deltas, (datum) => datum.end)?.end ?? 0
    const min = _.maxBy(deltas, (datum) => datum.begin)?.begin ?? 0

    createAxis(
        svg,
        deltas.map((datum) => datum.label),
        max,
        min
    )
}
