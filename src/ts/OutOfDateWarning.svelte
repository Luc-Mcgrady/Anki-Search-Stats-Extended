<script lang="ts">
    import { IGNORE_VERSION_URL_PARAMETER } from "."
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"
    import Warning from "./Warning.svelte"

    function onClick() {
        const url = new URL(window.location.href)
        url.searchParams.set(IGNORE_VERSION_URL_PARAMETER, "1")
        window.location.replace(url)
    }
</script>

<h1>{i18n("search-stats-extended")}</h1>
<GraphContainer>
    <Warning always>
        {i18n("out-of-date-warning")}
        <button on:click={onClick}>{i18n("load-anyway")}</button>
    </Warning>
</GraphContainer>
