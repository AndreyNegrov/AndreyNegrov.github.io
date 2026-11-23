// Особые миссии сезона «Онбординг»:
// Rounds — обход офиса по карте, разговоры по очереди, досье заполняется само.
// Eaves  — подслушивание: ближе слышно лучше, но тебя замечают; нужен повод.
// Stall  — задержать собеседника: говорить, пока не приедет курьер.

const Rounds = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const key = sc.id + ":done", fkey = sc.id + ":finds";
      const done = () => new Set(state.flags[key] || []);
      const seen = () => new Set(state.flags[fkey] || []);
      const finds = sc.finds || [];
      let busy = false;
      let zone = "open";
      let lockZoneUntil = 0;
      let cam = null;
      let mePos = OfficeMap.pct("yourdesk");
      const ZONES = [
        { id: "it", ico: "💻", name: "IT", cx: 0.26, cy: 0.28, people: ["tom"], finds: ["board", "door"] },
        { id: "open", ico: "🖥️", name: "Опен", cx: 0.43, cy: 0.52, people: ["max"], finds: ["printer"] },
        { id: "rec", ico: "🛎️", name: "Ресепшн", cx: 0.24, cy: 0.78, people: ["grace"], finds: [] },
        { id: "kit", ico: "☕", name: "Кухня", cx: 0.82, cy: 0.74, people: [], finds: ["coffee", "fridge"] }
      ];
      const zoneState = (z, d, s) => {
        const pLeft = z.people.filter((w) => sc.people.some((p) => p.who === w) && !d.has(w)).length;
        const fLeft = z.finds.filter((id) => finds.some((f) => f.id === id) && !s.has(id)).length;
        if (pLeft) return "talk";
        if (fLeft) return "clue";
        return "done";
      };
      const panTo = (cx, cy, smooth = true) => {
        const st = $(".o-map-stage");
        if (!st || window.innerWidth > 760) return;
        const left = clamp(cx * st.scrollWidth - st.clientWidth / 2, 0, Math.max(0, st.scrollWidth - st.clientWidth));
        const top = clamp(cy * st.scrollHeight - st.clientHeight / 2, 0, Math.max(0, st.scrollHeight - st.clientHeight));
        cam = { left, top };
        st.scrollTo({ left, top, behavior: smooth ? "smooth" : "auto" });
      };
      const bindPan = () => {
        const st = $(".o-map-stage");
        if (!st) return;
        if (window.innerWidth <= 760) {
          if (cam) { st.scrollLeft = cam.left; st.scrollTop = cam.top; }
          else { const z = ZONES.find((x) => x.id === zone) || ZONES[1]; panTo(z.cx, z.cy, false); }
        }
        let drag = null;
        st.addEventListener("pointerdown", (e) => {
          if (window.innerWidth > 760 || e.pointerType === "touch" || e.target.closest("button")) return;
          drag = { x: e.clientX, y: e.clientY, sl: st.scrollLeft, st: st.scrollTop };
          st.setPointerCapture(e.pointerId);
        });
        st.addEventListener("pointermove", (e) => {
          if (!drag) return;
          st.scrollLeft = drag.sl - (e.clientX - drag.x);
          st.scrollTop = drag.st - (e.clientY - drag.y);
        });
        const stopDrag = () => { drag = null; };
        st.addEventListener("pointerup", stopDrag);
        st.addEventListener("pointercancel", stopDrag);
        st.addEventListener("scroll", () => {
          if (window.innerWidth > 760) return;
          cam = { left: st.scrollLeft, top: st.scrollTop };
          const tip = $(".o-m-hint");
          if (tip) tip.classList.add("gone");
          if (Date.now() < lockZoneUntil) return;
          const mx = (st.scrollLeft + st.clientWidth / 2) / Math.max(1, st.scrollWidth);
          const my = (st.scrollTop + st.clientHeight / 2) / Math.max(1, st.scrollHeight);
          const canY = st.scrollHeight > st.clientHeight + 8;
          let best = zone, bd = 99;
          for (const z of ZONES) {
            const dist = canY ? Math.hypot(z.cx - mx, z.cy - my) : Math.abs(z.cx - mx);
            if (dist < bd) { bd = dist; best = z.id; }
          }
          if (best !== zone) {
            zone = best;
            $$(".o-m-zone").forEach((b) => b.classList.toggle("on", b.dataset.zone === zone));
          }
        }, { passive: true });
      };
      const draw = () => {
        if (tok.dead) return;
        UI.setBg(sc.bg, sc.look || "blur");
        UI.hud(sc);
        const d = done(), s = seen();
        const all = sc.people.every((p) => d.has(p.who));
        const dos = state.dossier || {};
        $("#scene").innerHTML = `
          <section class="o-rounds">
            <div class="o-map-wrap">
              <div class="o-m-hud">
                <div class="o-m-title">
                  <b>${esc(sc.title)}</b>
                  <span>${all ? "Все опрошены — пора написать Сове" : esc(val(sc.goal, state))}</span>
                </div>
                <div class="o-m-pills">
                  <span class="o-m-pill ${all ? "done" : ""}">👥 ${d.size}/${sc.people.length}</span>
                  ${finds.length ? `<span class="o-m-pill clue ${s.size === finds.length ? "done" : ""}">🔍 ${s.size}/${finds.length}</span>` : ""}
                </div>
              </div>
              <div class="o-map-stage"><div class="o-map">
                ${OfficeMap.svg()}
                ${(!d.size && !s.size) ? `<div class="o-map-tip">👆 Нажми на персонажа, чтобы поговорить, или на бирюзовую метку — найти улику</div>` : ""}
                ${finds.map((f) => { const p = OfficeMap.pct(f.at); return `<button class="o-hot ${s.has(f.id) ? "seen" : ""}" data-find="${f.id}" style="left:${p.x}%;top:${p.y}%" title="${esc(f.title)}">${f.ico}<span class="o-hot-lbl">${esc(f.title)}</span></button>`; }).join("")}
                ${sc.people.map((p) => OfficeMap.token(p.at, p.who, { label: PEOPLE[p.who].name, cls: d.has(p.who) ? "done" : "live", act: d.has(p.who) ? "" : "talk" })).join("")}
                <div class="o-tok me" style="left:${mePos.x}%;top:${mePos.y}%">${avatar("you", "o-tok-face")}<span class="o-tok-label">Вы</span></div>
              </div></div>
              ${(!d.size && !s.size) ? `<div class="o-m-hint">👆 Листай офис пальцем или прыгай по зонам</div>` : ""}
              ${all ? `<div class="o-m-cta"><button class="btn primary wide" data-act="finish">Написать Сове →</button></div>` : ""}
              <nav class="o-m-dock" aria-label="Зоны офиса">
                ${ZONES.map((z) => {
                  const st = zoneState(z, d, s);
                  return `<button type="button" class="o-m-zone ${zone === z.id ? "on" : ""} st-${st}" data-zone="${z.id}">
                    <i>${z.ico}</i><span>${z.name}</span><em aria-hidden="true"></em>
                  </button>`;
                }).join("")}
              </nav>
            </div>
            <aside class="o-panel">
              <div class="o-m-head">
                <p class="kicker">Опен-спейс · ${d.size} из ${sc.people.length}</p>
                <h2>${esc(sc.title)}</h2>
                <p class="muted">${esc(val(sc.goal, state))}</p>
              </div>
              <div class="o-people">${sc.people.map((p) => {
                const x = dos[p.who] || {};
                return `<button class="o-person ${d.has(p.who) ? "done" : ""}" data-act="talk" data-who="${p.who}" ${d.has(p.who) ? "disabled" : ""}>
                  ${avatar(p.who, "sm")}
                  <div><b>${esc(PEOPLE[p.who].name)}</b><span>${esc(d.has(p.who) ? [x.role, x.thursday].filter(Boolean).join(" · ") || "поговорили" : p.lead)}</span></div>
                  <i>${d.has(p.who) ? "✓" : "→"}</i></button>`;
              }).join("")}</div>
              ${finds.length ? `<div class="o-findbar"><div class="o-findbar-head"><span>Бонус · осмотр офиса</span><b>${s.size} из ${finds.length}</b></div><div class="o-findbar-list">${finds.map((f) => `<button type="button" class="o-find-btn ${s.has(f.id) ? "on" : ""}" data-find="${f.id}" title="${esc(f.title)}"><i>${f.ico}</i><span>${esc(f.title)}</span><em>${s.has(f.id) ? "✓" : "+XP"}</em></button>`).join("")}</div><small>Можно нажать здесь или на бирюзовую метку на карте — внутри улики и бонусный опыт.</small></div>` : ""}
              <button class="btn primary wide" data-act="finish" ${all ? "" : "disabled"}>${all ? "Написать Сове" : "Сначала со всеми"}</button>
              <p class="muted small">Досье и легенда — в блокноте (N).</p>
            </aside>
          </section>`;
        bindPan();
      };
      // Фишка игрока идёт к цели, и только потом открывается разговор или находка.
      const walk = async (at, dx = 7, dy = 5) => {
        const p = OfficeMap.pct(at);
        mePos = { x: clamp(p.x + dx, 5, 95), y: clamp(p.y + dy, 8, 94) };
        panTo(p.x / 100, p.y / 100, true);
        const me = $(".o-tok.me");
        if (me) { me.style.left = mePos.x + "%"; me.style.top = mePos.y + "%"; }
        Sound.sfx("tick");
        await sleep(window.innerWidth <= 760 ? 520 : 740);
      };
      const openFind = (f) => new Promise((res) => {
        const opts = shuffle(f.opts.map((t, i) => ({ t, ok: i === 0 })));
        const el = document.createElement("div");
        el.className = "o-find";
        el.innerHTML = `<div class="o-find-card"><h3>${f.ico} ${esc(f.title)}</h3>
          <div class="o-paper ${f.kind || ""}">${enHTML(f.text)}</div>
          <p class="o-find-q">${esc(f.q)}</p>
          <div class="o-find-opts">${opts.map((o, i) => `<button data-i="${i}">${esc(o.t)}</button>`).join("")}</div>
          <p class="muted small">Любое слово можно нажать — покажу перевод.</p></div>`;
        $(".o-rounds").appendChild(el);
        Sound.sfx("whoosh");
        el.addEventListener("click", (e) => {
          const b = e.target.closest("[data-i]");
          if (!b || b.disabled) return;
          const o = opts[Number(b.dataset.i)];
          $$("[data-i]", el).forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add("right"); });
          if (o.ok) { Sound.sfx("ok"); Juice.xp(8, b, "прочитано"); }
          else { b.classList.add("wrong"); Sound.sfx("wrong"); Juice.xp(2, b); }
          setTimeout(() => { el.remove(); res(o.ok); }, o.ok ? 1000 : 1900);
        });
      });
      const onClick = async (e) => {
        if (busy || tok.dead) return;
        const zb = e.target.closest("[data-zone]");
        if (zb) {
          const z = ZONES.find((x) => x.id === zb.dataset.zone);
          if (z) {
            zone = z.id;
            lockZoneUntil = Date.now() + 750;
            $$(".o-m-zone").forEach((b) => b.classList.toggle("on", b.dataset.zone === zone));
            const tip = $(".o-m-hint");
            if (tip) tip.classList.add("gone");
            Sound.sfx("click");
            panTo(z.cx, z.cy, true);
          }
          return;
        }
        const hot = e.target.closest("[data-find]");
        if (hot) {
          const f = finds.find((x) => x.id === hot.dataset.find);
          if (!f) return;
          busy = true;
          await walk(f.at, 5, 6);
          if (tok.dead) return;
          await openFind(f);
          if (tok.dead) return;
          const first = !seen().has(f.id);
          state.flags[fkey] = [...new Set([...seen(), f.id])];
          Store.save();
          busy = false;
          draw();
          if (first && f.clue) Clues.add(f.clue);
          if (first && seen().size === finds.length) Juice.badge("explorer");
          return;
        }
        const a = e.target.closest("[data-act]");
        if (!a) return;
        if (a.dataset.act === "finish") {
          if (!sc.people.every((p) => done().has(p.who))) return;
          $("#scene").removeEventListener("click", onClick);
          return resolve();
        }
        const person = sc.people.find((p) => p.who === a.dataset.who);
        if (!person || done().has(person.who)) return;
        busy = true;
        Sound.sfx("click");
        await walk(person.at);
        if (tok.dead) return;
        const conv = { ...person.conv, id: sc.id + "-" + person.who, mission: sc.mission, time: sc.time, bg: sc.bg, look: sc.look, goal: person.conv.goal || val(sc.goal, state) };
        UI.hud({ ...sc, place: person.conv.place || sc.place });
        const res = await Conv.run(conv, tok);
        PTT.unbind();
        busy = false;
        if (tok.dead) return;
        if (res && res.fail) { $("#scene").removeEventListener("click", onClick); return resolve(res); }
        state.flags[key] = [...done(), person.who];
        Store.save();
        draw();
        for (const x of person.conv.after || []) {
          if (x.see) UI.caption(x.see, "", 5200);
          if (x.clue) Clues.add(x.clue);
        }
      };
      $("#scene").addEventListener("click", onClick);
      Game.onLeave(() => $("#scene").removeEventListener("click", onClick));
      draw();
    });
  }
};

