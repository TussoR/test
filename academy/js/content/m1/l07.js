import { cs } from '../helpers.js';

export default {
  id: 'm1-l07',
  module: 'm1',
  title: 'Koşullar: if / else',
  titleEn: 'Conditions: if / else',
  titleJa: '条件分岐',
  minutes: 60,
  level: 1,
  objectives: [
    'if, else ve else if ile programın farklı yollara ayrılmasını sağlamak',
    'else if zincirinde sıranın neden önemli olduğunu açıklamak',
    'İç içe if yazmak; blok ve kapsam (scope) kavramlarını anlamak',
    'Kısa kararlar için üçlü operatörü (?:), sabit seçenekler için switch kullanmak',
    'Sık hataları (if sonrası noktalı virgül, eksik süslü parantez, CS0029, CS0163) tanımak',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'if: Programın yol ayrımı',
      body: `
<p>Şimdiye kadar yazdığımız programlar hep <b>düz bir çizgide</b> ilerledi: her satır, yukarıdan aşağıya, mutlaka çalıştı. Gerçek programlar ise <b>karar verir</b>: "Dosya varsa aç, yoksa hata göster."</p>
<p>Bunu <code>if</code> deyimiyle yaparız (<t en="conditional branch" ja="条件分岐">koşullu dallanma</t>):</p>
<pre>if (kosul)
{
    // kosul true ise burası çalışır
}
else
{
    // kosul false ise burası çalışır
}</pre>
<ul>
<li>Parantez içindeki <t en="condition" ja="条件">koşul</t> <b>mutlaka bir bool</b> olmalıdır — geçen derste öğrendiğin karşılaştırmalar tam olarak bunu üretir.</li>
<li>Süslü parantezler bir <t en="block" ja="ブロック">blok</t> oluşturur: birlikte çalışacak satırların grubu.</li>
<li><code>else</code> isteğe bağlıdır. Yoksa ve koşul false ise, blok tamamen atlanır.</li>
</ul>
<p><b>Bilgisayar ne yapar?</b> Koşulu hesaplar → true mu false mu? → Sonuca göre bir bloğa <em>atlar</em>, diğerini hiç çalıştırmaz. İşlemci seviyesinde bu gerçekten bir "atlama" (jump) talimatıdır.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Geometry Nodes\'taki Switch düğümü',
      body: `
<p>Blender Geometry Nodes'ta <b>Switch</b> düğümü, bir bool girişine bakar: <code>true</code> ise bir geometriyi, <code>false</code> ise diğerini çıkışa gönderir. <code>if / else</code> tam olarak budur — sadece geometri yerine <b>kod bloklarını</b> seçer.</p>
<table class="compare">
<tr><th>Geometry Nodes</th><th>C#</th></tr>
<tr><td>Switch düğümünün bool girişi</td><td><code>if (kosul)</code></td></tr>
<tr><td>True girişine bağlı geometri</td><td><code>if</code> bloğu</td></tr>
<tr><td>False girişine bağlı geometri</td><td><code>else</code> bloğu</td></tr>
<tr><td>Birbirine bağlanmış birkaç Switch</td><td><code>else if</code> zinciri</td></tr>
</table>
<p>Oyun motorlarındaki <b>LOD</b> (Level of Detail) sistemi de aynı mantıkla çalışır: "Kamera yakınsa yüksek detaylı mesh'i göster, uzaktaysa düşük poligonlu olanı." Bu derste o kararı kendin yazacaksın.</p>`,
    },
    {
      kind: 'visual',
      title: 'else if zinciri: İlk true olan kazanır',
      svg: `
<svg viewBox="0 0 760 300" role="img" aria-label="LOD seçimi için if, else if, else akış şeması">
  <defs><marker id="ar-l07" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <text x="200" y="20" class="t3">mesafe = 25 olsun</text>
    <polygon points="200,30 310,70 200,110 90,70" class="box"/>
    <text x="200" y="68" class="t1">mesafe &lt; 10 ?</text><text x="200" y="86" class="t3">if</text>
    <polygon points="200,130 310,170 200,210 90,170" class="box hi"/>
    <text x="200" y="168" class="t1">mesafe &lt; 50 ?</text><text x="200" y="186" class="t3">else if</text>

    <line x1="310" y1="70" x2="418" y2="70" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l07)"/>
    <text x="365" y="62" class="t3">true</text>
    <rect x="420" y="45" width="200" height="50" rx="10" class="box dim"/>
    <text x="520" y="66" class="t1">LOD0</text><text x="520" y="84" class="t3">yüksek detay</text>

    <line x1="200" y1="110" x2="200" y2="128" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l07)"/>
    <text x="230" y="124" class="t3">false</text>

    <line x1="310" y1="170" x2="418" y2="170" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l07)"/>
    <text x="365" y="162" class="t3">true</text>
    <rect x="420" y="145" width="200" height="50" rx="10" class="box hi"/>
    <text x="520" y="166" class="t1">LOD1</text><text x="520" y="184" class="t3">orta detay ← 25 buraya düşer</text>

    <line x1="200" y1="210" x2="200" y2="238" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l07)"/>
    <text x="230" y="228" class="t3">false</text>
    <rect x="100" y="240" width="200" height="46" rx="10" class="box dim"/>
    <text x="200" y="260" class="t1">LOD2</text><text x="200" y="277" class="t3">düşük detay (else)</text>

    <rect x="420" y="230" width="330" height="56" rx="10" class="box dim"/>
    <text x="585" y="253" class="t2">Sadece BİR dal çalışır.</text>
    <text x="585" y="273" class="t3">Bir koşul true olunca geri kalanlar hiç sorulmaz.</text>
  </g>
