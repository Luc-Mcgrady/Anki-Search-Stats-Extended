import Root from "./Root.svelte";
 
setTimeout(()=>
    new Root({target: document.body})
, 100)

declare global {
    let css: string
}

const style = document.createElement("style")
style.innerHTML = css;
document.head.appendChild(style)