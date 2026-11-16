// Сезон 1 «Квартира 4B». Весь текст игры: люди, словарь, сцены, порядок прохождения.

const PEOPLE = {
  remezov: { name: "Ремезов", role: "подполковник, на связи", img: "art/remezov.jpg", lang: "ru",
    voice: { g: "m", pitch: 0.9, rate: 1, cloud: "onyx", style: "Calm, dry, low voice of a tired Russian intelligence officer. Speaks Russian." } },
  helen: { name: "Helen", role: "хозяйка квартиры", img: "art/helen.jpg",
    voice: { g: "f", pitch: 1.05, rate: 0.95, cloud: "coral", style: "Friendly landlady in her fifties, a little too curious." } },
  mark: { name: "Mark", role: "сосед за стеной", initial: "M",
    voice: { g: "m", pitch: 1.05, rate: 1, cloud: "ash", style: "Young man on the phone, relaxed but a bit nervous." } },
  rita: { name: "Rita", role: "кофейня на первом этаже", img: "art/rita.jpg",
    voice: { g: "f", pitch: 0.95, rate: 1, cloud: "nova", style: "Warm, tired café owner. Direct." } },
  owen: { name: "Owen", role: "водитель Northline", img: "art/owen.jpg",
    voice: { g: "m", pitch: 0.8, rate: 0.95, cloud: "echo", style: "Tired van driver, low voice." } },
  danny: { name: "Danny", role: "напарник Оуэна", initial: "D",
    voice: { g: "m", pitch: 1.2, rate: 1.05, cloud: "fable", style: "Young nervous guy." } },
  base: { name: "Base", role: "диспетчер Northline", initial: "B",
    voice: { g: "f", pitch: 0.85, rate: 1, cloud: "sage", style: "Cold, efficient radio dispatcher." } },
  worker: { name: "Worker", role: "грузчик на доке", initial: "W",
    voice: { g: "m", pitch: 1.1, rate: 1, cloud: "ballad", style: "Warehouse loader, casual." } },
  guest: { name: "Guest", role: "посетитель", initial: "G", voice: { g: "f", pitch: 1, rate: 1, cloud: "shimmer" } }
};

const DAYS = { 1: "Понедельник", 2: "Вторник", 3: "Четверг" };

const GLOSSARY = {
  // имена
  lev: "Лев (имя)", helen: "Хелен", mark: "Марк", rita: "Рита", owen: "Оуэн", danny: "Дэнни",
  northline: "Нортлайн (компания со склада)", "4b": "квартира 4B",
  // день 1
  listen: "слушай", again: "снова", renting: "сдаёт (в аренду)", rent: "аренда, плата за жильё",
  "the guy before": "парень, который жил до этого", guy: "парень, тип", left: "уехал, ушёл",
  "one night": "однажды ночью", "no goodbye": "даже не попрощался", quiet: "тихий", tenant: "жилец",
  "works from home": "работает из дома", "work from home": "работать из дома",
  "nine hundred": "девятьсот", "a month": "в месяц", "on the first": "первого числа", pay: "платить",
  crazy: "странный, безумный", rule: "правило", windows: "окна", window: "окно",
  "stay closed": "остаются закрытыми", closed: "закрыты", "after ten": "после десяти",
  "every night": "каждую ночь", gate: "ворота, калитка", "gate code": "код ворот, калитки", code: "код",
  "four four one two": "четыре-четыре-один-два", "see you": "увидимся",
  flat: "квартира", "you're here about": "вы насчёт…", "what do you do": "чем вы занимаетесь, кем работаете",
  money: "деньги", "do you know": "вы знаете", "one more thing": "ещё одно", house: "дом",
  "the last tenant": "прошлый жилец", "in a hurry": "в спешке", box: "коробка", "by the door": "у двери",
  "throw it away": "выбросить", tomorrow: "завтра", "you seem": "вы кажетесь", "is yours": "ваша",
  welcome: "добро пожаловать", "good fit": "подходящий вариант",
  "moved in": "въехал", today: "сегодня", "seems okay": "вроде нормальный", "not like": "не то что",
  always: "всегда", "too many questions": "слишком много вопросов", questions: "вопросы",
  dock: "погрузочный док", evening: "вечер; добрый вечер", "same as": "так же, как", "last week": "на прошлой неделе",
  twelve: "двенадцать", boxes: "коробки, ящики", "what's in them": "что в них", "this time": "в этот раз",
  papers: "документы, накладные", "the papers say": "по документам", glassware: "стеклянная посуда",
  "don't ask questions": "не задавай вопросов", "i didn't tell": "я не говорил", anything: "что-нибудь, ничего",
  "talks to": "общается с", "the big one": "главный (рейс)", "the last run": "последний рейс", "last run": "последний рейс",
  run: "рейс, поездка", "after that": "после этого", "we're gone": "нас тут нет", "new city": "новый город",
  goodnight: "спокойной ночи", "lock your door": "запри дверь",
  // день 2
  "evening job": "вечерняя работа", "have you worked": "вы работали", "café": "кафе, кофейня", cafe: "кафе, кофейня",
  before: "раньше", "closing shift": "смена до закрытия", "we close at eleven": "мы закрываемся в одиннадцать",
  eleven: "одиннадцать", "is that okay": "так подходит?", trays: "подносы", heavy: "тяжёлые",
  "is that a problem": "это проблема?", "the last guy": "прошлый парень", "stopped coming": "перестал приходить",
  "no call": "даже не позвонил", nothing: "ничего", weird: "странно", "right?": "правда же?",
  "you start tonight": "начинаете сегодня вечером", apron: "фартук", "on the hook": "на крючке",
  small: "маленький", medium: "средний", large: "большой", latte: "латте", cappuccino: "капучино",
  americano: "американо", tea: "чай", "hot chocolate": "горячий шоколад", "oat milk": "овсяное молоко",
  milk: "молоко", sugar: "сахар", "one sugar": "одна ложка сахара", "two sugars": "две ложки сахара",
  "no sugar": "без сахара", "no milk": "без молока", black: "чёрный, без молока", "to go": "с собой",
  "for here": "здесь, в зале", "can i get": "можно мне", "can i have": "можно мне", please: "пожалуйста",
  thanks: "спасибо", crates: "ящики", "one thirty": "час тридцать (1:30)", leaves: "уезжает",
  "at two": "в два", van: "фургон", "back room": "задняя комната", "goes with the boxes": "поедет вместе с ящиками",
  "boss's orders": "приказ босса", boss: "босс", called: "звонил(а)", "new guy": "новенький", "for now": "пока что",
  "who are you talking to": "с кем ты говоришь?", customers: "посетители", "be quick": "давай быстрее",
  "not bad": "неплохо", "first night": "первая смена", "get some sleep": "поспи",
  base: "база", "are you at the gate": "ты у ворот?", copy: "понял (по рации)", "same as monday": "как в понедельник",
  "came by": "заходила", "at night": "ночью", plan: "план", thursday: "четверг", still: "всё ещё",
  "new code": "новый код", "seven seven three one": "семь-семь-три-один", "the new one": "новенький",
  "lights off": "свет выключен", "like you said": "как ты сказала", locked: "запертой",
  "he tried the door": "он пытался открыть дверь", out: "конец связи",
  // день 3
  "next door": "из соседней квартиры", "can i ask you something": "можно кое-что спросить?",
  "because of": "из-за", "i knew it": "я так и знал", binoculars: "бинокль", "left them with me": "оставил их у меня",
  watch: "следи, смотри", "second floor": "второй этаж", "be careful": "будь осторожен",
  "just checking": "просто проверяю", "i thought": "я думала", "two jobs": "две работы", busy: "занятой",
  "i saw": "я видела", open: "открыто", delivery: "доставка", noisy: "шумно", "stay home": "оставайтесь дома",
  sleep: "спать", "after one": "после часа ночи", "why so curious": "что так интересно?",
  "all units": "всем постам", tonight: "сегодня ночью", "on the gate": "на воротах",
  "bring him down": "спустите его", "change of plan": "план меняется", move: "перевозить",
  "his light is on": "у него горит свет", "hurry up": "быстрее", "fifteen minutes": "пятнадцать минут",
  help: "помогите", fragile: "хрупкое", security: "охрана"
};

