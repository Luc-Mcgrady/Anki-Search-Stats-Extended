# Should include "Search Stats Extended" in english as well
title-search-stats-extended = Search Stats Extended:

# Graph data
# Load as in card load
load = Load
count = Count
lapses = Lapses
repetitions = Repetitions

cards = Cards
card-load = Card Load
intervals = Intervals
last-day = Last Day

total-cards = Total Cards
x-total-cards = Total Cards: {$val}
total-load = Total Load

mature-count = {mature}
young-count = {young}
learning-count = Learning
relearning-count = Relearning
new-count = New
suspended = Suspended 

learn = Learn
mature = Mature
young = Young
young-and-mature = Young+Mature
all = All

again = Again
hard = Hard
good = Good
easy = Easy

# Graphs
no-data = NO DATA
fsrs-only = (FSRS only)

pie = Pie
bar = Bar

infinity = Infinity
steps = Steps

zero-inclusive = Zero Inclusive
include-suspended = Include Suspended
include-re-introduced = Include re-introduced
include-filtered = Include Filtered
bar-width = Bar Width
scroll = Scroll
as-ratio = As Ratio

loading = Loading...

total = Total
trend = Trend

percent-correct = {$percentage}% Correct

future-due-types = Future Due Types
future-due-types-help = 
    This graph is the same as the Future Due above except it delineates between types of cards.
    Very useful if you have learning steps greater than one day.

future-due-retention = Future Due Retention
future-due-retention-help = 
    As a ratio this graph shows the retention FSRS predicts you will have on that day (Check "target{"\u00A0"}R" in the card browser if you have the fsrs helper addon). As not a ratio it instead shows how many cards FSRS predicts you will get that day.
    
    Does not account for overdue-ness.

pass = Pass
fail = Fail

intra-day-due = Intra Day Due
intra-day-due-help =                 
    This graph shows you which hours todays cards are/were due in.
    Useful if you use FSRS-5 with automatic learning steps or have long intra-day learning intervals.
next-card-at = Next card is in{ $hours ->
        [0] {""}
        [one] {" "}{ $hours } hour
        *[many] {" "}{ $hours } hours
    } { $minutes ->
        [0] {""}
        [one] { $minutes } minute
        *[many] { $minutes } minutes
    } at {$time}

todays-retention = Todays Retention
todays-retention-help = 
    Retention is used to compare how many cards you got right and wrong on first
    looking.

amount = Amount
state = State

passed = Passed
flunked = Flunked
learning = Learning

custom-pie = Custom pie
custom-pie-help = 
    This pie will show you the sum of the requested value for cards which match 
    "Search"
    for each search

search = Search
colour = Colour
search-string = Search String
css-colour = Css Colour
new-search = New Search
reset = Reset

interval-of = Interval of {$value}
difficulty-of = Difficulty of {$value}
stability-of = Stability of {$value}
factor-of = Increase of {$value}%
x-seconds = {$value} Seconds
# e.g 
# x = Interval
# range = 10-20
x-in-range = {$x} of {$range}

review-speed-trend = Review Speed Trend
review-speed-trend-help =
    The average amount of time it took you to answer each card on a given day.

    Please note that this graph respects the "last 12 months / all history"
    option beneath the search bar.

seconds-per-review = Time Spent Per Review (s)
average-second-per-day = {$value} {$value ->
        [one] second
        *[many] seconds
    } on average per {$n ->
        [one] day
        *[many] {$n} days
    }

sxr-heatmap = SxR Heatmap
sxr-heatmap-help =
    This graph shows the number of cards which have the given stability and retrievability. The redder the cell, the more cards are in that "bin".

ease-factors = Stability Increase Factor
ease-factors-help = 
    For each card, the percentage increase in stability that will occur on a good review.
    An alternate measure of difficulty.

enlarged = Enlarged
logarithmic-s = Logarithmic s
r-bin-size = R Bin Size
s-bin-size = S Bin Size
retrievability-short = R
stability-short = S

card-count = Card Count

interval-distribution = Interval Distribution
interval-distribution-help =
    Here you can more easily visualise the spread of your Intervals. This displays the same data as regular anki's "Review Intervals" graph.

