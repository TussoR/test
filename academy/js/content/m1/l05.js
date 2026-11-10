import { cs } from '../helpers.js';

export default {
  id: 'm1-l05',
  module: 'm1',
  title: 'Sayılar ve operatörler',
  titleEn: 'Numbers & operators',
  titleJa: '数値と演算子',
  minutes: 70,
  level: 1,
  objectives: [
    '+ - * / % operatörlerini kullanmak; tam sayı bölmesi ile ondalıklı bölme arasındaki farkı açıklamak',
    'İşlem önceliğini bilmek ve parantezle hesap sırasını kontrol etmek',
    '+=, -=, *=, /=, ++ ve -- ile değişkenleri kısa yoldan güncellemek',
    'Math.Sqrt, Pow, Abs, Round, Floor, Ceiling, Max, Min ve PI ile geometri hesapları yapmak; Math.Round\'un "banker yuvarlaması" yaptığını bilmek',
    'Kayan nokta hatasının nedenini anlamak ve double değerleri == yerine tolerans ile karşılaştırmak',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Operatörler, ifadeler ve işlem önceliği',
      body: `
<p>Bir <t en="operator" ja="演算子">operatör</t>, değerler üzerinde işlem yapan semboldür. Üzerinde işlem yapılan değerlere <t en="operand" ja="オペランド">işlenen</t> denir. Hepsi birlikte bir <t en="expression" ja="式">ifade</t> oluşturur ve her ifade sonunda <b>tek bir değere</b> dönüşür: <code>quads * 2</code> → <code>2400</code>.</p>
<table class="compare">
<tr><th>Operatör</th><th>Anlamı</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>+</code> <code>-</code></td><td>toplama, çıkarma</td><td><code>8 - 3</code></td><td>5</td></tr>
<tr><td><code>*</code></td><td>çarpma</td><td><code>4 * 2</code></td><td>8</td></tr>
<tr><td><code>/</code></td><td>bölme</td><td><code>7 / 2</code></td><td><b>3</b> (!)</td></tr>
<tr><td><code>%</code></td><td>kalan (mod)</td><td><code>7 % 2</code></td><td>1</td></tr>
</table>
<p><b><t en="operator precedence" ja="演算子の優先順位">İşlem önceliği</t>:</b> Matematikteki gibi <code>* / %</code> önce, <code>+ -</code> sonra yapılır. Aynı seviyedekiler <b>soldan sağa</b> işlenir. <code>2 + 3 * 4</code> = 14, ama <code>(2 + 3) * 4</code> = 20. <b>Parantez her şeyden önce gelir</b> — emin olmadığında parantez kullan; kodu okuyan herkes için de daha açıktır.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Blender\'ın sayı alanları ve Math düğümü',
      body: `
<p>Blender'da bir sayı alanına <code>2.5*4</code> ya da <code>1/3</code> yazıp Enter'a bastığında Blender ifadeyi hesaplayıp sonucu alana koyar. Yani zaten operatör kullanıyorsun!</p>
<p>Geometry Nodes ve Shader Editor'deki <b>Math</b> düğümü de bugünün konusunun görsel hâlidir: Add, Subtract, Multiply, Divide, Modulo, Power, Square Root, Absolute, Round, Floor, Ceil, Minimum, Maximum… Hepsinin C#'ta bir karşılığı var:</p>
<table class="compare">
<tr><th>Math düğümü</th><th>C#</th></tr>
<tr><td>Multiply</td><td><code>a * b</code></td></tr>
<tr><td>Modulo</td><td><code>a % b</code></td></tr>
<tr><td>Power</td><td><code>Math.Pow(a, b)</code></td></tr>
<tr><td>Square Root</td><td><code>Math.Sqrt(a)</code></td></tr>
<tr><td>Absolute</td><td><code>Math.Abs(a)</code></td></tr>
<tr><td>Minimum / Maximum</td><td><code>Math.Min(a, b)</code> / <code>Math.Max(a, b)</code></td></tr>
</table>
<p>Düğümleri zincirleyerek kurduğun ağ, kodda tek bir ifade olur: <code>Math.Sqrt(dx * dx + dy * dy)</code>.</p>`,
    },
    {
      kind: 'visual',
      title: 'Tam sayı bölmesi, kalan ve ondalıklı bölme',
      svg: `
<svg viewBox="0 0 760 240" role="img" aria-label="7 quad ikişerli gruplanınca 3 grup ve 1 artan kalır">
  <defs><marker id="ar-l05" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <text x="266" y="36" class="t2">7 quad'ı ikişer ikişer grupla</text>
    <rect x="40" y="60" width="56" height="56" rx="6" class="box"/>
    <rect x="106" y="60" width="56" height="56" rx="6" class="box"/>
    <rect x="172" y="60" width="56" height="56" rx="6" class="box"/>
    <rect x="238" y="60" width="56" height="56" rx="6" class="box"/>
    <rect x="304" y="60" width="56" height="56" rx="6" class="box"/>
    <rect x="370" y="60" width="56" height="56" rx="6" class="box"/>
    <rect x="436" y="60" width="56" height="56" rx="6" class="box hi"/>
    <line x1="40" y1="130" x2="162" y2="130" stroke="var(--accent)" stroke-width="2"/>
    <line x1="172" y1="130" x2="294" y2="130" stroke="var(--accent)" stroke-width="2"/>
    <line x1="304" y1="130" x2="426" y2="130" stroke="var(--accent)" stroke-width="2"/>
    <text x="101" y="150" class="t3">grup 1</text>
    <text x="233" y="150" class="t3">grup 2</text>
    <text x="365" y="150" class="t3">grup 3</text>
    <text x="464" y="150" class="t3">artan</text>
    <line x1="556" y1="128" x2="498" y2="96" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l05)"/>
    <g text-anchor="start">
      <text x="560" y="72" class="t1">7 / 2 = 3</text>
      <text x="560" y="90" class="t3">int / int → kaç TAM grup?</text>
      <text x="560" y="134" class="t1">7 % 2 = 1</text>
      <text x="560" y="152" class="t3">geriye kaç tane kaldı?</text>
      <text x="560" y="196" class="t1">7 / 2.0 = 3.5</text>
      <text x="560" y="214" class="t3">biri double → kesirli sonuç</text>
    </g>
    <text x="266" y="200" class="t2">Kural: iki tam sayı bölünürse sonuç da tam sayıdır;</text>
    <text x="266" y="218" class="t2">kesirli kısım yuvarlanmaz, atılır.</text>
  </g>
</svg>`,
      caption: `
<p>İşlemci tam sayılar ve kayan noktalı sayılar için <b>farklı devreler/talimatlar</b> kullanır. <code>7 / 2</code> yazdığında iki işlenen de <code>int</code> olduğu için C# <b>tam sayı bölmesi</b> (<t en="integer division" ja="整数除算">integer division</t>) seçer. İşlenenlerden en az biri <code>double</code> ise ondalıklı bölme yapılır.</p>
<p><code>%</code> (<t en="remainder / modulo" ja="剰余">kalan</t>) her zaman tam sayı bölmesiyle birlikte düşünülür: <code>7 = 2 × 3 + 1</code>. Bölüm 3, kalan 1.</p>`,
    },
    {
      kind: 'code',
      title: 'Bölme türleri ve işlem önceliği',
      code: cs`int a = 7;
int b = 2;
Console.WriteLine(a / b);
Console.WriteLine(a % b);
Console.WriteLine(a / 2.0);
Console.WriteLine((double)a / b);
Console.WriteLine((double)(a / b));

Console.WriteLine(2 + 3 * 4);
Console.WriteLine((2 + 3) * 4);

double lengthMm = 2450;
Console.WriteLine(lengthMm / 1000);
Console.WriteLine(2450 / 1000);`,
      explain: {
        3: `int / int → <b>3</b>. Kesirli kısım (0.5) atılır. Hata yok, uyarı yok — sessizce olur. Bu yüzden tehlikelidir!`,
        4: `Kalan: 7'nin içinde 3 tane 2 var, geriye <b>1</b> kalır.`,
        5: `<code>2.0</code> bir double sabittir. İşlenenlerden biri double olunca diğeri de örtük olarak double'a çevrilir → <b>3.5</b>.`,
        6: `Cast <b>önce</b> a'ya uygulanır (7.0), sonra bölme yapılır → 3.5. Değişkenlerle çalışırken kullanılan yöntem budur.`,
        7: `Dikkat: Parantez içi önce hesaplanır: 7 / 2 = 3 (tam sayı), <b>sonra</b> double'a çevrilir → 3. Kaybolan kesir geri gelmez.`,
        9: `Çarpma önce: 3 * 4 = 12, sonra 2 + 12 = <b>14</b>.`,
        10: `Parantez önce: 5 * 4 = <b>20</b>.`,
        13: `Milimetreden metreye: double / int → double → 2.45.`,
        14: `Aynı hesap iki int ile: 2450 / 1000 = <b>2</b>! Birim dönüşümlerinde en sık yapılan hata.`,
      },
      runnable: true,
      stepper: true,
    },
    {
      kind: 'code',
      title: '% (kalan) nerede işe yarar?',
      code: cs`int vertexIndex = 17;
Console.WriteLine(vertexIndex % 2);

int frame = 130;
int fps = 24;
Console.WriteLine($"{frame / fps} sn + {frame % fps} kare");

int angle = 450;
Console.WriteLine(angle % 360);

int udim = 1015;
int tileIndex = udim - 1001;
Console.WriteLine($"U: {tileIndex % 10}, V: {tileIndex / 10}");`,
      explain: {
        2: `<b>Tek/çift testi:</b> Bir sayının 2'ye bölümünden kalan 0 ise çifttir, 1 ise tektir. 17 → 1 (tek). Satranç tahtası deseni, her ikinci elemanı seçmek gibi işlerde kullanılır.`,
        6: `<b>Zaman kodu:</b> 130. kare, 24 fps'te: 130 / 24 = <b>5</b> tam saniye, 130 % 24 = <b>10</b> kare artar. Bölme + kalan ikilisi "büyük birim + küçük birim" ayrıştırmasıdır.`,
        9: `<b>Sarma (wrapping):</b> 450° dönüş, 360° ile sarıldığında 90°'dir. Değeri bir aralıkta döngüye sokar — tıpkı Blender'da rotasyonun 360°'yi geçince aynı yöne bakması gibi.`,
        11: `<b>UDIM:</b> Substance ve Mari'den bildiğin UDIM numaraları 1001'den başlar; her satırda 10 tile vardır. Tile numarası = 1001 + U + 10 × V.`,
        12: `Önce 1001'i çıkarıp sıfır tabanlı bir sıra numarası elde ediyoruz: 14.`,
        13: `14 % 10 = <b>4</b> (satırdaki konum = U), 14 / 10 = <b>1</b> (kaçıncı satır = V). 1D sıra numarasını 2D ızgara konumuna çevirmek: texture atlas, sprite sheet ve grid tabanlı tüm sistemlerde kullanılan kalıp.`,
      },
      runnable: true,
      stepper: true,
      note: 'Dene: udim\'i 1023 yap. U ve V ne olur? (Cevap: U: 2, V: 2)',
    },
    {
      kind: 'code',
      title: 'Kısa yollar: +=, -=, *=, /=, ++, --',
      code: cs`int polyBudget = 10000;
polyBudget -= 2400;
polyBudget -= 1800;
Console.WriteLine(polyBudget);

double scale = 1.0;
scale *= 2.5;
scale /= 4;
Console.WriteLine(scale);

int lod = 0;
lod++;
lod++;
lod--;
Console.WriteLine(lod);

int counter = 5;
Console.WriteLine(counter++);
Console.WriteLine(counter);`,
      explain: {
        2: `<code>x -= 2400</code>, <code>x = x - 2400</code>'ün kısaltmasıdır (<t en="compound assignment" ja="複合代入">bileşik atama</t>). Bir karakter için poligon harcadık: kalan 7600.`,
        3: `Bir prop daha: 7600 - 1800 = 5800.`,
        4: `5800 yazar.`,
        7: `<code>scale *= 2.5</code> → 1.0 × 2.5 = 2.5.`,
        8: `<code>scale /= 4</code> → 2.5 / 4 = 0.625. scale double olduğu için kesir korunur.`,
        12: `<code>lod++</code> → 1 artır (<t en="increment" ja="インクリメント">increment</t>). <code>lod = lod + 1</code> ile aynı.`,
        14: `<code>lod--</code> → 1 azalt. Sonuç: 0 + 1 + 1 - 1 = 1.`,
        18: `İnce nokta: <code>counter++</code> bir ifadenin <b>içinde</b> kullanılınca önce <b>eski</b> değeri (5) verir, sonra artırır. (<code>++counter</code> ise önce artırır, sonra yeni değeri verir.)`,
        19: `Artık counter 6. Karışıklığı önlemek için <code>++</code> ve <code>--</code>'yi genelde kendi satırlarında kullan.`,
      },
      runnable: true,
      stepper: true,
    },
    {
      kind: 'code',
      title: 'Math kütüphanesi',
      code: cs`double dx = 3;
double dy = 4;
double distance = Math.Sqrt(dx * dx + dy * dy);
Console.WriteLine(distance);

Console.WriteLine(Math.Pow(2, 10));
Console.WriteLine(Math.Abs(-12.5));
Console.WriteLine(Math.Round(Math.PI, 3));

Console.WriteLine(Math.Round(2.5));
Console.WriteLine(Math.Round(3.5));
Console.WriteLine(Math.Round(2.5, MidpointRounding.AwayFromZero));

Console.WriteLine(Math.Floor(-2.5) + " / " + Math.Ceiling(2.1));
Console.WriteLine(Math.Max(1200, 950) + " / " + Math.Min(0.5, 0.25));`,
      explain: {
        3: `<b>Pisagor:</b> İki nokta arasındaki mesafe = √(dx² + dy²). <code>Math.Sqrt</code> karekök (<t en="square root" ja="平方根">square root</t>) alır. 3-4-5 üçgeni → <b>5</b>. Blender'daki "Measure" aracının arkasındaki hesap budur.`,
        6: `<code>Math.Pow(taban, üs)</code>: 2¹⁰ = 1024 — texture çözünürlüklerinden tanıdık. Sonuç her zaman double'dır.`,
        7: `<code>Math.Abs</code>: <t en="absolute value" ja="絶対値">mutlak değer</t> — işareti atar. İki ölçü arasındaki farkın "büyüklüğü" için.`,
        8: `<code>Math.PI</code> sabiti; <code>Math.Round(x, 3)</code> 3 ondalık basamağa yuvarlar → 3.142.`,
        10: `<b>Sürpriz: 2!</b> <code>Math.Round</code> varsayılan olarak tam yarıdaki (.5) değerleri <b>en yakın çift sayıya</b> yuvarlar: "banker yuvarlaması" (banker's rounding). Çok sayıda yuvarlamada yukarı/aşağı sapmayı dengelemek için tasarlanmıştır.`,
        11: `3.5 → en yakın çift sayı <b>4</b>. Yani 2.5 → 2, ama 3.5 → 4.`,
        12: `Okulda öğrendiğin "yarım yukarı" (四捨五入, shishagonyū) davranışını istiyorsan bunu <b>açıkça</b> söylemelisin: <code>MidpointRounding.AwayFromZero</code> → 3.`,
        14: `<code>Floor</code> her zaman <b>aşağı</b> (eksi sonsuza doğru): -2.5 → -3. <code>Ceiling</code> her zaman <b>yukarı</b>: 2.1 → 3. Kaç tane karo/panel gerekir? → Ceiling!`,
        15: `<code>Max</code> / <code>Min</code>: iki değerden büyüğü/küçüğü. Değerleri bir sınırda tutmak (clamp) için de kullanılır.`,
      },
      runnable: true,
      stepper: true,
      note: '(int) cast ile Floor farkı: (int)(-2.5) → -2 (sıfıra doğru keser), Math.Floor(-2.5) → -3 (aşağı yuvarlar). Pozitif sayılarda aynı, negatiflerde farklı!',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: 0.1 + 0.2 kaç eder?',
      code: cs`double sum = 0.1 + 0.2;
Console.WriteLine(sum);
Console.WriteLine(sum == 0.3);
Console.WriteLine(Math.Abs(sum - 0.3) < 1e-9);`,
      options: ['0.3\nTrue\nTrue', '0.30000000000000004\nFalse\nTrue', '0.3\nFalse\nTrue', '0.30000000000000004\nTrue\nFalse'],
      answer: 1,
      explain: `<p>Bilgisayar sayıları <b>ikilik tabanda</b> saklar. 1/3 onluk tabanda nasıl 0.3333… diye sonsuza gidiyorsa, 0.1 de ikilik tabanda sonsuza gider ve 8 bayta sığması için <b>kırpılır</b>. Bu küçük <t en="rounding error" ja="丸め誤差">yuvarlama hataları</t> toplanınca 0.30000000000000004 çıkar.</p>
<p><code>==</code> iki değerin <b>bit bit aynı</b> olup olmadığını sorar (True/False döner; ayrıntısı Ders 6'da) — bu yüzden <b>False</b>. Doğru yöntem: farkın mutlak değeri çok küçük bir <t en="tolerance" ja="許容誤差">tolerans</t>tan (burada 1e-9 = 0.000000001) küçük mü? <code>&lt;</code> "küçük mü?" demektir → <b>True</b>.</p>`,
    },
    {
      kind: 'warning',
      title: 'Sayısal tuzaklar',
      body: `
<ol>
<li><b>Tam sayı bölmesi:</b> <code>1 / 3 * 3</code> → 0! Ortalama, yüzde, birim dönüşümü hesaplarında işlenenlerden birini double yap: <code>(double)total / count</code> ya da <code>total / 1000.0</code>.</li>
<li><b>double'ları == ile karşılaştırma.</b> Her zaman tolerans kullan: <code>Math.Abs(a - b) &lt; 1e-9</code>.</li>
<li><b>Math.Round banker yuvarlaması yapar:</b> 2.5 → 2. Yarım yukarı istiyorsan <code>MidpointRounding.AwayFromZero</code>.</li>
<li><b>Sıfıra bölme:</b> int / 0 → <code>DivideByZeroException</code> (program çöker). double / 0 ise çökmez, "sonsuz" (∞) ya da <code>NaN</code> (Not a Number) üretir — ve bu değerler sessizce tüm hesaplarına yayılır.</li>
<li><b>Taşma (overflow):</b> int en fazla ~2.1 milyar tutar. Gerçek C#'ta sınırı aşan hesap, varsayılan ayarlarda hata vermeden <b>eksi bir sayıya</b> sarar. Büyük çarpımlarda <code>long</code> kullan.</li>
<li><b>Öncelik:</b> <code>a + b / 2</code> ortalama DEĞİLDİR. <code>(a + b) / 2.0</code> yaz.</li>
</ol>
<p>Aşağıdaki kod 24 köşeden kaç quad yüz yapılabileceğini (her quad 4 köşe) hesaplamalı ama çöküyor. Bul ve düzelt; çıktı <code>6</code> olmalı.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Neye bölüyoruz?',
      code: cs`int faceCount = 0;
int vertsPerFace = 4;
int vertexCount = 24;
faceCount = vertexCount / faceCount;
Console.WriteLine(faceCount);`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: 'faceCount henüz hesaplanmadı, başlangıç değeri 0.',
        4: 'Bölen 0! Tam sayılarda sıfıra bölme matematiksel olarak tanımsızdır, işlemci bunu yapamaz → DivideByZeroException.',
      },
      note: 'İpucu: Kaç quad? = köşe sayısı / (bir quad\'daki köşe sayısı). Hangi değişken bu bilgiyi tutuyor?',
    },
    {
      kind: 'cad',
      title: 'CAD\'de tolerans: "Aynı nokta" ne demek?',
      body: `
<p>Blender'da <b>Merge by Distance</b> kullandığında bir mesafe eşiği verirsin (varsayılanı 0.0001 m). Bu eşikten yakın vertex'ler "aynı nokta" sayılır. Neden? Çünkü hesaplanan koordinatlar kayan nokta hatası yüzünden asla tam aynı çıkmaz.</p>
<p>CAD/BIM çekirdekleri de bu fikirle çalışır: iki çizginin uç noktası birleşiyor mu, bir poligon kapalı mı, bir nokta bir duvarın üzerinde mi — hepsi bir <b>tolerans</b> (許容誤差, kyoyō gosa) ile kontrol edilir:</p>
<pre>const double Tolerance = 1e-6;   // birim mm ise: 1 nanometre
bool same = Math.Abs(x1 - x2) &lt; Tolerance;</pre>
<ul>
<li><b>Hatalar birikir:</b> 0.1'i on kez toplarsan 1.0 değil 0.9999999999999999 elde edersin. Binlerce dönüşümden geçen bir koordinatta bu kayma büyüyebilir; bu yüzden toleranslar bilinçli seçilir.</li>
<li><b>Birim tutarlılığı:</b> Tolerans, kullanılan birime göre anlamlıdır. Model mm ile tutuluyorsa 1e-6 mm, metreyle tutuluyorsa aynı sayı 1000 kat farklı bir mesafedir.</li>
<li><b>Yuvarlama kuralı:</b> Rapor ve metrajlarda (数量, sūryō) hangi yuvarlama kuralının kullanıldığı önemlidir. Math.Round'un varsayılanı her zaman beklenen kural olmayabilir — gereksinimi kontrol et ve kuralı kodda açıkça belirt.</li>
</ul>`,
    },
  ],
  exercise: {
    title: 'Poligon bütçesi hesaplayıcı',
    prompt: `
<p>Bir oyun asset'i için üç sayı oku (her biri ayrı satırda): <b>quad sayısı</b>, <b>ayrıca eklenen üçgen sayısı</b> ve <b>üçgen bütçesi</b>. Her quad 2 üçgen sayılır. Şunları yazdır:</p>
<pre class="expected">Toplam üçgen: 6850
Kalan bütçe: 3150
Kullanım: %68.5
LOD1 hedefi: 3425</pre>
<p>(Girdi: <code>3200</code>, <code>450</code>, <code>10000</code>)</p>
<ul>
<li>"Kullanım" yüzdesi tek ondalık basamakla (<code>:F1</code>) yazılsın — tam sayı bölmesi tuzağına dikkat!</li>
<li>"LOD1 hedefi" toplamın yarısıdır ve tam sayıdır (tam sayı bölmesi burada istenen davranış).</li>
<li>Farklı girdilerle de doğru çalışmalı: <code>4999</code>, <code>3</code>, <code>12000</code> → 10001, 1999, %83.3, 5000.</li>
</ul>`,
    stdin: '3200\n450\n10000',
    starter: cs`int quads = int.Parse(Console.ReadLine());
int extraTris = int.Parse(Console.ReadLine());
int budget = int.Parse(Console.ReadLine());

// hesapla ve dört satırı yazdır
`,
    checks: [
      { type: 'output', expect: 'Toplam üçgen: 6850\nKalan bütçe: 3150\nKullanım: %68.5\nLOD1 hedefi: 3425', msg: '3200 / 450 / 10000 girdisiyle dört satır birebir aynı olmalı' },
      { type: 'output', stdin: '4999\n3\n12000', expect: 'Toplam üçgen: 10001\nKalan bütçe: 1999\nKullanım: %83.3\nLOD1 hedefi: 5000', msg: 'Farklı girdiyle (4999 / 3 / 12000) de doğru çalışmalı' },
      { type: 'output', stdin: '10\n0\n30', expect: 'Toplam üçgen: 20\nKalan bütçe: 10\nKullanım: %66.7\nLOD1 hedefi: 10', msg: 'Küçük sayılarla da doğru çalışmalı (10 / 0 / 30)' },
      { type: 'code', pattern: ':F1', msg: 'Yüzdeyi {...:F1} biçimiyle tek basamak yazdırmalısın' },
    ],
    hints: [
      'Önce toplamı hesapla ve bir değişkene koy: quad\'lar 2 ile çarpılır, ekstra üçgenler eklenir. Kalan = bütçe − toplam.',
      'Yüzde = toplam / bütçe × 100. İkisi de int ise bölme 0 verir! Bölmeden <b>önce</b> işlenenlerden birini double yap.',
      'Yüzde için <code>$"Kullanım: %{yuzde:F1}"</code> kalıbını kullanabilirsin. LOD1 hedefi için int / 2 zaten tam sayı verir.',
    ],
    solution: cs`int quads = int.Parse(Console.ReadLine());
int extraTris = int.Parse(Console.ReadLine());
int budget = int.Parse(Console.ReadLine());

int totalTris = quads * 2 + extraTris;
int remaining = budget - totalTris;
double usage = (double)totalTris / budget * 100;
int lod1Target = totalTris / 2;

Console.WriteLine($"Toplam üçgen: {totalTris}");
Console.WriteLine($"Kalan bütçe: {remaining}");
Console.WriteLine($"Kullanım: %{usage:F1}");
Console.WriteLine($"LOD1 hedefi: {lod1Target}");`,
    explain: 'İşlem önceliği sayesinde <code>quads * 2 + extraTris</code> parantezsiz doğru çalıştı. Yüzdede (double) cast tam sayı bölmesini engelledi; LOD1 hedefinde ise tam sayı bölmesi tam istediğimiz şeydi. Aynı / operatörü, işlenenlerin tipine göre farklı davranır — bunu bilerek kullanmak profesyonelliğin işaretidir.',
  },
  quiz: [
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine(7 / 2);`,
      verifyOutput: true,
      options: [
        { t: '3', correct: true, why: 'Doğru. İki int bölününce sonuç int olur; kesirli kısım atılır (yuvarlanmaz).' },
        { t: '3.5', why: 'Bu, işlenenlerden biri double olsaydı (7 / 2.0) doğru olurdu.' },
        { t: '4', why: 'Tam sayı bölmesi yuvarlamaz, keser. 3.5 → 3.' },
        { t: '1', why: '1, kalan operatörünün (7 % 2) sonucudur, bölmenin değil.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine(10 - 2 * 3 + 8 / 4);`,
      verifyOutput: true,
      options: [
        { t: '6', correct: true, why: 'Doğru. Önce * ve /: 2 * 3 = 6, 8 / 4 = 2. Sonra soldan sağa: 10 - 6 + 2 = 6.' },
        { t: '26', why: 'Bu, soldan sağa öncelik gözetmeden hesaplamak olur: (10 - 2) * 3 + 2. Çarpma, çıkarmadan önce yapılır.' },
        { t: '2', why: '10 - (6 + 2) gibi hesaplamışsın. Aynı seviyedeki + ve - soldan sağa işlenir: (10 - 6) + 2.' },
        { t: '8', why: 'Bu, her şeyi soldan sağa yapıp sonda 4\'e bölmek olur. * ve / önce yapılır.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine(Math.Round(2.5));
Console.WriteLine(Math.Round(3.5));`,
      verifyOutput: true,
      options: [
        { t: '2\n4', correct: true, why: 'Doğru. Math.Round varsayılan olarak tam yarıyı en yakın ÇİFT sayıya yuvarlar (banker yuvarlaması).' },
        { t: '3\n4', why: 'Okuldaki "yarım yukarı" kuralı bu olurdu; C# için MidpointRounding.AwayFromZero gerekir.' },
        { t: '2\n3', why: 'Math.Round kesmez; 3.5 en yakın çift sayıya, yani 4\'e yuvarlanır.' },
        { t: '3\n3', why: 'İki değer farklı yönlere yuvarlanır: 2.5 → 2 (çift), 3.5 → 4 (çift).' },
      ],
    },
    {
      q: 'İki koordinatın (double) "aynı" olup olmadığını kontrol etmenin doğru yolu hangisi?',
      options: [
        { t: 'Math.Abs(a - b) &lt; 1e-9 gibi bir tolerans ile', correct: true, why: 'Doğru. Kayan nokta hesapları küçük hatalar içerir; fark, kabul edilebilir bir eşikten küçükse eşit sayılır.' },
        { t: 'a == b', why: '0.1 + 0.2 == 0.3 bile False döner. Bit düzeyinde eşitlik, hesaplanmış değerler için güvenilmez.' },
        { t: '(int)a == (int)b', why: 'Kesirli kısmı atmak 2.9 ile 2.1\'i "eşit" sayar ve gerçekten aynı olan 2.9999999 ile 3.0\'ı farklı sayar.' },
        { t: 'a - b == 0', why: 'Bu da a == b ile aynı sorunu taşır; fark tam sıfır olmayabilir.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`int x = 5;
x += 3;
x *= 2;
x--;
Console.WriteLine(x);`,
      verifyOutput: true,
      options: [
        { t: '15', correct: true, why: 'Doğru. 5 + 3 = 8, 8 × 2 = 16, 16 - 1 = 15.' },
        { t: '16', why: 'x-- de x\'i 1 azaltır; son satırdan önce x 15 olur.' },
        { t: '11', why: 'x *= 2, x = x * 2 demektir; çarpma 2 eklemez, 2 ile çarpar.' },
        { t: '12', why: 'Sıra önemli: önce 3 eklenir (8), sonra 2 ile çarpılır (16), sonra 1 azalır (15).' },
      ],
    },
    {
      q: 'UDIM tile 1027\'nin U (sütun) değeri hangi ifadeyle bulunur? (Her satırda 10 tile var, numaralar 1001\'den başlar.)',
      options: [
        { t: '(1027 - 1001) % 10 → 6', correct: true, why: 'Doğru. Sıfır tabanlı sıra 26; 10\'a bölümünden kalan satırdaki konumu verir: 6. (V = 26 / 10 = 2.)' },
        { t: '(1027 - 1001) / 10 → 2', why: 'Bu ifade V\'yi (kaçıncı satır) verir, U\'yu değil. Satırdaki konum için bölüm değil kalan gerekir.' },
        { t: '1027 % 10 → 7', why: '1001 çıkarılmadan hesaplanınca bir kayar; UDIM numaraları 1001\'den başlar (1001\'in U\'su 0\'dır).' },
        { t: '1027 / 1001 → 1', why: 'Bu sadece 1 verir (tam sayı bölmesi) ve tile konumu hakkında bilgi taşımaz.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Grid snapping',
    prompt: `
<p>Bir noktayı ızgaraya yapıştır (snap). Üç satır oku: <b>x</b> ve <b>y</b> (mm, ondalıklı olabilir) ve <b>ızgara aralığı</b> (mm). Her koordinatı en yakın ızgara çizgisine yuvarla; tam yarıda kalan değerler <b>sıfırdan uzağa</b> yuvarlansın. Sonra noktanın ne kadar kaydığını (Pisagor) ve yeni konumu metre cinsinden yazdır. Girdi <code>1234.6</code>, <code>-87.2</code>, <code>50</code> iken:</p>
<pre class="expected">Snap: (1250, -100)
Kayma: 20.025 mm
Metre: (1.25, -0.1)</pre>
<p>Tam yarı örneği: <code>75</code>, <code>25</code>, <code>50</code> → <code>Snap: (100, 50)</code>, <code>Kayma: 35.355 mm</code>, <code>Metre: (0.1, 0.05)</code>.</p>`,
    stdin: '1234.6\n-87.2\n50',
    starter: cs`double x = double.Parse(Console.ReadLine());
double y = double.Parse(Console.ReadLine());
double grid = double.Parse(Console.ReadLine());

// snap, kayma ve metre
`,
    checks: [
      { type: 'output', expect: 'Snap: (1250, -100)\nKayma: 20.025 mm\nMetre: (1.25, -0.1)', msg: '1234.6 / -87.2 / 50 girdisiyle üç satır birebir aynı olmalı' },
      { type: 'output', stdin: '75\n25\n50', expect: 'Snap: (100, 50)\nKayma: 35.355 mm\nMetre: (0.1, 0.05)', msg: 'Tam yarıdaki değerler sıfırdan uzağa yuvarlanmalı (75 → 100, 25 → 50)' },
      { type: 'output', stdin: '12\n-7\n5', expect: 'Snap: (10, -5)\nKayma: 2.828 mm\nMetre: (0.01, -0.005)', msg: 'Farklı ızgara aralığıyla da doğru çalışmalı' },
      { type: 'code', pattern: 'Math\\.Sqrt', msg: 'Kaymayı Math.Sqrt ile (Pisagor) hesaplamalısın' },
      { type: 'code', pattern: 'MidpointRounding\\.AwayFromZero', msg: 'Tam yarıları sıfırdan uzağa yuvarlamak için MidpointRounding.AwayFromZero kullanmalısın' },
    ],
    hints: [
      'Bir değeri ızgaraya yapıştırmak üç adımdır: ızgara aralığına böl (kaç aralık eder?), en yakın tam sayıya yuvarla, tekrar ızgara aralığıyla çarp.',
      'Varsayılan Math.Round tam yarıları çift sayıya yuvarlar (25 / 50 = 0.5 → 0). İkinci parametre olarak yuvarlama kuralını ver. Kayma = √(dx² + dy²), dx = orijinal − snap.',
      'mm → m için 1000.0\'a böl. Kayma satırında <code>{kayma:F3}</code>, Snap ve Metre satırlarında biçimsiz <code>{sx}</code> kullan.',
    ],
    solution: cs`double x = double.Parse(Console.ReadLine());
double y = double.Parse(Console.ReadLine());
double grid = double.Parse(Console.ReadLine());

double snapX = Math.Round(x / grid, MidpointRounding.AwayFromZero) * grid;
double snapY = Math.Round(y / grid, MidpointRounding.AwayFromZero) * grid;

double dx = x - snapX;
double dy = y - snapY;
double shift = Math.Sqrt(dx * dx + dy * dy);

Console.WriteLine($"Snap: ({snapX}, {snapY})");
Console.WriteLine($"Kayma: {shift:F3} mm");
Console.WriteLine($"Metre: ({snapX / 1000.0}, {snapY / 1000.0})");`,
    explain: 'Böl → yuvarla → çarp kalıbı, her CAD programındaki "grid snap" özelliğinin özüdür. Yuvarlama kuralını açıkça belirttiğin için tam yarıdaki değerler kullanıcının beklediği yöne gitti; Pisagor ile de snap\'in noktayı ne kadar oynattığını ölçtün.',
  },
  extras: [
    {
      difficulty: 1,
      title: 'Dikdörtgen yüzün alanı ve çevresi',
      prompt: `<p>Bir dikdörtgen yüzün genişliğini ve yüksekliğini (metre, ondalıklı) oku; alanı ve çevreyi yazdır. Girdi <code>2.5</code> ve <code>4</code> iken:</p><pre class="expected">Alan: 10 m²
Çevre: 13 m</pre>`,
      stdin: '2.5\n4',
      starter: cs`double width = double.Parse(Console.ReadLine());
double height = double.Parse(Console.ReadLine());
`,
      checks: [
        { type: 'output', expect: 'Alan: 10 m²\nÇevre: 13 m' },
        { type: 'output', stdin: '1.2\n0.5', expect: 'Alan: 0.6 m²\nÇevre: 3.4 m', msg: 'Farklı ölçülerle de doğru çalışmalı' },
      ],
      hints: ['Alan = genişlik × yükseklik.', 'Çevre = 2 × (genişlik + yükseklik). Parantezi unutursan sadece genişlik ikiyle çarpılır!'],
      solution: cs`double width = double.Parse(Console.ReadLine());
double height = double.Parse(Console.ReadLine());
Console.WriteLine($"Alan: {width * height} m²");
Console.WriteLine($"Çevre: {2 * (width + height)} m");`,
    },
    {
      difficulty: 2,
      title: 'Kare numarasından zaman kodu',
      prompt: `<p>24 fps bir animasyonda kare numarasını oku ve <code>dakika:saniye:kare</code> biçiminde, her alan iki haneli (<code>:D2</code>) olacak şekilde yazdır. Girdi <code>3725</code> iken:</p><pre class="expected">02:35:05</pre>`,
      stdin: '3725',
      starter: cs`int frame = int.Parse(Console.ReadLine());
const int Fps = 24;
`,
      checks: [
        { type: 'output', expect: '02:35:05' },
        { type: 'output', stdin: '100', expect: '00:04:04', msg: '100. kare 00:04:04 olmalı' },
        { type: 'output', stdin: '86399', expect: '59:59:23', msg: 'Büyük kare numarasıyla da doğru çalışmalı' },
        { type: 'code', pattern: '%', msg: 'Kalan operatörü (%) kullanmalısın' },
      ],
      hints: ['Önce toplam saniye = kare / Fps, artan kare = kare % Fps.', 'Toplam saniyeyi de aynı kalıpla dakika ve saniyeye ayır (60\'a bölüm ve kalan). Biçim: <code>$"{dk:D2}:{sn:D2}:{kr:D2}"</code>.'],
      solution: cs`int frame = int.Parse(Console.ReadLine());
const int Fps = 24;
int totalSeconds = frame / Fps;
int restFrames = frame % Fps;
int minutes = totalSeconds / 60;
int seconds = totalSeconds % 60;
Console.WriteLine($"{minutes:D2}:{seconds:D2}:{restFrames:D2}");`,
    },
    {
      difficulty: 3,
      title: 'Bounding box köşegeni',
      prompt: `<p>Bir objenin bounding box ölçülerini (genişlik, derinlik, yükseklik — metre) oku. 3B Pisagor ile köşegen uzunluğunu hesapla: √(g² + d² + y²). Metre cinsinden 3 basamakla ve milimetre cinsinden <b>en yakın tam sayıya yuvarlanmış</b> olarak yazdır. Girdi <code>3</code>, <code>4</code>, <code>12</code> iken:</p><pre class="expected">Köşegen: 13.000 m
Köşegen: 13000 mm</pre>`,
      stdin: '3\n4\n12',
      starter: cs`double w = double.Parse(Console.ReadLine());
double d = double.Parse(Console.ReadLine());
double h = double.Parse(Console.ReadLine());
`,
      checks: [
        { type: 'output', expect: 'Köşegen: 13.000 m\nKöşegen: 13000 mm' },
        { type: 'output', stdin: '1.2\n0.8\n2.4', expect: 'Köşegen: 2.800 m\nKöşegen: 2800 mm', msg: 'Ondalıklı ölçülerle de doğru çalışmalı' },
        { type: 'output', stdin: '2\n3\n0', expect: 'Köşegen: 3.606 m\nKöşegen: 3606 mm', msg: 'Milimetre en yakın tam sayıya yuvarlanmalı (3605.55 → 3606); (int) cast keser, yuvarlamaz' },
        { type: 'code', pattern: 'Math\\.Sqrt', msg: 'Math.Sqrt kullanmalısın' },
        { type: 'code', pattern: 'Math\\.Round', msg: 'Milimetre için Math.Round kullanmalısın' },
      ],
      hints: ['Köşegen = <code>Math.Sqrt(w * w + d * d + h * h)</code>.', 'mm için önce 1000 ile çarp, sonra Math.Round ile yuvarla. Yuvarlanmış double\'ı yazdırdığında ondalık kısım görünmez.'],
      solution: cs`double w = double.Parse(Console.ReadLine());
double d = double.Parse(Console.ReadLine());
double h = double.Parse(Console.ReadLine());
double diagonal = Math.Sqrt(w * w + d * d + h * h);
Console.WriteLine($"Köşegen: {diagonal:F3} m");
Console.WriteLine($"Köşegen: {Math.Round(diagonal * 1000)} mm");`,
    },
  ],
  vocab: [
    { en: 'Operator', tr: 'Operatör', ja: '演算子', kana: 'えんざんし', romaji: 'enzanshi' },
    { en: 'Expression', tr: 'İfade', ja: '式', kana: 'しき', romaji: 'shiki' },
    { en: 'Operator precedence', tr: 'İşlem önceliği', ja: '演算子の優先順位', kana: 'えんざんしのゆうせんじゅんい', romaji: 'enzanshi no yūsen jun\'i' },
    { en: 'Integer division', tr: 'Tam sayı bölmesi', ja: '整数除算', kana: 'せいすうじょざん', romaji: 'seisū jozan' },
    { en: 'Remainder (modulo)', tr: 'Kalan (mod)', ja: '剰余', kana: 'じょうよ', romaji: 'jōyo' },
    { en: 'Rounding', tr: 'Yuvarlama', ja: '丸め', kana: 'まるめ', romaji: 'marume' },
    { en: 'Round half up', tr: 'Yarım yukarı yuvarlama', ja: '四捨五入', kana: 'ししゃごにゅう', romaji: 'shishagonyū' },
    { en: 'Rounding error', tr: 'Yuvarlama hatası', ja: '丸め誤差', kana: 'まるめごさ', romaji: 'marume gosa' },
    { en: 'Tolerance', tr: 'Tolerans', ja: '許容誤差', kana: 'きょようごさ', romaji: 'kyoyō gosa' },
    { en: 'Square root', tr: 'Karekök', ja: '平方根', kana: 'へいほうこん', romaji: 'heihōkon' },
    { en: 'Absolute value', tr: 'Mutlak değer', ja: '絶対値', kana: 'ぜったいち', romaji: 'zettaichi' },
    { en: 'Area', tr: 'Alan', ja: '面積', kana: 'めんせき', romaji: 'menseki' },
  ],
  summary: [
    '* / % önce, + - sonra; aynı seviyede soldan sağa. Parantez her şeyden önce gelir ve kodu okunur kılar.',
    'int / int tam sayı bölmesidir (7 / 2 = 3); kesirli sonuç için işlenenlerden birini double yap: 7 / 2.0 ya da (double)a / b.',
    '% kalanı verir: tek/çift testi, zaman kodu, açı sarma, UDIM ve ızgara konumu hesaplarında kullanılır.',
    'x += 5, x *= 2, x++ gibi kısa yollar x = x + 5 vb. ile aynıdır; ++/--\'yi kendi satırında kullanmak en okunur yoldur.',
    'Math.Round varsayılan olarak banker yuvarlaması yapar (2.5 → 2); yarım yukarı için MidpointRounding.AwayFromZero.',
    'Kayan nokta hesapları küçük hatalar içerir (0.1 + 0.2 ≠ 0.3): double\'ları asla == ile değil, Math.Abs(a - b) &lt; tolerans ile karşılaştır.',
  ],
};
