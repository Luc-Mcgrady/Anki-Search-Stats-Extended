export type Tooltip = {
    x: number
    y: number
    text: string[]
}

export function tooltipX(e: MouseEvent) {
    return e.pageX - (e.pageX / document.body.scrollWidth) * 200
}

const day_ms = 24 * 60 * 60 * 1000

export function tooltipDate(index: number, width: number) {
    const left_date = new Date(Date.now() + day_ms * index)
    const right_date = new Date(Date.now() + day_ms * (index + width - 1))
    return left_date.toLocaleDateString() + (width > 1 ? `-${right_date.toLocaleDateString()}` : "")
}
