import { cs } from '../helpers.js';

export default {
  id: 'm1-l08',
  module: 'm1',
  title: 'Döngüler',
  titleEn: 'Loops',
  titleJa: 'ループ',
  minutes: 70,
  level: 2,
  objectives: [
    'Tekrarlanan işleri while, do-while ve for döngüleriyle yazmak',
    'Döngü sayacının (counter) her turda nasıl değiştiğini adım adım izleyebilmek',
    'Biriktirici (accumulator) değişkenle toplam hesaplamak',
    'break ve continue ile döngünün akışını kontrol etmek',
    'İç içe döngülerle bir vertex ızgarası üretmek; sonsuz döngü ve bir-eksik/bir-fazla (off-by-one) hatalarını tanımak',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Döngü nedir? Bilgisayar sıkılmaz',
      body: `
<p>100 tane küpü tek tek yazdırmak istediğini düşün: 100 satır <code>Console.WriteLine</code>... Hem yorucu hem de hataya açık. Ya sayı 10.000 olursa?</p>
<p>Bir <t en="loop" ja="ループ">döngü</t>, bir kod bloğunu <b>bir koşul true olduğu sürece tekrar tekrar</b> çalıştırır. En basiti <code>while</code>'dır ("... olduğu sürece"):</p>
<pre>while (kosul)
{
    // kosul true olduğu sürece tekrarlanır
}</pre>
<p><b>Bilgisayar ne yapar?</b> Koşulu kontrol eder → true ise bloğu çalıştırır → bloğun sonuna gelince <b>yukarı geri atlar</b> ve koşulu yeniden kontrol eder. Koşul false olduğunda döngünün altındaki satırdan devam eder. Bloğun her bir çalışmasına <t en="iteration" ja="反復">tur (iterasyon)</t> denir.</p>
<div class="callout tip">if ile while çok benzer görünür. Fark: <b>if bir kez</b> sorar ve geçer; <b>while</b> blok bittikten sonra <b>tekrar sorar</b>. Koşulun bir gün false olmasını sağlamak senin sorumluluğundadır.</div>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Array modifier bir döngüdür',
      body: `
<p>Blender'da bir küpe <b>Array modifier</b> eklediğinde iki şey ayarlarsın: <b>Count</b> (kaç kopya) ve <b>Offset</b> (kopyalar arası mesafe). Blender içeride kabaca şunu yapar:</p>
<pre>kopya 0 → X = 0 × ofset
kopya 1 → X = 1 × ofset
kopya 2 → X = 2 × ofset
... Count'a ulaşana kadar</pre>
<p>Bu tam olarak bir döngüdür! Count = döngünün kaç kez döneceği, kopya numarası = <t en="loop counter" ja="ループカウンタ">döngü sayacı</t>.</p>
<table class="compare">
<tr><th>3D dünyası</th><th>Döngü karşılığı</th></tr>
<tr><td>Array modifier: Count</td><td>Kaç tur dönüleceği</td></tr>
<tr><td>Animasyon: 1–250 arası kareler</td><td>Sayaç 1'den 250'ye kadar artar</td></tr>
<tr><td>Subdivision: Levels = 3</td><td>Aynı işlem 3 kez üst üste uygulanır</td></tr>
<tr><td>Grid primitive: X ve Y bölümleri</td><td>İç içe iki döngü</td></tr>
</table>`,
    },
    {
      kind: 'code',
      title: 'while ve do-while: Sayacı izle',
      code: cs`int kare = 1;

while (kare <= 3)
{
    Console.WriteLine($"Kare {kare} render ediliyor...");
    kare++;
}
Console.WriteLine("Render bitti.");

int deneme = 10;
do
{
    Console.WriteLine($"do-while gövdesi: {deneme}");
    deneme++;
} while (deneme < 5);`,
      explain: {
        1: '<b>Sayaç</b> değişkeni. Döngüden <b>önce</b> tanımlanır ve başlangıç değeri verilir.',
        3: 'Koşul: <code>kare &lt;= 3</code>? İlk turda 1 ≤ 3 → true, bloğa girilir. Bu satır <b>her turdan önce</b> tekrar sorulur.',
        5: 'Gövde: her turda bir kez çalışır. Sayacın değerine göre farklı mesaj yazar.',
        6: '<code>kare++</code> sayacı 1 artırır. <b>Çok önemli:</b> Bu satır olmasaydı kare hep 1 kalır, koşul hep true olur → sonsuz döngü!',
        7: 'Blok bitti → bilgisayar 3. satıra <b>geri atlar</b> ve koşulu tekrar sorar. kare = 4 olduğunda 4 ≤ 3 false olur ve döngü biter.',
        8: 'Döngüden sonraki ilk satır. Sadece bir kez çalışır.',
        10: 'İkinci örnek için yeni bir sayaç. Başlangıçta zaten 10!',
        11: '<code>do</code>: "Önce yap, sonra sor." Gövde koşuldan <b>önce</b> çalışır.',
        13: 'Bu satır, koşul baştan false olmasına rağmen <b>bir kez</b> çalışır.',
        15: 'Koşul gövdeden <b>sonra</b> kontrol edilir: 11 &lt; 5 false → döngü biter. Satırın sonundaki <code>;</code> do-while\'da zorunludur.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: '"Adım adım" ile çalıştır ve <code>kare</code> değişkeninin 1 → 2 → 3 → 4 olarak değiştiğini izle. 4 olduğunda koşulun false olup döngünün bittiği ana dikkat et. <b>do-while</b> ne zaman kullanılır? Gövdenin <em>en az bir kez</em> çalışması gerektiğinde — örneğin "kullanıcıya sor, cevap geçersizse tekrar sor".',
    },
    {
      kind: 'visual',
      title: 'for döngüsünün anatomisi',
      svg: `
<svg viewBox="0 0 760 320" role="img" aria-label="for döngüsünün başlangıç, koşul, gövde ve adım parçalarının akışı">
  <defs><marker id="ar-l08" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <text x="380" y="26" class="t1">for ( int i = 0 ;  i &lt; 4 ;  i++ )  { gövde }</text>
    <text x="235" y="46" class="t3">① başlangıç (1 kez)</text>
    <text x="375" y="46" class="t3">② koşul (her turdan önce)</text>
    <text x="520" y="46" class="t3">④ adım (her turdan sonra)</text>

    <rect x="20" y="115" width="150" height="50" rx="10" class="box"/>
    <text x="95" y="136" class="t1">① int i = 0</text><text x="95" y="154" class="t3">sadece bir kez</text>
    <line x1="170" y1="140" x2="198" y2="140" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l08)"/>

    <polygon points="300,100 400,140 300,180 200,140" class="box hi"/>
    <text x="300" y="138" class="t1">② i &lt; 4 ?</text><text x="300" y="156" class="t3">koşul</text>

    <line x1="400" y1="140" x2="468" y2="140" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l08)"/>
    <text x="434" y="132" class="t3">true</text>
    <rect x="470" y="115" width="170" height="50" rx="10" class="box"/>
    <text x="555" y="136" class="t1">③ gövde</text><text x="555" y="154" class="t3">her turda çalışır</text>

    <line x1="555" y1="165" x2="555" y2="203" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l08)"/>
    <rect x="470" y="205" width="170" height="50" rx="10" class="box"/>
    <text x="555" y="226" class="t1">④ i++</text><text x="555" y="244" class="t3">sayacı artır</text>

    <path d="M640,230 L720,230 L720,72 L300,72 L300,98" fill="none" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l08)"/>
    <text x="735" y="150" class="t3" text-anchor="end">tekrar</text>

    <line x1="300" y1="180" x2="300" y2="258" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l08)"/>
    <text x="325" y="222" class="t3">false</text>
    <rect x="225" y="260" width="150" height="44" rx="10" class="box dim"/>
    <text x="300" y="287" class="t2">döngüden çık</text>

    <rect x="20" y="200" width="180" height="104" rx="10" class="box dim"/>
    <text x="110" y="222" class="t2">i'nin yolculuğu</text>
    <text x="110" y="246" class="t3">0 → 1 → 2 → 3 : gövde çalışır</text>
    <text x="110" y="268" class="t3">4 : 4 &lt; 4 false → çık</text>
    <text x="110" y="290" class="t3">gövde toplam 4 kez çalıştı</text>
  </g>
