import * as d3 from "d3"
import * as _ from "lodash"
import { createAxis } from "./bar"
import { defaultGraphBounds } from "./graph"

export type Matrix = {
    grid: Record<number, (number | undefined)[]>
    column_totals?: Record<number, number>
    row_totals?: number[]
}

export function matrix({ grid, column_totals, row_totals }: Matrix, svg: SVGElement) {
    let { width, height } = defaultGraphBounds()

    const rows = Object.entries(grid).sort((a, b) => +b[0] - +a[0])
    const x_groups = _.range(0, 11).map((a) => a.toString())

    // Build X scales and axis:
    const x = d3.scaleBand().range([0, width]).domain(x_groups).padding(0.01)
    const y = d3
        .scaleBand()
        .range([height, 0])
        .domain(rows.map((row) => row[0]))
        .padding(0.01)

    const axis = createAxis(svg, 1, x, y)
    const data = rows.flatMap(([row, cols]) => cols.map((val, col) => ({ row, col, val })))
    console.log({ x_groups, rows, data })

    axis.selectAll("rect")
        .data<{ row: string; col: number; val: number | undefined }>(data)
        .filter(d=>d.val !== undefined)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.col.toString())!)
        .attr("y", (d) => y(d.row.toString())!)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", (d) => (d.val !== undefined ? "steelblue" : "white"))
        .style("stroke", "black")
}
