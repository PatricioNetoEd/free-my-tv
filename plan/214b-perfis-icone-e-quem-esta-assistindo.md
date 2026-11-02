# 214b · Perfis: ícone na barra, folha "Quem está assistindo?" e pergunta ao ligar

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java`, `HomeMode.java`, `ModeJob.java` nem o modo
*Original*; só **lê** `HomeMode.noteHomeShown` e `HomeMode.state`, que o `HomeActivity` já chama hoje; nenhuma
permissão, rede ou ADB novo) · Status: proposto · Fase 2 do Meu TV OS · Parte do card guarda-chuva
`plan/214-perfis-do-meu-tv-os.md` (decisões de 2026-11-01 e as do protótipo) · Depende de: **214a** (dados e troca no
lugar), **208** (barra superior da Nova), **210** (folhas em vidro grosso) e, pela ordem da fase, **215**. Vem antes
do **214c** (que põe o selo infantil no ícone e na folha) e do **211** (auditoria de acessibilidade, mouse e 720p).

## Objetivo

Dar ao perfil um lugar na tela, conforme a seção 15 de `design/200-direcao-visual-tvos.md` e `tokens-v2.json →
profile`:

1. **Ícone de perfil** (disco com a inicial na cor do perfil):
   - na **Nova**, é o último botão redondo, à esquerda do relógio, e está sempre lá;
   - na **Clássica**, é uma opção em *Top Buttons*, desligada por padrão (decisão 5 do 214).
   - Aparece mesmo com só o Principal, para *Adicionar* ficar a dois toques.
2. **Folha "Quem está assistindo?"** em vidro grosso, com os perfis e *Adicionar* numa linha. OK troca no lugar,
   usando a troca do 214a, em ≤ 300 ms.
3. **Pergunta depois de um início completo** (decisão 6 do 214 e a decisão sobre o Principal):
   - só com **2 ou mais perfis**, só no modo Free My TV;
   - nunca ao voltar do standby, sem tempo-limite;
   - Voltar fica com o último perfil;
   - exceção para *At power-on = Live TV*: 10 s e segue com o último perfil;
   - no web, ao abrir a frio.
4. TalkBack, mouse/Magic Remote e 720p prontos para a auditoria do 211.

## Plataformas

Google TV / Android TV (`:home`) e LG/Samsung (`web/`).

## O que muda

### Ícone (Android `HomeView`; web `home.js`/`home.css`)

- **Nova:**
  - é um item fixo no fim da linha de foco da barra superior do 208, depois de *Configurações*;
  - o relógio continua sem foco;
  - o item não entra em `Prefs.topButtons` e não conta em `HomeApps.MAX_TOP`;
  - medidas: 64 px, inicial branca 30/600, contorno interno de 1 px branco 22%; em foco, superfície branca, inicial na
    cor do perfil, escala 1,12 e o nome do perfil como dica, centralizado embaixo;
  - a 720p: 43 px, inicial de 20 e nome de 16.
- **Clássica:**
  - nova chave `HomeApps.TOP_PROFILE` em `TOP_ALL`, **fora** de `TOP_DEFAULT` (desligada por padrão);
  - com ela ligada, o botão tem o tamanho e o foco dos botões da Clássica (68 px), com o disco na cor do perfil, a
    inicial e a dica "Perfil: {name}";
  - na Nova, a opção não duplica o ícone fixo (`HomeApps.topButtons` a ignora na Nova). Na tela *Top Buttons*, a linha
    diz que na Nova o botão fica sempre (texto do designer);
  - `MAX_TOP` sobe de 5 para 6: o desenvolvedor confere que 6 botões e as dicas cabem na barra da Clássica, a 1080p e
    a 720p.
- **Web:** não existe *Top Buttons* no web. Na Nova, o ícone é fixo como no Android. Na Clássica, ver a pergunta 1.
- **Desenho sem alocação:**
  - a inicial é um `String` feito quando o perfil, o nome ou o idioma muda (`Profiles.stamp`, `Ui.generation`), nunca
    em `onDraw`;
  - o disco é um `drawCircle` com `Paint` já criado;
  - no `Ui.LEGACY`, a sombra de foco vem do `Shadows`, como nos outros botões.
- **OK ou clique:** abre a folha. **TalkBack:** "Perfil: {name}" (o 214c acrescenta ", infantil").

### Folha "Quem está assistindo?" (Android `HomeView`; web `home.js`/`home.css`)

- **Desenho:**
  - vidro grosso em tela cheia, como o *All Apps* (o mesmo vidro e os mesmos fallbacks do 210, sem bitmap novo);
  - título 48/600 em y=300;
  - círculos de 200 px com vão de 64 e inicial 96/600; nome 28/500 em branco 66% (branco em foco), até 300 px e com
    reticências;
  - perfil ativo: selo de 52 px com um visto e o nome em peso 600;
  - *Adicionar* aparece só com menos de 6 perfis;
  - foco: escala 1,10, sombra e um anel branco de 6 px afastado 6 px do disco (é uma borda, então fica no `lite`);
  - a 720p: círculos de 133, vão de 43, inicial de 64, nome de 19, título de 32, anel de 4 e selo de 35.
- **Espaço para o 214c:** o canto **superior** direito do círculo fica livre para o selo infantil, e o código já tem
  o lugar dele, vazio.
- **Teclas:**
  - ←/→ passa ao vizinho, sem dar a volta; ↑/↓ não fazem nada;
  - OK num outro perfil: a folha fecha, a troca do 214a acontece, o foco vai ao 1º app e aparece o aviso
    "Perfil: {name}";
  - OK no perfil ativo: só fecha;
  - Voltar: fecha sem trocar e devolve o foco ao ícone (ou ao 1º app, se a folha veio da pergunta ao ligar);
  - foco inicial no perfil ativo;
  - a fileira nova aparece de uma vez, embaixo da folha que fecha (`motion` do token).
- **OK em *Adicionar*** (proposta, pergunta 3):
  - o diálogo de nome do 214a (`Profiles`, o mesmo de Home Settings) abre por cima da tela inicial;
  - o perfil nasce com a cópia da fileira atual e a primeira cor livre;
  - a folha continua aberta, com o foco no perfil novo;
  - a cor e o resto se mudam em Home Settings → Perfis;
  - o diálogo fecha no `onPause` (nenhuma janela fica presa no `:home`).
- **Teclas que não são da folha:**
  - `RemoteKeys` continua antes da folha: um botão de app do controle abre o app como hoje;
  - a folha aberta pelo ícone fecha no `pause()`, como os menus;
  - a folha da pergunta ao ligar fica aberta até alguém responder (abaixo).
- **Memória:** nenhum bitmap próprio. Se o `Shadows` fizer uma máscara para o círculo em foco, ela é solta como as
  outras do `Shadows`. Fechar e abrir não cria nada novo. Lição do 216: soltar só o que a própria view fez.

### Pergunta depois de um início completo (Android `HomeActivity`/`HomeView`)

- **Quando abrir.** No `onCreate`, o resultado da **única** chamada `HomeMode.noteHomeShown(this)` vai para uma
  variável. É a mesma chamada de hoje, que só diz "sim" uma vez por boot: ela não é repetida, e o
  `if (... && "live".equals(...))` de hoje passa a usar essa variável. A folha abre se valerem todas as condições:
  - a variável diz sim;
  - `HomeMode.state` está em modo `FREE` e sem `homeReverted`;
  - `Profiles.count() ≥ 2`;
  - `Watchdog.crashedTooOften` não desviou o `onCreate`.
- **Nunca no standby.** Acordar não recria a activity, e mesmo se recriasse, `noteHomeShown` diria não.
- ***At power-on = tv*** (padrão) **e *= home*:**
  - a folha nasce aberta no `onCreate` e fica até a resposta, sem tempo-limite;
  - se outro app estiver na frente, a pessoa a vê quando a tela inicial vier à frente pela primeira vez nesse boot
    (pelo Home, ou pelo job `POWER_ON` no modo *home*, que não muda);
  - o `HomeActivity.onNewIntent` → `HomeView.reset(true)` (o Home) **não fecha** esta folha. O `HomeView.resume()`
    também não, ao contrário do *All Apps*;
  - o TalkBack anuncia "Quem está assistindo?" quando a janela ganha o foco, não no `onCreate` (que pode acontecer com
    outro app na frente).
- ***At power-on = Live TV*** (e dentro dos 240 s do código de hoje):
  - a folha abre, e o `powerOnLive` continua marcado para 10 s;
  - se nenhuma tecla vier em 10 s, a folha fecha com o último perfil e a TV ao vivo abre como hoje;
  - qualquer tecla na folha para a contagem, porque a pessoa está ali (hoje o `keyPressed` já cancela);
  - OK num perfil troca e **abre a TV ao vivo**, como diz o 214 ("escolher… e então a TV ao vivo abre");
  - Voltar fica com o último perfil **e fica na tela inicial**, como "uma tecla veio antes" hoje.
  - Esses dois últimos pontos são propostas (pergunta 2).
- **Recriação antes da resposta:** um `recreate()` por mudança de Home Settings perde a pergunta (`noteHomeShown` já
  disse sim uma vez). É raro e aceitável: só fica o último perfil.
- **Web:**
  - pergunta ao **carregar a página** (início a frio), com 2+ perfis;
  - o `reset()` de "app aberto de novo" não pergunta;
  - sem *At power-on* no web.

### Acessibilidade, mouse e 720p

- **TalkBack:**
  - ao abrir: "Who's watching?" ("Quem está assistindo?");
  - cada círculo: "{name}" e "{name}, active profile";
  - *Adicionar*: "Add profile";
  - depois da troca: "Profile: {name}".
  - Enquanto a folha está aberta, o TalkBack lê os nós da folha, e não os da tela inicial (como `RECENT_CARDS` no
    `RecentApps`). Fechada, os nós voltam a ser os da tela inicial na hora, mesmo durante o fade.
- **Mouse e Magic Remote** (`onTouchEvent`, `onHoverEvent`, `onGenericMotionEvent`; web: os mesmos eventos de hoje):
  - no topo, o hover leva o foco ao ícone e o clique abre a folha;
  - na folha, o hover move o foco só ao entrar em outro círculo;
  - o clique escolhe;
  - clicar fora dos círculos não faz nada;
  - a roda move como ←/→.
- **720p:** todas as medidas acima × 2/3, desenhadas no tamanho da UI (nunca 1080p reduzido).
- **`lite` (web) e LEGACY:** sem sombra e sem transição; o anel e o selo ficam.

## Textos (pt e en à mão; as outras 24 línguas antes do merge)

- Da seção 13 do design: `Who's watching?`, `profile|Add`, `Add profile`, `{name}, active profile`,
  `Profile: {name}` (este já vem do 214a).
