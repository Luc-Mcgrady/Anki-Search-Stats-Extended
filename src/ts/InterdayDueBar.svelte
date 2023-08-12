<script lang="ts">
    import Bar from "./Bar.svelte";
    import { getCardData, search } from "./search";

    export let parentSearch: string

    async function fetchCards() {
        const due_today = await search(`(${parentSearch}) AND prop:due=0`)
        const cards = await getCardData(due_today)
        return JSON.stringify(cards)
    }
    
</script>

<Bar data={{
    row_labels: ["Learning","Relearning"],
    row_colours: ["#fd8d3c", "#fb6a4a"],
    data: []
}}/>

{#await fetchCards()}
    Loading...
{:then cards} 
    {cards}
{/await}