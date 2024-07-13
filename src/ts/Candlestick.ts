import _ from "lodash"
import { createAxis } from "./bar"

export type CandlestickDatum = {
    delta: number
    label: string
}

type CandlestickDelta = {
    begin: number
    end: number
    positive: boolean
    label: string
}

export type CandlestickGraph = {
    start: number
    data: CandlestickDatum[]
}

export function plotCandlestick(graph: CandlestickGraph, svg: SVGElement) {
    let total = graph.start

    console.log(graph)

    const deltas: CandlestickDelta[] = graph.data.map((datum) => {
        let begin = total
        total += datum.delta

        const positive = datum.delta > 0

        return {
            positive,
            begin: positive ? begin : total,
            end: positive ? total : begin,
            label: datum.label,
        }
    })

    const max = _.maxBy(deltas, (datum) => datum.end)?.end ?? 0
    const min = _.minBy(deltas, (datum) => datum.begin)?.begin ?? 0

    const { axis, x, y } = createAxis(
        svg,
        deltas.map((datum) => datum.label),
        max,
        min
    )

    console.log({ deltas, max, min })

    axis.append("g")
        .selectAll("g")
        .data(deltas)
        .join("rect")
        .attr("fill", (d) => (d.positive ? "red" : "green"))
        .attr("x", (d) => x(d.label)!)
        .attr("y", (d) => y(d.end))
        .attr("height", (d) => y(d.begin) - y(d.end))
        .attr("width", x.bandwidth())
}
