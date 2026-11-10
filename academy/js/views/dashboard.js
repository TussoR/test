// Panel: genel ilerleme, mevcut modül, istatistikler, seri, haftalık plan.

import { h, mount, icon, fmtDuration, todayKey } from '../core/dom.js';
import { state, streak, quizScore, exerciseRate, level, adaptiveDifficulty } from '../core/store.js';
import { MODULES, allLessons } from '../content/modules.js';
import { overallProgress, currentModule, moduleProgress, nextLesson, projectsSummary, lessonDone } from '../core/progress.js';
import { setCrumbs } from '../main.js';
import ROADMAP from '../content/roadmap.js';
import { currentWeekIndex } from './roadmap.js';

function stat(ic, k, v, s) {
  return h('div.stat', h('div.k', icon(ic), k), h('div.v', v), s ? h('div.s', s) : null);
}

export function dashboardView(root) {
  setCrumbs([['Panel']]);
  const op = overallProgress();
  const cm = currentModule();
  const nl = nextLesson();
  const st = streak();
  const qs = quizScore();
  const er = exerciseRate();
  const lv = level();
  const ps = projectsSummary();
  const ad = adaptiveDifficulty();
  const lessons = allLessons();
  const doneLessons = lessons.filter(l => lessonDone(l.id)).length;
  const interactive = lessons.filter(l => l.interactive);
  const firstTime = !Object.keys(state.lessons).length;

  // son 14 günün etkinliği
  const days = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const maxSec = Math.max(1800, ...days.map(d => state.study.days[todayKey(d)] || 0));
  const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

  const cont = nl ? h('a.btn.primary', { href: `#/lesson/${nl.id}` }, icon('play'), firstTime ? 'İlk derse başla' : 'Kaldığın yerden devam et') : h('a.btn.primary', { href: '#/projects' }, 'Projelere geç');

  const weekIdx = currentWeekIndex();
  const week = ROADMAP.weeks?.[weekIdx];

  mount(root, h('div.page',
    h('div.hero',
      h('div',
        h('div.eyebrow', firstTime ? 'Hoş geldin' : 'Tekrar hoş geldin'),
        h('h1', { style: { margin: '6px 0 6px' } }, firstTime ? '3D sanatçısından yazılım geliştiriciye' : `Sıradaki: ${nl ? nl.title : 'Portfolyo projeleri'}`),
        h('p.muted', { style: { maxWidth: '640px' } }, firstTime
          ? 'Bu platform seni sıfırdan, C# ile junior geliştirici temellerine götürmek için tasarlandı: her ders kısa kartlar, satır satır açıklanan kod, otomatik kontrollü alıştırmalar ve quizlerden oluşur. 3D ve Blender deneyimin burada büyük bir avantaj.'
          : `Mevcut modül: Modül ${cm.num} — ${cm.title}. ${nl ? `Ders: ${nl.title}.` : ''}`),
        h('div.row', { style: { marginTop: '12px' } }, cont, h('a.btn', { href: '#/roadmap' }, icon('map'), 'Bu haftanın planı'), h('button.btn.ghost', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', {})) }, icon('bot'), 'Eğitmen')),
      ),
      h('div.ring', { style: { '--p': op.pct } }, h('div', h('b', `%${Math.round(op.pct)}`), h('span', 'genel ilerleme'))),
    ),

    h('div.grid.c4', { style: { marginTop: '16px' } },
      stat('book', 'Tamamlanan dersler', `${doneLessons}/${lessons.length}`, `${interactive.filter(l => lessonDone(l.id)).length}/${interactive.length} etkileşimli`),
      stat('clock', 'Toplam çalışma', fmtDuration(state.study.total), `Bugün: ${fmtDuration(state.study.days[todayKey()] || 0)}`),
      stat('flame', 'Günlük seri', `${st.current} gün`, `En uzun: ${st.best} gün${st.todayDone ? ' · bugün ✓' : ''}`),
      stat('star', 'Seviye', lv.name, `${lv.xp} XP · ${lv.ja}`),
      stat('target', 'Quiz ortalaması', qs.pct === null ? '—' : `%${qs.pct}`, qs.total ? `İlk denemede ${qs.correct}/${qs.total} doğru` : 'Henüz quiz yok'),
      stat('code', 'Kod alıştırma başarısı', er.pct === null ? '—' : `%${er.pct}`, er.attempts ? `${er.passes} başarılı / ${er.attempts} kontrol` : 'Henüz alıştırma yok'),
      stat('briefcase', 'Projeler', `${ps.done}/${ps.total}`, 'tamamlanan portfolyo projesi'),
      stat('chart', 'Uyarlanabilir zorluk', ['', 'Kolay', 'Orta', 'Zor'][ad.level], ad.reason),
    ),

    h('div.grid.c2', { style: { marginTop: '16px' } },
      h('div.card',
        h('div.row.between', h('h3', { style: { margin: 0 } }, 'Seviye ilerlemesi'), h('span.badge.acc', lv.next ? `${lv.next.name} için ${lv.next.min - lv.xp} XP` : 'En üst seviye')),
        h('div.bar', { style: { margin: '12px 0 6px' } }, h('i', { style: { width: `${Math.round(lv.progress * 100)}%` } })),
        h('p.small.muted', 'XP; tamamlanan dersler, ilk denemede doğru quiz cevapları, alıştırmalar, meydan okumalar ve proje adımlarından gelir. Seviye bir motivasyon göstergesidir — iş garantisi değil, gerçek beceri ölçüsü projelerindir.'),
        h('h3', { style: { marginTop: '14px' } }, 'Son 14 gün'),
        h('div.activity', days.map(d => {
          const sec = state.study.days[todayKey(d)] || 0;
          return h('div', { class: (sec > 0 ? 'has ' : '') + (todayKey(d) === todayKey() ? 'today' : ''), style: { height: `${Math.max(4, sec / maxSec * 100)}%` }, title: `${todayKey(d)}: ${fmtDuration(sec)}` });
        })),
        h('div.act-labels', days.map(d => h('span', dayNames[d.getDay()]))),
      ),
      h('div.card',
        h('div.row.between', h('h3', { style: { margin: 0 } }, 'Modüller'), h('a.small', { href: '#/curriculum' }, 'Tümü →')),
        h('div', { style: { marginTop: '8px' } }, MODULES.map(m => {
          const p = moduleProgress(m);
          return h('a.mod-row', { href: `#/module/${m.id}`, style: { color: 'inherit', textDecoration: 'none' } },
            h('span.mod-num', String(m.num)),
            h('span', { style: { fontWeight: m.id === cm.id ? '600' : '400' } }, m.title, m.id === cm.id ? h('span.badge.acc', { style: { marginLeft: '8px' } }, 'şu an') : null),
            h('div.bar', { class: p.pct === 100 ? 'ok' : '' }, h('i', { style: { width: `${p.pct}%` } })),
            h('span.small.muted', { style: { textAlign: 'right' } }, `%${p.pct}`));
        })),
      ),
    ),

    week ? h('div.card', { style: { marginTop: '16px' } },
      h('div.row.between', h('div', h('div.eyebrow', `Hafta ${week.week} · Ay ${week.month}`), h('h3', { style: { margin: '4px 0 0' } }, week.title)), h('a.btn.sm', { href: '#/roadmap' }, 'Yol haritası')),
      h('ul.prose', { style: { marginTop: '10px' } }, (week.goals || []).map(g => h('li', g))),
    ) : null,

    h('p.small.muted', { style: { marginTop: '22px' } }, 'Not: Bu kurs gerçek temel beceriler ve bir portfolyo oluşturmak için tasarlandı; bir işe kabul edilmeyi garanti etmez. Japonya\'daki başvurularda portfolyo, temel bilgisayar bilimi bilgisi ve Japonca iletişim birlikte değerlendirilir.'),
  ));
}
