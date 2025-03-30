<script lang="ts">
    import { day_ms } from "./revlogGraphs"
    import { scroll } from "./stores"

    export let min: number = 0
</script>

<label class="scroll">
    <span>
        {new Date(Date.now() + $scroll * day_ms).toLocaleDateString()}:
    </span>
    <span class="scroll">
        {min}
        <input type="range" {min} max={0} bind:value={$scroll} />
        0
    </span>
</label>

<style>
    label.scroll {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em 1em;
        align-items: baseline;
        width: 100%;
    }
    .scroll {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.5em 1em;
    }
</style>
