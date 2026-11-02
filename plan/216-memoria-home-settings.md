# 216 · Memória do `:home` ao sair de Home Settings (SettingsActivity viva e HomeView antiga no `recreate()`)

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*; `HomeActivity`
continua chamando `Watchdog.install`/`crashedTooOften` como hoje) · Status: aprovado pelo dono (2026-11-01) ·
Fase 2 do Meu TV OS · Depende de: 202 mesclado (usa o `HomeView.destroy()`/`releaseSized()` do 202) · Vem antes do 203

## Objetivo

Corrigir dois vazamentos de memória **que já existiam antes do fork**, achados no teste do card 202 na TCL
(`review/202.md`, "Teste na TV 2" e a ressalva 3 da "Revisão 3"), para que os cards 203 em diante sejam medidos sobre
uma base limpa:

1. **SettingsActivity viva depois do botão Home.** Sair de Home Settings com **Home** deixa a `SettingsActivity` viva
   em segundo plano no `:home` (PSS 60,8 → 120,9 MB, Native 21 → 82 MB, `dumpsys meminfo`: `Activities: 2`,
   `ViewRootImpl: 2`). Com **Voltar** ela é destruída e a memória volta (60,7 MB, `Activities: 1`).
2. **HomeView antiga no `recreate()`.** Qualquer linha de Home Settings que não seja *Aparência* sobe
   `Prefs.version`, e `HomeActivity.onResume` chama `recreate()`. A HomeView antiga (o `Scene` com seus bitmaps de vidro
   e o `Frost`, os `int[]` de vidro/fosco, o `RecentApps` com o fundo do `ScreenBlur`, as referências a `Backdrop`) fica
   ao lado da nova até o GC passar. O `destroy()` de hoje solta só logos, sombras, snapshots e o cache do `WatchArt`.

## Plataformas

Só Google TV / Android TV (o `:home` é Android). Web (LG/Samsung) não muda: lá Home Settings é uma folha dentro da
mesma página.

## O que o código faz hoje (lido em 2026-11-01)

- `AndroidManifest.xml`: `SettingsActivity` no `:home`, `launchMode="singleTask"`, `taskAffinity="io.freemytv.settings"`
  (a mesma do `FireHomeActivity`), `excludeFromRecents="true"`, sem `noHistory`. `HomeActivity` é `singleTask`,
  `taskAffinity=""`, `clearTaskOnLaunch`, `resumeWhilePausing`. `QuickSettingsActivity` já tem `noHistory="true"`;
  `QuickPanelActivity` já faz `finish()` em `onStop()` (`QuickPanelActivity.java:107-110`): é o precedente deste card.
- A HomeView abre Settings por `HomeApps.open` → `SETTINGS` (`HomeApps.java:644-645`), outra task. Por isso o Home
  traz a task da tela inicial para a frente e a de Settings fica parada atrás, viva.
- `SettingsActivity.onPause` já fecha a prévia do protetor (`DreamView.stop()`, que recicla as fotos 1 s depois) e
  `SettingsView.pause()` já **derruba o KeyPage** e mostra "This code has expired." (`SettingsActivity.java:421-436`): a
  página do celular (QR do TMDB e do Watchmode) só responde enquanto o código está na tela. Fechar a activity depois
  do Home não muda nada para o celular: a página já morre no Home hoje. `onDestroy` chama `stopKeyPage()` de novo.
- O que a Settings guarda: um `Scene` próprio (`SettingsActivity.java:163`; no Android 11 sem AGSL é só o gradiente,
  mais o `Frost` 48×27), o QR (`keyQr`, pequeno), `Symbols.warm` (estático e compartilhado no `:home`: **não** é
  solto por este card), paints e `StaticLayout`s. Nada disso explica 60 MB de Native sozinho: o peso provável é a
  janela (o `ViewRootImpl`/`ThreadedRenderer` e os caches do HWUI que a segunda janela segura). Por isso o passo 0
  abaixo mede antes de escolher.
- **Atenção TCL Android 11:** a TV marca a `HomeActivity` como translúcida (`HomeActivity.onResume` chama
  `setTranslucent(false)` a cada volta). Se em algum momento a home ficar translúcida, a Settings atrás pode ficar
  "visível" e **não receber `onStop`**. Uma correção que dependa só de `onStop` pode não disparar nesta TV.
