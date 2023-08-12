<script lang="ts">
    import _ from "lodash";
    import Bar from "./Bar.svelte";
    import type { BarDatum } from "./bar";
    import { getCardData, search, type CardData } from "./search";

    export let parentSearch: string

    const hour = 60 * 60
    const day = hour * 24

    async function fetchCards(parentSearch : string) : Promise<BarDatum[]> {
        const due_today_learn = await search(`(${parentSearch}) AND prop:due=0 AND is:learn -is:review`)
        const cards_learn = await getCardData(due_today_learn)
        const due_today_relearn = await search(`(${parentSearch}) AND prop:due=0 AND is:learn is:review`)
        const cards_relearn = await getCardData(due_today_relearn)

        const data = _.range(0, 24).map(hour=>({
            label: hour.toString(),
            values: [0, 0]
        }))

        function graph(card_data: CardData[], offset: number) {
            for (const card of card_data) {
                if (card.type == 1 || card.type == 3) {
                    const time = new Date(card.due * 1000)

                    data[time.getHours()].values[offset] += 1
                }
            }
        }

        graph(cards_relearn, 0)
        graph(cards_learn, 1)

        return data
    }
    
    $: fetch = fetchCards(parentSearch)

</script>

{#await fetch}
    Loading...
{:then data} 
    <Bar data={{
        row_labels: ["Relearning", "Learning"],
        row_colours: ["#fb6a4a", "#fd8d3c"],
        data
    }}/>    
{/await}