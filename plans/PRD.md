## Problem Statement

People learning or practising Bayesian inference constantly need a single, trustworthy reference that answers, for a given probability distribution: what is it, what does its density look like as the parameters move, when would I use it as a prior, when as a likelihood, what is the conjugate update, and where have I seen it used. The usual answers are scattered across textbooks, Wikipedia, and library docs that each use different parametrisation conventions, none of which is interactive, and most of which are visually joyless. There is no calm, beautiful, single place to build intuition about distributions and how they update.

## Solution

A single-page web reference called **Probably**, rendered as a tasteful school chalkboard, that runs entirely in the browser and deploys as static files to GitHub Pages with no build step. The visitor picks a distribution from a chalk sidebar (or the home family grid) and lands on one scrolling board for that distribution: name and notation, a live chalk-drawn density curve that redraws as parameter sliders move, a live stats strip (mean, mode, variance, support), honest prose on using it as a prior and as a likelihood, a worked conjugate-update panel (or an honest "requires MCMC" explanation), worked examples, and links to related distributions. Phase 1 ships a polished, internally coherent set of 11 distributions; the architecture is built so the remaining distributions can be added later one module at a time.

## User Stories

1. As a Bayesian learner, I want to see a distribution's probability density drawn as a curve, so that I can build visual intuition for its shape.
2. As a learner, I want to drag a parameter slider and watch the curve redraw live, so that I understand how each parameter changes the distribution.
3. As a learner, I want each parameter slider labelled with its symbol, current value, and a one-line description, so that I know what I am changing and what it means.
4. As a practitioner, I want a live stats strip showing mean, mode, variance, and support, so that I can read off the moments without computing them by hand.
5. As a practitioner, I want a plain-language explanation of when and why to use a distribution as a prior, so that I can choose priors deliberately rather than by habit.
6. As a practitioner, I want to know what the hyperparameters encode in practical terms and how to elicit them from domain knowledge, so that I can set them responsibly.
7. As a practitioner, I want to be warned about known pathologies of a prior (for example vague Gamma priors on variance), so that I avoid common mistakes.
8. As a practitioner, I want a plain-language explanation of the data-generating process a distribution models as a likelihood, so that I can judge whether it fits my data.
9. As a practitioner, I want guidance on when to prefer a distribution over similar alternatives, so that I can make an informed modelling choice.
10. As a practitioner, I want the conjugate update written out as prior times likelihood gives posterior, with the full equations, so that I can apply it directly.
11. As a practitioner, I want an intuitive sentence on what the conjugate update is doing to my beliefs, so that the algebra connects to meaning.
12. As a practitioner, I want distributions with no closed-form conjugate to honestly say "requires MCMC" and tell me which sampler and approach to use, so that I am not misled into expecting a tidy update.
13. As a practitioner, I want a distribution that is not normally used in a given role to say so plainly and tell me what to use instead, so that I am not given padded or misleading content.
14. As a learner, I want three to five concrete worked examples per distribution with real domains and numbers, so that I can connect the theory to practice.
15. As a learner, I want to jump to related distributions via chips, so that I can explore the family and see how distributions connect.
16. As a visitor, I want a home screen that shows the families of distributions in a grid, so that I can grasp the landscape and pick a starting point.
17. As a visitor, I want to click any distribution chip on the home screen and land on its board, so that navigation is immediate.
18. As a returning visitor, I want to deep-link or bookmark a specific distribution and have it load directly, so that I can share or revisit a page.
19. As a visitor, I want browser back and forward to move between the distributions I viewed, so that navigation feels native.
20. As a visitor, I want a search box in the sidebar that filters the distribution list as I type, so that I can find a distribution quickly.
21. As a keyboard user, I want pressing Enter in search to open the first matching distribution, so that I can navigate without the mouse.
22. As a keyboard user, I want arrow keys to move between distributions in the sidebar, so that I can browse hands-on-keyboard.
23. As a keyboard user, I want Escape to return to the home screen, so that I have a quick way back.
24. As a visitor, I want clicking the site logo to return home, so that there is an obvious reset.
25. As a visitor on a phone, I want the sidebar to collapse into a top navigation strip below a narrow width, so that the reference is usable on mobile.
26. As a visitor, I want the active distribution marked in the sidebar with a chalk marker, so that I always know where I am.
27. As someone who appreciates craft, I want the whole site to read as a genuine, beautiful chalkboard rather than a generic AI-styled web app, so that it is a pleasure to use.
28. As a learner studying discrete distributions, I want them drawn as a chalk bar chart rather than a smooth curve, so that the visual matches the distribution's nature.
29. As a learner studying a multivariate distribution, I want a fitting visual (for the Dirichlet, a 2-simplex) rather than a misleading 1D curve, so that the picture is honest.
30. As a contributor, I want each distribution defined in its own self-contained module following a documented data structure, so that I can add a new distribution without touching the app shell.
31. As a contributor, I want a README that documents the data-structure format and how to run the site locally, so that I can get started quickly.
32. As the site owner, I want the site to deploy from GitHub Pages with no build step, so that maintenance and hosting stay trivial and free.
33. As the site owner, I want refreshing or sharing a distribution URL to work reliably on GitHub Pages, so that links never 404.
34. As the site owner, I want each distribution to carry its own chalk accent colour applied to its curve and controls, so that pages have individual identity while the role colours (prior, likelihood, posterior) stay consistent.
35. As a maintainer, I want the per-distribution numerical content backed by automated checks (the density integrates to roughly one, sampled moments match the closed-form stats), so that formula errors surface mechanically rather than shipping silently.

