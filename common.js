// Shared bits: the lake of lights, the map, a tiny Markdown reader.

/** The first nontrivial zeros of ζ (imaginary parts), from Odlyzko's tables. */
export async function loadZeros() {
  const text = await (await fetch('zeros.csv')).text();
  return text.trim().split(',').map(Number);
}

export async function loadMap() {
  return (await fetch('map.json', { cache: 'no-store' })).json();
}

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Paragraphs, bullet and numbered lists, **bold**, *italic*, `code`. Nothing else. */
export function markdown(md) {
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>');
  const out = [];
  for (const block of md.trim().split(/\n\s*\n/)) {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*- /.test(l))) out.push('<ul>' + lines.map((l) => `<li>${inline(l.replace(/^\s*- /, ''))}</li>`).join('') + '</ul>');
    else if (lines.every((l) => /^\s*\d+\. /.test(l))) out.push('<ol>' + lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\. /, ''))}</li>`).join('') + '</ol>');
    else out.push(`<p>${inline(lines.join(' '))}</p>`);
  }
  return out.join('');
}

export function tally(chapters) {
  const all = chapters.flatMap((c) => c.modules);
  return {
    total: all.length,
    checked: all.filter((m) => m.status === 'checked').length,
    draft: all.filter((m) => m.status === 'draft').length,
  };
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