- Nova: `Profile` ("Perfil"), o nome da opção em *Top Buttons*.
- Nova: o aviso da linha *Perfil* na Nova, por exemplo `Always on top in Nova` ("Sempre no topo na Nova"; o texto final
  é do designer).
- Todas as 26 línguas antes do merge, porque `translate.py --check` exige (como no 202).
- pt, es, de, ru, th e tr são traduções à mão, aprovadas pelo dono. As outras línguas podem vir de `--fill`, com o
  validador conferindo colisões.

## Arquivos

- **Android:**
  - `HomeView.java` (ícone na barra da Nova e nos botões da Clássica, a folha, foco, teclas, mouse, nós de
    acessibilidade, não fechar a pergunta no `reset`/`resume`);
  - `HomeActivity.java` (guardar o resultado do `noteHomeShown`, abrir a pergunta, a regra de 10 s do *Live TV*,
    anunciar quando ganhar o foco, fechar o diálogo no `onPause`);
  - `HomeApps.java` (`TOP_PROFILE`, `TOP_ALL`, `MAX_TOP`, `topButtons` sem o perfil na Nova);
  - `SettingsActivity.java` (linha *Perfil* em *Top Buttons* e o aviso da Nova);
  - `Profiles.java` (do 214a: só reaproveitado; mudanças pequenas se faltar algo);
  - `app/assets/i18n/*.json` (26).
