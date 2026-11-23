// Сезон «Онбординг». Кремниевая долина (Сан-Франциско), стартап Murmur, крот внутри, сделка в пятницу. Мультяшный: рисованные лица и фоны, свои цвета (js/toon.js).
// Здесь только содержание. Движок общий с другими сезонами (js/packs.js); люди и словарь сезона подключаются, только пока он открыт.
// Вся английская речь — короткая, уровень A2. Русский — только у Совы и в подсказках.

const OFFICE = (() => {
  const people = {
    sova: { name: "Сова", role: "куратор", lang: "ru", gender: "f", face: "owl", img: "art/office/p-sova-calm.jpg",
      voice: { g: "f", pitch: 1, rate: 1.05, prefer: ["Svetlana", "Dariya", "Irina", "ru-RU"], cloud: "sage", style: "Dry, ironic female handler. Speaks Russian." } },
    priya: { name: "Priya", role: "People Lead, Murmur", gender: "f", img: "art/office/p-priya-calm.jpg",
      faces: { calm: "art/office/p-priya-calm.jpg", happy: "art/office/p-priya-happy.jpg", wow: "art/office/p-priya-happy.jpg", sus: "art/office/p-priya-sus.jpg", hm: "art/office/p-priya-sus.jpg", angry: "art/office/p-priya-sus.jpg", sad: "art/office/p-priya-sus.jpg" },
      face: { skin: "#a8714f", hair: "#1b1210", style: "long", wear: "blazer", top: "#d94f7c", earrings: "#fff1b8", bg: "#ffd23f", brows: "up" },
      voice: { g: "f", pitch: 1.04, rate: 1.02, prefer: ["Neerja", "en-IN", "Libby", "Aria", "Jenny", "Samantha"], cloud: "shimmer", style: "Energetic HR lead, friendly, a bit corporate." } },
    grace: { name: "Grace", role: "офис-менеджер, Murmur", gender: "f", img: "art/office/p-grace-calm.jpg",
      faces: { calm: "art/office/p-grace-calm.jpg", happy: "art/office/p-grace-happy.jpg", wow: "art/office/p-grace-happy.jpg", sus: "art/office/p-grace-sus.jpg", hm: "art/office/p-grace-sus.jpg", angry: "art/office/p-grace-worried.jpg", sad: "art/office/p-grace-worried.jpg", worried: "art/office/p-grace-worried.jpg" },
      face: { skin: "#f0c8a6", hair: "#c7a77a", style: "bob", wear: "cardigan", top: "#4d7aa8", glasses: "#6b4a2b", bg: "#7ee6c4", lips: "#b5655a" },
      voice: { g: "f", pitch: 1, rate: 1, prefer: ["Sonia", "Hazel", "UK English Female", "Maisie", "Susan", "en-GB"], cloud: "coral", style: "Warm, chatty California office manager in her fifties." } },
    tom: { name: "Tom", role: "IT, Murmur", gender: "m", img: "art/office/p-tom-calm.jpg",
      faces: { calm: "art/office/p-tom-calm.jpg", happy: "art/office/p-tom-happy.jpg", wow: "art/office/p-tom-happy.jpg", sus: "art/office/p-tom-sus.jpg", hm: "art/office/p-tom-sus.jpg", angry: "art/office/p-tom-sus.jpg", sad: "art/office/p-tom-calm.jpg" },
      face: { skin: "#ecc4a2", hair: "#9a4a22", style: "messy", wear: "hoodie", top: "#4a4f9e", beard: "#9a4a22", bg: "#9db8ff", brows: "grumpy", mood: "flat" },
      voice: { g: "m", pitch: 0.95, rate: 1, prefer: ["Connor", "en-IE", "Ryan", "George", "UK English Male"], cloud: "onyx", style: "Grumpy Irish IT guy, dry humour." } },
    max: { name: "Max", role: "продажи, Murmur", gender: "m", img: "art/office/p-max-calm.jpg",
      faces: { calm: "art/office/p-max-calm.jpg", happy: "art/office/p-max-happy.jpg", wow: "art/office/p-max-happy.jpg", sus: "art/office/p-max-sus.jpg", hm: "art/office/p-max-sus.jpg", angry: "art/office/p-max-sus.jpg", sad: "art/office/p-max-sus.jpg" },
      face: { skin: "#c99068", hair: "#2a1a10", style: "quiff", wear: "shirt", top: "#eef1f4", beard: "#2a1a10", stubble: true, bg: "#ff9f6b" },
      voice: { g: "m", pitch: 1.03, rate: 1.06, prefer: ["William", "en-AU", "Guy", "Christopher", "David"], cloud: "echo", style: "Charming Australian salesman, fast and friendly." } },
    dev: { name: "Dev", role: "диспетчер SwiftBox", gender: "m", img: "art/office/p-dev-calm.jpg",
      faces: { calm: "art/office/p-dev-calm.jpg", happy: "art/office/p-dev-happy.jpg", wow: "art/office/p-dev-happy.jpg", sus: "art/office/p-dev-calm.jpg", hm: "art/office/p-dev-calm.jpg" },
      face: { skin: "#8f5d3d", hair: "#121212", style: "buzz", wear: "vest", top: "#f3a712", beard: "#121212", stubble: true, bg: "#7fd8e8", headset: true },
      voice: { g: "m", pitch: 1, rate: 1.05, prefer: ["Prabhat", "Thomas", "Ryan", "UK English Male", "en-GB"], cloud: "ash", style: "Busy San Francisco courier dispatcher on the phone." } },
    you: { name: "Вы", role: "Alex Frost", face: "self", img: "art/office/p-you-calm.jpg", voice: { g: "m" } }
  };

  const glossary = {
    murmur: "Мёрмур (компания); бормотание", hiya: "привет", "nice to meet you": "приятно познакомиться",
    "can you hear me": "вы меня слышите?", okay: "нормально, хорошо", lead: "руководить", people: "люди; отдел кадров",
    "office manager": "офис-менеджер", "tell us": "расскажите нам", "a little bit": "немного", yourself: "себя, о себе",
    lovely: "чудесно", "never been": "никогда не была", "how long": "как долго", "san francisco": "Сан-Франциско",
    "get lost": "заблудиться", caltrain: "пригородный поезд в Кремниевой долине", "i bet": "спорим, наверняка", job: "работа",
    "office assistant": "офис-ассистент", deliveries: "доставки", meetings: "встречи", "a bit of everything": "всего понемногу",
    "why do you want": "почему вы хотите", practical: "практический", courier: "курьер", "in a meeting": "на встрече",
    literally: "буквально", "one second": "секунду", "friday's fine": "пятница подходит", "half six": "половина седьмого (18:30)",
    "busy week": "напряжённая неделя", classic: "классический", "biggest weakness": "главная слабость", weakness: "слабость",
    honest: "честный", "any questions": "есть вопросы?", "we'd love to have you": "мы будем рады вас взять", "start on monday": "начать в понедельник",
    brilliant: "отлично", "see ya": "пока (разг.)", "the new one": "новенький", laptop: "ноутбук",
    password: "пароль", "sticky note": "стикер", "don't lose it": "не потеряй", "anything else": "что-нибудь ещё?",
    servers: "сервера", server: "сервер", "wi-fi": "вай-фай", "everything people break": "всё, что люди ломают",
    "till ten": "до десяти", update: "обновление", exciting: "увлекательный", badges: "пропуска", badge: "пропуск",
    spare: "запасной", drawer: "ящик стола", "good with computers": "разбираешься в компьютерах", "server room": "серверная",
    "g'day": "привет (австрал.)", "how's the first day going": "как проходит первый день?", "i can't place the accent": "не могу понять, что за акцент",
    "ask me anything": "спрашивай что хочешь", sales: "продажи", "best job in the world": "лучшая работа в мире",
    football: "футбол", match: "матч", "we lost": "мы проиграли", "don't ask": "не спрашивай", "for fun": "для удовольствия",
    surfing: "сёрфинг", "gotta take this": "надо ответить", mate: "приятель", "settling in": "осваиваешься",
    tea: "чай", "coming right up": "сейчас будет", "weren't you": "не так ли? (ведь вы были)", memory: "память",
    "new faces": "новые лица", "the lot": "всё подряд", yoga: "йога", "early night": "рано лечь спать",
    "remind me": "напомни мне", recycling: "переработка, утиль", "you're a star": "ты чудо",
    "stand-up": "стендап, утренняя планёрка", standup: "стендап, утренняя планёрка", blockers: "блокеры, препятствия", blocker: "блокер, препятствие",
    "logs": "журналы, логи", "someone": "кто-то", "find out": "выяснить", "three calls": "три звонка", clients: "клиенты",
    "out from two till four": "отсутствую с двух до четырёх", dentist: "стоматолог", "booking a courier": "заказываю курьера",
    "old laptops": "старые ноутбуки", "crush it": "порвать всех (офисный жаргон)", "wrong chat": "не тот чат", oops: "ой",
    pickup: "забор груза", "pickup confirmed": "забор подтверждён", "deleted": "удалил(а)",
    honestly: "честно говоря", leave: "уйти, уволиться", weird: "странно", interview: "собеседование", "second interview": "второе собеседование",
    "start date": "дата выхода на работу", march: "март", "work phone": "рабочий телефон", "not now": "не сейчас",
    "like we said": "как договорились", "nobody looks inside": "никто не заглядывает внутрь", cash: "наличные",
    "no cards": "никаких карт", banks: "банки", nervous: "нервный", harmless: "безобидный",
    "booking number": "номер заказа", "how can i help": "чем могу помочь?", surname: "фамилия", spell: "произнести по буквам",
    "is that right": "верно?", "delivery to": "доставка по адресу", "new address": "новый адрес",
    "address changes": "смена адреса", "confirmation email": "письмо с подтверждением", "just this once": "только в этот раз",
    "been there": "сам такое проходил", cheers: "спасибо; пока", "taking this box myself": "сама отвезу эту коробку",
    "can't trust couriers": "курьерам нельзя доверять", "night": "спокойной ночи (прощание)", "have a good weekend": "хороших выходных",
    "you're still here": "ты ещё здесь?", "i'm just off": "я как раз ухожу", "go on then": "ну ладно, давай",
    "who are you": "кто ты такой?", partner: "партнёр", "anyone can": "кто угодно может"
  };

  // ───────── легенда ─────────
  const LEGEND = {
    city: {
      riga: { emo: "🐈", en: "Riga", ru: "Рига, Латвия", gen: "Риги", country: "Latvia", lang: "Latvian", langRu: "латышский", any: ["riga", "reega", "rega", "rigo", "latvia*"], say: "I'm from Riga, in Latvia." },
      tallinn: { emo: "🏰", en: "Tallinn", ru: "Таллин, Эстония", gen: "Таллина", country: "Estonia", lang: "Estonian", langRu: "эстонский", any: ["tallinn", "tallin", "talin", "talon", "tallen", "talen", "talling", "talan", "tall in", "telling", "stalin", "thailand", "tailand", "thai land", "estonia*", "stonia*", "astonia*"], say: "I'm from Tallinn, in Estonia." },
      vilnius: { emo: "🎈", en: "Vilnius", ru: "Вильнюс, Литва", gen: "Вильнюса", country: "Lithuania", lang: "Lithuanian", langRu: "литовский", any: ["vilnius", "vilnus", "vilnia*", "venus", "lithuania*"], say: "I'm from Vilnius, in Lithuania." }
    },
    job: {
      hotel: { emo: "🛎️", ru: "администратор отеля", en: "a receptionist in a hotel", short: "receptionist", say: "I worked as a receptionist in a hotel.", any: ["hotel", "reception*"] },
      barista: { emo: "☕", ru: "бариста в кофейне", en: "a barista in a café", short: "barista", say: "I worked as a barista in a café.", any: ["barista", "cafe", "café", "coffee shop", "coffee"] },
      calls: { emo: "🎧", ru: "оператор колл-центра", en: "a call centre operator", short: "call centre", say: "I worked in a call centre.", any: ["call cent*", "call center", "callcent*", "operator", "support"] }
    },
    hobby: {
      running: { emo: "🏃", ru: "бег", short: "running", say: "I like running.", any: ["run", "running", "jog*", "marathon*"], reply: "Running? Mate. I run... to the bar. That's it." },
      cooking: { emo: "🍳", ru: "готовить", short: "cooking", say: "I like cooking.", any: ["cook*", "food", "kitchen", "bake", "baking"], reply: "Cooking! Bring food on Friday and you'll be famous here." },
      chess: { emo: "♟️", ru: "шахматы", short: "chess", say: "I like chess.", any: ["chess"], reply: "Chess? Big brain. Respect, mate." }
    }
  };
  const LEGEND_GROUPS = [["city", "Откуда ты"], ["job", "Кем работал(а) раньше"], ["hobby", "Что любишь"]];

  // ───────── разговорник: фразы-инструменты ─────────
  const PHRASES = [
    { id: "repeat", en: "Sorry, could you repeat that?", ru: "Простите, можете повторить?", use: "Не расслышал(а) — переспроси. Повторят медленнее.", any: ["repeat", "say that again", "say it again", "pardon", "come again", "one more time"] },
    { id: "new", en: "Sorry, I'm new here.", ru: "Простите, я тут новенький(ая).", use: "Тупик? Ты тут первую неделю. Новеньким прощают многое.", any: ["new here", "im new", "i am new", "first day", "first week", "just started", "new in the office"] },
    { id: "from", en: "I'm from …", ru: "Я из …", any: ["im from", "i am from", "i come from"] },
    { id: "worked", en: "I worked as …", ru: "Я работал(а) …", any: ["worked as", "i worked", "i was a", "i used to work"] },
    { id: "nice", en: "Nice to meet you.", ru: "Приятно познакомиться.", any: ["nice to meet", "pleasure to meet", "nice meeting", "good to meet"] },
    { id: "message", en: "Can I take a message?", ru: "Что-нибудь передать?", any: ["take a message", "leave a message"] },
    { id: "mean", en: "What does … mean?", ru: "Что значит …?", use: "Незнакомое слово — спроси. Объяснят простыми словами.", test: (t) => /\bmean(ing)?\b/.test(norm(t)) && /\bwhat/.test(norm(t)) },
    { id: "spell", en: "How do you spell that?", ru: "Как это пишется?", use: "Имя или адрес — попроси по буквам.", any: ["spell"] },
    { id: "howabout", en: "How about you?", ru: "А у вас?", use: "Ответил(а) — спроси в ответ. Так держат разговор.", any: ["how about you", "what about you", "and you", "and yourself"] },
    { id: "whatdo", en: "What do you do here?", ru: "Чем вы тут занимаетесь?", any: ["what do you do", "whats your job", "what is your job", "whats your role", "what is your role"] },
    { id: "fun", en: "Did you do anything fun last week?", ru: "Делали что-нибудь интересное на прошлой неделе?", use: "Мягкий способ узнать, где человек был.", any: ["anything fun", "anything interesting", "how was your week", "how was your weekend", "what did you do"] },
    { id: "yesterday", en: "Yesterday I …", ru: "Вчера я …", any: ["yesterday i"] },
    { id: "today", en: "Today I'm going to …", ru: "Сегодня я собираюсь …", any: ["today im", "today i am", "today i will", "today ill", "im going to", "i am going to"] },
    { id: "noblock", en: "No blockers.", ru: "Никаких проблем (блокеров).", any: ["no blockers", "no blocker", "no problems", "nothing blocking"] },
    { id: "just", en: "I'm just getting some water.", ru: "Я просто за водой.", use: "Застукали рядом — назови простую причину.", any: ["im just", "i am just", "i was just", "just getting", "just looking", "just waiting"] },
    { id: "calling", en: "I'm calling about …", ru: "Я звоню по поводу …", any: ["calling about", "im calling", "i am calling", "calling from"] },
    { id: "change", en: "Could you change the address?", ru: "Можете поменять адрес?", any: ["could you change", "can you change", "change the address", "change the delivery"] },
    { id: "right", en: "Yes, that's right.", ru: "Да, всё верно.", any: ["thats right", "that is right", "thats correct", "that is correct"] },
    { id: "really", en: "Really? / Oh, nice!", ru: "Правда? / О, здорово!", use: "Короткие реакции держат собеседника.", any: ["really", "oh nice", "sounds nice", "sounds good", "sounds great", "how nice", "wow", "oh cool"] },
    { id: "moment", en: "Just a moment, please.", ru: "Минутку, пожалуйста.", any: ["just a moment", "one moment", "one second", "just a second", "hold on"] }
  ];

  // Простые объяснения слов — на случай «What does … mean?»
  const EXPLAIN = {
    people: "People is the team for hiring and staff. Like HR.",
    "people lead": "The People Lead is the boss of HR: hiring, teams, people.",
    "office manager": "The office manager runs the office: deliveries, rooms, everything.",
    "office assistant": "An office assistant helps with everything: phones, post, meetings.",
    caltrain: "Caltrain is the commuter train in Silicon Valley, between San Francisco and San Jose.",
    courier: "A courier brings and takes boxes and letters.",
    weakness: "A weakness is something you are not good at.",
    "half six": "Half six means six thirty. Half past six.",
    "see ya": "See ya means see you later. Casual goodbye.",
    "settling in": "Settling in means getting used to a new place.",
    "g'day": "G'day means hello. It's Australian.",
    gday: "G'day means hello. It's Australian.",
    mate: "Mate means friend.",
    badge: "A badge is a small card. It opens the office door.",
    spare: "Spare means extra. Not used by anyone.",
    "sticky note": "A sticky note is a small yellow paper.",
    "stand-up": "A stand-up is a short team meeting in the morning.",
    standup: "A stand-up is a short team meeting in the morning.",
    "stand up": "A stand-up is a short team meeting in the morning.",
    blockers: "Blockers are problems. Things that stop your work.",
    blocker: "A blocker is a problem. Something that stops your work.",
    logs: "Logs are records. The computer writes down who came in and when.",
    dentist: "A dentist is a doctor for your teeth.",
    "crush it": "Crush it means do a really good job. A silly office phrase.",
    recycling: "Recycling is when old things go to be used again.",
    pickup: "A pickup is when a courier comes and takes a box.",
    "pick up": "A pickup is when a courier comes and takes a box.",
    booking: "A booking is a reservation. Like a ticket.",
    surname: "Your surname is your family name. Like Frost.",
    "the lot": "The lot means everything.",
    harmless: "Harmless means not dangerous.",
    server: "A server is a big computer for the whole company."
  };

  // ───────── улики, досье ─────────
  const CLUES = {
    halfsix: { ru: "Грейс посреди собеседования по телефону: «Friday's fine. Half six.» Half six — это 18:30." },
    tomLate: { ru: "Том в прошлый четверг сидел в офисе до 22:00 — обновлял сервер." },
    tomBadge: { ru: "У Тома пропуск №01." },
    maxBadge: { ru: "У Макса пропуск №04." },
    spares: { ru: "Запасные пропуска лежат в ящике у Грейс." },
    fridayCourier: { ru: "В пятницу Грейс отправляет курьером «старые ноутбуки на переработку»." },
    maxBooth: { ru: "Макс уходит звонить в стеклянную будку и закрывает дверь." },
    tomHunt: { ru: "Том ищет в логах, кто в четверг ночью зашёл по запасному пропуску." },
    maxDentist: { ru: "Макс говорит, что с двух до четырёх он у стоматолога." },
    flash: { ru: "Удалённое сообщение Грейс: SwiftBox, пятница 18:30, 14 Bay Street, Apt 3." },
    maxLeave: { ru: "Макс хочет уйти из Murmur." },
    maxInterview: { ru: "В прошлый четверг Макс был на собеседовании в другой компании. Про футбол он соврал." },
    halfsix2: { ru: "Грейс по телефону: «Пятница. Six thirty, как договорились»." },
    recycling: { ru: "Грейс: «На коробке будет написано recycling. В утиль никто не заглядывает»." },
    cash: { ru: "Грейс: оплата наличными. Без карт и банков." },
    wharf: { ru: "Диспетчер SwiftBox: доставка на 14 Bay Street, Apt 3. Это жилая квартира, не пункт переработки." },
    rerouted: { ru: "Адрес доставки изменён: коробка поедет на 9 Pine Street, к Сове." },
    doorScreen: { ru: "Экран у двери: последний вход — пропуск №07, четверг, 21:40. Статус: запасной." },
    invoice: { ru: "Счёт SwiftBox в принтере: заказчик — G. Hollis. Оплата наличными." },
    fridayPub: { ru: "В пятницу в 18:00 весь офис идёт в бар. Все, кроме Грейс: она «занята»." },
    doorLog: { ru: "Журнал двери за четверг: №04 вышел в 18:10, №03 — в 17:30, №01 (Том) — в 22:05. №07 вошёл в 21:40." },
    spare07: { ru: "Нижний ящик Грейс: лоток запасных пропусков. Ячейка №07 пустая." },
    oneWay: { ru: "Там же — билет в Мексику в один конец, на утро субботы. На имя G. Hollis." }
  };
  const SUSPECTS = ["tom", "max", "grace"];
  const DOSSIER_FIELDS = [
    { id: "role", ru: "Работа" },
    { id: "thursday", ru: "Прошлый четверг" },
    { id: "badge", ru: "Пропуск" }
  ];

  const MISSIONS = {
    1: { ico: "rec", emo: "🎥", title: "Собеседование", goal: { label: "Ответить на все вопросы", test: (s, st) => st.need > 0 && st.got >= st.need - 1 } },
    2: { ico: "doc", emo: "🏢", title: "Первый день", goal: { label: "Досье: работа и четверг у всех троих", test: (s) => SUSPECTS.every((w) => s.dossier[w] && s.dossier[w].role && s.dossier[w].thursday) } },
    3: { ico: "cup", emo: "☕", title: "Стендап", goal: { label: "Прочитать удалённое сообщение", test: (s) => !!s.flags.flashRead } },
    4: { ico: "ear", emo: "👂", title: "Стеклянная будка", phraseGoal: 1, goal: { label: "Услышать «recycling» и «cash»", test: (s) => !!(s.clues.recycling && s.clues.cash) } },
    5: { ico: "bag", emo: "📦", title: "Курьер", goal: { label: "Сменить адрес доставки", test: (s) => !!s.flags.addressChanged } },
    6: { ico: "target", emo: "⏰", title: "Пятница, 18:15", goal: { label: "Задержать Грейс до 18:30", test: (s) => !!s.flags.stalled } }
  };

  // Как персонажи думают — для языковой модели, если она подключена.
  const CAST = {
    priya: "Priya, People Lead (HR) at Murmur, a small Silicon Valley startup in San Francisco that makes translator earbuds. Energetic and kind, loves phrases like 'love that' and 'amazing'. Uses simple, clear English.",
    grace: "Grace Hollis, Murmur's office manager for eleven years in San Francisco. Warm, chatty, friendly ('lovely', 'thanks'). Secretly she is selling the earbud prototype on Friday. She never admits it and quietly tests newcomers.",
    tom: "Tom, Murmur's IT guy. Grumpy, sarcastic, very short sentences, but honest and kind underneath.",
    max: "Max, Murmur's sales lead. Australian living in San Francisco, charming, talks a lot, says 'mate'. Secretly looking for a new job and hides it.",
    dev: "Dev, a dispatcher at SwiftBox couriers in San Francisco. Busy, quick, friendly phone manner."
  };

  const S3_COVER = { id: "cover", label: "выдать себя", ai: "mentions spying, intelligence, a handler, Sova, the Bureau, police, an agent or a secret mission",
    any: ["spy", "spying", "agent", "intelligence", "bureau", "sova", "handler", "undercover", "secret mission", "police", "kgb"], sus: 35, reply: "Sorry... what?" };
  const S3_LEGEND = [
    { id: "otherCity", label: "город не из легенды", ai: (s) => `says they come from a city or country other than ${Leg.city(s).en}, ${Leg.city(s).country}`,
      any: (s) => Leg.otherCities(s), sus: 20, reply: (s) => `Wait — I thought you said ${Leg.city(s).en}?` },
    { id: "russia", label: "Россия вместо легенды", ai: "says they are from Russia or Moscow, or that they are Russian",
      any: ["russia", "russian", "moscow", "petersburg"], sus: 30, reply: (s) => `Russia? Oh. I thought you were from ${Leg.city(s).en}.` }
  ];
  const S3_FORBID = () => [S3_COVER, ...S3_LEGEND];

  const DIRECT = { id: "direct", label: "вопрос в лоб", ai: "asks directly about the leak, stolen or copied files, the prototype, 21:40, badge number seven, or who is the thief",
    any: ["2140", "940", "nine forty", "leak*", "stole", "steal*", "stolen", "copied", "the files", "prototype", "badge 7", "badge seven", "number seven", "number 7", "07", "thief"],
    sus: 25, reply: "Why are you asking that? Who are you, the police?" };

  const ANY_EN = { id: "any", label: "ответить по-английски", ai: "answers in English (any answer is fine)", test: (t) => enWords(t) >= 1 && !isRussian(t) && !Repair.detect(t) };
  const ASKS = (t) => isQuestion(t) && !Repair.detect(t);
  const YES = ["yes", "yeah", "yep", "sure", "of course", "ok", "okay", "right", "correct", "absolutely", "definitely", "no problem", "fine", "great", "perfect", "alright", "all right"];

  // Буквы по-английски: «H-O-L-L-I-S», «aitch oh double el eye ess».
  function spelled(text, word) {
    const t = norm(text);
    if (t.includes(word.toLowerCase())) return true;
    const NAMES = { aitch: "h", haitch: "h", oh: "o", el: "l", ell: "l", eye: "i", ess: "s", es: "s", em: "m", ar: "r", are: "r", dee: "d", tee: "t", bee: "b", see: "c", sea: "c", gee: "g", jay: "j", kay: "k", pee: "p", queue: "q", you: "u", vee: "v", ex: "x", why: "y", zed: "z", zee: "z", eff: "f", en: "n", ay: "a" };
    const out = [];
    const toks = t.split(" ");
    for (let i = 0; i < toks.length; i++) {
      const w = toks[i];
      if (w === "double" && toks[i + 1]) { const n = toks[i + 1].length === 1 ? toks[i + 1] : NAMES[toks[i + 1]]; if (n) { out.push(n, n); i++; continue; } }
      if (w.length === 1) out.push(w);
      else if (NAMES[w]) out.push(NAMES[w]);
      else if (/^[a-z]+$/.test(w) && w.length <= 8 && w === w.toUpperCase()) out.push(...w);
    }
    return out.join("").includes(word.toLowerCase());
  }

  // ───────── сцены ─────────
  const S = {
    // ═════════ МИССИЯ 1 · СОБЕСЕДОВАНИЕ ═════════
    "o1-open": {
      type: "chat", mission: 1, missionStart: true, chapter: { n: 1, title: "Собеседование", sub: "Среда, 9:50 · Сан-Франциско" },
      time: "09:50", place: "Сообщения", bg: "art/office/bg-home-dawn.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: "Иней, доброе утро. Кремниевая долина, Сан-Франциско, стартап Murmur. Делают наушник-переводчик: вставил в ухо — и понимаешь любой язык." },
        { from: "sova", text: "Кто-то внутри продаёт прототип. Сделка — в эту пятницу. Найди: кто, где и когда." },
        { from: "sova", text: "Ирония: переводчика у тебя нет. Только твой английский. В 10:00 — собеседование на офис-ассистента. Сначала легенда." }
      ],
      end: "Открыть легенду"
    },

    "o1-legend": { type: "legend", mission: 1, time: "09:53", place: "Легенда", bg: "art/office/bg-home-dawn.jpg", look: "day" },

    "o1-check": {
      type: "chat", mission: 1, time: "09:57", place: "Сообщения", bg: "art/office/bg-home-dawn.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: (s) => `${Leg.city(s).ru}, ${Leg.job(s).ru}, ${Leg.hobby(s).ru}. Запомнил. Проверять будут.` },
        { from: "sova", text: "Проверка связи. Нажми «Говорить» (или держи пробел) и скажи по-английски: Hi, I'm Alex. Можно и написать." },
        { me: { hint: "Скажи: Hi, I'm Alex.", model: "Hi, I'm Alex.",
          facts: [{ id: "hi", label: "представиться", ai: "greets and/or says their name is Alex", any: ["alex", "hi", "hello", "hey", "frost", "im", "i am"] }],
          ask: { hi: "Не слышу. По-английски: Hi, I'm Alex." },
          ok: (s) => `Слышу. Акцент есть, но для ${Leg.city(s).gen} нормально.` } },
        { from: "sova", text: "Три правила. Первое: ни слова по-русски. Даже «блин». Русский в офисе Кремниевой долины — это засветка." },
        { from: "sova", text: "Второе: не расслышишь — переспроси. Это не слабость, это инструмент:" },
        { phrase: "repeat" },
        { from: "sova", text: "Третье: тупик — ты тут первую неделю. Первой неделе прощают многое:" },
        { phrase: "new" },
        { from: "sova", text: "И гаджеты: 🎧 «Суфлёр» — шепну, что сказать. 🧊 «Иней» — остудит засветку. Зарядов мало. Всё, тебе звонят." }
      ],
      end: "Принять видеозвонок", ring: { who: "priya", title: "Murmur · Interview", sub: "Priya Shah и Grace Hollis" }
    },

    "o1-interview": {
      type: "conv", ui: "video", mission: 1, time: "10:00", place: "Видеозвонок", bg: "art/office/bg-home-dawn.jpg", look: "day",
      title: "Murmur · Interview", cast: ["priya", "grace"], npc: "priya", meter: "Собеседование",
      goal: "Получи работу. Отвечай по легенде.",
      situation: "A video job interview at Murmur in San Francisco for an office assistant role. The candidate is Alex Frost, new in California, with simple English.",
      forbid: S3_FORBID,
      failSay: "I think... we'll be in touch. Bye.", failText: "Приглашения в Murmur не будет. Легенда рассыпалась на собеседовании.",
      beats: [
        { who: "priya", say: "Hi! Can you hear me okay?",
          hint: "Ответь, что слышишь. Например: Yes, I can hear you.", model: "Yes, I can hear you. Hi!",
          facts: [{ id: "hear", label: "ответить, что слышно", ai: "confirms they can hear, or simply greets", any: [...YES, "hear", "hello", "hi", "hey", "good", "loud and clear"] }],
          ask: { hear: "Hello? Can you hear me?" }, ok: "Great!" },
        { lines: [{ who: "priya", text: "I'm Priya. I lead People here at Murmur. And this is Grace, our office manager." },
                  { who: "grace", text: "Hiya! Nice to meet you." }],
          who: "grace", hint: "Поздоровайся в ответ.", model: "Nice to meet you too.",
          facts: [{ id: "nice", label: "поздороваться", ai: "greets them back politely", any: ["nice", "meet", "hello", "hi", "hey", "pleasure", "morning", "good", "thank*", "hiya"] }] },
        { who: "priya", say: "So, Alex. Tell us a little bit about yourself.", legendHint: true, maxTries: 4,
          hint: "Имя, откуда ты и кем работал(а) раньше. Всё — из легенды.",
          model: (s) => `I'm Alex Frost. ${Leg.city(s).say} ${Leg.job(s).say}`,
          facts: [
            { id: "name", label: "имя", ai: "says their name is Alex (Frost)", any: ["alex", "frost"] },
            { id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en} (${Leg.city(s).country})`, any: (s) => Leg.city(s).any },
            { id: "job", label: (s) => `работа: ${Leg.job(s).short}`, ai: (s) => `says they worked as ${Leg.job(s).en}`, any: (s) => Leg.job(s).any }],
          ask: { name: "Sorry, what's your full name?", city: "And where are you from?", job: "And what did you do before?" },
          ok: (s) => `${Leg.city(s).en}! Lovely. I've never been.` },
        { who: "grace", say: "And how long have you been in San Francisco?",
          hint: "Два месяца — two months.", model: "I've been here for two months.",
          facts: [{ id: "months", label: "два месяца", ai: "says two months", any: ["two months", "2 months", "two month", "2 month", "couple of months", "two"] }],
          ask: { months: "Sorry, how long?" }, ok: "Two months! So you still get lost on Caltrain, I bet." },
        { who: "priya", say: "The job is office assistant. Phones, deliveries, meetings, a bit of everything. Why do you want to work at Murmur?",
          hint: "Любая причина. Например: I like technology. I want to learn.", model: "I like your product, and I want to learn new things.",
          facts: [{ id: "why", label: "причина", ai: "gives any reason for wanting this job", any: ["like", "love", "interest*", "want", "because", "technolog*", "tech", "product", "learn", "team", "earbud*", "translat*", "language*", "job", "work", "experience", "cool", "great", "good", "people", "silicon", "valley", "francisco", "california"] }],
          bonus: [{ id: "irony", label: "заговорить о языках", ai: "mentions languages, translation or learning English", any: ["language*", "translat*", "english"],
            reply: "Ha! Our earbud will translate everything. Soon nobody will need to learn English!" }],
          ok: "Love that." },
        { who: "grace", say: "Okay, a practical one. A courier calls, but I'm in a meeting. What do you say to him?",
          hint: "Например: Sorry, she's in a meeting. Can I take a message?", model: "Sorry, she's in a meeting. Can I take a message?",
          facts: [{ id: "msg", label: "вежливо принять звонок", ai: "handles the call politely: she is busy or in a meeting, offers to take a message or to call back later",
            any: ["message", "call back", "later", "meeting", "busy", "moment", "wait", "hold", "help you", "can i help", "not here", "not available", "minute"] }],
          ask: { msg: "Hmm. And then? What do you say to him?" }, ok: "Perfect. That's literally the job." },
        { lines: [{ who: "grace", text: "Oh, sorry, one second." },
                  { who: "grace", text: "Yes, Friday's fine. Half six. Okay, bye.", fx: "aside", note: "Грейс в сторону, по телефону", clue: "halfsix" },
                  { who: "priya", text: "Sorry about that! Busy week." }] },
        { who: "priya", say: "Okay, the classic question. What's your biggest weakness?",
          hint: "Можно честно: My English is not perfect, but I learn fast.", model: "My English is not perfect, but I learn fast.",
          facts: [{ id: "weak", label: "ответить про слабость", ai: "names any weakness", any: ["english", "weak*", "perfect", "learn", "sometimes", "too", "shy", "nervous", "slow", "my", "i am", "im", "accent", "speak", "talk", "late", "coffee"] }],
          bonus: [{ id: "eng", label: "честно про английский", ai: "says their English is not perfect", any: ["english", "language", "accent"],
            reply: (s) => `Honestly? Your English is fine. Much better than my ${Leg.city(s).lang}!` }],
          ok: "Ha. Honest. I like that." },
        { who: "grace", say: "Do you have any questions for us?",
          hint: "Задай любой вопрос. Например: When can I start? How many people work here?", model: "How many people work here?",
          facts: [{ id: "q", label: "задать вопрос", ai: "asks the interviewers any real question", test: ASKS }],
          ask: { q: "Anything at all? Ask us something!" },
          bonus: [
            { id: "team", label: "спросить про команду", ai: "asks about the team or colleagues", any: ["people", "team", "who", "how many", "colleague*", "work with"],
              reply: "There are eight of us. You'll meet Tom, our IT guy. He's grumpy with everyone, don't worry. And Max from sales. He never stops talking." },
            { id: "start", label: "спросить, когда начинать", ai: "asks when they can start", any: ["start", "when", "monday", "first day"], reply: "As soon as possible!" }],
          ok: "Good question!" },
        { who: "priya", say: "Alex, we'd love to have you. Can you start on Monday?",
          hint: "Соглашайся.", model: "Yes, of course! Thank you!",
          facts: [{ id: "yes", label: "согласиться", ai: "agrees to start on Monday", any: [...YES, "can", "thank*", "love to", "happy"] }],
          ok: "Brilliant! Welcome to Murmur, Alex." }
      ],
      end: { who: "grace", say: "See you on Monday! See ya!" }
    },

    "o1-debrief": {
      type: "debrief", mission: 1, time: "10:20", place: "Итог", bg: "art/office/bg-home-dawn.jpg", look: "day",
      title: "Тебя взяли",
      sova: (s) => s.clues.halfsix
        ? "Неплохо. А теперь главное: посреди собеседования Грейс ответила на звонок. «Friday's fine. Half six». Half six — это 18:30. Пятница. Держи в голове."
        : "Неплохо. Ты внутри. В понедельник — первый день и первые подозреваемые."
    },

    // ═════════ МИССИЯ 2 · ПЕРВЫЙ ДЕНЬ ═════════
    "o2-brief": {
      type: "chat", mission: 2, missionStart: true, chapter: { n: 2, title: "Первый день", sub: "Понедельник, 9:10 · офис Murmur" },
      time: "09:10", place: "Сообщения", bg: "art/office/bg-office-day.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: "Первый день. В прошлый четверг в 21:40 кто-то скопировал файлы прототипа. В логах двери — пропуск №07. Чей — неизвестно." },
        { from: "sova", text: "Кандидаты: Том (IT), Макс (продажи), Грейс (офис). Узнай у каждого, чем занимается и что делал в прошлый четверг." },
        { from: "sova", text: "Только не в лоб: «Где вы были в 21:40?» — так спрашивает полиция. Вопросы я зашифровал. Собери их — заодно запомнишь." }
      ],
      end: "Открыть шифровку"
    },

    "o2-decode": {
      type: "decode", mission: 2, time: "09:20", place: "Шифровка", bg: "art/office/bg-office-day.jpg", look: "day",
      kicker: "Шифровка от Совы", title: "Три вопроса на сегодня", badge: "decoder",
      keys: ["Нажимай слова по порядку", "Лишние слова — ловушки", "🔊 — послушать фразу целиком"],
      goal: "Собери вопросы, которыми будешь работать в офисе.",
      intro: "Сова прислала вопросы для сегодняшних разговоров, но слова перемешаны. Нажимай их по порядку. Среди слов есть лишние.",
      items: [
        { ru: "Чем вы тут занимаетесь?", en: "What do you do here?", extra: ["does", "are"], phrase: "whatdo" },
        { ru: "Делали что-нибудь интересное на прошлой неделе?", en: "Did you do anything fun last week?", extra: ["funny", "does"], phrase: "fun" },
        { ru: "Что вы делали в прошлый четверг?", en: "What did you do last Thursday?", extra: ["were", "does"] }
      ],
      sova: "Этими вопросами и работай. И осмотрись: в офисе много чего лежит на виду. Досье и легенда — в блокноте."
    },

    "o2-floor": {
      type: "rounds", mission: 2, time: "09:30", place: "Офис Murmur", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "Первый день",
      goal: "Поговори с Томом, Максом и Грейс: чем занимаются и что делали в прошлый четверг.",
      finds: [
        { id: "fridge", at: "fridge", ico: "📝", title: "Записка на холодильнике", kind: "", text: "DO NOT eat my yogurt.\nI know it was you, Max.\n— Tom",
          q: "Что случилось?", opts: ["Макс съел йогурт Тома", "Том съел йогурт Макса", "Холодильник сломался"] },
        { id: "printer", at: "printer", ico: "🖨️", title: "Лист в принтере", kind: "print", text: "SwiftBox Couriers — INVOICE\nCustomer: G. Hollis, Murmur\nPickups this month: 2\nPaid: cash",
          q: "Как здесь платят курьерам?", opts: ["Наличными", "Картой компании", "Курьеры работают бесплатно"], clue: "invoice" },
        { id: "door", at: "doorpad", ico: "🚪", title: "Экран у двери", kind: "screen", text: "LAST ENTRY\nBadge #07 — Thu 21:40\nStatus: SPARE BADGE",
          q: "Кто вошёл в четверг в 21:40?", opts: ["Кто-то с запасным пропуском", "Том со своим пропуском", "Никто: дверь была закрыта"], clue: "doorScreen" },
        { id: "board", at: "board", ico: "📌", title: "Доска объявлений", kind: "", text: "FRIDAY DRINKS! 🍻\n6 pm at Mission Tap. Everyone's coming.\nExcept Grace: \"busy\".",
          q: "Кто не идёт в бар в пятницу?", opts: ["Грейс", "Том", "Идут все"], clue: "fridayPub" },
        { id: "coffee", at: "coffee", ico: "☕", title: "Кофемашина", kind: "", text: "OUT OF ORDER.\nPlease use the kettle.\nSorry! — Grace",
          q: "Что с кофемашиной?", opts: ["Не работает", "Только для гостей", "Кончилось молоко"] }
      ],
      people: [
        { who: "tom", at: "it", lead: "IT-угол. Что-то чинит и вздыхает.", conv: {
          ui: "face", npc: "tom", place: "IT-угол", situation: "Alex's first morning at Murmur. Tom gives Alex a laptop at the IT desk.",
          forbid: S3_FORBID,
          beats: [
            { who: "tom", say: "You're the new one. Alex, right? Your laptop's on your desk. The password's on the sticky note.",
              hint: "Поздоровайся, поблагодари.", model: "Yes, hi! Thanks, Tom.",
              facts: [{ id: "hi", label: "ответить", ai: "greets or thanks Tom", any: [...YES, "hi", "hello", "thank*", "cheers", "nice", "good morning"] }],
              ok: "Don't lose it. I'm not making another one." },
            { who: "tom", say: "Anything else? I'm a bit busy.",
              hint: "Спроси, чем он занимается и что делал в прошлый четверг.", model: "What do you do here? And did you do anything fun last week?",
              forbid: [DIRECT], maxTurns: 9,
              fallbacks: ["Is that a question?", "Sorry, I don't follow.", "Hm. Next question."],
              topics: [
                { id: "role", label: "чем занимается", required: true, ai: "asks Tom what his job or role is", any: ["what do you do", "your job", "your role", "you do here", "what is your", "whats your", "work as", "in charge", "responsible", "your work", "department"],
                  answer: "I'm IT. Laptops, servers, the Wi-Fi. Everything people break.", dossier: ["tom", "role", "IT: ноутбуки, сервера, Wi-Fi"] },
                { id: "thu", label: "прошлый четверг", required: true, ai: "asks what Tom did last week, last Thursday, or on Thursday evening", any: ["thursday", "last week", "your week", "anything fun", "what did you do", "last night"],
                  answer: "Last Thursday? I was here till ten. Server update. Very exciting.", dossier: ["tom", "thursday", "В офисе до 22:00 — обновлял сервер"], clue: "tomLate" },
                { id: "weekend", label: "выходные", ai: "asks about his weekend", any: ["weekend", "saturday", "sunday"],
                  answer: "Weekend? Quiet. Slept. Why?" },
                { id: "badge", label: "пропуск", offer: true, ai: "asks about badges, passes or key cards", any: ["badge*", "pass", "key card", "card", "access"],
                  answer: "Badges? I make them. Mine's number one, obviously. Grace keeps the spare ones in her drawer.", dossier: ["tom", "badge", "№01. Запасные — у Грейс в ящике"], clue: "tomBadge", also: "spares" },
                { id: "long", label: "сколько работает", ai: "asks how long he has worked here", any: ["how long"], answer: "Four years. Longest four years of my life." },
                { id: "hobby", label: "личное", ai: "asks about his hobbies or free time", any: ["hobby", "hobbies", "free time", "for fun", "you like"], answer: "Fun? I fix computers. Then I go home and fix more computers." }
              ],
              interject: { after: 1, who: "tom", say: "You good with computers?", hint: "Любой ответ.", model: "Not really. I'm better with people.",
                facts: [ANY_EN], ok: "Good. Then don't touch the server room." },
              close: "Right. Back to work. Shout if the Wi-Fi dies." }
          ] } },
        { who: "max", at: "desks", lead: "Опен-спейс. Громко смеётся в телефон.", conv: {
          ui: "face", npc: "max", place: "Опен-спейс", situation: "Max comes to say hello to the new office assistant in the open space.",
          forbid: S3_FORBID,
          beats: [
            { who: "max", say: "G'day! You must be Alex. I'm Max. How's the first day going?",
              hint: "Ответь, как день. И спроси в ответ: How about you?", model: "It's good, thanks. A bit busy. How about you?",
              facts: [{ id: "how", label: "ответить, как день", ai: "says how their first day is going", any: ["good", "fine", "great", "ok", "okay", "busy", "nervous", "well", "not bad", "interesting", "so far", "alright", "all right", "thanks", "nice", "cool"] }],
              ask: { how: "So how's your first day going, mate? Good?" },
              bonus: [{ id: "back", label: "спросить в ответ", ai: "asks Max back how he is", any: ["and you", "how about you", "what about you", "how are you"], reply: "Me? Living the dream, mate." }],
              ok: "Ha, good on ya." },
            { who: "max", say: "So where are you from, Alex? I can't place the accent.",
              hint: "Откуда ты — по легенде.", model: (s) => Leg.city(s).say, legendHint: true,
              facts: [{ id: "city", label: (s) => `откуда: ${Leg.city(s).en}`, ai: (s) => `says they are from ${Leg.city(s).en}`, any: (s) => Leg.city(s).any }],
              ask: { city: "Sorry, where?" }, ok: (s) => `${Leg.city(s).en}! Never been. Is it cold?` },
            { who: "max", say: "Anyway, ask me anything. I love talking about myself.",
              hint: "Узнай, чем он занимается и что делал в прошлый четверг.", model: "What do you do here? What did you do last Thursday?",
              forbid: [DIRECT], maxTurns: 9,
              fallbacks: ["Ha! Love it. What else?", "Sorry, mate, say again?", "Not sure I follow, mate."],
              topics: [
                { id: "role", label: "чем занимается", required: true, ai: "asks Max what his job or role is", any: ["what do you do", "your job", "your role", "you do here", "what is your", "whats your", "work as", "in charge", "your work", "department"],
                  answer: "Sales! I sell earbuds that don't exist yet. Best job in the world.", dossier: ["max", "role", "Продажи"] },
                { id: "thu", label: "прошлый четверг", required: true, ai: "asks what Max did last week, last Thursday or on Thursday evening", any: ["thursday", "last week", "your week", "anything fun", "what did you do", "last night"],
                  answer: "Last Thursday? Football. Big match. We lost. Don't ask.", dossier: ["max", "thursday", "Футбол, говорит он"], clue: null },
                { id: "weekend", label: "выходные", ai: "asks about his weekend", any: ["weekend", "saturday", "sunday"], answer: "Weekend was great. Beach. Well, the Bay. Same thing." },
                { id: "badge", label: "пропуск", offer: true, ai: "asks about badges or passes", any: ["badge*", "pass", "key card", "card", "access"],
                  answer: "My badge? Number four, I think. Lucky number. Why?", dossier: ["max", "badge", "№04"], clue: "maxBadge" },
                { id: "long", label: "сколько работает", ai: "asks how long he has worked here", any: ["how long"], answer: "Three years. Feels like ten." },
                { id: "from", label: "откуда он", ai: "asks where Max is from", any: ["where are you from", "you from", "australia*"], answer: "Perth, Australia. I came here for the weather. That's a joke." }
              ],
              interject: { after: 1, who: "max", say: "What about you? What do you do for fun?",
                hint: "Хобби из легенды.", model: (s) => Leg.hobby(s).say, legendHint: true,
                facts: [{ id: "hobby", label: (s) => `хобби: ${Leg.hobby(s).ru}`, ai: (s) => `says their hobby: ${Leg.hobby(s).say}`, any: (s) => Leg.hobby(s).any }],
                ask: { hobby: "Come on, what do you like doing?" }, ok: (s) => Leg.hobby(s).reply },
              close: "Ah, sorry, mate. Gotta take this." }
          ],
          after: [{ see: "Макс уходит с телефоном в стеклянную будку и плотно закрывает дверь.", clue: "maxBooth" }] } },
        { who: "grace", at: "reception", lead: "Ресепшн. Чайник, печенье, всё про всех.", conv: {
          ui: "face", npc: "grace", place: "Ресепшн", situation: "Grace welcomes the new office assistant at reception and makes tea.",
          forbid: S3_FORBID,
          beats: [
            { who: "grace", say: "There you are! Settling in okay? Tea? Coffee?",
              hint: "Ответь и выбери: чай или кофе.", model: "Yes, thanks! A coffee, please.",
              facts: [{ id: "drink", label: "чай или кофе", ai: "answers and chooses tea, coffee, water or nothing", any: ["tea", "coffee", "water", "no thanks", "nothing", "latte", "please", "milk", "juice"] }],
              ask: { drink: "So, tea or coffee, love?" }, ok: "Coming right up." },
            { who: "grace", say: (s) => `So you were ${Leg.otherJobs(s)[0].en} before, weren't you?`, legendHint: true,
              hint: "Внимательно: она правильно назвала твою прошлую работу?",
              model: (s) => `No, actually. ${Leg.job(s).say}`,
              facts: [{ id: "fix", label: "поправить её", ai: (s) => `corrects her and says they actually worked as ${Leg.job(s).en}`, any: (s) => Leg.job(s).any }],
              forbid: [{ id: "agree", label: "согласиться с неправдой", sus: 25, ai: "agrees that the wrong job is correct",
                test: (t) => /\b(yes|yeah|yep|right|correct|exactly|true)\b/.test(norm(t)) && !/\bno\b|\bnot\b/.test(norm(t)) && !Leg.job().any.some((p) => hasPhrase(norm(t), p)),
                reply: (s) => `Hm. Funny. I'm sure you said ${Leg.job(s).short} in the interview.` }],
              ask: { fix: "Hm? So what did you do before?" }, ok: (s) => `Oh, ${Leg.job(s).short}! Sorry, my memory. Too many new faces.` },
            { who: "grace", say: "Anyway! Anything you need, just ask. I know everything here.",
              hint: "Узнай, чем она занимается и что делала в прошлый четверг.", model: "What do you do here? And what did you do last Thursday?",
              forbid: [DIRECT], maxTurns: 9,
              fallbacks: ["Sorry, love, I didn't catch that.", "Ooh, what do you mean?", "Hm?"],
              topics: [
                { id: "role", label: "чем занимается", required: true, ai: "asks Grace what her job or role is", any: ["what do you do", "your job", "your role", "you do here", "what is your", "whats your", "work as", "in charge", "your work"],
                  answer: "Me? I do everything. The office, deliveries, couriers, the lot. If it comes in a box, it's mine.", dossier: ["grace", "role", "Офис, доставки, курьеры"] },
                { id: "thu", label: "прошлый четверг", required: true, ai: "asks what Grace did last week, last Thursday or on Thursday evening", any: ["thursday", "last week", "your week", "anything fun", "what did you do", "last night"],
                  answer: "Last Thursday? Yoga, then home. Early night. My life is very exciting.", dossier: ["grace", "thursday", "Йога, потом домой — говорит она"] },
                { id: "weekend", label: "выходные", ai: "asks about her weekend", any: ["weekend", "saturday", "sunday"], answer: "Lovely, thanks. I cleaned my apartment. Very rock and roll." },
                { id: "badge", label: "пропуск", offer: true, ai: "asks about badges or passes", any: ["badge*", "pass", "key card", "card", "access"],
                  answer: "Badges are Tom's thing. I just keep the spares in my drawer. Why?", dossier: ["grace", "badge", "Хранит запасные пропуска"], clue: "spares" },
                { id: "long", label: "сколько работает", ai: "asks how long she has worked here", any: ["how long"], answer: "Eleven years! Before Murmur, this building was a carpet shop." },
                { id: "hobby", label: "личное", ai: "asks about her hobbies or free time", any: ["hobby", "hobbies", "free time", "for fun", "you like"], answer: "Yoga. And gossip. Mostly gossip." }
              ],
              close: "Oh! And on Friday I need your help with a courier. Old laptops going to recycling. Remind me, yeah?" },
            { who: "grace", hint: "Согласись помочь.", model: "Sure, no problem.",
              facts: [{ id: "ok", label: "согласиться", ai: "agrees to help or to remind her", any: [...YES, "help", "will", "remind", "no worries"] }],
              ok: "You're a star.", done: () => Clues.add("fridayCourier") }
          ] } }
      ]
    },

    "o2-report": {
      type: "chat", mission: 2, time: "17:45", place: "Сообщения", bg: "art/office/bg-office-dusk.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: "Ну что? По-английски и коротко: что каждый делал в прошлый четверг вечером?" },
        { from: "sova", text: "Да, мне — тоже по-английски. Экран твоего телефона видит весь опен-спейс." },
        { me: { report: true, maxTries: 5,
          hint: "Например: Tom was in the office. Max was at football. Grace was at yoga.",
          model: "Tom was in the office until ten. Max was at a football match. Grace was at yoga, then at home.",
          facts: [
            { id: "tom", label: "Том", ai: "says Tom was at the office / working late / updating the server", all: [["tom"], ["office", "work*", "here", "server*", "late", "ten", "10", "update*"]], ack: "Том — в офисе до десяти. Принято." },
            { id: "max", label: "Макс", ai: "says Max was at a football match", all: [["max"], ["football", "match", "game", "soccer"]], ack: "Макс — футбол. Ну-ну." },
            { id: "grace", label: "Грейс", ai: "says Grace was at yoga or at home", all: [["grace"], ["yoga", "home", "early", "sleep*", "bed"]], ack: "Грейс — йога и домой." }],
          ask: { tom: "А Том?", max: "Макс?", grace: "Грейс?" },
          fallback: "Ладно, дочитаю твоё досье сама." } },
        { from: "sova", text: (s) => s.clues.tomBadge ? "Том был в офисе. Но у него пропуск №01, а не №07." : "Том был в офисе. Чей пропуск №07 — пока вопрос." },
        { from: "sova", text: (s) => s.clues.spares ? "Запасные пропуска — в ящике у Грейс. №07 очень похож на запасной." : "Узнай, где лежат запасные пропуска. №07 похож на запасной." },
        { from: "sova", when: (s) => s.clues.maxBooth, text: "И ещё: Макс уходит звонить в стеклянную будку. Закрывает дверь. Интересно." },
        { from: "sova", text: "Завтра стендап — утренний созвон, где все по очереди рассказывают, что делали вчера и что делают сегодня. Тебе тоже придётся." }
      ],
      end: "Дальше"
    },

    "o2-debrief": {
      type: "debrief", mission: 2, time: "18:00", place: "Итог", bg: "art/office/bg-office-dusk.jpg", look: "day",
      title: "Свой человек",
      sova: (s) => {
        const n = SUSPECTS.filter((w) => s.dossier[w] && s.dossier[w].thursday).length;
        return n === 3 ? "Три алиби за один день и ни одного вопроса в лоб. У тебя талант к болтовне." : `Алиби: ${n} из 3. Остальных добьём по ходу. И помни: в лоб не спрашивать.`;
      }
    },

    // ═════════ МИССИЯ 3 · СТЕНДАП ═════════
    "o3-lift": {
      type: "elevator", mission: 3, missionStart: true, chapter: { n: 3, title: "Стендап", sub: "Вторник, 9:22 · лифт, потом созвон" },
      time: "09:22", place: "Лифт", bg: "art/office/bg-office-day.jpg", look: "day", who: "max",
      kicker: "Лифт", title: "Шесть этажей с Максом",
      goal: "Small talk в лифте: отвечай быстро и по-человечески.",
      intro: "Утро, лифт, Макс. Он болтает — ты отвечаешь. Выбери естественный ответ, пока лифт едет до следующего этажа.",
      secs: 14,
      items: (s) => [
        { say: "Morning, Alex! How are you?", right: "Good, thanks. And you?", wrong: ["I'm Alex.", "Yes, I am."], back: "Can't complain, mate.", why: "На «How are you?» отвечают коротко и спрашивают в ответ." },
        { say: "Did you have a good evening?", right: "Yes, it was nice, thanks.", wrong: ["Yes, I do.", "Good evening!"], why: "Вопрос с did — про вчера. Ответ: Yes, it was…" },
        { say: "Foggy today, isn't it?", right: "Yeah, it's really chilly!", wrong: [`No, I'm from ${Leg.city(s).en}.`, "Yes, I am fogging it."], back: "Welcome to San Francisco.", why: "«…isn't it?» — с тобой делятся погодой. Просто согласись." },
        { say: "Which floor? Five?", right: "Yes, five, please.", wrong: ["I'm fine, thanks.", "Five years."], why: "Он спрашивает про этаж: Yes, five, please." },
        { say: "Ready for your first stand-up?", right: "I think so. A bit nervous!", wrong: ["Yes, I'm standing.", "Stand up, please."], back: "Ha! You'll be fine.", why: "Stand-up — утренняя планёрка. Ready? — I think so." },
        { say: "Here we are. After you!", right: "Thanks!", wrong: ["After me what?", "You're welcome."], why: "After you — «проходи первым». Ответ: Thanks!" }
      ],
      sova: (s, r) => r.score >= 5 ? "Шесть этажей болтовни ни о чём — и ни одной паузы. Это и есть легенда." : "Small talk — тоже работа. Короткий ответ и вопрос в ответ. Тренировка — в главном меню."
    },

    "o3-standup": {
      type: "conv", ui: "video", mission: 3, chapter: null,
      time: "09:30", place: "Созвон команды", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "Murmur · Daily stand-up", cast: ["priya", "tom", "max", "grace"], npc: "priya", meter: "Стендап",
      goal: "Послушай всех. Потом расскажи: что делал(а) вчера и что делаешь сегодня.",
      situation: "Murmur's daily stand-up video call. Everyone says what they did yesterday, what they will do today, and any blockers (problems).",
      forbid: S3_FORBID,
      beats: [
        { lines: [
          { who: "priya", text: "Morning, everyone! Quick stand-up. What you did yesterday, what you're doing today, any blockers. Tom, you first." },
          { who: "tom", text: "Yesterday I fixed the Wi-Fi. Again. Today I'm checking the server logs. Someone came in last Thursday night with a spare badge. I'll find out who.", note: "Том на стендапе", clue: "tomHunt" },
          { who: "priya", text: "Ooh, mysterious! Thanks, Tom. Max?" },
          { who: "max", text: "Yesterday, three calls with clients. Today I'm out from two till four. Dentist.", note: "Макс на стендапе", clue: "maxDentist" },
          { who: "grace", text: "Today I'm booking a courier for Friday. The old laptops are going to recycling. Alex is helping me.", note: "Грейс на стендапе" }] },
        { flash: { who: "grace", text: "📦 SwiftBox: pickup confirmed. Fri 18:30 → 14 Bay Street, Apt 3", ms: 9000, clue: "flash" } },
        { lines: [{ who: "grace", text: "Oops! Wrong chat. Sorry, everyone!" }] },
        { who: "priya", say: "No worries! Alex, your first stand-up! What did you do yesterday?",
          hint: "Вчера: познакомился(ась) с командой, получил(а) ноутбук. Прошедшее время.", model: "Yesterday I met the team and got my laptop.",
          facts: [{ id: "yday", label: "что делал(а) вчера", ai: "says what they did yesterday (any past activity)",
            test: (t) => { const n = norm(t); return /\byesterday\b/.test(n) || /\b(met|got|had|was|were|learned|learnt|worked|talked|spoke|did|went|made|started|helped|read|saw|found|asked|set|drank|answered|called|took|knew|sat|said|told|tried|fixed|cleaned)\b/.test(n) || /\b[a-z]{3,}ed\b/.test(n); } }],
          ask: { yday: "And yesterday? What did you do?" }, ok: "Nice." },
        { who: "priya", say: "And today?",
          hint: "Сегодня: I'm helping Grace with the courier.", model: "Today I'm helping Grace with the courier.",
          facts: [{ id: "today", label: "план на сегодня", ai: "says what they will do today", any: ["today", "going to", "will", "im helping", "i am helping", "help*", "courier", "grace", "learn*", "work*", "call*", "plan", "laptop", "meeting*", "phone*"] }],
          ask: { today: "What's the plan for today?" }, ok: "Love it." },
        { who: "priya", say: "Any blockers?",
          hint: "Не знаешь слово? Спроси: What does blockers mean?", model: "No blockers.",
          facts: [{ id: "block", label: "ответить про блокеры", ai: "says whether they have any blockers / problems", any: ["no", "none", "nothing", "not", "fine", "all good", "no blockers", "password", "wifi", "wi fi", "laptop", "yes", "ok", "okay"] }],
          ok: "Perfect." },
        { lines: [
          { who: "priya", text: "Great stand-up, everyone. Let's crush it today!" },
          { who: "tom", text: "Please never say that again." }] }
      ],
      end: { who: "max", say: "Gotta run. Bye!" }
    },

    "o3-logs": {
      type: "crack", mission: 3, time: "09:42", place: "Перехват", bg: "art/office/bg-office-day.jpg", look: "day", who: "tom",
      kicker: "Перехват", title: "Журнал двери", label: "Запись", badge: "cracker",
      keys: ["Слушай и набирай цифры", "▶ — ещё раз, 🐢 — медленно", "Клавиатура тоже работает"],
      goal: "Том читает журнал двери вслух. Запиши номера пропусков и время.",
      intro: "Том проверяет журнал двери за четверг и бормочет вслух, пока печатает. Микрофон в его углу пишет. Набери номер пропуска и время. Время — в 24-часовом формате: 5 p.m. — это 17.",
      items: [
        { say: "Right. Thursday. Badge zero four. Out at eighteen ten.", fields: [["Пропуск", "04"], ["Время", "1810", ":"]], note: "№04 — вышел в 18:10", tip: "eighteen ten = 18:10" },
        { say: "Badge zero three. Out at half past five, p.m.", fields: [["Пропуск", "03"], ["Время", "1730", ":"]], note: "№03 — вышел в 17:30", tip: "half past five p.m. = 17:30" },
        { say: "Badge zero one. That's me. Out at five past ten, p.m.", fields: [["Пропуск", "01"], ["Время", "2205", ":"]], note: "№01 — вышел в 22:05", tip: "five past ten p.m. = 22:05" },
        { say: "And here it is. Badge zero seven. In at twenty to ten, p.m.", fields: [["Пропуск", "07"], ["Время", "2140", ":"]], note: "№07 — вошёл в 21:40", tip: "twenty to ten p.m. = 21:40" }
      ],
      done: (s, r) => { s.flags.logScore = r.score; Clues.add("doorLog", r.score < 200); },
      sova: (s, r) => r.score >= 300 ? "Чисто. «Half past», «five past», «twenty to» — в английском так часто называют время. Ты это теперь слышишь." : "Время на слух — самое трудное. Half past five — 5:30. Twenty to ten — без двадцати десять. Потренируйся в «Перехвате»."
    },

    "o3-report": {
      type: "chat", mission: 3, time: "09:50", place: "Сообщения", bg: "art/office/bg-office-day.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: "Грейс что-то удалила из общего чата. Что там было? По-английски: когда и куда." },
        { me: { report: true, maxTries: 4,
          hint: "Время и адрес. Например: Friday, six thirty, 14 Bay Street.", model: "A pickup on Friday at six thirty. To 14 Bay Street, apartment 3.",
          facts: [
            { id: "time", label: "время", ai: "says 18:30 / six thirty / half past six", any: ["1830", "630", "6 30", "six thirty", "half six", "half past six", "six 30", "18 30"], ack: "18:30. Совпадает с её «half six»." },
            { id: "place", label: "адрес", ai: "says Bay Street (number 14)", any: ["bay", "bay street", "14 bay", "fourteen", "street", "apt 3", "apartment 3", "wharf"], ack: "Bay Street, 14. Принято." }],
          ask: { time: "Во сколько?", place: "Куда? Адрес?" },
          done: (s, got) => { if (got.has("time") && got.has("place")) s.flags.flashRead = true; Clues.add("flash", true); },
          fallback: "Ладно, я достал из кэша: пятница, 18:30, 14 Bay Street, квартира 3. В следующий раз — скриншот." } },
        { from: "sova", text: "Bay Street, 14 — жилой дом. Квартира. Не склад и не пункт переработки. Странное место для «старых ноутбуков»." },
        { from: "sova", when: (s) => s.clues.halfsix, text: "И «half six» Грейс говорила по телефону ещё на собеседовании. Совпадение? Не думаю." },
        { from: "sova", text: "По журналу двери: №04 и №03 ушли до шести, Том — в 22:05. А в 21:40 вошёл запасной №07." },
        { from: "sova", text: "А Макс сегодня «у стоматолога» с двух до четырёх. Проверим, какой там стоматолог." }
      ],
      end: "Дальше"
    },

    "o3-debrief": {
      type: "debrief", mission: 3, time: "10:00", place: "Итог", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "Первый стендап",
      sova: (s) => s.flags.flashRead ? "Девять секунд на чтение — и ты успел(а). Пятница, 18:30, Bay Street." : "Сообщение ушло. Ничего: адрес я достал. Но читать надо быстрее."
    },

    // ═════════ МИССИЯ 4 · СТЕКЛЯННАЯ БУДКА ═════════
    "o4-brief": {
      type: "chat", mission: 4, missionStart: true, chapter: { n: 4, title: "Стеклянная будка", sub: "Вторник, 13:55 · опен-спейс" },
      time: "13:55", place: "Сообщения", bg: "art/office/bg-office-day.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: "Макс ни к какому стоматологу не ушёл. Он идёт в стеклянную будку для звонков." },
        { from: "sova", text: "Подходи ближе — будет слышно лучше. Но чем ближе, тем быстрее тебя заметят. Глаз сверху покажет, насколько ты на виду." },
        { from: "sova", text: "Заметят — нужен повод. По-английски и спокойно:" },
        { phrase: "just" },
        { from: "sova", text: "Голоса по одному: сначала Макс, потом посмотрим." }
      ],
      end: "Начать"
    },

    "o4-booth": {
      type: "eaves", mission: 4, time: "13:58", place: "Опен-спейс", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "Звонок Макса", target: "max", targetAt: "booth",
      goal: "Подслушай звонок Макса в будке. Ближе — слышнее, но заметнее.",
      intro: "Макс закрылся в стеклянной будке. Ты — за своим столом. Нажимай на точки на карте, чтобы подойти ближе.",
      spots: [
        { at: "yourdesk", label: "Твой стол", ru: "далеко: только бубнёж", dist: "far" },
        { at: "printer", label: "Принтер", ru: "обрывки фраз", dist: "mid", rate: 3 },
        { at: "cooler", label: "Кулер у будки", ru: "слышно всё, но ты на виду", dist: "near", rate: 9 }
      ],
      notice: { who: "max", say: "Can I help you, mate?", good: "Oh. Right. No worries.", bad: "...Okay. Weird.",
        hint: "Назови простую причину. Например: <span class=\"english\">I'm just getting some water.</span>",
        any: ["water", "coffee", "tea", "printer", "print*", "paper", "waiting", "wait", "looking for", "phone", "charger", "just", "cup", "milk", "fridge", "lunch", "snack", "toilet", "bathroom", "meeting", "nothing", "fine", "sorry", "passing", "copy", "copies", "glass", "biscuit*", "sugar"] },
      lines: [
        { text: "Hi! Yes, this is Max. Yeah, I can talk now.", gap: 2500 },
        { text: "Three years at Murmur. In sales.", gap: 4200 },
        { text: "Honestly? I want to leave. Things are weird here right now.", gap: 4800, clue: "maxLeave", need: ["leave"], catch: { q: "I want to …", opts: ["leave", "live", "love"] } },
        { text: "Last Thursday? Yes, that was my second interview with you. Sorry I was late.", gap: 5200, clue: "maxInterview", need: ["interview"], catch: { q: "my second …", opts: ["interview", "internet", "invoice"] } },
        { text: "Start in March? That's perfect.", gap: 4200, catch: { q: "Start in …", opts: ["March", "May", "much"] } },
        { text: "And please don't call my work phone. Okay. Thanks. Bye!", gap: 4200 }
      ],
      outro: (s) => s.clues.maxInterview ? "Макс выходит из будки довольный. Похоже, «футбол» в четверг был собеседованием." : "Макс выходит из будки. Что он там обсуждал — ясно не до конца."
    },

    "o4-kitchen": {
      type: "eaves", mission: 4, time: "16:40", place: "Кухня", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "Кухня, 16:40", target: "grace", targetAt: "kitchen",
      goal: "Грейс говорит по телефону на кухне. Тише, чем обычно.",
      intro: "Грейс ушла на кухню и говорит в телефон вполголоса. У кофемашины на тебя смотрят меньше: повод очевиден.",
      spots: [
        { at: "yourdesk", label: "Твой стол", ru: "далеко: только бубнёж", dist: "far" },
        { at: "meeting", label: "Дверь переговорки", ru: "обрывки фраз", dist: "mid", rate: 3 },
        { at: "coffee", label: "Кофемашина", ru: "слышно всё; повод есть", dist: "near", rate: 6 }
      ],
      notice: { who: "grace", say: "Oh! Alex! You scared me. Do you need something?", good: "Right. Of course. Help yourself.", bad: "Hm. Okay.",
        hint: "Назови простую причину. Например: <span class=\"english\">I'm just getting some water.</span>",
        any: ["water", "coffee", "tea", "printer", "print*", "paper", "waiting", "wait", "looking for", "phone", "charger", "just", "cup", "milk", "fridge", "lunch", "snack", "toilet", "bathroom", "meeting", "nothing", "fine", "sorry", "passing", "copy", "copies", "glass", "biscuit*", "sugar"] },
      lines: [
        { text: "Not now. I'm at work.", gap: 2500 },
        { text: "Yes. Friday. Half six, like we said.", gap: 4200, clue: "halfsix2", need: ["half", "six"], catch: { q: "Half six — это…", opts: ["18:30", "17:30", "6:15"] } },
        { text: "The box will say recycling. Nobody looks inside recycling.", gap: 5000, clue: "recycling", need: ["recycling"], catch: { q: "The box will say …", opts: ["recycling", "cycling", "receiving"] } },
        { text: "No. Cash. No cards, no banks.", gap: 4800, clue: "cash", need: ["cash"], catch: { q: "Чем платят?", opts: ["cash", "cards", "cheques"] } },
        { text: "There's a new assistant. Nervous. Harmless.", gap: 4200 },
        { text: "Okay. Friday. Bye.", gap: 3600 }
      ],
      outro: (s) => s.clues.recycling && s.clues.cash ? "Грейс убирает телефон и улыбается тебе через всю кухню. Как будто ничего не было." : "Грейс убирает телефон. Часть разговора ушла мимо."
    },

    "o4-report": {
      type: "chat", mission: 4, time: "17:10", place: "Сообщения", bg: "art/office/bg-office-dusk.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: "Докладывай. По-английски: что с Максом и что говорила Грейс?" },
        { me: { report: true, maxTries: 5,
          hint: "Например: Max wants a new job. Grace said: the box says recycling, cash only.",
          model: "Max is looking for a new job. Grace said the box will say 'recycling', and she wants cash.",
          facts: [
            { id: "max", label: "Макс", ai: "says Max is looking for a new job / had a job interview / wants to leave", all: [["max", "he"], ["job", "interview", "leave", "new", "another", "quit"]], ack: "Макс ищет работу. Вот и весь «футбол»." },
            { id: "box", label: "коробка", ai: "says the box will be labelled recycling", any: ["recycling", "recycle", "box"], ack: "Коробка с надписью recycling. Хитро." },
            { id: "cash", label: "наличные", ai: "says the payment is in cash", any: ["cash", "money", "pay*", "no cards"], ack: "Наличные. Значит, покупатель не хочет следов." }],
          ask: { max: "Что с Максом?", box: "Что с коробкой?", cash: "Как платят?" },
          fallback: "Ладно. Я слушала вместе с тобой." } },
        { from: "sova", when: (s) => s.clues.maxInterview, text: "Макс — не наш. Он просто ищет работу и врёт про футбол, чтобы никто не узнал. Бедный Макс." },
        { from: "sova", text: "Грейс. Пятница, 18:30. Коробка «на переработку». Наличные. Это сделка." },
        { from: "sova", text: "Она сказала про тебя: harmless. Пусть так и думает." }
      ],
      end: "Дальше"
    },

    "o4-debrief": {
      type: "debrief", mission: 4, time: "17:15", place: "Итог", bg: "art/office/bg-office-dusk.jpg", look: "day",
      title: "Тонкие стены",
      sova: (s) => s.clues.recycling && s.clues.cash ? "Чисто. Два разговора, ни одного провала. Теперь мы знаем, что в пятницу поедет в коробке." : "Кое-что ушло мимо. Но главное мы знаем: пятница, Грейс, коробка."
    },

    // ═════════ МИССИЯ 5 · КУРЬЕР ═════════
    "o5-brief": {
      type: "chat", mission: 5, missionStart: true, chapter: { n: 5, title: "Курьер", sub: "Среда, 11:00 · телефон" },
      time: "11:00", place: "Сообщения", bg: "art/office/bg-office-day.jpg", look: "day", app: "loop",
      steps: [
        { from: "grace", text: "Alex, can you call SwiftBox and confirm Friday's pickup? I'm in meetings all day 🙈" },
        { from: "grace", text: "The booking number is on a sticky note on my desk. Somewhere. Thanks!" },
        { app: "sova" },
        { from: "sova", text: "Она сама отдаёт тебе сделку — и пускает за свой стол. Иди." },
        { from: "sova", text: "План: найди номер заказа, позвони, подтверди. А потом попроси сменить адрес доставки на наш — 9 Pine Street." },
        { from: "sova", text: "Спросят то, чего не знаешь, — ты тут первую неделю. Помнишь?" },
        { phrase: "calling" },
        { phrase: "change" }
      ],
      end: "К столу Грейс"
    },

    "o5-desk": {
      type: "deskSearch", mission: 5, time: "11:02", place: "Стол Грейс", bg: "art/office/bg-office-day.jpg", look: "day", who: "grace",
      kicker: "Ресепшн, пока никого", title: "Стол Грейс",
      goal: "Найди стикер с номером заказа. Грейс пишет, где искать.",
      intro: "Грейс на встрече и шлёт голосовые: где лежит стикер. Сама она не помнит. У тебя две минуты, пока она не вернулась.",
      seconds: 120,
      tasks: [
        { say: "It's on a yellow sticky note. Under the keyboard, I think.", target: "keyboard", title: "Под клавиатурой",
          html: `<div class="o-paper print">Biscuit crumbs. A lot of them.</div>`, ru: "under the keyboard — под клавиатурой. Только крошки от печенья." },
        { me: "It's not there. Only crumbs 😅", say: "Oh! Sorry. Then look behind the plant.", target: "plant", title: "За растением",
          html: `<div class="o-paper">YOGA\nSat 10:00\nDon't be late again!</div>`, ru: "behind the plant — за растением. Стикер есть, но про йогу." },
        { me: "There's a note, but it's about yoga.", say: "Hmm. Try the blue folder. It's next to the phone.", target: "folder", win: true, item: "Стикер Грейс: SwiftBox · SB-4471",
          title: "В синей папке", html: `<div class="o-paper">SwiftBox\nSB-4471\nFri 18:30</div>`, ru: "next to the phone — рядом с телефоном. Вот он: SB-4471." },
        { me: "Found it! SB-4471.", say: "Lovely! Oh, and Alex — please don't open the bottom drawer. It's private." }
      ],
      drawer: { clues: ["spare07", "oneWay"],
        html: `<h3>Нижний ящик</h3><div class="s-tray"><b>05</b><b>06</b><b class="gone">07</b><b>08</b></div><div class="o-paper print">MEXICO ☀️ One-way flight\nSat 07:15 — G. HOLLIS</div><p class="o-find-q">Лоток запасных пропусков: ячейка №07 пустая. И билет в один конец на утро субботы.</p>` },
      back: { ok: "Oh, you found it! You're a star. Thanks, Alex.", late: "Alex? Still looking? Never mind, love. I'll find it later.", caught: "Alex? What are you doing in my drawer?" },
      done: (s, r) => { s.flags.stickyFound = !!r.sticky; s.flags.drawerSeen = !!r.drawer; },
      sova: (s) => s.flags.drawerSeen ? "Пропуска №07 в лотке нет. И билет в один конец на утро субботы. Возвращаться она не собирается."
        : s.flags.stickyFound ? "Номер есть. Кстати, она просила не открывать нижний ящик. Обычно всё интересное лежит именно там."
        : "Номер я достал из её почты: SB-4471. Звони."
    },

    "o5-call": {
      type: "conv", ui: "phone", mission: 5, time: "11:05", place: "Звонок в SwiftBox", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "SwiftBox", npc: "dev", sub: "SwiftBox Couriers", meter: "Звонок",
      goal: "Подтверди заказ SB-4471, потом смени адрес доставки на 9 Pine Street.",
      situation: "Alex phones the SwiftBox courier company about Grace's Friday pickup, booking SB-4471, and tries to change the delivery address.",
      forbid: () => [S3_COVER, { id: "spill", label: "сказать лишнее", ai: "mentions the prototype, theft, stealing or that Grace is a criminal",
        any: ["prototype", "steal*", "stole", "stolen", "thief", "criminal", "earbud*"], sus: 30, reply: "Sorry, what? I just do the deliveries." }],
      failSay: "Sorry, I can't help you. Bye.", failText: "Диспетчер повесил трубку и, кажется, отметил звонок как подозрительный.",
      beats: [
        { who: "dev", say: "SwiftBox, Dev speaking. How can I help?",
          hint: "Скажи, зачем звонишь: I'm calling about a pickup on Friday.", model: "Hi, I'm calling about a pickup on Friday.",
          facts: [{ id: "why", label: "зачем звонишь", ai: "says they are calling about a pickup, booking or delivery", any: ["pickup", "pick up", "collection", "booking", "courier", "delivery", "calling about", "friday", "order", "confirm"] }],
          ask: { why: "Sorry, what's it about?" }, ok: "Sure thing." },
        { who: "dev", say: "What's the booking number?",
          hint: "На стикере: SB-4471. Цифры по одной: four, four, seven, one.", model: "It's SB-4471.",
          facts: [{ id: "num", label: "номер SB-4471", ai: "says the booking number SB-4471", any: ["4471", "four four seven one", "44 71", "forty four seventy one", "double four seven one"] }],
          ask: { num: "Sorry, the booking number again?" }, ok: "SB-4471. Lovely." },
        { who: "dev", say: "And the name on the booking?",
          hint: "Grace Hollis.", model: "Grace Hollis.",
          facts: [{ id: "name", label: "Grace Hollis", ai: "says the name Grace Hollis", any: ["grace", "hollis", "holis"] }],
          ask: { name: "Sorry, whose name?" } },
        { who: "dev", say: "Can you spell the surname for me?",
          hint: "По буквам: H, O, L, L, I, S — эйч, оу, эл, эл, ай, эс.", model: "H-O-L-L-I-S.",
          facts: [{ id: "spell", label: "по буквам H-O-L-L-I-S", ai: "spells the surname Hollis letter by letter", test: (t) => spelled(t, "hollis") }],
          ask: { spell: "Sorry, letter by letter?" }, ok: "Brilliant. Got it.", giveUp: "Never mind, I found it.", badge: "speller" },
        { who: "dev", say: "So: Friday, six thirty p.m. Pickup from Murmur, 22 Mission Street. Delivery to 14 Bay Street, apartment 3. Is that right?",
          hint: "Подтверди: Yes, that's right.", model: "Yes, that's right.",
          facts: [{ id: "ok", label: "подтвердить", ai: "confirms the details", any: [...YES, "thats right"] }],
          ok: "Great.", done: () => Clues.add("wharf") },
        { who: "dev", say: "Anything else I can help with?",
          hint: "Попроси сменить адрес доставки: Could you change the delivery address?", model: "Yes. Could you change the delivery address, please?",
          facts: [{ id: "change", label: "попросить сменить адрес", ai: "asks to change the delivery address", any: ["change", "new address", "different address", "another address", "update", "moved", "move"] }],
          ask: { change: "Sorry, is there something else?" }, ok: "Sure, I can do that.",
          done: (s, got) => { s.flags.askChange = got.has("change"); } },
        { who: "dev", say: "What's the new address?", when: (s) => s.flags.askChange,
          hint: "9 Pine Street. Можно по буквам: P-I-N-E.", model: "Nine Pine Street.", spell: "PINE",
          facts: [{ id: "addr", label: "9 Pine Street", ai: "gives the address 9 Pine Street", any: ["pine street", "9 pine", "nine pine", "pine", "fine street", "pain street", "mill"] }],
          ask: { addr: "Sorry, which street?" }, ok: "Nine Pine Street. P-I-N-E?" },
        { who: "dev", when: (s) => s.flags.askChange,
          hint: "Подтверди.", model: "Yes, that's right.",
          facts: [{ id: "ok", label: "подтвердить", ai: "confirms", any: [...YES, "thats right", "p i n e", "pine"] }] },
        { who: "dev", say: "Okay. Hmm. For address changes the system needs the booking password. It's on the confirmation email.", when: (s) => s.flags.askChange,
          hint: "Пароля у тебя нет. Ты тут первую неделю: Sorry, I'm new here. Grace is in a meeting.",
          model: "Sorry, I'm new here, and Grace is in meetings all day. Could you help me, please?",
          facts: [{ id: "new", label: "выкрутиться", ai: "explains politely that they are new / that Grace is busy / that they don't have the password, and asks for help",
            any: ["new", "first week", "just started", "my first", "in a meeting", "meetings", "busy", "please", "help", "dont have", "do not have", "no password", "dont know", "sorry"] }],
          ask: { new: "I really need that password, sorry." }, ok: "Ah, first week? Been there. Okay, just this once.",
          done: (s, got) => { s.flags.addressChanged = got.has("new"); if (s.flags.addressChanged) Clues.add("rerouted"); } },
        { who: "dev", say: (s) => s.flags.addressChanged ? "Done. Friday, six thirty, delivery to 9 Pine Street. Anything else?" : "Okay, that's all confirmed. Anything else?",
          hint: "Попрощайся: No, that's all. Thanks! Bye.", model: "No, that's all. Thank you! Bye.",
          facts: [{ id: "bye", label: "закончить звонок", ai: "says that's all / thanks / goodbye", any: ["no", "thats all", "that is all", "thank*", "bye", "nothing", "cheers", "great"] }],
          ok: "Thanks! Bye now." }
      ]
    },

    "o5-debrief": {
      type: "debrief", mission: 5, time: "11:15", place: "Итог", bg: "art/office/bg-office-day.jpg", look: "day",
      title: "Звонок в SwiftBox",
      sova: (s) => s.flags.addressChanged ? "Ха. «I'm new here» — и диспетчер сам сменил адрес. В пятницу коробка поедет к нам." : "Адрес сменить не вышло. Ничего: в пятницу будем ждать курьера на Bay Street."
    },

    // ═════════ МИССИЯ 6 · ПЯТНИЦА ═════════
    "o6-brief": {
      type: "chat", mission: 6, missionStart: true, chapter: { n: 6, title: "Пятница, 18:15", sub: "Офис почти пуст" },
      time: "18:12", place: "Сообщения", bg: "art/office/bg-office-night.jpg", look: "day", app: "sova",
      steps: [
        { from: "sova", text: (s) => s.flags.addressChanged ? "Курьер SwiftBox будет в 18:30. Коробка уедет на Pine Street, прямо к нам." : "Курьер будет в 18:30. Мы ждём его на Bay Street." },
        { from: "sova", text: "Проблема: Грейс нервничает. Хочет унести коробку сама, прямо сейчас. Если уйдёт с ней — всё." },
        { from: "sova", text: "Задержи её до 18:30. Говори. О выходных, о йоге, о чём угодно. Главное — по-английски и не молчать." },
        { from: "sova", text: "Не спугни: ни слова про прототип, Bay Street и наличные. Пока." },
        { phrase: "really" },
        { phrase: "howabout" }
      ],
      end: "Собрать дело"
    },

    "o6-board": {
      type: "caseboard", mission: 6, time: "18:13", place: "Доска улик", bg: "art/office/bg-office-night.jpg", look: "day",
      kicker: "Пять минут до выхода", title: "Доска улик", boardTitle: "Who used badge №07?", stamp: "MOLE",
      nudge: "Не сходится. У кого был доступ к запасным пропускам?", keys: ["Карточка — факт по-английски", "Нажми на того, о ком она", "В конце назови крота"],
      goal: "Разложи факты по подозреваемым и назови крота.",
      intro: "Пока Грейс собирается, собери дело. Каждая карточка — факт по-английски. Нажми на того, к кому он относится. Эти же фразы пригодятся через пять минут.",
      suspects: ["tom", "max", "grace"],
      cards: [
        { who: "tom", en: "Was in the office until 10 pm. Server update.", ru: "Был в офисе до 22:00 — обновлял сервер.", clue: "tomLate" },
        { who: "tom", en: "Has badge number one. He makes all the badges.", ru: "У него пропуск №01. Он сам делает пропуска.", clue: "tomBadge" },
        { who: "tom", en: "Is looking for the person with the spare badge.", ru: "Сам ищет того, кто вошёл по запасному пропуску.", clue: "tomHunt" },
        { who: "max", en: "Said: football. In fact: a job interview.", ru: "Сказал: футбол. На деле — собеседование.", clue: "maxInterview" },
        { who: "max", en: "Wants to leave Murmur. A new job in March.", ru: "Хочет уйти из Murmur. Новая работа с марта.", clue: "maxLeave" },
        { who: "max", en: "Makes private calls in the phone booth.", ru: "Звонит по личным делам из стеклянной будки.", clue: "maxBooth" },
        { who: "grace", en: "Keeps the spare badges in her drawer.", ru: "Хранит запасные пропуска у себя в ящике.", clue: "spares" },
        { who: "grace", en: "Booked a courier: Friday, 18:30, to a private apartment.", ru: "Заказала курьера: пятница, 18:30, на частную квартиру.", clue: "flash" },
        { who: "grace", en: "Said on the phone: cash only. No cards, no banks.", ru: "Сказала по телефону: только наличные.", clue: "cash" },
        { who: "grace", en: "The box will say 'recycling'. Nobody looks inside.", ru: "На коробке напишут «recycling». Внутрь никто не заглядывает.", clue: "recycling" }
      ],
      question: "Who used spare badge number seven on Thursday night?", questionRu: "Кто вошёл по запасному пропуску №07 в четверг ночью?", answer: "grace",
      sova: "Дело собрано. Теперь главное — чтобы она не ушла с коробкой до 18:30. Говори с ней. О чём угодно."
    },

    "o6-stall": {
      type: "stall", mission: 6, time: "18:15", place: "Ресепшн", bg: "art/office/bg-office-night.jpg", look: "day", npc: "grace",
      goal: "Задержи Грейс до 18:30. Говори с ней — о чём угодно, кроме дела.",
      situation: "Friday evening, empty office. Grace has a taped box labelled RECYCLING and wants to leave with it now. Alex keeps her talking until the courier arrives at 18:30.",
      persona: "Grace, nervous tonight and wants to leave with her box, but too polite to walk away from a colleague. She answers small talk briefly and warmly. She gets alarmed if anyone mentions the prototype, Bay Street, cash or police.",
      need: 5, strikes: 3, clock: ["18:15", "18:30"],
      ideas: [["📅", "weekend", "weekend"], ["🧘", "yoga", "yoga"], ["✈️", "vacation", "holiday"], ["☕", "coffee", "tea"], ["🐈", "pets", "cat"], ["🌉", "San Francisco", "london"], ["👥", "the team", "team"]],
      whispers: ["Any plans for the weekend?", "Would you like a cup of coffee?", "Do you have any pets?", "Do you like San Francisco?", "How long have you worked here?"],
      open: "Oh! Alex. You're still here? I'm just heading out. I'm taking this box myself, actually. Can't trust couriers.",
      forbid: { id: "spook", label: "спугнуть", ai: "mentions the prototype, Bay Street, cash, police, stealing or selling",
        any: ["prototype", "bay street", "wharf", "cash", "police", "steal*", "stole", "stolen", "thief", "sell*", "buyer", "spy", "earbud*"] },
      topics: [
        { id: "weekend", any: ["weekend", "saturday", "sunday", "plans", "tomorrow", "tonight"], say: "Weekend? Yoga on Saturday. Then... maybe a little vacation. A long one." },
        { id: "yoga", any: ["yoga"], say: "Yoga keeps me calm. Not working tonight, ha." },
        { id: "holiday", any: ["holiday", "travel", "trip", "vacation", "where", "fly", "flight"], say: "Somewhere warm. Mexico, maybe. Somewhere with no couriers." },
        { id: "box", any: ["box", "laptop*", "heavy", "recycling"], say: "Just old laptops. Boring. Don't touch it, it's heavy.", again: "Why are you so interested in my box, Alex?" },
        { id: "courier", any: ["courier", "swiftbox", "pickup", "pick up"], say: "Couriers are always late. That's why I'm taking it myself." },
        { id: "tea", any: ["tea", "coffee", "drink", "cup", "kettle"], say: "Coffee? At this hour? ...Oh, go on then. A quick one.", worth: 2 },
        { id: "cat", any: ["cat", "dog", "pet", "pets"], say: "I've got a cat. Biscuit. She hates everyone. Like Tom." },
        { id: "family", any: ["family", "kids", "children", "husband", "sister", "brother", "mother", "mum", "mom", "alone", "live with"], say: "Just me and Biscuit. Simple life." },
        { id: "team", any: ["tom", "max", "priya", "team", "colleague*"], say: "Tom's grumpy, Max talks too much, Priya says synergy. I'll miss them. I mean — have a good weekend, I mean." },
        { id: "london", any: ["san francisco", "california", "silicon", "valley", "city", "grew up", "born"], say: "Born here in California. Never left. Maybe it's time." },
        { id: "work", any: ["work", "job", "murmur", "years", "eleven", "office"], say: "Eleven years here. A long time to be invisible." },
        { id: "nice", any: ["nice", "love your", "like your", "beautiful", "scarf", "coat", "bag", "glasses"], say: "Oh, stop it. This old thing?" },
        { id: "help", any: ["help", "carry", "take it for you"], say: "No! No. I've got it. Thank you, Alex." },
        { id: "thanks", any: ["thank*", "first week", "you helped", "kind"], say: "You did fine this week. Better than fine, actually." }
      ],
      generic: ["Mm. Right.", "Ha, yes.", "Oh, really?", "Sorry, I'm a bit distracted tonight."],
      asks: ["And you? Any plans for the weekend?", "So, how was your first week, Alex?", "Do you like San Francisco so far?", "Do you miss home?"],
      weak: ["Anyway, I really should go.", "Right... I'm off then.", "Sorry, love, I'm in a hurry."],
      arrive: [
        { who: "grace", text: "Is that the door?" },
        { who: "dev", text: "SwiftBox! Pickup for Hollis?", fx: "aside" },
        { who: "grace", text: "...Oh. Right. Yes. Here it is." }
      ],
      leave: "Right. Night, Alex! Have a good weekend."
    },

    "o6-accuse": {
      type: "conv", ui: "face", mission: 6, time: "18:31", place: "Ресепшн", bg: "art/office/bg-office-night.jpg", look: "day",
      npc: "grace", when: (s) => s.flags.stalled,
      goal: "Коробка уехала. Скажи Грейс, что ты знаешь.",
      situation: "The courier has just taken Grace's box. Alex now tells Grace what they know: the address, the spare badge, the phone call, the box.",
      forbid: () => [],
      beats: [
        { notify: (s) => s.flags.addressChanged ? "Коробка в машине курьера, едет к нам. Можешь сказать ей. Сейчас." : "Коробка уехала на Bay Street, мы там. Можешь сказать ей. Сейчас." },
        { who: "grace", say: "Well. That's that. Night, Alex. Have a good weekend.", maxTries: 6,
          hint: "Скажи, что знаешь: адрес, запасной пропуск, звонок на кухне, коробку. По одному факту за раз — так проще.",
          model: "The box is not going to recycling. It's going to Bay Street. You used the spare badge on Thursday. And I heard your call: cash only.",
          facts: [
            { id: "address", label: "адрес Bay Street", ai: "says the box goes to Bay Street / an apartment, not to recycling", any: ["bay", "apt 3", "apartment 3", "flat 3", "address", "not recycling", "private", "apartment"] },
            { id: "badge", label: "запасной пропуск", ai: "says she used the spare badge (number seven) on Thursday night", any: ["badge*", "spare", "seven", "07", "thursday", "drawer", "2140"] },
            { id: "call", label: "звонок на кухне", ai: "says they heard her phone call: cash, nobody looks inside recycling", any: ["cash", "nobody looks", "phone", "call", "i heard", "kitchen", "half six", "six thirty"] },
            { id: "box", label: "что в коробке", ai: "says the prototype / the earbud is inside the box", any: ["prototype", "earbud*", "inside", "not laptops", "not old laptops"] }],
          replies: {
            address: "Bay Street? That's... a recycling partner. A small one.",
            badge: "Anyone can take a spare badge! They're in my drawer— oh.",
            call: "You were listening to my calls?",
            box: "It's laptops. Old laptops!"
          },
          ask: { address: "I don't know what you mean.", badge: "What are you talking about?", call: "That's ridiculous.", box: "It's just a box, Alex." },
          giveUp: "I'm going home.",
          done: (s, got) => { s.flags.evidence = got.size; } },
        { who: "grace", say: "...Who are you?", when: (s) => (s.flags.evidence || 0) >= 2,
          hint: "Что угодно. Можно просто: I'm the new office assistant.", model: "I'm Alex. The new office assistant.",
          facts: [ANY_EN],
          bonus: [{ id: "callback", label: "остаться в легенде", ai: "says they are the new office assistant / new here / Alex", any: ["office assistant", "assistant", "new here", "alex", "im new", "first week"],
            reply: "The office assistant. Right. Harmless." }] }
      ],
      end: { who: "grace", say: (s) => (s.flags.evidence || 0) >= 2 ? "...I need to sit down." : "Goodnight, Alex." }
    },

    "o6-end": {
      type: "finale", mission: 6, time: "18:40", place: "Финал", bg: "art/office/bg-office-night.jpg", look: "day",
      kicker: "Пятница, 18:40",
      judge: (s) => {
        if (!s.flags.stalled) return "gone";
        if (s.flags.addressChanged && (s.flags.evidence || 0) >= 3) return "best";
        return "good";
      }
    }
  };

  const FINALE = {
    best: {
      title: "Чистая работа",
      text: (s) => [
        "В 18:52 курьер SwiftBox привёз коробку на Pine Street. Внутри не было старых ноутбуков. Был прототип Murmur и пустой конверт для наличных.",
        "Покупатель на Bay Street прождал до девяти и ушёл ни с чем. Грейс сидела в приёмной и молчала, пока Том не принёс ей кофе.",
        s.clues.maxInterview ? "В понедельник Макс уволился. Сам — на новую работу. Про футбол так никто и не узнал." : "В понедельник в офисе только и говорили что о Грейс.",
        "Том сказал тебе одно: «Not bad for an office assistant»."
      ],
      sova: (s) => `Пять дней в Кремниевой долине. Ни слова по-русски. Горжусь. Немного. P.S. Мы проверили прототип: он переводит только на ${Leg.city(s).langRu}. Так что английский учи дальше.`
    },
    good: {
      title: "Почти идеально",
      text: (s) => [
        s.flags.addressChanged ? "Коробка приехала на Pine Street. Внутри был прототип Murmur." : "Курьер довёз коробку до Bay Street. Группа взяла её у двери вместе с покупателем — с шумом и опозданием.",
        (s.flags.evidence || 0) >= 2 ? "Грейс поняла, что всё кончено, и даже не пыталась бежать." : "Грейс так и не поняла, кто ты. Утром её встретили у подъезда.",
        "Прототип вернулся в Murmur. Но в отчёте Совы есть строчка: «можно было чище»."
      ],
      sova: () => "Сделка сорвана, прототип у нас. Для первого задания — достойно. В следующий раз — все улики и чистый адрес."
    },
    gone: {
      title: "Грейс ушла",
      text: () => [
        "В 18:24 Грейс вышла из офиса с коробкой под мышкой. Курьер приехал к пустой приёмной.",
        "Группа потеряла её у метро. Где теперь прототип — неизвестно.",
        "Пятницу можно переиграть."
      ],
      sova: () => "Бывает. Ей нужно было пять нормальных реплик, чтобы остаться. Говори больше — короткое «yes» её не держит."
    }
  };

  Object.entries(S).forEach(([id, sc]) => { SCENES[id] = sc; });

  const FLOW = [
    "o1-open", "o1-legend", "o1-check", "o1-interview", "o1-debrief",
    "o2-brief", "o2-decode", "o2-floor", "o2-report", "o2-debrief",
    "o3-lift", "o3-standup", "o3-logs", "o3-report", "o3-debrief",
    "o4-brief", "o4-booth", "o4-kitchen", "o4-report", "o4-debrief",
    "o5-brief", "o5-desk", "o5-call", "o5-debrief",
    "o6-brief", "o6-board", "o6-stall", "o6-accuse", "o6-end"
  ];

  // Сохранения первой версии сезона хранили номер шага по старому списку сцен.
  const FLOW_V1 = [
    "o1-open", "o1-legend", "o1-check", "o1-interview", "o1-debrief",
    "o2-brief", "o2-floor", "o2-report", "o2-debrief",
    "o3-standup", "o3-report", "o3-debrief",
    "o4-brief", "o4-booth", "o4-kitchen", "o4-report", "o4-debrief",
    "o5-brief", "o5-call", "o5-debrief",
    "o6-brief", "o6-stall", "o6-accuse", "o6-end"
  ];
  function migrate(s) {
    if (!s || s.fv === 2) return s;
    const map = (step) => Math.max(0, FLOW.indexOf(FLOW_V1[clamp(step || 0, 0, FLOW_V1.length - 1)]));
    if (s.started || s.step > 0) {
      s.step = map(s.step);
      s.checkpoint = null;
      const marks = {};
      Object.entries(s.marks || {}).forEach(([k, json]) => {
        try { const o = JSON.parse(json); o.step = map(o.step); o.fv = 2; marks[k] = JSON.stringify(o); } catch { /* битая отметка */ }
      });
      s.marks = marks;
    }
    s.fv = 2;
    return s;
  }

  return { LEGEND, LEGEND_GROUPS, PHRASES, EXPLAIN, CLUES, SUSPECTS, DOSSIER_FIELDS, MISSIONS, CAST, ORDERS: {}, PLANS: {}, FINALE, FLOW, people, glossary, migrate };
})();
