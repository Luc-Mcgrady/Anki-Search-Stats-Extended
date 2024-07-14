type SSEconfig = Partial<{
    loadDelayMs: number
    burdenNotLoad: boolean
    confirmExpensiveStats: boolean
}>

interface SSEother {
    rollover: number
    learn_ahead_secs: number
}
