// Ход игры: титул, вступление, сцены по порядку, пауза, настройки, концовки.

Object.entries(SCENES).forEach(([id, sc]) => { sc.id = id; });

const ENDINGS = {
  best: {
    title: "Март вернулся",
    text: (s) => [
      "В 01:15 группа прошла ворота с кодом 7731. Двое охранников не успели взять рацию.",
      "На втором этаже, в задней комнате, сидел Лев. Похудевший, небритый, живой. Первое, что он спросил: «Кто был в 4B?»",
      "Ремезов ответил: «Иней».",
      s.flags.helenWarned ? "Хелен в ту ночь успела позвонить. Это не помогло." : "Хелен в ту ночь звонила кому-то двенадцать раз. Никто не взял трубку.",
      s.flags.trustMark ? "Утром Марк постучал в дверь с двумя стаканами кофе от Риты. Ничего не спросил." : null
    ]
  },
  partial: {
    title: "Пустая комната",
    text: () => [
      "Группа вошла в 01:15. Ящики «стекла» взяли прямо у фургона. Стекла внутри не было.",
      "Задняя комната на втором этаже была пуста. На полу лежал свитер Льва, ещё тёплый. Его увели минут за десять до группы.",
      "Ремезов долго молчал в рацию. Потом сказал: «Найдём. Теперь мы знаем, кто такая Хелен»."
    ]
  },
  fail: {
    title: "Фургон уехал",
    text: () => [
      "Группа ждала у ворот и не знала, куда идти. В 01:30 ворота открылись сами, и синий фургон ушёл в сторону порта.",
      "Ремезов сказал одно слово: «Отбой».",
      "Эту ночь можно переиграть."
    ]
  }
};

