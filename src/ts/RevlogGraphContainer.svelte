<script lang="ts">
    import GraphContainer from "./GraphContainer.svelte"
    import RevlogCalculator from "./RevlogCalculator.svelte"
    import { revlogStats } from "./stores"
</script>

<GraphContainer>
    <slot name="title"></slot>
    {#if $revlogStats}
        <slot></slot>
    {:else}
        <RevlogCalculator></RevlogCalculator>
    {/if}
</GraphContainer>
