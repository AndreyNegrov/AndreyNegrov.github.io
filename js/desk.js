// Второй сезон: куда пойти, один звонок на коммутаторе, разговор который вы слышите сами.

const Desk = {
  hub(sc, tok) {
    return new Promise((resolve) => {
      const draw = () => {
        if (tok.dead) return;
        UI.setBg(sc.bg, sc.look || "day");
        UI.hud(sc);
        const places = sc.places.map((p) => {
          const done = !!state.flags[p.flag];
          return `<button class="place ${done ? "done" : ""}" data-place="${p.id}" ${done ? "disabled" : ""}>
            <b>${esc(p.title)}</b><span>${esc(p.lead)}</span>${done ? "<i>уже были</i>" : ""}
          </button>`;
        }).join("");
        const ready = sc.places.every((p) => state.flags[p.flag]);
        $("#scene").innerHTML = `
          <section class="card-scene">
            <article class="story-card wide">
              <p class="kicker">${esc(sc.kicker || sc.place || "")}</p>
              <h1>${esc(sc.title)}</h1>
              <p class="lead">${esc(val(sc.intro, state))}</p>
              <div class="place-grid">${places}</div>
              <div class="row"><button class="btn primary" data-act="done" ${ready ? "" : "disabled"}>Дальше</button></div>
            </article>
          </section>`;
      };
      const onClick = async (e) => {
        const placeId = e.target.closest("[data-place]")?.dataset.place;
        const done = e.target.closest('[data-act="done"]');
        if (done && sc.places.every((p) => state.flags[p.flag])) {
          $("#scene").removeEventListener("click", onClick);
          resolve();
          return;
        }
        const place = sc.places.find((p) => p.id === placeId);
        if (!place || state.flags[place.flag] || tok.dead) return;
        $("#scene").removeEventListener("click", onClick);
        const nested = place.scene;
        nested.id = sc.id + "-" + place.id;
        UI.setBg(nested.bg, nested.look || "day");
        UI.hud(nested);
        if (nested.type === "talk") await Talk.run(nested, tok);
        else await Desk.witness(nested, tok);
        PTT.unbind();
        if (tok.dead) return;
        state.flags[place.flag] = true;
        Store.save();
        $("#scene").addEventListener("click", onClick);
        draw();
      };
      $("#scene").addEventListener("click", onClick);
      Game.onLeave(() => $("#scene").removeEventListener("click", onClick));
      draw();
    });
  },

  witness(sc, tok) {
    return new Promise((resolve) => {
      const lines = (sc.lines || []).filter((l) => !l.when || l.when(state));
      let i = 0;
      const show = async () => {
        if (tok.dead) return;
        if (i >= lines.length) { $("#scene").removeEventListener("click", onClick); resolve(); return; }
        const line = lines[i];
        const lv = level();
        const shown = lv.subs === "live" ? enHTML(line.text) : '<span class="veil">• • •</span>';
        $("#scene").innerHTML = `
          <section class="card-scene">
            <article class="story-card">
              <p class="kicker">${esc(sc.kicker || "")}</p>
              <h1>${esc(sc.title || "")}</h1>
              <div class="person">${avatar(line.who, "lg")}<div><b>${esc(PEOPLE[line.who].name)}</b><span>${esc(PEOPLE[line.who].role)}</span></div></div>
              <p class="lead english">${shown}</p>
              <div class="row"><button class="btn primary" data-act="next">${i === lines.length - 1 ? "Я запомнил" : "Дальше"}</button></div>
            </article>
          </section>`;
        Notes.add({
          kind: "heard", src: "talk", scene: sc.id, who: line.who, time: sc.time || "",
          text: line.text, hidden: lv.subs === "live" ? false : lv.subs === "after" ? "after" : "always"
        });
        Voice.say(line.text, { who: line.who });
      };
      const onClick = (e) => {
        if (!e.target.closest('[data-act="next"]') || tok.dead) return;
        Voice.stop();
        i += 1;
        show();
      };
      $("#scene").addEventListener("click", onClick);
      Game.onLeave(() => { $("#scene").removeEventListener("click", onClick); Voice.stop(); });
      show();
    });
  },

  switch(sc, tok) {
    return new Promise((resolve) => {
      const call = sc.call;
      let mode = "hear";
      let reply = null;
      let tries = 0;
      let banner = "";
      const paint = () => {
        const lv = level();
        const heard = mode === "hear" ? "" : (lv.subs === "live" || mode === "bad" || mode === "ok"
          ? `<p class="lead english">${enHTML(call.text)}</p>` : `<p class="lead veil">• • •</p>`);
        $("#scene").innerHTML = `
          <section class="card-scene">
            <article class="story-card">
              <p class="kicker">Входящий звонок</p>
              <div class="person">${avatar(call.who, "lg")}<div><b>${esc(PEOPLE[call.who].name)}</b><span>${esc(call.from)}</span></div></div>
              <h1>${esc(mode === "bad" ? "Вы соединили" : mode === "ok" ? "Вы не соединили" : "Коммутатор")}</h1>
              ${mode === "hear" ? `<p class="lead">${esc(sc.intro)}</p>` : heard}
              ${mode === "bad" ? `<p class="lead">${esc(banner || call.bad)}</p>` : ""}
              ${mode === "ok" ? `<p class="lead">${esc(call.good)}</p>` : ""}
              ${mode === "choose" ? `<p class="talk-hint">${esc(call.hint)}</p>` : ""}
              <div class="row" data-actions></div>
              <div data-reply></div>
            </article>
          </section>`;
        const actions = $("[data-actions]");
        if (mode === "hear") actions.innerHTML = `<button class="btn primary" data-act="listen">Слушать</button>`;
        if (mode === "choose") actions.innerHTML = `
          <button class="btn ghost" data-act="connect">Соединить</button>
          <button class="btn primary" data-act="refuse">Не соединять</button>`;
        if (mode === "bad" || mode === "ok") actions.innerHTML = `<button class="btn primary" data-act="done">Дальше</button>`;
      };
      const listen = async () => {
        mode = "play";
        paint();
        await Voice.sayAsync(call.text, { who: call.who });
        if (tok.dead) return;
        Notes.add({
          kind: "heard", src: "phone", scene: sc.id, who: call.who, time: sc.time || "",
          text: call.text, hidden: level().subs === "live" ? false : level().subs === "after" ? "after" : "always"
        });
        mode = "choose";
        paint();
      };
      const refuse = async () => {
        mode = "reply";
        paint();
        reply = ReplyBox($("[data-reply]"), { placeholder: "ответьте по-английски и нажмите Enter" });
        const text = await reply.wait();
        if (tok.dead || text == null) return;
        const beat = { say: call.text, facts: call.facts || [], forbid: call.forbid || [], hint: call.hint };
        const fake = { npc: call.who, persona: sc.persona, situation: sc.situation, forbid: [] };
        const judged = await Talk.judge(fake, beat, call.who, "en", text, new Set(), []);
        if (tok.dead) return;
        reply.destroy();
        reply = null;
        PTT.unbind();
        if (judged.russian) {
          mode = "choose";
          paint();
          UI.toast("По-английски.", "info");
          return;
        }
        if (judged.leakHits.length) {
          judged.leakHits.forEach((f) => { if (f.flag) state.flags[f.flag] = true; addSus("ade", f.sus == null ? 0 : f.sus, f.label); });
          Store.save();
          banner = call.saidRoom || call.bad;
          mode = "bad";
          paint();
          return;
        }
        const facts = beat.facts;
        const got = new Set(judged.facts || []);
        if (facts.length && facts.some((f) => !got.has(f.id))) {
          tries += 1;
          mode = "choose";
          paint();
          UI.toast(tries >= 3 ? "Скажите, что номер комнаты по телефону не называют." : "Этого мало. Скажите, что соединить не можете.", "info", 5000);
          return;
        }
        state.flags.refusedGraham = true;
        Store.save();
        mode = "ok";
        paint();
      };
      const onClick = (e) => {
        const act = e.target.closest("[data-act]")?.dataset.act;
        if (!act || tok.dead) return;
        if (act === "listen") listen();
        else if (act === "connect") { state.flags.toldRoom = true; Store.save(); mode = "bad"; paint(); }
        else if (act === "refuse") refuse();
        else if (act === "done") {
          $("#scene").removeEventListener("click", onClick);
          Voice.stop();
          if (reply) reply.destroy();
          resolve();
        }
      };
      $("#scene").addEventListener("click", onClick);
      Game.onLeave(() => {
        $("#scene").removeEventListener("click", onClick);
        Voice.stop();
        if (reply) reply.destroy();
      });
      paint();
    });
  }
};
