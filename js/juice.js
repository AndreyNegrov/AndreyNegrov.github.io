// Профиль курьера и сдержанный игровой отклик: репутация, уровни доступа, отметки,
// серия точных ответов, подсказки куратора, всплывающие числа и тихая музыка.
// Никаких эмодзи и мигания: всё рисуется линиями и одним акцентным цветом.

Object.assign(ICON, {
  key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M16 6l3 3M14 8l2 2"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  ear: '<svg viewBox="0 0 24 24"><path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 9a2 2 0 0 1 4 0"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l1 12H4z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  route: '<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  starFill: '<svg viewBox="0 0 24 24"><path class="fill" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/></svg>',
  board: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 9h3M13 9h3M8 13h8M9 21l3-3 3 3"/></svg>',
  headset: '<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
  snow: '<svg viewBox="0 0 24 24"><path d="M12 2v20M4 7l16 10M20 7L4 17M9 4l3 3 3-3M9 20l3-3 3 3"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L5 14h6l-1 8 8-12h-6z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" class="fill"/></svg>',
  cup: '<svg viewBox="0 0 24 24"><path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z"/><path d="M16 10h2a2 2 0 0 1 0 5h-2M8 3v2M12 3v2"/></svg>',
  wave: '<svg viewBox="0 0 24 24"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>',
  cipher: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="5" height="5" rx="1"/><rect x="10" y="6" width="5" height="5" rx="1"/><rect x="17" y="6" width="4" height="5" rx="1"/><rect x="3" y="14" width="8" height="5" rx="1"/><rect x="13" y="14" width="8" height="5" rx="1"/></svg>'
});

// Уровни доступа в Relay: чем выше, тем «особее» заказы.
const RANKS = [
  { at: 0, name: "Новичок", mark: "I" },
  { at: 300, name: "Бронза", mark: "II" },
  { at: 800, name: "Серебро", mark: "III" },
  { at: 1400, name: "Золото", mark: "IV", perk: "Подсказка куратора: +1 на миссию" },
  { at: 2100, name: "Приоритет", mark: "V", perk: "«Остыть»: +1 на миссию" },
  { at: 2900, name: "Чёрный уровень", mark: "VI" },
  { at: 3800, name: "Свой", mark: "VII", perk: "«Отвлечь»: +1 на миссию" },
  { at: 5000, name: "Легенда", mark: "VIII" }
];

// Отметки в личном деле. Выдаются один раз.
const BADGES = {
  listener: { ico: "ear", name: "Чужая память", how: "Запомнить чужое воспоминание на слух, не открывая текст" },
  exact: { ico: "check", name: "Точные показания", how: "Дать комиссии четыре точных ответа" },
  first: { ico: "user", name: "Допуск", how: "Пройти проверку Kit" },
  voice: { ico: "wave", name: "Голосом", how: "Ответить голосом десять раз" },
  combo5: { ico: "bolt", name: "Пять подряд", how: "Пять точных ответов подряд" },
  combo10: { ico: "bolt", name: "Десять подряд", how: "Десять точных ответов подряд" },
  repair: { ico: "chat", name: "Переспросил(а)", how: "Пять раз переспросить по-английски" },
  cold: { ico: "snow", name: "Холодная голова", how: "Миссия без засветки" },
  fivestar: { ico: "star", name: "Пять звёзд", how: "Заказ без единой ошибки" },
  eyes: { ico: "eye", name: "Внимательный", how: "Заметить, что в пакете не хватает блюда" },
  nav: { ico: "route", name: "Без навигатора в голове", how: "Маршрут без единого промаха" },
  seal: { ico: "lock", name: "Пломба цела", how: "Узнать, что в сумке, не вскрывая её" },
  ghost: { ico: "ear", name: "Тень у погрузки", how: "Подслушать разговор и не попасться" },
  ears: { ico: "ear", name: "Острый слух", how: "Поймать все слова в одном разговоре" },
  reader: { ico: "doc", name: "Читает мелкий шрифт", how: "Разобрать документ без ошибок" },
  trust: { ico: "key", name: "Ключ от 4B", how: "Заслужить доверие Даны" },
  calm: { ico: "headset", name: "Ровный голос", how: "Ответить Kit без единой запинки" },
  sleuth: { ico: "board", name: "Вся цепочка", how: "Собрать доску без ошибок" },
  record: { ico: "wave", name: "Всё на записи", how: "Вейл сам сказал всё три раза" },
  clean: { ico: "shield", name: "Чистая работа", how: "Лучший финал" },
  stars: { ico: "star", name: "Все звёзды", how: "Собрать все звёзды сезона" },
  phrases: { ico: "chat", name: "Разговорник", how: "Сказать вслух пятнадцать фраз-инструментов" },
  streak3: { ico: "target", name: "Три дня подряд", how: "Тренироваться три дня подряд" },
  echo: { ico: "wave", name: "Эхо", how: "Повторить пять фраз без единой ошибки" },
  // Сезон «Онбординг»
  snap: { ico: "doc", name: "Скриншотер", how: "Успеть сохранить удалённое сообщение" },
  speller: { ico: "chat", name: "Эйч-оу-эл-эл", how: "Продиктовать фамилию по буквам с первого раза" },
  nosy: { ico: "lock", name: "Нижний ящик", how: "Открыть то, что просили не открывать" },
  explorer: { ico: "eye", name: "Любопытный", how: "Прочитать всё, что лежит в офисе" },
  decoder: { ico: "cipher", name: "Шифровальщик", how: "Собрать шифровку без ошибок" },
  cracker: { ico: "wave", name: "Перехват", how: "Записать журнал двери без ошибок" },
  smooth: { ico: "chat", name: "Ни одной неловкой паузы", how: "Идеальная поездка в лифте" },
  chatty: { ico: "cup", name: "Душа компании", how: "Задержать Грейс, не потеряв её терпения" }
};

