// Город, который слушается голоса: тип сцены «city».
// Игрок говорит команду — город выполняет её буквально и пишет строку в Леджер.
// Правила мира лежат в story/spoilers/bible.md (раздел 2), содержание серий — в js/halo.js.
//
// Сцена: { type: "city", zone, verbs: ["stop", …], objects: [{ id, kind, n, tag, x, y, st, mine, hidden }], plan: () => svg, beats: [...] }
// Шаг (beat): { lines, task, hint, model, free, price, trickle, secs, card, mark, goal(sim, res), reply(cmd, api), after(res, api), done(api), silence(api), auto }
//   lines — реплики перед шагом (who: "sova" говорит по-русски текстом, остальные — голосом по-английски);
//   goal  — когда шаг выполнен (по умолчанию — любая команда, которая что-то изменила);
//   reply — свой разбор сказанного (ответ человеку, а не городу): "done", "handled" или "miss";
//   free  — команда на этом шаге не оставляет следа (заскриптованный момент);
//   price — свой прирост следа вместо обычного; trickle — след копится, пока шаг не закрыт;
//   secs  — если за это время ничего не сказано, вызывается silence.

const City = (() => {
  const VERBS = {
    stop: { any: ["stop", "halt", "freeze"], group: "move", to: "stopped", done: "Stopped" },
    go: { any: ["go", "move", "start", "drive", "continue", "resume"], group: "move", to: "moving", done: "Moving" },
    open: { any: ["open"], group: "open", to: "open", done: "Open" },
    close: { any: ["close", "shut"], group: "open", to: "closed", done: "Closed" },
    call: { any: ["call", "bring"], group: "call", to: "called", done: "Calling" },
    cancel: { any: ["cancel"], group: "call", to: "idle", done: "Cancelled" },
    on: { any: [], group: "power", to: "on", done: "On" },
    off: { any: [], group: "power", to: "off", done: "Off" },
    wait: { any: ["wait"], group: "move", to: "stopped", done: "Waiting" },
    hold: { any: ["hold"], group: "move", to: "stopped", done: "Holding" },
    lock: { any: ["lock"], group: "open", to: "closed", done: "Locked" },
    unlock: { any: ["unlock"], group: "open", to: "open", done: "Unlocked" }
  };
  const LABEL = { stop: "stop", go: "go", open: "open", close: "close", call: "call", cancel: "cancel", on: "turn on", off: "turn off", wait: "wait", hold: "hold", lock: "lock", unlock: "unlock" };
  // groups — какие глаголы предмет понимает; первая группа — его основное состояние.
  const KINDS = {
    car: { any: ["car", "cars", "taxi", "taxis", "cab", "cabs", "vehicle", "vehicles"], groups: ["move", "call"], many: "cars" },
    drone: { any: ["drone", "drones"], groups: ["move"], many: "drones" },
    cart: { any: ["cart", "carts", "trolley", "trolleys"], groups: ["move"], many: "carts" },
    hoist: { any: ["hoist", "hoists"], groups: ["move"], many: "hoists" },
    door: { any: ["door", "doors"], groups: ["open"], many: "doors" },
    gate: { any: ["gate", "gates"], groups: ["open"], many: "gates" },
    hatch: { any: ["hatch", "hatches", "bay", "bays"], groups: ["open"], many: "hatches" },
    locker: { any: ["locker", "lockers", "cabinet", "cabinets"], groups: ["open"], many: "lockers" },
    bridge: { any: ["bridge", "bridges"], groups: ["open"], many: "bridges" },
    lift: { any: ["lift", "lifts", "elevator", "elevators"], groups: ["call", "move"], many: "lifts" },
    desk: { any: ["desk", "security", "office", "depot"], groups: ["call"], many: "desks" },
    phone: { any: ["phone", "phones"], groups: ["call"], many: "phones" },
    light: { any: ["light", "lights", "lamp", "lamps"], groups: ["power"], many: "lights" },
    alarm: { any: ["alarm", "alarms"], groups: ["power"], many: "alarms" },
    beacon: { any: ["beacon", "beacons"], groups: ["power"], many: "beacons" }
  };
  const START = { move: "moving", open: "closed", call: "idle", power: "off" };
  const NUM = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
    thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 };
  // Распознавание речи путает цифру с похожим словом: «door to» вместо «door two».
  const SOUNDS_LIKE = { to: 2, too: 2, for: 4, won: 1, ate: 8, tree: 3, free: 3, sex: 6 };
  const WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  const LEAD = new Set(["the", "a", "an", "hey", "halo", "ok", "okay", "just", "now", "and", "then"]);
  const SOFT = new Set(["please", "could", "can", "would", "may"]);

  const numWord = (n) => (n >= 0 && n <= 20 ? WORD[n] : String(n));
  const nameOf = (o) => o.name || `${o.tag ? o.tag + " " : ""}${o.kind}${o.n != null ? " " + numWord(o.n) : ""}`;
  const labelOf = (id) => LABEL[id] || id;

  function kindOf(tok, sc) {
    const extra = (sc && sc.kinds) || {};
    for (const k in extra) if (extra[k].includes(tok)) return k;
    for (const k in KINDS) if (KINDS[k].any.includes(tok)) return k;
    return null;
  }

  // Двухсловные глаголы ищутся раньше однословных: «stop calling» — это cancel, не stop.
  function takeVerb(toks) {
    const s = toks.join(" ");
    if (/^stop calling\b/.test(s)) return { id: "cancel", skip: new Set([0, 1]), at: 0 };
    if (/^hang up\b/.test(s)) return { id: "cancel", skip: new Set([0, 1]), at: 0 };
    if (/^end\b/.test(s) && /\bcalls?\b/.test(s)) {
      const skip = new Set();
      toks.forEach((w, i) => { if (["end", "the", "this", "call", "calls"].includes(w)) skip.add(i); });
      return { id: "cancel", skip, at: 0 };
    }
    if (/^(turn|switch) on\b/.test(s)) return { id: "on", skip: new Set([0, 1]), at: 0 };
    if (/^(turn|switch) off\b/.test(s)) return { id: "off", skip: new Set([0, 1]), at: 0 };
    if ((toks[0] === "turn" || toks[0] === "switch") && toks.includes("on")) return { id: "on", skip: new Set([0, toks.indexOf("on")]), at: 0 };
    if ((toks[0] === "turn" || toks[0] === "switch") && toks.includes("off")) return { id: "off", skip: new Set([0, toks.indexOf("off")]), at: 0 };
    const at = toks.findIndex((w) => Object.keys(VERBS).some((k) => VERBS[k].any.includes(w)));
    if (at < 0) return null;
    const id = Object.keys(VERBS).find((k) => VERBS[k].any.includes(toks[at]));
    return { id, skip: new Set([at]), at };
  }

  // Разбор сказанного. Команда — повелительное предложение: глагол стоит первым.
  // please / could / can / would в начале делают фразу просьбой, не командой.
  function parse(text, sc) {
    const raw = String(text || "").trim();
    const out = { raw, t: norm(raw) };
    if (!out.t) { out.empty = true; return out; }
    if (isRussian(raw)) { out.russian = true; return out; }
    const toks = out.t.split(" ");
    out.question = isQuestion(raw);
    if (SOFT.has(toks[0])) out.polite = true;
    let lead = 0;
    while (lead < toks.length - 1 && LEAD.has(toks[lead])) lead += 1;
    const hit = takeVerb(toks.slice(lead));
    const skip = new Set();
    if (hit) {
      out.verb = hit.id;
      hit.skip.forEach((i) => skip.add(i + lead));
      if (hit.at > 0) out.statement = true;
    }
    const tags = new Set((sc && sc.objects || []).map((o) => o.tag).filter(Boolean));
    for (let i = 0; i < toks.length; i++) {
      if (skip.has(i)) continue;
      const w = toks[i];
      if (LEAD.has(w) || SOFT.has(w)) continue;
      const k = kindOf(w, sc);
      if (k && !out.kind) {
        out.kind = k;
        const nx = toks[i + 1];
        if (nx && out.n == null && SOUNDS_LIKE[nx] != null && !/^\d+$/.test(nx) && NUM[nx] == null) out.n = SOUNDS_LIKE[nx];
        continue;
      }
      if (!out.tag && tags.has(w)) { out.tag = w; continue; }
      if (out.n == null && /^\d+$/.test(w)) out.n = Number(w);
      else if (out.n == null && NUM[w] != null) out.n = NUM[w];
      else if (w === "all" || w === "every" || w === "everything" || w === "everyone") out.all = true;
      else if (w === "this" || w === "my") out.mine = true;
    }
    const names = (sc && sc.names) || {};
    for (const id in names) if (names[id].some((p) => hasPhrase(out.t, p))) out.name = id;
    return out;
  }

  function isOrder(cmd) {
    return !!(cmd && cmd.verb && !cmd.empty && !cmd.russian && !cmd.question && !cmd.statement && !cmd.polite);
  }

  function prep(list) {
    return (list || []).map((o) => {
      const groups = (KINDS[o.kind] || { groups: ["open"] }).groups;
      const st = {};
      groups.forEach((g, i) => {
        if (o.st && typeof o.st === "object") st[g] = o.st[g] || START[g];
        else st[g] = i === 0 && o.st ? o.st : START[g];
      });
      return { ...o, st };
    });
  }

  // Кого касается команда. Предмет не назван — все предметы зоны, которые понимают этот глагол.
  function targets(cmd, sim) {
    const g = VERBS[cmd.verb].group;
    let list = sim.objects.filter((o) => !o.hidden && o.st[g] !== undefined);
    if (cmd.name) return list.filter((o) => o.id === cmd.name);
    if (cmd.kind) list = list.filter((o) => o.kind === cmd.kind);
    if (cmd.tag) list = list.filter((o) => o.tag === cmd.tag);
    if (cmd.n != null) list = list.filter((o) => o.n === cmd.n);
    if (cmd.mine) list = list.filter((o) => o.mine);
    return list;
  }
  function apply(cmd, sim) {
    const v = VERBS[cmd.verb];
    const hit = targets(cmd, sim);
    const changed = hit.filter((o) => o.st[v.group] !== v.to && !o.fixed);
    changed.forEach((o) => { o.st[v.group] = v.to; });
    sim.turn += 1;
    const onlyOne = cmd.kind && sim.objects.filter((o) => o.kind === cmd.kind && !o.hidden).length === 1;
    const exact = cmd.n != null || cmd.mine || !!cmd.name || !!cmd.tag || onlyOne;
    return { cmd, verb: cmd.verb, hit, changed, exact };
  }
  function report(res) {
    const v = VERBS[res.verb];
    if (!res.hit.length) return res.cmd.kind ? `There is no such ${res.cmd.kind} here.` : `Nothing to ${labelOf(res.verb)} here.`;
    if (!res.changed.length) return res.hit.length === 1 ? `${cap(nameOf(res.hit[0]))} is already ${v.to}.` : "Already done.";
    if (res.verb === "cancel") return res.changed.length === 1 ? `Cancelled. ${cap(nameOf(res.changed[0]))}.` : `Cancelled. ${cap(numWord(res.changed.length))} calls.`;
    if (res.changed.length === 1) return res.verb === "call" ? `Calling ${nameOf(res.changed[0])}.` : `${cap(nameOf(res.changed[0]))}: ${v.to}.`;
    const kinds = [...new Set(res.changed.map((o) => o.kind))];
    const what = kinds.length === 1 ? (KINDS[kinds[0]] || {}).many || kinds[0] + "s" : "objects";
    return `${v.done}. ${cap(numWord(res.changed.length))} ${what}.`;
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  // Точная команда — одна строка. Широкая — все предметы, которые она задела, даже если часть уже была в нужном состоянии.
  function traceOf(res) {
    if (!res.changed.length) return 0;
    const n = res.exact ? res.changed.length : res.hit.length;
    if (n <= 1) return res.exact ? 3 : 8;
    if (n <= 8) return 15;
    return 20;
  }

  function glyph(o) {
    const lab = o.n != null || o.name || o.tag ? `<text class="cy-lbl" y="${o.kind === "door" || o.kind === "locker" ? 52 : o.kind === "lift" ? 50 : 40}">${esc(nameOf(o))}</text>` : "";
    const states = Object.values(o.st).map((s) => "st-" + s).join(" ");
    const cls = `cy-obj k-${o.kind} ${o.tag ? "tag-" + o.tag : ""} ${states} ${o.mine ? "mine" : ""}`;
    const at = `transform="translate(${o.x} ${o.y}) rotate(${o.r || 0})"`;
    let body = "";
    if (o.kind === "car") body = `<g class="cy-move"><rect x="-27" y="-14" width="54" height="28" rx="10" class="cy-body"/><rect x="-4" y="-10" width="17" height="20" rx="5" class="cy-glass"/><circle cx="24" cy="-8" r="3" class="cy-lamp"/><circle cx="24" cy="8" r="3" class="cy-lamp"/><rect x="-27" y="-9" width="3" height="18" rx="1.5" class="cy-brake"/></g>`;
    else if (o.kind === "drone") body = `<g class="cy-move"><path d="M-11 -11L11 11M-11 11L11 -11" class="cy-arm"/><circle r="6" class="cy-body"/><circle cx="-11" cy="-11" r="5" class="cy-rotor"/><circle cx="11" cy="-11" r="5" class="cy-rotor"/><circle cx="-11" cy="11" r="5" class="cy-rotor"/><circle cx="11" cy="11" r="5" class="cy-rotor"/></g>`;
    else if (o.kind === "cart" || o.kind === "hoist") body = `<g class="cy-move"><rect x="-22" y="-12" width="44" height="24" rx="5" class="cy-body"/><circle cx="-13" cy="13" r="4" class="cy-lamp"/><circle cx="13" cy="13" r="4" class="cy-lamp"/></g>`;
    else if (o.kind === "door") body = `<rect x="-24" y="-36" width="48" height="72" rx="5" class="cy-frame"/><rect x="-20" y="-32" width="40" height="64" rx="3" class="cy-opening"/><rect x="-20" y="-32" width="40" height="64" rx="3" class="cy-leaf"/><text class="cy-num" y="8">${o.n != null ? o.n : ""}</text>`;
    else if (o.kind === "locker") body = `<rect x="-16" y="-26" width="32" height="52" rx="3" class="cy-frame"/><rect x="-12" y="-22" width="24" height="44" class="cy-leaf"/><circle cx="6" cy="0" r="2.5" class="cy-lamp"/>`;
    else if (o.kind === "hatch") body = `<rect x="-22" y="-12" width="44" height="24" rx="4" class="cy-frame"/><rect x="-18" y="-8" width="36" height="16" rx="2" class="cy-leaf"/>`;
    else if (o.kind === "gate") body = `<rect x="-90" y="-14" width="180" height="28" rx="6" class="cy-frame"/><rect x="-86" y="-10" width="86" height="20" rx="3" class="cy-leaf gl"/><rect x="0" y="-10" width="86" height="20" rx="3" class="cy-leaf gr"/>`;
    else if (o.kind === "bridge") body = `<rect x="-70" y="-10" width="68" height="20" rx="3" class="cy-leaf gl"/><rect x="2" y="-10" width="68" height="20" rx="3" class="cy-leaf gr"/>`;
    else if (o.kind === "lift") body = `<rect x="-30" y="-30" width="60" height="60" rx="8" class="cy-frame"/><path d="M-9 4L0 -8L9 4M-9 12L0 0L9 12" class="cy-arrow"/><text class="cy-num" y="-12">${o.n != null ? o.n : ""}</text>`;
    else if (o.kind === "light") body = `<path d="M0 -6 V-22" class="cy-arm"/><circle cy="8" r="16" class="cy-glow"/><path d="M-10 26 h20" class="cy-arm"/>`;
    else if (o.kind === "alarm") body = `<rect x="-5" y="-24" width="10" height="12" rx="2" class="cy-body"/><path d="M-16 8 a16 16 0 0 1 32 0z" class="cy-glow"/><path d="M-20 12 h40" class="cy-arm"/>`;
    else if (o.kind === "beacon") body = `<rect x="-7" y="-8" width="14" height="48" rx="2" class="cy-frame"/><circle cy="-20" r="12" class="cy-glow"/><path d="M-24 40 h48" class="cy-arm"/>`;
    else if (o.kind === "phone") body = `<rect x="-14" y="-26" width="28" height="52" rx="8" class="cy-frame"/><rect x="-8" y="-18" width="16" height="28" rx="3" class="cy-glow"/><path d="M-6 16 h12" class="cy-arm"/>`;
    else body = `<circle r="18" class="cy-frame"/><path d="M-7 -2a7 7 0 0 1 14 0v5h-14z M-3 8h6" class="cy-arrow"/>`;
    return `<g class="${cls}" data-id="${esc(o.id)}" ${at}>${body}${lab}</g>`;
  }

  async function run(sc, tok) {
    const sim = { objects: prep(sc.objects), turn: 0, flags: {}, rows: 0 };
    const diagram = !!sc.diagram;
    const verbs = sc.verbs || ["stop", "go", "open", "close"];
    $("#scene").innerHTML = `
      <section class="cy ${diagram ? "diagram" : "plain"}">
        <div class="cy-stage">
          <div class="cy-zone"><i></i><span>${esc(sc.zone || "")}</span></div>
          <div class="cy-board" hidden></div>
          <svg class="cy-map" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet"></svg>
          <div class="cy-flash" hidden></div>
          <div class="cy-line" hidden></div>
        </div>
        <aside class="cy-side">
          <div class="cy-task"><span>${esc(sc.kicker || "Задача")}</span><b></b></div>
          <div class="cy-chat"></div>
          <p class="cy-card english" hidden></p>
          <div class="cy-halo" hidden><span>Halo</span><p class="english"></p></div>
          <ol class="cy-ledger"></ol>
          <div class="cy-verbs"><span>Твои команды</span><div>${verbs.map((v) => `<i>${esc(labelOf(v))}</i>`).join("")}</div></div>
          <p class="cy-hint" hidden></p>
          <div class="cy-reply e-reply"></div>
        </aside>
      </section>`;
    const root = $(".cy"), map = $(".cy-map", root), lineBox = $(".cy-line", root), chat = $(".cy-chat", root);
    const reply = ReplyBox($(".cy-reply", root), { label: "Сказать городу", placeholder: "команда и Enter" });
    let trickle = 0, ear = false;
    const stopTrickle = () => { if (trickle) { clearInterval(trickle); trickle = 0; } };
    const setLabel = () => reply.setLabel(ear ? "Ответить Сове" : "Сказать городу");
    const pushChat = (who, text, ru) => {
      const p = PEOPLE[who] || {};
      const mine = who === "you";
      const el = document.createElement("div");
      el.className = "cy-msg" + (mine ? " me" : "");
      el.innerHTML = `${mine ? "" : avatar(who, "sm")}<div><span>${esc(mine ? "Вы" : (p.name || who))}</span><p>${ru ? esc(text) : enHTML(text)}</p></div>`;
      chat.appendChild(el);
      chat.scrollTop = chat.scrollHeight;
    };
    Game.onLeave(() => { stopTrickle(); reply.destroy(); });

    const draw = () => {
      const board = $(".cy-board", root);
      if (!diagram) { map.innerHTML = ""; board.hidden = true; return; }
      map.innerHTML = (sc.plan ? sc.plan(sim) : "") + sim.objects.filter((o) => !o.hidden).map(glyph).join("");
      const rows = sim.objects.filter((o) => o.panel && !o.hidden);
      board.hidden = !rows.length;
      if (rows.length) board.innerHTML = rows.map((o) => {
        const g = Object.keys(o.st)[0];
        const st = o.st[g];
        const shown = o.note && st === o.noteWhen ? o.note : st;
        return `<i data-st="${esc(st)}"><b>${esc(nameOf(o))}</b><span>${esc(shown)}</span></i>`;
      }).join("");
    };
    const setTask = (t) => { $(".cy-task b", root).textContent = t || ""; UI.goal(t || ""); };
    const hint = (t) => { const h = $(".cy-hint", root); h.hidden = !t; h.innerHTML = t || ""; };
    const card = (t) => { const c = $(".cy-card", root); c.hidden = !t; c.innerHTML = t ? enHTML(t) : ""; };
    const ledger = (verb, what) => {
      const ol = $(".cy-ledger", root), li = document.createElement("li");
      li.innerHTML = `<b>ROOT</b> · ${esc(labelOf(verb).toUpperCase())} · ${esc(what)} · <u>$0.00</u>`;
      ol.prepend(li);
      while (ol.children.length > 5) ol.lastChild.remove();
    };
    const say = async (who, text, opts = {}) => {
      if (tok.dead) return;
      const p = PEOPLE[who] || {};
      const ru = who === "sova" || opts.ru || p.lang === "ru";
      if (ru) {
        ear = true;
        setLabel();
        pushChat(who, text, true);
        Sound.sfx("squelch");
        await raceDead(tok, sleep(clamp(900 + text.length * 42, 1600, 5200)));
        return;
      }
      ear = false;
      setLabel();
      lineBox.hidden = false;
      lineBox.className = `cy-line ${ru ? "ru" : ""} who-${who}`;
      lineBox.innerHTML = `${avatar(who, "sm")}<div><span>${esc(p.name || who)}</span><p class="${ru ? "" : "english"}">${ru ? esc(text) : enHTML(text)}</p></div>`;
      if (ru) { Sound.sfx("squelch"); await raceDead(tok, sleep(clamp(900 + text.length * 42, 1600, 5200))); }
      else await raceDead(tok, Voice.sayAsync(text, { who, fx: opts.fx }));
    };
    const halo = async (text, quiet) => {
      if (tok.dead) return;
      const box = $(".cy-halo", root);
      box.hidden = false;
      $("p", box).innerHTML = enHTML(text);
      root.classList.add("halo-on");
      if (!quiet) await raceDead(tok, Voice.sayAsync(text, { who: "halo" }));
      root.classList.remove("halo-on");
    };
    const api = {
      sim, sc, say, halo, hint, draw, setTask,
      sova: (text) => say("sova", text),
      obj: (id) => sim.objects.find((o) => o.id === id),
      set(id, group, st) { const o = this.obj(id); if (o) { o.st[group] = st; draw(); } },
      show(id, on = true) { const o = this.obj(id); if (o) { o.hidden = !on; draw(); } },
      flash(text, kind = "") { const f = $(".cy-flash", root); f.hidden = false; f.className = "cy-flash " + kind; f.innerHTML = text; },
      unflash() { $(".cy-flash", root).hidden = true; },
      trace(n, why) { if (n > 0) Heat.add(n, why); },
      wait: (ms) => raceDead(tok, sleep(ms)),
      zone(text) { const s = $(".cy-zone span", root); if (s && text != null) s.textContent = text; },
      state: (kind, group) => sim.objects.filter((o) => o.kind === kind && !o.hidden).map((o) => o.st[group])
    };

    map.addEventListener("click", (e) => {
      const g = e.target.closest(".cy-obj");
      const o = g && api.obj(g.dataset.id);
      if (!o || (o.n == null && !o.name && !o.tag)) return;
      Voice.say(nameOf(o), { who: "halo" });
      UI.caption(nameOf(o), "info", 1600);
    });

    draw();
    try {
      for (const beat of sc.beats) {
        if (tok.dead) return null;
        if (beat.when && !beat.when(sim, state)) continue;
        stopTrickle();
        if (beat.setup) await beat.setup(api);
        for (const l of beat.lines || []) { await say(l.who, val(l.text, state), l); if (tok.dead) return null; }
        if (beat.auto) { if (beat.done) await beat.done(api); continue; }
        setTask(val(beat.task, state));
        card(beat.card ? val(beat.card, state) : "");
        hint("");
        if (beat.trickle) {
          trickle = setInterval(() => { if (!tok.dead) api.trace(beat.trickle, "команда ещё действует"); }, 4500);
        }
        let misses = 0;
        const miss = async (text) => {
          misses += 1;
          Juice.miss();
          if (text) await halo(text);
          const owl = val(beat.hint, state);
          if (misses === 1 && owl) hint(`<b>Сова:</b> ${esc(owl)}`);
          if (misses >= 2 && beat.model) hint(`<b>Сова:</b> ${esc(owl || "Скажи так:")} <span class="english">${esc(val(beat.model, state))}</span>`);
        };
        for (;;) {
          let text;
          let silent = false;
          if (beat.secs) {
            const waited = reply.wait();
            let timer = 0;
            const gate = new Promise((r) => { timer = setTimeout(() => r("\0silent"), beat.secs * 1000); });
            text = await raceDead(tok, Promise.race([waited, gate]));
            clearTimeout(timer);
            if (text === "\0silent") { silent = true; reply.cancel(); }
          } else text = await raceDead(tok, reply.wait());
          if (tok.dead || (text == null && !silent)) return null;
          if (silent) {
            if (beat.silence) await beat.silence(api);
            if (tok.dead) return null;
            break;
          }
          if (ear) pushChat("you", text, isRussian(text));
          const cmd = parse(text, sc);
          if (cmd.empty) continue;
          if (cmd.russian) { await api.sova("Город слышит только английский. По-русски можно говорить со мной, но не с ним."); continue; }
          if (typeof Phrases !== "undefined") Phrases.detect(text);
          if (beat.reply) {
            const r = await beat.reply(cmd, api);
            if (tok.dead) return null;
            if (r === "done") break;
            if (r === "handled") continue;
            if (r === "miss") { await miss(); continue; }
          }
          if (cmd.polite) { await miss("That is a request. Requests are free. I only follow commands."); continue; }
          if (!cmd.verb) { await miss("I did not hear a command."); continue; }
          if (cmd.question) { await miss("That is a question. Questions are free. I only follow commands."); continue; }
          if (cmd.statement) { await miss("That is not a command. Start with the verb."); continue; }
          if (!verbs.includes(cmd.verb)) { await miss("I do not know that command."); continue; }
          const res = apply(cmd, sim);
          draw();
          Sound.sfx(res.changed.length ? "key" : "pop");
          if (res.changed.length) {
            sim.rows += res.changed.length;
            res.changed.slice(0, 3).forEach((o) => ledger(res.verb, nameOf(o)));
            if (res.changed.length > 3) ledger(res.verb, `+${res.changed.length - 3} more`);
            if (!beat.free && res.exact && res.changed.length === 1) UI.toast("Точное слово", "ok", 1800);
          }
          await halo(report(res));
          if (tok.dead) return null;
          if (!beat.free) {
            const price = beat.price != null ? (res.changed.length ? beat.price : 0) : traceOf(res);
            api.trace(price, res.hit.length > 1 ? `${res.hit.length} строк в Леджере` : "неточная команда");
          }
          if (beat.after) await beat.after(res, api);
          if (tok.dead) return null;
          if (sc.heatFail !== false && Heat.over()) return { fail: sc.failText || "Твой след в Леджере увидели все. Серые уже здесь." };
          const ok = beat.goal ? beat.goal(sim, res) : res.changed.length > 0;
          if (ok) {
            if (beat.mark) state.flags[beat.mark] = misses === 0 && res.exact && res.changed.length === 1;
            Juice.hit(map, { first: misses === 0, voice: ReplyBox.via === "voice" });
            break;
          }
          await miss(res.changed.length ? "" : null);
        }
        stopTrickle();
        hint("");
        card("");
        if (beat.done) await beat.done(api);
      }
      for (const l of sc.end || []) { await say(l.who, val(l.text, state), l); if (tok.dead) return null; }
      await raceDead(tok, sleep(500));
      return null;
    } finally {
      stopTrickle();
      reply.destroy();
    }
  }

  return { run, parse, isOrder, VERBS, KINDS, nameOf, numWord, labelOf };
})();
