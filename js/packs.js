// Два сезона на одном движке. Таблицы сезона (легенда, фразы, улики, миссии, порядок сцен) лежат в общих переменных;
// при входе в сезон Pack.use подменяет их содержимое. Люди, словарь и сцены общие: их id не пересекаются.
// Внутри игры оба сезона — «сезон 3»; различаются ключом сохранения и номером в кнопках титула (3 и 4).

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
  use(id) {
    if (!PACKS[id]) id = "relay";
    this.cur = id;
    this.put(PACKS[id]);
    document.body.dataset.pack = id;
  },
  meta(id = this.cur) { return (PACKS[id] || PACKS.relay).meta; },
  list: () => ["moon", "relay"]
};

PACKS.relay = {
  ...Pack.snap(),
  meta: {
    id: "relay", season: 3, key: "iney-relay", tab: "Последняя миля",
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
    id: "moon", season: 4, key: "iney-moon", tab: "Дождь на Луне",
    kicker: "Новый сезон · шесть смен", title: "Дождь на Луне", unit: "Смена", cta: "Лететь",
    lead: "Лунный город Порт Шеклтон. Контора Keepsake покупает у людей воспоминания. Кто-то скупил девять воспоминаний об одной и той же ночи.",
    bg: "set:dome", look: "cine",
    dossierNote: "Ночь 14 марта: кто её помнит, кто продал и кто за это заплатил.",
    legendKicker: "Легенда · новый житель Порта Шеклтон", legendLead: "Frost — «иней». На Луну ты прилетел(а) работать, контракт на два года. Остальное выбери: потом это придётся говорить вслух, и не один раз.",
    searchFail: "Камера записала тебя дважды. Утром запись посмотрит охрана — в архив тебе больше не войти.",
    legend3: "Скучаю", legendMore: [["На Луне", "I arrived two weeks ago."], ["Работа здесь", "I work at Keepsake."]]
  }
};

Pack.use("relay");
