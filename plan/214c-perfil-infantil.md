# 214c · Perfil infantil: picks filtradas por idade

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java`, `HomeMode` nem o modo *Original*; nenhuma
permissão nova; **nenhum endereço de rede novo**: só `api.tmdb.org` e `image.tmdb.org`, que `Recs` já usa) · Status:
proposto · Fase 2 do Meu TV OS · Pedido do dono em 2026-11-01 (decisões depois do protótipo, `plan/214-perfis-do-meu-tv-os.md`)
· Depende de: **214a** (perfis, dados e troca) e **214b** (para a marca visual na folha e no ícone); antes do **211**

## Objetivo

Qualquer perfil pode ser marcado **infantil** (*Home Settings → Perfis → <perfil> → Infantil*). Num perfil infantil, a
faixa de destaque (e os cards da *Clássica*) só mostra picks com classificação livre ou infantil, de uma lista própria
buscada no TMDB em segundo plano. Continuar assistindo fica como está (decisão do dono). **Não** bloqueia apps, não
pede PIN, não esconde a fileira nem Ajustes: é um filtro das sugestões, não controle parental, e a tela diz isso.

## Valores propostos (TMDB)

Classificação brasileira (ClassInd) no TMDB: `L`, `10`, `12`, `14`, `16`, `18`; `certification.lte` compara pela
ordem dessa lista. Dois níveis por perfil infantil, escolhidos junto da marca:

- **Até 10 anos** (padrão): `certification.lte=10` (L e 10).
- **Livre:** `certification=L`.

Filmes e séries têm caminhos e gêneros diferentes no TMDB; os dois usam os mesmos `with_watch_providers`,
`watch_region`, `with_watch_monetization_types=flatrate`, `language` e `include_adult=false` da busca de hoje
(`Recs`, variável `common`), sem os itens de tendência (`/trending/*/week` não aceita filtro de classificação):

| | Filmes (`/discover/movie`) | Séries (`/discover/tv`) |
|---|---|---|
| Classificação | `certification_country=BR&certification.lte=10` (ou `certification=L`) | o mesmo, **se** o `/discover/tv` aceitar os parâmetros (o desenvolvedor confere na referência da API e numa chamada de teste do dono; ver risco) |
| Gêneros (ou) | `with_genres=16\|10751` (Animação ou Família) | `with_genres=10762\|16\|10751` (Kids, Animação ou Família) |
| Gêneros fora | `without_genres=27,53,80,10752` (Terror, Suspense, Crime, Guerra) | `without_genres=80,9648,10768,10764,10767,10763,10766` (Crime, Mistério, Guerra e Política, Reality, Talk, News, Novela) |
| Ordem e corte | `sort_by=popularity.desc&vote_count.gte=50`, lançados até hoje (`primary_release_date.lte`) | `sort_by=popularity.desc&vote_count.gte=20`, `first_air_date.lte` hoje |
| Se vierem menos de 6 | fica com o que veio (classificação BR de filme popular é comum no TMDB) | **reserva só por gênero Kids:** `with_genres=10762` com os mesmos gêneros fora, sem classificação. Nunca `16` sozinho sem classificação (anime adulto é Animação) |

- Lista: até 12 títulos (6 filmes e 6 séries), na ordem acima; as abas Filmes/Séries filtram como nas picks gerais.
- *Cartoons and anime* desligado (`Prefs.hideAnimation()`, por TV) **não** vale na lista infantil, porque tiraria
  quase tudo (pergunta 3).
- **Ficam fora** da lista infantil: Trakt (a conta é do dono da TV), Plex (sem classificação confiável) e as picks de
  tendência. Fotos suas (`Photos`) continuam onde aparecem hoje quando não há picks.
- `certification_country=BR` fixo, como o dono decidiu, também em TVs de outra região (pergunta 2).

## Cache e troca ≤ 300 ms

- Uma lista infantil **por TV**, não por perfil: todos os perfis infantis do mesmo nível usam a mesma (no máximo 2
  listas, uma por nível, e só se houver perfil com aquele nível). Android: preferências privadas `recs-kids`, ao lado
  da `recs` de hoje, com o próprio carimbo (`sourceStamp` + nível + idioma); imagens no mesmo `cacheDir/recs` (nomes
  pelo caminho do TMDB, então uma imagem que já está nas duas listas não é baixada de novo); `FILES` sobe para caber
  os 2 × 12 a mais. Web: `localStorage` `fmtv.recs.kids` (fora de `fmtv.recs`).
- Busca em segundo plano, no executor `io` que o `Recs` já tem (um por vez, nada de executor novo), **só se existir um
  perfil infantil**: ao marcar o perfil, ao abrir a tela inicial com a lista vencida (mesmo `LIST_EVERY` de 6 h e a
  troca de manhã/tarde/noite), depois da lista geral. Nunca na troca de perfil.
- Na troca para um perfil infantil, `HomeView` só troca a referência da lista (a infantil já está em memória, lida do
  disco quando a tela abriu); a imagem grande da faixa vem depois, com o crossfade do 206, dentro do limite de 2
  imagens grandes. Se a lista infantil ainda estiver vazia (primeira vez, sem rede): a faixa mostra a arte do app ou
  suas fotos, **nunca** as picks gerais.
- Detalhes por título (`fetchDetails`, provedores) reaproveitam os já conhecidos da lista geral (`reuse`). Links do
  Watchmode: só para os títulos que a faixa mostra, como nas picks gerais (pergunta 4: a cota grátis do Watchmode é
  pequena).

## Protetor de tela (proposta; pergunta 5)

O protetor roda em outro processo (`ScreensaverAlone`, processo principal, na TCL) e o 214 diz que só o `:home` lê o
perfil ativo. Com perfil infantil ativo, o protetor mostrando as picks gerais (pôster de terror) seria o buraco mais
visível. Proposta: o `:home` grava um arquivo pequeno `profile-kids` (`0`, `L` ou `10`) a cada troca; `DreamView` lê no
início e, se não for `0`, usa só a lista infantil do disco (sem buscar nada) ou, vazia, só fotos e aurora. Toca só a
escolha da lista em `DreamView`; `ScreensaverAlone`, `Screensaver` e `res/values-v30/v31/v33` não mudam.

## Sem chave do TMDB

- A marca *Infantil* continua disponível (não fica *Unavailable*): ela vale assim que houver chave.
- Nada é buscado. A faixa faz o que já faz sem chave (arte do app, suas fotos ou a aurora): não há picks gerais para
  vazar. A linha mostra a nota "Sem chave do TMDB, não há sugestões" (texto do designer).
- Uma chave nova (`Recs.key()` muda o `sourceStamp`) busca a lista geral e, se houver perfil infantil, a infantil.

## Marca visual (designer)

- Ícone do perfil (botão da barra e círculos da folha "Quem está assistindo?"): um selo pequeno, de símbolo, não só de
  cor (a cor nunca é a única pista), no canto oposto ao selo de "ativo"; usar ou desenhar um símbolo no estilo de
  `app/assets/symbols` (Material Symbols, licença já no repositório), nada da Apple.
- Na folha: "Infantil" embaixo do nome. Na faixa, no perfil infantil: uma etiqueta discreta "Para crianças" junto às
  abas-filtro.
- Em Home Settings: linha *Infantil* (Desligado / Livre / Até 10 anos) com a frase "Filtra só as sugestões. Não bloqueia
  apps."
- TalkBack: "{name}, perfil infantil" (e "…, perfil ativo"). 720p: selo × 2/3.
- Textos novos (PT e EN à mão, os outros no inglês até o 212): "Kids", "Kids profile", "{name}, kids profile",
  "All ages", "Up to 10", "Only filters the picks. Apps stay open.", "For kids", "No TMDB key: no picks".

## Plataformas

Google TV / Android TV e LG/Samsung (`web/`; no web não há Continuar assistindo nem protetor no processo principal).

## Arquivos

- Android: `Recs.java` (lista infantil, carimbo, `FILES`), `HomeView.java` (qual lista a faixa e os cards usam;
  etiqueta; selo no ícone), `Prefs.java` / dados de perfil do 214a (a marca e o nível por perfil),
  `SettingsActivity.java` (linha *Infantil*), `DreamView.java` (só a escolha da lista, se a pergunta 5 for sim),
  `app/assets/i18n/*.json`.
- Web: `web/data.js` (lista infantil, `fmtv.recs.kids`), `web/home.js`, `web/home.css`.
- `design/tokens-v2.json` → `profile` (selo), só pelo designer.
- **Não** mudam: `AndroidManifest.xml`, `network_security_config`, `Recs.SERVICES`, `HomeApps`, `HomeMode`, `Trakt.java`.

## Riscos

- **Séries sem classificação BR no TMDB:** muitas séries infantis não têm `BR` cadastrado, e o `/discover/tv` pode
  nem aceitar o filtro; por isso a reserva só pelo gênero Kids (10762). O testador confere a lista do momento.
- **Classificação errada ou ausente no TMDB** (dado colaborativo): o filtro reduz, não garante. A tela e o README
  dizem "filtra as sugestões", nunca "seguro para crianças".
- **Continuar assistindo** continua mostrando o que a TV tiver (decisão do dono), inclusive de adultos: o designer
  deixa isso claro na frase da linha de Home Settings, se o dono quiser (pergunta 6).
- **Rede e cota:** mais 2 a 4 chamadas `discover` e até ~12 de detalhes a cada 6 h, só com perfil infantil; mesmos
  hosts. Watchmode, ver pergunta 4.
- **Disco e memória:** até 24 imagens a mais no `cacheDir/recs` (~5 MB de disco, a w1280); em memória só a lista
  (dezenas de KB) e o limite de 2 imagens grandes do 206.
- **Troca acima de 300 ms** se a lista fosse lida do disco na troca: por isso lida ao abrir a tela.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; perfis não infantis e a *Clássica* sem mudança nas picks (mesma lista antes e depois).
2. Rede: no diff, só `api.tmdb.org` e `image.tmdb.org` (o validador confere as URLs novas); nada em
   `AndroidManifest.xml`; nenhuma busca disparada pela troca de perfil (o validador segue o caminho da troca).
3. TCL, perfil infantil "Até 10" com lista em cache: **troca ≤ 300 ms** (mediana de 10 trocas entre um perfil comum e o
   infantil, mesmo método do 214a); PSS do `:home` ≤ +2 MB depois das 10 trocas e 60 s parado.
4. Conteúdo: o testador anota os títulos que a faixa mostra no perfil infantil (Explorar, Filmes, Séries) e o validador
   confere cada um na página pública do TMDB (classificação BR ≤ 10, ou gênero Kids nas séries da reserva). Zero títulos
   com classificação BR acima de 10. Nenhum pick do Trakt ou do Plex.
5. Sem chave do TMDB: perfil infantil marcável, faixa sem picks (arte, fotos ou aurora), nenhuma chamada ao TMDB.
6. Primeira vez sem rede: perfil infantil mostra arte do app ou fotos, nunca uma pick geral (captura).
7. Se a pergunta 5 for sim: protetor de tela com perfil infantil ativo mostra só a lista infantil ou fotos (o testador
   inicia o protetor com o OK do usuário, 3 vezes; sem `FATAL` em `adb logcat -b crash`).
8. Marca visual conforme o designer na folha, no ícone e em Home Settings; TalkBack lê "perfil infantil".
9. M4 no preview (normal e `lite`): metas web; regra por card do 201.

## Agentes

- **designer (primeiro):** selo, etiqueta "Para crianças", linha de Home Settings com a frase, estados sem chave e sem
  lista; OK do dono.
- **desenvolvedor:** branch `feat/214c`; confere na referência do TMDB se `/discover/tv` aceita `certification_country`
  antes de escrever a busca de séries.
- **validador:** `review/214c.md` (critérios 2, 4 e 8, ES5, nenhuma alocação em `onDraw`).
- **testador:** critérios 3 a 7 na TCL e no preview, com o OK e os toques do usuário; no ADB só leitura. A chave do
  TMDB é do dono: nenhuma chamada de teste com ela é feita pelo agente; quem precisar de uma, pede ao dono que rode.

## Perguntas para o dono

1. Dois níveis (**Livre** e **Até 10 anos**, padrão Até 10) estão bons, ou quer também **Até 12**?
2. `certification_country=BR` fixo em qualquer região (decisão atual), ou seguir a região da TV (`tmdb_region`) com
   uma tabela de equivalência por país (outro trabalho)?
3. No perfil infantil, ignorar *Cartoons and anime* desligado (proposta), já que desenho é o principal da lista?
4. Links do Watchmode nas picks infantis: como nas gerais (gasta cota), ou abrir só o app (sem gastar)?
5. Protetor de tela com perfil infantil ativo: só a lista infantil ou fotos (proposta, mexe no `DreamView`), ou deixar
   como está nesta fase?
6. Continuar assistindo fica igual em perfil infantil (decisão atual). Quer que a frase de Home Settings avise disso?
