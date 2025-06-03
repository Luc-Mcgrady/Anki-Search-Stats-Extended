<script lang="ts">
    import _ from "lodash"
    import Bar from "./Bar.svelte"
    import { barHourLabeler, type BarChart, type BarDatum, type ExtraRenderInput } from "./bar"
    import { getCardData, search, type CardData } from "./search"
    import { searchJoin } from "./root"
    import { other, searchString } from "./stores"
    import NoGraph from "./NoGraph.svelte"
    import { i18n } from "./i18n"
    import { LEARN_COLOUR, RELEARN_COLOUR } from "./graph"

    let next_card_time: Date | null = null
    let next_card_time_until: string = ""

    async function fetchCards(parentSearch: string): Promise<BarDatum[]> {
        const due_today_learn = await search(
            searchJoin(parentSearch, "prop:due=0 is:learn -is:review")
        )
        const cards_learn = await getCardData(due_today_learn)
        const due_today_relearn = await search(
            searchJoin(parentSearch, "prop:due=0 is:learn is:review")
        )
        const cards_relearn = await getCardData(due_today_relearn)

        const { learn_ahead_secs, rollover } = $other

        const data = [..._.range(rollover, 24), ..._.range(0, rollover)].map((hour) => ({
            label: hour.toString(),
            values: [0, 0],
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

        const remaining = [...cards_learn, ...cards_relearn]
            .map((card) => card.due - learn_ahead_secs)
            .filter((due) => 1000 * due > Date.now())
        const next_card = _.min(remaining)

        if (next_card) {
            next_card_time = new Date(next_card * 1000)

            const time_until = (next_card_time.getTime() - Date.now()) / (60 * 1000) // minutes

            const hours = Math.floor(time_until / 60)
            const minutes = Math.ceil(time_until % 60)

            next_card_time_until = i18n("next-card-at", {
                hours,
                minutes,
                time: next_card_time.toLocaleTimeString(),
            })
        } else {
            next_card_time = null
        }

        return data
    }

    function extraRender({ x, y, svg, maxValue }: ExtraRenderInput<BarChart>) {
        const now = new Date(Date.now())
        const lineX =
            x(now.getHours().toFixed(0))! + // Go to the label
            ((x.bandwidth() + x.padding()) * now.getMinutes()) / 60 + // Intra hour
            x.bandwidth() / 2 // Make sure line lines up with ticks
        const bottom = y(0)
        const top = y(maxValue)

        const night_mode = document.body.closest(".night-mode") != null
        const colour = night_mode ? "white" : "black"

        const line = svg.append("g").attr("stroke", colour).attr("fill", colour)

        line.append("line")
            .attr("x1", lineX)
            .attr("x2", lineX)
            .attr("y1", bottom)
            .attr("y2", top)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", "50%")

        line.append("circle").attr("r", 5).attr("cx", lineX).attr("cy", top)

        line.append("text")
            .text("Now")
            .attr("stroke-width", 0.5)
            .attr("x", lineX + 5)
            .attr("y", top)
    }

    $: fetch = $searchString !== null ? fetchCards($searchString) : Promise.resolve([])
</script>

{#await fetch}
    <NoGraph>{i18n("loading")}</NoGraph>
{:then data}
    {#if data.reduce((p, n) => p + _.sum(n.values), 0) > 0}
        <!--If there is data-->
        {#if next_card_time}
            <!--If there is a future card-->
            <h4>
                {next_card_time_until}
            </h4>
        {/if}
        <Bar
            data={{
                row_labels: [i18n("relearning-count"), i18n("learning-count")],
                row_colours: [RELEARN_COLOUR, LEARN_COLOUR],
                data,
                columnLabeler: barHourLabeler,
            }}
            {extraRender}
        />
    {:else}
        <NoGraph>NO REVIEWS</NoGraph>
    {/if}
{/await}
