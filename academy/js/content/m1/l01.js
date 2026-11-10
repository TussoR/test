import { cs } from '../helpers.js';

export default {
  id: 'm1-l01',
  module: 'm1',
  title: 'Programlama nedir? Bilgisayar kodu nasıl çalıştırır? İlk C# programı',
  titleEn: 'What is programming? How code runs. Your first C# program',
  titleJa: 'プログラミングとは？最初のC#プログラム',
  minutes: 60,
  level: 1,
  objectives: [
    'Programın ne olduğunu ve bilgisayarın talimatları nasıl izlediğini açıklayabilmek',
    'C# kodunun derleyici → IL → .NET çalışma zamanı → işlemci yolculuğunu anlatabilmek',
    'Console.WriteLine ile ekrana yazı yazan ilk programı yazmak',
    'Derleme hatası mesajını okuyup düzeltmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Programlama nedir?',
      body: `
<p><b>Program</b>, bilgisayara <em>ne yapacağını adım adım</em> anlatan talimatlar dizisidir. <b>Programlama</b> ise bu talimatları, bilgisayarın anlayabileceği kesinlikte yazma işidir.</p>
<p>Bilgisayar çok hızlıdır ama <b>hiç tahmin yürütmez</b>. Ne yazarsan tam olarak onu yapar — ne eksik, ne fazla. Bu yüzden programcılığın özü, bir problemi <em>küçük ve net adımlara</em> bölmektir.</p>
<div class="callout"><b>Aslında bunu zaten yapıyorsun.</b> Blender'da bir <t en="modifier stack" ja="モディファイアスタック">modifier yığını</t> kurduğunda ya da Geometry Nodes ile bir ağ tasarladığında, bilgisayara "önce şunu yap, sonra bunu" diyorsun. Bu, <em>görsel programlamadır</em>. Şimdi aynı fikri metinle yazmayı öğreneceğiz.</div>
<p>Bu kursta <t en="C#" ja="シーシャープ">C#</t> (okunuşu "si şarp") dilini kullanacağız. C#; Windows masaüstü uygulamaları, Unity oyun motoru ve pek çok mühendislik/CAD aracının eklentileri için yaygın kullanılan, Microsoft tarafından geliştirilmiş modern bir dildir.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Modifier yığını = Kod satırları',
      body: `
<p>Blender'da bir küpe sırasıyla <b>Bevel → Subdivision Surface → Array</b> modifier'larını eklediğini düşün. Blender bunları <b>yukarıdan aşağıya</b> sırayla uygular. Sırayı değiştirirsen sonuç değişir.</p>
<p>Kod da tam olarak böyle çalışır: bilgisayar satırları <b>yukarıdan aşağıya, birer birer</b> çalıştırır. Bir satır bitmeden bir sonrakine geçmez.</p>
<table class="compare">
<tr><th>Blender</th><th>C# programı</th></tr>
<tr><td>Modifier yığını</td><td>Kod satırları (deyimler / <t en="statement" ja="文">statement</t>)</td></tr>
<tr><td>Yukarıdan aşağıya değerlendirme</td><td>Yukarıdan aşağıya çalıştırma (<t en="execution" ja="実行">yürütme</t>)</td></tr>
<tr><td>Modifier parametresi yanlışsa garip sonuç</td><td>Kod yanlışsa hata ya da yanlış çıktı</td></tr>
<tr><td>Render sonucu</td><td>Programın <t en="output" ja="出力">çıktısı</t></td></tr>
</table>`,
    },
    {
      kind: 'visual',
      title: 'Kodun yolculuğu: Yazdığın metinden işlemciye',
      svg: `
<svg viewBox="0 0 760 230" role="img" aria-label="C# kodunun derleme ve çalışma adımları">
  <defs><marker id="ar1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <rect x="10" y="40" width="130" height="70" rx="10" class="box"/>
    <text x="75" y="68" class="t1">Kaynak kod</text><text x="75" y="88" class="t2">Program.cs</text>
    <rect x="200" y="40" width="130" height="70" rx="10" class="box"/>
    <text x="265" y="68" class="t1">Derleyici</text><text x="265" y="88" class="t2">Roslyn (csc)</text>
    <rect x="390" y="40" width="130" height="70" rx="10" class="box"/>
    <text x="455" y="68" class="t1">IL kodu</text><text x="455" y="88" class="t2">Program.dll</text>
    <rect x="580" y="40" width="160" height="70" rx="10" class="box"/>
    <text x="660" y="62" class="t1">.NET çalışma</text><text x="660" y="80" class="t1">zamanı (CLR + JIT)</text><text x="660" y="98" class="t2">makine koduna çevirir</text>
    <line x1="140" y1="75" x2="198" y2="75" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar1)"/>
    <line x1="330" y1="75" x2="388" y2="75" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar1)"/>
    <line x1="520" y1="75" x2="578" y2="75" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar1)"/>
    <line x1="660" y1="110" x2="660" y2="148" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar1)"/>
    <rect x="560" y="150" width="200" height="60" rx="10" class="box hi"/>
    <text x="660" y="175" class="t1">İşlemci (CPU) + Bellek (RAM)</text><text x="660" y="195" class="t2">talimatları tek tek yürütür</text>
    <text x="170" y="30" class="t3">yazarsın</text><text x="360" y="30" class="t3">kontrol + çeviri</text><text x="550" y="30" class="t3">çalıştırırsın</text>
    <rect x="10" y="150" width="520" height="60" rx="10" class="box dim"/>
    <text x="270" y="175" class="t2">Benzetme: ZBrush high-poly → retopo + bake → FBX → oyun motoru → ekranda piksel</text>
    <text x="270" y="195" class="t2">Kaynak dosya, birkaç dönüşümden geçip "çalışan" bir şeye dönüşür.</text>
  </g>
