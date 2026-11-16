// Разговор с персонажем: реплика, ответ голосом или текстом, оценка по смыслу, переспрос.

const GIVE_UP = { en: "Okay... never mind.", ru: "Ладно. Дальше." };
const REASK = { en: "Sorry, what do you mean?", ru: "Не понял. Ещё раз." };

const Talk = {
  async run(sc, tok, { host = $("#scene"), embedded = false } = {}) {
    const lv = level();
    const ui = this.mount(host, sc, embedded, lv);
    Game.onLeave(() => ui.reply.destroy());
    try {
      return await this.play(sc, tok, ui, lv, embedded);
    } finally {
      if (embedded) ui.reply.destroy();
    }
  },

  async play(sc, tok, ui, lv, embedded) {
    const history = [];
    const allGot = new Set();

    const say = async (who, text, { slow = false } = {}) => {
      if (tok.dead || !text) return;
      const ru = PEOPLE[who].lang === "ru";
      ui.npcLine(who, text, !ru && lv.subs !== "live");
      history.push({ who: PEOPLE[who].name, text });
      ui.speaking(true);
      await raceDead(tok, Voice.sayAsync(text, { who, rate: slow ? 0.8 : 1, fx: embedded && who === "remezov" ? "phone" : "clean" }));
      Voice.stop();
      ui.speaking(false);
    };

    for (const raw of sc.beats) {
      if (tok.dead) return;
      const beat = resolveBeat(raw);
      const who = beat.who || sc.npc;
      const lang = PEOPLE[who].lang === "ru" ? "ru" : "en";
      const susKey = SUS_PEOPLE.includes(who) ? who : sc.sus;
      const facts = beat.facts || [];
      const got = new Set();
      const dropped = new Set();
      let tries = 0;
      let last = beat.say;
      ui.setNpc(who, embedded && who !== sc.npc ? "рядом и слышит" : "");
      ui.hint(beat.hint);
      await say(who, beat.say);

      while (!tok.dead) {
        const text = await raceDead(tok, ui.reply.wait());
        if (tok.dead || text == null) { ui.reply.cancel(); return null; }
        ui.revealAll();
        ui.playerLine(text);
        history.push({ who: "Player", text });
        ui.thinking(true);
        const r = await raceDead(tok, Talk.judge(sc, beat, who, lang, text, got, history));
        ui.thinking(false);
        if (tok.dead || !r) { ui.reply.cancel(); return null; }

        if (r.russian) { await say(who, r.reply || (lang === "ru" ? "По-английски, Иней." : "Sorry? In English, please.")); continue; }
        if (r.repeat) { await say(who, r.ai && r.reply ? r.reply : last, { slow: true }); continue; }

        tries += 1;
        r.facts.forEach((id) => got.add(id));
        if (r.tip) ui.tip(r.tip);

        const lines = [];
        for (const b of r.bonusHits) {
          const key = b.flag || b.id;
          if (state.flags[key]) continue;
          state.flags[key] = true;
          ui.sys("Получилось: " + b.label, "ok");
          Sound.sfx("ok");
          if (b.reply) lines.push(b.reply);
        }
        for (const f of r.leakHits) {
          addSus(f.susKey || susKey, f.sus || 20, f.label);
          ui.sys("Лишнее: " + f.label, "bad");
          if (!r.ai && f.reply) lines.push(f.reply);
        }
        if (r.suspicion > 0 && susKey) addSus(susKey, r.suspicion, "странный ответ");
        Store.save();

        if (sc.end && sc.end.failAt && susKey && (state.sus[susKey] || 0) >= sc.end.failAt) {
          await say(who, sc.end.failSay);
          return { fail: sc.end.failText };
        }

        if (r.gaveUp) {
          const m = facts.find((f) => !got.has(f.id) && !dropped.has(f.id));
          if (m) dropped.add(m.id);
        }
        const missing = facts.filter((f) => !got.has(f.id) && !dropped.has(f.id));

        if (!missing.length) {
          if (r.ai && r.reply) lines.push(r.reply);
          else if (!r.leakHits.length && beat.ok) lines.push(beat.ok);
          for (const l of lines) await say(who, l);
          break;
        }
        if (tries >= (beat.maxTries || 3)) {
          if (susKey && !sc.report) addSus(susKey, 8, "ответы не сходятся");
          const examples = missing.map((f) => (val(f.any, state) || []).find((k) => !k.endsWith("*")));
          Words.miss(examples.filter((k) => k && !/\d/.test(k)));
          ui.sys("Не прозвучало: " + missing.map((f, i) => f.label + (examples[i] ? ` («${examples[i]}»)` : "")).join("; "), "bad");
          lines.push(beat.giveUp || GIVE_UP[lang]);
          for (const l of lines) await say(who, l);
          break;
        }
        if (r.ai && r.reply) lines.push(r.reply);
        else lines.push((beat.ask && beat.ask[missing[0].id]) || REASK[lang]);
        for (const l of lines) await say(who, l);
        last = lines[lines.length - 1];
      }
      got.forEach((id) => allGot.add(id));
    }
    if (tok.dead) return;
    ui.hint("");
    ui.reply.disable();

    if (sc.report) {
      const ids = sc.beats.flatMap((b) => (resolveBeat(b).facts || []).map((f) => f.id));
      const score = ids.filter((id) => allGot.has(id)).length;
      state.reports[sc.id] = { got: [...allGot], total: ids.length };
      allGot.forEach((id) => { state.intel[id] = true; });
      Store.save();
      const v = sc.verdict.find((x) => score >= x.min);
      ui.sys(`Доклад: ${score} из ${ids.length}`, score >= ids.length - 1 ? "ok" : "");
      await say(sc.npc, v.say);
      await sleep(600);
      return v.retry ? { goto: v.retry } : null;
    }

    if (sc.end) await say(sc.npc, val(sc.end.say, state));
    if (sc.effect) sc.effect(state);
    Store.save();
    const after = sc.after && sc.after(state);
    if (after) { UI.caption(after, "bad"); await sleep(2600); }
    await sleep(500);
    return null;
  },

  async judge(sc, beat, who, lang, text, got, history) {
    const facts = beat.facts || [];
    const bonus = beat.bonus || [];
    const forbid = [...(beat.forbid || []), ...(sc.forbid || [])];
    const local = () => Talk.localJudge(text, { facts, bonus, forbid, lang, got });
    if (!AI.enabled()) return local();
    try {
      const lastNpc = [...history].reverse().find((h) => h.who !== "Player");
      const j = await AI.judge({
        npc: { name: PEOPLE[who].name, persona: who === sc.npc && sc.persona ? sc.persona : `${PEOPLE[who].name}, ${PEOPLE[who].role}.` },
        lang, situation: sc.situation || "", said: lastNpc ? lastNpc.text : beat.say,
        facts: facts.filter((f) => !got.has(f.id)), done: [...got], bonus, forbid,
        history: history.slice(-8), weak: Words.weak(3), utterance: text
      });
      const ids = (a) => (Array.isArray(a) ? a.map(String) : []);
      const res = {
        ai: true,
        facts: ids(j.facts).filter((id) => facts.some((f) => f.id === id)),
        bonusHits: bonus.filter((b) => ids(j.bonus).includes(b.id)),
        leakHits: forbid.filter((f) => ids(j.leaks).includes(f.id)),
        repeat: !!j.repeat, gaveUp: !!j.gave_up,
        suspicion: clamp(Number(j.suspicion) || 0, 0, 20),
        reply: String(j.reply || "").trim(),
        tip: String(j.tip_ru || "").trim(),
        russian: isRussian(text)
      };
      // Точное совпадение ключевых слов засчитывается, даже если модель была строже.
      local().facts.forEach((id) => { if (!res.facts.includes(id)) res.facts.push(id); });
      if (res.russian) res.facts = [];
      return res;
    } catch (e) {
      console.warn("AI judge failed", e);
      return local();
    }
  },

  localJudge(text, { facts, bonus, forbid, lang, got }) {
    if (isRussian(text)) return { russian: true, facts: [], bonusHits: [], leakHits: [] };
    const t = norm(text);
    const hits = facts.filter((f) => !got.has(f.id) && matchFact(text, f)).map((f) => f.id);
    const repeat = !hits.length && (/\b(repeat|again|pardon|slowly|slower|didnt understand|dont understand|didnt get|what did you say|say that again)\b/.test(t) || /^(sorry|what|huh|excuse me)$/.test(t));
    return {
      ai: false, repeat, russian: false,
      gaveUp: /\b(dont know|do not know|not sure|no idea|cant remember|dont remember|forgot|i forget)\b/.test(t),
      facts: hits,
      bonusHits: bonus.filter((b) => matchFact(text, b)),
      leakHits: forbid.filter((f) => matchFact(text, f)),
      suspicion: 0, reply: "", tip: ""
    };
  },

  mount(host, sc, embedded, lv) {
    host.innerHTML = `
      <section class="talk ${embedded ? "embedded" : ""}">
        <aside class="talk-side">
          <div class="npc-card"><div class="npc-ava"></div><div class="npc-id"><b></b><span></span><em></em></div></div>
          ${sc.goal && !embedded ? `<p class="talk-goal">${esc(val(sc.goal, state))}</p>` : ""}
          <div class="talk-hint" hidden></div>
          <div class="talk-board" hidden></div>
        </aside>
        <div class="talk-main">
          <div class="talk-log"></div>
          <div class="talk-think" hidden><i></i><i></i><i></i></div>
          <div class="talk-reply"></div>
        </div>
      </section>`;
    const root = $(".talk", host);
    const log = $(".talk-log", root);
    const reply = ReplyBox($(".talk-reply", root), sc.npc === "remezov"
      ? { label: "Доложить", placeholder: "или напишите доклад по-английски и нажмите Enter" } : {});
    let hints = lv.hints;
    let curWho = sc.npc;
    const scroll = () => { log.scrollTop = log.scrollHeight; };

    if (sc.board) {
      const b = $(".talk-board", root);
      const slots = SCENES[sc.board].slots;
      const filled = state.boards[sc.board] || {};
      if (lv.subs !== "none") {
        b.hidden = false;
        const rows = slots.map((s) => `<li class="${filled[s.id] ? "ok" : ""}"><span>${esc(s.q)}</span><b>${filled[s.id] ? esc(filled[s.id]) : "—"}</b></li>`).join("");
        b.innerHTML = lv.subs === "live"
          ? `<h5>Ваша доска</h5><ul>${rows}</ul>`
          : `<details><summary>Ваша доска</summary><ul>${rows}</ul></details>`;
      }
    }

    root.addEventListener("click", (e) => {
      const rep = e.target.closest("[data-replay]");
      if (rep) { Voice.say(rep.dataset.replay, { who: rep.dataset.who, rate: 0.85 }); return; }
      const rev = e.target.closest("[data-reveal]");
      if (rev && hints > 0) {
        hints -= 1;
        rev.closest(".msg").classList.remove("hidden-text");
        rev.remove();
        $$("[data-reveal]", root).forEach((x) => { x.textContent = `Текст · ${hints}`; if (!hints) x.remove(); });
      }
    });

    return {
      reply,
      setNpc(who, badge) {
        curWho = who;
        const p = PEOPLE[who];
        $(".npc-ava", root).innerHTML = avatar(who, "lg");
        $(".npc-id b", root).textContent = p.name;
        $(".npc-id span", root).textContent = p.role;
        $(".npc-id em", root).textContent = badge || "";
        $(".npc-card", root).classList.toggle("listening", !!badge);
      },
      speaking(on) { $(".npc-card", root).classList.toggle("speaking", on); },
      hint(text) {
        const h = $(".talk-hint", root);
        const repeatTip = lv.subs === "live" ? "" : "Не расслышали? Попросите: «Sorry, could you repeat?»";
        const parts = [];
        if (text && lv.subs !== "none") parts.push(`<b>Подсказка</b> ${esc(val(text, state))}`);
        if (repeatTip && curWho !== "remezov") parts.push(`<small>${esc(repeatTip)}</small>`);
        h.innerHTML = parts.join("");
        h.hidden = !parts.length;
      },
      npcLine(who, text, hidden) {
        const p = PEOPLE[who];
        const ru = p.lang === "ru";
        const el = document.createElement("div");
        el.className = "msg npc" + (hidden ? " hidden-text" : "") + (ru ? " ru" : "");
        const tools = [];
        if (!ru && lv.subs === "live") tools.push(`<button data-replay="${esc(text)}" data-who="${who}">Повторить медленно</button>`);
        if (hidden && hints > 0) tools.push(`<button data-reveal>Текст · ${hints}</button>`);
        el.innerHTML = `<div class="msg-who">${esc(p.name)}</div>
          <div class="msg-txt">${ru ? esc(text) : enHTML(text)}</div>
          <div class="msg-veil">• • •</div>
          ${tools.length ? `<div class="msg-tools">${tools.join("")}</div>` : ""}`;
        log.appendChild(el);
        scroll();
      },
      revealAll() {
        $$(".msg.hidden-text", root).forEach((m) => m.classList.remove("hidden-text"));
        $$("[data-reveal]", root).forEach((x) => x.remove());
      },
      playerLine(text) {
        const el = document.createElement("div");
        el.className = "msg me";
        el.innerHTML = `<div class="msg-who">Вы</div><div class="msg-txt">${esc(text)}</div>`;
        log.appendChild(el);
        scroll();
      },
      tip(text) {
        const el = document.createElement("div");
        el.className = "msg tip";
        el.innerHTML = `<b>Как сказать естественнее</b> ${esc(text)}`;
        log.appendChild(el);
        scroll();
      },
      sys(text, kind = "") {
        const el = document.createElement("div");
        el.className = "msg sys " + kind;
        el.textContent = text;
        log.appendChild(el);
        scroll();
      },
      thinking(on) { $(".talk-think", root).hidden = !on; if (on) scroll(); }
    };
  }
};

function resolveBeat(b) {
  return { ...b, say: val(b.say, state), facts: val(b.facts, state), hint: val(b.hint, state) };
}

function raceDead(tok, promise) {
  if (tok.dead) return Promise.resolve(null);
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; clearInterval(id); resolve(v); };
    promise.then(finish, () => finish(null));
    const id = setInterval(() => { if (tok.dead) finish(null); }, 120);
  });
}