## Implementation Decisions

- **No build step, static deployment.** The site is plain HTML, CSS, and vanilla JavaScript served as static files from GitHub Pages at the repository root. No frameworks, no bundler, no transpile step.
- **Custom SVG curve rendering, not Chart.js.** The original prompt's suggestion of Chart.js is rejected because Chart.js renders to canvas and the chalk aesthetic depends on applying an SVG `feTurbulence` plus `feDisplacementMap` filter to the curve path, which is impossible on canvas. A small in-house plotting routine samples each distribution's density or mass function, builds an SVG path (continuous) or set of bars (discrete), and the chalk filter is applied to it. Curves redraw live on slider input.
- **Per-family bespoke visuals for multivariate distributions.** Multivariate distributions do not get a fake 1D curve. In phase 1 the only multivariate distribution is the Dirichlet, visualised as a 2-simplex (triangle). Other multivariate visuals (multivariate Normal contours, Wishart, LKJ) are deferred to later phases.
- **App shell plus per-distribution ES modules.** `index.html` holds the app shell, CSS, the hidden SVG filter defs, the rendering and routing engine, and the math helpers. Each distribution lives in its own native ES module imported with `type="module"`. This keeps the project buildless while making it maintainable and reviewable one distribution at a time. Module paths are relative so they resolve under the GitHub Pages project URL.
- **Distribution data shape.** Each distribution module exports a single object with: name, family, notation, accent colour, tagline, an array of parameter definitions (id, label symbol, full name, min, max, step, init, one-line description), a pure density or mass function of (x, params), an xRange function of params, a stats function of params returning mean/mode/variance/support, a prior section (title, body, tips), a likelihood section (title, body, tips), a conjugate section (prior, likelihood, posterior, written-out aligned formula, intuitive note), worked examples, and related-distribution ids. The density, stats, and xRange functions are pure so they can be tested headlessly.
- **Hash-based routing.** Distribution selection updates the URL hash (for example `#gamma`). This makes back and forward navigation, deep-linking, and refresh all work on a GitHub Pages project page with no server-side rewrite. Escape and clicking the logo clear the hash to return home.
- **Phase 1 distribution set (11).** Beta, Gamma, Inverse-Gamma, Exponential, Normal, Student-t, Bernoulli, Binomial, Poisson, Negative Binomial, Dirichlet. This set is internally coherent: it demonstrates Beta-Binomial/Bernoulli conjugacy, Gamma-Poisson and Gamma-Exponential conjugacy, Normal-Normal and Normal-Inverse-Gamma conjugacy, Dirichlet-Categorical conjugacy, Student-t as the honest "requires MCMC" case, and Dirichlet as the multivariate showcase.
- **Sidebar and home grid list only built distributions.** Only the 11 phase-1 distributions appear, and every one is clickable. The full taxonomy is not shown until those distributions are actually built.
- **Site identity.** The logo reads "Probably" in Playfair Display italic (pale green) with the Caveat tagline "a bayesian reference". The mockups' "Statistical Distributions" placeholder is dropped.
- **Colour system.** Each distribution carries its own chalk accent colour from the palette (pale green, amber, blue, coral), applied to its curve, sliders, stats values, distribution-name highlight, and active sidebar marker. Role colours are fixed and semantic across all distributions: prior is blue, likelihood is green, posterior is purple.
- **Typography and aesthetic constraints.** Three fonts only, loaded from Google Fonts: Playfair Display for titles and distribution names, Caveat for labels/navigation/prose, JetBrains Mono for all maths and parameter values. Deep slate green-black background with a subtle SVG noise texture. No drop shadows, no gloss, no white cards, no gradients, no emoji, no em dashes.
- **Math in vanilla JS.** Special functions needed for the densities and stats (log-gamma, beta, error function, and so on) are implemented in plain JavaScript helpers in the shell; no numerical library is added.
- **Deployment.** A `.nojekyll` file is included so GitHub Pages serves all files as-is. The site is pushed to `main` and Pages is served from the repository root, defaulting to the github.io project URL with no custom domain. Commits and README carry no AI or co-author attribution.
- **Local development.** Because native ES modules do not load over `file://` in most browsers, the README instructs running a one-line local HTTP server rather than opening the file directly. The deployed site over HTTP is unaffected.

