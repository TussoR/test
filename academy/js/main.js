// Uygulama kabuğu: kenar çubuğu, üst çubuk, yönlendirici (hash router), eğitmen çekmecesi.

import { h, mount, icon, fmtDuration, todayKey } from './core/dom.js';
import { state, onChange, startStudyTimer, streak, studyDays } from './core/store.js';
import { MODULES } from './content/modules.js';
import { moduleProgress } from './core/progress.js';
import { setCtx } from './core/context.js';
import { dashboardView } from './views/dashboard.js';
import { curriculumView, moduleView } from './views/curriculum.js';
import { lessonView } from './views/lesson.js';
import { projectsView, projectView } from './views/project.js';
import { playgroundView } from './views/playground.js';
import { roadmapView } from './views/roadmap.js';
import { vocabView } from './views/vocab.js';
import { searchView } from './views/search.js';
import { settingsView, applySettings } from './views/settings.js';
import { createTutor } from './tutor/tutor.js';
import { startAutoSync, connect, onSyncStatus, syncStatus, isConnected, syncNow } from './core/sync.js';

const ROUTES = [
  [/^\/?$/, dashboardView, 'dashboard'],
  [/^\/curriculum$/, curriculumView, 'curriculum'],
  [/^\/module\/([\w-]+)$/, moduleView, 'curriculum', ['id']],
  [/^\/lesson\/([\w-]+)$/, lessonView, 'curriculum', ['id']],
  [/^\/projects$/, projectsView, 'projects'],
  [/^\/project\/([\w-]+)$/, projectView, 'projects', ['id']],
  [/^\/playground$/, playgroundView, 'playground'],
  [/^\/roadmap$/, roadmapView, 'roadmap'],
  [/^\/vocab$/, vocabView, 'vocab'],
  [/^\/tutor$/, tutorPage, 'tutor'],
  [/^\/search$/, searchView, 'search'],
  [/^\/settings$/, settingsView, 'settings'],
  [/^\/sync$/, syncLinkView, 'settings'],
];

const NAV = [
  ['dashboard', '#/', 'home', 'Panel'],
  ['curriculum', '#/curriculum', 'book', 'Müfredat'],
  ['roadmap', '#/roadmap', 'map', '6 Aylık Yol Haritası'],
  ['projects', '#/projects', 'briefcase', 'Projeler'],
  ['playground', '#/playground', 'code', 'Kod Alanı'],
  ['tutor', '#/tutor', 'bot', 'AI Eğitmen'],
  ['vocab', '#/vocab', 'lang', 'Japonca Sözlük'],
  ['settings', '#/settings', 'gear', 'Ayarlar'],
];

// ---------- kabuk ----------
const navEl = h('nav.nav', { 'aria-label': 'Ana gezinme' });
const sidebar = h('aside.sidebar',
  h('div.brand', h('div.brand-mark', '開'), h('div', h('div.brand-name', 'Kaihatsu Akademi'), h('div.brand-sub', 'C# · 3D · CAD — 開発への道'))),
  navEl,
  h('div.sidebar-foot', 'İlerlemen bu tarayıcıda otomatik kaydedilir.'),
);
const crumbsEl = h('div.crumbs');
const searchInput = h('input', { type: 'search', placeholder: 'Müfredatta ara…', 'aria-label': 'Müfredatta ara' });
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && searchInput.value.trim()) navigate(`#/search?q=${encodeURIComponent(searchInput.value.trim())}`); });
const streakPill = h('span.pill.streak', { title: 'Günlük seri' });
const timePill = h('span.pill.time', { title: 'Bugünkü çalışma süresi' });
const menuBtn = h('button.icon-btn.menu-btn', { 'aria-label': 'Menüyü aç', onclick: () => toggleSidebar() }, icon('menu'));
const syncPill = h('button.pill', { style: { cursor: 'pointer' }, onclick: () => { if (isConnected()) syncNow(); else navigate('#/settings'); } });
const tutorBtn = h('button.icon-btn', { 'aria-label': 'AI eğitmeni aç', title: 'AI Eğitmen', onclick: () => openTutor() }, icon('bot'));
const topbar = h('header.topbar', menuBtn, crumbsEl,
  h('div.top-search', icon('search'), searchInput, h('kbd', '/')),
  syncPill, streakPill, timePill, tutorBtn);
