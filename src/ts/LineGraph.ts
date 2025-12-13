import * as d3 from "d3"
import { clearChart, defaultGraphBounds } from "./graph"
import { day_ms } from "./revlogGraphs"
import { tooltip, tooltipShown } from "./stores"
import { tooltipX } from "./tooltip"

export function gridLines(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    xTicks: number[],
    yTicks: number[]
) {
    const { width, height } = defaultGraphBounds()

    svg.append("g")
        .selectAll("line")
        .data(xTicks)
        .join("line")
        .attr("x1", (d) => d)
        .attr("x2", (d) => d)
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "currentColor")
        .style("opacity", 0.05)

    svg.append("g")
        .selectAll("line")
        .data(yTicks)
        .join("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", (d) => d)
        .attr("y2", (d) => d)
        .attr("stroke", "currentColor")
        .style("opacity", 0.05)
}

export function renderLineChart(
    svg: SVGElement,
    values: number[],
    label = "Value",
    filter_zeros = true
) {
    if (!svg) {
        return
    }
    // This is a hacky fix and I should probably fix the d3 calls below instead
    clearChart(svg)
    const { width, height } = defaultGraphBounds()

    type Point = { value: number; date: Date }

    const first_non_zero_index = values.findIndex((v) => v)
    const start_index = first_non_zero_index === -1 ? 0 : first_non_zero_index

    const date_values = Array.from(values)
        .slice(start_index)
        .map((v, i) => ({
            value: v ?? 0,
            date: new Date((start_index + i) * day_ms),
        }))
        .filter((a) => (filter_zeros ? a.value : true))

    const xMin = d3.min(date_values.map((d) => d.date))!
    const xMax = d3.max(date_values.map((d) => d.date))!

    const x = d3.scaleTime().domain([xMin, xMax]).range([0, width])

    const yMax = d3.max(values) || 0

    const y = d3.scaleLinear().domain([yMax, 0]).range([0, height]).nice()

    const axis = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${width + 50} ${height + 50}`)
        .append("g")

    gridLines(axis, x.ticks(7).map(x), y.ticks().map(y))

    axis.append("g").call(d3.axisLeft(y)).attr("opacity", 0.5)

    axis.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("opacity", 0.5)
        .call(d3.axisBottom(x).ticks(7))

    d3.select(svg)
        .append("path")
        .datum(date_values)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none")
        .attr(
            "d",
            d3
                .line<Point>()
                .x((d) => x(d.date))
                .y((d) => y(d.value))
        )

    const bar_width = width / date_values.length + 1
    axis.append("g")
        .selectAll("g")
        .data(date_values.filter((a) => a))
        .join("rect")
        .attr("class", "hover-bar")
        .attr("height", height)
        .attr("width", (_, i) => (i > 0 ? bar_width : bar_width / 2))
        .attr("x", (d, i) => x(d.date)! - (i > 0 ? bar_width / 2 : 0))
        .attr("y", 0)
        .on("mouseover", (e: MouseEvent, d) => {
            const value_string = d.value > 10 ? d.value.toFixed(0) : d.value.toPrecision(2)
            tooltip.set({
                x: tooltipX(e),
                y: e.pageY,
                text: [`${d.date.toLocaleDateString()}:`, `${label}: ${value_string}`],
            })
        })

    axis.on("mouseover", () => tooltipShown.set(true)).on("mouseleave", () =>
        tooltipShown.set(false)
    )
}
