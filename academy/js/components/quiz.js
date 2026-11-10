// Quiz: her soru için seçenek; yanlışta "neden yanlış" açıklaması + tekrar deneme.
// Geçmek için tüm sorular doğru yanıtlanmalı. İlk deneme doğruluğu puan olarak kaydedilir.

import { h, mount, richEl, toast } from '../core/dom.js';
import { createEditor } from './editor.js';
import { save, logActivity } from '../core/store.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/**
 * @param {object} o
 * @param {Array} o.questions
 * @param {object} o.saved  { passed, firstTry: {i: bool}, attempts }
 * @param {()=>void} [o.onPass]
 */
export function createQuiz(o) {
  const { questions, saved } = o;
  saved.firstTry ??= {};
  const el = h('div.step-card');
  let idx = 0;
  const solved = new Set();

  function summary() {
    const ft = Object.values(saved.firstTry);
    const correct = ft.filter(Boolean).length;
    mount(el, h('div.card',
      h('div.eyebrow', 'Quiz tamamlandı'),
      h('h2', `İlk denemede ${correct}/${questions.length} doğru`),
      h('div.bar', { style: { margin: '10px 0 14px' } }, h('i', { style: { width: `${Math.round(correct / questions.length * 100)}%` } })),
      h('p.muted', correct === questions.length ? 'Kusursuz! Kavramları sağlam anlamışsın.' : 'Yanlış yaptığın soruların açıklamalarını tekrar okumak, kalıcı öğrenmenin en hızlı yolu.'),
      h('div.row', h('button.btn', { onclick: () => { idx = 0; solved.clear(); render(); } }, 'Quiz\'i tekrar çöz'), o.after || null),
    ));
  }

  function render() {
    if (idx >= questions.length) { summary(); return; }
    const q = questions[idx];
    const opts = shuffle(q.options.map((op, i) => ({ ...op, i })));
    let firstAnswer = saved.firstTry[idx] === undefined;
    const fb = h('div', { 'aria-live': 'polite' });
    const list = h('div.option-list', { role: 'group', 'aria-label': 'Seçenekler' });
    const nextBtn = h('button.btn.primary', { style: { display: 'none' }, onclick: () => { idx++; render(); } }, idx + 1 < questions.length ? 'Sonraki soru →' : 'Sonuçları gör');
    opts.forEach((op, k) => {
      const multi = op.t.includes('\n');
      const btn = h('button.option', { onclick: () => choose(op, btn) },
        h('span.key', String.fromCharCode(65 + k)),
        multi || q.code ? h('pre', op.t) : richEl('span', op.t),
      );
      list.append(btn);
    });
    function choose(op, btn) {
      if (firstAnswer) { saved.firstTry[idx] = !!op.correct; firstAnswer = false; }
      if (op.correct) {
        btn.classList.add('correct');
        for (const b of list.children) b.disabled = true;
        solved.add(idx);
        mount(fb, h('div.feedback.ok', h('h4', '✓ Doğru'), richEl('div', op.why || '')));
        nextBtn.style.display = '';
        nextBtn.focus();
        if (solved.size === questions.length || idx === questions.length - 1) checkPass();
      } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        mount(fb, h('div.feedback.bad', h('h4', '✗ Bu seçenek doğru değil'), richEl('div', op.why || ''), h('div.small.muted', { style: { marginTop: '6px' } }, 'Açıklamayı düşün ve başka bir seçenek dene.')));
      }
      save();
    }
    mount(el, h('div.card',
      h('div.row.between', h('div.eyebrow', `Soru ${idx + 1} / ${questions.length}`), h('div.step-dots', questions.map((_, i) => h('button', { class: i === idx ? 'cur' : i < idx ? 'seen' : '', 'aria-label': `Soru ${i + 1}`, onclick: () => { if (i <= idx || saved.passed) { idx = i; render(); } } })))),
      richEl('h3', q.q),
      q.code ? createEditor({ code: q.code, readonly: true, maxHeight: 300 }).el : null,
      list, fb,
      h('div.step-nav', nextBtn),
    ));
  }

  function checkPass() {
    // tüm sorular bu oturumda ya da önceden doğru çözülmüşse geçilir
    if (questions.every((_, i) => solved.has(i) || saved.passed)) {
      if (!saved.passed) {
        saved.passed = true;
        saved.passedAt = new Date().toISOString();
        save();
        logActivity();
        toast('Quiz geçildi!', 'ok');
        o.onPass && o.onPass();
      }
    }
  }

  saved.attempts = (saved.attempts || 0) + 1;
  render();
  return { el };
}
