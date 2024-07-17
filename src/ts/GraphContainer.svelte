<dir class="container graph">
    <slot />
</dir>

<style lang="scss">
    @use "../../anki/sass/elevation" as *;
    // Copied from anki/ts/graphs/Graph.svelte
    .graph {
        /* See graph-styles.ts for constants referencing global styles */

        // OMITTED GLOBAL DEFINITIONS FOR DUPLICATION REASONS

        /* Customizing the standard x and y tick markers and text on the graphs.
         * The `tick` class is automatically added by d3. */
        &:focus {
            outline: 0;
        }
    }

    // Copied from anki/ts/graphs/TitledContainer.svelte
    .container {
        width: 100%;
        background: var(--canvas-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--border-radius-medium, 10px);

        transition: box-shadow var(--transition) ease-in-out;
        page-break-inside: avoid;
        padding: 1em;

        display: flex;
        flex-direction: column;
        align-content: center;
        overflow: hidden;
    }

    .graph :global(p) {
        font-size: small;
        margin-top: 1em;
    }

    .graph :global(h1) {
        border-bottom: 1px var(--border) solid;
        padding-bottom: 0.25em;
    }
</style>
