<script lang="ts">
    import type { Buckets } from "./revlogGraphs"

    export let group: keyof Buckets<unknown>
</script>

<div>
    <label>
        <input type="radio" bind:group value="learn" />
        Learn
    </label>
    <label>
        <input type="radio" bind:group value="young" />
        Young
    </label>
    <label>
        <input type="radio" bind:group value="mature" />
        Mature
    </label>
    <label>
        <input type="radio" bind:group value="not_learn" />
        Young+Mature
    </label>
    <label>
        <input type="radio" bind:group value="all" />
        All
    </label>
</div>
