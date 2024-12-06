type SSEconfig = Partial<{
    loadDelayMs: number
    burdenNotLoad: boolean
    confirmExpensiveStats: boolean
    barWidth: number
    barHeight: number
    piePercentages: boolean
    warnings: boolean
}>

interface SSEother {
    rollover: number
    learn_ahead_secs: number
}