- A HomeView: `Backdrop`s vêm de caches **compartilhados** e de longa vida (`Recs.images`/`posters`, singleton
  `Recs.get`; `Photos.backdrop`, estático). A HomeView antiga e a nova desenham **os mesmos objetos**. O `Scene`
  (`HomeView.java:129`) e os `int[]` são dela; `Scene` não tem `release()`. O `LOADER` (executor estático) e
  `Photos`/`ImmichPhotos` postam de volta para a view (`ownReady`, picks) e podem chegar **depois** do `destroy()`.
  O `DreamView.stop()` (`generation++` e reciclar 1 s depois, `DreamView.java:200-221`) é o modelo a seguir.

## O que muda

### Parte A: Settings não fica viva atrás da tela inicial

Proposta (o desenvolvedor confirma com o passo 0):

- **A1 (principal):** quando a `HomeActivity` volta para a frente (`onResume`, que cobre o Home vindo por
  `onNewIntent`), ela pede para fechar a `SettingsActivity` se ela existir no `:home` e não estiver em frente. Os dois
  estão no mesmo processo e no UI thread: uma referência fraca estática (ou um registro simples) em `SettingsActivity`,
  sem broadcast nem serviço. Isto cobre o caso medido (Free My TV como tela inicial) e não depende do `onStop`, que a
  TCL pode não entregar. O `FireHomeActivity` herda de `HomeActivity` e ganha o mesmo comportamento (lá a Settings
  divide a task com ele; com Voltar ela já sai).
- **A2 (opcional, o dono decide, pergunta 1):** `finish()` em `onStop()` da Settings, como o QuickPanel, para o caso
  em que a tela inicial é outra (modo *Original*: o Home vai para o launcher de fábrica e a `HomeActivity` nunca volta).
  A2 sozinho **não** basta (TCL acima) e tem mais efeitos colaterais (protetor de tela, ver "Efeitos").
