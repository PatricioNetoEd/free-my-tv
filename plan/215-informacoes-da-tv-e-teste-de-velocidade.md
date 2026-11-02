# 215 · Informações da TV no topo da Nova e teste de velocidade (Cloudflare, só sob pedido)

Risco normal pela regra (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java`, `HomeMode` nem o modo *Original*;
nenhuma permissão nova no Android, nada pelo ADB da TV) · **Atenção: endereço de rede NOVO** (`speed.cloudflare.com`,
aprovado pelo dono em 2026-11-01), por isso o validador confere a rede como num card de alto risco · Status: proposto ·
Fase 2 do Meu TV OS · Pedido do dono em 2026-11-01 (decisões depois do protótipo, `plan/200-direcao-visual-tvos.md`) ·
Depende de: **208** (barra superior da Nova)

## Objetivo

Na aparência *Nova*, as cotações (BTC, ETH, SOL, dólar) saem do topo e da gaveta. No lugar delas, ao lado das
abas-filtro, entra uma linha de **informações da TV**:

`São Paulo · 24 °C · 4K · 60 Hz · ↓ 87 Mbps, há 2 h`

- **Cidade:** a configurada (`Prefs.city()`: Home Settings, senão `config.properties`, senão o fuso da TV por
  `Place`/`zones.json`). Sem GPS e sem geolocalização por IP: nada novo é perguntado a ninguém.
- **Temperatura:** a de `HomeData.weather.temp`, que o app já busca no Open-Meteo a cada 30 min. Segue a unidade de
  Home Settings (`Prefs.temperature()`: °C por padrão, °F se a pessoa escolheu). Nenhuma busca nova.
- **Resolução:** o modo de exibição atual (abaixo). Lida ao abrir a tela e quando o sistema avisa que mudou.
- **Velocidade:** o último resultado do teste da Cloudflare e quando foi. O teste **só roda quando o dono pede** (OK
  nesse item), dura ~10 s, nunca sozinho, nunca no UI thread, Voltar cancela, com limite de dados por teste.

A aparência *Clássica* não muda: cotações como hoje (se ligadas), sem linha de informações e sem teste.

## Plataformas

- Google TV / Android TV (alvo de medida: TCL Smart TV Pro, Android 11, 2 GB, `Ui.LEGACY`, UI 1080p em painel 4K).
- LG webOS 3+ e Samsung Tizen 2.3+ (`web/`), com as limitações descritas em "Web".

## Resolução da tela

**Android** (sem permissão):

- Fonte principal: `Display.getMode()` (API 23+) do display padrão → `getPhysicalWidth()`, `getPhysicalHeight()`,
  `getRefreshRate()`. É o sinal mandado ao painel (num streamer em HDMI, a saída HDMI). Nunca `getRealSize()` nem
  `DisplayMetrics`, que dão o tamanho da **UI**: na TCL a UI é 1920×1080 (`ro.surface_flinger.max_graphics_width`) num
  painel 3840×2160, e a linha diria "1080p" errado.
- Conferência: se `getMode()` disser 1920×1080 mas `getSupportedModes()` tiver um modo 3840×2160 **com a mesma taxa**,
  mostrar o modo atual ("1080p"), porque é o que o sistema diz que está ativo; o testador registra o que a TCL
  responde (`dumpsys display`, só leitura, com o OK do usuário) e, se o modo ativo da TCL vier como 1080p apesar do
  painel 4K, o dono decide (pergunta 2) entre mostrar o maior modo suportado ou o ativo.
- Rótulo: largura ≥ 7680 → "8K"; ≥ 3840 → "4K"; ≥ 2560 → "1440p"; ≥ 1920 → "1080p"; ≥ 1280 → "720p"; menor, "{h}p".
  Taxa arredondada ao inteiro (59,94 → "60 Hz", 23,976 → "24 Hz"); taxa ausente ou 0, só a resolução.
- Atualização: lida no `onResume` do `HomeActivity`, e `DisplayManager.registerDisplayListener` só enquanto a tela
  inicial está à frente (registrado no `onResume`, removido no `onPause`): quando um app mudou a taxa (24 Hz de filme)
  e a pessoa volta, aparece a de agora. O texto é montado fora do `onDraw` e guardado (cache por `Ui.generation`).

**Web** (sem permissão nova):

- LG: a mesma chamada Luna que `web/tv.js` já faz (`com.webos.service.tv.systemproperty/getSystemInfo`), pedindo
  também a chave `UHD` (a que `webos/install.py` já lê): `"true"` → "4K"; `"false"` → "1080p" ou "720p" por
  `screen.width × devicePixelRatio`. 8K só se a mesma chamada responder uma chave de 8K sem permissão nova (o
  desenvolvedor confere com o que o `webOSTV.js` da LG lê). Sem taxa (o web não sabe a taxa do painel).
- Samsung: o app desenha a 1920×1080 também em painel 4K, e `screen × devicePixelRatio` não distingue um do outro.
  O jeito certo (`webapis.productinfo.isUdPanelSupported()`) pede `webapis.js` e, pela documentação da Samsung, o
  privilégio `http://developer.samsung.com/privilege/productinfo` em `tizen/config.xml`: **permissão nova, fora deste
  card** (pergunta 3). Proposta: no Samsung, a resolução só aparece quando `screen × devicePixelRatio` passar de 1920
  de largura (então é verdade); com 1920, o item fica de fora em vez de chutar.
- Preview do navegador: o rótulo calculado do `screen` do computador.

## Teste de velocidade

### Endereço e política de rede

- **Só** `https://speed.cloudflare.com/__down?bytes=<n>` (GET). Nenhum outro caminho (`__up`, `cdn-cgi/trace`,
  `meta`, `locations`) neste card; upload e latência ficam para depois, se o dono quiser (pergunta 4).
- Só HTTPS. Nada muda em `network_security_config.xml` (o `base-config` continua sem cleartext; `lan_server` não
  entra, não é rede local). No web, nada de queda para `http://` (como o Open-Meteo faz no Tizen 2.x): se o HTTPS
  falhar, o teste diz que não deu.
- **Sem seguir redirecionamentos:** Android `setInstanceFollowRedirects(false)`; qualquer 3xx = falha ("Teste
  indisponível"). Web: depois do XHR, `responseURL` (onde existe) tem de ser o mesmo endereço pedido, senão descarta.
- **Sem cookies e sem IDs:** nenhum `CookieHandler` (o app não define um; o validador confere que continua assim),
  `Set-Cookie` ignorado; só os cabeçalhos `User-Agent: FreeMyTV` (o mesmo de `HomeData.get`) e
  `Accept-Encoding: identity` (para contar bytes reais). Na URL só `bytes=`: nada de `measId`, modelo, IP, país ou
  versão. No web, XHR sem `withCredentials`.
- 429 ou 5xx: "Teste indisponível, tente mais tarde", sem repetir sozinho.

### Como mede (proposta)

1. Aquecimento: `bytes=100000` (abre a conexão TLS; não entra na conta).
2. Depois, pedidos seguidos na mesma conexão (keep-alive): `bytes=1000000`, `bytes=10000000`, e então
   `bytes=25000000` até parar. Um fluxo só (sem conexões paralelas: menos memória e CPU na TV).
3. Para quando acontecer o primeiro destes: **10 s** de teste, **50 MB** recebidos no total (limite duro, contado
   no laço de leitura, não no pedido), Voltar, a tela inicial sair da frente (`onPause`), a tela apagar, ou erro.
   Tempo máximo absoluto 15 s (conexão lenta para abrir).
4. Resultado em Mbps = bytes recebidos nos pedidos de 10 MB+ ÷ tempo entre o primeiro e o último byte deles (exclui o
   aquecimento e o tempo até o primeiro byte). Se não chegou a nenhum de 10 MB (conexão lenta), conta o de 1 MB.
   Formato: inteiro a partir de 10 ("87 Mbps", "940 Mbps"), uma casa abaixo de 10 ("4,2 Mbps"), em `Ui.locale()`.
5. Cancelado (Voltar ou saída): nada é gravado; fica o resultado anterior.

**Dados por teste:** no máximo 50,1 MB (aquecimento incluído). A 10 Mbps um teste gasta ~12 MB; a 100 Mbps, ~50 MB e
termina antes dos 10 s. Se a rede da TV for **tarifada** (`ConnectivityManager.isActiveNetworkMetered()`: celular
roteado), antes de começar aparece "Este teste usa até 50 MB de dados. Testar?" (OK/Voltar). No web não há como
saber; o limite vale igual.

### Onde roda (Android)

- Classe nova `SpeedTest` (sem UI): uma `Thread` própria criada no OK e terminada no fim (não o `io` de `HomeData`,
  para não atrasar o clima), com `Process.THREAD_PRIORITY_BACKGROUND`, um buffer de 64 KB alocado uma vez por teste e
  descartado no fim, leitura e descarte (nada guardado do que chega). Toda exceção é pega dentro da thread: o watchdog
  do `:home` conta crash ali como crash da tela inicial.
- Progresso: `HomeView` lê um contador atômico num `Handler` a cada 250 ms **só durante o teste** e invalida só o
  retângulo da linha. Sem timer nenhum fora do teste.
- Resultado: preferências privadas próprias `speed` do `:home` (`mbps`, `at`), **sem** subir `Prefs.version` (que faria
  a tela recomeçar e buscar clima e picks de novo). Não vai para o log além de "speed: done/cancelled/failed" (sem IP).
- "há 2 h" usa os padrões que já existem nos catálogos (`{n} min ago`, `{n} h ago`) e é refeito no tique de minuto que
  o relógio já tem. Mais de 7 dias: a data curta. Sem resultado ainda: "Testar velocidade".

### Web

- Sem `fetch` (o `tools/check.sh` barra, e o webOS 3 não tem): **XHR em pedaços**, `responseType = 'arraybuffer'`,
  pedidos seguidos de `bytes=4000000` (4 MB; 2 MB em `flat`) até 10 s ou 50 MB; cada `ArrayBuffer` é solto ao chegar
  (nenhuma referência guardada), então o pico de memória é ~1 pedaço, nunca os 25 MB de uma vez. Progresso por
  `onprogress` (`loaded`). Voltar ou tempo esgotado: `xhr.abort()`. Conta como no Android, sem o primeiro pedaço.
- **`lite` (Tizen 2.3/2.4, LG de até ~1,5 GB): o teste não é oferecido** (proposta; pergunta 5): o item de velocidade
  não aparece, e a linha fica "cidade · °C · resolução". Motivos: decodificar TLS a dezenas de Mbps nesses
  processadores trava a página, e o Tizen 2.x pode não confiar na cadeia do certificado da Cloudflare (o mesmo problema
  da ISRG no Open-Meteo).
- CORS: o validador confere, do computador (não da TV), que `speed.cloudflare.com/__down` responde
  `Access-Control-Allow-Origin` aceitando a origem `null` do webOS (`file://`) e a do widget Tizen
  (`curl -sI -H 'Origin: null' 'https://speed.cloudflare.com/__down?bytes=0'`). Se não aceitar, o teste fica só no
  Android e o dono é avisado. `tizen/config.xml` já tem `<access origin="*">`: não muda.
- Resultado em `localStorage` (`fmtv.speed`: `{mbps, at}`), fora de `fmtv.prefs`.

## Cotações na Nova

- Com *Nova*, `HomeData` **não busca** preços da Binance para a tela inicial (hoje busca a cada 5 min com
  `Prefs.quotes()`): nada de custo de rede ou CPU por um dado que não aparece. O protetor de tela continua como está até
  o 213 (se as cotações estiverem ligadas, ele ainda as busca enquanto aparece). Web: o mesmo em `web/data.js`.
- Home Settings: a linha *Quotes widget* continua; com *Nova*, ganha a nota "Só na aparência Clássica" (texto do
  designer). Nenhuma preferência de quem usa a Clássica é apagada.
- O 210 (gaveta) deixa de ter o painel de cotações na *Nova* (o painel de clima ocupa o lugar). Se o 210 já tiver
  sido feito antes deste, este card tira o painel; se não, o 210 já nasce sem ele.

## Interface (designer)

- Lugar: ao lado das abas-filtro, onde estavam as cotações (seção 3 da especificação do 200), 24 px, branco a 78%,
  algarismos tabulares, separador "·". Itens desconhecidos somem (sem "--"): sem clima, sem temperatura; sem resolução
  conhecida, sem resolução.
- Foco: só o item de velocidade recebe foco, na mesma linha de foco da barra superior do 208 (o relógio continua sem
  foco). OK: começa o teste. Durante o teste: "↓ 43 Mbps…" atualizando, e um indicador discreto de progresso pelo
  tempo (sem animação contínua em `Ui.LEGACY` e `lite`). Voltar com o teste rodando: cancela e **não** sai da barra.
- TalkBack: "Velocidade da internet: 87 megabits por segundo, medida há 2 horas. OK para testar." / "Testando a
  velocidade, Voltar cancela." / no fim, anuncia o resultado. Mouse: clicar no item = OK.
- 720p: tudo × 2/3, texto ≥ 16 px (equivale a 24 px a 1080p).
- Opção em Home Settings *Informações da TV* (ligada por padrão na *Nova*) para quem não quiser a linha (pergunta 6).
- Textos novos (português e inglês à mão; os outros caem no inglês até o 212): "Test speed", "{n} Mbps",
  "Testing speed…", "Speed test unavailable", "This test uses up to {n} MB of data. Test?", "Only in the Classic look",
  "TV info", rótulos de resolução que precisem de tradução. `python3 tools/translate.py`.

## Documentação (faz parte do card; ver regras do dono)

Proposta de texto, com o OK do dono na redação (CLAUDE.md só muda com o OK explícito dele):

- `CLAUDE.md`, seção "The code", a frase "The app talks only to TMDB, Open-Meteo, Binance, …" passa a incluir
  "Cloudflare's speed test (`speed.cloudflare.com`, only when the person presses OK on the speed item: up to 50 MB,
  ~10 s, no redirects, no cookies)". A frase "new sources … must not add network calls without the owner's OK" fica.
  Uma linha nova no item do `HomeView`/topo descrevendo a linha de informações e que `getMode()` é o painel, não a UI.
- `README.md`: em "Data" e em "Privacy", a mesma informação (quando, quanto, o que vai: só um pedido de bytes, sem
  identificador; a Cloudflare vê o IP da casa, como todo site). Em "Credits", nada (não há dado de terceiro exibido
  além do número).
- `docs/index.html` **e** `docs/pt/index.html`, pergunta "Ele coleta algum dado?": a mesma frase, nos dois idiomas.
  Pela decisão 10 do 200, o site só é publicado quando o dono pedir: a mudança fica na branch e o merge em `main` (que
  publica) espera o OK dele (pergunta 7).

## Arquivos

- Android: `app/src/io/freemytv/SpeedTest.java` (novo), `HomeView.java` (linha, foco, OK/Voltar, desenho em cache),
  `HomeActivity.java` (listener de display no `onResume`/`onPause`; cancelar o teste no `onPause`), `HomeData.java`
  (não buscar preços na *Nova*), `Prefs.java` (opção *Informações da TV*), `SettingsActivity.java` (opção e nota das
  cotações), `app/assets/i18n/*.json`. **Não** mudam: `AndroidManifest.xml`, `network_security_config` (gerado por
  `build.sh`), `build.sh`, `HomeMode`, `Adb.java`, `Watchdog.java`.
- Web: `web/data.js` (teste em XHR, preços só na Clássica, `fmtv.speed`), `web/tv.js` (chave `UHD` na chamada Luna
  que já existe; leitura do `screen`), `web/home.js` (linha e foco), `web/home.css`. **Não** mudam
  `tizen/config.xml` e `webos/appinfo.json`.
- Docs: `CLAUDE.md`, `README.md`, `docs/index.html`, `docs/pt/index.html`.

## Riscos

- **Rede nova:** é a primeira chamada a um host que não traz dado de conteúdo; o validador trata como alto risco de
  privacidade: um só host, só `__down`, sem redirecionamento, sem cookie, sem ID, só sob OK.
- **Dados:** 50 MB por teste numa rede tarifada; por isso o aviso em rede tarifada e o limite contado no laço.
- **UI travando no `Ui.LEGACY` durante o teste:** TLS a 100+ Mbps ocupa um núcleo do Realtek; prioridade de fundo,
  buffer fixo e redesenho só da linha a 4 Hz. Se mesmo assim cair abaixo da meta, o card reduz o teto (ex. 25 MB) em
  `Ui.LEGACY` em vez de baixar a meta.
- **Resolução errada na TCL:** o modo ativo pode vir como o da UI em firmwares Realtek/MediaTek; tratado acima com a
  leitura do testador e a pergunta 2.
- **Cloudflare mudar o serviço** (é o endpoint do site deles, sem contrato de API): 4xx/3xx = "Teste indisponível",
  sem quebrar nada; o resto da linha continua.
- **Web antigo:** `ArrayBuffer` de 4 MB por pedaço; heap conferido no M4 antes e depois do teste.
- **Processo `:home` e watchdog:** exceção escapando da thread conta como crash da tela inicial (3 em 5 min voltam
  para a tela original): tudo dentro de try/catch, e o teste conferido com cabo de rede puxado no meio (com o OK e as
  mãos do usuário).

## Critério de pronto (mensurável)

1. `tools/check.sh` passa (build, `translate.py --check`, LG/Samsung, ES5 sem `fetch`, CSS); *Clássica* sem mudança
   (capturas como no 202; cotações iguais).
2. **Rede (validador, no diff):** a string `speed.cloudflare.com` aparece só em `SpeedTest.java` e na função de teste
   de `web/data.js` (mais docs); só o caminho `/__down?bytes=`; `setInstanceFollowRedirects(false)`; nenhum
   `CookieHandler`, `withCredentials`, `measId` ou identificador na URL; só os dois cabeçalhos; nada novo em
   `AndroidManifest.xml`, `network_security_config`, `tizen/config.xml`, `webos/appinfo.json`. Nenhuma chamada ao
   host fora do caminho do OK (o validador segue as chamadas de `SpeedTest.start`/função web até o handler de OK).
3. **Limites:** um teste nunca passa de 50,1 MB nem de 15 s (constantes no código; o testador confere na TCL com o
   tráfego do app em `dumpsys netstats` antes e depois, só leitura, com o OK do usuário); Voltar cancela em ≤ 500 ms
   (a linha volta ao resultado anterior).
4. **Nada fora do teste:** com a tela parada 60 s depois de um teste, PSS do `:home` (M1) ≤ +1 MB contra antes do
   teste e nenhuma thread `SpeedTest` viva (o validador confere no código que ela termina; o testador conta as threads
   do processo antes/depois por `/proc/<pid>/task`, leitura); M1 com a linha ligada e sem teste ≤ +1 MB contra o 208.
   Com *Nova*, nenhum pedido à Binance a partir da tela inicial (código; log de depuração do app).
5. **Fluidez durante o teste (TCL, `Ui.LEGACY`):** R30 feito enquanto o teste roda (o usuário aperta OK e segue com as
   setas): p90 do quadro ≤ 20 ms (≥ 50 fps), travados ≤ +1,5 ponto contra o R30 sem teste, nenhum quadro > 100 ms.
   Web M4 durante o teste (CPU 6×): fps médio ≥ 50, heap JS de volta a ≤ +10% do início 30 s depois do fim.
6. **Resolução:** na TCL, a linha mostra o que `dumpsys display` diz do modo ativo (ou a decisão da pergunta 2); com
   um app de vídeo mudando a taxa e a volta para a tela inicial, a taxa nova aparece. No preview, o rótulo do
   `screen` do computador; no Samsung a 1920, sem resolução.
7. Resultado guardado: depois de reiniciar o processo (`am kill` com Configurações à frente, como no M3), a linha
   mostra o mesmo número e "há …" coerente.
8. Docs: `CLAUDE.md` (com o OK do dono na redação), `README.md` e as duas páginas do site citam o endereço, quando e
   quanto; PT e EN na mesma mudança.
9. Regra por card do 201 contra o 208 (≤ +8 MB, ≤ +1,5 ponto, ≤ +100 ms) e abaixo dos tetos.

## Agentes

- **designer (primeiro):** linha de informações (lugar, tipografia, separadores, estados: sem resultado, testando,
  cancelado, falhou, rede tarifada), foco e TalkBack, nota "Só na Clássica", 720p. OK do dono.
- **desenvolvedor:** branch `feat/215`, Android e web, e a redação proposta dos docs.
- **validador:** `review/215.md`, com o critério 2 inteiro (rede), ES5, nenhuma alocação nova em `onDraw`/`draw*`,
  CORS conferido do computador, texto dos docs.
- **testador:** critérios 3 a 7 na TCL e M4 no preview, sempre com o OK e os toques do usuário; no ADB só leitura
  (`dumpsys display`, `dumpsys meminfo`, `dumpsys gfxinfo`, `dumpsys netstats`, `getprop`); nunca `settings put`,
  `pm`, install ou `force-stop`.

## Perguntas para o dono

1. O teto de **50 MB e 10 s** por teste está bom? (Alternativa mais econômica: 25 MB, mede bem até ~200 Mbps.)
2. Se a TCL disser que o modo ativo é 1080p num painel 4K: mostrar o modo ativo ("1080p", o que o sistema informa) ou
   o maior modo suportado ("4K")?
3. Samsung: aceita **sem resolução** quando não dá para saber, ou quer um card próprio para o privilégio `productinfo`
   (permissão nova no `config.xml`, reinstalação nas TVs com a build própria)?
4. Só download, ou também latência (`__down?bytes=0`, ping) e upload (`__up`, manda dados da casa para a Cloudflare)?
   Proposta: só download agora.
5. Nas TVs `lite` (Tizen 2.x, LG de 1 GB): não oferecer o teste (proposta) ou oferecer com pedaços de 1 MB?
6. A linha de informações tem opção para desligar em Home Settings (ligada por padrão), ou é sempre ligada na *Nova*?
7. O texto do site (`docs/`, PT e EN) entra junto com este card (merge espera seu OK, porque publica) ou só no 212?
