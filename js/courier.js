// Курьерская смена сезона «Последняя миля»: карточка заказа, сверка пакета,
// навигатор, решение у двери, итог заказа и чтение документов.
// Каждый шаг — отдельная сцена, так что любой можно переиграть из паузы.

const Ord = {
  of(sc) { return ORDERS[sc.order] || null; },
  // Счётчик промахов по текущему заказу. Заводится сам, если сцену открыли не с карточки.
  cur(sc) {
    const id = String(sc.order);
    if (!state.ord || state.ord.id !== id) state.ord = { id, miss: 0 };
    return state.ord;
  },
  miss(n = 1) { if (state.ord) { state.ord.miss += n; Store.save(); } },
  money(v) { return "£" + Number(v).toFixed(2); },
  rating() {
    const s = Profile.get().stats;
    return s.rateN ? (s.rateSum / s.rateN) : 5;
  },
  // Короткая памятка о заказе для боковых панелей: кому, куда, примечание.
  strip(o) {
    return `<div class="or-strip"><div><small>Кому</small><b>${esc(o.name)}</b></div><div><small>Куда</small><b class="english">${enHTML(o.addr)}</b></div>
      <div class="or-note"><small>Delivery note</small><p class="english">${enHTML(o.note)}</p></div></div>`;
  }
};

// ───────── карточка заказа ─────────
const OrderCard = {
  run(sc) {
    return new Promise((resolve) => {
      const o = Ord.of(sc);
      const rating = Ord.rating().toFixed(1);
      $("#scene").innerHTML = `
        <section class="o-chat oc">
          <div class="o-phone app-relay">
            <header class="o-ph-head"><div class="rl-logo">R</div>
              <div class="o-ph-id"><b>Relay Courier</b><span>На линии · рейтинг ${rating}</span></div><time>${esc(sc.time || "")}</time></header>
            <div class="oc-body">
              <p class="oc-new">${o.sealed ? "Приоритетный заказ" : "Новый заказ"} · №${esc(o.id)}</p>
              <div class="oc-card ${o.sealed ? "sealed" : ""}">
                <div class="oc-row"><i>${ICON.bag}</i><div><small>Забрать</small><b class="english">${enHTML(o.from)}</b></div></div>
                <div class="oc-row"><i>${ICON.pin}</i><div><small>Доставить</small><b class="english">${enHTML(o.name)}</b><span class="english">${enHTML(o.addr)}</span></div></div>
                <ul class="oc-items english">${o.items.map((x) => `<li>${enHTML(x)}</li>`).join("")}</ul>
                <div class="oc-note"><small>Delivery note</small><p class="english">${enHTML(o.note)}</p></div>
                <div class="oc-meta"><span>${esc(o.dist)}</span><span>${Ord.money(o.pay)}</span>${o.sealed ? '<span class="oc-seal">SEALED</span>' : ""}</div>
              </div>
              ${sc.first ? '<p class="muted small">Примечание клиента важно: по нему ты решишь, что делать у двери. Любое английское слово можно нажать.</p>' : ""}
            </div>
            <div class="o-ph-foot"><button class="btn primary wide" data-act="go">Принять заказ</button></div>
          </div>
        </section>`;
      Sound.sfx("note");
      $('[data-act="go"]').addEventListener("click", () => {
        state.ord = { id: String(o.id), miss: 0 };
        Notes.add({ kind: "item", src: "item", scene: sc.id, time: sc.time || "", text: `Заказ ${o.id}: ${o.name}, ${o.addr}. ${o.note}` });
        Store.save();
        Sound.sfx("pop");
        resolve();
      }, { once: true });
    });
  }
};

