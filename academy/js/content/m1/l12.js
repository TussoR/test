import { cs } from '../helpers.js';

export default {
  id: 'm1-l12',
  module: 'm1',
  title: 'Hata yönetimi',
  titleEn: 'Error handling',
  titleJa: 'エラー処理',
  minutes: 60,
  level: 2,
  objectives: [
    'Derleme hatası, çalışma zamanı hatası ve mantık hatası arasındaki farkı açıklamak',
    'Exception\'ın ne olduğunu ve "unhandled exception"ın neden programı kapattığını anlatabilmek',
    'try / catch / finally ile belirli exception türlerini yakalamak ve ex.Message kullanmak',
    'throw new ArgumentException(...) ile geçersiz girdiyi reddeden fonksiyonlar yazmak',
    'int.TryParse ve while döngüsüyle çökmeyen girdi doğrulama döngüleri kurmak',
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Üç tür hata',
      body: `
<p>Program yazarken karşılaşacağın hatalar üç ailede toplanır. Hangisiyle uğraştığını bilmek, nerede arayacağını söyler.</p>
<table class="compare">
<tr><th>Tür</th><th>Ne zaman?</th><th>Örnek</th></tr>
<tr><td><b><t en="compile error" ja="コンパイルエラー">Derleme hatası</t></b></td><td>Program <em>çalışmadan önce</em>. Derleyici reddeder.</td><td><code>;</code> eksik, tür uyuşmazlığı, CS0161</td></tr>
<tr><td><b><t en="runtime error" ja="実行時エラー">Çalışma zamanı hatası</t></b></td><td>Program <em>çalışırken</em>. Kod geçerli ama o anki veri sorunlu.</td><td><code>int.Parse("12a")</code>, 0'a bölme, dizi dışına taşma</td></tr>
<tr><td><b><t en="logic error" ja="論理エラー">Mantık hatası</t></b></td><td>Program çalışır, bitirir… ama <em>yanlış sonuç</em> verir.</td><td>Ortalamayı <code>toplam / 2</code> ile hesaplamak</td></tr>
</table>
<p>Derleme hatası en "dost" olanıdır: sana satır numarasıyla gelir. Çalışma zamanı hatası ancak o veri geldiğinde ortaya çıkar. Mantık hatası en sinsi olandır: kimse alarm vermez; onu test ve dikkatli kontrolle bulursun.</p>
<p>Bu derste ikinci aileyi, yani çalışma anındaki hataları yönetmeyi öğreneceğiz. C#'ta bu hatalar <b><t en="exception" ja="例外">exception</t></b> (istisna) adlı nesnelerle bildirilir.</p>`,
    },
    {
      kind: 'analogy',
      title: 'Benzetme: Blender çökmek yerine hata mesajı gösterdiğinde',
      body: `
<p>Blender'da bozuk bir <code>.obj</code> dosyasını içe aktarmayı denediğini düşün. İki olası son var:</p>
<ol>
<li><b>Kötü son:</b> Blender tamamen kapanır, kaydetmediğin 2 saatlik iş gider. Bu, <b>yakalanmamış</b> bir hatadır.</li>
<li><b>İyi son:</b> Ekranda kırmızı bir uyarı belirir (ör. "Operator failed" ya da importer'ın hata mesajı). İçe aktarma iptal olur ama Blender açık kalır, sahnen yerinde durur. Hata <b>yakalanmış</b> ve kullanıcıya anlaşılır biçimde bildirilmiştir.</li>
</ol>
<p>Exception mekanizması tam olarak bunu sağlar:</p>
<ul>
<li>Sorunu fark eden kod bir alarm <b>fırlatır</b> (<t en="throw" ja="スロー">throw</t>).</li>
<li>Alarm, fonksiyonu çağıranlara doğru geri yükselir; yol üstündeki işler yarıda kalır.</li>
<li>Bu durumla başa çıkabilecek bir kod parçası alarmı <b>yakalar</b> (<t en="catch" ja="キャッチ">catch</t>) ve bir karar verir: kullanıcıya mesaj göster, varsayılan değer kullan, tekrar dene…</li>
<li>Kimse yakalamazsa program kapanır.</li>
</ul>`,
    },
    {
      kind: 'visual',
      title: 'Exception çağrı yığınında nasıl yükselir?',
      svg: `
<svg viewBox="0 0 760 320" role="img" aria-label="Exception'ın çağrı yığınında yukarıdan çağıranlara doğru ilerleyip catch bloğunda yakalanması">
  <defs>
    <marker id="ar-l12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker>
    <marker id="ar-l12e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--err)"/></marker>
  </defs>
  <g font-size="13" text-anchor="middle">
    <text x="190" y="22" class="t3">çağrı yığını (en son çağrılan en üstte)</text>
    <rect x="40" y="35" width="300" height="50" rx="8" class="box hi"/>
    <text x="190" y="57" class="t1">int.Parse("12a")</text><text x="190" y="75" class="t3">sorunu fark eder → throw FormatException</text>
    <rect x="40" y="100" width="300" height="50" rx="8" class="box"/>
    <text x="190" y="122" class="t1">ReadVertex(line)</text><text x="190" y="140" class="t3">catch yok → yarıda kalır, çerçeve kapanır</text>
    <rect x="40" y="165" width="300" height="50" rx="8" class="box"/>
    <text x="190" y="187" class="t1">ImportObj(path)</text><text x="190" y="205" class="t3">catch yok → yarıda kalır, çerçeve kapanır</text>
    <rect x="40" y="230" width="300" height="60" rx="8" class="box hi"/>
    <text x="190" y="252" class="t1">Main: try { ImportObj(...) }</text><text x="190" y="272" class="t2">catch (FormatException ex) → yakalandı!</text>
    <line x1="355" y1="60" x2="355" y2="255" stroke="var(--err)" stroke-width="2.5" marker-end="url(#ar-l12e)"/>
    <text x="368" y="160" class="t3" text-anchor="start">exception çağıranlara</text>
    <text x="368" y="176" class="t3" text-anchor="start">doğru geri yükselir</text>
    <rect x="490" y="70" width="250" height="80" rx="10" class="box dim"/>
    <text x="615" y="96" class="t1">Hiçbir yerde catch yoksa</text>
    <text x="615" y="116" class="t2">Unhandled exception</text>
    <text x="615" y="136" class="t2">→ program kapanır (crash)</text>
    <rect x="490" y="215" width="250" height="80" rx="10" class="box"/>
    <text x="615" y="241" class="t1">catch bulunursa</text>
    <text x="615" y="261" class="t2">"Dosya bozuk: 12. satır" mesajı</text>
    <text x="615" y="281" class="t2">→ program çalışmaya devam eder</text>
    <line x1="345" y1="260" x2="488" y2="255" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-l12)"/>
  </g>
</svg>`,
      caption: `
<p>Exception, onu fırlatan satırdan başlayıp <b>çağıranlara doğru</b> ilerler (9. dersteki çağrı yığınını hatırla). Her çerçevede "Burada uygun bir <code>catch</code> var mı?" diye bakılır. Yoksa o fonksiyon yarıda bırakılır ve bir alttakine geçilir. Bu sürece <t en="stack unwinding" ja="スタックの巻き戻し">yığının geri sarılması</t> denir.</p>
<p>Main'e kadar hiç <code>catch</code> bulunamazsa .NET çalışma zamanı programı durdurur ve konsola <code>Unhandled exception. System.FormatException: ...</code> yazar. "Unhandled" = "kimse ilgilenmedi".</p>`,
    },
    {
      kind: 'code',
      title: 'Yakalanmamış exception: Program çöker',
      code: cs`Console.WriteLine("Import başlıyor...");
string vertexCountText = "12a";
int vertexCount = int.Parse(vertexCountText);
Console.WriteLine("Vertex sayısı: " + vertexCount);
Console.WriteLine("Import bitti.");`,
      explain: {
        1: 'Bu satır normal çalışır ve yazdırılır.',
        2: 'Dosyadan okunmuş gibi düşün: bozuk bir değer. Derleyici bunu bilemez, çünkü bu bir <code>string</code> ve string olarak tamamen geçerli.',
        3: '<code>int.Parse</code> "12a"yı sayıya çeviremez ve bir <code>FormatException</code> <b>fırlatır</b>. Etrafta <code>try/catch</code> olmadığı için exception Main\'den de çıkar → program kapanır.',
        4: 'Bu satıra <b>hiç</b> gelinmez.',
        5: 'Bu da çalışmaz. Kullanıcı açısından: program bir anda kayboldu.',
      },
      runnable: true,
      expectError: true,
      note: 'Çalıştır ve çıktıya dikkat et: ilk satır yazılır, sonra "Unhandled exception. System.FormatException: The input string \'12a\' was not in a correct format." mesajı gelir. Mesaj üç bilgi verir: exception türü, açıklama ve satır.',
    },
    {
      kind: 'code',
      title: 'try / catch / finally: Hatayı yakalamak',
      code: cs`string lengthText = Console.ReadLine();
string countText = Console.ReadLine();
Console.WriteLine("Girdi: " + lengthText + " mm, " + countText + " parça");

try
{
    int length = int.Parse(lengthText);
    int count = int.Parse(countText);
    int piece = length / count;
    Console.WriteLine("Her parça: " + piece + " mm");
}
catch (FormatException ex)
{
    Console.WriteLine("Sayı bekleniyordu: " + ex.Message);
}
catch (DivideByZeroException)
{
    Console.WriteLine("Parça sayısı 0 olamaz.");
}
finally
{
    Console.WriteLine("Hesaplama denemesi bitti.");
}
Console.WriteLine("Program devam ediyor.");`,
      stdin: '3000\n0',
      explain: {
        1: 'İki satır girdi okunur (bu örnekte stdin: <code>3000</code> ve <code>0</code>). Bir duvarı eşit parçalara bölen küçük bir hesap.',
        5: '<code>try</code> = "Bunu dene". Hata çıkabilecek satırları bu bloğa koyarız.',
        9: '0\'a tam sayı bölmesi <code>DivideByZeroException</code> fırlatır. Bu satırın geri kalanı ve 10. satır <b>atlanır</b>; akış doğrudan uygun <code>catch</code>\'e zıplar.',
        12: '<code>catch (FormatException ex)</code>: sadece bu tür hatayı yakalar. <code>ex</code> değişkeni exception nesnesidir; <code>ex.Message</code> açıklama metnini taşır.',
        16: 'Exception nesnesine ihtiyacın yoksa değişken adı yazmadan da yakalayabilirsin. Catch blokları <b>yukarıdan aşağıya</b> denenir; uyan ilk blok çalışır.',
        18: 'Kullanıcıya <b>ne yapması gerektiğini</b> söyleyen bir mesaj — "Operator failed"dan çok daha iyi.',
        20: '<code>finally</code>: hata olsa da olmasa da, yakalansa da yakalanmasa da <b>her zaman</b> çalışır. Gerçek programlarda açılan dosyayı kapatmak, ilerleme çubuğunu gizlemek gibi "toparlanma" işleri için kullanılır.',
        24: 'Hata yakalandığı için program çökmez ve buraya ulaşır.',
      },
      runnable: true,
      stepper: true,
      note: 'Girdileri değiştirerek dene: 3000 ve 4 (hatasız), abc ve 4 (FormatException), 3000 ve 0 (DivideByZeroException). Her durumda hangi blokların çalıştığını adım adım izle.',
    },
    {
      kind: 'code',
      title: 'throw: Geçersiz girdiyi kendin reddetmek',
      code: cs`double WallVolume(double lengthMm, double heightMm, double thicknessMm)
{
    if (thicknessMm <= 0)
    {
        throw new ArgumentException("Duvar kalınlığı pozitif olmalı. Girilen: " + thicknessMm);
    }
    return lengthMm * heightMm * thicknessMm / 1000000000;
}

try
{
    Console.WriteLine("Hacim: " + WallVolume(4000, 2500, 200) + " m³");
    Console.WriteLine("Hacim: " + WallVolume(4000, 2500, -150) + " m³");
    Console.WriteLine("Bu satır çalışmaz.");
}
catch (ArgumentException ex)
{
    Console.WriteLine("Hata: " + ex.Message);
}`,
      explain: {
        1: 'Bir CAD hesabı: mm cinsinden ölçülerle duvar hacmi (m³).',
        3: 'Fonksiyon kendi <b>ön koşulunu</b> kontrol eder: negatif ya da sıfır kalınlıkta bir duvar fiziksel olarak anlamsızdır.',
        5: '<code>throw new ArgumentException("...")</code>: yeni bir exception nesnesi oluşturup fırlatır. Fonksiyon <b>burada biter</b>, return\'e hiç ulaşılmaz. <code>ArgumentException</code>, "bana geçersiz bir argüman verdin" demenin standart yoludur.',
        7: 'mm³ → m³ için 1.000.000.000\'a böleriz (1 m = 1000 mm, küpü 10⁹).',
        12: 'Geçerli girdi: 4 m × 2.5 m × 0.2 m = 2 m³.',
        13: 'Geçersiz girdi: <code>WallVolume</code> fırlatır, exception çağırana (buraya) yükselir, satırın geri kalanı yarıda kalır.',
        14: 'Atlanır.',
        16: 'Fırlatılan <code>ArgumentException</code> burada yakalanır ve mesajı yazdırılır.',
      },
      runnable: true,
      stepper: true,
      note: 'Neden -150 için sessizce 0 döndürmüyoruz? Çünkü 0 m³ "geçerli ama boş bir duvar" gibi görünür ve hata, raporun ta sonunda yanlış bir maliyet olarak ortaya çıkar. Sorunu kaynağında yüksek sesle bildirmek (fail fast) hatayı bulmayı çok kolaylaştırır.',
    },
    {
      kind: 'predict',
      title: 'Tahmin et: Hangi satırlar yazdırılır?',
      code: cs`try
{
    Console.WriteLine("A");
    int[] sizes = new int[2];
    sizes[2] = 5;
    Console.WriteLine("B");
}
catch (IndexOutOfRangeException)
{
    Console.WriteLine("C");
}
finally
{
    Console.WriteLine("D");
}
Console.WriteLine("E");`,
      options: ['A\nC\nD\nE', 'A\nB\nC\nD\nE', 'A\nC\nE', 'A\nB\nD\nE'],
      answer: 0,
      explain: '"A" yazılır. <code>sizes[2]</code> 2 elemanlı dizide geçersizdir → exception fırlar ve <b>"B" atlanır</b>. Akış catch\'e zıplar: "C". <code>finally</code> her zaman çalışır: "D". Hata yakalandığı için program devam eder: "E".',
    },
    {
      kind: 'code',
      title: 'Çökmeyen girdi: TryParse ile doğrulama döngüsü',
      code: cs`int thickness = 0;
bool valid = false;
while (!valid)
{
    Console.WriteLine("Duvar kalınlığı (mm):");
    string input = Console.ReadLine();
    if (!int.TryParse(input, out thickness))
    {
        Console.WriteLine("'" + input + "' bir sayı değil. Tekrar deneyin.");
    }
    else if (thickness <= 0)
    {
        Console.WriteLine("Kalınlık pozitif olmalı. Tekrar deneyin.");
    }
    else
    {
        valid = true;
    }
}
Console.WriteLine("Kabul edildi: " + thickness + " mm");`,
      stdin: 'abc\n-200\n150',
      explain: {
        2: 'Bayrak (flag) değişkeni: geçerli bir değer alana kadar <code>false</code>.',
        3: 'Geçerli girdi gelene kadar sormaya devam et. CAD\'deki ölçü kutusunun davranışı: yanlış değer yazınca kutu seni bırakmaz.',
        6: 'Kullanıcının yazdığı metin (bu örnekte sırasıyla: <code>abc</code>, <code>-200</code>, <code>150</code>).',
        7: '<code>int.TryParse</code> exception <b>fırlatmaz</b>: başarırsa <code>true</code> döndürüp sayıyı <code>out</code> değişkenine yazar, başaramazsa <code>false</code> döndürür. Kullanıcının yanlış yazması "istisnai" değil, <b>beklenen</b> bir durumdur; bu yüzden try/catch yerine TryParse tercih edilir.',
        11: 'Sayıya çevrilebilmesi yetmez: <b>anlamlı</b> da olmalı. Biçim kontrolü + aralık kontrolü = tam doğrulama.',
        17: 'Ancak her iki kontrolden de geçince döngüden çıkılır.',
        20: 'Bu satıra ulaşıldığında <code>thickness</code>\'ın geçerli olduğu <b>garanti</b> edilmiştir.',
      },
      runnable: true,
      stepper: true,
      note: 'Bu kalıbı ezberle: "oku → TryParse → aralık kontrolü → geçerliyse çık, değilse nedenini söyle ve tekrar sor". Modül projesinde de kullanacaksın.',
    },
    {
      kind: 'warning',
      title: 'Exception\'ları yutmak: Boş catch bir tuzaktır',
      body: `
<pre><code>try { total += int.Parse(text); }
catch { }   // "hata olursa... hiçbir şey yapma"</code></pre>
<p>Bu kod asla çökmez — ve tam da bu yüzden tehlikelidir. Bozuk veri sessizce atlanır, toplam yanlış çıkar ve kimse nedenini bilemez. Bir çalışma zamanı hatasını <b>mantık hatasına dönüştürmüş</b> olursun: en zor bulunan türe!</p>
<ul>
<li><b>Sadece başa çıkabileceğin hatayı yakala.</b> <code>catch (FormatException)</code> gibi belirli türleri tercih et. Her şeyi yakalayan <code>catch (Exception)</code>, beklemediğin gerçek hataları (ör. <code>NullReferenceException</code>) da gizler.</li>
<li><b>Yakaladıysan bir şey yap:</b> kullanıcıya bildir, kaydet (log), varsayılan değeri <em>bilinçli</em> kullan.</li>
<li><b>Beklenen durumlar için exception kullanma.</b> Kullanıcının harf yazması beklenir → <code>TryParse</code>. Exception'lar gerçekten istisnai durumlar içindir.</li>
<li><b>Hata mesajını dikkatle oku.</b> Türü (<code>IndexOutOfRangeException</code>) ve satır numarası sorunun yarısını çözer.</li>
</ul>
<p>Aşağıdaki kod bozuk bir değerle karşılaşınca çöküyor. Düzelt — ama boş catch ile değil!</p>`,
    },
    {
      kind: 'code',
      title: 'Hata avı: Kalınlık listesini topla',
      code: cs`string[] inputs = { "200", "150", "yüz", "250" };
int total = 0;
foreach (string s in inputs)
{
    total += int.Parse(s);
}
Console.WriteLine("Toplam kalınlık: " + total + " mm");`,
      editable: true,
      runnable: true,
      expectError: true,
      explain: {
        1: 'Bir tablodan gelmiş gibi düşün: biri "100" yerine "yüz" yazmış.',
        5: 'Üçüncü turda <code>int.Parse("yüz")</code> → FormatException → program çöker, toplam hiç yazdırılmaz.',
      },
      note: 'Hedef çıktı: geçersiz değer için "Atlandı: yüz" gibi bir uyarı yazsın, sonra "Toplam kalınlık: 600 mm". İpucu: int.TryParse(s, out int value) ile if/else.',
    },
    {
      kind: 'cad',
      title: 'CAD/BIM\'de savunmacı programlama',
      body: `
<p>Bir CAD kullanıcısı bir modele saatler, hatta günler harcar. Bu yüzden profesyonel tasarım yazılımlarında en önemli kurallardan biri: <b>kullanıcının işini asla kaybettirme</b>. Bunun yolu <b><t en="defensive programming" ja="防御的プログラミング">savunmacı programlama</t></b>dır:</p>
<ul>
<li><b>Sınırda doğrula.</b> Veri programa girdiği anda (ölçü kutusu, içe aktarılan dosya, ağdan gelen veri) kontrol edilir. Negatif duvar kalınlığı, 0 kat yüksekliği, boş dosya adı — içeri hiç alınmaz. (<t en="input validation" ja="入力チェック">Girdi doğrulama</t>)</li>
<li><b>İçeride ön koşul koy.</b> <code>WallVolume</code> gibi çekirdek fonksiyonlar yine de kendi girdisini kontrol eder ve <code>ArgumentException</code> fırlatır. İki kat güvenlik.</li>
<li><b>Bozuk dosyada bile ayakta kal.</b> 10.000 satırlık bir dosyanın 1 satırı bozuksa, tüm içe aktarmayı çökertmek yerine o satırı atlayıp "12. satır okunamadı" diye raporlamak çoğu zaman daha iyidir.</li>
<li><b>Anlaşılır mesaj.</b> "Error 0x80004005" yerine "Duvar kalınlığı 0'dan büyük olmalıdır (girilen: -150 mm)". Japonca arayüzlerde de bu mesajlar dikkatle yazılır; hata mesajı kullanıcı deneyiminin parçasıdır.</li>
</ul>
<p class="muted">Bir geliştirici olarak iş görüşmelerinde "Bu fonksiyona yanlış değer gelirse ne olur?" sorusuyla sık karşılaşabilirsin. Bu dersin cevabı: doğrula, anlamlı bir exception fırlat, uygun yerde yakala, kullanıcıya açıkla.</p>`,
    },
  ],
  exercise: {
    title: 'Güvenli ölçekleme aracı',
    prompt: `
<p>Bir objeyi ölçekleyen küçük bir araç yaz. Program stdin'den iki satır okur: <b>boyut</b> (mm, ondalıklı olabilir) ve <b>ölçek çarpanı</b>.</p>
<ol>
<li><code>double SafeScale(double sizeMm, double factor)</code> fonksiyonunu yaz: <code>factor</code> 0 veya negatifse <code>throw new ArgumentException("Ölçek çarpanı pozitif olmalı")</code>; değilse <code>sizeMm * factor</code> döndür.</li>
<li>Boyutu <code>double.TryParse</code> ile oku. Çevrilemezse <code>Geçersiz boyut: &lt;metin&gt;</code> yazdır ve dur.</li>
<li>Çarpanı da <code>double.TryParse</code> ile oku. Çevrilemezse <code>Geçersiz çarpan: &lt;metin&gt;</code> yazdır.</li>
<li>İkisi de sayıysa <code>SafeScale</code>'i <code>try/catch (ArgumentException ex)</code> içinde çağır. Başarılıysa <code>Sonuç: &lt;değer&gt; mm</code>, hata olursa <code>Hata: &lt;ex.Message&gt;</code> yazdır.</li>
</ol>
<p>Girdi <code>200</code> ve <code>1.5</code> için:</p>
<pre class="expected">Sonuç: 300 mm</pre>
<p>Girdi <code>200</code> ve <code>-2</code> için: <code>Hata: Ölçek çarpanı pozitif olmalı</code> · Girdi <code>abc</code> ve <code>2</code> için: <code>Geçersiz boyut: abc</code></p>`,
    stdin: '200\n1.5',
    starter: cs`double SafeScale(double sizeMm, double factor)
{
    // factor <= 0 ise ArgumentException fırlat
    return sizeMm * factor;
}

string sizeText = Console.ReadLine();
string factorText = Console.ReadLine();

// 1) sizeText'i double.TryParse ile çevir
// 2) factorText'i double.TryParse ile çevir
// 3) SafeScale'i try/catch içinde çağır
`,
    checks: [
      { type: 'output', expect: 'Sonuç: 300 mm', msg: '200 ve 1.5 girdisiyle "Sonuç: 300 mm" yazmalı' },
      { type: 'output', stdin: '200\n-2', expect: 'Hata: Ölçek çarpanı pozitif olmalı', msg: 'Negatif çarpanda exception yakalanıp mesajı yazdırılmalı' },
      { type: 'output', stdin: 'abc\n2', expect: 'Geçersiz boyut: abc', msg: 'Sayı olmayan boyutta "Geçersiz boyut: ..." yazmalı ve çökmemeli' },
      { type: 'output', stdin: '50\niki', expect: 'Geçersiz çarpan: iki', msg: 'Sayı olmayan çarpanda "Geçersiz çarpan: ..." yazmalı' },
      { type: 'output', stdin: '12.5\n4', expect: 'Sonuç: 50 mm', msg: 'Ondalıklı boyutlarla da çalışmalı' },
      { type: 'harness', append: cs`try { SafeScale(10, 0); Console.WriteLine("fırlatmadı"); }
catch (ArgumentException ex) { Console.WriteLine("yakalandı: " + ex.Message); }
Console.WriteLine(SafeScale(10, 2.5));`, expect: 'yakalandı: Ölçek çarpanı pozitif olmalı\n25', msg: 'SafeScale(10, 0) ArgumentException fırlatmalı; geçerli çarpanda sonucu döndürmeli' },
      { type: 'code', pattern: 'throw\\s+new\\s+ArgumentException', msg: 'SafeScale içinde throw new ArgumentException(...) kullan' },
      { type: 'code', pattern: 'catch\\s*\\(\\s*ArgumentException', msg: 'ArgumentException\'ı catch (ArgumentException ex) ile yakala' },
      { type: 'code', pattern: 'double\\.TryParse', msg: 'Girdileri double.TryParse ile çevir' },
    ],
    hints: [
      'Önce fonksiyonu tamamla: başına bir <code>if (factor &lt;= 0)</code> koşulu ve içinde <code>throw new ArgumentException("...")</code>. Mesaj metni birebir aynı olmalı.',
      'Girdi kontrolü için iç içe <code>if</code> kullanabilirsin: <code>if (!double.TryParse(sizeText, out double size)) { ... } else if (!double.TryParse(factorText, out double scale)) { ... } else { ... }</code>.',
      'Son <code>else</code> bloğunun içinde: <code>try { double result = SafeScale(size, scale); Console.WriteLine("Sonuç: " + result + " mm"); } catch (ArgumentException ex) { ... }</code>.',
    ],
    solution: cs`double SafeScale(double sizeMm, double factor)
{
    if (factor <= 0)
    {
        throw new ArgumentException("Ölçek çarpanı pozitif olmalı");
    }
    return sizeMm * factor;
}

string sizeText = Console.ReadLine();
string factorText = Console.ReadLine();

if (!double.TryParse(sizeText, out double size))
{
    Console.WriteLine("Geçersiz boyut: " + sizeText);
}
else if (!double.TryParse(factorText, out double scale))
{
    Console.WriteLine("Geçersiz çarpan: " + factorText);
}
else
{
    try
    {
        double result = SafeScale(size, scale);
        Console.WriteLine("Sonuç: " + result + " mm");
    }
    catch (ArgumentException ex)
    {
        Console.WriteLine("Hata: " + ex.Message);
    }
}`,
    explain: 'İki farklı araç, iki farklı iş için: kullanıcının yanlış yazması beklenen bir durum olduğu için TryParse ile sessizce kontrol ettin; SafeScale ise kendi sözleşmesini (factor > 0) throw ile korudu ve çağıran kod bu exception\'ı yakalayıp kullanıcıya anlaşılır bir mesaj gösterdi.',
  },
  quiz: [
    {
      q: 'Program derleniyor, çalışıyor ve hiç çökmüyor, ama ekrana yazdığı ortalama yanlış. Bu hangi tür hatadır?',
      options: [
        { t: 'Mantık hatası', correct: true, why: 'Doğru. Kod geçerli ve çalışıyor ama yanlış şeyi hesaplıyor. Ne derleyici ne çalışma zamanı uyarır; test ederek bulursun.' },
        { t: 'Derleme hatası', why: 'Derleme hatası olsaydı program hiç çalışmazdı.' },
        { t: 'Çalışma zamanı hatası (exception)', why: 'Exception olsaydı program (yakalanmadıysa) çökerdi. Burada her şey "başarılı" görünüyor.' },
        { t: 'Hata değil, ondalık yuvarlama', why: 'Yanlış bir sonuç her zaman araştırılmalı; "yuvarlamadır" diye geçmek mantık hatalarını gizler.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`try
{
    Console.WriteLine("1");
    int x = int.Parse("7");
    Console.WriteLine("2");
}
catch (FormatException)
{
    Console.WriteLine("3");
}
finally
{
    Console.WriteLine("4");
}`,
      verifyOutput: true,
      options: [
        { t: '1\n2\n4', correct: true, why: 'Doğru. "7" geçerli bir sayı, exception fırlamaz; catch atlanır. finally ise her durumda çalışır.' },
        { t: '1\n2', why: 'finally hata olmasa da çalışır.' },
        { t: '1\n3\n4', why: '"7" sorunsuz çevrilir; catch sadece exception fırlarsa çalışır.' },
        { t: '1\n2\n3\n4', why: 'catch bloğu yalnızca eşleşen bir exception olduğunda çalışır.' },
      ],
    },
    {
      q: '"Unhandled exception" ne demektir?',
      options: [
        { t: 'Fırlatılan exception çağrı yığınının hiçbir yerinde yakalanmadı, bu yüzden program sonlandırıldı', correct: true, why: 'Doğru. Exception Main\'e kadar yükseldi ve hiçbir catch onu karşılamadı.' },
        { t: 'Derleyici kodu reddetti', why: 'Bu derleme hatasıdır; exception\'lar çalışma zamanında oluşur.' },
        { t: 'Exception yakalandı ama mesajı yazdırılmadı', why: 'Yakalanmış bir exception "handled" sayılır, programı kapatmaz.' },
        { t: 'Program yavaş çalıştı', why: 'Performansla ilgisi yok; yakalanmamış bir hata demektir.' },
      ],
    },
    {
      q: 'Bu programın çıktısı nedir?',
      code: cs`bool ok = int.TryParse("12.5", out int n);
Console.WriteLine(ok + " " + n);`,
      verifyOutput: true,
      options: [
        { t: 'False 0', correct: true, why: 'Doğru. "12.5" bir tam sayı değildir; TryParse exception fırlatmadan false döndürür ve n\'e 0 yazar.' },
        { t: 'True 12', why: 'TryParse ondalık kısmı kesip atmaz; metnin tamamı geçerli bir int olmalı.' },
        { t: 'True 13', why: 'Yuvarlama yapılmaz; ondalık noktalı metin int için geçersizdir.' },
        { t: 'FormatException ile çöker', why: 'Çöken int.Parse olurdu. TryParse\'ın bütün amacı çökmemektir.' },
      ],
    },
    {
      q: 'Bu kodun asıl sorunu nedir?',
      code: cs`string[] values = { "200", "15O", "250" };
int total = 0;
foreach (string s in values)
{
    try { total += int.Parse(s); }
    catch (Exception) { }
}`,
      options: [
        { t: 'Hataları sessizce yutuyor: bozuk veri fark edilmeden atlanıyor ve toplam yanlış çıkabiliyor', correct: true, why: 'Doğru. Boş catch, çalışma zamanı hatasını görünmez bir mantık hatasına çevirir. En azından uyarı yazılmalı ya da TryParse kullanılmalı.' },
        { t: 'catch bloğu foreach içinde kullanılamaz', why: 'try/catch döngü içinde de kullanılabilir; sorun bu değil.' },
        { t: 'Exception türü yazmak zorunlu değil, bu yüzden derlenmez', why: 'catch (Exception) geçerli bir sözdizimidir; kod derlenir.' },
        { t: 'Hiçbir sorun yok, program çökmüyor', why: 'Çökmemek tek başına hedef değildir; doğru sonuç ve görünür hatalar da gerekir.' },
      ],
    },
    {
      q: 'Bir fonksiyon negatif duvar kalınlığı aldığında en uygun davranış hangisi?',
      options: [
        { t: 'throw new ArgumentException("...") ile açık bir mesajla reddetmek', correct: true, why: 'Doğru. Fonksiyon sözleşmesini korur ve çağıran, hatayı kaynağında öğrenir (fail fast).' },
        { t: 'Sessizce 0 döndürmek', why: '0 geçerli bir sonuç gibi görünür; hata çok daha sonra, bulunması zor bir yerde ortaya çıkar.' },
        { t: 'Mutlak değerini alıp devam etmek', why: 'Kullanıcının niyetini tahmin etmek tehlikelidir; -150 belki bir yazım hatasıdır, belki başka bir şey.' },
        { t: 'Programı hemen kapatmak', why: 'Kullanıcının işini kaybettirir. Exception fırlatıp uygun yerde yakalamak çok daha iyi.' },
      ],
    },
  ],
  challenge: {
    title: 'Meydan okuma: Bozuk .obj satırlarına dayanıklı okuyucu',
    prompt: `
<p>Basitleştirilmiş bir <code>.obj</code> okuyucu yaz. stdin'deki her satır <code>v x y z</code> biçiminde bir vertex'tir. Girdi bitene kadar (<code>Console.ReadLine()</code> <code>null</code> döndürene kadar) oku. Bazı satırlar bozuk:</p>
<ul>
<li>Sayı olmayan koordinat (<code>v 1 abc 3</code>) → <code>double.Parse</code> <code>FormatException</code> fırlatır → <code>Satır N: sayı okunamadı</code></li>
<li>Eksik koordinat (<code>v 1 2</code>) → <code>parts[3]</code> <code>IndexOutOfRangeException</code> fırlatır → <code>Satır N: eksik koordinat</code></li>
</ul>
<p>Her iki exception'ı <b>ayrı catch blokları</b>yla yakala, programı çökertme. Sonunda geçerli vertex sayısını, hatalı satır sayısını ve geçerli vertex'lerin en yüksek y değerini yazdır. Satır numaraları 1'den başlar.</p>
<p>Girdi:</p>
<pre><code>v 0 0 0
v 1 abc 3
v 1 2
v -1.5 2.5 0
v 2 1 1</code></pre>
<pre class="expected">Satır 2: sayı okunamadı
Satır 3: eksik koordinat
Geçerli vertex: 3
Hatalı satır: 2
En yüksek y: 2.5</pre>`,
    stdin: 'v 0 0 0\nv 1 abc 3\nv 1 2\nv -1.5 2.5 0\nv 2 1 1',
    starter: cs`int lineNo = 0;
int valid = 0;
int bad = 0;
double maxY = double.MinValue;

string line = Console.ReadLine();
while (line != null)
{
    lineNo++;
    string[] parts = line.Split(' ');
    // try içinde x, y, z'yi double.Parse ile oku
    // FormatException ve IndexOutOfRangeException için ayrı catch
    line = Console.ReadLine();
}
`,
    checks: [
      { type: 'output', expect: 'Satır 2: sayı okunamadı\nSatır 3: eksik koordinat\nGeçerli vertex: 3\nHatalı satır: 2\nEn yüksek y: 2.5', msg: 'Örnek girdiyle çıktı birebir aynı olmalı' },
      { type: 'output', stdin: 'v 1 2\nv 0 -4 1\nv x y z\nv 3 -1 0', expect: 'Satır 1: eksik koordinat\nSatır 3: sayı okunamadı\nGeçerli vertex: 2\nHatalı satır: 2\nEn yüksek y: -1', msg: 'Farklı girdiyle (negatif y değerleri dahil) doğru çalışmalı' },
      { type: 'code', pattern: 'catch\\s*\\(\\s*FormatException', msg: 'FormatException için ayrı bir catch bloğu yaz' },
      { type: 'code', pattern: 'catch\\s*\\(\\s*IndexOutOfRangeException', msg: 'IndexOutOfRangeException için ayrı bir catch bloğu yaz' },
      { type: 'notCode', pattern: 'catch\\s*(\\(\\s*Exception\\b[^)]*\\))?\\s*\\{', msg: 'Her şeyi yakalayan catch / catch (Exception) kullanma; belirli türleri yakala' },
    ],
    hints: [
      'Döngünün içinde <code>try { ... } catch (FormatException) { ... } catch (IndexOutOfRangeException) { ... }</code> iskeletini kur. <code>line = Console.ReadLine();</code> satırı try\'ın DIŞINDA kalmalı, yoksa hata olunca bir sonraki satır okunmaz.',
      'try içinde: <code>double x = double.Parse(parts[1]);</code>, y ve z de aynı şekilde. Üçü de başarılıysa <code>valid++</code> ve y ile <code>maxY</code>\'yi karşılaştır.',
      'maxY\'yi <code>double.MinValue</code> ile başlatmak, tüm y\'ler negatif olsa bile doğru çalışmasını sağlar. Catch bloklarında <code>bad++</code> ve <code>"Satır " + lineNo + ": ..."</code> mesajı.',
    ],
    solution: cs`int lineNo = 0;
int valid = 0;
int bad = 0;
double maxY = double.MinValue;

string line = Console.ReadLine();
while (line != null)
{
    lineNo++;
    string[] parts = line.Split(' ');
    try
    {
        double x = double.Parse(parts[1]);
        double y = double.Parse(parts[2]);
        double z = double.Parse(parts[3]);
        valid++;
        if (y > maxY) maxY = y;
    }
    catch (FormatException)
    {
        Console.WriteLine("Satır " + lineNo + ": sayı okunamadı");
        bad++;
    }
    catch (IndexOutOfRangeException)
    {
        Console.WriteLine("Satır " + lineNo + ": eksik koordinat");
        bad++;
    }
    line = Console.ReadLine();
}

Console.WriteLine("Geçerli vertex: " + valid);
Console.WriteLine("Hatalı satır: " + bad);
Console.WriteLine("En yüksek y: " + maxY);`,
  },
  extras: [
    {
      difficulty: 1,
      title: 'Çökmeyen sayı okuma (try/catch)',
      prompt: `<p>stdin'den bir satır oku ve <code>int.Parse</code> ile çevir. Başarılıysa <code>Poligon: &lt;sayı&gt;</code>, <code>FormatException</code> olursa <code>Hata: geçersiz sayı</code> yazdır. (Bu alıştırmada TryParse değil, try/catch kullan.)</p><pre class="expected">Poligon: 1200</pre>`,
      stdin: '1200',
      starter: cs`string text = Console.ReadLine();
int polys = int.Parse(text);
Console.WriteLine("Poligon: " + polys);`,
      checks: [
        { type: 'output', expect: 'Poligon: 1200' },
        { type: 'output', stdin: 'bin', expect: 'Hata: geçersiz sayı', msg: 'Sayı olmayan girdide çökmemeli, "Hata: geçersiz sayı" yazmalı' },
        { type: 'code', pattern: 'catch\\s*\\(\\s*FormatException', msg: 'catch (FormatException) kullan' },
      ],
      hints: ['int.Parse satırını ve onu kullanan WriteLine\'ı bir <code>try { }</code> bloğuna al.', 'Hemen arkasına <code>catch (FormatException) { Console.WriteLine("Hata: geçersiz sayı"); }</code> ekle.'],
      solution: cs`string text = Console.ReadLine();
try
{
    int polys = int.Parse(text);
    Console.WriteLine("Poligon: " + polys);
}
catch (FormatException)
{
    Console.WriteLine("Hata: geçersiz sayı");
}`,
    },
    {
      difficulty: 2,
      title: 'double bölme 0\'da çökmez — sen kontrol et',
      prompt: `<p>Tam sayılarda 0'a bölme exception fırlatır ama <code>double</code>'da fırlatmaz: <code>5.0 / 0</code> sonsuzluk (∞) verir ve hata sessizce yayılır! <code>double AspectRatio(double width, double height)</code> yaz: <code>height</code> 0 ise <code>throw new ArgumentException("Yükseklik 0 olamaz")</code>, değilse <code>width / height</code> döndürsün. Sonra 1920×1080 oranını <code>F3</code> biçiminde yazdır, ardından <code>AspectRatio(100, 0)</code> çağrısını try/catch içinde yapıp mesajı yazdır.</p><pre class="expected">Oran: 1.778
Hata: Yükseklik 0 olamaz</pre>`,
      starter: cs`double AspectRatio(double width, double height)
{
    return width / height;
}

Console.WriteLine($"Oran: {AspectRatio(1920, 1080):F3}");
Console.WriteLine("Oran: " + AspectRatio(100, 0));`,
      checks: [
        { type: 'output', expect: 'Oran: 1.778\nHata: Yükseklik 0 olamaz' },
        { type: 'harness', append: cs`try { AspectRatio(1, 0); Console.WriteLine("fırlatmadı"); } catch (ArgumentException e) { Console.WriteLine(e.Message); }
Console.WriteLine(AspectRatio(9, 3));`, expect: 'Yükseklik 0 olamaz\n3', msg: 'AspectRatio(x, 0) ArgumentException fırlatmalı' },
        { type: 'code', pattern: 'throw\\s+new\\s+ArgumentException', msg: 'throw new ArgumentException kullan' },
      ],
      hints: ['Fonksiyonun başına bir guard: <code>if (height == 0) throw new ArgumentException("...");</code>', 'İkinci çağrıyı <code>try { ... } catch (ArgumentException ex) { Console.WriteLine("Hata: " + ex.Message); }</code> içine al.'],
      solution: cs`double AspectRatio(double width, double height)
{
    if (height == 0)
    {
        throw new ArgumentException("Yükseklik 0 olamaz");
    }
    return width / height;
}

Console.WriteLine($"Oran: {AspectRatio(1920, 1080):F3}");
try
{
    Console.WriteLine("Oran: " + AspectRatio(100, 0));
}
catch (ArgumentException ex)
{
    Console.WriteLine("Hata: " + ex.Message);
}`,
    },
    {
      difficulty: 3,
      title: 'Sınırlı denemeli platform seçimi',
      prompt: `<p>Kullanıcıdan hedef platformu iste (<code>mobile</code>, <code>console</code>, <code>pc</code>; büyük/küçük harf ve baştaki/sondaki boşluklar önemsiz). En fazla <b>3</b> deneme hakkı var. Her geçersiz girişte <code>Geçersiz platform: &lt;girdi&gt;</code> yaz. Geçerli giriş gelince <code>Platform: &lt;ad&gt;, bütçe: &lt;sayı&gt;</code> yaz (örnek bütçeler: mobile 100000, console 1000000, pc 2000000). 3 deneme de geçersizse ya da girdi biterse (<code>null</code>) <code>Varsayılan kullanılıyor: pc, bütçe: 2000000</code> yaz.</p><pre class="expected">Geçersiz platform: tablet
Platform: console, bütçe: 1000000</pre>`,
      stdin: 'tablet\n  Console ',
      starter: cs`int attempts = 0;
string platform = "";
int budget = 0;
`,
      checks: [
        { type: 'output', expect: 'Geçersiz platform: tablet\nPlatform: console, bütçe: 1000000' },
        { type: 'output', stdin: 'a\nb\nc\nmobile', expect: 'Geçersiz platform: a\nGeçersiz platform: b\nGeçersiz platform: c\nVarsayılan kullanılıyor: pc, bütçe: 2000000', msg: '3 hatalı denemeden sonra varsayılana geçmeli (4. satırı okumamalı)' },
        { type: 'output', stdin: 'MOBILE', expect: 'Platform: mobile, bütçe: 100000', msg: 'Büyük/küçük harf duyarsız olmalı' },
        { type: 'output', stdin: 'x', expect: 'Geçersiz platform: x\nVarsayılan kullanılıyor: pc, bütçe: 2000000', msg: 'Girdi biterse (ReadLine null) varsayılana geçmeli ve çökmemeli' },
        { type: 'code', pattern: 'while\\s*\\(', msg: 'Deneme döngüsünü while ile kur' },
      ],
      hints: [
        'Döngü koşulu iki şeye bağlı: <code>attempts &lt; 3</code> ve henüz geçerli bir platform bulunmamış olması.',
        'Okuduğun satır <code>null</code> ise döngüden <code>break</code> ile çık (null üzerinde Trim çağırmak NullReferenceException verir!). Değilse <code>input.Trim().ToLower()</code> ile normalleştir.',
        'Bütçeyi bulmak için if/else if zinciri ya da switch kullan; geçerliyse <code>budget</code>\'ı ata. Döngüden sonra <code>budget == 0</code> ise varsayılan mesajı yaz.',
      ],
      solution: cs`int attempts = 0;
string platform = "";
int budget = 0;

while (attempts < 3 && budget == 0)
{
    string input = Console.ReadLine();
    if (input == null) break;
    attempts++;
    string p = input.Trim().ToLower();
    if (p == "mobile") budget = 100000;
    else if (p == "console") budget = 1000000;
    else if (p == "pc") budget = 2000000;
    else Console.WriteLine("Geçersiz platform: " + input);
    if (budget > 0) platform = p;
}

if (budget == 0)
{
    Console.WriteLine("Varsayılan kullanılıyor: pc, bütçe: 2000000");
}
else
{
    Console.WriteLine("Platform: " + platform + ", bütçe: " + budget);
}`,
    },
  ],
  vocab: [
    { en: 'Exception', tr: 'İstisna (exception)', ja: '例外', kana: 'れいがい', romaji: 'reigai' },
    { en: 'Exception handling', tr: 'Hata / istisna yönetimi', ja: '例外処理', kana: 'れいがいしょり', romaji: 'reigai shori' },
    { en: 'Error handling', tr: 'Hata yönetimi', ja: 'エラー処理', kana: 'エラーしょり', romaji: 'erā shori' },
    { en: 'Runtime error', tr: 'Çalışma zamanı hatası', ja: '実行時エラー', kana: 'じっこうじエラー', romaji: 'jikkōji erā' },
    { en: 'Logic error', tr: 'Mantık hatası', ja: '論理エラー', kana: 'ろんりエラー', romaji: 'ronri erā' },
    { en: 'Bug', tr: 'Hata (bug)', ja: 'バグ', kana: 'バグ', romaji: 'bagu' },
    { en: 'Debugging', tr: 'Hata ayıklama', ja: 'デバッグ', kana: 'デバッグ', romaji: 'debaggu' },
    { en: 'Throw an exception', tr: 'Exception fırlatmak', ja: '例外を投げる', kana: 'れいがいをなげる', romaji: 'reigai o nageru' },
    { en: 'Catch (an exception)', tr: 'Yakalamak', ja: '捕捉', kana: 'ほそく', romaji: 'hosoku' },
    { en: 'Input validation', tr: 'Girdi doğrulama', ja: '入力チェック', kana: 'にゅうりょくチェック', romaji: 'nyūryoku chekku' },
    { en: 'Defensive programming', tr: 'Savunmacı programlama', ja: '防御的プログラミング', kana: 'ぼうぎょてきプログラミング', romaji: 'bōgyoteki puroguramingu' },
    { en: 'Crash', tr: 'Çökme', ja: 'クラッシュ', kana: 'クラッシュ', romaji: 'kurasshu' },
  ],
  summary: [
    'Derleme hatası programı hiç başlatmaz, çalışma zamanı hatası (exception) çalışırken patlar, mantık hatası sessizce yanlış sonuç üretir.',
    'Exception fırlatıldığı yerden çağıranlara doğru yükselir; hiçbir catch yakalamazsa "Unhandled exception" ile program kapanır.',
    'try içindeki hata, satırın geri kalanını atlatıp uyan ilk catch\'e zıplar; ex.Message açıklamayı verir; finally her durumda çalışır.',
    'throw new ArgumentException("...") ile fonksiyon kendi ön koşulunu korur: geçersiz girdiyi kaynağında, açık bir mesajla reddeder.',
    'Beklenen hatalı girdiler için TryParse + while doğrulama döngüsü kullan; exception\'ları gerçekten istisnai durumlara sakla.',
    'Boş catch hatayı yutar ve onu bulunması zor bir mantık hatasına çevirir: sadece başa çıkabileceğin türü yakala ve bir şey yap.',
  ],
};