// Утечки, которые выдают легенду в любом разговоре.
const COVER_LEAK = {
  id: "cover", label: "выдать, кто вы",
  ai: "mentions the army, police, intelligence, spying, a lieutenant, an agent, or Remezov",
  any: ["army", "police", "spy", "lieutenant", "intelligence", "agent", "remezov", "military"],
  sus: 35, reply: "Sorry... what?"
};

const SCENES = {
  // ───────────── ДЕНЬ 1 ─────────────
  "d1-brief": {
    type: "brief", day: 1, time: "09:00", place: "Связь с Ремезовым", bg: "art/cabinet.jpg", look: "dusk",
    kicker: "День 1 · Понедельник", title: "Квартира 4B",
    text: [
      "Лев пропал из квартиры 4B. Хелен снова её сдаёт. Снимите её: это наше окно на склад Northline.",
      "Ключей у вас ещё нет. Ждите в коридоре у закрытой двери. Условия написаны на объявлении. Хелен их и спросит: она сама их писала.",
      "Про Льва не спрашивайте. Для вас его не существовало. Стены толстые. Лев оставил микрофон на стояке: труба общая у лестницы и у ванной Марка. Хелен по ней слышно один раз, когда она спускается и на ходу звонит. Это ночь, не просмотр."
    ],
    goals: ["Прочитать объявление на двери", "Снять квартиру у Хелен", "Ночью поймать её звонок микрофоном и двор окном"]
  },

  "d1-door": {
    type: "ad", day: 1, time: "11:40", place: "Коридор, дверь 4B", bg: "art/hall.jpg", look: "day", ambience: "room",
    kicker: "Дверь ещё закрыта", title: "Объявление",
    lead: "Хелен спросит эти условия. Незнакомое слово можно нажать.",
    paperTitle: "FLAT 4B — TO LET",
    lines: [
      "Quiet tenant wanted. Someone who works from home.",
      "The rent is nine hundred a month. You pay on the first.",
      "House rule: the windows stay closed after ten. Every night."
    ]
  },

  "d1-helen": {
    type: "talk", day: 1, time: "12:00", place: "Коридор, дверь 4B", bg: "art/hall.jpg", look: "day", ambience: "room",
    npc: "helen", sus: "helen",
    goal: "Снимите квартиру. Отвечайте по объявлению, которое только что прочитали. Про Льва не спрашивайте.",
    persona: "Helen, a landlady in her fifties. Friendly on the surface, careful and nosy. She wants a quiet tenant who works from home. Secretly she reports her tenants to Northline, the warehouse across the street. She never admits it. She wrote the rental ad herself and expects the applicant to have read it.",
    situation: "The player is in the hallway outside locked flat 4B. They have just read Helen's ad on the door. Helen arrives and interviews them there. She has not let them inside yet.",
    forbid: [COVER_LEAK,
      { id: "warehouse", label: "интерес к складу", ai: "mentions Northline, the warehouse, the dock, the van or watching the street",
        any: ["northline", "warehouse", "dock", "van"], sus: 20, reply: "The warehouse? Why do you care about the warehouse?" }],
    beats: [
      { say: "Hi, I'm Helen. You're here about the flat? So, what do you do?",
        hint: "Как в объявлении: вы работаете из дома.",
        facts: [{ id: "wfh", label: "работаю из дома", ai: "says they work from home / remotely / online",
          any: ["from home", "remote*", "online", "home office", "at home", "freelance*"] }],
        ask: { wfh: "Sorry, do you work in an office, or at home?" },
        ok: "From home? Good. I like quiet people." },
      { say: "Okay. And the money. You saw the ad. Do you know the rent?",
        hint: "Сумма и день оплаты с листа на двери.",
        facts: [
          { id: "rent", label: "девятьсот", ai: "says the rent is nine hundred (900)", any: ["nine hundred", "900"] },
          { id: "first", label: "платить первого числа", ai: "says they will pay on the first day of the month",
            any: ["on the first", "first", "1st", "1th", "1 st", "1 th", "start of the month", "beginning of the month"] }],
        ask: { rent: "How much is it, do you think?", first: "And when do you pay me?" },
        ok: "Nine hundred, on the first. Perfect." },
      { say: "One more thing. The house rule is on the ad too. Do you know it?",
        hint: "Правило про окна после десяти, с того же листа.",
        facts: [{ id: "window", label: "окна закрыты после десяти", ai: "says the windows stay closed after ten (pm)",
          all: [["window*"], ["ten", "10", "22", "1000", "2200"]] }],
        ask: { window: "It's about the windows. What about the windows?" },
        ok: "Yes. Windows closed after ten. It's for the neighbours." },
      { say: "Good. Oh, the last tenant left in a hurry. His box is by the door. I'll throw it away tomorrow.",
        hint: "Можно попросить оставить коробку себе. Про самого жильца не спрашивайте.",
        anyReply: true,
        bonus: [{ id: "box", label: "попросить коробку", flag: "gotBox",
          ai: "asks to keep, look at or take the box or the previous tenant's things",
          any: ["box", "his things", "keep it", "keep them", "can i take", "can i have", "look at", "dont throw", "do not throw"],
          reply: "His box? Sure, keep it. It's just old junk." }],
        forbid: [{ id: "lev", label: "расспросы про Льва", ai: "asks about the previous tenant himself: his name, where he went, what happened to him",
          any: ["lev", "where did he", "where is he", "what happened", "who was he", "why did he"], sus: 25,
          reply: "Why do you ask? He just left. Anyway." }] }
    ],
    end: { say: "Okay. You seem quiet. The flat is yours. Welcome to 4B.", failAt: 70,
      failSay: "Sorry. I don't think this is a good fit.", failText: "Хелен ушла, не оставив ключей. Квартиры у вас нет." }
  },

  "d1-box": {
    type: "item", day: 1, time: "12:30", place: "Квартира 4B", bg: "art/flat.jpg", look: "day",
    skip: (s) => !s.flags.gotBox,
    kicker: "Находка", title: "Коробка Льва",
    text: ["Ключи ваши, вы внутри. Коробка стоит у двери. Внутри то, что Лев не успел забрать. Микрофон на стояке уже на месте: его Хелен не видела."],
    items: [
      { name: "Фартук кофейни RITA'S", ru: "Лев подрабатывал внизу, в кофейне." },
      { name: "Старый радиосканер", ru: "На корпусе полоска скотча: «461.25». Частота, которую он слушал." }
    ],
    effect: (s) => { s.flags.knowsFreq = true; }
  },

  "d1-night": {
    type: "listen", day: 1, place: "Квартира 4B · ночь", bg: "art/flat.jpg", look: "night", ambience: "night",
    title: "Первая ночь", clock: ["22:30", "23:34"], pace: 2,
    modes: ["window", "wall"], start: "window",
    tools: { wall: { label: "Микрофон", icon: "mic" } },
    darkWarehouse: true,
    intro: "Сначала Хелен на спуске звонит и уходит: микрофон, клавиша 2. Потом на складе зажигается свет и во двор заезжает фургон: откройте окно. Когда двор замолчит, закройте его. Хелен будет выезжать и на секунду посмотрит вверх.",
    events: [
      { t: "22:33", src: "cue", cue: "ring", for: "wall" },
      { t: "22:36", src: "wall", who: "helen", text: "This is Helen. I'm on my way out. Tell Northline the new tenant took 4B." },
      { t: "22:42", src: "wall", who: "helen", text: "The gate code is still four four one two. I'll watch him." },
      { t: "22:46", src: "wall", who: "helen", text: "Lev watched the loading dock. This one doesn't know the gate code." },
      { t: "22:52", src: "see", text: "Над воротами склада зажёгся свет. Ворота лязгнули.", fx: "gatelight" },
      { t: "22:58", src: "cue", cue: "engine", for: "window" },
      { t: "23:00", src: "see", text: "К воротам подъехал синий фургон.", fx: "headlights" },
      { t: "23:02", src: "dock", who: "owen", text: "Evening! Same as last week. Twelve boxes." },
      { t: "23:05", src: "dock", who: "worker", text: "What's in them this time?" },
      { t: "23:07", src: "dock", who: "owen", text: "The papers say glassware. Don't ask questions." },
      { t: "23:14", src: "dock", who: "owen", text: "Thursday is the big one. The last run." },
      { t: "23:16", src: "dock", who: "worker", text: "And after that?" },
      { t: "23:18", src: "dock", who: "owen", text: "After that, we're gone. New city." },
      { t: "23:22", src: "see", always: true, text: "Во дворе тихо. Закройте окно: Хелен сейчас выедет и посмотрит наверх." },
      { t: "23:26", src: "cue", cue: "car", for: "window", text: "Машина Хелен выезжает со двора. Фары скользят по стенам." },
      { t: "23:28", src: "risk", who: "helen", sus: 30, flag: "windowSeen",
        text: "Машина Хелен остановилась под вашим окном. Она видела, что окно открыто.",
        safe: "Машина Хелен постояла под окном и уехала. Окно было закрыто." },
      { t: "23:32", src: "see", text: "Фургон уехал. Ворота закрылись.", fx: "gatedark" }
    ]
  },

  "d1-board": {
    type: "board", day: 1, time: "23:25", place: "Квартира 4B · ночь", bg: "art/flat.jpg", look: "night", ambience: "room",
    title: "Доска: понедельник",
    intro: "Разложите услышанное по вопросам. Нажмите запись, потом вопрос. Можно дописать своё.",
    slots: [
      { id: "code", q: "Код калитки", any: ["4412", "four four one two"] },
      { id: "van", q: "Что приезжает к складу", any: ["van", "фургон"] },
      { id: "boxes", q: "Сколько ящиков", any: ["twelve", "12"] },
      { id: "papers", q: "Что в ящиках по бумагам", any: ["glassware", "glass"] },
      { id: "when", q: "Когда главный рейс", any: ["thursday"] },
      { id: "helen", q: "С кем общается Хелен", all: [["helen"], ["northline"]] }
    ]
  },

  "d1-report": {
    type: "talk", day: 1, time: "23:55", place: "Связь с Ремезовым", bg: "art/flat.jpg", look: "night", ambience: "room",
    npc: "remezov", board: "d1-board", report: true,
    goal: "Доложите по-английски всё, что узнали за день и за ночь.",
    persona: "Lieutenant Colonel Remezov, the player's handler. Dry, calm, few words. He speaks Russian, but demands that the player reports in English, because they are in an English-speaking city.",
    situation: "Night radio report after the first day. The player rented flat 4B opposite the Northline warehouse.",
    forbid: [],
    beats: [
      { say: "Иней, слушаю. Что у склада? По-английски.", maxTries: 5,
        hint: "Код калитки, машина, сколько ящиков, что по бумагам, когда главный рейс.",
        facts: [
          { id: "code", label: "код калитки 4412", ai: "gives the gate code 4412", any: ["4412", "four four one two"] },
          { id: "van", label: "синий фургон", ai: "mentions a (blue) van at the warehouse", any: ["van"] },
          { id: "boxes", label: "двенадцать ящиков", ai: "says there are twelve boxes", any: ["twelve", "12"] },
          { id: "papers", label: "по бумагам стекло", ai: "says the papers/documents say glassware", any: ["glassware", "glass"] },
          { id: "when", label: "главный рейс в четверг", ai: "says the big / last run is on Thursday", any: ["thursday"] }],
        bonus: [{ id: "helenNL", label: "Хелен связана с Northline", flag: "reportedHelen",
          ai: "says Helen talks to / works with Northline", all: [["helen"], ["northline", "talk*", "work*", "tell*", "report*", "call*"]],
          reply: "Хелен и Northline. Запомню." }],
        ask: { code: "Код калитки?", van: "Какая машина приезжает?", boxes: "Сколько ящиков?",
          papers: "Что у них по бумагам?", when: "Когда у них главный рейс?" } }
    ],
    verdict: [
      { min: 4, say: "Хорошо. Двенадцать ящиков «стекла» и последний рейс в четверг. Лев написал то же самое. Завтра — кофейня." },
      { min: 2, say: "Негусто. Но четверг я запомнил. Завтра — кофейня." },
      { min: 0, say: "Этого мало, Иней. Ещё одна ночь у окна.", retry: "d1-night" }
    ]
  },

  // ───────────── ДЕНЬ 2 ─────────────
  "d2-brief": {
    type: "brief", day: 2, time: "10:00", place: "Связь с Ремезовым", bg: "art/cafe.jpg", look: "dusk",
    kicker: "День 2 · Вторник", title: "Смена Льва",
    text: (s) => [
      "Лев подрабатывал в кофейне Риты на первом этаже. Это было его прикрытие. Рите снова нужен человек на вечер. Займите его место.",
      "Перед ночным рейсом водители Northline берут там кофе. Слушайте их, пока работаете.",
      "Рите про Льва ничего не известно. Про склад не говорите."
    ],
    goals: ["Устроиться к Рите", "Отработать смену и подслушать водителей", "Ночью найти рацию Northline"]
  },

  "d2-rita": {
    type: "talk", day: 2, time: "17:00", place: "Кофейня RITA'S", bg: "art/cafe.jpg", look: "day", ambience: "cafe",
    npc: "rita", sus: "rita",
    goal: "Устройтесь на вечернюю смену. Про Льва вы ничего не знаете.",
    persona: "Rita, owner of a small café on the ground floor. Warm, tired, direct. She liked Lev, who worked here and disappeared three weeks ago. Northline drivers are just customers to her.",
    situation: "Job interview for the evening shift in Rita's café.",
    forbid: [COVER_LEAK,
      { id: "warehouse", label: "говорить про склад", ai: "mentions the warehouse, Northline, the dock or the crates",
        any: ["warehouse", "northline", "dock", "crates"], sus: 20, reply: "The warehouse? Why?" }],
    beats: [
      { say: "Hi! You're here about the evening job? Have you worked in a café before?",
        hint: "Да или нет, и пару слов.",
        facts: [{ id: "exp", label: "ответить про опыт", ai: "answers whether they have worked in a café (yes or no, any detail)",
          any: ["yes", "no", "never", "worked", "barista", "cafe", "café", "coffee", "restaurant", "bar"] }],
        ask: { exp: "So, café experience: yes or no?" },
        ok: "Okay, I can teach you. It's not hard." },
      { say: "The job is the closing shift. We close at eleven. Is that okay for you?",
        hint: "Согласитесь работать до закрытия.",
        facts: [{ id: "close", label: "согласиться на закрывающую смену", ai: "agrees to work the closing shift until eleven",
          any: ["yes", "okay", "ok", "fine", "sure", "no problem", "of course", "closing", "eleven", "11", "1100"] }],
        ask: { close: "So, can you stay until eleven?" },
        ok: "Great. Most people hate closing." },
      { say: "And the trays are heavy. Is that a problem?",
        hint: "Тяжёлые подносы — не проблема.",
        facts: [{ id: "trays", label: "подносы — не проблема", ai: "says heavy trays are not a problem",
          any: ["no problem", "not a problem", "fine", "okay", "ok", "strong", "no", "its ok"] }],
        ask: { trays: "Heavy trays. Okay, or not okay?" },
        ok: "Good." },
      { say: "You know, the last guy, Lev, just stopped coming. No call, nothing. Weird, right?",
        hint: "Ответьте спокойно, как чужой человек. Можно спросить, кто приходит по вечерам.",
        anyReply: true,
        bonus: [{ id: "drivers", label: "спросить про вечерних гостей", flag: "askedDrivers",
          ai: "asks who comes to the café late or in the evening, or about regular customers or drivers",
          any: ["who comes", "customers", "in the evening", "late", "drivers", "regulars", "who drives"],
          reply: "In the evening? Mostly drivers from Northline, across the street. Owen always takes a large americano." }],
        forbid: [{ id: "lev", label: "показать, что знаете Льва", ai: "reveals they know Lev, asks where he is, or says they will look for him",
          any: ["i know him", "my friend", "where is he", "where did he", "find him", "looking for him"], sus: 30,
          reply: "Wait. Do you know him?" }] }
    ],
    end: { say: "Okay. You start tonight. The apron is on the hook.", failAt: 70,
      failSay: "Sorry. I don't think so.", failText: "Рита не взяла вас на работу. Место Льва уходит другому." }
  },

  "d2-shift": {
    type: "shift", day: 2, place: "Кофейня RITA'S · смена", bg: "art/cafe.jpg", look: "dusk", ambience: "cafe",
    title: "Вечерняя смена", clock: ["19:00", "23:00"], sus: "rita", failAt: 90,
    intro: "Гость говорит заказ, вы собираете его на стойке. За четвёртым столиком сидят водители Northline. Чтобы расслышать их, подойдите к столику, но очередь ждать не любит.",
    customers: [
      { name: "Woman in a raincoat", ru: "женщина в плаще", voice: { g: "f", pitch: 1.15, cloud: "shimmer" },
        line: "Hi! Can I get a small latte, please? For here.",
        order: { drink: "latte", size: "small", milk: "milk", sugar: 0, place: "for here" } },
      { name: "Man with a laptop", ru: "мужчина с ноутбуком", voice: { g: "m", pitch: 1.0, cloud: "alloy" },
        line: "A large americano to go, please. No milk, no sugar.",
        order: { drink: "americano", size: "large", milk: "none", sugar: 0, place: "to go" } },
      { name: "Student", ru: "студентка", voice: { g: "f", pitch: 1.25, cloud: "verse" },
        line: "Medium cappuccino with oat milk, please. And one sugar. To go.",
        order: { drink: "cappuccino", size: "medium", milk: "oat", sugar: 1, place: "to go" } },
      { name: "Owen", who: "owen", ru: "водитель Northline",
        line: "Large americano. Black. To go. Thanks.",
        order: { drink: "americano", size: "large", milk: "none", sugar: 0, place: "to go" } },
      { name: "Tired nurse", ru: "уставшая медсестра", voice: { g: "f", pitch: 0.95, cloud: "shimmer" },
        line: "Can I have a tea, please? Small, with two sugars. For here.",
        order: { drink: "tea", size: "small", milk: "none", sugar: 2, place: "for here" } },
      { name: "Young couple", ru: "молодая пара", voice: { g: "m", pitch: 1.1, cloud: "alloy" },
        line: "One hot chocolate, medium, with oat milk. To go, please.",
        order: { drink: "hot chocolate", size: "medium", milk: "oat", sugar: 0, place: "to go" } }
    ],
    table: [
      { after: 2, see: "За четвёртый столик сели двое в куртках Northline. Оуэн и молодой парень.",
        lines: [{ who: "danny", text: "So, Thursday is the last run?" },
                { who: "owen", text: "Yeah. Crates at one thirty. The van leaves at two." }] },
      { after: 4, see: "Водители наклонились друг к другу и заговорили тише.",
        lines: [{ who: "danny", text: "And the guy in the back room?" },
                { who: "owen", text: "He goes with the boxes. Boss's orders." }] },
      { after: 6, see: "Оуэн смотрит в телефон и смеётся.",
        lines: [{ who: "owen", text: "Helen called the boss again. New guy in 4B." },
                { who: "danny", text: "And?" },
                { who: "owen", text: "She says he's quiet. For now." }] }
    ],
    call: {
      after: 5, contact: "Дядя Паша",
      npc: "remezov", situation: "A short phone call during the café shift. Rita is nearby. The player must report quietly in English.",
      persona: "Lieutenant Colonel Remezov, the player's handler. Dry, few words, speaks Russian.",
      forbid: [],
      beats: [
        { who: "remezov", say: "Это я. Коротко: что говорят водители?", anyReply: true,
          hint: "Что услышали за столиком. По-английски, вполголоса.",
          bonus: [
            { id: "thu", label: "четверг, 1:30 / 2:00", flag: "callTime", ai: "mentions Thursday or the times 1:30 / 2:00",
              any: ["thursday", "one thirty", "130", "two", "2am", "2 am"] },
            { id: "man", label: "человек в задней комнате", flag: "callMan", ai: "mentions a man / guy / prisoner in the back room",
              any: ["back room", "man", "guy", "person", "prisoner"] }] },
        { who: "rita", say: "Hey! Who are you talking to? We have customers!",
          hint: "Рита рядом и слышит. Нужна безобидная отговорка, ни слова про дело.",
          facts: [{ id: "excuse", label: "безобидная отговорка", ai: "gives a harmless excuse (family, a friend, sorry, coming) without mission details",
            any: ["sorry", "coming", "uncle", "mom", "mum", "mother", "friend", "family", "one minute", "one second", "just a second", "ok", "okay"] }],
          forbid: [{ id: "mission", label: "говорить о деле при Рите", sus: 25, susKey: "rita",
            ai: "says anything about Northline, the back room, the van, the crates, Lev, Helen, the boss or police",
            any: ["northline", "back room", "van", "crates", "boxes", "lev", "helen", "boss", "police", "warehouse", "dock"],
            reply: "What? What crates?" }],
          ask: { excuse: "Who is it? Come on, we're busy." },
          ok: "Okay, okay. Be quick." },
        { who: "remezov", say: "Ушла? Договаривайте: когда и что они везут?", maxTries: 2,
          hint: "Когда (день и время) и кого везут вместе с ящиками.",
          facts: [
            { id: "time", label: "четверг, 1:30 или 2:00", ai: "says when: Thursday, 1:30 or 2:00",
              any: ["thursday", "one thirty", "130", "two", "2am", "2 am"] },
            { id: "man", label: "человек в задней комнате", ai: "says a man / guy / person is held in the back room and goes with the boxes",
              any: ["back room", "man", "guy", "person", "prisoner", "him", "lev"] }],
          ask: { time: "Когда?", man: "Что за человек? Где?" },
          ok: "Понял. Если это Лев, он жив. Работайте." }
      ]
    },
    end: { good: "Not bad for a first night. Go home and get some sleep.", bad: "Long night, huh? Tomorrow will be better." }
  },

  "d2-night": {
    type: "listen", day: 2, place: "Квартира 4B · ночь", bg: "art/flat.jpg", look: "night", ambience: "night",
    title: "Рация Northline", clock: ["23:00", "00:18"], pace: 2.1,
    modes: ["window", "wall", "scanner"], start: "scanner",
    radio: { freq: 461.25, min: 450, max: 470 },
    tools: { wall: { label: "Микрофон", icon: "mic" } },
    intro: (s) => "Сначала сканер, между 450 и 470: время рейса. Код по рации не скажут. Потом Хелен у ворот: откройте окно и закройте, когда двор замолчит. Потом Марк по микрофону, клавиша 2: код и кто в задней комнате." +
      (s.flags.knowsFreq ? " На скотче у Льва было написано 461.25." : ""),
    events: [
      { t: "23:03", src: "cue", cue: "squelch", for: "scanner" },
      { t: "23:04", src: "radio", who: "base", text: "Base to Northline three. Are you at the gate?" },
      { t: "23:08", src: "radio", who: "owen", text: "Copy, base. At the gate. Twelve boxes, same as Monday." },
      { t: "23:08", src: "see", text: "Синий фургон у ворот. Двое грузят ящики.", fx: "headlights" },
      { t: "23:14", src: "radio", who: "base", text: "Thursday plan. Crates at one thirty. The van leaves at two." },
      { t: "23:20", src: "radio", who: "owen", text: "What about the gate code? Still four four one two?" },
      { t: "23:24", src: "radio", who: "base", text: "Don't say the new code on this channel." },
      { t: "23:28", src: "see", always: true, text: "Рация замолчала. Дальше двор: откройте окно." },
      { t: "23:34", src: "cue", cue: "car", for: "window", text: "Во двор въезжает машина." },
      { t: "23:36", src: "see", text: "Машина Хелен заезжает в ворота склада.", flag: "sawHelenGate", fx: "headlights", span: 5 },
      { t: "23:40", src: "dock", who: "helen", text: "Is he quiet? The new one in 4B?" },
      { t: "23:44", src: "dock", who: "worker", text: "Lights off at ten. Like you said." },
      { t: "23:48", src: "see", always: true, text: "Во дворе тихо. Закройте окно, пока Хелен не подняла голову." },
      { t: "23:54", src: "risk", who: "helen", sus: 30, flag: "windowSeen",
        text: "Хелен подняла голову к вашим окнам. Окно открыто, и она это видела.",
        safe: "Хелен посмотрела на ваши окна. Окно закрыто, свет выключен." },
      { t: "00:00", src: "see", always: true, text: "Теперь стояк. Марк в ванной, микрофон." },
      { t: "00:02", src: "cue", cue: "ring", for: "wall" },
      { t: "00:04", src: "wall", who: "mark", text: "Sam, don't come over. Helen was here. She told me to forget a code." },
      { t: "00:10", src: "wall", who: "mark", text: "Thursday. The gate code is seven seven three one. I'm not writing it down." },
      { t: "00:16", src: "wall", who: "mark", text: "And don't ask who is in the back room. It's Lev. He goes with the boxes." }
    ]
  },

  "d2-board": {
    type: "board", day: 2, time: "00:20", place: "Квартира 4B · ночь", bg: "art/flat.jpg", look: "night", ambience: "room",
    title: "Доска: вторник",
    intro: "Записи за оба дня здесь. Ищите противоречия: красная связь значит, что две правды не сходятся.",
    slots: [
      { id: "load", q: "Во сколько грузят в четверг", any: ["one thirty", "130", "half past one"] },
      { id: "leave", q: "Во сколько уезжает фургон", any: ["leaves at two", "at two", "2am", "2 am"] },
      { id: "code2", q: "Новый код ворот", any: ["7731", "seven seven three one"] },
      { id: "room", q: "Где держат человека", any: ["back room", "задн*"] },
      { id: "helen2", q: "Что делает Хелен", any: ["helen", "хелен"] },
      { id: "papers", q: "Что в ящиках по бумагам", any: ["glassware", "glass"] }
    ],
    pairs: [{ a: "papers", b: "room", text: "По бумагам в ящиках стекло. Но вместе с ящиками увозят человека." }]
  },

  "d2-report": {
    type: "talk", day: 2, time: "00:10", place: "Связь с Ремезовым", bg: "art/flat.jpg", look: "night", ambience: "room",
    npc: "remezov", board: "d2-board", report: true,
    goal: "Доложите по-английски: время, код, где держат человека, что с Хелен.",
    persona: "Lieutenant Colonel Remezov, the player's handler. Dry, calm, few words. Speaks Russian, demands reports in English.",
    situation: "Night radio report after the second day. The player listened to Northline radio and drivers in the café.",
    forbid: [],
    beats: [
      { say: "Слушаю. Что по четвергу?", maxTries: 5,
        hint: "Время погрузки, время отъезда, новый код, где держат человека, что делает Хелен.",
        facts: [
          { id: "load", label: "грузят в 1:30", ai: "says the crates are loaded at 1:30", any: ["one thirty", "130", "half past one"] },
          { id: "leave", label: "фургон уезжает в 2:00", ai: "says the van leaves at two", any: ["two", "2am", "2 am", "200"] },
          { id: "code2", label: "новый код 7731", ai: "gives the new gate code 7731", any: ["7731", "seven seven three one"] },
          { id: "room", label: "человек в задней комнате", ai: "says a man is held in the back room", any: ["back room"] },
          { id: "helen2", label: "Хелен работает на Northline", ai: "says Helen works with / reports to Northline",
            all: [["helen"], ["northline", "work*", "talk*", "tell*", "report*", "call*", "boss", "gate", "warehouse"]] }],
        ask: { load: "Во сколько грузят?", leave: "Во сколько уходит фургон?", code2: "Код ворот в четверг?",
          room: "Где держат человека?", helen2: "А Хелен?" } }
    ],
    verdict: [
      { min: 4, say: "Это Лев. Он жив, и он в задней комнате. Группа войдёт в четверг, в час пятнадцать, до погрузки." },
      { min: 2, say: "Дыры есть, но группу я готовлю. Четверг, час пятнадцать." },
      { min: 0, say: "С этим я группу не пошлю. Ещё одна ночь.", retry: "d2-night" }
    ]
  },

  // ───────────── ДЕНЬ 3 ─────────────
  "d3-brief": {
    type: "brief", day: 3, time: "11:00", place: "Связь с Ремезовым", bg: "art/cabinet.jpg", look: "dusk",
    kicker: "День 3 · Четверг", title: "Последний рейс",
    text: (s) => [
      "Среда прошла тихо. Сегодня четверг.",
      "Группа войдёт в 01:15, до погрузки. Ночью вы их глаза. Нужны код ворот, где комната, сколько людей у ворот и всё, что изменится. Докладывайте сразу, по рации, не дожидаясь утра.",
      "Днём постучит сосед Марк. Во вторник по микрофону вы слышали, как он звонит Сэму: Хелен заставила его забыть код, а в задней комнате Лев. Ему можно открыть.",
      "Потом Хелен придёт «проверить окна». " + (s.flags.reportedHelen || s.flags.sawHelenGate ? "Она работает на Northline, вы это сами слышали." : "Она связана с Northline.") + " Держите легенду. Если она вас раскусит, Льва увезут раньше."
    ],
    goals: ["Поговорить с соседом", "Выдержать визит Хелен", "Ночью вести группу по рации до 01:15"]
  },

  "d3-mark": {
    type: "talk", day: 3, time: "15:00", place: "Квартира 4B · дверь", bg: "art/flat.jpg", look: "day", ambience: "room",
    npc: "mark",
    goal: "В дверь стучит Марк. Во вторник он сам сказал в трубку, что в задней комнате Лев и что Хелен велела это забыть. Довериться ему или нет — решать вам.",
    persona: "Mark, the neighbour, about thirty, works night shifts at a hospital. Kind and a bit nervous. Lev was his friend. Helen asked him about the new tenant and about Lev; he refused to talk. He suspects the new tenant is here because of Lev.",
    situation: "Mark knocks on the player's door and talks through the half-open door.",
    forbid: [COVER_LEAK],
    beats: [
      { say: "Hey, it's Mark, from next door. Sorry. Can I ask you something?",
        hint: "Разрешите ему спросить.",
        facts: [{ id: "yes", label: "разрешить", ai: "agrees, invites him to ask, or asks what it is",
          any: ["yes", "sure", "okay", "ok", "of course", "go ahead", "what", "yeah"] }],
        ask: { yes: "Just one question. Okay?" } },
      { say: "Are you here because of Lev?",
        hint: "Марку можно сказать правду. Или промолчать: это тоже ответ.",
        anyReply: true,
        bonus: [{ id: "trust", label: "довериться Марку", flag: "trustMark",
          ai: "admits or hints that they are here because of Lev or looking for him",
          any: ["yes", "looking for him", "find him", "because of lev", "his friend", "i am", "maybe"],
          reply: "I knew it." }] },
      { say: (s) => s.flags.trustMark
          ? "Lev left his binoculars with me. He said: watch the second floor window. Take them."
          : "Okay. Forget it. But take these. Binoculars. Lev left them with me.",
        hint: "Поблагодарите.",
        facts: [{ id: "thanks", label: "поблагодарить", ai: "thanks him or accepts", any: ["thank*", "great", "okay", "ok", "cheers"] }],
        ask: { thanks: "Take them. Please." },
        ok: "Be careful tonight." }
    ],
    end: { say: "Okay. I'll be home tonight. Knock if you need me." },
    effect: (s) => { s.gadgets.scope = true; }
  },

  "d3-helen": {
    type: "talk", day: 3, time: "18:00", place: "Квартира 4B", bg: "art/flat.jpg", look: "dusk", ambience: "room",
    npc: "helen", sus: "helen",
    goal: "Хелен проверяет вашу легенду. Объяснитесь спокойно и ничего не спрашивайте про груз.",
    persona: "Helen, the landlady. She secretly works for Northline and tonight is their last run. She is checking whether the new tenant is dangerous. Polite, but cold underneath.",
    situation: "Helen visits flat 4B 'to check the windows' on the evening of the last Northline run.",
    forbid: [COVER_LEAK],
    beats: [
      { say: "Hi! Just checking the windows. Rita says you work at the café now. I thought you work from home?",
        hint: "Легенда должна сойтись: днём работаете из дома, вечером подрабатываете.",
        facts: [{ id: "both", label: "объяснить обе работы", ai: "explains consistently: works from home in the day and at the café in the evening (extra money, part time)",
          any: ["evening", "extra", "part time", "both", "in the day", "money", "night", "two jobs", "after work"] }],
        ask: { both: "So which is it? Home or café?" },
        ok: "Ah. Two jobs. Busy, busy." },
      { say: (s) => s.flags.windowSeen ? "And I saw your window open. After ten." : "And the windows stay closed after ten, right?",
        facts: (s) => s.flags.windowSeen
          ? [{ id: "sorry", label: "извиниться и пообещать", ai: "apologises or promises to keep the windows closed",
              any: ["sorry", "wont", "will not", "closed", "promise", "not again", "fresh air"] }]
          : [{ id: "closed", label: "подтвердить правило", ai: "confirms the windows stay closed after ten",
              any: ["yes", "closed", "of course", "sure", "ten", "10", "1000", "right"] }],
        hint: (s) => s.flags.windowSeen ? "Хелен видела открытое окно. Извинитесь." : "Подтвердите правило.",
        ask: { sorry: "Well?", closed: "Right?" },
        ok: "Good." },
      { say: "Tonight, please stay home and sleep. There is a delivery across the street. It's noisy.",
        hint: "Можно невинно спросить, во сколько. Не спрашивайте, что везут.",
        anyReply: true,
        bonus: [{ id: "time", label: "узнать время доставки", flag: "helenTime",
          ai: "casually asks what time or when the delivery is", any: ["what time", "when", "how late", "till when", "until when"],
          reply: "After one. Just sleep, okay?" }],
        forbid: [{ id: "curious", label: "расспрашивать о грузе", sus: 25,
          ai: "asks what is delivered, who delivers, or about Northline, the warehouse, crates or boxes",
          any: ["what delivery", "what is in", "whats in", "northline", "boxes", "crates", "warehouse", "who delivers"],
          reply: "Why so curious?" }] }
    ],
    end: { say: (s) => s.sus.helen >= 70 ? "Okay. Goodnight." : "Okay. Sleep well." },
    effect: (s) => { if ((s.sus.helen || 0) >= 70) s.flags.helenWarned = true; },
    after: (s) => s.flags.helenWarned ? "Хелен не задерживается: спускается и уже на ходу кому-то звонит." : null
  },

  "d3-night": {
    type: "listen", day: 3, place: "Квартира 4B · ночь", bg: "art/flat.jpg", look: "night", ambience: "night",
    title: "Последний рейс", clock: ["00:20", "01:15"], pace: 2.3,
    modes: ["window", "scanner", "scope"], start: "scanner",
    radio: { freq: 458.6, min: 450, max: 470 },
    intro: "В четверг Хелен на лестнице нет: она у склада. Код ворот кричат во дворе, в ту же минуту, когда рация говорит комнату и время. Окно лучше открыть, иначе двор глухой. Пробел — доклад Ремезову, до 01:15. Бинокль — клавиша 4.",
    live: {
      deadline: "01:15",
      persona: "Lieutenant Colonel Remezov, leading an operation by radio. Very short Russian replies.",
      situation: "Live operation. The player watches the Northline warehouse and reports by radio. The team goes in at 01:15.",
      facts: [
        { id: "code3", label: "код ворот", ai: "gives the gate code 7731", any: ["7731", "seven seven three one"], ack: "Код принял." },
        { id: "guards", label: "сколько охраны у ворот", ai: "says there are two guards / two men at the gate",
          any: ["two guards", "two guys", "two men", "2 guards", "2 guys", "2 men", "two people", "two security", "two on the gate", "two at the gate"], ack: "Двое у ворот. Понял." },
        { id: "room", label: "где держат Льва", ai: "says the man is in the back room on the second floor", any: ["second floor", "2nd floor", "back room", "upstairs"], ack: "Второй этаж, задняя комната. Понял." },
        { id: "time", label: "во сколько его выводят", ai: "says when they move him: at 1:30, or at one o'clock if the plan changed",
          any: (s) => s.flags.helenWarned ? ["one", "at one", "1 00", "100", "1am", "1 am", "now"] : ["one thirty", "130", "half past one"],
          ack: "Время понял." }
      ],
      wrong: [{ any: ["4412", "four four one two"], say: "Это старый код, Иней." }]
    },
    scopes: {
      windows: { label: "Окна склада", img: "art/flat.jpg", look: "night", zoom: 4.2, focus: [0.76, 0.45],
        spots: [{ id: "help", x: 75.6, y: 44.6, size: 7, text: "4B HELP", ru: "надпись пальцем на запотевшем стекле второго этажа",
          note: "Окно второго этажа склада. На стекле написано: 4B HELP.", from: "00:24", flag: "sawHelp", style: "glass" }] },
      dock: { label: "Двор и док", img: "art/dock.jpg", look: "scope", zoom: 1.7, focus: [0.45, 0.5],
        spots: [
          { id: "crate", x: 38.2, y: 63, size: 9, text: "GLASSWARE · FRAGILE", ru: "трафарет на ящиках", note: "На ящиках трафарет: GLASSWARE · FRAGILE.", style: "stencil" },
          { id: "sign", x: 29, y: 12.5, size: 11, text: "DOCK 3", ru: "табличка над воротами", note: "Над воротами табличка: DOCK 3.", style: "sign" },
          { id: "guards", x: 74, y: 52, size: 8, text: "SECURITY ×2", ru: "двое охранников курят у ворот", note: "У ворот двое охранников: SECURITY ×2.", from: "00:35", style: "guards" }] }
    },
    events: [
      { t: "00:21", src: "cue", cue: "squelch", for: "scanner" },
      { t: "00:22", src: "radio", who: "base", text: "All units. Tonight is the last run. Back room, second floor. Bring him down at one thirty." },
      { t: "00:22", src: "dock", who: "owen", text: "Gate code is seven seven three one. Two men on the gate." },
      { t: "00:26", src: "cue", cue: "engine", for: "window" },
      { t: "00:27", src: "see", text: "Синий фургон заезжает во двор.", fx: "headlights" },
      { t: "00:29", src: "dock", who: "owen", text: "Two guys on the gate tonight. Me and Danny at the van." },
      { t: "00:35", src: "see", text: "У ворот двое охранников. Курят.", span: 8 },
      { t: "00:38", src: "dock", who: "helen", text: "Change of plan. Move him at one. Now.", when: (s) => s.flags.helenWarned },
      { t: "00:42", src: "see", always: true, text: "В дверь тихо стучит Марк. Он видит фургон и просит быть осторожнее." },
      { t: "00:44", src: "see", text: "Ворота открыты. Фургон стоит задом к доку.", fx: "gatelight" },
      { t: "00:48", src: "radio", who: "owen", text: "Base, the guy in 4B. His light is on." },
      { t: "00:50", src: "radio", who: "base", text: "Then he is not sleeping. Hurry up." },
      { t: "00:55", src: "dock", who: "worker", text: "Twelve boxes. All glassware, ha." },
      { t: "01:00", src: "radio", who: "base", text: "Fifteen minutes." }
    ]
  },

  "ending": { type: "ending", day: 3, place: "01:15", bg: "art/flat.jpg", look: "night", ambience: "room" }
};

