// Облачная модель: понимает ответ игрока по смыслу и пишет реплику персонажа.
// Ключ хранится только в localStorage этого браузера; запросы идут напрямую к провайдеру.

const AI = (() => {
  const PROVIDERS = {
    none: { label: "Без модели: проверка по ключевым словам" },
    openai: { label: "OpenAI", url: "https://api.openai.com/v1/chat/completions", model: "gpt-4.1-mini", style: "openai" },
    anthropic: { label: "Anthropic (Claude)", url: "https://api.anthropic.com/v1/messages", model: "claude-haiku-4-5", style: "anthropic" },
    openrouter: { label: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", model: "openai/gpt-4.1-mini", style: "openai" },
    custom: { label: "Свой адрес (OpenAI-совместимый)", url: "http://localhost:11434/v1/chat/completions", model: "llama3.1", style: "openai" }
  };
  let failures = 0;

  function enabled() {
    const s = Settings.get();
    if (s.provider === "none" || !PROVIDERS[s.provider]) return false;
    if (failures >= 3) return false;
    return s.provider === "custom" ? !!(s.baseUrl || PROVIDERS.custom.url) : !!s.apiKey;
  }

  async function call(system, user, maxTokens = 700) {
    const s = Settings.get();
    const p = PROVIDERS[s.provider];
    const url = s.provider === "custom" ? (s.baseUrl || p.url) : p.url;
    const model = s.model || p.model;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      let res, data;
      if (p.style === "anthropic") {
        res = await fetch(url, {
          method: "POST", signal: ctrl.signal,
          headers: { "content-type": "application/json", "x-api-key": s.apiKey, "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.4, system, messages: [{ role: "user", content: user }] })
        });
        data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data.error && data.error.message) || "HTTP " + res.status);
        return (data.content || []).map((c) => c.text || "").join("");
      }
      const headers = { "content-type": "application/json" };
      if (s.apiKey) headers.authorization = "Bearer " + s.apiKey;
      const body = { model, messages: [{ role: "system", content: system }, { role: "user", content: user }] };
      if (s.provider === "openai") {
        body.max_completion_tokens = maxTokens * 3;
        body.response_format = { type: "json_object" };
      } else {
        body.max_tokens = maxTokens;
        body.temperature = 0.4;
        if (s.provider === "openrouter") body.response_format = { type: "json_object" };
      }
      res = await fetch(url, { method: "POST", signal: ctrl.signal, headers, body: JSON.stringify(body) });
      data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data.error && (data.error.message || data.error)) || "HTTP " + res.status);
      return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    } finally {
      clearTimeout(timer);
    }
  }

  function parse(text) {
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    if (a < 0 || b < a) throw new Error("модель ответила не JSON");
    return JSON.parse(text.slice(a, b + 1));
  }

  const JUDGE_SYSTEM = `You run the dialogue in "Iney", a spy game that teaches English to Russian speakers who find English hard (level A1-B1).
The player talks to a game character in English: by voice (speech recognition, so expect recognition errors, no punctuation, digits instead of words, homophones like "for"/"four", "to"/"two") or by typing (expect broken grammar and typos).
Judge MEANING, not exact words. A fact counts if a patient native speaker would understand it, even with mistakes. Never count something that was not actually said. Numbers must be right: 900 is not 9000, a code must have the right digits, times must match.
Answer with ONE JSON object and nothing else.`;

  function judgePrompt(p) {
    const list = (arr, extra) => arr.length ? arr.map((f) => `- ${f.id}: ${f.ai || f.label}${extra ? extra(f) : ""}`).join("\n") : "(none)";
    const lang = p.lang === "ru" ? "Russian" : "English";
    return `CHARACTER: ${p.npc.name}. ${p.npc.persona}
SITUATION: ${p.situation}
THE CHARACTER JUST SAID: "${p.said}"

REQUIRED FACTS still missing (id: meaning):
${list(p.facts)}
ALREADY SAID EARLIER: ${p.done.length ? p.done.join(", ") : "nothing"}

OPTIONAL ACTIONS the player may take (id: meaning):
${list(p.bonus, (b) => (b.reply ? " (the game itself answers this; do not repeat that answer)" : ""))}

FORBIDDEN, saying this hurts the player's cover (id: meaning):
${list(p.forbid)}

RECENT DIALOGUE:
${p.history.map((h) => `${h.who}: ${h.text}`).join("\n") || "(start)"}

WORDS THE PLAYER STRUGGLES WITH (use one naturally in the reply if it fits): ${p.weak.join(", ") || "none"}

PLAYER SAYS NOW: "${p.utterance}"

Return JSON with keys:
"facts": ids of REQUIRED facts communicated in this utterance,
"bonus": ids of OPTIONAL actions taken,
"leaks": ids of FORBIDDEN things said,
"repeat": true if the player asks to repeat, says they did not understand, or asks to speak slower,
"gave_up": true if the player says they don't know or don't remember,
"suspicion": integer 0-20, extra suspicion if the answer is strange, rude or out of character for an ordinary person (leaks are counted separately), usually 0,
"reply": the character's next line in ${lang}, at most 2 short sentences${p.lang === "ru" ? "" : ", simple A2 words"}, in character. If required facts are still missing after this utterance, react briefly and ask about ONE missing fact in simple words. If nothing is missing, a short reaction with NO question. If the player leaked something forbidden, react in character (surprised, suspicious). If the player asked to repeat, say the last line again in simpler words,
"tip_ru": one short sentence in Russian showing a more natural English way to say what the player meant, the English phrase in «quotes». Empty string if the English was fine.
If the player spoke mostly Russian: "facts" must be empty and the reply must ask them to speak English.`;
  }

  async function judge(p) {
    try {
      const out = parse(await call(JUDGE_SYSTEM, judgePrompt(p)));
      failures = 0;
      return out;
    } catch (e) {
      failures += 1;
      if (failures === 3) UI.toast("Модель трижды не ответила. До перезагрузки проверяю по ключевым словам.", "bad", 6000);
      throw e;
    }
  }

  async function translate(word, sentence) {
    const out = await call("You translate English words for a Russian learner. Answer with one JSON object only.",
      `Word or phrase: "${word}". Sentence: "${sentence}". Give the Russian meaning of the word as used in this sentence, 1-4 words. JSON: {"ru": "..."}`, 120);
    return parse(out);
  }

  async function ping() {
    const out = await call("Answer with one JSON object only.", 'Say hello. JSON: {"ok": true, "hello": "..."}', 60);
    return parse(out);
  }

  return { PROVIDERS, enabled, judge, translate, ping, resetFailures: () => { failures = 0; } };
})();
