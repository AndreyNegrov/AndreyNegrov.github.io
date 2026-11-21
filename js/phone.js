// Сезон 2: мессенджер. Вы сами спрашиваете, человек отвечает следующим сообщением.

const Phone = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const P = {
        sc, tok, resolve, who: sc.who, log: [], step: 0, reply: null,
        history: [], done: false
      };
      this.mount(P);
      Game.onLeave(() => this.destroy(P));
      this.advance(P);
    });
  },

  mount(P) {
    const person = PEOPLE[P.who];
    const goal = val(P.sc.goal, state);
    $("#scene").innerHTML = `
      <section class="talk">
        <aside class="talk-side">
          <div class="npc-card">
            <div class="npc-ava">${avatar(P.who, "lg")}</div>
            <div class="npc-id"><b>${esc(person.name)}</b><span>${esc(person.role)}</span><em>чат</em></div>
          </div>
          ${goal ? `<p class="talk-goal">${esc(goal)}</p>` : ""}
          <div class="talk-hint" hidden></div>
        </aside>
        <div class="talk-main">
          <div class="talk-log"></div>
          <div class="talk-reply"></div>
        </div>
      </section>`;
    P.logEl = $(".talk-log");
    P.hintEl = $(".talk-hint");
    P.reply = ReplyBox($(".talk-reply"), P.who === "remezov"
      ? { label: "Написать", placeholder: "или напишите по-английски и нажмите Enter" }
      : { placeholder: "или напишите по-английски и нажмите Enter" });
    P.reply.disable();
    P.logEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-say]");
      if (!btn) return;
      Voice.say(btn.dataset.say, { who: btn.dataset.who });
    });
  },

  destroy(P) {
    Voice.stop();
    if (P.reply) P.reply.destroy();
  },

  bubble(P, item) {
    const lv = level();
    const mine = item.who === "me";
    const sys = item.who === "sys";
    const person = !mine && !sys ? PEOPLE[item.who] : null;
    const ru = person && person.lang === "ru";
    let body;
    if (mine || sys || ru || lv.subs === "live" || item.revealed) body = ru || mine || sys ? esc(item.text) : enHTML(item.text);
    else body = `<button class="mini" type="button" data-say="${esc(item.text)}" data-who="${esc(item.who)}">Голосовое</button>`;
    const el = document.createElement("div");
    el.className = sys ? "msg sys" : mine ? "msg me" : "msg npc" + (ru ? " ru" : "");
    el.innerHTML = `${person ? `<div class="msg-who">${esc(person.name)}</div>` : ""}${body}`;
    P.logEl.appendChild(el);
    P.logEl.scrollTop = P.logEl.scrollHeight;
    return el;
  },

  async say(P, who, text) {
    const item = { who, text, revealed: level().subs === "live" || (PEOPLE[who] && PEOPLE[who].lang === "ru") };
    const el = this.bubble(P, item);
    if (who !== "me" && who !== "sys" && !(PEOPLE[who] && PEOPLE[who].lang === "ru")) {
      Notes.add({ kind: "heard", src: "phone", scene: P.sc.id, who, time: P.sc.time || "", text });
    }
    await Voice.sayAsync(text, { who });
    if (!item.revealed && level().subs === "after") {
      item.revealed = true;
      el.innerHTML = `<div class="msg-who">${esc(PEOPLE[who].name)}</div>${enHTML(text)}`;
    }
    P.history.push({ who: who === "me" ? "Player" : PEOPLE[who].name, text });
  },

  hint(P, text) {
    const h = P.hintEl;
    if (!h) return;
    h.innerHTML = text ? `<b>Подсказка</b> ${esc(text)}` : "";
    h.hidden = !text;
  },

  async advance(P) {
    const steps = P.sc.steps || [];
    while (P.step < steps.length && !P.tok.dead && !P.done) {
      const step = steps[P.step];
      if (step.from) {
        await this.say(P, step.from, step.text);
        P.step += 1;
        continue;
      }
      if (step.report) {
        await this.report(P, step);
        P.step += 1;
        continue;
      }
      const ok = await this.ask(P, step);
      if (!ok) return;
      P.step += 1;
    }
    if (!P.tok.dead && !P.done) P.resolve();
  },

  async ask(P, step) {
    const need = step.need;
    this.hint(P, step.hint);
    const fake = { npc: P.who, persona: P.sc.persona, situation: P.sc.situation, forbid: [] };
    while (!P.tok.dead && !P.done) {
      const text = await P.reply.wait();
      if (P.tok.dead || text == null) return false;
      this.bubble(P, { who: "me", text });
      P.history.push({ who: "Player", text });
      if (isRussian(text)) {
        await this.say(P, P.who, "English, please.");
        continue;
      }
      const block = step.block || P.sc.block;
      if (block && matchFact(text, block)) {
        await this.say(P, P.who, block.reply);
        P.done = true;
        P.resolve({ fail: P.sc.blockText });
        return false;
      }
      const judged = await Talk.judge(fake, { say: need.label, facts: [need], forbid: [] }, P.who, "en", text, new Set(), P.history);
      if ((judged.facts || []).includes(need.id)) {
        if (need.flag) { state.flags[need.flag] = true; Store.save(); }
        return true;
      }
      this.bubble(P, { who: "sys", text: step.hint || "Спросите иначе. Она отвечает только на этот вопрос." });
    }
    return false;
  },

  async report(P, step) {
    const got = new Set();
    let misses = 0;
    const fake = { npc: "remezov", persona: P.sc.persona, situation: P.sc.situation, forbid: [] };
    this.hint(P, step.hint);
    while (got.size < step.facts.length && misses < 6 && !P.tok.dead && !P.done) {
      const text = await P.reply.wait();
      if (P.tok.dead || text == null) return;
      this.bubble(P, { who: "me", text });
      P.history.push({ who: "Player", text });
      if (isRussian(text)) {
        await this.say(P, "remezov", "По-английски.");
        continue;
      }
      const left = step.facts.filter((f) => !got.has(f.id));
      const judged = await Talk.judge(fake, { say: "Докладывайте.", facts: left, forbid: [] }, "remezov", "en", text, got, P.history);
      const hit = (judged.facts || []).filter((id) => left.some((f) => f.id === id));
      if (!hit.length) {
        misses += 1;
        this.bubble(P, { who: "sys", text: step.hint || "Нужны факты из чатов, по-английски." });
        continue;
      }
      hit.forEach((id) => got.add(id));
      const ack = hit.map((id) => step.facts.find((f) => f.id === id).ack).filter(Boolean).join(" ");
      if (ack) await this.say(P, "remezov", ack);
    }
    state.reports[P.sc.id] = { got: [...got], total: step.facts.length };
    Store.save();
  }
};
