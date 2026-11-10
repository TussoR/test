import { cs } from '../helpers.js';

// Ortak parçalar: sonraki adımların başlangıç kodlarında, önceki adımda yazdığın kodun kısaltılmış hâli kullanılır.
const HESAPLA_V5 = cs`double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b == 0) throw new DivideByZeroException("Sıfıra bölme yapılamaz.");
            return a / b;
        default:
            throw new ArgumentException("Bilinmeyen işlem: " + op);
    }
}`;

const IFADE_V6 = cs`string IfadeyiIsle(string satir)
{
    string[] parca = satir.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (parca.Length != 3) return "Hata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).";
    if (!double.TryParse(parca[0], out double a)) return "Hata: '" + parca[0] + "' bir sayı değil.";
    if (parca[1].Length != 1) return "Hata: İşlem tek karakter olmalı.";
    if (!double.TryParse(parca[2], out double b)) return "Hata: '" + parca[2] + "' bir sayı değil.";
    char op = parca[1][0];
    try
    {
        double sonuc = Hesapla(a, op, b);
        return $"{a} {op} {b} = {sonuc}";
    }
    catch (DivideByZeroException ex) { return "Hata: " + ex.Message; }
    catch (ArgumentException ex) { return "Hata: " + ex.Message; }
}`;

const MENU_V7 = cs`Console.WriteLine("Hesap makinesi (çıkmak için q)");
while (true)
{
    string? satir = Console.ReadLine();
    if (satir == null) break;
    satir = satir.Trim();
    if (satir == "") continue;
    if (satir.ToLower() == "q") break;
    Console.WriteLine(IfadeyiIsle(satir));
}
Console.WriteLine("Güle güle!");`;

