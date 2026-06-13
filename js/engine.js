// Rendering and interaction engine. Pure-DOM, no framework. Reads distribution
// modules from the registry and paints the chalkboard: sidebar, home grid, and
// the per-distribution board (curve, sliders, stats, prose, conjugate, examples,
// related). Math lives in the distribution modules; this file only draws.
import { DISTRIBUTIONS, BY_ID, byFamily } from './registry.js';

// --- plot geometry (SVG user units) ---
const VB_W = 700, VB_H = 160;
const PAD_L = 50, PAD_R = 40, PAD_T = 20, PAD_B = 20;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

let current = null; // { dist, params }

// ---------- formatting ----------
function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (!Number.isFinite(v)) return '∞';
  if (Math.abs(v) >= 1000 || (v !== 0 && Math.abs(v) < 0.001)) return v.toExponential(2);
  return (Math.round(v * 1000) / 1000).toString();
}

function el(tag, attrs = {}, ...children) {
  const ns = tag === 'svg' || ['path', 'line', 'text', 'g', 'rect', 'polyline'].includes(tag);
  const node = ns
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.setAttribute('class', v);
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v != null) node.setAttribute(k, v);
  }
  for (const c of children) if (c != null) node.append(c);
  return node;
}

// ---------- continuous curve ----------
function sampleCurve(dist, params, n = 200) {
  const [lo, hi] = dist.xRange(params);
  const xs = [], ys = [];
  let ymax = 0;
  for (let i = 0; i <= n; i++) {
    const x = lo + (i / n) * (hi - lo);
    let y = dist.pdf(x, params);
    if (!Number.isFinite(y)) y = 0; // clip asymptotes (e.g. Beta with shape < 1)
    xs.push(x); ys.push(y);
    if (y > ymax) ymax = y;
  }
  return { lo, hi, xs, ys, ymax: ymax || 1 };
}

function toPx(x, y, c) {
  return [
    PAD_L + ((x - c.lo) / (c.hi - c.lo)) * PLOT_W,
    PAD_T + PLOT_H - (y / c.ymax) * PLOT_H * 0.94,
  ];
}

function curvePaths(c) {
  let d = '';
  for (let i = 0; i < c.xs.length; i++) {
    const [px, py] = toPx(c.xs[i], c.ys[i], c);
    d += (i === 0 ? 'M' : 'L') + px.toFixed(2) + ',' + py.toFixed(2) + ' ';
  }
  const [x0] = toPx(c.lo, 0, c);
  const [xN] = toPx(c.hi, 0, c);
  const baseY = PAD_T + PLOT_H;
  const fill = `M${x0.toFixed(2)},${baseY} ` + d.slice(1) + `L${xN.toFixed(2)},${baseY} Z`;
  return { stroke: d.trim(), fill };
}

function buildCurveSvg(dist, params) {
  const c = sampleCurve(dist, params);
  const { stroke, fill } = curvePaths(c);
  const baseY = PAD_T + PLOT_H;
  const svg = el('svg', { viewBox: `0 0 ${VB_W} ${VB_H}`, width: '100%', class: 'curve-svg' });

  // axes
  svg.append(
    el('line', { x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: baseY, class: 'axis' }),
    el('line', { x1: PAD_L, y1: baseY, x2: VB_W - PAD_R, y2: baseY, class: 'axis' }),
    el('text', { x: PAD_L - 8, y: PAD_T + 4, 'text-anchor': 'end', class: 'axis-label', text: 'p(x)' }),
    el('text', { x: VB_W - PAD_R, y: baseY + 16, 'text-anchor': 'end', class: 'axis-label', text: 'x' }),
  );

  // x ticks
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const x = c.lo + (i / ticks) * (c.hi - c.lo);
    const [px] = toPx(x, 0, c);
    svg.append(el('text', { x: px, y: baseY + 16, 'text-anchor': 'middle', class: 'axis-label', text: fmt(x) }));
  }

  svg.append(
    el('path', { class: 'curve-fill', d: fill }),
    el('path', { class: 'curve-path', filter: 'url(#chalk)', d: stroke }),
  );

  // mean / mode markers. Labels sit in the headroom above the plot (y < PAD_T)
  // and split left/right so they never overlap the curve or each other.
  const stats = dist.stats(params);
  const marker = (val, label, color, side) => {
    if (!Number.isFinite(val) || val < c.lo || val > c.hi) return;
    const [px] = toPx(val, 0, c);
    svg.append(el('line', { x1: px, y1: PAD_T, x2: px, y2: baseY, class: 'mark-line', stroke: color }));
    svg.append(el('text', {
      x: side === 'left' ? px - 4 : px + 4, y: 13,
      'text-anchor': side === 'left' ? 'end' : 'start',
      class: 'annot', fill: color, text: label,
    }));
  };
  marker(stats.mode, 'mode', 'rgba(240,235,224,0.5)', 'left');
  marker(stats.mean, 'mean', dist.color, 'right');

  return svg;
}

