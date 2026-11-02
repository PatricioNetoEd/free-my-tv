# 213 · (Opcional) Protetor de tela alinhado à aparência nova

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto,
**opcional, só se o dono disser sim à pergunta 8 do card 200** · Fase 2 · Depende de: 212

## Objetivo

Levar os tokens da aparência nova (tipografia do relógio, degradê de legibilidade, posição dentro da área segura) ao
protetor de tela (`DreamView`) e ao do web. **Sem** vídeos aéreos nem qualquer imagem da Apple: continuam as picks e as
suas fotos.

## O que muda

- **Android:** `DreamView` (desenho), usado por `Screensaver` (processo `:home`, Android 8-10 e 13+) e
  `ScreensaverAlone` (processo principal, Android 11 a 12L, **o caso da TCL**).
- **Web:** o protetor de tela de `web/home.js`/`web/home.css`.

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/DreamView.java` (só desenho). `ScreensaverAlone.java`, `Screensaver.java` e `res/values-v30`,
  `values-v31`, `values-v33` **não** mudam (CLAUDE.md: manter os dois em passo).
- `web/home.js`, `web/home.css`.

## Riscos

- **`ScreensaverAlone` roda no processo principal**, o mesmo dos `ModeJob` (troca de modo, verificação de boot). Uma
  exceção ali derruba esse processo; nenhuma mudança fora do desenho e todo carregamento com `try/catch`, como hoje.
- Memória: o protetor já carrega picks em disco; nada de imagens maiores que as de hoje.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa.
2. Na TCL, o protetor abre (o testador espera o tempo da TV ou usa o atalho do Android para iniciar o protetor, com o OK
   do usuário) e fecha num toque, 5 vezes, sem `FATAL` no `adb logcat -b crash` lido depois.
3. Captura com o relógio novo dentro da área segura; nenhuma imagem da Apple.
4. PSS do processo do protetor não cresce mais de 3 MB contra o de antes.

## Agentes

- **designer (primeiro):** estilo do protetor, com o OK do dono.
- **desenvolvedor:** branch `feat/213`.
- **validador:** `review/213.md`.
- **testador:** critérios 2 a 4.
