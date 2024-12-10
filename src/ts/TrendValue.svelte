<script lang="ts">
    import type { TrendLine } from "./bar"

    export let trend: TrendLine
    export let n: number = 1
</script>

{#if trend}
    Trend =
    {((trend.calcY(n) - trend.yStart) * 100).toPrecision(2)}%
    <slot />
{/if}
