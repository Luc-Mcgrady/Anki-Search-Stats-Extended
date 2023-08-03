const root = document.createElement("body")
document.body.appendChild(root)

const graphs = Object.values(anki.graphComponents).filter(a => a != anki.graphComponents.RangeBox && typeof a != "object")

console.log(graphs)

setTimeout(() => { // Delay and then swap the body of the document to remove regular anki's dom
    document.body = root

    anki.setupGraphs(graphs, {controller: anki.graphComponents.RangeBox})
}, 10);
