**What it is:** the top of the proof, the file everything else feeds into. It is about 25 lines.

It proves five theorems, and each is a one-line consequence of two results from deeper in the code:

1. `New.grh`: no Dirichlet L-function has a zero to the right of the line Re s = 1/2. This is the hard part, and everything below `New/` exists to prove it.
2. `New.zeta_zeros_on_line` and `New.zeros_on_line` turn "nothing to the right" into "everything *on* the line" (see `src/New/Main.lean`).

The theorems:

- `riemannHypothesis : RiemannHypothesis` is Mathlib's own statement. Mathlib's comment above that definition says that constructing a term of this type is worth a million dollars.
- `riemannZeta_eq_zero_re` is the same, phrased with `RiemannZetaZerosOnLine`.
- `LFunction_ne_zero_of_half_lt_re` is GRH, half-plane form.
- `LFunction_eq_zero_re` is GRH, on-the-line form.
- `LFunction_eq_zero_re_of_isPrimitive` is the primitive-character special case.

**Why it matters:** this is where you can see the *shape* of the whole argument. Prove "no zeros right of 1/2" for all Dirichlet L-functions, then use symmetry to finish.
