// Special functions used by distribution modules. Pure, dependency-free, and
// importable both in the browser (type="module") and in Node for testing.

// Lanczos approximation for the natural log of the gamma function.
// g = 7, n = 9 coefficients; accurate to roughly 1e-13 for x > 0.
const LANCZOS_G = 7;
const LANCZOS_C = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

export function lgamma(x) {
  if (x < 0.5) {
    // Reflection: Gamma(x)Gamma(1-x) = pi / sin(pi x)
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  }
  x -= 1;
  let a = LANCZOS_C[0];
  const t = x + LANCZOS_G + 0.5;
  for (let i = 1; i < LANCZOS_C.length; i++) {
    a += LANCZOS_C[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Log of the Beta function B(a, b).
export function betaln(a, b) {
  return lgamma(a) + lgamma(b) - lgamma(a + b);
}

// Log of the binomial coefficient C(n, k), via log-gamma (works for real n).
export function logChoose(n, k) {
  return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);
}
