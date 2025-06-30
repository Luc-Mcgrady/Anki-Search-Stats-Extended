import * as d3 from "d3"
import { defaultGraphBounds } from "./graph"
import { i18n } from "./i18n"
import type { LossBin } from "./MemorisedBar"
import { tooltip, tooltipShown } from "./stores"
import { tooltipX } from "./tooltip"

export function fsrsCalibrationGraph(svg: SVGElement, bins: LossBin[]) {
    const { width, height } = defaultGraphBounds()

    interface CalibrationBinData {
        bin: LossBin
        index: number
    }

    const x = d3.scaleLinear().domain([0, 1]).range([0, width])
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0])

    function binWidth(i: number) {
        const L = Math.log(bins.length + 1)
        const pLow = Math.log(i + 1) / L
        const pHigh = Math.log(i + 2) / L
        return [x(pLow), x(pHigh)] as [number, number]
    }

    const max_bin = d3.max(bins.map((d) => d.count)) ?? 0

    const count_y = d3.scaleLinear().domain([0, max_bin]).range([height, 0])

    const axis = d3
        .select(svg)
        .attr("viewBox", `-40 -10 ${width + 50 + Math.log(max_bin) * 10} ${height + 50}`)
        .append("g")

    axis.append("g").call(d3.axisLeft(y)).attr("opacity", 0.5)
    axis.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .attr("opacity", 0.5)
        .call(d3.axisRight(count_y))

    axis.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("opacity", 0.5)
        .call(d3.axisBottom(x).ticks(7))

    let data = bins.map(
        (d, i) =>
            // Converted to proportions
            <CalibrationBinData>{
                bin: { real: d.real / d.count, predicted: d.predicted / d.count, count: d.count },
                index: i,
            }
    )

    axis.append("g")
        .selectAll("g")
        .data(data.filter((d) => d))
        .join("rect")
        .attr("fill", "blue")
        .attr("opacity", 0.5)
        .attr("height", (d) => height - count_y(d.bin.count))
        .attr("width", (d) => binWidth(d.index)[1] - binWidth(d.index)[0])
        .attr("x", (d) => binWidth(d.index)[0])
        .attr("y", (d) => count_y(d.bin.count))

    const diagonalData = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
    ]

    d3.select(svg)
        .append("path")
        .datum(diagonalData)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none")
        .attr(
            "d",
            d3
                .line<{ x: number; y: number }>()
                .x((d) => x(d.x))
                .y((d) => y(d.y))
        )

    d3.select(svg)
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .style("pointer-events", "none")
        .attr(
            "d",
            d3
                .line<CalibrationBinData>()
                .defined((d) => !!d)
                .x((d) => x(d.bin.predicted))
                .y((d) => y(d.bin.real))
        )

    axis.append("g")
        .selectAll("g")
        .data(data.filter((a) => a))
        .join("rect")
        .attr("class", "hover-bar")
        .attr("height", height)
        .attr("width", (d) => binWidth(d.index)[1] - binWidth(d.index)[0])
        .attr("x", (d) => binWidth(d.index)[0])
        .attr("y", 0)
        .on("mouseover", (e: MouseEvent, d) => {
            const value_string = (d.bin.real * 100).toPrecision(5)
            tooltip.set({
                x: tooltipX(e),
                y: e.pageY,
                // Todo: i18n
                text: [
                    `${i18n("predicted")} ${(d.bin.predicted * 100).toFixed(0)}%:`,
                    `${i18n("actual")}: ${value_string}%`,
                    `${i18n("count")}: ${d.bin.count}`,
                ],
            })
        })

    axis.on("mouseover", () => tooltipShown.set(true)).on("mouseleave", () =>
        tooltipShown.set(false)
    )
}
