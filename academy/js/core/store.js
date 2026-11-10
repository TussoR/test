// Kalıcı ilerleme deposu (localStorage). Sayfa yenilense de ilerleme kaybolmaz.

import { todayKey } from './dom.js';

const KEY = 'kaihatsu-akademi.v1';
const listeners = new Set();

function fresh() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    lessons: {},      // id → { stepMax, stepsDone, exercise, quiz, challenge, extras, completed, completedAt, selfStudy }
    projects: {},     // id → { steps: { i: { done, code, attempts, checklist } }, completed, completedAt }
    study: { days: {}, total: 0 },
    activity: {},     // gün → olay sayısı
    stats: { runs: 0, exerciseAttempts: 0, exercisePasses: 0, firstTryPasses: 0, hintsUsed: 0, errorsSeen: {} },
    roadmap: { startDate: todayKey(), checks: {} },
    vocab: {},        // en → { known, reviews }
    tutor: { messages: [] },
    playground: { code: '', stdin: '' },
    settings: { freeNav: false, apiKey: '', model: 'claude-opus-5-5', codeSize: 14, rememberKey: true },
    lastLocation: null,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const data = JSON.parse(raw);
    const base = fresh();
    // yeni alanlarla birleştir (ileriye dönük uyumluluk)
    for (const k of Object.keys(base)) if (data[k] === undefined) data[k] = base[k];
    data.settings = { ...base.settings, ...data.settings };
    data.stats = { ...base.stats, ...data.stats };
    return data;
  } catch {
    return fresh();
  }
}

export const state = load();
let saveTimer = null;

export function save(immediate = false) {
  clearTimeout(saveTimer);
  const doSave = () => {
    try {
      const copy = state.settings.rememberKey ? state : { ...state, settings: { ...state.settings, apiKey: '' } };
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (e) { console.warn('Kaydedilemedi', e); }
  };
  if (immediate) doSave(); else saveTimer = setTimeout(doSave, 250);
  for (const fn of listeners) fn(state);
}
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function lesson(id) {
  if (!state.lessons[id]) state.lessons[id] = { stepMax: 0, exercise: { passed: false, attempts: 0, hintsUsed: 0, code: null, solutionViewed: false }, quiz: { passed: false, firstTry: {}, attempts: 0 }, challenge: { passed: false, attempts: 0, code: null, skipped: false, hintsUsed: 0 }, extras: {}, completed: false };
  return state.lessons[id];
}
export function project(id) {
  if (!state.projects[id]) state.projects[id] = { steps: {}, completed: false };
  return state.projects[id];
}
export function projectStep(id, i) {
  const p = project(id);
  if (!p.steps[i]) p.steps[i] = { done: false, code: null, attempts: 0, checklist: {}, hintsUsed: 0 };
  return p.steps[i];
}

export function logActivity(n = 1) {
  const k = todayKey();
  state.activity[k] = (state.activity[k] || 0) + n;
  save();
}

// ---------- çalışma süresi takibi ----------
let lastInteraction = Date.now();
export function startStudyTimer() {
  const mark = () => { lastInteraction = Date.now(); };
  for (const ev of ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart']) window.addEventListener(ev, mark, { passive: true, capture: true });
  let last = Date.now();
  setInterval(() => {
    const now = Date.now();
    const dt = Math.min(15, (now - last) / 1000);
    last = now;
    // sekme görünür ve son 2 dakikada etkileşim varsa çalışıyor say
    if (document.visibilityState === 'visible' && now - lastInteraction < 120000) {
      const k = todayKey();
      state.study.days[k] = (state.study.days[k] || 0) + dt;
      state.study.total += dt;
      save();
    }
  }, 10000);
  window.addEventListener('beforeunload', () => save(true));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(true); });
}