export default {
  kind: 'project',
  id: 'p1',
  module: 'm8',
  title: 'Proje 1: Hesap Makinesi',
  titleEn: 'Calculator',
  titleJa: '電卓',
  minutes: 300,
  level: 2,
  environment: 'browser',
  summary: `
<p>İlk portfolyo projen: konsolda çalışan, hatalara dayanıklı bir <b>hesap makinesi</b>. Basit görünür ama gerçek bir yazılımın bütün temel parçalarını içerir: kullanıcıdan <t en="input" ja="入力">girdi</t> almak, onu doğrulamak, hesaplamak, hataları yakalamak, bir döngüde komut beklemek ve <t en="history" ja="履歴">geçmişi</t> tutmak.</p>
<p>Projeyi 9 küçük adımda büyüteceksin; her adımın bir alıştırması var ve her adım bir öncekinin üzerine kurulur. Son adımda aynı hesaplama mantığını Visual Studio'da bir <t en="WinForms" ja="Windowsフォーム">Windows Forms</t> arayüzüne bağlamayı göreceksin. Asıl ders şu: <b>hesaplama mantığı ile arayüz ayrı tutulursa</b> aynı kod hem konsolda hem pencerede hem de testlerde çalışır. CAD yazılımlarındaki geometri çekirdeği ile ekran arasındaki ilişki de tam olarak budur.</p>`,
  goals: [
    'Kullanıcıdan metin okuyup sayıya çevirmek ve geçersiz girdiyi programı çökertmeden yakalamak',
    'switch ile işlem seçmek ve her işlemi ayrı bir fonksiyona taşımak',
    'Sıfıra bölme gibi hatalı durumları exception (istisna) ile bildirmek ve yakalamak',
    'Kullanıcı q yazana kadar çalışan bir komut döngüsü kurmak',
    'Hesaplama geçmişini bir string listesinde (List) tutmak ve listelemek',
    'Aynı mantığın bir WinForms arayüzüne nasıl bağlandığını anlamak (mantık / arayüz ayrımı)',
  ],
  skills: ['Console.ReadLine', 'double.Parse / TryParse', 'switch', 'Fonksiyonlar ve dönüş değerleri', 'try / catch / throw', 'while döngüsü', 'string.Split', 'List (string listesi)', 'Mantık / arayüz ayrımı'],
  steps: [
    {
      title: 'Adım 1 — İki sayı oku ve topla',
      body: `
<p>Her hesap makinesi aynı şeyle başlar: kullanıcıdan iki sayı almak. <code>Console.ReadLine()</code> kullanıcının yazdığı satırı <b>metin</b> (<code>string</code>) olarak döndürür. Bilgisayar için <code>"6"</code> bir sayı değil, tek karakterlik bir metindir; <code>"6" + "2"</code> sonucu <code>"62"</code> olur!</p>
<p>Bu yüzden metni <code>double.Parse(metin)</code> ile sayıya çeviririz. Neden <code>int</code> değil de <code>double</code>? Çünkü hesap makinesi <code>2.5</code> gibi ondalıklı sayılarla da çalışmalı.</p>
<div class="callout">Bu platformda programın girdileri sağdaki <b>Girdi (stdin)</b> kutusundan satır satır okunur ve ekranda tekrar gösterilmez. Bu yüzden soru metinlerini <code>Console.WriteLine</code> ile ayrı satıra yazıyoruz; çıktı böylece düzenli kalır.</div>
<p>Aşağıdaki örneği çalıştır, sonra girdi kutusundaki sayıları değiştirip tekrar dene.</p>`,
      code: cs`Console.WriteLine("Bir sayı yaz:");
string metin = Console.ReadLine();
double sayi = double.Parse(metin);
Console.WriteLine("Metin + metin: " + (metin + metin));
Console.WriteLine("Sayı + sayı:   " + (sayi + sayi));`,
      runnable: true,
      stdin: '2.5',
      exercise: {
        title: 'İki sayıyı topla',
        prompt: `
<p>Başlangıç kodu iki sayıyı metin olarak okuyor. Metinleri <code>double</code>'a çevir, topla ve sonucu <code>Toplam: ...</code> biçiminde yazdır. Girdi <code>6</code> ve <code>2</code> iken çıktı tam olarak şöyle olmalı:</p>
<pre class="expected">Birinci sayı:
İkinci sayı:
Toplam: 8</pre>
<p>Programın <code>2.5</code> ve <code>4</code> girdileriyle de <code>Toplam: 6.5</code> yazmalı.</p>`,
        starter: cs`Console.WriteLine("Birinci sayı:");
string metin1 = Console.ReadLine();
Console.WriteLine("İkinci sayı:");
string metin2 = Console.ReadLine();

// 1) İki metni double'a çevir
// 2) Topla ve "Toplam: ..." biçiminde yazdır
`,
        stdin: '6\n2',
        checks: [
          { type: 'output', expect: 'Birinci sayı:\nİkinci sayı:\nToplam: 8', msg: '6 ve 2 girildiğinde "Toplam: 8" yazmalı' },
          { type: 'output', stdin: '2.5\n4', expect: 'Birinci sayı:\nİkinci sayı:\nToplam: 6.5', msg: 'Ondalıklı sayılarla da çalışmalı (2.5 + 4 = 6.5)' },
          { type: 'code', pattern: 'double\\.Parse|double\\.TryParse|Convert\\.ToDouble', msg: 'Metni double.Parse ile sayıya çevirmelisin' },
        ],
        hints: [
          'Metni sayıya çevirmeden toplarsan <code>"6" + "2"</code> = <code>"62"</code> olur. Önce her metni ayrı bir <code>double</code> değişkene çevir.',
          '<code>double a = double.Parse(metin1);</code> satırı ilk sayıyı verir. İkincisi için de aynısını yap.',
          'Son satır: <code>Console.WriteLine("Toplam: " + (a + b));</code> — parantez önemli; olmazsa önce metin birleştirme yapılır.',
        ],
        solution: cs`Console.WriteLine("Birinci sayı:");
string metin1 = Console.ReadLine();
Console.WriteLine("İkinci sayı:");
string metin2 = Console.ReadLine();

double a = double.Parse(metin1);
double b = double.Parse(metin2);
Console.WriteLine("Toplam: " + (a + b));`,
        explain: '<code>double.Parse</code> metni sayıya çevirir; ancak ondan sonra <code>+</code> matematiksel toplama yapar. <code>"Toplam: " + (a + b)</code> ifadesinde parantez, toplamanın metin birleştirmesinden önce yapılmasını sağlar.',
      },
    },
    {
      title: 'Adım 2 — Dört işlem: switch ile işlem seçimi',
      body: `
<p>Şimdi kullanıcı bir de <b>işlem</b> seçsin: <code>+ - * /</code>. İşlemi tek bir karakter (<code>char</code>) olarak tutacağız: <code>char op = islem[0];</code> — metnin ilk karakteri.</p>
<p>Bir değişkenin birkaç olası değerine göre farklı kod çalıştırmak için en okunaklı yapı <code>switch</code>'tir. <code>if / else if</code> zinciri de olur, ama <code>switch</code> "bu değişkenin durumlarına bakıyorum" niyetini açıkça gösterir.</p>
<div class="callout tip">3D'den benzetme: Blender'da <b>G / R / S</b> tuşları aynı fare hareketine farklı anlam verir (taşı / döndür / ölçekle). Program içinde bu, basılan tuşa göre dallanan bir <code>switch</code>'tir.</div>
<p><code>default</code> dalı, hiçbir <code>case</code>'e uymayan durumları yakalar. Kullanıcı <code>%</code> gibi beklenmeyen bir şey yazarsa programın sessiz kalması yerine anlamlı bir mesaj vermesi gerekir.</p>`,
      exercise: {
        title: 'switch ile dört işlem',
        prompt: `
<p><code>op</code> karakterine göre <code>+ - * /</code> işlemlerinden birini yap ve <code>Sonuç: ...</code> yazdır. Bilinmeyen bir işlem gelirse <code>Bilinmeyen işlem: %</code> gibi (gelen karakterle) bir mesaj yaz.</p>
<p>Örnek: girdi <code>6</code>, <code>*</code>, <code>2</code> →</p>
<pre class="expected">Birinci sayı:
İşlem (+ - * /):
İkinci sayı:
Sonuç: 12</pre>`,
        starter: cs`Console.WriteLine("Birinci sayı:");
double a = double.Parse(Console.ReadLine());
Console.WriteLine("İşlem (+ - * /):");
string islem = Console.ReadLine();
char op = islem[0];
Console.WriteLine("İkinci sayı:");
double b = double.Parse(Console.ReadLine());

// switch (op) { ... } ile işlemi seç ve sonucu yazdır
`,
        stdin: '6\n*\n2',
        checks: [
          { type: 'output', mode: 'lines', expect: 'Sonuç: 12', msg: '6 * 2 → "Sonuç: 12"' },
          { type: 'output', mode: 'lines', stdin: '9\n-\n4', expect: 'Sonuç: 5', msg: '9 - 4 → "Sonuç: 5"' },
          { type: 'output', mode: 'lines', stdin: '7\n/\n2', expect: 'Sonuç: 3.5', msg: '7 / 2 → "Sonuç: 3.5" (double bölmesi)' },
          { type: 'output', mode: 'lines', stdin: '1.5\n+\n1.5', expect: 'Sonuç: 3', msg: '1.5 + 1.5 → "Sonuç: 3"' },
          { type: 'output', mode: 'lines', stdin: '7\n%\n2', expect: 'Bilinmeyen işlem: %', msg: 'Bilinmeyen işlemde "Bilinmeyen işlem: %" yazmalı' },
          { type: 'code', pattern: 'switch\\s*\\(\\s*op\\s*\\)', msg: 'switch (op) kullanmalısın' },
        ],
        hints: [
          'Her işlem için bir <code>case</code> yaz. <code>char</code> sabitleri tek tırnakla yazılır: <code>case \'+\':</code>',
          'Her <code>case</code> bloğu <code>break;</code> ile bitmeli. Örnek: <code>case \'+\': Console.WriteLine("Sonuç: " + (a + b)); break;</code>',
          'Bilinmeyen işlem için: <code>default: Console.WriteLine("Bilinmeyen işlem: " + op); break;</code> Dört <code>case</code> + bir <code>default</code> yeterli.',
        ],
        solution: cs`Console.WriteLine("Birinci sayı:");
double a = double.Parse(Console.ReadLine());
Console.WriteLine("İşlem (+ - * /):");
string islem = Console.ReadLine();
char op = islem[0];
Console.WriteLine("İkinci sayı:");
double b = double.Parse(Console.ReadLine());

switch (op)
{
    case '+': Console.WriteLine("Sonuç: " + (a + b)); break;
    case '-': Console.WriteLine("Sonuç: " + (a - b)); break;
    case '*': Console.WriteLine("Sonuç: " + (a * b)); break;
    case '/': Console.WriteLine("Sonuç: " + (a / b)); break;
    default: Console.WriteLine("Bilinmeyen işlem: " + op); break;
}`,
        explain: '<code>switch</code> değişkeni bir kez değerlendirir ve eşleşen <code>case</code>\'e atlar. <code>double</code> bölmesi olduğu için <code>7 / 2</code> = <code>3.5</code>; iki <code>int</code> bölseydik sonuç <code>3</code> olurdu.',
      },
    },
    {
      title: 'Adım 3 — Her işlem bir fonksiyon: Hesapla(a, op, b)',
      body: `
<p>Şu an hesaplama ve yazdırma iç içe. Gerçek yazılımda bunları ayırırız: bir <t en="function" ja="関数">fonksiyon</t> <b>sadece hesaplar ve sonucu döndürür</b>; yazdırma işi başka yerde yapılır. Neden?</p>
<ul>
<li><b>Yeniden kullanım:</b> Aynı <code>Hesapla</code> fonksiyonu konsolda, pencerede (Adım 10) ve testlerde çalışır.</li>
<li><b>Test edilebilirlik:</b> <code>Hesapla(7, '/', 2)</code> → <code>3.5</code> mi? Bunu ekrana bakmadan kontrol edebiliriz. Bu platformdaki "harness" kontrolleri de tam olarak bunu yapıyor.</li>
<li><b>Okunabilirlik:</b> <code>Topla(a, b)</code> ne yaptığını adıyla söyler.</li>
</ul>
<p>Bilinmeyen işlemde şimdilik <code>double.NaN</code> (<t en="Not a Number" ja="非数">Not a Number</t>, "sayı değil") döndüreceğiz. NaN, "bu hesap anlamsız" demenin sessiz bir yoludur. Sessiz hataların neden tehlikeli olduğunu 5. adımda göreceğiz.</p>`,
      code: cs`double Kare(double x)
{
    return x * x;
}

double Ortalama(double a, double b) => (a + b) / 2;

Console.WriteLine(Kare(1.5));
Console.WriteLine(Ortalama(Kare(2), 6));`,
      runnable: true,
      exercise: {
        title: 'İşlemleri fonksiyonlara taşı',
        prompt: `
<p>Dört küçük fonksiyon yaz: <code>Topla</code>, <code>Cikar</code>, <code>Carp</code>, <code>Bol</code> (her biri <code>double a, double b</code> alır ve <code>double</code> döndürür). Sonra <code>double Hesapla(double a, char op, double b)</code> fonksiyonunu tamamla: <code>switch</code> ile doğru fonksiyonu çağırsın, bilinmeyen işlemde <code>double.NaN</code> döndürsün.</p>
<p>Testler örneğin <code>Hesapla(7, '/', 2)</code> → <code>3.5</code> ve <code>Hesapla(1, '?', 1)</code> → NaN bekler.</p>`,
        starter: cs`double Topla(double a, double b) { return 0; }
double Cikar(double a, double b) { return 0; }
double Carp(double a, double b) { return 0; }
double Bol(double a, double b) { return 0; }

double Hesapla(double a, char op, double b)
{
    // switch (op) ile doğru fonksiyonu çağır ve sonucunu döndür
    return 0;
}

Console.WriteLine("Birinci sayı:");
double x = double.Parse(Console.ReadLine());
Console.WriteLine("İşlem (+ - * /):");
char islem = Console.ReadLine()[0];
Console.WriteLine("İkinci sayı:");
double y = double.Parse(Console.ReadLine());
Console.WriteLine("Sonuç: " + Hesapla(x, islem, y));`,
        stdin: '6\n+\n2',
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(Topla(1.5, 2));
Console.WriteLine(Cikar(1, 4));
Console.WriteLine(Carp(3, 4));
Console.WriteLine(Bol(9, 4));`, expect: '3.5\n-3\n12\n2.25', msg: 'Topla, Cikar, Carp ve Bol doğru sonuç döndürmeli' },
          { type: 'harness', append: cs`Console.WriteLine(Hesapla(6, '-', 8));
Console.WriteLine(Hesapla(3, '*', 4));
Console.WriteLine(Hesapla(7, '/', 2));
Console.WriteLine(Hesapla(0.5, '+', 0.25));`, expect: '-2\n12\n3.5\n0.75', msg: 'Hesapla(a, op, b) dört işlemi de doğru seçmeli' },
          { type: 'harness', append: cs`Console.WriteLine(double.IsNaN(Hesapla(1, '?', 1)));`, expect: 'True', msg: 'Bilinmeyen işlemde double.NaN döndürmeli' },
          { type: 'output', mode: 'lines', expect: 'Sonuç: 8', msg: 'Program 6 + 2 için "Sonuç: 8" yazmalı' },
          { type: 'code', pattern: 'Topla\\s*\\([\\s\\S]*Topla\\s*\\(', msg: 'Hesapla içinde Topla (ve diğer fonksiyonları) çağırmalısın' },
        ],
        hints: [
          'Önce dört küçük fonksiyonu düzelt: <code>Topla</code> sadece <code>return a + b;</code> demeli. Diğerleri de tek satır.',
          '<code>Hesapla</code> içinde her <code>case</code> doğrudan <code>return</code> edebilir; <code>return</code> fonksiyondan çıktığı için <code>break</code> gerekmez: <code>case \'+\': return Topla(a, b);</code>',
          '<code>switch</code>\'in sonuna <code>default: return double.NaN;</code> ekle. Starter\'daki en alttaki <code>return 0;</code> satırını sil (artık her yol bir değer döndürüyor).',
        ],
        solution: cs`double Topla(double a, double b) { return a + b; }
double Cikar(double a, double b) { return a - b; }
double Carp(double a, double b) { return a * b; }
double Bol(double a, double b) { return a / b; }

double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return Topla(a, b);
        case '-': return Cikar(a, b);
        case '*': return Carp(a, b);
        case '/': return Bol(a, b);
        default: return double.NaN;
    }
}

Console.WriteLine("Birinci sayı:");
double x = double.Parse(Console.ReadLine());
Console.WriteLine("İşlem (+ - * /):");
char islem = Console.ReadLine()[0];
Console.WriteLine("İkinci sayı:");
double y = double.Parse(Console.ReadLine());
Console.WriteLine("Sonuç: " + Hesapla(x, islem, y));`,
        explain: 'Artık hesaplama tek bir yerde: <code>Hesapla</code>. Program geri kalanı sadece girdi okuyup sonucu gösteriyor. Bu ayrım projenin ilerleyen adımlarında (ve WinForms sürümünde) işimizi çok kolaylaştıracak.',
      },
    },
    {
      title: 'Adım 4 — Geçersiz girdi: double.TryParse ve hata mesajları',
      body: `
<p>Kullanıcı sayı yerine <code>abc</code> yazarsa <code>double.Parse</code> bir <code>FormatException</code> fırlatır ve program çöker. Kullanıcı hatası <b>beklenen</b> bir durumdur; onu çökme ile değil, nazik bir mesajla karşılamalıyız.</p>
<p><code>double.TryParse(metin, out double sayi)</code> çevirmeyi <b>dener</b>: başarırsa <code>true</code> döndürür ve sonucu <code>sayi</code>'ya yazar; başaramazsa <code>false</code> döndürür, hiçbir şey fırlatmaz.</p>
<div class="callout warn"><b>Gerçek hayat tuzağı — kültür ayarı:</b> Türkçe Windows'ta ondalık ayırıcı virgüldür. Orada <code>double.Parse("2.5")</code> nokta işaretini binlik ayırıcı sayıp <b>25</b> döndürebilir! Visual Studio'da kendi bilgisayarında şu biçimi kullan: <code>double.TryParse(metin, NumberStyles.Float, CultureInfo.InvariantCulture, out double a)</code> (<code>using System.Globalization;</code> gerekir). Bu platformun yorumlayıcısı zaten her zaman nokta kullanır ve <code>CultureInfo</code>'yu desteklemez; bu yüzden burada kısa biçimi yazıyoruz. CAD dosyalarında sayıların her bilgisayarda aynı okunması hayati önemdedir.</div>
<p>Bir de <b>boş işlem</b> durumu var: kullanıcı işlem satırını boş bırakırsa <code>islem[0]</code> bir <code>IndexOutOfRangeException</code> fırlatır. Önce <code>islem.Length</code>'i kontrol et.</p>
<p>Üst düzey kodda <code>return;</code> programı o noktada bitirir: hatayı yazdıktan sonra devam etmeye gerek yok.</p>`,
      exercise: {
        title: 'Girdiyi doğrula',
        prompt: `
<p>Her girdiyi okuduktan <b>hemen sonra</b> doğrula. Hatalıysa mesajı yazdır ve programı <code>return;</code> ile bitir:</p>
<ul>
<li>Sayı değilse: <code>Hata: 'abc' bir sayı değil.</code> (tırnak içinde kullanıcının yazdığı metin)</li>
<li>İşlem tam 1 karakter değilse: <code>Hata: İşlem tek karakter olmalı.</code></li>
</ul>
<p>Örnek: girdi <code>abc</code> → </p>
<pre class="expected">Birinci sayı:
Hata: 'abc' bir sayı değil.</pre>
<p>Örnek: girdi <code>5</code>, <code>+</code>, <code>x</code> →</p>
<pre class="expected">Birinci sayı:
İşlem (+ - * /):
İkinci sayı:
Hata: 'x' bir sayı değil.</pre>`,
        starter: cs`double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return double.NaN;
    }
}

