# 200 · Aparência "Nova": especificação de design

Card: `plan/200-direcao-visual-tvos.md` (aprovado pelo dono em 2026-10-31; as "Decisões do dono" no fim do card mandam
em tudo, e as "Decisões do dono depois do protótipo (2026-11-01)" dele e do `plan/214-perfis-do-meu-tv-os.md` vêm por
cima: esta versão já as aplica). Valores: `design/tokens-v2.json` (a Nova). `design/tokens.json` (v1) continua intacto: é a aparência
Clássica e a tabela de marcas. Protótipo: `design/prototype/index.html`.

O nome na tela é **Nova**. Nada da Apple: nenhum ícone, imagem, fonte SF Pro, glifo SF Symbols, a palavra "tvOS" ou
marca. Os símbolos do app continuam os de `app/assets/symbols`; o protótipo usa desenhos de linha feitos à mão só para
mostrar onde eles ficam.

## 0. Onde este trabalho difere do texto do card (e por quê)

O agente que encomendou o trabalho pediu nomes e escolhas um pouco diferentes do card. Segui o pedido e anoto aqui para
o validador:

| Card 200 diz | Entregue | Motivo |
|---|---|---|
| `design/tokens.json` v2 com seção `tvos` | `design/tokens-v2.json` (`version: 2`, `name: Nova`); v1 intacto | pedido explícito: v1 fica como a Clássica, sem risco de quebrar o 103 |
| protótipo em `design/tvos/` com CSS moderno | `design/prototype/` em **ES5 e CSS dentro dos limites do `web/`** | pedido explícito: o protótipo também prova que o visual cabe nas TVs antigas |
| `design/200-direcao-tvos.md` | este arquivo, `design/200-direcao-visual-tvos.md` | pedido explícito |
| tipografia com a Inter embutida | **Inter**, como o card pede | a primeira versão usou a fonte do sistema a pedido; o dono escolheu a Inter em 2026-11-01 (seção 2) |

O critério 2 do card ("todas as telas do item 2") está coberto pelos botões do protótipo: dia/noite, sem chave, 3, 8, 10
e 20 apps, normal/flat/lite e 1280×720 (seção 11).

## 1. As decisões do dono, aplicadas

| # | Decisão | Onde está nesta especificação |
|---|---|---|
| 1 | A faixa segue o app em foco: picks já baixadas desse serviço, depois Continuar assistindo, depois a arte do app; sem chave TMDB, a arte do app | seção 4 |
| 2 | Tiles com o logo sobre a cor da marca, iguais em Google TV, LG e Samsung | seção 6 |
| 3 | Fileira de favoritos + folha *All Apps*; card 205 fora da fase | seções 6 e 8 |
| 4 | Claro de dia, escuro à noite | seção 2, `color.day` / `color.night` |
| 5 | Abas viram um filtro discreto da faixa | seção 5 |
| 6 | Gaveta no ↓, com visual novo | seção 7 |
| 7 | Clássica/Nova durante a fase; no 212 a Nova vira o padrão e a Clássica fica como opção | seção 12 |
| 8 | Protetor de tela (213) no fim da fase | seção 12 |
| 9 | Metas ≤ 130 MB, ≤ 8% de quadros travados, p95 ≤ 22 ms, ≤ 1.000 ms a frio | seção 10 (orçamento) |
| 10 | Português e inglês desde o início | seção 13 |

Depois do protótipo (2026-11-01):

| Ajuste | Onde está |
|---|---|
| Fonte Inter, a que o app já embute | seção 2 (Tipografia) |
| Cotações saem da Nova; no lugar, a linha de informações da TV, com teste de velocidade sob pedido (Cloudflare) | seção 3 |
| Faixa: Continuar assistindo e picks do app no mesmo carrossel | seção 4 |
| Gaveta só com o clima (as cotações ficam na Clássica) | seção 7 |
| Cor ouro no lugar do vermelho na paleta de perfis | seções 14 e 15 |
| Perfil infantil (selo discreto, picks filtradas por idade) e "só o Principal" sem a pergunta ao ligar | seção 15 |

## 2. A tela Nova em 1920×1080

```
 0 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
   │ (foto da faixa, de borda a borda, de y=0 a y=820; escurecida em cima e à esquerda)        │
60 │  [Explorar] Filmes Séries  São Paulo · 24 °C · 4K · 60 Hz · [↓ 230 Mbps · há 2 h]  (TV)(HDMI)(⚙)(E) 17:40 │ 64 px
124│                                                            dica do botão em foco ↓ (y≈150) │
   │                                                                                           │
410│  Netflix · Filme                                    ← linha de apoio, 26 px                │
500│  A Última Maré                                      ← título, 80 px (64 se longo), 2 linhas│
552│  2025 · Suspense · 1 h 58 min                       ← metadados, 28 px                     │
584│  [▶ Assistir]  ● ○ ○                                ← pílula só com foco na faixa; pontos  │
640│ ......................... a foto se dissolve no fundo (dia: claro, noite: escuro) ........ │
770│  ‹                                                                                     ›   │ setas: há mais apps
820│  ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐                   │
   │  │Netflix │ 57  │YouTube │     │ Prime  │     │Disney+ │     │  Max   │   tiles 300×169    │
989│  └────────┘     └────────┘     └────────┘     └────────┘     └────────┘                   │
1020 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ limite da área segura ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
1080└───────────────────────────────────────────────────────────────────────────────────────────┘
     x=96                                                                              x=1824
```

- **Área segura de 5%:** 96 px dos lados e 60 px em cima e embaixo (`layout.1080p.safe_area`). Todo texto e todo item
  que recebe foco fica dentro. Fotos, degradês e sombras podem ir até a borda.
- **Grade:** 5 colunas de 300 px com 57 px de vão, que somam exatamente os 1.728 px da largura segura. O texto da faixa,
  a fileira, a gaveta e o *All Apps* começam todos em x=96.
- **Fundo ("céu"):** dia `#ECECF0`, noite `#0C0C0F`, sólidos. A troca dia/noite acontece pela opacidade das duas
  camadas em 2 s. As cores de texto mudam de uma vez, sem animação de cor.
- **A faixa é sempre uma foto:** o texto dela é branco de dia e de noite, sobre véus escuros (seção 4). O resto da
  tela segue o tema: tinta escura de dia, clara à noite.

### Tipografia: Inter

Decisão do dono (2026-11-01): a Nova usa a **Inter**, a fonte que o app já embute (`app/assets/fonts/InterVariable.ttf`,
variável, pesos 100 a 900 e tamanho óptico 14 a 32, licença OFL em `OFL.txt` ao lado). Nada é baixado.

- **Android:** como hoje, `Ui.font()` cria cada peso com `Typeface.Builder(assets, "fonts/InterVariable.ttf")` e
  `setFontVariationSettings("'opsz' N, 'wght' W")` (API 26, então vale no Android 8). Textos de 24 a 34 px usam as
  instâncias de texto (`opsz` 14: `regular`, `medium`, `semibold`); relógio, títulos de folha e letras de perfil, as de
  display (`opsz` 32: `displayMedium`, `displaySemibold`, `light` na temperatura). A Nova pede **uma instância nova**,
  `displayBold` (`opsz` 32, `wght` 700), para o título da faixa e o nome no tile, criada uma vez no `Ui.init`. Sem o
  arquivo, cai na fonte do sistema (como hoje). CJK e devanágari seguem na fonte do sistema.
- **web (LG e Samsung):** o `@font-face` que `web/home.css` já tem (`fonts/InterVariable.ttf`, que `tools/webapp.py`
  copia de `app/assets/fonts` para o pacote) e a pilha `'Inter', 'LG Smart UI', 'SamsungOne', 'Samsung Sans', Roboto,
  'Helvetica Neue', Arial, sans-serif`. Chromium anterior ao 62 (webOS 3 e 4, Tizen 3) não tem fonte variável: desenha a
  instância padrão (400) e engrossa por síntese de 600 para cima, como o `web/` já faz hoje.
