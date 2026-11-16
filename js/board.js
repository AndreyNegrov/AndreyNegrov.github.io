// Доска улик: разложить записи по вопросам и увидеть, где две правды не сходятся.

const Board = {
  run(sc, tok) {
    return new Promise((resolve) => {
      const filled = state.boards[sc.id] || (state.boards[sc.id] = {});
      let selected = null;
      const el = document.createElement("section");
      el.className = "board";
      $("#scene").innerHTML = "";
      $("#scene").appendChild(el);

      const usable = (n) => ["heard", "partial", "seen", "mine", "item"].includes(n.kind);
      const render = () => {
        const notes = state.notes.filter(usable).slice().reverse();
        const slots = sc.slots.map((s) => `
          <div class="slot ${filled[s.id] ? "ok" : ""}" data-slot="${s.id}">
            <span class="q">${esc(s.q)}</span>
            <div class="ans">${filled[s.id] ? esc(filled[s.id]) : '<span class="muted">нажмите запись, потом сюда</span>'}</div>
          </div>`).join("");
        const pairs = (sc.pairs || []).filter((p) => filled[p.a] && filled[p.b])
          .map((p) => `<div class="pair"><b>Противоречие</b><span>${esc(p.text)}</span></div>`).join("");
        const cards = notes.length ? notes.map((n) => {
          const locked = !!n.hidden;
          return `<div class="card-wrap ${selected === n.id ? "sel" : ""} ${locked ? "locked" : ""}" data-card="${n.id}" draggable="${!locked}">${noteHTML(n)}</div>`;
        }).join("") : '<p class="muted">Записей нет. Можно дописать своё.</p>';
        const deaf = level().subs === "none";
        el.innerHTML = `
          <div class="bd-head">
            <div><p class="kicker">Доска улик</p><h2>${esc(sc.title)}</h2><p class="muted">${esc(sc.intro)}</p></div>
            <div class="row">
              <button class="btn ghost" data-act="replay">Ещё раз ночь</button>
              <button class="btn primary" data-act="done">Выйти на связь</button>
            </div>
          </div>
          <div class="bd-grid">
            <div class="bd-slots">${slots}${pairs}</div>
            <div class="bd-cards">
              <form class="bd-add"><input type="text" placeholder="Своя запись по-английски, Enter" autocomplete="off"></form>
              ${deaf ? '<p class="muted small">В режиме «Глухо» у записей нет текста. Прослушайте и запишите ответ своими словами.</p>' : ""}
              ${cards}
            </div>
          </div>`;
      };

      const tryPlace = (noteId, slotId) => {
        const n = state.notes.find((x) => x.id === noteId);
        const s = sc.slots.find((x) => x.id === slotId);
        if (!n || !s || filled[s.id] || n.hidden) return;
        const before = (sc.pairs || []).filter((p) => filled[p.a] && filled[p.b]).length;
        if (matchFact(n.text, s)) {
          filled[s.id] = n.text.length > 110 ? n.text.slice(0, 107) + "…" : n.text;
          selected = null;
          Store.save();
          Sound.sfx("ok");
          render();
          const after = (sc.pairs || []).filter((p) => filled[p.a] && filled[p.b]);
          if (after.length > before) { UI.caption(after[after.length - 1].text, "bad", 6500); Sound.sfx("bad"); }
        } else {
          Sound.sfx("bad");
          const slotEl = $(`[data-slot="${s.id}"]`, el);
          if (slotEl) { slotEl.classList.remove("shake"); void slotEl.offsetWidth; slotEl.classList.add("shake"); }
          UI.toast(`Эта запись не отвечает на вопрос «${esc(s.q)}».`, "info");
        }
      };

      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-play]") || e.target.closest(".w")) return;
        if (e.target.closest('[data-act="done"]')) { Store.save(); return resolve(); }
        if (e.target.closest('[data-act="replay"]')) return Game.retryScene();
        const card = e.target.closest("[data-card]");
        if (card && !card.classList.contains("locked")) { selected = selected === card.dataset.card ? null : card.dataset.card; render(); return; }
        const slot = e.target.closest("[data-slot]");
        if (slot && selected) tryPlace(selected, slot.dataset.slot);
      });
      el.addEventListener("dragstart", (e) => {
        const card = e.target.closest("[data-card]");
        if (card) e.dataTransfer.setData("text/plain", card.dataset.card);
      });
      el.addEventListener("dragover", (e) => { if (e.target.closest("[data-slot]")) e.preventDefault(); });
      el.addEventListener("drop", (e) => {
        const slot = e.target.closest("[data-slot]");
        if (!slot) return;
        e.preventDefault();
        tryPlace(e.dataTransfer.getData("text/plain"), slot.dataset.slot);
      });
      el.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("input", e.target);
        const text = input.value.trim();
        if (!text) return;
        const n = Notes.add({ kind: "mine", text, time: Game.clockText() });
        selected = n.id;
        render();
        $(".bd-add input", el).focus();
      });
      render();
    });
  }
};
