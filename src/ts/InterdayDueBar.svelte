<script lang="ts">
    import _ from "lodash";
    import Bar from "./Bar.svelte";
    import type { BarDatum } from "./bar";
    import { getCardData, search } from "./search";

    export let parentSearch: string

    const hour = 1000 * 60 * 60
    const day = hour * 24

    async function fetchCards(parentSearch : string) {
        const due_today = await search(`(${parentSearch}) AND prop:due=0 AND is:learn`)
        const cards = await getCardData(due_today)

        const now = Date.now()

        const data = _.range(0, 24).map(hour=>({
            label: hour.toString(),
            values: [0, 0]
        }))

        for (const card of cards) {
            const timestamp = card.due_date % day
            const card_hour = Math.floor(timestamp / hour)

            data[card_hour].values[0] += 1
        }

        return data
    }
    
    $: fetch = fetchCards(parentSearch)

</script>

{#await fetch}
    Loading...
{:then data} 
    <Bar data={{
        row_labels: ["Learning","Relearning"],
        row_colours: ["#fd8d3c", "#fb6a4a"],
        data
    }}/>    
{/await}