- **Web:** `web/home.js` (ícone, folha, pergunta a frio, teclas, mouse, `aria`), `web/home.css` (disco, folha,
  720p, `lite`), `web/data.js` (só se faltar algo do 214a).
- **Design:** só pelo designer (o selo infantil fica com o 214c).
- **Não mudam:** `HomeMode.java` (só leitura de `noteHomeShown`/`state`), `ModeJob.java`, `Adb.java`, `Watchdog.java`,
  `RemoteKeys.java`, `AndroidManifest.xml`, `DreamView.java`, `Recs.java`, `build.sh`.

## Riscos

- **`noteHomeShown` chamado duas vezes** responderia "não" na segunda e quebraria o *At power-on = Live TV* e a
  pergunta. O validador confere que existe uma só chamada.
- **A pergunta nunca aparece.** O `reset` (Home) ou o `resume` podem fechar a folha antes de a pessoa ver, quando
  outro app estava na frente no boot. Os critérios 5 e 6 testam os três modos de *At power-on*.
- **A pergunta trava quem liga direto na TV ao vivo.** A regra dos 10 s é testada no critério 6.
- **Foco preso:** o diálogo de nome por cima da tela inicial, ou a folha aberta com o TalkBack. Critério 8.
- **Barra cheia:** a Nova com Now Playing, ícones de status, extras de *Top Buttons* e o ícone de perfil, a 720p, não
  pode passar da área segura nem encostar no relógio. Na Clássica, com 6 botões. Critério 9.
