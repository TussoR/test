import { cs } from '../helpers.js';

// --- Ortak model sınıfları (sonraki başlangıç kodlarında hazır verilir) ---
const P2D = cs`class Point2D
{
    public double X { get; }
    public double Y { get; }
    public Point2D(double x, double y) { X = x; Y = y; }
    static string F(double v) => (Math.Abs(v) < 0.005 ? 0.0 : v).ToString("F2");
    public override string ToString() => "(" + F(X) + ", " + F(Y) + ")";
}`;

const MODEL = cs`class Layer
{
    public string Name { get; }
    public bool Visible { get; set; } = true;
    public bool Locked { get; set; } = false;
    public Layer(string name) { Name = name; }
}

abstract class Entity
{
    public string Id { get; }
    public Layer Layer { get; set; }
    protected Entity(string id, Layer layer) { Id = id; Layer = layer; }
    public abstract List<Point2D> SnapPoints();
    public abstract void Move(double dx, double dy);
    public abstract string ToLine();
    // Visual Studio'da: v.ToString(CultureInfo.InvariantCulture)
    protected static string N(double v) => v.ToString();
}

class LineEntity : Entity
{
    public Point2D A { get; private set; }
    public Point2D B { get; private set; }
    public LineEntity(string id, Layer layer, Point2D a, Point2D b) : base(id, layer) { A = a; B = b; }
    public override List<Point2D> SnapPoints() => new List<Point2D> { A, B };
    public override void Move(double dx, double dy)
    {
        A = new Point2D(A.X + dx, A.Y + dy);
        B = new Point2D(B.X + dx, B.Y + dy);
    }
    public override string ToLine() => "LINE;" + Id + ";" + Layer.Name + ";" + N(A.X) + ";" + N(A.Y) + ";" + N(B.X) + ";" + N(B.Y);
}

class RectEntity : Entity
{
    public Point2D P1 { get; private set; }
    public Point2D P2 { get; private set; }
    public RectEntity(string id, Layer layer, Point2D p1, Point2D p2) : base(id, layer) { P1 = p1; P2 = p2; }
    public override List<Point2D> SnapPoints() =>
        new List<Point2D> { P1, new Point2D(P2.X, P1.Y), P2, new Point2D(P1.X, P2.Y) };
    public override void Move(double dx, double dy)
    {
        P1 = new Point2D(P1.X + dx, P1.Y + dy);
        P2 = new Point2D(P2.X + dx, P2.Y + dy);
    }
    public override string ToLine() => "RECT;" + Id + ";" + Layer.Name + ";" + N(P1.X) + ";" + N(P1.Y) + ";" + N(P2.X) + ";" + N(P2.Y);
}

class CircleEntity : Entity
{
    public Point2D Center { get; private set; }
    public double Radius { get; }
    public CircleEntity(string id, Layer layer, Point2D c, double r) : base(id, layer) { Center = c; Radius = r; }
    public override List<Point2D> SnapPoints() => new List<Point2D>
    {
        Center,
        new Point2D(Center.X + Radius, Center.Y), new Point2D(Center.X, Center.Y + Radius),
        new Point2D(Center.X - Radius, Center.Y), new Point2D(Center.X, Center.Y - Radius),
    };
    public override void Move(double dx, double dy) { Center = new Point2D(Center.X + dx, Center.Y + dy); }
    public override string ToLine() => "CIRCLE;" + Id + ";" + Layer.Name + ";" + N(Center.X) + ";" + N(Center.Y) + ";" + N(Radius);
}`;

const DOCUMENT = cs`class Document
{
    public List<Entity> Entities { get; } = new List<Entity>();
    public Dictionary<string, Layer> Layers { get; } = new Dictionary<string, Layer>();

    public Layer GetLayer(string name)
    {
        if (!Layers.ContainsKey(name)) Layers[name] = new Layer(name);
        return Layers[name];
    }

    public override string ToString() => "[" + string.Join(", ", Entities.Select(e => e.Id)) + "]";
}`;

const COMMANDS_GIVEN = cs`interface ICommand
{
    string Name { get; }
    void Execute();
    void Undo();
}

class AddEntityCommand : ICommand
{
    private readonly Document doc;
    private readonly Entity entity;
    public AddEntityCommand(Document doc, Entity entity) { this.doc = doc; this.entity = entity; }
    public string Name => "Ekle " + entity.Id;
    public void Execute() => doc.Entities.Add(entity);
    public void Undo() => doc.Entities.Remove(entity);
}

class MoveCommand : ICommand
{
    private readonly Entity entity;
    private readonly double dx, dy;
    public MoveCommand(Entity entity, double dx, double dy) { this.entity = entity; this.dx = dx; this.dy = dy; }
    public string Name => "Taşı " + entity.Id;
    public void Execute() => entity.Move(dx, dy);
    public void Undo() => entity.Move(-dx, -dy);
}`;

const SNAPVALUE = cs`double SnapValue(double v, double grid)
{
    return Math.Round(v / grid, MidpointRounding.AwayFromZero) * grid;
}`;

