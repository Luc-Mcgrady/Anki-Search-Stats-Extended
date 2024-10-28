<script lang="ts"></script>

<div>
    <slot>NO DATA</slot>
</div>

<style>
    div {
        width: min(var(--graph-width), 100%);
        height: var(--graph-height);

        opacity: 0.5;

        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
