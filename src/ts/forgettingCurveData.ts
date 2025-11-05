import { default_w, forgetting_curve, FSRS6_DEFAULT_DECAY, S_MIN } from "ts-fsrs"

export type ForgettingSample = {
    cid: number
    firstRating: number
    delta: number
    recall: number
}

type AggregatedSample = {
    delta: number
    success: number
    count: number
}

export interface ForgettingCurvePoint {
    delta: number
    recall: number
    count: number
}

export interface ForgettingCurveSeries {
    rating: number
    stability: number | null
    rmse: number | null
    sampleSize: number
    points: ForgettingCurvePoint[]
    predicted: { delta: number; recall: number }[]
}

const RATING_DEFAULT_STABILITY: Record<number, number> = {
    1: default_w[0],
    2: default_w[1],
    3: default_w[2],
    4: default_w[3],
}

const MAX_STABILITY = 100
const EPSILON = 1e-6
const MAX_INTERVAL = 365

export interface ForgettingCurveOptions {
    deltaLimitByRating?: (rating: number) => number
    minStability?: number
    maxStability?: number
    maxInterval?: number
    disableOutlierFiltering?: boolean
    adaptiveBinning?: {
        enabled: boolean
        maxBins: number
        minSamplesPerBin: number
    }
}

function filterOutliers(
    rating: number,
    entries: AggregatedSample[],
    deltaLimitByRating: (rating: number) => number
): AggregatedSample[] {
    if (!entries.length) {
        return []
    }

    const sorted = [...entries].sort((a, b) => {
        if (a.count !== b.count) {
            return a.count - b.count
        }
        return b.delta - a.delta
    })

    const total = sorted.reduce((sum, entry) => sum + entry.count, 0)
    if (total < 20) {
        return entries.sort((a, b) => a.delta - b.delta)
    }
    const threshold = Math.max(total * 0.05, 20)
    let removed = 0
    const removedDeltas = new Set<number>()
    const deltaLimit = deltaLimitByRating(rating)

    for (const entry of sorted) {
        const { count, delta } = entry
        if (removed + count < threshold) {
            removedDeltas.add(delta)
            removed += count
            continue
        }

        if (count < 6 || delta > deltaLimit) {
            removedDeltas.add(delta)
            removed += count
        }
    }

    return entries
        .filter((entry) => !removedDeltas.has(entry.delta))
        .sort((a, b) => a.delta - b.delta)
}

function applyAdaptiveBinning(
    entries: AggregatedSample[],
    maxBins: number,
    minSamplesPerBin: number
): AggregatedSample[] {
    if (!entries.length) {
        return []
    }

    // Sort by delta (time) first
    const sorted = [...entries].sort((a, b) => a.delta - b.delta)

    // Calculate total samples
    const totalSamples = sorted.reduce((sum, entry) => sum + entry.count, 0)

    // If total samples less than minimum, return single bin
    if (totalSamples < minSamplesPerBin) {
        const merged: AggregatedSample = {
            delta: sorted.reduce((sum, e) => sum + e.delta * e.count, 0) / totalSamples,
            success: sorted.reduce((sum, e) => sum + e.success, 0),
            count: totalSamples,
        }
        return [merged]
    }

    // First pass: merge to meet minimum samples per bin
    const bins: AggregatedSample[] = []
    let currentBin: AggregatedSample | null = null

    for (const entry of sorted) {
        if (!currentBin) {
            currentBin = { ...entry }
        } else {
            // Weighted average of delta
            const totalCount = currentBin.count + entry.count
            currentBin.delta =
                (currentBin.delta * currentBin.count + entry.delta * entry.count) / totalCount
            currentBin.success += entry.success
            currentBin.count = totalCount
        }

        // If current bin meets minimum samples, finalize it
        if (currentBin.count >= minSamplesPerBin) {
            bins.push(currentBin)
            currentBin = null
        }
    }

    // Add remaining bin if exists
    if (currentBin) {
        if (bins.length > 0) {
            // Merge with last bin to avoid a small final bin
            const lastBin = bins[bins.length - 1]
            const totalCount = lastBin.count + currentBin.count
            lastBin.delta =
                (lastBin.delta * lastBin.count + currentBin.delta * currentBin.count) / totalCount
            lastBin.success += currentBin.success
            lastBin.count = totalCount
        } else {
            bins.push(currentBin)
        }
    }

    // Second pass: if still too many bins, merge adjacent bins
    while (bins.length > maxBins) {
        // Find the pair of adjacent bins with smallest combined time span
        let minSpanIndex = 0
        let minSpan = Number.POSITIVE_INFINITY

        for (let i = 0; i < bins.length - 1; i++) {
            const span = bins[i + 1].delta - bins[i].delta
            if (span < minSpan) {
                minSpan = span
                minSpanIndex = i
            }
        }

        // Merge the pair
        const bin1 = bins[minSpanIndex]
        const bin2 = bins[minSpanIndex + 1]
        const totalCount = bin1.count + bin2.count
        const mergedBin: AggregatedSample = {
            delta: (bin1.delta * bin1.count + bin2.delta * bin2.count) / totalCount,
            success: bin1.success + bin2.success,
            count: totalCount,
        }

        bins.splice(minSpanIndex, 2, mergedBin)
    }

    return bins
}

