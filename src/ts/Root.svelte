<script lang="ts">
    import DueBar from "./DueBar.svelte"
    import BurdenPie from "./BurdenPie.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalGraph from "./IntervalGraph.svelte"
    import OldRetentionPie from "./OldRetentionPie.svelte"
    import CustomPie from "./CustomPie.svelte"
    import IntraDayDueBar from "./IntraDayDueBar.svelte"
    import {
        data,
        learn_data,
        mature_data,
        not_suspended_data,
        relearn_data,
        searchString,
        card_data,
        include_suspended,
        burdenOrLoad,
        revlogs,
        tooltip,
        showRevlogStats,
        tooltipShown,
        graph_mode,
    } from "./stores"
    import CardDataPies from "./CardDataPies.svelte"
    import _ from "lodash"
    import RevlogGraphs from "./RevlogGraphs.svelte"
    import { defaultGraphBounds } from "./graph"
    import NoGraph from "./NoGraph.svelte"
    import DayTimings from "./DayTimings.svelte"
    import GraphCategory from "./GraphCategory.svelte"
    import Warning from "./Warning.svelte"

    const { width, height } = defaultGraphBounds()

    let interval_last = 21
    let interval_steps = 7

    $: intervals =
        ($include_suspended
            ? $data?.intervals!.intervals
            : $not_suspended_data?.intervals!.intervals) || {}
</script>

<h1>Search Stats Extended:</h1>

<div style:--graph-width={`${width}px`} style:--graph-height={`${height}px`}>
    <GraphCategory>
        <GraphContainer>
            <h1>Future Due Types</h1>
            {#if $data?.futureDue && $learn_data?.futureDue && $mature_data?.futureDue && $relearn_data?.futureDue}
                <DueBar
                    all={$data.futureDue}
                    learn={$learn_data.futureDue}
                    mature={$mature_data.futureDue}
                    relearn={$relearn_data?.futureDue}
                />
            {:else}
                <NoGraph></NoGraph>
            {/if}
            <p>
                This graph is the same as the Future Due above except it delineates between types of
                cards. <br />
                Very useful if you have learning steps greater than one day.
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Intra-day Due</h1>
            <IntraDayDueBar></IntraDayDueBar>
            <p>
                This graph shows you which hours todays cards are/were due in. <br />
                Useful if you use FSRS-5 with automatic learning steps or have long intra-day learning
                intervals.
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Today's Retention</h1>
            {#if false && $data?.trueRetention}
                <NoGraph>Placeholder</NoGraph>
            {:else}
                <OldRetentionPie></OldRetentionPie>
            {/if}
            <p>
                Retention is used to compare how many cards you got right and wrong on first
                looking.
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Custom pie</h1>
            <CustomPie />
            <p>
                This pie will show you the sum of the requested value for cards which match <code>
                    Search
                </code>
                for each search
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Review Speed Trend</h1>
            <DayTimings data={$data?.reviews} />
            <p>The average amount of time it took you to answer each card on a given day.</p>
            <p>
                Please note that this graph respects the <code>last 12 months / all history</code>
                option beneath the search bar.
            </p>
        </GraphContainer>
    </GraphCategory>
    <GraphCategory>
        <GraphContainer>
            <h1>Interval Distribution</h1>
            <IntervalGraph {intervals} bind:last={interval_last} bind:steps={interval_steps} />
            <p>
                Here you can more easily visualise the spread of your Intervals. This displays the
                same data as regular anki's "Review Intervals" graph.
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Interval {$burdenOrLoad}</h1>
            <BurdenPie {intervals} bind:last={interval_last} bind:steps={interval_steps} />
            <p>
                {#if $burdenOrLoad == "Burden"}
                    Burden
                {:else}
                    Load (sometimes referred to as burden)
                {/if}
                is 1/interval for each card and is used to estimate how many cards you see in a day.
                As an example if a card has an interval of 1 it has a {$burdenOrLoad.toLowerCase()} of
                1 because you see it every day. If a card has an interval of 2 it has a {$burdenOrLoad.toLowerCase()}
                of 0.5 et cetera.
            </p>
        </GraphContainer>
    </GraphCategory>
    <CardDataPies cardData={$card_data} />
    {#if $showRevlogStats}
        {#if $revlogs && $card_data && $data?.added}
            <RevlogGraphs
                revlogData={$revlogs}
                cardData={$card_data}
                addedCards={$data.added.added}
            />
        {:else}
            <h1>Preparing Review Stats...</h1>
        {/if}
    {:else}
        <GraphCategory>
            <div style:grid-column="1/-1">
                <GraphContainer>
                    <div class="loadOption">
                        <Warning always>
                            <h1>Review Graphs</h1>
                            These statistics can take time to prepare.
                        </Warning>
                        <button on:click={() => ($showRevlogStats = true)}>Prepare Graphs</button>
                        <span>
                            To load these graphs by default, set "confirmExpensiveStats" to false in
                            the addon config.
                        </span>
                    </div>
                </GraphContainer>
            </div>
        </GraphCategory>
    {/if}
</div>

<div
    class="tooltip"
    style:opacity={$tooltipShown ? 1 : 0}
    style:left={`${$tooltip.x}px`}
    style:top={`${$tooltip.y}px`}
>
    {#each $tooltip?.text ?? [] as text}
        <span>{text}</span>
        <br />
    {/each}
</div>

<style lang="scss">
    div.tooltip {
        position: absolute;
        opacity: 0;
        white-space: nowrap;
        padding: 15px;
        border-radius: 5px;
        font-size: 15px;
        pointer-events: none;
        transition: opacity var(--transition);
        color: var(--fg);
        background: var(--canvas-overlay);
    }

    div.loadOption {
        background-color: rgba(255, 136, 0, 0.116);
        display: flex;
        flex-direction: column;
        gap: 1em;
        min-height: 500px;

        border-radius: var(--border-radius-medium, 10px);
        margin: -1em;
        padding: 1em;

        button {
            font-size: 2em;
            font-weight: 900;
        }

        & :global(span) {
            border-radius: var(--border-radius-medium, 10px);
            padding: 0.5em;
        }
    }
</style>
