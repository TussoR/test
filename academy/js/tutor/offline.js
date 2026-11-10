// Çevrimdışı eğitmen: API anahtarı olmadan çalışan, ders içeriği + kurallarla yanıt üreten motor.

import { esc, stripHtml } from '../core/dom.js';
import { ctx } from '../core/context.js';
import { explainError } from '../csharp/diagnostics.js';
import { formatError } from '../csharp/index.js';
import { reviewCode, didYouMean, errorNameFromMessage } from './reviewer.js';
import { checkExercise } from '../core/checker.js';
import { findConcepts } from './concepts.js';
import { adaptiveDifficulty, state } from '../core/store.js';
import { allLessons } from '../content/modules.js';

const SEV = { error: ['⛔', 'var(--err)'], warn: ['⚠️', 'var(--warn)'], info: ['💡', 'var(--accent)'], good: ['✅', 'var(--ok)'] };

function conceptHtml(c) {
  return `<b>${esc(c.title)}</b> <span class="muted">(${esc(c.en)} · <span class="jp">${esc(c.ja)}</span>)</span><br>${esc(c.simple)}`
    + (c.analogy ? `<br><i>Benzetme:</i> ${esc(c.analogy)}` : '')
    + (c.example ? `<pre><code>${esc(c.example)}</code></pre>` : '');
}

function termsIn(html) {
  const out = [];
  for (const m of String(html || '').matchAll(/<t\s+en="([^"]*)"(?:\s+ja="([^"]*)")?>([\s\S]*?)<\/t>/g)) out.push({ en: m[1], ja: m[2], tr: stripHtml(m[3]) });
  return out;
}

function currentStep() {
  if (!ctx.lesson || !ctx.stepTitle) return null;
  return ctx.lesson.steps?.find(s => s.title === ctx.stepTitle) || null;
}

function explain(text) {
  const st = currentStep();
  const parts = [];
  if (st && ctx.phase === 'learn') {
    const body = stripHtml(st.body || st.caption || '');
    const sentences = body.split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
    parts.push(`<b>"${esc(st.title)}" — kısaca:</b><br>${esc(sentences.slice(0, 3).join(' ')) || 'Bu kart bir kod örneği; satırlara tıklayarak açıklamaları gör ve "Adım adım" ile çalıştır.'}`);
    if (st.kind === 'code' && st.explain) {
      const first = Object.entries(st.explain).slice(0, 3).map(([n, t]) => `<li><b>Satır ${n}:</b> ${t}</li>`).join('');
      parts.push(`<b>En önemli satırlar:</b><ul>${first}</ul>`);
    }
    const analogy = ctx.lesson.steps.find(s => s.kind === 'analogy');
    if (analogy && analogy !== st) parts.push(`<b>Benzetme:</b> ${esc(stripHtml(analogy.body).split(/(?<=[.!?])\s+/).slice(0, 2).join(' '))}`);
    const terms = termsIn(st.body || st.caption);
    if (terms.length) parts.push('<b>Terimler:</b> ' + terms.map(t => `${esc(t.tr)} = <i>${esc(t.en)}</i>${t.ja ? ` / <span class="jp">${esc(t.ja)}</span>` : ''}`).join(' · '));
  }
  const concepts = findConcepts(`${text || ''} ${ctx.stepTitle || ''} ${ctx.lessonMeta?.title || ''}`, st ? 1 : 2);
  for (const c of concepts) parts.push(conceptHtml(c));
  if (!parts.length) {
    parts.push('Hangi kavramı açıklamamı istersin? Örneğin: <i>değişken, int ile double farkı, döngü, fonksiyon, dizi, exception, vektör…</i> yaz. Bir dersin içindeyken bu düğmeye basarsan o kartı özetlerim.');
  }
  return parts.join('<br><br>');
}

