import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lgamma, betaln } from '../js/mathx.js';

const close = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} not within ${tol} of ${b}`);

test('lgamma matches log-factorials at integers', () => {
  close(lgamma(1), 0);            // ln(0!) = 0
  close(lgamma(2), 0);            // ln(1!) = 0
  close(lgamma(5), Math.log(24)); // ln(4!)
  close(lgamma(10), Math.log(362880));
});

test('lgamma at half-integers', () => {
  close(lgamma(0.5), Math.log(Math.sqrt(Math.PI))); // ln(sqrt(pi))
  // Gamma(1.5) = sqrt(pi)/2
  close(lgamma(1.5), Math.log(Math.sqrt(Math.PI) / 2));
});

test('betaln equals lgamma(a)+lgamma(b)-lgamma(a+b)', () => {
  for (const [a, b] of [[2, 3], [0.5, 0.5], [5, 1], [3.2, 7.8]]) {
    close(betaln(a, b), lgamma(a) + lgamma(b) - lgamma(a + b));
  }
  // B(1,1) = 1 -> ln = 0
  close(betaln(1, 1), 0);
});
