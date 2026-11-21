// Подслушивание в реальном времени: часы идут, события звучат из разных источников, внимание одно.

const MODES = {
  window: { key: "1", label: "У окна", icon: "window" },
  wall: { key: "2", label: "Стена", icon: "wall" },
  scanner: { key: "3", label: "Сканер", icon: "scanner" },
  scope: { key: "4", label: "Бинокль", icon: "scope" }
};
const SRC_TOOL = { wall: "wall", dock: "window", radio: "scanner" };
function modeMeta(sc, m) {
  const extra = (sc.tools && sc.tools[m]) || {};
  return { key: MODES[m].key, label: extra.label || MODES[m].label, icon: extra.icon || MODES[m].icon };
}
const MISSED = {
  wall: "По стояку говорили, а микрофон был не прижат.",
  dock: "Во дворе разговаривали. Не разобрали.",
  radio: "Рация что-то передала мимо вас."
};
const MUFFLED = {
  wall: "по трубе идёт голос… прижмите микрофон",
  dock: "во дворе голоса… откройте окно и встаньте у окна",
  radio: "в эфире шум… подстройте частоту"
};

const Listen = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const lv = level();
      const L = {
        sc, tok, lv, resolve,
        mode: sc.start || sc.modes[0], windowOpen: false, talking: false,
        now: toMin(sc.clock[0]), end: toMin(sc.clock[1]), running: false,
        recorder: lv.recorder, hints: lv.hints, lastNote: null, nextId: 1,
        freq: sc.radio ? sc.radio.min + 3 : 0, target: sc.radio ? sc.radio.freq : 0,
        events: sc.events.filter((e) => !e.when || e.when(state)).map((e) => ({ ...e, at: toMin(e.t), started: false })),
        active: [], queue: { wall: [], dock: [], radio: [] }, pendingSee: [],
        stats: { full: 0, part: 0, miss: 0 }, seenSpots: new Set(), scopeView: null, finished: false, torn: false
      };
      if (sc.live) L.live = { got: new Set(), traps: new Set(), closed: false, deadline: toMin(val(sc.live.deadline, state)), history: [] };
      this.mount(L);
      UI.setTime(fmtMin(L.now));
      UI.onReplay = (n) => this.spendRecorder(L, n);
      Game.onLeave(() => this.teardown(L));
      this.intro(L);
    });
  },

  mount(L) {
    const sc = L.sc;
    const tools = sc.modes.map((m) => {
      const meta = modeMeta(sc, m);
      return `<button class="ls-tool" data-mode="${m}"><span class="kbd">${meta.key}</span>${ICON[meta.icon]}<b>${meta.label}</b><i class="ping"></i></button>`;
    }).join("");
    const r = sc.radio;
    $("#scene").innerHTML = `
      <section class="listen">
        <div class="ls-feed"></div>
        <div class="ls-subs"></div>
        ${r ? `<div class="ls-scanner" hidden>
          <div class="scan-top"><b class="scan-freq">000.00</b><span>МГц</span><span class="scan-lock">канал</span></div>
          <div class="scan-dial"><input type="range" min="${r.min}" max="${r.max}" step="0.05" value="${L.freq}">
            ${state.flags.knowsFreq ? `<i class="scan-mark" style="left:${((r.freq - r.min) / (r.max - r.min)) * 100}%"><span>${esc((L.sc.radio && L.sc.radio.mark) || "скотч Льва")}</span></i>` : ""}</div>
          <div class="scan-meter">${"<i></i>".repeat(6)}</div>
          <small>Мышь, колесо или стрелки ← →. С Shift — крупнее шаг.</small>
        </div>` : ""}
        ${sc.live ? `<div class="ls-live">
          <div class="live-head">${avatar("remezov", "sm")}<div><b>Ремезов на связи</b><span>${esc(val(sc.live.note, state) || ("группа входит в " + val(sc.live.deadline, state)))}</span></div></div>
          <ul class="live-facts">${sc.live.facts.map((f) => `<li data-f="${f.id}">${esc(f.label)}</li>`).join("")}</ul>
          <div class="live-last">Докладывайте, как только узнаете.</div>
          <div class="live-reply"></div>
        </div>` : ""}
        <div class="ls-bar">
          <div class="ls-tools">${tools}</div>
          <div class="ls-extra">
            ${sc.modes.includes("window") ? `<button class="ls-tool ls-win" data-act="window"><span class="kbd">O</span>${ICON.window}<b>Открыть окно</b></button>` : ""}
            ${L.recorder !== false ? `<button class="ls-tool" data-act="rec"><span class="kbd">R</span>${ICON.rec}<b>Диктофон <em class="rec-n"></em></b></button>` : ""}
          </div>
        </div>
        <div class="ls-scope" hidden></div>
        <div class="ls-intro"></div>
      </section>`;
    L.el = $(".listen");
    this.recLabel(L);
    if (sc.darkWarehouse) UI.warehouseDark(true);

    L.el.addEventListener("click", (e) => {
      const m = e.target.closest("[data-mode]");
      if (m) return this.setMode(L, m.dataset.mode);
      const sv = e.target.closest("[data-scope]");
      if (sv) { L.scopeView = sv.dataset.scope; return this.openScope(L); }
      const sp = e.target.closest("[data-spot]");
      if (sp) return this.lookAt(L, sp.dataset.spot);
      const a = e.target.closest("[data-act]");
      if (!a) return;
      const act = a.dataset.act;
      if (act === "start") this.start(L);
      else if (act === "window") this.toggleWindow(L);
      else if (act === "rec") this.recorderPlay(L);
      else if (act === "reveal") this.revealSub(L, Number(a.dataset.line));
      else if (act === "next") this.done(L);
    });
    if (r) {
      const range = $(".scan-dial input", L.el);
      range.addEventListener("input", () => this.tune(L, Number(range.value)));
      $(".ls-scanner", L.el).addEventListener("wheel", (e) => {
        e.preventDefault();
        this.tune(L, L.freq + (e.deltaY < 0 ? 0.05 : -0.05) * (e.shiftKey ? 10 : 1));
      }, { passive: false });
    }
    L.keys = (e) => {
      const a = document.activeElement;
      if (!L.running || (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA")) || !$("#modal").hidden) return;
      const k = e.key.toLowerCase();
      const mode = Object.keys(MODES).find((m) => MODES[m].key === e.key);
      if (mode) this.setMode(L, mode);
      else if (k === "o" || k === "щ") this.toggleWindow(L);
      else if ((k === "r" || k === "к") && L.recorder !== false) this.recorderPlay(L);
      else if (L.mode === "scanner" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        this.tune(L, L.freq + (e.key === "ArrowRight" ? 0.05 : -0.05) * (e.shiftKey ? 10 : 1));
      }
    };
    window.addEventListener("keydown", L.keys);
  },

  intro(L) {
    const sc = L.sc;
    const keys = sc.modes.map((m) => { const meta = modeMeta(sc, m); return `<span><kbd>${meta.key}</kbd> ${meta.label}</span>`; }).join("") +
      (sc.modes.includes("window") ? "<span><kbd>O</kbd> открыть окно</span>" : "") +
      (L.recorder !== false ? "<span><kbd>R</kbd> диктофон</span>" : "") +
      "<span><kbd>N</kbd> блокнот</span>" +
      (sc.live ? "<span><kbd>Пробел</kbd> рация Ремезову</span>" : "");
    $(".ls-intro", L.el).innerHTML = `
      <div class="ls-intro-card">
        <p class="kicker">${esc(sc.clock[0])} · ${esc(sc.place)}</p>
        <h2>${esc(sc.title)}</h2>
        <p>${esc(val(sc.intro, state))}</p>
        <div class="keys">${keys}</div>
        <button class="btn primary" data-act="start">Начать</button>
      </div>`;
  },

  start(L) {
    $(".ls-intro", L.el).innerHTML = "";
    if (L.sc.darkWarehouse) UI.warehouseDark(true);
    L.running = true;
    this.setMode(L, L.mode, true);
    if (L.sc.live) this.setupLive(L);
    L.timer = setInterval(() => this.tick(L), 100);
  },

  tick(L) {
    if (!L.running || Game.paused) return;
    L.now += 0.1 / L.sc.pace;
    UI.setTime(fmtMin(Math.min(L.now, L.end)));
    for (const ev of L.events) if (!ev.started && ev.at <= L.now) this.fire(L, ev);
    const t = performance.now();
    for (const line of [...L.active]) if (!line.handle && t >= line.endAt) this.finishLine(L, line);
    for (const ev of [...L.pendingSee]) {
      if (L.mode === "window" || L.mode === "scope") { L.pendingSee.splice(L.pendingSee.indexOf(ev), 1); this.showSee(L, ev); }
      else if (L.now >= ev.expires) { L.pendingSee.splice(L.pendingSee.indexOf(ev), 1); this.feed(L, "Вы не видели, что было за окном.", "miss"); }
    }
    if (L.scopeView && L.mode === "scope") this.refreshSpots(L);
    if (L.live && !L.live.closed && L.now >= L.live.deadline) this.closeLive(L);
    const busy = L.active.length || Object.values(L.queue).some((q) => q.length);
    if (L.now >= L.end && !busy && L.events.every((e) => e.started)) this.finish(L);
  },

  fire(L, ev) {
    ev.started = true;
    if (ev.src === "cue") {
      Sound.sfx(ev.cue);
      this.pulse(L, ev.for, true, 2600);
      if (ev.cue === "car" || ev.cue === "engine") UI.sceneFx("headlights");
      if (ev.text) this.feed(L, ev.text, "cue");
      return;
    }
    if (ev.src === "see") return this.see(L, ev);
    if (ev.src === "risk") return this.risk(L, ev);
    if (L.active.some((l) => l.ev.src === ev.src)) { L.queue[ev.src].push(ev); return; }
    this.startLine(L, ev);
  },

  // ───── реплики ─────
  startLine(L, ev) {
    const words = ev.text.split(/\s+/);
    const speed = L.lv.rate * Settings.get().speed * ((PEOPLE[ev.who] && PEOPLE[ev.who].voice.rate) || 1);
    const line = { id: L.nextId++, ev, words, heard: words.map(() => false), t0: performance.now(),
      dur: words.length * 400 / speed + 600, handle: null, seg: null, stopBabble: null, state: null, revealed: false };
    line.endAt = line.t0 + line.dur;
    L.active.push(line);
    if (ev.src === "wall") UI.fxOn("door", true);
    this.pulse(L, SRC_TOOL[ev.src], true);
    this.assess(L, line);
  },

  hear(L, src) {
    if (L.talking) return src === "radio" ? "none" : "muffled";
    if (src === "wall") return L.mode === "wall" ? "clear" : "muffled";
    if (src === "dock") {
      const atWindow = L.mode === "window" || L.mode === "scope";
      if (L.windowOpen) return atWindow ? "clear" : "muffled";
      return atWindow ? "faint" : "none";
    }
    if (src === "radio") {
      if (L.mode !== "scanner") return "none";
      const d = Math.abs(L.freq - L.target), tol = L.lv.tune;
      return d <= tol ? "clear" : d <= tol * 3 ? "near" : "static";
    }
    return "none";
  },

  assess(L, line) {
    if (line.finished) return;
    const st = this.hear(L, line.ev.src);
    if (st === line.state) return;
    if (line.handle) this.stopPlay(line);
    if (line.stopBabble) { line.stopBabble(); line.stopBabble = null; }
    line.state = st;
    const idx = Math.floor(clamp((performance.now() - line.t0) / line.dur, 0, 1) * line.words.length);
    if (idx < line.words.length) {
      if (st === "clear" || st === "near") this.play(L, line, idx, st);
      else if (st === "muffled" || st === "faint") {
        const busy = L.active.some((l) => l !== line && (l.state === "clear" || l.state === "near"));
        if (!busy) {
          const left = Math.max(0.4, (line.endAt - performance.now()) / 1000);
          line.stopBabble = Sound.babble(left, {
            level: st === "faint" ? 0.035 : line.ev.src === "wall" ? 0.16 : 0.1,
            cutoff: line.ev.src === "wall" ? 420 : 900
          });
        }
      }
    }
    if (line.ev.src === "radio") this.updateScanner(L);
    this.renderSubs(L);
  },

  play(L, line, a, st) {
    const seg = line.words.slice(a);
    const keep = seg.map(() => st === "clear" || Math.random() > 0.45);
    const spoken = seg.filter((_, i) => keep[i]).join(" ");
    line.seg = { a, keep, n: seg.length };
    if (!spoken) return;
    const fx = { wall: "wall", radio: "radio", dock: "dock" }[line.ev.src];
    const h = Voice.say(spoken, { who: line.ev.who, fx });
    line.handle = h;
    h.done.then((natural) => {
      if (line.handle !== h) return;
      line.handle = null;
      if (natural) {
        for (let i = 0; i < seg.length; i++) if (keep[i]) line.heard[a + i] = true;
        this.finishLine(L, line);
      }
    });
  },

  stopPlay(line) {
    const h = line.handle;
    line.handle = null;
    const p = h.progress();
    h.stop();
    const { a, keep } = line.seg;
    const spokenIdx = keep.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
    const upto = Math.floor(p * spokenIdx.length);
    spokenIdx.slice(0, upto).forEach((i) => { line.heard[a + i] = true; });
    const pos = a + (upto ? spokenIdx[upto - 1] + 1 : 0);
    line.t0 = performance.now() - (pos / line.words.length) * line.dur;
    line.endAt = line.t0 + line.dur;
  },

  finishLine(L, line) {
    if (line.finished) return;
    if (line.handle) this.stopPlay(line);
    line.finished = true;
    if (line.stopBabble) line.stopBabble();
    L.active = L.active.filter((l) => l !== line);
    const src = line.ev.src;
    if (!L.active.some((l) => l.ev.src === src)) {
      this.pulse(L, SRC_TOOL[src], false);
      if (src === "wall") UI.fxOn("door", false);
    }
    const n = line.words.length;
    const h = line.heard.filter(Boolean).length;
    if (!h) {
      L.stats.miss += 1;
      this.feed(L, MISSED[src], "miss");
    } else {
      const full = h === n;
      const text = full ? line.ev.text
        : line.words.map((w, i) => (line.heard[i] ? w : "…")).join(" ").replace(/(…\s*)+/g, "… ").trim();
      if (full) L.stats.full += 1; else L.stats.part += 1;
      L.lastNote = Notes.add({
        kind: full ? "heard" : "partial", scene: L.sc.id, src, who: line.ev.who, time: fmtMin(L.now), text,
        audio: text.replace(/…/g, ","), fx: { wall: "wall", radio: "radio", dock: "dock" }[src],
        hidden: L.lv.subs === "live" ? false : L.lv.subs === "after" ? "after" : "always"
      });
      if (line.ev.flag && h / n > 0.6) state.flags[line.ev.flag] = true;
      this.feed(L, `${PEOPLE[line.ev.who].name}: ${full ? "в блокноте" : "обрывок в блокноте"}`, full ? "ok" : "part");
      Sound.sfx("note");
    }
    if (src === "radio") this.drift(L);
    this.renderSubs(L);
    const next = L.queue[src].shift();
    if (next) this.startLine(L, next);
  },

  drift(L) {
    const r = L.sc.radio;
    const step = (0.5 + Math.random() * 0.6) * (Math.random() < 0.5 ? -1 : 1);
    L.target = clamp(L.target + step, r.min + 1, r.max - 1);
    this.updateScanner(L);
  },

  renderSubs(L) {
    const box = $(".ls-subs", L.el);
    if (!box) return;
    box.innerHTML = L.active.map((line) => {
      const st = line.state;
      const who = PEOPLE[line.ev.who];
      const src = SRC_LABEL[line.ev.src];
      if ((st === "clear" || st === "near") && line.seg) {
        let body;
        if (L.lv.subs === "live" || line.revealed) {
          const { a, keep } = line.seg;
          const shown = line.words.map((w, i) => (i < a ? (line.heard[i] ? w : "…") : keep[i - a] ? w : "…"))
            .join(" ").replace(/(…\s*)+/g, "… ");
          body = enHTML(shown, { gaps: true });
        } else {
          body = `<span class="veil">• • •</span>` +
            (L.hints > 0 ? `<button class="mini" data-act="reveal" data-line="${line.id}">Текст · ${L.hints}</button>` : "");
        }
        return `<div class="sub clear"><span class="sub-who">${esc(who.name)} · ${esc(src)}</span><div class="sub-txt">${body}</div></div>`;
      }
      return `<div class="sub dim"><span class="sub-who">${esc(src)}</span><div class="sub-txt"><i>${MUFFLED[line.ev.src]}</i></div></div>`;
    }).join("");
  },
  revealSub(L, id) {
    const line = L.active.find((l) => l.id === id);
    if (!line || L.hints <= 0) return;
    L.hints -= 1;
    line.revealed = true;
    this.renderSubs(L);
  },

  // ───── что видно ─────
  see(L, ev) {
    if (ev.always || L.mode === "window" || L.mode === "scope") return this.showSee(L, ev);
    ev.expires = L.now + (ev.span || 4);
    L.pendingSee.push(ev);
    this.pulse(L, "window", true, 2600);
    this.feed(L, "За окном что-то происходит.", "cue");
  },
  showSee(L, ev) {
    UI.caption(ev.text);
    if (ev.fx) UI.sceneFx(ev.fx);
    if (ev.flag) state.flags[ev.flag] = true;
    Notes.add({ kind: "seen", src: "see", scene: L.sc.id, time: fmtMin(L.now), text: ev.text });
    Sound.sfx("note");
  },
  risk(L, ev) {
    if (L.windowOpen) {
      if (ev.flag) state.flags[ev.flag] = true;
      UI.caption(ev.text, "bad", 6000);
      addSus(ev.who, ev.sus, "окно открыто после десяти");
    } else {
      UI.caption(ev.safe, "ok");
    }
  },

  // ───── инструменты ─────
  setMode(L, m, force = false) {
    if (!L.sc.modes.includes(m) || (L.mode === m && !force)) return;
    L.mode = m;
    $$(".ls-tool[data-mode]", L.el).forEach((b) => b.classList.toggle("on", b.dataset.mode === m));
    const scan = $(".ls-scanner", L.el);
    if (scan) scan.hidden = m !== "scanner";
    if (m === "scanner") { Sound.staticOn(); this.updateScanner(L); } else Sound.staticOff();
    if (m === "scope") this.openScope(L); else this.closeScope(L);
    if (!force) Sound.sfx("click");
    L.active.forEach((line) => this.assess(L, line));
    this.renderSubs(L);
  },
  toggleWindow(L) {
    if (!L.sc.modes.includes("window")) return;
    L.windowOpen = !L.windowOpen;
    Sound.setWindow(L.windowOpen);
    Sound.sfx("window");
    UI.fxOn("open", L.windowOpen);
    const b = $(".ls-win", L.el);
    if (b) { b.classList.toggle("on", L.windowOpen); $("b", b).textContent = L.windowOpen ? "Закрыть окно" : "Открыть окно"; }
    if (L.windowOpen && L.now >= toMin("22:00")) this.feed(L, "Окно открыто. По правилу Хелен после десяти нельзя.", "warn");
    L.active.forEach((line) => this.assess(L, line));
  },
  tune(L, f) {
    const r = L.sc.radio;
    L.freq = clamp(Math.round(f * 20) / 20, r.min, r.max);
    const range = $(".scan-dial input", L.el);
    if (range && Number(range.value) !== L.freq) range.value = L.freq;
    this.updateScanner(L);
    L.active.filter((l) => l.ev.src === "radio").forEach((l) => this.assess(L, l));
  },
  updateScanner(L) {
    if (!L.sc.radio) return;
    const panel = $(".ls-scanner", L.el);
    const d = Math.abs(L.freq - L.target), tol = L.lv.tune;
    const sig = clamp(1 - d / (tol * 8), 0, 1);
    $(".scan-freq", panel).textContent = L.freq.toFixed(2);
    $$(".scan-meter i", panel).forEach((b, i) => b.classList.toggle("on", sig * 6 > i + 0.2));
    $(".scan-lock", panel).classList.toggle("on", d <= tol);
    if (L.mode === "scanner") Sound.staticLevel(d <= tol ? 0.025 : 0.035 + (1 - sig) * 0.13);
  },
  pulse(L, tool, on, ms = 0) {
    const b = $(`.ls-tool[data-mode="${tool}"]`, L.el);
    if (!b) return;
    b.classList.toggle("ping-on", on);
    if (ms) setTimeout(() => {
      const busy = L.active.some((l) => SRC_TOOL[l.ev.src] === tool);
      if (!busy) b.classList.remove("ping-on");
    }, ms);
  },
  feed(L, text, kind = "") {
    const box = $(".ls-feed", L.el);
    if (!box) return;
    const el = document.createElement("div");
    el.className = "feed " + kind;
    el.innerHTML = `<time>${fmtMin(L.now)}</time>${esc(text)}`;
    box.prepend(el);
    while (box.children.length > 5) box.lastChild.remove();
  },

  recLabel(L) {
    const el = $(".rec-n", L.el);
    if (el) el.textContent = L.recorder === Infinity ? "∞" : String(L.recorder);
  },
  spendRecorder(L, note) {
    if (L.finished) return true;
    if (L.recorder === false) return true;
    if (L.active.some((l) => l.handle)) { UI.toast("Сейчас идёт разговор. Диктофон подождёт.", "info"); return false; }
    if (L.recorder <= 0) { UI.toast("Память диктофона кончилась.", "bad"); return false; }
    if (L.recorder !== Infinity) L.recorder -= 1;
    this.recLabel(L);
    return true;
  },
  recorderPlay(L) {
    const n = L.lastNote;
    if (!n) return UI.toast("Пока нечего прослушать.", "info");
    if (this.spendRecorder(L, n)) Voice.say(n.audio || n.text, { who: n.who, fx: n.fx });
  },

  // ───── бинокль ─────
  openScope(L) {
    const views = L.sc.scopes;
    const box = $(".ls-scope", L.el);
    if (!views || !box) return;
    if (!L.scopeView) L.scopeView = Object.keys(views)[0];
    const v = views[L.scopeView];
    box.hidden = false;
    box.innerHTML = `
      <div class="scope-img"><img class="look-${v.look}" src="${v.img}" alt="">
        ${v.spots.map((s) => spotHTML(s, L.seenSpots.has(s.id))).join("")}
      </div>
      <div class="scope-mask"></div>
      <div class="scope-tabs">${Object.entries(views).map(([k, x]) => `<button data-scope="${k}" class="${k === L.scopeView ? "on" : ""}">${esc(x.label)}</button>`).join("")}</div>
      <div class="scope-hint">Ведите мышью, чтобы осмотреться. Нажмите на то, что хотите рассмотреть.</div>`;
    const img = $(".scope-img", box);
    const W = Math.max(innerWidth * v.zoom, innerHeight * 1.15 * 16 / 9), H = W * 9 / 16;
    img.style.width = W + "px";
    img.style.height = H + "px";
    img.style.setProperty("--u", W / 1024 + "px");
    const place = (mx, my) => {
      const fx = v.focus[0] + (mx - 0.5) * (innerWidth / W) * 1.4;
      const fy = v.focus[1] + (my - 0.5) * (innerHeight / H) * 1.4;
      const tx = clamp(innerWidth / 2 - fx * W, innerWidth - W, 0);
      const ty = clamp(innerHeight / 2 - fy * H, innerHeight - H, 0);
      img.style.transform = `translate(${tx}px, ${ty}px)`;
    };
    place(0.5, 0.5);
    L.scopeMove = (e) => place(e.clientX / innerWidth, e.clientY / innerHeight);
    box.addEventListener("mousemove", L.scopeMove);
    this.refreshSpots(L);
  },
  closeScope(L) {
    const box = $(".ls-scope", L.el);
    if (!box) return;
    box.hidden = true;
    box.innerHTML = "";
  },
  refreshSpots(L) {
    const v = L.sc.scopes && L.sc.scopes[L.scopeView];
    if (!v) return;
    v.spots.forEach((s) => {
      const el = $(`[data-spot="${s.id}"]`, L.el);
      if (el) el.classList.toggle("off", !!s.from && L.now < toMin(s.from));
    });
  },
  lookAt(L, id) {
    const v = L.sc.scopes[L.scopeView];
    const s = v.spots.find((x) => x.id === id);
    if (!s || (s.from && L.now < toMin(s.from)) || L.seenSpots.has(id)) return;
    L.seenSpots.add(id);
    const el = $(`[data-spot="${id}"]`, L.el);
    if (el) el.classList.add("seen");
    if (s.flag) state.flags[s.flag] = true;
    Notes.add({ kind: "seen", src: "see", scene: L.sc.id, time: fmtMin(L.now), text: s.note });
    UI.caption(`${s.text}: ${s.ru}`);
    Sound.sfx("note");
  },

  // ───── живой доклад ─────
  setupLive(L) {
    L.reply = ReplyBox($(".live-reply", L.el), {
      label: "Рация", placeholder: "доклад по-английски, Enter", keepVoice: true,
      onStart: () => { L.talking = true; L.active.forEach((l) => this.assess(L, l)); },
      onEnd: () => { L.talking = false; L.active.forEach((l) => this.assess(L, l)); }
    });
    this.liveLoop(L);
  },
  async liveLoop(L) {
    const sc = L.sc;
    while (!L.live.closed && !L.tok.dead) {
      const text = await L.reply.wait();
      if (L.live.closed || L.tok.dead) return;
      const last = $(".live-last", L.el);
      last.innerHTML = `<i>Вы: ${esc(text)}</i>`;
      L.live.history.push({ who: "Player", text });
      const left = sc.live.facts.filter((f) => !L.live.got.has(f.id));
      const local = left.filter((f) => matchFact(text, f)).map((f) => f.id);
      let ids = local, reply = "";
      if (isRussian(text)) { ids = []; reply = "По-английски, Иней."; }
      else if (AI.enabled() && left.length) {
        try {
          const j = await AI.judge({ npc: { name: "Ремезов", persona: sc.live.persona }, lang: "ru", situation: sc.live.situation,
            said: "Докладывайте.", facts: left, done: [...L.live.got], bonus: [], forbid: [], history: L.live.history.slice(-6),
            weak: [], utterance: text });
          const ai = (Array.isArray(j.facts) ? j.facts : []).filter((id) => left.some((f) => f.id === id));
          ids = [...new Set([...ai, ...local])];
          reply = String(j.reply || "");
        } catch (e) { console.warn(e); }
      }
      if (L.live.closed || L.tok.dead) return;
      const wrong = (sc.live.wrong || []).find((w) => matchFact(text, w));
      const trapHits = (sc.live.traps || []).filter((t) => matchFact(text, t));
      const acks = [];
      ids.forEach((id) => {
        const f = sc.live.facts.find((x) => x.id === id);
        L.live.got.add(id);
        const li = $(`.live-facts [data-f="${id}"]`, L.el);
        if (li) li.classList.add("ok");
        acks.push(f.ack);
      });
      if (!acks.length) trapHits.forEach((t) => L.live.traps.add(t.id));
      Sound.sfx("squelch");
      const answer = acks.length ? acks.join(" ") : trapHits.length ? trapHits[0].ack : wrong ? wrong.say : reply || "Не понял. Повторите.";
      L.live.history.push({ who: "Ремезов", text: answer });
      last.innerHTML = `<b>Ремезов:</b> ${esc(answer)}`;
      if (acks.length) Sound.sfx("ok");
    }
  },
  closeLive(L) {
    if (!L.live || L.live.closed) return;
    L.live.closed = true;
    if (L.reply) L.reply.disable();
    state.live[L.sc.id] = [...L.live.got];
    state.liveTrap = state.liveTrap || {};
    state.liveTrap[L.sc.id] = [...(L.live.traps || [])];
    L.live.got.forEach((id) => { state.intel[id] = true; });
    Store.save();
    Sound.sfx("squelch");
    const last = $(".live-last", L.el);
    const deadline = val(L.sc.live.deadline, state);
    if (last) last.innerHTML = "<b>Ремезов:</b> Группа пошла. Ждите.";
    UI.caption(`${deadline}. Группа пошла.`, "", 6000);
  },

  finish(L) {
    if (L.finished) return;
    L.finished = true;
    L.running = false;
    clearInterval(L.timer);
    Sound.staticOff();
    if (L.live) this.closeLive(L);
    if (L.lv.subs === "after") Notes.reveal(L.sc.id);
    Store.save();
    const s = L.stats;
    $(".ls-intro", L.el).innerHTML = `
      <div class="ls-intro-card">
        <p class="kicker">${esc(L.sc.clock[1])}</p>
        <h2>${esc(L.sc.title)}: всё</h2>
        <div class="stats"><div><b>${s.full}</b><span>целиком</span></div><div><b>${s.part}</b><span>обрывками</span></div><div><b>${s.miss}</b><span>мимо</span></div></div>
        ${L.lv.subs === "after" ? '<p class="muted">Расшифровка появилась в блокноте.</p>' : ""}
        <button class="btn primary" data-act="next">Дальше</button>
      </div>`;
  },
  done(L) {
    this.teardown(L);
    L.resolve();
  },
  teardown(L) {
    if (L.torn) return;
    L.torn = true;
    L.running = false;
    clearInterval(L.timer);
    window.removeEventListener("keydown", L.keys);
    L.active.forEach((l) => { if (l.stopBabble) l.stopBabble(); if (l.handle) l.handle.stop(); });
    Voice.stop();
    Sound.staticOff();
    Sound.setWindow(false);
    UI.fxOn("open", false);
    UI.fxOn("door", false);
    UI.onReplay = null;
    if (L.reply) L.reply.destroy();
  }
};

function spotHTML(s, seen) {
  const style = `left:${s.x}%;top:${s.y}%;font-size:calc(var(--u) * ${s.size || 8})`;
  const inner = s.style === "guards"
    ? `<span class="fig"></span><span class="fig"></span><em>${esc(s.text)}</em>`
    : `<span>${esc(s.text)}</span>`;
  return `<button class="spot ${s.style || ""} ${seen ? "seen" : ""}" data-spot="${s.id}" style="${style}" title="Рассмотреть">${inner}</button>`;
}
