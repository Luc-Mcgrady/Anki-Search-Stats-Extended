import { FluentBundle, FluentResource, type FluentVariable } from "@fluent/bundle"

const locale = new FluentResource(SSEother.lang_ftl)
const fallback = new FluentResource(SSEother.fallback_ftl)

export const i18n_bundle = new FluentBundle(SSEother.lang.replace("_", "-"))
i18n_bundle.addResource(locale)
i18n_bundle.addResource(fallback, { allowOverrides: false })

export function i18n(message: string, args?: Record<string, FluentVariable>) {
    // return "translated"
    // return message
    return i18n_bundle.formatPattern(i18n_bundle.getMessage(message)?.value || message, args)
}

export function i18n_pattern(pattern: string) {
    return i18n_bundle.getMessage(pattern)?.value || pattern
}
