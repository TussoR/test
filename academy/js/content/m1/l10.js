import { cs } from '../helpers.js';

export default {
  id: 'm1-l10',
  module: 'm1',
  title: 'Parametreler ve dönüş değerleri',
  titleEn: 'Parameters & return values',
  titleJa: '引数と戻り値',
  minutes: 60,
  level: 2,
  objectives: [
    'Parametre ile argüman arasındaki farkı açıklayıp birden çok parametreli fonksiyon yazmak',
    'return ile değer döndüren fonksiyonlar yazmak ve dönen değeri ifadelerde kullanmak',
    'Varsayılan parametre, adlandırılmış argüman ve erken return kullanmak',
    'Değer ile geçirmenin (pass-by-value) çağıranın değişkenini neden değiştirmediğini anlatabilmek',
    'out parametresini ve aşırı yüklemeyi (overloading) tanımak; CS7036, CS1501, CS0161 hatalarını okuyup düzeltmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Fonksiyona veri göndermek: parametre ve argüman',
      body: `
<p>Önceki derste fonksiyonlar hep aynı işi yapıyordu. Gerçek gücü, onlara <b>dışarıdan veri verdiğimizde</b> ortaya çıkar.</p>
<pre><code>int TriangleCount(int quads)   // tanım: quads bir PARAMETRE
{
    return quads * 2;
}

TriangleCount(1500);          // çağrı: 1500 bir ARGÜMAN</code></pre>
<ul>
<li><b><t en="Parameter" ja="仮引数">Parametre</t></b>: Fonksiyon <em>tanımındaki</em> isimli kutu. "Bana bir <code>int</code> ver, adına <code>quads</code> diyeceğim."</li>
<li><b><t en="Argument" ja="実引数">Argüman</t></b>: Fonksiyonu <em>çağırırken</em> gönderdiğin gerçek değer (<code>1500</code>).</li>
</ul>
<p>Birden çok parametre virgülle ayrılır ve <b>her birinin kendi türü</b> yazılır: <code>double Distance(double x1, double y1, double x2, double y2)</code>. Argümanlar <b>aynı sırayla</b> eşleşir: 1. argüman → 1. parametre, 2. → 2. …</p>
<div class="callout tip">Türler bir sözleşmedir. <code>TriangleCount("çok")</code> yazarsan derleyici program çalışmadan itiraz eder: "Ben <code>int</code> istemiştim."</div>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Node\'un giriş ve çıkış soketleri',
      body: `
<p>Blender'ın Shader Editor'ündeki <b>Mix</b> node'unu düşün (eski adıyla MixRGB). Solda giriş soketleri var: <b>Factor</b>, <b>A</b>, <b>B</b>. Sağda tek bir çıkış soketi: <b>Result</b>.</p>
<table class="compare">
<tr><th>Blender node</th><th>C# fonksiyonu</th></tr>
<tr><td>Node'un türü (Mix)</td><td>Fonksiyonun adı (<code>Lerp</code>)</td></tr>
<tr><td>Giriş soketleri (Factor, A, B)</td><td>Parametreler (<code>t</code>, <code>a</code>, <code>b</code>)</td></tr>
<tr><td>Sokete bağladığın değer / kablo</td><td>Argüman</td></tr>
<tr><td>Soketin rengi (gri = sayı, sarı = renk)</td><td>Parametrenin türü (<code>double</code>, <code>string</code>...)</td></tr>
<tr><td>Çıkış soketi (Result)</td><td><t en="Return value" ja="戻り値">Dönüş değeri</t> (<code>return</code>)</td></tr>
<tr><td>Factor boş bırakılınca 0.5 kullanılır</td><td><t en="Default parameter" ja="デフォルト引数">Varsayılan parametre</t></td></tr>
</table>
<p>Node'un içi bir kara kutudur: sen sadece girişleri bağlar, çıkışı kullanırsın. Fonksiyonlar da öyle: <code>Lerp(0, 10, 0.25)</code> çağıran kişinin içindeki formülü bilmesi gerekmez.</p>`,
    },
    {
      kind: 'visual',
      title: 'Bir çağrı sırasında neler olur?',
      svg: `
<svg viewBox="0 0 760 280" role="img" aria-label="Argümanların parametrelere kopyalanması ve dönüş değerinin geri gelmesi">
  <defs><marker id="ar-l10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <rect x="10" y="20" width="260" height="240" rx="10" class="box"/>
    <text x="140" y="45" class="t1">Çağıran kod</text>
    <text x="140" y="75" class="t2">Distance(0, 0, 3, 4)</text>
    <rect x="30" y="95" width="45" height="32" rx="6" class="box hi"/><text x="52" y="116" class="t1">0</text>
    <rect x="85" y="95" width="45" height="32" rx="6" class="box hi"/><text x="107" y="116" class="t1">0</text>
    <rect x="140" y="95" width="45" height="32" rx="6" class="box hi"/><text x="162" y="116" class="t1">3</text>
    <rect x="195" y="95" width="45" height="32" rx="6" class="box hi"/><text x="217" y="116" class="t1">4</text>
    <text x="140" y="148" class="t3">argümanlar (gerçek değerler)</text>
    <rect x="30" y="195" width="220" height="40" rx="8" class="box hi"/>
    <text x="140" y="220" class="t1">double d = 5</text>
    <rect x="400" y="20" width="350" height="240" rx="10" class="box"/>
    <text x="575" y="45" class="t1">Distance fonksiyonu (yeni bir çerçeve)</text>
    <rect x="420" y="95" width="70" height="32" rx="6" class="box"/><text x="455" y="116" class="t2">x1 = 0</text>
    <rect x="500" y="95" width="70" height="32" rx="6" class="box"/><text x="535" y="116" class="t2">y1 = 0</text>
    <rect x="580" y="95" width="70" height="32" rx="6" class="box"/><text x="615" y="116" class="t2">x2 = 3</text>
    <rect x="660" y="95" width="70" height="32" rx="6" class="box"/><text x="695" y="116" class="t2">y2 = 4</text>
    <text x="575" y="148" class="t3">parametreler (argümanların KOPYALARI)</text>
    <text x="575" y="178" class="t2">dx = 3, dy = 4</text>
    <text x="575" y="200" class="t2">return Math.Sqrt(9 + 16) → 5</text>
    <line x1="270" y1="111" x2="398" y2="111" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l10)"/>
    <text x="334" y="100" class="t3">1) kopyalanır</text>
    <line x1="400" y1="215" x2="252" y2="215" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l10)"/>
    <text x="326" y="205" class="t3">2) return 5</text>
    <text x="575" y="245" class="t3">3) fonksiyon bitince bu çerçeve silinir</text>
  </g>
</svg>`,
      caption: `
<p><b>1.</b> Çağrı anında her argümanın <b>değeri kopyalanır</b> ve parametre kutularına konur. <b>2.</b> Fonksiyon gövdesi çalışır; <code>return</code> satırına gelince sonuç çağırana geri gönderilir ve çağrı ifadesinin yerine geçer: <code>Distance(0, 0, 3, 4)</code> artık <code>5</code> demektir. <b>3.</b> Fonksiyonun çerçevesi (<t en="stack frame" ja="スタックフレーム">stack frame</t>) silinir; içindeki <code>dx</code>, <code>dy</code> yok olur.</p>
<p class="muted">Bu "kopyalama" ayrıntısı, birazdan göreceğimiz "değer ile geçirme" davranışının sebebidir.</p>`,
    },
    {
      kind: 'code',
      title: 'return: Değeri geri göndermek ve kullanmak',
      code: cs`int TriangleCount(int quads)
{
    return quads * 2;
}

double Distance(double x1, double y1, double x2, double y2)
{
    double dx = x2 - x1;
    double dy = y2 - y1;
    return Math.Sqrt(dx * dx + dy * dy);
}

string Classify(int tris, int budget)
{
    if (tris < 0) return "geçersiz";
    if (tris > budget) return "bütçe aşıldı";
    return "uygun";
}

int rockTris = TriangleCount(1500);
Console.WriteLine("Üçgen: " + rockTris);
Console.WriteLine("İki obje: " + (TriangleCount(100) + TriangleCount(250)));
Console.WriteLine("Mesafe: " + Distance(0, 0, 3, 4));
Console.WriteLine(Classify(rockTris, 2000));
Console.WriteLine(Classify(-5, 2000));`,
      explain: {
        1: 'Fonksiyon adından önceki <code>int</code>, <b><t en="return type" ja="戻り値の型">dönüş türüdür</t></b>: "Bu fonksiyon geriye bir tam sayı verir." Önceki dersteki <code>void</code> ise "geriye hiçbir şey vermez" demekti.',
        3: '<code>return</code> iki iş yapar: (1) ifadenin değerini hesaplayıp çağırana gönderir, (2) fonksiyonu <b>o anda</b> bitirir. Bir quad = 2 üçgen.',
        6: 'Dört parametre, her biri <code>double</code>. Argümanlar sırayla eşleşir: (x1, y1) ilk nokta, (x2, y2) ikinci nokta.',
        10: 'Pisagor: √(dx² + dy²). <code>Math.Sqrt</code> da aslında bir fonksiyondur ve <code>double</code> döndürür — sen de aynı kalıpta fonksiyon yazıyorsun.',
        13: 'Dönüş türü <code>string</code> olabilir; her türlü değer döndürülebilir.',
        15: '<b><t en="Early return" ja="早期リターン">Erken return</t></b> (guard clause): Geçersiz girdiyi en başta yakalayıp hemen çıkarız. Bu satır çalışırsa alttaki satırlar <b>hiç çalışmaz</b>.',
        16: 'Buraya ancak <code>tris</code> negatif değilse gelinir.',
        17: 'Hiçbir koşul tutmadıysa varsayılan cevap. Değer döndüren bir fonksiyonda <b>her yol</b> bir <code>return</code>\'e ulaşmalıdır.',
        20: 'Çağrı ifadesi <code>TriangleCount(1500)</code> çalışır, <code>3000</code> değerine dönüşür ve <code>rockTris</code> değişkenine atanır.',
        22: 'Dönen değerler normal sayılar gibi işlemlere girer: 200 + 500 = 700. Parantez, + işleminin string birleştirmeden önce yapılması için.',
        23: 'Dönen değeri bir değişkene koymadan doğrudan da kullanabilirsin.',
        24: 'Aynı fonksiyonu farklı argümanlarla çağırmak = aynı node\'u farklı girişlerle kullanmak.',
        25: '-5 ilk <code>if</code>\'e takılır, "geçersiz" döner; diğer kontrollere hiç bakılmaz.',
      },
      runnable: true,
      stepper: true,
      note: '"Adım adım" ile çalıştır: Bir fonksiyon çağrıldığında imlecin fonksiyonun içine atladığını, return ile çağıran satıra geri döndüğünü izle.',
    },
    {
      kind: 'code',
      title: 'Varsayılan parametreler ve adlandırılmış argümanlar',
      code: cs`double Lerp(double a, double b, double t = 0.5)
{
    return a + (b - a) * t;
}

double ConvertMmToM(double mm, int digits = 3)
{
    return Math.Round(mm / 1000, digits);
}

Console.WriteLine(Lerp(0, 10));
Console.WriteLine(Lerp(0, 10, 0.25));
Console.WriteLine(Lerp(a: 100, b: 200, t: 0.1));
Console.WriteLine(Lerp(t: 1, a: 3, b: 8));
Console.WriteLine(ConvertMmToM(1234.5678));
Console.WriteLine(ConvertMmToM(1234.5678, digits: 1));`,
      explain: {
        1: '<code>t = 0.5</code> bir <b>varsayılan değerdir</b>. Çağıran <code>t</code> vermezse 0.5 kullanılır. Varsayılanlı parametreler listenin <b>sonunda</b> olmalıdır. <code>Lerp</code> = <t en="linear interpolation" ja="線形補間">doğrusal ara değer</t>: Blender\'daki Mix node\'unun yaptığı iş.',
        3: 't = 0 → a, t = 1 → b, t = 0.5 → tam ortası. Animasyondaki ara kareler (in-between) de böyle hesaplanır.',
        6: 'Birimi parametre adına yazmak (<code>mm</code>) hataları önler: kimse buraya metre göndermez.',
        8: '<code>Math.Round(değer, basamak)</code>: sonucu istenen ondalık basamağa yuvarlar.',
        11: 'Sadece 2 argüman → <code>t</code> varsayılan 0.5 olur → 5.',
        12: 'Üçüncü argüman verilince varsayılan devre dışı kalır → 2.5.',
        13: '<b><t en="Named argument" ja="名前付き引数">Adlandırılmış argüman</t></b>: <code>isim: değer</code>. Okuyan kişi hangi sayının ne olduğunu hemen görür → 110.',
        14: 'Adlandırınca sıra serbesttir. a=3, b=8, t=1 → 8.',
        15: 'Varsayılan 3 basamak → 1.235',
        16: 'Sadece istediğin varsayılanı adıyla değiştirebilirsin → 1.2',
      },
      runnable: true,
      note: 'Adlandırılmış argümanlar özellikle aynı türden çok parametre olduğunda hayat kurtarır: CreateBox(2, 3, 4) mü, CreateBox(width: 2, depth: 3, height: 4) mü daha okunur?',
    },
    {
      kind: 'code',
      title: 'Değer ile geçirme: Parametreyi değiştirmek çağıranı değiştirmez',
      code: cs`void ScaleUp(int size)
{
    size = size * 2;
    Console.WriteLine("Fonksiyon içinde size = " + size);
}

int ScaledCopy(int size)
{
    return size * 2;
}

int cubeSize = 4;
ScaleUp(cubeSize);
Console.WriteLine("Dışarıda cubeSize = " + cubeSize);

cubeSize = ScaledCopy(cubeSize);
Console.WriteLine("return ile güncellendi: " + cubeSize);`,
      explain: {
        1: '<code>size</code>, bu fonksiyona ait <b>yeni ve ayrı</b> bir değişkendir.',
        3: 'Burada değişen sadece <b>kopya</b>: <code>size</code> 8 olur, ama <code>cubeSize</code>\'ın haberi bile olmaz.',
        4: 'İçeride 8 yazar.',
        12: 'Çağıranın değişkeni: 4.',
        13: 'Çağrı anında <code>cubeSize</code>\'ın <b>değeri</b> (4) kopyalanıp <code>size</code>\'a konur. Buna <b><t en="pass by value" ja="値渡し">değer ile geçirme</t></b> denir; C#\'ta <code>int</code>, <code>double</code>, <code>bool</code> gibi türler varsayılan olarak böyle geçer.',
        14: 'Hâlâ 4! Fonksiyonun içindeki değişiklik dışarıya sızmadı.',
        16: 'Doğru yol: fonksiyon yeni değeri <b>döndürsün</b>, çağıran da onu kendi değişkenine <b>atasın</b>.',
        17: 'Şimdi 8.',
      },
      runnable: true,
      stepper: true,
      note: 'Adım adım ilerlerken değişkenler panelini izle: ScaleUp içindeyken size 8 olur ama cubeSize 4 kalır. Blender benzetmesi: bir objeyi Shift+D ile kopyalayıp kopyayı ölçeklemek orijinali büyütmez.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Dönüş değeri kullanılmazsa ne olur?',
      code: cs`int AddBevel(int edges)
{
    edges = edges + 4;
    return edges;
}

int e = 12;
AddBevel(e);
Console.WriteLine(e);
e = AddBevel(e);
Console.WriteLine(e);`,
      options: ['12\n16', '16\n20', '16\n16', '12\n12'],
      answer: 0,
      explain: 'İlk çağrıda (8. satır) fonksiyon 16 döndürür ama bu değer <b>hiçbir yere atanmadığı</b> için çöpe gider; <code>e</code> hâlâ 12\'dir (değer ile geçirme). 10. satırda dönen 16, <code>e = ...</code> ile değişkene yazılır. C# dönen değeri kullanmamana izin verir — bu yüzden bu tür hata derleyici tarafından yakalanmaz, dikkat senin işin.',
    },
    {
      kind: 'code',
      title: 'İki kısa araç: out parametresi ve aşırı yükleme (overloading)',
      code: cs`class Program
{
    static double Area(double side)
    {
        return side * side;
    }

    static double Area(double width, double height)
    {
        return width * height;
    }

    static void Main()
    {
        Console.WriteLine(Area(3));
        Console.WriteLine(Area(2, 5));

        if (int.TryParse("250", out int mm))
        {
            Console.WriteLine("Okunan: " + mm + " mm");
        }

        bool ok = int.TryParse("12cm", out int bad);
        Console.WriteLine(ok + " " + bad);
    }
}`,
      explain: {
        3: 'Kare alanı: tek parametreli <code>Area</code>.',
        8: 'Aynı isim, <b>farklı parametre listesi</b>: dikdörtgen alanı. Buna <b><t en="method overloading" ja="オーバーロード">aşırı yükleme</t></b> denir. Not: Bu, klasik <code>class Program</code> içindeki <code>static</code> metotlarla yapılır; üst düzey yerel fonksiyonlarda aynı isim iki kez kullanılamaz (CS0128).',
        15: 'Derleyici argüman <b>sayısına ve türlerine</b> bakıp hangi <code>Area</code>\'nın çağrılacağına karar verir: 1 argüman → kare → 9.',
        16: '2 argüman → dikdörtgen → 10. <code>Console.WriteLine</code>\'ın kendisi de aşırı yüklenmiştir: int, string, double... hepsini kabul etmesi bu yüzden.',
        18: '<code>out</code> parametresi, fonksiyonun <b>ikinci bir sonucu</b> dışarı yazabilmesini sağlar. <code>TryParse</code> asıl sonuç olarak "başardım mı?" (<code>bool</code>) döndürür, okunan sayıyı ise <code>out int mm</code> değişkenine yazar.',
        20: 'Dönüşüm başarılı olduğu için <code>mm</code> = 250.',
        23: '"12cm" bir tam sayı değil: <code>TryParse</code> program çökmeden <code>false</code> döndürür ve <code>bad</code>\'e 0 yazar. <code>int.Parse("12cm")</code> ise programı çökertirdi — bunu 12. derste (hata yönetimi) ayrıntılı göreceğiz.',
      },
      runnable: true,
      note: 'out\'u şimdilik "TryParse kalıbı" olarak tanıman yeterli. Kendi out\'lu fonksiyonunu yazmak ek alıştırmalarda var.',
    },
    {
      kind: 'warning',
      title: 'Parametre ve return ile ilgili 4 klasik hata',
      body: `
<ol>
<li><b>Eksik argüman.</b> <code>Distance(0, 0, 3)</code> → <code>error CS7036: There is no argument given that corresponds to the required parameter 'y2'</code>. Derleyici hangi parametrenin boş kaldığını adıyla söyler.</li>
<li><b>Fazla / yanlış sayıda argüman.</b> <code>Area(1, 2, 3)</code> → <code>error CS1501: No overload for method 'Area' takes 3 arguments</code>. "Bu kadar girişli bir sürüm yok."</li>
<li><b>Bazı yollar return'süz.</b> <code>if</code> içinde return var ama <code>else</code> ya da sonda yok → <code>error CS0161: not all code paths return a value</code>. Derleyici "Ya hiçbir koşul tutmazsa ne döndüreceksin?" diye sorar.</li>
<li><b>void bir fonksiyonun sonucunu kullanmaya çalışmak.</b> <code>int x = PrintInfo();</code> → derleme hatası (CS0029): <code>void</code> hiçbir şey döndürmez, kutuya koyacak değer yoktur.</li>
</ol>
<p>Bir de <b>derleyicinin yakalamadığı</b> bir hata: dönen değeri kullanmayı unutmak (<code>AddBevel(e);</code> yazıp <code>e</code>'nin değiştiğini sanmak). Az önceki tahmin sorusundaki gibi.</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: LOD seviyesi seçen fonksiyon',
      code: cs`string LodLevel(int tris)
{
    if (tris > 10000)
    {
        return "LOD0 (yakın)";
    }
    else if (tris > 2000)
    {
        return "LOD1 (orta)";
    }
}

Console.WriteLine(LodLevel(50000));
Console.WriteLine(LodLevel(800));`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: 'Fonksiyon <code>string</code> döndürmeyi <b>vaat ediyor</b>. Bu vaat her durumda tutulmalı.',
        7: '<code>else if</code> bir "değilse" değildir: 2000 ve altı için hiçbir dal çalışmaz.',
        11: 'Fonksiyonun sonu: 800 üçgenli bir obje buraya kadar düşer ve döndürecek bir şey yoktur. Hata kodu: CS0161.',
      },
      note: 'Düzelt: 11. satırdan önce "ne olursa olsun" çalışacak bir return ekle (örneğin uzak objeler için "LOD2 (uzak)"). Sonra iki satırın da yazdırıldığını gör.',
    },
    {
      kind: 'cad',
      title: 'CAD/BIM\'de parametreler: birim, tolerans ve okunabilirlik',
      body: `
<p>CAD yazılımlarının çekirdeği, binlerce küçük "girdi al → hesapla → sonuç döndür" fonksiyonundan oluşur: iki nokta arası mesafe, bir duvarın hacmi, bir açının radyana çevrilmesi…</p>
<ul>
<li><b>Birimler parametre adında.</b> <code>WallVolume(double lengthMm, double heightMm, double thicknessMm)</code> gibi isimler, mm ile m'nin karışmasını engeller. Japonya'daki mimari çizimlerde uzunluklar genellikle mm ile yazılır; birim karışıklığı 1000 kat hata demektir.</li>
<li><b>Tolerans varsayılan parametre olarak.</b> Ondalıklı sayıların tam eşit olmadığını 5. derste gördün. <code>bool SamePoint(double x1, double y1, double x2, double y2, double tol = 0.001)</code> — çoğu çağrı varsayılanı kullanır, hassas işlemler kendi toleransını verir.</li>
<li><b>Adlandırılmış argümanlar kod incelemesinde.</b> <code>CreateWall(3000, 2400, 200)</code> yerine <code>CreateWall(lengthMm: 3000, heightMm: 2400, thicknessMm: 200)</code> yazmak, takım arkadaşının (ve gelecekteki senin) kodu doğru okumasını sağlar.</li>
<li><b>Saf fonksiyonlar test edilebilir.</b> Sadece parametrelerine bakıp sonuç döndüren bir fonksiyon, aynı girdiye hep aynı çıktıyı verir. Bu tür fonksiyonlara otomatik test yazmak çok kolaydır — alıştırmalardaki "harness" kontrolleri de tam olarak bunu yapıyor.</li>
</ul>
<p class="muted">Japonca iş ortamında fonksiyon "<span lang="ja">関数</span>" (kansū), sınıf içindekiler "<span lang="ja">メソッド</span>" (mesoddo), parametreler "<span lang="ja">引数</span>" (hikisū), dönüş değeri "<span lang="ja">戻り値</span>" (modorichi) diye anılır.</p>`,
    },
  ],
  exercise: {
    title: 'Mesafe ve poligon bütçesi fonksiyonları',
    prompt: `
<p>İki fonksiyon yaz:</p>
<ol>
<li><code>double Distance(double x1, double y1, double x2, double y2)</code> — iki nokta arasındaki mesafeyi <b>döndürür</b> (√(dx² + dy²)).</li>
<li><code>string BudgetStatus(int tris, int budget = 10000)</code> —
  <code>tris</code> negatifse <code>"geçersiz"</code>, <code>budget</code>'tan büyükse <code>"bütçe aşıldı"</code>, değilse <code>"uygun"</code> döndürür. <code>budget</code>'ın varsayılan değeri <b>10000</b> olmalı.</li>
</ol>
<p>Sonra şu dört çağrının sonucunu sırayla yazdır (son çağrıda adlandırılmış argüman kullan):</p>
<pre><code>Distance(0, 0, 3, 4)
BudgetStatus(12000)
BudgetStatus(-1)
BudgetStatus(800, budget: 500)</code></pre>
<pre class="expected">5
bütçe aşıldı
geçersiz
bütçe aşıldı</pre>`,
    starter: cs`double Distance(double x1, double y1, double x2, double y2)
{
    // dx ve dy'yi hesapla, sonra Math.Sqrt ile mesafeyi döndür
    return 0;
}

// BudgetStatus fonksiyonunu buraya yaz (varsayılan budget = 10000)


Console.WriteLine(Distance(0, 0, 3, 4));
// Kalan üç çağrıyı yazdır
`,
    checks: [
      { type: 'output', expect: '5\nbütçe aşıldı\ngeçersiz\nbütçe aşıldı', msg: 'Dört satırlık çıktı birebir aynı olmalı' },
      { type: 'harness', append: cs`Console.WriteLine(Distance(1, 1, 4, 5));
Console.WriteLine($"{Distance(0, 0, 1, 1):F3}");
Console.WriteLine(Distance(-2, 3, -2, 3));`, expect: '5\n1.414\n0', msg: 'Distance her nokta çifti için doğru mesafeyi döndürmeli (çıktıyı elle yazmak yetmez)' },
      { type: 'harness', append: cs`Console.WriteLine(BudgetStatus(10000));
Console.WriteLine(BudgetStatus(10001));
Console.WriteLine(BudgetStatus(0, 0));
Console.WriteLine(BudgetStatus(-50, budget: 100));`, expect: 'uygun\nbütçe aşıldı\nuygun\ngeçersiz', msg: 'BudgetStatus sınır değerlerde doğru çalışmalı: tam bütçede "uygun", 1 fazlasında "bütçe aşıldı"' },
      { type: 'code', pattern: 'int\\s+budget\\s*=\\s*10000', msg: 'budget parametresinin varsayılan değeri 10000 olmalı (int budget = 10000)' },
      { type: 'code', pattern: 'budget\\s*:\\s*500', msg: 'Son çağrıda adlandırılmış argüman kullan: budget: 500' },
      { type: 'code', pattern: 'Math\\.Sqrt', msg: 'Mesafeyi Math.Sqrt ile hesapla' },
    ],
    hints: [
      'Distance\'ın gövdesi, dersteki örnekle aynı mantıkta: önce iki farkı hesapla, sonra karelerinin toplamının karekökünü <code>return</code> et.',
      '<code>BudgetStatus</code> için önce imzayı yaz: <code>string BudgetStatus(int tris, int budget = 10000) { ... }</code>. İçeride ilk kontrol negatiflik olsun (erken return), sonra bütçe kontrolü, en sonda da her durumda çalışacak bir return.',
      'Çağrılar: <code>Console.WriteLine(BudgetStatus(12000));</code> gibi. Sonuncusu <code>BudgetStatus(800, budget: 500)</code>. "Tam bütçe" (10000) aşım sayılmaz: <code>&gt;</code> kullan, <code>&gt;=</code> değil.',
    ],
    solution: cs`double Distance(double x1, double y1, double x2, double y2)
{
    double dx = x2 - x1;
    double dy = y2 - y1;
    return Math.Sqrt(dx * dx + dy * dy);
}

string BudgetStatus(int tris, int budget = 10000)
{
    if (tris < 0) return "geçersiz";
    if (tris > budget) return "bütçe aşıldı";
    return "uygun";
}

Console.WriteLine(Distance(0, 0, 3, 4));
Console.WriteLine(BudgetStatus(12000));
Console.WriteLine(BudgetStatus(-1));
Console.WriteLine(BudgetStatus(800, budget: 500));`,
    explain: 'Her fonksiyon girdisini parametrelerden alıp sonucu <code>return</code> ile geri veriyor; ekrana yazma işi çağırana kalıyor. Bu ayrım sayesinde test kodu (harness) fonksiyonlarını farklı değerlerle çağırıp sonuçlarını doğrudan kontrol edebildi. Erken return, geçersiz girdiyi diğer kontrollere hiç bulaştırmadan ayıkladı.',
  },
  quiz: [
    {
      q: '<code>double Scale(double value, double factor)</code> tanımı ve <code>Scale(2.5, 4)</code> çağrısı için hangisi doğru?',
      options: [
        { t: 'value ve factor parametredir; 2.5 ve 4 argümandır', correct: true, why: 'Doğru. Parametreler tanımdaki isimli kutulardır, argümanlar çağrı sırasında gönderilen gerçek değerlerdir.' },
        { t: '2.5 ve 4 parametredir; value ve factor argümandır', why: 'Tam tersi. Tanımda yazılan isimler parametre, çağrıda gönderilen değerler argümandır.' },
        { t: 'İkisi de aynı şeydir, fark yoktur', why: 'Günlük konuşmada karıştırılır ama farklı şeylerdir: biri "soket", diğeri sokete bağlanan "değer".' },
        { t: 'double, dönüş değeridir', why: 'double dönüş TÜRÜDÜR. Dönüş değeri, çalışma sırasında return ile gönderilen gerçek sayıdır (burada 10).' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`void Reset(int count)
{
    count = 0;
}

int verts = 8;
Reset(verts);
Console.WriteLine(verts);`,
      verifyOutput: true,
      options: [
        { t: '8', correct: true, why: 'Doğru. int değer ile geçirilir: Reset, verts\'in bir kopyasını sıfırladı; asıl değişken 8 kaldı.' },
        { t: '0', why: 'Fonksiyon parametrenin kopyasını değiştirir. Çağıranın değişkenini değiştirmek için değer döndürüp atamak gerekir.' },
        { t: 'Derleme hatası: void fonksiyon değişkeni değiştiremez', why: 'Kod derlenir; sadece beklediğin etkiyi yapmaz.' },
        { t: 'Boş çıktı', why: 'Son satır verts\'i yazdırıyor, çıktı boş olamaz.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`double Lerp(double a, double b, double t = 0.5)
{
    return a + (b - a) * t;
}

Console.WriteLine(Lerp(10, 20) + Lerp(b: 4, a: 0, t: 0.25));`,
      verifyOutput: true,
      options: [
        { t: '16', correct: true, why: 'Doğru. Lerp(10, 20) varsayılan t=0.5 ile 15; Lerp(0, 4, 0.25) = 1. Dönen değerler toplanır: 16.' },
        { t: '15', why: 'İkinci çağrının sonucu da (1) toplama dahil. Dönen değerler ifadelerde normal sayılar gibi kullanılır.' },
        { t: '151', why: 'İki double toplanıyor, string birleştirme yok.' },
        { t: 'Derleme hatası: argüman sırası yanlış', why: 'Adlandırılmış argümanlarda sıra serbesttir; b: 4, a: 0 geçerlidir.' },
      ],
    },
    {
      q: 'Bu fonksiyon neden derlenmez?',
      code: cs`int Sign(int n)
{
    if (n > 0) return 1;
    if (n < 0) return -1;
}`,
      options: [
        { t: 'n == 0 olduğunda hiçbir return\'e ulaşılmıyor (CS0161)', correct: true, why: 'Doğru. Değer döndüren fonksiyonda her yol bir return\'e çıkmalı. Sona return 0; eklemek düzeltir.' },
        { t: 'Bir fonksiyonda birden fazla return olamaz', why: 'Olabilir. Erken return tam olarak budur; sadece biri çalışır.' },
        { t: 'Negatif sayı döndürülemez', why: 'int negatif değerleri de tutar; -1 döndürmek sorun değil.' },
        { t: 'Parametre adı n olamaz', why: 'n geçerli bir isimdir; sorun isimde değil, eksik return yolunda.' },
      ],
    },
    {
      q: '<code>void PrintInfo(string name)</code> tanımlı. <code>string s = PrintInfo("Cube");</code> satırı için ne söylenebilir?',
      options: [
        { t: 'Derlenmez: void fonksiyon değer döndürmez, atanacak bir şey yok', correct: true, why: 'Doğru. void "geriye hiçbir şey vermem" demektir; sonucu bir değişkene atanamaz.' },
        { t: 'Çalışır ve s boş string ("") olur', why: 'C# bunu otomatik olarak boş metne çevirmez; derleme aşamasında reddeder.' },
        { t: 'Çalışır ve s "Cube" olur', why: 'Fonksiyon argümanı geri döndürmez; void fonksiyonun dönüş değeri yoktur.' },
        { t: 'Çalışma zamanında çöker', why: 'Program çalışmaya hiç başlamaz; hata derleme anında yakalanır.' },
      ],
    },
    {
      q: 'Aşağıdaki iki static metot aynı sınıfta tanımlı: <code>Area(double side)</code> ve <code>Area(double w, double h)</code>. <code>Area(2, 5)</code> çağrısında ne olur?',
      options: [
        { t: 'İki parametreli sürüm seçilir: derleyici argüman sayısına ve türlerine bakar', correct: true, why: 'Doğru. Aşırı yüklemede (overloading) hangi sürümün çağrılacağına parametre listesine göre derleme anında karar verilir.' },
        { t: 'Hata: aynı isimde iki metot olamaz', why: 'Parametre listeleri farklı olduğu sürece olabilir. Bu, aşırı yüklemedir.' },
        { t: 'İlk yazılan sürüm çağrılır, 5 yok sayılır', why: 'C# argümanları sessizce yok saymaz; uygun parametre listesini arar.' },
        { t: 'İkisi de sırayla çağrılır', why: 'Bir çağrı tek bir metodu çalıştırır.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Blender\'ın Map Range node\'unu yaz',
    prompt: `
<p>Blender'daki <b>Map Range</b> node'u bir değeri bir aralıktan diğerine taşır (ör. 0–10 aralığındaki 5 → 0–1 aralığında 0.5). Bunu iki fonksiyonla yaz:</p>
<ol>
<li><code>double Lerp(double a, double b, double t)</code> — <code>a + (b - a) * t</code> döndürür.</li>
<li><code>double MapRange(double value, double fromMin, double fromMax, double toMin = 0, double toMax = 1)</code>:
<ul>
<li><code>fromMin == fromMax</code> ise (sıfıra bölme olmasın) hemen <code>toMin</code> döndür (erken return).</li>
<li><code>t = (value - fromMin) / (fromMax - fromMin)</code> hesapla; Blender'daki "Clamp" seçeneği gibi <code>t</code>'yi 0–1 aralığına sıkıştır.</li>
<li>Sonucu <b>kendi Lerp fonksiyonunu çağırarak</b> döndür.</li>
</ul></li>
</ol>
<p>Ardından şunları yazdır:</p>
<pre><code>MapRange(5, 0, 10)
MapRange(15, 0, 10, 100, 200)
MapRange(-3, 0, 10, toMax: 50)
MapRange(3, 3, 3, toMin: 7)</code></pre>
<pre class="expected">0.5
200
0
7</pre>`,
    starter: cs`double Lerp(double a, double b, double t)
{
    return a + (b - a) * t;
}

double MapRange(double value, double fromMin, double fromMax, double toMin = 0, double toMax = 1)
{
    // 1) fromMin == fromMax ise erken return
    // 2) t'yi hesapla ve 0..1 aralığına sıkıştır
    // 3) Lerp ile sonucu döndür
    return 0;
}

Console.WriteLine(MapRange(5, 0, 10));
`,
    checks: [
      { type: 'output', expect: '0.5\n200\n0\n7', msg: 'Dört satırlık çıktı birebir aynı olmalı' },
      { type: 'harness', append: cs`Console.WriteLine(MapRange(25, 0, 100));
Console.WriteLine(MapRange(1500, 1000, 2000, 0, 10));
Console.WriteLine(MapRange(5, 10, 0));
Console.WriteLine(MapRange(99, 1, 1, toMin: -1, toMax: 5));`, expect: '0.25\n5\n0.5\n-1', msg: 'MapRange farklı aralıklarla (ters aralık dahil) doğru çalışmalı' },
      { type: 'code', pattern: 'MapRange[\\s\\S]*\\{[\\s\\S]*Lerp\\s*\\(', msg: 'MapRange sonucu Lerp fonksiyonunu çağırarak hesaplamalı' },
    ],
    hints: [
      'Map Range iki adımdır: önce değerin kaynak aralıktaki <em>oranını</em> (t) bul, sonra bu oranla hedef aralıkta Lerp yap.',
      'Sıkıştırma için iki <code>if</code> yeter: t 0\'dan küçükse 0 yap, 1\'den büyükse 1 yap. Erken return\'ü bölmeden ÖNCE yaz.',
      'Son satır <code>return Lerp(toMin, toMax, t);</code> biçiminde olmalı. Ters aralıkta (10 → 0) bölen negatif olur ama formül yine doğru çalışır.',
    ],
    solution: cs`double Lerp(double a, double b, double t)
{
    return a + (b - a) * t;
}

double MapRange(double value, double fromMin, double fromMax, double toMin = 0, double toMax = 1)
{
    if (fromMin == fromMax) return toMin;
    double t = (value - fromMin) / (fromMax - fromMin);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return Lerp(toMin, toMax, t);
}

Console.WriteLine(MapRange(5, 0, 10));
Console.WriteLine(MapRange(15, 0, 10, 100, 200));
Console.WriteLine(MapRange(-3, 0, 10, toMax: 50));
Console.WriteLine(MapRange(3, 3, 3, toMin: 7));`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Milimetreden metreye',
      prompt: `<p><code>double MmToM(double mm)</code> fonksiyonunu yaz: mm değerini metreye çevirip döndürsün. Sonra <code>MmToM(2400)</code> ve <code>MmToM(150)</code> sonuçlarını yazdır.</p><pre class="expected">2.4
0.15</pre>`,
      starter: cs`double MmToM(double mm)
{
    return 0;
}

Console.WriteLine(MmToM(2400));
Console.WriteLine(MmToM(150));`,
      checks: [
        { type: 'output', expect: '2.4\n0.15' },
        { type: 'harness', append: cs`Console.WriteLine(MmToM(1000));
Console.WriteLine(MmToM(5));`, expect: '1\n0.005', msg: 'MmToM her değer için doğru çevirmeli' },
      ],
      hints: ['1 metre = 1000 mm.', 'Fonksiyon gövdesi tek satır: <code>return mm / ...;</code>'],
      solution: cs`double MmToM(double mm)
{
    return mm / 1000;
}

Console.WriteLine(MmToM(2400));
Console.WriteLine(MmToM(150));`,
    },
    {
      difficulty: 2,
      title: 'Boyutu okunur biçimde yaz',
      prompt: `<p><code>string FormatLength(double mm, string unit = "mm")</code> yaz. <code>unit</code> <code>"mm"</code> ise <code>"2400 mm"</code>, <code>"cm"</code> ise <code>"240 cm"</code>, <code>"m"</code> ise <code>"2.4 m"</code> döndürsün; başka bir birim gelirse <code>"bilinmeyen birim"</code>. Şunları yazdır: <code>FormatLength(2400)</code>, <code>FormatLength(2400, "m")</code>, <code>FormatLength(2400, unit: "cm")</code>, <code>FormatLength(2400, "inch")</code>.</p><pre class="expected">2400 mm
2.4 m
240 cm
bilinmeyen birim</pre>`,
      starter: cs`// FormatLength fonksiyonunu yaz
`,
      checks: [
        { type: 'output', expect: '2400 mm\n2.4 m\n240 cm\nbilinmeyen birim' },
        { type: 'harness', append: cs`Console.WriteLine(FormatLength(15, "cm"));
Console.WriteLine(FormatLength(500));`, expect: '1.5 cm\n500 mm', msg: 'FormatLength farklı değerlerle de doğru çalışmalı' },
        { type: 'code', pattern: 'string\\s+unit\\s*=\\s*"mm"', msg: 'unit parametresinin varsayılan değeri "mm" olmalı' },
      ],
      hints: ['Her birim için bir <code>if</code> ve erken <code>return</code> kullanabilirsin.', 'cm için mm / 10, m için mm / 1000. Metin birleştirme: <code>return (mm / 10) + " cm";</code>'],
      solution: cs`string FormatLength(double mm, string unit = "mm")
{
    if (unit == "mm") return mm + " mm";
    if (unit == "cm") return (mm / 10) + " cm";
    if (unit == "m") return (mm / 1000) + " m";
    return "bilinmeyen birim";
}

Console.WriteLine(FormatLength(2400));
Console.WriteLine(FormatLength(2400, "m"));
Console.WriteLine(FormatLength(2400, unit: "cm"));
Console.WriteLine(FormatLength(2400, "inch"));`,
    },
    {
      difficulty: 3,
      title: 'Kendi TryParse\'ın: duvar kalınlığı',
      prompt: `<p><code>bool TryParseThickness(string text, out double mm)</code> yaz. Metin bir sayıya çevrilemiyorsa ya da sayı 0 veya negatifse <code>false</code> döndürsün; geçerliyse <code>true</code> döndürüp sayıyı <code>mm</code>'ye yazsın. (İpucu: içeride <code>double.TryParse</code> kullan.) Sonra <code>"200"</code>, <code>"-5"</code> ve <code>"abc"</code> için şu çıktıyı üret:</p><pre class="expected">200 → geçerli: 200 mm
-5 → geçersiz
abc → geçersiz</pre>`,
      starter: cs`bool TryParseThickness(string text, out double mm)
{
    mm = 0;
    return false;
}

void Report(string text)
{
    // TryParseThickness'i çağır ve sonucu yazdır
}

Report("200");
Report("-5");
Report("abc");`,
      checks: [
        { type: 'output', expect: '200 → geçerli: 200 mm\n-5 → geçersiz\nabc → geçersiz' },
        { type: 'harness', append: cs`bool a = TryParseThickness("12.5", out double v1);
Console.WriteLine(a + " " + v1);
bool b = TryParseThickness("0", out double v2);
Console.WriteLine(b);`, expect: 'True 12.5\nFalse', msg: 'TryParseThickness ondalıklı değerleri kabul etmeli, 0\'ı reddetmeli' },
        { type: 'code', pattern: 'double\\.TryParse', msg: 'İçeride double.TryParse kullan' },
      ],
      hints: [
        '<code>out</code> parametresine fonksiyon bitmeden mutlaka bir değer atanmalı. <code>double.TryParse(text, out mm)</code> bunu senin yerine yapar.',
        'Önce <code>if (!double.TryParse(text, out mm)) return false;</code>, sonra pozitiflik kontrolü.',
        '<code>Report</code> içinde: <code>if (TryParseThickness(text, out double mm)) Console.WriteLine(text + " → geçerli: " + mm + " mm"); else ...</code>',
      ],
      solution: cs`bool TryParseThickness(string text, out double mm)
{
    if (!double.TryParse(text, out mm)) return false;
    if (mm <= 0) return false;
    return true;
}

void Report(string text)
{
    if (TryParseThickness(text, out double mm))
    {
        Console.WriteLine(text + " → geçerli: " + mm + " mm");
    }
    else
    {
        Console.WriteLine(text + " → geçersiz");
    }
}

Report("200");
Report("-5");
Report("abc");`,
    },
  ],
  vocab: [
    { en: 'Function', tr: 'Fonksiyon', ja: '関数', kana: 'かんすう', romaji: 'kansū' },
    { en: 'Argument / Parameter', tr: 'Argüman / Parametre (genel)', ja: '引数', kana: 'ひきすう', romaji: 'hikisū' },
    { en: 'Parameter (formal)', tr: 'Parametre', ja: '仮引数', kana: 'かりひきすう', romaji: 'karihikisū' },
    { en: 'Argument (actual)', tr: 'Argüman', ja: '実引数', kana: 'じつひきすう', romaji: 'jitsuhikisū' },
    { en: 'Return value', tr: 'Dönüş değeri', ja: '戻り値', kana: 'もどりち', romaji: 'modorichi' },
    { en: 'Return type', tr: 'Dönüş türü', ja: '戻り値の型', kana: 'もどりちのかた', romaji: 'modorichi no kata' },
    { en: 'Default argument', tr: 'Varsayılan parametre', ja: 'デフォルト引数', kana: 'デフォルトひきすう', romaji: 'deforuto hikisū' },
    { en: 'Named argument', tr: 'Adlandırılmış argüman', ja: '名前付き引数', kana: 'なまえつきひきすう', romaji: 'namaetsuki hikisū' },
    { en: 'Pass by value', tr: 'Değer ile geçirme', ja: '値渡し', kana: 'あたいわたし', romaji: 'ataiwatashi' },
    { en: 'Overload', tr: 'Aşırı yükleme', ja: 'オーバーロード', kana: 'オーバーロード', romaji: 'ōbārōdo' },
    { en: 'Call', tr: 'Çağırma / çağrı', ja: '呼び出し', kana: 'よびだし', romaji: 'yobidashi' },
  ],
  summary: [
    'Parametre tanımdaki isimli kutudur, argüman çağrıda gönderilen gerçek değerdir; sırayla ve türleri uyumlu olarak eşleşirler.',
    'Dönüş türü (int, double, string...) fonksiyonun ne geri vereceğini söyler; return değeri gönderir ve fonksiyonu hemen bitirir. void hiçbir şey döndürmez.',
    'Dönen değer bir ifadenin yerine geçer: değişkene atanabilir, toplanabilir, başka bir fonksiyona argüman olabilir.',
    'Varsayılan parametreler çağrıyı kısaltır, adlandırılmış argümanlar okunurluğu artırır; erken return geçersiz girdiyi baştan ayıklar.',
    'int/double/bool değer ile geçirilir: fonksiyon kopyayla çalışır, çağıranın değişkeni değişmez. Değiştirmek istiyorsan değeri döndür ve ata.',
    'out ikinci bir sonuç döndürür (TryParse); aşırı yükleme aynı isimli, farklı parametreli metotlardır. CS7036 eksik argüman, CS1501 yanlış sayı, CS0161 return\'süz yol demektir.',
  ],
};
