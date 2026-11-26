**What it is:** the "mirror" fact that `src/New/Main.lean` relies on, proved for *all* Dirichlet characters, not just primitive ones.

`New.gammaFactor_eq_zero_or_LFunction_one_sub_eq_zero` says: if `L(s, χ) = 0` with `Re s ≠ 0` and `s ≠ 1`, then either `s` is a pole of the gamma factor, or `1 − s` is a zero of `L(·, χ⁻¹)`.

**Background:** this follows from the functional equation of Dirichlet L-functions, which is textbook material (Montgomery & Vaughan, *Multiplicative Number Theory I*, Cor. 10.3 and 10.8). The work in the file is extending it from primitive to all characters.

*This draft is based on the file's own summary. A reader who walks through the proof body should confirm or correct it.*
