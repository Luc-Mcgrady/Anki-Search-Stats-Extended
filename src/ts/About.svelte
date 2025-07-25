<script lang="ts">
    import GraphCategory from "./GraphCategory.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"
    import LinkButton from "./LinkButton.svelte"
    import { openLocaleFolder } from "./search"
</script>

<GraphCategory hidden_title={i18n("about")} config_name="about">
    <GraphContainer>
        <h1>{i18n("special-thanks")}</h1>
        <ul>
            <li>{i18n("credits-llamas")}</li>
            <li>{i18n("credits-Ross-Brown")}</li>
            <li>{i18n("credits-Jonathan-Schoreels")}</li>
            <li>{i18n("credits-Huili-fox")}</li>
            <li>{i18n("credits-Jarrett-Ye")}</li>
            <li>{i18n("credits-Ishiko")}</li>
        </ul>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("translate")}</h1>
        {i18n("translate-instructions-1")}
        <code>{SSEother.available_langs}</code>
        {i18n("translate-instructions-2")}
        <LinkButton onClick={openLocaleFolder}>{i18n("translate-open-locale-folder")}</LinkButton>
        {i18n("translate-current-locale", {
            code: SSEother.lang,
        })}

        <br />
        <LinkButton
            href={`https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/new/main/locale?filename=${SSEother.lang}.ftl`}
        >
            {i18n("translate-submit-to-github")}
        </LinkButton>
        <LinkButton
            href={`https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/tree/main/locale`}
        >
            {i18n("translate-edit-existing-translations")}
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
