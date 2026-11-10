import { cs } from '../helpers.js';

export default {
  id: 'm1-l03',
  module: 'm1',
  title: 'Veri tipleri',
  titleEn: 'Data types',
  titleJa: 'データ型',
  minutes: 60,
  level: 1,
  objectives: [
    'Veri tiplerinin neden var olduğunu (bellek boyutu, geçerli işlemler, tip güvenliği) açıklayabilmek',
    'int, double, float, decimal, bool, char ve string arasından duruma uygun tipi seçmek',
    'Örtük (implicit) ve açık (explicit) dönüşümü ayırt etmek; (int) dönüşümünün kesme yaptığını bilmek',
    'Console.ReadLine ile gelen metni int.Parse / double.Parse ile sayıya çevirmek',
    'CS0029 ve CS0266 hatalarını okuyup düzeltmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Neden veri tipleri var?',
      body: `
<p>Bellekte her şey sonunda 0 ve 1'lerden oluşur. <code>01000001</code> bitleri 65 sayısı da olabilir, 'A' harfi de. Bu bitlerin <b>nasıl yorumlanacağını</b> söyleyen şey <t en="data type" ja="データ型">veri tipi</t>dir. Tiplerin üç görevi var:</p>
<ol>
<li><b>Bellek boyutu:</b> Derleyici kutu için ne kadar yer ayıracağını tipten bilir. <code>int</code> 4 bayt, <code>double</code> 8 bayt.</li>
<li><b>Geçerli işlemler:</b> Sayılar çarpılabilir; metinler büyük harfe çevrilebilir. "Cube" × 3 anlamsızdır — tip bunu baştan bilir.</li>
<li><b>Tip güvenliği</b> (<t en="type safety" ja="型安全">type safety</t>): Bir vertex sayısının içine yanlışlıkla bir metin koymaya çalışırsan derleyici kodu <em>çalıştırmadan</em> durdurur. Hata, kullanıcının bilgisayarında değil senin ekranında yakalanır.</li>
</ol>
<p>C# <b>statik tipli</b> bir dildir: bir değişkenin tipi bir kez belirlenir ve <b>asla değişmez</b>. <code>var</code> kullansan bile tip, ilk değerden çıkarılıp sabitlenir.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Geometry Nodes soketleri',
      body: `
<p>Blender'ın Geometry Nodes'unda her soketin bir tipi vardır: <b>Integer</b>, <b>Float</b>, <b>Boolean</b>, <b>Vector</b>, <b>String</b>… Uyumsuz iki soketi bağladığında bağlantı kırmızıya döner — Blender sana "bu veri buraya uymuyor" der. C# derleyicisi de aynısını yapar, sadece kırmızı çizgi yerine hata mesajı verir.</p>
<table class="compare">
<tr><th>Geometry Nodes / 3D</th><th>C# tipi</th><th>Örnek</th></tr>
<tr><td>Integer soketi (Subdivision Level)</td><td><code>int</code></td><td><code>2</code></td></tr>
<tr><td>Float soketi (Bevel Width, vertex X)</td><td><code>double</code> / <code>float</code></td><td><code>0.025</code></td></tr>
<tr><td>Boolean soketi (Shade Smooth açık mı?)</td><td><code>bool</code></td><td><code>true</code></td></tr>
<tr><td>Tek eksen harfi</td><td><code>char</code></td><td><code>'Z'</code></td></tr>
<tr><td>String soketi (obje adı)</td><td><code>string</code></td><td><code>"SM_Table"</code></td></tr>
</table>
<p>Substance Painter'da da aynı fikir var: Roughness kanalı <b>gri tonlu</b> (tek sayı), Base Color kanalı <b>renkli</b> (üç sayı). Kanala uygun veri koymazsan sonuç bozulur.</p>`,
    },
    {
      kind: 'visual',
      title: 'Hangi tip bellekte ne kadar yer kaplar?',
      svg: `
<svg viewBox="0 0 760 300" role="img" aria-label="C# temel tiplerinin bellekte kapladığı bayt sayısı">
  <g font-size="13">
    <text x="20" y="24" class="t2">tip</text><text x="140" y="24" class="t2">boyut (1 kare = 1 bayt = 8 bit)</text>
    <text x="20" y="57" class="t1">bool</text><rect x="140" y="40" width="34" height="26" rx="4" class="box"/><text x="186" y="57" class="t3">1 bayt · true / false</text>
    <text x="20" y="91" class="t1">char</text><rect x="140" y="74" width="70" height="26" rx="4" class="box"/><text x="222" y="91" class="t3">2 bayt · tek karakter 'Z'</text>
    <text x="20" y="125" class="t1">int</text><rect x="140" y="108" width="142" height="26" rx="4" class="box"/><text x="294" y="125" class="t3">4 bayt · tam sayı, yaklaşık ±2.1 milyar</text>
    <text x="20" y="159" class="t1">float</text><rect x="140" y="142" width="142" height="26" rx="4" class="box"/><text x="294" y="159" class="t3">4 bayt · ondalıklı, ~7 anlamlı basamak</text>
    <text x="20" y="193" class="t1">long</text><rect x="140" y="176" width="286" height="26" rx="4" class="box"/><text x="438" y="193" class="t3">8 bayt · çok büyük tam sayılar</text>
    <text x="20" y="227" class="t1">double</text><rect x="140" y="210" width="286" height="26" rx="4" class="box hi"/><text x="283" y="227" class="t3" text-anchor="middle">★ CAD koordinatları</text><text x="438" y="227" class="t3">8 bayt · ondalıklı, ~15–16 anlamlı basamak</text>
    <text x="20" y="261" class="t1">decimal</text><rect x="140" y="244" width="574" height="26" rx="4" class="box dim"/><text x="427" y="261" class="t3" text-anchor="middle">16 bayt · 28–29 basamak, onluk tabanda kesin (para hesapları)</text>
  </g>
</svg>`,
      caption: `
<p>Daha büyük kutu = daha fazla <b>aralık</b> ya da <b>hassasiyet</b>, ama daha fazla bellek. Bir mesh'te 1 milyon vertex ve her birinde 3 koordinat varsa, <code>float</code> ile 12 MB, <code>double</code> ile 24 MB yer tutar. Oyun motorları bu yüzden çoğunlukla <code>float</code> kullanır; CAD ise hassasiyet için genellikle <code>double</code> tercih eder.</p>
<p class="muted"><code>string</code> listede yok: metnin uzunluğu değişken olduğu için boyutu sabit değildir (her karakter 2 bayt + küçük bir ek yük).</p>`,
    },
    {
      kind: 'code',
      title: 'Temel tipler turu',
      code: cs`int vertexCount = 2048;
double posX = 1.25;
float uvU = 0.5f;
decimal licensePrice = 19.99m;
bool smoothShading = true;
char upAxis = 'Z';
string meshName = "SM_Table";

Console.WriteLine(meshName + " · " + vertexCount + " vertex");
Console.WriteLine("X: " + posX + ", U: " + uvU);
Console.WriteLine("Smooth: " + smoothShading + ", Up: " + upAxis);
Console.WriteLine("Fiyat: " + licensePrice);

var uvScale = 2.0;
Console.WriteLine(vertexCount.GetType());
Console.WriteLine(uvScale.GetType());`,
      explain: {
        1: `<code>int</code> — <t en="integer" ja="整数">tam sayı</t>. Vertex, yüz, LOD seviyesi gibi <b>sayılabilen</b> şeyler. Kesirli kısım tutamaz.`,
        2: `<code>double</code> — <t en="floating point" ja="浮動小数点">kayan noktalı</t> sayı. Ondalık ayırıcı her zaman <b>nokta</b>: <code>1.25</code> (Türkçedeki gibi virgül değil!). Ondalıklı bir sayı yazdığında C# onu varsayılan olarak double kabul eder.`,
        3: `<code>float</code> — daha küçük, daha az hassas ondalıklı tip. Sonundaki <code>f</code> zorunludur: <code>0.5</code> tek başına double'dır.`,
        4: `<code>decimal</code> — para gibi onluk tabanda <b>kesin</b> olması gereken değerler için. Sonek: <code>m</code>. Geometri için kullanılmaz (yavaştır).`,
        5: `<code>bool</code> — sadece <code>true</code> ya da <code>false</code>. Blender'daki onay kutuları (checkbox) gibi. Ders 6'da derinlemesine.`,
        6: `<code>char</code> — <b>tek</b> bir karakter, <b>tek tırnakla</b>: <code>'Z'</code>.`,
        7: `<code>string</code> — karakter dizisi (metin), <b>çift tırnakla</b>: <code>"SM_Table"</code>.`,
        11: `Dikkat: <code>bool</code> değerler kodda küçük harfle (<code>true</code>) yazılır ama ekrana <code>True</code> olarak basılır. Bu .NET'in bir kuralıdır.`,
        14: `<code>var</code> burada <code>double</code> olur, çünkü <code>2.0</code> ondalıklı bir sayıdır. <code>var uvScale = 2;</code> yazsaydık <code>int</code> olurdu!`,
        15: `<code>GetType()</code> bir değerin gerçek tipini söyler. <code>System.Int32</code>, <code>int</code>'in .NET'teki tam adıdır (32 bit = 4 bayt).`,
        16: `<code>System.Double</code> — var'ın gerçekten double seçtiğinin kanıtı.`,
      },
      runnable: true,
      stepper: true,
      note: 'Adım adım çalıştırıp değişken tablosunda her değişkenin tipine bak. 14. satırda 2.0 yerine 2 yazıp tekrar çalıştır: tip ne oldu?',
    },
    {
      kind: 'concept',
      title: 'Örtük ve açık dönüşüm',
      body: `
<p>Bazen bir tipteki değeri başka bir tipe koymak gerekir. İki durum var:</p>
<p><b>Örtük dönüşüm</b> (<t en="implicit conversion" ja="暗黙的な型変換">implicit conversion</t>): Küçük kutudan büyük kutuya taşımak. <b>Veri kaybı riski yok</b>, bu yüzden C# sessizce yapar:</p>
<pre>int tris = 1200;
double trisD = tris;   // ✓ 1200 → 1200.0, kayıp yok</pre>
<p><b>Açık dönüşüm</b> (<t en="explicit conversion / cast" ja="キャスト">cast</t>): Büyük kutudan küçük kutuya. <b>Veri kaybolabilir</b>, bu yüzden C# senden açıkça "kabul ediyorum" demeni ister. Parantez içine hedef tipi yazarsın:</p>
<pre>double avg = 3.9;
int n = (int)avg;      // n = 3  (yuvarlamaz, KESER!)</pre>
<div class="callout tip"><b>3D benzetmesi:</b> High-poly modeli low-poly'ye bake etmek gibi. Low → high (subdivide) güvenli; high → low (decimate) detay kaybeder ve bunu bilerek yaparsın. <code>(int)</code> da ondalık "detayı" atar: 3.9 → 3, -3.9 → -3 (sıfıra doğru keser).</div>`,
    },
    {
      kind: 'code',
      title: 'Dönüşümleri adım adım izle',
      code: cs`int quadCount = 1200;
double quadAsDouble = quadCount;
Console.WriteLine(quadAsDouble);

double avgEdgeLength = 3.9;
int truncated = (int)avgEdgeLength;
Console.WriteLine(truncated);

double offset = -3.9;
Console.WriteLine((int)offset);

char axis = 'A';
int axisCode = axis;
Console.WriteLine(axisCode);`,
      explain: {
        2: `<b>Örtük</b> dönüşüm: int → double. Her tam sayı double'a sığar, derleyici izin verir.`,
        3: `1200 yazar. double'ın kesirli kısmı sıfır olunca .NET ".0" yazmaz.`,
        6: `<b>Açık</b> dönüşüm (cast): <code>(int)</code>. Kesirli kısım <b>atılır</b> — 3.9 yuvarlanıp 4 olmaz, <b>3</b> olur.`,
        10: `Negatif sayıda da sıfıra doğru keser: -3.9 → <b>-3</b> (-4 değil). Yuvarlama için <code>Math.Round</code> var; Ders 5'te.`,
        13: `char → int örtük dönüşümü: her karakter bellekte bir sayı koduyla saklanır. 'A' harfinin kodu <b>65</b>'tir (Unicode). İşte "bitlerin yorumlanması" fikri!`,
      },
      runnable: true,
      stepper: true,
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Kesme mi, yuvarlama mı?',
      code: cs`double width = 7.99;
int w = (int)width;
Console.WriteLine(w);
Console.WriteLine((int)(width + 0.5));`,
      options: ['8\n8', '7\n8', '7\n7', '8\n9'],
      answer: 1,
      explain: '<code>(int)7.99</code> ondalık kısmı atar → <b>7</b>. İkinci satırda önce parantez içi hesaplanır: 7.99 + 0.5 = 8.49, sonra kesilir → <b>8</b>. (+0.5 ekleyip kesmek, pozitif sayılar için eski usul bir yuvarlama hilesidir.)',
    },
    {
      kind: 'code',
      title: 'Kullanıcıdan veri almak: ReadLine ve Parse',
      code: cs`string input = Console.ReadLine();
Console.WriteLine(input + 1);

int quads = int.Parse(input);
Console.WriteLine(quads + 1);
Console.WriteLine("Üçgen: " + quads * 2);

double scale = double.Parse(Console.ReadLine());
Console.WriteLine("Ölçek: " + scale);`,
      explain: {
        1: `<code>Console.ReadLine()</code> kullanıcının yazdığı bir satırı okur ve <b>her zaman string</b> döndürür. Kullanıcı 12 yazsa bile elimizdeki "1" ve "2" karakterlerinden oluşan bir metindir.`,
        2: `string + sayı = metin birleştirme! "12" + 1 → <b>"121"</b>. Bilgisayar burada matematik yapmaz, karakterleri yan yana koyar.`,
        4: `<code>int.Parse</code> metni tam sayıya çevirir (<t en="parse" ja="パース">parse</t> = ayrıştırmak). Artık elimizde gerçek bir sayı var.`,
        5: `Şimdi + toplama yapar: 12 + 1 = <b>13</b>. Aynı karakterler, farklı tip → farklı davranış.`,
        6: `Her quad 2 üçgene bölünür: 24.`,
        8: `İki işlem iç içe: önce ReadLine metni okur, sonra double.Parse onu double'a çevirir. Girdide ondalık ayırıcı <b>nokta</b> olmalı (0.75).`,
      },
      runnable: true,
      stepper: true,
      stdin: '12\n0.75',
      note: 'Bu örnek iki girdi satırıyla çalışır: "12" ve "0.75". Girdi kutusundaki değerleri değiştirip yeniden çalıştır. "abc" yazarsan ne olur?',
    },
    {
      kind: 'warning',
      title: 'Tip hataları ve nasıl okunur',
      body: `
<ol>
<li><b>CS0029: Cannot implicitly convert type 'string' to 'int'</b> — Tamamen uyumsuz tipler: <code>int n = "5";</code>. Metni sayıya çevirmek için <code>int.Parse("5")</code> kullan. Benzer: <code>bool b = 1;</code> ya da <code>char c = "A";</code> (çift tırnak = string!).</li>
<li><b>CS0266: Cannot implicitly convert type 'double' to 'int'. An explicit conversion exists (are you missing a cast?)</b> — Veri kaybı olabilir; derleyici "eminsen <code>(int)</code> yaz" diyor. Mesaj çözümü kendisi söylüyor!</li>
<li><b>FormatException</b> — <code>int.Parse("3.5")</code> ya da <code>int.Parse("abc")</code>. Bu bir derleme hatası değil, <b>çalışma anı</b> hatasıdır: kod derlenir ama çalışırken çöker. (Güvenli yöntem <code>int.TryParse</code>'ı Ders 12'de göreceğiz.)</li>
<li><b>Virgül tuzağı:</b> Kodda ondalık ayırıcı her zaman nokta. <code>2,5</code> yazmak sayı değil, sözdizimi hatasıdır.</li>
</ol>
<p>Aşağıdaki kod derlenmiyor. Hata mesajını oku ve tek bir değişiklikle düzelt. Çıktı <code>2750</code> olmalı.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Metreden milimetreye',
      code: cs`double lengthM = 2.75;
int lengthMm = lengthM * 1000;
Console.WriteLine(lengthMm);`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: 'Duvar uzunluğu metre cinsinden, ondalıklı.',
        2: 'double × int sonucu <b>double</b>\'dır (2750.0). Bunu int kutusuna koymak veri kaybı riski taşır → CS0266.',
        3: 'Düzelttikten sonra 2750 yazmalı.',
      },
      note: 'İpucu: Mesaj "are you missing a cast?" diyor. Cast\'i neye uygulaman gerektiğine dikkat: (int)lengthM * 1000 ile (int)(lengthM * 1000) aynı sonucu vermez!',
    },
    {
      kind: 'cad',
      title: 'float mı double mı? CAD\'de hassasiyet meselesi',
      body: `
<p>Kayan noktalı sayılar sabit sayıda <b>anlamlı basamak</b> tutar. Sayı büyüdükçe, virgülden sonrası için yer azalır:</p>
<ul>
<li><b>float (~7 basamak):</b> Orijinden yaklaşık 12 km uzaktaki bir noktada (ör. 12345.678 m) float'ın ardışık iki değeri arasındaki adım <b>yaklaşık 1 mm</b>'dir. Daha incesini saklayamaz.</li>
<li><b>double (~15–16 basamak):</b> Aynı noktada adım nanometrenin de çok altındadır.</li>
</ul>
<p>Oyunlarda dünya orijinden çok uzaklaşınca karakterin titremesi (jitter) bu yüzden olur — Unity'nin <code>Vector3</code>'ü float kullanır. Bir arazi ölçüm (測量) ya da şantiye koordinatında ise milimetre kaybı kabul edilemez. Bu yüzden CAD/BIM çekirdekleri genellikle <b>double</b> ile hesap yapar; ekrana çizim gibi hassasiyetin daha az kritik olduğu aşamalarda float'a dönüştürebilir.</p>
<table class="compare">
<tr><th>Veri</th><th>Uygun tip</th></tr>
<tr><td>Vertex/nokta koordinatı, uzunluk, açı</td><td><code>double</code></td></tr>
<tr><td>Vertex/yüz sayısı, kat numarası</td><td><code>int</code></td></tr>
<tr><td>"Görünür mü?", "Kilitli mi?"</td><td><code>bool</code></td></tr>
<tr><td>Katman (layer) adı, malzeme adı</td><td><code>string</code></td></tr>
<tr><td>Lisans/fatura tutarı</td><td><code>decimal</code></td></tr>
</table>`,
    },
  ],
  exercise: {
    title: 'Ölçü dönüştürücü',
    prompt: `
<p>Program iki satır girdi okusun: önce <b>obje adı</b>, sonra <b>metre cinsinden uzunluk</b> (ör. <code>2.75</code>). Ardından şu dört satırı yazdırsın:</p>
<pre class="expected">Obje: Wall_A
Uzunluk (m): 2.75
Uzunluk (mm): 2750
Tam metre: 2</pre>
<ul>
<li>Milimetre değeri <code>int</code> olmalı (cast kullan).</li>
<li>"Tam metre", uzunluğun tam sayı kısmıdır (cast kullan).</li>
<li>Programın farklı girdilerle de doğru çalışmalı (ör. <code>Kolon_B</code> ve <code>3.6</code>).</li>
</ul>`,
    stdin: 'Wall_A\n2.75',
    starter: cs`// 1. satır: obje adı
string name = Console.ReadLine();

// 2. satır: metre cinsinden uzunluk — sayıya çevir


// dört satırı yazdır
`,
    checks: [
      { type: 'output', expect: 'Obje: Wall_A\nUzunluk (m): 2.75\nUzunluk (mm): 2750\nTam metre: 2', msg: 'Wall_A / 2.75 girdisiyle dört satır birebir aynı olmalı' },
      { type: 'output', stdin: 'Kolon_B\n3.6', expect: 'Obje: Kolon_B\nUzunluk (m): 3.6\nUzunluk (mm): 3600\nTam metre: 3', msg: 'Farklı girdiyle (Kolon_B / 3.6) de doğru çalışmalı — sonuçları elle yazma' },
      { type: 'code', pattern: 'double\\.Parse', msg: 'Metni double.Parse ile sayıya çevirmelisin' },
      { type: 'code', pattern: '\\(\\s*int\\s*\\)', msg: 'Tam sayıya çevirmek için (int) cast kullanmalısın' },
    ],
    hints: [
      '<code>Console.ReadLine()</code> her zaman metin döndürür. Hesap yapabilmek için ikinci satırı <code>double</code>\'a çevirmen gerekiyor.',
      'Metreden milimetreye: 1000 ile çarp. Sonuç double olur; int\'e koymak için cast gerekir. Tam metre için de uzunluğun kendisine cast uygula.',
      'Parantezlere dikkat: <code>(int)m * 1000</code> önce m\'yi keser (2 × 1000 = 2000). Senin istediğin önce çarpıp <b>sonra</b> kesmek — yani çarpımın tamamını parantez içine almak.',
    ],
    solution: cs`string name = Console.ReadLine();
double lengthM = double.Parse(Console.ReadLine());

int lengthMm = (int)(lengthM * 1000);
int wholeMeters = (int)lengthM;

Console.WriteLine("Obje: " + name);
Console.WriteLine("Uzunluk (m): " + lengthM);
Console.WriteLine("Uzunluk (mm): " + lengthMm);
Console.WriteLine("Tam metre: " + wholeMeters);`,
    explain: 'ReadLine metni getirdi, double.Parse onu sayıya çevirdi. Çarpım double üretti; (int) cast ile int kutusuna sığdırdık. Tam metre için cast kesirli kısmı attı. Not: Bazı değerlerde (ör. 1.005 × 1000 = 1004.9999…) kesme sürpriz yapabilir — bunun nedenini Ders 5\'te kayan nokta hassasiyetini işlerken göreceğiz.',
  },
  quiz: [
    {
      q: 'Bir vertex\'in X koordinatını (ör. 1.375) saklamak için en uygun tip hangisi?',
      options: [
        { t: 'double', correct: true, why: 'Doğru. Koordinatlar kesirlidir ve CAD\'de hassasiyet önemlidir; double ~15–16 anlamlı basamak tutar.' },
        { t: 'int', why: 'int kesirli kısım tutamaz; 1.375 saklanamaz (cast edersen 1 olur).' },
        { t: 'bool', why: 'bool sadece true/false tutar; bir koordinat değeri değil.' },
        { t: 'char', why: 'char tek bir karakter tutar (ör. \'X\' harfi), sayısal koordinat değil.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine((int)9.99);`,
      verifyOutput: true,
      options: [
        { t: '9', correct: true, why: 'Doğru. (int) cast yuvarlamaz, kesirli kısmı keser.' },
        { t: '10', why: 'Bu yuvarlama olurdu. (int) cast sadece ondalık kısmı atar; yuvarlama için Math.Round gerekir.' },
        { t: '9.99', why: 'Cast sonucu int\'tir; int kesirli kısım tutamaz.' },
        { t: 'Derleme hatası', why: 'Açık cast (int) yazıldığı için derleyici veri kaybını kabul ettiğini anlar ve izin verir.' },
      ],
    },
    {
      q: '<code>int wallCount = 2.5;</code> neden derlenmez?',
      options: [
        { t: 'double\'ı int\'e koymak veri kaybına yol açabilir; C# bunun için açık cast ister (CS0266)', correct: true, why: 'Doğru. Derleyici "bilerek mi yapıyorsun?" diye sorar. (int)2.5 yazarsan derlenir ve değer 2 olur.' },
        { t: 'Değişken adı geçersiz', why: 'wallCount geçerli bir camelCase isimdir. Sorun tip uyumsuzluğunda.' },
        { t: 'int negatif olmayan sayılar tutar', why: 'int negatif sayıları da tutar (yaklaşık ±2.1 milyar). Sorun kesirli kısım.' },
        { t: 'C# 2.5\'i otomatik olarak 3\'e yuvarlar, derlenir', why: 'C# ne otomatik yuvarlar ne de kesirli değeri sessizce int\'e koyar. Açık cast ister.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`string a = "5";
int b = 5;
Console.WriteLine(a + b);
Console.WriteLine(b + b);`,
      verifyOutput: true,
      options: [
        { t: '55\n10', correct: true, why: 'Doğru. string + int metin birleştirmedir ("55"); int + int ise toplamadır (10). Tip, + işaretinin anlamını belirler.' },
        { t: '10\n10', why: 'a bir string\'dir; "5" ile 5 aynı şey değil. string + sayı birleştirme yapar.' },
        { t: '55\n55', why: 'b + b iki int\'in toplamıdır; burada string yok, matematik yapılır.' },
        { t: 'Derleme hatası', why: 'string + int geçerlidir: sayı otomatik olarak metne çevrilip eklenir.' },
      ],
    },
    {
      q: 'Orijinden kilometrelerce uzaktaki şantiye koordinatlarını milimetre hassasiyetinde saklamak için hangisi daha uygundur?',
      options: [
        { t: 'double — ~15–16 anlamlı basamak sayesinde büyük değerlerde de ince hassasiyet korunur', correct: true, why: 'Doğru. CAD/BIM yazılımlarının geometri hesaplarında genellikle double tercih edilmesinin nedeni budur.' },
        { t: 'float — daha az bellek kaplar, bu yeterli', why: 'float ~7 basamak tutar; ~12 km\'de adım yaklaşık 1 mm\'ye çıkar. Bellek tasarrufu hassasiyet kaybına değmez.' },
        { t: 'int — tam sayılar her zaman kesindir', why: 'Milimetreyi tam sayı olarak tutmak bazı durumlarda kullanılır ama açı, eğri gibi kesirli hesaplar için yetmez; ayrıca aralığı sınırlıdır.' },
        { t: 'string — metin her şeyi kesin saklar', why: 'Metinle matematik yapılamaz; her hesapta Parse gerekir. Koordinatlar sayısal tiplerde tutulur.' },
      ],
    },
    {
      q: '<code>var ratio = 3.0;</code> satırında ratio\'nun tipi nedir?',
      options: [
        { t: 'double', correct: true, why: 'Doğru. 3.0 ondalık noktalı bir sabittir ve C#\'ta ondalıklı sabitlerin varsayılan tipi double\'dır.' },
        { t: 'int', why: '3 yazılsaydı int olurdu. .0 eklenmesi onu double yapar.' },
        { t: 'float', why: 'float için sonuna f eklemek gerekir: 3.0f.' },
        { t: 'Tipi yok, her şeyi tutabilir', why: 'var "tipsiz" demek değildir; tip derleme anında belirlenir ve sabitlenir.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Aynı karakterler, farklı tipler',
    prompt: `
<p>Program üç satır girdi okusun: bir <b>tam sayı</b>, <code>true</code>/<code>false</code> metni ve tek bir <b>eksen harfi</b>. Girdi <code>7</code>, <code>true</code>, <code>Z</code> iken çıktı şu olmalı:</p>
<pre class="expected">Metin + 1: 71
Sayı + 1: 8
Yarısı: 3.5
Tam kısım: 3
Smooth: True
Eksen: Z (kod 90)</pre>
<ul>
<li>"Metin + 1": girdiyi string olarak 1 ile birleştir.</li>
<li>"Yarısı": sayıyı <code>0.5</code> ile çarp (bölmeyi Ders 5'te göreceğiz). "Tam kısım": yarısının int'e cast edilmiş hâli.</li>
<li>İkinci satırı <code>bool.Parse</code>, üçüncüyü <code>char.Parse</code> ile çevir. Harfin sayı kodunu char → int dönüşümüyle bul.</li>
</ul>`,
    stdin: '7\ntrue\nZ',
    starter: cs`string text = Console.ReadLine();
// devam et...
`,
    checks: [
      { type: 'output', expect: 'Metin + 1: 71\nSayı + 1: 8\nYarısı: 3.5\nTam kısım: 3\nSmooth: True\nEksen: Z (kod 90)', msg: '7 / true / Z girdisiyle altı satır birebir aynı olmalı' },
      { type: 'output', stdin: '42\nfalse\nX', expect: 'Metin + 1: 421\nSayı + 1: 43\nYarısı: 21\nTam kısım: 21\nSmooth: False\nEksen: X (kod 88)', msg: '42 / false / X girdisiyle de doğru çalışmalı' },
      { type: 'code', pattern: 'int\\.Parse', msg: 'Sayıyı int.Parse ile çevirmelisin' },
      { type: 'code', pattern: 'bool\\.Parse', msg: 'İkinci satırı bool.Parse ile çevirmelisin' },
      { type: 'code', pattern: 'char\\.Parse', msg: 'Üçüncü satırı char.Parse ile çevirmelisin' },
      { type: 'code', pattern: '\\(\\s*int\\s*\\)', msg: 'Tam kısım için (int) cast kullanmalısın' },
    ],
    hints: [
      'Girdiyi iki biçimde tut: metin hâli (<code>text</code>) ve <code>int.Parse(text)</code> ile elde edilen sayı hâli. "+ 1" ikisinde farklı davranır.',
      '<code>sayı * 0.5</code> bir double üretir; cast ile int\'e çevirince tam kısım kalır. char\'ı bir int değişkene atamak örtük dönüşümdür ve harfin kodunu verir.',
      'Dikkat: <code>"Metin + 1: " + text + 1</code> doğru çalışır (soldan sağa birleştirme). Ama <code>"Sayı + 1: " + number + 1</code> "71" verir! Toplamı önce bir değişkende hesapla ya da parantez kullan.',
    ],
    solution: cs`string text = Console.ReadLine();
int number = int.Parse(text);
bool smooth = bool.Parse(Console.ReadLine());
char axis = char.Parse(Console.ReadLine());

int plusOne = number + 1;
double half = number * 0.5;
int halfWhole = (int)half;
int axisCode = axis;

Console.WriteLine("Metin + 1: " + text + 1);
Console.WriteLine("Sayı + 1: " + plusOne);
Console.WriteLine("Yarısı: " + half);
Console.WriteLine("Tam kısım: " + halfWhole);
Console.WriteLine("Smooth: " + smooth);
Console.WriteLine("Eksen: " + axis + " (kod " + axisCode + ")");`,
    explain: 'Aynı "7" karakteri string iken birleştirildi, int iken toplandı, double ile çarpılınca kesirli sonuç verdi. Tip, verinin ne anlama geldiğini ve hangi işlemlerin geçerli olduğunu belirler.',
  },
  extras: [
    {
      difficulty: 1,
      title: 'Doğru tipi seç',
      prompt: `<p>Bir malzeme için beş değişken oluştur — her birine <b>uygun tipi</b> ver — ve sırayla yazdır:</p>
<ul><li><code>lodCount</code> = 3</li><li><code>metalness</code> = 0.85</li><li><code>castShadows</code> = true</li><li><code>gridAxis</code> = X harfi</li><li><code>materialName</code> = M_Steel</li></ul>
<pre class="expected">3
0.85
True
X
M_Steel</pre>`,
      starter: cs`// beş değişkeni uygun tiplerle oluştur ve yazdır
`,
      checks: [
        { type: 'output', expect: '3\n0.85\nTrue\nX\nM_Steel' },
        { type: 'code', pattern: 'int\\s+lodCount\\s*=\\s*3', msg: 'lodCount bir int olmalı' },
        { type: 'code', pattern: '(double|float)\\s+metalness', msg: 'metalness ondalıklı bir tip (double) olmalı' },
        { type: 'code', pattern: 'bool\\s+castShadows\\s*=\\s*true', msg: 'castShadows bir bool olmalı' },
        { type: 'code', pattern: 'char\\s+gridAxis\\s*=\\s*\'X\'', msg: 'gridAxis tek tırnaklı bir char olmalı' },
        { type: 'code', pattern: 'string\\s+materialName\\s*=\\s*"M_Steel"', msg: 'materialName bir string olmalı' },
      ],
      hints: ['Tam sayı → int, ondalıklı → double, evet/hayır → bool, tek karakter → char (tek tırnak), metin → string (çift tırnak).', 'Float kullanırsan sonuna f eklemeyi unutma; en kolayı double.'],
      solution: cs`int lodCount = 3;
double metalness = 0.85;
bool castShadows = true;
char gridAxis = 'X';
string materialName = "M_Steel";
Console.WriteLine(lodCount);
Console.WriteLine(metalness);
Console.WriteLine(castShadows);
Console.WriteLine(gridAxis);
Console.WriteLine(materialName);`,
    },
    {
      difficulty: 2,
      title: 'Kesme makinesi',
      prompt: `<p>Girdiden bir ondalıklı sayı oku ve tam sayı kısmını yazdır. Girdi <code>3.99</code> ise:</p><pre class="expected">Tam kısım: 3</pre><p>Negatif sayılarla da dene: <code>-2.7</code> → <code>Tam kısım: -2</code></p>`,
      stdin: '3.99',
      starter: cs`// girdiyi oku, double'a çevir, int'e cast et
`,
      checks: [
        { type: 'output', expect: 'Tam kısım: 3' },
        { type: 'output', stdin: '-2.7', expect: 'Tam kısım: -2', msg: 'Negatif girdide de sıfıra doğru kesmeli' },
        { type: 'code', pattern: 'double\\.Parse', msg: 'double.Parse kullanmalısın' },
        { type: 'code', pattern: '\\(\\s*int\\s*\\)', msg: '(int) cast kullanmalısın' },
      ],
      hints: ['<code>double.Parse(Console.ReadLine())</code> ile sayıyı al.', '(int) cast sıfıra doğru keser: -2.7 → -2.'],
      solution: cs`double value = double.Parse(Console.ReadLine());
int whole = (int)value;
Console.WriteLine("Tam kısım: " + whole);`,
    },
    {
      difficulty: 3,
      title: 'Texture bellek hesabı',
      prompt: `<p>Kare bir texture'ın kenar uzunluğunu (piksel) girdiden oku. Piksel sayısını ve iki farklı formattaki bellek boyutunu hesapla: <b>RGBA8</b> piksel başına 4 bayt, <b>RGBA16F</b> piksel başına 8 bayt. Büyük değerler için sonuçları <code>long</code> değişkenlerde tut. Girdi <code>2048</code> iken:</p>
<pre class="expected">Piksel: 4194304
RGBA8: 16777216 bayt
RGBA16F: 33554432 bayt</pre>`,
      stdin: '2048',
      starter: cs`int size = int.Parse(Console.ReadLine());
// hesapla ve yazdır
`,
      checks: [
        { type: 'output', expect: 'Piksel: 4194304\nRGBA8: 16777216 bayt\nRGBA16F: 33554432 bayt' },
        { type: 'output', stdin: '512', expect: 'Piksel: 262144\nRGBA8: 1048576 bayt\nRGBA16F: 2097152 bayt', msg: '512 girdisiyle de doğru çalışmalı' },
        { type: 'code', pattern: 'long\\s+\\w+', msg: 'Sonuçları long değişkenlerde tutmalısın' },
      ],
      hints: ['Piksel sayısı = kenar × kenar. int\'ten long\'a atama örtük dönüşümdür.', 'Neden long? 16384 × 16384 × 16 (RGBA32F) ≈ 4.3 milyar eder — int\'in sınırını (≈2.1 milyar) aşar. Gerçek C#\'ta int bu durumda taşar (overflow) ve yanlış sonuç verir; bu yüzden çarpmadan önce bir operandı long yapmak güvenlidir: <code>(long)size * size</code>.'],
      solution: cs`int size = int.Parse(Console.ReadLine());
long pixels = (long)size * size;
long rgba8 = pixels * 4;
long rgba16f = pixels * 8;
Console.WriteLine("Piksel: " + pixels);
Console.WriteLine("RGBA8: " + rgba8 + " bayt");
Console.WriteLine("RGBA16F: " + rgba16f + " bayt");`,
    },
  ],
  vocab: [
    { en: 'Data type', tr: 'Veri tipi', ja: 'データ型', kana: 'データがた', romaji: 'dēta gata' },
    { en: 'Integer', tr: 'Tam sayı', ja: '整数', kana: 'せいすう', romaji: 'seisū' },
    { en: 'Floating point', tr: 'Kayan noktalı sayı', ja: '浮動小数点', kana: 'ふどうしょうすうてん', romaji: 'fudō shōsūten' },
    { en: 'Boolean', tr: 'Mantıksal değer', ja: '真偽値', kana: 'しんぎち', romaji: 'shingichi' },
    { en: 'Character', tr: 'Karakter', ja: '文字', kana: 'もじ', romaji: 'moji' },
    { en: 'String', tr: 'Metin (karakter dizisi)', ja: '文字列', kana: 'もじれつ', romaji: 'mojiretsu' },
    { en: 'Type conversion', tr: 'Tip dönüşümü', ja: '型変換', kana: 'かたへんかん', romaji: 'kata henkan' },
    { en: 'Cast', tr: 'Açık dönüşüm (cast)', ja: 'キャスト', kana: 'キャスト', romaji: 'kyasuto' },
    { en: 'Precision', tr: 'Hassasiyet', ja: '精度', kana: 'せいど', romaji: 'seido' },
    { en: 'Type safety', tr: 'Tip güvenliği', ja: '型安全', kana: 'かたあんぜん', romaji: 'kata anzen' },
    { en: 'Parse', tr: 'Ayrıştırmak', ja: 'パース', kana: 'パース', romaji: 'pāsu' },
    { en: 'Survey (measurement)', tr: 'Arazi ölçümü', ja: '測量', kana: 'そくりょう', romaji: 'sokuryō' },
  ],
  summary: [
    'Veri tipi; bellekte ne kadar yer ayrılacağını, hangi işlemlerin geçerli olduğunu belirler ve hataları derleme anında yakalar.',
    'int tam sayı, double ondalıklı (varsayılan), float daha az hassas (f soneki), decimal para (m soneki), bool true/false, char \'A\', string "metin".',
    'Örtük dönüşüm güvenlidir (int → double); veri kaybı riski olan dönüşüm açık cast ister: (int)3.9 → 3 (keser, yuvarlamaz).',
    'Console.ReadLine her zaman string döndürür; hesap için int.Parse / double.Parse gerekir. "12" + 1 = "121", 12 + 1 = 13.',
    'CS0029 = tamamen uyumsuz tipler; CS0266 = cast eksik. FormatException = çalışma anında geçersiz metin.',
    'CAD\'de koordinatlar için double tercih edilir: float ~7 basamakla büyük koordinatlarda milimetreyi kaybedebilir.',
  ],
};
