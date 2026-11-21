// Сезон «Дождь на Луне». Лунный город Порт Шеклтон, контора Keepsake покупает у людей воспоминания.
// Здесь только содержание: люди, слова, фразы, улики, миссии и сцены. Движок общий с «Последней милей» (см. js/packs.js).

Object.assign(PEOPLE, {
  luma: { name: "Luma", role: "ассистент порта", gender: "f", initial: "L", orb: true,
    voice: { g: "f", pitch: 1.1, rate: 1, prefer: ["Sonia", "Libby", "Maisie", "en-GB", "Aria"], cloud: "shimmer", style: "A bright, even, friendly synthetic port assistant." } },
  nora: { name: "Nora Hale", role: "старшая по приёму, Keepsake", gender: "f", img: "art/helen.jpg",
    voice: { g: "f", pitch: 0.96, rate: 1, prefer: ["Jenny", "Michelle", "Aria", "en-US"], cloud: "coral", style: "Warm, tired, careful manager. Speaks in short clear sentences." } },
  tomas: { name: "Tomas Brandt", role: "такелажник, Купол 6", gender: "m", img: "art/owen.jpg",
    voice: { g: "m", pitch: 0.9, rate: 0.96, prefer: ["Ryan", "Thomas", "George", "en-GB"], cloud: "ash", style: "Slow, heavy dock worker who has not slept for weeks." } },
  ines: { name: "Ines", role: "лапшичная, прилавок 18", gender: "f", img: "art/rita.jpg",
    voice: { g: "f", pitch: 1, rate: 1.02, prefer: ["Michelle", "Jenny", "Samantha", "en-US"], cloud: "coral", style: "Sharp, dry, brave noodle cook. Tests people before she trusts them." } },
  mara: { name: "Mara", role: "брокер, прилавок 19", gender: "f", img: "art/dana.jpg",
    voice: { g: "f", pitch: 0.92, rate: 1.02, prefer: ["Hazel", "Sonia", "en-GB"], cloud: "sage", style: "Quiet, businesslike broker." } },
  rahimi: { name: "Inspector Rahimi", role: "комиссия по безопасности", gender: "m", img: "art/remezov.jpg",
    voice: { g: "m", pitch: 0.86, rate: 0.94, prefer: ["George", "Thomas", "Ryan", "en-GB"], cloud: "ash", style: "Formal, patient, exact chairman of a safety board." } },
  halden: { name: "Голос в трубке", role: "кто-то из Halden Rigging", gender: "m", initial: "H",
    voice: { g: "m", pitch: 0.8, rate: 0.95, prefer: ["Thomas", "George", "Ryan", "en-GB"], cloud: "ash" } },
  abel: { name: "Mr Abel", role: "клиент, кабина 3", gender: "m", initial: "A",
    voice: { g: "m", pitch: 0.78, rate: 0.88, prefer: ["George", "Thomas", "Guy", "en-GB"], cloud: "echo", style: "Very old, gentle man." } },
  june: { name: "June", role: "клиентка, кабина 3", gender: "f", initial: "J",
    voice: { g: "f", pitch: 1.12, rate: 1.04, prefer: ["Aria", "Jenny", "Libby", "en-US"], cloud: "shimmer", style: "Young cheerful woman." } }
});

Object.assign(GLOSSARY, {
  memory: "воспоминание", memories: "воспоминания", remember: "помнить", forget: "забыть", forgot: "забыл", arrival: "прибытие", arrivals: "прилёт",
  purpose: "цель", stay: "пребывание; остаться", employer: "работодатель", contract: "контракт", homesick: "тоска по дому", miss: "скучать",
  capsule: "капсула (жильё)", locker: "шкафчик", level: "уровень", intake: "приём", client: "клиент", card: "карточка", guess: "гадать",
  laugh: "смех", laughed: "засмеялась", shoes: "туфли", river: "река", street: "улица", evening: "вечер", selling: "продаю", sell: "продать", sold: "продал",
  salty: "солёная", waves: "волны", afraid: "бояться", jumped: "прыгнули", swallowed: "наглоталась", counted: "считал",
  night: "ночь", shift: "смена", docks: "доки", "pressure door": "гермодверь", alarm: "сигнализация", silent: "молчала", close: "закрыться",
  aisle: "проход", shelf: "полка", box: "ящик", row: "ряд", label: "ярлык", slot: "гнездо", terminal: "терминал", camera: "камера",
  buyer: "покупатель", seller: "продавец", cash: "наличные", approved: "одобрено", pending: "ожидается", hold: "на удержании", erase: "стереть", lot: "лот",
  hearing: "слушание", witness: "свидетель", broker: "брокер", stall: "прилавок", noodles: "лапша", double: "вдвое", price: "цена",
  rigged: "обслуживал, монтировал", rigging: "такелаж", account: "счёт", funeral: "похороны", cried: "плакала", signed: "подписала", form: "акт, бланк",
  seal: "уплотнитель", worn: "изношен", fault: "неисправность", decision: "решение", replace: "заменить", quarter: "квартал", officer: "инспектор",
  guilt: "вина", grief: "горе", true: "правда", believe: "верить", clerk: "служащий", exact: "точный", state: "назвать, заявить",
  "take your time": "не торопитесь", "on my way": "уже иду", "wrong side": "не та сторона", "knock twice": "постучать дважды", "go away": "уходите"
});

// Города легенды общие с «Последней милей»: это тот же Alex Frost.
const LEGEND_CITY = LEGEND.city;

