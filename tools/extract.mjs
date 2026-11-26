// Build the site's data from the pinned community edition of the proof.
//
//   node tools/extract.mjs <path-to-a-checkout-of-the-community-repo>
//
// Reads every Lean file's head (its authors' notes), its imports, its count of
// theorems/lemmas and lines, CONTENTS.md (order and titles) and INDEX.md (roles
// in the final argument). Writes map.json (light index), parts/<id>.json (one
// per part of the proof, and one per background subject). Recorded reading
// statuses (explained / confirmed) are kept across runs.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CHECKOUT = process.argv[2] || 'rhrepo';
const OUT = process.argv[3] || '.';
const COMMIT = 'e063a923620ee7787b4a1270421478645bf66bdb';
const REPO = 'https://github.com/leanprover-community/riemann-hypothesis';
const read = (p) => readFileSync(join(CHECKOUT, p), 'utf8');

// ---- CONTENTS.md: order, titles, folders, groups ----
const listed = [];
let section = null, folder = null, group = null;
for (const line of read('CONTENTS.md').split('\n')) {
  if (line.startsWith('## ')) { section = line.slice(3).trim(); folder = group = null; continue; }
  const f = line.match(/^### (.+)/); if (f) { folder = f[1].trim(); group = null; continue; }
  const g = line.match(/^\*\*(.+?)\*\*:?\s*(.*)$/); if (g) { group = g[2] ? g[2].trim() : g[1].trim(); continue; }
  const m = line.match(/^- `([^`]+)` \((\d+)\): (.+)$/);
  if (m) listed.push({ path: `src/${m[1]}.lean`, title: m[3].trim(), section, folder, group });
}
const titleOf = new Map(listed.map((l) => [l.path, l]));

// ---- INDEX.md "The last step": the role of a file in the final argument ----
const roles = {};
const idx = read('INDEX.md');
for (const row of idx.slice(idx.indexOf('## The last step'), idx.indexOf('## Steps of the argument')).split('\n').filter((l) => l.startsWith('| `'))) {
  const cells = row.split('|').map((c) => c.trim());
  const file = (cells[2].match(/`([^`]+)`/) || [])[1];
  if (file) (roles[`src/${file}.lean`] ||= []).push(cells[3]);
}

// ---- every Lean file ----
function walk(dir) {
  return readdirSync(join(CHECKOUT, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.lean') ? [`${dir}/${e.name}`] : []);
}
const files = walk('src').map((path) => {
  const src = read(path);
  const doc = (src.match(/\/-!([\s\S]*?)-\//) || [, ''])[1].trim();
  const lit = doc.match(/## Relation to the literature\s*([\s\S]*?)(\n## |\s*$)/);
  const note = doc.replace(/^#\s+.+\n?/, '').replace(/## Relation to the literature[\s\S]*$/, '').trim();
  const heading = (doc.match(/^#\s+(.+)/m) || [])[1];
  const imports = [...src.matchAll(/^import\s+(\S+)/gm)].map((x) => x[1])
    .filter((x) => x.startsWith('New.') || x.startsWith('Lib.')).map((x) => `src/${x.split('.').join('/')}.lean`);
  const theorems = (src.match(/^\s*(?:@\[[^\]]*\]\s*)?(?:private |protected |noncomputable )*(?:theorem|lemma)\s/gm) || []).length;
  return {
    path, note: note || null, literature: lit ? lit[1].trim() : null, imports, theorems, lines: src.split('\n').length,
    title: titleOf.get(path)?.title || heading || null, folder: titleOf.get(path)?.folder || null, group: titleOf.get(path)?.group || null,
  };
});
const byPath = new Map(files.map((f) => [f.path, f]));

// ---- the parts of the proof, following GUIDE.md / INDEX.md ----
const STATEMENT = ['src/Statements.lean', 'src/Main.lean', 'src/New/Main.lean', 'src/Lib/Analytic/ZeroSymmetry.lean'];
function partOf(p) {
  if (STATEMENT.includes(p)) return 'statement';
  if (p.startsWith('src/New/Reduction/Zeros/') || p === 'src/New/Reduction/OneSidedBound.lean') return 'zeros';
  if (p.startsWith('src/New/Reduction/Data/') || p.startsWith('src/New/Reduction/Lattices/') || p === 'src/New/Reduction/PrimeSums.lean' || p === 'src/New/Reduction/IntegralTargetForms.lean') return 'setup';
  if (p === 'src/New/Reduction/MainInequality.lean' || p === 'src/New/Reduction/ShortAndEnough.lean') return 'main';
  if (p.startsWith('src/New/UpperBound/') || p.startsWith('src/New/Derivatives/')) return 'theoremA';
  if (p.startsWith('src/New/Spanning/')) return 'theoremB';
  if (/^src\/New\/(Determinant|OneLift|Congruences|Appendix)\//.test(p)) return 'theoremC';
  if (p === 'src/Lib/Speed.lean' || p === 'src/Lib/Base.lean') return 'lib-General';
  if (p.startsWith('src/Lib/')) return 'lib-' + (p.split('/')[2].replace('.lean', ''));
  return null;
}
const partFor = new Map(files.map((f) => [f.path, partOf(f.path)]));
const usedBy = {};
for (const f of files) for (const i of f.imports) if (byPath.has(i)) (usedBy[i] ||= []).push(f.path);

// ---- statuses recorded so far ----
const statusFile = join(OUT, 'status.json');
const status = existsSync(statusFile) ? JSON.parse(readFileSync(statusFile, 'utf8')) : {};
const story = JSON.parse(readFileSync(join(OUT, 'stories.json'), 'utf8'));

const mod = (f) => {
  const s = status[f.path] || {};
  const readingFile = `readings/${f.path.replaceAll('/', '__')}.md`;
  const reading = existsSync(join(OUT, readingFile)) ? readingFile : null;
  const st = s.confirmedBy ? 'confirmed' : reading ? 'explained' : 'open';
  const others = new Set((usedBy[f.path] || []).map((u) => partFor.get(u)).filter((p) => p && p !== partFor.get(f.path) && !p.startsWith('lib-')));
  return {
    path: f.path, url: `${REPO}/blob/${COMMIT}/${f.path}`, title: f.title, folder: f.folder, group: f.group,
    lines: f.lines, theorems: f.theorems, note: f.note, literature: f.literature,
    uses: f.imports.filter((i) => byPath.has(i) && !i.startsWith('src/Lib/')),
    libUses: f.imports.filter((i) => i.startsWith('src/Lib/')),
    usedBy: usedBy[f.path] || [],
    ...(others.size >= 2 ? { shared: [...others] } : {}),
    ...(roles[f.path] ? { role: roles[f.path] } : {}),
    status: st, ...(reading ? { reading, by: s.by || 'Claude (AI agent)' } : {}), ...(s.confirmedBy ? { confirmedBy: s.confirmedBy } : {}),
  };
};
// CONTENTS order inside a part; anything unlisted at the end.
const order = new Map(listed.map((l, i) => [l.path, i]));
const sorted = (arr) => arr.sort((a, b) => (order.get(a.path) ?? 1e9) - (order.get(b.path) ?? 1e9) || a.path.localeCompare(b.path));

mkdirSync(join(OUT, 'parts'), { recursive: true });
const parts = story.parts.map((p) => {
  const mods = sorted(files.filter((f) => partFor.get(f.path) === p.id)).map(mod);
  return { ...p, kind: 'part', modules: mods };
});
const subjects = [...new Set(files.map((f) => partFor.get(f.path)).filter((p) => p && p.startsWith('lib-')))].sort().map((id, i) => {
  const name = id.slice(4);
  const folderTitle = listed.find((l) => l.path.startsWith(`src/Lib/${name}/`))?.folder || name;
  const [short, ...rest] = folderTitle.split(':');
  return { id, n: i + 1, kind: 'background', title: rest.length ? rest.join(':').trim() : short, line: `Background: Lib/${name}`, summary: `Results classed as known in the literature and missing from Mathlib, proved here with their own definitions.`, story: [], elsewhere: [], modules: sorted(files.filter((f) => partFor.get(f.path) === id)).map(mod) };
});
for (const p of [...parts, ...subjects]) writeFileSync(join(OUT, 'parts', `${p.id}.json`), JSON.stringify(p, null, 1) + '\n');

const light = (p) => ({ id: p.id, n: p.n, kind: p.kind, title: p.title, line: p.line, summary: p.summary,
  modules: p.modules.map((m) => ({ path: m.path, status: m.status, documented: !!m.note, theorems: m.theorems, lines: m.lines })) });
writeFileSync(join(OUT, 'map.json'), JSON.stringify({
  source: { repo: REPO, commit: COMMIT, guide: `${REPO}/blob/${COMMIT}/GUIDE.md`, index: `${REPO}/blob/${COMMIT}/INDEX.md`,
    note: 'The Lean community’s condensed edition (based on the readable edition of github.com/lsernau/grh-lean). Parts follow its GUIDE.md and INDEX.md.' },
  parts: parts.map(light), background: subjects.map(light), ideas: story.ideas,
}, null, 1) + '\n');

for (const p of [...parts, ...subjects]) console.log(p.id.padEnd(22), String(p.modules.length).padStart(4), 'files', String(p.modules.reduce((s, m) => s + m.theorems, 0)).padStart(6), 'theorems');
