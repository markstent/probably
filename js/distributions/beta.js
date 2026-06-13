import { betaln } from '../mathx.js';

// Beta — the distribution of a probability. Conjugate prior for Bernoulli and
// Binomial. This module is the template every other distribution follows.
export const beta = {
  id: 'beta',
  name: 'Beta',
  family: 'Continuous — bounded',
  notation: 'X ~ Beta(α, β)',
  color: '#f5c87a',
  type: 'continuous',
  tagline:
    'The distribution of a probability. Reach for it whenever the quantity you care about is a proportion or a chance that must live between zero and one.',

  params: [
    { id: 'a', label: 'α', name: 'shape (α)', min: 0.5, max: 10, step: 0.1, init: 2,
      desc: 'Pseudo-count of prior successes. Larger α pushes mass toward 1.' },
    { id: 'b', label: 'β', name: 'shape (β)', min: 0.5, max: 10, step: 0.1, init: 2,
      desc: 'Pseudo-count of prior failures. Larger β pushes mass toward 0.' },
  ],

  pdf(x, { a, b }) {
    if (x <= 0 || x >= 1) return 0;
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - betaln(a, b));
  },

  xRange() {
    return [0, 1];
  },

  stats({ a, b }) {
    let mode;
    if (a > 1 && b > 1) mode = (a - 1) / (a + b - 2);
    else if (a < 1 && b < 1) mode = NaN;          // bimodal at the boundaries
    else if (a <= 1 && b > 1) mode = 0;
    else mode = 1;
    return {
      mean: a / (a + b),
      mode,
      variance: (a * b) / ((a + b) ** 2 * (a + b + 1)),
      support: '(0, 1)',
    };
  },

  statForms: {
    mean: 'α / (α + β)',
    mode: '(α − 1) / (α + β − 2)',
    variance: 'αβ / ((α+β)²(α+β+1))',
  },

  prior: {
    title: 'The natural prior for a probability',
    body: [
      'Conjugate prior for the success probability of Bernoulli and Binomial data, so it is the default whenever a parameter is itself a probability.',
      'α acts like prior successes already seen and β like prior failures; their sum α + β is the prior strength, an effective sample size.',
      'The prior mean is α / (α + β), which separates where you think the probability is from how sure you are.',
      'Beta(1, 1) is flat, Beta(0.5, 0.5) is the Jeffreys prior that favours the extremes, and large α + β concentrates tightly around the mean.',
    ],
    tips: [
      'α + β is the prior sample size. Beta(2, 2) carries about as much information as having already seen two successes and two failures.',
      'To elicit it, pick the prior mean m = α / (α + β) and a strength s = α + β, then set α = m·s and β = (1 − m)·s.',
      'Beta(1, 1) is uniform; Beta(0.5, 0.5) is Jeffreys. Avoid very small shapes unless you genuinely want mass piled at 0 and 1.',
    ],
  },

  likelihood: {
    title: 'Rarely a likelihood',
    body: [
      'Almost never the likelihood: it describes a probability you are unsure about, not counts you actually observe.',
      'For binary or success-count data the data-generating model is Bernoulli or Binomial, with Beta kept as the prior on p.',
      'The exception is genuinely continuous proportions in (0, 1), where Beta regression uses Beta as a likelihood with its mean linked to covariates.',
      'Before doing that, check the proportions are truly continuous, not just successes over a known number of trials.',
    ],
    tips: [
      'For binary outcomes or counts of successes, the likelihood is Bernoulli or Binomial; keep Beta as the prior on p.',
      'For continuous proportions as data, reach for Beta regression rather than a plain Beta likelihood.',
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

Posterior mean = (α + k) / (α + β + n)
  → prior pseudo-counts (α, β) plus the observed (k, n − k)`,
    note:
      'Each success adds one to α and each failure adds one to β. The prior is simply imaginary data you have already seen, and the posterior just appends the real data to it.',
  },

  examples: [
    'Conversion rate of a landing page: start from a Beta(1, 1) prior and update to Beta(1 + conversions, 1 + non-conversions) as visits arrive.',
    'Click-through rate in an A/B test: give each arm a Beta(α, β) prior and compare posterior draws to estimate the probability that B beats A.',
    'Free-throw percentage early in a season: a Beta(α, β) prior centred on the league average shrinks a tiny sample toward something sensible.',
    'Defect rate of a production batch: Beta(2, 50) encodes a belief that defects are rare, updated as each inspected item lands.',
  ],

  related: ['bernoulli', 'binomial', 'uniform', 'dirichlet'],
};
