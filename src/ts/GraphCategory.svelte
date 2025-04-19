<script lang="ts">
    import { shownCategories } from "./stores"

    // If falsy, Disables hide button
    export let hidden_title = ""
    export let config_name = ""

    let hidden = !SSEconfig?.categories?.[config_name]
</script>

{#if SSEconfig?.categories?.[config_name] !== "removed"}
    <label>
        <div class={`separator ${hidden ? "hidden" : ""}`}>
            {#if hidden_title}
                <button
                    class="btn"
                    on:click={() => {
                        hidden = !hidden
                        $shownCategories[config_name] = !hidden
                    }}
                >
                    &gt;
                </button>
                {#if hidden}
                    <h3>{hidden_title}...</h3>
                {/if}
            {/if}
            <hr />
        </div>
    </label>
    <div class="category">
        {#if !hidden || !hidden_title}
            <slot />
        {/if}
    </div>
{/if}

<style lang="scss">
    label {
        display: contents;
    }

    div.separator {
        display: flex;
        align-items: center;
        opacity: 0.5;
    }

    div button,
    div button:hover {
        font-weight: 900;
        font-size: xx-large;

        background: none;
        border: none;
        border-radius: none;

        transform: rotate(90deg);
        transition: transform 0.5s ease-in-out;
    }

    div.hidden button {
        transform: rotate(0deg);
    }

    span,
    button,
    hr,
    h3 {
        margin: 1rem 0.5rem;
    }

    hr {
        flex-grow: 1;
        opacity: 1;
    }

    // Copied from anki/ts/graphs/GraphsPage.svelte
    div.category {
        display: grid;
        gap: 1em;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        // required on Safari to stretch whole width
        width: calc(100vw - 3em);
        margin-left: 1em;
        margin-right: 1em;

        @media only screen and (max-width: 600px) {
            width: calc(100vw - 1rem);
            margin-left: 0.5rem;
            margin-right: 0.5rem;
        }

        @media only screen and (max-width: 1400px) {
            grid-template-columns: 1fr 1fr;
        }
        @media only screen and (max-width: 1200px) {
            grid-template-columns: 1fr;
        }
        @media only screen and (max-width: 600px) {
            font-size: 12px;
        }

        @media only print {
            // grid layout does not honor page-break-inside
            display: block;
            margin-top: 3em;
        }
    }
</style>
