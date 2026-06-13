import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normal } from '../js/distributions/normal.js';
import { checkContinuous } from './lib/check-continuous.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('normal shape + integration + moments', () => {
  assert.equal(normal.id, 'normal');
  assert.equal(normal.family, 'Continuous — real line');
  for (const [mu, sigma] of [[0, 1], [2, 0.5], [-1, 2]]) checkContinuous(normal, { mu, sigma });
});
test('normal pdf peak and stats', () => {
  close(normal.pdf(0, { mu: 0, sigma: 1 }), 1 / Math.sqrt(2 * Math.PI));
  const s = normal.stats({ mu: 2, sigma: 3 });
  close(s.mean, 2); close(s.mode, 2); close(s.variance, 9);
});
