# Should include "Search Stats Extended" in english as well
title-search-stats-extended = Search Stats Extended:

# Graph data
load = Load
cards = Cards
card-load = Card Load
intervals = Intervals
last-day = Last Day

total-cards = Total Cards

# Graphs
no-data = NO DATA
fsrs-only = (FSRS only)

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

todays-retention = Todays Retention
todays-retention-help = 
    Retention is used to compare how many cards you got right and wrong on first
    looking.

custom-pie = Custom pie
custom-pie-help = 
    This pie will show you the sum of the requested value for cards which match 
    "Search"
    for each search

review-speed-trend = Review Speed Trend
review-speed-trend-help =
    The average amount of time it took you to answer each card on a given day.

    Please note that this graph respects the "last 12 months / all history"
    option beneath the search bar.

sxr-heatmap = SxR Heatmap
sxr-heatmap-help =
    This graph shows the number of cards which have the given stability and retrievability. The redder the cell, the more cards are in that "bin".

interval-distribution = Interval Distribution
interval-distribution-help =
    Here you can more easily visualise the spread of your Intervals. This displays the same data as regular anki's "Review Intervals" graph.

interval-load = Interval Load
interval-load-help =
    Load is 1/interval for each card and is used to estimate how many cards you see in a day. As an example if a card has an interval of 1 it has a load of 1 because you see it every day. If a card has an interval of 2 it has a load of 0.5 et cetera.

preparing-review-stats = Preparing Review Stats...

review-graphs-warning-title = Review Graphs
review-graphs-prepare-graphs = Prepare Graphs
review-graphs-warning = These statistics can take time to prepare.
review-graphs-config-hint = 
    To load these graphs by default, set "confirmExpensiveStats" to false in the addon config.