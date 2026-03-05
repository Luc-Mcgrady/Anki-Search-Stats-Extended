import { dayFromDateString, dayToDateString } from "./revlogGraphs"
import { type StoredTrendCoordinate, type StoredTrendRange, type TrendRange } from "./trend"

export type ParsedStoredRange = {
    original: StoredTrendRange
    normalized: TrendRange
    stored: StoredTrendRange
}

function storedCoordinateToNumber(value: StoredTrendCoordinate) {
    if (typeof value === "number") {
        return value
    }
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
}

function storedCoordinateToDay(value: StoredTrendCoordinate) {
    if (typeof value !== "string") {
        return
    }
    return dayFromDateString(value)
}

export function toStoredRange(range: TrendRange, temporalAxis: boolean): StoredTrendRange {
    if (!temporalAxis) {
        return range
    }
    return {
        startX: dayToDateString(range.startX),
        endX: dayToDateString(range.endX),
    }
}

export function fromStoredRange(
    range: StoredTrendRange,
    temporalAxis: boolean
): TrendRange | undefined {
    const converter = temporalAxis ? storedCoordinateToDay : storedCoordinateToNumber
    const startX = converter(range.startX)
    const endX = converter(range.endX)
    if (startX === undefined || endX === undefined) {
        return
    }
    return { startX, endX }
}

export function parseStoredRanges(storedRanges: StoredTrendRange[], temporalAxis: boolean) {
    return storedRanges
        .map((range) => {
            const normalized = fromStoredRange(range, temporalAxis)
            if (!normalized) {
                return
            }
            return {
                original: range,
                normalized,
                stored: toStoredRange(normalized, temporalAxis),
            }
        })
        .filter((range): range is ParsedStoredRange => range !== undefined)
}

export function needsStoredRangeMigration(parsedRanges: ParsedStoredRange[]) {
    return parsedRanges.some(
        ({ original, stored }) => original.startX !== stored.startX || original.endX !== stored.endX
    )
}
