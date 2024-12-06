<script lang="ts">
    import { config } from "./stores"
    export let always = false
</script>

{#if always || $config.warnings}
    <span>
        <slot></slot>
    </span>
{/if}

<style>
    span {
        color: yellow;
        background-color: rgba(0, 0, 0, 0.5);
    }
</style>
