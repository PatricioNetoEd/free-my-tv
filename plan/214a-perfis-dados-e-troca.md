# 214a · Perfis: dados, migração, troca no lugar e Home Settings → Perfis

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java`, `HomeMode.java`, `ModeJob.java` nem o modo
*Original*; nenhuma permissão nova, nenhuma chamada de rede nova, nada pelo ADB da TV) · Status: aprovado pelo dono (2026-11-02) · Fase 2 do
Meu TV OS · Parte do card guarda-chuva `plan/214-perfis-do-meu-tv-os.md` (aprovado em 2026-11-01; vale tudo o que está
em "Decisões do dono") · Depende de: **202** e **216** mesclados, de preferência também o **203**. Vem antes do **214b**
e do **214c**.

## Objetivo

Criar os perfis locais da casa, sem nada visual novo na tela inicial. Este card faz quatro coisas:

1. **Dados.** Cada perfil tem um id, um nome, uma cor, a aba inicial da faixa, a marca *infantil*, a fileira de
   favoritos e os itens escondidos de *Continuar assistindo*.
2. **Migração sem perda.** Quem atualiza ganha um perfil **Principal** com a fileira de hoje. Nada é copiado e nada
   é gravado só por abrir a versão nova.
3. **Troca no lugar em ≤ 300 ms.** A troca não chama `recreate()`, não sobe `Prefs.version` e não busca nada na rede.
   O modelo é a troca de *Aparência* do 202.
4. **Home Settings → Perfis.** Trocar, criar, renomear, mudar a cor, escolher a aba inicial, marcar como infantil e
   apagar com confirmação, no Android e no web.

O ícone na barra, a folha "Quem está assistindo?" e a pergunta ao ligar ficam para o **214b**. O filtro das picks do
perfil infantil fica para o **214c**: aqui a marca é só gravada e mostrada.

## Plataformas

- Google TV / Android TV (`:home`). Só o `:home` lê o perfil ativo. O processo principal (`ModeJob`,
  `ScreensaverAlone`), o `:keys` e o `:sleep` não leem e não mudam.
- LG e Samsung (`web/`), com o mesmo modelo de dados em `localStorage`.

## O que é por perfil (decisões 1 e 2 do 214)

| Por perfil | Chave do Principal (a de hoje) | Chave dos outros |
|---|---|---|
| Fileira e ordem | Android `settings`/`shelf`; web `fmtv.prefs` → `shelf` | `shelf.<id>` |
| Itens escondidos de *Continuar assistindo* (só Android) | `watchHidden` | `watchHidden.<id>` |
| Nome, cor, aba inicial, infantil | (tudo com valor padrão, sem chave) | `profile.<id>.name`, `.color`, `.tab`, `.kids` |

Todo o resto continua **por TV**: idioma, Trakt, aparência, serviços das picks, número de picks, chaves etc. (tabela
do 214).

## Modelo de dados (proposta; o desenvolvedor pode mudar os nomes, não as regras)

- **Android:** tudo em `settings`, ao lado das chaves de hoje.
  - `profiles`: os ids em ordem, por exemplo `"0,3,4"`. Se não existir, a lista é `[0]`.
  - `profile`: o id ativo. Se não existir, é `0`.
  - `profileNext`: o contador de ids. Um id nunca é reaproveitado, para um perfil novo não herdar chave órfã.
  - O código fica numa classe nova, `Profiles.java`, que faz: lista, ativo, criar, renomear, cor, aba, infantil,
    apagar, inicial e o sufixo da chave (`""` para o 0, `".<id>"` para os outros). `Prefs.shelf()`,
    `Prefs.setShelf()`, `Prefs.watchHidden()` e `Prefs.setWatchHidden()` passam a usar a chave do perfil ativo.
- **Web:** dentro de `fmtv.prefs`, com as mesmas chaves (`profiles`, `profile`, `profileNext`, `shelf.<id>`, `profile.<id>.*`).
  `Prefs` em `web/data.js` ganha as mesmas funções.
- **Principal = id 0.**
  - O nome fica vazio no disco e aparece como `Ui.tr("profile|Main")` ("Principal"), que muda com o idioma, até alguém
    renomear.
  - A cor padrão é a 1 (azul `#3563E0`) e a aba padrão é Explorar.
  - A versão nova só grava o Principal quando alguém cria o 2º perfil ou muda o Principal. Por isso, instalar uma
    versão antiga por cima continua lendo `shelf`, a fileira do Principal.