// ---------- discrete bar chart ----------
function buildBarsSvg(dist, params) {
  const [kmin, kmax] = dist.xRange(params);
  const n = kmax - kmin + 1;
  const ks = [], ps = [];
  let ymax = 0;
  for (let k = kmin; k <= kmax; k++) {
    const p = dist.pmf(k, params);
    const v = Number.isFinite(p) ? p : 0;
    ks.push(k); ps.push(v);
    if (v > ymax) ymax = v;
  }
  ymax = ymax || 1;
  const baseY = PAD_T + PLOT_H;
  const slot = PLOT_W / n;
  const barW = Math.max(2, Math.min(slot * 0.62, 44));
  const svg = el('svg', { viewBox: `0 0 ${VB_W} ${VB_H}`, width: '100%', class: 'curve-svg' });

  svg.append(
    el('line', { x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: baseY, class: 'axis' }),
    el('line', { x1: PAD_L, y1: baseY, x2: VB_W - PAD_R, y2: baseY, class: 'axis' }),
    el('text', { x: PAD_L - 8, y: PAD_T + 4, 'text-anchor': 'end', class: 'axis-label', text: 'P(k)' }),
    el('text', { x: VB_W - PAD_R, y: baseY + 16, 'text-anchor': 'end', class: 'axis-label', text: 'k' }),
  );

  const tickEvery = n <= 15 ? 1 : Math.ceil(n / 12);
  const group = el('g', { filter: 'url(#chalk)' });
  for (let i = 0; i < n; i++) {
    const cx = PAD_L + (i + 0.5) * slot;
    const h = (ps[i] / ymax) * PLOT_H * 0.94;
    group.append(el('rect', { x: cx - barW / 2, y: baseY - h, width: barW, height: h, class: 'bar', fill: dist.color, stroke: dist.color }));
    if (i % tickEvery === 0) svg.append(el('text', { x: cx, y: baseY + 16, 'text-anchor': 'middle', class: 'axis-label', text: String(ks[i]) }));
  }
  svg.append(group);

  const stats = dist.stats(params);
  if (Number.isFinite(stats.mean) && stats.mean >= kmin && stats.mean <= kmax) {
    const px = PAD_L + (stats.mean - kmin + 0.5) * slot;
    svg.append(el('line', { x1: px, y1: PAD_T, x2: px, y2: baseY, class: 'mark-line', stroke: dist.color }));
    svg.append(el('text', { x: px + 4, y: 13, 'text-anchor': 'start', class: 'annot', fill: dist.color, text: 'mean' }));
  }
  return svg;
}

function redrawCurve(boardEl, dist, params) {
  const holder = boardEl.querySelector('.curve-holder');
  holder.replaceChildren(dist.type === 'discrete' ? buildBarsSvg(dist, params) : buildCurveSvg(dist, params));
  const kind = dist.type === 'discrete' ? 'probability mass' : 'probability density';
  boardEl.querySelector('.curve-label').textContent = kind + ' · ' +
    dist.params.map((p) => `${p.label} = ${fmt(params[p.id])}`).join(',  ');
}

// ---------- stats strip ----------
function redrawStats(boardEl, dist, params) {
  const s = dist.stats(params);
  const forms = dist.statForms || {};
  const cell = (lbl, val, form) =>
    el('div', { class: 'stat' },
      el('div', { class: 'stat-lbl', text: lbl }),
      el('div', { class: 'stat-val', text: form ? `${form} = ${val}` : val }));
  boardEl.querySelector('.stats').replaceChildren(
    cell('Mean', fmt(s.mean), forms.mean),
    cell('Mode', fmt(s.mode), forms.mode),
    cell('Variance', fmt(s.variance), forms.variance),
    cell('Support', s.support),
  );
}

