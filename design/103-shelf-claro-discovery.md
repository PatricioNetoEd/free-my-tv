# 103 · Claro tv+ e discovery+ na prateleira: especificação de design

Card: `plan/103-shelf-claro-discovery.md`. Fonte dos valores: `design/tokens.json` (`brand.clarotv`,
`brand.discoveryplus`). Este documento diz o que entra e por quê; o desenvolvedor copia os valores de lá.

## Valores (Android e web)

| Campo | Claro tv+ | discovery+ |
|---|---|---|
| Chave | `clarotv` | `discoveryplus` |
| Nome (rótulo, Home Settings → Shelf) | `Claro tv+` | `discovery+` (minúsculo, como a marca) |
| Pacote Android | `br.com.claro.now.smarttvclient` | `com.discovery.discoveryplus.androidtv` |
| Cor de marca (`SHELF` col. 4) | `E3262E` | `2B57D0` |
| Modo do logo (`SHELF` col. 5) | `""` (cores da arte) | `""` (cores da arte) |
| Escala (`SHELF` col. 6) | `1` | `1.1` |
| `TILE_STYLE` (Android) | `{0xFF1C1C1C, 0xFF0B0B0B, 0}` | `{0xFF211E2A, 0xFF09080D, 0}` |
| Degradê web (`SHELF` em `web/home.js`) | `['#1C1C1C', '#0B0B0B']` | `['#211E2A', '#09080D']` |
| Regex de id (web) | `/claro\.now|clarotv|claro\.tv/` | `/discoveryplus/` |
| Regex de título (web) | `/claro ?tv/i` | `/discovery\+\|discoveryplus/i` |
| `SAMPLE` do preview (`web/tv.js`, opcional) | `['br.com.claro.now', 'Claro tv+', '#E3262E']` | `['com.discovery.discoveryplus', 'discovery+', '#2B57D0']` |

Linhas prontas para o desenvolvedor (só acrescentar, **depois do Spotify**, nas duas `SHELF`):

```java
{"clarotv", "Claro tv+", "br.com.claro.now.smarttvclient", "E3262E", "", "1"},
{"discoveryplus", "discovery+", "com.discovery.discoveryplus.androidtv", "2B57D0", "", "1.1"},
```
```java
TILE_STYLE.put("clarotv", new int[] {0xFF1C1C1C, 0xFF0B0B0B, 0});
TILE_STYLE.put("discoveryplus", new int[] {0xFF211E2A, 0xFF09080D, 0});
```
```js
['clarotv', /claro\.now|clarotv|claro\.tv/, /claro ?tv/i, ['#1C1C1C', '#0B0B0B']],
['discoveryplus', /discoveryplus/, /discovery\+|discoveryplus/i, ['#211E2A', '#09080D']]
```

Por que depois do Spotify (o card aceita antes ou depois): assim nenhum padrão muda, nem para quem tem menos de 8 apps
conhecidos e já tem o Spotify na prateleira. Os dois entram quando a pessoa os escolhe em *Home Settings → Shelf*.

Atenção na regex web de id: `/claro\.now|clarotv|claro\.tv/` pega qualquer id com "claro". É o que o card pediu; não há TV LG/Samsung para
confirmar. Nunca usar `/discovery/` puro (o LG tem `com.webos.app.discovery`).

## Evidência (de onde veio cada valor)

APKs puxados da TV só com `pm path` e `pull`, para o scratchpad, fora do repo. O manifest foi lido
com `aapt2 dump badging`, `dump xmltree` e `dump resources`; os pixels, amostrados por um leitor de PNG em Python puro.

**Claro tv+** (versionName `2.03.01-androidtv-public`, versionCode 1160030100)
- `android:banner` = `@0x7f110001` = `mipmap/ic_banner_foreground` → `res/mipmap-xhdpi-v4/ic_banner_foreground.png`
  (320×180, só xhdpi, dentro do `base.apk`). `ic_banner.png` é idêntico pixel a pixel.
- Fundo: `#151515` (as 4 bordas inteiras, 1000 de 1000 pixels). "Claro" com o sol: `#E3262E` (2323 px, o tom mais
  frequente). "tv+": `#EEEEEE`.
- Logo: 246×59 px na arte, proporção 4,17:1, tinta ~30% da caixa.

**discovery+** (versionName `17.52.0`, versionCode 1604880611)
- `android:banner` = `@0x7f08023d` = `drawable/ic_launcher` → `res/drawable/ic_launcher.webp` (320×180, sem
  qualificador, no `base.apk`).
