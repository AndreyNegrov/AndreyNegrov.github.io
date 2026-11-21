// Распознавание речи браузера и рация «нажал — говоришь».

const Mic = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, finalText = "", interim = "", waiter = null, error = null;
  const text = () => (finalText + " " + interim).replace(/\s+/g, " ").trim();

  return {
    supported: () => !!SR,
    error: () => error,
    start(onLive) {
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
      r.onerror = (e) => { error = e.error; };
      r.onend = () => {
        if (rec === r) rec = null;
        if (waiter) { const w = waiter; waiter = null; w(text()); }
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
      if (rec) { try { rec.abort(); } catch { /* idle */ } rec = null; }
      waiter = null;
    }
  };
})();

const PTT = (() => {
  let handler = null, down = false;
  const typing = () => {
    const a = document.activeElement;
    return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT" || a.isContentEditable);
  };
  function press() { if (down || !handler) return; down = true; handler.start(); }
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
