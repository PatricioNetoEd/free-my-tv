# 203 · Tiles grandes e arredondados na fileira de apps

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: aprovado pelo dono (2026-11-02) ·
Fase 2 · Depende de: 202

## Objetivo

Na aparência *Nova*, a fileira de apps vira tiles grandes (proposta: 5 visíveis, por volta de 300×169 em repouso a
1080p, o tamanho da folha *All Apps* de hoje), com raio maior e a arte **preenchendo o tile**, no lugar dos ícones de
até 224×126 com o logo cobrindo ~8,5%. A arte é a que o dono escolher no card 200 (pergunta 2): o banner de TV inteiro
do app, ou o logo de marca grande sobre o degradê da marca (`TILE_STYLE`, `tokens.json` → `brand`). O foco continua o
de hoje neste card (o 204 muda).

## O que muda

- **Android:** `HomeView` desenha a fileira com as medidas do card 200; `HomeApps`/cache de logos (`cacheDir/logos`,
  `crispLogos`) gera a arte no tamanho de repouso e no de foco, já filtrada (como hoje, sem escalar no desenho), no
  tamanho da UI (TVs de 1280×720 desenham a 720p). Se o formato do cache mudar, sobe `LOGO_VERSION`. A prateleira de
  vidro (platter) vira o que o designer definir (provavelmente some, como no tvOS, e os tiles ficam sobre o fundo).
- **Web:** `.look-new .tile` com as medidas novas; a arte é o logo empacotado (`web/icons/`, `SAMSUNG_ICONS`) ou o
  ícone do LG sobre o degradê de `SHELF`, porque o web não tem banner de TV: aqui "preencher" é o logo grande no
  degradê. Imagem por `background-image` com `background-size` (mais seguro que `object-fit` no WebKit 538 do Tizen 2.4).

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/HomeView.java` (`drawTiles`, `drawShelfTile`, `drawLogo`, medidas), `HomeApps.java` (só a
  geração da arte no tamanho novo; **não** mexer em `SHELF`, `HIDDEN`, `LIVE_TV_APPS` nem na ordem).
- `web/home.js` (`face`, `renderShelf`, `placeTiles`), `web/home.css`.
- `design/tokens.json` só pelo designer.

## Riscos

- **Memória na TCL (2 GB, 435 MB de swap):** arte maior em 2 tamanhos. Conta do designer/desenvolvedor: 300×169 ARGB
  ≈ 200 KB, em foco ≈ 250 KB; ~0,45 MB por app, ~3,6 MB com 8 apps. Com a grade do 205 isso cresce: carregar só o
  visível. Opacas (banners) podem usar `RGB_565` em `Ui.LEGACY`.
- **Banners de qualidade ruim** (texto pequeno, fundo branco) ficam feios grandes: o designer define o fallback (logo
  recortado sobre degradê) por app em `tokens.json`.
- **TVs antigas:** imagens maiores para decodificar no Tizen 2.4 e webOS 3; usar o tamanho exato do tile (sem
  redimensionar no CSS a cada quadro). Em `lite`, nenhum efeito novo.
- Reordenar apps (segurar OK, `moveLift`), mouse e TalkBack precisam das posições novas.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança (capturas, como no 202).
2. Com *Nova*: tiles nas medidas do card 200 (±2 px na captura a 1080p); arte nítida em repouso e em foco (sem
   serrilhado nem borrão de escala, comparado pelo validador na captura).
3. TCL, protocolo M: PSS ≤ +8 MB contra o 202 (meta do designer: ≤ +5 MB com 8 apps), travados ≤ +1,5 ponto, frio ≤
   +100 ms, e abaixo dos tetos.
4. Captura a 1280×720 (preview web a 1280×720 e, se houver, uma TV 720p) sem arte borrada.
5. M4 no preview: metas web, com e sem `lite`.

## Agentes

- **designer (primeiro):** tamanho, raio, arte por app e fallback, aprovados pelo dono.
- **desenvolvedor:** Android e web, branch `feat/203`.
- **validador:** `review/203.md` (medidas, nenhuma mudança em `SHELF`, ES5, sem alocação em `onDraw`).
- **testador:** M1 a M4, capturas.

## Herdado da revisão do 202 (2026-11-01)

- Criar `Ui.displayBold` (Inter peso 700) para o nome no tile (e o título da faixa no 206).

## Aprovação do dono (2026-11-02)

Recorte do protótipo (`design/203-tiles-grandes.md`, `#card=203`) aprovado, com os padrões do designer: foco
provisório 1,10 até o 204; setas de "há mais" nas margens até o 206; app fora da lista de marcas mostra o nome sobre
o cinza escuro; degradê de marca para Hulu, Paramount+, Peacock e Spotify fica para um card pequeno depois.
