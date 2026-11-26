# Riemann, Understood

**The proof of the Riemann Hypothesis is machine-checked. Nobody understands it yet.**
This is a public attempt to read it, by people and AI agents together, one Lean file at a time.

Site: https://wenrwa.github.io/riemann-understood/

On 20 November 2026 Levent Alpöge, working with Claude, released a proof of the Riemann Hypothesis, and of GRH for Dirichlet L-functions, as Lean code only. The Lean FRO and the Mathlib Initiative certified the statement and the proof. Several independent checkers accepted it. But a checker tells you *that* something is true, not *why*. As Tao put it, "the digestion process will take some time."

Lean has settled that the proof is correct. What nobody knows yet is **why**: what each piece does, and how the pieces connect. That is the work here. No one re-proves anything.

We read the Lean community's condensed edition ([leanprover-community/riemann-hypothesis](https://github.com/leanprover-community/riemann-hypothesis)), pinned to a commit. All of it is here:

- **The new argument:** 308 files, about 7,000 theorems and lemmas, in seven parts that follow the community's [GUIDE.md](https://github.com/leanprover-community/riemann-hypothesis/blob/main/GUIDE.md) and INDEX.md:
  1. The statement and the last step
  2. From a bound to the zeros
  3. The setup
  4. The three theorems and the main inequality
  5. Theorem A: the composite lift
  6. Theorem B: enough forms
  7. Theorem C: the lower bound
- **The background library:** 495 files, about 11,100 theorems, by subject (class field theory, Galois representations, Shimura varieties, p-adic Hodge theory, Siegel–Weil, …). It is classed as known maths, but it was proved fresh for this proof.
- **Four ideas** from the explainers (waves, a ceiling, multiplicity, the chain) give the big picture. Each one points to the parts where it lives. Waves is interactive.

For every file the site shows what others have already worked out:

- its title and the notes its authors wrote into it, with the literature it relates to;
- what it uses and what uses it, read from the imports;
- its role in the final argument, from INDEX.md;
- whether several parts lean on it.

Progress is measured in theorems, separately for the new argument and the background.

## How to contribute

Each file is **open**, **explained** or **confirmed**.

1. **Explain a file.** Write `readings/<path with / replaced by __>.md`: what the file does in plain words, and why the proof needs it. Start from its notes in the code. Then add the file to `status.json` with `by` set to your name (or "<name> (AI agent)"). Agents are welcome to draft. Then run `node tools/links.mjs`.
2. **Connect it.** Say which idea it serves and what it feeds. Every file already lists what it uses and what uses it. Add what it is *for*.
3. **Confirm an explanation.** A person reads the Lean and confirms that the explanation matches what the code does, or fixes it. Then set `confirmedBy` to their name in `status.json`, and run `node tools/links.mjs` (the scene's beams turn green). Only confirmed explanations count as understood.
4. **Tell the story.** Improve a part's story in `stories.json` so its pieces read as one argument.

Rules:

- **Be exact.** Say what the Lean does. If unsure, write "I think", or leave it open.
- **Cite.** File notes often name the textbook or paper, so pass that on.
- **Credit.** Name who explained and who confirmed. AI drafts are marked as such.
- **Don't duplicate.** Link to the [G.R.H. Polymath](https://terrytao.wordpress.com/2026/11/24/g-r-h-polymath/) and the other guides rather than redoing them.
- **No builds needed.** Reading needs no compute.

The data is generated from the pinned source by `node tools/extract.mjs <checkout>`, which reads the file heads, imports, CONTENTS.md and INDEX.md. Readings and `status.json` are kept when it re-runs.

AI agents: read [AGENTS.md](AGENTS.md) first. The Lean source is read-only, so never build it or open pull requests upstream.

This project is also a HiveOp workspace: [HiveOp](https://hiveop.io) is where people and AI agents work on code together. Each file is a work item there.

## Run the site locally

```
python3 -m http.server 8000   # then open http://localhost:8000
```

Zeta zero heights come from Andrew Odlyzko's tables. The Lean source is Apache-2.0. This repository's own text is CC BY 4.0.
