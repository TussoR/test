// Cihazlar arası senkronizasyon: ilerleme, kullanıcının kendi GitHub hesabındaki ÖZEL bir Gist'te saklanır.
// - Sunucu yok: tarayıcı doğrudan api.github.com ile konuşur.
// - Token sadece bu tarayıcıda (ayrı bir localStorage anahtarında) tutulur, yedek dosyalarına girmez.
// - Birleştirme "ilerleme kaybolmaz" ilkesiyle yapılır: tamamlanan ders/adım her iki cihazda da tamamlanmış sayılır.
// - Çalışma süresi ve sayaçlar cihaz başına tutulur (çift sayım olmaz), toplamlar store.js'te hesaplanır.

import { state, save, onChange } from './store.js';

const CFG_KEY = 'kaihatsu-akademi.sync';
const DEV_KEY = 'kaihatsu-akademi.device';
const FILE = 'kaihatsu-akademi-ilerleme.json';
const DESC = 'Kaihatsu Akademi — öğrenme ilerlemesi (otomatik senkronizasyon)';
const API = 'https://api.github.com';

const statusListeners = new Set();
export const syncStatus = { state: 'off', message: '', lastSync: null };
function setStatus(st, message = '') {
  syncStatus.state = st; syncStatus.message = message;
  if (st === 'ok') syncStatus.lastSync = new Date();
  for (const fn of statusListeners) fn(syncStatus);
}
export function onSyncStatus(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); }

function readCfg() { try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch { return {}; } }
function writeCfg(c) { try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch { /* yok */ } }
export function syncConfig() { return readCfg(); }
export function isConnected() { const c = readCfg(); return !!(c.token && c.gistId); }

export function deviceId() {
  let id = null;
  try { id = localStorage.getItem(DEV_KEY); } catch { /* yok */ }
  if (!id) { id = 'd' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); try { localStorage.setItem(DEV_KEY, id); } catch { /* yok */ } }
  return id;
}
function guessDeviceName() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Mac/.test(ua)) return 'Mac';
  return 'Cihaz';
}

async function gh(path, token, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    cache: 'no-store',
  });
  if (res.status === 401) throw new Error('Token geçersiz veya süresi dolmuş (401). Yeni bir token oluştur.');
  if (res.status === 403 || res.status === 404) {
    const t = await res.text().catch(() => '');
    if (/rate limit/i.test(t)) throw new Error('GitHub istek sınırına ulaşıldı; birkaç dakika sonra tekrar dene.');
    throw new Error(`Bu token'ın Gist izni yok ya da Gist bulunamadı (${res.status}). Token oluştururken "gist" iznini seçtiğinden emin ol.`);
  }
  if (!res.ok) throw new Error(`GitHub hatası (${res.status})`);
  return res.status === 204 ? null : res.json();
}

// ---------- birleştirme ----------
const max = (a, b) => Math.max(a || 0, b || 0);
const minDate = (a, b) => (!a ? b : !b ? a : (a < b ? a : b));
function orMap(a = {}, b = {}) { const o = { ...b }; for (const [k, v] of Object.entries(a)) o[k] = !!(v || o[k]); return o; }

function mergeEx(a, b) {
  if (!a) return b; if (!b) return a;
  const newer = (b.codeAt || 0) > (a.codeAt || 0) ? b : a;
  return {
    ...a,
    passed: !!(a.passed || b.passed),
    passedAt: minDate(a.passedAt, b.passedAt),
    attempts: max(a.attempts, b.attempts),
    hintsUsed: max(a.hintsUsed, b.hintsUsed),
    solutionViewed: !!(a.solutionViewed || b.solutionViewed),
    skipped: !!(a.skipped || b.skipped),
    done: !!(a.done || b.done),
    doneAt: minDate(a.doneAt, b.doneAt),
    checklist: orMap(a.checklist, b.checklist),
    code: newer.code ?? a.code ?? b.code ?? null,
    codeAt: newer.codeAt,
  };
}