function review() {
  const code = ctx.getCode ? ctx.getCode() : null;
  if (!code || !code.trim()) return 'İnceleyebileceğim bir kod göremiyorum. Bir alıştırma, kod örneği ya da <a href="#/playground">Kod Alanı</a> açıkken tekrar dene.';
  const { findings, run } = reviewCode(code, { stdin: ctx.exercise?.stdin });
  let html = '<b>Kod incelemesi</b><ul>' + findings.map(f => `<li><span style="color:${SEV[f.sev][1]}">${SEV[f.sev][0]}</span> ${f.line ? `<b>Satır ${f.line}:</b> ` : ''}${f.msg}</li>`).join('') + '</ul>';
  if (ctx.exercise && !run.error) {
    const res = checkExercise(code, ctx.exercise);
    if (res.passed) html += '<b>Alıştırma kontrolü:</b> tüm gereklilikler sağlanıyor. "Kontrol et"e basabilirsin! 🎉';
    else {
      const failed = res.results.filter(r => !r.ok).map(r => esc(r.msg));
      html += `<b>Alıştırma kontrolü:</b> şu gereklilik(ler) henüz sağlanmıyor:<ul>${failed.map(f => `<li>${f}</li>`).join('')}</ul>`;
      if (res.feedback?.why) html += `<div>${res.feedback.why}</div>`;
      html += '<div class="muted small">Kendine sor: Programın her satırı neyi yazdırıyor? Beklenen çıktıyla satır satır karşılaştır. "Adım adım" modu burada çok işe yarar.</div>';
    }
  }
  return html;
}

function errorExplain() {
  const r = ctx.lastRun?.result;
  if (!r || !r.error) return 'Son çalıştırmada bir hata görmüyorum. 🙂 Kodu çalıştır; hata alırsan bu düğmeye tekrar bas, ne olduğunu açıklayayım.';
  const info = explainError(r.error);
  const code = ctx.lastRun.code || '';
  const lineText = code.split('\n')[(r.error.line || 1) - 1] ?? '';
  let html = `<b>${esc(info.title)}</b> <span class="muted">(${esc(info.kindLabel || '')})</span><br><code>${esc(formatError(r.error))}</code>`;
  if (lineText.trim()) html += `<br>İlgili satır (${r.error.line}): <code>${esc(lineText.trim())}</code>`;
  html += `<br><br><b>Ne oldu?</b> ${info.why}<br><b>Nasıl düzeltilir?</b> ${info.fix}`;
  const nm = errorNameFromMessage(r.error.message);
  const dym = ['CS0103', 'CS0117', 'CS1061'].includes(r.error.code) ? didYouMean(nm, code) : null;
  if (dym) html += `<br><br>🔎 <code>${esc(nm)}</code> yerine <b><code>${esc(dym)}</code></b> mı yazmak istedin? C# büyük/küçük harfe duyarlıdır.`;
  if (r.error.code === 'CS1002') html += '<br><br>🔎 Not: Derleyici eksik <code>;</code> hatasını bazen <i>bir sonraki</i> satırın başında fark eder. Hem bu satırın hem de bir önceki satırın sonuna bak.';
  if (r.error.kind === 'runtime') html += '<br><br>Bu bir <b>çalışma zamanı</b> hatası: kod derlendi ama çalışırken bir şey ters gitti. "Adım adım" ile hatadan hemen önceki değişken değerlerine bak — sorun genelde orada görünür.';
  const seen = state.stats.errorsSeen[r.error.code] || 0;
  if (seen >= 3) html += `<div class="muted small">Bu hatayı ${seen}. kez görüyorsun — normal! Profesyoneller de en sık aynı birkaç hatayı yapar; zamanla gözün hemen yakalayacak.</div>`;
  return html;
}

function vocab() {
  const v = ctx.lesson?.vocab || ctx.lessonMeta?.vocab || [];
  if (!v.length) return 'Bu sayfada derse özel kelime listesi yok. Tüm kelimeler için <a href="#/vocab">Japonca Sözlük</a> sayfasına bak.';
  return '<b>Bu dersin Japonca terimleri</b><ul>' + v.map(x => `<li><b>${esc(x.en)}</b> — ${esc(x.tr)} — <span class="jp">${esc(x.ja)}</span> <span class="muted">(${esc(x.kana && x.kana !== x.ja ? x.kana + ', ' : '')}${esc(x.romaji)})</span></li>`).join('') + '</ul><div class="muted small">İpucu: Japon ekiplerinde katakana terimler (コンパイル, デバッグ…) çok yaygındır; kanji terimler (変数, 関数, 実行…) dokümanlarda sık geçer.</div>';
}

function extra() {
  const ad = adaptiveDifficulty();
  const label = ['', 'kolay', 'orta', 'zor'][ad.level];
  // derse özel ek alıştırma yoksa: en son tamamlanan derslerden birini öner
  const done = allLessons().filter(l => l.interactive && state.lessons[l.id]?.completed);
  const pick = done[done.length - 1];
  if (pick) return `Senin için önerilen seviye: <b>${label}</b>. <span class="muted">${esc(ad.reason)}</span><br>Ek alıştırmalar ders sayfalarında, zorluğa göre sıralı. Son tamamladığın ders: <a href="#/lesson/${pick.id}?phase=extras">${esc(pick.title)} → Ek pratik</a>.`;
  return `Önerilen seviye: <b>${label}</b>. Henüz tamamlanmış bir ders yok — <a href="#/curriculum">ilk dersle</a> başla; her dersin "Ek pratik" sekmesinde zorluğa göre alıştırmalar var.`;
}

