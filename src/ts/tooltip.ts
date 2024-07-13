export type Tooltip = {
    shown: boolean
    x?: number
    y?: number
    text?: string[]
}

export function tooltipX(e: MouseEvent) {
    return e.pageX - (e.pageX / document.body.scrollWidth) * 200
}

export function tooltipDate(label: string) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000 * parseInt(label))
}
