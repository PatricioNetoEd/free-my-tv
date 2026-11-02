/*
 * Prototype of the "Nova" home screen (card 200). Plain ES5, as web/: arrows move, Enter is OK, Esc or Backspace is
 * Back. Everything drawn here is CSS and text: no images, logos or anything from the network (the font is the repo's own
 * Inter, see proto.css). Brand names and colors come from web/home.js (SHELF) and design/tokens.json; picks are
 * invented titles over CSS gradients. The speed test is simulated: nothing is downloaded.
 */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function hasClass(e, c) { return (' ' + e.className + ' ').indexOf(' ' + c + ' ') >= 0; }
  function setClass(e, c, on) {
    if (!e) return;
    if (on && !hasClass(e, c)) e.className = (e.className + ' ' + c).replace(/^\s+/, '');
    else if (!on && hasClass(e, c)) e.className = (' ' + e.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }

  function transform(e, t) { e.style.webkitTransform = t; e.style.transform = t; }

  // MARK: - Symbols: simple line drawings made here (the app uses its own app/assets/symbols)

  var SVG = 'http://www.w3.org/2000/svg';
  var GLYPHS = {
    tv: [['rect', {x: 3, y: 5, width: 18, height: 12, rx: 2}], ['path', {d: 'M8 21h8M12 17v4'}]],
    input: [['rect', {x: 3, y: 5, width: 13, height: 14, rx: 2}], ['path', {d: 'M22 12H9M13 8l-4 4 4 4'}]],
    gear: [['circle', {cx: 12, cy: 12, r: 3.2}], ['circle', {cx: 12, cy: 12, r: 7.5, 'stroke-dasharray': '2.9 1.8', 'stroke-width': 3.4}]],
    apps: [['rect', {x: 4, y: 4, width: 6, height: 6, rx: 1.5}], ['rect', {x: 14, y: 4, width: 6, height: 6, rx: 1.5}], ['rect', {x: 4, y: 14, width: 6, height: 6, rx: 1.5}], ['rect', {x: 14, y: 14, width: 6, height: 6, rx: 1.5}]],
    home: [['path', {d: 'M4 11l8-7 8 7v9H4z'}], ['path', {d: 'M10 20v-5h4v5'}]],
    tvgear: [['rect', {x: 3, y: 5, width: 18, height: 12, rx: 2}], ['circle', {cx: 12, cy: 11, r: 2.4}], ['path', {d: 'M8 21h8'}]],
    play: [['path', {d: 'M8 5l11 7-11 7z', fill: 'currentColor'}]],
    left: [['path', {d: 'M15 5l-7 7 7 7'}]],
    right: [['path', {d: 'M9 5l7 7-7 7'}]],
    plus: [['path', {d: 'M12 5v14M5 12h14'}]],
    check: [['path', {d: 'M5 12.5l4.5 4.5L19 7.5'}]],
    bear: [['circle', {cx: 6.3, cy: 7, r: 3, fill: 'currentColor', stroke: 'none'}], ['circle', {cx: 17.7, cy: 7, r: 3, fill: 'currentColor', stroke: 'none'}], ['circle', {cx: 12, cy: 13.5, r: 7.5, fill: 'currentColor', stroke: 'none'}]],
    warn: [['path', {d: 'M12 4l9 16H3z'}], ['path', {d: 'M12 10v4M12 17v.5'}]],
    sun: [['circle', {cx: 12, cy: 12, r: 4.5}], ['path', {d: 'M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8'}]],
    cloud: [['path', {d: 'M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.6A3.2 3.2 0 0 0 7 18z'}]]
  };

  /** A glyph at `size` px; old WebKit needs width and height on the svg (CLAUDE.md). */
  function glyph(name, size, parent) {
    var s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('width', size);
    s.setAttribute('height', size);
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    var parts = GLYPHS[name];
    for (var i = 0; i < parts.length; i++) {
      var p = document.createElementNS(SVG, parts[i][0]), attrs = parts[i][1];
      for (var k in attrs) if (attrs.hasOwnProperty(k)) p.setAttribute(k, attrs[k]);
      s.appendChild(p);
    }
    if (parent) parent.appendChild(s);
    return s;
  }

  // MARK: - Gradients (old WebKit's -webkit- syntax first, then the standard one, which wins where it parses)

  function stops(list) { return list.join(', '); }

  /** angle in the standard sense (180 = top to bottom). */
  function linear(angle, list) {
    return {w: '-webkit-linear-gradient(' + (90 - angle) + 'deg, ' + stops(list) + ')', s: 'linear-gradient(' + angle + 'deg, ' + stops(list) + ')'};
  }

  function radial(x, y, color, size) {
    var fade = color.replace(/[\d.]+\)$/, '0)');
    var list = color + ' 0, ' + fade + ' ' + size + '%';
    return {w: '-webkit-radial-gradient(' + x + '% ' + y + '%, circle cover, ' + list + ')', s: 'radial-gradient(circle farthest-corner at ' + x + '% ' + y + '%, ' + list + ')'};
  }

  function paint(node, layers) {
    var w = [], s = [];
    for (var i = 0; i < layers.length; i++) { w.push(layers[i].w); s.push(layers[i].s); }
    node.style.background = w.join(', ');
    node.style.background = s.join(', ');
  }

  // MARK: - Apps (names and colors from web/home.js SHELF and design/tokens.json) and invented picks

  // key, name, tile gradient [top, bottom], word color, word shadow
  var POOL = [
    ['netflix', 'Netflix', ['#0A0A0A', '#000000'], '#E50914'],
    ['youtube', 'YouTube', ['#1C1C1E', '#09090A'], '#FFFFFF'],
    ['prime', 'Prime Video', ['#2AA8FF', '#0A68D4'], '#FFFFFF', true],
    ['disney', 'Disney+', ['#173584', '#08143F'], '#FFFFFF'],
    ['max', 'Max', ['#5C30E8', '#221684'], '#FFFFFF'],
    ['appletv', 'Apple TV', ['#1C1C1E', '#000000'], '#B8BCC6'],
    ['globoplay', 'Globoplay', ['#FF8A1F', '#FF2D5A'], '#FFFFFF', true],
    ['spotify', 'Spotify', ['#1DB954', '#0F7A36'], '#FFFFFF', true],
    ['clarotv', 'Claro tv+', ['#1C1C1C', '#0B0B0B'], '#E3262E'],
    ['discoveryplus', 'discovery+', ['#211E2A', '#09080D'], '#FFFFFF'],
    ['hulu', 'Hulu', ['#1CE783', '#0B8F4E'], '#FFFFFF', true],
    ['paramount', 'Paramount+', ['#0064FF', '#002A86'], '#FFFFFF'],
    ['peacock', 'Peacock', ['#1C1C1E', '#000000'], '#FFFFFF'],
    ['nfl', 'NFL', ['#013369', '#00163D'], '#FFFFFF'],
    ['jellyfin', 'Jellyfin', ['#AA5CC3', '#00A4DC'], '#FFFFFF', true],
    ['browser', 'Navegador', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['files', 'Arquivos', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['photos', 'Fotos', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['music', 'Música', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['radio', 'Rádio', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['games', 'Jogos', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['news', 'Notícias', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['podcasts', 'Podcasts', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['store', 'Loja', ['#2C2C2E', '#161618'], '#FFFFFF'],
    ['camera', 'Câmera', ['#2C2C2E', '#161618'], '#FFFFFF']
  ];

  // Scenes: [base angle, base stops, spots [x%, y%, rgba, size%]]
  function scene(angle, base, spots) {
    var layers = [];
    for (var i = 0; i < spots.length; i++) layers.push(radial(spots[i][0], spots[i][1], spots[i][2], spots[i][3]));
    layers.push(linear(angle, base));
    return layers;
  }

  var ART = {
    tide: scene(180, ['#0B1A3A', '#1E4E79 55%', '#E07A4F 80%', '#F2C27B'], [[72, 70, 'rgba(255,226,160,0.9)', 18], [20, 30, 'rgba(90,140,220,0.35)', 40]]),
    glass: scene(160, ['#0F1020', '#3B2A6B 50%', '#C04C7E'], [[78, 35, 'rgba(255,120,200,0.55)', 30], [40, 80, 'rgba(60,200,255,0.35)', 35]]),
    winter: scene(180, ['#DCE8F2', '#9DB7CC 50%', '#3E556B'], [[65, 30, 'rgba(255,255,255,0.95)', 25]]),
    route: scene(200, ['#1A0F0A', '#7A2E12 45%', '#F08A24 75%', '#FFD38A'], [[80, 60, 'rgba(255,200,80,0.8)', 15]]),
    garden: scene(170, ['#0E2A1B', '#2F7A47 50%', '#BFE38A'], [[70, 25, 'rgba(255,250,200,0.8)', 25], [25, 75, 'rgba(255,120,160,0.4)', 25]]),
    coral: scene(180, ['#02233F', '#0A6E8C 50%', '#26D3C4'], [[75, 70, 'rgba(255,140,110,0.75)', 20], [30, 20, 'rgba(180,255,250,0.4)', 30]]),
    valley: scene(190, ['#1B2A4A', '#4C6FA8 45%', '#E8C07A 80%', '#7A5A2A'], [[60, 45, 'rgba(255,235,180,0.8)', 20]]),
    lisbon: scene(180, ['#100A1F', '#3A2350 50%', '#E2925A'], [[82, 55, 'rgba(255,190,120,0.8)', 14], [20, 70, 'rgba(255,215,120,0.35)', 18]]),
    archive: scene(160, ['#1A1410', '#4A3626 55%', '#B08A5A'], [[70, 40, 'rgba(255,220,160,0.6)', 22]]),
    orbit: scene(180, ['#000005', '#071535 60%', '#1E3F8A'], [[75, 85, 'rgba(120,180,255,0.85)', 35], [30, 25, 'rgba(255,255,255,0.25)', 6]]),
    red: scene(180, ['#2A0A06', '#8A2A14 50%', '#E4572E'], [[70, 35, 'rgba(255,200,120,0.7)', 18]]),
    sea: scene(180, ['#BFE3F5', '#4BA3D6 50%', '#0B3C6E'], [[65, 25, 'rgba(255,255,255,0.95)', 22]]),
    deep: scene(180, ['#00121F', '#003A4F 55%', '#007A7A'], [[70, 65, 'rgba(120,255,220,0.45)', 25]]),
    cooking: scene(150, ['#3A1A0A', '#A3542A 55%', '#F5C58A'], [[75, 40, 'rgba(255,240,200,0.75)', 20]]),
    aurora: scene(180, ['#04060F', '#0B1B3A 60%', '#132B4A'], [[30, 30, 'rgba(60,220,170,0.55)', 40], [75, 20, 'rgba(140,90,255,0.45)', 40]])
  };

  // [app, title, kind (movie/tv), meta, art, kids (rated L or 10, or Animation/Family: the kids profile's list)]
  var PICKS = [
    ['netflix', 'A Última Maré', 'movie', '2025 · Suspense · 1 h 58 min', 'tide'],
    ['netflix', 'Cidade de Vidro', 'tv', '2024 · Drama · 2 temporadas', 'glass'],
    ['netflix', 'Pássaros de Inverno', 'movie', '2023 · Aventura · 1 h 44 min', 'winter', true],
    ['netflix', 'O Pequeno Farol', 'movie', '2025 · Animação · 1 h 28 min', 'sea', true],
    ['prime', 'Rota 9', 'tv', '2025 · Ação · 1 temporada', 'route'],
    ['prime', 'O Jardim Suspenso', 'movie', '2024 · Romance · 2 h 3 min', 'garden'],
    ['disney', 'Expedição Coral', 'movie', '2025 · Animação · 1 h 36 min', 'coral', true],
    ['disney', 'Guardiões do Vale', 'tv', '2024 · Fantasia · 3 temporadas', 'valley', true],
    ['max', 'Noite em Lisboa', 'tv', '2025 · Drama · 1 temporada', 'lisbon'],
    ['max', 'O Arquivista e a Cidade Que Esqueceu o Próprio Nome', 'movie', '2024 · Mistério · 2 h 11 min', 'archive'],
    ['appletv', 'Órbita Baixa', 'tv', '2025 · Ficção científica · 2 temporadas', 'orbit'],
    ['globoplay', 'Terra Vermelha', 'tv', '2025 · Novela · 120 capítulos', 'red'],
    ['globoplay', 'Mar Aberto', 'movie', '2024 · Documentário · 1 h 30 min', 'sea', true],
    ['discoveryplus', 'Planeta Profundo', 'tv', '2025 · Natureza · 1 temporada', 'deep', true]
  ];

  // Continue Watching (Android only, when it's on in Home Settings): [app, title, kind (null: none, every tab), meta,
  // progress, art], most recent first. Netflix's "Cidade de Vidro" is also a pick: it shows once, as Continue.
  var CONTINUE = [
    ['youtube', 'Receitas de domingo: pão de fermentação natural', null, 'Faltam 12 min', 0.62, 'cooking'],
    ['netflix', 'Cidade de Vidro', 'tv', 'T2 · E5 · Faltam 31 min', 0.35, 'glass'],
    ['netflix', 'Pássaros de Inverno', 'movie', 'Faltam 48 min', 0.55, 'winter'],
    ['prime', 'Rota 9', 'tv', 'T1 · E3 · Faltam 22 min', 0.2, 'route']
  ];

  // MARK: - Profiles (local, one per person in the house: name, color, initial; not a Google account; card 214)

  // Colors from tokens-v2.json profile.palette (white initial >= 4.5:1 on each). Each profile keeps its own favorites
  // (keys first, then the rest of POOL up to count) and its own band preferences (here: the selected tab). A kids
  // profile's picks are only the kids list (rated L or 10, Animation, Family); its Continue Watching is unchanged.
  var HOUSE = [
    {name: 'Ana', color: '#3563E0', keys: ['netflix', 'youtube', 'prime', 'disney', 'max', 'appletv', 'globoplay', 'spotify', 'clarotv', 'discoveryplus'], tab: 0},
    {name: 'Léo', color: '#D0215F', keys: ['globoplay', 'spotify', 'max', 'netflix', 'discoveryplus', 'paramount'], tab: 2},
    {name: 'Crianças', color: '#856A00', keys: ['disney', 'youtube', 'netflix', 'spotify'], tab: 1, kids: true}
  ];
  // Only the profile made from the TV's current state (card 214): the button shows, the start doesn't ask.
  var ALONE = [{name: 'Principal', color: '#3563E0', keys: HOUSE[0].keys, tab: 0}];
  var PROFILES = HOUSE;
  var MAX_PROFILES = 6;

  function profile() { return PROFILES[st.profile]; }
  function initial(name) { return name.charAt(0).toUpperCase(); }

  // MARK: - State

  var Z = {TOP: 'top', BAND: 'band', ROW: 'row', DRAWER: 'drawer', APPS: 'apps', PROFILES: 'profiles'};
  // st.top: 0-2 tabs, 3 the speed item (the info line's only focus), 4-6 Live TV / Inputs / Settings, 7 the profile
  var SPEED = 3, FIRST_BUTTON = 4, PROFILE_BUTTON = 7;
  var st = {zone: Z.ROW, top: 0, tab: 0, row: 0, band: 0, drawer: 0, grid: 0, profile: 0, pick: 0};
  // speed: the simulated network for the speed item (V): tested 2 h ago, never tested, the test fails, no network
  var opt = {night: null, perf: 'normal', key: true, cont: true, hd: false, speed: 0, single: false};
  var fav = [], others = [];
  var owner = null, items = [], followTimer = 0, followPending = false, lastDir = 0;
  var stage = $('stage');

  /** The active profile's row: its own apps in its order, filled from POOL when its count asks for more. */
  function rowOf(p) {
    var n = p.count || p.keys.length, out = [], i;
    for (i = 0; i < p.keys.length && out.length < n; i++) out.push(appByKey(p.keys[i]));
    for (i = 0; i < POOL.length && out.length < n; i++) if (p.keys.indexOf(POOL[i][0]) < 0) out.push(appOf(POOL[i]));
    return out;
  }

  function inRow(k) {
    for (var i = 0; i < fav.length; i++) if (fav[i].key === k) return true;
    return false;
  }

  function appOf(p) { return {key: p[0], name: p[1], tile: p[2], word: p[3], shade: !!p[4]}; }

  function tabKind() { return [null, 'movie', 'tv'][st.tab]; }

  /** This app's picks (all apps' without one), by the tab; on a kids profile only the kids list. Skips `skip` titles. */
  function picksOf(app, skip) {
    var out = [], kind = tabKind(), kids = !!profile().kids;
    if (!opt.key) return out;
    for (var i = 0; i < PICKS.length && out.length < 5; i++) {
      var p = PICKS[i];
      if ((!app || p[0] === app.key) && (!kind || p[2] === kind) && (!kids || p[5]) && !(skip && skip[p[1]])) {
        out.push({type: 'pick', app: appByKey(p[0]), title: p[1], kind: p[2], meta: p[3], art: p[4]});
      }
    }
    return out;
  }

  function appByKey(k) {
    for (var i = 0; i < POOL.length; i++) if (POOL[i][0] === k) return appOf(POOL[i]);
    return null;
  }

  /**
   * One carousel (owner, 2026-11-01): this app's Continue Watching first (at most 3, by the tab; an item with no kind
   * shows in every tab), then its picks (at most 5), on the same dots; a pick already in Continue shows once. Neither:
   * the app's own art.
   */
  function itemsFor(app) {
    if (!app) {
      var general = picksOf(null);
      return general.length ? general : [{type: 'aurora'}];
    }
    var out = [], seen = {}, kind = tabKind();
    for (var i = 0; opt.cont && i < CONTINUE.length && out.length < 3; i++) {
      var c = CONTINUE[i];
      if (c[0] === app.key && (!kind || !c[2] || c[2] === kind)) {
        out.push({type: 'cont', app: app, title: c[1], meta: c[3], progress: c[4], art: c[5]});
        seen[c[1]] = true;
      }
    }
    out = out.concat(picksOf(app, seen));
    return out.length ? out : [{type: 'art', app: app}];
  }

  function bandFocusable() { return items.length > 0 && items[0].type !== 'art' && items[0].type !== 'aurora'; }

  // MARK: - Band

  var front = 'artA';

  function showArt(item) {
    var next = front === 'artA' ? 'artB' : 'artA', node = $(next);
    // The app's logo (here its name) sits over the scrims, which are there for the text on the left.
    var logo = $(next === 'artA' ? 'logoA' : 'logoB');
    logo.innerHTML = '';
    setClass(logo, 'on', item.type === 'art');
    setClass($(front === 'artA' ? 'logoA' : 'logoB'), 'on', false);
    if (item.type === 'art') {
      var a = item.app;
      paint(node, [radial(70, 40, 'rgba(255,255,255,0.10)', 45), linear(160, [a.tile[0], a.tile[1]])]);
      var w = el('div', 'word', logo, a.name);
      w.style.color = a.word;
      w.style.fontSize = Math.max(64, Math.min(150, Math.floor(640 * 0.9 / (Math.max(4, a.name.length) * 0.56)))) + 'px';
    } else {
      paint(node, ART[item.type === 'aurora' ? 'aurora' : item.art]);
    }
    setClass(node, 'on', true);
    setClass($(front), 'on', false);
    front = next;
  }

  var swapTimer = 0;

  function showText(item, index, count) {
    var text = document.querySelector('#hero .text');
    setClass(text, 'swap', true);
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function () {
      var eyebrow = '', title = '', meta = '', progress = -1;
      if (item.type === 'pick') { eyebrow = item.app.name + ' · ' + (item.kind === 'movie' ? 'Filme' : 'Série'); title = item.title; meta = item.meta; }
      else if (item.type === 'cont') { eyebrow = 'Continuar assistindo · ' + item.app.name; title = item.title; meta = item.meta; progress = item.progress; }
      else if (item.type === 'art') { title = item.app.name; }
      text.children[0].textContent = eyebrow;
      text.children[0].style.display = eyebrow ? '' : 'none';
      text.children[1].textContent = title;
      setClass(text.children[1], 'long', title.length > 22);
      text.children[2].textContent = meta;
      text.children[2].style.display = meta ? '' : 'none';
      setClass(text.children[3], 'on', progress >= 0);
      if (progress >= 0) transform(text.children[3].firstChild, 'scaleX(' + progress + ')');
      text.children[3].firstChild.style.width = '360px';
      var action = document.querySelector('#hero .action');
      action.innerHTML = '';
      glyph('play', 26, action);
      action.appendChild(document.createTextNode(item.type === 'cont' ? 'Continuar' : 'Assistir'));
      var dots = document.querySelector('#hero .dots');
      dots.innerHTML = '';
      for (var i = 0; count > 1 && i < count; i++) el('i', i === index ? 'on' : '', dots);
      placeDots();
      setClass(text, 'swap', false);
    }, hasClass(stage, 'lite') ? 0 : 120);
  }

  /** The dots move right of the action pill while the band has focus (transform only). */
  function placeDots() {
    var action = document.querySelector('#hero .action'), dots = document.querySelector('#hero .dots');
    transform(dots, st.zone === Z.BAND ? 'translateX(' + Math.round(action.offsetWidth * 1.06 + 32) + 'px)' : '');
  }

  function showBand(index) {
    st.band = Math.max(0, Math.min(items.length - 1, index));
    var item = items[st.band];
    showArt(item);
    showText(item, st.band, items.length);
  }

  /** The band takes the focused app's content now (an Up press, a tab, a new app count). */
  function followNow() {
    clearTimeout(followTimer);
    followPending = false;
    owner = fav.length ? fav[Math.min(st.row, fav.length - 1)] : null;
    items = itemsFor(owner);
    showBand(0);
  }

  /** As BG_FOLLOW_MS: only once the focus rests 500 ms; a quick run along the row changes nothing. */
  function followSoon() {
    clearTimeout(followTimer);
    followPending = true;
    followTimer = setTimeout(followNow, 500);
  }

  // MARK: - Top bar

  var TABS = ['Explorar', 'Filmes', 'Séries'];
  var BUTTONS = [['tv', 'TV aberta'], ['input', 'Entradas HDMI'], ['gear', 'Configurações']];

  function renderTop() {
    var tabs = $('tabs');
    tabs.innerHTML = '';
    for (var i = 0; i < TABS.length; i++) {
      var t = el('div', 'tab', tabs);
      el('div', 'cap', t);
      el('div', 'hl', t);
      el('span', '', t, TABS[i]);
    }
    renderInfo();
    var b = $('buttons');
    b.innerHTML = '';
    for (var k = 0; k < BUTTONS.length; k++) {
      var r = el('div', 'round', b);
      r.setAttribute('aria-label', BUTTONS[k][1]);
      el('div', 'glass', r);
      el('div', 'hl', r);
      glyph(BUTTONS[k][0], 28, r);
      el('div', 'tip', r, BUTTONS[k][1]);
    }
    // The profile: the last round button, left of the clock; its name is the tip, centered (the clock keeps it
    // inside the safe area: a 12-letter name ends near x=1760).
    var me = el('div', 'round profile', b);
    me.id = 'me';
    el('div', 'disk', me);
    el('div', 'hl', me);
    el('div', 'initial', me);
    glyph('bear', 14, el('div', 'kid', me));
    el('div', 'tip', me);
    me.onclick = function () { st.zone = Z.TOP; st.top = PROFILE_BUTTON; openProfiles(); updateFocus(); };
    me.onmousemove = function () {
      if ((st.zone === Z.TOP || st.zone === Z.ROW || st.zone === Z.BAND) && !(st.zone === Z.TOP && st.top === PROFILE_BUTTON)) {
        st.zone = Z.TOP; st.top = PROFILE_BUTTON; updateFocus();
      }
    };
    showProfile();
    tickClock();
  }

  /** The button shows the active profile: white initial on its color; with focus, its color on the white surface. */
  function showProfile() {
    var me = $('me'), p = profile();
    me.children[0].style.background = p.color;
    me.children[2].textContent = initial(p.name);
    me.children[2].style.color = hasClass(me, 'focus') ? p.color : '#FFF';
    setClass(me, 'kids', !!p.kids);
    me.children[4].textContent = p.name;
    me.setAttribute('aria-label', 'Perfil: ' + p.name + (p.kids ? ', infantil' : ''));
    $('bProf').textContent = 'Perfil: ' + p.name + ' (P)';
  }

  // MARK: - The TV info line: city · temperature · resolution · refresh · the last speed test (owner, 2026-11-01)

  // Parts in screen order; `drop` is the order they go when the line would reach the buttons (the speed item stays).
  var INFO = [{text: 'São Paulo', drop: 3}, {text: '24 °C', drop: 2}, {text: '4K', drop: 1}, {text: '60 Hz', drop: 0}];
  var HOUR = 3600000;
  // The simulated network (V): [label, last result, what the next test does]
  var NETS = [['testada há 2 h', {mbps: 230, ago: 2 * HOUR}, 'ok'], ['nunca testada', null, 'ok'],
    ['o teste falha', {mbps: 230, ago: 2 * HOUR}, 'fail'], ['sem rede', {mbps: 230, ago: 2 * HOUR}, 'offline']];
  var speed = {last: null, testing: -1, failed: false, timer: 0};

  function setNet(i) {
    opt.speed = i;
    var n = NETS[i];
    clearInterval(speed.timer);
    speed.testing = -1;
    speed.failed = false;
    speed.last = n[1] ? {mbps: n[1].mbps, at: new Date().getTime() - n[1].ago} : null;
  }

  function comma(x) { return ('' + x).replace('.', ','); }

  /** 230 -> "230 Mbps", 8.43 -> "8,4 Mbps", 1234 -> "1,2 Gbps" (the app formats with Ui.locale()). */
  function rate(mbps) {
    if (mbps >= 1000) return comma(Math.round(mbps / 100) / 10) + ' Gbps';
    if (mbps < 10) return comma(Math.round(mbps * 10) / 10) + ' Mbps';
    return Math.round(mbps) + ' Mbps';
  }

  function ago(at, spoken) {
    var m = Math.floor((new Date().getTime() - at) / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return 'há ' + m + (spoken ? (m === 1 ? ' minuto' : ' minutos') : ' min');
    var h = Math.floor(m / 60);
    if (h < 24) return 'há ' + h + (spoken ? (h === 1 ? ' hora' : ' horas') : ' h');
    if (h < 48) return 'ontem';
    return 'há ' + Math.floor(h / 24) + ' dias';
  }

  function renderInfo() {
    var info = $('info');
    info.innerHTML = '';
    for (var i = 0; i < INFO.length; i++) {
      var part = el('span', 'part', info, INFO[i].text);
      el('span', 'sep', part, '·');
    }
    var sp = el('div', 'speed', info);
    sp.id = 'speed';
    el('div', 'hl', sp);
    el('span', 'txt', sp);
    el('i', '', el('div', 'bar', sp));
    sp.onclick = function () { st.zone = Z.TOP; st.top = SPEED; ok(); updateFocus(); };
    sp.onmousemove = function () {
      if ((st.zone === Z.TOP || st.zone === Z.ROW || st.zone === Z.BAND) && !(st.zone === Z.TOP && st.top === SPEED)) {
        st.zone = Z.TOP; st.top = SPEED; updateFocus();
      }
    };
    showSpeed();
  }

  /** The speed item's state: the result, "Testar velocidade", "Testando…" with its bar, a failure or no network. */
  function showSpeed() {
    var sp = $('speed');
    if (!sp) return;
    var txt = sp.children[1], net = NETS[opt.speed][2], text = '', spoken = '', alert = false;
    txt.innerHTML = '';
    if (net === 'offline') {
      alert = true; text = 'Sem internet'; spoken = 'Sem conexão com a internet';
    } else if (speed.testing >= 0) {
      text = 'Testando…'; spoken = 'Testando a velocidade da internet';
    } else if (speed.failed) {
      alert = true; text = 'Teste falhou'; spoken = 'O teste de velocidade falhou. OK para tentar de novo';
    } else if (speed.last) {
      text = '↓ ' + rate(speed.last.mbps) + ' · ' + ago(speed.last.at);
      spoken = 'Velocidade da internet: ' + Math.round(speed.last.mbps) + ' megabits, testada ' + ago(speed.last.at, true) + '. OK para testar de novo';
    } else {
      text = 'Testar velocidade'; spoken = 'Velocidade da internet: ainda não testada. OK para testar';
    }
    if (alert) glyph('warn', 20, txt);
    txt.appendChild(document.createTextNode(text));
    setClass(sp, 'alert', alert);
    setClass(sp, 'testing', speed.testing >= 0);
    transform(sp.children[2].firstChild, 'scaleX(' + Math.max(0, speed.testing) + ')');
    sp.setAttribute('aria-label', spoken);
    $('bSpeed').textContent = 'Velocidade: ' + NETS[opt.speed][0] + ' (V)';
    fitInfo();
  }

  /** Drops Hz, then the resolution, the temperature and the city while the line would come within 32 px of the buttons. */
  function fitInfo() {
    var info = $('info'), parts = info.querySelectorAll('.part'), i, d;
    for (i = 0; i < parts.length; i++) setClass(parts[i], 'gone', false);
    var buttons = $('buttons'), limit = 1920 - (parseInt(buttons.style.right, 10) || 0) - buttons.offsetWidth - 32;
    for (d = 0; d < INFO.length; d++) {
      if (96 + info.offsetLeft + info.offsetWidth <= limit) break;
      for (i = 0; i < INFO.length; i++) if (INFO[i].drop === d) setClass(parts[i], 'gone', true);
    }
    var shown = 0;
    for (i = 0; i < parts.length; i++) if (!hasClass(parts[i], 'gone')) shown++;
    setClass($('speed'), 'alone', shown === 0);
  }

  /** OK on the speed item: ~10 s, 4 updates a second; simulated (the app asks speed.cloudflare.com, only on OK). */
  function startTest() {
    var net = NETS[opt.speed][2];
    if (net === 'offline') { toast('Sem conexão com a internet'); return; }
    if (speed.testing >= 0) return;   // already testing: OK does nothing
    speed.failed = false;
    speed.testing = 0;
    say('Testando a velocidade da internet');
    clearInterval(speed.timer);
    speed.timer = setInterval(function () {
      speed.testing = Math.min(1, speed.testing + 0.025);
      if (net === 'fail' && speed.testing >= 0.4) {
        clearInterval(speed.timer); speed.testing = -1; speed.failed = true;
        say('O teste de velocidade falhou. OK para tentar de novo');
      } else if (speed.testing >= 1) {
        clearInterval(speed.timer); speed.testing = -1;
        speed.last = {mbps: 180 + Math.floor(Math.random() * 80), at: new Date().getTime()};
        say('Velocidade da internet: ' + speed.last.mbps + ' megabits');
      }
      showSpeed();
    }, 250);
    showSpeed();
  }

  /** The prototype's stand-in for a TalkBack announcement. */
  function say(text) { $('sr').textContent = text; }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tickClock() {
    var d = new Date();
    $('clock').textContent = d.getHours() + ':' + pad(d.getMinutes());
    // The buttons sit left of the clock, 32 apart (the clock's width changes with the time).
    $('buttons').style.right = (96 + $('clock').offsetWidth + 32) + 'px';
    showSpeed();   // "há 2 h" moves on; the fit follows the buttons
  }

  // MARK: - Favorites row

  var first = 0;

  function tileFace(app, holder) {
    var t = el('div', 'tile', holder);
    el('div', 'shadow', t);
    var face = el('div', 'face', t);
    paint(face, [linear(180, [app.tile[0], app.tile[1]])]);
    var w = el('div', 'word' + (app.shade ? ' shade' : ''), face, app.name);
    w.style.color = app.word;
    w.style.fontSize = Math.max(24, Math.min(40, Math.floor(300 * 0.8 / (Math.max(4, app.name.length) * 0.56)))) + 'px';
    el('div', 'sheen', face);
    return t;
  }

  function renderRow() {
    var holder = $('tiles');
    holder.innerHTML = '';
    for (var i = 0; i < fav.length; i++) {
      var t = tileFace(fav[i], holder);
      t.style.left = (96 + i * 357) + 'px';
    }
    first = 0;
    placeRow();
  }

  /** Five tiles show; past that the row slides one app at a time with the focus. */
  function placeRow() {
    var n = 5;
    first = Math.max(0, Math.min(Math.max(first, st.row - n + 1), Math.min(st.row, fav.length - n)));
    if (fav.length <= n) first = 0;
    var tiles = $('tiles').children;
    for (var i = 0; i < tiles.length; i++) setClass(tiles[i], 'away', i < first || i >= first + n);
    transform($('tiles'), 'translateX(' + (-first * 357) + 'px)');
    setClass(document.querySelector('.chev.l'), 'on', first > 0);
    setClass(document.querySelector('.chev.r'), 'on', first + n < fav.length);
  }

  /** Parallax: the focused tile's sheen leans toward the last arrow, then springs back. */
  function lean(dx) {
    if (hasClass(stage, 'lite') || hasClass(stage, 'flat')) return;
    var tile = $('tiles').children[st.row];
    if (!tile) return;
    var sheen = tile.querySelector('.sheen');
    transform(sheen, 'translateX(' + (dx * 8) + 'px)');
    setTimeout(function () { transform(sheen, ''); }, 180);
  }

  // MARK: - Drawer

  var drawerItems = [];

  function renderDrawer() {
    var d = $('drawer');
    d.innerHTML = '';
    drawerItems = [
      {label: 'HDMI 1', symbol: 'input'},
      {label: 'HDMI 2', symbol: 'input', off: true},
      {label: 'TV ao Vivo', symbol: 'tv'},
      {label: 'Todos os Apps', symbol: 'apps', run: openApps},
      {label: 'Ajustes do Início', symbol: 'home'},
      {label: 'Ajustes da TV', symbol: 'tvgear'}
    ];
    var inputs = 3, x = 96, w = 240, gap = 18;
    el('div', 'group', d, 'Entradas').style.left = (x + 4) + 'px';
    for (var i = 0; i < drawerItems.length; i++) {
      if (i === inputs) {
        x += 56 - gap;
        el('div', 'group', d, 'Atalhos').style.left = (x + 4) + 'px';
      }
      var it = drawerItems[i], k = el('div', 'key glass' + (it.off ? ' off' : ''), d);
      k.style.left = x + 'px';
      k.style.width = w + 'px';
      el('div', 'hl', k);
      glyph(it.symbol, 36, k);
      el('div', 'label', k, it.label);
      x += w + gap;
    }
    // Weather, the whole safe width: the quotes leave Nova (owner, 2026-11-01; Classic keeps them when on).
    var wx = el('div', 'panel glass', d);
    wx.style.left = '96px';
    wx.style.width = '1728px';
    el('div', 'head', wx, 'São Paulo');
    el('div', 'temp', wx, '24°');
    el('div', 'cond', wx, 'Parcialmente nublado');
    el('div', 'range', wx, 'Máx. 27°   Mín. 18°');
    el('div', 'split', wx);
    var hours = [['15h', 'sun', '25°'], ['16h', 'sun', '25°'], ['17h', 'cloud', '24°'], ['18h', 'cloud', '22°'], ['19h', 'cloud', '21°'],
      ['20h', 'cloud', '20°'], ['21h', 'cloud', '20°'], ['22h', 'cloud', '19°'], ['23h', 'cloud', '19°'], ['0h', 'cloud', '18°']];
    for (var h = 0; h < hours.length; h++) {
      var hr = el('div', 'hour', wx);
      hr.style.left = (430 + h * 126) + 'px';
      el('div', 't', hr, hours[h][0]);
      glyph(hours[h][1], 32, hr);
      el('div', 'd', hr, hours[h][2]);
    }
  }

  function openDrawer() {
    st.zone = Z.DRAWER;
    st.drawer = Math.min(drawerItems.length - 1, Math.max(0, Math.round((st.row - first) * 357 / 258)));
  }

  function closeDrawer() { st.zone = Z.ROW; }

  // MARK: - All Apps

  function renderApps() {
    var grid = document.querySelector('#apps .grid');
    grid.innerHTML = '';
    for (var i = 0; i < others.length; i++) {
      var cell = el('div', 'cell', grid);
      cell.style.left = (96 + (i % 5) * 357) + 'px';
      cell.style.top = (184 + Math.floor(i / 5) * 240) + 'px';
      tileFace(others[i], cell);
      el('div', 'label', cell, others[i].name);
    }
  }

  var appsFrom = Z.DRAWER;

  function openApps() {
    appsFrom = st.zone;
    st.zone = Z.APPS;
    st.grid = 0;
    setClass($('apps'), 'open', true);
  }

  function closeApps() {
    setClass($('apps'), 'open', false);
    st.zone = appsFrom;
  }

  // MARK: - Profiles sheet ("Who's watching?")

  var profilesFrom = Z.TOP;

  /** Profiles, then Add while there are fewer than 6; one line centered on the screen. */
  function renderProfiles() {
    var list = document.querySelector('#profiles .who-list');
    list.innerHTML = '';
    var n = PROFILES.length + (PROFILES.length < MAX_PROFILES ? 1 : 0), w = 200, gap = 64;
    var x = Math.round((1920 - (n * w + (n - 1) * gap)) / 2);
    for (var i = 0; i < n; i++) {
      var add = i === PROFILES.length, p = PROFILES[i];
      var who = el('div', 'who' + (add ? ' add' : '') + (!add && i === st.profile ? ' on' : ''), list);
      who.style.left = (x + i * (w + gap)) + 'px';
      var orb = el('div', 'orb', who);
      el('div', 'shadow', orb);
      el('div', 'ring', orb);
      var disk = el('div', 'disk', orb);
      el('div', 'hl', orb);
      if (add) {
        glyph('plus', 72, orb);
        el('div', 'name', who, 'Adicionar');
        who.setAttribute('aria-label', 'Adicionar perfil');
      } else {
        disk.style.background = p.color;
        el('div', 'letter', orb, initial(p.name));
        if (i === st.profile) glyph('check', 28, el('div', 'badge', orb));
        if (p.kids) glyph('bear', 26, el('div', 'kid', orb));
        el('div', 'name', who, p.name);
        who.setAttribute('aria-label', p.name + (i === st.profile ? ', perfil ativo' : '') + (p.kids ? ', perfil infantil' : ''));
      }
      bindWho(who, i);
    }
  }

  /** Mouse: hover moves the focus only when the pointer comes onto another circle; a click picks it. */
  function bindWho(who, i) {
    who.onmousemove = function () { if (st.zone === Z.PROFILES && st.pick !== i) { st.pick = i; updateFocus(); } };
    who.onclick = function () { if (st.zone === Z.PROFILES) { st.pick = i; ok(); } };
  }

  function openProfiles() {
    if (st.zone === Z.PROFILES) return;
    if (st.zone === Z.APPS) closeApps();
    profilesFrom = st.zone;
    st.zone = Z.PROFILES;
    st.pick = st.profile;   // the focus starts on who is watching now
    renderProfiles();
    setClass($('profiles'), 'open', true);
    say('Quem está assistindo?');
  }

  /** A full start of the TV (web: a cold start): the sheet only with 2 or more profiles (owner, 2026-11-01). */
  function fullStart() {
    if (st.zone === Z.APPS) closeApps();
    if (st.zone === Z.PROFILES) closeProfiles(Z.ROW);
    st.zone = Z.ROW; st.row = 0;
    if (PROFILES.length >= 2) { openProfiles(); profilesFrom = Z.ROW; }
    else toast('Início completo: só o Principal, a TV não pergunta');
    updateFocus();
  }

  function closeProfiles(to) {
    setClass($('profiles'), 'open', false);
    st.zone = to;
  }

  /** Another profile: its row and band preferences, the focus on its first app. The same one: just close. */
  function choose(i) {
    if (i === st.profile) { closeProfiles(profilesFrom); return; }
    profile().tab = st.tab;
    st.profile = i;
    st.tab = opt.key ? profile().tab : 0;
    st.row = 0;
    closeProfiles(Z.ROW);
    setup();
    applyLook();
    toast('Perfil: ' + profile().name + (profile().kids ? ' · sugestões infantis' : ''));
  }

  // MARK: - Focus

  function updateFocus() {
    var i, list = $('tabs').children;
    for (i = 0; i < list.length; i++) {
      setClass(list[i], 'on', i === st.tab);
      setClass(list[i], 'focus', st.zone === Z.TOP && st.top === i);
    }
    list = $('buttons').children;
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.TOP && st.top === FIRST_BUTTON + i);
    var wasFocused = hasClass($('speed'), 'focus'), onSpeed = st.zone === Z.TOP && st.top === SPEED;
    setClass($('speed'), 'focus', onSpeed);
    // A failure shows until the focus leaves the item; then the last result (or "Testar velocidade") is back.
    if (wasFocused && !onSpeed && speed.failed) { speed.failed = false; showSpeed(); }
    showProfile();
    list = $('tiles').children;
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.ROW && st.row === i);
    placeRow();
    setClass(stage, 'band-focus', st.zone === Z.BAND);
    placeDots();
    list = document.querySelectorAll('#drawer .key');
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.DRAWER && st.drawer === i);
    setClass(stage, 'drawer-open', st.zone === Z.DRAWER || (st.zone === Z.APPS && appsFrom === Z.DRAWER) ||
      (st.zone === Z.PROFILES && profilesFrom === Z.DRAWER));
    setClass(stage, 'sheet-open', st.zone === Z.APPS || st.zone === Z.PROFILES);
    list = document.querySelectorAll('#profiles .who');
    for (i = 0; i < list.length; i++) setClass(list[i], 'focus', st.zone === Z.PROFILES && st.pick === i);
    list = document.querySelectorAll('#apps .cell');
    for (i = 0; i < list.length; i++) {
      setClass(list[i], 'focus', st.zone === Z.APPS && st.grid === i);
      setClass(list[i].firstChild, 'focus', st.zone === Z.APPS && st.grid === i);
    }
    var rows = Math.ceil(others.length / 5), r = Math.floor(st.grid / 5), top = Math.max(0, Math.min(rows - 3, r - 1));
    transform(document.querySelector('#apps .grid'), 'translateY(' + (-top * 240) + 'px)');
  }

  // MARK: - Keys

  function minTop() { return opt.key ? 0 : SPEED; }

  function move(dx, dy) {
    switch (st.zone) {
      case Z.ROW:
        if (dx) {
          var to = Math.max(0, Math.min(fav.length - 1, st.row + dx));
          if (to !== st.row) { st.row = to; lastDir = dx; followSoon(); }
          updateFocus();
          lean(dx);
          return;
        }
        if (dy > 0) { openDrawer(); break; }
        if (owner !== fav[st.row]) followNow();   // Up acts on the app in focus, even before the 500 ms
        if (bandFocusable()) st.zone = Z.BAND;
        else { st.zone = Z.TOP; st.top = opt.key ? st.tab : SPEED; }
        break;
      case Z.BAND:
        if (dx) { var b = Math.max(0, Math.min(items.length - 1, st.band + dx)); if (b !== st.band) showBand(b); }
        else if (dy < 0) { st.zone = Z.TOP; st.top = opt.key ? st.tab : SPEED; }
        else backToRow();
        break;
      case Z.TOP:
        if (dx) {
          st.top = Math.max(minTop(), Math.min(PROFILE_BUTTON, st.top + dx));
          // Focusing a tab selects it; the band re-filters once the focus rests (running past the tabs decodes nothing).
          if (st.top < SPEED && st.top !== st.tab) { st.tab = st.top; followSoon(); }
        } else if (dy > 0) {
          if (followPending) followNow();
          if (bandFocusable()) st.zone = Z.BAND;
          else backToRow();
        }
        break;
      case Z.DRAWER:
        if (dx) st.drawer = Math.max(0, Math.min(drawerItems.length - 1, st.drawer + dx));
        else if (dy < 0) closeDrawer();
        break;
      case Z.APPS:
        var g = st.grid + dx + dy * 5;
        if (g >= 0 && g < others.length && (dx === 0 || Math.floor(g / 5) === Math.floor(st.grid / 5))) st.grid = g;
        break;
      case Z.PROFILES:   // one line: left and right stop at the ends, up and down do nothing
        if (dx) st.pick = Math.max(0, Math.min(document.querySelectorAll('#profiles .who').length - 1, st.pick + dx));
        break;
    }
    updateFocus();
  }

  /** Down from the band or the top, and Back: the row, on the app the band belongs to. */
  function backToRow() {
    st.zone = Z.ROW;
    for (var i = 0; i < fav.length; i++) if (fav[i] === owner) st.row = i;
  }

  function ok() {
    switch (st.zone) {
      case Z.ROW: toast('Abriria ' + fav[st.row].name); return;
      case Z.BAND:
        var it = items[st.band];
        toast(it.type === 'cont' ? 'Continuaria “' + it.title + '” no ' + it.app.name : 'Abriria “' + it.title + '” no ' + it.app.name);
        return;
      case Z.TOP:
        if (st.top < SPEED) return;
        if (st.top === SPEED) startTest();
        else if (st.top === FIRST_BUTTON) toast('Abriria a TV aberta');
        else if (st.top === FIRST_BUTTON + 1) { openDrawer(); st.drawer = 0; updateFocus(); }
        else if (st.top === FIRST_BUTTON + 2) toast('Abriria Ajustes do Início');
        else { openProfiles(); updateFocus(); }
        return;
      case Z.DRAWER:
        var d = drawerItems[st.drawer];
        if (d.run) { d.run(); updateFocus(); } else toast(d.off ? d.label + ': sem sinal' : 'Abriria ' + d.label);
        return;
      case Z.APPS: toast('Abriria ' + others[st.grid].name); return;
      case Z.PROFILES:
        if (st.pick < PROFILES.length) choose(st.pick);
        else toast('Abriria “Adicionar perfil”: nome e cor; começa com a fileira de ' + profile().name + ' (card 214)');
        updateFocus();
        return;
    }
  }

  function back() {
    if (st.zone === Z.PROFILES) closeProfiles(profilesFrom);   // nothing changes
    else if (st.zone === Z.APPS) closeApps();
    else if (st.zone === Z.DRAWER) closeDrawer();
    else if (st.zone === Z.BAND || st.zone === Z.TOP) backToRow();
    else toast('Voltar na fileira: nada (já é o Início)');
    updateFocus();
  }

  var toastTimer = 0;
  function toast(text) {
    var t = $('toast');
    t.textContent = text;
    setClass(t, 'on', true);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { setClass(t, 'on', false); }, 2600);
  }

  // MARK: - Prototype switches

  var COUNTS = [10, 20, 3, 8];

  function setup() {
    fav = rowOf(profile());
    others = [];
    for (var i = 0; i < POOL.length; i++) if (!inRow(POOL[i][0])) others.push(appOf(POOL[i]));
    st.row = Math.min(st.row, fav.length - 1);
    renderRow();
    renderApps();
    followNow();
    updateFocus();
    $('bApps').textContent = 'Apps: ' + fav.length + ' (A)';
  }

  function isNight() {
    if (opt.night !== null) return opt.night;
    var h = new Date().getHours();
    return h < 6 || h >= 18;
  }

  function applyLook() {
    setClass(stage, 'night', isNight());
    setClass(stage, 'flat', opt.perf === 'flat');
    setClass(stage, 'lite', opt.perf === 'lite');
    setClass(stage, 'no-key', !opt.key);
    setClass(stage, 'hd', opt.hd);
    $('bNight').textContent = (isNight() ? 'Noite' : 'Dia') + ' (N)';
    $('bPerf').textContent = 'Modo: ' + opt.perf + ' (L)';
    $('bKey').textContent = 'Chave TMDB: ' + (opt.key ? 'sim' : 'não') + ' (K)';
    $('bApps').textContent = 'Apps: ' + fav.length + ' (A)';
    $('bCont').textContent = 'Continuar assistindo: ' + (opt.cont ? 'sim' : 'não') + ' (C)';
    $('b720').textContent = (opt.hd ? '1280×720' : 'Ajustar à janela') + ' (R)';
    $('bAlone').textContent = 'Perfis: ' + (opt.single ? 'só o Principal' : '3') + ' (U)';
    fit();
    showSpeed();
  }

  var actions = {
    n: function () { opt.night = !isNight(); applyLook(); },
    l: function () { opt.perf = opt.perf === 'normal' ? 'flat' : opt.perf === 'flat' ? 'lite' : 'normal'; applyLook(); },
    k: function () {
      opt.key = !opt.key;
      if (!opt.key && st.zone === Z.TOP && st.top < SPEED) st.top = SPEED;
      applyLook(); followNow();
      if (st.zone === Z.BAND && !bandFocusable()) backToRow();
      updateFocus();
    },
    a: function () {
      // the active profile's count: 10 -> 20 -> 3 -> 8 (a count not on that list goes to 10)
      var p = profile(), n = p.count || p.keys.length;
      p.count = COUNTS[(COUNTS.indexOf(n) + 1) % COUNTS.length];
      if (st.zone === Z.APPS) closeApps();
      if (st.zone === Z.PROFILES) closeProfiles(Z.ROW);
      if (st.zone !== Z.DRAWER) st.zone = Z.ROW;
      st.row = 0; setup(); applyLook();
    },
    p: function () { openProfiles(); updateFocus(); },
    c: function () {
      opt.cont = !opt.cont; applyLook(); followNow();
      if (st.zone === Z.BAND && !bandFocusable()) backToRow();
      updateFocus();
    },
    r: function () { opt.hd = !opt.hd; applyLook(); },
    v: function () { setNet((opt.speed + 1) % NETS.length); showSpeed(); updateFocus(); },
    u: function () {
      opt.single = !opt.single;
      PROFILES = opt.single ? ALONE : HOUSE;
      st.profile = 0; st.tab = opt.key ? profile().tab : 0;
      if (st.zone === Z.APPS) closeApps();
      if (st.zone === Z.PROFILES) closeProfiles(Z.ROW);
      if (st.zone !== Z.DRAWER) st.zone = Z.ROW;
      st.row = 0; setup(); applyLook();
    },
    o: function () { fullStart(); }
  };

  function bind(id, key) {
    var b = $(id);
    b.onmousedown = function (e) { e.preventDefault(); };   // the toolbar never takes the keyboard focus
    b.onclick = function () { actions[key](); };
  }

  /** The 1920 × 1080 stage, scaled to fit the window; "1280×720" shows it at exactly 2/3, as the TCL's 720p UI. */
  function fit() {
    var view = $('view'), w = view.clientWidth, h = view.clientHeight;
    var s = opt.hd ? 2 / 3 : Math.min(w / 1920, h / 1080);
    transform(stage, 'scale(' + s + ')');
    stage.style.left = Math.max(0, Math.round((w - 1920 * s) / 2)) + 'px';
    stage.style.top = Math.max(0, Math.round((h - 1080 * s) / 2)) + 'px';
  }

  document.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    if (k === 37) move(-1, 0);
    else if (k === 39) move(1, 0);
    else if (k === 38) move(0, -1);
    else if (k === 40) move(0, 1);
    else if (k === 13) ok();
    else if (k === 27 || k === 8) back();
    else {
      var c = String.fromCharCode(k).toLowerCase();
      if (actions[c] && !e.ctrlKey && !e.metaKey && !e.altKey) actions[c]();
      return;
    }
    e.preventDefault();
  });

  window.onresize = fit;
  window.addEventListener('load', tickClock);   // Inter changes the clock's width once it loads
  bind('bNight', 'n'); bind('bPerf', 'l'); bind('bKey', 'k'); bind('bApps', 'a'); bind('bCont', 'c'); bind('b720', 'r'); bind('bProf', 'p');
  bind('bSpeed', 'v'); bind('bAlone', 'u'); bind('bStart', 'o');
  var chevs = document.querySelectorAll('.chev');
  glyph('left', 24, chevs[0]);
  glyph('right', 24, chevs[1]);
  /**
   * A state from the address, for screenshots: #night=1&perf=lite&key=0&apps=20&cont=0&hd=1&profile=1&speed=2&single=1
   * &start=1&keys=rrru (keys: l r u d = arrows, o = OK, b = Back, p = the profiles sheet; apps= sets Ana's count;
   * speed= 0 tested, 1 never, 2 the test fails, 3 no network; single=1 only Principal; start=1 a full start).
   */
  function fromHash() {
    var parts = location.hash.replace(/^#/, '').split('&'), keys = '';
    start = false;
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split('='), v = kv[1];
      if (kv[0] === 'night') opt.night = v === '1';
      else if (kv[0] === 'perf' && (v === 'flat' || v === 'lite')) opt.perf = v;
      else if (kv[0] === 'key') opt.key = v !== '0';
      else if (kv[0] === 'cont') opt.cont = v !== '0';
      else if (kv[0] === 'hd') opt.hd = v === '1';
      else if (kv[0] === 'apps' && COUNTS.indexOf(+v) >= 0) PROFILES[0].count = +v;
      else if (kv[0] === 'speed' && NETS[+v]) setNet(+v);
      else if (kv[0] === 'single' && v === '1') { opt.single = true; PROFILES = ALONE; }
      else if (kv[0] === 'start') start = v === '1';
      else if (kv[0] === 'profile' && PROFILES[+v]) { st.profile = +v; st.tab = PROFILES[+v].tab; }
      else if (kv[0] === 'keys') keys = v || '';
    }
    return keys;
  }

  function press(keys) {
    for (var i = 0; i < keys.length; i++) {
      var c = keys.charAt(i);
      if (c === 'l') move(-1, 0);
      else if (c === 'r') move(1, 0);
      else if (c === 'u') move(0, -1);
      else if (c === 'd') move(0, 1);
      else if (c === 'o') ok();
      else if (c === 'b') back();
      else if (c === 'p') { openProfiles(); updateFocus(); }
    }
  }

  var start = false;
  setNet(0);
  var keys = fromHash();
  renderTop();
  renderDrawer();
  applyLook();
  setup();
  if (start) fullStart();
  press(keys);
  setInterval(tickClock, 15000);
  setInterval(function () { if (opt.night === null) applyLook(); }, 60000);
}());
