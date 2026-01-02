<script lang="ts">
    import { CATEGORIES } from "./categories"
    import GraphCategory from "./GraphCategory.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"
    import { shownCategories } from "./stores"

    let category_order = Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]
    let current_hover = -1

    function swap(index1: number, index2: number) {
        category_order = [...category_order]
        ;[category_order[index2], category_order[index1]] = [
            category_order[index1],
            category_order[index2],
        ]

        console.log(category_order)
    }

    function toggle_hidden(id: string) {
        $shownCategories[id] = $shownCategories[id] == "removed" ? true : "removed"
    }
</script>

<GraphCategory hidden_title={i18n("graph-order")}>
    <GraphContainer>
        <h1>{i18n("graph-order")}</h1>
        <div class="list">
            {#each category_order as category_id, i}
                {@const { title } = CATEGORIES[category_id]}
                {@const removed = $shownCategories[category_id] == "removed"}
                <div
                    role="listitem"
                    class="item"
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
                    <div>
                        <button on:click={() => toggle_hidden(category_id)}>
                            {i18n(removed ? "show" : "hide")}
                        </button>
                    </div>
                </div>
            {/each}
        </div>
        {i18n("graph-order-help")}
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
</style>
