// Мини-игры, часть вторая:
// Search    — обыск стола по английским указаниям (предлоги места, названия вещей).
// Caseboard — доска улик: разложить факты по подозреваемым и назвать крота.
// Echo      — повторить фразу на слух (только в тренировке).
// Arcade.hub / Arcade.collection — тренировочный зал и коллекция стикеров.

const DESK_WORDS = {
  lamp: ["a lamp", "лампа"], photo: ["a photo", "фото: кот по кличке Biscuit"], monitor: ["a monitor", "монитор"],
  calendar: ["a calendar", "календарь; пятница обведена дважды"], plant: ["a plant", "растение"], phone: ["a phone", "телефон"],
  folder: ["a blue folder", "синяя папка"], keyboard: ["a keyboard", "клавиатура"], mouse: ["a mouse", "мышь"],
  mug: ["a mug", "кружка"], stapler: ["a stapler", "степлер"], biscuits: ["a tin of biscuits", "жестянка с печеньем"],
  bin: ["a bin", "мусорная корзина"], top: ["the top drawer", "верхний ящик: зарядки и скрепки"], bottom: ["the bottom drawer", "нижний ящик"]
};

const Search = {
  svg() {
    const hit = (x, y, w, h) => `<rect class="s-hit" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`;
    return `<svg class="s-desk" viewBox="0 0 1000 620" aria-hidden="true">
      <rect width="1000" height="320" fill="#ffe1cf"/>
      <rect y="300" width="1000" height="320" fill="#3a2e92"/>
      <g opacity=".5" fill="#ffcdb4"><circle cx="120" cy="250" r="5"/><circle cx="320" cy="60" r="5"/><circle cx="520" cy="80" r="5"/><circle cx="700" cy="230" r="5"/><circle cx="940" cy="240" r="5"/><circle cx="60" cy="90" r="5"/></g>
      <g class="s-obj" data-id="photo">${hit(96, 36, 150, 150)}<rect x="104" y="44" width="134" height="134" rx="8" fill="#fff" transform="rotate(-4 171 111)"/><rect x="116" y="56" width="110" height="94" rx="4" fill="#7ee6c4" transform="rotate(-4 171 111)"/>
        <g transform="rotate(-4 171 111)"><ellipse cx="171" cy="122" rx="30" ry="24" fill="#f3a76b"/><path d="M147 108 L150 84 L164 100 Z M195 108 L192 84 L178 100 Z" fill="#f3a76b"/><circle cx="162" cy="118" r="3.4" fill="#2b1a00"/><circle cx="180" cy="118" r="3.4" fill="#2b1a00"/><path d="M167 127 q4 4 8 0" stroke="#2b1a00" stroke-width="2" fill="none"/></g></g>
      <g class="s-obj" data-id="calendar">${hit(748, 30, 164, 170)}<rect x="756" y="38" width="148" height="154" rx="10" fill="#fff"/><rect x="756" y="38" width="148" height="38" rx="10" fill="#ff4f8b"/><text x="830" y="64" text-anchor="middle" font-size="18" font-weight="900" fill="#fff" font-family="Segoe UI, sans-serif">MARCH</text>
        <g fill="#d9d2f5">${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${770 + c * 26}" y="${90 + r * 24}" width="18" height="16" rx="3"/>`).join("")).join("")}</g>
        <circle cx="883" cy="146" r="14" fill="none" stroke="#ff4f8b" stroke-width="4"/><circle cx="883" cy="146" r="19" fill="none" stroke="#ff4f8b" stroke-width="2"/></g>
      <rect x="30" y="300" width="940" height="176" rx="16" fill="#d49a63"/>
      <rect x="30" y="456" width="940" height="164" fill="#b87c48"/><rect x="30" y="456" width="940" height="14" fill="#a26a3b"/>
      <g class="s-obj" data-id="lamp">${hit(84, 150, 150, 200)}<ellipse cx="140" cy="338" rx="46" ry="12" fill="#2b2360"/><path d="M140 334 L170 210" stroke="#2b2360" stroke-width="9" stroke-linecap="round"/><path d="M124 208 Q176 150 232 196 L196 236 Z" fill="#ffd23f"/><ellipse cx="212" cy="218" rx="24" ry="10" fill="#fff6c8" transform="rotate(44 212 218)"/></g>
      <g class="s-obj" data-id="monitor">${hit(392, 138, 240, 200)}<rect x="400" y="146" width="224" height="150" rx="14" fill="#1a1238"/><rect x="412" y="158" width="200" height="126" rx="6" fill="#7fe0ff"/><rect x="424" y="172" width="90" height="10" rx="5" fill="#fff" opacity=".8"/><rect x="424" y="192" width="140" height="8" rx="4" fill="#fff" opacity=".5"/><rect x="424" y="208" width="110" height="8" rx="4" fill="#fff" opacity=".5"/>
        <rect x="496" y="296" width="32" height="26" fill="#1a1238"/><rect x="456" y="318" width="112" height="12" rx="6" fill="#1a1238"/><rect x="588" y="140" width="40" height="40" fill="#ffe27a" transform="rotate(8 608 160)"/></g>
      <g class="s-note s-n-plant"><rect x="800" y="262" width="62" height="56" fill="#ffe27a" transform="rotate(-6 831 290)"/><text x="831" y="286" text-anchor="middle" font-size="13" font-weight="800" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive">YOGA</text><text x="831" y="304" text-anchor="middle" font-size="11" font-weight="700" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive">Sat 10:00</text></g>
      <g class="s-obj" data-id="plant">${hit(770, 150, 130, 190)}<g class="sc-sway"><path d="M836 268 C826 220 780 200 762 160 C800 168 828 200 838 244 Z" fill="#2fbf8f"/><path d="M836 268 C846 214 884 190 904 150 C860 162 838 204 834 244 Z" fill="#3de0a8"/><path d="M836 268 C832 214 816 176 834 138 C852 178 842 226 838 250 Z" fill="#25a87c"/></g><path d="M800 262 H872 L862 332 H810 Z" fill="#ff7a59"/><rect x="794" y="254" width="84" height="16" rx="7" fill="#e0603f"/></g>
      <g class="s-obj" data-id="biscuits">${hit(672, 296, 96, 70)}<ellipse cx="720" cy="344" rx="40" ry="14" fill="#c9304a"/><rect x="680" y="314" width="80" height="30" fill="#ff4f5e"/><ellipse cx="720" cy="314" rx="40" ry="14" fill="#ff7a86"/><circle cx="708" cy="312" r="7" fill="#e9b872"/><circle cx="730" cy="316" r="7" fill="#d9a55e"/></g>
      <g class="s-obj" data-id="phone">${hit(72, 362, 130, 90)}<rect x="80" y="372" width="114" height="72" rx="12" fill="#2b2360"/><rect x="88" y="366" width="34" height="84" rx="14" fill="#4a3fb0"/><g fill="#7fe0ff"><rect x="134" y="384" width="12" height="10" rx="2"/><rect x="152" y="384" width="12" height="10" rx="2"/><rect x="170" y="384" width="12" height="10" rx="2"/><rect x="134" y="402" width="12" height="10" rx="2"/><rect x="152" y="402" width="12" height="10" rx="2"/><rect x="170" y="402" width="12" height="10" rx="2"/><rect x="134" y="420" width="12" height="10" rx="2"/><rect x="152" y="420" width="12" height="10" rx="2"/><rect x="170" y="420" width="12" height="10" rx="2"/></g></g>
      <g class="s-note s-n-folder"><rect x="262" y="330" width="70" height="56" fill="#ffe27a" transform="rotate(7 297 358)"/><text x="297" y="354" text-anchor="middle" font-size="11" font-weight="800" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive" transform="rotate(7 297 358)">SwiftBox</text><text x="297" y="372" text-anchor="middle" font-size="13" font-weight="900" fill="#3a2f0c" font-family="Segoe Print, Comic Sans MS, cursive" transform="rotate(7 297 358)">SB-4471</text></g>
      <g class="s-obj" data-id="folder">${hit(212, 346, 140, 104)}<rect x="220" y="354" width="124" height="90" rx="8" fill="#2f7de0" transform="rotate(-5 282 399)"/><rect x="220" y="354" width="124" height="18" rx="8" fill="#5a9bf0" transform="rotate(-5 282 399)"/><rect x="250" y="388" width="64" height="22" rx="4" fill="#fff" transform="rotate(-5 282 399)"/></g>
      <g class="s-crumbs" fill="#e9b872"><circle cx="450" cy="408" r="4"/><circle cx="486" cy="420" r="3"/><circle cx="530" cy="404" r="5"/><circle cx="566" cy="424" r="3"/><circle cx="600" cy="410" r="4"/><circle cx="508" cy="430" r="3"/></g>
      <g class="s-obj" data-id="keyboard">${hit(396, 372, 252, 76)}<rect x="404" y="380" width="236" height="60" rx="10" fill="#f2efff"/><g fill="#bdb4e8">${[0, 1, 2].map((r) => Array.from({ length: 11 }, (_, c) => `<rect x="${414 + c * 20}" y="${388 + r * 16}" width="15" height="11" rx="2.5"/>`).join("")).join("")}</g></g>
      <g class="s-obj" data-id="mouse">${hit(656, 388, 54, 64)}<rect x="664" y="394" width="38" height="52" rx="19" fill="#f2efff"/><path d="M683 396 v18" stroke="#bdb4e8" stroke-width="3"/></g>
      <g class="s-obj" data-id="mug">${hit(732, 366, 84, 80)}<path d="M740 376 H790 V430 Q765 444 740 430 Z" fill="#ff4f8b"/><path d="M790 388 q20 2 18 18 t-18 16" stroke="#ff4f8b" stroke-width="8" fill="none"/><ellipse cx="765" cy="376" rx="25" ry="7" fill="#7a2e1a"/></g>
      <g class="s-obj" data-id="stapler">${hit(828, 392, 110, 56)}<rect x="836" y="424" width="94" height="14" rx="6" fill="#2b2360"/><path d="M838 422 L926 402 Q934 412 928 424 L838 424 Z" fill="#ff4f5e"/></g>
      <g class="s-obj" data-id="top">${hit(80, 484, 262, 60)}<rect x="88" y="490" width="246" height="50" rx="8" fill="#c98b56"/><rect x="186" y="508" width="50" height="12" rx="6" fill="#7a4a2a"/></g>
      <g class="s-obj" data-id="bottom">${hit(80, 548, 262, 64)}<rect x="88" y="554" width="246" height="54" rx="8" fill="#c98b56"/><rect x="186" y="574" width="50" height="12" rx="6" fill="#7a4a2a"/><text x="306" y="586" font-size="20">🔒</text></g>
      <g class="s-obj" data-id="bin">${hit(800, 494, 110, 122)}<path d="M810 504 H900 L890 612 H820 Z" fill="#8f86d6"/><rect x="804" y="496" width="102" height="14" rx="7" fill="#6f65c0"/><path d="M834 520 v76 M855 520 v76 M876 520 v76" stroke="#6f65c0" stroke-width="5"/></g>
    </svg>`;
  },

  async run(sc, tok) {
    const lv = level();
    const who = sc.who || "grace";
    $("#scene").innerHTML = `
      <section class="a-game a-search">
        <div class="s-stage"><div class="s-frame">${this.svg()}<div class="s-label" hidden></div></div></div>
        <aside class="a-card s-side">
          <header class="a-top"><span class="a-kicker">${esc(sc.place || "Стол")}</span><span class="s-clock">0:00</span></header>
          <div class="a-timer"><i></i></div>
          <div class="s-log"></div>
          <div class="s-word muted small">Нажимай на вещи — узнаешь, как они называются.</div>
          <footer><span class="s-count muted small"></span><button class="btn mint small" data-act="leave" disabled>Уйти от стола</button></footer>
        </aside>
      </section>`;
    const root = $(".a-search"), log = $(".s-log", root), frame = $(".s-frame", root);
    Music.play("tense");
    await Arcade.intro(sc, { ico: "🗂️", keys: ["Читай и слушай, где искать", "under · behind · next to · in", "Любая вещь называет себя по-английски"] });
    if (tok.dead) return null;
    const S = { step: 0, found: 0, words: new Set(), drawer: false, open: false, caught: false, ended: false, sticky: false };
    const bubble = (html, cls) => { const el = document.createElement("div"); el.className = "o-bub " + cls; el.innerHTML = html; log.appendChild(el); log.scrollTop = log.scrollHeight; return el; };
    const say = async (text, o = {}) => {
      bubble(`${lv.subs === "live" || o.show ? enHTML(text) : `<span class="s-veil">🎤 голосовое · <button class="s-show">показать текст</button></span><span class="s-hid" hidden>${enHTML(text)}</span>`}<button class="o-bub-play" data-say="${esc(text)}" data-who="${who}">${ICON.play}</button>`, "them en");
      Sound.sfx("note");
      timer.pause(true);
      await raceDead(tok, Voice.sayAsync(text, { who }));
      timer.pause(false);
    };
    const count = () => { $(".s-count", root).textContent = `Слова: ${S.words.size} из ${Object.keys(DESK_WORDS).length}`; };
    count();
    let resolveEnd;
    const ended = new Promise((r) => { resolveEnd = r; });
    const end = (why) => { if (S.ended) return; S.ended = true; timer.stop(); resolveEnd(why); };
    const total = (sc.seconds || 75) * (lv.subs === "live" ? 1.25 : 1);
    const timer = Arcade.timer($(".a-timer i", root), total, () => end("time"));
    const clock = setInterval(() => { const s = Math.max(0, Math.ceil(timer.left())); const c = $(".s-clock", root); if (c) c.textContent = `Грейс вернётся через ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 250);
    Game.onLeave(() => { clearInterval(clock); timer.stop(); S.ended = true; });

    const label = (g, id) => {
      const [en, ru] = DESK_WORDS[id];
      const l = $(".s-label", root), fr = frame.getBoundingClientRect(), r = g.getBoundingClientRect();
      l.hidden = false;
      l.innerHTML = `<b>${esc(en)}</b><span>${esc(ru)}</span>`;
      l.style.left = clamp(r.left + r.width / 2 - fr.left, 70, fr.width - 70) + "px";
      l.style.top = Math.max(8, r.top - fr.top - 8) + "px";
      l.style.animation = "none"; void l.offsetWidth; l.style.animation = "";
      $(".s-word", root).innerHTML = `<b class="english">${esc(en)}</b> — ${esc(ru)}`;
      if (!S.words.has(id)) { S.words.add(id); count(); Juice.xp(2, g); }
      if (!Voice.busy()) Voice.say(en, { who: "guest", rate: 0.85 });
    };
    // Карточка находки. Таймер стоит, пока игрок читает (кроме запретного ящика).
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
    const tasks = sc.tasks;
    const next = async () => {
      const t = tasks[S.step];
      if (!t) return;
      if (t.me) { bubble(esc(t.me), "me"); await sleep(600); }
      if (tok.dead || S.ended) return;
      await say(t.say);
    };
    let busy = false;
    const onClick = async (e) => {
      const sh = e.target.closest(".s-show");
      if (sh) { const b = sh.closest(".o-bub"); $(".s-veil", b).hidden = true; $(".s-hid", b).hidden = false; return; }
      const sayBtn = e.target.closest("[data-say]");
      if (sayBtn) return Voice.say(sayBtn.dataset.say, { who: sayBtn.dataset.who, rate: 0.85 });
      if (e.target.closest('[data-act="leave"]')) return end("left");
      const g = e.target.closest(".s-obj");
      if (!g || busy || S.ended || tok.dead) return;
      const id = g.dataset.id;
      const t = tasks[S.step];
      label(g, id);
      if (id === "bottom" && !S.drawer) {
        busy = true;
        g.classList.add("opening");
        Sound.sfx("drawer");
        await sleep(1400);
        g.classList.remove("opening");
        if (S.ended) { busy = false; return; }
        g.classList.add("open");
        S.drawer = true; S.open = true;
        Juice.badge("nosy");
        (sc.drawer.clues || []).forEach((c) => Clues.add(c));
        await reveal(sc.drawer.html, { live: true, btn: "Закрыть ящик" });
        S.open = false;
        g.classList.remove("open");
        Sound.sfx("drawer");
        busy = false;
        return;
      }
      if (!t || id !== t.target) { Sound.sfx("pop"); return; }
      busy = true;
      S.step += 1;
      S.found += 1;
      g.classList.add("moved");
      root.classList.add("did-" + id);
      Sound.sfx(t.win ? "combo" : "ok");
      Juice.hit(g, { first: true, base: 10 });
      if (t.win) { S.sticky = true; Notes.add({ kind: "item", src: "item", scene: sc.id, time: sc.time || "", text: t.item || "" }); $('[data-act="leave"]', root).disabled = false; }
      await reveal(`<h3>${esc(t.title)}</h3>${t.html}<p class="o-find-q">${esc(t.ru)}</p>`);
      busy = false;
      if (S.ended || tok.dead) return;
      await next();
    };
    root.addEventListener("click", onClick);
    await next();
    const why = await raceDead(tok, ended);
    clearInterval(clock);
    root.removeEventListener("click", onClick);
    if (tok.dead) return null;
    Music.stop();
    Voice.stop();
    // Грейс возвращается.
    S.caught = why === "time" && S.open;
    Sound.sfx("steps");
    await sleep(900);
    const line = S.caught ? sc.back.caught : S.sticky ? sc.back.ok : sc.back.late;
    bubble(enHTML(line), "them en");
    await raceDead(tok, Voice.sayAsync(line, { who }));
    if (tok.dead) return null;
    if (S.caught) Heat.add(25, "Грейс застала тебя у своего ящика");
    if (sc.done) sc.done(state, S);
    Store.save();
    if (Heat.over()) return { fail: "Грейс застала тебя в своём ящике, и вопросов стало слишком много. Легенда сгорела." };
    const xp = S.found * 6 + (S.sticky ? 15 : 0);
    const notes = Object.entries(DESK_WORDS).filter(([id]) => S.words.has(id)).slice(0, 8).map(([, w]) => `<b class="english">${esc(w[0])}</b><span>${esc(w[1])}</span>`);
    const act = await Arcade.result(sc, { score: S.found, max: tasks.filter((t) => t.target).length, xp, notes, title: S.caught ? "Застукали" : S.sticky ? "Номер найден" : "Не успел(а)",
      line: `Найдено по указаниям: ${S.found} из ${tasks.filter((t) => t.target).length} · слов: ${S.words.size}` });
    return act === "again" ? { again: true } : null;
  }
};