- **Algarismos tabulares** (relógio, temperatura, velocidade): `tnum`, como antes.
- **Protótipo:** `web/` não tem cópia do arquivo (o build copia na hora), então `proto.css` aponta para o arquivo do
  próprio repositório, `../../app/assets/fonts/InterVariable.ttf`, relativo a `design/prototype/`. Aberto por `file://`,
  Chrome e Safari carregam; o Firefox recusa fonte de uma pasta acima da página e desenha com a pilha de reserva. Nada
  vem da rede.

### Em 1280×720 (TCL de 1 GB)

Tudo vezes 2/3: área segura de 64/40, tiles de 200×113 (220×124 em foco), vão de 38, faixa de 1280×547, título de 53 px,
texto mínimo de 16 px (que equivale a 24 px a 1080p), linha de informações de 16 px com a cápsula da velocidade de 37 px
de altura e a barra de progresso de 80×3. Os bitmaps (logos, tiles, véus) são gerados nesse tamanho, nunca
em 1080p reduzido (`layout.720p`). No protótipo, o botão **1280×720 (R)** mostra a tela exatamente nesse tamanho.

## 3. Barra superior

Da esquerda para a direita, em y=60, com 64 px de altura:

1. **Abas-filtro** Explorar · Filmes · Séries (seção 5).
2. **Linha de informações da TV**, a 32 px das abas (abaixo). Na Nova ela fica **no lugar das cotações**, que saem da
   tela Nova (continuam na Clássica, se ligadas).
3. **Botões redondos** de 64 px: TV aberta, Entradas HDMI e Configurações, mais os extras de *Top Buttons* e *Recent
   Apps* à esquerda deles (`HomeApps.MAX_TOP`). Os botões ficam a 32 px à esquerda do relógio. Também entram aqui, à
   esquerda dos botões: a cápsula de *Now Playing* (quando o listener está permitido e há algo tocando) e os ícones de
   status (quando estão ligados).
4. **Perfil** (só na Nova): o último botão redondo, logo à esquerda do relógio, com a inicial e a cor do perfil ativo
   (seção 15).
5. **Relógio**, que não recebe foco: 34 px, peso 600, branco, borda direita em x=1824.

Os botões em repouso usam vidro fino com o símbolo branco de 28 px. Em foco, a superfície fica branca, o símbolo escuro,
a escala vai a 1,12, e o nome aparece embaixo (24 px, branco, sobre o véu de cima, 5,6:1 no pior caso). O nome do
último botão fica alinhado à direita, para não sair da área segura.

**Ordem do foco na barra** (uma linha só, sem dar a volta): abas (com chave TMDB) → **velocidade** → extras → TV aberta
→ Entradas → Configurações → Perfil. O relógio e o resto da linha de informações não recebem foco.

### Linha de informações da TV

```
60 │ [Explorar] Filmes Séries   São Paulo · 24 °C · 4K · 60 Hz · ↓ 230 Mbps · há 2 h      (TV)(HDMI)(⚙)(E)  17:40 │
   │                            └──────────── texto, 24/500 ───┘ └── velocidade: cápsula de foco ──┘              │
```

- **Texto:** 24/500, branco 78% (o mesmo das abas não selecionadas: 10,68:1 no pior caso), algarismos tabulares,
  separadores " · " com 10 px de cada lado. Sem fundo: fica sobre o véu de cima, como as abas.
- **Partes, na ordem:**
  - **Cidade:** a configurada (`config.properties`, ou a do fuso horário na build `--generic`, `Place`). Nunca GPS nem
    localização por IP.
  - **Temperatura:** a da previsão que o app já busca (`HomeData` no Android, `Data` no web), arredondada: "24 °C" (°F
    quando a build está em F, como o painel do clima). Some até a primeira previsão chegar.
  - **Resolução e atualização:** Android, o modo atual da tela (`Display.getMode()`: tamanho físico → 8K, 4K, 1080p,
    720p; a taxa arredondada, 59,94 → "60 Hz"). Web, aproximada: LG pelo `getSystemInfo` (`UHD` → 4K, senão 1080p),
    Samsung pelo `tizen.systeminfo` (`DISPLAY`); **sem Hz no web** (o navegador não lê o do painel).
  - **Velocidade:** o último teste (só download, por isso a seta ↓) e quando foi. É a única parte com foco (abaixo).
- **Quando não cabe** (até 32 px antes do item mais à esquerda da direita: *Now Playing*, status, extras ou botões),
  as partes saem nesta ordem: Hz, resolução, temperatura, cidade. A velocidade nunca sai, porque tem foco. O cálculo
  é feito quando o conteúdo muda (não a cada quadro).
- **Números:** "230 Mbps" sem casa decimal de 10 para cima, "8,4 Mbps" abaixo de 10, "1,2 Gbps" de 1.000 para cima,
  no formato de `Ui.locale()`. Quando: "agora", "há 5 min", "há 2 h", "ontem", "há 3 dias".
- **É da TV, não do perfil:** trocar de perfil não muda a linha.

### Item da velocidade (foco próprio)

| Estado | Texto | OK |
|---|---|---|
| Com resultado | "↓ 230 Mbps · há 2 h" | roda o teste de novo |
| Sem teste ainda | "Testar velocidade" | roda o teste |
| Testando | "Testando…" e uma barra de 120×4 embaixo do texto, que enche em ~10 s | nada (já está testando) |
| Falhou | símbolo de aviso de 20 px + "Teste falhou", em branco 100% | tenta de novo |
| Sem rede | símbolo de aviso + "Sem internet", em branco 100% | só um aviso: "Sem conexão com a internet" (não testa) |

- **Repouso:** só o texto, dentro de uma cápsula invisível de 56 px de altura e 20 px de margem interna, para o foco
  ter onde crescer sem cobrir o separador.
- **Foco:** igual a uma aba: superfície branca, tinta `#1D1D1F` (16,83:1), escala 1,06 crescendo para a direita
  (origem na borda esquerda, para não cobrir o "·" anterior), sombra da pílula. A barra de progresso, em foco, passa
  a tinta escura sobre trilho de tinta a 25%; fora de foco, branco sobre branco a 30%.
- **Falha e sem rede:** não dependem só da cor: há o símbolo de aviso e o texto diz o que houve. "Teste falhou" fica até
  o foco sair do item; depois volta o último resultado (que nunca é apagado) ou "Testar velocidade". "Sem internet"
  fica enquanto a TV não tem rede (Android: rede padrão do `ConnectivityManager`; web: `navigator.onLine` falso e a
  última busca falhando); o resultado antigo fica escondido, não apagado, e volta com a rede.
- **Sem rede de todo:** cidade e resolução continuam (são locais); a temperatura mostra a última previsão enquanto o
  app a guarda, senão sai.
- **O teste:** só quando a pessoa aperta OK nesse item; nunca sozinho, nunca por agenda (decisão do dono). Servidor da
  **Cloudflare** (`speed.cloudflare.com`, sem chave; endereço novo aprovado pelo dono em 2026-11-01, o card 215 o põe
  na lista do CLAUDE.md e do README). Alguns pedidos minúsculos para a latência, depois downloads de tamanho crescente
  até 10 s ou 200 MB, o que vier antes; o resultado é a mediana da vazão dos downloads maiores. Roda fora da thread de
  UI (no Android, nada pode escapar da thread: o watchdog do `:home` conta como queda); no web, XHR.
- **Progresso:** a barra enche por `scaleX`, atualizada 4 vezes por segundo (não a cada quadro). No LEGACY, só o
  retângulo do item é redesenhado nessas atualizações.
- **Cancelar:** sair do Início (abrir um app: `onPause`, ou `visibilitychange` no web) cancela e mantém o resultado
  antigo. Setas e Voltar não cancelam: a pessoa pode sair do item e a linha continua atualizando.
