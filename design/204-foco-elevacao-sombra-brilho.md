# 204 · Foco: elevação, sombra suave e brilho — recorte do protótipo e especificação

Card: `plan/204-foco-elevacao-sombra-brilho.md` (depende do 203, aprovado e na `main`). Direção aprovada:
`design/200-direcao-visual-tvos.md` (seções 9, 10 e 12). Valores: `design/tokens-v2.json` (`tile`, `elevation`, `focus`,
`motion`, e o bloco novo `focus.card_204`, que manda onde diverge do resto). Base do recorte: `design/203-tiles-grandes.md`.
Protótipo: `design/prototype/index.html`, tecla **4** ou `#card=204`.

**Situação: aprovado pelo dono em 2026-11-02** (padrões das perguntas).

## 1. O que o 204 entrega, e o que não

Só na aparência **Nova**, só na **fileira de apps**. A **Clássica não muda** (nem foco, nem sombras, nem molas).

| Entra no 204 | Fica para |
|---|---|
| Foco final do tile: escala 1,10, **sobe 6 px**, sombra de repouso e de foco novas, brilho diagonal, contorno de 1,5 px, paralaxe leve | — |
| Molas do foco (`motion.focus`, `focus_glow`, `parallax`) | — |
| Variantes: Android 13+, Android 12/12L ≥ 3 GB, `Ui.LEGACY` (brilho sem deslocamento), web normal, `flat`, `lite` (anel) | — |
| Logos de foco gerados **no layout**, não no 1º `onDraw` (herdado do 203) | — |
| Os 4 acertos menores herdados da revisão do 203 e a caça ao resíduo de ~0,8 MB por troca de aparência (seção 9) | — |
| | faixa de destaque, setas em y=770: **206**; faixa que segue o app: **207** |
| | barra superior e linha de informações: **208** |
| | vidro e materiais: **209** |
| | gaveta, *All Apps* (inclusive o foco das células), menus: **210** |
| | "Remover animações" do sistema, passada geral de acessibilidade e mouse: **211** |
| | cards de picks e *Continuar assistindo* da Nova de hoje: **não mudam** (o 206 os tira da Nova; pergunta 4) |

