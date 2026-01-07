<script lang="ts">
    import Calculator from "./Calculator.svelte"
    import { showFsrsStats, showRevlogStats } from "./stores"

    export let calculate = () => {
        $showRevlogStats = true
        $showFsrsStats = true
    }
</script>

<Calculator {calculate} shown={$showFsrsStats && $showRevlogStats} badIfTruncated></Calculator>