- **Voltar no item:** como em toda a barra, vai para a fileira, no app dono da faixa (o teste segue).
- **TalkBack:**
  - com resultado: "Velocidade da internet: 230 megabits, testada há 2 horas. OK para testar de novo";
  - sem teste: "Velocidade da internet: ainda não testada. OK para testar";
  - ao começar: anuncia "Testando a velocidade da internet"; ao terminar, "Velocidade da internet: 230 megabits";
  - falhou: "O teste de velocidade falhou. OK para tentar de novo";
  - sem rede: "Sem conexão com a internet".
- **Mouse e Magic Remote:** o ponteiro sobre o item move o foco para ele; um clique é o OK.
- **1280×720:** texto de 16, cápsula de 37 com margem de 13, barra de 80×3, símbolo de 13.
- **`lite` e LEGACY:** sem sombra e sem transição; a barra anda em degraus de 250 ms.

## 4. Faixa de destaque (segue o app em foco)

### Conteúdo, na ordem decidida

Com o foco num tile da fileira, depois de **500 ms parado** (como o `BG_FOLLOW_MS` de hoje), a faixa mostra **um
carrossel só, com um conjunto de pontos** (decisão do dono, 2026-11-01):

1. **Continuar assistindo desse app** (`WatchNext`), primeiro, só se a opção estiver ligada em Home Settings. No máximo
   3, do mais recente para o mais antigo. Só existe no Android; no web essa parte é vazia.
2. **Depois, as picks já baixadas** cujo serviço é esse app (`Recs.Pick.app`; no web, `SERVICES` de `web/data.js`).
   No máximo 5, na ordem do `Recs`. Juntos, no máximo 8 pontos.
3. **Nenhum dos dois: a arte do app.** É o degradê da marca (`tokens.json` → `brand.<key>.tile`) de borda a borda, com
   o logo recortado grande na metade direita (até 640×240, centro em x=1340, y=360, desenhado por cima dos véus) e o
   nome do app como título. Nesse caso a faixa não recebe foco.

- **A aba filtra as duas partes:** Explorar mostra tudo, Filmes só `movie`, Séries só `tv`. Os itens de Continuar pelo
  tipo do `WatchNext` (filme ou episódio); um item sem tipo (um vídeo do YouTube) aparece em todas as abas.
- **Sem repetir:** uma pick que também está em Continuar (mesmo id do TMDB; sem id, o mesmo título) aparece uma vez só,
  como Continuar.
- **Cada item diz o que é:** nos de Continuar, a linha de apoio é "Continuar assistindo · {app}", há a barra de
  progresso de 360×6 debaixo dos metadados e a pílula diz **"Continuar"**; nas picks, a linha de apoio é "{app} ·
  Filme/Série", sem barra, e a pílula diz **"Assistir"**. Os pontos não mudam de forma: é a mesma fila.
- **Foco inicial na faixa:** o 1º item (o Continuar mais recente, quando há).
- **Sem chave TMDB:** não há picks. A faixa mostra Continuar assistindo (Android, se ligado) ou a arte do app. As abas
  somem, como hoje, porque não há o que filtrar.
- **Perfil infantil** (seção 15): as picks vêm da lista infantil; Continuar assistindo fica como está.
- **Sem favoritos** (fileira vazia): picks gerais (card 206); sem picks, uma das suas fotos (`Photos`); sem fotos, a
  aurora (`Scene`).
- **Com o foco fora da fileira** (na faixa, na barra ou na gaveta): a faixa continua com o app de onde o foco saiu
  (padrão aceito pelo dono, também sem chave).
- **Sem rotação automática:** nada é decodificado sem um toque no controle.

Ficou fora, como diz o card 207: canais de prévia de outros apps (exigiriam permissão nova) e busca de picks por app a
cada foco (exigiria chamadas de rede novas).

### Elementos e medidas

| Elemento | Medida | Estilo |
|---|---|---|
| Foto | 0..1920 × 0..820 | `w1280` do TMDB esticada; troca por crossfade de 420 ms |
| Véu de cima | y 0→340: preto 0,66 → 0,58 (em 200) → 0 | para a barra superior |
| Véu da esquerda | x 0→90%: preto 0,75 → 0,62 (em 55%) → 0 | para o texto, ≥ 6,2:1 até x=1056 sobre foto branca |
| Dissolução | y 640→820, opaca a partir de 85% | vai para a cor do céu (dia ou noite) |
| Linha de apoio | base em y=410, 26/600, branco 86% | "Netflix · Filme" / "Continuar assistindo · YouTube" |
| Título | última linha com base em y=500, 80/700 (64 se não couber em 2 linhas), largura até 960 | cresce para cima |
| Metadados | base em y=552, 28/500, branco 86% | ano · gênero · duração ou temporadas (o `meta` de hoje) |
| Pílula de ação | y 584, altura 56, 28/600, branco com tinta `#1D1D1F` | só aparece com a faixa em foco |
| Barra de progresso (só Continuar) | 360×6, 14 px abaixo dos metadados | trilho branco 30%, preenchido branco |
| Pontos do carrossel | 10 px, vão de 14, y=612; até 8 | ativo branco e 1,3×; inativo branco 56% (3,2:1). Com a faixa em foco, deslizam para a direita da pílula |

**Troca de conteúdo:** o texto some em 120 ms, troca e volta em 200 ms. A foto troca por opacidade em 420 ms, só depois
de decodificada (`prepareToDraw` no Android). Uma pedida nova cancela a anterior (geração), e passar correndo pela
fileira não decodifica nada.

## 5. Abas como filtro discreto

- Ficam na barra superior, em x=96, sem fundo: texto branco a 78%, 28/500.
- **Selecionada:** branco, peso 600, e uma cápsula branca a 16%. A diferença não depende só da cor: muda o peso e
  aparece a cápsula.
- **Em foco:** superfície branca, tinta escura, escala 1,06, sombra da pílula.
- **Comportamento:** como hoje, focar uma aba já a seleciona. A faixa refiltra quando o foco para por 500 ms (passar
  correndo pelas abas a caminho dos botões não decodifica nada); se a pessoa aperta ↓ antes disso, o filtro vale na
  hora.
- Sem chave TMDB, as abas ficam escondidas e o foco da barra começa no item da velocidade.

## 6. Fileira de favoritos

- **Tiles de 300×169** (16:9, o mesmo tamanho das células do *All Apps* de hoje), com raio 28 e vão de 57. Cabem 5 por
  vez, alinhados à esquerda em x=96: com 3 apps ficam três tiles à esquerda, sem centralizar. Com mais de 5, a fileira
  desliza um app por vez com o foco (como o `shelfFirst` de hoje). Os tiles que saem da janela somem por opacidade, e
  uma seta de 24 px aparece em y=770 do lado onde há mais apps (cinza `#7A7A80`, 3,6:1 de dia e 4,6:1 à noite).
- **A prateleira de vidro (platter) sai:** os tiles ficam direto sobre o céu.
- **Arte:** logo sobre a cor da marca, igual nas três plataformas. O degradê vem de `tokens.json → brand.<key>.tile`
  (Spotify: `tokens-v2.json → brand_nova.spotify`). O logo é recortado como hoje (`crispLogo` no Android, `lift()` no
  web), numa caixa de até 72% × 50% do tile, cobrindo uns 14% de área de tinta (hoje são 8,5% num tile com metade da
  área).
- **Sem logo** (Samsung sem ícone empacotado, apps desconhecidos): o nome do app em 24 a 40 px, peso 700, na cor
  `brand_nova.<key>.word`. Nos degradês claros (Prime, Globoplay, Spotify), leva uma sombra estática de 1 px.
- **Cache:** os bitmaps de repouso (300×169) e de foco (330×186) servem também para as células do *All Apps*, que têm o
  mesmo tamanho. São ~0,45 MB por app em ARGB, ~4,5 MB com 10 apps. Na 720p, 200×113 e 220×124.