const Profile = {
  key: "iney-profile",
  data: null,
  fresh() { return { xp: 0, badges: {}, best: {}, streak: 0, lastDay: "", stats: {} }; },
  get() {
    if (!this.data) {
      try { this.data = Object.assign(this.fresh(), JSON.parse(localStorage.getItem(this.key) || "null") || {}); }
      catch { this.data = this.fresh(); }
    }
    return this.data;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.get())); } catch { /* приватный режим */ } },
  rank(xp = this.get().xp) {
    let i = 0;
    RANKS.forEach((r, k) => { if (xp >= r.at) i = k; });
    const cur = RANKS[i], next = RANKS[i + 1] || null;
    return { i, ...cur, next, pct: next ? clamp(((xp - cur.at) / (next.at - cur.at)) * 100, 0, 100) : 100 };
  },
  stat(k, n = 1) { const s = this.get().stats; s[k] = (s[k] || 0) + n; this.save(); return s[k]; },
  best(k, v) { const b = this.get().best; if (v > (b[k] || 0)) { b[k] = v; this.save(); return true; } return false; },
  day(d = new Date()) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); },
  trainedToday() { return this.get().lastDay === this.day(); },
  // Первая тренировка за сутки удваивает репутацию и продлевает серию дней.
  markTraining() {
    const p = this.get(), t = this.day();
    if (p.lastDay === t) return false;
    p.streak = p.lastDay === this.day(new Date(Date.now() - 864e5)) ? (p.streak || 0) + 1 : 1;
    p.lastDay = t;
    this.save();
    if (p.streak >= 3) Juice.badge("streak3");
    return true;
  }
};

// ───────── подсказки и приёмы (заряды на миссию) ─────────
const GADGETS = {
  whisper: { ico: "headset", name: "Суфлёр", how: "Сова подскажет, что сказать" },
  freeze: { ico: "snow", name: "Остыть", how: "Засветка минус 25" },
  cookie: { ico: "spark", name: "Отвлечь", how: "Сбросить чужое внимание" }
};
const Gadgets = {
  stock() {
    const r = Profile.rank().i;
    return { whisper: r >= 3 ? 3 : 2, freeze: r >= 4 ? 2 : 1, cookie: r >= 6 ? 2 : 1 };
  },
  refill() { state.kit3 = this.stock(); },
  left(id) { if (!state.kit3) this.refill(); return state.kit3[id] || 0; },
  use(id) {
    if (this.left(id) <= 0) return false;
    state.kit3[id] -= 1;
    Store.save();
    return true;
  },
  html(ids) {
    return ids.map((id) => {
      const g = GADGETS[id], n = this.left(id);
      return `<button class="gadget" data-gadget="${id}" ${n ? "" : "disabled"} title="${esc(g.how)}">${ICON[g.ico]}<b>${esc(g.name)}</b><em>${n}</em></button>`;
    }).join("");
  }
};

