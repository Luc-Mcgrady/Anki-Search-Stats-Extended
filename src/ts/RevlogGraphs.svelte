<script lang="ts">
    import { revlogStats, last_forget } from "./stores"
    import TimeDistributionCategory from "./categories/TimeDistributionCategory.svelte"
    import IntroducedCategory from "./categories/IntroducedCategory.svelte"
    import RatingsCategory from "./categories/RatingsCategory.svelte"
    import LoadTrendCategory from "./categories/LoadTrendCategory.svelte"
    import FSRSCategory from "./categories/FSRSCategory.svelte"
    import TimeMachineCategory from "./categories/TimeMachineCategory.svelte"
    import BadGraphCategory from "./categories/BadGraphCategory.svelte"

    export let addedCards: Record<number, number>

    $: $last_forget = $revlogStats?.last_forget ?? null
</script>

<TimeDistributionCategory />
<IntroducedCategory />
<RatingsCategory />
<LoadTrendCategory />
<FSRSCategory />
<TimeMachineCategory {addedCards} />
<BadGraphCategory />