</svg>`,
      caption: `
<p>Bilgisayar koşulları <b>yukarıdan aşağıya</b> sırayla sorar. İlk true olan dalın bloğunu çalıştırır ve zincirin <b>tamamından çıkar</b>. Hiçbiri true değilse <code>else</code> çalışır (varsa).</p>
<p>mesafe = 25 için: <code>25 &lt; 10</code> false → bir sonraki soru: <code>25 &lt; 50</code> true → LOD1 seçilir, LOD2 sorusu hiç sorulmaz.</p>`,
    },
    {
      kind: 'code',
      title: 'if / else if / else: LOD seçimi',
      code: cs`double mesafe = 25.0;

if (mesafe < 10)
{
    Console.WriteLine("LOD0: yüksek detay");
}
else if (mesafe < 50)
{
    Console.WriteLine("LOD1: orta detay");
}
else
{
    Console.WriteLine("LOD2: düşük detay");
}

Console.WriteLine("Model çizildi.");`,
      explain: {
        1: 'Kamera ile model arasındaki mesafe (metre). Bu değeri değiştirerek farklı dalları dene.',
        3: 'İlk soru: <code>25 &lt; 10</code>? → false. Bilgisayar 4–6. satırlardaki bloğu <b>atlar</b>.',
        5: 'Bu satır, mesafe 10\'dan küçük olsaydı çalışırdı. Şu an çalışmaz.',
        7: '<code>else if</code>: "Önceki koşul false ise, şunu sor." <code>25 &lt; 50</code> → true! Burada ayrıca <code>mesafe &gt;= 10</code> yazmaya gerek yok: buraya geldiysek ilk koşulun false olduğunu zaten biliyoruz.',
        9: 'Bu blok çalışır: <b>LOD1</b> yazılır.',
        11: '<code>else</code>: Hiçbir koşul true olmadıysa çalışır. Bu sefer bir önceki dal kazandığı için atlanır.',
        13: 'Sadece mesafe 50 veya daha büyükse çalışır.',
        16: 'if zincirinin <b>dışında</b> olduğu için her durumda çalışır. Dallar ayrılır, sonra yol yeniden birleşir.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Adım adım çalıştır ve atlanan satırları izle. Sonra mesafeyi <code>5</code>, sonra <code>80</code> yap. Tam olarak <code>10</code> yaparsan hangi LOD seçilir? Neden?',
    },
    {
      kind: 'code',
      title: 'İç içe if, bloklar ve kapsam: CAD snap kararı',
      code: cs`bool snapAcik = true;
double uzaklik = 0.3;
double snapYaricapi = 0.5;

