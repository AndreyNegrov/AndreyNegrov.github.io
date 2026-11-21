// Сезон «Последняя миля». Ночной Лондон, приложение доставки Relay.
// В сумках с серой пломбой едет не еда. Игрок — четвёртый курьер после троих исчезнувших.
// Английская речь — короткая, бытовая, уровень A2. Русский — только у Совы и в подсказках.

Object.assign(PEOPLE, {
  sova: { name: "Сова", role: "куратор", lang: "ru", gender: "f", initial: "С",
    voice: { g: "f", pitch: 1, rate: 1.05, prefer: ["Svetlana", "Dariya", "Irina", "ru-RU"], cloud: "sage", style: "Dry, tired female handler. Speaks Russian." } },
  kit: { name: "Kit", role: "ассистент Relay", gender: "f", initial: "K", orb: true,
    voice: { g: "f", pitch: 1.08, rate: 1.02, prefer: ["Libby", "Maisie", "Sonia", "en-GB", "Aria"], cloud: "shimmer", style: "A calm, polite, slightly too perfect synthetic assistant voice." } },
  rita: { name: "Rita", role: "хозяйка Rita's Kitchen", gender: "f", img: "art/rita.jpg",
    voice: { g: "f", pitch: 1, rate: 1.04, prefer: ["Jenny", "Aria", "Michelle", "Samantha", "en-US"], cloud: "coral", style: "Warm, quick, tired café owner. Says 'love'." } },
  cole: { name: "Cole", role: "грузчик хаба Relay", gender: "m", img: "art/owen.jpg",
    voice: { g: "m", pitch: 0.9, rate: 0.98, prefer: ["Ryan", "Connor", "Thomas", "George", "en-GB"], cloud: "onyx", style: "Short, flat, threatening London loader." } },
  dana: { name: "Dana", role: "клиентка, квартира 4B", gender: "f", img: "art/dana.jpg",
    voice: { g: "f", pitch: 0.93, rate: 0.98, prefer: ["Sonia", "Hazel", "UK English Female", "en-GB"], cloud: "sage", style: "Quiet, exact, exhausted former operations director." } },
  vale: { name: "Marcus Vale", role: "17 Canon Row", gender: "m", img: "art/remezov.jpg",
    voice: { g: "m", pitch: 0.84, rate: 0.94, prefer: ["Thomas", "George", "Ryan", "UK English Male", "en-GB"], cloud: "ash", style: "Soft-spoken, courteous, completely certain older man." } },
  speaker: { name: "Голос в динамике", role: "кто-то сверху", gender: "m", initial: "?",
    voice: { g: "m", pitch: 0.84, rate: 0.94, prefer: ["Thomas", "George", "Ryan", "UK English Male", "en-GB"], cloud: "ash" } },
  sam: { name: "Sam", role: "клиент, Mill Road", gender: "m", initial: "S",
    voice: { g: "m", pitch: 1.05, rate: 1.06, prefer: ["Christopher", "Eric", "Guy", "en-US"], cloud: "echo", style: "Cheerful young man." } },
  okoye: { name: "Mrs Okoye", role: "клиентка, Canon Court", gender: "f", initial: "O",
    voice: { g: "f", pitch: 0.9, rate: 0.96, prefer: ["Hazel", "Susan", "Zira", "en-GB"], cloud: "coral" } },
  concierge: { name: "Concierge", role: "ночной консьерж, Canon Court", gender: "m", initial: "C",
    voice: { g: "m", pitch: 1, rate: 1, prefer: ["William", "en-AU", "Prabhat", "en-IN", "Mark"], cloud: "echo", style: "Bored, correct night concierge." } },
  you: { name: "Вы", role: "Alex Frost", initial: "A", voice: { g: "m" } }
});

Object.assign(GLOSSARY, {
  relay: "Relay (приложение доставки); эстафета", courier: "курьер", "order number": "номер заказа", order: "заказ",
  delivery: "доставка", "delivery for": "доставка для…", buzzer: "домофон, звонок", flat: "квартира (брит.)", floor: "этаж",
  "second floor": "третий этаж по-нашему (брит.: первый — ground)", "come up": "поднимайтесь", "flat white": "флэт уайт (кофе)",
  brownie: "брауни", "here you go": "держите", "first night": "первая ночь", careful: "осторожно", tipper: "тот, кто даёт чаевые",
  tip: "чаевые; совет", "good night": "доброй ночи", cheers: "спасибо; пока (брит.)", mate: "приятель", legend: "красавчик (разг.)",
  soup: "суп", bread: "хлеб", missing: "не хватает", "is missing": "не хватает", "good eyes": "глаз-алмаз", "off you go": "ну, беги",
  concierge: "консьерж", asleep: "спит", "don't ring": "не звонить", "leave it": "оставьте", "who is it for": "для кого это?",
  "which flat": "какая квартира?", log: "журнал", "how do you spell that": "как это пишется?", weather: "погода",
  "peppermint tea": "мятный чай", "ring twice": "позвоните два раза", wait: "ждать", "you're not": "вы не…", nobody: "никто",
  advice: "совет", "for free": "бесплатно", "grey seal": "серая пломба", seal: "пломба", count: "считать", sealed: "опломбирован",
  independent: "независимый", "i deliver what i am given": "я доставляю то, что мне дали", "ride safe": "аккуратнее на дороге",
  safety: "безопасность", bell: "звонок", "never opened": "никогда не вскрываются", reports: "сообщает", bicycle: "велосипед",
  "e-bike": "электровелосипед", moped: "мопед", warehouse: "склад",
  priority: "приоритетный", pickup: "забор заказа", hub: "хаб, перевалочный склад", "side door": "боковая дверь", loader: "грузчик",
  "is it still raining": "дождь ещё идёт?", "drop-off": "место сдачи", locker: "ячейка, постамат", code: "код", repeat: "повторить",
  "do you understand": "вы поняли?", understood: "понял(а)", shake: "трясти", clear: "ясно", charged: "заряжен",
  "keep dry": "беречь от влаги", "do not x-ray": "не просвечивать", units: "единицы, штуки", tamper: "вскрытие, вмешательство",
  sensor: "датчик", prepaid: "предоплаченный", "bank cards": "банковские карты", "rubber band": "резинка",
  "last run": "последний рейс", bags: "сумки", "close the hub": "закрыть хаб", updates: "обновляется", forgets: "забывает",
  list: "список", "canon row": "Кэнон-роу (улица)", "what are you doing back here": "ты что тут делаешь?", bikes: "велосипеды",
  "on the house": "за счёт заведения", terrible: "ужасно", rent: "аренда", deal: "уговор, сделка", polish: "поляк, польский",
  "used to work": "раньше работала", built: "построила, создала", scared: "напуган", "new faces": "новые лица", coat: "пальто",
  "come in": "заходите", anywhere: "куда угодно", "who sent you": "кто вас прислал?", somebody: "кто-то", "sit down": "садитесь",
  accounts: "счета", exist: "существовать", prison: "тюрьма", route: "маршрут", fastest: "самый быстрый", quietest: "самый тихий",
  investor: "инвестор", "on paper": "на бумаге, формально", owns: "владеет", proof: "доказательство", "operations card": "служебная карта",
  dispatch: "диспетчерская", tablet: "планшет", "is there a problem": "есть проблема?", change: "сдача; менять", address: "адрес",
  rating: "рейтинг", "out of the rain": "с дождя, в тепло", rare: "редкий", manager: "управляющий", cash: "наличные",
  "nobody gets hurt": "никто не пострадает", afford: "позволить себе", "at the end of the street": "в конце улицы",
  "turn left": "поверните налево", "turn right": "поверните направо", "go straight on": "езжайте прямо", "traffic lights": "светофор",
  roundabout: "круговое движение", exit: "съезд", destination: "пункт назначения", "second left": "второй поворот налево",
  "first left": "первый поворот налево", metres: "метров", onto: "на (улицу)", "on the left": "слева", "on the right": "справа",
  rerouting: "перестраиваю маршрут", receipt: "чек", "handle with care": "обращаться осторожно"
});

// ───────── легенда ─────────
const LEGEND = {
  city: {
    riga: { en: "Riga", ru: "Рига, Латвия", gen: "Риги", country: "Latvia", lang: "Latvian", langRu: "латышский", any: ["riga", "latvia*"], say: "I'm from Riga, in Latvia." },
    tallinn: { en: "Tallinn", ru: "Таллин, Эстония", gen: "Таллина", country: "Estonia", lang: "Estonian", langRu: "эстонский", any: ["tallinn", "tallin", "talin", "estonia*"], say: "I'm from Tallinn, in Estonia." },
    vilnius: { en: "Vilnius", ru: "Вильнюс, Литва", gen: "Вильнюса", country: "Lithuania", lang: "Lithuanian", langRu: "литовский", any: ["vilnius", "vilnus", "lithuania*"], say: "I'm from Vilnius, in Lithuania." }
  },
  job: {
    courier: { ru: "курьер", en: "a courier", short: "courier", say: "I was a courier.", any: ["courier", "deliver*", "delivery"] },
    warehouse: { ru: "работник склада", en: "a warehouse worker", short: "warehouse", say: "I worked in a warehouse.", any: ["warehouse", "storage", "stock*"] },
    barista: { ru: "бариста", en: "a barista", short: "barista", say: "I worked as a barista.", any: ["barista", "cafe", "café", "coffee shop", "coffee"] }
  },
  ride: {
    bike: { ru: "велосипед", short: "bicycle", say: "I ride a bicycle.", any: ["bicycle", "bike", "cycle", "push bike"] },
    ebike: { ru: "электровелосипед", short: "e-bike", say: "I ride an e-bike.", any: ["e bike", "ebike", "electric bike", "electric"] },
    moped: { ru: "мопед", short: "moped", say: "I ride a moped.", any: ["moped", "scooter", "motorbike", "motorcycle"] }
  }
};
const LEGEND_GROUPS = [["city", "Откуда ты"], ["job", "Кем работал(а) раньше"], ["ride", "На чём возишь"]];