- **À noite:** um contorno interno de 1 px, branco a 10%, para que tiles escuros (Netflix, YouTube, Claro tv+) não se
  percam no céu escuro.
- **Reordenar** (segurar OK): como hoje. O tile sobe (escala 1,10 e +12 px), balança 1,5°, ←/→ move, OK solta e Voltar
  cancela.

## 7. Gaveta (↓ na fileira)

- Tudo sobe 560 px. A faixa, o texto e a barra superior somem por opacidade em 200 ms. A fileira fica visível em
  y=260, sem foco, como referência. O céu clareia (de dia) ou escurece (à noite) por uma camada de opacidade 0,32/0,42.
- **Grupos:** títulos de 26/600 com base em y=500: *Entradas* (HDMI, TV ao vivo) e *Atalhos* (*Todos os Apps*, *Ajustes
  do Início*, *Ajustes da TV* e os tiles de Home Assistant).
- **Teclas:** vidro normal, até 240×140, raio 24, vão de 18 (56 entre os grupos), símbolo de 36 px e rótulo de 24/500.
  Em foco: superfície branca, escala 1,07 e sombra `key_focus`. Entrada sem sinal: rótulo `#6A6A70` de dia (5,25:1) e
  branco 50% à noite.
- **Painel:** só o clima, na largura segura toda (1.728), em y=704, com 300 de altura, raio 32 e vidro normal: a
  cidade, a temperatura, a condição, máxima e mínima à esquerda, e até 10 horas à direita (passo de 126 px). As
  **cotações saem da Nova** também aqui (decisão do dono, 2026-11-01); a Clássica continua com elas, se ligadas. Os
  textos sobem a 24 px no mínimo (hoje há 21 a 23 px). No `Ui.LEGACY` continua vindo do `Snapshot`.

## 8. All Apps

- É uma folha de vidro grosso sobre a tela toda. Sem blur real (web e LEGACY), ela é quase opaca (`rgba(12,12,15,0.94)`)
  e o que está embaixo some, para nenhum tile aparecer através dela.
- Título "Todos os Apps" em 40/600, x=96, y=70. A grade tem 5 colunas de 300×169 na **mesma grade da fileira**
  (x = 96 + 357·c), com 240 px entre as linhas, e o rótulo de 24 px embaixo de cada tile (branco 66%, branco puro em
  foco).
- O foco é igual ao do tile da fileira. A grade desliza por linhas, para manter a linha em foco entre a 1ª e a 3ª visível.
- Abre por *Atalhos → Todos os Apps* na gaveta ou pelo botão *All Apps* do controle (`Prefs.ALL_APPS`, como hoje).

## 9. Estados de foco, setas, OK e Voltar

### Foco por elemento

| Elemento | Repouso | Foco | `lite` (e Tizen 2.4) |
|---|---|---|---|
| Tile (fileira e *All Apps*) | escala 1; sombra 0 6 16 (dia 0,16 / noite 0,36) | escala 1,10, sobe 6 px; sombra 0 26 44 (0,38 / 0,62); brilho branco 20% → 0 até 55% da altura; contorno interno de 1,5 px branco 22%; paralaxe do brilho ±8 px na direção da última seta | escala 1,10 instantânea, sem sombra nem brilho; anel branco de 3 px |
| Faixa | — | pílula branca aparece (escala 1,06) e os pontos deslizam | pílula sem animação |
| Aba | texto branco 78% | superfície branca, escala 1,06 | igual, sem animação nem sombra |
| Velocidade (linha de informações) | texto branco 78%, sem fundo | superfície branca, tinta escura, escala 1,06 para a direita, sombra da pílula | igual, sem animação nem sombra; barra em degraus |
| Botão redondo | vidro fino | superfície branca, escala 1,12, nome embaixo | igual, vidro sólido `#2A2A2D` |
| Tecla da gaveta | vidro normal | superfície branca, escala 1,07 | igual, vidro sólido |
| Botão de perfil | disco na cor do perfil, inicial branca; perfil infantil com o selo de 22 px | superfície branca, inicial na cor, escala 1,12, nome embaixo; o selo fica | igual, sem animação |
| Círculo da folha de perfis | disco na cor, nome branco 66% | escala 1,10, sombra, anel branco de 6 px, nome branco | anel sem sombra nem animação |

Nenhum foco depende só de cor: há sempre escala e uma superfície ou brilho mais claro.

### Navegação

| Zona | ← / → | ↑ | ↓ | OK | Voltar |
|---|---|---|---|---|---|
| **Fileira** (foco inicial: 1º app) | app anterior/próximo; a fileira desliza além de 5 | aplica a faixa do app em foco na hora; vai para a faixa se ela tiver itens, senão para a barra (aba selecionada, ou a velocidade sem chave) | abre a gaveta, na tecla mais próxima do tile | abre o app (nível 1) | Android: nada (já é o Início); web: `TV.back()` como hoje; reordenando: cancela |
| **Faixa** | item anterior/próximo do carrossel, Continuar e picks na mesma fila (para nas pontas) | barra superior (aba selecionada; sem chave, a velocidade) | fileira, no app dono da faixa | Continuar: continua o Watch Next; pick: abre (`Recs.Pick.link` ou o app); segurar OK abre o menu do item (210) | fileira, no app dono |
| **Barra superior** | abas, velocidade e botões numa linha só, sem dar a volta; focar uma aba a seleciona | — | faixa se tiver itens, senão a fileira | aba: nada (já selecionada); velocidade: roda o teste (seção 3); TV aberta; Entradas abre a gaveta no 1º HDMI; Configurações; Perfil abre a folha | fileira, no app dono (um teste em andamento continua) |
| **Gaveta** | tecla anterior/próxima | fecha (volta à fileira, no tile mais próximo) | — | abre a entrada, o atalho ou o *All Apps* | fecha |
| ***All Apps*** | célula na mesma linha | linha de cima | linha de baixo | abre o app (nível 3) | fecha e volta para onde abriu |
| **Folha de perfis** (seção 15) | perfil anterior/próximo, para nas pontas | — | — | troca de perfil e vai à fileira, no 1º app; no mesmo perfil, só fecha; em *Adicionar*, abre a criação (214) | fecha sem trocar e volta para onde abriu |

**Níveis até um app:** fileira → app (1); faixa → item (1); gaveta → *All Apps* → app (3). Nunca mais que 3. O teste de
velocidade não leva a lugar nenhum: fica na mesma tela.

**Mouse e Magic Remote** (card 211): clicar age no que está sob o ponteiro. Passar o ponteiro só move o foco quando
entra em outro item, nunca num tile que faria a fileira rolar. Na faixa, o ponteiro foca a pílula só quando a faixa
recebe foco.

## 10. Efeitos pesados e o fallback de cada caminho

| Efeito | Android 13+ | Android 9–12 (≥ 3 GB) | `Ui.LEGACY` (TCL) | web | web `flat` | web `lite` |
|---|---|---|---|---|---|---|
| Sombra do tile | bitmaps do `Shadows` (repouso e foco) na camada; troca por alfa | igual | só bitmaps do `Shadows`, nunca `BlurMaskFilter` por quadro; só o tile em foco desenha a sombra funda | `.shadow` separado com `box-shadow` fixo, anima **opacidade** | estática, aparece de uma vez | nenhuma |
| Brilho e contorno | `LinearGradient` criado uma vez por tamanho | igual | igual (barato) | `.sheen`: opacidade e `translateX` | sem paralaxe | nenhum (anel branco) |
| Paralaxe | mola por zona, não por tile | igual | desligada | `transform` | desligada | desligada |
| Foto da faixa | nítida, ARGB, crossfade | igual | RGB_565 (1,8 MB cada), crossfade de 420 ms | `w1280`, duas `div` com opacidade | igual | `w780`, troca sem crossfade |
| Véus da faixa | shaders feitos uma vez | igual | igual | `linear-gradient` estático | igual | igual |
| Vidro fino | AGSL (`Scene`), blur 24 | tinta sólida 0,55 | sólido 0,62 | degradê rgba | igual | sólido `#2A2A2D` |
| Vidro normal | AGSL | cópia 480×270 do `Backdrop` + tinta | sólido (`#F7F7F9` / `#1F1F23`) | degradê rgba como hoje | sem sombra | sólido (`#FAFAFC` / `#1E1E22`) |
| Vidro grosso | AGSL, blur 40 | cópia 192×108 + tinta | sólido 0,96 | quase opaco, o fundo some | igual | sólido `#141418` |
| Molas e transições | `Spring` (`motion`) | igual | igual | `transition` em `transform`/`opacity` | camadas só no que desliza | 0 ms |
| Barra do teste de velocidade | retângulo na camada da barra, 4 atualizações/s | igual | igual, só o retângulo do item é invalidado | `scaleX` com transição de 250 ms | igual | degraus de 250 ms |
| Selo infantil | disco + símbolo desenhados na camada | igual | igual (sem sombra) | elemento à parte | igual | sem sombra; anel sólido |

