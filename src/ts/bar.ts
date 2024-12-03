import * as d3 from "d3"
import _ from "lodash"
import { defaultGraphBounds } from "./graph"
import { tooltip, tooltipShown } from "./stores"
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
    barWidth?: number
    reverse_legend?: boolean

    extraStats?: (data: BarDatum) => string[]
    columnLabeler?: (thing: string, width?: number) => string
}

export function createAxis(
    svg: SVGElement,
    labels: string[],
    max: number,
    min: number,
    tick_spacing: number = 1
) {
    const bounds = defaultGraphBounds()

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

const limit_area_border = 2

export function limitArea(
    chart: ExtraRenderInput,
    width: number,
    height = defaultGraphBounds().height
) {
    const { svg } = chart

    svg.append("rect")
        .attr("x", limit_area_border)
        .attr("y", 0)
        .attr("height", height) // Hide if the limit is 0
        .attr("width", width)
        .attr("fill", "url(#stripe)")
        .style("outline", "red 2px solid")
        .style("outline-offset", `-${limit_area_border}px`)
        .style("cursor", "pointer")
        .on("mouseover", (e: MouseEvent) => {
            tooltipShown.set(true)
            tooltip.set({
                text: [
                    'To calculate this area, select "all history" under the search bar.',
                    "Alternatively, click here.",
                ],
                x: tooltipX(e),
                y: e.pageY,
            })
        })
        .on("mouseleave", () => tooltipShown.set(false))
        .on("click", () => {
            ;(
                document.querySelector(
                    "body > div:nth-child(1) > div.range-box.svelte-19q2rko > div:nth-child(3) > label:nth-child(2) > input[type=radio]"
                )! as HTMLInputElement
            ).click()
            tooltipShown.set(false)
        })
}

export function limit_area_width(
    x: d3.ScaleBand<string>,
    limit: number,
    offset: number,
    binSize: number,
    min: number,
    realOffset?: number
) {
    const absOffset = Math.abs(offset)
    if (realOffset === undefined) {
        realOffset = -absOffset
    }
    const limitBin = Math.ceil((limit + absOffset) / binSize) * binSize + min - absOffset
    return (
        x(limitBin.toString()) ??
        (realOffset < limitBin ? defaultGraphBounds().width - limit_area_border : 0)
    )
}

export function totalCalc(data: BarDatum) {
    return data.values.length > 1 ? [`Total: ${_.sum(data.values)}`] : []
}

export function renderBarChart(chart: BarChart, svg: SVGElement) {
    const max = _.maxBy(chart.data, (d) => _.sum(Object.values(d?.values ?? [])))
    const maxValue = _.sum(Object.values(max?.values ?? []))

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

    const { columnLabeler = barStringLabeler("Index"), extraStats = totalCalc } = chart

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
            const columnString = [columnLabeler(d.data.label, chart.barWidth)]

            tooltipShown.set(true)
            tooltip.set({
                text: [
                    ...columnString,
                    ...d.data.values.map(
                        (v, i) => `${chart.row_labels[i]}: ${parseFloat(v.toFixed(2))}`
                    ),
                    ...extraStats(d.data),
                ],
                x: tooltipX(e),
                y: e.pageY,
            })
        })
        .on("mouseleave", () => tooltipShown.set(false))

    return { x, y, svg: axis, maxValue }
}

export function barDateLabeler(label: string, width: number = 1) {
    return tooltipDate(parseInt(label), width) + ":"
}

export function barStringLabeler(text: string) {
    return (label: string, width: number = 1) => {
        const rightmost = width > 1 ? `-${parseInt(label) + width - 1}` : ""
        return `${text} ${label}${rightmost}:`
    }
}

export type ExtraRenderInput = ReturnType<typeof renderBarChart>
