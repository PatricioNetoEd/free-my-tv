# 203 · Tiles grandes: recorte do protótipo e especificação

Card: `plan/203-tiles-grandes.md` (depende do 202). Direção aprovada: `design/200-direcao-visual-tvos.md` (seções 6, 9,
10, 12 e 17; decisões do dono no fim de `plan/200-direcao-visual-tvos.md`). Valores: `design/tokens-v2.json`
(`tile`, `tile.card_203`, `layout.*.row`, `budget.card_203`, `brand_nova`). Protótipo: `design/prototype/index.html`,
tecla **3** ou `#card=203`.

**Situação: aprovado pelo dono em 2026-11-02** (ver `plan/203-tiles-grandes.md`), com os padrões das perguntas.

## 1. O que o 203 entrega, e o que não

Só na aparência **Nova**. A **Clássica não muda** (nem medidas, nem prateleira de vidro, nem foco).

| Entra no 203 | Fica para |
|---|---|
| Fileira de tiles de 300×169, raio 28, vão de 57, 5 visíveis, alinhada em x=96, na altura final (y=820) | — |
| Arte: logo sobre o degradê da marca, logo maior (caixa de 72%×50%, 14% de tinta), escala por app como hoje | — |
| Nome do app quando não há logo: Inter 700 (`Ui.displayBold`, criada aqui), 24 a 40 px | — |
| Prateleira de vidro (platter) some na Nova | — |
| Rolagem um app por vez, tiles fora da janela somem por opacidade, setas de "há mais" | setas em y=770: **206** |
| Contorno noturno de 1 px nos tiles | — |
| Foco **provisório** (o de hoje, na escala final 1,10) | foco elevado (sobe 6 px, brilho, contorno de foco, paralaxe, sombras novas): **204** |
| Cache dos logos nos dois tamanhos novos, no tamanho da UI | — |
| | faixa de destaque (foto, véus, título, carrossel): **206/207** |
| | linha de informações da TV e barra nova: **208** (e o teste de velocidade, **215**) |
| | gaveta e *All Apps* com o visual novo: **210** (no 203 a gaveta é a de hoje; só a fileira sobe junto) |
| | perfis: **214** |
| | grade com rolagem: **205**, fora da fase |

Em volta da fileira, no 203, a tela é a **Nova de hoje (202)**: céu claro de dia e escuro à noite com a cor da pick em
foco por baixo de um véu, barra de cima (abas, botões redondos, relógio), "Para você" e os cards de picks (y 262 a 704),
ou o relógio grande quando não há chave TMDB.

## 2. Medidas

### A fileira (resting = em repouso)

| | 1080p | 720p (UI a 1280×720, TCL de 1 GB) |
|---|---|---|
| Área segura | 96 dos lados, 60 em cima e embaixo | 64 / 40 |
| Tile em repouso | **300×169** | **200×113** |
| Raio | **28** | **19** |
| Vão | **57** | **38** |
| Visíveis | **5** (5×300 + 4×57 = 1.728 = largura segura) | 5 (5×200 + 4×38 = 1.152) |
| x dos 5 lugares | 96, 453, 810, 1167, 1524 (último termina em 1824) | 64, 302, 540, 778, 1016 (termina em 1216) |
| y da fileira | **820 a 989** | **547 a 660** |
| Tile em foco (203) | 330×186, centrado no de repouso: 15 px para cada lado, 8,5 para cima e para baixo (y 811,5 a 997,5) | 220×124 (y 541 a 666) |
| Caixa máxima do logo, repouso / foco | 216×85 / 238×93 | 144×56 / 158×62 |
| Nome sem logo | 24 a 40 px, Inter 700 | 16 a 27 px |
| Setas de "há mais" (até o 206) | 24 px, centro y=904; esquerda x 54–78, direita x 1842–1866 | 16 px, centro y=603; x 36–52 e 1228–1244 |
| Cor das setas | `#7A7A80` (3,3:1 no céu claro de hoje, 4,6:1 à noite; gráfico, mínimo 3:1) | igual |

Arredondamento: cada medida a 720p é a de 1080p vezes 2/3, arredondada (é o `k` do `HomeView`, com `snap`). Os bitmaps
são feitos nesse tamanho, nunca em 1080p reduzido.

