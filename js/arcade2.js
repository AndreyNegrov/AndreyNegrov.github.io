// Search    — осмотр предмета или места по схеме: каждая часть называет себя по-английски, в некоторых есть находки.
// Caseboard — доска: разложить факты по людям и назвать главного.
// Echo      — повторить фразу на слух (тренировка).
// Arcade.hub / Arcade.collection — тренировки и личное дело курьера.

const Search = {
  async run(sc, tok) {
    const lv = level();
    const words = sc.words || {};
    const secrets = sc.secrets || {};
    const tasks = sc.tasks || [];
    $("#scene").innerHTML = `
      <section class="a-game a-search">
        <div class="s-stage"><div class="s-frame">${sc.svg()}<div class="s-label" hidden></div></div></div>
        <aside class="a-card s-side">
          <header class="a-top"><span class="a-kicker">${esc(sc.kicker || "Осмотр")}</span><span class="s-clock"></span></header>
          <div class="a-timer"><i></i></div>
          <div class="s-log"></div>
          <div class="s-word muted small">Нажимай на части схемы — узнаешь, как они называются.</div>
          <footer><span class="s-count muted small"></span><button class="btn primary small" data-act="leave">${esc(sc.leave || "Закончить")}</button></footer>
        </aside>
      </section>`;
    const root = $(".a-search"), log = $(".s-log", root), frame = $(".s-frame", root);
    Music.play("tense");
    await Arcade.intro(sc, { ico: "eye", keys: sc.keys || ["Нажимай на части схемы", "Каждая называет себя по-английски", "Время идёт"] });
    if (tok.dead) return null;
    const S = { step: 0, found: 0, words: new Set(), seen: new Set(), open: false, ended: false };
    const bubble = (html, cls) => { const el = document.createElement("div"); el.className = "o-bub " + cls; el.innerHTML = html; log.appendChild(el); log.scrollTop = log.scrollHeight; return el; };
    const count = () => { $(".s-count", root).textContent = `Слова: ${S.words.size} из ${Object.keys(words).length}`; };
    count();
    let resolveEnd;
    const ended = new Promise((r) => { resolveEnd = r; });
    const end = (why) => { if (S.ended) return; S.ended = true; timer.stop(); resolveEnd(why); };
    const total = (sc.seconds || 70) * (lv.subs === "live" ? 1.25 : 1);
    const timer = Arcade.timer($(".a-timer i", root), total, () => end("time"));
    const clock = setInterval(() => { const s = Math.max(0, Math.ceil(timer.left())); const c = $(".s-clock", root); if (c) c.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 250);
    Game.onLeave(() => { clearInterval(clock); timer.stop(); S.ended = true; });

    const label = (g, id) => {
      const w = words[id];
      if (!w) return;
      const l = $(".s-label", root), fr = frame.getBoundingClientRect(), r = g.getBoundingClientRect();
      l.hidden = false;
      l.innerHTML = `<b>${esc(w[0])}</b><span>${esc(w[1])}</span>`;
      l.style.left = clamp(r.left + r.width / 2 - fr.left, 80, fr.width - 80) + "px";
      l.style.top = Math.max(10, r.top - fr.top - 6) + "px";
      $(".s-word", root).innerHTML = `<b class="english">${esc(w[0])}</b> — ${esc(w[1])}`;
      if (!S.words.has(id)) { S.words.add(id); count(); Juice.xp(2); }
      if (!Voice.busy()) Voice.say(w[0], { who: "guest", rate: 0.85 });
    };
    const reveal = (html, { live = false, btn = "Дальше" } = {}) => new Promise((res) => {
      const el = document.createElement("div");
      el.className = "o-find";
      el.innerHTML = `<div class="o-find-card">${html}<button class="btn primary" data-act="ok">${esc(btn)}</button></div>`;
      root.appendChild(el);
      if (!live) timer.pause(true);
      const done = () => { el.remove(); if (!live) timer.pause(false); res(); };
      $("[data-act]", el).addEventListener("click", done, { once: true });
      ended.then(() => { if (el.isConnected) { el.remove(); res(); } });
    });
    const say = async (text, who) => {
      bubble(`${lv.subs === "live" ? enHTML(text) : `<span class="s-veil">голосовое · <button class="s-show">показать текст</button></span><span class="s-hid" hidden>${enHTML(text)}</span>`}`, "them en");
      Sound.sfx("note");
      timer.pause(true);
      await raceDead(tok, Voice.sayAsync(text, { who }));
      timer.pause(false);
    };
    const next = async () => {
      const t = tasks[S.step];
      if (!t) return;
      if (t.me) { bubble(esc(t.me), "me"); await sleep(500); }
      if (tok.dead || S.ended) return;
      await say(t.say, sc.who || "guest");
    };
    let busy = false;
    const onClick = async (e) => {
      const sh = e.target.closest(".s-show");
      if (sh) { const b = sh.closest(".o-bub"); $(".s-veil", b).hidden = true; $(".s-hid", b).hidden = false; return; }
      if (e.target.closest('[data-act="leave"]')) return end("left");
      const g = e.target.closest(".s-obj");
      if (!g || busy || S.ended || tok.dead) return;
      const id = g.dataset.id;
      label(g, id);
      const t = tasks[S.step];
      if (t && id === t.target) {
        busy = true;
        S.step += 1; S.found += 1;
        g.classList.add("done");
        Juice.hit(g, { first: true, base: 8 });
        if (t.item) Notes.add({ kind: "item", src: "item", scene: sc.id, time: sc.time || "", text: t.item });
        await reveal(`<h3>${esc(t.title)}</h3>${t.html}<p class="o-find-q">${esc(t.ru)}</p>`);
        busy = false;
        if (!S.ended && !tok.dead) await next();
        return;
      }
      const x = secrets[id];
      if (!x || S.seen.has(id)) { Sound.sfx("pop"); return; }
      busy = true;
      if (x.slow) { g.classList.add("opening"); Sound.sfx("drawer"); await sleep(x.slow); g.classList.remove("opening"); }
      if (S.ended) { busy = false; return; }
      S.seen.add(id);
      g.classList.add("done");
      if (x.flag) state.flags[x.flag] = true;
      (x.clues || []).forEach((c) => Clues.add(c));
      if (x.heat) Heat.add(x.heat, "пломба сработала");
      if (x.badge && !state.flags.sealBroken) Juice.badge(x.badge);
      S.open = true;
      await reveal(x.html, { live: true, btn: "Понятно" });
      S.open = false;
      busy = false;
    };
    root.addEventListener("click", onClick);
    await next();
    await raceDead(tok, ended);
    clearInterval(clock);
    root.removeEventListener("click", onClick);
    if (tok.dead) return null;
    Music.stop();
    Voice.stop();
    if (sc.done) sc.done(state, S);
    Store.save();
    if (Heat.over()) return { fail: sc.failText || Pack.meta().searchFail || "Kit получила сигнал от пломбы — и не один. Заказ у тебя забрали." };
    const need = tasks.filter((t) => t.target).length;
    const max = need + Object.keys(secrets).length;
    const notes = Object.entries(words).filter(([id]) => S.words.has(id)).map(([, w]) => `<b class="english">${esc(w[0])}</b><span>${esc(w[1])}</span>`);
    const act = await Arcade.result(sc, { score: S.found + S.seen.size, max, xp: S.found * 8 + S.seen.size * 6, notes, title: "Осмотр окончен", line: `Осмотрено: ${S.seen.size + S.found} из ${max} · слов: ${S.words.size}` });
    return act === "again" ? { again: true } : null;
  }
};

// ───────── доска ─────────
const Caseboard = {
  async run(sc, tok) {
    const suspects = sc.suspects;
    const cards = shuffle(val(sc.cards, state)).map((c) => ({ ...c, mine: !c.clue || Clues.has(c.clue) }));
    $("#scene").innerHTML = `
      <section class="a-game a-board">
        <div class="cb-board n${suspects.length}">
          <div class="cb-title english">${esc(sc.boardTitle || "")}</div>
          <div class="cb-cols">${suspects.map((w, i) => `
            <div class="cb-col" data-who="${w}">
              <button class="cb-photo" data-who="${w}">${avatar(w, "cb-face")}<b>${esc(PEOPLE[w].name)}</b><kbd>${i + 1}</kbd></button>
              <div class="cb-notes"></div>
            </div>`).join("")}</div>
        </div>
        <aside class="a-card cb-side">
          <header class="a-top"><span class="a-kicker">Факт <b class="cb-n">1</b> из ${cards.length}</span><span class="a-kicker dim cb-miss"></span></header>
          <div class="cb-card"></div>
          <p class="muted small cb-tip">Прочитай карточку и нажми на того, о ком она. Клавиши 1–${suspects.length}.</p>
        </aside>
      </section>`;
    const root = $(".a-board");
    Music.play("calm");
    await Arcade.intro(sc, { ico: "board", keys: ["Карточка — факт по-английски", "Нажми на того, о ком она", "В конце — главный вопрос"] });
    if (tok.dead) return null;
    let mistakes = 0, xp = 0, i = 0;
    const showCard = () => {
      const c = cards[i];
      $(".cb-n", root).textContent = String(i + 1);
      $(".cb-card", root).innerHTML = `<div class="cb-paper"><p class="english">${enHTML(c.en)}</p>
        <button class="cb-ru" data-act="ru">по-русски</button><em hidden>${esc(c.ru)}</em>${c.mine ? "" : "<small>от Совы — ты этого не узнал(а) сам(а)</small>"}</div>`;
      Sound.sfx("whoosh");
    };
    showCard();
    let off = () => {};
    const pinned = await new Promise((resolve) => {
      const choose = (who) => {
        const c = cards[i];
        if (!c || tok.dead) return;
        const col = $(`.cb-col[data-who="${who}"]`, root);
        if (who !== c.who) {
          mistakes += 1;
          Sound.sfx("wrong");
          Juice.shake($(".cb-paper", root));
          Juice.miss();
          $(".cb-miss", root).textContent = `ошибок: ${mistakes}`;
          $(".cb-tip", root).textContent = "Не сходится. Нажми «по-русски», если непонятно.";
          return;
        }
        const note = document.createElement("div");
        note.className = "cb-note";
        note.textContent = c.en;
        $(".cb-notes", col).appendChild(note);
        Sound.sfx("pin");
        if (c.mine) xp += 4;
        Juice.hit(note, { first: true, base: 2 });
        i += 1;
        if (i >= cards.length) return resolve(true);
        showCard();
      };
      const onKey = (e) => { if (!Game.paused && $("#modal").hidden && /^[1-9]$/.test(e.key) && suspects[Number(e.key) - 1]) choose(suspects[Number(e.key) - 1]); };
      window.addEventListener("keydown", onKey);
      off = () => window.removeEventListener("keydown", onKey);
      Game.onLeave(off);
      root.onclick = (e) => {
        if (e.target.closest('[data-act="ru"]')) { const em = $(".cb-paper em", root); em.hidden = !em.hidden; return; }
        const p = e.target.closest(".cb-photo");
        if (p) choose(p.dataset.who);
      };
    });
    off();
    if (tok.dead || !pinned) return null;
    $(".cb-side", root).innerHTML = `<header class="a-top"><span class="a-kicker">Вывод</span></header>
      <div class="cb-card"><div class="cb-paper q"><p class="english">${enHTML(sc.question)}</p><em>${esc(sc.questionRu)}</em></div></div>
      <p class="muted small cb-tip">Посмотри на доску и нажми на человека.</p>`;
    root.classList.add("final");
    await new Promise((resolve) => {
      root.onclick = (e) => {
        const p = e.target.closest(".cb-photo");
        if (!p) return;
        if (p.dataset.who !== sc.answer) {
          mistakes += 1;
          Sound.sfx("wrong");
          Juice.shake(p);
          $(".cb-tip", root).textContent = sc.nudge || "Не сходится. Посмотри, у кого больше всего фактов.";
          return;
        }
        p.classList.add("mole");
        const st = document.createElement("span");
        st.className = "cb-stamp";
        st.textContent = sc.stamp || "THE TOP";
        p.appendChild(st);
        Sound.sfx("stamp");
        root.onclick = null;
        setTimeout(resolve, 1300);
      };
      Game.onLeave(() => resolve());
    });
    if (tok.dead) return null;
    Music.stop();
    state.flags.boardDone = true;
    Store.save();
    const max = cards.length + 1;
    const act = await Arcade.result(sc, { score: Math.max(1, max - mistakes), max, xp: xp + 20, line: mistakes ? `Ошибок: ${mistakes}` : "Ни одной ошибки",
      notes: cards.filter((c) => c.who === sc.answer).map((c) => `<b class="english">${esc(c.en)}</b><span>${esc(c.ru)}</span>`), badge: "sleuth" });
    return act === "again" ? { again: true } : null;
  }
};

// ───────── эхо: повторить на слух ─────────
const Echo = {
  async run(sc, tok) {
    const items = val(sc.items, state);
    $("#scene").innerHTML = `<section class="a-game a-echo"><div class="a-card">
      <header class="a-top"><span class="a-kicker">Фраза <b class="e-n">1</b> из ${items.length}</span></header>
      <div class="e-stage"><button class="e-play" data-act="play">${ICON.play}</button><p class="e-hint muted">Послушай и повтори вслух. Или напиши, что услышал(а).</p><div class="e-out"></div></div>
      <div class="e-reply"></div>
    </div></section>`;
    const root = $(".a-echo");
    await Arcade.intro(sc, { ico: "wave", keys: ["Послушай фразу", "Повтори голосом или напиши", "Сравним слово в слово"] });
    if (tok.dead) return null;
    const reply = ReplyBox($(".e-reply", root), { label: "Повторить", placeholder: "что прозвучало? Enter" });
    Game.onLeave(() => reply.destroy());
    let score = 0, perfect = 0, xp = 0;
    const notes = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      $(".e-n", root).textContent = String(i + 1);
      $(".e-out", root).innerHTML = "";
      const who = it.who || "guest";
      root.onclick = (e) => { if (e.target.closest('[data-act="play"]')) Voice.say(it.en, { who, rate: 0.8 }); };
      await raceDead(tok, Voice.sayAsync(it.en, { who, rate: 0.95 }));
      if (tok.dead) return null;
      const text = await raceDead(tok, reply.wait());
      if (tok.dead || text == null) return null;
      const want = norm(it.en).split(" "), pool = norm(text).split(" ");
      const marks = want.map((w) => { const k = pool.indexOf(w); if (k >= 0) { pool.splice(k, 1); return true; } return false; });
      const pct = marks.filter(Boolean).length / want.length;
      const words = it.en.split(/\s+/);
      $(".e-out", root).innerHTML = `<p class="e-line english">${words.map((w, k) => `<span class="${marks[k] ? "ok" : "no"}">${esc(w)}</span>`).join(" ")}</p><p class="muted">${esc(it.ru || "")}</p><p class="e-you">Ты: ${esc(text)}</p>`;
      score += Math.round(pct * 100);
      if (pct === 1) { perfect += 1; Juice.hit($(".e-out", root), { first: true, voice: ReplyBox.via === "voice", base: 8 }); }
      else if (pct >= 0.6) { Sound.sfx("ok"); Juice.xp(6, $(".e-out", root)); Juice.miss(); }
      else { Sound.sfx("wrong"); Juice.miss(); }
      xp += pct === 1 ? 4 : 0;
      notes.push(`<b class="english">${esc(it.en)}</b><span>${esc(it.ru || "")}</span>`);
      await sleep(pct === 1 ? 1300 : 2600);
    }
    reply.destroy();
    if (perfect === items.length) Juice.badge("echo");
    const act = await Arcade.result(sc, { score, max: items.length * 100, xp, notes, line: `Слово в слово: ${perfect} из ${items.length}` });
    return act === "again" ? { again: true } : null;
  }
};

