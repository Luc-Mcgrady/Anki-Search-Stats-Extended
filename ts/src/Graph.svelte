<dir class="container graph">
    <slot/>
</dir>

<style lang="scss">
    @use "sass/elevation" as *;
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

    .subtitle {
        text-align: center;
        margin-bottom: 1em;
    }

    // Copied from anki/ts/graphs/TitledContainer.svelte
    .container {
        width: 100%;
        background: var(--canvas-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--border-radius-medium, 10px);

        &.light {
            @include elevation(2, $opacity-boost: -0.08);
            &:hover,
            &:focus-within {
                @include elevation(3);
            }
        }
        &.dark {
            @include elevation(3, $opacity-boost: -0.08);
            &:hover,
            &:focus-within {
                @include elevation(4);
            }
        }

        padding: 1rem 1.75rem 0.75rem 1.25rem;
        &.rtl {
            padding: 1rem 1.25rem 0.75rem 1.75rem;
        }
        &:hover,
        &:focus-within {
            .help-badge {
                color: var(--fg-subtle);
            }
        }
        transition: box-shadow var(--transition) ease-in-out;
        page-break-inside: avoid;
    }
    h1 {
        border-bottom: 1px solid var(--border);
    }
    .help-badge {
        right: 0;
        bottom: 4px;
        color: var(--fg-faint);
        transition: color var(--transition) linear;
        &:hover {
            transition: none;
            color: var(--fg);
        }
        &.rtl {
            right: unset;
            left: 0;
        }
    }
</style>
