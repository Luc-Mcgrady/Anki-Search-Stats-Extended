<script lang="ts">
    import type { TrendLine } from "./bar"

    export let trend: TrendLine
    export let n: number = 1
    export let percentage: boolean = false
</script>

{#if trend}
    Trend =
    {((trend.calcY(n) - trend.yStart) * (percentage ? 100 : 1)).toPrecision(2)}{#if percentage}
        %
    {/if}
    <slot />
{/if}
