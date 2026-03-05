<script lang="ts">
    import _ from "lodash"
    import { plotCandlestick, type CandlestickDatum, type CandlestickGraph } from "./Candlestick"
    import { limit_area_width, limitArea } from "./bar"
    import {
        selectableTrendLine,
        pinnedTrendsForKey,
        type DrawnTrend,
        type InitialTrend,
        type TrendLine,
        type TrendRange,
        type TrendSelectionController,
        upsertPinnedTrends,
    } from "./trend"
    import { needsStoredRangeMigration, parseStoredRanges, toStoredRange } from "./trendPersistence"
    import {
        hiddenPinnedRanges,
        mergeTrendRanges,
        mergeVisibleCustomTrends,
        removeTrendFromAll,
    } from "./trendSession"
    import { i18n } from "./i18n"
    import { saveConfigValue } from "./search"

    let svg: SVGElement | null = null

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let data: CandlestickGraph
    export let limit = 0
    export let trend = true
    export let trend_data: DrawnTrend[] = []
    export let current_trend: TrendLine = undefined
    let trend_controller: TrendSelectionController | undefined = undefined
    let default_trend_enabled = true
    let all_trends: InitialTrend[] = []
    let migrated_temporal_store_keys = new Set<string>()

    function handleRemoveTrend(id: number) {
        const selectedTrend = trend_data.find((trend) => trend.id === id)
        all_trends = removeTrendFromAll(all_trends, selectedTrend)
        if (selectedTrend?.kind === "default") {
            default_trend_enabled = false
        }
        trend_controller?.removeTrend(id)
    }
    function handleTogglePinTrend(id: number) {
        trend_controller?.togglePin(id)
    }
    export let removeTrend: (id: number) => void = handleRemoveTrend
    export let togglePinTrend: (id: number) => void = handleTogglePinTrend
    export let trend_store_key = ""
    let last_trend_store_key = ""
    $: if (trend_store_key !== last_trend_store_key) {
        last_trend_store_key = trend_store_key
        default_trend_enabled = true
        all_trends = []
        trend_data = []
        current_trend = undefined
    }

    async function savePinnedTrends(ranges: TrendRange[]) {
        if (!trend_store_key) {
            return
        }
        const rangesToPersist = ranges.map((range) => toStoredRange(range, true))
        await saveConfigValue("pinnedTrends", upsertPinnedTrends(trend_store_key, rangesToPersist))
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
                label: (i + 1).toString(), // I have no idea if +1 is right but at least its consistent with the other graphs
                delta: 0,
                trendKey: source ? +source.label : absoluteDataIndex(i),
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
                const storedPinnedRanges = pinnedTrendsForKey(trend_store_key)
                const parsedPinnedRanges = parseStoredRanges(storedPinnedRanges, true)
                const initialPinnedRanges = parsedPinnedRanges.map((range) => range.normalized)
                const needsMigration = needsStoredRangeMigration(parsedPinnedRanges)
                if (needsMigration && !migrated_temporal_store_keys.has(trend_store_key)) {
                    migrated_temporal_store_keys.add(trend_store_key)
                    const migratedRanges = parsedPinnedRanges.map((range) => range.stored)
                    void saveConfigValue(
                        "pinnedTrends",
                        upsertPinnedTrends(trend_store_key, migratedRanges)
                    )
                }

                let total = chart.chart.start
                const trend_points = chart.chart.data.map((datum) => {
                    total += datum.delta
                    return {
                        x:
                            ((datum.trendStart ?? 0) + (datum.trendEnd ?? datum.trendStart ?? 0)) /
                            2,
                        rangeStart: datum.trendStart ?? datum.trendKey ?? +datum.label,
                        rangeEnd: datum.trendEnd ?? datum.trendKey ?? +datum.label,
                        y: total,
                    }
                })

                const hoverAreas = chart.svg.selectAll<
                    SVGRectElement,
                    { label: string; trendKey?: number; trendStart?: number; trendEnd?: number }
                >("rect.hover-bar")
                selectableTrendLine({
                    chart,
                    points: trend_points,
                    hoverAreas,
                    hoverToRange: (datum) => ({
                        startX: datum.trendStart ?? datum.trendKey ?? +datum.label,
                        endX: datum.trendEnd ?? datum.trendKey ?? +datum.label,
                    }),
                    xToPixel: (xValue) => {
                        const matchingDatum = chart.chart.data.find((datum) => {
                            const start = datum.trendStart ?? datum.trendKey ?? +datum.label
                            const end = datum.trendEnd ?? datum.trendKey ?? +datum.label
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
                        trend_data = nextTrends
                        all_trends = mergeVisibleCustomTrends(all_trends, nextTrends)
                    },
                    onPreviewTrendChange: (nextTrend) => {
                        current_trend = nextTrend
                    },
                    onControllerReady: (controller) => {
                        trend_controller = controller
                        removeTrend = handleRemoveTrend
                        togglePinTrend = handleTogglePinTrend
                    },
                    initialPinnedTrends: initialPinnedRanges,
                    initialTrends: all_trends,
                    onPinnedRangesChange: (ranges) => {
                        const mergedRanges = mergeTrendRanges(
                            hiddenPinnedRanges(all_trends, trend_data),
                            ranges
                        )
                        void savePinnedTrends(mergedRanges)
                    },
                    drawDefaultTrend: default_trend_enabled,
                })
            } else {
                trend_data = []
                current_trend = undefined
                trend_controller = undefined
                default_trend_enabled = true
                all_trends = []
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
