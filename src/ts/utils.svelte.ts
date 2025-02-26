/**
 * Represents an integer state that is constrained to a specified range.
 *
 * Attempts to set the state to an invalid value will clamp to the nearest valid value.
 */
export class ConstrainedIntState {
    readonly #min: number = 0
    readonly #max: number = 0

    #value: number = $state(0)

    /**
     * Creates a new instance of the ConstrainedIntState class.
     *
     * @param min - The minimum value for the state, inclusive. Must be less than max.
     * @param max - The maximum value for the state, inclusive. Must be greater than min.
     * @param defaultValue - The initial value for the state. Will be clamped between min and max.
     */
    constructor(min: number, max: number, defaultValue: number) {
        if (min > max) {
            throw new Error("min must be less than max")
        }

        this.#min = Math.ceil(min)
        this.#max = Math.floor(max)

        this.value = defaultValue
    }

    get value(): number {
        return this.#value
    }

    set value(value: number) {
        this.#value = Math.max(this.#min, Math.min(this.#max, Math.floor(value)))
    }
}

/**
 * A generator that yields all the integer values from `start` (inclusive) to `end` (exclusive).
 *
 * Useful for emulating a `for` loop with a svelte `{#each}` block.
 *
 * @param start - The starting integer value (inclusive).
 * @param end - The ending integer value (exclusive).
 * @yields - Each integer in the specified range from `start` to `end - 1`.
 */
export function* range(start: number, end: number): Generator<number> {
    for (let i = start; i < end; i++) {
        yield i
    }
}
