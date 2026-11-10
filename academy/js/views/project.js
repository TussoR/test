// Projeler listesi ve proje oynatıcı (adım adım, alıştırmalı veya kontrol listeli).

import { h, mount, richEl, icon, toast, speakJa } from '../core/dom.js';
import { allProjects, findProjectMeta, loadContent } from '../content/modules.js';
import { state, project as projectState, projectStep, save, logActivity } from '../core/store.js';
import { projectUnlocked, projectDone, projectPrereqText } from '../core/progress.js';
import { createEditor } from '../components/editor.js';
import { createRunner } from '../components/runner.js';
import { createExercise } from '../components/exercise.js';
import { setCtx } from '../core/context.js';
import { setCrumbs } from '../main.js';
import { mountDemo, DEMO_INFO } from '../demos/index.js';

export async function projectsView(root) {
  setCrumbs([['Projeler']]);
  const list = allProjects();
  const cards = await Promise.all(list.map(async (p) => {
    let P = null;
    try { P = await loadContent(p.src); } catch { /* içerik henüz yok */ }
    const S = state.projects[p.id];
    const total = P?.steps?.length || 0;
    const done = S ? Object.values(S.steps).filter(s => s.done).length : 0;
    const un = projectUnlocked(p.id);
    return h('a.card.mod-card', { href: `#/project/${p.id}` },
      h('div.row.between', h('span.num', p.module === 'm1' ? 'MODÜL 1 PROJESİ' : `PROJE ${p.id.slice(1)}`), h('span.row', { style: { gap: '6px' } },
        P ? h('span.badge', P.environment === 'browser' ? '🌐 Tarayıcıda' : '🖥 Visual Studio') : null,
        projectDone(p.id) ? h('span.badge.ok', '✓') : un ? null : h('span.badge.lock', icon('lock'), 'kilitli'))),
      h('h3', { style: { margin: '6px 0 2px' } }, P?.title || p.title),
      h('div.tri', h('span', P?.titleEn || p.titleEn || ''), h('span.jp', P?.titleJa || p.titleJa || '')),
      P ? richEl('div', (P.summary || '').replace(/<\/?p>/g, ' ').slice(0, 260) + '…', 'small muted') : h('p.small.muted', 'İçerik yükleniyor / hazırlanıyor.'),
      h('div.row', { style: { margin: '8px 0' } }, (P?.skills || []).slice(0, 5).map(s => h('span.badge', s))),
      total ? h('div.bar', { class: done === total ? 'ok' : '' }, h('i', { style: { width: `${Math.round(done / total * 100)}%` } })) : null,
      total ? h('div.small.muted', { style: { marginTop: '4px' } }, `${done}/${total} adım`) : null,
    );
  }));
  mount(root, h('div.page',
    h('div.eyebrow', 'Portfolyo'),
    h('h1', 'Projeler'),
    h('p.muted', { style: { maxWidth: '780px' } }, 'Projeler, öğrendiklerini gerçek uygulamalarda birleştirir ve iş başvurusunda gösterebileceğin bir portfolyo oluşturur. Tarayıcı projeleri tamamen burada çalışır; masaüstü (WinForms) projelerinde arayüz kodunu Visual Studio\'da yazarsın, ama geometri/mantık kısımlarını burada otomatik kontrollü alıştırmalarla test edebilirsin.'),
    h('div.grid.c2', { style: { marginTop: '16px' } }, cards),
  ));
}

