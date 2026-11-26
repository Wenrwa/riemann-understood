**What it is:** the last step. It assumes "no zeros to the right of 1/2" (`DirichletLNonvanishingRightOfHalf`, which is proved elsewhere as `New.grh`) and concludes "all zeros are *on* 1/2".

**The idea: mirror pairs.** Zeros come in reflected pairs. If `s` is a zero, so is `1 − s` (for ζ itself), or the matching point of the "dual" L-function `L(·, χ⁻¹)`. This is the functional equation. Now suppose a zero sat off the line. Then either it or its mirror twin lies to the *right* of 1/2, and that is forbidden. So both must sit exactly on 1/2.

How the Lean does it:

- `New.zeros_on_line`: take a zero `s` with 0 < Re s < 1. The gamma factor can't vanish there, so `1 − s` is a zero of `L(·, χ⁻¹)`. Neither `s` nor `1 − s` may have real part above 1/2, so `Re s ≤ 1/2` and `1 − Re s ≤ 1/2`. Therefore `Re s = 1/2` (`linarith` does the final arithmetic).
- `New.zeta_zeros_on_line` is the same argument for ζ, which is treated as the L-function of the character modulo 1. It goes through the completed zeta function, which is symmetric under `s ↦ 1 − s`.

**The video's picture:** "if a zero ever sat off that line, its twin would sit on the other side; one of the two would be on the right." This file is exactly that sentence.
