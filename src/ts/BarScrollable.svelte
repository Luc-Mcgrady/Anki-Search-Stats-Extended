<script lang="ts">
    import _ from "lodash"
    import {
        limitArea,
        limit_area_width,
        type BarChart,
        type BarDatum,
        type ExtraRenderInput,
    } from "./bar"
    import Bar from "./Bar.svelte"
    import TrendValue from "./TrendValue.svelte"
    import {
        selectableTrendLine,
        type TrendInfo,
    } from "./trend"
    import { loadPinnedTrendRanges, queuePersistPinnedRanges, queuePersistStoredPinnedRanges } from "./trendPinnedPersistence"
    import { trendMidpointXFromAxisDatum, trendRangeFromAxisDatum } from "./trendAxis"
    import {
        createGraphTrendSessionState,
        type GraphTrendSessionState,
        hiddenPinnedRanges,
        mergeTrendRanges,
        mergeVisibleCustomTrends,
        removeTrendFromAll,
    } from "./trendSession"
    import { i18n } from "./i18n"

    export let data: BarChart
    export let extraRender = (chart: ExtraRenderInput<BarChart>) => {}

    export let binSize = 1
    export let offset = 0
    export let bins = 30
    export let average = false
    export let left_aligned = false
    export let limit: number = -1
    export let trend = false
    export let trend_by: (values: number[]) => number = _.sum
    export let trend_info: TrendInfo = {}
    export let loss: boolean = false
    export let trendPersistenceKey = ""
    export let trend_date_axis = false

    $: min = left_aligned ? 0 : 1
    $: absOffset = Math.abs(offset)
    $: realOffset = left_aligned ? absOffset + bins * binSize + min : -absOffset
    $: leftmost = realOffset - bins * binSize

    $: binSize = binSize > 0 ? binSize : 1
    $: separate_bars = data.data.slice(
        leftmost,
        realOffset == 0 || realOffset >= data.data.length ? undefined : realOffset
    )

    let trendSession: GraphTrendSessionState = createGraphTrendSessionState()
    let migrated_temporal_store_keys = new Set<string>()

    function removeTrend(id: number) {
        const selectedTrend = trendSession.visibleTrends.find((trend) => trend.id === id)
        trendSession = {
            ...trendSession,
            allTrends: removeTrendFromAll(trendSession.allTrends, selectedTrend),
            defaultTrendEnabled:
                selectedTrend?.kind === "default" ? false : trendSession.defaultTrendEnabled,
        }
        trendSession.controller?.removeTrend(id)
    }

    function togglePinTrend(id: number) {
        trendSession.controller?.togglePin(id)
    }

    let lastTrendPersistenceKey = ""
    $: if (trendPersistenceKey !== lastTrendPersistenceKey) {
        lastTrendPersistenceKey = trendPersistenceKey
        trendSession = createGraphTrendSessionState()
    }

    function absoluteDataIndex(index: number) {
        if (index < 0) {
            return data.data.length + index
        }
        return index
    }

    function inner_extra_render(chart: ExtraRenderInput<BarChart>) {
        extraRender(chart)

        limitArea(chart, limit_area_width(chart.x, limit, offset, binSize, min, realOffset))

        const trend_data = chart.chart.data.map((datum) => {
            const range = trendRangeFromAxisDatum(datum)
            return {
                x: trendMidpointXFromAxisDatum(datum),
                rangeStart: range.startX,
                rangeEnd: range.endX,
                y: trend_by(datum.values),
            }
        })

        if (trend) {
            if (!trendPersistenceKey) {
                console.warn(
                    "BarScrollable trend pinning requires a stable trendPersistenceKey; pins are disabled for this graph."
                )
            }
            const { initialPinnedRanges, migratedStoredRanges } = loadPinnedTrendRanges(
                trendPersistenceKey,
                trend_date_axis
            )
            if (migratedStoredRanges && !migrated_temporal_store_keys.has(trendPersistenceKey)) {
                migrated_temporal_store_keys.add(trendPersistenceKey)
                void queuePersistStoredPinnedRanges(trendPersistenceKey, migratedStoredRanges)
            }

            const hoverAreas = chart.svg.selectAll<SVGRectElement, BarDatum>("rect.hover-bar")
            selectableTrendLine({
                chart,
                points: trend_data,
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
                },
                initialPinnedTrends: initialPinnedRanges,
                initialTrends: trendSession.allTrends,
                onPinnedRangesChange: (ranges) => {
                    const mergedRanges = mergeTrendRanges(
                        hiddenPinnedRanges(trendSession.allTrends, trendSession.visibleTrends),
                        ranges
                    )
                    void queuePersistPinnedRanges(
                        trendPersistenceKey,
                        mergedRanges,
                        trend_date_axis
                    )
                },
                drawDefaultTrend: trendSession.defaultTrendEnabled,
            })
        } else {
            trendSession = createGraphTrendSessionState()
        }
    }

    let bars: BarDatum[]
    $: {
        const maxIndex = Math.max(data.data.length - 1, 0)
        const clampIndex = (index: number) => Math.min(Math.max(index, 0), maxIndex)
        bars = _.range(leftmost, realOffset, binSize).map((i) => ({
            label: (i + min).toString(),
            values: loss ? [0, 0] : data.row_labels.map((_) => 0),
            trendStart: clampIndex(absoluteDataIndex(i)),
            trendEnd: clampIndex(absoluteDataIndex(i + binSize - 1)),
        }))

        for (const [i, bar] of separate_bars.entries()) {
            const newIndex = Math.floor(i / binSize)

            bars[newIndex].values = bars[newIndex].values.map(
                (a, i) => a + (bar?.values ? bar?.values[i] || 0 : 0)
            )
        }

        if (average) {
            bars.map((bar, i) => {
                const count = separate_bars
                    .slice(i * binSize, (i + 1) * binSize)
                    .reduce((p, n) => p + (_.sum(n.values) > 0 ? 1 : 0), 0)

                if (loss) {
                    bar.values = bar.values ? [Math.sqrt(bar.values[0] / bar.values[1])] : [0, 0]
                } else {
                    bar.values = bar.values.map((a) => a / (count || 1))
                }
            })
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

<Bar data={{ ...data, data: bars, barWidth: binSize }} extraRender={inner_extra_render}></Bar>

{#if trendSession.visibleTrends.length || trendSession.previewTrend !== undefined}
    <TrendValue
        trends={trendSession.visibleTrends}
        trend={trendSession.previewTrend}
        n={binSize}
        info={trend_info}
        onRemoveTrend={removeTrend}
        onTogglePinTrend={togglePinTrend}
    />
{/if}

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
