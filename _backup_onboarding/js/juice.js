// Игровой слой: профиль агента (опыт, ранги, стикеры), комбо, гаджеты,
// всплывающие очки, конфетти, тряска экрана и музыка для мини-игр.

const RANKS = [
  { at: 0, name: "Стажёр", ico: "🧊" },
  { at: 300, name: "Новичок в поле", ico: "🎧" },
  { at: 800, name: "Наблюдатель", ico: "👀" },
  { at: 1400, name: "Связной", ico: "📡", perk: "Суфлёр: +1 заряд на миссию" },
  { at: 2100, name: "Оперативник", ico: "🕶️", perk: "Иней: +1 заряд на миссию" },
  { at: 2900, name: "Старший агент", ico: "🦊" },
  { at: 3800, name: "Резидент", ico: "🦉", perk: "Печенье: +1 заряд на миссию" },
  { at: 5000, name: "Легенда бюро", ico: "❄️" }
];

const BADGES = {
  first: { ico: "🎤", name: "Первые слова", how: "Пройти собеседование" },
  voice: { ico: "🗣️", name: "Голосом", how: "Ответить голосом десять раз" },
  combo5: { ico: "🔥", name: "Комбо ×5", how: "Пять точных ответов подряд" },
  combo10: { ico: "☄️", name: "Комбо ×10", how: "Десять точных ответов подряд" },
  repair: { ico: "🔁", name: "Мастер переспроса", how: "Пять раз переспросить по-английски" },
  cold: { ico: "🧊", name: "Ледяное спокойствие", how: "Пройти миссию без засветки" },
  snap: { ico: "📸", name: "Скриншотер", how: "Успеть сохранить удалённое сообщение" },
  ghost: { ico: "👻", name: "Призрак", how: "Подслушать разговор и не попасться" },
  ears: { ico: "👂", name: "Острый слух", how: "Поймать все слова в одном разговоре" },
  speller: { ico: "🔤", name: "Эйч-оу-эл-эл", how: "Продиктовать фамилию по буквам с первого раза" },
  nosy: { ico: "🗄️", name: "Нижний ящик", how: "Открыть то, что просили не открывать" },
  explorer: { ico: "🧭", name: "Любопытный", how: "Прочитать всё, что лежит в офисе" },
  decoder: { ico: "🧩", name: "Шифровальщик", how: "Собрать шифровку без ошибок" },
  cracker: { ico: "📼", name: "Перехват", how: "Записать журнал двери без ошибок" },
  smooth: { ico: "🛗", name: "Ни одной неловкой паузы", how: "Идеальная поездка в лифте" },
  sleuth: { ico: "🧵", name: "Красная нить", how: "Собрать доску улик без ошибок" },
  chatty: { ico: "🫖", name: "Душа компании", how: "Задержать Грейс, не потеряв её терпения" },
  clean: { ico: "🏆", name: "Чистая работа", how: "Лучший финал сезона" },
  stars: { ico: "⭐", name: "Все звёзды", how: "Собрать все звёзды сезона" },
  phrases: { ico: "💬", name: "Разговорник", how: "Сказать вслух пятнадцать фраз-инструментов" },
  streak3: { ico: "📅", name: "Три дня подряд", how: "Тренироваться три дня подряд" },
  echo: { ico: "🦜", name: "Эхо", how: "Повторить пять фраз без единой ошибки" }
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
  today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); },
  // Тренировка дня: первая за сутки удваивает опыт и продлевает серию.
  trainedToday() { return this.get().lastDay === this.today(); },
  markTraining() {
    const p = this.get(), t = this.today();
    if (p.lastDay === t) return false;
    const y = new Date(Date.now() - 864e5);
    const yKey = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
    p.streak = p.lastDay === yKey ? (p.streak || 0) + 1 : 1;
    p.lastDay = t;
    this.save();
    if (p.streak >= 3) Juice.badge("streak3");
    return true;
  }
};