const Juice = {
  combo: 0,
  parts: [],
  raf: 0,

  init() {
    if (this.fl) return;
    this.cv = document.createElement("canvas");
    this.cv.id = "fx-canvas";
    document.body.appendChild(this.cv);
    this.fl = document.createElement("div");
    this.fl.id = "floaters";
    document.body.appendChild(this.fl);
    const size = () => { this.cv.width = innerWidth; this.cv.height = innerHeight; };
    size();
    window.addEventListener("resize", size);
  },

  at(el, top) {
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.width || r.height) return { x: r.left + r.width / 2, y: top ? r.top + Math.min(r.height * 0.3, 24) : r.top + r.height / 2 };
    }
    return { x: innerWidth / 2, y: innerHeight * 0.36 };
  },

  // Отклик в шапке: плашка на пару секунд накрывает свой индикатор (уровень или засветку), а не летает по экрану.
  // Несколько начислений подряд складываются в одно число.
  chip(host, text, kind, add) {
    this.init();
    const r = host && host.getBoundingClientRect();
    if (!r || !r.width) return false;
    this._chips = this._chips || {};
    let c = this._chips[kind];
    if (!c || !c.el.isConnected) {
      c = this._chips[kind] = { el: document.createElement("div"), n: 0 };
      c.el.className = "gain " + kind;
      this.fl.appendChild(c.el);
    }
    if (add) { c.n += add; c.el.textContent = c.n === add ? text : "+" + c.n; } else c.el.textContent = text;
    Object.assign(c.el.style, { left: r.left + "px", top: r.top + "px", minWidth: r.width + "px", height: r.height + "px" });
    c.el.classList.remove("go");
    void c.el.offsetWidth;
    c.el.classList.add("go");
    clearTimeout(c.t);
    c.t = setTimeout(() => { c.el.remove(); if (this._chips[kind] === c) delete this._chips[kind]; }, 1500);
    return true;
  },
  float(text, el, kind = "") {
    this.init();
    if (el && el.id === "hud-sus" && this.chip($(".sus", el) || el, text, kind || "bad")) return;
    let box = $("#float-stack");
    if (!box) { box = document.createElement("div"); box.id = "float-stack"; this.fl.appendChild(box); }
    const f = document.createElement("div");
    f.className = "floater " + kind;
    f.textContent = text;
    box.appendChild(f);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => f.remove(), 1900);
  },

  banner(text, kind = "", sub = "") {
    this.init();
    const b = document.createElement("div");
    b.className = "banner " + kind;
    b.innerHTML = `<b>${esc(text)}</b>${sub ? `<span>${esc(sub)}</span>` : ""}`;
    this.fl.appendChild(b);
    setTimeout(() => b.remove(), 2000);
  },

  shake(el = $("#scene")) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 320);
  },

  flash(kind = "bad") {
    this.init();
    const f = document.createElement("div");
    f.className = "screen-flash " + kind;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
  },

  // Редкие тёплые искры вместо конфетти: только на больших событиях.
  spawn(list) {
    this.init();
    this.parts.push(...list);
    if (!this.raf) { this.t0 = performance.now(); this.raf = requestAnimationFrame((t) => this.tick(t)); }
  },
  sparks(el, color = "#ffc94a", count = 8) {
    const p = el && el.x != null ? el : this.at(el);
    const list = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 1.8;
      list.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.4, g: 0.01, life: 40 + Math.random() * 30, r: 1 + Math.random() * 1.4, c: color });
    }
    this.spawn(list);
  },
  confetti(el, count = 30) { this.sparks(el, "#ffc94a", Math.min(count, 22)); this.sparks(el, "#8f9bff", 10); },
  rain() { /* не используется */ },
  tick(t) {
    const cx = this.cv.getContext("2d");
    const k = clamp((t - this.t0) / 16.7, 0.5, 3);
    this.t0 = t;
    cx.clearRect(0, 0, this.cv.width, this.cv.height);
    this.parts = this.parts.filter((p) => p.life > 0);
    for (const p of this.parts) {
      p.vy += p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.life -= k; p.vx *= 0.985; p.vy *= 0.985;
      cx.globalAlpha = clamp(p.life / 30, 0, 0.9);
      cx.fillStyle = p.c;
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
    }
    cx.globalAlpha = 1;
    this.raf = this.parts.length ? requestAnimationFrame((x) => this.tick(x)) : 0;
  },

  // ───── репутация и уровни ─────
  xp(n, el, label) {
    n = Math.round(n);
    if (!n) return;
    const P = Profile.get();
    const before = Profile.rank();
    P.xp += n;
    Profile.save();
    if (Game.inPlay() && state.season === 3) { const st = Mission.stats(); st.xp = (st.xp || 0) + n; }
    this.hud(true);
    if (n >= 5) this.chip($("#hud-xp .xpchip"), `+${n}${label ? " · " + label : ""}`, "xp", n);
    const after = Profile.rank();
    if (after.i > before.i) setTimeout(() => this.rankUp(after), 700);
  },
  rankUp(r) {
    Sound.sfx("levelup");
    this.banner(`Уровень: ${r.name}`, "rank", r.perk || "Тебе доверяют больше");
  },
  hud(bump) {
    const box = $("#hud-xp");
    if (!box) return;
    const r = Profile.rank(), xp = Profile.get().xp;
    box.innerHTML = `<div class="xpchip ${bump ? "bump" : ""}" title="${esc(r.name)} · репутация ${xp}${r.next ? " · до уровня «" + esc(r.next.name) + "» " + (r.next.at - xp) : ""}">
      <i>${r.mark}</i><div><b>${esc(r.name)}</b><div class="xp-bar"><u style="width:${r.pct}%"></u></div></div></div>
      ${this.combo >= 3 ? `<div class="combochip" title="Точных ответов подряд">${ICON.bolt}<b>${this.combo}</b></div>` : ""}`;
  },

  // ───── серия точных ответов ─────
  hit(el, { first = true, voice = false, base = 8 } = {}) {
    if (first) this.combo += 1; else this.combo = 0;
    const gain = base + (first ? 3 : 0) + Math.min(this.combo, 5) + (voice ? 5 : 0);
    this.xp(gain, el, voice ? "голосом" : "");
    Sound.sfx(this.combo >= 3 ? "combo" : "xp");
    if (first && el) this.sparks(el, "#ffc94a", this.combo >= 3 ? 12 : 6);
    if (voice && Profile.stat("voice") === 10) this.badge("voice");
    if (this.combo === 5) this.badge("combo5");
    if (this.combo === 10) this.badge("combo10");
    this.hud(true);
    return gain;
  },
  miss() {
    this.combo = 0;
    this.hud();
  },

  // ───── отметки ─────
  badge(id) {
    const B = BADGES[id];
    if (!B) return false;
    const P = Profile.get();
    if (P.badges[id]) return false;
    P.badges[id] = Date.now();
    Profile.save();
    if (Game.inPlay() && state.season === 3) { const st = Mission.stats(); (st.badges = st.badges || []).push(id); }
    this.init();
    const el = document.createElement("div");
    el.className = "badge-pop";
    el.innerHTML = `<i>${ICON[B.ico]}</i><div><span>Отметка в личном деле</span><b>${esc(B.name)}</b></div>`;
    document.body.appendChild(el);
    Sound.sfx("star");
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, 3400);
    this.xp(20);
    return true;
  },
  badgeHTML(id, owned) {
    const B = BADGES[id];
    return `<div class="sticker ${owned ? "on" : ""}"><i>${ICON[owned ? B.ico : "lock"]}</i><b>${esc(B.name)}</b><span>${esc(B.how)}</span></div>`;
  }
};

