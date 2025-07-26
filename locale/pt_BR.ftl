# Should include "Search Stats Extended" in english as well
title-search-stats-extended = Search Stats Extended - Estatísticas de Pesquisa Estendidas:

# Graph data
# Load as in card load
load = Carga
count = Contagem
lapses = Lapsos
repetitions = Repetições

cards = Cartões
card-load = Carga de Cartão
intervals = Intervalos
last-day = Último Dia

total-cards = Total de Cartões
x-total-cards = Total de Cartões: {$val}
total-load = Carga Total

mature-count = {mature}
young-count = {young}
learning-count = Aprendendo
relearning-count = Reaprendendo
new-count = Novos
suspended = Suspensos 

learn = Aprender
mature = Maduros
young = Jovens
young-and-mature = Jovens+Maduros
all = Todos

again = Novamente
hard = Difícil
good = Bom
easy = Fácil

# Graphs
no-data = SEM DADOS
fsrs-only = (somente FSRS)

pie = Pizza
bar = Barra

infinity = Infinito
steps = Passos

zero-inclusive = Incluir Zero
include-suspended = Incluir Suspensos
include-re-introduced = Incluir Reintroduzidos
include-filtered = Incluir Filtrados
bar-width = Largura da Barra
scroll = Rolar
as-ratio = Como Proporção

loading = Carregando...

total = Total
trend = Tendência

percent-correct = {$percentage}% Corretas

future-due-types = Previsão com Tipos
future-due-types-help = 
    Este gráfico é o mesmo que o Previsão acima, exceto que distingue entre tipos de cartões.
    Muito útil se você tem passos de aprendizagem maiores que um dia.

future-due-retention = Retenção Prevista
future-due-retention-help = 
    Como proporção, este gráfico mostra a retenção que o FSRS prevê que você terá naquele dia (Verifique "target{"\u00A0"}R" no navegador de cartões se você tem o addon FSRS helper). Como não proporção, ele mostra quantos cartões o FSRS prevê que você terá naquele dia.
    
    Não leva em conta atraso.

pass = Passou
fail = Falhou

intra-day-due = Pendente Intradía
intra-day-due-help =                 
    Este gráfico mostra em quais horas os cartões de hoje estão/estavam pendentes.
    Útil se você usa FSRS-5 com passos de aprendizagem automáticos ou tem longos intervalos de aprendizagem intradía.
next-card-at = Próximo cartão em{ $hours ->
        [0] {""}
        [one] {" "}{ $hours } hora
        *[many] {" "}{ $hours } horas
    } { $minutes ->
        [0] {""}
        [one] { $minutes } minuto
        *[many] { $minutes } minutos
    } às {$time}

todays-retention = Retenção de Hoje
todays-retention-help = 
    A retenção é usada para comparar quantos cartões você acertou e errou na primeira
    visualização.

amount = Quantidade
state = Estado

passed = Passou
flunked = Reprovou
learning = Aprendendo

custom-pie = Gráfico personalizado
custom-pie-help = 
    Este gráfico mostrará a soma do valor solicitado para cartões que correspondem à
    "Pesquisa"
    para cada pesquisa

search = Pesquisar
colour = Cor
search-string = String de Pesquisa
css-colour = Cor CSS
new-search = Nova Pesquisa
reset = Redefinir

interval-of = Intervalo de {$value}
difficulty-of = Dificuldade de {$value}
stability-of = Estabilidade de {$value}
x-seconds = {$value} Segundos
# e.g 
# x = Interval
# range = 10-20
x-in-range = {$x} de {$range}

review-speed-trend = Tendência de Velocidade de Revisão
review-speed-trend-help =
    O tempo médio que levou para você responder cada cartão em um determinado dia.

    Note que este gráfico respeita a opção "últimos 12 meses / todo histórico"
    abaixo da barra de pesquisa.

seconds-per-review = Tempo Gasto por Revisão (s)
average-second-per-day = {$value} {$value ->
        [one] segundo
        *[many] segundos
    } em média por {$n ->
        [one] dia
        *[many] {$n} dias
    }

sxr-heatmap = Mapa de Calor ExR
sxr-heatmap-help =
    Este gráfico mostra o número de cartões que têm a estabilidade e recuperabilidade fornecidas. Quanto mais vermelha a célula, mais cartões estão nesse "compartimento".

enlarged = Ampliado
logarithmic-s = E logarítmico
r-bin-size = Tamanho R
s-bin-size = Tamanho E
retrievability-short = R
stability-short = E

card-count = Contagem de Cartões

