<script lang="ts">
    import Calculator from "./Calculator.svelte"
    import { revlogStats, showRevlogStats } from "./stores"

    export let calculate = () => {
        $showRevlogStats = true
    }
</script>

<Calculator {calculate} shown={!!$revlogStats}></Calculator>
