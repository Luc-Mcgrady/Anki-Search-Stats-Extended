import BadGraphCategory from "./BadGraphCategory.svelte"
import ForgettingCurveCategory from "./ForgettingCurveCategory.svelte"
import FSRSCategory from "./FSRSCategory.svelte"
import FutureDueCategory from "./FutureDueCategory.svelte"
import IntervalDistributionCategory from "./IntervalDistributionCategory.svelte"
import IntroducedCategory from "./IntroducedCategory.svelte"
import LapseCategory from "./LapseCategory.svelte"
import LoadTrendCategory from "./LoadTrendCategory.svelte"
import MiscCategory from "./MiscCategory.svelte"
import RatingsCategory from "./RatingsCategory.svelte"
import RepetitionCategory from "./RepetitionCategory.svelte"
import TimeDistributionCategory from "./TimeDistributionCategory.svelte"
import TimeMachineCategory from "./TimeMachineCategory.svelte"

export const CATEGORIES = {
    bad: {
        component: BadGraphCategory,
        title: "bad-graph",
    },
    fsrs: {
        component: FSRSCategory,
        title: "FSRS",
    },
    due: {
        component: FutureDueCategory,
        title: "future-due-types",
    },
    interval: {
        component: IntervalDistributionCategory,
        title: "interval-distribution",
    },
    introduced: {
        component: IntroducedCategory,
        title: "introduced",
    },
    lapse: {
        component: LapseCategory,
        title: "lapse-distribution",
    },
    load: {
        component: LoadTrendCategory,
        title: "load-trend",
    },
    misc: {
        component: MiscCategory,
        title: "todays-retention",
    },
    rating: {
        component: RatingsCategory,
        title: "ratings",
    },
    repetition: {
        component: RepetitionCategory,
        title: "repetition-distribution",
    },
    time: {
        component: TimeDistributionCategory,
        title: "time-distribution",
    },
    timeMachine: {
        component: TimeMachineCategory,
        title: "card-count-time-machine",
    },
    forgettingCurve: {
        component: ForgettingCurveCategory,
        title: "forgetting-curve",
    },
} as const