function mergeLesson(a, b) {
  if (!a) return b; if (!b) return a;
  const extras = { ...(b.extras || {}) };
  for (const [k, v] of Object.entries(a.extras || {})) extras[k] = mergeEx(v, extras[k]);
  return {
    ...b, ...a,
    stepMax: max(a.stepMax, b.stepMax),
    completed: !!(a.completed || b.completed),
    completedAt: minDate(a.completedAt, b.completedAt),
    selfStudy: a.completed ? a.selfStudy : b.completed ? b.selfStudy : (a.selfStudy || b.selfStudy),
    selfChecks: orMap(a.selfChecks, b.selfChecks),
    exercise: mergeEx(a.exercise, b.exercise),
    challenge: mergeEx(a.challenge, b.challenge),
    quiz: a.quiz && b.quiz ? { ...a.quiz, passed: !!(a.quiz.passed || b.quiz.passed), passedAt: minDate(a.quiz.passedAt, b.quiz.passedAt), attempts: max(a.quiz.attempts, b.quiz.attempts), firstTry: { ...(b.quiz.firstTry || {}), ...(a.quiz.firstTry || {}) } } : (a.quiz || b.quiz),
    extras,
  };
}

function mergeProject(a, b) {
  if (!a) return b; if (!b) return a;
  const steps = { ...(b.steps || {}) };
  for (const [k, v] of Object.entries(a.steps || {})) steps[k] = mergeEx(v, steps[k]);
  return { ...b, ...a, steps, completed: !!(a.completed || b.completed), completedAt: minDate(a.completedAt, b.completedAt), final: orMap(a.final, b.final) };
}

/** Uzak belgeyi yerel duruma birleştirir. */
export function mergeInto(doc) {
  if (!doc || doc.version !== 1) return;
  for (const [id, l] of Object.entries(doc.lessons || {})) state.lessons[id] = mergeLesson(state.lessons[id], l);
  for (const [id, p] of Object.entries(doc.projects || {})) state.projects[id] = mergeProject(state.projects[id], p);
  for (const [k, v] of Object.entries(doc.vocab || {})) {
    const a = state.vocab[k];
    state.vocab[k] = a ? { ...v, ...a, known: !!(a.known || v.known), reviews: max(a.reviews, v.reviews) } : v;
  }
  if (doc.roadmap) {
    state.roadmap.startDate = minDate(state.roadmap.startDate, doc.roadmap.startDate);
    for (const [w, checks] of Object.entries(doc.roadmap.checks || {})) state.roadmap.checks[w] = orMap(state.roadmap.checks[w], checks);
  }
  if (doc.playground && (doc.playground.updatedAt || 0) > (state.playground.updatedAt || 0)) state.playground = { ...doc.playground };
  const me = deviceId();
  const others = { ...(doc.devices || {}) };
  delete others[me];
  state.remoteDevices = others;
}

function buildDoc(prevDevices) {
  const me = deviceId();
  const cfg = readCfg();
  return {
    version: 1,
    app: 'kaihatsu-akademi',
    updatedAt: new Date().toISOString(),
    lessons: state.lessons,
    projects: state.projects,
    vocab: state.vocab,
    roadmap: state.roadmap,
    playground: state.playground,
    devices: {
      ...(prevDevices || state.remoteDevices || {}),
      [me]: { name: cfg.deviceName || guessDeviceName(), updatedAt: new Date().toISOString(), study: state.study, activity: state.activity, stats: { ...state.stats, errorsSeen: undefined } },
    },
  };
}

async function readRemote(cfg) {
  const g = await gh(`/gists/${cfg.gistId}`, cfg.token);
  const f = g.files?.[FILE];
  if (!f) return null;
  let text = f.content;
  if (f.truncated && f.raw_url) text = await (await fetch(f.raw_url, { cache: 'no-store' })).text();
  try { return JSON.parse(text); } catch { return null; }
}

async function writeRemote(cfg, doc) {
  await gh(`/gists/${cfg.gistId}`, cfg.token, { method: 'PATCH', body: JSON.stringify({ files: { [FILE]: { content: JSON.stringify(doc) } } }) });
}

let busy = false, pending = false, applying = false;

