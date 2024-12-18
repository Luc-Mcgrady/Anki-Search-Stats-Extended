import _ from "lodash"
import type { BarDatum } from "./bar"

export function totalCalc(data: BarDatum) {
    return data.values.length > 1 ? [`Total: ${_.sum(data.values)}`] : []
}
