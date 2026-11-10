// Ayarlar: AI eğitmen (Claude API anahtarı), gezinme kilidi, yazı boyutu, yedekleme/geri yükleme, sıfırlama.

import { h, mount, icon, toast } from '../core/dom.js';
import { state, save, exportData, importData, resetAll } from '../core/store.js';
import { setCrumbs } from '../main.js';
import { syncConfig, isConnected, connect, disconnect, syncNow, setDeviceName, onSyncStatus, syncStatus, overwriteRemoteWithLocal, deviceId } from '../core/sync.js';
import { fmtDuration } from '../core/dom.js';

const TOKEN_URL = 'https://github.com/settings/tokens/new?scopes=gist&description=Kaihatsu%20Akademi%20senkronizasyon';
const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

function loadQrLib() {
  if (window.QRCode) return Promise.resolve(window.QRCode);
  return new Promise((resolve, reject) => {
    const sc = document.createElement('script');
    sc.src = QR_LIB; sc.async = true;
    sc.onload = () => resolve(window.QRCode); sc.onerror = () => reject(new Error('QR kütüphanesi yüklenemedi'));
    document.head.append(sc);
  });
}

/** Senkronizasyon kartı: bağlanma, durum, cihazlar, telefona aktarma (QR / link). */
function syncCard() {
  const box = h('div.card');
  const render = () => {
    const cfg = syncConfig();
    if (!isConnected()) {
      const tok = h('input', { type: 'password', placeholder: 'ghp_… veya github_pat_…', autocomplete: 'off', 'aria-label': 'GitHub token' });
      const name = h('input', { type: 'text', value: cfg.deviceName || '', placeholder: 'Bu cihazın adı (ör. Ev PC, iPhone)', 'aria-label': 'Cihaz adı' });
      const msg = h('div.small', { style: { marginTop: '8px' } });
      const btn = h('button.btn.primary', { onclick: async () => {
        if (!tok.value.trim()) { msg.textContent = 'Önce token\'ı yapıştır.'; return; }
        btn.disabled = true; msg.textContent = 'Bağlanılıyor…';
        try {
          const r = await connect(tok.value, name.value.trim());
          toast(r.created ? `Bağlandı (${r.login}). Bulutta yeni bir ilerleme kaydı oluşturuldu.` : `Bağlandı (${r.login}). Diğer cihazdaki ilerleme alındı.`, 'ok');
          render();
        } catch (e) { msg.textContent = '⚠ ' + e.message; msg.style.color = 'var(--err)'; btn.disabled = false; }
      } }, 'Bağlan ve eşitle');
      mount(box,
        h('h3', '☁ Cihazlar arası senkronizasyon (bilgisayar ⇄ telefon)'),
        h('p.small.muted', 'İlerlemen (dersler, alıştırmalar, quizler, projeler, yol haritası, kelimeler, çalışma süresi) kendi GitHub hesabındaki ÖZEL bir Gist dosyasında saklanır ve tüm cihazlarında otomatik eşitlenir. Sunucu yok, ücret yok.'),
        h('ol.prose.small', { style: { margin: '6px 0 10px' } },
          h('li', h('a', { href: TOKEN_URL, target: '_blank', rel: 'noopener' }, 'Buraya tıklayarak GitHub\'da bir token oluştur'), ' — sadece ', h('b', 'gist'), ' izni işaretli olsun (sayfada hazır işaretli gelir). Süre olarak "No expiration" ya da 1 yıl seçebilirsin. ', h('b', 'Generate token'), ' de ve çıkan kodu kopyala.'),
          h('li', 'Token\'ı aşağıya yapıştır ve ', h('b', 'Bağlan'), ' de. (İlk bağlandığın cihazdaki ilerleme buluta yüklenir.)'),
          h('li', 'Telefonda kolayca bağlanmak için bağlandıktan sonra burada çıkacak ', h('b', 'QR kodu'), ' iPhone kamerasıyla okut.')),
        h('label.field', 'GitHub token'), tok,
        h('label.field', { style: { marginTop: '8px' } }, 'Cihaz adı (isteğe bağlı)'), name,
        h('div.row', { style: { marginTop: '10px' } }, btn), msg,
        h('div.callout.warn.small', { style: { marginTop: '10px' } }, h('b', 'Güvenlik: '), 'Token yalnızca bu tarayıcıda saklanır ve sadece api.github.com\'a gönderilir. Sadece "gist" izni olduğu için depolarına erişemez. Token\'ı kimseyle paylaşma; istediğin zaman GitHub → Settings → Developer settings → Tokens bölümünden silebilirsin.'),
      );
      return;
    }
    const devs = [{ id: deviceId(), name: (cfg.deviceName || 'Bu cihaz') + ' (bu cihaz)', total: state.study.total, updated: null }]
      .concat(Object.entries(state.remoteDevices || {}).map(([id, d]) => ({ id, name: d.name || 'Cihaz', total: d.study?.total || 0, updated: d.updatedAt })));
    const st = h('span.badge', { class: syncStatus.state === 'ok' ? 'ok' : syncStatus.state === 'error' ? 'err' : '' }, syncStatus.state === 'ok' ? '✓ Eşitlendi' : syncStatus.state === 'syncing' ? 'Eşitleniyor…' : syncStatus.state === 'error' ? 'Hata' : 'Bekliyor');
    const qrBox = h('div', { style: { marginTop: '10px' } });
    const link = `${location.origin}${location.pathname}#/sync?t=${encodeURIComponent(cfg.token)}`;
    const nameIn = h('input', { type: 'text', value: cfg.deviceName || '', style: { maxWidth: '260px' }, onchange: () => { setDeviceName(nameIn.value.trim()); syncNow({ quiet: true }); } });
    mount(box,
      h('div.row.between', h('h3', { style: { margin: 0 } }, '☁ Cihazlar arası senkronizasyon'), st),
      h('p.small.muted', { style: { marginTop: '6px' } }, `GitHub hesabı: ${cfg.login || '?'} · Son eşitleme: ${cfg.lastSync ? new Date(cfg.lastSync).toLocaleString('tr-TR') : '—'}`),
      syncStatus.state === 'error' ? h('div.feedback.bad.small', syncStatus.message) : null,
      h('table.vocab-table', { style: { margin: '8px 0' } }, h('thead', h('tr', h('th', 'Cihaz'), h('th', 'Toplam çalışma'), h('th', 'Son görülme'))),
        h('tbody', devs.map(d => h('tr', h('td', d.name), h('td', fmtDuration(d.total)), h('td.small.muted', d.updated ? new Date(d.updated).toLocaleString('tr-TR') : 'şimdi'))))),
      h('div.row', h('label.small.muted', 'Bu cihazın adı:'), nameIn),
      h('div.row', { style: { marginTop: '10px' } },
        h('button.btn.primary', { onclick: async () => { await syncNow(); render(); } }, 'Şimdi eşitle'),
        h('button.btn', { onclick: async () => {
          mount(qrBox, h('div.small.muted', 'QR hazırlanıyor…'));
          const holder = h('div', { style: { background: '#fff', padding: '12px', borderRadius: '10px', display: 'inline-block' } });
          try {
            const QR = await loadQrLib();
            mount(qrBox, h('p.small', h('b', 'Telefonda: '), 'iPhone kamerasını aç, bu kodu okut ve çıkan bağlantıya dokun. (Bağlantı varsayılan tarayıcında açılır; Comet kullanıyorsan Ayarlar → Comet → Varsayılan Tarayıcı ile Comet\'i varsayılan yap ya da aşağıdaki linki Comet\'e yapıştır.)'), holder);
            new QR(holder, { text: link, width: 220, height: 220, correctLevel: QR.CorrectLevel.M });
          } catch {
            mount(qrBox, h('div.small.muted', 'QR oluşturulamadı; aşağıdaki "Bağlantıyı kopyala"yı kullan.'));
          }
          qrBox.append(h('p.small.muted', { style: { marginTop: '8px' } }, '⚠ Bu kod ve bağlantı senin token\'ını içerir — kimseyle paylaşma, ekran görüntüsü paylaşma.'));
        } }, '📱 Telefona aktar (QR)'),
        h('button.btn', { onclick: async () => { try { await navigator.clipboard.writeText(link); toast('Bağlantı kopyalandı — kendine güvenli bir yoldan gönder (ör. AirDrop, Notlar).', 'ok'); } catch { prompt('Bu bağlantıyı kopyala:', link); } } }, 'Bağlantıyı kopyala'),
        h('button.btn.ghost', { onclick: () => { if (confirm('Bu cihazın senkronizasyonu kapatılsın mı? İlerlemen bu cihazda kalır, ama artık eşitlenmez.')) { disconnect(); render(); } } }, 'Bağlantıyı kes'),
      ),
      qrBox,
      h('p.small.muted', { style: { marginTop: '10px' } }, 'Eşitleme otomatiktir: uygulama açılınca, sekmeden çıkınca ve çalışırken yaklaşık dakikada bir. Tamamlanan dersler/adımlar her cihazda tamamlanmış sayılır; çalışma süreleri cihaz başına toplanır.'),
    );
  };
  render();
  const off = onSyncStatus(() => { if (!document.body.contains(box)) { off(); return; } render(); });
  return box;
}