Console.WriteLine("Birinci sayı:");
string m1 = Console.ReadLine();
double a = double.Parse(m1);      // TryParse ile değiştir

Console.WriteLine("İşlem (+ - * /):");
string islem = Console.ReadLine();
char op = islem[0];                // önce uzunluğu kontrol et

Console.WriteLine("İkinci sayı:");
string m2 = Console.ReadLine();
double b = double.Parse(m2);       // TryParse ile değiştir

Console.WriteLine("Sonuç: " + Hesapla(a, op, b));`,
        stdin: 'abc\n+\n2',
        checks: [
          { type: 'output', expect: "Birinci sayı:\nHata: 'abc' bir sayı değil.", msg: "İlk sayı geçersizse \"Hata: 'abc' bir sayı değil.\" yazıp durmalı" },
          { type: 'output', stdin: '5\n+\nx', expect: "Birinci sayı:\nİşlem (+ - * /):\nİkinci sayı:\nHata: 'x' bir sayı değil.", msg: 'İkinci sayı geçersizse de aynı biçimde hata vermeli' },
          { type: 'output', stdin: '5\n++\n2', expect: 'Birinci sayı:\nİşlem (+ - * /):\nHata: İşlem tek karakter olmalı.', msg: 'İşlem 1 karakter değilse hata vermeli' },
          { type: 'output', stdin: '5\n\n2', expect: 'Birinci sayı:\nİşlem (+ - * /):\nHata: İşlem tek karakter olmalı.', msg: 'Boş işlem satırında çökmemeli' },
          { type: 'output', stdin: '5\n*\n2', expect: 'Birinci sayı:\nİşlem (+ - * /):\nİkinci sayı:\nSonuç: 10', msg: 'Geçerli girdide sonuç yine doğru olmalı' },
          { type: 'code', pattern: 'double\\.TryParse', msg: 'double.TryParse kullanmalısın' },
        ],
        hints: [
          '<code>double.TryParse</code> bir <code>bool</code> döndürür. "Çeviremediysen" demek için başına <code>!</code> koy: <code>if (!double.TryParse(m1, out double a)) { ... }</code>',
          'Hata bloğunun içinde: <code>Console.WriteLine("Hata: \'" + m1 + "\' bir sayı değil."); return;</code> — <code>return;</code> programı bitirir. Eski <code>double a = double.Parse(m1);</code> satırını sil.',
          'İşlem için: <code>if (islem.Length != 1) { Console.WriteLine("Hata: İşlem tek karakter olmalı."); return; }</code> kontrolünü <code>char op = islem[0];</code> satırından <b>önce</b> yaz. İkinci sayı için birinci sayıdaki kalıbı tekrarla.',
        ],
        solution: cs`double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return double.NaN;
    }
}

