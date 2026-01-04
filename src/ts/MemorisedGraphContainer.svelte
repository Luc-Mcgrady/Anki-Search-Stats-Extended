<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import MemorisedCalculator from "./MemorisedCalculator.svelte"
    import { memorised_stats } from "./stores"
</script>

<GraphContainer>
    <slot name="title"></slot>
    {#if $memorised_stats}
        <slot></slot>
    {:else}
        <MemorisedCalculator></MemorisedCalculator>
    {/if}
</GraphContainer>
