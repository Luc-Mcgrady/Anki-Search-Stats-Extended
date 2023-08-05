<script lang="ts">
    import { GraphsResponse } from "./proto/anki/stats_pb";
    import Graph from "./Graph.svelte"

    export let data: GraphsResponse

    const intervals = data.intervals
</script>

<Graph>
    <h1>Interval pie</h1>
</Graph>