interval-distribution = Distribuição de Intervalos
interval-distribution-help =
    Aqui você pode visualizar mais facilmente a distribuição dos seus Intervalos. Exibe os mesmos dados do gráfico "Intervalos de Revisão" do Anki padrão.

interval-load = Carga de Intervalo
interval-load-help =
    Carga é 1/intervalo para cada cartão e é usada para estimar quantos cartões você vê em um dia. Por exemplo, se um cartão tem intervalo de 1, tem carga de 1 porque você o vê todos os dias. Se um cartão tem intervalo de 2, tem carga de 0,5 e assim por diante.

highest-lapse-count = Maior Contagem de Lapsos
lapse-count = Contagem de Lapsos 

lapse-load = Carga de Lapsos
lapse-load-help = 
    Este gráfico mostra a soma de "1 / intervalo" para cartões que têm o número fornecido de lapsos. Se você planeja suspender cartões baseado no número de lapsos, isso pode ajudar a encontrar um bom limite se você comparar com o gráfico de contagem à esquerda para ver quantos cartões estão dando quanta Carga

lapse-distribution = Distribuição de Lapsos
lapse-distribution-help = 
    Um cartão aumenta sua contagem de lapsos sempre que é revisado como "novamente" enquanto não está no estado de aprendizagem. Lapsos são usados para monitorar quais cartões se tornam "sanguessugas". Por padrão, sempre que o cartão atinge 7 lapsos ele é marcado como sanguessuga. Este valor pode ser modificado no limite de sanguessugas nas configurações do baralho.

lapse-total = Total de Lapsos
lapse-total-help = 
    Este gráfico mostra o número de lapsos, total, para cada cartão. Ex: se exatamente 2 cartões têm 3 lapsos por cartão, o total de lapsos para 3 seria 6.

highest-repetition-count = Mais Repetições
repetition-count = Repetições
total-repetitions = Total de Repetições

repetition-load = Carga de Repetições
repetition-load-help = 
    Este gráfico mostra a soma de "1 / intervalo" para todos os cartões que têm o número fornecido de repetições.

repetition-distribution = Distribuição de Repetições
repetition-distribution-help = 
    Um cartão ganha uma repetição (comumente chamada de revisão) sempre que você o revisa.

repetition-total = Total de Repetições
repetition-total-help = 
    Este gráfico mostra o número de repetições para cada cartão. Ex: se exatamente 2 cartões têm 3 repetições por cartão, o total de repetições para 3 seria 6.

preparing-review-stats = Preparando Estatísticas de Revisão...

review-graphs-warning-title = Gráficos de Revisão
review-graphs-prepare-graphs = Preparar Gráficos
review-graphs-warning = Estas estatísticas podem demorar para preparar.
review-graphs-config-hint = 
    Para carregar estes gráficos por padrão, defina "confirmExpensiveStats" como falso na configuração do addon.

generic-truncated-warning = 
    Pode ser impreciso enquanto "todo histórico" não estiver selecionado.

time-distribution = Distribuição de Tempo
time-distribution-help =
    Quantos cartões levaram a quantidade fornecida de tempo para responder ao longo de todas as revisões
most-seconds = Mais Segundos
time-in-seconds = Tempo (s)
seconds = Segundos
total-seconds = Total (s)
seconds-per-card = Por cartão (s)

suspended-cards-warning = 
    Para excluir cartões suspensos deste ou dos seguintes gráficos, você precisará adicionar manualmente "-is:suspended" à sua pesquisa. Considere que isso pode causar inconsistências se você deixar de fora nos gráficos acima.

time-totals = Totais de Tempo
time-totals-help = 
    A quantidade de tempo que foi gasta em cartões que levaram a quantidade fornecida de tempo para responder ao longo de todas as revisões

introduced = Introduzidos
re-introduced = Reintroduzidos
introduced-help =
    Um cartão é introduzido quando é mostrado a você pela primeira vez. Um cartão é reintroduzido quando é mostrado a você pela primeira vez após ser esquecido.
introduced-truncated-warning = 
    Reintroduzidos não funciona para cartões introduzidos antes da data de corte.

forgotten = Esquecidos
forgotten-help = Você "esquece" um cartão quando o marca manualmente como novo.
forgotten-truncated-warning = Não funciona para cartões introduzidos antes da data de corte.
forgotten-cards-not-yet-reintroduced = Cartões esquecidos ainda não reintroduzidos: {$number}

introductory-rating = Avaliação Introdutória
introductory-rating-help = 
    A primeira revisão que você deu a um cartão recém-introduzido. Importante para o FSRS.