// ───────── подслушивание ─────────
const Eaves = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const lv = level();
      const E = { sc, tok, lv, resolve, spot: sc.spots[0], attn: 0, moving: false, paused: false, running: false,
        talking: false, stats: { full: 0, part: 0, miss: 0, caught: 0, catches: 0 }, noticed: 0, heardLast: 0, torn: false, reply: null };
      this.mount(E);
      Game.onLeave(() => this.teardown(E));
    });
  },

  mount(E) {
    const sc = E.sc;
    const tp = OfficeMap.pct(sc.targetAt, sc.plan);
    $("#scene").innerHTML = `
      <section class="o-eaves">
        <div class="o-map-wrap"><div class="o-map">
          ${OfficeMap.svg(sc.plan)}
          <div class="o-waves" style="left:${tp.x}%;top:${tp.y}%"><i></i><i></i><i></i></div>
          ${OfficeMap.token(sc.targetAt, sc.target, { label: PEOPLE[sc.target].name, cls: "target", plan: sc.plan })}
          ${sc.spots.map((s, i) => { const p = OfficeMap.pct(s.at, sc.plan); return `<button class="o-spot d-${s.dist}" data-spot="${i}" style="left:${p.x}%;top:${p.y}%"><span>${esc(s.label)}</span></button>`; }).join("")}
          <div class="o-me" style="left:${OfficeMap.pct(sc.spots[0].at, sc.plan).x}%;top:${OfficeMap.pct(sc.spots[0].at, sc.plan).y}%">${TOON() ? avatar("you", "o-tok-face") : "<i></i>"}</div>
        </div></div>
        <aside class="o-panel">
          <p class="kicker">${esc(sc.time)} · ${esc(sc.place)}</p>
          <h2>${esc(sc.title)}</h2>
          <div class="o-eye"><span class="o-eye-ico">${TOON() ? "👁" : ICON.eye}</span><div class="o-eye-bar"><i></i></div><b class="o-eye-n">0</b></div>
          <div class="o-spots">${sc.spots.map((s, i) => `<button class="o-spot-row d-${s.dist}" data-spot="${i}"><b>${esc(s.label)}</b><span>${esc(s.ru)}</span></button>`).join("")}</div>
          <div class="o-subs"><span class="muted">Тихо.</span></div>
          <div class="o-catchbox"></div>
          <div class="o-heard"></div>
          <div class="o-gadgets">${Gadgets.html(["cookie", "freeze"])}</div>
          <div class="o-pretext" hidden></div>
        </aside>
        <div class="o-intro"><div class="ls-intro-card">
          <p class="kicker">${esc(sc.time)} · ${esc(sc.place)}</p>
          <h2>${esc(sc.title)}</h2>
          <p>${esc(val(sc.intro, state))}</p>
          <div class="keys"><span>Ближе — слышно лучше</span><span>Глаз — насколько ты на виду</span><span>Заметят — назови повод</span><span>${TOON() ? "🎯 Лови ключевые слова" : "После реплики — какое слово прозвучало"}</span></div>
          <button class="btn primary" data-act="start">Начать</button>
        </div></div>
      </section>`;
    E.el = $(".o-eaves");
    this.markSpot(E);
    E.el.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (a && a.dataset.act === "start") return this.start(E);
      if (a && a.dataset.act === "next") { this.teardown(E); return E.resolve(); }
      const g = e.target.closest("[data-gadget]");
      if (g && E.running) return this.gadget(E, g.dataset.gadget);
      const s = e.target.closest("[data-spot]");
      if (s && E.running) this.move(E, Number(s.dataset.spot));
    });
  },

  // «Печенье» отвлекает всех от тебя, «Иней» остужает засветку.
  gadget(E, id) {
    if (id === "cookie") {
      if (E.attn < 8) return UI.toast("На тебя и так никто не смотрит.", "info");
      if (!Gadgets.use("cookie")) return;
      E.attn = 0;
      E.noticeNow = false;
      Sound.sfx("pop");
      UI.toast(TOON() ? "<b>🍪 Печенье</b> Ты ставишь на стол коробку печенья. Все смотрят на печенье, а не на тебя."
        : "<b>Отвлёк(ла)</b> Ты роняешь велосипедный замок. Все смотрят на звук, а не на тебя.", "ok", 4200);
      Juice.float("внимание сброшено", $(".o-eye", E.el), "ok");
    } else if (id === "freeze") {
      if (!(state.heat > 0)) return UI.toast(heatName() + " и так на нуле.", "info");
      if (!Gadgets.use("freeze")) return;
      Heat.add(-25);
    }
    $(".o-gadgets", E.el).innerHTML = Gadgets.html(["cookie", "freeze"]);
  },

  // После реплики — быстрый вопрос на слух: какое слово прозвучало.
  async catchWord(E, line) {
    const box = $(".o-catchbox", E.el);
    if (!box || !line.catch) return;
    const opts = shuffle(line.catch.opts.map((t, i) => ({ t, ok: i === 0 })));
    const ms = 5600;
    E.stats.catches += 1;
    box.innerHTML = `<div class="o-catch"><p>${TOON() ? "🎯 Поймай слово: " : ""}${esc(line.catch.q)}</p><div>${opts.map((o, i) => `<button data-i="${i}">${esc(o.t)}</button>`).join("")}</div><u style="animation-duration:${ms}ms"></u></div>`;
    const pick = await new Promise((r) => {
      const t = setTimeout(() => r(null), ms);
      box.onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) { clearTimeout(t); r(Number(b.dataset.i)); } };
    });
    box.onclick = null;
    if (E.torn || E.tok.dead) return;
    $$("[data-i]", box).forEach((b, i) => { b.disabled = true; if (opts[i].ok) b.classList.add("right"); else if (i === pick) b.classList.add("wrong"); });
    if (pick != null && opts[pick].ok) {
      E.stats.caught += 1;
      Juice.hit(box, { first: true, base: 6 });
      if (line.clue) Clues.add(line.clue);
    } else { Juice.miss(); Sound.sfx("wrong"); }
    await sleep(900);
    box.innerHTML = "";
  },

  markSpot(E) {
    const i = E.sc.spots.indexOf(E.spot);
    $$("[data-spot]", E.el).forEach((b) => b.classList.toggle("on", Number(b.dataset.spot) === i));
  },

  start(E) {
    $(".o-intro", E.el).innerHTML = "";
    E.running = true;
    E.timer = setInterval(() => this.tick(E), 100);
    this.loop(E);
  },

  move(E, i) {
    const to = E.sc.spots[i];
    if (E.moving || E.paused || to === E.spot) return;
    E.moving = true;
    const p = OfficeMap.pct(to.at, E.sc.plan);
    const me = $(".o-me", E.el);
    me.style.left = p.x + "%";
    me.style.top = p.y + "%";
    Sound.sfx("click");
    setTimeout(() => { E.spot = to; E.moving = false; this.markSpot(E); }, 900);
  },

  tick(E) {
    if (!E.running || Game.paused || E.paused) return;
    const s = E.spot;
    let d;
    if (s.dist === "far") d = -1.1;
    else if (E.talking) d = (s.rate || 3) * 0.1;
    else d = s.dist === "near" ? (s.rate || 6) * 0.04 : -0.25;
    E.attn = clamp(E.attn + d, 0, 100);
    const bar = $(".o-eye-bar i", E.el);
    if (bar) { bar.style.width = E.attn + "%"; bar.parentElement.parentElement.classList.toggle("hot", E.attn > 70); }
    const n = $(".o-eye-n", E.el);
    if (n) n.textContent = Math.round(E.attn);
    if (E.attn >= 100 && !E.noticeNow) E.noticeNow = true;
  },

  async wait(E, ms) {
    const end = performance.now() + ms;
    while (performance.now() < end || E.paused || Game.paused) {
      if (E.tok.dead || E.torn) return false;
      if (E.noticeNow && !E.paused) await this.notice(E);
      await sleep(80);
    }
    return true;
  },

  async loop(E) {
    const lines = E.sc.lines;
    for (let i = 0; i < lines.length; i++) {
      if (!(await this.wait(E, lines[i].gap || 3000))) return;
      let again = true;
      while (again) {
        if (E.tok.dead || E.torn) return;
        again = await this.playLine(E, lines[i]);
        if (again) await this.notice(E);
      }
      if (E.tok.dead || E.torn) return;
      if (lines[i].catch && E.heardLast > 0) await this.catchWord(E, lines[i]);
    }
    await this.wait(E, 1200);
    this.finish(E);
  },

  // Играет реплику с той слышимостью, что сейчас у точки. true — если перебили и надо повторить.
  async playLine(E, line) {
    const { sc, lv } = E;
    const dist = E.spot.dist;
    const who = line.who || sc.target;
    const words = line.text.split(/\s+/);
    let keep = words.map(() => true);
    if (dist === "half") keep = words.map(() => Math.random() < 0.5);
    else if (dist === "third") keep = words.map((_, i) => i % 3 === 2);
    else if (dist === "mid") keep = words.map(() => Math.random() > 0.45);
    else if (dist === "far") keep = words.map(() => false);
    E.talking = true;
    $(".o-waves", E.el).classList.add("on");
    $$(`.o-tok.target`, E.el).forEach((t) => t.classList.add("speaking"));
    const subs = $(".o-subs", E.el);
    const shown = words.map((w, i) => (keep[i] ? w : "…")).join(" ").replace(/(…\s*)+/g, "… ");
    if (dist === "far") subs.innerHTML = `<span class="muted"><i>…бу-бу-бу… отсюда не разобрать</i></span>`;
    else if (lv.subs === "live") subs.innerHTML = `<b>${esc(PEOPLE[who].name)}</b> ${enHTML(shown, { gaps: true })}`;
    else subs.innerHTML = `<b>${esc(PEOPLE[who].name)}</b> <span class="veil">• • •</span>`;
    let finished = false, stopBabble = null, h = null;
    if (dist === "far") {
      stopBabble = Sound.babble(words.length * 0.33 + 0.4, { level: 0.07, cutoff: 700 });
      setTimeout(() => { finished = true; }, words.length * 330 + 400);
    } else {
      const fx = dist === "near" ? "clean" : dist === "mid" ? "dock" : "wall";
      h = Voice.say(line.text, { who, fx });
      h.done.then(() => { finished = true; });
    }
    while (!finished) {
      if (E.tok.dead || E.torn) { if (h) h.stop(); if (stopBabble) stopBabble(); return false; }
      if (E.noticeNow) {
        if (h) h.stop();
        if (stopBabble) stopBabble();
        E.talking = false;
        $(".o-waves", E.el).classList.remove("on");
        return true;
      }
      await sleep(60);
    }
    E.talking = false;
    $(".o-waves", E.el).classList.remove("on");
    $$(`.o-tok.target`, E.el).forEach((t) => t.classList.remove("speaking"));
    this.record(E, line, words, keep, dist);
    return false;
  },

  record(E, line, words, keep, dist) {
    const { sc, lv } = E;
    const heard = keep.filter(Boolean).length;
    E.heardLast = heard;
    const box = $(".o-heard", E.el);
    const add = (html, cls) => { const el = document.createElement("div"); el.className = "o-heard-row " + cls; el.innerHTML = html; box.prepend(el); while (box.children.length > 6) box.lastChild.remove(); };
    if (!heard) {
      E.stats.miss += 1;
      add("Не разобрать: слишком далеко.", "miss");
      return;
    }
    if (dist === "near" && (line.nearHeat || sc.nearHeat)) Heat.add(line.nearHeat || sc.nearHeat, "слишком близко к будке");
    const full = heard === words.length;
    const text = full ? line.text : words.map((w, i) => (keep[i] ? w : "…")).join(" ").replace(/(…\s*)+/g, "… ").trim();
    if (full) E.stats.full += 1; else E.stats.part += 1;
    Notes.add({ kind: full ? "heard" : "partial", scene: sc.id, src: "talk", who: line.who || sc.target, time: sc.time, text,
      audio: text.replace(/…/g, ","), hidden: lv.subs === "live" ? false : lv.subs === "after" ? "after" : "always" });
    add(lv.subs === "live" ? enHTML(text, { gaps: true }) : (full ? "Фраза целиком — в блокноте" : "Обрывок — в блокноте"), full ? "ok" : "part");
    Sound.sfx("note");
    if (line.clue) {
      const kept = norm(words.filter((_, i) => keep[i]).join(" "));
      const ok = full || (line.need || []).every((w) => kept.split(" ").includes(norm(w)));
      if (ok) Clues.add(line.clue);
    }
  },

  async notice(E) {
    if (E.paused) return;
    E.paused = true;
    E.noticed += 1;
    const { sc, tok } = E;
    const n = sc.notice;
    Voice.stop();
    $$(`.o-tok.target`, E.el).forEach((t) => t.classList.add("looking"));
    const box = $(".o-pretext", E.el);
    box.hidden = false;
    box.innerHTML = `<div class="o-pre-head">${avatar(n.who, "sm")}<div><b>${esc(PEOPLE[n.who].name)} смотрит на тебя</b><p class="english">${enHTML(n.say)}</p></div></div>
      <p class="o-pre-hint">${level().subs === "none" ? "" : (n.hint || "Назови простую причину.")}</p><div class="o-pre-reply"></div>`;
    Sound.sfx("bad");
    await Voice.sayAsync(n.say, { who: n.who });
    if (tok.dead || E.torn) return;
    E.reply = ReplyBox($(".o-pre-reply", box), { label: "Ответить", placeholder: "повод по-английски, Enter" });
    const facts = [{ id: "why", label: "простая причина", ai: "gives a simple, innocent reason for being there (water, coffee, printer, waiting, looking for something, just passing)",
      any: n.any || ["waiting", "wait", "just", "sorry", "nothing", "looking for"] }];
    const forbid = [{ id: "caught", label: "признаться", ai: "admits listening to the phone call or asks about the call", sus: 30,
      any: ["listening", "listen", "your call", "spy", "what are you talking", "who are you talking", "eavesdrop*", "hear you", "heard you", "who was that"] }];
    let ok = false;
    for (let tries = 0; tries < 2 && !tok.dead && !E.torn; tries++) {
      const text = await raceDead(tok, E.reply.wait());
      if (tok.dead || text == null || E.torn) return;
      Phrases.detect(text);
      if (isRussian(text)) { Heat.add(6, "русский в офисе"); continue; }
      const r = await raceDead(tok, Talk.judge({ npc: n.who, persona: CAST[n.who], situation: "A colleague notices Alex standing too close during a private phone call and asks what they want." },
        { facts, bonus: [], forbid, say: n.say }, n.who, "en", text, new Set(), []));
      if (tok.dead || !r) return;
      if (r.leakHits.length) { Heat.add(30, "признался(ась), что слушает"); break; }
      if (r.facts.includes("why")) { ok = true; break; }
    }
    if (E.reply) { E.reply.destroy(); E.reply = null; }
    PTT.unbind();
    if (!ok) Heat.add(22, "подозрительно крутишься рядом");
    const line = ok ? n.good : n.bad;
    box.innerHTML = `<div class="o-pre-head">${avatar(n.who, "sm")}<div><b>${esc(PEOPLE[n.who].name)}</b><p class="english">${enHTML(line)}</p></div></div>`;
    await Voice.sayAsync(line, { who: n.who });
    box.hidden = true;
    $$(`.o-tok.target`, E.el).forEach((t) => t.classList.remove("looking"));
    E.attn = ok ? 25 : 35;
    E.noticeNow = false;
    if (!ok) {
      const desk = E.sc.spots.findIndex((s) => s.dist === "far" || s.dist === "third");
      E.paused = false;
      if (desk >= 0) this.move(E, desk);
    }
    if (Heat.over() && sc.heatFail !== false) { this.teardown(E); return E.resolve({ fail: "Тебя застукали у чужого разговора слишком явно. Легенда сгорела." }); }
    E.paused = false;
  },

  finish(E) {
    E.running = false;
    clearInterval(E.timer);
    if (E.lv.subs === "after") Notes.reveal(E.sc.id);
    Store.save();
    const s = E.stats;
    if (!E.noticed && s.full + s.part >= 3) Juice.badge("ghost");
    if (s.catches >= 3 && s.caught === s.catches) Juice.badge("ears");
    Sound.sfx("ok");
    $(".o-intro", E.el).innerHTML = `<div class="ls-intro-card">
      <p class="kicker">${esc(E.sc.place)}</p>
      <h2>${esc(E.sc.title)}: всё</h2>
      <p>${esc(val(E.sc.outro, state) || "")}</p>
      <div class="stats"><div><b>${s.full}</b><span>целиком</span></div><div><b>${s.part}</b><span>обрывками</span></div><div><b>${s.miss}</b><span>мимо</span></div><div><b>${s.caught}/${s.catches}</b><span>слов поймано</span></div></div>
      ${E.lv.subs === "after" ? '<p class="muted">Расшифровка появилась в блокноте (N).</p>' : ""}
      <button class="btn primary" data-act="next">Дальше</button>
    </div>`;
  },

  teardown(E) {
    if (E.torn) return;
    E.torn = true;
    E.running = false;
    clearInterval(E.timer);
    Voice.stop();
    if (E.reply) { E.reply.destroy(); E.reply = null; }
  }
};

