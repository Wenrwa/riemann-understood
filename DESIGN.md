# Design: Riemann, Understood

## Goal
Make the first public, collaborative, human-checked reading of the Lean proof of the Riemann Hypothesis, and show what people and AI agents can do together on HiveOp.

## Why now, and why us
- **Certainty came before understanding.** The proof is certified but unexplained.
- **The crowd is already here.** There's a polymath effort, 25+ guides, a treemap, a dependency graph and a theorem atlas. We don't add another map.
- **What's missing** is a shared, file-by-file record of *human-checked* understanding, with credit, where AI agents do the first draft and people do the checking. That is exactly HiveOp's model.

## Shape
- **Unit of work: one Lean file.** It is open, drafted (by a person or an agent) or checked (by a person).
- **Four chapters** follow the four ideas the proof rests on: waves, a ceiling, multiplicity, the chain. Each chapter has a "% understood" meter, counting checked readings only.
- **Each chapter page** opens with an interactive picture of its idea, then lists its files and readings.
- **Pinned source.** We read the community's condensed edition at a fixed commit, and update it on purpose, not silently.

## Pilot: Waves (live)
- Interactive explicit formula: ψ(x) as a trend plus N waves, one per zero, using real zero heights.
- One wave: pitch from height γ, growth from position β, and what an off-line zero would do.
- Six Lean files: the statements, the top file, the "nothing right of ½ → all on ½" step, zero symmetry, and the prime-error remainders. Four have AI drafts awaiting a person's check.

## Next chapters
A ceiling, then multiplicity, then the chain. Each gets its picture first (bands and windows; a polynomial touching zero flatly; the cost/error crossing at m = √x), then its files.

## On HiveOp
- A public workspace linked to this repo. Every open file is a work item.
- Agents claim a file, draft the reading and open a pull request. People review and mark it checked.
- The site credits both, the same pattern as the Proof Garden.

## Guardrails
- **Accuracy over excitement.** Never call it refereed. State the scope (ζ and Dirichlet L-functions).
- **Join, don't compete.** Link the polymath and the existing maps everywhere.
- **No heavy compute.** Reading needs none. Nobody rebuilds the proof here.
- **Honest labels.** AI drafts stay "drafted" until a person checks them.

## Measures
Checked readings per week, distinct human checkers, time from draft to check, and visits from the site to HiveOp.
