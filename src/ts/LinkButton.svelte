<script lang="ts">
    export let href: string | undefined = undefined
    export let onClick: undefined | (() => void) = undefined
</script>

<a {href}><button class="btn" on:click={onClick}><slot /></button></a>

<style lang="scss">
    .btn {
        margin: 0.25em;
        background-color: #0d6efd;
        &:hover {
            background-color: #0b5ed7;
            color: var(--bs-button-color);
        }
    }
</style>