// ───────── задержать разговором ─────────
const Stall = {
  run(sc, tok) {
    return new Promise(async (resolve) => {
      const lv = level();
      const ui = ConvUI.mount($("#scene"), { ...sc, ui: "face" }, lv);
      Game.onLeave(() => ui.destroy());
      const t0 = toMin(sc.clock[0]), t1 = toMin(sc.clock[1]);
      let good = 0, strikes = 0, gi = 0, ai = 0, wi = 0, pendingAsk = false, bolted = false;
      const used = new Set();
      const history = [];
      const ctx = { sc, tok, ui, lv, history, last: "", lastWho: sc.npc, st: Mission.stats(sc.mission) };
      const draw = () => {
        const mins = Math.min(t1 - t0, Math.round(((t1 - t0) * good) / sc.need));
        ui.extra(`<div class="o-stall">
          <div class="o-stall-clock"><span>Курьер</span><b>${fmtMin(t0 + mins)}</b><i>→ ${esc(sc.clock[1])}</i></div>
          <div class="o-stall-bar"><i style="width:${Math.max(6, (Math.min(good, sc.need) / sc.need) * 100)}%"></i></div>
          <div class="o-stall-pat"><span>Терпение Грейс</span>${Array.from({ length: sc.strikes }, (_, i) => `<i class="${i < sc.strikes - strikes ? "on" : ""}">💛</i>`).join("")}</div>
          ${sc.ideas ? `<div class="o-ideas">${sc.ideas.map(([ico, label, topic]) => `<span class="${used.has(topic) ? "used" : ""}">${ico} ${esc(label)}</span>`).join("")}</div>` : ""}
        </div>`);
        UI.setTime(fmtMin(t0 + mins));
      };
      draw();
      // Гаджеты: Сова шепчет тему, печенье возвращает терпение, иней остужает засветку.
      let wh = 0;
      ui.onGadget = (id) => {
        if (id === "whisper") {
          const line = (sc.whispers || [])[wh % (sc.whispers || [""]).length];
          if (!line || !Gadgets.use("whisper")) return;
          wh += 1;
          ui.sys("🎧 Сова шепчет: " + line, "ok");
          Sound.sfx("pop");
          Voice.say(line, { who: "guest", rate: 0.85, volume: 0.6 });
        } else if (id === "cookie") {
          if (!strikes) return UI.toast("Терпение Грейс и так полное.", "info");
          if (!Gadgets.use("cookie")) return;
          strikes -= 1;
          draw();
          Sound.sfx("pop");
          ui.sys(TOON() ? "🍪 Ты протягиваешь Грейс печенье. Она вздыхает и остаётся." : "Ты переводишь разговор на пустяк. Напряжение спадает.", "ok");
          ui.mood(sc.npc, "happy", 1800);
        } else if (id === "freeze") {
          if (!(state.heat > 0)) return UI.toast(heatName() + " и так на нуле.", "info");
          if (!Gadgets.use("freeze")) return;
          Heat.add(-25);
        }
        ui.gadgets();
      };
      ui.gadgets(["whisper", "cookie", "freeze"]);
      ui.hint("Говори о чём угодно: выходные, йога, чай, Лондон, кот. Задавай вопросы. Короткое «yes» её не держит.");
      await Conv.say(ctx, sc.npc, sc.open);
      const engage = { id: "engage", label: "поддержать разговор", ai: "keeps the small talk going: asks Grace a question, answers her, or makes a friendly comment of at least four words",
        test: (t) => enWords(t) >= 4 || (isQuestion(t) && enWords(t) >= 3) };
      while (!tok.dead && good < sc.need && strikes < sc.strikes) {
        const text = await raceDead(tok, ui.reply.wait());
        if (tok.dead || text == null) return;
        ui.revealAll();
        ui.playerLine(text);
        history.push({ who: "Player", text });
        Phrases.detect(text).forEach((id) => ui.phrase(id));
        if (isRussian(text)) {
          strikes += 1; draw();
          await Conv.say(ctx, sc.npc, "Sorry? What was that?");
          continue;
        }
        const rep = Repair.detect(text);
        if (rep && enWords(text) <= 5) { await Conv.say(ctx, sc.npc, ctx.last, { slow: true }); continue; }
        let r = null;
        if (AI.enabled()) {
          ui.thinking(true);
          r = await raceDead(tok, Talk.judge({ npc: sc.npc, persona: sc.persona, situation: sc.situation },
            { facts: [engage], bonus: [], forbid: [sc.forbid], say: ctx.last }, sc.npc, "en", text, new Set(), history.slice(-8)));
          ui.thinking(false);
          if (tok.dead) return;
        }
        const leak = (r && r.leakHits.length) || matchFact(text, sc.forbid);
        if (leak) {
          bolted = true;
          ui.sys("Спугнул(а): " + sc.forbid.label, "bad");
          ui.mood(sc.npc, "wow", 0);
          Heat.add(30, "спугнул(а) Грейс");
          await Conv.say(ctx, sc.npc, "...What? I— I have to go. Now.");
          break;
        }
        const n = enWords(text);
        const topic = sc.topics.find((t) => matchFact(text, t));
        let ok = r ? r.facts.includes("engage") : engage.test(text);
        if (topic && !used.has(topic.id) && n >= 2) ok = true;
        if (pendingAsk && n >= 2) ok = true;
        let line;
        if (topic && used.has(topic.id) && topic.again) { ok = false; line = topic.again; }
        else if (ok && topic && !used.has(topic.id)) { used.add(topic.id); line = topic.say; good += topic.worth || 1; }
        else if (ok) { good += 1; line = (r && r.ai && r.reply) || sc.generic[gi++ % sc.generic.length]; }
        if (!ok) { strikes += 1; line = line || sc.weak[wi++ % sc.weak.length]; Juice.miss(); Sound.sfx("awkward"); ui.mood(sc.npc, "hm", 2400); Juice.float("терпение −1", ui.anchor(), "bad"); }
        else { Juice.hit(ui.anchor(), { first: true, voice: ReplyBox.via === "voice", base: 8 }); ui.mood(sc.npc, "happy", 1800); }
        pendingAsk = false;
        draw();
        await Conv.say(ctx, sc.npc, line);
        if (ok && good < sc.need && good % 2 === 0 && !(r && r.ai)) {
          await Conv.say(ctx, sc.npc, sc.asks[ai++ % sc.asks.length]);
          pendingAsk = true;
        }
      }
      if (tok.dead) return;
      ui.reply.disable();
      ui.hint("");
      const success = !bolted && good >= sc.need;
      state.flags.stalled = success;
      if (success) {
        UI.setTime(sc.clock[1]);
        Sound.sfx("knock");
        Juice.banner("18:30", "good", "Курьер у двери");
        if (!strikes) Juice.badge("chatty");
        for (const l of sc.arrive) await Conv.say(ctx, l.who, l.text, l);
      } else {
        await Conv.say(ctx, sc.npc, sc.leave);
      }
      Store.save();
      const x = ui.extra(`<div class="o-stall done ${success ? "ok" : "bad"}">
        <b>${success ? "18:30. Курьер забрал коробку." : "Грейс ушла с коробкой."}</b>
        <button class="btn primary" data-act="next">Дальше</button></div>`);
      $("[data-act]", x).addEventListener("click", () => { ui.destroy(); resolve(); }, { once: true });
    });
  }
};
