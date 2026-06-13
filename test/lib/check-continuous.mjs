import assert from 'node:assert/strict';

// Shared numeric validator for continuous distribution modules.
// Verifies, purely from the module's own pdf/xRange/stats, that:
//   - the density integrates to ~1 over its effective range
//   - the numerical mean and variance match the closed-form stats()
// Used by every continuous distribution's test so formula errors surface
// mechanically. Pass well-behaved params (bounded, finite-moment) for the check.
export function checkContinuous(dist, params, opts = {}) {
  const { n = 200000, tolNorm = 2e-3, tolMoment = 5e-3 } = opts;
  const [lo, hi] = dist.xRange(params);
  const h = (hi - lo) / n;

  // Composite Simpson's rule for ∫ f over [lo, hi].
  const integrate = (f) => {
    let s = f(lo) + f(hi);
    for (let i = 1; i < n; i++) {
      s += (i % 2 ? 4 : 2) * f(lo + i * h);
    }
    return (s * h) / 3;
  };

  const pdf = (x) => dist.pdf(x, params);
  const Z = integrate(pdf);
  const mean = integrate((x) => x * pdf(x)) / Z;
  const variance = integrate((x) => (x - mean) * (x - mean) * pdf(x)) / Z;

  const stats = dist.stats(params);
  assert.ok(Math.abs(Z - 1) < tolNorm, `${dist.name}: density integrates to ${Z}, not ~1`);
  assert.ok(
    Math.abs(mean - stats.mean) < tolMoment * (1 + Math.abs(stats.mean)),
    `${dist.name}: numeric mean ${mean} != stats.mean ${stats.mean}`
  );
  assert.ok(
    Math.abs(variance - stats.variance) < tolMoment * (1 + Math.abs(stats.variance)),
    `${dist.name}: numeric variance ${variance} != stats.variance ${stats.variance}`
  );
}