interval-load = Interval Load
interval-load-help =
    Load is 1/interval for each card and is used to estimate how many cards you see in a day. As an example if a card has an interval of 1 it has a load of 1 because you see it every day. If a card has an interval of 2 it has a load of 0.5 et cetera.

highest-lapse-count = Highest Lapse Count
lapse-count = Lapse Count 

lapse-load = Lapse Load
lapse-load-help = 
    This graph shows the sum of "1 / interval" for cards which have the given number of lapses. If you plan to suspend cards based on their number of lapses, this can help you find a good threshold if you compare it with the count graph to the left to see how many cards are giving you how much Load

lapse-distribution = Lapse Distribution
lapse-distribution-help = 
    A card increases its lapse count whenever it is reviewed "again" while not in the learning state. Lapses are used to monitor which cards become "leeches". By default, whenever the card reaches 7 lapses it becomes tagged as a leech. This value can be modified under leech threshold in the deck settings.

lapse-total = Lapse Total
lapse-total-help = 
    This graph shows the number of lapses, total, for each card. E.g if exactly 2 cards have 3 lapses per card, the lapse total for 3 would be 6.

highest-repetition-count = Most Repetitions
repetition-count = Repetitions
total-repetitions = Total Repetitions

repetition-load = Repetition Load
repetition-load-help = 
    This graph shows the sum of "1 / interval" for all cards which have the given number of repetitions.

repetition-distribution = Repetition Distribution
repetition-distribution-help = 
    A card gains a repetition (commonly called a review) whenever you review it.

repetition-total = Repetition Total
repetition-total-help = 
    This graph shows the number of repetitions for each card. E.g if exactly 2 cards have a repetitions per card of 3, the repetition total for 3 would be 6.

preparing-review-stats = Preparing Review Stats...

review-graphs-warning-title = Review Graphs
review-graphs-prepare-graphs = Prepare Graphs
review-graphs-warning = These statistics can take time to prepare.
review-graphs-config-hint = 
    To load these graphs by default, set "confirmExpensiveStats" to false in the addon config.

generic-truncated-warning = 
    May be inaccurate while "all history" is not selected.

time-distribution = Time Distribution
time-distribution-help =
    How many cards have taken the given amount of time to answer over every review
most-seconds = Most Seconds
time-in-seconds = Time (s)
seconds = Seconds
total-seconds = Total (s)
seconds-per-card = Per card (s)

suspended-cards-warning = 
    In order to exclude suspended cards from this or the following graphs, you will need to manually add "-is:suspended" to your search. Please consider that this may cause inconsistencies if you leave it off for the above graphs.

time-totals = Time Totals
time-totals-help = 
    The quantity of time that has been spent on cards which have taken the given amount of time to answer over every review

introduced = Introduced
re-introduced = Re-Introduced
introduced-help =
    A card is introduced when it is shown to you for the first time. A card is re-introduced when it is shown to you for the first time after being forgotten.
introduced-truncated-warning = 
    Re-introduced does not work for cards introduced before the cutoff date.

forgotten = Forgotten
forgotten-help = You "forget" a card when you manually mark it as new.
forgotten-truncated-warning = Does not work for cards introduced before the cutoff date.
forgotten-cards-not-yet-reintroduced = Forgotten cards not yet re-introduced: {$number}

introductory-rating = Introductory Rating
introductory-rating-help = 
    The first review you gave a newly introduced card. Important for FSRS.

load-trend = Load Trend
load-trend-help =
    This shows the change in load over time. 
    For the trend candlestick bar, A green bar shows a decrease in load for that period of time (improvement) while a red bar shows an increase.

x-change = Change: {$val}
x-total = Total: {$val}

learn-reviews-per-card = Learn Reviews per Card
learn-reviews-per-card-help = The number of reviews it took before the card left the learning phase (graduated). Resets for cards which were forgotten.

ratings = Ratings
ratings-help = 
    The rating of every review you did that day, learning or otherwise. The ratio displays it as a percent of all cards reviewed that day. calculate (1-again)% to get your retention for that day (shown as " % Correct " in the tooltip).

