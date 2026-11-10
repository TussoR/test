import { cs } from '../helpers.js';

export default {
  id: 'm1-l04',
  module: 'm1',
  title: 'Metinler (string)',
  titleEn: 'Strings',
  titleJa: '文字列',
  minutes: 70,
  level: 1,
  objectives: [
    'Metinleri + ile birleştirmek ve $"...{x}..." ile ara değer yerleştirmek; {x:F2} gibi biçimleri kullanmak',
    'Kaçış dizilerini (\\n, \\t, \\", \\\\) ve @"..." yazımını doğru kullanmak',
    'Length, [indeks], IndexOf, Substring ile metinden parça çıkarmak',
    'ToUpper/ToLower, Contains, StartsWith/EndsWith, Replace, Trim, Split ile isimleri ve dosya yollarını işlemek',
    'String\'lerin değiştirilemez (immutable) olduğunu ve bunun kodu nasıl etkilediğini açıklayabilmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'String nedir?',
      body: `
<p><code>string</code>, karakterlerin <b>sıralı bir dizisidir</b>. <code>"SM_Chair_LOD0"</code> aslında yan yana dizilmiş 13 adet <code>char</code>'dır: 'S', 'M', '_', 'C'…</p>
<ul>
<li>Kodda yazılan sabit metne <t en="string literal" ja="文字列リテラル">string sabiti</t> denir ve <b>çift tırnak</b> içinde yazılır.</li>
<li>Her karakterin bir sıra numarası vardır: <t en="index" ja="インデックス">indeks</t>. Sayma <b>0'dan</b> başlar.</li>
<li>String'ler <t en="immutable" ja="不変">değiştirilemez</t>dir: bir kez oluşturulan metin bellekte hiç değişmez. "Değiştiren" her işlem aslında <b>yeni bir string</b> üretir. (Bunun önemini birazdan göreceğiz.)</li>
</ul>
<p>Programların büyük kısmı metinle uğraşır: dosya adları, katman isimleri, kullanıcı girdileri, raporlar, hata mesajları. Bu derste metni <b>parçalamayı, birleştirmeyi ve dönüştürmeyi</b> öğreneceksin.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Asset isimlendirme kuralları',
      body: `
<p>Oyun ve görselleştirme projelerinde isimler <b>yapılandırılmış veri</b>dir: <code>SM_Chair_LOD0</code> → tip (Static Mesh) + asset adı + LOD seviyesi. <code>T_Wood_BaseColor</code> → Texture + malzeme + harita tipi. Bu düzen sayesinde hem insanlar hem de <b>script'ler</b> dosyaları anlayabilir.</p>
<p>Blender'da yüzlerce objeyi elle yeniden adlandırdığın, Photoshop'ta katman isimlerini tek tek düzelttiğin anları hatırla. Bugün öğreneceğin her string metodu, bu işlerden birini otomatikleştirir:</p>
<table class="compare">
<tr><th>Elle yapılan iş</th><th>String metodu</th></tr>
<tr><td>Blender'da toplu yeniden adlandırma (Batch Rename: Find/Replace)</td><td><code>Replace</code></td></tr>
<tr><td>Outliner'da "SM_" ile başlayanları bulmak</td><td><code>StartsWith</code></td></tr>
<tr><td>Klasörde sadece .fbx dosyalarını seçmek</td><td><code>EndsWith</code></td></tr>
<tr><td>Dosya adındaki fazladan boşlukları silmek</td><td><code>Trim</code></td></tr>
<tr><td>"T_Wood_BaseColor"'ı parçalarına ayırmak</td><td><code>Split</code></td></tr>
<tr><td>Export yolu oluşturmak</td><td><code>+</code> ve <code>$"..."</code></td></tr>
</table>`,
    },
    {
      kind: 'visual',
      title: 'Bir string\'in içi: karakterler ve indeksler',
      svg: `
<svg viewBox="0 0 760 245" role="img" aria-label="SM_Chair_LOD0 metninin karakterleri, indeksleri ve Substring örneği">
  <defs><marker id="ar-l04" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <text x="330" y="28" class="t2">name.Substring(3, 5) → "Chair"  (3. indeksten başla, 5 karakter al)</text>
    <line x1="205" y1="44" x2="455" y2="44" stroke="var(--accent)" stroke-width="2"/>
    <line x1="205" y1="44" x2="205" y2="58" stroke="var(--accent)" stroke-width="2"/>
    <line x1="455" y1="44" x2="455" y2="58" stroke="var(--accent)" stroke-width="2"/>
    <rect x="55" y="62" width="50" height="50" class="box"/><text x="80" y="93" class="t1">S</text>
    <rect x="105" y="62" width="50" height="50" class="box"/><text x="130" y="93" class="t1">M</text>
    <rect x="155" y="62" width="50" height="50" class="box dim"/><text x="180" y="93" class="t1">_</text>
    <rect x="205" y="62" width="50" height="50" class="box hi"/><text x="230" y="93" class="t1">C</text>
    <rect x="255" y="62" width="50" height="50" class="box hi"/><text x="280" y="93" class="t1">h</text>
    <rect x="305" y="62" width="50" height="50" class="box hi"/><text x="330" y="93" class="t1">a</text>
    <rect x="355" y="62" width="50" height="50" class="box hi"/><text x="380" y="93" class="t1">i</text>
    <rect x="405" y="62" width="50" height="50" class="box hi"/><text x="430" y="93" class="t1">r</text>
    <rect x="455" y="62" width="50" height="50" class="box dim"/><text x="480" y="93" class="t1">_</text>
    <rect x="505" y="62" width="50" height="50" class="box"/><text x="530" y="93" class="t1">L</text>
    <rect x="555" y="62" width="50" height="50" class="box"/><text x="580" y="93" class="t1">O</text>
    <rect x="605" y="62" width="50" height="50" class="box"/><text x="630" y="93" class="t1">D</text>
    <rect x="655" y="62" width="50" height="50" class="box"/><text x="680" y="93" class="t1">0</text>
    <g class="t3">
      <text x="80" y="130">0</text><text x="130" y="130">1</text><text x="180" y="130">2</text><text x="230" y="130">3</text><text x="280" y="130">4</text><text x="330" y="130">5</text><text x="380" y="130">6</text><text x="430" y="130">7</text><text x="480" y="130">8</text><text x="530" y="130">9</text><text x="580" y="130">10</text><text x="630" y="130">11</text><text x="680" y="130">12</text>
    </g>
    <line x1="80" y1="172" x2="80" y2="140" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l04)"/>
    <text x="80" y="190" class="t2">name[0] → 'S'</text>
    <line x1="180" y1="172" x2="180" y2="140" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l04)"/>
    <text x="215" y="190" class="t2">IndexOf('_') → 2</text>
    <line x1="480" y1="172" x2="480" y2="140" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l04)"/>
    <text x="440" y="190" class="t2">LastIndexOf('_') → 8</text>
    <line x1="680" y1="172" x2="680" y2="140" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l04)"/>
    <text x="640" y="190" class="t2">name[name.Length - 1] → '0'</text>
    <text x="380" y="228" class="t2">name.Length = 13 → geçerli indeksler 0 … 12</text>
  </g>
