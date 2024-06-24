<script>
    import { zero_inclusive } from "./stores"
</script>

<label>
    <input type="checkbox" bind:checked={$zero_inclusive} />
    Zero Inclusive
</label>

<style>
    label {
        user-select: none;
    }
</style>
