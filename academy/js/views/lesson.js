// Ders oynatıcı: Öğren (kartlar) → Alıştırma → Quiz → Meydan okuma → Ek pratik → Özet

import { h, mount, richEl, icon, toast, speakJa, esc } from '../core/dom.js';
import { findLessonMeta, findModule, loadContent, allLessons } from '../content/modules.js';
import { state, lesson as lessonState, save, logActivity } from '../core/store.js';
import { lessonUnlocked, lessonDone } from '../core/progress.js';
import { createEditor } from '../components/editor.js';
import { createRunner } from '../components/runner.js';
import { createExercise } from '../components/exercise.js';
import { createQuiz } from '../components/quiz.js';
import { setCtx } from '../core/context.js';
import { runCSharp } from '../csharp/index.js';
import { normalizeOutput } from '../core/checker.js';
import { navigate, setCrumbs } from '../main.js';

const KIND_LABEL = {
  concept: ['Kavram', 'k-concept'], analogy: ['Benzetme', 'k-analogy'], visual: ['Görsel', 'k-visual'], code: ['Kod örneği', 'k-code'],
  warning: ['Dikkat', 'k-warning'], cad: ['3D / CAD bağlantısı', 'k-cad'], predict: ['Tahmin et', 'k-predict'],
};

export async function lessonView(root, { id }, query) {
  const meta = findLessonMeta(id);
  if (!meta) { mount(root, h('div.page', h('div.empty', 'Ders bulunamadı. ', h('a', { href: '#/curriculum' }, 'Müfredata dön')))); return; }
  const mod = findModule(meta.module);
  setCrumbs([[`Modül ${mod.num}`, `#/module/${mod.id}`], [meta.title]]);
  if (!meta.src) return outlineLesson(root, meta, mod);
  if (!lessonUnlocked(id)) return lockedLesson(root, meta, mod);

  mount(root, h('div.page', h('div.empty', 'Ders yükleniyor…')));
  let L;
  try { L = await loadContent(meta.src); }
  catch (e) { mount(root, h('div.page', h('div.empty', 'Ders içeriği yüklenemedi: ' + e.message))); return; }

  const S = lessonState(id);
  state.lastLocation = { type: 'lesson', id };
  save();
  setCtx({ lesson: L, lessonMeta: meta, page: 'lesson', exercise: null, getCode: null });

  const learnDone = () => S.stepMax >= L.steps.length - 1;
  const phases = [
    { k: 'learn', label: 'Öğren', unlocked: () => true, done: learnDone },
    { k: 'exercise', label: 'Alıştırma', unlocked: () => learnDone() || S.exercise.passed, done: () => S.exercise.passed },
    { k: 'quiz', label: 'Quiz', unlocked: () => S.exercise.passed, done: () => S.quiz.passed },
    { k: 'challenge', label: 'Meydan okuma', unlocked: () => S.quiz.passed, done: () => S.challenge.passed || S.challenge.skipped },
    { k: 'extras', label: 'Ek pratik', unlocked: () => S.exercise.passed, done: () => Object.values(S.extras || {}).some(e => e.passed) },
    { k: 'summary', label: 'Özet', unlocked: () => S.quiz.passed, done: () => S.completed },
  ];
  if (state.settings.freeNav) for (const p of phases) p.unlocked = () => true;

  let phase = query.get('phase') || (S.completed ? 'summary' : S.quiz.passed ? 'challenge' : S.exercise.passed ? 'quiz' : learnDone() && S.stepCur >= L.steps.length - 1 ? 'exercise' : 'learn');
  if (!phases.find(p => p.k === phase)?.unlocked()) phase = 'learn';
  let stepIdx = Math.min(S.stepCur ?? 0, L.steps.length - 1);

  const phaseBar = h('div.phases', { role: 'tablist' });
  const body = h('div.lesson-body');
  const lessonList = allLessons().filter(l => l.interactive);
  const pos = lessonList.findIndex(l => l.id === id);

  const head = h('div.lesson-head',
    h('div.eyebrow', `Modül ${mod.num} · Ders ${pos + 1 - lessonList.findIndex(l => l.module === mod.id)} · ~${L.minutes || meta.minutes} dk`),
    h('h1', L.title),
    h('div.tri', h('span', L.titleEn), h('span.jp', L.titleJa), S.completed ? h('span.badge.ok', '✓ Tamamlandı') : null),
    phaseBar,
  );
  mount(root, h('div', head, body));

  function completeIfReady() {
    if (!S.completed && S.exercise.passed && S.quiz.passed) {
      S.completed = true;
      S.completedAt = new Date().toISOString();
      save();
      logActivity(2);
      toast('🎓 Ders tamamlandı! Sonraki ders açıldı.', 'ok');
    }
  }

  function renderPhases() {
    mount(phaseBar, phases.map((p, i) => {
      const un = p.unlocked();
      return h('button.phase', {
        class: [p.k === phase ? 'active' : '', p.done() ? 'done' : '', un ? '' : 'locked'].join(' '),
        role: 'tab', 'aria-selected': p.k === phase ? 'true' : 'false', disabled: !un,
        title: un ? '' : lockReason(p.k),
        onclick: () => { if (un) { phase = p.k; render(); } },
      }, h('span.n', p.done() ? '✓' : String(i + 1)), p.label, un ? null : icon('lock'));
    }));
  }
  function lockReason(k) {
    return { exercise: 'Önce tüm kartları gör', quiz: 'Önce alıştırmayı çöz', challenge: 'Önce quiz\'i geç', extras: 'Önce alıştırmayı çöz', summary: 'Önce quiz\'i geç' }[k] || '';
  }

  function render() {
    renderPhases();
    setCtx({ phase, exercise: null, getCode: null, revealHint: null, openExtra: (d) => { phase = 'extras'; render(); highlightExtra(d); } });
    history.replaceState(null, '', `#/lesson/${id}?phase=${phase}`);
    root.closest('.view')?.scrollTo({ top: 0 });
    if (phase === 'learn') return renderLearn();
    if (phase === 'exercise') return renderExercise();
    if (phase === 'quiz') return renderQuiz();
    if (phase === 'challenge') return renderChallenge();
    if (phase === 'extras') return renderExtras();
    if (phase === 'summary') return renderSummary();
  }

  // ---------- Öğren ----------
  function renderLearn() {
    const st = L.steps[stepIdx];
    S.stepCur = stepIdx;
    if (stepIdx > S.stepMax) S.stepMax = stepIdx;
    save();
    setCtx({ stepTitle: st.title });
    const [kl, kc] = KIND_LABEL[st.kind] || ['Kart', 'k-concept'];
    const dots = h('div.step-dots', L.steps.map((s, i) => h('button', {
      class: i === stepIdx ? 'cur' : i <= S.stepMax ? 'seen' : '',
      title: s.title, 'aria-label': `Kart ${i + 1}: ${s.title}`,
      onclick: () => { if (i <= S.stepMax + 1 || state.settings.freeNav) { stepIdx = i; renderLearn(); } },
    })));
    const isLast = stepIdx === L.steps.length - 1;
    const nav = h('div.step-nav',
      h('button.btn', { disabled: stepIdx === 0, onclick: () => { stepIdx--; renderLearn(); } }, icon('chevL'), 'Önceki'),
      isLast
        ? h('button.btn.primary', { onclick: () => { S.stepMax = Math.max(S.stepMax, stepIdx); save(); phase = 'exercise'; render(); } }, 'Alıştırmaya geç', icon('chevR'))
        : h('button.btn.primary', { onclick: () => { stepIdx++; renderLearn(); } }, 'Devam', icon('chevR')),
      h('span.small.muted', `${stepIdx + 1} / ${L.steps.length}`),
      h('span.spacer'),
      h('button.btn.sm.ghost', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'explain' } })) }, icon('bot'), 'Bu kartı daha basit anlat'),
    );
    const headEl = h('div', h('div.row.between', h('div.step-kind', { class: kc }, kl), dots), richEl('h2', st.title));

    let content;
    if (st.kind === 'code') content = codeStep(st, headEl, nav);
    else if (st.kind === 'predict') content = predictStep(st, headEl, nav);
    else if (st.kind === 'visual') {
      content = h('div.step-card', h('div.card', headEl, h('div.visual', { html: st.svg || st.html }), st.caption ? richEl('div', st.caption, 'prose') : null, nav));
      content.querySelector('.visual').style.marginBottom = '12px';
    } else {
      content = h('div.step-card', h('div.card', headEl, richEl('div', st.body, 'prose'), nav));
    }
    if (renderLearn.first !== false && stepIdx === 0 && S.stepMax === 0) {
      content.prepend(h('div.card.flat', { style: { marginBottom: '14px' } },
        h('div.eyebrow', 'Bu derste öğreneceklerin'),
        h('ul', { style: { margin: '8px 0 0', paddingLeft: '1.2em' } }, (L.objectives || []).map(o => h('li.muted', o))),
      ));
    }
    mount(body, content);
  }

  function codeStep(st, headEl, nav) {
    const explainPanel = h('div.explain-panel', h('span.muted', st.explain && Object.keys(st.explain).length ? 'Koddaki bir satıra (veya satır numarasına) tıkla — açıklaması burada görünür. Hepsini aşağıda da görebilirsin.' : ''));
    let editor;
    const showLine = (n) => {
      editor.setSelectedLine(n);
      const t = st.explain?.[n];
      if (t) mount(explainPanel, h('span.ln-no', `Satır ${n}`), richEl('span', t));
      for (const li of expList.children) li.style.background = +li.dataset.n === n ? 'var(--accent-soft)' : '';
    };
    editor = createEditor({ code: st.code, readonly: !st.editable, explain: st.explain, onLineClick: showLine, onRun: () => runner && runner.run(), maxHeight: 440 });
    const expList = h('ul.lesson-list', { style: { marginTop: '10px' } });
    for (const [n, t] of Object.entries(st.explain || {}).sort((a, b) => a[0] - b[0])) {
      expList.append(h('li', { dataset: { n }, style: { padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--border)' }, onclick: () => showLine(+n) },
        h('span.ln-no', { style: { font: '600 12px var(--mono)', color: 'var(--accent)', marginRight: '8px' } }, `${n}`), richEl('span', t)));
    }
    const runner = st.runnable !== false ? createRunner({ editor, stdin: st.stdin ?? '', stepper: !!st.stepper }) : null;
    if (st.editable) setCtx({ getCode: () => editor.getValue() });
    else setCtx({ getCode: () => st.code });
    const left = h('div.card', headEl,
      st.note ? h('div.callout', { style: { marginTop: '0' } }, richEl('span', st.note)) : null,
      explainPanel,
      Object.keys(st.explain || {}).length ? h('details', { open: true }, h('summary.small.muted', { style: { cursor: 'pointer', marginTop: '10px' } }, 'Satır satır açıklamalar'), expList) : null,
      nav);
    const tryBtn = !st.editable ? h('a.btn.sm.ghost', { href: '#/playground', onclick: () => { state.playground.code = st.code; state.playground.stdin = st.stdin ?? ''; save(); } }, icon('code'), 'Kod alanında değiştir') : null;
    const right = h('div.stack', editor.el, runner ? runner.el : null, tryBtn ? h('div.row', tryBtn, st.editable ? null : h('span.small.muted', 'Bu örneği değiştirip denemek için')) : null);
    return h('div.step-wrap.with-code', left, right);
  }

  function predictStep(st, headEl, nav) {
    const editor = createEditor({ code: st.code, readonly: true, maxHeight: 320 });
    const fb = h('div');
    const out = h('div');
    const list = h('div.option-list');
    let answered = false;
    st.options.forEach((t, i) => {
      const b = h('button.option', { onclick: () => {
        if (answered) return;
        if (i === st.answer) {
          answered = true;
          b.classList.add('correct');
          for (const x of list.children) x.disabled = true;
          mount(fb, h('div.feedback.ok', h('h4', '✓ Doğru tahmin!'), richEl('div', st.explain || '')));
        } else {
          b.classList.add('wrong'); b.disabled = true;
          mount(fb, h('div.feedback.bad', h('h4', 'Tam değil — tekrar düşün'), h('div.small', 'Kodu satır satır, bilgisayar gibi takip et. Her satır neyi yazdırıyor, satır sonu ekliyor mu?')));
        }
      } }, h('span.key', String.fromCharCode(65 + i)), h('pre', t));
      list.append(b);
    });
    const runBtn = h('button.btn.sm', { onclick: () => {
      const r = runCSharp(st.code, { stdin: st.stdin ?? '' });
      mount(out, h('div.small.muted', { style: { margin: '8px 0 4px' } }, 'Gerçek çıktı:'), h('pre.expected', r.error ? r.error.message : normalizeOutput(r.stdout)));
    } }, icon('play'), 'Çalıştır ve gör');
    setCtx({ getCode: () => st.code });
    return h('div.step-wrap.with-code', h('div.card', headEl, h('p.muted', 'Önce tahmin et, sonra çalıştırıp kontrol et. Tahmin etmek, kodu "bilgisayar gibi okumayı" öğretir.'), list, fb, nav), h('div.stack', editor.el, h('div.row', runBtn), out));
  }

  // ---------- Alıştırma ----------
  function renderExercise() {
    const ex = createExercise({
      ex: L.exercise, saved: S.exercise, label: 'Zorunlu alıştırma',
      onPass: () => { completeIfReady(); renderPhases(); nextBtn.style.display = ''; },
    });
    const nextBtn = h('button.btn.primary', { style: { display: S.exercise.passed ? '' : 'none' }, onclick: () => { phase = 'quiz'; render(); } }, 'Quiz\'e geç', icon('chevR'));
    mount(body, h('div',
      h('p.muted', { style: { maxWidth: '760px' } }, 'Dersi bitirmek için bu alıştırmayı çözmelisin. Yanlış yaparsan neyin yanlış olduğunu açıklayacağım — çözümü hemen vermeyeceğim.'),
      ex.el,
      h('div.step-nav', nextBtn)));
  }

  // ---------- Quiz ----------
  function renderQuiz() {
    const after = h('button.btn.primary', { onclick: () => { phase = 'challenge'; render(); } }, 'Meydan okumaya geç', icon('chevR'));
    const q = createQuiz({ questions: L.quiz, saved: S.quiz, onPass: () => { completeIfReady(); renderPhases(); }, after });
    mount(body, q.el);
  }

  // ---------- Meydan okuma ----------
  function renderChallenge() {
    const footer = h('div.row', { style: { marginTop: '12px' } },
      S.challenge.passed ? null : h('button.btn.sm.ghost', { onclick: () => { S.challenge.skipped = true; save(); phase = 'summary'; render(); } }, 'Şimdilik atla (isteğe bağlı)'),
      h('button.btn.sm', { onclick: () => { phase = 'summary'; render(); } }, 'Özete git', icon('chevR')));
    const ex = createExercise({ ex: L.challenge, saved: S.challenge, label: 'Meydan okuma (isteğe bağlı)', onPass: () => { renderPhases(); logActivity(); }, footer });
    mount(body, h('div', h('p.muted', { style: { maxWidth: '760px' } }, 'Bu görev biraz daha zor ve dersi tamamlamak için zorunlu değil — ama gerçek öğrenme burada olur.'), ex.el));
  }

  // ---------- Ek pratik ----------
  let wantDiff = null;
  function highlightExtra(d) { wantDiff = d; renderExtras(); }
  function renderExtras() {
    const extras = L.extras || [];
    if (!extras.length) { mount(body, h('div.empty', 'Bu ders için ek alıştırma yok.')); return; }
    S.extras ??= {};
    const diffLabel = d => ['', 'Kolay', 'Orta', 'Zor'][d] || 'Orta';
    let sel = wantDiff ? Math.max(0, extras.findIndex(x => (x.difficulty || 2) >= wantDiff)) : 0;
    wantDiff = null;
    const holder = h('div');
    const tabs = h('div.tabs', { style: { marginBottom: '14px' } });
    function show(i) {
      sel = i;
      for (const [k, b] of [...tabs.children].entries()) b.classList.toggle('active', k === i);
      const x = extras[i];
      S.extras[i] ??= { passed: false, attempts: 0, hintsUsed: 0, code: null };
      const ex = createExercise({ ex: x, saved: S.extras[i], label: `Ek pratik · ${diffLabel(x.difficulty)}`, onPass: () => { renderPhases(); show(i); } });
      mount(holder, ex.el);
    }
    extras.forEach((x, i) => tabs.append(h('button', { onclick: () => show(i) }, `${S.extras[i]?.passed ? '✓ ' : ''}${x.title || 'Alıştırma ' + (i + 1)} · ${diffLabel(x.difficulty)}`)));
    mount(body, h('div', h('p.muted', 'Ek pratik alıştırmaları zorluk seviyesine göre sıralı. AI eğitmen performansına göre sana uygun olanı önerir.'), tabs, holder));
    show(sel);
  }

  // ---------- Özet ----------
  function renderSummary() {
    completeIfReady();
    const next = lessonList[pos + 1];
    const vocab = L.vocab || [];
    mount(body, h('div.stack', { style: { maxWidth: '980px' } },
      S.completed ? h('div.feedback.ok', h('h4', '🎓 Bu dersi tamamladın'), h('div', 'Alıştırma ve quiz geçildi. İlerlemen kaydedildi.')) :
        h('div.feedback.info', h('h4', 'Neredeyse bitti'), h('div', `Dersi tamamlamak için: ${S.exercise.passed ? '' : 'alıştırmayı çöz, '}${S.quiz.passed ? '' : 'quiz\'i geç'}.`)),
      h('div.card', h('h3', 'Özet'), h('ul.prose', (L.summary || []).map(s => richEl('li', s)))),
      vocab.length ? h('div.card',
        h('div.row.between', h('h3', { style: { margin: 0 } }, 'Japonca teknik kelimeler'), h('a.small', { href: '#/vocab' }, 'Tüm sözlük →')),
        h('div', { style: { overflowX: 'auto' } }, h('table.vocab-table',
          h('thead', h('tr', h('th', 'English'), h('th', 'Türkçe'), h('th', '日本語'), h('th', 'Okunuş'), h('th', ''))),
          h('tbody', vocab.map(v => h('tr', h('td', v.en), h('td', v.tr), h('td.ja', v.ja), h('td.ro', `${v.kana && v.kana !== v.ja ? v.kana + ' · ' : ''}${v.romaji}`), h('td', h('button.speak', { title: 'Seslendir', 'aria-label': `${v.ja} seslendir`, onclick: () => speakJa(v.kana || v.ja) }, icon('volume')))))),
        ))) : null,
      h('div.row',
        next ? h('button.btn.primary', { disabled: !S.completed && !state.settings.freeNav, onclick: () => navigate(`#/lesson/${next.id}`) }, `Sonraki ders: ${next.title}`, icon('chevR'))
          : h('a.btn.primary', { href: '#/projects' }, 'Projelere geç', icon('chevR')),
        h('a.btn', { href: `#/module/${mod.id}` }, 'Modül sayfası'),
        L.extras?.length ? h('button.btn', { onclick: () => { phase = 'extras'; render(); } }, 'Ek pratik yap') : null,
      ),
    ));
  }

  render();
}