- **Infantil:** `kids` = `""` (desligado) ou `"10"` (ligado; é o padrão do 214c). O 214c pode acrescentar `"L"` sem
  migrar nada. Neste card a linha é só liga/desliga e não muda nenhuma busca.
- **Nome:**
  - até 12 caracteres (`tokens-v2.json → profile.name_max_chars`), cortados por code point;
  - precisa ter pelo menos uma letra ou um dígito, senão o OK não aceita;
  - nomes repetidos são permitidos.
- **Inicial:** a primeira letra ou dígito do nome, por code point, em maiúscula com `Ui.locale()`. Inicial de CJK e
  Devanágari usa a fonte do sistema, como o resto do texto nessas línguas.
- **Cor:** índice de 0 a 7 na paleta de `tokens-v2.json → profile.palette` (com o ouro no lugar do vermelho). Um perfil
  novo recebe a primeira cor livre, nessa ordem. Ao editar, as 8 cores podem ser escolhidas, mesmo que repitam outra.
- **Limite:** 6 perfis. No 7º, *Adicionar perfil* fica *Unavailable* com "Até 6 perfis" (padrão de
  `SettingsActivity.need`).

## Regras de cada ação

- **Criar.** O perfil novo copia a fileira **resolvida** do perfil atual: `HomeApps.shelfPackages`, que é a lista
  embutida quando a fileira é `null`. A cópia é gravada em `shelf.<id>` (decisão 3 do 214). Também copia a aba
  inicial; o perfil novo **não** começa infantil. *Continuar assistindo* começa sem itens escondidos. Depois de criar,
  o foco vai para a tela do perfil novo, e o perfil ativo não muda (proposta).
- **Trocar** (*Usar este perfil*, e no 214b a folha).
  - A gravação é silenciosa: não sobe `Prefs.version` (como `putQuietly`). Um contador próprio, `Profiles.stamp`
    (como o `Prefs.lookChanges` do 202), avisa a `HomeView`.
  - Se a troca for feita em Home Settings, a tela inicial aplica no `resume()`, no lugar: o `HomeActivity.onResume` não
    pode ver isso como mudança de ajuste e chamar `recreate()`.
  - A aplicação na `HomeView` faz, nesta ordem:
    1. cancela mover, menu e segurar (`cancelReorder`, `closeMenu`);
    2. sobe uma **geração de perfil**;
    3. lê a fileira nova no `LOADER` (`HomeApps.shelf(c, false)`, com os logos já em `cacheDir/logos`) e posta o
       `setShelf`, que solta só os logos que a própria view fez (`crispMade`/`crispLogos`, `releaseLogos`);
    4. refaz `others` (*All Apps* tira os apps da fileira) e o *Continuar assistindo* (os itens escondidos são outros);
    5. seleciona a aba inicial do perfil, põe o foco no 1º app e mostra o aviso `Profile: {name}` ("Perfil: {name}"),
       que o TalkBack lê (`showToast` já anuncia).
  - **Uma resposta do `LOADER` com geração velha não toca a fileira.** Isso vale para o `reload()` que já estava a
    caminho com a lista do perfil anterior.
  - Um mover pendente (`pendingOrderSaves`) grava na chave do perfil em que começou, guardada no início, nunca na do
    perfil ativo no momento de gravar.
  - **Nunca** reciclar os bitmaps de `HomeApps.LOGOS`/`TILES`: são compartilhados com *All Apps* (lição do 202/216).
    Esses mapas guardam um bitmap por app, não por perfil, então a união fica limitada aos apps instalados.
