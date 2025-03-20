import _ from "lodash"
import type { BarDatum } from "./bar"
import { i18n } from "./i18n"

export function totalCalc(data: BarDatum) {
    return data.values.length > 1
        ? [`${i18n("total")}: ${parseFloat(_.sum(data.values).toFixed(2))}`]
        : []
}