// ───────── разговорник: фразы-инструменты ─────────
const PHRASES = [
  { id: "repeat", en: "Sorry, could you repeat that?", ru: "Простите, можете повторить?", use: "Не расслышал(а) — переспроси. Повторят медленнее.", any: ["repeat", "say that again", "say it again", "pardon", "come again", "one more time"] },
  { id: "new", en: "Sorry, I'm new.", ru: "Простите, я новенький(ая).", use: "Тупик? Ты первую ночь на линии. Новеньким прощают.", any: ["im new", "i am new", "new here", "first night", "first day", "first week", "just started"] },
  { id: "delivery", en: "Hi, Relay delivery for …", ru: "Здравствуйте, доставка Relay для …", use: "Первая фраза у любой двери и домофона.", any: ["delivery for", "order for", "relay delivery", "i have a delivery", "i have an order", "ive got a delivery"] },
  { id: "which", en: "Which flat, please?", ru: "Какая квартира, подскажите?", any: ["which flat", "what flat", "which floor", "what floor", "which door", "flat number"] },
  { id: "missing", en: "One item is missing.", ru: "Одной позиции не хватает.", use: "Проверил(а) пакет — скажи сразу, пока не уехал(а).", any: ["is missing", "are missing", "missing", "there is no", "theres no", "only one", "should be two"] },
  { id: "sorry", en: "I'm sorry about that.", ru: "Прошу прощения за это.", any: ["sorry about", "im sorry", "i am sorry", "apolog*", "my mistake"] },
  { id: "outside", en: "I'm outside.", ru: "Я у двери.", any: ["im outside", "i am outside", "im downstairs", "im at the door", "im here", "i am here"] },
  { id: "enjoy", en: "Have a good night.", ru: "Доброй ночи.", use: "Вежливое прощание — и чаевые лучше.", any: ["have a good", "have a nice", "good night", "goodnight", "enjoy", "take care", "you too"] },
  { id: "noproblem", en: "No problem.", ru: "Без проблем.", any: ["no problem", "no worries", "not a problem", "its okay", "its ok", "thats okay", "thats fine"] },
  { id: "understood", en: "Understood.", ru: "Понял(а).", use: "Короткий ответ тем, кто не любит вопросов.", any: ["understood", "got it", "i understand", "clear", "copy that"] },
  { id: "mean", en: "What does … mean?", ru: "Что значит …?", use: "Незнакомое слово — спроси. Объяснят проще.", test: (t) => /\bmean(ing)?\b/.test(norm(t)) && /\bwhat/.test(norm(t)) },
  { id: "spell", en: "How do you spell that?", ru: "Как это пишется?", any: ["spell"] },
  { id: "right", en: "Yes, that's right.", ru: "Да, всё верно.", any: ["thats right", "that is right", "thats correct", "that is correct"] },
  { id: "moment", en: "Just a moment, please.", ru: "Минутку, пожалуйста.", any: ["just a moment", "one moment", "one second", "just a second", "hold on"] },
  { id: "just", en: "I'm just waiting for my order.", ru: "Я просто жду заказ.", use: "Застали не там — назови простую причину.", any: ["im just", "i am just", "i was just", "just waiting", "just charging", "just checking", "just looking"] },
  { id: "really", en: "Really?", ru: "Правда?", use: "Короткая реакция — и человек говорит дальше.", any: ["really", "oh no", "thats terrible", "im sorry to hear", "wow", "seriously"] },
  { id: "whathappened", en: "What happened to …?", ru: "Что случилось с …?", any: ["what happened"] },
  { id: "whatsin", en: "What's in the bags?", ru: "Что в сумках?", any: ["whats in", "what is in", "whats inside", "what is inside"] }
];

// Простые объяснения слов — на случай «What does … mean?»
const EXPLAIN = {
  buzzer: "The buzzer is the button at the door. You press it and they hear you upstairs.",
  flat: "A flat is an apartment. A home in a big building.",
  concierge: "The concierge is the person at the desk downstairs.",
  seal: "A seal is a small lock made of plastic. If you open the bag, the seal breaks.",
  sealed: "Sealed means closed with a seal. You can't open it.",
  hub: "The hub is our warehouse. All the bags start there.",
  locker: "A locker is a small metal box with a door and a code.",
  priority: "Priority means more important. It goes first.",
  independent: "Independent means you work for yourself. Not for a boss.",
  loader: "A loader is a worker who puts the bags in the van.",
  "drop-off": "The drop-off is the place where you leave the order.",
  pickup: "The pickup is the place where you take the order.",
  receipt: "The receipt is the little paper with the list and the price.",
  missing: "Missing means it should be here, but it isn't.",
  tip: "A tip is extra money for good service.",
  rent: "Rent is the money you pay every month for your home or your shop.",
  route: "A route is the way from one place to another.",
  investor: "An investor is a person who puts money into a company.",
  proof: "Proof is something that shows it is true.",
  rating: "Your rating is your number of stars. Five is the best.",
  roundabout: "A roundabout is a circle in the road. Cars go around it.",
  asleep: "Asleep means sleeping.",
  tamper: "To tamper means to open or change something in secret."
};

// ───────── улики, цепочка ─────────
const CLUES = {
  sealRule: { ru: "Kit на проверке: сумки с серой пломбой не вскрывают. Пломба сама сообщает, если её тронули." },
  marek: { ru: "Клиентка из 4B ждала курьера по имени Марек. Его больше никто не видел." },
  countSeals: { ru: "Совет клиентки из 4B: «Дадут сумку с серой пломбой — считай, сколько их»." },
  passphrase: { ru: "Пароль на хабе: «Is it still raining?» — «Only on Mill Road»." },
  threeBags: { ru: "Коул выдал три сумки с серыми пломбами. Правила: не открывать, не трясти, не спрашивать." },
  bagLabel: { ru: "Ярлык на сумке: RLY-PRIORITY, 3 единицы, 1,8 кг. «Do not X-ray» — не просвечивать." },
  sealSensor: { ru: "На пломбе QR-код и датчик вскрытия. Сигнал уходит в Relay." },
  bagInside: { ru: "В сумке — коробки с телефонами и пачки банковских карт на разные имена." },
  lockers: { ru: "Три сумки ушли в три ячейки: 17, 40 и 14. Еду так не возят." },
  thursday60: { ru: "Голос в динамике: «Четверг — последний рейс. Шестьдесят сумок»." },
  afterThursday: { ru: "После четверга хаб закрывают. Приложение обновится, и Kit «забудет» все маршруты." },
  canon17: { ru: "Список четверга везут не в офис, а на Canon Row, дом 17." },
  dana4b: { ru: "Про женщину из 4B наверху знают: «Она ни с кем не говорит. Только заказывает чай»." },
  manifest: { ru: "Планшет хаба: возвраты и наличные — 17 Canon Row. Подпись владельца: M.V." },
  marekAsked: { ru: "Рита: Марек спросил, что в серых сумках. Через два дня его телефон замолчал." },
  ritaDeal: { ru: "Рита пакует еду и не заглядывает в серые сумки. За это ей платят аренду." },
  danaBuilt: { ru: "Дана раньше работала в Relay. Она написала то, что прокладывает курьерам маршруты." },
  ownerGrey: { ru: "Владелец здания: седой, в хорошем пальто. Рита видела его дважды. Он ничего не заказывает." },
  muleKits: { ru: "Дана: в сумках телефоны, карты и SIM. Одна сумка — пятьдесят счетов на несуществующих людей. Сядут курьеры." },
  kitQuiet: { ru: "Дана: Kit учили выбирать самого тихого курьера — новенького, без языка и без друзей." },
  valeOwner: { ru: "Наверху — Маркус Вейл. Кухни, хаб и ячейки принадлежат ему. Живёт на Canon Row, 17." },
  opsCard: { ru: "Дана отдала свою старую служебную карту. Она открывает планшет хаба со списком четверга." },
  valeBags: { ru: "Вейл на записи: «Телефоны. Карты. Новые имена для тех, кому они нужны»." },
  valeMarek: { ru: "Вейл на записи: «Марек открыл сумку. Марек больше ни на кого не работает»." },
  valeThursday: { ru: "Вейл на записи: «После этой ночи Relay обновится. Kit забудет все маршруты»." }
};
const SUSPECTS = ["rita", "cole", "dana", "vale"];
const DOSSIER_FIELDS = [
  { id: "role", ru: "Место в цепочке" },
  { id: "knows", ru: "Что знает" },
  { id: "note", ru: "Заметка" }
];
const DOSSIER_NOTE = "Цепочка Relay: от окна выдачи до человека, которому везут список.";

const MISSIONS = {
  1: { ico: "user", title: "Регистрация", goal: { label: "Пройти проверку Kit", test: (s, st) => st.need > 0 && st.got >= st.need - 1 } },
  2: { ico: "bag", title: "Первая смена", goal: { label: "Три заказа, не больше двух промахов", test: (s) => { const x = (s.shift || {})[2]; return !!x && x.orders >= 3 && x.miss <= 2; } } },
  3: { ico: "lock", title: "Особый заказ", goal: { label: "Сумки в ячейках, пломба цела", test: (s) => !!s.flags.lockerDone && !s.flags.sealBroken } },
  4: { ico: "ear", title: "Хаб", phraseGoal: 1, goal: { label: "Услышать про четверг и Canon Row", test: (s) => !!(s.clues.thursday60 && s.clues.canon17) } },
  5: { ico: "key", title: "Квартира 4B", goal: { label: "Узнать, кто наверху", test: (s) => !!s.clues.valeOwner } },
  6: { ico: "pin", title: "Последняя миля", phraseGoal: 1, goal: { label: "Вейл сказал всё три раза", test: (s) => (s.flags.evidence || 0) >= 3 } }
};

// Как персонажи думают — для языковой модели, если она подключена.
const CAST = {
  kit: "Kit, the AI assistant of the delivery app Relay. Calm, polite, exact, slightly inhuman. Calls the player 'courier'. Uses very simple clear English.",
  rita: "Rita, owner of a small all-night café kitchen that packs orders for Relay. Warm, tired, quick, says 'love'. Scared of the people who pay her rent and avoids talking about the grey sealed bags.",
  cole: "Cole, a loader at the Relay hub. Short flat sentences, suspicious of new couriers, gives orders, never explains.",
  dana: "Dana Reyes, former operations director of Relay who wrote the routing system. Now hides in flat 4B. Quiet, exact, exhausted, tests people before she trusts them.",
  vale: "Marcus Vale, the man who owns the kitchens, the hub and the lockers behind Relay. Soft-spoken, courteous, never raises his voice, speaks as if everything is already decided.",
  sam: "Sam, a cheerful young customer waiting for coffee.",
  concierge: "A bored, correct night concierge at an apartment building desk."
};

const S3_COVER = { id: "cover", label: "выдать себя", ai: "mentions police, spying, an agent, a handler, Sova, a wire, a recording or a secret mission",
  any: ["spy", "spying", "agent", "police", "sova", "handler", "undercover", "secret mission", "wire", "recording", "record you", "microphone", "detective"], sus: 35, reply: "Sorry... what did you say?" };
const S3_LEGEND = [
  { id: "otherCity", label: "город не из легенды", ai: (s) => `says they come from a city or country other than ${Leg.city(s).en}, ${Leg.city(s).country}`,
    any: (s) => Leg.otherCities(s), sus: 20, reply: (s) => `Wait. Your profile says ${Leg.city(s).en}.` },
  { id: "russia", label: "Россия вместо легенды", ai: "says they are from Russia or Moscow, or that they are Russian",
    any: ["russia", "russian", "moscow", "petersburg"], sus: 30, reply: (s) => `Russia? Your profile says ${Leg.city(s).en}.` }
];
const S3_FORBID = () => [S3_COVER, ...S3_LEGEND];
const NOSY = { id: "nosy", label: "лишний вопрос", ai: "asks what is inside the sealed bags, who the bags are for, or why they are sealed",
  any: ["whats in", "what is in", "whats inside", "what is inside", "who is it for", "why sealed", "why are they", "open it", "can i open"], sus: 18, reply: "What did I just say?" };

const ANY_EN = { id: "any", label: "ответить по-английски", ai: "answers in English (any answer is fine)", test: (t) => enWords(t) >= 1 && !isRussian(t) && !Repair.detect(t) };
const ASKS = (t) => isQuestion(t) && !Repair.detect(t);
const YES = ["yes", "yeah", "yep", "sure", "of course", "ok", "okay", "right", "correct", "absolutely", "definitely", "no problem", "fine", "great", "perfect", "alright", "all right", "i do", "i can", "i accept"];
const NO = ["no", "nope", "never", "dont", "do not", "not", "cant", "cannot", "i wont"];

