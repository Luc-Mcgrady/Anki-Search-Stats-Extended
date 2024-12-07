<script lang="ts">
    export let group
</script>

<div>
    <label>
        <input type="radio" bind:group value="all" />
        All
    </label>
    <label>
        <input type="radio" bind:group value="young" />
        Young
    </label>
    <label>
        <input type="radio" bind:group value="mature" />
        Mature
    </label>
</div>