O `lite` do protótipo é também o que o `Ui.LEGACY` mostra, só que o LEGACY mantém as sombras em cache.

**Orçamento (TCL, 2 GB, LEGACY):**
- **Faixa:** no máximo 2 fotos vivas (a atual e a da transição), cada uma `w1280` em RGB_565, ~3,7 MB juntas. Nenhum
  endpoint ou domínio novo (`image.tmdb.org`).
- **Arte do app:** um bitmap de logo (até 640×240, ~0,6 MB) para o app atual e o anterior.
- **Tiles:** ~4,5 MB com 10 apps, contra ~2,7 MB hoje, e a mesma memória serve o *All Apps*.
- **O que sai da tela:** os 3 cards das picks e a prateleira de vidro. Isso devolve memória e desenho.
- **Web:** `will-change` só no tile em foco e no que desliza, nunca em todos os tiles.
- **Teste de velocidade:** o que chega é lido num buffer de 64 KB reaproveitado e descartado; nada fica na memória nem
  no disco. Só o resultado (número e hora) fica guardado (`Prefs` no Android, `localStorage` no web). Nada roda enquanto
  ninguém aperta OK.
- **Perfil infantil:** uma lista de picks a mais (só texto e os caminhos das imagens), no cache dela; as fotos seguem o
  mesmo limite de 2 vivas.

**R30 da Nova** (para o protocolo M do card 201): a mesma sequência de 24 toques a cada ~0,5 s, repetida até 30 s.
1. Começa na fileira, em Netflix.
2. → ×7 até o 8º app; a fileira desliza 3.
3. ← ×7 de volta.
4. ↑ entra na faixa (Netflix tem Continuar e picks no mesmo carrossel); → ×3 e ← ×3 pelo carrossel; quando há menos de
   4 itens, os toques sobrando param na ponta.
5. ↓ volta à fileira; ↓ abre a gaveta; ↑ fecha.

## 11. Protótipo (`design/prototype/index.html`)

- **Abrir:** direto do disco (`file://`), sem servidor. Não carrega nada da rede: nenhuma imagem, e a única fonte é a
  Inter do próprio repositório (seção 2; onde o navegador recusa, a pilha de reserva). Tudo é CSS, texto e SVG simples
  feito à mão. O teste de velocidade é **simulado**: nenhum byte é baixado.
- **Teclas:** setas, Enter (OK), Esc ou Backspace (Voltar). Os atalhos da barra de cima, fora da tela da TV:
  - **N:** dia/noite.
  - **L:** normal → `flat` → `lite`.
  - **K:** com ou sem chave TMDB.
  - **A:** 10 → 20 → 3 → 8 apps (do perfil ativo).
  - **C:** Continuar assistindo ligado ou desligado.
  - **R:** ajustar à janela ou 1280×720 exatos.
  - **P:** abre a folha "Quem está assistindo?" (seção 15).
  - **U:** três perfis (Ana, Léo, Crianças) ou só o Principal.
  - **O:** simula ligar a TV (início completo): com 2 ou mais perfis abre a folha; só com o Principal, não.
  - **V:** a rede simulada para a velocidade: testada há 2 h → nunca testada → o teste falha (aos 4 s) → sem rede.
    OK no item roda o teste simulado: "Testando…" com a barra por 10 s e um resultado entre 180 e 260 Mbps.
  - **3:** só o que o card 203 entrega (tiles grandes sobre a Nova de hoje; `#card=203`), com **T** (logo ou só nome)
    e **G** (guias). Ver `design/203-tiles-grandes.md`, seção 9.
- **Estados por endereço**, para capturas e para o validador. Exemplos:
  - `index.html#keys=rrrru`: foco no 5º app (Max), depois ↑ para a faixa.
  - `#night=1&perf=lite&key=0&apps=20&cont=0&hd=1&profile=1&speed=2&single=1&start=1&keys=…`; nas teclas, `l r u d`
    são as setas, `o` é OK, `b` é Voltar e `p` abre a folha de perfis. `profile=` escolhe o perfil inicial (0 Ana,
    1 Léo, 2 Crianças); `apps=` vale para o primeiro perfil; `speed=` 0 testada, 1 nunca, 2 falha, 3 sem rede;
    `single=1` só o Principal; `start=1` começa com um início completo.
  - `#keys=uuurrr`: foco na velocidade (com chave: ↑ ↑ até a aba, → → → até a velocidade); `#keys=uuurrro` roda o
    teste.
  - `#keys=uuurrrrrrr`: foco no botão de perfil; `#keys=prro`: escolhe Crianças.
  - `#profile=2&keys=rrur`: Crianças, Netflix, aba Filmes: o Continuar "Pássaros de Inverno" e depois só a pick
    infantil "O Pequeno Farol".
  - `#single=1&start=1`: só o Principal; ligar a TV não pergunta nada.
- **O que mostra:**
  - faixa mudando conforme o tile em foco, com espera de 500 ms;
  - carrossel com Continuar e picks juntos: Netflix (2 Continuar, depois 2 picks; "Cidade de Vidro" aparece uma vez
    só, como Continuar), Prime (1 Continuar e 1 pick), YouTube (só Continuar); só picks em Disney+, Max (com um título
    longo), Apple TV, Globoplay e discovery+;
  - arte do app (Spotify, Claro tv+, e todos sem chave e sem Continuar);
  - abas-filtro, a linha de informações da TV com os 5 estados da velocidade, botões com dica e relógio real;
  - fileira com rolagem e setas, gaveta só com o clima, *All Apps*, avisos;
  - perfis: o Crianças (ouro) com o selo infantil no botão e na folha, e as picks filtradas.
- **O que é representativo e o que não é:**
  - As fotos são degradês em CSS.
  - Os logos são o nome do app em texto (os nomes e as cores vêm de `web/home.js` e `tokens.json`). A arte de marca
    não vai para o repositório.
  - Os títulos das picks e as classificações são inventados.
  - Cidade, temperatura, resolução e velocidade são fixas ou sorteadas; nada é lido da máquina.
  - Os anúncios do TalkBack vão para uma região `aria-live` escondida (`#sr`) e para o `aria-label` de cada item.
- **Prova de TV antiga:** `proto.js` passa pelo mesmo `acorn --ecma5` e pela mesma busca de chamadas novas do
  `tools/check.sh`; `proto.css` passa pela busca de CSS variables, grid e `backdrop-filter`. Só `transform` e `opacity`
  animam: as superfícies de foco são elementos à parte, cuja opacidade muda.
- **Conferido (2026-11-01):** nenhum texto da tela da TV abaixo de 24 px (só a barra do protótipo, fora da TV, usa 13 a
  15 px). Nenhum erro no console do Chrome em seis sequências longas de teclas (teste completo, falha, sem rede, só o
  Principal com início completo, sem chave, `lite` a 720p).

## 12. O que cada card pega daqui

