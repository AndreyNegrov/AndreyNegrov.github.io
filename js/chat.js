// Мессенджер: Сова (по-русски) и рабочий чат Loop (по-английски).
// Короткие сообщения вместо стен текста. Игрок отвечает голосом или текстом, по-английски.

const CHAT_APPS = {
  sova: { title: "Сова", sub: "в сети · шифрованный чат", who: "sova", cls: "app-sova", label: "Сова · шифрованный чат" },
  relay: { title: "Kit", sub: "Relay · служебный чат", who: "kit", cls: "app-relay", label: "Relay · служебный чат" },
  loop: { title: "Grace Hollis", sub: "Loop · рабочий чат Murmur", who: "grace", cls: "app-loop", label: "Loop · рабочий чат" }
};

const Chat = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const C = { sc, tok, resolve, reply: null, app: sc.app || "sova" };
      this.mount(C);
      Game.onLeave(() => this.destroy(C));
      this.play(C);
    });
  },

  mount(C) {
    $("#scene").innerHTML = `
      <section class="o-chat">
        <div class="o-phone">
          <header class="o-ph-head"></header>
          <div class="o-ph-log"></div>
          <div class="o-ph-hint" hidden></div>
          <div class="o-ph-reply" hidden></div>
          <div class="o-ph-foot"></div>
        </div>
      </section>`;
    C.el = $(".o-chat");
    C.log = $(".o-ph-log", C.el);
    this.header(C);
    C.el.addEventListener("click", (e) => {
      const s = e.target.closest("[data-say]");
      if (s) Voice.say(s.dataset.say, { who: s.dataset.who || "guest", rate: 0.9 });
    });
  },

  header(C) {
    const a = CHAT_APPS[C.app];
    const ph = $(".o-phone", C.el);
    ph.className = "o-phone " + a.cls;
    $(".o-ph-head", C.el).innerHTML = `<div class="o-ph-ava">${avatar(a.who, "sm")}</div>
      <div class="o-ph-id"><b>${esc(a.title)}</b><span>${esc(a.sub)}</span></div>
      <time>${esc(C.sc.time || "")}</time>`;
  },

  destroy(C) {
    if (C.reply) { C.reply.destroy(); C.reply = null; }
    if (C.ringStop) C.ringStop();
  },

  scroll(C) { C.log.scrollTop = C.log.scrollHeight; },

  bubble(C, html, cls) {
    const el = document.createElement("div");
    el.className = "o-bub " + cls;
    el.innerHTML = html;
    C.log.appendChild(el);
    this.scroll(C);
    return el;
  },

  async typing(C, len) {
    const el = this.bubble(C, "<i></i><i></i><i></i>", "them typing");
    await sleep(clamp(450 + len * 14, 600, 1500));
    el.remove();
  },

  async play(C) {
    const { sc, tok } = C;
    for (const step of sc.steps) {
      if (tok.dead) return;
      if (step.when && !step.when(state)) continue;
      if (step.app) { C.app = step.app; this.header(C); this.bubble(C, (CHAT_APPS[step.app] || CHAT_APPS.relay).label, "sys"); await sleep(400); continue; }
      if (step.from) {
        const text = val(step.text, state);
        await this.typing(C, text.length);
        if (tok.dead) return;
        const ru = PEOPLE[step.from].lang === "ru";
        this.bubble(C, ru ? esc(text) : enHTML(text) + `<button class="o-bub-play" data-say="${esc(text)}" data-who="${step.from}">${ICON.play}</button>`, "them" + (ru ? "" : " en"));
        Sound.sfx("note");
        if (!ru) Notes.add({ kind: "heard", src: "phone", scene: sc.id, who: step.from, time: sc.time || "", text });
        await sleep(500);
        continue;
      }
      if (step.phrase) {
        const p = Phrases.get(step.phrase);
        Phrases.unlock(step.phrase);
        this.bubble(C, `<span class="o-card-k">Фраза-инструмент</span>
          <b class="english">${esc(p.en)}</b><span>${esc(p.ru)}</span>${p.use ? `<em>${esc(p.use)}</em>` : ""}
          <button class="btn ghost small" data-say="${esc(p.en)}">${ICON.play} Послушать</button>`, "them card");
        Sound.sfx("coin");
        await sleep(900);
        continue;
      }
      if (step.sticky) {
        this.bubble(C, `<div class="o-sticky">${esc(step.sticky)}</div>`, "them plain");
        Notes.add({ kind: "item", src: "item", scene: sc.id, time: sc.time || "", text: step.sticky });
        await sleep(700);
        continue;
      }
      if (step.me) {
        const ok = await this.answer(C, step.me);
        if (!ok) return;
      }
    }
    if (tok.dead) return;
    this.finish(C);
  },

  // Ответ игрока по-английски. Для доклада — несколько фактов, Сова отвечает на каждый.
  async answer(C, me) {
    const { sc, tok } = C;
    const lv = level();
    const hint = $(".o-ph-hint", C.el);
    const box = $(".o-ph-reply", C.el);
    const facts = (me.facts || []).map(resolveFact);
    const got = new Set();
    const history = [];
    let tries = 0;
    const showHint = (extra) => {
      const parts = [];
      if (me.hint && lv.subs !== "none") parts.push(`<b>Подсказка</b> ${esc(val(me.hint, state))}`);
      if (extra) parts.push(extra);
      if (me.report && facts.length > 1) parts.push(`<div class="o-checks">${facts.map((f) => `<span class="${got.has(f.id) ? "ok" : ""}">${esc(f.label)}</span>`).join("")}</div>`);
      hint.innerHTML = parts.join("");
      hint.hidden = !parts.length;
    };
    showHint();
    box.hidden = false;
    C.reply = ReplyBox(box, { label: me.report ? "Доложить" : "Говорить", placeholder: "по-английски, Enter — отправить" });
    const scLike = { npc: "sova", persona: "Сова, куратор. Отвечает коротко, сухо, с иронией, по-русски.", situation: "Игрок докладывает куратору по-английски в чате.", forbid: [] };
    const ack = async (text) => {
      await this.typing(C, text.length);
      this.bubble(C, esc(text), "them");
      Sound.sfx("note");
    };
    let result = true;
    while (!tok.dead) {
      const text = await raceDead(tok, C.reply.wait());
      if (tok.dead || text == null) { result = false; break; }
      if (text === "__SKIP__") {
        if (me.done) me.done(state, new Set(facts.map((f) => f.id)));
        break;
      }
      this.bubble(C, esc(text), "me");
      history.push({ who: "Player", text });
      Phrases.detect(text);
      if (isRussian(text)) { await ack("По-английски. Экран видят все."); continue; }
      const r = await raceDead(tok, Talk.judge(scLike, { facts: facts.filter((f) => !got.has(f.id)), bonus: [], forbid: [], say: "" }, "sova", "ru", text, got, history));
      if (tok.dead || !r) { result = false; break; }
      if (r.repeat) { await ack("Повторяю: " + val(me.hint, state)); continue; }
      tries += 1;
      const fresh = r.facts.filter((id) => !got.has(id));
      fresh.forEach((id) => got.add(id));
      if (r.tip) { Mission.stats().tips.push(r.tip); this.bubble(C, `<b>Как сказать естественнее</b> ${esc(r.tip)}`, "tip"); }
      const acks = fresh.map((id) => val(facts.find((f) => f.id === id).ack, state)).filter(Boolean);
      const missing = facts.filter((f) => !got.has(f.id));
      showHint();
      if (!missing.length) {
        if (tries === 1) Mission.stats().first += 1;
        Juice.hit(box, { first: tries === 1, voice: ReplyBox.via === "voice" });
        if (TOON()) this.bubble(C, tries === 1 ? "👍" : "👌", "them emoji");
        for (const a of acks) await ack(a);
        if (me.ok) await ack(val(me.ok, state));
        break;
      }
      if (tries >= (me.maxTries || 3) || r.gaveUp) {
        for (const a of acks) await ack(a);
        if (me.model) Mission.stats().models.push({ hint: val(me.hint, state), en: val(me.model, state) });
        if (me.model && lv.subs !== "none") this.bubble(C, `<b>Можно было так</b> <span class="english">${enHTML(val(me.model, state))}</span>`, "tip");
        if (me.fallback) await ack(val(me.fallback, state));
        break;
      }
      if (fresh.length) Sound.sfx("pop"); else Juice.miss();
      for (const a of acks) await ack(a);
      if (!acks.length && r.ai && r.reply) await ack(r.reply);
      else if (!acks.length) await ack((me.ask && me.ask[missing[0].id]) || "Не поняла. Ещё раз, по-английски.");
      if (tries >= 2 && me.model && lv.subs !== "none") showHint(`<small>Пример: <span class="english">${esc(val(me.model, state))}</span></small>`);
    }
    if (C.reply) { C.reply.destroy(); C.reply = null; }
    PTT.unbind();
    box.hidden = true;
    hint.hidden = true;
    const st = Mission.stats();
    st.need += facts.length;
    st.got += got.size;
    if (me.report) state.reports[sc.id] = { got: [...got], total: facts.length };
    if (me.done) me.done(state, got);
    Store.save();
    return result;
  },

  finish(C) {
    const sc = C.sc;
    const foot = $(".o-ph-foot", C.el);
    if (sc.ring) {
      const r = sc.ring;
      foot.innerHTML = `<div class="o-ring">
        <div class="o-ring-ava">${avatar(r.who, "lg")}</div>
        <div class="o-ring-id"><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></div>
        <button class="o-ring-btn" data-act="go">${ICON.phone}<span>${esc(sc.end)}</span></button>
      </div>`;
      let on = true;
      const loop = () => { if (!on) return; Sound.sfx("ring"); C.ringT = setTimeout(loop, 3200); };
      loop();
      C.ringStop = () => { on = false; clearTimeout(C.ringT); };
    } else {
      foot.innerHTML = `<button class="btn primary wide" data-act="go">${esc(sc.end || "Дальше")}</button>`;
    }
    this.scroll(C);
    foot.querySelector("[data-act]").addEventListener("click", () => {
      if (C.ringStop) C.ringStop();
      Voice.stop();
      C.resolve();
    }, { once: true });
  }
};

function resolveFact(f) {
  return { ...f, label: val(f.label, state), ai: val(f.ai, state) || val(f.label, state), reply: f.reply };
}
