# 104 · Guia de instalação: TCL Smart TV Pro (São Paulo)

Risco normal (só documentação; não toca `DEBLOAT`, `PROTECTED`, `Adb.java` nem `Watchdog.java`) · Status: aprovado pelo dono (2026-10-31); no main · Fase 1 do Meu TV OS

## Objetivo

Um guia passo a passo, em português e para quem não é técnico, para instalar o Meu TV OS (Free My TV) **nesta** TV:
TCL Smart TV Pro (`BeyondTV4`, `G03_4K_GB`, build `RP1A.200622.001`), Android 11, Realtek RTD2880, 2 GB, em São Paulo.
O guia junta num lugar só o que o CLAUDE.md espalha sobre TCL e diz em cada passo o que muda na TV e quem faz (o
usuário no controle ou o assistente no computador).

## Onde o guia mora

`guias/tcl-smart-tv-pro.md`, numa pasta nova na raiz do repo. Por quê:

- **Não em `docs/`:** é o site público (freemytv.io), publicado a cada push na `main`, e lá cada página existe em EN
  e PT. Um guia de um único aparelho de um fork não é página do site.
- **Não em `plan/`:** lá ficam os cards de mudança. O guia é um entregável que continua valendo depois da Fase 1.
- O guia não leva IP, serial, chave nem senha. O IP aparece como `<IP>` e a chave do TMDB só como "cole em `config.properties`".

## Plataformas

Google TV sobre Android 11 (a HOME é o `launcherx` e o `setupwraith` está presente, então valem as regras de Google TV do CLAUDE.md). Nada de webOS ou Tizen.

## Conteúdo obrigatório (checklist do validador)

1. **Antes de tudo:** o que a troca faz (tela inicial e protetor de tela mudam, uma lista curta de apps de propaganda
   é desligada e nunca desinstalada, e *Original* traz tudo de volta).
2. **Ferramentas no macOS:** `brew install --cask temurin android-commandlinetools android-platform-tools` e
   `sdkmanager "build-tools;34.0.0" "platforms;android-34"`, instalando só o que faltar.
3. **`config.properties` para São Paulo** (o primeiro `./build.sh` cria o arquivo, que o git ignora):
   `latitude=-23.5505`, `longitude=-46.6333`, `city=São Paulo`, `tmdb_region=BR`, `currency=BRL`,
   `temperature=C`, e `show_crypto` como o usuário preferir. A chave do TMDB é do usuário: ele mesmo cola depois de
   `tmdb_key=`. Nunca no chat, nunca no git.
4. **Build:** `./build.sh` termina com `Built FreeMyTV.apk`. Guardar o `freemytv.keystore`, porque as atualizações
   precisam da mesma chave.
5. **Conectar:** `adb connect <IP>:5555`, aceitar *Permitir depuração USB?* com *Sempre permitir*, e a nota do Mac
   (`No route to host` → `adb kill-server; adb nodaemon server &`, ou Rede Local nas permissões do macOS).
