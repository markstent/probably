import { lgamma } from '../mathx.js';

// Student-t (degrees of freedom ν, location μ, scale σ) — the robust, heavy-tailed
// cousin of the Normal. This module also introduces the "requires MCMC" path:
// no closed-form conjugate update exists.
export const studentT = {
  id: 'student-t',
  name: 'Student-t',
  family: 'Continuous — real line',
  notation: 'X ~ Student-t(ν, μ, σ)',
  color: '#84c0b8',
  type: 'continuous',
  tagline:
    'A Normal with heavy tails. Lower the degrees of freedom and the tails fatten, so the occasional large value stops dragging your estimates around.',

  params: [
    { id: 'nu', label: 'ν', name: 'deg. freedom (ν)', min: 1, max: 30, step: 0.5, init: 5,
      desc: 'Small ν gives heavy tails; as ν grows it approaches a Normal.' },
    { id: 'mu', label: 'μ', name: 'location (μ)', min: -5, max: 5, step: 0.1, init: 0,
      desc: 'Centre of the distribution.' },
    { id: 'sigma', label: 'σ', name: 'scale (σ)', min: 0.3, max: 4, step: 0.1, init: 1,
      desc: 'Spread. Not the standard deviation unless ν is large.' },
  ],

  pdf(x, { nu, mu, sigma }) {
    const t = (x - mu) / sigma;
    const logC = lgamma((nu + 1) / 2) - lgamma(nu / 2) - 0.5 * Math.log(nu * Math.PI) - Math.log(sigma);
    return Math.exp(logC - ((nu + 1) / 2) * Math.log(1 + (t * t) / nu));
  },

  xRange({ nu, mu, sigma }) {
    const hw = sigma * (4 + 24 / nu);
    return [mu - hw, mu + hw];
  },

  stats({ nu, mu, sigma }) {
    return {
      mean: nu > 1 ? mu : NaN,
      mode: mu,
      variance: nu > 2 ? (sigma * sigma * nu) / (nu - 2) : (nu > 1 ? Infinity : NaN),
      support: '(−∞, ∞)',
    };
  },

  statForms: { mean: 'μ', mode: 'μ', variance: 'σ²·ν / (ν − 2)' },

  prior: {
    title: 'A robust, heavy-tailed prior',
    body: [
      'A heavier-tailed alternative to the Normal prior that tolerates the occasional large coefficient without over-shrinking it.',
      'Half-t priors on scale parameters are a popular weakly-informative default in hierarchical models.',
      'Small ν (around 3 to 7) gives fat tails; ν → ∞ recovers the Normal.',
      'It is forgiving when your prior guess might be wrong, since extreme values stay plausible.',
    ],
    tips: [
      'A Half-Cauchy (Student-t with ν = 1, folded) is a standard weakly-informative prior on a group-level σ.',
      'Use a Normal prior instead when you genuinely want strong shrinkage toward the centre.',
    ],
  },

  likelihood: {
    title: 'Robust regression',
    body: [
      'Models continuous data with outliers far more gracefully than a Normal: extreme points pull the fit much less.',
      'ν controls tail weight and can itself be given a prior and estimated.',
      'It arises as a scale mixture of Normals: a Normal whose variance is drawn from an Inverse-Gamma (equivalently a Gamma on the precision).',
      'Check whether outliers are genuine, and model the scale too if the spread changes.',
    ],
    tips: [
      'Robust "BEST" t-tests replace the Normal with a Student-t likelihood to down-weight outliers.',
      'For financial returns and other fat-tailed series, a Student-t likelihood is often the honest default.',
    ],
  },

  conjugate: {
    prior: 'Normal / Half-t',
    likelihood: 'Student-t(ν, μ, σ)',
    posterior: 'requires MCMC',
    formula:
`No closed-form conjugate update exists for the Student-t.

Use MCMC (HMC / NUTS in Stan or PyMC):
  • Normal prior on μ, Half-Normal or Half-t on σ,
    and a prior on ν such as ν ~ Gamma(2, 0.1).
  • Or use the scale-mixture form to make sampling easy:
        xᵢ | λᵢ ~ Normal(μ, σ²/λᵢ)
        λᵢ      ~ Gamma(ν/2, ν/2)
    adding the latent λᵢ recovers conditional conjugacy
    for efficient Gibbs or HMC steps.`,
    note:
      'Because a Student-t is a Normal whose variance is itself random, no single prior closes the loop in one step. The scale-mixture representation restores conditional conjugacy, which is exactly how modern samplers handle it.',
  },

  examples: [
    'Robust linear regression where a few residuals are far larger than the rest.',
    'Daily financial returns, which have fatter tails than any Normal allows.',
    'Estimating a mean when occasional spikes would otherwise dominate.',
    'A Bayesian replacement for the t-test that is resistant to outliers.',
  ],

  related: ['normal', 'inverse-gamma', 'cauchy', 'laplace'],
};
