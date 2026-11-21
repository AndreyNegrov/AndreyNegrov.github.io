// Общие части сезона «Онбординг»: легенда, засветка, разговорник, улики, досье,
// карта офиса, карточки глав, итоги миссий и финал.

const Leg = {
  get(s = state) { return (s && s.legend) || { city: "riga", job: "courier", ride: "bike" }; },
  city(s) { return LEGEND.city[this.get(s).city] || LEGEND.city.riga; },
  job(s) { return LEGEND.job[this.get(s).job] || Object.values(LEGEND.job)[0]; },
  ride(s) { return LEGEND.ride[this.get(s).ride] || Object.values(LEGEND.ride)[0]; },
  otherCities(s) {
    const mine = this.get(s).city;
    return Object.entries(LEGEND.city).filter(([k]) => k !== mine).flatMap(([, c]) => c.any);
  },
  otherJobs(s) {
    const mine = this.get(s).job;
    return Object.entries(LEGEND.job).filter(([k]) => k !== mine).map(([, j]) => j);
  }
};

// Слова игрока: сколько английских слов, вопрос ли это.
function enWords(text) { return norm(text).split(" ").filter((w) => /[a-z]/.test(w)).length; }
function isQuestion(text) {
  const raw = String(text || "").trim();
  if (raw.endsWith("?")) return true;
  const t = norm(raw);
  return /^(what|when|where|who|whom|why|how|which|whose|can|could|do|does|did|is|are|was|were|will|would|should|have|has|may|any)\b/.test(t)
    || /\b(can i|could i|do you|is there|are there|will i|what about|how about|tell me about)\b/.test(t);
}

// ───────── засветка ─────────
const Heat = {
  add(n, reason) {
    if (!n) return;
    const k = n > 0 ? level().sus : 1;
    const before = state.heat || 0;
    state.heat = clamp(Math.round(before + n * k), 0, 100);
    const st = Mission.stats();
    st.heatMax = Math.max(st.heatMax || 0, state.heat);
    Store.save();
    UI.renderSus(true);
    if (n > 0) {
      UI.toast(`<b>Засветка +${state.heat - before}</b>${reason ? " · " + esc(reason) : ""}`, "bad");
      Juice.miss();
      Juice.shake();
      Juice.flash("bad");
      Sound.sfx("wrong");
      Juice.float(`засветка +${state.heat - before}`, $("#hud-sus"), "bad");
    } else if (state.heat < before) {
      Juice.flash("frost");
      Sound.sfx("freeze");
      Juice.float(`засветка −${before - state.heat}`, $("#hud-sus"), "ok");
    }
  },
  over() { return (state.heat || 0) >= 100; }
};

// ───────── разговорник ─────────
const Phrases = {
  get(id) { return PHRASES.find((p) => p.id === id); },
  unlock(id) {
    if (!this.get(id)) return false;
    state.phrases = state.phrases || {};
    if (state.phrases[id]) return false;
    state.phrases[id] = { n: 0 };
    Store.save();
    return true;
  },
  // Отмечает фразы, которые игрок сказал. Возвращает id тех, что впервые прозвучали в этой миссии.
  detect(text) {
    if (!text || isRussian(text)) return [];
    const st = Mission.stats();
    const fresh = [];
    PHRASES.forEach((p) => {
      if (!matchFact(text, p)) return;
      const first = !state.phrases[p.id];
      state.phrases[p.id] = state.phrases[p.id] || { n: 0 };
      state.phrases[p.id].n += 1;
      if (!st.phrases[p.id]) { st.phrases[p.id] = true; fresh.push(p.id); }
      if (first) UI.toast(`<b>Новая фраза в разговорнике</b> ${esc(p.en)}`, "ok");
    });
    if (fresh.length) {
      Sound.sfx("coin");
      Store.save();
      Juice.xp(6 * fresh.length, null, "фраза в деле");
      if (Object.values(state.phrases).filter((x) => x.n > 0).length >= 15) Juice.badge("phrases");
    }
    return fresh;
  }
};

