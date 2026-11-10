// Müfredat araması: dersler (tam metin), taslak dersler, projeler, kelimeler, yol haritası.

import { h, mount, stripHtml, esc } from '../core/dom.js';
import { MODULES, loadContent, allProjects } from '../content/modules.js';
import ROADMAP from '../content/roadmap.js';
import { collectVocab } from './vocab.js';
import { setCrumbs } from '../main.js';

let indexPromise = null;
async function buildIndex() {
  const docs = [];
  for (const m of MODULES) {
    docs.push({ type: 'Modül', title: `Modül ${m.num}: ${m.title}`, sub: `${m.titleEn} · ${m.titleJa}`, text: `${m.title} ${m.titleEn} ${m.titleJa} ${m.summary}`, href: `#/module/${m.id}` });
    for (const l of m.lessons) {
      let text = `${l.title} ${l.titleEn} ${l.titleJa} ${l.summary || ''} ${(l.topics || []).join(' ')} ${(l.objectives || []).join(' ')} ${l.cadLink || ''}`;
      if (l.src) {
        try {
          const L = await loadContent(l.src);
          text += ' ' + [L.title, L.titleEn, ...(L.objectives || []), ...(L.summary || []),
            ...L.steps.map(s => `${s.title} ${stripHtml(s.body || s.caption || '')} ${s.code || ''} ${Object.values(s.explain || {}).map(stripHtml).join(' ')}`),
            stripHtml(L.exercise?.prompt), ...(L.quiz || []).map(q => q.q)].join(' ');
          for (const [i, s] of L.steps.entries()) {
            docs.push({ type: 'Ders kartı', title: s.title, sub: `${l.title} · kart ${i + 1}`, text: `${s.title} ${stripHtml(s.body || s.caption || '')} ${s.code || ''}`, href: `#/lesson/${l.id}` });
          }
        } catch { /* henüz yok */ }
      }
      docs.push({ type: l.src ? 'Ders' : 'Ders (taslak)', title: l.title, sub: `Modül ${m.num} · ${l.titleEn} · ${l.titleJa}`, text, href: `#/lesson/${l.id}` });
    }
  }
  for (const p of allProjects()) {
    let text = `${p.title} ${p.titleEn || ''}`;
    try { const P = await loadContent(p.src); text += ' ' + [stripHtml(P.summary), ...(P.goals || []), ...(P.skills || []), ...(P.steps || []).map(s => `${s.title} ${stripHtml(s.body)}`)].join(' '); } catch { /* yok */ }
    docs.push({ type: 'Proje', title: p.title, sub: p.titleEn || '', text, href: `#/project/${p.id}` });
  }
  for (const w of ROADMAP.weeks || []) docs.push({ type: 'Yol haritası', title: `Hafta ${w.week}: ${w.title}`, sub: `Ay ${w.month}`, text: `${w.title} ${(w.goals || []).join(' ')} ${(w.days || []).flatMap(d => d.tasks || []).join(' ')}`, href: '#/roadmap' });
  for (const v of await collectVocab()) docs.push({ type: 'Kelime', title: `${v.ja} — ${v.tr}`, sub: `${v.en} · ${v.romaji}`, text: `${v.en} ${v.tr} ${v.ja} ${v.kana} ${v.romaji}`, href: '#/vocab' });
  for (const d of docs) d.lc = d.text.toLocaleLowerCase('tr');
  return docs;
}

export async function searchView(root, _p, query) {
  const q = (query.get('q') || '').trim();
  setCrumbs([['Arama']]);
  const input = h('input', { type: 'search', value: q, placeholder: 'Ör. döngü, LINQ, quaternion, 変数, raycast…', 'aria-label': 'Arama', style: { maxWidth: '520px' } });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.hash = `#/search?q=${encodeURIComponent(input.value.trim())}`; });
  const results = h('div', h('div.empty', q ? 'Aranıyor…' : 'Aramak için bir kelime yaz.'));
  mount(root, h('div.page', h('div.eyebrow', 'Arama'), h('h1', 'Müfredatta ara'), input, h('div', { style: { marginTop: '16px' } }, results)));
  input.focus();
  if (!q) return;
  indexPromise ??= buildIndex();
  const docs = await indexPromise;
  const terms = q.toLocaleLowerCase('tr').split(/\s+/).filter(Boolean);
  const scored = [];
  for (const d of docs) {
    let s = 0;
    for (const t of terms) {
      if (!d.lc.includes(t)) { s = 0; break; }
      s += 1 + (d.title.toLocaleLowerCase('tr').includes(t) ? 5 : 0) + Math.min(5, d.lc.split(t).length - 1) * 0.3;
    }
    if (s) scored.push({ d, s });
  }
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 60);
  if (!top.length) { mount(results, h('div.empty', `"${q}" için sonuç bulunamadı. Başka bir terim dene ya da AI eğitmene sor.`)); return; }
  const snippet = (d) => {
    const i = d.lc.indexOf(terms[0]);
    const s = d.text.slice(Math.max(0, i - 70), i + 130).replace(/\s+/g, ' ');
    let html = esc(s);
    for (const t of terms) html = html.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark style="background:rgba(90,169,255,.3);color:inherit;border-radius:3px">${m}</mark>`);
    return (i > 70 ? '…' : '') + html + '…';
  };
  mount(results, h('div.small.muted', { style: { marginBottom: '10px' } }, `${scored.length} sonuç`),
    top.map(({ d }) => h('a.lesson-item', { href: d.href },
      h('span.badge', d.type),
      h('div.t', h('div', d.title), h('small', d.sub), h('small', { html: snippet(d) })))));
}
