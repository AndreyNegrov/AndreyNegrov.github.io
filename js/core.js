// Ядро: утилиты, сохранение, настройки, сложность, блокнот, словарь, общие части интерфейса.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const val = (v, ...args) => (typeof v === "function" ? v(...args) : v);

// После полуночи часы продолжают счёт: 00:20 идёт после 23:58.
function toMin(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h < 6 ? h + 24 : h) * 60 + m;
}
function fmtMin(total) {
  const t = Math.floor(total);
  const h = Math.floor(t / 60) % 24, m = t % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function norm(s) {
  return String(s || "").toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/(\p{N})(?=\p{L})|(\p{L})(?=\p{N})/gu, "$1$2 ")
    .replace(/(\d)\s+(?=\d)/g, "$1")
    .replace(/\s+/g, " ").trim();
}
function hasPhrase(t, p) {
  const star = p.endsWith("*");
  const pn = norm(star ? p.slice(0, -1) : p);
  if (!pn) return false;
  const re = new RegExp("(?:^| )" + pn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + (star ? "\\S*" : "") + "(?= |$)");
  return re.test(t);
}
function matchFact(text, f) {
  const t = norm(text);
  if (f.test) return !!f.test(text, t);
  if (f.all) return f.all.every((g) => (Array.isArray(g) ? g : [g]).some((p) => hasPhrase(t, p)));
  return (val(f.any, state) || []).some((p) => hasPhrase(t, p));
}
const isRussian = (t) => (String(t).match(/[а-яё]/gi) || []).length > String(t).replace(/\s/g, "").length * 0.4;

const LEVELS = {
  calm: { name: "Спокойно", desc: "Субтитры на экране, речь медленнее, повтор без ограничений. Подозрение растёт медленнее.",
    subs: "live", hints: Infinity, recorder: false, rate: 0.85, sus: 0.6, tune: 0.7, patience: 75 },
  mission: { name: "Задание", desc: "Субтитров нет, три подсказки на сцену. Расшифровка появляется в блокноте после сцены.",
    subs: "after", hints: 3, recorder: 3, rate: 0.95, sus: 1, tune: 0.4, patience: 50 },
  deaf: { name: "Глухо", desc: "Ни субтитров, ни расшифровки. Только уши, диктофон и ваши записи.",
    subs: "none", hints: 0, recorder: 2, rate: 1, sus: 1.2, tune: 0.3, patience: 42 }
};

const Settings = {
  key: "iney-settings",
  data: null,
  defaults: { difficulty: "calm", provider: "none", apiKey: "", model: "", baseUrl: "", cloudVoices: false,
    voiceVol: 1, ambVol: 0.7, musicVol: 0.5, speed: 1 },
  get() {
    if (!this.data) {
      try { this.data = { ...this.defaults, ...JSON.parse(localStorage.getItem(this.key) || "{}") }; }
      catch { this.data = { ...this.defaults }; }
    }
    return this.data;
  },
  set(patch) {
    Object.assign(this.get(), patch);
    localStorage.setItem(this.key, JSON.stringify(this.data));
    if (window.Sound) Sound.applyVolumes();
  }
};
const level = () => LEVELS[Settings.get().difficulty] || LEVELS.calm;

