import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import { day_ms } from "./revlogGraphs"
import { tooltipShown } from "./stores"

export type LineGraphData = {
    values: number[][]
    labels: string[]
    colours: string[]
}

export function renderLineChart(
    svg: SVGElement,
    { values, labels, colours }: LineGraphData,
    label = "Value"
) {
    const { width, height } = defaultGraphBounds()

    type Point = { value: number; date: Date }
    const date_values = values.map((arr, i) => ({
        values: arr
            .map((v, i) => ({ value: v, date: new Date(i * day_ms) }))
            .filter((a) => a.value),
        colour: colours[i],
        label: labels[i],
    }))

    const flat = date_values.map((d) => d.values).flat()

    const xMin = d3.min(flat.map((d) => d.date))!
    const xMax = d3.max(flat.map((d) => d.date))!

    const x = d3.scaleTime().domain([xMin, xMax]).range([0, width])

    const yMax = d3.max(values.flat()) || 0

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
        .selectAll("path")
        .data(date_values)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", (d) => d.colour)
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none")
        .datum((d) => d.values)
        .attr(
            "d",
            d3
                .line<Point>()
                .x((d) => x(d.date))
                .y((d) => y(d.value))
        )

    /*
    axis.append("g")
        .selectAll("g")
        .data()
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
    */

    axis.on("mouseover", () => tooltipShown.set(true)).on("mouseleave", () =>
        tooltipShown.set(false)
    )
}
