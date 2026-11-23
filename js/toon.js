// Мультяшный вид сезона «Онбординг» на общем движке.
// Включается, когда открыт сезон с meta.theme = "toon" (Theme.set в Game.run). Титул, тренировки и остальные сезоны — ночные.
// Что здесь: ранги и стикеры с эмодзи, всплывающие очки и конфетти (вместо сдержанного отклика в шапке),
// рисованные лица с настроением в разговоре, лифт с Максом и обыск стола Грейс.
// Стили вида — office.css, game.css, arcade.css (в index.html с data-theme="toon").

// ───────── ранги, стикеры, гаджеты: как их зовут в мультяшном сезоне ─────────
// Опыт общий с остальными сезонами (iney-profile); меняются только названия и значки.
const TOON_RANKS = [
  ["Стажёр", "🧊"], ["Новичок в поле", "🎧"], ["Наблюдатель", "👀"], ["Связной", "📡", "Суфлёр: +1 заряд на миссию"],
  ["Оперативник", "🕶️", "Иней: +1 заряд на миссию"], ["Старший агент", "🦊"], ["Резидент", "🦉", "Печенье: +1 заряд на миссию"], ["Легенда бюро", "❄️"]
];
const TOON_BADGES = {
  first: ["🎤", "Первые слова"], voice: ["🗣️", "Голосом"], combo5: ["🔥", "Комбо ×5"], combo10: ["☄️", "Комбо ×10"],
  repair: ["🔁", "Мастер переспроса"], cold: ["🧊", "Ледяное спокойствие"], snap: ["📸"], ghost: ["👻", "Призрак"],
  ears: ["👂"], speller: ["🔤"], nosy: ["🗄️"], explorer: ["🧭"], decoder: ["🧩"], cracker: ["📼"], smooth: ["🛗"],
  sleuth: ["🧵", "Красная нить"], chatty: ["🫖"], clean: ["🏆"], stars: ["⭐"], phrases: ["💬"], streak3: ["📅"], echo: ["🦜"]
};
const TOON_GADGETS = {
  whisper: ["🎧", "Суфлёр", "Сова шепнёт, что сказать"],
  freeze: ["🧊", "Иней", "Остудить засветку на 25"],
  cookie: ["🍪", "Печенье", "Отвлечь: внимание и терпение сбрасываются"]
};