if (snapAcik)
{
    if (uzaklik <= snapYaricapi)
    {
        string hedef = "uç nokta";
        Console.WriteLine("Snap hedefi: " + hedef);
    }
    else
    {
        Console.WriteLine("Yakında snap noktası yok.");
    }
}
else
{
    Console.WriteLine("Snap kapalı: serbest çizim.");
}
// Console.WriteLine(hedef);  // CS0103: hedef burada yok!`,
      explain: {
        1: 'Kullanıcı snap\'i (yakalamayı) açmış mı? CAD programlarında ve Blender\'daki mıknatıs ikonunda olduğu gibi bir aç/kapa ayarı.',
        2: 'İmlecin en yakın uç noktaya olan uzaklığı.',
        3: 'Bu yarıçapın içine giren noktalar "yakalanır".',
        5: 'Dış if: Önce snap açık mı diye bakılır. Açık değilse içteki soru <b>hiç sorulmaz</b>.',
        7: '<t en="nested if" ja="ネストしたif">İç içe if</t>: Snap açıksa, şimdi ikinci soru: imleç yeterince yakın mı? 0.3 ≤ 0.5 → true.',
        9: '<code>hedef</code> değişkeni bu bloğun <b>içinde</b> doğar. Onun <t en="scope" ja="スコープ">kapsamı</t> (yaşam alanı) bu süslü parantezlerle sınırlıdır.',
        10: '"Snap hedefi: uç nokta" yazılır.',
        11: 'Blok kapanır → <code>hedef</code> değişkeni artık yok. Bellekteki yeri serbest kalır.',
        12: 'İçteki if\'in else\'i: yakın nokta yoksa.',
        17: 'Dıştaki if\'in else\'i: snap kapalıysa. Hangi else\'in hangi if\'e ait olduğunu <b>girinti</b> ve süslü parantezler gösterir.',
        21: 'Bu satırın başındaki <code>//</code>\'yi silip çalıştırırsan <code>CS0103: The name \'hedef\' does not exist in the current context</code> alırsın. Değişken, tanımlandığı bloğun dışında görünmez.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'Kapsam kuralı: Bir değişken, tanımlandığı <code>{ }</code> bloğunun içinde (ve onun iç bloklarında) yaşar. Değeri if\'ten sonra da lazımsa, değişkeni if\'ten <b>önce</b> tanımla.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Sıra önemli mi?',
      code: cs`int ucgen = 8000;
if (ucgen > 1000)
{
    Console.WriteLine("Orta");
}
else if (ucgen > 5000)
{
    Console.WriteLine("Yüksek");
}
else
{
    Console.WriteLine("Düşük");
}`,
      options: ['Orta', 'Yüksek', 'Orta\nYüksek', 'Düşük'],
      answer: 0,
      explain: '8000 &gt; 1000 <b>true</b> olduğu için ilk dal çalışır ve zincirden çıkılır. 8000 &gt; 5000 de doğrudur ama <b>hiç sorulmaz</b>! Bu bir mantık hatası: daha dar koşul (&gt; 5000) önce gelmeliydi. else if zincirinde koşulları <b>en kısıtlayıcıdan en genele</b> doğru sırala.',
    },
    {
      kind: 'code',
      title: 'Üçlü operatör ?: — tek satırlık if/else',
      code: cs`int kare = 7;
string tur = kare % 2 == 0 ? "çift" : "tek";
Console.WriteLine($"Kare {kare}: {tur}");

double olcek = 0.5;
Console.WriteLine(olcek < 1 ? "Küçültülüyor" : "Büyütülüyor");`,
      explain: {
        1: 'Animasyonun 7. karesi (frame).',
        2: '<t en="ternary operator" ja="三項演算子">Üçlü operatör</t>: <code>kosul ? deger1 : deger2</code>. Koşul true ise <code>?</code>\'den sonraki değer, false ise <code>:</code>\'dan sonraki değer <b>üretilir</b>. 7 % 2 = 1 → false → "tek".',
        3: '"Kare 7: tek" yazılır.',
        5: 'Bir objenin ölçek değeri.',
        6: 'Üçlü operatör bir <b>değer</b> ürettiği için doğrudan WriteLine\'ın içine de yazılabilir. 0.5 &lt; 1 → "Küçültülüyor".',
      },
      runnable: true,
      stepper: true,
      note: 'Ne zaman kullanmalı? İki değerden <b>birini seçmek</b> için idealdir. Her iki tarafta da birden fazla iş yapılacaksa normal if/else daha okunaklıdır. İç içe ?: yazmaktan kaçın — okuması zorlaşır.',
    },
    {
      kind: 'code',
      title: 'switch: Sabit seçeneklerden birini seç',
      code: cs`string komut = "C";

switch (komut)
{
    case "L":
        Console.WriteLine("Çizgi aracı");
        break;
    case "C":
        Console.WriteLine("Daire aracı");
        break;
    case "R":
    case "B":
        Console.WriteLine("Dikdörtgen aracı");
        break;
    default:
        Console.WriteLine("Bilinmeyen komut");
        break;
}`,
      explain: {
        1: 'Kullanıcının bastığı kısayol tuşu. Pek çok CAD programında araçlar tek harfli komutlarla çağrılabilir.',
        3: '<code>switch</code>, tek bir değeri <b>sabit</b> seçeneklerle karşılaştırır. Uzun bir <code>if (komut == "L") ... else if (komut == "C") ...</code> zincirinin daha düzenli halidir.',
        5: '<code>case "L":</code> — değer "L" ise buraya atlanır.',
        7: '<code>break</code> switch\'ten çıkar. C#\'ta her case bloğu <b>break ile bitmek zorundadır</b>; unutursan <code>CS0163</code> hatası alırsın (bir alttaki case\'e "düşmeye" izin verilmez).',
        8: '"C" eşleşti → 9. satır çalışır, 10. satırdaki break ile switch biter.',
        11: 'Boş case\'ler alt alta yazılabilir: "R" <b>veya</b> "B" aynı bloğu çalıştırır.',
        15: '<code>default</code>: Hiçbir case eşleşmezse çalışır — else gibi. Kullanıcı beklenmedik bir tuşa bastığında programın sessiz kalmaması için iyi bir alışkanlıktır.',
      },
      runnable: true,
      stepper: true,
      editable: true,
      note: 'switch; int, char, string gibi değerlerle çalışır ve "eşit mi?" sorusu sorar. "&lt; 10 mu?" gibi aralık soruları için else if zinciri kullan. (Yeni C# sürümlerinde switch\'in daha gelişmiş biçimleri de var; onları ileride göreceksin.)',
    },
    {
      kind: 'warning',
      title: 'Sık yapılan hatalar',
      body: `
<ol>
<li><b>if'ten sonra noktalı virgül.</b> <code>if (x &gt; 5);</code> — Bu <code>;</code> "boş bir deyim"dir: if, hiçbir şey yapmayan bu deyimi kontrol eder. Alttaki blok ise if'ten <b>bağımsız</b> olarak her zaman çalışır! Derleyici sadece uyarı verir (CS0642), hata değil — bu yüzden çok sinsi bir hatadır.</li>
<li><b>Süslü parantezleri atlamak.</b> Parantezsiz if <b>sadece bir sonraki deyimi</b> kontrol eder. Girinti C# için bir şey ifade etmez:
<pre>if (hata)
    Console.WriteLine("Hata!");
    Console.WriteLine("Kapat");  // her zaman çalışır!</pre>
Kural: her zaman <code>{ }</code> kullan.</li>
<li><b>Koşul yerine sayı yazmak.</b> Bazı dillerde (C, Python, JavaScript) <code>if (sayi)</code> çalışır; C#'ta çalışmaz: <code>CS0029: Cannot implicitly convert type 'int' to 'bool'</code>. C# koşulun açıkça bool olmasını ister: <code>if (sayi != 0)</code>.</li>
<li><b><code>=</code> yazmak.</b> <code>if (x = 5)</code> da aynı CS0029 hatasını verir. Karşılaştırma <code>==</code>'dir.</li>
<li><b>switch'te break unutmak</b> → <code>CS0163</code>.</li>
<li><b>else if sırası.</b> Geniş koşul önce gelirse dar koşul hiç çalışmaz (az önceki tahmin sorusu).</li>
</ol>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Bu kodu düzelt',
      code: cs`int subdivSeviyesi = 2;

if (subdivSeviyesi)
{
    Console.WriteLine("Subdivision açık");
}
else
{
    Console.WriteLine("Subdivision kapalı");
}`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        3: 'Koşul bir <code>int</code>. C# "2" sayısının true mu false mu sayılacağını tahmin etmez — açıkça bir karşılaştırma ister.',
      },
      note: 'İpucu: "Seviye 0\'dan büyükse açık" demek istiyoruz. Düzelttiğinde çıktı "Subdivision açık" olmalı; seviyeyi 0 yapınca "kapalı".',
    },
    {
      kind: 'cad',
      title: 'CAD/BIM yazılımlarında koşullar her yerde',
      body: `
<p>Bir CAD programında fareyi hareket ettirdiğin <b>her an</b> onlarca if çalışır:</p>
<ul>
<li><b>Snap önceliği:</b> İmleç hem bir uç noktaya hem bir orta noktaya yakınsa hangisi seçilir? Genellikle bir <code>else if</code> zinciriyle öncelik sırası belirlenir. (Meydan okumada bunu yazacaksın.)</li>
<li><b>Girdi doğrulama:</b> Duvar kalınlığı 0 veya negatif girilirse çizim yapılmamalı: <code>if (kalinlik &lt;= 0) { hata göster }</code>. Profesyonel yazılımın büyük kısmı "ya kullanıcı yanlış bir şey girerse?" sorusuna cevap veren koşullardan oluşur.</li>
<li><b>Gösterim detayı:</b> Büyük bina modellerinde, uzaklaştıkça objelerin daha basit gösterilmesi — oyunlardaki LOD'un mimari karşılığı — yine mesafe ve ölçek koşullarına dayanır.</li>
<li><b>Mod seçimi:</b> Araç çubuğundaki "çizgi / daire / dikdörtgen" komutları, mantık olarak bir <code>switch</code> gibi düşünülebilir.</li>
</ul>
<p class="muted">Not: Gerçek uygulamalarda bu kararlar çok daha fazla duruma bakar, ama yapı taşları tam olarak bugün öğrendiklerin: bool koşul, if / else if / else ve switch.</p>`,
    },
  ],
  exercise: {
    title: 'Poligon bütçesi sınıflandırıcı',
    prompt: `
<p>Bir modelin üçgen sayısını (tam sayı) oku ve hangi platform sınıfına girdiğini yazdır. (Sınırlar bu alıştırma için seçilmiş örnek değerlerdir.)</p>
<ul>
<li>Negatif sayı → <code>Hata: geçersiz üçgen sayısı</code></li>
<li>10000 veya daha az → <code>Sınıf: Mobil</code></li>
<li>100000 veya daha az → <code>Sınıf: Konsol</code></li>
<li>Daha fazlası → <code>Sınıf: PC / Sinematik</code></li>
</ul>
<p>Girdi <code>45000</code> için çıktı:</p>
<pre class="expected">Sınıf: Konsol</pre>
<p>Programın farklı girdilerle (sınır değerler dahil) test edilecek.</p>`,
    starter: cs`int ucgen = int.Parse(Console.ReadLine());

// if / else if / else zincirini buraya yaz
`,
    stdin: '45000',
    checks: [
      { type: 'output', expect: 'Sınıf: Konsol', msg: '45000 üçgen → Sınıf: Konsol' },
      { type: 'output', stdin: '10000', expect: 'Sınıf: Mobil', msg: 'Sınır değer: 10000 üçgen hâlâ Mobil sayılmalı (≤)' },
      { type: 'output', stdin: '10001', expect: 'Sınıf: Konsol', msg: '10001 üçgen → Konsol' },
      { type: 'output', stdin: '250000', expect: 'Sınıf: PC / Sinematik', msg: '250000 üçgen → PC / Sinematik' },
      { type: 'output', stdin: '-5', expect: 'Hata: geçersiz üçgen sayısı', msg: 'Negatif girdi yalnızca hata mesajı yazdırmalı' },
      { type: 'output', stdin: '0', expect: 'Sınıf: Mobil', msg: '0 geçerli bir sayı (boş mesh) → Mobil' },
      { type: 'code', pattern: 'else\\s+if', msg: 'else if zinciri kullanmalısın' },
    ],
    hints: [
      'Dört farklı sonuç var; demek ki bir <code>if</code>, iki <code>else if</code> ve bir <code>else</code> gerekiyor. Önce hangi koşulun <b>ilk</b> kontrol edilmesi gerektiğini düşün.',
      'Negatif kontrolünü en başa koy: <code>if (ucgen &lt; 0)</code>. Sonra küçükten büyüğe: "10000 veya daha az" için <code>&lt;=</code> kullan.',
      'Yapı: <code>if (ucgen &lt; 0) { ... } else if (ucgen &lt;= 10000) { ... } else if (...) { ... } else { ... }</code>. İkinci else if\'te tekrar "10000\'den büyük mü" diye sormana gerek yok — oraya geldiysen zaten öyle.',
    ],
    solution: cs`int ucgen = int.Parse(Console.ReadLine());

if (ucgen < 0)
{
    Console.WriteLine("Hata: geçersiz üçgen sayısı");
}
else if (ucgen <= 10000)
{
    Console.WriteLine("Sınıf: Mobil");
}
else if (ucgen <= 100000)
{
    Console.WriteLine("Sınıf: Konsol");
}
else
{
    Console.WriteLine("Sınıf: PC / Sinematik");
}`,
    explain: 'Zincir yukarıdan aşağıya sorulur ve ilk true olan dal kazanır. Negatif kontrolü en başta olduğu için geçersiz girdi hiçbir sınıfa düşmez. Her else if, öncekilerin false olduğunu "bildiği" için sadece üst sınırı kontrol etmesi yeterlidir.',
  },
  quiz: [
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`int mesafe = 10;
if (mesafe < 10)
{
    Console.WriteLine("LOD0");
}
else if (mesafe < 50)
{
    Console.WriteLine("LOD1");
}
else
{
    Console.WriteLine("LOD2");
}`,
      verifyOutput: true,
      options: [
        { t: 'LOD1', correct: true, why: 'Doğru. 10 < 10 false (10, kendisinden küçük değil). Sonraki soru 10 < 50 true → LOD1.' },
        { t: 'LOD0', why: '< "kesinlikle küçük" demektir. 10, 10\'dan küçük değildir; sınır dahil olsun isteseydik <= yazardık.' },
        { t: 'LOD0\nLOD1', why: 'else if zincirinde en fazla BİR dal çalışır. Ayrıca LOD0 koşulu zaten false.' },
        { t: 'LOD2', why: 'else sadece yukarıdaki koşulların hepsi false ise çalışır; 10 < 50 true.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`int x = 3;
if (x > 5);
{
    Console.WriteLine("Büyük");
}
Console.WriteLine("Bitti");`,
      verifyOutput: true,
      options: [
        { t: 'Büyük\nBitti', correct: true, why: 'Doğru — ve bu bir tuzak! if\'ten sonraki ; boş bir deyimdir. Alttaki blok if\'e ait değil, bu yüzden her zaman çalışır.' },
        { t: 'Bitti', why: 'Normalde öyle olurdu, ama if (x > 5) satırının sonundaki ; if\'in gövdesini "boş deyim" yapar. Blok bağımsız kalır ve çalışır.' },
        { t: 'Derleme hatası', why: 'Ne yazık ki derlenir (sadece CS0642 uyarısı verir). Bu yüzden bu hata çok sinsidir.' },
        { t: 'Hiçbir şey yazılmaz', why: 'En azından "Bitti" kesinlikle yazılır, çünkü if\'in tamamen dışındadır.' },
      ],
    },
    {
      q: 'int sayi = 4; if (sayi) { ... } kodu neden derlenmez?',
      options: [
        { t: 'C#\'ta if koşulu bool olmak zorundadır; int otomatik olarak bool\'a çevrilmez (CS0029)', correct: true, why: 'Doğru. C# bilinçli olarak katıdır: if (sayi != 0) gibi açık bir karşılaştırma ister.' },
        { t: 'if içinde değişken kullanılamaz', why: 'Kullanılabilir; sadece sonucun bool olması gerekir. Örn: if (sayi > 0).' },
        { t: 'Süslü parantezler eksik', why: 'Sorun parantezlerde değil, koşulun türünde.' },
        { t: 'Derlenir; sıfır olmayan her sayı true sayılır', why: 'Bu C, C++ ve JavaScript\'te böyledir ama C#\'ta değil.' },
      ],
    },
    {
      q: 'Bir switch\'te case bloğunun sonuna break yazmayı unutursan ne olur?',
      options: [
        { t: 'Derleme hatası: CS0163 (bir sonraki case\'e düşülemez)', correct: true, why: 'Doğru. C# yanlışlıkla diğer case\'e "düşmeyi" (fall-through) engellemek için break\'i zorunlu tutar.' },
        { t: 'Bir sonraki case de çalışır', why: 'C ve C++\'ta böyledir; C# bunu yasaklayarak bu hata türünü tamamen önler.' },
        { t: 'Program sonsuz döngüye girer', why: 'switch bir döngü değildir; break burada switch\'ten çıkmak içindir.' },
        { t: 'Hiçbir şey olmaz, break isteğe bağlıdır', why: 'İçinde kod olan her case bloğu break (veya return gibi bir çıkış) ile bitmek zorundadır.' },
      ],
    },
    {
      q: 'Bu kodun çıktısı nedir?',
      code: cs`int poligon = 3;
string sekil = poligon == 4 ? "Quad" : "Ngon";
Console.WriteLine(poligon < 4 ? "Üçgen" : sekil);`,
      verifyOutput: true,
      options: [
        { t: 'Üçgen', correct: true, why: 'Doğru. sekil "Ngon" olur (3 == 4 false), ama son satırda 3 < 4 true olduğu için "Üçgen" seçilir.' },
        { t: 'Ngon', why: 'sekil gerçekten "Ngon" ama son satırdaki ?: önce 3 < 4 koşuluna bakar; true olduğu için ilk değer seçilir.' },
        { t: 'Quad', why: 'poligon == 4 false olduğu için sekil "Quad" değil "Ngon" olur.' },
        { t: 'True', why: '?: koşulun kendisini değil, seçilen değeri (burada bir string) üretir.' },
      ],
    },
    {
      q: 'Bir if bloğunun içinde tanımladığın değişkeni if\'ten sonra kullanmaya çalışırsan ne olur?',
      options: [
        { t: 'CS0103 hatası: değişken o kapsamda yok', correct: true, why: 'Doğru. Değişken, tanımlandığı { } bloğunun içinde yaşar. Dışarıda lazımsa if\'ten önce tanımla.' },
        { t: 'Son atanan değeri kullanılır', why: 'Blok bittiğinde değişkenin kapsamı da biter; derleyici dışarıdan erişime izin vermez.' },
        { t: 'Değeri otomatik olarak 0 olur', why: 'C# bu durumda varsayılan değer vermez, derlemeyi durdurur.' },
        { t: 'Sadece if çalıştıysa kullanılabilir', why: 'Kapsam, çalışma zamanına değil kodun yapısına bağlıdır; derleyici bunu kod çalışmadan kontrol eder.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: CAD snap önceliği',
    prompt: `
<p>Bir CAD programının snap kararını yaz. Program sırayla üç satır okur:</p>
<ol>
<li>Snap durumu: <code>on</code> veya <code>off</code></li>
<li>İmlecin en yakın <b>uç noktaya</b> uzaklığı (ondalık)</li>
<li>İmlecin en yakın <b>orta noktaya</b> uzaklığı (ondalık)</li>
</ol>
<p>Kurallar (snap yarıçapı <b>0.5</b>, sınır dahil):</p>
<ul>
<li>Snap kapalıysa → <code>Snap kapalı</code> (uzaklıklara hiç bakılmaz)</li>
<li>Uç nokta yarıçap içindeyse → <code>Snap: Uç nokta</code> (öncelik uç noktada)</li>
<li>Değilse ve orta nokta yarıçap içindeyse → <code>Snap: Orta nokta</code></li>
<li>Hiçbiri değilse → <code>Snap: Yok</code></li>
</ul>
<p>Girdi <code>on</code>, <code>0.3</code>, <code>0.1</code> için çıktı:</p>
<pre class="expected">Snap: Uç nokta</pre>`,
    starter: cs`string durum = Console.ReadLine();
double ucUzaklik = double.Parse(Console.ReadLine());
double ortaUzaklik = double.Parse(Console.ReadLine());
double yaricap = 0.5;

// Kararı burada ver
`,
    stdin: 'on\n0.3\n0.1',
    checks: [
      { type: 'output', expect: 'Snap: Uç nokta', msg: 'İkisi de yakınsa öncelik uç noktada' },
      { type: 'output', stdin: 'on\n0.9\n0.2', expect: 'Snap: Orta nokta', msg: 'Uç nokta uzak, orta nokta yakın → Orta nokta' },
      { type: 'output', stdin: 'on\n0.5\n2', expect: 'Snap: Uç nokta', msg: 'Sınır değer 0.5 dahil sayılmalı' },
      { type: 'output', stdin: 'on\n1.5\n0.75', expect: 'Snap: Yok', msg: 'İkisi de uzaksa → Yok' },
      { type: 'output', stdin: 'off\n0.1\n0.1', expect: 'Snap kapalı', msg: 'Snap kapalıyken uzaklıklara bakılmamalı' },
    ],
    hints: [
      'Önce en dıştaki soruyu düşün: snap açık mı? Bu bir string karşılaştırması: <code>durum == "on"</code>.',
      'Snap açıksa, içeride bir <code>if / else if / else</code> zinciri kur. Öncelikli olan (uç nokta) önce sorulmalı.',
      'Yarıçap dahil olduğu için <code>&lt;=</code> kullan: <code>ucUzaklik &lt;= yaricap</code>. Dıştaki if\'in else\'i "Snap kapalı" yazmalı.',
    ],
    solution: cs`string durum = Console.ReadLine();
double ucUzaklik = double.Parse(Console.ReadLine());
double ortaUzaklik = double.Parse(Console.ReadLine());
double yaricap = 0.5;

if (durum == "on")
{
    if (ucUzaklik <= yaricap)
    {
        Console.WriteLine("Snap: Uç nokta");
    }
    else if (ortaUzaklik <= yaricap)
    {
        Console.WriteLine("Snap: Orta nokta");
    }
    else
    {
        Console.WriteLine("Snap: Yok");
    }
}
else
{
    Console.WriteLine("Snap kapalı");
}`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Tek mi çift mi? (?: ile)',
      prompt: '<p>Bir kare (frame) numarası oku. Üçlü operatör <code>?:</code> kullanarak <code>Çift kare</code> veya <code>Tek kare</code> yazdır. Girdi <code>12</code> için:</p><pre class="expected">Çift kare</pre>',
      starter: cs`int kare = int.Parse(Console.ReadLine());
`,
      stdin: '12',
      checks: [
        { type: 'output', expect: 'Çift kare' },
        { type: 'output', stdin: '7', expect: 'Tek kare', msg: '7 için "Tek kare" yazmalı' },
        { type: 'code', pattern: '\\?[^;]*:', msg: 'Üçlü operatör (?:) kullanmalısın' },
        { type: 'notCode', pattern: '\\bif\\b', msg: 'Bu alıştırmada if yerine ?: kullan' },
      ],
      hints: ['Çiftlik testi: <code>kare % 2 == 0</code>.', 'Kalıp: <code>string sonuc = kosul ? "Çift kare" : "Tek kare";</code>'],
      solution: cs`int kare = int.Parse(Console.ReadLine());
string sonuc = kare % 2 == 0 ? "Çift kare" : "Tek kare";
Console.WriteLine(sonuc);`,
    },
    {
      difficulty: 2,
      title: 'CAD komut kısayolları (switch)',
      prompt: '<p>Bir komut harfi oku ve <code>switch</code> ile aracın adını yazdır: <code>L</code> → <code>Çizgi</code>, <code>C</code> → <code>Daire</code>, <code>R</code> → <code>Dikdörtgen</code>, <code>M</code> → <code>Taşı</code>, diğerleri → <code>Bilinmeyen komut</code>. Küçük harf de kabul edilmeli (ipucu: <code>.ToUpper()</code>). Girdi <code>c</code> için:</p><pre class="expected">Daire</pre>',
      starter: cs`string komut = Console.ReadLine();
`,
      stdin: 'c',
      checks: [
        { type: 'output', expect: 'Daire', msg: '"c" küçük harf olsa da Daire yazmalı' },
        { type: 'output', stdin: 'L', expect: 'Çizgi' },
        { type: 'output', stdin: 'm', expect: 'Taşı' },
        { type: 'output', stdin: 'R', expect: 'Dikdörtgen' },
        { type: 'output', stdin: 'X', expect: 'Bilinmeyen komut', msg: 'Tanımsız harf için default dalı çalışmalı' },
        { type: 'code', pattern: 'switch\\s*\\(', msg: 'switch kullanmalısın' },
      ],
      hints: ['Önce girdiyi büyük harfe çevir: <code>komut = komut.ToUpper();</code>', 'Her case <code>break;</code> ile bitmeli; eşleşmeyenler için <code>default:</code> ekle.'],
      solution: cs`string komut = Console.ReadLine().ToUpper();
switch (komut)
{
    case "L":
        Console.WriteLine("Çizgi");
        break;
    case "C":
        Console.WriteLine("Daire");
        break;
    case "R":
        Console.WriteLine("Dikdörtgen");
        break;
    case "M":
        Console.WriteLine("Taşı");
        break;
    default:
        Console.WriteLine("Bilinmeyen komut");
        break;
}`,
    },
    {
      difficulty: 3,
      title: 'Nokta hangi bölgede?',
      prompt: '<p>Bir 2B noktanın x ve y koordinatlarını (tam sayı) oku. Şunlardan birini yazdır: <code>Orijin</code>, <code>X ekseni üzerinde</code>, <code>Y ekseni üzerinde</code>, <code>1. bölge</code> (x&gt;0, y&gt;0), <code>2. bölge</code> (x&lt;0, y&gt;0), <code>3. bölge</code> (x&lt;0, y&lt;0), <code>4. bölge</code> (x&gt;0, y&lt;0). Girdi <code>-3</code>, <code>5</code> için:</p><pre class="expected">2. bölge</pre>',
      starter: cs`int x = int.Parse(Console.ReadLine());
int y = int.Parse(Console.ReadLine());
`,
      stdin: '-3\n5',
      checks: [
        { type: 'output', expect: '2. bölge' },
        { type: 'output', stdin: '0\n0', expect: 'Orijin' },
        { type: 'output', stdin: '4\n0', expect: 'X ekseni üzerinde', msg: 'y = 0 ise nokta X ekseni üzerindedir' },
        { type: 'output', stdin: '0\n-2', expect: 'Y ekseni üzerinde', msg: 'x = 0 ise nokta Y ekseni üzerindedir' },
        { type: 'output', stdin: '2\n3', expect: '1. bölge' },
        { type: 'output', stdin: '-1\n-1', expect: '3. bölge' },
        { type: 'output', stdin: '6\n-9', expect: '4. bölge' },
      ],
      hints: ['Özel durumları önce ele al: orijin (ikisi de 0), sonra eksenler.', 'Kalan durumlarda x\'in işaretine göre ayır, içeride y\'nin işaretine bak (iç içe if).', 'Eksen kontrolü: <code>else if (y == 0)</code> → X ekseni, <code>else if (x == 0)</code> → Y ekseni.'],
      solution: cs`int x = int.Parse(Console.ReadLine());
int y = int.Parse(Console.ReadLine());
if (x == 0 && y == 0)
{
    Console.WriteLine("Orijin");
}
else if (y == 0)
{
    Console.WriteLine("X ekseni üzerinde");
}
else if (x == 0)
{
    Console.WriteLine("Y ekseni üzerinde");
}
else if (x > 0)
{
    if (y > 0) { Console.WriteLine("1. bölge"); }
    else { Console.WriteLine("4. bölge"); }
}
else
{
    if (y > 0) { Console.WriteLine("2. bölge"); }
    else { Console.WriteLine("3. bölge"); }
}`,
    },
  ],
  vocab: [
    { en: 'Conditional branch', tr: 'Koşullu dallanma', ja: '条件分岐', kana: 'じょうけんぶんき', romaji: 'jōken bunki' },
    { en: 'Condition', tr: 'Koşul', ja: '条件', kana: 'じょうけん', romaji: 'jōken' },
    { en: 'Branch', tr: 'Dal', ja: '分岐', kana: 'ぶんき', romaji: 'bunki' },
    { en: 'if statement', tr: 'if deyimi', ja: 'if文', kana: 'イフぶん', romaji: 'ifu bun' },
    { en: 'switch statement', tr: 'switch deyimi', ja: 'switch文', kana: 'スイッチぶん', romaji: 'suitchi bun' },
    { en: 'Ternary operator', tr: 'Üçlü operatör', ja: '三項演算子', kana: 'さんこうえんざんし', romaji: 'sankō enzanshi' },
    { en: 'Block', tr: 'Blok', ja: 'ブロック', kana: 'ブロック', romaji: 'burokku' },
    { en: 'Scope', tr: 'Kapsam', ja: 'スコープ', kana: 'スコープ', romaji: 'sukōpu' },
    { en: 'Nesting', tr: 'İç içe yazma', ja: '入れ子', kana: 'いれこ', romaji: 'ireko' },
    { en: 'Indentation', tr: 'Girinti', ja: 'インデント', kana: 'インデント', romaji: 'indento' },
    { en: 'Polygon count', tr: 'Poligon sayısı', ja: 'ポリゴン数', kana: 'ポリゴンすう', romaji: 'porigon sū' },
  ],
  summary: [
    'if (kosul) { ... } else { ... } — koşul mutlaka bool olmalı; C# int\'i otomatik bool\'a çevirmez (CS0029).',
    'else if zinciri yukarıdan aşağıya sorulur, ilk true olan dal çalışır ve zincir biter — dar koşulları önce yaz.',
    'Bir blokta { } tanımlanan değişken sadece o blokta yaşar (kapsam); dışarıda kullanmak CS0103 verir.',
    'kosul ? a : b iki değerden birini seçer; switch tek bir değeri sabit case\'lerle karşılaştırır ve her case break ile biter.',
    'if\'ten sonra ; koyma ve her zaman süslü parantez kullan — girinti C# için bir anlam taşımaz.',
  ],
};
