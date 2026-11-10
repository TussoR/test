// Ayarlar: AI eğitmen (Claude API anahtarı), gezinme kilidi, yazı boyutu, yedekleme/geri yükleme, sıfırlama.

import { h, mount, icon, toast } from '../core/dom.js';
import { state, save, exportData, importData, resetAll } from '../core/store.js';
import { setCrumbs } from '../main.js';

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
      h('button.btn.danger', { onclick: () => { if (confirm('Tüm ilerlemen silinsin mi? Bu işlem geri alınamaz.') && confirm('Emin misin?')) { resetAll(); toast('İlerleme sıfırlandı.'); setTimeout(() => { location.hash = '#/'; location.reload(); }, 500); } } }, 'Tüm ilerlemeyi sıfırla'),
    ),

    h('p.small.muted', { style: { marginTop: '20px' } }, 'Kaihatsu Akademi · Tüm C# kodları tarayıcı içindeki sanal yorumlayıcıda güvenle çalışır. Yazı tipleri: Inter, JetBrains Mono, Noto Sans JP.'),
  ));
}
