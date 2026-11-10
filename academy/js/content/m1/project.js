import { cs } from '../helpers.js';

// Adımlar birbirinin üzerine kurulur: her adımın başlangıç kodu, önceki adımın çözümüdür.
// Tekrarı azaltmak için ortak kod parçaları burada bir kez tanımlanıp birleştirilir.

const F_HEADER = cs`void PrintHeader(string title)
{
    Console.WriteLine(title);
    string underline = "";
    for (int i = 0; i < title.Length; i++)
    {
        underline += "=";
    }
    Console.WriteLine(underline);
}
`;

const F_TRIS = cs`
int QuadsToTris(int quads)
{
    return quads * 2;
}

int ToTris(string kind, int count)
{
    if (kind == "tri") return count;
    if (kind == "quad") return QuadsToTris(count);
    throw new ArgumentException("bilinmeyen tür: " + kind);
}
`;

const F_PLATFORM = cs`
int PlatformBudget(string platform)
{
    switch (platform.Trim().ToLower())
    {
        case "mobile": return 100000;
        case "console": return 1000000;
        case "pc": return 2000000;
        default: return -1;
    }
}
`;

const F_PRINT_OBJECTS = cs`
void PrintObjects(List<string> names, List<int> tris)
{
    for (int i = 0; i < names.Count; i++)
    {
        Console.WriteLine("- " + names[i] + ": " + tris[i] + " üçgen");
    }
}
`;

const F_CHECK = cs`
string CheckLine(string text)
{
    string[] fields = text.Trim().Split(' ');
    if (fields.Length != 3) return "3 alan bekleniyordu";
    if (!int.TryParse(fields[2], out int count)) return "sayı değil: " + fields[2];
    if (count < 0) return "negatif sayı";
    return "ok";
}
`;

const F_STATS = cs`
int Sum(List<int> values)
{
    int sum = 0;
    foreach (int v in values)
    {
        sum += v;
    }
    return sum;
}

int IndexOfMax(List<int> values)
{
    int best = 0;
    for (int i = 1; i < values.Count; i++)
    {
        if (values[i] > values[best]) best = i;
    }
    return best;
}

string Classify(int tris, int limit)
{
    double ratio = (double)tris / limit;
    if (ratio > 1) return "AŞIM";
    if (ratio >= 0.8) return "UYARI";
    return "OK";
}
`;

const F_VERDICT = cs`
string Verdict(int total, int budget, int overCount)
{
    if (total > budget) return "SONUÇ: Bütçe AŞILDI (" + (total - budget) + " üçgen fazla)";
    if (overCount > 0) return "SONUÇ: Toplam bütçe içinde, ama " + overCount + " obje optimize edilmeli.";
    return "SONUÇ: Her şey bütçe içinde.";
}
`;

const M_START = cs`
// ---------- Program ----------
PrintHeader("Poligon Bütçesi Raporu");
`;

const M_PLATFORM = cs`
string platform = Console.ReadLine();
if (platform == null) platform = "";
platform = platform.Trim().ToLower();
int budget = PlatformBudget(platform);
if (budget < 0)
{
    Console.WriteLine("Uyarı: bilinmeyen platform '" + platform + "', pc kullanılıyor.");
    platform = "pc";
    budget = PlatformBudget(platform);
}
int limit = budget / 10;
Console.WriteLine("Platform: " + platform + " | Toplam bütçe: " + budget + " | Obje limiti: " + limit);
`;

const M_READ_SIMPLE = cs`
List<string> names = new List<string>();
List<int> tris = new List<int>();
string line = Console.ReadLine();
while (line != null && line.Trim() != "end")
{
    string[] parts = line.Trim().Split(' ');
    names.Add(parts[0]);
    tris.Add(ToTris(parts[1], int.Parse(parts[2])));
    line = Console.ReadLine();
}
`;

const M_READ_SAFE = cs`
List<string> names = new List<string>();
List<int> tris = new List<int>();
int lineNo = 1;
string line = Console.ReadLine();
while (line != null && line.Trim() != "end")
{
    lineNo++;
    string problem = CheckLine(line);
    if (problem != "ok")
    {
        Console.WriteLine("Uyarı: satır " + lineNo + " atlandı (" + problem + ")");
    }
    else
    {
        string[] parts = line.Trim().Split(' ');
        try
        {
            int t = ToTris(parts[1], int.Parse(parts[2]));
            names.Add(parts[0]);
            tris.Add(t);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine("Uyarı: satır " + lineNo + " atlandı (" + ex.Message + ")");
        }
    }
    line = Console.ReadLine();
}
`;

const M_LIST_OUT = cs`
PrintObjects(names, tris);
Console.WriteLine(names.Count + " obje okundu.");
`;

const M_STATS = cs`
if (names.Count == 0)
{
    Console.WriteLine("Geçerli obje bulunamadı.");
}
else
{
    int overCount = 0;
    for (int i = 0; i < tris.Count; i++)
    {
        if (Classify(tris[i], limit) == "AŞIM") overCount++;
    }
    int total = Sum(tris);
    int heaviest = IndexOfMax(tris);
    Console.WriteLine("Toplam: " + total + " üçgen");
    Console.WriteLine($"Ortalama: {(double)total / names.Count:F1} üçgen");
    Console.WriteLine("En ağır: " + names[heaviest] + " (" + tris[heaviest] + ")");
    Console.WriteLine("Limit aşan obje: " + overCount);
}
`;

const M_REPORT = cs`
Console.WriteLine();
if (names.Count == 0)
{
    Console.WriteLine("Geçerli obje bulunamadı.");
}
else
{
    Console.WriteLine("Obje".PadRight(12) + "Üçgen".PadLeft(8) + "  Durum");
    int overCount = 0;
    for (int i = 0; i < names.Count; i++)
    {
        string status = Classify(tris[i], limit);
        if (status == "AŞIM") overCount++;
        Console.WriteLine(names[i].PadRight(12) + tris[i].ToString().PadLeft(8) + "  " + status);
    }

    int total = Sum(tris);
    int heaviest = IndexOfMax(tris);
    Console.WriteLine();
    Console.WriteLine("Obje sayısı: " + names.Count);
    Console.WriteLine("Toplam: " + total + " üçgen");
    Console.WriteLine($"Ortalama: {(double)total / names.Count:F1} üçgen");
    Console.WriteLine("En ağır: " + names[heaviest] + " (" + tris[heaviest] + ")");
    Console.WriteLine("Limit aşan obje: " + overCount);
    Console.WriteLine($"Bütçe kullanımı: {(double)total / budget * 100:F1}%");
    Console.WriteLine(Verdict(total, budget, overCount));
}
`;

const HEADER_OUT = 'Poligon Bütçesi Raporu\n======================';

// Örnek sahne girdileri
const IN_BASIC = 'pc\nRock tri 1200\nFence quad 600\nTree tri 8500\nend';
const IN_BAD = 'mobile\nRock tri 1200\nLamp tri abc\nGhost ngon 5\nCar tri\nFence quad -3\nend';
const IN_FULL = 'Mobile\nRock tri 1200\nFence quad 600\nTree tri 8500\nLamp tri abc\nStatue quad 7500\nGhost ngon 5\nCar tri\nend';

