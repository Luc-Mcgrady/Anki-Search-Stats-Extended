<script lang="ts">
    import { IGNORE_VERSION_URL_PARAMETER } from "./root"
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"
    import Warning from "./Warning.svelte"

    function onClick() {
        if (confirm(i18n("load-anyway-warning") + "\n\n" + i18n("load-anyway-warning2"))) {
            const url = new URL(window.location.href)
            url.searchParams.set(IGNORE_VERSION_URL_PARAMETER, "1")
            window.location.replace(url)
        }
    }
</script>

<div>
    <hr />
    <h1>{i18n("title-search-stats-extended")}</h1>
    <Warning always>
        <GraphContainer>
            <span>
                <h3>{i18n("please-restart-anki")}</h3>
                <button on:click={onClick}>{i18n("load-anyway")}</button>
            </span>
        </GraphContainer>
    </Warning>
</div>

<style lang="scss">
    div {
        margin: 1.5rem;
    }
</style>
