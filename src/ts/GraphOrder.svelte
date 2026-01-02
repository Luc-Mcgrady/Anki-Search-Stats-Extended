<script lang="ts">
    import { CATEGORIES } from "./categories"
    import GraphCategory from "./GraphCategory.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"
    import { categoryOrder, confirmExpensiveStats, shownCategories } from "./stores"
    import Warning from "./Warning.svelte"

    let current_hover = -1

    function swap(index1: number, index2: number) {
        $categoryOrder = [...$categoryOrder]
        ;[$categoryOrder[index2], $categoryOrder[index1]] = [
            $categoryOrder[index1],
            $categoryOrder[index2],
        ]

        console.log($categoryOrder)
    }

    function toggle_hidden(id: string) {
        $shownCategories[id] = $shownCategories[id] == "removed" ? true : "removed"
    }

    let autoExpensiveStats = !$confirmExpensiveStats
    $: $confirmExpensiveStats = autoExpensiveStats
</script>

<GraphCategory hidden_title={i18n("graph-order")}>
    <GraphContainer>
        <h1>{i18n("graph-order")}</h1>
        <div class="list">
            {#each $categoryOrder as category_id, i}
                {@const { title } = CATEGORIES[category_id]}
                {@const removed = $shownCategories[category_id] == "removed"}
                <div
                    role="listitem"
                    class={"item" + (removed ? " removed" : "")}
                    draggable="true"
                    on:dragend={() => {
                        swap(i, current_hover)
                    }}
                    on:dragover={() => {
                        current_hover = i
                    }}
                >
                    <div>
                        {i18n(title)}
                    </div>
                    <button on:click={() => toggle_hidden(category_id)}>
                        {i18n(removed ? "show" : "hide")}
                    </button>
                </div>
            {/each}
        </div>
        {i18n("graph-order-help")}
        <div>
            <label>
                <input type="checkbox" bind:checked={autoExpensiveStats} />
                {i18n("auto-load-revlogs")}
            </label>
            {#if autoExpensiveStats}
                <Warning>
                    {i18n("auto-load-revlogs-warning")}
                </Warning>
            {/if}
        </div>
        <div>
            <label>
                <input type="checkbox" />
                {i18n("auto-load-memorised")}
            </label>
            {#if autoExpensiveStats}
                <Warning>
                    {i18n("auto-load-revlogs-warning")}
                </Warning>
            {/if}
        </div>
    </GraphContainer>
</GraphCategory>

<style lang="scss">
    .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        padding: 0.25em;

        &:hover {
            background-color: var(--highlight-bg);
        }
    }

    .list {
        display: flex;
        flex-direction: column;
        padding: 0.25em;
        background-color: var(--canvas-inset);
    }

    .removed {
        color: var(--fg-disabled);
    }
</style>
