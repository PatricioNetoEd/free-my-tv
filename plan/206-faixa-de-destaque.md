# 206 · Faixa de destaque no topo (imagem grande e nítida)

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto ·
Fase 2 · Depende de: 203 (pode vir antes do 204/205 se o dono preferir ver a faixa cedo)

## Objetivo

Na aparência *Nova*, a metade de cima da tela vira a faixa de destaque: a imagem **nítida** da pick em foco ocupando
a largura toda (hoje o fundo é a foto borrada e quase branca, e as picks são 3 cards), um degradê para o texto ler
bem, o título, uma linha de metadados e o logo do serviço onde assistir. ↑ a partir da fileira de apps entra na faixa e
←/→ passa pelas picks (um carrossel); OK abre como hoje (`Recs.Pick.link` ou o app). Sem picks (sem chave TMDB): uma das
suas fotos (`Photos`) e, sem fotos, a aurora (`Scene`). Este card mostra as picks gerais; o 207 faz a faixa seguir o
app em foco.

## O que muda

- **Android:** `HomeView` ganha o desenho da faixa (aparência *Nova*); `Backdrop`/`Recs` fornecem a imagem nítida no
  tamanho da UI (TMDB `w1280`, o mesmo que já se baixa em TVs 720p, então **nenhum endpoint novo**), decodificada fora da
  thread de UI (`LOADER`), `RGB_565` em `Ui.LEGACY`, no máximo 2 imagens grandes vivas (a atual e a da transição), as
  outras liberadas. O degradê de legibilidade é um `Shader` feito uma vez por tamanho. Transição por opacidade.
  Visual noturno com os tokens de noite.
- **Web:** dois `<div>` sobrepostos com `background-image`, crossfade por `opacity`; imagem `w1280` em TVs normais e
  `w780` em `lite`; degradê como `linear-gradient` estático (sem animar). Os 3 cards da aparência clássica não aparecem
  na *Nova*.

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/HomeView.java` (faixa, zona de foco nova ou a `Z_CARDS` reaproveitada), `Backdrop.java` (imagem
  nítida no tamanho da UI), `Recs.java` só se precisar expor um tamanho já baixado (sem nova chamada de rede).
- `web/home.js` (`renderCards`/`backdrop` na aparência *Nova*), `web/home.css`, `web/data.js` só para o tamanho da
  imagem.

## Riscos

- **Memória (TCL 2 GB):** uma imagem 1280×720 custa 3,7 MB em ARGB ou 1,8 MB em `RGB_565`; duas na transição. Mais a
  textura na GPU (o Realtek não informa Graphics no meminfo: olhar `MemAvailable`).
- **Engasgo ao trocar de imagem (LEGACY):** a decodificação vai para o `LOADER`, mas o envio da textura para a GPU
  acontece no primeiro desenho; usar `Bitmap.prepareToDraw()` e só trocar depois que a imagem estiver pronta.
- **Legibilidade:** título branco sobre foto clara; o degradê do card 200 garante ≥ 4,5:1 na área do texto.
- **TVs antigas:** decodificar JPEG de 1280 no Tizen 2.4 pode travar a página; `lite` usa `w780`. Tizen 2.3/2.4 não
  confia na raiz da Let's Encrypt: as imagens do TMDB já funcionam lá hoje, conferir que nada novo passa a usar outro
  domínio.
- O protetor de tela (`DreamView`) usa as mesmas picks e imagens: não pode perder as que ele espera em disco.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança.
2. TCL, protocolo M (R30 com ←/→ pela faixa): PSS ≤ +8 MB contra o card anterior (meta do designer: ≤ +6 MB), travados
   ≤ +1,5 ponto, frio ≤ +100 ms, tetos respeitados. Nenhum quadro acima de 100 ms na troca de imagem (p99 do gfxinfo ≤
   69 ms, o do launcherx).
3. Andar pelas 10 primeiras picks e voltar 5 vezes: PSS não cresce mais de 2 MB (nenhum bitmap preso).
4. Nenhuma chamada de rede nova (o validador confere as URLs no diff: só `image.tmdb.org`, já usado).
5. Sem chave TMDB: a faixa mostra uma foto sua ou a aurora, sem buraco nem texto vazio (captura).
6. M4: metas web; com `lite`, a imagem é `w780` (aba Network do preview).

## Agentes

- **designer (primeiro):** altura, degradê, tipografia, carrossel e estado sem picks, aprovados pelo dono.
- **desenvolvedor:** branch `feat/206`.
- **validador:** `review/206.md`.
- **testador:** M1 a M4, critérios 3 e 5.