const view = h('main.view', { id: 'view', tabindex: '-1' });
const scrim = h('div.scrim', { onclick: () => { toggleSidebar(false); closeTutor(); } });
const drawer = h('div.tutor-drawer', { role: 'dialog', 'aria-label': 'AI Eğitmen' });
const app = h('div.app', sidebar, h('div.main', topbar, view));
document.body.append(app, scrim, drawer);

const tutor = createTutor({ onClose: () => closeTutor() });
drawer.append(tutor.el);

function toggleSidebar(force) {
  const open = force ?? !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  scrim.classList.toggle('show', open || drawer.classList.contains('open'));
}
export function openTutor(detail) {
  if (location.hash.startsWith('#/tutor')) { if (detail) tutor.handle(detail); return; }
  drawer.classList.add('open');
  scrim.classList.add('show');
  tutor.mountIn(drawer);
  if (detail) tutor.handle(detail);
  tutor.focus();
}
function closeTutor() {
  drawer.classList.remove('open');
  if (!sidebar.classList.contains('open')) scrim.classList.remove('show');
}
window.addEventListener('tutor:ask', (e) => openTutor(e.detail));
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName)) { e.preventDefault(); searchInput.focus(); }
  if (e.key === 'Escape' && drawer.classList.contains('open') && !/textarea/i.test(document.activeElement?.tagName)) closeTutor();
});

// QR / bağlantı ile telefonda tek dokunuşla senkronizasyon kurulumu: #/sync?t=TOKEN
async function syncLinkView(root, _p, query) {
  const t = query.get('t');
  history.replaceState(null, '', '#/settings'); // token tarayıcı geçmişinde kalmasın
  setCrumbs([['Senkronizasyon']]);
  mount(root, h('div.page', h('div.card', { style: { maxWidth: '560px', margin: '40px auto', textAlign: 'center' } }, h('h2', '☁ Bağlanılıyor…'), h('p.muted', 'Diğer cihazındaki ilerleme alınıyor.'))));
  if (!t) { navigate('#/settings'); return; }
  try {
    const r = await connect(t, '');
    mount(root, h('div.page', h('div.card', { style: { maxWidth: '560px', margin: '40px auto', textAlign: 'center' } },
      h('h2', '✓ Senkronizasyon açık'), h('p.muted', `GitHub hesabı: ${r.login}. Bu cihazdaki ilerleme artık diğer cihazlarınla eşitlenecek.`),
      h('div.row', { style: { justifyContent: 'center' } }, h('a.btn.primary', { href: '#/' }, 'Panele git'), h('a.btn', { href: '#/settings' }, 'Ayarlar')))));
  } catch (e) {
    mount(root, h('div.page', h('div.card', { style: { maxWidth: '560px', margin: '40px auto', textAlign: 'center' } },
      h('h2', 'Bağlanılamadı'), h('p.muted', e.message), h('a.btn', { href: '#/settings' }, 'Ayarlar\'a git'))));
  }
}

function renderSyncPill() {
  if (!isConnected()) { mount(syncPill, '☁ Eşitle'); syncPill.title = 'Bilgisayar ve telefon arasında ilerlemeni eşitle (Ayarlar)'; syncPill.style.opacity = '.7'; return; }
  syncPill.style.opacity = '1';
  const m = { ok: ['☁ ✓', 'Eşitlendi'], syncing: ['☁ …', 'Eşitleniyor'], error: ['☁ !', 'Eşitleme hatası: ' + syncStatus.message], off: ['☁', 'Bekliyor'] }[syncStatus.state] || ['☁', ''];
  mount(syncPill, m[0]);
  syncPill.title = m[1] + (syncStatus.lastSync ? ` · son: ${syncStatus.lastSync.toLocaleTimeString('tr-TR')}` : '') + ' · tıkla: şimdi eşitle';
  syncPill.style.color = syncStatus.state === 'error' ? 'var(--err)' : syncStatus.state === 'ok' ? 'var(--ok)' : '';
}
onSyncStatus(() => {
  renderSyncPill();
  if (syncStatus.state !== 'ok') return;
  renderPills();
  // başka cihazdan yeni ilerleme geldiyse, düzenleme yapılmayan sayfaları tazele
  if (syncStatus.changed && ['dashboard', 'curriculum', 'projects', 'roadmap', 'vocab'].includes(currentActive) && !/input|textarea|select/i.test(document.activeElement?.tagName)) route();
});

