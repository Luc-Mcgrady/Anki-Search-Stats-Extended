import _ from "lodash"
import type { BarDatum } from "./bar"

export function totalCalc(data: BarDatum) {
    return data.values.length > 1 ? [`Total: ${parseFloat(_.sum(data.values).toFixed(2))}`] : []
}
