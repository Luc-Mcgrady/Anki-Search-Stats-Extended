import { FluentBundle, FluentResource, type FluentVariable } from "@fluent/bundle"

const locale = new FluentResource(SSEother.lang_ftl)
const fallback = new FluentResource(SSEother.fallback_ftl)

const bundle = new FluentBundle(SSEother.lang)
bundle.addResource(locale)
bundle.addResource(fallback, { allowOverrides: false })

console.log(bundle)
console.log(SSEother)

export function i18n(message: string, args?: Record<string, FluentVariable>) {
    return bundle.formatPattern(bundle.getMessage(message)?.value || message, args)
}
