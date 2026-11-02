# 210 · Gaveta, All Apps, menu de contexto e avisos no estilo novo

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto,
**depende da pergunta 5 do card 200**; o designer pode dividir em 210a (gaveta) e 210b (folhas e menus) · Fase 2 ·
Depende de: 209

## Objetivo

Levar para a aparência *Nova* tudo o que abre por cima da tela inicial: a gaveta do ↓ (entradas, atalhos, clima,
cotações e os tiles de Home Assistant), a folha *All Apps*, o menu do OK segurado (picks e apps), o modo de mover app,
os avisos (toasts) e *Recent Apps*. Mesmos tiles, foco e vidro dos cards 203, 204 e 209; nenhuma função nova e nenhuma
removida.

## O que muda

- **Android:** `drawDrawer`, `drawDrawerTile`, `drawWeatherCard`, `drawQuotesCard`, `drawSheet`, `drawCard`, `drawMenu`,
  `drawToast` e o visual de `RecentApps` na *Nova*. `Snapshot` (cache do clima e das cotações em `Ui.LEGACY`) continua.
  Home Assistant: só o visual; `HomeAssistant.DOMAINS`, `SAFE_COVERS` e o limite de 8 não mudam.
- **Web:** `renderDrawer`, `renderPanels`, `renderApps`, o menu e os avisos sob `.look-new`.

## Plataformas

Google TV / Android TV e LG/Samsung (no web não há Home Assistant nem *Recent Apps*).

## Arquivos

- `app/src/io/freemytv/HomeView.java`, `RecentApps.java` (só visual; o fechamento de apps, `HomeMode.mayStop` e
  `neededByTv` **não** mudam).
- `web/home.js`, `web/home.css`.

## Riscos

- **Recent Apps** fecha apps com `am force-stop` pelo ADB da TV; este card não toca nessa lógica nem em `HomeMode`. O
  validador confere que o diff de `RecentApps.java` é só de desenho.
- **TCL LEGACY:** a gaveta é o ponto mais pesado (ver 209); cards de clima e cotações continuam em `Snapshot`.
- **TVs antigas:** a folha *All Apps* com muitos tiles; reaproveitar os elementos, não recriar a cada abertura.
- Muitas superfícies: risco de esquecer uma. Lista de conferência no critério 2.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança.
2. Na *Nova*, cada um abre, navega, fecha com Back e faz o que fazia: gaveta (entrada HDMI, atalho, clima, cotações),
   *All Apps*, menu do OK segurado (pick e app), mover app, aviso de app removido da prateleira, *Recent Apps* (se
   ligado). Home Assistant conferido no preview de código pelo validador (a TCL do dono não tem servidor configurado,
   salvo se o dono disser que tem).
3. TCL, protocolo M com o R30 abrindo gaveta e *All Apps*: regra por card contra o 209.
4. M4 dentro das metas web.

## Agentes

- **designer (primeiro):** cada superfície, com o OK do dono.
- **desenvolvedor:** branch `feat/210` (ou `feat/210a`/`feat/210b`).
- **validador:** `review/210.md`, com a lista do critério 2.
- **testador:** critérios 2 a 4.
