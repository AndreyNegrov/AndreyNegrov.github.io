// Смена в кофейне: заказы на слух, разговор водителей за столиком, звонок Ремезова при Рите.

const MENU = {
  drink: [{ v: "latte", en: "latte", ru: "латте" }, { v: "cappuccino", en: "cappuccino", ru: "капучино" },
    { v: "americano", en: "americano", ru: "американо" }, { v: "tea", en: "tea", ru: "чай" },
    { v: "hot chocolate", en: "hot chocolate", ru: "какао" }],
  size: [{ v: "small", en: "small", ru: "маленький" }, { v: "medium", en: "medium", ru: "средний" }, { v: "large", en: "large", ru: "большой" }],
  milk: [{ v: "none", en: "no milk", ru: "без молока" }, { v: "milk", en: "milk", ru: "обычное" }, { v: "oat", en: "oat milk", ru: "овсяное" }],
  sugar: [{ v: 0, en: "no sugar", ru: "без сахара" }, { v: 1, en: "one sugar", ru: "одна ложка" }, { v: 2, en: "two sugars", ru: "две ложки" }],
  place: [{ v: "for here", en: "for here", ru: "в зале" }, { v: "to go", en: "to go", ru: "с собой" }]
};
const MILK_DEFAULT = { latte: "milk", cappuccino: "milk", "hot chocolate": "milk", americano: "none", tea: "none" };
const THANKS = ["Thanks!", "Perfect, thank you.", "Cheers!", "Lovely, thanks."];
const label = (field, v) => (MENU[field].find((o) => o.v === v) || {}).en;

function correction(order, cup) {
  if (cup.drink !== order.drink) return { text: `No, I asked for ${/^[aeiou]/.test(order.drink) ? "an" : "a"} ${order.drink}.`, word: order.drink };
  if (cup.size !== order.size) return { text: `Sorry, I said ${order.size}.`, word: order.size };
  if (cup.milk !== order.milk) {
    const t = order.milk === "oat" ? "With oat milk, please." : order.milk === "none" ? "No milk, please." : "With normal milk, please.";
    return { text: t, word: label("milk", order.milk) };
  }
  if (cup.sugar !== order.sugar) {
    const t = order.sugar === 0 ? "No sugar, please." : order.sugar === 1 ? "Just one sugar, please." : "Two sugars, please.";
    return { text: t, word: label("sugar", order.sugar) };
  }
  if (cup.place !== order.place) return { text: order.place === "to go" ? "It's to go, please." : "It's for here.", word: order.place };
  return null;
}

