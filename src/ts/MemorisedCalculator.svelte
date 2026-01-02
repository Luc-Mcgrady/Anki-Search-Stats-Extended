<script lang="ts">
    import Calculator from "./Calculator.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import { catchErrors } from "./search"
    import { card_data, last_forget, memorised_stats, revlogs, searchLimit } from "./stores"

    export let calculate = () => {
        if ($revlogs && $card_data) {
            $memorised_stats = catchErrors(() =>
                getMemorisedDays(
                    $revlogs,
                    $card_data,
                    SSEother.deck_configs,
                    SSEother.deck_config_ids,
                    $last_forget ?? undefined,
                    2,
                    2
                )
            )
        }
    }
</script>

<Calculator {calculate} shown={!!$memorised_stats}></Calculator>
