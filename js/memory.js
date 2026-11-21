// Воспоминание на слух. Человек рассказывает — игрок слушает и отвечает на вопросы для карточки.
// Сцена: { type: "hear", who, lines: [фразы], qs: [{ q, opts (первый — верный), clue }], tag, code, badge }.

const Hear = {
  async run(sc, tok) {
    const who = sc.who, P = PEOPLE[who], qs = sc.qs;
    const bars = Array.from({ length: 36 }, (_, i) => `<i style="--h:${6 + ((i * 37) % 23)}px"></i>`).join("");
    $("#scene").innerHTML = `
      <section class="a-game dc hr">
        <div class="dc-doc">
          <div class="hr-card">
            <header><span class="hr-tag">${esc(sc.tag || "Запись приёма")}</span><span class="hr-code">${esc(sc.code || "")}</span></header>
            <div class="hr-who">${avatar(who, "md")}<div><b>${esc(P.name)}</b><span>${esc(P.role)}</span></div></div>
            <div class="hr-wave">${bars}</div>
            <ol class="hr-lines english">${sc.lines.map((t) => `<li><span class="hr-veil">${"•".repeat(Math.min(34, Math.max(10, Math.round(t.length / 2))))}</span><span class="hr-text">${enHTML(t)}</span></li>`).join("")}</ol>
            <div class="row hr-btns">
              <button class="btn primary" data-act="play">${ICON.play} Слушать</button>
              <button class="btn ghost small" data-act="slow">Медленно</button>
              <button class="btn ghost small" data-act="text">Показать текст</button>
            </div>
          </div>
        </div>
        <aside class="a-card dc-side">
          <header class="a-top"><span class="a-kicker">${esc(sc.kicker || "Воспоминание")}</span><span class="a-kicker dim dc-n"></span></header>
          <div class="a-timer"><i></i></div>
          <p class="dc-q"></p>
          <div class="dc-opts"></div>
          <p class="muted small hr-note">Слушать можно сколько угодно. Открыл(а) текст — репутации вдвое меньше.</p>
        </aside>
      </section>`;
    const root = $(".hr"), card = $(".hr-card", root);
    await Arcade.intro(sc, { ico: "ear", keys: sc.keys || ["Слушай: где, когда, кто", "Кнопка «Медленно» — без штрафа", "Текст — крайний случай"], btn: "Слушать" });
    if (tok.dead) return null;

    let playing = 0, peek = false;
    const play = async (slow) => {
      const run = ++playing;
      Voice.stop();
      card.classList.add("on");
      const rows = $$(".hr-lines li", root);
      for (let i = 0; i < sc.lines.length; i++) {
        if (run !== playing || tok.dead) return;
        rows.forEach((r, k) => r.classList.toggle("cur", k === i));
        await Voice.sayAsync(sc.lines[i], { who, rate: slow ? 0.72 : 1 });
        if (run !== playing || tok.dead) return;
        await sleep(slow ? 500 : 280);
      }
      rows.forEach((r) => r.classList.remove("cur"));
      card.classList.remove("on");
    };
    const stop = () => { playing++; Voice.stop(); card.classList.remove("on"); };
    Game.onLeave(stop);
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      if (b.dataset.act === "play") play(false);
      if (b.dataset.act === "slow") play(true);
      if (b.dataset.act === "text") { peek = true; card.classList.add("open"); b.disabled = true; }
    });

    // Первый раз слушаем целиком, вопросы — после.
    $(".dc-q", root).textContent = "Слушай. Вопросы появятся, когда рассказ закончится.";
    await play(false);
    if (tok.dead) return null;

    let right = 0;
    for (let i = 0; i < qs.length; i++) {
      const ok = await Doc.ask({ secs: sc.secs || 40 }, tok, root, qs[i], i, qs.length);
      if (tok.dead) return null;
      if (ok) right += 1;
      if (qs[i].clue) Clues.add(qs[i].clue, !ok);
    }
    stop();
    card.classList.add("open");
    if (sc.done) sc.done(state, { right, peek });
    if (!peek && right === qs.length) Juice.badge(sc.badge || "listener");
    Store.save();
    const act = await Arcade.result(sc, { score: right, max: qs.length, xp: right * (peek ? 7 : 14), line: `Верных ответов: ${right} из ${qs.length}${peek ? " · с текстом" : " · на слух"}` });
    return act === "again" ? { again: true } : null;
  }
};
