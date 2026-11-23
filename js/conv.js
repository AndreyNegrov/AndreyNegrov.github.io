// Разговор сезона «Онбординг»: видеозвонок, телефон или лицом к лицу.
// Реплика → ответ голосом или текстом → проверка по смыслу. Фразы-инструменты работают:
// «repeat», «slowly», «spell», «what does … mean». Режим вопросов: игрок сам выясняет факты.

const REPAIR_SAY = {
  noSpell: "Sorry, spell what?",
  noMean: "Hmm. It's hard to explain. Never mind."
};

const Repair = {
  detect(text) {
    const t = norm(text);
    if (enWords(text) > 12) return null;
    if (/\bspell\b/.test(t)) return { kind: "spell" };
    const m = t.match(/what(?: s| does| do| is)? (.+?) mean/) || t.match(/meaning of (.+)$/);
    if (m) return { kind: "mean", word: m[1].replace(/^(the|a|an|word)\s+/, "").replace(/\s+(the|a|an)$/, "").trim() };
    if (/\bmean(ing)?\b/.test(t) && /\bwhat\b/.test(t)) return { kind: "mean", word: "" };
    if (/\b(slowly|slower)\b/.test(t)) return { kind: "slow" };
    if (/\b(repeat|pardon|come again)\b/.test(t) || /\bsay (it|that) again\b/.test(t) || /^(sorry|what|huh|excuse me|sorry what|what sorry)$/.test(t)) return { kind: "repeat" };
    return null;
  },
  explain(word, line, extra) {
    const dict = { ...EXPLAIN, ...(extra || {}) };
    const w = norm(word).replace(/s$/, "");
    if (w) {
      const key = Object.keys(dict).find((k) => norm(k) === norm(word) || norm(k) === w || norm(k).replace(/s$/, "") === w);
      if (key) return dict[key];
    }
    const t = " " + norm(line) + " ";
    const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
    const hit = keys.find((k) => t.includes(" " + norm(k) + " "));
    return hit && !word ? dict[hit] : null;
  },
  spellWord(line, forced) {
    if (forced) return forced;
    const words = String(line).match(/\b[A-Z][a-zA-Z']{2,}\b/g) || [];
    const skip = /^(Sorry|Okay|Yes|And|The|What|Can|Could|Hi|Hello|Thanks|Great|So|Is|It|I'm|Friday|Monday)$/;
    const cand = words.filter((w) => !skip.test(w)).sort((a, b) => b.length - a.length);
    return cand[0] || null;
  }
};

const Conv = {
  async run(sc, tok, { host = $("#scene") } = {}) {
    const lv = level();
    const ui = ConvUI.mount(host, sc, lv);
    Game.onLeave(() => ui.destroy());
    try {
      return await this.play(sc, tok, ui, lv);
    } finally {
      ui.destroy();
    }
  },

  async play(sc, tok, ui, lv) {
    const ctx = { sc, tok, ui, lv, history: [], st: Mission.stats(sc.mission), last: "", lastWho: sc.npc, bonusDone: new Set(), cur: null };
    ctx.forbid = (val(sc.forbid, state) || []).map(resolveFact);
    ui.onGadget = (id) => this.gadget(ctx, id);
    ui.gadgets(["whisper", "freeze"]);
    if (sc.streets) {
      state.flags.streets = sc.streets;
      UI.goal("До вызова: " + sc.streets + " улицы");
    }
    // Полоса прогресса: сколько вопросов разговора уже позади.
    const asks = (b) => !!(b.facts || b.anyReply || b.topics);
    const total = sc.beats.filter(asks).length;
    let passed = 0;
    ui.meter(0, total, sc.meter);
    for (const raw of sc.beats) {
      if (tok.dead) return null;
      if (raw.when && !raw.when(state)) { if (asks(raw)) ui.meter(++passed, total, sc.meter); continue; }
      const r = await this.beat(ctx, raw);
      if (r && r.fail) return r;
      if (tok.dead) return null;
      if (asks(raw)) ui.meter(++passed, total, sc.meter);
    }
    if (sc.end) await this.say(ctx, sc.end.who || sc.npc, val(sc.end.say, state));
    if (sc.effect) sc.effect(state);
    ui.reply.disable();
    ui.hint("");
    Store.save();
    await sleep(700);
    return null;
  },

  personaFor(sc, who) {
    return { npc: who, persona: (CAST[who] || `${PEOPLE[who].name}, ${PEOPLE[who].role}.`) + (sc.persona ? " " + sc.persona : ""), situation: sc.situation || "" };
  },

  async say(ctx, who, text, o = {}) {
    if (ctx.tok.dead || !text) return;
    const { ui, lv } = ctx;
    const p = PEOPLE[who];
    if (p.lang === "ru") {
      ui.npcLine(who, text, { chatOnly: true });
      Sound.sfx("note");
      await sleep(clamp(900 + text.length * 42, 1400, 4200));
      return;
    }
    ui.rest(who);
    ui.npcLine(who, text, { hidden: lv.subs !== "live" && !o.spell, aside: o.fx === "aside" });
    ctx.history.push({ who: p.name, text });
    ctx.last = text;
    ctx.lastWho = who;
    ui.speaking(who, true);
    const spoken = o.spell ? text.replace(/-/g, ". ") : text;
    await raceDead(ctx.tok, Voice.sayAsync(spoken, { who, rate: o.slow ? 0.78 : o.spell ? 0.8 : 1, fx: o.fx || (ctx.sc.ui === "phone" ? "phone" : "clean") }));
    ui.speaking(who, false);
    if (o.note) Notes.add({ kind: "heard", src: "talk", scene: ctx.sc.id, who, time: ctx.sc.time || "", text: `${text}`, hidden: lv.subs === "live" ? false : lv.subs === "after" ? "after" : "always" });
    if (o.clue) Clues.add(o.clue);
  },

  resolveBeat(raw) {
    const b = { ...raw };
    b.say = val(raw.say, state);
    b.hint = val(raw.hint, state);
    b.facts = (raw.anyReply ? [ANY_EN] : (val(raw.facts, state) || [])).map(resolveFact);
    b.bonus = (val(raw.bonus, state) || []).map(resolveFact);
    b.forbid = (val(raw.forbid, state) || []).map(resolveFact);
    // Чтение вслух: фраза на экране, засчитывается, если прозвучало большинство слов.
    if (raw.read) {
      const text = val(raw.read, state);
      b.read = text;
      b.facts = [{ id: "read", label: "прочитать вслух", ai: `reads aloud the sentence: "${text}"`, test: (t) => sameWords(t, text) >= 0.7 }];
      b.hint = b.hint || "Прочитай фразу вслух. Можно и напечатать.";
      b.model = text;
    }
    return b;
  },

  async beat(ctx, raw) {
    const { sc, ui } = ctx;
    const b = this.resolveBeat(raw);
    if (b.notify) { ui.notify(val(b.notify, state)); Sound.sfx("note"); await sleep(1600); }
    if (b.flash) await this.flash(ctx, b.flash);
    for (const l of b.lines || []) await this.say(ctx, l.who, val(l.text, state), l);
    if (b.say) await this.say(ctx, b.who || sc.npc, b.say);
    if (b.topics) return this.topics(ctx, b);
    if (!b.facts.length) return null;
    return this.answer(ctx, b);
  },

  // Обычный ответ: нужны факты, переспрос, подсказки, образец после двух промахов.
  async answer(ctx, b) {
    const { sc, tok, ui, lv, st } = ctx;
    const who = b.who || ctx.lastWho || sc.npc;
    const facts = b.facts;
    const got = new Set();
    let tries = 0;
    st.beats += 1;
    st.need += facts.length;
    ui.hint(b.hint, { legend: b.legendHint, read: b.read });
    ctx.cur = { hint: b.hint, opts: { legend: b.legendHint, read: b.read }, model: val(b.model, state) };
    while (!tok.dead) {
      const text = await raceDead(tok, ui.reply.wait());
      if (tok.dead || text == null) return null;
      if (text === "__SKIP__") {
        if (b.done) b.done(state, new Set(facts.map((f) => f.id)));
        return null;
      }
      ui.revealAll();
      ui.playerLine(text);
      ctx.history.push({ who: "Player", text });
      Phrases.detect(text).forEach((id) => ui.phrase(id));
      if (isRussian(text)) {
        Heat.add(6, "по-русски");
        await this.say(ctx, who, "Sorry? In English, please.");
        if (Heat.over() && sc.heatFail !== false) return this.burn(ctx, who);
        continue;
      }
      if (typeof b.trap === "function") {
        const why = b.trap(text, state);
        if (why) return { fail: why };
      }
      const rep = Repair.detect(text);
      if (rep && !facts.some((f) => !got.has(f.id) && matchFact(text, f))) { await this.repair(ctx, who, rep, b); continue; }
      ui.thinking(true);
      const r = await raceDead(tok, Talk.judge(this.personaFor(sc, who), { facts, bonus: b.bonus, forbid: [...b.forbid, ...ctx.forbid], say: ctx.last }, who, "en", text, got, ctx.history.slice(-8)));
      ui.thinking(false);
      if (tok.dead || !r) return null;
      if (r.repeat) { await this.say(ctx, who, r.ai && r.reply ? r.reply : ctx.last, { slow: true }); continue; }
      tries += 1;
      const fresh = r.facts.filter((id) => !got.has(id));
      fresh.forEach((id) => got.add(id));
      if (r.tip) { ui.tip(r.tip); st.tips.push(r.tip); }
      const lines = [];
      fresh.forEach((id) => { const x = b.replies && b.replies[id]; if (x) lines.push(val(x, state)); });
      for (const bh of r.bonusHits) {
        if (ctx.bonusDone.has(bh.id)) continue;
        ctx.bonusDone.add(bh.id);
        if (bh.flag) state.flags[bh.flag] = true;
        if (bh.clue) Clues.add(bh.clue);
        ui.sys((TOON() ? "⭐ Бонус: " : "Бонус: ") + bh.label, "ok");
        Sound.sfx("ok");
        Juice.xp(10, ui.anchor(), "бонус");
        ui.mood(who, "wow", 2200);
        if (bh.reply) lines.push(val(bh.reply, state));
      }
      for (const f of r.leakHits) {
        Heat.add(f.sus == null ? 20 : f.sus, f.label);
        ui.sys("Лишнее: " + f.label, "bad");
        ui.mood(who, "sus", 3200);
        if (f.reply) lines.push(val(f.reply, state));
      }
      if (r.suspicion > 0) Heat.add(Math.min(r.suspicion, 12), "странный ответ");
      if (typeof b.watch === "function") {
        const w = b.watch(text, r, state);
        if (w && w.fail) {
          for (const l of lines) await this.say(ctx, who, l);
          return { fail: w.fail };
        }
      }
      Store.save();
      if (Heat.over() && sc.heatFail !== false) { for (const l of lines) await this.say(ctx, who, l); return this.burn(ctx, who); }
      const missing = facts.filter((f) => !got.has(f.id));
      if (!missing.length) {
        const clean = tries === 1 && !r.leakHits.length;
        if (tries === 1) st.first += 1;
        Juice.hit(ui.anchor(), { first: clean, voice: ReplyBox.via === "voice" });
        if (!r.leakHits.length) { ui.mood(who, "happy", 2200); ui.react(who, clean ? ["👍", "😄", "👏", "✨"][st.first % 4] : "👌"); }
        if (b.badge && clean) Juice.badge(b.badge);
        if (!lines.length && r.ai && r.reply) lines.push(r.reply);
        else if (!r.leakHits.length && b.ok) lines.push(val(b.ok, state));
        for (const l of lines) await this.say(ctx, who, l);
        break;
      }
      if (fresh.length) { Sound.sfx("pop"); if (TOON()) Juice.float("ещё чуть-чуть", ui.anchor(), "ok"); }
      else if (!r.leakHits.length) { Juice.miss(); ui.mood(who, "hm", 2400); }
      if (tries >= (b.maxTries || 3) || r.gaveUp) {
        Juice.miss();
        ui.sys("Не прозвучало: " + missing.map((f) => f.label).join("; "), "bad");
        if (b.model) {
          st.models.push({ hint: b.hint, en: val(b.model, state) });
          if (lv.subs !== "none") ui.model(val(b.model, state));
        }
        Words.miss(missing.map((f) => (val(f.any, state) || []).find((k) => !k.endsWith("*") && !/\d/.test(k))).filter(Boolean));
        lines.push(b.giveUp || "Okay. Never mind.");
        for (const l of lines) await this.say(ctx, who, l);
        break;
      }
      if (!lines.length && r.ai && r.reply) lines.push(r.reply);
      else lines.push((b.ask && b.ask[missing[0].id]) || "Sorry, what do you mean?");
      for (const l of lines) await this.say(ctx, who, l);
      if (tries >= 2 && b.model && lv.subs !== "none" && !b.read) ui.hint(b.hint, { legend: b.legendHint, model: val(b.model, state) });
    }
    st.got += got.size;
    ctx.cur = null;
    if (tries > 1 && typeof Ord !== "undefined") Ord.miss(0.5);
    if (tries > 1 && b.model && !st.models.some((m) => m.en === val(b.model, state))) st.models.push({ hint: b.hint, en: val(b.model, state) });
    if (b.done) b.done(state, got);
    Store.save();
    return null;
  },

  // Режим вопросов: персонаж отвечает только на то, о чём спросили.
  async topics(ctx, b) {
    const { sc, tok, ui, st } = ctx;
    const who = b.who || sc.npc;
    const asked = new Set();
    const required = b.topics.filter((t) => t.required);
    let turns = 0, interjected = false, fb = 0;
    st.beats += 1;
    st.need += required.length;
    ui.hint(b.hint, { topics: b.topics, asked });
    ctx.cur = { hint: b.hint, opts: { topics: b.topics, asked }, model: val(b.model, state) };
    let more = false;
    const offers = () => b.topics.filter((t) => t.offer && !asked.has(t.id));
    while (!tok.dead) {
      if (required.every((t) => asked.has(t.id)) && !more) {
        if (b.interject && !interjected) {
          interjected = true;
          const res = await this.beat(ctx, b.interject);
          if (res && res.fail) return res;
        }
        if (!offers().length) break;
        more = true;
        ui.hint("Главное узнали. Можно спросить ещё — или закончить: No, that's all. Thanks!", { topics: b.topics, asked });
        await this.say(ctx, who, b.more || "Anything else?");
      }
      if (turns >= (b.maxTurns || 9) && !more) { await this.say(ctx, who, b.busy || "Anyway, I need to get back to work."); break; }
      const text = await raceDead(tok, ui.reply.wait());
      if (tok.dead || text == null) return null;
      if (text === "__SKIP__") {
        required.forEach((t) => { if (t.dossier) Dossier.set(...t.dossier); if (t.clue) Clues.add(t.clue); });
        return null;
      }
      ui.revealAll();
      ui.playerLine(text);
      ctx.history.push({ who: "Player", text });
      Phrases.detect(text).forEach((id) => ui.phrase(id));
      if (isRussian(text)) {
        Heat.add(6, "по-русски");
        await this.say(ctx, who, "Sorry? In English, please.");
        if (Heat.over() && sc.heatFail !== false) return this.burn(ctx, who);
        continue;
      }
      const left = b.topics.filter((t) => !asked.has(t.id));
      const rep = Repair.detect(text);
      if (rep && !left.some((t) => matchFact(text, t))) { await this.repair(ctx, who, rep, b); continue; }
      turns += 1;
      ui.thinking(true);
      const facts = left.map((t) => ({ id: t.id, label: t.label, ai: t.ai || t.label, any: t.any, test: t.test }));
      const r = await raceDead(tok, Talk.judge(this.personaFor(sc, who), { facts, bonus: [], forbid: [...b.forbid, ...ctx.forbid], say: ctx.last }, who, "en", text, new Set(), ctx.history.slice(-8)));
      ui.thinking(false);
      if (tok.dead || !r) return null;
      if (r.repeat) { await this.say(ctx, who, ctx.last, { slow: true }); continue; }
      if (r.tip) { ui.tip(r.tip); st.tips.push(r.tip); }
      const lines = [];
      for (const f of r.leakHits) {
        Heat.add(f.sus == null ? 20 : f.sus, f.label);
        ui.sys("Лишнее: " + f.label, "bad");
        ui.mood(who, "sus", 3200);
        if (f.reply) lines.push(val(f.reply, state));
      }
      if (r.suspicion > 0) Heat.add(Math.min(r.suspicion, 12), "странный вопрос");
      if (Heat.over() && sc.heatFail !== false) { for (const l of lines) await this.say(ctx, who, l); return this.burn(ctx, who); }
      const hits = b.topics.filter((t) => r.facts.includes(t.id) && !asked.has(t.id));
      if (hits.length) {
        Juice.hit(ui.anchor(), { first: true, voice: ReplyBox.via === "voice", base: 8 });
        ui.mood(who, "happy", 1800);
      } else if (!r.leakHits.length && !more) { Juice.miss(); ui.mood(who, "hm", 2200); }
      for (const t of hits) {
        asked.add(t.id);
        lines.push(val(t.answer, state));
        if (t.dossier) Dossier.set(t.dossier[0], t.dossier[1], t.dossier[2]);
        if (t.clue) Clues.add(t.clue);
        if (t.also) Clues.add(t.also);
      }
      if (more) {
        if (hits.length && offers().length) lines.push(b.more || "Anything else?");
        for (const l of lines) await this.say(ctx, who, l);
        if (!hits.length || !offers().length) break;
        continue;
      }
      if (!hits.length && !r.leakHits.length) {
        const fall = b.fallbacks || ["Sorry?"];
        lines.push(r.ai && r.reply ? r.reply : fall[fb++ % fall.length]);
      }
      for (const l of lines) await this.say(ctx, who, l);
      ui.hint(b.hint, { topics: b.topics, asked });
      if (b.interject && !interjected && asked.size >= (b.interject.after || 1) && !required.every((t) => asked.has(t.id))) {
        interjected = true;
        const res = await this.beat(ctx, b.interject);
        if (res && res.fail) return res;
        ui.hint(b.hint, { topics: b.topics, asked });
      }
    }
    if (b.interject && !interjected && !tok.dead) {
      const res = await this.beat(ctx, b.interject);
      if (res && res.fail) return res;
    }
    st.got += required.filter((t) => asked.has(t.id)).length;
    ctx.cur = null;
    if (b.close) await this.say(ctx, who, val(b.close, state));
    Store.save();
    return null;
  },

  // Гаджеты: «Суфлёр» показывает и шепчет образец, «Иней» остужает засветку.
  gadget(ctx, id) {
    const { ui } = ctx;
    if (id === "freeze") {
      if (!(state.heat > 0)) return UI.toast(heatName() + " и так на нуле.", "info");
      if (!Gadgets.use("freeze")) return;
      Heat.add(-25);
    } else if (id === "whisper") {
      const cur = ctx.cur;
      if (!cur || !cur.model) return UI.toast("Сейчас подсказывать нечего.", "info");
      if (!Gadgets.use("whisper")) return;
      ui.hint(cur.hint, { ...cur.opts, model: cur.model });
      ui.sys((TOON() ? "🎧 Сова шепчет: " : "Сова подсказывает: ") + cur.model, "ok");
      Sound.sfx("pop");
      Voice.say(cur.model, { who: "guest", rate: 0.85, volume: 0.6 });
    }
    ui.gadgets();
  },

  async repair(ctx, who, rep, b) {
    const { ui } = ctx;
    const last = ctx.last;
    // Переспросить — это умение, а не ошибка: за первые разы в миссии дают опыт.
    ctx.st.repairs = (ctx.st.repairs || 0) + 1;
    if (ctx.st.repairs <= 3) Juice.xp(5, ui.anchor(), "переспрос");
    if (Profile.stat("repair") === 5) Juice.badge("repair");
    if (rep.kind === "repeat") return this.say(ctx, who, last, { slow: true });
    if (rep.kind === "slow") return this.say(ctx, who, last, { slow: true });
    if (rep.kind === "spell") {
      const w = Repair.spellWord(last, b.spell);
      if (!w) return this.say(ctx, who, REPAIR_SAY.noSpell);
      const letters = w.toUpperCase().replace(/[^A-Z]/g, "").split("").join("-");
      ui.sys(`${w} — по буквам`, "ok");
      return this.say(ctx, who, `${w}. ${letters}.`, { spell: true });
    }
    if (rep.kind === "mean") {
      const def = Repair.explain(rep.word, last, b.explain);
      if (def) { ui.sys("Объяснение простыми словами", "ok"); return this.say(ctx, who, def, { slow: true }); }
      const g = rep.word && GLOSSARY[Words.key(rep.word)];
      if (g) ui.sys(`Словарь: ${rep.word} — ${g}`, "ok");
      return this.say(ctx, who, REPAIR_SAY.noMean);
    }
  },

  async flash(ctx, f) {
    const ms = f.ms * (level().subs === "live" ? 1.6 : 1);
    await ctx.ui.flash(f, ms, () => {
      state.flags.flashShot = true;
      Notes.add({ kind: "item", src: "item", scene: ctx.sc.id, time: ctx.sc.time || "", text: "Скриншот: " + f.text });
      if (f.clue) Clues.add(f.clue);
      Sound.sfx("shutter");
      Juice.badge("snap");
    });
  },

  async burn(ctx, who) {
    const sc = ctx.sc;
    ctx.ui.mood(who, "angry", 0);
    await this.say(ctx, who, sc.failSay || "Sorry. I think we're done here.");
    return { fail: sc.failText || "Засветка 100. Тебе перестали верить — легенда сгорела." };
  }
};

// ───────── интерфейс разговора ─────────
const ConvUI = {
  mount(host, sc, lv) {
    const kind = sc.ui || "face";
    const cast = sc.cast || [sc.npc];
    let stage = "";
    const P = PEOPLE[sc.npc] || {};
    // Крупное изображение собеседника: фото, а если его нет — монограмма.
    const big = (w) => { const p = PEOPLE[w]; return p.img ? `<img src="${p.img}" alt="">` : `<span class="pt-mono">${esc(p.initial || p.name[0])}</span>`; };
    const toon = TOON();
    if (toon) stage = Toon.convStage(sc, lv);
    else if (kind === "video") {
      stage = `<div class="o-vc">
        <div class="o-vc-top"><span class="o-rec"></span><b>${esc(sc.title || "Call")}</b><span class="o-vc-time">00:00</span></div>
        <div class="o-vc-grid n${cast.length + 1}">
          ${cast.map((w) => `<div class="o-tile" data-who="${w}">${big(w)}<span class="o-tag">${esc(PEOPLE[w].name)}</span></div>`).join("")}
          <div class="o-tile self" data-who="you">${ICON.user}<span class="o-tag">Вы · Alex</span></div>
        </div>
        <div class="o-cc" hidden></div>
        <div class="o-vc-chat" hidden></div>
      </div>`;
    } else if (kind === "phone") {
      stage = `<div class="o-callcard" data-who="${sc.npc}">
        <div class="o-call-ava">${big(sc.npc)}</div>
        <b>${esc(P.name)}</b><span>${esc(sc.sub || P.role)}</span>
        <span class="o-vc-time">00:00</span>
        <div class="o-wave">${"<i></i>".repeat(18)}</div>
        <div class="o-bubble" hidden></div>
      </div>`;
    } else if (kind === "assistant") {
      stage = `<div class="as" data-who="${sc.npc}">
        <div class="orb"><i></i><i></i><i></i><b>${esc(P.initial || P.name[0])}</b></div>
        <div class="as-id"><b>${esc(P.name)}</b><span>${esc(sc.sub || P.role)}</span><span class="o-vc-time">00:00</span></div>
        <div class="o-bubble" hidden></div>
      </div>`;
    } else if (kind === "intercom") {
      stage = `<div class="ic" data-who="${sc.npc}">
        <div class="ic-panel">
          <div class="ic-grille">${"<i></i>".repeat(28)}</div>
          <div class="ic-screen"><b>${esc(sc.panel || "FLAT")}</b><span>${esc(P.name)}</span></div>
          <div class="ic-keys">${"123456789*0#".split("").map((k) => `<i>${k}</i>`).join("")}</div>
          <div class="ic-led"></div>
        </div>
        <div class="o-bubble" hidden></div>
      </div>`;
    } else {
      stage = `<div class="o-facecard" data-who="${sc.npc}">
        <div class="pt">${big(sc.npc)}<i class="pt-ring"></i><span class="pt-mood" hidden></span></div>
        <div class="o-plate"><b>${esc(P.name)}</b><span>${esc(P.role)}</span>${sc.place ? `<em>${esc(sc.place)}</em>` : ""}</div>
        <div class="o-bubble" hidden></div>
      </div>`;
    }
    host.innerHTML = `
      <section class="o-conv o-ui-${kind}">
        <div class="o-stage">${stage}<div class="o-stage-extra"></div><div class="o-notify" hidden></div></div>
        <div class="o-side">
          <div class="o-meter" hidden></div>
          <div class="o-log"></div>
          <div class="o-think" hidden><i></i><i></i><i></i></div>
          <div class="o-hint" hidden></div>
          <div class="o-gadgets"></div>
          <div class="o-reply"></div>
        </div>
      </section>`;
    const root = $(".o-conv", host);
    const log = $(".o-log", root);
    let hints = lv.hints;
    const t0 = Date.now();
    const timer = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      $$(".o-vc-time", root).forEach((el) => { el.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); });
    }, 1000);
    const reply = ReplyBox($(".o-reply", root), {
      label: "Говорить", placeholder: "или напиши по-английски",
      onStart: () => { const t = $('.o-tile.self', root); if (t) t.classList.add("speaking"); },
      onEnd: () => { const t = $('.o-tile.self', root); if (t) t.classList.remove("speaking"); }
    });
    const scroll = () => { log.scrollTop = log.scrollHeight; };
    root.addEventListener("click", (e) => {
      const rep = e.target.closest("[data-replay]");
      if (rep) { Voice.say(rep.dataset.replay, { who: rep.dataset.who, rate: 0.8 }); return; }
      const rev = e.target.closest("[data-reveal]");
      if (rev && hints > 0) {
        hints -= 1;
        rev.closest(".msg").classList.remove("hidden-text");
        rev.remove();
        $$("[data-reveal]", root).forEach((x) => { x.textContent = `Текст · ${hints}`; if (!hints) x.remove(); });
        return;
      }
      const say = e.target.closest("[data-say]");
      if (say) return Voice.say(say.dataset.say, { who: "guest", rate: 0.9 });
      const g = e.target.closest("[data-gadget]");
      if (g && api.onGadget) api.onGadget(g.dataset.gadget);
    });
    let destroyed = false;
    let gadgetIds = [];
    const moodT = {};
    // Отношение собеседника: тонкая цветная рамка и подпись под фото. Лица — фото, мимика не меняется.
    const MOODS = { happy: ["доволен", "довольна", "ok"], wow: ["удивлён", "удивлена", "ok"], sus: ["насторожился", "насторожилась", "warn"],
      hm: ["не понял", "не поняла", "dim"], angry: ["раздражён", "раздражена", "bad"], sad: ["молчит", "молчит", "dim"] };
    const restMood = () => ((state.heat || 0) >= 60 ? "warn" : "");
    const api = {
      root, reply, onGadget: null,
      destroy() { if (destroyed) return; destroyed = true; clearInterval(timer); Object.values(moodT).forEach(clearTimeout); reply.destroy(); },
      gadgets(ids) {
        if (ids) gadgetIds = ids;
        $(".o-gadgets", root).innerHTML = Gadgets.html(gadgetIds);
      },
      meter(n, total, label) {
        const m = $(".o-meter", root);
        if (!m || total < 3) return;
        m.hidden = false;
        m.innerHTML = `<span>${esc(label || "Разговор")}</span><div>${Array.from({ length: total }, (_, i) => `<i class="${i < n ? "on" : i === n ? "cur" : ""}"></i>`).join("")}</div><b>${Math.min(n, total)}/${total}</b>`;
      },
      // Точка для всплывающих очков: верхняя треть сцены, поверх собеседника.
      anchor() {
        const el = $(".pt", root) || $(".orb", root) || $(".ic-panel", root) || $(".o-call-ava", root) || $(".o-stage", root);
        const r = el.getBoundingClientRect();
        return r.width ? { x: r.left + r.width / 2, y: r.top + r.height * 0.3 } : el;
      },
      // Отношение на время: happy, wow, sus, hm, angry, sad. ms = 0 — оставить.
      mood(who, mood, ms = 1800) {
        if (destroyed) return;
        const card = $(`[data-who="${who}"]`, root), M = MOODS[mood];
        if (!card || !M) return;
        card.dataset.mood = M[2];
        const tag = $(".pt-mood", card);
        if (tag) { tag.hidden = false; tag.textContent = PEOPLE[who].gender === "f" ? M[1] : M[0]; }
        const p = PEOPLE[who];
        const face = p && p.faces && (p.faces[mood] || p.img);
        if (face) $$(`[data-who="${who}"] img`, root).forEach((img) => { img.src = face; });
        clearTimeout(moodT[who]);
        moodT[who] = ms ? setTimeout(() => {
          moodT[who] = 0;
          if (destroyed) return;
          card.dataset.mood = restMood();
          if (tag) tag.hidden = true;
          if (p && p.img) $$(`[data-who="${who}"] img`, root).forEach((img) => { img.src = p.img; });
        }, ms) : -1;
      },
      rest(who) { const card = $(`[data-who="${who}"]`, root); if (card && !destroyed && !moodT[who]) card.dataset.mood = restMood(); },
      react() { /* без эмодзи */ },
      speaking(who, on) {
        $$(`[data-who="${who}"]`, root).forEach((el) => el.classList.toggle("speaking", on));
        root.classList.toggle("talking", on);
        const cc = $(".o-cc", root);
        if (cc && !on) cc.hidden = true;
      },
      npcLine(who, text, { hidden, aside, chatOnly } = {}) {
        const p = PEOPLE[who];
        const ru = p.lang === "ru";
        const el = document.createElement("div");
        el.className = "msg npc" + (hidden ? " hidden-text" : "") + (aside || ru ? " aside" : "");
        const tools = [];
        if (!hidden && !ru) tools.push(`<button data-replay="${esc(text)}" data-who="${who}">Повторить медленно</button>`);
        if (hidden && hints > 0) tools.push(`<button data-reveal>Текст · ${hints}</button>`);
        el.innerHTML = `<div class="msg-who">${esc(p.name)}${ru ? " · чат" : aside ? " · в сторону" : ""}</div>
          <div class="msg-txt">${ru ? esc(text) : enHTML(text)}</div><div class="msg-veil">• • •</div>
          ${tools.length ? `<div class="msg-tools">${tools.join("")}</div>` : ""}`;
        log.appendChild(el);
        scroll();
        if (chatOnly || ru) return;
        const cc = $(".o-cc", root);
        if (cc && lv.subs === "live") { cc.hidden = false; cc.innerHTML = `<b>${esc(p.name)}</b> ${enHTML(text)}`; }
        const bub = $(".o-bubble", root);
        if (bub) {
          api._line = text;
          bub.hidden = false;
          bub.className = "o-bubble" + (hidden ? " veil" : "");
          bub.innerHTML = hidden ? "• • •" : enHTML(text);
          bub.style.animation = "none";
          void bub.offsetWidth;
          bub.style.animation = "";
        }
      },
      revealAll() {
        $$(".msg.hidden-text", root).forEach((m) => m.classList.remove("hidden-text"));
        $$("[data-reveal]", root).forEach((x) => x.remove());
        const bub = $(".o-bubble.veil", root);
        if (bub && api._line) { bub.className = "o-bubble"; bub.innerHTML = enHTML(api._line); }
      },
      playerLine(text) {
        const el = document.createElement("div");
        el.className = "msg me";
        el.innerHTML = `<div class="msg-who">Вы</div><div class="msg-txt">${esc(text)}</div>`;
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
      tip(text) {
        const el = document.createElement("div");
        el.className = "msg tip";
        el.innerHTML = `<b>Как сказать естественнее</b> ${esc(text)}`;
        log.appendChild(el);
        scroll();
      },
      model(text) {
        const el = document.createElement("div");
        el.className = "msg tip model";
        el.innerHTML = `<b>Можно было так</b> <span class="english">${enHTML(text)}</span> <button class="o-mini-play" data-say="${esc(text)}">${ICON.play}</button>`;
        log.appendChild(el);
        scroll();
      },
      phrase(id) {
        const p = Phrases.get(id);
        if (!p) return;
        const el = document.createElement("div");
        el.className = "msg o-phrase-hit";
        el.innerHTML = `<b>Фраза сработала</b> ${esc(p.en)}`;
        log.appendChild(el);
        scroll();
      },
      thinking(on) { $(".o-think", root).hidden = !on; if (on) scroll(); },
      hint(text, o = {}) {
        const h = $(".o-hint", root);
        const parts = [];
        if (text && lv.subs !== "none") parts.push(`<p><b>Подсказка</b> ${esc(val(text, state))}</p>`);
        if (o.topics) {
          parts.push(`<div class="o-checks">${o.topics.filter((t) => t.required || t.offer || o.asked.has(t.id)).map((t) => `<span class="${o.asked.has(t.id) ? "ok" : t.required ? "" : "opt"}">${esc(t.label)}${!t.required && !o.asked.has(t.id) ? " · по желанию" : ""}</span>`).join("")}</div>`);
        }
        if (o.legend && lv.subs !== "none") {
          const c = Leg.city(), j = Leg.job(), rd = Leg.third();
          parts.push(toon
            ? `<div class="o-legmini"><span>Легенда</span> ${esc(c.en)} · ${esc(j.short)} · ${esc(rd.ru || "")} · 2 months</div>`
            : `<div class="o-legmini"><span>Легенда</span> Alex Frost · ${esc(c.en)} · ${esc(j.short)} · ${esc(rd.short || rd.ru || "")}</div>`);
        }
        if (o.read) parts.push(`<p class="o-read"><small>Прочитай вслух</small><span class="english">${enHTML(o.read)}</span></p>`);
        if (o.model && !o.read) parts.push(`<p class="o-example"><small>Пример</small> <span class="english">${esc(o.model)}</span></p>`);
        if (lv.subs !== "live" && text) parts.push(`<small class="muted">Не расслышали? Скажите: «Sorry, could you repeat that?»</small>`);
        h.innerHTML = parts.join("");
        h.hidden = !parts.length;
      },
      notify(text) {
        const n = $(".o-notify", root);
        n.hidden = false;
        n.innerHTML = `<div class="o-notify-ava">${toon ? Toon.owl() : avatar("sova", "sm")}</div><div><b>Сова</b><p>${esc(text)}</p></div>`;
        n.classList.remove("in");
        void n.offsetWidth;
        n.classList.add("in");
        clearTimeout(api._nt);
        api._nt = setTimeout(() => { n.classList.remove("in"); }, 7000);
      },
      flash(f, ms, onShot) {
        return new Promise((resolve) => {
          const box = $(".o-vc-chat", root) || $(".o-stage-extra", root);
          box.hidden = false;
          box.innerHTML = `<div class="o-flash">
            <div class="o-flash-head">${avatar(f.who, "sm")}<b>${esc(PEOPLE[f.who].name)}</b><span>#general</span></div>
            <p class="o-flash-txt">${esc(f.text)}</p>
            <button class="btn small o-shot" data-act="shot">${toon ? "📸 " : ""}Скриншот <kbd>S</kbd></button>
            <i class="o-flash-bar" style="animation-duration:${ms}ms"></i>
          </div>`;
          Sound.sfx("note");
          let shot = false;
          const take = () => {
            if (shot) return;
            shot = true;
            onShot();
            const b = $(".o-shot", box);
            if (b) { b.textContent = "Сохранено в блокнот"; b.disabled = true; }
            box.classList.add("snap");
            setTimeout(() => box.classList.remove("snap"), 300);
          };
          const onKey = (e) => {
            const a = document.activeElement;
            if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA")) return;
            if (e.key === "s" || e.key === "S" || e.key === "ы" || e.key === "Ы") take();
          };
          window.addEventListener("keydown", onKey);
          box.querySelector(".o-shot").addEventListener("click", take);
          setTimeout(() => {
            window.removeEventListener("keydown", onKey);
            box.innerHTML = `<div class="o-flash gone"><div class="o-flash-head">${avatar(f.who, "sm")}<b>${esc(PEOPLE[f.who].name)}</b><span>#general</span></div><p class="o-flash-txt"><i>Сообщение удалено</i></p></div>`;
            setTimeout(() => { box.hidden = true; box.innerHTML = ""; resolve(); }, 1600);
          }, ms);
        });
      },
      extra(html) { const x = $(".o-stage-extra", root); x.innerHTML = html; return x; }
    };
    // Мультяшный сезон: лица меняют выражение, над ними всплывают эмодзи.
    if (toon) Object.assign(api, Toon.convFaces(root, moodT, () => destroyed));
    return api;
  }
};