// ---------- prose / conjugate / examples / related ----------
function proseBlock(role, section) {
  const block = el('div', { class: 'prose-block' },
    el('div', { class: `prose-eyebrow ${role}`, text: role === 'prior' ? 'as a prior' : 'as a likelihood' }),
    el('div', { class: 'prose-title', text: section.title }));
  if (Array.isArray(section.body)) {
    const points = el('div', { class: 'prose-points' });
    for (const pt of section.body) points.append(el('div', { class: 'prose-point', text: pt }));
    block.append(points);
  } else {
    block.append(el('div', { class: 'prose-body', text: section.body }));
  }
  if (section.tips?.length) {
    const tips = el('div', { class: 'tips' });
    for (const t of section.tips) tips.append(el('div', { class: 'prose-tip', text: t }));
    block.append(tips);
  }
  return block;
}

function conjugateBlock(dist) {
  const c = dist.conjugate;
  const node = (cls, lbl, dl) =>
    el('div', { class: `cn ${cls}` },
      el('div', { class: 'cn-lbl', text: lbl }),
      el('div', { class: 'cn-dist', text: dl }));
  return el('div', { class: 'conj' },
    el('div', { class: 'conj-eyebrow', text: 'conjugate update' }),
    el('div', { class: 'conj-flow' },
      node('cn-prior', 'prior', c.prior),
      el('div', { class: 'cn-arrow', text: '×' }),
      node('cn-like', 'likelihood', c.likelihood),
      el('div', { class: 'cn-arrow', text: '∝' }),
      node('cn-post', 'posterior', c.posterior)),
    el('div', { class: 'formula-box', text: c.formula }),
    el('div', { class: 'conj-note', text: c.note }));
}

function relatedBlock(dist, navigate) {
  const built = dist.related.filter((id) => BY_ID.has(id));
  if (!built.length) return null;
  const chips = el('div', { class: 'rel-chips' });
  for (const id of built) {
    chips.append(el('button', { class: 'rel-ch', text: BY_ID.get(id).name, onclick: () => navigate(id) }));
  }
  return el('div', {}, el('div', { class: 'rel-eyebrow', text: 'related distributions' }), chips);
}

// ---------- board ----------
function renderBoard(main, dist, navigate) {
  const params = Object.fromEntries(dist.params.map((p) => [p.id, p.init]));
  current = { dist, params };
  main.style.setProperty('--accent', dist.color);

  const board = el('div', { class: 'board' });

  // hero
  board.append(
    el('div', { class: 'eyebrow', text: dist.family }),
    el('div', { class: 'dist-name' }, el('em', { text: dist.name }), document.createTextNode(' distribution')),
    el('div', { class: 'notation', text: dist.notation }),
    el('div', { class: 'tagline', text: dist.tagline }),
  );

  // curve
  board.append(
    el('div', { class: 'curve-zone' },
      el('div', { class: 'curve-label' }),
      el('div', { class: 'curve-holder' })),
  );

  // sliders
  const sliders = el('div', { class: 'sliders' });
  for (const p of dist.params) {
    const valSpan = el('span', { class: 'sl-val', text: fmt(params[p.id]) });
    const input = el('input', {
      type: 'range', min: p.min, max: p.max, step: p.step, value: p.init,
      'aria-label': p.name, class: 'chalk-range',
      oninput: (e) => {
        params[p.id] = parseFloat(e.target.value);
        valSpan.textContent = fmt(params[p.id]);
        redrawCurve(board, dist, params);
        redrawStats(board, dist, params);
      },
    });
    sliders.append(
      el('div', { class: 'slider-group' },
        el('div', { class: 'slider-top' },
          el('span', { class: 'sl-name', text: `${p.label}  ${p.name.replace(/\s*\(.*\)/, '')}` }),
          valSpan),
        input,
        el('div', { class: 'sl-desc', text: p.desc })),
    );
  }
  board.append(sliders);

  // stats
  board.append(el('div', { class: 'stats' }));

  // prose
  board.append(
    el('div', { class: 'prose-grid' }, proseBlock('prior', dist.prior), proseBlock('like', dist.likelihood)),
  );

  // conjugate
  board.append(conjugateBlock(dist));

  // examples
  const exList = el('div', { class: 'ex-list' });
  for (const ex of dist.examples) exList.append(el('div', { class: 'ex-item', text: ex }));
  board.append(el('div', {}, el('div', { class: 'ex-eyebrow', text: 'worked examples' }), exList));

  // related
  const rel = relatedBlock(dist, navigate);
  if (rel) board.append(rel);

  main.replaceChildren(board);
  redrawCurve(board, dist, params);
  redrawStats(board, dist, params);
}

