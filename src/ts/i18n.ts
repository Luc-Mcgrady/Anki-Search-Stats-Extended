import { FluentBundle, FluentResource, type FluentVariable } from "@fluent/bundle"

let en = `
hello = Hello world
english = Yet to be translated
search-stats-extended-i18n = 
`
let zh = `
hello = 你好世界
search-stats-extended-i18n = （扩展搜索统计信息）
`

const locale = new FluentResource(zh)
const fallback = new FluentResource(en)

console.log(SSEother.locale)
const bundle = new FluentBundle(["zh", "en"])
bundle.addResource(locale)
bundle.addResource(fallback, { allowOverrides: false })

export function i18n(message: string, args?: Record<string, FluentVariable>) {
    return bundle.formatPattern(bundle.getMessage(message)?.value || "Error", args)
}
