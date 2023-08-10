import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import _ from "lodash"

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

    const d3svg = d3.select(svg)
        .attr("height", bounds.height + 50)
        .attr("width", bounds.width)
        .append("g")
        .attr("transform", `translate(50, 10)`)
    
    const x = d3.scaleBand()
        .domain(d3.map(chart.data, d=>d.label))
        .range([0,bounds.width])
        .padding(0.2)

    const max = _.maxBy(chart.data, d=>_.sum(Object.values(d.values)))!
    const maxval = _.sum(Object.values(max.values))

    const columns = _.range(0, maxval)

    const y = d3.scaleLinear()
        .domain([maxval, 0])
        .range([0, bounds.height])

    d3svg.append("g")
        .call(d3.axisLeft(y))

    d3svg.append("g")
        .attr("transform", `translate(0, ${bounds.height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))

    const stack = d3.stack<BarDatum, number>()
        .keys(_.range(0, chart.row_labels.length))
        .value((obj, key)=>obj.values[key])
        (chart.data)

    d3svg
        .append("g")
        .selectAll("g")
        .data(stack)
        .join("g")
            .attr("fill", d=>chart.row_colours[d.key])
            .selectAll("rect")
            .data(d=>d)
            .join("rect")
                .attr("x", d=>x(d.data.label)!)
                .attr("y", d=>y(d[1]))
                .attr("height", d=>y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth())
}