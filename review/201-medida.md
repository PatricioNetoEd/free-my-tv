# 201 · Medida do Free My TV de hoje (aparência Clássica) — 2026-10-31

TCL Smart TV Pro (BeyondTV4, Android 11, 2 GB, `Ui.LEGACY`), APK do card 103 (main `8213b9b`), modo Free My TV,
sem chave TMDB (sem picks: a memória deve subir quando houver). Comandos aprovados pelo dono; ele fez o controle.
Saídas em `m201/` no scratchpad da sessão.

| Medida | launcherx de fábrica | Free My TV (Clássica) | Meta final |
|---|---|---|---|
| M1 memória `:home` (TOTAL PSS, mediana de 3) | ~189 MB (193.952 KB) | **~50 MB** (52.286 / 49.978 / 48.136 KB; swap PSS ~9,7 MB; Java ~5,3 MB, Native ~25,7 MB) | ≤ 130 MB |
| M2 quadros travados em R30 (mediana de 3) | 15,54% | **0,26%** (0,26 / 11,95 / 0,24%) | ≤ 8% |
| M2 p50/p90/p95/p99 (rodada mediana) | 9/20/27/69 ms | **6/9/10/11 ms** (rodada 2: 7/17/19/23) | p95 ≤ 22 ms |
| M3 abertura a quente (HOT) | ~43 ms | **80 e 84 ms** (2 válidas; 2 tentativas inválidas: home já em frente) | — |
| M3 abertura a frio | 1.453 ms | **não medida de forma comparável** (ver abaixo) | ≤ 1.000 ms |
| Abertura depois do boot (nova) | — | **~3,4 s** até `onResume`, ~3,8 s até o 1º quadro (`START` 52,06 → `onResume` 55,47) | comparar só entre cards |

MemAvailable da TV com o Free My TV em frente: ~430 MB.

## Correções de método (para o card 201 e os seguintes)

- **M2:** `dumpsys gfxinfo io.freemytv` só mostra o processo principal; a tela inicial está em `:home`. Usar o pid:
  `P=$(adb shell pidof io.freemytv:home)`, `dumpsys gfxinfo $P reset` e `dumpsys gfxinfo $P`. (A 1ª rodada se perdeu por isso.)
- **M3 a frio:** `am kill io.freemytv` **não derruba** `:home` quando o Free My TV é a tela inicial (o processo HOME
  não é "cached"), mesmo com Configurações da TV em frente. `force-stop` segue proibido (cancela os jobs). No boot, o
  Android não grava `Displayed` para a HOME; o tempo sai de `logcat -b events` (`wm_create_activity` → `wm_on_resume_called`)
  e `logcat` (`START ... HomeActivity`), mas o boot é carregado e não se compara com o 1.453 ms do launcherx.
  Método a frio comparável: **decisão pendente** (validador/planejador). Até lá, M3 = quente + "depois do boot".
- **M3 a quente:** confirmar `mResumedActivity` = `com.android.tv.settings/.MainSettings` antes; o Home Settings do
  Free My TV (`io.freemytv/.SettingsActivity`) é do próprio app.
- **M4 web:** pendente; fazer no preview quando o protótipo do card 200 estiver pronto.

## Complemento — 2026-11-02 (teste do 214a)

Com a chave TMDB (picks ligadas), Clássica com 9 apps, depois de aquecer: `:home` ~84 MB (sem chave ~68 MB). As
próximas medidas da fase devem dizer se há chave; a meta final (≤ 130 MB) vale com a chave.
