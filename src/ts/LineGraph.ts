import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import { day_ms } from "./revlogGraphs"
import { tooltip, tooltipShown } from "./stores"
import { tooltipX } from "./tooltip"

export function renderLineChart(svg: SVGElement, values: number[], label = "Value") {
    const { width, height } = defaultGraphBounds()

    type Point = { value: number; date: Date }
    const date_values = values
        .map((v, i) => ({ value: v, date: new Date(i * day_ms) }))
        .filter((a) => a.value)

    const xMin = d3.min(date_values.map((d) => d.date))!
    const xMax = d3.max(date_values.map((d) => d.date))!

    const x = d3.scaleTime().domain([xMin, xMax]).range([0, width])

    const yMax = d3.max(values) || 0

    const y = d3.scaleLinear().domain([yMax, 0]).range([0, height]).nice()

    const axis = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${width + 50} ${height + 50}`)
        .append("g")

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
        .attr(
            "d",
            d3
                .line<Point>()
                .x((d) => x(d.date))
                .y((d) => y(d.value))
        )

    axis.append("g")
        .selectAll("g")
        .data(date_values.filter((a) => a))
        .join("rect")
        .attr("class", "hover-bar")
        .attr("height", height)
        .attr("width", date_values.length / width + 1)
        .attr("x", (d) => x(d.date)!)
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