Console.WriteLine("Birinci sayı:");
string m1 = Console.ReadLine();
if (!double.TryParse(m1, out double a))
{
    Console.WriteLine("Hata: '" + m1 + "' bir sayı değil.");
    return;
}

Console.WriteLine("İşlem (+ - * /):");
string islem = Console.ReadLine();
if (islem.Length != 1)
{
    Console.WriteLine("Hata: İşlem tek karakter olmalı.");
    return;
}
char op = islem[0];

Console.WriteLine("İkinci sayı:");
string m2 = Console.ReadLine();
if (!double.TryParse(m2, out double b))
{
    Console.WriteLine("Hata: '" + m2 + "' bir sayı değil.");
    return;
}

Console.WriteLine("Sonuç: " + Hesapla(a, op, b));`,
        explain: '<code>TryParse</code> "dene, olmazsa haber ver" yaklaşımıdır: istisna fırlatmaz, <code>bool</code> döndürür. Beklenen kullanıcı hatalarında (yanlış yazılmış sayı) bu yaklaşım, <code>try/catch</code>\'ten hem daha hızlı hem daha okunaklıdır.',
      },
    },
    {
      title: 'Adım 5 — Sıfıra bölme ve istisnalar (exception)',
      body: `
<p>Şu kodu dene: <code>Console.WriteLine(5.0 / 0);</code> Sonuç bir hata değil, <b>∞</b> (sonsuz)! C#'ta <code>double</code> bölmesi IEEE 754 standardına uyar: sıfıra bölünce istisna fırlatmaz, <code>Infinity</code> ya da <code>NaN</code> üretir. Sadece <b>tam sayı</b> bölmesi (<code>5 / 0</code>, <code>int</code>) <code>DivideByZeroException</code> fırlatır.</p>
<p>Sessiz <code>Infinity</code> / <code>NaN</code> tehlikelidir: bir CAD programında bir duvarın uzunluğu NaN olursa, bu değer sonraki tüm hesaplara bulaşır (NaN + 1 = NaN) ve hata çok uzakta, çok geç ortaya çıkar. Bu yüzden hatayı <b>oluştuğu yerde</b> yüksek sesle bildirmek isteriz:</p>
<ul>
<li><code>throw new DivideByZeroException("Sıfıra bölme yapılamaz.");</code> — fonksiyondan bir <t en="exception" ja="例外">istisna</t> fırlatır.</li>
<li>Çağıran kod <code>try { ... } catch (DivideByZeroException ex) { ... }</code> ile yakalar; mesaj <code>ex.Message</code> içindedir.</li>
</ul>
<p>Bilinmeyen işlem için de artık NaN değil, <code>ArgumentException</code> fırlatacağız ("bu argüman geçersiz").</p>`,
      code: cs`Console.WriteLine(5.0 / 0);
Console.WriteLine(0.0 / 0);
Console.WriteLine(double.NaN + 1);
try
{
    int sifir = 0;
    Console.WriteLine(5 / sifir);
}
catch (DivideByZeroException ex)
{
    Console.WriteLine("Yakalandı: " + ex.Message);
}`,
      runnable: true,
      exercise: {
        title: 'Hataları fırlat ve yakala',
        prompt: `
<p>1) <code>Hesapla</code>'yı değiştir: bölmede <code>b == 0</code> ise <code>DivideByZeroException("Sıfıra bölme yapılamaz.")</code> fırlatsın; bilinmeyen işlemde <code>ArgumentException("Bilinmeyen işlem: " + op)</code> fırlatsın.</p>
<p>2) Programın son satırını <code>try / catch</code> içine al ve hatada <code>Hata: </code> + mesajı yazdır. Örnek: girdi <code>5</code>, <code>/</code>, <code>0</code> →</p>
<pre class="expected">Birinci sayı:
İşlem (+ - * /):
İkinci sayı:
Hata: Sıfıra bölme yapılamaz.</pre>`,
        starter: cs`double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default: return double.NaN;
    }
}

Console.WriteLine("Birinci sayı:");
string m1 = Console.ReadLine();
if (!double.TryParse(m1, out double a)) { Console.WriteLine("Hata: '" + m1 + "' bir sayı değil."); return; }
Console.WriteLine("İşlem (+ - * /):");
string islem = Console.ReadLine();
if (islem.Length != 1) { Console.WriteLine("Hata: İşlem tek karakter olmalı."); return; }
char op = islem[0];
Console.WriteLine("İkinci sayı:");
string m2 = Console.ReadLine();
if (!double.TryParse(m2, out double b)) { Console.WriteLine("Hata: '" + m2 + "' bir sayı değil."); return; }

Console.WriteLine("Sonuç: " + Hesapla(a, op, b));`,
        stdin: '5\n/\n0',
        checks: [
          { type: 'harness', append: cs`try { Hesapla(5, '/', 0); Console.WriteLine("istisna yok"); }
catch (DivideByZeroException e) { Console.WriteLine(e.Message); }`, expect: 'Sıfıra bölme yapılamaz.', msg: 'Hesapla(5, \'/\', 0) DivideByZeroException fırlatmalı' },
          { type: 'harness', append: cs`try { Hesapla(5, '%', 1); Console.WriteLine("istisna yok"); }
catch (ArgumentException e) { Console.WriteLine(e.Message); }`, expect: 'Bilinmeyen işlem: %', msg: 'Bilinmeyen işlemde ArgumentException fırlatmalı' },
          { type: 'harness', append: cs`Console.WriteLine(Hesapla(8, '/', 4));
Console.WriteLine(Hesapla(0, '/', 5));`, expect: '2\n0', msg: 'Normal bölme (ve 0 / 5) hâlâ çalışmalı' },
          { type: 'output', mode: 'lines', expect: 'Hata: Sıfıra bölme yapılamaz.', msg: 'Program sıfıra bölmede "Hata: Sıfıra bölme yapılamaz." yazmalı' },
          { type: 'output', mode: 'lines', stdin: '5\n^\n2', expect: 'Hata: Bilinmeyen işlem: ^', msg: 'Program bilinmeyen işlemde "Hata: Bilinmeyen işlem: ^" yazmalı' },
          { type: 'output', mode: 'lines', stdin: '9\n/\n3', expect: 'Sonuç: 3', msg: 'Geçerli bölmede sonuç yazmalı' },
          { type: 'code', pattern: 'catch', msg: 'try / catch kullanmalısın' },
        ],
        hints: [
          'Önce fonksiyonu düzelt. <code>case \'/\':</code> dalında, bölmeden önce <code>b</code>\'nin sıfır olup olmadığını kontrol et.',
          '<code>case \'/\': if (b == 0) throw new DivideByZeroException("Sıfıra bölme yapılamaz."); return a / b;</code> ve <code>default: throw new ArgumentException("Bilinmeyen işlem: " + op);</code>',
          'Son satırı şöyle sar: <code>try { Console.WriteLine("Sonuç: " + Hesapla(a, op, b)); } catch (DivideByZeroException ex) { Console.WriteLine("Hata: " + ex.Message); }</code> — <code>ArgumentException</code> için de ikinci bir <code>catch</code> ekle.',
        ],
        solution: cs`double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b == 0) throw new DivideByZeroException("Sıfıra bölme yapılamaz.");
            return a / b;
        default:
            throw new ArgumentException("Bilinmeyen işlem: " + op);
    }
}

Console.WriteLine("Birinci sayı:");
string m1 = Console.ReadLine();
if (!double.TryParse(m1, out double a)) { Console.WriteLine("Hata: '" + m1 + "' bir sayı değil."); return; }
Console.WriteLine("İşlem (+ - * /):");
string islem = Console.ReadLine();
if (islem.Length != 1) { Console.WriteLine("Hata: İşlem tek karakter olmalı."); return; }
char op = islem[0];
Console.WriteLine("İkinci sayı:");
string m2 = Console.ReadLine();
if (!double.TryParse(m2, out double b)) { Console.WriteLine("Hata: '" + m2 + "' bir sayı değil."); return; }

