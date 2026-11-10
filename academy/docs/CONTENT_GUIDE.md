# İçerik Yazım Rehberi (Content Guide)

Bu belge, platforma yeni ders / proje / müfredat içeriği eklemek için gereken her şeyi anlatır.
Referans ders: `js/content/m1/l01.js` — yeni bir ders yazmadan önce onu baştan sona oku ve aynı kaliteyi hedefle.

## Genel ilkeler

- **Dil:** Tüm açıklamalar Türkçe. Programlama anahtar kelimeleri İngilizce kalır (`int`, `if`, `class`...).
- **Teknik terimler:** İlk geçtiği yerde `<t en="Variable" ja="変数">değişken</t>` etiketiyle yaz.
  Arayüz bunu İngilizce + Japonca ipuçlu bir "terim çipi"ne dönüştürür.
- **Öğrenci profili:** Programlamaya sıfırdan başlıyor; Blender, Maya, ZBrush, Substance Painter, Photoshop,
  topoloji, UV, oyun için asset optimizasyonu ve Roblox Studio deneyimi var. Hedef: Japonya'da CAD/BIM yazılımı
  geliştiren bir şirkette (Fukui Computer) geliştirici pozisyonu. **Her derste 3D/CAD bağlantısı kur.**
- **Tek seferde tek kavram.** Uzun metin duvarları yok. Her adım (step) kısa, odaklı bir kart olmalı (≈ 80–200 kelime).
- **Neden?** Sadece "nasıl" değil: neden çalışıyor, bilgisayar nasıl işliyor, ne zaman kullanılır, gerçek yazılımda nerede.
- **Dürüstlük:** Şirketler veya ürünler hakkında doğrulanamayan iddialarda bulunma (ör. "Fukui Computer şu dili kullanır" deme).
  İş garantisi vaat etme.

## Dosya yapısı

```
js/content/helpers.js          → export const cs = String.raw   (C# kodu için)
js/content/modules.js          → tüm modüllerin ve derslerin dizini
js/content/m1/l01.js ...       → tam etkileşimli dersler
js/content/m1/project.js       → modül projesi (kind: 'project')
js/content/projects/p1.js ...  → Modül 8 portfolyo projeleri (kind: 'project')
js/content/outline.js          → Modül 2–8'in ders taslakları (henüz tam yazılmamış dersler)
js/content/roadmap.js          → 6 aylık plan
```

## JS sözdizimi tuzakları (ÖNEMLİ)