</svg>`,
      caption: `
<p><b>1. Kaynak kod:</b> İnsanların okuyabileceği metin. <b>2. Derleyici</b> (<t en="compiler" ja="コンパイラ">compiler</t>): Kodu kurallara göre kontrol eder; hata varsa <em>hiç çalıştırmadan</em> durur ve sana <t en="compile error" ja="コンパイルエラー">derleme hatası</t> verir. <b>3. IL</b> (Intermediate Language): Ara dil. <b>4. CLR/JIT:</b> Program çalışırken IL'yi bilgisayarının işlemcisinin anladığı makine koduna çevirir. <b>5. CPU:</b> Talimatları sırayla yürütür, verileri RAM'de tutar.</p>
<p class="muted">Not: Bu platformda kodun tarayıcı içinde güvenli bir C# yorumlayıcısıyla çalışır. Gerçek derleyiciyle aynı hata kodlarını (ör. CS1002) göstermeye çalışır.</p>`,
    },
    {
      kind: 'concept',
      title: 'Bilgisayar kodu nasıl çalıştırır?',
      body: `
<p>Bir bilgisayarın iki temel parçasını bilmen yeterli:</p>
<ul>
<li><b>İşlemci (CPU)</b> — talimatları yürüten "beyin". Saniyede milyarlarca basit işlem yapar: topla, karşılaştır, kopyala, atla.</li>
<li><b>Bellek (RAM)</b> — çalışma masası. Program çalışırken kullandığı verileri (sayılar, metinler, köşe koordinatları…) burada tutar.</li>
</ul>
<p>İşlemci şu döngüyü durmadan tekrarlar: <b>talimatı getir → çöz → yürüt → sonrakine geç</b> (<t en="fetch-decode-execute" ja="フェッチ・デコード・実行">fetch–decode–execute</t>).</p>
<p>Sen C# yazarken bu düşük seviyeli talimatları tek tek yazmazsın. Tek bir <code>Console.WriteLine("Merhaba");</code> satırı, arka planda binlerce makine talimatına dönüşür. <b>Programlama dili, insanla makine arasındaki tercümandır.</b></p>
<div class="callout tip">3D'den bir örnek: Viewport'ta bir objeyi döndürdüğünde, ekran kartın her karede binlerce köşenin konumunu yeniden hesaplar. Bunu yaptıran da birinin yazdığı koddur — üstelik bu hesapların matematiğini Modül 4'te kendin yazacaksın.</div>`,
    },
    {
      kind: 'code',
      title: 'İlk C# programı (klasik yapı)',
      code: cs`using System;

namespace IlkProgram
{
    class Program
    {
        static void Main()
        {
            Console.WriteLine("Merhaba, Dünya!");
        }
    }
}`,
      explain: {
        1: '<code>using System;</code> — .NET\'in <b>System</b> kütüphanesini kullanacağımızı söyler. <code>Console</code> sınıfı burada yaşar. (Blender\'da bir eklentiyi etkinleştirmek gibi.)',
        3: '<code>namespace</code> — Kodlarımızı düzenlemek için bir "klasör adı". Büyük projelerde aynı isimli sınıfların karışmasını önler.',
        4: '<code>{</code> — Süslü parantez bir <b>blok</b> açar. Her açılan <code>{</code> mutlaka bir <code>}</code> ile kapanır.',
        5: '<code>class Program</code> — C#\'ta tüm kod bir <t en="class" ja="クラス">sınıf</t> içinde yaşar. Sınıfları Modül 2\'de derinlemesine öğreneceğiz.',
        7: '<code>static void Main()</code> — Programın <b>giriş noktası</b> (<t en="entry point" ja="エントリーポイント">entry point</t>). Program çalışınca ilk burası yürütülür. <code>void</code> = "geriye değer döndürmez".',
        9: '<code>Console.WriteLine("Merhaba, Dünya!");</code> — Konsola bir satır yazar. Tırnak içindeki metin bir <b>string</b>\'dir. Satır <code>;</code> ile biter.',
        10: 'Main metodunun bloğu kapanır.',
        11: 'Sınıf bloğu kapanır.',
        12: 'Namespace bloğu kapanır.',
      },
      runnable: true,
      stepper: true,
      note: 'Sağdaki ▶ Çalıştır ile programı çalıştır. Sonra "Adım adım" ile işlemcinin hangi satırda olduğunu izle. Bir satıra tıklayınca açıklaması görünür.',
    },
    {
      kind: 'code',
      title: 'Modern kısa yazım: Üst düzey deyimler (top-level statements)',
      code: cs`Console.WriteLine("Merhaba, Dünya!");
Console.WriteLine("Blender'dan koda geçiş başlıyor.");
Console.Write("Bu satır ");
Console.Write("aynı satırda devam eder.");`,
      explain: {
        1: 'C# 9 ve sonrası (.NET 6+): Küçük programlarda <code>namespace</code>, <code>class</code> ve <code>Main</code> yazmana gerek yok. Derleyici onları senin için gizlice oluşturur.',
        2: 'İkinci deyim, birincisi bittikten <b>sonra</b> çalışır. Sıra önemlidir!',
        3: '<code>Console.Write</code> satır sonu eklemez — imleç aynı satırda kalır.',
        4: 'Bu yüzden bu metin, bir önceki metnin hemen yanına yazılır.',
      },
      runnable: true,
      stepper: true,
      note: 'Alıştırmalarda çoğunlukla bu kısa yazımı kullanacağız. İki yazım da aynı sonucu üretir. Profesyonel projelerde ikisini de göreceksin.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Çıktı ne olur?',
      code: cs`Console.Write("A");
Console.WriteLine("B");
Console.WriteLine("C");`,
      options: ['A\nB\nC', 'AB\nC', 'ABC', 'A B C'],
      answer: 1,
      explain: '<code>Write</code> satır sonu eklemez, bu yüzden "B" hemen "A"nın yanına gelir. <code>WriteLine</code> ise yazdıktan sonra alt satıra geçer.',
    },
    {
      kind: 'warning',
      title: 'Yeni başlayanların en sık 3 hatası',
      body: `
<ol>
<li><b>Noktalı virgülü unutmak.</b> <code>Console.WriteLine("Merhaba")</code> → <code>error CS1002: ; expected</code></li>
<li><b>Büyük/küçük harf.</b> C# büyük/küçük harfe duyarlıdır (<t en="case-sensitive" ja="大文字と小文字を区別する">case-sensitive</t>): <code>console.writeline</code> ≠ <code>Console.WriteLine</code>.</li>
<li><b>Tırnağı kapatmamak.</b> <code>"Merhaba</code> → <code>error CS1010: Newline in constant</code></li>
</ol>
<p>Aşağıdaki kodda bir hata var. Çalıştır, hata mesajını oku ve <b>düzelt</b>. Hata mesajları düşmanın değil, en iyi yardımcındır.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Bu kodu düzelt',
      code: cs`Console.WriteLine("Mesh hazır")
Console.WriteLine("Render başlıyor...");`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: 'Derleyici bu satırın <b>sonunda</b> bir şey bekliyor. Hata mesajı satır ve sütun numarası verir: <code>(1,30)</code> = 1. satır, 30. sütun.',
      },
      note: 'İpucu: Hata mesajındaki "; expected" ne diyor?',
    },
    {
      kind: 'cad',
      title: 'Bunun CAD/BIM yazılımlarıyla ilgisi ne?',
      body: `
<p>Fukui Computer gibi şirketlerin geliştirdiği mimari BIM ve inşaat/ölçüm CAD yazılımları, milyonlarca satır koddan oluşan büyük masaüstü uygulamalarıdır. Bir duvar çizdiğinde, bir ölçü aldığında ya da bir modeli kaydettiğinde arka planda bugün öğrendiğin şey gerçekleşir: <b>talimatlar sırayla yürütülür</b>.</p>
<ul>
<li><b>Sıra önemlidir:</b> Bir duvarı önce çizip sonra kesmek ile önce kesip sonra çizmek farklı sonuç verir — tıpkı modifier sırası gibi.</li>
<li><b>Kesinlik önemlidir:</b> CAD'de 0.001 mm'lik hata bile sorun olabilir. Bilgisayarın "tahmin etmemesi" burada bir avantajdır.</li>
<li><b>Hata mesajları:</b> Profesyonel geliştiriciler de her gün derleme hatası görür. Fark, onları hızla okuyup düzeltebilmeleridir.</li>
</ul>
<p class="muted">Not: Masaüstü CAD yazılımları sektörde genellikle C++ ve C#/.NET gibi dillerle geliştirilir. Başvurmak istediğin şirketin iş ilanlarında hangi teknolojileri istediğini mutlaka kontrol et.</p>`,
    },
  ],
  exercise: {
    title: 'İlk programını yaz',
    prompt: `
<p>Ekrana <b>tam olarak</b> şu iki satırı yazdıran bir program yaz:</p>
<pre class="expected">Merhaba, C#!
3D sanatçısı yazılımcı oluyor.</pre>
<p>Her satır için ayrı bir <code>Console.WriteLine</code> kullan.</p>`,
    starter: cs`// İlk programın: aşağıya kodunu yaz
`,
    checks: [
      { type: 'output', expect: 'Merhaba, C#!\n3D sanatçısı yazılımcı oluyor.', msg: 'Çıktı iki satırdan oluşmalı ve metinler birebir aynı olmalı' },
      { type: 'code', pattern: 'Console\\.WriteLine[\\s\\S]*Console\\.WriteLine', msg: 'İki ayrı Console.WriteLine kullanmalısın' },
    ],
    hints: [
      'Bir satır yazdırmak için <code>Console.WriteLine("metin");</code> kalıbını kullanırız.',
      'Metinler çift tırnak içine yazılır: <code>"Merhaba, C#!"</code>. Virgül, ünlem ve boşluklar dahil birebir aynı olmalı.',
      'İki satır gerekiyor: ilk satırda <code>Console.WriteLine("Merhaba, C#!");</code> var. İkinci satırı da aynı kalıpla yaz ve sonuna <code>;</code> koymayı unutma.',
    ],
    solution: cs`Console.WriteLine("Merhaba, C#!");
Console.WriteLine("3D sanatçısı yazılımcı oluyor.");`,
    explain: 'Her <code>Console.WriteLine</code> çağrısı bir satır yazar ve imleci alt satıra taşır. Bilgisayar iki deyimi yukarıdan aşağıya sırayla yürüttüğü için çıktı da aynı sırada çıkar.',
  },
  quiz: [
    {
      q: 'Derleyicinin (compiler) görevi nedir?',
      options: [
        { t: 'Kodu kontrol edip makinenin çalıştırabileceği bir biçime çevirmek', correct: true, why: 'Doğru. Derleyici önce kodun kurallara uyup uymadığını kontrol eder, sonra onu ara dile (IL) çevirir.' },
        { t: 'Programı internete yüklemek', why: 'Hayır. Bu "yayınlama/dağıtım" (deployment) işidir, derleyicinin görevi değil.' },
        { t: 'Kodu otomatik olarak düzeltmek', why: 'Hayır. Derleyici hatayı bulur ve bildirir ama senin yerine düzeltmez.' },
        { t: 'Bilgisayarın RAM\'ini temizlemek', why: 'Hayır. Bellek yönetimi .NET çalışma zamanının (CLR) işidir.' },
      ],
    },
    {
      q: 'Bu kod neden derlenmez?',
      code: cs`Console.WriteLine("Merhaba")`,
      options: [
        { t: 'Satır sonunda noktalı virgül eksik', correct: true, why: 'Evet: CS1002 "; expected". C#\'ta her deyim ; ile biter.' },
        { t: 'Metin tek tırnakla yazılmalı', why: 'Hayır. Metinler (string) çift tırnakla yazılır. Tek tırnak, tek bir karakter (char) içindir.' },
        { t: 'WriteLine küçük harfle yazılmalı', why: 'Hayır, tam tersi: doğru yazım WriteLine. C# büyük/küçük harfe duyarlıdır.' },
        { t: 'Kod hatasız, derlenir', why: 'Satırın sonuna bak — eksik bir karakter var.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`Console.WriteLine("Üst");
Console.Write("Orta");
Console.WriteLine("Alt");`,
      options: [
        { t: 'Üst\nOrtaAlt', correct: true, why: 'Doğru. Write satır sonu eklemediği için "Alt", "Orta"nın hemen yanına yazılır.' },
        { t: 'Üst\nOrta\nAlt', why: 'Write ile WriteLine arasındaki farka dikkat: Write alt satıra geçmez.' },
        { t: 'ÜstOrtaAlt', why: 'İlk satır WriteLine olduğu için "Üst"ten sonra alt satıra geçilir.' },
        { t: 'Alt\nOrta\nÜst', why: 'Kod yukarıdan aşağıya çalışır, tersten değil.' },
      ],
    },
    {
      q: 'Bir C# programını (klasik yapıda) çalıştırdığında ilk hangi metot yürütülür?',
      options: [
        { t: 'Main', correct: true, why: 'Doğru. static void Main() programın giriş noktasıdır.' },
        { t: 'Start', why: 'Unity\'de Start metodu vardır ama bu standart C# programlarının giriş noktası değil.' },
        { t: 'Console', why: 'Console bir sınıftır, metot değil.' },
        { t: 'İlk yazılan sınıftaki herhangi bir metot', why: 'Hayır, giriş noktası özel olarak Main adlı metottur.' },
      ],
    },
    {
      q: 'Blender\'daki modifier yığını ile kod satırları arasındaki benzerlik nedir?',
      options: [
        { t: 'İkisi de sırayla, yukarıdan aşağıya uygulanır ve sıra sonucu değiştirir', correct: true, why: 'Doğru! Bu, programlamanın en temel fikirlerinden biri: sıralı yürütme (sequential execution).' },
        { t: 'İkisi de aynı anda, rastgele sırada çalışır', why: 'Hayır. Hem modifier\'lar hem de basit programlar belirli bir sırayla değerlendirilir.' },
        { t: 'Hiçbir benzerlik yok', why: 'Aslında güçlü bir benzerlik var: her ikisi de sıralı bir işlem zinciri.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: ASCII koordinat ekseni',
    prompt: `
<p>3D yazılımlardaki eksen göstergesini (gizmo) metinle çiz. Çıktı <b>tam olarak</b> şöyle olmalı:</p>
<pre class="expected">   Y
   |
   |____ X
  /
 Z</pre>
<p>Boşluk sayılarına dikkat et! (Blender'da Z yukarıyı gösterir; burada Y'yi yukarı aldık — Maya ve pek çok CAD/oyun motoru böyledir. Bu farkı Modül 4'te göreceğiz.)</p>`,
    starter: cs`Console.WriteLine("   Y");
// devam et...
`,
    checks: [
      { type: 'output', expect: '   Y\n   |\n   |____ X\n  /\n Z', msg: 'Çıktı birebir aynı olmalı (baştaki boşluklar dahil)' },
    ],
    hints: [
      'Her satır için bir <code>Console.WriteLine</code> kullan. Toplam 5 satır var.',
      'Baştaki boşluklar da metnin parçasıdır: <code>"   |"</code> içinde 3 boşluk var.',
      'Son iki satır: <code>"  /"</code> (2 boşluk) ve <code>" Z"</code> (1 boşluk).',
    ],
    solution: cs`Console.WriteLine("   Y");
Console.WriteLine("   |");
Console.WriteLine("   |____ X");
Console.WriteLine("  /");
Console.WriteLine(" Z");`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Tek satırda iki satır',
      prompt: '<p>Tek bir <code>Console.WriteLine</code> kullanarak iki satır yazdır: <code>Vertex</code> ve <code>Edge</code>. İpucu: metin içinde <code>\\n</code> yeni satır karakteridir.</p><pre class="expected">Vertex\nEdge</pre>',
      starter: cs``,
      checks: [
        { type: 'output', expect: 'Vertex\nEdge' },
        { type: 'code', pattern: '^(?![\\s\\S]*WriteLine[\\s\\S]*WriteLine)[\\s\\S]*WriteLine', msg: 'Sadece bir tane Console.WriteLine kullanmalısın' },
      ],
      hints: ['<code>\\n</code> kaçış dizisi (escape sequence) metnin içinde yeni satır oluşturur.', '<code>Console.WriteLine("Vertex\\nEdge");</code> biçimini dene.'],
      solution: cs`Console.WriteLine("Vertex\nEdge");`,
    },
    {
      difficulty: 2,
      title: 'Write ile satır kurmak',
      prompt: '<p>Sadece <code>Console.Write</code> kullanarak (WriteLine yok!) şu çıktıyı üret:</p><pre class="expected">Mesh: Cube\nFaces: 6</pre>',
      starter: cs``,
      checks: [
        { type: 'output', expect: 'Mesh: Cube\nFaces: 6' },
        { type: 'notCode', pattern: 'WriteLine', msg: 'Bu alıştırmada WriteLine kullanmamalısın' },
      ],
      hints: ['Write satır sonu eklemez; yeni satırı kendin <code>\\n</code> ile eklemelisin.', '<code>Console.Write("Mesh: Cube\\n");</code> ile başla.'],
      solution: cs`Console.Write("Mesh: Cube\n");
Console.Write("Faces: 6");`,
    },
  ],
  vocab: [
    { en: 'Program', tr: 'Program', ja: 'プログラム', kana: 'プログラム', romaji: 'puroguramu' },
    { en: 'Programming', tr: 'Programlama', ja: 'プログラミング', kana: 'プログラミング', romaji: 'puroguramingu' },
    { en: 'Development', tr: 'Geliştirme', ja: '開発', kana: 'かいはつ', romaji: 'kaihatsu' },
    { en: 'Source code', tr: 'Kaynak kod', ja: 'ソースコード', kana: 'ソースコード', romaji: 'sōsu kōdo' },
    { en: 'Compiler', tr: 'Derleyici', ja: 'コンパイラ', kana: 'コンパイラ', romaji: 'konpaira' },
    { en: 'Execute / Run', tr: 'Çalıştırmak / Yürütmek', ja: '実行', kana: 'じっこう', romaji: 'jikkō' },
    { en: 'Statement', tr: 'Deyim', ja: '文', kana: 'ぶん', romaji: 'bun' },
    { en: 'Output', tr: 'Çıktı', ja: '出力', kana: 'しゅつりょく', romaji: 'shutsuryoku' },
    { en: 'Syntax', tr: 'Sözdizimi', ja: '構文', kana: 'こうぶん', romaji: 'kōbun' },
    { en: 'Compile error', tr: 'Derleme hatası', ja: 'コンパイルエラー', kana: 'コンパイルエラー', romaji: 'konpairu erā' },
    { en: 'Entry point', tr: 'Giriş noktası', ja: 'エントリーポイント', kana: 'エントリーポイント', romaji: 'entorī pointo' },
  ],
  summary: [
    'Program, bilgisayara adım adım ne yapacağını söyleyen kesin talimatlardır.',
    'C# kodu: kaynak kod → derleyici → IL → CLR/JIT → makine kodu → CPU yolculuğunu izler.',
    'Deyimler yukarıdan aşağıya sırayla çalışır — tıpkı modifier yığını gibi.',
    'Console.WriteLine yazıp alt satıra geçer; Console.Write aynı satırda kalır.',
    'Her deyim ; ile biter, C# büyük/küçük harfe duyarlıdır, hata mesajları satır ve sütun bilgisi verir.',
  ],
};
