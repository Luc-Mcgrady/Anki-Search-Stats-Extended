<script lang="ts">
    import GraphCategory from "./GraphCategory.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"
    import LinkButton from "./LinkButton.svelte"

    let currently_translated = ["en-GB", "zh_CN"]
</script>

<GraphCategory hidden_title={i18n("fluff-and-credits")} config_name="fluff">
    <GraphContainer>
        <h1>{i18n("credits")}</h1>
        Special thanks to:

        <ul>
            <li>{i18n("credits-llamas")}</li>
            <li>Ross Brown: {i18n("sxr-heatmap")}</li>
            <li>{i18n("credits-Jonathan-Schoreels")}</li>
            <li>{i18n("credits-Huili-fox")}</li>
            <li>{i18n("credits-Jarrett-Ye")}</li>
            <li>{i18n("credits-Ishiko")}</li>
        </ul>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("translate")}</h1>
        <span style:white-space="pre">
            {i18n("translate-instructions", {
                lang: SSEother.lang,
                list: currently_translated.toString(),
            })}
        </span>
        <br />
        <LinkButton
            href={`https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/new/main/locale?filename=${SSEother.lang}.ftl`}
        >
            Submit to github
        </LinkButton>
        <LinkButton
            href={`https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/tree/main/locale`}
        >
            Edit existing translations
        </LinkButton>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("support")}</h1>
        <LinkButton href="https://ankiweb.net/shared/info/1613056169">
            {i18n("like-on-ankiweb")}
        </LinkButton>
        <LinkButton href="https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended">
            {i18n("star-on-github")}
        </LinkButton>
        <br />
        <LinkButton href="https://github.com/sponsors/Luc-Mcgrady">
            {i18n("sponsor-on-github")}
        </LinkButton>
        <LinkButton href="https://ko-fi.com/lucmcgrady">{i18n("buy-me-a-coffee")}</LinkButton>
    </GraphContainer>
</GraphCategory>
