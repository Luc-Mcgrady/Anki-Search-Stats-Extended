<script lang="ts">
    let hidden = false
    // If falsy, Disables hide button
    export let hidden_title = ""
</script>

<div class="separator">
    {#if hidden_title}
        <button
            on:click={() => {
                hidden = !hidden
            }}
        >
            {">"}
        </button>
        {#if hidden}
            <h3>{hidden_title}...</h3>
        {/if}
    {/if}
    <hr />
</div>
<div class="category">
    {#if !hidden || !hidden_title}
        <slot />
    {/if}
</div>

<style lang="scss">
    div.separator {
        display: flex;
        align-items: center;
        font-weight: 900;
        font-size: xx-large;
        opacity: 0.5;
    }

    span,
    h3 {
        margin: 1rem;
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
