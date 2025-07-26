# title-search-stats-extended = Search Stats Extended:
title-search-stats-extended = Estatísticas de Busca Estendidas:

# Graph data
# Load as in card load
load = Carga
count = Contagem
lapses = Lapsos
repetitions = Repetições

cards = Cartões
card-load = Carga de Cartões
intervals = Intervalos
last-day = Último Dia

total-cards = Total de Cartões
x-total-cards = Total de Cartões: {$val}
total-load = Carga Total

mature-count = {mature}
young-count = {young}
learning-count = Em Aprendizagem
relearning-count = Em Reaprendizagem
new-count = Novos
suspended = Suspensos

learn = Aprender
mature = Maduro
young = Jovem
young-and-mature = Jovem+Maduro
all = Todos

again = Errei
hard = Difícil
good = Bom
easy = Fácil

# Graphs
no-data = SEM DADOS
fsrs-only = (Apenas FSRS)

pie = Pizza
bar = Barras

infinity = Infinito
steps = Passos

zero-inclusive = Incluir Zero
include-suspended = Incluir Suspensos
include-re-introduced = Incluir Reintroduzidos
include-filtered = Incluir Filtrados
bar-width = Largura da Barra
scroll = Rolagem
as-ratio = Como Proporção

loading = Carregando...

total = Total
trend = Tendência

percent-correct = {$percentage}% Corretas

future-due-types = Tipos de Vencimento Futuro
future-due-types-help =
    Este gráfico é o mesmo que o "Vencimento Futuro" acima, exceto que distingue entre os tipos de cartões.
    Muito útil se você tiver etapas de aprendizagem maiores que um dia.
future-due-retention = Retenção de Vencimento Futuro
future-due-retention-help =
    Como proporção, este gráfico mostra a retenção que o FSRS prevê que você terá nesse dia (Verifique "R{"\u00A0"}alvo" no navegador de cartões se tiver o addon auxiliar do FSRS).
    Sem ser como proporção, ele mostra quantos cartões o FSRS prevê que você acertará naquele dia.
    Não leva em conta o atraso.

pass = Acerto
fail = Erro

intra-day-due = Vencimento Intradiário
intra-day-due-help =
    Este gráfico mostra em que horas os cartões de hoje estão/estavam vencidos.
    Útil se você usa FSRS-5 com etapas de aprendizagem automáticas ou tem longos intervalos de aprendizagem intradiários.
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
    A retenção é usada
    para comparar quantos cartões você acertou e errou na primeira
    visualização.
amount = Quantidade
state = Estado

passed = Acertados
flunked = Errados
learning = Em Aprendizagem

custom-pie = Gráfico de Pizza Personalizado
custom-pie-help =
    Este gráfico de pizza mostrará a soma do valor solicitado para os cartões que correspondem
    à "Busca"
    para cada busca.

search = Busca
colour = Cor
search-string = Termo da Busca
css-colour = Cor CSS
new-search = Nova Busca
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
    A quantidade média de tempo
    que você levou para responder a cada cartão em um determinado dia.
    Observe que este gráfico respeita a opção "últimos 12 meses / todo o histórico"
    abaixo da barra de busca.
seconds-per-review = Tempo Gasto por Revisão (s)
average-second-per-day = {$value} {$value ->
        [one] segundo
        *[many] segundos
    } em média por {$n ->
        [one] dia
        *[many] {$n} dias
    }

sxr-heatmap = Mapa de Calor SxR
sxr-heatmap-help =
    Este gráfico mostra o número de cartões que possuem a estabilidade e a recuperabilidade fornecidas.
    Quanto mais vermelha a célula, mais cartões estão nesse "compartimento".
enlarged = Ampliado
logarithmic-s = S Logarítmico
r-bin-size = Tamanho do Compartimento R
s-bin-size = Tamanho do Compartimento S
retrievability-short = R
stability-short = S

card-count = Contagem de Cartões

interval-distribution = Distribuição de Intervalos
interval-distribution-help =
    Aqui você pode visualizar mais facilmente a distribuição dos seus Intervalos.
    Isso exibe os mesmos dados do gráfico "Intervalos de Revisão" padrão do Anki.
interval-load = Carga de Intervalo
interval-load-help =
    A carga é 1/intervalo para cada cartão e é usada para estimar quantos cartões você vê em um dia.
    Por exemplo, se um cartão tem um intervalo de 1, ele tem uma carga de 1 porque você o vê todos os dias.
    Se um cartão tem um intervalo de 2, ele tem uma carga de 0,5 e assim por diante.