// ───────── улики и досье ─────────
const Clues = {
  add(id, quiet) {
    if (!id || !CLUES[id]) return false;
    state.clues = state.clues || {};
    if (state.clues[id]) return false;
    state.clues[id] = true;
    const st = Mission.stats();
    if (!st.clues.includes(id)) st.clues.push(id);
    Store.save();
    if (!quiet) {
      UI.toast(`<b>Улика</b> ${esc(CLUES[id].ru)}`, "ok", 5600);
      Sound.sfx("stamp");
      Juice.xp(10, $("#btn-notes"), "улика");
    }
    UI.bumpNotes();
    return true;
  },
  has(id) { return !!(state.clues && state.clues[id]); }
};

const Dossier = {
  set(who, field, value) {
    state.dossier = state.dossier || {};
    const d = state.dossier[who] || (state.dossier[who] = {});
    if (d[field] === value) return;
    d[field] = value;
    Store.save();
    const f = (DOSSIER_FIELDS.find((x) => x.id === field) || {}).ru || field;
    UI.toast(`<b>Досье · ${esc(PEOPLE[who].name)}</b> ${esc(f)}: ${esc(value)}`, "ok", 3000);
    Juice.xp(3, $("#btn-notes"));
    UI.bumpNotes();
  }
};

// ───────── миссии ─────────
const Mission = {
  cur() {
    const sc = SCENES[Game.flow()[state.step]];
    return sc && sc.mission ? sc.mission : 0;
  },
  fresh() { return { heatMax: 0, beats: 0, first: 0, need: 0, got: 0, phrases: {}, tips: [], models: [], clues: [], xp: 0, badges: [], games: {} }; },
  stats(m = this.cur()) {
    state.mstats = state.mstats || {};
    return state.mstats[m] || (state.mstats[m] = this.fresh());
  },
  begin(m) {
    state.mstats = state.mstats || {};
    state.mstats[m] = this.fresh();
    state.heat = 0;
    Gadgets.refill();
    Juice.combo = 0;
    Store.save();
    UI.renderSus();
  },
  stars(m) {
    const st = this.stats(m);
    const M = MISSIONS[m];
    const used = Object.keys(st.phrases).length;
    return [
      { ok: (st.heatMax || 0) < 50, label: "Легенда цела", note: `засветка ${st.heatMax || 0} из 100` },
      { ok: !!M.goal.test(state, st), label: M.goal.label },
      { ok: used >= (M.phraseGoal || 2), label: `Фразы в деле: ${used} из ${M.phraseGoal || 2}`, note: "фразы из разговорника, сказанные вслух" }
    ];
  }
};

