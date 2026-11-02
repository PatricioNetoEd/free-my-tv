# 101 · TCL: telemetria e vitrine no DEBLOAT

**ALTO RISCO** (toca `HomeMode.DEBLOAT`) · **Status: aprovado pelo dono (2026-10-31), corrigido após a
revisão 2; aguardando a revisão 3 do card antes do teste na TV** · Fase 1 do Meu TV OS

Histórico:

- **Revisão 1** (`review/101.md`, 3 bloqueantes): evidência por processo (seção "Evidência de quem usa o
  `com.tcl.bi`"), escopo de modelos com o risco aceito pelo dono ("Aprovação do dono e escopo") e plano de resgate com
  critério de parada ("Antes do teste", "Critérios de parada", "Resgate").
- **Revisão 2** (`review/101.md`, "Revisão 2 — 2026-10-31", reprovado: bloqueantes A, B e C, só no card). Esta versão
  responde a cada item:
  - A (o boot seguinte desfaz o resgate 2): "Resgate", passo 2, item 2.1 (`adb uninstall io.freemytv` antes de
    qualquer `pm enable`) e a alternativa documentada (não reiniciar até o *Original* rodar).
  - B (ordem do `setupwraith`): "Resgate", passo 2, itens 2.3 a 2.7, na ordem de `applyOriginal` e do guia
    (`guias/tcl-smart-tv-pro.md`, passo 16, branch `feat/104`), com a conferência da HOME antes de reiniciar.
  - C (adb da 5555 no reinício de referência): "Antes do teste", passo 3 (sem `boot ok` em 5 min, o teste não começa).
  - Não bloqueante 1 (`logcat -b crash` inicial): "Antes do teste", passo 2, e "Critérios de parada" (compara com a
    linha de base).
  - Não bloqueante 2 (pid → nome): "Critérios de parada", último item, e R7 (`ps -A -o PID,NAME`).
  - Não bloqueante 3 (`grep -m1`): "Antes do teste", passo 2, "Resgate", passo 2, e critério de pronto, item 4.
  - Não bloqueante 4 (reinício do passo 3): "Antes do teste", passo 3, marcado **[Ação do usuário na TV]**.
  - Não bloqueante 5 (reset de fábrica): "Resgate", passo 3, último recurso (decisão exclusiva do usuário).

## Objetivo

Desligar no modo Free My TV a telemetria da TCL que roda no boot, sem tocar em imagem, som, entradas, controle ou
Wi-Fi, e com o modo *Original* trazendo tudo de volta.

Decisão por pacote (evidência: `dumpsys package` lido na TV em 2026-10-31):

| Pacote | Decisão | Evidência |
|---|---|---|
| `com.tcl.bi` | **Entra no DEBLOAT** | uid próprio 10059 (sem `sharedUserId`), `/product/app/TCL_ALL_BI` atualizado por `com.tcl.versionUpdateApp`; só `BIService` (`com.tcl.ttvs.bi.services.START`) e `ParamProvider`, nenhuma activity; pede `INTERNET`, `READ_LOGS`, `GET_TASKS`/`REAL_GET_TASKS`, `RECEIVE_BOOT_COMPLETED`, `ACCESS_WIFI_STATE`: é coleta de uso. Não pede `CHANGE_WIFI_STATE` (não pode salvar rede: não é dono de Wi-Fi) nem `TV_INPUT_HARDWARE`, e não tem `TV_INPUT_BUTTON`/`CONNECT_INPUT`/`AddAccessory` (`neededByTv` não o segura). |
| `com.tcl.overseasappshow` | **Rejeitado por ora** (nem DEBLOAT nem PROTECTED: fica como está) | É vitrine (consulta Netflix, Prime, YouTube, Globoplay, Stan, Wuaki, Play Games; receivers de boot, `STR_RESUME_COMPLETED`, `countrychange`, rede e `PACKAGE_CHANGED`), mas roda em `sharedUserId=android.uid.system` (uid 1000), o mesmo de `com.android.tv.settings`. |

### Por que `overseasappshow` fica de fora

- `wifiOwners` compara o `cname` das redes salvas com nomes de pacote. Redes salvas por um app do uid 1000 (como as
  Configurações da TV) levam o nome do uid compartilhado, não o do pacote, então o código não consegue dizer se esse
  pacote "é dono" de alguma rede. Não dá para provar, só com `dumpsys package`, que desligá-lo deixa as redes em paz.
- `neededByTv` lê só as permissões que o próprio pacote pede, de propósito. Mas o processo roda com tudo o que o uid
  1000 tem (`TV_INPUT_HARDWARE`, `NETWORK_SETTINGS`, `MASTER_CLEAR`, `CHANGE_COMPONENT_ENABLED_STATE`), então o
  filtro passaria o pacote sem saber o que ele faz por baixo.
- O ganho é pequeno: no modo Free My TV o launcherx (onde a vitrine aparece) já fica desligado.
- Pode voltar num card próprio, com `dumpsys wifi` (só leitura, com o OK do usuário) mostrando nenhum `cname` do uid
  1000 e um teste de ida e volta dedicado.

## Evidência de quem usa o `com.tcl.bi` (bloqueante 1)

Leituras novas, só leitura, feitas com o OK do usuário em 2026-10-31, com a TV ligada havia cerca de 1h11min
(`dumpsys activity providers` e `dumpsys activity services`; arquivos `bi-providers.txt` e `bi-services.txt` no
scratchpad da sessão, ao lado de `dumpsys-com.tcl.bi.txt`):

| O que | Resultado |
|---|---|
| Provider publicado | Só `com.tcl.bi/com.tcl.ttvs.bi.provider.ParamProvider`, authority `com.tcl.ttvs.bi.param`, no processo `com.tcl.bi.persistent` (pid 1601, uid 10059). |
| Clientes do provider | **Nenhum.** O registro não tem bloco `Connections:` (o `SettingsProvider`, na mesma leitura, lista os seus, entre eles `com.tcl.tv`, `com.tcl.guard` e o próprio `com.tcl.bi.persistent`). Nem `com.tcl.tv`, `com.tcl.tvinput`, `com.tcl.tcl_bt_rcu_service`, `com.tcl.micmanager` nem `system_server` estavam ligados a ele. |
| Outros providers do pacote | `com.tcl.bi.param` e `UtilsFileProvider` (`com.tcl.bi.utils.common.provider`) não estavam publicados: ninguém os tinha pedido nesse processo. |
| Serviço | Só `com.tcl.ttvs.oversea.usagest.core.service.BackgroundTaskService` ativo, em primeiro plano (`isForeground=true`), `recentCallingPackage=com.tcl.bi`, `createdFromFg=true`, sem nenhum bind de outro app. O nome (`oversea.usagest`) confirma coleta de uso. |
| Instalação | `baseDir` em `/data/app/...com.tcl.bi-.../base.apk`: app de sistema atualizado (confere com `UPDATED_SYSTEM_APP`). |

**Ressalvas (por que não é prova definitiva):**

- `ContentResolver.call()` e `query()` curtos não deixam conexão aberta: um cliente que consulta e fecha não aparece
  em `Connections:`. A leitura mostra que ninguém **mantém** o provider, não que ninguém o consulte.
- `lastStartId=28`: o serviço recebeu 28 `startService` desde o boot, e `recentCallingPackage` mostra só o último.
  Pode haver outros que o iniciam de tempos em tempos.
- Não ficou registrado se HDMI e TV ao vivo tinham sido abertos antes da leitura (o processo `com.tcl.tv` estava vivo).

Por isso o teste fecha a lacuna com duas medidas: a leitura repetida depois de abrir HDMI e TV ao vivo ("Antes do
teste", passo 4) e, depois da ida, o logcat de quem procura o provider que sumiu (regressão, item R7). Um
`Failed to find provider info for com.tcl.ttvs.bi.param` (ou `com.tcl.bi.param`) num processo só registra quem
consulta; reprova se esse processo cair ou se a função dele falhar.

## Aprovação do dono e escopo (bloqueante 3)

- **Decisão do dono (usuário), 2026-10-31:** aprovou este card e **aceita o risco** de a linha valer para todas as
  TVs TCL, com evidência e teste só nesta.
- **Escopo real:** `com.tcl.bi` está no bloco `// TCL` geral do `DEBLOAT`, então vale para **toda TV TCL que tiver
  `com.tcl.bi`** (a C825 de Google TV e outras), não só para esta.
- **Evidência e teste:** só a TCL Smart TV Pro (device `BeyondTV4`, product `G03_4K_GB`, Realtek RTD2880, Android 11,
  build `RP1A.200622.001`).
- Consequência aceita: num modelo TCL não testado, um cliente do provider que não trate a ausência dele pode falhar.
  O caminho de volta é o mesmo daqui (*Original* religa `com.tcl.bi`; ver "Resgate"). Se aparecer relato de outro
  modelo com problema, a linha sai do `DEBLOAT` ou passa a valer só por modelo, num card novo.

## Plataformas

Android TV / Google TV (só o APK). Nada em `web/`, `webos/` ou `tizen/`.

## Arquivos

- `app/src/io/freemytv/HomeMode.java`: uma linha no bloco `// TCL` de `DEBLOAT`, com comentário curto
  ("telemetria (BI): só serviço e provider, sem tela"). Já feito em `feat/101` (commit `3daf55e`, linha 121).
- `README.md` (linha 266, "on TCL TVs, messages, store demo…"): incluir "telemetry". Já feito em `feat/101`.
- Sem mudança em `PROTECTED`, `mayTurnOff`, `neededByTv`, `wifiOwners`, `Adb.java`, `Watchdog.java` nem no caminho do *Original*.

## Riscos

1. **Provider consultado por peças do sistema.** Em "queryable via interaction" o `com.tcl.bi` aparece ligado a todo o
   grupo do uid 1000 (inclusive `com.tcl.tv`, `com.tcl.tvinput`, `com.tcl.settings`, `com.tcl.tcl_bt_rcu_service`,
   `com.tcl.micmanager`, `com.tcl.guard`) e a `com.tcl.usercenter`, `com.tcl.notereminder` e
   `com.tcl.xian.StartandroidService`. A lista é por uid; a leitura por processo (acima) não achou nenhum cliente
   ligado, mas não pega consultas curtas. Com o pacote desligado, `query()` devolve `null` e `ContentResolver.call()`
   lança `IllegalArgumentException`. O pior caso é um processo persistente (ou o `system_server`) cair em laço no
   boot, antes do `ModeJob` e do watchdog: por isso o resgate 3 abaixo. O watchdog só cobre a nossa tela inicial,
   não um processo da TCL.
2. **Pacote do sistema atualizado** (`UPDATED_SYSTEM_APP`, 2.08.00 sobre 2.05.00): `pm disable-user` mantém a
   atualização e `pm enable` volta para ela. Não desinstalar nem limpar dados (regra do CLAUDE.md).
3. **`versionUpdateApp` é quem instala o `bi`:** pode tentar reinstalar ou reativar. Na verificação após reboot,
   conferir que ele continua desligado.
4. **TGuard (#277)** pode matar o `ModeJob` na medição. Isso é um problema de execução, não do card: esperar 1 a 2 min
   e conferir de novo.
5. **Outros modelos TCL** (ver "Aprovação do dono e escopo"): risco aceito pelo dono.

## APK de teste: 102 junto com 101

O card 102 (`PROTECTED`, aprovado em `review/102.md`) protege `versionUpdateApp`, `StartandroidService`,
`MultiScreenInteraction_TV`, `ui_mediaCenter` e `assistant`. O APK de teste deve conter **102 + 101**, para que a
regressão valha para o que vai para a `main` e para que a ida já rode com essas peças protegidas.

Sugestão (decisão do orquestrador): uma branch de teste, por exemplo `test/101-102`, criada a partir da `main`, com
`feat/102` e depois `feat/101` (o `git merge-tree` de `feat/102` com `feat/101` não dá conflito: as linhas são
121 e 157-162 de `HomeMode.java`). `./build.sh` e `tools/check.sh` nela; esse APK é o único instalado no teste. Se o
orquestrador preferir instalar o 102 antes e testar o 101 em cima, vale o mesmo roteiro, desde que o APK final
tenha os dois. Assinar com a mesma chave do que já está na TV (senão Android recusa o update).

## Roteiro do teste na TV

Convenção: **[Só leitura]** pode rodar sem alterar nada; **[Altera a TV: peça OK]** só roda depois de o usuário
dizer OK naquela hora; **[Ação do usuário na TV]** é o usuário quem faz, no controle, depois de avisado. A troca de
modo é sempre o usuário na TV, nunca do computador. `<IP>` é o da TV.

### Antes do teste

1. **[Só leitura]** adb responde na 5555: `adb connect <IP>:5555` e `adb -s <IP>:5555 shell getprop sys.boot_completed`
   deve dar `1`. Se não responder, o teste não começa (sem adb não há resgate 2).
2. **[Só leitura]** Anotar o estado, guardando a saída em arquivo:
   - `adb shell pm list packages -d` → hoje exatamente `au.com.stan.and` e `tv.wuaki.apptv`;
   - `adb shell dumpsys package com.tcl.bi | grep -m1 "User 0:"` → `enabled=0` (app de sistema atualizado: o
     `dumpsys` pode trazer dois blocos; vale a primeira linha);
   - `adb shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME`
     → `com.google.android.apps.tv.launcherx/.home.HomeActivity`;
   - `adb shell settings get secure screensaver_components` → `com.google.android.apps.tv.dreamx/.service.Backdrop`;
   - com o OK do usuário (lê as redes salvas): `adb shell dumpsys wifi`, só o número de redes e os `cname`;
   - `adb logcat -b crash -d > crash-inicial.txt` (linha de base: o buffer de crash não é filtrado por hora, e um
     `FATAL EXCEPTION` antigo de `com.tcl.*` não pode parar o teste à toa).
3. **Reinício de referência, antes de qualquer mudança** (tempo de boot T0 e adb da 5555 no boot):
   - **[Ação do usuário na TV]** avisar o usuário e pedir que ele reinicie a TV pelo menu dela (Configurações →
     Sistema → Reiniciar);
   - **[Só leitura]** no computador, o laço de "Conferir o boot" abaixo marca quantos segundos até
     `sys.boot_completed=1` (T0) e anota se o adb respondeu antes de a tela inicial aparecer;
   - **pré-condição:** se o laço não imprimir `boot ok` dentro de 5 min (o adb da 5555 não voltou sozinho), **o teste
     NÃO começa**: sem adb depois de um reinício não existe resgate 2. Nada foi mudado ainda, então não há o que
     desfazer; registrar em `review/101.md` e o card volta para o orquestrador.
4. **[Só leitura]** Repetir a evidência depois de o usuário abrir HDMI 1 e TV ao vivo e voltar:
   `adb shell dumpsys activity providers com.tcl.bi` e `adb shell dumpsys activity services com.tcl.bi`. Se algum
   `Connections:` mostrar `com.tcl.tv`, `com.tcl.tvinput`, `com.tcl.tcl_bt_rcu_service`, `com.tcl.micmanager` ou
   `system`, **o teste para aqui** e o card volta para a revisão (o `com.tcl.bi` não entra, como pede `review/101.md`).
5. **[Altera a TV: peça OK]** Instalar o APK de teste (102 + 101): `adb install -r FreeMyTV.apk`. Na TCL,
   em seguida, `adb shell "appops set io.freemytv AUTO_START allow || appops set io.freemytv APP_AUTO_START allow"`
   (CLAUDE.md, passo 6).
6. **[Só leitura]** Anotar a hora da TV (`adb shell date`) e, nas leituras seguintes, usar
   `adb logcat -d -T '<MM-DD HH:MM:SS.000>'` (não limpar o log com `logcat -c`).
7. `adb disconnect <IP>:5555` antes de o usuário trocar (regra do CLAUDE.md para Android 8 a 10; aqui é Android 11,
   mas não custa).

### Conferir o boot (usar em todo reinício)

**[Só leitura]** No macOS não há `timeout`; este laço tenta por até 5 min (60 × 5 s) e imprime quando o boot termina:

```bash
for i in $(seq 1 60); do
  adb connect <IP>:5555 >/dev/null 2>&1
  [ "$(adb -s <IP>:5555 shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = 1 ] && { echo "boot ok em $((i*5)) s"; break; }
  sleep 5
done
```

Depois do boot, também **[Só leitura]**: `adb shell dumpsys activity activities | grep -m1 mResumedActivity` (o que
está na tela) e `adb logcat -b crash -d`, comparado com `crash-inicial.txt` (só conta o que é novo).

### Critérios de parada

Qualquer um destes → **parar o teste e ir ao resgate**, sem tentar de novo:

- a TV não termina o boot (`sys.boot_completed` não chega a `1`) em 2 × T0 ou 5 min, o que for maior;
- reinício em laço: o logo volta duas vezes seguidas, ou o `sys.boot_completed` volta a não responder depois de ter
  dado `1`;
- HDMI 1 sem imagem, TV ao vivo não abre ou fica preta, controle Bluetooth não responde, a busca por voz não ouve;
- tela preta ao acordar do standby, ou a TV abre no `FallbackHome`/`RecoveryActivity`;
- em `adb logcat -b crash -d`, qualquer `FATAL EXCEPTION` ou `ANR` **novo** (que não está em `crash-inicial.txt`) de
  processo `com.tcl.*`, `system_server` ou `com.android.*`;
- `adb logcat -d | grep -E "Failed to find provider info for com.tcl.(ttvs.)?bi"` vindo de um processo que depois cai
  ou cuja função (imagem, controle, voz, entradas) falha. O `logcat` mostra o pid, não o nome: logo depois do grep,
  **[Só leitura]** `adb shell ps -A -o PID,NAME` para saber qual processo é cada pid (ou `adb logcat -d -v process`).

### Resgate

Na ordem; cada passo só se o anterior não bastou.

1. **Original no app** (o usuário, na TV): *Free My TV* → *Home Screen* → *Original*. `applyOriginal` religa o que
   está em `state.disabled`, inclusive `com.tcl.bi`. Conferir **[Só leitura]**: `adb shell pm list packages -d` volta às
   2 entradas iniciais. Se a TCL fechar a tela (TGuard), esperar 1 a 2 min e conferir de novo.
2. **Pelo adb**, se o app não abre ou o *Original* não termina (com o adb respondendo). Ordem igual à de
   `applyOriginal` (`HomeMode.java`, ~690: religa tudo, aplica a tela inicial, só então o `setupwraith`, e a tela
   inicial de novo) e à do guia (`guias/tcl-smart-tv-pro.md`, passo 16, branch `feat/104`). Cada comando
   **[Altera a TV: peça OK]**, um por vez, conferindo a resposta:
   1. **Tirar o app do modo Free My TV primeiro:** `adb uninstall io.freemytv` (é o nosso app, não um app do sistema:
      a regra de não desinstalar não se aplica). Por quê: com ele instalado em modo Free My TV, o boot seguinte
      (`HomeReceiver` → `ModeJob` → `HomeMode.verifyNow`) desliga de novo o `DEBLOAT` (inclusive `com.tcl.bi`), o
      launcherx e o `setupwraith`, e o resgate viraria o próprio laço. Desinstalado, os apps que ele desligou ficam
      desligados até os passos abaixo, que é o caso de "Uninstalled while in Free My TV mode?" do CLAUDE.md.
      **Alternativa documentada:** sem desinstalar, os passos abaixo só valem se a TV **não reiniciar** até o
      *Original* do resgate 1 rodar no app e terminar (`pm list packages -d` de volta às 2 entradas), e se nenhum APK for
      instalado ou atualizado nesse meio-tempo (uma atualização agenda o mesmo `verifyNow`, `HomeMode.java:409`). Se a
      TV precisar reiniciar, ou reiniciar sozinha, antes disso, a desinstalação é obrigatória.
      **Entre o `adb uninstall` e o `set-home-activity` do item 4, a TV fica sem tela inicial:** os itens 1 a 4 rodam em
      sequência, sem pausa, e o usuário não aperta Home nem reinicia a TV nesse intervalo.
   2. **[Só leitura]** `adb shell pm list packages -d` e comparar com a lista inicial (`au.com.stan.and`,
      `tv.wuaki.apptv`).
   3. `adb shell pm enable <pacote>` para **cada** pacote em `pm list packages -d` que não estava na lista inicial,
      **exceto** `com.google.android.tungsten.setupwraith`, começando por `com.google.android.apps.tv.launcherx`. Isso
      inclui o launcherx, `com.google.android.apps.tv.dreamx` (não está no `DEBLOAT`, mas a troca o desliga em
      `targets`, e o passo 4 o usa), `com.tcl.bi` e os demais do `DEBLOAT`. Cada um tem que responder
      `new state: enabled`.
   4. `adb shell cmd package set-home-activity com.google.android.apps.tv.launcherx/.home.HomeActivity` (esperar
      `Success`; sem ele, parar aqui e **não** ligar o `setupwraith`) e
      `adb shell settings put secure screensaver_components com.google.android.apps.tv.dreamx/.service.Backdrop`
      (o componente da linha de base, passo 2 de "Antes do teste").
   5. Só então `adb shell pm enable com.google.android.tungsten.setupwraith` (se ele estiver em `pm list packages -d`).
   6. `adb shell cmd package set-home-activity com.google.android.apps.tv.launcherx/.home.HomeActivity` de novo (uma
      nova candidata a HOME, a `RecoveryActivity` do `setupwraith`, pode derrubar a padrão).
   7. **[Só leitura]** `adb shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c
      android.intent.category.HOME`: a **última linha** tem que ser
      `com.google.android.apps.tv.launcherx/.home.HomeActivity`. No Android 11 desta TV, `cmd role get-role-holders`
      não existe: a conferência é só esta. Se não for o launcherx, **não reiniciar**: repetir o `set-home-activity` do
      item 6 e conferir de novo; se ainda falhar, `adb shell pm disable-user --user 0
      com.google.android.tungsten.setupwraith` (**[Altera a TV: peça OK]**; a regra do CLAUDE.md: com a tela inicial
      de fábrica sem a HOME, o `setupwraith` não fica ligado) e o card volta para a revisão.
   8. **[Só leitura]** `pm list packages -d` igual à lista inicial,
      `adb shell dumpsys package com.tcl.bi | grep -m1 "User 0:"` com `enabled=0` ou `1` (não `3`), e
      `settings get secure screensaver_components` igual à linha de base. Só então reiniciar ou apertar Home.
3. **Se o adb não responde no boot:**
   - esperar: rodar "Conferir o boot" mais uma vez (outros 5 min); se o adb responder, mesmo sem tela inicial, seguir
     o resgate 2 (se o adb da 5555 sobe antes da tela inicial nesta TV ainda não foi medido: o passo 3 de "Antes do
     teste" mostra);
   - o usuário tira a TV da tomada por 30 s e liga de novo; rodar "Conferir o boot";
   - se a TV chega a uma tela usável mas o adb não: o usuário confere *Depuração USB* nas Opções do desenvolvedor e
     escolhe *Original* no app (resgate 1);
   - **último recurso:** se a TV fica em laço sem adb e sem tela usável, a única saída conhecida é o reset de fábrica
     (menu de recuperação da TCL), que apaga apps, contas e redes salvas. **É decisão exclusiva do usuário**, depois de
     ele saber o que perde: o testador só explica o que é e o que apaga, não o sugere como passo do roteiro nem o
     conduz por conta própria. Isso é **exatamente** o motivo de testar com cuidado: não seguir em frente com nenhum
     sinal dos critérios de parada, e só reiniciar a TV depois de a ida passar em todos os itens com ela ligada.
     Avisar o usuário antes do primeiro reinício em modo Free My TV.

## Critério de pronto (mensurável)

1. Na branch de teste (102 + 101), `./build.sh` termina com `Built FreeMyTV.apk` e `tools/check.sh` passa.
2. **Ida (Free My TV):** o usuário troca na TV. `adb logcat -s FreeMyTV` mostra a troca concluída, sem
   `could not turn off com.tcl.bi` e sem `kept on, the TV's inputs or remote need them: … com.tcl.bi`. Em
   `pm list packages -d` aparece `com.tcl.bi`, e `com.tcl.overseasappshow` não aparece.
3. **Regressão no modo Free My TV**, nesta ordem, primeiro com a TV ligada e depois de cada reinício (todos passam):
   - R1. HDMI 1 com imagem e som;
   - R2. TV ao vivo (`com.tcl.tv`) abre e mostra canal;
   - R3. controle Bluetooth: setas, OK, volume e Home respondem;
   - R4. voz: o botão do microfone abre a busca e ela entende uma frase;
   - R5. standby e acordar (STR): sem tela preta, volta ao Free My TV;
   - R6. reinício completo **2 vezes** (pelo menu da TV), cada um passando em "Conferir o boot" dentro do limite e
     voltando ao Free My TV; `com.tcl.bi` continua em `pm list packages -d` (o `versionUpdateApp` não o religou);
   - R7. `adb logcat -b crash -d` sem `FATAL EXCEPTION`/`ANR` **novo** (fora de `crash-inicial.txt`) de `com.tcl.*`
     durante 10 min de uso e depois de cada reinício; e `adb logcat -d | grep -E "Failed to find provider info for
     com.tcl.(ttvs.)?bi"` registrado com o nome de cada processo (pid → nome por `adb shell ps -A -o PID,NAME`, lido
     logo em seguida), sem queda desses processos;
   - R8. Configurações da TV e Play Store abrem; Wi-Fi conectado com o mesmo número de redes salvas de antes.
4. **Volta (Original):** o usuário troca para *Original*. `pm list packages -d` volta a ser exatamente a lista
   inicial (`au.com.stan.and`, `tv.wuaki.apptv`). `dumpsys package com.tcl.bi | grep -m1 "User 0:"` mostra `enabled=0`
   ou `1` (não `3`): o *Original* religa com `pm enable` (`HomeMode.java:685`), que deixa `enabled=1`.
   O launcherx é de novo a HOME, o protetor de tela é o `Backdrop`, e as redes salvas são as mesmas de antes.
5. **Ida e volta 2 vezes:** o segundo ciclo (Free My TV → Original) dá o mesmo resultado, com `pm list packages -d`
   de novo só nas 2 entradas.
6. O resultado (com as saídas de `pm list packages -d`, `logcat -b crash` e o grep de R7) vai para `review/101.md`,
   para a nova revisão, **antes** do merge na `main`.

## Agentes

- **desenvolvedor:** a linha no `DEBLOAT` e o README, já em `feat/101`. Se o orquestrador decidir, monta a branch de
  teste 102 + 101 e roda `./build.sh` e `tools/check.sh` nela. Não muda mais nada no código.
- **validador:** nova revisão com este card: confere que os 3 bloqueantes foram respondidos, que o `DEBLOAT` ganhou
  só `com.tcl.bi`, que o `PROTECTED` não perdeu nada e que nada mudou no *Original*, no `Watchdog` ou no `Adb`;
  depois do teste, confere o resultado na TV em `review/101.md`.
- **testador:** segue o "Roteiro do teste na TV" com o APK 102 + 101; pede o OK do usuário antes de cada comando
  marcado **[Altera a TV: peça OK]** (inclusive o `adb uninstall io.freemytv` do resgate 2); deixa a troca de modo e os
  reinícios com o usuário na TV; para no primeiro critério de parada; nunca propõe o reset de fábrica como passo.
- designer: não participa.
