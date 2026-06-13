import { logChoose } from '../mathx.js';

// Binomial (trials n, success probability p) — successes in a fixed number of trials.
export const binomial = {
  id: 'binomial',
  name: 'Binomial',
  family: 'Discrete',
  notation: 'X ~ Binomial(n, p)',
  color: '#8ab4d4',
  type: 'discrete',
  tagline:
    'How many successes you get in n independent attempts, each succeeding with probability p. The aggregate of n Bernoulli trials.',

  params: [
    { id: 'n', label: 'n', name: 'trials (n)', min: 1, max: 40, step: 1, init: 12,
      desc: 'Number of independent trials.' },
    { id: 'p', label: 'p', name: 'success prob (p)', min: 0.05, max: 0.95, step: 0.05, init: 0.5,
      desc: 'Probability of success on each trial.' },
  ],

  pmf(k, { n, p }) {
    if (k < 0 || k > n || k !== Math.round(k)) return 0;
    return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
  },

  xRange({ n }) {
    return [0, n];
  },

  stats({ n, p }) {
    return {
      mean: n * p,
      mode: Math.floor((n + 1) * p),
      variance: n * p * (1 - p),
      support: '{0, 1, …, n}',
    };
  },

  statForms: { mean: 'n·p', variance: 'n·p(1 − p)' },

  prior: {
    title: 'Rarely a prior',
    body: [
      'Binomial is a data model for a count of successes, not usually a prior on a parameter.',
      'It can serve as a prior on an unknown integer count when the number of trials is itself uncertain but the rate is known.',
      'For the success probability p, the prior you want is Beta.',
    ],
    tips: [
      'If you are choosing a prior for a probability, use Beta; the Binomial is the likelihood.',
    ],
  },

  likelihood: {
    title: 'Counts of successes',
    body: [
      'The number of successes in n independent trials that share a common probability p.',
      'Use it for aggregated yes/no data where only the total and the trial count are recorded.',
      'Assumes constant p and independent trials; clustering or a varying p produces overdispersion.',
      'If the observed variance exceeds n·p(1 − p), move to a Beta-Binomial.',
    ],
    tips: [
      'A sum of n independent Bernoulli(p) outcomes is exactly Binomial(n, p).',
      'For covariate-dependent p, model logit(p) = β·x (binomial logistic regression).',
    ],
  },

  conjugate: {
    prior: 'Beta(α, β)',
    likelihood: 'Binomial(n, p)',
    posterior: 'Beta(α + k, β + n − k)',
    formula:
`Prior:       p ~ Beta(α, β)
Likelihood:  k successes in n trials,  k ~ Binomial(n, p)

Posterior:   p | k ~ Beta(α + k,  β + n − k)

Posterior mean = (α + k) / (α + β + n)`,
    note:
      'Successes add to α and failures (n − k) add to β: identical to the Bernoulli update, just with the trials aggregated into a single count.',
  },

  examples: [
    'The number of heads in n coin flips.',
    'Conversions out of n website visitors.',
    'Defective items in a batch of n inspected units.',
    'Correct answers out of n multiple-choice questions.',
  ],

  related: ['bernoulli', 'beta', 'poisson', 'negative-binomial'],
};