export default {
  kind: 'project',
  id: 'p5',
  module: 'm8',
  title: 'Proje 5: Mini CAD Uygulaması',
  titleEn: 'Mini CAD Application',
  titleJa: 'ミニCAD',
  minutes: 1800,
  level: 5,
  environment: 'desktop',
  demo: 'minicad',
  summary: `
<p>Portfolyonun en büyük parçası: P2–P4'te öğrendiklerini birleştiren, <b>gerçek bir CAD programının iskeletine</b> sahip bir WinForms uygulaması. Çizim, seçim, taşıma, bir <t en="base point" ja="基点">taban noktası</t> etrafında döndürme ve silme; <t en="layer" ja="レイヤー">katmanlar</t>; ızgaraya ve uç noktalara <t en="snap" ja="スナップ">yakalama</t>; mesafe, açı ve alan <t en="measurement" ja="計測">ölçüm</t> araçları; <b>Geri Al / Yinele</b>; milimetre cinsinden imleç koordinatlı durum çubuğu; dosyaya kaydetme ve açma.</p>
<p>Bu projede asıl öğrendiğin şey <b>mimari</b>: belge modeli, komutlar ve görünüm birbirinden ayrı. Her hesaplama ve model sınıfı (döndürme, yakalama, ölçüm, alan, komut yığınları, dosya biçimi) önce burada alıştırmalarla yazılıp test edilir; sonra Visual Studio'da arayüze bağlanır. Sonunda bu projeyi bir Japon teknik mülakatında anlatmaya hazır olacaksın.</p>`,
  goals: [
    'Bir uygulamayı Document / Commands / Tools / View katmanlarına ayırarak tasarlamak',
    'Noktayı taban noktası etrafında döndürmek; ekran ↔ dünya (mm) dönüşümü yapmak',
    'Izgara ve uç nokta yakalamayı öncelik sırasıyla uygulamak (katman görünürlüğüne saygı göstererek)',
    'Mesafe, açı (derece) ve poligon alanını (shoelace formülü) hesaplamak',
    'Komut deseni (Command pattern) ve iki yığınla Geri Al / Yinele sistemi kurmak',
    'Belgeyi metin biçiminde kaydedip hatalı satırlara dayanıklı şekilde geri okumak',
    'Projeyi README, mimari şema ve Japonca açıklamayla portfolyoya hazırlamak',
  ],
  skills: ['Katmanlı mimari', 'Komut deseni (Command pattern)', 'Stack ile Undo/Redo', 'Dictionary', 'Durum makinesi araçları', 'Ekran ↔ dünya dönüşümü', 'Snap algoritmaları', 'Shoelace alan formülü', 'Serileştirme / ayrıştırma', 'System.Text.Json', 'WinForms MenuStrip, ToolStrip, StatusStrip'],
  steps: [
    {
      title: 'Adım 1 — Mimari: Document / Commands / Tools / View',
      body: `
<p>Kod yazmadan önce iskelet. Büyük masaüstü yazılımlarının hepsi bir şekilde "veri ile ekranı ayırır". Bu projede dört katman var:</p>
<svg viewBox="0 0 680 230" role="img" aria-label="Mini CAD katmanları ve veri akışı">
  <defs><marker id="ar-p5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker></defs>
  <g font-size="13" text-anchor="middle">
    <rect x="10" y="20" width="150" height="70" rx="10" class="box"/><text x="85" y="48" class="t1">View</text><text x="85" y="68" class="t2">Form, Viewport, çizim</text>
    <rect x="190" y="20" width="150" height="70" rx="10" class="box"/><text x="265" y="48" class="t1">Tools</text><text x="265" y="68" class="t2">Line, Move, Rotate...</text>
    <rect x="370" y="20" width="150" height="70" rx="10" class="box"/><text x="445" y="48" class="t1">Commands</text><text x="445" y="68" class="t2">ICommand, Undo/Redo</text>
    <rect x="550" y="20" width="120" height="70" rx="10" class="box hi"/><text x="610" y="48" class="t1">Document</text><text x="610" y="68" class="t2">Layers, Entities</text>
    <line x1="160" y1="55" x2="188" y2="55" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p5)"/>
    <line x1="340" y1="55" x2="368" y2="55" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p5)"/>
    <line x1="520" y1="55" x2="548" y2="55" stroke="var(--accent)" stroke-width="2" marker-end="url(#ar-p5)"/>
    <path d="M610,90 C610,150 85,150 85,92" fill="none" stroke="var(--accent-2)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#ar-p5)"/>
    <text x="350" y="140" class="t3">View, Document'ı okuyup çizer (Paint)</text>
    <rect x="190" y="170" width="150" height="50" rx="10" class="box dim"/><text x="265" y="200" class="t2">Geometry (Geo, Snap)</text>
    <rect x="370" y="170" width="150" height="50" rx="10" class="box dim"/><text x="445" y="200" class="t2">IO (Serializer)</text>
  </g>
</svg>
<ul>
<li><b>Document:</b> katmanlar ve varlıklar (<t en="entity" ja="エンティティ">entity</t>: çizgi, dikdörtgen, daire). Windows Forms'u hiç bilmez.</li>
<li><b>Commands:</b> belgeyi değiştirmenin <b>tek</b> yolu. Her değişiklik bir komut nesnesidir ve geri alınabilir.</li>
<li><b>Tools:</b> fare tıklamalarını komutlara çeviren durum makineleri (P2'deki DrawingController'ın büyümüş hâli).</li>
<li><b>View:</b> Form, Viewport (zoom/pan, ekran ↔ dünya), çizim. Belgeyi okur, değiştirmez.</li>
</ul>
<p>Visual Studio'da <b>Windows Forms App (.NET 8)</b>: <code>MiniCad</code>. Klasörler: <code>Model</code>, <code>Commands</code>, <code>Tools</code>, <code>Geometry</code>, <code>IO</code>, <code>View</code>. Kural: <code>Model</code>, <code>Commands</code>, <code>Geometry</code> ve <code>IO</code> içinde <code>using System.Windows.Forms;</code> <b>olmamalı</b>. İleride bunları ayrı bir Class Library'ye taşıyabilmen bu kurala bağlı.</p>`,
      checklist: [
        'Dört katmanın (Document, Commands, Tools, View) sorumluluklarını kendi cümlelerimle yazabiliyorum',
        'MiniCad adlı Windows Forms App (.NET 8) projesini oluşturdum',
        'Model, Commands, Tools, Geometry, IO, View klasörlerini ekledim',
        'Git deposunu başlatıp ilk commit\'i attım',
        'Model/Commands/Geometry/IO\'da WinForms kullanmama kuralını not ettim',
      ],
    },
    {
      title: 'Adım 2 — Taban noktası etrafında döndürme',
      body: `
<p>P3'te noktaları <b>orijin</b> etrafında döndürdük. CAD'de ise kullanıcı bir <b>taban noktası</b> (<t en="base point" ja="基点">基点</t>) seçer ve nesne o nokta etrafında döner: bir kapıyı menteşesi etrafında döndürmek gibi.</p>
<p>Hile basit: <b>taşı → döndür → geri taşı</b>.</p>
<ol>
<li>Noktayı, taban noktası orijine gelecek şekilde kaydır: <code>d = p − taban</code></li>
<li><code>d</code>'yi orijin etrafında döndür (P3'teki RotateZ formülü)</li>
<li>Geri kaydır: <code>sonuç = d' + taban</code></li>
</ol>
<p>Bu "önce orijine taşı, işlemi yap, geri taşı" kalıbı, ölçekleme (scale around point) ve aynalama (mirror) için de aynen geçerlidir. Blender'daki <b>Pivot Point</b> ayarı tam olarak bunun "taban"ını seçer.</p>
<p>Bu projede dünya koordinatları <b>Y yukarı</b> ve birim <b>mm</b>'dir (ekrandaki Y aşağı sistemi Adım 3'te çevireceğiz); pozitif açı saat yönünün tersidir.</p>`,
      exercise: {
        title: 'RotateAround',
        prompt: `
<p><code>Point2D RotateAround(Point2D p, Point2D basePt, double degrees)</code> fonksiyonunu yaz.</p>
<pre class="expected">RotateAround((2, 0), (1, 0), 90)   → (1.00, 1.00)
RotateAround((5, 5), (0, 0), 180)  → (-5.00, -5.00)
RotateAround((3, 1), (1, 1), -90)  → (1.00, -1.00)</pre>`,
        starter: cs`Point2D RotateAround(Point2D p, Point2D basePt, double degrees)
{
    // 1) tabana göre kaydır  2) döndür  3) geri kaydır
    return p;
}

Console.WriteLine(RotateAround(new Point2D(2, 0), new Point2D(1, 0), 90));

` + P2D,
        checks: [
          { type: 'output', expect: '(1.00, 1.00)', msg: '(2, 0) noktası (1, 0) etrafında 90° dönünce (1, 1) olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(RotateAround(new Point2D(5, 5), new Point2D(0, 0), 180));
Console.WriteLine(RotateAround(new Point2D(3, 1), new Point2D(1, 1), -90));
Console.WriteLine(RotateAround(new Point2D(4, 3), new Point2D(1, 1), 45));`, expect: '(-5.00, -5.00)\n(1.00, -1.00)\n(1.71, 4.54)', msg: 'Farklı taban noktaları ve açılarla doğru dönmeli' },
          { type: 'harness', append: cs`var b = new Point2D(7, -2);
Console.WriteLine(RotateAround(b, b, 33));
Console.WriteLine(RotateAround(new Point2D(10, 0), new Point2D(0, 0), 360));`, expect: '(7.00, -2.00)\n(10.00, 0.00)', msg: 'Taban noktasının kendisi yerinde kalmalı; 360° başa dönmeli' },
          { type: 'harness', append: cs`var p = new Point2D(1000, 500);
var q = RotateAround(RotateAround(p, new Point2D(200, 300), 37), new Point2D(200, 300), -37);
Console.WriteLine(q);`, expect: '(1000.00, 500.00)', msg: 'Ters açıyla döndürmek noktayı geri getirmeli' },
        ],
        hints: [
          'Önce farkı al: <code>double dx = p.X - basePt.X, dy = p.Y - basePt.Y;</code> ve açıyı radyana çevir.',
          'Döndürülmüş fark: <code>rx = dx * cos - dy * sin</code>, <code>ry = dx * sin + dy * cos</code>.',
          'Son adım: <code>return new Point2D(basePt.X + rx, basePt.Y + ry);</code>',
        ],
        solution: cs`Point2D RotateAround(Point2D p, Point2D basePt, double degrees)
{
    double a = degrees * Math.PI / 180;
    double c = Math.Cos(a), s = Math.Sin(a);
    double dx = p.X - basePt.X, dy = p.Y - basePt.Y;
    double rx = dx * c - dy * s;
    double ry = dx * s + dy * c;
    return new Point2D(basePt.X + rx, basePt.Y + ry);
}

Console.WriteLine(RotateAround(new Point2D(2, 0), new Point2D(1, 0), 90));

` + P2D,
        explain: '"Taşı → işlem → geri taşı" kalıbı, matrislerle <code>T(taban) · R · T(−taban)</code> diye yazılır. P3\'teki Matrix4 ile bu üç matrisi çarparsan tek bir "taban etrafında döndür" matrisi elde edersin.',
      },
    },
    {
      title: 'Adım 3 — Ekran ↔ dünya dönüşümü ve ızgara yakalama',
      body: `
<p>CAD'de çizim <b>gerçek birimlerle</b> (mm) yapılır; ekran ise pikseldir ve Y aşağı doğru artar. Aradaki köprü <b>Viewport</b>'tur:</p>
<pre>Zoom  = 1 mm kaç piksel?        PanX, PanY = dünya orijininin ekrandaki pikseli
dünyaX = (ekranX − PanX) / Zoom
dünyaY = (PanY − ekranY) / Zoom      ← Y ters!
ekranX = PanX + dünyaX · Zoom
ekranY = PanY − dünyaY · Zoom</pre>
<p><b>Izgara yakalama</b> (<t en="grid snap" ja="グリッドスナップ">grid snap</t>): imleç en yakın ızgara noktasına "yapışır". Formül: <code>Round(v / aralık) · aralık</code>.</p>
<div class="callout warn"><b>Banker yuvarlaması tuzağı:</b> C#'ta <code>Math.Round(2.5)</code> = <b>2</b>, <code>Math.Round(3.5)</code> = 4! Varsayılan, tam ortadaki değerleri <b>çift sayıya</b> yuvarlar (istatistikte birikmiş hatayı azaltmak için). Izgarada bu, 25 mm'nin bazen 20'ye bazen 30'a yapışması demek. Çözüm: <code>Math.Round(x, MidpointRounding.AwayFromZero)</code> → 2.5 → 3, −2.5 → −3.</div>`,
      code: cs`Console.WriteLine(Math.Round(2.5));
Console.WriteLine(Math.Round(3.5));
Console.WriteLine(Math.Round(2.5, MidpointRounding.AwayFromZero));
Console.WriteLine(Math.Round(-2.5, MidpointRounding.AwayFromZero));`,
      runnable: true,
      exercise: {
        title: 'SnapValue ve Viewport',
        prompt: `
<p>1) <code>double SnapValue(double v, double grid)</code> — en yakın ızgara değeri (ortadakiler sıfırdan uzağa).</p>
<p>2) <code>Viewport</code> sınıfında <code>ScreenToWorld(double sx, double sy)</code> ve <code>WorldToScreen(Point2D w)</code>.</p>
<pre class="expected">SnapValue(25, 10)   → 30      SnapValue(-25, 10) → -30
SnapValue(7.3, 0.5) → 7.5
Zoom 2, Pan (100, 400): ekran (300, 200) → dünya (100.00, 100.00)</pre>`,
        starter: cs`double SnapValue(double v, double grid)
{
    return v;
}

var vp = new Viewport { Zoom = 2, PanX = 100, PanY = 400 };
Console.WriteLine(vp.ScreenToWorld(300, 200));
Console.WriteLine(SnapValue(25, 10));

class Viewport
{
    public double Zoom { get; set; } = 1;   // 1 mm = Zoom piksel
    public double PanX { get; set; }        // dünya orijininin ekran X'i
    public double PanY { get; set; }        // dünya orijininin ekran Y'si

    public Point2D ScreenToWorld(double sx, double sy)
    {
        return new Point2D(sx, sy);
    }

    public Point2D WorldToScreen(Point2D w)
    {
        return w;
    }
}

` + P2D,
        checks: [
          { type: 'output', expect: '(100.00, 100.00)\n30', msg: 'Örnek dönüşüm ve ızgara yakalama doğru olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(SnapValue(12.4, 5));
Console.WriteLine(SnapValue(13, 5));
Console.WriteLine(SnapValue(15, 10));
Console.WriteLine(SnapValue(-25, 10));
Console.WriteLine(SnapValue(7.3, 0.5));
Console.WriteLine(SnapValue(-7, 10));`, expect: '10\n15\n20\n-30\n7.5\n-10', msg: 'SnapValue en yakın ızgaraya, ortadaki değerleri sıfırdan uzağa yuvarlamalı' },
          { type: 'harness', append: cs`var v = new Viewport { Zoom = 2, PanX = 100, PanY = 400 };
Console.WriteLine(v.ScreenToWorld(100, 400));
Console.WriteLine(v.ScreenToWorld(50, 450));
Console.WriteLine(v.WorldToScreen(new Point2D(100, 100)));
Console.WriteLine(v.WorldToScreen(new Point2D(-25, 50)));`, expect: '(0.00, 0.00)\n(-25.00, -25.00)\n(300.00, 200.00)\n(50.00, 300.00)', msg: 'ScreenToWorld ve WorldToScreen (Y ters) doğru olmalı' },
          { type: 'harness', append: cs`var v = new Viewport { Zoom = 0.25, PanX = 640, PanY = 360 };
var w = v.ScreenToWorld(123, 456);
Console.WriteLine(w);
Console.WriteLine(v.WorldToScreen(w));`, expect: '(-2068.00, -384.00)\n(123.00, 456.00)', msg: 'İki dönüşüm birbirinin tersi olmalı' },
          { type: 'code', pattern: 'MidpointRounding\\.AwayFromZero', msg: 'MidpointRounding.AwayFromZero kullanmalısın' },
        ],
        hints: [
          '<code>SnapValue</code>: <code>return Math.Round(v / grid, MidpointRounding.AwayFromZero) * grid;</code> — neden <code>v / grid</code>? Çünkü "kaçıncı ızgara çizgisi" sorusunu soruyoruz.',
          '<code>ScreenToWorld</code>: <code>new Point2D((sx - PanX) / Zoom, (PanY - sy) / Zoom)</code> — Y\'deki sıra farkına dikkat.',
          '<code>WorldToScreen</code> tersini yapar: <code>new Point2D(PanX + w.X * Zoom, PanY - w.Y * Zoom)</code>.',
        ],
        solution: SNAPVALUE + cs`

var vp = new Viewport { Zoom = 2, PanX = 100, PanY = 400 };
Console.WriteLine(vp.ScreenToWorld(300, 200));
Console.WriteLine(SnapValue(25, 10));

class Viewport
{
    public double Zoom { get; set; } = 1;   // 1 mm = Zoom piksel
    public double PanX { get; set; }        // dünya orijininin ekran X'i
    public double PanY { get; set; }        // dünya orijininin ekran Y'si

    public Point2D ScreenToWorld(double sx, double sy)
    {
        return new Point2D((sx - PanX) / Zoom, (PanY - sy) / Zoom);
    }

    public Point2D WorldToScreen(Point2D w)
    {
        return new Point2D(PanX + w.X * Zoom, PanY - w.Y * Zoom);
    }
}

` + P2D,
        explain: 'Belge daima dünya biriminde (mm) saklanır; piksel sadece çizim anında hesaplanır. Böylece kullanıcı ne kadar yakınlaştırırsa yaklaştırsın bir duvarın uzunluğu 3000 mm kalır. Zoom ve pan sadece <code>Viewport</code>\'u değiştirir, belgeyi asla.',
      },
    },
    {
      title: 'Adım 4 — Uç nokta yakalama ve yakalama önceliği',
      body: `
<p>Hassas çizim için imleç, yakındaki önemli noktalara yapışmalı: çizginin <b>uç noktaları</b> (<t en="endpoint" ja="端点">端点</t>), dikdörtgenin köşeleri, dairenin merkezi ve dörtte bir noktaları. Her varlık bu noktaları <code>SnapPoints()</code> ile bildirir; yakalama kodu varlığın türünü bilmek zorunda değildir (P2'deki <code>HitTest</code> fikrinin aynısı).</p>
<p>Kurallar:</p>
<ul>
<li>Tolerans içindeki noktalar arasından <b>en yakını</b> seçilir.</li>
<li><b>Gizli katmandaki</b> varlıklar yakalanmaz (görmediğin şeye yapışmak kafa karıştırır).</li>
<li><b>Öncelik:</b> önce nesne yakalama (uç nokta), bulunamazsa ızgara. CAD programlarında da nesne yakalama genelde ızgaradan önce gelir, çünkü kullanıcının niyeti daha belirgindir.</li>
</ul>
<div class="callout tip">Tolerans burada dünya biriminde (mm) veriliyor. Masaüstünde onu pikselden çevireceksin: <code>tolMm = 8 / viewport.Zoom</code> (8 piksel). Böylece yakınlaştırınca da yakalama "eli" aynı büyüklükte hissettirir.</div>`,
      exercise: {
        title: 'FindSnap ve Snap',
        prompt: `
<p>1) <code>Point2D? FindSnap(List&lt;Entity&gt; entities, Point2D cursor, double tol)</code>: görünür katmanlardaki varlıkların <code>SnapPoints()</code>'i arasında imlece <code>tol</code>'dan yakın (veya eşit) olan en yakın noktayı döndür; yoksa <code>null</code>.</p>
<p>2) <code>Point2D Snap(List&lt;Entity&gt; entities, Point2D cursor, double tol, double grid)</code>: önce <code>FindSnap</code>; bulamazsa her iki koordinatı <code>SnapValue</code> ile ızgaraya yapıştır.</p>
<p><code>SnapValue</code> ve <code>Distance</code> hazır.</p>`,
        starter: cs`double Distance(Point2D a, Point2D b) => Math.Sqrt((a.X - b.X) * (a.X - b.X) + (a.Y - b.Y) * (a.Y - b.Y));

` + SNAPVALUE + cs`

Point2D? FindSnap(List<Entity> entities, Point2D cursor, double tol)
{
    return null;
}

Point2D Snap(List<Entity> entities, Point2D cursor, double tol, double grid)
{
    return cursor;
}

var visible = new Layer("0");
var scene = new List<Entity>
{
    new LineEntity("L1", visible, new Point2D(0, 0), new Point2D(100, 0)),
    new RectEntity("R1", visible, new Point2D(50, 50), new Point2D(80, 90)),
};
Console.WriteLine(FindSnap(scene, new Point2D(98, 3), 5));

` + MODEL + '\n\n' + P2D,
        checks: [
          { type: 'output', expect: '(100.00, 0.00)', msg: '(98, 3) imleci (100, 0) uç noktasına yapışmalı' },
          { type: 'harness', append: cs`var lay = new Layer("0");
var hidden = new Layer("Gizli") { Visible = false };
var ents = new List<Entity>
{
    new LineEntity("L1", lay, new Point2D(0, 0), new Point2D(100, 0)),
    new RectEntity("R1", lay, new Point2D(50, 50), new Point2D(80, 90)),
    new CircleEntity("C1", lay, new Point2D(200, 0), 20),
    new LineEntity("L2", hidden, new Point2D(10, 10), new Point2D(30, 30)),
};
Console.WriteLine(FindSnap(ents, new Point2D(52, 49), 5));
Console.WriteLine(FindSnap(ents, new Point2D(81, 51), 5));
Console.WriteLine(FindSnap(ents, new Point2D(219, 1), 5));
Console.WriteLine(FindSnap(ents, new Point2D(60, 0), 5) == null);
Console.WriteLine(FindSnap(ents, new Point2D(11, 11), 5) == null);`, expect: '(50.00, 50.00)\n(80.00, 50.00)\n(220.00, 0.00)\nTrue\nTrue', msg: 'En yakın yakalama noktası bulunmalı; tolerans dışı ve gizli katmandakiler yok sayılmalı' },
          { type: 'harness', append: cs`var lay = new Layer("0");
var ents = new List<Entity>
{
    new LineEntity("A", lay, new Point2D(0, 0), new Point2D(10, 0)),
    new LineEntity("B", lay, new Point2D(10, 3), new Point2D(20, 3)),
};
Console.WriteLine(FindSnap(ents, new Point2D(10, 2), 5));
Console.WriteLine(FindSnap(ents, new Point2D(10, 1), 5));`, expect: '(10.00, 3.00)\n(10.00, 0.00)', msg: 'Birden çok aday varsa en yakını seçilmeli' },
          { type: 'harness', append: cs`var lay = new Layer("0");
var ents = new List<Entity> { new LineEntity("L1", lay, new Point2D(0, 0), new Point2D(100, 0)) };
Console.WriteLine(Snap(ents, new Point2D(98, 3), 5, 10));
Console.WriteLine(Snap(ents, new Point2D(11, 11), 5, 10));
Console.WriteLine(Snap(ents, new Point2D(44.9, 35), 5, 10));
Console.WriteLine(Snap(new List<Entity>(), new Point2D(-12.5, 7.4), 5, 5));`, expect: '(100.00, 0.00)\n(10.00, 10.00)\n(40.00, 40.00)\n(-15.00, 5.00)', msg: 'Snap önce uç noktayı, yoksa ızgarayı kullanmalı' },
        ],
        hints: [
          '<code>FindSnap</code>: <code>Point2D? best = null; double bestDist = tol;</code> ile başla. İki iç içe <code>foreach</code>: varlıklar ve her varlığın <code>SnapPoints()</code>\'i.',
          'Dış döngüde <code>if (!e.Layer.Visible) continue;</code> İç döngüde <code>double d = Distance(p, cursor); if (d &lt;= bestDist) { bestDist = d; best = p; }</code>',
          '<code>Snap</code>: <code>Point2D? s = FindSnap(entities, cursor, tol); if (s != null) return s;</code> sonra <code>new Point2D(SnapValue(cursor.X, grid), SnapValue(cursor.Y, grid))</code> döndür.',
        ],
        solution: cs`double Distance(Point2D a, Point2D b) => Math.Sqrt((a.X - b.X) * (a.X - b.X) + (a.Y - b.Y) * (a.Y - b.Y));

` + SNAPVALUE + cs`

Point2D? FindSnap(List<Entity> entities, Point2D cursor, double tol)
{
    Point2D? best = null;
    double bestDist = tol;
    foreach (Entity e in entities)
    {
        if (!e.Layer.Visible) continue;
        foreach (Point2D p in e.SnapPoints())
        {
            double d = Distance(p, cursor);
            if (d <= bestDist)
            {
                bestDist = d;
                best = p;
            }
        }
    }
    return best;
}

Point2D Snap(List<Entity> entities, Point2D cursor, double tol, double grid)
{
    Point2D? s = FindSnap(entities, cursor, tol);
    if (s != null) return s;
    return new Point2D(SnapValue(cursor.X, grid), SnapValue(cursor.Y, grid));
}

var visible = new Layer("0");
var scene = new List<Entity>
{
    new LineEntity("L1", visible, new Point2D(0, 0), new Point2D(100, 0)),
    new RectEntity("R1", visible, new Point2D(50, 50), new Point2D(80, 90)),
};
Console.WriteLine(FindSnap(scene, new Point2D(98, 3), 5));

` + MODEL + '\n\n' + P2D,
        explain: '<code>bestDist</code>\'i toleransla başlatmak iki işi birden yapar: hem "tolerans dışını yok say" hem de "en yakını bul". Yeni bir yakalama türü (orta nokta, kesişim) eklemek için sadece varlıkların <code>SnapPoints()</code>\'ini genişletmen yeter.',
      },
    },
    {
      title: 'Adım 5 — Ölçüm: mesafe ve açı (derece)',
      body: `
<p>Ölçüm araçları CAD'in temelidir (<t en="dimension" ja="寸法">寸法</t>). İki tıklama: mesafe ve yön açısı.</p>
<ul>
<li><b>Mesafe:</b> Pisagor, artık hep yazdığın gibi.</li>
<li><b>Yön açısı:</b> <code>Math.Atan2(dy, dx)</code>, +X ekseninden saat yönünün tersine radyan cinsinden açı verir (−π ile π arası). <code>Atan(dy / dx)</code> yerine <code>Atan2</code> kullanırız, çünkü <code>Atan2</code> dört bölgeyi ayırt eder ve <code>dx = 0</code>'da sıfıra bölmez.</li>
<li>CAD'de açılar genellikle <b>0–360°</b> gösterilir: negatif sonuçlara 360 ekle.</li>
<li><b>İki ışın arası açı</b> (köşe açısı): iki yön açısının farkı; fark 180°'den büyükse <code>360 − fark</code> (her zaman küçük açıyı göster).</li>
</ul>`,
      code: cs`Console.WriteLine(Math.Atan2(1, 1) * 180 / Math.PI);
Console.WriteLine(Math.Atan2(1, -1) * 180 / Math.PI);
Console.WriteLine(Math.Atan2(-1, 0) * 180 / Math.PI);
Console.WriteLine(Math.Atan2(-1, -1) * 180 / Math.PI);`,
      runnable: true,
      exercise: {
        title: 'Distance, AngleDeg, AngleBetween',
        prompt: `
<p>Üç fonksiyon yaz:</p>
<ul>
<li><code>double Distance(Point2D a, Point2D b)</code></li>
<li><code>double AngleDeg(Point2D from, Point2D to)</code> — +X'ten saat yönünün tersine, <b>[0, 360)</b> aralığında</li>
<li><code>double AngleBetween(Point2D vertex, Point2D a, Point2D b)</code> — <code>vertex→a</code> ve <code>vertex→b</code> ışınları arasındaki küçük açı (0–180)</li>
</ul>
<pre class="expected">AngleDeg((0,0), (0,-1))              → 270.00
AngleBetween((0,0), (1,0), (0,1))    → 90.00
AngleBetween((0,0), (1,0), (1,-1))   → 45.00</pre>`,
        starter: cs`double Distance(Point2D a, Point2D b)
{
    return 0;
}

double AngleDeg(Point2D from, Point2D to)
{
    return 0;
}

double AngleBetween(Point2D vertex, Point2D a, Point2D b)
{
    return 0;
}

var o = new Point2D(0, 0);
Console.WriteLine(AngleDeg(o, new Point2D(0, -1)).ToString("F2"));

` + P2D,
        checks: [
          { type: 'output', expect: '270.00', msg: '(0,0)\'dan (0,-1)\'e açı 270.00 olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(Distance(new Point2D(0, 0), new Point2D(3000, 4000)).ToString("F2"));
Console.WriteLine(Distance(new Point2D(-1, 2), new Point2D(2, -2)).ToString("F2"));`, expect: '5000.00\n5.00', msg: 'Distance doğru olmalı' },
          { type: 'harness', append: cs`var org = new Point2D(0, 0);
Console.WriteLine(AngleDeg(org, new Point2D(1, 1)).ToString("F2"));
Console.WriteLine(AngleDeg(org, new Point2D(-1, 0)).ToString("F2"));
Console.WriteLine(AngleDeg(org, new Point2D(-1, -1)).ToString("F2"));
Console.WriteLine(AngleDeg(new Point2D(10, 10), new Point2D(10, 20)).ToString("F2"));
Console.WriteLine(AngleDeg(org, new Point2D(5, 0)).ToString("F2"));`, expect: '45.00\n180.00\n225.00\n90.00\n0.00', msg: 'AngleDeg [0, 360) aralığında olmalı (negatifler 360 eklenerek)' },
          { type: 'harness', append: cs`var org = new Point2D(0, 0);
Console.WriteLine(AngleBetween(org, new Point2D(1, 0), new Point2D(0, 1)).ToString("F2"));
Console.WriteLine(AngleBetween(org, new Point2D(1, 0), new Point2D(1, -1)).ToString("F2"));
Console.WriteLine(AngleBetween(org, new Point2D(3, 0), new Point2D(-1, 1.732)).ToString("F2"));
Console.WriteLine(AngleBetween(new Point2D(5, 5), new Point2D(5, 9), new Point2D(5, 1)).ToString("F2"));
Console.WriteLine(AngleBetween(org, new Point2D(0, -2), new Point2D(1, 0)).ToString("F2"));`, expect: '90.00\n45.00\n120.00\n180.00\n90.00', msg: 'AngleBetween her zaman küçük açıyı (0–180) vermeli' },
          { type: 'code', pattern: 'Math\\.Atan2', msg: 'Açı için Math.Atan2 kullanmalısın' },
        ],
        hints: [
          '<code>AngleDeg</code>: <code>double deg = Math.Atan2(to.Y - from.Y, to.X - from.X) * 180 / Math.PI;</code> sonra negatifse 360 ekle.',
          '<code>AngleBetween</code>: iki yön açısını <code>AngleDeg(vertex, a)</code> ve <code>AngleDeg(vertex, b)</code> ile bul; farkın mutlak değerini al.',
          'Fark 180\'den büyükse <code>diff = 360 - diff;</code> ve döndür.',
        ],
        solution: cs`double Distance(Point2D a, Point2D b)
{
    double dx = b.X - a.X, dy = b.Y - a.Y;
    return Math.Sqrt(dx * dx + dy * dy);
}

double AngleDeg(Point2D from, Point2D to)
{
    double deg = Math.Atan2(to.Y - from.Y, to.X - from.X) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
}

double AngleBetween(Point2D vertex, Point2D a, Point2D b)
{
    double diff = Math.Abs(AngleDeg(vertex, a) - AngleDeg(vertex, b));
    if (diff > 180) diff = 360 - diff;
    return diff;
}

var o = new Point2D(0, 0);
Console.WriteLine(AngleDeg(o, new Point2D(0, -1)).ToString("F2"));

` + P2D,
        explain: '<code>Atan2</code>, <code>dx</code> ve <code>dy</code>\'nin işaretlerine bakarak doğru çeyreği seçer. Masaüstündeki döndürme aracında da bunu kullanacaksın: kullanıcı taban noktasını seçtikten sonra fareyi gezdirdikçe açı <code>AngleDeg(taban, imleç)</code> olur.',
      },
    },
    {
      title: 'Adım 6 — Alan: dikdörtgen ve çokgen (shoelace formülü)',
      body: `
<p>Mimari CAD'de en çok sorulan soru: <b>bu odanın alanı kaç m²?</b> (<t en="area" ja="面積">面積</t>). Köşeleri bilinen herhangi bir (kendini kesmeyen) çokgenin alanı <b>shoelace</b> (ayakkabı bağı / Gauss) formülüyle bulunur:</p>
<pre>2A = Σ (xᵢ · yᵢ₊₁ − xᵢ₊₁ · yᵢ)      (son noktadan sonra ilk noktaya dön)</pre>
<p>Toplam, köşeler <b>saat yönünün tersine</b> sıralıysa pozitif, saat yönündeyse negatiftir. Bu işaretli alan, çokgenin yönünü (<t en="winding order" ja="頂点の並び順">sarım yönü</t>) bulmanın da en kolay yoludur — 3D'de yüz normallerinin yönünü belirleyen kural da budur! Alan için mutlak değer alırız.</p>
<p><b>Birimler:</b> Koordinatlar mm ise alan mm²'dir. m²'ye çevirmek için 1.000.000'a böl (1 m = 1000 mm → 1 m² = 1000 × 1000 mm²).</p>
<div class="callout tip">Dikdörtgen de bir çokgendir: <code>(0,0), (w,0), (w,h), (0,h)</code> → shoelace sonucu <code>w·h</code>. Tek formülle hepsini çözmek, her şekil için ayrı formül yazmaktan daha az hata demektir.</div>`,
      exercise: {
        title: 'SignedArea, PolygonArea, AreaText',
        prompt: `
<p>Üç fonksiyon yaz:</p>
<ul>
<li><code>double SignedArea(List&lt;Point2D&gt; pts)</code> — shoelace; 3'ten az nokta varsa 0</li>
<li><code>double PolygonArea(List&lt;Point2D&gt; pts)</code> — mutlak değer</li>
<li><code>string AreaText(double mm2)</code> — m² cinsinden, 2 ondalık: <code>"20.00 m²"</code></li>
</ul>
<pre class="expected">Kare 10×10 (saat yönünün tersi)  → SignedArea 100, PolygonArea 100
Aynı kare ters sırada            → SignedArea -100, PolygonArea 100
L şekli                          → 6
5000 × 4000 mm oda               → 20.00 m²</pre>`,
        starter: cs`double SignedArea(List<Point2D> pts)
{
    return 0;
}

double PolygonArea(List<Point2D> pts)
{
    return 0;
}

string AreaText(double mm2)
{
    return "";
}

var square = new List<Point2D> { new Point2D(0, 0), new Point2D(10, 0), new Point2D(10, 10), new Point2D(0, 10) };
Console.WriteLine(SignedArea(square));

` + P2D,
        checks: [
          { type: 'output', expect: '100', msg: '10×10 karenin işaretli alanı 100 olmalı' },
          { type: 'harness', append: cs`var sq = new List<Point2D> { new Point2D(0, 0), new Point2D(0, 10), new Point2D(10, 10), new Point2D(10, 0) };
Console.WriteLine(SignedArea(sq));
Console.WriteLine(PolygonArea(sq));`, expect: '-100\n100', msg: 'Saat yönündeki çokgenin işaretli alanı negatif, PolygonArea pozitif olmalı' },
          { type: 'harness', append: cs`var L = new List<Point2D> { new Point2D(0, 0), new Point2D(4, 0), new Point2D(4, 1), new Point2D(1, 1), new Point2D(1, 3), new Point2D(0, 3) };
Console.WriteLine(PolygonArea(L));
var tri = new List<Point2D> { new Point2D(0, 0), new Point2D(4, 0), new Point2D(0, 3) };
Console.WriteLine(PolygonArea(tri));
var off = new List<Point2D> { new Point2D(100, 100), new Point2D(102.5, 100), new Point2D(102.5, 104), new Point2D(100, 104) };
Console.WriteLine(PolygonArea(off));`, expect: '6\n6\n10', msg: 'L şekli, üçgen ve orijinden uzak dikdörtgende alan doğru olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(PolygonArea(new List<Point2D> { new Point2D(0, 0), new Point2D(5, 5) }));
Console.WriteLine(PolygonArea(new List<Point2D>()));`, expect: '0\n0', msg: '3\'ten az noktada alan 0 olmalı' },
          { type: 'harness', append: cs`var room = new List<Point2D> { new Point2D(0, 0), new Point2D(5000, 0), new Point2D(5000, 4000), new Point2D(0, 4000) };
Console.WriteLine(AreaText(PolygonArea(room)));
Console.WriteLine(AreaText(1234567));`, expect: '20.00 m²\n1.23 m²', msg: 'AreaText mm²\'yi m²\'ye çevirip 2 ondalıkla yazmalı' },
        ],
        hints: [
          '<code>if (pts.Count &lt; 3) return 0;</code> sonra <code>double sum = 0;</code> ve <code>for (int i = 0; i &lt; pts.Count; i++)</code>.',
          'Döngüde sonraki nokta: <code>Point2D a = pts[i]; Point2D b = pts[(i + 1) % pts.Count];</code> — <code>%</code> son noktadan ilk noktaya dönmeyi sağlar. <code>sum += a.X * b.Y - b.X * a.Y;</code>',
          'Sonuç <code>sum / 2</code>. <code>PolygonArea</code> = <code>Math.Abs(SignedArea(pts))</code>; <code>AreaText</code> = <code>(mm2 / 1000000).ToString("F2") + " m²"</code>.',
        ],
        solution: cs`double SignedArea(List<Point2D> pts)
{
    if (pts.Count < 3) return 0;
    double sum = 0;
    for (int i = 0; i < pts.Count; i++)
    {
        Point2D a = pts[i];
        Point2D b = pts[(i + 1) % pts.Count];
        sum += a.X * b.Y - b.X * a.Y;
    }
    return sum / 2;
}

double PolygonArea(List<Point2D> pts)
{
    return Math.Abs(SignedArea(pts));
}

string AreaText(double mm2)
{
    return (mm2 / 1000000).ToString("F2") + " m²";
}

var square = new List<Point2D> { new Point2D(0, 0), new Point2D(10, 0), new Point2D(10, 10), new Point2D(0, 10) };
Console.WriteLine(SignedArea(square));

` + P2D,
        explain: 'Shoelace formülü her kenar için orijinle oluşan üçgenin işaretli alanını toplar; çokgenin dışında kalan parçalar ters işaretle birbirini götürür. <code>(i + 1) % n</code>, "döngüsel komşu" kalıbıdır; P4\'teki çember çiziminde de kullandın.',
      },
    },
    {
      title: 'Adım 7 — Komut deseni: Geri Al / Yinele',
      body: `
<p><b>Geri Al</b> (<t en="Undo" ja="元に戻す">元に戻す</t>) olmayan bir CAD programını kimse kullanmaz. Standart çözüm <t en="Command pattern" ja="コマンドパターン">komut deseni</t>dir: belgeyi değiştiren her işlem, kendini hem <b>yapmayı</b> hem <b>geri almayı</b> bilen bir nesnedir.</p>
<pre>interface ICommand { string Name; void Execute(); void Undo(); }</pre>
<p><code>CommandManager</code> iki <code>Stack&lt;ICommand&gt;</code> tutar:</p>
<ul>
<li><b>Execute(cmd):</b> komutu çalıştır, <b>undo</b> yığınına koy, <b>redo yığınını temizle</b> (yeni bir işlem yapınca "ileri" geçmiş geçersizleşir).</li>
<li><b>Undo():</b> undo'dan al, <code>Undo()</code> çağır, redo'ya koy.</li>
<li><b>Redo():</b> redo'dan al, tekrar <code>Execute()</code>, undo'ya koy.</li>
</ul>
<p><b>Silme komutu</b> ince bir nokta içerir: geri alınca varlık listenin <b>sonuna</b> değil, <b>eski yerine</b> dönmeli (çizim sırası = görünürlük sırası). Bu yüzden <code>Execute</code> sırasında indeksi saklarız.</p>
<div class="callout tip">Blender'da Ctrl+Z, Photoshop'ta History paneli aynı fikrin uygulamalarıdır. Photoshop'un History listesi, aslında undo yığınının görselleştirilmiş hâlidir.</div>`,
      exercise: {
        title: 'DeleteCommand ve CommandManager',
        prompt: `
<p><code>AddEntityCommand</code> ve <code>MoveCommand</code> hazır. Şunları tamamla:</p>
<ul>
<li><code>DeleteCommand</code>: <code>Execute</code> varlığın indeksini saklayıp listeden çıkarsın; <code>Undo</code> aynı indekse geri eklesin (<code>Insert</code>).</li>
<li><code>CommandManager</code>: <code>Execute</code>, <code>Undo</code>, <code>Redo</code> (yığın boşsa <code>false</code> döndürür, işlem yaptıysa <code>true</code>), <code>CanUndo</code>, <code>CanRedo</code>.</li>
</ul>`,
        starter: cs`var doc = new Document();
var cm = new CommandManager();
var layer = doc.GetLayer("0");
cm.Execute(new AddEntityCommand(doc, new LineEntity("L1", layer, new Point2D(0, 0), new Point2D(10, 0))));
cm.Execute(new AddEntityCommand(doc, new LineEntity("L2", layer, new Point2D(0, 5), new Point2D(10, 5))));
cm.Undo();
Console.WriteLine(doc);

class DeleteCommand : ICommand
{
    private readonly Document doc;
    private readonly Entity entity;
    private int index = -1;
    public DeleteCommand(Document doc, Entity entity) { this.doc = doc; this.entity = entity; }
    public string Name => "Sil " + entity.Id;
    public void Execute() { }
    public void Undo() { }
}

class CommandManager
{
    private readonly Stack<ICommand> undoStack = new Stack<ICommand>();
    private readonly Stack<ICommand> redoStack = new Stack<ICommand>();

    public bool CanUndo => false;
    public bool CanRedo => false;

    public void Execute(ICommand cmd) { }
    public bool Undo() { return false; }
    public bool Redo() { return false; }
}

` + COMMANDS_GIVEN + '\n\n' + DOCUMENT + '\n\n' + MODEL + '\n\n' + P2D,
        checks: [
          { type: 'output', expect: '[L1]', msg: 'İki ekleme + bir geri alma sonrası belge [L1] olmalı' },
          { type: 'harness', append: cs`var d = new Document();
var m = new CommandManager();
var ly = d.GetLayer("0");
var l1 = new LineEntity("L1", ly, new Point2D(0, 0), new Point2D(10, 0));
var l2 = new LineEntity("L2", ly, new Point2D(0, 5), new Point2D(10, 5));
Console.WriteLine(m.CanUndo + " " + m.CanRedo);
m.Execute(new AddEntityCommand(d, l1));
m.Execute(new AddEntityCommand(d, l2));
Console.WriteLine(d + " " + m.CanUndo);
m.Undo();
Console.WriteLine(d + " " + m.CanRedo);
m.Redo();
Console.WriteLine(d + " " + m.CanRedo);`, expect: 'False False\n[L1, L2] True\n[L1] True\n[L1, L2] False', msg: 'Execute / Undo / Redo ve CanUndo / CanRedo doğru çalışmalı' },
          { type: 'harness', append: cs`var d = new Document();
var m = new CommandManager();
var ly = d.GetLayer("0");
var l1 = new LineEntity("L1", ly, new Point2D(0, 0), new Point2D(10, 0));
m.Execute(new AddEntityCommand(d, l1));
m.Execute(new MoveCommand(l1, 5, 5));
Console.WriteLine(l1.A);
m.Undo();
Console.WriteLine(l1.A + " " + m.CanRedo);
m.Execute(new MoveCommand(l1, 1, 0));
Console.WriteLine(l1.A + " " + m.CanRedo);
Console.WriteLine(m.Redo());`, expect: '(5.00, 5.00)\n(0.00, 0.00) True\n(1.00, 0.00) False\nFalse', msg: 'Yeni bir komut çalışınca redo yığını temizlenmeli' },
          { type: 'harness', append: cs`var d = new Document();
var m = new CommandManager();
var ly = d.GetLayer("0");
var a = new LineEntity("A", ly, new Point2D(0, 0), new Point2D(1, 0));
var b = new LineEntity("B", ly, new Point2D(0, 1), new Point2D(1, 1));
var c = new LineEntity("C", ly, new Point2D(0, 2), new Point2D(1, 2));
m.Execute(new AddEntityCommand(d, a));
m.Execute(new AddEntityCommand(d, b));
m.Execute(new AddEntityCommand(d, c));
m.Execute(new DeleteCommand(d, b));
Console.WriteLine(d);
m.Undo();
Console.WriteLine(d);
m.Redo();
Console.WriteLine(d);`, expect: '[A, C]\n[A, B, C]\n[A, C]', msg: 'DeleteCommand geri alınınca varlık eski indeksine dönmeli' },
          { type: 'harness', append: cs`var d = new Document();
var m = new CommandManager();
var ly = d.GetLayer("0");
m.Execute(new AddEntityCommand(d, new LineEntity("X", ly, new Point2D(0, 0), new Point2D(1, 0))));
Console.WriteLine(m.Undo() + " " + m.Undo() + " " + m.Redo() + " " + m.Redo());
Console.WriteLine(d);`, expect: 'True False True False\n[X]', msg: 'Boş yığında Undo/Redo false döndürmeli ve çökmemeli' },
        ],
        hints: [
          '<code>DeleteCommand.Execute</code>: <code>index = doc.Entities.IndexOf(entity); doc.Entities.RemoveAt(index);</code> — <code>Undo</code>: <code>doc.Entities.Insert(index, entity);</code>',
          '<code>CommandManager.Execute</code>: <code>cmd.Execute(); undoStack.Push(cmd); redoStack.Clear();</code> — <code>CanUndo =&gt; undoStack.Count &gt; 0</code>.',
          '<code>Undo()</code>: <code>if (undoStack.Count == 0) return false; var cmd = undoStack.Pop(); cmd.Undo(); redoStack.Push(cmd); return true;</code> — <code>Redo()</code> bunun aynası (Execute çağırır, undo\'ya iter).',
        ],
        solution: cs`var doc = new Document();
var cm = new CommandManager();
var layer = doc.GetLayer("0");
cm.Execute(new AddEntityCommand(doc, new LineEntity("L1", layer, new Point2D(0, 0), new Point2D(10, 0))));
cm.Execute(new AddEntityCommand(doc, new LineEntity("L2", layer, new Point2D(0, 5), new Point2D(10, 5))));
cm.Undo();
Console.WriteLine(doc);

class DeleteCommand : ICommand
{
    private readonly Document doc;
    private readonly Entity entity;
    private int index = -1;
    public DeleteCommand(Document doc, Entity entity) { this.doc = doc; this.entity = entity; }
    public string Name => "Sil " + entity.Id;
    public void Execute()
    {
        index = doc.Entities.IndexOf(entity);
        doc.Entities.RemoveAt(index);
    }
    public void Undo()
    {
        doc.Entities.Insert(index, entity);
    }
}

class CommandManager
{
    private readonly Stack<ICommand> undoStack = new Stack<ICommand>();
    private readonly Stack<ICommand> redoStack = new Stack<ICommand>();

    public bool CanUndo => undoStack.Count > 0;
    public bool CanRedo => redoStack.Count > 0;

    public void Execute(ICommand cmd)
    {
        cmd.Execute();
        undoStack.Push(cmd);
        redoStack.Clear();
    }

    public bool Undo()
    {
        if (undoStack.Count == 0) return false;
        ICommand cmd = undoStack.Pop();
        cmd.Undo();
        redoStack.Push(cmd);
        return true;
    }

    public bool Redo()
    {
        if (redoStack.Count == 0) return false;
        ICommand cmd = redoStack.Pop();
        cmd.Execute();
        undoStack.Push(cmd);
        return true;
    }
}

` + COMMANDS_GIVEN + '\n\n' + DOCUMENT + '\n\n' + MODEL + '\n\n' + P2D,
        explain: 'Belge artık sadece komutlarla değişiyor; bu yüzden geri alma "bedava" geliyor. Bir sonraki adımlar (döndürme, katman değiştirme...) için tek yapman gereken yeni bir <code>ICommand</code> sınıfı yazmak. Menüde "Geri Al: Taşı L1" yazmak için <code>Name</code>\'i kullanabilirsin.',
      },
    },
    {
      title: 'Adım 8 — Kaydetme biçimi: serileştirme ve ayrıştırma',
      body: `
<p>Belgeyi diske yazmak = <t en="serialization" ja="シリアライズ">serileştirme</t>; geri okumak = <t en="parsing" ja="構文解析">ayrıştırma</t>. Basit, insan tarafından okunabilir, satır tabanlı bir biçim kullanacağız:</p>
<pre># MiniCAD v1
LINE;L1;Duvar;0;0;3000;0
RECT;R1;Mobilya;500;500;1300;1100
CIRCLE;C1;Aks;2000;2000;150</pre>
<ul>
<li><code>#</code> ile başlayan satırlar yorumdur; boş satırlar atlanır. İlk satırdaki sürüm bilgisi, biçim ileride değişirse eski dosyaları tanımana yarar.</li>
<li>Alan ayırıcı <code>;</code>. Neden virgül değil? Türkçe ve birçok Avrupa dilinde virgül <b>ondalık ayırıcıdır</b>.</li>
<li>Katmanlar isimle yazılır; okurken <code>doc.GetLayer(ad)</code> aynı isimli katmanı bulur ya da oluşturur (<code>Dictionary</code>).</li>
</ul>
<div class="callout warn"><b>Kültür tuzağı (yine!):</b> Türkçe Windows'ta <code>2.5.ToString()</code> → <code>"2,5"</code> ve <code>double.Parse("2.5")</code> → 25 olabilir. Gerçek uygulamada <b>her zaman</b> <code>v.ToString(CultureInfo.InvariantCulture)</code> ve <code>double.Parse(s, CultureInfo.InvariantCulture)</code> kullan. Bu platformun yorumlayıcısı her zaman nokta kullandığı için burada kısa biçimleri yazıyoruz; varlıklardaki <code>N()</code> yardımcısı bu noktayı tek bir yerde topluyor.</div>
<p><b>Hatalı dosyalar:</b> Dosya elle düzenlenmiş ya da bozulmuş olabilir. Ayrıştırıcı, hatalı satırda <b>satır numarasıyla</b> anlamlı bir <code>FormatException</code> fırlatmalı. "Dosya açılamadı" yerine "Satır 7: bilinmeyen tür 'ARC'" demek, kullanıcıya (ve sana) saatler kazandırır.</p>`,
      exercise: {
        title: 'Serialize ve Parse',
        prompt: `
<p>1) <code>string Serialize(Document doc)</code>: ilk satır <code># MiniCAD v1</code>, sonra her varlık için <code>ToLine()</code>; satırlar <code>"\\n"</code> ile birleşsin (sonda boş satır yok).</p>
<p>2) <code>Document Parse(string text)</code>: satırları böl, her satırı <code>Trim()</code> et, boş ve <code>#</code> satırlarını atla. <code>;</code> ile böl ve türe göre varlık oluştur:</p>
<ul>
<li><code>LINE</code> / <code>RECT</code>: 7 alan; <code>CIRCLE</code>: 6 alan. Alan sayısı yanlışsa <code>FormatException("Satır 3: alan sayısı hatalı")</code></li>
<li>Bilinmeyen tür: <code>FormatException("Satır 2: bilinmeyen tür 'ARC'")</code> (satır numaraları 1'den başlar, yorum satırları da sayılır)</li>
</ul>`,
        starter: cs`string Serialize(Document doc)
{
    return "";
}

Document Parse(string text)
{
    var doc = new Document();
    // satırları gez, varlıkları oluşturup doc.Entities'e ekle
    return doc;
}

var d = new Document();
d.Entities.Add(new LineEntity("L1", d.GetLayer("Duvar"), new Point2D(0, 0), new Point2D(3000, 0)));
d.Entities.Add(new RectEntity("R1", d.GetLayer("Mobilya"), new Point2D(500, 500), new Point2D(1300, 1100.5)));
d.Entities.Add(new CircleEntity("C1", d.GetLayer("Aks"), new Point2D(2000, 2000), 150));
Console.WriteLine(Serialize(d));

` + DOCUMENT + '\n\n' + MODEL + '\n\n' + P2D,
        checks: [
          { type: 'output', expect: '# MiniCAD v1\nLINE;L1;Duvar;0;0;3000;0\nRECT;R1;Mobilya;500;500;1300;1100.5\nCIRCLE;C1;Aks;2000;2000;150', msg: 'Serialize başlık satırı + her varlık için bir satır üretmeli' },
          { type: 'harness', append: cs`string txt = "# MiniCAD v1\n\nLINE;L1;Duvar;0;0;3000;0\n  RECT;R1;Mobilya;500;500;1300;1100.5  \n# yorum\nCIRCLE;C1;Aks;2000;2000;150\n";
Document p = Parse(txt);
Console.WriteLine(p + " katman: " + p.Layers.Count);
foreach (Entity e in p.Entities) Console.WriteLine(e.ToLine());`, expect: '[L1, R1, C1] katman: 3\nLINE;L1;Duvar;0;0;3000;0\nRECT;R1;Mobilya;500;500;1300;1100.5\nCIRCLE;C1;Aks;2000;2000;150', msg: 'Parse boş/yorum satırlarını atlayıp varlıkları ve katmanları oluşturmalı' },
          { type: 'harness', append: cs`var d1 = new Document();
d1.Entities.Add(new LineEntity("A", d1.GetLayer("K1"), new Point2D(-12.5, 3), new Point2D(7, 8.25)));
d1.Entities.Add(new CircleEntity("B", d1.GetLayer("K1"), new Point2D(1, 1), 0.5));
string s1 = Serialize(d1);
string s2 = Serialize(Parse(s1));
Console.WriteLine(s1 == s2);
Console.WriteLine(Parse(s1).Entities[0].Layer == Parse(s1).Entities[1].Layer);
var p2 = Parse(s1);
Console.WriteLine(p2.Entities[0].Layer == p2.Entities[1].Layer);`, expect: 'True\nFalse\nTrue', msg: 'Kaydet → oku → kaydet aynı metni vermeli; aynı isimli katman tek nesne olmalı' },
          { type: 'harness', append: cs`try { Parse("# MiniCAD v1\nARC;A1;0;1;2;3;4"); Console.WriteLine("hata yok"); }
catch (FormatException e) { Console.WriteLine(e.Message); }
try { Parse("LINE;L1;0;0;0;10"); Console.WriteLine("hata yok"); }
catch (FormatException e) { Console.WriteLine(e.Message); }
try { Parse("# a\n# b\nCIRCLE;C;0;1;2;3;4"); Console.WriteLine("hata yok"); }
catch (FormatException e) { Console.WriteLine(e.Message); }`, expect: "Satır 2: bilinmeyen tür 'ARC'\nSatır 1: alan sayısı hatalı\nSatır 3: alan sayısı hatalı", msg: 'Hatalı satırlarda satır numaralı FormatException fırlatmalı' },
        ],
        hints: [
          '<code>Serialize</code>: <code>var lines = new List&lt;string&gt; { "# MiniCAD v1" };</code> her varlık için <code>lines.Add(e.ToLine());</code> ve <code>return string.Join("\\n", lines);</code>',
          '<code>Parse</code>: <code>string[] rows = text.Split(\'\\n\');</code> ve <code>for (int i = 0; i &lt; rows.Length; i++)</code>; satır numarası <code>i + 1</code>. <code>string row = rows[i].Trim(); if (row == "" || row.StartsWith("#")) continue;</code>',
          '<code>string[] f = row.Split(\';\');</code> sonra <code>switch (f[0])</code>: <code>case "LINE": if (f.Length != 7) throw new FormatException("Satır " + (i + 1) + ": alan sayısı hatalı"); doc.Entities.Add(new LineEntity(f[1], doc.GetLayer(f[2]), new Point2D(double.Parse(f[3]), double.Parse(f[4])), ...)); break;</code> — <code>default</code> bilinmeyen tür hatası.',
        ],
        solution: cs`string Serialize(Document doc)
{
    var lines = new List<string> { "# MiniCAD v1" };
    foreach (Entity e in doc.Entities) lines.Add(e.ToLine());
    return string.Join("\n", lines);
}

Document Parse(string text)
{
    var doc = new Document();
    string[] rows = text.Split('\n');
    for (int i = 0; i < rows.Length; i++)
    {
        string row = rows[i].Trim();
        if (row == "" || row.StartsWith("#")) continue;
        string[] f = row.Split(';');
        int n = i + 1;
        switch (f[0])
        {
            case "LINE":
                if (f.Length != 7) throw new FormatException("Satır " + n + ": alan sayısı hatalı");
                doc.Entities.Add(new LineEntity(f[1], doc.GetLayer(f[2]),
                    new Point2D(double.Parse(f[3]), double.Parse(f[4])),
                    new Point2D(double.Parse(f[5]), double.Parse(f[6]))));
                break;
            case "RECT":
                if (f.Length != 7) throw new FormatException("Satır " + n + ": alan sayısı hatalı");
                doc.Entities.Add(new RectEntity(f[1], doc.GetLayer(f[2]),
                    new Point2D(double.Parse(f[3]), double.Parse(f[4])),
                    new Point2D(double.Parse(f[5]), double.Parse(f[6]))));
                break;
            case "CIRCLE":
                if (f.Length != 6) throw new FormatException("Satır " + n + ": alan sayısı hatalı");
                doc.Entities.Add(new CircleEntity(f[1], doc.GetLayer(f[2]),
                    new Point2D(double.Parse(f[3]), double.Parse(f[4])), double.Parse(f[5])));
                break;
            default:
                throw new FormatException("Satır " + n + ": bilinmeyen tür '" + f[0] + "'");
        }
    }
    return doc;
}

var d = new Document();
d.Entities.Add(new LineEntity("L1", d.GetLayer("Duvar"), new Point2D(0, 0), new Point2D(3000, 0)));
d.Entities.Add(new RectEntity("R1", d.GetLayer("Mobilya"), new Point2D(500, 500), new Point2D(1300, 1100.5)));
d.Entities.Add(new CircleEntity("C1", d.GetLayer("Aks"), new Point2D(2000, 2000), 150));
Console.WriteLine(Serialize(d));

` + DOCUMENT + '\n\n' + MODEL + '\n\n' + P2D,
        explain: '"Kaydet → oku → kaydet = aynı metin" (<t en="round-trip" ja="ラウンドトリップ">round-trip</t>) testi, dosya biçimi kodunun en değerli testidir. Gerçek CAD formatları (DXF gibi) da özünde "tür kodu + alanlar" satırlarından oluşur; bu alıştırma onları okumaya hazırlık.',
      },
    },
    {
      title: 'Adım 9 — Visual Studio: ana pencere, katmanlar ve durum çubuğu',
      body: `
<p>Model hazır; şimdi profesyonel görünen bir ana pencere. Tarayıcıdaki sınıfları ilgili klasörlere taşı (Point2D, Layer, Entity'ler → <code>Model</code>; ICommand ve komutlar → <code>Commands</code>; Snap/ölçüm/alan → <code>Geometry</code>; Serialize/Parse → <code>IO</code>; Viewport → <code>View</code>).</p>
<ol>
<li><b>MenuStrip:</b> <i>Dosya</i> (Yeni, Aç..., Kaydet, Farklı Kaydet..., Çıkış), <i>Düzen</i> (Geri Al <code>Ctrl+Z</code>, Yinele <code>Ctrl+Y</code>, Sil <code>Del</code>). Kısayolları menü öğelerinin <code>ShortcutKeys</code> özelliğinden ver.</li>
<li><b>ToolStrip:</b> Seç, Çizgi, Dikdörtgen, Daire | Taşı, Döndür | Mesafe, Alan | ızgara yakalama ve uç nokta yakalama için iki <code>CheckOnClick</code> buton.</li>
<li><b>StatusStrip:</b> üç etiket: <code>lblCoords</code> ("X: 1250.00 mm  Y: 300.00 mm"), <code>lblPrompt</code> (aracın istediği: "Taban noktasını seçin"), <code>lblInfo</code> (ölçüm sonucu).</li>
<li><b>Sağ panel — katmanlar:</b> <code>CheckedListBox clbLayers</code> (işaretli = görünür), altında "Kilitli" CheckBox'ı, "Yeni katman" butonu ve aktif katman için bir <code>ComboBox</code>. Kilitli katmandaki varlıklar seçilemez ve yakalanmaz.</li>
<li><b>Canvas:</b> P2'deki çift tamponlu panel. Fare tekerleği: imlecin altındaki noktayı sabit tutarak zoom; orta tuş sürükleme: pan.</li>
</ol>
<p><b>İmlecin altında zoom:</b> Kullanıcı neresi büyüsün istiyorsa orası sabit kalmalı. Önce imlecin dünya koordinatını al, zoom'u değiştir, sonra pan'ı o dünya noktası yine imlecin altına gelecek şekilde düzelt.</p>`,
      code: cs`// View/Viewport.cs (Adım 3'teki sınıfa eklemeler)
public void ZoomAt(double sx, double sy, double factor)
{
    Point2D w = ScreenToWorld(sx, sy);             // imlecin altındaki dünya noktası
    Zoom = Math.Clamp(Zoom * factor, 0.01, 100);
    PanX = sx - w.X * Zoom;                         // w yine (sx, sy)'ye düşsün
    PanY = sy + w.Y * Zoom;
}

// MainForm.cs
private readonly Document doc = new Document();
private readonly CommandManager commands = new CommandManager();
private readonly Viewport viewport = new Viewport { Zoom = 0.2, PanX = 100, PanY = 600 };
private Point lastPan;

private void Canvas_MouseWheel(object? sender, MouseEventArgs e)
{
    viewport.ZoomAt(e.X, e.Y, e.Delta > 0 ? 1.2 : 1 / 1.2);
    canvas.Invalidate();
}

private void Canvas_MouseMove(object? sender, MouseEventArgs e)
{
    if (e.Button == MouseButtons.Middle)
    {
        viewport.PanX += e.X - lastPan.X;
        viewport.PanY += e.Y - lastPan.Y;
        lastPan = e.Location;
        canvas.Invalidate();
    }
    Point2D world = CurrentSnap(e.X, e.Y);          // Adım 4: uç nokta > ızgara
    lblCoords.Text = $"X: {world.X:F2} mm   Y: {world.Y:F2} mm";
    activeTool.OnMouseMove(world);
    canvas.Invalidate();
}

private void mnuUndo_Click(object sender, EventArgs e)
{
    if (commands.Undo()) { MarkDirty(); canvas.Invalidate(); }
}

private void mnuRedo_Click(object sender, EventArgs e)
{
    if (commands.Redo()) { MarkDirty(); canvas.Invalidate(); }
}

private void clbLayers_ItemCheck(object sender, ItemCheckEventArgs e)
{
    var layer = (Layer)clbLayers.Items[e.Index];
    layer.Visible = e.NewValue == CheckState.Checked;
    canvas.Invalidate();
}

// Katmanı ListBox'ta adıyla göstermek için Layer'a ekle:
// public override string ToString() => Name;`,
      runnable: false,
      checklist: [
        'Tarayıcıda test ettiğim sınıfları Model / Commands / Geometry / IO / View klasörlerine taşıdım',
        'MenuStrip (Ctrl+Z / Ctrl+Y kısayollarıyla), ToolStrip ve StatusStrip ekledim',
        'Durum çubuğunda imlecin dünya koordinatı mm cinsinden görünüyor',
        'Fare tekerleği imlecin altındaki noktayı sabit tutarak zoom yapıyor; orta tuşla pan çalışıyor',
        'Katman paneli: görünürlük (CheckedListBox), kilit, yeni katman ve aktif katman seçimi çalışıyor',
      ],
    },
    {
      title: 'Adım 10 — Visual Studio: araçlar (taşı, döndür, ölç) ve yakalama işaretleri',
      body: `
<p>Her araç küçük bir durum makinesidir ve aynı arayüzü uygular. Form, aktif aracı bilmeden sadece olayları iletir:</p>
<pre>interface ITool
{
    string Prompt { get; }                  // durum çubuğundaki yönerge
    void OnMouseDown(Point2D world);
    void OnMouseMove(Point2D world);
    void Cancel();                           // Esc
    void DrawPreview(Graphics g, Viewport vp);
}</pre>
<ul>
<li><b>MoveTool:</b> durumlar <code>PickBase → PickTarget</code>. Hedef seçilince seçili her varlık için bir <code>MoveCommand</code>; hepsini tek geri almada geri almak için bir <code>CompositeCommand</code> (komut listesi) içinde çalıştır.</li>
<li><b>RotateTool:</b> <code>PickBase → PickAngle</code>. Açı = <code>AngleDeg(taban, imleç)</code> (Adım 5); önizlemede varlıkları <code>RotateAround</code> ile (Adım 2) geçici döndürülmüş çiz. Varlıklara bir <code>Rotate(Point2D basePt, double deg)</code> metodu ekle.</li>
<li><b>MeasureDistanceTool:</b> iki tıklama → <code>lblInfo</code>: "Mesafe: 3000.00 mm  Açı: 90.00°".</li>
<li><b>MeasureAreaTool:</b> her tıklama bir köşe; Enter ya da çift tıklama ile bitir → "Alan: 20.00 m²" (Adım 6).</li>
<li><b>Yakalama işareti:</b> uç noktaya yapışınca imlecin yerinde küçük bir kare, ızgaraya yapışınca küçük bir artı çiz. Kullanıcı neye yapıştığını <b>görmeli</b>.</li>
</ul>
<div class="callout"><b>Ters işlem mi, durum kaydı mı?</b> <code>RotateCommand.Undo</code>'yu "−açı ile döndür" diye yazarsan, kayan nokta hataları yüzlerce geri al/yinele sonrası birikebilir (1000.0000001). Daha sağlam yol, <code>Execute</code>'tan önce varlığın koordinatlarını saklamak (<t en="memento" ja="メメント">memento</t>) ve <code>Undo</code>'da geri yüklemektir. İkisini de dene, farkı README'de anlat.</div>`,
      code: cs`public class MoveTool : ITool
{
    private enum State { PickBase, PickTarget }
    private State state = State.PickBase;
    private Point2D basePt = new Point2D(0, 0);
    private Point2D current = new Point2D(0, 0);
    private readonly Editor editor;   // doc + seçim + CommandManager'a erişim

    public MoveTool(Editor editor) { this.editor = editor; }

    public string Prompt => state == State.PickBase ? "Taban noktasını seçin" : "Hedef noktayı seçin (Esc: iptal)";

    public void OnMouseDown(Point2D p)
    {
        if (state == State.PickBase)
        {
            if (editor.Selection.Count == 0) return;
            basePt = p;
            state = State.PickTarget;
            return;
        }
        double dx = p.X - basePt.X, dy = p.Y - basePt.Y;
        var batch = new CompositeCommand("Taşı");
        foreach (Entity e in editor.Selection)
            batch.Add(new MoveCommand(e, dx, dy));
        editor.Commands.Execute(batch);   // tek Ctrl+Z ile hepsi geri gelir
        state = State.PickBase;
    }

    public void OnMouseMove(Point2D p) => current = p;
    public void Cancel() => state = State.PickBase;

    public void DrawPreview(Graphics g, Viewport vp)
    {
        if (state != State.PickTarget) return;
        Point2D a = vp.WorldToScreen(basePt), b = vp.WorldToScreen(current);
        using var pen = new Pen(Color.Gray) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dash };
        g.DrawLine(pen, (float)a.X, (float)a.Y, (float)b.X, (float)b.Y);   // lastik bant
    }
}

public class CompositeCommand : ICommand
{
    private readonly List<ICommand> parts = new List<ICommand>();
    public string Name { get; }
    public CompositeCommand(string name) { Name = name; }
    public void Add(ICommand c) => parts.Add(c);
    public void Execute() { foreach (var c in parts) c.Execute(); }
    public void Undo() { for (int i = parts.Count - 1; i >= 0; i--) parts[i].Undo(); }   // ters sırada!
}`,
      runnable: false,
      checklist: [
        'ITool arayüzünü ve Form\'un aktif araca olay iletmesini kurdum',
        'Çizgi / dikdörtgen / daire araçları AddEntityCommand ile çalışıyor (aktif katmana ekleniyor)',
        'Seç aracı (kilitli ve gizli katmanları atlayarak) ve Delete tuşu DeleteCommand ile çalışıyor',
        'MoveTool ve RotateTool taban noktası + önizleme ile çalışıyor; CompositeCommand ile tek adımda geri alınıyor',
        'Mesafe/açı ve alan ölçüm araçları sonucu durum çubuğunda gösteriyor',
        'Uç nokta (kare) ve ızgara (artı) yakalama işaretleri görünüyor; Esc her araçta iptal ediyor',
      ],
    },
    {
      title: 'Adım 11 — Visual Studio: kaydet / aç (metin ve JSON)',
      body: `
<p>Adım 8'deki metin biçimini dosya diyaloglarına bağla, ardından aynı belgeyi <b>JSON</b> olarak da kaydetmeyi dene. .NET 8 ile gelen <code>System.Text.Json</code> ek paket gerektirmez.</p>
<ul>
<li><code>SaveFileDialog</code> / <code>OpenFileDialog</code>: <code>Filter = "MiniCAD (*.mcad)|*.mcad|JSON (*.json)|*.json"</code>.</li>
<li><b>Kirli bayrak</b> (<t en="dirty flag" ja="変更フラグ">dirty flag</t>): her komuttan sonra <code>isDirty = true</code> ve pencere başlığında <code>*</code>. Kaydedince temizle. <code>FormClosing</code>'de kaydedilmemiş değişiklik varsa "Kaydetmek ister misiniz?" diye sor (<code>MessageBoxButtons.YesNoCancel</code>).</li>
<li>Dosya açınca: yeni <code>Document</code>, komut yığınlarını temizle (eski belgenin geri alma geçmişi yeni belgeye uygulanamaz!), katman panelini yeniden doldur.</li>
<li>Hata: <code>Parse</code> bir <code>FormatException</code> fırlatırsa mesajını kullanıcıya göster; uygulama çökmemeli.</li>
</ul>
<p><b>JSON ve DTO:</b> <code>Entity</code> soyut ve içinde <code>Layer</code> nesnesine referans var; bunu doğrudan JSON'a çevirmek karmaşıklaşır. Bunun yerine sadece veri taşıyan basit sınıflar (<t en="DTO: data transfer object" ja="DTO">DTO</t>) kullan: <code>EntityDto { Type, Id, Layer, double[] Values }</code>. Böylece dosya biçimi, iç model sınıflarından bağımsız kalır; modeli değiştirdiğinde eski dosyalar bozulmaz.</p>`,
      code: cs`// IO/JsonStorage.cs
using System.Globalization;
using System.Text.Json;

public class LayerDto { public string Name { get; set; } = ""; public bool Visible { get; set; } public bool Locked { get; set; } }
public class EntityDto { public string Type { get; set; } = ""; public string Id { get; set; } = ""; public string Layer { get; set; } = ""; public double[] Values { get; set; } = Array.Empty<double>(); }
public class DocumentDto { public int Version { get; set; } = 1; public List<LayerDto> Layers { get; set; } = new(); public List<EntityDto> Entities { get; set; } = new(); }

public static class JsonStorage
{
    private static readonly JsonSerializerOptions Options = new JsonSerializerOptions { WriteIndented = true };

    public static void Save(Document doc, string path)
    {
        var dto = new DocumentDto();
        foreach (Layer l in doc.Layers.Values)
            dto.Layers.Add(new LayerDto { Name = l.Name, Visible = l.Visible, Locked = l.Locked });
        foreach (Entity e in doc.Entities)
            dto.Entities.Add(e.ToDto());   // her varlık kendi DTO'sunu üretir
        File.WriteAllText(path, JsonSerializer.Serialize(dto, Options));
    }
}

// MainForm.cs — metin biçimiyle kaydet
private string? currentPath;
private bool isDirty;

private void mnuSave_Click(object sender, EventArgs e)
{
    if (currentPath == null)
    {
        using var dlg = new SaveFileDialog { Filter = "MiniCAD (*.mcad)|*.mcad|JSON (*.json)|*.json" };
        if (dlg.ShowDialog(this) != DialogResult.OK) return;
        currentPath = dlg.FileName;
    }
    if (currentPath.EndsWith(".json")) JsonStorage.Save(doc, currentPath);
    else File.WriteAllText(currentPath, TextStorage.Serialize(doc));   // Adım 8 (InvariantCulture ile!)
    isDirty = false;
    UpdateTitle();
}

private void MarkDirty() { isDirty = true; UpdateTitle(); }
private void UpdateTitle() => Text = "MiniCAD - " + (currentPath != null ? Path.GetFileName(currentPath) : "Adsız") + (isDirty ? " *" : "");

private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
{
    if (!isDirty) return;
    var r = MessageBox.Show("Değişiklikler kaydedilsin mi?", "MiniCAD", MessageBoxButtons.YesNoCancel);
    if (r == DialogResult.Cancel) e.Cancel = true;
    else if (r == DialogResult.Yes) mnuSave_Click(this, EventArgs.Empty);
}`,
      runnable: false,
      checklist: [
        'Metin biçimi (.mcad) ile kaydet / aç çalışıyor; sayılar InvariantCulture ile yazılıp okunuyor',
        'JSON ile kaydetme DTO sınıfları üzerinden çalışıyor (WriteIndented ile okunaklı)',
        'Pencere başlığında kaydedilmemiş değişiklik için * görünüyor; kapatırken soruluyor',
        'Dosya açınca komut yığınları temizleniyor ve katman paneli yenileniyor',
        'Bozuk bir dosyayı açmayı denedim: satır numaralı hata mesajı çıktı, uygulama çökmedi',
      ],
    },
    {
      title: 'Adım 12 — Portfolyo ve Japonca teknik mülakat hazırlığı',
      body: `
<p>Bu proje, portfolyonun <b>vitrini</b>. Kodun kadar onu nasıl sunduğun da önemli.</p>
<ul>
<li><b>README</b>: tek cümlelik tanım, 20–30 saniyelik bir GIF (çiz → yakala → taşı → döndür → geri al → ölç → kaydet), özellik listesi, nasıl derlenir, mimari şema, "Neler öğrendim", "Gelecek planları".</li>
<li><b>Mimari şema</b>: Adım 1'deki dört katman. GitHub README'de <b>Mermaid</b> diyagramlarını doğrudan çizer (<code>flowchart LR</code>).</li>
<li><b>Testler</b>: Tarayıcıda geçtiğin alıştırmaları bir <b>xUnit</b> test projesine taşı (RotateAround, Snap, Area, CommandManager, Parse round-trip). "Testleri var" demek, mülakatta ciddi bir artı.</li>
<li><b>Commit geçmişi</b>: küçük, anlamlı commit mesajları ("Add RotateTool with base point preview").</li>
</ul>
<p><b>Japonca mülakatta anlatmak için kalıplar</b> (yüksek sesle, kendi projenle pratik yap):</p>
<table class="compare">
<tr><th>Japonca</th><th>Okunuş</th><th>Türkçe</th></tr>
<tr><td>このアプリは、ドキュメント・コマンド・ビューの三つの層に分けて設計しました。</td><td>Kono apuri wa, dokyumento, komando, byū no mittsu no sō ni wakete sekkei shimashita.</td><td>Bu uygulamayı belge, komut ve görünüm olmak üzere üç katmana ayırarak tasarladım.</td></tr>
<tr><td>元に戻す・やり直し機能は、コマンドパターンで実装しました。</td><td>Moto ni modosu / yarinaoshi kinō wa, komando patān de jissō shimashita.</td><td>Geri al / yinele özelliğini komut deseniyle uyguladım.</td></tr>
<tr><td>スナップは端点を優先し、なければグリッドに合わせます。</td><td>Sunappu wa tanten o yūsen shi, nakereba guriddo ni awasemasu.</td><td>Yakalamada uç noktaya öncelik verir, yoksa ızgaraya hizalarım.</td></tr>
<tr><td>一番苦労したのは、座標変換のデバッグでした。</td><td>Ichiban kurō shita no wa, zahyō henkan no debaggu deshita.</td><td>En çok zorlandığım şey koordinat dönüşümünün hata ayıklamasıydı.</td></tr>
<tr><td>今後は、DXF形式の読み込みに対応したいと考えています。</td><td>Kongo wa, DXF keishiki no yomikomi ni taiō shitai to kangaete imasu.</td><td>İleride DXF biçimini okuyabilmesini istiyorum.</td></tr>
<tr><td>3DCGの経験を活かして、CADの開発に貢献したいです。</td><td>Surī-dī shī-jī no keiken o ikashite, CAD no kaihatsu ni kōken shitai desu.</td><td>3D grafik deneyimimi kullanarak CAD geliştirmeye katkıda bulunmak istiyorum.</td></tr>
</table>
<div class="callout tip">Mülakatta sık gelen soru tipleri: "Neden bu tasarımı seçtiniz?" (なぜこの設計にしたのですか？), "Bir hatayı nasıl buldunuz?", "Daha fazla zamanınız olsaydı neyi değiştirirdiniz?" Her biri için projenden somut bir örnek hazırla: ör. banker yuvarlaması yüzünden ızgaranın yanlış yapışması ya da Türkçe Windows'ta ondalık ayırıcı sorunu. Somut bir hata hikâyesi, ezberlenmiş cevaptan çok daha ikna edicidir.</div>`,
      checklist: [
        'README: tanım, GIF, özellikler, derleme adımları, mimari şema (Mermaid), Neler öğrendim, Gelecek planları',
        'Tarayıcı alıştırmalarını xUnit test projesine taşıdım ve tüm testler geçiyor',
        'GitHub deposunu düzenledim: .gitignore, anlamlı commit mesajları, bir v1.0 sürüm etiketi (release)',
        'Projeyi Türkçe 2 dakikada, Japonca 1 dakikada anlatmayı sesli olarak prova ettim',
        'Somut bir "zorlandığım hata ve nasıl çözdüm" hikâyesi hazırladım',
        'Beş projenin bağlantılarını tek bir portfolyo README\'sinde ya da GitHub profil sayfasında topladım',
      ],
    },
  ],
  finalChecklist: [
    'GitHub deposu herkese açık; README\'nin en üstünde GIF ve tek cümlelik tanım var',
    'Mimari şema (Mermaid veya draw.io): Document / Commands / Tools / View / IO / Geometry',
    'Özellik listesi: çizim, seçim, taşı, taban noktası etrafında döndür, sil, katmanlar, ızgara ve uç nokta yakalama, mesafe/açı/alan ölçümü, Geri Al/Yinele, mm koordinatlı durum çubuğu, metin ve JSON kaydetme',
    'xUnit testleri: döndürme, yakalama, ölçüm, alan, komut yığınları, dosya round-trip',
    'README\'de "Tasarım kararları": neden komut deseni, neden DTO, neden InvariantCulture, neden AwayFromZero',
    'README\'de Japonca özet: 「C#とWindows Formsで作成したミニCADです。コマンドパターンによる元に戻す・やり直し、スナップ、レイヤー機能があります。」',
    'Japonca 1 dakikalık proje anlatımını prova ettim ve kendi cümlelerimle yazdım',
  ],
  extensions: [
    'DXF (ASCII) dosyalarından LINE ve CIRCLE varlıklarını içe aktar',
    'Orta nokta, kesişim ve dik (perpendicular) yakalama türleri',
    'Ortho modu (F8 gibi): çizgileri yatay/dikey kilitle',
    'Ölçü (dimension) varlığı: iki nokta arası uzunluğu okla ve metinle çizimde kalıcı göster',
    'Kopyala, aynala (mirror) ve ölçekle (scale around base point) komutları',
    'Polyline varlığı ve kapalı polyline\'lar için otomatik alan etiketi (oda alanı)',
    'PDF ya da PNG\'ye çıktı alma (PrintDocument / Bitmap)',
  ],
  vocab: [
    { en: 'Undo', tr: 'Geri al', ja: '元に戻す', kana: 'もとにもどす', romaji: 'moto ni modosu' },
    { en: 'Redo', tr: 'Yinele', ja: 'やり直し', kana: 'やりなおし', romaji: 'yarinaoshi' },
    { en: 'Layer', tr: 'Katman', ja: 'レイヤー', kana: 'レイヤー', romaji: 'reiyā' },
    { en: 'Snap', tr: 'Yakalama', ja: 'スナップ', kana: 'スナップ', romaji: 'sunappu' },
    { en: 'Grid', tr: 'Izgara', ja: 'グリッド', kana: 'グリッド', romaji: 'guriddo' },
    { en: 'Endpoint', tr: 'Uç nokta', ja: '端点', kana: 'たんてん', romaji: 'tanten' },
    { en: 'Base point', tr: 'Taban noktası', ja: '基点', kana: 'きてん', romaji: 'kiten' },
    { en: 'Dimension', tr: 'Ölçü', ja: '寸法', kana: 'すんぽう', romaji: 'sunpō' },
    { en: 'Area', tr: 'Alan', ja: '面積', kana: 'めんせき', romaji: 'menseki' },
    { en: 'Angle', tr: 'Açı', ja: '角度', kana: 'かくど', romaji: 'kakudo' },
    { en: 'Save', tr: 'Kaydetmek', ja: '保存', kana: 'ほぞん', romaji: 'hozon' },
    { en: 'Design', tr: 'Tasarım', ja: '設計', kana: 'せっけい', romaji: 'sekkei' },
  ],
};
