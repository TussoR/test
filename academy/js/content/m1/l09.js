import { cs } from '../helpers.js';

export default {
  id: 'm1-l09',
  module: 'm1',
  title: 'Fonksiyonlar (metotlar)',
  titleEn: 'Functions (methods)',
  titleJa: '関数',
  minutes: 60,
  level: 2,
  objectives: [
    'Fonksiyonların neden var olduğunu açıklamak: tekrarı önlemek (DRY), isimlendirmek, yeniden kullanmak',
    'Üst düzey programda void yerel fonksiyon tanımlamak ve çağırmak',
    'Fonksiyon çağrılarının sırasını ve çağrı yığınını (call stack) adım adım izleyebilmek',
    'class Program içindeki klasik static metot yapısını tanımak',
    'PascalCase isimlendirmeyi uygulamak; CS0103 ve CS0120 hatalarını okuyup düzeltmek',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Fonksiyon nedir? Koda bir isim vermek',
      body: `
<p>Bir <t en="function" ja="関数">fonksiyon</t>, bir iş yapan kod satırlarına <b>bir isim verip</b> o isimle istediğin kadar çalıştırabilmendir. C#'ta sınıflara ait fonksiyonlara <t en="method" ja="メソッド">metot</t> denir; günlük konuşmada iki kelime çoğunlukla aynı anlamda kullanılır.</p>
<pre>void SelamVer()          // tanım (definition)
{
    Console.WriteLine("Merhaba!");
}

SelamVer();              // çağrı (call)
SelamVer();              // istediğin kadar</pre>
<p><b>Neden?</b></p>
<ul>
<li><b>Tekrar etme</b> (<t en="DRY: Don't Repeat Yourself" ja="DRY原則">DRY</t>): Aynı 10 satırı 5 yere kopyalarsan, bir hata bulduğunda 5 yerde düzeltmen gerekir. Fonksiyonda tek yerde düzeltirsin.</li>
<li><b>İsimlendirme:</b> <code>DuvarCiz()</code> yazmak, 20 satırlık matematiği okumaktan çok daha anlaşılırdır. Kod kendi kendini anlatır.</li>
<li><b>Yeniden kullanım</b> (<t en="reuse" ja="再利用">reuse</t>): Bir kez yaz, her yerde kullan — başka projelerde bile.</li>
</ul>
<p>Aslında ilk dersten beri fonksiyon kullanıyorsun: <code>Console.WriteLine(...)</code> da birilerinin yazdığı bir metottur. Bugün <b>kendi</b> fonksiyonlarını yazıyorsun.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Blender operatörleri ve Maya komutları',
      body: `
<p>Blender'da <b>Add → Mesh → Cube</b> menüsüne tıkladığında aslında bir fonksiyon çağırırsın. Python konsolunda bunu açıkça görebilirsin: menü, <code>bpy.ops.mesh.primitive_cube_add()</code> adlı bir <b>operatör</b> çalıştırır. Maya'da da <code>polyCube</code> gibi komutlar aynı şekilde çalışır.</p>
<table class="compare">
<tr><th>3D yazılımı</th><th>C# fonksiyonu</th></tr>
<tr><td>Operatörün içindeki kod (küpün 8 köşesini oluşturan)</td><td>Fonksiyonun <b>gövdesi</b> (tanımı)</td></tr>
<tr><td>Menüye tıklamak / kısayol tuşu</td><td>Fonksiyonu <b>çağırmak</b>: <code>KupOlustur();</code></td></tr>
<tr><td>Operatörün adı: "Add Cube"</td><td>Fonksiyonun <b>adı</b>: <code>KupOlustur</code></td></tr>
<tr><td>Birkaç operatörü sırayla çalıştıran makro / script</td><td>Başka fonksiyonları çağıran bir fonksiyon</td></tr>
</table>
<p>Küp eklemek için her seferinde 8 vertex'i elle girmiyorsun; birisi bu işi bir kez bir fonksiyona koymuş, sen sadece adıyla çağırıyorsun. İşte fonksiyonların bütün fikri bu.</p>`,
    },
    {
      kind: 'code',
      title: 'İlk fonksiyonun: Tanımla ve çağır',
      code: cs`AyracCiz();
Console.WriteLine("Sahne: Mutfak");
AyracCiz();
Console.WriteLine("Obje sayısı: 42");
AyracCiz();

void AyracCiz()
{
    Console.WriteLine("====================");
}`,
      explain: {
        1: '<t en="call" ja="呼び出し">Çağrı</t>: Fonksiyonun adı + <code>()</code> + <code>;</code>. Bilgisayar 7. satırdaki fonksiyonun gövdesine <b>atlar</b>, oradaki kodu çalıştırır, sonra buraya <b>geri döner</b> ve 2. satırdan devam eder.',
        2: 'Fonksiyondan döndükten sonra normal akış devam eder.',
        3: 'Aynı fonksiyonu tekrar çağırıyoruz. Ayraç metnini bir daha yazmadık!',
        5: 'Üçüncü çağrı. Ayracı değiştirmek istersen (ör. <code>----</code>) sadece 9. satırı değiştirmen yeterli — üç yer birden değişir.',
        7: '<t en="definition" ja="定義">Tanım</t>: <code>void</code> = "bu fonksiyon geriye bir değer döndürmez, sadece bir iş yapar". <code>AyracCiz</code> = adı. <code>()</code> = parametre listesi (şimdilik boş). Tanım <b>tek başına hiçbir şey çalıştırmaz</b>; sadece "böyle bir iş var" der.',
        8: 'Fonksiyonun gövdesi süslü parantezler arasındadır.',
        9: 'Gövde: fonksiyon her çağrıldığında çalışan kod.',
        10: 'Gövde bitti → bilgisayar fonksiyonu <b>çağıran yere</b> geri döner.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Adım adım çalıştır ve işaretçinin 1. satırdan 9. satıra atlayıp sonra 2. satıra geri döndüğünü izle. Üst düzey programlarda yerel fonksiyonları genelde dosyanın <b>sonuna</b> yazarız; derleyici tüm dosyayı önceden okuduğu için tanımın çağrıdan sonra gelmesi sorun değildir. Bazı örneklerde <code>static void AyracCiz()</code> gördüğünde şaşırma: <code>static</code> yerel fonksiyon, dışındaki değişkenlere erişemez; bunun dışında aynı şekilde çağrılır.',
    },
    {
      kind: 'visual',
      title: 'Çağrı yığını (call stack): Bilgisayar nereye döneceğini nasıl hatırlar?',
      svg: `
<svg viewBox="0 0 760 290" role="img" aria-label="Fonksiyon çağrıldıkça büyüyen ve fonksiyon bittikçe küçülen çağrı yığını">
  <defs><marker id="ar-l09" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <text x="80" y="24" class="t2">1. Başla</text>
    <text x="230" y="24" class="t2">2. SahneHazirla()</text>
    <text x="380" y="24" class="t2">3. KupOlustur()</text>
    <text x="530" y="24" class="t2">4. KupOlustur bitti</text>
    <text x="680" y="24" class="t2">5. SahneHazirla bitti</text>

    <line x1="145" y1="50" x2="163" y2="50" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l09)"/>
    <line x1="295" y1="50" x2="313" y2="50" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l09)"/>
    <line x1="445" y1="50" x2="463" y2="50" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l09)"/>
    <line x1="595" y1="50" x2="613" y2="50" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l09)"/>
    <text x="230" y="46" class="t3">çağır</text><text x="380" y="46" class="t3">çağır</text>
    <text x="530" y="46" class="t3">dön</text><text x="680" y="46" class="t3">dön</text>

    <rect x="20" y="190" width="120" height="40" rx="8" class="box hi"/>
    <text x="80" y="215" class="t1">Main</text>

    <rect x="170" y="190" width="120" height="40" rx="8" class="box"/>
    <text x="230" y="215" class="t2">Main</text>
    <rect x="170" y="145" width="120" height="40" rx="8" class="box hi"/>
    <text x="230" y="170" class="t1">SahneHazirla</text>

    <rect x="320" y="190" width="120" height="40" rx="8" class="box"/>
    <text x="380" y="215" class="t2">Main</text>
    <rect x="320" y="145" width="120" height="40" rx="8" class="box"/>
    <text x="380" y="170" class="t2">SahneHazirla</text>
    <rect x="320" y="100" width="120" height="40" rx="8" class="box hi"/>
    <text x="380" y="125" class="t1">KupOlustur</text>

    <rect x="470" y="190" width="120" height="40" rx="8" class="box"/>
    <text x="530" y="215" class="t2">Main</text>
    <rect x="470" y="145" width="120" height="40" rx="8" class="box hi"/>
    <text x="530" y="170" class="t1">SahneHazirla</text>
    <rect x="470" y="100" width="120" height="40" rx="8" class="box dim"/>
    <text x="530" y="125" class="t3">(kaldırıldı)</text>

    <rect x="620" y="190" width="120" height="40" rx="8" class="box hi"/>
    <text x="680" y="215" class="t1">Main</text>
    <rect x="620" y="145" width="120" height="40" rx="8" class="box dim"/>
    <text x="680" y="170" class="t3">(kaldırıldı)</text>

    <line x1="10" y1="236" x2="750" y2="236" class="ln"/>
    <text x="380" y="258" class="t2">Vurgulu kutu = şu an çalışan fonksiyon (yığının tepesi). Çağrı üste ekler, bitiş üstten kaldırır.</text>
    <text x="380" y="280" class="t3">Her kutu "nereden çağrıldım, nereye döneceğim" bilgisini tutar.</text>
  </g>
</svg>`,
      caption: `
<p>Bilgisayar, fonksiyon çağrılarını üst üste konmuş tabaklar gibi bir <t en="call stack" ja="コールスタック">çağrı yığını</t>nda tutar. Bir fonksiyon çağrıldığında yığının <b>üstüne</b> yeni bir kutu (çerçeve / frame) eklenir; içinde "işim bitince hangi satıra döneceğim" bilgisi vardır. Fonksiyon bitince kutu kaldırılır ve bilgisayar alttakinin kaldığı yerden devam eder.</p>
<p>Üst düzey programlarda <b>Main</b>'i sen yazmazsın ama derleyici onu senin için oluşturur — yığının en altındaki odur. Programın bir hata verdiğinde gördüğün "stack trace" (yığın izi) tam olarak bu yığının o anki fotoğrafıdır.</p>`,
    },
    {
      kind: 'code',
      title: 'Fonksiyonu çağıran fonksiyon: Çağrı sırasını izle',
      code: cs`Console.WriteLine("Program başladı");
SahneHazirla();
Console.WriteLine("Program bitti");

void SahneHazirla()
{
    Console.WriteLine("  Sahne hazırlanıyor...");
    KupOlustur();
    KupOlustur();
    Console.WriteLine("  Sahne hazır.");
}

void KupOlustur()
{
    Console.WriteLine("    Küp oluşturuldu");
}`,
      explain: {
        1: 'Yığında sadece Main var.',
        2: 'SahneHazirla çağrılır → yığına eklenir. Bilgisayar "dönüşte 3. satıra gel" diye not alır ve 7. satıra atlar.',
        3: 'Bu satır, SahneHazirla <b>tamamen bittikten sonra</b> çalışır — içindeki iki KupOlustur çağrısı dahil.',
        5: 'Bir fonksiyon başka fonksiyonları çağırabilir. Bu, Blender\'da birkaç operatörü sırayla çalıştıran bir <t en="macro" ja="マクロ">makro</t> gibidir.',
        8: 'İç içe çağrı: Yığın şimdi Main → SahneHazirla → KupOlustur. Bilgisayar 15. satıra atlar.',
        9: 'İlk KupOlustur bitti, 9. satıra dönüldü; aynı fonksiyon ikinci kez çağrılır.',
        10: 'İki küp de bitti. SahneHazirla\'nın son satırı.',
        11: 'SahneHazirla biter → yığından kaldırılır → 3. satıra dönülür.',
        15: 'Girintiler (boşluklar) sadece çıktıda kimin kimi çağırdığını görmeyi kolaylaştırmak için.',
      },
      runnable: true,
      stepper: true,
      note: '"Adım adım" modunda satırların hangi sırayla çalıştığını takip et: 1 → 2 → 7 → 8 → 15 → 9 → 15 → 10 → 3. Kodun <b>yazıldığı</b> sıra ile <b>çalıştığı</b> sıra artık aynı değil — fonksiyonlarla gelen en önemli zihinsel değişim bu.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Hangi sırayla yazılır?',
      code: cs`Console.WriteLine("Başla");
A();
B();

void A()
{
    Console.WriteLine("A1");
    B();
    Console.WriteLine("A2");
}

void B()
{
    Console.WriteLine("B");
}`,
      options: ['Başla\nA1\nB\nA2\nB', 'Başla\nA1\nA2\nB', 'Başla\nA1\nA2\nB\nB', 'A1\nB\nA2\nB\nBaşla'],
      answer: 0,
      explain: '"Başla" yazılır. <code>A()</code> çağrılır: "A1" yazılır, A içinde <code>B()</code> çağrılır → "B", B bitince A\'ya dönülür → "A2". A bitince ana programa dönülür ve 3. satırdaki <code>B()</code> çalışır → "B". Tanımların dosyadaki yeri değil, <b>çağrıların sırası</b> belirleyicidir.',
    },
    {
      kind: 'code',
      title: 'Bir parametre: Fonksiyona bilgi göndermek (ön izleme)',
      code: cs`KupOlustur("Masa_Ayagi");
KupOlustur("Raf");
KupOlustur("Cekmece");

void KupOlustur(string ad)
{
    Console.WriteLine($"Küp oluşturuldu: {ad}");
}`,
      explain: {
        1: 'Çağırırken parantezin içine bir değer koyuyoruz: <code>"Masa_Ayagi"</code>. Bu değer fonksiyona gönderilir.',
        2: 'Aynı fonksiyon, farklı bir isimle. Blender\'da Add Cube panelinde "Size" değerini değiştirmek gibi: işlem aynı, ayar farklı.',
        5: '<code>string ad</code> bir <t en="parameter" ja="引数">parametre</t>dir: fonksiyonun içinde kullanılan, değeri her çağrıda dışarıdan gelen bir değişken. Sadece bu fonksiyonun içinde yaşar.',
        7: 'Her çağrıda <code>ad</code> farklı değer taşır, bu yüzden üç farklı satır yazılır.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Şimdilik bu kadarı yeterli: Bir sonraki ders (Ders 10) tamamen parametrelere ve fonksiyondan değer döndürmeye (<code>return</code>) ayrılmış. Bu derste odak, fonksiyonu tanımlamak, çağırmak ve çağrı sırasını anlamak.',
    },
    {
      kind: 'code',
      title: 'Klasik yapı: class Program içinde static metotlar',
      code: cs`using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("CAD eklentisi yüklendi");
        CizgiAraci();
        CizgiAraci();
    }

    static void CizgiAraci()
    {
        Console.WriteLine("Çizgi aracı çalıştı");
    }
}`,
      explain: {
        3: 'İlk derste gördüğün klasik yapı. Büyük projelerde, kitaplarda ve iş yerinde çoğunlukla bunu göreceksin.',
        5: '<code>Main</code> de bir metottur — programın giriş noktası olan özel bir metot.',
        8: 'Aynı sınıftaki başka bir metodu adıyla çağırıyoruz.',
        12: 'Metot, Main\'in <b>yanında</b> (içinde değil) ve sınıfın içinde tanımlanır. <code>static</code> şimdilik şunu söyler: "Bu metodu çağırmak için bir nesne oluşturmaya gerek yok." Main static olduğu için, doğrudan çağırdığı metotlar da static olmalıdır.',
        14: 'Gövde, üst düzey versiyonla tamamen aynı.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Dene: 12. satırdaki <code>static</code> kelimesini sil ve çalıştır. <code>CS0120: An object reference is required...</code> hatasını göreceksin. Nedeni: static olmayan metotlar bir <b>nesneye</b> aittir; nesneleri Modül 2\'de öğreneceğiz. Bu kursun alıştırmalarında üst düzey yerel fonksiyonları kullanacağız; iki yazım da aynı fikri anlatır.',
    },
    {
      kind: 'warning',
      title: 'Sık yapılan hatalar',
      body: `
<ol>
<li><b>Yanlış yazılmış isim → CS0103.</b> <code>void KupOlustur()</code> tanımlayıp <code>kupOlustur();</code> çağırırsan: <code>CS0103: The name 'kupOlustur' does not exist in the current context</code>. C# büyük/küçük harfe duyarlıdır.</li>
<li><b>static metottan static olmayanı çağırmak → CS0120.</b> class Program yapısında <code>static</code> kelimesini unutursan oluşur.</li>
<li><b>Parantezleri unutmak.</b> <code>AyracCiz;</code> bir çağrı değildir → <code>CS0201</code>. Çağırmak için her zaman <code>AyracCiz();</code>.</li>
<li><b>Tanımlayıp çağırmamak.</b> Fonksiyonu tanımlamak onu çalıştırmaz. Çıktı boş geliyorsa, çağrıyı unutmuş olabilirsin.</li>
<li><b>İsimlendirme.</b> C#'ta metot isimleri <t en="PascalCase" ja="パスカルケース">PascalCase</t> yazılır: her kelimenin ilk harfi büyük (<code>DuvarCiz</code>, <code>KupOlustur</code>). Değişkenler ise camelCase (<code>duvarSayisi</code>). Bu bir derleyici kuralı değil, ama tüm .NET dünyasının uyduğu bir <t en="naming convention" ja="命名規則">isimlendirme kuralı</t>dır. İsim bir <b>fiil</b> olmalı: fonksiyon bir iş yapar.</li>
</ol>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Bu kodu düzelt',
      code: cs`CreateCube();
createCube();

void CreateCube()
{
    Console.WriteLine("Küp eklendi");
}`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        2: 'Derleyici <code>createCube</code> adında bir şey arıyor ama bulamıyor. Tanımdaki isimle karakter karakter karşılaştır.',
      },
      note: 'İpucu: Hata mesajındaki isme ve tanımdaki isme dikkatle bak. Düzelttiğinde "Küp eklendi" iki kez yazılmalı.',
    },
    {
      kind: 'cad',
      title: 'CAD yazılımları fonksiyonlardan inşa edilir',
      body: `
<p>Bir CAD programındaki her komut — çizgi çiz, ofset al, kes, ölçü ekle — kodda bir veya daha fazla fonksiyon olarak yaşar. Milyonlarca satırlık bir yazılım ancak böyle yönetilebilir: Her fonksiyon <b>tek bir işi</b> yapar ve adı o işi anlatır.</p>
<ul>
<li><b>Komut = fonksiyon:</b> "Duvar çiz" komutu içeride <code>DuvarCiz()</code>, o da <code>CizgiCiz()</code>, <code>KalinlikUygula()</code> gibi daha küçük fonksiyonları çağırabilir. Tıpkı bugünkü <code>SahneHazirla → KupOlustur</code> zinciri gibi.</li>
<li><b>Makrolar ve eklentiler:</b> Pek çok CAD/BIM programı, kullanıcıların tekrarlayan işleri otomatikleştirmesi için bir API sunar. Örneğin Autodesk'in AutoCAD ve Revit ürünleri için .NET (C#) ile eklenti yazılabilir. Bu eklentiler de temelde fonksiyonlardan oluşur.</li>
<li><b>Hata ayıklama:</b> Bir CAD programı çöktüğünde geliştiricilerin ilk baktığı şey çağrı yığınıdır: "Hangi fonksiyon, hangi fonksiyonun içinden çağrılırken çöktü?"</li>
</ul>
<p>Kod incelemelerinde (<t en="code review" ja="コードレビュー">kod incelemesi</t>) sık duyulan bir öneri "bu fonksiyon çok uzun, küçük parçalara bölelim"dir. İyi isimlendirilmiş küçük fonksiyonlar, bir ekibin aynı kod üzerinde rahatça çalışabilmesinin temelidir.</p>`,
    },
  ],
  exercise: {
    title: 'Küp raporu fonksiyonları',
    prompt: `
<p>İki fonksiyon yaz ve ana programda kullan:</p>
<ol>
<li><code>void AyracCiz()</code> — tam olarak <code>----------</code> (10 tire) yazdırır.</li>
<li><code>void KupBilgisi()</code> — önce <code>AyracCiz()</code>'i çağırır, sonra üç bilgi satırı yazar, sonra yine <code>AyracCiz()</code>'i çağırır.</li>
</ol>
<p>Ana program önce <code>Sahne raporu</code> yazmalı, sonra <code>KupBilgisi()</code>'ni çağırmalı. Beklenen çıktı:</p>
<pre class="expected">Sahne raporu
----------
Obje: Küp
Vertex: 8
Yüz: 6
----------</pre>
<p>Tire satırını kodda <b>sadece bir kez</b> yaz (AyracCiz'in içinde). Fonksiyonların ayrıca tek başlarına çağrılarak test edilecek.</p>`,
    starter: cs`// 1) Ana program: "Sahne raporu" yaz, sonra KupBilgisi'ni çağır


// 2) AyracCiz fonksiyonunu tanımla


// 3) KupBilgisi fonksiyonunu tanımla (içinde AyracCiz'i iki kez çağır)
`,
    checks: [
      { type: 'output', expect: 'Sahne raporu\n----------\nObje: Küp\nVertex: 8\nYüz: 6\n----------', msg: 'Programın çıktısı birebir aynı olmalı' },
      { type: 'harness', append: cs`AyracCiz();`, expect: '----------', msg: 'AyracCiz() tek başına çağrıldığında 10 tire yazmalı' },
      { type: 'harness', append: cs`KupBilgisi();`, expect: '----------\nObje: Küp\nVertex: 8\nYüz: 6\n----------', msg: 'KupBilgisi() tek başına çağrıldığında ayraçlar dahil 5 satır yazmalı' },
      { type: 'code', pattern: 'void\\s+AyracCiz\\s*\\(\\s*\\)', msg: 'void AyracCiz() adında bir fonksiyon tanımlamalısın' },
      { type: 'code', pattern: 'void\\s+KupBilgisi\\s*\\(\\s*\\)', msg: 'void KupBilgisi() adında bir fonksiyon tanımlamalısın' },
      { type: 'code', pattern: 'AyracCiz\\s*\\(\\s*\\)\\s*;[\\s\\S]*AyracCiz\\s*\\(\\s*\\)\\s*;', msg: 'KupBilgisi içinde AyracCiz()\'i (iki kez) çağırmalısın' },
      { type: 'notCode', pattern: '-{10}[\\s\\S]*-{10}', msg: 'Tire satırını sadece bir kez (AyracCiz içinde) yazmalısın — tekrar etme (DRY)' },
    ],
    hints: [
      'Önce en küçük parçayı yaz: <code>void AyracCiz() { ... }</code> gövdesinde tek bir <code>Console.WriteLine</code> var.',
      '<code>KupBilgisi</code>\'nin gövdesi 5 satır: ayraç çağrısı, üç <code>Console.WriteLine</code>, yine ayraç çağrısı. Bir fonksiyonu çağırmak için adını ve <code>();</code> yaz.',
      'Ana program iki satır: <code>Console.WriteLine("Sahne raporu");</code> ve <code>KupBilgisi();</code>. Fonksiyon tanımlarını bunların altına koy.',
    ],
    solution: cs`Console.WriteLine("Sahne raporu");
KupBilgisi();

void AyracCiz()
{
    Console.WriteLine("----------");
}

void KupBilgisi()
{
    AyracCiz();
    Console.WriteLine("Obje: Küp");
    Console.WriteLine("Vertex: 8");
    Console.WriteLine("Yüz: 6");
    AyracCiz();
}`,
    explain: 'Ana program <code>KupBilgisi()</code>\'ni çağırır; o da iki kez <code>AyracCiz()</code>\'i çağırır. Çağrı yığını en fazla üç kat derinliğe ulaşır: Main → KupBilgisi → AyracCiz. Tire satırı tek yerde yazıldığı için ayracı değiştirmek tek satırlık bir iştir.',
  },
  quiz: [
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`Console.WriteLine("1");
Yaz();
Console.WriteLine("3");

void Yaz()
{
    Console.WriteLine("2");
}`,
      verifyOutput: true,
      options: [
        { t: '1\n2\n3', correct: true, why: 'Doğru. Yaz() çağrılınca bilgisayar fonksiyona atlar, "2" yazar ve geri dönüp 3. satırdan devam eder.' },
        { t: '1\n3\n2', why: 'Tanımın dosyanın sonunda olması önemli değil; fonksiyon çağrıldığı anda (2. satırda) çalışır.' },
        { t: '1\n3', why: 'Yaz() 2. satırda çağrılıyor, bu yüzden gövdesi çalışır.' },
        { t: '2\n1\n3', why: 'Tanım tek başına hiçbir şey çalıştırmaz; kod hâlâ yukarıdan aşağıya ilerler ve önce "1" yazılır.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`void Uyari()
{
    Console.WriteLine("Dikkat!");
}

Console.WriteLine("Model kaydedildi");`,
      verifyOutput: true,
      options: [
        { t: 'Model kaydedildi', correct: true, why: 'Doğru. Uyari tanımlanmış ama hiç çağrılmamış. Tanım, kendi başına hiçbir şey yapmaz.' },
        { t: 'Dikkat!\nModel kaydedildi', why: 'Fonksiyon dosyanın başında tanımlanmış olsa da çağrılmadıkça çalışmaz.' },
        { t: 'Dikkat!', why: 'Uyari hiç çağrılmıyor; sadece WriteLine("Model kaydedildi") çalışır.' },
        { t: 'Derleme hatası', why: 'Çağrılmayan bir fonksiyon tanımlamak hata değildir (sadece gereksizdir).' },
      ],
    },
    {
      q: 'void KupOlustur() tanımındaki void ne anlama gelir?',
      options: [
        { t: 'Fonksiyon geriye bir değer döndürmez; sadece bir iş yapar', correct: true, why: 'Doğru. Değer döndüren fonksiyonları (int, double...) bir sonraki derste göreceğiz.' },
        { t: 'Fonksiyon boştur, içine kod yazılamaz', why: 'void gövdeyle ilgili değil, dönüş değeriyle ilgilidir. Gövdeye istediğin kadar kod yazabilirsin.' },
        { t: 'Fonksiyon sadece bir kez çağrılabilir', why: 'Fonksiyonlar istediğin kadar çağrılabilir; void bununla ilgili değil.' },
        { t: 'Fonksiyonun parametresi yoktur', why: 'Parametreler parantezin içinde tanımlanır; void dönüş türüdür.' },
      ],
    },
    {
      q: 'void CizgiCiz() tanımlıyken cizgiCiz(); yazmak neden CS0103 hatası verir?',
      options: [
        { t: 'C# büyük/küçük harfe duyarlıdır; cizgiCiz adında bir şey tanımlanmamıştır', correct: true, why: 'Doğru. CizgiCiz ile cizgiCiz derleyici için tamamen farklı iki isimdir.' },
        { t: 'Fonksiyon çağrılmadan önce tanımlanmalıdır', why: 'Yerel fonksiyonlar dosyanın herhangi bir yerinde tanımlanabilir; sorun isimdeki harf farkı.' },
        { t: 'Fonksiyon isimleri küçük harfle başlayamaz', why: 'Küçük harfle başlayabilir (sadece gelenek dışıdır). Sorun, çağrıdaki ismin tanımdakiyle aynı olmaması.' },
        { t: 'Noktalı virgül fazla', why: 'Çağrı deyimi ; ile biter; bu doğru bir yazım.' },
      ],
    },
    {
      q: 'class Program içinde static void Main()\'den, static olmayan void Ciz() metodunu doğrudan çağırınca CS0120 hatası alıyorsun. Neden?',
      options: [
        { t: 'static olmayan metotlar bir nesneye aittir; static Main\'in elinde böyle bir nesne yoktur', correct: true, why: 'Doğru. Şimdilik çözüm: Ciz\'i de static yapmak. Nesneleri Modül 2\'de öğreneceğiz.' },
        { t: 'Main sadece Console metotlarını çağırabilir', why: 'Main istediği metodu çağırabilir; sorun Ciz\'in static olmaması.' },
        { t: 'Ciz metodu Main\'den önce tanımlanmalıdır', why: 'Sınıf içinde metotların sırası önemli değildir.' },
        { t: 'void metotlar çağrılamaz', why: 'void metotlar elbette çağrılabilir; void sadece değer döndürmediğini söyler.' },
      ],
    },
    {
      q: 'Fonksiyon kullanmanın en önemli faydası hangisidir?',
      options: [
        { t: 'Aynı kodu tek bir yerde yazıp isimle tekrar tekrar kullanmak; değişiklik tek yerden yapılır', correct: true, why: 'Doğru. DRY (Don\'t Repeat Yourself) ilkesi ve okunabilirlik, fonksiyonların var olma sebebidir.' },
        { t: 'Programın her zaman daha hızlı çalışması', why: 'Fonksiyonlar hız için değil, düzen ve yeniden kullanım için vardır. (Çağrının çok küçük bir maliyeti bile vardır.)' },
        { t: 'Derleme hatalarını otomatik olarak önlemesi', why: 'Fonksiyonlar hata yapmanı engellemez; ama hatayı tek yerde düzeltmeni sağlar.' },
        { t: 'Değişken kullanma ihtiyacını ortadan kaldırması', why: 'Fonksiyonlar içinde de değişkenler kullanılır; ikisi farklı kavramlardır.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Prosedürel bina makrosu',
    prompt: `
<p>Küçük bir "prosedürel modelleme" makrosu yaz. Üç fonksiyon gerekiyor:</p>
<ol>
<li><code>void PencereKati()</code> — <code>| [] [] [] |</code> yazar.</li>
<li><code>void GirisKati()</code> — <code>| [] ][ [] |</code> yazar (ortada kapı).</li>
<li><code>void Bina(int katSayisi)</code> — önce çatı <code>+----------+</code>, sonra <b>katSayisi − 1</b> tane pencere katı, sonra giriş katı, en son yine <code>+----------+</code> yazar. Pencere katlarını bir <b>döngüyle</b> üret ve kat satırları için diğer iki fonksiyonu çağır.</li>
</ol>
<p>Ana programda <code>Bina(3);</code> çağrıldığında çıktı:</p>
<pre class="expected">+----------+
| [] [] [] |
| [] [] [] |
| [] ][ [] |
+----------+</pre>
<p>(Tek parametre burada sadece "kaç kat" bilgisini taşıyor; parametrelerin ayrıntısı bir sonraki derste.)</p>`,
    starter: cs`Bina(3);

// PencereKati, GirisKati ve Bina fonksiyonlarını yaz
`,
    checks: [
      { type: 'output', expect: '+----------+\n| [] [] [] |\n| [] [] [] |\n| [] ][ [] |\n+----------+', msg: 'Bina(3) çıktısı birebir aynı olmalı' },
      { type: 'harness', append: cs`Bina(1);`, expect: '+----------+\n| [] ][ [] |\n+----------+', msg: 'Bina(1) sadece çatı, giriş katı ve zemin yazmalı (pencere katı yok)' },
      { type: 'harness', append: cs`Bina(5);`, expect: '+----------+\n| [] [] [] |\n| [] [] [] |\n| [] [] [] |\n| [] [] [] |\n| [] ][ [] |\n+----------+', msg: 'Bina(5) dört pencere katı üretmeli' },
      { type: 'harness', append: cs`PencereKati();`, expect: '| [] [] [] |', msg: 'PencereKati() tek satır yazmalı' },
      { type: 'code', pattern: '(for|while)\\s*\\(', msg: 'Pencere katlarını bir döngüyle üretmelisin' },
      { type: 'notCode', pattern: '\\[\\] \\[\\] \\[\\][\\s\\S]*\\[\\] \\[\\] \\[\\]', msg: 'Pencere satırını sadece bir kez (PencereKati içinde) yaz; Bina onu çağırmalı' },
    ],
    hints: [
      'Önce iki küçük fonksiyonu yaz; her biri tek bir <code>Console.WriteLine</code> içerir.',
      '<code>Bina</code>\'nın içinde: çatı satırı, ardından <code>for (int i = 0; i &lt; katSayisi - 1; i++) { PencereKati(); }</code>, sonra <code>GirisKati();</code> ve zemin.',
      'Çatı ve zemin aynı metin: istersen onu da <code>void CatiCiz()</code> gibi bir fonksiyona koyabilirsin (DRY!). Bina(1) için döngü hiç dönmemeli: 1 − 1 = 0.',
    ],
    solution: cs`Bina(3);

void PencereKati()
{
    Console.WriteLine("| [] [] [] |");
}

void GirisKati()
{
    Console.WriteLine("| [] ][ [] |");
}

void Kenar()
{
    Console.WriteLine("+----------+");
}

void Bina(int katSayisi)
{
    Kenar();
    for (int i = 0; i < katSayisi - 1; i++)
    {
        PencereKati();
    }
    GirisKati();
    Kenar();
}`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Selamlama fonksiyonu',
      prompt: '<p><code>void Selamla()</code> adında, <code>Merhaba, CAD dünyası!</code> yazan bir fonksiyon tanımla ve ana programda onu <b>üç kez</b> çağır.</p><pre class="expected">Merhaba, CAD dünyası!\nMerhaba, CAD dünyası!\nMerhaba, CAD dünyası!</pre>',
      starter: cs`// Selamla fonksiyonunu tanımla ve 3 kez çağır
`,
      checks: [
        { type: 'output', expect: 'Merhaba, CAD dünyası!\nMerhaba, CAD dünyası!\nMerhaba, CAD dünyası!' },
        { type: 'harness', append: cs`Selamla();`, expect: 'Merhaba, CAD dünyası!', msg: 'Selamla() bir kez çağrıldığında tek satır yazmalı' },
        { type: 'notCode', pattern: 'Merhaba[\\s\\S]*Merhaba', msg: 'Metni sadece bir kez (fonksiyonun içinde) yazmalısın' },
      ],
      hints: ['Tanım: <code>void Selamla() { Console.WriteLine("..."); }</code>', 'Çağrı: <code>Selamla();</code> — üç kez alt alta.'],
      solution: cs`Selamla();
Selamla();
Selamla();

void Selamla()
{
    Console.WriteLine("Merhaba, CAD dünyası!");
}`,
    },
    {
      difficulty: 2,
      title: 'Merdiven çizen fonksiyon',
      prompt: '<p><code>void MerdivenCiz()</code> adında, bir döngü kullanarak 4 basamaklı bir merdiven yazan fonksiyon yaz. Ana programda onu bir kez çağır.</p><pre class="expected">#\n##\n###\n####</pre>',
      starter: cs`MerdivenCiz();

// MerdivenCiz fonksiyonunu yaz
`,
      checks: [
        { type: 'output', expect: '#\n##\n###\n####' },
        { type: 'harness', append: cs`MerdivenCiz();`, expect: '#\n##\n###\n####', msg: 'MerdivenCiz() tek başına çağrıldığında da 4 satır yazmalı' },
        { type: 'code', pattern: '(for|while)\\s*\\(', msg: 'Basamakları bir döngüyle üretmelisin' },
        { type: 'notCode', pattern: '####', msg: 'Basamakları elle yazma; döngüyle üret' },
      ],
      hints: ['İç içe iki döngü kullanabilirsin: dış döngü basamak sayısı (1–4), iç döngü o basamaktaki # sayısı.', 'İç döngüde <code>Console.Write("#");</code>, iç döngü bitince <code>Console.WriteLine();</code>'],
      solution: cs`MerdivenCiz();

void MerdivenCiz()
{
    for (int basamak = 1; basamak <= 4; basamak++)
    {
        for (int i = 0; i < basamak; i++)
        {
            Console.Write("#");
        }
        Console.WriteLine();
    }
}`,
    },
    {
      difficulty: 3,
      title: 'Blender usulü isimlendirme: Cube, Cube.001...',
      prompt: '<p>Blender aynı isimde ikinci bir obje eklediğinde ona <code>Cube.001</code>, sonra <code>Cube.002</code> der. <code>void KupEkle()</code> fonksiyonunu yaz: İlk çağrıda <code>Cube</code>, sonrakilerde <code>Cube.001</code>, <code>Cube.002</code>... yazsın. Fonksiyonun dışında (üstte) bir sayaç değişkeni tut. Ana programda KupEkle\'yi <b>4 kez</b> çağır.</p><pre class="expected">Cube\nCube.001\nCube.002\nCube.003</pre>',
      starter: cs`int eklenenKup = 0;

// KupEkle fonksiyonunu yaz ve 4 kez çağır
`,
      checks: [
        { type: 'output', expect: 'Cube\nCube.001\nCube.002\nCube.003' },
        { type: 'code', pattern: 'void\\s+KupEkle\\s*\\(\\s*\\)', msg: 'void KupEkle() adında bir fonksiyon tanımlamalısın' },
        { type: 'code', pattern: '(KupEkle\\s*\\(\\s*\\)\\s*;[\\s\\S]*){4}', msg: 'KupEkle()\'yi 4 kez çağırmalısın' },
        { type: 'notCode', pattern: '00[1-9]', msg: 'Numaraları elle yazma; sayaçtan biçimlendir (ipucu: {sayi:D3})' },
      ],
      hints: ['Fonksiyon, dışarıdaki <code>eklenenKup</code> değişkenini okuyup artırabilir (static olmayan yerel fonksiyonlar dışarıdaki değişkenleri görür).', 'İlk çağrıda (sayaç 0 iken) sadece "Cube" yaz; diğerlerinde <code>$"Cube.{eklenenKup:D3}"</code>. D3 = en az 3 basamak, başı sıfırla doldurulur.', 'Yazdırdıktan sonra sayacı artırmayı unutma: <code>eklenenKup++;</code>'],
      solution: cs`int eklenenKup = 0;

KupEkle();
KupEkle();
KupEkle();
KupEkle();

void KupEkle()
{
    if (eklenenKup == 0)
    {
        Console.WriteLine("Cube");
    }
    else
    {
        Console.WriteLine($"Cube.{eklenenKup:D3}");
    }
    eklenenKup++;
}`,
    },
  ],
  vocab: [
    { en: 'Function', tr: 'Fonksiyon', ja: '関数', kana: 'かんすう', romaji: 'kansū' },
    { en: 'Method', tr: 'Metot', ja: 'メソッド', kana: 'メソッド', romaji: 'mesoddo' },
    { en: 'Call', tr: 'Çağırmak / çağrı', ja: '呼び出し', kana: 'よびだし', romaji: 'yobidashi' },
    { en: 'Definition', tr: 'Tanım', ja: '定義', kana: 'ていぎ', romaji: 'teigi' },
    { en: 'Call stack', tr: 'Çağrı yığını', ja: 'コールスタック', kana: 'コールスタック', romaji: 'kōru sutakku' },
    { en: 'Parameter / Argument', tr: 'Parametre / argüman', ja: '引数', kana: 'ひきすう', romaji: 'hikisū' },
    { en: 'Reuse', tr: 'Yeniden kullanım', ja: '再利用', kana: 'さいりよう', romaji: 'sairiyō' },
    { en: 'Naming convention', tr: 'İsimlendirme kuralı', ja: '命名規則', kana: 'めいめいきそく', romaji: 'meimei kisoku' },
    { en: 'Static', tr: 'Statik', ja: '静的', kana: 'せいてき', romaji: 'seiteki' },
    { en: 'Macro', tr: 'Makro', ja: 'マクロ', kana: 'マクロ', romaji: 'makuro' },
    { en: 'Code review', tr: 'Kod incelemesi', ja: 'コードレビュー', kana: 'コードレビュー', romaji: 'kōdo rebyū' },
  ],
  summary: [
    'Fonksiyon, bir işi yapan kod bloğuna verilen isimdir: bir kez tanımla, istediğin kadar çağır (DRY).',
    'void FonksiyonAdi() { ... } tanımdır ve tek başına hiçbir şey çalıştırmaz; FonksiyonAdi(); çağrıdır.',
    'Çağrıda bilgisayar fonksiyona atlar, bitince çağrıldığı yere döner; bu dönüş adresleri çağrı yığınında (call stack) tutulur.',
    'Klasik yapıda metotlar class Program içinde, Main\'in yanında static olarak yazılır; static unutulursa CS0120 alınır.',
    'Metot isimleri PascalCase ve fiil olmalı (KupOlustur); isimde tek harf farkı bile CS0103 hatası verir.',
  ],
};
