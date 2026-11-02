# 202 · Interruptor de aparência, área segura e tipografia tvOS

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: aprovado pelo dono (2026-11-01) ·
Fase 2 · Depende de: 200 aprovado, 201 medido

## Objetivo

Criar a chave que deixa toda a fase reversível na própria TV, sem reinstalar: *Home Settings → Aparência*:
**Clássica** (padrão, a tela de hoje, sem mudança nenhuma) ou **Nova** (a tvOS). Com *Nova*, já entram a área segura,
a grade e a escala tipográfica do card 200 nos elementos que existem hoje (título, abas, relógio, botões, prateleira),
sem mudar ainda tiles, foco ou faixa. Os cards 203 a 211 só desenham dentro de *Nova*.

O nome na tela é "Nova" (ou o que o designer propuser), **nunca "tvOS"** nem outra marca da Apple.

## O que muda

- **Android:** `Prefs` ganha a aparência (`classic`/`new`, padrão `classic`); `SettingsActivity` ganha a linha em Home
  Settings; `HomeView` lê a aparência no layout (`onSizeChanged`/troca de `Ui.generation`), nunca em `onDraw`, e troca
  um conjunto de medidas (margem, posições, tamanhos de texto) pré-calculado. A troca vale ao voltar para a tela
  inicial, sem reiniciar o processo. `ScreensaverAlone` (processo principal, Android 11 a 12L: o caso desta TCL) não
  usa a aparência neste card.
- **Web:** `Prefs` (localStorage) ganha a aparência, `settingRows()` em `web/home.js` ganha a linha, e o `<body>` recebe
  a classe `look-new`; `web/home.css` traz as regras novas só sob `.look-new` (sem CSS variables).
- **Textos novos** ("Appearance", "Classic", "New"): `python3 tools/translate.py` e tradução em todos os catálogos.
  Português, espanhol, alemão, russo, tailandês e turco são à mão (CLAUDE.md): o desenvolvedor não usa `--fill`
  nelas.

## Plataformas

Google TV / Android TV e LG/Samsung (`web/`).

## Arquivos

- `app/src/io/freemytv/Prefs.java`, `SettingsActivity.java`, `HomeView.java` (constantes de layout por aparência).
- `web/home.js` (`settingRows`, `Prefs` de `web/data.js` ou onde o `Prefs` web mora), `web/home.css`.
- `app/assets/i18n/*.json` (via `tools/translate.py`).

## Riscos

- **Desempenho TCL (Android 11, 2 GB, LEGACY):** nenhum custo por quadro se as medidas forem pré-calculadas; o risco é
  ler `Prefs` ou alocar no `onDraw`. Medida extra: nenhuma, só o protocolo M.
- **TVs antigas (webOS 3, Tizen 2.4):** só regras de CSS estáticas; trocar a classe do `<body>` força um relayout
  completo uma vez (aceitável, só na troca).
- **Clássica tem que ficar idêntica:** a maior armadilha é mudar uma constante compartilhada. No web, capturas do preview
  antes/depois; no Android, `screencap` de antes/depois com *Clássica*.
- **Tamanho do `HomeView` (≈ 5 mil linhas):** duas aparências aumentam o arquivo. O designer e o desenvolvedor
  combinam extrair as medidas para uma classe pequena (por exemplo `HomeLayout`), sem mudar comportamento.
- TalkBack e mouse usam as mesmas posições (`a11yBounds`, hover): devem seguir as medidas novas.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa (build Android, `translate.py --check`, pacotes LG e Samsung, ES5 e CSS).
2. Com *Clássica*: captura do preview web idêntica pixel a pixel à de antes do card; captura da TCL sem diferença visível
   (o validador compara lado a lado).
3. Com *Nova*: todo texto da tela ≥ 24 px a 1080p e todo elemento dentro da área segura do card 200 (o validador mede
   na captura).
4. Trocar a aparência e voltar para a tela inicial aplica a mudança em ≤ 1 s, sem reiniciar o app (`pidof
   io.freemytv:home` igual antes e depois).
5. Protocolo M (card 201), aparência *Nova*: dentro da regra por card (≤ +8 MB, ≤ +1,5 ponto, ≤ +100 ms a frio contra o
   201) e abaixo dos tetos (150 MB, 10%, 1.200 ms). M4 dentro das metas web.
6. Nenhuma alocação nova dentro de `onDraw`/`draw*` (o validador procura `new ` nesses métodos no diff).

## Agentes

- **designer (primeiro):** recorte do protótipo do 200 para este card (medidas e tipografia da *Nova*), com o OK do dono.
- **desenvolvedor:** Android e web, na branch `feat/202`.
- **validador:** critérios 1 a 3 e 6, revisão de traduções, `review/202.md`.
- **testador:** critérios 2, 4 e 5 na TCL e M4 no preview.
