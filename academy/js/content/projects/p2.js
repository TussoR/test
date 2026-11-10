import { cs } from '../helpers.js';

// Tarayıcıda System.Drawing yok: aynı adlı minik bir PointF sınıfı ve önceki adımların Geo fonksiyonları.
const POINTF = cs`// Tarayıcı için mini PointF (WinForms'ta System.Drawing.PointF hazır gelir)
class PointF
{
    public float X { get; }
    public float Y { get; }
    public PointF(float x, float y) { X = x; Y = y; }
}`;

const GEO = cs`static class Geo
{
    public static double Distance(double x1, double y1, double x2, double y2)
    {
        double dx = x2 - x1, dy = y2 - y1;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public static double DistanceToSegment(double px, double py, double ax, double ay, double bx, double by)
    {
        double dx = bx - ax, dy = by - ay;
        double len2 = dx * dx + dy * dy;
        if (len2 == 0) return Distance(px, py, ax, ay);
        double t = ((px - ax) * dx + (py - ay) * dy) / len2;
        t = Math.Max(0, Math.Min(1, t));
        return Distance(px, py, ax + t * dx, ay + t * dy);
    }
}`;

const SHAPES_BASE = cs`abstract class Shape
{
    public abstract bool HitTest(PointF p, float tolerance);
}

class LineShape : Shape
{
    public PointF A { get; set; }
    public PointF B { get; set; }
    public LineShape(PointF a, PointF b) { A = a; B = b; }
    public override bool HitTest(PointF p, float tol) =>
        Geo.DistanceToSegment(p.X, p.Y, A.X, A.Y, B.X, B.Y) <= tol;
    public override string ToString() => $"Line ({A.X},{A.Y})-({B.X},{B.Y})";
}

class CircleShape : Shape
{
    public PointF Center { get; set; }
    public float Radius { get; set; }
    public CircleShape(PointF c, float r) { Center = c; Radius = r; }
    public override bool HitTest(PointF p, float tol) =>
        Math.Abs(Geo.Distance(p.X, p.Y, Center.X, Center.Y) - Radius) <= tol;
    public override string ToString() => $"Circle ({Center.X},{Center.Y}) r={Radius:F2}";
}`;

const RECT_FULL = cs`class RectShape : Shape
{
    public PointF P1 { get; set; }   // sürüklemenin başladığı köşe
    public PointF P2 { get; set; }   // bırakılan köşe
    public RectShape(PointF p1, PointF p2) { P1 = p1; P2 = p2; }
    public override bool HitTest(PointF p, float tol)
    {
        float x1 = P1.X, y1 = P1.Y, x2 = P2.X, y2 = P2.Y;
        return Geo.DistanceToSegment(p.X, p.Y, x1, y1, x2, y1) <= tol
            || Geo.DistanceToSegment(p.X, p.Y, x2, y1, x2, y2) <= tol
            || Geo.DistanceToSegment(p.X, p.Y, x2, y2, x1, y2) <= tol
            || Geo.DistanceToSegment(p.X, p.Y, x1, y2, x1, y1) <= tol;
    }
    public override string ToString() => $"Rect ({P1.X},{P1.Y})-({P2.X},{P2.Y})";
}`;

