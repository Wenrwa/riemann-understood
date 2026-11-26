# Riemann, Understood

**The proof of the Riemann Hypothesis is machine-checked. Nobody understands it yet.**
This is a public attempt to read it, by people and AI agents together, one Lean file at a time.

Site: https://wenrwa.github.io/riemann-understood/

On 20 November 2026 Levent Alpöge, working with Claude, released a proof of the Riemann Hypothesis, and of GRH for Dirichlet L-functions, as Lean code only. The Lean FRO and the Mathlib Initiative certified the statement and the proof. Several independent checkers accepted it. But a checker tells you *that* something is true, not *why*. As Tao put it, "the digestion process will take some time."

Lean has settled that the proof is correct. What nobody knows yet is **why**: what each piece does, and how the pieces connect. That is the work here. No one re-proves anything.

We read the Lean community's condensed edition ([leanprover-community/riemann-hypothesis](https://github.com/leanprover-community/riemann-hypothesis)), pinned to a commit: all 308 files of the argument (`src/New`, `Main`, `Statements`). The chapters follow the community's [GUIDE.md](https://github.com/leanprover-community/riemann-hypothesis/blob/main/GUIDE.md) folders, told as four ideas and a bill:

1. **Waves.** The primes are made of waves, one per zero. *Interactive.*
2. **A ceiling.** A bound from above is enough: the reduction and the main inequality.
3. **Multiplicity.** Derivatives of theta functions that count primes.
4. **The chain.** About √x theta lifts, the seesaw, Theorems A and B.
5. **The bill.** The lower bound, Theorem C: determinants, one lift, congruences.

For every file the site already shows what others have worked out:

- its title and the notes its authors wrote into it, including the literature it relates to;
- what it uses and what uses it, read from the imports;
- its role in the final argument, from the community's INDEX.md.

Each chapter also links the guides written about that part. The background library (`src/Lib/`, 495 files) is out of scope for now.

## How to contribute

Each file is **open**, **explained** or **confirmed**.

1. **Explain a file.** Write `readings/<path with / replaced by __>.md`: what the file does in plain words, and why the proof needs it. Start from its notes in the code. Then set `status` to `"explained"`, `reading` to that path, and `by` to your name (or "<name> (AI agent)") in its chapter file, `chapters/<id>.json`. Agents are welcome to draft.
2. **Connect it.** Say which idea it serves and what it feeds. If a file belongs in another chapter, move it and say why in the pull request.
3. **Confirm an explanation.** A person reads the Lean and confirms that the explanation matches what the code does, or fixes it. Then set `status` to `"confirmed"` and `confirmedBy` to their name. Only confirmed explanations count as understood.
4. **Tell the story.** Improve a chapter's story in `stories.json` so its pieces read as one argument.

Rules:

- **Be exact.** Say what the Lean does. If unsure, write "I think", or leave it open.
- **Cite.** File notes often name the textbook or paper, so pass that on.
- **Credit.** Name who explained and who confirmed. AI drafts are marked as such.
- **Don't duplicate.** Link to the [G.R.H. Polymath](https://terrytao.wordpress.com/2026/11/24/g-r-h-polymath/) and the other guides rather than redoing them.
- **No builds needed.** Reading needs no compute.

The map is generated from the pinned source by `tools/extract.mjs` (file heads, imports, CONTENTS.md, INDEX.md). Recorded statuses are kept when it re-runs.

This project is also a HiveOp workspace: [HiveOp](https://hiveop.io) is where people and AI agents work on code together. Each file is a work item there.

## Run the site locally

```
python3 -m http.server 8000   # then open http://localhost:8000
```

Zeta zero heights come from Andrew Odlyzko's tables. The Lean source is Apache-2.0. This repository's own text is CC BY 4.0.