// ---------- türetilmiş istatistikler ----------
export function streak() {
  const active = d => (state.study.days[d] || 0) >= 300 || (state.activity[d] || 0) > 0;
  let n = 0;
  const d = new Date();
  if (!active(todayKey(d))) d.setDate(d.getDate() - 1); // bugün henüz çalışılmadıysa dünden say
  while (active(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  let best = 0, run = 0;
  const days = Object.keys({ ...state.study.days, ...state.activity }).sort();
  let prev = null;
  for (const k of days) {
    if (!active(k)) continue;
    if (prev) {
      const pd = new Date(prev); pd.setDate(pd.getDate() + 1);
      run = todayKey(pd) === k ? run + 1 : 1;
    } else run = 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current: n, best: Math.max(best, n), todayDone: active(todayKey()) };
}

export function quizScore() {
  let correct = 0, total = 0;
  for (const l of Object.values(state.lessons)) {
    const ft = l.quiz?.firstTry || {};
    for (const v of Object.values(ft)) { total++; if (v) correct++; }
  }
  return { correct, total, pct: total ? Math.round(correct / total * 100) : null };
}

export function exerciseRate() {
  const s = state.stats;
  return { attempts: s.exerciseAttempts, passes: s.exercisePasses, pct: s.exerciseAttempts ? Math.round(s.exercisePasses / s.exerciseAttempts * 100) : null };
}

export function xp() {
  let x = 0;
  for (const l of Object.values(state.lessons)) {
    if (l.completed) x += l.selfStudy ? 60 : 100;
    if (l.exercise?.passed) x += l.exercise.attempts <= 1 ? 40 : 20;
    if (l.challenge?.passed) x += 50;
    for (const e of Object.values(l.extras || {})) if (e.passed) x += 25;
    for (const v of Object.values(l.quiz?.firstTry || {})) if (v) x += 10;
  }
  for (const p of Object.values(state.projects)) {
    for (const s of Object.values(p.steps)) if (s.done) x += 30;
    if (p.completed) x += 300;
  }
  return Math.round(x);
}

export const LEVELS = [
  { min: 0, name: 'Başlangıç', ja: '入門', en: 'Beginner' },
  { min: 400, name: 'Temel', ja: '基礎', en: 'Foundations' },
  { min: 1200, name: 'Gelişen', ja: '初級', en: 'Developing' },
  { min: 3000, name: 'Orta seviyeye yakın', ja: '中級手前', en: 'Approaching intermediate' },
  { min: 6000, name: 'Junior adayı', ja: 'ジュニア候補', en: 'Junior candidate' },
];
export function level() {
  const x = xp();
  let i = 0;
  while (i + 1 < LEVELS.length && x >= LEVELS[i + 1].min) i++;
  const cur = LEVELS[i], next = LEVELS[i + 1];
  return { ...cur, index: i, xp: x, next, progress: next ? (x - cur.min) / (next.min - cur.min) : 1 };
}

/**
 * Uyarlanabilir zorluk: alıştırma başarı oranı ve ipucu kullanımına göre 1–3.
 * AI eğitmen ek alıştırma seçerken ve açıklama derinliğini ayarlarken kullanır.
 */
export function adaptiveDifficulty() {
  const s = state.stats;
  if (s.exerciseAttempts < 3) return { level: 1, reason: 'Henüz yeterli veri yok — kolaydan başlıyoruz.' };
  const rate = s.exercisePasses / s.exerciseAttempts;
  const passes = Math.max(1, s.exercisePasses);
  const hintsPer = s.hintsUsed / passes;
  const firstTry = s.firstTryPasses / passes;
  if (rate >= 0.6 && hintsPer < 1 && firstTry >= 0.5) return { level: 3, reason: 'Alıştırmaları çoğunlukla ilk denemede, ipucusuz çözüyorsun.' };
  if (rate < 0.3 || hintsPer > 2) return { level: 1, reason: 'Son alıştırmalarda zorlandın; temeli sağlamlaştıralım.' };
  return { level: 2, reason: 'İstikrarlı ilerliyorsun.' };
}

export function exportData() { return JSON.stringify({ ...state, settings: { ...state.settings, apiKey: '' } }, null, 2); }
export function importData(json) {
  const data = JSON.parse(json);
  if (!data || data.version !== 1 || !data.lessons) throw new Error('Geçersiz yedek dosyası');
  const key = state.settings.apiKey;
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh(), data);
  state.settings.apiKey = key;
  save(true);
}
export function resetAll() {
  const key = state.settings.apiKey;
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, fresh());
  state.settings.apiKey = key;
  save(true);
}
