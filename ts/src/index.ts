import Hello from './Hello.svelte'

const root = document.createElement("div")
document.body.appendChild(root)

new Hello({
    target: root
})
