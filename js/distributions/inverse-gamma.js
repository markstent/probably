import { lgamma } from '../mathx.js';

// Inverse-Gamma (shape α, scale β) — the conjugate prior for a Normal variance.
export const inverseGamma = {
  id: 'inverse-gamma',
  name: 'Inverse-Gamma',
  family: 'Continuous — positive',
  notation: 'X ~ Inv-Gamma(α, β)',
  color: '#c3b0e8',
  type: 'continuous',
  tagline:
    'The distribution of a variance. If a Gamma describes a precision, its reciprocal is Inverse-Gamma, which is why it is the classic conjugate prior for σ² in a Normal model.',

  params: [
    { id: 'a', label: 'α', name: 'shape (α)', min: 1.5, max: 10, step: 0.1, init: 3,
      desc: 'Shape. Larger α concentrates the distribution and lightens the tail.' },
    { id: 'b', label: 'β', name: 'scale (β)', min: 0.5, max: 10, step: 0.1, init: 2,
      desc: 'Scale. Sets the overall magnitude; larger β shifts mass to the right.' },
  ],

  pdf(x, { a, b }) {
    if (x <= 0) return 0;
    return Math.exp(a * Math.log(b) - lgamma(a) - (a + 1) * Math.log(x) - b / x);
  },

  xRange({ a, b }) {
    const mode = b / (a + 1);
    const sd = a > 2 ? Math.sqrt((b * b) / ((a - 1) ** 2 * (a - 2))) : b / Math.max(a - 1, 0.5);
    return [0, mode + 8 * sd];
  },

  stats({ a, b }) {
    return {
      mean: a > 1 ? b / (a - 1) : Infinity,
      mode: b / (a + 1),
      variance: a > 2 ? (b * b) / ((a - 1) ** 2 * (a - 2)) : Infinity,
      support: '(0, ∞)',
    };
  },

  statForms: { mean: 'β / (α − 1)', mode: 'β / (α + 1)', variance: 'β² / ((α−1)²(α−2))' },

  prior: {
    title: 'Conjugate prior for a variance',
    body: [
      'The conjugate prior for the variance σ² of a Normal likelihood (equivalently a Gamma prior on the precision 1/σ²).',
      'Read the hyperparameters as α prior observations carrying total squared deviation 2β.',
      'The prior mean β/(α − 1) exists only for α > 1 and the variance only for α > 2, so small α gives a very heavy tail.',
      'It keeps the Normal-Inverse-Gamma model fully conjugate when both mean and variance are unknown.',
    ],
    tips: [
      'The once-standard vague Inverse-Gamma(ε, ε) is a poor prior for hierarchical variances; prefer a Half-Normal or Half-Cauchy on σ.',
      'Eliciting on σ (a standard deviation) is more intuitive than on σ²; convert at the end.',
    ],
  },

  likelihood: {
    title: 'Not a likelihood',
    body: [
      'Inverse-Gamma is a prior on a variance, not a model for observed data, so it is essentially never a likelihood.',
      'For positive, right-skewed data choose Gamma, Log-Normal, or Weibull instead.',
    ],
    tips: [
      'If you reach for it as a likelihood, you almost certainly want Gamma on the data and Inverse-Gamma on a variance.',
    ],
  },

  conjugate: {
    prior: 'Inv-Gamma(α, β)',
    likelihood: 'Normal(μ, σ²)',
    posterior: 'Inv-Gamma(α + n/2, β + ½Σ(xᵢ−μ)²)',
    formula:
`Prior:       σ² ~ Inv-Gamma(α, β)
Likelihood:  xᵢ ~ Normal(μ, σ²),  i = 1…n,  μ known

Posterior:   σ² | x ~ Inv-Gamma( α + n/2,  β + ½·Σ(xᵢ − μ)² )`,
    note:
      'Each observation adds a half to the shape and half its squared deviation to the scale: the data simply accumulate sum-of-squares into the prior. When μ is also unknown, combine with a Normal prior on μ for the Normal-Inverse-Gamma model.',
  },

  examples: [
    'Prior on the observation variance σ² in a Gaussian model.',
    'The variance term in conjugate Bayesian linear regression (Normal-Inverse-Gamma).',
    'Scale of measurement noise when you can summarise prior belief as pseudo-observations.',
    'A teaching example of conjugacy for σ² with known mean.',
  ],

  related: ['gamma', 'normal', 'chi-squared'],
};
