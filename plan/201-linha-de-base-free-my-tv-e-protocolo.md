# 201 · Linha de base do Free My TV atual e protocolo de medição da fase tvOS

Risco normal (só medida; nenhuma mudança no app; não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o
modo *Original*) · Status: aprovado pelo dono (2026-10-31); M1–M3 medidos em review/201-medida.md, M4 pendente · Fase 2 do Meu TV OS · Depende de: nenhum (pode correr junto com o 200)

## Objetivo

A linha de base da Fase 0 (`plan/baseline-tcl-smart-tv-pro.md`) mediu o launcher **de fábrica** (launcherx: ~189 MB
de PSS, 15,54% de quadros travados, 1.453 ms a frio). Falta medir o **Free My TV de hoje** (aparência clássica) na
mesma TV e com o mesmo método, para que cada card da fase tvOS seja comparado com o card anterior e não só com o
launcherx. Este card também fixa o **protocolo M** que todos os cards 202 a 212 citam no critério de pronto.

## Protocolo M (vale para todos os cards da fase)

TV: TCL Smart TV Pro, Android 11, 2 GB, `Ui.LEGACY` (a da linha de base). Sempre com o OK do usuário antes de cada
sessão, e com o usuário apertando o controle. Pacote `io.freemytv`, processo da tela inicial `io.freemytv:home`.

- **M1 memória:** tela inicial em frente, parada há 60 s depois de aberta, com picks carregadas; `dumpsys meminfo
  io.freemytv:home` → TOTAL PSS (e Java/Native heap). 3 leituras, mediana. Anotar também `MemAvailable` de
  `/proc/meminfo` e a swap usada (`dumpsys meminfo`, resumo), porque o driver Realtek não informa Graphics/GL.
- **M2 fluidez (roteiro R30, 30 s):** `dumpsys gfxinfo io.freemytv reset`, depois o usuário faz, com cronômetro:
  → ×7 pela fileira de apps, ← ×7, ↑ até a faixa/picks, → ×3, ← ×3, ↓ de volta, ↓ (gaveta ou fileira 2), ↑, e repete
  até 30 s, um toque a cada ~0,5 s. Logo em seguida `dumpsys gfxinfo io.freemytv` (seção do processo `:home`): quadros,
  % travados, p50/p90/p95/p99. 3 rodadas, mediana. O roteiro se adapta ao layout de cada card, mas mantém a quantidade
  de toques e o ritmo (o designer descreve o R30 do layout tvOS no card 200).
- **M3 abertura:** com Configurações em frente, `am kill io.freemytv` (só derruba processos em segundo plano) e
  `pidof io.freemytv:home` vazio confere; então `am start -W -n io.freemytv/.HomeActivity` (ou a HOME, se o Free My TV
  já for a tela inicial) → TotalTime. 3 rodadas a frio e 3 a quente, medianas. **Nunca `am force-stop io.freemytv`**:
  cancela os jobs do app (troca de modo, verificação de boot).
- **M4 web (sem TV LG/Samsung disponível):** `python3 webos/build.py --preview`, `out/webos/index.html` no Chrome a
  1920×1080, DevTools → Performance com CPU 6× mais lenta, o mesmo R30 pelo teclado: fps médio, quadros acima de 50 ms
  e o maior "long task". Duas vezes: normal e com `class="lite"` no `<html>` (como Tizen 2.4 e LG de 1 GB). Anotar
  também o heap JS (Memory → snapshot) e o número de nós do DOM. Relatos de TVs reais (issues) entram quando houver.
- O testador grava os números em `review/<id>-medida.md` (não no plano) e o validador compara com o card anterior.

## Metas da fase (propostas, a confirmar pelo dono)

Medidas em M1/M2/M3 na TCL, aparência tvOS, no fim da fase (card 212), contra o launcherx de fábrica:

| Medida | Fábrica (launcherx) | Meta final (tvOS) | Teto em qualquer card |
|---|---|---|---|
| PSS do home (M1) | ~189 MB | **≤ 130 MB** | 150 MB |
| Quadros travados no R30 (M2) | 15,54% | **≤ 8%** | 10% |
| p95 do quadro (M2) | 27 ms | **≤ 22 ms** | 26 ms |
| Abertura a frio (M3) | 1.453 ms | **≤ 1.000 ms** | 1.200 ms |
| Abertura a quente (M3) | ~43 ms | ≤ 60 ms | 80 ms |

Regra por card (todos de 202 a 211): contra a medida do card anterior, no máximo **+8 MB** de PSS, **+1,5 ponto**
percentual de quadros travados e **+100 ms** a frio, e sempre abaixo do teto. Se este card 201 mostrar que o Free My TV
de hoje já passa de algum teto, o dono revê as metas antes do 202.

Web (M4, preview com CPU 6×): fps médio ≥ 50 normal e ≥ 55 em `lite`, nenhum quadro acima de 100 ms nos toques do R30,
heap JS que não cresce mais de 10% entre o começo e o fim do R30 (sem vazamento).

## Plataformas

Google TV / Android TV (medida na TCL) e web (medida no preview).

## Arquivos

- Nenhum arquivo do app. Os números vão em `review/201-medida.md`.
- Opcional (desenvolvedor, se o dono quiser): `tools/measure-home.sh <IP>`, que só roda o M1/M2/M3 acima (leituras,
  `gfxinfo reset`, `am kill` e `am start -W`) e imprime a tabela. Nunca `pm`, `settings put`, `force-stop` ou install.

## Riscos

- **Medidas ruidosas:** a TCL usa 435 MB de swap e o TGuard (`com.tcl.guard`) mata processos em segundo plano;
  medir sempre logo depois de reiniciar a TV não é exigido, mas anotar o uptime e a swap a cada sessão.
- **`am kill` não derruba um processo em frente**: por isso Configurações fica em frente antes.
- O Free My TV pode estar em modo *Original* nesta TV: o M3 usa o componente explícito e funciona nos dois modos. Não
  trocar de modo para medir.

## Critério de pronto (mensurável)

1. `review/201-medida.md` com M1, M2 (3 rodadas) e M3 (3 frias, 3 quentes) do Free My TV clássico na TCL, e o M4 do
   preview, com data, uptime e swap.
2. O dono confirma (ou ajusta) a tabela de metas e a regra por card.
3. Nenhum comando além dos do protocolo M foi rodado na TV (o validador confere o log da sessão).

## Agentes

- **testador:** roda o protocolo M com o usuário e grava os números.
- **validador:** confere método e números, escreve `review/201.md`.
- **desenvolvedor:** só se o dono pedir o `tools/measure-home.sh`.
- designer: não participa (mas define o R30 do layout novo no card 200).

## Correções de método depois da 1ª medida (2026-10-31)

Ver `review/201-medida.md`: M2 por pid de `io.freemytv:home` (`dumpsys gfxinfo <pid>`), não pelo pacote; M3 a frio
com `am kill` não funciona com o Free My TV como HOME (o processo não é derrubado) e `force-stop` segue proibido, então
M3 passa a ser "a quente" + "depois do boot" (`logcat -b events`: `wm_create_activity` → `wm_on_resume_called`), até o
validador/planejador decidir um método a frio comparável; M3 a quente exige Configurações da TV (não o Home Settings) em frente.