// ───────── гаджеты ─────────
const GADGETS = {
  whisper: { ico: "🎧", name: "Суфлёр", how: "Сова шепнёт, что сказать" },
  freeze: { ico: "🧊", name: "Иней", how: "Остудить засветку на 25" },
  cookie: { ico: "🍪", name: "Печенье", how: "Отвлечь: внимание и терпение сбрасываются" }
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
  // Кнопки гаджетов для панели сцены. ids — какие уместны здесь.
  html(ids) {
    return ids.map((id) => {
      const g = GADGETS[id], n = this.left(id);
      return `<button class="gadget" data-gadget="${id}" ${n ? "" : "disabled"} title="${esc(g.how)}"><i>${g.ico}</i><b>${esc(g.name)}</b><em>${n}</em></button>`;
    }).join("");
  }
};

const Juice = {
  combo: 0,
  parts: [],
  raf: 0,

  init() {
    if (this.cv) return;
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

  // Точка для эффектов: центр элемента или верхняя треть экрана.
  at(el, top) {
    if (el && el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.width || r.height) return { x: r.left + r.width / 2, y: top ? r.top + Math.min(r.height * 0.3, 24) : r.top + r.height / 2 };
    }
    return { x: innerWidth / 2, y: innerHeight * 0.36 };
  },

  float(text, el, kind = "") {
    this.init();
    const p = el && el.x != null ? el : this.at(el, true);
    const f = document.createElement("div");
    f.className = "floater " + kind;
    f.textContent = text;
    // Несколько надписей подряд не слипаются: каждая следующая выше и чуть позже.
    const now = performance.now();
    if (now - (this._ft || 0) > 700) this._fn = 0;
    this._ft = now;
    const k = this._fn++;
    const half = Math.min(innerWidth / 2 - 8, text.length * 7.5 + 12);
    f.style.left = clamp(p.x, half + 8, innerWidth - half - 8) + "px";
    f.style.top = clamp(p.y - k * 34, 70, innerHeight - 40) + "px";
    f.style.animationDelay = k * 110 + "ms";
    this.fl.appendChild(f);
    setTimeout(() => f.remove(), 1600 + k * 110);
  },

  banner(text, kind = "", sub = "") {
    this.init();
    const b = document.createElement("div");
    b.className = "banner " + kind;
    b.innerHTML = `<b>${esc(text)}</b>${sub ? `<span>${esc(sub)}</span>` : ""}`;
    this.fl.appendChild(b);
    setTimeout(() => b.remove(), 1700);
  },

  shake(el = $("#scene")) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    setTimeout(() => el.classList.remove("shake"), 450);
  },

  flash(kind = "bad") {
    this.init();
    const f = document.createElement("div");
    f.className = "screen-flash " + kind;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 700);
  },

  // ───── частицы ─────
  COLORS: ["#ff4f8b", "#ffd23f", "#3de0a8", "#38d0ff", "#9b6bff", "#ff7a59", "#ffffff"],
  spawn(list) {
    this.init();
    this.parts.push(...list);
    if (!this.raf) { this.t0 = performance.now(); this.raf = requestAnimationFrame((t) => this.tick(t)); }
  },
  confetti(el, count = 70) {
    const p = el && el.x != null ? el : this.at(el);
    const list = [];
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 5 + Math.random() * 10;
      list.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.32, life: 90 + Math.random() * 50, w: 6 + Math.random() * 7, h: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: this.COLORS[i % this.COLORS.length] });
    }
    this.spawn(list);
  },
  rain(count = 140) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 4, g: 0.05, life: 220 + Math.random() * 80, w: 7 + Math.random() * 7, h: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: this.COLORS[i % this.COLORS.length] });
    }
    this.spawn(list);
  },
  sparks(el, color = "#ffd23f", count = 14) {
    const p = el && el.x != null ? el : this.at(el);
    const list = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 5;
      list.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.08, life: 26 + Math.random() * 18, w: 4, h: 4, rot: 0, vr: 0, c: color, round: true });
    }
    this.spawn(list);
  },
  tick(t) {
    const cx = this.cv.getContext("2d");
    const k = clamp((t - this.t0) / 16.7, 0.5, 3);
    this.t0 = t;
    cx.clearRect(0, 0, this.cv.width, this.cv.height);
    this.parts = this.parts.filter((p) => p.life > 0 && p.y < this.cv.height + 40);
    for (const p of this.parts) {
      p.vy += p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.rot += p.vr * k; p.life -= k; p.vx *= 0.99;
      cx.globalAlpha = clamp(p.life / 24, 0, 1);
      cx.fillStyle = p.c;
      if (p.round) { cx.beginPath(); cx.arc(p.x, p.y, p.w / 2, 0, 7); cx.fill(); }
      else { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); }
    }
    cx.globalAlpha = 1;
    this.raf = this.parts.length ? requestAnimationFrame((x) => this.tick(x)) : 0;
  },

  // ───── опыт и ранги ─────
  xp(n, el, label) {
    n = Math.round(n);
    if (!n) return;
    const P = Profile.get();
    const before = Profile.rank();
    P.xp += n;
    Profile.save();
    if (Game.inPlay() && state.season === 3) { const st = Mission.stats(); st.xp = (st.xp || 0) + n; }
    this.float(`+${n} XP${label ? " · " + label : ""}`, el, "xp");
    this.hud(true);
    const after = Profile.rank();
    if (after.i > before.i) setTimeout(() => this.rankUp(after), 600);
  },
  rankUp(r) {
    this.init();
    Sound.sfx("levelup");
    const o = document.createElement("div");
    o.className = "rankup";
    o.innerHTML = `<div class="rankup-in"><p>Новый ранг</p><i>${r.ico}</i><h2>${esc(r.name)}</h2>${r.perk ? `<span>${esc(r.perk)}</span>` : ""}</div>`;
    document.body.appendChild(o);
    this.confetti({ x: innerWidth / 2, y: innerHeight * 0.45 }, 110);
    // Не перехватывает клики: игра под ним продолжается.
    setTimeout(() => { o.classList.add("out"); setTimeout(() => o.remove(), 350); }, 2600);
  },
  hud(bump) {
    const box = $("#hud-xp");
    if (!box) return;
    const r = Profile.rank(), xp = Profile.get().xp;
    box.innerHTML = `<div class="xpchip ${bump ? "bump" : ""}" title="${esc(r.name)} · ${xp} XP${r.next ? " · до ранга «" + esc(r.next.name) + "» " + (r.next.at - xp) : ""}">
      <i>${r.ico}</i><div><b>${esc(r.name)}</b><div class="xp-bar"><u style="width:${r.pct}%"></u></div></div><em>${xp}</em></div>
      ${this.combo >= 2 ? `<div class="combochip ${bump ? "bump" : ""}">🔥<b>×${this.combo}</b></div>` : ""}`;
  },

  // ───── комбо: точные ответы подряд ─────
  hit(el, { first = true, voice = false, base = 8 } = {}) {
    if (first) this.combo += 1; else this.combo = 0;
    const gain = base + (first ? 3 : 0) + Math.min(this.combo, 5) + (voice ? 5 : 0);
    this.xp(gain, el, voice ? "голосом" : "");
    Sound.sfx(this.combo >= 3 ? "combo" : "xp");
    if (first) this.sparks(el, "#ffd23f");
    if (voice && Profile.stat("voice") === 10) this.badge("voice");
    if (this.combo === 3 || this.combo === 5 || this.combo === 8 || this.combo === 10) {
      this.banner(`Комбо ×${this.combo}`, "combo", this.combo >= 5 ? "Чистый английский" : "Так держать");
    }
    if (this.combo === 5) this.badge("combo5");
    if (this.combo === 10) this.badge("combo10");
    this.hud(true);
    return gain;
  },
  miss() {
    if (this.combo >= 3) this.float("комбо сброшено", null, "bad");
    this.combo = 0;
    this.hud();
  },

  // ───── стикеры ─────
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
    el.innerHTML = `<i>${B.ico}</i><div><span>Новый стикер</span><b>${esc(B.name)}</b></div>`;
    document.body.appendChild(el);
    Sound.sfx("star");
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, 3600);
    this.xp(20, { x: 150, y: innerHeight - 120 });
    return true;
  },
  badgeHTML(id, owned) {
    const B = BADGES[id];
    return `<div class="sticker ${owned ? "on" : ""}" title="${esc(B.how)}"><i>${owned ? B.ico : "?"}</i><b>${esc(B.name)}</b><span>${esc(B.how)}</span></div>`;
  }
};

