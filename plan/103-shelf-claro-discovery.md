# 103 · Claro tv+ e discovery+ na prateleira

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java` nem `Watchdog.java`) · Status: aprovado pelo dono (2026-10-31); decisões do dono sobre a especificação (design/103): Samsung sem logo empacotado em web/icons/ (o tile mostra o nome); os dois apps no SAMPLE do preview, antes do Spotify; MARGIN sem mudança (fica para a fase tvOS) · Fase 1 do Meu TV OS

## Objetivo

Fazer o Free My TV reconhecer dois apps que o usuário tem instalados (linha de base da Fase 0) e que hoje não estão
na `SHELF`: **Claro tv+** (`br.com.claro.now.smarttvclient`) e **discovery+**
(`com.discovery.discoveryplus.androidtv`). Na prateleira, eles devem aparecer com o nome certo e com o logo de marca
recortado sobre o vidro, como Globoplay e os outros, e não com o nome do pacote e a arte crua da TV.

## Como funciona hoje (o que o desenvolvedor precisa saber)

- `HomeApps.SHELF` tem uma linha por app: `{chave, nome, pacote, cor da marca, modo do logo, escala}`. O logo não vem
  empacotado: `shelfLogo` tira o logo da arte de TV do próprio app (`bannerLogo`), com o modo `""`, `"tint"`, `"play"`
  ou `"white"`, e guarda em cache (`cacheDir/logos`). `LOGO_VERSION` não muda, porque são chaves novas.
- A prateleira padrão pega os **8 primeiros** apps da `SHELF` que estão instalados (`FEW_APPS = 8`). Nesta TV já
  existem 8 conhecidos antes do Spotify: Netflix, YouTube, Prime Video, Disney+, Max, Apple TV, Paramount+
  (`com.cbs.ca`) e Globoplay. Por isso, colocar as linhas novas no fim **não muda a prateleira padrão** de ninguém.
  Aqui elas entram quando o usuário as escolhe em *Home Settings → Shelf* (`Prefs.shelf`), e aí aparecem com nome e logo de marca.
- `HomeView.TILE_STYLE` (degradê de marca por chave) é opcional e só existe para 7 marcas.
- A chave `claro` já aparece em `HomeApps.DEVICE_WORDS` (ícone de aparelho HDMI). É outro mapa, mas para não
  confundir use as chaves `clarotv` e `discoveryplus`.

## Plataformas

- **Android TV / Google TV:** o principal, testado nesta TV.
- **LG (webOS) e Samsung (Tizen):** `web/home.js` segue o `HomeView` (CLAUDE.md), então entra a paridade em
  `web/home.js` `SHELF`, que reconhece pelo **título** (regex) além do id. Não temos TV LG nem Samsung para confirmar
  os ids: use regex de título conservadoras (`/claro ?tv/i`, `/discovery\+|discoveryplus/i`) e de id
  (`/claro/`, `/discoveryplus/`). Nunca use `/discovery/` puro, porque o LG tem o seu próprio
  `com.webos.app.discovery` (já em `HIDDEN` no `web/tv.js`).

## Arquivos

- `app/src/io/freemytv/HomeApps.java`: duas linhas no fim da `SHELF`, depois do Spotify ou logo antes dele. A ordem
  das linhas que já existem não muda.
- `app/src/io/freemytv/HomeView.java` (opcional, decisão do designer): `TILE_STYLE` para `clarotv` e `discoveryplus`.
- `web/home.js`: duas entradas na `SHELF`, com degradê.
- `web/tv.js` (opcional): `SAMPLE` do preview com os dois títulos, para o `--preview` mostrar o resultado.
- `design/tokens.json` (designer): cores de marca. Claro tv+ é vermelho Claro e discovery+ é azul, mas os valores
  exatos saem da arte de TV de cada app nesta TV, não de chute.
- Fora do escopo: `Recs.SERVICES` / `web/data.js` `SERVICES` (indicações do TMDB para esses serviços no BR) ficam para outro card.

## Riscos

- **Modo do logo errado:** com `"tint"` num logo colorido, ou `""` num logo branco sobre degradê, o logo fica feio ou
  some. O designer decide olhando a arte de TV (banner) de cada app. Se `bannerLogo` não achar nada (`.none`), a
  prateleira usa a arte do app com a cor de fundo. Não quebra.
- **Memória (2 GB, 435 MB de swap já em uso):** cada app na prateleira guarda o logo em 2 tamanhos. Com o usuário
  pondo 10 ou mais apps, a prateleira rola. Medir o PSS do `:home` antes e depois.
- **web/:** uma regex de título larga demais pode puxar o app errado para a prateleira. ES5 só (`tools/check.sh`).
- Sem chamadas de rede novas, sem texto novo para traduzir (nomes de marca não passam por `Ui.tr`).

## Critério de pronto (mensurável)

1. `./build.sh` termina com `Built FreeMyTV.apk`. `python3 webos/build.py` e `python3 tizen/build.py` terminam com
   `Built …`. `tools/check.sh` passa (ES5 e CSS inclusos).
2. O diff da `SHELF` (Android e web) só **acrescenta** linhas, e as que já existiam continuam na mesma ordem.
3. Na TV, em *Home Settings → Shelf*, aparecem "Claro tv+" e "discovery+" (com esses nomes). Postos na prateleira,
   cada um mostra logo de marca recortado. Isso se confere numa captura de tela de antes e depois, com o OK do usuário.
4. OK em cada um abre o app: `dumpsys activity activities | grep mResumedActivity` mostra `br.com.claro.now.smarttvclient`
   e depois `com.discovery.discoveryplus.androidtv`.
5. Com os dois na prateleira, `dumpsys gfxinfo io.freemytv` (30 s navegando pela prateleira) não piora mais de 1 ponto
   percentual de quadros travados em relação à mesma medida sem eles. `dumpsys meminfo io.freemytv:home` sobe menos de 5 MB.
6. No `--preview` do webOS, os dois títulos de exemplo caem na prateleira com o degradê de marca.

## Agentes

- **designer:** olha a arte de TV dos dois apps, escolhe a cor, o modo do logo e a escala, decide sobre `TILE_STYLE`
  e os degradês web, e registra tudo em `design/tokens.json`. Entrega a especificação em `design/`.
- **desenvolvedor:** as linhas em `HomeApps.java`, `HomeView.java` (se o designer pedir) e `web/`, na branch `feat/103`.
- **validador:** confere que só houve acréscimos, ES5, nenhuma rede nova e o contraste do logo sobre o vidro, e escreve `review/103.md`.
- **testador:** itens 3 a 5 na TV e o 6 no preview.

## Ajustes depois da revisão 1 (2026-10-31, aprovados pelo dono)

- Regex de id do Claro tv+ na web estreitada para `/claro\.now|clarotv|claro\.tv/` (commit `9034913` em `feat/103`):
  `/claro/` pegava Claro video (`com.clarovideo.app`) e Claro música (`com.claro.musica`). O título (`/claro ?tv/i`)
  continua achando o Claro tv+ se o id no LG/Samsung for outro.
- "Não muda a prateleira padrão de ninguém" vale para quem já tem 8 apps conhecidos; quem tem menos e um dos dois
  instalado os ganha no fim da prateleira padrão, sem reordenar nem remover nada.
- Critério 6 (preview): os dois aparecem em All Apps com o degradê e, escolhidos em Home Settings → Shelf, na
  prateleira. A prateleira padrão do preview segue a ordem da `SHELF` e não os inclui.
