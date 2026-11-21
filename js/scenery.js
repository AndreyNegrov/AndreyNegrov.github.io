// Рисованные фоны сезона «Онбординг»: город и интерьеры собираются из SVG на лету.
// Scenery.html("office-day") → разметка на весь экран. Никаких фотографий.

const Scenery = (() => {
  const W = 1600, H = 900;
  let uid = 0;
  const n = (v) => Math.round(v * 10) / 10;
  function rnd(seed) {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }

  const PAL = {
    dawn: { sky: ["#6557f5", "#ff8fb1", "#ffd98a"], far: "#a98bf0", near: "#6a50cf", win: "#fff3c2", sun: "#fff3d0", cloud: "#ffffff", cloudOp: 0.5, lit: 0.35, ground: "#4a3aa8" },
    day: { sky: ["#1f9dff", "#7fd6ff", "#e6fbff"], far: "#8ec9f5", near: "#4b84de", win: "#f1fbff", sun: "#fffbe0", cloud: "#ffffff", cloudOp: 0.92, lit: 0.3, ground: "#3a66c4" },
    dusk: { sky: ["#2a1b6e", "#c2418f", "#ffa257"], far: "#8048b8", near: "#38237a", win: "#ffd76a", sun: "#ffe3a8", cloud: "#ffb7a0", cloudOp: 0.42, lit: 0.55, ground: "#2a1a5e" },
    night: { sky: ["#090824", "#1b1560", "#5a2a92"], far: "#2f2684", near: "#17114a", win: "#ffd76a", sun: "#f1edff", cloud: "#9a86ff", cloudOp: 0.16, lit: 0.5, ground: "#100b34" }
  };

  // Городской горизонт. o: { seed, ground, stars, moon, sunX, sunY, wheel, tower, neon }
  function city(pal, o = {}) {
    const id = "sc" + (++uid);
    const r = rnd(o.seed || 11);
    const g = o.ground || 780;
    const out = [];
    out.push(`<defs>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal.sky[0]}"/><stop offset=".58" stop-color="${pal.sky[1]}"/><stop offset="1" stop-color="${pal.sky[2]}"/></linearGradient>
      <radialGradient id="${id}-sun"><stop offset="0" stop-color="${pal.sun}" stop-opacity=".9"/><stop offset=".3" stop-color="${pal.sun}" stop-opacity=".3"/><stop offset="1" stop-color="${pal.sun}" stop-opacity="0"/></radialGradient>
    </defs>`);
    out.push(`<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>`);
    if (o.stars) for (let i = 0; i < 80; i++) out.push(`<circle cx="${n(r() * W)}" cy="${n(r() * g * 0.72)}" r="${n(0.7 + r() * 1.5)}" fill="#fff" opacity="${n(0.3 + r() * 0.6)}"${i % 4 === 0 ? ` class="sc-twinkle" style="animation-delay:${n(r() * 4)}s"` : ""}/>`);
    const sx = o.sunX || 1150, sy = o.sunY || 330;
    out.push(`<circle cx="${sx}" cy="${sy}" r="300" fill="url(#${id}-sun)"/><circle cx="${sx}" cy="${sy}" r="${o.moon ? 44 : 64}" fill="${pal.sun}"/>`);
    if (o.moon) out.push(`<circle cx="${sx + 16}" cy="${sy - 12}" r="38" fill="${pal.sky[1]}" opacity=".85"/>`);
    // облака
    for (let i = 0; i < 5; i++) {
      const cx = r() * W, cy = 90 + r() * 260, s = 0.7 + r() * 0.9;
      out.push(`<g class="sc-cloud" style="animation-duration:${n(70 + r() * 80)}s;animation-delay:-${n(r() * 60)}s" opacity="${pal.cloudOp}" fill="${pal.cloud}">
        <ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(90 * s)}" ry="${n(26 * s)}"/><ellipse cx="${n(cx - 50 * s)}" cy="${n(cy + 10 * s)}" rx="${n(60 * s)}" ry="${n(20 * s)}"/><ellipse cx="${n(cx + 44 * s)}" cy="${n(cy - 14 * s)}" rx="${n(56 * s)}" ry="${n(24 * s)}"/></g>`);
    }
    // дальний ряд
    let x = -30;
    while (x < W) {
      const w = 46 + r() * 90, h = 150 + r() * 250;
      out.push(`<rect x="${n(x)}" y="${n(g - h)}" width="${n(w)}" height="${n(h)}" fill="${pal.far}"/>`);
      if (r() < 0.3) out.push(`<rect x="${n(x + w / 2 - 2)}" y="${n(g - h - 34)}" width="4" height="34" fill="${pal.far}"/>`);
      x += w + r() * 6;
    }
    // часовая башня и колесо
    if (o.tower !== false) {
      const tx = o.towerX || 300;
      out.push(`<g fill="${pal.far}"><rect x="${tx}" y="${g - 430}" width="62" height="430"/><path d="M${tx - 6} ${g - 430} H${tx + 68} L${tx + 31} ${g - 520} Z"/><rect x="${tx + 28}" y="${g - 560}" width="6" height="44"/></g>
        <circle cx="${tx + 31}" cy="${g - 380}" r="22" fill="${pal.win}"/><path d="M${tx + 31} ${g - 380} v-14 M${tx + 31} ${g - 380} h10" stroke="${pal.near}" stroke-width="3" stroke-linecap="round"/>`);
    }
    if (o.wheel !== false) {
      const wx = o.wheelX || 1330, wy = g - 250, R = 190;
      let spokes = "";
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        spokes += `<path d="M${wx} ${wy} L${n(wx + Math.cos(a) * R)} ${n(wy + Math.sin(a) * R)}"/><circle cx="${n(wx + Math.cos(a) * R)}" cy="${n(wy + Math.sin(a) * R)}" r="9" fill="${pal.win}" stroke="none"/>`;
      }
      out.push(`<g stroke="${pal.far}" stroke-width="5" fill="none"><path d="M${wx - 70} ${g} L${wx} ${wy} L${wx + 70} ${g}"/>
        <g class="sc-wheel" style="transform-origin:${wx}px ${wy}px"><circle cx="${wx}" cy="${wy}" r="${R}"/><circle cx="${wx}" cy="${wy}" r="${R - 22}" stroke-width="2"/>${spokes}</g></g>`);
    }
    // ближний ряд с окнами
    x = -40;
    let k = 0;
    while (x < W) {
      const w = 84 + r() * 120, h = 90 + r() * 250, y = g - h;
      out.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${pal.near}"/>`);
      if (r() < 0.35) out.push(`<rect x="${n(x + 10)}" y="${n(y - 16)}" width="${n(w * 0.4)}" height="16" fill="${pal.near}"/>`);
      for (let wy = y + 18; wy < g - 20; wy += 28) {
        for (let wx = x + 13; wx < x + w - 18; wx += 24) {
          if (r() < pal.lit) out.push(`<rect x="${n(wx)}" y="${n(wy)}" width="11" height="15" rx="2" fill="${pal.win}" opacity="${n(0.55 + r() * 0.45)}"${r() < 0.06 ? ' class="sc-blink"' : ""}/>`);
        }
      }
      if (o.neon && k === o.neon.at) {
        out.push(`<g class="sc-neon"><rect x="${n(x + 8)}" y="${n(y + 20)}" width="${n(w - 16)}" height="34" rx="8" fill="#1a0f3f" stroke="#ff4f8b" stroke-width="3"/>
          <text x="${n(x + w / 2)}" y="${n(y + 44)}" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="20" font-weight="800" fill="#ff8fb5" letter-spacing="2">${o.neon.text}</text></g>`);
      }
      x += w + 4 + r() * 10;
      k++;
    }
    out.push(`<rect y="${g}" width="${W}" height="${H - g}" fill="${pal.ground}"/>`);
    if (o.street) {
      out.push(`<rect y="${g + 46}" width="${W}" height="4" fill="rgba(255,255,255,.18)"/>`);
      for (let i = 0; i < 9; i++) out.push(`<g transform="translate(${90 + i * 190} ${g})"><rect x="-2" y="-92" width="4" height="92" fill="${pal.near}"/><circle cy="-96" r="8" fill="${pal.win}"/><circle cy="-96" r="26" fill="${pal.win}" opacity=".18"/></g>`);
      out.push(`<g class="sc-bus"><g transform="translate(0 ${g - 76})"><rect width="150" height="80" rx="12" fill="#ff4f5e"/><rect x="10" y="10" width="130" height="20" rx="4" fill="#ffe9a8"/><rect x="10" y="42" width="96" height="18" rx="4" fill="#ffe9a8"/><rect x="114" y="40" width="26" height="40" rx="4" fill="#c9304a"/><circle cx="34" cy="82" r="11" fill="#1a1238"/><circle cx="116" cy="82" r="11" fill="#1a1238"/></g></g>`);
    }
    return out.join("");
  }

  function snow(count = 46) {
    const r = rnd(5);
    let s = '<g class="sc-snow" fill="#fff">';
    for (let i = 0; i < count; i++) s += `<circle cx="${n(r() * W)}" cy="-10" r="${n(1.4 + r() * 2.8)}" opacity="${n(0.35 + r() * 0.55)}" style="animation-duration:${n(7 + r() * 9)}s;animation-delay:-${n(r() * 14)}s"/>`;
    return s + "</g>";
  }

  function plant(x, y, s = 1, pot = "#ff7a59") {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <g class="sc-sway"><path d="M0 0 C-10 -60 -70 -90 -96 -140 C-50 -130 -14 -90 0 -30 Z" fill="#2fbf8f"/>
      <path d="M0 0 C10 -70 60 -110 84 -170 C30 -150 4 -100 0 -30 Z" fill="#3de0a8"/>
      <path d="M0 0 C-4 -70 -30 -150 -8 -210 C16 -150 8 -80 0 -30 Z" fill="#25a87c"/></g>
      <path d="M-40 0 H40 L30 70 H-30 Z" fill="${pot}"/><rect x="-46" y="-8" width="92" height="16" rx="6" fill="${Face.shade(pot, 0.82)}"/></g>`;
  }
  function lamp(x, len, on, glow = "#ffd76a") {
    return `<g><rect x="${x - 2}" y="0" width="4" height="${len}" fill="#1a1238"/><path d="M${x - 44} ${len + 40} Q${x} ${len - 30} ${x + 44} ${len + 40} Z" fill="#ffd23f"/>
      ${on ? `<path d="M${x - 44} ${len + 40} L${x - 170} 900 H${x + 170} L${x + 44} ${len + 40} Z" fill="${glow}" opacity=".07"/><ellipse cx="${x}" cy="${len + 42}" rx="30" ry="8" fill="#fff6d0"/>` : ""}</g>`;
  }

  const ROOM = {
    dawn: { wall: ["#ff8f6b", "#ff6f7d"], floor: "#7a3fb0", floor2: "#6a339e", trim: "#fff1dc", frame: "#fff1dc" },
    day: { wall: ["#6c5cff", "#4f3fe0"], floor: "#2c2382", floor2: "#251d70", trim: "#3de0a8", frame: "#fdf6ea" },
    dusk: { wall: ["#5a36b8", "#40258f"], floor: "#261a66", floor2: "#1f1557", trim: "#ffb067", frame: "#ffe3c4" },
    night: { wall: ["#1f1859", "#150f40"], floor: "#0f0a30", floor2: "#0c0828", trim: "#ff4f8b", frame: "#3a3184" }
  };

  // Интерьер с окнами в город. kind: home | office
  function room(kind, time) {
    const id = "rm" + (++uid);
    const pal = PAL[time], R = ROOM[time];
    const out = [];
    out.push(`<defs><linearGradient id="${id}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${R.wall[0]}"/><stop offset="1" stop-color="${R.wall[1]}"/></linearGradient></defs>`);
    out.push(`<rect width="${W}" height="${H}" fill="url(#${id}-wall)"/>`);
    const win = (x, y, w, h, seed) => `<g>
      <rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="26" fill="${R.frame}"/>
      <svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 120 1600 900" preserveAspectRatio="xMidYMax slice">${city(pal, { seed, stars: time === "night", moon: time === "night", sunX: 900, sunY: time === "dusk" ? 560 : 330, tower: seed % 2 === 0, wheel: seed % 2 === 1, wheelX: 800, towerX: 520, neon: time === "night" ? { at: 4, text: "OPEN" } : null })}</svg>
      <rect x="${x + w / 2 - 5}" y="${y}" width="10" height="${h}" fill="${R.frame}"/><rect x="${x}" y="${y + h * 0.42}" width="${w}" height="10" fill="${R.frame}"/>
      <rect x="${x - 22}" y="${y + h + 8}" width="${w + 44}" height="18" rx="8" fill="${R.frame}"/></g>`;
    const floorY = 720;
    if (kind === "home") {
      out.push(win(520, 120, 560, 430, 21));
      out.push(`<g transform="translate(150 190) rotate(-4)"><rect width="230" height="300" rx="10" fill="#fff1dc"/><rect x="14" y="14" width="202" height="190" rx="6" fill="#38d0ff"/><circle cx="160" cy="70" r="30" fill="#ffd23f"/><path d="M14 204 L80 110 L130 170 L170 130 L216 204 Z" fill="#6c5cff"/>
        <text x="115" y="262" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="40" font-weight="900" fill="#ff4f8b" letter-spacing="6">LONDON</text></g>`);
      out.push(`<g transform="translate(1220 250)"><rect width="250" height="14" rx="6" fill="#fff1dc"/><rect x="18" y="-74" width="26" height="74" rx="4" fill="#3de0a8"/><rect x="48" y="-90" width="22" height="90" rx="4" fill="#ffd23f"/><rect x="74" y="-66" width="30" height="66" rx="4" fill="#6c5cff"/><rect x="108" y="-82" width="20" height="82" rx="4" fill="#38d0ff"/><circle cx="196" cy="-30" r="30" fill="#fff1dc"/><path d="M196 -30 v-16 M196 -30 h12" stroke="#40258f" stroke-width="4" stroke-linecap="round"/></g>`);
    } else {
      out.push(win(90, 110, 400, 440, 12) + win(600, 110, 400, 440, 23) + win(1110, 110, 400, 440, 34));
    }
    out.push(`<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="${R.floor}"/><rect y="${floorY}" width="${W}" height="14" fill="${R.trim}" opacity=".9"/>`);
    for (let i = 0; i < 9; i++) out.push(`<path d="M${i * 220 - 80} ${H} L${400 + i * 100} ${floorY + 14}" stroke="${R.floor2}" stroke-width="6"/>`);
    if (kind === "home") {
      out.push(`<ellipse cx="800" cy="840" rx="430" ry="56" fill="#ffd23f" opacity=".9"/><ellipse cx="800" cy="840" rx="330" ry="38" fill="#ff8f6b"/>`);
      out.push(`<g transform="translate(1120 560)"><rect x="0" y="60" width="400" height="20" rx="8" fill="#38d0ff"/><rect x="24" y="80" width="14" height="230" fill="#1b9fd0"/><rect x="362" y="80" width="14" height="230" fill="#1b9fd0"/>
        <rect x="120" y="-34" width="170" height="96" rx="10" fill="#1a1238"/><rect x="130" y="-24" width="150" height="76" rx="6" fill="#7fe0ff"/><rect x="100" y="58" width="210" height="8" rx="4" fill="#d9dde8"/>
        <path d="M40 60 V22 H76 V60 Z" fill="#ff4f8b"/><path d="M76 30 q16 0 16 12 t-16 12" stroke="#ff4f8b" stroke-width="5" fill="none"/>
        <g class="sc-steam" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"><path d="M50 14 q-6 -10 0 -20 t0 -20"/><path d="M66 14 q-6 -10 0 -20 t0 -20"/></g></g>`);
      out.push(`<g transform="translate(60 610)"><rect width="330" height="130" rx="34" fill="#40258f"/><rect x="-14" y="48" width="358" height="110" rx="30" fill="#6c5cff"/><rect x="30" y="26" width="120" height="70" rx="24" fill="#ffd23f"/><rect x="170" y="30" width="110" height="64" rx="22" fill="#3de0a8"/></g>`);
      out.push(plant(470, 730, 0.9, "#38d0ff"));
    } else {
      const lit = time !== "day";
      out.push(lamp(300, 60, lit) + lamp(800, 40, lit) + lamp(1300, 60, lit));
      out.push(`<g class="sc-neon ${time === "night" ? "hot" : ""}" transform="translate(800 612)"><rect x="-150" y="-36" width="300" height="72" rx="36" fill="${time === "night" ? "#1a0f3f" : "#2a1f7a"}" stroke="#ff4f8b" stroke-width="5"/>
        <text y="13" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="38" font-weight="900" fill="#ff8fb5" letter-spacing="5">murmur</text></g>`);
      out.push(plant(86, 760, 1.15, "#ff7a59") + plant(1520, 770, 1.05, "#ffd23f"));
      const desk = (x, c) => `<g transform="translate(${x} 770)"><rect width="330" height="22" rx="8" fill="${c}"/><rect x="20" y="22" width="14" height="130" fill="${Face.shade(c, 0.7)}"/><rect x="296" y="22" width="14" height="130" fill="${Face.shade(c, 0.7)}"/>
        <rect x="96" y="-104" width="140" height="92" rx="10" fill="#1a1238"/><rect x="106" y="-94" width="120" height="72" rx="6" fill="${time === "night" ? "#38d0ff" : "#b9f1ff"}" ${time === "night" ? 'class="sc-screen"' : ""}/><rect x="156" y="-12" width="20" height="12" fill="#1a1238"/></g>`;
      out.push(desk(240, "#ff7a59") + desk(1040, "#3de0a8"));
    }
    if (time === "night") out.push(`<rect width="${W}" height="${H}" fill="#0a0530" opacity=".28"/>`);
    return out.join("");
  }

  const SCENES = {
    "city-night": () => city(PAL.night, { seed: 9, stars: true, moon: true, sunX: 1240, sunY: 190, street: true, neon: { at: 5, text: "MURMUR" }, ground: 770 }) + snow(),
    "home-dawn": () => room("home", "dawn"),
    "office-day": () => room("office", "day"),
    "office-dusk": () => room("office", "dusk"),
    "office-night": () => room("office", "night")
  };

  function html(id) {
    const make = SCENES[id] || SCENES["office-day"];
    return `<svg class="scenery sc-${id}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${make()}</svg>`;
  }

  return { html, city, PAL, has: (id) => !!SCENES[id] };
})();