highest-lapse-count = Maior Contagem de Lapsos
lapse-count = Contagem de Lapsos

lapse-load = Carga de Lapso
lapse-load-help =
    Este gráfico mostra a soma de "1 / intervalo" para os cartões que têm um determinado número de lapsos.
    Se você planeja suspender cartões com base no número de lapsos, isso pode ajudá-lo a encontrar um bom limiar se você compará-lo com o gráfico de contagem à esquerda para ver quantos cartões estão lhe dando quanta Carga.

lapse-distribution = Distribuição de Lapsos
lapse-distribution-help =
    Um cartão aumenta sua contagem de lapsos sempre que é revisado como "errei" enquanto não está no estado de aprendizagem.
    Lapsos são usados para monitorar quais cartões se tornam "sanguessugas". Por padrão, sempre que o cartão atinge 7 lapsos, ele é marcado como sanguessuga.
    Este valor pode ser modificado no limiar de sanguessuga nas configurações do baralho.
lapse-total = Total de Lapsos
lapse-total-help =
    Este gráfico mostra o número total de lapsos para cada cartão.
    Ex: se exatamente 2 cartões têm 3 lapsos cada, o total de lapsos para 3 seria 6.

highest-repetition-count = Mais Repetições
repetition-count = Repetições
total-repetitions = Total de Repetições

repetition-load = Carga de Repetição
repetition-load-help =
    Este gráfico mostra a soma de "1 / intervalo" para todos os cartões que têm um determinado número de repetições.
repetition-distribution = Distribuição de Repetições
repetition-distribution-help =
    Um cartão ganha uma repetição (comumente chamada de revisão) sempre que você o revisa.
repetition-total = Total de Repetições
repetition-total-help =
    Este gráfico mostra o número de repetições para cada cartão.
    Ex: se exatamente 2 cartões têm uma repetição por cartão de 3, o total de repetições para 3 seria 6.

preparing-review-stats = Preparando Estatísticas de Revisão...

review-graphs-warning-title = Gráficos de Revisão
review-graphs-prepare-graphs = Preparar Gráficos
review-graphs-warning = Estas estatísticas podem levar tempo para serem preparadas.
review-graphs-config-hint =
    Para carregar esses gráficos por padrão, defina "confirmExpensiveStats" como falso na configuração do addon.
generic-truncated-warning =
    Pode ser impreciso enquanto "todo o histórico" não estiver selecionado.
time-distribution = Distribuição de Tempo
time-distribution-help =
    Quantos cartões levaram um determinado tempo para serem respondidos em todas as revisões.
most-seconds = Mais Segundos
time-in-seconds = Tempo (s)
seconds = Segundos
total-seconds = Total (s)
seconds-per-card = Por cartão (s)

suspended-cards-warning =
    Para excluir cartões suspensos deste ou dos gráficos seguintes, você precisará adicionar manualmente "-is:suspended" à sua busca.
    Considere que isso pode causar inconsistências se você não o fizer para os gráficos acima.
time-totals = Totais de Tempo
time-totals-help =
    A quantidade de tempo que foi gasta em cartões que levaram um determinado tempo para serem respondidos em todas as revisões.

introduced = Introduzidos
re-introduced = Reintroduzidos
introduced-help =
    Um cartão é introduzido quando é mostrado a você pela primeira vez.
    Um cartão é reintroduzido quando é mostrado a você pela primeira vez após ser esquecido.
introduced-truncated-warning =
    Reintroduzido não funciona para cartões introduzidos antes da data de corte.
forgotten = Esquecidos
forgotten-help = Você "esquece" um cartão quando o marca manualmente como novo.
forgotten-truncated-warning = Não funciona para cartões introduzidos antes da data de corte.
forgotten-cards-not-yet-reintroduced = Cartões esquecidos ainda não reintroduzidos: {$number}

introductory-rating = Avaliação Introdutória
introductory-rating-help =
    A primeira avaliação que você deu a um cartão recém-introduzido.
    Importante para o FSRS.

load-trend = Tendência de Carga
load-trend-help =
    Isso mostra a mudança na carga ao longo do tempo.
    Para a barra de candlestick de tendência, uma barra verde mostra uma diminuição na carga naquele período (melhora), enquanto uma barra vermelha mostra um aumento.
x-change = Mudança: {$val}
x-total = Total: {$val}

