# Probably — Build Prompt

> An interactive chalkboard reference for statistical distributions and Bayesian inference.

Build a single-page web application called **Probably**. The app must run entirely in the browser with no build step, deployable as a single `index.html` file on GitHub Pages.

---

## Aesthetic: chalkboard, not simulation

The entire visual language is a school chalkboard rendered with taste and restraint — not a digital gimmick. Background is deep slate green-black (`#1d2b23` or similar, not pure black). All text, curves, UI elements, and annotations are rendered as if drawn in chalk: off-white (`#f0ebe0`), with accent colours in pale green (`#9ecf98`), pale amber (`#f5c87a`), pale blue (`#8ab4d4`), pale coral (`#d4937a`). A subtle SVG noise texture on the background suggests real slate without being heavy-handed. No smooth gradients. No drop shadows. No gloss. No white card surfaces. Everything reads as hand-drawn and academic.

Typography uses three faces loaded from Google Fonts. **Playfair Display** (serif, italic available) for the site title and distribution names. **Caveat** (cursive, handwritten) for all labels, annotations, sidebar navigation, prose body text, slider descriptions, and example text — it must feel like someone wrote it. **JetBrains Mono** for all mathematical notation, formulae, parameter values, and code. No other fonts. No system sans-serif anywhere visible.

Curves and distribution plots are SVG paths styled as chalk strokes. Apply an SVG `feTurbulence` + `feDisplacementMap` filter to curve paths to give them slight imperfection — not obvious distortion, just enough to lose the machine-perfect edge. Curve fills are the stroke colour at roughly 8% opacity. When parameters change, curves redraw smoothly. Annotations on curves (mean marker, mode marker, support boundaries) look like chalk marks with Caveat labels.

The overall feel must be genuinely beautiful — something a professor who cares about craft would be proud to put on a real chalkboard. Avoid anything that reads as default AI-generated design: no blue accent colours used as primary UI, no card grids with box shadows, no pill badges on white backgrounds, no gradient hero sections, no emoji, no em dashes.

---

## Layout

Full-viewport two-column grid: a narrow sidebar (220px) on the left, the main board filling the rest.

**Sidebar** contains: the site logo (Playfair Display, "Probably" in large italic, pale green), the tagline ("a bayesian reference" in Caveat, muted), a search input styled as a chalk-ruled line with a cursor, and the full distribution list grouped by family with chalk-style section dividers. The active distribution gets a short chalk mark to its left. Sidebar background is slightly darker than the main board.

**Main board**: generous padding (48px sides), content flows top to bottom — hero, curve, sliders, stats, prose, conjugate panel, examples, related distributions. No tabs, no accordions, no modals. Everything on one scrolling board per distribution. The home screen replaces this content with the title treatment and family overview grid.

---

## Home screen

Large Playfair Display title: "Probably" with a Playfair italic subtitle line. Below, a single sentence description in Caveat. Then a chalk divider rule. Then a grid of distribution families, each showing its family name in small-caps Caveat and its distributions as chalk-circled chips. Clicking any chip navigates to that distribution. A footer line in muted Caveat:

> "select any distribution to see: notation / interactive curve / prior use / likelihood use / conjugate update / worked examples"

---

## Distribution detail page

Each distribution fills the main board with the following sections in order.

### 1. Eyebrow
Family name in tiny uppercase Caveat, muted.

### 2. Name and notation
Distribution name in large Playfair Display italic (e.g. *Gamma* distribution), mathematical notation directly below in JetBrains Mono pale green (e.g. `X ~ Gamma(α, β)`), then a one-sentence tagline in Caveat explaining what this distribution is fundamentally for.

### 3. Interactive curve
An SVG plot drawn in chalk style. For continuous distributions: a smooth density curve with chalk texture filter, filled underneath at low opacity, with dashed chalk lines marking the mean and mode, annotated with Caveat labels. For discrete distributions: chalk bar chart. Axes are minimal chalk lines with Caveat tick labels. The curve redraws live as sliders move.

### 4. Parameter sliders
One per parameter (2 to 4 depending on distribution), laid out in a row. Each slider is custom-styled: a thin chalk horizontal rule as the track, a small circle as the thumb, parameter name in Caveat on the left, current value in JetBrains Mono on the right, a one-line description below in small muted Caveat. No browser-default range input styling visible.

### 5. Stats strip
Four items in a row: Mean, Mode, Variance, Support. Each is a small muted uppercase label above a JetBrains Mono value. Values update live with sliders. Separated by the faintest chalk horizontal rule above.

### 6. Two-column prose

**Left column — "as a prior"** (pale blue eyebrow): a Playfair Display section title and 3 to 5 sentences of body text in Caveat. Below the prose, 2 to 3 practical tips rendered as small Caveat lines with a chalk `›` bullet, separated by hairline rules.

**Right column — "as a likelihood"** (pale green eyebrow): same structure.

If the distribution is not typically used in a given role, say so honestly and explain what to use instead — do not pad with irrelevant content.

### 7. Conjugate update panel
Styled as a worked example on the board. A three-node flow:

- Prior node (pale blue border)
- Times symbol
- Likelihood node (pale green border)
- Proportional-to symbol
- Posterior node (pale purple border)