export function buildForgettingCurve(
    samples: ForgettingSample[],
    options: ForgettingCurveOptions = {}
): ForgettingCurveSeries[] {
    if (samples.length === 0) {
        return []
    }

    const ratingBuckets: Record<number, Map<number, AggregatedSample>> = {
        1: new Map(),
        2: new Map(),
        3: new Map(),
        4: new Map(),
    }

    let totalCount = 0
    let totalSuccess = 0

    for (const sample of samples) {
        if (sample.firstRating < 1 || sample.firstRating > 4) {
            continue
        }

        const bucket = ratingBuckets[sample.firstRating]!
        const existing = bucket.get(sample.delta) ?? { delta: sample.delta, success: 0, count: 0 }
        existing.success += sample.recall
        existing.count += 1
        bucket.set(sample.delta, existing)

        totalSuccess += sample.recall
        totalCount += 1
    }

    if (totalCount === 0) {
        return []
    }

    const averageRecall = totalSuccess / totalCount

    const aggregatedByRating: Record<number, AggregatedSample[]> = {
        1: [],
        2: [],
        3: [],
        4: [],
    }

    const deltaLimitByRating =
        options.deltaLimitByRating ?? ((rating: number) => (rating === 4 ? 365 : 100))

    // Record original max delta before binning for prediction range
    const maxIntervalLimit = options.maxInterval ?? MAX_INTERVAL
    let originalMaxDelta = 30
    for (const rating of [1, 2, 3, 4]) {
        const bucket = ratingBuckets[rating]!
        const bucketValues = Array.from(bucket.values())
        if (bucketValues.length) {
            const ratingMax = bucketValues.reduce((p, entry) => Math.max(p, entry.delta), 0)
            originalMaxDelta = Math.max(originalMaxDelta, ratingMax)
        }
    }

    for (const rating of [1, 2, 3, 4]) {
        const bucket = ratingBuckets[rating]!
        let aggregated = options.disableOutlierFiltering
            ? Array.from(bucket.values()).sort((a, b) => a.delta - b.delta)
            : filterOutliers(rating, Array.from(bucket.values()), deltaLimitByRating)

        // Apply adaptive binning if enabled
        if (options.adaptiveBinning?.enabled) {
            aggregated = applyAdaptiveBinning(
                aggregated,
                options.adaptiveBinning.maxBins,
                options.adaptiveBinning.minSamplesPerBin
            )
        }

        aggregatedByRating[rating] = aggregated
    }

    const sharedPredictionRange = Math.min(maxIntervalLimit, Math.ceil(originalMaxDelta))

    const series: ForgettingCurveSeries[] = []

    for (const rating of [1, 2, 3, 4]) {
        const aggregated = aggregatedByRating[rating]

        if (!aggregated.length) {
            series.push({
                rating,
                stability: null,
                rmse: null,
                sampleSize: 0,
                points: [],
                predicted: [],
            })
            continue
        }

        const stability = fitStability(
            aggregated,
            averageRecall,
            RATING_DEFAULT_STABILITY[rating],
            options.minStability,
            options.maxStability
        )
        const predicted = stability
            ? buildPredictionSeries(stability, sharedPredictionRange, maxIntervalLimit)
            : []
        const rmse = stability ? computeRmse(aggregated, stability) : null
        const points: ForgettingCurvePoint[] = aggregated.map((entry) => ({
            delta: entry.delta,
            recall: entry.success / entry.count,
            count: entry.count,
        }))

        const sampleSize = aggregated.reduce((p, entry) => p + entry.count, 0)

        series.push({
            rating,
            stability,
            rmse,
            sampleSize,
            points,
            predicted,
        })
    }

    return series
}

