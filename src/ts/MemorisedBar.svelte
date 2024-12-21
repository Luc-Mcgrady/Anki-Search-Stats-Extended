<script lang="ts">
    import { SetDateInfinite, type BarChart } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { DeltaIfy, type CandlestickGraph } from "./Candlestick"
    import Candlestick from "./Candlestick.svelte"
    import GraphTypeSelector from "./GraphTypeSelector.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { card_data, revlogs, searchLimit } from "./stores"
    import type { TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"

    let show = false
    let choice = "trend"
    let data: number[] | undefined = undefined

    let bar_data: BarChart
    let candlestick_data: CandlestickGraph

    let trend_data: TrendLine

    export let offset = 0
    export let bins = 30
    export let binSize = 1

    $: if ($revlogs && $card_data && show)
        data = Array.from(
            getMemorisedDays($revlogs, $card_data, SSEother.deck_configs, SSEother.deck_config_ids)
        )

    $: if (data)
        bar_data = {
            row_labels: ["Memorised"],
            row_colours: ["#4abdff"],
            data: data.map((stab, i) => ({
                label: i.toString(),
                values: [stab],
            })),
            tick_spacing: 5,
        }

    $: if (data)
        candlestick_data = {
            start: data[data.length - bins * binSize - Math.abs(offset) - 1] || 0,
            data: Array.from(DeltaIfy(data)).map((delta, i) => ({
                label: i.toString(),
                delta,
            })),
            tick_spacing: 5,
        }

    $: limit = -1 - $searchLimit

    $: truncated = $searchLimit !== 0
    $: learned = (trend_data?.slope || 0) > 0 ? "memorised" : "forgotten"
</script>

{#if bar_data && candlestick_data}
    <GraphTypeSelector>
        <label>
            <input type="radio" value="trend" bind:group={choice} />
            Trend
        </label>
        <label>
            <input type="radio" value="bar" bind:group={choice} />
            Total
        </label>
    </GraphTypeSelector>

    {#if choice == "bar"}
        <BarScrollable data={bar_data} {limit} average bind:offset bind:binSize bind:bins />
    {:else if choice == "trend"}
        <Candlestick
            data={candlestick_data}
            {limit}
            bind:offset
            bind:trend_data
            bind:binSize
            bind:bins
        ></Candlestick>
        <TrendValue
            trend={trend_data}
            n={binSize}
            info={{ absolute: true, y: learned, y_s: learned, x: "day" }}
        ></TrendValue>
    {:else}
        <NoGraph>
            Assuming you didn't just inspect element the values to be wrong, you have broken the
            addon. Congratulations?
        </NoGraph>
    {/if}
{:else if !show}
    <NoGraph faded={false}>
        {#if !truncated}
            <button class="big" on:click={() => (show = true)}>Show?</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>Increase date range</button>
            <button on:click={() => (show = true)}>Show?</button>
        {/if}
    </NoGraph>
{:else}
    <NoGraph>Loading</NoGraph>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }
</style>
