# 200 · Direção visual tvOS: tokens e protótipo

Risco normal (só design, nenhuma linha de código do app; não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java`
nem o modo *Original*) · Status: aprovado pelo dono (2026-10-31), decisões abaixo · Fase 2 do Meu TV OS (tela inicial tvOS),
vem antes de todos os cards 201 a 212

## Objetivo

Definir, antes de qualquer código, como a tela inicial inteira fica "inspirada no Apple TV (tvOS)" em Google TV/Android
TV (`HomeView`) e em LG/Samsung (`web/home.js`, `web/home.css`), e ter isso aprovado pelo dono. O resultado é uma
especificação que os cards 202 a 212 só executam.

Princípios do tvOS que entram (só os princípios; **nenhum** ícone, imagem, fonte SF Pro, nome ou marca da Apple):

- fileira de apps em tiles grandes e arredondados, com a arte preenchendo o tile;
- foco que eleva o tile (escala, sombra suave mais funda, brilho leve); navegação fluida com molas;
- faixa de destaque no topo ("top shelf") com conteúdo grande do app em foco ou das picks;
- materiais translúcidos ("vidro") com fallback leve onde não há blur;
- tipografia e espaçamento generosos, dentro da área segura de TV.

## Ponto de partida (o que o designer precisa saber)

A tela de hoje já é "estilo app Apple TV" (comentário no topo de `HomeView.java` e `web/home.js`): título "For You",
abas Explorar/Filmes/Séries, botões redondos de vidro (Live TV, Entradas, Configurações), 3 cards de picks com o fundo
borrado da pick em foco, prateleira de vidro embaixo (tiles 16:9 de até 224×126, logo recortado cobrindo ~8,5% do tile,
foco +20%), gaveta com ↓ (entradas, atalhos, clima, cotações), visual noturno, folha *All Apps* (5 colunas de 300×169).
A mudança desta fase é de **app Apple TV** para **tela inicial do tvOS**: a faixa de destaque passa a dominar a metade
de cima e os apps viram a grade principal.

## Entregáveis (todos em `design/`, sem tocar em `app/` nem `web/`)

1. `design/tokens.json` **versão 2**: uma seção `tvos` nova (as entradas de hoje ficam, porque a aparência clássica
   continua existindo até o card 212), com:
   - área segura (proposta: 96 px nas laterais e 60 px em cima/embaixo a 1920×1080, ou seja 5%), grade de colunas,
     espaçamentos;
   - escala tipográfica com a Inter que o app já embute (`app/assets/fonts/InterVariable.ttf`, `web/fonts/`): tamanho
     mínimo de 24 px a 1080p, pesos e entrelinhas;
   - tiles: tamanho em repouso e em foco por quantidade de apps, raio, gap, modo da arte (ver pergunta 2 abaixo);
   - foco: escala, deslocamento e desfoque da sombra em repouso/foco, brilho (posição, opacidade), parâmetros das molas
     (`Spring` response/damping) e o equivalente CSS (duração e curva de `transition` em `transform`/`opacity`);
   - faixa de destaque: altura, gradiente de legibilidade, tipografia do título e metadados, tempo de espera antes de
     trocar (hoje `BG_FOLLOW_MS = 500`), crossfade;
   - vidro: cor/opacidade por nível (claro e noite), e o **fallback** de cada um: Android 13+ (AGSL), Android 8-12 e
     `Ui.LEGACY` (sem camadas de GPU, sombra em cache `Shadows`), web normal, web `flat` e web `lite`.
2. **Protótipo navegável** em `design/tvos/` (HTML estático aberto no navegador a 1920×1080, setas do teclado como
   controle remoto; pode usar CSS moderno porque não vai para a TV) com estas telas:
   - repouso, foco no 1º app, foco no 5º app (faixa mostrando conteúdo do app), foco subindo para a faixa;
   - fileira 2 em diante (rolagem vertical e a faixa recolhendo), gaveta, *All Apps*;
   - dia e noite; sem chave TMDB (sem picks); com 3, 8 e 20 apps;
   - variante **leve** (o que `Ui.LEGACY`, web `lite` e Tizen 2.4 mostram: sem sombras desfocadas animadas, sem blur,
     vidro opaco) e verificação a 1280×720 (TCL de 1 GB).
3. `design/200-direcao-tvos.md`: a especificação por card (202 a 212): o que cada um muda na tela, os tokens que usa e
   as capturas do protótipo.
4. Orçamento de imagens: quantas imagens grandes a faixa mantém na memória ao mesmo tempo e em que tamanho (proposta:
   no máximo 2, a 1280 px de largura, as duas da transição).

## Plataformas

- Google TV / Android TV (8 a 14; TCL Android 11 com 2 GB como alvo de medida; `Ui.LEGACY` lá).
- LG webOS 3+ e Samsung Tizen 2.3+ (`web/`: ES5, sem CSS variables, grid nem `backdrop-filter`, só `transform` e
  `opacity` animando; `lite` em Tizen 2.4 e LG de 1 GB, `flat` em Samsung de 2 GB).

## Arquivos

- `design/tokens.json` (versão 2), `design/tvos/*`, `design/200-direcao-tvos.md`.
- Não mexe em `design/103-shelf-claro-discovery.md` nem nas marcas do card 103 (só acrescenta a seção `tvos`). Se o card
  103 ainda estiver em aberto quando este começar, o designer espera ele fechar para editar `tokens.json`.

## Riscos

- **Protótipo bonito que a TV não roda:** cada efeito do protótipo precisa ter o seu fallback desenhado (variante
  leve) e um custo estimado. Sombra desfocada animada, blur em tempo real e imagens 1920×1080 cheias são os suspeitos
  (CLAUDE.md: Mali-450 a 40 ms por quadro com BlurMaskFilter; LG Lite a 23-28 fps com sombras).
- **Propriedade intelectual:** nada da Apple (ícones, fotos de "Aerials", SF Pro, a palavra "tvOS" em texto da tela,
  glifos SF Symbols). Os símbolos continuam os de `app/assets/symbols`.
- **Escopo:** o designer não decide comportamento de sistema (modo, debloat, permissões). Se a faixa de destaque
  precisar de dados novos (por exemplo canais de prévia de outros apps, que pedem permissão nova via ADB), isso vira
  pergunta ao dono e card próprio de **ALTO RISCO**, fora desta fase.
- **Legibilidade:** texto sobre foto nítida exige gradiente/escurecimento; contraste WCAG AA (regra do `tokens.json`).

## Critério de pronto (mensurável)

1. `design/tokens.json` válido (`python3 -m json.tool` passa), `version: 2`, com a seção `tvos` cobrindo os itens do
   entregável 1, cada token com um fallback leve onde é efeito pesado.
2. O protótipo abre em `design/tvos/index.html` e navega só com as setas, Enter e Esc por todas as telas do item 2.
3. Todo texto do protótipo ≥ 24 px a 1080p; contraste ≥ 4,5:1 para texto de interface (conferido com ferramenta, valores
   anotados na especificação).
4. Nada da Apple no protótipo (o validador confere fontes, imagens e textos).
5. A especificação responde às perguntas do dono listadas abaixo, com a resposta dele anotada.
6. **Aprovação do dono registrada** em `design/200-direcao-tvos.md` (data e "aprovado"). Sem ela, nenhum card de 202 a
   212 começa.

## Perguntas ao dono (precisam de resposta antes do protótipo final)

1. O que vai na faixa de destaque, e em que ordem: picks do TMDB do app em foco, *Continuar assistindo*, suas fotos,
   arte do próprio app? E sem chave TMDB?
2. Tile: a arte de TV inteira do app (o banner, como o tvOS; a qualidade varia de app para app) ou o logo de marca bem
   maior sobre o degradê da marca (mais uniforme)?
3. As abas Explorar/Filmes/Séries ficam (dentro da faixa), viram filtro ou saem?
4. A tela mostra só os favoritos (como hoje) ou todos os apps em grade, como o tvOS? A folha *All Apps* continua?
5. A gaveta (entradas, atalhos, clima, cotações) continua no ↓, vira fileira ou vira um painel lateral?
6. Visual: claro de dia e escuro à noite (como hoje), ou sempre escuro como o tvOS?
7. Interruptor *Aparência: Clássica / tvOS* em Home Settings durante a fase (recomendado), removido no card 212?
8. Protetor de tela entra nesta fase (card 213, opcional)?

## Agentes

- **designer:** tudo acima. Entrega tokens + protótipo + especificação para aprovação.
- **dono:** aprova (ou pede ajustes) e responde às perguntas. Sem aprovação, a fase não anda.
- **validador:** confere os critérios 1 a 4 e escreve `review/200.md`.
- desenvolvedor e testador: não participam deste card.

## Decisões do dono (2026-10-31)

1. Faixa de destaque: segue o app em foco (picks já baixadas daquele serviço → Continuar assistindo → arte do app;
   sem chave TMDB, a arte do app).
2. Tiles: logo sobre a cor da marca (como no card 103), igual em Google TV, LG e Samsung.
3. Apps: fileira de favoritos + folha All Apps como hoje. **Card 205 (grade com rolagem) fica fora da fase.**
4. Tema: claro de dia, escuro à noite (como hoje).
5. Abas Explorar/Filmes/Séries: viram filtro discreto da faixa de destaque.
6. Gaveta: continua no ↓, só com o visual novo.
7. Clássica/Nova durante a fase; no 212 a Nova vira padrão e a Clássica continua como opção.
8. Protetor de tela (213): sim, no fim da fase.
9. Metas aceitas (≤ 130 MB, ≤ 8% janky em 30 s, p95 ≤ 22 ms, ≤ 1.000 ms a frio; limites por card como no plano);
   LG/Samsung medidos só no preview do navegador.
10. Traduções: português e inglês desde o início; os outros idiomas podem ficar em inglês até o 212. No 212, CLAUDE.md,
    README e site (docs/, PT e EN) atualizados com revisão do dono; nada publicado sem ele pedir.

Nada de assets, ícones, fonte SF Pro ou marcas da Apple; o nome na tela é "Nova".

## Decisões do dono depois do protótipo (2026-11-01)

- Tema: continua claro de dia, escuro à noite (o dono olhou o protótipo no modo Noite).
- Fonte: **Inter** (a que o app já embute), não a do sistema.
- **Cotações (BTC, ETH) saem da tela Nova** (continuam só na Clássica, se ligadas). No lugar, no topo ao lado das
  abas, uma linha de **informações da TV**: cidade configurada (sem GPS nem geolocalização por IP), temperatura em °C
  (o clima que o app já busca), resolução atual da tela (modo de exibição do Android, ex. "4K · 60 Hz"; aproximada no
  web) e **velocidade da internet por teste**.
- **Teste de velocidade:** servidor da **Cloudflare** (`speed.cloudflare.com`, sem chave), **só quando o dono pedir**
  (OK na informação; ~10 s; nunca sozinho). O topo mostra o último resultado e quando foi. É um endereço de rede novo:
  aprovado pelo dono nesta data; precisa entrar na lista de endereços do CLAUDE.md e do README (card próprio, 215).
- **Faixa de destaque com as duas coisas juntas:** quando o app em foco tem Continuar assistindo e picks, o carrossel
  mostra primeiro os itens de Continuar assistindo daquele app e depois as picks daquele serviço (mesmos pontinhos);
  sem nenhum dos dois, a arte do app.
- Padrões aceitos para as perguntas abertas restantes do designer: manter a pista de rolagem da fileira; sem chave e
  com o foco fora da fileira, a faixa mantém a arte do último app; "Apple TV" fica na fileira (é o nome de um app
  instalado, não a marca da tela); logo grande da arte do app = o logo recortado na TV, sem escolha app por app.

**Aprovação do dono: 2026-11-01**, direção visual e protótipo, com os ajustes acima (linha de informações no lugar das
cotações, faixa com Continuar assistindo e picks juntos, cor nova no lugar do vermelho, marca de perfil infantil).
