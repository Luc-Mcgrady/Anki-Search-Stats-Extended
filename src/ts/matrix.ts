import * as d3 from "d3"
import * as _ from "lodash"
import { createAxis } from "./bar"
import { defaultGraphBounds } from "./graph"
import { tooltip, tooltipShown } from "./stores"
import { tooltipX } from "./tooltip"

export type Matrix = {
    grid: Record<number, (number | undefined)[]>
    hoverTooltip: (x: number, y: number) => string[]
}

export function matrix({ grid, hoverTooltip }: Matrix, svg: SVGElement) {
    let bounds = defaultGraphBounds()

    const rows = Object.entries(grid).sort((a, b) => +b[0] - +a[0])
    // Hard coded for now
    const x_groups = _.range(1, 11).map((a) => a.toString())

    const box_size = bounds.width / 10
    bounds.height = rows.length * box_size
    // Build X scales and axis:
    const x = d3.scaleBand().range([0, bounds.width]).domain(x_groups).padding(0.01)
    const y = d3
        .scaleBand()
        .range([bounds.height, 0])
        .domain(rows.map((row) => row[0]))
        .padding(0.01)

    const axis = createAxis(svg, 1, x, y, bounds)

    interface Datum {
        row: string
        col: number
        val: number | undefined
    }
    const data: Datum[] = rows
        .flatMap(([row, cols]) => cols.map((val, col) => ({ row, col, val })))
        .filter((d) => d.val !== undefined)

    const color = d3
        .scaleLinear<string>()
        // Hard coded range
        .domain([-0.2, 0, 0.2])
        .interpolate(d3.interpolateRgb)
        .range(["red", "white", "blue"])

    const margin = 3

    function onHover(e: MouseEvent, d: Datum) {
        tooltip.set({
            x: tooltipX(e),
            y: e.pageY,
            text: hoverTooltip(+d.row, d.col),
        })
        tooltipShown.set(true)
    }

    axis.append("g")
        .selectAll("rect")
        .data<Datum>(data)
        .enter()
        .append("rect")
        .attr("xr", margin)
        .attr("yr", margin)
        .attr("x", (d) => x(d.col.toString())! + margin)
        .attr("y", (d) => y(d.row.toString())! + margin)
        .attr("width", x.bandwidth() - margin * 2)
        .attr("height", y.bandwidth() - margin * 2)
        .style("fill", (d) => (d.val !== undefined ? color(d.val) : "purple"))
        .style("stroke", "black")
        .on("mouseover", onHover)
        .on("mouseleave", () => tooltipShown.set(false))

    axis.append("g")
        .selectAll("text")
        .data<{ row: string; col: number; val: number | undefined }>(data)
        .join("text")
        .attr("x", (d) => x(d.col.toString())! + x.bandwidth() / 2)
        .attr("y", (d) => y(d.row.toString())! + y.bandwidth() / 2)
        .attr("dy", "0.35em") // Vertical alignment
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "12px")
        .text((d) => (d.val !== undefined ? `${(d.val * 100).toFixed(1)}%` : ""))
        .on("mouseover", onHover)
    // Trusting that the mouse will not leave the box quick enough to not trigger the rect "mouse leave"
}
