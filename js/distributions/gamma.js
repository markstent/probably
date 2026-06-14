import { lgamma } from '../mathx.js';

// Gamma (shape α, rate β) - the standard prior for rates and precisions, and a
// flexible likelihood for positive right-skewed data.
export const gamma = {
  id: 'gamma',
  name: 'Gamma',
  family: 'Continuous · positive',
  notation: 'X ~ Gamma(α, β)',
  color: '#9ecf98',
  type: 'continuous',
  tagline:
    'The natural choice for a quantity that must be positive and represents a rate, a precision, or a waiting time. Its shape flexes from a sharp spike near zero to a near-symmetric bell.',

  params: [
    { id: 'a', label: 'α', name: 'shape (α)', min: 0.5, max: 12, step: 0.1, init: 3,
      desc: 'α = 1 is Exponential; larger α makes the curve bell-shaped.' },
    { id: 'b', label: 'β', name: 'rate (β)', min: 0.2, max: 8, step: 0.1, init: 1,
      desc: 'Rate (inverse scale). Larger β pulls mass toward zero.' },
  ],

  pdf(x, { a, b }) {
    if (x <= 0) return 0;
    return Math.exp(a * Math.log(b) + (a - 1) * Math.log(x) - b * x - lgamma(a));
  },

  xRange({ a, b }) {
    return [0, (a + 4 * Math.sqrt(a) + 2) / b];
  },

  stats({ a, b }) {
    return {
      mean: a / b,
      mode: a >= 1 ? (a - 1) / b : 0,
      variance: a / (b * b),
      support: '(0, ∞)',
    };
  },

  statForms: { mean: 'α / β', mode: '(α − 1) / β', variance: 'α / β²' },

  prior: {
    title: 'Prior on rates and precisions',
    body: [
      'Conjugate prior for the rate of a Poisson or Exponential likelihood, and for the precision (1/σ²) of a Normal.',
      'Use it when a parameter is strictly positive and represents a rate or an inverse-variance.',
      'α behaves like a prior count of events and β like a prior exposure or time; the prior mean is α / β.',
      'Watch the parametrisation: some libraries use shape and scale (θ = 1/β) rather than shape and rate.',
    ],
    tips: [
      'Gamma(ε, ε) as a vague prior on a variance is pathological; prefer a Half-Normal on σ instead.',
      'Gamma(α, α) with large α concentrates near 1, handy for a multiplier you expect close to one.',
      'Exponential(λ) is Gamma(1, λ), the memoryless single-event special case.',
    ],
  },

  likelihood: {
    title: 'Likelihood for positive, skewed data',
    body: [
      'Models strictly positive, right-skewed continuous data: rainfall, durations, claim sizes, response times.',
      'The shape α controls skewness: small α is highly right-skewed, large α approaches symmetry.',
      'Assumes a constant coefficient of variation; the variance grows with the square of the mean.',
      'Compare with Log-Normal, which has a heavier right tail for the same mean.',
    ],
    tips: [
      'If the data have a point mass at zero, use a zero-inflated or hurdle model with a Gamma component.',
      'For a constant hazard (memoryless waiting times) the Exponential (α = 1) is enough.',
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
  → weighted blend of the prior mean α/β and the MLE Σxᵢ/n`,
    note:
      'Counts add to the shape and exposure adds to the rate. For an Exponential likelihood the update is Gamma(α + n, β + Σxᵢ): the roles of n and Σxᵢ swap.',
  },

  examples: [
    'Event rate of a Poisson process (server requests per second): Gamma(2, 0.1) prior on λ, updated as counts accumulate.',
    'Precision (1/σ²) of a Normal model: a Gamma prior gives Normal-Gamma conjugacy, the basis of conjugate Bayesian linear regression.',
    'Insurance claim frequency: λ ~ Gamma(3, 1) prior updated as claims arrive yields a credibility-weighted rate.',
    'Waiting time for the k-th event: Gamma(k, β) is the Erlang distribution, the sum of k Exponentials.',
  ],

  related: ['exponential', 'inverse-gamma', 'poisson', 'normal', 'beta'],
};
