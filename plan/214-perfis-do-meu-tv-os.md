# 214 · Perfis do Meu TV OS (perfis locais da casa)

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*; nenhuma permissão nova,
nenhuma chamada de rede nova, nada pelo ADB da TV) · Status: aprovado pelo dono (2026-11-01), decisões no fim ·
Fase 2 do Meu TV OS · Pedido do dono em 2026-10-31 ("Perfis do Meu TV OS") · Dividido em **214a** (dados, troca e
Home Settings) e **214b** (ícone na Nova, folha "Quem está assistindo?" e pergunta ao ligar)

Este card é o guarda-chuva: diz o que é por perfil, por quê, e a ordem. Os critérios executáveis estão em
`plan/214a-perfis-dados-e-troca.md` e `plan/214b-perfis-icone-e-quem-esta-assistindo.md`.

## Objetivo

Cada pessoa da casa tem um perfil **local** (nome, cor e a inicial num ícone redondo). O perfil guarda a fileira de
favoritos (quais apps e em que ordem) e as preferências da faixa de destaque. Na aparência *Nova*, um ícone redondo
com a inicial e a cor do perfil, à esquerda do relógio, abre a troca de perfil. Na *Clássica*, os perfis ficam em
*Home Settings*.

**Não** é conta Google, não é controle parental e não tem senha. A conta Google da TV e os perfis do Google TV
(do `launcherx`, que fica desligado no modo Free My TV) não são lidos nem mudados. Os apps (Netflix, YouTube…) seguem
com os perfis deles: trocar de perfil aqui não troca o perfil dentro de nenhum app.

## O que é por perfil e o que fica por TV (proposta; o dono confirma)

| Item | Onde fica | Por quê |
|---|---|---|
| Fileira de favoritos e a ordem (`Prefs.shelf`, Home Settings → Shelf, segurar OK para mover) | **perfil** | é o pedido; só uma lista de pacotes, sem rede nem memória extra |
| Filtro inicial da faixa (Explorar, Filmes ou Séries) | **perfil** | hoje a aba não é guardada (`HomeView.tab` volta a Explorar); passa a ser "onde a faixa começa" para cada pessoa, nas duas aparências |
| Itens escondidos de *Continuar assistindo* (segurar OK no card, `Prefs.watchHidden`) | **perfil** (proposta) | escolha pessoal, local, gravada sem `Prefs.version` (não refaz a tela) |
| Serviços das picks (`servicesOff`), sem animação (`hideAnimation`), número de picks (`cards`) | TV | entram na **busca** do TMDB (`Recs`: `without_genres`, mapa de serviços, carimbo do cache): por perfil, cada troca buscaria de novo, ou seja, rede na troca e os 300 ms estourados |
| Chave TMDB, chave Watchmode, Plex, Immich, Home Assistant, `Secrets` | TV | são do dono da TV, técnicas e secretas; nunca por pessoa |
| Trakt | TV (proposta) | os tokens vivem só nas preferências privadas `trakt` do `:home` (`Trakt.available()`), e a lista salva de picks guarda a conta (`traktStamp`): por perfil seria um login por pessoa, um cache de picks por conta e busca nova a cada troca. Se o dono quiser, card próprio depois (214d), com ele decidindo |
| Idioma | TV (proposta) | trocar idioma chama `Ui.applyLanguage` e sobe `Prefs.version`, e o `HomeActivity` faz `recreate()` (≈ 1 s, refaz clima e cotações): estoura os 300 ms. Também mudaria a língua de Ajustes, do protetor (`ScreensaverAlone`, outro processo) e do `:sleep`. Se o dono quiser, pode entrar depois como "idioma ao trocar, com a tela recomeçando" |
| Aparência (Clássica/Nova), tema, relógio, clima, cotações, botões do topo, botões do controle, *Recent Apps*, *Now Playing*, *At power-on*, protetor de tela, fotos | TV | ajustes técnicos ou da sala, não da pessoa; vários são lidos por outros processos (`:keys`, `:sleep`, principal) |
| *Continuar assistindo* ligado/desligado e apps fora dele (`topContent`, `watchOff`) | TV | ligar pede `pm grant` pelo ADB da TV (`READ_TV_LISTINGS`): nunca por perfil |

## Regras propostas

- **Limite: 6 perfis.** Cabem numa linha da folha (6 círculos e o "Adicionar"), cada pessoa acha o seu sem rolar, e
  o custo é só texto nas preferências. O 7º: o "Adicionar perfil" fica *Unavailable* com "Até 6 perfis".
- **Principal, criado do estado atual (migração sem perda):** na primeira abertura da versão nova, sem perfis salvos,
  nasce o perfil **Principal** (cor 1, inicial "P" em português) com a fileira de hoje. A fileira do Principal **é a
  mesma chave `shelf` de hoje** (Android: `settings`/`shelf`; web: `fmtv.prefs` → `shelf`); os outros perfis usam
  `shelf.<id>`. Assim: nada é copiado, quem nunca editou a fileira (`shelf` nulo) continua com a lista embutida, e
  instalar uma versão antiga por cima ainda lê a fileira do Principal. O nome do Principal fica vazio no disco e
  aparece como `Ui.tr("profile|Main")` até a pessoa renomear (muda com o idioma).
