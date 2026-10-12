// Helyőrző illusztrációk generálása (SVG).
// Ezek ideiglenes képek: a végleges oldalon valódi fotókra kell cserélni őket.
// Futtatás: node scripts/generate-placeholders.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fruitDir = join(root, 'assets/img/fruits');
const placeholderDir = join(root, 'assets/img/placeholder');
mkdirSync(fruitDir, { recursive: true });
mkdirSync(placeholderDir, { recursive: true });

// Determinisztikus véletlen, hogy újragenerálva ugyanaz legyen a kép.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const f = (n) => Number(n.toFixed(3));

let uid = 0;
const id = (p) => `${p}${++uid}`;

function radial(gid, stops, cx = '35%', cy = '30%', r = '75%') {
  return `<radialGradient id="${gid}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</radialGradient>`;
}

function linear(gid, stops, x2 = '0', y2 = '1') {
  return `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;
}

// Minden gyümölcs egységnyi koordinátarendszerben rajzolódik (kb. -1..1),
// a hívó helyezi el translate/scale/rotate transzformációval.
function place(x, y, s, rot, body) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">${body}</g>`;
}

function shadow(x, y, rx, ry) {
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#3b2f1e" opacity="0.13" filter="url(#soft)"/>`;
}

function leaf(defs, x, y, s, rot, c1 = '#8CC56B', c2 = '#3F7D3A') {
  const g = id('lf');
  defs.push(linear(g, [[0, c1], [1, c2]], '1', '1'));
  return place(
    x,
    y,
    s,
    rot,
    `<path d="M0 0 C0.3 -0.32 0.82 -0.3 1 0 C0.82 0.3 0.3 0.32 0 0Z" fill="url(#${g})"/>` +
      `<path d="M0.04 0 C0.4 -0.02 0.7 -0.01 0.94 0" stroke="#2f5f2c" stroke-opacity="0.45" stroke-width="0.03" fill="none" stroke-linecap="round"/>`
  );
}