// ───────── музыка: тихий шпионский луп для мини-игр и меню ─────────
const Music = (() => {
  let timer = null, step = 0, nextT = 0, mode = null, out = null;
  const BPM = 104, S = 60 / BPM / 2; // восьмые
  const N = { A1: 55, C2: 65.4, D2: 73.4, E2: 82.4, F2: 87.3, G2: 98, A2: 110, C3: 130.8, D3: 146.8, E3: 164.8, F3: 174.6, G3: 196, A3: 220, B3: 246.9, C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, C5: 523.3, E5: 659.3 };
  const BASS = {
    calm: ["A2", 0, "A2", "C3", 0, "E3", "D3", 0, "F2", 0, "F2", "A2", 0, "C3", "A2", 0, "D2", 0, "D2", "F2", 0, "A2", "F2", 0, "E2", 0, "E2", "G2", 0, "B3", "E3", 0],
    tense: ["A2", "A2", 0, "A2", "C3", 0, "A2", "G2", "A2", "A2", 0, "A2", "D3", 0, "C3", "G2", "F2", "F2", 0, "F2", "A2", 0, "F2", "E2", "E2", "E2", 0, "E2", "G2", 0, "E3", "D3"]
  };
  const LEAD = {
    calm: [0, 0, "E4", 0, 0, "A4", 0, "G4", 0, 0, "C4", 0, 0, "F4", 0, "E4", 0, 0, "D4", 0, 0, "F4", 0, "A4", 0, 0, "E4", 0, "G4", 0, "E4", 0],
    tense: ["A4", 0, 0, "C5", 0, 0, "A4", 0, 0, "E4", 0, 0, "G4", 0, 0, 0, "F4", 0, 0, "A4", 0, 0, "C5", 0, "E5", 0, 0, "B3", 0, "E4", 0, 0]
  };
  function tone(freq, t, dur, type, vol, lp) {
    const cx = Sound.ctx, o = cx.createOscillator(), g = cx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
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
    const cx = Sound.ctx;
    if (!cx || !mode) return;
    while (nextT < cx.currentTime + 0.25) {
      const i = step % 32, b = BASS[mode][i], l = LEAD[mode][i];
      if (b) tone(N[b], nextT, S * 1.5, "triangle", 0.26, 420);
      if (l) { tone(N[l], nextT, S * 2.4, "sine", 0.075); tone(N[l] * 2, nextT, S * 1.2, "sine", 0.02); }
      if (i % 2 === 1) hat(nextT, mode === "tense" ? 0.07 : 0.045);
      if (i % 8 === 0 || (mode === "tense" && i % 8 === 5)) kick(nextT);
      nextT += S;
      step += 1;
    }
  }
  return {
    play(m = "calm") {
      if (!Sound.ensure()) return;
      if (mode === m && timer) return;
      this.stop();
      mode = m;
      out = Sound.ctx.createGain();
      out.gain.value = 0;
      out.gain.linearRampToValueAtTime(1, Sound.ctx.currentTime + 0.6);
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
        const o = out;
        try { o.gain.cancelScheduledValues(Sound.ctx.currentTime); o.gain.setTargetAtTime(0, Sound.ctx.currentTime, 0.12); } catch { /* контекст закрыт */ }
        setTimeout(() => { try { o.disconnect(); } catch { /* уже отключён */ } }, 700);
      }
      out = null;
    }
  };
})();
