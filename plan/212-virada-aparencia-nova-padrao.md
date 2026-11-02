# 212 · Virada: a aparência nova vira o padrão, medição final e documentação

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto,
**só depois da aprovação do dono sobre os números finais** · Fase 2 · Depende de: 202 a 211

## Objetivo

Fechar a fase: medir a aparência *Nova* completa contra as metas finais (card 201), e então torná-la o padrão. O dono
escolhe entre (a) manter *Clássica* como opção em Home Settings, ou (b) remover a *Clássica* e o código dela (o
`HomeView` e o `web/home.js` ficam menores; a volta passa a ser por `git revert` e reinstalação). Atualizar a
documentação que descreve a tela.

## O que muda

- **Android e web:** o padrão de `Prefs` passa a ser *Nova* (para quem nunca escolheu); no caso (b), remoção das
  medidas e desenhos da *Clássica* e da linha em Home Settings.
- **Documentação:** comentário do topo de `HomeView.java` e `web/home.js`/`web/home.css`, `README.md` (capturas e
  descrição), `docs/index.html` **e** `docs/pt/index.html` juntos (o site é publicado no push para `main`), e a seção
  "The code" do `CLAUDE.md` onde descreve o layout. Mudar `CLAUDE.md` só com o OK explícito do dono.
- Não muda `versionName`/release aqui: release é decisão do dono (CLAUDE.md, "Releases").

## Plataformas

Google TV / Android TV, LG/Samsung e o site.

## Arquivos

- `app/src/io/freemytv/Prefs.java`, `SettingsActivity.java`, `HomeView.java`; `web/home.js`, `web/home.css`, `web/data.js`
  (padrão de `Prefs`); `README.md`, `docs/index.html`, `docs/pt/index.html`, `CLAUDE.md` (com OK).

## Riscos

- **Quem atualiza** vê a tela mudar de repente: no caso (a), quem já escolheu *Clássica* continua nela; quem nunca
  escolheu passa à *Nova*. O dono decide se avisa (um aviso na primeira abertura seria texto novo para traduzir).
- **Remover código** (caso b) é a parte com mais chance de quebrar algo da *Nova* que dependia de uma constante da
  *Clássica*: rodar o protocolo M e a lista do 208/210 de novo.
- O site é publicado sozinho: português e inglês na mesma mudança.

## Critério de pronto (mensurável)

1. `tools/check.sh` passa.
2. **Metas finais na TCL** (protocolo M, aparência *Nova* completa): PSS do `:home` **≤ 130 MB** (fábrica ~189 MB),
   quadros travados no R30 **≤ 8%** (fábrica 15,54%), p95 **≤ 22 ms** (fábrica 27 ms), abertura a frio **≤ 1.000 ms**
   (fábrica 1.453 ms), a quente ≤ 60 ms. Se alguma falhar, o dono decide entre aceitar ou abrir um card de otimização
   antes da virada.
3. M4 no preview: ≥ 50 fps normal, ≥ 55 em `lite`, heap JS estável.
4. Instalação limpa (sem preferências) abre na *Nova*; atualização sobre uma TV com *Clássica* escolhida mantém a
   escolha (caso a).
5. `docs/index.html` e `docs/pt/index.html` mudados juntos; nenhuma imagem ou marca da Apple no site.
6. O modo *Original* e o watchdog continuam funcionando: o testador, com o usuário fazendo os toques, troca para
   *Original* e de volta uma vez e lê `adb logcat -s FreeMyTV` (nenhuma linha de erro nova). Este card não altera esse
   código; é só a prova de que a fase não o afetou.

## Agentes

- **designer:** capturas finais para README e site.
- **desenvolvedor:** branch `feat/212`.
- **validador:** `review/212.md`, com a tabela final de metas.
- **testador:** critérios 2, 3, 4 e 6.