// ---------- home ----------
function renderHome(main, navigate) {
  current = null;
  main.style.removeProperty('--accent');
  const grid = el('div', { class: 'fgrid' });
  for (const { family, members } of byFamily()) {
    const chips = el('div', { class: 'chips' });
    for (const d of members) {
      chips.append(el('button', { class: 'ch', text: d.name, onclick: () => navigate(d.id) }));
    }
    grid.append(el('div', { class: 'fb' }, el('div', { class: 'fn', text: family }), chips));
  }
  const home = el('div', { class: 'home' },
    el('div', { class: 'h1' }, el('em', { text: 'Probably' })),
    el('div', { class: 'byline', text: 'a chalkboard reference for bayesian practitioners' }),
    el('div', { class: 'rule' }),
    grid,
    el('div', { class: 'footer-note',
      text: 'select any distribution to see: notation / interactive curve / parameter controls / prior use / likelihood use / conjugate update / worked examples' }));
  main.replaceChildren(home);
}

// ---------- sidebar ----------
function renderSidebar(sidebar, navigate, goHome) {
  const logo = el('div', { class: 'logo', onclick: goHome }, el('em', { text: 'Probably' }));
  const sub = el('div', { class: 'logo-sub', text: 'a bayesian reference' });
  const search = el('input', { type: 'search', class: 'search-input', placeholder: 'search…', 'aria-label': 'search distributions' });
  const list = el('div', { class: 'dist-list' });

  const items = [];
  for (const { family, members } of byFamily()) {
    list.append(el('div', { class: 'fl', text: family }));
    for (const d of members) {
      const item = el('button', { class: 'dr', 'data-id': d.id, text: d.name, onclick: () => navigate(d.id) });
      list.append(item);
      items.push(item);
    }
  }

  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    for (const it of items) {
      const d = BY_ID.get(it.dataset.id);
      const hit = !q || d.name.toLowerCase().includes(q) || d.family.toLowerCase().includes(q);
      it.style.display = hit ? '' : 'none';
    }
  });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = items.find((it) => it.style.display !== 'none');
      if (first) navigate(first.dataset.id);
    }
  });

  sidebar.replaceChildren(logo, sub, el('div', { class: 'search' }, search), list);
  return { setActive: (id) => items.forEach((it) => it.classList.toggle('on', it.dataset.id === id)) };
}

// ---------- mount ----------
export function mount(root) {
  const sidebar = el('aside', { class: 'sidebar' });
  const main = el('main', { class: 'main' });
  root.append(sidebar, main);

  const goHome = () => { if (location.hash) location.hash = ''; else route(); };
  const navigate = (id) => { location.hash = id; };

  const { setActive } = renderSidebar(sidebar, navigate, goHome);

  function route() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const dist = BY_ID.get(id);
    if (dist) {
      renderBoard(main, dist, navigate);
      setActive(id);
      main.scrollTop = 0;
    } else {
      renderHome(main, navigate);
      setActive(null);
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('keydown', (e) => {
    const inField = e.target.matches('input, textarea, select');
    if (e.key === 'Escape') { if (location.hash) location.hash = ''; return; }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !inField) {
      const ids = DISTRIBUTIONS.map((d) => d.id);
      const cur = current ? ids.indexOf(current.dist.id) : -1;
      const next = e.key === 'ArrowDown'
        ? Math.min(ids.length - 1, cur + 1)
        : Math.max(0, cur - 1);
      if (ids[next]) { navigate(ids[next]); e.preventDefault(); }
    }
  });

  route();
}
