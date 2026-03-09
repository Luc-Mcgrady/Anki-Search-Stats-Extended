<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickDatum, type CandlestickGraph } from "./Candlestick"
    import { limit_area_width, limitArea } from "./bar"
    import { selectableTrendLine } from "./trend"
    import {
        candlestickDisplayLabelFromIndex,
        trendMidpointXFromAxisDatum,
        trendRangeFromAxisDatum,
    } from "./trendAxis"
    import {
        loadPinnedTrendRanges,
        queuePersistPinnedRanges,
        queuePersistStoredPinnedRanges,
    } from "./trendPinnedPersistence"
    import {
        createGraphTrendSessionState,
        type GraphTrendSessionState,
        hiddenPinnedRanges,
        mergeTrendRanges,
        mergeVisibleCustomTrends,
        removeTrendFromAll,
    } from "./trendSession"
    import { i18n } from "./i18n"

    let svg: SVGElement | null = null

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let data: CandlestickGraph
    export let limit = 0
    export let trend = true
    export let trend_data: GraphTrendSessionState["visibleTrends"] = []
    export let current_trend: GraphTrendSessionState["previewTrend"] = undefined
    let trendSession: GraphTrendSessionState = createGraphTrendSessionState()
    let migrated_temporal_store_keys = new Set<string>()
    $: trend_data = trendSession.visibleTrends
    $: current_trend = trendSession.previewTrend

    function handleRemoveTrend(id: number) {
        const selectedTrend = trendSession.visibleTrends.find((trend) => trend.id === id)
        trendSession = {
            ...trendSession,
            allTrends: removeTrendFromAll(trendSession.allTrends, selectedTrend),
            defaultTrendEnabled:
                selectedTrend?.kind === "default" ? false : trendSession.defaultTrendEnabled,
        }
        trendSession.controller?.removeTrend(id)
    }
    function handleTogglePinTrend(id: number) {
        trendSession.controller?.togglePin(id)
    }
    export let removeTrend: (id: number) => void = handleRemoveTrend
    export let togglePinTrend: (id: number) => void = handleTogglePinTrend
    export let trendPersistenceKey: string
    let lastTrendPersistenceKey = ""
    $: if (trendPersistenceKey !== lastTrendPersistenceKey) {
        lastTrendPersistenceKey = trendPersistenceKey
        trendSession = createGraphTrendSessionState()
    }

    $: realOffset = -Math.abs(offset)

    $: leftmost = -(bins * binSize) + realOffset
    $: binSize = binSize > 0 ? binSize : 1
    $: separate_bars = data.data.slice(leftmost, realOffset == 0 ? undefined : realOffset)

    function absoluteDataIndex(index: number) {
        if (index < 0) {
            return data.data.length + index
        }
        return index
    }

    let bars: CandlestickDatum[]
    $: {
        bars = _.range(leftmost, realOffset, binSize).map((i) => {
            const source = data.data[absoluteDataIndex(i)]
            return {
                label: candlestickDisplayLabelFromIndex(i),
                delta: 0,
                trendStart: source ? +source.label : absoluteDataIndex(i),
                trendEnd: source ? +source.label : absoluteDataIndex(i),
            }
        })

        for (const [i, bar] of separate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)
            bars[newIndex].delta += bar.delta || 0
            bars[newIndex].trendEnd = +bar.label
        }
    }

    $: {
        if (svg && data.data.length) {
            const chart = plotCandlestick({ ...data, data: bars, bar_width: binSize }, svg as any)

            limitArea(chart, limit_area_width(chart.x, limit, offset, binSize, 1))

            if (trend) {
                const { initialPinnedRanges, migratedStoredRanges } = loadPinnedTrendRanges(
                    trendPersistenceKey,
                    true
                )
                if (
                    migratedStoredRanges &&
                    !migrated_temporal_store_keys.has(trendPersistenceKey)
                ) {
                    migrated_temporal_store_keys.add(trendPersistenceKey)
                    void queuePersistStoredPinnedRanges(trendPersistenceKey, migratedStoredRanges)
                }

                let total = chart.chart.start
                const trend_points = chart.chart.data.map((datum) => {
                    total += datum.delta
                    const range = trendRangeFromAxisDatum(datum)
                    return {
                        x: trendMidpointXFromAxisDatum(datum),
                        rangeStart: range.startX,
                        rangeEnd: range.endX,
                        y: total,
                    }
                })

                const hoverAreas = chart.svg.selectAll<
                    SVGRectElement,
                    { label: string; trendStart?: number; trendEnd?: number }
                >("rect.hover-bar")
                selectableTrendLine({
                    chart,
                    points: trend_points,
                    hoverAreas,
                    hoverToRange: (datum) => trendRangeFromAxisDatum(datum),
                    xToPixel: (xValue) => {
                        const matchingDatum = chart.chart.data.find((datum) => {
                            const { startX: start, endX: end } = trendRangeFromAxisDatum(datum)
                            return xValue >= Math.min(start, end) && xValue <= Math.max(start, end)
                        })
                        if (!matchingDatum) {
                            return
                        }
                        const x = chart.x(matchingDatum.label)
                        if (x === undefined) {
                            return
                        }
                        return x + chart.x.step() / 2
                    },
                    onTrendsChange: (nextTrends) => {
                        trendSession = {
                            ...trendSession,
                            visibleTrends: nextTrends,
                            allTrends: mergeVisibleCustomTrends(trendSession.allTrends, nextTrends),
                        }
                    },
                    onPreviewTrendChange: (nextTrend) => {
                        trendSession = { ...trendSession, previewTrend: nextTrend }
                    },
                    onControllerReady: (controller) => {
                        trendSession = { ...trendSession, controller }
                        removeTrend = handleRemoveTrend
                        togglePinTrend = handleTogglePinTrend
                    },
                    initialPinnedTrends: initialPinnedRanges,
                    initialTrends: trendSession.allTrends,
                    onPinnedRangesChange: (ranges) => {
                        const mergedRanges = mergeTrendRanges(
                            hiddenPinnedRanges(trendSession.allTrends, trendSession.visibleTrends),
                            ranges
                        )
                        void queuePersistPinnedRanges(trendPersistenceKey, mergedRanges, true)
                    },
                    drawDefaultTrend: trendSession.defaultTrendEnabled,
                })
            } else {
                trendSession = createGraphTrendSessionState()
                removeTrend = handleRemoveTrend
                togglePinTrend = handleTogglePinTrend
            }
        }
    }
</script>

<div class="options">
    <label>
        {i18n("bar-width")}
        <input type="number" bind:value={binSize} />
    </label>
    <label>
        {i18n("scroll")}
        <input type="number" bind:value={offset} step={binSize} />
    </label>
</div>

<svg bind:this={svg}></svg>

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
