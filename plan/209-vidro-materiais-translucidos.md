# 209 · Vidro: materiais translúcidos com fallback leve

Risco normal (não toca `DEBLOAT`, `PROTECTED`, `Adb.java`, `Watchdog.java` nem o modo *Original*) · Status: proposto ·
Fase 2 · Depende de: 208

## Objetivo

Dar aos painéis da aparência *Nova* (barra/botões do topo, gaveta, menu de contexto, avisos, folhas) os materiais
translúcidos do card 200, em níveis (fino, normal, grosso), com o fundo aparecendo borrado por trás onde a TV aguenta e
um fallback leve onde não aguenta. O app já tem a base: o vidro AGSL de `Shaders`/`Scene` no Android 13+ e as cópias
pequenas pré-borradas de `Backdrop` (480×270 e 192×108) e `Frost` para os outros.

## O que muda

- **Android 13+:** o vidro de `Scene` com os tokens de cada nível (tinta, opacidade, realce da borda).
- **Android 8 a 12 e `Ui.LEGACY` (a TCL):** a cópia pré-borrada da imagem de fundo (`Backdrop`, já calculada fora da
  thread de UI quando o fundo muda) desenhada esticada dentro do painel, mais a tinta do nível; nenhum blur em tempo
  real e nenhuma camada de GPU. Onde nem isso compensar (o designer decide por nível), cor sólida translúcida.
- **Web:** sem `backdrop-filter` (TVs antigas não têm, `tools/check.sh` barra): a mesma técnica do fundo de hoje
  (imagem minúscula esticada, que já parece borrada) recortada no painel, mais `rgba` de tinta. `flat`: só `rgba`. `lite`:
  cor sólida.

## Plataformas

Google TV / Android TV (três caminhos: 13+, 8-12, LEGACY) e LG/Samsung (normal, `flat`, `lite`).

## Arquivos

- `app/src/io/freemytv/HomeView.java` (onde cada painel pede o vidro), `Scene.java`, `Shaders.java` (só parâmetros; um
  shader novo só se o designer pedir e só no 13+, com `try/catch` como os de hoje), `Backdrop.java`, `Frost.java`.
- `web/home.css`, `web/home.js` (se o recorte da imagem precisar de posição calculada).

## Riscos

- **TCL LEGACY:** a gaveta abrindo é o momento mais pesado da tela hoje (comentário de `HomeView` sobre o foco "pular"
  enquanto a gaveta desliza). Vidro sobre a gaveta em movimento não pode recalcular nada por quadro: só desenhar a cópia
  já pronta com deslocamento.
- **Android 13+ em TVs fracas:** AGSL a cada quadro em telas grandes; medir num aparelho 13+ se houver (onn, Chromecast),
  senão o validador confere que a área com shader não cresce além do que já existe hoje.
- **webOS 3 / Tizen 2.4:** cada painel com imagem de fundo recortada é mais uma textura; em `lite`, nenhuma.
- **Legibilidade:** vidro claro sobre imagem clara; os tokens garantem ≥ 4,5:1 sobre o pior caso (fundo branco).

## Critério de pronto (mensurável)

1. `tools/check.sh` passa (inclui a busca por `backdrop-filter`, CSS variables e grid); *Clássica* sem mudança.
2. TCL, protocolo M com o R30 abrindo e fechando a gaveta 4 vezes: travados ≤ +1,5 ponto contra o 208 e ≤ 10%; p99 ≤
   69 ms. PSS ≤ +4 MB.
3. Compilado contra `platforms/android-26/android.jar`, só aparecem as APIs novas já permitidas pelo CLAUDE.md (AGSL
   protegido por `try/catch`, etc.).
4. Capturas de cada painel nos três caminhos Android (o 8-12 e o 13+ podem ser no emulador) e nos três web; contraste
   medido ≥ 4,5:1.
5. M4 dentro das metas web, com `flat` e `lite` também.

## Agentes

- **designer (primeiro):** níveis de vidro e fallback de cada um, com o OK do dono.
- **desenvolvedor:** branch `feat/209`.
- **validador:** `review/209.md` (critérios 1, 3 e 4).
- **testador:** critérios 2 e 5.
