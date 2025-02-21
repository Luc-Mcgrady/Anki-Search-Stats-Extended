const R_FACTOR = 19 / 81
const R_DECAY = -0.5

export function calculateR(elapsed_days: number, stability: number): number {
    return Math.pow(1 + R_FACTOR * (elapsed_days / stability), R_DECAY)
}
