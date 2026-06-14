import { lgamma } from '../mathx.js';

// Dirichlet (concentrations α₁…α_K) - the distribution over a probability vector
// on the simplex. The multivariate generalisation of the Beta and the conjugate
// prior for Categorical and Multinomial counts. Shown here for K = 3 on a
// 2-simplex. density()/meanVector() are pure helpers used by the test and the
// simplex renderer.
export const dirichlet = {
  id: 'dirichlet',
  name: 'Dirichlet',
  family: 'Multivariate',
  notation: 'X ~ Dirichlet(α₁, …, α_K)',
  color: '#b9a4e0',
  type: 'multivariate',
  tagline:
    'The distribution over a set of proportions that must sum to one. The multivariate Beta, and the natural prior for the category probabilities behind any count data.',

  params: [
    { id: 'a1', label: 'α₁', name: 'concentration (α₁)', min: 0.5, max: 10, step: 0.1, init: 2,
      desc: 'Pseudo-count for component 1. Larger α₁ pulls mass toward the x₁ corner.' },
    { id: 'a2', label: 'α₂', name: 'concentration (α₂)', min: 0.5, max: 10, step: 0.1, init: 2,
      desc: 'Pseudo-count for component 2. Larger α₂ pulls mass toward the x₂ corner.' },
    { id: 'a3', label: 'α₃', name: 'concentration (α₃)', min: 0.5, max: 10, step: 0.1, init: 2,
      desc: 'Pseudo-count for component 3. Larger α₃ pulls mass toward the x₃ corner.' },
  ],

  // Density on the 2-simplex (coords sum to 1) with respect to Lebesgue measure
  // on the first two coordinates.
  density([x1, x2, x3], { a1, a2, a3 }) {
    if (x1 <= 0 || x2 <= 0 || x3 <= 0) return 0;
    const logB = lgamma(a1) + lgamma(a2) + lgamma(a3) - lgamma(a1 + a2 + a3);
    return Math.exp((a1 - 1) * Math.log(x1) + (a2 - 1) * Math.log(x2) + (a3 - 1) * Math.log(x3) - logB);
  },

  meanVector({ a1, a2, a3 }) {
    const A = a1 + a2 + a3;
    return [a1 / A, a2 / A, a3 / A];
  },

  stats({ a1, a2, a3 }) {
    const A = a1 + a2 + a3;
    const t = (x) => x.map((v) => v.toFixed(2)).join(', ');
    const allAbove1 = a1 > 1 && a2 > 1 && a3 > 1;
    return {
      mean: `(${t([a1 / A, a2 / A, a3 / A])})`,
      mode: allAbove1 ? `(${t([(a1 - 1) / (A - 3), (a2 - 1) / (A - 3), (a3 - 1) / (A - 3)])})` : 'n/a',
      variance: (a1 * (A - a1)) / (A * A * (A + 1)),
      support: 'simplex Δ²',
    };
  },

  statLabels: { mean: 'Mean E[x]', variance: 'Var(x₁)' },

  prior: {
    title: 'Prior over category probabilities',
    body: [
      'The conjugate prior for the category probabilities behind Categorical and Multinomial data.',
      'Each αᵢ is a pseudo-count for category i; their sum α₀ is the prior strength.',
      'Equal αᵢ = 1 is uniform over the simplex; large equal αᵢ concentrate near the centre; αᵢ < 1 push mass into the corners (sparse).',
      'With K = 2 it is exactly the Beta, so everything you know about Beta priors carries over.',
    ],
    tips: [
      'A symmetric Dirichlet(α, …, α) with small α encodes a belief that only a few categories dominate.',
      'Elicit it by setting the mean vector αᵢ/α₀ and the overall strength α₀ separately.',
    ],
  },

  likelihood: {
    title: 'Not a likelihood',
    body: [
      'Dirichlet is a prior over a probability vector, not a model for observed data.',
      'For observed category counts the likelihood is Multinomial (or Categorical); keep Dirichlet as the prior on the probabilities.',
      'Genuinely continuous compositional data can be modelled with Dirichlet regression, but that is a niche use.',
    ],
    tips: [
      'Counts across K categories call for a Multinomial likelihood with a Dirichlet prior.',
    ],
  },

  conjugate: {
    prior: 'Dirichlet(α)',
    likelihood: 'Multinomial(n, p)',
    posterior: 'Dirichlet(α + counts)',
    formula:
`Prior:       p ~ Dirichlet(α₁, …, α_K)
Likelihood:  counts (n₁, …, n_K) ~ Multinomial(n, p)

Posterior:   p | n ~ Dirichlet(α₁ + n₁, …, α_K + n_K)

Posterior mean of pᵢ = (αᵢ + nᵢ) / (α₀ + n)`,
    note:
      'Each observed count is added straight onto its category pseudo-count. The Beta-Binomial update is exactly this with K = 2.',
  },

  examples: [
    'Topic proportions in a document under Latent Dirichlet Allocation.',
    'The face probabilities of a possibly loaded die, updated as rolls accumulate.',
    'Market share across competing brands estimated from purchase counts.',
    'Allele or genotype frequencies across categories in population genetics.',
  ],

  related: ['beta', 'binomial', 'bernoulli'],
};
