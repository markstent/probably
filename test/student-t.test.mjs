import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studentT } from '../js/distributions/student-t.js';
import { checkContinuous } from './lib/check-continuous.mjs';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

test('student-t shape + integration + moments (large nu)', () => {
  assert.equal(studentT.id, 'student-t');
  for (const [nu, mu, sigma] of [[8, 0, 1], [12, 1, 2]]) checkContinuous(studentT, { nu, mu, sigma }, { tolNorm: 5e-3, tolMoment: 2e-2 });
});
test('student-t stats and no-conjugate marker', () => {
  const s = studentT.stats({ nu: 8, mu: 1, sigma: 2 });
  close(s.mean, 1); close(s.mode, 1); close(s.variance, 4 * 8 / 6);
  assert.match(studentT.conjugate.posterior, /MCMC/);
});
