import { cs } from '../helpers.js';

export default {
  id: 'm1-l02',
  module: 'm1',
  title: 'Değişkenler',
  titleEn: 'Variables',
  titleJa: '変数',
  minutes: 60,
  level: 1,
  objectives: [
    'Değişkenin RAM\'de adı olan bir kutu olduğunu ve bilgisayarın onu nasıl kullandığını açıklayabilmek',
    'Bildirim (declaration), atama (assignment) ve ilk değer verme (initialization) arasındaki farkı ayırt etmek',
    'C# isimlendirme kurallarına ve camelCase düzenine uygun değişken adları seçmek',
    'Değişkeni okumak, yeniden atamak, var ve const kullanmak; iki değeri takas etmek',
    'CS0165 ve CS0128 hata mesajlarını okuyup düzeltmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Değişken nedir?',
      body: `
<p>Bir program çalışırken bir şeyleri <b>hatırlaması</b> gerekir: bir mesh'in vertex sayısı, objenin adı, ölçek değeri… Bu bilgileri tutmak için <t en="variable" ja="変数">değişken</t> kullanırız.</p>
<p><b>Değişken = belleğe (RAM) konmuş, üzerinde adı yazan bir kutu.</b> Kutunun içinde bir <t en="value" ja="値">değer</t> durur. Kutunun adını yazdığında bilgisayar o kutuyu bulur ve içindekini kullanır.</p>
<p>C#'ta her değişkenin üç parçası vardır:</p>
<ul>
<li><b>Tip</b> — kutuya ne tür şey girebilir? <code>int</code> = tam sayı, <code>double</code> = ondalıklı sayı, <code>string</code> = metin. (Tipleri bir sonraki derste derinlemesine göreceğiz.)</li>
<li><b>İsim</b> — kutunun etiketi, ör. <code>vertexCount</code>.</li>
<li><b>Değer</b> — kutunun içindeki veri, ör. <code>8</code>.</li>
</ul>
<pre>int vertexCount = 8;</pre>
<p>Bu satırı okuyan bilgisayar şunu yapar: "RAM'de bir tam sayı sığacak kadar yer ayır, oraya <code>vertexCount</code> adını ver, içine 8 koy."</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Blender\'ın Object Properties paneli',
      body: `
<p>Blender'da bir obje seçip <b>N panelini</b> ya da <b>Object Properties</b> sekmesini açtığında adı olan alanlar görürsün: <code>Location X: 2.0</code>, <code>Scale Z: 1.5</code>, <code>Name: Cube</code>. Her alanın bir <b>etiketi</b> ve bir <b>değeri</b> vardır. Değeri değiştirdiğinde etiket aynı kalır, sadece içerik değişir.</p>
<p>Değişkenler tam olarak böyledir. Hatta Blender'daki <b>Custom Properties</b> (özel özellikler) birebir aynı fikirdir: kendin bir isim uydurur, ona bir değer verirsin.</p>
<table class="compare">
<tr><th>Blender</th><th>C#</th></tr>
<tr><td>Alan etiketi: <code>Scale Z</code></td><td>Değişken adı: <code>scaleZ</code></td></tr>
<tr><td>Alandaki sayı: <code>1.5</code></td><td>Değişkenin değeri: <code>1.5</code></td></tr>
<tr><td>Alan sadece sayı kabul eder</td><td>Değişkenin <b>tipi</b> (<code>double</code>)</td></tr>
<tr><td>Değeri elle değiştirmek</td><td>Yeniden atama: <code>scaleZ = 2.0;</code></td></tr>
<tr><td>Kilitli (🔒) alan</td><td>Sabit: <code>const</code></td></tr>
</table>`,
    },
    {
      kind: 'visual',
      title: 'Bir değişken satırının anatomisi ve RAM',
      svg: `
<svg viewBox="0 0 760 270" role="img" aria-label="int vertexCount = 8 satırının parçaları ve bellekteki kutular">
  <defs><marker id="ar-l02" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <rect x="60" y="20" width="90" height="44" rx="8" class="box"/><text x="105" y="47" class="t1">int</text>
    <rect x="160" y="20" width="200" height="44" rx="8" class="box hi"/><text x="260" y="47" class="t1">vertexCount</text>
    <rect x="370" y="20" width="50" height="44" rx="8" class="box"/><text x="395" y="47" class="t1">=</text>
    <rect x="430" y="20" width="70" height="44" rx="8" class="box"/><text x="465" y="47" class="t1">8</text>
    <rect x="510" y="20" width="40" height="44" rx="8" class="box dim"/><text x="530" y="47" class="t1">;</text>
    <text x="105" y="84" class="t3">tip (ne sığar?)</text>
    <text x="260" y="84" class="t3">isim (etiket)</text>
    <text x="395" y="84" class="t3">ata</text>
    <text x="465" y="84" class="t3">değer</text>
    <text x="530" y="84" class="t3">deyim sonu</text>
    <line x1="260" y1="92" x2="260" y2="150" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l02)"/>
    <text x="40" y="140" class="t2" text-anchor="start">RAM (bellek)</text>
    <rect x="30" y="152" width="700" height="96" rx="10" class="box dim"/>
    <rect x="50" y="168" width="150" height="64" rx="8" class="box"/><text x="125" y="192" class="t3">adres 1000</text><text x="125" y="218" class="t2">(boş)</text>
    <rect x="210" y="168" width="150" height="64" rx="8" class="box hi"/><text x="285" y="192" class="t3">vertexCount · int</text><text x="285" y="220" class="t1">8</text>
    <rect x="370" y="168" width="150" height="64" rx="8" class="box"/><text x="445" y="192" class="t3">faceCount · int</text><text x="445" y="220" class="t1">6</text>
    <rect x="530" y="168" width="180" height="64" rx="8" class="box"/><text x="620" y="192" class="t3">meshName · string</text><text x="620" y="220" class="t1">"Cube"</text>
  </g>
</svg>`,
      caption: `
<p>Bilgisayar için RAM, numaralı (adresli) hücrelerden oluşan devasa bir raftır. Sen <code>vertexCount</code> yazarsın; derleyici bu adı arka planda bir <b>bellek adresine</b> bağlar. Böylece sen "1000 numaralı hücre" gibi adreslerle uğraşmazsın — <b>isimler insanlar için, adresler makine içindir</b>.</p>
<p class="muted">Basitleştirilmiş çizim: gerçekte <code>int</code> 4 bayt yer kaplar ve <code>string</code> metni ayrı bir yerde tutulur. Ayrıntılar sonraki derslerde.</p>`,
    },
    {
      kind: 'code',
      title: 'Bildirim, atama, ilk değer, yeniden atama',
      code: cs`int vertexCount;
vertexCount = 8;
Console.WriteLine(vertexCount);

int faceCount = 6;
string meshName = "Cube";
Console.WriteLine(meshName + " yüz sayısı: " + faceCount);

vertexCount = 26;
faceCount = faceCount * 4;
Console.WriteLine("Subdivision sonrası: " + vertexCount + " vertex, " + faceCount + " yüz");`,
      explain: {
        1: `<b>Bildirim</b> (<t en="declaration" ja="宣言">declaration</t>): "Adı <code>vertexCount</code> olan bir tam sayı kutusu oluştur." Kutu var ama içine henüz bir şey konmadı.`,
        2: `<b>Atama</b> (<t en="assignment" ja="代入">assignment</t>): <code>=</code> işareti matematikteki "eşittir" değildir! "Sağdakini al, soldaki kutuya koy" demektir. Okurken "vertexCount <b>olsun</b> 8" de.`,
        3: `<b>Okuma:</b> Değişkenin adını yazınca bilgisayar kutuyu açar ve içindeki değeri (8) kullanır. Tırnak yok! <code>"vertexCount"</code> yazsaydık ekrana adın kendisi yazılırdı.`,
        5: `<b>İlk değer verme</b> (<t en="initialization" ja="初期化">initialization</t>): bildirim ve atama tek satırda. En sık kullanılan ve en güvenli yöntem budur.`,
        6: `<code>string</code> metin tutan bir tiptir. Metin değeri çift tırnak içinde yazılır.`,
        7: `<code>+</code> metinleri ve sayıları yan yana ekler (birleştirme). Bilgisayar önce değişkenleri okur: <code>"Cube" + " yüz sayısı: " + 6</code>. Metinleri Ders 4'te ayrıntılı göreceğiz.`,
        9: `<b>Yeniden atama:</b> Kutudaki eski değer (8) silinir, yerine 26 konur. Başta <code>int</code> yok — çünkü kutu zaten var, yeni kutu açmıyoruz. (Bir küpe bir kez Subdivision uygulayınca 26 vertex oluşur.)`,
        10: `Önce <b>sağ taraf</b> hesaplanır: kutudaki 6 okunur, 4 ile çarpılır → 24. Sonra sonuç aynı kutuya yazılır. Değişken kendi eski değerinden yeni değer üretebilir.`,
        11: `Satır çalıştığı anda kutularda ne varsa o yazılır: 26 ve 24. Eski değerler artık hiçbir yerde yok.`,
      },
      runnable: true,
      stepper: true,
      note: '"Adım adım" modunda her satırdan sonra değişken tablosuna bak: vertexCount önce boş, sonra 8, en sonda 26 oluyor.',
    },
    {
      kind: 'concept',
      title: 'İsimlendirme kuralları ve camelCase',
      body: `
<p>Değişken adına <t en="identifier" ja="識別子">tanımlayıcı</t> (identifier) denir. Derleyicinin <b>kesin kuralları</b> var:</p>
<ul>
<li>Harf veya <code>_</code> ile başlar; rakamla başlayamaz: <code>lod2</code> ✓, <code>2lod</code> ✗</li>
<li>Boşluk içeremez: <code>vertex count</code> ✗</li>
<li>C#'ın <t en="keyword" ja="キーワード">anahtar kelimeleri</t> kullanılamaz: <code>int</code>, <code>class</code>, <code>string</code> ✗</li>
<li>Büyük/küçük harf duyarlı: <code>vertexCount</code> ve <code>vertexcount</code> <b>iki farklı</b> isimdir.</li>
</ul>
<p>Bir de herkesin uyduğu <t en="naming convention" ja="命名規則">isimlendirme düzeni</t> var. Yerel değişkenlerde C# geliştiricileri <b>camelCase</b> kullanır: ilk kelime küçük, sonraki her kelimenin baş harfi büyük — <code>vertexCount</code>, <code>uvChannelIndex</code>, <code>wallThicknessMm</code>. Sabitler genelde <b>PascalCase</b>: <code>MaxPolyCount</code>.</p>
<div class="callout tip"><b>3D'den tanıdık:</b> Asset isimlendirme kuralları (<code>SM_Chair_LOD0</code>) ekipteki herkes dosyaları anlasın diye vardır. Kod isimleri de öyle: <code>x</code> yerine <code>wallHeight</code> yazmak, 6 ay sonra kodu okuyan kişiye (çoğu zaman sana!) yapılmış bir iyiliktir. Türkçe karakterler (ı, ş, ğ) teknik olarak çalışır ama profesyonel kodda İngilizce isimler standarttır.</div>`,
    },
    {
      kind: 'code',
      title: 'İki değeri takas etmek (swap)',
      code: cs`int lodA = 5000;
int lodB = 1200;

int temp = lodA;
lodA = lodB;
lodB = temp;

Console.WriteLine("lodA: " + lodA);
Console.WriteLine("lodB: " + lodB);`,
      explain: {
        1: `İki LOD seviyesinin poligon sayılarını tutuyoruz. Yanlışlıkla ters girilmişler; yerlerini değiştirmek istiyoruz.`,
        4: `<b>Kritik adım:</b> lodA'nın değerini (5000) geçici bir kutuya (<code>temp</code>) kopyalıyoruz. Bunu yapmazsak bir sonraki satırda 5000 sonsuza dek kaybolur.`,
        5: `lodA'ya lodB'nin değeri (1200) yazılır. lodA'daki 5000 silindi — ama <code>temp</code>'te bir kopyası güvende.`,
        6: `lodB'ye temp'teki 5000 yazılır. Takas tamam!`,
        8: `Sonuç: lodA 1200, lodB 5000.`,
      },
      runnable: true,
      stepper: true,
      note: 'Neden temp gerekli? İki elinde birer bardak su var ve içerikleri değiştirmek istiyorsun: üçüncü bir boş bardak olmadan yapamazsın. Satır 4\'ü silip "Adım adım" çalıştır ve ne kaybolduğunu izle.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Kopya mı, bağlantı mı?',
      code: cs`int x = 5;
int y = x;
x = 10;
Console.WriteLine(x);
Console.WriteLine(y);`,
      options: ['10\n10', '10\n5', '5\n10', '5\n5'],
      answer: 1,
      explain: '<code>int y = x;</code> satırı, o anda x\'in içindeki <b>değeri (5) kopyalar</b>. y ile x arasında kalıcı bir bağ kurulmaz. Sonra x\'i 10 yapmak y\'yi etkilemez. (Blender\'da Shift+D ile kopyalanan obje gibi: orijinali düzenlemek kopyayı değiştirmez.)',
    },
    {
      kind: 'code',
      title: 'var ve const',
      code: cs`var objectName = "SM_Chair";
var polyCount = 1500;
const double MmPerInch = 25.4;

double legHeightInch = 18;
double legHeightMm = legHeightInch * MmPerInch;

Console.WriteLine(objectName + " poly: " + polyCount);
Console.WriteLine("Ayak yüksekliği: " + legHeightMm + " mm");`,
      explain: {
        1: `<code>var</code>: "Tipi sen bul" demek. Sağ taraf bir metin olduğu için derleyici tipi <code>string</code> olarak belirler (<t en="type inference" ja="型推論">tip çıkarımı</t>). Tip yine sabittir — sadece yazmayı derleyiciye bıraktık.`,
        2: `Sağ taraf tam sayı → <code>polyCount</code> bir <code>int</code> olur. <code>var</code> ile ilk değer <b>zorunludur</b>; <code>var x;</code> yazamazsın, derleyici tipi tahmin edemez.`,
        3: `<code>const</code>: <t en="constant" ja="定数">sabit</t>. Değeri bir kez verilir ve <b>asla değişmez</b>; değiştirmeye çalışırsan derleme hatası alırsın. 1 inç = 25.4 mm tanım gereği hiç değişmez — sabit için ideal.`,
        5: `Ölçü inç olarak geldi (ör. bir ABD kaynağından alınmış model).`,
        6: `Sabiti formülde kullanıyoruz. Kodda çıplak <code>25.4</code> yazmak yerine isimli sabit kullanmak, sayının <b>ne anlama geldiğini</b> belgeler.`,
        8: `Değişkenleri metinle birleştirip yazdırıyoruz.`,
        9: `18 × 25.4 = 457.2 mm.`,
      },
      runnable: true,
      stepper: true,
      note: 'Dene: 3. satırdan sonra "MmPerInch = 30;" ekleyip çalıştır. Derleyici sabitin değiştirilmesine izin vermeyecek.',
    },
    {
      kind: 'warning',
      title: 'Sık yapılan değişken hataları',
      body: `
<ol>
<li><b>Değer vermeden okumak</b> → <code>error CS0165: Use of unassigned local variable 'x'</code>. Bildirilmiş ama boş kutuyu açmaya çalıştın. C# bunu derlerken yakalar, çünkü "boş kutudaki çöpü" okumak eski dillerde çok sinsi hatalara yol açıyordu.</li>
<li><b>Aynı ismi iki kez bildirmek</b> → <code>error CS0128: A local variable or function named 'x' is already defined in this scope</code>. Yeniden atarken başa tip yazma: <code>int x = 5; int x = 6;</code> ✗ — <code>int x = 5; x = 6;</code> ✓</li>
<li><b>Yazım/harf hatası</b> → <code>error CS0103: The name 'vertexcount' does not exist in the current context</code>. Derleyici için <code>vertexCount</code> ile <code>vertexcount</code> farklı isimdir.</li>
<li><b>Sabiti değiştirmek</b> → <code>error CS0131</code>. <code>const</code> kilitlidir.</li>
<li><b>Tırnak karışıklığı:</b> <code>Console.WriteLine("count");</code> değişkeni değil, "count" kelimesini yazar.</li>
</ol>
<p>Aşağıdaki kodda bir hata var. Önce çalıştır, mesajı oku, sonra <b>düzelt</b>.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Bu kodu düzelt',
      code: cs`int edgeCount;
Console.WriteLine(edgeCount);
edgeCount = 12;`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: 'Kutu oluşturuldu ama içi boş.',
        2: 'Hata burada: boş kutu okunmaya çalışılıyor. Hata kodu CS0165.',
        3: 'Değer veriliyor… ama çok geç! Bilgisayar satırları yukarıdan aşağıya yürütür.',
      },
      note: 'İpucu: Satırların sırasını düşün. Ya da bildirim satırında doğrudan ilk değer ver. Çıktı 12 olmalı.',
    },
    {
      kind: 'cad',
      title: 'CAD/BIM\'de değişkenler: parametrik tasarımın temeli',
      body: `
<p>BIM yazılımlarında bir duvar "çizgi" değildir; <b>parametreleri</b> olan bir nesnedir: uzunluk, yükseklik, kalınlık, malzeme… Kullanıcı özellikler panelinde yüksekliği 2400'den 2700'e çevirdiğinde, kodun içinde aslında bir değişkenin değeri yeniden atanır ve model yeniden hesaplanır.</p>
<ul>
<li><b>Değişken = parametre:</b> <code>double wallHeightMm = 2400;</code> — parametrik modellemenin en küçük yapı taşı.</li>
<li><b>Sabit = değişmeyen kural:</b> Birim dönüşümleri (<code>const double MmPerInch = 25.4;</code>) ya da geleneksel Japon ölçü birimi <b>尺 (shaku)</b>, yani 10/33 m ≈ 303 mm gibi tanım gereği sabit değerler.</li>
<li><b>Anlamlı isim:</b> Japonya'da mimari çizimlerde ölçüler genellikle milimetre ile yazılır. Bu yüzden <code>height</code> yerine <code>heightMm</code> gibi <b>birimi isimde taşımak</b>, birim karışıklığından doğan pahalı hataları önler.</li>
</ul>
<p class="muted">Japonca kod incelemelerinde (コードレビュー) sık duyacağın bir terim: <b>マジックナンバー</b> (magic number) — anlamı belirsiz çıplak sayı. Çözümü bugün öğrendin: isimli sabit.</p>`,
    },
  ],
  exercise: {
    title: 'Mesh istatistikleri',
    prompt: `
<p>Bir küpün bilgilerini değişkenlerde tut ve Subdivision sonrası güncelle:</p>
<ol>
<li><code>meshName</code> adında bir <code>string</code> değişken oluştur, değeri <code>"Cube"</code> olsun.</li>
<li><code>vertexCount</code> adında bir <code>int</code> değişken oluştur, değeri <code>8</code> olsun.</li>
<li>Değişkenleri kullanarak ilk satırı yazdır.</li>
<li><code>vertexCount</code>'u <b>yeniden atayarak</b> 26 yap (yeni değişken açma!).</li>
<li>Aynı yazdırma kodunu tekrar kullanarak ikinci satırı yazdır.</li>
</ol>
<pre class="expected">Cube: 8 vertex
Cube: 26 vertex</pre>`,
    starter: cs`// 1) meshName ve vertexCount değişkenlerini oluştur

// 2) ilk durumu yazdır

// 3) vertexCount'u yeniden ata

// 4) yeni durumu yazdır
`,
    checks: [
      { type: 'output', expect: 'Cube: 8 vertex\nCube: 26 vertex', msg: 'Çıktı iki satır olmalı: "Cube: 8 vertex" ve "Cube: 26 vertex"' },
      { type: 'code', pattern: 'string\\s+meshName\\s*=\\s*"Cube"', msg: 'meshName adında, değeri "Cube" olan bir string değişken oluşturmalısın' },
      { type: 'code', pattern: 'int\\s+vertexCount\\s*=\\s*8\\s*;', msg: 'vertexCount adında, ilk değeri 8 olan bir int değişken oluşturmalısın' },
      { type: 'code', pattern: '(^|[^\\w\\s]|\\n)\\s*vertexCount\\s*=\\s*26\\s*;', msg: 'vertexCount\'u başına tip yazmadan yeniden atamalısın: vertexCount = 26;' },
      { type: 'notCode', pattern: '"[^"\\n]*\\d[^"\\n]*"', msg: 'Sayıları metnin içine elle yazma — değişkeni yazdır (ör. meshName + ": " + vertexCount + " vertex")' },
      { type: 'notCode', pattern: '"[^"\\n]*Cube[^"\\n]*:', msg: '"Cube" adını sadece değişkende tut; yazdırırken meshName değişkenini kullan' },
    ],
    hints: [
      'Değişken oluşturma kalıbı: <code>tip isim = değer;</code> — ör. <code>int faceCount = 6;</code>',
      'Yazdırırken metni ve değişkenleri <code>+</code> ile birleştir. Değişken adları tırnak içine <b>girmez</b>. Aradaki <code>": "</code> ve <code>" vertex"</code> parçaları ise metindir.',
      'Yeniden atamada başa <code>int</code> yazarsan yeni kutu açmaya çalışırsın (CS0128). Sadece <code>vertexCount = ...;</code> yaz, sonra ilk yazdırma satırının aynısını kopyala.',
    ],
    solution: cs`string meshName = "Cube";
int vertexCount = 8;
Console.WriteLine(meshName + ": " + vertexCount + " vertex");

vertexCount = 26;
Console.WriteLine(meshName + ": " + vertexCount + " vertex");`,
    explain: 'İki yazdırma satırı <b>birebir aynı</b> ama farklı çıktı üretti. Çünkü satır çalıştığı anda kutudaki değer okunur: ilk seferde 8, yeniden atamadan sonra 26. Değişkenlerin gücü budur — aynı kod, değişen veriyle farklı sonuç üretir.',
  },
  quiz: [
    {
      q: '<code>int count = 5;</code> satırı çalışınca ne olur?',
      options: [
        { t: 'RAM\'de tam sayı tutan, adı count olan bir yer ayrılır ve içine 5 konur', correct: true, why: 'Doğru. Bu, bildirim ve atamanın tek satırda yapıldığı "ilk değer verme"dir.' },
        { t: 'count ile 5\'in eşit olup olmadığı kontrol edilir', why: 'Hayır. Tek = atamadır ("koy"). Eşitlik kontrolü == ile yapılır; onu Ders 6\'da göreceğiz.' },
        { t: 'Ekrana 5 yazılır', why: 'Hayır. Bu satır sadece değeri belleğe koyar. Ekrana yazmak için Console.WriteLine(count) gerekir.' },
        { t: 'count adında bir metin oluşturulur', why: 'Hayır. Tip int olduğu için bu bir tam sayı kutusudur; metin için string kullanılır.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`int a = 3;
a = a + 2;
a = a * 2;
Console.WriteLine(a);`,
      verifyOutput: true,
      options: [
        { t: '10', correct: true, why: 'Doğru. a önce 3, sonra 3 + 2 = 5, sonra 5 × 2 = 10. Her satır kutudaki o anki değeri kullanır.' },
        { t: '6', why: 'Bu, a\'nın 3 olarak kaldığını varsayıp sadece son satırı hesaplamak olur. Ama ikinci satır a\'yı 5 yaptı.' },
        { t: '5', why: 'İkinci satırı doğru hesapladın ama üçüncü satır a\'yı tekrar değiştiriyor.' },
        { t: '3', why: 'Yeniden atama kutudaki değeri gerçekten değiştirir; a 3 olarak kalmaz.' },
      ],
    },
    {
      q: 'Hangisi geçerli bir C# değişken adıdır?',
      options: [
        { t: '_uvChannel2', correct: true, why: 'Doğru. _ ile başlayabilir, içinde rakam olabilir. (Yerel değişkenlerde yine de camelCase tercih edilir: uvChannel2.)' },
        { t: '2ndLod', why: 'Değişken adları rakamla başlayamaz. lod2nd ya da secondLod olabilir.' },
        { t: 'vertex count', why: 'İsimlerde boşluk olamaz. Derleyici bunu iki ayrı kelime sanar. camelCase kullan: vertexCount.' },
        { t: 'class', why: 'class bir C# anahtar kelimesidir (keyword); değişken adı olarak kullanılamaz.' },
      ],
    },
    {
      q: 'Bu kod neden derlenmez?',
      code: cs`int triCount;
Console.WriteLine(triCount);`,
      options: [
        { t: 'triCount\'a değer verilmeden okunmaya çalışılıyor (CS0165)', correct: true, why: 'Doğru. Kutu bildirildi ama içine hiçbir şey konmadı. C# boş kutunun okunmasına izin vermez.' },
        { t: 'triCount geçersiz bir isim', why: 'İsim geçerli ve camelCase\'e uygun. Sorun isimde değil, değerin olmamasında.' },
        { t: 'Console.WriteLine değişken yazdıramaz', why: 'Yazdırabilir; Console.WriteLine(x) x\'in değerini yazar. Ama önce x\'in bir değeri olmalı.' },
        { t: 'Kod sorunsuz derlenir ve 0 yazar', why: 'Bazı dillerde (ve C#\'ta sınıf alanlarında) varsayılan 0 olabilir, ama yerel değişkenlerde C# bunu hata sayar.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir? (Takas denemesi)',
      code: cs`int a = 1;
int b = 2;
a = b;
b = a;
Console.WriteLine(a + " " + b);`,
      verifyOutput: true,
      options: [
        { t: '2 2', correct: true, why: 'Doğru. a = b ile a 2 olur ve 1 kaybolur. Sonra b = a, b\'ye yine 2 yazar. Takas için geçici (temp) değişken gerekir.' },
        { t: '2 1', why: 'Takasın amacı buydu, ama a = b satırı a\'daki 1\'i sildi. b = a çalıştığında a\'da artık 2 var.' },
        { t: '1 2', why: 'Atamalar değerleri gerçekten değiştirir; a ve b eski hâlinde kalmaz.' },
        { t: '1 1', why: 'İlk atama a\'yı değiştirdi, b\'yi değil. a = b, b\'nin değerini a\'ya kopyalar.' },
      ],
    },
    {
      q: '<code>const double MmPerInch = 25.4;</code> yazdıktan sonra <code>MmPerInch = 25;</code> yazarsan ne olur?',
      options: [
        { t: 'Derleme hatası alırsın; const değerler değiştirilemez', correct: true, why: 'Doğru. const, derleme anında sabitlenir. Yeniden atama denemesi kodu hiç çalıştırmadan durdurur.' },
        { t: 'Değer 25 olur', why: 'Normal bir değişken olsaydı öyle olurdu. const ise "kilitli alan" demektir.' },
        { t: 'Program çalışır ama değer 25.4 kalır', why: 'C# hatayı sessizce yutmaz; derleyici bunu açıkça hata olarak bildirir.' },
        { t: 'Değer 50.4 olur', why: '= toplama yapmaz, atama yapar. Ve const\'a atama zaten yasak.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Z-up\'tan Y-up\'a',
    prompt: `
<p>Blender <b>Z-up</b> kullanır (Z yukarı). Maya ve pek çok oyun motoru ise <b>Y-up</b> kullanır. Modeller arasında yaygın bir dönüşüm şudur:</p>
<pre>yeni x = x
yeni y = z
yeni z = -y   (eski y'nin eksi işaretlisi)</pre>
<p>Başlangıç kodundaki üç değişkeni bu kurala göre <b>yerinde</b> güncelle. Sayıları elle yazmak yok — sadece değişkenler ve (gerekirse) bir <code>temp</code> değişkeni kullan.</p>
<pre class="expected">x: 1.5
y: 3.25
z: -2</pre>
<p class="muted">İpucu: Bir sayının başına <code>-</code> koymak onu eksi yapar: <code>-temp</code>.</p>`,
    starter: cs`double x = 1.5;
double y = 2.0;
double z = 3.25;

// Dönüşümü burada yap


Console.WriteLine("x: " + x);
Console.WriteLine("y: " + y);
Console.WriteLine("z: " + z);`,
    checks: [
      { type: 'output', expect: 'x: 1.5\ny: 3.25\nz: -2', msg: 'Dönüşümden sonra x: 1.5, y: 3.25, z: -2 yazmalı' },
      { type: 'notCode', pattern: '\\n\\s*(y\\s*=\\s*3\\.25|z\\s*=\\s*-\\s*2)', msg: 'Sayıları elle atama; değişkenleri birbirine ata (y = z gibi)' },
      { type: 'code', pattern: 'y\\s*=\\s*z\\s*;', msg: 'y\'ye z\'nin değerini atamalısın' },
      { type: 'notCode', pattern: 'WriteLine\\(\\s*"[^"]*-?\\d', msg: 'Çıktı satırlarını değiştirme; sonuç değişkenlerden gelmeli' },
    ],
    hints: [
      'Bir değişkeni üzerine yazmadan önce eski değerine hâlâ ihtiyacın var mı? Takas örneğini hatırla.',
      'y\'yi z ile değiştirince eski y (2.0) kaybolur. Ama yeni z için eski y gerekiyor. Önce onu bir yere sakla.',
      'Sıra: önce eski y\'yi <code>temp</code>\'e kopyala, sonra <code>y = z;</code>, en son z\'ye temp\'in eksi işaretlisini ata. x hiç değişmiyor.',
    ],
    solution: cs`double x = 1.5;
double y = 2.0;
double z = 3.25;

double temp = y;
y = z;
z = -temp;

Console.WriteLine("x: " + x);
Console.WriteLine("y: " + y);
Console.WriteLine("z: " + z);`,
    explain: 'Takasın aynısı, küçük bir farkla: temp eski y\'yi korudu, böylece y\'nin üzerine z yazılsa da z\'ye eski y\'nin eksisini verebildik. Eksen dönüşümleri, dosya içe/dışa aktarıcılarının (importer/exporter) her gün yaptığı işlerdendir.',
  },
  extras: [
    {
      difficulty: 1,
      title: 'Poligon sayısını güncelle',
      prompt: `<p><code>polyCount</code> adında, değeri 1000 olan bir <code>int</code> değişken oluştur ve yazdır. Sonra <code>polyCount = polyCount + 500;</code> biçiminde <b>kendi değerini kullanarak</b> 500 artır ve tekrar yazdır.</p><pre class="expected">1000
1500</pre>`,
      starter: cs`// polyCount değişkenini oluştur
`,
      checks: [
        { type: 'output', expect: '1000\n1500' },
        { type: 'code', pattern: 'polyCount\\s*=\\s*polyCount\\s*\\+\\s*500', msg: 'polyCount\'u kendi değerine 500 ekleyerek güncellemelisin' },
        { type: 'notCode', pattern: '1500', msg: '1500\'ü elle yazma; bilgisayar hesaplasın' },
      ],
      hints: ['Önce <code>int polyCount = 1000;</code> ve <code>Console.WriteLine(polyCount);</code>', 'Atamada önce sağ taraf hesaplanır: <code>polyCount + 500</code> → 1500, sonra sonuç aynı kutuya yazılır.'],
      solution: cs`int polyCount = 1000;
Console.WriteLine(polyCount);
polyCount = polyCount + 500;
Console.WriteLine(polyCount);`,
    },
    {
      difficulty: 2,
      title: 'Sabitle üçgen sayısı',
      prompt: `<p>Her quad (dörtgen yüz) oyun motoruna giderken 2 üçgene bölünür. <code>const int TrisPerQuad = 2;</code> sabitini ve <code>var</code> ile tanımlanmış <code>quadCount = 350</code> değişkenini kullanarak üçgen sayısını hesapla ve yazdır.</p><pre class="expected">Üçgen: 700</pre>`,
      starter: cs`// TrisPerQuad sabiti ve quadCount değişkeni
`,
      checks: [
        { type: 'output', expect: 'Üçgen: 700' },
        { type: 'code', pattern: 'const\\s+int\\s+TrisPerQuad\\s*=\\s*2', msg: 'const int TrisPerQuad = 2; sabitini tanımlamalısın' },
        { type: 'code', pattern: 'var\\s+quadCount\\s*=\\s*350', msg: 'quadCount\'u var ile tanımlamalısın' },
        { type: 'notCode', pattern: '700', msg: '700\'ü elle yazma; quadCount * TrisPerQuad ile hesapla' },
      ],
      hints: ['Çarpma işareti <code>*</code>: <code>quadCount * TrisPerQuad</code>', 'Sonucu bir değişkene koyup <code>"Üçgen: " + sonuç</code> biçiminde yazdırabilirsin.'],
      solution: cs`const int TrisPerQuad = 2;
var quadCount = 350;
int triCount = quadCount * TrisPerQuad;
Console.WriteLine("Üçgen: " + triCount);`,
    },
    {
      difficulty: 3,
      title: 'temp olmadan takas',
      prompt: `<p><code>int a = 7; int b = 3;</code> değerlerini <b>üçüncü bir değişken kullanmadan</b> takas et. Sadece <code>a</code> ve <code>b</code> ile, toplama ve çıkarma kullanarak üç atama yap. Ardından <code>Console.WriteLine(a + " " + b);</code> ile yazdır.</p><pre class="expected">3 7</pre>`,
      starter: cs`int a = 7;
int b = 3;

// sadece a ve b ile takas et

Console.WriteLine(a + " " + b);`,
      checks: [
        { type: 'output', expect: '3 7' },
        { type: 'notCode', pattern: '(int|var|double)\\s+(?!a\\b|b\\b)\\w+\\s*=', msg: 'Üçüncü bir değişken açmamalısın' },
        { type: 'notCode', pattern: '[ab]\\s*=\\s*[37]\\s*;[\\s\\S]*[ab]\\s*=\\s*[37]\\s*;[\\s\\S]*[ab]\\s*=\\s*[37]\\s*;', msg: 'Sayıları elle atama; a ve b\'yi toplama/çıkarma ile birleştir' },
        { type: 'code', pattern: 'a\\s*=\\s*a\\s*[+-]\\s*b', msg: 'a\'yı a ve b\'den hesaplamalısın (ör. a = a + b)' },
      ],
      hints: ['İlk adımda iki sayının toplamını a\'ya koyarsan, iki değerin bilgisi tek kutuda saklanmış olur (10).', 'Toplamdan b\'yi çıkarırsan eski a\'yı elde edersin. Bunu b\'ye yaz. Sonra toplamdan yeni b\'yi çıkar…'],
      solution: cs`int a = 7;
int b = 3;

a = a + b;
b = a - b;
a = a - b;

Console.WriteLine(a + " " + b);`,
    },
  ],
  vocab: [
    { en: 'Variable', tr: 'Değişken', ja: '変数', kana: 'へんすう', romaji: 'hensū' },
    { en: 'Value', tr: 'Değer', ja: '値', kana: 'あたい', romaji: 'atai' },
    { en: 'Declaration', tr: 'Bildirim', ja: '宣言', kana: 'せんげん', romaji: 'sengen' },
    { en: 'Assignment', tr: 'Atama', ja: '代入', kana: 'だいにゅう', romaji: 'dainyū' },
    { en: 'Initialization', tr: 'İlk değer verme', ja: '初期化', kana: 'しょきか', romaji: 'shokika' },
    { en: 'Constant', tr: 'Sabit', ja: '定数', kana: 'ていすう', romaji: 'teisū' },
    { en: 'Identifier', tr: 'Tanımlayıcı (isim)', ja: '識別子', kana: 'しきべつし', romaji: 'shikibetsushi' },
    { en: 'Naming convention', tr: 'İsimlendirme düzeni', ja: '命名規則', kana: 'めいめいきそく', romaji: 'meimei kisoku' },
    { en: 'Type inference', tr: 'Tip çıkarımı', ja: '型推論', kana: 'かたすいろん', romaji: 'kata suiron' },
    { en: 'Memory', tr: 'Bellek', ja: 'メモリ', kana: 'メモリ', romaji: 'memori' },
    { en: 'Magic number', tr: 'Sihirli sayı (anlamı belirsiz sayı)', ja: 'マジックナンバー', kana: 'マジックナンバー', romaji: 'majikku nanbā' },
  ],
  summary: [
    'Değişken, RAM\'de adı olan bir kutudur: tip + isim + değer. İsimler insanlar için, adresler makine içindir.',
    '= "eşittir" değil "ata"dır: önce sağ taraf hesaplanır, sonra soldaki kutuya yazılır. Eski değer silinir.',
    'Bildirim (int x;), atama (x = 5;) ve ilk değer verme (int x = 5;) farklı şeylerdir; yeniden atamada tip yazılmaz.',
    'İsimler harf/_ ile başlar, boşluk ve anahtar kelime içermez; yerel değişkenlerde camelCase kullanılır.',
    'var tipi derleyiciye bulduran kısa yazımdır (ilk değer şart); const asla değişmeyen sabitlerdir.',
    'İki değeri takas etmek için geçici (temp) değişken gerekir; int y = x; değeri kopyalar, bağ kurmaz.',
  ],
};