- **Perfil novo:** começa com a fileira embutida (`HomeApps.SHELF` instalados, como numa TV nova), filtro Explorar e
  a próxima cor livre. Proposta alternativa (pergunta 3): começar com a cópia da fileira do perfil atual.
- **Apagar:** só em *Home Settings → Perfis → <perfil> → Apagar*, com confirmação ("Apagar o perfil de {name}? A
  fileira dele some; os apps continuam instalados."). O Principal não se apaga (sempre há um). Apagar o perfil ativo
  troca antes para o Principal. Apagar remove só as chaves do perfil (`shelf.<id>` e afins); nenhum app é
  desinstalado, desligado ou tem dados apagados. Ids nunca são reaproveitados (contador), para um perfil novo não
  herdar nada.
- **Troca:** vale na hora, sem `recreate()`. A escolha é gravada sem subir `Prefs.version` (que faria a tela
  recomeçar e buscar clima e cotações de novo, `HomeActivity.onResume`). Só o `:home` lê o perfil ativo; o processo
  principal (`ModeJob`, `ScreensaverAlone`), o `:keys` e o `:sleep` não precisam dele.
- **"Quem está assistindo?" ao ligar:** opção em Home Settings, **desligada por padrão**. Só depois de um **início
  completo** da TV, nunca ao voltar do standby, usando o mesmo sinal do *At power-on*: o resultado da única chamada
  `HomeMode.noteHomeShown` no `HomeActivity.onCreate` (não chamar de novo: ela grava o arquivo `home-shown` e só diz
  "sim" uma vez por boot), e só no modo Free My TV. Com *At power-on = Live TV*: a folha aparece no lugar da espera
  de 10 s; escolher (ou 10 s sem resposta, ficando o último perfil) e então a TV ao vivo abre como hoje. Com
  *= home*: a folha aparece quando a nossa tela vem à frente pelo job `POWER_ON`. Com *= tv* e um app de TV na
  frente: aparece só quando a nossa tela aparecer pela primeira vez nesse boot. Voltar fecha a folha e fica o último
  perfil. Web: "ao abrir o app" (início a frio, não ao voltar de outro app).
- **Onde fica:** *Nova*: ícone redondo de 64 px com a inicial (branca, peso 700) sobre a cor do perfil, à esquerda do
  relógio, depois dos botões redondos (entra na mesma linha de foco da barra superior do 208; o relógio continua sem
  foco). OK abre a folha "Quem está assistindo?". *Clássica*: *Home Settings → Perfis* (trocar, adicionar, editar,
  apagar, perguntar ao ligar) e, se o dono quiser (pergunta 5), o ícone como opção em *Top Buttons*.
- **Acessibilidade:** TalkBack lê o ícone como "Perfil: {name}"; na folha, "{name}, {i} de {n}" e "selecionado" no
  ativo; a cor nunca é a única pista (inicial e nome sempre presentes). Mouse: clicar no ícone abre a folha, clicar
  num círculo troca; hover segue as regras de hoje. 720p: tudo × 2/3 (ícone de 43 px), inicial desenhada no tamanho
  da UI.
- **Traduções:** português e inglês desde o início (decisão 10 do card 200); as outras línguas caem no inglês até o
  212. Português feito à mão, nunca `--fill`.
- **Nada novo de rede, de permissão ou de ADB.** Sem tocar `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java`,
  `HomeMode` (só leitura de `noteHomeShown`, que já é chamado hoje) nem o *Original*.

## Metas de desempenho (das duas partes)

- **Troca de perfil ≤ 300 ms** do OK no perfil até a fileira nova desenhada (TCL, `Ui.LEGACY`, logos já em
  `cacheDir/logos`; mediana de 10 trocas entre dois perfis com 8 apps diferentes cada).
- **Memória:** PSS do `:home` (M1 do card 201) depois de 10 trocas e 60 s parado ≤ **+2 MB** contra antes das trocas.
  Os bitmaps dos tiles do perfil anterior são soltos na troca; o cache em memória nunca guarda dois perfis.
- Regra por card do 201 nos dois cards (≤ +8 MB, ≤ +1,5 ponto, ≤ +100 ms a frio).

## Ordem na fase

- **214a (dados, troca e Home Settings) pode vir antes do 208**: não depende do visual novo. Entra depois do **202**
  (os dois mexem em `Prefs.java` e `SettingsActivity.java`) e de preferência depois do **203** (mexe na carga da
  fileira em `HomeView`/`HomeApps`, que a troca em lugar usa). Pode correr junto com 204–207.
- **214b (ícone, folha e pergunta ao ligar) vem depois do 208** (barra superior) **e do 210** (folhas em vidro), e
  **antes do 211**, para a auditoria de acessibilidade, mouse e 720p do 211 já pegar o ícone e a folha, e antes do
  212, para a virada já sair com perfis.
- **214c (perfil infantil, `plan/214c-perfil-infantil.md`)** vem depois do **214a** (dados do perfil) e do **214b**
  (marca na folha e no ícone), e antes do **211** (auditoria de acessibilidade, mouse e 720p).
- **215 (informações da TV e teste de velocidade, `plan/215-informacoes-da-tv-e-teste-de-velocidade.md`)** vem logo
  depois do **208** (barra superior) e antes do **209**/**210**, para o vidro já pegar a linha nova e a gaveta da Nova
  já nascer sem o painel de cotações.
- **216 (memória ao sair de Home Settings, `plan/216-memoria-home-settings.md`)** vem logo depois do **202** e antes
  do **203**: corrige dois vazamentos anteriores ao fork, para os cards seguintes serem medidos sobre base limpa.
- Sequência sugerida (atualizada em 2026-11-01): 202 → **216** → 203 → **214a** → 204 → 206 → 207 → 208 → **215** → 209 → 210 →
  **214b** → **214c** → 211 → 212 → 213.

## Perguntas para o dono

1. Por perfil, confirma: fileira e ordem, filtro inicial da faixa e itens escondidos do *Continuar assistindo*? Algo
   mais (por exemplo, a aparência Clássica/Nova por pessoa)?
2. Idioma e Trakt ficam por TV nesta fase (motivos acima)? Se quiser algum por perfil, vira card próprio (214d).
3. Perfil novo começa com a fileira padrão da TV ou com a cópia da fileira do perfil atual?
4. Limite de 6 está bom?
5. Na *Clássica*, só *Home Settings → Perfis*, ou também o ícone como opção em *Top Buttons*?
6. "Quem está assistindo?" ao ligar: desligado por padrão, sem tempo-limite (fica até a pessoa escolher, Voltar mantém
   o último), salvo com *At power-on = Live TV*, onde espera 10 s e segue com o último perfil. Ok?
7. Paleta de cores: o designer propõe 8 cores (inicial branca com contraste ≥ 4,5:1) em `design/tokens-v2.json`. Ok
   deixar com ele?
8. Na build do LG, quando uma build nova traz outro `shelf_apps` (hoje ela vence uma vez sobre a escolha da TV,
   `Prefs.shelfConfig` em `web/data.js`): vale só para o Principal (proposta) ou para todos os perfis?
9. O README e o site falam de perfis só no 212, junto com o resto da fase?

## Agentes

Ver 214a e 214b. Resumo: **designer** (folha, ícone, paleta, telas de Home Settings, com o OK do dono), **desenvolvedor**
(branches `feat/214a` e `feat/214b`), **validador** (`review/214a.md`, `review/214b.md`), **testador** (TCL e preview
web, sempre com o OK e os toques do usuário; no ADB só leitura).

## Decisões do dono (2026-11-01)

1. Por perfil: fileira de favoritos e ordem, filtro inicial da faixa e itens escondidos do *Continuar assistindo*.
2. Idioma, Trakt e o resto ficam por TV nesta fase (sem 214d por enquanto; 214c passou a ser o perfil infantil).
3. **Perfil novo começa com a cópia da fileira do perfil atual** (não a fileira embutida).
4. Limite de 6 perfis (padrão aceito).
5. **Na Clássica: Home Settings → Perfis e também o ícone como opção em *Top Buttons*.**
6. **"Quem está assistindo?" sempre aparece depois de um início completo da TV** (não é opção desligada; nunca ao
   voltar do standby; só no modo Free My TV; sem tempo-limite, Voltar fica com o último perfil). Exceção mantida:
   com *At power-on = Live TV*, espera 10 s e segue com o último perfil, para não travar quem liga direto na TV ao vivo.
   Web: ao abrir o app (início a frio).
7. Paleta: fica com o designer (8 cores, inicial branca ≥ 4,5:1).
8. LG `shelf_apps` de uma build nova vale só para o Principal (proposta aceita).
9. README e site falam de perfis só no 212.

## Decisões do dono depois do protótipo (2026-11-01)

- **Perfil infantil: filtrar as sugestões por idade.** Cada perfil pode ser marcado "infantil"; nele a faixa só mostra
  picks com classificação livre/infantil (TMDB `certification_country=BR`, `certification.lte` L/10, mais gêneros
  Animação/Família), e Continuar assistindo continua como está. Não bloqueia apps nem pede PIN. Atenção ao custo:
  é outra busca no TMDB (o mesmo endereço, sem rede nova); a lista infantil fica em cache próprio e é buscada em segundo
  plano, para a troca de perfil seguir ≤ 300 ms. Provavelmente um card próprio (214c), depois do 214a.
- **Com só o Principal:** o ícone aparece (na Nova, e na Clássica se ligado em Top Buttons), mas a TV **não** pergunta
  "Quem está assistindo?" ao ligar; a pergunta começa quando houver 2 ou mais perfis.
- Paleta: trocar o vermelho (parecido com o rosa) por outra cor bem diferente, mantendo a inicial branca ≥ 4,5:1.
