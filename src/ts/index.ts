import Root from "./Root.svelte"
import { patchFetch } from "./root"

declare global {
    let css: string
    let SSEconfig: SSEconfig
}

patchFetch()

setTimeout(() => new Root({ target: document.body }), SSEconfig.loadDelayMs ?? 100)

const style = document.createElement("style")
style.innerHTML = css
document.head.appendChild(style)
