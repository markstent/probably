// The registry of built distributions. Adding a distribution is a one-line
// import plus an entry here; the sidebar, home grid, routing, and related-chip
// filtering all derive from this list. Only distributions listed here are shown.
import { beta } from './distributions/beta.js';

export const DISTRIBUTIONS = [beta];

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
