import * as d3 from "d3"
import _ from "lodash"
import { defaultGraphBounds } from "./graph"

export type BarDatum = {
    values: number[]
    label: string
}

export type BarChart = {
    row_labels: string[]
    row_colours: string[]
    data: BarDatum[]
}

export function renderBarChart(chart: BarChart, svg: SVGElement) {
    const bounds = defaultGraphBounds()
    bounds.width = 500

    d3.select(svg).selectAll("g").remove()

    const d3svg = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${bounds.width + 50} ${bounds.height + 50}`)
        .append("g")

    const x = d3
        .scaleBand()
        .domain(d3.map(chart.data, (d) => d.label))
        .range([0, bounds.width])
        .padding(0.2)

    const max = _.maxBy(chart.data, (d) => _.sum(Object.values(d.values)))!
    const maxValue = _.sum(Object.values(max.values))

    const y = d3.scaleLinear().domain([maxValue, 0]).range([0, bounds.height])

    d3svg.append("g").call(d3.axisLeft(y))

    d3svg
        .append("g")
        .attr("transform", `translate(0, ${bounds.height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))

    const stack = d3
        .stack<BarDatum, number>()
        .keys(_.range(0, chart.row_labels.length))
        .value((obj, key) => obj.values[key])(chart.data)

    d3svg
        .append("g")
        .selectAll("g")
        .data(stack)
        .join("g")
        .attr("fill", (d) => chart.row_colours[d.key])
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("x", (d) => x(d.data.label)!)
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())

    return { x, y, svg: d3svg, maxValue }
}

export type ExtraRenderInput = ReturnType<typeof renderBarChart>