| Card | Pega | Tokens |
|---|---|---|
| **202** Interruptor e área segura | *Home Settings → Aparência: Clássica / Nova* (Clássica é o padrão até o 212); área segura de 96/60, grade de 5×300+57, escala de tipos, Inter com a instância nova `displayBold` (seção 2); o relógio, as abas e os botões já nas posições da seção 3 | `rules`, `font`, `type`, `layout` |
| **203** Tiles grandes | Tiles de 300×169 e raio 28, logo sobre o degradê, caixa do logo, nome no lugar do logo, cache compartilhado com *All Apps*, sem platter, alinhados à esquerda, setas de rolagem, contorno noturno | `tile`, `brand_nova`, `layout.*.row` |
| **204** Foco | Escala 1,10 e −6 px, sombras de repouso e foco, brilho, contorno, paralaxe, molas e as curvas CSS | `elevation`, `focus`, `motion.focus*`, `motion.parallax` |
| **205** Grade com rolagem | **Fora da fase** (decisão 3). Nada aqui depende dele | — |
| **206** Faixa | Foto de 0 a 820, véus, dissolução, tipografia, pílula, pontos, carrossel, troca de texto, orçamento de 2 fotos; estado sem favoritos (picks gerais, fotos, aurora) | `band`, `type.band_*`, `color.band` |
| **207** Faixa segue o app | Carrossel único: Continuar do app → picks do app (mesmos pontos, sem repetir) → arte do app; filtro pela aba nas duas partes, pílula "Continuar"/"Assistir", espera de 500 ms com cancelamento, arte do app (degradê + logo grande por cima dos véus), sem chave | `band.content_order_for_focused_app`, `band.no_tmdb_key`, `band.art_from_app` |
| **208** Barra superior | Ordem da direita para a esquerda, abas-filtro, **linha de informações da TV** (cidade, temperatura, resolução e o item da velocidade com os seus 5 estados, sem a rede do teste), cotações fora da Nova, botões com dica, relógio, *Now Playing* e status nos lugares da seção 3; ordem do foco | `top_bar`, `tabs`, `tv_info`, `type.info_line` |
| **215** Teste de velocidade | A busca na Cloudflare sob pedido (OK no item), 10 s ou 200 MB, cancelamento ao sair, resultado guardado; o endereço novo no CLAUDE.md e no README. O 208 já desenha os estados; o 215 liga a rede | `tv_info.speed_item` |
| **209** Vidro | Três níveis com o fallback de cada caminho | `glass` |
| **210** Gaveta, folhas, menus | Gaveta (seção 7, só o clima), *All Apps* (seção 8), o menu do OK segurado e os avisos em vidro grosso | `drawer`, `all_apps`, `glass.thick` |
| **211** Acessibilidade, mouse, 720p | Tabela de navegação, regras de ponteiro, medidas a 720p, anúncios do TalkBack (seção 13) | `layout.720p` |
| **212** Virada | A Nova vira o padrão; a Clássica continua como opção (decisão 7) | — |
| **214** Perfis do Meu TV OS (visual) | Botão de perfil no topo, folha "Quem está assistindo?", paleta (com o ouro), foco, setas, TalkBack, mouse, lugar na Clássica, só o Principal sem a pergunta ao ligar (seção 15). Dados, criação e edição de perfis são do card 214 | `profile` |
| **214c** Perfil infantil | Selo no botão e na folha, linha *Perfil infantil* na edição do perfil, picks filtradas por idade com cache próprio, TalkBack (seção 15) | `profile.kids` |
| **213** Protetor de tela | Relógio de 34/600 → no protetor, maior, dentro da área segura de 96/60; véu de baixo como o da faixa; só picks e as suas fotos | `type.clock`, `band.scrims`, `layout.1080p.safe_area` |

## 13. Textos novos (português e inglês desde o início)

| Chave (inglês) | Português | Onde |
|---|---|---|
| `Appearance` | Aparência | Home Settings (202) |
| `appearance\|Classic` | Clássica | Home Settings |
| `appearance\|Nova` | Nova | Home Settings (nome próprio, igual em todas as línguas) |
| `Watch` | Assistir | pílula da faixa |
| `Resume` | Continuar | pílula do Continuar assistindo |
| `kind\|Movie` | Filme | linha de apoio |
| `kind\|Show` | Série | linha de apoio |
| `eyebrow\|{app} · {kind}` | {app} · {kind} | linha de apoio (padrão, nunca concatenado) |
| `Continue Watching · {app}` | Continuar assistindo · {app} | linha de apoio |
| `{i} of {n}` | {i} de {n} | TalkBack da faixa |
| `Profile: {name}` | Perfil: {name} | TalkBack do botão de perfil; aviso depois da troca |
| `Who's watching?` | Quem está assistindo? | título da folha de perfis |
| `profile\|Add` | Adicionar | último círculo da folha |
| `Add profile` | Adicionar perfil | TalkBack do círculo *Adicionar* |
| `{name}, active profile` | {name}, perfil ativo | TalkBack do círculo do perfil ativo |
| `Profiles` | Perfis | linha de Home Settings (seção 15) |
| `profile\|Main` | Principal | nome do perfil criado do estado atual (card 214) |
| `Kids profile` | Perfil infantil | linha da edição do perfil (214c) |
| `Picks rated for all ages and up to 10 only. Apps aren't blocked.` | Sugestões só com classificação livre e até 10 anos. Não bloqueia apps. | explicação dessa linha |
| `{name}, kids profile` | {name}, perfil infantil | TalkBack do círculo (com "perfil ativo" antes, no atual) |
| `Profile: {name}, kids` | Perfil: {name}, infantil | TalkBack do botão de perfil infantil |
| `info\|{t} °C` / `info\|{t} °F` | {t} °C / {t} °F | temperatura da linha de informações |
| `{n} Hz` | {n} Hz | atualização da tela |
| `speed\|↓ {rate} · {ago}` | ↓ {rate} · {ago} | item da velocidade com resultado |
| `{n} Mbps` / `{n} Gbps` | {n} Mbps / {n} Gbps | número da velocidade (no formato de `Ui.locale()`) |
| `ago\|now` | agora | quando, menos de 1 min |
| `{n} min ago`, `{n} h ago`, `plural\|one:{n} day ago\|other:{n} days ago` | há {n} min, há {n} h, há {n} dia(s) | já existem (cotações, `HomeData`) |
| `ago\|yesterday` | ontem | quando, de 24 a 48 h |
| `Test speed` | Testar velocidade | item sem teste ainda |
| `Testing…` | Testando… | item durante o teste |
| `Test failed` | Teste falhou | item depois de uma falha |
| `No internet` | Sem internet | item sem rede |
| `No internet connection` | Sem conexão com a internet | aviso do OK sem rede; TalkBack |
| `Internet speed: {n} megabits, tested {ago}. OK to test again` | Velocidade da internet: {n} megabits, testada {ago}. OK para testar de novo | TalkBack com resultado (`{ago}` por extenso: `plural\|one:{n} hour ago\|other:{n} hours ago` → "há 2 horas"; minutos e dias igual) |
| `Internet speed: not tested yet. OK to test` | Velocidade da internet: ainda não testada. OK para testar | TalkBack sem teste |
| `Testing the internet speed` | Testando a velocidade da internet | TalkBack ao começar |
| `Internet speed: {n} megabits` | Velocidade da internet: {n} megabits | TalkBack ao terminar |
| `The speed test failed. OK to try again` | O teste de velocidade falhou. OK para tentar de novo | TalkBack da falha |

Os textos que já existem continuam: "Explore", "Movies", "Shows", "All Apps", "Inputs", "Shortcuts", "Continue
Watching", "light|Live TV" etc.

**TalkBack:**
- tile: "{app}";
- faixa: "{título}. {metadados}. {i} de {n}" e, na pílula, "Assistir" ou "Continuar" (o mesmo texto que ela mostra); nos
  itens de Continuar, a linha de apoio entra antes: "Continuar assistindo. {título}…";