memorised = Memorised
memorised-help = 
    An FSRS estimate of how many cards you knew at that given time. This depends on FSRS's current parameters and will use the defaults if none are found (Even if you are using SM-2).
    This graph will not work properly with an incomplete review history and will not respect "ignore reviews before".

    In FSRS, each card has a percentage chance of being recalled known as retrievability. This is a sum of those percentages over time.
memorised-truncated-warning =
    It is heavily advised you use "All history" for this graph
        
    This graph re-simulates your review history, leaving the beginning out can greatly
    affect the results.

fsrs-calibration = FSRS Calibration
fsrs-calibration-help = This compares the average retention FSRS predicts you should have on cards (Perfect/orange line) to the retention you actually have (Actual/blue line).
forgetting-curve = First Long-term Forgetting Curve
forgetting-curve-help =
    Compares the observed rate of recall against fitted FSRS forgetting curves which are grouped by the card's first rating.
    Same-day reviews are excluded, only one review per day is used and point size indicates the number of samples contributing to that interval.
first-short-term-forgetting-curve = First Short-term Forgetting Curve
first-short-term-forgetting-curve-help =
    Visualises recall for same-day reviews within 12 hours of the first rating. Uses adaptive binning to intelligently group reviews (up to 20 bins, minimum 50 samples per bin) while preserving precise timing. Memory stability values are expressed in minutes and can range up to 24 hours.
forgetting-curve-no-data = Not enough review history to draw a forgetting curve yet.
forgetting-curve-x-axis = Interval (days)
forgetting-curve-x-axis-minutes = Interval (minutes)
forgetting-curve-y-axis = Recall probability
forgetting-curve-tooltip-rating = First rating: {$rating}
forgetting-curve-tooltip-interval = Interval: {$days} d
forgetting-curve-tooltip-interval-minutes = Interval: {$minutes} min
forgetting-curve-tooltip-recall = Recall: {$value}%
forgetting-curve-tooltip-count = Samples: {$count}
forgetting-curve-legend = {$rating}: Memory stability={$stability} ({$count})
forgetting-curve-legend-short-term = {$rating}: Memory stability={$stability} minutes ({$count})
forgetting-curve-legend-count = n={$count}
forgetting-curve-bins-selector = Max Bin Count
forgetting-curve-bin-count = {$count} {$count ->
        [one] bin
        *[many] bins
    }
forgetting-curve-outlier-filtering = Outlier Filtering

actual = Actual

cards = Cards
notes = Notes
cards-by-burden = Cards/Load
average-retrievability = Average Per Card
stability = Stability
retrievability = Retrievability
retrievability-and-stability = Retrievability & Stability
cards-and-stability = Stable cards

# Between Minus Within? If I'm honest I have no idea what this stands for.
b-w-matrix = B-W Matrix

predicted = Predicted
actual = Actual

show-question = Show?
increase-date-range = Increase date range

average-stability-over-time = Stability Over Time
average-stability-over-time-help =
    This graph represents how your average stability, which is desired retention
    independent, has evolved over time. The mean gives a better sense of daily increases,
    while the median gives a value that is better representative of the real average.

    Note that the young/mature values are based on the amount of the respective cards in the deck (if there are 9 young cards and 1 mature card,
    90% of the bar will marked as young). A cards maturity is calculated here using the stability, not the interval,
    which makes it also desired retention independent.

median = Median
mean = Mean

interval-ratings = Interval Ratings
interval-ratings-help = Ratings plotted by the interval they had before you rated them.

time-ratings = Time Ratings
time-ratings-help = 
    Ratings plotted by how long you spent looking at a card before rating it. Respects the deck presets "Maximum answer seconds" of the moment the answer was reviewed.

card-count-time-machine = Card Count Time Machine
card-count-time-machine-help = 
    Shows your card type counts for a given date.
    
    New suspended cards count as new, not suspended.

    Learn and re-learn count for the end of the day, and not for learning steps greater than 1 day.
    e.g. You failed to finish the learning steps that day.

starts-at = Starts at
first-added = First Added
first-review = First Review
custom = Custom

card-type = Card Type

review-interval-time-machine = Review Interval Time Machine
review-interval-time-machine-help = Shows your review intervals for a given date

stability-time-machine = Stability Time Machine
stability-time-machine-help = Shows your card stabilities for a given date

x-days-ago = {$days} days ago:

