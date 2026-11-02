# 211 · Acessibilidade, mouse, telas 720p e traduções da aparência nova

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto ·
Fase 2 · Depende de: 210

## Objetivo

Auditar e fechar, na aparência *Nova*, o que cada card já devia manter mas que só se vê junto: TalkBack (`Spoken`:
`a11yItems`, `a11yText`, `a11yBounds`, foco e clique), mouse e air mouse (clique, roda, hover que não puxa o foco de
volta e não foca item que rolaria a fileira), as TVs que desenham a UI a 1280×720 (TCL de 1 GB:
`ro.surface_flinger.max_graphics_width`), os textos (todos por `Ui.tr`/`trf`/`plural` e no web `tr`/`trf`), e o
Magic Remote do LG no web.

## O que muda

- **Android:** correções em `HomeView` (acessibilidade, hover, hit-test) e no tamanho das imagens a 720p.
- **Web:** pointer do Magic Remote nas zonas novas (`web/home.js`), textos.
- Catálogos: `python3 tools/translate.py`; as línguas feitas à mão (pt, es, de, ru, th, tr) por gente, não por `--fill`.

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/HomeView.java`, `Spoken.java` (se faltar suporte a uma zona), `app/assets/i18n/*.json`.
- `web/home.js`, `web/strings.js` (só se faltar uma chave).

## Riscos

- **TalkBack** lê a tela inteira; uma zona sem limites certos prende o foco. Testar com TalkBack ligado é uma mudança
  de configuração da TV: só com o OK do usuário, e desligado no fim (ou no emulador).
- **720p:** imagens geradas a 1080p numa UI 720p gastam 2,25× a memória; o card confere que tudo segue o tamanho da UI.
- Strings novas em línguas feitas à mão ficam em inglês até alguém traduzir: aceito pelo CLAUDE.md (cai no inglês),
  mas o dono decide se espera as traduções antes do 212.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa (inclui `translate.py --check`).
2. Com TalkBack (emulador Android 11 e 14, ou a TCL com OK do usuário): todo item focável da *Nova* é anunciado com o
   texto certo e os limites certos; nenhum item inalcançável (lista do validador).
3. Com mouse no emulador: clique abre o item sob o ponteiro, roda move como as setas, hover só move o foco ao entrar
   noutro item.
4. Emulador 1280×720 (densidade da TCL de 1 GB): capturas sem imagem borrada; PSS do `:home` menor que o da 1080p.
5. `translate.py` não lista nenhuma chave nova faltando em `en.json`; faltas nas outras línguas listadas no review.
6. Protocolo M: regra por card contra o 210.

## Agentes

- **designer:** anúncios do TalkBack (texto) e o que muda a 720p, com o OK do dono.
- **desenvolvedor:** branch `feat/211`.
- **validador:** `review/211.md`.
- **testador:** critérios 2 a 4 e 6.