try
{
    Console.WriteLine("Sonuç: " + Hesapla(a, op, b));
}
catch (DivideByZeroException ex)
{
    Console.WriteLine("Hata: " + ex.Message);
}
catch (ArgumentException ex)
{
    Console.WriteLine("Hata: " + ex.Message);
}`,
        explain: 'Hesaplama fonksiyonu hatayı <b>bulur ve fırlatır</b>; ekrana ne yazılacağına <b>çağıran</b> karar verir. Bu iş bölümü sayesinde aynı <code>Hesapla</code>, WinForms sürümünde hatayı bir <code>MessageBox</code> ile gösterebilecek.',
      },
    },
    {
      title: 'Adım 6 — Tek satırda ifade: "6 * 7"',
      body: `
<p>Üç ayrı satır sormak yorucu. Gerçek bir hesap makinesinde kullanıcı tek satıra <code>6 * 7</code> yazar. Bunu parçalara ayırmak için <code>string.Split</code> kullanırız:</p>
<p><code>"6 * 7".Split(' ', StringSplitOptions.RemoveEmptyEntries)</code> → <code>["6", "*", "7"]</code>. <code>RemoveEmptyEntries</code>, kullanıcı fazladan boşluk yazarsa (<code>"6  *   7"</code>) oluşacak boş parçaları atar.</p>
<p>Bu adımda tüm "bir satırı işle" mantığını tek bir fonksiyona koyacağız: <code>string IfadeyiIsle(string satir)</code>. Fonksiyon ekrana <b>yazmaz</b>; ekranda görünecek metni <b>döndürür</b>. Böylece onu bir döngüden, bir butondan ya da bir testten çağırabiliriz.</p>
<div class="callout tip">CAD bağlantısı: AutoCAD benzeri programlardaki komut satırı da böyle çalışır. Kullanıcı <code>LINE</code> yazar, sonra koordinatlar girer; program metni parçalara ayırır (<t en="parsing" ja="構文解析">ayrıştırma</t>), doğrular ve ilgili komutu çalıştırır. Proje 5'te kendi komut sistemini kuracaksın.</div>`,
      code: cs`string[] parca = "  6   *  7 ".Split(' ', StringSplitOptions.RemoveEmptyEntries);
Console.WriteLine("Parça sayısı: " + parca.Length);
for (int i = 0; i < parca.Length; i++)
    Console.WriteLine(i + ": [" + parca[i] + "]");`,
      runnable: true,
      exercise: {
        title: 'IfadeyiIsle fonksiyonu',
        prompt: `
<p><code>string IfadeyiIsle(string satir)</code> fonksiyonunu yaz. Kurallar, <b>bu sırayla</b>:</p>
<ol>
<li>Satırı boşluklardan böl. Parça sayısı 3 değilse: <code>Hata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).</code></li>
<li>İlk parça sayı değilse: <code>Hata: 'abc' bir sayı değil.</code></li>
<li>Orta parça tek karakter değilse: <code>Hata: İşlem tek karakter olmalı.</code></li>
<li>Üçüncü parça sayı değilse: aynı "bir sayı değil" mesajı.</li>
<li>Hesapla; başarılıysa <code>6 * 7 = 42</code> biçiminde metin döndür; istisnada <code>Hata: </code> + mesaj döndür.</li>
</ol>
<pre class="expected">IfadeyiIsle("6 * 7")   → 6 * 7 = 42
IfadeyiIsle("5 / 0")   → Hata: Sıfıra bölme yapılamaz.
IfadeyiIsle("6*7")     → Hata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).</pre>`,
        starter: HESAPLA_V5 + cs`

string IfadeyiIsle(string satir)
{
    // 1) Split ile parçala ve parça sayısını kontrol et
    // 2) Sayıları TryParse ile oku, işlemi kontrol et
    // 3) Hesapla'yı try/catch içinde çağır
    return "";
}

Console.WriteLine(IfadeyiIsle(Console.ReadLine()));`,
        stdin: '6 * 7',
        checks: [
          { type: 'output', expect: '6 * 7 = 42', msg: 'Girdi "6 * 7" için "6 * 7 = 42" yazmalı' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("2.5 + 4"));
Console.WriteLine(IfadeyiIsle("  10   /  4 "));
Console.WriteLine(IfadeyiIsle("3 - 8"));`, expect: '2.5 + 4 = 6.5\n10 / 4 = 2.5\n3 - 8 = -5', msg: 'Geçerli ifadeleri hesaplamalı (fazla boşluklar dahil)' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("5 / 0"));
Console.WriteLine(IfadeyiIsle("5 % 2"));`, expect: 'Hata: Sıfıra bölme yapılamaz.\nHata: Bilinmeyen işlem: %', msg: 'Hesapla\'nın istisnalarını yakalayıp "Hata: ..." döndürmeli' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("6*7"));
Console.WriteLine(IfadeyiIsle("1 + 2 + 3"));
Console.WriteLine(IfadeyiIsle(""));`, expect: "Hata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).\nHata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).\nHata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).", msg: 'Parça sayısı 3 değilse biçim hatası döndürmeli' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("abc + 1"));
Console.WriteLine(IfadeyiIsle("1 ++ 2"));
Console.WriteLine(IfadeyiIsle("1 + x"));`, expect: "Hata: 'abc' bir sayı değil.\nHata: İşlem tek karakter olmalı.\nHata: 'x' bir sayı değil.", msg: 'Sayı ve işlem doğrulaması mesajları doğru olmalı' },
          { type: 'code', pattern: '\\.Split\\s*\\(', msg: 'Split kullanmalısın' },
        ],
        hints: [
          'İlk satır: <code>string[] parca = satir.Split(\' \', StringSplitOptions.RemoveEmptyEntries);</code> Sonra <code>parca.Length != 3</code> ise biçim hatasını <code>return</code> et.',
          'Sayılar: <code>if (!double.TryParse(parca[0], out double a)) return "Hata: \'" + parca[0] + "\' bir sayı değil.";</code> İşlem karakteri <code>parca[1][0]</code>, ama önce <code>parca[1].Length</code>\'i kontrol et.',
          'Sonda: <code>try { double sonuc = Hesapla(a, op, b); return $"{a} {op} {b} = {sonuc}"; } catch (DivideByZeroException ex) { return "Hata: " + ex.Message; }</code> — <code>ArgumentException</code> için ikinci <code>catch</code>\'i de ekle.',
        ],
        solution: HESAPLA_V5 + `

` + IFADE_V6 + cs`

Console.WriteLine(IfadeyiIsle(Console.ReadLine()));`,
        explain: 'Fonksiyon "erken dönüş" (<t en="early return" ja="早期リターン">early return</t>) kalıbını kullanıyor: her hata kontrolü başarısız olursa hemen döner. Böylece iç içe <code>if</code> yığını oluşmaz ve "mutlu yol" en altta, okunaklı kalır.',
      },
    },
    {
      title: 'Adım 7 — Komut döngüsü: q yazana kadar',
      body: `
<p>Hesap makinesi tek işlemden sonra kapanmamalı. Kullanıcı <code>q</code> yazana kadar satır okuyup işleyen bir <b>komut döngüsü</b> (<t en="REPL: read–eval–print loop" ja="REPL">REPL</t>) kuracağız:</p>
<ol>
<li><b>Oku</b>: <code>Console.ReadLine()</code></li>
<li><b>Değerlendir</b>: <code>IfadeyiIsle(satir)</code></li>
<li><b>Yazdır</b>: sonucu ekrana bas</li>
<li><b>Tekrarla</b>: <code>while (true)</code> + çıkış koşulunda <code>break</code></li>
</ol>
<p>İki ince nokta: (1) Girdi biterse <code>ReadLine()</code> <code>null</code> döndürür; bunu da çıkış sayalım, yoksa sonsuz döngüye gireriz. (2) Kullanıcı yanlışlıkla <code>Q</code> ya da <code>" q "</code> yazabilir: <code>Trim()</code> ve <code>ToLower()</code> ile normalleştir. Boş satırlar da sessizce atlanmalı (<code>continue</code>).</p>
<div class="callout tip">Masaüstü uygulamalar da aslında böyle bir döngü üzerinde çalışır: Windows, "mesaj döngüsü" (<t en="message loop" ja="メッセージループ">message loop</t>) içinde fare tıklamalarını ve tuşları sırayla programa iletir. Konsolda bu döngüyü kendimiz yazıyoruz.</div>`,
      exercise: {
        title: 'Menü döngüsü',
        prompt: `
<p>Önce <code>Hesap makinesi (çıkmak için q)</code> yazdır. Sonra döngüde satır oku: <code>null</code> ise ya da (boşluklar atılıp küçük harfe çevrildiğinde) <code>q</code> ise döngüden çık; boş satırı atla; diğer satırları <code>IfadeyiIsle</code> ile işleyip sonucu yazdır. Döngüden sonra <code>Güle güle!</code> yaz.</p>
<p>Girdi: <code>6 + 2</code>, <code>10 / 4</code>, <code>q</code> →</p>
<pre class="expected">Hesap makinesi (çıkmak için q)
6 + 2 = 8
10 / 4 = 2.5
Güle güle!</pre>`,
        starter: HESAPLA_V5 + `

` + IFADE_V6 + cs`

// Komut döngüsünü buraya yaz
`,
        stdin: '6 + 2\n10 / 4\nq',
        checks: [
          { type: 'output', expect: 'Hesap makinesi (çıkmak için q)\n6 + 2 = 8\n10 / 4 = 2.5\nGüle güle!', msg: 'Örnek girdide çıktı birebir aynı olmalı' },
          { type: 'output', stdin: '\n2 ^ 3\n5 / 0\n  Q  \n1 + 1', expect: 'Hesap makinesi (çıkmak için q)\nHata: Bilinmeyen işlem: ^\nHata: Sıfıra bölme yapılamaz.\nGüle güle!', msg: 'Boş satırı atlamalı, hataları yazıp devam etmeli, " Q " ile çıkmalı (sonraki satırları işlememeli)' },
          { type: 'output', stdin: '7 * 3', expect: 'Hesap makinesi (çıkmak için q)\n7 * 3 = 21\nGüle güle!', msg: 'Girdi bitince (ReadLine null döndürünce) döngüden çıkmalı' },
          { type: 'code', pattern: 'while\\s*\\(', msg: 'while döngüsü kullanmalısın' },
        ],
        hints: [
          'İskelet: <code>while (true) { string? satir = Console.ReadLine(); ... }</code> ve döngüden sonra veda mesajı.',
          'Döngünün içindeki sıra: <code>null</code> kontrolü → <code>satir = satir.Trim();</code> → boşsa <code>continue;</code> → <code>satir.ToLower() == "q"</code> ise <code>break;</code>',
          'Son satır: <code>Console.WriteLine(IfadeyiIsle(satir));</code> Başlık satırını döngüden <b>önce</b>, <code>"Güle güle!"</code> satırını döngüden <b>sonra</b> yazdırmayı unutma.',
        ],
        solution: HESAPLA_V5 + `

` + IFADE_V6 + `

` + MENU_V7,
        explain: '<code>while (true)</code> + <code>break</code>, "kaç kez döneceğini bilmediğimiz" döngüler için standart kalıptır. Çıkış koşullarının hepsini (q, girdi sonu) döngünün başında toplamak, döngüyü okunaklı tutar.',
      },
    },
    {
      title: 'Adım 8 — Hesap geçmişi: string listesi',
      body: `
<p>Kaç işlem yapılacağı önceden bilinmediği için geçmişi bir diziye değil, büyüyebilen bir <code>List&lt;string&gt;</code>'e koyacağız. İki yeni komut ekliyoruz:</p>
<ul>
<li><code>g</code> → geçmişi numaralı listele (boşsa <code>(geçmiş boş)</code>)</li>
<li><code>s</code> → geçmişi sil: <code>gecmis.Clear()</code></li>
</ul>
<p>Sadece <b>başarılı</b> hesaplar geçmişe girmeli. <code>IfadeyiIsle</code> hata mesajlarını hep <code>"Hata:"</code> ile başlattığı için <code>sonuc.StartsWith("Hata")</code> ile ayırt edebiliriz. (İleride bunu daha sağlam bir yöntemle, örneğin bir sonuç nesnesiyle yapacaksın; şimdilik basit tutuyoruz.)</p>
<div class="callout tip">CAD bağlantısı: Bu geçmiş listesi, Proje 5'te yazacağın <b>Geri Al / Yinele</b> (<t en="Undo / Redo" ja="元に戻す・やり直し">Undo/Redo</t>) yığınlarının küçük kardeşidir. Orada sadece metin değil, "geri alınabilir komut" nesneleri saklayacaksın.</div>`,
      exercise: {
        title: 'Geçmişi tut ve göster',
        prompt: `
<p>Döngüye geçmiş özelliğini ekle. Komutlar <code>q</code> kontrolünden sonra, <code>IfadeyiIsle</code>'den önce kontrol edilsin:</p>
<ul>
<li><code>g</code>: geçmiş boşsa <code>(geçmiş boş)</code>; değilse önce <code>--- Geçmiş ---</code>, sonra <code>1. 6 + 2 = 8</code> biçiminde satırlar.</li>
<li><code>s</code>: geçmişi temizle ve <code>Geçmiş temizlendi.</code> yaz.</li>
<li>Diğer satırlar: sonucu yazdır; <code>Hata</code> ile başlamıyorsa geçmişe ekle.</li>
</ul>
<p>Girdi: <code>6 + 2</code>, <code>5 / 0</code>, <code>3 * 3</code>, <code>g</code>, <code>q</code> →</p>
<pre class="expected">Hesap makinesi (çıkmak için q)
6 + 2 = 8
Hata: Sıfıra bölme yapılamaz.
3 * 3 = 9
--- Geçmiş ---
1. 6 + 2 = 8
2. 3 * 3 = 9
Güle güle!</pre>`,
        starter: HESAPLA_V5 + `

` + IFADE_V6 + `

` + MENU_V7,
        stdin: '6 + 2\n5 / 0\n3 * 3\ng\nq',
        checks: [
          { type: 'output', expect: 'Hesap makinesi (çıkmak için q)\n6 + 2 = 8\nHata: Sıfıra bölme yapılamaz.\n3 * 3 = 9\n--- Geçmiş ---\n1. 6 + 2 = 8\n2. 3 * 3 = 9\nGüle güle!', msg: 'Örnek girdide çıktı birebir aynı olmalı (hatalı işlem geçmişe girmemeli)' },
          { type: 'output', stdin: 'g\n1 - 4\ns\ng\n2 * 5\ng\nq', expect: 'Hesap makinesi (çıkmak için q)\n(geçmiş boş)\n1 - 4 = -3\nGeçmiş temizlendi.\n(geçmiş boş)\n2 * 5 = 10\n--- Geçmiş ---\n1. 2 * 5 = 10\nGüle güle!', msg: 'Boş geçmiş, temizleme (s) ve yeniden ekleme doğru çalışmalı' },
          { type: 'code', pattern: 'List\\s*<\\s*string\\s*>', msg: 'Geçmişi bir string listesinde (List) tutmalısın' },
        ],
        hints: [
          'Döngüden önce bir liste oluştur: <code>var gecmis = new List&lt;string&gt;();</code>',
          '<code>g</code> komutu için: <code>if (satir.ToLower() == "g") { ... continue; }</code> — içeride <code>gecmis.Count == 0</code> kontrolü ve bir <code>for</code> döngüsü: <code>Console.WriteLine((i + 1) + ". " + gecmis[i]);</code>',
          'Hesap satırında: <code>string sonuc = IfadeyiIsle(satir); Console.WriteLine(sonuc); if (!sonuc.StartsWith("Hata")) gecmis.Add(sonuc);</code> — <code>s</code> komutu da <code>g</code> gibi kendi <code>if</code> bloğunda <code>continue</code> ile bitsin.',
        ],
        solution: HESAPLA_V5 + `

` + IFADE_V6 + cs`

var gecmis = new List<string>();
Console.WriteLine("Hesap makinesi (çıkmak için q)");
while (true)
{
    string? satir = Console.ReadLine();
    if (satir == null) break;
    satir = satir.Trim();
    if (satir == "") continue;
    string komut = satir.ToLower();
    if (komut == "q") break;

    if (komut == "g")
    {
        if (gecmis.Count == 0)
        {
            Console.WriteLine("(geçmiş boş)");
        }
        else
        {
            Console.WriteLine("--- Geçmiş ---");
            for (int i = 0; i < gecmis.Count; i++)
                Console.WriteLine((i + 1) + ". " + gecmis[i]);
        }
        continue;
    }
    if (komut == "s")
    {
        gecmis.Clear();
        Console.WriteLine("Geçmiş temizlendi.");
        continue;
    }

    string sonuc = IfadeyiIsle(satir);
    Console.WriteLine(sonuc);
    if (!sonuc.StartsWith("Hata")) gecmis.Add(sonuc);
}
Console.WriteLine("Güle güle!");`,
        explain: '<code>List&lt;string&gt;</code> ihtiyaç duydukça büyür; <code>Add</code>, <code>Count</code>, <code>Clear</code> ve indeksleme (<code>gecmis[i]</code>) bu projede ihtiyacın olan her şey. Ekranda 1\'den, listede 0\'dan saydığımız için <code>i + 1</code> yazdırıyoruz.',
      },
    },
    {
      title: 'Adım 9 (bonus) — Üs, yüzde ve karekök',
      body: `
<p>Son hesap adımı: makineyi biraz "bilimsel" yapalım.</p>
<ul>
<li><code>2 ^ 10</code> → <code>Math.Pow(2, 10)</code> = 1024. <b>Dikkat:</b> C#'ta <code>^</code> operatörü üs alma <b>değildir</b> (bit düzeyinde XOR'dur). Kullanıcı arayüzünde <code>^</code> sembolünü kullanıyoruz ama hesabı <code>Math.Pow</code> yapıyor.</li>
<li><code>200 % 15</code> → yüzde: 200'ün %15'i = <code>200 * 15 / 100</code> = 30. <b>Dikkat:</b> C#'taki <code>%</code> operatörü ise "bölümden kalan"dır (<code>7 % 3</code> = 1). Kullanıcı sembolü ile programlama operatörü aynı şey değildir!</li>
<li><code>kok 16</code> → <code>Math.Sqrt(16)</code> = 4. Bu tek sayılı (iki parçalı) bir komut; negatif sayıda <code>Hata: Negatif sayının karekökü alınamaz.</code></li>
</ul>
<p>Bir de çirkin çıktıları düzeltelim: <code>10 / 3</code> şu an <code>3.3333333333333335</code> yazıyor. Bu, <t en="floating-point" ja="浮動小数点">kayan nokta</t> sayılarının ikilik sistemde tam temsil edilememesinden gelir. Sonucu <code>Math.Round(x, 6)</code> ile en fazla 6 ondalığa yuvarlayacağız. CAD yazılımları da ekranda gösterirken yuvarlar, ama içeride tam değeri saklar.</p>`,
      code: cs`Console.WriteLine(Math.Pow(2, 10));
Console.WriteLine(2 ^ 10);      // XOR! üs değil
Console.WriteLine(7 % 3);       // kalan
Console.WriteLine(200 * 15 / 100.0);
Console.WriteLine(10.0 / 3);
Console.WriteLine(Math.Round(10.0 / 3, 6));
Console.WriteLine(Math.Sqrt(-4));`,
      runnable: true,
      exercise: {
        title: 'Bilimsel eklentiler',
        prompt: `
<p>1) <code>Hesapla</code>'ya iki işlem ekle: <code>'^'</code> → <code>Math.Pow(a, b)</code>, <code>'%'</code> → <code>a * b / 100</code>.</p>
<p>2) <code>IfadeyiIsle</code>: sonuç metninde sayıyı <code>Math.Round(sonuc, 6)</code> ile yuvarla (<code>10 / 3 = 3.333333</code>).</p>
<p>3) <code>IfadeyiIsle</code>'nin başına <code>kok</code> komutunu ekle: parçalar 2 tane ve ilki <code>kok</code> ise karekök al → <code>√16 = 4</code>. Sayı değilse "bir sayı değil" hatası, negatifse <code>Hata: Negatif sayının karekökü alınamaz.</code></p>
<pre class="expected">2 ^ 10   → 2 ^ 10 = 1024
200 % 15 → 200 % 15 = 30
kok 2    → √2 = 1.414214
kok -4   → Hata: Negatif sayının karekökü alınamaz.</pre>`,
        starter: HESAPLA_V5 + `

` + IFADE_V6 + `

` + MENU_V7,
        stdin: '2 ^ 10\nkok 16\nq',
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(Hesapla(2, '^', 10));
Console.WriteLine(Hesapla(200, '%', 15));
Console.WriteLine(Hesapla(9, '^', 0.5));`, expect: '1024\n30\n3', msg: 'Hesapla \'^\' için üs, \'%\' için yüzde hesaplamalı' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("10 / 3"));
Console.WriteLine(IfadeyiIsle("2 ^ 0.5"));
Console.WriteLine(IfadeyiIsle("1 + 2"));`, expect: '10 / 3 = 3.333333\n2 ^ 0.5 = 1.414214\n1 + 2 = 3', msg: 'Sonuçlar en fazla 6 ondalığa yuvarlanmalı' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("kok 16"));
Console.WriteLine(IfadeyiIsle("kok 2"));
Console.WriteLine(IfadeyiIsle("kok -4"));
Console.WriteLine(IfadeyiIsle("kok x"));`, expect: "√16 = 4\n√2 = 1.414214\nHata: Negatif sayının karekökü alınamaz.\nHata: 'x' bir sayı değil.", msg: 'kok komutu karekök almalı ve hataları yakalamalı' },
          { type: 'harness', append: cs`Console.WriteLine(IfadeyiIsle("5 / 0"));
Console.WriteLine(IfadeyiIsle("5 & 1"));
Console.WriteLine(IfadeyiIsle("6*7"));`, expect: "Hata: Sıfıra bölme yapılamaz.\nHata: Bilinmeyen işlem: &\nHata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).", msg: 'Eski hata kontrolleri hâlâ çalışmalı' },
          { type: 'output', expect: 'Hesap makinesi (çıkmak için q)\n2 ^ 10 = 1024\n√16 = 4\nGüle güle!', msg: 'Döngü yeni komutlarla da çalışmalı' },
          { type: 'code', pattern: 'Math\\.Pow', msg: 'Üs için Math.Pow kullanmalısın' },
        ],
        hints: [
          '<code>Hesapla</code>\'daki <code>switch</code>\'e iki <code>case</code> ekle: <code>case \'^\': return Math.Pow(a, b);</code> ve yüzde için benzeri.',
          'Yuvarlama: dönüş satırını <code>return $"{a} {op} {b} = {Math.Round(sonuc, 6)}";</code> yap. <code>kok</code> için <code>Split</code> satırından hemen sonra: <code>if (parca.Length == 2 &amp;&amp; parca[0].ToLower() == "kok") { ... }</code>',
          '<code>kok</code> bloğunun içi: <code>TryParse</code> başarısızsa "bir sayı değil" mesajı; <code>x &lt; 0</code> ise negatif hatası; yoksa <code>return "√" + parca[1] + " = " + Math.Round(Math.Sqrt(x), 6);</code>',
        ],
        solution: cs`double Hesapla(double a, char op, double b)
{
    switch (op)
    {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b == 0) throw new DivideByZeroException("Sıfıra bölme yapılamaz.");
            return a / b;
        case '^': return Math.Pow(a, b);
        case '%': return a * b / 100;
        default:
            throw new ArgumentException("Bilinmeyen işlem: " + op);
    }
}