// ───────── сверка пакета: заказ против чека ─────────
const BagCheck = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const o = Ord.of(sc);
      if (o) Ord.cur(sc);
      const L = sc.labels || {};
      let tries = 0, done = false;
      $("#scene").innerHTML = `
        <section class="a-game bc">
          <div class="a-card bc-card">
            <header class="a-top"><span class="a-kicker">${esc(L.kicker || "Сверка пакета · заказ " + o.id)}</span></header>
            <p class="bc-lead">${esc(L.lead || "Сверь чек на пакете с заказом. Нашёл(ла) расхождение — нажми на эту строку чека. Если всё сходится — кнопка ниже.")}</p>
            <div class="bc-cols">
              <div class="bc-paper app"><small>${esc(L.left || "Заказ в приложении")}</small><ul class="english">${(sc.app || o.items).map((x) => `<li>${enHTML(x)}</li>`).join("")}</ul></div>
              <div class="bc-paper receipt"><small>${esc(L.right || "Receipt · чек на пакете")}</small><ul class="english">${sc.receipt.map((x, i) => `<li><button data-i="${i}">${esc(x)}</button></li>`).join("")}</ul></div>
            </div>
            <p class="bc-why muted small" hidden></p>
            <div class="row"><button class="btn ghost" data-act="ok">${esc(L.ok || "Всё на месте")}</button></div>
          </div>
        </section>`;
      const root = $(".bc");
      const finish = (el) => {
        done = true;
        Juice.hit(el, { first: tries === 0, base: 8 });
        setTimeout(resolve, 900);
      };
      const wrong = (el) => {
        tries += 1;
        Ord.miss();
        Juice.miss();
        Sound.sfx("wrong");
        Juice.shake(el);
        if (tries >= 2 && sc.why) { const w = $(".bc-why", root); w.hidden = false; w.textContent = sc.why; }
      };
      root.addEventListener("click", (e) => {
        if (done || tok.dead) return;
        const line = e.target.closest("[data-i]");
        if (line) {
          if (Number(line.dataset.i) === sc.wrong) { line.classList.add("hit"); return finish(line); }
          return wrong(line);
        }
        const ok = e.target.closest('[data-act="ok"]');
        if (ok) { if (sc.wrong == null) return finish(ok); wrong(ok); }
      });
    });
  }
};

