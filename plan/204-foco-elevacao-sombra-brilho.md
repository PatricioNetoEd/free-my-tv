# 204 · Foco tvOS: elevação, sombra suave e brilho

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto ·
Fase 2 · Depende de: 203

## Objetivo

Na aparência *Nova*, o tile em foco "sobe" na direção de quem assiste: cresce (proposta: 1,10 a 1,15, a decidir no 200;
hoje é 1,2), a sombra fica mais funda e mais deslocada para baixo, e um brilho suave passa por cima. Um efeito de
paralaxe leve **sem camadas de ícone**: o brilho e a sombra se deslocam alguns pixels na direção da última seta e voltam
com a mola. A navegação entre tiles fica fluida (molas do card 200).

## O que muda

- **Android:** `drawShelfTile` com os tokens novos; sombra pela `Shadows` (nove fatias em cache) em `Ui.LEGACY` e
  `BlurMaskFilter` real no Android 12+; o brilho é um `LinearGradient` criado uma vez por tamanho de tile (como
  `watchSheen`), nunca por quadro; o deslocamento é uma `Spring` a mais por zona, não por tile. As mesmas regras valem
  para os cards das picks e de *Continuar assistindo*, que já têm "sheen e rim" (consistência).
- **Web:** o tile em foco anima só `transform` (escala e `translateY`) e `opacity`; a sombra é um elemento à parte com
  sombra fixa (ou um PNG desfocado empacotado) cuja **opacidade** anima, nunca `box-shadow` em transição; o brilho é um
  elemento com degradê que anima `opacity`/`transform`. `will-change`/camada só no tile em foco (camada em todos os
  tiles estoura a memória de vídeo do webOS 3). `lite`: escala sem transição, sem sombra, sem brilho. `flat`: sombra
  estática, sem animação de sombra.

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/HomeView.java` (desenho do foco, molas), `Shadows.java` (só se precisar de um raio/desfoque novo
  no cache), `Spring.java` não muda.
- `web/home.css` (`.look-new .tile.focus` e afins), `web/home.js` (classe de direção da última seta, se o paralaxe
  entrar).

## Riscos

- **TCL LEGACY:** sombra desfocada recalculada a cada quadro custa ~40 ms num Mali-450 (CLAUDE.md); aqui ela tem de vir
  só do cache da `Shadows`. Desenhar o tile em foco por último (já é assim) e não redesenhar camadas que não mudaram.
- **webOS 3 / Tizen 2.4:** `box-shadow` animado é o que derrubou LGs Lite a 23-28 fps (#318, #383); por isso só
  opacidade. Tizen 2.4 recebe `lite` (sem efeito).
- **Exagero visual:** escala alta encosta o tile nos vizinhos ou na borda da área segura; o designer confere com 8 e 10
  apps e no primeiro/último tile.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança.
2. TCL, protocolo M (R30 todo na fileira de apps, é onde o foco mais anima): travados ≤ +1,5 ponto contra o 203 e
   **≤ 10%** absoluto; p95 ≤ 26 ms. PSS ≤ +3 MB (só caches de sombra e degradê).
3. Nenhuma alocação em `onDraw`/`draw*` (diff), nenhum `BlurMaskFilter` novo usado com `Ui.LEGACY`.
4. M4: ≥ 50 fps normal, ≥ 55 fps em `lite`; no Performance do Chrome, nenhum "Paint" de sombra durante a animação de
   foco (só "Composite").
5. O dono aprova a sensação do foco num vídeo curto da TCL (o testador grava com o celular, com o OK do usuário).

## Agentes

- **designer (primeiro):** curvas, escala, sombra e brilho em repouso/foco, aprovados pelo dono no protótipo.
- **desenvolvedor:** branch `feat/204`.
- **validador:** `review/204.md`.
- **testador:** M1 a M4 e o vídeo.

## Herdado da revisão do 203 (review/203.md, 2026-11-02)

- Arredondar o raio do tile a 720p (`HomeView.java` ~2151: 18,67 → 19).
- As cópias do logo no tamanho de foco são feitas no 1º `onDraw` que as usa (como a Clássica já fazia): medir os
  travados do 1º foco em cada app na TCL e, se pesar, gerar no layout.
- Seta da fileira no web em `top` 72,5 px (`web/home.js` ~659): arredondar.
- `makeRowTiles` roda 2× quando entram apps novos (`HomeView.java` ~1721 e ~1775): deixar uma.

## Herdado do teste do 203 na TV (review/203.md, aprovado pelo dono em 2026-11-02)

- **Gerar os logos de foco no layout**, não no 1º onDraw: navegar a fileira inteira subiu +4,6 MB de native (uma vez)
  e a 3ª rodada de M2 deu 1,24% janky.
- **Resíduo de ~0,8 MB de native por ida e volta Clássica ↔ Nova** (N2 37,6 → N3 38,4 MB sem navegar): achar o que a
  troca deixa para trás (RowTile/shaders, máscaras de `Shadows` em tamanhos novos, cópias do foco, etc.).
- Protocolo M deste card: antes de medir, navegar a fileira inteira nas duas aparências (cache aquecido); depois 3
  ciclos de troca sem navegar: a mediana não pode crescer > 1 MB entre ciclos.