</svg>`,
      caption: `
<p><code>for</code>, while'ın üç parçasını tek satırda toplayan düzenli halidir: <b>① başlangıç</b> (sayacı oluştur), <b>② koşul</b> (devam edilsin mi?), <b>④ adım</b> (sayacı güncelle). Sıra her zaman: ① → ② → ③ → ④ → ② → ③ → ④ → ② ... ta ki ② false olana kadar.</p>
<p><b>Ne zaman for, ne zaman while?</b> Kaç tur döneceğin belliyse (10 kopya, 250 kare) <code>for</code>. Ne zaman biteceği önceden belli değilse ("kullanıcı q yazana kadar") <code>while</code>.</p>`,
    },
    {
      kind: 'code',
      title: 'for + biriktirici: Array modifier\'ı kodla yazmak',
      code: cs`int kopyaSayisi = 4;
double ofset = 2.5;
int toplamVertex = 0;

for (int i = 0; i < kopyaSayisi; i++)
{
    double x = i * ofset;
    toplamVertex += 8;
    Console.WriteLine($"Kopya {i}: X = {x}");
}

Console.WriteLine($"Toplam vertex: {toplamVertex}");`,
      explain: {
        1: 'Array modifier\'daki <b>Count</b>.',
        2: 'Kopyalar arası mesafe (<b>Relative/Constant Offset</b> gibi).',
        3: '<t en="accumulator" ja="アキュムレータ">Biriktirici</t>: Döngüden <b>önce</b> 0 ile başlar, her turda üzerine eklenir. Döngü içinde tanımlasaydık her turda sıfırlanırdı!',
        5: '① <code>int i = 0</code> bir kez çalışır. ② <code>i &lt; kopyaSayisi</code> her turdan önce sorulur. ④ <code>i++</code> her turdan sonra çalışır. Programcılar genelde <b>0\'dan</b> saymaya başlar — ileride dizilerde bunun nedenini göreceksin.',
        7: 'Kopyanın konumu sayaçtan hesaplanır: 0 × 2.5, 1 × 2.5, 2 × 2.5, 3 × 2.5. Sayaç sadece "kaçıncı tur" değil, <b>hesaplamada kullanılan bir değer</b>dir.',
        8: 'Her küp 8 vertex\'e sahip; toplamı biriktiriyoruz: 0 → 8 → 16 → 24 → 32. (<code>+=</code> = "üzerine ekle".)',
        9: 'Her turda bir satır yazılır.',
        12: 'Döngü bittikten sonra biriktiricide nihai sonuç vardır: 32.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Adım adım ilerlerken <code>i</code>, <code>x</code> ve <code>toplamVertex</code>\'in nasıl değiştiğini izle. Sonra kopyaSayisi\'ni 10 yap: kod hiç uzamadan 10 kopya üretir. Döngünün gücü budur.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Toplam kaç?',
      code: cs`int toplam = 0;
