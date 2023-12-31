<script lang="ts">
    import DueBar from "./DueBar.svelte";
    import BurdenPie from "./BurdenPie.svelte";
    import GraphContainer from "./GraphContainer.svelte";
    import IntervalPie from "./IntervalPie.svelte";
    import { GraphsResponse } from "./proto/anki/stats_pb"
    import { fetchAndDecode, bodySwap, decodeRequest, realFetch } from "./root";
    import { SearchRequest } from "./proto/anki/search_pb";
    import RetentionPie from "./RetentionPie.svelte";
    import CustomPie from "./CustomPie.svelte";
    import IntraDayDueBar from "./IntraDayDueBar.svelte";

    let search: null | SearchRequest = null

    $: searchString = search?.search

    let data: null | GraphsResponse = null;
    let mature_data: null | GraphsResponse = null;
    let learn_data: null | GraphsResponse = null;
    let relearn_data: null | GraphsResponse = null;
    
    //@ts-ignore
    fetch = (req: string, headers: Record<string, any>) => {
        async function handle() {
            const origBody = headers.body

            function fetchSwappedSearch(criteria: string) {
                headers.body = bodySwap(origBody, criteria)
                return fetchAndDecode(realFetch(req, headers)) // swapSearch(req, "$1 AND prop:ivl>=21")
            }

            search = decodeRequest(origBody)

            data = await fetchAndDecode(realFetch(req, headers)) // I feel like theres a better way of doing this than tripping the amount of processing needed
            mature_data = await fetchSwappedSearch("prop:ivl>=21")
            learn_data = await fetchSwappedSearch("is:learn")
            relearn_data = await fetchSwappedSearch("is:learn is:review")

            
            
            headers.body = origBody

        }
        if (req == "/_anki/graphs") {

            data = null
            mature_data = null
            learn_data = null
            relearn_data = null

            handle()
        }
        return realFetch(req, headers)
    }

    fetch("/_anki/graphs", {
        "body": "\n\fdeck:current\u0010í\u0002",
        "method": "POST",
    });

    $: intervals = data?.intervals!.intervals || {}
</script>

<h1>Search Stats Extended:</h1>

<div class="graphs-container">
{#if data}
    {#if data.futureDue && learn_data?.futureDue && mature_data?.futureDue && relearn_data?.futureDue}
        <GraphContainer>
            <h1>Future Due Types</h1>
            <DueBar all={data.futureDue} learn={learn_data.futureDue} mature={mature_data.futureDue} relearn={relearn_data?.futureDue}/>
            <p>
                This graph is the same as the Future Due above except it delineates between types of cards. <br>
                Very useful if you have learning steps greater than one day.
            </p>        
        </GraphContainer>
    {/if}
    {#if searchString}
        <GraphContainer>
            <h1>Intra-day Due</h1>
            <IntraDayDueBar parentSearch={searchString}></IntraDayDueBar>
            <p>
                This graph shows you which hours todays cards are/were due in. <br>
                Useful if you have long intra-day learning intervals.
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Today's Retention</h1>
            <RetentionPie search={searchString}></RetentionPie>
            <p>
                Retention is used to compare how many cards you got right and wrong on first looking.
            </p>
        </GraphContainer>
        <GraphContainer>
            <h1>Custom pie</h1>
            <CustomPie search={searchString}/>
            <p>
                This pie will show you the number of cards which match <code>Search</code> for each search
            </p>
        </GraphContainer>
    {/if}
    <GraphContainer>
        <h1>Interval Distribution</h1>
        <IntervalPie {intervals}/>
        <p>
            Here you can more easily visualise the spread of your intervals
        </p>   
    </GraphContainer>
    <GraphContainer>
        <h1>Burden Distribution</h1>
        <BurdenPie {intervals}/>
        <p>
            Burden is 1/interval for each card and is used to estimate how many cards you see in a day<br>
            as an example if a card has an interval of 1 it has a burden of 1 because you see it every day.<br>
            If a card has an interval of 2 it has a burden of 0.5 et cetera.
        </p>        
    </GraphContainer>

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
