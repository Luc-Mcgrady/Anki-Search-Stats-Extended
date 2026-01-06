import type { Pattern } from "@fluent/bundle/esm/ast"
import * as d3 from "d3"
import _ from "lodash"
import { totalCalc } from "./barHelpers"
import type { CandlestickGraph } from "./Candlestick"
import { defaultGraphBounds } from "./graph"
import { i18n_bundle } from "./i18n"
import { tooltip, tooltipShown } from "./stores"
import { tooltipDate, tooltipX } from "./tooltip"

export type BarDatum = {
    values: number[]
    label: string
    onClick?: () => void
}

export type LossBar = [number, number] // [MSE, Count]

export type BarChart = {
    row_labels: string[]
    row_colours: string[]
    data: BarDatum[]
    tick_spacing?: number
    barWidth?: number
    reverse_legend?: boolean
    column_counts?: boolean
    precision?: number
    inverseFade?: boolean

    extraStats?: (data: BarDatum) => string[]
    columnLabeler?: (thing: string, width?: number) => string
}

const { width, height } = defaultGraphBounds()

export function defaultX(labels: string[]) {
    return d3
        .scaleBand()
        .domain(labels)
        .range([0, width])
        .padding(0.1) as d3.ScaleBand<d3.AxisDomain>
}

export function defaultY(min: number, max: number) {
    return d3.scaleLinear().domain([max, min]).range([0, height])
}

export function createAxis(
    svg: SVGElement,
    tick_spacing: number = 1,
    x: d3.AxisScale<any>,
    y: d3.AxisScale<any>,
    bounds = defaultGraphBounds()
) {
    d3.select(svg).selectAll("g").remove()

    const axis = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${bounds.width + 50} ${bounds.height + 50}`)
        .append("g")

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

    return axis
}

const limit_area_border = 2

export function SetDateInfinite() {
    ;(
        document.querySelector(
            "body > div:nth-child(1) > div > div:nth-child(3) > label:nth-child(2)"
        )! as HTMLInputElement
    ).click()
}

export function limitArea(
    chart: ExtraRenderInput<unknown>,
    width: number,
    height = defaultGraphBounds().height
) {
    // I might get around to passing just the SVG at some point, for now idc
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
        .style("display", width <= 0 ? "none" : "default")
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
            SetDateInfinite()
            tooltipShown.set(false)
        })
}

export function limit_area_width(
    x: d3.ScaleBand<d3.AxisDomain>,
    limit: number,
    offset: number,
    binSize: number,
    min: number,
    realOffset?: number
) {
    if (limit === -1) {
        return 0
    }
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

export function hoverBars<T extends { label: string }>(
    axis: ReturnType<typeof createAxis>,
    x: d3.AxisScale<d3.AxisDomain>,
    data: T[]
) {
    const { height } = defaultGraphBounds()
    return axis
        .append("g")
        .selectAll("g")
        .data(data)
        .join("rect")
        .attr("class", "hover-bar")
        .attr("height", height)
        .attr("width", x.bandwidth!())
        .attr("x", (d) => x(d.label)!)
        .attr("y", 0)
}

export function renderBarChart(chart: BarChart, svg: SVGElement) {
    const max = _.maxBy(chart.data, (d) => _.sum(Object.values(d?.values ?? [])))
    let maxValue = _.sum(Object.values(max?.values ?? []))

    if (!Number.isFinite(maxValue) || maxValue < 0) {
        console.warn("Invalid maxValue detected in bar chart:", {
            maxValue,
            maxDatum: max,
            chartRowLabels: chart.row_labels,
        })
        maxValue = 0
    }

    const x = defaultX(chart.data.map((datum) => datum.label))
    const y = defaultY(0, maxValue)
    const axis = createAxis(svg, chart.tick_spacing, x, y)

    const stack = d3
        .stack<BarDatum, number>()
        .keys(_.range(0, chart.row_labels.length))
        .value((obj, key) => obj.values[key])(chart.data)

    const {
        columnLabeler = (a) => `"${a}"`,
        extraStats = totalCalc,
        column_counts = true,
        precision = 2,
    } = chart

    const colourDegree = 0.1
    axis.append("g")
        .selectAll("g")
        .data(stack)
        .join("g")
        .selectAll("rect")
        .data((d, i) =>
            d.map((p, i2) => {
                const fade = (colourDegree * i2) / d.length
                return {
                    ...p,
                    color: d3.interpolateRgbBasis(["white", chart.row_colours[i]])(
                        chart.inverseFade ? 1 - fade : fade + (1 - colourDegree)
                    ),
                }
            })
        )
        .join("rect")
        .attr("fill", (d, i) => d.color)
        .attr("x", (d) => x(d.data.label)!)
        .attr("y", (d) => y(d[1]))
        .attr("height", (d) => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())

    hoverBars(axis, x, chart.data)
        .on("mouseover", function (e: MouseEvent, d) {
            const columnString = columnLabeler(d.label, chart.barWidth)
            const columnCounts = column_counts
                ? d.values.map(
                      (v, i) => `${chart.row_labels[i]}: ${parseFloat(v.toFixed(precision))}`
                  )
                : []

            tooltipShown.set(true)
            tooltip.set({
                text: [columnString, ...columnCounts, ...extraStats(d)],
                x: tooltipX(e),
                y: e.pageY,
            })
        })
        .on("mouseleave", () => tooltipShown.set(false))
        .on("click", (_, d) => {
            if (d.onClick) {
                d.onClick()
            }
        })
        .style("cursor", (d) => (d.onClick ? "pointer" : "default"))

    return { x, y, svg: axis, maxValue, chart }
}

export function barDateLabeler(label: string, width: number = 1) {
    return tooltipDate(+label, width) + ":"
}

export function barHourLabeler(hour: string) {
    return `${hour.padStart(2, "0")}:00`
}

export function barStringLabeler(pattern: Pattern) {
    return (label: string, width: number = 1) => {
        const rightmost = width > 1 ? `-${_.round(+label + width - 1, 2)}` : ""
        const value = `${label}${rightmost}`
        return i18n_bundle.formatPattern(pattern, { value })
    }
}

export function rangeBarStringLabeler(pattern: Pattern, x: string) {
    return (label: string, width: number = 1) => {
        const rightmost = width > 1 ? `-${+label + width - 1}` : ""
        const value = `${label}${rightmost}`
        return i18n_bundle.formatPattern(pattern, { range: value, x })
    }
}

export type ExtraRenderInput<T = BarChart | CandlestickGraph> = {
    x: d3.ScaleBand<d3.AxisDomain>
    y: d3.ScaleLinear<number, number, never>
    svg: d3.Selection<SVGGElement, unknown, null, undefined>
    maxValue: number
    chart: T
}