string IfadeyiIsle(string satir)
{
    string[] parca = satir.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (parca.Length == 2 && parca[0].ToLower() == "kok")
    {
        if (!double.TryParse(parca[1], out double x)) return "Hata: '" + parca[1] + "' bir sayı değil.";
        if (x < 0) return "Hata: Negatif sayının karekökü alınamaz.";
        return "√" + parca[1] + " = " + Math.Round(Math.Sqrt(x), 6);
    }
    if (parca.Length != 3) return "Hata: Biçim 'sayı işlem sayı' olmalı (ör. 6 * 7).";
    if (!double.TryParse(parca[0], out double a)) return "Hata: '" + parca[0] + "' bir sayı değil.";
    if (parca[1].Length != 1) return "Hata: İşlem tek karakter olmalı.";
    if (!double.TryParse(parca[2], out double b)) return "Hata: '" + parca[2] + "' bir sayı değil.";
    char op = parca[1][0];
    try
    {
        double sonuc = Hesapla(a, op, b);
        return $"{a} {op} {b} = {Math.Round(sonuc, 6)}";
    }
    catch (DivideByZeroException ex) { return "Hata: " + ex.Message; }
    catch (ArgumentException ex) { return "Hata: " + ex.Message; }
}

` + MENU_V7,
        explain: 'Yeni özellikler eklerken dokunduğumuz yerler belli: hesap kuralı <code>Hesapla</code>\'ya, metin biçimi <code>IfadeyiIsle</code>\'ye gitti; döngü hiç değişmedi. Sorumlulukları ayırmanın ödülü budur: değişiklik küçük ve yerel kalır.',
      },
    },
    {
      title: 'Adım 10 — Aynı mantık, gerçek pencere: WinForms hesap makinesi',
      body: `
