import { test } from 'node:test';
import assert from 'node:assert/strict';
import { negativeBinomial } from '../js/distributions/negative-binomial.js';
import { checkDiscrete } from './lib/check-discrete.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('negative-binomial summation + moments (overdispersed)', () => {
  assert.equal(negativeBinomial.id, 'negative-binomial');
  for (const [r, p] of [[5, 0.5], [3, 0.4], [8, 0.6]]) checkDiscrete(negativeBinomial, { r, p });
});
test('negative-binomial pmf + stats; variance exceeds mean', () => {
  close(negativeBinomial.pmf(0, { r: 5, p: 0.5 }), Math.pow(0.5, 5));
  const s = negativeBinomial.stats({ r: 5, p: 0.5 });
  close(s.mean, 5 * 0.5 / 0.5); close(s.variance, 5 * 0.5 / 0.25);
  assert.ok(s.variance > s.mean);
});