### Posição vertical sem a faixa

A fileira já fica **onde vai ficar com a faixa** (y=820), para o 206 não mexer nela. Com a tela de hoje por cima:

```
 60 ─ barra de cima (abas · botões · relógio), 64 de altura
177 ─ "Para você" (52 px)
262 ┌ cards de picks (442 de altura) ──────────────────────────────┐
704 └──────────────────────────────────────────────────────────────┘
727–790  nome (31) e metadados (25) do card, a partir de x=96
811 ─ topo do tile em foco (repouso começa em 820)
820 ┌tile┐ ┌tile┐ ┌tile┐ ┌tile┐ ┌tile┐     ← 5 × 300×169, vão 57
989 └────┘ └────┘ └────┘ └────┘ └────┘
998 ─ base do tile em foco
1020 ─ limite da área segura
```

Folga: 21 px entre os metadados do card (≈790) e o tile em foco (811). Por isso as setas não vão em y=770 neste card:
cairiam em cima do nome do primeiro card. Até o 206 elas ficam na altura do meio dos tiles, nas margens (decisão
provisória; o 206 leva para y=770, como na direção aprovada).

Gaveta aberta (↓): como hoje, tudo sobe 560; a fileira fica em y=260 a 429, sem foco, como referência.

O foco cresce 15 px para fora da área segura nas pontas (x=81 e 1839). Fica dentro da área de ação de 3,5% (67 px) e é
o mesmo que a direção 200 aceitou; só o que **está em repouso** e todo texto ficam dentro dos 96.

## 3. Arte do tile

**Regra única** (decisão 2 do dono): o logo sobre o degradê da marca, igual nas três plataformas.

- **Degradê** (de cima para baixo): `tokens.json → brand.<key>.tile`; senão `tokens-v2.json → brand_nova.<key>.tile`;
  senão o neutro `#2A2A2E → #161618` (o mesmo padrão do `face()` do web).
- **Logo:** o mesmo de hoje (recortado da arte de TV no Android, `lift()` no web, ícone empacotado no Samsung), centrado,
  com a mesma "quantidade de tinta" para todos: **14% da área do tile**, nunca maior que **72% × 50%** do tile, vezes a
  escala por app de hoje (`HomeApps.SHELF`, 6ª coluna: Max 1,32, Apple TV 1,1, discovery+ 1,1, Prime 0,96…). Hoje é
  8,5% numa caixa de 76% × 58%: o logo passa de ~2.400 para ~7.100 px de tinta, sem encostar nas bordas.
- **Modo do logo** (`TILE_STYLE`, terceira coluna): como hoje (Prime e Globoplay em branco; os outros como vieram).
- **Android, apps com logo mas sem `TILE_STYLE`** (Hulu, Paramount+, Peacock, NOW, Okko, Kinopoisk, Wink, Premier,
  Amediateka, Spotify): degradê **neutro** no 203. Hoje eles ficam num cartão escuro liso, e o logo deles vem na cor da
  marca: sobre o degradê da própria marca ele sumiria. O degradê de marca deles só depois de ver o logo na TV (pergunta
  4).
- **Nome no lugar do logo** (quando não há logo nenhum): Inter **700** (`Ui.displayBold`, `opsz` 32, `wght` 700; web:
  `font-weight: 700`), uma linha, o maior tamanho entre 40 e 24 px que caiba em 80% da largura (240 px); se nem 24
  cabe, reticências. Cor `brand_nova.<key>.word` (branco quando não há); nos degradês claros (Prime, Globoplay, Spotify,
  Jellyfin) uma sombra fixa `0 1px 2px rgba(0,0,0,0.35)` (em `lite`, nenhuma). O Hulu leva tinta escura `#1D1D1F`
  (branco daria 2,5:1 no verde dele; o escuro dá 6,7:1). Com 24 px em peso 700 o nome é "texto grande" no WCAG: o
  mínimo é 3:1, e o pior caso (Globoplay, meio do degradê) é 3,1:1.