- linha de informações: só a velocidade é lida (seção 3); cidade e temperatura estão também no painel do clima;
- aba: "{aba}, selecionada";
- botão: o mesmo nome da dica.

As outras línguas podem cair no inglês até o 212 (decisão 10).

## 14. Contraste (WCAG 2, calculado por script)

"Pior caso" = foto branca pura debaixo dos véus.

| Par | Razão |
|---|---|
| Título da faixa (branco) | 6,20 |
| Metadados e linha de apoio (branco 86%) | 5,10 |
| Relógio (branco, véu de cima em y≈104) | 6,16 |
| Dica do botão (branco, y≈165) | 5,61 |
| Aba não selecionada e linha de informações (branco 78%) | 10,68 |
| Velocidade em foco (tinta sobre branco) | 16,83 |
| "Teste falhou" / "Sem internet" (branco, véu de cima) | 6,16 |
| Tinta sobre superfície de foco branca | 16,83 |
| Dia: tinta / céu; secundária `#5A5A5F` / céu | 14,28 / 5,82 |
| Noite: tinta / céu; secundária `#A1A1A6` / céu | 17,94 / 7,59 |
| Tecla sem sinal, dia / noite | 5,25 / 5,06 |
| Rótulo do *All Apps* (branco 66%) | 8,39 |
| Aviso sobre vidro grosso | 12,48 |
| Ponto inativo; setas dia / noite (gráficos, mínimo 3:1) | 3,18; 3,62 / 4,58 |
| Inicial branca sobre as 8 cores de perfil (e a cor sobre o branco, no foco) | 5,08 a 5,32 (ouro `#856A00`: 5,17) |
| Círculo de perfil sobre a folha `#141418` (gráfico, mínimo 3:1) | 3,45 a 3,62 (ouro: 3,55) |
| Símbolo do selo infantil (tinta sobre branco) | 16,83 |
| Nome do perfil na folha (branco 66%) | 8,39 |
| Nomes de marca (isentos; o nome fica no meio do degradê, texto grande) | Prime 3,65; Globoplay 3,07; Spotify 3,66; Netflix 4,1–4,4; Claro 3,7; os outros ≥ 6,9 |

Observação: o secundário da v1 (`#6E6E73` sobre `#EBEBEF`) dá 4,27:1, abaixo do AA. A Nova escurece esse cinza para
`#5A5A5F`.

## 15. Perfis do Meu TV OS: botão e folha "Quem está assistindo?"

Pedido do dono: perfis **locais**, um por pessoa da casa, com nome, cor e a inicial no ícone. Cada um tem a sua fileira
de favoritos e as suas preferências da faixa (no protótipo, a aba selecionada). Não é a conta Google. Sem fotos, emojis
ou avatares de terceiros. Os dados, a criação e a edição ficam no card 214; aqui está só o visual. Valores:
`tokens-v2.json → profile`.

### Botão de perfil (barra superior)

```
60 │ … (TV) (HDMI) (⚙) (E)  17:40 │   (E) = 64 px, inicial branca 30/600 sobre a cor do perfil
150│                    Ana         │   nome só com foco, 24/600, centralizado embaixo
```

- **Lugar:** o último botão redondo, logo à esquerda do relógio. Fica a 20 px de *Configurações* e a 32 px do relógio.
  A ordem, da direita para a esquerda: relógio, Perfil, Configurações, Entradas, TV aberta e os extras.
- **Repouso:** um disco de 64 px na cor do perfil, com contorno interno de 1 px em branco 22%, e a inicial branca 30/600
  no centro. Não usa o vidro fino: o disco colorido já identifica o perfil.
- **Foco:** igual aos outros botões redondos. A superfície fica branca, a escala vai a 1,12 e o nome aparece embaixo.
  A inicial passa para a cor do perfil, que é o mesmo par de cores e mantém ≥ 4,5:1. O nome fica centralizado,
  porque o relógio à direita deixa espaço. Um nome de 12 letras termina perto de x=1760, dentro da área segura.
- **Perfil infantil:** um selo de 22 px no canto inferior direito do disco (disco branco com a cabeça de urso escura de
  14 px e um anel de 2 px na tinta escura da barra, para se separar do disco). Fica igual em foco.
- **Só o Principal:** o botão aparece do mesmo jeito (na Nova, e na Clássica se ligado em *Top Buttons*), para que
  *Adicionar* fique a dois toques.
- **OK:** abre a folha de perfis.
- **TalkBack:** "Perfil: {nome}"; no infantil, "Perfil: {nome}, infantil".
- **1280×720:** botão de 43, inicial de 20, nome de 16 e selo de 15.

### Folha "Quem está assistindo?"

```
 300 │                      Quem está assistindo?                     │ 48/600, centralizado
 440 │        ( E )✓     ( B )      (( C ))      ( + )                │ círculos de 200, vão de 64
 676 │          Ana        Léo      Crianças    Adicionar              │ 28/500, branco 66%; foco: branco
```

- **Vidro grosso** em tela cheia, como o *All Apps*: o que está embaixo some.
- **Linha:** uma linha só, centralizada: até 6 perfis e depois *Adicionar*. *Adicionar* só aparece enquanto há menos de
  6 perfis. Com 7 itens a linha tem 1.592 px, dentro dos 1.728 da área segura.
- **Círculo:** 200 px na cor do perfil, com a inicial 96/600 branca. O nome fica embaixo, em 28/500, até 300 px de
  largura e com reticências se não couber.
- **Perfil ativo:** um selo branco de 52 px com um visto escuro, no canto inferior direito, e o nome em peso 600. A
  diferença nunca depende só da cor.
- **Perfil infantil:** um selo branco de 44 px com a cabeça de urso escura de 26 px, no canto **superior** direito (o do
  ativo fica embaixo, então os dois cabem juntos). Discreto: não muda a cor, o nome nem o tamanho do círculo.
- **Foco:** o círculo vai a 1,10, ganha uma sombra e um anel branco de 6 px, afastado 6 px do disco, e o nome fica
  branco. Em *Adicionar*, a superfície fica branca com o "+" escuro e não há anel.
- **Foco inicial:** o perfil ativo.
- **1280×720:** círculos de 133, vão de 43, inicial de 64, nome de 19, título de 32, anel de 4, selo do ativo de 35 e
  selo infantil de 29.
- **`lite` e LEGACY:** sem sombra e sem transição. O anel é uma borda, não uma sombra, então continua; o selo também.
  No LEGACY, só o círculo em foco desenha a sombra do `Shadows`.
- **Efeitos:** o vidro com blur real só no Android 13+. Os outros caminhos usam o mesmo fallback do `glass.thick`
  (seção 10).

| Tecla | Na folha |
|---|---|
| ← / → | perfil anterior/próximo, sem dar a volta |
| ↑ / ↓ | nada (é uma linha só) |
| OK num perfil | **Outro perfil:** a folha fecha, a fileira e as preferências da faixa passam a ser as dele, o foco vai ao 1º app e a faixa segue esse app. Aparece o aviso "Perfil: Léo", que o TalkBack também lê. **O mesmo perfil:** só fecha. |
| OK em *Adicionar* | abre a criação de perfil (nome e cor, card 214). O perfil novo começa com uma **cópia da fileira do perfil atual** (decisão 3 do 214), não com a fileira embutida, e recebe a primeira cor livre da paleta |
| Voltar | fecha **sem trocar** e devolve o foco para onde estava (o botão de perfil) |

**Níveis:** a folha não leva a um app. Depois da troca, o app está a 1 nível, na fileira.

**TalkBack:**
- ao abrir: "Quem está assistindo?";
- círculo: "{nome}", e "{nome}, perfil ativo" no atual; no infantil, ", perfil infantil" no fim;
- *Adicionar*: "Adicionar perfil".

