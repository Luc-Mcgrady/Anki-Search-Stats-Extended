import type { Pattern } from "@fluent/bundle/esm/ast"
import * as d3 from "d3"
import _ from "lodash"
import createTrend from "trendline"
import type { ExtraRenderInput } from "./bar"

export type TrendInfo = Partial<{
    pattern: Pattern
    percentage: boolean
    absolute: boolean
}>

export type TrendModel = ReturnType<typeof createTrend>
export type TrendLine = TrendModel | undefined
export type TrendDatum = {
    x: number
    y: number
}

export type DrawnTrend = {
    id: number
    colour: string
    trend: TrendModel
}

type TrendRange = {
    startX: number
    endX: number
}

type TrendClickTransition = {
    nextAnchorX: number | undefined
    range?: TrendRange
}

type TrendSelectionOptions<T> = {
    chart: Pick<ExtraRenderInput<unknown>, "svg" | "y">
    points: TrendDatum[]
    hoverAreas: d3.Selection<SVGRectElement, T, SVGGElement, unknown>
    hoverToX: (datum: T) => number
    xToPixel: (x: number) => number | undefined
    onTrendsChange?: (trends: DrawnTrend[]) => void
    onPreviewTrendChange?: (trend: TrendLine) => void
    onRemoveReady?: (removeTrend: (id: number) => void) => void
    drawDefaultTrend?: boolean
}

export type TrendSelectionController = {
    removeTrend: (id: number) => void
    clear: () => void
}

const trendColours = ["#e63946", "#1d3557", "#2a9d8f", "#f4a261", "#6a4c93", "#457b9d"]
const trendColoursNight = ["#ff9aa2", "#a9def9", "#b8f2e6", "#ffd6a5", "#d0bfff", "#bde0fe"]

function isValidTrendDatum(datum: TrendDatum) {
    return Number.isFinite(datum.x) && Number.isFinite(datum.y) && !!datum.y
}

export function filteredTrendData(data: TrendDatum[]) {
    return data.filter(isValidTrendDatum)
}

export function trendDataInRange(data: TrendDatum[], startX: number, endX: number) {
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    return data.filter((datum) => datum.x >= minX && datum.x <= maxX)
}

export function createTrendFromData(data: TrendDatum[]) {
    const valid = filteredTrendData(data)
    if (valid.length < 2) {
        return
    }
    return createTrend(valid, "x", "y")
}

export function nextTrendClickTransition(
    anchorX: number | undefined,
    clickedX: number
): TrendClickTransition {
    if (anchorX === undefined) {
        return { nextAnchorX: clickedX }
    }
    return { nextAnchorX: undefined, range: { startX: anchorX, endX: clickedX } }
}

export function trendColour(index: number) {
    const inNightMode =
        typeof document !== "undefined" &&
        document.documentElement?.classList.contains("night-mode")
    const palette = inNightMode ? trendColoursNight : trendColours
    return palette[index % palette.length]
}

export function removeTrendById(trends: DrawnTrend[], id: number) {
    return trends.filter((trend) => trend.id !== id)
}

function trendEndPoints(data: TrendDatum[]) {
    const leftmost = _.minBy(data, (datum) => datum.x)
    const rightmost = _.maxBy(data, (datum) => datum.x)
    if (!leftmost || !rightmost) {
        return
    }
    return { leftmost, rightmost }
}

function drawTrendLine(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    y: (value: number) => number,
    trend: TrendModel,
    startX: number,
    endX: number,
    x1: number,
    x2: number,
    colour = trendColour(0),
    className = "sse-trend-line",
    trendId?: number,
    lineDash?: string
) {
    const line = svg
        .append("line")
        .attr("class", className)
        .attr("x1", x1)
        .attr("y1", y(trend.calcY(startX)))
        .attr("x2", x2)
        .attr("y2", y(trend.calcY(endX)))
        .style("stroke", colour)
        .style("stroke-width", 1.5)
    if (trendId !== undefined) {
        line.attr("data-trend-id", trendId)
    }
    if (lineDash) {
        line.style("stroke-dasharray", lineDash)
    }
}

