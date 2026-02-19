import { mean } from "d3-array"
import { default_w, forgetting_curve, FSRS5_DEFAULT_DECAY, S_MIN } from "ts-fsrs"

export type ForgettingSample = {
    cid: number
    firstRating: number
    delta: number
    recall: number
    decay: number
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

export interface ForgettingCurveOptions {
    deltaLimitByRating?: (rating: number) => number
    minStability?: number
    maxStability?: number
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

    const aggregatedByRating: Record<number, AggregatedSample[]> = {
        1: [],
        2: [],
        3: [],
        4: [],
    }

    const deltaLimitByRating =
        options.deltaLimitByRating ?? ((rating: number) => (rating === 4 ? 365 : 100))

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

        // Prediction curves are now generated dynamically during rendering
        const predicted: { delta: number; recall: number }[] = []
        const points: ForgettingCurvePoint[] = aggregated.map((entry) => ({
            delta: entry.delta,
            recall: entry.success / entry.count,
            count: entry.count,
        }))

        const sampleSize = aggregated.reduce((p, entry) => p + entry.count, 0)

        series.push({
            rating,
            stability: null,
            rmse: null,
            sampleSize,
            points,
            predicted,
        })
    }

    return series
}

export function averageDecay(samples: ForgettingSample[]): number {
    const decayValues = samples
        .map((sample) => sample.decay)
        .filter((decay) => !Number.isNaN(decay))
    const avgDecay = mean(decayValues)
    // Fall back to FSRS5 default: no per-card decay means the collection likely isn't on FSRS6.
    return avgDecay ?? FSRS5_DEFAULT_DECAY
}

export function fitStability(
    samples: ForgettingSample[],
    initial: number,
    minStability: number = S_MIN,
    maxStability: number = MAX_STABILITY
): number | null {
    if (!samples.length) {
        return null
    }

    const loss = (stability: number) => {
        let total = 0
        for (const sample of samples) {
            const prediction = clampProbability(
                forgetting_curve(sample.decay, sample.delta, stability)
            )
            const recall = sample.recall
            total += -(recall * Math.log(prediction) + (1 - recall) * Math.log(1 - prediction))
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

export function computeRmse(samples: ForgettingSample[], stability: number): number | null {
    if (!samples.length) {
        return null
    }

    const squaredError = samples.reduce((p, sample) => {
        const prediction = forgetting_curve(sample.decay, sample.delta, stability)
        return p + (sample.recall - prediction) ** 2
    }, 0)

    return Math.sqrt(squaredError / samples.length)
}

export function computeStabilityForSeries(
    series: ForgettingCurveSeries[],
    samples: ForgettingSample[],
    options: ForgettingCurveOptions = {}
): ForgettingCurveSeries[] {
    return series.map((entry) => {
        if (!entry.points.length) {
            return entry
        }

        // Filter original samples by rating
        const ratingSamples = samples.filter((s) => s.firstRating === entry.rating)

        const stability = fitStability(
            ratingSamples,
            RATING_DEFAULT_STABILITY[entry.rating],
            options.minStability,
            options.maxStability
        )

        const rmse = stability ? computeRmse(ratingSamples, stability) : null

        return {
            ...entry,
            stability,
            rmse,
        }
    })
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function clampProbability(value: number) {
    return Math.min(1 - EPSILON, Math.max(EPSILON, value))
}
