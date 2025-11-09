<script lang="ts">
    import { i18n } from "./i18n"
    import {
        buildForgettingCurve,
        type ForgettingCurveSeries,
        type ForgettingSample,
    } from "./forgettingCurveData"
    import {
        RATING_COLOURS,
        renderForgettingCurve,
        type ForgettingCurveRenderOptions,
    } from "./ForgettingCurve"

    export let data: ForgettingSample[] = []
    export let xLabel: string | null = null
    export let yLabel: string | null = null
    export let isShortTerm: boolean = false
    export let formatInterval: (delta: number) => string = (delta) =>
        i18n("forgetting-curve-tooltip-interval", {
            days: delta.toFixed(0),
        })

    let svg: SVGSVGElement | null = null
    let xAxisMax: number = -1 // Use -1 as uninitialized marker
    let maxBins: number = 20
    let outlierFiltering = false
    let dataMinDelta: number = 1
    let dataMaxDelta: number = 1
    let series: ForgettingCurveSeries[] = []

    // Process data into series for each rating
    $: {
        if (isShortTerm) {
            series = buildForgettingCurve(data, {
                deltaLimitByRating: (_rating: number) => 720,
                minStability: 1e-6,
                maxStability: 1440,
                disableOutlierFiltering: true,
                adaptiveBinning: {
                    enabled: true,
                    maxBins: maxBins,
                    minSamplesPerBin: 1,
                },
            })
        } else {
            series = buildForgettingCurve(data, {
                disableOutlierFiltering: !outlierFiltering,
                adaptiveBinning: {
                    enabled: true,
                    maxBins: maxBins,
                    minSamplesPerBin: 1,
                },
            })
        }
    }

    // Calculate the minimum and maximum delta from actual data points only
    $: {
        let minDelta = Infinity
        let maxDelta = 0

        for (const entry of series) {
            // Only use actual data points, not predicted curve
            for (const point of entry.points) {
                minDelta = Math.min(minDelta, point.delta)
                maxDelta = Math.max(maxDelta, point.delta)
            }
        }

        // Ensure we have valid values
        if (minDelta === Infinity) minDelta = isShortTerm ? 0.1 : 1
        if (maxDelta === 0) maxDelta = isShortTerm ? 10 : 30

        dataMinDelta = minDelta
        dataMaxDelta = maxDelta
    }

    // Initialize xAxisMax to dataMaxDelta when first loaded
    $: if (xAxisMax < 0 && dataMaxDelta > dataMinDelta) {
        xAxisMax = dataMaxDelta
    }

    // Clamp xAxisMax to valid range
    $: if (xAxisMax >= 0) {
        if (xAxisMax < dataMinDelta) {
            xAxisMax = dataMinDelta
        } else if (xAxisMax > dataMaxDelta) {
            xAxisMax = dataMaxDelta
        }
    }

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
        if (svg && hasData && xAxisMax >= 0) {
            renderForgettingCurve(svg, series, {
                labelForRating,
                formatTooltip,
                xLabel: xLabel ?? i18n("forgetting-curve-x-axis"),
                yLabel: yLabel ?? i18n("forgetting-curve-y-axis"),
                maxX: xAxisMax,
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

        const legendKey = isShortTerm
            ? "forgetting-curve-legend-short-term"
            : "forgetting-curve-legend"
        return i18n(legendKey, {
            rating: labelForRating(entry.rating),
            stability,
            count: countText,
        }).trim()
    }
</script>

{#if hasData}
    <svg bind:this={svg}></svg>
    {#if !isShortTerm}
        <label>
            <span>
                {i18n("forgetting-curve-outlier-filtering")}:
            </span>
            <input type="checkbox" bind:checked={outlierFiltering} />
        </label>
    {/if}
    <div class="control-grid">
        <label>
            <span>
                {isShortTerm
                    ? i18n("forgetting-curve-x-axis-minutes")
                    : i18n("forgetting-curve-x-axis")}:
            </span>
            <span class="range-container">
                {dataMinDelta.toFixed(isShortTerm ? 1 : 0)}
                <input
                    type="range"
                    min={dataMinDelta}
                    max={dataMaxDelta}
                    step={isShortTerm ? "0.1" : "1"}
                    bind:value={xAxisMax}
                />
                {(xAxisMax >= 0 ? xAxisMax : dataMaxDelta).toFixed(isShortTerm ? 1 : 0)}
                {isShortTerm ? "min" : "d"}
            </span>
        </label>
        <label>
            <span>
                {i18n("forgetting-curve-bins-selector")}:
            </span>
            <span class="range-container">
                {1}
                <input type="range" min={1} max={50} step={1} bind:value={maxBins} />
                {i18n("forgetting-curve-bin-count", { count: maxBins })}
            </span>
        </label>
    </div>
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

    .control-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 0.5em 1em;
        align-items: baseline;
        width: 100%;
        margin-top: 0.5rem;
    }

    .range-container {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.5em 1em;
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
