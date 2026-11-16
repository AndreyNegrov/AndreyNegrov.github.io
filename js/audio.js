// Звук: фон локаций, шумы и эффекты на Web Audio, голоса персонажей.

const Sound = (() => {
  let ctx = null, master, amb, sfxBus, voiceBus;
  const buffers = {};
  let current = null;
  let staticNode = null;

  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    amb = ctx.createGain(); amb.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    voiceBus = ctx.createGain(); voiceBus.connect(master);
    applyVolumes();
    return ctx;
  }
  function applyVolumes() {
    if (!ctx) return;
    const s = Settings.get();
    amb.gain.value = s.ambVol;
    sfxBus.gain.value = Math.max(0.35, s.ambVol);
    voiceBus.gain.value = s.voiceVol;
  }
  function noise(type) {
    if (!buffers[type]) {
      const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0, b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (type === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
        else if (type === "pink") {
          b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
          d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
        } else d[i] = w;
      }
      buffers[type] = buf;
    }
    const s = ctx.createBufferSource();
    s.buffer = buffers[type];
    s.loop = true;
    return s;
  }
  function filter(type, freq, q = 0.7) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function chain(...nodes) { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; }

  function bed(name) {
    const out = gain(0);
    out.connect(amb);
    const nodes = [], timers = [];
    const add = (src) => { nodes.push(src); src.start(); return src; };
    let street = null;
    add(noise("brown")).connect(filter("lowpass", 160)).connect(gain(name === "night" ? 0.3 : 0.22)).connect(out);
    if (name === "night") {
      street = gain(0.05);
      chain(add(noise("pink")), filter("lowpass", 900), filter("highpass", 120), street, out);
    }
    if (name === "cafe") {
      chain(add(noise("pink")), filter("highpass", 900), filter("lowpass", 7000), gain(0.1), out);
      const murmur = gain(0.05);
      chain(add(noise("pink")), filter("bandpass", 450, 0.8), murmur, out);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.25;
      const depth = gain(0.03);
      lfo.connect(depth); depth.connect(murmur.gain);
      add(lfo);
      timers.push(setInterval(() => { if (Math.random() < 0.55) clink(0.035); }, 2400));
    }
    out.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
    return { name, out, nodes, timers, street };
  }
  function setAmbience(name) {
    if (!ensure()) return;
    if (current && current.name === name) return;
    if (current) {
      const c = current;
      c.timers.forEach(clearInterval);
      c.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => c.nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }), 1800);
    }
    current = name ? bed(name) : null;
  }
  function setWindow(open) {
    if (current && current.street) current.street.gain.setTargetAtTime(open ? 0.34 : 0.05, ctx.currentTime, 0.3);
  }

  function staticOn() {
    if (!ensure() || staticNode) return;
    const n = noise("white"), g = gain(0);
    chain(n, filter("bandpass", 1900, 0.6), g, sfxBus);
    n.start();
    staticNode = { n, g };
  }
  function staticLevel(v) { if (staticNode) staticNode.g.gain.setTargetAtTime(v, ctx.currentTime, 0.05); }
  function staticOff() {
    if (!staticNode) return;
    const s = staticNode;
    staticNode = null;
    s.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    setTimeout(() => { try { s.n.stop(); } catch { /* already stopped */ } }, 300);
  }

  // Неразборчивая речь: шум, нарезанный на «слоги».
  function babble(seconds, { level = 0.12, cutoff = 500 } = {}) {
    if (!ensure()) return () => {};
    const n = noise("pink"), bp = filter("bandpass", 380, 1.2), g = gain(0);
    chain(n, bp, filter("lowpass", cutoff), g, sfxBus);
    n.start();
    const t0 = ctx.currentTime;
    let t = t0;
    while (t < t0 + seconds) {
      const syl = 0.09 + Math.random() * 0.16;
      const gap = 0.03 + Math.random() * 0.12 + (Math.random() < 0.15 ? 0.3 : 0);
      g.gain.setTargetAtTime(level * (0.5 + Math.random() * 0.6), t, 0.02);
      bp.frequency.setTargetAtTime(260 + Math.random() * 420, t, 0.03);
      g.gain.setTargetAtTime(0, t + syl, 0.03);
      t += syl + gap;
    }
    n.stop(t0 + seconds + 0.3);
    return () => {
      try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, 0.03); n.stop(ctx.currentTime + 0.2); }
      catch { /* already stopped */ }
    };
  }

  function tone(freq, dur, { type = "sine", vol = 0.2, at = 0, attack = 0.005, lp } = {}) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = gain(0);
    const t = ctx.currentTime + at;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (lp) chain(o, filter("lowpass", lp), g, sfxBus); else chain(o, g, sfxBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function burst(dur, { freq = 2000, q = 0.8, vol = 0.3, at = 0, type = "bandpass", noiseType = "white" } = {}) {
    const n = noise(noiseType), g = gain(0), t = ctx.currentTime + at;
    chain(n, filter(type, freq, q), g, sfxBus);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.start(t);
    n.stop(t + dur + 0.05);
  }
  function swell(peak, rise, total, cutoff) {
    const n = noise("brown"), g = gain(0), t = ctx.currentTime;
    chain(n, filter("lowpass", cutoff), g, sfxBus);
    g.gain.linearRampToValueAtTime(peak, t + rise);
    g.gain.linearRampToValueAtTime(0, t + total);
    n.start();
    n.stop(t + total + 0.2);
  }
  function clink(vol = 0.08) {
    const f = 2200 + Math.random() * 1600;
    tone(f, 0.25, { vol });
    tone(f * 1.48, 0.18, { vol: vol * 0.6, at: 0.01 });
  }
  const SFX = {
    "ptt-on": () => { burst(0.05, { freq: 2500, vol: 0.25 }); tone(1200, 0.07, { vol: 0.12, at: 0.03 }); },
    "ptt-off": () => burst(0.18, { freq: 2200, vol: 0.18 }),
    squelch: () => { burst(0.22, { freq: 2600, vol: 0.35 }); tone(1400, 0.06, { vol: 0.1 }); },
    ring: () => { for (let k = 0; k < 2; k++) { tone(440, 0.9, { vol: 0.05, at: k * 1.6, lp: 600, type: "square" }); tone(480, 0.9, { vol: 0.05, at: k * 1.6, lp: 600, type: "square" }); } },
    phone: () => { for (let k = 0; k < 4; k++) tone(150, 0.3, { vol: 0.3, at: k * 0.45, type: "square", lp: 320 }); },
    knock: () => { for (let k = 0; k < 3; k++) burst(0.08, { freq: 180, q: 1, vol: 0.9, at: k * 0.22, type: "lowpass", noiseType: "brown" }); },
    engine: () => swell(0.9, 1.2, 5, 140),
    car: () => swell(0.8, 2, 4.5, 260),
    window: () => { burst(0.5, { freq: 900, vol: 0.18, type: "lowpass", noiseType: "pink" }); tone(90, 0.12, { vol: 0.2, type: "triangle" }); },
    serve: () => clink(0.12),
    coin: () => { tone(1320, 0.12, { vol: 0.1 }); tone(1760, 0.18, { vol: 0.1, at: 0.08 }); },
    ok: () => { tone(660, 0.15, { vol: 0.08 }); tone(990, 0.25, { vol: 0.08, at: 0.1 }); },
    bad: () => { tone(220, 0.25, { vol: 0.12, type: "triangle" }); tone(180, 0.3, { vol: 0.1, type: "triangle", at: 0.12 }); },
    note: () => tone(1046, 0.12, { vol: 0.05 }),
    click: () => burst(0.03, { freq: 3000, vol: 0.15 })
  };
  function sfx(name) {
    if (!ensure() || !SFX[name]) return;
    try { SFX[name](); } catch (e) { console.warn(e); }
  }

  return {
    ensure, applyVolumes, setAmbience, setWindow, staticOn, staticLevel, staticOff, babble, sfx, filter, gain, chain,
    get ctx() { return ctx; }, get voiceBus() { return voiceBus; }
  };
})();

