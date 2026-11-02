# Linha de base: TCL Smart TV Pro (launcher de fábrica)

Fase 0 do Meu TV OS. Medido em 2026-10-31, em São Paulo, sem alterar nenhuma configuração da TV.

## Aparelho

| Item | Valor |
|---|---|
| Marca / modelo | TCL `Smart TV Pro` (device `BeyondTV4`, product `G03_4K_GB`) |
| Android | 11 (SDK 30), build `RP1A.200622.001` |
| Fingerprint | `TCL/G03_4K_GB/BeyondTV4:11/RP1A.200622.001/AR09:user/release-keys` |
| Plataforma | `rtd288o` (Realtek RTD2880) |
| RAM | 2 GB (`ro.config.low_ram=false`) |
| UI | 1920x1080, densidade 320, painel 4K; sem `max_graphics_*` (não é UI 720p) |
| Casos conhecidos | o mesmo aparelho de #264 e #277 (TGuard `com.tcl.guard` presente); TCL Android 11, sem serviço de teclas (#325) |

## Launcher e protetor de tela atuais

- Atividades HOME: `com.google.android.apps.tv.launcherx/.home.HomeActivity` (prio 2),
  `com.google.android.tungsten.setupwraith/.RecoveryActivity` (prio 1), `com.android.tv.settings/.system.FallbackHome` (prio -1000).
- `cmd role get-role-holders` não existe neste Android 11.
- Protetor de tela: `com.google.android.apps.tv.dreamx/.service.Backdrop`.
- Serviços de acessibilidade ligados: nenhum (`null`).

## Pacotes

- 129 do sistema, 10 instalados pelo usuário, 2 já desligados (`au.com.stan.and`, `tv.wuaki.apptv`).
- **Já em `DEBLOAT`:**
  - `com.google.android.play.games`
  - `com.google.android.youtube.tvmusic`
  - `com.tcl.miracast`
  - `com.tcl.messagebox`
  - `com.tcl.usercenter`
  - `com.tcl.esticker`
  - `com.tcl.ocean.instructions`
  - `com.tcl.logkit`
- **Candidatos a `DEBLOAT` (a confirmar):**
  - `com.tcl.bi` (provável telemetria)
  - `com.tcl.overseasappshow` (provável vitrine)
- **Candidatos a `PROTECTED`:**
  - `com.tcl.versionUpdateApp` (atualização)
  - `com.tcl.xian.StartandroidService`
  - a avaliar: `com.tcl.MultiScreenInteraction_TV`, `com.tcl.ui_mediaCenter`, `com.tcl.assistant`
- **Fora da `SHELF`:**
  - Claro tv+ (`br.com.claro.now.smarttvclient`)
  - discovery+ (`com.discovery.discoveryplus.androidtv`)
- **Instalados pelo usuário:**
  - Claro tv+
  - Apple TV
  - Paramount+ (`com.cbs.ca`)
  - discovery+
  - Disney+
  - Star+
  - Globoplay
  - Spotify
  - Max
  - `com.tcl.notereminder`

## Memória e CPU (tela inicial em frente, parada)

| Medida | Valor |
|---|---|
| launcherx: TOTAL PSS | 193.952 KB (~189 MB) |
| launcherx: TOTAL RSS | 270.132 KB |
| launcherx: Java / Native heap | 54.764 / 54.048 KB |
| launcherx: Graphics/GL | 0 (o driver Realtek não informa) |
| Sistema: RAM usada / livre | 1.972.600 / 124.552 KB |
| Swap usada | 435 MB de 1 GB |
| CPU em repouso | katniss:interactor 40%, launcherx:coreservices 17,1%, system_server 17,1%, launcherx 11,4% |

## Fluidez (`dumpsys gfxinfo` do launcherx)

A janela tem ~135 s, do reset à leitura, com ~30 s de navegação pelo controle no meio.

| Medida | Valor |
|---|---|
| Quadros / travados | 4.351 / 676 (15,54%) |
| Tempo do quadro p50 / p90 / p95 / p99 | 9 / 20 / 27 / 69 ms |
| GPU p50 / p90 / p95 / p99 | 7 / 12 / 13 / 17 ms |
| Missed Vsync / High input latency / Slow UI thread | 26 / 3.280 / 73 |
| Slow bitmap / Slow draw / Frame deadline missed | 4 / 49 / 96 |

Para comparar: o acumulado desde o boot, antes do reset, era 18,84% de quadros travados, com p99 de 113 ms.

## Abertura da tela inicial (`am start -W` da HOME, vindo de Configurações)

| Situação | Rodadas | Mediana |
|---|---|---|
| Quente (HOT, launcher na memória) | 55, 30 ms (WaitTime) | ~43 ms |
| A frio (COLD, depois de `am force-stop`) | 1.333, 1.453, 1.712 ms (TotalTime) | **1.453 ms** |

O `am start -W` mede até a atividade aparecer. O carregamento das imagens das fileiras vem depois e não entra nesses números.

## Como repetir a medida no Meu TV OS

1. `dumpsys meminfo <pacote>` e `top -b -n 1 -m 15` com a tela inicial parada.
2. `dumpsys gfxinfo <pacote> reset`, navegar 30 s com o controle e ler `dumpsys gfxinfo <pacote>` logo em seguida.
3. Abertura: abrir Configurações, rodar `am start -W` da HOME (quente) e, para a frio, `am force-stop <pacote>` antes. Três rodadas de cada.