<p>Şimdi Visual Studio'ya geçip hesap makinesine bir <t en="GUI: graphical user interface" ja="GUI（グラフィカルユーザーインターフェース）">grafik arayüz</t> vereceğiz. Bu adımı bilgisayarında yaparsın (bu platformda WinForms çalışmaz).</p>
<ol>
<li><b>Visual Studio Community</b> → <i>Create a new project</i> → <b>Windows Forms App</b> (C#, .NET 8) → ad: <code>HesapMakinesi</code>.</li>
<li><i>Project → Add Class</i> → <code>HesapMotoru.cs</code>. Konsolda yazdığın <code>Hesapla</code> fonksiyonunu buraya <code>public static</code> olarak taşı.</li>
<li><b>Toolbox</b>'tan Form1'e sürükle: 2 <code>TextBox</code> (<code>txtA</code>, <code>txtB</code>), 4 <code>Button</code> (<code>btnTopla</code>, <code>btnCikar</code>, <code>btnCarp</code>, <code>btnBol</code>), 1 <code>Label</code> (<code>lblSonuc</code>), 1 <code>ListBox</code> (<code>lstGecmis</code>). İsimleri <b>Properties</b> penceresindeki <code>(Name)</code> alanından ver.</li>
<li>Her butona çift tıkla: Visual Studio bir <b>Click olay işleyicisi</b> (<t en="event handler" ja="イベントハンドラ">event handler</t>) oluşturur. Kullanıcı tıkladığında Windows bu metodu çağırır.</li>
</ol>
<p><b>Mantık / arayüz ayrımı:</b> <code>HesapMotoru</code> hiçbir <code>TextBox</code>'ı, <code>Label</code>'ı bilmez; sadece sayı alır, sayı döndürür. <code>Form1</code> ise sadece metni okur, motoru çağırır ve sonucu gösterir. Yarın arayüzü WPF'e ya da web'e taşısan motor aynen kalır; motoru test etmek için pencere açmana gerek yoktur. Büyük CAD yazılımları da geometri hesaplarını arayüzden ayrı katmanlarda tutar.</p>`,
      code: cs`// HesapMotoru.cs — arayüzden bağımsız mantık (konsolda test ettiğin kodun aynısı)
public static class HesapMotoru
{
    public static double Hesapla(double a, char op, double b)
    {
        switch (op)
        {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/':
                if (b == 0) throw new DivideByZeroException("Sıfıra bölme yapılamaz.");
                return a / b;
            default:
                throw new ArgumentException("Bilinmeyen işlem: " + op);
        }
    }
}

// Form1.cs — sadece arayüz: oku → motoru çağır → göster
using System.Globalization;

public partial class Form1 : Form
{
    public Form1()
    {
        InitializeComponent();
    }

    private void btnTopla_Click(object sender, EventArgs e) => IslemYap('+');
    private void btnCikar_Click(object sender, EventArgs e) => IslemYap('-');
    private void btnCarp_Click(object sender, EventArgs e) => IslemYap('*');
    private void btnBol_Click(object sender, EventArgs e) => IslemYap('/');

    private void IslemYap(char op)
    {
        if (!double.TryParse(txtA.Text, NumberStyles.Float, CultureInfo.InvariantCulture, out double a) ||
            !double.TryParse(txtB.Text, NumberStyles.Float, CultureInfo.InvariantCulture, out double b))
        {
            lblSonuc.Text = "Lütfen geçerli sayılar girin (ör. 2.5)";
            return;
        }

        try
        {
            double sonuc = HesapMotoru.Hesapla(a, op, b);
            string satir = $"{a} {op} {b} = {Math.Round(sonuc, 6)}";
            lblSonuc.Text = satir;
            lstGecmis.Items.Insert(0, satir);   // en yeni en üstte
        }
        catch (DivideByZeroException ex)
        {
            MessageBox.Show(ex.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }
}`,
      runnable: false,
      checklist: [
        'Visual Studio Community\'de Windows Forms App (.NET 8) projesi oluşturdum',
        'Hesapla fonksiyonunu ayrı bir HesapMotoru sınıfına taşıdım',
        'TextBox, Button, Label ve ListBox yerleştirip isimlerini verdim',
        'Butonların Click olaylarını IslemYap metoduna bağladım ve çalıştırdım (F5)',
        'Geçersiz sayı ve sıfıra bölme durumlarında programın çökmediğini denedim',
        'Neden mantığı arayüzden ayırdığımı kendi cümlelerimle açıklayabiliyorum',
      ],
    },
  ],
  finalChecklist: [
    'GitHub\'da "calculator-csharp" gibi açık bir isimle depo (repository) oluşturdum ve konsol + WinForms sürümlerini yükledim',
    'README.md: projenin ne yaptığı, özellik listesi (dört işlem, hata yönetimi, geçmiş, üs/yüzde/karekök), nasıl çalıştırılacağı',
    'README\'ye konsol çıktısından ve WinForms penceresinden birer ekran görüntüsü ekledim',
    'README\'de "Neler öğrendim" bölümü: TryParse, istisnalar, double ile sıfıra bölme (∞), mantık/arayüz ayrımı',
    'Kodda anlamlı isimler ve kısa yorumlar var; kullanılmayan kodu temizledim',
    'Tüm hata senaryolarını (abc, boş satır, 5 / 0, bilinmeyen işlem, q) son kez elle denedim',
    'README\'ye kısa bir Japonca özet satırı ekledim (ör. 「C#で作成した電卓アプリです。」)',
  ],
  extensions: [
    'Hesapla için bir xUnit test projesi ekle: her işlem ve her hata durumu için bir test yaz',
    'Parantez ve işlem önceliği olan ifadeleri çöz (ör. "2 + 3 * 4"): Shunting-yard algoritmasını araştır',
    'Hafıza tuşları: M+, M-, MR, MC',
    'Birim dönüştürücü modu: mm ↔ inç, derece ↔ radyan (CAD\'de sık kullanılır)',
    'Geçmişi bir metin dosyasına kaydet ve program açılınca geri yükle',
    'WinForms sürümünde klavye desteği: Enter ile hesapla, Esc ile temizle',
  ],
  vocab: [
    { en: 'Calculator', tr: 'Hesap makinesi', ja: '電卓', kana: 'でんたく', romaji: 'dentaku' },
    { en: 'Input', tr: 'Girdi', ja: '入力', kana: 'にゅうりょく', romaji: 'nyūryoku' },
    { en: 'Output', tr: 'Çıktı', ja: '出力', kana: 'しゅつりょく', romaji: 'shutsuryoku' },
    { en: 'Function', tr: 'Fonksiyon', ja: '関数', kana: 'かんすう', romaji: 'kansū' },
    { en: 'Return value', tr: 'Dönüş değeri', ja: '戻り値', kana: 'もどりち', romaji: 'modorichi' },
    { en: 'Exception', tr: 'İstisna', ja: '例外', kana: 'れいがい', romaji: 'reigai' },
    { en: 'Error handling', tr: 'Hata yönetimi', ja: 'エラー処理', kana: 'エラーしょり', romaji: 'erā shori' },
    { en: 'Division by zero', tr: 'Sıfıra bölme', ja: 'ゼロ除算', kana: 'ゼロじょざん', romaji: 'zero jozan' },
    { en: 'Loop', tr: 'Döngü', ja: 'ループ', kana: 'ループ', romaji: 'rūpu' },
    { en: 'History', tr: 'Geçmiş', ja: '履歴', kana: 'りれき', romaji: 'rireki' },
    { en: 'Button', tr: 'Buton', ja: 'ボタン', kana: 'ボタン', romaji: 'botan' },
    { en: 'Event handler', tr: 'Olay işleyici', ja: 'イベントハンドラ', kana: 'イベントハンドラ', romaji: 'ibento handora' },
  ],
};
