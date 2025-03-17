# Should include "Search Stats Extended" in english as well
title-search-stats-extended = Search Stats Extended:

# Graph data
load = Load
count = Count
lapses = Lapses
repetitions = Repetitions

cards = Cards
card-load = Card Load
intervals = Intervals
last-day = Last Day

total-cards = Total Cards
total-load = Total Load

mature-count = {mature}
young-count = {young}
learning-count = Learning
relearning-count = Relearning
new-count = New
# Suspended not in use yet, but will be
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
bar-width = Bar Width
scroll = Scroll
as-ratio = As Ratio

loading = Loading...

total = Total
trend = Trend

future-due-types = Future Due Types
future-due-types-help = 
    This graph is the same as the Future Due above except it delineates between types of cards.
    Very useful if you have learning steps greater than one day.

future-due-retention = Future Due Retention
future-due-retention-help = 
    As a ratio this graph shows the retention FSRS predicts you will have on that day (Check "target{"\u00A0"}R" in the card browser if you have the fsrs helper addon). As not a ratio it instead shows how many cards FSRS predicts you will get that day.
    Does not account for overdue-ness.

intra-day-due = Intra Day Due
intra-day-due-help =                 
    This graph shows you which hours todays cards are/were due in.
    Useful if you use FSRS-5 with automatic learning steps or have long intra-day learning intervals.
next-card-at = Next card is in{ $hours ->
        [0] {""}
        [one] { $hours } hour
        *[many] { $hours } hours
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

sxr-heatmap = SxR Heatmap
sxr-heatmap-help =
    This graph shows the number of cards which have the given stability and retrievability. The redder the cell, the more cards are in that "bin".

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

suspended-cards-warning = 
    In order to exclude suspended cards from this or the following graphs, you will need to manually add "-is:suspended" to your search. Please consider that this may cause inconsistencies if you leave it off for the above graphs.

time-totals = Time Totals
time-totals-help = 
    The quantity of time that has been spent on cards which have taken the given amount of time to answer over every review

introduced = Introduced
introduced-help =
    A card is introduced when it is shown to you for the first time. A card is re-introduced when it is shown to you for the first time after being forgotten.
introduced-truncated-warning = 
    Re-introduced does not work for cards introduced before the cutoff date.

forgotten = Forgotten
forgotten-help = You "forget" a card when you manually mark it as new.
forgotten-truncated-warning = Does not work for cards introduced before the cutoff date.

introductory-rating = Introductory Rating
introductory-rating-help = 
    The first review you gave a newly introduced card. Important for FSRS.

load-trend = Load Trend
load-trend-help =
    This shows the change in load over time. 
    For the trend candlestick bar, A green bar shows a decrease in load for that period of time (improvement) while a red bar shows an increase.

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

predicted = Predicted
actual = Actual

show-question = Show?
increase-date-range = Increase date range

interval-ratings = Interval Ratings
interval-ratings-help = Ratings plotted by the interval they had before you rated them.

time-ratings = Time Ratings
time-ratings-help = 
    Ratings plotted by how long you spent looking at a card before rating it. Respects the deck presets "Maximum answer seconds" of the moment the answer was reviewed.

card-count-time-machine = Card Count Time Machine
card-count-time-machine-help = Shows your card type counts for a given date

review-interval-time-machine = Review Interval Time Machine
review-interval-time-machine-help = Shows your review intervals for a given date

stability-time-machine = Stability Time Machine
stability-time-machine-help = Shows your card stabilities for a given date

# Graphs that are hidden by default, translate if you want to

bad-graph = Bad Graph

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