- **Memória:** a folha aberta e fechada muitas vezes, mais as trocas. Critério 4.
- **Web:** a Magic Remote (LG) manda cliques por ponteiro. O `lite` em Tizen 2.4 e LG de 1 GB (sem sombras nem
  transições) precisa manter 55 fps ou mais.

## Critério de pronto (mensurável)

1. **`tools/check.sh` passa** (JDK 17, build-tools 34.0.0, android-34; 26 línguas completas; ES5 e CSS).
2. **Visual conforme a seção 15** (validador com capturas do testador): ícone na Nova em repouso e em foco, ícone na
   Clássica com a opção ligada e desligada, folha com 2 e com 6 perfis (sem *Adicionar*), a 1080p e a 720p. Com a
   opção desligada, a Clássica fica idêntica à de antes (captura).
3. **≤ 300 ms:** mediana de 10 trocas pela folha (Principal ↔ Ana, 8 apps diferentes em cada), do `keydown` do OK
   (`event.getEventTime()`) até o 1º quadro com a fileira nova (log `profile: applied in N ms`). TCL, `Ui.LEGACY`,
   logos já em cache.
4. **Memória (protocolo M do 201 corrigido, como no 214a):**
   - `pidof io.freemytv:home` igual do começo ao fim; `dumpsys meminfo <pid>`, mediana de 3 leituras depois de 60 s
     parado (nova leitura até 100 s se o GC atrasar); `Activities: 1`;
   - **A** depois de abrir e fechar a folha uma vez e de uma ida e volta; **B** depois de 10 trocas pela folha mais 10
     aberturas fechadas com Voltar;
   - **B − A ≤ +2 MB**; contra o 214a mesclado, **≤ +8 MB** (regra por card).
   - **M2:** 3 rodadas do R30 com o ícone na linha de foco, por pid (`dumpsys gfxinfo <pid>`), no máximo +1,5 ponto de
     quadros travados contra o 214a.
5. **Início completo, *At power-on = tv*** (TCL, com o OK do dono para cada reinício; o reinício é feito pelo dono, na
   TV, nunca por `adb reboot`):
   - com 2 perfis, a folha aparece na 1ª vez que a tela inicial vem à frente nesse boot, inclusive pelo Home, com o
     foco no último perfil;
   - com só o Principal, a folha **não** aparece;
   - depois de standby e de acordar: **não** aparece (3 vezes);
   - em modo *Original*, nunca aparece. O testador não troca de modo: confere no código, ou o dono diz se quer testar.
