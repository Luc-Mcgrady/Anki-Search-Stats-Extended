import {
    type DrawnTrend,
    type InitialTrend,
    trendRangesEqual,
    type TrendRange,
} from "./trend"

type TrendIdentity = Pick<InitialTrend, "startX" | "endX" | "kind">

function sameTrend(a: TrendIdentity, b: TrendIdentity) {
    return a.kind === b.kind && trendRangesEqual(a, b)
}

export function mergeVisibleCustomTrends(allTrends: InitialTrend[], visibleTrends: DrawnTrend[]) {
    const merged = allTrends.filter((trend) => trend.kind === "custom")
    for (const trend of visibleTrends.filter((trend) => trend.kind === "custom")) {
        const nextTrend: InitialTrend = {
            startX: trend.startX,
            endX: trend.endX,
            colour: trend.colour,
            pinned: trend.pinned,
            kind: trend.kind,
        }
        const existingIndex = merged.findIndex((previousTrend) => sameTrend(previousTrend, trend))
        if (existingIndex === -1) {
            merged.push(nextTrend)
        } else {
            merged[existingIndex] = nextTrend
        }
    }
    return merged
}

export function removeTrendFromAll(allTrends: InitialTrend[], selectedTrend: DrawnTrend | undefined) {
    if (!selectedTrend) {
        return allTrends
    }
    return allTrends.filter((trend) => !sameTrend(trend, selectedTrend))
}

export function hiddenPinnedRanges(allTrends: InitialTrend[], visibleTrends: DrawnTrend[]) {
    return allTrends
        .filter(
            (trend) =>
                trend.pinned &&
                !visibleTrends.some(
                    (visibleTrend) =>
                        visibleTrend.kind === trend.kind && trendRangesEqual(visibleTrend, trend)
                )
        )
        .map((trend) => ({ startX: trend.startX, endX: trend.endX }))
}

export function mergeTrendRanges(base: TrendRange[], extra: TrendRange[]) {
    const merged = [...base]
    for (const range of extra) {
        if (!merged.some((current) => trendRangesEqual(current, range))) {
            merged.push(range)
        }
    }
    return merged
}