// ───────── навигатор: слушай и выбирай поворот ─────────
const Ride = {
  // Схема перекрёстка 600×600. Въезд снизу по центру.
  svg(kind, names = {}) {
    const road = (d) => `<path d="${d}" class="rd-road"/><path d="${d}" class="rd-dash"/>`;
    const block = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="rd-block"/>`;
    let s = `<rect width="600" height="600" class="rd-ground"/>`;
    if (kind === "cross") {
      s += block(20, 20, 220, 220) + block(360, 20, 220, 220) + block(20, 360, 220, 220) + block(360, 360, 220, 220);
      s += road("M300 600 V0") + road("M0 300 H600");
    } else if (kind === "l2" || kind === "r2") {
      const L = kind === "l2";
      const x0 = L ? 0 : 300, x1 = L ? 300 : 600, bx = L ? 20 : 360, ox = L ? 360 : 20;
      s += block(bx, 20, 220, 120) + block(bx, 240, 220, 100) + block(bx, 440, 220, 140) + block(ox, 20, 220, 560);
      s += road("M300 600 V0") + road(`M${x0} 390 H${x1}`) + road(`M${x0} 190 H${x1}`);
    } else if (kind === "round") {
      s += block(20, 20, 190, 190) + block(390, 20, 190, 190) + block(20, 390, 190, 190) + block(390, 390, 190, 190);
      s += road("M300 600 V400") + road("M0 300 H200") + road("M300 200 V0") + road("M400 300 H600");
      s += `<circle cx="300" cy="300" r="100" class="rd-ring"/><circle cx="300" cy="300" r="44" class="rd-island"/>`;
    } else {
      s += road("M300 600 V0");
      s += `<rect x="60" y="150" width="170" height="300" rx="12" class="rd-house"/><rect x="370" y="150" width="170" height="300" rx="12" class="rd-house"/>`;
      s += `<rect x="212" y="270" width="18" height="60" class="rd-door"/><rect x="370" y="270" width="18" height="60" class="rd-door"/>`;
    }
    s += `<circle cx="300" cy="540" r="26" class="rd-me-pulse"/><circle cx="300" cy="540" r="17" class="rd-me"/><path d="M300 529 l-8 18 l8 -4.5 l8 4.5 z" class="rd-me-arrow"/>`;
    return `<svg class="rd-svg" viewBox="0 0 600 600" aria-hidden="true">${s}</svg>`;
  },
  // Варианты ответа и место кнопки на схеме (в процентах).
  opts(kind) {
    if (kind === "cross") return [["left", "←", 18, 50], ["straight", "↑", 50, 16], ["right", "→", 82, 50]];
    if (kind === "l2") return [["first", "1-й ←", 20, 65], ["second", "2-й ←", 20, 31.5], ["straight", "↑", 50, 10]];
    if (kind === "r2") return [["first", "1-й →", 80, 65], ["second", "2-й →", 80, 31.5], ["straight", "↑", 50, 10]];
    if (kind === "round") return [["e1", "1", 14, 50], ["e2", "2", 50, 12], ["e3", "3", 86, 50]];
    return [["left", "← здесь", 24, 50], ["right", "здесь →", 76, 50]];
  },
  KEYS: {
    cross: { ArrowLeft: "left", ArrowUp: "straight", ArrowRight: "right" },
    l2: { 1: "first", 2: "second", ArrowUp: "straight" }, r2: { 1: "first", 2: "second", ArrowUp: "straight" },
    round: { 1: "e1", 2: "e2", 3: "e3" }, dest: { ArrowLeft: "left", ArrowRight: "right" }
  },

  async run(sc, tok) {
    const lv = level();
    const o = Ord.of(sc);
    if (o) Ord.cur(sc);
    const who = sc.who || "kit";
    const steps = sc.steps;
    $("#scene").innerHTML = `
      <section class="a-game rd">
        <div class="rd-map"><div class="rd-frame"><div class="rd-view"></div><div class="rd-btns"></div><div class="rd-flag" hidden></div></div></div>
        <aside class="a-card rd-side">
          <header class="a-top"><span class="a-kicker">${esc(sc.nav || "Навигатор")} · <b class="rd-n">1</b> из ${steps.length}</span><span class="a-kicker dim">${esc(PEOPLE[who].name)}</span></header>
          <div class="rd-say"><p class="english"></p><button class="btn ghost small" data-act="again">${ICON.play} Ещё раз</button></div>
          <div class="a-timer"><i></i></div>
          <div class="rd-dots">${steps.map(() => "<i></i>").join("")}</div>
          ${o ? Ord.strip(o) : ""}
          <p class="muted small rd-tip">Нажми на стрелку на схеме. Клавиши: стрелки или 1–3.</p>
        </aside>
      </section>`;
    const root = $(".rd"), view = $(".rd-view", root), btns = $(".rd-btns", root), say = $(".rd-say p", root);
    if (sc.training || !state.flags.rideIntro) {
      await Arcade.intro({ kicker: sc.nav || "Навигатор", title: o ? o.addr : (sc.title || "Маршрут"), intro: sc.intro || "Kit говорит, куда повернуть. Слушай и выбирай стрелку, пока едешь к перекрёстку. Промах — навигатор перестроит маршрут, но рейтинг это запомнит." },
        { ico: "route", keys: ["left — налево · right — направо", "straight on — прямо · second left — второй налево", "roundabout — круг · exit — съезд"], btn: sc.go || "Поехали" });
      if (tok.dead) return null;
      if (!sc.training) { state.flags.rideIntro = true; Store.save(); }
    } else await sleep(500);
    let miss = 0;
    for (let i = 0; i < steps.length; i++) {
      const ok = await this.step(sc, tok, root, steps[i], i, who, lv);
      if (tok.dead) return null;
      if (!ok) miss += 1;
      $$(".rd-dots i", root)[i].className = ok ? "ok" : "bad";
    }
    if (miss) Ord.miss(miss * 0.5);
    else if (steps.length >= 4) Juice.badge("nav");
    btns.innerHTML = "";
    say.innerHTML = enHTML("You have arrived.");
    Sound.sfx("ding");
    await raceDead(tok, Promise.race([Voice.sayAsync("You have arrived.", { who }), sleep(2500)]));
    await sleep(500);
    if (tok.dead) return null;
    if (sc.training) {
      const good = steps.length - miss;
      const act = await Arcade.result(sc, { score: good, max: steps.length, xp: good * 6, line: miss ? `Перестроений маршрута: ${miss}` : "Ни одного перестроения",
        notes: steps.map((x) => `<b class="english">${esc(x.say)}</b>`) });
      return act === "again" ? { again: true } : null;
    }
    return null;
  },

  step(sc, tok, root, st, idx, who, lv) {
    return new Promise((resolve) => {
      const view = $(".rd-view", root), btns = $(".rd-btns", root), say = $(".rd-say p", root), flag = $(".rd-flag", root);
      $(".rd-n", root).textContent = String(idx + 1);
      view.innerHTML = this.svg(st.kind, st.names);
      view.classList.remove("in"); void view.offsetWidth; view.classList.add("in");
      flag.hidden = true;
      const list = this.opts(st.kind);
      const names = st.names || {};
      btns.innerHTML = list.map(([id, label, x, y]) => `<button class="rd-opt" data-id="${id}" style="left:${x}%;top:${y}%"><b>${esc(label)}</b>${names[id] ? `<span>${esc(names[id])}</span>` : ""}</button>`).join("");
      const showText = (on) => { say.innerHTML = on ? enHTML(st.say) : '<span class="veil">• • •</span>'; };
      showText(lv.subs === "live");
      let done = false, timer = null;
      const keys = this.KEYS[st.kind] || {};
      const cleanup = () => { window.removeEventListener("keydown", onKey); if (timer) timer.stop(); root.onclick = null; };
      const pick = async (id) => {
        if (done || tok.dead) return;
        done = true;
        cleanup();
        Voice.stop();
        showText(true);
        const ok = id === st.right;
        $$(".rd-opt", btns).forEach((b) => { b.disabled = true; b.classList.add(b.dataset.id === st.right ? "right" : b.dataset.id === id ? "wrong" : "dim"); });
        if (ok) {
          Juice.hit($(`.rd-opt[data-id="${id}"]`, btns), { first: true, base: 4 });
          await sleep(650);
        } else {
          Juice.miss();
          Sound.sfx("wrong");
          flag.hidden = false;
          flag.textContent = id == null ? "Проехал(а) поворот. Rerouting…" : "Не туда. Rerouting…";
          await raceDead(tok, Promise.race([Voice.sayAsync("Rerouting.", { who }), sleep(1600)]));
          await sleep(900);
        }
        resolve(ok);
      };
      const onKey = (e) => {
        if (Game.paused || !$("#modal").hidden) return;
        if (keys[e.key]) { e.preventDefault(); pick(keys[e.key]); }
      };
      window.addEventListener("keydown", onKey);
      root.onclick = (e) => {
        if (e.target.closest('[data-act="again"]')) return Voice.say(st.say, { who, rate: 0.8 });
        const b = e.target.closest(".rd-opt");
        if (b) pick(b.dataset.id);
      };
      Game.onLeave(() => { done = true; cleanup(); });
      Voice.sayAsync(st.say, { who }).then(() => {
        if (done || tok.dead) return;
        timer = Arcade.timer($(".a-timer i", root), (sc.secs || 9) * (lv.subs === "live" ? 1.3 : lv.subs === "none" ? 0.85 : 1), () => pick(null));
      });
    });
  }
};

// ───────── у двери: что делаешь? ─────────
const Drop = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const o = Ord.of(sc);
      if (o) Ord.cur(sc);
      const C = sc.card || {};
      let busy = false;
      $("#scene").innerHTML = `
        <section class="a-game dp">
          <div class="a-card dp-card">
            <header class="a-top"><span class="a-kicker">${esc(C.kicker || "На месте · заказ " + o.id)}</span></header>
            <h2 class="english">${enHTML(C.title || o.addr)}</h2>
            ${o ? Ord.strip(o) : C.note ? `<div class="or-strip"><div class="or-note"><small>${esc(C.noteLabel || "Note")}</small><p class="english">${enHTML(C.note)}</p></div></div>` : ""}
            <p class="dp-q">Что делаешь?</p>
            <div class="dp-opts">${sc.opts.map((x, i) => `<button class="dp-opt" data-i="${i}">${esc(x.ru)}</button>`).join("")}</div>
            <p class="dp-why" hidden></p>
          </div>
        </section>`;
      const root = $(".dp");
      root.addEventListener("click", async (e) => {
        const b = e.target.closest(".dp-opt");
        if (!b || b.disabled || busy || tok.dead) return;
        const x = sc.opts[Number(b.dataset.i)];
        if (x.ok) {
          busy = true;
          b.classList.add("right");
          Juice.hit(b, { first: !$(".dp-opt.wrong", root), base: 6 });
          setTimeout(resolve, 800);
          return;
        }
        busy = true;
        b.classList.add("wrong");
        b.disabled = true;
        Ord.miss();
        Juice.miss();
        Sound.sfx("wrong");
        const why = $(".dp-why", root);
        why.hidden = false;
        why.innerHTML = (x.bad ? `<b class="english">${enHTML(x.bad)}</b>` : "") + esc(x.why || "Перечитай примечание клиента.");
        if (x.bad) await raceDead(tok, Promise.race([Voice.sayAsync(x.bad, { who: x.who || "guest" }), sleep(3500)]));
        busy = false;
      });
    });
  }
};

// ───────── итог заказа ─────────
const Rate = {
  run(sc) {
    return new Promise((resolve) => {
      const o = Ord.of(sc);
      const ord = Ord.cur(sc);
      const miss = Math.round(ord.miss * 2) / 2;
      const stars = clamp(Math.round(5 - miss), 1, 5);
      const tip = stars >= 4 ? (sc.tip || 0) : 0;
      const m = sc.mission;
      state.shift = state.shift || {};
      const sh = state.shift[m] || (state.shift[m] = { orders: 0, miss: 0, tips: 0, earn: 0 });
      sh.orders += 1; sh.miss += miss; sh.tips += tip; sh.earn += o.pay + tip;
      const P = Profile.get().stats;
      P.rateSum = (P.rateSum || 0) + stars; P.rateN = (P.rateN || 0) + 1; P.orders = (P.orders || 0) + 1;
      Profile.save();
      state.ord = null;
      Store.save();
      const verdict = stars === 5 ? "Без единого замечания" : stars === 4 ? "Клиент доволен" : stars === 3 ? "Доставлено, но с огрехами" : "Клиент оставил жалобу";
      $("#scene").innerHTML = `
        <section class="a-game rt">
          <div class="a-card rt-card">
            <header class="a-top"><span class="a-kicker">Заказ ${esc(o.id)} доставлен</span><span class="a-kicker dim">${esc(sc.time || "")}</span></header>
            <div class="rt-stars">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= stars ? "on" : ""}" style="animation-delay:${i * 0.09}s">${ICON.starFill}</i>`).join("")}</div>
            <h2>${verdict}</h2>
            <div class="rt-rows">
              <div><span>Оплата</span><b>${Ord.money(o.pay)}</b></div>
              <div><span>Чаевые</span><b>${tip ? Ord.money(tip) : "—"}</b></div>
              <div><span>За смену</span><b>${Ord.money(sh.earn)}</b></div>
              <div><span>Рейтинг курьера</span><b>${Ord.rating().toFixed(2)}</b></div>
            </div>
            ${miss ? `<p class="muted small">Промахов по заказу: ${miss}. Рейтинг складывается из маршрута, примечаний и разговора.</p>` : ""}
            <div class="row center"><button class="btn primary" data-act="go">Дальше</button></div>
          </div>
        </section>`;
      Sound.sfx(stars >= 4 ? "ok" : "note");
      setTimeout(() => { Juice.xp(stars * 5 + Math.round(tip), $(".rt-stars")); if (!miss) Juice.badge("fivestar"); }, 600);
      $('[data-act="go"]').addEventListener("click", () => resolve(), { once: true });
    });
  }
};

// ───────── документ: прочитать и ответить ─────────
const Doc = {
  async run(sc, tok) {
    const qs = sc.qs;
    $("#scene").innerHTML = `
      <section class="a-game dc">
        <div class="dc-doc">${sc.doc}</div>
        <aside class="a-card dc-side">
          <header class="a-top"><span class="a-kicker">${esc(sc.kicker || "Документ")}</span><span class="a-kicker dim dc-n"></span></header>
          <div class="a-timer"><i></i></div>
          <p class="dc-q"></p>
          <div class="dc-opts"></div>
          <p class="muted small">Ответ — в документе слева. Любое слово можно нажать.</p>
        </aside>
      </section>`;
    const root = $(".dc");
    await Arcade.intro(sc, { ico: "doc", keys: ["Читай документ", "Отвечай на вопросы справа", "Время идёт"] });
    if (tok.dead) return null;
    let right = 0;
    for (let i = 0; i < qs.length; i++) {
      const ok = await this.ask(sc, tok, root, qs[i], i, qs.length);
      if (tok.dead) return null;
      if (ok) right += 1;
      if (qs[i].clue) Clues.add(qs[i].clue, !ok);
    }
    if (sc.done) sc.done(state, { right });
    Store.save();
    const act = await Arcade.result(sc, { score: right, max: qs.length, xp: right * 12, line: `Верных ответов: ${right} из ${qs.length}`, badge: "reader" });
    return act === "again" ? { again: true } : null;
  },
  ask(sc, tok, root, q, i, total) {
    return new Promise((resolve) => {
      const opts = shuffle(q.opts.map((t, k) => ({ t, ok: k === 0 })));
      $(".dc-n", root).textContent = `${i + 1} из ${total}`;
      $(".dc-q", root).textContent = q.q;
      const box = $(".dc-opts", root);
      box.innerHTML = opts.map((o, k) => `<button data-i="${k}">${esc(o.t)}</button>`).join("");
      let done = false;
      const finish = (k) => {
        if (done) return;
        done = true;
        timer.stop();
        const ok = k != null && opts[k].ok;
        $$("button", box).forEach((b, n) => { b.disabled = true; if (opts[n].ok) b.classList.add("right"); else if (n === k) b.classList.add("wrong"); });
        if (ok) Juice.hit(box, { first: true, base: 6 }); else { Juice.miss(); Sound.sfx("wrong"); }
        setTimeout(() => resolve(ok), ok ? 900 : 1700);
      };
      const timer = Arcade.timer($(".a-timer i", root), (sc.secs || 22) * (level().subs === "live" ? 1.4 : 1), () => finish(null));
      box.onclick = (e) => { const b = e.target.closest("[data-i]"); if (b && !tok.dead) finish(Number(b.dataset.i)); };
      Game.onLeave(() => { done = true; timer.stop(); });
    });
  }
};