- Fundo: `#131119` (as bordas inteiras). Marca "D" em degradê arco-íris (vermelho `#E9472C`, laranja `#F09939`,
  amarelo `#EDEF56`, ciano `#63C5E4`, azul `#2B57D0`/`#183CC8`, violeta `#7E4BEB`), contorno e palavra
  "discovery+" brancos `#FFFFFF`.
- Logo: 212×136 px na arte, proporção 1,56:1, tinta ~35%.
- Cor de marca: o card pede azul. `#2B57D0` é o azul mais frequente da faixa azul do "D". Não usei `#183CC8`, que é
  quase o `1838C8` do Disney+ e deixaria os dois iguais no fundo de reserva.

## Decisões e motivo

**Modo do logo `""` nos dois.** Os dois banners são logo colorido + branco sobre fundo quase preto. Com `""`,
`bannerLogo` tira o fundo pelas bordas e deixa as cores como estão.
- `"tint"` não faria nada: só age com fundo de marca (`bgLum > 0.1` e `bgSat > 0.35`), e esses fundos têm luminância
  ~0,08 e saturação ~0.
- `"white"` apagaria o vermelho do "Claro" e o arco-íris do "D", e sobraria só "tv+" e o contorno.
- `"play"` serve para o triângulo do YouTube e não se aplica.

**`TILE_STYLE` sim, nos dois, e escuro.** Sem `TILE_STYLE`, o tile fica com o liso `#161618` e funciona. Com ele, o
foco ganha o brilho de cima (`tileGlow`), como Netflix, YouTube e Apple TV, e o degradê sai da própria arte:
- Claro: `#1C1C1C → #0B0B0B` em volta do `#151515` do banner. Um degradê vermelho foi descartado porque o
  "Claro" vermelho sumiria nele.
- discovery+: `#211E2A → #09080D` em volta do `#131119` do banner. Um degradê azul foi descartado porque engoliria
  a faixa azul do "D" e brigaria com o arco-íris.
- Terceiro valor `0`: o logo vai como foi recortado. O `1` (branco) é para logos `tint` (Prime, Globoplay).
- Custo: um `LinearGradient` por tile, criado uma vez e guardado em `tileShaders`. Nada é alocado no `onDraw` e
  nenhum efeito pesado entra. Vale do Android 8 em diante, sem AGSL.

**Escala.** Pela conta de `crispLogo` num tile focado de 214×120 (8 apps, 178×100 em repouso):
- Claro tv+ é muito largo e já bate no limite de 76% da largura com escala 1: ~162×39 no foco. Uma escala maior não
  mudaria nada, por isso `1`.
- discovery+, com 1, fica ~99×64 (46% × 53%). Com `1.1` sobe até o limite de 58% da altura (~108×70). Isso deixa a
  palavra "discovery+", que tem ~1/5 da altura do logo, o mais legível possível. Por isso `1.1`.
- Na web não há escala: `.tile img.logo` usa uma caixa de 70%×50% com `contain`. Claro fica limitado pela largura
  e discovery+ pela altura, e os dois ficam bem sem regra nova.

**Contraste (WCAG, logo sobre o tile).**
- Vermelho `#E3262E`: 3,7:1 sobre `#1C1C1C` e 4,3:1 sobre `#0B0B0B`.
- Branco `#EEEEEE`: mais de 14:1.
- Branco `#FFFFFF`: mais de 16:1 sobre o degradê do discovery+.
- Azul `#2B57D0`: ~3:1, mas é só uma faixa da marca, delimitada pelo contorno branco.

Logotipos são isentos do AA. Mesmo assim, as partes que dão o nome (o "Claro" vermelho e o branco) passam de 3:1,
o mínimo para gráficos. Os degradês são opacos, então o contraste é o mesmo de dia (céu `#EBEBEF`) e de noite.

**Texto.** Nada novo para traduzir: os nomes de marca não passam por `Ui.tr`. Os rótulos que aparecem na tela já
seguem o tamanho atual da prateleira e do Home Settings (sem mudança).

## Telas afetadas

### 1. Prateleira da Home (Android `HomeView`, web `home.js`)

- **Layout:** sem mudança. Os tiles têm 16:9, no máximo 224×126 e 178×100 com 8 apps, com 48 px entre eles, raio 22
  e a plataforma de vidro com fundo em y=940. Com mais de 8 apps escolhidos, a prateleira rola com o foco
  (`shelfFirst`). Os dois tiles novos usam o mesmo molde: degradê de `tokens.brand.*.tile` e logo centralizado.
