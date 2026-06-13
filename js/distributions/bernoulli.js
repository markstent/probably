// Bernoulli (success probability p) — a single yes/no trial. Binomial(1, p).
export const bernoulli = {
  id: 'bernoulli',
  name: 'Bernoulli',
  family: 'Discrete',
  notation: 'X ~ Bernoulli(p)',
  color: '#d49ac0',
  type: 'discrete',
  tagline:
    'One flip of a biased coin. The outcome is 1 with probability p and 0 otherwise, the atom from which Binomial counts and logistic regression are built.',

  params: [
    { id: 'p', label: 'p', name: 'success prob (p)', min: 0.05, max: 0.95, step: 0.05, init: 0.5,
      desc: 'Probability of a success (an outcome of 1).' },
  ],

  pmf(k, { p }) {
    if (k === 0) return 1 - p;
    if (k === 1) return p;
    return 0;
  },

  xRange() {
    return [0, 1];
  },

  stats({ p }) {
    return {
      mean: p,
      mode: p === 0.5 ? NaN : (p > 0.5 ? 1 : 0),
      variance: p * (1 - p),
      support: '{0, 1}',
    };
  },

  statForms: { mean: 'p', variance: 'p(1 − p)' },

  prior: {
    title: 'A prior over a binary indicator',
    body: [
      'Used as a prior over a binary latent flag, for example whether a feature is included (spike-and-slab) or a changepoint occurs.',
      'Its single parameter p is the prior probability that the indicator is 1.',
      'Put a Beta hyperprior on p to learn the underlying inclusion or event rate from data.',
      'For an unknown probability itself, the prior is Beta, not Bernoulli.',
    ],
    tips: [
      'In spike-and-slab selection, Bernoulli(p) toggles a coefficient on or off while p ~ Beta(a, b) learns the sparsity level.',
      'Bernoulli is Binomial(1, p): the single-trial special case.',
    ],
  },

  likelihood: {
    title: 'The single yes/no outcome',
    body: [
      'The likelihood for one binary observation: success with probability p, failure with 1 − p.',
      'Independent trials sharing one p sum to a Binomial; logistic regression lets p vary with covariates.',
      'Assumes trials are independent and identically distributed unless p is modelled per observation.',
      'Check for correlation or overdispersion between trials before pooling them under a single p.',
    ],
    tips: [
      'n independent Bernoulli(p) outcomes carry exactly the information of their Binomial(n, p) total.',
      'For covariate-dependent p, use a Bernoulli likelihood with a logit link (logistic regression).',
    ],
  },

  conjugate: {
    prior: 'Beta(α, β)',
    likelihood: 'Bernoulli(p)',
    posterior: 'Beta(α + Σxᵢ, β + n − Σxᵢ)',
    formula:
`Prior:       p ~ Beta(α, β)
Likelihood:  xᵢ ~ Bernoulli(p),  i = 1…n,  xᵢ ∈ {0, 1}

Posterior:   p | x ~ Beta(α + Σxᵢ,  β + n − Σxᵢ)

Posterior mean = (α + Σxᵢ) / (α + β + n)`,
    note:
      'Every success adds one to α and every failure adds one to β: the Beta prior simply counts imaginary trials, and the data append real ones.',
  },

  examples: [
    'Whether a single coin flip lands heads.',
    'Whether one website visitor converts.',
    'Whether a given email is spam, judged one message at a time.',
    'A binary inclusion flag for one predictor in Bayesian variable selection.',
  ],

  related: ['binomial', 'beta', 'geometric'],
};
