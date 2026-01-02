<script lang="ts">
    import { categoryOrder, tooltip, tooltipShown } from "./stores"
    import { defaultGraphBounds } from "./graph"
    import { i18n } from "./i18n"
    import About from "./About.svelte"
    import GraphOrder from "./GraphOrder.svelte"

    import { CATEGORIES } from "./categories"

    const { width, height } = defaultGraphBounds()
</script>

<div style:--graph-width={`${width}px`} style:--graph-height={`${height}px`}>
    <hr />
    <h1 class="header">{i18n("title-search-stats-extended")}</h1>
    <GraphOrder />
    {#each $categoryOrder as category}
        {@const { component } = CATEGORIES[category]}
        <svelte:component this={component} />
    {/each}
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
