<script lang="ts">
    import GraphCategory from "./GraphCategory.svelte"
    import MemorisedCalculator from "./MemorisedCalculator.svelte"
    import { memorised_stats } from "./stores"
</script>

<GraphCategory>
    <slot name="title"></slot>
    {#if $memorised_stats}
        <slot></slot>
    {:else}
        <MemorisedCalculator></MemorisedCalculator>
    {/if}
</GraphCategory>