function lockedLesson(root, meta, mod) {
  const list = allLessons().filter(l => l.interactive);
  const i = list.findIndex(l => l.id === meta.id);
  const prev = list[i - 1];
  mount(root, h('div.page', h('div.card', { style: { maxWidth: '640px', margin: '40px auto', textAlign: 'center' } },
    icon('lock', 'ico'),
    h('h2', { style: { marginTop: '10px' } }, meta.title),
    h('p.muted', 'Bu ders kilitli. Kavramlar birbirinin üzerine inşa edildiği için önce önceki dersi tamamlamalısın (alıştırma + quiz).'),
    prev ? h('a.btn.primary', { href: `#/lesson/${prev.id}` }, `Önceki ders: ${prev.title}`) : null,
    h('p.small.muted', { style: { marginTop: '14px' } }, 'Serbest gezinmeyi Ayarlar\'dan açabilirsin (önerilmez).'),
  )));
}

function outlineLesson(root, meta, mod) {
  const S = lessonState(meta.id);
  S.selfChecks ??= {};
  setCtx({ lesson: null, lessonMeta: meta, page: 'outline', stepTitle: meta.title, exercise: null, getCode: null });
  state.lastLocation = { type: 'lesson', id: meta.id };
  save();
  const objectives = meta.objectives || [];
  const doneBtn = h('button.btn.ok', { onclick: () => {
    S.completed = !S.completed; S.selfStudy = true; S.completedAt = new Date().toISOString(); save();
    if (S.completed) { logActivity(); toast('Ders kendi çalışmanla tamamlandı olarak işaretlendi.', 'ok'); }
    render();
  } });
  function render() {
    const allChecked = objectives.length && objectives.every((_, i) => S.selfChecks[i]);
    doneBtn.disabled = !allChecked && !S.completed;
    doneBtn.textContent = S.completed ? '✓ Tamamlandı (geri al)' : 'Kendi çalışmamla tamamladım';
  }
  const checks = objectives.map((o, i) => {
    const cb = h('input', { type: 'checkbox', checked: !!S.selfChecks[i], onchange: () => { S.selfChecks[i] = cb.checked; save(); lbl.classList.toggle('done', cb.checked); render(); } });
    const lbl = h('label.check', { class: S.selfChecks[i] ? 'done' : '' }, cb, h('span', o));
    return lbl;
  });
  const search = encodeURIComponent(`C# ${meta.titleEn}`);
  mount(root, h('div.page',
    h('div.eyebrow', `Modül ${mod.num} · ${mod.title}`),
    h('h1', meta.title),
    h('div.tri', h('span', meta.titleEn), h('span.jp', meta.titleJa), h('span', `~${meta.minutes || 60} dk`), S.completed ? h('span.badge.ok', '✓ Tamamlandı') : null),
    h('div.callout', { style: { marginTop: '16px' } }, h('b', 'Ders taslağı. '), 'Bu modülün tam etkileşimli içeriği (kartlar, otomatik kontrollü alıştırmalar, quiz) henüz yazılmadı. Şimdilik bu sayfa öğrenme hedeflerini, konuları ve kelimeleri verir; dersi AI eğitmenle, kod alanında ve resmi dokümantasyonla çalışabilirsin. Hedefleri kendin doğrulayıp dersi tamamlandı işaretleyebilirsin.'),
    h('div.grid.c2', { style: { marginTop: '16px' } },
      h('div.card', h('h3', 'Özet'), richEl('p', meta.summary || '', 'prose'),
        meta.topics?.length ? h('div', h('div.small.muted', { style: { margin: '8px 0 6px' } }, 'Konular'), h('div.row', meta.topics.map(t => h('span.badge', t)))) : null,
        meta.cadLink ? h('div.callout.tip', h('b', '3D / CAD bağlantısı: '), richEl('span', meta.cadLink)) : null,
      ),
      h('div.card', h('h3', 'Öğrenme hedefleri — kendini kontrol et'), h('p.small.muted', 'Her hedefi gerçekten yapabildiğinde işaretle. Hepsi işaretlenince dersi tamamlayabilirsin.'), checks, h('div', { style: { marginTop: '10px' } }, doneBtn)),
    ),
    h('div.card', { style: { marginTop: '14px' } },
      h('h3', 'Nasıl çalışmalı?'),
      h('div.row',
        h('button.btn.primary', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'teach', topic: meta } })) }, icon('bot'), 'AI eğitmenle bu dersi çalış'),
        h('a.btn', { href: '#/playground' }, icon('code'), 'Kod alanında dene'),
        h('a.btn', { href: `https://learn.microsoft.com/tr-tr/search/?terms=${search}`, target: '_blank', rel: 'noopener' }, icon('ext'), 'Microsoft Learn\'de ara'),
      ),
    ),
    meta.vocab?.length ? h('div.card', { style: { marginTop: '14px' } }, h('h3', 'Japonca kelimeler'),
      h('table.vocab-table', h('tbody', meta.vocab.map(v => h('tr', h('td', v.en), h('td', v.tr), h('td.ja', v.ja), h('td.ro', v.romaji), h('td', h('button.speak', { onclick: () => speakJa(v.kana || v.ja), 'aria-label': 'Seslendir' }, icon('volume')))))))) : null,
  ));
  render();
}