- **Estados de foco:**
  - Repouso: escala 1, sombra leve, logo no tamanho de repouso (`crispLogo` com o bitmap `@rest`).
  - Foco: escala 1,2 (`FOCUS_GROW`), brilho branco de 8% na metade de cima (`tileGlow`; na web, 10% em
    `.tile::after`) e uma sombra mais funda (web: `0 18px 40px`). O logo é trocado pelo bitmap do tamanho do foco,
    para ficar nítido.
  - Reordenar (segurar OK): o tile levanta e balança; ← → move; OK solta.
  - Sem logo (`.none`): a arte da TV com a cor de marca (`appTile`). Na web, o nome em 30 px/700 sobre o degradê.
- **Ordem das setas:** ← → percorrem os tiles da prateleira, e a ordem é a de `Prefs.shelf` (a que a pessoa
  escolheu). ▲ vai para os cards acima. ▼ abre a gaveta. Tudo como hoje.
- **Voltar:** com o foco na prateleira, não faz nada (é a Home). Reordenando, cancela e devolve o tile ao lugar
  (`cancelReorder`). Vindo de outra zona, volta para a prateleira (`back()`).
- **Níveis até o app:** 1 (Home → OK no tile).

### 2. Home Settings → Shelf

- **Layout:** sem mudança. A lista ganha duas linhas, "Claro tv+" e "discovery+", que entram junto com as outras da
  `SHELF` (`HomeApps.shelfCandidates`: as da `SHELF` primeiro, na ordem da tabela, depois as outras pelo nome).
- **Estados de foco, setas e Voltar:** iguais aos das outras linhas da lista. Voltar sai da lista para Home Settings.
- **Níveis:** Home → Home Settings → Shelf, 3 no máximo.

## Pendências e decisões do usuário

1. **Logo empacotado na web (licença de marca): não é pedido.**
   - No LG, `home.js` recorta o logo do ícone que a TV entrega (`lift`).
   - No Samsung, só os apps com arquivo em `web/icons/` (`SAMSUNG_ICONS`) têm logo garantido; sem ele, o tile
     mostra o nome sobre o degradê, o que é legível e aceitável.
   - Se o usuário quiser logo garantido no Samsung, o desenvolvedor precisa de um SVG ou PNG oficial que a marca
     permita usar. A arte dos APKs **não** vai para o repo. Isso é decisão do usuário.
2. **Ids reais no LG e no Samsung:** não confirmados (não há TV). Ver as regex acima.
3. **Preview (critério 6):** o `SAMPLE` já tem 8 apps conhecidos, então os dois novos não entram na prateleira
   padrão do `--preview`. Duas saídas:
   - o testador os escolhe em Home Settings → Shelf no preview;
   - o desenvolvedor os põe no `SAMPLE` antes de Spotify. Isso só muda o preview, não as TVs.
4. **Memória (2 GB):** cada tile novo guarda o logo em dois tamanhos, o que dá algumas centenas de KB. O teste de
   PSS do card continua valendo.
5. **Versão da arte:** a evidência vale para as versões acima. Uma atualização do app pode trocar o banner. O cache
   (`lastUpdateTime`) refaz o logo, mas os hex de `tokens.json` não mudam sozinhos.

## Compatibilidade com uma direção inspirada no tvOS

Princípios gerais, sem assets, fontes ou marcas da Apple. Nada disto muda o app neste card.

- **Tiles grandes e arredondados, com o logo ocupando o tile.** Os dois funcionam, porque o fundo deles é um escuro
  quase sólido, sem foto nem textura: o tile pode ser o próprio "cartão" da marca, com o degradê de
  `tokens.brand.*.tile` de borda a borda e o logo maior.
  - Claro tv+ é um logo de linha (4:1). Ele enche a largura e sobra altura, então o limite que manda é a largura útil
    (hoje 76%; num estilo assim, até ~84% com a margem interna mínima).
  - discovery+ é um bloco (1,56:1). Ele cresce pela altura, até ~70%.
  - As cores da arte não mudam. O raio sobe junto com o tile. Hoje é 22 para 126 de altura, ~17%; manter essa
    proporção.
- **Foco que levanta o tile, com sombra suave.** Já é o comportamento de hoje (escala 1,2 e sombra mais funda). Numa
  direção assim, o foco pode ganhar uma leve inclinação ou paralaxe do logo em relação ao fundo.
  - Isso pede uma camada separada do logo, que já existe (o logo é um bitmap à parte do degradê).
  - Fica só para Android 13+, pela regra de efeitos pesados. Nos outros, apenas escala e sombra.
  - O brilho especular de cima já corresponde ao `tileGlow`.
- **Fundo escuro e opaco.** Por ser opaco, o contraste do logo não depende do papel de parede nem do tema
  dia/noite, e isso continua valendo num estilo com mais vidro em volta.
- **O que não muda com o estilo:** cor de marca, modo do logo (`""`), as cores do logo recortado e a regra de não
  pôr arte de marca no repo.
