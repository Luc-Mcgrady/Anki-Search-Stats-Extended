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
        pinnedTrendsForKey,
        type InitialTrend,
        type DrawnTrend,
        upsertPinnedTrends,
        type TrendInfo,
        type TrendLine,
        type TrendRange,
        type TrendSelectionController,
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
    export let trend_store_key = ""
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

    export let trend_values: DrawnTrend[] = []
    let current_trend: TrendLine = undefined
    let trend_controller: TrendSelectionController | undefined = undefined
    let default_trend_enabled = true
    let all_trends: InitialTrend[] = []
    let migrated_temporal_store_keys = new Set<string>()

    function removeTrend(id: number) {
        const selectedTrend = trend_values.find((trend) => trend.id === id)
        all_trends = removeTrendFromAll(all_trends, selectedTrend)
        if (selectedTrend?.kind === "default") {
            default_trend_enabled = false
        }
        trend_controller?.removeTrend(id)
    }

    function togglePinTrend(id: number) {
        trend_controller?.togglePin(id)
    }

    async function savePinnedTrends(storeKey: string, ranges: TrendRange[]) {
        if (!storeKey) {
            return
        }
        const rangesToPersist = ranges.map((range) => toStoredRange(range, trend_date_axis))
        await saveConfigValue("pinnedTrends", upsertPinnedTrends(storeKey, rangesToPersist))
    }

    $: resolvedTrendStoreKey =
        trend_store_key ||
        `bar:${data.row_labels.join("|")}:${left_aligned ? "left" : "right"}:${average ? "avg" : "sum"}:${loss ? "loss" : "normal"}`
    let last_trend_store_key = ""
    $: if (resolvedTrendStoreKey !== last_trend_store_key) {
        last_trend_store_key = resolvedTrendStoreKey
        default_trend_enabled = true
        all_trends = []
        trend_values = []
        current_trend = undefined
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

        const trend_data = chart.chart.data.map((datum) => ({
            x: ((datum.trendStart ?? 0) + (datum.trendEnd ?? datum.trendStart ?? 0)) / 2,
            rangeStart: datum.trendStart ?? datum.trendKey ?? +datum.label,
            rangeEnd: datum.trendEnd ?? datum.trendKey ?? +datum.label,
            y: trend_by(datum.values),
        }))

        if (trend) {
            const storedPinnedRanges = pinnedTrendsForKey(resolvedTrendStoreKey)
            const parsedPinnedRanges = parseStoredRanges(storedPinnedRanges, trend_date_axis)
            const initialPinnedRanges = parsedPinnedRanges.map((range) => range.normalized)
            const needsMigration = trend_date_axis && needsStoredRangeMigration(parsedPinnedRanges)
            if (needsMigration && !migrated_temporal_store_keys.has(resolvedTrendStoreKey)) {
                migrated_temporal_store_keys.add(resolvedTrendStoreKey)
                const migratedRanges = parsedPinnedRanges.map((range) => range.stored)
                void saveConfigValue(
                    "pinnedTrends",
                    upsertPinnedTrends(resolvedTrendStoreKey, migratedRanges)
                )
            }

            const hoverAreas = chart.svg.selectAll<SVGRectElement, BarDatum>("rect.hover-bar")
            trend_controller = selectableTrendLine({
                chart,
                points: trend_data,
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
                    trend_values = nextTrends
                    all_trends = mergeVisibleCustomTrends(all_trends, nextTrends)
                },
                onPreviewTrendChange: (nextTrend) => {
                    current_trend = nextTrend
                },
                onControllerReady: (controller) => {
                    trend_controller = controller
                },
                initialPinnedTrends: initialPinnedRanges,
                initialTrends: all_trends,
                onPinnedRangesChange: (ranges) => {
                    const mergedRanges = mergeTrendRanges(
                        hiddenPinnedRanges(all_trends, trend_values),
                        ranges
                    )
                    void savePinnedTrends(resolvedTrendStoreKey, mergedRanges)
                },
                drawDefaultTrend: default_trend_enabled,
            })
        } else {
            trend_values = []
            current_trend = undefined
            trend_controller = undefined
            default_trend_enabled = true
            all_trends = []
        }
    }

    let bars: BarDatum[]
    $: {
        const maxIndex = Math.max(data.data.length - 1, 0)
        const clampIndex = (index: number) => Math.min(Math.max(index, 0), maxIndex)
        bars = _.range(leftmost, realOffset, binSize).map((i) => ({
            label: (i + min).toString(),
            values: loss ? [0, 0] : data.row_labels.map((_) => 0),
            trendKey: absoluteDataIndex(i),
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

{#if trend_values.length || current_trend !== undefined}
    <TrendValue
        trends={trend_values}
        trend={current_trend}
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
