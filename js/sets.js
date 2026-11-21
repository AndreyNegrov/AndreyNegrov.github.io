// Декорации сезона «Дождь на Луне». Рисуются кодом: чёрное небо, Земля над горизонтом, купола, свет в окнах.
// Каждая сцена — один SVG 1600×1000. Подключается как фон: bg: "set:port".

const Sets = (() => {
  const W = 1600, H = 1000;
  let seed = 1;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const n = (v) => Math.round(v * 10) / 10;
  const MEMO = ["#8fb8ff", "#ffd58a", "#9be7c4", "#f7a8c4", "#b6a4ff", "#7fe0f0"];

  const stars = (count, yMax, s, xMin = 0, xMax = W) => {
    seed = s;
    let o = "";
    for (let i = 0; i < count; i++) {
      const r = rnd();
      o += `<circle${i % 9 === 0 ? ' class="tw"' : ""} cx="${n(xMin + rnd() * (xMax - xMin))}" cy="${n(rnd() * yMax)}" r="${n(0.5 + r * 1.5)}" opacity="${n(0.3 + rnd() * 0.7)}"/>`;
    }
    return `<g fill="#fff">${o}</g>`;
  };

  // Земля: океан, пара материков, облака, тень-терминатор и голубое свечение.
  const earth = (id, x, y, r) => `
    <defs>
      <radialGradient id="${id}es" cx="35%" cy="32%" r="80%"><stop offset="0" stop-color="#9ad6ff"/><stop offset=".45" stop-color="#2f7fd8"/><stop offset="1" stop-color="#0f2f6e"/></radialGradient>
      <radialGradient id="${id}sh" cx="30%" cy="28%" r="80%"><stop offset=".5" stop-color="#02040e" stop-opacity="0"/><stop offset="1" stop-color="#02040e" stop-opacity=".95"/></radialGradient>
      <radialGradient id="${id}eg"><stop offset=".52" stop-color="#6fb4ff" stop-opacity=".34"/><stop offset="1" stop-color="#6fb4ff" stop-opacity="0"/></radialGradient>
      <clipPath id="${id}ec"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>
      <filter id="${id}bl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${n(r / 45)}"/></filter>
    </defs>
    <circle cx="${x}" cy="${y}" r="${n(r * 1.8)}" fill="url(#${id}eg)"/>
    <g clip-path="url(#${id}ec)">
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}es)"/>
      <g transform="translate(${x - r} ${y - r}) scale(${n(r / 100)})" opacity=".92">
        <path d="M40 24c16-10 38-4 46 10s0 26-12 30-14 18-28 16-24-18-22-30 6-20 16-26z" fill="#4f9d6b"/>
        <path d="M58 40c8-4 18 0 20 8s-6 12-14 12-12-6-12-12 2-6 6-8z" fill="#c8b684"/>
        <path d="M100 84c12-6 28 0 34 12s-4 26-16 32-24-2-28-14 0-24 10-30z" fill="#5fa868"/>
        <path d="M128 34c10-4 24 2 28 12s-6 16-18 16-20-6-20-16 4-10 10-12z" fill="#6aa86a"/>
        <path d="M26 126c10-8 28-4 36 8s-2 24-16 26-26-6-28-18 2-12 8-16z" fill="#5a9a62"/>
      </g>
      <g fill="#fff" opacity=".8" filter="url(#${id}bl)" transform="translate(${x - r} ${y - r}) scale(${n(r / 100)})">
        <ellipse cx="70" cy="58" rx="46" ry="7" transform="rotate(-14 70 58)"/><ellipse cx="120" cy="104" rx="52" ry="8" transform="rotate(12 120 104)"/>
        <ellipse cx="52" cy="112" rx="34" ry="6" transform="rotate(-24 52 112)"/><ellipse cx="136" cy="52" rx="30" ry="5" transform="rotate(20 136 52)"/>
        <ellipse cx="96" cy="150" rx="44" ry="7" transform="rotate(-6 96 150)"/><ellipse cx="94" cy="22" rx="30" ry="5"/>
      </g>
    </g>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}sh)"/>`;

  // Лунный грунт: светлая кромка, тёмный низ, кратеры с освещённым дальним краем.
  const ground = (id, y, craters = []) => `
    <defs><linearGradient id="${id}gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3c9d6"/><stop offset=".25" stop-color="#8990a6"/><stop offset="1" stop-color="#3b4157"/></linearGradient></defs>
    <path d="M0 ${y} C 260 ${y - 26} 520 ${y + 18} 800 ${y - 8} S 1330 ${y - 30} 1600 ${y + 4} V1000 H0Z" fill="url(#${id}gr)"/>
    ${craters.map(([cx, cy, rx]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${n(rx * 0.24)}" fill="#3a4056" opacity=".55"/><path d="M${cx - rx} ${cy} A${rx} ${n(rx * 0.24)} 0 0 1 ${cx + rx} ${cy}" fill="none" stroke="#e6eaf3" stroke-opacity=".55" stroke-width="2"/>`).join("")}`;

  // Купол с городом внутри: стекло, рёбра, дома с окнами.
  const dome = (id, cx, base, rx, ry, s) => {
    seed = s;
    let b = "";
    const step = rx * 0.085;
    for (let x = cx - rx * 0.86; x < cx + rx * 0.8; x += step) {
      const lim = ry * 0.82 * Math.sqrt(Math.max(0, 1 - ((x + step / 2 - cx) / rx) ** 2));
      const h = lim * (0.28 + rnd() * 0.62), w = step * 0.82;
      b += `<rect x="${n(x)}" y="${n(base - h)}" width="${n(w)}" height="${n(h)}" fill="#12183a"/>`;
      for (let wy = base - h + 7; wy < base - 8; wy += 10) {
        if (rnd() > 0.42) b += `<rect x="${n(x + w * 0.18)}" y="${n(wy)}" width="${n(w * 0.64)}" height="3.4" fill="${rnd() > 0.8 ? "#9fd4ff" : "#ffd58a"}" opacity="${n(0.45 + rnd() * 0.55)}"/>`;
      }
    }
    let l = "";
    for (const k of [0.36, 0.7]) l += `<path d="M${n(cx - rx * k)} ${base} A${n(rx * k)} ${ry} 0 0 1 ${n(cx + rx * k)} ${base}"/>`;
    l += `<path d="M${cx} ${base - ry} V${base}"/>`;
    for (const k of [0.42, 0.74]) { const yy = base - ry * k, xx = rx * Math.sqrt(1 - k * k); l += `<path d="M${n(cx - xx)} ${n(yy)} Q${cx} ${n(yy + ry * 0.1)} ${n(cx + xx)} ${n(yy)}"/>`; }
    const arc = `M${cx - rx} ${base} A${rx} ${ry} 0 0 1 ${cx + rx} ${base}`;
    return `
      <defs><linearGradient id="${id}dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bcd6ff" stop-opacity=".3"/><stop offset=".5" stop-color="#6f8fe0" stop-opacity=".12"/><stop offset="1" stop-color="#2a3a80" stop-opacity=".2"/></linearGradient>
      <radialGradient id="${id}dw" cx="50%" cy="100%" r="70%"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".38"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient></defs>
      <path d="${arc} Z" fill="#0b1030"/>
      <path d="${arc} Z" fill="url(#${id}dw)"/>
      <g>${b}</g>
      <path d="${arc} Z" fill="url(#${id}dg)"/>
      <g fill="none" stroke="#b9cdfa" stroke-opacity=".32" stroke-width="1.6">${l}</g>
      <path d="${arc}" fill="none" stroke="#dbe7ff" stroke-opacity=".85" stroke-width="2.6"/>
      <path d="M${n(cx - rx * 0.86)} ${n(base - ry * 0.5)} A${rx} ${ry} 0 0 1 ${n(cx - rx * 0.3)} ${n(base - ry * 0.95)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
      <rect x="${cx - rx - 8}" y="${base - 6}" width="${rx * 2 + 16}" height="18" rx="5" fill="#232a52"/>
      <rect x="${cx - rx - 8}" y="${base - 6}" width="${rx * 2 + 16}" height="4" rx="2" fill="#8fa4de" opacity=".6"/>`;
  };

  // Человек со спины: тёмный силуэт против света.
  const person = (x, y, h, c = "#070a1a", bag = 0) => `
    <g fill="${c}"><circle cx="${x}" cy="${n(y - h * 0.9)}" r="${n(h * 0.095)}"/>
    <path d="M${n(x - h * 0.17)} ${y} V${n(y - h * 0.6)} Q${n(x - h * 0.17)} ${n(y - h * 0.78)} ${x} ${n(y - h * 0.78)} Q${n(x + h * 0.17)} ${n(y - h * 0.78)} ${n(x + h * 0.17)} ${n(y - h * 0.6)} V${y}Z"/>
    ${bag ? `<rect x="${n(x + h * 0.2 * bag - h * 0.09)}" y="${n(y - h * 0.3)}" width="${n(h * 0.18)}" height="${n(h * 0.3)}" rx="4"/>` : ""}</g>`;

  const glow = (id, x, y, r, color, op = 0.6) => `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`;

  const sky = (id, a = "#03040c", b = "#0b1030", c = "#1a2356") => `<defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}sky)"/>`;

  // ───── сцены ─────
  const SCENES = {
    // Порт Шеклтон снаружи: три купола, Земля, посадочная площадка.
    dome: () => `
      ${sky("dm")}${stars(240, 640, 3)}${earth("dm", 1230, 240, 150)}
      <path d="M0 668 L140 640 L300 660 L470 628 L640 656 L860 630 L1040 660 L1240 622 L1420 652 L1600 632 V720 H0Z" fill="#2a3050"/>
      ${ground("dm", 708, [[240, 880, 150], [760, 940, 210], [1320, 850, 120], [1080, 782, 60]])}
      <rect x="380" y="690" width="700" height="16" rx="8" fill="#2c3460"/><rect x="380" y="690" width="700" height="4" rx="2" fill="#93a6df" opacity=".5"/>
      ${dome("dma", 250, 708, 150, 104, 11)}${dome("dmb", 600, 708, 330, 250, 5)}${dome("dmc", 1010, 708, 190, 142, 23)}
      <g stroke="#8d9bd0" stroke-width="3" fill="none"><path d="M1290 708 V560"/><path d="M1270 600 H1310 M1276 640 H1304"/></g><circle class="blink" cx="1290" cy="554" r="5" fill="#ff6b6b"/>
      <ellipse cx="1420" cy="760" rx="130" ry="22" fill="#2a3050"/><ellipse cx="1420" cy="760" rx="130" ry="22" fill="none" stroke="#ffd58a" stroke-opacity=".7" stroke-width="2" stroke-dasharray="3 14"/>
      <g fill="#dfe6f7"><path d="M1380 752 L1392 690 Q1420 660 1448 690 L1460 752Z"/><rect x="1372" y="748" width="96" height="8" rx="3" fill="#8f9ab8"/></g><rect x="1408" y="700" width="24" height="14" rx="4" fill="#12183a"/>
      <g stroke="#565d78" stroke-width="2" opacity=".6" fill="none"><path d="M0 830 Q500 790 1100 818 T1600 800"/><path d="M0 846 Q500 806 1100 834 T1600 816"/></g>
      <path d="M0 1000 V900 Q90 880 170 910 Q260 950 330 1000Z" fill="#14182c"/><path d="M1600 1000 V880 Q1500 870 1440 920 Q1400 960 1380 1000Z" fill="#14182c"/>`,

    // Зал прилёта: стена из стекла, челнок на площадке, люди смотрят на Землю.
    port: () => {
      let floor = "";
      for (let i = -8; i <= 8; i++) floor += `<path d="M800 620 L${800 + i * 240} 1000"/>`;
      let mull = "";
      for (let x = 0; x <= W; x += 320) mull += `<rect x="${x - 9}" y="60" width="18" height="560" fill="#0a0e24"/>`;
      return `
      ${sky("pt")}${stars(170, 500, 9)}${earth("pt", 1150, 250, 128)}
      <path d="M0 500 L200 480 L420 496 L700 470 L980 492 L1280 472 L1600 488 V560 H0Z" fill="#2a3050"/>
      ${ground("pt", 540, [[980, 580, 90], [300, 596, 70]])}
      ${dome("ptd", 1420, 540, 120, 84, 31)}
      <ellipse cx="560" cy="578" rx="170" ry="20" fill="#30375a"/><ellipse cx="560" cy="578" rx="170" ry="20" fill="none" stroke="#ffd58a" stroke-opacity=".8" stroke-width="2" stroke-dasharray="3 14"/>
      <g><path d="M470 566 L500 430 Q560 360 620 430 L650 566Z" fill="#e3e9f8"/><path d="M500 430 Q560 360 620 430 L612 470 H508Z" fill="#b9c4e2"/><rect x="532" y="440" width="56" height="26" rx="8" fill="#12183a"/>
      <path d="M470 566 L440 590 M650 566 L680 590" stroke="#9aa4c4" stroke-width="7"/><rect x="486" y="520" width="148" height="10" fill="#7180ff"/><circle class="blink" cx="560" cy="386" r="4" fill="#ff6b6b"/></g>
      <rect width="${W}" height="620" fill="#7fa0ff" opacity=".05"/>
      <path d="M260 60 L120 620 H190 L330 60Z M900 60 L760 620 H800 L940 60Z" fill="#fff" opacity=".035"/>
      ${mull}<rect y="0" width="${W}" height="64" fill="#080b1e"/><rect y="604" width="${W}" height="20" fill="#0a0e24"/>
      <g fill="#9fd4ff" opacity=".85"><rect x="150" y="26" width="300" height="5" rx="2"/><rect x="650" y="26" width="300" height="5" rx="2"/><rect x="1150" y="26" width="300" height="5" rx="2"/></g>
      <defs><linearGradient id="ptfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232b5c"/><stop offset="1" stop-color="#0a0d22"/></linearGradient>
      <linearGradient id="ptrf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb4ff" stop-opacity=".22"/><stop offset="1" stop-color="#8fb4ff" stop-opacity="0"/></linearGradient></defs>
      <rect y="620" width="${W}" height="380" fill="url(#ptfl)"/><rect y="620" width="${W}" height="190" fill="url(#ptrf)"/>
      <g stroke="#93a6df" stroke-opacity=".12" stroke-width="2">${floor}<path d="M0 700 H1600 M0 800 H1600 M0 920 H1600"/></g>
      <g><rect x="560" y="92" width="480" height="74" rx="14" fill="#0d1230" stroke="#3a4680" stroke-width="2"/><rect x="580" y="110" width="38" height="38" rx="9" fill="#ffc94a"/><path d="M590 129 h18 m-7 -7 l7 7 l-7 7" stroke="#3a2500" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="636" y="126" fill="#f2f4fb" font="700 22px Segoe UI" style="font:700 22px 'Segoe UI',sans-serif">ARRIVALS</text><text x="636" y="150" fill="#a4aecb" style="font:600 15px 'Segoe UI',sans-serif;letter-spacing:.12em">PORT SHACKLETON · GATE 4</text></g>
      ${person(250, 640, 150)}${person(330, 648, 164, "#070a1a", 1)}${person(700, 644, 158)}${person(770, 650, 120)}${person(1010, 646, 166, "#070a1a", -1)}${person(1300, 642, 152)}
      <g stroke="#3d477a" stroke-width="5"><path d="M180 900 V790 M520 900 V790 M860 900 V790"/></g><path d="M180 800 H860" stroke="#7180ff" stroke-width="7" stroke-linecap="round"/>
      <g><rect x="1180" y="760" width="300" height="240" rx="16" fill="#151c44" stroke="#3a4680" stroke-width="2"/><rect x="1206" y="786" width="248" height="110" rx="10" fill="#0e1a3a"/><rect x="1206" y="786" width="248" height="110" rx="10" fill="#62c4ff" opacity=".22"/>
      <circle cx="1330" cy="840" r="26" fill="none" stroke="#62c4ff" stroke-width="3"/><circle cx="1330" cy="840" r="9" fill="#62c4ff"/></g>
      ${glow("ptg", 1330, 840, 190, "#62c4ff", 0.28)}`;
    },

    // Капсула: койка, иллюминатор с Землёй, тёплая лампа.
    capsule: () => `
      <defs><linearGradient id="cpw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#262a52"/><stop offset="1" stop-color="#14162e"/></linearGradient>
      <clipPath id="cpc"><circle cx="1130" cy="380" r="176"/></clipPath>
      <linearGradient id="cpl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".85"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#cpw)"/>
      <g stroke="#0d0f24" stroke-width="4" opacity=".7"><path d="M0 150 H1600 M0 690 H1600 M420 0 V690 M860 0 V690 M1420 0 V690"/></g>
      <g stroke="#4a5290" stroke-width="2" opacity=".35"><path d="M0 154 H1600 M0 694 H1600"/></g>
      <circle cx="1130" cy="380" r="204" fill="#0c0e22"/><circle cx="1130" cy="380" r="176" fill="#02030a"/>
      <g clip-path="url(#cpc)">${stars(70, 600, 17, 940, 1320)}${earth("cp", 1178, 340, 92)}</g>
      <circle cx="1130" cy="380" r="190" fill="none" stroke="#39417a" stroke-width="28"/><circle cx="1130" cy="380" r="204" fill="none" stroke="#6f7dc0" stroke-width="3" opacity=".7"/>
      <g fill="#6f7dc0"><circle cx="1130" cy="190" r="6"/><circle cx="1130" cy="570" r="6"/><circle cx="940" cy="380" r="6"/><circle cx="1320" cy="380" r="6"/></g>
      ${glow("cpg1", 1130, 380, 420, "#6fb4ff", 0.16)}
      <rect x="60" y="250" width="640" height="14" rx="7" fill="#ffd58a"/><rect x="60" y="264" width="640" height="300" fill="url(#cpl)" opacity=".45"/>
      <rect x="40" y="560" width="700" height="150" rx="26" fill="#2c3466"/><rect x="40" y="560" width="700" height="60" rx="26" fill="#3a4484"/>
      <rect x="70" y="520" width="190" height="74" rx="30" fill="#e6eaf7"/><path d="M300 566 Q520 520 740 580 V640 H300Z" fill="#7180ff" opacity=".85"/>
      <rect x="470" y="330" width="230" height="10" rx="5" fill="#0d0f24"/><g><rect x="490" y="270" width="16" height="60" fill="#ff8a5c"/><rect x="510" y="282" width="14" height="48" fill="#62c4ff"/><rect x="528" y="264" width="18" height="66" fill="#ffd58a"/><rect x="550" y="290" width="12" height="40" fill="#9be7c4"/></g>
      <g><rect x="620" y="300" width="50" height="30" rx="6" fill="#39417a"/><path d="M645 300 C632 262 612 262 606 240 M645 300 C648 258 664 250 672 228 M645 300 C640 270 650 250 644 226" stroke="#4fd68a" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      <rect y="760" width="${W}" height="240" fill="#0d0f24"/><rect y="760" width="${W}" height="6" fill="#39417a"/>
      <rect x="1020" y="700" width="460" height="24" rx="8" fill="#39417a"/><path d="M1060 724 V1000 M1440 724 V1000" stroke="#262a52" stroke-width="16"/>
      <path d="M1180 700 L1206 610 H1380 L1354 700Z" fill="#0e1a3a"/><path d="M1190 692 L1212 620 H1370 L1348 692Z" fill="#62c4ff" opacity=".5"/>
      ${glow("cpg2", 1280, 640, 260, "#62c4ff", 0.22)}${glow("cpg3", 380, 300, 420, "#ffcf7a", 0.2)}`,

    // Keepsake: стена светящихся картриджей — каждое воспоминание своего цвета.
    keepsake: () => {
      seed = 41;
      let cells = "", halo = "";
      for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) {
        const x = 90 + c * 72, y = 150 + r * 92, col = MEMO[Math.floor(rnd() * MEMO.length)], op = rnd() > 0.2 ? 0.35 + rnd() * 0.6 : 0.08;
        cells += `<rect x="${x}" y="${y}" width="48" height="70" rx="10" fill="${col}" opacity="${n(op)}"/>`;
        if (op > 0.75) halo += `<rect x="${x - 10}" y="${y - 10}" width="68" height="90" rx="18" fill="${col}" opacity=".16"/>`;
      }
      return `
      <defs><linearGradient id="ksw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2350"/><stop offset="1" stop-color="#262e66"/></linearGradient>
      <linearGradient id="ksf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3270"/><stop offset="1" stop-color="#0d1130"/></linearGradient>
      <filter id="ksb"><feGaussianBlur stdDeviation="9"/></filter></defs>
      <rect width="${W}" height="${H}" fill="url(#ksw)"/>
      <rect x="60" y="120" width="1480" height="500" rx="26" fill="#10153a"/>
      <g filter="url(#ksb)">${halo}</g>${cells}
      <g stroke="#0b0f2c" stroke-width="5" opacity=".9"><path d="M60 236 H1540 M60 328 H1540 M60 420 H1540 M60 512 H1540"/></g>
      <rect x="560" y="250" width="480" height="210" rx="28" fill="#0c1030" opacity=".94"/>
      <circle cx="640" cy="355" r="38" fill="none" stroke="#b6a4ff" stroke-width="7"/><circle cx="640" cy="355" r="13" fill="#ffd58a"/>
      <text x="700" y="350" fill="#f2f4fb" style="font:800 46px 'Segoe UI',sans-serif;letter-spacing:-.01em">keepsake</text>
      <text x="702" y="386" fill="#a4aecb" style="font:600 17px 'Segoe UI',sans-serif;letter-spacing:.04em">we keep what you can't</text>
      <rect y="700" width="${W}" height="300" fill="url(#ksf)"/><rect y="700" width="${W}" height="5" fill="#5b68b8" opacity=".6"/>
      <g opacity=".22"><rect x="90" y="706" width="1420" height="120" fill="#8fb8ff" filter="url(#ksb)"/></g>
      <rect x="380" y="640" width="840" height="200" rx="24" fill="#2b3470"/><rect x="380" y="640" width="840" height="30" rx="15" fill="#dfe5f7"/><rect x="380" y="806" width="840" height="34" rx="17" fill="#1b2150"/>
      <rect x="420" y="700" width="760" height="6" rx="3" fill="#7180ff" opacity=".7"/>
      <g fill="#ffd58a"><path d="M300 0 V70 L270 120 H330 L300 70Z"/><path d="M800 0 V50 L770 100 H830 L800 50Z"/><path d="M1300 0 V70 L1270 120 H1330 L1300 70Z"/></g>
      ${glow("ksg1", 300, 130, 190, "#ffcf7a", 0.4)}${glow("ksg2", 800, 110, 190, "#ffcf7a", 0.4)}${glow("ksg3", 1300, 130, 190, "#ffcf7a", 0.4)}
      <g fill="#151a40"><rect x="80" y="760" width="200" height="150" rx="40"/><rect x="60" y="820" width="240" height="120" rx="30"/></g>
      <g><rect x="1380" y="820" width="90" height="110" rx="14" fill="#151a40"/><path d="M1425 820 C1380 740 1360 700 1350 640 M1425 820 C1440 740 1470 700 1490 650 M1425 820 C1420 730 1430 690 1420 620" stroke="#3fbf7c" stroke-width="6" fill="none" stroke-linecap="round"/><g fill="#3fbf7c"><ellipse cx="1350" cy="640" rx="16" ry="34" transform="rotate(-18 1350 640)"/><ellipse cx="1490" cy="650" rx="16" ry="34" transform="rotate(22 1490 650)"/><ellipse cx="1420" cy="620" rx="15" ry="36"/></g></g>`;
    },

    // Архив: коридор полок уходит в точку, на полках светятся картриджи.
    archive: (tunnel) => {
      seed = tunnel ? 77 : 63;
      const vx = 800, vy = 470;
      const A = tunnel ? { wall: "#2a2233", wall2: "#17121f", strip: "#ffb648", lite: "#ffcf7a", end: "#1c1626" } : { wall: "#1d2452", wall2: "#0d1130", strip: "#62c4ff", lite: "#bfe6ff", end: "#111640" };
      let dots = "", frames = "";
      for (const side of [-1, 1]) for (let lv = 0; lv < 6; lv++) {
        const y0 = 110 + lv * 150, x0 = side < 0 ? 0 : W;
        dots += `<path d="M${x0} ${y0} L${vx + side * 160} ${n(vy - 70 + lv * 26)}" stroke="${A.wall2}" stroke-width="5"/>`;
        for (let t = 0.03; t < 0.93; t += 0.045 * (1.25 - t)) {
          const x = x0 + (vx + side * 160 - x0) * t, y = y0 + (vy - 70 + lv * 26 - y0) * t, k = 1 - t;
          if (tunnel) { if (rnd() > 0.86) dots += `<rect x="${n(x - 10 * k)}" y="${n(y - 54 * k)}" width="${n(20 * k)}" height="${n(40 * k)}" rx="${n(4 * k)}" fill="${A.strip}" opacity="${n(0.25 + rnd() * 0.4)}"/>`; }
          else if (rnd() > 0.18) dots += `<rect x="${n(x - 15 * k)}" y="${n(y - 66 * k)}" width="${n(30 * k)}" height="${n(56 * k)}" rx="${n(7 * k)}" fill="${MEMO[Math.floor(rnd() * MEMO.length)]}" opacity="${n(0.3 + rnd() * 0.65)}"/>`;
        }
      }
      for (const k of [1, 0.72, 0.5, 0.34, 0.24]) frames += `<rect x="${n(vx - 800 * k)}" y="${n(vy - 470 * k)}" width="${n(1600 * k)}" height="${n(1000 * k)}" fill="none" stroke="${tunnel ? "#4a3d52" : "#3a4690"}" stroke-width="${n(10 * k)}" opacity=".7"/>`;
      return `
      <defs><linearGradient id="arf${tunnel ? "t" : ""}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${A.strip}" stop-opacity=".9"/><stop offset="1" stop-color="${A.strip}" stop-opacity=".15"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="${A.wall2}"/>
      <path d="M0 0 L640 400 V560 L0 1000Z" fill="${A.wall}"/><path d="M1600 0 L960 400 V560 L1600 1000Z" fill="${A.wall}"/>
      <path d="M0 0 H1600 L960 400 H640Z" fill="${A.wall2}"/><path d="M0 1000 H1600 L960 560 H640Z" fill="${tunnel ? "#120e18" : "#0a0d26"}"/>
      ${dots}${frames}
      <path d="M720 1000 H880 L812 560 H788Z" fill="url(#arf${tunnel ? "t" : ""})"/>
      <g fill="${A.lite}"><path d="M560 0 H1040 L1000 60 H600Z" opacity=".85"/><path d="M660 150 H940 L920 190 H680Z" opacity=".7"/><path d="M718 250 H882 L872 276 H728Z" opacity=".55"/><path d="M752 320 H848 L842 338 H758Z" opacity=".45"/></g>
      <rect x="640" y="400" width="320" height="160" fill="${A.end}"/><circle cx="800" cy="480" r="58" fill="${tunnel ? "#2a2233" : "#1d2452"}" stroke="${A.strip}" stroke-width="5"/><circle cx="800" cy="480" r="30" fill="none" stroke="${A.strip}" stroke-width="3" opacity=".7"/><path d="M800 430 V530 M750 480 H850" stroke="${A.strip}" stroke-width="3" opacity=".6"/>
      ${glow("arg" + (tunnel ? "t" : ""), 800, 480, 420, A.strip, 0.22)}`;
    },
    tunnel: () => SCENES.archive(true),

    // Ночной рынок под Куполом 6: навесы, фонари, пар над лапшой, Земля сквозь рёбра купола.
    market: () => {
      seed = 91;
      let back = "", stalls = "", lamps = "";
      for (let x = 0; x < W; x += 92) {
        const h = 150 + rnd() * 230;
        back += `<rect x="${x}" y="${n(560 - h)}" width="84" height="${n(h)}" fill="#10142e"/>`;
        for (let y = 560 - h + 14; y < 540; y += 22) for (let k = 0; k < 3; k++) if (rnd() > 0.55) back += `<rect x="${x + 10 + k * 24}" y="${n(y)}" width="14" height="9" fill="${rnd() > 0.75 ? "#9fd4ff" : "#ffd58a"}" opacity="${n(0.35 + rnd() * 0.5)}"/>`;
      }
      const cols = ["#d9534f", "#2fa39a", "#e09a3a", "#7b6fd6", "#c44f7a"];
      [70, 380, 690, 1000, 1310].forEach((x, i) => {
        stalls += `<g><path d="M${x - 20} 560 L${x + 20} 500 H${x + 220} L${x + 260} 560Z" fill="${cols[i]}"/><path d="M${x - 20} 560 H${x + 260} V576 Q${x + 120} 596 ${x - 20} 576Z" fill="${cols[i]}" opacity=".75"/>
          <rect x="${x}" y="576" width="240" height="170" fill="#141834"/><rect x="${x}" y="700" width="240" height="130" rx="8" fill="#232a56"/><rect x="${x}" y="700" width="240" height="12" rx="6" fill="#39437e"/>
          <rect x="${x + 88}" y="512" width="64" height="38" rx="8" fill="#0c1030"/><text x="${x + 120}" y="539" text-anchor="middle" fill="#ffd58a" style="font:800 22px 'Segoe UI',sans-serif">${17 + i}</text></g>`;
        for (const dx of [50, 120, 190]) lamps += `<path d="M${x + dx} 576 V${608 + (dx % 3) * 8}" stroke="#0c1030" stroke-width="2"/><circle cx="${x + dx}" cy="${622 + (dx % 3) * 8}" r="15" fill="#ffd58a"/>${glow("mk" + i + dx, x + dx, 622 + (dx % 3) * 8, 90, "#ffcf7a", 0.5)}`;
      });
      let ribs = "";
      for (const k of [1, 0.8, 0.6, 0.4, 0.2]) ribs += `<path d="M${n(800 - 1100 * k)} 700 A${n(1100 * k)} 700 0 0 1 ${n(800 + 1100 * k)} 700"/>`;
      for (const k of [0.25, 0.5, 0.75]) { const y = 700 - 700 * k, x = 1100 * Math.sqrt(1 - k * k); ribs += `<path d="M${n(800 - x)} ${n(y)} Q800 ${n(y + 50)} ${n(800 + x)} ${n(y)}"/>`; }
      return `
      ${sky("mk", "#02030a", "#0a0e2a", "#232a5e")}${stars(150, 420, 29)}${earth("mk", 1210, 170, 78)}
      <g fill="none" stroke="#8ea0de" stroke-opacity=".3" stroke-width="3">${ribs}</g>
      ${back}
      <path d="M0 470 Q200 520 400 476 T800 480 T1200 470 T1600 486" fill="none" stroke="#0c1030" stroke-width="2"/>
      <g fill="#ffd58a">${[60, 150, 240, 330, 430, 520, 610, 700, 790, 890, 980, 1070, 1160, 1260, 1350, 1440, 1530].map((x, i) => `<circle cx="${x}" cy="${n(484 + Math.sin(i * 1.3) * 12)}" r="4"/>`).join("")}</g>
      <rect y="560" width="${W}" height="440" fill="#0c1030"/>
      ${stalls}${lamps}
      <defs><filter id="mkb"><feGaussianBlur stdDeviation="16"/></filter><linearGradient id="mkf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f5e"/><stop offset="1" stop-color="#090b1e"/></linearGradient></defs>
      <g fill="#fff" opacity=".2" filter="url(#mkb)"><ellipse cx="810" cy="660" rx="60" ry="40"/><ellipse cx="840" cy="590" rx="46" ry="50"/><ellipse cx="800" cy="520" rx="36" ry="46"/></g>
      <rect y="830" width="${W}" height="170" fill="url(#mkf)"/>
      <g opacity=".3" filter="url(#mkb)"><rect x="60" y="840" width="1480" height="60" fill="#ffcf7a"/></g>
      ${person(210, 1000, 300, "#05071a")}${person(330, 1000, 250, "#05071a", 1)}${person(600, 1000, 210, "#080b22")}${person(980, 1000, 280, "#05071a", -1)}${person(1250, 1000, 230, "#080b22")}${person(1470, 1000, 310, "#05071a")}`;
    },

    // Зал слушаний: герб, три кресла комиссии, окно с Землёй, место свидетеля.
    hearing: () => {
      let ribs = "";
      for (let x = 60; x < W; x += 110) ribs += `<rect x="${x}" y="0" width="14" height="700" fill="#0d1130" opacity=".55"/>`;
      return `
      <defs><linearGradient id="hrw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161c48"/><stop offset="1" stop-color="#242c62"/></linearGradient>
      <clipPath id="hrc"><rect x="1290" y="80" width="150" height="540" rx="75"/></clipPath></defs>
      <rect width="${W}" height="${H}" fill="url(#hrw)"/>${ribs}
      <rect x="1290" y="80" width="150" height="540" rx="75" fill="#02030a"/><g clip-path="url(#hrc)">${stars(50, 640, 51, 1290, 1440)}${earth("hr", 1372, 230, 64)}</g>
      <rect x="1290" y="80" width="150" height="540" rx="75" fill="none" stroke="#5b68b8" stroke-width="8"/>${glow("hrg0", 1365, 300, 360, "#6fb4ff", 0.16)}
      <circle cx="800" cy="210" r="96" fill="#0d1130" stroke="#ffc94a" stroke-width="5"/><circle cx="800" cy="210" r="70" fill="none" stroke="#ffc94a" stroke-width="2" opacity=".6"/>
      <path d="M800 150 L816 196 H864 L825 224 L840 270 L800 242 L760 270 L775 224 L736 196 H784Z" fill="#ffc94a" opacity=".9"/>
      <text x="800" y="352" text-anchor="middle" fill="#dfe4f3" style="font:700 22px 'Segoe UI',sans-serif;letter-spacing:.2em">COLONY SAFETY BOARD</text>
      <g fill="#0b0e28">${[560, 800, 1040].map((x) => `<rect x="${x - 62}" y="400" width="124" height="220" rx="30"/>`).join("")}</g>
      <rect x="330" y="560" width="940" height="170" rx="18" fill="#2f3876"/><rect x="330" y="560" width="940" height="26" rx="13" fill="#4753a6"/><rect x="330" y="700" width="940" height="30" fill="#1b2150"/>
      ${[560, 800, 1040].map((x, i) => `<path d="M${x - 70} 560 V528 Q${x - 70} 514 ${x - 56} 514 H${x - 30}" stroke="#0b0e28" stroke-width="6" fill="none"/><circle cx="${x - 26}" cy="514" r="11" fill="#ffd58a"/>${glow("hrg" + (i + 1), x - 26, 520, 120, "#ffcf7a", 0.45)}`).join("")}
      <rect y="730" width="${W}" height="270" fill="#0d1130"/><rect y="730" width="${W}" height="6" fill="#4753a6" opacity=".7"/>
      <rect x="690" y="800" width="220" height="200" rx="16" fill="#1b2150"/><rect x="690" y="800" width="220" height="20" rx="10" fill="#39437e"/>
      <path d="M800 800 V748" stroke="#8ea0de" stroke-width="5"/><rect x="786" y="716" width="28" height="40" rx="14" fill="#c3cbe2"/>
      <g fill="#070919"><rect x="40" y="860" width="560" height="140" rx="18"/><rect x="1000" y="860" width="560" height="140" rx="18"/></g>
      <g fill="#10143a"><rect x="40" y="860" width="560" height="18" rx="9"/><rect x="1000" y="860" width="560" height="18" rx="9"/></g>`;
    }
  };

  return {
    list: () => Object.keys(SCENES),
    html(name) {
      const f = SCENES[name] || SCENES.dome;
      return `<svg class="set" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${f()}</svg>`;
    }
  };
})();
