import Hello from './Hello.svelte'
import { anki } from './anki'

const root = document.createElement("div")
document.body.appendChild(root)

anki.setupGraphs([anki.graphComponents.AddedGraph], {controller: anki.graphComponents.RangeBox})