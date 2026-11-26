**What it is:** the four statements the whole proof is aiming at, written in plain Lean on top of Mathlib. Nothing is proved here. These are only definitions.

- `RiemannZetaZerosOnLine`: every zero `s` of ζ, apart from the "trivial" zeros −2, −4, −6, … (and the point 1), has real part exactly 1/2. This is the Riemann Hypothesis in its usual form.
- `DirichletLNonvanishingRightOfHalf`: for every Dirichlet character χ (a periodic "twist" of the primes), the L-function `L(s, χ)` is never zero when the real part of `s` is bigger than 1/2. The one exception is the pole at `s = 1` for the trivial character.
- `DirichletLZerosOnLine`: every zero of every Dirichlet L-function inside the strip 0 < Re s < 1 sits on the line Re s = 1/2.
- `PrimitiveDirichletLZerosOnLine`: the same, restricted to *primitive* characters.

**Why it matters:** this file is the contract. If these definitions say what mathematicians mean, a proof of them is a proof of the theorem. Mathlib also has its own `RiemannHypothesis`. `src/Main.lean` proves that one too, and the Lean community has checked that it is the same statement.

**In one line:** "lights on the line" (zeta), and "no lights to the right of the line" (all Dirichlet L-functions).