- **Aba inicial.** Cada perfil tem a sua: Explorar, Filmes ou Séries, nas duas aparências. A troca de perfil e o botão
  Home (`HomeView.reset`, hoje `selectTab(0)`) vão para a aba do perfil. Mudar de aba na tela **não** muda a aba
  inicial (proposta, pergunta 1).
- **Renomear, cor, aba, infantil.** Também são gravações silenciosas que sobem `Profiles.stamp`. Valem ao voltar para a
  tela inicial, sem `recreate()`.
- **Apagar.**
  - Só em *Perfis → <perfil> → Apagar perfil*, com a confirmação "Apagar o perfil {name}? A fileira dele some; os apps
    continuam instalados." (o texto final é do designer).
  - O Principal não tem essa linha.
  - Se o perfil apagado for o ativo, a troca para o Principal vem antes de apagar.
  - Apagar remove `shelf.<id>`, `watchHidden.<id>` e `profile.<id>.*`, e tira o id de `profiles`. Nenhum app é
    desinstalado, desligado ou tem os dados apagados.
- **Shelf e Top Buttons em Home Settings.**
  - *Shelf* edita a fileira do perfil ativo, e o título mostra de quem é (por exemplo "Fileira · Ana"; o desenho é do
    designer).
  - Continua gravando com `Prefs.setShelf`, que sobe `version` como hoje (fora do escopo; o 216 já trata a memória
    desse caminho).
  - *Show hidden items (n)*, em *Continue Watching apps*, mostra os itens do perfil ativo.
- **LG `shelf_apps`** (decisão 8 do 214). O `pickShelf` de `web/home.js` zera **só** a chave `shelf` do Principal quando
  a build traz outro `shelf_apps`, nunca `shelf.<id>`. Hoje ele faz `Prefs.set('shelf', null)` e depois lê
  `Prefs.shelf()`, que passa a ser a fileira do perfil ativo: o desenvolvedor separa as duas coisas.

## Home Settings → Perfis (Android e web; o desenho é do designer)

- **Linha nova *Perfis*, a primeira de Home Settings** (seção 15 do design): um disco de 40 px na cor do perfil ativo,
  com a inicial, e o nome à direita.
  - No Android, as linhas 0 a 2 (idioma, temperatura, tema) ainda usam números soltos. Elas passam a usar constantes,
    como o 202 fez com as outras, e todos os usos de índice (`v[...]`, `case`, `need()`, mouse, TalkBack,
    `showSettingsRow`, `COIN_ROWS`, `keyRow()`) são conferidos.
  - No web, as linhas já são objetos.
- **Tela *Perfis*:**
  - uma linha por perfil (disco e nome, e "ativo" no perfil em uso);
  - por último, *Adicionar perfil*. OK pede o nome (`AlertDialog` com `EditText`, como `askCity`; no web, o
    `textField`) e cria.
- **Tela de um perfil:**
  - *Usar este perfil* (fora do perfil ativo);
  - *Nome* (OK pede o nome);
  - *Cor* (←/→ percorre as 8, mostrando o disco e o nome da cor; a cor nunca é a única pista);
  - *Aba inicial* (←/→: Explorar, Filmes, Séries);
  - *Perfil infantil* (liga/desliga; só a marca, o filtro é do 214c);
  - *Apagar perfil* (fora do Principal).
- **TalkBack:**
  - linha do perfil: "{name}" e "{name}, active profile" ("{name}, perfil ativo");
  - linha da cor: o nome da cor;
  - *Adicionar perfil* sem vaga: o motivo, como as outras linhas *Unavailable*.
- **Mouse:** igual às outras linhas de Settings (clique age, hover move o foco).
- **720p:** tudo × 2/3 (disco de 27 px).
- Na **Clássica** e na **Nova**, a troca vale igual: muda a fileira e a aba das duas.

## Textos (pt e en à mão; as outras 24 línguas antes do merge)

Chaves que já estão na seção 13 do design: `Profiles`, `profile|Main`, `Add profile`, `Profile: {name}`,
`{name}, active profile`, `Kids profile`.

Chaves novas (o texto final é do designer):