// ───────── карта офиса ─────────
const OfficeMap = {
  W: 1000, H: 620,
  POS: {
    it: [165, 150], desks: [585, 140], reception: [170, 480], yourdesk: [455, 420],
    booth: [880, 112], cooler: [768, 120], printer: [690, 205], meeting: [742, 372],
    kitchen: [842, 516], coffee: [918, 438], door: [160, 586],
    fridge: [736, 426], board: [330, 318], doorpad: [318, 556]
  },
  pct(id, plan) {
    const pos = plan && typeof PLANS !== "undefined" && PLANS[plan] ? PLANS[plan].pos : this.POS;
    const p = pos[id];
    return { x: (p[0] / this.W) * 100, y: (p[1] / this.H) * 100 };
  },
  svg(plan) {
    if (plan && typeof PLANS !== "undefined" && PLANS[plan]) return PLANS[plan].svg();
    const desk = (x, y) => `<rect x="${x}" y="${y}" width="104" height="46" rx="6" class="m-desk"/><rect x="${x + 38}" y="${y + 6}" width="28" height="4" rx="2" class="m-screen"/>`;
    const chair = (x, y) => `<circle cx="${x}" cy="${y}" r="9" class="m-chair"/>`;
    return `<svg class="o-map-svg" viewBox="0 0 1000 620" aria-hidden="true">
      <defs><pattern id="o-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.035)" stroke-width="1"/></pattern></defs>
      <rect x="20" y="20" width="960" height="580" rx="24" fill="#111722" class="m-floor"/>
      <rect x="20" y="20" width="960" height="580" rx="24" fill="url(#o-grid)"/>
      <rect x="40" y="40" width="250" height="210" rx="16" class="m-zone z-it"/>
      <rect x="800" y="40" width="160" height="150" rx="16" class="m-zone z-glass"/>
      <rect x="700" y="230" width="260" height="120" rx="16" class="m-zone z-meet"/>
      <rect x="700" y="388" width="260" height="192" rx="16" class="m-zone z-kitchen"/>
      <rect x="40" y="400" width="250" height="180" rx="16" class="m-zone z-rec"/>
      <rect x="54" y="54" width="34" height="96" rx="5" class="m-rack"/>
      <g class="m-leds"><circle cx="64" cy="70" r="2.5"/><circle cx="64" cy="86" r="2.5"/><circle cx="64" cy="102" r="2.5"/><circle cx="64" cy="118" r="2.5"/><circle cx="64" cy="134" r="2.5"/></g>
      <path d="M110 110 H250 V170 H210 V150 H110 Z" class="m-desk"/>${chair(165, 182)}
      ${desk(380, 92)}${desk(500, 92)}${desk(380, 150)}${desk(500, 150)}
      ${chair(432, 84)}${chair(552, 84)}${chair(432, 210)}${chair(552, 210)}
      ${desk(380, 360)}${desk(500, 360)}${desk(380, 418)}${desk(500, 418)}
      ${chair(432, 352)}${chair(552, 352)}${chair(455, 474)}${chair(552, 478)}
      <rect x="840" y="88" width="80" height="34" rx="6" class="m-desk"/>${chair(880, 140)}
      <ellipse cx="830" cy="290" rx="80" ry="30" class="m-desk"/>
      ${chair(760, 290)}${chair(900, 290)}${chair(800, 264)}${chair(860, 264)}${chair(800, 326)}${chair(860, 326)}
      <path d="M940 400 V570 H760 V550 H920 V400 Z" class="m-counter"/>
      <rect x="902" y="424" width="30" height="30" rx="5" class="m-coffee"/>
      <rect x="716" y="400" width="40" height="52" rx="5" class="m-fridge"/>
      <circle cx="820" cy="490" r="30" class="m-desk"/>${chair(782, 486)}${chair(858, 486)}
      <path d="M70 520 Q170 450 270 520" class="m-recdesk"/>
      <circle cx="262" cy="428" r="13" class="m-plant"/>
      <rect x="668" y="190" width="44" height="30" rx="5" class="m-printer"/>
      <circle cx="768" cy="120" r="11" class="m-cooler"/>
      <rect x="20" y="20" width="960" height="580" rx="24" fill="none" stroke="#2d394c" stroke-width="7" class="m-wall"/>
      <rect x="118" y="592" width="84" height="16" fill="#111722" class="m-floor"/>
      <g class="m-label">
        <text x="215" y="68">IT</text><text x="880" y="64">Phone booth</text><text x="830" y="250">Meeting room</text>
        <text x="830" y="414">Kitchen</text><text x="165" y="426">Reception</text><text x="690" y="238">Printer</text>
        <text x="768" y="164">Water</text><text x="510" y="300">Open space</text>
      </g>
    </svg>`;
  },
  token(id, who, { label = "", cls = "", act = "", plan = "" } = {}) {
    const p = this.pct(id, plan);
    return `<button class="o-tok ${cls}" style="left:${p.x}%;top:${p.y}%" ${act ? `data-act="${act}" data-who="${who}"` : 'tabindex="-1"'}>
      ${avatar(who, "o-tok-face")}${label ? `<span class="o-tok-label">${esc(label)}</span>` : ""}</button>`;
  }
};

