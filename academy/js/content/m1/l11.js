import { cs } from '../helpers.js';

export default {
  id: 'm1-l11',
  module: 'm1',
  title: 'Diziler ve listeler',
  titleEn: 'Arrays & lists',
  titleJa: '配列とリスト',
  minutes: 70,
  level: 2,
  objectives: [
    'Dizi tanımlamak, sıfırdan başlayan indeksle okumak/yazmak ve Length kullanmak',
    'Dizileri for ve foreach ile dolaşmak; toplam, ortalama, en büyük/en küçük ve arama algoritmalarını yazmak',
    'List<T> ile Add, Insert, Remove, RemoveAt, Contains, Count ve indeksleyiciyi kullanmak',
    'Dizinin bellekte nasıl durduğunu açıklayıp dizi ile liste arasında doğru seçimi yapmak',
    'IndexOutOfRangeException hatasının nedenini bulup düzeltmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Dizi: Tek isim altında sıralı kutular',
      body: `
<p>Sahnede 4 obje olsun ve her birinin poligon sayısını saklamak isteyelim. <code>int tris1, tris2, tris3, tris4;</code> yazmak 4 obje için olur, 4000 obje için olmaz.</p>
<p><b><t en="Array" ja="配列">Dizi</t></b>, <b>aynı türden</b> değerleri tek bir isim altında, <b>sıralı</b> olarak tutan yapıdır:</p>
<pre><code>int[] polyCounts = new int[4];   // 4 kutuluk bir int dizisi</code></pre>
<ul>
<li><code>int[]</code> → "int dizisi" türü. Köşeli parantez "birden çok" demektir.</li>
<li>Her kutuya bir <b><t en="index" ja="インデックス">indeks</t></b> (sıra numarası) ile ulaşılır: <code>polyCounts[0]</code>, <code>polyCounts[1]</code>…</li>
<li>İndeks <b>0'dan başlar</b>. 4 elemanlı dizinin son indeksi <b>3</b>'tür.</li>
<li>Boyut <b>sabittir</b>: dizi bir kez 4 kutuyla oluşturulduysa 5. kutu eklenemez. Boyutu <code>polyCounts.Length</code> söyler.</li>
</ul>
<div class="callout tip">Neden 0? İndeks aslında "baştan kaç kutu ötede?" sorusunun cevabıdır. İlk eleman başlangıçtan 0 kutu ötededir. Birazdan bellek resminde bunu göreceğiz.</div>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Mesh\'in vertex listesi ve Outliner',
      body: `
<p>Blender'da <b>Spreadsheet</b> editörünü (Geometry Nodes çalışma alanında) açıp bir küpe bakarsan, vertex'lerin <b>0'dan 7'ye</b> numaralandığını görürsün. Her satır bir vertex, her satırda bir konum. Bu, bir dizinin ta kendisidir.</p>
<table class="compare">
<tr><th>3D dünyası</th><th>C#</th></tr>
<tr><td>Küpün 8 vertex'i, indeks 0–7</td><td><code>new double[8]</code> gibi sabit boyutlu bir <b>dizi</b></td></tr>
<tr><td>"Vertex 5'i seç"</td><td><code>verts[5]</code> — indeksle erişim</td></tr>
<tr><td>Mesh'teki vertex sayısı</td><td><code>verts.Length</code></td></tr>
<tr><td>Outliner'da seçili objeler: sayısı sürekli değişir</td><td><code>List&lt;string&gt;</code> — büyüyüp küçülebilen <b>liste</b></td></tr>
<tr><td>Ctrl+tıkla seçime ekle / çıkar</td><td><code>selected.Add(...)</code> / <code>selected.Remove(...)</code></td></tr>
</table>
<p>Kural basit: <b>eleman sayısı baştan belli ve sabitse dizi</b>, <b>çalışırken değişiyorsa liste</b>.</p>`,
    },
    {
      kind: 'code',
      title: 'Dizi oluşturmak, okumak ve yazmak',
      code: cs`int[] polyCounts = new int[4];
Console.WriteLine(polyCounts[0]);
polyCounts[0] = 1200;
polyCounts[3] = 450;
Console.WriteLine(polyCounts[0] + " " + polyCounts[3]);
Console.WriteLine("Eleman sayısı: " + polyCounts.Length);

string[] objects = { "Cube", "Sphere", "Cone" };
Console.WriteLine(objects[0]);
Console.WriteLine(objects[objects.Length - 1]);
objects[1] = "Torus";
Console.WriteLine(string.Join(", ", objects));
Console.WriteLine(objects);`,
      explain: {
        1: '<code>new int[4]</code>: bellekte yan yana 4 tane <code>int</code> kutusu ayrılır. Hepsi otomatik olarak <b><t en="default value" ja="既定値">varsayılan değerle</t></b> doldurulur: sayılar için <code>0</code>, <code>bool</code> için <code>false</code>, <code>string</code> için <code>null</code> (boş başvuru).',
        2: 'Hiç değer atamadık ama 0 yazar — varsayılan değer.',
        3: 'İndeks 0 (ilk kutu) artık 1200.',
        4: 'İndeks 3 = <b>son</b> kutu (4 kutu: 0, 1, 2, 3).',
        6: '<code>Length</code> dizinin kaç kutu olduğunu verir: 4. Dolu/boş fark etmez.',
        8: '<b>Başlatıcı</b> (initializer) yazımı: değerleri baştan veriyorsan boyutu yazmana gerek yok; derleyici sayar (3).',
        10: 'Son elemanın indeksi her zaman <code>Length - 1</code>\'dir. Bu kalıbı ezberle.',
        11: 'Bir elemanı değiştirmek = o kutuya yeni değer yazmak. Dizinin boyutu değişmez.',
        12: '<code>string.Join(ayraç, dizi)</code>: elemanları aralarına ayraç koyarak tek metinde birleştirir. Diziyi ekrana basmanın en pratik yolu.',
        13: 'Diziyi doğrudan yazdırırsan içeriği değil <b>türünün adını</b> görürsün: <code>System.String[]</code>. Bu yüzden Join kullanırız.',
      },
      runnable: true,
      stepper: true,
      note: 'Adım adım ilerlerken değişkenler panelinde dizinin kutularının tek tek dolduğunu izle.',
    },
    {
      kind: 'code',
      title: 'Diziyi dolaşmak: for ve foreach',
      code: cs`double[] vertexX = { 0.0, 1.5, -2.0, 3.25 };

for (int i = 0; i < vertexX.Length; i++)
{
    Console.WriteLine("v" + i + ".x = " + vertexX[i]);
}

double sum = 0;
foreach (double x in vertexX)
{
    sum += x;
}
Console.WriteLine("Ortalama x: " + sum / vertexX.Length);`,
      explain: {
        1: 'Dört vertex\'in x koordinatları.',
        3: 'Klasik dolaşma kalıbı: <code>i</code> 0\'dan başlar, <code>i &lt; Length</code> olduğu sürece devam eder. <code>&lt;=</code> değil <code>&lt;</code>: son geçerli indeks <code>Length - 1</code>.',
        5: '<code>for</code> kullanınca hem indeksi (<code>i</code>) hem değeri (<code>vertexX[i]</code>) bilirsin. İndekse ihtiyacın varsa ya da elemanları <b>değiştireceksen</b> for kullan.',
        9: '<code>foreach</code>: "dizideki her eleman için". Her turda <code>x</code> sıradaki elemanın <b>kopyasını</b> alır. İndeks yok, taşma riski yok — sadece okuyacaksan en temiz yol.',
        11: 'Toplam biriktirme (<t en="accumulator" ja="累積">akümülatör</t>) kalıbı: döngüden önce 0, döngüde ekle.',
        13: 'Toplam / adet = ortalama. Blender\'daki <b>Median Point</b> pivotu da seçili vertex konumlarının ortalamasıdır: 2.75 / 4 = 0.6875.',
      },
      runnable: true,
      stepper: true,
      note: 'foreach içinde x\'e yeni değer atayamazsın (derleme hatası). Dizideki değeri değiştirmek için for + indeks gerekir.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: İndeksler ve Length',
      code: cs`int[] edges = { 4, 8, 12 };
edges[1] = edges[0] + edges[2];
int last = edges[edges.Length - 1];
Console.WriteLine(edges[1] + " " + last + " " + edges.Length);`,
      options: ['16 12 3', '12 12 3', '16 12 2', '16 8 3'],
      answer: 0,
      explain: '<code>edges[0]</code> = 4, <code>edges[2]</code> = 12 → <code>edges[1]</code> = 16 olur. <code>Length</code> 3 olduğu için son indeks 3 - 1 = 2 → 12. Elemanı değiştirmek boyutu değiştirmez: Length hâlâ 3.',
    },
    {
      kind: 'code',
      title: 'List<T>: Büyüyüp küçülebilen liste',
      code: cs`List<string> selected = new List<string>();
selected.Add("Cube");
selected.Add("Light");
selected.Add("Camera");
Console.WriteLine("Seçili: " + selected.Count);

selected.Insert(0, "Plane");
selected.Remove("Light");
Console.WriteLine(string.Join(", ", selected));

Console.WriteLine(selected[1]);
selected[1] = "Cube.001";
selected.RemoveAt(selected.Count - 1);
Console.WriteLine(selected.Contains("Camera"));
Console.WriteLine(string.Join(", ", selected) + " (" + selected.Count + ")");`,
      explain: {
        1: '<code>List&lt;string&gt;</code>: "string\'lerden oluşan liste". Köşeli <code>&lt;T&gt;</code> içine eleman türü yazılır (<t en="generic" ja="ジェネリック">generic</t>). Başta boştur: Count = 0.',
        2: '<code>Add</code>: listenin <b>sonuna</b> ekler. Boyut kendiliğinden büyür — dizide bu mümkün değildi.',
        5: 'Listede eleman sayısı <code>Count</code> ile alınır (dizide <code>Length</code>). Burada 3.',
        7: '<code>Insert(indeks, değer)</code>: araya ekler; sonraki elemanlar bir sağa kayar. Plane, Cube, Light, Camera.',
        8: '<code>Remove(değer)</code>: o değere eşit <b>ilk</b> elemanı bulup siler; arkadakiler sola kayar. (Bulamazsa hata vermez, <code>false</code> döndürür.)',
        9: 'Sonuç: Plane, Cube, Camera.',
        11: 'Liste de dizi gibi <code>[indeks]</code> ile okunur, yine 0\'dan başlar → Cube.',
        12: 'İndeksle yazmak da serbest: 1. eleman artık "Cube.001".',
        13: '<code>RemoveAt(indeks)</code>: o <b>konumdaki</b> elemanı siler. <code>Count - 1</code> = son eleman (Camera).',
        14: '<code>Contains</code>: listede var mı? Camera silindiği için <code>False</code>.',
        15: 'Kalan: Plane, Cube.001 — Count 2.',
      },
      runnable: true,
      stepper: true,
      note: 'Remove ve RemoveAt\'i karıştırma: Remove("Cube") değere göre, RemoveAt(0) konuma göre siler. List<int> kullanırken bu fark çok önemlidir: Remove(2) "2 değerini sil", RemoveAt(2) "2. indeksi sil" demektir.',
    },
    {
      kind: 'visual',
      title: 'Bellekte dizi ve liste: Yan yana kutular',
      svg: `
<svg viewBox="0 0 760 330" role="img" aria-label="Dizinin bellekte bitişik kutular olarak durması ve listenin büyürken yeni diziye kopyalanması">
  <defs><marker id="ar-l11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <text x="380" y="22" class="t1">int[] polys = { 1200, 800, 4500, 300, 2600 };</text>
    <text x="155" y="50" class="t3">[0]</text><text x="255" y="50" class="t3">[1]</text><text x="355" y="50" class="t3">[2]</text><text x="455" y="50" class="t3">[3]</text><text x="555" y="50" class="t3">[4]</text>
    <rect x="105" y="58" width="100" height="44" class="box hi"/><text x="155" y="86" class="t1">1200</text>
    <rect x="205" y="58" width="100" height="44" class="box"/><text x="255" y="86" class="t1">800</text>
    <rect x="305" y="58" width="100" height="44" class="box"/><text x="355" y="86" class="t1">4500</text>
    <rect x="405" y="58" width="100" height="44" class="box"/><text x="455" y="86" class="t1">300</text>
    <rect x="505" y="58" width="100" height="44" class="box"/><text x="555" y="86" class="t1">2600</text>
    <text x="155" y="120" class="t3">adres 1000</text><text x="255" y="120" class="t3">1004</text><text x="355" y="120" class="t3">1008</text><text x="455" y="120" class="t3">1012</text><text x="555" y="120" class="t3">1016</text>
    <text x="680" y="76" class="t2">her int</text><text x="680" y="94" class="t2">4 bayt</text>
    <text x="380" y="148" class="t2">polys[3] adresi = başlangıç + 3 × 4 = 1012 → tek hesapla, anında erişim</text>
    <line x1="20" y1="170" x2="740" y2="170" class="ln"/>
    <text x="380" y="196" class="t1">List&lt;string&gt; selected — içinde gizli bir dizi var</text>
    <rect x="40" y="215" width="80" height="40" class="box hi"/><text x="80" y="240" class="t2">Cube</text>
    <rect x="120" y="215" width="80" height="40" class="box hi"/><text x="160" y="240" class="t2">Light</text>
    <rect x="200" y="215" width="80" height="40" class="box hi"/><text x="240" y="240" class="t2">Camera</text>
    <rect x="280" y="215" width="80" height="40" class="box dim"/><text x="320" y="240" class="t3">boş</text>
    <text x="200" y="275" class="t3">Count = 3 (dolu) · Capacity = 4 (ayrılmış)</text>
    <line x1="365" y1="235" x2="413" y2="235" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l11)"/>
    <text x="390" y="225" class="t3">dolunca</text>
    <rect x="415" y="215" width="40" height="40" class="box hi"/>
    <rect x="455" y="215" width="40" height="40" class="box hi"/>
    <rect x="495" y="215" width="40" height="40" class="box hi"/>
    <rect x="535" y="215" width="40" height="40" class="box hi"/>
    <rect x="575" y="215" width="40" height="40" class="box acc"/>
    <rect x="615" y="215" width="40" height="40" class="box dim"/>
    <rect x="655" y="215" width="40" height="40" class="box dim"/>
    <rect x="695" y="215" width="40" height="40" class="box dim"/>
    <text x="575" y="275" class="t3">2 kat büyük yeni dizi ayrılır, eskiler kopyalanır, yeni eleman eklenir</text>
    <text x="380" y="310" class="t2">Liste = otomatik büyüyen dizi. Kopyalama arada bir olur, kullanırken fark etmezsin.</text>
  </g>
</svg>`,
      caption: `
<p><b>Dizi:</b> Elemanlar bellekte <b>bitişik</b> (yan yana) durur. Bilgisayar <code>polys[3]</code>'ü bulmak için baştan saymaz; "başlangıç adresi + 3 × eleman boyutu" hesabıyla doğrudan oraya atlar. İndeksin 0'dan başlamasının sebebi de bu formül: ilk eleman başlangıçtan <b>0</b> kutu ötededir. (Adresler temsilîdir.)</p>
<p><b>Liste:</b> <code>List&lt;T&gt;</code> içeride yine bir dizi kullanır. Dolunca daha büyük bir dizi ayırıp elemanları kopyalar. Bu yüzden boyutu değişebilir.</p>
<table class="compare">
<tr><th></th><th>Dizi <code>T[]</code></th><th>Liste <code>List&lt;T&gt;</code></th></tr>
<tr><td>Boyut</td><td>Sabit (<code>Length</code>)</td><td>Değişken (<code>Count</code>)</td></tr>
<tr><td>Ne zaman?</td><td>Sayı baştan belli: bir mesh'in vertex'leri, 12 ay, RGB kanalları</td><td>Sayı çalışırken değişir: seçili objeler, kullanıcının çizdiği noktalar</td></tr>
<tr><td>Ekleme/silme</td><td>Yok</td><td><code>Add</code>, <code>Insert</code>, <code>Remove</code>, <code>RemoveAt</code></td></tr>
</table>
<p class="muted">Bir not: Diziyi bir fonksiyona argüman olarak verdiğinde kopyalanan, kutuların kendisi değil dizinin <b>adresidir</b>. Yani fonksiyon <code>dizi[0] = 5;</code> yaparsa çağıran da bunu görür (10. dersteki int'ten farklı!). Bunun nedenini Modül 2'de "referans türleri" konusunda öğreneceksin.</p>`,
    },
    {
      kind: 'code',
      title: 'Klasik dizi algoritmaları: toplam, ortalama, en büyük, en küçük, arama',
      code: cs`string[] names = { "Rock", "Tree", "House", "Car", "Lamp" };
int[] tris = { 1200, 5400, 9800, 3100, 450 };

int total = 0;
int maxIndex = 0;
int minIndex = 0;
for (int i = 0; i < tris.Length; i++)
{
    total += tris[i];
    if (tris[i] > tris[maxIndex]) maxIndex = i;
    if (tris[i] < tris[minIndex]) minIndex = i;
}
double average = (double)total / tris.Length;
Console.WriteLine("Toplam: " + total);
Console.WriteLine($"Ortalama: {average:F1}");
Console.WriteLine("En ağır: " + names[maxIndex] + " (" + tris[maxIndex] + ")");
Console.WriteLine("En hafif: " + names[minIndex] + " (" + tris[minIndex] + ")");

string target = "Car";
int found = -1;
for (int i = 0; i < names.Length; i++)
{
    if (names[i] == target)
    {
        found = i;
        break;
    }
}
Console.WriteLine(target + " indeksi: " + found);`,
      explain: {
        1: '<b><t en="parallel arrays" ja="並列配列">Paralel diziler</t></b>: <code>names[i]</code> ile <code>tris[i]</code> aynı objeyi anlatır. (Modül 2\'de bunları tek bir sınıfta birleştireceğiz.)',
        5: 'En büyüğün <b>değerini değil indeksini</b> tutuyoruz; böylece hem sayıyı hem ismi bulabiliriz. Başlangıç: "şimdilik en büyük ilk eleman".',
        7: 'Tek bir döngüde üç iş birden: toplam, maksimum, minimum. Dizi bir kez taranır.',
        10: 'Şu anki eleman, şimdiye kadarki en büyükten büyükse, yeni şampiyon o. Neden <code>int max = 0</code> ile başlamıyoruz? Çünkü tüm değerler negatif olsaydı yanlış sonuç verirdi; ilk elemandan başlamak her zaman güvenli.',
        13: '<code>(double)</code> dönüşümü olmazsa tam sayı bölmesi yapılır ve ondalık kaybolur (5. ders).',
        15: '<code>:F1</code> → 1 ondalık basamak: 3990.0',
        19: '<b><t en="linear search" ja="線形探索">Doğrusal arama</t></b>: hedefi bulana kadar baştan sona bak.',
        20: '<code>-1</code> = "bulunamadı" anlamına gelen geleneksel değer (geçerli bir indeks olamaz).',
        25: 'Bulunca <code>break</code> ile döngüden çık: geri kalan elemanlara bakmak boşuna iş.',
        29: 'Car indeksi: 3. Hedefi "Chair" yapıp tekrar çalıştır: -1 göreceksin.',
      },
      runnable: true,
      stepper: true,
      note: 'Bu dört kalıp (biriktirme, en büyük/en küçük, sayma, arama) programlamanın "temel fırça darbeleri"dir. Modül 3\'te LINQ ile tek satırda yazmayı da öğreneceksin, ama önce elle yazabilmek gerekir.',
    },
    {
      kind: 'warning',
      title: 'En sık hata: Dizinin dışına taşmak',
      body: `
<p>Geçersiz bir indeksle erişirsen program <b>çalışırken</b> çöker:</p>
<pre><code>Unhandled exception. System.IndexOutOfRangeException: Index was outside the bounds of the array.</code></pre>
<p>Bu bir <t en="exception" ja="例外">exception</t>'dır (istisna): derleyici yakalayamaz, çünkü indeksin kaç olacağı çoğu zaman ancak çalışırken belli olur. Sık görülen sebepler:</p>
<ol>
<li><b>Bir fazla dönmek</b> (<t en="off-by-one error" ja="オフバイワンエラー">off-by-one</t>): <code>i &lt;= dizi.Length</code>. Son geçerli indeks <code>Length - 1</code>!</li>
<li><b>1'den saymak:</b> "Birinci eleman" <code>dizi[0]</code>'dır, <code>dizi[1]</code> değil. Roblox Studio'dan Lua alışkanlığın varsa dikkat: Lua tabloları geleneksel olarak 1'den başlar, C# dizileri 0'dan.</li>
<li><b>Boş liste:</b> <code>list[0]</code> — liste boşsa 0. indeks yoktur (List'te hata adı <code>ArgumentOutOfRangeException</code>).</li>
<li><b>foreach içinde listeye ekleme/silme</b> yapmak da çalışma zamanı hatası verir; böyle durumda for kullan ya da yeni bir liste oluştur.</li>
</ol>
<p>Aşağıdaki kod LOD seviyelerini yazdırmak istiyor. Çalıştır, hatayı oku, <b>düzelt</b>.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: LOD listesi',
      code: cs`int[] lodTris = { 12000, 4000, 900 };

for (int i = 0; i <= lodTris.Length; i++)
{
    Console.WriteLine("LOD" + i + ": " + lodTris[i]);
}`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: '3 eleman: geçerli indeksler 0, 1, 2.',
        3: 'Koşulu dikkatle oku: <code>i</code> hangi değere kadar çıkıyor? <code>i = 3</code> olduğunda ne olur?',
        5: 'Üç satır başarıyla yazılır, dördüncü turda <code>lodTris[3]</code> istenir ve program çöker.',
      },
      note: 'Hata mesajı satır numarası verir. Düzeltince 3 satır yazılmalı ve program hatasız bitmeli.',
    },
    {
      kind: 'cad',
      title: 'Diziler 3D ve CAD verisinin iskeletidir',
      body: `
<p>Bir mesh, GPU'ya giderken temelde iki diziye dönüşür:</p>
<ul>
<li><b><t en="vertex buffer" ja="頂点バッファ">Vertex buffer</t></b>: konumlar (ve normal, UV…) dizisi.</li>
<li><b><t en="index buffer" ja="インデックスバッファ">Index buffer</t></b>: her üçgenin hangi vertex'lerden oluştuğunu söyleyen <code>int</code> dizisi. Her 3 sayı bir üçgen: <code>{ 0, 1, 2,  2, 3, 0 }</code> = iki üçgenli bir quad.</li>
</ul>
<p>UV deneyimin burada işe yarar: GPU'da bir vertex'in tek bir UV'si olabilir. UV dikişindeki (seam) bir vertex'in iki farklı UV'si varsa vertex buffer'da <b>iki kez</b> yer alır. Bu yüzden oyun motorundaki vertex sayısı Blender'dakinden fazla görünebilir — sert kenarlı, UV'li bir küp genellikle 8 değil 24 vertex'tir.</p>
<p>CAD tarafında: bir polyline'ın noktaları kullanıcı çizdikçe arttığı için <b>liste</b>; bir ızgaranın (grid) yükseklik değerleri ise satır-sütun yapısında <b><t en="2D array" ja="二次元配列">iki boyutlu dizi</t></b> olarak tutulabilir:</p>
<pre><code>double[,] heights = new double[3, 4];   // 3 satır, 4 sütun
heights[2, 3] = 1.5;                    // [satır, sütun]
int rows = heights.GetLength(0);        // 3</code></pre>
<p class="muted">İki boyutlu dizileri ve daha gelişmiş koleksiyonları (Dictionary vb.) ilerleyen modüllerde kullanacağız. Şimdilik "satır ve sütunlu dizi" olarak tanıman yeterli.</p>`,
    },
  ],
  exercise: {
    title: 'Sahne istatistikleri',
    prompt: `
<p>Paralel dizilerde sahnedeki objelerin adları ve üçgen sayıları var. Üç fonksiyon yaz:</p>
<ol>
<li><code>int Total(int[] values)</code> — tüm elemanların toplamını döndürür (boş dizi → 0).</li>
<li><code>int IndexOfMax(int[] values)</code> — en büyük elemanın <b>indeksini</b> döndürür. (Tüm değerler negatif olsa da doğru çalışmalı.)</li>
<li><code>int CountAbove(int[] values, int limit)</code> — <code>limit</code>'ten <b>büyük</b> kaç eleman olduğunu döndürür.</li>
</ol>
<p>Sonra bu fonksiyonları kullanarak şu raporu yazdır (bütçe 5000):</p>
<pre class="expected">Obje sayısı: 4
Toplam: 19500
Ortalama: 4875.0
En ağır: House (9800)
Bütçeyi aşan: 2</pre>`,
    starter: cs`string[] names = { "Rock", "Tree", "House", "Car" };
int[] tris = { 1200, 5400, 9800, 3100 };

int Total(int[] values)
{
    // toplamı biriktir
    return 0;
}

int IndexOfMax(int[] values)
{
    // en büyüğün indeksini bul
    return 0;
}

int CountAbove(int[] values, int limit)
{
    // limit'ten büyük olanları say
    return 0;
}

Console.WriteLine("Obje sayısı: " + tris.Length);
// raporun kalanını yazdır
`,
    checks: [
      { type: 'output', expect: 'Obje sayısı: 4\nToplam: 19500\nOrtalama: 4875.0\nEn ağır: House (9800)\nBütçeyi aşan: 2', msg: 'Rapor birebir aynı olmalı' },
      { type: 'harness', append: cs`Console.WriteLine(Total(new int[] { 1, 2, 3 }));
Console.WriteLine(Total(new int[0]));`, expect: '6\n0', msg: 'Total her dizi için doğru toplamı döndürmeli (boş dizi → 0)' },
      { type: 'harness', append: cs`Console.WriteLine(IndexOfMax(new int[] { 5, 9, 2 }));
Console.WriteLine(IndexOfMax(new int[] { 7, 3, 1 }));
Console.WriteLine(IndexOfMax(new int[] { -5, -2, -9 }));`, expect: '1\n0\n1', msg: 'IndexOfMax indeksi döndürmeli (değeri değil) ve tüm değerler negatifken de doğru çalışmalı' },
      { type: 'harness', append: cs`Console.WriteLine(CountAbove(new int[] { 10, 20, 30, 40 }, 20));
Console.WriteLine(CountAbove(new int[] { 1, 2 }, 100));`, expect: '2\n0', msg: 'CountAbove sadece limitten BÜYÜK elemanları saymalı' },
      { type: 'code', pattern: 'IndexOfMax\\s*\\(\\s*tris\\s*\\)', msg: 'En ağır objeyi kendi IndexOfMax(tris) fonksiyonunla bul' },
      { type: 'code', pattern: 'Total\\s*\\(\\s*tris\\s*\\)[\\s\\S]*CountAbove\\s*\\(\\s*tris|CountAbove\\s*\\(\\s*tris[\\s\\S]*Total\\s*\\(\\s*tris\\s*\\)', msg: 'Raporu Total(tris) ve CountAbove(tris, 5000) çağrılarıyla hesapla' },
      { type: 'notCode', pattern: '\\.(Sum|Max|Count|Average)\\s*\\(', msg: 'Bu alıştırmada LINQ (Sum, Max, Average...) kullanma; döngüyle kendin yaz' },
    ],
    hints: [
      'Üç fonksiyonun hepsi aynı iskeleti kullanır: bir değişken hazırla, <code>values</code> dizisini dolaş, döngü bitince değişkeni döndür.',
      '<code>IndexOfMax</code> için <code>int best = 0;</code> ile başla ve <code>for</code> içinde <code>values[i] &gt; values[best]</code> ise <code>best = i</code> yap. <code>CountAbove</code> için bir sayaç ve <code>if</code>.',
      'Ortalama: <code>(double)Total(tris) / tris.Length</code> ve <code>$"Ortalama: {ort:F1}"</code>. En ağır: <code>int h = IndexOfMax(tris);</code> sonra <code>names[h]</code> ve <code>tris[h]</code>.',
    ],
    solution: cs`string[] names = { "Rock", "Tree", "House", "Car" };
int[] tris = { 1200, 5400, 9800, 3100 };

int Total(int[] values)
{
    int sum = 0;
    foreach (int v in values)
    {
        sum += v;
    }
    return sum;
}

int IndexOfMax(int[] values)
{
    int best = 0;
    for (int i = 1; i < values.Length; i++)
    {
        if (values[i] > values[best]) best = i;
    }
    return best;
}

int CountAbove(int[] values, int limit)
{
    int count = 0;
    foreach (int v in values)
    {
        if (v > limit) count++;
    }
    return count;
}

int total = Total(tris);
double average = (double)total / tris.Length;
int heaviest = IndexOfMax(tris);

Console.WriteLine("Obje sayısı: " + tris.Length);
Console.WriteLine("Toplam: " + total);
Console.WriteLine($"Ortalama: {average:F1}");
Console.WriteLine("En ağır: " + names[heaviest] + " (" + tris[heaviest] + ")");
Console.WriteLine("Bütçeyi aşan: " + CountAbove(tris, 5000));`,
    explain: 'Her fonksiyon diziyi parametre olarak alıp tek bir döngüyle tarıyor ve sonucu döndürüyor. IndexOfMax değer yerine indeks döndürdüğü için aynı indeksi hem names hem tris dizisinde kullanabildin — paralel dizilerin gücü bu.',
  },
  quiz: [
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`int[] a = new int[3];
a[0] = 5;
Console.WriteLine(a[0] + a[2]);`,
      verifyOutput: true,
      options: [
        { t: '5', correct: true, why: 'Doğru. new int[3] tüm kutuları 0 ile doldurur; a[2] hâlâ 0 → 5 + 0 = 5.' },
        { t: 'Derleme hatası: a[2] atanmamış', why: 'Dizi elemanları otomatik olarak varsayılan değer (int için 0) alır; "atanmamış" olmazlar.' },
        { t: '50', why: 'İki int toplanıyor, string birleştirme yok.' },
        { t: 'IndexOutOfRangeException', why: '3 elemanlı dizide 2 geçerli bir indekstir (0, 1, 2).' },
      ],
    },
    {
      q: '<code>Length</code>\'i 25 olan bir dizinin son elemanına nasıl erişilir?',
      options: [
        { t: 'dizi[24]', correct: true, why: 'Doğru. İndeks 0\'dan başladığı için son indeks Length - 1 = 24.' },
        { t: 'dizi[25]', why: 'Bu, dizinin bir kutu dışıdır → IndexOutOfRangeException.' },
        { t: 'dizi[-1]', why: 'C# dizilerinde negatif indeks "sondan say" anlamına gelmez; hata verir.' },
        { t: 'dizi.Length', why: 'Bu elemanın kendisi değil, eleman sayısıdır (25).' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`List<string> sel = new List<string>();
sel.Add("A");
sel.Add("B");
sel.Insert(0, "C");
sel.RemoveAt(1);
Console.WriteLine(string.Join(",", sel) + " " + sel.Count);`,
      verifyOutput: true,
      options: [
        { t: 'C,B 2', correct: true, why: 'Doğru. A, B → Insert(0,"C") → C, A, B → RemoveAt(1) 1. indeksteki A\'yı siler → C, B.' },
        { t: 'A,B 2', why: 'Insert(0, ...) en başa ekler; sonra 1. indeks (A) silinir.' },
        { t: 'C,A 2', why: 'RemoveAt değere göre değil konuma göre siler: 1. indeks A\'dır, B kalır.' },
        { t: 'C,B 3', why: 'RemoveAt sonrası Count 2\'ye düşer.' },
      ],
    },
    {
      q: 'Kullanıcının viewport\'ta tıkladıkça eklediği noktaları saklamak için hangisi daha uygundur?',
      options: [
        { t: 'List<T> — nokta sayısı çalışırken değişiyor', correct: true, why: 'Doğru. Kaç nokta ekleneceği baştan belli değil; liste Add ile büyür.' },
        { t: 'Sabit boyutlu dizi — new double[10]', why: '11. noktada yer kalmaz; dizi büyütülemez.' },
        { t: 'Her nokta için ayrı değişken', why: 'Kaç değişken yazacağını bilemezsin; koleksiyonların var olma sebebi tam olarak bu.' },
        { t: 'Hiç fark etmez', why: 'Fark eder: sabit boyut vs. değişken boyut, doğru aracı seçmenin özü.' },
      ],
    },
    {
      q: 'Bu döngü neden çöker?',
      code: cs`int[] v = { 1, 2, 3 };
for (int i = 0; i <= v.Length; i++)
{
    Console.WriteLine(v[i]);
}`,
      options: [
        { t: 'i = 3 olduğunda v[3] istenir; 3 elemanlı dizide böyle bir kutu yok', correct: true, why: 'Doğru. <= yüzünden döngü bir tur fazla döner (off-by-one). < kullanılmalı.' },
        { t: 'Dizi başlatıcısında boyut yazılmamış', why: '{ 1, 2, 3 } başlatıcısında boyutu derleyici sayar; sorun bu değil.' },
        { t: 'for ile dizi dolaşılamaz, foreach gerekir', why: 'for ile dolaşmak tamamen geçerli; sadece koşul yanlış.' },
        { t: 'i 0\'dan başlamamalı', why: 'İlk indeks 0\'dır; 0\'dan başlamak doğru.' },
      ],
    },
    {
      q: 'Bir mesh\'in index buffer\'ı <code>int[] idx</code> olsun (her 3 sayı bir üçgen). Üçgen sayısı nasıl hesaplanır?',
      options: [
        { t: 'idx.Length / 3', correct: true, why: 'Doğru. Her üçgen 3 indeks kullanır; toplam indeks sayısını 3\'e bölmek üçgen sayısını verir.' },
        { t: 'idx.Length', why: 'Bu indeks sayısıdır; her üçgen 3 indeks tükettiği için 3 kat fazla sayarsın.' },
        { t: 'idx.Length * 3', why: 'Ters yönde: bölmek gerekir, çarpmak değil.' },
        { t: 'idx[idx.Length - 1]', why: 'Bu son indeksin değeridir (bir vertex numarası), üçgen sayısı değil.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Bütçeyi aşan objeleri listele',
    prompt: `
<p>Program önce bir bütçe (tam sayı), sonra her satırda <code>isim üçgenSayısı</code> biçiminde objeler okusun; <code>end</code> satırı gelince dursun. Bütçeyi <b>aşan</b> objelerin adlarını bir <code>List&lt;string&gt;</code>'e topla ve şu biçimde yazdır:</p>
<pre class="expected">Obje sayısı: 4
Bütçeyi aşanlar (2): Tree, House</pre>
<p>Örnek girdi:</p>
<pre><code>5000
Rock 1200
Tree 5400
House 9800
Car 3100
end</code></pre>
<p>Hiçbir obje bütçeyi aşmıyorsa ikinci satır <code>Bütçeyi aşanlar (0): yok</code> olmalı.</p>`,
    stdin: '5000\nRock 1200\nTree 5400\nHouse 9800\nCar 3100\nend',
    starter: cs`int budget = int.Parse(Console.ReadLine());
List<string> heavy = new List<string>();
int count = 0;

string line = Console.ReadLine();
while (line != "end")
{
    // satırı isim ve sayı olarak ayır, gerekirse listeye ekle
    line = Console.ReadLine();
}
`,
    checks: [
      { type: 'output', expect: 'Obje sayısı: 4\nBütçeyi aşanlar (2): Tree, House', msg: 'Örnek girdiyle çıktı birebir aynı olmalı' },
      { type: 'output', stdin: '1000\nA 500\nB 2000\nC 1000\nD 1001\nE 7\nend', expect: 'Obje sayısı: 5\nBütçeyi aşanlar (2): B, D', msg: 'Farklı girdiyle de doğru çalışmalı (tam bütçede olan aşmış sayılmaz)' },
      { type: 'output', stdin: '99999\nCube 12\nend', expect: 'Obje sayısı: 1\nBütçeyi aşanlar (0): yok', msg: 'Hiç aşan yoksa "yok" yazmalı' },
      { type: 'code', pattern: 'List\\s*<\\s*string\\s*>', msg: 'Aşan objeleri bir List<string> içinde topla' },
      { type: 'code', pattern: 'string\\.Join', msg: 'Listeyi string.Join ile yazdır' },
    ],
    hints: [
      'Her satırı <code>line.Split(\' \')</code> ile ikiye ayırabilirsin: <code>parts[0]</code> isim, <code>parts[1]</code> sayının metni.',
      'Sayıyı <code>int.Parse(parts[1])</code> ile çevir; <code>budget</code>\'tan büyükse <code>heavy.Add(parts[0])</code>. Her satırda <code>count++</code> yapmayı unutma.',
      'Döngüden sonra: <code>heavy.Count == 0</code> ise "yok", değilse <code>string.Join(", ", heavy)</code> yazdır. Parantez içindeki sayı <code>heavy.Count</code>.',
    ],
    solution: cs`int budget = int.Parse(Console.ReadLine());
List<string> heavy = new List<string>();
int count = 0;

string line = Console.ReadLine();
while (line != "end")
{
    string[] parts = line.Split(' ');
    string name = parts[0];
    int tris = int.Parse(parts[1]);
    count++;
    if (tris > budget)
    {
        heavy.Add(name);
    }
    line = Console.ReadLine();
}

Console.WriteLine("Obje sayısı: " + count);
if (heavy.Count == 0)
{
    Console.WriteLine("Bütçeyi aşanlar (0): yok");
}
else
{
    Console.WriteLine("Bütçeyi aşanlar (" + heavy.Count + "): " + string.Join(", ", heavy));
}`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Vertex koordinatlarını numaralandır',
      prompt: `<p><code>double[] ys = { 0.5, 2.0, -1.25 };</code> dizisini <code>for</code> ile dolaşıp her elemanı indeksiyle yazdır, sonra eleman sayısını yazdır.</p><pre class="expected">v0.y = 0.5
v1.y = 2
v2.y = -1.25
Toplam vertex: 3</pre>`,
      starter: cs`double[] ys = { 0.5, 2.0, -1.25 };
`,
      checks: [
        { type: 'output', expect: 'v0.y = 0.5\nv1.y = 2\nv2.y = -1.25\nToplam vertex: 3' },
        { type: 'code', pattern: 'for\\s*\\(', msg: 'for döngüsü kullan' },
        { type: 'code', pattern: '\\.Length', msg: 'Eleman sayısını Length ile al' },
      ],
      hints: ['Döngü kalıbı: <code>for (int i = 0; i &lt; ys.Length; i++)</code>', 'Satır: <code>"v" + i + ".y = " + ys[i]</code>'],
      solution: cs`double[] ys = { 0.5, 2.0, -1.25 };
for (int i = 0; i < ys.Length; i++)
{
    Console.WriteLine("v" + i + ".y = " + ys[i]);
}
Console.WriteLine("Toplam vertex: " + ys.Length);`,
    },
    {
      difficulty: 2,
      title: 'Outliner seçim işlemleri',
      prompt: `<p>Boş bir <code>List&lt;string&gt;</code> oluştur ve sırayla: "Camera", "Cube", "Light" ekle; "Cube"u sil; en başa "World" ekle; sonuna "Cube.001" ekle. Sonra listeyi ve eleman sayısını yazdır, ardından "Light" listede var mı yazdır.</p><pre class="expected">World, Camera, Light, Cube.001
4
True</pre>`,
      starter: cs`List<string> outliner = new List<string>();
`,
      checks: [
        { type: 'output', expect: 'World, Camera, Light, Cube.001\n4\nTrue' },
        { type: 'code', pattern: '\\.Insert\\s*\\(\\s*0', msg: 'En başa eklemek için Insert(0, ...) kullan' },
        { type: 'code', pattern: '\\.Remove\\s*\\(', msg: 'Cube\'u Remove ile sil' },
        { type: 'code', pattern: '\\.Contains\\s*\\(', msg: 'Varlık kontrolü için Contains kullan' },
        { type: 'notCode', pattern: 'WriteLine\\s*\\(\\s*"World', msg: 'Listeyi elle yazma; string.Join ile yazdır' },
      ],
      hints: ['Add, Remove, Insert, Add sırasıyla dört işlem.', 'Yazdırma: <code>string.Join(", ", outliner)</code>, <code>outliner.Count</code>, <code>outliner.Contains("Light")</code>.'],
      solution: cs`List<string> outliner = new List<string>();
outliner.Add("Camera");
outliner.Add("Cube");
outliner.Add("Light");
outliner.Remove("Cube");
outliner.Insert(0, "World");
outliner.Add("Cube.001");
Console.WriteLine(string.Join(", ", outliner));
Console.WriteLine(outliner.Count);
Console.WriteLine(outliner.Contains("Light"));`,
    },
    {
      difficulty: 3,
      title: 'Index buffer analizi',
      prompt: `<p>Bir mesh'in index buffer'ı ve vertex sayısı verildi. (1) Her üçgeni <code>T0: 0 1 2</code> biçiminde yazdır. (2) Her vertex'in kaç üçgende kullanıldığını <b>bir sayaç dizisiyle</b> (<code>new int[vertexCount]</code>) hesaplayıp yazdır.</p><pre class="expected">T0: 0 1 2
T1: 2 3 0
T2: 0 3 4
v0: 3
v1: 1
v2: 2
v3: 2
v4: 1</pre>`,
      starter: cs`int[] indices = { 0, 1, 2, 2, 3, 0, 0, 3, 4 };
int vertexCount = 5;
`,
      checks: [
        { type: 'output', expect: 'T0: 0 1 2\nT1: 2 3 0\nT2: 0 3 4\nv0: 3\nv1: 1\nv2: 2\nv3: 2\nv4: 1' },
        { type: 'code', pattern: 'new\\s+int\\s*\\[\\s*vertexCount\\s*\\]', msg: 'Sayaçlar için new int[vertexCount] dizisi kullan' },
        { type: 'code', pattern: 'Length\\s*/\\s*3', msg: 'Üçgen sayısını indices.Length / 3 ile hesapla' },
      ],
      hints: [
        'Üçgen t\'nin üç indeksi: <code>indices[t * 3]</code>, <code>indices[t * 3 + 1]</code>, <code>indices[t * 3 + 2]</code>.',
        'Sayma kalıbı: <code>usage[indices[k]]++;</code> — dizinin değeri başka bir dizinin indeksi olarak kullanılıyor.',
      ],
      solution: cs`int[] indices = { 0, 1, 2, 2, 3, 0, 0, 3, 4 };
int vertexCount = 5;

for (int t = 0; t < indices.Length / 3; t++)
{
    Console.WriteLine("T" + t + ": " + indices[t * 3] + " " + indices[t * 3 + 1] + " " + indices[t * 3 + 2]);
}

int[] usage = new int[vertexCount];
foreach (int v in indices)
{
    usage[v]++;
}
for (int v = 0; v < usage.Length; v++)
{
    Console.WriteLine("v" + v + ": " + usage[v]);
}`,
    },
  ],
  vocab: [
    { en: 'Array', tr: 'Dizi', ja: '配列', kana: 'はいれつ', romaji: 'hairetsu' },
    { en: 'Element', tr: 'Eleman', ja: '要素', kana: 'ようそ', romaji: 'yōso' },
    { en: 'Index', tr: 'İndeks', ja: 'インデックス', kana: 'インデックス', romaji: 'indekkusu' },
    { en: 'List', tr: 'Liste', ja: 'リスト', kana: 'リスト', romaji: 'risuto' },
    { en: 'Collection', tr: 'Koleksiyon', ja: 'コレクション', kana: 'コレクション', romaji: 'korekushon' },
    { en: 'Loop', tr: 'Döngü', ja: 'ループ', kana: 'ループ', romaji: 'rūpu' },
    { en: 'Element count', tr: 'Eleman sayısı', ja: '要素数', kana: 'ようそすう', romaji: 'yōsosū' },
    { en: 'Two-dimensional array', tr: 'İki boyutlu dizi', ja: '二次元配列', kana: 'にじげんはいれつ', romaji: 'nijigen hairetsu' },
    { en: 'Search', tr: 'Arama', ja: '探索', kana: 'たんさく', romaji: 'tansaku' },
    { en: 'Memory', tr: 'Bellek', ja: 'メモリ', kana: 'メモリ', romaji: 'memori' },
    { en: 'Vertex', tr: 'Köşe (vertex)', ja: '頂点', kana: 'ちょうてん', romaji: 'chōten' },
  ],
  summary: [
    'Dizi aynı türden değerleri sabit boyutlu, bitişik kutularda tutar; indeks 0\'dan başlar, son indeks Length - 1\'dir.',
    'new int[n] kutuları varsayılan değerle (0, false, null) doldurur; { ... } başlatıcısı değerleri baştan verir.',
    'for indeksle (okuma + yazma), foreach doğrudan elemanlarla (sadece okuma) dolaşır.',
    'List<T> büyüyüp küçülebilir: Add, Insert, Remove (değere göre), RemoveAt (konuma göre), Contains, Count, [i].',
    'Toplam, ortalama, en büyük/en küçük (indeksiyle) ve doğrusal arama; dizilerle yapılan temel algoritmalardır. Yazdırmak için string.Join.',
    'Geçersiz indeks IndexOutOfRangeException ile programı çökertir; en sık sebep <= ile bir tur fazla dönmektir.',
  ],
};