difficulty-time-machine = Difficulty Time Machine
difficulty-time-machine-help = Shows your card difficulties for a given date

# As in "zoom in" or "zoom out"
zoom = Zoom

daily-hourly-breakdown = Daily Hourly Breakdown
daily-hourly-breakdown-help = 
    Shows when you did reviews hour by hour on days in the range X days before the specified date.
    The in-built Anki graph does not include filtered reviews.

days = Days
today = Today

burden-per-day = {$value} burden per {$n ->
        [one] day
        *[many] {$n} days
    }
stability-per-day = {$value} stability per {$n ->
        [one] day
        *[many] {$n} days
    }
retention-per-day = {$value} retention per {$n ->
        [one] day
        *[many] {$n} days
    }
retention-per-day-greater-interval = {$value} retention per {$n ->
        [one] day
        *[many] {$n} days
    } greater interval
retention-per-second-spent = {$value} retention per {$n ->
        [one] second
        *[many] {$n} seconds
    } spent thinking
remembered-per-day = {$value} {$value ->
        [one] card
        *[many] cards
    } remembered per {$n ->
        [one] day
        *[many] {$n} days
    }
forgotten-per-day = {$value} {$value ->
        [one] card
        *[many] cards
    } forgotten per {$n ->
        [one] day
        *[many] {$n} days
    }

# About section

about = About
translate = Translate

translate-instructions-1 = Currently available translations/locales:
translate-instructions-2 = For translation instructions, consult "readme.md" found in the locale folder.
translate-current-locale = Your current locale code is: {$code}

translate-open-locale-folder = Open Locale Folder
translate-submit-to-github = Submit Translation on Github
translate-edit-existing-translations = Edit Existing Translations on Github

credits = Credits
special-thanks = Special Thanks

credits-llamas = 🦙 (siid): Security and other fixes
credits-Ross-Brown = Ross Brown: {sxr-heatmap}
credits-Jonathan-Schoreels = Jonathan Schoreels: {average-stability-over-time} and more
credits-Huili-fox = Huili fox: Chinese localisation
credits-Jarrett-Ye = Jarrett Ye: {memorised}, {forgetting-curve} and {first-short-term-forgetting-curve} graphs
credits-Ishiko = Ishiko: {memorised} graph
credits-Rener-Crisostomo = Renêr Crisostomo: Brazilian translation

support = Support the Addon
like-on-ankiweb = Like on AnkiWeb 👍
star-on-github = Star on Github ⭐
sponsor-on-github = Sponsor me on Github ❤️
buy-me-a-coffee = Buy me a coffee ☕

# Graphs that are hidden by default, translate if you want to
bad-graph = Bad Graphs

# This tables description and help will most likely change or become a bad graph
leech-detector = Lapse Odds (Experimental)
leech-detector-help =
    A clickable graph! The degree to which cards number of lapses deviate from what was expected based on their retention.
    The higher the value, the less likely the cards are to have that number of lapses.
    The formula for calculating this may change in the future.

naive-sibling-similarity = Naive Sibling Similarity
naive-sibling-similarity-help = 
    The rating you gave cards plotted by the number of days since you reviewed a sibling of that card (card originating from the same note). Reviews from the same card or cards where either card are not mature are not counted. Please consider the "interval ratings" graph as you interpret this one.

rating-fatigue = Rating Fatigue
rating-fatigue-help =
    Ratings plotted by how many reviews (that match the search) you did total in that day before rating them. This will be affected by the card review/display order.

fsrs-loss-by-fatigue = FSRS Loss by Fatigue
fsrs-loss-by-fatigue-help =
    This graph displays how inaccurate FSRS is by the number of reviews you did prior in that day.
    Useful if you want to set a review limit.

days-since-sibling-review = {$value} Days since sibling review
x-previous-reviews = {$value} Previous reviews

retention-per-day-since-last-sibling-review = {$value} retention per {$n ->
        [one] day
        *[many] {$n} days
    } since last sibling review

retention-per-prior-review-that-day = {$value} retention per {$n ->
        [one] prior review
        *[many] {$n} prior reviews
    }

loss-per-prior-review-that-day = {$value} loss per {$n ->
        [one] prior review
        *[many] {$n} prior reviews
    }
