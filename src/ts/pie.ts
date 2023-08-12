import type { PieArcDatum } from "d3"
import * as d3 from "d3"

export type PieDatum = {
    label: string
    value: number
    colour: string
}

export function PieDatumFactory(start: any, end: any, value: number, colour: string) {
    return {
        label: start!=end?`${start}-${end}`:`${start}`,
        value: value,
        colour: colour
    }
}

export function renderPie(data: PieDatum[], svg: SVGElement, radius: number) {
    const pie = d3.pie<any, PieDatum>()
        .value(d=>d.value)
        .sort(null)

    const data_ready = pie(data)

    d3.select(svg)
        .selectAll("slices")
        .data(data_ready)
        .enter()
        .append("path")
        .attr('d', d3.arc<PieArcDatum<PieDatum>>()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', d=>d.data.colour)
}