function highlight(x, y, rx, ry, rot = -25, o = 0.35) {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity="${o}"/>`;
}

const fruits = {
  apple(defs, { base = '#C9302C', light = '#F0705A', dark = '#7E1A1A', leafOn = true } = {}) {
    const g = id('ap');
    defs.push(radial(g, [[0, light], [0.55, base], [1, dark]]));
    return (
      `<path d="M0 -0.62 C0.25 -0.85 0.95 -0.8 0.98 -0.1 C1 0.55 0.6 1 0.3 0.98 C0.15 0.97 0.08 0.9 0 0.9 C-0.08 0.9 -0.15 0.97 -0.3 0.98 C-0.6 1 -1 0.55 -0.98 -0.1 C-0.95 -0.8 -0.25 -0.85 0 -0.62Z" fill="url(#${g})"/>` +
      `<path d="M-0.18 -0.6 C-0.08 -0.52 0.08 -0.52 0.18 -0.6" stroke="${dark}" stroke-opacity="0.5" stroke-width="0.05" fill="none" stroke-linecap="round"/>` +
      `<path d="M0 -0.58 C0.02 -0.78 0.07 -0.93 0.13 -1.05" stroke="#6B4A2B" stroke-width="0.07" fill="none" stroke-linecap="round"/>` +
      (leafOn ? leaf(defs, 0.1, -0.86, 0.62, -28) : '') +
      highlight(-0.45, -0.3, 0.13, 0.26)
    );
  },

  pear(defs, { base = '#B9C24A', light = '#E6E58A', dark = '#6F7A22' } = {}) {
    const g = id('pr');
    defs.push(radial(g, [[0, light], [0.6, base], [1, dark]], '38%', '45%'));
    return (
      `<path d="M0 -1 C0.18 -1 0.3 -0.75 0.35 -0.45 C0.42 -0.1 0.85 0.1 0.85 0.55 C0.85 0.95 0.45 1.15 0 1.15 C-0.45 1.15 -0.85 0.95 -0.85 0.55 C-0.85 0.1 -0.42 -0.1 -0.35 -0.45 C-0.3 -0.75 -0.18 -1 0 -1Z" fill="url(#${g})"/>` +
      `<ellipse cx="0.35" cy="0.5" rx="0.35" ry="0.4" fill="#D9862F" opacity="0.18"/>` +
      `<path d="M0 -0.98 C0.02 -1.12 0.08 -1.22 0.15 -1.3" stroke="#6B4A2B" stroke-width="0.07" fill="none" stroke-linecap="round"/>` +
      highlight(-0.38, 0.25, 0.12, 0.3, -10)
    );
  },

  quince(defs) {
    const g = id('qn');
    defs.push(radial(g, [[0, '#FFF1A6'], [0.55, '#E9C640'], [1, '#A88418']]));
    return (
      `<path d="M0 -0.7 C0.3 -0.95 0.95 -0.75 0.95 -0.05 C0.96 0.5 0.65 0.95 0.2 1.02 C0.08 1.04 0.02 1.1 0 1.12 C-0.02 1.1 -0.08 1.04 -0.2 1.02 C-0.7 0.95 -1 0.45 -0.96 -0.1 C-0.92 -0.78 -0.3 -0.95 0 -0.7Z" fill="url(#${g})"/>` +
      `<path d="M-0.1 0.95 C-0.05 1.05 0.05 1.05 0.1 0.95" stroke="#7a5d12" stroke-width="0.05" fill="none"/>` +
      `<path d="M0 -0.66 C0.02 -0.82 0.06 -0.9 0.1 -0.98" stroke="#6B4A2B" stroke-width="0.07" fill="none" stroke-linecap="round"/>` +
      leaf(defs, 0.08, -0.88, 0.7, -20, '#9DBF6E', '#4C7A35') +
      highlight(-0.45, -0.25, 0.14, 0.28)
    );
  },

  citrus(defs, { base = '#F39A1E', light = '#FFC85A', dark = '#C4650A', rx = 1, ry = 1, seed = 1 } = {}) {
    const g = id('ct');
    defs.push(radial(g, [[0, light], [0.6, base], [1, dark]]));
    const r = rng(seed);
    let dots = '';
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.92;
      dots += `<circle cx="${f(Math.cos(a) * d * rx)}" cy="${f(Math.sin(a) * d * ry)}" r="0.018" fill="${dark}" opacity="0.35"/>`;
    }
    return (
      `<ellipse rx="${rx}" ry="${ry}" fill="url(#${g})"/>` +
      dots +
      `<circle cx="0.05" cy="${f(-ry * 0.9)}" r="0.05" fill="#6d7a2a"/>` +
      highlight(-0.4 * rx, -0.35 * ry, 0.14, 0.26)
    );
  },

  citrusHalf(defs, { peel = '#F39A1E', flesh = '#F7A030', fleshLight = '#FFD27A', segments = 10, r = 1 } = {}) {
    const g = id('ch');
    defs.push(radial(g, [[0, fleshLight], [1, flesh]], '50%', '50%', '60%'));
    let segs = '';
    const inner = r * 0.82;
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * Math.PI * 2 + 0.05;
      const a1 = ((i + 1) / segments) * Math.PI * 2 - 0.05;
      const am = (a0 + a1) / 2;
      const c = 0.1;
      const x0 = Math.cos(am) * c;
      const y0 = Math.sin(am) * c;
      segs += `<path d="M${f(x0)} ${f(y0)} L${f(Math.cos(a0) * inner)} ${f(Math.sin(a0) * inner)} A${f(inner)} ${f(inner)} 0 0 1 ${f(Math.cos(a1) * inner)} ${f(Math.sin(a1) * inner)}Z" fill="url(#${g})"/>`;
    }
    return (
      `<circle r="${r}" fill="${peel}"/>` +
      `<circle r="${f(r * 0.9)}" fill="#FFF3D9"/>` +
      segs +
      `<circle r="0.07" fill="#FFF3D9"/>` +
      `<circle r="${r}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="0.03"/>`
    );
  },

  lemon(defs) {
    const g = id('lm');
    defs.push(radial(g, [[0, '#FFF59A'], [0.6, '#F6D52B'], [1, '#C9A70F']]));
    return (
      `<path d="M-1.25 0 C-1.15 -0.15 -1 -0.2 -0.95 -0.35 C-0.7 -0.85 0.7 -0.85 0.95 -0.35 C1 -0.2 1.15 -0.15 1.25 0 C1.15 0.15 1 0.2 0.95 0.35 C0.7 0.85 -0.7 0.85 -0.95 0.35 C-1 0.2 -1.15 0.15 -1.25 0Z" fill="url(#${g})"/>` +
      highlight(-0.35, -0.3, 0.12, 0.3, -70)
    );
  },

  strawberry(defs, { seed = 3 } = {}) {
    const g = id('sb');
    defs.push(radial(g, [[0, '#FF6B6B'], [0.6, '#D92B2B'], [1, '#8E1414']], '40%', '35%'));
    const r = rng(seed);
    let seeds = '';
    for (let y = -0.5; y < 0.85; y += 0.2) {
      const w = 0.78 * Math.sqrt(Math.max(0, 1 - ((y - 0.05) / 0.98) ** 2)) * (1 - Math.max(0, y) * 0.35);
      for (let x = -w; x <= w; x += 0.22) {
        const jx = x + (r() - 0.5) * 0.06 + (Math.round(y * 5) % 2 ? 0.11 : 0);
        if (Math.abs(jx) > w) continue;
        seeds += `<ellipse cx="${f(jx)}" cy="${f(y)}" rx="0.025" ry="0.04" fill="#F8D66B" opacity="0.9"/>`;
      }
    }
    let calyx = '';
    for (let i = 0; i < 6; i++) {
      calyx += place(0, -0.7, 0.45, -180 + i * 36 + 0, `<path d="M0 0 C0.3 -0.15 0.75 -0.1 0.95 0 C0.75 0.1 0.3 0.15 0 0Z" fill="#4E9A3E"/>`);
    }
    return (
      `<path d="M0 1 C-0.35 0.95 -0.9 0.4 -0.88 -0.2 C-0.86 -0.6 -0.5 -0.75 0 -0.7 C0.5 -0.75 0.86 -0.6 0.88 -0.2 C0.9 0.4 0.35 0.95 0 1Z" fill="url(#${g})"/>` +
      seeds +
      calyx +
      `<path d="M0 -0.75 L0.04 -0.98" stroke="#3E7D31" stroke-width="0.07" stroke-linecap="round"/>` +
      highlight(-0.4, -0.25, 0.1, 0.22, -20, 0.3)
    );
  },

  drupelets(defs, { base = '#D4245A', light = '#FF7A9C', dark = '#7E0E33', shine = 0.5 } = {}) {
    const g = id('dr');
    defs.push(radial(g, [[0, light], [0.6, base], [1, dark]], '35%', '30%', '70%'));
    let out = '';
    const rows = [
      [-0.72, 0.35], [-0.5, 0.62], [-0.27, 0.76], [-0.03, 0.8], [0.21, 0.76], [0.45, 0.62], [0.67, 0.4],
    ];
    rows.forEach(([y, w], ri) => {
      const n = Math.max(2, Math.round((w * 2) / 0.24));
      for (let i = 0; i < n; i++) {
        const x = -w + (i + 0.5) * ((w * 2) / n) + (ri % 2 ? 0.05 : -0.05);
        out += `<circle cx="${f(x)}" cy="${f(y)}" r="0.15" fill="url(#${g})"/>`;
        out += `<circle cx="${f(x - 0.04)}" cy="${f(y - 0.05)}" r="0.035" fill="#fff" opacity="${shine}"/>`;
      }
    });
    return out;
  },

  blueberry(defs) {
    const g = id('bb');
    defs.push(radial(g, [[0, '#7D8FD0'], [0.55, '#3F4F92'], [1, '#1E2752']]));
    let star = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      star += `<line x1="0" y1="-0.62" x2="${f(Math.cos(a) * 0.14)}" y2="${f(-0.62 + Math.sin(a) * 0.14)}" stroke="#1B2147" stroke-width="0.07" stroke-linecap="round"/>`;
    }
    return (
      `<circle r="1" fill="url(#${g})"/>` +
      `<circle r="1" fill="#C9D3F0" opacity="0.18"/>` +
      `<circle cx="0" cy="-0.62" r="0.17" fill="#2A3366"/>` +
      star +
      highlight(-0.38, -0.2, 0.12, 0.2, -30, 0.3)
    );
  },

  currant(defs) {
    const g = id('cu');
    defs.push(radial(g, [[0, '#FF8A80'], [0.6, '#E0242B'], [1, '#8A0F12']]));
    return `<circle r="1" fill="url(#${g})" opacity="0.95"/>` + `<circle cx="0" cy="0.85" r="0.07" fill="#5a1a12"/>` + highlight(-0.35, -0.35, 0.18, 0.28, -30, 0.55);
  },

  grapes(defs, { base = '#9BBF4A', light = '#DDEB95', dark = '#5D7A1F' } = {}) {
    const g = id('gr');
    defs.push(radial(g, [[0, light], [0.6, base], [1, dark]], '35%', '30%'));
    const rows = [[-0.55, 4], [-0.2, 4], [0.15, 3], [0.48, 3], [0.8, 2], [1.08, 1]];
    let out = `<path d="M0 -0.8 C0.02 -1 -0.05 -1.15 -0.15 -1.25" stroke="#6B4A2B" stroke-width="0.08" fill="none" stroke-linecap="round"/>`;
    out += leaf(defs, 0, -1.05, 0.8, -15, '#A5C96F', '#4A7C34');
    rows.forEach(([y, n], ri) => {
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * 0.36 + (ri % 2 ? 0.04 : -0.04);
        out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="0.2" ry="0.22" fill="url(#${g})"/>`;
        out += `<ellipse cx="${f(x - 0.06)}" cy="${f(y - 0.08)}" rx="0.04" ry="0.07" fill="#fff" opacity="0.45"/>`;
      }
    });
    return out;
  },

  banana(defs) {
    const g = id('bn');
    defs.push(linear(g, [[0, '#FFE680'], [0.6, '#F5CB2E'], [1, '#C99A14']]));
    const one = (dy, rot) =>
      `<g transform="translate(0 ${dy}) rotate(${rot})">` +
      `<path d="M-1 -0.25 C-0.6 0.55 0.5 0.62 1.05 -0.18 C1.1 -0.24 1.04 -0.32 0.97 -0.28 C0.42 0.2 -0.5 0.18 -0.9 -0.36Z" fill="url(#${g})" stroke="#B88A10" stroke-opacity="0.35" stroke-width="0.02"/>` +
      `<path d="M-0.9 -0.36 L-1.05 -0.45 L-1 -0.25Z" fill="#5C4A1E"/>` +
      `<circle cx="1.03" cy="-0.22" r="0.04" fill="#3d3214"/>` +
      `</g>`;
    return one(0.2, 6) + one(0, 0) + one(-0.2, -6);
  },

  kiwiHalf(defs, { seed = 5 } = {}) {
    const g = id('kw');
    defs.push(radial(g, [[0, '#E8F3A4'], [0.35, '#A9CF45'], [1, '#6E9E1E']], '50%', '50%', '60%'));
    const r = rng(seed);
    let seeds = '';
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + r() * 0.08;
      const d = 0.33 + r() * 0.08;
      const x = Math.cos(a) * d * 1.1;
      const y = Math.sin(a) * d * 0.9;
      seeds += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="0.028" ry="0.05" transform="rotate(${f((a * 180) / Math.PI + 90)} ${f(x)} ${f(y)})" fill="#1f1a10"/>`;
    }
    return (
      `<ellipse rx="1.1" ry="0.9" fill="#7A5A35"/>` +
      `<ellipse rx="1.03" ry="0.83" fill="url(#${g})"/>` +
      `<ellipse rx="0.22" ry="0.16" fill="#F6F8D8"/>` +
      seeds
    );
  },

  kiwiWhole(defs) {
    const g = id('kh');
    defs.push(radial(g, [[0, '#B48A5A'], [0.6, '#8A6538'], [1, '#5A3F20']]));
    return `<ellipse rx="1.15" ry="0.88" fill="url(#${g})"/>` + `<ellipse rx="1.15" ry="0.88" fill="none" stroke="#c9a77a" stroke-opacity="0.35" stroke-width="0.04" stroke-dasharray="0.02 0.05"/>` + highlight(-0.45, -0.3, 0.16, 0.26, -60, 0.18);
  },

  stoneFruit(defs, { base = '#F59E4A', light = '#FFD48A', blush = '#E0463A', dark = '#B5541E', leafOn = true } = {}) {
    const g = id('sf');
    const b = id('bl');
    defs.push(radial(g, [[0, light], [0.65, base], [1, dark]], '35%', '35%'));
    defs.push(radial(b, [[0, blush], [1, blush + '00']], '65%', '55%', '55%'));
    return (
      `<path d="M0 -0.82 C0.55 -1 1 -0.55 1 0.05 C1 0.6 0.55 1 0 1 C-0.55 1 -1 0.6 -1 0.05 C-1 -0.55 -0.55 -1 0 -0.82Z" fill="url(#${g})"/>` +
      `<path d="M0 -0.82 C0.55 -1 1 -0.55 1 0.05 C1 0.6 0.55 1 0 1 C-0.55 1 -1 0.6 -1 0.05 C-1 -0.55 -0.55 -1 0 -0.82Z" fill="url(#${b})" opacity="0.85"/>` +
      `<path d="M0.02 -0.8 C0.25 -0.3 0.25 0.4 0.05 0.95" stroke="${dark}" stroke-opacity="0.35" stroke-width="0.05" fill="none" stroke-linecap="round"/>` +
      (leafOn ? leaf(defs, 0.02, -0.84, 0.7, -35) : '') +
      highlight(-0.45, -0.3, 0.14, 0.26)
    );
  },

  plum(defs) {
    const g = id('pl');
    defs.push(radial(g, [[0, '#9B6BB5'], [0.6, '#5B2A6E'], [1, '#2C1036']]));
    return (
      `<ellipse rx="0.82" ry="1" fill="url(#${g})"/>` +
      `<ellipse rx="0.82" ry="1" fill="#C8B6E2" opacity="0.2"/>` +
      `<path d="M0.05 -0.98 C0.3 -0.4 0.3 0.4 0.08 0.98" stroke="#1e0a26" stroke-opacity="0.4" stroke-width="0.05" fill="none"/>` +
      `<path d="M0.04 -0.98 L0.1 -1.18" stroke="#6B4A2B" stroke-width="0.06" stroke-linecap="round"/>` +
      highlight(-0.35, -0.35, 0.12, 0.24, -20, 0.28)
    );
  },

  cherries(defs) {
    const g = id('cr');
    defs.push(radial(g, [[0, '#F0565A'], [0.55, '#B3121D'], [1, '#5A0710']]));
    const cherry = (x, y) =>
      `<circle cx="${x}" cy="${y}" r="0.42" fill="url(#${g})"/>` + highlight(x - 0.15, y - 0.15, 0.06, 0.11, -30, 0.5);
    return (
      `<path d="M-0.45 0.15 C-0.4 -0.4 -0.1 -0.9 0.15 -1.1" stroke="#5E7A2E" stroke-width="0.05" fill="none" stroke-linecap="round"/>` +
      `<path d="M0.45 0.3 C0.4 -0.3 0.25 -0.8 0.15 -1.1" stroke="#5E7A2E" stroke-width="0.05" fill="none" stroke-linecap="round"/>` +
      leaf(defs, 0.15, -1.1, 0.75, -10) +
      cherry(-0.45, 0.45) +
      cherry(0.45, 0.6)
    );
  },

  watermelon(defs, { seed = 9 } = {}) {
    const g = id('wm');
    defs.push(radial(g, [[0, '#FF8A8A'], [1, '#E2353F']], '50%', '0%', '100%'));
    const r = rng(seed);
    let seeds = '';
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * (0.12 + r() * 0.76);
      const d = 0.3 + r() * 0.42;
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      seeds += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="0.03" ry="0.055" transform="rotate(${f((a * 180) / Math.PI - 90)} ${f(x)} ${f(y)})" fill="#2a1a12"/>`;
    }
    return (
      `<path d="M-1 0 A1 1 0 0 0 1 0Z" fill="#3E7D3A"/>` +
      `<path d="M-0.93 0 A0.93 0.93 0 0 0 0.93 0Z" fill="#CFE6A8"/>` +
      `<path d="M-0.86 0 A0.86 0.86 0 0 0 0.86 0Z" fill="url(#${g})"/>` +
      seeds
    );
  },
};

function frame({ w = 800, h = 600, bg = ['#FBF7EF', '#F3EADB'], label = true, zoom = 1, body, defs }) {
  const labelSvg = label
    ? `<g transform="translate(${w - 24} ${h - 22})"><rect x="-178" y="-22" width="178" height="30" rx="15" fill="#fff" opacity="0.8"/><text x="-89" y="-2" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="13" fill="#6b6457">Helyőrző illusztráció</text></g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs>
${linear('bg', [[0, bg[0]], [1, bg[1]]])}
<radialGradient id="glow" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
${defs.join('\n')}
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<rect width="${w}" height="${h}" fill="url(#glow)"/>
<g transform="translate(${w / 2} ${h / 2}) scale(${zoom}) translate(${-w / 2} ${-h / 2})">${body}</g>
${labelSvg}
</svg>
`;
}

// Kompozíciók: [gyümölcs, x, y, méret, forgatás, opciók]
function compose(items, defs) {
  let out = '';
  for (const it of items) {
    const [kind, x, y, s, rot = 0, opts = {}] = it;
    if (kind === 'raw') {
      out += x;
      continue;
    }
    if (kind === 'leaf') {
      out += leaf(defs, x, y, s, rot);
      continue;
    }
    const shadowY = opts.shadowY ?? s * 0.95;
    if (!opts.noShadow) out += shadow(x + s * 0.08, y + shadowY, s * 0.95, s * 0.22);
    out += place(x, y, s, rot, fruits[kind](defs, opts));
  }
  return out;
}

const RED_APPLE = { base: '#C9302C', light: '#F0705A', dark: '#7E1A1A' };
const GREEN_APPLE = { base: '#8DBA3C', light: '#D3EB86', dark: '#4E7419' };
const ORANGE = { base: '#F39A1E', light: '#FFC85A', dark: '#C4650A' };
const MANDARIN = { base: '#F57F17', light: '#FFB54D', dark: '#B9500A', rx: 1, ry: 0.84 };
const GRAPEFRUIT = { base: '#F6C04A', light: '#FFE28F', dark: '#D08E1E' };
const LIME = { base: '#7DB33A', light: '#C3E27A', dark: '#477016' };

const scenes = {
  alma: {
    bg: ['#FCF5EF', '#F4E6DA'],
    items: [
      ['apple', 300, 330, 130, -8, RED_APPLE],
      ['apple', 510, 360, 112, 10, { ...GREEN_APPLE, leafOn: false }],
      ['leaf', 600, 210, 70, 30],
    ],
  },
  korte: {
    bg: ['#FAF8EC', '#EFEBD5'],
    items: [
      ['pear', 330, 320, 120, -6],
      ['pear', 500, 345, 104, 12, { base: '#C9A33E', light: '#F0D985', dark: '#8A6A1C' }],
    ],
  },
  birs: {
    bg: ['#FCF8EA', '#F2E9CC'],
    items: [
      ['quince', 330, 330, 128, -10],
      ['quince', 520, 360, 104, 14],
    ],
  },
  narancs: {
    bg: ['#FDF6EA', '#F6E6CF'],
    items: [
      ['citrus', 300, 320, 135, 0, { ...ORANGE, seed: 11 }],
      ['citrusHalf', 520, 375, 105, 0, { shadowY: 110 }],
      ['leaf', 360, 175, 80, -40],
    ],
  },
  mandarin: {
    bg: ['#FDF5E9', '#F6E3CB'],
    items: [
      ['citrus', 290, 360, 105, 0, { ...MANDARIN, seed: 12 }],
      ['citrus', 470, 330, 118, 0, { ...MANDARIN, seed: 13 }],
      ['citrus', 380, 420, 90, 0, { ...MANDARIN, seed: 14, noShadow: false }],
      ['leaf', 520, 205, 70, -20],
    ],
  },
  citrom: {
    bg: ['#FCFAEA', '#F1EDCB'],
    items: [
      ['lemon', 320, 330, 118, -20],
      ['citrusHalf', 525, 375, 92, 0, { peel: '#F2CF2A', flesh: '#F4DE55', fleshLight: '#FFF6B0', shadowY: 98 }],
      ['leaf', 260, 220, 70, -150],
    ],
  },
  grapefruit: {
    bg: ['#FDF5EE', '#F6E2D6'],
    items: [
      ['citrus', 300, 320, 140, 0, { ...GRAPEFRUIT, seed: 15 }],
      ['citrusHalf', 525, 380, 112, 0, { peel: '#F2B94A', flesh: '#E8544E', fleshLight: '#FF9C8A', segments: 12, shadowY: 118 }],
    ],
  },
  lime: {
    bg: ['#F6F9EC', '#E7EED3'],
    items: [
      ['citrus', 310, 340, 110, 0, { ...LIME, seed: 16 }],
      ['citrusHalf', 500, 375, 95, 0, { peel: '#5E9A2A', flesh: '#A8D35A', fleshLight: '#E2F3A6', shadowY: 100 }],
      ['leaf', 400, 210, 70, -30],
    ],
  },
  eper: {
    bg: ['#FDF3F1', '#F6E1DD'],
    items: [
      ['strawberry', 300, 330, 120, -12, { seed: 21 }],
      ['strawberry', 470, 360, 105, 14, { seed: 22 }],
      ['strawberry', 390, 430, 70, 70, { seed: 23 }],
    ],
  },
  malna: {
    bg: ['#FCF2F3', '#F3DFE2'],
    items: [
      ['drupelets', 290, 340, 95, -10],
      ['drupelets', 440, 320, 105, 8],
      ['drupelets', 560, 390, 80, 20],
      ['leaf', 360, 210, 75, -30],
    ],
  },
  afonya: {
    bg: ['#F4F4F8', '#E3E5EF'],
    items: [
      ['blueberry', 300, 360, 62, 0],
      ['blueberry', 400, 330, 70, 20],
      ['blueberry', 500, 370, 60, -10],
      ['blueberry', 350, 430, 56, 40],
      ['blueberry', 460, 440, 58, -30],
      ['blueberry', 560, 300, 50, 10],
      ['leaf', 250, 260, 70, -40],
    ],
  },
  szeder: {
    bg: ['#F6F2F5', '#E8E0E7'],
    items: [
      ['drupelets', 320, 340, 100, -8, { base: '#3A1638', light: '#8A4E86', dark: '#14060F', shine: 0.7 }],
      ['drupelets', 490, 360, 92, 14, { base: '#3A1638', light: '#8A4E86', dark: '#14060F', shine: 0.7 }],
      ['leaf', 420, 210, 80, -20],
    ],
  },
  ribizli: {
    bg: ['#FCF3F2', '#F4E0DE'],
    items: [
      ['leaf', 420, 190, 90, -10],
      ['raw', '<path d="M420 200 C410 260 400 330 420 470 M420 250 C380 270 345 290 330 300 M420 300 C440 310 470 300 480 300 M410 350 C395 350 380 350 370 350 M415 400 C440 390 455 370 450 350 M420 430 C450 420 480 410 490 405" stroke="#6E7F3A" stroke-width="4" fill="none" stroke-linecap="round"/>'],
      ['currant', 330, 300, 38, 0],
      ['currant', 370, 350, 40, 0],
      ['currant', 410, 300, 36, 0],
      ['currant', 400, 400, 38, 0],
      ['currant', 450, 350, 40, 0],
      ['currant', 440, 450, 36, 0],
      ['currant', 490, 405, 38, 0],
      ['currant', 480, 300, 34, 0],
    ],
  },
  szolo: {
    bg: ['#F7F8EC', '#EAEDD3'],
    items: [
      ['grapes', 320, 300, 150, -6],
      ['grapes', 510, 330, 135, 10, { base: '#6B3A6E', light: '#B98AC0', dark: '#351838' }],
    ],
  },
  banan: {
    bg: ['#FDF9EA', '#F4EBC8'],
    items: [['banana', 400, 320, 210, -8, { shadowY: 120 }]],
  },
  kiwi: {
    bg: ['#F5F8EB', '#E6EDD2'],
    items: [
      ['kiwiWhole', 300, 330, 120, -15],
      ['kiwiHalf', 510, 370, 112, 0, { shadowY: 100 }],
    ],
  },
  oszibarack: {
    bg: ['#FDF4EC', '#F7E2D2'],
    items: [
      ['stoneFruit', 310, 330, 130, -6],
      ['stoneFruit', 510, 360, 112, 10, { leafOn: false }],
    ],
  },
  sargabarack: {
    bg: ['#FDF6EA', '#F7E6CC'],
    items: [
      ['stoneFruit', 300, 350, 95, -6, { base: '#F6A63A', light: '#FFD98F', blush: '#EE6A32', dark: '#C2701D' }],
      ['stoneFruit', 450, 330, 105, 8, { base: '#F6A63A', light: '#FFD98F', blush: '#EE6A32', dark: '#C2701D', leafOn: false }],
      ['stoneFruit', 580, 380, 85, 18, { base: '#F6A63A', light: '#FFD98F', blush: '#EE6A32', dark: '#C2701D', leafOn: false }],
    ],
  },
  szilva: {
    bg: ['#F7F3F7', '#E9E1EB'],
    items: [
      ['plum', 310, 340, 100, -12],
      ['plum', 450, 320, 108, 8],
      ['plum', 570, 380, 88, 22],
      ['leaf', 380, 200, 75, -35],
    ],
  },
  cseresznye: {
    bg: ['#FCF2F1', '#F4DEDC'],
    items: [
      ['cherries', 330, 340, 140, -8, { shadowY: 150 }],
      ['cherries', 520, 370, 115, 12, { shadowY: 130 }],
    ],
  },
  gorogdinnye: {
    bg: ['#F6F8EE', '#E8EDD9'],
    items: [
      ['watermelon', 330, 300, 170, 15, { shadowY: 175 }],
      ['watermelon', 520, 320, 140, -10, { shadowY: 150, seed: 10 }],
    ],
  },
};

for (const [name, scene] of Object.entries(scenes)) {
  uid = 0;
  const defs = [];
  const body = compose(scene.items, defs);
  writeFileSync(join(fruitDir, `${name}.svg`), frame({ bg: scene.bg, zoom: scene.zoom ?? 1.22, body, defs }));
}

// Nyitókép: bőséges gyümölcsös kompozíció.
{
  uid = 0;
  const defs = [];
  const body = compose(
    [
      ['leaf', 250, 230, 120, -150],
      ['leaf', 900, 260, 110, -20],
      ['grapes', 830, 360, 210, 12, { shadowY: 230 }],
      ['pear', 300, 400, 150, -14],
      ['apple', 520, 420, 165, -6, RED_APPLE],
      ['citrus', 740, 560, 150, 0, { ...ORANGE, seed: 31 }],
      ['apple', 330, 640, 140, 12, { ...GREEN_APPLE, leafOn: false }],
      ['citrusHalf', 560, 690, 125, 0, { shadowY: 130 }],
      ['stoneFruit', 940, 650, 120, 10],
      ['strawberry', 780, 800, 85, -20, { seed: 32 }],
      ['strawberry', 880, 840, 70, 25, { seed: 33 }],
      ['blueberry', 420, 840, 42, 0],
      ['blueberry', 480, 860, 46, 30],
      ['blueberry', 540, 845, 40, -20],
      ['cherries', 230, 840, 110, -10, { shadowY: 120 }],
      ['lemon', 1010, 470, 90, -35],
    ],
    defs
  );
  writeFileSync(join(placeholderDir, 'hero.svg'), frame({ w: 1200, h: 1000, bg: ['#FCF8F1', '#F2E8D8'], body, defs }));
}

// Üzletfotó-helyőrző: egyértelműen jelzi, hogy ide valódi fotó kell.
function shopPlaceholder(title, hint, w = 1200, h = 900) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F4EC"/><stop offset="1" stop-color="#EDE7DA"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<rect x="28" y="28" width="${w - 56}" height="${h - 56}" rx="22" fill="none" stroke="#B9B09E" stroke-width="3" stroke-dasharray="14 12"/>
<g transform="translate(${w / 2} ${h / 2 - 70})" fill="none" stroke="#3E7A4C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<path d="M-80 -30 h30 l18 -28 h64 l18 28 h30 a14 14 0 0 1 14 14 v98 a14 14 0 0 1 -14 14 h-160 a14 14 0 0 1 -14 -14 v-98 a14 14 0 0 1 14 -14z"/>
<circle cx="0" cy="34" r="38"/>
</g>
<text x="${w / 2}" y="${h / 2 + 80}" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="44" font-weight="600" fill="#2C3A2E">${title}</text>
<text x="${w / 2}" y="${h / 2 + 130}" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="26" fill="#6B6457">${hint}</text>
</svg>
`;
}

writeFileSync(join(placeholderDir, 'uzlet-kirakat.svg'), shopPlaceholder('[Üzletfotó helye]', 'Az üzlet bejárata vagy kirakata'));
writeFileSync(join(placeholderDir, 'uzlet-pult.svg'), shopPlaceholder('[Üzletfotó helye]', 'A gyümölcspult, ahogy a vásárló látja'));
writeFileSync(join(placeholderDir, 'csapat.svg'), shopPlaceholder('[Csapatfotó helye]', 'Te és a csapat az üzletben'));

console.log(`Kész: ${Object.keys(scenes).length} gyümölcs-illusztráció + nyitókép + 3 üzletfotó-helyőrző.`);
