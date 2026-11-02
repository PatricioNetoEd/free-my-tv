# 102 · TCL: peças de sistema no PROTECTED

**ALTO RISCO** (toca `HomeMode.PROTECTED`) · Status: aprovado pelo dono (2026-10-31); testado na TV e no main (review/102.md) · Fase 1 do Meu TV OS

## Objetivo

Blindar peças de sistema da TCL Smart TV Pro (BeyondTV4, Android 11) que hoje não estão em lista nenhuma, para que
nunca sejam desligadas: nem por uma entrada futura no `DEBLOAT`, nem por `disable_assistant`, nem pelo ▲ de Recent
Apps (`mayStop` usa `mayTurnOff`, então o `PROTECTED` também impede o force-stop por lá).

Decisão por pacote (evidência: `dumpsys package` lido na TV em 2026-10-31; nenhum deles está hoje em `DEBLOAT` ou `PROTECTED`):

| Pacote | Decisão | Evidência |
|---|---|---|
| `com.tcl.versionUpdateApp` | **PROTECTED** | Está em `/product/app/SystemUpdate`, roda no uid 1000 e tem receivers `com.tcl.ota`, `RestoreFactory`, `CompleteRestoreFactory` e `MaualUpdate`. Declara `com.tcl.permission.START_CHECK_SYSTEMUPDATE` (signature\|privileged), pedida por `MultiScreenInteraction_TV` e `assistant`, e é quem instala atualizações de apps TCL (`installerPackageName` de `com.tcl.bi`). São as atualizações da TV. |
| `com.tcl.xian.StartandroidService` | **PROTECTED** | Está em `/product/app/DeviceAuthenCommon` (autenticação do aparelho, `MyContentProvider`) e tem receiver de boot e `STR_RESUME_COMPLETED`. É consultado por `com.tcl.channelplus` (fonte de canais da TV ao vivo, já no `PROTECTED`), `com.tcl.dashboard` e `com.tcl.useragreement` (também protegidos), além de `usercenter`, `bi` e `smartalexa`. |
| `com.tcl.MultiScreenInteraction_TV` | **PROTECTED** | Está em `/product/app/nScreen_srv` (T-Cast: celular como controle e envio de mídia) e roda no uid 1000. Tem um IME (`stringinput.SoftKeyboard`, `android.view.InputMethod`) e pede `INJECT_EVENT`, ou seja, é controle remoto. Declara `com.tcl.useragreement.service.start` (signature\|privileged), que o grupo do uid 1000 usa, e `ALLCAST_PERMISSION`. |
| `com.tcl.ui_mediaCenter` | **PROTECTED** | Está em `/product/app/MediaCenter` e roda no uid 1000. Faz a mídia do USB (`MEDIA_MOUNTED`/`MEDIA_EJECT`), DLNA e a lista de gravações da TV (`PVRBrowserActivity`, `application.vnd.tcl.playlist.pvr`). Pede `HDMI_CEC`, `TCL_KEY_USAGE` e `MODIFY_AUDIO_ROUTING`. Equivale ao `com.mediatek.wwtv.mediaplayer`, que já é protegido. |
| `com.tcl.assistant` | **PROTECTED** | Está em `/product/app/google_assistant` e roda no uid 1000. Recebe o toque longo de voz do controle (`LongPressVoiceReceiver`, `com.tcl.framework.custom.longpress.voice`) e controla o LED do microfone (`LedServiceReceiver`), além de `VoiceService`, `TvControlService`, `SettingsControllerService` e `MediaControllerService`. É o microfone do controle. |

Nenhum dos cinco pede `TV_INPUT_HARDWARE` por conta própria (todos zero na seção `requested permissions`). Ou seja,
`neededByTv` não seguraria esses pacotes, e é justamente por isso que eles precisam estar no `PROTECTED`.

Fora do escopo (pode virar outro card): `com.tcl.assistant`, `ui_mediaCenter` e `MultiScreenInteraction_TV` têm
`LEANBACK_LAUNCHER` e aparecem em All Apps. Escondê-los (`HomeApps.HIDDEN`) é uma decisão de interface, não de segurança.

## Plataformas

Android TV / Google TV (só o APK). Nada em `web/`.

## Arquivos

- `app/src/io/freemytv/HomeMode.java`: os cinco pacotes no `PROTECTED`, junto do bloco "TCL on Google TV (C825,
  Android 11)" ou num bloco novo "TCL Smart TV Pro (BeyondTV4, Realtek RTD2880, Android 11)", com comentário curto
  por linha: updates, device authentication, T-Cast remote and keyboard, USB/DLNA/PVR player, voice and mic LED.
- Só acréscimos: nenhuma entrada sai do `PROTECTED`, e `DEBLOAT`, `Adb.java`, `Watchdog.java` e o *Original* não mudam.

## Riscos

1. **Funcional baixo:** pôr pacote no `PROTECTED` só impede que ele seja desligado ou parado. Nesta TV nenhum dos
   cinco é alvo hoje, então o modo Free My TV não muda.
2. **Erro de digitação** (`MultiScreenInteraction_TV`, `versionUpdateApp`, `StartandroidService` misturam maiúsculas
   e minúsculas): um nome errado não protege nada e não dá erro nenhum. O validador confere cada nome contra `pm list packages`.
3. **Efeito em Recent Apps:** a partir daqui não se fecha mais o T-Cast, o Media Center nem o assistente TCL pelo ▲.
   É o que se quer.
4. É ALTO RISCO pela regra (toca `PROTECTED`), mesmo sendo uma mudança só de proteção.

## Critério de pronto (mensurável)

1. `./build.sh` termina com `Built FreeMyTV.apk`; `tools/check.sh` passa.
2. `git diff main...feat/102 -- app/src/io/freemytv/HomeMode.java` tem exatamente 5 nomes novos dentro do
   `PROTECTED` e 0 linhas removidas no `DEBLOAT` e no `PROTECTED`.
3. Os 5 nomes do diff aparecem iguais, letra por letra, em `adb shell pm list packages -s` da TV (leitura).
4. Na TV, depois da troca para Free My TV feita pelo usuário: `pm list packages -d` não lista nenhum dos 5. Voz pelo
   controle, mídia do USB e TV ao vivo funcionam, e as atualizações do sistema abrem em Configurações.
5. Em Recent Apps, com Media Center ou T-Cast aberto, o cartão não oferece fechar (▲).
6. Volta para *Original* feita pelo usuário: `pm list packages -d` igual ao de antes da troca.

## Agentes

- **desenvolvedor:** as 5 linhas na branch `feat/102`. Por ser ALTO RISCO, para antes de compilar e pede o validador.
- **validador:** confere que só houve acréscimos ao `PROTECTED`, nomes letra por letra e nada mais tocado, e escreve `review/102.md`.
- **testador:** itens 3 a 6, com o OK do usuário antes de qualquer comando que altere a TV.
- designer: não participa.