// ───────── музыка: тихий луп для меню и мини-игр ─────────
// Два стиля: ночной (медленный, без ударных) и мультяшный для сезона «Онбординг» (шпионский грув с хэтом и бочкой).
const Music = (() => {
  let timer = null, step = 0, nextT = 0, mode = null, out = null, style = "night";
  const N = { A1: 55, C2: 65.4, D2: 73.4, E2: 82.4, F2: 87.3, G2: 98, A2: 110, C3: 130.8, D3: 146.8, E3: 164.8, F3: 174.6, G3: 196, A3: 220, B3: 246.9,
    C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, C5: 523.3, E5: 659.3 };
  const STYLES = {
    night: {
      S: 60 / 92 / 2, fadeIn: 1.2, fadeOut: 0.2, attack: 0.02,
      BASS: {
        calm: ["A2", 0, 0, "A2", 0, 0, "E3", 0, "F2", 0, 0, "F2", 0, 0, "C3", 0, "D2", 0, 0, "D2", 0, 0, "A2", 0, "E2", 0, 0, "E2", 0, 0, "E3", 0],
        tense: ["A2", 0, "A2", 0, "A2", 0, "C3", 0, "A2", 0, "A2", 0, "G2", 0, "E2", 0, "F2", 0, "F2", 0, "F2", 0, "A2", 0, "E2", 0, "E2", 0, "E2", 0, "D3", 0]
      },
      LEAD: {
        calm: [0, 0, 0, 0, "E4", 0, 0, 0, 0, 0, "C4", 0, 0, 0, 0, 0, 0, 0, 0, 0, "D4", 0, 0, "F4", 0, 0, 0, 0, "E4", 0, 0, 0],
        tense: [0, 0, "A4", 0, 0, 0, 0, 0, 0, 0, "E4", 0, 0, 0, "G4", 0, 0, 0, "F4", 0, 0, 0, 0, 0, 0, 0, "E4", 0, 0, 0, 0, 0]
      },
      note(i, b, l, t, S) {
        if (b) tone(N[b], t, S * 2.6, "sine", 0.22, 300, 0.02);
        if (l) tone(N[l], t, S * 5, "sine", 0.045, 0, 0.02);
      }
    },
    toon: {
      S: 60 / 104 / 2, fadeIn: 0.6, fadeOut: 0.12, attack: 0.012,
      BASS: {
        calm: ["A2", 0, "A2", "C3", 0, "E3", "D3", 0, "F2", 0, "F2", "A2", 0, "C3", "A2", 0, "D2", 0, "D2", "F2", 0, "A2", "F2", 0, "E2", 0, "E2", "G2", 0, "B3", "E3", 0],
        tense: ["A2", "A2", 0, "A2", "C3", 0, "A2", "G2", "A2", "A2", 0, "A2", "D3", 0, "C3", "G2", "F2", "F2", 0, "F2", "A2", 0, "F2", "E2", "E2", "E2", 0, "E2", "G2", 0, "E3", "D3"]
      },
      LEAD: {
        calm: [0, 0, "E4", 0, 0, "A4", 0, "G4", 0, 0, "C4", 0, 0, "F4", 0, "E4", 0, 0, "D4", 0, 0, "F4", 0, "A4", 0, 0, "E4", 0, "G4", 0, "E4", 0],
        tense: ["A4", 0, 0, "C5", 0, 0, "A4", 0, 0, "E4", 0, 0, "G4", 0, 0, 0, "F4", 0, 0, "A4", 0, 0, "C5", 0, "E5", 0, 0, "B3", 0, "E4", 0, 0]
      },
      note(i, b, l, t, S) {
        if (b) tone(N[b], t, S * 1.5, "triangle", 0.26, 420, 0.012);
        if (l) { tone(N[l], t, S * 2.4, "sine", 0.075, 0, 0.012); tone(N[l] * 2, t, S * 1.2, "sine", 0.02, 0, 0.012); }
        if (i % 2 === 1) hat(t, mode === "tense" ? 0.07 : 0.045);
        if (i % 8 === 0 || (mode === "tense" && i % 8 === 5)) kick(t);
      }
    }
  };
  function tone(freq, t, dur, type, vol, lp, attack) {
    const cx = Sound.ctx, o = cx.createOscillator(), g = cx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (lp) { const f = cx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; o.connect(f); node = f; }
    node.connect(g); g.connect(out);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function hat(t, vol) {
    const cx = Sound.ctx, len = Math.floor(cx.sampleRate * 0.05), buf = cx.createBuffer(1, len, cx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = cx.createBufferSource(), f = cx.createBiquadFilter(), g = cx.createGain();
    s.buffer = buf; f.type = "highpass"; f.frequency.value = 6500; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(out); s.start(t);
  }
  function kick(t) {
    const cx = Sound.ctx, o = cx.createOscillator(), g = cx.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.25);
  }
  function schedule() {
    const cx = Sound.ctx, st = STYLES[style];
    if (!cx || !mode) return;
    while (nextT < cx.currentTime + 0.25) {
      const i = step % 32;
      st.note(i, st.BASS[mode][i], st.LEAD[mode][i], nextT, st.S);
      nextT += st.S;
      step += 1;
    }
  }
  return {
    play(m = "calm") {
      if (!Sound.ensure()) return;
      const want = typeof TOON === "function" && TOON() ? "toon" : "night";
      if (mode === m && style === want && timer) return;
      this.stop();
      mode = m;
      style = want;
      out = Sound.ctx.createGain();
      out.gain.value = 0;
      out.gain.linearRampToValueAtTime(1, Sound.ctx.currentTime + STYLES[style].fadeIn);
      out.connect(Sound.musicBus);
      step = 0;
      nextT = Sound.ctx.currentTime + 0.08;
      timer = setInterval(schedule, 90);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
      mode = null;
      if (out && Sound.ctx) {
        const o = out, k = STYLES[style].fadeOut;
        try { o.gain.cancelScheduledValues(Sound.ctx.currentTime); o.gain.setTargetAtTime(0, Sound.ctx.currentTime, k); } catch { /* контекст закрыт */ }
        setTimeout(() => { try { o.disconnect(); } catch { /* уже отключён */ } }, k > 0.15 ? 900 : 700);
      }
      out = null;
    }
  };
})();
