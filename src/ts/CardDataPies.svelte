<script lang="ts">
    import { catchErrors, type CardData } from "./search"
    import { data, target_R_days as target_R_days_values } from "./stores"
    import { calculateCardDataPies } from "./CardDataPies"
    import LapseCategory from "./categories/LapseCategory.svelte"
    import RepetitionCategory from "./categories/RepetitionCategory.svelte"

    export let cardData: CardData[] | null

    $: ({ target_R_days } = catchErrors(() => calculateCardDataPies(cardData ?? [], true, true)))
    $: $target_R_days_values = $data ? target_R_days : []
</script>

<LapseCategory {cardData} />
<RepetitionCategory {cardData} />
