// Etkileşimli kod alıştırması: görev, ipuçları, kontrol, açıklamalı geri bildirim.
// Yanlışta çözümü HEMEN vermez: ne olduğunu, neden yanlış olduğunu açıklar, ipucu önerir, tekrar denetir.

import { h, mount, richEl, icon, toast, esc } from '../core/dom.js';
import { createEditor } from './editor.js';
import { createRunner, errorBox } from './runner.js';
import { checkExercise } from '../core/checker.js';
import { state, save, logActivity } from '../core/store.js';
import { setCtx } from '../core/context.js';
import { formatError } from '../csharp/index.js';

const SOLUTION_AFTER = 3;

/**
 * @param {object} o
 * @param {object} o.ex     alıştırma tanımı
 * @param {object} o.saved  kalıcı durum nesnesi { passed, attempts, hintsUsed, code, solutionViewed }
 * @param {string} [o.label]
 * @param {()=>void} [o.onPass]
 * @param {HTMLElement} [o.footer]
 */
export function createExercise(o) {
  const { ex, saved } = o;
  saved.attempts ??= 0; saved.hintsUsed ??= 0;
  const editor = createEditor({
    code: saved.code ?? ex.starter ?? '',
    onChange: (c) => { saved.code = c; save(); },
    onRun: () => runner.run(),
    maxHeight: 460,
  });
  const runner = createRunner({ editor, stdin: ex.stdin ?? '', stepper: true });
  const checksList = h('ul.checks');
  const feedback = h('div', { 'aria-live': 'polite' });
  const hintsBox = h('div');
  const solutionBox = h('div');

  function renderChecks(results) {
    mount(checksList, (ex.checks || []).map((c, i) => {
      const r = results?.[i];
      const mark = !r ? '○' : r.ok ? '✓' : '✗';
      const color = !r ? 'var(--faint)' : r.ok ? 'var(--ok)' : 'var(--err)';
      return h('li', h('span.i', { style: { color } }, mark), h('span', c.msg || defaultCheckLabel(c)));
    }));
    if (!(ex.checks || []).length) checksList.append(h('li', 'Kod hatasız çalışmalı'));
  }

  function renderHints() {
    mount(hintsBox, (ex.hints || []).slice(0, saved.hintsUsed).map((t, i) => h('div.hint', h('b', `İpucu ${i + 1}: `), richEl('span', t))));
    hintBtn.disabled = saved.hintsUsed >= (ex.hints || []).length;
    hintBtn.lastChild.textContent = saved.hintsUsed >= (ex.hints || []).length ? 'İpuçları bitti' : `İpucu al (${saved.hintsUsed}/${(ex.hints || []).length})`;
  }

  function revealHint() {
    if (saved.hintsUsed >= (ex.hints || []).length) return false;
    saved.hintsUsed++;
    state.stats.hintsUsed++;
    save();
    renderHints();
    return true;
  }

  function renderSolutionGate() {
    solutionBox.innerHTML = '';
    if (saved.passed && !saved.solutionViewed) {
      solutionBox.append(h('button.btn.sm.ghost', { onclick: showSolution }, 'Örnek çözümü karşılaştır'));
      return;
    }
    if (saved.solutionViewed) { showSolution(true); return; }
    const fails = saved.attempts - (saved.passed ? 1 : 0);
    if (fails >= SOLUTION_AFTER) {
      solutionBox.append(h('div.small.muted', { style: { marginTop: '8px' } }, `${fails} deneme yaptın. Takıldıysan örnek çözümü görebilirsin — ama önce ipuçlarını ve eğitmeni denemeni öneririm.`),
        h('button.btn.sm', { style: { marginTop: '6px' }, onclick: () => { if (confirm('Çözümü görmek istediğine emin misin? En iyi öğrenme, kendin çözdüğünde olur.')) showSolution(); } }, 'Çözümü göster'));
    } else if (saved.attempts > 0 && !saved.passed) {
      solutionBox.append(h('div.small.muted', { style: { marginTop: '8px' } }, `Çözüm, ${SOLUTION_AFTER - fails} başarısız denemeden sonra açılabilir. Önce kendin dene!`));
    }
  }

  function showSolution(silent) {
    if (!silent) { saved.solutionViewed = true; save(); }
    const ed = createEditor({ code: ex.solution, readonly: true, maxHeight: 360 });
    mount(solutionBox, h('div.small.muted', { style: { margin: '10px 0 6px' } }, 'Örnek çözüm (tek doğru çözüm bu değil — seninki de farklı ama doğru olabilir):'), ed.el,
      saved.passed ? null : h('div.small.muted', { style: { marginTop: '6px' } }, 'Şimdi kopyalamak yerine kendi kodunu düzeltmeyi dene; anlamadığın satırı eğitmene sor.'));
  }

  function check() {
    const code = editor.getValue();
    saved.attempts++;
    state.stats.exerciseAttempts++;
    const res = checkExercise(code, ex);
    setCtx({ lastCheck: res, lastRun: { code, result: res.run } });
    runner.clear();
    if (res.run) {
      // çıktıyı konsolda da göster
      runner.run();
    }
    renderChecks(res.results);
    if (res.passed) {
      const first = !saved.passed;
      saved.passed = true;
      saved.passedAt = new Date().toISOString();
      state.stats.exercisePasses++;
      if (saved.attempts === 1) state.stats.firstTryPasses++;
      save();
      if (first) logActivity();
      mount(feedback, h('div.feedback.ok',
        h('h4', saved.attempts === 1 ? '🎉 Mükemmel — ilk denemede doğru!' : '✅ Doğru! Alıştırmayı geçtin.'),
        ex.explain ? richEl('div', ex.explain) : null,
        saved.hintsUsed ? h('div.small.muted', { style: { marginTop: '6px' } }, `${saved.hintsUsed} ipucu kullandın, ${saved.attempts} denemede çözdün.`) : null,
      ));
      if (first) toast('Alıştırma tamamlandı!', 'ok');
      renderSolutionGate();
      o.onPass && o.onPass();
      return;
    }
    save();
    const fb = res.feedback || { title: 'Henüz değil', why: 'Kontrollerden biri geçmedi.' };
    const box = h('div.feedback.bad', h('h4', `Henüz değil — ${fb.title}`));
    if (fb.kind === 'error') {
      box.append(h('div.small', { style: { fontFamily: 'var(--mono)', color: 'var(--err)', margin: '2px 0 6px' } }, formatError(fb.error)), richEl('div', fb.why), h('div', { style: { marginTop: '6px' }, html: '💡 ' + fb.fix }));
    } else if (fb.kind === 'output') {
      box.append(h('div', { html: fb.why }));
      if (fb.msg) box.append(h('div.small.muted', { style: { marginTop: '4px' } }, 'Gereklilik: ' + fb.msg));
      if (fb.harness) box.append(h('div.small.muted', { style: { marginTop: '4px' } }, 'Test kodu: ', h('code.inline', fb.harness.trim())));
      if (fb.stdin !== undefined) box.append(h('div.small.muted', { style: { marginTop: '4px' } }, 'Bu test için girdi: ', h('code.inline', JSON.stringify(fb.stdin))));
      box.append(h('div.diff',
        h('div', h('div.lbl', 'Beklenen'), h('pre', fb.expected)),
        h('div', h('div.lbl', 'Senin çıktın'), h('pre', fb.actual || '(boş)')),
      ));
    } else {
      box.append(richEl('div', fb.why));
    }
    const nextHint = saved.hintsUsed < (ex.hints || []).length;
    box.append(h('div.row', { style: { marginTop: '10px' } },
      nextHint ? h('button.btn.sm', { onclick: () => { revealHint(); } }, icon('bulb'), 'İpucu al') : null,
      h('button.btn.sm', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'review' } })) }, icon('bot'), 'Eğitmen kodumu incelesin'),
      h('span.small.muted', 'Düzelt ve tekrar dene.'),
    ));
    mount(feedback, box);
    renderSolutionGate();
  }

  const hintBtn = h('button.btn.sm', { onclick: revealHint }, icon('bulb'), h('span', 'İpucu al'));
  const checkBtn = h('button.btn.ok', { onclick: check }, icon('check'), 'Kontrol et');
  const resetBtn = h('button.btn.sm.ghost', { onclick: () => { if (confirm('Kodu başlangıç haline döndür?')) { editor.setValue(ex.starter ?? ''); saved.code = ex.starter ?? ''; save(); } } }, icon('reset'), 'Sıfırla');

  const status = saved.passed ? h('span.badge.ok', '✓ Geçildi') : saved.attempts ? h('span.badge.warn', `${saved.attempts} deneme`) : h('span.badge', 'Çözülmedi');
  const left = h('div.ex-side.stack',
    h('div.card',
      h('div.row.between', h('div.eyebrow', o.label || 'Alıştırma'), status),
      h('h3', { style: { marginTop: '6px' } }, ex.title || 'Görev'),
      richEl('div', ex.prompt, 'prose'),
      ex.stdin ? h('div.small.muted', 'Bu alıştırma girdi kullanır: ', h('code.inline', JSON.stringify(ex.stdin)), ' (Girdi sekmesinden değiştirip deneyebilirsin; kontrol farklı girdilerle de yapılabilir.)') : null,
      h('div.small.muted', { style: { marginTop: '8px' } }, 'Kontrol listesi:'), checksList,
      h('div.row', { style: { marginTop: '10px' } }, hintBtn),
      hintsBox,
    ),
    feedback,
    solutionBox,
    o.footer || null,
  );
  const right = h('div.stack', editor.el, h('div.row', checkBtn, h('span.small.muted', 'veya önce ▶ Çalıştır ile dene'), h('span.spacer'), resetBtn), runner.el);
  const el = h('div.ex-layout', left, right);

  renderChecks(null);
  renderHints();
  renderSolutionGate();
  if (saved.passed) mount(feedback, h('div.feedback.ok', h('h4', '✅ Bu alıştırmayı daha önce geçtin.'), h('div.small', 'İstersen farklı bir çözüm dene ve tekrar kontrol et.')));

  setCtx({ exercise: ex, exerciseState: saved, getCode: () => editor.getValue(), revealHint });
  return { el, editor, runner, check };
}

function defaultCheckLabel(c) {
  if (c.type === 'output') return 'Çıktı beklenenle aynı olmalı';
  if (c.type === 'harness') return 'Fonksiyon testleri geçmeli';
  if (c.type === 'code') return 'Gerekli yapı kullanılmalı';
  return 'İstenmeyen yapı olmamalı';
}
