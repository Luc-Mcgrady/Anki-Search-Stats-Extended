<script lang="ts">
    import GraphCategory from "./GraphCategory.svelte"
    import GraphContainer from "./GraphContainer.svelte"
    import { i18n } from "./i18n"

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
        Search Stats Extended is currently has localisations for
        <code>{currently_translated}</code>
        If you want to translate this addon
        <br />
        Make a file for your language ({SSEother.lang}) in
        <code>
            {`(Addon menu -> Search Stats Extended -> View Files)/locale/${SSEother.lang}.ftl`}
        </code>
        Copy in the original translations from
        <code>en_GB.ftl</code>
        translate it and create a pull request on github!
        <br />
        <a
            href={`https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/new/main/locale?filename=${SSEother.lang}.ftl`}
        >
            <button class="btn">Submit to github</button>
        </a>
        <a href="https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/tree/main/locale">
            <button class="btn">Edit existing translations</button>
        </a>
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("support")}</h1>
        Be sure to leave a thumbs up on AnkiWeb and to star on Github
    </GraphContainer>
    <GraphContainer>
        <h1>{i18n("config")}</h1>
        You can find more options to customise your experience in the config Try
    </GraphContainer>
</GraphCategory>

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
