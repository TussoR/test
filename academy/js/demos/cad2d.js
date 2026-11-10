// 2D çizim / mini CAD tarayıcı önizlemesi (Proje 2 ve 5).
// Belge modeli (shapes[]), araç durum makinesi, isabet testi (hit testing), yakalama (snap), komut geçmişi (undo/redo).

import { h, mount } from '../core/dom.js';

const GRID = 10; // 1 hücre = 10 mm

function distPointSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function rotatePt(p, c, ang) {
  const s = Math.sin(ang), co = Math.cos(ang);
  const x = p.x - c.x, y = p.y - c.y;
  return { x: c.x + x * co - y * s, y: c.y + x * s + y * co };
}

// Şekil yardımcıları (her şekil düz bir nesne; dönmüş dikdörtgen 4 köşeli çokgen olarak saklanır)
const Shapes = {
  points(s) {
    if (s.type === 'line') return [s.a, s.b];
    if (s.type === 'poly') return s.pts;
    if (s.type === 'circle') return [s.c];
    return [];
  },
  hit(s, p, tol) {
    if (s.type === 'line') return distPointSeg(p, s.a, s.b) <= tol;
    if (s.type === 'circle') return Math.abs(Math.hypot(p.x - s.c.x, p.y - s.c.y) - s.r) <= tol || Math.hypot(p.x - s.c.x, p.y - s.c.y) <= tol;
    if (s.type === 'poly') { for (let i = 0; i < s.pts.length; i++) if (distPointSeg(p, s.pts[i], s.pts[(i + 1) % s.pts.length]) <= tol) return true; }
    return false;
  },
  center(s) {
    if (s.type === 'circle') return s.c;
    const ps = Shapes.points(s);
    return { x: ps.reduce((a, q) => a + q.x, 0) / ps.length, y: ps.reduce((a, q) => a + q.y, 0) / ps.length };
  },
  map(s, f) {
    if (s.type === 'line') return { ...s, a: f(s.a), b: f(s.b) };
    if (s.type === 'poly') return { ...s, pts: s.pts.map(f) };
    if (s.type === 'circle') return { ...s, c: f(s.c) };
    return s;
  },
  info(s) {
    if (s.type === 'line') { const L = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y); return `Çizgi · uzunluk ${L.toFixed(1)} mm · açı ${(Math.atan2(-(s.b.y - s.a.y), s.b.x - s.a.x) * 180 / Math.PI).toFixed(1)}°`; }
    if (s.type === 'circle') return `Daire · r ${s.r.toFixed(1)} mm · çevre ${(2 * Math.PI * s.r).toFixed(1)} mm · alan ${(Math.PI * s.r * s.r).toFixed(0)} mm²`;
    if (s.type === 'poly') { let A = 0; const P = s.pts; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; A += a.x * b.y - b.x * a.y; } return `Dikdörtgen · alan ${Math.abs(A / 2).toFixed(0)} mm² (shoelace formülü)`; }
    return '';
  },
};

