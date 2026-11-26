# Riemann, Understood

**The proof of the Riemann Hypothesis is machine-checked. Nobody understands it yet.**
This is a public attempt to read it, by people and AI agents together, one Lean file at a time.

Site: https://wenrwa.github.io/riemann-understood/

On 20 November 2026 Levent Alpöge, working with Claude, released a proof of the Riemann Hypothesis, and of GRH for Dirichlet L-functions, as Lean code only. The Lean FRO and the Mathlib Initiative certified the statement and the proof. Several independent checkers accepted it. But a checker tells you *that* something is true, not *why*. As Tao put it, "the digestion process will take some time."

We read the Lean community's condensed edition ([leanprover-community/riemann-hypothesis](https://github.com/leanprover-community/riemann-hypothesis), 834 files), pinned to a commit in `map.json`. The files are grouped by the four ideas the proof rests on:

1. **Waves.** The primes are made of waves, one per zero. *Open now.*
2. **A ceiling.** A one-sided bound on a weighted prime sum is enough.
3. **Multiplicity.** Stepanov's counting trick, done with whole numbers.
4. **The chain.** A chain of theta lifts, √x long.

The background library (`src/Lib/`, 495 files) is out of scope for now.

## How to contribute

Every file in `map.json` is **open**, **drafted** or **checked**.

1. **Draft a reading.** Pick an open file. Write `readings/<path with / replaced by __>.md`: what the file proves, in plain words, and why the proof needs it. Then set the file's `status` to `"draft"`, its `reading` to that path, and `by` to your name (or "<name> (AI agent)"). Agents are welcome to draft.
2. **Check a reading.** A person walks through the actual Lean and confirms the draft, fixing it if needed. Then set `status` to `"checked"` and `checkedBy` to their name. **Only checked readings count as understood.**
3. **Fix the map.** The chapter assignment beyond "Waves" is a first guess. Move files where they belong, and say why in the pull request.

Rules:

- **Be exact.** Say what the Lean says. If unsure, write "I think" or leave it open.
- **Cite.** Name the textbook or paper when a file proves a known result. The Lean files often say which.
- **Credit.** Name who drafted and who checked. AI drafts are marked as such.
- **Don't duplicate.** Link to the [G.R.H. Polymath](https://terrytao.wordpress.com/2026/11/24/g-r-h-polymath/) and the other maps listed on the site rather than redoing them.
- **No builds needed.** Reading needs no compute. Checking the whole proof took many machine-hours on big servers, and that is already done (see Sutherland's report).

This project is also a HiveOp workspace: [HiveOp](https://hiveop.io) is where people and AI agents work on code together. Each open file is a work item there.

## Run the site locally

```
python3 -m http.server 8000   # then open http://localhost:8000
```

Zeta zero heights come from Andrew Odlyzko's tables. The Lean source is Apache-2.0. This repository's own text is CC BY 4.0.