- **À noite:** contorno interno de 1 px, branco a 10% (em `lite`, borda de 1 px branca a 14%), para os tiles escuros
  (Netflix, YouTube, Claro tv+) não sumirem no céu escuro.

### Estados do tile

| Estado | Quando | O que aparece |
|---|---|---|
| Normal | app conhecido com logo (Android: recortado da arte de TV; LG: ícone recortado; Samsung: ícone empacotado) | degradê + logo |
| Em foco | seta chegou nele | seção 4 |
| Sem logo, app conhecido | o recorte falhou (Android), o ícone do LG não carregou | degradê da marca + nome (Inter 700) |
| App desconhecido (Android) | escolhido em *Shelf* e fora da lista `SHELF` | degradê neutro + nome (padrão; pergunta 3) |
| LG, ícone que não dá para recortar | `lift()` devolve `false` (ícone que é foto, ou a TV não deixa ler) | o ícone como veio, centrado, na caixa do logo (72%×50%) sobre o degradê |
| LG sem ícone | o app não tem ícone ou ele falhou | degradê (da marca ou o `bgColor` do LG) + nome |
| Samsung sem ícone empacotado | o app não está em `SAMSUNG_ICONS` (o `iconPath` do Tizen não serve) | degradê + nome |
| App não instalado | — | não aparece (como hoje: `HomeApps.shelf` e `pickShelf` só listam o que abre) |
| Reordenando (segurar OK) | — | como hoje: um pouco maior que o foco (+0,08), balança 1,5°; ←/→ move, OK solta, Voltar cancela |

## 4. Foco provisório do 203 (até o 204)

O card diz "o foco continua o de hoje". Proposta: **o visual de hoje, na escala final**.

| | Hoje (Clássica) | 203 (Nova) | 204 (depois) |
|---|---|---|---|
| Escala | 1,20 | **1,10**, a partir do centro | 1,10 |
| Sobe | não | **não** | 6 px |
| Sombra | repouso `0 4 22` (dia 0,14 / noite 0,30); foco `0 18 40` (0,34 / 0,60) | **igual a hoje** | sombras novas do `elevation` |
| Brilho | branco 8% → 0 na metade de cima | **igual a hoje** | brilho de 20%, contorno de 1,5 px, paralaxe |
| `lite` (web) | — | escala 1,10 na hora + anel branco de 3 px, sem sombra nem brilho | igual |
| LEGACY (Android 8–12, pouca RAM) | — | escala 1,10 com a sombra do cache `Shadows` e o brilho, **sem anel** (desvio aceito na revisão do 203) | igual |

Por que 1,10 e não 1,20: num tile de 300, 1,20 levaria o primeiro tile a x=66 (fora até da área de ação de 3,5%) e a
base a 1006; e os logos de foco seriam feitos num tamanho (360×203) que o 204 jogaria fora. Com 1,10 o 204 só acrescenta
efeitos: nada de medida nem de cache muda. O foco nunca depende só de cor: há escala e brilho.

## 5. Setas, OK e Voltar (a navegação é a de hoje; só a geometria muda)

| Zona | ← / → | ↑ | ↓ | OK | Voltar |
|---|---|---|---|---|---|
| **Fileira** (foco inicial: 1º app) | app anterior/próximo, sem dar a volta; a fileira desliza depois do 5º | cards de picks, no mais perto do tile em x; sem picks, a barra (aba selecionada, ou o 1º botão sem chave) | gaveta, na tecla mais perto | abre o app (nível 1) | Android: nada (já é o Início); web: `TV.back()`; reordenando: cancela |
| **Cards** (de hoje) | card anterior/próximo | barra, na aba selecionada | fileira, no tile mais perto do card em x | abre a pick | fileira, no app que tinha o foco |
| **Barra** | abas e botões, sem dar a volta; focar uma aba a seleciona | — | cards (1º, ou o último a partir dos botões); sem picks, a fileira | botões como hoje (Entradas abre a gaveta no HDMI) | fileira |
| **Gaveta** | como hoje | fecha, volta à fileira | — | como hoje | fecha |

Níveis até um app: fileira → app (1); gaveta → *Todos os Apps* → app (3). Nenhum muda.

### Com 3, 8 e 12 apps