function fitStability(
    aggregated: AggregatedSample[],
    averageRecall: number,
    initial: number,
    minStability: number = S_MIN,
    maxStability: number = MAX_STABILITY
): number | null {
    if (!aggregated.length) {
        return null
    }

    const loss = (stability: number) => {
        let total = 0
        for (const entry of aggregated) {
            const prediction = clampProbability(
                forgetting_curve(FSRS6_DEFAULT_DECAY, entry.delta, stability)
            )
            const smoothed = (entry.success + averageRecall) / (entry.count + 1)
            total +=
                -(smoothed * Math.log(prediction) + (1 - smoothed) * Math.log(1 - prediction)) *
                entry.count
        }
        total += Math.abs(stability - initial) / 16
        return total
    }

    let left = minStability
    let right = maxStability
    let best = initial
    let bestLoss = Number.POSITIVE_INFINITY

    for (let i = 0; i < 60; i++) {
        const m1 = left + (right - left) / 3
        const m2 = right - (right - left) / 3
        const f1 = loss(m1)
        const f2 = loss(m2)
        if (f1 > f2) {
            left = m1
        } else {
            right = m2
        }
    }

    for (const candidate of [
        left,
        right,
        (left + right) / 2,
        initial,
        initial * 0.5,
        initial * 1.5,
    ]) {
        const clamped = clamp(candidate, minStability, maxStability)
        const candidateLoss = loss(clamped)
        if (candidateLoss < bestLoss) {
            bestLoss = candidateLoss
            best = clamped
        }
    }

    return best
}

function computeRmse(aggregated: AggregatedSample[], stability: number): number | null {
    const totalCount = aggregated.reduce((p, entry) => p + entry.count, 0)
    if (!totalCount) {
        return null
    }

    const squaredError = aggregated.reduce((p, entry) => {
        const prediction = forgetting_curve(FSRS6_DEFAULT_DECAY, entry.delta, stability)
        const meanRecall = entry.success / entry.count
        return p + (meanRecall - prediction) ** 2 * entry.count
    }, 0)

    return Math.sqrt(squaredError / totalCount)
}

function buildPredictionSeries(
    stability: number,
    maxDelta: number,
    maxIntervalLimit: number = MAX_INTERVAL
): { delta: number; recall: number }[] {
    const cappedMaxDelta = Math.max(30, Math.min(maxIntervalLimit, Math.ceil(maxDelta)))
    const series: { delta: number; recall: number }[] = []

    // Use finer step size for smooth curves, especially important for short-term curves
    const numPoints = 500
    const step = cappedMaxDelta / numPoints

    for (let i = 0; i <= numPoints; i++) {
        const delta = i * step
        series.push({
            delta,
            recall: forgetting_curve(FSRS6_DEFAULT_DECAY, delta, stability),
        })
    }
    return series
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function clampProbability(value: number) {
    return Math.min(1 - EPSILON, Math.max(EPSILON, value))
}
