<script lang="ts">
    import type { TrendLine, TrendInfo } from "./trend"

    export let trend: TrendLine
    export let n: number = 1

    export let info: TrendInfo = {}

    $: ({
        x = "x",
        x_s = x + "s",
        y = "y",
        y_s = y + "s",
        percentage = false,
        absolute = false,
    } = info)

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
        <div>
            {display(trend_day_value)}
            {#if trend_day_value == 1}
                {y}
            {:else}
                {y_s}
            {/if}
            per {x}
        </div>
        {#if n > 1}
            <div>
                {display(trend_value)}
                {#if trend_value == 1}
                    {y}
                {:else}
                    {y_s}
                {/if}
                per {n}
                {x_s}
            </div>
        {:else}
            <br />
        {/if}
    </div>
{/if}
