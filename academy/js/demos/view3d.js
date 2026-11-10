// 3D tel kafes (wireframe) görüntüleyici — kendi küçük 3D boru hattımız:
// yerel köşeler → ölçek → döndürme (X,Y,Z Euler) → öteleme (dünya) → kamera → perspektif izdüşüm → 2D ekran.
// Proje 3 (koordinat görselleştirici) ve Proje 4 (geometri aracı + AABB) için.

import { h, mount } from '../core/dom.js';

const rad = d => d * Math.PI / 180;
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; }
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }; }
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z }; }

// Primitifler: köşeler ve kenarlar (yerel koordinat, merkez 0,0,0, boyut 1 birim)
function boxMesh() {
  const v = [];
  for (const x of [-.5, .5]) for (const y of [-.5, .5]) for (const z of [-.5, .5]) v.push({ x, y, z });
  const e = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  return { v, e };
}
function sphereMesh(seg = 16, rings = 8) {
  const v = [], e = [];
  for (let r = 0; r <= rings; r++) {
    const phi = Math.PI * r / rings;
    for (let s = 0; s < seg; s++) {
      const th = 2 * Math.PI * s / seg;
      v.push({ x: .5 * Math.sin(phi) * Math.cos(th), y: .5 * Math.cos(phi), z: .5 * Math.sin(phi) * Math.sin(th) });
      const i = r * seg + s;
      if (r > 0 && r < rings) e.push([i, r * seg + (s + 1) % seg]);
      if (r > 0) e.push([i, (r - 1) * seg + s]);
    }
  }
  return { v, e };
}
function cylMesh(seg = 16) {
  const v = [], e = [];
  for (const y of [-.5, .5]) for (let s = 0; s < seg; s++) { const th = 2 * Math.PI * s / seg; v.push({ x: .5 * Math.cos(th), y, z: .5 * Math.sin(th) }); }
  for (let s = 0; s < seg; s++) { e.push([s, (s + 1) % seg], [seg + s, seg + (s + 1) % seg]); if (s % 2 === 0) e.push([s, seg + s]); }
  return { v, e };
}
const MESHES = { box: boxMesh(), sphere: sphereMesh(), cylinder: cylMesh() };
const NAMES = { box: 'Kutu', sphere: 'Küre', cylinder: 'Silindir' };

function metrics(o) {
  const [sx, sy, sz] = [o.s.x, o.s.y, o.s.z];
  if (o.type === 'box') return { dims: `${sx.toFixed(2)} × ${sy.toFixed(2)} × ${sz.toFixed(2)}`, vol: sx * sy * sz, area: 2 * (sx * sy + sy * sz + sx * sz) };
  if (o.type === 'sphere') { const r = sx / 2; return { dims: `çap ${sx.toFixed(2)} (r ${r.toFixed(2)})`, vol: 4 / 3 * Math.PI * r ** 3, area: 4 * Math.PI * r * r }; }
  const r = sx / 2; return { dims: `çap ${sx.toFixed(2)} · yükseklik ${sy.toFixed(2)}`, vol: Math.PI * r * r * sy, area: 2 * Math.PI * r * (r + sy) };
}