function teach(topic) {
  if (!topic) return explain('');
  const concepts = findConcepts(`${topic.title} ${topic.titleEn} ${(topic.topics || []).join(' ')}`, 3);
  let html = `<b>📘 ${esc(topic.title)}</b> <span class="muted">(${esc(topic.titleEn)} · <span class="jp">${esc(topic.titleJa || '')}</span>)</span><br>${esc(topic.summary || '')}`;
  if (topic.objectives?.length) html += `<br><br><b>Çalışma planı (her hedef için ~20 dk):</b><ol>${topic.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ol>`;
  for (const c of concepts) html += '<br>' + conceptHtml(c);
  html += '<br><b>Önerim:</b> Her hedef için Microsoft Learn\'de kısa bir bölüm oku, ardından <a href="#/playground">Kod Alanı</a>\'nda küçük bir örnek yaz ve çalıştır. Kodunu yazınca "Kodumu incele" de.';
  html += '<div class="muted small">Not: Çevrimdışı moddayım; bu dersi etkileşimli olarak adım adım anlatabilmem için Ayarlar\'dan Claude API anahtarı ekleyebilirsin.</div>';
  return html;
}

function ask(text) {
  const t = (text || '').toLocaleLowerCase('tr');
  if (/(çözüm|cevap|cevabı|çözümü)\s*(ver|söyle|göster)/.test(t)) {
    return 'Çözümü doğrudan vermek yerine seni oraya götürmek istiyorum — kendin bulduğunda kalıcı olur. 🙂 "İpucu ver" ile kademeli ipuçlarını aç, "Kodumu incele" ile neyin eksik olduğunu göreyim. 3 başarısız denemeden sonra alıştırma panelinde örnek çözümü açabilirsin.';
  }
  if (/hata|error|cs\d{4}|exception/.test(t) && ctx.lastRun?.result?.error) return errorExplain();
  if (/incele|review|kodum|kontrol/.test(t)) return review();
  if (/japonca|日本|kelime/.test(t)) return vocab();
  if (/ipucu|hint|takıldım|takildim/.test(t)) {
    if (ctx.revealHint && ctx.revealHint()) {
      const n = ctx.exerciseState.hintsUsed;
      return `<b>İpucu ${n}:</b> ${ctx.exercise.hints[n - 1]}`;
    }
    return 'Şu an açık bir alıştırma yok ya da tüm ipuçlarını açtın. "Kodumu incele" ile birlikte bakalım.';
  }
  const cs = findConcepts(text, 2);
  if (cs.length) return cs.map(conceptHtml).join('<br><br>');
  // ders kartlarında anahtar kelime ara
  if (ctx.lesson) {
    const words = t.split(/[^\p{L}\d#]+/u).filter(w => w.length > 3);
    let best = null, bestScore = 0;
    for (const s of ctx.lesson.steps) {
      const body = stripHtml(`${s.title} ${s.body || ''} ${s.caption || ''}`).toLocaleLowerCase('tr');
      const score = words.filter(w => body.includes(w)).length;
      if (score > bestScore) { best = s; bestScore = score; }
    }
    if (best && bestScore) return `Bu dersteki şu kart sorunla ilgili görünüyor: <b>${esc(best.title)}</b><br>${esc(stripHtml(best.body || best.caption || '').slice(0, 420))}…`;
  }
  return 'Bunu çevrimdışı modda tam yanıtlayamıyorum. Şunları deneyebilirsin: bir kavram adı yaz (ör. <i>"döngü nedir"</i>, <i>"int ve double farkı"</i>), "Kodumu incele" veya "Hatamı açıkla" düğmelerini kullan. Serbest sohbet için Ayarlar\'dan Claude API anahtarı ekleyebilirsin.';
}

export function offlineAnswer({ action, text, extra: ex }) {
  switch (action) {
    case 'explain': return explain(text);
    case 'review': return review();
    case 'error': return errorExplain();
    case 'hint': return ask('ipucu');
    case 'extra': return extra();
    case 'vocab': return vocab();
    case 'teach': return teach(ex?.topic);
    default: return ask(text);
  }
}
