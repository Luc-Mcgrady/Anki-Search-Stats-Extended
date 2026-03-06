<script lang="ts">
    import { i18n, i18n_bundle } from "./i18n"
    import { trendPatternBySlope, type DrawnTrend, type TrendLine, type TrendInfo } from "./trend"

    export let trend: TrendLine = undefined
    export let trends: DrawnTrend[] = []
    export let n: number = 1

    export let info: TrendInfo = {}
    export let onRemoveTrend: ((id: number) => void) | undefined = undefined
    export let onTogglePinTrend: ((id: number) => void) | undefined = undefined

    $: ({ pattern = "", positivePattern = undefined, negativePattern = undefined, percentage = false, absolute = false } = info)

    function valueFromTrend(trend: TrendLine) {
        if (trend === undefined) {
            return 0
        }
        let trend_value = (trend.calcY(n) - trend.yStart) * (percentage ? 100 : 1)
        if (absolute) {
            trend_value = Math.abs(trend_value)
        }
        return trend_value
    }

    $: preview_value = valueFromTrend(trend)
    $: preview_pattern = trendPatternBySlope(trend, { pattern, positivePattern, negativePattern })
    $: trend_values = trends.map((line) => ({
        ...line,
        value: valueFromTrend(line.trend),
        pattern: trendPatternBySlope(line.trend, { pattern, positivePattern, negativePattern }),
    }))

    function display(trend_value: number) {
        return (
            (trend_value > 1 ? trend_value.toFixed(2) : trend_value.toPrecision(2)) +
            (percentage ? "%" : "")
        )
    }

    function trendSummary(value: number, currentPattern: TrendInfo["pattern"]) {
        const nValue = i18n_bundle.formatPattern(currentPattern ?? "", { n, value: display(value) })
        if (n <= 1) {
            return nValue
        }
        const perDayValue = i18n_bundle.formatPattern(currentPattern ?? "", {
            n: 1,
            value: display(value / n),
        })
        return `${perDayValue} | ${nValue}`
    }
</script>

{#if trend !== undefined || trend_values.length}
    <br />
    <div class="trend-legend">
        {#if trend !== undefined}
            <div class="trend-item">
                <span class="swatch preview"></span>
                <span class="trend-text">
                    {i18n("trend-preview")}: {trendSummary(preview_value, preview_pattern)}
                </span>
            </div>
        {/if}
        {#each trend_values as line, i}
            <div class="trend-item">
                <span class="swatch" style:background={line.colour}></span>
                <span class="trend-text">{i18n("trend")} {i + 1}: {trendSummary(line.value, line.pattern)}</span>
                {#if onTogglePinTrend}
                    <button
                        type="button"
                        class:active={line.pinned}
                        class="pin-trend"
                        aria-label={line.pinned ? "unpin trend" : "pin trend"}
                        title={line.pinned ? "unpin trend" : "pin trend"}
                        on:click={() => onTogglePinTrend?.(line.id)}
                    >
                        📌
                    </button>
                {/if}
                {#if onRemoveTrend}
                    <button
                        type="button"
                        class="remove-trend"
                        aria-label="remove trend"
                        on:click={() => onRemoveTrend?.(line.id)}
                    >
                        x
                    </button>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .trend-legend {
        display: grid;
        gap: 0.4em;
        margin-top: 0.3em;
    }

    .trend-item {
        display: flex;
        align-items: baseline;
        gap: 0.45em;
    }

    .swatch {
        width: 0.9em;
        height: 0.9em;
        border-radius: 3px;
        display: inline-block;
        border: 1px solid var(--text-faint);
    }

    .swatch.preview {
        background: repeating-linear-gradient(
            135deg,
            var(--text-faint),
            var(--text-faint) 3px,
            transparent 3px,
            transparent 6px
        );
    }

    .trend-text {
        overflow-wrap: anywhere;
    }

    .remove-trend {
        margin-left: 0.1em;
        border: none;
        background: transparent;
        color: var(--text-faint);
        line-height: 1;
        font-size: 0.95em;
        cursor: pointer;
        padding: 0 0.2em;
    }

    .remove-trend:hover {
        color: var(--text);
    }

    .pin-trend {
        margin-left: auto;
        border: none;
        background: transparent;
        color: var(--text-faint);
        line-height: 1;
        font-size: 0.95em;
        cursor: pointer;
        padding: 0 0.2em;
        opacity: 0.45;
        filter: grayscale(1);
    }

    .pin-trend:hover {
        color: var(--text);
        opacity: 0.75;
    }

    .pin-trend.active {
        opacity: 1;
        filter: none;
    }
</style>