export default {
  kind: 'project',
  id: 'm1-project',
  module: 'm1',
  title: 'Modül projesi: Poligon Bütçesi Denetleyicisi',
  titleEn: 'Poly Budget Checker',
  titleJa: 'ポリゴン予算チェッカー',
  minutes: 180,
  level: 2,
  environment: 'browser',
  summary: `
<p>Bir oyun sahnesindeki objelerin üçgen sayılarını okuyup <b>platform bütçesine</b> göre denetleyen bir konsol aracı yazacaksın. Bir 3D sanatçısı olarak bu soruyu çok iyi tanıyorsun: "Bu sahne mobilde çalışır mı? Hangi asset'i önce optimize etmeliyim?"</p>
<p>Program; bir platform adı ve <code>isim tür sayı</code> satırlarından oluşan bir sahne listesi okur (<code>Rock tri 1200</code>, <code>Fence quad 600</code>), quad'ları üçgene çevirir, bozuk satırları <b>çökmeden</b> atlar, istatistikleri hesaplar ve şöyle bir rapor yazar:</p>
<pre><code>Obje           Üçgen  Durum
Rock            1200  OK
Fence           1200  OK
Tree            8500  UYARI
Statue         15000  AŞIM
...
SONUÇ: Toplam bütçe içinde, ama 1 obje optimize edilmeli.</code></pre>
<p>Modül 1'de öğrendiğin her şeyi kullanacaksın: değişkenler, string işlemleri, koşullar, döngüler, fonksiyonlar, listeler ve hata yönetimi. Proje 7 adımda büyüyor; her adımın başlangıç kodu bir önceki adımın çözümüdür.</p>`,
  goals: [
    'Gerçek bir 3D iş akışı problemini (poligon bütçesi) küçük fonksiyonlara bölerek çözmek',
    'Kullanıcı girdisini satır satır okuyup listelerde saklamak',
    'Bozuk girdiyi TryParse ve try/catch ile yakalayıp programı çökertmeden raporlamak',
    'Toplam, ortalama, en büyük gibi istatistikleri kendi fonksiyonlarınla hesaplamak',
    'Okunur, hizalı bir konsol raporu üretmek ve projeyi portfolyoya hazırlamak',
  ],
  skills: [
    'Fonksiyon tasarımı (parametre, dönüş değeri, tek sorumluluk)',
    'string.Split, Trim, ToLower, PadLeft/PadRight ile metin işleme',
    'List<T> ile dinamik veri toplama',
    'switch ile seçim, while ile girdi döngüsü',
    'Girdi doğrulama: TryParse, throw, try/catch',
    'Adım adım (incremental) geliştirme ve test',
  ],
  steps: [
    {
      title: '1. Plan ve rapor başlığı',
      body: `
<p>Kod yazmadan önce bir profesyonel ne yapar? <b>Problemi parçalara böler.</b> Tıpkı bir karakteri modellerken önce blockout, sonra detay yaptığın gibi.</p>
<ol>
<li>Başlık yazdır.</li>
<li>Quad sayılarını üçgene çevir (oyun motorları üçgenle çalışır).</li>
<li>Platformu oku → bütçeyi bul.</li>
<li>Obje satırlarını oku → listelere koy.</li>
<li>Bozuk satırları ayıkla.</li>
<li>İstatistikleri hesapla.</li>
<li>Raporu ve kararı yazdır.</li>
</ol>
<p>Her madde bir ya da iki küçük fonksiyon olacak. Küçük fonksiyonların avantajı: her birini ayrı ayrı test edebilirsin. Bu projede her adımda otomatik testler (harness) fonksiyonlarını farklı değerlerle çağıracak.</p>
<p><b>Bu adımın görevi:</b> <code>void PrintHeader(string title)</code> fonksiyonunu tamamla. Başlığı yazdırsın, altına da <b>başlığın uzunluğu kadar</b> <code>=</code> karakteri koysun. Böylece başlık değişse bile çizgi hep tam oturur.</p>
<pre><code>Poligon Bütçesi Raporu
======================</code></pre>
<p class="muted">Neden çizginin uzunluğunu elle yazmıyoruz? Çünkü "22 tane = yaz" sabit bir varsayımdır; başlık "Sahne Raporu" olunca bozulur. Değeri <code>title.Length</code>'ten <b>hesaplamak</b>, kodu değişikliğe dayanıklı yapar.</p>`,
      exercise: {
        title: 'PrintHeader',
        prompt: `<p><code>PrintHeader</code>'ı tamamla: başlık satırının altına, <code>title.Length</code> kadar <code>=</code> içeren bir satır yazdırsın. Bir <code>for</code> döngüsüyle boş bir string'e <code>"="</code> ekleyerek çizgiyi oluşturabilirsin.</p>
<pre class="expected">Poligon Bütçesi Raporu
======================</pre>`,
        starter: cs`void PrintHeader(string title)
{
    Console.WriteLine(title);
    // title.Length kadar '=' içeren bir satır yazdır
}

// ---------- Program ----------
PrintHeader("Poligon Bütçesi Raporu");`,
        checks: [
          { type: 'output', expect: HEADER_OUT, msg: 'Başlık ve altında 22 karakterlik = çizgisi olmalı' },
          { type: 'harness', append: cs`PrintHeader("LOD");
PrintHeader("Sahne 01");`, expect: 'LOD\n===\nSahne 01\n========', msg: 'Çizgi her başlığın uzunluğuna göre hesaplanmalı (3 harf → ===)' },
          { type: 'code', pattern: 'title\\.Length', msg: 'Çizgi uzunluğunu title.Length ile hesapla' },
          { type: 'notCode', pattern: '"={4,}"', msg: 'Çizgiyi elle yazma; döngüyle oluştur' },
        ],
        hints: [
          'Önce boş bir metin değişkeni oluştur: <code>string underline = "";</code>',
          'Bir <code>for</code> döngüsü <code>title.Length</code> kez dönsün ve her turda <code>underline += "=";</code> yapsın.',
          'Döngüden sonra <code>Console.WriteLine(underline);</code>. Döngü koşulu: <code>i &lt; title.Length</code>.',
        ],
        solution: F_HEADER + M_START,
        explain: 'Çizginin uzunluğu artık veriden (title.Length) hesaplanıyor. Testler "LOD" ve "Sahne 01" gibi farklı başlıklarla çağırdığında da doğru çalıştı — elle yazılmış bir çizgi bunu yapamazdı.',
      },
    },
    {
      title: '2. Quad → üçgen dönüşümü',
      body: `
<p>Blender'da modelini genelde quad'larla kurarsın, ama oyun motoru ve GPU her şeyi <b>üçgen</b> olarak işler: her quad 2 üçgene bölünür. Bütçeler de bu yüzden üçgen (tris) cinsinden konuşulur. (N-gon'lar daha fazla üçgene bölünür; bu projede onları desteklemiyoruz.)</p>
<p>İki fonksiyon yazacağız:</p>
<ul>
<li><code>int QuadsToTris(int quads)</code> — quad sayısını üçgene çevirir.</li>
<li><code>int ToTris(string kind, int count)</code> — tür <code>"tri"</code> ise sayıyı olduğu gibi, <code>"quad"</code> ise <code>QuadsToTris</code> ile çevirerek döndürür. Başka bir tür gelirse <b>tahmin yürütmez</b>: <code>throw new ArgumentException("bilinmeyen tür: " + kind)</code>.</li>
</ul>
<p><b>Neden exception?</b> <code>ToTris</code> "ngon" için hangi sayıyı döndürebilir ki? 0 döndürmek "bu obje hiç üçgen içermiyor" yalanını söylerdi ve rapor sessizce yanlış olurdu. Fonksiyon sözleşmesini korur; ne yapılacağına <b>çağıran</b> karar verir (5. adımda bu hatayı yakalayıp satırı atlayacağız).</p>
<p>Fonksiyonların birbirini çağırması (<code>ToTris</code> → <code>QuadsToTris</code>) normaldir: büyük işler küçük, test edilmiş parçalardan kurulur.</p>`,
      exercise: {
        title: 'QuadsToTris ve ToTris',
        prompt: `<p><code>QuadsToTris</code> ve <code>ToTris</code> fonksiyonlarını tamamla. <code>ToTris</code>, quad durumunda <b>QuadsToTris'i çağırmalı</b> ve bilinmeyen türde <code>ArgumentException</code> fırlatmalı. Program kısmı hazır:</p>
<pre class="expected">Poligon Bütçesi Raporu
======================
1200
1200
Hata: bilinmeyen tür: ngon</pre>`,
        starter: F_HEADER + cs`
int QuadsToTris(int quads)
{
    // her quad 2 üçgendir
    return 0;
}

int ToTris(string kind, int count)
{
    // "tri" → count, "quad" → QuadsToTris(count), diğerleri → ArgumentException
    return count;
}
` + M_START + cs`Console.WriteLine(ToTris("tri", 1200));
Console.WriteLine(ToTris("quad", 600));
try
{
    Console.WriteLine(ToTris("ngon", 5));
}
catch (ArgumentException ex)
{
    Console.WriteLine("Hata: " + ex.Message);
}`,
        checks: [
          { type: 'output', expect: HEADER_OUT + '\n1200\n1200\nHata: bilinmeyen tür: ngon', msg: 'Çıktı birebir aynı olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(QuadsToTris(0));
Console.WriteLine(QuadsToTris(7));
Console.WriteLine(ToTris("tri", 35));
Console.WriteLine(ToTris("quad", 3));`, expect: '0\n14\n35\n6', msg: 'QuadsToTris ve ToTris farklı sayılarla doğru sonuç vermeli' },
          { type: 'harness', append: cs`try { ToTris("hex", 1); Console.WriteLine("fırlatmadı"); }
catch (ArgumentException ex) { Console.WriteLine(ex.Message); }`, expect: 'bilinmeyen tür: hex', msg: 'Bilinmeyen türde ArgumentException("bilinmeyen tür: ...") fırlatmalı' },
          { type: 'code', pattern: 'int\\s+ToTris[\\s\\S]*QuadsToTris\\s*\\(', msg: 'ToTris, quad durumunda QuadsToTris fonksiyonunu çağırmalı' },
        ],
        hints: [
          '<code>QuadsToTris</code> tek satır: sayıyı 2 ile çarp ve döndür.',
          '<code>ToTris</code> içinde iki erken return: <code>if (kind == "tri") return count;</code> ve quad için benzeri.',
          'İki <code>if</code>\'e de uymayan her durum fonksiyonun sonuna düşer; oraya <code>throw new ArgumentException("bilinmeyen tür: " + kind);</code> yaz. (throw da return gibi fonksiyonu bitirir, bu yüzden CS0161 hatası almazsın.)',
        ],
        solution: F_HEADER + F_TRIS + M_START + cs`Console.WriteLine(ToTris("tri", 1200));
Console.WriteLine(ToTris("quad", 600));
try
{
    Console.WriteLine(ToTris("ngon", 5));
}
catch (ArgumentException ex)
{
    Console.WriteLine("Hata: " + ex.Message);
}`,
        explain: 'ToTris tüm yolları kapsıyor: iki geçerli tür return ile, geri kalan her şey throw ile bitiyor. Çağıran kod (try/catch) hatayı yakalayıp kullanıcıya anlaşılır bir mesaj gösterdi; program çökmedi.',
      },
    },
    {
      title: '3. Platformu seçmek',
      body: `
<p>Programın ilk girdi satırı hedef platform: <code>mobile</code>, <code>console</code> ya da <code>pc</code>. Bu projede şu <b>örnek</b> bütçeleri kullanıyoruz (gerçek projelerde bu sayılar oyuna, motora ve cihaza göre takımca belirlenir):</p>
<table class="compare">
<tr><th>Platform</th><th>Sahne bütçesi (üçgen)</th></tr>
<tr><td>mobile</td><td>100000</td></tr>
<tr><td>console</td><td>1000000</td></tr>
<tr><td>pc</td><td>2000000</td></tr>
</table>
<p>Ayrıca kendi proje kuralımız: <b>tek bir obje, sahne bütçesinin %10'undan fazlasını kullanmamalı</b>. Buna "obje limiti" diyeceğiz: <code>limit = budget / 10</code>.</p>
<p><b>Görev:</b></p>
<ol>
<li><code>int PlatformBudget(string platform)</code>: <code>switch</code> ile bütçeyi döndürsün. Kullanıcı <code>" PC "</code> ya da <code>"Mobile"</code> yazabilir; bu yüzden önce <code>Trim()</code> ve <code>ToLower()</code> ile <b>normalleştir</b>. Bilinmeyen platform → <code>-1</code>.</li>
<li>Programda platformu oku, normalleştir. Bütçe -1 ise uyarı yaz ve <code>pc</code>'ye geç (kullanıcıyı cezalandırma, makul bir varsayılan kullan ve bunu söyle).</li>
<li>Özet satırını yazdır.</li>
</ol>
<p class="muted"><code>-1</code> burada "bulunamadı" anlamına gelen bir işaret değeri (sentinel). Bütçe asla negatif olamayacağı için güvenle kullanılabilir. Bunun yerine exception da fırlatabilirdik; ama bilinmeyen platform burada beklenen bir kullanıcı hatası, istisnai bir durum değil.</p>`,
      exercise: {
        title: 'PlatformBudget ve platform satırı',
        prompt: `<p><code>PlatformBudget</code>'ı yaz ve programda platform satırını işle. Girdi <code>  Console</code> için:</p>
<pre class="expected">Poligon Bütçesi Raporu
======================
Platform: console | Toplam bütçe: 1000000 | Obje limiti: 100000</pre>
<p>Girdi <code>tablet</code> için önce <code>Uyarı: bilinmeyen platform 'tablet', pc kullanılıyor.</code> satırı, sonra pc özet satırı gelmeli.</p>`,
        stdin: '  Console',
        starter: F_HEADER + F_TRIS + cs`
int PlatformBudget(string platform)
{
    // Trim + ToLower, sonra switch: mobile 100000, console 1000000, pc 2000000, diğer → -1
    return -1;
}
` + M_START + cs`
string platform = Console.ReadLine();
if (platform == null) platform = "";
// platform'u normalleştir, bütçeyi bul, bilinmiyorsa uyar ve "pc" kullan
// limit = budget / 10 ve özet satırını yazdır
`,
        checks: [
          { type: 'output', expect: HEADER_OUT + '\nPlatform: console | Toplam bütçe: 1000000 | Obje limiti: 100000', msg: '"  Console" girdisiyle özet satırı birebir aynı olmalı' },
          { type: 'output', stdin: 'tablet', expect: HEADER_OUT + "\nUyarı: bilinmeyen platform 'tablet', pc kullanılıyor.\nPlatform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000", msg: 'Bilinmeyen platformda uyarı yazıp pc\'ye geçmeli' },
          { type: 'output', stdin: 'MOBILE', expect: HEADER_OUT + '\nPlatform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000', msg: 'Büyük harfle yazılan platformu da tanımalı' },
          { type: 'harness', append: cs`Console.WriteLine(PlatformBudget(" pc "));
Console.WriteLine(PlatformBudget("Mobile"));
Console.WriteLine(PlatformBudget("switch"));`, expect: '2000000\n100000\n-1', msg: 'PlatformBudget boşluk/büyük harf içeren adları tanımalı, bilinmeyende -1 döndürmeli' },
          { type: 'code', pattern: 'budget\\s*/\\s*10', msg: 'Obje limitini budget / 10 olarak hesapla' },
        ],
        hints: [
          'Fonksiyonda: <code>switch (platform.Trim().ToLower()) { case "mobile": return 100000; ... default: return -1; }</code>. case içinde return olduğu için break gerekmez.',
          'Programda: <code>platform = platform.Trim().ToLower();</code> ve <code>int budget = PlatformBudget(platform);</code>. Sonra <code>if (budget &lt; 0) { ... }</code> içinde uyarıyı yaz, <code>platform = "pc";</code> yap ve bütçeyi yeniden hesapla.',
          'Uyarı metninde tek tırnaklar string\'in parçası: <code>"Uyarı: bilinmeyen platform \'" + platform + "\', pc kullanılıyor."</code>. Özet: <code>"Platform: " + platform + " | Toplam bütçe: " + budget + " | Obje limiti: " + limit</code>.',
        ],
        solution: F_HEADER + F_TRIS + F_PLATFORM + M_START + M_PLATFORM,
        explain: 'Girdiyi önce normalleştirmek (Trim + ToLower), karşılaştırmayı tek bir biçime indirger: " PC ", "Pc" ve "pc" aynı şey olur. Bilinmeyen değer için makul bir varsayılana geçip kullanıcıyı bilgilendirmek, CAD/DCC araçlarında da sık kullanılan bir davranıştır.',
      },
    },
    {
      title: '4. Sahne objelerini listelere okumak',
      body: `
<p>Platform satırından sonra her satır bir obje: <code>isim tür sayı</code>. Girdi <code>end</code> satırıyla ya da girdi bittiğinde (<code>ReadLine()</code> → <code>null</code>) sona erer.</p>
<pre><code>pc
Rock tri 1200
Fence quad 600
Tree tri 8500
end</code></pre>
<p>Kaç obje geleceğini bilmiyoruz → <b>dizi değil liste</b>. İki paralel liste kullanacağız: <code>List&lt;string&gt; names</code> ve <code>List&lt;int&gt; tris</code> (<code>names[i]</code> ve <code>tris[i]</code> aynı objeyi anlatır).</p>
<p>Okuma döngüsünün iskeleti 11. dersteki meydan okumaya çok benziyor (bu kez <code>null</code> kontrolü de var):</p>
<pre><code>string line = Console.ReadLine();
while (line != null &amp;&amp; line.Trim() != "end")
{
    // satırı işle
    line = Console.ReadLine();   // sonraki satır
}</code></pre>
<p><b>Neden önce <code>line != null</code>?</b> <code>&amp;&amp;</code> kısa devre yapar: ilk koşul false ise ikinciye bakmaz. <code>null.Trim()</code> çağrılsaydı <code>NullReferenceException</code> alırdık. Sıra önemli!</p>
<p>Her satırı <code>line.Trim().Split(' ')</code> ile 3 parçaya ayır: <code>parts[0]</code> isim, <code>parts[1]</code> tür, <code>parts[2]</code> sayı. Üçgen sayısını 2. adımdaki <code>ToTris</code> ile hesapla.</p>
<p>Ayrıca listeleri yazdıran bir <code>void PrintObjects(List&lt;string&gt; names, List&lt;int&gt; tris)</code> fonksiyonu yaz. Bu adımda tüm satırların <b>geçerli</b> olduğunu varsayıyoruz; bozuk satırlar bir sonraki adımın konusu.</p>`,
      exercise: {
        title: 'Okuma döngüsü ve PrintObjects',
        prompt: `<p>Obje satırlarını listelere oku, <code>PrintObjects</code> ile yazdır ve kaç obje okunduğunu söyle:</p>
<pre class="expected">Poligon Bütçesi Raporu
======================
Platform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000
- Rock: 1200 üçgen
- Fence: 1200 üçgen
- Tree: 8500 üçgen
3 obje okundu.</pre>`,
        stdin: IN_BASIC,
        starter: F_HEADER + F_TRIS + F_PLATFORM + cs`
void PrintObjects(List<string> names, List<int> tris)
{
    // her obje için "- isim: sayı üçgen" yazdır
}
` + M_START + M_PLATFORM + cs`
List<string> names = new List<string>();
List<int> tris = new List<int>();
// "end" ya da null gelene kadar satırları oku, böl, listelere ekle

PrintObjects(names, tris);
Console.WriteLine(names.Count + " obje okundu.");`,
        checks: [
          { type: 'output', expect: HEADER_OUT + '\nPlatform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000\n- Rock: 1200 üçgen\n- Fence: 1200 üçgen\n- Tree: 8500 üçgen\n3 obje okundu.', msg: 'Örnek sahneyle çıktı birebir aynı olmalı' },
          { type: 'output', stdin: 'mobile\nCube quad 3\n  Cone tri 32  ', expect: HEADER_OUT + '\nPlatform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000\n- Cube: 6 üçgen\n- Cone: 32 üçgen\n2 obje okundu.', msg: '"end" olmadan girdi bittiğinde (null) de çalışmalı; satır başı/sonu boşlukları sorun olmamalı' },
          { type: 'harness', stdin: '', append: cs`PrintObjects(new List<string> { "A", "B" }, new List<int> { 3, 40 });`, expect: '- A: 3 üçgen\n- B: 40 üçgen', msg: 'PrintObjects verilen listeleri sırayla yazdırmalı' },
          { type: 'code', pattern: 'while\\s*\\(', msg: 'Satırları bir while döngüsüyle oku' },
          { type: 'code', pattern: 'ToTris\\s*\\(', msg: 'Üçgen sayısını ToTris ile hesapla' },
        ],
        hints: [
          'Döngü iskeletini gövdeden kopyala. İçeride önce <code>string[] parts = line.Trim().Split(\' \');</code>',
          '<code>names.Add(parts[0]);</code> ve <code>tris.Add(ToTris(parts[1], int.Parse(parts[2])));</code>. Döngünün son satırı <code>line = Console.ReadLine();</code> olmalı, yoksa sonsuz döngü!',
          '<code>PrintObjects</code> içinde <code>for (int i = 0; i &lt; names.Count; i++)</code> ve <code>"- " + names[i] + ": " + tris[i] + " üçgen"</code>.',
        ],
        solution: F_HEADER + F_TRIS + F_PLATFORM + F_PRINT_OBJECTS + M_START + M_PLATFORM + M_READ_SIMPLE + M_LIST_OUT,
        explain: 'Liste, kaç satır geleceğini bilmeden veri toplamanı sağladı. Döngü koşulundaki null kontrolü sayesinde "end" yazılmasa bile program güvenle bitti; ToTris de quad\'ları otomatik çevirdi.',
      },
    },
    {
      title: '5. Bozuk satırlara dayanıklılık',
      body: `
<p>Gerçek dünyada girdi hiç temiz gelmez: bir tablodan kopyalanmış listede eksik sütun, sayının yerine "abc", desteklenmeyen bir tür… 4. adımın kodu bunlardan birini görünce <b>çöker</b> ve kullanıcı hiçbir rapor alamaz. Bozuk bir <code>.obj</code> dosyası yüzünden tüm sahnenin açılmaması gibi.</p>
<p>İki savunma hattı kuracağız:</p>
<ol>
<li><b>Ön kontrol — <code>string CheckLine(string text)</code>:</b> satırın <em>biçimini</em> TryParse ile, exception fırlatmadan kontrol eder ve sorunu bir metin olarak döndürür:
<ul>
<li>3 parça değilse → <code>"3 alan bekleniyordu"</code></li>
<li>3. parça tam sayı değilse → <code>"sayı değil: abc"</code></li>
<li>sayı negatifse → <code>"negatif sayı"</code></li>
<li>sorun yoksa → <code>"ok"</code></li>
</ul></li>
<li><b>try/catch:</b> Tür kontrolünü zaten <code>ToTris</code> yapıyor ve <code>ArgumentException</code> fırlatıyor. Aynı kontrolü iki yerde yazmak yerine o exception'ı <b>yakalayıp</b> mesajını kullanacağız.</li>
</ol>
<p>Her bozuk satır için <b>satır numarasıyla</b> bir uyarı yazdır ve devam et. Platform satırı 1. satırdır; ilk obje satırı 2'den başlar. Satır numarası vermek, kullanıcının hatayı dosyada bulmasını saniyelere indirir.</p>
<p class="muted">Not: Boş catch kullanmıyoruz; her hata kullanıcıya bildiriliyor. 12. dersteki kural: hatayı yutma, raporla.</p>`,
      exercise: {
        title: 'CheckLine ve güvenli okuma',
        prompt: `<p><code>CheckLine</code>'ı yaz ve okuma döngüsünü güvenli hale getir (satır numarası, CheckLine, try/catch). Girdi:</p>
<pre><code>mobile
Rock tri 1200
Lamp tri abc
Ghost ngon 5
Car tri
Fence quad -3
end</code></pre>
<pre class="expected">Poligon Bütçesi Raporu
======================
Platform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000
Uyarı: satır 3 atlandı (sayı değil: abc)
Uyarı: satır 4 atlandı (bilinmeyen tür: ngon)
Uyarı: satır 5 atlandı (3 alan bekleniyordu)
Uyarı: satır 6 atlandı (negatif sayı)
- Rock: 1200 üçgen
1 obje okundu.</pre>`,
        stdin: IN_BAD,
        starter: F_HEADER + F_TRIS + F_PLATFORM + F_PRINT_OBJECTS + cs`
string CheckLine(string text)
{
    // parça sayısı, TryParse ve negatiflik kontrolü
    return "ok";
}
` + M_START + M_PLATFORM + cs`
List<string> names = new List<string>();
List<int> tris = new List<int>();
// TODO: satır numarasını say, CheckLine ile kontrol et, ToTris'i try/catch içine al
string line = Console.ReadLine();
while (line != null && line.Trim() != "end")
{
    string[] parts = line.Trim().Split(' ');
    names.Add(parts[0]);
    tris.Add(ToTris(parts[1], int.Parse(parts[2])));
    line = Console.ReadLine();
}
` + M_LIST_OUT,
        checks: [
          { type: 'output', expect: HEADER_OUT + '\nPlatform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000\nUyarı: satır 3 atlandı (sayı değil: abc)\nUyarı: satır 4 atlandı (bilinmeyen tür: ngon)\nUyarı: satır 5 atlandı (3 alan bekleniyordu)\nUyarı: satır 6 atlandı (negatif sayı)\n- Rock: 1200 üçgen\n1 obje okundu.', msg: 'Bozuk satırlar numarasıyla raporlanmalı, program çökmemeli' },
          { type: 'output', stdin: 'pc\nA tri 10\nB quad 2 extra\nC tri 5\nD box 1', expect: HEADER_OUT + '\nPlatform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000\nUyarı: satır 3 atlandı (3 alan bekleniyordu)\nUyarı: satır 5 atlandı (bilinmeyen tür: box)\n- A: 10 üçgen\n- C: 5 üçgen\n2 obje okundu.', msg: 'Farklı bozuk girdilerle de doğru satır numaralarını vermeli' },
          { type: 'harness', stdin: '', append: cs`Console.WriteLine(CheckLine("Rock tri 1200"));
Console.WriteLine(CheckLine("Rock 1200"));
Console.WriteLine(CheckLine("Rock tri 12x"));
Console.WriteLine(CheckLine("Rock quad -1"));
Console.WriteLine(CheckLine("  Rock tri 5  "));`, expect: 'ok\n3 alan bekleniyordu\nsayı değil: 12x\nnegatif sayı\nok', msg: 'CheckLine her hata türü için doğru metni döndürmeli' },
          { type: 'code', pattern: 'int\\.TryParse', msg: 'CheckLine içinde sayıyı int.TryParse ile kontrol et' },
          { type: 'code', pattern: 'catch\\s*\\(\\s*ArgumentException', msg: 'ToTris\'in fırlattığı ArgumentException\'ı yakala' },
        ],
        hints: [
          '<code>CheckLine</code>: <code>string[] fields = text.Trim().Split(\' \');</code> ile başla. Kontrolleri sırayla, her biri bir erken return olacak şekilde yaz; en sonda <code>return "ok";</code>.',
          'Döngüde: başa <code>int lineNo = 1;</code> (döngüden önce) ve döngünün ilk satırına <code>lineNo++;</code>. Sonra <code>string problem = CheckLine(line);</code> ve <code>if (problem != "ok") { uyarı } else { ... }</code>.',
          'else bloğunda <code>try { int t = ToTris(parts[1], int.Parse(parts[2])); names.Add(parts[0]); tris.Add(t); } catch (ArgumentException ex) { ...ex.Message... }</code>. Listeye eklemeyi ToTris BAŞARILI olduktan sonra yap, yoksa isim eklenir ama sayı eklenmez ve listeler kayar!',
        ],
        solution: F_HEADER + F_TRIS + F_PLATFORM + F_PRINT_OBJECTS + F_CHECK + M_START + M_PLATFORM + M_READ_SAFE + M_LIST_OUT,
        explain: 'Biçim hataları TryParse ile sessizce tespit edildi, tür hatası ise ToTris\'in fırlattığı exception ile yakalandı. Önemli bir ayrıntı: names.Add ve tris.Add, ToTris başarılı olduktan sonra çağrıldığı için paralel listeler hiçbir zaman kaymadı.',
      },
    },
    {
      title: '6. İstatistikler: toplam, ortalama, en ağır, limit aşanlar',
      body: `
<p>Veri temiz, sıra hesaplamada. 11. derste dizilerle yazdığın algoritmaları bu kez <b>listelerle</b> ve <b>fonksiyon olarak</b> yazacaksın:</p>
<ul>
<li><code>int Sum(List&lt;int&gt; values)</code> — toplam (boş liste → 0).</li>
<li><code>int IndexOfMax(List&lt;int&gt; values)</code> — en büyüğün indeksi. Eşitlikte <b>ilk</b> bulunanı döndür.</li>
<li><code>string Classify(int tris, int limit)</code> — objenin durumunu söyler:
<ul>
<li><code>tris / limit</code> oranı 1'den büyükse → <code>"AŞIM"</code></li>
<li>oran 0.8 veya üstüyse → <code>"UYARI"</code> (limite %80'den fazla yaklaşmış)</li>
<li>değilse → <code>"OK"</code></li>
</ul></li>
</ul>
<p>Oranı hesaplarken <code>(double)tris / limit</code> yaz: iki <code>int</code>'i bölmek tam sayı bölmesi yapar ve 0.85 yerine 0 verir (5. ders).</p>
<p><b>Boş sahne tuzağı:</b> Hiç geçerli obje yoksa <code>IndexOfMax</code> 0 döndürür ama <code>names[0]</code> yoktur → çöküş. Ortalama da 0'a bölme olur. Bu yüzden istatistikleri yalnızca <code>names.Count &gt; 0</code> iken hesapla, aksi halde <code>Geçerli obje bulunamadı.</code> yaz. Savunmacı programlama: kenar durumları (edge case) baştan düşün.</p>`,
      exercise: {
        title: 'Sum, IndexOfMax, Classify',
        prompt: `<p>Üç istatistik fonksiyonunu yaz ve listeden sonra istatistikleri yazdır. Girdi:</p>
<pre><code>Mobile
Rock tri 1200
Fence quad 600
Tree tri 8500
Lamp tri abc
Statue quad 7500
Ghost ngon 5
Car tri
end</code></pre>
<pre class="expected">Poligon Bütçesi Raporu
======================
Platform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000
Uyarı: satır 5 atlandı (sayı değil: abc)
Uyarı: satır 7 atlandı (bilinmeyen tür: ngon)
Uyarı: satır 8 atlandı (3 alan bekleniyordu)
- Rock: 1200 üçgen
- Fence: 1200 üçgen
- Tree: 8500 üçgen
- Statue: 15000 üçgen
4 obje okundu.
Toplam: 25900 üçgen
Ortalama: 6475.0 üçgen
En ağır: Statue (15000)
Limit aşan obje: 1</pre>`,
        stdin: IN_FULL,
        starter: F_HEADER + F_TRIS + F_PLATFORM + F_PRINT_OBJECTS + F_CHECK + cs`
int Sum(List<int> values)
{
    return 0;
}

int IndexOfMax(List<int> values)
{
    return 0;
}

string Classify(int tris, int limit)
{
    // oran > 1 → "AŞIM", oran >= 0.8 → "UYARI", değilse "OK"
    return "OK";
}
` + M_START + M_PLATFORM + M_READ_SAFE + M_LIST_OUT + cs`
// TODO: liste boşsa "Geçerli obje bulunamadı." yaz;
// değilse Toplam, Ortalama (F1), En ağır ve Limit aşan obje satırlarını yazdır
`,
        checks: [
          { type: 'output', expect: HEADER_OUT + '\nPlatform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000\nUyarı: satır 5 atlandı (sayı değil: abc)\nUyarı: satır 7 atlandı (bilinmeyen tür: ngon)\nUyarı: satır 8 atlandı (3 alan bekleniyordu)\n- Rock: 1200 üçgen\n- Fence: 1200 üçgen\n- Tree: 8500 üçgen\n- Statue: 15000 üçgen\n4 obje okundu.\nToplam: 25900 üçgen\nOrtalama: 6475.0 üçgen\nEn ağır: Statue (15000)\nLimit aşan obje: 1', msg: 'Örnek sahneyle istatistikler birebir aynı olmalı' },
          { type: 'output', stdin: 'pc\nend', expect: HEADER_OUT + '\nPlatform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000\n0 obje okundu.\nGeçerli obje bulunamadı.', msg: 'Boş sahnede çökmemeli, "Geçerli obje bulunamadı." yazmalı' },
          { type: 'harness', stdin: '', append: cs`Console.WriteLine(Sum(new List<int> { 1, 2, 3 }));
Console.WriteLine(Sum(new List<int>()));
Console.WriteLine(IndexOfMax(new List<int> { 5, 9, 9, 2 }));
Console.WriteLine(IndexOfMax(new List<int> { -3, -1 }));`, expect: '6\n0\n1\n1', msg: 'Sum ve IndexOfMax farklı listelerle doğru çalışmalı (eşitlikte ilk indeks, negatif değerler dahil)' },
          { type: 'harness', stdin: '', append: cs`Console.WriteLine(Classify(7999, 10000));
Console.WriteLine(Classify(8000, 10000));
Console.WriteLine(Classify(10000, 10000));
Console.WriteLine(Classify(10001, 10000));`, expect: 'OK\nUYARI\nUYARI\nAŞIM', msg: 'Classify sınır değerlerde doğru olmalı: tam %80 UYARI, tam limit UYARI, limitin 1 fazlası AŞIM' },
          { type: 'code', pattern: '\\(\\s*double\\s*\\)', msg: 'Oran ve ortalama için (double) dönüşümü kullan' },
          { type: 'notCode', pattern: '\\.(Sum|Max|Average)\\s*\\(\\s*\\)', msg: 'LINQ kullanma; Sum ve IndexOfMax\'ı döngüyle kendin yaz' },
        ],
        hints: [
          '<code>Sum</code> ve <code>IndexOfMax</code>, 11. derstekiyle aynı mantık; tek fark <code>Length</code> yerine <code>Count</code>. IndexOfMax\'ta <code>&gt;</code> kullan (<code>&gt;=</code> değil) ki eşitlikte ilk indeks kalsın.',
          '<code>Classify</code>: <code>double ratio = (double)tris / limit;</code> sonra iki erken return ve son satırda <code>return "OK";</code>. Sıra önemli: önce AŞIM kontrolü.',
          'Programın sonunda <code>if (names.Count == 0) { ... } else { ... }</code>. else içinde bir <code>for</code> ile <code>Classify(tris[i], limit) == "AŞIM"</code> olanları say; ortalama için <code>$"Ortalama: {(double)total / names.Count:F1} üçgen"</code>.',
        ],
        solution: F_HEADER + F_TRIS + F_PLATFORM + F_PRINT_OBJECTS + F_CHECK + F_STATS + M_START + M_PLATFORM + M_READ_SAFE + M_LIST_OUT + M_STATS,
        explain: 'Her istatistik kendi fonksiyonunda olduğu için testler onları programdan bağımsız olarak, kenar durumlarla (boş liste, eşit değerler, negatifler, tam sınır) denetleyebildi. Boş sahne kontrolü de IndexOfMax\'ın boş listede yanlış indeks döndürmesinin önüne geçti.',
      },
    },
    {
      title: '7. Final raporu ve karar',
      body: `
<p>Son adım: veriyi bir sanatçının ya da teknik direktörün bir bakışta okuyabileceği bir <b>rapora</b> dönüştürmek.</p>
<p><b>1. Hizalı tablo.</b> <code>PrintObjects</code> listesini, sütunları hizalı bir tabloyla değiştir. <code>PadRight(12)</code> metni sağdan boşlukla 12 karaktere tamamlar (sola yaslı isimler); <code>PadLeft(8)</code> soldan tamamlar (sağa yaslı sayılar — sayılar hep sağa yaslanır ki basamaklar alt alta gelsin). Sayıyı önce <code>ToString()</code> ile metne çevir:</p>
<pre><code>names[i].PadRight(12) + tris[i].ToString().PadLeft(8) + "  " + status</code></pre>
<p><b>2. Özet.</b> Obje sayısı, toplam, ortalama, en ağır, limit aşan sayısı ve bütçe kullanım yüzdesi: <code>$"Bütçe kullanımı: {(double)total / budget * 100:F1}%"</code>.</p>
<p><b>3. Karar — <code>string Verdict(int total, int budget, int overCount)</code>:</b></p>
<ul>
<li>Toplam bütçeyi aşıyorsa → <code>SONUÇ: Bütçe AŞILDI (X üçgen fazla)</code></li>
<li>Toplam içinde ama limit aşan obje varsa → <code>SONUÇ: Toplam bütçe içinde, ama N obje optimize edilmeli.</code></li>
<li>Değilse → <code>SONUÇ: Her şey bütçe içinde.</code></li>
</ul>
<p>Tablodan önce ve özetten önce birer boş satır (<code>Console.WriteLine();</code>) bırak. Artık <code>PrintObjects</code>'e ihtiyacın yok; silebilirsin. Kullanılmayan kodu temizlemek de profesyonelliğin parçası.</p>`,
      exercise: {
        title: 'Rapor tablosu ve Verdict',
        prompt: `<p>Raporu tamamla. 6. adımdaki girdiyle beklenen çıktı:</p>
<pre class="expected">Poligon Bütçesi Raporu
======================
Platform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000
Uyarı: satır 5 atlandı (sayı değil: abc)
Uyarı: satır 7 atlandı (bilinmeyen tür: ngon)
Uyarı: satır 8 atlandı (3 alan bekleniyordu)

Obje           Üçgen  Durum
Rock            1200  OK
Fence           1200  OK
Tree            8500  UYARI
Statue         15000  AŞIM

Obje sayısı: 4
Toplam: 25900 üçgen
Ortalama: 6475.0 üçgen
En ağır: Statue (15000)
Limit aşan obje: 1
Bütçe kullanımı: 25.9%
SONUÇ: Toplam bütçe içinde, ama 1 obje optimize edilmeli.</pre>
<p>Boş sahnede (<code>pc</code> + <code>end</code>) platform satırından sonra bir boş satır ve <code>Geçerli obje bulunamadı.</code> yazmalı.</p>`,
        stdin: IN_FULL,
        starter: F_HEADER + F_TRIS + F_PLATFORM + F_PRINT_OBJECTS + F_CHECK + F_STATS + cs`
string Verdict(int total, int budget, int overCount)
{
    // üç durumdan birini döndür
    return "";
}
` + M_START + M_PLATFORM + M_READ_SAFE + M_LIST_OUT + M_STATS,
        checks: [
          { type: 'output', expect: HEADER_OUT + '\nPlatform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000\nUyarı: satır 5 atlandı (sayı değil: abc)\nUyarı: satır 7 atlandı (bilinmeyen tür: ngon)\nUyarı: satır 8 atlandı (3 alan bekleniyordu)\n\nObje           Üçgen  Durum\nRock            1200  OK\nFence           1200  OK\nTree            8500  UYARI\nStatue         15000  AŞIM\n\nObje sayısı: 4\nToplam: 25900 üçgen\nOrtalama: 6475.0 üçgen\nEn ağır: Statue (15000)\nLimit aşan obje: 1\nBütçe kullanımı: 25.9%\nSONUÇ: Toplam bütçe içinde, ama 1 obje optimize edilmeli.', msg: 'Örnek sahnenin raporu birebir aynı olmalı (boşluklar ve boş satırlar dahil)' },
          { type: 'output', stdin: 'mobile\nA quad 30000\nB quad 30000\nend', expect: HEADER_OUT + '\nPlatform: mobile | Toplam bütçe: 100000 | Obje limiti: 10000\n\nObje           Üçgen  Durum\nA              60000  AŞIM\nB              60000  AŞIM\n\nObje sayısı: 2\nToplam: 120000 üçgen\nOrtalama: 60000.0 üçgen\nEn ağır: A (60000)\nLimit aşan obje: 2\nBütçe kullanımı: 120.0%\nSONUÇ: Bütçe AŞILDI (20000 üçgen fazla)', msg: 'Bütçeyi aşan sahnede doğru karar vermeli' },
          { type: 'output', stdin: 'tablet\nCube tri 12', expect: HEADER_OUT + "\nUyarı: bilinmeyen platform 'tablet', pc kullanılıyor.\nPlatform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000\n\nObje           Üçgen  Durum\nCube              12  OK\n\nObje sayısı: 1\nToplam: 12 üçgen\nOrtalama: 12.0 üçgen\nEn ağır: Cube (12)\nLimit aşan obje: 0\nBütçe kullanımı: 0.0%\nSONUÇ: Her şey bütçe içinde.", msg: 'Küçük bir sahnede "Her şey bütçe içinde." demeli' },
          { type: 'output', stdin: 'pc\nend', expect: HEADER_OUT + '\nPlatform: pc | Toplam bütçe: 2000000 | Obje limiti: 200000\n\nGeçerli obje bulunamadı.', msg: 'Boş sahnede çökmemeli' },
          { type: 'harness', stdin: '', append: cs`Console.WriteLine(Verdict(120000, 100000, 2));
Console.WriteLine(Verdict(1000, 1000, 0));
Console.WriteLine(Verdict(500, 1000, 3));`, expect: 'SONUÇ: Bütçe AŞILDI (20000 üçgen fazla)\nSONUÇ: Her şey bütçe içinde.\nSONUÇ: Toplam bütçe içinde, ama 3 obje optimize edilmeli.', msg: 'Verdict üç durumu da doğru ayırt etmeli (tam bütçe aşım sayılmaz)' },
          { type: 'code', pattern: 'PadRight\\s*\\(\\s*12\\s*\\)', msg: 'İsim sütununu PadRight(12) ile hizala' },
          { type: 'code', pattern: 'PadLeft\\s*\\(\\s*8\\s*\\)', msg: 'Sayı sütununu PadLeft(8) ile hizala' },
        ],
        hints: [
          'Önce <code>Verdict</code>\'i yaz: üç durum, iki erken return + son return. Toplam kontrolü önce gelmeli: bütçe aşıldıysa limit aşan obje sayısının önemi kalmaz.',
          'Programın sonunu yeniden düzenle: <code>PrintObjects</code> ve "obje okundu" satırlarını kaldır; <code>Console.WriteLine();</code> ile boş satır bırak; <code>else</code> bloğunda önce başlık satırını (<code>"Obje".PadRight(12) + "Üçgen".PadLeft(8) + "  Durum"</code>), sonra tek bir for döngüsünde hem satırları yazdır hem AŞIM\'ları say.',
          'Özetten önce yine <code>Console.WriteLine();</code>. Sonra 6 özet satırı ve en son <code>Console.WriteLine(Verdict(total, budget, overCount));</code>.',
        ],
        solution: F_HEADER + F_TRIS + F_PLATFORM + F_CHECK + F_STATS + F_VERDICT + M_START + M_PLATFORM + M_READ_SAFE + M_REPORT,
        explain: 'Program artık baştan sona çalışıyor: girdiyi doğruluyor, hataları satır numarasıyla raporluyor, istatistikleri ayrı fonksiyonlarda hesaplıyor ve hizalı bir rapor ile net bir karar üretiyor. Her parça ayrı ayrı test edildiği için bütünün de doğru çalıştığından eminsin.',
      },
    },
    {
      title: '8. Bilgisayarında çalıştır ve portfolyoya ekle',
      body: `
<p>Tarayıcıda yazdığın program gerçek .NET'te de çalışır. Son adımda onu kendi bilgisayarına taşı:</p>
<ol>
<li><a href="https://dotnet.microsoft.com/download" target="_blank" rel="noopener">.NET SDK</a>'yı kur (LTS sürümü önerilir).</li>
<li>Terminalde: <code>dotnet new console -n PolyBudget</code> ve <code>cd PolyBudget</code>.</li>
<li>7. adımın çözümünü <code>Program.cs</code> dosyasına yapıştır (içindeki her şeyi değiştir).</li>
<li>Örnek girdiyi bir dosyaya kaydet: <code>scene.txt</code>.</li>
<li>Çalıştır: bash/macOS/cmd'de <code>dotnet run &lt; scene.txt</code>; PowerShell'de <code>Get-Content scene.txt | dotnet run</code>. Girdiyi elle yazmak istersen sadece <code>dotnet run</code> (bitirmek için <code>end</code> yaz).</li>
</ol>
<div class="callout tip">Windows konsolunda Türkçe karakterler (ğ, ş, ı) bozuk görünürse programın en başına <code>Console.OutputEncoding = System.Text.Encoding.UTF8;</code> satırını ekle.</div>
<p><b>Portfolyo için:</b> Bu proje küçük ama bir işverene şunu gösterir: bir alan problemini (oyun asset optimizasyonu) anlayıp onu doğrulanmış, test edilebilir fonksiyonlarla çözebiliyorsun. README'de bunu vurgula: "3D sanatçısı olarak yaşadığım bir problemi çözmek için yazdım."</p>
<p class="muted">İpucu: README'ye örnek girdi ve çıktıyı kod bloğu olarak ekle; okuyan kişi programı çalıştırmadan ne yaptığını görsün.</p>`,
      checklist: [
        'Yaptım: .NET SDK kurulu, dotnet --version çalışıyor',
        'Yaptım: Program bilgisayarımda scene.txt ile çalıştı ve aynı raporu verdi',
        'Yaptım: Kendi sahnemden (Blender\'daki bir projemden) gerçek üçgen sayılarıyla bir girdi dosyası hazırladım',
      ],
    },
  ],
  finalChecklist: [
    'Kodu GitHub\'a yükle (ör. poly-budget-checker adlı bir depo)',
    'README yaz: projenin amacı, nasıl çalıştırılır, örnek girdi ve örnek çıktı',
    'README\'ye girdi biçimini açıkla (platform satırı, "isim tür sayı" satırları, end)',
    'Bozuk girdiyle bir örnek ekle ve programın nasıl tepki verdiğini göster',
    'Değişken ve fonksiyon adlarının İngilizce ve anlamlı olduğunu kontrol et',
    'Terminal çıktısının ekran görüntüsünü README\'ye ekle',
    'README\'nin sonuna kısa bir Japonca özet ekle (ör. ポリゴン予算チェッカー: シーン内オブジェクトの三角形数を集計し、プラットフォーム予算と比較するコンソールツール)',
  ],
  extensions: [
    'N-gon desteği: "ngon 5" gibi satırlarda kenar sayısından üçgen sayısını hesapla (n kenarlı bir yüz, n - 2 üçgene bölünür)',
    'Her obje için önerilen hedef: limit aşan objeler için "%X azaltılmalı" yüzdesini yazdır',
    'Raporu en ağırdan en hafife sıralı yazdır (önce kendi sıralama algoritmanla, sonra Modül 3\'te LINQ OrderByDescending ile)',
    'LOD önerisi: 10. dersteki hata avında olduğu gibi LOD0/LOD1/LOD2 seviyeleri için %50 ve %25 hedef üçgen sayılarını hesapla',
    'Komut satırı argümanı ile platform seçimi (string[] args) ve dosyadan okuma (File.ReadAllLines) — gerçek .NET\'te dene',
    'Blender\'dan dışa aktarma: Blender\'ın Python API\'siyle sahnedeki objelerin üçgen sayılarını bu biçimde bir metin dosyasına yazan küçük bir script (C# ile Python\'u karşılaştırmak için güzel bir alıştırma)',
  ],
  vocab: [
    { en: 'Polygon', tr: 'Poligon', ja: 'ポリゴン', kana: 'ポリゴン', romaji: 'porigon' },
    { en: 'Triangle', tr: 'Üçgen', ja: '三角形', kana: 'さんかっけい', romaji: 'sankakkei' },
    { en: 'Budget', tr: 'Bütçe', ja: '予算', kana: 'よさん', romaji: 'yosan' },
    { en: 'Report', tr: 'Rapor', ja: 'レポート', kana: 'レポート', romaji: 'repōto' },
    { en: 'Specification', tr: 'Şartname / spesifikasyon', ja: '仕様', kana: 'しよう', romaji: 'shiyō' },
    { en: 'Requirement', tr: 'Gereksinim', ja: '要件', kana: 'ようけん', romaji: 'yōken' },
    { en: 'Validation', tr: 'Doğrulama', ja: '検証', kana: 'けんしょう', romaji: 'kenshō' },
    { en: 'Test', tr: 'Test', ja: 'テスト', kana: 'テスト', romaji: 'tesuto' },
    { en: 'Optimization', tr: 'Optimizasyon', ja: '最適化', kana: 'さいてきか', romaji: 'saitekika' },
    { en: 'Refactoring', tr: 'Yeniden düzenleme', ja: 'リファクタリング', kana: 'リファクタリング', romaji: 'rifakutaringu' },
  ],
};
