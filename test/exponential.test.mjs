import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exponential } from '../js/distributions/exponential.js';
import { checkContinuous } from './lib/check-continuous.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('exponential shape + integration + moments', () => {
  assert.equal(exponential.id, 'exponential');
  for (const lam of [0.5, 1, 2, 3]) checkContinuous(exponential, { lam }, { range: [0, 40] });
});
test('exponential closed-form stats', () => {
  const s = exponential.stats({ lam: 2 });
  close(s.mean, 1 / 2); close(s.mode, 0); close(s.variance, 1 / 4);
});
