<script lang="ts">
    import BurdenPie from "./BurdenPie.svelte";
    import GraphContainer from "./GraphContainer.svelte";
    import IntervalPie from "./IntervalPie.svelte";
    import { GraphsResponse } from "./proto/anki/stats_pb"
    import { DecodeResponse } from "./root";

    let data: null | GraphsResponse = null;
    const utf8Encode = new TextEncoder();
    
    const oldFetch = fetch
    //@ts-ignore
    fetch = (first: string, ...args: any[]) => {
        async function handle() {
            const resp = await oldFetch(first, ...args)
            data = await DecodeResponse(resp)

            return resp
        }
        console.log(first)
        if (first == "/_anki/graphs") {
            handle()
        }
        return oldFetch(first, ...args)
    }

    fetch("/_anki/graphs", {
        "body": "\n\fdeck:current\u0010í\u0002",
        "method": "POST",
    });

    $: intervals = data?.intervals!.intervals || {}
</script>

<h1>New Graphs Plus:</h1>

<div class="graphs-container">
{#if data}
    <!--{JSON.stringify(data.toJson())}-->
    <GraphContainer>
        <h1>Interval Distribution</h1>
        <hr/>
        <IntervalPie {intervals}/>
        <p>
            Here you can more easily visualise the spread of your intervals
        </p>   
    </GraphContainer>
    <GraphContainer>
        <h1>Burden Distribution</h1>
        <hr/>
        <BurdenPie {intervals}/>
        <p>
            Burden is 1/interval for each card and is used to estimate how many cards you see in a day<br>
            as an example if a card has an interval of 1 it has a burden of 1 because you see it every day.<br>
            If a card has an interval of 2 it has a burden of 0.5 etcetera.
        </p>        
    </GraphContainer>
{/if}
</div>

<style lang="scss">

    p {
        font-size: small;
        margin-top: 1em;
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
