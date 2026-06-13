import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirichlet } from '../js/distributions/dirichlet.js';
const close = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) < t, `${a} vs ${b}`);

// Midpoint integration of f over the 2-simplex in (x1, x2) coordinates.
function integ(f, N = 700) {
  const h = 1 / N; let s = 0;
  for (let i = 0; i < N; i++) {
    const x1 = (i + 0.5) * h;
    for (let j = 0; j < N; j++) {
      const x2 = (j + 0.5) * h;
      const x3 = 1 - x1 - x2;
      if (x3 <= 0) continue;
      s += f([x1, x2, x3]) * h * h;
    }
  }
  return s;
}

test('dirichlet density integrates to ~1 over the simplex', () => {
  assert.equal(dirichlet.id, 'dirichlet');
  assert.equal(dirichlet.type, 'multivariate');
  for (const [a1, a2, a3] of [[2, 2, 2], [3, 1.5, 2], [5, 3, 2]]) {
    const Z = integ((p) => dirichlet.density(p, { a1, a2, a3 }));
    close(Z, 1, 8e-3);
  }
});

test('dirichlet componentwise mean = αᵢ / α₀', () => {
  const params = { a1: 5, a2: 3, a3: 2 }; const A = 10;
  const Z = integ((p) => dirichlet.density(p, params));
  const m1 = integ((p) => p[0] * dirichlet.density(p, params)) / Z;
  close(m1, 5 / A, 8e-3);
  const mv = dirichlet.meanVector(params);
  close(mv[0], 5 / A); close(mv[1], 3 / A); close(mv[2], 2 / A);
});
