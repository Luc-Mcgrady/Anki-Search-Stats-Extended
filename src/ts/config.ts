import type { CATEGORIES } from "./categories"

export type SSEconfig = Partial<{
    loadDelayMs: number
    burdenNotLoad: boolean
    barWidth: number
    barHeight: number
    piePercentages: boolean
    warnings: boolean
    trends: boolean
    graphMode: "Bar" | "Pie"
    categories: Record<string, boolean | "removed">
    categoryOrder: (keyof typeof CATEGORIES)[]
    autoRevlogStats: boolean
    autoMemorisedStats: boolean
}>

export type DeckConfig = {
    id: number
    mod: number
    name: string
    usn: number
    maxTaken: number
    autoplay: boolean
    timer: number
    replayq: boolean
    new: {
        bury: boolean
        delays: Array<any>
        initialFactor: number
        ints: Array<number>
        order: number
        perDay: number
    }
    rev: {
        bury: boolean
        ease4: number
        ivlFct: number
        maxIvl: number
        perDay: number
        hardFactor: number
    }
    lapse: {
        delays: Array<any>
        leechAction: number
        leechFails: number
        minInt: number
        mult: number
    }
    dyn: boolean
    newMix: number
    newPerDayMinimum: number
    interdayLearningMix: number
    reviewOrder: number
    newSortOrder: number
    newGatherPriority: number
    buryInterdayLearning: boolean
    fsrsParams4: Array<number>
    fsrsParams5: Array<number>
    fsrsParams6: Array<number>
    // For older anki versions
    fsrsWeights: Array<number>
    desiredRetention: number
    ignoreRevlogsBeforeDate: string
    easyDaysPercentages: Array<number>
    stopTimerOnAnswer: boolean
    secondsToShowQuestion: number
    secondsToShowAnswer: number
    questionAction: number
    answerAction: number
    waitForAudio: boolean
    sm2Retention: number
    weightSearch: string
    autoAnswer: number
    autoAgain: number
    autoAlert: number
}

export interface SSEother {
    rollover: number
    learn_ahead_secs: number
    deck_configs: Record<number, DeckConfig>
    deck_config_ids: Record<number, number>
    days_elapsed: number
    available_langs: string[]
    lang: string
    lang_ftl: string
    fallback_ftl: string
    addon_id: string
}

export const DEFAULT_ORDER = [
    "due",
    "misc",
    "rating",
    "load",
    "timeMachine",
    "fsrs",
    "forgettingCurve",
    "introduced",
    "interval",
    "repetition",
    "time",
    "lapse",
    "bad",
] as const
