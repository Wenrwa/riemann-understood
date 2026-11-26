// Build ru/map.json from the pinned community edition: file heads, imports,
// CONTENTS.md order/titles, INDEX.md roles. Our plain readings in ru/readings.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const COMMIT = 'e063a923620ee7787b4a1270421478645bf66bdb';
const REPO = 'https://github.com/leanprover-community/riemann-hypothesis';
const SRC = 'rhrepo/src';

// CONTENTS.md: order, line counts and titles of every New file.
const contents = [];
let group = null, folder = null;
for (const line of readFileSync('CONTENTS.md', 'utf8').split('\n')) {
  if (line.startsWith('## Lib')) break;
  const f = line.match(/^### (.+)/); if (f) { folder = f[1].trim(); continue; }
  const g = line.match(/^\*\*(.+)\*\*$/); if (g) { group = g[1].trim(); continue; }
  const m = line.match(/^- `([^`]+)` \((\d+)\): (.+)$/);
  if (m) contents.push({ path: `src/${m[1]}.lean`, lines: Number(m[2]), title: m[3].trim(), folder, group });
}

// INDEX.md "The last step": the role of a file in the final argument.
const roles = {};
const idx = readFileSync('INDEX.md', 'utf8');
const last = idx.slice(idx.indexOf('## The last step'), idx.indexOf('## Steps of the argument'));
for (const row of last.split('\n').filter((l) => l.startsWith('| `'))) {
  const cells = row.split('|').map((c) => c.trim());
  const file = (cells[2].match(/`([^`]+)`/) || [])[1];
  if (file) (roles[`src/${file}.lean`] ||= []).push(cells[3]);
}

function head(path) {
  const src = readFileSync(`${SRC}/${path.slice(4)}`, 'utf8');
  const doc = (src.match(/\/-!([\s\S]*?)-\//) || [, ''])[1].trim();
  const lit = doc.match(/## Relation to the literature\s*([\s\S]*?)(\n## |\s*$)/);
  const summary = doc.replace(/^#\s+.+\n?/, '').replace(/## Relation to the literature[\s\S]*$/, '').trim();
  const imports = [...src.matchAll(/^import\s+(\S+)/gm)].map((x) => x[1]).filter((x) => x.startsWith('New.') || x.startsWith('Lib.')).map((x) => `src/${x.split('.').join('/')}.lean`);
  return { summary, literature: lit ? lit[1].trim() : null, imports };
}

const chapterOf = (p) => {
  if (['src/Statements.lean', 'src/Main.lean', 'src/New/Main.lean', 'src/Lib/Analytic/ZeroSymmetry.lean', 'src/New/Reduction/Zeros/PrimeError.lean', 'src/New/Reduction/Zeros/PrimeNumberTheorem.lean'].includes(p)) return 'waves';
  if (p.startsWith('src/New/Reduction/ShortAndEnough')) return 'chain';
  if (p.startsWith('src/New/Reduction/')) return 'ceiling';
  if (p.startsWith('src/New/Derivatives/')) return 'multiplicity';
  if (p.startsWith('src/New/UpperBound/') || p.startsWith('src/New/Spanning/')) return 'chain';
  if (/^src\/New\/(Determinant|OneLift|Congruences|Appendix)\//.test(p)) return 'bill';
  return null;
};

const extra = [
  { path: 'src/Statements.lean', title: 'The statements, in Mathlib’s terms', folder: 'The theorem', group: 'The top' },
  { path: 'src/Main.lean', title: 'The five theorems', folder: 'The theorem', group: 'The top' },
  { path: 'src/New/Main.lean', title: 'From non-vanishing in Re s > 1/2 to zeros on the critical line', folder: 'The theorem', group: 'The top' },
  { path: 'src/Lib/Analytic/ZeroSymmetry.lean', title: 'Zeros of L(s, χ) and of L(1 − s, χ⁻¹)', folder: 'Background used here', group: 'The top' },
];
const files = [...extra, ...contents.filter((c) => !extra.some((e) => e.path === c.path))]
  .filter((f) => chapterOf(f.path))
  .map((f) => ({ ...f, ...head(f.path) }));
const known = new Set(files.map((f) => f.path));
const usedBy = {};
for (const f of files) for (const i of f.imports) if (known.has(i)) (usedBy[i] ||= []).push(f.path);

// Keep any reading status already recorded (draft/confirmed) from the old map.
const old = existsSync('ru/map.json') ? JSON.parse(readFileSync('ru/map.json', 'utf8')) : { chapters: [] };
const oldMods = new Map(old.chapters.flatMap((c) => c.modules).map((m) => [m.path, m]));

const mod = (f) => {
  const o = oldMods.get(f.path) || {};
  const readingFile = `readings/${f.path.replaceAll('/', '__')}.md`;
  const reading = existsSync('ru/' + readingFile) ? readingFile : null;
  const status = o.status === 'confirmed' || o.status === 'checked' ? 'confirmed' : reading ? 'explained' : 'open';
  return {
    path: f.path, url: `${REPO}/blob/${COMMIT}/${f.path}`, title: f.title, folder: f.folder, group: f.group, lines: f.lines ?? null,
    note: f.summary || null, literature: f.literature,
    uses: f.imports.filter((i) => known.has(i)), libUses: f.imports.filter((i) => i.startsWith('src/Lib/') && !known.has(i)).length,
    usedBy: usedBy[f.path] || [],
    ...(roles[f.path] ? { role: roles[f.path] } : {}),
    status, ...(reading ? { reading, by: o.by || 'Claude (AI agent)' } : {}), ...(o.checkedBy ? { confirmedBy: o.checkedBy } : {}), ...(o.confirmedBy ? { confirmedBy: o.confirmedBy } : {}),
  };
};
const story = JSON.parse(readFileSync(existsSync('ru/stories.json') ? 'ru/stories.json' : 'stories.json', 'utf8'));
const chapters = story.map((c) => ({ ...c, modules: files.filter((f) => chapterOf(f.path) === c.id).map(mod) }));
import { mkdirSync } from 'node:fs';
mkdirSync('ru/chapters', { recursive: true });
for (const c of chapters) writeFileSync(`ru/chapters/${c.id}.json`, JSON.stringify(c, null, 1) + '\n');
const slim = chapters.map(({ modules, story, elsewhere, ...c }) => ({ ...c, modules: modules.map((m) => ({ path: m.path, status: m.status, documented: !!m.note })) }));
writeFileSync('ru/map.json', JSON.stringify({
  source: { repo: REPO, commit: COMMIT, guide: `${REPO}/blob/${COMMIT}/GUIDE.md`, index: `${REPO}/blob/${COMMIT}/INDEX.md`,
    note: 'The Lean community’s condensed edition (based on the readable edition of github.com/lsernau/grh-lean). Each file’s “notes in the code” are the file’s own head, written by the edition’s authors; the chapter grouping follows GUIDE.md’s folders.' },
  foundations: { path: 'src/Lib/', modules: 495, note: 'Background results the argument stands on, classed as known in the literature (class field theory, Galois representations, Shimura varieties, p-adic Hodge theory, Siegel–Weil, …). Not part of this reading yet.' },
  chapters: slim,
}, null, 1) + '\n');
for (const c of chapters) console.log(c.id, c.modules.length, 'notes:', c.modules.filter((m) => m.note).length, 'roles:', c.modules.filter((m) => m.role).length);