const Voice = (() => {
  const synth = window.speechSynthesis;
  let voices = [];
  let current = null;
  let lastCancel = 0;
  let cloudBroken = false;
  const cache = new Map();

  function load() { voices = synth ? synth.getVoices() : []; }
  if (synth) { load(); synth.onvoiceschanged = load; }

  const FEMALE = /female|aria|jenny|zira|susan|hazel|libby|sonia|emma|ava|michelle|samantha|karen|moira|tessa|fiona|victoria|serena|kate|catherine|natasha|clara|google us english|svetlana|irina|dariya|ekaterina|milena/i;
  const MALE = /\bmale\b|guy|david|mark|george|ryan|christopher|eric|brian|andrew|roger|steffan|thomas|daniel|alex|fred|liam|william|james|dmitry|pavel|maxim/i;
  const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

  function pick(lang, g, seed) {
    const pool = voices.filter((v) => (v.lang || "").toLowerCase().replace("_", "-").startsWith(lang));
    if (!pool.length) return null;
    const nice = pool.filter((v) => /natural|online|neural|google/i.test(v.name));
    const base = nice.length ? nice : pool;
    const byG = base.filter((v) => (g === "f" ? FEMALE.test(v.name) && !MALE.test(v.name) : MALE.test(v.name)));
    const list = byG.length ? byG : base;
    return list[seed % list.length];
  }

  function browserSay(text, o) {
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    const lang = o.lang === "ru" ? "ru" : "en";
    const v = synth ? pick(lang, o.g, o.seed) : null;
    if (!synth || (lang === "ru" && !v)) {
      const t = setTimeout(() => resolve(true), lang === "ru" ? 700 : 10);
      return { done, stop() { clearTimeout(t); resolve(false); }, progress: () => 1 };
    }
    const u = new SpeechSynthesisUtterance(text);
    if (v) u.voice = v;
    u.lang = lang === "ru" ? "ru-RU" : "en-US";
    u.rate = clamp(o.rate, 0.5, 1.6);
    u.pitch = clamp(o.pitch ?? 1, 0, 2);
    u.volume = clamp(o.volume ?? 1, 0, 1);
    const words = Math.max(1, text.split(/\s+/).length);
    const est = words * 380 / u.rate + 300;
    let t0 = performance.now(), charIdx = 0, ended = false;
    u.onstart = () => { t0 = performance.now(); };
    u.onboundary = (e) => { charIdx = e.charIndex || charIdx; };
    const finish = (ok) => { if (ended) return; ended = true; clearTimeout(safety); resolve(ok); };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    const wait = performance.now() - lastCancel < 120 ? 120 : 0;
    const timer = setTimeout(() => {
      if (synth.paused) synth.resume();
      synth.speak(u);
    }, wait);
    const safety = setTimeout(() => finish(true), Math.min(est * 2.2 + 3000, 12000));
    return {
      done,
      stop() {
        if (ended) return;
        clearTimeout(timer);
        finish(false);
        synth.cancel();
        lastCancel = performance.now();
      },
      progress() {
        if (ended) return 1;
        const byChar = charIdx / text.length;
        const byTime = (performance.now() - t0) / est;
        return clamp(Math.max(byChar, Math.min(byTime, 0.97)), 0, 1);
      }
    };
  }

  async function cloudBuffer(text, o) {
    const s = Settings.get();
    const key = [o.cloud, o.lang, o.rate.toFixed(2), text].join("|");
    if (cache.has(key)) return cache.get(key);
    const p = (async () => {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + s.apiKey },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts", voice: o.cloud || "alloy", input: text, response_format: "mp3",
          speed: clamp(o.rate, 0.7, 1.3),
          instructions: (o.style || "") + (o.lang === "ru" ? " Speak Russian." : " Speak clear, natural English.")
        })
      });
      if (!res.ok) throw new Error("tts " + res.status);
      return Sound.ctx.decodeAudioData(await res.arrayBuffer());
    })();
    cache.set(key, p);
    p.catch(() => cache.delete(key));
    return p;
  }
  function radioShaper() {
    const ws = Sound.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 2.2); }
    ws.curve = curve;
    return ws;
  }
  function cloudSay(text, o) {
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    let src = null, startAt = 0, dur = 0, stopped = false, fallback = null;
    const safety = setTimeout(() => {
      if (stopped) return;
      stopped = true;
      if (src) { try { src.stop(); } catch { /* not started */ } }
      if (fallback) fallback.stop();
      resolve(false);
    }, 12000);
    const finish = (ok) => { clearTimeout(safety); resolve(ok); };
    (async () => {
      try {
        Sound.ensure();
        const buf = await cloudBuffer(text, o);
        if (stopped) return finish(false);
        const ctx = Sound.ctx;
        src = ctx.createBufferSource();
        src.buffer = buf;
        let node = src;
        const fx = o.fx;
        if (fx === "wall") node = Sound.chain(node, Sound.filter("lowpass", 520), Sound.gain(1.4));
        if (fx === "radio") node = Sound.chain(node, Sound.filter("highpass", 450), Sound.filter("lowpass", 2600), radioShaper(), Sound.gain(0.8));
        if (fx === "phone") node = Sound.chain(node, Sound.filter("highpass", 320), Sound.filter("lowpass", 3200));
        if (fx === "dock") node = Sound.chain(node, Sound.filter("lowpass", 2200), Sound.gain(0.75));
        if (fx === "table") node = Sound.chain(node, Sound.filter("lowpass", 900), Sound.gain(0.55));
        Sound.chain(node, Sound.gain(o.volume ?? 1), Sound.voiceBus);
        src.onended = () => finish(!stopped);
        startAt = ctx.currentTime;
        dur = buf.duration;
        src.start();
      } catch (e) {
        if (stopped) return finish(false);
        if (!cloudBroken) {
          cloudBroken = true;
          UI.toast("Облачные голоса не ответили. Дальше звучат голоса браузера.", "info");
        }
        fallback = browserSay(text, { ...o, volume: (o.volume ?? 1) * FX_VOL[o.fx] });
        fallback.done.then((ok) => finish(ok));
      }
    })();
    return {
      done,
      stop() {
        if (stopped) return;
        stopped = true;
        clearTimeout(safety);
        if (src) { try { src.stop(); } catch { /* not started */ } }
        if (fallback) fallback.stop();
        resolve(false);
      },
      progress() {
        if (fallback) return fallback.progress();
        if (!src || !dur) return 0;
        return clamp((Sound.ctx.currentTime - startAt) / dur, 0, 1);
      }
    };
  }

  const FX_VOL = { clean: 1, wall: 0.55, dock: 0.7, table: 0.4, radio: 0.9, phone: 0.9 };

  function say(text, opts = {}) {
    const person = opts.who && PEOPLE[opts.who] ? PEOPLE[opts.who] : null;
    const pv = { ...(person ? person.voice : PEOPLE.guest.voice), ...(opts.voice || {}) };
    const lang = opts.lang || (person && person.lang) || "en";
    const s = Settings.get();
    const fx = opts.fx || "clean";
    const o = {
      lang, fx, g: pv.g, pitch: pv.pitch, cloud: pv.cloud, style: pv.style,
      seed: hash(opts.who || pv.cloud || "guest"),
      rate: (opts.rate || 1) * (pv.rate || 1) * (lang === "ru" ? 1 : level().rate) * s.speed,
      volume: opts.volume ?? 1
    };
    stop();
    Sound.ensure();
    const cloud = s.cloudVoices && s.provider === "openai" && s.apiKey && !cloudBroken;
    const raw = cloud ? cloudSay(text, o) : browserSay(text, { ...o, volume: o.volume * (FX_VOL[fx] || 1) * s.voiceVol });
    let settled = false;
    const done = new Promise((resolve) => {
      const cap = setTimeout(() => {
        if (settled) return;
        settled = true;
        raw.stop();
        resolve(false);
      }, 12000);
      raw.done.then((ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(cap);
        resolve(ok);
      });
    });
    const h = { done, stop: () => raw.stop(), progress: () => raw.progress() };
    current = h;
    h.done.then(() => { if (current === h) current = null; });
    return h;
  }
  function stop() {
    if (current) { const c = current; current = null; c.stop(); }
    else if (synth && synth.speaking) { synth.cancel(); lastCancel = performance.now(); }
  }

  return {
    say,
    sayAsync: (text, opts) => say(text, opts).done,
    stop,
    busy: () => !!current,
    hasRussian: () => voices.some((v) => (v.lang || "").toLowerCase().startsWith("ru"))
  };
})();