const Shift = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const lv = level();
      const S = { sc, tok, lv, resolve, cup: {}, atTable: false, good: 0, left: 0, tips: 0, customer: null,
        onCall: false, tableBusy: 0, queue: Promise.resolve(), hints: lv.hints };
      this.mount(S);
      Game.onLeave(() => this.teardown(S));
      $(".sh-intro", S.el).innerHTML = `
        <div class="ls-intro-card">
          <p class="kicker">${esc(sc.clock[0])} · ${esc(sc.place)}</p>
          <h2>${esc(sc.title)}</h2>
          <p>${esc(sc.intro)}</p>
          <button class="btn primary" data-act="start">Открыть смену</button>
        </div>`;
    });
  },

  async loop(S) {
    const { sc, tok } = S;
    S.timer = setInterval(() => this.tick(S), 100);
    const start = toMin(sc.clock[0]), end = toMin(sc.clock[1]);
    for (let i = 0; i < sc.customers.length; i++) {
      if (tok.dead) return;
      UI.setTime(fmtMin(start + (end - start) * (i / sc.customers.length)));
      await this.serveCustomer(S, sc.customers[i]);
      if (tok.dead) return;
      if ((state.sus.rita || 0) >= sc.failAt) {
        await this.speak(S, "You know what? This isn't working. Go home.", { who: "rita" });
        this.teardown(S);
        return S.resolve({ fail: "Рита уволила вас после первой же смены. Место Льва потеряно." });
      }
      sc.table.filter((t) => t.after === i + 1).forEach((t) => this.tableTalk(S, t));
      if (sc.call && sc.call.after === i + 1) await this.call(S);
      await sleep(1400);
    }
    while (S.tableBusy > 0 && !tok.dead) await sleep(200);
    if (tok.dead) return;
    UI.setTime(sc.clock[1]);
    this.setCustomer(S, null);
    const good = S.good >= sc.customers.length - 1 && !S.left;
    $(".order-txt", S.el).innerHTML = "";
    await this.speak(S, good ? sc.end.good : sc.end.bad, { who: "rita" });
    if (good) addSus("rita", -10);
    if (S.lv.subs === "after") Notes.reveal(sc.id);
    $(".sh-intro", S.el).innerHTML = `
      <div class="ls-intro-card">
        <p class="kicker">${esc(sc.clock[1])}</p>
        <h2>Смена окончена</h2>
        <div class="stats"><div><b>${S.good}/${sc.customers.length}</b><span>заказов верно</span></div><div><b>$${S.tips}</b><span>чаевые</span></div><div><b>${S.left}</b><span>ушли без кофе</span></div></div>
        <button class="btn primary" data-act="next">Домой, к окну</button>
      </div>`;
  },

  speak(S, text, opts) {
    const p = S.queue.then(() => (S.tok.dead ? null : Voice.sayAsync(text, opts)));
    S.queue = p.catch(() => {});
    return p;
  },

  mount(S) {
    const lv = S.lv;
    const row = (field, title) => `
      <div class="opt-row" data-f="${field}"><span class="opt-title">${title}</span>
        ${MENU[field].map((o) => `<button class="chip" data-f="${field}" data-v="${o.v}">${esc(o.en)}${lv.subs === "live" ? `<small>${esc(o.ru)}</small>` : ""}</button>`).join("")}
      </div>`;
    $("#scene").innerHTML = `
      <section class="shift">
        <div class="sh-left">
          <div class="sh-customer"><div class="cust-ava"></div><div class="cust-id"><b>Пока никого</b><span></span></div></div>
          <div class="patience"><i></i></div>
          <div class="sh-order"><div class="order-txt"></div>
            <button class="btn ghost small" data-act="sorry">Sorry? <small>переспросить</small></button></div>
        </div>
        <div class="sh-counter">
          <h3>Стойка</h3>
          ${row("drink", "Напиток")}${row("size", "Размер")}${row("milk", "Молоко")}${row("sugar", "Сахар")}${row("place", "Где")}
          <div class="cup-preview"></div>
          <button class="btn primary wide" data-act="serve">Отдать заказ</button>
          <div class="counter-veil">Вы у четвёртого столика. Очередь ждёт.</div>
        </div>
        <div class="sh-right">
          <div class="table4"><h4>Столик 4</h4><p class="t4-who">пусто</p><div class="t4-subs"></div>
            <button class="btn ghost small" data-act="table">Протереть столик 4</button></div>
          <div class="sh-score"><div><b class="sc-good">0</b><span>заказов</span></div><div><b class="sc-tips">$0</b><span>чаевые</span></div></div>
        </div>
        <div class="sh-intro"></div>
      </section>`;
    S.el = $(".shift");
    S.el.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (chip) return this.pick(S, chip.dataset.f, chip.dataset.v);
      const a = e.target.closest("[data-act]");
      if (!a) return;
      const act = a.dataset.act;
      if (act === "start") { $(".sh-intro", S.el).innerHTML = ""; this.loop(S); }
      else if (act === "serve") this.serve(S);
      else if (act === "sorry") this.sorry(S);
      else if (act === "table") this.toggleTable(S);
      else if (act === "reveal") this.reveal(S);
      else if (act === "next") { this.teardown(S); S.resolve(); }
    });
    this.resetCup(S);
  },

  resetCup(S) {
    S.cup = { drink: null, size: null, milk: null, sugar: 0, place: null };
    this.renderCup(S);
  },
  pick(S, field, raw) {
    if (S.atTable || !S.customer) return;
    const v = field === "sugar" ? Number(raw) : raw;
    S.cup[field] = v;
    if (field === "drink") S.cup.milk = MILK_DEFAULT[v];
    Sound.sfx("click");
    this.renderCup(S);
  },
  renderCup(S) {
    const c = S.cup;
    $$(".chip", S.el).forEach((ch) => {
      const f = ch.dataset.f;
      const v = f === "sugar" ? Number(ch.dataset.v) : ch.dataset.v;
      ch.classList.toggle("on", c[f] === v);
    });
    const parts = [c.size, c.drink].filter(Boolean).join(" ");
    const extra = c.drink ? [label("milk", c.milk), label("sugar", c.sugar), c.place].filter(Boolean).join(", ") : "";
    $(".cup-preview", S.el).innerHTML = c.drink ? `<b>${esc(parts)}</b>${extra ? ", " + esc(extra) : ""}` : '<span class="muted">Стакан пустой</span>';
  },

  setCustomer(S, c) {
    const ava = $(".cust-ava", S.el), id = $(".cust-id", S.el);
    if (!c) { ava.innerHTML = ""; $("b", id).textContent = "Пока никого"; $("span", id).textContent = ""; return; }
    const who = c.who || "guest";
    const knownOwen = who === "owen" && state.flags.askedDrivers;
    ava.innerHTML = c.who ? avatar(who, "lg") : `<div class="ava ava-letter lg">${esc(c.name[0])}</div>`;
    $("b", id).textContent = who === "owen" ? (knownOwen ? "Owen" : "Driver in a Northline jacket") : c.name;
    $("span", id).textContent = c.ru;
    if (knownOwen) UI.toast("Это Оуэн. Рита говорила: он всегда берёт большой американо.", "info");
  },

  async serveCustomer(S, c) {
    S.customer = { c, patience: 1, listening: false, done: false, revealed: false };
    this.resetCup(S);
    this.setCustomer(S, c);
    this.renderOrder(S);
    Sound.sfx("note");
    await this.speak(S, c.line, { who: c.who || "guest", voice: c.voice });
    if (!S.customer) return;
    S.customer.listening = true;
    return new Promise((res) => { S.customer.resolve = res; });
  },
  renderOrder(S) {
    const box = $(".order-txt", S.el);
    const cu = S.customer;
    if (!cu) { box.innerHTML = ""; return; }
    if (S.lv.subs === "live" || cu.revealed) box.innerHTML = `<p class="order-line">${enHTML(cu.c.line)}</p>`;
    else box.innerHTML = `<p class="order-line veil">• • •</p>` +
      (S.hints > 0 ? `<button class="mini" data-act="reveal">Текст · ${S.hints}</button>` : "");
  },
  reveal(S) {
    if (!S.customer || S.hints <= 0) return;
    S.hints -= 1;
    S.customer.revealed = true;
    this.renderOrder(S);
  },
  sorry(S) {
    const cu = S.customer;
    if (!cu || cu.done || S.atTable) return;
    if (S.lv.subs !== "live") cu.patience -= 0.15;
    this.speak(S, cu.c.line, { who: cu.c.who || "guest", voice: cu.c.voice, rate: 0.85 });
  },

  serve(S) {
    const cu = S.customer;
    if (!cu || cu.done || S.atTable) return;
    const c = S.cup;
    if (!c.drink || !c.size || !c.place) return UI.toast("Соберите заказ: напиток, размер и где пьют.", "info");
    const fix = correction(cu.c.order, c);
    if (fix) {
      cu.patience -= 0.2;
      Sound.sfx("bad");
      Words.miss([fix.word]);
      this.speak(S, fix.text, { who: cu.c.who || "guest", voice: cu.c.voice });
      return;
    }
    cu.done = true;
    S.good += 1;
    const tip = cu.patience > 0.6 ? 2 : 1;
    S.tips += tip;
    Sound.sfx("serve");
    Sound.sfx("coin");
    $(".sc-good", S.el).textContent = String(S.good);
    $(".sc-tips", S.el).textContent = "$" + S.tips;
    cu.revealed = true;
    this.renderOrder(S);
    this.speak(S, THANKS[Math.floor(Math.random() * THANKS.length)], { who: cu.c.who || "guest", voice: cu.c.voice });
    this.finishCustomer(S);
  },
  finishCustomer(S) {
    const cu = S.customer;
    S.customer = null;
    this.setCustomer(S, null);
    $(".patience i", S.el).style.width = "0%";
    if (cu && cu.resolve) cu.resolve();
  },
  tick(S) {
    const cu = S.customer;
    if (!cu || cu.done || !cu.listening || S.onCall || Game.paused) return;
    cu.patience -= (0.1 / S.lv.patience) * (S.atTable ? 2.5 : 1);
    const bar = $(".patience i", S.el);
    bar.style.width = Math.max(0, cu.patience * 100) + "%";
    bar.className = cu.patience < 0.3 ? "low" : "";
    if (cu.patience <= 0) {
      cu.done = true;
      S.left += 1;
      this.speak(S, "Forget it. I'm late.", { who: cu.c.who || "guest", voice: cu.c.voice });
      addSus("rita", 6, "гость ушёл без кофе");
      this.finishCustomer(S);
    }
  },

  toggleTable(S, force) {
    S.atTable = force ?? !S.atTable;
    S.el.classList.toggle("at-table", S.atTable);
    $('[data-act="table"]', S.el).textContent = S.atTable ? "Вернуться за стойку" : "Протереть столик 4";
    Sound.sfx("click");
  },
  async tableTalk(S, t) {
    S.tableBusy += 1;
    const card = $(".table4", S.el);
    const subs = $(".t4-subs", S.el);
    $(".t4-who", S.el).textContent = state.flags.askedDrivers ? "Owen и Danny, Northline" : "двое в куртках Northline";
    UI.caption(t.see);
    card.classList.add("talking");
    await sleep(2600);
    for (const l of t.lines) {
      if (S.tok.dead) return;
      await S.queue;
      const clear = S.atTable;
      const words = l.text.split(/\s+/);
      const keep = words.map(() => clear || Math.random() < 0.4);
      const heard = words.map((w, i) => (keep[i] ? w : "…")).join(" ").replace(/(…\s*)+/g, "… ").trim();
      const spoken = words.filter((_, i) => keep[i]).join(" ");
      const show = S.lv.subs === "live" ? enHTML(heard, { gaps: true }) : '<span class="veil">• • •</span>';
      subs.innerHTML = `<p><b>${esc(PEOPLE[l.who].name)}:</b> ${show}</p>`;
      if (spoken) await this.speak(S, spoken, { who: l.who, fx: clear ? "clean" : "table" });
      else await sleep(1600);
      Notes.add({ kind: clear ? "heard" : "partial", src: "table", scene: S.sc.id, who: l.who, time: $("#hud-time").textContent,
        text: clear ? l.text : heard, audio: spoken, fx: clear ? "clean" : "table",
        hidden: S.lv.subs === "live" ? false : S.lv.subs === "after" ? "after" : "always" });
      Sound.sfx("note");
    }
    card.classList.remove("talking");
    subs.innerHTML = "";
    S.tableBusy -= 1;
    if (S.atTable) this.toggleTable(S, false);
  },

  async call(S) {
    const c = S.sc.call;
    while (S.customer && !S.tok.dead) await sleep(200);
    S.onCall = true;
    if (S.atTable) this.toggleTable(S, false);
    const overlay = document.createElement("div");
    overlay.className = "phone";
    overlay.innerHTML = `
      <div class="phone-card ringing">
        ${avatar("remezov", "lg")}<b>${esc(c.contact)}</b><span>входящий вызов</span>
        <div class="row"><button class="btn danger" data-ph="no">Сбросить</button><button class="btn primary" data-ph="yes">Ответить</button></div>
      </div>`;
    S.el.appendChild(overlay);
    Sound.sfx("phone");
    S.ring = setInterval(() => Sound.sfx("phone"), 2200);
    const ans = await new Promise((r) => overlay.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ph]");
      if (b) r(b.dataset.ph);
    }));
    clearInterval(S.ring);
    if (ans === "no") {
      overlay.remove();
      S.onCall = false;
      UI.toast("Ремезов не стал перезванивать.", "info");
      return;
    }
    overlay.innerHTML = '<div class="phone-call"></div><button class="btn ghost phone-hang" data-ph="hang" type="button">Положить трубку</button>';
    const abort = { dead: false };
    const tok = { get dead() { return S.tok.dead || abort.dead; } };
    overlay.addEventListener("click", (e) => {
      if (!e.target.closest('[data-ph="hang"]')) return;
      abort.dead = true;
      Voice.stop();
    });
    try {
      await Talk.run({ ...c, id: S.sc.id + "-call", sus: null }, tok, { host: $(".phone-call", overlay), embedded: true });
    } finally {
      overlay.remove();
      S.onCall = false;
    }
  },

  teardown(S) {
    clearInterval(S.timer);
    clearInterval(S.ring);
    Voice.stop();
  }
};
