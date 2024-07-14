import * as d3 from "d3"
import _ from "lodash"
import { defaultGraphBounds } from "./graph"
import { tooltip } from "./stores"
import { tooltipDate, tooltipX } from "./tooltip"

export type BarDatum = {
    values: number[]
    label: string
}

export type BarChart = {
    row_labels: string[]
    row_colours: string[]
    data: BarDatum[]
    tick_spacing?: number
    isDate?: boolean
    barWidth?: number
}

export function createAxis(
    svg: SVGElement,
    labels: string[],
    max: number,
    min: number,
    tick_spacing: number = 1
) {
    const bounds = defaultGraphBounds()
    bounds.width = 500

    d3.select(svg).selectAll("g").remove()

    const axis = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${bounds.width + 50} ${bounds.height + 50}`)
        .append("g")

    const x = d3.scaleBand().domain(labels).range([0, bounds.width]).padding(0.1)

    const y = d3.scaleLinear().domain([max, min]).range([0, bounds.height])

    axis.append("g").call(d3.axisLeft(y)).attr("opacity", 0.5)

    axis.append("g")
        .attr("transform", `translate(0, ${bounds.height})`)
        .attr("opacity", 0.5)
        .call(
            d3.axisBottom(x).tickValues(
                x.domain().filter(function (d, i) {
                    return !(i % tick_spacing)
                })
            )
        )

    return { x, y, axis }
}

export function renderBarChart(chart: BarChart, svg: SVGElement) {
    const max = _.maxBy(chart.data, (d) => _.sum(Object.values(d.values)))!
    const maxValue = _.sum(Object.values(max.values))

    const { axis, x, y } = createAxis(
        svg,
        chart.data.map((datum) => datum.label),
        maxValue,
        0,
        chart.tick_spacing
    )

    const stack = d3
        .stack<BarDatum, number>()
        .keys(_.range(0, chart.row_labels.length))
        .value((obj, key) => obj.values[key])(chart.data)

    axis.append("g")
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
        .on("mouseover", (e, d) => {
            const date = tooltipDate(d.data.label)

            const date2index = parseInt(d.data.label) + (chart.barWidth ?? 1) - 1
            const date2 = tooltipDate(date2index.toString())
            const date2string =
                date2.getUTCDate() == date.getUTCDate() ? "" : `-${date2.toLocaleDateString()}`

            const dateString = chart.isDate
                ? [`Date: ${date.toLocaleDateString()}${date2string}`]
                : []

            tooltip.set({
                shown: true,
                text: [
                    ...dateString,
                    ...d.data.values.map(
                        (v, i) => `${chart.row_labels[i]}: ${parseFloat(v.toFixed(2))}`
                    ),
                ],
                x: tooltipX(e),
                y: e.pageY,
            })
        })

    return { x, y, svg: axis, maxValue }
}

export type ExtraRenderInput = ReturnType<typeof renderBarChart>
