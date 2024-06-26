<script lang="ts">
    import DueBar from "./DueBar.svelte"
    import BurdenPie from "./BurdenPie.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import IntervalPie from "./IntervalPie.svelte"
    import RetentionPie from "./RetentionPie.svelte"
    import CustomPie from "./CustomPie.svelte"
    import IntraDayDueBar from "./IntraDayDueBar.svelte"
    import { patchFetch } from "./root"
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
    } from "./stores"
    import CardDataPies from "./CardDataPies.svelte"
    import _ from "lodash"

    let interval_last = 21
    let interval_steps = 7

    $: intervals =
        ($include_suspended
            ? $data?.intervals!.intervals
            : $not_suspended_data?.intervals!.intervals) || {}
</script>

<h1>Search Stats Extended:</h1>

<div class="graphs-container">
    {#if $data}
        {#if $data.futureDue && $learn_data?.futureDue && $mature_data?.futureDue && $relearn_data?.futureDue}
            <GraphContainer>
                <h1>Future Due Types</h1>
                <DueBar
                    all={$data.futureDue}
                    learn={$learn_data.futureDue}
                    mature={$mature_data.futureDue}
                    relearn={$relearn_data?.futureDue}
                />
                <p>
                    This graph is the same as the Future Due above except it delineates between
                    types of cards. <br />
                    Very useful if you have learning steps greater than one day.
                </p>
            </GraphContainer>
        {/if}
        {#if $searchString !== null}
            <GraphContainer>
                <h1>Intra-day Due</h1>
                <IntraDayDueBar parentSearch={$searchString}></IntraDayDueBar>
                <p>
                    This graph shows you which hours todays cards are/were due in. <br />
                    Useful if you have long intra-day learning intervals.
                </p>
            </GraphContainer>
            <GraphContainer>
                <h1>Today's Retention</h1>
                <RetentionPie search={$searchString}></RetentionPie>
                <p>
                    Retention is used to compare how many cards you got right and wrong on first
                    looking.
                </p>
            </GraphContainer>
            <GraphContainer>
                <h1>Custom pie</h1>
                <CustomPie search={$searchString} />
                <p>
                    This pie will show you the sum of the requested value for cards which match <code
                    >
                        Search
                    </code>
                    for each search
                </p>
            </GraphContainer>
        {/if}
        <GraphContainer>
            <h1>Interval Distribution</h1>
            <IntervalPie {intervals} bind:last={interval_last} bind:steps={interval_steps} />
            <p>Here you can more easily visualise the spread of your intervals</p>
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
    {/if}
    {#if $card_data}
        <CardDataPies cardData={$card_data} />
    {/if}
</div>

<style lang="scss">
    p {
        font-size: small;
        margin-top: 1em;
    }

    h1 {
        border-bottom: 1px var(--border) solid;
    }

    // Copied from anki/ts/graphs/GraphsPage.svelte
    .graphs-container {
        display: grid;
        gap: 1em;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        // required on Safari to stretch whole width
        width: calc(100vw - 3em);
        margin-left: 1em;
        margin-right: 1em;

        @media only screen and (max-width: 600px) {
            width: calc(100vw - 1rem);
            margin-left: 0.5rem;
            margin-right: 0.5rem;
        }

        @media only screen and (max-width: 1400px) {
            grid-template-columns: 1fr 1fr;
        }
        @media only screen and (max-width: 1200px) {
            grid-template-columns: 1fr;
        }
        @media only screen and (max-width: 600px) {
            font-size: 12px;
        }

        @media only print {
            // grid layout does not honor page-break-inside
            display: block;
            margin-top: 3em;
        }
    }
</style>
