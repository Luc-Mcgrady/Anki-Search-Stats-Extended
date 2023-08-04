import Title from "./Title.svelte";

const root = document.createElement("body")
document.body.appendChild(root)

/* let graphs: any = Object.values(anki.graphComponents).filter(a => a != anki.graphComponents.RangeBox && typeof a != "object")

//@ts-ignore
Title.$$ = 

graphs = [Title]

setTimeout(() => { // Delay and then swap the body of the document to remove regular anki's dom
    document.body = root

    anki.setupGraphs(graphs, {controller: anki.graphComponents.RangeBox})
}, 10);

export default graphs;
*/