- **3 apps:** três tiles em x=96, 453 e 810, sem centralizar; sem setas; ← no 1º e → no 3º não fazem nada.
- **8 apps:** a janela mostra 5. Indo para a direita, o foco anda até o 5º lugar e daí a fileira desliza um app por
  vez (mola `row_scroll`, 300 ms no web) até mostrar os apps 4 a 8; voltando, o foco anda até o 1º lugar e a fileira
  desliza de volta. Seta à direita enquanto há apps depois da janela; à esquerda enquanto há antes.
- **12 apps:** igual, até a janela 8 a 12. Nas TVs de pouca memória (`HomeApps.lowRam`, como a TCL de 1 GB) a fileira
  continua limitada a 8 apps (`FEW_APPS`), como hoje.
- **Tiles fora da janela:** somem por opacidade junto com o deslize (alpha = 1 − quanto passou da janela / (tile +
  vão)); sem corte reto na borda, porque não há mais vidro para recortar. Mouse e TalkBack só veem os 5 da janela.

## 6. Caminhos leves e pesados

O 203 **não traz efeito novo** (efeitos pesados ficam com o 204 e só no Android 13+).

| | Android 13+ | Android 9–12 (≥ 3 GB) | `Ui.LEGACY` (TCL) | web normal | web `flat` | web `lite` (Tizen 2.4, LG de 1 GB) |
|---|---|---|---|---|---|---|
| Degradê | `LinearGradient` por app, feito no layout | igual | igual | `linear-gradient` estático | igual | igual |
| Logo | bitmap do tamanho exato, sem escala no desenho | igual | igual | elemento com `background-image` e `background-size` em px, calculado uma vez | igual | igual |
| Sombra | `Shadows` (já é assim hoje) | igual | só o cache `Shadows` | `box-shadow` fixo; a de foco num elemento à parte, por opacidade | fixa, sem transição | nenhuma |
| Brilho do foco | gradiente feito uma vez | igual | igual | opacidade | sem transição | nenhum |
| Deslize da fileira | mola | igual | igual | `transform` no conjunto | `will-change` só nele | instantâneo |
| Contorno noturno | traço de 1 px | igual | igual | `inset` 1 px | igual | borda de 1 px |

## 7. Memória

O critério do 201 é **≤ +8 MB de PSS** contra o 202 (meta do designer: ≤ +5 MB com 8 apps). A conta do card
(0,45 MB por app) supunha o tile inteiro em bitmap. Aqui **só o logo é bitmap**: o degradê é um shader e o nome é texto.

| | Por app (máximo, ARGB) | 8 apps | 12 apps |
|---|---|---|---|
| Hoje (8 apps em tiles de 178×100) | ~76 KB (logo de repouso + de foco) | ~0,6 MB | — |
| 203, 1080p | ≤ 158 KB (216×85 + 238×93) | **~1,3 MB (+0,7)** | ~1,9 MB |
| 203, 720p | ≤ 70 KB (144×56 + 158×62) | ~0,6 MB | (8 no máximo) |

- Nada mais fica na memória: sem bitmap de tile inteiro, sem cópia em 1080p numa TV de 720p, sem cache novo em disco.
  O cache em disco (`cacheDir/logos`) guarda o logo recortado no tamanho da fonte, que não muda: **`LOGO_VERSION` não
  sobe**. As cópias na medida (`crispLogos`) são refeitas no layout e as antigas são liberadas (`releaseLogos`, como
  hoje).
- Logos precisam de transparência: ficam em ARGB (`RGB_565` não serve para eles).
- *All Apps* continua como hoje no 203 (o cache compartilhado com ela é do 210).
- Sombras do `Shadows`: um nine-slice pequeno a mais para o tamanho novo (poucos KB).
- Web: nada novo além dos logos que já são recortados (`LIFT_SIZE` 240, que cobre os 238 do foco).

## 8. Para o desenvolvedor (resumo do que muda)