learn-reviews-per-card = Revisões de Aprendizagem por Cartão
learn-reviews-per-card-help = O número de revisões necessárias antes que o cartão saísse da fase de aprendizagem (graduado).
    Reinicia para cartões que foram esquecidos.

ratings = Avaliações
ratings-help =
    A avaliação de cada revisão que você fez naquele dia, de aprendizagem ou não.
    A proporção exibe como uma porcentagem de todos os cartões revisados naquele dia.
    calcule (1-errei)% para obter sua retenção para aquele dia (mostrado como " % Corretas " na dica de ferramenta).
memorised = Memorizados
memorised-help =
    Uma estimativa do FSRS de quantos cartões você sabia em um determinado momento.
    Isso depende dos parâmetros atuais do FSRS e usará os padrões se nenhum for encontrado (mesmo se você estiver usando SM-2).
    Este gráfico não funcionará corretamente com um histórico de revisão incompleto e não respeitará "ignorar revisões antes de".
    No FSRS, cada cartão tem uma porcentagem de chance de ser lembrado, conhecida como recuperabilidade.
    Esta é uma soma dessas porcentagens ao longo do tempo.
memorised-truncated-warning =
    É altamente recomendável que você use "Todo o histórico" para este gráfico.

    Este gráfico ressimula seu histórico de revisões, omitir o início pode
    afetar muito os resultados.
fsrs-calibration = Calibração FSRS
fsrs-calibration-help = Isso compara a retenção média que o FSRS prevê que você deveria ter nos cartões (linha Perfeita/laranja) com a retenção que você realmente tem (linha Real/azul).
actual = Real

cards = Cartões
notes = Notas
average-retrievability = Média por Cartão
retrievability = Recuperabilidade
retrievability-and-stability = Recuperabilidade & Estabilidade
cards-and-stability = Cartões estáveis

# Between Minus Within?
If I'm honest I have no idea what this stands for. = Se eu for honesto, não tenho ideia do que isso significa.
b-w-matrix = Matriz B-W

predicted = Previsto
actual = Real

show-question = Mostrar?
increase-date-range = Aumentar intervalo de datas

average-stability-over-time = Estabilidade Média ao Longo do Tempo
average-stability-over-time-help =
    Este gráfico representa como sua estabilidade média, que é independente da retenção
    desejada, evoluiu ao longo do tempo.
    A média dá uma melhor noção dos aumentos diários,
    enquanto a mediana dá um valor mais representativo da média real.
    Note que os valores jovem/maduro são baseados na quantidade dos respectivos cartões no baralho (se houver 9 cartões jovens e 1 cartão maduro,
    90% da barra será marcada como jovem).
    A maturidade de um cartão é calculada aqui usando a estabilidade, não o intervalo,
    o que a torna também independente da retenção desejada.
median = Mediana
mean = Média

interval-ratings = Avaliações por Intervalo
interval-ratings-help = Avaliações plotadas pelo intervalo que tinham antes de você avaliá-los.
time-ratings = Avaliações por Tempo
time-ratings-help =
    Avaliações plotadas por quanto tempo você passou olhando para um cartão antes de avaliá-lo.
    Respeita os "Segundos máximos de resposta" das predefinições do baralho no momento em que a resposta foi revisada.
card-count-time-machine = Máquina do Tempo da Contagem de Cartões
card-count-time-machine-help =
    Mostra a contagem de tipos de seus cartões para uma data específica.
    Novos cartões suspensos contam como novos, não como suspensos.

    Aprender e reaprender contam para o final do dia, e não para etapas de aprendizagem maiores que 1 dia.
    Ex: Você não conseguiu terminar as etapas de aprendizagem naquele dia.
starts-at = Começa em
first-added = Adicionado Primeiro
first-review = Primeira Revisão
custom = Personalizado

card-type = Tipo de Cartão

review-interval-time-machine = Máquina do Tempo do Intervalo de Revisão
review-interval-time-machine-help = Mostra seus intervalos de revisão para uma data específica.

stability-time-machine = Máquina do Tempo da Estabilidade
stability-time-machine-help = Mostra as estabilidades dos seus cartões para uma data específica.

x-days-ago = {$days} dias atrás:

difficulty-time-machine = Máquina do Tempo da Dificuldade
difficulty-time-machine-help = Mostra as dificuldades dos seus cartões para uma data específica.

# As in "zoom in" or "zoom out"
zoom = Zoom