6. **Instalar:** `adb install -r FreeMyTV.apk`, sempre pelo adb e nunca abrindo o APK na TV (#378). Se travar, é o
   Play Protect na tela: *Mais detalhes* → *Instalar mesmo assim*.
7. **TCL: deixar rodar em segundo plano**, depois de **toda** instalação nova:
   `adb shell "appops set io.freemytv AUTO_START allow || appops set io.freemytv APP_AUTO_START allow"`. Explicar o
   porquê (`TclAppBoot` bloqueia o `ModeJob`; no log aparece `forbid bind service ... ModeJob`) e que é normal as duas
   respostas virem `Unknown operation string` em firmware sem `TclAppBoot`. Marcar como **altera a TV, pedir OK**.
8. **Aviso do TGuard (#277):** este é o mesmo aparelho de #264/#277. Durante "Medindo…" a tela inicial original pisca
   algumas vezes. Se a tela de configurações fechar e voltar o launcher da TCL, esperar 1 a 2 minutos e apertar Home:
   se o Free My TV abrir, a troca foi feita. Nenhum ajuste por adb desliga o TGuard.
9. **Botões do controle (#325):** no Android 11 da TCL o serviço de teclas fica desligado (com ele, o volume andava 2
   passos por toque). Netflix, YouTube, Prime e o botão de Configurações só seguem a escolha de *Remote Buttons*
   quando a tela inicial do Free My TV está na frente. Dentro de outros apps, vale o que a TV faz de fábrica.
10. **Busca por voz:** os resultados de filmes e séries vêm do launcherx, que o modo Free My TV desliga. A voz
    continua abrindo apps e respondendo, mas a busca de títulos some. Avisar **antes** da troca.
11. **Wi-Fi do primeiro setup:** antes da troca, conferir (só leitura, com OK) se alguma rede salva tem
    `cname=com.google.android.tungsten.setupwraith` em `adb shell dumpsys wifi`. Se tiver, o usuário esquece a rede
    e conecta de novo em Configurações → Rede e Internet. Redes fora de alcance só saem com
    `adb shell cmd wifi forget-network <id>`, com o OK do usuário. Se pular essa conferência, a própria troca para
    antes de mudar qualquer coisa e mostra a mesma instrução.
12. **`adb disconnect <IP>:5555` antes da troca (#221):** documentado para Android 8 a 10, mas mantido aqui por
    precaução, porque a TV pede de novo para permitir a depuração, agora para o próprio app (127.0.0.1).
13. **A troca é feita pelo usuário, na TV:** *Free My TV* → *Home Screen* → *Free My TV*. Nunca pelo computador.
14. **Conferir:** reconectar e ler `adb logcat -s FreeMyTV`.
15. **Voltar ao *Original*** uma vez e confirmar que tudo voltou (tela inicial da TCL, apps desligados ligados de novo).
16. **Se desinstalar em modo Free My TV:** os comandos de resgate do CLAUDE.md (`pm enable` da lista + home
    `com.google.android.apps.tv.launcherx/.home.HomeActivity` + protetor `com.google.android.apps.tv.dreamx/.service.Backdrop`,
    os dois da linha de base), e `com.tcl.channelplus` / `com.tcl.waterfall.overseas` se uma versão antiga os tiver desligado.

Se os cards 101 e 102 forem aprovados antes, o item 1 menciona a telemetria TCL (`com.tcl.bi`) entre os desligados.

## Arquivos

- `guias/tcl-smart-tv-pro.md` (novo).
- Nenhum arquivo de código, nada em `docs/`, `README.md` ou `CLAUDE.md`.

## Riscos

- **Comando que altera a TV sem aviso:** todo comando do guia vem marcado como *só leitura* ou *altera a TV: peça OK*.
- **Vazar segredo:** o guia não pode ter chave, token, senha, IP real nem serial.
- **Ficar velho:** cada aviso cita o número da issue (#221, #264, #277, #325, #378) para dar para conferir com o CLAUDE.md depois.
- `tools/check.sh` não lê `guias/`. Nada quebra o build.

## Critério de pronto (mensurável)

1. O arquivo `guias/tcl-smart-tv-pro.md` existe e tem os 16 itens da checklist (o validador marca um por um).
2. `grep -nE 'tmdb_key=.+|192\.168\.|[0-9a-f]{32}'` no guia não acha nada.
3. 100% dos blocos de comando estão marcados *só leitura* ou *altera a TV: peça OK*.
4. Teste de ponta a ponta: o testador segue o guia nesta TV, com o usuário fazendo os toques. Termina com o
   `logcat -s FreeMyTV` mostrando a troca concluída e um ciclo Free My TV → Original → Free My TV sem passo fora do
   guia. Toda divergência vira correção no guia antes de aprovar.

## Agentes

- **desenvolvedor:** escreve o guia na branch `feat/104` (sem código).
- **validador:** confere a checklist, que não há segredos e que os comandos estão marcados, e escreve `review/104.md`.
- **testador:** executa o guia de ponta a ponta (item 4) e registra em `tests/104.md`.
- designer: não participa.
