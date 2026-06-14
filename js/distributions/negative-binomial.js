import { logChoose } from '../mathx.js';

// Negative Binomial (successes r, success probability p) - counts of failures
// before the r-th success, and the overdispersed alternative to the Poisson.
export const negativeBinomial = {
  id: 'negative-binomial',
  name: 'Negative Binomial',
  family: 'Discrete',
  notation: 'X ~ NegBin(r, p)',
  color: '#9ecf98',
  type: 'discrete',
  tagline:
    'Counts with more spread than a Poisson allows. Read it as the number of failures before the r-th success, or as Poisson counts whose rate itself varies.',

  params: [
    { id: 'r', label: 'r', name: 'successes (r)', min: 1, max: 15, step: 1, init: 5,
      desc: 'Target number of successes (the dispersion parameter). Small r means heavy overdispersion.' },
    { id: 'p', label: 'p', name: 'success prob (p)', min: 0.1, max: 0.9, step: 0.05, init: 0.5,
      desc: 'Probability of success on each trial.' },
  ],

  pmf(k, { r, p }) {
    if (k < 0 || k !== Math.round(k)) return 0;
    return Math.exp(logChoose(k + r - 1, k) + r * Math.log(p) + k * Math.log(1 - p));
  },

  xRange({ r, p }) {
    const mean = (r * (1 - p)) / p;
    const sd = Math.sqrt((r * (1 - p)) / (p * p));
    return [0, Math.ceil(mean + 4 * sd + 5)];
  },

  stats({ r, p }) {
    return {
      mean: (r * (1 - p)) / p,
      mode: r > 1 ? Math.floor(((r - 1) * (1 - p)) / p) : 0,
      variance: (r * (1 - p)) / (p * p),
      support: '{0, 1, 2, …}',
    };
  },

  statForms: { mean: 'r(1 − p) / p', variance: 'r(1 − p) / p²' },

  prior: {
    title: 'Not normally a prior',
    body: [
      'The Negative Binomial is an overdispersed count model, not a prior on a parameter.',
      'Its job is to be a more forgiving likelihood than the Poisson when counts are too variable.',
    ],
    tips: [
      'For a prior on a rate, use Gamma; the Negative Binomial is the data model.',
    ],
  },

  likelihood: {
    title: 'Overdispersed counts',
    body: [
      'Counts whose variance exceeds the mean, where a Poisson would understate the spread.',
      'Arises as a Gamma-Poisson mixture: Poisson counts whose rate is drawn from a Gamma.',
      'Equivalently, the number of failures before the r-th success in independent Bernoulli trials.',
      'As r → ∞ it converges back to the Poisson, so r measures how far from Poisson you are.',
    ],
    tips: [
      'Small r means heavy overdispersion; large r is nearly Poisson.',
      'Many libraries use a mean/dispersion (μ, r) form; convert with p = r / (r + μ).',
    ],
  },

  conjugate: {
    prior: 'Beta(α, β)',
    likelihood: 'NegBin(r, p)',
    posterior: 'Beta(α + r·n, β + Σxᵢ)',
    formula:
`Prior:       p ~ Beta(α, β),  r known
Likelihood:  xᵢ ~ NegBin(r, p),  i = 1…n   (xᵢ = failures)

Posterior:   p | x ~ Beta(α + r·n,  β + Σxᵢ)`,
    note:
      'With r fixed, the success probability p has a conjugate Beta update: r·n successes are accumulated against Σxᵢ observed failures. The dispersion r is usually given its own prior and sampled, since no joint conjugate update covers both r and p.',
  },

  examples: [
    'Insurance claims per policyholder when individual risk varies.',
    'Page views per user, which cluster far more than a Poisson predicts.',
    'Disease cases per region with underlying heterogeneity.',
    'Defects per manufactured unit when faults arrive in bursts.',
  ],

  related: ['poisson', 'gamma', 'binomial', 'geometric'],
};
