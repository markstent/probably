// The registry of built distributions. Adding a distribution is a one-line
// import plus an entry here; the sidebar, home grid, routing, and related-chip
// filtering all derive from this list. Only distributions listed here are shown.
import { beta } from './distributions/beta.js';
import { gamma } from './distributions/gamma.js';
import { inverseGamma } from './distributions/inverse-gamma.js';
import { exponential } from './distributions/exponential.js';
import { normal } from './distributions/normal.js';
import { studentT } from './distributions/student-t.js';
import { bernoulli } from './distributions/bernoulli.js';
import { binomial } from './distributions/binomial.js';
import { poisson } from './distributions/poisson.js';
import { negativeBinomial } from './distributions/negative-binomial.js';

export const DISTRIBUTIONS = [
  beta, gamma, inverseGamma, exponential, normal, studentT,
  bernoulli, binomial, poisson, negativeBinomial,
];

export const BY_ID = new Map(DISTRIBUTIONS.map((d) => [d.id, d]));

// Families in display order. A family only appears if it has a built member.
export const FAMILY_ORDER = [
  'Continuous — bounded',
  'Continuous — positive',
  'Continuous — real line',
  'Discrete',
  'Multivariate',
];

export function byFamily() {
  const groups = [];
  for (const family of FAMILY_ORDER) {
    const members = DISTRIBUTIONS.filter((d) => d.family === family);
    if (members.length) groups.push({ family, members });
  }
  return groups;
}