export function mountView3d(container, { geometry = false } = {}) {
  const canvas = h('canvas', { height: 420, 'aria-label': '3D görüntüleyici' });
  const controls = h('div.demo-controls');
  const bar = h('div.demo-bar');
  const status = h('div.demo-status');
  mount(container, h('div.demo', bar, canvas, controls, status));
  const g = canvas.getContext('2d');
  let upZ = true;           // Blender gibi Z yukarı; kapalıysa Y yukarı (Maya/oyun motorları)
  let showLocal = true, showBox = geometry;
  const cam = { yaw: rad(35), pitch: rad(25), dist: 7 };
  const objs = [];
  let selIdx = 0, selIdx2 = -1;
  const add = (type, pos) => { objs.push({ type, p: { ...pos }, r: { x: 0, y: 0, z: 0 }, s: { x: 1, y: 1, z: 1 } }); selIdx = objs.length - 1; };
  add('box', { x: 0, y: 0, z: 0 });
  if (geometry) { add('sphere', { x: 2.2, y: 0, z: 0.5 }); add('cylinder', { x: -1.8, y: 1.5, z: 0 }); selIdx = 0; }

  // dünya → kamera → ekran
  function toCam(p) {
    let q = upZ ? { x: p.x, y: p.z, z: -p.y } : p; // Z-up dünyayı, Y-yukarı kameraya çevir
    q = rotY(q, -cam.yaw);
    q = rotX(q, cam.pitch);
    return { x: q.x, y: q.y, z: q.z - cam.dist };
  }
  function project(p) {
    const c = toCam(p);
    const W = canvas.width / (window.devicePixelRatio || 1), H = 420;
    const f = H * 0.9;
    const z = Math.min(-0.1, c.z);
    return { x: W / 2 + (c.x * f) / -z, y: H / 2 - (c.y * f) / -z, z };
  }
  // yerel → dünya: ölçek → döndür (X, sonra Y, sonra Z) → ötele
  function toWorld(o, v) {
    let q = { x: v.x * o.s.x, y: v.y * o.s.y, z: v.z * o.s.z };
    q = rotX(q, rad(o.r.x)); q = rotY(q, rad(o.r.y)); q = rotZ(q, rad(o.r.z));
    return { x: q.x + o.p.x, y: q.y + o.p.y, z: q.z + o.p.z };
  }
  function aabb(o) {
    const ws = MESHES[o.type].v.map(v => toWorld(o, v));
    const min = { x: Math.min(...ws.map(w => w.x)), y: Math.min(...ws.map(w => w.y)), z: Math.min(...ws.map(w => w.z)) };
    const max = { x: Math.max(...ws.map(w => w.x)), y: Math.max(...ws.map(w => w.y)), z: Math.max(...ws.map(w => w.z)) };
    return { min, max };
  }

  function line(a, b, color, w = 1.5, dash) {
    const A = project(a), B = project(b);
    g.strokeStyle = color; g.lineWidth = w; g.setLineDash(dash || []);
    g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); g.setLineDash([]);
  }
  function label(p, text, color) { const P = project(p); g.fillStyle = color; g.font = '600 12px Inter, sans-serif'; g.fillText(text, P.x + 4, P.y - 4); }

  function draw() {
    const W = canvas.width / (window.devicePixelRatio || 1), H = 420;
    g.fillStyle = '#0a0e15'; g.fillRect(0, 0, W, H);
    // zemin ızgarası (yatay düzlem)
    for (let i = -5; i <= 5; i++) {
      const a = upZ ? [{ x: i, y: -5, z: 0 }, { x: i, y: 5, z: 0 }, { x: -5, y: i, z: 0 }, { x: 5, y: i, z: 0 }] : [{ x: i, y: 0, z: -5 }, { x: i, y: 0, z: 5 }, { x: -5, y: 0, z: i }, { x: 5, y: 0, z: i }];
      line(a[0], a[1], '#172030', 1); line(a[2], a[3], '#172030', 1);
    }
    // dünya eksenleri: X kırmızı, Y yeşil, Z mavi (Blender renkleri)
    const O = { x: 0, y: 0, z: 0 };
    line(O, { x: 3, y: 0, z: 0 }, '#ff5d6c', 2.5); label({ x: 3.1, y: 0, z: 0 }, 'X', '#ff5d6c');
    line(O, { x: 0, y: 3, z: 0 }, '#78d35b', 2.5); label({ x: 0, y: 3.1, z: 0 }, 'Y', '#78d35b');
    line(O, { x: 0, y: 0, z: 3 }, '#4f9dff', 2.5); label({ x: 0, y: 0, z: 3.1 }, 'Z', '#4f9dff');
    objs.forEach((o, i) => {
      const m = MESHES[o.type];
      const ws = m.v.map(v => toWorld(o, v));
      const col = i === selIdx ? '#ffd166' : i === selIdx2 ? '#b392f0' : '#c3cad8';
      for (const [a, b] of m.e) line(ws[a], ws[b], col, i === selIdx ? 1.8 : 1.2);
      if (showLocal && (i === selIdx || !geometry)) {
        // yerel eksenler (nesneyle birlikte döner)
        const c = toWorld(o, O);
        const ax = (v, colr) => line(c, toWorld(o, v), colr, 1.5, [4, 3]);
        ax({ x: .9, y: 0, z: 0 }, '#ff5d6c'); ax({ x: 0, y: .9, z: 0 }, '#78d35b'); ax({ x: 0, y: 0, z: .9 }, '#4f9dff');
      }
      if (showBox) {
        const { min, max } = aabb(o);
        const c = [];
        for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) c.push({ x, y, z });
        for (const [a, b] of boxMesh().e) line(c[a], c[b], i === selIdx ? '#3fd18f' : '#245a44', 1, [3, 3]);
      }
    });
    if (geometry && selIdx2 >= 0 && objs[selIdx2]) line(objs[selIdx].p, objs[selIdx2].p, '#b392f0', 1.5, [6, 4]);
    renderStatus();
  }

  function renderStatus() {
    const o = objs[selIdx];
    if (!o) { mount(status, 'Nesne yok.'); return; }
    const parts = [h('span', `${NAMES[o.type]} · konum (${o.p.x.toFixed(2)}, ${o.p.y.toFixed(2)}, ${o.p.z.toFixed(2)})`), h('span', `dönüş (${o.r.x}°, ${o.r.y}°, ${o.r.z}°)`), h('span', `ölçek (${o.s.x.toFixed(2)}, ${o.s.y.toFixed(2)}, ${o.s.z.toFixed(2)})`)];
    if (geometry) {
      const mt = metrics(o);
      parts.push(h('span', `boyut ${mt.dims}`), h('span', `hacim ${mt.vol.toFixed(3)}`), h('span', `yüzey alanı ${mt.area.toFixed(3)}`));
      const { min, max } = aabb(o);
      parts.push(h('span', `AABB min (${min.x.toFixed(2)}, ${min.y.toFixed(2)}, ${min.z.toFixed(2)}) max (${max.x.toFixed(2)}, ${max.y.toFixed(2)}, ${max.z.toFixed(2)})`));
      if (selIdx2 >= 0 && objs[selIdx2]) {
        const b = objs[selIdx2];
        const d = Math.hypot(b.p.x - o.p.x, b.p.y - o.p.y, b.p.z - o.p.z);
        const A = aabb(o), B = aabb(b);
        const hit = A.min.x <= B.max.x && A.max.x >= B.min.x && A.min.y <= B.max.y && A.max.y >= B.min.y && A.min.z <= B.max.z && A.max.z >= B.min.z;
        parts.push(h('span', { style: { color: '#b392f0' } }, `merkezler arası mesafe ${d.toFixed(3)} · AABB kesişimi: ${hit ? 'EVET' : 'hayır'}`));
      }
    }
    mount(status, parts);
  }

  function slider(lbl, cls, get, set, min, max, step) {
    const inp = h('input', { type: 'range', min, max, step, value: get() });
    const val = h('span.small', { style: { width: '44px', textAlign: 'right', fontFamily: 'var(--mono)' } }, String(get()));
    inp.addEventListener('input', () => { set(+inp.value); val.textContent = inp.value; draw(); });
    return h('label', h('span', { class: cls, style: { width: '62px' } }, lbl), inp, val);
  }
  function renderControls() {
    const o = objs[selIdx];
    if (!o) { mount(controls); return; }
    const axes = [['x', 'ax-x'], ['y', 'ax-y'], ['z', 'ax-z']];
    mount(controls,
      ...axes.map(([k, c]) => slider(`Konum ${k.toUpperCase()}`, c, () => o.p[k], v => { o.p[k] = v; }, -4, 4, 0.1)),
      ...axes.map(([k, c]) => slider(`Dönüş ${k.toUpperCase()}`, c, () => o.r[k], v => { o.r[k] = v; }, -180, 180, 1)),
      ...axes.map(([k, c]) => slider(`Ölçek ${k.toUpperCase()}`, c, () => o.s[k], v => {
        if (geometry && o.type !== 'box' && k !== 'y') { o.s.x = v; o.s.z = v; renderControls(); } else o.s[k] = v;
      }, 0.1, 3, 0.05)));
  }
  function renderBar() {
    mount(bar,
      geometry ? ['box', 'sphere', 'cylinder'].map(t => h('button.btn.sm', { onclick: () => { add(t, { x: (Math.random() * 4 - 2), y: (Math.random() * 4 - 2), z: 0.5 }); renderBar(); renderControls(); draw(); } }, `+ ${NAMES[t]}`)) : null,
      geometry ? h('select', { style: { width: 'auto' }, 'aria-label': 'Seçili nesne', onchange: (e) => { selIdx = +e.target.value; renderControls(); draw(); } }, objs.map((o, i) => h('option', { value: i, selected: i === selIdx }, `${i + 1}. ${NAMES[o.type]}`))) : null,
      geometry ? h('select', { style: { width: 'auto' }, 'aria-label': 'Mesafe için ikinci nesne', onchange: (e) => { selIdx2 = +e.target.value; draw(); } }, h('option', { value: -1 }, 'Mesafe: ikinci nesne…'), objs.map((o, i) => h('option', { value: i, selected: i === selIdx2 }, `${i + 1}. ${NAMES[o.type]}`))) : null,
      geometry ? h('button.btn.sm.danger', { disabled: objs.length < 2, onclick: () => { objs.splice(selIdx, 1); selIdx = 0; selIdx2 = -1; renderBar(); renderControls(); draw(); } }, 'Sil') : null,
      h('button.btn.sm', { class: upZ ? 'active' : '', onclick: () => { upZ = !upZ; renderBar(); draw(); } }, upZ ? 'Z yukarı (Blender)' : 'Y yukarı (Maya/Unity)'),
      h('button.btn.sm', { class: showLocal ? 'active' : '', onclick: () => { showLocal = !showLocal; renderBar(); draw(); } }, 'Yerel eksenler'),
      h('button.btn.sm', { class: showBox ? 'active' : '', onclick: () => { showBox = !showBox; renderBar(); draw(); } }, 'Sınırlayıcı kutu (AABB)'),
      h('button.btn.sm.ghost', { onclick: () => { const o = objs[selIdx]; o.p = { x: 0, y: 0, z: 0 }; o.r = { x: 0, y: 0, z: 0 }; o.s = { x: 1, y: 1, z: 1 }; renderControls(); draw(); } }, 'Sıfırla'),
      h('span.small.muted', { style: { marginLeft: 'auto' } }, 'Sürükle: kamerayı döndür · tekerlek: yakınlaştır'));
  }

  let dragging = null;
  canvas.addEventListener('pointerdown', (e) => { dragging = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    cam.yaw += (e.clientX - dragging.x) * 0.01;
    cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch + (e.clientY - dragging.y) * 0.01));
    dragging = { x: e.clientX, y: e.clientY };
    draw();
  });
  canvas.addEventListener('pointerup', () => { dragging = null; });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = Math.max(3, Math.min(20, cam.dist * (e.deltaY > 0 ? 1.1 : 0.9))); draw(); }, { passive: false });

  function resize() {
    const w = container.clientWidth || 700;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = 420 * dpr; canvas.style.height = '420px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  renderBar(); renderControls();
  new ResizeObserver(resize).observe(container);
  resize();
}
