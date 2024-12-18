<script lang="ts">
    import type { BarChart, TrendLine } from "./bar"
    import BarScrollable from "./BarScrollable.svelte"
    import { DeltaIfy, type CandlestickGraph } from "./Candlestick"
    import Candlestick from "./Candlestick.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { today } from "./revlogGraphs"
    import { card_data, revlogs, searchLimit } from "./stores"
    import TrendValue from "./TrendValue.svelte"
    import Warning from "./Warning.svelte"

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
            row_colours: ["blue"],
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

    $: truncated = $searchLimit !== 0 // TODO move this into stores.ts
    $: limit = -1 - $searchLimit

    $: learned = (trend_data?.slope || 0) > 0 ? "memorised" : "forgotten"
</script>

{#if bar_data && candlestick_data}
    <div>
        <label>
            <input type="radio" value="trend" bind:group={choice} />
            Trend
        </label>
        <label>
            <input type="radio" value="bar" bind:group={choice} />
            Total
        </label>
    </div>

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
        <TrendValue trend={trend_data} n={binSize} absolute>
            Cards {learned} per
            {#if binSize == 1}
                day
            {:else}
                {binSize} days
            {/if}
        </TrendValue>
    {:else}
        <NoGraph>
            Assuming you didn't just inspect element the values to be wrong, you have broken the
            addon. Congratulations?
        </NoGraph>
    {/if}
{:else if !show}
    <NoGraph>
        <button on:click={() => (show = true)}>Show?</button>
    </NoGraph>
    {#if truncated}
        <Warning>It is heavily advised you use "All history" for this graph</Warning>
        <Warning>
            This graph re-simulates your review history, leaving the beginning out can greatly
            affect the results.
        </Warning>
    {/if}
{:else}
    <NoGraph>Loading</NoGraph>
{/if}