export function mountCad2d(container, { mini = false } = {}) {
  const canvas = h('canvas', { height: 420, 'aria-label': mini ? 'Mini CAD çizim alanı' : '2D çizim alanı' });
  const status = h('div.demo-status');
  const bar = h('div.demo-bar');
  const extra = h('div.demo-bar', { style: { borderTop: '1px solid var(--border)', borderBottom: '0', display: mini ? '' : 'none' } });
  mount(container, h('div.demo', bar, canvas, extra, status));
  const ctx2 = canvas.getContext('2d');

  const doc = { shapes: [], layers: [{ name: 'Duvar', color: '#5aa9ff', visible: true }, { name: 'Ölçü', color: '#f2b84b', visible: true }], layer: 0 };
  let nextId = 1;
  let tool = 'line';
  let sel = new Set();
  let drag = null;      // çizim/taşıma sırasında geçici durum
  let mouse = { x: 0, y: 0 }, snapPt = null;
  let snapGrid = mini, snapEnd = mini;
  let measure = null;
  const undo = [], redo = [];

  // Komut deseni: her değişiklik geri alınabilir bir kayıt
  function exec(cmd) { cmd.do(); undo.push(cmd); redo.length = 0; draw(); }
  const cmdAdd = (s) => ({ do: () => doc.shapes.push(s), undo: () => { doc.shapes = doc.shapes.filter(x => x !== s); sel.delete(s.id); } });
  const cmdDelete = (ids) => { let removed = []; return { do: () => { removed = doc.shapes.filter(s => ids.has(s.id)); doc.shapes = doc.shapes.filter(s => !ids.has(s.id)); sel.clear(); }, undo: () => { doc.shapes.push(...removed); } }; };
  const cmdReplace = (before, after) => ({ do: () => { doc.shapes = doc.shapes.map(s => after.find(a => a.id === s.id) || s); }, undo: () => { doc.shapes = doc.shapes.map(s => before.find(a => a.id === s.id) || s); } });

  const tools = mini
    ? [['select', 'Seç'], ['line', 'Çizgi'], ['rect', 'Dikdörtgen'], ['circle', 'Daire'], ['move', 'Taşı'], ['rotate', 'Döndür'], ['measure', 'Ölç']]
    : [['select', 'Seç'], ['line', 'Çizgi'], ['rect', 'Dikdörtgen'], ['circle', 'Daire']];
  function renderBar() {
    mount(bar, tools.map(([k, l]) => h('button.btn.sm', { class: tool === k ? 'active' : '', onclick: () => { tool = k; drag = null; measure = null; renderBar(); draw(); } }, l)),
      h('button.btn.sm.danger', { onclick: delSel, disabled: !sel.size }, 'Sil (Del)'),
      mini ? h('button.btn.sm', { onclick: doUndo, disabled: !undo.length }, '↶ Geri al') : null,
      mini ? h('button.btn.sm', { onclick: doRedo, disabled: !redo.length }, '↷ Yinele') : null,
      h('button.btn.sm.ghost', { onclick: () => { if (doc.shapes.length) exec(cmdDelete(new Set(doc.shapes.map(s => s.id)))); renderBar(); } }, 'Temizle'));
    if (mini) mount(extra,
      h('label.small', h('input', { type: 'checkbox', checked: snapGrid, onchange: (e) => { snapGrid = e.target.checked; } }), ' Izgara yakalama'),
      h('label.small', h('input', { type: 'checkbox', checked: snapEnd, onchange: (e) => { snapEnd = e.target.checked; } }), ' Uç nokta yakalama'),
      h('span.small.muted', { style: { marginLeft: '10px' } }, 'Katman:'),
      doc.layers.map((L, i) => h('span.row', { style: { gap: '4px' } },
        h('button.btn.sm', { class: doc.layer === i ? 'active' : '', style: { color: L.color }, onclick: () => { doc.layer = i; renderBar(); } }, L.name),
        h('input', { type: 'checkbox', checked: L.visible, title: 'Görünür', 'aria-label': `${L.name} görünür`, onchange: (e) => { L.visible = e.target.checked; draw(); } }))),
      h('span.small.muted', { style: { marginLeft: 'auto' } }, 'Döndür: seç → merkeze göre 15° adımlarla tıkla (Shift: −15°)'));
  }
  function delSel() { if (sel.size) { exec(cmdDelete(new Set(sel))); renderBar(); } }
  function doUndo() { const c = undo.pop(); if (c) { c.undo(); redo.push(c); draw(); renderBar(); } }
  function doRedo() { const c = redo.pop(); if (c) { c.do(); undo.push(c); draw(); renderBar(); } }

  function resize() {
    const w = container.clientWidth || 700;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = 420 * dpr;
    canvas.style.height = '420px';
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function snap(p) {
    snapPt = null;
    if (snapEnd) {
      let best = null, bd = 10;
      for (const s of doc.shapes) for (const q of Shapes.points(s)) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } }
      if (best) { snapPt = { ...best, kind: 'uç' }; return { x: best.x, y: best.y }; }
    }
    if (snapGrid) { const q = { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID }; snapPt = { ...q, kind: 'ızgara' }; return q; }
    return p;
  }
  function pos(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  const visible = s => doc.layers[s.layer]?.visible !== false;
  function pick(p) { for (let i = doc.shapes.length - 1; i >= 0; i--) { const s = doc.shapes[i]; if (visible(s) && Shapes.hit(s, p, 6)) return s; } return null; }

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const raw = pos(e), p = snap(raw);
    if (tool === 'select') {
      const s = pick(raw);
      if (!e.shiftKey) sel.clear();
      if (s) sel.has(s.id) && e.shiftKey ? sel.delete(s.id) : sel.add(s.id);
      renderBar(); draw(); return;
    }
    if (tool === 'move') {
      const s = pick(raw);
      if (s && !sel.has(s.id)) { sel.clear(); sel.add(s.id); }
      if (sel.size) drag = { kind: 'move', start: p, before: doc.shapes.filter(x => sel.has(x.id)).map(x => ({ ...x })) };
      renderBar(); return;
    }
    if (tool === 'rotate') {
      const s = pick(raw);
      if (s && !sel.has(s.id)) { sel.clear(); sel.add(s.id); }
      const list = doc.shapes.filter(x => sel.has(x.id));
      if (list.length) {
        const cs = list.map(Shapes.center);
        const c = { x: cs.reduce((a, q) => a + q.x, 0) / cs.length, y: cs.reduce((a, q) => a + q.y, 0) / cs.length };
        const ang = (e.shiftKey ? 15 : -15) * Math.PI / 180;
        exec(cmdReplace(list, list.map(x => Shapes.map(x, q => rotatePt(q, c, ang)))));
      }
      renderBar(); return;
    }
    if (tool === 'measure') { measure = { a: p, b: p, done: false }; drag = { kind: 'measure' }; draw(); return; }
    drag = { kind: tool, a: p, b: p };
  });
  canvas.addEventListener('pointermove', (e) => {
    const raw = pos(e);
    const p = (drag || tool !== 'select') ? snap(raw) : raw;
    mouse = p;
    if (drag?.kind === 'move') {
      const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
      doc.shapes = doc.shapes.map(s => { const b = drag.before.find(x => x.id === s.id); return b ? Shapes.map(b, q => ({ x: q.x + dx, y: q.y + dy })) : s; });
    } else if (drag?.kind === 'measure') measure.b = p;
    else if (drag) drag.b = p;
    draw();
  });
  canvas.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.kind === 'move') {
      const after = doc.shapes.filter(x => sel.has(x.id)).map(x => ({ ...x }));
      undo.push(cmdReplace(d.before, after)); redo.length = 0;
    } else if (d.kind === 'measure') { measure.done = true; }
    else {
      const { a, b } = d;
      if (Math.hypot(b.x - a.x, b.y - a.y) < 3) { draw(); return; }
      let s;
      if (d.kind === 'line') s = { type: 'line', a, b };
      if (d.kind === 'rect') s = { type: 'poly', pts: [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }] };
      if (d.kind === 'circle') s = { type: 'circle', c: a, r: Math.hypot(b.x - a.x, b.y - a.y) };
      s.id = nextId++; s.layer = doc.layer;
      exec(cmdAdd(s));
    }
    renderBar(); draw();
  });
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delSel(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); doRedo(); }
    if (e.key === 'Escape') { sel.clear(); drag = null; measure = null; renderBar(); draw(); }
  });

  function drawShape(s, color, width) {
    ctx2.strokeStyle = color; ctx2.lineWidth = width;
    ctx2.beginPath();
    if (s.type === 'line') { ctx2.moveTo(s.a.x, s.a.y); ctx2.lineTo(s.b.x, s.b.y); }
    if (s.type === 'poly') { ctx2.moveTo(s.pts[0].x, s.pts[0].y); for (const q of s.pts.slice(1)) ctx2.lineTo(q.x, q.y); ctx2.closePath(); }
    if (s.type === 'circle') ctx2.arc(s.c.x, s.c.y, s.r, 0, Math.PI * 2);
    ctx2.stroke();
  }

  function draw() {
    const W = canvas.width / (window.devicePixelRatio || 1), H = 420;
    ctx2.fillStyle = '#0a0e15'; ctx2.fillRect(0, 0, W, H);
    ctx2.lineWidth = 1;
    for (let x = 0; x < W; x += GRID) { ctx2.strokeStyle = x % (GRID * 10) === 0 ? '#1d2636' : '#121925'; ctx2.beginPath(); ctx2.moveTo(x + .5, 0); ctx2.lineTo(x + .5, H); ctx2.stroke(); }
    for (let y = 0; y < H; y += GRID) { ctx2.strokeStyle = y % (GRID * 10) === 0 ? '#1d2636' : '#121925'; ctx2.beginPath(); ctx2.moveTo(0, y + .5); ctx2.lineTo(W, y + .5); ctx2.stroke(); }
    for (const s of doc.shapes) {
      if (!visible(s)) continue;
      const col = mini ? doc.layers[s.layer].color : '#d4dae6';
      drawShape(s, sel.has(s.id) ? '#ffd166' : col, sel.has(s.id) ? 2.5 : 1.6);
      if (sel.has(s.id)) { ctx2.fillStyle = '#ffd166'; for (const q of Shapes.points(s)) ctx2.fillRect(q.x - 3, q.y - 3, 6, 6); }
    }
    if (drag && ['line', 'rect', 'circle'].includes(drag.kind)) {
      const { a, b } = drag;
      const pv = drag.kind === 'line' ? { type: 'line', a, b } : drag.kind === 'rect' ? { type: 'poly', pts: [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }] } : { type: 'circle', c: a, r: Math.hypot(b.x - a.x, b.y - a.y) };
      ctx2.setLineDash([5, 4]); drawShape(pv, '#5aa9ff', 1.5); ctx2.setLineDash([]);
    }
    if (measure) {
      ctx2.strokeStyle = '#3fd18f'; ctx2.setLineDash([3, 3]); ctx2.beginPath(); ctx2.moveTo(measure.a.x, measure.a.y); ctx2.lineTo(measure.b.x, measure.b.y); ctx2.stroke(); ctx2.setLineDash([]);
      const L = Math.hypot(measure.b.x - measure.a.x, measure.b.y - measure.a.y);
      ctx2.fillStyle = '#3fd18f'; ctx2.font = '12px JetBrains Mono, monospace';
      ctx2.fillText(`${L.toFixed(1)} mm`, (measure.a.x + measure.b.x) / 2 + 6, (measure.a.y + measure.b.y) / 2 - 6);
    }
    if (snapPt && (drag || tool !== 'select')) { ctx2.strokeStyle = snapPt.kind === 'uç' ? '#3fd18f' : '#5d6880'; ctx2.strokeRect(snapPt.x - 5, snapPt.y - 5, 10, 10); }
    const selected = doc.shapes.filter(s => sel.has(s.id));
    mount(status,
      h('span', `X ${mouse.x.toFixed(0)} mm  Y ${(H - mouse.y).toFixed(0)} mm`),
      h('span', `Araç: ${tools.find(t => t[0] === tool)?.[1]}`),
      h('span', `${doc.shapes.length} nesne · ${sel.size} seçili`),
      selected.length === 1 ? h('span', Shapes.info(selected[0])) : null,
      !doc.shapes.length ? h('span', 'İpucu: araç seç, tuvalde sürükleyerek çiz. Seç aracıyla tıkla, Delete ile sil.') : null);
  }

  renderBar();
  new ResizeObserver(resize).observe(container);
  resize();
}