for (int i = 1; i < 4; i++)
{
    toplam += i;
}
Console.WriteLine(toplam);`,
      options: ['10', '6', '4', '0'],
      answer: 1,
      explain: 'Sayaç 1, 2, 3 değerlerini alır; i = 4 olduğunda <code>4 &lt; 4</code> false olur ve 4 <b>eklenmez</b>. 1 + 2 + 3 = <b>6</b>. 10 bekliyorsan, bu klasik bir <b>bir-eksik</b> (off-by-one) hatasıdır: 4\'ü dahil etmek için <code>i &lt;= 4</code> yazmalıydın.',
    },
    {
      kind: 'code',
      title: 'break ve continue: Döngünün akışını kontrol et',
      code: cs`int sure = 0;

for (int kare = 1; kare <= 10; kare++)
{
    if (kare % 3 == 0)
    {
        Console.WriteLine($"Kare {kare}: önbellekte, atlandı");
        continue;
    }

    sure += 4;
    if (sure > 20)
    {
        Console.WriteLine("Süre doldu, render durduruldu!");
        break;
    }
    Console.WriteLine($"Kare {kare} render edildi ({sure} sn)");
}`,
      explain: {
        1: 'Toplam render süresi (biriktirici). Her kare 4 saniye sürsün; süre bütçemiz 20 saniye.',
        3: '1\'den 10\'a kadar her kare için bir tur.',
        5: '3, 6, 9 gibi kareler zaten önbellekte (cache) olsun.',
        8: '<code>continue</code>: "Bu turun geri kalanını atla, <b>bir sonraki tura geç</b>." Bilgisayar doğrudan <code>kare++</code> adımına atlar; 11–17. satırlar bu tur için çalışmaz.',
        11: 'Render süresini biriktir: 4, 8, 12, 16, 20, 24...',
        12: 'Bütçe aşıldı mı? 8. karede süre 24 olur → true.',
        15: '<code>break</code>: "Döngüden <b>tamamen çık</b>." Kalan kareler (9, 10) hiç işlenmez. Program döngünün altındaki ilk satırdan devam eder.',
        17: 'Normal durumda karenin render edildiğini yaz.',
      },
      runnable: true,
      stepper: true,
      note: 'Fark: <b>continue</b> = "bu kareyi geç, sonrakine bak". <b>break</b> = "her şeyi bırak, döngüden çık". İkisi de genellikle bir if içinde kullanılır; aksi halde her turda koşulsuz çalışırlar.',
    },
    {
      kind: 'code',
      title: 'İç içe döngüler: Vertex ızgarası üretmek',
      code: cs`int sutun = 3;
int satir = 2;
int sayac = 0;

for (int y = 0; y < satir; y++)
{
    for (int x = 0; x < sutun; x++)
    {
        Console.Write($"({x},{y}) ");
        sayac++;
    }
    Console.WriteLine();
}

