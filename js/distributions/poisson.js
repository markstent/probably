import { lgamma } from '../mathx.js';

// Poisson (rate λ) - counts of independent events in a fixed exposure.
export const poisson = {
  id: 'poisson',
  name: 'Poisson',
  family: 'Discrete',
  notation: 'X ~ Poisson(λ)',
  color: '#f5c87a',
  type: 'discrete',
  tagline:
    'How many independent events happen in a fixed window when they arrive at an average rate λ. Its signature is that the variance equals the mean.',

  params: [
    { id: 'lam', label: 'λ', name: 'rate (λ)', min: 0.5, max: 20, step: 0.5, init: 4,
      desc: 'Expected number of events per window. Also the variance.' },
  ],

  pmf(k, { lam }) {
    if (k < 0 || k !== Math.round(k)) return 0;
    return Math.exp(k * Math.log(lam) - lam - lgamma(k + 1));
  },

  xRange({ lam }) {
    return [0, Math.ceil(lam + 4 * Math.sqrt(lam) + 5)];
  },

  stats({ lam }) {
    return { mean: lam, mode: Math.floor(lam), variance: lam, support: '{0, 1, 2, …}' };
  },

  statForms: { mean: 'λ', variance: 'λ' },

  prior: {
    title: 'Seldom a prior',
    body: [
      'Poisson models an observed count, so it is rarely a prior on a parameter.',
      'It occasionally serves as a prior on an unknown integer count given an expected rate.',
      'For the rate λ itself, the prior you want is Gamma.',
    ],
    tips: [
      'Reaching for a prior on a rate? Use Gamma; Poisson is the data model.',
    ],
  },

  likelihood: {
    title: 'Event counts at a constant rate',
    body: [
      'Counts of independent events in a fixed interval, area, or volume at a constant rate λ.',
      'Its defining property is equidispersion: the variance equals the mean.',
      'Assumes events occur independently and the rate is constant across the exposure.',
      'When the variance exceeds the mean (overdispersion), use the Negative Binomial instead.',
    ],
    tips: [
      'Let the exposure vary with an offset: model log(λ) = β·x + log(exposure).',
      'Excess zeros point to a zero-inflated or hurdle Poisson.',
    ],
  },

  conjugate: {
    prior: 'Gamma(α, β)',
    likelihood: 'Poisson(λ)',
    posterior: 'Gamma(α + Σxᵢ, β + n)',
    formula:
`Prior:       λ ~ Gamma(α, β)
Likelihood:  xᵢ ~ Poisson(λ),  i = 1…n

Posterior:   λ | x ~ Gamma(α + Σxᵢ,  β + n)

Posterior mean = (α + Σxᵢ) / (β + n)
  → blend of the prior mean α/β and the observed rate Σxᵢ/n`,
    note:
      'Observed events add to the shape and the number of exposure windows adds to the rate. The Gamma prior is conjugate, and marginalising λ over its Gamma posterior gives a Negative Binomial predictive distribution.',
  },

  examples: [
    'Calls arriving at a help centre per hour.',
    'Goals scored in a football match.',
    'Mutations in a fixed stretch of a genome.',
    'Typos per page of a manuscript.',
  ],

  related: ['gamma', 'exponential', 'negative-binomial', 'binomial'],
};
