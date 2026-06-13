import { test } from 'node:test';
import assert from 'node:assert/strict';
import { binomial } from '../js/distributions/binomial.js';
import { checkDiscrete } from './lib/check-discrete.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('binomial summation + moments', () => {
  assert.equal(binomial.id, 'binomial');
  assert.equal(binomial.type, 'discrete');
  for (const [n, p] of [[10, 0.3], [10, 0.5], [20, 0.8], [5, 0.5]]) checkDiscrete(binomial, { n, p });
});
test('binomial pmf + stats', () => {
  close(binomial.pmf(0, { n: 4, p: 0.5 }), 0.0625);
  close(binomial.pmf(2, { n: 4, p: 0.5 }), 0.375);
  const s = binomial.stats({ n: 10, p: 0.3 });
  close(s.mean, 3); close(s.variance, 10 * 0.3 * 0.7);
});
