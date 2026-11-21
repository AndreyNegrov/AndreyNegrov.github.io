// Плоские портреты сезона «Онбординг»: один стиль для всех, без фотографий.
// Face.svg(params, cls, { mood, bare }) возвращает SVG 100×100.
// mood: neutral | happy | wow | sus | hm | angry | sad — лицо реагирует на ответы игрока.
// bare: без фона, чтобы персонаж стоял прямо в сцене.

const Face = (() => {
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = (s) => clamp(Math.round(((n >> s) & 255) * k), 0, 255);
    return "#" + [ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, "0")).join("");
  };

  const HAIR_BACK = {
    long: (c) => `<path d="M30 40 C28 20 72 20 70 40 L74 86 C64 92 36 92 26 86 Z" fill="${c}"/>`,
    bob: (c) => `<path d="M30 42 C28 18 72 18 70 42 L71 62 C64 66 36 66 29 62 Z" fill="${c}"/>`,
    bun: (c) => `<circle cx="50" cy="17" r="9" fill="${c}"/>`
  };
  const HAIR_FRONT = {
    short: (c) => `<path d="M32 40 C30 22 44 18 52 19 C64 19 71 27 68 40 C64 31 56 28 49 29 C42 29 36 32 32 40 Z" fill="${c}"/>`,
    messy: (c) => `<path d="M31 41 C28 26 36 17 46 18 L49 14 L53 18 L58 15 L60 20 C68 22 72 30 69 41 C66 32 60 29 54 29 L50 32 L46 29 C40 30 34 34 31 41 Z" fill="${c}"/>`,
    quiff: (c) => `<path d="M32 40 C30 26 38 16 50 14 C58 12 66 15 67 21 C70 26 70 33 68 40 C64 31 57 28 50 28 C42 28 36 33 32 40 Z" fill="${c}"/><path d="M48 15 C56 10 66 13 66 20" stroke="${shade(c, 1.35)}" stroke-width="1.6" fill="none"/>`,
    bob: (c) => `<path d="M31 44 C29 23 42 17 51 18 C63 18 71 26 69 44 C66 34 60 27 50 27 C44 32 37 34 31 44 Z" fill="${c}"/>`,
    long: (c) => `<path d="M31 44 C29 24 41 17 50 18 C61 18 71 25 69 44 C65 33 57 27 52 25 C46 31 38 35 31 44 Z" fill="${c}"/>`,
    bun: (c) => `<path d="M32 40 C31 26 41 21 50 21 C60 21 69 26 68 40 C64 32 57 29 50 29 C43 29 36 32 32 40 Z" fill="${c}"/>`,
    buzz: (c) => `<path d="M33 37 C33 25 42 21 50 21 C59 21 67 25 67 37 C62 31 56 29 50 29 C44 29 38 31 33 37 Z" fill="${c}" opacity="0.85"/>`
  };
  const TOPS = {
    blazer: (c) => `<path d="M12 100 C14 80 30 71 50 71 C70 71 86 80 88 100 Z" fill="${c}"/>
      <path d="M41 72 L50 92 L59 72 Z" fill="#f4efe6"/><path d="M41 72 L36 82 L46 86 Z M59 72 L64 82 L54 86 Z" fill="${shade(c, 0.78)}"/>`,
    cardigan: (c) => `<path d="M12 100 C14 80 30 71 50 71 C70 71 86 80 88 100 Z" fill="${c}"/>
      <path d="M44 72 C46 80 54 80 56 72 L54 100 L46 100 Z" fill="#efe6d6"/><circle cx="50" cy="88" r="1.2" fill="${shade(c, 0.6)}"/><circle cx="50" cy="95" r="1.2" fill="${shade(c, 0.6)}"/>`,
    hoodie: (c) => `<path d="M12 100 C14 80 30 71 50 71 C70 71 86 80 88 100 Z" fill="${c}"/>
      <path d="M36 74 C40 84 60 84 64 74" stroke="${shade(c, 0.7)}" stroke-width="3" fill="none"/>
      <path d="M45 82 L44 94 M55 82 L56 94" stroke="#d9dde3" stroke-width="1.4"/>`,
    shirt: (c) => `<path d="M12 100 C14 80 30 71 50 71 C70 71 86 80 88 100 Z" fill="${c}"/>
      <path d="M42 71 L50 80 L44 85 Z M58 71 L50 80 L56 85 Z" fill="${shade(c, 0.86)}"/><path d="M50 80 L50 100" stroke="${shade(c, 0.8)}" stroke-width="1"/>`,
    vest: (c) => `<path d="M12 100 C14 80 30 71 50 71 C70 71 86 80 88 100 Z" fill="#2f3440"/>
      <path d="M22 100 C24 84 34 76 44 74 L46 100 Z M78 100 C76 84 66 76 56 74 L54 100 Z" fill="${c}"/>
      <path d="M24 92 L45 92 M76 92 L55 92" stroke="#e8eef2" stroke-width="2.4"/>`,
    tee: (c) => `<path d="M12 100 C14 80 30 71 50 71 C70 71 86 80 88 100 Z" fill="${c}"/><path d="M42 72 C45 77 55 77 58 72" stroke="${shade(c, 0.75)}" stroke-width="1.6" fill="none"/>`
  };

  // Брови, глаза и рот для каждого настроения.
  function brows(p, mood) {
    if (mood === "happy") return ["M38.5 37 Q42 34 46.5 36.5", "M53.5 36.5 Q58 34 61.5 37"];
    if (mood === "wow") return ["M38.5 35 Q42 31.5 46.5 34.5", "M53.5 34.5 Q58 31.5 61.5 35"];
    if (mood === "sus") return ["M38.5 39.5 L46.5 40.5", "M53.5 37 Q58 34.5 61.5 37.5"];
    if (mood === "hm") return ["M38.5 38 Q42 36.5 46.5 37.5", "M53.5 36 Q58 33.5 61.5 36.5"];
    if (mood === "angry") return ["M38.5 36.5 L46.5 40", "M61.5 36.5 L53.5 40"];
    if (mood === "sad") return ["M38.5 39.5 L46.5 37", "M61.5 39.5 L53.5 37"];
    if (p.brows === "grumpy") return ["M38.5 37.5 L46 39.5", "M61.5 37.5 L54 39.5"];
    if (p.brows === "up") return ["M38.5 38 Q42 35 46.5 37", "M53.5 37 Q58 35 61.5 38"];
    return ["M38.5 38 Q42 36.5 46.5 37.5", "M53.5 37.5 Q58 36.5 61.5 38"];
  }
  function eyes(p, mood) {
    const ink = "#1b1d22";
    if (mood === "happy" && p.mood !== "flat")
      return `<path d="M40.6 43.8 Q43 40.6 45.4 43.8 M54.6 43.8 Q57 40.6 59.4 43.8" stroke="${ink}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
    if (mood === "wow")
      return `<circle cx="43" cy="43" r="2.9" fill="${ink}"/><circle cx="57" cy="43" r="2.9" fill="${ink}"/><circle cx="44" cy="42" r="0.9" fill="#fff"/><circle cx="58" cy="42" r="0.9" fill="#fff"/>`;
    if (mood === "sus")
      return `<ellipse cx="43.6" cy="43.6" rx="2" ry="1.25" fill="${ink}"/><ellipse cx="57.6" cy="43.2" rx="2" ry="1.7" fill="${ink}"/>`;
    return `<ellipse cx="43" cy="43" rx="1.9" ry="2.3" fill="${ink}"/><ellipse cx="57" cy="43" rx="1.9" ry="2.3" fill="${ink}"/>`;
  }
  function mouth(p, mood, lip) {
    const line = (d) => `<path d="${d}" stroke="${lip}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    if (mood === "happy") {
      if (p.mood === "flat") return line("M45 55 Q50 58 55 55");
      return `<path d="M43.6 53.4 Q50 62 56.4 53.4 Z" fill="#6d2430"/><path d="M45.2 54.2 Q50 56.4 54.8 54.2" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    }
    if (mood === "wow") return `<ellipse cx="50" cy="56.2" rx="2.7" ry="3.5" fill="#6d2430"/>`;
    if (mood === "sus") return line("M45 56.3 L55 54.6");
    if (mood === "hm") return line("M46.6 55.8 L53.4 55.4");
    if (mood === "angry") return line("M45 57 Q50 53.6 55 57");
    if (mood === "sad") return line("M45.5 56.8 Q50 54.4 54.5 56.8");
    if (p.mood === "flat") return line("M45 55.5 L55 55.5");
    return line("M44.5 54.5 Q50 58.5 55.5 54.5");
  }

  function person(p, o) {
    const skin = p.skin || "#e8bd98";
    const hair = p.hair || "#2a1d16";
    const top = p.top || "#4a5568";
    const style = p.style || "short";
    const mood = o.mood || "neutral";
    const parts = [];
    if (!o.bare) {
      parts.push(`<rect width="100" height="100" fill="${p.bg || "#273142"}"/>`);
      parts.push(`<circle cx="50" cy="44" r="36" fill="${shade(p.bg || "#273142", 1.14)}" opacity="0.6"/>`);
    }
    if (HAIR_BACK[style]) parts.push(HAIR_BACK[style](shade(hair, 0.82)));
    parts.push((TOPS[p.wear] || TOPS.tee)(top));
    parts.push(`<path d="M43 56 L43 70 C46 75 54 75 57 70 L57 56 Z" fill="${shade(skin, 0.82)}"/>`);
    parts.push(`<g class="head">`);
    parts.push(`<ellipse cx="33.5" cy="45" rx="3.4" ry="5" fill="${shade(skin, 0.9)}"/><ellipse cx="66.5" cy="45" rx="3.4" ry="5" fill="${shade(skin, 0.9)}"/>`);
    parts.push(`<ellipse cx="50" cy="43" rx="16.5" ry="19.5" fill="${skin}"/>`);
    if (p.beard) parts.push(`<path d="M34 46 C35 60 42 64 50 64 C58 64 65 60 66 46 C63 54 58 57 50 57 C42 57 37 54 34 46 Z" fill="${p.beard}" opacity="${p.stubble ? 0.4 : 0.95}"/>`);
    if (mood === "happy" && p.mood !== "flat") parts.push(`<ellipse cx="39" cy="50" rx="3.2" ry="1.9" fill="#ff7a8a" opacity="0.35"/><ellipse cx="61" cy="50" rx="3.2" ry="1.9" fill="#ff7a8a" opacity="0.35"/>`);
    parts.push(`<path d="M50 44 C49 48 48 50 50.5 51" stroke="${shade(skin, 0.72)}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`);
    parts.push(`<g class="eyes">${eyes(p, mood)}</g>`);
    const brow = shade(hair, 0.8);
    const b = brows(p, mood);
    parts.push(`<path d="${b[0]}" stroke="${brow}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="${b[1]}" stroke="${brow}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
    parts.push(`<g class="mouth">${mouth(p, mood, p.lips || shade(skin, 0.62))}</g>`);
    if (HAIR_FRONT[style]) parts.push(HAIR_FRONT[style](hair));
    if (p.glasses) parts.push(`<g fill="none" stroke="${p.glasses}" stroke-width="1.5"><circle cx="43" cy="43" r="5.2"/><circle cx="57" cy="43" r="5.2"/><path d="M48.2 43 L51.8 43 M37.8 42 L34 41 M62.2 42 L66 41"/></g>`);
    if (p.earrings) parts.push(`<circle cx="33.5" cy="51" r="1.6" fill="${p.earrings}"/><circle cx="66.5" cy="51" r="1.6" fill="${p.earrings}"/>`);
    if (p.headset) parts.push(`<path d="M31 44 C31 22 69 22 69 44" stroke="#22262e" stroke-width="2.6" fill="none"/><rect x="28" y="40" width="6" height="10" rx="2.5" fill="#22262e"/><path d="M31 50 C33 57 39 58 44 57.5" stroke="#22262e" stroke-width="1.6" fill="none"/><circle cx="44.5" cy="57.5" r="1.6" fill="#22262e"/>`);
    parts.push(`</g>`);
    return parts.join("");
  }

  function owl(o) {
    const wink = o.mood === "happy";
    return `${o.bare ? "" : `<rect width="100" height="100" fill="#2a1f6b"/><circle cx="50" cy="52" r="36" fill="#3b2c93"/>`}
      <path d="M30 34 L36 20 L42 32 M70 34 L64 20 L58 32" fill="#9fd6ff"/>
      <ellipse cx="50" cy="56" rx="24" ry="28" fill="#9fd6ff"/>
      <ellipse cx="50" cy="66" rx="13" ry="14" fill="#e3f4ff"/>
      <path d="M44 62 Q50 66 56 62 M42 69 Q50 73 58 69 M44 76 Q50 79 56 76" stroke="#8fc0e6" stroke-width="1.4" fill="none"/>
      <circle cx="40" cy="45" r="9" fill="#1c1450"/><circle cx="60" cy="45" r="9" fill="#1c1450"/>
      <g class="eyes"><circle cx="40" cy="45" r="4.6" fill="#ffd23f"/>
      ${wink ? `<path d="M55.5 45.5 Q60 41.5 64.5 45.5" stroke="#ffd23f" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : `<circle cx="60" cy="45" r="4.6" fill="#ffd23f"/><circle cx="60" cy="45" r="2.1" fill="#1c1450"/>`}
      <circle cx="40" cy="45" r="2.1" fill="#1c1450"/></g>
      <path d="M47 52 L50 58 L53 52 Z" fill="#ff9f43"/>`;
  }

  function self(o) {
    return `${o.bare ? "" : `<rect width="100" height="100" fill="#2a2470"/><circle cx="50" cy="44" r="36" fill="#372f8e"/>`}
      <path d="M14 100 C16 80 31 71 50 71 C69 71 84 80 86 100 Z" fill="#38d0ff"/>
      <path d="M44 56 L44 71 C47 75 53 75 56 71 L56 56 Z" fill="#7fe0ff"/>
      <ellipse cx="50" cy="43" rx="16" ry="19" fill="#a8ecff"/>
      <path d="M33 39 C32 24 43 19 50 19 C59 19 68 24 67 39 C62 31 56 29 50 29 C44 29 38 31 33 39 Z" fill="#1b9fd0"/>
      <text x="50" y="50" text-anchor="middle" font-size="14" font-weight="900" fill="#14306b" font-family="Segoe UI, sans-serif">?</text>`;
  }

  function svg(p, cls = "", o = {}) {
    const body = p === "owl" || (p && p.owl) ? owl(o) : p === "self" || (p && p.self) ? self(o) : person(p || {}, o);
    return `<svg class="face ${cls}" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
  }

  return { svg, shade };
})();
