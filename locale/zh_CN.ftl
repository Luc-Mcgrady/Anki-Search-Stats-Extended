# Should include "Search Stats Extended" in english as well
title-search-stats-extended = Search Stats Extended-扩展搜索统计信息:

# Graph data
# Load as in card load
load = 工作量
count = （次）数
lapses = 遗忘次数
repetitions = 复习次数

cards = 卡片
card-load = 卡片工作量
intervals = 间隔
last-day = 最大天数

total-cards = 总卡片数
x-total-cards = 总卡片数: {$val}
total-load = 总工作量

mature-count = {mature}
young-count = {young}
learning-count = 学习中
relearning-count = 重学中
new-count = 新卡片
suspended = 已暂停 

learn = 学习
mature = 已熟练
young = 欠熟练
young-and-mature = 欠熟练+已熟练
all = 全部

again = 重来
hard = 困难
good = 良好
easy = 简单

# Graphs
no-data = 无数据
fsrs-only = (FSRS限定)

pie = 饼图
bar = 柱状图

infinity = 无限
steps = 细分

zero-inclusive = 包含0次
include-suspended = 包含暂停
include-re-introduced = 包含重新学习
include-filtered = 包含筛选
bar-width = 柱宽
scroll = 滚动
as-ratio = 按比例显示

loading = 加载中...

total = 总计
trend = 趋势

percent-correct = 正确率 {$percentage}%

future-due-types = 预测（分类）
future-due-types-help = 
    此图表与Anki原生的“预测”图表相同，但区分卡片类型。
    当学习间隔超过一天时特别有用。

future-due-retention = 预测记忆保留率
future-due-retention-help = 
    若勾选“按比例显示”，将显示FSRS预测的记忆保留率 (如果你在使用FSRS Helper插件，在卡片浏览器中查看 "target{"\u00A0"}R")；若未勾选，则显示FSRS预测的当日复习卡片数。
    不计算逾期未复习的卡片。

pass = 通过
fail = 失败

intra-day-due = 今日到期分布
intra-day-due-help =                 
    此图表显示今日到期卡片的具体小时分布。
    适用于使用自动学习间隔的FSRS-5用户或设置了较长日内学习间隔的情况。
next-card-at = 下一张卡片将在{ $hours ->
        [0] {""}
        [one] {" "}{ $hours }小时
        *[many] {" "}{ $hours }小时
    }{ $minutes ->
        [0] {""}
        [one] { $minutes }分钟
        *[many] { $minutes }分钟
    } 后（{$time}）准备好

todays-retention = 今日记忆保留率
todays-retention-help = 
    保留率用于对比首次复习时答对与答错的比例。
    

amount = 数量
state = 状态

passed = 已通过
flunked = 未通过
learning = 学习中

custom-pie = 自定义饼图
custom-pie-help = 
    此图表将根据搜索条件，显示匹配卡片指定数值（如遗忘次数）的汇总分布。
    
    

search = 搜索
colour = 颜色
search-string = 搜索条件
css-colour = Css颜色
new-search = 新建搜索
reset = 重置

interval-of = {$value}天间隔
difficulty-of = {$value}的难度
stability-of = {$value}的稳定期
x-seconds = {$value}秒
# e.g 
# x = Interval
# range = 10-20
x-in-range = {$range}范围内的{$x}

review-speed-trend = 复习速度趋势
review-speed-trend-help =
    显示每日单卡平均回答耗时。

    注意：此图表受搜索栏下方
    “近一年/全部”选项影响。

seconds-per-review = 单次复习耗时 (s)
average-second-per-day = 平均每{$n ->
        [one] 天
        *[many] {$n}天
    }{$value} {$value ->
        [one] 秒
        *[many] 秒
    }

sxr-heatmap = SxR热力图
sxr-heatmap-help =
    展示卡片稳定期(S)与可提取性(R)的分布情况。红色越深，该区域卡片数量越多。

enlarged = 放大
logarithmic-s = 对数化稳定期
r-bin-size = 可提取性区间大小
s-bin-size = 稳定期区间大小
retrievability-short = R
stability-short = S

card-count = 卡片数量

interval-distribution = 间隔分布
interval-distribution-help =
    更直观地显示间隔分布情况。与Anki原生“复习间隔”图表数据一致。

interval-load = 间隔工作量
interval-load-help =
    工作量=1/间隔，用于估算每日复习量。例如：间隔1天工作量1，间隔2天工作量0.5

highest-lapse-count = 最高遗忘次数
lapse-count = 遗忘次数 

lapse-load = 遗忘工作量
lapse-load-help = 
    显示指定遗忘次数卡片的工作量总和。
    如果您想根据卡片遗忘次数来暂停卡片，配合左侧计数图可找到最佳暂停阈值。

lapse-distribution = 遗忘分布
lapse-distribution-help = 
    当非“学习中”状态的卡片被“重来”时，遗忘次数+1。
    默认8次遗忘会标记为"记忆难点"，可在牌组设置的"记忆难点阈值"修改。

lapse-total = 遗忘总数
lapse-total-help = 
    统计每个遗忘次数的总发生数。例如：2张卡片各遗忘3次，则3次的总数为6

highest-repetition-count = 最大复习次数
repetition-count = 复习次数
total-repetitions = 总复习次数

repetition-load = 复习工作量
repetition-load-help = 
    显示指定复习次数卡片的工作量总和。

repetition-distribution = 复习分布
repetition-distribution-help = 
    每次复习都会增加该卡片的复习次数计数。

repetition-total = 复习总数
repetition-total-help = 
    统计每个复习次数的总发生数。例如：2张卡片各复习3次，则3次的总数为6

