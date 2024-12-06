<script lang="ts">
    import { config } from "./stores"
</script>

{#if $config.warnings}
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
