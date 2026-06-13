# Probably

*a bayesian reference*

An interactive chalkboard reference for statistical distributions and Bayesian inference. Each distribution gets one scrolling board: its notation, a live density curve you reshape with parameter sliders, a stats strip, honest guidance on using it as a prior and as a likelihood, the conjugate update written out in full, and worked examples. It runs entirely in the browser with no build step and deploys as static files to GitHub Pages.

## Running locally

The app uses native ES modules, which browsers refuse to load over `file://`. Serve the folder over HTTP instead:

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000
```

Any static server works (`npx serve`, etc.). Opening `index.html` directly will not work.

## Deploying to GitHub Pages

1. Push to the `main` branch.
2. In the repository settings, enable Pages and serve from the `main` branch at the repository root.

A `.nojekyll` file is included so Pages serves every file as-is. All paths are relative, so the site works from the project subpath (for example `username.github.io/probably/`). Routing is hash-based (`#beta`), so deep links and refreshes always resolve without server rewrites.

## Tests

```bash
npm install          # first time only
npm test             # numeric checks on the distribution modules (Node)
npm run test:smoke   # Playwright DOM smoke tests (needs: npx playwright install chromium)
```

The Node tests verify, purely from each module's own functions, that the density integrates to ~1 over its support and that the numerical mean and variance match the closed-form `stats()`. The smoke tests verify rendering, hash routing, and live curve redraw.

## Adding a distribution

Each distribution is one self-contained ES module in `js/distributions/`, exporting a single object. Add the import and an entry to `js/registry.js`; the sidebar, home grid, routing, and related-chip filtering all derive from that list.

```js
export const example = {
  id:        'example',          // unique slug, used in the URL hash
  name:      'Example',
  family:    'Continuous — positive',
  notation:  'X ~ Example(θ)',
  color:     '#9ecf98',          // chalk accent for this distribution
  type:      'continuous',       // 'continuous' | 'discrete' | 'multivariate'
  tagline:   'One sentence on what this distribution is fundamentally for.',
  params: [
    { id: 'theta', label: 'θ', name: 'rate (θ)', min: 0.1, max: 10, step: 0.1, init: 1,
      desc: 'One-line description shown under the slider.' },
  ],
  pdf:    (x, p) => /* density or mass at x */ 0,
  xRange: (p) => [lo, hi],       // plotting range
  stats:  (p) => ({ mean, mode, variance, support }),  // numbers + a support string
  statForms: { mean: 'θ', mode: '…', variance: '…' },  // optional formula labels
  prior:      { title: '…', body: ['point', 'point'], tips: ['…'] },  // body: string or string[]
  likelihood: { title: '…', body: ['point', 'point'], tips: ['…'] },
  conjugate:  { prior: '…', likelihood: '…', posterior: '…', formula: '…', note: '…' },
  examples:   ['concrete example with numbers', '…'],
  related:    ['gamma', 'poisson'],   // ids; unbuilt ones are hidden automatically
};
```

`pdf`, `xRange`, and `stats` are pure functions so they can be tested headlessly. `body` may be a string (paragraph) or an array of strings (point form). Use `feTurbulence`-filtered chalk styling for any custom visuals so they match the board.

## Design

Deep slate chalkboard, off-white chalk text, and per-distribution accent colours. Playfair Display for titles, Lora for readable body prose, Caveat for handwritten chalk labels and annotations, JetBrains Mono for all mathematics. Curves are SVG paths with a chalk displacement filter, not a charting library.
