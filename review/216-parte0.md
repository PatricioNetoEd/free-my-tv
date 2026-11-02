# 216 · Parte 0 (medida antes de mudar) — 2026-11-01

TCL, `:home` pid 1375 (APK do main com o 202), Clássica. Comandos só de leitura, com o OK do dono; sem `logcat -c`.
Saídas em `m216/` no scratchpad. Referência A = C2 do 202: 50,5 MB PSS, Native ~29 MB, `Activities: 1`.

- **Home Settings → subtela → botão Home:** PSS 74,8 MB (+24 MB), `Activities: 2`, `ViewRootImpl: 2`. A
  SettingsActivity está `state=STOPPED stopped=true`, numa task própria (`A=10031:io.freemytv.settings`,
  `translucent=true`), e recebeu `wm_on_stop_called` às 21:05:43.8. Ou seja: nesta TCL o `onStop` chega (A2 seria
  possível), e o motivo de ela ficar viva é a task separada. Graphics/GL continuam 0 (driver Realtek não informa).
  O tamanho (+24 MB aqui, +60 MB no 202) depende do que a tela tinha carregado.
- **Weather widget trocado, saindo com Voltar (recreate):** 1ª troca 52,7 MB (`Activities: 3`); 2ª troca 49,4 MB
  (`Activities: 4`). PSS dentro de A + 8 MB e sem crescer. **Mas o número de objetos Activity cresce a cada
  recreate (1 → 3 → 4) mesmo com a memória estável**: indício de referência que segura a HomeActivity antiga (listener,
  callback ou estático), barata agora porque o 202 já solta logos/sombras/snapshots. A Parte B deve achar e cortar essa
  referência (a contagem deve voltar a 1–2 depois de um GC), além de soltar o que for só da HomeView antiga.
- 0 "recycled bitmap"/FATAL. HomeActivity criada 1 vez antes das trocas.