const Toon = {
  rank(xp) {
    const r = Profile.rank(xp), t = TOON_RANKS[r.i] || [], n = TOON_RANKS[r.i + 1];
    return { ...r, name: t[0] || r.name, ico: t[1] || r.mark, perk: t[2], next: r.next && { ...r.next, name: n ? n[0] : r.next.name } };
  },
  badge(id) {
    const B = BADGES[id] || {}, t = TOON_BADGES[id] || [];
    return { ...B, emo: t[0] || "🏅", name: t[1] || B.name || id };
  },
  owl(mood = "") {
    const src = PEOPLE.sova && PEOPLE.sova.img;
    return src ? `<img class="o-photo o-owl-img" src="${src}" alt="">` : Face.svg("owl", "", { mood });
  },

  // ───── титул, когда выбрана вкладка мультяшного сезона: как в прежней версии, плюс вкладки сезонов ─────
  // d: { pk, M, sv, hasCur, where, stars, trained, tabs, archive } — всё посчитано в Game.title.
  title(d) {
    const { pk, M, sv, hasCur, where, stars, trained, tabs, archive } = d;
    const P = Profile.get(), rank = this.rank();
    const nBadges = Object.keys(P.badges).length, allBadges = Object.keys(BADGES).length;
    const COLORS = ["#ff7a59", "#ffd23f", "#3de0a8", "#b08cff", "#38d0ff", "#ff6f9f"];
    const path = Object.entries(pk.MISSIONS).map(([n, m], i) => {
      const st = sv && sv.missions && sv.missions[n];
      const cur = where ? where.mission === Number(n) : Number(n) === 1;
      return `<li class="${st ? "done" : ""} ${cur ? "cur" : ""}" style="--c:${COLORS[i % COLORS.length]}"><i>${m.emo || "🎯"}</i><b>${esc(m.title)}</b><em>${st ? "★".repeat(st.stars) + "☆".repeat(3 - st.stars) : ""}</em></li>`;
    }).join("");
    return `
      <section class="title hub o-title">
        <header class="t-top">
          <div class="t-agent"><i>${rank.ico}</i><div><span>Агент «Иней»</span><b>${esc(rank.name)}</b>
            <div class="xp-bar"><u style="width:${rank.pct}%"></u></div></div><em>${P.xp} XP</em></div>
          <div class="t-chips">
            <div class="t-chip ${trained ? "hot" : ""}" title="Дней подряд с тренировкой">🔥 ${P.streak || 0}</div>
            <button class="t-chip" data-act="coll" title="Коллекция стикеров">🏅 ${nBadges}/${allBadges}</button>
            ${stars ? `<div class="t-chip" title="Звёзды за миссии">⭐ ${stars}/${Math.max(1, Object.keys(pk.MISSIONS).length) * 3}</div>` : ""}
          </div>
        </header>
        <h1 class="t-logo">ИНЕЙ</h1>
        <p class="t-tag">шпионский английский</p>
        <div class="t-main">
          <article class="o-hero">
            <div class="t-tabs">${tabs}</div>
            <p class="kicker">${esc(M.kicker)}</p>
            <h2>${esc(M.title)}</h2>
            <p class="lead">${esc(M.lead)}</p>
            <ul class="t-path">${path}</ul>
            <div class="row">
              ${hasCur ? `<button class="btn primary" data-act="continue" data-season="${M.season}">▶ Продолжить${where && where.mission ? ": миссия " + where.mission : ""}</button>` : ""}
              <button class="btn ${hasCur ? "ghost" : "primary"}" data-act="new" data-season="${M.season}">${hasCur ? "Начать заново" : "▶ " + esc(M.cta)}</button>
            </div>
            <p class="muted small">Говоришь голосом (кнопка «Говорить» или пробел) или пишешь. Персонажи ищут смысл, а не точные слова. Лучше в Edge или Chrome, в наушниках.</p>
            ${Mic.isFile() ? `<p class="muted small t-warn">🎤 Игра открыта как файл: браузер будет спрашивать про микрофон каждый раз. Запусти <b>play.cmd</b> в папке игры — спросит один раз и запомнит.</p>` : ""}
          </article>
          <aside class="t-side">
            <button class="t-card train" data-act="train"><i>🎯</i><b>Тренировка${trained ? "" : "<u>×2 XP</u>"}</b><span>Пять мини-игр по две минуты: навигатор, цифры на слух, быстрый ответ, фразы, эхо.</span></button>
            <button class="t-card coll" data-act="coll"><i>🏅</i><b>Коллекция</b><span>Стикеры за красивую работу: ${nBadges} из ${allBadges}.</span></button>
            <button class="t-card set" data-act="settings"><i>⚙️</i><b>Настройки</b><span>Сложность, голоса, музыка, языковая модель.</span></button>
          </aside>
        </div>
        ${archive}
      </section>`;
  },

  // ───── разговор: рисованные лица вместо фото ─────
  convStage(sc, lv) {
    const kind = sc.ui || "face";
    const cast = sc.cast || [sc.npc];
    const P = (w) => PEOPLE[w];
    // Лицо в «слоте»: его можно перерисовать с другим настроением, не трогая остальное.
    const slot = (w, bare) => {
      const p = P(w) || {};
      const src = (p.faces && p.faces.calm) || p.img;
      const inner = src ? `<img class="o-photo" src="${src}" alt="">` : Face.svg(p.face || (w === "sova" ? "owl" : {}), "", { bare });
      return `<div class="o-face-slot" data-face="${w}" data-bare="${bare ? 1 : 0}">${inner}</div>`;
    };
    if (kind === "video") {
      return `<div class="o-vc">
        <div class="o-vc-top"><span class="o-rec"></span><b>${esc(sc.title || "Call")}</b><span class="o-vc-time">00:00</span></div>
        <div class="o-vc-grid n${cast.length + 1}">
          ${cast.map((w) => `<div class="o-tile" data-who="${w}" style="background:${(P(w).face && P(w).face.bg) || "#1a2130"}">${slot(w)}<span class="o-tag">${esc(P(w).name)}</span><i class="o-tile-mic">${ICON.mic}</i></div>`).join("")}
          <div class="o-tile self" data-who="you" style="background:#2a2470">${Face.svg("self")}<span class="o-tag">Вы · Alex</span><i class="o-tile-mic">${ICON.mic}</i></div>
        </div>
        <div class="o-cc" hidden></div>
        <div class="o-vc-chat" hidden></div>
        <div class="o-vc-bar"><span>${ICON.mic}</span><span class="cc ${lv.subs === "live" ? "on" : ""}">CC</span><span class="end">${ICON.phone}</span></div>
      </div>`;
    }
    if (kind === "phone") {
      return `<div class="o-callcard">
        <div class="o-call-ava" data-who="${sc.npc}">${slot(sc.npc)}</div>
        <b>${esc(P(sc.npc).name)}</b><span>${esc(sc.sub || P(sc.npc).role)}</span>
        <span class="o-vc-time">00:00</span>
        <div class="o-wave">${"<i></i>".repeat(14)}</div>
      </div>`;
    }
    return `<div class="o-facecard" data-who="${sc.npc}">
      <div class="o-bubble" hidden></div>
      <div class="o-bust">${slot(sc.npc, true)}</div>
      <div class="o-plate"><b>${esc(P(sc.npc).name)}</b><span>${esc(P(sc.npc).role)}</span>${sc.place ? `<em>${esc(sc.place)}</em>` : ""}</div>
    </div>`;
  },

  // Настроение лица: happy, wow, sus, hm, angry, sad. Спокойное лицо зависит от засветки.
  convFaces(root, moodT, dead) {
    const drawFace = (who, mood) => {
      const el = $(`[data-face="${who}"]`, root);
      if (!el) return null;
      const p = PEOPLE[who] || {};
      const src = (p.faces && (p.faces[mood] || p.faces.calm)) || p.img;
      el.innerHTML = src
        ? `<img class="o-photo" src="${src}" alt="">`
        : Face.svg(p.face || (who === "sova" ? "owl" : {}), "", { bare: el.dataset.bare === "1", mood });
      return el;
    };
    const restMood = () => ((state.heat || 0) >= 60 ? "sus" : "");
    return {
      anchor() {
        const el = $(".o-bust", root) || $(".o-vc-grid", root) || $(".o-call-ava", root) || $(".o-stage", root);
        const r = el.getBoundingClientRect();
        return r.width ? { x: r.left + r.width / 2, y: r.top + r.height * 0.3 } : el;
      },
      mood(who, mood, ms = 1800) {
        if (dead()) return;
        const el = drawFace(who, mood);
        if (!el) return;
        clearTimeout(moodT[who]);
        moodT[who] = ms ? setTimeout(() => { moodT[who] = 0; if (!dead()) drawFace(who, restMood()); }, ms) : -1;
        const bust = el.closest(".o-bust") || el.closest(".o-tile") || el.closest(".o-call-ava");
        if (bust) {
          const cls = mood === "happy" || mood === "wow" ? "pop" : mood === "sus" || mood === "angry" ? "jolt" : "";
          bust.classList.remove("pop", "jolt");
          if (cls) { void bust.offsetWidth; bust.classList.add(cls); setTimeout(() => bust.classList.remove(cls), 520); }
        }
      },
      rest(who) { if (!dead() && !moodT[who] && restMood()) drawFace(who, restMood()); },
      react(who, emoji) {
        const host = $(`.o-tile[data-who="${who}"]`, root) || $(".o-facecard", root) || $(".o-callcard", root);
        if (!host || !emoji) return;
        const e = document.createElement("span");
        e.className = "o-emote";
        e.textContent = emoji;
        e.style.left = 30 + Math.random() * 40 + "%";
        e.style.top = "26%";
        host.appendChild(e);
        setTimeout(() => e.remove(), 1500);
      }
    };
  }
};

// ───────── отклик: очки летят от места действия, конфетти, баннеры комбо ─────────
// Обычный (ночной) отклик остаётся в js/juice.js; здесь — мультяшные версии тех же методов.
const JUICE_TOON = {
  COLORS: ["#ff4f8b", "#ffd23f", "#3de0a8", "#38d0ff", "#9b6bff", "#ff7a59", "#ffffff"],

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

  confetti(el, count = 70) {
    const p = el && el.x != null ? el : this.at(el);
    const C = JUICE_TOON.COLORS, list = [];
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 5 + Math.random() * 10;
      list.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.32, life: 90 + Math.random() * 50, w: 6 + Math.random() * 7, h: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: C[i % C.length] });
    }
    this.spawn(list);
  },
  rain(count = 140) {
    const C = JUICE_TOON.COLORS, list = [];
    for (let i = 0; i < count; i++) {
      list.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 4, g: 0.05, life: 220 + Math.random() * 80, w: 7 + Math.random() * 7, h: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: C[i % C.length] });
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
      const w = p.w || (p.r || 2) * 2, h = p.h || w;
      p.vy += p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.rot = (p.rot || 0) + (p.vr || 0) * k; p.life -= k; p.vx *= 0.99;
      cx.globalAlpha = clamp(p.life / 24, 0, 1);
      cx.fillStyle = p.c;
      if (p.round || p.r) { cx.beginPath(); cx.arc(p.x, p.y, w / 2, 0, 7); cx.fill(); }
      else { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-w / 2, -h / 2, w, h); cx.restore(); }
    }
    cx.globalAlpha = 1;
    this.raf = this.parts.length ? requestAnimationFrame((x) => this.tick(x)) : 0;
  },

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
  rankUp() {
    this.init();
    Sound.sfx("levelup");
    const r = Toon.rank();
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
    const r = Toon.rank(), xp = Profile.get().xp;
    box.innerHTML = `<div class="xpchip ${bump ? "bump" : ""}" title="${esc(r.name)} · ${xp} XP${r.next ? " · до ранга «" + esc(r.next.name) + "» " + (r.next.at - xp) : ""}">
      <i>${r.ico}</i><div><b>${esc(r.name)}</b><div class="xp-bar"><u style="width:${r.pct}%"></u></div></div><em>${xp}</em></div>
      ${this.combo >= 2 ? `<div class="combochip ${bump ? "bump" : ""}">🔥<b>×${this.combo}</b></div>` : ""}`;
  },
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
  badge(id) {
    if (!BADGES[id]) return false;
    const P = Profile.get();
    if (P.badges[id]) return false;
    P.badges[id] = Date.now();
    Profile.save();
    if (Game.inPlay() && state.season === 3) { const st = Mission.stats(); (st.badges = st.badges || []).push(id); }
    this.init();
    const B = Toon.badge(id);
    const el = document.createElement("div");
    el.className = "badge-pop";
    el.innerHTML = `<i>${B.emo}</i><div><span>Новый стикер</span><b>${esc(B.name)}</b></div>`;
    document.body.appendChild(el);
    Sound.sfx("star");
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, 3600);
    this.xp(20, { x: 150, y: innerHeight - 120 });
    return true;
  }
};
Object.entries(JUICE_TOON).forEach(([k, fn]) => {
  if (typeof fn !== "function") return;
  const night = Juice[k];
  Juice[k] = function (...a) { return (TOON() ? fn : night).apply(this, a); };
});

// Гаджеты с эмодзи и прежними именами: «Суфлёр», «Иней», «Печенье».
(() => {
  const night = Gadgets.html;
  Gadgets.html = function (ids) {
    if (!TOON()) return night.call(this, ids);
    return ids.map((id) => {
      const [ico, name, how] = TOON_GADGETS[id] || ["", GADGETS[id].name, GADGETS[id].how], n = this.left(id);
      return `<button class="gadget" data-gadget="${id}" ${n ? "" : "disabled"} title="${esc(how)}"><i>${ico}</i><b>${esc(name)}</b><em>${n}</em></button>`;
    }).join("");
  };
})();

// ───────── вещи на столе Грейс: как они называются ─────────
const DESK_WORDS = {
  lamp: ["a lamp", "лампа"], photo: ["a photo", "фото: кот по кличке Biscuit"], monitor: ["a monitor", "монитор"],
  calendar: ["a calendar", "календарь; пятница обведена дважды"], plant: ["a plant", "растение"], phone: ["a phone", "телефон"],
  folder: ["a blue folder", "синяя папка"], keyboard: ["a keyboard", "клавиатура"], mouse: ["a mouse", "мышь"],
  mug: ["a mug", "кружка"], stapler: ["a stapler", "степлер"], biscuits: ["a tin of biscuits", "жестянка с печеньем"],
  bin: ["a bin", "мусорная корзина"], top: ["the top drawer", "верхний ящик: зарядки и скрепки"], bottom: ["the bottom drawer", "нижний ящик"]
};

// ───────── обыск стола Грейс по её голосовым (сцена "deskSearch") ─────────
// Предлоги места и названия вещей; запретный нижний ящик; Грейс возвращается, когда кончилось время.
const DeskSearch = {
  svg() {
    const hit = (x, y, w, h) => `<rect class="s-hit" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`;
    return `<svg class="s-desk" viewBox="0 0 1000 620" aria-hidden="true">
      <rect width="1000" height="320" fill="#ffe1cf"/>
      <rect y="300" width="1000" height="320" fill="#3a2e92"/>
      <g opacity=".5" fill="#ffcdb4"><circle cx="120" cy="250" r="5"/><circle cx="320" cy="60" r="5"/><circle cx="520" cy="80" r="5"/><circle cx="700" cy="230" r="5"/><circle cx="940" cy="240" r="5"/><circle cx="60" cy="90" r="5"/></g>
      <g class="s-obj" data-id="photo">${hit(96, 36, 150, 150)}<rect x="104" y="44" width="134" height="134" rx="8" fill="#fff" transform="rotate(-4 171 111)"/><rect x="116" y="56" width="110" height="94" rx="4" fill="#7ee6c4" transform="rotate(-4 171 111)"/>
        <g transform="rotate(-4 171 111)"><ellipse cx="171" cy="122" rx="30" ry="24" fill="#f3a76b"/><path d="M147 108 L150 84 L164 100 Z M195 108 L192 84 L178 100 Z" fill="#f3a76b"/><circle cx="162" cy="118" r="3.4" fill="#2b1a00"/><circle cx="180" cy="118" r="3.4" fill="#2b1a00"/><path d="M167 127 q4 4 8 0" stroke="#2b1a00" stroke-width="2" fill="none"/></g></g>
      <g class="s-obj" data-id="calendar">${hit(748, 30, 164, 170)}<rect x="756" y="38" width="148" height="154" rx="10" fill="#fff"/><rect x="756" y="38" width="148" height="38" rx="10" fill="#ff4f8b"/><text x="830" y="64" text-anchor="middle" font-size="18" font-weight="900" fill="#fff" font-family="Segoe UI, sans-serif">MARCH</text>
        <g fill="#d9d2f5">${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${770 + c * 26}" y="${90 + r * 24}" width="18" height="16" rx="3"/>`).join("")).join("")}</g>
        <circle cx="883" cy="146" r="14" fill="none" stroke="#ff4f8b" stroke-width="4"/><circle cx="883" cy="146" r="19" fill="none" stroke="#ff4f8b" stroke-width="2"/></g>
      <rect x="30" y="300" width="940" height="176" rx="16" fill="#d49a63"/>
      <rect x="30" y="456" width="940" height="164" fill="#b87c48"/><rect x="30" y="456" width="940" height="14" fill="#a26a3b"/>
      <g class="s-obj" data-id="lamp">${hit(84, 150, 150, 200)}<ellipse cx="140" cy="338" rx="46" ry="12" fill="#2b2360"/><path d="M140 334 L170 210" stroke="#2b2360" stroke-width="9" stroke-linecap="round"/><path d="M124 208 Q176 150 232 196 L196 236 Z" fill="#ffd23f"/><ellipse cx="212" cy="218" rx="24" ry="10" fill="#fff6c8" transform="rotate(44 212 218)"/></g>
      <g class="s-obj" data-id="monitor">${hit(392, 138, 240, 200)}<rect x="400" y="146" width="224" height="150" rx="14" fill="#1a1238"/><rect x="412" y="158" width="200" height="126" rx="6" fill="#7fe0ff"/><rect x="424" y="172" width="90" height="10" rx="5" fill="#fff" opacity=".8"/><rect x="424" y="192" width="140" height="8" rx="4" fill="#fff" opacity=".5"/><rect x="424" y="208" width="110" height="8" rx="4" fill="#fff" opacity=".5"/>
        <rect x="496" y="296" width="32" height="26" fill="#1a1238"/><rect x="456" y="318" width="112" height="12" rx="6" fill="#1a1238"/><rect x="588" y="140" width="40" height="40" fill="#ffe27a" transform="rotate(8 608 160)"/></g>
      <g class="s-note s-n-plant"><rect x="800" y="262" width="62" height="56" fill="#ffe27a" transform="rotate(-6 831 290)"/><text x="831" y="286" text-anchor="middle" font-size="13" font-weight="800" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive">YOGA</text><text x="831" y="304" text-anchor="middle" font-size="11" font-weight="700" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive">Sat 10:00</text></g>
      <g class="s-obj" data-id="plant">${hit(770, 150, 130, 190)}<g class="sc-sway"><path d="M836 268 C826 220 780 200 762 160 C800 168 828 200 838 244 Z" fill="#2fbf8f"/><path d="M836 268 C846 214 884 190 904 150 C860 162 838 204 834 244 Z" fill="#3de0a8"/><path d="M836 268 C832 214 816 176 834 138 C852 178 842 226 838 250 Z" fill="#25a87c"/></g><path d="M800 262 H872 L862 332 H810 Z" fill="#ff7a59"/><rect x="794" y="254" width="84" height="16" rx="7" fill="#e0603f"/></g>
      <g class="s-obj" data-id="biscuits">${hit(672, 296, 96, 70)}<ellipse cx="720" cy="344" rx="40" ry="14" fill="#c9304a"/><rect x="680" y="314" width="80" height="30" fill="#ff4f5e"/><ellipse cx="720" cy="314" rx="40" ry="14" fill="#ff7a86"/><circle cx="708" cy="312" r="7" fill="#e9b872"/><circle cx="730" cy="316" r="7" fill="#d9a55e"/></g>
      <g class="s-obj" data-id="phone">${hit(72, 362, 130, 90)}<rect x="80" y="372" width="114" height="72" rx="12" fill="#2b2360"/><rect x="88" y="366" width="34" height="84" rx="14" fill="#4a3fb0"/><g fill="#7fe0ff"><rect x="134" y="384" width="12" height="10" rx="2"/><rect x="152" y="384" width="12" height="10" rx="2"/><rect x="170" y="384" width="12" height="10" rx="2"/><rect x="134" y="402" width="12" height="10" rx="2"/><rect x="152" y="402" width="12" height="10" rx="2"/><rect x="170" y="402" width="12" height="10" rx="2"/><rect x="134" y="420" width="12" height="10" rx="2"/><rect x="152" y="420" width="12" height="10" rx="2"/><rect x="170" y="420" width="12" height="10" rx="2"/></g></g>
      <g class="s-note s-n-folder"><rect x="262" y="330" width="70" height="56" fill="#ffe27a" transform="rotate(7 297 358)"/><text x="297" y="354" text-anchor="middle" font-size="11" font-weight="800" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive" transform="rotate(7 297 358)">SwiftBox</text><text x="297" y="372" text-anchor="middle" font-size="13" font-weight="900" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive" transform="rotate(7 297 358)">SB-4471</text></g>
      <g class="s-obj" data-id="folder">${hit(212, 346, 140, 104)}<rect x="220" y="354" width="124" height="90" rx="8" fill="#2f7de0" transform="rotate(-5 282 399)"/><rect x="220" y="354" width="124" height="18" rx="8" fill="#5a9bf0" transform="rotate(-5 282 399)"/><rect x="250" y="388" width="64" height="22" rx="4" fill="#fff" transform="rotate(-5 282 399)"/></g>
      <g class="s-crumbs" fill="#e9b872"><circle cx="450" cy="408" r="4"/><circle cx="486" cy="420" r="3"/><circle cx="530" cy="404" r="5"/><circle cx="566" cy="424" r="3"/><circle cx="600" cy="410" r="4"/><circle cx="508" cy="430" r="3"/></g>
      <g class="s-obj" data-id="keyboard">${hit(396, 372, 252, 76)}<rect x="404" y="380" width="236" height="60" rx="10" fill="#f2efff"/><g fill="#bdb4e8">${[0, 1, 2].map((r) => Array.from({ length: 11 }, (_, c) => `<rect x="${414 + c * 20}" y="${388 + r * 16}" width="15" height="11" rx="2.5"/>`).join("")).join("")}</g></g>
      <g class="s-obj" data-id="mouse">${hit(656, 388, 54, 64)}<rect x="664" y="394" width="38" height="52" rx="19" fill="#f2efff"/><path d="M683 396 v18" stroke="#bdb4e8" stroke-width="3"/></g>
      <g class="s-obj" data-id="mug">${hit(732, 366, 84, 80)}<path d="M740 376 H790 V430 Q765 444 740 430 Z" fill="#ff4f8b"/><path d="M790 388 q20 2 18 18 t-18 16" stroke="#ff4f8b" stroke-width="8" fill="none"/><ellipse cx="765" cy="376" rx="25" ry="7" fill="#7a2e1a"/></g>
      <g class="s-obj" data-id="stapler">${hit(828, 392, 110, 56)}<rect x="836" y="424" width="94" height="14" rx="6" fill="#2b2360"/><path d="M838 422 L926 402 Q934 412 928 424 L838 424 Z" fill="#ff4f5e"/></g>
      <g class="s-obj" data-id="top">${hit(80, 484, 262, 60)}<rect x="88" y="490" width="246" height="50" rx="8" fill="#c98b56"/><rect x="186" y="508" width="50" height="12" rx="6" fill="#7a4a2a"/></g>
      <g class="s-obj" data-id="bottom">${hit(80, 548, 262, 64)}<rect x="88" y="554" width="246" height="54" rx="8" fill="#c98b56"/><rect x="186" y="574" width="50" height="12" rx="6" fill="#7a4a2a"/><text x="306" y="586" font-size="20">🔒</text></g>
      <g class="s-obj" data-id="bin">${hit(800, 494, 110, 122)}<path d="M810 504 H900 L890 612 H820 Z" fill="#8f86d6"/><rect x="804" y="496" width="102" height="14" rx="7" fill="#6f65c0"/><path d="M834 520 v76 M855 520 v76 M876 520 v76" stroke="#6f65c0" stroke-width="5"/></g>
    </svg>`;
  },

  async run(sc, tok) {
    const lv = level();
    const who = sc.who || "grace";
    $("#scene").innerHTML = `
      <section class="a-game a-search">
        <div class="s-stage"><div class="s-frame">${this.svg()}<div class="s-label" hidden></div></div></div>
        <aside class="a-card s-side">
          <header class="a-top"><span class="a-kicker">${esc(sc.place || "Стол")}</span><span class="s-clock">0:00</span></header>
          <div class="a-timer"><i></i></div>
          <div class="s-log"></div>
          <div class="s-word muted small">Нажимай на вещи — узнаешь, как они называются.</div>
          <footer><span class="s-count muted small"></span><button class="btn mint small" data-act="leave" disabled>Уйти от стола</button></footer>
        </aside>
      </section>`;
    const root = $(".a-search"), log = $(".s-log", root), frame = $(".s-frame", root);
    Music.play("tense");
    await Arcade.intro(sc, { ico: "eye", emo: "🗂️", keys: ["Читай и слушай, где искать", "under · behind · next to · in", "Любая вещь называет себя по-английски"] });
    if (tok.dead) return null;
    const S = { step: 0, found: 0, words: new Set(), drawer: false, open: false, caught: false, ended: false, sticky: false };
    const bubble = (html, cls) => { const el = document.createElement("div"); el.className = "o-bub " + cls; el.innerHTML = html; log.appendChild(el); log.scrollTop = log.scrollHeight; return el; };
    const say = async (text, o = {}) => {
      bubble(`${lv.subs === "live" || o.show ? enHTML(text) : `<span class="s-veil">🎤 голосовое · <button class="s-show">показать текст</button></span><span class="s-hid" hidden>${enHTML(text)}</span>`}<button class="o-bub-play" data-say="${esc(text)}" data-who="${who}">${ICON.play}</button>`, "them en");
      Sound.sfx("note");
      timer.pause(true);
      await raceDead(tok, Voice.sayAsync(text, { who }));
      timer.pause(false);
    };
    const count = () => { $(".s-count", root).textContent = `Слова: ${S.words.size} из ${Object.keys(DESK_WORDS).length}`; };
    count();
    let resolveEnd;
    const ended = new Promise((r) => { resolveEnd = r; });
    const end = (why) => { if (S.ended) return; S.ended = true; timer.stop(); resolveEnd(why); };
    const total = (sc.seconds || 75) * (lv.subs === "live" ? 1.25 : 1);
    const timer = Arcade.timer($(".a-timer i", root), total, () => end("time"));
    const clock = setInterval(() => { const s = Math.max(0, Math.ceil(timer.left())); const c = $(".s-clock", root); if (c) c.textContent = `Грейс вернётся через ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 250);
    Game.onLeave(() => { clearInterval(clock); timer.stop(); S.ended = true; });

    const label = (g, id) => {
      const [en, ru] = DESK_WORDS[id];
      const l = $(".s-label", root), fr = frame.getBoundingClientRect(), r = g.getBoundingClientRect();
      l.hidden = false;
      l.innerHTML = `<b>${esc(en)}</b><span>${esc(ru)}</span>`;
      l.style.left = clamp(r.left + r.width / 2 - fr.left, 70, fr.width - 70) + "px";
      l.style.top = Math.max(8, r.top - fr.top - 8) + "px";
      l.style.animation = "none"; void l.offsetWidth; l.style.animation = "";
      $(".s-word", root).innerHTML = `<b class="english">${esc(en)}</b> — ${esc(ru)}`;
      if (!S.words.has(id)) { S.words.add(id); count(); Juice.xp(2, g); }
      if (!Voice.busy()) Voice.say(en, { who: "guest", rate: 0.85 });
    };
    // Карточка находки. Таймер стоит, пока игрок читает (кроме запретного ящика).
    const reveal = (html, { live = false, btn = "Дальше" } = {}) => new Promise((res) => {
      const el = document.createElement("div");
      el.className = "o-find";
      el.innerHTML = `<div class="o-find-card">${html}<button class="btn primary" data-act="ok">${esc(btn)}</button></div>`;
      root.appendChild(el);
      if (!live) timer.pause(true);
      const done = () => { el.remove(); if (!live) timer.pause(false); res(); };
      $("[data-act]", el).addEventListener("click", done, { once: true });
      ended.then(() => { if (el.isConnected) { el.remove(); res(); } });
    });
    const tasks = sc.tasks;
    const next = async () => {
      const t = tasks[S.step];
      if (!t) return;
      if (t.me) { bubble(esc(t.me), "me"); await sleep(600); }
      if (tok.dead || S.ended) return;
      await say(t.say);
    };
    let busy = false;
    const onClick = async (e) => {
      const sh = e.target.closest(".s-show");
      if (sh) { const b = sh.closest(".o-bub"); $(".s-veil", b).hidden = true; $(".s-hid", b).hidden = false; return; }
      const sayBtn = e.target.closest("[data-say]");
      if (sayBtn) return Voice.say(sayBtn.dataset.say, { who: sayBtn.dataset.who, rate: 0.85 });
      if (e.target.closest('[data-act="leave"]')) return end("left");
      const g = e.target.closest(".s-obj");
      if (!g || busy || S.ended || tok.dead) return;
      const id = g.dataset.id;
      const t = tasks[S.step];
      label(g, id);
      if (id === "bottom" && !S.drawer) {
        busy = true;
        g.classList.add("opening");
        Sound.sfx("drawer");
        await sleep(1400);
        g.classList.remove("opening");
        if (S.ended) { busy = false; return; }
        g.classList.add("open");
        S.drawer = true; S.open = true;
        Juice.badge("nosy");
        (sc.drawer.clues || []).forEach((c) => Clues.add(c));
        await reveal(sc.drawer.html, { live: true, btn: "Закрыть ящик" });
        S.open = false;
        g.classList.remove("open");
        Sound.sfx("drawer");
        busy = false;
        return;
      }
      if (!t || id !== t.target) { Sound.sfx("pop"); return; }
      busy = true;
      S.step += 1;
      S.found += 1;
      g.classList.add("moved");
      root.classList.add("did-" + id);
      Sound.sfx(t.win ? "combo" : "ok");
      Juice.hit(g, { first: true, base: 10 });
      if (t.win) { S.sticky = true; Notes.add({ kind: "item", src: "item", scene: sc.id, time: sc.time || "", text: t.item || "" }); $('[data-act="leave"]', root).disabled = false; }
      await reveal(`<h3>${esc(t.title)}</h3>${t.html}<p class="o-find-q">${esc(t.ru)}</p>`);
      busy = false;
      if (S.ended || tok.dead) return;
      await next();
    };
    root.addEventListener("click", onClick);
    await next();
    const why = await raceDead(tok, ended);
    clearInterval(clock);
    root.removeEventListener("click", onClick);
    if (tok.dead) return null;
    Music.stop();
    Voice.stop();
    // Грейс возвращается.
    S.caught = why === "time" && S.open;
    Sound.sfx("steps");
    await sleep(900);
    const line = S.caught ? sc.back.caught : S.sticky ? sc.back.ok : sc.back.late;
    bubble(enHTML(line), "them en");
    await raceDead(tok, Voice.sayAsync(line, { who }));
    if (tok.dead) return null;
    if (S.caught) Heat.add(25, "Грейс застала тебя у своего ящика");
    if (sc.done) sc.done(state, S);
    Store.save();
    if (Heat.over()) return { fail: "Грейс застала тебя в своём ящике, и вопросов стало слишком много. Легенда сгорела." };
    const xp = S.found * 6 + (S.sticky ? 15 : 0);
    const notes = Object.entries(DESK_WORDS).filter(([id]) => S.words.has(id)).slice(0, 8).map(([, w]) => `<b class="english">${esc(w[0])}</b><span>${esc(w[1])}</span>`);
    const act = await Arcade.result(sc, { score: S.found, max: tasks.filter((t) => t.target).length, xp, notes, title: S.caught ? "Застукали" : S.sticky ? "Номер найден" : "Не успел(а)",
      line: `Найдено по указаниям: ${S.found} из ${tasks.filter((t) => t.target).length} · слов: ${S.words.size}` });
    return act === "again" ? { again: true } : null;
  }
};

// ───────── лифт: быстрый small talk с Максом (сцена "elevator") ─────────
// Кабина с этажами, рисованное лицо, шкала неловкости. Ночной «быстрый ответ» — Lift в js/arcade.js.
const LiftCab = {
  async run(sc, tok) {
    const who = sc.who || "max";
    const items = val(sc.items, state);
    const lv = level();
    $("#scene").innerHTML = `
      <section class="a-game a-lift">
        <div class="lift-cab">
          <div class="lift-top"><div class="lift-disp"><b>G</b><span>▲</span></div></div>
          <div class="lift-in">
            <div class="lift-panel">${items.map((_, i) => `<i data-f="${items.length - i}">${items.length - i}</i>`).join("")}</div>
            <div class="lift-rail"></div>
            <div class="o-bubble" hidden></div>
            <div class="lift-npc" data-who="${who}"></div>
          </div>
          <div class="lift-doors"><i></i><i></i></div>
        </div>
        <div class="a-card lift-side">
          <header class="a-top"><span class="a-kicker">Этаж <b class="lift-n">0</b> из ${items.length}</span><div class="lift-awk" title="Шкала неловкости"></div></header>
          <div class="a-timer"><i></i></div>
          <p class="lift-q muted">Двери закрываются…</p>
          <div class="lift-opts"></div>
          <p class="muted small lift-tip">${Mic.supported() ? "Клавиши 1–3. Или держи пробел и скажи ответ вслух — за голос больше опыта." : "Клавиши 1, 2, 3 тоже работают."}</p>
        </div>
      </section>`;
    const root = $(".a-lift"), npc = $(".lift-npc", root), bub = $(".o-bubble", root), opts = $(".lift-opts", root);
    const face = (mood) => {
      const p = PEOPLE[who] || {};
      const src = (p.faces && (p.faces[mood] || p.faces.calm)) || p.img;
      npc.innerHTML = src
        ? `<img class="o-photo" src="${src}" alt="">`
        : Face.svg(p.face, "", { bare: true, mood });
    };
    face("");
    let awkward = 0, right = 0, voiceHits = 0, floor = 0;
    const drawAwk = () => { $(".lift-awk", root).innerHTML = items.map((_, i) => `<i class="${i < awkward ? "on" : ""}">😬</i>`).join(""); };
    drawAwk();
    await Arcade.intro(sc, { ico: "chat", emo: "🛗", keys: ["Выбери естественный ответ", "Не успел — неловкая пауза", "Можно ответить голосом"] });
    if (tok.dead) return null;
    root.classList.add("closed");
    Sound.sfx("ding");
    await sleep(900);
    const notes = [];
    for (const it of items) {
      if (tok.dead) return null;
      floor += 1;
      const ok = await this.turn(sc, tok, root, it, who, lv, face, (v) => { if (v) voiceHits += 1; });
      if (tok.dead) return null;
      if (ok) right += 1; else { awkward += 1; drawAwk(); }
      notes.push(`<b class="english">${esc(it.say)}</b><span class="english">→ ${esc(it.right)}</span>`);
      // едем на следующий этаж
      root.classList.add("moving");
      opts.innerHTML = "";
      $(".lift-q", root).textContent = "…";
      await sleep(650);
      $(".lift-disp b", root).textContent = String(floor);
      $(".lift-n", root).textContent = String(floor);
      $$(".lift-panel i", root).forEach((b) => b.classList.toggle("on", Number(b.dataset.f) === floor));
      Sound.sfx("tick");
      root.classList.remove("moving");
      await sleep(250);
    }
    bub.hidden = true;
    root.classList.remove("closed");
    Sound.sfx("ding");
    face(awkward === 0 ? "happy" : awkward >= 3 ? "hm" : "");
    if (sc.done) sc.done(state, { right, total: items.length });
    await sleep(900);
    const xp = right * 12 + voiceHits * 5;
    const act = await Arcade.result(sc, { score: right, max: items.length, xp, notes: notes.slice(0, 6), line: awkward ? `Неловких пауз: ${awkward} из ${items.length}` : "Ни одной неловкой паузы", badge: "smooth" });
    return act === "again" ? { again: true } : null;
  },

  turn(sc, tok, root, it, who, lv, face, onVoice) {
    return new Promise((resolve) => {
      const bub = $(".o-bubble", root), box = $(".lift-opts", root), q = $(".lift-q", root);
      const list = shuffle([{ t: it.right, ok: true }, ...it.wrong.map((t) => ({ t, ok: false }))]);
      let done = false, timer = null, handler = null;
      const showLine = (reveal) => {
        bub.hidden = false;
        bub.className = "o-bubble" + (reveal ? "" : " veil");
        bub.innerHTML = reveal ? enHTML(it.say) : "• • •";
      };
      showLine(lv.subs === "live");
      q.textContent = "Что ответишь?";
      box.innerHTML = list.map((o, i) => `<button class="lift-opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.t)}</span></button>`).join("");
      face("");
      $(".lift-npc", root).classList.add("speaking");
      const cleanup = () => {
        window.removeEventListener("keydown", onKey);
        if (handler) { PTT.unbind(handler); Mic.abort(); }
        if (timer) timer.stop();
      };
      const pick = async (i, viaVoice) => {
        if (done) return;
        done = true;
        cleanup();
        Voice.stop();
        $(".lift-npc", root).classList.remove("speaking");
        showLine(true);
        const o = i == null ? null : list[i];
        const ok = !!(o && o.ok);
        $$(".lift-opt", box).forEach((b, k) => { b.disabled = true; b.classList.add(list[k].ok ? "right" : k === i ? "wrong" : "dim"); });
        if (ok) {
          face("happy");
          Juice.hit($(".lift-npc", root), { first: true, voice: viaVoice, base: 6 });
          if (viaVoice) onVoice(true);
          q.textContent = "Естественно. Едем дальше.";
          if (it.back) await raceDead(tok, Promise.race([Voice.sayAsync(it.back, { who }), sleep(3000)]));
          else await sleep(700);
        } else {
          face("hm");
          Juice.miss();
          Sound.sfx("awkward");
          Juice.float(i == null ? "…тишина" : "неловко", $(".lift-npc", root), "bad");
          q.textContent = it.why || "Так не отвечают. Верный вариант подсвечен.";
          await sleep(2300);
        }
        resolve(ok);
      };
      const onKey = (e) => {
        if (Game.paused || !$("#modal").hidden) return;
        if (/^[1-3]$/.test(e.key)) pick(Number(e.key) - 1, false);
      };
      window.addEventListener("keydown", onKey);
      box.onclick = (e) => { const b = e.target.closest(".lift-opt"); if (b) pick(Number(b.dataset.i), false); };
      // Ответ голосом: распознанное сравнивается с вариантами по словам.
      if (Mic.supported()) {
        handler = {
          start() { Voice.stop(); Sound.sfx("ptt-on"); Mic.start(); root.classList.add("mic"); },
          async end() {
            root.classList.remove("mic");
            Sound.sfx("ptt-off");
            const said = norm(await Mic.stop());
            if (!said || done) return;
            const sw = new Set(said.split(" "));
            let best = -1, bestScore = 0;
            list.forEach((o, i) => {
              const ws = norm(o.t).split(" ");
              const s = ws.filter((w) => sw.has(w)).length / ws.length;
              if (s > bestScore) { bestScore = s; best = i; }
            });
            if (bestScore >= 0.6) pick(best, true);
            else UI.toast("Не разобрал. Скажи вариант целиком или нажми на него.", "info");
          }
        };
        PTT.bind(handler);
      }
      Game.onLeave(() => { done = true; cleanup(); });
      // Время пошло, когда реплика прозвучала.
      Voice.sayAsync(it.say, { who }).then(() => {
        $(".lift-npc", root).classList.remove("speaking");
        if (done || tok.dead) return;
        timer = Arcade.timer($(".a-timer i", root), (sc.secs || 7) * (lv.subs === "live" ? 1.25 : lv.subs === "none" ? 0.85 : 1), () => pick(null, false));
      });
    });
  }
};