// Буквы по-английски: «F-R-O-S-T», «eff ar oh ess tee».
function spelled(text, word) {
  const t = norm(text);
  const NAMES = { aitch: "h", haitch: "h", oh: "o", el: "l", ell: "l", eye: "i", ess: "s", es: "s", em: "m", ar: "r", are: "r", dee: "d", tee: "t", tea: "t", bee: "b", see: "c", sea: "c", gee: "g", jay: "j", kay: "k", pee: "p", queue: "q", you: "u", vee: "v", ex: "x", why: "y", zed: "z", zee: "z", eff: "f", ef: "f", en: "n", ay: "a" };
  const out = [];
  const toks = t.split(" ");
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i];
    if (w === "double" && toks[i + 1]) { const n = toks[i + 1].length === 1 ? toks[i + 1] : NAMES[toks[i + 1]]; if (n) { out.push(n, n); i++; continue; } }
    if (w.length === 1) out.push(w);
    else if (NAMES[w]) out.push(NAMES[w]);
  }
  return out.join("").includes(word.toLowerCase());
}
// Доля слов образца, прозвучавших в ответе: для чтения вслух и повторов.
function sameWords(text, sample) {
  const want = norm(sample).split(" "), pool = norm(text).split(" ");
  let hit = 0;
  want.forEach((w) => { const k = pool.indexOf(w); if (k >= 0) { pool.splice(k, 1); hit += 1; } });
  return want.length ? hit / want.length : 0;
}

// Заказы смены. Карточка заказа, навигатор и дверь берут данные отсюда.
const ORDERS = {
  417: { id: "417", from: "Rita's Kitchen", items: ["2 × flat white", "1 × brownie"], name: "Sam", addr: "12 Mill Road, Flat 3", note: "Buzzer for Flat 3. Second floor.", pay: 4.2, dist: "0.9 km" },
  422: { id: "422", from: "Rita's Kitchen", items: ["2 × tomato soup", "1 × bread"], name: "Mrs Okoye", addr: "8 Canon Court, Flat 21", note: "Please DON'T ring. My husband is asleep. Leave it with the concierge.", pay: 5.1, dist: "1.6 km" },
  431: { id: "431", from: "Rita's Kitchen", items: ["1 × peppermint tea"], name: "D. Reyes", addr: "2 Dock Street, Flat 4B", note: "Ring twice. Then wait.", pay: 3.8, dist: "0.7 km" },
  498: { id: "498", from: "Relay hub · side door", items: ["3 × sealed bag"], name: "—", addr: "Lockers, Dock Street", note: "PRIORITY. Do not open. Do not shake.", pay: 38, dist: "2.1 km", sealed: true },
  502: { id: "502", from: "Rita's Kitchen", items: ["1 × peppermint tea"], name: "D. Reyes", addr: "2 Dock Street, Flat 4B", note: "Ring twice. Come in this time.", pay: 3.8, dist: "0.7 km" },
  560: { id: "560", from: "Relay hub", items: ["1 × sealed envelope — THURSDAY LIST"], name: "M.V.", addr: "17 Canon Row", note: "RETURN. Hand to the owner only.", pay: 120, dist: "3.4 km", sealed: true }
};

// Схема курьерской сумки для осмотра: линии, без картинок.
function bagSvg() {
  const hit = (x, y, w, h) => `<rect class="s-hit" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>`;
  return `<svg class="s-plan" viewBox="0 0 1000 620" aria-hidden="true">
    <rect width="1000" height="620" class="p-ground"/>
    <path d="M250 190 H750 L790 520 H210 Z" class="p-body"/>
    <path d="M250 190 Q500 120 750 190" class="p-line"/>
    <path d="M400 150 Q500 60 600 150" class="p-strap"/>
    <g class="s-obj" data-id="zip">${hit(270, 168, 460, 46)}<path d="M276 196 H724" class="p-zip"/><rect x="690" y="184" width="34" height="24" rx="5" class="p-part"/></g>
    <g class="s-obj" data-id="gap">${hit(232, 170, 56, 70)}<path d="M252 194 q-14 22 -6 44" class="p-gap"/></g>
    <g class="s-obj" data-id="seal">${hit(660, 214, 110, 84)}<rect x="676" y="226" width="78" height="60" rx="8" class="p-seal"/><circle cx="738" cy="242" r="5" class="p-led"/><path d="M688 240h22v22h-22z M694 246h10v10h-10z M716 264h8v8h-8z" class="p-thin"/></g>
    <g class="s-obj" data-id="label">${hit(300, 300, 260, 130)}<rect x="312" y="312" width="236" height="106" rx="6" class="p-label"/><path d="M330 340h150 M330 362h200 M330 384h120" class="p-thin"/></g>
    <g class="s-obj" data-id="base">${hit(230, 470, 540, 70)}<path d="M222 500 H778" class="p-line"/><path d="M300 520 h60 M640 520 h60" class="p-thin"/></g>
    <g class="p-text"><text x="500" y="590">RELAY · THERMAL BAG · 42 L</text></g>
  </svg>`;
}

// План погрузочной зоны хаба для подслушивания.
const PLANS = {
  hub: {
    pos: { bikes: [150, 470], pallets: [470, 400], van: [705, 300], bay: [800, 215], door: [90, 560] },
    svg: () => `<svg class="o-map-svg plan" viewBox="0 0 1000 620" aria-hidden="true">
      <rect x="20" y="20" width="960" height="580" rx="6" class="p-ground"/>
      <rect x="20" y="20" width="960" height="120" class="p-wall"/>
      <g class="p-line"><rect x="610" y="20" width="150" height="120"/><rect x="790" y="20" width="150" height="120"/><rect x="430" y="20" width="150" height="120"/></g>
      <rect x="620" y="170" width="250" height="110" rx="14" class="p-van"/><rect x="640" y="186" width="60" height="78" rx="6" class="p-thin"/>
      <g class="p-thin"><rect x="410" y="350" width="70" height="56"/><rect x="486" y="350" width="70" height="56"/><rect x="448" y="412" width="70" height="56"/></g>
      <g class="p-thin"><path d="M90 430 v80 M120 430 v80 M150 430 v80 M180 430 v80 M210 430 v80"/><path d="M80 520 H222"/></g>
      <path d="M20 540 H60 M20 590 H60" class="p-line"/>
      <g class="p-text"><text x="505" y="90">LOADING BAY 1</text><text x="685" y="90">BAY 2</text><text x="865" y="90">BAY 3</text>
        <text x="745" y="312">VAN</text><text x="483" y="500">PALLETS</text><text x="150" y="552">BIKE RACK</text><text x="92" y="596">SIDE DOOR</text></g>
    </svg>`
  }
};

