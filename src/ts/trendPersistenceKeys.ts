export const TREND_PERSISTENCE_KEYS = {
    fsrs: {
        averageStabilityOverTime: "fsrs:average-stability-over-time",
    },
    memorised: {
        shared: "memorised:shared",
        stableRetrievability: "memorised:stable-retrievability",
        notes: "memorised:notes",
        cards: "memorised:cards",
        cardsByBurden: "memorised:cards-by-burden",
        retrievability: "memorised:retrievability",
    },
    loadTrend: {
        burden: "load-trend:burden",
        introducedLoad: "load-trend:introduced-load",
    },
    ratings: {
        ratings: "ratings:ratings",
        ratingsByDuration: "ratings:ratings-by-duration",
        intervalRatings: "ratings:interval-ratings",
        timeRatings: "ratings:time-ratings",
    },
    bad: {
        naiveSiblingSimilarity: "bad:naive-sibling-similarity",
        ratingFatigue: "bad:rating-fatigue",
        fsrsLossByFatigue: "bad:fsrs-loss-by-fatigue",
    },
    introduced: {
        introductoryRating: "introduced:introductory-rating",
    },
    misc: {
        reviewSpeedTrend: "misc:review-speed-trend",
    },
} as const
