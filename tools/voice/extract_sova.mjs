import fs from "node:fs";
import vm from "node:vm";

const src = fs.readFileSync("js/office.js", "utf8");
const SCENES = {};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

let OFFICE;
const ctx = vm.createContext({
  SCENES, clamp, norm,
  enWords: () => 1, isRussian: () => false, isQuestion: () => true, hasPhrase: () => false,
  Repair: { detect: () => false }, Clues: { add: () => {} },
  Leg: {
    city: (s) => OFFICE.LEGEND.city[s.legend.city],
    job: (s) => OFFICE.LEGEND.job[s.legend.job],
    hobby: (s) => OFFICE.LEGEND.hobby[s.legend.hobby],
    otherCities: () => [], otherJobs: () => [],
  },
});
OFFICE = vm.runInContext(src + "\nOFFICE;", ctx);

const STATES = [];
for (const city of Object.keys(OFFICE.LEGEND.city)) {
  for (const job of Object.keys(OFFICE.LEGEND.job)) {
    for (const hobby of Object.keys(OFFICE.LEGEND.hobby)) {
      for (const f of [true, false]) {
        STATES.push({
          legend: { city, job, hobby },
          flags: { addressChanged: f, stickyFound: f, drawerSeen: f, evidence: f ? 3 : 1 },
          clues: { halfsix: f, invoice: f, doorScreen: f, fridayPub: f, tomLate: f, tomBadge: f, spares: f, wharf: f, spare07: f, oneWay: f },
          dossier: {}
        });
      }
    }
  }
}

const set = new Set();
const add = (v) => {
  if (!v) return;
  if (typeof v === "function") {
    for (const s of STATES) {
      try { add(v(s, { sticky: true, drawer: true })); } catch {}
      try { add(v(s, { sticky: true, drawer: false })); } catch {}
      try { add(v(s, { sticky: false, drawer: false })); } catch {}
    }
    return;
  }
  if (typeof v !== "string") return;
  const text = v.replace(/\s+/g, " ").trim();
  if (text && /[а-яё]/i.test(text)) set.add(text);
};

for (const sc of Object.values(SCENES)) {
  if (sc.type === "chat") {
    for (const st of sc.steps || []) {
      if (st.from === "sova") add(st.text);
      if (st.me) {
        add(st.me.ok);
        add(st.me.fallback);
        if (st.me.ask) Object.values(st.me.ask).forEach(add);
        for (const f of st.me.facts || []) add(f.ack);
      }
      if (st.ask) {
        add(st.ask.say);
        add(st.ask.ok);
        add(st.ask.reask);
        add(st.ask.fail);
      }
    }
  }
  if (sc.sova) add(sc.sova);
}
add("По-английски. Экран видят все.");
add("Не понял. Ещё раз, по-английски.");

const list = [...set].sort().map((text) => ({ who: "sova", text }));
fs.writeFileSync("tools/voice/sova-lines.json", JSON.stringify(list, null, 2), "utf8");
console.log("Extracted Sova RU lines:", list.length);