</svg>`,
      caption: `
<p>String bellekte karakterlerin yan yana dizildiği bir şerittir — tıpkı bir UV adasındaki pikseller gibi, her birinin bir <b>konumu</b> vardır. <code>name[3]</code> "3 numaralı kutudaki karakteri ver" demektir ve sonuç bir <code>char</code>'dır.</p>
<p><b>Neden 0'dan?</b> İndeks aslında "baştan kaç adım ileride?" sorusunun cevabıdır. İlk karakter baştan 0 adım uzaktadır. Bu yüzden son karakterin indeksi <code>Length - 1</code>'dir.</p>`,
    },
    {
      kind: 'code',
      title: 'Birleştirme ve ara değer yerleştirme ($"...")',
      code: cs`string prefix = "SM";
string assetName = "Chair";
int lod = 0;

string fullName = prefix + "_" + assetName + "_LOD" + lod;
Console.WriteLine(fullName);

int triCount = 12480;
double sizeMb = 3.14159;
Console.WriteLine($"{fullName}: {triCount} üçgen, {sizeMb:F2} MB");
Console.WriteLine($"Toplam: {triCount:N0} üçgen");
Console.WriteLine($"Yarı boyut: {sizeMb * 0.5:F1} MB");`,
      explain: {
        5: `<b>Birleştirme</b> (<t en="concatenation" ja="連結">concatenation</t>) <code>+</code> ile yapılır. Soldan sağa işlenir; string'e eklenen int (<code>lod</code>) otomatik olarak metne çevrilir. Sonuç <b>yeni</b> bir string: "SM_Chair_LOD0".`,
        10: `<b>Ara değer yerleştirme</b> (<t en="string interpolation" ja="文字列補間">string interpolation</t>): Tırnağın önündeki <code>$</code>, süslü parantez içlerinin <b>kod</b> olarak değerlendirileceğini söyler. <code>{sizeMb:F2}</code> → iki ondalık basamak: "3.14". Uzun + zincirlerinden çok daha okunaklıdır.`,
        11: `<code>:N0</code> → binlik ayırıcılı, ondalıksız sayı: "12,480". (Bu platform sayıları InvariantCulture ile biçimlendirir: ondalık ayırıcı nokta, binlik ayırıcı virgül.)`,
        12: `Süslü parantezin içine <b>herhangi bir ifade</b> yazabilirsin: önce <code>sizeMb * 0.5</code> hesaplanır (1.570795), sonra <code>F1</code> ile 1 basamağa yuvarlanarak yazılır: "1.6".`,
      },
      runnable: true,
      stepper: true,
      note: 'Diğer biçimler: {x:F3} üç basamak, {n:D3} sayıyı 3 haneye sıfırla tamamlar (7 → 007), {r:P0} yüzde. Dene: $"LOD{lod:D2}" ne yazar?',
    },
    {
      kind: 'code',
      title: 'Kaçış dizileri ve @"..." (verbatim) yazımı',
      code: cs`Console.WriteLine("Obje\tVertex\tYüz");
Console.WriteLine("Cube\t8\t6");
Console.WriteLine("Satır 1\nSatır 2");
Console.WriteLine("Dosya: \"chair.fbx\"");
Console.WriteLine("C:\\Projeler\\Sahne\\chair.fbx");
Console.WriteLine(@"C:\Projeler\Sahne\chair.fbx");
Console.WriteLine(@"Verbatim içinde ""tırnak"" böyle yazılır");`,
      explain: {
        1: `<code>&#92;t</code> = sekme (tab). Ters eğik çizgi (<code>&#92;</code>) "sonraki karakter özel anlamlı" demektir. Bu ikiliye <t en="escape sequence" ja="エスケープシーケンス">kaçış dizisi</t> denir.`,
        2: `Sekmeler sütunları hizalar — basit bir tablo.`,
        3: `<code>&#92;n</code> = yeni satır. Tek bir WriteLine iki satır üretir.`,
        4: `Metnin içine çift tırnak koymak için <code>&#92;"</code>. Yoksa derleyici metnin orada bittiğini sanır.`,
        5: `Ters eğik çizginin kendisi için <code>&#92;&#92;</code> (iki tane). Windows dosya yollarında çok can sıkıcıdır…`,
        6: `…bu yüzden <b>@"..."</b> (<t en="verbatim string" ja="逐語的文字列">verbatim string</t>) var: içinde kaçış dizileri işlenmez, <code>&#92;</code> olduğu gibi kalır. Dosya yolları için idealdir.`,
        7: `Verbatim içinde tırnak karakteri için tırnağı iki kez yazarsın: <code>""</code>.`,
      },
      runnable: true,
    },
    {
      kind: 'code',
      title: 'Uzunluk, indeks ve parça çıkarma',
      code: cs`string name = "SM_Chair_LOD0";
Console.WriteLine(name.Length);
Console.WriteLine(name[0]);
Console.WriteLine(name[name.Length - 1]);

int firstUnderscore = name.IndexOf('_');
int lastUnderscore = name.LastIndexOf('_');
Console.WriteLine(firstUnderscore + " ve " + lastUnderscore);

string core = name.Substring(3, 5);
string lodPart = name.Substring(lastUnderscore + 1);
Console.WriteLine(core);
Console.WriteLine(lodPart);
Console.WriteLine(name.IndexOf("X"));`,
      explain: {
        2: `<code>Length</code> karakter sayısıdır: 13. Bir <b>özellik</b>tir (property), bu yüzden parantez yok.`,
        3: `<code>name[0]</code> → ilk karakter, tipi <code>char</code>: 'S'.`,
        4: `Son karakter her zaman <code>Length - 1</code> indeksindedir → '0'. <code>name[13]</code> yazsaydık program çökerdi.`,
        6: `<code>IndexOf</code> aranan karakterin/metnin <b>ilk</b> geçtiği indeksi döndürür: 2.`,
        7: `<code>LastIndexOf</code> <b>son</b> geçtiği indeksi döndürür: 8. Dosya uzantısını bulmak için çok kullanışlı (<code>LastIndexOf('.')</code>).`,
        10: `<code>Substring(başlangıç, uzunluk)</code>: 3. indeksten başla, <b>5 karakter</b> al → "Chair". İkinci sayı bitiş indeksi DEĞİL, uzunluktur!`,
        11: `Tek parametreyle: o indeksten <b>sonuna kadar</b> al → "LOD0". Son alt çizginin bir sağından başlıyoruz.`,
        14: `Bulunamazsa <code>IndexOf</code> <b>-1</b> döndürür. (Geçerli hiçbir indeks negatif olamayacağı için "yok" anlamında kullanılır.)`,
      },
      runnable: true,
      stepper: true,
      note: 'Stepper\'da firstUnderscore ve lastUnderscore değerlerini görselle karşılaştır. Sonra name\'i "SM_Table_LOD12" yap: hangi satırlar hâlâ doğru çalışıyor, hangisi sabit sayılar yüzünden bozuluyor?',
    },
    {
      kind: 'code',
      title: 'Arama ve dönüştürme metotları',
      code: cs`string raw = "  T_Wood_BaseColor.png  ";
string file = raw.Trim();
Console.WriteLine("[" + file + "]");

Console.WriteLine(file.StartsWith("T_"));
Console.WriteLine(file.EndsWith(".png"));
Console.WriteLine(file.Contains("wood"));
Console.WriteLine(file.ToLower().Contains("wood"));

Console.WriteLine(file.ToUpper());
Console.WriteLine(file.Replace("BaseColor", "Normal"));

string[] parts = file.Split('_');
Console.WriteLine(parts[1]);`,
      explain: {
        2: `<code>Trim()</code> baştaki ve sondaki boşlukları atar. Kullanıcı girdisinde ve kopyala-yapıştır isimlerde hayat kurtarır.`,
        3: `Köşeli parantezler sadece boşlukların gittiğini görmek için.`,
        5: `<code>StartsWith</code> → <code>bool</code>: bu bir texture mı? True.`,
        6: `<code>EndsWith</code> → uzantı kontrolü: True.`,
        7: `<b>False!</b> Karşılaştırmalar büyük/küçük harfe duyarlıdır: "Wood" ≠ "wood".`,
        8: `Çözüm: önce ikisini de aynı harf düzenine getir. <code>ToLower()</code> yeni bir küçük harfli string üretir, sonra onda ararız → True. Metotlar zincirlenebilir.`,
        10: `<code>ToUpper()</code> tamamen büyük harfli <b>yeni</b> bir string döndürür; <code>file</code> değişmez.`,
        11: `<code>Replace(eski, yeni)</code>: tüm eşleşmeleri değiştirir — Blender'daki toplu yeniden adlandırmanın kod hâli.`,
        13: `<code>Split('_')</code> metni ayırıcıdan böler ve parçaları bir <b>dizi</b> (<code>string[]</code>) içinde döndürür: "T", "Wood", "BaseColor.png". Dizileri Ders 11'de ayrıntılı göreceğiz.`,
        14: `<code>parts[1]</code> → ikinci parça (indeksler yine 0'dan başlar): "Wood".`,
      },
      runnable: true,
      stepper: true,
    },
    {
      kind: 'predict',
      title: 'Tahmin et: String değişti mi?',
      code: cs`string mat = "m_steel";
mat.ToUpper();
Console.WriteLine(mat);
mat = mat.ToUpper();
Console.WriteLine(mat);`,
      options: ['m_steel\nM_STEEL', 'M_STEEL\nM_STEEL', 'm_steel\nm_steel', 'M_STEEL\nm_steel'],
      answer: 0,
      explain: 'String\'ler <b>değiştirilemez</b> (immutable). 2. satırdaki <code>ToUpper()</code> yeni bir "M_STEEL" üretir ama onu hiçbir kutuya koymadığımız için hemen kaybolur; <code>mat</code> hâlâ "m_steel". 4. satırda sonucu <code>mat</code>\'a <b>yeniden atadık</b>, şimdi değişti. Kural: string metotlarının sonucunu her zaman bir değişkene ata.',
    },
    {
      kind: 'warning',
      title: 'String tuzakları',
      body: `
<ol>
<li><b>Sonucu atamayı unutmak:</b> <code>name.Replace("A", "B");</code> tek başına hiçbir şeyi değiştirmez → <code>name = name.Replace("A", "B");</code></li>
<li><b>Son indeks:</b> Geçerli indeksler <code>0 … Length - 1</code>. <code>s[s.Length]</code> → <code>IndexOutOfRangeException</code> (çalışma anı hatası).</li>
<li><b>Substring'in ikinci parametresi uzunluktur</b>, bitiş indeksi değil. Fazla uzun isteyince <code>ArgumentOutOfRangeException</code>.</li>
<li><b>+ sırası:</b> <code>"Toplam: " + 4 + 4</code> → <code>"Toplam: 44"</code> (soldan sağa birleştirme). Doğrusu <code>"Toplam: " + (4 + 4)</code> ya da <code>$"Toplam: {4 + 4}"</code>.</li>
<li><b>char + char = sayı!</b> <code>'c' + 'x'</code> iki karakter kodunu toplar (219). Araya bir string koy: <code>'c' + " " + 'x'</code>.</li>
<li><b>Türkçe I sorunu:</b> Gerçek .NET'te <code>ToUpper()/ToLower()</code> bilgisayarın dil ayarını kullanır. Türkçe Windows'ta <code>"file".ToUpper()</code> → <code>"FİLE"</code> olur ve uzantı karşılaştırmaları bozulur! Dosya adı, uzantı, kod tanımlayıcısı gibi teknik metinlerde <code>ToUpperInvariant()</code> / <code>ToLowerInvariant()</code> kullan.</li>
</ol>
<p>Aşağıdaki kod derlenir ama çalışırken çöker. Hatayı bul ve düzelt; çıktı <code>c x</code> olmalı.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Son karakter',
      code: cs`string file = "chair.fbx";
char first = file[0];
char last = file[file.Length];
Console.WriteLine(first + " " + last);`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: '"chair.fbx" 9 karakterdir: indeksler 0 … 8.',
        3: 'file.Length = 9. Ama 9 numaralı kutu yok! → IndexOutOfRangeException.',
        4: 'Araya " " konduğu için char\'lar metin olarak birleşir (sayı olarak toplanmaz).',
      },
      note: 'İpucu: Son karakterin indeksi, uzunluktan bir eksiktir.',
    },
    {
      kind: 'cad',
      title: 'CAD/BIM\'de metin: katmanlar, dosyalar ve Japonca',
      body: `
<p>CAD/BIM yazılımlarında string'ler her yerdedir: katman (<t en="layer" ja="レイヤー">layer</t>) adları, blok/aile isimleri, oda adları, dosya yolları ve uzantılar (<code>.dwg</code>, <code>.dxf</code>, <code>.ifc</code>), dışa aktarma raporları. Bir dosyanın uzantısına bakıp hangi okuyucunun (importer) çalışacağına karar vermek, bugün öğrendiğin <code>LastIndexOf</code> + <code>Substring</code> + <code>ToLowerInvariant</code> üçlüsüyle yapılır.</p>
<p><b>Japonca metin:</b> C# string'leri Unicode'dur (UTF-16). <code>"壁_A"</code> (壁 = kabe = duvar) sorunsuz çalışır, <code>Length</code> 3'tür. Ama Japonya'da bazı eski dosyalar ve sistemler hâlâ <b>Shift_JIS</b> <t en="character encoding" ja="文字コード">karakter kodlaması</t> kullanır. Dosya yanlış kodlamayla okunursa metin anlamsız sembollere döner: buna Japonca <b>文字化け</b> (mojibake) denir.</p>
<p>Bir de <b>全角/半角</b> (tam genişlik / yarım genişlik) farkı var: Japonca klavyeyle yazılmış <code>"１２３"</code> ile <code>"123"</code> bilgisayar için <b>farklı karakterlerdir</b>. Kullanıcı girdisini işleyen yazılımlar bu farkı hesaba katmak zorundadır.</p>`,
    },
  ],
  exercise: {
    title: 'Export dosya adı üretici',
    prompt: `
<p>Program iki satır okusun: <b>ham asset adı</b> (başında/sonunda boşluk olabilir, harf düzeni karışık olabilir) ve <b>LOD numarası</b>. Asset adını "ilk harf büyük, gerisi küçük" biçimine getir ve export dosya adını üret. Girdi <code>"  chair  "</code> ve <code>2</code> iken:</p>
<pre class="expected">Ad: Chair
Dosya: SM_Chair_LOD2.fbx
Karakter sayısı: 17</pre>
<ul>
<li>"Dosya" satırını <b>$"..."</b> (interpolation) ile üret.</li>
<li>"Karakter sayısı", oluşturduğun dosya adının uzunluğudur.</li>
<li>Farklı girdilerle de çalışmalı: <code>"   LAMP"</code> ve <code>1</code> → <code>Lamp</code>, <code>SM_Lamp_LOD1.fbx</code>, <code>16</code>.</li>
</ul>`,
    stdin: '  chair  \n2',
    starter: cs`string raw = Console.ReadLine();
string lod = Console.ReadLine();

// 1) boşlukları temizle
// 2) ilk harf büyük + gerisi küçük
// 3) dosya adını oluştur ve yazdır
`,
    checks: [
      { type: 'output', expect: 'Ad: Chair\nDosya: SM_Chair_LOD2.fbx\nKarakter sayısı: 17', msg: '"  chair  " / 2 girdisiyle üç satır birebir aynı olmalı' },
      { type: 'output', stdin: '   LAMP\n1', expect: 'Ad: Lamp\nDosya: SM_Lamp_LOD1.fbx\nKarakter sayısı: 16', msg: 'Farklı girdiyle ("   LAMP" / 1) de doğru çalışmalı' },
      { type: 'code', pattern: '\\.Trim\\s*\\(', msg: 'Boşlukları Trim() ile temizlemelisin' },
      { type: 'code', pattern: '\\.Substring\\s*\\(', msg: 'İlk harfi ve geri kalanı ayırmak için Substring kullanmalısın' },
      { type: 'code', pattern: '\\$"', msg: 'Dosya adını $"..." (interpolation) ile oluşturmalısın' },
      { type: 'code', pattern: '\\.Length', msg: 'Karakter sayısını Length ile bulmalısın' },
    ],
    hints: [
      'Adımlara böl: önce <code>Trim()</code>, sonra ilk karakter ve geri kalanı ayrı ayrı ele al. Her adımın sonucunu bir değişkene ata (string\'ler değiştirilemez!).',
      'İlk harf: <code>Substring(0, 1)</code> → bir harflik string; buna <code>ToUpper()</code> uygula. Geri kalan: <code>Substring(1)</code> → buna <code>ToLower()</code> uygula. İkisini + ile birleştir.',
      'Dosya adı kalıbı: <code>$"SM_{...}_LOD{...}.fbx"</code>. Bu sonucu bir değişkene koyarsan hem yazdırabilir hem de <code>.Length</code>\'ini alabilirsin.',
    ],
    solution: cs`string raw = Console.ReadLine();
string lod = Console.ReadLine();

string trimmed = raw.Trim();
string name = trimmed.Substring(0, 1).ToUpper() + trimmed.Substring(1).ToLower();
string fileName = $"SM_{name}_LOD{lod}.fbx";

Console.WriteLine("Ad: " + name);
Console.WriteLine("Dosya: " + fileName);
Console.WriteLine("Karakter sayısı: " + fileName.Length);`,
    explain: 'Her metot yeni bir string üretti ve biz sonucu bir sonraki adıma aktardık: Trim → Substring/ToUpper/ToLower → interpolation → Length. Gerçek export script\'leri de tam olarak böyle, küçük ve zincirlenmiş adımlardan oluşur. (Gerçek bir projede harf dönüşümü için ToUpperInvariant/ToLowerInvariant tercih edilir.)',
  },
  quiz: [
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine("SM_Chair".Length);`,
      verifyOutput: true,
      options: [
        { t: '8', correct: true, why: 'Doğru. S, M, _, C, h, a, i, r → 8 karakter. Alt çizgi de bir karakterdir.' },
        { t: '7', why: 'Length son indeks değil, karakter sayısıdır. Son indeks 7, uzunluk 8.' },
        { t: '9', why: 'Tırnaklar metnin parçası değildir; sadece başını ve sonunu işaretler.' },
        { t: 'Derleme hatası: Length() yazılmalı', why: 'Length bir özelliktir (property), metot değil; parantez almaz.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine("T_Wood_Normal".Substring(2, 4));`,
      verifyOutput: true,
      options: [
        { t: 'Wood', correct: true, why: 'Doğru. 2. indeks \'W\' harfidir ve oradan 4 karakter alınır: W, o, o, d.' },
        { t: '_Woo', why: 'İndeksler 0\'dan başlar: 0 = T, 1 = _, 2 = W.' },
        { t: 'Wo', why: 'İkinci parametre bitiş indeksi değil, alınacak karakter sayısıdır (4).' },
        { t: 'Wood_', why: 'Tam olarak 4 karakter alınır; alt çizgi 5. karakter olurdu.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine("LOD" + 1 + 2);
Console.WriteLine(1 + 2 + "LOD");`,
      verifyOutput: true,
      options: [
        { t: 'LOD12\n3LOD', correct: true, why: 'Doğru. + soldan sağa işlenir. İlkinde önce "LOD" + 1 = "LOD1" (string), sonra + 2 = "LOD12". İkincide önce 1 + 2 = 3 (sayı), sonra "3LOD".' },
        { t: 'LOD3\n3LOD', why: '"LOD" + 1 zaten bir string üretir; ardından gelen + 2 de birleştirme olur, toplama değil.' },
        { t: 'LOD12\n12LOD', why: 'İkinci satırda ilk işlem 1 + 2\'dir ve ikisi de sayı olduğu için toplanır: 3.' },
        { t: 'LOD3\n3LOD', why: 'İlk satırda toplama hiç yapılmaz; string bir kez başladığında + birleştirme anlamına gelir.' },
      ],
    },
    {
      q: '<code>name.Replace("_", "-");</code> satırından sonra <code>name</code> neden değişmemiş görünür?',
      options: [
        { t: 'String\'ler değiştirilemez; Replace yeni bir string döndürür ve bu sonuç hiçbir değişkene atanmamıştır', correct: true, why: 'Doğru. name = name.Replace("_", "-"); yazmak gerekir.' },
        { t: 'Replace sadece tek karakterle çalışır', why: 'Replace hem char hem de string ile çalışır. Sorun dönüş değerinin kullanılmaması.' },
        { t: 'Replace sadece ilk eşleşmeyi değiştirir', why: 'Replace tüm eşleşmeleri değiştirir. Ama sonucu atamadığın için hiçbirini göremezsin.' },
        { t: 'Alt çizgi özel bir karakter olduğu için kaçış gerekir', why: '_ sıradan bir karakterdir; kaçış dizisi gerekmez.' },
      ],
    },
    {
      q: 'Ekrana <code>C:\\Models\\tree.obj</code> yazdırmak için hangisi DOĞRU?',
      options: [
        { t: 'Console.WriteLine(@"C:\\Models\\tree.obj");', correct: true, why: 'Doğru. @"..." (verbatim) içinde ters eğik çizgi özel anlam taşımaz, olduğu gibi yazılır.' },
        { t: 'Console.WriteLine("C:\\Models\\tree.obj");', why: 'Normal string\'de \\ kaçış başlatır; \\M ve \\t geçersiz ya da farklı anlamlıdır (\\t = sekme!). Ya @ kullan ya da \\\\ yaz.' },
        { t: 'Console.WriteLine(\'C:\\Models\\tree.obj\');', why: 'Tek tırnak sadece tek bir char içindir; metin için çift tırnak gerekir.' },
        { t: 'Console.WriteLine($"C:\\Models\\tree.obj");', why: '$ interpolation içindir; ters eğik çizgileri kaçış dizisi olmaktan kurtarmaz.' },
      ],
    },
    {
      q: 'Bir dosya adının uzantısını (son noktadan sonrasını) bulmak için en güvenilir yol hangisi? Örn. "sahne.v2.blend"',
      options: [
        { t: 'file.Substring(file.LastIndexOf(\'.\') + 1)', correct: true, why: 'Doğru. LastIndexOf son noktayı bulur; +1 noktanın kendisini atlar → "blend".' },
        { t: 'file.Substring(file.IndexOf(\'.\') + 1)', why: 'IndexOf ilk noktayı bulur; "sahne.v2.blend" için "v2.blend" döner.' },
        { t: 'file.Split(\'.\')[1]', why: 'İkinci parçayı verir: "v2". Birden fazla nokta olan isimlerde yanlış sonuç.' },
        { t: 'file.Substring(file.Length - 3)', why: 'Sadece 3 harfli uzantılarda çalışır; "blend" 5 harflidir, "ifc" ise 3. Sabit sayılar kırılgandır.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Texture adı ayrıştırıcı',
    prompt: `
<p>Texture dosya adları <code>T_&lt;Malzeme&gt;_&lt;Harita&gt;.&lt;uzantı&gt;</code> düzenindedir; malzeme adının içinde de alt çizgi olabilir. Girdiden bir dosya adı oku ve parçalarına ayır. Ayrıca aynı malzemenin <b>Normal</b> haritasının dosya adını üret. Girdi <code>T_Wood_Oak_BaseColor.png</code> iken:</p>
<pre class="expected">Tip: T
Malzeme: Wood_Oak
Harita: BaseColor
Uzantı: PNG
Normal: T_Wood_Oak_Normal.png</pre>
<p>Başka bir örnek: <code>T_Metal_Roughness.tga</code> → Malzeme <code>Metal</code>, Harita <code>Roughness</code>, Uzantı <code>TGA</code>, Normal <code>T_Metal_Normal.tga</code>.</p>`,
    stdin: 'T_Wood_Oak_BaseColor.png',
    starter: cs`string file = Console.ReadLine();
// IndexOf, LastIndexOf ve Substring ile parçala
`,
    checks: [
      { type: 'output', expect: 'Tip: T\nMalzeme: Wood_Oak\nHarita: BaseColor\nUzantı: PNG\nNormal: T_Wood_Oak_Normal.png', msg: 'T_Wood_Oak_BaseColor.png için beş satır birebir aynı olmalı' },
      { type: 'output', stdin: 'T_Metal_Roughness.tga', expect: 'Tip: T\nMalzeme: Metal\nHarita: Roughness\nUzantı: TGA\nNormal: T_Metal_Normal.tga', msg: 'T_Metal_Roughness.tga girdisiyle de doğru çalışmalı' },
      { type: 'output', stdin: 'TX_Brick_Old_Wall_Height.exr', expect: 'Tip: TX\nMalzeme: Brick_Old_Wall\nHarita: Height\nUzantı: EXR\nNormal: TX_Brick_Old_Wall_Normal.exr', msg: 'Önek ve malzeme adı uzunluğu değişse de çalışmalı (sabit indeksler kullanma)' },
      { type: 'code', pattern: 'LastIndexOf', msg: 'Son alt çizgiyi ve son noktayı bulmak için LastIndexOf kullanmalısın' },
      { type: 'code', pattern: 'Substring', msg: 'Parçaları Substring ile çıkarmalısın' },
    ],
    hints: [
      'Üç önemli konumu bul ve değişkenlere koy: ilk alt çizgi, son alt çizgi, son nokta. Tüm parçalar bu üç sayıyla tanımlanabilir.',
      'Malzeme ilk alt çizginin bir sağından başlar ve son alt çizgiden önce biter. Substring\'in ikinci parametresi uzunluk olduğu için: uzunluk = bitiş − başlangıç.',
      'Normal adı = son alt çizgiye kadar olan kısım (alt çizgi dahil) + "Normal" + noktadan itibaren olan kısım (nokta dahil). Uzantı için noktadan sonrasını büyük harfe çevir.',
    ],
    solution: cs`string file = Console.ReadLine();

int first = file.IndexOf('_');
int last = file.LastIndexOf('_');
int dot = file.LastIndexOf('.');

string type = file.Substring(0, first);
string material = file.Substring(first + 1, last - first - 1);
string map = file.Substring(last + 1, dot - last - 1);
string ext = file.Substring(dot + 1).ToUpper();
string normalName = file.Substring(0, last + 1) + "Normal" + file.Substring(dot);

Console.WriteLine("Tip: " + type);
Console.WriteLine("Malzeme: " + material);
Console.WriteLine("Harita: " + map);
Console.WriteLine("Uzantı: " + ext);
Console.WriteLine("Normal: " + normalName);`,
    explain: 'Sabit indeksler yerine IndexOf/LastIndexOf ile bulunan konumları kullandığın için kod her uzunluktaki isimde çalışır. Pipeline araçları (texture import, otomatik malzeme kurulumu) bu tür ayrıştırmayı sürekli yapar.',
  },
  extras: [
    {
      difficulty: 1,
      title: 'Asset özeti',
      prompt: `<p>Başlangıç kodundaki değişkenleri <b>interpolation</b> ile tek satırda yazdır; boyut iki ondalık basamaklı olsun:</p><pre class="expected">SM_Rock | 842 tris | 1.26 MB</pre>`,
      starter: cs`string name = "SM_Rock";
int tris = 842;
double sizeMb = 1.256;
// tek bir Console.WriteLine ve $"..." ile yazdır
`,
      checks: [
        { type: 'output', expect: 'SM_Rock | 842 tris | 1.26 MB' },
        { type: 'code', pattern: '\\$"', msg: '$"..." kullanmalısın' },
        { type: 'code', pattern: ':F2', msg: 'İki basamak için {sizeMb:F2} biçimini kullanmalısın' },
        { type: 'notCode', pattern: '1\\.26|SM_Rock \\|', msg: 'Değerleri metne elle yazma; değişkenleri süslü parantez içinde kullan' },
      ],
      hints: ['Kalıp: <code>$"{name} | ..."</code>', 'Biçim belirteci iki noktadan sonra gelir: <code>{sizeMb:F2}</code>.'],
      solution: cs`string name = "SM_Rock";
int tris = 842;
double sizeMb = 1.256;
Console.WriteLine($"{name} | {tris} tris | {sizeMb:F2} MB");`,
    },
    {
      difficulty: 2,
      title: 'Ad ve uzantı',
      prompt: `<p>Girdiden bir dosya adı oku; uzantısız adı ve <b>büyük harfli</b> uzantıyı yazdır. Adın içinde birden fazla nokta olabilir! Girdi <code>rock_diffuse.jpg</code> iken:</p><pre class="expected">Ad: rock_diffuse
Uzantı: JPG</pre>`,
      stdin: 'rock_diffuse.jpg',
      starter: cs`string file = Console.ReadLine();
`,
      checks: [
        { type: 'output', expect: 'Ad: rock_diffuse\nUzantı: JPG' },
        { type: 'output', stdin: 'sahne.v2.blend', expect: 'Ad: sahne.v2\nUzantı: BLEND', msg: 'Birden fazla nokta içeren adlarda (sahne.v2.blend) da doğru çalışmalı' },
      ],
      hints: ['Uzantıyı ayıran nokta <b>son</b> noktadır.', '<code>int dot = file.LastIndexOf(\'.\');</code> — ad: 0\'dan dot uzunluğunda; uzantı: dot + 1\'den sonuna.'],
      solution: cs`string file = Console.ReadLine();
int dot = file.LastIndexOf('.');
Console.WriteLine("Ad: " + file.Substring(0, dot));
Console.WriteLine("Uzantı: " + file.Substring(dot + 1).ToUpper());`,
    },
    {
      difficulty: 3,
      title: 'Windows yolunu dönüştür',
      prompt: `<p>Girdiden bir Windows dosya yolu oku (ör. <code>C:&#92;Projeler&#92;Bina&#92;Kat1&#92;plan.dwg</code>). Üç satır yazdır: ters eğik çizgileri <code>/</code> ile değiştirilmiş yol, sadece dosya adı ve klasör derinliği (sürücü ve dosya hariç klasör sayısı):</p>
<pre class="expected">C:/Projeler/Bina/Kat1/plan.dwg
Dosya: plan.dwg
Klasör derinliği: 3</pre>
<p class="muted">C# kodunda ters eğik çizgi karakteri <code>'&#92;&#92;'</code> diye yazılır.</p>`,
      stdin: 'C:\\Projeler\\Bina\\Kat1\\plan.dwg',
      starter: cs`string path = Console.ReadLine();
`,
      checks: [
        { type: 'output', expect: 'C:/Projeler/Bina/Kat1/plan.dwg\nDosya: plan.dwg\nKlasör derinliği: 3' },
        { type: 'output', stdin: 'D:\\Work\\scene.blend', expect: 'D:/Work/scene.blend\nDosya: scene.blend\nKlasör derinliği: 1', msg: 'Farklı bir yolla da doğru çalışmalı' },
        { type: 'code', pattern: 'Split', msg: 'Klasör derinliği için Split kullanmalısın' },
      ],
      hints: ['<code>path.Replace(\'&#92;&#92;\', \'/\')</code> ile başla. Dosya adı son ters eğik çizgiden sonrasıdır.', '<code>path.Split(\'&#92;&#92;\')</code> kaç parça döndürür? <code>.Length</code> ile bul; sürücü ("C:") ve dosya adı klasör değildir.'],
      solution: cs`string path = Console.ReadLine();
Console.WriteLine(path.Replace('\\', '/'));
Console.WriteLine("Dosya: " + path.Substring(path.LastIndexOf('\\') + 1));
string[] parts = path.Split('\\');
Console.WriteLine("Klasör derinliği: " + (parts.Length - 2));`,
    },
  ],
  vocab: [
    { en: 'String', tr: 'Metin (karakter dizisi)', ja: '文字列', kana: 'もじれつ', romaji: 'mojiretsu' },
    { en: 'Concatenation', tr: 'Birleştirme', ja: '連結', kana: 'れんけつ', romaji: 'renketsu' },
    { en: 'String interpolation', tr: 'Ara değer yerleştirme', ja: '文字列補間', kana: 'もじれつほかん', romaji: 'mojiretsu hokan' },
    { en: 'Escape sequence', tr: 'Kaçış dizisi', ja: 'エスケープシーケンス', kana: 'エスケープシーケンス', romaji: 'esukēpu shīkensu' },
    { en: 'Index', tr: 'İndeks (sıra numarası)', ja: 'インデックス', kana: 'インデックス', romaji: 'indekkusu' },
    { en: 'Immutable', tr: 'Değiştirilemez', ja: '不変', kana: 'ふへん', romaji: 'fuhen' },
    { en: 'File extension', tr: 'Dosya uzantısı', ja: '拡張子', kana: 'かくちょうし', romaji: 'kakuchōshi' },
    { en: 'Path', tr: 'Dosya yolu', ja: 'パス', kana: 'パス', romaji: 'pasu' },
    { en: 'Layer', tr: 'Katman', ja: 'レイヤー', kana: 'レイヤー', romaji: 'reiyā' },
    { en: 'Character encoding', tr: 'Karakter kodlaması', ja: '文字コード', kana: 'もじコード', romaji: 'moji kōdo' },
    { en: 'Mojibake (garbled text)', tr: 'Bozuk karakterler', ja: '文字化け', kana: 'もじばけ', romaji: 'mojibake' },
    { en: 'Full-width / half-width', tr: 'Tam / yarım genişlik', ja: '全角 / 半角', kana: 'ぜんかく / はんかく', romaji: 'zenkaku / hankaku' },
  ],
  summary: [
    'string, sıralı char\'lardan oluşur; indeksler 0\'dan başlar, son indeks Length - 1\'dir.',
    '+ soldan sağa birleştirir ("LOD" + 1 + 2 = "LOD12"); $"...{x:F2}..." daha okunaklıdır ve biçim belirteçleri alır.',
    'Kaçış dizileri: \\n, \\t, \\", \\\\. Dosya yollarında @"..." (verbatim) kullan.',
    'IndexOf/LastIndexOf konum bulur (-1 = yok); Substring(başlangıç, UZUNLUK) parça çıkarır; Split metni parçalara böler.',
    'Contains/StartsWith/EndsWith büyük/küçük harfe duyarlıdır; teknik metinlerde ToLowerInvariant ile normalize et.',
    'String\'ler değiştirilemez: Replace, ToUpper, Trim… yeni string döndürür — sonucu mutlaka bir değişkene ata.',
  ],
};
