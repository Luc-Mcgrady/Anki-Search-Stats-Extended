import _ from "lodash"
import { createAxis, defaultX, defaultY, hoverBars, type ExtraRenderInput } from "./bar"
import { tooltip, tooltipShown } from "./stores"
import { tooltipDate, tooltipX } from "./tooltip"

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
    data: CandlestickDatum[]
    start: number
    tick_spacing?: number
    bar_width?: number
    up_colour?: string
    down_colour?: string
}

export const CANDLESTICK_GREEN = "green"
export const CANDLESTICK_RED = "red"

export function plotCandlestick(
    graph: CandlestickGraph,
    svg: SVGElement
): ExtraRenderInput<CandlestickGraph> {
    let { start: total, up_colour = CANDLESTICK_GREEN, down_colour = CANDLESTICK_RED } = graph

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

    const x = defaultX(deltas.map((datum) => datum.label))
    const y = defaultY(min, max)
    const axis = createAxis(svg, graph.tick_spacing, x, y)

    axis.append("g")
        .selectAll("g")
        .data(deltas)
        .join("rect")
        .attr("fill", (d) => (d.positive ? up_colour : down_colour))
        .attr("x", (d) => x(d.label)!)
        .attr("y", (d) => y(d.end))
        .attr("height", (d) => y(d.begin) - y(d.end))
        .attr("width", x.bandwidth())

    hoverBars(axis, x, deltas)
        .on("mouseover", (e, d) => {
            const delta = (d.end - d.begin) * (d.positive ? 1 : -1)
            const final = d.positive ? d.end : d.begin
            const date = tooltipDate(parseInt(d.label), graph.bar_width ?? 1)

            tooltipShown.set(true)
            tooltip.set({
                text: [`${date}:`, `Change: ${delta.toFixed(2)}`, `Final: ${final.toFixed(2)}`],
                x: tooltipX(e),
                y: e.pageY,
            })
        })
        .on("mouseout", (e, v) => {
            tooltipShown.set(false)
        })

    return { x, y, svg: axis, maxValue: max, chart: graph }
}

export function DeltaIfy(arr: number[]) {
    return arr.map((v, i) => v - (arr[i - 1] || 0))
}
