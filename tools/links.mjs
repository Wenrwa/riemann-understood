// Writes .hiveop/links.json: which file here explains which file of the proof,
// so HiveOp's scene draws a beam from this repo's city to the linked source
// city (Wenrwa/riemann-hypothesis-source). Gold = explained, green = confirmed.
//
//   node tools/links.mjs
//
// Explained/confirmed files beam from their reading (readings/<path>.md);
// files not yet explained beam, dim, from their part's file (parts/<id>.json),
// so the whole proof shows its shape and fills in as readings arrive.
// Reads only map.json and status.json; run it after editing status.json.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const REPO = 'riemann-hypothesis-source';
const MAX = 500;
const map = JSON.parse(readFileSync('map.json', 'utf8'));
const status = JSON.parse(readFileSync('status.json', 'utf8'));
const readingOf = (p) => `readings/${p.replaceAll('/', '__')}.md`;

const links = [];
for (const part of map.parts) {
  for (const m of part.modules) {
    const s = status[m.path];
    const reading = readingOf(m.path);
    if (s && existsSync(reading)) {
      links.push({ from: reading, repo: REPO, to: m.path, state: s.confirmedBy ? 'confirmed' : 'explained' });
    } else {
      links.push({ from: `parts/${part.id}.json`, repo: REPO, to: m.path, state: 'open' });
    }
  }
}
// Explained and confirmed first, so a cap never drops them.
const rank = { confirmed: 0, explained: 1, open: 2 };
links.sort((a, b) => rank[a.state] - rank[b.state]);
mkdirSync('.hiveop', { recursive: true });
writeFileSync('.hiveop/links.json', JSON.stringify({ version: 1, links: links.slice(0, MAX) }, null, 1) + '\n');
const n = (st) => links.filter((l) => l.state === st).length;
console.log(`links: ${links.length} (${n('confirmed')} confirmed, ${n('explained')} explained, ${n('open')} open)`);