load-trend = Tendência de Carga
load-trend-help =
    Isso mostra a mudança na carga ao longo do tempo. 
    Para a barra de velas de tendência, uma barra verde mostra uma diminuição na carga para aquele período de tempo (melhoria) enquanto uma barra vermelha mostra um aumento.

x-change = Mudança: {$val}
x-total = Total: {$val}

learn-reviews-per-card = Revisões de Aprendizagem por Cartão
learn-reviews-per-card-help = O número de revisões que levou antes do cartão sair da fase de aprendizagem (formatura). Redefine para cartões que foram esquecidos.

ratings = Avaliações
ratings-help = 
    A avaliação de cada revisão que você fez naquele dia, de aprendizagem ou não. A proporção exibe como uma porcentagem de todos os cartões revisados naquele dia. calcule (1-novamente)% para obter sua retenção para aquele dia (mostrado como "% Corretas" na dica).

memorised = Memorizados
memorised-help = 
    Uma estimativa do FSRS de quantos cartões você sabia naquele momento. Isso depende dos parâmetros atuais do FSRS e usará os padrões se nenhum for encontrado (Mesmo se você estiver usando SM-2).
    Este gráfico não funcionará adequadamente com um histórico de revisão incompleto e não respeitará "ignorar revisões antes".

    No FSRS, cada cartão tem uma porcentagem de chance de ser lembrado conhecida como recuperabilidade. Esta é uma soma dessas porcentagens ao longo do tempo.
memorised-truncated-warning =
    É altamente recomendado que você use "Todo histórico" para este gráfico
        
    Este gráfico re-simula seu histórico de revisão, deixar o início de fora pode afetar
    grandemente os resultados.

fsrs-calibration = Calibração FSRS
fsrs-calibration-help = Isso compara a retenção média que o FSRS prevê que você deveria ter nos cartões (linha Perfeita/laranja) com a retenção que você realmente tem (linha Real/azul).

actual = Real

cards = Cartões
notes = Notas
average-retrievability = Média por Cartão
retrievability = Recuperabilidade
retrievability-and-stability = Recuperabilidade e Estabilidade
cards-and-stability = Cartões estáveis

# Between Minus Within? If I'm honest I have no idea what this stands for.
b-w-matrix = Matriz B-W

predicted = Previsto
actual = Real

show-question = Mostrar?
increase-date-range = Aumentar intervalo de datas

average-stability-over-time = Estabilidade ao Longo do Tempo
average-stability-over-time-help =
    Este gráfico representa como sua estabilidade média, que é independente da retenção desejada, evoluiu ao longo do tempo. A média dá um melhor senso de aumentos diários, enquanto a mediana dá um valor que é mais representativo da média real.

    Note que os valores jovem/maduro são baseados na quantidade dos respectivos cartões no baralho (se há 9 cartões jovens e 1 cartão maduro, 90% da barra será marcada como jovem). A maturidade de um cartão é calculada aqui usando a estabilidade, não o intervalo, o que também a torna independente da retenção desejada.

median = Mediana
mean = Média

interval-ratings = Avaliações de Intervalo
interval-ratings-help = Avaliações plotadas pelo intervalo que tinham antes de você avaliá-las.

time-ratings = Avaliações de Tempo
time-ratings-help = 
    Avaliações plotadas por quanto tempo você gastou olhando para um cartão antes de avaliá-lo. Respeita o "Máximo de segundos para resposta" das predefinições do baralho no momento em que a resposta foi revisada.

card-count-time-machine = Máquina do Tempo de Contagem de Cartões
card-count-time-machine-help = 
    Mostra suas contagens de tipos de cartão para uma data específica.
    
    Novos cartões suspensos contam como novos, não suspensos.

    Aprender e reaprender contam para o final do dia, e não para passos de aprendizagem maiores que 1 dia.
    ex: Você falhou em terminar os passos de aprendizagem naquele dia.

starts-at = Começa em
first-added = Primeiro Adicionado
first-review = Primeira Revisão
custom = Personalizado

card-type = Tipo de Cartão

review-interval-time-machine = Máquina do Tempo de Intervalo de Revisão
review-interval-time-machine-help = Mostra seus intervalos de revisão para uma data específica

stability-time-machine = Máquina do Tempo de Estabilidade
stability-time-machine-help = Mostra as estabilidades dos seus cartões para uma data específica

x-days-ago = {$days} dias atrás:

difficulty-time-machine = Máquina do Tempo de Dificuldade
difficulty-time-machine-help = Mostra as dificuldades dos seus cartões para uma data específica

