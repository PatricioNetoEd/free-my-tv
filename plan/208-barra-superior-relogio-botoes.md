# 208 · Barra superior: relógio, botões, abas e informações

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto,
**depende das perguntas 3 e 6 do card 200** · Fase 2 · Depende de: 206

## Objetivo

Reorganizar o que fica por cima da faixa de destaque na aparência *Nova*, ao jeito do tvOS (o relógio discreto no
canto superior direito, nada competindo com a imagem): os botões redondos (Live TV, Entradas, Configurações e os de
*Top Buttons*, incluindo *Recent Apps*), as abas Explorar/Filmes/Séries (onde o dono decidir: dentro da faixa, como
filtro, ou fora), as cotações, os ícones de status e o widget *Now Playing*. Nenhuma função some: só lugar, tamanho e
tipografia mudam.

## O que muda

- **Android:** `drawClock`, `drawLightButtons`, `drawLightTop`, `drawQuotes`, `drawStatusIcons` e o widget de
  *Now Playing* ganham posições e estilos da *Nova*; `topFocus`/`topIndex` continuam valendo para os botões. Textos
  medidos uma vez por mudança (`Ui.generation`), como hoje.
- **Web:** `renderTop`, `renderClock`, `renderQuotes` e o CSS sob `.look-new`.

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/HomeView.java`.
- `web/home.js`, `web/home.css`.

## Riscos

- **Funções esquecidas:** *Top Buttons* (até `HomeApps.MAX_TOP`), *Recent Apps* no topo, *Now Playing* (só com o
  listener permitido), ícones de status (só com a opção ligada), cotações (`show_crypto`). O validador confere cada
  uma na aparência *Nova*.
- **Desempenho:** texto sobre a imagem da faixa; nada de sombra de texto desfocada por quadro (em `Ui.LEGACY`, sombra
  em cache ou contorno escuro). Web: `text-shadow` estático, sem animar; em `lite`, sem sombra.
- Botões do controle que abrem coisas do topo (`Prefs.KEY_TCL_SETTINGS`, *Quick Panel*) não mudam.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança.
2. Lista de conferência (validador e testador) na aparência *Nova*: Live TV, Entradas, Configurações, *Recent Apps* no
   topo, cada *Top Button* extra, abas, cotações, ícones de status, *Now Playing*: cada um visível quando ligado,
   alcançável pelo controle e abrindo o que abria.
3. Contraste ≥ 4,5:1 do relógio e das abas sobre a faixa, dia e noite (capturas medidas).
4. Protocolo M: dentro da regra por card contra o 207; M4 dentro das metas web.

## Agentes

- **designer (primeiro):** disposição e estilos, com o OK do dono.
- **desenvolvedor:** branch `feat/208`.
- **validador:** `review/208.md` com a lista do critério 2.
- **testador:** critérios 2 a 4.

## Herdado da revisão do 202 (review/202.md, 2026-11-01)

- Contraste da Nova de dia: o cinza secundário `#6E6E73` (`HomeView.java` ~122; `web/home.css` ~120) dá 4,27:1; usar
  `#5A5A5F` da especificação na Nova.
- Esconder o relógio pequeno da barra no modo Relógio (`!clockMode()`).
- Rever a cor do relógio da barra quando houver a foto da faixa (206).
