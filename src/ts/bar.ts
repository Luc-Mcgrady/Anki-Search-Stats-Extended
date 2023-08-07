import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import _ from "lodash"

type BarDatum = {
    values: Record<string, number>
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

    const d3svg = d3.select(svg)
        .attr("height", bounds.height)
        .attr("width", bounds.width)
        .append("g")
        .attr("transform", `translate(50, -20)`)
    
    const x = d3.scaleBand()
        .domain(d3.map(chart.data, d=>d.label))
        .range([0,bounds.width])
        .padding(0.2)

    const max = _.maxBy(chart.data, d=>_.sum(Object.values(d.values)))!

    const y = d3.scaleLinear()
        .domain([0, _.sum(Object.values(max.values))])
        .range([bounds.height, 0])

    d3svg.append("g")
        .call(d3.axisLeft(y))

    d3svg.append("g")
        .attr("transform", `translate(0, ${bounds.height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))

    const stack = d3.stack<BarDatum>()
        .keys(chart.row_labels)
        (chart.data)
    
    d3svg
    .data(stack)
    .enter()
    .append("g")
    .selectAll("rect")
    .data(d=>d).append("rect")
    .attr("fill", (_,i)=>chart.row_colours[i])
    .attr("x", d=>x(d.data.label)!)
    .attr("y", d=>y(d[1]))
    .attr("height", d=>y(d[0])- y(d[1]))
    .attr("width", x.bandwidth())
        
}