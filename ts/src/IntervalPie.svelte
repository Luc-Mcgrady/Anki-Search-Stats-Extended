<script lang="ts">
    import { GraphsResponse } from "./proto/anki/stats_pb";
    import Graph from "./Graph.svelte"
    import Pie from "./Pie.svelte"
    import type {PieDatum} from "./pie"
    import { defaultGraphBounds } from "./graph";
    
    export let data: GraphsResponse

    const bounds = defaultGraphBounds()
    
    const intervals = data.intervals

    const pie_data : PieDatum[] = [{
        label: "test1",
        value: 10,
        colour: "red"
    },
    {
        label: "test2",
        value: 40,
        colour: "green"
    }] 
</script>

<Graph>
    <h1>Interval pie</h1>
    <hr/>
    <Pie data={pie_data}></Pie>
</Graph>