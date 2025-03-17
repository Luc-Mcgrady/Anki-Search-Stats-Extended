<script lang="ts">
    import { i18n, i18n_bundle } from "./i18n"
    import type { TrendLine, TrendInfo } from "./trend"

    export let trend: TrendLine
    export let n: number = 1

    export let info: TrendInfo = {}

    $: ({ pattern = "", percentage = false, absolute = false } = info)

    let trend_value: number
    $: if (trend) {
        trend_value = (trend.calcY(n) - trend.yStart) * (percentage ? 100 : 1)
        if (absolute) {
            trend_value = Math.abs(trend_value)
        }
    }

    function display(trend_value: number) {
        return (
            (trend_value > 1 ? trend_value.toFixed(2) : trend_value.toPrecision(2)) +
            (percentage ? "%" : "")
        )
    }

    $: trend_day_value = trend_value / n
</script>

{#if trend_value}
    <br />
    Trend =
    <div>
        {#if n > 1}
            {i18n_bundle.formatPattern(pattern, { n: 1, value: display(trend_day_value) })}
            <br />
        {/if}
        {i18n_bundle.formatPattern(pattern, { n, value: display(trend_value) })}
    </div>
{/if}
