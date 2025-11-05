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

    for (const rating of [1, 2, 3, 4]) {
        const bucket = ratingBuckets[rating]!
        aggregatedByRating[rating] = filterOutliers(rating, Array.from(bucket.values()), deltaLimitByRating)
    }

    let maxPredictionDelta = 30
    for (const rating of [1, 2, 3, 4]) {
        const aggregated = aggregatedByRating[rating]
        if (aggregated.length) {
            const ratingMax = aggregated.reduce((p, entry) => Math.max(p, entry.delta), 0)
            maxPredictionDelta = Math.min(MAX_INTERVAL, Math.max(maxPredictionDelta, ratingMax))
        }
    }

    const sharedPredictionRange = Math.ceil(maxPredictionDelta)

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

        const stability = fitStability(aggregated, averageRecall, RATING_DEFAULT_STABILITY[rating])
        const predicted = stability ? buildPredictionSeries(stability, sharedPredictionRange) : []
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
    initial: number
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

    let left = Math.max(S_MIN, Math.min(initial, MAX_STABILITY) / 4)
    let right = MAX_STABILITY
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
        const clamped = clamp(candidate, S_MIN, MAX_STABILITY)
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
    maxDelta: number
): { delta: number; recall: number }[] {
    const cappedMaxDelta = Math.max(30, Math.min(MAX_INTERVAL, Math.ceil(maxDelta)))
    const series: { delta: number; recall: number }[] = []
    for (let delta = 0; delta <= cappedMaxDelta; delta++) {
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
