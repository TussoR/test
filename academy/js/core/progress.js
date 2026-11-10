// Müfredat + ilerleme durumu arasındaki köprü: kilitler, sonraki ders, modül ilerlemesi.

import { MODULES, allLessons, allProjects } from '../content/modules.js';
import { state } from './store.js';

export function lessonDone(id) { return !!state.lessons[id]?.completed; }
export function projectDone(id) { return !!state.projects[id]?.completed; }

/** Etkileşimli dersler sıralı kilitlidir: önceki ders bitmeden sonraki açılmaz. */
export function lessonUnlocked(id) {
  if (state.settings.freeNav) return true;
  const list = allLessons().filter(l => l.interactive);
  const i = list.findIndex(l => l.id === id);
  if (i < 0) return true; // taslak dersler her zaman okunabilir
  if (i === 0) return true;
  return lessonDone(list[i - 1].id);
}

export function projectUnlocked(id) {
  if (state.settings.freeNav) return true;
  if (id === 'm1-project' || id === 'p1') {
    return MODULES[0].lessons.every(l => lessonDone(l.id));
  }
  return true;
}

export function projectPrereqText(id) {
  if (id === 'm1-project' || id === 'p1') return 'Modül 1\'deki tüm dersleri tamamlayınca açılır.';
  return '';
}

export function lessonStatus(id) {
  if (lessonDone(id)) return 'done';
  if (!lessonUnlocked(id)) return 'locked';
  const l = state.lessons[id];
  if (l && (l.stepMax > 0 || l.exercise?.attempts)) return 'started';
  return 'open';
}

export function nextLesson() {
  const list = allLessons();
  return list.find(l => l.interactive && !lessonDone(l.id)) || list.find(l => !lessonDone(l.id)) || null;
}

export function moduleProgress(m) {
  const ids = m.lessons.map(l => l.id);
  const projects = [...(m.project ? [m.project.id] : []), ...(m.projects || []).map(p => p.id)];
  const total = ids.length + projects.length;
  const done = ids.filter(lessonDone).length + projects.filter(projectDone).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0, lessonsDone: ids.filter(lessonDone).length, lessons: ids.length };
}

export function overallProgress() {
  let done = 0, total = 0;
  for (const m of MODULES) { const p = moduleProgress(m); done += p.done; total += p.total; }
  return { done, total, pct: total ? Math.round(done / total * 1000) / 10 : 0 };
}

export function currentModule() {
  return MODULES.find(m => moduleProgress(m).pct < 100) || MODULES[MODULES.length - 1];
}

export function projectsSummary() {
  const ps = allProjects();
  return { done: ps.filter(p => projectDone(p.id)).length, total: ps.length };
}
