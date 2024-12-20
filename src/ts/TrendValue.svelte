<script lang="ts">
    import type { TrendLine } from "./bar"

    export let trend: TrendLine
    export let n: number = 1
    export let percentage: boolean = false
    export let absolute = false

    export let x
    export let x_s = x + "s"
    export let y
    export let y_s = y + "s"

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
</script>

{#if trend_value}
    <br />
    Trend =
    <div>
        <div>
            {display(trend_value / n)}
            {y}
            per {x}
        </div>
        {#if n > 1}
            <div>
                {display(trend_value)}
                {y_s}
                per {n}
                {x_s}
            </div>
        {/if}
    </div>
{/if}
