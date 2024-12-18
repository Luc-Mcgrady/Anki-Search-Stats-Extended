<script lang="ts">
    import type { TrendLine } from "./bar"

    export let trend: TrendLine
    export let n: number = 1
    export let percentage: boolean = false
    export let absolute = false

    let trend_value: number
    $: if (trend) {
        trend_value = (trend.calcY(n) - trend.yStart) * (percentage ? 100 : 1)
        if (absolute) {
            trend_value = Math.abs(trend_value)
        }
    }
</script>

{#if trend_value}
    Trend =
    {trend_value > 1 ? trend_value.toFixed(2) : trend_value.toPrecision(2)}{#if percentage}
        %
    {/if}
    <slot />
{/if}
