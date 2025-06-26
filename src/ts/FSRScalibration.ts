import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import { i18n } from "./i18n"
import type { LossBin } from "./MemorisedBar"
import { tooltip, tooltipShown } from "./stores"
import { tooltipX } from "./tooltip"

export function fsrsCalibrationGraph(svg: SVGElement, bins: LossBin[]) {
    const { width, height } = defaultGraphBounds()

    const x = d3.scaleLinear().domain([0, 1]).range([0, width])
    const y = d3.scaleLinear().domain([1, 0]).range([0, height])
    const count_y = d3
        .scaleLinear()
        .domain([d3.max(bins.map((d) => d.count)) ?? 0, 0])
        .range([height, 0])

    const axis = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${width + 50} ${height + 50}`)
        .append("g")

    axis.append("g").call(d3.axisLeft(y)).attr("opacity", 0.5)

    axis.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("opacity", 0.5)
        .call(d3.axisBottom(x).ticks(7))

    let data = bins.map(
        (d, i) => [d.predicted / d.count, d.count, i / 20] as [number, number, number]
    )

    const bar_width = width / data.length + 1
    axis.append("g")
        .selectAll("g")
        .data(data.filter((a) => a))
        .join("rect")
        .attr("fill", "darkblue")
        .attr("height", (d) => count_y(d[1]))
        .attr("width", bar_width)
        .attr("x", (d, i) => x(d[2])! - (i > 0 ? bar_width / 2 : 0))
        .attr("y", (d) => height - count_y(d[1]))

    d3.select(svg)
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none")
        .attr(
            "d",
            d3
                .line<[number, number, number]>()
                .x((d, i) => {
                    return x(i / 20)
                })
                .y((d, i) => y(i / 20))
        )

    d3.select(svg)
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none")
        .attr(
            "d",
            d3
                .line<[number, number, number]>()
                .defined((d) => !!d)
                .x((d) => {
                    debugger
                    return x(d[2])
                })
                .y((d) => y(d[0]))
        )

    axis.append("g")
        .selectAll("g")
        .data(data.filter((a) => a))
        .join("rect")
        .attr("class", "hover-bar")
        .attr("height", height)
        .attr("width", (_, i) => (i > 0 ? bar_width : bar_width / 2))
        .attr("x", (d, i) => x(d[2])! - (i > 0 ? bar_width / 2 : 0))
        .attr("y", 0)
        .on("mouseover", (e: MouseEvent, d) => {
            const value_string = (d[0] * 100).toPrecision(5)
            tooltip.set({
                x: tooltipX(e),
                y: e.pageY,
                // Todo: i18n
                text: [
                    `${i18n("perfect")} ${(d[2] * 100).toFixed(0)}%:`,
                    `${i18n("predicted")}: ${value_string}%`,
                    `${i18n("count")}: ${d[1]}`,
                ],
            })
        })

    axis.on("mouseover", () => tooltipShown.set(true)).on("mouseleave", () =>
        tooltipShown.set(false)
    )
}