const Store = {
  key: "iney-v2",
  // Сезоны на общем движке (js/packs.js) знают свой номер на титуле и ключ сохранения.
  pack(season) { return typeof Pack !== "undefined" ? Pack.bySeason(season) : null; },
  keyFor(season) { const p = this.pack(season); return p ? p.meta.key : season === 2 ? "iney-s2d" : "iney-v2"; },
  modern(key = this.key) { return typeof PACKS !== "undefined" && Object.values(PACKS).some((p) => p.meta.key === key); },
  fresh() {
    return { season: this.modern() ? 3 : this.key === "iney-s2d" ? 2 : 1, step: 0, started: false, flags: {}, sus: {}, met: {}, notes: [], words: {}, intel: {}, reports: {},
      boards: {}, gadgets: {}, live: {}, liveTrap: {}, checkpoint: null, marks: {},
      legend: null, heat: 0, dossier: {}, clues: {}, phrases: {}, mstats: {}, missions: {}, shift: {}, ord: null };
  },
  peek(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); }
    catch { return null; }
  },
  use(season) {
    this.key = this.keyFor(season);
    // Сезоны с номером 3 и выше идут на одном движке: таблицы сезона подменяет Pack, внутри игры все они — «сезон 3».
    const p = this.pack(season);
    if (typeof Pack !== "undefined") Pack.use(p ? p.meta.id : "relay");
    state = this.load();
    state.season = season >= 3 ? 3 : season === 2 ? 2 : 1;
    if (p && p.migrate) p.migrate(state);
  },
  load() {
    try { return Object.assign(this.fresh(), JSON.parse(localStorage.getItem(this.key) || "null") || {}); }
    catch { return this.fresh(); }
  },
  save() { localStorage.setItem(this.key, JSON.stringify(state)); },
  snapshot() { const { checkpoint, marks, ...rest } = state; return JSON.stringify(rest); },
  restore(json) {
    const { checkpoint, marks } = state;
    state = Object.assign(this.fresh(), JSON.parse(json), { checkpoint, marks });
    this.save();
  },
  reset() { state = this.fresh(); this.save(); }
};
let state = Store.load();

const ICON = {
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  window: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/></svg>',
  wall: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 9.5h18M3 14h18M8 5v4.5M15 5v4.5M11 9.5V14M18 9.5V14M8 14v5M15 14v5"/></svg>',
  scanner: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l10-5"/><circle cx="16" cy="14" r="3"/><path d="M6 12h4M6 16h4"/></svg>',
  scope: '<svg viewBox="0 0 24 24"><circle cx="7" cy="15" r="4"/><circle cx="17" cy="15" r="4"/><path d="M7 11V6h3v5M17 11V6h-3v5M10 9h4"/></svg>',
  rec: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" class="fill"/></svg>',
  notes: '<svg viewBox="0 0 24 24"><path d="M6 3h11a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2z"/><path d="M10 8h5M10 12h5"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path class="fill" d="M8 5v14l11-7z"/></svg>',
  fast: '<svg viewBox="0 0 24 24"><path class="fill" d="M3 6l8 6-8 6zM12 6l8 6-8 6z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  radio: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="14" rx="2"/><path d="M10 7V3M10 11h4M10 14h4"/></svg>'
};

// ───────── вид: ночной (основной) или мультяшный (сезон «Онбординг») ─────────
// У каждого вида свои таблицы стилей: <link data-theme="night|toon"> в index.html. Включены только стили текущего вида.
// Мультяшный вид включается внутри сезона с meta.theme = "toon"; титул, тренировки и остальные сезоны — ночные.
const Theme = {
  cur: "night",
  set(name = "night") {
    if (this.cur === name) return;
    this.cur = name;
    $$("link[data-theme]").forEach((l) => { l.media = l.dataset.theme === name ? "all" : "not all"; });
    document.body.dataset.theme = name;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = name === "toon" ? "#07090d" : "#0b0c0e";
    // Частицы у видов разные: недолетевшие искры прошлого вида убираем.
    if (typeof Juice !== "undefined") Juice.parts = [];
  }
};
function TOON() { return Theme.cur === "toon"; }

// ───────── подозрение ─────────
function susPeople() {
  return state && state.season >= 2 ? [] : ["helen", "rita"];
}
function dayName(n) {
  if (state && state.season === 3) return (typeof MISSIONS !== "undefined" && MISSIONS[n] && MISSIONS[n].title) || "";
  const names = state && state.season === 2
    ? { 1: "Пятница", 2: "Суббота", 3: "Воскресенье" }
    : DAYS;
  return names[n] || "";
}
function addSus(who, amount, reason) {
  if (!who || !amount || !susPeople().includes(who)) return;
  const k = amount > 0 ? level().sus : 1;
  state.sus[who] = clamp(Math.round((state.sus[who] || 0) + amount * k), 0, 100);
  state.met[who] = true;
  Store.save();
  UI.renderSus(who);
  if (amount > 0) {
    const male = PEOPLE[who] && PEOPLE[who].gender === "m";
    UI.toast(`<b>${esc(PEOPLE[who].name)}</b> ${male ? "насторожился" : "насторожилась"}${reason ? ": " + esc(reason) : ""}`, "bad");
  }
}

