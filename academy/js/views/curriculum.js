// Müfredat genel bakışı ve modül sayfaları.

import { h, mount, icon, speakJa } from '../core/dom.js';
import { MODULES, findModule } from '../content/modules.js';
import { moduleProgress, lessonStatus, projectDone, projectUnlocked } from '../core/progress.js';
import { setCrumbs } from '../main.js';

export function curriculumView(root) {
  setCrumbs([['Müfredat']]);
  mount(root, h('div.page',
    h('div.eyebrow', 'Müfredat'),
    h('h1', 'Sıfırdan junior geliştiriciye: 8 modül'),
    h('p.muted', { style: { maxWidth: '760px' } }, 'Modüller sırayla birbirinin üzerine kurulur. Modül 1 tamamen etkileşimlidir (her ders: açıklama → benzetme → görsel → satır satır kod → alıştırma → quiz → meydan okuma). Diğer modüller şimdilik ayrıntılı ders taslakları, hedefler ve Japonca kelimelerle gelir; AI eğitmen ve kod alanıyla çalışılabilir.'),
    h('div.grid.c2', { style: { marginTop: '18px' } }, MODULES.map(m => {
      const p = moduleProgress(m);
      const interactive = m.lessons.filter(l => l.src).length;
      return h('a.card.mod-card', { href: `#/module/${m.id}` },
        h('div.row.between', h('span.num', `MODÜL ${m.num}`), h('span.small.muted', m.weeks || '')),
        h('h3', { style: { margin: '6px 0 2px' } }, m.title),
        h('div.tri', h('span', m.titleEn), h('span.jp', m.titleJa)),
        h('p.small.muted', { style: { margin: '8px 0 10px' } }, m.summary),
        h('div.row', { style: { marginBottom: '8px' } },
          m.lessons.length ? h('span.badge', `${m.lessons.length} ders`) : null,
          (m.projects || []).length ? h('span.badge', `${m.projects.length} proje`) : null,
          interactive ? h('span.badge.acc', `${interactive} etkileşimli`) : m.lessons.length ? h('span.badge', 'taslak') : null,
          p.pct === 100 ? h('span.badge.ok', '✓ Tamamlandı') : null),
        h('div.bar', { class: p.pct === 100 ? 'ok' : '' }, h('i', { style: { width: `${p.pct}%` } })),
      );
    })),
  ));
}

export function moduleView(root, { id }) {
  const m = findModule(id);
  if (!m) { mount(root, h('div.page', h('div.empty', 'Modül bulunamadı.'))); return; }
  setCrumbs([['Müfredat', '#/curriculum'], [`Modül ${m.num}: ${m.title}`]]);
  const p = moduleProgress(m);
  let firstOpen = true;
  const items = m.lessons.map((l, i) => {
    const st = lessonStatus(l.id);
    const isCur = st !== 'done' && st !== 'locked' && firstOpen && !!l.src;
    if (isCur) firstOpen = false;
    return h('a.lesson-item', { href: `#/lesson/${l.id}`, class: st === 'locked' ? 'locked' : '' },
      h('span.st', { class: st === 'done' ? 'done' : isCur ? 'cur' : '' }, st === 'done' ? '✓' : st === 'locked' ? icon('lock') : String(i + 1)),
      h('div.t', h('div', l.title), h('small', `${l.titleEn} · `, h('span.jp', l.titleJa), ` · ~${l.minutes || 60} dk`)),
      l.src ? h('span.badge.acc', 'etkileşimli') : h('span.badge', 'taslak'),
    );
  });
  const projItems = [];
  const projs = [...(m.project ? [m.project] : []), ...(m.projects || [])];
  for (const pr of projs) {
    const done = projectDone(pr.id);
    const un = projectUnlocked(pr.id);
    projItems.push(h(pr.src ? 'a.lesson-item' : 'div.lesson-item', pr.src ? { href: `#/project/${pr.id}`, class: un ? '' : 'locked' } : {},
      h('span.st', { class: done ? 'done' : '' }, done ? '✓' : icon('briefcase')),
      h('div.t', h('div', pr.title), h('small', pr.titleEn || '', pr.month ? ` · Önerilen: ${pr.month}. ay` : '')),
      pr.src ? (un ? h('span.badge.acc', 'proje') : h('span.badge.lock', icon('lock'), 'kilitli')) : h('span.badge', 'proje özeti'),
    ));
  }
  // taslak modül projesi (outline)
  const outlineProject = m.project && !m.project.src ? m.project : null;

  mount(root, h('div.page',
    h('div.eyebrow', `Modül ${m.num} · ${m.weeks || ''}`),
    h('h1', m.title),
    h('div.tri', h('span', m.titleEn), h('span.jp', m.titleJa)),
    h('p.muted', { style: { maxWidth: '800px', marginTop: '10px' } }, m.summary),
    h('div.row', { style: { margin: '6px 0 18px' } }, h('div.bar', { style: { width: '240px' } }, h('i', { style: { width: `${p.pct}%` } })), h('span.small.muted', `%${p.pct} · ${p.done}/${p.total}`)),
    m.lessons.length ? h('h2', 'Dersler') : null,
    m.lessons.length ? h('div', items) : null,
    projItems.length && !outlineProject ? h('h2', { style: { marginTop: '22px' } }, 'Proje' + (projItems.length > 1 ? 'ler' : '')) : null,
    outlineProject ? null : h('div', projItems),
    outlineProject ? h('div.card', { style: { marginTop: '22px' } },
      h('div.eyebrow', 'Modül projesi'), h('h3', outlineProject.title),
      outlineProject.brief ? h('div.prose', { html: outlineProject.brief }) : null,
      outlineProject.steps?.length ? h('ol.prose', outlineProject.steps.map(s => h('li', s))) : null,
      outlineProject.skills?.length ? h('div.row', outlineProject.skills.map(s => h('span.badge', s))) : null,
      h('div.row', { style: { marginTop: '10px' } }, h('a.btn.sm', { href: '#/playground' }, icon('code'), 'Kod alanında başla'), h('button.btn.sm', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'teach', topic: { title: outlineProject.title, titleEn: outlineProject.titleEn || '', titleJa: '', summary: outlineProject.brief?.replace(/<[^>]+>/g, ''), objectives: outlineProject.steps, topics: outlineProject.skills } } })) }, icon('bot'), 'Eğitmenle planla')),
    ) : null,
    m.vocab?.length ? h('div.card', { style: { marginTop: '22px' } },
      h('h3', 'Modülün Japonca teknik kelimeleri'),
      h('div', { style: { overflowX: 'auto' } }, h('table.vocab-table', h('thead', h('tr', h('th', 'English'), h('th', 'Türkçe'), h('th', '日本語'), h('th', 'Okunuş'), h('th', ''))),
        h('tbody', m.vocab.map(v => h('tr', h('td', v.en), h('td', v.tr), h('td.ja', v.ja), h('td.ro', `${v.kana && v.kana !== v.ja ? v.kana + ' · ' : ''}${v.romaji}`), h('td', h('button.speak', { onclick: () => speakJa(v.kana || v.ja), 'aria-label': 'Seslendir' }, icon('volume')))))))),
    ) : null,
  ));
}
