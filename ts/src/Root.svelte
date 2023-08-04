<script lang="ts">
    import Title from "./Title.svelte";
    import { GraphsRequest } from "./proto/anki/stats_pb"

    let data: null | GraphsRequest = null;
    
    const oldfetch = fetch
    //@ts-ignore
    fetch = (first: string, ...args: any[]) => {

            async function handle() {
                const resp = await oldfetch(first, ...args)
                
                const reader = await resp.body!.getReader().read()
                const bytes = reader.value!
                data = GraphsRequest.fromBinary(bytes)

                console.log(bytes, data.toJson())

                return resp
            }
            console.log(first)
            if (first == "/_anki/graphs") {
                handle()
            }
            return oldfetch(first, ...args)
        }

</script>

<Title></Title>

{#if data}
    {JSON.stringify(data.toJson())}
{/if}