// ───────── экраны ─────────
const Kit = {
  // Короткая заставка главы. Закрывается кликом или сама.
  chapter(ch) {
    return new Promise((resolve) => {
      const el = document.createElement("div");
      el.className = "o-chapter";
      document.body.dataset.m = ch.n;
      el.innerHTML = `<div class="o-ch-in">
        <p class="o-ch-n">${String(ch.n).padStart(2, "0")} / 06</p>
        <h1>${esc(ch.title)}</h1>
        <p class="o-ch-sub">${esc(ch.sub || "")}</p>
        <i class="o-ch-line"></i>
      </div>`;
      document.body.appendChild(el);
      Sound.sfx("whoosh");
      let done = false;
      const close = () => {
        if (done) return;
        done = true;
        el.classList.add("out");
        setTimeout(() => { el.remove(); resolve(); }, 450);
      };
      el.addEventListener("click", close);
      setTimeout(close, 2600);
      Game.onLeave(() => { if (!done) { done = true; el.remove(); } });
    });
  },

  legend(sc) {
    return new Promise((resolve) => {
      const pick = { ...(state.legend || {}) };
      const group = (key, title) => `
        <div class="o-leg-group"><h4>${title}</h4><div class="o-leg-opts">
        ${Object.entries(LEGEND[key]).map(([id, o]) => `
          <button class="o-leg-opt ${pick[key] === id ? "on" : ""}" data-k="${key}" data-v="${id}">
            <b>${esc(o.ru)}</b><span class="english">${enHTML(o.say)}</span>
          </button>`).join("")}
        </div></div>`;
      const keys = LEGEND_GROUPS.map(([k]) => k);
      let drawn = false;
      const draw = () => {
        const ready = keys.every((k) => pick[k]);
        $("#scene").innerHTML = `
          <section class="o-legend">
            <article class="o-leg-card ${drawn ? "still" : ""}">
              <div class="o-leg-head">
                <div class="o-leg-photo">${ICON.user}</div>
                <div><p class="kicker">${esc(Pack.meta().legendKicker || "Легенда · профиль курьера Relay")}</p><h1>Alex Frost</h1>
                <p class="muted">${esc(Pack.meta().legendLead || "Frost — «иней». В Лондоне два месяца. Остальное выбери: потом это придётся говорить вслух, и не один раз.")}</p></div>
              </div>
              ${LEGEND_GROUPS.map(([k, t]) => group(k, t)).join("")}
              <div class="row"><button class="btn primary" data-act="go" ${ready ? "" : "disabled"}>Запомнить легенду</button></div>
            </article>
          </section>`;
        drawn = true;
      };
      $("#scene").onclick = (e) => {
        if (e.target.closest(".w")) return;
        const o = e.target.closest("[data-k]");
        if (o) {
          pick[o.dataset.k] = o.dataset.v;
          Sound.sfx("pop");
          const say = LEGEND[o.dataset.k][o.dataset.v].say;
          Voice.say(say, { who: "guest", rate: 0.9 });
          draw();
          return;
        }
        if (e.target.closest('[data-act="go"]') && keys.every((k) => pick[k])) {
          $("#scene").onclick = null;
          state.legend = pick;
          Store.save();
          Voice.stop();
          resolve();
        }
      };
      Game.onLeave(() => { $("#scene").onclick = null; });
      draw();
    });
  },

  debrief(sc) {
    return new Promise((resolve) => {
      const m = sc.mission;
      const st = Mission.stats(m);
      const stars = Mission.stars(m);
      const won = stars.filter((s) => s.ok).length;
      state.missions = state.missions || {};
      const prev = (state.missions[m] && state.missions[m].stars) || 0;
      state.missions[m] = { stars: Math.max(won, prev), done: true };
      Store.save();
      const gain = Math.max(0, won - prev) * 25;
      const used = Object.keys(st.phrases).map((id) => Phrases.get(id)).filter(Boolean);
      const better = [...st.tips.slice(-2).map((t) => ({ tip: t })), ...st.models.slice(-3)].slice(0, 4);
      const clues = st.clues.map((id) => CLUES[id]).filter(Boolean);
      const next = MISSIONS[m + 1];
      const xp0 = st.xp || 0;
      const rank = Profile.rank();
      $("#scene").innerHTML = `
        <section class="o-debrief">
          <article class="o-db-card">
            <div class="o-db-head"><i>${ICON[MISSIONS[m].ico] || ICON.target}</i><div><p class="kicker">Миссия ${m} · итог</p><h1>${esc(val(sc.title, state))}</h1></div><span class="o-stamp">${won === 3 ? "Чисто" : "Пройдено"}</span></div>
            <div class="o-stars">${stars.map((s) => `<div class="o-star ${s.ok ? "on" : ""}"><i>${ICON.starFill}</i><b>${esc(s.label)}</b>${s.note ? `<span>${esc(s.note)}</span>` : ""}</div>`).join("")}</div>
            <div class="o-xpline"><i>${rank.mark}</i><div><b>${esc(rank.name)}</b><span class="o-xp-next">${rank.next ? `до уровня «${esc(rank.next.name)}» — ${rank.next.at - Profile.get().xp}` : "высший уровень"}</span><div class="xp-bar"><u style="width:${rank.pct}%"></u></div></div><em class="o-xp-n">+${xp0}</em></div>
            <div class="o-db-stickers"></div>
            <div class="o-sova"><div class="o-sova-ava">${avatar("sova", "sm")}</div><p>${esc(val(sc.sova, state))}</p></div>
            <div class="o-db-cols">
              <section><h4>Фразы, которые сработали</h4>
                ${used.length ? used.map((p) => `<div class="o-ph-row"><button class="icon-btn sm" data-say="${esc(p.en)}">${ICON.play}</button><div><b class="english">${esc(p.en)}</b><span>${esc(p.ru)}</span></div></div>`).join("")
                  : `<p class="muted">Ни одной. В следующей миссии попробуй хотя бы «Sorry, could you repeat that?»</p>`}
              </section>
              <section><h4>Как сказать естественнее</h4>
                ${better.length ? better.map((b) => b.tip
                  ? `<div class="o-better"><p>${esc(b.tip)}</p></div>`
                  : `<div class="o-better">${b.hint ? `<span>${esc(b.hint)}</span>` : ""}<p class="english"><button class="icon-btn sm" data-say="${esc(b.en)}">${ICON.play}</button>${enHTML(b.en)}</p></div>`).join("")
                  : `<p class="muted">Всё сказано с первой попытки. Чисто.</p>`}
              </section>
            </div>
            ${clues.length ? `<section class="o-db-clues"><h4>Улики</h4><ul>${clues.map((c) => `<li>${esc(c.ru)}</li>`).join("")}</ul></section>` : ""}
            <div class="row">
              <button class="btn primary" data-act="next">${next ? `Миссия ${m + 1}: ${esc(next.title)} →` : "Дальше"}</button>
              <button class="btn ghost" data-act="again">Переиграть миссию</button>
            </div>
          </article>
        </section>`;
      // Звёзды падают по одной, потом капает опыт и вылетают стикеры.
      const timers = [];
      const later = (ms, fn) => timers.push(setTimeout(fn, ms));
      Game.onLeave(() => timers.forEach(clearTimeout));
      stars.forEach((s, i) => later(250 + i * 350, () => { if (s.ok) { Sound.sfx("star"); Juice.sparks($$(".o-star i")[i], "#ffd23f", 18); } else Sound.sfx("tick"); }));
      later(1350, () => {
        if (m === 1) Juice.badge("first");
        if ((st.heatMax || 0) === 0) Juice.badge("cold");
        if (Object.values(state.missions).reduce((a, x) => a + (x.stars || 0), 0) >= 18) Juice.badge("stars");
        if (gain) Juice.xp(gain, $(".o-xp-n"), "звёзды");
        Kit.xpLine(xp0);
        Sound.sfx(won === 3 ? "win" : "ok");
      });
      $(".o-debrief").onclick = (e) => {
        const sayBtn = e.target.closest("[data-say]");
        if (sayBtn) return Voice.say(sayBtn.dataset.say, { who: "guest", rate: 0.9 });
        const a = e.target.closest("[data-act]");
        if (!a) return;
        Voice.stop();
        if (a.dataset.act === "next") resolve();
        else Kit.replayMission(m);
      };
    });
  },

  // Обновляет строку опыта и стикеры на экране итогов.
  xpLine(from) {
    const st = Mission.stats();
    const n = $(".o-xp-n"), bar = $(".o-xpline .xp-bar u"), nx = $(".o-xp-next"), box = $(".o-db-stickers");
    if (!n) return;
    const rank = Profile.rank();
    const to = st.xp || 0, t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / 900, 0, 1);
      if (!n.isConnected) return;
      n.textContent = "+" + Math.round(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    if (bar) bar.style.width = rank.pct + "%";
    if (nx) nx.textContent = rank.next ? `до уровня «${rank.next.name}» — ${rank.next.at - Profile.get().xp}` : "высший уровень";
    const b = $(".o-xpline b"), ico = $(".o-xpline > i");
    if (b) b.textContent = rank.name;
    if (ico) ico.textContent = rank.mark;
    if (box) box.innerHTML = (st.badges || []).filter((id) => BADGES[id]).map((id) => `<div><i>${ICON[BADGES[id].ico]}</i>${esc(BADGES[id].name)}</div>`).join("");
  },

  replayMission(m) {
    const start = Game.flow().findIndex((id) => SCENES[id].mission === m && SCENES[id].missionStart);
    const mark = state.marks && state.marks["m" + m];
    if (mark) Store.restore(mark);
    state.step = Math.max(0, start);
    Store.save();
    Game.run();
  },

  finale(sc) {
    return new Promise(() => {
      const kind = sc.judge(state);
      const e = FINALE[kind];
      const st = Mission.stats(6);
      const stars6 = Mission.stars(6);
      const won = stars6.filter((s) => s.ok).length;
      state.missions = state.missions || {};
      const prev = (state.missions[6] && state.missions[6].stars) || 0;
      const firstTime = !(state.missions[6] && state.missions[6].done);
      state.missions[6] = { stars: Math.max(won, prev), done: true };
      Store.save();
      const total = Object.keys(CLUES).length;
      const found = Object.keys(state.clues || {}).length;
      const phrases = Object.keys(state.phrases || {}).filter((id) => state.phrases[id].n > 0).length;
      const stars = Object.values(state.missions || {}).reduce((a, x) => a + (x.stars || 0), 0);
      const xp0 = st.xp || 0;
      const rank = Profile.rank();
      Sound.setAmbience("room");
      $("#scene").innerHTML = `
        <section class="o-debrief">
          <article class="o-db-card o-final ${kind}">
            <div class="o-db-head"><i>${kind === "gone" ? ICON.pin : ICON.shield}</i><div><p class="kicker">${esc(sc.kicker)}</p><h1>${esc(e.title)}</h1></div>${kind !== "gone" ? `<span class="o-stamp">Дело закрыто</span>` : ""}</div>
            ${e.text(state).filter(Boolean).map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
            <div class="o-stars">${stars6.map((s) => `<div class="o-star ${s.ok ? "on" : ""}"><i>${ICON.starFill}</i><b>${esc(s.label)}</b>${s.note ? `<span>${esc(s.note)}</span>` : ""}</div>`).join("")}</div>
            <div class="o-xpline"><i>${rank.mark}</i><div><b>${esc(rank.name)}</b><span class="o-xp-next"></span><div class="xp-bar"><u style="width:${rank.pct}%"></u></div></div><em class="o-xp-n">+${xp0}</em></div>
            <div class="o-db-stickers"></div>
            <div class="o-sova"><div class="o-sova-ava">${avatar("sova", "sm")}</div><p>${esc(e.sova(state))}</p></div>
            <div class="stats">
              <div><b>${found}/${total}</b><span>улик</span></div>
              <div><b>${phrases}/${PHRASES.length}</b><span>фраз сказано вслух</span></div>
              <div><b>${stars}/18</b><span>звёзд за миссии</span></div>
              <div><b class="o-st-n">${Object.keys(Profile.get().badges).length}/${Object.keys(BADGES).length}</b><span>отметок в деле</span></div>
            </div>
            <div class="row">
              ${kind !== "best" ? '<button class="btn primary" data-act="m6">Переиграть последнюю ночь</button>' : ""}
              <button class="btn ${kind === "best" ? "primary" : "ghost"}" data-act="title">Главное меню</button>
              <button class="btn ghost" data-act="again">Сезон заново</button>
            </div>
            ${kind === "best" ? '<p class="muted small">Конец сезона «Последняя миля». Тренировки и личное дело — в главном меню.</p>' : ""}
          </article>
        </section>`;
      const timers = [];
      const later = (ms, fn) => timers.push(setTimeout(fn, ms));
      Game.onLeave(() => timers.forEach(clearTimeout));
      stars6.forEach((s, i) => later(250 + i * 350, () => { if (s.ok) { Sound.sfx("star"); Juice.sparks($$(".o-star i")[i], "#ffd23f", 18); } }));
      later(1350, () => {
        if (kind === "best") Juice.badge("clean");
        if ((st.heatMax || 0) === 0 && kind !== "gone") Juice.badge("cold");
        if (stars >= 18) Juice.badge("stars");
        const gain = Math.max(0, won - prev) * 25 + (firstTime ? (kind === "best" ? 100 : kind === "good" ? 50 : 0) : 0);
        if (gain) Juice.xp(gain, $(".o-xp-n"), "финал");
        Kit.xpLine(xp0);
        const n = $(".o-st-n");
        if (n) n.textContent = `${Object.keys(Profile.get().badges).length}/${Object.keys(BADGES).length}`;
        Sound.sfx(kind === "best" ? "win" : kind === "good" ? "ok" : "bad");
      });
      $(".o-final").onclick = (ev) => {
        const a = ev.target.closest("[data-act]");
        if (!a) return;
        if (a.dataset.act === "m6") Kit.replayMission(6);
        else if (a.dataset.act === "again") {
          if (!confirm("Начать сезон заново? Прогресс миссий сотрётся, уровень и отметки останутся.")) return;
          Store.reset(); state.season = 3; state.started = true; state.fv = 2; Store.save(); Game.run();
        } else Game.title();
      };
    });
  },

  // ───── блокнот: вкладки сезона ─────
  notebookTabs() { return [["notes", "Записи"], ["dossier", "Досье"], ["phrases", "Фразы"], ["words", "Слова"], ["legend", "Легенда"]]; },
  notebookBody(tab) {
    if (tab === "dossier") {
      const d = state.dossier || {};
      const cards = SUSPECTS.map((who) => {
        const x = d[who] || {};
        return `<div class="o-dos">
          <div class="o-dos-head">${avatar(who, "sm")}<b>${esc(PEOPLE[who].name)}</b><span>${esc(PEOPLE[who].role)}</span></div>
          ${DOSSIER_FIELDS.map((f) => `<div class="o-dos-row ${x[f.id] ? "ok" : ""}"><span>${esc(f.ru)}</span><b>${x[f.id] ? esc(x[f.id]) : "—"}</b></div>`).join("")}
        </div>`;
      }).join("");
      const clues = Object.keys(state.clues || {}).map((id) => CLUES[id]).filter(Boolean);
      return `<p class="muted">${esc(Pack.meta().dossierNote || "")}</p>${cards}
        <h4>Улики</h4>${clues.length ? `<ul class="o-clue-list">${clues.map((c) => `<li>${esc(c.ru)}</li>`).join("")}</ul>` : '<p class="muted">Пока нет.</p>'}`;
    }
    if (tab === "phrases") {
      const open = PHRASES.filter((p) => state.phrases && state.phrases[p.id]);
      return `<p class="muted">Фразы — твои инструменты. Скажешь вслух в разговоре — сработают. Сказанные отмечены числом.</p>` +
        (open.length ? open.map((p) => `<div class="o-ph-row"><button class="icon-btn sm" data-say="${esc(p.en)}">${ICON.play}</button>
          <div><b class="english">${esc(p.en)}</b><span>${esc(p.ru)}</span>${p.use ? `<em>${esc(p.use)}</em>` : ""}</div>
          <small class="${state.phrases[p.id].n ? "ok" : ""}">${state.phrases[p.id].n ? "×" + state.phrases[p.id].n : "ещё не сказано"}</small></div>`).join("")
          : '<p class="muted">Пусто. Фразы появятся по ходу миссий.</p>');
    }
    if (tab === "legend") {
      const c = Leg.city(), j = Leg.job(), rd = Leg.ride();
      const rows = [["Имя", "My name is Alex Frost."], ["Откуда", `I'm from ${c.en}.`], ["Работа", j.say], [Pack.meta().legend3 || "Транспорт", rd.say], ...(Pack.meta().legendMore || [["В Лондоне", "I've been in London for two months."]])];
      return `<p class="muted">Это нужно говорить одинаково всем. Каждое расхождение — засветка.</p>` +
        rows.map(([k, en]) => `<div class="o-ph-row"><button class="icon-btn sm" data-say="${esc(en)}">${ICON.play}</button><div><span>${esc(k)}</span><b class="english">${esc(en)}</b></div></div>`).join("");
    }
    return null;
  }
};