Em volta da fileira, no recorte, a tela é a mesma do recorte do 203 (a Nova de hoje do 202: céu, barra de cima, "Para
você", cards de picks ou o relógio grande sem chave). Nada de faixa, linha de informações ou perfis.

## 2. O foco, em uma frase

O tile em foco **cresce 10% e sobe 6 px**; a sombra curta de repouso dá lugar a uma sombra longa e mais funda; uma luz
branca suave aparece no canto de cima à esquerda, com um contorno fino; e, onde a plataforma aguenta, essa luz e a
sombra **escorregam alguns pixels na direção da seta** e voltam com a mola. Os vizinhos não se mexem.

## 3. Medidas e valores

### Escala: fica em 1,10 (por quê)

| | 1,10 (proposto) | 1,12 | 1,15 |
|---|---|---|---|
| Tile em foco (1080p) | 330×186 | 336×189 | 345×194 |
| 1º tile, borda esquerda (com a subida) | **x = 81** | 78 | 73,5 |
| Vão até o vizinho | **42** | 39 | 34,5 |
| Topo / base (com a subida de 6) | **805,5 / 991,5** | 803,9 / 993,1 | 801,4 / 995,6 |
| Logos de foco do 203 (238×93) | **servem** | refazer | refazer |

- **Área segura:** nada que esteja **em repouso** nem nenhum texto sai dos 96/60. O tile em foco passa 15 px da linha de
  96 nas pontas (x = 81 e 1839) e fica dentro da **área de ação de 3,5%** (67 px dos lados, 38 em cima e embaixo), como a
  direção 200 aceitou. A subida de 6 px **melhora** a base: 991,5 contra 997,5 do 203 (limite 1020).
- 1,12 e 1,15 também caberiam na área de ação, mas apertam o vão (39 e 34 px; a sombra de foco, de 44 px de desfoque,
  passaria a escurecer o vizinho) e obrigam a refazer os logos de foco que o 203 acabou de medir. **1,10 não muda nenhuma
  medida nem cache**: o 204 só acrescenta efeitos.
- Topo do tile em foco (805,5) contra os metadados do card de hoje (~790): 15 px de folga no recorte. Com a faixa (206)
  isso deixa de existir.

### Tabela do foco (1080p; 720p = ×2/3, arredondado)

| | Repouso | Foco | 720p |
|---|---|---|---|
| Escala | 1 | **1,10** a partir do centro | igual |
| Subida | 0 | **6 px** (`round(6·k)`) | 4 px |
| Sombra (CSS: `0 y blur`) | **0 6 16**, dia 0,16 / noite 0,36 | **0 26 44**, dia 0,38 / noite 0,62 | 0 4 11 / 0 17 29 |
| Sombra no Android (raio do `BlurMaskFilter`) | **13** | **37** | 9 / 25 |
| Troca entre as duas | — | a de repouso some por alfa (1 − f), a de foco aparece por alfa (f) | igual |
| Brilho | — | degradê **diagonal** (135°, luz de cima à esquerda): branco **20%** no início → 0 aos **55%** do comprimento | igual |
| Contorno | noite: 1 px branco 10% (do 203) | + **1,5 px** por dentro, branco **22%** | 1 px |
| Paralaxe (onde há) | — | brilho **8 px**, sombra **4 px**, na direção da seta, e volta | 5 / 3 px |
| Reordenando (segurar OK) | — | como no 203 (+0,08 de escala, balança 1,5°), sobe 12 px no total, sombra de foco +0,14 de alfa, **sem paralaxe** | 8 px |

Conversão da sombra: o `blur` do CSS é 2σ; o raio do `BlurMaskFilter` é (σ − 0,5) / 0,57735 (a conversão do Skia).
Daí 16 → 13 e 44 → 37. As duas sombras são desenhadas **no tamanho de repouso dentro do canvas escalado** (como hoje),
então o desfoque nunca muda de tamanho: o cache do `Shadows` tem **uma** máscara por sombra.

**Por que o brilho é diagonal** (a direção 200 dizia "de cima para baixo"): um degradê vertical deslocado para os lados
fica idêntico, ou seja, a paralaxe da seta ← → não apareceria (o protótipo da Nova completa tem esse defeito). Em 135°,
8 px para o lado mexem a luz ~5,7 px, e 8 px para cima ou para baixo também. No **centro do tile** o brilho já é < 2%
(0,20 × (1 − 50/55)), então o logo e o nome sem logo **não perdem contraste** (Globoplay continua 3,1:1, o pior caso).

Ordem de desenho de cada tile: sombra de repouso → sombra de foco → degradê da marca → brilho → logo ou nome → contornos.
O brilho fica **embaixo** do logo (o logo continua nítido, pixel a pixel).

### Molas e curvas

| Movimento | Android (`Spring(response, damping)`) | Web (`transition`) | O que move |
|---|---|---|---|
| Foco (escala e subida) | **(0,30, 0,78)** — hoje 0,34/0,74 | `transform 240ms cubic-bezier(0.2, 0.9, 0.3, 1.15)` | o tile |
| Sombra de foco e brilho aparecem | o alfa sai da mesma mola do foco (`clamp(f)`): nenhuma mola a mais por tile | `opacity 180ms ease-out` | só opacidade |
| Paralaxe | **uma** mola por zona (a fileira), (0,40, 0,70), e um vetor de direção (dx, dy) | `transform 320ms cubic-bezier(0.2, 0.9, 0.3, 1.2)` | brilho e sombra do tile em foco |
| Deslize da fileira | (0,32, 0,86), não muda | `transform 300ms`, não muda | a fileira |
| `lite` | — | 0 ms | — |

**A paralaxe, passo a passo:** a seta muda o foco → a mola da zona recebe alvo = 1 na direção da seta por **160 ms**,
depois alvo = 0. Simulado: chega a 0,9 (7 px) aos ~170 ms, volta, passa 4% para o outro lado e para aos ~540 ms. Ao mesmo
tempo o brilho do tile novo aparece (180 ms): a luz "chega" deslizando e assenta no lugar. No web é a mesma coisa com uma
classe na fileira (`lean-l`, `lean-r`, `lean-u`, `lean-d`) por 160 ms.

- **← / →** na fileira: direção horizontal. **↓** dos cards (ou da barra) para a fileira e **↑** da gaveta para a
  fileira: direção vertical (a luz desce ou sobe e volta).
- **Nas pontas** (← no 1º app, → no último): o foco não muda, e a mesma paralaxe acontece **pela metade** (4 px), como
  uma batida na parede: quem aperta sabe que o controle respondeu e que acabou (pergunta 3).
- **Mouse e air mouse:** o foco por ponteiro não tem direção, então não há paralaxe.
- **Toques rápidos:** cada seta recomeça a ida e volta; a mola nunca passa de 1.

### Os vizinhos

Ficam **parados e com opacidade total** (`focus.dim_others: none`): nada empurra, nada escurece, e o resto da fileira
não é redesenhado de outro jeito quando o foco anda. O tile em foco é desenhado por último (já é assim) e a sombra dele
encosta de leve no vizinho: a 42 px de distância, o desfoque de 44 px deixa ~1,5% de escuro, invisível. Tiles fora da
janela continuam sumindo por opacidade (203).

## 4. As variantes

| | Android 13+ | Android 12/12L ≥ 3 GB | `Ui.LEGACY` (TCL do dono) | web normal | web `flat` | web `lite` |
|---|---|---|---|---|---|---|
| Escala e subida | mola | mola | mola | `transform` 240 ms | `transform` 240 ms | **na hora** |
| Sombra de repouso | `Shadows.draw` (na GPU: `BlurMaskFilter`, que o Skia desenha com um perfil em cache) | igual | **nove fatias do cache `Shadows`** | `box-shadow` fixo no rosto (`.art`) | fixa | nenhuma |
| Sombra de foco | idem, alfa = f | igual | cache `Shadows`; **só o tile em foco e o que está saindo** desenham | elemento à parte (`.lift`) com `box-shadow` fixo; anima **só a opacidade** | aparece de uma vez | nenhuma |
| Brilho e contorno | `LinearGradient` feito no layout, uma vez por tamanho | igual | igual (barato) | elemento `.sheen` (opacidade) e contorno (opacidade) | aparecem de uma vez | **nenhum: anel branco de 3 px** |
| Paralaxe | sim | sim | **não** (brilho parado) | sim (`transform` do `.sheen` e do `.lift`) | não | não |
| Camadas | a da fileira (como hoje) | igual | nenhuma (como hoje) | `will-change` só no tile em foco, no `.lift` e no `.sheen` dele | as do 203 (tudo que desliza) | nenhuma |

Notas:

- **"Android 9–12 ≥ 3 GB" na prática é só o Android 12/12L com 3 GB ou mais:** `Ui.LEGACY` vale para todo Android 8 a 11
  (e 12/12L com menos de 3 GB).
- **Efeitos pesados só no Android 13+:** o 204 não traz nenhum (sem AGSL, sem blur ao vivo, sem camada nova). A paralaxe é
  deslocar um degradê já feito, por isso fica também no 12 com ≥ 3 GB, como os tokens já diziam; no LEGACY ela sai mesmo
  sendo barata, porque a TCL já está perto do limite de quadros e o dono pediu o brilho parado.
- **`Shadows.java` não muda:** o raio do canto (28) e os dois desfoques fazem duas máscaras pequenas (157×157 e 329×304
  A8 a 1080p, ~120 KB; ~57 KB a 720p; o dobro com a versão pontilhada da noite). As antigas (desfoque 30) saem no
  `releaseSized()` da troca de aparência.
- **Nenhum `BlurMaskFilter` novo com `Ui.LEGACY`:** o `shadowDeep` de hoje vira dois paints (repouso e foco) feitos em
  `makePaints`, nunca no desenho.

### Android: como desenhar sem alocar

- `drawRowTile`: `s = 1 + 0,10·f` (+ 0,08·l reordenando), `dy = −round(6k)·f` (−12k·l reordenando). O `cell` do logo
  usa o mesmo centro deslocado, para o logo subir junto e cair inteiro no pixel em repouso e em foco.
- Brilho com paralaxe: `c.translate(ox, oy)` e o retângulo desenhado em `(−ox, −oy)`: a forma fica parada e o degradê
  anda. Nada de `setLocalMatrix` por quadro, nada de shader novo.
- Contorno: traço de `1,5k / s` (mínimo 1 px na tela), branco 22% × f.
- A mola da paralaxe e o vetor de direção são campos; o "volta para 0 depois de 160 ms" é um `Runnable` feito uma vez
  (`handler.postDelayed`). Com `Ui.LEGACY`, nada disso roda.
- Só o grupo dos tiles é invalidado enquanto a paralaxe anda (já é assim com `tilesDirty`).

### Web: como animar só o que é barato

- Estrutura do tile (Nova): `.tile` > `.lift` (sombra de foco) + `.art` (rosto: degradê, logo ou nome, sombra de repouso
  fixa e o contorno noturno) > `.sheen` (brilho, 8 px maior de cada lado para a paralaxe, cortado pelo `.art`) +
  `.rim` (contorno de foco).
- O brilho: `linear-gradient(135deg, rgba(255,255,255,0.2) 3.2%, rgba(255,255,255,0) 54.7%)` na caixa 8 px maior
  (são os 0% e 55% do tile); no `-webkit-linear-gradient` antigo o ângulo é `-45deg`.
- Muda só `transform` e `opacity`. Ao ganhar o foco, o tile, o `.lift` e o `.sheen` dele ganham `will-change`: há **uma**
  rasterização no 1º quadro (o rosto do tile novo), nenhuma durante a animação. Camada em todos os tiles continua
  proibida (memória de vídeo do webOS 3).
- **Risco a conferir no webOS 3 e 4:** um filho com camada própria dentro de `overflow: hidden` com cantos redondos pode
  aparecer com canto reto em Chromium antigo. Se aparecer, o `.sheen` perde a camada própria lá (fica sem paralaxe) —
  é uma linha de CSS.

## 5. Estados do tile

| Estado | Quando | O que aparece |
|---|---|---|
| Repouso | fora do foco | degradê + logo (ou nome); sombra 0 6 16; à noite, contorno de 1 px |
| Em foco | seta, mouse ou volta de outra zona | seção 3 |
| Em foco, LEGACY | Android 8–11, 12 com < 3 GB | igual, sem paralaxe |
| Em foco, `lite` | Tizen 2.x, LG de 1 GB | escala 1,10 e subida na hora, anel branco de 3 px, sem sombra nem brilho |
| Em foco, `flat` | Samsung até 2 GB | igual ao normal, mas sombra e brilho aparecem de uma vez e não há paralaxe |
| Reordenando | segurar OK | seção 3 (sem paralaxe) |
| Saindo do foco | a seta foi para outro tile | volta pela mesma mola; a sombra de foco e o brilho somem por alfa |
| Fora da janela | a fileira deslizou | some por opacidade (203) |

O foco nunca depende só de cor: em todos os caminhos há escala e subida, e mais brilho (ou o anel no `lite`).

## 6. Setas, OK e Voltar (não mudam; só a paralaxe acompanha)

| Zona | ← / → | ↑ | ↓ | OK | Voltar |
|---|---|---|---|---|---|
| **Fileira** (foco inicial: 1º app) | app anterior/próximo, sem dar a volta (nas pontas, meia paralaxe); desliza depois do 5º | cards de picks, no mais perto do tile em x; sem picks, a barra | gaveta, na tecla mais perto | abre o app (nível 1) | Android: nada (já é o Início); web: `TV.back()`; reordenando: cancela |
| **Cards** (de hoje) | card anterior/próximo | barra, na aba selecionada | fileira, no tile mais perto (paralaxe para baixo) | abre a pick | fileira, no app que tinha o foco |
| **Barra** | abas e botões, sem dar a volta | — | cards; sem picks, a fileira (paralaxe para baixo) | como hoje | fileira |
| **Gaveta** | como hoje | fecha, volta à fileira (paralaxe para cima) | — | como hoje | fecha |

Níveis até um app: fileira → app (1); gaveta → *Todos os Apps* → app (3). Nenhum muda. TalkBack lê o mesmo de hoje.

## 7. Orçamento e medida

**Base nova:** com a **chave TMDB** (lição do 214a: as picks somam ~16 MB no `:home`; a Clássica fica em ~84 MB). O
testador mede o **203 (a `main` de antes do 204) e o 204 no mesmo dia, na mesma TCL, os dois com chave**, depois de as
fotos das picks terminarem de baixar (PSS estável por 2 min; a leitura A2 do 214a, tirada no meio do download, não vale).

| Critério | Limite | Esperado |
|---|---|---|
| PSS do `:home` contra o 203 (cache aquecido) | **≤ +8 MB** (regra da fase); meta do card **≤ +3 MB** | ~+0,3 MB: duas máscaras do `Shadows` e dois degradês. Os logos de foco já existiam no 203; o 204 só os faz mais cedo |
| Nova inteira na TCL | ≤ 130 MB (decisão 9 do dono) | ~85–90 MB com chave |
| Quadros travados, R30 só na fileira | **≤ +1,5 ponto** contra o 203 e ≤ 10% absoluto; p95 ≤ 26 ms | +0,2 a +0,5 ponto: por quadro, só mais uma sombra de nove fatias e um contorno nos 2 tiles que mudam |
| 1ª passada pela fileira logo depois de abrir a Nova | travados ≤ a passada aquecida + 0,5 ponto | os logos de foco já estão prontos |
| Troca Clássica ↔ Nova, 3 ciclos sem navegar | a mediana do PSS não cresce **> 1 MB** entre ciclos | hoje cresce ~0,8 MB por ciclo (seção 9) |
| Web (M4) | ≥ 50 fps normal, ≥ 55 fps `lite`; no Performance do Chrome, nenhum "Paint" de sombra durante a animação | a sombra só muda de opacidade e de posição numa camada |

**Protocolo M deste card:**
1. Instalar, pôr a chave, esperar as picks e as fotos (PSS estável).
2. Aquecer: navegar a fileira inteira na Clássica e na Nova (8 apps).
3. R30-fileira na Nova, 3 rodadas: → até o 8º app e ← de volta, um toque a cada ~0,5 s, por 30 s. Mediana dos travados e
   p95 (`gfxinfo`).
4. Trocar para a Clássica e voltar; logo em seguida, uma passada → ← (a "1ª passada").
5. 3 ciclos Clássica ↔ Nova sem navegar, PSS depois de cada um.

**Logos de foco no layout (herdado do 203):** `makeRowTiles` (uma vez por layout, seção 9) faz para cada app do perfil
as duas cópias (repouso e foco) com `crispLogo`. O `onDraw` só lê o mapa. Com 8 apps a 1080p são ≤ 1,3 MB, no máximo
16 `Ui.downscale` de uma vez, na troca de aparência, de perfil ou de tamanho, que já são momentos com um quadro mais lento.
O log diz `home: row logos N in X ms`; se passar de 50 ms na TCL, passa para o `LOADER` com a geração do perfil (o padrão
do 214a), e o tile mostra o logo de repouso escalado até a cópia chegar.

## 8. Para o desenvolvedor (resumo)

- **Android** (`HomeLayout`, `HomeView`; `Shadows` e `Spring` não mudam): `HomeLayout.NOVA` ganha `focusLift` 6,
  `restShadow` (6, 13, 0,16/0,36), `focusShadow` (26, 37, 0,38/0,62), `sheen` (0,20, 135°, 55%), `rim` (1,5, 0,22),
  `parallax` (8, 4, 160 ms) e as molas; a Clássica fica com os valores de hoje e sem paralaxe. `drawRowTile` como na
  seção 4; `tileFocus` da Nova com (0,30, 0,78), a da Clássica com (0,34, 0,74). A mola da paralaxe: campo de `HomeView`,
  mexida em `move(dx, dy)` quando o foco anda na fileira ou entra nela por ↑/↓, nunca no LEGACY. Nada novo no `onDraw`.
- **Web** (`home.css`, `home.js`): `.look-new .tile.focus` com `translateY(-6px) scale(1.1)`; `.lift` com 0 26 44;
  `.art` com 0 6 16; `.sheen` e `.rim` criados em `renderRow`; a classe de direção em `#tiles` por 160 ms em `move()`;
  `lite`, `flat` como na seção 4. ES5 e sem variáveis CSS, grid ou `backdrop-filter`.
- **Textos:** nenhum texto novo.

## 9. Herdados do 203 (fechar neste card)

1. Raio do tile a 720p: `Math.round(lay.tileRadius * k)` (`HomeView.java` ~2259: 18,67 → 19).
2. Logos de foco no layout (seção 7).
3. Seta da fileira no web: `top` 72 (não 72,5; `web/home.js` ~660), centro em 904 como na especificação.
4. `makeRowTiles` uma vez só quando entram apps novos (`HomeView.java` ~1798 e o `layoutRow` que o precede).
5. **Resíduo de ~0,8 MB de native por ida e volta Clássica ↔ Nova:** achar e soltar o que a troca deixa. Suspeitos, por
   ordem: os `LinearGradient` da Clássica (`tileShaders`, `tileGlow`) que ficam presos quando a Nova assume, e o
   contrário (`rowTiles`, `rowGlow`); os `Symbols.warm` em tamanhos novos (chevron 24 e 28); paints com `BlurMaskFilter`
   refeitos em `makePaints`; as cópias de logo de um tamanho ainda presas numa display list já gravada. O critério é o da
   tabela: ≤ 1 MB entre ciclos.

## 10. Como ver no protótipo

Abra `design/prototype/index.html` direto do disco (Chrome ou Safari) e aperte **4**, ou abra com `#card=204`.

- **4:** recorte do 204 (o recorte do 203 com o foco final) ↔ Nova completa. **3** continua mostrando o foco provisório
  do 203, para comparar.
- **L:** web normal → `flat` → `lite` (anel). **E:** simula o Android `LEGACY` (a TCL): brilho e sombra sem paralaxe.
  **G:** guias, agora com a área de ação de 3,5% (tracejado fino) e a caixa do tile em foco. **N**, **A** (3 → 8 → 12),
  **T**, **K** e **R** (1280×720) valem também.
- Para sentir a paralaxe, ande devagar pela fileira com ← →, aperte → no último app (meia batida) e desça dos cards
  para a fileira (a luz desce e volta).
- Endereços prontos:
  - `#card=204&guides=1&keys=r`: o 2º app em foco com as medidas.
  - `#card=204&night=1&apps=8&keys=rrrrr`: à noite, com a fileira já deslizada.
  - `#card=204&legacy=1`: como na TCL do dono.
  - `#card=204&perf=lite&hd=1&keys=r`: TV fraca a 720p (anel).
  - `#card=204&perf=flat`: Samsung até 2 GB.
- O que não é representativo: o "logo" é o nome do app desenhado na caixa do logo, os cards são degradês e os títulos
  são inventados (como no 203). O `LEGACY` do protótipo é o CSS normal sem paralaxe; na TV as sombras saem do cache.

## 11. Perguntas ao dono

1. **Escala de foco em 1,10**, a mesma do 203 (cabe na área de ação, deixa 42 px até o vizinho e não refaz os logos)?
   Padrão: sim.
2. **Paralaxe:** a luz e a sombra escorregam 8 e 4 px na direção da seta e voltam em ~0,5 s, só nas TVs que aguentam
   (Android 12 com ≥ 3 GB, Android 13+ e web normal; na sua TCL o brilho fica parado). Está no ponto, ou prefere mais
   discreta (5 px)? Padrão: 8 px.
3. **Batida nas pontas:** apertar → no último app (ou ← no primeiro) dá meia paralaxe, para mostrar que o controle
   respondeu e que a fileira acabou. Padrão: sim.
4. **Cards de picks e de *Continuar assistindo* na Nova:** o card pedia as mesmas regras neles, mas o 206 tira esses
   cards da Nova (a faixa os substitui). Deixar como estão até lá? Padrão: deixar como estão.
5. **Brilho diagonal** (luz de cima à esquerda) no lugar do vertical da direção 200, porque o vertical esconde a
   paralaxe para os lados. Padrão: diagonal.
6. **`lite` e LEGACY também sobem os 6 px** (no `lite` sem animação), para a fileira ter a mesma geometria em todas as
   TVs? Padrão: sim.