Console.WriteLine($"Toplam vertex: {sayac}");`,
      explain: {
        1: 'Izgaranın X yönündeki vertex sayısı. (Blender\'daki Grid primitive\'in "X Subdivisions" ayarı gibi.)',
        2: 'Y yönündeki vertex sayısı.',
        5: '<t en="nested loop" ja="二重ループ">Dış döngü</t>: her satır (y) için bir tur.',
        7: 'İç döngü: dış döngünün <b>her bir turunda baştan sona</b> çalışır. y = 0 iken x: 0, 1, 2; sonra y = 1 iken x yine 0, 1, 2.',
        9: '<code>Write</code> aynı satırda kalır, böylece bir satırdaki vertex\'ler yan yana yazılır.',
        10: 'Her vertex\'i say.',
        12: 'İç döngü bitince (bir satır tamamlandı) alt satıra geç. Bu satır dış döngünün içinde ama iç döngünün <b>dışında</b> — bu yüzden satır başına 1 kez çalışır.',
        15: 'Toplam: satir × sutun = 2 × 3 = 6. İç gövde toplam 6 kez çalıştı.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Adım adım izlerken iç döngünün dış döngüden <b>çok daha hızlı</b> döndüğüne dikkat et — bir saatin yelkovanı ve akrebi gibi. Dikkat: iç içe döngülerde iş miktarı <b>çarpılır</b>. 1000 × 1000 = 1.000.000 tur!',
    },
    {
      kind: 'warning',
      title: 'Sık yapılan hatalar',
      body: `
