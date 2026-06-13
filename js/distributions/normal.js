// Normal (mean μ, standard deviation σ) — the default for an unbounded quantity.
export const normal = {
  id: 'normal',
  name: 'Normal',
  family: 'Continuous — real line',
  notation: 'X ~ Normal(μ, σ)',
  color: '#8ab4d4',
  type: 'continuous',
  tagline:
    'The bell curve. The limit of many small independent effects added together, and the default model for a symmetric, light-tailed quantity on the whole real line.',

  params: [
    { id: 'mu', label: 'μ', name: 'mean (μ)', min: -5, max: 5, step: 0.1, init: 0,
      desc: 'Centre of the distribution.' },
    { id: 'sigma', label: 'σ', name: 'std dev (σ)', min: 0.2, max: 4, step: 0.1, init: 1,
      desc: 'Spread. Larger σ flattens and widens the bell.' },
  ],

  pdf(x, { mu, sigma }) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  },

  xRange({ mu, sigma }) {
    return [mu - 4 * sigma, mu + 4 * sigma];
  },

  stats({ mu, sigma }) {
    return { mean: mu, mode: mu, variance: sigma * sigma, support: '(−∞, ∞)' };
  },

  statForms: { mean: 'μ', mode: 'μ', variance: 'σ²' },

  prior: {
    title: 'Prior on an unbounded location',
    body: [
      'The default prior for a location parameter that can take any sign: a regression coefficient, an intercept, a mean.',
      'μ sets your prior guess and σ its strength: a small σ is informative, a large σ is weak.',
      'Conjugate prior for the mean of a Normal likelihood when the variance is known.',
      'Weakly-informative Normal(0, 1) priors on standardised coefficients regularise gently and help sampling.',
    ],
    tips: [
      'Standardise predictors first so a single Normal(0, 1) prior is sensible across coefficients.',
      'A flat (improper) prior is the σ → ∞ limit; prefer a wide but proper Normal for stable inference.',
    ],
  },

  likelihood: {
    title: 'Symmetric, light-tailed data',
    body: [
      'Models continuous data that are roughly symmetric with thin tails, the classic regression error term.',
      'Justified when an outcome is the sum of many small independent influences (central limit theorem).',
      'Assumes constant variance and no heavy tails or skew.',
      'For outliers use Student-t; for positivity or right-skew use Log-Normal or Gamma.',
    ],
    tips: [
      'Inspect residuals for skew, fat tails, and changing variance before trusting Normal errors.',
      'On strictly positive data, modelling log(x) as Normal is often more honest than Normal on x.',
    ],
  },

  conjugate: {
    prior: 'Normal(μ₀, σ₀²)',
    likelihood: 'Normal(μ, σ²)',
    posterior: 'Normal(μₙ, σₙ²)',
    formula:
`Prior:       μ ~ Normal(μ₀, σ₀²)
Likelihood:  xᵢ ~ Normal(μ, σ²),  i = 1…n,  σ² known

Posterior:   μ | x ~ Normal(μₙ, σₙ²)

  σₙ² = 1 / ( 1/σ₀² + n/σ² )
  μₙ  = σₙ² · ( μ₀/σ₀²  +  (Σxᵢ)/σ² )`,
    note:
      'Precisions (1/variance) add: posterior precision is prior precision plus n times the data precision, and the posterior mean is their precision-weighted average. When the variance is also unknown, pair this with an Inverse-Gamma prior on σ² (the Normal-Inverse-Gamma model).',
  },

  examples: [
    'Priors on coefficients in a linear or logistic regression.',
    'A measurement-error model where each reading is the true value plus Normal noise.',
    'Heights or standardised test scores in a large population.',
    'The difference in means in a Bayesian A/B test on a continuous metric.',
  ],

  related: ['student-t', 'inverse-gamma', 'gamma'],
};
