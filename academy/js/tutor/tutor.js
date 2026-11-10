// AI Eğitmen arayüzü + yönlendirme: Claude anahtarı varsa Claude, yoksa çevrimdışı eğitmen.

import { h, mount, icon, esc, stripHtml, rich, toast } from '../core/dom.js';
import { state, save, adaptiveDifficulty, level, exerciseRate } from '../core/store.js';
import { ctx } from '../core/context.js';
import { askClaude, hasKey } from './claude.js';
import { offlineAnswer } from './offline.js';

/** Güvenli mini markdown → HTML (önce kaçış, sonra biçim). */
export function md(src) {
  const blocks = [];
  let s = String(src ?? '').replace(/```(\w*)\n?([\s\S]*?)(```|$)/g, (_, lang, code) => { blocks.push(code.replace(/\n$/, '')); return `\u0000${blocks.length - 1}\u0000`; });
  s = esc(s)
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])_([^_\n]+)_(?=[\s.,)!?]|$)/g, '$1<i>$2</i>')
    .replace(/^#{1,4}\s+(.+)$/gm, '<b>$1</b>');
  const lines = s.split('\n');
  let html = '', list = null;
  for (const ln of lines) {
    const ul = /^\s*[-*•]\s+(.*)$/.exec(ln), ol = /^\s*\d+[.)]\s+(.*)$/.exec(ln);
    if (ul || ol) {
      const t = ul ? 'ul' : 'ol';
      if (list !== t) { if (list) html += `</${list}>`; html += `<${t}>`; list = t; }
      html += `<li>${(ul || ol)[1]}</li>`;
      continue;
    }
    if (list) { html += `</${list}>`; list = null; }
    html += ln.trim() ? ln + '<br>' : '<br>';
  }
  if (list) html += `</${list}>`;
  html = html.replace(/(<br>){3,}/g, '<br><br>');
  return html.replace(/\u0000(\d+)\u0000(<br>)?/g, (_, i) => `<pre><code>${esc(blocks[+i])}</code></pre>`);
}

function contextBlock() {
  const lv = level(), ad = adaptiveDifficulty(), er = exerciseRate();
  const parts = [`Sayfa: ${ctx.page || '-'}`];
  if (ctx.lessonMeta) parts.push(`Ders: ${ctx.lessonMeta.id} — ${ctx.lessonMeta.title} (${ctx.lessonMeta.titleEn || ''})`);
  if (ctx.phase) parts.push(`Aşama: ${ctx.phase}`);
  if (ctx.stepTitle) parts.push(`Aktif kart: ${ctx.stepTitle}`);
  if (ctx.lesson && ctx.stepTitle) {
    const st = ctx.lesson.steps?.find(s => s.title === ctx.stepTitle);
    if (st && (st.body || st.caption)) parts.push(`Kart içeriği (özet): ${stripHtml(st.body || st.caption).slice(0, 900)}`);
  }
  parts.push(`Öğrenci seviyesi: ${lv.name} (${lv.xp} XP); uyarlanabilir zorluk: ${ad.level}/3 — ${ad.reason}; alıştırma başarı oranı: ${er.pct ?? '-'}%`);
  if (ctx.exercise) {
    parts.push(`Aktif alıştırma: ${ctx.exercise.title || ''} — ${stripHtml(ctx.exercise.prompt).slice(0, 700)}`);
    if (ctx.exerciseState) parts.push(`Deneme sayısı: ${ctx.exerciseState.attempts || 0}, kullanılan ipucu: ${ctx.exerciseState.hintsUsed || 0}, geçildi mi: ${ctx.exerciseState.passed ? 'evet' : 'hayır'}`);
  }
  const code = ctx.getCode ? ctx.getCode() : null;
  if (code && code.trim()) parts.push('Öğrencinin şu anki kodu (satır numaralı):\n```csharp\n' + code.split('\n').map((l, i) => `${String(i + 1).padStart(2)}| ${l}`).join('\n').slice(0, 6000) + '\n```');
  const lr = ctx.lastRun?.result;
  if (lr) {
    if (lr.error) parts.push(`Son çalıştırma hatası: [${lr.error.kind}] ${lr.error.code}: ${lr.error.message} (satır ${lr.error.line})`);
    else parts.push(`Son çalıştırma çıktısı:\n${(lr.stdout || '(boş)').slice(0, 1500)}`);
  }
  if (ctx.lastCheck && !ctx.lastCheck.passed && ctx.lastCheck.feedback) parts.push(`Son kontrol sonucu: başarısız — ${stripHtml(ctx.lastCheck.feedback.title + ': ' + (ctx.lastCheck.feedback.why || ''))}`);
  return `[Bağlam — platform tarafından otomatik eklendi]\n${parts.join('\n')}\n[/Bağlam]`;
}

