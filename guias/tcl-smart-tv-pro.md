# Guia: Meu TV OS (Free My TV) na TCL Smart TV Pro

Para a TCL Smart TV Pro (`BeyondTV4`, `G03_4K_GB`, build `RP1A.200622.001`), Android 11, Realtek RTD2880, 2 GB de
RAM, em São Paulo. É o Google TV sobre Android 11: a tela inicial de fábrica é o `launcherx` e o app de configuração
inicial do Google (`setupwraith`) está presente.

Como ler este guia:

- **Quem faz:** cada passo diz se é **você, no controle da TV**, ou **o assistente, no computador**.
- **Cada comando vem marcado:**
  - *Só leitura*: não muda nada na TV (ou roda só no computador).
  - *Altera a TV: peça OK*: muda algo na TV. O assistente explica o que vai fazer e só roda depois do seu OK.
  - *Altera o computador: peça OK*: não toca a TV, mas instala programas ou escreve arquivos no seu computador. O
    assistente também só faz depois do seu OK.
- O endereço da TV aparece como `<IP>`. Troque pelo IP da sua TV (Configurações → Rede e Internet → sua rede).
- Nenhuma chave, senha ou número de série entra neste guia, no chat ou no git.

## 1. Antes de tudo: o que a troca faz

Quando você trocar para o Free My TV:

- A **tela inicial** e o **protetor de tela** passam a ser os do Free My TV.
- Uma **lista curta de apps de propaganda** é desligada (nunca desinstalada): na TCL, mensagens, conta TCL, demo de
  loja, menu de hotel, manuais, espelhamento de tela e apps de log, além do Play Games e do YouTube Music. Só se o
  card 101 do Meu TV OS for aplicado (ele ainda está em análise), a telemetria da TCL (`com.tcl.bi`) também entra
  nessa lista; sem ele, ela fica ligada.
- A tela inicial da TCL/Google TV e o app de configuração inicial do Google também ficam desligados enquanto o
  Free My TV é a tela inicial.
- O modo ***Original*** traz tudo de volta, exatamente como estava. Se a nova tela inicial travar 3 vezes em 5
  minutos, a tela inicial de fábrica volta sozinha; os apps desligados continuam desligados até você escolher
  *Original* (ou fazer o resgate manual do passo 16).

Nada de imagem, som, rede ou conta da TV é mudado.

## 2. Ferramentas no Mac (o assistente, no computador)

Primeiro, ver o que já existe:

*Só leitura* (roda no computador)

```bash
java -version
echo $ANDROID_HOME
adb version
```

Instalar só o que faltar:

*Altera o computador: peça OK* (não toca a TV; instala programas no computador)

```bash
brew install --cask temurin android-commandlinetools android-platform-tools
sdkmanager "build-tools;34.0.0" "platforms;android-34"
```

## 3. Configurações para São Paulo (o assistente, no computador)

O primeiro `./build.sh` cria o arquivo `config.properties`. Ele fica só no seu computador: o git o ignora.
Preencha assim:

*Altera o computador: peça OK* (escreve no arquivo `config.properties`, no computador)

```properties
latitude=-23.5505
longitude=-46.6333
city=São Paulo
tmdb_region=BR
currency=BRL
temperature=C
```

- `show_crypto`: `true` ou `false`, como você preferir (mostra ou esconde os preços de criptomoedas).
- **A chave do TMDB é sua e secreta.** Crie uma de graça em themoviedb.org → Settings → API e cole **você mesmo**
  no `config.properties`, na linha que começa com `tmdb_key`, logo depois do `=`. Nunca no chat, nunca no git. Sem
  chave, tudo funciona, menos as indicações de filmes e séries.

## 4. Gerar o app (o assistente, no computador)

*Só leitura* (roda no computador)

```bash
./build.sh
```

Tem que terminar com `Built FreeMyTV.apk`.

**Guarde o arquivo `freemytv.keystore`** que aparece na pasta: as atualizações precisam ser assinadas com a mesma
chave. Ele também não vai para o git.

## 5. Conectar à TV (você, no controle, e o assistente, no computador)

Na TV, a depuração USB precisa estar ligada (Configurações → Sistema → Sobre → toque 7 vezes em *Build* para
liberar as Opções do desenvolvedor; depois Opções do desenvolvedor → *Depuração USB*).

*Só leitura*

```bash
adb connect <IP>:5555
```

A TV mostra **Permitir depuração USB?**. Marque **Sempre permitir** e aceite (você, no controle).

**Nota do Mac:** se o `adb connect` der `No route to host` mesmo com a TV ligada, é a privacidade de Rede Local do
macOS bloqueando o servidor do adb. Duas saídas: liberar o app do terminal em Ajustes do Sistema → Privacidade e
Segurança → Rede Local, ou iniciar o servidor no mesmo terminal:

*Só leitura* (roda no computador)

```bash
adb kill-server; adb nodaemon server &
```

## 6. Instalar (o assistente, no computador)

Sempre pelo adb. **Nunca abra o APK na TV** (por um gerenciador de arquivos ou navegador): lá o Play Protect pode
mostrar *App bloqueado para proteger seu dispositivo*, sem saída (#378).

*Altera a TV: peça OK* (instala o app Free My TV)

```bash
adb install -r FreeMyTV.apk
```

Se o comando parecer travado, é o Play Protect perguntando na tela da TV: escolha **Mais detalhes** →
**Instalar mesmo assim** (você, no controle).

## 7. TCL: deixar o app rodar em segundo plano (depois de toda instalação nova)

A TCL tem um bloqueador de tarefas em segundo plano (`TclAppBoot`) que impede a troca (o `ModeJob`) e o vigia de
rodarem. No log aparece `forbid bind service ... ModeJob`. Este comando libera, e precisa ser rodado de novo **depois
de toda instalação nova** (desinstalar tira a permissão):

*Altera a TV: peça OK* (libera o Free My TV para rodar em segundo plano)

```bash
adb shell "appops set io.freemytv AUTO_START allow || appops set io.freemytv APP_AUTO_START allow"
```

Se as duas respostas vierem `Unknown operation string`, está tudo bem: é firmware sem `TclAppBoot`, e não há nada a
liberar.

## 8. Aviso do TGuard (#264, #277)

Esta TV é o mesmo aparelho de #264 e #277 e tem o TGuard (`com.tcl.guard`), que mata processos de apps que estão
atrás de outro. Durante a troca, enquanto aparece "Medindo…", a tela inicial original **pisca algumas vezes**: é
normal.

Se a tela de configurações fechar e voltar o launcher da TCL: **espere 1 a 2 minutos e aperte Home**. Se o Free My TV
abrir, a troca foi feita. Nenhum ajuste por adb desliga o TGuard.

## 9. Botões do controle (#325)

No Android 11 da TCL, o serviço de teclas do Free My TV fica desligado (com ele, o volume andava 2 passos por toque).
Por isso os botões Netflix, YouTube, Prime e o de Configurações só seguem a escolha de *Remote Buttons* quando a
**tela inicial do Free My TV está na frente**. Dentro de outros apps, vale o que a TV faz de fábrica.

## 10. Busca por voz: avise antes da troca

Os resultados de filmes e séries da busca por voz vêm do `launcherx` (a tela inicial do Google TV), que o modo Free
My TV desliga. A voz continua abrindo apps e respondendo perguntas, e a busca dentro dos apps (a do YouTube, por
exemplo) continua, mas **a busca de títulos some**. O *Original* traz de volta.

## 11. Wi-Fi do primeiro setup (antes da troca)

Uma rede Wi-Fi salva durante o primeiro setup da TV pertence ao app de configuração do Google, e o Android apagaria
essa rede se ele fosse desligado. Antes da troca, o assistente confere, **com o seu OK**:

*Só leitura* (lista as redes salvas; peça OK antes, porque mostra os nomes das redes)

```bash
adb shell dumpsys wifi
```

Procure redes com `cname=com.google.android.tungsten.setupwraith` (cada bloco começa com o seu `ID:`).

- Se a rede for a que está em uso: **você** esquece a rede e conecta de novo em Configurações → Rede e Internet.
- Redes fora de alcance não aparecem em Configurações. Elas só saem assim:

*Altera a TV: peça OK* (apaga uma rede salva; troque `<id>` pelo número do bloco)

```bash
adb shell cmd wifi forget-network <id>
```

Se esta conferência for pulada, a própria troca para antes de mudar qualquer coisa e mostra a mesma instrução.

## 12. Desconectar o computador antes da troca (#221)

Na troca, o app usa o adb da própria TV (127.0.0.1) com a sua própria chave, e a TV pergunta de novo se permite a
depuração, agora para o app. No Android 8 a 10 a TV podia entregar essa resposta a um computador ainda conectado
(#221). Esta TV tem Android 11, mas por precaução:

*Só leitura*

```bash
adb disconnect <IP>:5555
```

## 13. A troca: você, na TV

**Nunca pelo computador.** No controle:

*Free My TV* → *Home Screen* → *Free My TV*

A TV pergunta mais uma vez *Permitir depuração USB?*: marque *Sempre permitir* e aceite. Lembre do passo 8: se
voltar o launcher da TCL, espere 1 a 2 minutos e aperte Home.

## 14. Conferir (o assistente, no computador)

Conectar de novo e ler o que a troca fez:

*Só leitura*

```bash
adb connect <IP>:5555
adb logcat -s FreeMyTV
```

## 15. Voltar ao Original uma vez (você, na TV)

Para ter certeza de que o caminho de volta funciona: *Free My TV* → *Home Screen* → *Original*. Confira que a tela
inicial da TCL/Google TV voltou e que os apps desligados aparecem de novo. Depois, se quiser, troque para o Free My
TV outra vez (passo 13).

*Só leitura* (lista os apps desligados; depois do Original deve voltar a ser a lista de antes da troca)

```bash
adb shell pm list packages -d
```

## 16. Se o Free My TV for desinstalado com o modo Free My TV ligado

O melhor caminho: instalar de novo (passos 6 e 7) e escolher *Original*. A lista do que foi desligado fica guardada
nas configurações da TV, e tudo volta.

Se não der, o resgate é manual. Todos estes comandos **alteram a TV: peça OK** antes de cada um. A ordem importa: a
tela inicial volta primeiro, e o app de configuração inicial do Google (`setupwraith`) por último.

*Altera a TV: peça OK* (liga de novo a tela inicial e o protetor de tela de fábrica)

```bash
adb shell pm enable com.google.android.apps.tv.launcherx
adb shell pm enable com.google.android.apps.tv.dreamx
```

*Altera a TV: peça OK* (liga de novo os apps da lista de propaganda; os que a TV não tiver só dão erro)

```bash
adb shell pm enable com.google.android.play.games
adb shell pm enable com.google.android.youtube.tvmusic
adb shell pm enable com.tcl.magiconnectfree
adb shell pm enable com.tcl.miracast
adb shell pm enable com.tcl.messagebox
adb shell pm enable com.tcl.usercenter
adb shell pm enable com.tcl.exhibit
adb shell pm enable com.tcl.esticker
adb shell pm enable com.tcl.hotelmenu
adb shell pm enable com.tcl.repairguide
adb shell pm enable com.tcl.ocean.instructions
adb shell pm enable com.tcl.logkit
```

Só se o card 101 do Meu TV OS tiver sido aplicado (ele ainda está em análise; sem ele, a troca não desliga
`com.tcl.bi` e este comando não é necessário), também:

*Altera a TV: peça OK*

```bash
adb shell pm enable com.tcl.bi
```

Se uma versão antiga do Free My TV tiver desligado a fonte de canais da TV ao vivo e o TCL Channel:

*Altera a TV: peça OK*

```bash
adb shell pm enable com.tcl.channelplus
adb shell pm enable com.tcl.waterfall.overseas
```

*Altera a TV: peça OK* (devolve a tela inicial e o protetor de tela de fábrica)

```bash
adb shell cmd package set-home-activity com.google.android.apps.tv.launcherx/.home.HomeActivity
adb shell settings put secure screensaver_components com.google.android.apps.tv.dreamx/.service.Backdrop
```

*Altera a TV: peça OK* (por último: o app de configuração inicial do Google)

```bash
adb shell pm enable com.google.android.tungsten.setupwraith
```

Ligar o `setupwraith` traz de volta mais uma candidata a tela inicial (a `RecoveryActivity` dele), e isso pode
derrubar a tela inicial padrão. Por isso, logo depois, aplique de novo a tela inicial de fábrica:

*Altera a TV: peça OK* (aplica de novo a tela inicial de fábrica)

```bash
adb shell cmd package set-home-activity com.google.android.apps.tv.launcherx/.home.HomeActivity
```

E confira quem abre com o Home:

*Só leitura*

```bash
adb shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME
```

No Android 11 a resposta vem em duas linhas: primeiro uma com `priority=... isDefault=...`, depois o componente. A
última linha tem que ser `com.google.android.apps.tv.launcherx/.home.HomeActivity`. Só então reinicie a TV ou aperte
Home. (No Android 12 e mais novos também existe `cmd role get-role-holders android.app.role.HOME`; nesta TV, com
Android 11, esse comando não existe.)

Se a última linha for outra coisa (por exemplo `RecoveryActivity` ou `ResolverActivity`), **não reinicie a TV**.
Repita o `set-home-activity` acima (*Altera a TV: peça OK*) e confira de novo. Se ainda assim não for o launcherx,
desligue o `setupwraith` de novo, para ele não tomar o Home:

*Altera a TV: peça OK* (desliga de novo o app de configuração do Google TV)

```bash
adb shell pm disable-user --user 0 com.google.android.tungsten.setupwraith
```

e peça ajuda antes de reiniciar: o `setupwraith` só pode ficar ligado com a tela inicial de fábrica garantida.

Antes da troca, `pm list packages -d` desta TV listava só `au.com.stan.and` e `tv.wuaki.apptv`: depois do resgate,
deve voltar a ser essa lista.
