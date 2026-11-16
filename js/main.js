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

  day() { const sc = SCENES[FLOW[state.step]]; return sc ? sc.day : 1; },
  clockText() { return $("#hud-time").textContent || ""; },
  inPlay() { return this.playing; },
  onLeave(fn) { this.cleanups.push(fn); },
  leave() {
    if (this.tok) this.tok.dead = true;
    const fns = this.cleanups;
    this.cleanups = [];
    fns.forEach((f) => { try { f(); } catch (e) { console.warn(e); } });
    Voice.stop();
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

  title() {
    this.leave();
    this.playing = false;
    UI.hideHud();
    UI.setBg("art/flat.jpg", "night");
    Sound.setAmbience(null);
    const has = state.started && state.step > 0;
    $("#scene").innerHTML = `
      <section class="title">
        <p class="kicker">Сезон 1</p>
        <h1>ИНЕЙ</h1>
        <p class="subtitle">Квартира 4B</p>
        <p class="lead">Английский здесь — это работа под прикрытием. Слушать через стену, ловить рацию, держать легенду и докладывать.</p>
        <div class="row center">
          ${has ? '<button class="btn primary" data-act="continue">Продолжить</button>' : ""}
          <button class="btn ${has ? "ghost" : "primary"}" data-act="new">${has ? "Начать сезон заново" : "Начать"}</button>
          <button class="btn ghost" data-act="settings">Настройки</button>
        </div>
        <p class="muted small">Лучше всего в Chrome или Edge, в наушниках и с микрофоном.</p>
      </section>`;
    $(".title").addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      Sound.ensure();
      if (a.dataset.act === "continue") this.run();
      else if (a.dataset.act === "new") {
        if (has && !confirm("Начать сезон заново? Прогресс сотрётся.")) return;
        Store.reset();
        this.intro(0);
      } else if (a.dataset.act === "settings") this.settings();
    });
  },

  intro(i) {
    this.leave();
    this.playing = false;
    UI.hideHud();
    if (i >= INTRO.length) return this.chooseLevel();
    const s = INTRO[i];
    UI.setBg(s.img || "art/cabinet.jpg", "dusk");
    Sound.setAmbience("room");
    const text = s.text || (s.steps || []).join(" ");
    $("#scene").innerHTML = `
      <section class="card-scene">
        <article class="story-card">
          ${s.who ? `<div class="person">${avatar(s.who, "lg")}<div><b>Подполковник Ремезов</b><span>${esc(PEOPLE[s.who].role)}</span></div></div>` : ""}
          <p class="kicker">Вступление · ${i + 1} из ${INTRO.length}</p>
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
    const id = FLOW[state.step];
    const sc = SCENES[id];
    if (!sc) return this.title();
    if (sc.skip && sc.skip(state)) { state.step += 1; Store.save(); return this.run(); }
    state.started = true;
    state.checkpoint = Store.snapshot();
    if (sc.type === "listen") state.marks = { ...(state.marks || {}), [id]: state.checkpoint };
    Store.save();
    const tok = (this.tok = { dead: false });
    this.playing = true;
    this.paused = false;
    UI.setBg(sc.bg, sc.look || "day");
    UI.hud(sc);
    Sound.setAmbience(sc.ambience || "room");
    if (SUS_PEOPLE.includes(sc.npc)) { state.met[sc.npc] = true; UI.renderSus(); }
    let result;
    try {
      result = await ENGINES[sc.type](sc, tok);
    } catch (e) {
      console.error(e);
      UI.toast("Сцена сломалась: " + esc(e.message) + ". Переиграйте её из паузы.", "bad", 9000);
      return;
    }
    if (tok.dead) return;
    if (result && result.fail) return this.fail(result.fail);
    if (result && result.goto) { state.step = FLOW.indexOf(result.goto); Store.save(); return this.run(); }
    state.step += 1;
    Store.save();
    this.run();
  },

  retryScene() {
    UI.closeModal();
    const id = FLOW[state.step];
    const night = REPLAY_NIGHT[id];
    if (night && state.marks && state.marks[night]) Store.restore(state.marks[night]);
    else if (night) {
      state.notes = state.notes.filter((n) => n.scene !== night);
      delete state.boards[id];
      state.step = FLOW.indexOf(night);
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
            ${sc.goals ? `<ul class="goals">${sc.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}
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
            <p class="listing-no">4B</p>
            <p class="listing-title">${esc(sc.paperTitle || "TO LET")}</p>
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
      const got = new Set(state.live["d3-night"] || []);
      const all = SCENES["d3-night"].live.facts;
      const kind = got.size >= 3 && got.has("code3") && got.has("room") ? "best" : got.size >= 1 ? "partial" : "fail";
      const e = ENDINGS[kind];
      const reps = ["d1-report", "d2-report"].map((id) => state.reports[id]).filter(Boolean);
      const repGot = reps.reduce((a, r) => a + r.got.length, 0);
      const repTotal = reps.reduce((a, r) => a + r.total, 0);
      const missing = all.filter((f) => !got.has(f.id)).map((f) => f.label);
      Sound.setAmbience("room");
      $("#scene").innerHTML = `
        <section class="card-scene">
          <article class="story-card wide ending ${kind}">
            <p class="kicker">Эпилог · 01:15</p>
            <h1>${esc(e.title)}</h1>
            ${e.text(state).filter(Boolean).map((p) => `<p class="lead">${esc(p)}</p>`).join("")}
            ${missing.length && kind !== "best" ? `<p class="muted">Группе не хватило: ${esc(missing.join(", "))}.</p>` : ""}
            <div class="stats">
              <div><b>${got.size}/${all.length}</b><span>живой доклад</span></div>
              <div><b>${Math.min(repGot, repTotal)}/${repTotal || 0}</b><span>утренние доклады</span></div>
              <div><b>${Object.keys(state.words).length}</b><span>слов в досье</span></div>
              <div><b>${state.sus.helen || 0}</b><span>подозрение Хелен</span></div>
            </div>
            <div class="row">
              ${kind !== "best" ? '<button class="btn primary" data-act="night">Переиграть последнюю ночь</button>' : ""}
              <button class="btn ${kind === "best" ? "primary" : "ghost"}" data-act="again">Сезон заново</button>
              <button class="btn ghost" data-act="title">Главное меню</button>
            </div>
            ${kind !== "fail" ? '<p class="muted small">Конец первого сезона.</p>' : ""}
          </article>
        </section>`;
      $(".story-card").addEventListener("click", (ev) => {
        const a = ev.target.closest("[data-act]");
        if (!a) return;
        if (a.dataset.act === "night") {
          const mark = state.marks && state.marks["d3-night"];
          if (mark) Store.restore(mark);
          state.step = FLOW.indexOf("d3-night");
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
          <p class="kicker">Легенда сгорела</p>
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
        <button class="btn ghost" data-m="retry">${REPLAY_NIGHT[FLOW[state.step]] ? "Переиграть ночь" : "Переиграть сцену"}</button>
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
  ending: (sc) => Game.ending(sc)
};

const REPLAY_NIGHT = {
  "d1-board": "d1-night",
  "d1-report": "d1-night",
  "d2-board": "d2-night",
  "d2-report": "d2-night"
};

Game.boot();
