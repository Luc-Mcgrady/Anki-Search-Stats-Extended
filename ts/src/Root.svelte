<script lang="ts">
    import IntervalPie from "./IntervalPie.svelte";
import Title from "./Title.svelte";
    import { GraphsResponse } from "./proto/anki/stats_pb"

    let data: null | GraphsResponse = null;
    
    const oldFetch = fetch
    //@ts-ignore
    fetch = (first: string, ...args: any[]) => {
        async function handle() {
            const resp = await oldFetch(first, ...args)
            
            const blob = await resp.blob();
            const respBuf = await new Response(blob).arrayBuffer();
            const bytes = new Uint8Array(respBuf)
            data = GraphsResponse.fromBinary(bytes)

            console.log(bytes, data.toJson())

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

</script>

<Title></Title>

<div class="graphs-container">
{#if data}
    <!--{JSON.stringify(data.toJson())}-->
    <IntervalPie data={data}/>
{/if}
</div>

<style lang="scss">
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

    .spacer {
        height: 1.5em;
    }
</style>