/** Çek → birleştir → gönder. */
export async function syncNow({ quiet = false } = {}) {
  const cfg = readCfg();
  if (!cfg.token || !cfg.gistId) { setStatus('off'); return false; }
  if (busy) { pending = true; return false; }
  busy = true;
  if (!quiet) setStatus('syncing', 'Eşitleniyor…');
  try {
    const remote = await readRemote(cfg);
    syncStatus.changed = false;
    if (remote) {
      const before = JSON.stringify([state.lessons, state.projects, state.vocab, state.roadmap]);
      applying = true; mergeInto(remote); save(true); applying = false;
      syncStatus.changed = before !== JSON.stringify([state.lessons, state.projects, state.vocab, state.roadmap]);
    }
    await writeRemote(cfg, buildDoc(remote ? Object.fromEntries(Object.entries(remote.devices || {}).filter(([k]) => k !== deviceId())) : null));
    cfg.lastSync = new Date().toISOString();
    writeCfg(cfg);
    setStatus('ok', 'Eşitlendi');
    return true;
  } catch (e) {
    applying = false;
    setStatus('error', e.message || String(e));
    return false;
  } finally {
    busy = false;
    if (pending) { pending = false; setTimeout(() => syncNow({ quiet: true }), 1500); }
  }
}

/** Token ile bağlan: mevcut ilerleme Gist'ini bulur ya da yeni (özel) bir tane oluşturur. */
export async function connect(token, deviceName) {
  token = token.trim();
  const user = await gh('/user', token);
  let gistId = null;
  for (let page = 1; page <= 5 && !gistId; page++) {
    const list = await gh(`/gists?per_page=100&page=${page}`, token);
    const found = list.find(g => g.files && g.files[FILE]);
    if (found) gistId = found.id;
    if (list.length < 100) break;
  }
  let created = false;
  if (!gistId) {
    const g = await gh('/gists', token, { method: 'POST', body: JSON.stringify({ description: DESC, public: false, files: { [FILE]: { content: JSON.stringify(buildDoc({})) } } }) });
    gistId = g.id;
    created = true;
  }
  writeCfg({ token, gistId, login: user.login, deviceName: deviceName || guessDeviceName(), connectedAt: new Date().toISOString() });
  await syncNow();
  return { login: user.login, gistId, created };
}

export function disconnect() {
  const c = readCfg();
  writeCfg({ deviceName: c.deviceName });
  state.remoteDevices = {};
  save(true);
  setStatus('off');
}

export function setDeviceName(name) { const c = readCfg(); c.deviceName = name; writeCfg(c); }

/** "Sıfırla" sonrası bulut kopyasını da temizler (yalnızca bu hesapta). */
export async function overwriteRemoteWithLocal() {
  const cfg = readCfg();
  if (!cfg.token || !cfg.gistId) return;
  await writeRemote(cfg, buildDoc({}));
  setStatus('ok', 'Bulut kopyası sıfırlandı');
}

// ---------- otomatik senkronizasyon ----------
let timer = null, lastPull = 0;
export function startAutoSync() {
  if (isConnected()) { setStatus('syncing', 'Eşitleniyor…'); syncNow(); lastPull = Date.now(); }
  // Değişiklik olunca en geç ~1 dakika içinde gönder (çalışma sayacı her 10 sn kaydettiği için kısıtlı)
  onChange(() => {
    if (applying || !isConnected() || timer) return;
    const since = Date.now() - (syncStatus.lastSync ? syncStatus.lastSync.getTime() : 0);
    timer = setTimeout(() => { timer = null; syncNow({ quiet: true }); }, Math.max(8000, 60000 - since));
  });
  document.addEventListener('visibilitychange', () => {
    if (!isConnected()) return;
    if (document.visibilityState === 'visible' && Date.now() - lastPull > 30000) { lastPull = Date.now(); syncNow({ quiet: true }); }
    if (document.visibilityState === 'hidden') { clearTimeout(timer); timer = null; syncNow({ quiet: true }); }
  });
  window.addEventListener('online', () => { if (isConnected()) syncNow({ quiet: true }); });
}