const MOON = (() => {
  const FORBID = S3_FORBID;
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  const LEGEND = {
    city: LEGEND_CITY,
    job: {
      reception: { ru: "администратор отеля", en: "a hotel receptionist", short: "receptionist", say: "I was a hotel receptionist.", any: ["reception*", "hotel", "front desk"] },
      callcentre: { ru: "оператор колл-центра", en: "a call centre operator", short: "call centre", say: "I worked in a call centre.", any: ["call centre", "call center", "calls", "operator", "phone"] },
      library: { ru: "библиотекарь", en: "a librarian", short: "librarian", say: "I was a librarian.", any: ["librar*", "library", "books"] }
    },
    ride: {
      rain: { ru: "по дождю", short: "the rain", say: "I miss the rain.", any: ["rain", "raining", "rainy"] },
      sea: { ru: "по морю", short: "the sea", say: "I miss the sea.", any: ["sea", "ocean", "beach", "waves"] },
      snow: { ru: "по снегу", short: "the snow", say: "I miss the snow.", any: ["snow", "snowy", "winter"] }
    }
  };
  const LEGEND_GROUPS = [["city", "Откуда ты на Земле"], ["job", "Кем работал(а) на Земле"], ["ride", "По чему скучаешь"]];

  const PHRASES = [
    { id: "repeat", en: "Sorry, could you repeat that?", ru: "Простите, можете повторить?", use: "Не расслышал(а) — переспроси. Повторят медленнее.", any: ["repeat", "say that again", "say it again", "pardon", "come again", "one more time"] },
    { id: "slow", en: "Could you speak more slowly?", ru: "Можете говорить помедленнее?", use: "Клиенты волнуются и частят. Просить — нормально.", any: ["more slowly", "slower", "slow down", "too fast"] },
    { id: "new", en: "Sorry, I'm new.", ru: "Простите, я новенький(ая).", use: "Тупик? Ты здесь первую неделю. Новеньким прощают.", any: ["im new", "i am new", "new here", "first night", "first day", "first week", "just started", "just arrived"] },
    { id: "when", en: "When was it?", ru: "Когда это было?", use: "Первый вопрос к любому воспоминанию.", any: ["when was it", "when was that", "what year", "which year", "what date"] },
    { id: "next", en: "What happened next?", ru: "Что было дальше?", use: "Человек замолчал — помоги ему продолжить.", any: ["what happened next", "and then", "what happened then", "what next"] },
    { id: "remember", en: "What do you remember?", ru: "Что вы помните?", any: ["what do you remember", "do you remember", "what can you remember"] },
    { id: "time", en: "Take your time.", ru: "Не торопитесь.", use: "Человеку тяжело говорить — дай ему минуту.", any: ["take your time", "no rush", "no hurry"] },
    { id: "moment", en: "One moment, please.", ru: "Одну минуту, пожалуйста.", use: "Не знаешь ответа — выиграй время.", any: ["one moment", "just a moment", "one minute", "one second", "just a second", "give me a moment"] },
    { id: "mean", en: "What does … mean?", ru: "Что значит …?", use: "Незнакомое слово — спроси. Объяснят проще.", any: ["what does", "what is a", "whats a", "mean"] },
    { id: "sure", en: "Are you sure?", ru: "Вы уверены?", any: ["are you sure", "you sure"] },
    { id: "way", en: "I'm on my way.", ru: "Уже иду.", any: ["on my way", "im coming", "coming now"] },
    { id: "exact", en: "To be exact: …", ru: "Если точно: …", use: "Перед цифрой, датой или именем на слушании.", any: ["to be exact", "exactly", "to be precise"] }
  ];

  const EXPLAIN = {
    memory: "A memory is something you remember. A picture of the past in your head.",
    intake: "Intake is the first step. A person comes in, and we write down what they bring.",
    card: "The card is a short form. Name, date, place — the facts of the memory.",
    cartridge: "A cartridge is a small box. One memory lives inside it.",
    witness: "A witness is a person who saw something with their own eyes.",
    hearing: "A hearing is an official meeting. People answer questions, and a board decides.",
    broker: "A broker buys from one person and sells to another. For money.",
    rigger: "A rigger is a worker who fixes heavy doors, cables and machines.",
    ledger: "A ledger is a list of everything a company bought and sold.",
    homesick: "Homesick means sad because you are far from home.",
    alarm: "An alarm is a loud sound that tells you: danger.",
    approved: "Approved means someone said: yes, this is fine, you can use it."
  };

  const CLUES = {
    ownRule: { ru: "Правило порта: продать можно только своё воспоминание. Продал — и больше его не помнишь." },
    noraKey: { ru: "Архив Keepsake заперт после десяти. Ключ Нора Хейл носит с собой." },
    rainSells: { ru: "Абель продал дождь в Лиссабоне, чтобы оплатить внучке школу. Родившиеся на Луне дождя не видели — такое берут дорого." },
    tomasNight: { ru: "Томас Брандт продаёт ночь 14 марта, Купол 6: сигнализация молчала, гермодверь 6-C не закрылась. Трое погибли." },
    noraTakes: { ru: "Продавцов ночи 14 марта Нора оформляет сама, без приёмщика." },
    nineSame: { ru: "В архиве девять картриджей подряд: «14 MAR · DOME 6 · NIGHT». Одна ночь, одно место." },
    tenth: { ru: "Десятое гнездо в архиве пустое: «последний свидетель — ожидается». Это Инес из лапшичной. Она не продаёт." },
    buyerHR: { ru: "Покупатель всех девяти — H.R., платит наличными. Каждую покупку одобрила Н. Хейл." },
    ledger: { ru: "Журнал: слушание в пятницу, 21 марта. После слушания лот H.R. сотрут." },
    noraFirst: { ru: "Лот 001 в журнале — сама Нора Хейл: «7–14 марта, личное». Девяносто тысяч, втрое дороже остальных." },
    tomasBlank: { ru: "Томас помнит начало смены в восемь и утро среды с деньгами на счету. Между ними — ничего." },
    brokerStall: { ru: "Продать ночь Томасу посоветовала Мара, брокер с прилавка 19. Доплачивает сверх цены Keepsake." },
    door6c: { ru: "Томас одиннадцать лет обслуживал дверь 6-C — и теперь не может сказать, что с ней было не так." },
    haldenName: { ru: "H.R. — это Halden Rigging. Им принадлежат все двери Купола 6." },
    fortyK: { ru: "За десятое воспоминание предлагают вдвое: сорок тысяч." },
    friday: { ru: "«Слушание в пятницу. Нет свидетелей — нет слушания»." },
    noraSold: { ru: "Голос в трубке: «Хейл продала своё первой. Она не знает, что подписала»." },
    inesSaw: { ru: "Инес видела: сигнализация молчала, дверь 6-C была открыта сорок секунд, трое остались не с той стороны." },
    inesOfficer: { ru: "За неделю до аварии дверь проверяла инспектор по безопасности — женщина. Она подписала акт." },
    inesCopy: { ru: "Память Инес теперь есть и у тебя: 14 марта, 23:10, сорок секунд, трое. Наутро дверь заменили." },
    noraSigned: { ru: "Акт осмотра двери 6-C от 7 марта: уплотнитель изношен, сигнализация неисправна — «допущена к работе». Подпись: Н. Хейл." }
  };

  const SUSPECTS = ["tomas", "mara", "ines", "nora"];
  const DOSSIER_FIELDS = [{ id: "role", ru: "Кто это" }, { id: "knows", ru: "Что помнит" }, { id: "note", ru: "Заметка" }];

  const MISSIONS = {
    1: { ico: "user", title: "Прибытие", goal: { label: "Пройти контроль и собеседование", test: (s, st) => st.need > 0 && st.got >= st.need - 1 } },
    2: { ico: "ear", title: "Приём", goal: { label: "Найти того, кто продаёт ночь 14 марта", test: (s) => !!s.clues.tomasNight } },
    3: { ico: "lock", title: "Архив", goal: { label: "Узнать, кто скупает одну и ту же ночь", test: (s) => !!(s.clues.nineSame && s.clues.buyerHR) } },
    4: { ico: "eye", title: "Купол 6", phraseGoal: 1, goal: { label: "Услышать про десятую и про пятницу", test: (s) => !!(s.clues.tenth && s.clues.friday) } },
    5: { ico: "key", title: "Десятая", goal: { label: "Сохранить память Инес", test: (s) => !!s.clues.inesCopy } },
    6: { ico: "board", title: "Слушание", phraseGoal: 1, goal: { label: "Четыре точных ответа комиссии", test: (s) => (s.flags.evidence || 0) >= 4 } }
  };

  const CAST = {
    luma: "Luma, the automatic arrival assistant of the lunar city Port Shackleton. Bright, even, exact, a little too cheerful. Uses very simple clear English.",
    nora: "Nora Hale, intake manager at Keepsake, a company that buys people's real memories. Warm, tired, careful. She honestly does not remember one week of March, because she sold it.",
    tomas: "Tomas Brandt, a dock rigger from Dome Six who has not slept for weeks and wants to sell the memory of one night. Slow, heavy, honest.",
    ines: "Ines, a noodle cook from the Dome Six night market, the last witness of the accident. Sharp, dry, brave. She refuses to sell her memory and tests people before she trusts them.",
    mara: "Mara, a quiet broker who buys memories at the night market for a client.",
    rahimi: "Inspector Rahimi, chairman of the Colony Safety Board. Formal, patient, exact. He wants numbers, dates and names.",
    abel: "Mr Abel, a very old gentle man who sells a childhood memory of rain in Lisbon to pay for his granddaughter's school."
  };

  const PLANS = {
    market: {
      pos: { gate: [120, 520], noodles: [420, 420], crates: [690, 330], s19: [800, 215] },
      svg: () => `<svg class="o-map-svg plan" viewBox="0 0 1000 620" aria-hidden="true">
        <rect x="20" y="20" width="960" height="580" rx="6" class="p-ground"/>
        <rect x="20" y="20" width="960" height="120" class="p-wall"/>
        <g class="p-line"><rect x="250" y="20" width="150" height="120"/><rect x="430" y="20" width="150" height="120"/><rect x="610" y="20" width="150" height="120"/><rect x="790" y="20" width="150" height="120"/></g>
        <rect x="700" y="170" width="200" height="90" rx="12" class="p-van"/>
        <g class="p-thin"><rect x="640" y="296" width="54" height="46"/><rect x="700" y="296" width="54" height="46"/><rect x="670" y="346" width="54" height="46"/></g>
        <g class="p-thin"><circle cx="420" cy="420" r="46"/><circle cx="420" cy="420" r="20"/><path d="M340 470 h160"/></g>
        <path d="M60 470 Q120 400 180 470 V590 M60 470 V590" class="p-line"/>
        <g class="p-text"><text x="325" y="90">STALL 17</text><text x="505" y="90">STALL 18</text><text x="685" y="90">STALL 19</text><text x="865" y="90">STALL 20</text>
          <text x="800" y="290">MARA</text><text x="697" y="420">CRATES</text><text x="420" y="500">NOODLES</text><text x="120" y="606">GATE</text></g>
      </svg>`
    }
  };

  // Полка архива: девять картриджей одной ночи, пустое десятое гнездо, терминал и камера.
  function shelfSvg() {
    const hit = (x, y, w, h) => `<rect class="s-hit" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`;
    let carts = "";
    for (let i = 0; i < 9; i++) carts += `<rect x="${176 + i * 60}" y="118" width="44" height="74" rx="9" class="p-cart c${i % 3}"/>`;
    return `<svg class="s-plan" viewBox="0 0 1000 620" aria-hidden="true">
      <rect width="1000" height="620" class="p-ground"/>
      <rect x="140" y="90" width="720" height="420" rx="14" class="p-body"/>
      <path d="M140 210 H860 M140 360 H860" class="p-line"/>
      <g class="s-obj" data-id="row">${hit(166, 108, 548, 94)}${carts}</g>
      <g class="s-obj" data-id="slot">${hit(716, 108, 76, 94)}<rect x="726" y="118" width="54" height="74" rx="9" class="p-slot"/></g>
      <g class="s-obj" data-id="label">${hit(170, 232, 330, 110)}<rect x="184" y="246" width="300" height="80" rx="10" class="p-label"/><path d="M206 272h150 M206 294h230" class="p-thin"/><rect x="420" y="258" width="46" height="22" rx="6" class="p-cart c1"/></g>
      <g class="s-obj" data-id="terminal">${hit(560, 228, 270, 120)}<rect x="574" y="240" width="240" height="96" rx="10" class="p-seal"/><path d="M596 268h120 M596 290h170 M596 312h90" class="p-thin"/><circle cx="792" cy="258" r="5" class="p-led"/></g>
      <g class="s-obj" data-id="camera">${hit(850, 30, 110, 80)}<rect x="866" y="50" width="62" height="34" rx="8" class="p-part"/><circle cx="938" cy="67" r="12" class="p-part"/><circle cx="938" cy="67" r="5" class="p-led"/></g>
      <path d="M180 400h640 M180 440h640 M180 480h640" class="p-thin"/>
      <g class="p-text"><text x="500" y="570">KEEPSAKE · ARCHIVE · AISLE 14</text></g>
    </svg>`;
  }

  const S = {
    // ═════════ 1 · ПРИБЫТИЕ ═════════
    "m1-open": {
      type: "chat", mission: 1, missionStart: true, chapter: { n: 1, title: "Прибытие", sub: "Порт Шеклтон · три дня пути от дома" },
      time: "06:40", place: "Сообщения", bg: "set:port", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Иней, работа далеко. Порт Шеклтон, Луна. Сорок тысяч человек под куполами." },
        { from: "sova", text: "Там есть контора Keepsake. Покупает у людей воспоминания — настоящие. Продал — и больше не помнишь." },
        { from: "sova", text: "За месяц кто-то скупил у девяти человек одну и ту же ночь. Все девять видели аварию в Куполе 6." },
        { from: "sova", text: "Устройся к ним приёмщиком. Сначала легенда." }
      ],
      end: "Открыть легенду"
    },
    "m1-legend": { type: "legend", mission: 1, time: "06:44", place: "Легенда", bg: "set:port", look: "dim" },
    "m1-check": {
      type: "chat", mission: 1, time: "06:50", place: "Сообщения", bg: "set:port", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: (s) => `${Leg.city(s).ru}, ${Leg.job(s).ru}, скучаешь ${Leg.ride(s).ru}. Запомнила. Там тоже запомнят.` },
        { from: "sova", text: "Проверка связи. Нажми «Говорить» (или держи пробел) и скажи по-английски: Hi, I'm Alex. Можно и написать." },
        { me: { hint: "Скажи: Hi, I'm Alex.", model: "Hi, I'm Alex.",
          facts: [{ id: "hi", label: "представиться", ai: "greets and/or says their name is Alex", any: ["alex", "hi", "hello", "hey", "frost", "im", "i am"] }],
          ask: { hi: "Не слышу. По-английски: Hi, I'm Alex." },
          ok: "Слышу. Задержка две секунды, но это Луна." } },
        { from: "sova", text: "Твоя работа там — слушать. Не расслышал(а) — переспрашивай, за это платят:" },
        { phrase: "repeat" },
        { phrase: "slow" },
        { from: "sova", text: "На выходе из челнока тебя встретит Luma — автомат порта. Отвечай по легенде." }
      ],
      end: "Выйти из челнока", ring: { who: "luma", title: "Port Shackleton · Arrivals", sub: "Luma, ассистент порта" }
    },
    "m1-gate": {
      type: "conv", ui: "assistant", mission: 1, time: "07:02", place: "Зал прилёта", bg: "set:port", look: "cine",
      title: "Port Shackleton · Arrivals", npc: "luma", sub: "Arrival assistant", meter: "Контроль",
      goal: "Пройди контроль. Отвечай по легенде.",
      situation: "The automatic arrival assistant of a lunar city checks a new worker: identity, employer, contract and one rule about selling memories.",
      forbid: FORBID,
      failSay: "Thank you. Please wait for an officer.", failText: "Luma вызвала офицера. До Keepsake ты не дошёл(ла).",
      beats: [
        { say: "Welcome to Port Shackleton. I am Luma, your arrival assistant. Can you hear me?",
          hint: "Ответь, что слышишь.", model: "Yes, I can hear you.",
          facts: [{ id: "hear", label: "ответить, что слышно", ai: "confirms they can hear, or greets", any: [...YES, "hear", "hello", "hi", "clearly"] }],
          ask: { hear: "Hello? Can you hear me?" }, ok: "Wonderful." },
        { say: "Please say your full name.",
          hint: "Имя из легенды.", model: "My name is Alex Frost.",
          facts: [{ id: "name", label: "Alex Frost", ai: "says their name is Alex Frost", any: ["alex", "frost"] }],
          ask: { name: "I did not catch that. Your full name, please." }, ok: "Thank you, Alex." },
        { say: "Which city on Earth are you from?", legendHint: true,
          hint: "Город из легенды.", model: (s) => Leg.city(s).say,
          facts: [{ id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en}`, any: (s) => Leg.city(s).any }],
          ask: { city: "Sorry. Which city?" }, ok: (s) => `${Leg.city(s).en}. Three days from here.` },
        { say: "What is the purpose of your stay?",
          hint: "Ты прилетел(а) работать: I'm here to work.", model: "I'm here to work.",
          facts: [{ id: "work", label: "работать", ai: "says they are here to work / for a job", any: ["work", "working", "job", "employ*", "contract"] }],
          ask: { work: "Are you here to work, to study or to visit?" }, ok: "Work. Thank you." },
        { say: "Who is your employer?",
          hint: "Контора называется Keepsake.", model: "Keepsake.",
          facts: [{ id: "keep", label: "Keepsake", ai: "names Keepsake as the employer", any: ["keepsake", "keep sake", "memory exchange"] }],
          ask: { keep: "The name of the company, please." }, ok: "Keepsake, the memory exchange. Noted." },
        { say: "How long is your contract?",
          hint: "Контракт на два года: Two years.", model: "Two years.",
          facts: [{ id: "two", label: "два года", ai: "says two years", any: ["two years", "2 years", "two year", "twenty four months", "two"] }],
          ask: { two: "How many years?" }, ok: "Two years. That is seven hundred and thirty days without weather." },
        { say: "Many arrivals feel homesick. What do you miss about Earth?", legendHint: true,
          hint: "По чему скучаешь — из легенды.", model: (s) => Leg.ride(s).say,
          facts: [{ id: "miss", label: (s) => `скучаю: ${Leg.ride(s).short}`, ai: (s) => `says they miss ${Leg.ride(s).short}`, any: (s) => Leg.ride(s).any }],
          ask: { miss: "What do you miss? One thing is enough." }, ok: (s) => `${cap(Leg.ride(s).short)}. People born here have never seen it.` },
        { say: "One rule. Can you sell a memory that is not yours?",
          hint: "Чужое воспоминание продавать можно? Нет.", model: "No, I can't.",
          facts: [{ id: "no", label: "нельзя", ai: "says no", any: NO }],
          ask: { no: "Can you sell another person's memory? Yes or no." }, ok: "Correct. A memory belongs to the person who lived it.",
          done: () => Clues.add("ownRule") },
        { say: "Last step. Please read this sentence aloud.",
          read: "I am here to work. My memories are my own.",
          ok: "Thank you. Your voice is saved." }
      ],
      end: { say: "Welcome to the Moon, Alex. Housing will give you your codes." }
    },
    "m1-capsule": {
      type: "crack", mission: 1, time: "07:20", place: "Жилищный стол · Купол 2", bg: "set:tunnel", look: "dim", who: "luma",
      kicker: "Жилищный стол", title: "Три кода", label: "Код",
      goal: "Luma диктует номера и коды. Набирай.",
      intro: "Капсула, шкафчик и служебная дверь. Luma называет номер и код один раз, но можно попросить ещё. Набери то, что слышишь.",
      keys: ["Слушай и набирай цифры", "Fifty и fifteen звучат похоже", "Клавиатура тоже работает"],
      items: [
        { say: "Capsule two, one, four. Door code: seven, seven, three, oh.", fields: [["Капсула", "214"], ["Код", "7730"]], note: "Капсула 214 — код 7730", tip: "oh = 0" },
        { say: "Your locker is number fifty. Code: one, five, one, five.", fields: [["Шкафчик", "50"], ["Код", "1515"]], note: "Шкафчик 50 — код 1515", tip: "fifty = 50 · fifteen = 15" },
        { say: "Keepsake staff door, level thirteen. Code: three, oh, double nine.", fields: [["Уровень", "13"], ["Код", "3099"]], note: "Служебная дверь, уровень 13 — код 3099", tip: "thirteen = 13 · double nine = 99" }
      ],
      done: (s) => { s.flags.codes = true; },
      sova: (s, r) => r.score >= 250 ? "Три кода с первого раза. Служебную дверь запомни особо — пригодится." : "Коды есть. Thirteen — тринадцать, thirty — тридцать. Служебную дверь запомни особо."
    },
    "m1-nora": {
      type: "conv", ui: "face", mission: 1, time: "09:30", place: "Keepsake · приём", bg: "set:keepsake", look: "cine", npc: "nora",
      goal: "Пройди собеседование у Норы Хейл.",
      situation: "Nora Hale, intake manager of the memory exchange Keepsake, interviews a new intake clerk on their first morning on the Moon.",
      forbid: FORBID,
      beats: [
        { say: "Alex Frost? I'm Nora Hale. I run intake. Sit down. How was the flight?",
          hint: "Ответь что угодно: It was long. / It was fine.", model: "It was long, but fine.",
          facts: [ANY_EN], ok: "Three days in a tin can. I remember mine. Well. Most of it." },
        { say: "What did you do on Earth?", legendHint: true,
          hint: "Прошлая работа из легенды.", model: (s) => Leg.job(s).say,
          facts: [{ id: "job", label: (s) => `работа: ${Leg.job(s).short}`, ai: (s) => `says they worked as ${Leg.job(s).en}`, any: (s) => Leg.job(s).any }],
          ask: { job: "And your last job?" }, ok: "Good. Then you know how to listen." },
        { say: "Here is the job. A person comes in and tells you a memory. You listen and fill in the card. What do you do if you don't understand?",
          hint: "Правильный ответ — переспросить: I ask them to repeat.", model: "I ask them to repeat.",
          facts: [{ id: "ask", label: "переспросить", ai: "says they ask the client to repeat, speak slowly or explain", any: ["repeat", "ask", "again", "slowly", "slower", "explain"] }],
          ask: { ask: "You don't understand a client. What do you do?" }, ok: "Exactly. Never guess. A wrong card is a wrong memory." },
        { say: "And if a client starts to cry?",
          hint: "Дай человеку время: I wait. / Take your time.", model: "I wait. I say: take your time.",
          facts: [{ id: "wait", label: "дать время", ai: "says they wait, give time, offer water or stay quiet", any: ["wait", "time", "water", "quiet", "pause", "listen", "tissue", "sorry", "stop"] }],
          ask: { wait: "They cry. And you?" }, ok: "Right. 'Take your time.' That's what we say here." },
        { say: "Can you start tonight?",
          hint: "Соглашайся.", model: "Yes, I can.",
          facts: [{ id: "yes", label: "согласиться", ai: "agrees to start tonight", any: [...YES, "tonight", "i can", "ready"] }],
          ask: { yes: "Tonight. Yes or no?" }, ok: "Good. Night shift. The archive is locked after ten — I keep the key myself.",
          done: () => Clues.add("noraKey") }
      ],
      end: { say: "Welcome to Keepsake, Alex." }
    },
    "m1-debrief": {
      type: "debrief", mission: 1, time: "10:05", place: "Итог", bg: "set:capsule", look: "dim",
      title: "Ты на Луне",
      sova: (s) => s.clues.noraKey ? "Ты внутри. Ключ от архива она носит сама — запомни. И заметь: «помню свой перелёт. Почти весь». Так говорят те, кто здесь что-то продал." : "Ты внутри. Ночная смена — твоя."
    },

    // ═════════ 2 · ПРИЁМ ═════════
    "m2-brief": {
      type: "chat", mission: 2, missionStart: true, chapter: { n: 2, title: "Приём", sub: "Keepsake · ночная смена" },
      time: "22:10", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Человек садится и рассказывает воспоминание. Ты слушаешь и проверяешь карточку: где, когда, кто был рядом." },
        { from: "sova", text: "Два вопроса, которые работают всегда:" },
        { phrase: "when" },
        { phrase: "next" },
        { from: "sova", text: "Ищи того, кто продаёт ночь четырнадцатого марта. Купол 6." }
      ],
      end: "Принять первого клиента"
    },
    "m2-abel": {
      type: "hear", mission: 2, time: "22:20", place: "Кабина 3", bg: "set:keepsake", look: "dim", who: "abel",
      kicker: "Клиент рассказывает", title: "Дождь", tag: "Приём · кабина 3", code: "KS-2217",
      goal: "Слушай воспоминание и отвечай на вопросы.",
      intro: "Мистер Абель рассказывает то, что хочет продать. Слушай сколько нужно, потом ответь на вопросы для карточки. Текст можно открыть, но за слух платят больше.",
      keys: ["Слушай: где, когда, кто", "Кнопка «Медленно» — без штрафа", "Текст — крайний случай"],
      lines: [
        "I was nine years old. We lived in Lisbon, near the river.",
        "One evening in October it started to rain. The street became a river.",
        "My mother laughed. She took off her shoes, and we ran home in the rain.",
        "I can still hear her laugh. That is what I am selling."
      ],
      qs: [
        { q: "Сколько ему было лет?", opts: ["nine", "nineteen", "ninety"] },
        { q: "В каком месяце шёл дождь?", opts: ["October", "August", "December"] },
        { q: "Кто смеялся?", opts: ["his mother", "his brother", "his wife"] },
        { q: "Что он продаёт на самом деле?", opts: ["her laugh", "the street", "his shoes"] }
      ],
      sova: (s, r) => r.score >= 4 ? "Четыре из четырёх на слух. Ты слышишь лучше, чем думаешь." : "Главное поймано. Числа и месяцы — слушай их в первую очередь."
    },
    "m2-card": {
      type: "bagcheck", mission: 2, time: "22:31", place: "Кабина 3", bg: "set:keepsake", look: "dim",
      goal: "Сверь карточку с тем, что сказал клиент.",
      labels: { kicker: "Карточка приёма · KS-2217", lead: "Карточку заполнил автомат. Сверь её с тем, что сказал клиент. Нашёл(ла) ошибку — нажми на эту строку. Если всё сходится — кнопка ниже.", left: "Клиент сказал", right: "Intake card · карточка", ok: "Всё верно" },
      app: ["Age: nine", "City: Lisbon", "Month: October", "With: his mother"],
      receipt: ["Age: 9", "City: Lisbon", "Month: August", "With: mother"], wrong: 2,
      why: "Он сказал October, а в карточке August."
    },
    "m2-abel-talk": {
      type: "conv", ui: "face", mission: 2, time: "22:34", place: "Кабина 3", bg: "set:keepsake", look: "cine", npc: "abel",
      goal: "Задай мистеру Абелю два уточняющих вопроса.",
      situation: "A new intake clerk at a memory exchange asks an old client two follow-up questions about his childhood memory of rain in Lisbon.",
      forbid: FORBID,
      beats: [
        { say: "Was that clear? My English is old, like me.",
          hint: "Успокой его: Yes, very clear.", model: "Yes, very clear. Thank you.",
          facts: [{ id: "yes", label: "ответить", ai: "says it was clear or thanks him", any: [...YES, "clear", "thank*", "good", "fine", "perfect"] }], ok: "Good. Ask what you need." },
        { hint: "Спроси, когда это было и кто был рядом. По одному вопросу.", model: "When was it? Who was with you?",
          maxTurns: 7, fallbacks: ["Sorry? Say it again, please.", "I don't understand the question.", "Once more, slowly."],
          topics: [
            { id: "when", label: "когда это было", required: true, ai: "asks when it was / what year / how long ago", any: ["when", "what year", "which year", "how long ago", "how old"],
              answer: "Sixty years ago. Two thousand and forty-one. I still remember the smell of the wet street." },
            { id: "who", label: "кто был рядом", required: true, ai: "asks who was with him / if he was alone", any: ["who", "with you", "alone", "anyone else", "your father", "family"],
              answer: "Only my mother. My father was at sea." },
            { id: "why", label: "зачем продаёт", offer: true, ai: "asks why he sells it / if he is sure", any: ["why", "sure", "sell", "money", "need"],
              answer: "My granddaughter was born here. She has never seen rain. I can't give her rain. But I can pay for her school.", clue: "rainSells" }
          ],
          close: "Take good care of it. It is the best thing I have." }
      ]
    },
    "m2-june": {
      type: "hear", mission: 2, time: "23:05", place: "Кабина 3", bg: "set:keepsake", look: "dim", who: "june",
      kicker: "Клиент рассказывает", title: "Море", tag: "Приём · кабина 3", code: "KS-2218",
      goal: "Слушай воспоминание и отвечай на вопросы.",
      lines: [
        "It was my first time in the sea. I was six, maybe seven.",
        "The water was cold and very salty. I was afraid of the waves.",
        "My brother held my hand and counted to three. Then we jumped.",
        "I swallowed half the sea. I was so happy."
      ],
      qs: [
        { q: "Сколько ей было лет?", opts: ["six or seven", "sixteen", "seventeen"] },
        { q: "Какой была вода?", opts: ["cold and salty", "warm and clear", "cold and sweet"] },
        { q: "Кто держал её за руку?", opts: ["her brother", "her father", "her mother"] },
        { q: "До скольки он считал?", opts: ["three", "thirty", "ten"] }
      ],
      sova: "Дождь, море. Люди продают лучшее, что у них было. А кто-то рядом скупает худшее."
    },
    "m2-tomas": {
      type: "conv", ui: "face", mission: 2, time: "01:40", place: "Кабина 3", bg: "set:keepsake", look: "cine", npc: "tomas",
      goal: "Узнай, какую ночь он продаёт и что в ней было.",
      situation: "Late at night a tired dock rigger comes to the memory exchange to sell the memory of one night. The new clerk asks which night and what happened.",
      forbid: FORBID,
      beats: [
        { say: "Evening. I want to sell one night. Just one.",
          hint: "Спроси, какую: Which night? / When was it?", model: "Which night? When was it?",
          facts: [{ id: "which", label: "спросить, какую ночь", ai: "asks which night / when it was / what date", any: ["which night", "what night", "when", "what date", "which date", "which day", "what day"] }],
          ask: { which: "You need a date for the card, right?" }, ok: "The fourteenth of March. A Tuesday. Night shift, Dome Six, the docks." },
        { say: "You want to know what's in it. Everybody does.",
          hint: "Спроси: What happened?", model: "What happened?",
          facts: [{ id: "what", label: "спросить, что случилось", ai: "asks what happened / what he saw / what he remembers", any: ["what happened", "what did you see", "what do you remember", "tell me", "happened", "what was"] }],
          ask: { what: "Go on. Ask." }, ok: "A door. The big pressure door, six-C. The alarm didn't ring, and the door didn't close. I was on the right side of it. Three people weren't.",
          done: () => Clues.add("tomasNight") },
        { say: "I don't sleep. They say: sell it, and you sleep again. How much for a night like that?",
          hint: "Цену ты не знаешь. Выиграй время: One moment, please.", model: "One moment, please. I'll ask.",
          facts: [{ id: "moment", label: "попросить минуту", ai: "asks him to wait a moment, or says they will ask / check / do not know", any: ["moment", "minute", "second", "wait", "ask", "manager", "check", "dont know", "not sure"] }],
          ask: { moment: "So? How much?" }, ok: "Sure. I'm good at waiting." },
        { notify: "В дверях Нора. Не оборачивайся." },
        { say: "Your boss is at the door. She says she'll do my card herself. Is that normal?",
          hint: "Ты здесь первую неделю: Sorry, I'm new.", model: "I don't know. I'm new.",
          facts: [{ id: "new", label: "ответить", ai: "says they are new, do not know, or gives any short answer", any: ["new", "dont know", "not sure", "first", "maybe", "normal", "yes", "no", "sorry"] }],
          ok: "New. Then good luck to both of us.", done: () => Clues.add("noraTakes") }
      ]
    },
    "m2-report": {
      type: "chat", mission: 2, time: "02:15", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Кого забрала Нора? Какую ночь он продаёт и где это было? По-английски, коротко." },
        { me: { report: true, maxTries: 4,
          hint: "Например: He wants to sell the night of the 14th of March. Dome Six.",
          model: "He wants to sell the night of the fourteenth of March. It was in Dome Six. A door didn't close.",
          facts: [
            { id: "date", label: "какая ночь", ai: "says the night of the 14th of March", any: ["fourteenth", "14", "march"], ack: "Четырнадцатое марта. Та самая." },
            { id: "place", label: "где", ai: "says Dome Six / the docks", any: ["dome six", "dome 6", "dock*", "six"], ack: "Купол 6, доки. Сходится." }],
          ask: { date: "Какая ночь? Дата.", place: "А где это было?" },
          fallback: "Ладно, я слышала сама: четырнадцатое марта, Купол 6." } },
        { from: "sova", text: "Он девятый. Журнал покупок лежит в архиве, архив заперт. Но служебная дверь на тринадцатом — на коде." }
      ],
      end: "Дальше"
    },
    "m2-debrief": {
      type: "debrief", mission: 2, time: "02:20", place: "Итог", bg: "set:capsule", look: "dim",
      title: "Ночная смена",
      sova: (s) => s.clues.rainSells ? "Ты спросил(а) старика, зачем он продаёт. Этого в карточке нет, а надо бы. Завтра — архив." : "Смена закрыта. Завтра — архив."
    },

    // ═════════ 3 · АРХИВ ═════════
    "m3-brief": {
      type: "chat", mission: 3, missionStart: true, chapter: { n: 3, title: "Архив", sub: "Уровень 13 · после десяти" },
      time: "23:30", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Нора ушла в десять, ключ у неё. Служебная дверь — на коде, код ты слышал(а) в первый день." },
        { from: "sova", text: "Коридоры тут как лабиринт. Иди по голосу Luma: она подсказывает дорогу всем, даже тем, кому не надо." },
        { from: "sova", text: "В архиве не смотри в камеру. И найди журнал покупок." }
      ],
      end: "Идти"
    },
    "m3-walk": {
      type: "ride", mission: 3, time: "23:36", place: "Коридоры · уровень 13", bg: "set:tunnel", look: "dim", who: "luma", nav: "Маршрут", go: "Идти", title: "К архиву",
      goal: "Слушай Luma и выбирай поворот.",
      intro: "Luma говорит, куда идти. Слушай и выбирай стрелку, пока идёшь к развилке. Промах — она перестроит маршрут, но время уйдёт.",
      steps: [
        { say: "Go straight on, past the lifts.", kind: "cross", right: "straight", names: { left: "LAUNDRY", straight: "LIFTS", right: "CLINIC" } },
        { say: "Take the second right.", kind: "r2", right: "second", names: { first: "STORAGE", second: "LEVEL 13", straight: "DOME 2" } },
        { say: "At the junction, take the third exit.", kind: "round", right: "e3", names: { e1: "CANTEEN", e2: "OFFICES", e3: "ARCHIVE" } },
        { say: "The staff door is on your right.", kind: "dest", right: "right" }
      ]
    },
    "m3-door": {
      type: "crack", mission: 3, time: "23:44", place: "Архив · служебный вход", bg: "set:archive", look: "dim", who: "nora",
      kicker: "Голосовая памятка Норы", title: "Проход и ящик", label: "Запись",
      goal: "На панели — голосовая памятка Норы. Запиши проходы и номера ящиков.",
      intro: "Нора надиктовала себе памятку: где что лежит. Три записи — проход и номер ящика. Набери то, что слышишь.",
      keys: ["Слушай и набирай цифры", "Forty и fourteen звучат похоже", "Клавиатура тоже работает"],
      items: [
        { say: "Aisle fourteen. Box: nine, oh, three, three.", fields: [["Проход", "14"], ["Ящик", "9033"]], note: "Проход 14 — ящик 9033", tip: "fourteen = 14 · oh = 0" },
        { say: "Aisle forty. Box: one, seven, double oh.", fields: [["Проход", "40"], ["Ящик", "1700"]], note: "Проход 40 — ящик 1700", tip: "forty = 40 · double oh = 00" },
        { say: "Aisle nineteen. Box: six, six, one, four.", fields: [["Проход", "19"], ["Ящик", "6614"]], note: "Проход 19 — ящик 6614", tip: "nineteen = 19 · ninety = 90" }
      ],
      done: (s) => { s.flags.vault = true; },
      sova: (s, r) => r.score >= 250 ? "Fourteen, forty, nineteen — без ошибок. Проход 14 — наш." : "Памятка записана. Fourteen — четырнадцать, forty — сорок. Проход 14 — наш."
    },
    "m3-shelf": {
      type: "search", mission: 3, time: "23:52", place: "Архив · проход 14", bg: "set:archive", look: "dim",
      kicker: "Проход 14", title: "Полка",
      goal: "Осмотри полку. В камеру не смотри.",
      intro: "Перед тобой полка с картриджами: в каждом чьё-то воспоминание. Нажимай на предметы — они называют себя по-английски. Камера в углу пишет тех, кто на неё смотрит.",
      keys: ["Нажимай на предметы на полке", "Каждый называет себя по-английски", "Камера — это риск"],
      seconds: 75, svg: shelfSvg, leave: "Открыть журнал",
      words: { row: ["a row", "ряд картриджей"], slot: ["an empty slot", "пустое гнездо"], label: ["a label", "ярлык"], terminal: ["a terminal", "терминал"], camera: ["a camera", "камера"] },
      secrets: {
        row: { clues: ["nineSame"], html: `<h3>Ряд картриджей</h3><div class="o-paper print">14 MAR · DOME 6 · NIGHT\n14 MAR · DOME 6 · NIGHT\n14 MAR · DOME 6 · NIGHT\n… nine in a row.</div><p class="o-find-q">Девять картриджей подряд. Одна ночь, одно место, девять разных людей.</p>` },
        label: { html: `<h3>Ярлык</h3><div class="o-paper print">SELLER: T. BRANDT\nSOLD: yesterday\nSTATUS: HOLD — do not play</div><p class="o-find-q">Картридж Томаса, куплен вчера. «Hold — do not play»: не воспроизводить.</p>` },
        slot: { clues: ["tenth"], html: `<h3>Пустое гнездо</h3><div class="o-paper print">SLOT 10\nRESERVED\n"last witness — pending"</div><p class="o-find-q">Десятое гнездо пустое и уже подписано: «последний свидетель — ожидается».</p>` },
        terminal: { clues: ["buyerHR"], slow: 2000, html: `<h3>Терминал</h3><div class="o-paper screen">LOT: 14 MAR · DOME 6\nBUYER: H.R.\nPAYMENT: cash\nAPPROVED BY: N. HALE</div><p class="o-find-q">Покупатель — H.R., платит наличными. Каждую покупку одобрила Н. Хейл.</p>` },
        camera: { heat: 30, flag: "camSeen", slow: 1000, html: `<h3>Камера</h3><div class="o-paper print">The red light turns to you.\nRECORDING.</div><p class="o-find-q">Ты посмотрел(а) прямо в объектив. Запись идёт.</p>` }
      },
      back: { ok: "", late: "", caught: "" },
      sova: (s) => s.flags.camSeen ? "Я же просила: не в камеру. Теперь на записи твоё лицо. Доделывай быстро."
        : s.clues.nineSame && s.clues.buyerHR ? "Девять одинаковых ночей и один покупатель. И ни одного взгляда в камеру." : "Что-то осталось на полке. Но журнал важнее."
    },
    "m3-ledger": {
      type: "doc", mission: 3, time: "23:58", place: "Архив · журнал покупок", bg: "set:archive", look: "dim",
      kicker: "Журнал покупок", title: "Лот H.R.",
      goal: "Журнал открыт. Читай быстро.",
      doc: `<div class="dc-screen"><h4>KEEPSAKE · PURCHASE LEDGER · LOT H.R.</h4>
        <table><tr><th>No.</th><th>Seller</th><th>Memory</th><th>Price</th></tr>
        <tr class="hot"><td>001</td><td>N. HALE</td><td>7–14 MAR · private</td><td>90 000</td></tr>
        <tr><td>002</td><td>R. OSEI</td><td>14 MAR · DOME 6</td><td>20 000</td></tr>
        <tr><td>…</td><td>…</td><td>…</td><td>…</td></tr>
        <tr><td>009</td><td>T. BRANDT</td><td>14 MAR · DOME 6</td><td>20 000</td></tr>
        <tr><td>010</td><td>— pending —</td><td>14 MAR · DOME 6</td><td>40 000</td></tr></table>
        <p>Buyer: H.R. · cash.<br>Storage: HOLD. Do not play. Do not copy.<br>Hearing: FRI 21 MAR.<br>After the hearing: erase lot H.R.</p></div>`,
      qs: [
        { q: "Сколько предлагают за десятое воспоминание?", opts: ["40 000", "14 000", "20 000"] },
        { q: "Что сделают с лотом после слушания?", opts: ["Сотрут", "Вернут продавцам", "Продадут дороже"], clue: "ledger" },
        { q: "Чьё воспоминание стоит под номером 001?", opts: ["N. Hale", "R. Osei", "T. Brandt"], clue: "noraFirst" }
      ],
      sova: "Первая строка. Она сама что-то продала — неделю, и втрое дороже остальных. Запомни."
    },
    "m3-report": {
      type: "chat", mission: 3, time: "00:10", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Коротко и по-английски: сколько воспоминаний об одной ночи и кто покупатель?" },
        { me: { report: true, maxTries: 4,
          hint: "Например: Nine memories of the same night. The buyer is H.R.",
          model: "Nine memories of the same night. The buyer is H.R.",
          facts: [
            { id: "nine", label: "сколько", ai: "says nine memories", any: ["nine", "9"], ack: "Девять. И десятое гнездо ждёт." },
            { id: "buyer", label: "покупатель", ai: "says the buyer is H.R.", any: ["h r", "hr", "h.r", "aitch"], ack: "H.R. Буквы я найду. Ты найди людей." }],
          ask: { nine: "Сколько их?", buyer: "Кто покупатель? Буквы." },
          fallback: "Ладно. Девять воспоминаний, покупатель H.R." } },
        { from: "sova", text: "Томас живёт в Куполе 6. Сходи к нему, пока он помнит хотя бы твоё лицо." }
      ],
      end: "Дальше"
    },
    "m3-debrief": {
      type: "debrief", mission: 3, time: "00:14", place: "Итог", bg: "set:capsule", look: "dim",
      title: "Девять ночей",
      sova: (s) => s.clues.noraFirst ? "Слушание в пятницу. После него лот сотрут. А лот 001 — сама Нора. Что можно продать за девяносто тысяч?" : "Слушание в пятницу. После него лот сотрут. У нас три дня."
    },

    // ═════════ 4 · КУПОЛ 6 ═════════
    "m4-brief": {
      type: "chat", mission: 4, missionStart: true, chapter: { n: 4, title: "Купол 6", sub: "Доки и ночной рынок" },
      time: "19:40", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Купол 6 — доки. Томас сидит на рынке у лапшичной. Той ночи он уже не помнит." },
        { from: "sova", text: "Спроси, что он помнит до и после. И кто посоветовал продать. Твой главный вопрос:" },
        { phrase: "remember" },
        { from: "sova", text: "Человеку тяжело — не торопи:" },
        { phrase: "time" }
      ],
      end: "В Купол 6"
    },
    "m4-tomas": {
      type: "conv", ui: "face", mission: 4, time: "20:15", place: "Купол 6 · ночной рынок", bg: "set:market", look: "cine", npc: "tomas",
      goal: "Узнай, что Томас помнит и кто посоветовал ему продать.",
      situation: "At a night market under a lunar dome, a clerk from the memory exchange talks to a dock rigger who sold his memory of one night and now cannot remember it.",
      forbid: FORBID,
      beats: [
        { say: "Do I know you?",
          hint: "Напомни: I'm from Keepsake. We met last night.", model: "I'm Alex, from Keepsake. We met last night.",
          facts: [{ id: "who", label: "напомнить, кто ты", ai: "says they are from Keepsake / they met last night / their name is Alex", any: ["keepsake", "last night", "yesterday", "met", "alex", "card", "intake", "booth"] }],
          ask: { who: "Sorry. Who are you?" }, ok: "Keepsake. Right. They told me I was there. Sit." },
        { hint: "Спроси: что он помнит о той ночи, кто посоветовал её продать и что такое H.R.", model: "What do you remember? Who told you to sell it? What is H.R.?",
          maxTurns: 9, fallbacks: ["Hm? Again, please.", "I don't follow you.", "Eat something. Then ask."],
          topics: [
            { id: "remember", label: "что он помнит", required: true, ai: "asks what he remembers about that night / the fourteenth", any: ["remember", "that night", "fourteenth", "what happened", "the night", "the door"],
              answer: "I started my shift at eight. Then it's Wednesday morning, and there is money in my account. Between them — nothing. Like a closed door in my head.", clue: "tomasBlank", dossier: ["tomas", "knows", "Ничего: начало смены и утро среды"] },
            { id: "broker", label: "кто посоветовал", required: true, ai: "asks who told him to sell / who paid / who the broker is", any: ["who told", "who said", "who paid", "who was", "which man", "broker", "advice", "who"],
              answer: "A broker. Her name is Mara. Stall nineteen, right over there. She pays extra, on top of the Keepsake price.", clue: "brokerStall", dossier: ["mara", "role", "Брокер, прилавок 19. Доплачивает сверх цены"] },
            { id: "why", label: "зачем продал", offer: true, ai: "asks why he sold it / about sleep", any: ["why", "sleep", "sorry"],
              answer: "I wasn't sleeping. Now I sleep. But I rigged door six-C for eleven years, and now I can't tell you what was wrong with it.", clue: "door6c", dossier: ["tomas", "note", "Одиннадцать лет обслуживал дверь 6-C"] },
            { id: "hr", label: "что такое H.R.", required: true, ai: "asks what H.R. means / about Halden Rigging / his employer", any: ["h r", "hr", "halden", "rigging", "employer", "company", "boss", "work for"],
              answer: "H.R.? Halden Rigging. My employer. They own every door in this dome.", clue: "haldenName" }
          ],
          close: "If you find my night — don't tell me what's in it. Not yet." }
      ]
    },
    "m4-market": {
      type: "eaves", mission: 4, time: "20:50", place: "Ночной рынок · прилавок 19", bg: "set:market", look: "dim", plan: "market",
      title: "Прилавок 19", target: "mara", targetAt: "s19",
      goal: "Подслушай разговор Мары. Ближе — слышнее, но заметнее.",
      intro: "Мара у прилавка 19, трубка у уха, говорит громко. Ты — у арки входа. Нажимай на точки плана, чтобы подойти ближе.",
      spots: [
        { at: "gate", label: "Арка входа", ru: "далеко: только гул", dist: "far" },
        { at: "noodles", label: "Лапшичная", ru: "обрывки фраз", dist: "mid", rate: 3 },
        { at: "crates", label: "Ящики у 19-го", ru: "слышно всё, но ты на виду", dist: "near", rate: 8 }
      ],
      notice: { who: "mara", say: "You. Are you buying or listening?", good: "Then wait over there.", bad: "Hm. Move along.",
        hint: "Назови простую причину. Например: <span class=\"english\">I'm just waiting for my noodles.</span>",
        any: ["waiting", "wait", "noodles", "food", "order", "just", "friend", "looking for", "lost", "sorry", "nothing", "tired", "phone"] },
      lines: [
        { who: "mara", text: "Nine are done. All nine sleep like babies.", gap: 2600 },
        { who: "halden", text: "And the tenth?", gap: 3000 },
        { who: "mara", text: "The noodle woman. Ines. She won't sell.", gap: 4400, clue: "tenth", need: ["ines", "sell"], catch: { q: "She won't …", opts: ["sell", "tell", "sail"] } },
        { who: "halden", text: "Offer her double. Forty thousand.", gap: 4400, clue: "fortyK", need: ["forty"], catch: { q: "Сколько ей предлагают?", opts: ["forty", "fourteen", "four"] } },
        { who: "mara", text: "She says no to any price.", gap: 3400 },
        { who: "halden", text: "The hearing is on Friday. No witnesses, no hearing.", gap: 4800, clue: "friday", need: ["friday", "hearing"], catch: { q: "Когда слушание?", opts: ["Friday", "Thursday", "Sunday"] } },
        { who: "mara", text: "And Hale? She runs the archive.", gap: 3600 },
        { who: "halden", text: "Hale sold hers first. She doesn't know what she signed.", gap: 4600, clue: "noraSold", need: ["sold", "signed"] }
      ],
      outro: (s) => s.clues.tenth && s.clues.friday ? "Мара убирает трубку. Десятая — Инес из лапшичной. Слушание в пятницу. И что-то про Нору." : "Мара убирает трубку. Часть разговора ушла мимо."
    },
    "m4-call": {
      type: "lift", skin: "call", mission: 4, time: "21:05", place: "Звонок Норы", bg: "set:market", look: "dim", who: "nora",
      kicker: "Входящий вызов", title: "Нора на линии",
      goal: "Смена началась десять минут назад. Отвечай Норе спокойно и быстро.",
      intro: "Нора звонит: ты опаздываешь на смену. Выбирай спокойный бытовой ответ. Где ты и с кем говорил(а) — ей знать незачем.",
      keys: ["Короткий спокойный ответ", "Никаких адресов и имён", "Можно ответить голосом"],
      secs: 8, unit: "Вопрос",
      items: [
        { say: "Alex? It's Nora. Your shift started ten minutes ago. Where are you?", right: "I'm on my way. Ten minutes.",
          wrong: ["I am in way yesterday.", { t: "I'm at the Dome Six market.", heat: 15 }], why: "Спокойно и без адреса: I'm on my way." },
        { say: "Is everything all right?", right: "Yes, everything is fine.", wrong: ["Yes, all is right me.", { t: "No. I talked to Tomas.", heat: 20 }], why: "Коротко: Yes, everything is fine." },
        { say: "A client is waiting in booth three. Can you take her?", right: "Sure. I'll be there soon.", wrong: ["I take her yesterday.", "No, thank you."], why: "Соглашайся: Sure. I'll be there soon." },
        { say: "One more thing. Did anyone ask you about the archive?", right: "No, nobody.", wrong: [{ t: "Yes, a friend of mine.", heat: 20 }, "Nobody ask not."], why: "Коротко: No, nobody." },
        { say: "Good. Thank you, Alex. See you soon.", right: "See you soon.", wrong: ["See you yesterday.", "You're welcome me."], why: "Вежливо закончить: See you soon." }
      ],
      badge: "calm",
      sova: (s, r) => r.score >= 4 ? "Ровно и без адресов. Она ничего не заподозрила — или сделала вид." : "Она услышала лишнее. С Норой — только бытовое и короткое."
    },
    "m4-debrief": {
      type: "debrief", mission: 4, time: "21:20", place: "Итог", bg: "set:capsule", look: "dim",
      title: "Десятая",
      sova: (s) => s.clues.noraSold ? "«Хейл продала своё первой. Она не знает, что подписала». Иней, она не сообщница. Она — первый лот." : "Десятая — Инес. Брокер придёт к ней с двойной ценой. Надо успеть раньше."
    },

    // ═════════ 5 · ДЕСЯТАЯ ═════════
    "m5-brief": {
      type: "chat", mission: 5, missionStart: true, chapter: { n: 5, title: "Десятая", sub: "Над лапшичной · прилавок 18" },
      time: "22:30", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Инес живёт над лапшичной. Мара идёт к ней сегодня с сорока тысячами. Дойди раньше." },
        { from: "sova", text: "Она не продаёт и брокеров не любит. Читай, что написано на двери." },
        { from: "sova", text: "И спроси её про ту ночь. Усомнится — уточняй:" },
        { phrase: "sure" }
      ],
      end: "Идти"
    },
    "m5-walk": {
      type: "ride", mission: 5, time: "22:36", place: "Коридоры · Купол 6", bg: "set:tunnel", look: "dim", who: "luma", nav: "Маршрут", go: "Идти", title: "К прилавку 18",
      goal: "Слушай Luma и выбирай поворот.",
      steps: [
        { say: "Take the first right.", kind: "r2", right: "first", names: { first: "MARKET LANE", second: "DOCKS", straight: "DOME 5" } },
        { say: "Go straight on at the crossing.", kind: "cross", right: "straight", names: { left: "CLINIC", straight: "STALL ROW", right: "DOCK 6-C" } },
        { say: "At the junction, take the second exit.", kind: "round", right: "e2", names: { e1: "DOCKS", e2: "STALL 18", e3: "LIFTS" } },
        { say: "Her door is on your left.", kind: "dest", right: "left" }
      ]
    },
    "m5-door": {
      type: "drop", mission: 5, time: "22:44", place: "Дверь над лапшичной", bg: "set:market", look: "cine",
      card: { kicker: "Дверь над лапшичной", title: "Stall 18 · upstairs", noteLabel: "Записка на двери", note: "CLOSED. Friends: knock twice. Brokers: go away." },
      opts: [
        { ru: "Постучать дважды", ok: true },
        { ru: "Позвонить и сказать, что есть предложение", why: "«Предложение» — слово брокера. На двери написано: brokers, go away." },
        { ru: "Ждать внизу, пока она выйдет", why: "Мара придёт раньше. На двери сказано, как стучать: knock twice." }
      ]
    },
    "m5-ines": {
      type: "conv", ui: "face", mission: 5, time: "22:46", place: "У Инес", bg: "set:capsule", look: "cine", npc: "ines",
      goal: "Узнай, что видела Инес, кто подписал дверь и придёт ли она на слушание.",
      situation: "The last witness of a dock accident lets a clerk from the memory exchange into her small flat above a noodle stall. She has refused to sell her memory. The clerk asks what she saw.",
      forbid: FORBID,
      beats: [
        { say: "Two knocks. So you can read. Who are you?",
          hint: "Имя — и что ты не покупаешь: I'm Alex. I'm not a broker.", model: "I'm Alex. I'm not a broker.",
          facts: [{ id: "name", label: "назваться", ai: "says their name, or that they are not a broker / not buying", any: ["alex", "frost", "not a broker", "no broker", "not buying", "friend", "keepsake"] }],
          ask: { name: "A name. Start with a name." }, ok: "Alex. You work at Keepsake and you are not buying. Interesting. Come in." },
        { hint: "Спроси: что она видела той ночью, кто подписал дверь и придёт ли она в пятницу.", model: "What did you see that night? Who signed the door? Will you speak on Friday?",
          maxTurns: 10, fallbacks: ["Say it simply.", "I cook noodles, not riddles. Again.", "What exactly are you asking?"],
          topics: [
            { id: "saw", label: "что она видела", required: true, ai: "asks what she saw / what happened that night", any: ["what did you see", "that night", "saw", "see", "what happened", "remember", "fourteenth"],
              answer: "I was closing the stall. The alarm was silent. Door six-C stayed open for forty seconds. Three people were on the wrong side. I knew all three. They ate here every night.", clue: "inesSaw", dossier: ["ines", "knows", "Дверь 6-C была открыта сорок секунд. Трое погибли"] },
            { id: "signed", label: "кто подписал дверь", required: true, ai: "asks who signed / checked / approved the door, who is responsible", any: ["who signed", "signed", "who checked", "inspect*", "safety", "approved", "responsible", "whose fault"],
              answer: "A safety officer checked that door one week before. A woman. She signed the form. At the funeral she cried more than the families.", clue: "inesOfficer" },
            { id: "friday", label: "придёт ли на слушание", required: true, ai: "asks if she will speak / testify at the hearing on Friday", any: ["friday", "hearing", "speak", "testify", "will you", "tell them", "the board"],
              answer: "I'll speak on Friday. If I still remember by Friday. They come every night now, and every night the price goes up." },
            { id: "sell", label: "почему не продаёт", offer: true, ai: "asks why she does not sell / about the money", any: ["sell", "money", "forty", "price", "why not", "afraid"],
              answer: "Forty thousand is a lot of noodles. But somebody has to remember them. If I sell, it never happened." }
          ],
          close: "Do one thing for me. Keep a copy. In your head, not in a machine. Listen." }
      ]
    },
    "m5-memory": {
      type: "hear", mission: 5, time: "23:02", place: "У Инес", bg: "set:capsule", look: "dim", who: "ines",
      kicker: "Инес рассказывает", title: "Сорок секунд", tag: "Не запись · только ты", code: "14 MAR",
      goal: "Запомни её ночь. В пятницу тебя спросят.",
      intro: "Инес рассказывает ту ночь — тебе, без машины. Если её память всё-таки купят, останется твоя. Слушай: время, дверь, секунды, люди.",
      keys: ["Слушай цифры и время", "Эти же факты спросят на слушании", "Текст — крайний случай"],
      lines: [
        "It was the fourteenth of March, ten past eleven at night.",
        "The alarm was silent. Door six-C stayed open for forty seconds.",
        "Three people were on the wrong side of it.",
        "The next morning there was a new door, and nobody talked about the old one."
      ],
      qs: [
        { q: "Во сколько это было?", opts: ["ten past eleven", "ten to eleven", "eleven past ten"] },
        { q: "Сколько секунд дверь была открыта?", opts: ["forty", "fourteen", "four"] },
        { q: "Сколько человек осталось не с той стороны?", opts: ["three", "thirteen", "two"] },
        { q: "Что появилось наутро?", opts: ["a new door", "a new alarm", "a new guard"], clue: "inesCopy" }
      ],
      badge: "listener",
      sova: "Теперь это помнят двое. Одного из двоих купить нельзя."
    },
    "m5-form": {
      type: "doc", mission: 5, time: "23:12", place: "У Инес · копия акта", bg: "set:capsule", look: "dim",
      kicker: "Акт осмотра", title: "Дверь 6-C",
      goal: "Инес хранит копию акта осмотра двери. Читай.",
      doc: `<div class="dc-screen"><h4>HALDEN RIGGING · DOOR 6-C · INSPECTION FORM</h4>
        <table><tr><th>Date</th><th>Check</th><th>Result</th></tr>
        <tr><td>7 MAR</td><td>Seal</td><td>WORN</td></tr>
        <tr><td>7 MAR</td><td>Alarm</td><td>FAULT</td></tr>
        <tr class="hot"><td>7 MAR</td><td>Decision</td><td>APPROVED FOR USE</td></tr></table>
        <p>Safety officer: N. HALE<br>Owner's note: "Replace next quarter. — C. Halden"<br>Keepsake lot 001: seller N. HALE · memory 7–14 MAR.</p></div>`,
      qs: [
        { q: "Что было с сигнализацией 7 марта?", opts: ["FAULT — неисправна", "OK — исправна", "Не проверяли"] },
        { q: "Какое решение приняли?", opts: ["Approved for use", "Closed for repair", "Replaced"] },
        { q: "Кто подписал акт?", opts: ["N. Hale", "C. Halden", "T. Brandt"], clue: "noraSigned" }
      ],
      sova: "Она подписала. Потом продала неделю своей жизни и теперь сама не знает, что сделала. Она тебе не врёт. Она правда не помнит."
    },
    "m5-debrief": {
      type: "debrief", mission: 5, time: "23:20", place: "Итог", bg: "set:capsule", look: "dim",
      title: "Сорок секунд",
      sova: (s) => s.clues.inesCopy ? "У тебя её ночь и акт с подписью. В пятницу — слушание. Комиссии нужны цифры, даты, имена." : "Акт у нас. В пятницу — слушание. Комиссии нужны цифры, даты, имена."
    },

    // ═════════ 6 · СЛУШАНИЕ ═════════
    "m6-brief": {
      type: "chat", mission: 6, missionStart: true, chapter: { n: 6, title: "Слушание", sub: "Пятница · комиссия по безопасности" },
      time: "08:40", place: "Сообщения", bg: "set:capsule", look: "dim", app: "sova",
      steps: [
        { from: "sova", text: "Пятница. Инес заговорит, если первым заговорит кто-то из Keepsake. Это ты." },
        { from: "sova", text: "Комиссия спросит четыре вещи: сколько, кто платил, что видела свидетельница, кто подписал. Отвечай точно:" },
        { phrase: "exact" },
        { from: "sova", text: "Сначала разложи всё на доске. Эти же слова скажешь через час." }
      ],
      end: "К доске"
    },
    "m6-board": {
      type: "caseboard", mission: 6, time: "08:50", place: "Доска", bg: "set:capsule", look: "dim",
      kicker: "Перед слушанием", title: "Ночь 14 марта", boardTitle: "Who signed Door 6-C?", stamp: "SIGNED",
      goal: "Разложи факты по людям и назови того, кто подписал дверь.",
      intro: "Каждая карточка — факт по-английски. Нажми на того, о ком он. Эти же слова пригодятся тебе перед комиссией.",
      suspects: ["tomas", "mara", "ines", "nora"],
      cards: [
        { who: "tomas", en: "Rigged Door 6-C for eleven years.", ru: "Одиннадцать лет обслуживал дверь 6-C.", clue: "door6c" },
        { who: "tomas", en: "Sold the night of the fourteenth of March.", ru: "Продал ночь четырнадцатого марта.", clue: "tomasNight" },
        { who: "mara", en: "Buys memories at stall nineteen.", ru: "Скупает воспоминания у прилавка 19.", clue: "brokerStall" },
        { who: "mara", en: "Offered forty thousand for the tenth memory.", ru: "Предложила сорок тысяч за десятое воспоминание.", clue: "fortyK" },
        { who: "ines", en: "Saw the door stay open for forty seconds.", ru: "Видела, как дверь была открыта сорок секунд.", clue: "inesSaw" },
        { who: "ines", en: "Refused to sell.", ru: "Отказалась продавать.", clue: "tenth" },
        { who: "nora", en: "Keeps the key to the archive.", ru: "Носит ключ от архива.", clue: "noraKey" },
        { who: "nora", en: "Sold one week of her own memory. Lot 001.", ru: "Продала неделю собственной памяти. Лот 001.", clue: "noraFirst" },
        { who: "nora", en: "Was the safety officer on the seventh of March.", ru: "Седьмого марта была инспектором по безопасности.", clue: "noraSigned" }
      ],
      question: "Who signed Door 6-C?", questionRu: "Кто подписал дверь 6-C?", answer: "nora",
      nudge: "Не сходится. Чья подпись стоит в акте от седьмого марта?",
      sova: "Подписала она. А за то, чтобы все забыли, заплатил Halden. Комиссии нужны оба имени."
    },
    "m6-hearing": {
      type: "conv", ui: "face", mission: 6, time: "10:00", place: "Зал слушаний", bg: "set:hearing", look: "cine", npc: "rahimi", meter: "Показания",
      goal: "Отвечай комиссии точно: цифры, даты, имена.",
      situation: "A formal hearing of the Colony Safety Board on the Moon. The chairman questions a clerk from the memory exchange about nine purchased memories of a dock accident.",
      forbid: FORBID,
      beats: [
        { say: "This hearing is open. Witness, state your name and your job.",
          hint: "Имя и работа: I'm Alex Frost. I work at Keepsake.", model: "I'm Alex Frost. I work at Keepsake.",
          facts: [{ id: "name", label: "имя и работа", ai: "says their name is Alex Frost and/or that they work at Keepsake", any: ["alex", "frost", "keepsake"] }],
          ask: { name: "Your name, please." }, ok: "Thank you." },
        { say: "How many memories of the fourteenth of March did Keepsake buy?",
          hint: "Девять: Nine.", model: "To be exact: nine.",
          facts: [{ id: "nine", label: "девять", ai: "says nine", any: ["nine", "9"] }],
          ask: { nine: "A number, please." }, ok: "Nine. Noted.", done: (s) => { s.flags.e1 = true; } },
        { say: "Who paid for them?",
          hint: "В журнале — H.R. Это Halden Rigging.", model: "Halden Rigging. H.R. in the ledger.",
          facts: [{ id: "hr", label: "Halden Rigging", ai: "names Halden Rigging / H.R. as the buyer", any: ["halden", "h r", "hr", "rigging"] }],
          ask: { hr: "A name. Who was the buyer?" }, ok: "Halden Rigging. The owner of the door.", done: (s) => { s.flags.e2 = true; } },
        { say: "What did the last witness see? Be exact.",
          hint: "Дверь 6-C была открыта сорок секунд. Трое погибли.", model: "Door six-C stayed open for forty seconds. Three people died.",
          facts: [{ id: "forty", label: "сорок секунд", ai: "says the door stayed open for forty seconds", any: ["forty", "40"] }],
          bonus: [{ id: "three", label: "трое", ai: "says three people were on the wrong side / died", any: ["three", "3"], reply: "Forty seconds. Three people." }],
          ask: { forty: "For how long was the door open?" }, ok: "Forty seconds. Noted.", done: (s) => { s.flags.e3 = true; } },
        { say: "And who approved that door for use?",
          hint: "Акт подписала Nora Hale. Седьмого марта.", model: "Nora Hale approved it, on the seventh of March.",
          facts: [{ id: "nora", label: "Nora Hale", ai: "names Nora Hale as the safety officer who approved the door", any: ["nora", "hale"] }],
          ask: { nora: "The name on the form, please." }, ok: "Nora Hale. The seventh of March.", done: (s) => { s.flags.e4 = true; } },
        { say: "Last question. Why should this board believe a clerk who arrived two weeks ago?",
          hint: "Скажи главное: The witness is here. Ask her.", model: "You don't have to believe me. The witness is here. Ask her.",
          facts: [ANY_EN],
          bonus: [{ id: "her", label: "позвать свидетельницу", ai: "says the witness is here / asks the board to listen to her / mentions the form or the ledger", any: ["witness", "ines", "ask her", "she is here", "shes here", "she remembers", "listen to her", "the form", "ledger"], reply: "Then we will hear her." }],
          done: (s) => { s.flags.evidence = ["e1", "e2", "e3", "e4"].filter((k) => s.flags[k]).length; if (s.flags.evidence >= 4) Juice.badge("exact"); } },
        { notify: "Инес встаёт. Говорит." }
      ]
    },
    "m6-nora": {
      type: "conv", ui: "face", mission: 6, time: "13:20", place: "Keepsake · после слушания", bg: "set:keepsake", look: "cine", npc: "nora",
      goal: "Нора ждёт тебя у кабины три. Скажи ей правду.",
      situation: "After the hearing, the manager of the memory exchange asks her clerk whether it is true that she signed the faulty door. She sold that week of her memory and does not remember.",
      beats: [
        { say: "They said my name in there. They say I signed that door. Alex — is it true?",
          hint: "Скажи правду: Yes. You signed it.", model: "Yes. You signed it.",
          facts: [{ id: "true", label: "сказать правду", ai: "confirms that it is true / that she signed it", any: [...YES, "true", "you signed", "you did", "signed", "it is"] }],
          ask: { true: "Please. Yes or no." }, ok: "I don't remember it. I remember the funeral. I remember crying and not knowing why." },
        { say: "I sold that week. Lot one. I thought it was grief. It was guilt, wasn't it?",
          hint: "Ответь как человек: I think so. / Yes.", model: "I think so.",
          facts: [ANY_EN], ok: "Ninety thousand. He paid me to forget that he told me to sign." },
        { say: "The cartridge is still in the archive, and I have the key. If I play it, I remember everything. Should I?",
          hint: "Решать ей, но ответить надо: Yes, you should. / It's your memory.", model: "It's your memory. Yes, you should.",
          facts: [{ id: "say", label: "ответить", ai: "gives an opinion: yes, no, or that it is her choice", any: [...YES, ...NO, "should", "your memory", "your choice", "you decide", "play it", "remember", "up to you"] }],
          ask: { say: "Tell me what you think." }, ok: "It's mine. Mine to carry.", done: (s) => { s.flags.noraPlays = true; } },
        { say: "Will you stay with me while I listen?",
          hint: "Да или нет.", model: "Yes. I'll stay.",
          facts: [{ id: "stay", label: "ответить", ai: "says yes or no", any: [...YES, ...NO, "stay", "ill stay", "sorry"] }], ok: "Thank you." }
      ],
      end: { say: "Booth three. Lights down. Here we go." }
    },
    "m6-end": {
      type: "finale", mission: 6, time: "21:00", place: "Финал", bg: "set:dome", look: "dim",
      kicker: "Пятница, вечер",
      judge: (s) => {
        const e = s.flags.evidence || 0;
        if (e >= 4 && (s.heat || 0) < 60) return "best";
        if (e >= 2) return "good";
        return "gone";
      }
    }
  };

  const FINALE = {
    best: {
      title: "Дождь",
      text: (s) => [
        "Комиссия слушала до вечера. Инес говорила сорок минут — в шестьдесят раз дольше, чем дверь 6-C была открыта.",
        "Лот H.R. не стёрли: архив опечатали в тот же час. Девять картриджей вернули тем, чьи они. Бесплатно.",
        "Томас прослушал свою ночь на третий день. Сказал только: «Теперь я знаю, что с ней было не так». Двери в Куполе 6 меняют все.",
        s.flags.noraPlays ? "Нора выслушала свою неделю до конца. Потом пошла к комиссии сама и назвала того, кто велел ей подписать." : "Нора так и не открыла свой картридж. Он лежит в архиве под номером 001.",
        "Мистер Абель выкупил свой дождь обратно — за ту же цену, до цента. Теперь по пятницам его включают в Куполе 2, для всех. Очередь на час."
      ],
      sova: () => "Чисто. И, Иней… я послушала запись Абеля. Мать смеётся, вода по щиколотку. Возвращайся — у нас тут тоже дождь. Настоящий."
    },
    good: {
      title: "Слушание отложено",
      text: () => [
        "Комиссия услышала не всё. Инес выступила, но без точных цифр её слово осталось одно против адвокатов Halden Rigging.",
        "Слушание перенесли на месяц. Лот H.R. опечатали: стереть его пока нельзя, вернуть — тоже.",
        "Томас по-прежнему спит хорошо и не знает почему.",
        "Нора ушла из Keepsake в тот же день. Ключ от архива оставила на столе."
      ],
      sova: () => "Половина дела. Комиссии нужны четыре точных ответа: сколько, кто платил, что видела свидетельница, кто подписал."
    },
    gone: {
      title: "Лот стёрт",
      text: () => [
        "Комиссия закрыла слушание за недостатком показаний.",
        "В полночь лот H.R. стёрли. Девять человек проснулись утром и ничего не заметили.",
        "Инес открыла лапшичную как обычно. Она помнит. Пока.",
        "Последний день можно переиграть."
      ],
      sova: () => "Он не услышал от тебя ни одной цифры. Девять, Halden Rigging, сорок секунд, Нора Хейл — вот что ему было нужно."
    }
  };

  const FLOW = [
    "m1-open", "m1-legend", "m1-check", "m1-gate", "m1-capsule", "m1-nora", "m1-debrief",
    "m2-brief", "m2-abel", "m2-card", "m2-abel-talk", "m2-june", "m2-tomas", "m2-report", "m2-debrief",
    "m3-brief", "m3-walk", "m3-door", "m3-shelf", "m3-ledger", "m3-report", "m3-debrief",
    "m4-brief", "m4-tomas", "m4-market", "m4-call", "m4-debrief",
    "m5-brief", "m5-walk", "m5-door", "m5-ines", "m5-memory", "m5-form", "m5-debrief",
    "m6-brief", "m6-board", "m6-hearing", "m6-nora", "m6-end"
  ];

  Object.entries(S).forEach(([id, sc]) => { SCENES[id] = sc; });

  return { LEGEND, LEGEND_GROUPS, PHRASES, EXPLAIN, CLUES, SUSPECTS, DOSSIER_FIELDS, MISSIONS, CAST, ORDERS: {}, PLANS, FINALE, FLOW };

})();
