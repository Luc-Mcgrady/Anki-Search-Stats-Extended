<script lang="ts">
    import type { Buckets } from "./revlogGraphs"

    export let group: keyof Buckets<unknown>
</script>

<div>
    <label>
        <input type="radio" bind:group value="all" />
        All
    </label>
    <label>
        <input type="radio" bind:group value="young" />
        Young+Mature
    </label>
    <label>
        <input type="radio" bind:group value="mature" />
        Mature
    </label>
</div>