const Game = {
  tok: null,
  cleanups: [],
  paused: false,
  playing: false,

  day() { const sc = SCENES[this.flow()[state.step]]; return sc ? sc.day : 1; },
  flow() { return state.season === 3 ? FLOW3 : state.season === 2 ? FLOW2 : FLOW; },
  introList() { return state.season === 2 ? INTRO2 : INTRO; },
  clockText() { return $("#hud-time").textContent || ""; },
  inPlay() { return this.playing; },
  onLeave(fn) { this.cleanups.push(fn); },
  skipScene(delta) {
    if (!this.playing) return;
    const fl = this.flow();
    const next = clamp((state.step || 0) + delta, 0, fl.length - 1);
    if (next === state.step && delta > 0) return this.title();
    Voice.stop();
    state.step = next;
    Store.save();
    this.run();
  },
  skipStep() {
    if (!this.playing) return;
    if (Voice.busy()) { Voice.stop(); return; }
    if (ReplyBox.active && ReplyBox.active.isWaiting()) { ReplyBox.active.skip(); return; }
    const btn = [...document.querySelectorAll("#scene .btn.primary:not(:disabled), #scene .o-ring-btn, #scene [data-act='go'], #scene [data-act='next']")]
      .find((b) => (b.checkVisibility ? b.checkVisibility() : b.offsetParent !== null));
    if (btn) { btn.click(); return; }
    this.skipScene(1);
  },
  leave() {
    if (this.tok) this.tok.dead = true;
    const fns = this.cleanups;
    this.cleanups = [];
    fns.forEach((f) => { try { f(); } catch (e) { console.warn(e); } });
    Voice.stop();
    Music.stop();
    Sound.staticOff();
    PTT.unbind();
    Mic.abort();
    UI.hideGloss();
    UI.toggleNotebook(false);
  },

  boot() {
    UI.init();
    UI.bumpNotes();
    $("#btn-notes").classList.remove("new");
    this.title();
  },

  title(pick) {
    this.leave();
    this.playing = false;
    const sb = $("#skip-bar");
    if (sb) sb.hidden = true;
    // Какой сезон показать: выбранный вкладкой, иначе последний сыгранный, иначе «Онбординг».
    let last = null;
    try { last = localStorage.getItem("iney-last-pack"); } catch { /* без хранилища показываем первый сезон */ }
    const canOpen = (id) => !!(PACKS[id] && !PACKS[id].meta.soon);
    const pid = canOpen(pick) ? pick : canOpen(last) ? last : "office";
    const pk = PACKS[pid], M = pk.meta;
    // У мультяшного сезона и титул свой, мультяшный (Toon.title в js/toon.js).
    const toon = M.theme === "toon";
    Theme.set(toon ? "toon" : "night");
    UI.hideHud();
    document.body.classList.add("s3");
    document.body.dataset.m = "";
    Sound.setAmbience(null);
    Pack.use(pid);
    UI.setBg(M.bg, toon ? "day" : M.look);
    const saves = { 1: Store.peek("iney-v2"), 2: Store.peek("iney-s2d") };
    Object.values(PACKS).forEach((p) => { const sv = Store.peek(p.meta.key); saves[p.meta.season] = p.migrate ? p.migrate(sv) : sv; });
    const has = (n) => !!(saves[n] && saves[n].started && saves[n].step > 0);
    const sv = saves[M.season], hasCur = has(M.season);
    const where = hasCur ? SCENES[pk.FLOW[Math.min(sv.step, pk.FLOW.length - 1)]] : null;
    const stars = hasCur ? Object.values(sv.missions || {}).reduce((a, x) => a + (x.stars || 0), 0) : 0;
    const P = Profile.get(), rank = Profile.rank();
    const trained = Profile.trainedToday();
    const card = (season, kicker, name, lead, on) => `
      <article class="season">
        <p class="kicker">${kicker}</p>
        <h2>${name}</h2>
        <p>${lead}</p>
        <div class="row">
          ${on ? `<button class="btn primary small" data-act="continue" data-season="${season}">Продолжить</button>` : ""}
          <button class="btn ${on ? "ghost" : "primary"} small" data-act="new" data-season="${season}">${on ? "Заново" : "Начать"}</button>
        </div>
      </article>`;
    const path = Object.entries(pk.MISSIONS).map(([n, m]) => {
      const st = sv && sv.missions && sv.missions[n];
      const cur = where ? where.mission === Number(n) : Number(n) === 1;
      const st3 = st ? [1, 2, 3].map((i) => `<i class="${i <= st.stars ? "on" : ""}">${ICON.starFill}</i>`).join("") : "";
      return `<li class="${st ? "done" : ""} ${cur ? "cur" : ""}"><i class="t-ico">${ICON[st && !cur ? "check" : m.ico] || ICON.pin}</i><div><small>${M.unit} ${n}${cur ? " · ты здесь" : ""}</small><b>${esc(m.title)}</b></div><em>${st3}</em></li>`;
    }).join("");
    const tabs = Pack.list().map((id) => {
      const m = PACKS[id].meta, played = has(m.season);
      if (m.soon) return `<button class="t-tab locked" type="button" disabled title="Скоро появится"><b>${esc(m.tab)}</b><span>скоро</span></button>`;
      return `<button class="t-tab ${id === pid ? "on" : ""}" data-act="pack" data-pack="${id}"><b>${esc(m.tab)}</b><span>${played ? "начат" : "доступен"}</span></button>`;
    }).join("");
    const archive = "";
    $("#scene").innerHTML = toon ? Toon.title({ pk, M, sv, hasCur, where, stars, trained, tabs, archive }) : `
      <section class="title hub o-title">
        <header class="t-top">
          <div class="t-brand"><i>${ICON.snow}</i><div><b>Иней</b><span>английский под прикрытием</span></div></div>
          <button class="t-agent" data-act="coll" title="Личное дело"><i>${rank.mark}</i><div><span>Агент Иней</span><b>${esc(rank.name)}</b><div class="xp-bar"><u style="width:${rank.pct}%"></u></div></div></button>
        </header>
        <div class="t-main">
          <article class="o-hero">
            <div class="t-tabs">${tabs}</div>
            <p class="kicker">${esc(M.kicker)}</p>
            <h1>${esc(M.title)}</h1>
            <p class="lead">${esc(M.lead)}</p>
            <div class="row">
              ${hasCur ? `<button class="btn primary" data-act="continue" data-season="${M.season}">Продолжить${where && where.mission ? " · " + M.unit.toLowerCase() + " " + where.mission : ""}</button>` : ""}
              <button class="btn ${hasCur ? "ghost" : "primary"}" data-act="new" data-season="${M.season}">${hasCur ? "Начать заново" : esc(M.cta)}</button>
            </div>
            <p class="t-note">Отвечаешь голосом или текстом — как удобнее. Проверяется смысл, а не точные слова. Лучше в Chrome или Edge, в наушниках.</p>${Mic.isFile() ? `<p class="t-note t-warn">${ICON.mic}<span>Игра открыта как файл: браузер будет спрашивать про микрофон каждый раз. Запусти <b>play.cmd</b> в папке игры — спросит один раз и запомнит.</span></p>` : ""}
          </article>
          <ol class="t-path">${path}${stars ? `<li class="t-total"><b>Звёзд собрано</b><em>${stars} из ${Math.max(1, Object.keys(pk.MISSIONS || {}).length) * 3}</em></li>` : ""}</ol>
        </div>
        <nav class="t-links">
          <button data-act="train">${ICON.target}<b>Тренировка</b>${trained ? "" : "<u>×2 сегодня</u>"}</button>
          <button data-act="coll">${ICON.shield}<b>Личное дело</b><span>${Object.keys(P.badges).length}/${Object.keys(BADGES).length}</span></button>
          <button data-act="settings">${ICON.gear}<b>Настройки</b></button>
        </nav>
        ${archive}
      </section>`;
    // На узком экране вкладки прокручиваются: выбранная должна быть видна целиком.
    const tt = $(".t-tabs"), on = tt && $(".t-tab.on", tt);
    if (on) { const d = on.getBoundingClientRect().right - tt.getBoundingClientRect().right; if (d > 0) tt.scrollLeft += d + 6; }
    this.titleMusic();
    $(".title").addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      Sound.ensure();
      Sound.sfx("click");
      if (a.dataset.act === "pack") {
        // Выбранная вкладка запоминается: после тренировки или перезагрузки титул откроется на ней же.
        try { localStorage.setItem("iney-last-pack", a.dataset.pack); } catch { /* не страшно */ }
        return this.title(a.dataset.pack);
      }
      if (a.dataset.act === "settings") return this.settings(() => this.title(pid));
      if (a.dataset.act === "train") return Arcade.hub();
      if (a.dataset.act === "coll") return Arcade.collection();
      const season = Number(a.dataset.season);
      const modern = season >= 3;
      const sp = Pack.bySeason(season);
      if (sp) { try { localStorage.setItem("iney-last-pack", sp.meta.id); } catch { /* не страшно */ } }
      if (a.dataset.act === "new") {
        if (has(season) && !confirm(!modern ? "Начать этот сезон заново? Его прогресс сотрётся." : toon && season === M.season
          ? "Начать сезон заново? Прогресс миссий сотрётся, ранг и стикеры останутся." : "Начать сезон заново? Прогресс миссий сотрётся, уровень и отметки останутся.")) return;
        Store.use(season);
        Store.reset();
        if (modern) { state.season = 3; state.started = true; state.step = 0; Store.save(); return this.run(); }
        this.intro(0);
      } else if (a.dataset.act === "continue") {
        Store.use(season);
        document.body.classList.toggle("s3", modern);
        this.run();
      }
    });
  },

  // Музыка меню включается после первого касания: раньше браузер звук не даёт.
  titleMusic() {
    const go = () => { if (!this.playing && $(".o-title, .a-hub, .a-coll")) Music.play("calm"); };
    if (Sound.ctx && Sound.ctx.state === "running") return go();
    const once = () => { document.removeEventListener("pointerdown", once); Sound.ensure(); setTimeout(go, 60); };
    document.addEventListener("pointerdown", once);
    this.onLeave(() => document.removeEventListener("pointerdown", once));
  },

  intro(i) {
    this.leave();
    this.playing = false;
    Theme.set("night");
    UI.hideHud();
    document.body.classList.remove("s3");
    const intro = this.introList();
    if (i >= intro.length) return this.chooseLevel();
    const s = intro[i];
    UI.setBg(s.img || "art/cabinet.jpg", "dusk");
    Sound.setAmbience("room");
    const text = s.text || (s.steps || []).join(" ");
    $("#scene").innerHTML = `
      <section class="card-scene">
        <article class="story-card">
          ${s.who ? `<div class="person">${avatar(s.who, "lg")}<div><b>Подполковник Ремезов</b><span>${esc(PEOPLE[s.who].role)}</span></div></div>` : ""}
          <p class="kicker">Вступление · ${i + 1} из ${intro.length}</p>
          <h1>${esc(s.title)}</h1>
          ${s.text ? `<p class="lead">${esc(s.text)}</p>` : ""}
          ${s.steps ? `<div class="steps">${s.steps.map((t, k) => `<div class="step"><span class="num">${k + 1}</span><p>${esc(t)}</p></div>`).join("")}</div>` : ""}
          <div class="row">
            ${s.who && this.canVoiceRu() ? '<button class="btn ghost" data-act="voice">Голос</button>' : ""}
            <button class="btn primary" data-act="next">Дальше</button>
          </div>
        </article>
      </section>`;
    $(".story-card").addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "voice") Voice.say(text, { who: "remezov" });
      else this.intro(i + 1);
    });
  },
  canVoiceRu() {
    const s = Settings.get();
    return Voice.hasRussian() || (s.cloudVoices && s.provider === "openai" && s.apiKey);
  },

  chooseLevel() {
    const cur = Settings.get().difficulty;
    $("#scene").innerHTML = `
      <section class="card-scene">
        <article class="story-card wide">
          <p class="kicker">Перед первым днём</p>
          <h1>Как будем слушать</h1>
          <div class="levels">${Object.entries(LEVELS).map(([k, l]) => `<button class="level ${cur === k ? "on" : ""}" data-level="${k}"><b>${l.name}</b><span>${esc(l.desc)}</span></button>`).join("")}</div>
          <div class="ai-box ${AI.enabled() ? "on" : ""}">
            <div><b>Живые ответы персонажей</b>
            <p class="muted">${AI.enabled()
              ? "Модель подключена. Персонажи понимают смысл, переспрашивают про пропущенное и подсказывают, как сказать естественнее."
              : "Без модели персонажи узнают ключевые слова. С моделью понимают смысл, отвечают своими словами и подсказывают по-русски, как сказать лучше."}</p></div>
            <button class="btn ghost small" data-act="settings">${AI.enabled() ? "Настройки модели" : "Подключить модель"}</button>
          </div>
          <div class="row"><button class="btn primary" data-act="go">В город</button></div>
          <p class="muted small">Сложность можно поменять в паузе в любой момент.</p>
        </article>
      </section>`;
    $(".story-card").addEventListener("click", (e) => {
      const lv = e.target.closest("[data-level]");
      if (lv) { Settings.set({ difficulty: lv.dataset.level }); return this.chooseLevel(); }
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "settings") this.settings(() => this.chooseLevel());
      if (a.dataset.act === "go") { state.started = true; state.step = 0; Store.save(); this.run(); }
    });
  },

  async run() {
    this.leave();
    const id = this.flow()[state.step];
    const sc = SCENES[id];
    if (!sc) return this.title();
    if ((sc.skip && sc.skip(state)) || (sc.when && !sc.when(state))) { state.step += 1; Store.save(); return this.run(); }
    state.started = true;
    if (typeof sc.boot === "function") sc.boot(state);
    if (sc.missionStart) {
      state.marks = { ...(state.marks || {}), ["m" + sc.mission]: Store.snapshot() };
      Mission.begin(sc.mission);
    }
    state.checkpoint = Store.snapshot();
    if (sc.type === "listen") state.marks = { ...(state.marks || {}), [id]: state.checkpoint };
    Store.save();
    const tok = (this.tok = { dead: false });
    this.playing = true;
    this.paused = false;
    const sb = $("#skip-bar");
    if (sb) sb.hidden = false;
    Theme.set(state.season === 3 ? Pack.meta().theme || "night" : "night");
    UI.setBg(sc.bg, sc.look || "day");
    UI.hud(sc);
    Sound.setAmbience(sc.ambience || (state.season === 3 ? (sc.look === "night" ? "night" : "room") : "room"));
    if (susPeople().includes(sc.npc)) { state.met[sc.npc] = true; UI.renderSus(); }
    let result;
    try {
      if (sc.chapter) { $("#scene").innerHTML = ""; await Kit.chapter(sc.chapter); if (tok.dead) return; }
      result = await ENGINES[sc.type](sc, tok);
    } catch (e) {
      console.error(e);
      UI.toast("Сцена сломалась: " + esc(e.message) + ". Переиграйте её из паузы.", "bad", 9000);
      return;
    }
    if (tok.dead) return;
    if (result && result.fail) return this.fail(result.fail);
    if (result && result.goto) {
      const dest = SCENES[result.goto];
      (dest && dest.resetOnReplay || []).forEach((f) => { state.flags[f] = false; });
      state.step = this.flow().indexOf(result.goto);
      Store.save();
      return this.run();
    }
    state.step += 1;
    Store.save();
    this.run();
  },

  retryScene() {
    UI.closeModal();
    const id = this.flow()[state.step];
    const night = REPLAY_NIGHT[id];
    if (night && state.marks && state.marks[night]) Store.restore(state.marks[night]);
    else if (night) {
      state.notes = state.notes.filter((n) => n.scene !== night);
      delete state.boards[id];
      (SCENES[night] && SCENES[night].resetOnReplay || []).forEach((f) => { state.flags[f] = false; });
      state.step = this.flow().indexOf(night);
      Store.save();
    } else if (state.checkpoint) Store.restore(state.checkpoint);
    UI.bumpNotes();
    this.run();
  },

  brief(sc) {
    return new Promise((resolve) => {
      const paras = (val(sc.text, state) || []).filter(Boolean);
      $("#scene").innerHTML = `
        <section class="card-scene">
          <article class="story-card">
            <div class="person">${avatar("remezov", "lg")}<div><b>Подполковник Ремезов</b><span>${esc(sc.place)}</span></div></div>
            <p class="kicker">${esc(sc.kicker)}</p>
            <h1>${esc(sc.title)}</h1>
            ${paras.map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
            ${(val(sc.goals, state) || []).length ? `<ul class="goals">${val(sc.goals, state).map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
            <div class="row">
              ${Game.canVoiceRu() ? '<button class="btn ghost" data-act="voice">Голос Ремезова</button>' : ""}
              <button class="btn primary" data-act="go">Приступить</button>
            </div>
          </article>
        </section>`;
      $(".story-card").addEventListener("click", (e) => {
        const a = e.target.closest("[data-act]");
        if (!a) return;
        if (a.dataset.act === "voice") Voice.say(paras.join(" "), { who: "remezov" });
        else { Voice.stop(); resolve(); }
      });
    });
  },

  ad(sc) {
    return new Promise((resolve) => {
      const lines = sc.lines || [];
      $("#scene").innerHTML = `
        <section class="ad-hold">
          <article class="listing">
            <p class="listing-title">To let</p>
            ${lines.map((t) => `<p class="english">${enHTML(t)}</p>`).join("")}
            <p class="listing-sign">Helen</p>
          </article>
          <div class="ad-bar">
            <p>${esc(sc.lead)} Слово можно нажать.</p>
            <button class="btn ghost" data-act="voice">Прочитать вслух</button>
            <button class="btn primary" data-act="go">Хелен пришла</button>
          </div>
        </section>`;
      $(".ad-hold").addEventListener("click", (e) => {
        const a = e.target.closest("[data-act]");
        if (!a) return;
        if (a.dataset.act === "voice") Voice.say(lines.join(" "), { who: "helen", rate: 0.92 });
        else {
          Voice.stop();
          lines.forEach((t) => Notes.add({ kind: "item", src: "item", time: sc.time, text: t }));
          Store.save();
          resolve();
        }
      });
    });
  },

  item(sc) {
    return new Promise((resolve) => {
      $("#scene").innerHTML = `
        <section class="card-scene">
          <article class="story-card">
            <p class="kicker">${esc(sc.kicker)}</p>
            <h1>${esc(sc.title)}</h1>
            ${(sc.text || []).map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
            <ul class="items">${sc.items.map((i) => `<li><b>${esc(i.name)}</b><span>${esc(i.ru)}</span></li>`).join("")}</ul>
            <div class="row"><button class="btn primary" data-act="go">Забрать в блокнот</button></div>
          </article>
        </section>`;
      $(".story-card").addEventListener("click", (e) => {
        if (!e.target.closest('[data-act="go"]')) return;
        sc.items.forEach((i) => Notes.add({ kind: "item", src: "item", time: sc.time, text: `${i.name}. ${i.ru}` }));
        if (sc.effect) sc.effect(state);
        Store.save();
        Sound.sfx("ok");
        resolve();
      });
    });
  },

  ending(sc) {
    return new Promise(() => {
      const night = sc.night;
      const fromReport = sc.fromReport && state.reports[sc.fromReport];
      const got = new Set(fromReport ? fromReport.got : (state.live[night] || []));
      const all = sc.facts || (night && SCENES[night] && SCENES[night].live ? SCENES[night].live.facts : []);
      const required = all.filter((f) => !f.optional);
      const gotReq = required.filter((f) => got.has(f.id)).length;
      const kind = sc.judge(got, state);
      const book = sc.book === 2 ? ENDINGS2 : ENDINGS;
      const e = book[kind];
      const reps = (sc.reports || []).map((id) => state.reports[id]).filter(Boolean);
      const repGot = reps.reduce((a, r) => a + r.got.length, 0);
      const repTotal = reps.reduce((a, r) => a + r.total, 0);
      const missing = required.filter((f) => !got.has(f.id)).map((f) => f.label);
      const susStat = sc.susStat || [["helen", "подозрение Хелен"]];
      Sound.setAmbience("room");
      $("#scene").innerHTML = `
        <section class="card-scene">
          <article class="story-card wide ending ${kind}">
            <p class="kicker">${esc(sc.kicker || "Эпилог")}</p>
            <h1>${esc(e.title)}</h1>
            ${e.text(state).filter(Boolean).map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
            ${missing.length && kind !== "best" ? `<p class="muted">Группе не хватило: ${esc(missing.join(", "))}.</p>` : ""}
            <div class="stats">
              <div><b>${gotReq}/${required.length}</b><span>живой доклад</span></div>
              <div><b>${Math.min(repGot, repTotal)}/${repTotal || 0}</b><span>утренние доклады</span></div>
              <div><b>${Object.keys(state.words).length}</b><span>слов в досье</span></div>
              ${susStat.map(([id, label]) => `<div><b>${state.sus[id] || 0}</b><span>${esc(label)}</span></div>`).join("")}
            </div>
            <div class="row">
              ${kind !== "best" ? `<button class="btn primary" data-act="night">${sc.replay ? "Пройти это место ещё раз" : "Переиграть последнюю ночь"}</button>` : ""}
              <button class="btn ${kind === "best" ? "primary" : "ghost"}" data-act="again">Сезон заново</button>
              <button class="btn ghost" data-act="title">Главное меню</button>
            </div>
            ${kind !== "fail" ? `<p class="muted small">${esc(sc.done || "")}</p>` : ""}
          </article>
        </section>`;
      $(".story-card").addEventListener("click", (ev) => {
        const a = ev.target.closest("[data-act]");
        if (!a) return;
        if (a.dataset.act === "night") {
          const back = (sc.replay && sc.replay(state)) || night;
          if (back === "s2d1-switch") state.flags.toldRoom = false;
          if (back === "s2d3-desk") state.flags.gaveKey = false;
          const mark = state.marks && state.marks[back];
          if (mark) Store.restore(mark);
          state.step = this.flow().indexOf(back);
          Store.save();
          this.run();
        } else if (a.dataset.act === "again") { Store.reset(); this.intro(0); }
        else this.title();
      });
    });
  },

  fail(text) {
    this.leave();
    this.playing = false;
    Sound.sfx("bad");
    $("#scene").innerHTML = `
      <section class="card-scene">
        <article class="story-card fail">
          ${TOON() ? '<div class="fail-ico">🔥</div>' : ""}
          <p class="kicker">${esc((typeof Pack !== "undefined" && Pack.meta().failKicker) || "Легенда сгорела")}</p>
          <h1>Провал</h1>
          <p class="lead">${esc(text)}</p>
          <div class="row"><button class="btn primary" data-act="retry">Переиграть сцену</button><button class="btn ghost" data-act="title">Главное меню</button></div>
        </article>
      </section>`;
    $(".story-card").addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "retry") { this.playing = true; this.retryScene(); } else this.title();
    });
  },

  menu() {
    if (!this.playing) return;
    this.paused = true;
    UI.modal(`
      <h2>Пауза</h2>
      <div class="menu-list">
        <button class="btn primary" data-m="resume">Продолжить</button>
        <button class="btn ghost" data-m="settings">Настройки и сложность</button>
        <button class="btn ghost" data-m="retry">${REPLAY_NIGHT[this.flow()[state.step]] ? "Переиграть ночь" : "Переиграть сцену"}</button>
        <button class="btn ghost" data-m="title">Главное меню</button>
      </div>
      <p class="muted small">Пробел — говорить. N — блокнот. Esc — пауза. Любое английское слово можно нажать.</p>`, "menu");
    $("#modal").onclick = (e) => {
      const b = e.target.closest("[data-m]");
      if (!b) return;
      const m = b.dataset.m;
      if (m === "resume") this.closeMenu();
      else if (m === "settings") this.settings(() => this.menu());
      else if (m === "retry") { this.paused = false; this.retryScene(); }
      else if (m === "title") { UI.closeModal(); this.paused = false; this.title(); }
    };
  },
  closeMenu() {
    UI.closeModal();
    $("#modal").onclick = null;
    this.paused = false;
  },

  settings(onClose) {
    const s = Settings.get();
    this.paused = true;
    const provs = Object.entries(AI.PROVIDERS).map(([k, p]) => `<option value="${k}" ${s.provider === k ? "selected" : ""}>${esc(p.label)}</option>`).join("");
    const m = UI.modal(`
      <h2>Настройки</h2>
      <section><h4>Сложность</h4>
        <div class="levels compact">${Object.entries(LEVELS).map(([k, l]) => `<button class="level ${s.difficulty === k ? "on" : ""}" data-level="${k}"><b>${l.name}</b><span>${esc(l.desc)}</span></button>`).join("")}</div>
      </section>
      <section><h4>Языковая модель</h4>
        <label>Провайдер <select name="provider">${provs}</select></label>
        <label class="f-key">Ключ API <input name="apiKey" type="password" value="${esc(s.apiKey)}" placeholder="вставьте ключ" autocomplete="off"></label>
        <label class="f-model">Модель <input name="model" value="${esc(s.model)}" placeholder=""></label>
        <label class="f-url">Адрес <input name="baseUrl" value="${esc(s.baseUrl)}" placeholder="${esc(AI.PROVIDERS.custom.url)}"></label>
        <label class="check f-cloud"><input type="checkbox" name="cloudVoices" ${s.cloudVoices ? "checked" : ""}> Живые голоса OpenAI: глухо через стену, хрип рации</label>
        <div class="row f-ping"><button class="btn ghost small" data-s="ping">Проверить связь</button><span class="ping-res muted"></span></div>
        <p class="muted small">Ключ хранится только в этом браузере. Ваши ответы и реплики сцены уходят выбранному провайдеру. Без модели игра проверяет ответы по ключевым словам и работает без сети.</p>
      </section>
      <section><h4>Звук</h4>
        <label>Голоса <input type="range" name="voiceVol" min="0" max="1" step="0.05" value="${s.voiceVol}"></label>
        <label>Фон <input type="range" name="ambVol" min="0" max="1" step="0.05" value="${s.ambVol}"></label>
        <label>Музыка <input type="range" name="musicVol" min="0" max="1" step="0.05" value="${s.musicVol ?? 0.5}"></label>
        <label>Скорость речи <input type="range" name="speed" min="0.7" max="1.2" step="0.05" value="${s.speed}"></label>
      </section>
      <div class="row"><button class="btn primary" data-s="close">Готово</button><button class="btn ghost danger-text" data-s="reset">Стереть прогресс</button></div>`, "settings");
    const sync = () => {
      const p = Settings.get().provider;
      $(".f-key", m).hidden = p === "none";
      $(".f-model", m).hidden = p === "none";
      $(".f-url", m).hidden = p !== "custom";
      $(".f-cloud", m).hidden = p !== "openai";
      $(".f-ping", m).hidden = p === "none";
      $('[name="model"]', m).placeholder = (AI.PROVIDERS[p] && AI.PROVIDERS[p].model) || "";
    };
    sync();
    m.oninput = (e) => {
      const t = e.target;
      if (!t.name) return;
      const v = t.type === "checkbox" ? t.checked : t.type === "range" ? Number(t.value) : t.value.trim();
      Settings.set({ [t.name]: v });
      if (t.name === "provider" || t.name === "apiKey") AI.resetFailures();
      sync();
    };
    m.onclick = async (e) => {
      const lv = e.target.closest("[data-level]");
      if (lv) {
        Settings.set({ difficulty: lv.dataset.level });
        $$("[data-level]", m).forEach((b) => b.classList.toggle("on", b === lv));
        return;
      }
      const b = e.target.closest("[data-s]");
      if (!b) return;
      if (b.dataset.s === "ping") {
        const out = $(".ping-res", m);
        out.textContent = "проверяю…";
        try { await AI.ping(); out.textContent = "Связь есть."; out.className = "ping-res ok"; }
        catch (err) { out.textContent = "Не вышло: " + err.message; out.className = "ping-res bad"; }
      } else if (b.dataset.s === "close") {
        UI.closeModal();
        m.oninput = null;
        m.onclick = null;
        this.paused = false;
        if (onClose) onClose();
      } else if (b.dataset.s === "reset") {
        if (!confirm("Стереть весь прогресс сезона?")) return;
        Store.reset();
        UI.closeModal();
        m.oninput = null;
        m.onclick = null;
        this.title();
      }
    };
  }
};

const ENGINES = {
  brief: (sc) => Game.brief(sc),
  ad: (sc) => Game.ad(sc),
  item: (sc) => Game.item(sc),
  talk: (sc, tok) => Talk.run(sc, tok),
  listen: (sc, tok) => Listen.run(sc, tok),
  shift: (sc, tok) => Shift.run(sc, tok),
  board: (sc, tok) => Board.run(sc, tok),
  hub: (sc, tok) => Desk.hub(sc, tok),
  switch: (sc, tok) => Desk.switch(sc, tok),
  witness: (sc, tok) => Desk.witness(sc, tok),
  phone: (sc, tok) => Phone.run(sc, tok),
  ending: (sc) => Game.ending(sc),
  chat: (sc, tok) => Chat.run(sc, tok),
  legend: (sc) => Kit.legend(sc),
  conv: (sc, tok) => Conv.run(sc, tok),
  rounds: (sc, tok) => Rounds.run(sc, tok),
  eaves: (sc, tok) => Eaves.run(sc, tok),
  stall: (sc, tok) => Stall.run(sc, tok),
  debrief: (sc) => Kit.debrief(sc),
  finale: (sc) => Kit.finale(sc),
  decode: (sc, tok) => Decode.run(sc, tok),
  crack: (sc, tok) => Crack.run(sc, tok),
  lift: (sc, tok) => Lift.run(sc, tok),
  search: (sc, tok) => Search.run(sc, tok),
  elevator: (sc, tok) => LiftCab.run(sc, tok),
  deskSearch: (sc, tok) => DeskSearch.run(sc, tok),
  caseboard: (sc, tok) => Caseboard.run(sc, tok),
  order: (sc) => OrderCard.run(sc),
  bagcheck: (sc, tok) => BagCheck.run(sc, tok),
  ride: (sc, tok) => Ride.run(sc, tok),
  drop: (sc, tok) => Drop.run(sc, tok),
  rate: (sc) => Rate.run(sc),
  doc: (sc, tok) => Doc.run(sc, tok),
  hear: (sc, tok) => Hear.run(sc, tok),
  city: (sc, tok) => City.run(sc, tok),
  sort: (sc, tok) => HaloPlay.sort(sc, tok),
  ask: (sc, tok) => HaloPlay.ask(sc, tok),
  soon: (sc) => HaloPlay.soon(sc)
};

const REPLAY_NIGHT = {
  "d1-board": "d1-night",
  "d1-report": "d1-night",
  "d2-board": "d2-night",
  "d2-report": "d2-night",
  "s2d1-board": "s2d1-nina",
  "s2d1-report": "s2d1-nina",
  "s2d2-board": "s2d2-hub",
  "s2d2-report": "s2d2-hub"
};

Game.boot();

const skipBar = $("#skip-bar");
if (skipBar) {
  skipBar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-skip]");
    if (!b) return;
    const act = b.dataset.skip;
    if (act === "prev") Game.skipScene(-1);
    else if (act === "step") Game.skipStep();
    else if (act === "next") Game.skipScene(1);
  });
}

// Enter нажимает главную кнопку экрана, когда она одна: «Дальше», «Принять заказ», «Начать».
window.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.repeat || !document.body.classList.contains("s3")) return;
  const a = document.activeElement;
  if (a && ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "SUMMARY"].includes(a.tagName)) return;
  if (!$("#modal").hidden) return;
  const main = [...document.querySelectorAll("#scene .btn.primary:not(:disabled), #scene .o-ring-btn")].filter((b) => (b.checkVisibility ? b.checkVisibility() : b.offsetParent !== null));
  if (main.length !== 1) return;
  e.preventDefault();
  main[0].click();
});