6. **Início completo, *At power-on = Live TV*:**
   - sem tecla, em 10 s ± 1 s a folha fecha e a TV ao vivo abre com o último perfil;
   - com OK num perfil, troca e abre a TV ao vivo;
   - com Voltar, fica na tela inicial.
   - ***= home:*** depois do job `POWER_ON`, a folha está aberta na frente.
7. **Web:**
   - com 2+ perfis, a folha aparece ao carregar a página a frio; reabrir o app (`reset`) não pergunta;
   - troca ≤ 300 ms no preview (CPU 6×, normal e `lite`);
   - heap JS ≤ +2 MB e os mesmos nós do DOM depois de 10 trocas;
   - M4 dentro das metas.
8. **TalkBack** (com o dono, na TCL):
   - lê "Perfil: {name}" no ícone e "Quem está assistindo?" ao abrir;
   - lê "{name}, perfil ativo" e "Adicionar perfil";
   - lê "Perfil: {name}" depois da troca;
   - com a folha aberta, não lê nada da tela inicial.
   - O diálogo de *Adicionar* abre, recebe o nome, fecha e devolve o foco à folha.
9. **Mouse e 720p:**
   - mouse: hover e clique no ícone e nos círculos; clique fora não fecha; a roda move;
   - 720p (preview R e o desenho a 1280×720): nada fora da área segura, com a barra cheia (Now Playing, status e 6
     botões na Clássica).
10. **Logs e diff:**
    - 0 `FATAL`, `recycled bitmap`, ANR ou `leaked window` em `logcat -d -s FreeMyTV AndroidRuntime` durante tudo isso;
    - uma única chamada a `noteHomeShown` no código;
    - fora do diff: `DEBLOAT`, `PROTECTED`, `HomeMode.java`, `ModeJob.java`, `Adb.java`, `Watchdog.java`, o *Original*,
      o manifesto, URLs e permissões;
    - nenhuma alocação em `onDraw`/`draw*`.

## Agentes

- **Designer (primeiro, curto):**
  - a seção 15 já cobre o ícone e a folha. Falta definir: o botão de perfil no tamanho da Clássica, o texto da linha
    *Perfil* em *Top Buttons* (e o aviso da Nova), o diálogo de *Adicionar* por cima da tela inicial e o lugar na
    Clássica do web (pergunta 1);
  - confere a barra cheia a 720p;
  - tudo com o OK do dono.
- **Desenvolvedor:** branch `feat/214b`, um commit para o Android, um para o web e um para as traduções.
- **Validador:** `review/214b.md` com:
  - critérios 1, 2 e 10;
  - a única chamada a `noteHomeShown` e as condições da pergunta (modo FREE, 2+ perfis, `Watchdog`);
  - o caminho do Home e do `resume` com a folha da pergunta aberta;
  - nós de acessibilidade, ES5, nenhuma alocação em `onDraw` e as traduções.
- **Testador:**
  - critérios 3 a 9 na TCL e no preview, com o OK e os toques do usuário;
  - cada reinício e cada standby são feitos pelo dono, na TV;
  - instalação como nos cards anteriores, com o OK do dono;
  - no ADB, só leitura (`getprop`, `dumpsys`, `pm list`, `pidof`, `logcat -d`, inclusive `-b events`);
  - nenhum `logcat -c`, `force-stop`, `settings put` ou `pm disable`;
  - números em `review/214b-medida.md`.

## Perguntas para o dono

1. **Web na Clássica:** LG e Samsung não têm *Top Buttons*. O ícone na Clássica do web vira uma opção em Home Settings
   → Perfis ("Botão no topo", desligada por padrão; proposta), ou na Clássica do web os perfis ficam só em Home
   Settings?
2. ***At power-on = Live TV*:** qualquer tecla na folha para a contagem de 10 s; OK num perfil troca **e abre a TV ao
   vivo**; Voltar fica com o último perfil **na tela inicial** (sem TV ao vivo). Ok?
3. **Adicionar pela folha:** abre só o nome (por cima da tela inicial), cria com a cópia da fileira e a próxima cor
   livre, e a folha continua aberta com o foco no perfil novo (a cor se muda depois, em Home Settings). Ok, ou prefere
   que vá para Home Settings → Perfis?