| Chave | Português |
|---|---|
| `Use this profile` | Usar este perfil |
| `profile\|Name` | Nome |
| `Profile name` | Nome do perfil (dica do campo) |
| `Color` | Cor |
| `Starting tab` | Aba inicial |
| `Delete profile` | Apagar perfil |
| `Delete the profile {name}? Its row goes away; the apps stay installed.` | Apagar o perfil {name}? A fileira dele some; os apps continuam instalados. |
| `Delete` | Apagar |
| `Up to 6 profiles` | Até 6 perfis |
| `Shelf · {name}` | Fileira · {name} |
| `color\|Blue`, `color\|Pink`, `color\|Green`, `color\|Orange`, `color\|Purple`, `color\|Teal`, `color\|Gold`, `color\|Slate` | Azul, Rosa, Verde, Laranja, Roxo, Verde-água, Ouro, Ardósia |

Regras:

- O texto montado em tempo de execução usa padrão (`Ui.trf`), nunca palavras concatenadas.
- **Todas as 26 línguas antes do merge:** `translate.py --check` (dentro do `tools/check.sh`) exige isso. Foi assim no
  202, e isto substitui o "caem no inglês até o 212" do 214.
- pt, es, de, ru, th e tr são traduções à mão (`CLAUDE.md`): o desenvolvedor escreve, e o dono aprova como no 202.
- As outras línguas podem vir de `--fill`, e o validador confere colisões: a mesma palavra em duas linhas seguidas,
  como a de "Appearance"/"Theme" no `vi.json` do 202.

## Arquivos

- **Android:**
  - `Profiles.java` (novo: dados, regras e o diálogo do nome; o 214b reaproveita o diálogo);
  - `Prefs.java` (shelf e watchHidden pela chave do perfil ativo);
  - `HomeView.java` (aplicar no lugar, geração de perfil, aba inicial no `reset`, aviso);
  - `HomeActivity.java` (só se for preciso para não confundir `Profiles.stamp` com `Prefs.version`);
  - `HomeApps.java` (só se `shelfPackages`/`others` precisarem receber a chave; sem mudar `SHELF`, `HIDDEN` nem
    `LIVE_TV_APPS`);
  - `SettingsActivity.java` (linha *Perfis*, as duas telas, as constantes das linhas 0 a 2, o título de *Shelf*);
  - `app/assets/i18n/*.json` (26).
- **Web:** `web/data.js` (`Prefs`: perfis, chaves por perfil), `web/home.js` (`pickShelf`, `reset`/`selectTab`,
  linhas e telas de Home Settings, troca no lugar), `web/home.css` (disco de 40 px).
- **Design:** `design/tokens-v2.json → profile` e a seção 15 de `design/200-direcao-visual-tvos.md`, só pelo designer
  (telas de Home Settings e nomes das cores).
- **Não mudam:** `AndroidManifest.xml`, `network_security_config`, `HomeMode.java`, `ModeJob.java`, `Adb.java`,
  `Watchdog.java`, `RemoteKeys.java`, `Recs.java`, `Trakt.java`, `DreamView.java`, `ScreensaverAlone`, `build.sh`.

## Riscos

- **Corrida na troca.** Um `reload()` no `LOADER`, um mover pendente ou um `setShelf` de pacote instalado podem chegar
  depois da troca com a lista do perfil anterior e gravá-la por cima. A geração de perfil resolve isso, e a chave de
  gravação é guardada no início do mover. O validador segue os três caminhos.
- **`recreate()` sem querer.** Qualquer `put()` em `Prefs` sobe `version`, e o `HomeActivity` então recria a tela
  (≈ 1 s, refaz clima e cotações). Todas as gravações de perfil têm de ser silenciosas, e a prova é o critério 4.
- **Índices de Home Settings.** A linha nova no topo desloca todas as outras. O 202 já mostrou que um índice esquecido
  troca a ação de uma linha em silêncio.
- **Memória.** Logos de dois perfis presos na view (`crispMade`). Os mapas estáticos de `HomeApps` crescem uma vez
  (união dos apps) e não por troca: por isso a medida desconta a 1ª ida e volta.