const ACTIONS = [
  ['explain', 'Basitçe anlat'],
  ['review', 'Kodumu incele'],
  ['error', 'Hatamı açıkla'],
  ['hint', 'İpucu ver'],
  ['extra', 'Ek alıştırma'],
  ['vocab', 'Japonca terimler'],
];

const ACTION_PROMPTS = {
  explain: 'Şu an çalıştığım kavramı bana daha basit, günlük dille ve 3D/Blender benzetmesiyle anlatır mısın?',
  review: 'Kodumu bir yeni başlayan için incele: önce iyi olanı söyle, sonra en önemli sorunları satır numarasıyla ve nedenleriyle açıkla. Çözümü doğrudan yazma.',
  error: 'Aldığım hatayı açıkla: ne demek, bilgisayar neden kabul etmiyor, nasıl düzeltebilirim? Tam düzeltilmiş kodu verme, beni yönlendir.',
  hint: 'Bu alıştırma için bir ipucu verir misin? Çözümü verme.',
  extra: 'Seviyeme uygun, bu dersin konusuyla ilgili ve 3D/CAD temalı yeni bir ek alıştırma üret. Beklenen çıktıyı yaz ama çözümü verme.',
  vocab: 'Bu dersteki önemli teknik terimlerin Japonca karşılıklarını (kanji/kana + okunuş) ve kısa kullanım örneklerini ver.',
};

