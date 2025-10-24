import * as d3 from "d3"
import type { ForgettingCurveSeries } from "./forgettingCurveData"
import { defaultGraphBounds } from "./graph"
import { tooltip, tooltipShown } from "./stores"
import { tooltipX } from "./tooltip"

export const RATING_COLOURS: Record<number, string> = {
    1: "#a50026",
    2: "#fdbe70",
    3: "#b6e076",
    4: "#006837",
}

interface TooltipPayload {
    rating: number
    delta: number
    recall: number
    count: number
}

export interface ForgettingCurveRenderOptions {
    labelForRating: (rating: number) => string
    formatTooltip: (payload: TooltipPayload) => string[]
    xLabel: string
    yLabel: string
}

export function renderForgettingCurve(
    svg: SVGSVGElement,
    rawSeries: ForgettingCurveSeries[],
    options: ForgettingCurveRenderOptions
) {
    const series = rawSeries.filter((s) => s.points.length)
    const root = d3.select(svg)
    root.selectAll("*").remove()

    if (!series.length) {
        return
    }

    const { width, height } = defaultGraphBounds()
    const margin = { top: 10, right: 20, bottom: 48, left: 58 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const deltaValues: number[] = []
    for (const entry of series) {
        entry.points.forEach((point) => deltaValues.push(point.delta))
        entry.predicted.forEach((prediction) => deltaValues.push(prediction.delta))
    }
    const maxDelta = deltaValues.length ? d3.max(deltaValues)! : 1

    const x = d3.scaleLinear().domain([0, maxDelta]).range([0, innerWidth]).nice()
    const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]).nice()

    const maxCount = d3.max(series, (s) => d3.max(s.points, (p) => p.count)) ?? 1
    const radius = d3.scaleSqrt().domain([1, maxCount]).range([3, 12])

    const container = root
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    container
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).ticks(6))

    container.append("g").call(d3.axisLeft(y).ticks(5))

    container
        .append("text")
        .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 36})`)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text(options.xLabel)

    container
        .append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", -innerHeight / 2)
        .attr("y", -margin.left + 14)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text(options.yLabel)

    const line = d3
        .line<{ delta: number; recall: number }>()
        .x((d) => x(d.delta))
        .y((d) => y(d.recall))

    for (const seriesEntry of series) {
        const colour = RATING_COLOURS[seriesEntry.rating] ?? "#888"

        container
            .append("path")
            .datum(seriesEntry.predicted)
            .attr("fill", "none")
            .attr("stroke", colour)
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.9)
            .style("pointer-events", "none")
            .attr("d", line)

        container
            .append("g")
            .selectAll("circle")
            .data(seriesEntry.points)
            .join("circle")
            .attr("cx", (point) => x(point.delta))
            .attr("cy", (point) => y(point.recall))
            .attr("r", (point) => radius(point.count))
            .attr("fill", colour)
            .attr("fill-opacity", 0.6)
            .attr("stroke", colour)
            .attr("stroke-width", 1)
            .on("mouseover", (event: MouseEvent, point) => {
                tooltip.set({
                    x: tooltipX(event),
                    y: event.pageY,
                    text: options.formatTooltip({
                        rating: seriesEntry.rating,
                        delta: point.delta,
                        recall: point.recall,
                        count: point.count,
                    }),
                })
            })
    }

    container
        .on("mouseover", () => tooltipShown.set(true))
        .on("mouseleave", () => {
            tooltipShown.set(false)
        })
}