# As in "zoom in" or "zoom out"
zoom = Zoom

daily-hourly-breakdown = Detalhamento Diário por Hora
daily-hourly-breakdown-help = 
    Mostra quando você fez revisões hora por hora em dias no intervalo X dias antes da data especificada.
    O gráfico interno do Anki não inclui revisões filtradas.

days = Dias
today = Hoje

burden-per-day = {$value} carga por {$n ->
        [one] dia
        *[many] {$n} dias
    }
stability-per-day = {$value} estabilidade por {$n ->
        [one] dia
        *[many] {$n} dias
    }
retention-per-day = {$value} retenção por {$n ->
        [one] dia
        *[many] {$n} dias
    }
retention-per-day-greater-interval = {$value} retenção por {$n ->
        [one] dia
        *[many] {$n} dias
    } intervalo maior
retention-per-second-spent = {$value} retenção por {$n ->
        [one] segundo
        *[many] {$n} segundos
    } gastos pensando
remembered-per-day = {$value} {$value ->
        [one] cartão
        *[many] cartões
    } lembrados por {$n ->
        [one] dia
        *[many] {$n} dias
    }
forgotten-per-day = {$value} {$value ->
        [one] cartão
        *[many] cartões
    } esquecidos por {$n ->
        [one] dia
        *[many] {$n} dias
    }

# About section

about = Sobre
translate = Traduzir

translate-instructions-1 = Traduções/locais atualmente disponíveis:
translate-instructions-2 = Para instruções de tradução, consulte "readme.md" encontrado na pasta de localização.
translate-current-locale = Seu código de local atual é: {$code}

translate-open-locale-folder = Abrir Pasta de Localização
translate-submit-to-github = Enviar Tradução no Github
translate-edit-existing-translations = Editar Traduções Existentes no Github

credits = Créditos
special-thanks = Agradecimentos Especiais

credits-llamas = 🦙 (siid): Security and other fixes
credits-Ross-Brown = Ross Brown: {sxr-heatmap}
credits-Jonathan-Schoreels = Jonathan Schoreels: {average-stability-over-time} and more.
credits-Huili-fox = Huili fox: Chinese localisation
credits-Jarrett-Ye = Jarrett Ye: Memorised graph
credits-Ishiko = Ishiko: Memorised graph

support = Apoie o Addon
like-on-ankiweb = Curtir no AnkiWeb 👍
star-on-github = Dar estrela no Github ⭐
sponsor-on-github = Me patrocine no Github ❤️
buy-me-a-coffee = Me pague um café ☕

# Graphs that are hidden by default, translate if you want to
bad-graph = Gráficos Ruins

# This tables description and help will most likely change or become a bad graph
leech-detector = Probabilidades de Lapso (Experimental)
leech-detector-help =
    Um gráfico clicável! O grau em que o número de lapsos dos cartões se desvia do que era esperado baseado na sua retenção.
    Quanto maior o valor, menos provável é que os cartões tenham esse número de lapsos.
    A fórmula para calcular isso pode mudar no futuro.

naive-sibling-similarity = Similaridade Ingênua de Irmãos
naive-sibling-similarity-help = 
    A avaliação que você deu aos cartões plotada pelo número de dias desde que você revisou um irmão daquele cartão (cartão originário da mesma nota). Revisões do mesmo cartão ou cartões onde qualquer cartão não é maduro não são contadas. Favor considerar o gráfico "avaliações de intervalo" ao interpretar este.

rating-fatigue = Fadiga de Avaliação
rating-fatigue-help =
    Avaliações plotadas por quantas revisões (que correspondem à pesquisa) você fez no total naquele dia antes de avaliá-las. Isso será afetado pela ordem de revisão/exibição do cartão.

fsrs-loss-by-fatigue = Perda FSRS por Fadiga
fsrs-loss-by-fatigue-help =
    Este gráfico mostra quão impreciso o FSRS é pelo número de revisões que você fez anteriormente naquele dia.
    Útil se você quiser definir um limite de revisão.

days-since-sibling-review = {$value} Dias desde revisão de irmão
x-previous-reviews = {$value} Revisões anteriores

retention-per-day-since-last-sibling-review = {$value} retenção por {$n ->
        [one] dia
        *[many] {$n} dias
    } desde última revisão de irmão

retention-per-prior-review-that-day = {$value} retenção por {$n ->
        [one] revisão anterior
        *[many] {$n} revisões anteriores
    }

loss-per-prior-review-that-day = {$value} perda por {$n ->
        [one] revisão anterior
        *[many] {$n} revisões anteriores
    }
