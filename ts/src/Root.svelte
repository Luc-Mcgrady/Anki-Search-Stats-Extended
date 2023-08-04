<script lang="ts">
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

</script>

<Title></Title>

{#if data}
    {JSON.stringify(data.toJson())}
{/if}