// ───────── блокнот ─────────
const Notes = {
  add(n) {
    const note = { id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), day: Game.day(), ...n };
    state.notes.push(note);
    Store.save();
    UI.bumpNotes();
    return note;
  },
  reveal(sceneId) {
    state.notes.forEach((n) => { if (n.scene === sceneId && n.hidden === "after") n.hidden = false; });
    Store.save();
  },
  visibleText(n) { return n.hidden ? "" : n.text; }
};

// ───────── слова ─────────
const GLOSS_PHRASES = Object.keys(GLOSSARY).filter((k) => k.includes(" ")).sort((a, b) => b.length - a.length);
const Words = {
  key(word) {
    const w = word.toLowerCase().replace(/[’]/g, "'");
    if (GLOSSARY[w]) return w;
    for (const cut of [/'s$/, /s$/, /es$/, /ed$/, /ing$/, /ly$/]) {
      const base = w.replace(cut, "");
      if (base !== w && GLOSSARY[base]) return base;
    }
    return w;
  },
  async tap(raw, sentence, el) {
    const key = this.key(raw);
    let ru = GLOSSARY[key];
    UI.showGloss(el, key, ru || (AI.enabled() ? "…" : "нет в словаре"));
    if (!Voice.busy()) Voice.say(key, { who: "guest", rate: 0.85, fx: "clean" });
    if (!ru && AI.enabled()) {
      try { ru = (await AI.translate(key, sentence)).ru; } catch { ru = ""; }
      UI.showGloss(el, key, ru || "не удалось перевести");
    }
    const w = state.words[key] || (state.words[key] = { ru: "", taps: 0, miss: 0, day: Game.day() });
    w.taps += 1;
    if (ru) w.ru = ru;
    Store.save();
  },
  miss(keys) {
    keys.forEach((k) => {
      const key = k.toLowerCase();
      const w = state.words[key] || (state.words[key] = { ru: GLOSSARY[key] || "", taps: 0, miss: 0, day: Game.day() });
      w.miss += 1;
    });
    Store.save();
  },
  weak(n = 4) {
    return Object.entries(state.words)
      .sort((a, b) => (b[1].taps + b[1].miss * 2) - (a[1].taps + a[1].miss * 2))
      .slice(0, n).map(([k]) => k);
  }
};

// Английский текст с нажимаемыми словами. Фразы из словаря подсвечиваются целиком.
function enHTML(text, { gaps = false } = {}) {
  const src = String(text);
  const lower = src.toLowerCase();
  const marks = [];
  for (const k of GLOSS_PHRASES) {
    let i = 0;
    while ((i = lower.indexOf(k, i)) !== -1) {
      const end = i + k.length;
      const okL = i === 0 || /[^a-z0-9']/.test(lower[i - 1]);
      const okR = end >= lower.length || /[^a-z0-9']/.test(lower[end]);
      if (okL && okR && !marks.some((m) => i < m[1] && end > m[0])) marks.push([i, end, k]);
      i = end;
    }
  }
  marks.sort((a, b) => a[0] - b[0]);
  const words = (seg) => seg.split(/([A-Za-z0-9][A-Za-z0-9'’-]*)/g)
    .map((p, i) => (i % 2 ? `<span class="w" data-w="${esc(p)}">${esc(p)}</span>` : esc(p))).join("");
  let out = "", pos = 0;
  for (const [s, e, k] of marks) {
    out += words(src.slice(pos, s));
    out += `<span class="w ph" data-w="${esc(k)}">${esc(src.slice(s, e))}</span>`;
    pos = e;
  }
  out += words(src.slice(pos));
  if (gaps) out = out.replace(/…/g, '<span class="gap">…</span>');
  return `<span data-line="${esc(src)}">${out}</span>`;
}

function avatar(who, cls = "") {
  const p = PEOPLE[who] || PEOPLE.guest;
  if (p.face && typeof Face !== "undefined") return `<span class="ava ava-face ${cls}">${Face.svg(p.face)}</span>`;
  return p.img
    ? `<img class="ava ${cls}" src="${p.img}" alt="">`
    : `<div class="ava ava-letter ${cls}">${esc(p.initial || p.name[0])}</div>`;
}

// ───────── интерфейс ─────────
const FLAT_FX = `
  <div class="fx-door"><i></i><i></i><i></i></div>
  <div class="fx-window"><div class="fx-sweep"></div><div class="fx-open-label">окно открыто</div></div>
  <div class="fx-gate"></div>
  <div class="fx-lamps">
    <i style="left:63.6%;top:44.4%"></i><i style="left:67.5%;top:44.6%"></i><i style="left:71.3%;top:44.6%"></i>
    <i style="left:75.6%;top:44.6%"></i><i style="left:79.6%;top:44.4%"></i><i style="left:62.8%;top:51.8%"></i>
    <i style="left:66.2%;top:52%"></i><i style="left:72.4%;top:52.4%"></i><i style="left:83.6%;top:51%"></i>
  </div>`;

const UI = {
  bgActive: "a",
  init() {
    $("#btn-notes").innerHTML = ICON.notes + '<span id="notes-count"></span>';
    $("#btn-menu").innerHTML = ICON.menu;
    $("#btn-notes").addEventListener("click", () => UI.toggleNotebook());
    $("#btn-menu").addEventListener("click", () => Game.menu());
    document.addEventListener("click", (e) => {
      const w = e.target.closest(".w");
      if (w) {
        e.stopPropagation();
        const line = w.closest("[data-line]");
        Words.tap(w.dataset.w, line ? line.dataset.line : w.textContent, w);
        return;
      }
      if (!e.target.closest("#gloss")) UI.hideGloss();
    });
    window.addEventListener("keydown", (e) => {
      const a = document.activeElement;
      if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT")) {
        if (e.key === "Escape") a.blur();
        return;
      }
      if (e.key === "Escape") {
        if (!$("#modal").hidden) return Game.closeMenu();
        if (!$("#notebook").hidden) return UI.toggleNotebook(false);
        if (Game.inPlay()) Game.menu();
      } else if ((e.key === "n" || e.key === "т") && Game.inPlay()) {
        UI.toggleNotebook();
      }
    });
    $("#notebook").addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (tab) { UI.nbTab = tab.dataset.tab; UI.renderNotebook(); return; }
      if (e.target.closest("[data-nb-close]")) return UI.toggleNotebook(false);
      const play = e.target.closest("[data-play]");
      if (play) {
        const n = state.notes.find((x) => x.id === play.dataset.play);
        if (n && (!UI.onReplay || UI.onReplay(n))) Voice.say(n.audio || n.text.replace(/…/g, ","), { who: n.who, fx: n.fx || "clean" });
        return;
      }
      const say = e.target.closest("[data-say]");
      if (say) Voice.say(say.dataset.say, { who: "guest", rate: 0.85 });
    });
    $("#notebook").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", e.target);
      const text = input.value.trim();
      if (!text) return;
      Notes.add({ kind: "mine", text, time: Game.clockText() });
      input.value = "";
      UI.renderNotebook();
    });
  },

  // src — картинка, "set:<сцена>" (декорация из Sets) или "svg:<сцена>" (мультяшный фон из Scenery).
  setBg(src, look = "day") {
    const set = /^set:/.test(src) && typeof Sets !== "undefined";
    const toon = /^svg:/.test(src) && typeof Scenery !== "undefined";
    const drawn = set || toon;
    const kind = set ? "bg-set" : toon ? "bg-svg" : /flat/.test(src) ? "bg-flat" : /hall/.test(src) ? "bg-hall" : /cafe/.test(src) ? "bg-cafe" : /dock/.test(src) ? "bg-dock" : "";
    document.body.classList.toggle("bg-drawn", drawn);
    const cur = $(`#bg-${this.bgActive}`);
    const box = $(".bg-box", cur);
    if (box && box.dataset.src === src) {
      box.className = "bg-box look-" + look + (kind ? " " + kind : "");
      return;
    }
    const nextId = this.bgActive === "a" ? "b" : "a";
    const next = $(`#bg-${nextId}`);
    next.innerHTML = drawn
      ? `<div class="bg-box look-${look} ${kind}" data-src="${src}">${set ? Sets.html(src.slice(4)) : Scenery.html(src.slice(4))}<div class="fx"></div></div>`
      : `<div class="bg-box look-${look}${kind ? " " + kind : ""}" data-src="${src}"><img src="${src}" alt=""><div class="fx">${src.endsWith("flat.jpg") ? FLAT_FX : ""}</div></div>`;
    requestAnimationFrame(() => { next.classList.add("on"); cur.classList.remove("on"); });
    this.bgActive = nextId;
  },
  fx() { return $(`#bg-${this.bgActive} .fx`); },
  fxOn(name, on = true, ms = 0) {
    const box = this.fx();
    if (!box) return;
    const el = { door: ".fx-door", gate: ".fx-gate", sweep: ".fx-window", open: ".fx-window" }[name];
    const node = el && $(el, box);
    if (!node) return;
    const cls = { door: "talk", gate: "on", sweep: "sweep", open: "open" }[name];
    node.classList.toggle(cls, on);
    if (name === "open") this.flatOpen(on);
    if (ms) setTimeout(() => node.classList.remove(cls), ms);
  },
  warehouseDark(on) {
    const box = $(`#bg-${this.bgActive} .bg-box`);
    if (!box) return;
    const base = $("img", box);
    if (!base || !String(base.getAttribute("src")).endsWith("flat.jpg")) return;
    let layer = $(".flat-dark", box);
    if (!layer) {
      layer = document.createElement("img");
      layer.className = "flat-dark";
      layer.alt = "";
      layer.src = "art/flat-dark.jpg";
      base.after(layer);
    }
    box.classList.toggle("unlit", !!on);
  },
  flatOpen(on) {
    const box = $(`#bg-${this.bgActive} .bg-box`);
    if (!box) return;
    const base = $("img", box);
    if (!base || !String(base.getAttribute("src")).endsWith("flat.jpg")) return;
    let layer = $(".flat-open", box);
    if (!layer) {
      layer = document.createElement("img");
      layer.className = "flat-open";
      layer.alt = "";
      layer.src = "art/flat-open.jpg";
      base.after(layer);
    }
    layer.classList.toggle("on", !!on);
  },
  sceneFx(name) {
    if (name === "headlights") this.fxOn("sweep", true, 3200);
    if (name === "gatelight") { this.fxOn("gate", true); this.warehouseDark(false); }
    if (name === "gatedark") this.fxOn("gate", false);
  },

  hud(sc) {
    const hud = $("#hud");
    hud.hidden = false;
    document.body.classList.toggle("s3", state.season === 3);
    document.body.dataset.m = state.season === 3 && sc.mission ? sc.mission : "";
    if (typeof Juice !== "undefined") { if (state.season === 3) Juice.hud(); else $("#hud-xp").innerHTML = ""; }
    $("#hud-day").textContent = state.season === 3
      ? (sc.mission ? `Миссия ${sc.mission} · ${dayName(sc.mission)}` : "")
      : sc.day ? `День ${sc.day} · ${dayName(sc.day)}` : "";
    $("#hud-time").textContent = sc.time || (sc.clock ? sc.clock[0] : "");
    $("#hud-place").textContent = sc.place || "";
    this.goal(val(sc.goal, state) || "");
    this.renderSus();
  },
  hideHud() { $("#hud").hidden = true; },
  setTime(text) { $("#hud-time").textContent = text; },
  goal(text) { const g = $("#hud-goal"); g.textContent = text || ""; g.hidden = !text; },

  toast(html, kind = "info", ms = 3800) {
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.innerHTML = html;
    const box = $("#toasts");
    const cap = innerWidth < 760 ? 1 : 3;   // на телефоне одна плашка за раз: экран маленький
    while (box.children.length >= cap) box.firstChild.remove();
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add("in"));
    setTimeout(() => { t.classList.remove("in"); setTimeout(() => t.remove(), 400); }, ms);
  },
  caption(text, kind = "", ms = 5200) {
    const c = $("#caption");
    c.className = "show " + kind;
    c.textContent = text;
    clearTimeout(this._cap);
    this._cap = setTimeout(() => { c.className = ""; }, ms);
  },

  showGloss(el, en, ru) {
    const g = $("#gloss");
    g.innerHTML = `<b>${esc(en)}</b><span>${esc(ru)}</span>`;
    g.hidden = false;
    const r = el.getBoundingClientRect();
    const w = g.offsetWidth, h = g.offsetHeight;
    g.style.left = clamp(r.left + r.width / 2 - w / 2, 8, innerWidth - w - 8) + "px";
    g.style.top = (r.top - h - 10 < 8 ? r.bottom + 10 : r.top - h - 10) + "px";
    clearTimeout(this._gloss);
    this._gloss = setTimeout(() => UI.hideGloss(), 4500);
  },
  hideGloss() { $("#gloss").hidden = true; },

  renderSus(pulse) {
    const box = $("#hud-sus");
    if (state.season === 3) {
      const v = state.heat || 0;
      const tone = v >= 70 ? "danger" : v >= 35 ? "warn" : "calm";
      box.innerHTML = `<div class="sus heat ${tone} ${pulse ? "pulse" : ""}" title="Засветка: ${v} из 100. На 100 легенда сгорит.">
        <span class="heat-ico">${TOON() ? (v >= 70 ? "🔥" : "👁") : ICON.eye}</span><div><span>Засветка</span><div class="sus-bar"><i style="width:${v}%"></i></div></div></div>`;
      return;
    }
    box.innerHTML = susPeople().filter((p) => state.met[p]).map((p) => {
      const v = state.sus[p] || 0;
      const tone = v >= 70 ? "danger" : v >= 35 ? "warn" : "calm";
      return `<div class="sus ${tone} ${pulse === p ? "pulse" : ""}" title="Подозрение: ${v} из 100">
        ${avatar(p, "sm")}<div><span>${esc(PEOPLE[p].name)}</span><div class="sus-bar"><i style="width:${v}%"></i></div></div></div>`;
    }).join("");
  },

  nbTab: "notes",
  toggleNotebook(force) {
    const nb = $("#notebook");
    const open = force ?? nb.hidden;
    nb.hidden = !open;
    if (open) { this.renderNotebook(); $("#btn-notes").classList.remove("new"); }
  },
  bumpNotes() {
    const n = state.notes.length;
    const c = $("#notes-count");
    if (c) c.textContent = n ? String(n) : "";
    $("#btn-notes").classList.add("new");
    if (!$("#notebook").hidden) this.renderNotebook();
  },
  renderNotebook() {
    const nb = $("#notebook");
    const s3 = state.season === 3 && typeof Kit !== "undefined";
    const tabs = s3 ? Kit.notebookTabs() : [["notes", "Записи"], ["words", "Слова"]];
    if (!tabs.some(([k]) => k === this.nbTab)) this.nbTab = "notes";
    const tab = this.nbTab;
    let body = "";
    const extra = s3 ? Kit.notebookBody(tab) : null;
    if (extra != null) body = extra;
    else if (tab === "notes") {
      const byDay = {};
      state.notes.forEach((n) => { (byDay[n.day] = byDay[n.day] || []).push(n); });
      const days = Object.keys(byDay).sort((a, b) => b - a);
      body = `<form class="nb-add"><input type="text" placeholder="Записать своё и нажать Enter" autocomplete="off"></form>` +
        (days.length ? days.map((d) => `<h4>${state.season === 3 ? "Миссия" : "День"} ${d} · ${dayName(d)}</h4>` +
          byDay[d].slice().reverse().map((n) => noteHTML(n)).join("")).join("")
          : `<p class="muted">Пока пусто. Сюда попадает всё, что вы услышали и увидели.</p>`);
    } else {
      const words = Object.entries(state.words).sort((a, b) => (b[1].taps + b[1].miss * 2) - (a[1].taps + a[1].miss * 2));
      body = words.length
        ? `<p class="muted">Слова, на которых вы споткнулись. Персонажи будут возвращать их в разговор.</p>` +
          words.map(([en, w]) => `<div class="nb-word"><button class="icon-btn sm" data-say="${esc(en)}">${ICON.play}</button>
            <b>${esc(en)}</b><span>${esc(w.ru || GLOSSARY[en] || "")}</span><small>${w.taps + w.miss}</small></div>`).join("")
        : `<p class="muted">Нажмите на любое английское слово, и оно появится здесь.</p>`;
    }
    nb.innerHTML = `
      <div class="nb-head">
        <b>Блокнот</b>
        <div class="tabs">${tabs.map(([k, label]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${label}</button>`).join("")}</div>
        <button class="icon-btn" data-nb-close>${ICON.close}</button>
      </div>
      <div class="nb-body">${body}</div>`;
  },

  modal(html, cls = "") {
    const m = $("#modal");
    m.className = cls;
    m.innerHTML = `<div class="modal-card">${html}</div>`;
    m.hidden = false;
    return m;
  },
  closeModal() { const m = $("#modal"); m.hidden = true; m.innerHTML = ""; }
};

const SRC_LABEL = { wall: "микрофон", dock: "во дворе", radio: "рация", see: "видели", table: "столик 4", item: "находка", mine: "своё", phone: "звонок", talk: "разговор" };
function noteHTML(n, { draggable = false } = {}) {
  const meta = [n.time, SRC_LABEL[n.src] || SRC_LABEL[n.kind] || "", n.who && PEOPLE[n.who] ? PEOPLE[n.who].name : ""].filter(Boolean).join(" · ");
  let txt;
  if (n.hidden === "after") txt = `<i class="muted">Расшифровка появится после сцены</i>`;
  else if (n.hidden === "always") txt = `<i class="muted">Аудиозапись без расшифровки</i>`;
  else if (n.kind === "seen" || n.kind === "item" || isRussian(n.text)) txt = esc(n.text);
  else txt = enHTML(n.text, { gaps: true });
  const canPlay = n.kind === "heard" || n.kind === "partial";
  return `<div class="note k-${n.kind}" data-note="${n.id}" ${draggable ? 'draggable="true"' : ""}>
    <div class="note-meta">${esc(meta)}${n.kind === "partial" ? ' · <em>обрывок</em>' : ""}</div>
    <div class="note-txt">${txt}</div>
    ${canPlay ? `<button class="icon-btn sm note-play" data-play="${n.id}" title="Прослушать">${ICON.play}</button>` : ""}
  </div>`;
}

// ───────── поле ответа: рация на пробеле + текст ─────────
function ReplyBox(host, opts = {}) {
  const ph = opts.placeholder || "или напиши по-английски и нажми Enter";
  const label = opts.label || "Говорить";
  const touch = matchMedia("(pointer: coarse)").matches;
  const idle = !Mic.supported() ? "голос работает в Chrome и Edge" : touch ? "нажми, скажи и нажми ещё раз" : "нажми и говори · или держи пробел";
  host.innerHTML = `
    <div class="reply">
      <button type="button" class="mic-btn">
        <span class="mic-ico">${ICON.mic}</span>
        <span class="mic-txt"><b>${esc(label)}</b><small>${idle}</small></span>
        <span class="mic-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>
      <form class="type-row">
        <input type="text" autocomplete="off" spellcheck="false" placeholder="${esc(ph)}">
        <button class="btn ghost small" type="submit">Отправить</button>
      </form>
    </div>`;
  const btn = $(".mic-btn", host), form = $("form", host), input = $("input", host);
  const micB = $(".mic-txt b", host), micS = $(".mic-txt small", host);
  let resolver = null, enabled = false, live = false, asking = false, mode = "tap";
  function paint(on) {
    btn.classList.toggle("on", on);
    micB.textContent = on ? "Слушаю…" : label;
    micS.textContent = on ? (mode === "hold" ? "отпусти пробел, когда договоришь" : "нажми ещё раз, когда договоришь") : idle;
  }

  function setEnabled(on) {
    enabled = on;
    host.classList.toggle("disabled", !on);
    input.disabled = !on;
    btn.disabled = !on;
  }
  function submit(t, via = "text") {
    t = String(t || "").trim();
    if (!t || !enabled || !resolver) return;
    ReplyBox.via = via;
    input.value = "";
    const r = resolver;
    resolver = null;
    setEnabled(false);
    r(t);
  }
  const handler = {
    start(how = "hold") {
      if (!enabled || live || asking) return;
      if (!Mic.supported()) { UI.toast("Голосовой ввод работает в Chrome и Edge. Напиши текстом.", "info"); input.focus(); return; }
      if (Mic.perm() === "denied") {
        UI.toast("Микрофон для этой страницы запрещён. Нажми на значок слева от адреса сайта и разреши микрофон. Пока можно отвечать текстом.", "info", 9000);
        input.focus();
        return;
      }
      // Первый раз спрашиваем доступ отдельно: окно браузера не обрывает запись, а ответ запоминается.
      if (Mic.perm() === "prompt" && !Mic.isFile()) {
        asking = true;
        UI.toast("Браузер спросит про микрофон. Разреши один раз — дальше спрашивать не будет.", "info", 7000);
        Mic.ask().then((ok) => {
          asking = false;
          if (!ok) { UI.toast("Без микрофона можно отвечать текстом. Включить его можно значком слева от адреса сайта.", "info", 8000); return; }
          if (how === "tap") handler.start("tap");
          else UI.toast("Микрофон включён. Держи пробел и говори.", "ok");
        });
        return;
      }
      Mic.fileNote();
      if (!opts.keepVoice) Voice.stop();
      Sound.sfx("ptt-on");
      mode = how;
      if (!Mic.start((t) => { input.value = t; }, () => handler.end())) { UI.toast("Микрофон не запустился. Напиши текстом.", "bad"); return; }
      if (opts.onStart) opts.onStart();
      live = true;
      paint(true);
      input.value = "";
      input.placeholder = "слушаю…";
    },
    async end() {
      if (!live) return;
      live = false;
      paint(false);
      Sound.sfx("ptt-off");
      if (opts.onEnd) opts.onEnd();
      const t = await Mic.stop();
      input.placeholder = ph;
      if (!t) {
        const err = Mic.error();
        UI.toast(err === "not-allowed" || err === "service-not-allowed"
          ? "Нет доступа к микрофону. Разреши его значком слева от адреса сайта."
          : err === "network" ? "Распознаванию речи нужен интернет. Пока можно ответить текстом."
          : "Не расслышал. Скажи ещё раз — погромче и ближе к микрофону.", "info", 6000);
        return;
      }
      submit(t, "voice");
    }
  };
  btn.addEventListener("click", () => { if (live) handler.end(); else handler.start("tap"); });
  form.addEventListener("submit", (e) => { e.preventDefault(); submit(input.value, "text"); });
  setEnabled(false);
  PTT.bind(handler);
  return {
    wait() {
      setEnabled(true);
      // Кто в прошлый раз печатал — сразу получает курсор в поле; кто говорил — пробел остаётся рацией.
      if (ReplyBox.via === "text" && !matchMedia("(pointer: coarse)").matches) input.focus({ preventScroll: true });
      return new Promise((r) => { resolver = r; });
    },
    disable() { setEnabled(false); },
    cancel() {
      if (!resolver) return;
      const r = resolver;
      resolver = null;
      setEnabled(false);
      r(null);
    },
    destroy() { PTT.unbind(handler); Mic.abort(); }
  };
}