export default {
  kind: 'project',
  id: 'p2',
  module: 'm8',
  title: 'Proje 2: 2D Çizim Uygulaması',
  titleEn: '2D Drawing App',
  titleJa: '2D作図アプリ',
  minutes: 900,
  level: 3,
  environment: 'desktop',
  demo: 'draw2d',
  summary: `
<p>Fareyle <b>çizgi, dikdörtgen ve daire</b> çizilen, çizilen nesnelerin tıklanarak <b>seçilebildiği</b> ve <b>Delete</b> tuşuyla silinebildiği bir Windows Forms uygulaması. Bu, bir CAD programının en küçük çekirdeğidir: bir <t en="document model" ja="ドキュメントモデル">belge modeli</t> (şekil listesi), onu ekrana çizen bir <t en="view" ja="ビュー">görünüm</t> ve fare olaylarını yorumlayan bir <t en="tool" ja="ツール">araç</t>.</p>
<p>Projenin <b>geometri kısmını</b> (bir nokta bir çizgiye ne kadar yakın? hangi şekil en üstte?) önce burada, tarayıcıda alıştırmalarla yazacaksın; bunlar WinForms gerektirmeyen saf C# sınıflarıdır. Pencere, çizim ve fare kısmını ise Visual Studio'da adım adım kuracaksın. Üstteki önizleme (draw2d) bitmiş uygulamanın nasıl davranacağını gösterir.</p>`,
  goals: [
    'Visual Studio Community\'de .NET 8 Windows Forms projesi kurup yönetmek',
    'Soyut (abstract) Shape sınıfı ve LineShape / RectShape / CircleShape alt sınıflarıyla kalıtım ve çok biçimlilik kullanmak',
    'Nokta–doğru parçası uzaklığı, nokta–dikdörtgen ve nokta–çember testleriyle isabet testi (hit testing) yazmak',
    'Paint olayı + Invalidate() çizim modelini ve çift tamponlamayı (double buffering) anlamak',
    'MouseDown / MouseMove / MouseUp olaylarını bir durum makinesiyle (state machine) yönetmek',
    'Seçim vurgusu ve Delete tuşu ile silme gibi gerçek CAD etkileşimlerini uygulamak',
  ],
  skills: ['Windows Forms', 'System.Drawing (Graphics, Pen, PointF)', 'Soyut sınıflar ve override', 'List&lt;Shape&gt; belge modeli', 'Hit testing geometrisi', 'Olay işleyiciler', 'Durum makinesi', 'Double buffering'],
  steps: [
    {
      title: 'Adım 1 — Visual Studio\'da projeyi kur',
      body: `
<p>Bu proje masaüstünde, <b>Visual Studio Community</b> (ücretsiz) ile yapılır. Kurulumda <b>".NET desktop development"</b> iş yükünü (workload) seçtiğinden emin ol.</p>
<ol>
<li><i>Create a new project</i> → arama kutusuna <b>Windows Forms App</b> yaz → C# olanı seç (".NET Framework" yazanı <b>değil</b>).</li>
<li>Proje adı: <code>Draw2D</code>. Framework: <b>.NET 8.0 (Long Term Support)</b>.</li>
<li>Açılan <code>Form1</code> tasarımcısında Properties penceresinden: <code>Text</code> = "Draw2D", <code>Size</code> = 1000; 700.</li>
<li><b>Solution Explorer</b>'da projeye sağ tık → <i>Add → New Folder</i>: <code>Model</code> (şekiller ve geometri) ve <code>Tools</code> (fare mantığı). Klasörler kodun sorumluluklarına göre ayrılmasının ilk adımıdır.</li>
<li><b>F5</b> ile çalıştır: boş bir pencere görmelisin.</li>
</ol>
<div class="callout"><b>İsimlendirme:</b> Bu projeden itibaren sınıf ve metot adlarını İngilizce yazıyoruz (<code>Shape</code>, <code>HitTest</code>). Portfolyonu okuyacak kişi Türkçe bilmeyebilir; yazılım sektöründe, Japonya dahil, kod içi isimler genelde İngilizcedir. Açıklamaları ve yorumları ise istediğin dilde yazabilirsin.</div>
<p>Bu arada <b>Git</b>'i de başlat: Visual Studio'da <i>Git → Create Git Repository</i>. Her adımı bitirdiğinde küçük bir <t en="commit" ja="コミット">commit</t> at; portfolyonda düzenli bir geçmiş iyi görünür.</p>`,
      checklist: [
        'Visual Studio Community\'yi ".NET desktop development" iş yüküyle kurdum',
        'Draw2D adlı Windows Forms App (.NET 8) projesi oluşturdum',
        'Model ve Tools klasörlerini ekledim',
        'Projeyi F5 ile çalıştırıp boş pencereyi gördüm',
        'Git deposu oluşturup ilk commit\'i attım',
      ],
    },
    {
      title: 'Adım 2 — Mimari: belge modeli, görünüm, araç',
      body: `
<p>Kod yazmadan önce parçaları ayıralım. Bu üçlü, neredeyse tüm çizim/CAD programlarında karşına çıkar:</p>
<svg viewBox="0 0 640 170" role="img" aria-label="Belge modeli, görünüm ve araç arasındaki ilişki">
  <defs><marker id="ar-p2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <rect x="10" y="50" width="170" height="70" rx="10" class="box"/>
    <text x="95" y="78" class="t1">Araç (Tool)</text><text x="95" y="98" class="t2">fare olaylarını yorumlar</text>
    <rect x="235" y="50" width="170" height="70" rx="10" class="box hi"/>
    <text x="320" y="78" class="t1">Belge (Document)</text><text x="320" y="98" class="t2">List&lt;Shape&gt;</text>
    <rect x="460" y="50" width="170" height="70" rx="10" class="box"/>
    <text x="545" y="78" class="t1">Görünüm (View)</text><text x="545" y="98" class="t2">Paint: şekilleri çizer</text>
    <line x1="180" y1="85" x2="233" y2="85" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p2)"/>
    <line x1="405" y1="85" x2="458" y2="85" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p2)"/>
    <text x="207" y="40" class="t3">ekler / siler</text><text x="432" y="40" class="t3">okur</text>
    <text x="320" y="155" class="t2">Fare → Araç → Belge değişir → Invalidate() → Paint → ekran</text>
  </g>
</svg>
<ul>
<li><b>Belge modeli:</b> Çizimin "gerçeği". Sadece veri: hangi şekiller var, koordinatları ne. Ekrandaki pikseller değil!</li>
<li><b>Görünüm:</b> Belgeyi okuyup ekrana çizer. Belgeyi değiştirmez.</li>
<li><b>Araç:</b> Fare tıklamalarını "çizgi ekle", "şunu seç" gibi işlemlere çevirir.</li>
</ul>
<div class="callout tip">Blender benzetmesi: <b>mesh verisi</b> (vertex/edge/face listeleri) belge modelidir; <b>viewport</b> görünümdür; <b>Knife</b> ya da <b>Extrude</b> aracı ise araçtır. Viewport'u kapatsan da mesh verisi yerinde durur.</div>
<p>Aşağıdaki kod, belge modelinin kalbini gösteriyor: <code>abstract</code> bir <code>Shape</code> ve her biri kendi davranışını <code>override</code> eden alt sınıflar. Liste <code>List&lt;Shape&gt;</code> türünde olduğu için içine her tür şekli koyabiliriz; <code>s.Describe()</code> çağrısı çalışma anında doğru alt sınıfın metodunu bulur (<t en="polymorphism" ja="ポリモーフィズム">çok biçimlilik</t>).</p>`,
      code: cs`var document = new List<Shape>();
document.Add(new LineShape(0, 0, 100, 50));
document.Add(new CircleShape(40, 40, 25));
document.Add(new LineShape(10, 90, 90, 90));

foreach (Shape s in document)
    Console.WriteLine(s.Describe());
Console.WriteLine("Şekil sayısı: " + document.Count);

abstract class Shape
{
    public abstract string Describe();
}

class LineShape : Shape
{
    public float X1, Y1, X2, Y2;
    public LineShape(float x1, float y1, float x2, float y2) { X1 = x1; Y1 = y1; X2 = x2; Y2 = y2; }
    public override string Describe() => $"Çizgi ({X1},{Y1}) → ({X2},{Y2})";
}

class CircleShape : Shape
{
    public float CX, CY, R;
    public CircleShape(float cx, float cy, float r) { CX = cx; CY = cy; R = r; }
    public override string Describe() => $"Daire merkez ({CX},{CY}), yarıçap {R}";
}`,
      runnable: true,
    },
    {
      title: 'Adım 3 — İsabet testi 1: nokta dikdörtgenin içinde mi?',
      body: `
<p>Kullanıcı bir yere tıkladığında "hangi şekle tıkladı?" sorusunu cevaplamalıyız. Buna <t en="hit testing" ja="ヒットテスト">isabet testi</t> denir ve her CAD programında seçimin temelidir.</p>
<p>En kolayı dikdörtgen: nokta <code>(px, py)</code>, <code>x</code> aralığının <b>ve</b> <code>y</code> aralığının içindeyse dikdörtgenin içindedir.</p>
<p>Bir tuzak var: kullanıcı dikdörtgeni sağ alttan sol üste doğru da sürükleyebilir. O zaman <code>x1 &gt; x2</code> olur ve basit <code>px &gt;= x1 &amp;&amp; px &lt;= x2</code> testi her zaman <code>false</code> verir. Çözüm: önce köşeleri <b>normalleştir</b> — <code>Math.Min</code> ile sol, <code>Math.Max</code> ile sağ kenarı bul.</p>
<div class="callout"><b>Ekran koordinatları:</b> WinForms'ta (0,0) sol üst köşedir ve <b>Y aşağı doğru artar</b>. Matematik derslerindeki ve CAD'deki Y yukarı sistemin tersidir. Proje 5'te ekran ↔ dünya dönüşümünü yazacağız; şimdilik ekran koordinatlarında çalışıyoruz.</div>
<p>Bu fonksiyonu ileride "pencere ile seçim" (dikdörtgen çizip içindekileri seçme) için de kullanacaksın.</p>`,
      exercise: {
        title: 'PointInRect',
        prompt: `
<p><code>bool PointInRect(double px, double py, double x1, double y1, double x2, double y2)</code> fonksiyonunu yaz. <code>(x1, y1)</code> ve <code>(x2, y2)</code> dikdörtgenin <b>herhangi iki karşı köşesi</b>dir (sıra belli değil). Kenarın tam üstündeki nokta <b>içeride</b> sayılır.</p>
<pre class="expected">PointInRect(5, 5, 0, 0, 10, 10)   → True
PointInRect(5, 5, 10, 10, 0, 0)   → True   (ters sürükleme)
PointInRect(11, 5, 0, 0, 10, 10)  → False</pre>`,
        starter: cs`bool PointInRect(double px, double py, double x1, double y1, double x2, double y2)
{
    // Köşeleri normalleştir (sol, sağ, üst, alt), sonra aralık kontrolü yap
    return false;
}

Console.WriteLine(PointInRect(5, 5, 0, 0, 10, 10));`,
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(PointInRect(5, 5, 0, 0, 10, 10));
Console.WriteLine(PointInRect(11, 5, 0, 0, 10, 10));
Console.WriteLine(PointInRect(5, -1, 0, 0, 10, 10));`, expect: 'True\nFalse\nFalse', msg: 'Normal dikdörtgende içeride/dışarıda doğru karar vermeli' },
          { type: 'harness', append: cs`Console.WriteLine(PointInRect(5, 5, 10, 10, 0, 0));
Console.WriteLine(PointInRect(3, 7, 10, 0, 0, 10));
Console.WriteLine(PointInRect(-3, 7, 10, 0, 0, 10));`, expect: 'True\nTrue\nFalse', msg: 'Köşeler ters sırada verilse de çalışmalı (normalleştirme)' },
          { type: 'harness', append: cs`Console.WriteLine(PointInRect(10, 10, 0, 0, 10, 10));
Console.WriteLine(PointInRect(0, 4, 0, 0, 10, 10));
Console.WriteLine(PointInRect(2.5, 2.5, 2, 2, 3, 3));`, expect: 'True\nTrue\nTrue', msg: 'Kenar üstündeki noktalar içeride sayılmalı' },
          { type: 'code', pattern: 'Math\\.(Min|Max)', msg: 'Köşeleri Math.Min / Math.Max ile normalleştirmelisin' },
        ],
        hints: [
          'Dört değişken hesapla: <code>left</code>, <code>right</code>, <code>top</code>, <code>bottom</code>. Sol kenar, iki x\'ten küçük olanıdır.',
          '<code>double left = Math.Min(x1, x2); double right = Math.Max(x1, x2);</code> — y için de aynısı.',
          'Son satır dört karşılaştırmanın "ve"si: <code>return px &gt;= left &amp;&amp; px &lt;= right &amp;&amp; ...</code> (y için iki karşılaştırma daha).',
        ],
        solution: cs`bool PointInRect(double px, double py, double x1, double y1, double x2, double y2)
{
    double left = Math.Min(x1, x2), right = Math.Max(x1, x2);
    double top = Math.Min(y1, y2), bottom = Math.Max(y1, y2);
    return px >= left && px <= right && py >= top && py <= bottom;
}

Console.WriteLine(PointInRect(5, 5, 0, 0, 10, 10));`,
        explain: 'Normalleştirme sayesinde fonksiyon, kullanıcının hangi yöne sürüklediğini umursamaz. Bu küçük ayrıntı, gerçek kullanıcıların "beklenmedik" davranışlarına dayanıklı kod yazmanın tipik bir örneğidir.',
      },
    },
    {
      title: 'Adım 4 — İsabet testi 2: nokta çemberin kenarına yakın mı?',
      body: `
<p>Bir CAD programında içi boş bir daireye tıklamak için <b>çizgisinin üstüne</b> tıklarsın; dairenin ortasına tıklamak onu seçmez (yoksa iç içe dairelerde hep büyüğü seçilirdi). Fare pikseli pikseline çizginin üstüne denk gelmeyeceği için bir <t en="tolerance" ja="許容誤差">tolerans</t> kullanırız: "kenara <code>tol</code> pikselden yakınsa isabet".</p>
<p>Formül: noktanın merkeze uzaklığı <code>d</code> ise, kenara uzaklığı <code>|d − r|</code>'dir. Nokta içerideyse <code>d − r</code> negatif olur; bu yüzden mutlak değer (<code>Math.Abs</code>) alıyoruz.</p>
<p>İki nokta arası uzaklık Pisagor'dan gelir: <code>√((x2−x1)² + (y2−y1)²)</code>. Bu fonksiyon projenin her yerinde kullanılacak; bu yüzden ayrı bir fonksiyon olarak yazıyoruz.</p>
<div class="callout tip">Tolerans neden <b>piksel</b> cinsinden? Kullanıcı yakınlaştırdığında (zoom) dünya birimiyle tolerans küçülür ama elin titremesi aynı kalır. CAD programları seçim kutusunu (pickbox) bu yüzden ekran pikseliyle tanımlar.</div>`,
      exercise: {
        title: 'Distance ve IsNearCircle',
        prompt: `
<p>İki fonksiyon yaz:</p>
<ul>
<li><code>double Distance(double x1, double y1, double x2, double y2)</code> — iki nokta arası uzaklık.</li>
<li><code>bool IsNearCircle(double px, double py, double cx, double cy, double r, double tol)</code> — nokta, merkezi <code>(cx, cy)</code> ve yarıçapı <code>r</code> olan çemberin <b>çizgisine</b> <code>tol</code>'dan yakın (veya eşit) mı?</li>
</ul>
<pre class="expected">Distance(0, 0, 3, 4)                → 5
IsNearCircle(10.5, 0, 0, 0, 10, 1)  → True
IsNearCircle(0, 0, 0, 0, 10, 1)     → False  (merkez, çizgi değil)</pre>`,
        starter: cs`double Distance(double x1, double y1, double x2, double y2)
{
    return 0;
}

bool IsNearCircle(double px, double py, double cx, double cy, double r, double tol)
{
    return false;
}

Console.WriteLine(Distance(0, 0, 3, 4));`,
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(Distance(0, 0, 3, 4));
Console.WriteLine(Distance(1, 1, 4, 5));
Console.WriteLine(Distance(2, 3, -1, -1).ToString("F2"));
Console.WriteLine(Distance(1, 2, 2, 3).ToString("F3"));`, expect: '5\n5\n5.00\n1.414', msg: 'Distance Pisagor ile doğru uzaklığı vermeli' },
          { type: 'harness', append: cs`Console.WriteLine(IsNearCircle(10.5, 0, 0, 0, 10, 1));
Console.WriteLine(IsNearCircle(0, 9.2, 0, 0, 10, 1));
Console.WriteLine(IsNearCircle(7.07, 7.07, 0, 0, 10, 0.5));
Console.WriteLine(IsNearCircle(25, 20, 20, 20, 5, 0.1));`, expect: 'True\nTrue\nTrue\nTrue', msg: 'Çizginin hem dışından hem içinden yakın noktalar isabet sayılmalı' },
          { type: 'harness', append: cs`Console.WriteLine(IsNearCircle(0, 0, 0, 0, 10, 1));
Console.WriteLine(IsNearCircle(12, 0, 0, 0, 10, 1));
Console.WriteLine(IsNearCircle(5, 5, 0, 0, 10, 1));`, expect: 'False\nFalse\nFalse', msg: 'Merkezdeki ve çizgiden uzak noktalar isabet sayılmamalı' },
          { type: 'code', pattern: 'Math\\.Abs', msg: 'Kenara uzaklık için Math.Abs kullanmalısın' },
        ],
        hints: [
          '<code>Distance</code>: önce <code>dx = x2 - x1</code> ve <code>dy = y2 - y1</code> hesapla, sonra <code>Math.Sqrt</code>.',
          '<code>IsNearCircle</code> içinde <code>Distance</code>\'ı çağırarak noktanın merkeze uzaklığını bul: <code>double d = Distance(px, py, cx, cy);</code>',
          'Son satır: <code>return Math.Abs(d - r) &lt;= tol;</code> — neden mutlak değer gerektiğini merkezdeki nokta örneğiyle düşün.',
        ],
        solution: cs`double Distance(double x1, double y1, double x2, double y2)
{
    double dx = x2 - x1, dy = y2 - y1;
    return Math.Sqrt(dx * dx + dy * dy);
}

bool IsNearCircle(double px, double py, double cx, double cy, double r, double tol)
{
    double d = Distance(px, py, cx, cy);
    return Math.Abs(d - r) <= tol;
}

Console.WriteLine(Distance(0, 0, 3, 4));`,
        explain: '<code>|d − r|</code>, noktanın çember çizgisine olan en kısa uzaklığıdır: içerideyken de dışarıdayken de pozitif. Dolu bir daire seçmek isteseydik test sadece <code>d &lt;= r + tol</code> olurdu.',
      },
    },
    {
      title: 'Adım 5 — İsabet testi 3: noktanın doğru parçasına uzaklığı',
      body: `
<p>Çizgi seçimi en ilginç olanı. Noktanın <b>sonsuz doğruya</b> değil, A ile B arasındaki <b>doğru parçasına</b> (<t en="line segment" ja="線分">segment</t>) uzaklığını bulmalıyız.</p>
<svg viewBox="0 0 520 170" role="img" aria-label="Noktanın doğru parçasına izdüşümü">
  <g font-size="13">
    <line x1="60" y1="120" x2="400" y2="120" class="ln" stroke-width="3"/>
    <circle cx="60" cy="120" r="5" class="acc"/><text x="50" y="145" class="t2">A (t = 0)</text>
    <circle cx="400" cy="120" r="5" class="acc"/><text x="385" y="145" class="t2">B (t = 1)</text>
    <circle cx="230" cy="40" r="5" fill="var(--warn)"/><text x="240" y="38" class="t2">P</text>
    <line x1="230" y1="40" x2="230" y2="120" stroke="var(--warn)" stroke-dasharray="4 4"/>
    <circle cx="230" cy="120" r="4" fill="var(--ok)"/><text x="238" y="112" class="t3">en yakın nokta (t = 0.5)</text>
    <circle cx="470" cy="60" r="5" fill="var(--err)"/><text x="478" y="58" class="t2">Q</text>
    <line x1="470" y1="60" x2="400" y2="120" stroke="var(--err)" stroke-dasharray="4 4"/>
    <text x="420" y="80" class="t3">t &gt; 1 → B'ye kırp</text>
  </g>
</svg>
<p>Yöntem (<t en="projection" ja="射影">izdüşüm</t>):</p>
<ol>
<li><code>d = B − A</code> (doğrunun yön vektörü).</li>
<li><code>t = ((P − A) · d) / (d · d)</code> — P'nin doğru üzerindeki konumu. t = 0 → A'da, t = 1 → B'de. (<code>·</code> nokta çarpım: <code>ax*bx + ay*by</code>)</li>
<li><code>t</code>'yi <b>[0, 1] aralığına kırp</b> (<t en="clamp" ja="クランプ">clamp</t>). Kırpmazsak Q gibi noktalar, doğrunun hayali uzantısına yakın diye yanlışlıkla seçilir.</li>
<li>En yakın nokta: <code>A + t·d</code>. Cevap: P'nin bu noktaya uzaklığı.</li>
</ol>
<p><b>Kenar durumu:</b> A ile B aynı noktaysa <code>d · d = 0</code> olur ve sıfıra bölersin. Bu durumda uzaklık doğrudan P–A uzaklığıdır.</p>`,
      exercise: {
        title: 'DistanceToSegment',
        prompt: `
<p><code>double DistanceToSegment(double px, double py, double ax, double ay, double bx, double by)</code> fonksiyonunu yaz. <code>Distance</code> fonksiyonu hazır verildi.</p>
<pre class="expected">DistanceToSegment(5, 3, 0, 0, 10, 0)    → 3.00
DistanceToSegment(-3, 4, 0, 0, 10, 0)   → 5.00   (A'ya en yakın)
DistanceToSegment(0, 5, 0, 0, 10, 10)   → 3.54   (çapraz çizgi)</pre>
<p>(Testler sonucu <code>F2</code> ile yazdırır.)</p>`,
        starter: cs`double Distance(double x1, double y1, double x2, double y2)
{
    double dx = x2 - x1, dy = y2 - y1;
    return Math.Sqrt(dx * dx + dy * dy);
}

double DistanceToSegment(double px, double py, double ax, double ay, double bx, double by)
{
    // 1) d = B - A
    // 2) A == B ise (uzunluk 0) P-A uzaklığını döndür
    // 3) t'yi hesapla ve [0, 1] aralığına kırp
    // 4) en yakın noktaya uzaklığı döndür
    return 0;
}

Console.WriteLine(DistanceToSegment(5, 3, 0, 0, 10, 0).ToString("F2"));`,
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(DistanceToSegment(5, 3, 0, 0, 10, 0).ToString("F2"));
Console.WriteLine(DistanceToSegment(0, 5, 0, 0, 10, 10).ToString("F2"));
Console.WriteLine(DistanceToSegment(4, 5, 2, 2, 2, 8).ToString("F2"));`, expect: '3.00\n3.54\n2.00', msg: 'İzdüşümü parçanın içine düşen noktalarda doğru uzaklık' },
          { type: 'harness', append: cs`Console.WriteLine(DistanceToSegment(-3, 4, 0, 0, 10, 0).ToString("F2"));
Console.WriteLine(DistanceToSegment(13, 4, 0, 0, 10, 0).ToString("F2"));
Console.WriteLine(DistanceToSegment(20, 20, 0, 0, 10, 10).ToString("F2"));`, expect: '5.00\n5.00\n14.14', msg: 't, [0, 1] aralığına kırpılmalı (uç noktalara uzaklık)' },
          { type: 'harness', append: cs`Console.WriteLine(DistanceToSegment(3, 4, 0, 0, 0, 0).ToString("F2"));
Console.WriteLine(DistanceToSegment(4, 5, 1, 1, 1, 1).ToString("F2"));`, expect: '5.00\n5.00', msg: 'A ve B aynı noktaysa sıfıra bölmeden P–A uzaklığını vermeli' },
          { type: 'harness', append: cs`Console.WriteLine(DistanceToSegment(5, -2, 10, 0, 0, 0).ToString("F2"));
Console.WriteLine(DistanceToSegment(5, 0, 0, 0, 10, 0).ToString("F2"));`, expect: '2.00\n0.00', msg: 'Ters yönlü parça ve tam üstündeki nokta da doğru olmalı' },
        ],
        hints: [
          '<code>double dx = bx - ax, dy = by - ay; double len2 = dx * dx + dy * dy;</code> — <code>len2 == 0</code> ise <code>Distance(px, py, ax, ay)</code> döndür.',
          '<code>double t = ((px - ax) * dx + (py - ay) * dy) / len2;</code> Sonra kırp: <code>t = Math.Max(0, Math.Min(1, t));</code>',
          'En yakın nokta <code>(ax + t * dx, ay + t * dy)</code>. Cevap, P ile bu nokta arasındaki <code>Distance</code>.',
        ],
        solution: cs`double Distance(double x1, double y1, double x2, double y2)
{
    double dx = x2 - x1, dy = y2 - y1;
    return Math.Sqrt(dx * dx + dy * dy);
}

double DistanceToSegment(double px, double py, double ax, double ay, double bx, double by)
{
    double dx = bx - ax, dy = by - ay;
    double len2 = dx * dx + dy * dy;
    if (len2 == 0) return Distance(px, py, ax, ay);
    double t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.Max(0, Math.Min(1, t));
    return Distance(px, py, ax + t * dx, ay + t * dy);
}

Console.WriteLine(DistanceToSegment(5, 3, 0, 0, 10, 0).ToString("F2"));`,
        explain: 'Nokta çarpım, P\'nin AB yönündeki "gölgesinin" uzunluğunu verir; <code>d · d</code>\'ye bölmek onu 0–1 arası bir orana çevirir. Bu izdüşüm fikri 3D\'de de aynen geçerli: Proje 5\'te uç nokta yakalama (snap), Proje 3–4\'te 3D vektör işlemleri hep bu temele dayanır.',
      },
    },
    {
      title: 'Adım 6 — Şekil sınıfları ve en üstteki şekli seçmek',
      body: `
<p>Şimdi geometri fonksiyonlarını <b>sınıflara</b> bağlıyoruz. Her şekil kendi isabet testini bilir: <code>public abstract bool HitTest(PointF p, float tolerance);</code>. Seçim kodu ise şeklin türünü hiç sormaz; sadece <code>s.HitTest(p, tol)</code> der.</p>
<p>İki önemli ayrıntı:</p>
<ul>
<li><b>Static yardımcı sınıf:</b> Üst düzey (top-level) yerel fonksiyonları sınıfların içinden çağıramazsın. Bu yüzden geometri fonksiyonlarını <code>static class Geo</code> içine taşıdık: <code>Geo.DistanceToSegment(...)</code>.</li>
<li><b>Çizim sırası = Z sırası:</b> Listeye sonradan eklenen şekil, ekranda öncekilerin <b>üstüne</b> çizilir. Kullanıcı üst üste binen yerlere tıklarsa <b>görünen</b>, yani en üstteki şekli seçmeyi bekler. Bu yüzden listeyi <b>sondan başa</b> tarayıp ilk isabette dururuz.</li>
</ul>
<p>İçi boş bir dikdörtgen, daire gibi, sadece <b>kenarlarına</b> tıklanınca seçilmeli: dört kenarın her birine <code>DistanceToSegment</code> uygula.</p>
<div class="callout"><code>float</code> notu: WinForms koordinatları <code>float</code> kullanır (<code>PointF</code>). <code>Math.Sqrt</code> ise <code>double</code> döndürür. Visual Studio'da <code>float r = Math.Sqrt(x);</code> yazarsan <b>CS0266</b> hatası alırsın; <code>(float)Math.Sqrt(x)</code> diye açıkça dönüştürmelisin. (Bu platformun yorumlayıcısı bu hatayı yakalamayabilir, dikkatli ol.)</div>`,
      exercise: {
        title: 'RectShape.HitTest ve PickTopmost',
        prompt: `
<p>1) <code>RectShape.HitTest</code> metodunu tamamla: nokta, dikdörtgenin <b>dört kenarından birine</b> <code>tol</code>'dan yakınsa <code>true</code>. (İçine tıklamak seçmez.)</p>
<p>2) <code>int PickTopmost(List&lt;Shape&gt; shapes, PointF p, float tol)</code>: isabet eden <b>en üstteki</b> (listede en sondaki) şeklin indeksini döndür; hiçbiri yoksa <code>-1</code>.</p>
<p>Örnek sahne: <code>[0] Line (0,0)-(100,0)</code>, <code>[1] Rect (20,-20)-(60,20)</code>, <code>[2] Circle (50,0) r=30</code>, tolerans 3:</p>
<pre class="expected">(60, 5)   → 1   (dikdörtgenin sağ kenarı)
(80, 0)   → 2   (hem çizgi hem daire: daire üstte)
(40, 0)   → 0   (dikdörtgenin içi sayılmaz)
(200, 200)→ -1</pre>`,
        starter: cs`int PickTopmost(List<Shape> shapes, PointF p, float tol)
{
    // Listeyi sondan başa tara; ilk isabette indeksi döndür
    return -1;
}

var scene = new List<Shape>
{
    new LineShape(new PointF(0, 0), new PointF(100, 0)),
    new RectShape(new PointF(20, -20), new PointF(60, 20)),
    new CircleShape(new PointF(50, 0), 30),
};
Console.WriteLine(PickTopmost(scene, new PointF(60, 5), 3));

` + SHAPES_BASE + cs`

class RectShape : Shape
{
    public PointF P1 { get; set; }   // sürüklemenin başladığı köşe
    public PointF P2 { get; set; }   // bırakılan köşe
    public RectShape(PointF p1, PointF p2) { P1 = p1; P2 = p2; }
    public override bool HitTest(PointF p, float tol)
    {
        // Dört kenar: (x1,y1)-(x2,y1), (x2,y1)-(x2,y2), (x2,y2)-(x1,y2), (x1,y2)-(x1,y1)
        return false;
    }
    public override string ToString() => $"Rect ({P1.X},{P1.Y})-({P2.X},{P2.Y})";
}

` + GEO + `

` + POINTF,
        checks: [
          { type: 'harness', append: cs`var r = new RectShape(new PointF(20, -20), new PointF(60, 20));
Console.WriteLine(r.HitTest(new PointF(60, 5), 3));
Console.WriteLine(r.HitTest(new PointF(40, -21), 3));
Console.WriteLine(r.HitTest(new PointF(18, 0), 3));
Console.WriteLine(r.HitTest(new PointF(40, 0), 3));
Console.WriteLine(r.HitTest(new PointF(70, 0), 3));`, expect: 'True\nTrue\nTrue\nFalse\nFalse', msg: 'RectShape.HitTest sadece kenarlara yakın noktalarda true olmalı' },
          { type: 'harness', append: cs`var r2 = new RectShape(new PointF(60, 20), new PointF(20, -20));
Console.WriteLine(r2.HitTest(new PointF(20, 10), 2));`, expect: 'True', msg: 'Ters sürüklenmiş dikdörtgende de çalışmalı' },
          { type: 'harness', append: cs`var sc = new List<Shape>
{
    new LineShape(new PointF(0, 0), new PointF(100, 0)),
    new RectShape(new PointF(20, -20), new PointF(60, 20)),
    new CircleShape(new PointF(50, 0), 30),
};
Console.WriteLine(PickTopmost(sc, new PointF(60, 5), 3));
Console.WriteLine(PickTopmost(sc, new PointF(80, 0), 3));
Console.WriteLine(PickTopmost(sc, new PointF(40, 0), 3));
Console.WriteLine(PickTopmost(sc, new PointF(200, 200), 3));
Console.WriteLine(PickTopmost(new List<Shape>(), new PointF(0, 0), 3));`, expect: '1\n2\n0\n-1\n-1', msg: 'PickTopmost en üstteki (en son eklenen) isabet eden şekli bulmalı' },
          { type: 'code', pattern: 'HitTest\\s*\\(', msg: 'PickTopmost içinde şekillerin HitTest metodunu kullanmalısın' },
        ],
        hints: [
          '<code>PickTopmost</code>: <code>for (int i = shapes.Count - 1; i &gt;= 0; i--)</code> döngüsüyle sondan başa git.',
          'Döngünün içinde: <code>if (shapes[i].HitTest(p, tol)) return i;</code> Döngü biterse <code>-1</code> döndür. <code>RectShape</code> için önce <code>float x1 = P1.X, y1 = P1.Y, x2 = P2.X, y2 = P2.Y;</code> yaz.',
          'Kenar testleri: <code>Geo.DistanceToSegment(p.X, p.Y, x1, y1, x2, y1) &lt;= tol</code> — diğer üç kenar için de aynısını <code>||</code> ile bağla.',
        ],
        solution: cs`int PickTopmost(List<Shape> shapes, PointF p, float tol)
{
    for (int i = shapes.Count - 1; i >= 0; i--)
    {
        if (shapes[i].HitTest(p, tol)) return i;
    }
    return -1;
}

var scene = new List<Shape>
{
    new LineShape(new PointF(0, 0), new PointF(100, 0)),
    new RectShape(new PointF(20, -20), new PointF(60, 20)),
    new CircleShape(new PointF(50, 0), 30),
};
Console.WriteLine(PickTopmost(scene, new PointF(60, 5), 3));

` + SHAPES_BASE + `

` + RECT_FULL + `

` + GEO + `

` + POINTF,
        explain: '<code>PickTopmost</code> şekillerin türünü bilmiyor; her şekle "sana mı tıklandı?" diye soruyor. Yarın <code>PolylineShape</code> eklesen bu fonksiyonu hiç değiştirmezsin. Nesne yönelimli tasarımın asıl gücü budur: yeni tür eklemek, var olan kodu değiştirmeyi gerektirmez.',
      },
    },
    {
      title: 'Adım 7 — Visual Studio: şekiller kendini çizebilsin (Draw)',
      body: `
<p>Tarayıcıda test ettiğin sınıfları projeye taşı ve her şekle bir <code>Draw</code> metodu ekle. Çizim için <code>System.Drawing</code>'deki iki nesneyi kullanırız:</p>
<ul>
<li><code>Graphics</code> — "tuval". <code>DrawLine</code>, <code>DrawRectangle</code>, <code>DrawEllipse</code> gibi metotları vardır. Onu sen oluşturmazsın; Paint olayı sana verir.</li>
<li><code>Pen</code> — çizgi rengi ve kalınlığı. Seçili şekli farklı bir kalemle çizerek vurgulayacağız; bu yüzden kalemi parametre olarak alıyoruz.</li>
</ul>
<ol>
<li><code>Model</code> klasörüne sağ tık → <i>Add → Class</i>: <code>Geo.cs</code>. Adım 5'teki fonksiyonları <code>public static class Geo</code> içine koy.</li>
<li><code>Shape.cs</code>, <code>LineShape.cs</code>, <code>RectShape.cs</code>, <code>CircleShape.cs</code> dosyalarını oluştur (her sınıf kendi dosyasında — büyük projelerde standart).</li>
<li>Tarayıcıdaki mini <code>PointF</code> sınıfını <b>kopyalama</b>: WinForms'ta <code>System.Drawing.PointF</code> zaten var.</li>
<li>Derle (<b>Ctrl+Shift+B</b>). Hata listesini (<i>Error List</i>) sıfıra indir.</li>
</ol>
<p><code>DrawEllipse</code> merkez + yarıçap değil, <b>sınırlayıcı kutu</b> (sol üst köşe + genişlik + yükseklik) ister; aşağıdaki dönüşüme dikkat et.</p>`,
      code: cs`// Model/Shape.cs
using System.Drawing;

namespace Draw2D.Model;

public abstract class Shape
{
    public abstract void Draw(Graphics g, Pen pen);
    public abstract bool HitTest(PointF p, float tolerance);
}

// Model/LineShape.cs
public class LineShape : Shape
{
    public PointF A { get; set; }
    public PointF B { get; set; }
    public LineShape(PointF a, PointF b) { A = a; B = b; }

    public override void Draw(Graphics g, Pen pen) => g.DrawLine(pen, A, B);

    public override bool HitTest(PointF p, float tol) =>
        Geo.DistanceToSegment(p.X, p.Y, A.X, A.Y, B.X, B.Y) <= tol;
}

// Model/RectShape.cs
public class RectShape : Shape
{
    public PointF P1 { get; set; }
    public PointF P2 { get; set; }
    public RectShape(PointF p1, PointF p2) { P1 = p1; P2 = p2; }

    public RectangleF Bounds => RectangleF.FromLTRB(
        Math.Min(P1.X, P2.X), Math.Min(P1.Y, P2.Y),
        Math.Max(P1.X, P2.X), Math.Max(P1.Y, P2.Y));

    public override void Draw(Graphics g, Pen pen)
    {
        RectangleF r = Bounds;
        g.DrawRectangle(pen, r.X, r.Y, r.Width, r.Height);
    }

    public override bool HitTest(PointF p, float tol) { /* Adım 6'daki dört kenar testi */ }
}

// Model/CircleShape.cs
public class CircleShape : Shape
{
    public PointF Center { get; set; }
    public float Radius { get; set; }
    public CircleShape(PointF c, float r) { Center = c; Radius = r; }

    public override void Draw(Graphics g, Pen pen) =>
        g.DrawEllipse(pen, Center.X - Radius, Center.Y - Radius, Radius * 2, Radius * 2);

    public override bool HitTest(PointF p, float tol) =>
        Math.Abs(Geo.Distance(p.X, p.Y, Center.X, Center.Y) - Radius) <= tol;
}`,
      runnable: false,
      checklist: [
        'Geo.cs dosyasını oluşturup Distance ve DistanceToSegment fonksiyonlarını public static olarak taşıdım',
        'Shape, LineShape, RectShape ve CircleShape sınıflarını ayrı dosyalara yazdım',
        'Her şekle Draw(Graphics g, Pen pen) metodunu ekledim',
        'DrawEllipse için merkez/yarıçaptan sınırlayıcı kutu hesabını anladım',
        'Projeyi hatasız derledim (Ctrl+Shift+B)',
      ],
    },
    {
      title: 'Adım 8 — Çizim yüzeyi: Paint, Invalidate ve double buffering',
      body: `
<p>Windows'ta çizim "istediğin an çiz" diye çalışmaz. Doğru model şudur:</p>
<ol>
<li>Belge değişir (şekil eklendi, seçim değişti...).</li>
<li>Sen <code>canvas.Invalidate()</code> çağırırsın: "bu alan eskidi, yeniden çizilmeli".</li>
<li>Windows uygun anda <b>Paint</b> olayını tetikler ve sana bir <code>Graphics</code> verir.</li>
<li>Paint işleyicisi <b>tüm belgeyi baştan</b> çizer.</li>
</ol>
<p>Pencere küçültülüp büyütüldüğünde ya da üstüne başka pencere geldiğinde de Paint çağrılır; çizimin kaybolmamasının sebebi, ekranın değil <b>belgenin</b> kalıcı olmasıdır. <code>CreateGraphics()</code> ile doğrudan çizmek bu yüzden yanlıştır: ilk yeniden boyamada çizim silinir.</p>
<p><b>Titreme (flicker) sorunu:</b> Her Paint'te önce arka plan silinip sonra şekiller tek tek çizilirse, ekranda bir anlığına boş tuval görünür. <t en="double buffering" ja="ダブルバッファリング">Çift tamponlama</t>, çizimi önce bellekteki görünmez bir resme yapar ve bitince tek seferde ekrana kopyalar. <code>Panel</code>'in <code>DoubleBuffered</code> özelliği <code>protected</code> olduğu için küçük bir alt sınıf yazarız.</p>
<div class="callout tip">Oyun motorlarındaki "back buffer / swap" ile aynı fikir. Substance ya da Blender'ın viewport'u da görünmeyen bir tamponda çizip hazır kareyi gösterir.</div>`,
      code: cs`// Canvas.cs — titremeyen çizim yüzeyi
public class Canvas : Panel
{
    public Canvas()
    {
        DoubleBuffered = true;   // önce bellekte çiz, sonra tek seferde göster
        ResizeRedraw = true;     // boyut değişince yeniden çiz
        BackColor = Color.White;
    }
}

// Form1.cs
using System.Drawing.Drawing2D;
using Draw2D.Model;

public partial class Form1 : Form
{
    private readonly List<Shape> shapes = new List<Shape>();   // belge modeli
    private readonly Canvas canvas = new Canvas { Dock = DockStyle.Fill };

    public Form1()
    {
        InitializeComponent();
        Controls.Add(canvas);
        canvas.BringToFront();          // araç çubuğunun altında kalan alanı doldursun
        canvas.Paint += Canvas_Paint;

        // Geçici test verisi: Paint'in çalıştığını görmek için
        shapes.Add(new LineShape(new PointF(50, 50), new PointF(300, 120)));
        shapes.Add(new CircleShape(new PointF(400, 250), 80));
    }

    private void Canvas_Paint(object? sender, PaintEventArgs e)
    {
        Graphics g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;   // yumuşak kenarlar
        using var pen = new Pen(Color.Black, 2);
        foreach (Shape s in shapes)
            s.Draw(g, pen);
    }
}`,
      runnable: false,
      checklist: [
        'DoubleBuffered = true olan Canvas sınıfını yazdım',
        'Canvas\'ı Form1\'e Dock = Fill ile ekledim ve Paint olayına bağladım',
        'Test şekillerinin pencerede göründüğünü, pencereyi boyutlandırınca kaybolmadığını gördüm',
        'Pen nesnelerini using ile oluşturdum (GDI kaynakları serbest bırakılmalı)',
        'Neden CreateGraphics() yerine Paint + Invalidate() kullandığımı açıklayabiliyorum',
      ],
    },
    {
      title: 'Adım 9 — Fare durum makinesi (saf mantık)',
      body: `
<p>Çizim aracı üç fare olayıyla çalışır: <b>bas</b> (başlangıç noktası), <b>sürükle</b> (önizleme — "lastik bant" / <t en="rubber band" ja="ラバーバンド">rubber band</t>), <b>bırak</b> (şekli belgeye ekle). Hangi olayın ne anlama geldiği <b>o anki duruma</b> bağlıdır: fare basılı değilken hareket etmek hiçbir şey çizmemeli. Buna <t en="state machine" ja="状態遷移">durum makinesi</t> denir.</p>
<svg viewBox="0 0 560 150" role="img" aria-label="Boşta ve Çiziyor durumları arasındaki geçişler">
  <defs><marker id="ar-p2b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <rect x="40" y="50" width="150" height="56" rx="28" class="box"/><text x="115" y="83" class="t1">Boşta</text>
    <rect x="370" y="50" width="150" height="56" rx="28" class="box hi"/><text x="445" y="83" class="t1">Çiziyor</text>
    <path d="M190,62 C260,20 300,20 370,62" fill="none" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p2b)"/>
    <text x="280" y="22" class="t2">MouseDown: başlangıcı kaydet</text>
    <path d="M370,96 C300,140 260,140 190,96" fill="none" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p2b)"/>
    <text x="280" y="146" class="t2">MouseUp: şekli ekle (çok küçükse iptal)</text>
    <text x="445" y="40" class="t3">MouseMove: önizlemeyi güncelle</text>
  </g>
</svg>
<p>Bu mantığı Form'un içine gömmek yerine ayrı bir <code>DrawingController</code> sınıfına koyacağız. Form sadece olayları ona iletecek. Kazancı: mantığı burada, pencere açmadan test edebiliriz.</p>
<p><b>Çok küçük sürükleme:</b> Kullanıcı yanlışlıkla tıklayıp bırakırsa sıfır uzunluklu çizgi oluşmamalı. Başlangıç ile bitiş arası 2 birimden kısaysa şekli eklemeyiz.</p>`,
      exercise: {
        title: 'DrawingController',
        prompt: `
<p><code>DrawingController</code> sınıfındaki üç metodu tamamla:</p>
<ul>
<li><code>MouseDown(p)</code>: çizmeye başla (<code>isDrawing = true</code>), başlangıç noktasını sakla.</li>
<li><code>MouseMove(p)</code>: çizmiyorsa hiçbir şey yapma; çiziyorsa <code>Preview = CreateShape(start, p)</code>.</li>
<li><code>MouseUp(p)</code>: çizmiyorsa hiçbir şey yapma. Çiziyorsa: başlangıç–bitiş uzaklığı 2 veya daha fazlaysa <code>CreateShape(start, p)</code> sonucunu <code>Shapes</code>'e ekle. Her durumda çizmeyi bitir ve <code>Preview = null</code> yap.</li>
</ul>
<p><code>CreateShape</code> hazır: aracın türüne göre çizgi, dikdörtgen ya da daire (merkez = başlangıç, yarıçap = sürükleme uzunluğu) üretir.</p>`,
        starter: cs`var c = new DrawingController();
c.MouseDown(new PointF(0, 0));
c.MouseMove(new PointF(10, 5));
c.MouseUp(new PointF(20, 10));
Console.WriteLine("Şekil sayısı: " + c.Shapes.Count);

enum Tool { Line, Rect, Circle }

class DrawingController
{
    public Tool CurrentTool { get; set; } = Tool.Line;
    public List<Shape> Shapes { get; } = new List<Shape>();
    public Shape? Preview { get; private set; }

    private bool isDrawing = false;
    private PointF start = new PointF(0, 0);

    public void MouseDown(PointF p)
    {
    }

    public void MouseMove(PointF p)
    {
    }

    public void MouseUp(PointF p)
    {
    }

    private Shape CreateShape(PointF a, PointF b)
    {
        switch (CurrentTool)
        {
            case Tool.Rect: return new RectShape(a, b);
            case Tool.Circle: return new CircleShape(a, (float)Geo.Distance(a.X, a.Y, b.X, b.Y));
            default: return new LineShape(a, b);
        }
    }
}

` + SHAPES_BASE + `

` + RECT_FULL + `

` + GEO + `

` + POINTF,
        checks: [
          { type: 'output', expect: 'Şekil sayısı: 1', msg: 'Bas → sürükle → bırak bir şekil eklemeli' },
          { type: 'harness', append: cs`var d = new DrawingController();
d.MouseMove(new PointF(5, 5));
Console.WriteLine(d.Preview == null);
d.MouseUp(new PointF(9, 9));
Console.WriteLine(d.Shapes.Count);`, expect: 'True\n0', msg: 'Fare basılı değilken hareket/bırakma hiçbir şey yapmamalı' },
          { type: 'harness', append: cs`var d = new DrawingController();
d.MouseDown(new PointF(0, 0));
d.MouseMove(new PointF(10, 5));
Console.WriteLine(d.Preview);
d.MouseMove(new PointF(30, 15));
Console.WriteLine(d.Preview);
Console.WriteLine(d.Shapes.Count);
d.MouseUp(new PointF(40, 20));
Console.WriteLine(d.Shapes.Count + " | " + d.Shapes[0]);
Console.WriteLine(d.Preview == null);`, expect: 'Line (0,0)-(10,5)\nLine (0,0)-(30,15)\n0\n1 | Line (0,0)-(40,20)\nTrue', msg: 'Sürüklerken önizleme güncellenmeli, bırakınca şekil eklenip önizleme silinmeli' },
          { type: 'harness', append: cs`var d = new DrawingController();
d.CurrentTool = Tool.Circle;
d.MouseDown(new PointF(50, 50));
d.MouseUp(new PointF(53, 54));
d.CurrentTool = Tool.Rect;
d.MouseDown(new PointF(10, 10));
d.MouseUp(new PointF(0, 30));
foreach (var s in d.Shapes) Console.WriteLine(s);`, expect: 'Circle (50,50) r=5.00\nRect (10,10)-(0,30)', msg: 'Seçili araca göre doğru şekil türü oluşmalı' },
          { type: 'harness', append: cs`var d = new DrawingController();
d.MouseDown(new PointF(1, 1));
d.MouseMove(new PointF(2, 1));
d.MouseUp(new PointF(2.5f, 1));
Console.WriteLine(d.Shapes.Count + " " + (d.Preview == null));
d.MouseUp(new PointF(80, 80));
Console.WriteLine(d.Shapes.Count);`, expect: '0 True\n0', msg: '2 birimden kısa sürükleme iptal edilmeli ve çizim durumu sıfırlanmalı' },
        ],
        hints: [
          '<code>MouseDown</code> iki satır: <code>isDrawing = true; start = p;</code> — <code>MouseMove</code> ve <code>MouseUp</code> ise <code>if (!isDrawing) return;</code> ile başlamalı.',
          '<code>MouseMove</code>: <code>Preview = CreateShape(start, p);</code> <code>MouseUp</code>\'ta uzunluk: <code>Geo.Distance(start.X, start.Y, p.X, p.Y)</code>',
          '<code>MouseUp</code> gövdesi: kontrol, <code>if (uzunluk &gt;= 2) Shapes.Add(CreateShape(start, p));</code>, sonra <code>isDrawing = false; Preview = null;</code> (bu iki satır <code>if</code>\'in dışında olmalı).',
        ],
        solution: cs`var c = new DrawingController();
c.MouseDown(new PointF(0, 0));
c.MouseMove(new PointF(10, 5));
c.MouseUp(new PointF(20, 10));
Console.WriteLine("Şekil sayısı: " + c.Shapes.Count);

enum Tool { Line, Rect, Circle }

class DrawingController
{
    public Tool CurrentTool { get; set; } = Tool.Line;
    public List<Shape> Shapes { get; } = new List<Shape>();
    public Shape? Preview { get; private set; }

    private bool isDrawing = false;
    private PointF start = new PointF(0, 0);

    public void MouseDown(PointF p)
    {
        isDrawing = true;
        start = p;
    }

    public void MouseMove(PointF p)
    {
        if (!isDrawing) return;
        Preview = CreateShape(start, p);
    }

    public void MouseUp(PointF p)
    {
        if (!isDrawing) return;
        double length = Geo.Distance(start.X, start.Y, p.X, p.Y);
        if (length >= 2) Shapes.Add(CreateShape(start, p));
        isDrawing = false;
        Preview = null;
    }

    private Shape CreateShape(PointF a, PointF b)
    {
        switch (CurrentTool)
        {
            case Tool.Rect: return new RectShape(a, b);
            case Tool.Circle: return new CircleShape(a, (float)Geo.Distance(a.X, a.Y, b.X, b.Y));
            default: return new LineShape(a, b);
        }
    }
}

` + SHAPES_BASE + `

` + RECT_FULL + `

` + GEO + `

` + POINTF,
        explain: 'Durum makinesi, "aynı olay, duruma göre farklı anlam" problemini tek bir <code>bool</code> ile çözdü. Daha karmaşık araçlarda (çok noktalı polyline, taşıma, döndürme) <code>enum State { Idle, PickingFirst, PickingSecond }</code> gibi daha fazla durum olur; Proje 5\'te tam olarak bunu yapacaksın.',
      },
    },
    {
      title: 'Adım 10 — Visual Studio: fare olaylarını ve araç çubuğunu bağla',
      body: `
<p>Şimdi controller'ı forma bağlıyoruz. Form, olayları controller'a iletir ve sonra <code>Invalidate()</code> der — hepsi bu.</p>
<ol>
<li><code>DrawingController.cs</code>'yi <code>Tools</code> klasörüne ekle (Adım 9'daki çözüm; mini <code>PointF</code> sınıfı hariç).</li>
<li><b>Toolbox → ToolStrip</b>'i forma sürükle (üste yapışır). Üzerine 4 buton ekle: <b>Seç</b>, <b>Çizgi</b>, <b>Dikdörtgen</b>, <b>Daire</b>. Her birinin <code>DisplayStyle</code>'ını <code>Text</code> yap, <code>(Name)</code>'lerini <code>btnSelect</code>, <code>btnLine</code>, <code>btnRect</code>, <code>btnCircle</code> ver.</li>
<li>Her butona çift tıklayıp aşağıdaki gibi <code>SetTool</code> çağır. Aktif aracı göstermek için <code>Checked</code> özelliğini kullan.</li>
<li>Canvas'ın <code>MouseDown</code>, <code>MouseMove</code>, <code>MouseUp</code> olaylarını kodda bağla.</li>
</ol>
<p>Önizleme şeklini gri, kesikli bir kalemle çiz: kullanıcı "henüz bitmedi" olduğunu anlamalı. Sağ tuş ya da orta tuş basılırsa çizim başlamamalı (<code>e.Button</code> kontrolü).</p>`,
      code: cs`// Form1.cs (eklemeler)
private readonly DrawingController controller = new DrawingController();

public Form1()
{
    InitializeComponent();
    Controls.Add(canvas);
    canvas.BringToFront();
    canvas.Paint += Canvas_Paint;
    canvas.MouseDown += Canvas_MouseDown;
    canvas.MouseMove += Canvas_MouseMove;
    canvas.MouseUp += Canvas_MouseUp;
    SetTool(Tool.Line);
}

private void SetTool(Tool tool)
{
    controller.CurrentTool = tool;
    btnLine.Checked = tool == Tool.Line;
    btnRect.Checked = tool == Tool.Rect;
    btnCircle.Checked = tool == Tool.Circle;
}

private void btnLine_Click(object sender, EventArgs e) => SetTool(Tool.Line);
private void btnRect_Click(object sender, EventArgs e) => SetTool(Tool.Rect);
private void btnCircle_Click(object sender, EventArgs e) => SetTool(Tool.Circle);

private void Canvas_MouseDown(object? sender, MouseEventArgs e)
{
    if (e.Button != MouseButtons.Left) return;
    controller.MouseDown(new PointF(e.X, e.Y));
    canvas.Invalidate();
}

private void Canvas_MouseMove(object? sender, MouseEventArgs e)
{
    controller.MouseMove(new PointF(e.X, e.Y));
    canvas.Invalidate();
}

private void Canvas_MouseUp(object? sender, MouseEventArgs e)
{
    if (e.Button != MouseButtons.Left) return;
    controller.MouseUp(new PointF(e.X, e.Y));
    canvas.Invalidate();
}

private void Canvas_Paint(object? sender, PaintEventArgs e)
{
    Graphics g = e.Graphics;
    g.SmoothingMode = SmoothingMode.AntiAlias;
    using var pen = new Pen(Color.Black, 2);
    foreach (Shape s in controller.Shapes)
        s.Draw(g, pen);

    if (controller.Preview != null)
    {
        using var previewPen = new Pen(Color.Gray, 1) { DashStyle = DashStyle.Dash };
        controller.Preview.Draw(g, previewPen);
    }
}`,
      runnable: false,
      checklist: [
        'ToolStrip ve dört araç butonunu ekleyip isimlendirdim',
        'SetTool ile aktif aracı değiştirip Checked ile gösterdim',
        'Canvas fare olaylarını DrawingController\'a ilettim',
        'Sürüklerken kesikli gri önizlemeyi, bırakınca kalıcı şekli gördüm',
        'Üç araçla da çizim yapıp test ettim; çok kısa tıklamaların şekil oluşturmadığını doğruladım',
      ],
    },
    {
      title: 'Adım 11 — Seçim vurgusu, Delete tuşu ve son dokunuşlar',
      body: `
<p>Son adımda <b>Seç</b> aracını ekliyoruz. <code>DrawingController</code>'a bir <code>Selected</code> özelliği ve <code>Tool.Select</code> değeri ekle; seç modunda <code>MouseDown</code> çizime başlamak yerine Adım 6'daki <code>PickTopmost</code> ile şekil seçer.</p>
<ul>
<li><b>Vurgu:</b> Paint'te seçili şekli mavi ve kalın bir kalemle çiz. Kullanıcı neyin seçili olduğunu her an görmeli.</li>
<li><b>Delete:</b> Formun <code>KeyPreview</code> özelliğini <code>true</code> yap; böylece odak ToolStrip'teyken bile tuşlar önce forma gelir. <code>KeyDown</code>'da <code>Keys.Delete</code> gelirse seçili şekli listeden çıkar.</li>
<li><b>Esc:</b> Çizim yarıdaysa iptal etsin, değilse seçimi kaldırsın.</li>
<li><b>Durum çubuğu:</b> <code>StatusStrip</code> + <code>ToolStripStatusLabel</code> ile imleç koordinatlarını ve şekil sayısını göster. Kullanıcıya geri bildirim, profesyonel his verir.</li>
</ul>
<div class="callout tip">CAD bağlantısı: Neredeyse tüm CAD programlarında seçili nesne farklı renkte ya da kesikli gösterilir ve tutamaçlar (<t en="grip" ja="グリップ">grip</t>) belirir. Tutamaçlarla düzenlemeyi "uzantılar" listesinde bulacaksın.</div>`,
      code: cs`// DrawingController.cs (eklemeler)
public Shape? Selected { get; private set; }

public void MouseDown(PointF p)
{
    if (CurrentTool == Tool.Select)
    {
        int index = Geo.PickTopmost(Shapes, p, 5f);   // Adım 6 (Geo içine taşındı)
        Selected = index >= 0 ? Shapes[index] : null;
        return;
    }
    isDrawing = true;
    start = p;
}

public void DeleteSelected()
{
    if (Selected == null) return;
    Shapes.Remove(Selected);
    Selected = null;
}

public void Cancel()
{
    if (isDrawing) { isDrawing = false; Preview = null; }
    else Selected = null;
}

// Form1.cs (eklemeler)
public Form1()
{
    // ... önceki satırlar
    KeyPreview = true;
    KeyDown += Form1_KeyDown;
}

private void Form1_KeyDown(object? sender, KeyEventArgs e)
{
    if (e.KeyCode == Keys.Delete) controller.DeleteSelected();
    else if (e.KeyCode == Keys.Escape) controller.Cancel();
    else return;
    canvas.Invalidate();
    UpdateStatus();
}

private void Canvas_MouseMove(object? sender, MouseEventArgs e)
{
    controller.MouseMove(new PointF(e.X, e.Y));
    lblStatus.Text = $"X: {e.X}  Y: {e.Y}   |   Şekil: {controller.Shapes.Count}";
    canvas.Invalidate();
}

// Canvas_Paint içinde: seçili şekli farklı kalemle çiz
using var selectedPen = new Pen(Color.DodgerBlue, 3);
foreach (Shape s in controller.Shapes)
    s.Draw(g, s == controller.Selected ? selectedPen : pen);`,
      runnable: false,
      checklist: [
        'Tool enum\'una Select ekledim ve Seç butonunu bağladım',
        'Seçili şekil mavi ve kalın çiziliyor',
        'KeyPreview = true ile Delete tuşu seçili şekli siliyor',
        'Esc çizimi iptal ediyor ya da seçimi kaldırıyor',
        'StatusStrip\'te imleç koordinatları ve şekil sayısı görünüyor',
        'Üst üste binen şekillerde en üstteki seçiliyor (Adım 6\'yı gerçek uygulamada doğruladım)',
      ],
    },
  ],
  finalChecklist: [
    'GitHub deposu: "draw2d-winforms" gibi açık bir isim, .gitignore (Visual Studio şablonu) eklendi, bin/obj klasörleri yüklenmedi',
    'README.md: özellikler, kullanılan teknolojiler (C#, .NET 8, WinForms, System.Drawing), nasıl derlenip çalıştırılacağı',
    'README\'ye çizim → seçim → silme akışını gösteren kısa bir GIF ekledim (ör. ScreenToGif ile)',
    'README\'de mimari bölümü: Model (Shape, Geo) / Tools (DrawingController) / View (Canvas, Form1) ayrımı',
    'Hit testing algoritmasını (nokta–doğru parçası uzaklığı, t\'nin [0,1]\'e kırpılması) README\'de bir şekille açıkladım',
    'Kod: her sınıf kendi dosyasında, anlamlı isimler, kullanılmayan using ve test kodu temizlendi',
    'Uygulamayı son kez baştan sona denedim: üç araç, seçim, Delete, Esc, pencereyi boyutlandırma',
  ],
  extensions: [
    'Pencere ile seçim: boş alanda sürükleyerek dikdörtgen çiz ve içindeki tüm şekilleri seç (PointInRect)',
    'Tutamaçlarla (grip) düzenleme: seçili çizginin uç noktalarını sürükleyerek değiştir',
    'Çoklu seçim: Shift + tıklama ile seçime ekle/çıkar',
    'Renk ve çizgi kalınlığı seçimi (ColorDialog, NumericUpDown) — Shape\'e Color ve Width özellikleri ekle',
    'Polyline aracı: her tıklamada nokta ekle, çift tıklama ile bitir (yeni durumlar gerektirir)',
    'Fare tekerleği ile yakınlaştırma ve orta tuşla kaydırma (Proje 5\'e hazırlık)',
  ],
  vocab: [
    { en: 'Drawing / Drafting', tr: 'Çizim', ja: '作図', kana: 'さくず', romaji: 'sakuzu' },
    { en: 'Shape', tr: 'Şekil', ja: '図形', kana: 'ずけい', romaji: 'zukei' },
    { en: 'Line', tr: 'Çizgi', ja: '線', kana: 'せん', romaji: 'sen' },
    { en: 'Line segment', tr: 'Doğru parçası', ja: '線分', kana: 'せんぶん', romaji: 'senbun' },
    { en: 'Rectangle', tr: 'Dikdörtgen', ja: '長方形', kana: 'ちょうほうけい', romaji: 'chōhōkei' },
    { en: 'Circle', tr: 'Daire / Çember', ja: '円', kana: 'えん', romaji: 'en' },
    { en: 'Selection', tr: 'Seçim', ja: '選択', kana: 'せんたく', romaji: 'sentaku' },
    { en: 'Delete', tr: 'Silmek', ja: '削除', kana: 'さくじょ', romaji: 'sakujo' },
    { en: 'Inheritance', tr: 'Kalıtım', ja: '継承', kana: 'けいしょう', romaji: 'keishō' },
    { en: 'Abstract class', tr: 'Soyut sınıf', ja: '抽象クラス', kana: 'ちゅうしょうクラス', romaji: 'chūshō kurasu' },
    { en: 'Event', tr: 'Olay', ja: 'イベント', kana: 'イベント', romaji: 'ibento' },
    { en: 'Coordinate', tr: 'Koordinat', ja: '座標', kana: 'ざひょう', romaji: 'zahyō' },
  ],
};
