import type { Pattern } from "@fluent/bundle/esm/ast"
import _ from "lodash"
import createTrend from "trendline"
import type { ExtraRenderInput } from "./bar"

export type TrendInfo = Partial<{
    pattern: Pattern
    percentage: boolean
    absolute: boolean
}>

export type TrendLine = ReturnType<typeof trendLine>
export type TrendDatum = {
    x: number
    y: number
}

export function trendLine({ svg, x, y }: ExtraRenderInput<unknown>, data: TrendDatum[]) {
    if (!SSEconfig.trends) {
        return
    }

    data = data.filter((a) => !!a.y)

    const trend = createTrend(data, "x", "y")
    const leftmost = _.minBy(data, (datum) => datum.x)
    const rightmost = _.maxBy(data, (datum) => datum.x)

    if (rightmost == undefined || leftmost == undefined) {
        return
    }

    const half_step = x.step() / 2

    svg.append("line")
        .attr("x1", (x(leftmost.x.toString()) ?? 0) + half_step)
        .attr("y1", y(trend.calcY(leftmost.x))) // trend.yStart is at 0 which we are not
        .attr("x2", (x(rightmost.x.toString()) ?? 0) + half_step)
        .attr("y2", y(trend.calcY(rightmost.x)))
        .style("stroke", "black")
        .style("stroke-width")

    return trend
}
