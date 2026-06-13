import { test } from 'node:test';
import assert from 'node:assert/strict';
import { poisson } from '../js/distributions/poisson.js';
import { checkDiscrete } from './lib/check-discrete.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('poisson summation + moments', () => {
  assert.equal(poisson.id, 'poisson');
  for (const lam of [2, 4, 8, 15]) checkDiscrete(poisson, { lam });
});
test('poisson pmf + equidispersion', () => {
  close(poisson.pmf(0, { lam: 3 }), Math.exp(-3));
  const s = poisson.stats({ lam: 4 });
  close(s.mean, 4); close(s.variance, 4);
});
