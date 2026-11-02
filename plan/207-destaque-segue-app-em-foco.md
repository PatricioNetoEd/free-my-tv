# 207 · A faixa de destaque segue o app em foco

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*; nenhuma permissão
nova) · Status: proposto, **depende da resposta do dono à pergunta 1 do card 200** · Fase 2 · Depende de: 206

## Objetivo

Como o "top shelf" do tvOS: com o foco num app da primeira fileira, depois de um tempo parado (proposta: os 500 ms de
`BG_FOLLOW_MS`), a faixa mostra conteúdo **daquele app**, na ordem que o dono decidir. Proposta:

1. picks do TMDB que já foram baixadas e cujo serviço é esse app (`Recs.Pick.app`, mapeado por `Recs.SERVICES`; no web,
   `SERVICES` de `web/data.js`);
2. *Continuar assistindo* desse app (`WatchNext`), **só** se o usuário já ligou *Continue Watching* em Home Settings
   (a permissão `READ_TV_LISTINGS` já é concedida e revogada pelo fluxo de hoje; este card não pede nada novo);
3. a arte grande do próprio app (banner ou logo sobre o degradê da marca) com o nome.

Com o foco fora da fileira, a faixa volta às picks gerais (206).

## Fora do escopo (e por quê)

- Ler os **canais de prévia** de outros apps (o que o launcherx mostra por app) exigiria uma permissão nova concedida
  pelo ADB da TV, o que passa por `HomeMode`/`Adb.java`: seria **ALTO RISCO** e card próprio, com o OK do dono. Não
  entra aqui.
- Buscar picks no TMDB **por app a cada foco** (mais chamadas de rede): não entra. Só o que o `Recs` já baixou. Se o
  dono quiser mais picks por serviço, é outro card.

## O que muda

- **Android:** `HomeView` escolhe o conteúdo da faixa a partir do tile em foco, com espera antes de trocar e sem trocar
  se o foco só passa correndo (como `bgFollow`); um índice "app → picks" é montado quando as picks chegam
  (`onRecs`), nunca no `onDraw`.
- **Web:** o mesmo em `web/home.js` (`followSoon` já faz a espera para o fundo).

## Plataformas

Google TV / Android TV e LG/Samsung (no web, sem *Continuar assistindo*, que não existe lá).

## Arquivos

- `app/src/io/freemytv/HomeView.java`, `Recs.java` (só leitura das picks já baixadas), `WatchNext.java` (só leitura).
- `web/home.js`, `web/data.js` (só leitura de `SERVICES`).

## Riscos

- **Fluidez (TCL LEGACY):** passar o foco pela fileira não pode disparar decodificação de imagem a cada tile; só depois
  da espera, e cancelando a anterior (`generation`, como em `RecentApps`).
- **Memória:** continua o limite de 2 imagens grandes do 206.
- **Picks erradas para o app:** um serviço mapeado errado em `SERVICES` mostraria o filme no app errado; o validador
  confere que nada em `SERVICES` muda neste card.
- **TVs antigas:** troca de `background-image` frequente no Tizen 2.4; a espera e o `w780` em `lite` seguram.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança.
2. Na TCL, foco parado 1 s em Netflix, Prime Video e Globoplay: a faixa mostra pick desse serviço quando há uma (a
   lista de picks do momento serve de gabarito), ou a arte do app quando não há (capturas).
3. R30 correndo pela fileira (toques a cada 0,3 s): nenhuma decodificação até parar (log do app em modo de depuração,
   ou contagem no código conferida pelo validador); travados ≤ +1,5 ponto contra o 206.
4. Nenhuma chamada de rede nova e nenhuma permissão nova (diff de `AndroidManifest.xml` vazio; `pm grant`/`HomeMode`
   não aparecem no diff).
5. PSS ≤ +3 MB contra o 206; M4 dentro das metas web.

## Agentes

- **designer (primeiro):** ordem do conteúdo por app e o estado "sem conteúdo", com o OK do dono.
- **desenvolvedor:** branch `feat/207`.
- **validador:** `review/207.md` (com atenção ao critério 4).
- **testador:** critérios 2, 3 e 5.