daily-hourly-breakdown = Detalhamento Diário por Hora
daily-hourly-breakdown-help =
    Mostra quando você fez revisões, hora a hora, nos dias do intervalo X dias antes da data especificada.
    O gráfico embutido do Anki não inclui revisões filtradas.

days = Dias
today = Hoje

burden-per-day = {$value} de carga por {$n ->
        [one] dia
        *[many] {$n} dias
    }
stability-per-day = {$value} de estabilidade por {$n ->
        [one] dia
        *[many] {$n} dias
    }
retention-per-day = {$value} de retenção por {$n ->
        [one] dia
        *[many] {$n} dias
    }
retention-per-day-greater-interval = {$value} de retenção por {$n ->
        [one] dia
        *[many] {$n} dias
    } intervalo maior
retention-per-second-spent = {$value} de retenção por {$n ->
        [one] segundo
        *[many] {$n} segundos
    } gasto pensando
remembered-per-day = {$value} {$value ->
        [one] cartão
        *[many] cartões
    } lembrado por {$n ->
        [one] dia
        *[many] {$n} dias
    }
forgotten-per-day = {$value} {$value ->
        [one] cartão
        *[many] cartões
    } esquecido por {$n ->
        [one] dia
        *[many] {$n} dias
    }

# About section

about = Sobre
translate = Traduzir

translate-instructions-1 = Traduções/locais atualmente disponíveis:
translate-instructions-2 = Para instruções de tradução, consulte "readme.md" encontrado na pasta de localidade.
translate-current-locale = O código da sua localidade atual é: {$code}

translate-open-locale-folder = Abrir Pasta de Localidade
translate-submit-to-github = Enviar Tradução no Github
translate-edit-existing-translations = Editar Traduções Existentes no Github

credits = Créditos
special-thanks = Agradecimentos Especiais

credits-llamas = 🦙 (siid): Segurança e outras correções
credits-Ross-Brown = Ross Brown: {sxr-heatmap}
credits-Jonathan-Schoreels = Jonathan Schoreels: {average-stability-over-time} e mais.
credits-Huili-fox = Huili fox: Localização para chinês
credits-Jarrett-Ye = Jarrett Ye: Gráfico de Memorizados
credits-Ishiko = Ishiko: Gráfico de Memorizados

support = Apoie o Addon
like-on-ankiweb = Curtir no AnkiWeb 👍
star-on-github = Estrela no Github ⭐
sponsor-on-github = Patrocine-me no Github ❤️
buy-me-a-coffee = Pague-me um café ☕

# Graphs that are hidden by default, translate if you want to
bad-graph = Gráficos Ruins

# This tables description and help will most likely change or become a bad graph
leech-detector = Chances de Lapso (Experimental)
leech-detector-help =
    Um gráfico clicável!
    O grau em que o número de lapsos dos cartões se desvia do esperado com base em sua retenção.
    Quanto maior o valor, menos provável é que os cartões tenham esse número de lapsos.
    A fórmula para calcular isso pode mudar no futuro.
naive-sibling-similarity = Similaridade Ingênua de Irmãos
naive-sibling-similarity-help =
    A avaliação que você deu aos cartões, plotada pelo número de dias desde que você revisou um irmão desse cartão (cartão originado da mesma nota).
    Revisões do mesmo cartão ou de cartões onde um dos dois não é maduro não são contadas.
    Considere o gráfico "avaliações por intervalo" ao interpretar este.
rating-fatigue = Fadiga de Avaliação
rating-fatigue-help =
    Avaliações plotadas por quantas revisões (que correspondem à busca) você fez no total naquele dia antes de avaliá-los.
    Isso será afetado pela ordem de revisão/exibição do cartão.

fsrs-loss-by-fatigue = Perda no FSRS por Fadiga
fsrs-loss-by-fatigue-help =
    Este gráfico exibe o quão impreciso o FSRS é pelo número de revisões que você fez anteriormente naquele dia.
    Útil se você quiser definir um limite de revisão.

days-since-sibling-review = {$value} Dias desde a revisão de um irmão
x-previous-reviews = {$value} Revisões anteriores

retention-per-day-since-last-sibling-review = {$value} de retenção por {$n ->
        [one] dia
        *[many] {$n} dias
    } desde a última revisão de um irmão

retention-per-prior-review-that-day = {$value} de retenção por {$n ->
        [one] revisão anterior
        *[many] {$n} revisões anteriores
    }

loss-per-prior-review-that-day = {$value} de perda por {$n ->
        [one] revisão anterior
        *[many] {$n} revisões anteriores
    }
