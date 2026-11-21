// Распознавание речи браузера. Кнопка «Говорить» — нажал, сказал, нажал ещё раз; пробел — держишь, пока говоришь.

const Mic = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  // Страница, открытая с диска (file://), не может запомнить разрешение: браузер спрашивает при каждом включении.
  const isFile = location.protocol === "file:";
  let rec = null, finalText = "", interim = "", waiter = null, error = null;
  let perm = "unknown", fileNoted = false;
  const text = () => (finalText + " " + interim).replace(/\s+/g, " ").trim();

  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "microphone" }).then((st) => {
      perm = st.state;
      st.onchange = () => { perm = st.state; };
    }).catch(() => { /* браузер не отдаёт состояние — узнаем при первом включении */ });
  }

  return {
    supported: () => !!SR,
    error: () => error,
    isFile: () => isFile,
    perm: () => perm,
    // Обычный запрос доступа. На http/https ответ запоминается, и распознавание больше не спрашивает.
    async ask() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        perm = "granted";
        return true;
      } catch (e) {
        if (e && (e.name === "NotAllowedError" || e.name === "SecurityError")) perm = "denied";
        return false;
      }
    },
    // Один раз за запуск объясняем, почему браузер переспрашивает и как это убрать.
    fileNote() {
      if (!isFile || fileNoted) return;
      fileNoted = true;
      UI.toast("Игра открыта как файл, поэтому браузер спрашивает про микрофон каждый раз. Запусти её через play.cmd в папке игры — спросит один раз и запомнит.", "info", 12000);
    },
    start(onLive, onSelfEnd) {
      if (!SR) return false;
      if (rec) { try { rec.abort(); } catch { /* idle */ } }
      finalText = ""; interim = ""; error = null;
      const r = new SR();
      rec = r;
      r.lang = "en-US";
      r.interimResults = true;
      r.continuous = true;
      r.maxAlternatives = 1;
      r.onresult = (e) => {
        let f = "", i = "";
        for (let k = 0; k < e.results.length; k++) {
          const res = e.results[k];
          if (res.isFinal) f += res[0].transcript + " "; else i += res[0].transcript + " ";
        }
        finalText = f;
        interim = i;
        if (onLive) onLive(text());
      };
      r.onerror = (e) => {
        error = e.error;
        if (e.error === "not-allowed" || e.error === "service-not-allowed") { if (!isFile) perm = "denied"; }
      };
      r.onstart = () => { if (!isFile) perm = "granted"; };
      r.onend = () => {
        const mine = rec === r;
        if (mine) rec = null;
        if (waiter) { const w = waiter; waiter = null; w(text()); }
        else if (mine && onSelfEnd) onSelfEnd();   // браузер сам закончил слушать (тишина, отказ, обрыв)
      };
      try { r.start(); } catch { error = "start"; rec = null; return false; }
      return true;
    },
    stop() {
      return new Promise((resolve) => {
        if (!rec) return resolve(text());
        waiter = resolve;
        try { rec.stop(); } catch { waiter = null; resolve(text()); return; }
        setTimeout(() => { if (waiter === resolve) { waiter = null; resolve(text()); } }, 1800);
      });
    },
    abort() {
      const r = rec;
      rec = null;
      waiter = null;
      if (r) { try { r.abort(); } catch { /* idle */ } }
    }
  };
})();

const PTT = (() => {
  let handler = null, down = false;
  const typing = () => {
    const a = document.activeElement;
    return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT" || a.isContentEditable);
  };
  function press() { if (down || !handler) return; down = true; handler.start("hold"); }
  function release() { if (!down) return; down = false; if (handler) handler.end(); }
  window.addEventListener("keydown", (e) => {
    if (e.code !== "Space" || e.repeat || !handler || typing()) return;
    if (!$("#modal").hidden) return;
    e.preventDefault();
    press();
  });
  window.addEventListener("keyup", (e) => {
    if (e.code !== "Space" || !down) return;
    e.preventDefault();
    release();
  });
  window.addEventListener("blur", release);
  return {
    bind(h) { handler = h; },
    unbind(h) { if (!h || handler === h) { release(); handler = null; } },
    press, release
  };
})();
