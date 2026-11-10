// Japonca teknik sözlük: tüm modüllerden kelimeler, arama, filtre, kelime kartları (flashcard).

import { h, mount, icon, speakJa } from '../core/dom.js';
import { state, save, logActivity } from '../core/store.js';
import { MODULES, loadContent } from '../content/modules.js';
import { setCrumbs } from '../main.js';

export async function collectVocab() {
  const out = [];
  const seen = new Set();
  const add = (v, src, mod) => {
    if (!v || !v.en || !v.ja) return;
    const key = v.en.toLowerCase() + '|' + v.ja;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ ...v, src, mod });
  };
  for (const m of MODULES) {
    for (const l of m.lessons) {
      if (l.src) { try { const L = await loadContent(l.src); (L.vocab || []).forEach(v => add(v, L.title, m.num)); } catch { /* yok */ } }
      (l.vocab || []).forEach(v => add(v, l.title, m.num));
    }
    (m.vocab || []).forEach(v => add(v, m.title, m.num));
    for (const p of [...(m.project?.src ? [m.project] : []), ...(m.projects || [])]) {
      try { const P = await loadContent(p.src); (P.vocab || []).forEach(v => add(v, P.title, m.num)); } catch { /* yok */ }
    }
  }
  return out;
}

export async function vocabView(root) {
  setCrumbs([['Japonca Sözlük']]);
  mount(root, h('div.page', h('div.empty', 'Kelimeler yükleniyor…')));
  const all = await collectVocab();
  let filter = 'all', q = '', mode = 'list';
  const listBox = h('div');
  const search = h('input', { type: 'search', placeholder: 'Ara: variable, 変数, değişken…', style: { maxWidth: '320px' }, oninput: () => { q = search.value.trim().toLowerCase(); render(); } });
  const modSel = h('select', { style: { width: 'auto' }, onchange: () => { filter = modSel.value; render(); } },
    h('option', { value: 'all' }, 'Tüm modüller'), MODULES.map(m => h('option', { value: String(m.num) }, `Modül ${m.num}: ${m.title}`)),
    h('option', { value: 'unknown' }, 'Henüz bilmediklerim'));
  const modeBtns = h('div.row', { style: { gap: '4px' } },
    h('button.btn.sm', { onclick: () => { mode = 'list'; render(); } }, 'Liste'),
    h('button.btn.sm', { onclick: () => { mode = 'cards'; render(); } }, 'Kelime kartları'));

  const filtered = () => all.filter(v => {
    if (filter === 'unknown' && state.vocab[v.en]?.known) return false;
    if (filter !== 'all' && filter !== 'unknown' && String(v.mod) !== filter) return false;
    if (q && ![v.en, v.tr, v.ja, v.kana, v.romaji].some(x => (x || '').toLowerCase().includes(q))) return false;
    return true;
  });

  function render() {
    for (const [i, b] of [...modeBtns.children].entries()) b.classList.toggle('primary', (i === 0) === (mode === 'list'));
    const items = filtered();
    const known = all.filter(v => state.vocab[v.en]?.known).length;
    if (mode === 'list') {
      mount(listBox,
        h('div.small.muted', { style: { margin: '6px 0 10px' } }, `${items.length} kelime · bildiklerin: ${known}/${all.length}`),
        items.length ? h('div.card', { style: { padding: '0', overflowX: 'auto' } }, h('table.vocab-table',
          h('thead', h('tr', h('th', 'English'), h('th', 'Türkçe'), h('th', '日本語'), h('th', 'Okunuş'), h('th', 'Modül'), h('th', 'Biliyorum'), h('th', ''))),
          h('tbody', items.map(v => {
            const cb = h('input', { type: 'checkbox', checked: !!state.vocab[v.en]?.known, 'aria-label': 'Biliyorum', onchange: () => { state.vocab[v.en] = { ...(state.vocab[v.en] || {}), known: cb.checked }; save(); } });
            return h('tr', h('td', v.en), h('td', v.tr), h('td.ja', v.ja), h('td.ro', `${v.kana && v.kana !== v.ja ? v.kana + ' · ' : ''}${v.romaji || ''}`), h('td.small.muted', `M${v.mod}`), h('td', cb),
              h('td', h('button.speak', { onclick: () => speakJa(v.kana || v.ja), 'aria-label': `${v.ja} seslendir` }, icon('volume'))));
          })))) : h('div.empty', 'Eşleşen kelime yok.'));
    } else renderCards(items);
  }

  function renderCards(items) {
    if (!items.length) { mount(listBox, h('div.empty', 'Kart yok — filtreyi değiştir.')); return; }
    // bilinmeyenler önce
    const deck = items.slice().sort((a, b) => (state.vocab[a.en]?.known ? 1 : 0) - (state.vocab[b.en]?.known ? 1 : 0));
    let i = 0, dir = 'ja';
    const card = h('div.flash');
    const counter = h('div.small.muted', { style: { textAlign: 'center', margin: '10px 0' } });
    function show() {
      const v = deck[i];
      card.classList.remove('flipped');
      const front = dir === 'ja' ? h('div', h('div.big', v.ja), h('div.small.muted', 'Anlamı ne? (Çevirmek için tıkla)')) : h('div', h('div', { style: { fontSize: '28px', fontWeight: '700' } }, v.tr), h('div.muted', v.en), h('div.small.muted', 'Japoncası? (Çevirmek için tıkla)'));
      const back = h('div', h('div.big', { style: { fontSize: '34px' } }, v.ja), h('div', { style: { fontSize: '18px', margin: '6px 0' } }, `${v.kana && v.kana !== v.ja ? v.kana + ' · ' : ''}${v.romaji}`), h('div', h('b', v.tr), ' — ', v.en), h('div.small.muted', { style: { marginTop: '6px' } }, v.src || ''));
      mount(card, h('div.flash-inner', { onclick: () => card.classList.toggle('flipped'), role: 'button', tabindex: '0', onkeydown: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); card.classList.toggle('flipped'); } } },
        h('div.flash-face', front), h('div.flash-face.back', back)));
      counter.textContent = `${i + 1} / ${deck.length}${state.vocab[v.en]?.known ? ' · ✓ biliyorsun' : ''}`;
    }
    const mark = (known) => {
      const v = deck[i];
      const s = state.vocab[v.en] || { reviews: 0 };
      state.vocab[v.en] = { ...s, known, reviews: (s.reviews || 0) + 1 };
      save();
      if (known) logActivity(0.2);
      i = (i + 1) % deck.length;
      show();
    };
    mount(listBox,
      h('div.row', { style: { justifyContent: 'center', margin: '10px 0' } },
        h('button.btn.sm', { onclick: () => { dir = dir === 'ja' ? 'tr' : 'ja'; show(); } }, 'Yönü değiştir (JA ⇄ TR)'),
        h('button.btn.sm', { onclick: () => speakJa(deck[i].kana || deck[i].ja) }, icon('volume'), 'Dinle')),
      card, counter,
      h('div.row', { style: { justifyContent: 'center' } },
        h('button.btn', { onclick: () => { i = (i - 1 + deck.length) % deck.length; show(); } }, icon('chevL')),
        h('button.btn.danger', { onclick: () => mark(false) }, 'Tekrar et'),
        h('button.btn.ok', { onclick: () => mark(true) }, 'Biliyorum'),
        h('button.btn', { onclick: () => { i = (i + 1) % deck.length; show(); } }, icon('chevR'))),
    );
    show();
  }

  mount(root, h('div.page',
    h('div.eyebrow', '日本語 · Teknik kelimeler'),
    h('h1', 'Japonca yazılım sözlüğü'),
    h('p.muted', { style: { maxWidth: '760px' } }, 'Japonya\'da bir geliştirme ekibinde en sık duyacağın teknik terimler. Katakana terimler (コンパイル, デバッグ) İngilizceden gelir; kanji terimler (変数, 関数, 実行) dokümantasyonda ve toplantılarda yaygındır. Kelimeler derslerle birlikte kademeli olarak eklenir.'),
    h('div.row', { style: { margin: '14px 0 4px' } }, search, modSel, h('span.spacer'), modeBtns),
    listBox,
  ));
  render();
}
