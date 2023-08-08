import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import _ from "lodash"

type BarDatum = {
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

    const y = d3.scaleLinear()
        .domain([0, _.sum(Object.values(max.values))])
        .range([bounds.height, 0])

    d3svg.append("g")
        .call(d3.axisLeft(y))

    d3svg.append("g")
        .attr("transform", `translate(0, ${bounds.height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
    
    d3svg
        .append("g")
        .selectAll("g")
        .data(chart.data)
        .enter().append("g")
        //.attr("fill", (_,i)=>"red")
        .attr("transform", d=>`translate(${x(d.label)}, ${bounds.height})`)
        .selectAll("rect")
        .data(d=>d.values)
        .enter()
        .append("rect")
        .attr("height", d=>y(d))
        .attr("y", d=>-y(d))
        .attr("fill", (_,i)=>chart.row_colours[i])
        .attr("width", x.bandwidth())
}