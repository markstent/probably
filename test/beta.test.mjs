import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beta } from '../js/distributions/beta.js';
import { checkContinuous } from './lib/check-continuous.mjs';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} not within ${tol} of ${b}`);
const P = (a, b) => ({ a, b });

test('beta module has the required data-structure shape', () => {
  assert.equal(beta.family, 'Continuous — bounded');
  assert.match(beta.notation, /Beta/);
  assert.equal(typeof beta.pdf, 'function');
  assert.equal(typeof beta.stats, 'function');
  assert.equal(typeof beta.xRange, 'function');
  assert.ok(beta.params.length === 2);
  assert.ok(beta.prior && beta.likelihood && beta.conjugate);
  assert.ok(Array.isArray(beta.examples) && beta.examples.length >= 3);
});

test('beta pdf integrates to ~1 and moments match stats', () => {
  for (const [a, b] of [[2, 2], [5, 2], [2, 5], [3.5, 1.5]]) {
    checkContinuous(beta, P(a, b));
  }
});

test('beta stats use closed forms', () => {
  const s = beta.stats(P(2, 3));
  close(s.mean, 2 / 5);                          // a/(a+b)
  close(s.mode, (2 - 1) / (2 + 3 - 2));          // (a-1)/(a+b-2)
  close(s.variance, (2 * 3) / (25 * 6));         // ab/((a+b)^2 (a+b+1))
});

test('Beta(1,1) is uniform on (0,1)', () => {
  close(beta.pdf(0.3, P(1, 1)), 1);
  close(beta.pdf(0.9, P(1, 1)), 1);
});