Each node shows the distribution name and its form. Below: a formula block in JetBrains Mono on a slightly darker background, showing the full update equations written out with alignment. Below that: one sentence in Caveat italic explaining what the update means intuitively.

If no closed-form conjugate exists, the posterior node says "requires MCMC" and the formula block explains which sampler to use and why, with the same depth as a conjugate case.

### 8. Worked examples
Eyebrow "worked examples" in pale amber uppercase Caveat. Three to five examples, each a sentence or two, concrete domain and numbers. Each preceded by a chalk arrow (`->`). Separated by hairline rules.

### 9. Related distributions
Muted uppercase Caveat label, then a row of chalk-circled chips. Clicking navigates to that distribution.

---

## Distributions to include

### Continuous — bounded
Beta, Kumaraswamy, Uniform, Triangular, PERT

### Continuous — positive
Gamma, Inverse-Gamma, Exponential, Log-Normal, Half-Normal, Weibull, Pareto, Chi-Squared, Inverse Gaussian, Rayleigh, Nakagami

### Continuous — real line
Normal, Student-t, Cauchy, Laplace, Logistic, Gumbel, Asymmetric Laplace, Hyperbolic Secant

### Discrete
Bernoulli, Binomial, Poisson, Negative Binomial, Geometric, Categorical, Hypergeometric, Beta-Binomial, Conway-Maxwell-Poisson, Zeta

### Multivariate
Dirichlet, Multivariate Normal, Wishart, Inverse-Wishart, Multinomial, LKJ, Dirichlet-Multinomial

---

## Data structure

Each distribution is defined as a single JavaScript object containing:

```js
{
  name:       string,
  family:     string,
  notation:   string,
  color:      string,           // hex accent colour for this distribution
  tagline:    string,           // one sentence
  params: [
    {
      id:     string,
      label:  string,           // symbol, e.g. "α"
      name:   string,           // full name, e.g. "shape (α)"
      min:    number,
      max:    number,
      step:   number,
      init:   number,
      desc:   string            // one-line description for slider
    }
  ],
  pdf:        (x, params) => number,   // or pmf for discrete
  xRange:     (params) => [lo, hi],
  stats:      (params) => ({ mean, mode, variance, support }),
  prior: {
    title:    string,
    body:     string,           // 3-5 sentences
    tips:     string[]          // 2-3 practical tips
  },
  likelihood: {
    title:    string,
    body:     string,
    tips:     string[]
  },
  conjugate: {
    prior:     string,          // e.g. "Beta(α, β)"
    likelihood: string,
    posterior:  string,
    formula:    string,         // multi-line, aligned, plain text
    note:       string          // one sentence intuitive explanation
  },
  examples:   string[],         // 3-5 concrete examples
  related:    string[]          // distribution ids
}
```

---

## Content quality requirements

**Prior section**: explain when and why you would use this distribution as a prior, what the hyperparameters encode in practical terms, what prior strength means, how to elicit hyperparameters from domain knowledge, and any known pathologies.

**Likelihood section**: explain what data-generating process this distribution models, what assumptions it makes, when to prefer it over similar alternatives, and what to check before using it.

**Conjugate section**: write out the full update equations with alignment, name what each quantity represents, and explain intuitively what the update is doing — not just algebraically but in terms of what information flows from data to posterior.

Do not pad any section. If a distribution is not used as a likelihood (e.g. Beta, Dirichlet), say so directly in one sentence and explain why. If a distribution has no conjugate (e.g. Student-t, Weibull), explain what MCMC approach to use, mention the scale-mixture representation where relevant, and describe what Stan or PyMC code for that prior looks like.

---

## Navigation and interaction

- Clicking a distribution in the sidebar or a chip on the home screen renders that distribution's page into the main board
- The sidebar item gets its chalk marker
- Browser history is updated so back/forward navigation works
- Search filters the sidebar list in real time, matching on distribution name and family name
- Pressing Enter navigates to the first visible result
- Arrow keys move between distributions in the sidebar
- Escape returns home
- Clicking the site logo returns home

---

## Technical requirements

- Single `index.html` file, vanilla JavaScript, no frameworks, no build tools
- All distribution logic in one JS data structure
- Chart.js loaded from cdnjs CDN for curve rendering, with all default styling overridden — custom colours, no Chart.js gridlines, no legend, chalk-style tooltips
- Google Fonts loaded via `<link>` in `<head>`
- SVG chalk filter (`feTurbulence` + `feDisplacementMap`) defined in a hidden `<defs>` block in the document
- Custom CSS range input styling to replace browser defaults with the chalk slider design
- Responsive: sidebar collapses to a top navigation strip on viewports below 768px
- No localStorage, no cookies, no external API calls beyond Google Fonts and Chart.js CDN
- Must load and run correctly when served from GitHub Pages at a root URL

---

## Deliverables

Two files:

**`index.html`** — the complete application as described above.

**`README.md`** — containing:
- Project name and tagline
- One-paragraph description
- Instructions for running locally (open `index.html` in a browser) and deploying to GitHub Pages (push to `main` branch, enable Pages from repository root)
- A brief note on the data structure format for contributors who want to add distributions