- **Android:** `HomeLayout.NOVA` ganha as medidas da fileira (y 820, 300×169, vão 57, raio 28, 5 visíveis, escala de
  foco 0,10, sem platter, setas nas margens) e a Clássica guarda as de hoje. `HomeView`: `layoutShelf`, `drawTiles`,
  `drawShelfTile`, `drawLogo`/`crispLogo` (constantes 0,14 / 0,72 / 0,50 na Nova; 0,085 / 0,76 / 0,58 na Clássica),
  `revealShelf`, hit test do mouse, nós do TalkBack e reordenação usam os retângulos novos. Sem alocação no `onDraw`: os
  shaders e o tamanho do nome são feitos no layout. `Ui.displayBold` criada uma vez em `Ui.init`. `HomeApps`: nada muda
  em `SHELF`, `HIDDEN`, `LIVE_TV_APPS` nem na ordem.
- **Web:** `.look-new` para `#tiles`/`.tile` (300×169, raio 28, `top: 820px`, sem `#platter`), `SHELF_VISIBLE` 5 na
  Nova, `wordFit` com mínimo 24 na Nova, caixa do logo 72%×50%, `.tile.focus` com `scale(1.1)`, setas nas margens.
  Logo por `background-image` + `background-size` em px (WebKit 538 do Tizen 2.4).
- **Textos:** nenhum texto novo.

## 9. Como ver no protótipo

Abra `design/prototype/index.html` direto do disco (Chrome ou Safari) e aperte **3**, ou abra com `#card=203`.

- **3:** recorte do 203 ↔ Nova completa. **T:** arte "logo" ↔ "só nome" (como um Samsung sem ícones). **G:** guias
  (área segura, as 5 colunas, a caixa do logo em cada tile). **A** no recorte: 3 → 8 → 12 apps. **N**, **L**
  (normal/flat/lite), **K** (sem chave: o relógio grande no lugar dos cards) e **R** (1280×720) valem também.
- Endereços prontos:
  - `#card=203&guides=1`: as medidas por cima da tela.
  - `#card=203&apps=8&keys=rrrrrr`: oito apps, a fileira deslizou 2 e as duas setas aparecem.
  - `#card=203&apps=12&night=1&keys=rrrrrrrrrrr`: o fim da fileira de 12, à noite (Hulu com o nome escuro).
  - `#card=203&art=names&apps=3`: três apps só com o nome.
  - `#card=203&perf=lite&hd=1&keys=r`: TV fraca a 720p (anel branco no foco).
  - `#card=203&keys=u`: ↑ da fileira para os cards de hoje.
- O que é representativo: medidas, posições, cores, rolagem, foco e navegação. O que não é: o "logo" é o nome do app
  desenhado na caixa do logo (não há arte de marca no repositório; na TV é o logo recortado da própria TV), os cards são
  degradês e os títulos são inventados. A gaveta (↓) do protótipo já tem o visual do 210: no 203 vale só a posição da
  fileira lá (y=260).
- Conferido: `proto.js` passa no `acorn --ecma5` e na busca de chamadas novas do `tools/check.sh`; `proto.css` na busca
  de CSS variables, grid e `backdrop-filter`; nenhum erro no console do Chrome em seis sequências longas (recorte com 3,
  8 e 12 apps, sem chave, `lite` à noite, e a Nova completa).

## 10. Perguntas ao dono

1. **Foco provisório em 1,10** (o visual de hoje, só que menor que o 1,20 de hoje, para caber na tela com o tile
   grande)? Padrão: sim.
2. **Setas de "há mais" nas margens**, na altura do meio dos tiles, até a faixa (206) chegar e elas irem para cima da
   fileira? A alternativa é não ter setas até o 206. Padrão: nas margens.
3. **App desconhecido no Google TV** (um app que você pôs na fileira e que não está na nossa lista de marcas): o nome
   sobre o cinza escuro (como a direção 200 aprovou, uniforme com tudo) ou a arte de TV do próprio app ocupando o tile
   (mais reconhecível, mas a qualidade varia)? Padrão: o nome.
4. **Hulu, Paramount+, Peacock, Spotify e outros no Google TV** ficam no cinza escuro neutro no 203, porque o logo deles
   vem na cor da marca e sumiria no degradê da própria marca. Quer que um card pequeno depois teste cada um na TV e dê o
   degradê de marca a quem ficar legível? Padrão: sim, depois.
