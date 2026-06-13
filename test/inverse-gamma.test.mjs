import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inverseGamma } from '../js/distributions/inverse-gamma.js';
import { checkContinuous } from './lib/check-continuous.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('inverse-gamma shape + integration + moments', () => {
  assert.equal(inverseGamma.id, 'inverse-gamma');
  for (const [a, b] of [[4, 3], [3, 2], [5, 4]]) checkContinuous(inverseGamma, { a, b }, { tolNorm: 5e-3, tolMoment: 1.2e-2, checkVariance: false });
});
test('inverse-gamma closed-form stats', () => {
  const s = inverseGamma.stats({ a: 4, b: 3 });
  close(s.mean, 3 / 3); close(s.mode, 3 / 5); close(s.variance, 9 / (9 * 2));
});