preparing-review-stats = 正在准备复习统计...

review-graphs-warning-title = 复习图表
review-graphs-prepare-graphs = 生成图表
review-graphs-warning = 统计生成可能需要较长时间。
review-graphs-config-hint = 
    要默认加载这些图表，请在插件配置中设置"confirmExpensiveStats"为false

generic-truncated-warning = 
    未选择"全部历史"时数据可能不准确。

time-distribution = 时间分布
time-distribution-help =
    各耗时区间的卡片数量分布。
most-seconds = 最大耗时
time-in-seconds = 时间 (s)
seconds = 秒
total-seconds = 总秒数 (s)
seconds-per-card = 单卡耗时 (s)

suspended-cards-warning = 
    要排除暂停卡片，需手动添加"-is:suspended"到搜索条件。
    注意：与上方图表条件不一致可能导致错误。

time-totals = 时间总计
time-totals-help = 
    各耗时区间的总时间累积。

introduced = 新学习
re-introduced = 重新学习
introduced-help =
    新学：首次学习；重新学习：遗忘后再次学习
introduced-truncated-warning = 
    截止日期前的重新学习不生效。

forgotten = 已遗忘
forgotten-help = 手动标记为“新卡片”即视为遗忘。
forgotten-truncated-warning = 截止日期前的遗忘不生效。
forgotten-cards-not-yet-reintroduced = 未重新学习的遗忘卡片: {$number}

introductory-rating = 初始评分
introductory-rating-help = 
    新卡片的首次复习（对FSRS算法重要）

load-trend = 工作量趋势
load-trend-help =
    绿色K线表示工作量下降(改善)，红色K线表示工作量上升。

x-change = 变化: {$val}
x-total = 总计: {$val}

ratings = 评分分布
ratings-help = 
    每日评分比例分布，(1-重来比例)%即当日保留率(shown as " % Correct " in the tooltip)

memorised = 已记忆量
memorised-help = 
    FSRS基于当前参数的记忆量估算。
    使用默认参数或不完整历史记录时可能不准确。
    
    记忆可提取性(R)即卡片的记忆成功率累加值。
memorised-truncated-warning =
    强烈建议使用“全部历史”。
    该图表重新模拟了您的复习历史，忽略开头部分会显著影响模拟结果。
    
retrievability-and-stability = 记忆可提取性和稳定期
cards-and-stability = 卡片和稳定期

# Between Minus Within? If I'm honest I have no idea what this stands for.
b-w-matrix = B-W矩阵

predicted = 预测值
actual = 实际值

show-question = 显示？
increase-date-range = 扩大日期范围

average-stability-over-time = 稳定期随时间的变化
average-stability-over-time-help =
    此图表示您的平均稳定期（与保留率无关）随时间的变化情况。请注意，欠熟练/已熟练值是基于牌组中相应卡片的数量（如果有9张欠熟练卡片和1张已熟练卡片，90% 的条形将标记为欠熟练）。卡片熟练度的计算使用的是稳定期，而不是间隔期，这也使得卡片熟练度的计算不依赖于保留率。
median = 中位数
mean = 平均值

interval-ratings = 间隔评分
interval-ratings-help = 按复习前间隔长度分析的评分分布。

time-ratings = 耗时评分
time-ratings-help = 
    按回答耗时分析的评分分布。
    受牌组“最长回答时间”设置影响。

card-count-time-machine = 卡片数量时光机
card-count-time-machine-help = 
    显示指定日期的卡片类型数量。
    新卡片暂停仍计为“新”类型，而不是“已暂停”

starts-at = 起始于
first-added = 首次添加
first-review = 首次复习
custom = 自定义

card-type = 卡片类型

review-interval-time-machine = 复习间隔时光机
review-interval-time-machine-help = 显示指定日期的复习间隔分布。

stability-time-machine = 稳定期时光机
stability-time-machine-help = 显示指定日期的卡片稳定期分布。

x-days-ago = {$days}天前:

difficulty-time-machine = 难度时光机
difficulty-time-machine-help = 显示指定日期的卡片难度。
# As in "zoom in" or "zoom out"
zoom = 缩放
daily-hourly-breakdown = 每日每小时细分
daily-hourly-breakdown-help = 
    在指定日期前X天范围内，按小时显示复习数。
    内置的Anki图表不包括过滤后的复习。
days = 天数
today = 今日

burden-per-day = 每{$n ->
        [one] 天工作量
        *[many] {$n}天工作量
    } {$value}
stability-per-day = 每{$n ->
        [one] 天稳定期
        *[many] {$n}天稳定期
    } {$value}
retention-per-day = 每{$n ->
        [one] 天保留率
        *[many] {$n}天保留率
    } {$value}
retention-per-day-greater-interval = 每{$n ->
        [one] 天更长间隔的保留率
        *[many] {$n}天更长间隔的保留率
    } {$value}
retention-per-second-spent = 每{$n ->
        [one] 秒思考保留率
        *[many] {$n}秒思考保留率
    } {$value}
remembered-per-day = 每{$n ->
        [one] 天记住
        *[many] {$n}天记住
    }{$value}张卡片
forgotten-per-day = 每{$n ->
        [one] 天遗忘
        *[many] {$n}天遗忘
    }{$value}张卡片

# This tables description and help will most likely change or become a bad graph
leech-detector = 遗忘几率（实验性）
leech-detector-help =
    可点击的图表！卡片遗忘次数与基于其保留率的预期偏差程度。
    数值越高，卡片出现该遗忘次数的可能性越小。
    计算公式将来可能会改变。
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
