import { cs } from '../helpers.js';

export default {
  id: 'm1-l06',
  module: 'm1',
  title: 'Boolean ve karşılaştırma',
  titleEn: 'Booleans & comparison',
  titleJa: '真偽値と比較',
  minutes: 50,
  level: 1,
  objectives: [
    'bool türünün yalnızca true/false tuttuğunu ve neden bu kadar önemli olduğunu açıklayabilmek',
    'Karşılaştırma operatörleriyle (== != < > <= >=) bool değer üretmek',
    '&&, || ve ! operatörlerini doğruluk tablolarıyla birlikte kullanmak',
    'Kısa devre değerlendirmesini ve = ile == arasındaki farkı anlamak',
    'Ondalık sayıları == yerine toleransla karşılaştırmak (CAD hassasiyeti)',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'bool: Sadece iki değeri olan tür',
      body: `
<p>Şimdiye kadar sayılar (<code>int</code>, <code>double</code>) ve metinlerle (<code>string</code>) çalıştık. Bugün en basit ama belki de <b>en önemli</b> türle tanışıyoruz: <code>bool</code>.</p>
<p>Bir <t en="Boolean" ja="真偽値">bool</t> değişken yalnızca iki değerden birini tutabilir: <code>true</code> (<t en="true" ja="真">doğru</t>) ya da <code>false</code> (<t en="false" ja="偽">yanlış</t>). Üçüncü bir seçenek yoktur.</p>
<pre>bool gorunur = true;
bool renderEdilsin = false;</pre>
<p><b>Neden önemli?</b> Programların karar verebilmesi için "evet mi, hayır mı?" sorularına cevap gerekir: <em>Mesh seçili mi? Dosya kaydedildi mi? Nokta kutunun içinde mi?</em> Bu soruların cevabı her zaman bir <code>bool</code>'dur. Bir sonraki derste <code>if</code> ile bu cevaplara göre farklı kodlar çalıştıracağız.</p>
<div class="callout tip">İsim, 19. yüzyıl matematikçisi <b>George Boole</b>'dan gelir. Onun "mantık cebiri", bugün her işlemcinin içindeki devrelerin temelidir: işlemci de içeride sürekli "akım var / yok" (1 / 0) ile çalışır.</div>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Blender\'daki onay kutuları ve göz ikonları',
      body: `
<p>Blender'ın <b>Outliner</b> panelinde her objenin yanında bir <b>göz</b> (viewport'ta görünsün mü?) ve bir <b>kamera</b> (render'a girsin mi?) ikonu vardır. Her biri ya açıktır ya kapalı — arası yok. İşte bunlar birer <code>bool</code>'dur.</p>
<table class="compare">
<tr><th>Blender / 3D</th><th>C#</th></tr>
<tr><td>Göz ikonu açık</td><td><code>bool gorunur = true;</code></td></tr>
<tr><td>Kamera ikonu kapalı</td><td><code>bool renderdaGorunur = false;</code></td></tr>
<tr><td>Mirror modifier'daki "Clipping" onay kutusu</td><td><code>bool kirpma = true;</code></td></tr>
<tr><td>İkona tıklayıp tersine çevirmek</td><td><code>gorunur = !gorunur;</code></td></tr>
</table>
<p>Python ile Blender'ı kontrol ettiysen bu tanıdık gelebilir: bir objenin render'da gizlenmesi <code>obj.hide_render = True</code> gibi bir <b>bool özelliğiyle</b> ayarlanır. (Python'da <code>True</code> büyük harfle başlar; C#'ta anahtar kelime <code>true</code> küçük harflidir.)</p>`,
    },
    {
      kind: 'code',
      title: 'Karşılaştırma operatörleri: Soru sor, bool cevap al',
      code: cs`int poligon = 12000;
int butce = 10000;

bool butceyiAsti = poligon > butce;
Console.WriteLine(butceyiAsti);

Console.WriteLine(poligon == 12000);
Console.WriteLine(poligon != butce);
Console.WriteLine(poligon < butce);
Console.WriteLine(poligon >= 12000);
Console.WriteLine(butce <= 9999);

string malzeme = "Metal";
Console.WriteLine(malzeme == "Metal");
Console.WriteLine(malzeme == "metal");`,
      explain: {
        1: 'Bir modelin üçgen sayısını tutan sıradan bir <code>int</code>.',
        2: 'Bu model için izin verilen poligon bütçesi.',
        4: '<code>&gt;</code> bir <t en="comparison operator" ja="比較演算子">karşılaştırma operatörü</t>dür. Bilgisayar 12000 ile 10000\'i karşılaştırır ve <b>bir bool üretir</b>: <code>true</code>. Bu sonuç <code>butceyiAsti</code> değişkenine konur.',
        5: 'bool değerler ekrana <code>True</code> / <code>False</code> olarak yazılır (baş harf büyük — .NET böyle biçimlendirir).',
        7: '<code>==</code> "eşit mi?" diye sorar. <b>İki</b> eşittir işareti! Tek <code>=</code> atama yapar, karşılaştırmaz.',
        8: '<code>!=</code> "eşit değil mi?" demektir. 12000 ≠ 10000 → <code>True</code>.',
        9: '<code>&lt;</code> küçük mü? 12000 &lt; 10000 → <code>False</code>.',
        10: '<code>&gt;=</code> büyük <b>veya eşit</b> mi? 12000 ≥ 12000 → <code>True</code>. Sınır değerin kendisi de dahildir.',
        11: '<code>&lt;=</code> küçük veya eşit mi? 10000 ≤ 9999 → <code>False</code>.',
        13: 'Bir malzeme adı tutan <code>string</code> değişken.',
        14: 'Metinler de <code>==</code> ile karşılaştırılabilir. C#\'ta bu, iki metnin <b>karakter karakter aynı</b> olup olmadığını kontrol eder. "Metal" == "Metal" → <code>True</code>.',
        15: '"Metal" == "metal" → <code>False</code>! Karşılaştırma büyük/küçük harfe duyarlıdır: <b>M</b> ile <b>m</b> farklı karakterlerdir.',
      },
      runnable: true,
      stepper: true,
      note: 'Adım adım çalıştır ve her satırda bilgisayarın bir "soru" sorup cevabını (True/False) ürettiğini izle. Karşılaştırmanın kendisi bir <b>ifade</b>dir: sonucu bir değişkene koyabilir ya da doğrudan yazdırabilirsin.',
    },
    {
      kind: 'visual',
      title: 'Doğruluk tabloları: &&, || ve !',
      svg: `
<svg viewBox="0 0 760 270" role="img" aria-label="VE, VEYA ve DEĞİL operatörlerinin doğruluk tabloları">
  <g font-size="13" text-anchor="middle">
    <text x="130" y="24" class="t1">a &amp;&amp; b  (VE)</text>
    <text x="130" y="42" class="t3">ikisi de true olmalı</text>
    <rect x="20" y="52" width="220" height="30" rx="6" class="box dim"/>
    <text x="65" y="72" class="t2">a</text><text x="130" y="72" class="t2">b</text><text x="195" y="72" class="t2">sonuç</text>
    <rect x="20" y="86" width="220" height="30" rx="6" class="box hi"/>
    <text x="65" y="106" class="t1">true</text><text x="130" y="106" class="t1">true</text><text x="195" y="106" class="t1">true</text>
    <rect x="20" y="120" width="220" height="30" rx="6" class="box"/>
    <text x="65" y="140" class="t2">true</text><text x="130" y="140" class="t2">false</text><text x="195" y="140" class="t2">false</text>
    <rect x="20" y="154" width="220" height="30" rx="6" class="box"/>
    <text x="65" y="174" class="t2">false</text><text x="130" y="174" class="t2">true</text><text x="195" y="174" class="t2">false</text>
    <rect x="20" y="188" width="220" height="30" rx="6" class="box"/>
    <text x="65" y="208" class="t2">false</text><text x="130" y="208" class="t2">false</text><text x="195" y="208" class="t2">false</text>

    <text x="390" y="24" class="t1">a || b  (VEYA)</text>
    <text x="390" y="42" class="t3">en az biri true olmalı</text>
    <rect x="280" y="52" width="220" height="30" rx="6" class="box dim"/>
    <text x="325" y="72" class="t2">a</text><text x="390" y="72" class="t2">b</text><text x="455" y="72" class="t2">sonuç</text>
    <rect x="280" y="86" width="220" height="30" rx="6" class="box hi"/>
    <text x="325" y="106" class="t1">true</text><text x="390" y="106" class="t1">true</text><text x="455" y="106" class="t1">true</text>
    <rect x="280" y="120" width="220" height="30" rx="6" class="box hi"/>
    <text x="325" y="140" class="t1">true</text><text x="390" y="140" class="t1">false</text><text x="455" y="140" class="t1">true</text>
    <rect x="280" y="154" width="220" height="30" rx="6" class="box hi"/>
    <text x="325" y="174" class="t1">false</text><text x="390" y="174" class="t1">true</text><text x="455" y="174" class="t1">true</text>
    <rect x="280" y="188" width="220" height="30" rx="6" class="box"/>
    <text x="325" y="208" class="t2">false</text><text x="390" y="208" class="t2">false</text><text x="455" y="208" class="t2">false</text>

    <text x="640" y="24" class="t1">!a  (DEĞİL)</text>
    <text x="640" y="42" class="t3">tersine çevirir</text>
    <rect x="540" y="52" width="200" height="30" rx="6" class="box dim"/>
    <text x="595" y="72" class="t2">a</text><text x="685" y="72" class="t2">!a</text>
    <rect x="540" y="86" width="200" height="30" rx="6" class="box"/>
    <text x="595" y="106" class="t2">true</text><text x="685" y="106" class="t1">false</text>
    <rect x="540" y="120" width="200" height="30" rx="6" class="box hi"/>
    <text x="595" y="140" class="t2">false</text><text x="685" y="140" class="t1">true</text>

    <rect x="540" y="160" width="200" height="58" rx="10" class="box dim"/>
    <text x="640" y="184" class="t3">Blender: göz ikonuna</text>
    <text x="640" y="202" class="t3">tıklamak = !gorunur</text>

    <text x="380" y="252" class="t2">Vurgulu satırlar sonucun true olduğu durumlar. &amp;&amp; "seçici", || "cömert" bir operatördür.</text>
  </g>
</svg>`,
      caption: `
<p>Bir <t en="truth table" ja="真理値表">doğruluk tablosu</t>, bir <t en="logical operator" ja="論理演算子">mantıksal operatör</t>ün tüm olası girişler için ne ürettiğini gösterir.</p>
<ul>
<li><code>&amp;&amp;</code> (VE / AND): Sadece <b>iki taraf da</b> true ise true. "Mesh seçili <b>ve</b> düzenleme modunda."</li>
<li><code>||</code> (VEYA / OR): Taraflardan <b>en az biri</b> true ise true. "Dosya .fbx <b>veya</b> .obj."</li>
<li><code>!</code> (DEĞİL / NOT): Tek bir bool'u tersine çevirir.</li>
</ul>`,
    },
    {
      kind: 'code',
      title: 'Birleşik koşul: Vertex bounding box\'ın içinde mi?',
      code: cs`double x = 2.5, y = 8.0, z = -1.0;

bool xIcinde = x >= 0 && x <= 10;
bool yIcinde = y >= 0 && y <= 10;
bool zIcinde = z >= 0 && z <= 10;

bool kutuda = xIcinde && yIcinde && zIcinde;
Console.WriteLine($"Kutunun içinde: {kutuda}");

bool sinirDisi = x < 0 || y < 0 || z < 0;
Console.WriteLine($"Negatif koordinat var: {sinirDisi}");

Console.WriteLine($"Dışarıda mı: {!kutuda}");`,
      explain: {
        1: 'Bir vertex\'in (köşe noktasının) X, Y, Z koordinatları. Aynı türden birden fazla değişkeni virgülle tek satırda tanımlayabilirsin.',
        3: 'Kutumuz her eksende 0 ile 10 arası. "x, 0 ile 10 arasında mı?" sorusu <b>iki</b> karşılaştırmadır: <code>x &gt;= 0</code> <b>VE</b> <code>x &lt;= 10</code>. Önce iki karşılaştırma hesaplanır (true, true), sonra <code>&amp;&amp;</code> bunları birleştirir → true.',
        4: 'y = 8.0 → (true &amp;&amp; true) → true.',
        5: 'z = -1.0 → <code>z &gt;= 0</code> false! Sonuç false.',
        7: 'Üç eksenin <b>hepsi</b> içeride olmalı. true &amp;&amp; true &amp;&amp; false → <code>false</code>. Tek bir false, &amp;&amp; zincirinin tamamını false yapar.',
        8: 'bool değerleri <code>$"..."</code> içine de koyabilirsin; True/False olarak yazılır.',
        10: '<code>||</code>: Herhangi bir koordinat negatif mi? false || false || true → <code>true</code>. Tek bir true yeterli.',
        13: '<code>!kutuda</code> → false\'un tersi → <code>True</code>. Not: <code>!</code> değişkenin kendisini değiştirmez, sadece ters değeri üretir.',
      },
      runnable: true,
      stepper: true,
      note: 'z değerini 3.0 yapıp tekrar çalıştır: "Kutunun içinde" True olmalı. Bu tam olarak 3D yazılımların "bu nokta seçim kutusunun içinde mi?" (box select) sorusunu nasıl cevapladığıdır.',
      editable: true,
    },
    {
      kind: 'code',
      title: 'Kısa devre değerlendirmesi: Bilgisayar tembeldir (iyi anlamda)',
      code: cs`int vertexSayisi = 0;
int ucgenSayisi = 12;

bool guvenli = vertexSayisi != 0 && ucgenSayisi / vertexSayisi > 1;
Console.WriteLine(guvenli);

bool acik = true;
bool sonuc = acik || ucgenSayisi / vertexSayisi > 1;
Console.WriteLine(sonuc);`,
      explain: {
        1: 'Dikkat: vertex sayısı 0. Bir sayıyı 0\'a bölmek (tam sayılarda) programı çökertir.',
        4: '<t en="short-circuit evaluation" ja="短絡評価">Kısa devre</t>: <code>&amp;&amp;</code> önce <b>sol</b> tarafa bakar. <code>vertexSayisi != 0</code> false çıktı. "false VE herhangi bir şey" her zaman false olduğu için bilgisayar <b>sağ tarafı hiç hesaplamaz</b>. Böylece 0\'a bölme hiç gerçekleşmez!',
        5: '<code>False</code> yazılır — program çökmeden.',
        8: '<code>||</code> için tersi geçerli: sol taraf true ise "true VEYA herhangi bir şey" zaten true\'dur. Sağ taraftaki tehlikeli bölme yine atlanır.',
        9: '<code>True</code> yazılır.',
      },
      runnable: true,
      stepper: true,
      note: 'Sıra önemli! 4. satırda iki tarafın yerini değiştirirsen (<code>ucgenSayisi / vertexSayisi &gt; 1 &amp;&amp; vertexSayisi != 0</code>) bölme <b>önce</b> çalışır ve program DivideByZeroException ile çöker. Deneyip görebilirsin. Kural: "koruyucu" kontrolü her zaman sola yaz.',
      editable: true,
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Çıktı ne olur?',
      code: cs`int lod = 2;
bool kameraYakin = false;
Console.WriteLine(lod >= 2 && !kameraYakin);
Console.WriteLine(lod == 1 || kameraYakin);
Console.WriteLine(!(lod > 0));`,
      options: ['True\nFalse\nFalse', 'False\nFalse\nTrue', 'True\nTrue\nFalse', 'True\nFalse\nTrue'],
      answer: 0,
      explain: '1. satır: <code>2 &gt;= 2</code> true, <code>!false</code> true → true &amp;&amp; true = <b>True</b>. 2. satır: <code>2 == 1</code> false, kameraYakin false → false || false = <b>False</b>. 3. satır: önce parantez: <code>2 &gt; 0</code> true, sonra <code>!</code> → <b>False</b>.',
    },
    {
      kind: 'code',
      title: 'Ondalık sayıları toleransla karşılaştır',
      code: cs`double a = 0.1 + 0.2;
double b = 0.3;

Console.WriteLine(a);
Console.WriteLine(a == b);

double tolerans = 1e-9;
bool yaklasikEsit = Math.Abs(a - b) < tolerans;
Console.WriteLine(yaklasikEsit);`,
      explain: {
        1: 'Önceki dersten hatırla: <code>double</code> sayılar ikilik (binary) sistemde saklanır ve 0.1 gibi değerler <b>tam olarak</b> temsil edilemez.',
        4: 'Ekrana <code>0.30000000000000004</code> yazılır — beklediğimiz 0.3 değil!',
        5: 'Bu yüzden <code>==</code> → <code>False</code>. İki sayı "neredeyse" aynı ama bit bit aynı değil.',
        7: '<code>1e-9</code> bilimsel gösterimdir: 1 × 10⁻⁹ = 0.000000001. Bu bizim <t en="tolerance" ja="許容誤差">tolerans</t>ımız: "Bu kadar küçük fark, fark sayılmaz."',
        8: 'Doğru yöntem: Farkın <b>mutlak değerini</b> (<code>Math.Abs</code>, işaretini atar) al ve toleranstan küçük mü diye sor. 0.00000000000000004 &lt; 0.000000001 → true.',
        9: '<code>True</code> — artık iki sayıyı "eşit" kabul ediyoruz.',
      },
      runnable: true,
      stepper: true,
      note: 'Neden Math.Abs? a − b negatif çıkabilir (ör. −0.5). −0.5 &lt; 1e-9 de true olurdu ve yanlış sonuç alırdık! Mutlak değer, farkın büyüklüğüne bakmamızı sağlar.',
    },
    {
      kind: 'warning',
      title: 'Sık yapılan hatalar',
      body: `
<ol>
<li><b><code>=</code> ile <code>==</code>'yi karıştırmak.</b> <code>=</code> <em>atama</em>dır ("şunu koy"), <code>==</code> <em>karşılaştırma</em>dır ("eşit mi?"). <code>bool b = (x = 5);</code> → <code>error CS0029: Cannot implicitly convert type 'int' to 'bool'</code>. C# burada seni korur: atamanın sonucu bir int'tir, bool değil.</li>
<li><b>Matematikteki gibi zincirleme yazmak.</b> <code>0 &lt; x &lt; 10</code> C#'ta çalışmaz. Bilgisayar önce <code>0 &lt; x</code>'i hesaplar (bir bool), sonra "bool &lt; 10" yapmaya çalışır → <code>CS0019</code>. Doğrusu: <code>0 &lt; x &amp;&amp; x &lt; 10</code>.</li>
<li><b>Ondalık sayıları <code>==</code> ile karşılaştırmak.</b> Kod derlenir ama yanlış sonuç verebilir. Tolerans kullan.</li>
<li><b>Metinlerde büyük/küçük harfi unutmak.</b> <code>"Cube" == "cube"</code> → False. Gerekirse iki tarafı da <code>.ToLower()</code> ile küçült.</li>
<li><b>Tek <code>&amp;</code> veya tek <code>|</code> yazmak.</b> Bunlar da derlenir ama <b>kısa devre yapmaz</b> — iki tarafı da her zaman hesaplar. Yeni başlarken her zaman çift yaz: <code>&amp;&amp;</code>, <code>||</code>.</li>
</ol>
<p>Aşağıdaki kodda bunlardan biri var. Çalıştır, hatayı oku ve düzelt.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Bu kodu düzelt',
      code: cs`int x = 7;
bool aralikta = 0 <= x <= 10;
Console.WriteLine(aralikta);`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        2: 'Derleyici <code>0 &lt;= x</code> kısmını hesaplar ve bir <b>bool</b> elde eder. Sonra "bool &lt;= 10" yapmaya çalışır — bool ile sayı karşılaştırılamaz. Hata mesajındaki türlere bak: <code>\'bool\' and \'int\'</code>.',
      },
      note: 'İpucu: İki ayrı karşılaştırma yapıp bunları bir mantıksal operatörle birleştirmen gerekiyor. Düzelttiğinde çıktı True olmalı.',
    },
    {
      kind: 'cad',
      title: 'CAD/BIM\'de bool: Tolerans ve çakışma kontrolü',
      body: `
<p>Bir CAD programında iki çizginin uç noktası "aynı nokta mı?" sorusu çok sık sorulur — örneğin bir duvarın köşesinin diğerine <b>bağlı</b> olup olmadığını anlamak için. Koordinatlar <code>double</code>'dır, dolayısıyla <code>==</code> burada güvenilmez. Gerçek geometri yazılımları neredeyse her zaman bir <b>tolerans</b> (<t en="tolerance" ja="許容誤差">許容誤差</t>) ile karşılaştırır:</p>
<pre>bool ayniNokta = Math.Abs(x1 - x2) &lt; tol
              &amp;&amp; Math.Abs(y1 - y2) &lt; tol;</pre>
<p>BIM'de <t en="clash detection" ja="干渉チェック">çakışma kontrolü</t> (ör. bir boru bir kirişin içinden geçiyor mu?) çoğunlukla ilk aşamada bugün yaptığın şeyle başlar: İki objenin <t en="bounding box" ja="バウンディングボックス">bounding box</t>'ı her eksende üst üste biniyor mu? Bu, bir sürü <code>&lt;=</code> karşılaştırmasının <code>&amp;&amp;</code> ile birleşmesidir. Kutular çakışmıyorsa pahalı detaylı geometri testine hiç gerek kalmaz — kısa devre mantığının büyük ölçekli hali!</p>
<p class="muted">Toleransın büyüklüğü (ör. 1e-6 mm mi, 0.01 mm mi?) her yazılımda ve her işlemde farklı seçilir. Meydan okuma görevinde iki kutunun çakışmasını kendin hesaplayacaksın.</p>`,
    },
  ],
  exercise: {
    title: 'Vertex bounding box\'ın içinde mi?',
    prompt: `
<p>Program, bir vertex'in X, Y ve Z koordinatlarını (tam sayı) sırayla okur. Bounding box'ın sınırları:</p>
<ul><li>X: 0 ile 10 arası (sınırlar dahil)</li><li>Y: 0 ile 10 arası (sınırlar dahil)</li><li>Z: 0 ile 5 arası (sınırlar dahil)</li></ul>
<p>Her eksen için bir <code>bool</code> hesapla, sonra üçünü birleştir. Girdi <code>4</code>, <code>7</code>, <code>9</code> için çıktı <b>tam olarak</b> şöyle olmalı:</p>
<pre class="expected">X aralıkta: True
Y aralıkta: True
Z aralıkta: False
Kutunun içinde: False</pre>
<p>Programın farklı girdilerle de test edilecek, o yüzden sonuçları elle yazma — karşılaştırma operatörleriyle hesapla.</p>`,
    starter: cs`int x = int.Parse(Console.ReadLine());
int y = int.Parse(Console.ReadLine());
int z = int.Parse(Console.ReadLine());

// Sınırlar: X 0..10, Y 0..10, Z 0..5 (sınırlar dahil)
// 1) xAralikta, yAralikta, zAralikta adında üç bool hesapla
// 2) Bunları birleştirerek kutununIcinde bool'unu hesapla
// 3) Dört satırı yazdır
`,
    stdin: '4\n7\n9',
    checks: [
      { type: 'output', expect: 'X aralıkta: True\nY aralıkta: True\nZ aralıkta: False\nKutunun içinde: False', msg: '4, 7, 9 girdisi için çıktı birebir aynı olmalı' },
      { type: 'output', stdin: '2\n3\n5', expect: 'X aralıkta: True\nY aralıkta: True\nZ aralıkta: True\nKutunun içinde: True', msg: 'Sınırdaki değerler (ör. z = 5) dahil sayılmalı: 2, 3, 5 girdisi için hepsi True olmalı' },
      { type: 'output', stdin: '-1\n11\n0', expect: 'X aralıkta: False\nY aralıkta: False\nZ aralıkta: True\nKutunun içinde: False', msg: 'Negatif ve sınırın üstündeki değerler dışarıda sayılmalı (-1, 11, 0 girdisi)' },
      { type: 'code', pattern: '&&', msg: 'Karşılaştırmaları && (VE) operatörüyle birleştirmelisin' },
      { type: 'notCode', pattern: 'True|False', msg: 'True/False değerlerini elle yazma; karşılaştırmalarla hesapla' },
    ],
    hints: [
      '"x, 0 ile 10 arasında mı?" sorusu tek bir karşılaştırma değil, <b>iki</b> karşılaştırmadır: alt sınırı ve üst sınırı ayrı ayrı kontrol et.',
      'Sınırlar dahil olduğu için <code>&gt;=</code> ve <code>&lt;=</code> kullan. Örneğin: <code>bool xAralikta = x &gt;= 0 &amp;&amp; ... ;</code>',
      'Kutunun içinde olmak için <b>üç eksenin hepsi</b> aralıkta olmalı: üç bool\'u <code>&amp;&amp;</code> ile zincirle. Yazdırırken <code>$"X aralıkta: {xAralikta}"</code> biçimini kullan.',
    ],
    solution: cs`int x = int.Parse(Console.ReadLine());
int y = int.Parse(Console.ReadLine());
int z = int.Parse(Console.ReadLine());

bool xAralikta = x >= 0 && x <= 10;
bool yAralikta = y >= 0 && y <= 10;
bool zAralikta = z >= 0 && z <= 5;
bool kutununIcinde = xAralikta && yAralikta && zAralikta;

Console.WriteLine($"X aralıkta: {xAralikta}");
Console.WriteLine($"Y aralıkta: {yAralikta}");
Console.WriteLine($"Z aralıkta: {zAralikta}");
Console.WriteLine($"Kutunun içinde: {kutununIcinde}");`,
    explain: 'Her eksen için iki karşılaştırma (alt sınır ve üst sınır) <code>&amp;&amp;</code> ile birleşti. Sonra üç eksenin sonucu yine <code>&amp;&amp;</code> ile birleşti: tek bir false, sonucu false yapar. Bool değerler <code>$"..."</code> içinde otomatik olarak True/False yazılır.',
  },
  quiz: [
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`int a = 7;
Console.WriteLine(a > 3 && a < 5);`,
      verifyOutput: true,
      options: [
        { t: 'False', correct: true, why: 'Doğru. 7 > 3 true, ama 7 < 5 false. && için iki tarafın da true olması gerekir.' },
        { t: 'True', why: 'Sadece ilk karşılaştırmaya bakmışsın. && "ikisi de" demektir; 7 < 5 false olduğu için sonuç false.' },
        { t: '7', why: 'Karşılaştırma operatörleri sayı değil, bool (True/False) üretir.' },
        { t: 'Derleme hatası', why: 'Bu geçerli bir koddur: iki ayrı karşılaştırma && ile birleştirilmiş. Hata veren yazım 3 < a < 5 olurdu.' },
      ],
    },
    {
      q: 'x değişkeninin 5\'e eşit olup olmadığını hangi ifade kontrol eder?',
      options: [
        { t: 'x == 5', correct: true, why: 'Doğru. İki eşittir işareti karşılaştırmadır ve bir bool üretir.' },
        { t: 'x = 5', why: 'Tek = atamadır: x\'e 5 değerini koyar. "Eşit mi?" diye sormaz.' },
        { t: 'x === 5', why: 'Üçlü eşittir JavaScript\'te vardır, C#\'ta yoktur.' },
        { t: 'x equals 5', why: 'C#\'ta böyle bir operatör yok. (Metotlarda .Equals(...) var ama yazımı bu değil.)' },
      ],
    },
    {
      q: 'bool sonuc = b != 0 && a / b > 2; satırında b 0 ise ne olur?',
      options: [
        { t: 'sonuc false olur; a / b hiç hesaplanmaz', correct: true, why: 'Doğru: kısa devre. Sol taraf false olduğunda && sağ tarafı atlar, bu yüzden 0\'a bölme gerçekleşmez.' },
        { t: 'Program DivideByZeroException ile çöker', why: 'Sağ taraf hiç çalışmaz. && sol taraf false olunca durur. Çökme, koşulların sırası ters olsaydı yaşanırdı.' },
        { t: 'sonuc true olur', why: 'b != 0 false olduğu için &&\'in sonucu kesinlikle false\'tur.' },
        { t: 'Derleme hatası verir', why: 'Kod geçerlidir; derleyici b\'nin değerini önceden bilmez.' },
      ],
    },
    {
      q: '0.1 + 0.2 == 0.3 neden False verir?',
      options: [
        { t: 'double sayılar ikilik sistemde saklanır ve 0.1, 0.2 tam temsil edilemez; toplam 0.30000000000000004 olur', correct: true, why: 'Doğru. Bu yüzden ondalık sayıları Math.Abs(a - b) < tolerans ile karşılaştırırız.' },
        { t: 'C#\'ta toplama işlemi hatalıdır', why: 'Toplama doğru çalışır; sorun sayıların bellekte nasıl saklandığıdır (IEEE 754 kayan nokta). Bu tüm dillerde aynıdır.' },
        { t: '== sadece int için çalışır', why: '== double için de çalışır, ama bit bit eşitlik arar. Küçük yuvarlama farkları yüzünden false döner.' },
        { t: 'Parantez eksik olduğu için', why: 'Parantez eklemek sonucu değiştirmez; aritmetik operatörler zaten karşılaştırmadan önce hesaplanır.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`string a = "Cube";
string b = "cube";
Console.WriteLine(a == b);
Console.WriteLine(a.ToLower() == b);`,
      verifyOutput: true,
      options: [
        { t: 'False\nTrue', correct: true, why: 'Doğru. == büyük/küçük harfe duyarlıdır; "C" ≠ "c". ToLower() sonrası iki metin de "cube" olur.' },
        { t: 'True\nTrue', why: 'C# metinleri karakter karakter karşılaştırır ve büyük C ile küçük c farklı karakterlerdir.' },
        { t: 'False\nFalse', why: 'İkinci satırda a.ToLower() "cube" üretir; b de "cube" olduğu için eşittirler.' },
        { t: 'Derleme hatası', why: 'Metinler == ile karşılaştırılabilir; bu C#\'ta tamamen geçerlidir.' },
      ],
    },
    {
      q: 'Bir objenin görünürlüğünü (true ↔ false) tersine çeviren satır hangisi?',
      options: [
        { t: 'gorunur = !gorunur;', correct: true, why: 'Doğru. ! mevcut değerin tersini üretir ve = bunu değişkene geri yazar. Blender\'da göz ikonuna tıklamak gibi.' },
        { t: '!gorunur;', why: 'Bu sadece ters değeri hesaplar ama hiçbir yere kaydetmez; C# bunu geçerli bir deyim olarak kabul etmez bile.' },
        { t: 'gorunur == !gorunur;', why: '== karşılaştırmadır, atama yapmaz. Ayrıca bir değer asla kendi tersine eşit olmaz.' },
        { t: 'gorunur = false;', why: 'Bu her zaman false yapar; zaten false ise true\'ya çevirmez. "Tersine çevirmek" için mevcut değere bakmalısın.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: İki kutu çakışıyor mu? (AABB testi)',
    prompt: `
<p>BIM yazılımlarındaki çakışma kontrolünün ilk adımını yaz. İki dikdörtgenin (2B bounding box) sınırları sırayla okunur:</p>
<pre>A kutusu: minX, maxX, minY, maxY
B kutusu: minX, maxX, minY, maxY</pre>
<p>İki aralık <b>[aMin, aMax]</b> ve <b>[bMin, bMax]</b> şu durumda üst üste biner: <code>aMin &lt;= bMax</code> <b>ve</b> <code>bMin &lt;= aMax</code>. (Kenarları sadece değiyorsa da çakışma sayılır.) Kutular, <b>hem</b> X'te <b>hem</b> Y'de üst üste biniyorsa çakışır.</p>
<p>Girdi <code>0 4 0 4</code> / <code>3 6 1 2</code> (her sayı ayrı satırda) için çıktı:</p>
<pre class="expected">X çakışması: True
Y çakışması: True
Çakışma: True</pre>`,
    starter: cs`int aMinX = int.Parse(Console.ReadLine());
int aMaxX = int.Parse(Console.ReadLine());
int aMinY = int.Parse(Console.ReadLine());
int aMaxY = int.Parse(Console.ReadLine());
int bMinX = int.Parse(Console.ReadLine());
int bMaxX = int.Parse(Console.ReadLine());
int bMinY = int.Parse(Console.ReadLine());
int bMaxY = int.Parse(Console.ReadLine());

// X ve Y eksenlerindeki çakışmayı hesapla, sonra birleştir
`,
    stdin: '0\n4\n0\n4\n3\n6\n1\n2',
    checks: [
      { type: 'output', expect: 'X çakışması: True\nY çakışması: True\nÇakışma: True', msg: 'Örnek girdi için çıktı birebir aynı olmalı' },
      { type: 'output', stdin: '0\n4\n0\n4\n5\n8\n0\n4', expect: 'X çakışması: False\nY çakışması: True\nÇakışma: False', msg: 'B kutusu X\'te tamamen sağdaysa çakışma olmamalı' },
      { type: 'output', stdin: '0\n4\n0\n4\n4\n6\n-3\n-1', expect: 'X çakışması: True\nY çakışması: False\nÇakışma: False', msg: 'Kenarları değen X aralıkları çakışır sayılmalı, ama Y\'de ayrı kutular çakışmamalı' },
      { type: 'notCode', pattern: 'True|False', msg: 'Sonuçları elle yazma; karşılaştırmalarla hesapla' },
    ],
    hints: [
      'Önce tek bir eksen düşün: [0,4] ile [3,6] aralıkları üst üste biniyor mu? Kağıda bir sayı doğrusu çiz.',
      'X için: <code>bool xCakisma = aMinX &lt;= bMaxX &amp;&amp; bMinX &lt;= aMaxX;</code> — Y için aynısını yaz.',
      'Son sonuç iki eksenin <b>ikisinin de</b> çakışmasını gerektirir; hangi mantıksal operatör "ikisi de" demekti?',
    ],
    solution: cs`int aMinX = int.Parse(Console.ReadLine());
int aMaxX = int.Parse(Console.ReadLine());
int aMinY = int.Parse(Console.ReadLine());
int aMaxY = int.Parse(Console.ReadLine());
int bMinX = int.Parse(Console.ReadLine());
int bMaxX = int.Parse(Console.ReadLine());
int bMinY = int.Parse(Console.ReadLine());
int bMaxY = int.Parse(Console.ReadLine());

bool xCakisma = aMinX <= bMaxX && bMinX <= aMaxX;
bool yCakisma = aMinY <= bMaxY && bMinY <= aMaxY;
bool cakisma = xCakisma && yCakisma;

Console.WriteLine($"X çakışması: {xCakisma}");
Console.WriteLine($"Y çakışması: {yCakisma}");
Console.WriteLine($"Çakışma: {cakisma}");`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Görünürlük düğmesi',
      prompt: '<p><code>bool gorunur = true;</code> ile başla. Değeri yazdır, sonra <code>!</code> ile tersine çevirip değişkene geri ata ve tekrar yazdır.</p><pre class="expected">Görünür: True\nGörünür: False</pre>',
      starter: cs`bool gorunur = true;
`,
      checks: [
        { type: 'output', expect: 'Görünür: True\nGörünür: False' },
        { type: 'code', pattern: '=\\s*!\\s*\\w+', msg: 'Değeri ! operatörüyle tersine çevirip değişkene atamalısın' },
        { type: 'notCode', pattern: 'True|False|=\\s*false', msg: 'Değeri elle yazma; ! ile tersine çevir' },
      ],
      hints: ['İki kez <code>Console.WriteLine($"Görünür: {gorunur}");</code> yazacaksın; aralarında değişkeni değiştir.', 'Tersine çevirme: <code>gorunur = !gorunur;</code>'],
      solution: cs`bool gorunur = true;
Console.WriteLine($"Görünür: {gorunur}");
gorunur = !gorunur;
Console.WriteLine($"Görünür: {gorunur}");`,
    },
    {
      difficulty: 2,
      title: 'Çift sayıda kenar',
      prompt: '<p>Bir tam sayı oku (bir poligonun kenar sayısı). İki satır yazdır: sayı çift mi, ve sayı hem çift hem de 4 veya daha büyük mü? Girdi <code>6</code> için:</p><pre class="expected">Çift: True\nÇift ve en az 4: True</pre>',
      starter: cs`int kenar = int.Parse(Console.ReadLine());
`,
      stdin: '6',
      checks: [
        { type: 'output', expect: 'Çift: True\nÇift ve en az 4: True', msg: '6 için ikisi de True olmalı' },
        { type: 'output', stdin: '2', expect: 'Çift: True\nÇift ve en az 4: False', msg: '2 çift ama 4\'ten küçük' },
        { type: 'output', stdin: '5', expect: 'Çift: False\nÇift ve en az 4: False', msg: '5 tek sayı' },
        { type: 'code', pattern: '%', msg: 'Çiftliği % (mod) operatörüyle kontrol etmelisin' },
        { type: 'notCode', pattern: 'True|False', msg: 'Sonuçları hesapla, elle yazma' },
      ],
      hints: ['Bir sayı 2\'ye bölündüğünde kalan 0 ise çifttir: <code>kenar % 2 == 0</code>.', 'İkinci soru: <code>cift &amp;&amp; kenar &gt;= 4</code>.'],
      solution: cs`int kenar = int.Parse(Console.ReadLine());
bool cift = kenar % 2 == 0;
bool ciftVeBuyuk = cift && kenar >= 4;
Console.WriteLine($"Çift: {cift}");
Console.WriteLine($"Çift ve en az 4: {ciftVeBuyuk}");`,
    },
    {
      difficulty: 3,
      title: 'CAD toleransıyla eşitlik',
      prompt: '<p>İki ölçü (mm, ondalıklı) oku. Farkları 0.001 mm\'den küçükse eşit kabul et. Ayrıca <code>==</code> ile karşılaştırmanın sonucunu da yazdır. Girdi <code>12.5</code> ve <code>12.5004</code> için:</p><pre class="expected">== ile: False\nToleransla: True</pre>',
      starter: cs`double a = double.Parse(Console.ReadLine());
double b = double.Parse(Console.ReadLine());
`,
      stdin: '12.5\n12.5004',
      checks: [
        { type: 'output', expect: '== ile: False\nToleransla: True' },
        { type: 'output', stdin: '20\n20.01', expect: '== ile: False\nToleransla: False', msg: '0.01 mm fark toleransın dışında' },
        { type: 'output', stdin: '7.25\n7.25', expect: '== ile: True\nToleransla: True', msg: 'Aynı sayılar her iki yöntemle de eşit' },
        { type: 'code', pattern: 'Math\\.Abs', msg: 'Farkın mutlak değerini Math.Abs ile almalısın' },
        { type: 'notCode', pattern: 'True|False', msg: 'Sonuçları hesapla, elle yazma' },
      ],
      hints: ['Tolerans: <code>double tol = 0.001;</code>', 'Mutlak fark: <code>Math.Abs(a - b)</code>. Bunu toleransla <code>&lt;</code> ile karşılaştır.', 'b − a negatif olabilir; Math.Abs olmadan ters sıralı girdilerde yanlış sonuç alırsın.'],
      solution: cs`double a = double.Parse(Console.ReadLine());
double b = double.Parse(Console.ReadLine());
double tol = 0.001;
Console.WriteLine($"== ile: {a == b}");
Console.WriteLine($"Toleransla: {Math.Abs(a - b) < tol}");`,
    },
  ],
  vocab: [
    { en: 'Boolean', tr: 'Mantıksal değer (bool)', ja: '真偽値', kana: 'しんぎち', romaji: 'shingichi' },
    { en: 'True', tr: 'Doğru', ja: '真', kana: 'しん', romaji: 'shin' },
    { en: 'False', tr: 'Yanlış', ja: '偽', kana: 'ぎ', romaji: 'gi' },
    { en: 'Comparison operator', tr: 'Karşılaştırma operatörü', ja: '比較演算子', kana: 'ひかくえんざんし', romaji: 'hikaku enzanshi' },
    { en: 'Logical operator', tr: 'Mantıksal operatör', ja: '論理演算子', kana: 'ろんりえんざんし', romaji: 'ronri enzanshi' },
    { en: 'Truth table', tr: 'Doğruluk tablosu', ja: '真理値表', kana: 'しんりちひょう', romaji: 'shinrichi hyō' },
    { en: 'Condition', tr: 'Koşul', ja: '条件', kana: 'じょうけん', romaji: 'jōken' },
    { en: 'Short-circuit evaluation', tr: 'Kısa devre değerlendirmesi', ja: '短絡評価', kana: 'たんらくひょうか', romaji: 'tanraku hyōka' },
    { en: 'Tolerance', tr: 'Tolerans', ja: '許容誤差', kana: 'きょようごさ', romaji: 'kyoyō gosa' },
    { en: 'Bounding box', tr: 'Sınırlayıcı kutu', ja: 'バウンディングボックス', kana: 'バウンディングボックス', romaji: 'baundingu bokkusu' },
    { en: 'Clash detection', tr: 'Çakışma kontrolü', ja: '干渉チェック', kana: 'かんしょうチェック', romaji: 'kanshō chekku' },
  ],
  summary: [
    'bool yalnızca true veya false tutar; ekrana True / False olarak yazılır.',
    'Karşılaştırma operatörleri (== != < > <= >=) her zaman bir bool üretir. = atama, == karşılaştırmadır.',
    '&& ikisi de true ise, || en az biri true ise true verir; ! tersine çevirir. 0 < x < 10 yerine 0 < x && x < 10 yazılır.',
    'Kısa devre: && solda false, || solda true görürse sağ tarafı hiç hesaplamaz — koruyucu kontrolü sola yaz.',
    'Metin karşılaştırması büyük/küçük harfe duyarlıdır; double sayılar Math.Abs(a - b) < tolerans ile karşılaştırılır.',
  ],
};