export function createTutor({ onClose } = {}) {
  const msgs = h('div.tutor-msgs', { 'aria-live': 'polite' });
  const ta = h('textarea', { placeholder: 'Bir soru sor… (Enter gönderir, Shift+Enter yeni satır)', 'aria-label': 'Eğitmene mesaj', rows: 2 });
  const sendBtn = h('button.btn.primary', { onclick: () => send(), 'aria-label': 'Gönder' }, icon('send'));
  const modeBadge = h('span.badge');
  const ctxLine = h('div.small.muted', { style: { padding: '6px 16px', borderBottom: '1px solid var(--border)' } });
  const closeBtn = h('button.icon-btn', { onclick: () => onClose && onClose(), 'aria-label': 'Eğitmeni kapat' }, icon('x'));
  const quick = h('div.tutor-quick', ACTIONS.map(([k, label]) => h('button', { onclick: () => handle({ action: k }) }, label)));
  const el = h('div.tutor',
    h('div.tutor-head', h('div.tutor-avatar', '先'), h('div', { style: { flex: '1', minWidth: '0' } }, h('div', { style: { fontWeight: '600' } }, 'AI Eğitmen ', h('span.jp.muted.small', '先生')), modeBadge), h('button.btn.sm.ghost', { onclick: clearChat, title: 'Sohbeti temizle' }, 'Temizle'), closeBtn),
    ctxLine, msgs, quick,
    h('div.tutor-input', ta, sendBtn),
  );
  ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

  let busy = false;

  function refreshHeader() {
    const online = hasKey(state.settings);
    mount(modeBadge, online ? '● Claude bağlı' : '○ Çevrimdışı eğitmen');
    modeBadge.className = 'badge ' + (online ? 'ok' : '');
    modeBadge.title = online ? `Model: ${state.settings.model}` : 'Ayarlar\'dan Claude API anahtarı ekleyerek serbest sohbet açabilirsin. Çevrimdışı mod; ders içeriği, hata açıklamaları ve kural tabanlı kod incelemesiyle çalışır.';
    const where = ctx.lessonMeta ? `${ctx.lessonMeta.title}${ctx.stepTitle && ctx.stepTitle !== ctx.lessonMeta.title ? ' · ' + ctx.stepTitle : ''}` : (ctx.page || 'Genel');
    mount(ctxLine, 'Bağlam: ', h('b', where), ctx.exercise ? ' · alıştırma açık' : '', ctx.getCode ? ' · kod görülebiliyor' : '');
    closeBtn.style.display = location.hash.startsWith('#/tutor') ? 'none' : '';
  }

  function renderAll() {
    msgs.innerHTML = '';
    if (!state.tutor.messages.length) {
      msgs.append(bubble('bot', welcomeHtml()));
    }
    for (const m of state.tutor.messages) msgs.append(bubble(m.role === 'user' ? 'user' : 'bot', m.html ?? (m.role === 'user' ? esc(m.text).replace(/\n/g, '<br>') : md(m.text)), m.src));
    msgs.scrollTop = msgs.scrollHeight;
  }

  function welcomeHtml() {
    return `<b>Merhaba! Ben eğitmeninim.</b><br>Sana kavramları basitçe anlatabilir, kodunu inceleyebilir, hata mesajlarını açıklayabilir, ipucu verebilir ve seviyene uygun ek alıştırma önerebilirim. Çözümü hemen vermem — birlikte bulacağız. 🙂<br><br>Aşağıdaki hızlı düğmeleri kullan ya da soru yaz.${hasKey(state.settings) ? '' : '<div class="src">Şu an <b>çevrimdışı eğitmen</b> modundayım. Serbest sohbet için Ayarlar\'dan kendi Claude API anahtarını ekleyebilirsin.</div>'}`;
  }

  function bubble(kind, html, src) {
    const b = h('div.msg', { class: kind });
    b.innerHTML = rich(html);
    if (src) b.append(h('div.src', src));
    return b;
  }

  function push(m) {
    state.tutor.messages.push(m);
    if (state.tutor.messages.length > 80) state.tutor.messages.splice(0, state.tutor.messages.length - 80);
    save();
  }

  function clearChat() { state.tutor.messages = []; save(); renderAll(); }

  async function respond(userText, action, extra) {
    if (busy) return;
    busy = true;
    sendBtn.disabled = true;
    const online = hasKey(state.settings);
    // ipucu ve ek alıştırma: önce müfredattaki hazır içeriği kullan
    if (action === 'hint' && ctx.revealHint) {
      const ok = ctx.revealHint();
      const ex = ctx.exercise, n = ctx.exerciseState?.hintsUsed || 0;
      if (ok && ex) {
        push({ role: 'bot', html: `<b>İpucu ${n}/${ex.hints.length}:</b> ${ex.hints[n - 1]}<div class="src">Alıştırma panelinde de görünür. Takılırsan "Kodumu incele" de diyebilirsin.</div>` });
        renderAll(); busy = false; sendBtn.disabled = false; return;
      }
      if (!ok && !online) {
        push({ role: 'bot', html: 'Bu alıştırmanın tüm hazır ipuçlarını açtın. Şimdi "Kodumu incele" ile kodundaki sorunları birlikte bulalım ya da 3 denemeden sonra örnek çözümü görebilirsin.' });
        renderAll(); busy = false; sendBtn.disabled = false; return;
      }
    }
    if (action === 'extra' && ctx.openExtra && ctx.lesson?.extras?.length) {
      const ad = adaptiveDifficulty();
      ctx.openExtra(ad.level);
      push({ role: 'bot', html: `Performansına göre <b>${['', 'kolay', 'orta', 'zor'][ad.level]}</b> seviyede bir ek alıştırma açtım (Ek pratik sekmesi). <span class="muted">${ad.reason}</span>${online ? '<br>Ayrıca aşağıda sana özel yeni bir alıştırma üretiyorum.' : ''}` });
      renderAll();
      if (!online) { busy = false; sendBtn.disabled = false; return; }
    }
    if (!online) {
      const html = offlineAnswer({ action, text: userText, extra });
      push({ role: 'bot', html, src: 'Çevrimdışı eğitmen' });
      renderAll();
      busy = false; sendBtn.disabled = false;
      return;
    }
    // Claude
    const apiContent = `${contextBlock()}\n\n${userText}`;
    const userMsg = [...state.tutor.messages].reverse().find(m => m.role === 'user');
    if (userMsg && userMsg.role === 'user') userMsg.api = apiContent;
    const history = [];
    for (const m of state.tutor.messages) {
      if (m.role === 'user' && m.api) history.push({ role: 'user', content: m.api });
      else if (m.role === 'assistant' && m.claude) history.push({ role: 'assistant', content: m.text });
    }
    // alternasyonu garanti et ve son ~20 mesajla sınırla
    const conv = [];
    for (const m of history) { if (conv.length && conv[conv.length - 1].role === m.role) conv[conv.length - 1] = m; else conv.push(m); }
    while (conv.length && conv[0].role !== 'user') conv.shift();
    const trimmed = conv.slice(-20);
    if (trimmed[0]?.role !== 'user') trimmed.shift();
    const live = bubble('bot', '<span class="typing">Düşünüyorum</span>');
    msgs.append(live);
    msgs.scrollTop = msgs.scrollHeight;
    try {
      const text = await askClaude({
        apiKey: state.settings.apiKey.trim(), model: state.settings.model, messages: trimmed,
        onText: (t) => { live.innerHTML = rich(md(t)); live.classList.remove('typing'); msgs.scrollTop = msgs.scrollHeight; },
      });
      push({ role: 'assistant', text, claude: true, src: state.settings.model });
    } catch (e) {
      const html = offlineAnswer({ action, text: userText, extra });
      push({ role: 'bot', html: `<div class="muted small">⚠ ${esc(e.message)}</div>${html}`, src: 'Çevrimdışı eğitmen (yedek)' });
    }
    renderAll();
    busy = false; sendBtn.disabled = false;
  }

  function send() {
    const t = ta.value.trim();
    if (!t || busy) return;
    ta.value = '';
    push({ role: 'user', text: t });
    renderAll();
    respond(t, 'ask');
  }

  function handle(detail = {}) {
    refreshHeader();
    const { action } = detail;
    if (!action) return;
    if (action === 'teach' && detail.topic) {
      const t = detail.topic;
      const text = `"${t.title}" (${t.titleEn}) dersini bana adım adım öğret. Hedefler: ${(t.objectives || []).join('; ')}. Konular: ${(t.topics || []).join(', ')}. Her seferinde tek bir kavram anlat, 3D/CAD benzetmesi kur, kısa bir C# örneği ver ve devam etmeden önce bana küçük bir soru sor.`;
      push({ role: 'user', text: `📘 "${t.title}" dersini benimle çalış.` });
      renderAll();
      respond(text, 'teach', { topic: t });
      return;
    }
    const label = ACTIONS.find(a => a[0] === action)?.[1] || action;
    push({ role: 'user', text: `⚡ ${label}` });
    renderAll();
    respond(ACTION_PROMPTS[action] || label, action, detail);
  }

  return {
    el,
    handle,
    mountIn(container) { if (el.parentNode !== container) container.append(el); refreshHeader(); renderAll(); },
    focus() { setTimeout(() => ta.focus(), 50); },
  };
}