// ───────── материал для тренировок ─────────
const TRAIN = {
  who: ["rita", "cole", "dana", "vale", "kit"],
  decode: [
    ["Здравствуйте, доставка для Сэма.", "Hi, I have a delivery for Sam.", ["am", "to"]],
    ["Какая у вас квартира?", "Which flat is it, please?", ["are", "what"]],
    ["Одной позиции не хватает.", "One item is missing from the order.", ["are", "of"]],
    ["Я у двери. Домофон не работает.", "I'm outside. The buzzer doesn't work.", ["don't", "inside"]],
    ["Можно оставить заказ у двери?", "Can I leave the order at the door?", ["to", "on"]],
    ["Не могли бы вы говорить помедленнее?", "Could you speak more slowly, please?", ["slow", "say"]],
    ["Простите, я опаздываю на пять минут.", "Sorry, I'm five minutes late.", ["am", "later"]],
    ["Как это пишется?", "How do you spell that?", ["does", "write"]],
    ["Я этого не понимаю.", "I don't understand this.", ["no", "am"]],
    ["Где здесь вход?", "Where is the entrance?", ["are", "does"]],
    ["Я перезвоню вам через минуту.", "I'll call you back in a minute.", ["am", "on"]],
    ["Что случилось с прошлым курьером?", "What happened to the last courier?", ["happen", "with"]],
    ["Мне нужно зарядить телефон.", "I need to charge my phone.", ["am", "charging"]],
    ["Поверните налево на светофоре.", "Turn left at the traffic lights.", ["on", "to"]],
    ["Это третий этаж, вторая дверь.", "It's the third floor, second door.", ["three", "two"]],
    ["Дайте мне минутку, пожалуйста.", "Give me a minute, please.", ["to", "moment"]]
  ],
  lift: [
    ["How are you tonight?", "Not bad, thanks. And you?", ["I'm Alex.", "Yes, I am tonight."]],
    ["Is that my order?", "Yes. Two coffees for Sam?", ["Yes, I am.", "Order is my."]],
    ["You're late.", "Sorry about that. The traffic was bad.", ["Yes, you are.", "Late I am not sorry."]],
    ["Can you leave it at the door?", "Sure, no problem.", ["Yes, I can door.", "No, I leave you."]],
    ["Thanks a lot!", "You're welcome. Have a good night.", ["Yes, please.", "Thanks you too me."]],
    ["Cold tonight, isn't it?", "Yeah, it's freezing.", ["No, I'm not cold it.", "Yes, I am from there."]],
    ["Which company are you with?", "I'm with Relay.", ["I'm fine, thanks.", "Company is with me."]],
    ["Sorry, what was your name?", "It's Alex.", ["I'm fine.", "My name again."]],
    ["The lift is broken. Third floor.", "Okay, I'll take the stairs.", ["Yes, it is.", "I am third."]],
    ["Do you need a signature?", "No, that's fine. Thank you.", ["Yes, I need.", "Sign is no."]],
    ["Something is missing from the bag.", "I'm sorry. I'll report it now.", ["Yes, it is.", "Missing you too."]],
    ["Could you wait one minute?", "Of course. Take your time.", ["Yes, I could one.", "One minute ago."]],
    ["Is it still raining?", "Yes, a little.", ["Yes, I am.", "Rain it is no."]],
    ["Do you want a coffee?", "Yes, please. That would be great.", ["Yes, I like.", "I am coffee, thanks."]],
    ["How long have you been in London?", "About two months.", ["Since I'm here.", "Two months ago I am."]],
    ["Have a good night!", "Thanks, you too!", ["Yes, I have.", "Nice to meet you."]],
    ["Where do I sign?", "Just here, please.", ["Yes, you do.", "Sign where is."]],
    ["Are you new?", "Yes, it's my first week.", ["New is good.", "I am no."]]
  ],
  echo: [
    ["Sorry, could you repeat that?", "Простите, можете повторить?"], ["Hi, Relay delivery for Sam.", "Здравствуйте, доставка Relay для Сэма."],
    ["Which flat is it, please?", "Какая квартира, подскажите?"], ["One item is missing.", "Одной позиции не хватает."],
    ["I'm outside your building.", "Я у вашего дома."], ["Can I leave it at the door?", "Можно оставить у двери?"],
    ["Could you spell that, please?", "Можете сказать по буквам?"], ["I'll be there in five minutes.", "Буду через пять минут."],
    ["Have a good night.", "Доброй ночи."], ["Yes, that's right.", "Да, всё верно."],
    ["I'm just waiting for my order.", "Я просто жду заказ."], ["Turn left at the traffic lights.", "На светофоре налево."],
    ["Your destination is on the right.", "Пункт назначения справа."], ["Just a moment, please.", "Минутку, пожалуйста."],
    ["What does that mean?", "Что это значит?"], ["Sorry, I'm new.", "Простите, я новенький."]
  ],
  // Цифры на слух: время, номера квартир, «-teen / -ty», коды, имена по буквам.
  crack() {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const two = (n) => String(n).padStart(2, "0");
    const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
    const w = (x) => (x === 0 ? "oh" : NUM[x]);
    const makers = [
      () => { const h = 1 + Math.floor(Math.random() * 11); return { say: `The order is ready at half past ${NUM[h]}.`, fields: [["Время", two(h) + "30", ":"]], note: `${two(h)}:30`, tip: `half past ${NUM[h]} = ${h}:30` }; },
      () => { const h = 2 + Math.floor(Math.random() * 10); return { say: `Be there at quarter to ${NUM[h]}.`, fields: [["Время", two(h - 1) + "45", ":"]], note: `${two(h - 1)}:45`, tip: `quarter to ${NUM[h]} = ${h - 1}:45` }; },
      () => { const h = 1 + Math.floor(Math.random() * 11); return { say: `Pickup at quarter past ${NUM[h]}.`, fields: [["Время", two(h) + "15", ":"]], note: `${two(h)}:15`, tip: `quarter past ${NUM[h]} = ${h}:15` }; },
      () => { const t = pick([[13, "thirteen"], [30, "thirty"], [14, "fourteen"], [40, "forty"], [15, "fifteen"], [50, "fifty"], [16, "sixteen"], [60, "sixty"], [17, "seventeen"], [70, "seventy"], [18, "eighteen"], [80, "eighty"], [19, "nineteen"], [90, "ninety"]]); return { say: `Flat ${t[1]}. Flat ${t[1]}.`, fields: [["Квартира", String(t[0])]], note: `Flat ${t[0]}`, tip: `${t[1]} = ${t[0]}` }; },
      () => { const d = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)); return { say: `The gate code is ${d.map(w).join(", ")}.`, fields: [["Код", d.join("")]], note: "Код " + d.join(""), tip: "oh = 0" }; },
      () => { const d = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)); return { say: `Call me on ${d.slice(0, 3).map(w).join(", ")}. ${d.slice(3).map(w).join(", ")}.`, fields: [["Номер", d.join("")]], note: d.join(""), tip: "oh = 0" }; },
      () => { const n = pick(["FROST", "MILL", "CANON", "OKOYE", "REYES", "VALE", "DOCK", "QUAY", "BAKER", "JAMES"]); return { say: `${n[0]}${n.slice(1).toLowerCase()}. ${n.split("").join(". ")}.`, fields: [["Слово", n]], note: n, tip: "по буквам" }; },
      () => { const a = 3 + Math.floor(Math.random() * 30), b = pick([20, 50, 99, 30]); return { say: `That's ${a} pounds ${b}.`, fields: [["Фунты", String(a)], ["Пенсы", String(b)]], note: `£${a}.${b}`, tip: `£${a}.${b}` }; }
    ];
    return shuffle(makers).slice(0, 6).map((m) => m());
  },
  // Случайный маршрут для тренировки навигатора.
  ride() {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const ST = ["MILL RD", "DOCK ST", "CANON ST", "HIGH ST", "KING ST", "BELL LN", "QUAY LN", "PARK RD", "CHURCH ST", "STATION RD"];
    const full = (s) => s.replace(" RD", " Road").replace(" ST", " Street").replace(" LN", " Lane").replace(/\w+/, (w) => w[0] + w.slice(1).toLowerCase());
    const three = () => shuffle(ST).slice(0, 3);
    const steps = [];
    for (let i = 0; i < 5; i++) {
      const kind = pick(["cross", "cross", "l2", "r2", "round"]);
      const [a, b, c] = three();
      if (kind === "cross") {
        const right = pick(["left", "straight", "right"]);
        const names = { left: a, straight: b, right: c };
        const say = right === "straight" ? pick(["Go straight on.", "Go straight on at the traffic lights."]) : pick([`Turn ${right}.`, `Turn ${right} at the traffic lights.`, `Turn ${right} onto ${full(names[right])}.`]);
        steps.push({ say, kind, right, names });
      } else if (kind === "round") {
        const k = pick([1, 2, 3]);
        steps.push({ say: `At the roundabout, take the ${["first", "second", "third"][k - 1]} exit.`, kind, right: "e" + k, names: { e1: a, e2: b, e3: c } });
      } else {
        const right = pick(["first", "second"]);
        steps.push({ say: `Take the ${right} ${kind === "l2" ? "left" : "right"}.`, kind, right, names: { first: a, second: b, straight: c } });
      }
    }
    const side = pick(["left", "right"]);
    steps.push({ say: `Your destination is on the ${side}.`, kind: "dest", right: side });
    return steps;
  }
};

