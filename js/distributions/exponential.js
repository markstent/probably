// Exponential (rate λ) - the memoryless waiting time, and Gamma(1, λ).
export const exponential = {
  id: 'exponential',
  name: 'Exponential',
  family: 'Continuous · positive',
  notation: 'X ~ Exponential(λ)',
  color: '#d4937a',
  type: 'continuous',
  tagline:
    'The time you wait for the next event when events arrive at a constant rate. The only continuous distribution with no memory: how long you have already waited tells you nothing.',

  params: [
    { id: 'lam', label: 'λ', name: 'rate (λ)', min: 0.2, max: 5, step: 0.1, init: 1,
      desc: 'Events per unit time. Higher λ means faster events and a steeper decay.' },
  ],

  pdf(x, { lam }) {
    if (x < 0) return 0;
    return lam * Math.exp(-lam * x);
  },

  xRange({ lam }) {
    return [0, 7 / lam];
  },

  stats({ lam }) {
    return { mean: 1 / lam, mode: 0, variance: 1 / (lam * lam), support: '(0, ∞)' };
  },

  statForms: { mean: '1 / λ', mode: '0', variance: '1 / λ²' },

  prior: {
    title: 'A one-parameter prior for scales',
    body: [
      'A simple, weakly-informative prior for a positive scale or rate, for example Exponential(1) on a standard deviation.',
      'It encodes that smaller values are more likely, decaying smoothly with mean 1/λ.',
      'Popular on σ in hierarchical models (Stan, PyMC), gentler and better-behaved than Gamma(ε, ε).',
      'Being Gamma(1, λ), it carries a single piece of prior information, so it regularises lightly.',
    ],
    tips: [
      'Set λ from a prior guess of the scale: the prior mean is 1/λ.',
      'For something with a peak away from zero, use a Gamma with shape α > 1 instead.',
    ],
  },

  likelihood: {
    title: 'Constant-rate waiting times',
    body: [
      'Models the gaps between events in a Poisson process: inter-arrival times of independent events.',
      'Assumes a constant event rate and the memoryless property (a flat hazard).',
      'If the hazard rises or falls over time, reach for Weibull or Gamma instead.',
      'Check the constant-rate assumption: plot the empirical hazard before committing.',
    ],
    tips: [
      'Exponential is Gamma(1, λ): the time to the first event of an Erlang/Gamma chain.',
      'Exponential inter-arrivals and a Poisson count of events are two views of the same process.',
    ],
  },

  conjugate: {
    prior: 'Gamma(α, β)',
    likelihood: 'Exponential(λ)',
    posterior: 'Gamma(α + n, β + Σxᵢ)',
    formula:
`Prior:       λ ~ Gamma(α, β)
Likelihood:  xᵢ ~ Exponential(λ),  i = 1…n

Posterior:   λ | x ~ Gamma(α + n,  β + Σxᵢ)

Posterior mean = (α + n) / (β + Σxᵢ)`,
    note:
      'Each observed waiting time adds one to the shape (one more event seen) and its length to the rate (more elapsed time). The Gamma prior is conjugate for the Exponential rate.',
  },

  examples: [
    'Time between requests hitting a server when load is steady.',
    'Lifetime of a component with a constant failure rate (no wear-in or wear-out).',
    'Gaps between radioactive decay events.',
    'Inter-arrival times of customers joining a queue.',
  ],

  related: ['gamma', 'poisson', 'weibull'],
};
