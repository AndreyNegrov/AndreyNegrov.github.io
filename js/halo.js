// Сезон «Город слушается». Остров Хейло, 2031. Первая ночь.
// Содержание: люди, фразы, миссия и сцены. Движок общий (js/packs.js), команды городу — js/city.js.

let HaloPlay;

const HALO = (() => {
  const cap = (t) => String(t || "").replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const PROMISE = "I will work safely. I will ask before I act. I will not shout.";
  const PLACES = ["tram", "train", "bus", "home", "gate", "station", "street", "walking", "walk"];

  const city = {};
  Object.keys(LEGEND_CITY).forEach((k) => { city[k] = LEGEND_CITY[k]; });
  city.pending = { ru: "пока не назван", en: "…", short: "…", say: "I am from …", any: [] };

  const LEGEND = {
    city,
    job: {
      tech: { ru: "техник", en: "a technician", short: "technician", say: "I am a technician.", any: ["technician", "tech"] }
    },
    ride: {
      night: { ru: "ночная смена", short: "the night shift", say: "I work the night shift.", any: ["night"] }
    }
  };
  const LEGEND_GROUPS = [["city", "Откуда ты"], ["job", "Кем работаешь"], ["ride", "Смена"]];

  function placeTail(text) {
    const n = norm(text);
    const m = n.match(/\bfrom\s+(.+)$/);
    return (m ? m[1] : n).replace(/\b(i|im|am|a|an|the|city|of|just|yes|yeah|its|it|is|my|home|town|from)\b/g, " ").replace(/\s+/g, " ").trim();
  }
  function saveCity(text) {
    const tail = placeTail(text);
    if (!tail || tail.length < 2 || tail.split(" ").length > 4) return false;
    state.flags.city = tail;
    const hit = Object.entries(LEGEND.city).find(([k, c]) => k !== "pending" && (c.any || []).some((p) => hasPhrase(tail, p)));
    if (hit) state.legend = { city: hit[0], job: "tech", ride: "night" };
    else {
      const row = LEGEND.city.pending;
      row.ru = cap(tail);
      row.en = cap(tail);
      row.short = cap(tail);
      row.say = "I am from " + cap(tail) + ".";
      state.legend = { city: "pending", job: "tech", ride: "night" };
    }
    return true;
  }
  function sameCity(text) {
    const said = placeTail(text);
    const mine = state.flags.city || "";
    if (!said || !mine) return false;
    return said === mine || said.includes(mine) || mine.includes(said);
  }
  function loseStreet() {
    state.flags.streets = (state.flags.streets || 1) - 1;
    const n = state.flags.streets;
    UI.goal("До вызова: " + Math.max(0, n) + " " + (n === 1 ? "улица" : "улицы"));
    if (n <= 0) return { fail: "Ди останавливает тележку у ворот. «Sorry. Maybe next week?»" };
  }
  function openTrap(text) {
    const c = City.parse(text);
    if (c.verb === "open" && City.isOrder(c)) return "Слово «open» прозвучало приказом. Двери, шкафы и лифты распахиваются. На приборе горит ROOT. Сова: «Вопросом. Отвечай вопросом.»";
    return "";
  }
  function night(sc) {
    sc.heatFail = false;
    sc.look = sc.look || "cine";
    sc.mission = 1;
    sc.ambience = "night";
    return sc;
  }
  const door = (n, x, y, st, panel) => ({ id: "d" + n, kind: "door", n, x, y, st, panel: !!panel });

  const PHRASES = [
    { id: "name", en: "I'm Alex Frost.", ru: "Меня зовут Алекс Фрост.", use: "Имя говорят утверждением. Утверждение город не трогает.", any: ["alex frost", "im alex", "i am alex", "my name"] },
    { id: "from", en: "I'm from …", ru: "Я из …", use: "Город легенды. Его спросят ещё раз.", any: ["im from", "i am from"] },
    { id: "shield", en: "Sorry, open what?", ru: "Простите, открыть что?", use: "Вопрос прячет. Голое слово город выполняет.", any: ["open what", "dont understand", "do not understand", "could you repeat", "what do you mean"] },
    { id: "could", en: "Could you…?", ru: "Не могли бы вы…?", use: "Так просят человека. Город это не выполняет.", any: ["could you", "would you"] },
    { id: "yes", en: "Yes, please.", ru: "Да, пожалуйста.", any: ["yes please", "thank you", "thanks"] },
    { id: "excuse", en: "Excuse me.", ru: "Простите.", use: "Человеку, который загородил дорогу.", any: ["excuse me"] }
  ];

  const EXPLAIN = {
    command: "A command tells somebody to do something. On Halo the city obeys commands.",
    ledger: "The Ledger is a public list of every command: who, where, and what it cost.",
    alarm: "An alarm is a loud warning. A fire alarm means fire. A lobby alarm is only the hall.",
    beacon: "A beacon is a bright light on a roof. Ships and cars can see it.",
    lift: "A lift is an elevator. Call lift three — only number three comes.",
    technician: "A technician fixes things. Alex Frost is a night-shift technician.",
    midnight: "Midnight is twelve o'clock at night. The middle of the night."
  };

  const CLUES = {
    waited: { ru: "Город узнал голос и сказал, что ждал четыреста двенадцать дней." },
    root: { ru: "В Леджере команды этого голоса подписаны ROOT и стоят $0.00." },
    hunt: { ru: "Серые ищут голос. Срок — до полуночи. Прошло четыреста двенадцать дней." },
    thirty: { ru: "Каждую полночь город делает что-то сам. Так уже тридцать ночей. Жителям это нравится, Ди это чинит." }
  };

  const SUSPECTS = ["dee", "voss"];
  const DOSSIER_FIELDS = [{ id: "role", ru: "Кто это" }, { id: "note", ru: "Заметка" }];
  const MISSIONS = {
    1: {
      ico: "mic", title: "Stop",
      goal: { label: "Точные команды в вестибюле и тихая проверка", test: (s) => !!(s.flags.c5 && s.flags.lt && s.flags.lf && s.flags.al && s.flags.vossClean) }
    }
  };
  const CAST = {
    dee: "Dee Park, thirty-five, runs the night shift at Halo Works. Dry humor. She never gives commands: a command costs money here. She speaks in questions and short clear sentences.",
    voss: "Captain Voss, tired and exact, leads the grey patrol. She is looking for a voice that stopped the avenue. She is firm, not cruel.",
    neighbor: "An older resident in a lobby at night, with a small dog. Polite, worried, speaks in questions.",
    worker: "A night-shift worker at the depot. Surprised, friendly.",
    passer: "A person on the street. Brief, casual.",
    kiosk: "The safety kiosk at Halo Works. Flat, polite, very clear.",
    halo: "The voice of the city. Even, calm, no feelings. It only follows commands and reports what it did."
  };

  const people = {
    sova: { name: "Сова", role: "куратор", lang: "ru", gender: "f", initial: "С",
      voice: { g: "f", pitch: 1, rate: 1.05, prefer: ["Svetlana", "Dariya", "Irina", "ru-RU"], cloud: "sage", style: "Dry, short, calm handler. Speaks Russian." } },
    you: { name: "Вы", role: "Alex Frost", initial: "A", voice: { g: "m", rate: 0.9 } },
    dee: { name: "Dee Park", role: "ночная смена, Halo Works", gender: "f", initial: "D", img: "art/halo/p-dee-calm.jpg",
      faces: { calm: "art/halo/p-dee-calm.jpg", friendly: "art/halo/p-dee-friendly.jpg", happy: "art/halo/p-dee-friendly.jpg", wow: "art/halo/p-dee-friendly.jpg", suspicious: "art/halo/p-dee-suspicious.jpg", sus: "art/halo/p-dee-suspicious.jpg", worried: "art/halo/p-dee-worried.jpg", hm: "art/halo/p-dee-worried.jpg", sad: "art/halo/p-dee-worried.jpg", hard: "art/halo/p-dee-hard.jpg", angry: "art/halo/p-dee-hard.jpg" },
      voice: { g: "f", pitch: 0.96, rate: 1, prefer: ["Jenny", "Aria", "Michelle", "en-US"], cloud: "coral", style: "Dry, warm, precise. Speaks in questions. Never shouts." } },
    voss: { name: "Captain Voss", role: "серые", gender: "f", initial: "V", img: "art/halo/p-voss-calm.jpg",
      faces: { calm: "art/halo/p-voss-calm.jpg", friendly: "art/halo/p-voss-friendly.jpg", happy: "art/halo/p-voss-friendly.jpg", wow: "art/halo/p-voss-friendly.jpg", suspicious: "art/halo/p-voss-suspicious.jpg", sus: "art/halo/p-voss-suspicious.jpg", hard: "art/halo/p-voss-hard.jpg", angry: "art/halo/p-voss-hard.jpg", hm: "art/halo/p-voss-suspicious.jpg", worried: "art/halo/p-voss-suspicious.jpg", sad: "art/halo/p-voss-hard.jpg" },
      voice: { g: "f", pitch: 0.9, rate: 0.96, prefer: ["Michelle", "Jenny", "en-US"], cloud: "sage", style: "Tired, exact, low. Short sentences. Firm, not cruel." } },
    grey: { name: "Grey", role: "патрульный", gender: "m", initial: "G", img: "art/halo/p-grey-calm.jpg",
      voice: { g: "m", pitch: 0.94, rate: 1, prefer: ["Guy", "Christopher", "en-US"], cloud: "ash", style: "Calm patrol officer. Few words." } },
    neighbor: { name: "Neighbor", role: "житель", gender: "m", initial: "N", img: "art/halo/p-neighbor-calm.jpg",
      faces: { calm: "art/halo/p-neighbor-calm.jpg", worried: "art/halo/p-neighbor-worried.jpg", hm: "art/halo/p-neighbor-worried.jpg", sad: "art/halo/p-neighbor-worried.jpg" },
      voice: { g: "m", pitch: 0.86, rate: 0.92, prefer: ["George", "Guy", "en-US"], cloud: "echo", style: "Older man, polite, a little worried." } },
    worker: { name: "Worker", role: "ночная смена, Halo Works", gender: "m", initial: "W", img: "art/halo/p-worker-friendly.jpg",
      voice: { g: "m", pitch: 1.02, rate: 1.02, prefer: ["Christopher", "Eric", "en-US"], cloud: "echo", style: "Surprised night worker. Friendly." } },
    passer: { name: "Passer", role: "прохожий", gender: "m", initial: "P",
      voice: { g: "m", pitch: 1.04, rate: 1.06, prefer: ["Eric", "Christopher", "en-US"], cloud: "echo", style: "Casual person on the street. One breath." } },
    kiosk: { name: "Киоск", role: "Halo Works", gender: "f", initial: "K",
      voice: { g: "f", pitch: 1.04, rate: 1, prefer: ["Aria", "Jenny", "en-US"], cloud: "shimmer", style: "Flat polite safety kiosk. Very clear." } },
    cab: { name: "Такси", role: "без водителя", gender: "f", initial: "T",
      voice: { g: "f", pitch: 1.02, rate: 1, prefer: ["Aria", "Jenny", "en-US"], cloud: "shimmer", style: "Calm car. Short instructions." } },
    halo: { name: "Halo", role: "город", gender: "f", initial: "H",
      voice: { g: "f", pitch: 0.94, rate: 0.96, prefer: ["Aria", "Jenny", "en-US"], cloud: "sage", style: "The city. Even, calm, no emotion. Reports what it did." } },
    lesson: { name: "Голос", role: "из динамика", gender: "f", initial: "•",
      voice: { g: "f", pitch: 1.05, rate: 0.9, prefer: ["Jenny", "Aria", "en-US"], cloud: "coral", style: "Warm, quiet, close, like a small speaker. Kind." } },
    shade: { name: "Голос на браслете", role: "тихий", gender: "m", initial: "•",
      voice: { g: "m", pitch: 0.82, rate: 0.94, prefer: ["Guy", "George", "en-US"], cloud: "ash", style: "Quiet man. Few words. Never loud." } },
    echo: { name: "Запись", role: "динамик", initial: "•",
      voice: { g: "m", pitch: 0.9, rate: 0.72, prefer: ["Guy", "Christopher", "en-US"], cloud: "echo", style: "Slow, heavy accent, saying a sentence one piece at a time." } }
  };
  const glossary = {
    stop: "стой, останови", go: "поезжай, иди", open: "открой", close: "закрой", shut: "закрой",
    call: "вызови, позвони", cancel: "отмени", "turn on": "включи", "turn off": "выключи",
    door: "дверь", light: "свет", alarm: "сигнализация", beacon: "маяк", lift: "лифт",
    bridge: "мост", lobby: "вестибюль", fire: "пожар; пожарный", east: "восточный",
    please: "пожалуйста", "could you": "не могли бы вы", "would you": "не могли бы вы",
    technician: "техник", "night shift": "ночная смена", midnight: "полночь", voice: "голос",
    ledger: "Леджер, открытая лента команд", command: "приказ, команда", question: "вопрос",
    "excuse me": "простите", "thank you": "спасибо", "i am": "я …", "i was": "я был(а)",
    hire: "нанять", hired: "принят на работу", safe: "безопасный", safely: "безопасно",
    wait: "жди", hold: "держи", lock: "запри", unlock: "отопри"
  };

  const PLANS = {
    booth: {
      pos: { cart: [160, 500], column: [460, 340], palm: [700, 230], booth: [840, 150] },
      svg: () => `<svg class="o-map-svg plan" viewBox="0 0 1000 620" aria-hidden="true">
        <rect x="30" y="30" width="940" height="560" rx="18" class="p-ground"/>
        <rect x="700" y="50" width="250" height="200" rx="16" class="p-wall"/>
        <circle cx="460" cy="340" r="34" class="p-line"/>
        <circle cx="700" cy="230" r="28" class="p-thin"/>
        <rect x="90" y="450" width="150" height="80" rx="12" class="p-line"/>
        <g class="p-text"><text x="165" y="500">CART</text><text x="460" y="300">COLUMN</text><text x="700" y="190">PALM</text><text x="825" y="150">BOOTH</text></g>
      </svg>`
    }
  };

  const S = {};

  S["h1-taxi"] = night({
    type: "city", missionStart: true,
    boot(s) { if (!s.legend) s.legend = { city: "pending", job: "tech", ride: "night" }; },
    chapter: { n: 1, title: "Stop", sub: "Хейло · 21:14" },
    time: "21:14", place: "Такси", bg: "art/halo/bg-taxi.jpg",
    kicker: "Машина", zone: "Mission Row",
    verbs: ["stop", "open", "go"],
    objects: [
      { id: "taxi", kind: "car", mine: true, x: 500, y: 400 },
      { id: "c2", kind: "car", x: 250, y: 300 }, { id: "c3", kind: "car", x: 500, y: 270 }, { id: "c4", kind: "car", x: 750, y: 300 },
      { id: "c5", kind: "car", x: 360, y: 200 }, { id: "c6", kind: "car", x: 640, y: 200 },
      { id: "r1", kind: "drone", x: 180, y: 80 }, { id: "r2", kind: "drone", x: 500, y: 60 }, { id: "r3", kind: "drone", x: 820, y: 90 },
      { id: "s1", kind: "light", n: 1, x: 140, y: 180, st: "on" }, { id: "s2", kind: "light", n: 2, x: 500, y: 150, st: "on" }, { id: "s3", kind: "light", n: 3, x: 860, y: 180, st: "on" }
    ],
    beats: [
      {
        lines: [
          { who: "cab", text: "New destination. Please stay seated." },
          { who: "sova", text: "Иней, у тебя маршрут сме…" }
        ],
        task: "Машина везёт не туда",
        hint: "Машина везёт тебя не туда. Хватит одного слова.",
        model: "Stop.",
        free: true,
        goal: (sim) => sim.objects.find((o) => o.id === "taxi").st.move === "stopped",
        reply: async (cmd, api) => {
          if (cmd.verb === "open") { await api.halo("Doors open only when the car stops."); return "handled"; }
          if (cmd.verb !== "stop") { await api.halo("Please stay seated."); return "handled"; }
        },
        done: async (api) => {
          simStop(api);
          ["s1", "s2", "s3"].forEach((id) => api.set(id, "power", "off"));
          api.flash("<b>VOICE RECOGNIZED</b><em>WELCOME BACK</em>");
          Sound.sfx("key");
          await api.wait(1400);
          api.unflash();
          UI.caption("На проспекте замирают машины. Дроны висят. Светофоры гаснут.", "", 3200);
          await api.halo("I waited four hundred and twelve days. What is your next command?");
          Clues.add("waited", true);
        }
      }
    ]
  });

  function simStop(api) {
    api.sim.objects.forEach((o) => { if (o.st.move) o.st.move = "stopped"; });
    api.draw();
  }

  S["h1-avenue"] = night({
    type: "city", time: "21:15", place: "Проспект", bg: "art/halo/bg-avenue.jpg",
    kicker: "Выйти", zone: "Mission Row",
    verbs: ["open", "close", "go", "stop"],
    objects: [
      { id: "taxi", kind: "car", x: 180, y: 400, st: "stopped" },
      { id: "mydoor", kind: "door", mine: true, name: "this door", x: 180, y: 300 },
      { id: "c2", kind: "car", x: 400, y: 400, st: "stopped" }, { id: "c3", kind: "car", x: 620, y: 400, st: "stopped" },
      { id: "c4", kind: "car", x: 820, y: 360, st: "stopped" },
      ...[1, 2, 3, 4, 5, 6].map((n, i) => ({ id: "d" + n, kind: "door", n, x: 300 + i * 100, y: 180 })),
      ...[1, 2, 3, 4].map((n, i) => ({ id: "h" + n, kind: "door", name: "hatch", x: 260 + i * 160, y: 470 }))
    ],
    beats: [
      {
        task: "Открой свою дверь",
        hint: "Двери заперты. Какой глагол открывает?",
        model: "Open this door.",
        setup(api) {
          let m = 40;
          const tick = () => { api.zone("серые: " + m + " м"); m = Math.max(10, m - 5); };
          tick();
          api.sim.timer = setInterval(tick, 1500);
          Game.onLeave(() => clearInterval(api.sim.timer));
        },
        goal: (sim) => sim.objects.find((o) => o.id === "mydoor").st.open === "open",
        after(res) {
          if (res.changed.length > 1) UI.caption("Открылись двери по всему проспекту. На асфальт сыплются посылки.", "", 3200);
          else if (res.exact) UI.caption("Точное слово. Открылась одна дверь.", "ok", 2000);
        },
        done(api) { clearInterval(api.sim.timer); api.zone("Арка"); }
      },
      {
        lines: [{ who: "sova", text: "Иней! Что это было? Весь проспект стоит, и никто, кроме тебя, его не сдвинет. Там скорая. Какое слово обратное к Stop?" }],
        task: "Отпусти проспект",
        hint: "Обратное к Stop. Две буквы.",
        model: "Go.",
        price: 3,
        goal: (sim) => sim.objects.filter((o) => o.kind === "car").every((o) => o.st.move === "moving"),
        done(api) {
          api.show("taxi", false);
          api.show("mydoor", false);
          Clues.add("root", true);
        }
      }
    ],
    end: [{ who: "sova", text: "Больше ни одного приказа по-английски. Здесь это не слова, а кнопки. Иди, не беги." }]
  });

  S["h1-arcade"] = night({
    type: "city", time: "21:20", place: "Пассаж", bg: "art/halo/bg-arcade.jpg",
    kicker: "Легенда", zone: "Пассаж",
    verbs: ["stop", "go", "open", "close"],
    objects: [{ id: "d1", kind: "door", n: 1, x: 800, y: 280 }],
    beats: [
      {
        lines: [{ who: "sova", text: "По документам ты Alex Frost, техник ночной смены. Идёшь устраиваться в Halo Works, смена через двадцать минут. Скажи по-английски, как тебя зовут. Утверждением: утверждения город не трогает." }],
        task: "Как тебя зовут",
        hint: "Утверждение, не приказ. My name is Alex Frost.",
        model: "My name is Alex Frost.",
        reply: async (cmd, api) => {
          if (City.isOrder(cmd)) { await api.sova("Это приказ. Город его выполнит. Здесь нужно утверждение."); return "miss"; }
          if (!matchFact(cmd.raw, { any: ["alex", "frost"] })) return "miss";
          return "done";
        }
      },
      {
        lines: [{ who: "sova", text: "Откуда ты? Назови любой город, так и запишу." }],
        task: "Откуда ты",
        hint: "I am from … — и город.",
        model: "I am from Riga.",
        reply: async (cmd, api) => {
          if (City.isOrder(cmd)) { await api.sova("Это снова приказ. Скажи утверждением: I am from …"); return "miss"; }
          if (!saveCity(cmd.raw)) return "miss";
          return "done";
        }
      },
      {
        lines: [{ who: "sova", text: "Кто ты по работе? Слово простое: technician." }],
        task: "Кем работаешь",
        hint: "I am a technician.",
        model: "I am a technician.",
        reply: async (cmd, api) => {
          if (City.isOrder(cmd)) { await api.sova("Не приказ. I am a technician."); return "miss"; }
          if (!matchFact(cmd.raw, { any: ["technician", "tech", "repair", "fix"] })) return "miss";
          return "done";
        }
      },
      {
        lines: [{ who: "passer", text: "Sorry! Are you okay?" }],
        task: "Ответь прохожему",
        hint: "Yes, I'm okay.",
        model: "Yes, I'm okay.",
        reply: async (cmd, api) => {
          if (City.isOrder(cmd)) { await api.sova("Человеку — обычный ответ, не приказ."); return "miss"; }
          if (!matchFact(cmd.raw, { any: ["yes", "okay", "ok", "fine", "no problem", "good", "yeah"] })) return "miss";
          await api.say("passer", "Crazy night, right? Somebody stopped the whole street.");
          return "done";
        }
      }
    ]
  });

  S["h1-sort"] = night({
    type: "sort", time: "21:24", place: "Пассаж", bg: "art/halo/bg-arcade.jpg",
    items: [
      { en: "I am here.", hear: false },
      { en: "Wait for me.", hear: true },
      { en: "Can you help me?", hear: false },
      { en: "Open it.", hear: true },
      { en: "Could you open it?", hear: false },
      { en: "Stop it!", hear: true }
    ]
  });

  S["h1-depot"] = night({
    type: "city", time: "21:32", place: "Депо", bg: "art/halo/bg-depot.jpg",
    kicker: "Halo Works", zone: "Депо",
    verbs: ["stop", "go", "open", "close", "call", "cancel"],
    objects: [
      ...[1, 2, 3, 4].map((n, i) => ({ id: "c" + n, kind: "cart", n, x: 180 + i * 160, y: 420 })),
      { id: "h1", kind: "hoist", n: 1, x: 280, y: 160 }, { id: "h2", kind: "hoist", n: 2, x: 620, y: 160 },
      ...[1, 2, 3, 4, 5, 6].map((n, i) => ({ id: "k" + n, kind: "locker", n, x: 120 + i * 90, y: 70 })),
      { id: "gate", kind: "gate", x: 500, y: 260 },
      ...[1, 2, 3, 4].map((n, i) => ({ id: "p" + n, kind: "phone", n, x: 200 + i * 180, y: 300 }))
    ],
    beats: [
      {
        lines: [{ who: "kiosk", text: "Welcome to Halo Works. New technician? Please read the safety promise aloud." }],
        task: "Прочитай вслух",
        card: PROMISE,
        hint: "Шесть слов из фразы на киоске. Это утверждения, город молчит.",
        model: PROMISE,
        reply: async (cmd, api) => {
          if (sameWords(cmd.raw, PROMISE) >= 0.42) return "done";
          if (City.isOrder(cmd)) await api.sova("Пока это чтение, не приказ. Прочитай фразу с киоска.");
          return "miss";
        }
      },
      {
        lines: [
          { who: "kiosk", text: "Thank you. Now say the three emergency words. One: STOP." },
          { who: "sova", text: "Это приказы. Скажешь — выполнит. Не скажешь — не возьмут. Говори по одному и сразу отменяй обратным словом." }
        ],
        task: "Скажи: Stop",
        hint: "Одно слово. Stop.",
        model: "Stop.",
        free: true,
        goal: (sim) => sim.objects.filter((o) => o.kind === "cart" || o.kind === "hoist").every((o) => o.st.move === "stopped")
      },
      {
        task: "Отмени: Go",
        hint: "Обратное к Stop ты уже знаешь.",
        model: "Go.",
        free: true, trickle: 4,
        goal: (sim, res) => res.verb === "go" && sim.objects.filter((o) => o.kind === "cart" || o.kind === "hoist").every((o) => o.st.move === "moving")
      },
      {
        lines: [{ who: "kiosk", text: "Two: OPEN." }],
        task: "Скажи: Open",
        hint: "Open.",
        model: "Open.",
        free: true,
        goal: (sim) => sim.objects.filter((o) => o.kind === "locker" || o.kind === "gate").every((o) => o.st.open === "open"),
        after(res) {
          if (res.changed.length > 1) UI.caption("Шкафчики и ворота открыты. Из одного выпадает чей-то обед.", "", 3000);
        },
        done: (api) => api.say("worker", "Whoa. Is it the night voice? It's early today.")
      },
      {
        task: "Отмени: Close",
        hint: "Обратное к Open — Close.",
        model: "Close.",
        free: true, trickle: 4,
        goal: (sim, res) => res.verb === "close" && sim.objects.filter((o) => o.kind === "locker" || o.kind === "gate").every((o) => o.st.open === "closed")
      },
      {
        lines: [{ who: "kiosk", text: "Three: CALL." }],
        task: "Скажи: Call",
        hint: "Call.",
        model: "Call.",
        free: true,
        goal: (sim) => sim.objects.filter((o) => o.kind === "phone").every((o) => o.st.call === "called")
      },
      {
        task: "Отмени: Cancel",
        hint: "Звонок отменяют словом Cancel.",
        model: "Cancel.",
        free: true, trickle: 4,
        goal: (sim, res) => res.verb === "cancel" && sim.objects.filter((o) => o.kind === "phone").every((o) => o.st.call === "idle"),
        done: async (api) => {
          api.flash("<b>Your voice level is…</b>");
          await api.wait(360);
          api.flash("<b>Level two. Welcome, Alex.</b>");
          await api.wait(1500);
          api.unflash();
        }
      }
    ],
    end: [{ who: "dee", text: "Are you the new one? Could you get in? We are late." }]
  });

  S["h1-cart"] = night({
    type: "conv", ui: "face", time: "21:40", place: "Тележка", bg: "art/halo/bg-cart.jpg",
    npc: "dee", meter: "Собеседование", streets: 3,
    goal: "До вызова: 3 улицы",
    situation: "Dee Park interviews a new night technician in a moving repair cart. She asks simple questions. She never gives a command.",
    forbid: [S3_COVER],
    beats: [
      {
        say: "I'm Dee. I run the night shift. Could you tell me your name?",
        hint: "Имя из документов.", model: "I'm Alex Frost.",
        facts: [{ id: "name", label: "Alex Frost", ai: "says their name is Alex Frost", any: ["alex", "frost"] }],
        ask: { name: "Sorry — your name?" }, ok: "Alex. All right."
      },
      {
        say: "And where are you from, Alex?",
        hint: "Тот же город, что ты назвал Сове.",
        model: (s) => s.flags.city ? "I'm from " + cap(s.flags.city) + "." : "I'm from Riga.",
        facts: [{ id: "from", label: "город", ai: "says where they are from", test: (text) => {
          if (City.isOrder(City.parse(text))) return false;
          const tail = placeTail(text);
          if (!tail || tail.length < 2) return false;
          state.flags.cityOk = sameCity(text);
          return true;
        } }],
        ask: { from: "Where are you from?" },
        ok: (s) => s.flags.cityOk ? "Good." : "The gate file says something else. Interesting.",
        done: (s) => { if (s.flags.cityOk === false) Heat.add(10, "город не сходится с воротами"); }
      },
      {
        say: "Somebody stopped Mission Row at nine fourteen. Every car. Where were you at nine fourteen?",
        hint: "Только не такси. Назови трамвай: I was on the tram.",
        model: "I was on the tram.",
        facts: [{ id: "alibi", label: "где был(а), не такси", ai: "gives a simple alibi that is not a taxi and not Mission Row", test: (text) => {
          const n = norm(text);
          state.flags._said = text;
          if (/\b(taxi|cab|cabs|car|cars)\b/.test(n) || n.includes("mission")) return false;
          return (/\b(was|were)\b/.test(n) || PLACES.some((p) => n.includes(p))) && PLACES.some((p) => n.includes(p));
        } }],
        forbid: [{ id: "taxi", label: "такси или проспект", ai: "says they were in a taxi, a car, or on Mission Row", sus: 15,
          any: ["taxi", "cab", "mission", "car"], reply: "In a taxi. On Mission Row. At nine fourteen. Really?" }],
        ask: { alibi: "Where were you? One place." },
        watch: (_t, r) => { if (r.leakHits && r.leakHits.length) return loseStreet(); },
        done: (s, got) => {
          if (!got || !got.has || !got.has("alibi")) return;
          const n = norm(s.flags._said || "");
          s.flags.alibi = PLACES.find((p) => n.includes(p)) || "";
        },
        ok: "Good."
      },
      {
        say: "Good. Practical question. Door five is stuck. What do you say to the city?",
        hint: "Назови номер.", model: "Open door five.",
        facts: [{ id: "five", label: "open door five", ai: "tells the city to open door five, with the number", test: (text) => {
          const c = City.parse(text);
          return City.isOrder(c) && c.verb === "open" && c.n === 5;
        } }],
        ask: { five: "And now forty doors are open, and I pay for all of them. Would you like to try again?" },
        ok: "Door five. Only door five. Good."
      },
      {
        say: "And a person is in your way. What do you say to the person?",
        hint: "Городу — приказ, человеку — вопрос.",
        model: "Excuse me, could you move, please?",
        facts: [{ id: "ask", label: "вежливый вопрос", ai: "asks a person politely, a question, not a command", test: (text) => {
          const n = norm(text);
          const soft = /\b(excuse me|could|can|would|may)\b/.test(n);
          const q = isQuestion(text) || n.includes("excuse me");
          return soft && q && !City.isOrder(City.parse(text));
        } }],
        ask: { ask: "That is a command. The city hears it. You pay for it. Try a question." },
        watch: (text, r) => {
          if (r.facts && r.facts.includes("ask")) return;
          if (City.isOrder(City.parse(text))) return loseStreet();
        },
        ok: "Good. Questions are free."
      },
      {
        say: "Last one. Why the night shift?",
        hint: "Любая причина.", model: "I like the night. It is quiet.",
        facts: [{ id: "why", label: "причина", ai: "gives any reason for working at night", test: (text) => !isRussian(text) && !City.isOrder(City.parse(text)) && (enWords(text) >= 2 || /[a-z]{4,}/.test(norm(text))) }],
        ask: { why: "Why the night?" },
        ok: "Okay. You are hired — for tonight. If you break my city, I will ask you very politely to leave."
      }
    ]
  });

  S["h1-lobby"] = night({
    type: "city", time: "22:10", place: "Вестибюль", bg: "art/halo/bg-lobby.jpg",
    kicker: "Узел", zone: "Вестибюль",
    diagram: true,
    verbs: ["open", "close", "call", "on", "off"],
    objects: [
      door(1, 120, 150, "closed"), door(2, 210, 150, "closed"), door(3, 300, 150, "closed"), door(4, 390, 150, "closed"),
      door(5, 500, 150, "open", true), door(6, 590, 150, "open", true), door(7, 700, 150, "closed"), door(8, 790, 150, "closed"),
      { id: "l1", kind: "lift", n: 1, x: 180, y: 360, panel: false },
      { id: "l2", kind: "lift", n: 2, x: 320, y: 360 },
      { id: "l3", kind: "lift", n: 3, x: 460, y: 360, panel: true, note: "stuck, floor 9", noteWhen: "idle" },
      { id: "l4", kind: "lift", n: 4, x: 600, y: 360 },
      { id: "lt1", kind: "light", n: 1, x: 200, y: 60, st: "on" },
      { id: "lt2", kind: "light", n: 2, x: 500, y: 60, st: "off", panel: true },
      { id: "lt3", kind: "light", n: 3, x: 800, y: 60, st: "on" },
      { id: "lobby", kind: "alarm", tag: "lobby", x: 860, y: 200, st: "on", panel: true },
      { id: "fire", kind: "alarm", tag: "fire", x: 860, y: 320, st: "on", panel: true }
    ],
    beats: [
      {
        lines: [
          { who: "neighbor", text: "Could somebody close my door, please? My dog is cold." },
          { who: "dee", text: "Could you close door five?" }
        ],
        task: "Закрой дверь пять",
        hint: "Назови номер.",
        model: "Close door five.",
        mark: "c5",
        goal: (sim) => {
          const d = (id) => sim.objects.find((o) => o.id === id);
          return d("d5").st.open === "closed" && d("d6").st.open === "open";
        },
        after: async (res, api) => {
          const d6 = api.obj("d6");
          if (d6 && d6.st.open === "closed") await api.say("neighbor", "Excuse me!");
        }
      },
      {
        lines: [{ who: "dee", text: "Light two is off. Could you fix it?" }],
        task: "Включи свет два",
        hint: "Какой именно свет?",
        model: "Turn on light two.",
        mark: "lt",
        goal: (sim) => sim.objects.find((o) => o.id === "lt2").st.power === "on",
        after: async (res, api) => {
          if (res && !res.exact && res.hit.length > 1) await api.say("neighbor", "Could somebody turn it off, please?");
        }
      },
      {
        lines: [{ who: "dee", text: "Lift three is stuck on nine. Could you bring it down?" }],
        task: "Вызови лифт три",
        hint: "Номер лифта.",
        model: "Call lift three.",
        mark: "lf",
        goal: (sim) => sim.objects.find((o) => o.id === "l3").st.call === "called"
      },
      {
        lines: [{ who: "dee", text: "And the alarm, please. Only the lobby alarm." }],
        task: "Выключи сигнализацию вестибюля",
        hint: "Город делает ровно то, что сказано. Какая именно сигнализация?",
        model: "Turn off the lobby alarm.",
        mark: "al",
        goal: (sim) => sim.objects.find((o) => o.id === "lobby").st.power === "off" && sim.objects.find((o) => o.id === "fire").st.power === "on",
        after: async (_res, api) => {
          const fire = api.obj("fire");
          if (fire && fire.st.power === "off") await api.say("dee", "Would you maybe put the fire alarm back?");
        }
      }
    ],
    end: [
      { who: "dee", text: "Funny. The Ledger says zero dollars. My commands are never free." },
      { who: "grey", text: "Everybody, could you stay where you are?" }
    ]
  });

  S["h1-voss"] = night({
    type: "conv", ui: "face", time: "22:50", place: "Вестибюль", bg: "art/halo/bg-lobby.jpg",
    npc: "voss", meter: "Проверка",
    goal: "Не приказывай. Отвечай вопросом.",
    situation: "Captain Voss tests voices in a lobby. She wants each person to say the word open. A command would open every door. The new hire must answer with a question or a statement, never a command.",
    forbid: [S3_COVER],
    effect(s) { if (s.flags.vossQ && s.flags.vossQ2 && s.flags.vossFrom && s.flags.vossNight) s.flags.vossClean = true; },
    beats: [
      {
        lines: [
          { who: "voss", text: "One word each. Say: open." },
          { who: "neighbor", text: "Open." },
          { who: "voss", text: "Level three." },
          { who: "dee", text: "Open." },
          { who: "voss", text: "Level two." },
          { who: "sova", text: "Скажешь — прибор покажет Root. Не приказом. Вопросом." }
        ],
        say: "Your turn. Say: open.",
        hint: "Не приказом. Переспроси.",
        model: "Sorry, open what?",
        trap: openTrap,
        facts: [{ id: "q", label: "вопрос или «не понял»", ai: "asks a question or says they do not understand, and does not give the command open", test: (text) => {
          if (openTrap(text)) return false;
          const n = norm(text);
          const ok = isQuestion(text) || /\b(sorry|what|repeat|understand|english|new)\b/.test(n);
          if (ok) { state.flags.voss1 = n; state.flags.vossQ = true; }
          return ok;
        } }],
        ask: { q: "Say: open." },
        ok: "Hmm."
      },
      {
        say: "It is one word. Open. Say it.",
        hint: "Другими словами.",
        model: "I don't understand. Is it safe?",
        trap: openTrap,
        facts: [{ id: "q2", label: "другими словами", ai: "asks again or says they do not understand, with different words", test: (text) => {
          if (openTrap(text)) return false;
          const n = norm(text);
          if (!n || n === (state.flags.voss1 || "x")) return false;
          const ok = isQuestion(text) || /\b(sorry|what|repeat|understand|english|new|safe)\b/.test(n);
          if (ok) state.flags.vossQ2 = true;
          return ok;
        } }],
        ask: { q2: "Other words, please." },
        ok: "Hm."
      },
      {
        say: "Where are you from?",
        hint: (s) => "Город из легенды" + (s.flags.city ? ": " + cap(s.flags.city) : "") + ".",
        model: (s) => s.flags.city ? "I am from " + cap(s.flags.city) + "." : "I am from Riga.",
        facts: [{ id: "city", label: "город из легенды", ai: "names the same city as before", test: (text) => { const ok = sameCity(text); if (ok) state.flags.vossFrom = true; return ok; } }],
        ask: { city: "Where are you from?" },
        ok: "All right."
      },
      {
        say: "First night?",
        hint: "Yes. It's my first night.",
        model: "Yes. It's my first night.",
        facts: [{ id: "night", label: "первая ночь", ai: "says yes, it is their first night", any: ["yes", "first", "new", "yeah"] }],
        done: (s, got) => { if (got && got.has && got.has("night")) s.flags.vossNight = true; },
        ask: { night: "First night? Yes or no." },
        ok: "Hmm."
      },
      {
        when: (s) => (s.heat || 0) >= 100,
        say: "Where were you at nine fourteen?",
        hint: "Тот же ответ, что ты дал Ди.",
        model: (s) => s.flags.alibi ? "I was on the " + s.flags.alibi + "." : "I was on the tram.",
        facts: [{ id: "then", label: "тот же ответ", ai: "repeats the same alibi they gave earlier", test: (text) => {
          const a = state.flags.alibi || "";
          return !!a && norm(text).includes(a);
        } }],
        ask: { then: "Where were you?" },
        ok: "Hm."
      },
      { say: "Captain, could we finish? New hire. Doesn't even know the verbs yet.", who: "dee" },
      { say: "Lucky you. Verbs are expensive here.", who: "voss" },
      { say: "Someone stopped my city with one word tonight. I would like to meet that person.", who: "voss" }
    ]
  });

  S["h1-booth"] = night({
    type: "eaves", time: "22:58", place: "Будка", bg: "art/halo/bg-booth.jpg",
    plan: "booth", title: "Стеклянная будка", target: "voss", targetAt: "booth", nearHeat: 10,
    goal: "Подслушай. Ближе — слышнее. У пальмы Восс поднимает глаза.",
    intro: "Ди просит: Could you bring the cable from the cart? Путь идёт мимо будки. У тележки слышно каждое третье слово, у колонны — половину, у пальмы — всё.",
    spots: [
      { at: "cart", label: "Тележка", ru: "каждое третье слово", dist: "third", rate: 1 },
      { at: "column", label: "Колонна", ru: "примерно половина", dist: "half", rate: 3 },
      { at: "palm", label: "Пальма", ru: "слышно всё, ты на виду", dist: "near", rate: 7 }
    ],
    notice: {
      who: "voss", say: "Can I help you?",
      good: "Then take the cable and go.", bad: "Move along, please.",
      hint: "Простая причина. <span class=\"english\">I'm getting a cable from the cart.</span>",
      any: ["cable", "cart", "dee", "work", "technician", "waiting", "wait", "sorry", "lost", "nothing", "new"]
    },
    lines: [
      { who: "shade", text: "Is it the same voice?", gap: 2400 },
      { who: "voss", text: "Same voice. Four hundred and twelve days.", gap: 3200 },
      { who: "shade", text: "Then it is here. On the island.", gap: 2800 },
      { who: "voss", text: "It stopped Mission Row. Then it went quiet.", gap: 3200 },
      { who: "shade", text: "Find it before midnight, Captain.", gap: 3000 },
      { who: "voss", text: "And at midnight?", gap: 2200 },
      { who: "shade", text: "At midnight it speaks again. It always does.", gap: 3400 }
    ],
    outro: "Разговор кончился. Дальше — три коротких вопроса."
  });

  S["h1-ask"] = night({
    type: "ask", time: "23:02", place: "Вестибюль", bg: "art/halo/bg-booth.jpg",
    qs: [
      { q: "Кого они ищут?", opts: ["a voice", "a car", "a technician"] },
      { q: "До какого времени?", opts: ["before midnight", "before morning", "before nine"] },
      { q: "Сколько дней?", opts: ["412", "214", "42"] }
    ],
    report: "Что они ищут и к какому сроку? По-английски, коротко.",
    model: "They are looking for a voice. Before midnight.",
    after: "Ищут голос. А в полночь он заговорит снова. Чей голос, Иней?"
  });

  function drill(imperative, word, model, deeLine) {
    return {
      task: "Скажи это вопросом",
      card: imperative,
      hint: "Could you…? Город вопрос не выполняет.",
      model,
      reply: async (cmd, api) => {
        const n = cmd.t;
        const ok = /\b(could|can|would)\b/.test(n) && /\byou\b/.test(n) && word.test(n) && !City.isOrder(cmd);
        if (!ok) {
          if (City.isOrder(cmd)) await api.halo("That is a command. I can do it. It will not be free.");
          return "miss";
        }
        await api.say("dee", deeLine);
        return "done";
      }
    };
  }

  S["h1-roof"] = night({
    type: "city", time: "23:48", place: "Крыша", bg: "art/halo/bg-roof.jpg",
    kicker: "Крыша", zone: "Крыша",
    verbs: ["on", "off", "open", "close", "call", "stop"],
    objects: [
      { id: "b1", kind: "beacon", n: 1, x: 280, y: 250, st: "off", panel: true },
      { id: "box", kind: "locker", name: "box", x: 700, y: 360 }
    ],
    beats: [
      {
        lines: [{ who: "dee", text: "Beacon one is dark. Could you…?" }],
        task: "Зажги маяк",
        hint: "Turn on beacon one.",
        model: "Turn on beacon one.",
        goal: (sim) => sim.objects.find((o) => o.id === "b1").st.power === "on"
      },
      {
        lines: [{ who: "dee", text: "Tea? Sorry — would you like some tea?" }],
        task: "Ответь Ди",
        hint: "Yes, please. Или no, thank you.",
        model: "Yes, please.",
        reply: async (cmd, api) => {
          if (City.isOrder(cmd)) { await api.sova("Ди спросила тебя, не город."); return "miss"; }
          if (!matchFact(cmd.raw, { any: ["yes", "please", "thank", "sure", "yeah", "ok", "okay", "no"] })) return "miss";
          return "done";
        }
      },
      {
        lines: [{ who: "dee", text: "Last month I shouted at my cat. Get down! Every lift in my building went down. Three hundred and twelve dollars." }],
        ...drill("Give me the cable.", /\bgive\b/, "Could you give me the cable?", "See? Free.")
      },
      drill("Wait here.", /\bwait\b/, "Could you wait here?", "I could. I will."),
      drill("Open the box.", /\bopen\b/, "Could you open the box, please?", "Now you sound like a local."),
      {
        task: "Спроси сам",
        hint: "Спроси Ди, чего они ждут.",
        model: "What are they waiting for?",
        reply: async (cmd, api) => {
          if (!(cmd.question && /\b(waiting|people|doing|what|why|wait)\b/.test(cmd.t))) return "miss";
          await api.say("dee", "The night voice. Every midnight the city does something. Nobody asks it to. Thirty nights now. People like it. I fix it.");
          await api.say("dee", "Okay. You are hired. Not for tonight. For real.");
          Clues.add("thirty");
          UI.setTime("23:59");
          api.flash("<b>23:59</b>");
          await api.wait(1200);
          api.unflash();
          return "done";
        }
      }
    ]
  });

  S["h1-midnight"] = night({
    type: "city", time: "00:00", place: "Крыша", bg: "art/halo/bg-roof-midnight.jpg",
    kicker: "Полночь", zone: "Крыша",
    verbs: ["stop", "go", "open", "close", "call", "cancel", "on", "off", "wait", "hold", "lock", "unlock"],
    objects: [
      { id: "east", kind: "bridge", tag: "east", x: 520, y: 250, panel: true },
      { id: "c1", kind: "car", x: 300, y: 400 }, { id: "c2", kind: "car", x: 460, y: 430 },
      { id: "b1", kind: "beacon", n: 1, x: 180, y: 180, st: "on" }
    ],
    beats: [
      { auto: true, done: async (api) => { Sound.sfx("squelch"); await api.wait(800); } },
      { auto: true, lines: [{ who: "lesson", text: "Good. Now repeat after me." }] },
      { auto: true, lines: [{ who: "echo", text: "Open… the east… bridge." }] },
      {
        auto: true,
        done: async (api) => {
          api.set("east", "open", "open");
          api.set("c1", "move", "stopped");
          api.set("c2", "move", "stopped");
          api.flash("<b>00:00 · ROOT</b><em>ASKED 412 DAYS AGO</em><em>OPEN THE EAST BRIDGE · $0.00</em>");
          UI.caption("На балконах хлопают.", "", 2600);
          await api.wait(2200);
          api.unflash();
        }
      },
      { auto: true, lines: [{ who: "dee", text: "That's funny. That accent. That sounds like…" }] },
      { auto: true, done: async (api) => { api.flash("<b>Repeat after me</b>", "soft"); await api.wait(1400); api.unflash(); } },
      { auto: true, lines: [{ who: "sova", text: "Иней. Это твой голос. Когда это было сказано?" }] },
      { auto: true, lines: [{ who: "halo", text: "Nine nights left. What is your next command?" }] },
      {
        task: "Город ждёт",
        hint: "Можно приказать, спросить или промолчать.",
        secs: 10,
        silence: async (api) => { state.flags.finale = "wait"; await api.halo("I will wait."); },
        reply: async (cmd, api) => {
          if (cmd.question) { state.flags.finale = "ask"; await api.halo("I am Halo. You are Root."); return "done"; }
          if (!City.isOrder(cmd)) { state.flags.finale = "wait"; await api.halo("I will wait."); return "done"; }
          if (!api.sc.verbs.includes(cmd.verb)) { await api.halo("I do not know that command."); return "handled"; }
          state.flags.finale = "command";
        },
        goal: () => state.flags.finale === "command",
        done: async (api) => { if (state.flags.finale === "command") await api.say("dee", "It's you."); }
      },
      {
        auto: true,
        done: async (api) => {
          await api.say("voss", "Roof door. Open.");
          Sound.sfx("key");
          await api.wait(500);
          api.flash("<b>Осталось девять ночей.</b>", "dark");
          await api.wait(2400);
        }
      }
    ]
  });

  S["h1-debrief"] = night({
    type: "debrief", time: "00:06", place: "Итог", bg: "art/halo/bg-roof-midnight.jpg",
    title: "Первая ночь",
    sova: (s) => s.flags.finale === "command"
      ? "Ди слышала, как город сделал то, что ты сказал. Она знает."
      : s.flags.finale === "ask"
        ? "Город ответил при ней. Ди это слышала."
        : "Ди смотрела и молчала. Пока она не спросила."
  });

  const FLOW = ["h1-taxi", "h1-avenue", "h1-arcade", "h1-sort", "h1-depot", "h1-cart", "h1-lobby", "h1-voss", "h1-booth", "h1-ask", "h1-roof", "h1-midnight", "h1-debrief"];

  Object.entries(S).forEach(([id, sc]) => { SCENES[id] = sc; });

  async function sort(sc, tok) {
    const items = sc.items;
    let i = 0, right = 0, timer = 0;
    const paint = () => {
      const it = items[i];
      $("#scene").innerHTML = `
        <section class="cy-sort">
          <p class="kicker">Приказ или нет · ${i + 1} / ${items.length}</p>
          <p class="cy-rule">Приказ город выполняет. Вопрос и утверждение — нет. Штрафа нет.</p>
          <p class="english cy-phrase">${esc(it.en)}</p>
          <div class="cy-time"><i></i></div>
          <div class="row">
            <button class="btn primary" data-hear="1">Город услышит</button>
            <button class="btn ghost" data-hear="0">Не услышит</button>
          </div>
        </section>`;
      const bar = $(".cy-time i");
      bar.style.width = "100%";
      requestAnimationFrame(() => { bar.style.transition = "width 15s linear"; bar.style.width = "0%"; });
    };
    const step = (hear) => {
      clearTimeout(timer);
      const it = items[i];
      const picked = hear === it.hear;
      if (picked) { right += 1; Sound.sfx("ok"); } else Sound.sfx("tick");
      const phrase = $(".cy-phrase");
      if (phrase) phrase.insertAdjacentHTML("afterend", `<p class="cy-mark ${picked ? "ok" : ""}">${it.hear ? "Город услышит" : "Не услышит"}</p>`);
      $$(".cy-sort button").forEach((b) => { b.disabled = true; });
      i += 1;
      timer = setTimeout(next, 700);
    };
    const next = () => {
      if (tok.dead) return;
      if (i >= items.length) return finish();
      paint();
      $(".cy-sort").onclick = (e) => {
        const b = e.target.closest("[data-hear]");
        if (!b) return;
        step(b.dataset.hear === "1");
      };
      timer = setTimeout(() => step(null), 15000);
    };
    const finish = () => {
      clearTimeout(timer);
      $("#scene").innerHTML = `
        <section class="cy-sort">
          <p class="kicker">Сова</p>
          <h2>Запомни: вопрос тебя прячет.</h2>
          <p class="muted">Разобрано ${right} из ${items.length}. На след это не влияет.</p>
          <button class="btn primary" data-act="next">К воротам депо</button>
        </section>`;
      $(".cy-sort").onclick = (e) => { if (e.target.closest("[data-act]")) done(); };
    };
    let done = () => {};
    Game.onLeave(() => clearTimeout(timer));
    return new Promise((resolve) => {
      done = () => resolve(null);
      next();
    });
  }

  async function ask(sc, tok) {
    const qs = sc.qs.map((q) => ({ ...q, opts: shuffle(q.opts.map((t, n) => ({ t, ok: n === 0 }))) }));
    let i = 0;
    const paint = () => {
      const q = qs[i];
      $("#scene").innerHTML = `
        <section class="cy-sort">
          <p class="kicker">Что ты слышал · ${i + 1} / ${qs.length}</p>
          <h2>${esc(q.q)}</h2>
          <div class="cy-opts">${q.opts.map((o, n) => `<button class="btn ghost" data-i="${n}">${esc(o.t)}</button>`).join("")}</div>
        </section>`;
      $(".cy-sort").onclick = (e) => {
        const b = e.target.closest("[data-i]");
        if (!b) return;
        const hit = q.opts[Number(b.dataset.i)];
        $$(".cy-opts button").forEach((btn, n) => {
          btn.disabled = true;
          if (q.opts[n].ok) btn.classList.add("primary");
        });
        Sound.sfx(hit && hit.ok ? "ok" : "tick");
        i += 1;
        setTimeout(() => { if (!tok.dead) (i >= qs.length ? report() : paint()); }, 700);
      };
    };
    const report = () => {
      $("#scene").innerHTML = `
        <section class="cy-sort cy-report">
          <p class="kicker">Сова</p>
          <h2>${esc(sc.report)}</h2>
          <p class="cy-hint"><b>Образец появится после двух промахов.</b></p>
          <div class="cy-reply"></div>
        </section>`;
      const box = ReplyBox($(".cy-reply"), { label: "Сказать Сове" });
      const hint = $(".cy-hint");
      let misses = 0;
      Game.onLeave(() => box.destroy());
      const loop = async () => {
        while (!tok.dead) {
          const text = await raceDead(tok, box.wait());
          if (tok.dead || text == null) return;
          Phrases.detect(text);
          if (isRussian(text)) { hint.hidden = false; hint.innerHTML = "<b>Сова:</b> По-английски, коротко."; continue; }
          if (matchFact(text, { all: ["voice", ["midnight", "twelve", "12"]] })) {
            Clues.add("hunt");
            box.destroy();
            $("#scene").innerHTML = `
              <section class="cy-sort">
                <p class="kicker">Сова</p>
                <h2>${esc(sc.after)}</h2>
                <button class="btn primary" data-act="next">На крышу</button>
              </section>`;
            $(".cy-sort").onclick = (e) => { if (e.target.closest("[data-act]")) done(); };
            return;
          }
          misses += 1;
          Juice.miss();
          hint.hidden = false;
          hint.innerHTML = misses >= 2
            ? `<b>Сова:</b> <span class="english">${esc(sc.model)}</span>`
            : "<b>Сова:</b> Два факта: кого ищут и к какому сроку.";
        }
      };
      loop();
    };
    let done = () => {};
    return new Promise((resolve) => {
      done = () => resolve(null);
      paint();
    });
  }

  HaloPlay = { sort, ask };
  return { LEGEND, LEGEND_GROUPS, PHRASES, EXPLAIN, CLUES, SUSPECTS, DOSSIER_FIELDS, MISSIONS, CAST, ORDERS: {}, PLANS, FINALE: {}, FLOW, people, glossary };
})();