export function applySettings() {
  document.documentElement.style.setProperty('--code-size', `${state.settings.codeSize || 14}px`);
}

export function settingsView(root) {
  setCrumbs([['Ayarlar']]);
  const s = state.settings;
  const key = h('input', { type: 'password', value: s.apiKey || '', placeholder: 'sk-ant-…', autocomplete: 'off', 'aria-label': 'Claude API anahtarı' });
  const model = h('select', { 'aria-label': 'Model' },
    [['claude-opus-5-5', 'Claude Opus 5.5 (önerilen)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (daha hızlı/ekonomik)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (en ekonomik)']]
      .map(([v, l]) => h('option', { value: v, selected: s.model === v }, l)));
  const remember = h('input', { type: 'checkbox', checked: s.rememberKey !== false });
  const freeNav = h('input', { type: 'checkbox', checked: !!s.freeNav, onchange: () => { s.freeNav = freeNav.checked; save(); toast(freeNav.checked ? 'Serbest gezinme açık — kilitler kaldırıldı.' : 'Sıralı ilerleme açık.'); } });
  const size = h('input', { type: 'range', min: 12, max: 18, value: s.codeSize || 14, oninput: () => { s.codeSize = +size.value; sizeLbl.textContent = `${size.value}px`; applySettings(); save(); } });
  const sizeLbl = h('span.small.muted', `${s.codeSize || 14}px`);
  const fileIn = h('input', { type: 'file', accept: 'application/json', style: { display: 'none' }, onchange: async () => {
    const f = fileIn.files[0]; if (!f) return;
    try { importData(await f.text()); toast('İlerleme geri yüklendi.', 'ok'); setTimeout(() => location.reload(), 600); }
    catch (e) { toast('Geri yüklenemedi: ' + e.message, 'err'); }
  } });

  mount(root, h('div.page', { style: { maxWidth: '860px' } },
    h('div.eyebrow', 'Ayarlar'), h('h1', 'Ayarlar'),

    syncCard(),

    h('div.card',
      h('h3', 'AI Eğitmen — Claude bağlantısı (isteğe bağlı)'),
      h('p.small.muted', 'Anahtar olmadan eğitmen çevrimdışı çalışır: ders içeriğinden açıklama, kural tabanlı kod incelemesi, hata açıklamaları, kademeli ipuçları ve uyarlanabilir ek alıştırmalar. Kendi Anthropic API anahtarını eklersen serbest sohbet, kişiye özel açıklamalar ve yeni alıştırma üretimi açılır.'),
      h('div.callout.warn', h('b', 'Güvenlik: '), 'Anahtar yalnızca bu tarayıcıda (localStorage) saklanır ve doğrudan api.anthropic.com\'a gönderilir; başka hiçbir sunucuya gitmez. Ortak/paylaşılan bir bilgisayarda "anahtarı hatırla"yı kapat. Kullanım ücreti anahtarın sahibine faturalanır. Anahtar oluşturmak için: console.anthropic.com.'),
      h('label.field', 'API anahtarı'), key,
      h('label.field', { style: { marginTop: '10px' } }, 'Model'), model,
      h('label.check', { style: { marginTop: '8px' } }, remember, h('span', 'Anahtarı bu tarayıcıda hatırla (kapalıysa sayfa yenilenince silinir)')),
      h('div.row', { style: { marginTop: '10px' } },
        h('button.btn.primary', { onclick: () => { s.apiKey = key.value.trim(); s.model = model.value; s.rememberKey = remember.checked; save(true); toast(s.apiKey ? 'Claude bağlantısı kaydedildi.' : 'Anahtar kaldırıldı — çevrimdışı eğitmen kullanılacak.', 'ok'); } }, 'Kaydet'),
        h('button.btn', { onclick: () => { key.value = ''; s.apiKey = ''; save(true); toast('Anahtar silindi.'); } }, 'Anahtarı sil'),
        h('button.btn.ghost', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', {})) }, icon('bot'), 'Eğitmeni aç')),
    ),

    h('div.card',
      h('h3', 'Öğrenme'),
      h('label.check', freeNav, h('span', h('b', 'Serbest gezinme'), h('br'), h('span.small.muted', 'Kilitleri kaldırır: dersleri sırasız açabilir, alıştırma çözmeden ilerleyebilirsin. Önerilmez — kavramlar birbirinin üzerine kurulur.'))),
      h('div', { style: { marginTop: '10px' } }, h('label.field', 'Kod yazı boyutu'), h('div.row', size, sizeLbl)),
      h('div', { style: { marginTop: '10px' } }, h('label.field', 'Yol haritası başlangıç tarihi'), h('div.row', h('a.btn.sm', { href: '#/roadmap' }, 'Yol haritasında değiştir'))),
    ),

    h('div.card',
      h('h3', 'Yedekleme'),
      h('p.small.muted', 'İlerlemen bu tarayıcıda otomatik kaydedilir. Başka bir bilgisayara taşımak ya da yedeklemek için dışa aktar (API anahtarı dosyaya dahil edilmez).'),
      h('div.row',
        h('button.btn', { onclick: () => { const blob = new Blob([exportData()], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: `kaihatsu-ilerleme-${new Date().toISOString().slice(0, 10)}.json` }); document.body.append(a); a.click(); a.remove(); } }, icon('download'), 'İlerlemeyi dışa aktar'),
        h('button.btn', { onclick: () => fileIn.click() }, icon('upload'), 'Yedekten geri yükle'), fileIn),
    ),

    h('div.card', { style: { borderColor: 'rgba(255,107,107,.35)' } },
      h('h3', 'Tehlikeli bölge'),
      h('p.small.muted', 'Tüm ilerleme, çalışma süresi, seri ve notlar silinir. Bu geri alınamaz (önce yedek almanı öneririm).'),
      h('button.btn.danger', { onclick: () => async () => {
        const cloud = isConnected();
        if (!confirm('Tüm ilerlemen silinsin mi? Bu işlem geri alınamaz.' + (cloud ? '\n\nSenkronizasyon açık: buluttaki kopya da sıfırlanacak. Diğer cihazlarında da sıfırlamazsan, onlar eski ilerlemeyi yeniden yükleyebilir.' : '')) || !confirm('Emin misin?')) return;
        resetAll();
        if (cloud) { try { await overwriteRemoteWithLocal(); } catch { /* yok */ } }
        toast('İlerleme sıfırlandı.'); setTimeout(() => { location.hash = '#/'; location.reload(); }, 500);
      } }, 'Tüm ilerlemeyi sıfırla'),
    ),

    h('p.small.muted', { style: { marginTop: '20px' } }, 'Kaihatsu Akademi · Tüm C# kodları tarayıcı içindeki sanal yorumlayıcıda güvenle çalışır. Yazı tipleri: Inter, JetBrains Mono, Noto Sans JP.'),
  ));
}
