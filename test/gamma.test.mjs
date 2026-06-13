import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gamma } from '../js/distributions/gamma.js';
import { checkContinuous } from './lib/check-continuous.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('gamma shape + integration + moments', () => {
  assert.equal(gamma.id, 'gamma');
  assert.equal(gamma.family, 'Continuous — positive');
  for (const [a, b] of [[3, 1], [2, 2], [5, 1.5], [1, 1]]) checkContinuous(gamma, { a, b }, { range: [0, 60] });
});
test('gamma closed-form stats', () => {
  const s = gamma.stats({ a: 3, b: 2 });
  close(s.mean, 3 / 2); close(s.mode, (3 - 1) / 2); close(s.variance, 3 / 4);
});
