import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bernoulli } from '../js/distributions/bernoulli.js';
import { checkDiscrete } from './lib/check-discrete.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('bernoulli shape + summation + moments', () => {
  assert.equal(bernoulli.id, 'bernoulli');
  assert.equal(bernoulli.family, 'Discrete');
  assert.equal(bernoulli.type, 'discrete');
  assert.equal(typeof bernoulli.pmf, 'function');
  for (const p of [0.2, 0.5, 0.8]) checkDiscrete(bernoulli, { p });
});
test('bernoulli pmf and stats', () => {
  close(bernoulli.pmf(0, { p: 0.3 }), 0.7);
  close(bernoulli.pmf(1, { p: 0.3 }), 0.3);
  close(bernoulli.pmf(2, { p: 0.3 }), 0);
  const s = bernoulli.stats({ p: 0.3 });
  close(s.mean, 0.3); close(s.variance, 0.21);
});
