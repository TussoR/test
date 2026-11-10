// 6 aylık yol haritası: aylar, haftalar, günlük görevler (işaretlenebilir), haftalık tekrar.

import { h, mount, icon, todayKey } from '../core/dom.js';
import { state, save, logActivity } from '../core/store.js';
import ROADMAP from '../content/roadmap.js';
import { findLessonMeta } from '../content/modules.js';
import { lessonDone } from '../core/progress.js';
import { setCrumbs } from '../main.js';

export function currentWeekIndex() {
  const start = new Date(state.roadmap.startDate + 'T00:00:00');
  const diff = Math.floor((Date.now() - start.getTime()) / (7 * 86400000));
  const n = (ROADMAP.weeks || []).length;
  return Math.max(0, Math.min(n - 1, diff));
}

function weekProgress(w) {
  const checks = state.roadmap.checks[w.week] || {};
  let total = 0, done = 0;
  (w.days || []).forEach((d, di) => (d.tasks || []).forEach((_, ti) => { total++; if (checks[`${di}-${ti}`]) done++; }));
  return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
}

export function roadmapView(root) {
  setCrumbs([['6 Aylık Yol Haritası']]);
  const weeks = ROADMAP.weeks || [];
  if (!weeks.length) { mount(root, h('div.page', h('div.empty', 'Yol haritası içeriği henüz yüklenmedi.'))); return; }
  const cur = currentWeekIndex();
  const startInput = h('input', { type: 'date', value: state.roadmap.startDate, style: { width: 'auto' }, 'aria-label': 'Başlangıç tarihi', onchange: () => { if (startInput.value) { state.roadmap.startDate = startInput.value; save(); roadmapView(root); } } });

  const monthCards = (ROADMAP.months || []).map(m => {
    const ws = weeks.filter(w => w.month === m.month);
    const prog = ws.reduce((a, w) => { const p = weekProgress(w); return { d: a.d + p.done, t: a.t + p.total }; }, { d: 0, t: 0 });
    const isCur = weeks[cur]?.month === m.month;
    return h('div.card', { style: { borderColor: isCur ? 'var(--accent)' : '' } },
      h('div.row.between', h('span.num', { style: { font: '700 12px var(--mono)', color: 'var(--accent)' } }, `AY ${m.month}`), isCur ? h('span.badge.acc', 'şu an') : null),
      h('h3', { style: { margin: '6px 0 4px' } }, m.title),
      h('p.small.muted', m.focus),
      m.outcome ? h('p.small', h('b', 'Ay sonunda: '), m.outcome) : null,
      m.project ? h('a.badge', { href: `#/project/${m.project}`, style: { textDecoration: 'none' } }, icon('briefcase'), `Proje: ${m.project.toUpperCase()}`) : null,
      h('div.bar', { style: { marginTop: '10px' } }, h('i', { style: { width: `${prog.t ? Math.round(prog.d / prog.t * 100) : 0}%` } })),
    );
  });

  const weekEls = weeks.map((w, wi) => {
    const p = weekProgress(w);
    const checks = state.roadmap.checks[w.week] ??= {};
    const body = h('div.body',
      w.goals?.length ? h('div', { style: { margin: '10px 0' } }, h('b.small', 'Hedefler'), h('ul.prose', { style: { margin: '4px 0' } }, w.goals.map(g => h('li', g)))) : null,
      w.lessons?.length ? h('div.row', { style: { margin: '6px 0 10px' } }, h('span.small.muted', 'Dersler:'), w.lessons.map(id => {
        const lm = findLessonMeta(id);
        const label = lm ? lm.title : id;
        return lm ? h('a.badge', { href: `#/lesson/${id}`, class: lessonDone(id) ? 'ok' : '', style: { textDecoration: 'none' } }, lessonDone(id) ? '✓ ' : '', label) : h('a.badge', { href: id.includes('project') ? `#/project/${id}` : '#/projects', style: { textDecoration: 'none' } }, label);
      })) : null,
      (w.days || []).map((d, di) => h('div.day',
        h('div', h('b', d.day), h('div.small.muted', d.minutes ? `${d.minutes} dk` : '')),
        h('div', (d.tasks || []).map((t, ti) => {
          const key = `${di}-${ti}`;
          const cb = h('input', { type: 'checkbox', checked: !!checks[key], onchange: () => { checks[key] = cb.checked; if (cb.checked) logActivity(); save(); lbl.classList.toggle('done', cb.checked); const np = weekProgress(w); bar.style.width = `${np.pct}%`; cnt.textContent = `${np.done}/${np.total}`; } });
          const lbl = h('label.check', { class: checks[key] ? 'done' : '' }, cb, h('span', t));
          return lbl;
        })),
      )),
      (w.project || w.moduleProject) ? h('div.row', { style: { margin: '6px 0' } },
        w.project ? h('a.badge.acc', { href: `#/project/${w.project}`, style: { textDecoration: 'none' } }, icon('briefcase'), `Portfolyo projesi: ${String(w.project).toUpperCase()}`) : null,
        w.moduleProject ? h('a.badge', { href: `#/module/${String(w.moduleProject).split('-')[0]}`, style: { textDecoration: 'none' } }, icon('briefcase'), 'Modül projesi') : null) : null,
      w.practice ? h('div.callout', h('b', 'Haftalık pratik: '), w.practice) : null,
      w.review ? h('div.callout.tip', h('b', 'Haftalık tekrar testi: '), w.review) : null,
      w.milestone ? h('div.callout.warn', h('b', '🏁 Kilometre taşı: '), w.milestone) : null,
    );
    const bar = h('i', { style: { width: `${p.pct}%` } });
    const cnt = h('span.small.muted', `${p.done}/${p.total}`);
    return h('details.week', { class: wi === cur ? 'current' : '', open: wi === cur },
      h('summary', h('span.wn', `HAFTA ${w.week}`), h('span', { style: { flex: '1', minWidth: '0' } }, w.title, wi === cur ? h('span.badge.acc', { style: { marginLeft: '8px' } }, 'bu hafta') : null),
        h('div.bar', { style: { width: '90px' } }, bar), cnt),
      body);
  });

  mount(root, h('div.page',
    h('div.eyebrow', 'Plan'),
    h('h1', '6 aylık öğrenme yol haritası'),
    h('p.muted', { style: { maxWidth: '780px' } }, `Günde yaklaşık ${ROADMAP.hoursPerDay || 2} saat çalışma varsayımıyla: haftalık hedefler, günlük dersler, pratik alıştırmalar, haftalık tekrar testleri ve aylık projeler.`),
    h('div.callout.warn', ROADMAP.disclaimer || 'Bu plan gerçek temel beceriler ve bir portfolyo oluşturmak içindir; işe kabul garantisi vermez.'),
    h('div.row', { style: { margin: '12px 0 18px' } }, h('label.small.muted', { for: 'rm-start' }, 'Başlangıç tarihin:'), startInput, h('span.small.muted', `Bugün: ${todayKey()} → Hafta ${cur + 1}`)),
    h('div.grid.c3', monthCards),
    h('h2', { style: { marginTop: '26px' } }, 'Haftalar'),
    h('div', weekEls),
  ));
}
