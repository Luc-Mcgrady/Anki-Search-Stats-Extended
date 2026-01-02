<script lang="ts">
    import { data, tooltip, tooltipShown, card_data } from "./stores"
    import CardDataPies from "./CardDataPies.svelte"
    import RevlogGraphs from "./RevlogGraphs.svelte"
    import { defaultGraphBounds } from "./graph"
    import { i18n } from "./i18n"
    import About from "./About.svelte"
    import FutureDueCategory from "./categories/FutureDueCategory.svelte"
    import MiscCategory from "./categories/MiscCategory.svelte"
    import IntervalDistributionCategory from "./categories/IntervalDistributionCategory.svelte"
    import GraphOrder from "./GraphOrder.svelte"

    const { width, height } = defaultGraphBounds()
</script>

<div style:--graph-width={`${width}px`} style:--graph-height={`${height}px`}>
    <hr />
    <h1 class="header">{i18n("title-search-stats-extended")}</h1>
    <GraphOrder />
    <FutureDueCategory />
    <MiscCategory />
    <IntervalDistributionCategory />
    <CardDataPies cardData={$card_data} />
    {#if $data?.added}
        <RevlogGraphs addedCards={$data.added.added} />
    {:else}
        <h1 class="header">{i18n("preparing-review-stats")}</h1>
    {/if}
    <About></About>
</div>

<div
    class="tooltip"
    style:opacity={$tooltipShown ? 1 : 0}
    style:left={`${$tooltip.x}px`}
    style:top={`${$tooltip.y}px`}
>
    {#each $tooltip?.text ?? [] as text}
        <span>{text}</span>
        <br />
    {/each}
</div>

<style lang="scss">
    h1.header {
        margin: 1.5rem;
    }

    div.tooltip {
        position: absolute;
        opacity: 0;
        white-space: nowrap;
        padding: 15px;
        border-radius: 5px;
        font-size: 15px;
        pointer-events: none;
        transition: opacity var(--transition);
        color: var(--fg);
        background: var(--canvas-overlay);
    }

    div.loadOption {
        background-color: rgba(255, 136, 0, 0.116);
        display: flex;
        flex-direction: column;
        gap: 1em;
        min-height: 500px;

        border-radius: var(--border-radius-medium, 10px);
        margin: -1em;
        padding: 1em;

        button {
            font-size: 2em;
            font-weight: 900;
        }

        & :global(span) {
            border-radius: var(--border-radius-medium, 10px);
            padding: 0.5em;
        }
    }

    :global(.hover-bar) {
        fill: white;
        opacity: 0;

        &:hover {
            opacity: 0.1;
        }
    }
</style>
