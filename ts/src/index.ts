import Root from "./Root.svelte"
 
export const root = new Root({target: document.body})

declare global {
    let css: string
}

const style = document.createElement("style")
style.innerHTML = css;
document.head.appendChild(style)