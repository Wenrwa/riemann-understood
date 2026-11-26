**What it is:** the last step. It assumes "no zeros to the right of 1/2" (`DirichletLNonvanishingRightOfHalf`, which is proved elsewhere as `New.grh`) and concludes "all zeros are *on* 1/2".

**The idea: mirror pairs.** Zeros come in reflected pairs. If `s` is a zero, so is `1 − s` (for ζ itself), or the matching point of the "dual" L-function `L(·, χ⁻¹)`. This is the functional equation. Now suppose a zero sat off the line. Then either it or its mirror twin lies to the *right* of 1/2, and that is forbidden. So both must sit exactly on 1/2.

How the Lean does it (at the pinned commit):

- `New.zeros_on_line`: for a zero `s` with 0 < Re s < 1, the facts needed are that the gamma factor doesn't vanish when Re s > 0 (`Complex.Gammaℝ_ne_zero_of_re_pos`), and that a zero gives the mirrored zero of `L(·, χ⁻¹)` (`New.gammaFactor_eq_zero_or_LFunction_one_sub_eq_zero`). `grind` combines these with the hypothesis to get `Re s ≤ 1/2` and `1 − Re s ≤ 1/2`, so `Re s = 1/2`.
- `New.zeta_zeros_on_line` is the same for ζ, treated as the L-function of the character modulo 1. It goes through the completed zeta function, which is symmetric under `s ↦ 1 − s` (`completedRiemannZeta_one_sub`).

Earlier versions spelled these steps out one by one. The current file lets `grind` do the bookkeeping.

**The picture:** "if a zero ever sat off that line, its twin would sit on the other side; one of the two would be on the right." This file is exactly that sentence.