- **Volta para versão antiga.** Uma versão antiga lê só `shelf` (o Principal) e ignora o resto. Nada quebra, e os
  outros perfis voltam quando a versão nova for instalada de novo.
- **Marca infantil sem efeito até o 214c.** Não fazer release entre o merge do 214a e o do 214c (pergunta 2).
- **Web.** `localStorage` cheio ou indisponível: o `save()` já ignora erro. A troca usa os mesmos nós do DOM (sem
  recriar a fileira inteira se não for preciso), para o número de nós não crescer.

## Critério de pronto (mensurável)

1. **`tools/check.sh` passa** com JDK 17, build-tools 34.0.0 e android-34: build, `translate.py --check` com as 26
   línguas completas, LG, Samsung, ES5 e CSS.
2. **Migração** (TCL, com uma fileira editada antes de atualizar):
   - depois de instalar por cima, a fileira e a ordem são as mesmas (captura antes e depois);
   - *Perfis* lista só o Principal ("Principal" em pt, "Main" em en);
   - `run-as` não é usado. O validador confere no código que nenhuma chave é gravada só por abrir a versão nova.
3. **Perfil novo.** "Ana" criado a partir do Principal tem a mesma fileira, na mesma ordem, e a 2ª cor (rosa). Depois
   de mudar a fileira da Ana, a do Principal não muda.
4. **Troca no lugar.** Em 10 trocas (Principal ↔ Ana, com 8 apps diferentes em cada fileira):
   - `pidof io.freemytv:home` igual do começo ao fim;
   - nenhuma `wm_create_activity` nova de `HomeActivity` em `logcat -b events -d`;
   - nenhuma busca de clima ou cotações no log;
   - 0 `recycled bitmap`, `FATAL` ou ANR em `logcat -s FreeMyTV AndroidRuntime`.
5. **≤ 300 ms.** Mediana das 10 trocas, do pedido de troca (início da aplicação na `HomeView`) até o 1º quadro com a
   fileira nova. O log `profile: applied in N ms` dá o número; logs com nome do perfil não entram em produção. Medido
   na TCL, `Ui.LEGACY`, com os logos já em `cacheDir/logos` (uma ida e volta antes, que não conta).
6. **Memória** (protocolo M do 201, corrigido pelo `review/201-medida.md` e pelo 216):
   - medir sempre pelo **pid** do `:home`: `dumpsys meminfo <pid>`, TOTAL PSS e Native Heap;
   - cada medida é a mediana de 3 leituras, depois de 60 s parado na tela inicial;
   - se a 1ª leitura vier fora por GC atrasado (como no 216), ler de novo até 100 s e anotar;
   - `Activities: 1` em todas as medidas;
   - **A0** antes de qualquer troca; **A** depois de uma ida e volta; **B** depois de mais 10 trocas, terminando no
     Principal;
   - **B − A ≤ +2 MB**; **B − A0 ≤ +8 MB** (regra por card do 201).
7. **Apagar:**
   - apagar a Ana estando nela volta ao Principal (fileira dele na tela);
   - as chaves da Ana somem (o validador confere no código);
   - nenhum `pm` é chamado (o validador procura `pm `, `Adb` e `ModeJob` no diff: nada);
   - o 7º perfil fica *Unavailable* com "Até 6 perfis".
8. **Home Settings:**
   - todas as linhas antigas fazem o que faziam (o testador percorre todas, uma por uma, e muda e desfaz cada uma);
   - TalkBack lê "{name}, perfil ativo" e o nome da cor;
   - o mouse funciona;
   - a 720p (preview e TV de 720p, se houver) nada passa da área segura.
9. **Clássica e Nova:** a troca muda a fileira e a aba nas duas; sem nenhum perfil novo, a tela fica idêntica à de
   antes (capturas).