// ───────── доска улик ─────────
const Caseboard = {
  async run(sc, tok) {
    const suspects = sc.suspects;
    const cards = shuffle(val(sc.cards, state)).map((c) => ({ ...c, mine: !c.clue || Clues.has(c.clue) }));
    $("#scene").innerHTML = `
      <section class="a-game a-board">
        <div class="cb-board">
          <div class="cb-title">${esc(sc.boardTitle || "Who used badge №07?")}</div>
          <div class="cb-cols">${suspects.map((w, i) => `
            <div class="cb-col" data-who="${w}">
              <button class="cb-photo" data-who="${w}" style="--r:${[-3, 2, -2][i % 3]}deg"><span class="cb-pin"></span>${avatar(w, "cb-face")}<b>${esc(PEOPLE[w].name)}</b><kbd>${i + 1}</kbd></button>
              <div class="cb-notes"></div>
            </div>`).join("")}</div>
        </div>
        <aside class="a-card cb-side">
          <header class="a-top"><span class="a-kicker">Улика <b class="cb-n">1</b> из ${cards.length}</span><span class="a-kicker dim cb-miss"></span></header>
          <div class="cb-card"></div>
          <p class="muted small cb-tip">Прочитай карточку и нажми на того, к кому она относится. Клавиши 1–3.</p>
        </aside>
      </section>`;
    const root = $(".a-board");
    Music.play("calm");
    await Arcade.intro(sc, { ico: "🧵", keys: ["Карточка — факт по-английски", "Нажми на того, о ком она", "В конце назови крота"] });
    if (tok.dead) return null;
    let mistakes = 0, xp = 0, i = 0;
    const showCard = () => {
      const c = cards[i];
      $(".cb-n", root).textContent = String(i + 1);
      $(".cb-card", root).innerHTML = `<div class="cb-paper"><span class="cb-pin"></span><p class="english">${enHTML(c.en)}</p>
        <button class="cb-ru" data-act="ru">по-русски</button><em hidden>${esc(c.ru)}</em>${c.mine ? "" : '<small>от Совы — ты эту улику не нашёл(ла)</small>'}</div>`;
      Sound.sfx("whoosh");
    };
    showCard();
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
        note.style.setProperty("--r", (Math.random() * 6 - 3).toFixed(1) + "deg");
        note.innerHTML = `<span class="cb-pin"></span>${esc(c.en)}`;
        $(".cb-notes", col).appendChild(note);
        Sound.sfx("pin");
        if (c.mine) xp += 4;
        Juice.hit(note, { first: true, base: 2 });
        i += 1;
        if (i >= cards.length) return resolve(true);
        showCard();
      };
      const onKey = (e) => { if (!Game.paused && $("#modal").hidden && /^[1-3]$/.test(e.key) && suspects[Number(e.key) - 1]) choose(suspects[Number(e.key) - 1]); };
      window.addEventListener("keydown", onKey);
      const off = () => window.removeEventListener("keydown", onKey);
      Game.onLeave(off);
      root.onclick = (e) => {
        if (e.target.closest('[data-act="ru"]')) { const em = $(".cb-paper em", root); em.hidden = !em.hidden; return; }
        const p = e.target.closest(".cb-photo");
        if (p) choose(p.dataset.who);
      };
      Caseboard._off = off;
    });
    Caseboard._off();
    if (tok.dead || !pinned) return null;
    // Финальный вопрос: кто крот.
    $(".cb-side", root).innerHTML = `<header class="a-top"><span class="a-kicker">Вывод</span></header>
      <div class="cb-card"><div class="cb-paper q"><span class="cb-pin"></span><p class="english">${enHTML(sc.question)}</p><em>${esc(sc.questionRu)}</em></div></div>
      <p class="muted small cb-tip">Посмотри на доску и нажми на подозреваемого.</p>`;
    root.classList.add("final");
    await new Promise((resolve) => {
      root.onclick = (e) => {
        const p = e.target.closest(".cb-photo");
        if (!p) return;
        if (p.dataset.who !== sc.answer) {
          mistakes += 1;
          Sound.sfx("wrong");
          Juice.shake(p);
          $(".cb-tip", root).textContent = sc.nudge || "Не сходится. У кого был доступ к запасным пропускам?";
          return;
        }
        p.classList.add("mole");
        const st = document.createElement("span");
        st.className = "cb-stamp";
        st.textContent = sc.stamp || "MOLE";
        p.appendChild(st);
        Sound.sfx("stamp");
        Juice.confetti(p, 80);
        root.onclick = null;
        setTimeout(resolve, 1500);
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
      <div class="e-stage"><button class="e-play" data-act="play">🔊</button><p class="e-hint muted">Послушай и повтори вслух. Или напиши, что услышал(а).</p><div class="e-out"></div></div>
      <div class="e-reply"></div>
    </div></section>`;
    const root = $(".a-echo");
    await Arcade.intro(sc, { ico: "🦜", keys: ["Послушай фразу", "Повтори голосом или напиши", "Сравним слово в слово"] });
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
      const play = (rate) => Voice.sayAsync(it.en, { who, rate });
      root.onclick = (e) => { if (e.target.closest('[data-act="play"]')) { Voice.say(it.en, { who, rate: 0.8 }); } };
      await raceDead(tok, play(0.95));
      if (tok.dead) return null;
      const text = await raceDead(tok, reply.wait());
      if (tok.dead || text == null) return null;
      const want = norm(it.en).split(" "), got = norm(text).split(" ");
      const pool = got.slice();
      const marks = want.map((w) => { const k = pool.indexOf(w); if (k >= 0) { pool.splice(k, 1); return true; } return false; });
      const hit = marks.filter(Boolean).length, pct = hit / want.length;
      const words = it.en.split(/\s+/);
      $(".e-out", root).innerHTML = `<p class="e-line english">${words.map((w, k) => `<span class="${marks[k] ? "ok" : "no"}">${esc(w)}</span>`).join(" ")}</p><p class="muted">${esc(it.ru || "")}</p><p class="e-you">Ты: ${esc(text)}</p>`;
      score += Math.round(pct * 100);
      if (pct === 1) { perfect += 1; Sound.sfx("combo"); Juice.hit($(".e-out", root), { first: true, voice: ReplyBox.via === "voice", base: 8 }); }
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

// ───────── тренировочный зал ─────────
const TRAIN = {
  decode: [
    ["Можно мне чашку чая, пожалуйста?", "Can I have a cup of tea, please?", ["am", "to"]],
    ["Во сколько начинается встреча?", "What time does the meeting start?", ["do", "is"]],
    ["Я этого не понимаю.", "I don't understand this.", ["no", "am"]],
    ["Не могли бы вы говорить помедленнее?", "Could you speak more slowly, please?", ["slow", "say"]],
    ["Где здесь переговорка?", "Where is the meeting room?", ["are", "does"]],
    ["Я перезвоню вам позже.", "I'll call you back later.", ["am", "late"]],
    ["Как это пишется?", "How do you spell that?", ["does", "write"]],
    ["Что вы делали в прошлый четверг?", "What did you do last Thursday?", ["does", "were"]],
    ["Я тут всего неделю.", "I've only been here for a week.", ["am", "since"]],
    ["Он сейчас на встрече.", "He is in a meeting right now.", ["on", "at"]],
    ["Вы не против, если я открою окно?", "Do you mind if I open the window?", ["are", "to"]],
    ["Мне нужно отправить эту коробку.", "I need to send this box.", ["am", "sending"]],
    ["Как прошли выходные?", "How was your weekend?", ["were", "did"]],
    ["Я ищу принтер.", "I'm looking for the printer.", ["at", "look"]],
    ["Можете повторить последнюю часть?", "Could you repeat the last part?", ["again", "late"]],
    ["Дайте мне минутку, пожалуйста.", "Give me a minute, please.", ["to", "moment"]],
    ["Чем я могу помочь?", "How can I help you?", ["do", "am"]],
    ["Я вчера познакомился с командой.", "I met the team yesterday.", ["meet", "tomorrow"]]
  ],
  lift: [
    ["How are you today?", "Not bad, thanks. And you?", ["I'm Alex.", "Yes, I am today."]],
    ["Did you have a good weekend?", "Yes, it was nice, thanks.", ["Yes, I do.", "Good weekend!"]],
    ["Cold today, isn't it?", "Yeah, it's freezing!", ["No, I'm not cold it.", "Yes, I am from there."]],
    ["Would you like a coffee?", "Yes, please. That would be great.", ["Yes, I like.", "I am coffee, thanks."]],
    ["Sorry I'm late!", "No worries.", ["You're welcome.", "Yes, you are."]],
    ["Thanks for your help!", "You're welcome!", ["Yes, please.", "No, thanks."]],
    ["What do you do for fun?", "I like cooking. And you?", ["I'm fine, thanks.", "I do fun."]],
    ["How long have you been in London?", "About two months.", ["Since I'm here.", "Two months ago I am."]],
    ["Is this your first job here?", "Yes, it is. I'm still learning.", ["Yes, I do.", "First, thanks."]],
    ["Can I borrow your pen?", "Sure, here you go.", ["Yes, I can.", "No, I don't pen."]],
    ["See you tomorrow!", "See you! Have a good evening.", ["Yes, tomorrow I see.", "Nice to meet you."]],
    ["Do you know where Grace is?", "Sorry, I'm not sure.", ["Yes, I know Grace.", "She is Grace."]],
    ["Nice jacket!", "Oh, thank you!", ["Yes, it is.", "You're welcome."]],
    ["Are you coming to the pub on Friday?", "I'd love to. What time?", ["Yes, I am pub.", "I come from Riga."]],
    ["How was the meeting?", "It was fine. A bit long.", ["I was fine, thanks.", "Yes, it was meeting."]],
    ["Sorry, what was your name again?", "It's Alex.", ["I'm fine.", "My name again."]],
    ["Shall we take the stairs?", "Good idea.", ["Yes, we shall stairs.", "I take, thanks."]],
    ["I'm so tired today.", "Oh no. Long night?", ["Yes, you are.", "Me tired also yes."]],
    ["Have a nice evening!", "Thanks, you too!", ["Yes, I have.", "Nice to meet you."]],
    ["Do you want anything from the shop?", "No, I'm fine, thanks.", ["No, I don't want shop.", "Yes, I do from."]]
  ],
  echo: [
    ["Sorry, could you repeat that?", "Простите, можете повторить?"], ["Nice to meet you too.", "Мне тоже приятно познакомиться."],
    ["Can I take a message?", "Что-нибудь передать?"], ["I'm calling about a delivery.", "Я звоню насчёт доставки."],
    ["What do you do here?", "Чем вы тут занимаетесь?"], ["She is in a meeting right now.", "Она сейчас на встрече."],
    ["Could you spell that, please?", "Можете сказать по буквам?"], ["I'll be back in five minutes.", "Вернусь через пять минут."],
    ["How was your weekend?", "Как прошли выходные?"], ["Yes, that's right.", "Да, всё верно."],
    ["I'm just getting some water.", "Я просто за водой."], ["Could you change the address?", "Можете поменять адрес?"],
    ["Yesterday I met the team.", "Вчера я познакомился с командой."], ["Just a moment, please.", "Минутку, пожалуйста."],
    ["What does that mean?", "Что это значит?"], ["Sorry, I'm new here.", "Простите, я тут новенький."]
  ],
  // Цифры на слух: время, номера, «-teen / -ty», фамилии по буквам.
  crack() {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const two = (n) => String(n).padStart(2, "0");
    const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
    const makers = [
      () => { const h = 1 + Math.floor(Math.random() * 11); return { say: `The meeting is at half past ${NUM[h]}.`, fields: [["Время", two(h) + "30", ":"]], note: `${two(h)}:30`, tip: `half past ${NUM[h]} = ${h}:30` }; },
      () => { const h = 2 + Math.floor(Math.random() * 10); return { say: `Let's meet at quarter to ${NUM[h]}.`, fields: [["Время", two(h - 1) + "45", ":"]], note: `${two(h - 1)}:45`, tip: `quarter to ${NUM[h]} = ${h - 1}:45` }; },
      () => { const h = 1 + Math.floor(Math.random() * 11); return { say: `The courier comes at quarter past ${NUM[h]}.`, fields: [["Время", two(h) + "15", ":"]], note: `${two(h)}:15`, tip: `quarter past ${NUM[h]} = ${h}:15` }; },
      () => { const h = 2 + Math.floor(Math.random() * 10); const m = pick([5, 10, 20, 25]); const W = { 5: "five", 10: "ten", 20: "twenty", 25: "twenty-five" }; return { say: `It's ${W[m]} to ${NUM[h]}.`, fields: [["Время", two(h - 1) + two(60 - m), ":"]], note: `${two(h - 1)}:${two(60 - m)}`, tip: `${W[m]} to ${NUM[h]} = ${h - 1}:${two(60 - m)}` }; },
      () => { const t = pick([[13, "thirteen"], [30, "thirty"], [14, "fourteen"], [40, "forty"], [15, "fifteen"], [50, "fifty"], [16, "sixteen"], [60, "sixty"], [17, "seventeen"], [70, "seventy"], [18, "eighteen"], [80, "eighty"], [19, "nineteen"], [90, "ninety"]]); return { say: `Room ${t[1]}. Room ${t[1]}.`, fields: [["Комната", String(t[0])]], note: `Room ${t[0]}`, tip: `${t[1]} = ${t[0]}` }; },
      () => { const d = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)); const w = (x) => (x === 0 ? "oh" : NUM[x]); return { say: `My number is ${d.slice(0, 3).map(w).join(", ")}. ${d.slice(3).map(w).join(", ")}.`, fields: [["Номер", d.join("")]], note: d.join(""), tip: "oh = 0" }; },
      () => { const n = pick(["WHARF", "MILL", "HOLLIS", "FROST", "PRIYA", "GRACE", "HATTON", "BAKER", "QUEEN", "JAMES"]); return { say: `${n[0]}${n.slice(1).toLowerCase()}. ${n.split("").join(". ")}.`, fields: [["Слово", n]], note: n, tip: "по буквам" }; },
      () => { const a = 10 + Math.floor(Math.random() * 80), b = pick([20, 50, 99, 30]); return { say: `That's ${a} pounds ${b}.`, fields: [["Фунты", String(a)], ["Пенсы", String(b)]], note: `£${a}.${b}`, tip: `£${a}.${b}` }; }
    ];
    return shuffle(makers).slice(0, 6).map((m) => m());
  }
};

