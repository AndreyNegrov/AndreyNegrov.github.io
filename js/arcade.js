// Короткие игры на один навык. Работают и в сюжете, и в тренировке.
// Decode — собрать фразу из слов (порядок слов).
// Crack  — записать цифры и буквы на слух.
// Lift   — быстрый ответ под таймером: выбрать естественную реплику.

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const Arcade = {
  // Карточка правил перед игрой. Возвращает, когда игрок нажал кнопку.
  intro(sc, { ico = "target", emo = "", keys = [], btn = "Начать" } = {}) {
    return new Promise((resolve) => {
      const el = document.createElement("div");
      el.className = "a-over";
      el.innerHTML = `<div class="a-rules">
        <i>${(TOON() && emo) || ICON[ico] || ICON.target}</i>
        <p class="kicker">${esc(sc.kicker || "Задание")}</p>
        <h2>${esc(sc.title || "")}</h2>
        <p>${esc(val(sc.intro, state) || "")}</p>
        ${keys.length ? `<ul>${keys.map((k) => `<li>${k}</li>`).join("")}</ul>` : ""}
        <button class="btn primary" data-act="start">${esc(btn)}</button>
      </div>`;
      $("#scene").appendChild(el);
      $("[data-act]", el).addEventListener("click", () => { Sound.sfx("pop"); el.remove(); resolve(); }, { once: true });
    });
  },

  // Итог: оценка из трёх делений, репутация, разбор.
  result(sc, r) {
    return new Promise((resolve) => {
      const pct = r.max ? r.score / r.max : 1;
      const stars = pct >= 0.95 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
      let xp = Math.round(r.xp || 0);
      const daily = sc.training && Profile.markTraining();
      if (daily) xp *= 2;
      if (sc.training) { Profile.stat("trainings"); if (Profile.best(sc.gameId, r.score)) r.record = true; }
      else if (Game.inPlay()) { const st = Mission.stats(); st.games = st.games || {}; st.games[sc.id] = { score: r.score, max: r.max }; Store.save(); }
      const el = document.createElement("div");
      el.className = "a-over";
      const T = TOON();
      const starRow = T
        ? [0, 1, 2].map((i) => `<b class="${i < stars ? "on" : ""}" style="animation-delay:${0.15 + i * 0.22}s">★</b>`).join("")
        : [0, 1, 2].map((i) => `<i class="${i < stars ? "on" : ""}" style="animation-delay:${0.1 + i * 0.16}s">${ICON.starFill}</i>`).join("");
      el.innerHTML = `<div class="a-rules a-result">
        <div class="a-stars">${starRow}</div>
        <h2>${esc(r.title || (stars === 3 ? (T ? "Идеально" : "Чисто") : stars === 2 ? "Хорошо" : "Засчитано"))}</h2>
        <p class="a-score">${esc(r.line || `${r.score} из ${r.max}`)}${r.record ? " <u>рекорд</u>" : ""}</p>
        ${daily ? (T ? '<p class="a-daily">🔥 Тренировка дня: опыт ×2</p>' : '<p class="a-daily">Первая тренировка за день: репутация ×2</p>') : ""}
        ${r.notes && r.notes.length ? `<div class="a-notes">${r.notes.map((n) => `<div>${n}</div>`).join("")}</div>` : ""}
        ${sc.sova ? `<div class="o-sova"><div class="o-sova-ava">${T ? Toon.owl(stars >= 2 ? "happy" : "") : avatar("sova", "sm")}</div><p>${esc(val(sc.sova, state, r))}</p></div>` : ""}
        <div class="row center">
          <button class="btn primary" data-act="next">${sc.training ? "К тренировкам" : "Дальше"}</button>
          ${sc.training ? '<button class="btn ghost" data-act="again">Ещё раз</button>' : ""}
        </div>
      </div>`;
      $("#scene").appendChild(el);
      if (T) { Sound.sfx(stars >= 2 ? "win" : "ok"); if (stars === 3) Juice.confetti({ x: innerWidth / 2, y: innerHeight * 0.4 }, 90); }
      else Sound.sfx(stars >= 2 ? "ok" : "note");
      if (xp) setTimeout(() => Juice.xp(xp, $(".a-stars", el)), 600);
      if (r.badge && stars === 3) setTimeout(() => Juice.badge(r.badge), 800);
      el.addEventListener("click", (e) => {
        const a = e.target.closest("[data-act]");
        if (a) { Voice.stop(); resolve(a.dataset.act); }
      });
    });
  },

  // Полоса времени. onEnd — когда время вышло.
  timer(bar, seconds, onEnd) {
    let left = seconds * 1000, last = performance.now(), dead = false, paused = false;
    const tick = (t) => {
      if (dead) return;
      const dt = t - last;
      last = t;
      if (!paused && !Game.paused) left -= dt;
      if (bar && bar.isConnected) { bar.style.width = clamp((left / (seconds * 1000)) * 100, 0, 100) + "%"; bar.parentElement.classList.toggle("low", left < 5000); }
      if (left <= 0) { dead = true; onEnd(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return { stop() { dead = true; }, pause(v) { paused = v; last = performance.now(); }, add(s) { left = Math.max(0, left + s * 1000); }, left: () => left / 1000 };
  }
};

// ───────── шифровка: собери фразу ─────────
const Decode = {
  async run(sc, tok) {
    $("#scene").innerHTML = `<section class="a-game a-decode"><div class="a-card"></div></section>`;
    const card = $(".a-card");
    Music.play("calm");
    await Arcade.intro(sc, { ico: "cipher", emo: "🧩", keys: sc.keys || ["Нажимай слова по порядку", "Лишние слова — ловушки", "Фразу можно прослушать"] });
    if (tok.dead) return null;
    const lv = level();
    const items = val(sc.items, state);
    let score = 0, xp = 0, clean = 0;
    const notes = [];
    for (let i = 0; i < items.length; i++) {
      const r = await this.item(sc, tok, card, items[i], i, items.length, lv);
      if (tok.dead) return null;
      score += r.points;
      xp += r.points >= 100 ? 14 : r.points > 0 ? 9 : 2;
      if (r.points >= 100) clean += 1;
      notes.push(`<b class="english">${esc(items[i].en)}</b><span>${esc(items[i].ru)}</span>`);
      if (items[i].phrase) Phrases.unlock(items[i].phrase);
    }
    Music.stop();
    const act = await Arcade.result(sc, { score, max: items.length * 100, xp, notes, line: `${TOON() ? "Чисто собрано" : "Собрано без ошибок"}: ${clean} из ${items.length}`, badge: sc.badge });
    return act === "again" ? { again: true } : null;
  },

  item(sc, tok, card, it, idx, total, lv) {
    return new Promise((resolve) => {
      const words = it.en.split(/\s+/);
      const tiles = shuffle([...words.map((w) => ({ w })), ...(it.extra || []).map((w) => ({ w }))]);
      let pos = 0, lives = 3, done = false, heard = 0;
      const T = TOON();
      card.innerHTML = T ? `
        <header class="a-top"><span class="a-kicker">Шифровка ${idx + 1} из ${total}</span><div class="a-hearts"></div></header>
        <div class="a-timer"><i></i></div>
        <div class="a-prompt"><div class="a-ava">${Face.svg("owl")}</div><p><small>Собери по-английски</small>«${esc(it.ru)}»</p></div>
        <div class="a-line"></div>
        <div class="a-tiles">${tiles.map((t, k) => `<button class="a-tile" data-k="${k}">${esc(t.w)}</button>`).join("")}</div>
        <footer class="a-foot"><button class="btn ghost small" data-act="hear">🔊 Послушать</button><span class="muted small">Ошибка стоит сердечко. Три ошибки — покажу ответ.</span></footer>` : `
        <header class="a-top"><span class="a-kicker">Фраза ${idx + 1} из ${total}</span><div class="a-hearts"></div></header>
        <div class="a-timer"><i></i></div>
        <div class="a-prompt"><p><small>Собери по-английски</small>${esc(it.ru)}</p></div>
        <div class="a-line"></div>
        <div class="a-tiles">${tiles.map((t, k) => `<button class="a-tile" data-k="${k}">${esc(t.w)}</button>`).join("")}</div>
        <footer class="a-foot"><button class="btn ghost small" data-act="hear">${ICON.play} Послушать</button><span class="muted small">Три ошибки — покажу ответ.</span></footer>`;
      const line = $(".a-line", card), hearts = $(".a-hearts", card);
      const draw = () => {
        line.innerHTML = words.map((w, i) => (i < pos ? `<b>${esc(w)}</b>` : `<i></i>`)).join("");
        hearts.innerHTML = [0, 1, 2].map((i) => `<span class="${i < lives ? "on" : ""}">${T ? "♥" : ""}</span>`).join("");
      };
      draw();
      const finish = async (ok) => {
        if (done) return;
        done = true;
        timer.stop();
        card.removeEventListener("click", onClick);
        pos = words.length;
        draw();
        line.classList.add(ok ? "ok" : "bad");
        $$(".a-tile", card).forEach((b) => { b.disabled = true; });
        const mistakes = 3 - lives;
        const points = ok ? Math.max(40, 100 - mistakes * 20 - heard * 5) : 0;
        Sound.sfx(ok ? (mistakes ? "ok" : "combo") : "wrong");
        if (T) { if (ok) { Juice.sparks(line, "#3de0a8", 18); Juice.float(mistakes ? "Собрано" : "Чисто!", line, "ok big"); } else Juice.float("Вот как надо", line, "bad"); }
        await raceDead(tok, Promise.race([Voice.sayAsync(it.en, { who: "guest", rate: 0.9 }), sleep(4200)]));
        await sleep(ok ? 500 : 1300);
        resolve({ points });
      };
      const timer = Arcade.timer($(".a-timer i", card), (it.secs || sc.secs || 40) * (lv.subs === "live" ? 1.3 : 1), () => finish(false));
      const onClick = (e) => {
        if (done || tok.dead) return;
        if (e.target.closest('[data-act="hear"]')) { heard += 1; Voice.say(it.en, { who: "guest", rate: 0.85 }); return; }
        const b = e.target.closest(".a-tile");
        if (!b || b.disabled) return;
        const t = tiles[Number(b.dataset.k)];
        if (norm(t.w) === norm(words[pos])) {
          b.disabled = true;
          b.classList.add("used");
          Sound.note(392 * Math.pow(2, (pos * 2) / 12), 0.13);
          pos += 1;
          draw();
          if (pos >= words.length) finish(true);
        } else {
          lives -= 1;
          Sound.sfx("wrong");
          b.classList.remove("no");
          void b.offsetWidth;
          b.classList.add("no");
          draw();
          if (lives <= 0) finish(false);
        }
      };
      card.addEventListener("click", onClick);
      Game.onLeave(() => { timer.stop(); done = true; });
    });
  }
};

// ───────── цифры и буквы на слух ─────────
const Crack = {
  async run(sc, tok) {
    $("#scene").innerHTML = `<section class="a-game a-crack"><div class="a-card"></div></section>`;
    const card = $(".a-card");
    await Arcade.intro(sc, { ico: "wave", emo: "📼", keys: sc.keys || ["Слушай и набирай", "Можно повторить и замедлить", "Клавиатура тоже работает"] });
    if (tok.dead) return null;
    const lv = level();
    const items = val(sc.items, state);
    let score = 0, xp = 0, clean = 0;
    const log = [];
    for (let i = 0; i < items.length; i++) {
      const r = await this.item(sc, tok, card, items[i], i, items.length, lv, log);
      if (tok.dead) return null;
      score += r.points;
      xp += r.points >= 100 ? 16 : r.points > 0 ? 10 : 2;
      if (r.points >= 100) clean += 1;
      log.push({ it: items[i], ok: r.points > 0 });
    }
    if (sc.done) sc.done(state, { score, clean, total: items.length });
    Store.save();
    const notes = items.map((it) => `<b class="english">${esc(it.say)}</b><span>${esc(it.tip || it.note || "")}</span>`);
    const act = await Arcade.result(sc, { score, max: items.length * 100, xp, notes, line: `С первого раза: ${clean} из ${items.length}`, badge: sc.badge });
    return act === "again" ? { again: true } : null;
  },

  item(sc, tok, card, it, idx, total, lv, log) {
    return new Promise((resolve) => {
      // fields: [[подпись, значение, разделитель]] — значение из цифр и/или букв.
      const fields = it.fields.map((f) => ({ label: f[0], value: String(f[1]).toUpperCase(), sep: f[2] || "" }));
      const cells = [];
      fields.forEach((f, fi) => [...f.value].forEach((ch, ci) => cells.push({ fi, ci, ch, v: "" })));
      const all = fields.map((f) => f.value).join("");
      const kind = /^[0-9]+$/.test(all) ? "num" : /^[A-Z]+$/.test(all) ? "abc" : "mix";
      const keys = kind === "num" ? "123456789" : kind === "abc" ? "QWERTYUIOPASDFGHJKLZXCVBNM" : "1234567890ABCD";
      let cur = 0, mistakes = 0, replays = 0, done = false, busy = false;
      const who = it.who || sc.who || "guest";
      const T = TOON();
      card.innerHTML = `
        <header class="a-top"><span class="a-kicker">${esc(sc.label || "Запись")} ${idx + 1} из ${total}</span><span class="a-kicker dim">${esc(PEOPLE[who] ? PEOPLE[who].name : "")}</span></header>
        <div class="a-tape">${T
          ? `<div class="a-reel"></div><div class="a-wave">${"<i></i>".repeat(18)}</div><div class="a-reel"></div>
          <div class="a-tape-btns"><button class="btn small" data-act="play">▶ Ещё раз</button><button class="btn ghost small" data-act="slow">🐢 Медленно</button></div>`
          : `<div class="a-wave">${"<i></i>".repeat(28)}</div>
          <div class="a-tape-btns"><button class="btn small" data-act="play">${ICON.play} Ещё раз</button><button class="btn ghost small" data-act="slow">Медленно</button></div>`}
        </div>
        <div class="a-fields"></div>
        <div class="a-pad k-${kind}${T && kind === "abc" ? " abc" : ""}">${keys.split("").map((k) => `<button data-k="${k}">${k}</button>`).join("")}<button data-k="back" class="wide">⌫</button>${kind === "num" ? '<button data-k="0">0</button>' : ""}<button data-act="skip" class="wide dim">Не знаю</button></div>
        <div class="a-loglist">${log.map((l) => `<div class="${l.ok ? "ok" : "bad"}">${esc(l.it.note || l.it.say)}</div>`).join("")}</div>`;
      const box = $(".a-fields", card), tape = $(".a-tape", card);
      const draw = (flash) => {
        box.innerHTML = fields.map((f, fi) => `<div class="a-field"><span>${esc(f.label)}</span><div>${cells.map((c, k) => (c.fi !== fi ? "" :
          `${f.sep && c.ci === f.value.length - 2 && f.value.length === 4 ? `<em>${esc(f.sep)}</em>` : ""}<b class="${k === cur && !done ? "cur" : ""} ${flash && flash[k] ? flash[k] : ""}">${esc(c.v)}</b>`)).join("")}</div></div>`).join("");
      };
      draw();
      const speak = async (rate) => {
        if (busy || done) return;
        busy = true;
        tape.classList.add("on");
        await raceDead(tok, Voice.sayAsync(it.say, { who, rate }));
        tape.classList.remove("on");
        busy = false;
      };
      const finish = async (ok) => {
        if (done) return;
        done = true;
        window.removeEventListener("keydown", onKey);
        cells.forEach((c) => { c.v = c.ch; });
        draw(cells.map(() => (ok ? "ok" : "show")));
        const points = ok ? Math.max(30, 100 - mistakes * 25 - Math.max(0, replays - 1) * 8) : 0;
        Sound.sfx(ok ? (mistakes ? "ok" : "combo") : "wrong");
        if (ok) Juice.hit(box, { first: !mistakes, base: 6 });
        if (ok && T) Juice.float(mistakes ? "Записано" : "С первого раза!", box, "ok big");
        const row = document.createElement("div");
        row.className = ok ? "ok" : "bad";
        row.innerHTML = `${esc(it.note || "")}${lv.subs !== "none" ? ` <span class="english">${enHTML(it.say)}</span>${it.tip ? ` <em>${esc(it.tip)}</em>` : ""}` : ""}`;
        $(".a-loglist", card).prepend(row);
        await sleep(ok ? 1500 : 2600);
        resolve({ points });
      };
      const check = () => {
        const wrong = cells.map((c) => c.v !== c.ch);
        if (!wrong.some(Boolean)) return finish(true);
        mistakes += 1;
        Sound.sfx("wrong");
        Juice.miss();
        Juice.shake(box);
        draw(wrong.map((w) => (w ? "no" : "ok")));
        if (mistakes >= 3) return setTimeout(() => finish(false), 500);
        setTimeout(() => {
          if (done) return;
          cells.forEach((c, k) => { if (wrong[k]) c.v = ""; });
          cur = cells.findIndex((c) => !c.v);
          draw();
          speak(0.8);
        }, 650);
      };
      const press = (k) => {
        if (done || tok.dead) return;
        if (k === "back") {
          let i = cur > 0 && (cur >= cells.length || !cells[cur].v) ? cur - 1 : cur;
          while (i > 0 && !cells[i].v) i -= 1;
          cells[i].v = "";
          cur = i;
          Sound.sfx("tick");
          return draw();
        }
        if (cur >= cells.length) return;
        cells[cur].v = k;
        Sound.sfx("key");
        let n = cells.findIndex((c, i) => i > cur && !c.v);
        if (n < 0) n = cells.findIndex((c) => !c.v);
        cur = n < 0 ? cells.length : n;
        draw();
        if (n < 0) check();
      };
      const onKey = (e) => {
        if (Game.paused || !$("#modal").hidden) return;
        const k = e.key.toUpperCase();
        if (e.key === "Backspace") { e.preventDefault(); return press("back"); }
        if (k.length === 1 && (keys.includes(k) || (kind === "num" && k === "0"))) press(k);
      };
      window.addEventListener("keydown", onKey);
      Game.onLeave(() => window.removeEventListener("keydown", onKey));
      card.onclick = (e) => {
        const a = e.target.closest("[data-act]");
        if (a && a.dataset.act === "play") { replays += 1; return speak(1); }
        if (a && a.dataset.act === "slow") { replays += 1; return speak(0.7); }
        if (a && a.dataset.act === "skip") return finish(false);
        const b = e.target.closest("[data-k]");
        if (b) press(b.dataset.k);
      };
      setTimeout(() => speak(1), 500);
    });
  }
};

// ───────── быстрый ответ под таймером ─────────
// skin: "call" — звонок ассистента; иначе разговор с человеком лицом к лицу.
const Lift = {
  async run(sc, tok) {
    const who = sc.who || "kit";
    const p = PEOPLE[who];
    const items = val(sc.items, state);
    const lv = level();
    const unit = sc.unit || "Реплика";
    $("#scene").innerHTML = `
      <section class="a-game a-lift">
        <div class="lf-stage" data-who="${who}">
          ${p.img ? `<div class="pt lf-pt"><img src="${p.img}" alt=""><i class="pt-ring"></i></div>` : `<div class="orb"><i></i><i></i><i></i><b>${esc(p.initial || p.name[0])}</b></div>`}
          <div class="o-plate"><b>${esc(p.name)}</b><span>${esc(p.role)}</span></div>
          <div class="o-bubble" hidden></div>
        </div>
        <div class="a-card lift-side">
          <header class="a-top"><span class="a-kicker">${esc(unit)} <b class="lift-n">1</b> из ${items.length}</span><div class="lift-awk" title="Промахи"></div></header>
          <div class="a-timer"><i></i></div>
          <p class="lift-q muted">…</p>
          <div class="lift-opts"></div>
          <p class="muted small lift-tip">${Mic.supported() ? "Клавиши 1–3. Или держи пробел и скажи ответ вслух — за голос репутации больше." : "Клавиши 1, 2, 3 тоже работают."}</p>
        </div>
      </section>`;
    const root = $(".a-lift"), bub = $(".o-bubble", root), opts = $(".lift-opts", root);
    let awkward = 0, right = 0, voiceHits = 0, n = 0;
    const drawAwk = () => { $(".lift-awk", root).innerHTML = items.map((_, i) => `<i class="${i < awkward ? "on" : ""}"></i>`).join(""); };
    drawAwk();
    await Arcade.intro(sc, { ico: sc.skin === "call" ? "headset" : "chat", keys: sc.keys || ["Выбери естественный ответ", "Не успел(а) — засчитают паузу", "Можно ответить голосом"] });
    if (tok.dead) return null;
    const notes = [];
    for (const it of items) {
      if (tok.dead) return null;
      n += 1;
      $(".lift-n", root).textContent = String(n);
      const ok = await this.turn(sc, tok, root, it, who, lv, (v) => { if (v) voiceHits += 1; });
      if (tok.dead) return null;
      if (ok) right += 1; else { awkward += 1; drawAwk(); }
      notes.push(`<b class="english">${esc(it.say)}</b><span class="english">→ ${esc(it.right)}</span>`);
      opts.innerHTML = "";
      await sleep(350);
      if (Game.inPlay() && Heat.over()) return { fail: sc.failText || "Слишком много лишнего в ответах. Тебя отметили." };
    }
    bub.hidden = true;
    if (sc.done) sc.done(state, { right, total: items.length });
    const xp = right * 10 + voiceHits * 5;
    const act = await Arcade.result(sc, { score: right, max: items.length, xp, notes: notes.slice(0, 6), line: awkward ? `Промахов: ${awkward} из ${items.length}` : "Ни одного промаха", badge: sc.badge });
    return act === "again" ? { again: true } : null;
  },

  turn(sc, tok, root, it, who, lv, onVoice) {
    return new Promise((resolve) => {
      const bub = $(".o-bubble", root), box = $(".lift-opts", root), q = $(".lift-q", root), stage = $(".lf-stage", root);
      const norm1 = (x) => (typeof x === "string" ? { t: x } : x);
      const list = shuffle([{ t: it.right, ok: true }, ...it.wrong.map(norm1)]);
      let done = false, timer = null, handler = null;
      const showLine = (reveal) => {
        bub.hidden = false;
        bub.className = "o-bubble" + (reveal ? "" : " veil");
        bub.innerHTML = reveal ? enHTML(it.say) : "• • •";
      };
      showLine(lv.subs === "live");
      q.textContent = "Что ответишь?";
      box.innerHTML = list.map((o, i) => `<button class="lift-opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.t)}</span></button>`).join("");
      stage.classList.add("speaking");
      const cleanup = () => {
        window.removeEventListener("keydown", onKey);
        if (handler) { PTT.unbind(handler); Mic.abort(); }
        if (timer) timer.stop();
      };
      const pick = async (i, viaVoice) => {
        if (done) return;
        done = true;
        cleanup();
        Voice.stop();
        stage.classList.remove("speaking");
        showLine(true);
        const o = i == null ? null : list[i];
        const ok = !!(o && o.ok);
        $$(".lift-opt", box).forEach((b, k) => { b.disabled = true; b.classList.add(list[k].ok ? "right" : k === i ? "wrong" : "dim"); });
        if (ok) {
          Juice.hit(stage, { first: true, voice: viaVoice, base: 6 });
          if (viaVoice) onVoice(true);
          q.textContent = "Принято.";
          if (it.back) await raceDead(tok, Promise.race([Voice.sayAsync(it.back, { who }), sleep(3000)]));
          else await sleep(650);
        } else {
          Juice.miss();
          Sound.sfx("awkward");
          q.textContent = it.why || "Так не отвечают. Верный вариант подсвечен.";
          if (o && o.heat && Game.inPlay()) Heat.add(o.heat, "лишнее в разговоре");
          await sleep(2300);
        }
        resolve(ok);
      };
      const onKey = (e) => {
        if (Game.paused || !$("#modal").hidden) return;
        if (/^[1-3]$/.test(e.key) && list[Number(e.key) - 1]) pick(Number(e.key) - 1, false);
      };
      window.addEventListener("keydown", onKey);
      box.onclick = (e) => { const b = e.target.closest(".lift-opt"); if (b) pick(Number(b.dataset.i), false); };
      if (Mic.supported()) {
        handler = {
          start() { Voice.stop(); Sound.sfx("ptt-on"); Mic.start(); root.classList.add("mic"); },
          async end() {
            root.classList.remove("mic");
            Sound.sfx("ptt-off");
            const said = norm(await Mic.stop());
            if (!said || done) return;
            const sw = new Set(said.split(" "));
            let best = -1, bestScore = 0;
            list.forEach((o, i) => {
              const ws = norm(o.t).split(" ");
              const s = ws.filter((w) => sw.has(w)).length / ws.length;
              if (s > bestScore) { bestScore = s; best = i; }
            });
            if (bestScore >= 0.6) pick(best, true);
            else UI.toast("Не разобрал. Скажи вариант целиком или нажми на него.", "info");
          }
        };
        PTT.bind(handler);
      }
      Game.onLeave(() => { done = true; cleanup(); });
      Voice.sayAsync(it.say, { who, fx: sc.skin === "call" ? "phone" : "clean" }).then(() => {
        stage.classList.remove("speaking");
        if (done || tok.dead) return;
        timer = Arcade.timer($(".a-timer i", root), (sc.secs || 7) * (lv.subs === "live" ? 1.25 : lv.subs === "none" ? 0.85 : 1), () => pick(null, false));
      });
    });
  }
};