10. **Web**, no preview (`python3 webos/build.py --preview`, Chrome a 1920×1080, CPU 6×):
    - troca ≤ 300 ms, do `keydown` ao 1º quadro com a fileira nova (Performance), em normal e em `lite`;
    - depois de 10 trocas, heap JS ≤ +2 MB (snapshot com GC) e o mesmo número de nós do DOM ao voltar ao mesmo perfil;
    - uma build LG com outro `shelf_apps` muda só a fileira do Principal;
    - M4 dentro das metas.
11. **Fora do diff:** `DEBLOAT`, `PROTECTED`, `HomeMode.java`, `ModeJob.java`, `Adb.java`, `Watchdog.java`, o
    *Original*, `AndroidManifest.xml`, URLs novas e permissões. Nenhuma alocação nova em `onDraw`/`draw*`.

## Agentes

- **Designer (primeiro):**
  - desenha as telas *Perfis* e *Perfil* de Home Settings (linhas, disco de 40 px, confirmação de apagar, *Unavailable*
    no 7º);
  - define os nomes das 8 cores e o título "Fileira · {name}";
  - resolve com o dono a pergunta 3 (a seção 15 diz que a linha *Perfis* da Clássica abre a folha);
  - atualiza `tokens-v2.json → profile` e a seção 15, com o OK do dono.
- **Desenvolvedor:**
  - branch `feat/214a`;
  - um commit para o Android, um para o web e um para as traduções, como no 202;
  - relata desvios.
- **Validador:** `review/214a.md` com:
  - critérios 1, 2 (código), 4 (caminho da troca sem `Prefs.version`), 7 (código) e 11;
  - as corridas do `LOADER` e do mover;
  - os índices de Home Settings;
  - a reciclagem só da própria view;
  - ES5;
  - as traduções (colisões e as línguas feitas à mão).
- **Testador:**
  - critérios 2 a 10 na TCL e no preview, sempre com o OK e os toques do usuário;
  - o APK é instalado como nos cards anteriores, com o OK do dono;
  - no ADB, só leitura (`getprop`, `dumpsys`, `pm list`, `pidof`, `logcat -d`);
  - nenhum `pm disable`, `settings put`, `force-stop` ou `logcat -c`;
  - grava os números em `review/214a-medida.md`.

## Perguntas para o dono

1. **Aba inicial:** é uma linha fixa na tela do perfil (proposta: o Home sempre volta para ela), ou o perfil guarda a
   **última aba usada** (sem linha nova, mas o Home deixa de voltar sempre para a mesma aba)?
2. **Marca infantil antes do 214c:** a linha *Perfil infantil* aparece já no 214a (sem efeito até o 214c; sem release
   no meio), ou fica escondida até o 214c?
3. **Home Settings → Perfis na Clássica:** a seção 15 diz que a linha abre a folha "Quem está assistindo?". A proposta
   é que ela abra a **lista** (trocar e editar ali, no Android e no web), e a folha fique no ícone e no início (214b).
   Desenhar a folha também dentro de Home Settings duplicaria código e memória (outra activity). Ok?
4. **Depois de criar:** o perfil novo fica só criado (o foco vai para a tela dele), ou já passa a ser o ativo?

## Respostas do dono (2026-11-02)

1. Aba inicial: **fixa**, escolhida na tela do perfil; o Home sempre volta para ela.
2. Perfil recém-criado **já vira o ativo** (pela tela do perfil em Home Settings e pelo "+ Adicionar" da folha).
3. "Perfil infantil" **escondido até o 214c** (o 214a não mostra a linha; o dado pode existir, sem UI).
4. Home Settings → Perfis abre a **lista de perfis** (trocar, criar, renomear, cor, aba, apagar); a folha "Quem está
   assistindo?" fica só no ícone e no início.
5. "+ Adicionar" na folha pede **só o nome ali mesmo**, por cima da tela inicial; o perfil criado já vira o ativo.
6. At power-on = Live TV: OK num perfil troca e abre a TV ao vivo; Voltar fica com o último perfil na tela inicial;
   10 s sem tecla seguem com o último e abrem a TV ao vivo.
7. LG/Samsung (Clássica): ícone como opção "Botão no topo" em Home Settings → Perfis, desligada por padrão.