## Testing Decisions

- **Test external behaviour, not implementation.** Tests assert observable properties of the distribution data and the running page, never internal helper structure, so they stay valid as the rendering internals evolve.
- **Pure data modules tested headlessly in Node.** Each distribution module is imported in Node and checked numerically: its density or mass function integrates (or sums) to approximately one over its declared support, its sampled or numerically integrated mean and variance match the closed-form values returned by its stats function within tolerance, and its xRange and support are sane. This is the committed form of the agreed numerical self-checks and is the highest-value seam because the functions are pure and require no DOM. A minimal runner (Node's built-in test facility) is used rather than adding a heavy framework.
- **Light DOM smoke tests with Playwright.** A small number of browser tests confirm the integration seams: the home screen renders the family grid, clicking a distribution chip routes via the hash and renders that distribution's board, and moving a parameter slider redraws the curve. These verify wiring, not pixels. Playwright is a dev-only dependency and is never deployed.
- **Prior art.** This is a greenfield repository with no existing tests, so these establish the prior art: pure-function numeric tests for the data modules, and Playwright smoke tests for the page. Later distributions follow the same two patterns.

## Out of Scope

- The remaining ~37 distributions from the full taxonomy (everything beyond the phase-1 set of 11). The architecture supports adding them later, one module at a time, but they are not built now.
- Bespoke multivariate visuals beyond the Dirichlet 2-simplex (multivariate Normal contours, Wishart, Inverse-Wishart, LKJ, Multinomial, Dirichlet-Multinomial visuals).
- Any persistence: no localStorage, no cookies, no user accounts, no saved state.
- Any backend or external API calls beyond loading Google Fonts.
- A custom domain for the GitHub Pages site.
- Exhaustive cross-browser and pixel-level visual regression testing.
- Sampling, fitting, or inference features (the site is a reference and intuition builder, not an inference engine).

## Further Notes

- The two static mockups in the plans directory (home and distribution detail) are visual reference only. They are rebuilt faithfully within the module architecture rather than extended in place.
- Statistical content is authored to a high craft bar with quiet numerical sanity checks during development; the committed Node tests make those checks permanent for the data modules.
- Parametrisation conventions are stated explicitly per distribution (for example Gamma shape-rate versus shape-scale), since differing conventions across tools are a common source of confusion and the prose calls this out where relevant.