function tutorPage(root) {
  setCrumbs([['AI Eğitmen']]);
  closeTutor();
  const wrap = h('div.page', { style: { height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '20px' } });
  const box = h('div.card', { style: { flex: '1', padding: '0', display: 'flex', flexDirection: 'column', minHeight: '520px', overflow: 'hidden' } });
  mount(root, wrap);
  wrap.append(box);
  tutor.mountIn(box);
}

function renderNav(active) {
  const items = NAV.map(([k, href, ic, label]) => h('a', { href, class: k === active ? 'active' : '', 'aria-current': k === active ? 'page' : null }, icon(ic), label));
  const mods = MODULES.map(m => {
    const p = moduleProgress(m);
    return h('a.mod-link', { href: `#/module/${m.id}`, title: `${m.title} — %${p.pct}`, class: location.hash === `#/module/${m.id}` ? 'active' : '' },
      h('span.mod-num', String(m.num)), h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, m.title), h('span.mini-bar', h('i', { style: { width: `${p.pct}%` } })));
  });
  mount(navEl, items.slice(0, 5), h('div.nav-section', 'Modüller'), mods, h('div.nav-section', 'Araçlar'), items.slice(5));
}

function renderPills() {
  const s = streak();
  mount(streakPill, icon('flame'), h('b', String(s.current)), s.current === 1 ? ' gün' : ' gün seri');
  streakPill.title = s.todayDone ? 'Bugünkü hedefe ulaştın' : 'Seriyi sürdürmek için bugün en az 5 dk çalış ya da bir alıştırma çöz';
  mount(timePill, icon('clock'), fmtDuration(studyDays()[todayKey()] || 0), ' bugün');
}

export function setCrumbs(parts) {
  mount(crumbsEl, parts.map((p, i) => [i ? h('span', ' / ') : null, p[1] ? h('a', { href: p[1], style: { color: 'inherit' } }, p[0]) : h('b', p[0])]));
  document.title = `${parts[parts.length - 1][0]} · Kaihatsu Akademi`;
}

export function navigate(hash) {
  if (location.hash === hash) route(); else location.hash = hash;
}

let currentActive = null;
async function route() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  const query = new URLSearchParams(qs || '');
  toggleSidebar(false);
  for (const [re, fn, active, names] of ROUTES) {
    const m = re.exec(path);
    if (!m) continue;
    const params = {};
    (names || []).forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]); });
    currentActive = active;
    renderNav(active);
    setCtx({ page: active, exercise: null, getCode: null, revealHint: null, stepTitle: null, phase: null, openExtra: null, lesson: null, lessonMeta: null });
    view.scrollTop = 0;
    try { await fn(view, params, query); }
    catch (e) { console.error(e); mount(view, h('div.page', h('div.empty', 'Bu sayfa yüklenirken bir hata oluştu: ' + e.message))); }
    if (path !== '/search') searchInput.value = '';
    return;
  }
  mount(view, h('div.page', h('div.empty', 'Sayfa bulunamadı. ', h('a', { href: '#/' }, 'Panele dön'))));
}

window.addEventListener('hashchange', route);
onChange(() => { renderPills(); });
let navTimer = null;
onChange(() => { clearTimeout(navTimer); navTimer = setTimeout(() => renderNav(currentActive), 400); });

applySettings();
startStudyTimer();
renderSyncPill();
startAutoSync();
renderPills();
setInterval(renderPills, 30000);
route();
