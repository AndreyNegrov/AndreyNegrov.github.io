// Несколько сезонов на одном движке. Таблицы сезона (легенда, фразы, улики, миссии, порядок сцен) лежат в общих переменных;
// при входе в сезон Pack.use подменяет их содержимое. Сцены общие: их id не пересекаются.
// Внутри игры все эти сезоны — «сезон 3»; различаются ключом сохранения и номером в кнопках титула (meta.season).
// Если у сезона свои люди или слова с теми же id, что у других (Сова, «Вы», night…), они лежат в pack.people / pack.glossary
// и подключаются только на время сезона. Вид сезона — meta.theme: "night" (по умолчанию) или "toon" (см. Theme в js/core.js).

const PACKS = {};

const Pack = {
  cur: "relay",
  tables() { return { LEGEND, LEGEND_GROUPS, PHRASES, EXPLAIN, CLUES, SUSPECTS, DOSSIER_FIELDS, MISSIONS, CAST, ORDERS, PLANS, FINALE, FLOW: FLOW3 }; },
  snap() {
    const t = this.tables(), out = {};
    for (const k in t) out[k] = Array.isArray(t[k]) ? [...t[k]] : { ...t[k] };
    return out;
  },
  put(pack) {
    const t = this.tables();
    for (const k in t) {
      const dst = t[k], src = pack[k];
      if (!src) continue;
      if (Array.isArray(dst)) { dst.length = 0; dst.push(...src); }
      else { Object.keys(dst).forEach((x) => delete dst[x]); Object.assign(dst, src); }
    }
  },
  // Люди и словарь сезона поверх общих. Прежние значения запоминаются и возвращаются при смене сезона.
  _saved: [],
  overlay(pack) {
    for (const [tbl, k, had, v] of this._saved.reverse()) { if (had) tbl[k] = v; else delete tbl[k]; }
    this._saved = [];
    const lay = (tbl, src) => Object.entries(src || {}).forEach(([k, v]) => { this._saved.push([tbl, k, k in tbl, tbl[k]]); tbl[k] = v; });
    lay(PEOPLE, pack.people);
    lay(GLOSSARY, pack.glossary);
  },
  use(id) {
    if (!PACKS[id]) id = "relay";
    this.cur = id;
    this.put(PACKS[id]);
    this.overlay(PACKS[id]);
    document.body.dataset.pack = id;
  },
  meta(id = this.cur) { return (PACKS[id] || PACKS.relay).meta; },
  bySeason(n) { return Object.values(PACKS).find((p) => p.meta.season === n) || null; },
  list: () => ["office", "halo", "moon", "relay"]
};

PACKS.halo = {
  ...HALO,
  meta: {
    id: "halo", season: 6, key: "iney-halo", tab: "Город слушается", isNew: true, soon: true, theme: "toon",
    heat: "След", failKicker: "Не вышло",
    kicker: "Шесть ночей", title: "Город слушается", unit: "Ночь", cta: "Сесть в такси",
    lead: "2031 год, остров Хейло. Здесь нет руля и выключателей: город слушается голоса. Ты приехал на ночную смену.",
    bg: "art/halo/bg-title.jpg", look: "cine",
    dossierNote: "Ночь на острове Хейло. Команды пишет Леджер.",
    legendKicker: "Легенда", legendLead: "Имя, город и работа — из того, что ты скажешь вслух.",
    legend3: "Смена", legendMore: []
  }
};

PACKS.relay = {
  ...Pack.snap(),
  meta: {
    id: "relay", season: 3, key: "iney-relay", tab: "Последняя миля", soon: true,
    kicker: "Сезон · шесть ночей", title: "Последняя миля", unit: "Ночь", cta: "Выйти на линию",
    lead: "Ночной Лондон. Приложение доставки Relay возит не только еду. Трое курьеров уже исчезли. Ты — четвёртый.",
    bg: "art/lobby.jpg", look: "cine",
    dossierNote: typeof DOSSIER_NOTE !== "undefined" ? DOSSIER_NOTE : "",
    legend3: "Транспорт", legendMore: [["В Лондоне", "I've been in London for two months."]]
  }
};

PACKS.moon = {
  ...MOON,
  meta: {
    id: "moon", season: 4, key: "iney-moon", tab: "Дождь на Луне", isNew: true, soon: true,
    kicker: "Новый сезон · шесть смен", title: "Дождь на Луне", unit: "Смена", cta: "Лететь",
    lead: "Лунный город Порт Шеклтон. Контора Keepsake покупает у людей воспоминания. Кто-то скупил девять воспоминаний об одной и той же ночи.",
    bg: "set:dome", look: "cine",
    dossierNote: "Ночь 14 марта: кто её помнит, кто продал и кто за это заплатил.",
    legendKicker: "Легенда · новый житель Порта Шеклтон", legendLead: "Frost — «иней». На Луну ты прилетел(а) работать, контракт на два года. Остальное выбери: потом это придётся говорить вслух, и не один раз.",
    searchFail: "Камера записала тебя дважды. Утром запись посмотрит охрана — в архив тебе больше не войти.",
    legend3: "Скучаю", legendMore: [["На Луне", "I arrived two weeks ago."], ["Работа здесь", "I work at Keepsake."]]
  }
};

// Мультяшный сезон. Ключ сохранения прежний — «iney-s3»: так подхватывается прогресс из старой версии игры, если он есть в этом браузере.
PACKS.office = {
  ...OFFICE,
  meta: {
    id: "office", season: 5, key: "iney-s3", tab: "Онбординг", isNew: true, theme: "toon",
    kicker: "Сезон · 6 миссий", title: "Онбординг", unit: "Миссия", cta: "Начать сезон",
    lead: "Тебя взяли офис-ассистентом в лондонский стартап. Внутри — крот, сделка в пятницу. Переводчика нет: твой английский и есть твоя легенда.",
    bg: "art/office/bg-title.jpg", look: "cine",
    dossierNote: "Подозреваемые: у кого был пропуск №07 в прошлый четверг в 21:40.",
    legendKicker: "Легенда · рабочая виза UK",
    legendLead: "Frost — это «иней». Сова считает, что это смешно. В Лондоне — два месяца: two months.",
    legendNote: "Каждую строку тебе придётся сказать вслух. Её будут проверять — и не один раз.",
    legendPhrases: ["from", "worked"],
    legend3: "Хобби", legendMore: [["В Лондоне", "I've been in London for two months."]],
    replayLast: "Переиграть пятницу",
    endNote: "Конец сезона «Онбординг». Тренировка и стикеры — в главном меню."
  }
};

Pack.use("office");