- **Guardas (valem para A1 e A2): não fechar quando**
  - `isFinishing()` ou `isChangingConfigurations()`;
  - uma troca de modo está pedida ou em curso (`busy()`, `pendingAt` < 10 s, os 10 s do `ModeJob.started`): o
    benchmark abre o launcher original algumas vezes e a Settings precisa continuar viva para mostrar o progresso e a
    mensagem de "não começou" da TCL (#364, #277);
  - um pedido nosso que levanta uma janela do sistema ainda está aberto: `requestPermissions` de `BLUETOOTH_CONNECT`
    (Status icons) e de `WatchNext.PERMISSION` (Continue Watching), e a concessão por ADB pendente
    (`watchGrantPending`, o *Allow debugging?* da TV). Um diálogo de permissão costuma ser translúcido (só `onPause`),
    mas a TV pode desenhá-lo opaco: sem a guarda, a resposta voltaria para a tela inicial em vez de Settings.
    Hoje não há `onRequestPermissionsResult`; a guarda se limpa no próximo `onResume` da Settings;
  - (só A2) a própria Settings abriu outra tela por pedido do usuário (a linha *TV Settings*, `HomeApps.open(…
    tvSettings())`): Voltar das Configurações da TV tem que voltar para Home Settings. Com A1, um Home a partir das
    Configurações da TV fecha a Settings normalmente.
  - Uma guarda que impediu o fechamento não faz nada depois: a Settings fica viva como hoje, só nesse caso raro.
- Rejeitado: `android:noHistory="true"` na Settings. Fecha em qualquer saída, sem guardas (troca de modo, diálogo de
  permissão opaco, TV Settings com Voltar, protetor de tela), e não resolve o caso em que a TCL não entrega `onStop`.
- Rejeitado como solução única: soltar os bitmaps em `onStop` e refazer em `onStart`. A Settings guarda pouco bitmap
  (o peso parece ser a janela), e a TCL pode não chamar `onStop`. Se o passo 0 mostrar outra coisa, o validador revê.

### Parte B: a HomeView antiga solta o que é dela no `destroy()`

- `Scene.release()` novo: recicla só o que o `Scene` criou (`frostImage`, `glassA`, `glassB`, `softA`, `softB`,
  `softFrost` e o bitmap do `Frost`), zera os `BitmapShader`s e os `int[]` de trabalho, descarta o `auroraNode`
  (`Recording`), e deixa o `Scene` num estado "solto" em que `setGlassImage(s)`, `setFrost`, `advance` e os `draw*`
  não fazem nada (um callback tardio não pode recriar nem usar um bitmap reciclado). O `DreamView` também usa
  `Scene` (`new Scene(false)`): não muda, a menos que o validador peça.
- `HomeView.destroy()`: além do que já faz, marca a view como destruída (uma `generation`/flag como no `DreamView`),
  que todo callback do `LOADER`, de `Photos.importInbox`/`ImmichPhotos.syncIfDue` (`ownReady`), de `Recs`/`HomeData`
  e do `ScreenBlur.capture` confere antes de mexer na view; chama `scene.release()`; solta o fundo do `RecentApps`
  (`setBackdrop(null)`, reciclando só se o bitmap for do `ScreenBlur`, que o cria) e o próprio `recents`; zera
  `bgFrom`/`bgTo` **sem reciclar** (os `Backdrop` são do `Recs` e do `Photos`, compartilhados com a HomeView nova);
  zera as referências aos `int[]` grandes (`glassNight`, `frostNight`, `neutralGlassPx`, `neutralFrostPx`,
  `frostMix`, `tintGlassPx`; se forem `final`, deixam de ser ou ficam como estão e o desenvolvedor anota quanto pesam).
- A reciclagem segue as regras do 202 (`review/202.md`, "Bitmaps reciclados"): só o que a HomeView ou o `Scene`
  criaram, nunca algo de `HomeApps`, `Recs`, `Photos`, `Symbols`, `WatchArt` ou `Backdrop`; o único campo que guardava
  o bitmap fica `null` antes ou junto da reciclagem; nada no UI thread lê depois. Se uma display list gravada ainda
  puder ser desenhada (Android 8 e 9, `Recording.Pic`), reciclar com o atraso de 1 s do `DreamView`.
- **Evitar o `recreate()`:** fora deste card, a não ser que a medida da Parte B ainda passe do limite. Nesse caso, o
  desenvolvedor lista quais linhas de Home Settings precisam mesmo recriar (idioma, cidade/lugar, relógio de 24 h?) e
  quais o `HomeView.resume()` já reaplica (Clima, Cotações, sono, ocultos), e o dono decide (pergunta 2). Mexer no
  `recreate()` muda o estado ao voltar (foco, gaveta), como a ressalva 2 da Revisão 3 do 202 anotou.

### Parte 0: medir antes de mudar (testador, com o OK do dono)

Antes do código, na TCL, com o APK do `main` atual: reproduzir o estado B do 202 (Clássica, abrir Home Settings, sair
com Home, 60 s) e gravar em `review/216-medida.md`:
`dumpsys meminfo -a io.freemytv:home` (categorias: Native, Graphics/GL/EGL se a TV informar, Other mmap, Views,
Activities, ViewRootImpl); `dumpsys activity activities` (estado da `SettingsActivity`: `STOPPED` ou só `PAUSED`,
`visible=`); `logcat -b events` filtrado por `wm_on_stop_called`/`wm_on_paused_called` da Settings (sem `logcat -c`).
Isso diz se a TCL entrega `onStop` e onde estão os 60 MB. Depois, Clássica → trocar *Weather widget* 2× saindo com
Voltar → medir: dá a linha de base da Parte B.

## Arquivos

- `app/src/io/freemytv/SettingsActivity.java` (registro da instância, guardas, A2 se aprovado).
- `app/src/io/freemytv/HomeActivity.java` (pedir para fechar a Settings em `onResume`).
- `app/src/io/freemytv/HomeView.java` (`destroy()`, guardas nos callbacks).
- `app/src/io/freemytv/Scene.java` (`release()` e estado solto).
- `app/src/io/freemytv/RecentApps.java` (soltar o fundo).
- Talvez `app/src/io/freemytv/Frost.java` (reciclar seu bitmap, que hoje é `final`).
- Sem mudança em `AndroidManifest.xml` (a proposta não usa `noHistory`), em textos (nenhuma string nova, então
  `translate.py` não muda) e em `web/`.
- `review/216-medida.md` (testador) e `review/216.md` (validador).

## Riscos

- **"trying to use a recycled bitmap"** num callback tardio da HomeView antiga ou numa display list ainda na fila: é o
  risco principal da Parte B. Mitigação: flag de destruída conferida em todo callback, `Scene` solto que ignora tudo,
  `Backdrop` nunca reciclado, atraso de 1 s onde houver dúvida. Um crash aqui conta para o `Watchdog` do `:home` (3 em
  5 min voltam para a tela de fábrica): o testador confere `pidof io.freemytv:home` igual do começo ao fim.
- **Fechar Settings na hora errada** (Parte A): troca de modo em curso, diálogo de permissão, *Allow debugging?*,
  Configurações da TV com Voltar. Mitigação: as guardas acima, cada uma na lista de regressões.
- **TCL sem `onStop`** (home translúcida): coberto pelo A1, que não depende dele. O passo 0 confirma.
- **Fire TV:** Settings e `FireHomeActivity` dividem a task. O A1 roda no `onResume` do `FireHomeActivity` (herdado):
  Settings já terminou ou está atrás na mesma task; o validador confere que Voltar e o ícone do app continuam iguais.
- **Reabrir Home Settings fica um pouco mais lento:** depois de um Home, abrir Home Settings de novo cria a
  activity (antes ela estava viva). Aceitável; o testador anota o tempo (`logcat -b events`: `wm_create_activity` →
  `wm_on_resume_called` da Settings) antes e depois. O M3 da tela inicial não muda.
- **Comportamento novo visível:** voltar a Settings depois de um Home abre o menu principal, não a subtela onde a
  pessoa estava (hoje volta na subtela, e na tela da chave mostra "This code has expired."). É o que o QuickPanel já faz.

## Efeitos em cada tela e caminho (o testador confere todos)

| Caminho | Hoje | Com A1 (e A2 se aprovado) |
|---|---|---|
| Home Settings → Home | Settings viva atrás (~60 MB) | Settings destruída; reabrir começa do menu principal |
| Home Settings → Voltar | destruída | igual |
| Chave TMDB / Watchmode (QR, `KeyPage`) → Home | a página do celular já para no `pause()` | igual para o celular; ao reabrir, menu principal em vez de "This code has expired." |
| Chave digitada com o controle → Home | texto fica na subtela | texto perdido (a pessoa saiu) |
| Status icons → diálogo `BLUETOOTH_CONNECT` | volta para Settings | igual (guarda) |
| Continue Watching → `pm grant` por ADB / diálogo `READ_TV_LISTINGS` | volta para Settings | igual (guarda) |
| Now Playing widget (ADB `allow_listener`) | volta para Settings | igual (guarda, se houver diálogo) |
| Remote Buttons, Shelf, Top Buttons, Sleep Timer, Picks, My Photos/Immich, Power-on | subtelas da mesma view | iguais; só o Home as fecha |
| Linha *TV Settings* → Voltar | volta para Home Settings | igual (A1 não fecha; A2 tem guarda) |
| Linha *TV Settings* → Home | Settings viva atrás | Settings fechada |
| Troca de modo (benchmark, "Measuring…", aviso de 10 s da TCL) | Settings viva | igual (guarda `busy`) |
| Protetor de tela entra com Settings aberta, depois acorda | volta para Settings | A1: igual. A2: voltaria para a tela inicial (motivo para A2 ser opcional) |
| Prévia do protetor (`--ez screensaver true`) | fecha no `pause()` | igual |
| TalkBack (`Spoken`) e mouse (`onHoverEvent`/`onTouchEvent`) | — | sem mudança; conferir que TalkBack lê o menu principal ao reabrir |
| QuickPanelActivity (TCL) | já `finish()` em `onStop` | sem mudança |
| QuickSettingsActivity (JVC) | já `noHistory` | sem mudança |
| Recent Apps | é uma view da HomeView, não activity | Parte B solta o fundo no `destroy()` |
| Fire TV: ícone do app, engrenagem, Voltar | Settings na task do `FireHomeActivity` | igual |

## Critério de pronto (mensurável)

Protocolo M1 do card 201 (mediana de 3 leituras, 60 s parado, `dumpsys meminfo io.freemytv:home`), na TCL, com o OK
do dono e o dono apertando o controle; Free My TV como tela inicial; sem `logcat -c`.

1. **A:** Clássica, processo novo do `:home` (depois de instalar ou reiniciar a TV) → medir **A**. Abrir Home Settings
   e sair com **Home** → medir: PSS ≤ **A + 8 MB** e `Activities: 1` (`ViewRootImpl: 1`).
2. **B:** a partir daí, trocar *Weather widget* 2× (abrir Home Settings, mudar, sair com **Voltar**, a tela inicial
   recria), medindo depois de cada ciclo: os dois ≤ **A + 8 MB**, e o 2º ≤ o 1º + 2 MB (não cresce entre ciclos). Se
   a Parte B for necessária e o resultado só passar com o GC forçado, não vale.
3. **Estabilidade:** `adb logcat -s FreeMyTV AndroidRuntime` (lido sem limpar) sem `recycled bitmap` nem `FATAL`;
   `pidof io.freemytv:home` igual do começo ao fim.
4. **Regressões:** todas as linhas da tabela "Efeitos" conferidas na TCL e anotadas em `review/216-medida.md` (as que
   a TCL não tem, como Fire TV e JVC, ficam marcadas "não testado, lido no código" pelo validador). Inclui uma troca
   de modo Free My TV → *Original* → Free My TV **só se o dono quiser** (a troca é dele, na TV; não é obrigatória).
5. `tools/check.sh` passa (JDK 17, build-tools 34.0.0, android-34) e `./build.sh` termina em `Built FreeMyTV.apk`.
6. O validador confere no diff: nenhuma alocação nova em `onDraw`/`draw*`; nada reciclado que não seja da própria
   classe; nenhum `Backdrop`, logo de `HomeApps`, `Symbols` ou `WatchArt` reciclado; nenhuma mudança em `DEBLOAT`,
   `PROTECTED`, `Adb.java`, `Watchdog.java`, `HomeMode` ou no modo *Original*.

## Agentes

- **testador (primeiro):** Parte 0 na TCL, com o OK do dono, só leituras (`dumpsys`, `pidof`, `logcat -b events` e
  `logcat -s` sem `-c`), nunca `force-stop`, `pm`, `settings put`; grava `review/216-medida.md`. Depois do código,
  instala o APK com o OK do dono (`adb install -r`, a única escrita, como nos cards anteriores), mede os critérios 1 a 4.
- **desenvolvedor:** Parte A (A1, guardas; A2 só se o dono aprovar) e Parte B, na branch `feat/216`, a partir do
  `main` com o 202. Anota no commit quanto cada coisa solta.
- **validador:** `review/216.md`: critérios 5 e 6, a lista de guardas contra a tabela "Efeitos", a regra de reciclagem
  do 202, e compara a medida com a do 202.
- designer: não participa (nada visual muda).

## Perguntas para o dono

1. **A2 (fechar Settings em `onStop`)**: só faz diferença com a TV em modo *Original* e muda uma coisa: com Settings
   aberta, se o protetor de tela entrar, ao acordar a TV vai para a tela inicial em vez de Settings. Fazer só o A1
   (recomendado) ou os dois?
2. Se a Parte B (soltar no `destroy()`) não bastar para o critério 2, abrir um card para trocar o `recreate()` por
   atualização no lugar nas linhas que não mudam idioma/cidade? Ou aceitar e seguir?
3. Ok que, depois de um Home, Home Settings reabra no menu principal (como o QuickPanel), e não na subtela?

## Decisões do dono (2026-11-01)

1. **Só A1** (a HomeActivity fecha a SettingsActivity que ficou atrás); sem A2: com o protetor de tela, ao acordar a
   TV volta para Home Settings.
2. Depois de um Home, Home Settings reabre no menu principal (aceito).
3. Se a Parte B não bastar para o critério do *Weather widget*: abrir um card para trocar o `recreate()` por
   atualização no lugar (como a Aparência no 202).
