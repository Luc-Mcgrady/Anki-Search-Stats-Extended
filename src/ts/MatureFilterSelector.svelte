<script lang="ts">
    import { i18n } from "./i18n"
    import type { Buckets } from "./revlogGraphs"

    export let group: keyof Buckets<unknown>
</script>

<div>
    <label>
        <input type="radio" bind:group value="learn" />
        {i18n("learn")}
    </label>
    <label>
        <input type="radio" bind:group value="young" />
        {i18n("young")}
    </label>
    <label>
        <input type="radio" bind:group value="mature" />
        {i18n("mature")}
    </label>
    <label>
        <input type="radio" bind:group value="not_learn" />
        {i18n("young-and-mature")}
    </label>
    <label>
        <input type="radio" bind:group value="all" />
        {i18n("all")}
    </label>
</div>
