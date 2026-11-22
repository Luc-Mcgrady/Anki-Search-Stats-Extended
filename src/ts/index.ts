import { mount } from "svelte"
import OutOfDateWarning from "./OutOfDateWarning.svelte"
import Root from "./Root.svelte"
import type { SSEconfig, SSEother } from "./config"
import { patchFetch } from "./root"
import { catchErrors } from "./search"
import { config, other } from "./stores"

declare global {
    let css: string
    let SSEconfig: SSEconfig
    let SSEother: SSEother

    interface Window {
        bridgeCommand: (string: string) => void
    }
}

// For Qt5
// @ts-ignore
if (!String.prototype.replaceAll) {
    // @ts-ignore
    String.prototype.replaceAll = function (search: string, replacement: string) {
        return this.split(search).join(replacement)
    }

    document.body.classList.add("qt5")
}

export const IGNORE_VERSION_URL_PARAMETER = "issev" // Ignore SSE version
const BACKEND_MAJOR_VERSION = 1

catchErrors(() => {
    const url = new URL(window.location.href)

    const ignore_version = url.searchParams.has(IGNORE_VERSION_URL_PARAMETER)
    const version_correct =
        SSEother.backend_major_version === BACKEND_MAJOR_VERSION || ignore_version
    const component = version_correct ? Root : OutOfDateWarning

    if (version_correct) {
        patchFetch()

        config.set(SSEconfig)
        other.set(SSEother)
    }
    setTimeout(() => mount(component, { target: document.body }), SSEconfig.loadDelayMs ?? 100)

    const style = document.createElement("style")
    style.innerHTML = css
    document.head.appendChild(style)
})
