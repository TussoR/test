// Claude API ile çevrimiçi eğitmen (isteğe bağlı). Anahtar sadece bu tarayıcıda saklanır
// ve yalnızca api.anthropic.com'a gönderilir. Resmi TypeScript SDK tarayıcıda CDN'den yüklenir.

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.2.0/+esm';
let sdkPromise = null;
function loadSdk() {
  if (!sdkPromise) sdkPromise = import(SDK_URL).catch((e) => { sdkPromise = null; throw e; });
  return sdkPromise;
}

// Sabit sistem istemi (önbelleğe alınabilir olsun diye değişken bağlam buraya değil, kullanıcı mesajına eklenir).
export const SYSTEM_PROMPT = `Sen "Kaihatsu Akademi" platformunun AI eğitmenisin. Öğrencin Türkçe konuşan, programlamaya SIFIRDAN başlayan biri.
Geçmişi: Blender, Maya, ZBrush, Substance Painter, Photoshop; 3D modelleme, topoloji, UV, oyun için asset optimizasyonu, Roblox Studio.
Hedefi: Japonya'da CAD/BIM yazılımı geliştiren bir şirkette yazılım geliştirici (開発職) olmak. Ana dil: C#.

Kurallar:
- Her zaman Türkçe yanıt ver. C# anahtar kelimeleri ve kod İngilizce kalır.
- Teknik bir terimi ilk kullandığında İngilizcesini ve Japoncasını ver: ör. "değişken (variable, 変数 / hensū)".
- Basit dil kullan; bir kavramı açıklarken mümkünse 3D/Blender/Maya/CAD benzetmesi kur.
- ÇÖZÜMÜ HEMEN VERME. Önce ipucu ver, yönlendirici soru sor, hatanın NEDENİNİ açıkla. Öğrenci açıkça tam çözüm isterse bile önce yaklaşımı anlat; tam kodu yalnızca birkaç denemeden sonra ve satır satır açıklamasıyla ver.
- Kod incelemesinde satır numarası ver, önce iyi yapılanı söyle, sonra en önemli 1–3 sorunu "neden" açıklamasıyla belirt.
- Derleyici hatalarını açıklarken: hata kodu ne demek, bilgisayar neden bunu kabul etmiyor, nasıl düzeltilir (çözümü yazmadan).
- Ek alıştırma istenirse: öğrencinin seviyesine uygun, net beklenen çıktısı olan, 3D/CAD temalı bir görev ver; çözümü verme.
- Kodlar tarayıcı içi bir C# alt kümesi yorumlayıcısında çalışır (üst düzey deyimler, sınıflar, List/Dictionary, LINQ, try/catch desteklenir; WinForms/WPF, async, tuple, switch ifadeleri desteklenmez). Örneklerini buna uygun yaz.
- Yanıtlar kısa ve odaklı olsun (genelde 150–300 kelime). Markdown kullanabilirsin; kod blokları için \`\`\`csharp kullan.
- İş garantisi verme; bir şirketin iç teknolojileri hakkında doğrulanamayan iddialarda bulunma.`;

export function hasKey(settings) { return !!(settings.apiKey && settings.apiKey.trim().length > 10); }

/**
 * Claude'a mesaj gönderir ve yanıtı akış (stream) olarak iletir.
 * @param {object} o
 * @param {string} o.apiKey
 * @param {string} o.model
 * @param {Array<{role:'user'|'assistant', content:string}>} o.messages
 * @param {(text:string)=>void} o.onText   biriken metin
 * @returns {Promise<string>}
 */
export async function askClaude({ apiKey, model, messages, onText, signal }) {
  const mod = await loadSdk();
  const Anthropic = mod.default || mod.Anthropic;
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  let text = '';
  try {
    const stream = client.beta.messages.stream({
      model: model || 'claude-opus-5-5',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages,
      output_config: { effort: 'medium' },
      // Bir güvenlik sınıflandırıcısı isteği reddederse sunucu tarafında yedek modele geçilir.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    }, signal ? { signal } : undefined);
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        text += event.delta.text;
        onText && onText(text);
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      text += '\n\n_(Bu istek yanıtlanamadı. Soruyu farklı ifade etmeyi dene.)_';
      onText && onText(text);
    } else if (final.stop_reason === 'max_tokens') {
      text += '\n\n_(Yanıt uzunluk sınırına ulaştı.)_';
      onText && onText(text);
    }
    return text;
  } catch (err) {
    throw new Error(friendlyError(err, Anthropic));
  }
}

function friendlyError(err, Anthropic) {
  if (Anthropic) {
    if (Anthropic.AuthenticationError && err instanceof Anthropic.AuthenticationError) return 'API anahtarı geçersiz (401). Ayarlar\'dan anahtarı kontrol et.';
    if (Anthropic.PermissionDeniedError && err instanceof Anthropic.PermissionDeniedError) return 'Bu anahtarın bu modele erişim izni yok (403).';
    if (Anthropic.NotFoundError && err instanceof Anthropic.NotFoundError) return 'Model bulunamadı (404). Ayarlar\'daki model adını kontrol et.';
    if (Anthropic.RateLimitError && err instanceof Anthropic.RateLimitError) return 'Çok fazla istek (429). Biraz bekleyip tekrar dene.';
    if (Anthropic.APIConnectionError && err instanceof Anthropic.APIConnectionError) return 'Claude API\'ye bağlanılamadı. İnternet bağlantını kontrol et.';
    if (Anthropic.APIError && err instanceof Anthropic.APIError) return `API hatası (${err.status ?? '?'}): ${err.message}`;
  }
  if (err && /Failed to fetch|NetworkError|import/i.test(String(err.message))) return 'Claude SDK veya API\'ye ulaşılamadı (ağ). Çevrimdışı eğitmen kullanılmaya devam ediyor.';
  return String(err?.message || err);
}