- Her C# kodu alanını **`cs\`...\``** ile yaz (String.raw). Böylece `\n` gibi kaçış dizileri C# koduna olduğu gibi geçer.
- `cs` şablonları içinde **ters tırnak (`) ve `${`** kullanma. C#'ın `$"...{x}..."` yazımı sorun değil (`$"` ve `{` ayrı).
- HTML gövdeleri normal şablon dizesi (`` `...` ``). İçlerinde `\` kullanma; `<`, `>` ve `&` için `&lt;` `&gt;` `&amp;` yaz
  (özellikle `List&lt;int&gt;`, `a &amp;&amp; b`, `x &lt; 5`).
- Tek tırnaklı JS dizelerinde (`'...'`) içerik `'` içeriyorsa `\'` ile kaçır.
- `options` içindeki çok satırlı çıktılar için `'A\nB'` (gerçek yeni satır) kullan.

## Ders şeması

```js
import { cs } from '../helpers.js';
export default {
  id: 'm1-l02', module: 'm1',
  title: 'Türkçe başlık', titleEn: 'English title', titleJa: '日本語タイトル',
  minutes: 60,            // tahmini süre
  level: 1,               // 1..5 zorluk
  objectives: ['...'],    // 3–5 öğrenme hedefi
  steps: [ /* aşağıdaki adım türleri, 7–11 adım */ ],
  exercise: { /* ZORUNLU alıştırma — geçilmeden ders tamamlanmaz */ },
  quiz: [ /* 4–6 soru — hepsi doğru cevaplanmadan ders tamamlanmaz */ ],
  challenge: { /* daha zor, isteğe bağlı pratik görev */ },
  extras: [ /* 2–3 ek alıştırma: difficulty 1, 2, 3 — AI eğitmen "ek alıştırma" isteyince kullanılır */ ],
  vocab: [ { en, tr, ja, kana, romaji } ],   // 6–12 Japonca teknik terim
  summary: ['...'],       // 4–6 maddelik özet
}
```

### Adım türleri (`steps`)

| kind | Alanlar | Kullanım |
|---|---|---|
| `concept` | `title`, `body` (HTML) | Basit açıklama |
| `analogy` | `title`, `body` | Gerçek dünya / 3D benzetmesi |
| `visual` | `title`, `svg` (satır içi SVG) veya `html`, `caption` (HTML) | Görsel açıklama |
| `code` | `title`, `code` (cs), `explain` {satırNo: HTML}, `runnable`, `stepper`, `editable`, `expectError`, `stdin`, `note` | Kod örneği + satır satır açıklama |
| `predict` | `title`, `code`, `options` [çıktı dizeleri], `answer` (indeks), `explain` | "Çıktıyı tahmin et" |
| `warning` | `title`, `body` | Sık yapılan hatalar |
| `cad` | `title`, `body` | 3D / CAD / BIM bağlantısı |

- `code` adımında `explain` **her önemli satırı** açıklamalı (satır numaraları 1'den başlar).
- `stepper: true` → öğrenci kodu satır satır yürütüp değişkenlerin değiştiğini izleyebilir. Değişken/döngü/fonksiyon derslerinde çok değerli.
- `editable: true` + `expectError: true` → "hata avı" kartı (kod bilerek hatalı).
- Validator, `predict.options[answer]`'ı **gerçekten çalıştırıp** karşılaştırır.

### SVG kuralları

`viewBox` kullan, sabit genişlik verme. Renkler için CSS sınıfları: `class="box"` (kutu), `box hi` (vurgulu kutu),
`box dim` (soluk kutu), metin için `class="t1"` (başlık), `t2` (ikincil), `t3` (küçük etiket), `class="ln"` (çizgi),
`class="acc"` (vurgu dolgusu). Ok ucu için `<marker>` içinde `fill="var(--accent)"`. Marker id'leri **ders başına benzersiz** olsun (ör. `ar-l02`).
Kullanılabilir CSS değişkenleri: `var(--accent)`, `var(--accent-2)`, `var(--ok)`, `var(--warn)`, `var(--err)`, `var(--fg)`, `var(--muted)`, `var(--x)`, `var(--y)`, `var(--z)` (eksen renkleri).

### Alıştırma şeması (`exercise`, `challenge`, `extras[]`)

```js
{
  title: '...',
  difficulty: 1,                // sadece extras için
  prompt: `<p>Görev...</p><pre class="expected">beklenen çıktı</pre>`,
  starter: cs`// başlangıç kodu`,  // çözümü İÇERMEMELİ, validator starter'ın geçmediğini kontrol eder
  stdin: '5\n3',                // isteğe bağlı: Console.ReadLine() girdileri (satır satır)
  checks: [
    { type: 'output', expect: 'Toplam: 8', mode: 'exact', msg: 'Kullanıcıya gösterilecek gereklilik' },
    { type: 'output', expect: '...', stdin: '10\n2', msg: 'farklı girdiyle de doğru çalışmalı' },
    { type: 'code', pattern: 'for\\s*\\(', msg: 'for döngüsü kullanmalısın' },     // yorumlar çıkarılarak aranır
    { type: 'notCode', pattern: 'Console\\.WriteLine\\(\\s*"?8', msg: 'Sonucu elle yazma, hesapla' },
    { type: 'harness', append: cs`Console.WriteLine(Kare(7));`, expect: '49', msg: 'Kare(7) 49 döndürmeli' },
  ],
  hints: ['1. ipucu: yön göster', '2. ipucu: daha somut', '3. ipucu: neredeyse çözüm ama tam değil'],
  solution: cs`...`,           // sadece 3 başarısız denemeden sonra açılabilir
  explain: 'Geçtikten sonra gösterilen kısa açıklama (neden çalıştı)',
}
```

- `mode`: `exact` (varsayılan; satır sonu boşlukları yok sayılır), `contains`, `lines` (sırayla bu satırlar geçmeli), `regex`, `ci` (büyük/küçük harf duyarsız).
- `harness`: öğrencinin koduna eklenen test kodu; **sadece harness'ın çıktısı** karşılaştırılır. Fonksiyon alıştırmalarında kullan.
  Fonksiyon alıştırmalarında başlangıç kodu üst düzey (top-level) yerel fonksiyon biçiminde olsun:
  `int Kare(int n) { /* ... */ }` — `class Program` İÇİNE yazma (harness ona erişemez).
- "Sonucu elle yazma" hilesini engellemek için gerekirse `notCode` veya farklı `stdin` ile ikinci bir `output` kontrolü ekle.
- İpuçları kademeli olmalı; ilk ipucu çözümü vermemeli.

### Quiz şeması

```js
{ q: 'Soru?', code: cs`isteğe bağlı kod`, verifyOutput: true /* doğru seçenek = kodun gerçek çıktısı ise */,
  options: [
    { t: 'Seçenek', correct: true, why: 'Neden doğru' },
    { t: 'Seçenek', why: 'Neden yanlış — öğrenciye ne yanlış anladığını açıkla' },
  ] }
```
Her seçenekte `why` zorunlu. Tam olarak 1 doğru seçenek. "Çıktı ne olur?" sorularında `verifyOutput: true` kullan.

### Kelime listesi (`vocab`)

`{ en: 'Variable', tr: 'Değişken', ja: '変数', kana: 'へんすう', romaji: 'hensū' }` — sadece emin olduğun,
Japon yazılım sektöründe gerçekten kullanılan terimler. Katakana terimlerde `kana` = `ja`.

## Tarayıcı içi C# yorumlayıcısının desteklediği özellikler

Destekli: üst düzey deyimler ve `class Program { static void Main() }`; `int long double float decimal bool char string var object`;
`const`; aritmetik (tam sayı bölmesi C# gibi), `% ++ -- += -= *= /=`; `== != < > <= >= && || !`; `?:`, `??`;
string birleştirme, `$"...{x:F2}..."` (F, N, D, P, X, E, 0.00 biçimleri), kaçış dizileri, `@"..."`;
`if/else`, `switch` (case/default/break), `while`, `do/while`, `for`, `foreach`, `break`, `continue`, `return`;
yerel fonksiyonlar (`int Kare(int n) => n*n;`), varsayılan/adlandırılmış parametreler, `out`, `ref`, `params`, özyineleme (≈400 derinlik);
diziler (`int[]`, `new int[5]`, `{1,2}`, 2B `int[,]`), `List<T>`, `Dictionary<K,V>`, `HashSet<T>`, `Stack<T>`, `Queue<T>`, `StringBuilder`, `Random(seed)`;
LINQ yöntem sözdizimi (Where, Select, OrderBy, Sum, Average, Max, Min, Count, Any, All, First..., ToList, Distinct, GroupBy...), lambdalar;
`try/catch/finally`, `throw`, `when`; yerleşik exception'lar (FormatException, DivideByZeroException, IndexOutOfRangeException,
ArgumentException, InvalidOperationException, NullReferenceException, KeyNotFoundException...); özel exception sınıfları;
sınıflar, alanlar, özellikler (auto/get/set/private set/=>), kurucular (`: base(...)`, `: this(...)`), static üyeler,
erişim belirleyiciler (private erişim hatası verir), kalıtım, `virtual/override/abstract`, `interface`, `enum`, `record`,
`is`/`as`, cast; `Math.*`, `int.Parse/TryParse`, `double.Parse`, `Convert.*`, `string.*` yöntemleri, `char.*`;
`Console.ReadLine()` (stdin'den), sanal bellek içi `File.ReadAllText/WriteAllText/...`.

Desteklenmeyen: switch ifadeleri (`x switch { ... }`), tuple'lar, LINQ sorgu sözdizimi (`from x in ...`), operatör aşırı yükleme,
kullanıcı tanımlı generic sınıflar (kısmen), async/await, struct'ların değer semantiği (kısmen), indexer tanımlama, olaylar (event),
`DateTime.Now`, gerçek dosya sistemi, WinForms/WPF. Bunları sadece `runnable: false` olan kod örneklerinde göster.

Kültür: Sayı biçimlendirme InvariantCulture gibi davranır (`3.5`, binlik ayırıcı `,`). `double.Parse("3,5")` → 35!

## Doğrulama

Her içerik dosyası yazıldıktan sonra:

```
node academy/tools/validate.mjs academy/js/content/m1/l02.js
```

Hata kalmayana kadar düzelt. Uyarılar (⚠) da mümkünse giderilmeli.

## Proje şeması (`kind: 'project'`)

```js
export default {
  kind: 'project', id: 'p1', module: 'm8',
  title, titleEn, titleJa, minutes, level,
  environment: 'browser' | 'desktop',  // browser = adımlar burada çalışır; desktop = Visual Studio'da yapılır
  summary: `<p>HTML</p>`,
  goals: ['...'], skills: ['...'],     // kazanılan beceriler
  demo: 'draw2d' | 'transform3d' | 'geometry3d' | 'minicad' | undefined,  // tarayıcı önizlemesi (arayüzde var)
  steps: [
    { title, body: `HTML`, code: cs`...`, runnable: true|false, stdin, exercise: { ...alıştırma şeması... }, checklist: ['Yaptım: ...'] },
  ],
  finalChecklist: ['...'],             // portfolyo kontrol listesi (README, ekran görüntüsü, GitHub...)
  extensions: ['...'],                 // ileri seviye fikirler
  vocab: [ ... ],
}
```
Bir adım "tamamlandı" sayılır: alıştırması varsa geçilince; yoksa checklist maddeleri işaretlenince; ikisi de yoksa "Okudum" ile.
Desktop projelerinde kod örnekleri `runnable: false` olmalı (WinForms/WPF tarayıcıda çalışmaz) ve Visual Studio adımları net olmalı.