Object.assign(Arcade, {
  GAMES: {
    ride: { ico: "route", name: "Навигатор", skill: "повороты на слух", engine: () => Ride, make: () => ({ title: "Навигатор", intro: "Шесть указаний подряд. Слушай и выбирай поворот.", steps: TRAIN.ride(), secs: 8 }) },
    crack: { ico: "wave", name: "Цифры на слух", skill: "время, коды, номера квартир", engine: () => Crack, make: () => ({ title: "Цифры на слух", label: "Запись", intro: "Шесть записей: время, коды, номера, имена по буквам. Набирай то, что слышишь.", who: shuffle(TRAIN.who)[0], items: TRAIN.crack() }) },
    lift: { ico: "chat", name: "Быстрый ответ", skill: "короткий разговор у двери", engine: () => Lift, make: () => { const who = shuffle(["rita", "cole", "dana", "vale"])[0]; return { title: "Быстрый ответ", intro: "Восемь коротких реплик. Отвечай естественно и быстро.", who, secs: 6, items: shuffle(TRAIN.lift).slice(0, 8).map(([say, right, wrong]) => ({ say, right, wrong })) }; } },
    decode: { ico: "cipher", name: "Собери фразу", skill: "порядок слов", engine: () => Decode, make: () => ({ title: "Собери фразу", intro: "Пять фраз курьера. Собери каждую из слов, пока не вышло время.", secs: 35, items: shuffle(TRAIN.decode).slice(0, 5).map(([ru, en, extra]) => ({ ru, en, extra })) }) },
    echo: { ico: "ear", name: "Эхо", skill: "слух и произношение", engine: () => Echo, make: () => ({ title: "Эхо", intro: "Пять фраз без текста. Повтори каждую вслух или напиши.", items: shuffle(TRAIN.echo).slice(0, 5).map(([en, ru]) => ({ en, ru, who: shuffle(TRAIN.who)[0] })) }) }
  },

  shell(cls, html) {
    Game.leave();
    Game.playing = false;
    UI.hideHud();
    document.body.classList.add("s3");
    document.body.dataset.m = "";
    UI.setBg("art/lobby.jpg", "dim");
    $("#scene").innerHTML = `<section class="a-page ${cls}">${html}</section>`;
    Game.titleMusic();
  },

  hub() {
    const P = Profile.get(), trained = Profile.trainedToday();
    this.shell("a-hub", `
      <header class="a-page-head"><button class="btn ghost small" data-act="back">← Меню</button><h1>Тренировка</h1>
        <div class="t-chips"><div class="t-chip" title="Дней подряд">${ICON.target}<b>${P.streak || 0}</b></div>${trained ? "" : '<div class="t-chip acc">сегодня ×2</div>'}</div></header>
      <p class="a-page-lead">Короткие партии на один навык, без сюжета. Первая за день удваивает репутацию и продлевает серию дней.</p>
      <div class="a-grid">${Object.entries(this.GAMES).map(([id, g]) => `
        <button class="a-gcard" data-game="${id}"><i>${ICON[g.ico]}</i><b>${esc(g.name)}</b><span>${esc(g.skill)}</span><em>${P.best[id] ? "рекорд " + P.best[id] : "ещё не было"}</em></button>`).join("")}</div>`);
    $(".a-hub").onclick = (e) => {
      if (e.target.closest('[data-act="back"]')) return Game.title();
      const g = e.target.closest("[data-game]");
      if (g) { Sound.ensure(); Sound.sfx("pop"); this.play(g.dataset.game); }
    };
  },

  // Тренировочная партия: без сюжета, с кнопкой выхода.
  async play(id) {
    const G = this.GAMES[id];
    for (;;) {
      Game.leave();
      Game.playing = false;
      const tok = (Game.tok = { dead: false });
      const exit = document.createElement("button");
      exit.className = "btn ghost small a-exit";
      exit.textContent = "← Выйти";
      exit.onclick = () => { tok.dead = true; exit.remove(); Arcade.hub(); };
      document.body.appendChild(exit);
      Game.onLeave(() => exit.remove());
      const sc = { ...G.make(), id: "train-" + id, gameId: id, training: true, kicker: "Тренировка" };
      let res = null;
      try { res = await G.engine().run(sc, tok); } catch (e) { console.error(e); UI.toast("Игра сломалась: " + esc(e.message), "bad"); }
      exit.remove();
      if (tok.dead) return;
      if (!(res && res.again)) break;
    }
    this.hub();
  },

  collection() {
    const P = Profile.get(), rank = Profile.rank(), s = P.stats;
    const rating = s.rateN ? (s.rateSum / s.rateN).toFixed(2) : "—";
    this.shell("a-coll", `
      <header class="a-page-head"><button class="btn ghost small" data-act="back">← Меню</button><h1>Личное дело</h1>
        <div class="t-chips"><div class="t-chip">${ICON.shield}<b>${Object.keys(P.badges).length}/${Object.keys(BADGES).length}</b></div></div></header>
      <div class="a-facts">
        <div><span>Уровень</span><b>${esc(rank.name)}</b></div><div><span>Репутация</span><b>${P.xp}</b></div>
        <div><span>Рейтинг курьера</span><b>${rating}</b></div><div><span>Заказов</span><b>${s.orders || 0}</b></div>
        <div><span>Ответов голосом</span><b>${s.voice || 0}</b></div><div><span>Дней подряд</span><b>${P.streak || 0}</b></div>
      </div>
      <div class="a-ranks">${RANKS.map((r, i) => `<div class="${i <= rank.i ? "on" : ""} ${i === rank.i ? "cur" : ""}"><i>${r.mark}</i><b>${esc(r.name)}</b><span>${r.at}${r.perk ? " · " + esc(r.perk) : ""}</span></div>`).join("")}</div>
      <div class="a-stickers">${Object.keys(BADGES).map((id) => Juice.badgeHTML(id, !!P.badges[id])).join("")}</div>`);
    $(".a-coll").onclick = (e) => { if (e.target.closest('[data-act="back"]')) Game.title(); };
  }
});