**Mouse e Magic Remote:**
- No topo, o ponteiro sobre o botão move o foco para ele, e um clique abre a folha.
- Na folha, passar o ponteiro move o foco só quando entra em outro círculo. Um clique escolhe, como o OK.
- Clicar fora dos círculos não faz nada, para não fechar por acidente. O Voltar do controle fecha.
- A roda move como ←/→.

### Depois de um início completo da TV (decisão 6 do card 214)

- **Quando aparece:** depois de um início completo, **quando há 2 ou mais perfis**, sem opção para desligar e nas duas
  aparências. **Só com o Principal, não aparece** (decisão do dono, 2026-11-01): não há o que escolher, e a TV vai
  direto ao Início. Nunca ao voltar do standby, e só no modo Free My TV. Nas TVs com web app, aparece quando o app abre
  a frio.
- **Foco e tempo:** o foco começa no último perfil usado. Não há tempo-limite.
- **Voltar:** fecha e fica com o último perfil. É o mesmo comportamento da tabela acima.
- **OK:** igual à tabela. Depois da folha, o Início mostra a fileira do perfil escolhido, com o foco no 1º app.
- **Exceção, *At power-on* = Live TV:** a folha não bloqueia. Depois de 10 s, a TV segue com o último perfil e abre a
  TV ao vivo como hoje.
- **TalkBack:** anuncia "Quem está assistindo?" ao abrir, como pelo botão.

### Na aparência Clássica

Decisão 5 do card 214: na Clássica, o perfil aparece em dois lugares.

- **Home Settings → *Perfis*:** primeira linha, com o disco de 40 px e o nome do perfil ativo à direita
  (`Perfis · (E) Ana`). OK abre a mesma folha "Quem está assistindo?". Escolher um perfil troca a prateleira da
  Clássica pela fileira dele e volta para Home Settings.
- ***Top Buttons* → *Perfil*:** uma opção, desligada por padrão. Ligada, o botão entra na fileira de botões do topo da
  Clássica, como os outros extras (`HomeApps.MAX_TOP`). Fica no lugar dos botões da Clássica, sem mudar o tamanho e o
  foco que eles já têm. O disco tem a cor do perfil e a inicial branca, e a dica e o TalkBack dizem "Perfil: {nome}".
  OK abre a folha. Na Nova, o botão é fixo e não depende dessa opção.

### Paleta (8 cores; perfis novos pegam a primeira livre, nesta ordem)

| Cor | Valor | Inicial branca | Sobre a folha `#141418` |
|---|---|---|---|
| azul | `#3563E0` | 5,23 | 3,51 |
| rosa | `#D0215F` | 5,17 | 3,56 |
| verde | `#2E7D32` | 5,13 | 3,58 |
| laranja | `#C2410C` | 5,18 | 3,55 |
| roxo | `#8550D8` | 5,08 | 3,62 |
| verde-água | `#00796B` | 5,32 | 3,45 |
| **ouro** (no lugar do vermelho `#C62839`) | `#856A00` | 5,17 | 3,55 |
| ardósia | `#5F6E88` | 5,16 | 3,56 |

O vermelho ficava perto do rosa (ΔE de 21 no CIELAB). Entre os candidatos com a inicial branca ≥ 4,5:1, o ouro é o
mais distante de todas as outras sete (ΔE ≥ 46; o mais perto é o laranja, e os tons ficam bem separados: ~17° contra
~50°). O nome e a inicial continuam sempre presentes, então a cor nunca é a única pista.

### Perfil infantil (decisão do dono, 2026-11-01; card próprio, 214c)

- **O que é:** uma marca no perfil, *Home Settings → Perfis → {perfil} → Perfil infantil* (liga/desliga), com a linha
  "Sugestões só com classificação livre e até 10 anos. Não bloqueia apps." Não bloqueia apps, não pede PIN, não muda a
  fileira.
- **O que muda na tela:** só as picks da faixa. Vêm de uma lista própria do TMDB (o mesmo endereço, sem rede nova):
  `certification_country=BR`, `certification.lte=10` (L e 10), mais os gêneros Animação e Família. Continuar assistindo
  fica como está.
- **Enquanto a lista infantil não chegou** (primeira vez, ou sem rede): a faixa mostra Continuar ou a arte do app,
  **nunca** as picks gerais. A lista é buscada em segundo plano e tem cache próprio, então a troca de perfil segue em
  ≤ 300 ms.
- **Marca visual:** o selo de urso, discreto, no botão do topo e no círculo da folha (acima). Nada mais muda: mesma cor
  escolhida, mesmo nome, mesmo foco.
- **TalkBack:** "{nome}, perfil infantil" na folha; "Perfil: {nome}, infantil" no botão; o aviso depois da troca é o
  mesmo "Perfil: {nome}".

### No protótipo

- Três perfis de exemplo, cada um com fileira e aba diferentes:
  - **Ana** (azul): 10 apps, aba Explorar;
  - **Léo** (rosa): 6 apps, a começar por Globoplay, aba Séries;
  - **Crianças** (ouro, **infantil**): Disney+, YouTube, Netflix e Spotify, aba Filmes. Tem o selo no botão e na folha,
    e as picks são só as marcadas como infantis (Netflix: "O Pequeno Farol", não "A Última Maré"); o Continuar de
    Netflix aparece igual.
- **U** troca para "só o Principal" (azul, a fileira do Ana): o botão continua no topo, e **O** (ligar a TV) não abre
  a folha, só um aviso. Com os três perfis, **O** abre a folha com o foco no último perfil.
- **P** ou o botão *Perfil* da barra do protótipo abrem a folha.
- *Adicionar* só mostra um aviso.

## 16. Perguntas abertas

**Respondidas pelo dono em 2026-11-01** (já aplicadas acima): fonte (Inter, seção 2); carrossel (Continuar e picks
juntos, seção 4); "Apple TV" fica na fileira; cotações saem da Nova (linha de informações no lugar, seção 3); a pista de
rolagem da fileira fica; sem chave e com o foco fora da fileira, a arte do último app fica; logo grande = o logo
recortado na TV, sem escolha app por app; aprovação registrada (seção 17); só o Principal: botão sim, pergunta ao ligar
não; perfil infantil filtra as picks, sem PIN; o vermelho virou ouro.

Restam, todas com um padrão já aplicado (o dono só precisa responder se quiser outro):

1. **Cotações na gaveta:** li "saem da tela Nova" como a Nova inteira, então o painel de cotações da gaveta também saiu
   e o clima ocupa a largura toda (seção 7). Ou o dono quer as cotações ainda na gaveta?
2. **°C ou °F:** a linha usa a unidade que a build já usa no clima (`temperature`), que é °C no Brasil. Fica assim, ou
   sempre °C?
3. **Aba e Continuar:** a aba (Filmes/Séries) filtra também os itens de Continuar, pelo tipo; vídeo sem tipo aparece em
   todas. Ou Continuar deve aparecer sempre, em qualquer aba?
4. **Limites do carrossel e do teste:** até 3 itens de Continuar + 5 picks (8 pontos); o teste para em 10 s **ou
   200 MB**, para não gastar dados demais numa conexão rápida. Ok?
5. **Selo infantil:** uma cabeça de urso (três círculos, desenho próprio). Serve, ou prefere outro símbolo (estrela,
   balão)?

## 17. Aprovação do dono

- Data: 2026-11-01 · Situação: **aprovado com ajustes** · Observações: ver "Decisões do dono depois do protótipo" em plan/200-direcao-visual-tvos.md e plan/214-perfis-do-meu-tv-os.md (informações da TV no lugar das cotações, teste de velocidade Cloudflare sob pedido, faixa com Continuar e picks juntos, Inter, cor nova no lugar do vermelho, perfil infantil).
- Ajustes aplicados nesta especificação, em `design/tokens-v2.json` e no protótipo em 2026-11-01: seções 2
  (Inter), 3 (linha de informações e teste de velocidade), 4 (carrossel junto), 7 (gaveta sem cotações), 13 e 14
  (textos e contraste), 15 (ouro, perfil infantil, só o Principal).
