<script lang="ts">
    import _ from "lodash"
    import type { BarChart, BarDatum, ExtraRenderInput } from "./bar"
    import Bar from "./Bar.svelte"
    import { defaultGraphBounds } from "./graph"
    import { tooltip, tooltipShown } from "./stores"
    import { tooltipX } from "./tooltip"

    export let data: BarChart
    export let extraRender = (chart: ExtraRenderInput) => {}

    export let min = 1
    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let average = false
    export let left_aligned = false
    export let limit: number = -1

    $: absOffset = Math.abs(offset)
    $: realOffset = left_aligned ? absOffset - data.data.length + bins * binSize + min : -absOffset
    $: leftmost = -(bins * binSize) + realOffset

    $: binSize = binSize > 0 ? binSize : 1
    $: seperate_bars = data.data.slice(leftmost, realOffset == 0 ? undefined : realOffset)

    function inner_extra_render(chart: ExtraRenderInput) {
        extraRender(chart)

        const { svg, x, y, maxValue } = chart

        const limitBin = Math.ceil((limit + absOffset) / binSize) * binSize + min - absOffset
        const intraBinOffset =
            binSize > 0 ? (((limit + absOffset) % binSize) * x.step()) / binSize : x.step()

        console.log(x(limit.toString()), { limit, x, limitBin, realOffset, absOffset })
        const border = 2

        svg.append("rect")
            .attr("x", x(leftmost.toString()) ?? border)
            .attr("y", 0)
            .attr("height", limit != -1 ? defaultGraphBounds().height - border : 0) // Hide if the limit is 0
            .attr(
                "width",
                (x(limitBin.toString()) ??
                    (realOffset < limitBin ? defaultGraphBounds().width - border : 0) -
                        intraBinOffset) + intraBinOffset
            )
            .attr("fill", "url(#stripe)")
            .style("outline", "red 2px solid")
            .style("outline-offset", `-${border}px`)
            .style("cursor", "pointer")
            .on("mouseover", (e, d) => {
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

    let bars: BarDatum[]
    $: {
        bars = []
        for (const [i, bar] of seperate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            if (!bars[newIndex]?.values) {
                bars[newIndex] = { ...bar, values: bar.values.map((a) => a || 0) }
            } else {
                bars[newIndex].values = bars[newIndex].values.map(
                    (a, i) => a + (bar?.values[i] || 0)
                )
            }
        }
        if (average) {
            bars.map((bar, i) => {
                const count = seperate_bars
                    .slice(i * binSize, (i + 1) * binSize)
                    .reduce((p, n) => p + (_.sum(n.values) > 0 ? 1 : 0), 0)

                bar.values = bar.values.map((a) => a / (count || 1))
            })
        }
    }
</script>

<div class="options">
    <label>
        Bar Width
        <input type="number" bind:value={binSize} />
    </label>
    <label>
        Scroll
        <input type="number" bind:value={offset} step={binSize} />
    </label>
</div>

<Bar data={{ ...data, data: bars, barWidth: binSize }} extraRender={inner_extra_render}></Bar>

<style>
    div.options {
        display: grid;
        grid-template-columns: auto 1fr auto 1fr;
        grid-template-areas: "a a b b";
        gap: 0.5em;
        align-items: baseline;
    }

    label {
        display: contents;
    }

    input {
        min-width: 5em;
    }
</style>
