import type { SvelteComponent } from "svelte"

declare namespace anki {
    let graphComponents: Record<string, typeof SvelteComponent>,
    function setupGraphs(
        graphs: typeof SvelteComponent[],
        {
            search = "deck:current",
            days = 365,
            controller = null as typeof SvelteComponent<any> | null,
        } 
    )
}