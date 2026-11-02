# 205 · Grade de apps em fileiras, com rolagem vertical

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: fora da fase por decisão do dono (2026-10-31: favoritos + All Apps) 
**depende da resposta do dono à pergunta 4 do card 200** (se a resposta for "só favoritos", este card sai da fase) ·
Fase 2 · Depende de: 204

## Objetivo

Como na tela inicial do tvOS, abaixo da fileira de favoritos vêm os demais apps em fileiras de tiles iguais (5 por
fileira, proposta). Descer pela grade rola a tela para cima e a faixa de destaque recolhe; subir até a primeira fileira
a traz de volta. A folha *All Apps* continua existindo (botão *All Apps* do controle, `HomeActivity.EXTRA_ALL_APPS`), ou
passa a rolar até a grade, conforme o card 200.

## O que muda

- **Android:** nova zona de grade no `HomeView` (aparência *Nova*), com uma `Spring` de rolagem vertical; a arte dos
  tiles só é gerada para as fileiras visíveis e uma acima/abaixo (fora disso, liberada); a gaveta do ↓ passa a vir
  depois da última fileira, ou no lugar que o card 200 decidir. A ordem dos apps é a de `HomeApps` (favoritos) e depois
  a de *All Apps*; reordenar continua só na fileira de favoritos.
- **Web:** o mesmo em `web/home.js` (zona nova em `st`/`Z`, `move`), com a rolagem por `transform: translateY` num
  contêiner e os tiles fora da tela com `display: none` ou sem imagem (Tizen 2.4 e webOS 3 têm pouca memória).

## Plataformas

Google TV / Android TV e LG/Samsung.

## Arquivos

- `app/src/io/freemytv/HomeView.java` (zona, rolagem, `a11yBounds`, hover/mouse), `HomeApps.java` (só leitura da lista
  já existente; nada de `SHELF`/`HIDDEN`).
- `web/home.js`, `web/home.css`.

## Riscos

- **Memória:** é o card que mais pode crescer. Com 30 apps e 2 tamanhos de arte, ~14 MB se tudo ficasse carregado;
  por isso a janela de carregamento. Na TCL há 10 apps do usuário e ~20 do sistema visíveis.
- **Fluidez na rolagem vertical (LEGACY):** a camada inteira se move; sem camadas de GPU em `Ui.LEGACY`, cada quadro
  redesenha os tiles visíveis. O designer limita o que aparece durante a rolagem (sem sombras nos tiles fora de foco).
- **webOS 3 / Tizen 2.4:** muitos nós no DOM e imagens; `translateY` no contêiner só, não em cada tile.
- *Recent Apps* (dois Home), *All Apps* do controle, TalkBack e mouse precisam reconhecer a zona nova.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa; *Clássica* sem mudança.
2. TCL, protocolo M com o R30 descendo e subindo pela grade (no lugar das picks): PSS ≤ +8 MB contra o 204, travados ≤
   +1,5 ponto, frio ≤ +100 ms, tetos respeitados.
3. Descer até a última fileira e voltar 10 vezes não faz o PSS crescer mais de 2 MB (sem vazamento de bitmaps).
4. *All Apps* do controle continua abrindo o que abria (Hisense/Google TV Streamer, `Prefs.ALL_APPS`): conferido no
   preview e por leitura do código pelo validador (a TCL não tem esse botão).
5. M4 com 30 apps de exemplo no preview: metas web, heap JS estável após 3 voltas.

## Agentes

- **designer (primeiro):** fileiras, rolagem, onde fica a gaveta, aprovados pelo dono.
- **desenvolvedor:** branch `feat/205`.
- **validador:** `review/205.md`.
- **testador:** M1 a M4, critério 3.
