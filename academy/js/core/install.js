// Masaüstü/ana ekran kurulumu (PWA): service worker kaydı, "Yükle" istemi, Windows kısayolu.

let deferred = null;
const listeners = new Set();
function emit() { for (const fn of listeners) fn(); }
export function onInstallChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
export function canPrompt() { return !!deferred; }

export async function promptInstall() {
  if (!deferred) return 'unavailable';
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  emit();
  return outcome; // 'accepted' | 'dismissed'
}

export function appUrl() { return new URL('./', location.href).href.replace(/#.*$/, ''); }

/** Windows için masaüstü kısayolu (.url) dosyası indirir — her tarayıcıda çalışır. */
export function downloadWindowsShortcut() {
  const text = `[InternetShortcut]\r\nURL=${appUrl()}\r\n`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/internet-shortcut' }));
  a.download = 'Kaihatsu Akademi.url';
  document.body.append(a); a.click(); a.remove();
}

/** macOS için masaüstü kısayolu (.webloc). */
export function downloadMacShortcut() {
  const text = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>URL</key><string>${appUrl()}</string></dict></plist>\n`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/xml' }));
  a.download = 'Kaihatsu Akademi.webloc';
  document.body.append(a); a.click(); a.remove();
}

export function platform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mac/.test(ua)) return 'mac';
  if (/Windows/.test(ua)) return 'windows';
  return 'other';
}

export function initInstall() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; emit(); });
  window.addEventListener('appinstalled', () => { deferred = null; emit(); });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').then(() => precacheContent()).catch(() => { /* çevrimdışı desteği olmadan da çalışır */ });
  }
}

/** Tüm ders/proje içeriğini bir kez arka planda indir ki internet yokken de açılabilsin. */
const PRECACHE_KEY = 'kaihatsu-akademi.precached';
const PRECACHE_VER = '1';
async function precacheContent() {
  try { if (localStorage.getItem(PRECACHE_KEY) === PRECACHE_VER) return; } catch { return; }
  await navigator.serviceWorker.ready;
  const run = async () => {
    const { allLessons, allProjects, loadContent } = await import('../content/modules.js');
    const srcs = [...allLessons().filter(l => l.src).map(l => l.src), ...allProjects().map(p => p.src)];
    for (const src of srcs) { try { await loadContent(src); } catch { /* sonraki açılışta tekrar denenir */ return; } }
    try { localStorage.setItem(PRECACHE_KEY, PRECACHE_VER); } catch { /* yok */ }
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 3000)))(() => { run(); });
}
