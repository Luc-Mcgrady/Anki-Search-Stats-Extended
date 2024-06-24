<script>
    import { zero_inclusive } from "./stores"
</script>

<label>
    Zero Inclusive:
    <input type="checkbox" bind:checked={$zero_inclusive} />
</label>

<style>
    label {
        user-select: none;
    }
</style>
