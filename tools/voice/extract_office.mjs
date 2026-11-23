import fs from "node:fs";
import vm from "node:vm";

const src = fs.readFileSync("js/office.js", "utf8");
const SCENES = {};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

let OFFICE;
const ctx = vm.createContext({
  SCENES,
  clamp,
  norm,
  enWords: () => 1,
  isRussian: () => false,
  isQuestion: () => true,
  hasPhrase: () => false,
  Repair: { detect: () => false },
  Clues: { add: () => {} },
  Leg: {
    city: (s) => OFFICE.LEGEND.city[s.legend.city],
    job: (s) => OFFICE.LEGEND.job[s.legend.job],
    hobby: (s) => OFFICE.LEGEND.hobby[s.legend.hobby],
    otherCities: (s) => Object.entries(OFFICE.LEGEND.city).filter(([k]) => k !== s.legend.city).flatMap(([, v]) => v.any),
    otherJobs: (s) => Object.entries(OFFICE.LEGEND.job).filter(([k]) => k !== s.legend.job).map(([, v]) => v),
  },
});

OFFICE = vm.runInContext(src + "\nOFFICE;", ctx);

const STATES = [];
for (const city of Object.keys(OFFICE.LEGEND.city)) {
  for (const job of Object.keys(OFFICE.LEGEND.job)) {
    for (const hobby of Object.keys(OFFICE.LEGEND.hobby)) {
      for (const addressChanged of [true, false]) {
        for (const evidence of [1, 3]) {
          STATES.push({ legend: { city, job, hobby }, flags: { addressChanged, evidence }, clues: {}, dossier: {} });
        }
      }
    }
  }
}

const map = new Map();
const add = (who, val) => {
  if (!val) return;
  if (typeof val === "function") {
    for (const s of STATES) {
      try { add(who, val(s)); } catch { /* ignore */ }
    }
    return;
  }
  if (typeof val !== "string") return;
  const text = val.replace(/\s+/g, " ").trim();
  if (!text || /[а-яё]/i.test(text)) return; // English spoken lines only (Sova is Russian text chat)
  const key = `${who}|${text}`;
  if (!map.has(key)) map.set(key, { who, text });
};

const walkBeat = (b, defWho) => {
  if (!b) return;
  const who = b.who || defWho;
  add(who, b.say);
  if (Array.isArray(b.lines)) b.lines.forEach((l) => add(l.who || who, l.text));
  add(who, b.ok);
  add(who, b.giveUp);
  add(who, b.close);
  if (b.ask) Object.values(b.ask).forEach((v) => add(who, v));
  if (b.replies) Object.values(b.replies).forEach((v) => add(who, v));
  if (Array.isArray(b.fallbacks)) b.fallbacks.forEach((v) => add(who, v));
  if (Array.isArray(b.bonus)) b.bonus.forEach((x) => add(who, x.reply));
  if (Array.isArray(b.forbid)) b.forbid.forEach((x) => add(who, x.reply));
  if (Array.isArray(b.topics)) b.topics.forEach((t) => add(who, t.answer));
  if (b.interject) walkBeat(b.interject, who);
};

const walkConv = (c) => {
  const defWho = c.npc || c.who || "guest";
  add(defWho, c.failSay);
  if (c.end && c.end.say) add(c.end.who || defWho, c.end.say);
  if (c.forbid) {
    const fl = typeof c.forbid === "function" ? c.forbid() : c.forbid;
    if (Array.isArray(fl)) fl.forEach((f) => add(defWho, f.reply));
  }
  if (Array.isArray(c.beats)) c.beats.forEach((b) => walkBeat(b, defWho));
};

for (const sc of Object.values(SCENES)) {
  if (sc.type === "conv") walkConv(sc);
  if (sc.type === "rounds" && Array.isArray(sc.people)) {
    sc.people.forEach((p) => { if (p.conv) walkConv(p.conv); });
  }
  if (sc.type === "decode" && Array.isArray(sc.items)) {
    sc.items.forEach((it) => add("guest", it.en));
  }
  if (sc.type === "elevator" || sc.type === "crack") {
    const items = typeof sc.items === "function" ? STATES.flatMap((s) => sc.items(s)) : sc.items || [];
    items.forEach((it) => { add(sc.who, it.say); add(sc.who, it.back); });
  }
  if (sc.type === "eaves") {
    (sc.lines || []).forEach((l) => add(sc.target, l.text));
    if (sc.notice) {
      add(sc.notice.who, sc.notice.say);
      add(sc.notice.who, sc.notice.good);
      add(sc.notice.who, sc.notice.bad);
    }
  }
  if (sc.type === "deskSearch") {
    (sc.tasks || []).forEach((t) => add(sc.who, t.say));
    if (sc.back) Object.values(sc.back).forEach((v) => add(sc.who, v));
  }
  if (sc.type === "stall") {
    const w = sc.npc;
    add(w, sc.open);
    add(w, sc.leave);
    (sc.topics || []).forEach((t) => { add(w, t.say); add(w, t.again); });
    (sc.generic || []).forEach((v) => add(w, v));
    (sc.asks || []).forEach((v) => add(w, v));
    (sc.weak || []).forEach((v) => add(w, v));
    (sc.arrive || []).forEach((a) => add(a.who || w, a.text));
    (sc.whispers || []).forEach((v) => add("guest", v));
  }
}

for (const p of OFFICE.PHRASES) add("guest", p.en.replace(/…/g, ""));
for (const v of Object.values(OFFICE.EXPLAIN)) add("guest", v);
for (const grp of Object.values(OFFICE.LEGEND)) {
  for (const v of Object.values(grp)) {
    add("guest", v.say);
    if (v.reply) add("max", v.reply);
  }
}

// Общие системные переспросы из conv.js — озвучиваем голосом каждого персонажа, чтобы не откатывались на браузер.
const COMMON = [
  "Sorry, what do you mean?",
  "Sorry? In English, please.",
  "Anything else?",
  "Anyway, I need to get back to work.",
  "Sorry. I think we're done here.",
  "Sorry, I didn't catch that.",
  "Sorry, I'm not sure how to spell that.",
  "Sorry, I don't know how to explain that."
];
for (const who of ["priya", "grace", "tom", "max", "dev"]) {
  for (const line of COMMON) add(who, line);
}

const list = [...map.values()];
fs.mkdirSync("tools/voice", { recursive: true });
fs.writeFileSync("tools/voice/office-lines.json", JSON.stringify(list, null, 2), "utf8");

const counts = {};
for (const x of list) counts[x.who] = (counts[x.who] || 0) + 1;
console.log("Total unique lines:", list.length, counts);
