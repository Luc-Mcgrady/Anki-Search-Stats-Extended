export class ConstrainedIntState {
    readonly #min: number = 0
    readonly #max: number = 0

    #value: number = $state(0)

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
