import type { SvelteComponent } from "svelte"

declare global {
    let anki: {
        graphComponents: Record<string, typeof SvelteComponent>,
        setupGraphs: (
            graphs: typeof SvelteComponent[],
            {
                search = "deck:current",
                days = 365,
                controller = null as typeof SvelteComponent<any> | null,
            } 
        ) => void
    }
} 