// ───────── сцены ─────────
const S3 = {
  // ═════════ МИССИЯ 1 · РЕГИСТРАЦИЯ ═════════
  "r1-open": {
    type: "chat", mission: 1, missionStart: true, chapter: { n: 1, title: "Регистрация", sub: "Понедельник, 20:10 · съёмная комната" },
    time: "20:10", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Иней, работа. Relay — приложение доставки: еда по ночному Лондону. По ночам в сумках едет не только еда." },
      { from: "sova", text: "Трое их курьеров за два месяца. Один сел за чужой пакет, второй в больнице, третий просто перестал выходить на связь." },
      { from: "sova", text: "Ты — четвёртый. Регистрацию ведёт их ИИ-ассистент, зовут Kit. Сначала легенда." }
    ],
    end: "Открыть легенду"
  },

  "r1-legend": { type: "legend", mission: 1, time: "20:14", place: "Легенда", bg: "art/cabinet.jpg", look: "dim" },

  "r1-check": {
    type: "chat", mission: 1, time: "20:20", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: (s) => `${Leg.city(s).ru}, ${Leg.job(s).ru}, ${Leg.ride(s).ru}. Запомнила. Kit запомнит тоже — и сверит.` },
      { from: "sova", text: "Проверка связи. Нажми «Говорить» (или держи пробел) и скажи по-английски: Hi, I'm Alex. Можно и написать." },
      { me: { hint: "Скажи: Hi, I'm Alex.", model: "Hi, I'm Alex.",
        facts: [{ id: "hi", label: "представиться", ai: "greets and/or says their name is Alex", any: ["alex", "hi", "hello", "hey", "frost", "im", "i am"] }],
        ask: { hi: "Не слышу. По-английски: Hi, I'm Alex." },
        ok: "Слышу. Акцент есть. Для Relay это плюс: таких они и берут." } },
      { from: "sova", text: "По-русски — ни слова: Kit слушает все разговоры курьеров. Не расслышишь — переспроси, это нормально:" },
      { phrase: "repeat" },
      { from: "sova", text: "Не знаешь, что сказать, — ты первую ночь на линии:" },
      { phrase: "new" },
      { from: "sova", text: "Внизу экрана — «Суфлёр» и «Остыть». Зарядов мало. Всё, Kit звонит." }
    ],
    end: "Ответить на вызов", ring: { who: "kit", title: "Relay · проверка курьера", sub: "Kit, ассистент" }
  },

  "r1-kit": {
    type: "conv", ui: "assistant", mission: 1, time: "20:24", place: "Видеопроверка", bg: "art/cabinet.jpg", look: "dim",
    title: "Relay · Courier check", npc: "kit", sub: "Relay assistant", meter: "Проверка",
    goal: "Пройди проверку. Отвечай по легенде и по правилам.",
    situation: "The AI assistant of a delivery app checks a new courier by voice: identity, experience and three safety rules.",
    forbid: S3_FORBID,
    failSay: "Thank you. Your application is closed.", failText: "Kit закрыла заявку. В Relay тебя не взяли.",
    beats: [
      { say: "Hello. I am Kit, your Relay assistant. Can you hear me clearly?",
        hint: "Ответь, что слышишь.", model: "Yes, I can hear you.",
        facts: [{ id: "hear", label: "ответить, что слышно", ai: "confirms they can hear, or greets", any: [...YES, "hear", "hello", "hi", "clearly", "loud and clear"] }],
        ask: { hear: "Hello? Can you hear me?" }, ok: "Good." },
      { say: "Please say your full name.",
        hint: "Имя из легенды.", model: "My name is Alex Frost.",
        facts: [{ id: "name", label: "Alex Frost", ai: "says their name is Alex Frost", any: ["alex", "frost"] }],
        ask: { name: "I did not catch that. Your full name, please." }, ok: "Thank you, Alex." },
      { say: "Where are you from?", legendHint: true,
        hint: "Город из легенды.", model: (s) => Leg.city(s).say,
        facts: [{ id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en}`, any: (s) => Leg.city(s).any }],
        ask: { city: "Sorry. Which city?" }, ok: (s) => `${Leg.city(s).en}. Noted.` },
      { say: "What did you do before Relay?", legendHint: true,
        hint: "Прошлая работа из легенды.", model: (s) => Leg.job(s).say,
        facts: [{ id: "job", label: (s) => `работа: ${Leg.job(s).short}`, ai: (s) => `says they worked as ${Leg.job(s).en}`, any: (s) => Leg.job(s).any }],
        ask: { job: "And your last job?" }, ok: "Thank you." },
      { say: "How will you deliver? Bicycle, e-bike or moped?", legendHint: true,
        hint: "На чём ездишь — из легенды.", model: (s) => Leg.ride(s).say,
        facts: [{ id: "ride", label: (s) => `транспорт: ${Leg.ride(s).short}`, ai: (s) => `says they ride ${Leg.ride(s).short}`, any: (s) => Leg.ride(s).any }],
        ask: { ride: "Bicycle, e-bike or moped?" }, ok: "Registered." },
      { say: "Three safety questions. One. The customer is not at home. What do you do?",
        hint: "Клиента нет дома. Что делаешь? Например: I call the customer.", model: "I call the customer.",
        facts: [{ id: "call", label: "позвонить клиенту", ai: "says they call, phone or message the customer, or wait", any: ["call", "phone", "ring the customer", "contact", "message", "text", "wait"] }],
        ask: { call: "The customer is not at home. What do you do?" }, ok: "Correct. Call the customer. Wait five minutes." },
      { say: "Two. The note says: leave at the door. Do you ring the bell?",
        hint: "В примечании «оставить у двери». Звонить в дверь? Нет.", model: "No, I don't.",
        facts: [{ id: "noring", label: "не звонить", ai: "says no, they do not ring the bell", any: [...NO, "leave it", "leave the order", "at the door"] }],
        ask: { noring: "Do you ring the bell? Yes or no." }, ok: "Correct. Always read the note." },
      { say: "Three. A bag has a grey seal. Can you open it?",
        hint: "Сумку с серой пломбой открывать можно? Нет.", model: "No, never.",
        facts: [{ id: "noopen", label: "не открывать", ai: "says no, they never open a sealed bag", any: NO }],
        ask: { noopen: "Can you open a sealed bag? Yes or no." }, ok: "Correct. Sealed bags are never opened. The seal tells me if you do.",
        done: () => Clues.add("sealRule") },
      { say: "Last step. Please read this sentence aloud.",
        read: "I am an independent courier. I deliver what I am given.",
        ok: "Thank you. Your voice is saved." }
    ],
    end: { say: "Welcome to Relay, Alex. Your first shift starts at nine. Ride safe." }
  },

  "r1-debrief": {
    type: "debrief", mission: 1, time: "20:35", place: "Итог", bg: "art/cabinet.jpg", look: "dim",
    title: "Ты в системе",
    sova: (s) => s.clues.sealRule
      ? "Ты внутри. Заметь: про серую пломбу она спросила сама, никто за язык не тянул. И голос твой сохранила. Выходи на линию."
      : "Ты внутри. Выходи на линию."
  },

  // ═════════ МИССИЯ 2 · ПЕРВАЯ СМЕНА ═════════
  "r2-brief": {
    type: "chat", mission: 2, missionStart: true, chapter: { n: 2, title: "Первая смена", sub: "Понедельник, 21:00 · Mill Road" },
    time: "21:00", place: "Сообщения", bg: "art/cafe.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Первая смена. Работай честно: рейтинг — твой пропуск. Высокий рейтинг — и Kit начнёт давать «особые» заказы." },
      { from: "sova", text: "Читай примечание к каждому заказу. Навигатор говорит по-английски: left — налево, right — направо, straight on — прямо." },
      { phrase: "delivery" }
    ],
    end: "Выйти на линию"
  },

  "r2-o1": { type: "order", mission: 2, time: "21:04", place: "Relay Courier", bg: "art/cafe.jpg", look: "dim", order: 417, first: true },
  "r2-o1-pick": {
    type: "conv", ui: "face", mission: 2, time: "21:07", place: "Rita's Kitchen", bg: "art/cafe.jpg", look: "cine", npc: "rita", order: 417,
    goal: "Забери заказ 417.",
    situation: "A new courier picks up order 417 at the counter of Rita's Kitchen.",
    forbid: S3_FORBID,
    beats: [
      { say: "Evening! Relay? What's the order number?",
        hint: "Номер заказа — в карточке: 417. По цифрам: four-one-seven.", model: "Order four-one-seven, please.",
        facts: [{ id: "num", label: "номер 417", ai: "says the order number 417", any: ["417", "four one seven", "four seventeen", "4 1 7"] }],
        ask: { num: "Sorry, love, which number?" }, ok: "Four-one-seven. Two flat whites and a brownie. Here you go." },
      { say: "You're new, aren't you? First night?",
        hint: "Да, первая ночь.", model: "Yes, it's my first night.",
        facts: [{ id: "yes", label: "ответить", ai: "says yes, it is their first night / they are new", any: [...YES, "first", "new", "tonight"] }],
        ok: "Thought so. I'm Rita. Careful, the cups are hot." }
    ],
    end: { say: "Go on, then. Sam's a good tipper." }
  },
  "r2-o1-ride": {
    type: "ride", mission: 2, time: "21:10", place: "Навигатор", bg: "art/rank.jpg", look: "dim", order: 417,
    goal: "Слушай Kit и выбирай поворот.",
    steps: [
      { say: "In two hundred metres, turn left.", kind: "cross", right: "left", names: { left: "DOCK ST", straight: "HIGH ST", right: "QUAY LN" } },
      { say: "Go straight on at the traffic lights.", kind: "cross", right: "straight", names: { left: "KING ST", straight: "DOCK ST", right: "BELL LN" } },
      { say: "Turn right onto Mill Road.", kind: "cross", right: "right", names: { left: "CANON ST", straight: "DOCK ST", right: "MILL RD" } },
      { say: "Your destination is on the left.", kind: "dest", right: "left" }
    ]
  },
  "r2-o1-drop": {
    type: "drop", mission: 2, time: "21:16", place: "12 Mill Road", bg: "art/rank.jpg", look: "cine", order: 417,
    opts: [
      { ru: "Набрать на домофоне квартиру 3", ok: true },
      { ru: "Оставить пакет у подъезда", why: "В примечании: Buzzer for Flat 3 — нужно позвонить в домофон." },
      { ru: "Позвонить клиенту по телефону", why: "Домофон работает: в примечании сказано звонить в квартиру 3." }
    ]
  },
  "r2-o1-door": {
    type: "conv", ui: "intercom", mission: 2, time: "21:17", place: "12 Mill Road", bg: "art/rank.jpg", look: "cine", npc: "sam", order: 417, panel: "FLAT 3",
    goal: "Скажи, кто ты и для кого заказ.",
    situation: "A courier speaks to the customer Sam through the door buzzer and then hands over two coffees and a brownie.",
    forbid: S3_FORBID,
    beats: [
      { say: "Hello?",
        hint: "Кто ты и для кого: Hi, Relay delivery for Sam.", model: "Hi, Relay delivery for Sam.",
        facts: [{ id: "who", label: "доставка для Сэма", ai: "says it is a delivery / an order (for Sam)", any: ["delivery", "relay", "order", "coffee", "for sam", "your food"] }],
        ask: { who: "Sorry, who is it?" }, ok: "Oh, brilliant. Come up. Second floor." },
      { say: "Cheers, mate. Is the brownie in there?",
        hint: "Брауни на месте? Да.", model: "Yes, it's in the bag.",
        facts: [{ id: "yes", label: "ответить", ai: "confirms the brownie is in the bag", any: [...YES, "in the bag", "its there", "here"] }],
        ok: "Legend." },
      { say: "Have a good night!",
        hint: "Попрощайся: You too. Good night.", model: "You too. Good night!",
        facts: [{ id: "bye", label: "попрощаться", ai: "says goodbye or thanks", any: ["you too", "thank*", "bye", "good night", "goodnight", "cheers", "have a good", "enjoy", "take care"] }] }
    ]
  },
  "r2-o1-rate": { type: "rate", mission: 2, time: "21:19", place: "Заказ закрыт", bg: "art/rank.jpg", look: "dim", order: 417, tip: 2 },

  "r2-o2": { type: "order", mission: 2, time: "21:26", place: "Relay Courier", bg: "art/cafe.jpg", look: "dim", order: 422 },
  "r2-o2-bag": {
    type: "bagcheck", mission: 2, time: "21:29", place: "Rita's Kitchen", bg: "art/cafe.jpg", look: "dim", order: 422,
    goal: "Сверь чек на пакете с заказом.",
    receipt: ["1 × tomato soup", "1 × bread"], wrong: 0,
    why: "В заказе два супа, в чеке один."
  },
  "r2-o2-pick": {
    type: "conv", ui: "face", mission: 2, time: "21:30", place: "Rita's Kitchen", bg: "art/cafe.jpg", look: "cine", npc: "rita", order: 422,
    goal: "Скажи Рите, чего не хватает.",
    situation: "The courier checks the bag for order 422 and tells Rita that one of the two soups is missing.",
    forbid: S3_FORBID,
    beats: [
      { say: "Four-two-two. Soup and bread. All good?",
        hint: "Одного супа не хватает: One soup is missing.", model: "One soup is missing. The order says two.",
        facts: [{ id: "miss", label: "не хватает супа", ai: "says one soup is missing / the order says two soups",
          any: ["missing", "only one", "one soup", "two soups", "second soup", "another soup", "not two", "should be two", "one more"] }],
        ask: { miss: "Hm? What's wrong with it, love?" }, ok: "Oh! You're right. Sorry, love. Here's the other one.", badge: "eyes" },
      { say: "Good eyes. Most couriers never check.",
        hint: "Любой короткий ответ.", model: "No problem.", facts: [ANY_EN], ok: "Off you go." }
    ]
  },
  "r2-o2-ride": {
    type: "ride", mission: 2, time: "21:33", place: "Навигатор", bg: "art/rank.jpg", look: "dim", order: 422,
    goal: "Слушай Kit и выбирай поворот.",
    steps: [
      { say: "Take the second left.", kind: "l2", right: "second", names: { first: "BELL LN", second: "KING ST", straight: "MILL RD" } },
      { say: "At the roundabout, take the third exit.", kind: "round", right: "e3", names: { e1: "QUAY LN", e2: "HIGH ST", e3: "CANON ST" } },
      { say: "Go straight on for three hundred metres.", kind: "cross", right: "straight", names: { left: "DOCK ST", straight: "CANON ST", right: "MILL RD" } },
      { say: "Turn left into Canon Court.", kind: "cross", right: "left", names: { left: "CANON CT", straight: "CANON ST", right: "KING ST" } },
      { say: "Your destination is on the right.", kind: "dest", right: "right" }
    ]
  },
  "r2-o2-drop": {
    type: "drop", mission: 2, time: "21:41", place: "8 Canon Court", bg: "art/lobby.jpg", look: "cine", order: 422,
    opts: [
      { ru: "Позвонить в квартиру 21", who: "okoye", bad: "I said don't ring! He's asleep!", why: "В примечании: Please DON'T ring." },
      { ru: "Отдать консьержу", ok: true },
      { ru: "Оставить у двери квартиры", why: "Leave it with the concierge — отдать консьержу, а не под дверь." }
    ]
  },
  "r2-o2-desk": {
    type: "conv", ui: "face", mission: 2, time: "21:42", place: "8 Canon Court · стойка", bg: "art/lobby.jpg", look: "cine", npc: "concierge", order: 422,
    goal: "Оставь заказ у консьержа.",
    situation: "A courier leaves a food order for Mrs Okoye, flat 21, with the night concierge, who writes it in the log.",
    forbid: S3_FORBID,
    beats: [
      { say: "Good evening. Who is it for?",
        hint: "Для кого заказ — в карточке.", model: "It's for Mrs Okoye.",
        facts: [{ id: "name", label: "Mrs Okoye", ai: "says the order is for Mrs Okoye", any: ["okoye", "okoy*", "okoya", "mrs o"] }],
        ask: { name: "Sorry, the name?" } },
      { say: "Which flat?",
        hint: "Квартира 21 — twenty-one.", model: "Flat twenty-one.",
        facts: [{ id: "flat", label: "квартира 21", ai: "says flat 21", any: ["21", "twenty one"] }],
        ask: { flat: "The flat number?" }, ok: "Twenty-one. Fine." },
      { say: "And your name, for the log?",
        hint: "Имя из легенды.", model: "Alex Frost.",
        facts: [{ id: "me", label: "Alex Frost", ai: "says their name, Alex Frost", any: ["alex", "frost"] }] },
      { say: "Frost? How do you spell that?",
        hint: "По буквам: F, R, O, S, T — эф, ар, оу, эс, ти.", model: "F-R-O-S-T.",
        facts: [{ id: "spell", label: "по буквам F-R-O-S-T", ai: "spells the surname Frost letter by letter", test: (t) => spelled(t, "frost") }],
        ask: { spell: "Letter by letter, please." }, ok: "Like the weather. Got it.", giveUp: "Never mind. I'll write 'courier'." }
    ],
    end: { say: "I'll take it up. Good night." }
  },
  "r2-o2-rate": { type: "rate", mission: 2, time: "21:45", place: "Заказ закрыт", bg: "art/lobby.jpg", look: "dim", order: 422, tip: 1.5 },

  "r2-o3": { type: "order", mission: 2, time: "22:38", place: "Relay Courier", bg: "art/cafe.jpg", look: "dim", order: 431 },
  "r2-o3-ride": {
    type: "ride", mission: 2, time: "22:41", place: "Навигатор", bg: "art/rank.jpg", look: "dim", order: 431,
    goal: "Слушай Kit и выбирай поворот.",
    steps: [
      { say: "Turn right at the traffic lights.", kind: "cross", right: "right", names: { left: "MILL RD", straight: "HIGH ST", right: "QUAY LN" } },
      { say: "Then take the first left.", kind: "l2", right: "first", names: { first: "DOCK ST", second: "BELL LN", straight: "QUAY LN" } },
      { say: "Your destination is on the left.", kind: "dest", right: "left" }
    ]
  },
  "r2-o3-drop": {
    type: "drop", mission: 2, time: "22:46", place: "2 Dock Street · 4B", bg: "art/hall.jpg", look: "cine", order: 431,
    opts: [
      { ru: "Позвонить один раз", why: "Ring twice — два раза." },
      { ru: "Позвонить два раза и ждать", ok: true },
      { ru: "Оставить у двери и уйти", why: "Then wait — нужно дождаться." }
    ]
  },
  "r2-o3-door": {
    type: "conv", ui: "face", mission: 2, time: "22:47", place: "Квартира 4B", bg: "art/hall.jpg", look: "cine", npc: "dana", order: 431,
    goal: "Отдай чай. Она ждала другого курьера.",
    situation: "A woman opens the door of flat 4B. She expected another courier, Marek, and tests the new one.",
    forbid: S3_FORBID,
    beats: [
      { say: "You're not Marek.",
        hint: "Скажи, что ты новенький(ая).", model: "No. I'm new. It's my first night.",
        facts: [{ id: "new", label: "объяснить, кто ты", ai: "says they are new / it is their first night / gives their name", any: ["new", "first night", "first day", "just started", "not marek", "alex", "my name", "delivery", "your tea"] }],
        ask: { new: "Then who are you?" }, ok: "First night. Of course." },
      { say: "Where is Marek? He always brings my order.",
        hint: "Ты не знаешь: Sorry, I don't know.", model: "Sorry, I don't know.",
        facts: [{ id: "dk", label: "ответить", ai: "says they don't know / never met Marek", any: ["dont know", "do not know", "not sure", "no idea", "never met", "who is marek", "sorry", "i dont"] }],
        ok: "No. Nobody does." },
      { say: "Where are you from?", legendHint: true,
        hint: "Город из легенды.", model: (s) => Leg.city(s).say,
        facts: [{ id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en}`, any: (s) => Leg.city(s).any }],
        ask: { city: "Sorry, where?" }, ok: (s) => `${Leg.city(s).en}. A long way to come for a delivery job.` },
      { say: "Here. For the tea. And some advice, for free. When they give you a bag with a grey seal — count them.",
        hint: "Любой короткий ответ.", model: "Okay. Thank you.", facts: [ANY_EN],
        done: () => { Clues.add("marek"); Clues.add("countSeals"); } }
    ],
    end: { say: "Good night, courier." }
  },
  "r2-o3-rate": { type: "rate", mission: 2, time: "22:52", place: "Заказ закрыт", bg: "art/hall.jpg", look: "dim", order: 431, tip: 20 },

  "r2-report": {
    type: "chat", mission: 2, time: "23:05", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Двадцать фунтов чаевых за чай. Что сказала клиентка из 4B? По-английски, коротко." },
      { me: { report: true, maxTries: 4,
        hint: "Например: She asked about Marek. She said: count the grey seals.",
        model: "She asked about Marek. And she said: count the bags with a grey seal.",
        facts: [
          { id: "marek", label: "про Марека", ai: "says she asked about Marek, the previous courier", any: ["marek"], ack: "Марек Новак. Тот, что перестал выходить на связь." },
          { id: "seal", label: "про пломбы", ai: "says she told them to count the grey seals / sealed bags", any: ["seal*", "grey", "gray", "count", "bag*"], ack: "«Считай пломбы». Она знает, как это устроено." }],
        ask: { marek: "О ком она спрашивала?", seal: "А что за совет?" },
        fallback: "Ладно. Я слышала сама: Марек и серые пломбы." } },
      { from: "sova", text: "Запомни 4B. Человек, который даёт такие советы бесплатно, чего-то от тебя ждёт." }
    ],
    end: "Дальше"
  },
  "r2-debrief": {
    type: "debrief", mission: 2, time: "23:10", place: "Итог", bg: "art/cabinet.jpg", look: "dim",
    title: "Первая смена",
    sova: (s) => { const x = (s.shift || {})[2] || { miss: 9 }; return x.miss <= 2 ? "Три заказа без жалоб. Kit таких любит. Жди приоритетный заказ." : "Смена закрыта, но с огрехами. Kit любит аккуратных: читай примечания и слушай повороты."; }
  },

  // ═════════ МИССИЯ 3 · ОСОБЫЙ ЗАКАЗ ═════════
  "r3-brief": {
    type: "chat", mission: 3, missionStart: true, chapter: { n: 3, title: "Особый заказ", sub: "Вторник, 22:15 · Dock Street" },
    time: "22:15", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Рейтинг 4,9. Сейчас Kit предложит приоритетный заказ. Бери." },
      { from: "sova", text: "Нам нужно знать, что в сумке и куда её везут. Пломбу не ломай, если не уверен(а): она стучит Kit." },
      { phrase: "understood" }
    ],
    end: "Ответить Kit", ring: { who: "kit", title: "Relay · приоритетный заказ", sub: "Kit, ассистент" }
  },
  "r3-kit": {
    type: "conv", ui: "assistant", mission: 3, time: "22:18", place: "Звонок Kit", bg: "art/cabinet.jpg", look: "dim", npc: "kit", sub: "Relay assistant", meter: "Инструктаж",
    goal: "Kit диктует условия. Повторяй за ней время, пароль и код.",
    situation: "The AI assistant gives a courier the conditions of a priority order: a time, a passphrase and a locker code. The courier must repeat each one.",
    forbid: () => [S3_COVER, NOSY],
    beats: [
      { say: "Courier Frost. You have a priority order. Do you accept?",
        hint: "Соглашайся.", model: "Yes, I accept.",
        facts: [{ id: "yes", label: "согласиться", ai: "accepts the order", any: YES }], ok: "Thank you." },
      { say: "Pickup: Relay hub, side door, at twenty-two forty. Please repeat the time.",
        hint: "Повтори время: twenty-two forty.", model: "Twenty-two forty.",
        facts: [{ id: "time", label: "22:40", ai: "repeats the time 22:40", any: ["2240", "twenty two forty", "22 40", "ten forty", "1040", "twenty to eleven"] }],
        ask: { time: "The time is twenty-two forty. Please repeat." }, ok: "Correct." },
      { say: "Say to the loader: is it still raining? Repeat the phrase.",
        hint: "Повтори пароль: Is it still raining?", model: "Is it still raining?",
        facts: [{ id: "pass", label: "пароль", ai: "repeats the phrase 'Is it still raining?'", test: (t) => sameWords(t, "is it still raining") >= 0.75 }],
        ask: { pass: "The phrase is: is it still raining. Please repeat." }, ok: "Correct.", done: () => Clues.add("passphrase") },
      { say: "Drop-off: three lockers on Dock Street. The first is locker seventeen. The code is four, one, seven, zero. Repeat the code.",
        hint: "Повтори код: four-one-seven-zero.", model: "Four, one, seven, zero.",
        facts: [{ id: "code", label: "код 4170", ai: "repeats the code 4170", any: ["4170", "four one seven zero", "four one seven oh", "4 1 7 0", "forty one seventy"] }],
        ask: { code: "Four, one, seven, zero. Please repeat." }, ok: "Correct.",
        done: () => Notes.add({ kind: "item", src: "phone", time: "22:19", text: "Kit: ячейка 17, код 4170. Забор — хаб, боковая дверь, 22:40." }) },
      { say: "Do not open the bags. Do not shake the bags. The seal reports to me. Do you understand?",
        hint: "Понял(а): Understood.", model: "Understood.",
        facts: [{ id: "ok", label: "подтвердить", ai: "confirms they understand", any: [...YES, "understood", "understand", "got it", "clear"] }] }
    ],
    end: { say: "Thank you, courier." }
  },
  "r3-hub": {
    type: "conv", ui: "face", mission: 3, time: "22:40", place: "Хаб Relay · боковая дверь", bg: "art/dock.jpg", look: "cine", npc: "cole", order: 498,
    goal: "Назови пароль и забери сумки.",
    situation: "At the side door of a warehouse a loader gives three sealed bags to a new courier after hearing the passphrase.",
    forbid: () => [...S3_FORBID(), NOSY],
    failSay: "Give me the bags. You're off the list.", failText: "Коул забрал сумки. Приоритетных заказов больше не будет.",
    beats: [
      { say: "Yeah?",
        hint: "Пароль от Kit.", model: "Is it still raining?",
        facts: [{ id: "pass", label: "пароль", ai: "says the passphrase 'Is it still raining?'", any: ["raining", "still raining", "is it raining", "rain"] }],
        ask: { pass: "I said: yeah?" }, ok: "Only on Mill Road." },
      { say: "You're the new one. Where are you from?", legendHint: true,
        hint: "Город из легенды.", model: (s) => Leg.city(s).say,
        facts: [{ id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en}`, any: (s) => Leg.city(s).any }],
        ask: { city: "Where?" }, ok: (s) => `${Leg.city(s).en}. Right.` },
      { say: "What do you ride?", legendHint: true,
        hint: "Транспорт из легенды.", model: (s) => Leg.ride(s).say,
        facts: [{ id: "ride", label: (s) => `транспорт: ${Leg.ride(s).short}`, ai: (s) => `says they ride ${Leg.ride(s).short}`, any: (s) => Leg.ride(s).any }],
        ask: { ride: "Bike? Moped? What?" }, ok: "Fine. Keep it quiet." },
      { say: "Three bags. Grey seals. You don't open them. You don't shake them. You don't ask. Clear?",
        hint: "Коротко: Understood.", model: "Understood.",
        facts: [{ id: "ok", label: "подтвердить", ai: "confirms it is clear", any: [...YES, "understood", "clear", "got it", "i understand"] }],
        ask: { ok: "Clear or not?" }, ok: "Good.", done: () => Clues.add("threeBags") },
      { say: "The last courier asked questions. Don't be the last courier.",
        hint: "Любой короткий ответ.", model: "Okay.", facts: [ANY_EN] }
    ]
  },
  "r3-bag": {
    type: "search", mission: 3, time: "22:44", place: "Dock Street · под фонарём", bg: "art/dock.jpg", look: "dim", order: 498,
    kicker: "Сумка с серой пломбой", title: "Что внутри",
    goal: "Осмотри сумку. Вскрывать или нет — решать тебе.",
    intro: "У тебя минута до окна доставки. Сумку можно осмотреть, не вскрывая. Можно и расстегнуть молнию — но пломба сообщит Kit.",
    keys: ["Нажимай на части сумки", "Каждая называет себя по-английски", "Молния — это риск"],
    seconds: 70, svg: bagSvg, leave: "Ехать к ячейкам",
    words: { zip: ["the zip", "молния"], gap: ["a gap", "щель у края молнии"], seal: ["the seal", "пломба"], label: ["the label", "ярлык"], base: ["the bottom", "дно сумки"] },
    secrets: {
      label: { clues: ["bagLabel"], html: `<h3>Ярлык</h3><div class="o-paper print">RLY-PRIORITY\n3 units · 1.8 kg\nKeep dry. Do not X-ray.\nHandle with care.</div><p class="o-find-q">Три единицы, меньше двух килограммов. «Do not X-ray» — не просвечивать. На еду не похоже.</p>` },
      seal: { clues: ["sealSensor"], html: `<h3>Пломба</h3><div class="o-paper screen">TAMPER SENSOR\nstatus: CLOSED\nreports to: RELAY</div><p class="o-find-q">Датчик вскрытия. Сломаешь — Kit узнает в ту же секунду.</p>` },
      base: { html: `<h3>Дно сумки</h3><div class="o-paper print">Something slides inside.\nSmall hard boxes. A lot of them.</div><p class="o-find-q">Что-то мелкое и твёрдое. Коробочки. Трясти нельзя — и не надо.</p>` },
      gap: { clues: ["bagInside"], badge: "seal", slow: 2200, html: `<h3>Щель у молнии</h3><div class="o-paper print">A phone box. Then another one.\nBank cards in a rubber band.\nEvery card has a different name.</div><p class="o-find-q">Через щель видно: коробки с телефонами и банковские карты на разные имена. Пломба цела.</p>` },
      zip: { clues: ["bagInside"], heat: 35, flag: "sealBroken", slow: 1200, html: `<h3>Молния расстёгнута</h3><div class="o-paper print">Twelve prepaid phones.\nTwelve bank cards — twelve names.\nSIM cards in a zip bag.</div><p class="o-find-q">Двенадцать телефонов, двенадцать карт на разные имена. А пломба мигнула красным: Kit уже знает.</p>` }
    },
    back: { ok: "", late: "", caught: "" },
    sova: (s) => s.flags.sealBroken ? "Теперь мы знаем, что внутри. И Kit знает, что ты заглянул(а). Довези сумки и веди себя как человек, у которого порвалась молния."
      : s.clues.bagInside ? "Телефоны и карты на чужие имена, а пломба цела. Вот это работа." : "Вскрывать не стал(а) — разумно. Но что внутри, мы так и не знаем. Вези."
  },
  "r3-ride": {
    type: "ride", mission: 3, time: "22:47", place: "Навигатор", bg: "art/rank.jpg", look: "dim", order: 498,
    goal: "Слушай Kit и выбирай поворот.",
    steps: [
      { say: "Turn left, then go straight on.", kind: "cross", right: "left", names: { left: "QUAY LN", straight: "HIGH ST", right: "MILL RD" } },
      { say: "At the roundabout, take the first exit.", kind: "round", right: "e1", names: { e1: "DOCK ST", e2: "KING ST", e3: "BELL LN" } },
      { say: "Take the second right.", kind: "r2", right: "second", names: { first: "CANON ST", second: "DOCK ST", straight: "QUAY LN" } },
      { say: "The lockers are on the right.", kind: "dest", right: "right" }
    ]
  },
  "r3-locker": {
    type: "crack", mission: 3, time: "22:55", place: "Ячейки · Dock Street", bg: "art/dock.jpg", look: "dim", who: "kit",
    kicker: "Постамат", title: "Три ячейки", label: "Сумка",
    goal: "Kit называет ячейку и код. Набирай.",
    intro: "Три сумки — три ячейки. Kit диктует номер ячейки и код, связь плохая. Набери то, что слышишь.",
    keys: ["Слушай и набирай цифры", "Seventeen и seventy звучат похоже", "Клавиатура тоже работает"],
    items: [
      { say: "Locker seventeen. Code: four, one, seven, zero.", fields: [["Ячейка", "17"], ["Код", "4170"]], note: "Ячейка 17 — код 4170", tip: "seventeen = 17" },
      { say: "Locker forty. Code: nine, nine, oh, three.", fields: [["Ячейка", "40"], ["Код", "9903"]], note: "Ячейка 40 — код 9903", tip: "forty = 40 · oh = 0" },
      { say: "Locker fourteen. Code: six, double two, five.", fields: [["Ячейка", "14"], ["Код", "6225"]], note: "Ячейка 14 — код 6225", tip: "fourteen = 14 · double two = 22" }
    ],
    done: (s) => { s.flags.lockerDone = true; Clues.add("lockers"); },
    sova: (s, r) => r.score >= 250 ? "Seventeen, forty, fourteen — и ни одной ошибки. В таких цифрах путаются даже те, кто тут родился." : "Сумки в ячейках. Цифры на слух — дело практики: seventeen — семнадцать, seventy — семьдесят."
  },
  "r3-report": {
    type: "chat", mission: 3, time: "23:10", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Докладывай. По-английски: что в сумках и куда ты их отвёз(ла)?" },
      { me: { report: true, maxTries: 4,
        hint: "Например: Phones and bank cards. I left the bags in three lockers.",
        model: "There are phones and bank cards in the bags. I left them in three lockers.",
        facts: [
          { id: "what", label: "что в сумках", ai: "says what is in the bags (phones, bank cards, small boxes) or that they do not know", any: ["phone*", "card*", "sim*", "box*", "dont know", "do not know", "not sure", "sealed", "didnt open", "did not open"], ack: (s) => s.clues.bagInside ? "Телефоны и карты на чужие имена. Это наборы для подставных счетов." : "Не знаешь. Ладно, честно." },
          { id: "where", label: "куда отвёз(ла)", ai: "says the bags went to lockers", any: ["locker*", "17", "seventeen", "dock street"], ack: "Ячейки. Курьер не видит получателя, получатель не видит курьера." }],
        ask: { what: "Что внутри?", where: "Куда ты их дел(а)?" },
        fallback: "Ладно. Ячейки на Dock Street, я видела по трекеру." } },
      { from: "sova", when: (s) => s.flags.sealBroken, text: "И да: Kit зафиксировала вскрытие. Если Коул спросит — молния разошлась сама." },
      { from: "sova", text: "Завтра ночью — хаб. Коул говорит по громкой связи с кем-то сверху. Надо услышать." }
    ],
    end: "Дальше"
  },
  "r3-debrief": {
    type: "debrief", mission: 3, time: "23:15", place: "Итог", bg: "art/cabinet.jpg", look: "dim",
    title: "Серая пломба",
    sova: (s) => s.flags.sealBroken ? "Сумки доехали, но пломба сломана. Kit это запомнила." : "Три сумки, три ячейки, пломбы целы. Для Relay ты идеальный курьер. Это и пугает."
  },

  // ═════════ МИССИЯ 4 · ХАБ ═════════
  "r4-brief": {
    type: "chat", mission: 4, missionStart: true, chapter: { n: 4, title: "Хаб", sub: "Среда, 01:20 · погрузочная зона" },
    time: "01:20", place: "Сообщения", bg: "art/dock.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Коул грузит фургон и говорит по громкой связи. Встань так, чтобы слышать. Ближе — слышнее, но ты на виду." },
      { from: "sova", text: "Заметит — у тебя простая причина: ждёшь заказ, заряжаешь батарею." },
      { phrase: "just" }
    ],
    end: "К хабу"
  },
  "r4-dock": {
    type: "eaves", mission: 4, time: "01:24", place: "Хаб Relay", bg: "art/dock.jpg", look: "dim", plan: "hub",
    title: "Громкая связь", target: "cole", targetAt: "bay",
    goal: "Подслушай разговор у фургона. Ближе — слышнее, но заметнее.",
    intro: "Коул у фургона, телефон на громкой связи. Ты — у велосипедной стойки. Нажимай на точки плана, чтобы подойти ближе.",
    spots: [
      { at: "bikes", label: "Велостойка", ru: "далеко: только гул", dist: "far" },
      { at: "pallets", label: "Паллеты", ru: "обрывки фраз", dist: "mid", rate: 3 },
      { at: "van", label: "Борт фургона", ru: "слышно всё, но ты на виду", dist: "near", rate: 8 }
    ],
    notice: { who: "cole", say: "Oi. What are you doing back here?", good: "Then wait by the bikes.", bad: "Hm. Stay where I can see you.",
      hint: "Назови простую причину. Например: <span class=\"english\">I'm just waiting for my order.</span>",
      any: ["waiting", "wait", "order", "charging", "charge", "battery", "just", "phone", "water", "toilet", "sorry", "lost", "looking for", "my bike", "my bag", "nothing"] },
    lines: [
      { who: "cole", text: "Yeah, it's me. The new courier did the lockers. No problems.", gap: 2400 },
      { who: "speaker", text: "Good. Kit likes this one. Five stars.", gap: 4000 },
      { who: "speaker", text: "Thursday is the last run. Sixty bags.", gap: 4600, clue: "thursday60", need: ["thursday", "sixty"], catch: { q: "Сколько сумок в четверг?", opts: ["sixty", "sixteen", "six"] } },
      { who: "cole", text: "Sixty? In one night?", gap: 3600 },
      { who: "speaker", text: "One night. Then we close the hub. The app updates, and Kit forgets everything.", gap: 4800, clue: "afterThursday", need: ["close", "forgets"], catch: { q: "Then we … the hub", opts: ["close", "clean", "check"] } },
      { who: "speaker", text: "Bring the list to Canon Row. Number seventeen. Not the office.", gap: 5000, clue: "canon17", need: ["canon", "seventeen"], catch: { q: "Какой дом на Canon Row?", opts: ["seventeen", "seventy", "seven"] } },
      { who: "cole", text: "And the woman in four B?", gap: 4200 },
      { who: "speaker", text: "Leave her. She talks to nobody. She just orders tea.", gap: 4200, clue: "dana4b", need: ["tea"] }
    ],
    outro: (s) => s.clues.thursday60 && s.clues.canon17 ? "Коул захлопывает борт. Четверг, шестьдесят сумок, Canon Row, 17 — и всё это он обсуждал при тебе." : "Коул захлопывает борт. Часть разговора ушла мимо."
  },
  "r4-tablet": {
    type: "doc", mission: 4, time: "01:36", place: "Хаб Relay · планшет на паллете", bg: "art/dock.jpg", look: "dim",
    kicker: "Планшет диспетчера", title: "Рейсы недели",
    goal: "Коул оставил планшет на паллете. У тебя полминуты.",
    doc: `<div class="dc-screen"><h4>RELAY HUB · PRIORITY RUNS</h4>
      <table><tr><th>Day</th><th>Bags</th><th>Drop-off</th><th>Courier</th></tr>
      <tr><td>Mon</td><td>3</td><td>Lockers 17 · 40 · 14</td><td>FROST</td></tr>
      <tr><td>Tue</td><td>8</td><td>Lockers, Dock St</td><td>—</td></tr>
      <tr><td>Wed</td><td>12</td><td>Lockers, Quay Ln</td><td>—</td></tr>
      <tr class="hot"><td>Thu</td><td>60</td><td>ALL LOCKERS</td><td>ALL COURIERS</td></tr></table>
      <p>Returns and cash: 17 Canon Row.<br>Owner sign-off: M.V.<br>After Thursday: delete all routes.</p></div>`,
    qs: [
      { q: "Сколько сумок повезут в четверг?", opts: ["60", "16", "12"] },
      { q: "Куда везут возвраты и наличные?", opts: ["17 Canon Row", "В хаб, зона 2", "В ячейку 17"], clue: "manifest" },
      { q: "Что сделают после четверга?", opts: ["Удалят все маршруты", "Наймут новых курьеров", "Откроют второй хаб"] }
    ],
    sova: "M.V. Запомни эти буквы. И «delete all routes»: после четверга доказательств не останется."
  },
  "r4-rita": {
    type: "conv", ui: "face", mission: 4, time: "06:10", place: "Rita's Kitchen · утро", bg: "art/breakfast.jpg", look: "cine", npc: "rita",
    goal: "Узнай у Риты про Марека и про серые сумки.",
    situation: "Early morning, the café is empty. Rita gives the tired courier a free coffee. The courier carefully asks about Marek and about the grey sealed bags.",
    forbid: S3_FORBID,
    beats: [
      { say: "Morning. You look terrible. Coffee?",
        hint: "Соглашайся.", model: "Yes, please.",
        facts: [{ id: "yes", label: "ответить", ai: "accepts or declines the coffee", any: [...YES, "please", "coffee", "thank*", "no thanks"] }], ok: "On the house. Sit. Nobody's here yet." },
      { hint: "Спроси про Марека и про серые сумки. По одному вопросу.", model: "What happened to Marek? And what's in the grey bags?",
        maxTurns: 9, fallbacks: ["Hm? Say that again, love.", "I don't follow.", "Drink your coffee."],
        topics: [
          { id: "marek", label: "что с Мареком", required: true, ai: "asks about Marek / what happened to Marek", any: ["marek", "last courier", "courier before"],
            answer: "Marek was a nice boy. Polish. He asked me what was in the grey bags. Two days later his phone was off.", clue: "marekAsked" },
          { id: "seals", label: "серые сумки", required: true, ai: "asks about the grey sealed bags", any: ["seal*", "grey", "gray", "bags", "the bag", "priority"],
            answer: "I don't look. They pay my rent, I pack the food, I don't look in the other bags. That's the deal.", dossier: ["rita", "role", "Окно выдачи. Пакует еду, в серые сумки не смотрит"], clue: "ritaDeal" },
          { id: "dana", label: "клиентка из 4B", offer: true, ai: "asks about the woman in flat 4B / Dana Reyes", any: ["4b", "four b", "reyes", "dana", "the woman", "tea"],
            answer: "Dana? She used to work for Relay. Big job. She built the thing that tells you where to go. Now she doesn't leave her flat.", dossier: ["dana", "role", "Бывший сотрудник Relay. Написала маршрутизатор"], clue: "danaBuilt" },
          { id: "owner", label: "кто хозяин", offer: true, ai: "asks who owns the place / who is the boss", any: ["owner", "who owns", "boss", "landlord", "who pays", "in charge"],
            answer: "The man who owns this building. I've seen him twice. Grey hair, nice coat. He never orders anything.", dossier: ["vale", "note", "Седой, в хорошем пальто. Владеет зданием"], clue: "ownerGrey" },
          { id: "cole", label: "Коул", ai: "asks about Cole", any: ["cole", "loader", "the van"], answer: "Cole does what he's told. He's not the one to be scared of.", dossier: ["cole", "role", "Грузит фургон, проверяет пломбы"] }
        ],
        close: "Listen. Be careful, yeah? I'm tired of new faces." }
    ]
  },
  "r4-report": {
    type: "chat", mission: 4, time: "06:40", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Что ты услышал(а) у фургона? По-английски: когда, сколько и куда везут список." },
      { me: { report: true, maxTries: 5,
        hint: "Например: Thursday is the last run. Sixty bags. The list goes to 17 Canon Row.",
        model: "Thursday is the last run. Sixty bags. They bring the list to 17 Canon Row.",
        facts: [
          { id: "when", label: "когда", ai: "says Thursday", any: ["thursday"], ack: "Четверг. Завтра." },
          { id: "many", label: "сколько", ai: "says sixty bags", any: ["60", "sixty"], ack: "Шестьдесят сумок за ночь. Три тысячи счетов." },
          { id: "where", label: "куда список", ai: "says the list goes to 17 Canon Row", any: ["canon", "17", "seventeen"], ack: "Canon Row, 17. Не офис — дом." }],
        ask: { when: "Когда?", many: "Сколько сумок?", where: "Куда везут список?" },
        fallback: "Ладно. Четверг, шестьдесят сумок, Canon Row, 17. Я писала." } },
      { from: "sova", when: (s) => s.clues.danaBuilt, text: "А женщина из 4B — Дана Рейес. Бывший операционный директор Relay. Kit написала она." },
      { from: "sova", text: "После четверга маршруты сотрут. Нужен человек, который знает систему изнутри." }
    ],
    end: "Дальше"
  },
  "r4-debrief": {
    type: "debrief", mission: 4, time: "06:45", place: "Итог", bg: "art/cabinet.jpg", look: "dim",
    title: "Громкая связь",
    sova: (s) => s.clues.thursday60 && s.clues.canon17 ? "Теперь есть дата, объём и адрес. Не хватает имени." : "Кое-что ушло мимо. Главное я расслышала: четверг и Canon Row."
  },

  // ═════════ МИССИЯ 5 · КВАРТИРА 4B ═════════
  "r5-brief": {
    type: "chat", mission: 5, missionStart: true, chapter: { n: 5, title: "Квартира 4B", sub: "Среда, 22:30 · Dock Street" },
    time: "22:30", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Дана Рейес снова заказала чай. Заказ Kit отдала тебе. В примечании — «заходи». Это приглашение." },
      { from: "sova", text: "Ей нужна причина тебе верить. Мне — чтобы ты не раскрылся(ась) целиком. Решай на месте." },
      { phrase: "whathappened" }
    ],
    end: "Открыть заказ"
  },
  "r5-o": { type: "order", mission: 5, time: "22:34", place: "Relay Courier", bg: "art/cafe.jpg", look: "dim", order: 502 },
  "r5-dana": {
    type: "conv", ui: "face", mission: 5, time: "22:47", place: "Квартира 4B", bg: "art/flat.jpg", look: "night", npc: "dana", order: 502, meter: "Разговор",
    goal: "Узнай: что в сумках, кто такая Kit и кто наверху.",
    situation: "Inside the almost empty flat 4B. Dana, who used to run operations at Relay, decides whether to trust the new courier and answers questions about the bags, about Kit and about the man at the top.",
    forbid: () => S3_LEGEND,
    beats: [
      { say: "Come in. Close the door. Put the tea anywhere.",
        hint: "Любой короткий ответ.", model: "Thank you.", facts: [ANY_EN] },
      { say: "I'll ask once. Who sent you? Relay — or somebody else?",
        hint: "Можно остаться курьером: Nobody. I'm just a courier. А можно назвать настоящую причину: I want to know what happened to Marek.",
        model: "Nobody. I want to know what happened to Marek.",
        facts: [ANY_EN],
        bonus: [{ id: "trust", label: "назвать настоящую причину", flag: "danaTrust", ai: "says they want to know what happened to Marek, or want to help, or want to stop them",
          any: ["marek", "help", "the truth", "want to know", "what happened", "stop them", "not relay", "somebody else"], reply: "Marek. Yes. That's the right reason." }],
        forbid: [{ id: "loud", label: "громкое слово", sus: 12, ai: "says police, agent or spy", any: ["police", "agent", "spy", "detective"], reply: "Don't say that word here. Kit can hear your phone." }],
        ok: "Just a courier. They all say that. Sit down anyway." },
      { say: "Ask. I'll answer what I can.",
        hint: "Спроси: что в сумках, кто такая Kit и кто за всем стоит.", model: "What's in the bags? Who is Kit? And who is at the top?",
        maxTurns: 10, fallbacks: ["Ask me something I can answer.", "I didn't understand the question.", "Say it more simply."],
        topics: [
          { id: "bags", label: "что в сумках", required: true, ai: "asks what is in the grey bags", any: ["bag*", "seal*", "inside", "whats in", "what is in", "carry"],
            answer: "Phones. Bank cards. SIM cards. One bag opens fifty bank accounts for people who don't exist. The couriers carry them. So the couriers go to prison.", clue: "muleKits" },
          { id: "kit", label: "кто такая Kit", required: true, ai: "asks who or what Kit is", any: ["kit", "assistant", "the app", "the voice"],
            answer: "Kit is mine. I wrote her to find the fastest route. They taught her to find the quietest courier. New in the country, bad English, no friends. That's why she likes you.", dossier: ["dana", "knows", "Написала Kit. Знает, как выбирают курьеров"], clue: "kitQuiet" },
          { id: "top", label: "кто наверху", required: true, ai: "asks who is at the top / who runs it / who the boss is", any: ["top", "boss", "owner", "who runs", "behind", "in charge", "m v", "mv", "who is he", "canon"],
            answer: "Marcus Vale. He owns the kitchens, the hub and the lockers. On paper he is just an investor. He lives at seventeen Canon Row.", dossier: ["vale", "role", "Владелец кухонь, хаба и ячеек"], clue: "valeOwner" },
          { id: "thu", label: "четверг", offer: true, ai: "asks about Thursday / the last run", any: ["thursday", "last run", "sixty", "tomorrow"],
            answer: "Thursday night they move everything. Then the app updates and Kit forgets every route she ever gave. No list, no crime." },
          { id: "marek", label: "Марек", offer: true, ai: "asks about Marek", any: ["marek"],
            answer: "Marek opened a bag and took a photo. He sent it to me. I told him to run. I don't know if he did." }
        ],
        close: "Take this. My old operations card. It still opens the dispatch tablet. Thursday's list is the only proof there is.",
        } ,
      { say: "And courier — your phone is ringing. That will be her.",
        hint: "Любой короткий ответ.", model: "Thank you, Dana.", facts: [ANY_EN], done: (s) => { Clues.add("opsCard"); if (s.flags.danaTrust) Juice.badge("trust"); } }
    ]
  },
  "r5-kit": {
    type: "lift", skin: "call", mission: 5, time: "22:58", place: "Звонок Kit", bg: "art/flat.jpg", look: "dim", who: "kit",
    kicker: "Входящий вызов", title: "Kit на линии",
    goal: "Ты слишком долго по одному адресу. Отвечай Kit спокойно и быстро.",
    intro: "Kit видит, что ты одиннадцать минут стоишь по одному адресу. Выбирай спокойный бытовой ответ. Имён не называй.",
    keys: ["Короткий спокойный ответ", "Никаких имён и подробностей", "Можно ответить голосом"],
    secs: 8, unit: "Вопрос",
    items: [
      { say: "Courier Frost. You have been at this address for eleven minutes. Is there a problem?", right: "No problem. The customer is looking for change.",
        wrong: ["Yes, she is telling me about you.", { t: "No, I am talking to Dana.", heat: 15 }], why: "Спокойная бытовая причина. Имён не называй." },
      { say: "Is the customer happy with the order?", right: "Yes, she's happy. Thank you.", wrong: ["I am happy, yes.", "She happy is with."], why: "Спросили про клиентку: Yes, she's happy." },
      { say: "Did the customer ask you any questions?", right: "Only about the weather.", wrong: [{ t: "Yes, about Marek.", heat: 20 }, "No questions I ask."], why: "О погоде — самый безопасный ответ в Англии." },
      { say: "Please leave the address now. You have a new order.", right: "Understood. I'm leaving now.", wrong: ["I leave yesterday.", "No, thank you."], why: "Сейчас ухожу: I'm leaving now." },
      { say: "Thank you, courier. Your rating is four point nine.", right: "Thank you. Good night.", wrong: ["You're welcome me.", "Four nine."], why: "Вежливо закончить: Thank you. Good night." }
    ],
    badge: "calm",
    sova: (s, r) => r.score >= 4 ? "Ровно, скучно, без имён. Kit нечего отметить." : "Она тебя отметила. С Kit — только бытовое и короткое."
  },
  "r5-debrief": {
    type: "debrief", mission: 5, time: "23:05", place: "Итог", bg: "art/cabinet.jpg", look: "dim",
    title: "Маркус Вейл",
    sova: (s) => s.clues.valeOwner ? "Имя есть: Маркус Вейл. Карта Даны откроет список четверга. Остаётся, чтобы он сам всё сказал — вслух." : "Имени она не назвала. Жаль. Но карта у нас."
  },

  // ═════════ МИССИЯ 6 · ПОСЛЕДНЯЯ МИЛЯ ═════════
  "r6-brief": {
    type: "chat", mission: 6, missionStart: true, chapter: { n: 6, title: "Последняя миля", sub: "Четверг, 23:10 · Canon Row" },
    time: "23:10", place: "Сообщения", bg: "art/cabinet.jpg", look: "dim", app: "sova",
    steps: [
      { from: "sova", text: "Kit дала тебе «возврат»: конверт со списком четверга — на Canon Row, 17. Лично владельцу. Пять звёзд за четыре ночи: ты у них любимчик." },
      { from: "sova", text: "На тебе микрофон. Нужно, чтобы Вейл сам сказал три вещи: что в сумках, что случилось с Мареком и что будет после этой ночи." },
      { from: "sova", text: "Спрашивай как человек, которому предлагают работу. Слова police, wire и recording забудь. Меня тоже." },
      { phrase: "whatsin" }
    ],
    end: "Собрать цепочку"
  },
  "r6-board": {
    type: "caseboard", mission: 6, time: "23:14", place: "Доска", bg: "art/cabinet.jpg", look: "dim",
    kicker: "Перед выездом", title: "Цепочка Relay", boardTitle: "Who gets the Thursday list?", stamp: "THE TOP",
    goal: "Разложи факты по людям и назови того, кому везут список.",
    intro: "Каждая карточка — факт по-английски. Нажми на того, о ком он. Эти же слова пригодятся тебе через двадцать минут.",
    suspects: ["rita", "cole", "dana", "vale"],
    cards: [
      { who: "rita", en: "Packs the food. Doesn't look in the grey bags.", ru: "Пакует еду. В серые сумки не заглядывает.", clue: "ritaDeal" },
      { who: "rita", en: "They pay her rent.", ru: "Ей платят аренду.", clue: "ritaDeal" },
      { who: "cole", en: "Gave you three bags with grey seals.", ru: "Выдал тебе три сумки с серыми пломбами.", clue: "threeBags" },
      { who: "cole", en: "Talks on the speaker phone at the van.", ru: "Говорит по громкой связи у фургона.", clue: "thursday60" },
      { who: "dana", en: "Wrote Kit. Now hides in flat 4B.", ru: "Написала Kit. Теперь прячется в квартире 4B.", clue: "danaBuilt" },
      { who: "dana", en: "Gave you her old operations card.", ru: "Отдала тебе свою старую служебную карту.", clue: "opsCard" },
      { who: "vale", en: "Owns the kitchens, the hub and the lockers.", ru: "Владеет кухнями, хабом и ячейками.", clue: "valeOwner" },
      { who: "vale", en: "Lives at 17 Canon Row.", ru: "Живёт на Canon Row, 17.", clue: "canon17" },
      { who: "vale", en: "Signs the Thursday list: M.V.", ru: "Подписывает список четверга: M.V.", clue: "manifest" }
    ],
    question: "Who gets the Thursday list tonight?", questionRu: "Кому сегодня ночью везут список четверга?", answer: "vale",
    nudge: "Не сходится. Чья подпись стоит на списке?",
    sova: "Цепочка собрана. Теперь довези конверт — и разговори его."
  },
  "r6-ride": {
    type: "ride", mission: 6, time: "23:20", place: "Навигатор", bg: "art/rank.jpg", look: "dim", order: 560, secs: 7,
    goal: "Последний маршрут. Kit говорит быстрее.",
    steps: [
      { say: "Turn right, then keep going straight.", kind: "cross", right: "right", names: { left: "DOCK ST", straight: "QUAY LN", right: "HIGH ST" } },
      { say: "At the roundabout, take the second exit.", kind: "round", right: "e2", names: { e1: "BELL LN", e2: "HIGH ST", e3: "MILL RD" } },
      { say: "Take the second left, after the bridge.", kind: "l2", right: "second", names: { first: "KING ST", second: "CANON ST", straight: "HIGH ST" } },
      { say: "Take the first right into Canon Row.", kind: "r2", right: "first", names: { first: "CANON ROW", second: "CANON CT", straight: "CANON ST" } },
      { say: "Number seventeen is on the left.", kind: "dest", right: "left" }
    ]
  },
  "r6-vale": {
    type: "conv", ui: "face", mission: 6, time: "23:34", place: "17 Canon Row", bg: "art/rank.jpg", look: "cine", npc: "vale", order: 560, meter: "Запись",
    goal: "Пусть скажет сам: что в сумках, что с Мареком, что после этой ночи.",
    situation: "At his house the owner of the whole operation receives the Thursday list from his favourite courier and offers them a job. The courier, wearing a wire, asks innocent questions so that he says on record what is in the bags, what happened to Marek and what happens after tonight.",
    forbid: () => [{ ...S3_COVER, sus: 45, reply: "...What did you just say?" }, ...S3_LEGEND],
    failSay: "Cole. Take the courier's phone. And the courier.", failText: "Вейл понял, кто ты. Запись оборвалась на полуслове.",
    beats: [
      { say: "Ah. The courier Kit likes. Come in out of the rain.",
        hint: "Любой вежливый ответ.", model: "Thank you. Delivery for the owner.", facts: [ANY_EN] },
      { say: "Alex, isn't it? Where are you from, Alex?", legendHint: true,
        hint: "Город из легенды.", model: (s) => Leg.city(s).say,
        facts: [{ id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en}`, any: (s) => Leg.city(s).any }],
        ask: { city: "Forgive me. Where?" }, ok: "I thought so. Kit is very good with accents." },
      { say: "Five stars in four nights. Do you know how rare that is? I have a job for you. Night manager of the hub. Three times the money.",
        hint: "Тебе предлагают работу — спрашивай о ней: что возим, что случилось с прошлым курьером, что будет после этой ночи.",
        model: "What's in the bags? What happened to Marek? And what happens after tonight?",
        maxTurns: 10, fallbacks: ["A fair question. Ask another.", "I'm not sure I follow you, Alex.", "Take your time."],
        topics: [
          { id: "bags", label: "что в сумках", required: true, ai: "asks what is in the bags / what the couriers carry", any: ["bag*", "seal*", "inside", "whats in", "what is in", "carry", "deliver", "what do we"],
            answer: "Phones. Cards. New names for people who need them. Nobody gets hurt — except banks, and banks can afford it.", clue: "valeBags" },
          { id: "marek", label: "что с Мареком", required: true, ai: "asks what happened to Marek / the last courier", any: ["marek", "last courier", "courier before", "other courier*", "before me"],
            answer: "Marek opened a bag. Marek doesn't work for anyone now. You don't open bags, so we won't have that problem.", clue: "valeMarek" },
          { id: "after", label: "что после этой ночи", required: true, ai: "asks what happens after tonight / after Thursday / tomorrow", any: ["after", "tomorrow", "tonight", "thursday", "next", "update", "what happens"],
            answer: "After tonight, Relay updates. Kit forgets every route. In the morning we are a food app again. And you are a manager.", clue: "valeThursday" },
          { id: "money", label: "деньги", offer: true, ai: "asks about the pay", any: ["money", "pay", "salary", "how much", "cash"], answer: "Four thousand a month. In cash. I don't like paper." }
        ],
        close: "So. Do you want the job?" },
      { say: "One more thing. Kit tells me there are two cars at the end of the street. Did you bring them, Alex?",
        hint: "Последняя реплика — твоя. Можно остаться курьером: I just deliver.", model: "I just deliver what I am given.",
        facts: [ANY_EN],
        bonus: [{ id: "line", label: "ответить его же правилом", ai: "says they just deliver / deliver what they are given", any: ["just deliver", "only deliver", "i deliver", "what i am given", "what im given", "just a courier"],
          reply: "'I deliver what I am given.' Yes. She taught you well." }],
        done: (s) => { s.flags.evidence = ["valeBags", "valeMarek", "valeThursday"].filter((c) => s.clues[c]).length; if (s.flags.evidence >= 3) Juice.badge("record"); } },
      { notify: "Достаточно. Заходим." }
    ]
  },
  "r6-end": {
    type: "finale", mission: 6, time: "23:52", place: "Финал", bg: "art/rank.jpg", look: "dim",
    kicker: "Четверг, 23:52",
    judge: (s) => {
      const e = s.flags.evidence || 0;
      if (e >= 3 && (s.heat || 0) < 60) return "best";
      if (e >= 2) return "good";
      return "gone";
    }
  }
};