Object.assign(Arcade, {
  GAMES: {
    decode: { ico: "🧩", name: "Шифровка", skill: "порядок слов", engine: () => Decode, make: () => ({ title: "Шифровка", intro: "Пять фраз. Собери каждую из слов, пока не вышло время.", secs: 35, items: shuffle(TRAIN.decode).slice(0, 5).map(([ru, en, extra]) => ({ ru, en, extra })) }) },
    crack: { ico: "📼", name: "Перехват", skill: "цифры и время на слух", engine: () => Crack, make: () => ({ title: "Перехват", label: "Запись", intro: "Шесть записей: время, номера, имена по буквам. Набирай то, что слышишь.", who: ["tom", "grace", "max", "priya", "dev"][Math.floor(Math.random() * 5)], items: TRAIN.crack() }) },
    lift: { ico: "🛗", name: "Лифт", skill: "быстрый small talk", engine: () => Lift, make: () => ({ title: "Лифт", intro: "Восемь этажей с коллегой. Отвечай естественно и быстро.", who: ["priya", "grace", "tom", "max"][Math.floor(Math.random() * 4)], secs: 6, items: shuffle(TRAIN.lift).slice(0, 8).map(([say, right, wrong]) => ({ say, right, wrong })) }) },
    echo: { ico: "🦜", name: "Эхо", skill: "слух и произношение", engine: () => Echo, make: () => ({ title: "Эхо", intro: "Пять фраз без текста. Повтори каждую вслух или напиши.", items: shuffle(TRAIN.echo).slice(0, 5).map(([en, ru]) => ({ en, ru, who: ["priya", "grace", "tom", "max"][Math.floor(Math.random() * 4)] })) }) }
  },

  shell(cls, html) {
    Game.leave();
    Game.playing = false;
    UI.hideHud();
    document.body.classList.add("s3");
    document.body.dataset.m = "";
    UI.setBg("svg:city-night", "day");
    $("#scene").innerHTML = `<section class="a-page ${cls}">${html}</section>`;
    Game.titleMusic();
  },

  hub() {
    const P = Profile.get(), trained = Profile.trainedToday();
    this.shell("a-hub", `
      <header class="a-page-head"><button class="btn ghost small" data-act="back">← Меню</button><h1>Тренировка</h1>
        <div class="t-chips"><div class="t-chip ${trained ? "hot" : ""}">🔥 ${P.streak || 0}</div>${trained ? "" : '<div class="t-chip">сегодня ×2 XP</div>'}</div></header>
      <p class="a-page-lead">Короткие игры на один навык. Первая за день удваивает опыт и продлевает серию.</p>
      <div class="a-grid">${Object.entries(this.GAMES).map(([id, g]) => `
        <button class="a-gcard g-${id}" data-game="${id}"><i>${g.ico}</i><b>${esc(g.name)}</b><span>${esc(g.skill)}</span><em>${P.best[id] ? "рекорд " + P.best[id] : "ещё не играл(а)"}</em></button>`).join("")}</div>`);
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
    const P = Profile.get(), rank = Profile.rank();
    this.shell("a-coll", `
      <header class="a-page-head"><button class="btn ghost small" data-act="back">← Меню</button><h1>Коллекция</h1>
        <div class="t-chips"><div class="t-chip">🏅 ${Object.keys(P.badges).length}/${Object.keys(BADGES).length}</div></div></header>
      <div class="a-ranks">${RANKS.map((r, i) => `<div class="${i <= rank.i ? "on" : ""} ${i === rank.i ? "cur" : ""}"><i>${r.ico}</i><b>${esc(r.name)}</b><span>${r.at} XP${r.perk ? " · " + esc(r.perk) : ""}</span></div>`).join("")}</div>
      <div class="a-stickers">${Object.keys(BADGES).map((id) => Juice.badgeHTML(id, !!P.badges[id])).join("")}</div>`);
    $(".a-coll").onclick = (e) => { if (e.target.closest('[data-act="back"]')) Game.title(); };
  }
});