export function selectableTrendLine<T>({
    chart,
    points,
    hoverAreas,
    hoverToX,
    xToPixel,
    onTrendsChange = () => {},
    onPreviewTrendChange = () => {},
    onRemoveReady = () => {},
    drawDefaultTrend = false,
}: TrendSelectionOptions<T>): TrendSelectionController {
    let removeTrend = (_id: number) => {}
    let clear = () => {}

    if (!SSEconfig.trends) {
        onTrendsChange([])
        onPreviewTrendChange(undefined)
        onRemoveReady(removeTrend)
        return { removeTrend, clear }
    }

    points = filteredTrendData(points)
    let trends: DrawnTrend[] = []
    let nextId = 1
    let anchorX: number | undefined = undefined

    function emitTrends() {
        onTrendsChange([...trends])
    }
    function clearPreview() {
        chart.svg.selectAll("line.sse-trend-line-preview").remove()
        onPreviewTrendChange(undefined)
    }

    function applyTrendForRange(startX: number, endX: number) {
        const rangePoints = trendDataInRange(points, startX, endX)
        const trend = createTrendFromData(rangePoints)
        if (!trend) {
            return
        }

        const x1 = xToPixel(startX)
        const x2 = xToPixel(endX)
        if (x1 === undefined || x2 === undefined) {
            return
        }
        return { trend, startX, endX, x1, x2 }
    }

    function drawPersistentTrend(startX: number, endX: number, colour: string) {
        const trendData = applyTrendForRange(startX, endX)
        if (!trendData) {
            return
        }
        const id = nextId++
        drawTrendLine(
            chart.svg,
            chart.y,
            trendData.trend,
            trendData.startX,
            trendData.endX,
            trendData.x1,
            trendData.x2,
            colour,
            "sse-trend-line sse-trend-line-persistent",
            id
        )
        trends = [
            ...trends,
            {
                id,
                colour,
                trend: trendData.trend,
            },
        ]
        emitTrends()
        clearPreview()
    }

    function drawPreviewTrend(startX: number, endX: number) {
        const trendData = applyTrendForRange(startX, endX)
        if (!trendData) {
            clearPreview()
            return
        }
        const previewColour = trendColour(trends.length)
        chart.svg.selectAll("line.sse-trend-line-preview").remove()
        drawTrendLine(
            chart.svg,
            chart.y,
            trendData.trend,
            trendData.startX,
            trendData.endX,
            trendData.x1,
            trendData.x2,
            previewColour,
            "sse-trend-line-preview",
            undefined,
            "4 2"
        )
        onPreviewTrendChange(trendData.trend)
    }

    removeTrend = (id: number) => {
        trends = removeTrendById(trends, id)
        chart.svg.selectAll(`line.sse-trend-line-persistent[data-trend-id="${id}"]`).remove()
        emitTrends()
    }

    clear = () => {
        trends = []
        chart.svg.selectAll("line.sse-trend-line-persistent").remove()
        clearPreview()
        emitTrends()
    }

    onRemoveReady(removeTrend)
    emitTrends()
    clearPreview()

    if (drawDefaultTrend) {
        const endPoints = trendEndPoints(points)
        if (endPoints) {
            drawPersistentTrend(
                endPoints.leftmost.x,
                endPoints.rightmost.x,
                trendColour(trends.length)
            )
        }
    }

    hoverAreas
        .on("mousemove.trend", (_, datum) => {
            if (anchorX === undefined) {
                return
            }
            drawPreviewTrend(anchorX, hoverToX(datum))
        })
        .on("click.trend", (_, datum) => {
            const x = hoverToX(datum)
            const transition = nextTrendClickTransition(anchorX, x)
            anchorX = transition.nextAnchorX
            if (!transition.range) {
                clearPreview()
                return
            }
            drawPersistentTrend(
                transition.range.startX,
                transition.range.endX,
                trendColour(trends.length)
            )
        })

    return { removeTrend, clear }
}

export function trendLine({ svg, x, y }: ExtraRenderInput<unknown>, data: TrendDatum[]) {
    if (!SSEconfig.trends) {
        return
    }

    const validData = filteredTrendData(data)
    const trend = createTrendFromData(validData)
    if (!trend) {
        return
    }

    const endPoints = trendEndPoints(validData)
    if (!endPoints) {
        return
    }

    const half_step = x.step() / 2
    const x1 = x(endPoints.leftmost.x.toString())
    const x2 = x(endPoints.rightmost.x.toString())

    if (x1 === undefined || x2 === undefined) {
        return trend
    }

    svg.selectAll("line.sse-trend-line").remove()
    drawTrendLine(
        svg,
        y,
        trend,
        endPoints.leftmost.x,
        endPoints.rightmost.x,
        x1 + half_step,
        x2 + half_step
    )

    return trend
}