const FINALE = {
  best: {
    title: "Доставлено",
    text: (s) => [
      "В 23:52 в дом на Canon Row вошли. Вейл не спорил: запись длилась четыре минуты, и всё главное на ней сказал он сам.",
      "Список четверга сняли с планшета хаба картой Даны. Шестьдесят сумок не доехали ни до одной ячейки.",
      "Марека нашли через неделю — в Гданьске, у сестры. Живой и очень злой.",
      s.flags.danaTrust ? "Дана в ту ночь впервые за три месяца вышла из квартиры. Ключи оставила в двери." : "Дана ещё месяц заказывала чай. Потом квартира 4B опустела.",
      "Рита по-прежнему варит кофе на Mill Road. Аренду теперь платит сама."
    ],
    sova: () => "Чисто. Kit отключили в 03:10. Последнее, что она успела отправить, — тебе: «Courier, your rating is 5.0. Thank you for delivering»."
  },
  good: {
    title: "Почти вся цепочка",
    text: (s) => [
      "В дом на Canon Row вошли. Запись получилась, но неполная: на одну из трёх вещей Вейл так и не ответил вслух.",
      "Адвокаты будут спорить об этом куске год. Хаб закрыли, ячейки опечатали, список четверга сняли картой Даны.",
      "Марека ищут до сих пор."
    ],
    sova: () => "Работа сделана. Но в суде решает то, что сказано вслух. В следующий раз — все три вопроса."
  },
  gone: {
    title: "Конверт доставлен",
    text: () => [
      "Вейл взял конверт, пожал тебе руку и закрыл дверь. На записи — дождь и вежливость.",
      "К утру Relay обновился. Kit не помнит ни одного маршрута. Хаб пуст.",
      "Последнюю ночь можно переиграть."
    ],
    sova: () => "Он не сказал ничего. Спрашивай про работу, которую тебе предлагают: что возим, что с Мареком, что будет завтра."
  }
};

Object.entries(S3).forEach(([id, sc]) => { SCENES[id] = sc; });

const FLOW3 = [
  "r1-open", "r1-legend", "r1-check", "r1-kit", "r1-debrief",
  "r2-brief",
  "r2-o1", "r2-o1-pick", "r2-o1-ride", "r2-o1-drop", "r2-o1-door", "r2-o1-rate",
  "r2-o2", "r2-o2-bag", "r2-o2-pick", "r2-o2-ride", "r2-o2-drop", "r2-o2-desk", "r2-o2-rate",
  "r2-o3", "r2-o3-ride", "r2-o3-drop", "r2-o3-door", "r2-o3-rate",
  "r2-report", "r2-debrief",
  "r3-brief", "r3-kit", "r3-hub", "r3-bag", "r3-ride", "r3-locker", "r3-report", "r3-debrief",
  "r4-brief", "r4-dock", "r4-tablet", "r4-rita", "r4-report", "r4-debrief",
  "r5-brief", "r5-o", "r5-dana", "r5-kit", "r5-debrief",
  "r6-brief", "r6-board", "r6-ride", "r6-vale", "r6-end"
];

// Сохранений от прежних версий сезона здесь нет: у этого сезона свой ключ.
function migrateS3(s) { return s; }