<ol>
<li><b>Sonsuz döngü</b> (<t en="infinite loop" ja="無限ループ">infinite loop</t>). Koşul hiç false olmazsa döngü sonsuza kadar döner — gerçek bir programda uygulama "donar" (Blender'ın ağır bir işlemde yanıt vermemesi gibi). En sık sebep: sayacı artırmayı unutmak. <b>Bu platform</b> çok uzun süren programları otomatik olarak durdurur ve "sonsuz döngü şüphesi" uyarısı verir; gerçek bilgisayarında programı kendin durdurman gerekir (konsolda <code>Ctrl + C</code>).</li>
<li><b>Bir-eksik / bir-fazla</b> (<t en="off-by-one error" ja="オフバイワンエラー">off-by-one</t>). <code>&lt;</code> mı <code>&lt;=</code> mı? 0'dan mı 1'den mi? Kural: <code>for (int i = 0; i &lt; n; i++)</code> <b>tam n kez</b> döner. Emin değilsen küçük bir n ile adım adım izle.</li>
<li><b>for satırının sonuna <code>;</code> koymak.</b> <code>for (...);</code> boş bir döngü oluşturur; alttaki blok sadece <b>bir kez</b> çalışır. (Geçen dersteki if hatasının aynısı.)</li>
<li><b>Biriktiriciyi döngünün içinde tanımlamak.</b> <code>int toplam = 0;</code> döngünün içindeyse her turda sıfırlanır. Ayrıca döngü içinde tanımlanan değişkenler döngüden sonra yoktur (kapsam).</li>
<li><b>for'un sayacını gövde içinde de değiştirmek.</b> <code>i++</code> zaten adım kısmında; gövdede bir daha artırmak turları atlatır ve kodu okumayı zorlaştırır.</li>
</ol>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Bu döngü neden bitmiyor?',
      code: cs`int seviye = 0;

while (seviye < 3)
{
    Console.WriteLine($"Subdivision seviyesi: {seviye}");
}

Console.WriteLine("Bitti");`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        3: 'Koşul <code>seviye &lt; 3</code>. seviye 0 ve hiç değişmiyor → koşul hep true.',
        5: 'Bu satır durmadan aynı şeyi yazar. Platform bir süre sonra programı durdurur.',
      },
      note: 'Çalıştır ve platformun sonsuz döngüyü nasıl durdurduğunu gör. Sonra düzelt: çıktı 0, 1, 2 seviyelerini yazıp "Bitti" ile bitmeli. Hangi satır eksik?',
    },
    {
      kind: 'cad',
      title: '3D ve CAD\'de döngüler: Her şey "her biri için"',
      body: `
<ul>
<li><b>Subdivision ve üstel büyüme:</b> Tamamen dörtgenlerden (quad) oluşan bir mesh'te her subdivision seviyesi yüz sayısını <b>4 ile çarpar</b>: 6 → 24 → 96 → 384 → 1536... Bu bir döngü ve bir biriktiricidir — ve Blender'ın neden viewport ve render için ayrı Levels ayarı sunduğunu açıklar. Alıştırmada bu tabloyu kendin üreteceksin.</li>
<li><b>Dizi (array) komutları:</b> CAD programlarındaki dikdörtgen/dairesel dizi komutları (ör. bir cepheye eşit aralıklı pencereler yerleştirmek), ofset × sayaç hesabıyla çalışan döngülerdir.</li>
<li><b>Izgara ve ölçüm noktaları:</b> Bir arazinin ölçüm noktalarını veya bir yapı ızgarasını (aks sistemi) üretmek iç içe döngüdür.</li>
<li><b>"Modeldeki her duvar için..."</b>: BIM yazılımları sürekli binlerce eleman üzerinde dolaşır: alan hesabı, metraj (miktar) çıkarma, çakışma kontrolü. Bunun için önce elemanları bir <b>listede</b> tutmak gerekir — Ders 11'de dizi ve listelerle döngüleri birleştireceğiz.</li>
</ul>
<p class="muted">Performans notu: İç içe döngülerde iş miktarı çarpılarak büyür. 10.000 elemanın her birini diğer 10.000 elemanla karşılaştırmak 100 milyon işlem demektir. Gerçek CAD yazılımlarında bu yüzden akıllı veri yapıları kullanılır; bunu ileriki modüllerde göreceğiz.</p>`,
    },
  ],
  exercise: {
    title: 'Subdivision yüz tablosu',
    prompt: `
<p>Tamamen quad'lardan oluşan bir mesh'te her subdivision seviyesi yüz sayısını 4 ile çarpar. Program iki tam sayı okur: <b>başlangıç yüz sayısı</b> ve <b>en yüksek seviye</b>. Seviye 0'dan en yüksek seviyeye kadar (dahil) her seviyenin yüz sayısını yazdır.</p>
<p>Girdi <code>6</code> ve <code>3</code> (bir küp, 3 seviye) için çıktı:</p>
<pre class="expected">Seviye 0: 6 yüz
Seviye 1: 24 yüz
Seviye 2: 96 yüz
Seviye 3: 384 yüz</pre>
<p>Farklı girdilerle test edilecek; bir döngü kullan.</p>`,
    starter: cs`int yuz = int.Parse(Console.ReadLine());
int maxSeviye = int.Parse(Console.ReadLine());

// Seviye 0'dan maxSeviye'ye kadar (dahil) dönen bir döngü yaz
`,
    stdin: '6\n3',
    checks: [
      { type: 'output', expect: 'Seviye 0: 6 yüz\nSeviye 1: 24 yüz\nSeviye 2: 96 yüz\nSeviye 3: 384 yüz', msg: '6 yüz, 3 seviye için tablo birebir aynı olmalı' },
      { type: 'output', stdin: '1\n2', expect: 'Seviye 0: 1 yüz\nSeviye 1: 4 yüz\nSeviye 2: 16 yüz', msg: 'Farklı girdiyle de çalışmalı (1 yüz, 2 seviye)' },
      { type: 'output', stdin: '10\n0', expect: 'Seviye 0: 10 yüz', msg: 'Seviye 0 isteniyorsa sadece tek satır yazmalı' },
      { type: 'code', pattern: '\\b(for|while)\\s*\\(', msg: 'Bir döngü (for veya while) kullanmalısın' },
    ],
    hints: [
      'Kaç satır yazılacak? maxSeviye = 3 için 4 satır (0, 1, 2, 3). Sayacın son değeri dahil olmalı — <code>&lt;</code> mı <code>&lt;=</code> mı?',
      '<code>for (int seviye = 0; seviye &lt;= maxSeviye; seviye++)</code> kalıbını kullan. Her turda önce mevcut yüz sayısını yazdır.',
      'Yazdırdıktan <b>sonra</b> yüz sayısını güncelle: <code>yuz *= 4;</code> (yuz = yuz * 4). Sırayı ters yaparsan Seviye 0 yanlış çıkar.',
    ],
    solution: cs`int yuz = int.Parse(Console.ReadLine());
int maxSeviye = int.Parse(Console.ReadLine());

for (int seviye = 0; seviye <= maxSeviye; seviye++)
{
    Console.WriteLine($"Seviye {seviye}: {yuz} yüz");
    yuz *= 4;
}`,
    explain: 'Sayaç (seviye) 0\'dan maxSeviye\'ye kadar dahil döner; bu yüzden koşulda <code>&lt;=</code> kullanıldı. <code>yuz</code> değişkeni bir biriktirici gibi davranır: her turda önce yazdırılır, sonra 4 ile çarpılarak bir sonraki tura hazırlanır.',
  },
  quiz: [
    {
      q: 'for (int i = 0; i < 5; i++) döngüsünün gövdesi kaç kez çalışır?',
      options: [
        { t: '5', correct: true, why: 'Doğru. i: 0, 1, 2, 3, 4 → 5 tur. i = 5 olunca 5 < 5 false olur.' },
        { t: '6', why: '0\'dan başladığı için 0–5 arası 6 sayı var gibi görünür, ama 5 dahil değil (< kullanılmış).' },
        { t: '4', why: '0 da bir turdur: 0, 1, 2, 3, 4 toplam 5 değer.' },
        { t: 'Sonsuz', why: 'i++ her turda sayacı artırır; koşul bir gün false olur.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`for (int i = 1; i <= 5; i++)
{
    if (i == 2) { continue; }
    if (i == 4) { break; }
    Console.Write(i);
}`,
      verifyOutput: true,
      options: [
        { t: '13', correct: true, why: 'Doğru. 1 yazılır; 2 continue ile atlanır; 3 yazılır; 4\'te break ile döngüden çıkılır.' },
        { t: '135', why: 'break döngüden tamamen çıkar; 4\'te çıkıldığı için 5\'e hiç gelinmez.' },
        { t: '1', why: 'continue döngüyü bitirmez, sadece o turu atlar. 3 hâlâ yazılır.' },
        { t: '1345', why: 'i == 4 olduğunda break çalışır ve 4 yazılmadan döngü biter.' },
      ],
    },
    {
      q: 'do-while ile while arasındaki temel fark nedir?',
      options: [
        { t: 'do-while gövdeyi koşuldan önce çalıştırır; bu yüzden gövde en az bir kez çalışır', correct: true, why: 'Doğru. while önce sorar (hiç çalışmayabilir), do-while önce yapar sonra sorar.' },
        { t: 'do-while daha hızlıdır', why: 'Hız farkı yok; fark sadece koşulun ne zaman kontrol edildiği.' },
        { t: 'do-while sonsuz döngüye giremez', why: 'Koşul hiç false olmazsa do-while da sonsuza kadar döner.' },
        { t: 'while sadece sayılarla, do-while metinlerle çalışır', why: 'İkisi de herhangi bir bool koşulla çalışır.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`int sayac = 0;
for (int y = 0; y < 3; y++)
{
    for (int x = 0; x < 4; x++)
    {
        sayac++;
    }
}
Console.WriteLine(sayac);`,
      verifyOutput: true,
      options: [
        { t: '12', correct: true, why: 'Doğru. Dış döngü 3 tur, her birinde iç döngü 4 tur: 3 × 4 = 12.' },
        { t: '7', why: 'İç içe döngülerde turlar toplanmaz, çarpılır: iç döngü dış döngünün HER turunda baştan çalışır.' },
        { t: '4', why: 'İç döngü sadece bir kez değil, dış döngünün her turunda (3 kez) çalışır.' },
        { t: '3', why: 'sayac++ iç döngünün içinde; dış döngü turlarını değil, iç gövdenin çalışma sayısını sayar.' },
      ],
    },
    {
      q: 'int i = 0; while (i < 10) { Console.WriteLine(i); } döngüsündeki sorun nedir?',
      options: [
        { t: 'i hiç artmıyor; koşul hep true kalıyor → sonsuz döngü', correct: true, why: 'Doğru. Gövdeye i++ eklenmeli. Platform bu programı bir süre sonra otomatik durdurur.' },
        { t: 'while içinde Console.WriteLine kullanılamaz', why: 'Kullanılabilir; döngü gövdesine istediğin deyimleri yazabilirsin.' },
        { t: 'i, while\'dan önce tanımlanamaz', why: 'Tam tersi: while\'ın sayacı döngüden önce tanımlanmalıdır.' },
        { t: 'Sorun yok, 0\'dan 9\'a kadar yazar', why: 'Bunun için i\'nin her turda artması gerekir; bu kodda hiç değişmiyor.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Vertex ızgarası üreteci',
    prompt: `
<p>Blender'daki Grid primitive gibi bir vertex ızgarası üret. Program üç tam sayı okur: <b>sütun sayısı</b>, <b>satır sayısı</b> ve <b>aralık</b> (vertex'ler arası mesafe). Her satırda o satırın vertex koordinatlarını <code>(x,y)</code> biçiminde, aralarında bir boşlukla yazdır. Koordinat = indeks × aralık. Sonunda toplam vertex sayısını yazdır.</p>
<p>Girdi <code>3</code>, <code>2</code>, <code>10</code> için çıktı:</p>
<pre class="expected">(0,0) (10,0) (20,0)
(0,10) (10,10) (20,10)
Toplam vertex: 6</pre>
<p>Toplam vertex sayısını bir sayaçla (biriktirici) say.</p>`,
    starter: cs`int sutun = int.Parse(Console.ReadLine());
int satir = int.Parse(Console.ReadLine());
int aralik = int.Parse(Console.ReadLine());

// İç içe döngülerle ızgarayı üret
`,
    stdin: '3\n2\n10',
    checks: [
      { type: 'output', expect: '(0,0) (10,0) (20,0)\n(0,10) (10,10) (20,10)\nToplam vertex: 6', msg: '3 × 2 ızgara, aralık 10 için çıktı birebir aynı olmalı' },
      { type: 'output', stdin: '2\n3\n5', expect: '(0,0) (5,0)\n(0,5) (5,5)\n(0,10) (5,10)\nToplam vertex: 6', msg: '2 sütun × 3 satır, aralık 5 ile de çalışmalı' },
      { type: 'output', stdin: '4\n1\n1', expect: '(0,0) (1,0) (2,0) (3,0)\nToplam vertex: 4', msg: 'Tek satırlık ızgara da çalışmalı' },
      { type: 'code', pattern: '(for|while)\\s*\\([\\s\\S]*(for|while)\\s*\\(', msg: 'İç içe iki döngü kullanmalısın' },
      { type: 'code', pattern: '\\+\\+|\\+=', msg: 'Toplam vertex sayısını bir sayaçla biriktirmelisin' },
    ],
    hints: [
      'Dış döngü satırlar (y) için, iç döngü sütunlar (x) için. Her vertex\'i <code>Console.Write</code> ile aynı satıra yaz, iç döngü bitince <code>Console.WriteLine()</code> ile alt satıra geç.',
      'Koordinat: <code>x * aralik</code> ve <code>y * aralik</code>. Yazdırma: <code>Console.Write($"({x * aralik},{y * aralik}) ");</code> — satır sonundaki fazladan boşluk sorun değil.',
      'Sayacı döngülerden <b>önce</b> <code>int sayac = 0;</code> ile tanımla ve iç döngünün gövdesinde artır. Son satırı döngülerden sonra yaz.',
    ],
    solution: cs`int sutun = int.Parse(Console.ReadLine());
int satir = int.Parse(Console.ReadLine());
int aralik = int.Parse(Console.ReadLine());
int sayac = 0;

for (int y = 0; y < satir; y++)
{
    for (int x = 0; x < sutun; x++)
    {
        Console.Write($"({x * aralik},{y * aralik}) ");
        sayac++;
    }
    Console.WriteLine();
}
Console.WriteLine($"Toplam vertex: {sayac}");`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Render geri sayımı (while)',
      prompt: '<p>Bir tam sayı oku ve <code>while</code> döngüsüyle o sayıdan 1\'e kadar geri say; sonra <code>Render!</code> yazdır. Girdi <code>3</code> için:</p><pre class="expected">3\n2\n1\nRender!</pre>',
      starter: cs`int n = int.Parse(Console.ReadLine());
`,
      stdin: '3',
      checks: [
        { type: 'output', expect: '3\n2\n1\nRender!' },
        { type: 'output', stdin: '5', expect: '5\n4\n3\n2\n1\nRender!', msg: '5 için de çalışmalı' },
        { type: 'code', pattern: 'while\\s*\\(', msg: 'while döngüsü kullanmalısın' },
      ],
      hints: ['Koşul: <code>n &gt; 0</code> olduğu sürece.', 'Gövdede önce yazdır, sonra <code>n--;</code> ile azalt. Döngüden sonra "Render!" yaz.'],
      solution: cs`int n = int.Parse(Console.ReadLine());
while (n > 0)
{
    Console.WriteLine(n);
    n--;
}
Console.WriteLine("Render!");`,
    },
    {
      difficulty: 2,
      title: 'Çift karelerin toplamı (continue)',
      prompt: '<p>Bir n sayısı oku. 1\'den n\'ye kadar (dahil) olan karelerden <b>tek</b> olanları <code>continue</code> ile atla, çiftleri topla ve sonucu yazdır. Girdi <code>10</code> için (2+4+6+8+10):</p><pre class="expected">Çift karelerin toplamı: 30</pre>',
      starter: cs`int n = int.Parse(Console.ReadLine());
`,
      stdin: '10',
      checks: [
        { type: 'output', expect: 'Çift karelerin toplamı: 30' },
        { type: 'output', stdin: '7', expect: 'Çift karelerin toplamı: 12', msg: 'n = 7 için 2+4+6 = 12' },
        { type: 'output', stdin: '1', expect: 'Çift karelerin toplamı: 0', msg: 'n = 1 için hiç çift kare yok' },
        { type: 'code', pattern: '\\bcontinue\\s*;', msg: 'Tek sayıları continue ile atlamalısın' },
      ],
      hints: ['Toplamı döngüden önce <code>int toplam = 0;</code> ile başlat.', 'Döngü içinde: <code>if (kare % 2 != 0) { continue; }</code> — sonra <code>toplam += kare;</code>'],
      solution: cs`int n = int.Parse(Console.ReadLine());
int toplam = 0;
for (int kare = 1; kare <= n; kare++)
{
    if (kare % 2 != 0)
    {
        continue;
    }
    toplam += kare;
}
Console.WriteLine($"Çift karelerin toplamı: {toplam}");`,
    },
    {
      difficulty: 3,
      title: 'Komut kuyruğu (q yazılana kadar)',
      prompt: '<p>Kullanıcıdan satır satır CAD komutları oku. <code>q</code> gelene kadar her komut için <code>Komut: X</code> yazdır. <code>q</code> geldiğinde dur ve toplam komut sayısını yazdır (<code>q</code> sayılmaz). Kaç komut geleceği önceden belli değil! Girdi <code>LINE</code>, <code>CIRCLE</code>, <code>MOVE</code>, <code>q</code> için:</p><pre class="expected">Komut: LINE\nKomut: CIRCLE\nKomut: MOVE\nToplam komut: 3</pre>',
      starter: cs`// Komutları q gelene kadar oku
`,
      stdin: 'LINE\nCIRCLE\nMOVE\nq',
      checks: [
        { type: 'output', expect: 'Komut: LINE\nKomut: CIRCLE\nKomut: MOVE\nToplam komut: 3' },
        { type: 'output', stdin: 'q', expect: 'Toplam komut: 0', msg: 'İlk girdi q ise hiç komut yazılmamalı' },
        { type: 'output', stdin: 'TRIM\nq\nLINE', expect: 'Komut: TRIM\nToplam komut: 1', msg: 'q\'dan sonraki girdiler okunmamalı' },
        { type: 'code', pattern: 'while\\s*\\(', msg: 'Kaç tur döneceği belli olmadığı için while (veya do-while) kullanmalısın' },
      ],
      hints: ['İlk komutu döngüden önce oku: <code>string komut = Console.ReadLine();</code>', 'Koşul: <code>while (komut != "q")</code>. Gövdenin sonunda bir sonraki komutu oku — yoksa sonsuz döngü!', 'Sayacı gövdede artır; döngüden sonra "Toplam komut: ..." yaz.'],
      solution: cs`string komut = Console.ReadLine();
int sayac = 0;
while (komut != "q")
{
    Console.WriteLine($"Komut: {komut}");
    sayac++;
    komut = Console.ReadLine();
}
Console.WriteLine($"Toplam komut: {sayac}");`,
    },
  ],
  vocab: [
    { en: 'Loop', tr: 'Döngü', ja: 'ループ', kana: 'ループ', romaji: 'rūpu' },
    { en: 'Repetition', tr: 'Tekrar', ja: '繰り返し', kana: 'くりかえし', romaji: 'kurikaeshi' },
    { en: 'Iteration', tr: 'Tur, yineleme', ja: '反復', kana: 'はんぷく', romaji: 'hanpuku' },
    { en: 'Infinite loop', tr: 'Sonsuz döngü', ja: '無限ループ', kana: 'むげんループ', romaji: 'mugen rūpu' },
    { en: 'Nested loop', tr: 'İç içe döngü', ja: '二重ループ', kana: 'にじゅうループ', romaji: 'nijū rūpu' },
    { en: 'Counter', tr: 'Sayaç', ja: 'カウンタ', kana: 'カウンタ', romaji: 'kaunta' },
    { en: 'Increment', tr: 'Bir artırma', ja: 'インクリメント', kana: 'インクリメント', romaji: 'inkurimento' },
    { en: 'Total / Sum', tr: 'Toplam', ja: '合計', kana: 'ごうけい', romaji: 'gōkei' },
    { en: 'Vertex', tr: 'Köşe noktası', ja: '頂点', kana: 'ちょうてん', romaji: 'chōten' },
    { en: 'Grid', tr: 'Izgara', ja: 'グリッド', kana: 'グリッド', romaji: 'guriddo' },
    { en: 'Frame', tr: 'Kare', ja: 'フレーム', kana: 'フレーム', romaji: 'furēmu' },
  ],
  summary: [
    'while koşul true olduğu sürece tekrarlar; do-while gövdeyi önce çalıştırır, bu yüzden en az bir kez döner.',
    'for (başlangıç; koşul; adım) — tur sayısı belliyse en düzenli yol; for (int i = 0; i < n; i++) tam n kez döner.',
    'Biriktirici (toplam, sayaç) döngüden önce tanımlanır ve her turda güncellenir.',
    'continue bu turu atlayıp sonrakine geçer; break döngüden tamamen çıkar.',
    'İç içe döngülerde tur sayıları çarpılır (satır × sütun) — ızgara üretmenin doğal yolu.',
    'Sonsuz döngü ve off-by-one en sık hatalardır: sayacın değiştiğinden ve < / <= seçiminden emin ol.',
  ],
};
