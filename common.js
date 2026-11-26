// Shared bits: the lake of lights, the map, a tiny Markdown reader.

/** The first nontrivial zeros of ζ (imaginary parts), from Odlyzko's tables. */
export async function loadZeros() {
  const text = await (await fetch('zeros.csv')).text();
  return text.trim().split(',').map(Number);
}

/**
 * status.json is the live record of progress: { "<path>": { "by": "...", "confirmedBy": "..." } }.
 * A listed file has a plain-words reading at readings/<path with / as __>.md.
 * Contributors edit only status.json and readings/, never the generated files.
 */
let statusPromise = null;
const loadStatus = () => (statusPromise ||= fetch('status.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
export const readingPath = (path) => `readings/${path.replaceAll('/', '__')}.md`;
function overlay(modules, status) {
  for (const m of modules) {
    const s = status[m.path];
    if (!s) continue;
    m.status = s.confirmedBy ? 'confirmed' : 'explained';
    m.reading = readingPath(m.path);
    if (s.by) m.by = s.by;
    if (s.confirmedBy) m.confirmedBy = s.confirmedBy;
  }
}

export async function loadMap() {
  const [map, status] = await Promise.all([fetch('map.json', { cache: 'no-store' }).then((r) => r.json()), loadStatus()]);
  for (const p of [...map.parts, ...map.background]) overlay(p.modules, status);
  return map;
}

export async function loadChapter(id) {
  const [part, status] = await Promise.all([fetch(`parts/${encodeURIComponent(id)}.json`, { cache: 'no-store' }).then((r) => r.json()), loadStatus()]);
  overlay(part.modules, status);
  return part;
}

export const partHref = (id) => `chapter.html?c=${encodeURIComponent(id)}`;

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const inline = (s) => {
  const codes = [];
  const t = esc(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; })
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
};

/** Paragraphs, headings, bullet ("-" or "*") and numbered lists (with wrapped lines), **bold**, *italic*, `code`. */
export function markdown(md) {
  const out = [];
  for (const block of String(md || '').trim().split(/\n\s*\n/)) {
    const lines = block.split('\n');
    const h = lines[0].match(/^#{1,4}\s+(.+)/);
    if (h && lines.length === 1) { out.push(`<p><b>${inline(h[1])}</b></p>`); continue; }
    const items = []; let kind = null; const para = [];
    for (const l of lines) {
      const b = l.match(/^\s*[-*] (.*)/), n = l.match(/^\s*\d+\. (.*)/);
      if (b || n) { kind = kind || (b ? 'ul' : 'ol'); items.push((b || n)[1]); }
      else if (items.length && /^\s+\S/.test(l)) items[items.length - 1] += ' ' + l.trim();
      else if (items.length) items[items.length - 1] += ' ' + l.trim();
      else para.push(l.trim());
    }
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    if (items.length) out.push(`<${kind}>` + items.map((i) => `<li>${inline(i)}</li>`).join('') + `</${kind}>`);
  }
  return out.join('');
}

export function tally(parts) {
  const all = parts.flatMap((c) => c.modules);
  const done = all.filter((m) => m.status === 'explained' || m.status === 'confirmed');
  const sum = (xs) => xs.reduce((n, m) => n + (m.theorems || 0), 0);
  return {
    total: all.length,
    theorems: sum(all),
    documented: all.filter((m) => m.documented || m.note).length,
    explained: all.filter((m) => m.status === 'explained').length,
    confirmed: all.filter((m) => m.status === 'confirmed').length,
    theoremsExplained: sum(done),
    theoremsConfirmed: sum(all.filter((m) => m.status === 'confirmed')),
  };
}

export const fmt = (n) => Number(n).toLocaleString('en-US');

export const anchorOf = (path) => 'f-' + path.replace(/[^A-Za-z0-9]+/g, '-');
const short = (path) => path.replace(/^src\//, '').replace(/\.lean$/, '');
const STATUS = { open: 'open', explained: 'explained', confirmed: 'confirmed' };

/**
 * One chapter: its story, other people's write-ups, and every file with
 * (1) the notes in the code, written by the edition's authors,
 * (2) a plain-words explanation, when someone has drafted one,
 * (3) its connections: what it uses and what uses it.
 */
export async function renderChapter(el, chapter, where) {
  const [map, readings] = await Promise.all([
    loadMap(),
    Promise.all(chapter.modules.map((m) => (m.reading ? fetch(m.reading).then((r) => (r.ok ? r.text() : '')) : ''))),
  ]);
  where = where || {};
  const titles = {};
  for (const c of [...map.parts, ...map.background]) { titles[c.id] = c.title; for (const m of c.modules) where[m.path] = c.id; }
  const link = (p) => {
    const c = where[p];
    if (!c) return `<code>${esc(short(p))}</code>`;
    const href = c === chapter.id ? `#${anchorOf(p)}` : `${partHref(c)}#${anchorOf(p)}`;
    return `<a href="${href}"><code>${esc(short(p))}</code></a>`;
  };
  const groups = [];
  for (const m of chapter.modules) {
    const key = `${m.folder || ''} · ${m.group || ''}`;
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push((g = { key, folder: m.folder, group: m.group, items: [] }));
    g.items.push(m);
  }
  const card = (m) => {
    const i = chapter.modules.indexOf(m);
    const plain = readings[i];
    return `<div class="module" id="${anchorOf(m.path)}">
      <div class="module-top"><div><div class="mtitle">${inline(m.title || short(m.path))}</div>
        <a class="path" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(short(m.path))} · ${fmt(m.theorems || 0)} theorem${m.theorems === 1 ? '' : 's'} · ${fmt(m.lines || 0)} lines ↗</a></div>
        <span class="pill ${esc(m.status)}">${STATUS[m.status]}</span></div>
      ${(m.role || []).map((r) => `<div class="role">In the final argument: ${inline(r)}</div>`).join('')}
      ${m.shared ? `<div class="shared">Used across the proof: also by ${m.shared.map((id) => `<a href="${partHref(id)}">${esc(titles[id] || id)}</a>`).join(', ')}</div>` : ''}
      ${m.note ? `<div class="lead-note"><span class="label">What its authors say</span> ${inline(m.note.split(/\n\s*\n/)[0].replace(/\s+/g, ' '))}</div>` : ''}
      ${plain ? `<div class="plain"><div class="label">In plain words</div><div class="reading-body">${markdown(plain)}</div>
        <div class="byline">${m.status === 'confirmed' ? 'Confirmed by ' + esc(m.confirmedBy || 'a reader') : 'Drafted by ' + esc(m.by || 'a contributor') + ' · not yet confirmed against the code'}</div></div>`
        : `<p class="small muted" style="margin:8px 0 0">No plain-words explanation yet. <a href="https://github.com/Wenrwa/riemann-understood#how-to-contribute">Write one</a>.</p>`}
      ${m.note ? `<details class="reading"><summary>Full notes in the code <span class="muted">(by the edition’s authors)</span></summary><div class="reading-body note-body">${markdown(m.note)}</div>${m.literature ? `<div class="label" style="margin-top:8px">Relation to the literature</div><div class="reading-body note-body">${markdown(m.literature)}</div>` : ''}</details>` : ''}
      ${(m.uses?.length || m.usedBy?.length || m.libUses?.length) ? `<details class="reading"><summary>Connections · uses ${m.uses?.length || 0}${m.libUses?.length ? ` + ${m.libUses.length} background` : ''} · used by ${m.usedBy?.length || 0}</summary><div class="conn">
        ${m.uses?.length ? `<div><span class="label">Uses</span> ${m.uses.map(link).join(' ')}</div>` : ''}
        ${m.libUses?.length ? `<div><span class="label">Background</span> ${m.libUses.map(link).join(' ')}</div>` : ''}
        ${m.usedBy?.length ? `<div><span class="label">Used by</span> ${m.usedBy.map(link).join(' ')}</div>` : ''}</div></details>` : ''}
    </div>`;
  };
  const t = tally([chapter]);
  el.innerHTML = `
    ${chapter.story?.length ? `<h2>The story so far</h2>
    ${chapter.story.map((p) => `<p>${inline(p)}</p>`).join('')}
    <p class="byline">Story drafted by Claude (AI agent) from the community’s <a href="${esc(map.source.guide)}">GUIDE.md</a>, <a href="${esc(map.source.index)}">INDEX.md</a> and the files’ own notes. Not yet confirmed by a person.</p>` : ''}
    ${chapter.elsewhere?.length ? `<h3 style="margin-top:22px">Others who have written about this part</h3><div class="links">${chapter.elsewhere.map((e) => `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.label)}</a>`).join('')}</div>` : ''}
    <h2>The files, and what we know about each</h2>
    <p class="muted">${t.total} files · ${fmt(t.theorems)} theorems and lemmas · ${t.documented} files with notes in the code · ${t.explained + t.confirmed} explained in plain words · ${t.confirmed} confirmed. Lean has already checked every step. The work here is explaining what each file does, why the proof needs it, and how it connects.</p>
    ${groups.map((g, gi) => `<details class="group" ${gi < 2 || groups.length <= 3 ? 'open' : ''}><summary><span>${esc(g.group || g.folder || 'Files')}</span><span class="muted small">${esc(g.folder || '')} · ${g.items.length} file${g.items.length > 1 ? 's' : ''}</span></summary>${g.items.map(card).join('')}</details>`).join('')}`;
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

/** Lights on a still lake: one pillar per zero, standing on the critical line. */
export function drawLake(canvas, zeros, opts = {}) {
  const ctx = canvas.getContext('2d');
  const count = opts.count ?? 40;
  let t0 = performance.now();
  const stars = Array.from({ length: 140 }, () => [Math.random(), Math.random() * 0.55, Math.random() * 1.2 + 0.2, Math.random()]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(now) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const horizon = h * 0.62;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#05080f'); sky.addColorStop(1, '#121a2e');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, horizon);
    const water = ctx.createLinearGradient(0, horizon, 0, h);
    water.addColorStop(0, '#0c1324'); water.addColorStop(1, '#04060c');
    ctx.fillStyle = water; ctx.fillRect(0, horizon, w, h - horizon);
    const tt = (now - t0) / 1000;
    for (const [x, y, r, p] of stars) {
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(tt * 0.8 + p * 6.28);
      ctx.fillStyle = '#dfe6ff'; ctx.beginPath(); ctx.arc(x * w, y * h, r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // The critical line runs from near the viewer back to the horizon; the
    // k-th zero stands k steps along it, in perspective (nearest = lowest).
    ctx.strokeStyle = 'rgba(242,196,109,.18)'; ctx.lineWidth = 1;
    const ax = w * 0.80, ay = h * 0.99, bx = w * 0.56, by = horizon;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    for (let k = count - 1; k >= 0; k--) {
      const depth = 1 - 1 / (1 + k * 0.16);          // 0 near … →1 far
      const x = ax + (bx - ax) * depth, y = ay + (by - ay) * depth;
      const scale = 1 - depth * 0.92;
      const height = h * 0.78 * scale;
      const flicker = reduce ? 1 : 0.85 + 0.15 * Math.sin(tt * 1.3 + k);
      const g = ctx.createLinearGradient(0, y - height, 0, y);
      g.addColorStop(0, 'rgba(242,196,109,0)'); g.addColorStop(0.7, `rgba(255,226,170,${0.5 * flicker})`); g.addColorStop(1, `rgba(255,246,225,${0.95 * flicker})`);
      ctx.fillStyle = g; ctx.fillRect(x - 1.8 * scale - 0.4, y - height, 3.6 * scale + 0.8, height);
      const R = 22 * scale + 3;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, R);
      glow.addColorStop(0, `rgba(255,236,200,${0.75 * flicker})`); glow.addColorStop(1, 'rgba(255,236,200,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.283); ctx.fill();
      const r = ctx.createLinearGradient(0, y, 0, y + height * 0.4);
      r.addColorStop(0, `rgba(242,196,109,${0.3 * flicker})`); r.addColorStop(1, 'rgba(242,196,109,0)');
      ctx.fillStyle = r; ctx.fillRect(x - 1.3 * scale - 0.4, y, 2.6 * scale + 0.8, height * 0.4);
    }
    const fade = ctx.createLinearGradient(0, h * 0.88, 0, h);
    fade.addColorStop(0, 'rgba(7,11,20,0)'); fade.addColorStop(1, 'rgba(7,11,20,1)');
    ctx.fillStyle = fade; ctx.fillRect(0, h * 0.88, w, h * 0.12);
    // keep the words readable over the sky
    const veil = ctx.createLinearGradient(0, 0, w * 0.6, 0);
    veil.addColorStop(0, 'rgba(7,11,20,.55)'); veil.addColorStop(1, 'rgba(7,11,20,0)');
    ctx.fillStyle = veil; ctx.fillRect(0, 0, w * 0.6, h);
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
