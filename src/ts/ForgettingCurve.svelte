<script lang="ts">
    import { i18n } from "./i18n"
    import type { ForgettingCurveSeries } from "./forgettingCurveData"
    import {
        RATING_COLOURS,
        renderForgettingCurve,
        type ForgettingCurveRenderOptions,
    } from "./ForgettingCurve"

    export let series: ForgettingCurveSeries[] = []
    export let xLabel: string | null = null
    export let yLabel: string | null = null
    export let formatInterval: (delta: number) => string = (delta) =>
        i18n("forgetting-curve-tooltip-interval", {
            days: delta.toFixed(0),
        })

    let svg: SVGSVGElement | null = null

    const labelForRating = (rating: number) =>
        ({
            1: i18n("again"),
            2: i18n("hard"),
            3: i18n("good"),
            4: i18n("easy"),
        })[rating] ?? rating.toString()

    const formatTooltip: ForgettingCurveRenderOptions["formatTooltip"] = ({
        rating,
        delta,
        recall,
        count,
    }) => [
        i18n("forgetting-curve-tooltip-rating", { rating: labelForRating(rating) }),
        formatInterval(delta),
        i18n("forgetting-curve-tooltip-recall", {
            value: (recall * 100).toFixed(1),
        }),
        i18n("forgetting-curve-tooltip-count", {
            count: count.toLocaleString(),
        }),
    ]

    $: hasData = series?.some((entry) => entry.points.length)

    $: {
        if (svg && hasData) {
            renderForgettingCurve(svg, series, {
                labelForRating,
                formatTooltip,
                xLabel: xLabel ?? i18n("forgetting-curve-x-axis"),
                yLabel: yLabel ?? i18n("forgetting-curve-y-axis"),
            })
        } else if (svg) {
            svg.innerHTML = ""
        }
    }

    const legendLine = (entry: ForgettingCurveSeries) => {
        if (!entry.points.length) {
            return ""
        }
        const stability = entry.stability !== null ? entry.stability.toFixed(2) : "—"
        const countText = i18n("forgetting-curve-legend-count", {
            count: entry.sampleSize.toLocaleString(),
        })

        return i18n("forgetting-curve-legend", {
            rating: labelForRating(entry.rating),
            stability,
            count: countText,
        }).trim()
    }
</script>

{#if hasData}
    <svg bind:this={svg}></svg>
    <div class="legend">
        {#each series as entry (entry.rating)}
            {#if entry.points.length}
                <div class="legend-row">
                    <span
                        class="legend-colour"
                        style:background={RATING_COLOURS[entry.rating] ?? "#888"}
                    ></span>
                    <span>{legendLine(entry)}</span>
                </div>
            {/if}
        {/each}
    </div>
{:else}
    <div class="no-data">{i18n("forgetting-curve-no-data")}</div>
{/if}

<style>
    svg {
        width: 100%;
        height: 100%;
    }

    .legend {
        margin-top: 0.5rem;
        display: grid;
        gap: 0.25rem;
    }

    .legend-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.9rem;
    }

    .legend-colour {
        width: 1rem;
        height: 1rem;
        border-radius: 2px;
        display: inline-block;
        border: 1px solid rgba(0, 0, 0, 0.2);
    }

    .no-data {
        padding: 0.5rem;
        text-align: center;
        opacity: 0.7;
    }

    :global(.axis-label) {
        fill: currentColor;
        font-size: 0.8rem;
        opacity: 0.8;
    }
</style>
