<script lang="ts">
    import _ from "lodash";
    import Bar from "./Bar.svelte";
    import type { BarDatum, ExtraRenderInput } from "./bar";
    import { getCardData, search, type CardData, getRollover } from "./search";

    export let parentSearch: string
    let rollover = 0

    const hour = 60 * 60
    const day = hour * 24

    async function fetchCards(parentSearch : string) : Promise<BarDatum[]> {
        const due_today_learn = await search(`(${parentSearch}) AND prop:due=0 AND is:learn -is:review`)
        const cards_learn = await getCardData(due_today_learn)
        const due_today_relearn = await search(`(${parentSearch}) AND prop:due=0 AND is:learn is:review`)
        const cards_relearn = await getCardData(due_today_relearn)

        rollover = await getRollover()

        const data = [..._.range(rollover, 24), ..._.range(0, rollover)].map(hour=>({
            label: hour.toString(),
            values: [0, 0]
        }))

        function graph(card_data: CardData[], offset: number) {
            for (const card of card_data) {
                if (card.type == 1 || card.type == 3) {
                    const time = new Date(card.due * 1000)

                    data[(24 + time.getHours() - rollover) % 24].values[offset] += 1
                }
            }
        }

        graph(cards_relearn, 0)
        graph(cards_learn, 1)

        return data
    }
    
    function extraRender({x,y,svg,maxValue}: ExtraRenderInput) {
        const now = new Date(Date.now())
        const lineX = 
            x(now.getHours().toFixed(0))! + // Go to the label
            (((x.bandwidth() + x.padding()) * now.getMinutes()) / 60) + // Intra day
            (x.bandwidth() / 2) // Make sure line lines up with ticks
        const bottom = y(0)
        const top = y(maxValue)
        
        const night_mode = document.body.closest(".night-mode") != null
        const colour = night_mode ? "white" : "black"

        const line = svg.append("g")
            .attr("stroke", colour)
            .attr("fill", colour)
        
        line.append("line")
            .attr("x1", lineX)
            .attr("x2", lineX)
            .attr("y1", bottom)
            .attr("y2", top)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", "50%")
        
        line.append("circle")
            .attr("r", 5)
            .attr("cx", lineX)
            .attr("cy", top)
        
        line.append("text")
            .text("Now")
            .attr("stroke-width", 0.5)
            .attr("x", lineX + 5)
            .attr("y", top)
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
    }}
    {extraRender}
    />    
{/await}