export async function projectView(root, { id }) {
  const meta = findProjectMeta(id);
  if (!meta) { mount(root, h('div.page', h('div.empty', 'Proje bulunamadı.'))); return; }
  setCrumbs([['Projeler', '#/projects'], [meta.title]]);
  if (!projectUnlocked(id)) {
    mount(root, h('div.page', h('div.card', { style: { maxWidth: '620px', margin: '40px auto', textAlign: 'center' } },
      icon('lock'), h('h2', meta.title), h('p.muted', projectPrereqText(id)), h('a.btn.primary', { href: '#/module/m1' }, 'Modül 1\'e git'),
      h('p.small.muted', { style: { marginTop: '12px' } }, 'Ayarlar\'dan serbest gezinmeyi açarak kilidi kaldırabilirsin.'))));
    return;
  }
  mount(root, h('div.page', h('div.empty', 'Proje yükleniyor…')));
  let P;
  try { P = await loadContent(meta.src); } catch (e) { mount(root, h('div.page', h('div.empty', 'Proje içeriği yüklenemedi: ' + e.message))); return; }
  const S = projectState(id);
  state.lastLocation = { type: 'project', id };
  save();
  setCtx({ page: 'project', lesson: null, lessonMeta: { id, title: P.title, titleEn: P.titleEn, vocab: P.vocab } });

  const steps = P.steps || [];
  const stepDone = i => !!S.steps[i]?.done;
  const unlocked = i => state.settings.freeNav || i === 0 || stepDone(i - 1);
  let cur = steps.findIndex((_, i) => !stepDone(i));
  if (cur < 0) cur = 0;

  const side = h('div.stack');
  const main = h('div');

  function markDone(i) {
    const st = projectStep(id, i);
    if (st.done) return;
    st.done = true;
    st.doneAt = new Date().toISOString();
    if (steps.every((_, k) => stepDone(k)) && !S.completed) {
      S.completed = true; S.completedAt = new Date().toISOString();
      toast('🏆 Proje tamamlandı! Portfolyo kontrol listesini unutma.', 'ok');
      logActivity(3);
    } else logActivity();
    save();
    renderSide();
  }

  function renderSide() {
    mount(side,
      h('div.card', { style: { padding: '12px' } },
        h('div.small.muted', { style: { marginBottom: '6px' } }, `Adımlar (${steps.filter((_, i) => stepDone(i)).length}/${steps.length})`),
        h('ol.lesson-list', steps.map((s, i) => h('li', h('button.lesson-item', {
          style: { width: '100%', textAlign: 'left', cursor: unlocked(i) ? 'pointer' : 'not-allowed', marginBottom: '6px', padding: '8px 10px', borderColor: i === cur ? 'var(--accent)' : '' },
          class: unlocked(i) ? '' : 'locked', disabled: !unlocked(i),
          onclick: () => { cur = i; renderMain(); renderSide(); },
        }, h('span.st', { class: stepDone(i) ? 'done' : i === cur ? 'cur' : '', style: { width: '24px', height: '24px' } }, stepDone(i) ? '✓' : String(i + 1)), h('span.t', { style: { fontSize: '13.5px' } }, s.title))))),
      ),
    );
  }

  function renderMain() {
    const s = steps[cur];
    const st = projectStep(id, cur);
    setCtx({ stepTitle: s.title, exercise: null, getCode: null, revealHint: null });
    const parts = [h('div.eyebrow', `Adım ${cur + 1} / ${steps.length}`), richEl('h2', s.title), s.body ? richEl('div', s.body, 'prose') : null];
    if (s.code) {
      const ed = createEditor({ code: s.code, readonly: true, maxHeight: 460, onRun: () => runner && runner.run() });
      const runner = s.runnable ? createRunner({ editor: ed, stdin: s.stdin ?? '', stepper: true }) : null;
      parts.push(h('div.stack', { style: { margin: '12px 0' } }, ed.el, runner ? runner.el : h('div.small.muted', '🖥 Bu kod Visual Studio\'da (Windows Forms / .NET) çalışır; tarayıcıda çalıştırılamaz.')));
      setCtx({ getCode: () => s.code });
    }
    let footer = null;
    if (s.exercise) {
      const ex = createExercise({ ex: s.exercise, saved: st, label: 'Adım alıştırması', onPass: () => { markDone(cur); nextBtn.disabled = false; } });
      parts.push(h('div', { style: { marginTop: '14px' } }, ex.el));
    } else if (s.checklist?.length) {
      st.checklist ??= {};
      const update = () => { if (s.checklist.every((_, k) => st.checklist[k])) { markDone(cur); nextBtn.disabled = false; } save(); };
      parts.push(h('div.card', { style: { marginTop: '14px' } }, h('h3', 'Kontrol listesi'), h('p.small.muted', 'Bu adımı Visual Studio\'da yaptıkça işaretle. Hepsi işaretlenince adım tamamlanır.'),
        s.checklist.map((c, k) => {
          const cb = h('input', { type: 'checkbox', checked: !!st.checklist[k], onchange: () => { st.checklist[k] = cb.checked; lbl.classList.toggle('done', cb.checked); update(); } });
          const lbl = h('label.check', { class: st.checklist[k] ? 'done' : '' }, cb, richEl('span', c));
          return lbl;
        })));
    } else if (!stepDone(cur)) {
      footer = h('button.btn.ok', { onclick: () => { markDone(cur); renderMain(); } }, icon('check'), 'Okudum, anladım');
    }
    const nextBtn = h('button.btn.primary', { disabled: !stepDone(cur) && !state.settings.freeNav, onclick: () => { if (cur < steps.length - 1) { cur++; renderMain(); renderSide(); root.closest('.view')?.scrollTo({ top: 0 }); } } }, cur < steps.length - 1 ? 'Sonraki adım' : 'Son adım', icon('chevR'));
    parts.push(h('div.step-nav', h('button.btn', { disabled: cur === 0, onclick: () => { cur--; renderMain(); renderSide(); } }, icon('chevL'), 'Önceki'), footer, nextBtn,
      h('span.spacer'), h('button.btn.sm.ghost', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'explain' } })) }, icon('bot'), 'Eğitmene sor')));
    mount(main, h('div.card', parts));
  }

  const demoBox = P.demo && DEMO_INFO[P.demo] ? h('details.card', { style: { marginBottom: '14px' }, open: P.environment !== 'browser' },
    h('summary', { style: { cursor: 'pointer', fontWeight: '600' } }, '🎮 Canlı önizleme: ', DEMO_INFO[P.demo].title, h('span.small.muted', ' — bitmiş uygulamanın tarayıcıdaki etkileşimli bir modeli')),
    h('p.small.muted', { style: { margin: '8px 0' } }, DEMO_INFO[P.demo].desc),
    h('div', { 'data-demo': P.demo })) : null;

  const finalS = S.final ??= {};
  mount(root, h('div.page.wide',
    h('div.eyebrow', P.environment === 'browser' ? '🌐 Tarayıcıda çalışan proje' : '🖥 Masaüstü projesi (Visual Studio + .NET)'),
    h('h1', P.title),
    h('div.tri', h('span', P.titleEn), h('span.jp', P.titleJa), P.minutes ? h('span', `~${Math.round(P.minutes / 60)} saat`) : null, S.completed ? h('span.badge.ok', '✓ Tamamlandı') : null),
    h('div.grid.c2', { style: { margin: '14px 0' } },
      h('div.card', richEl('div', P.summary, 'prose'), P.skills?.length ? h('div.row', P.skills.map(s => h('span.badge', s))) : null),
      h('div.card', h('h3', 'Hedefler'), h('ul.prose', (P.goals || []).map(g => richEl('li', g)))),
    ),
    demoBox,
    h('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)', gap: '16px', alignItems: 'start' }, class: 'proj-grid' }, side, main),
    P.finalChecklist?.length ? h('div.card', { style: { marginTop: '16px' } }, h('h3', 'Portfolyo kontrol listesi'), P.finalChecklist.map((c, k) => {
      const cb = h('input', { type: 'checkbox', checked: !!finalS[k], onchange: () => { finalS[k] = cb.checked; save(); lbl.classList.toggle('done', cb.checked); } });
      const lbl = h('label.check', { class: finalS[k] ? 'done' : '' }, cb, richEl('span', c));
      return lbl;
    })) : null,
    P.extensions?.length ? h('div.card', { style: { marginTop: '14px' } }, h('h3', 'İleri seviye fikirler'), h('ul.prose', P.extensions.map(e => richEl('li', e)))) : null,
    P.vocab?.length ? h('div.card', { style: { marginTop: '14px' } }, h('h3', 'Japonca kelimeler'), h('div', { style: { overflowX: 'auto' } }, h('table.vocab-table', h('tbody', P.vocab.map(v => h('tr', h('td', v.en), h('td', v.tr), h('td.ja', v.ja), h('td.ro', v.romaji), h('td', h('button.speak', { onclick: () => speakJa(v.kana || v.ja), 'aria-label': 'Seslendir' }, icon('volume'))))))))) : null,
  ));
  if (demoBox) mountDemo(P.demo, demoBox.querySelector('[data-demo]'));
  renderSide();
  renderMain();
}
