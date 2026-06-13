import assert from 'node:assert/strict';

// Shared numeric validator for discrete distribution modules. Sums the pmf over
// the support and checks it totals ~1, and that the summed mean and variance
// match the closed-form stats(). Discrete sums are exact (no truncation error
// once kmax covers the mass), so tolerances are tight.
export function checkDiscrete(dist, params, opts = {}) {
  const { kmax = 5000, tol = 1e-9, tolMoment = 1e-7 } = opts;
  let Z = 0, m = 0, m2 = 0;
  for (let k = 0; k <= kmax; k++) {
    const p = dist.pmf(k, params);
    if (!Number.isFinite(p)) continue;
    Z += p; m += k * p; m2 += k * k * p;
  }
  const mean = m / Z;
  const variance = m2 / Z - mean * mean;
  const stats = dist.stats(params);
  assert.ok(Math.abs(Z - 1) < tol, `${dist.name}: pmf sums to ${Z}, not ~1`);
  assert.ok(
    Math.abs(mean - stats.mean) < tolMoment * (1 + Math.abs(stats.mean)),
    `${dist.name}: summed mean ${mean} != stats.mean ${stats.mean}`
  );
  assert.ok(
    Math.abs(variance - stats.variance) < tolMoment * (1 + Math.abs(stats.variance)),
    `${dist.name}: summed variance ${variance} != stats.variance ${stats.variance}`
  );
}