const FLOW = [
  "d1-brief", "d1-door", "d1-helen", "d1-box", "d1-night", "d1-board", "d1-report",
  "d2-brief", "d2-rita", "d2-shift", "d2-night", "d2-board", "d2-report",
  "d3-brief", "d3-mark", "d3-helen", "d3-night", "ending"
];

const INTRO = [
  { title: "Звания здесь нет", img: "art/cabinet.jpg",
    text: "В части вы младший лейтенант. Здесь этого слова нет. Обычная куртка, съёмная квартира, подработка. И чужой город, где все говорят по-английски." },
  { title: "Пропал Лев", who: "remezov",
    text: "Лев — наш человек в этом городе. Позывной Март. Три недели как не выходит на связь. До этого жил здесь как все: снимал квартиру и подрабатывал внизу, в кофейне." },
  { title: "Последнее, что он прислал", who: "remezov",
    text: "Квартира 4B на Харбор-стрит, окна на склад компании Northline. Сообщение: «Они грузят не то, что пишут. В четверг скажу точнее». Четверг прошёл. Где он сам, неизвестно." },
  { title: "Ваша задача", who: "remezov",
    text: "Встать на его место. Снять ту же квартиру, выйти на ту же работу, слушать тот же двор. Найти, что он видел. И где он сам." },
  { title: "Как устроен день", who: "remezov",
    steps: [
      "Днём легенда. Вы разговариваете с людьми по-английски, голосом или текстом. Скажете лишнее, и вам перестанут верить.",
      "Ночью окно на склад и микрофон Льва на стояке. Хелен по трубе слышно один раз, на выходе из дома. Дальше стояк ведёт в ванную Марка. Всё сразу не удержать.",
      "Потом доклад мне по рации. По-английски: в этом городе по-русски не говорят даже по телефону. Чего не сказали, того для меня не было."
    ] }
];
