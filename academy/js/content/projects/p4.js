import { cs } from '../helpers.js';

// --- Önceki adımlarda yazılan sınıflar (sonraki başlangıç kodlarında hazır verilir) ---
const VEC3 = cs`class Vec3
{
    public double X { get; }
    public double Y { get; }
    public double Z { get; }
    public Vec3(double x, double y, double z) { X = x; Y = y; Z = z; }
    public Vec3 Add(Vec3 o) => new Vec3(X + o.X, Y + o.Y, Z + o.Z);
    public Vec3 Sub(Vec3 o) => new Vec3(X - o.X, Y - o.Y, Z - o.Z);
    public Vec3 Scale(double s) => new Vec3(X * s, Y * s, Z * s);
    public double Length() => Math.Sqrt(X * X + Y * Y + Z * Z);
    static string F(double v) => (Math.Abs(v) < 0.005 ? 0.0 : v).ToString("F2");
    public override string ToString() => "(" + F(X) + ", " + F(Y) + ", " + F(Z) + ")";
}`;

const IMEAS = cs`interface IMeasurable
{
    double Volume();
    double SurfaceArea();
}`;

const SOLID_NB = cs`abstract class Solid : IMeasurable
{
    public string Name { get; set; }
    public Vec3 Center { get; set; }
    protected Solid(string name, Vec3 center) { Name = name; Center = center; }

    public abstract string Kind { get; }
    public abstract double Volume();
    public abstract double SurfaceArea();

    protected static void CheckPositive(double v, string what)
    {
        if (v <= 0) throw new ArgumentException(what + " 0'dan büyük olmalı: " + v);
    }
}`;

const SOLID_B = cs`abstract class Solid : IMeasurable
{
    public string Name { get; set; }
    public Vec3 Center { get; set; }
    protected Solid(string name, Vec3 center) { Name = name; Center = center; }

    public abstract string Kind { get; }
    public abstract double Volume();
    public abstract double SurfaceArea();
    public abstract Aabb GetBounds();

    protected static void CheckPositive(double v, string what)
    {
        if (v <= 0) throw new ArgumentException(what + " 0'dan büyük olmalı: " + v);
    }
}`;

const BOX_HEAD = cs`class Box : Solid
{
    public double Width { get; }   // X
    public double Depth { get; }   // Y
    public double Height { get; }  // Z
    public Box(string name, Vec3 center, double w, double d, double h) : base(name, center)
    {
        CheckPositive(w, "Genişlik"); CheckPositive(d, "Derinlik"); CheckPositive(h, "Yükseklik");
        Width = w; Depth = d; Height = h;
    }
    public override string Kind => "Box";
    public override double Volume() => Width * Depth * Height;
    public override double SurfaceArea() => 2 * (Width * Depth + Width * Height + Depth * Height);`;

const SPHERE_HEAD = cs`class Sphere : Solid
{
    public double Radius { get; }
    public Sphere(string name, Vec3 center, double r) : base(name, center) { CheckPositive(r, "Yarıçap"); Radius = r; }
    public override string Kind => "Sphere";
    public override double Volume() => 4.0 / 3.0 * Math.PI * Radius * Radius * Radius;
    public override double SurfaceArea() => 4 * Math.PI * Radius * Radius;`;

const CYL_HEAD = cs`class Cylinder : Solid
{
    public double Radius { get; }
    public double Height { get; }   // Z ekseni boyunca (Z-up)
    public Cylinder(string name, Vec3 center, double r, double h) : base(name, center)
    {
        CheckPositive(r, "Yarıçap"); CheckPositive(h, "Yükseklik");
        Radius = r; Height = h;
    }
    public override string Kind => "Cylinder";
    public override double Volume() => Math.PI * Radius * Radius * Height;
    public override double SurfaceArea() => 2 * Math.PI * Radius * (Radius + Height);`;

const BOX_BOUNDS = cs`
    public override Aabb GetBounds()
    {
        var half = new Vec3(Width / 2, Depth / 2, Height / 2);
        return new Aabb(Center.Sub(half), Center.Add(half));
    }`;
const SPHERE_BOUNDS = cs`
    public override Aabb GetBounds()
    {
        var half = new Vec3(Radius, Radius, Radius);
        return new Aabb(Center.Sub(half), Center.Add(half));
    }`;
const CYL_BOUNDS = cs`
    public override Aabb GetBounds()
    {
        var half = new Vec3(Radius, Radius, Height / 2);
        return new Aabb(Center.Sub(half), Center.Add(half));
    }`;

const SOLIDS_NB = SOLID_NB + '\n\n' + BOX_HEAD + '\n}\n\n' + SPHERE_HEAD + '\n}\n\n' + CYL_HEAD + '\n}';
const SOLIDS_B = SOLID_B + '\n\n' + BOX_HEAD + BOX_BOUNDS + '\n}\n\n' + SPHERE_HEAD + SPHERE_BOUNDS + '\n}\n\n' + CYL_HEAD + CYL_BOUNDS + '\n}';

const AABB_HEAD = cs`class Aabb
{
    public Vec3 Min { get; }
    public Vec3 Max { get; }
    public Aabb(Vec3 min, Vec3 max) { Min = min; Max = max; }
    public Vec3 Size() => Max.Sub(Min);
    public Vec3 Center() => Min.Add(Max).Scale(0.5);
    public override string ToString() => "Min " + Min + " Max " + Max;`;

const AABB_UNION = cs`
    public Aabb Union(Aabb o)
    {
        var min = new Vec3(Math.Min(Min.X, o.Min.X), Math.Min(Min.Y, o.Min.Y), Math.Min(Min.Z, o.Min.Z));
        var max = new Vec3(Math.Max(Max.X, o.Max.X), Math.Max(Max.Y, o.Max.Y), Math.Max(Max.Z, o.Max.Z));
        return new Aabb(min, max);
    }`;

const AABB_INTERSECT = cs`
    public bool Intersects(Aabb o)
    {
        return Min.X <= o.Max.X && Max.X >= o.Min.X
            && Min.Y <= o.Max.Y && Max.Y >= o.Min.Y
            && Min.Z <= o.Max.Z && Max.Z >= o.Min.Z;
    }

    public bool Contains(Vec3 p)
    {
        return p.X >= Min.X && p.X <= Max.X
            && p.Y >= Min.Y && p.Y <= Max.Y
            && p.Z >= Min.Z && p.Z <= Max.Z;
    }`;

const AABB_V5 = AABB_HEAD + '\n}';
const AABB_V6 = AABB_HEAD + AABB_UNION + '\n}';
const AABB_V7 = AABB_HEAD + AABB_UNION + AABB_INTERSECT + '\n}';

const SCENE_BOUNDS = cs`Aabb SceneBounds(List<Solid> solids)
{
    if (solids.Count == 0) throw new InvalidOperationException("Sahne boş");
    Aabb result = solids[0].GetBounds();
    for (int i = 1; i < solids.Count; i++)
        result = result.Union(solids[i].GetBounds());
    return result;
}`;

const LIB_V7 = SOLIDS_B + '\n\n' + AABB_V7 + '\n\n' + IMEAS + '\n\n' + VEC3;

export default {
  kind: 'project',
  id: 'p4',
  module: 'm8',
  title: 'Proje 4: Basit 3D Geometri Aracı',
  titleEn: 'Simple 3D Geometry Tool',
  titleJa: '3D形状ツール',
  minutes: 900,
  level: 4,
  environment: 'desktop',
  demo: 'geometry3d',
  summary: `
<p>Kutu, küre ve silindir gibi temel <t en="solid" ja="ソリッド">katı</t> nesneleri oluşturan; boyutlarını, <t en="volume" ja="体積">hacimlerini</t>, <t en="surface area" ja="表面積">yüzey alanlarını</t>, nesne merkezleri arasındaki uzaklıkları ve <t en="axis-aligned bounding box" ja="軸平行境界ボックス">eksene hizalı sınırlayıcı kutuları</t> (AABB) hesaplayan bir araç. Sınırlayıcı kutularla sahnenin toplam sınırlarını bulacak ve nesnelerin <b>çakışıp çakışmadığını</b> kontrol edeceksin — BIM yazılımlarındaki <b>çakışma kontrolünün</b> (<t en="clash detection" ja="干渉チェック">clash detection</t>) en basit hâli.</p>
<p>Tüm hesaplar tarayıcıda alıştırmalarla yazılır ve test edilir. Sonra Visual Studio'da Proje 3'teki kendi 3D çizicini yeniden kullanarak nesneleri ve sınırlayıcı kutularını çizecek, nesneleri bir <code>ListBox</code>'ta listeleyip özelliklerini bir <code>PropertyGrid</code> panelinde düzenleyeceksin.</p>`,
  goals: [
    'Soyut Solid sınıfı ve IMeasurable arayüzü ile ortak bir geometri API\'si tasarlamak',
    'Kutu, küre ve silindirin hacim ve yüzey alanını doğru formüllerle hesaplamak (4/3 tamsayı bölme tuzağı dahil)',
    'Nesne merkezleri arası uzaklıkları ve en yakın nesneyi bulmak',
    'Her nesne için AABB hesaplamak, AABB\'leri birleştirerek sahne sınırlarını bulmak',
    'AABB kesişim testiyle basit bir çakışma kontrolü yazmak',
    'WinForms\'ta ListBox + PropertyGrid ile nesne listesi ve özellik paneli kurmak; P3 çizicisini yeniden kullanmak',
  ],
  skills: ['Soyut sınıf + interface', 'Kurucuda doğrulama (ArgumentException)', 'Hacim / alan formülleri', 'AABB: birleşim ve kesişim', 'LINQ (OrderByDescending, Sum)', 'Biçimli tablo çıktısı', 'ListBox, PropertyGrid', 'Kod yeniden kullanımı'],
  steps: [
    {
      title: 'Adım 1 — Plan: nesne modeli ve P3\'ten yeniden kullanım',
      body: `
<p>Bu projede üç tür katı nesne var. Hepsinin ortak soruları aynı: <i>hacmin ne? alanın ne? sınırların nerede?</i> Bu ortaklığı iki katmanda ifade edeceğiz:</p>
<ul>
<li><code>interface IMeasurable</code> — "ölçülebilir olan her şey": <code>Volume()</code>, <code>SurfaceArea()</code>. Arayüz bir <b>sözleşmedir</b>; ileride bir duvar ya da döşeme sınıfı da bu sözleşmeyi uygulayabilir.</li>
<li><code>abstract class Solid : IMeasurable</code> — ortak <b>veri</b> (ad, merkez) ve ortak <b>davranış</b> (boyut doğrulama). Alt sınıflar: <code>Box</code>, <code>Sphere</code>, <code>Cylinder</code>.</li>
</ul>
<p>Arayüz mü soyut sınıf mı? Kısa kural: <b>ortak kod/veri</b> paylaşılacaksa soyut sınıf; sadece <b>yetenek</b> tanımlanacaksa arayüz. Bir sınıf tek bir sınıftan kalıtım alabilir ama birden çok arayüz uygulayabilir.</p>
<p><b>Koordinatlar:</b> P3'teki gibi Z-up. Her nesnenin <code>Center</code>'ı kendi geometrik merkezidir; silindirin ekseni Z'dir. Nesneler bu projede döndürülmez (eksene hizalı), bu sayede kutunun AABB'si kutunun kendisidir.</p>
<p><b>Kurulum:</b> Visual Studio'da yeni bir <b>Windows Forms App (.NET 8)</b>: <code>Geometry3D</code>. P3'teki <code>Math3D</code> klasörünü (Vec3, Vec2, Transform, Camera) kopyala ya da daha iyisi: <i>Solution → Add → New Project → Class Library</i> ile <code>Math3D</code> adında bir kütüphane yapıp iki projeden de referans ver. Kodu kopyalamak yerine paylaşmak, gerçek ekiplerde standarttır.</p>`,
      checklist: [
        'IMeasurable arayüzü ile Solid soyut sınıfının rollerini ayırt edebiliyorum',
        'Geometry3D adlı Windows Forms App (.NET 8) projesini oluşturdum',
        'P3\'teki Vec3 / Camera kodunu bu projeye taşıdım (kopya veya Class Library referansı)',
        'Model klasörü oluşturdum (Solid, Box, Sphere, Cylinder, Aabb buraya gelecek)',
      ],
    },
    {
      title: 'Adım 2 — Box: boyut, hacim, yüzey alanı ve doğrulama',
      body: `
<p>İlk somut sınıf: <b>Box</b> (dikdörtgenler prizması). Genişlik X, derinlik Y, yükseklik Z boyunca.</p>
<pre>Hacim       = w · d · h
Yüzey alanı = 2 · (w·d + w·h + d·h)     (karşılıklı 3 çift yüz)</pre>
<p><b>Kurucuda doğrulama:</b> Negatif ya da sıfır boyutlu bir kutu anlamsızdır. Böyle bir nesnenin <b>hiç oluşmaması</b> gerekir. Kurucu bir <code>ArgumentException</code> fırlatırsa, nesne yarım yamalak bir hâlde programda dolaşamaz. Bu, "geçersiz durumu temsil edilemez yap" ilkesidir. Ortak <code>CheckPositive</code> yardımcısı <code>Solid</code>'de hazır; <code>protected static</code> olduğu için sadece alt sınıflar kullanabilir.</p>
<div class="callout tip">CAD bağlantısı: Bir CAD programında "kutu" komutunda yüksekliğe 0 yazarsan program hata verir ya da girdiyi reddeder. O kontrol, tam olarak böyle bir kurucu ya da fabrika metodunda yaşar.</div>`,
      exercise: {
        title: 'Box sınıfı',
        prompt: `
<p><code>Box</code> sınıfını tamamla:</p>
<ul>
<li>Kurucu: üç boyutu <code>CheckPositive</code> ile doğrula ("Genişlik", "Derinlik", "Yükseklik") ve özelliklere ata.</li>
<li><code>Volume()</code> ve <code>SurfaceArea()</code> formüllerini yaz.</li>
</ul>
<pre class="expected">Box(2, 3, 4)     → hacim 24.00, alan 52.00
Box(1.5, 2, 0.5) → hacim 1.50, alan 9.50
Box(2, -1, 3)    → ArgumentException: Derinlik 0'dan büyük olmalı: -1</pre>`,
        starter: cs`var b = new Box("Kutu A", new Vec3(0, 0, 0), 2, 3, 4);
Console.WriteLine(b.Name + ": " + b.Volume().ToString("F2") + " / " + b.SurfaceArea().ToString("F2"));

class Box : Solid
{
    public double Width { get; }   // X
    public double Depth { get; }   // Y
    public double Height { get; }  // Z

    public Box(string name, Vec3 center, double w, double d, double h) : base(name, center)
    {
        // boyutları doğrula ve ata
    }

    public override string Kind => "Box";
    public override double Volume() { return 0; }
    public override double SurfaceArea() { return 0; }
}

` + SOLID_NB + '\n\n' + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: 'Kutu A: 24.00 / 52.00', msg: 'Kutu A için hacim 24.00, alan 52.00 olmalı' },
          { type: 'harness', append: cs`var k = new Box("K", new Vec3(5, 5, 5), 1.5, 2, 0.5);
Console.WriteLine(k.Volume().ToString("F2") + " " + k.SurfaceArea().ToString("F2"));
Console.WriteLine(k.Width + " " + k.Depth + " " + k.Height);`, expect: '1.50 9.50\n1.5 2 0.5', msg: 'Boyutlar özelliklere atanmalı ve formüller doğru olmalı' },
          { type: 'harness', append: cs`try { new Box("X", new Vec3(0, 0, 0), 2, -1, 3); Console.WriteLine("hata yok"); }
catch (ArgumentException e) { Console.WriteLine(e.Message); }
try { new Box("Y", new Vec3(0, 0, 0), 2, 1, 0); Console.WriteLine("hata yok"); }
catch (ArgumentException e) { Console.WriteLine(e.Message); }`, expect: "Derinlik 0'dan büyük olmalı: -1\nYükseklik 0'dan büyük olmalı: 0", msg: 'Geçersiz boyutta kurucu ArgumentException fırlatmalı' },
          { type: 'harness', append: cs`IMeasurable m = new Box("Z", new Vec3(0, 0, 0), 1, 1, 1);
Console.WriteLine(m.Volume() + " " + m.SurfaceArea());`, expect: '1 6', msg: 'Box, IMeasurable olarak da kullanılabilmeli (birim küp: 1 ve 6)' },
        ],
        hints: [
          'Kurucuda önce üç <code>CheckPositive(...)</code> çağrısı, sonra <code>Width = w;</code> gibi üç atama.',
          '<code>CheckPositive(d, "Derinlik");</code> — mesajdaki kelimeler görevdekiyle aynı olmalı.',
          'Alan: <code>2 * (Width * Depth + Width * Height + Depth * Height)</code>. Hacim üç boyutun çarpımı.',
        ],
        solution: cs`var b = new Box("Kutu A", new Vec3(0, 0, 0), 2, 3, 4);
Console.WriteLine(b.Name + ": " + b.Volume().ToString("F2") + " / " + b.SurfaceArea().ToString("F2"));

` + BOX_HEAD + '\n}\n\n' + SOLID_NB + '\n\n' + IMEAS + '\n\n' + VEC3,
        explain: 'Kurucu, nesnenin "geçerli doğmasını" garanti eden tek kapıdır. Doğrulamayı oraya koyunca, programın geri kalanında <code>if (box.Width &gt; 0)</code> kontrollerine gerek kalmaz.',
      },
    },
    {
      title: 'Adım 3 — Sphere ve Cylinder (ve 4/3 tuzağı)',
      body: `
<pre>Küre:     V = 4/3 · π · r³          A = 4 · π · r²
Silindir: V = π · r² · h            A = 2·π·r² + 2·π·r·h = 2·π·r·(r + h)</pre>
<p>Silindirin alanı: iki daire kapak (<code>2·π·r²</code>) + yan yüzey. Yan yüzeyi açıp düzleştirdiğini düşün: genişliği çevre (<code>2·π·r</code>), yüksekliği <code>h</code> olan bir dikdörtgen. UV açmak (unwrap) tam olarak budur!</p>
<div class="callout warn"><b>Klasik tuzak:</b> <code>4 / 3 * Math.PI</code> yazarsan sonuç <code>π</code> olur, <code>4.18</code> değil! <code>4</code> ve <code>3</code> iki <code>int</code> olduğu için <code>4 / 3</code> tam sayı bölmesidir ve <b>1</b> verir. Doğrusu: <code>4.0 / 3.0</code> (ya da <code>4.0 / 3</code>). Bu hata derlenir, çalışır ve sessizce yanlış sonuç verir — en tehlikeli hata türü.</div>`,
      code: cs`Console.WriteLine(4 / 3);
Console.WriteLine(4 / 3 * Math.PI);
Console.WriteLine(4.0 / 3 * Math.PI);`,
      runnable: true,
      exercise: {
        title: 'Sphere ve Cylinder',
        prompt: `
<p><code>Sphere</code> ve <code>Cylinder</code> sınıflarındaki <code>Volume()</code> ve <code>SurfaceArea()</code> metotlarını yaz (kurucular hazır).</p>
<pre class="expected">Sphere r=1         → 4.19 / 12.57
Sphere r=2         → 33.51 / 50.27
Cylinder r=1, h=2  → 6.28 / 18.85</pre>`,
        starter: cs`var s = new Sphere("Top", new Vec3(0, 0, 0), 1);
var c = new Cylinder("Kolon", new Vec3(0, 0, 0), 1, 2);
Console.WriteLine(s.Volume().ToString("F2") + " / " + s.SurfaceArea().ToString("F2"));
Console.WriteLine(c.Volume().ToString("F2") + " / " + c.SurfaceArea().ToString("F2"));

class Sphere : Solid
{
    public double Radius { get; }
    public Sphere(string name, Vec3 center, double r) : base(name, center) { CheckPositive(r, "Yarıçap"); Radius = r; }
    public override string Kind => "Sphere";
    public override double Volume() { return 0; }
    public override double SurfaceArea() { return 0; }
}

class Cylinder : Solid
{
    public double Radius { get; }
    public double Height { get; }   // Z ekseni boyunca (Z-up)
    public Cylinder(string name, Vec3 center, double r, double h) : base(name, center)
    {
        CheckPositive(r, "Yarıçap"); CheckPositive(h, "Yükseklik");
        Radius = r; Height = h;
    }
    public override string Kind => "Cylinder";
    public override double Volume() { return 0; }
    public override double SurfaceArea() { return 0; }
}

` + SOLID_NB + '\n\n' + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: '4.19 / 12.57\n6.28 / 18.85', msg: 'Örnek küre ve silindir değerleri doğru olmalı' },
          { type: 'harness', append: cs`var s2 = new Sphere("S", new Vec3(1, 1, 1), 2);
Console.WriteLine(s2.Volume().ToString("F2") + " " + s2.SurfaceArea().ToString("F2"));
var s3 = new Sphere("S", new Vec3(0, 0, 0), 0.5);
Console.WriteLine(s3.Volume().ToString("F3") + " " + s3.SurfaceArea().ToString("F3"));`, expect: '33.51 50.27\n0.524 3.142', msg: 'Küre hacmi 4/3·π·r³ (tam sayı bölmesine dikkat), alanı 4·π·r² olmalı' },
          { type: 'harness', append: cs`var c2 = new Cylinder("C", new Vec3(0, 0, 0), 0.5, 4);
Console.WriteLine(c2.Volume().ToString("F2") + " " + c2.SurfaceArea().ToString("F2"));
var c3 = new Cylinder("C", new Vec3(0, 0, 0), 3, 1);
Console.WriteLine(c3.Volume().ToString("F2") + " " + c3.SurfaceArea().ToString("F2"));`, expect: '3.14 14.14\n28.27 75.40', msg: 'Silindir: hacim π·r²·h, alan iki kapak + yan yüzey' },
          { type: 'harness', append: cs`var list = new List<Solid> { new Sphere("a", new Vec3(0, 0, 0), 1), new Cylinder("b", new Vec3(0, 0, 0), 1, 1) };
foreach (Solid x in list) Console.WriteLine(x.Kind + " " + x.Volume().ToString("F2"));`, expect: 'Sphere 4.19\nCylinder 3.14', msg: 'Solid listesi üzerinden çok biçimli çağrılar çalışmalı' },
        ],
        hints: [
          'C#\'ta üs operatörü yok; <code>r³</code> için <code>Radius * Radius * Radius</code> yaz (ya da <code>Math.Pow(Radius, 3)</code>).',
          'Küre hacmi: <code>4.0 / 3.0 * Math.PI * Radius * Radius * Radius</code>. <code>4 / 3</code> yazarsan neden yanlış olduğunu yukarıdaki kodda gördün.',
          'Silindir alanı: <code>2 * Math.PI * Radius * (Radius + Height)</code>; hacmi <code>Math.PI * Radius * Radius * Height</code>.',
        ],
        solution: cs`var s = new Sphere("Top", new Vec3(0, 0, 0), 1);
var c = new Cylinder("Kolon", new Vec3(0, 0, 0), 1, 2);
Console.WriteLine(s.Volume().ToString("F2") + " / " + s.SurfaceArea().ToString("F2"));
Console.WriteLine(c.Volume().ToString("F2") + " / " + c.SurfaceArea().ToString("F2"));

` + SPHERE_HEAD + '\n}\n\n' + CYL_HEAD + '\n}\n\n' + SOLID_NB + '\n\n' + IMEAS + '\n\n' + VEC3,
        explain: 'Formüller basit; asıl ders tip sistemiyle ilgili: C# iki <code>int</code>\'i böldüğünde sonucu da <code>int</code> yapar. Sabitleri <code>4.0</code> gibi yazmak, niyetini hem derleyiciye hem okuyana açıkça söyler.',
      },
    },
    {
      title: 'Adım 4 — Merkezler arası uzaklık ve en yakın nesne',
      body: `
<p>İki nesnenin merkezleri arasındaki uzaklık, P3'teki vektör işlemleriyle tek satırdır: <code>a.Center.Sub(b.Center).Length()</code>.</p>
<p>İki küre için daha anlamlı bir ölçü <b>boşluk</b> (gap): yüzeyler arası en kısa mesafe = merkez uzaklığı − r₁ − r₂. Negatifse küreler iç içe geçmiştir. Mimaride bu, "iki eleman arasında yeterli boşluk var mı?" sorusudur (ör. bir boru ile bir kiriş arasında bakım için gereken mesafe).</p>
<p><b>En yakın nesne</b> araması klasik bir döngü kalıbıdır: "şimdiye kadarki en iyi" değeri tut, her elemanı onunla karşılaştır. Dikkat: nesnenin <b>kendisini</b> atlamalısın (kendine uzaklığı 0'dır!).</p>`,
      exercise: {
        title: 'CenterDistance, SphereGap, Nearest',
        prompt: `
<p>Üç fonksiyon yaz:</p>
<ul>
<li><code>double CenterDistance(Solid a, Solid b)</code></li>
<li><code>double SphereGap(Sphere a, Sphere b)</code> — merkez uzaklığı − iki yarıçap</li>
<li><code>Solid? Nearest(Solid from, List&lt;Solid&gt; all)</code> — <code>from</code> dışındaki en yakın nesne; başka nesne yoksa <code>null</code></li>
</ul>
<pre class="expected">CenterDistance((0,0,0), (3,4,0))   → 5.00
SphereGap(r=1 @ (0,0,0), r=2 @ (5,0,0))    → 2.00
SphereGap(r=1 @ (0,0,0), r=1.5 @ (2,0,0))  → -0.50   (iç içe)</pre>`,
        starter: cs`double CenterDistance(Solid a, Solid b)
{
    return 0;
}

double SphereGap(Sphere a, Sphere b)
{
    return 0;
}

Solid? Nearest(Solid from, List<Solid> all)
{
    return null;
}

var s1 = new Sphere("S1", new Vec3(0, 0, 0), 1);
var s2 = new Sphere("S2", new Vec3(5, 0, 0), 2);
Console.WriteLine(CenterDistance(s1, s2).ToString("F2"));

` + SOLIDS_NB + '\n\n' + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'harness', append: cs`var a = new Box("A", new Vec3(0, 0, 0), 1, 1, 1);
var b = new Sphere("B", new Vec3(3, 4, 0), 1);
var c = new Cylinder("C", new Vec3(4, 6, 15), 1, 1);
Console.WriteLine(CenterDistance(a, b).ToString("F2"));
Console.WriteLine(CenterDistance(b, c).ToString("F2"));
Console.WriteLine(CenterDistance(c, c).ToString("F2"));`, expect: '5.00\n15.17\n0.00', msg: 'CenterDistance merkezler arası 3D uzaklığı vermeli' },
          { type: 'harness', append: cs`var p = new Sphere("P", new Vec3(0, 0, 0), 1);
Console.WriteLine(SphereGap(p, new Sphere("Q", new Vec3(5, 0, 0), 2)).ToString("F2"));
Console.WriteLine(SphereGap(p, new Sphere("R", new Vec3(2, 0, 0), 1.5)).ToString("F2"));
Console.WriteLine(SphereGap(p, new Sphere("T", new Vec3(0, 3, 4), 4)).ToString("F2"));`, expect: '2.00\n-0.50\n0.00', msg: 'SphereGap = merkez uzaklığı − r1 − r2 (negatif = iç içe)' },
          { type: 'harness', append: cs`var x = new Box("X", new Vec3(0, 0, 0), 1, 1, 1);
var y = new Sphere("Y", new Vec3(10, 0, 0), 1);
var z = new Cylinder("Z", new Vec3(0, 3, 0), 1, 1);
var w = new Box("W", new Vec3(0, 0, 8), 1, 1, 1);
var all = new List<Solid> { x, y, z, w };
Console.WriteLine(Nearest(x, all)?.Name);
Console.WriteLine(Nearest(y, all)?.Name);
Console.WriteLine(Nearest(w, all)?.Name);
Console.WriteLine(Nearest(x, new List<Solid> { x }) == null);`, expect: 'Z\nX\nX\nTrue', msg: 'Nearest kendisini atlayıp en yakın nesneyi bulmalı; başka nesne yoksa null' },
        ],
        hints: [
          '<code>CenterDistance</code>: <code>return a.Center.Sub(b.Center).Length();</code> — <code>SphereGap</code> bunu kullanıp iki yarıçapı çıkarır.',
          '<code>Nearest</code>: <code>Solid? best = null; double bestDist = double.MaxValue;</code> ile başla ve <code>foreach</code> ile tüm nesneleri gez.',
          'Döngüde: <code>if (s == from) continue;</code> sonra <code>double d = CenterDistance(from, s); if (d &lt; bestDist) { bestDist = d; best = s; }</code> — en sonda <code>return best;</code>',
        ],
        solution: cs`double CenterDistance(Solid a, Solid b)
{
    return a.Center.Sub(b.Center).Length();
}

double SphereGap(Sphere a, Sphere b)
{
    return CenterDistance(a, b) - a.Radius - b.Radius;
}

Solid? Nearest(Solid from, List<Solid> all)
{
    Solid? best = null;
    double bestDist = double.MaxValue;
    foreach (Solid s in all)
    {
        if (s == from) continue;
        double d = CenterDistance(from, s);
        if (d < bestDist)
        {
            bestDist = d;
            best = s;
        }
    }
    return best;
}

var s1 = new Sphere("S1", new Vec3(0, 0, 0), 1);
var s2 = new Sphere("S2", new Vec3(5, 0, 0), 2);
Console.WriteLine(CenterDistance(s1, s2).ToString("F2"));

` + SOLIDS_NB + '\n\n' + IMEAS + '\n\n' + VEC3,
        explain: '<code>double.MaxValue</code> ile başlamak, "henüz hiç aday yok" durumunu sade bir şekilde ifade eder: ilk gerçek uzaklık mutlaka daha küçüktür. <code>s == from</code> burada <b>referans</b> karşılaştırmasıdır: "aynı nesne mi?"',
      },
    },
    {
      title: 'Adım 5 — Sınırlayıcı kutu (AABB)',
      body: `
<p><t en="AABB: axis-aligned bounding box" ja="AABB（軸平行境界ボックス）">AABB</t>, bir nesneyi tamamen içine alan ve kenarları X/Y/Z eksenlerine paralel olan en küçük kutudur. Sadece iki nokta ile tanımlanır: <code>Min</code> ve <code>Max</code>.</p>
<svg viewBox="0 0 520 170" role="img" aria-label="Bir dairenin ve bir dikdörtgenin sınırlayıcı kutuları">
  <g font-size="12">
    <rect x="40" y="30" width="120" height="120" fill="none" stroke="var(--warn)" stroke-dasharray="5 4"/>
    <circle cx="100" cy="90" r="60" fill="none" class="ln" stroke-width="2"/>
    <circle cx="40" cy="150" r="4" class="acc"/><text x="20" y="166" class="t3">Min</text>
    <circle cx="160" cy="30" r="4" class="acc"/><text x="150" y="22" class="t3">Max</text>
    <text x="230" y="60" class="t2">Küre: Merkez ± (r, r, r)</text>
    <text x="230" y="85" class="t2">Kutu: Merkez ± (w/2, d/2, h/2)</text>
    <text x="230" y="110" class="t2">Silindir (Z-up): Merkez ± (r, r, h/2)</text>
    <text x="230" y="140" class="t3">Boyut = Max − Min, Merkez = (Min + Max) / 2</text>
  </g>
</svg>
<p>Neden bu kadar önemli? Çünkü <b>ucuz</b>. Karmaşık bir mesh'in (100.000 üçgen) bir ışınla ya da başka bir mesh'le kesişip kesişmediğini hesaplamak pahalıdır. Önce AABB'lere bakılır: kutular kesişmiyorsa nesneler de kesişemez — hesap biter. Oyun motorlarında <i>frustum culling</i>, CAD'de <i>Zoom Extents</i> (tümünü göster), seçim ve çakışma kontrolü hep AABB ile başlar. Blender'daki "Bounds" görüntüleme modu da budur.</p>`,
      exercise: {
        title: 'Aabb ve GetBounds',
        prompt: `
<p>1) <code>Aabb</code> sınıfında <code>Size()</code> (Max − Min) ve <code>Center()</code> ((Min + Max) / 2) metotlarını yaz.</p>
<p>2) Üç nesnede <code>GetBounds()</code>'u yaz.</p>
<pre class="expected">Box (1,2,3), 2×4×6         → Min (0.00, 0.00, 0.00) Max (2.00, 4.00, 6.00)
Sphere (0,0,5), r=1.5      → Min (-1.50, -1.50, 3.50) Max (1.50, 1.50, 6.50)
Cylinder (2,-2,1), r=0.5, h=2 → Min (1.50, -2.50, 0.00) Max (2.50, -1.50, 2.00)</pre>`,
        starter: cs`var box = new Box("A", new Vec3(1, 2, 3), 2, 4, 6);
Console.WriteLine(box.GetBounds());

class Aabb
{
    public Vec3 Min { get; }
    public Vec3 Max { get; }
    public Aabb(Vec3 min, Vec3 max) { Min = min; Max = max; }
    public Vec3 Size() { return new Vec3(0, 0, 0); }
    public Vec3 Center() { return new Vec3(0, 0, 0); }
    public override string ToString() => "Min " + Min + " Max " + Max;
}

` + SOLID_B + '\n\n' + BOX_HEAD + cs`
    public override Aabb GetBounds() { return new Aabb(Center, Center); }
}

` + SPHERE_HEAD + cs`
    public override Aabb GetBounds() { return new Aabb(Center, Center); }
}

` + CYL_HEAD + cs`
    public override Aabb GetBounds() { return new Aabb(Center, Center); }
}

` + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: 'Min (0.00, 0.00, 0.00) Max (2.00, 4.00, 6.00)', msg: 'Kutunun AABB\'si merkez ± yarım boyutlar olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(new Sphere("S", new Vec3(0, 0, 5), 1.5).GetBounds());
Console.WriteLine(new Cylinder("C", new Vec3(2, -2, 1), 0.5, 2).GetBounds());`, expect: 'Min (-1.50, -1.50, 3.50) Max (1.50, 1.50, 6.50)\nMin (1.50, -2.50, 0.00) Max (2.50, -1.50, 2.00)', msg: 'Küre ve silindirin (Z-up) AABB\'si doğru olmalı' },
          { type: 'harness', append: cs`var bb = new Box("A", new Vec3(1, 2, 3), 2, 4, 6).GetBounds();
Console.WriteLine(bb.Size());
Console.WriteLine(bb.Center());
var cb = new Cylinder("C", new Vec3(0, 0, 10), 1, 3).GetBounds();
Console.WriteLine(cb.Size() + " " + cb.Center());`, expect: '(2.00, 4.00, 6.00)\n(1.00, 2.00, 3.00)\n(2.00, 2.00, 3.00) (0.00, 0.00, 10.00)', msg: 'Size() ve Center() doğru hesaplanmalı' },
        ],
        hints: [
          '<code>Size()</code>: <code>return Max.Sub(Min);</code> — <code>Center()</code> için Min ile Max\'ı topla ve <code>Scale(0.5)</code> uygula.',
          'Her <code>GetBounds</code> aynı kalıp: bir "yarım boyut" vektörü kur, sonra <code>new Aabb(Center.Sub(half), Center.Add(half))</code>.',
          'Kutu için <code>half = new Vec3(Width / 2, Depth / 2, Height / 2)</code>; silindirde X ve Y için yarıçap, Z için <code>Height / 2</code>.',
        ],
        solution: cs`var box = new Box("A", new Vec3(1, 2, 3), 2, 4, 6);
Console.WriteLine(box.GetBounds());

` + AABB_V5 + '\n\n' + SOLIDS_B + '\n\n' + IMEAS + '\n\n' + VEC3,
        explain: 'Tüm nesnelerde aynı kalıp: <b>merkez ± yarım genişlik</b>. Bu yüzden ileride bir <code>Cone</code> eklersen sadece "yarım genişliğin" ne olduğunu düşünmen yeter.',
      },
    },
    {
      title: 'Adım 6 — Sahne sınırları: AABB birleşimi',
      body: `
<p>İki AABB'yi kapsayan en küçük AABB, <b>birleşimdir</b> (<t en="union" ja="和">union</t>): her eksende küçüklerin küçüğü ve büyüklerin büyüğü.</p>
<pre>min = (min(a.Min.X, b.Min.X), min(a.Min.Y, b.Min.Y), min(a.Min.Z, b.Min.Z))
max = (max(a.Max.X, b.Max.X), ...)</pre>
<p>Sahnedeki tüm nesnelerin AABB'lerini sırayla birleştirince <b>sahne sınırlarını</b> buluruz. Bunun en bilinen kullanımı CAD programlarındaki <b>Zoom Extents / Tümünü Göster</b> komutu: kamera, sahne AABB'sinin merkezine bakacak ve boyutunu sığdıracak şekilde ayarlanır. Blender'da <b>Home</b> tuşu (View All) aynı işi yapar.</p>
<p><b>Boş sahne:</b> Hiç nesne yokken "sahne sınırı" tanımsızdır. Anlamsız bir değer (0,0,0) döndürmek yerine <code>InvalidOperationException</code> fırlatıp çağıranı uyarmak daha dürüsttür.</p>`,
      exercise: {
        title: 'Union ve SceneBounds',
        prompt: `
<p>1) <code>Aabb</code>'ye <code>public Aabb Union(Aabb o)</code> metodunu ekle.</p>
<p>2) <code>Aabb SceneBounds(List&lt;Solid&gt; solids)</code> fonksiyonunu yaz: liste boşsa <code>InvalidOperationException("Sahne boş")</code> fırlat; değilse ilk nesnenin AABB'sinden başlayıp diğerleriyle birleştir.</p>
<pre class="expected">Kutu A + Küre S + Silindir C:
Min (-1.50, -2.50, 0.00) Max (2.50, 4.00, 6.50)</pre>`,
        starter: cs`Aabb SceneBounds(List<Solid> solids)
{
    // boşsa hata fırlat; değilse birleştir
    return solids[0].GetBounds();
}

var scene = new List<Solid>
{
    new Box("A", new Vec3(1, 2, 3), 2, 4, 6),
    new Sphere("S", new Vec3(0, 0, 5), 1.5),
    new Cylinder("C", new Vec3(2, -2, 1), 0.5, 2),
};
Console.WriteLine(SceneBounds(scene));

` + AABB_HEAD + cs`

    public Aabb Union(Aabb o)
    {
        return this;
    }
}

` + SOLIDS_B + '\n\n' + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: 'Min (-1.50, -2.50, 0.00) Max (2.50, 4.00, 6.50)', msg: 'Örnek sahnenin sınırları doğru olmalı' },
          { type: 'harness', append: cs`var a = new Aabb(new Vec3(0, 0, 0), new Vec3(1, 1, 1));
var b = new Aabb(new Vec3(2, -1, 0.5), new Vec3(3, 0.5, 4));
Console.WriteLine(a.Union(b));
Console.WriteLine(b.Union(a));
Console.WriteLine(a.Union(a));`, expect: 'Min (0.00, -1.00, 0.00) Max (3.00, 1.00, 4.00)\nMin (0.00, -1.00, 0.00) Max (3.00, 1.00, 4.00)\nMin (0.00, 0.00, 0.00) Max (1.00, 1.00, 1.00)', msg: 'Union her eksende min\'lerin min\'ini, max\'ların max\'ını almalı' },
          { type: 'harness', append: cs`var one = new List<Solid> { new Sphere("T", new Vec3(5, 5, 5), 1) };
Console.WriteLine(SceneBounds(one));
Console.WriteLine(SceneBounds(one).Size());`, expect: 'Min (4.00, 4.00, 4.00) Max (6.00, 6.00, 6.00)\n(2.00, 2.00, 2.00)', msg: 'Tek nesneli sahnede sınır o nesnenin AABB\'si olmalı' },
          { type: 'harness', append: cs`try { SceneBounds(new List<Solid>()); Console.WriteLine("hata yok"); }
catch (InvalidOperationException e) { Console.WriteLine(e.Message); }`, expect: 'Sahne boş', msg: 'Boş sahnede InvalidOperationException("Sahne boş") fırlatmalı' },
        ],
        hints: [
          '<code>Union</code>: iki yeni <code>Vec3</code> kur: <code>min</code> için üç <code>Math.Min</code>, <code>max</code> için üç <code>Math.Max</code>.',
          '<code>SceneBounds</code>\'un ilk satırı: <code>if (solids.Count == 0) throw new InvalidOperationException("Sahne boş");</code>',
          '<code>Aabb result = solids[0].GetBounds();</code> sonra <code>for (int i = 1; ...)</code> içinde <code>result = result.Union(solids[i].GetBounds());</code>',
        ],
        solution: SCENE_BOUNDS + cs`

var scene = new List<Solid>
{
    new Box("A", new Vec3(1, 2, 3), 2, 4, 6),
    new Sphere("S", new Vec3(0, 0, 5), 1.5),
    new Cylinder("C", new Vec3(2, -2, 1), 0.5, 2),
};
Console.WriteLine(SceneBounds(scene));

` + AABB_V6 + '\n\n' + SOLIDS_B + '\n\n' + IMEAS + '\n\n' + VEC3,
        explain: 'Birleşim işlemi "birikimli" (accumulate) bir döngüyle yapılır: sonuç, her adımda bir sonraki elemanla birleşir. LINQ bilenler bunu <code>solids.Select(s =&gt; s.GetBounds()).Aggregate((a, b) =&gt; a.Union(b))</code> diye de yazabilir.',
      },
    },
    {
      title: 'Adım 7 — AABB kesişimi ve çakışma kontrolü',
      body: `
<p>İki AABB, <b>üç eksenin hepsinde</b> aralıkları örtüşüyorsa kesişir. Tek bir eksende bile ayrıklarsa kesişmezler (aralarına bir düzlem sokabilirsin — "ayırma ekseni" fikri).</p>
<pre>X'te örtüşme:  a.Min.X &lt;= b.Max.X  &amp;&amp;  a.Max.X &gt;= b.Min.X
(Y ve Z için aynısı; üçü de doğruysa kesişir)</pre>
<p>Burada <code>&lt;=</code> kullandığımız için sadece <b>değen</b> kutular da kesişiyor sayılır. Bu bir tasarım kararıdır; dokümante et.</p>
<div class="callout tip"><b>BIM bağlantısı — çakışma kontrolü (干渉チェック):</b> Bir binada boru kirişin içinden geçiyorsa, şantiyede çok pahalı bir sorundur. BIM yazılımları bu tür çakışmaları tasarım aşamasında bulur. Gerçek araçlar kesin geometriyle çalışır, ama ilk ve en hızlı eleme adımı genellikle AABB testidir: kutuları kesişmeyen binlerce çift hiç incelenmez.</div>
<p><code>FindClashes</code> fonksiyonu her nesne çiftini <b>bir kez</b> kontrol etmeli: <code>i &lt; j</code> olan çiftler. (A–B'yi kontrol ettiysen B–A'ya gerek yok; A–A'yı hiç kontrol etme.) n nesne için n·(n−1)/2 çift eder.</p>`,
      exercise: {
        title: 'Intersects, Contains, FindClashes',
        prompt: `
<p>1) <code>Aabb.Intersects(Aabb o)</code> — değmek de kesişim sayılır.</p>
<p>2) <code>Aabb.Contains(Vec3 p)</code> — nokta kutunun içinde ya da yüzeyinde mi?</p>
<p>3) <code>List&lt;string&gt; FindClashes(List&lt;Solid&gt; solids)</code> — AABB'leri kesişen her çift için <code>"Duvar &lt;-&gt; Kolon"</code> biçiminde bir satır (listedeki sırayla, <code>i &lt; j</code>).</p>`,
        starter: cs`List<string> FindClashes(List<Solid> solids)
{
    var result = new List<string>();
    // her çifti bir kez kontrol et (i < j)
    return result;
}

var building = new List<Solid>
{
    new Box("Duvar", new Vec3(0, 0, 1.5), 4, 0.2, 3),
    new Cylinder("Kolon", new Vec3(1.9, 0, 1.5), 0.2, 3),
    new Sphere("Lamba", new Vec3(0, 2, 2.5), 0.3),
    new Box("Kiriş", new Vec3(0, 0, 3.0), 5, 0.3, 0.2),
};
foreach (string c in FindClashes(building)) Console.WriteLine(c);

` + AABB_HEAD + AABB_UNION + cs`

    public bool Intersects(Aabb o)
    {
        return false;
    }

    public bool Contains(Vec3 p)
    {
        return false;
    }
}

` + SOLIDS_B + '\n\n' + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: 'Duvar <-> Kolon\nDuvar <-> Kiriş\nKolon <-> Kiriş', msg: 'Örnek binada üç çakışma bulunmalı (Lamba çakışmıyor)' },
          { type: 'harness', append: cs`var a = new Aabb(new Vec3(0, 0, 0), new Vec3(2, 2, 2));
Console.WriteLine(a.Intersects(new Aabb(new Vec3(1, 1, 1), new Vec3(3, 3, 3))));
Console.WriteLine(a.Intersects(new Aabb(new Vec3(2, 0, 0), new Vec3(4, 2, 2))));
Console.WriteLine(a.Intersects(new Aabb(new Vec3(2.01, 0, 0), new Vec3(4, 2, 2))));
Console.WriteLine(a.Intersects(new Aabb(new Vec3(0, 0, 3), new Vec3(2, 2, 4))));
Console.WriteLine(a.Intersects(new Aabb(new Vec3(-1, -1, -1), new Vec3(5, 5, 5))));
Console.WriteLine(a.Intersects(new Aabb(new Vec3(1, 5, 1), new Vec3(1.5, 6, 1.5))));`, expect: 'True\nTrue\nFalse\nFalse\nTrue\nFalse', msg: 'Intersects: üç eksende de örtüşme gerekli; değmek kesişim sayılır; içerme de kesişimdir' },
          { type: 'harness', append: cs`var a = new Aabb(new Vec3(0, 0, 0), new Vec3(2, 2, 2));
Console.WriteLine(a.Contains(new Vec3(1, 1, 1)));
Console.WriteLine(a.Contains(new Vec3(2, 2, 2)));
Console.WriteLine(a.Contains(new Vec3(2.1, 1, 1)));
Console.WriteLine(a.Contains(new Vec3(1, 1, -0.1)));`, expect: 'True\nTrue\nFalse\nFalse', msg: 'Contains: nokta her eksende Min ile Max arasında olmalı' },
          { type: 'harness', append: cs`var few = new List<Solid>
{
    new Sphere("A", new Vec3(0, 0, 0), 1),
    new Sphere("B", new Vec3(10, 0, 0), 1),
    new Sphere("C", new Vec3(1.5, 0, 0), 1),
};
var r = FindClashes(few);
Console.WriteLine(r.Count);
foreach (string s in r) Console.WriteLine(s);
Console.WriteLine(FindClashes(new List<Solid>()).Count);`, expect: '1\nA <-> C\n0', msg: 'FindClashes her çifti bir kez kontrol etmeli ve nesneyi kendisiyle karşılaştırmamalı' },
        ],
        hints: [
          '<code>Intersects</code> tek bir <code>return</code>: altı karşılaştırmanın <code>&amp;&amp;</code> ile birleşimi. Önce sadece X için yaz, sonra Y ve Z\'yi kopyalayıp değiştir.',
          '<code>Contains</code> da altı karşılaştırma: <code>p.X &gt;= Min.X &amp;&amp; p.X &lt;= Max.X &amp;&amp; ...</code>',
          '<code>FindClashes</code>: <code>for (int i = 0; i &lt; solids.Count; i++)</code> içinde <code>for (int j = i + 1; j &lt; solids.Count; j++)</code>; kesişiyorsa <code>result.Add(solids[i].Name + " &lt;-&gt; " + solids[j].Name);</code>',
        ],
        solution: cs`List<string> FindClashes(List<Solid> solids)
{
    var result = new List<string>();
    for (int i = 0; i < solids.Count; i++)
    {
        for (int j = i + 1; j < solids.Count; j++)
        {
            if (solids[i].GetBounds().Intersects(solids[j].GetBounds()))
                result.Add(solids[i].Name + " <-> " + solids[j].Name);
        }
    }
    return result;
}

var building = new List<Solid>
{
    new Box("Duvar", new Vec3(0, 0, 1.5), 4, 0.2, 3),
    new Cylinder("Kolon", new Vec3(1.9, 0, 1.5), 0.2, 3),
    new Sphere("Lamba", new Vec3(0, 2, 2.5), 0.3),
    new Box("Kiriş", new Vec3(0, 0, 3.0), 5, 0.3, 0.2),
};
foreach (string c in FindClashes(building)) Console.WriteLine(c);

` + LIB_V7,
        explain: '<code>j = i + 1</code> ile başlayan iç döngü, her çifti tam bir kez ziyaret eder. n = 1000 nesnede bu yaklaşık 500.000 kontrol eder; gerçek yazılımlar sahneyi uzaysal yapılara (ızgara, BVH, octree) bölerek bu sayıyı çok azaltır. "Uzantılar"da bir fikir var.',
      },
    },
    {
      title: 'Adım 8 — Sahne raporu: biçimli tablo ve LINQ',
      body: `
<p>Mühendislik yazılımlarının önemli bir çıktısı <b>rapordur</b>: metraj (miktar) listeleri, malzeme hacimleri, alanlar. Bir tabloyu düzgün hizalamak için C#'ın hizalama biçimini kullanırız:</p>
<ul>
<li><code>{s.Name,-10}</code> → 10 karakterlik alana <b>sola</b> yaslı (eksi işareti)</li>
<li><code>{v,10:F2}</code> → 10 karakterlik alana <b>sağa</b> yaslı, 2 ondalık. Sayılar sağa yaslanır ki basamaklar alt alta gelsin.</li>
</ul>
<p>Sıralama ve toplam için <t en="LINQ" ja="LINQ">LINQ</t>: <code>solids.OrderByDescending(s =&gt; s.Volume())</code> hacme göre büyükten küçüğe sıralar (orijinal listeyi değiştirmez); <code>solids.Sum(s =&gt; s.Volume())</code> toplar.</p>`,
      code: cs`double[] v = { 3.14159, 24, 0.5 };
Console.WriteLine($"[{"Ad",-6}][{"Değer",8}]");
foreach (double x in v)
    Console.WriteLine($"[{"x",-6}][{x,8:F2}]");`,
      runnable: true,
      exercise: {
        title: 'PrintReport',
        prompt: `
<p><code>void PrintReport(List&lt;Solid&gt; solids)</code> fonksiyonunu tamamla. Başlık satırı hazır. Nesneleri <b>hacme göre büyükten küçüğe</b> sırala ve her biri için bir satır yazdır (ad −10, tür −10, hacim 10:F2, alan 10:F2). Sonra toplamları yazdır:</p>
<pre class="expected">Ad        Tür            Hacim      Alan
Kutu A    Box            24.00     52.00
Top       Sphere          4.19     12.57
Kolon     Cylinder        3.14     14.14
Toplam hacim: 31.33
Toplam alan: 78.70</pre>`,
        starter: cs`void PrintReport(List<Solid> solids)
{
    Console.WriteLine($"{"Ad",-10}{"Tür",-10}{"Hacim",10}{"Alan",10}");
    // 1) hacme göre büyükten küçüğe sırala ve satırları yazdır
    // 2) toplam hacim ve toplam alanı yazdır
}

var scene = new List<Solid>
{
    new Sphere("Top", new Vec3(0, 0, 0), 1),
    new Cylinder("Kolon", new Vec3(3, 0, 0), 0.5, 4),
    new Box("Kutu A", new Vec3(-3, 0, 0), 2, 3, 4),
};
PrintReport(scene);

` + SOLIDS_B + '\n\n' + AABB_V7 + '\n\n' + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: 'Ad        Tür            Hacim      Alan\nKutu A    Box            24.00     52.00\nTop       Sphere          4.19     12.57\nKolon     Cylinder        3.14     14.14\nToplam hacim: 31.33\nToplam alan: 78.70', msg: 'Rapor tablosu birebir aynı olmalı (sıralama, hizalama, toplamlar)' },
          { type: 'harness', append: cs`PrintReport(new List<Solid> { new Box("K1", new Vec3(0, 0, 0), 1, 1, 1), new Box("K2", new Vec3(0, 0, 0), 2, 2, 2) });`, expect: 'Ad        Tür            Hacim      Alan\nK2        Box             8.00     24.00\nK1        Box             1.00      6.00\nToplam hacim: 9.00\nToplam alan: 30.00', msg: 'Farklı bir sahnede de sıralama ve toplamlar doğru olmalı' },
          { type: 'harness', append: cs`var lst = new List<Solid> { new Sphere("a", new Vec3(0, 0, 0), 1), new Box("b", new Vec3(0, 0, 0), 3, 3, 3) };
PrintReport(lst);
Console.WriteLine(lst[0].Name);`, expect: 'Ad        Tür            Hacim      Alan\nb         Box            27.00     54.00\na         Sphere          4.19     12.57\nToplam hacim: 31.19\nToplam alan: 66.57\na', msg: 'Sıralama orijinal listeyi değiştirmemeli' },
          { type: 'code', pattern: 'OrderByDescending|OrderBy|Sort', msg: 'Hacme göre sıralama yapmalısın' },
        ],
        hints: [
          '<code>foreach (Solid s in solids.OrderByDescending(x =&gt; x.Volume()))</code> ile sıralı gez.',
          'Satır: <code>Console.WriteLine($"{s.Name,-10}{s.Kind,-10}{s.Volume(),10:F2}{s.SurfaceArea(),10:F2}");</code>',
          'Toplamlar: <code>solids.Sum(x =&gt; x.Volume())</code> sonucu <code>.ToString("F2")</code> ile <code>"Toplam hacim: "</code> metnine ekle; alan için de aynısı.',
        ],
        solution: cs`void PrintReport(List<Solid> solids)
{
    Console.WriteLine($"{"Ad",-10}{"Tür",-10}{"Hacim",10}{"Alan",10}");
    foreach (Solid s in solids.OrderByDescending(x => x.Volume()))
        Console.WriteLine($"{s.Name,-10}{s.Kind,-10}{s.Volume(),10:F2}{s.SurfaceArea(),10:F2}");
    Console.WriteLine("Toplam hacim: " + solids.Sum(x => x.Volume()).ToString("F2"));
    Console.WriteLine("Toplam alan: " + solids.Sum(x => x.SurfaceArea()).ToString("F2"));
}

var scene = new List<Solid>
{
    new Sphere("Top", new Vec3(0, 0, 0), 1),
    new Cylinder("Kolon", new Vec3(3, 0, 0), 0.5, 4),
    new Box("Kutu A", new Vec3(-3, 0, 0), 2, 3, 4),
};
PrintReport(scene);

` + SOLIDS_B + '\n\n' + AABB_V7 + '\n\n' + IMEAS + '\n\n' + VEC3,
        explain: '<code>OrderByDescending</code> yeni bir sıralı dizi üretir, orijinal listeye dokunmaz; bu yüzden kullanıcının nesne sırası (ve ListBox sırası) bozulmaz. Toplamları sıralamadan bağımsız hesaplamak da bu yüzden güvenlidir.',
      },
    },
    {
      title: 'Adım 9 — Tel kafes için noktalar: çember ve AABB köşeleri',
      body: `
<p>P3'teki çiziciyle bu nesneleri çizebilmek için onları <b>çizgilere</b> çevirmeliyiz:</p>
<ul>
<li><b>AABB / kutu:</b> 8 köşe + P3'teki 12 kenarlık indeks listesi. Köşe sırası P3'teki küple aynı: önce alt yüz (Min.Z), sonra üst yüz (Max.Z); her yüzde (minX,minY) → (maxX,minY) → (maxX,maxY) → (minX,maxY).</li>
<li><b>Silindir:</b> alt ve üst kapakta birer çember + birkaç dikey çizgi.</li>
<li><b>Küre:</b> XY, XZ ve YZ düzlemlerinde üç çember (Blender'daki küre gizmosu gibi).</li>
</ul>
<p>Bir çemberi <code>n</code> parçalı bir çokgenle yaklaşık çizeriz: <code>i</code>. noktanın açısı <code>θ = 2π·i / n</code>, konumu <code>merkez + (r·cos θ, r·sin θ, 0)</code>. <code>n</code> büyüdükçe çember yuvarlaklaşır ama çizgi sayısı artar. Bu, Blender'da bir silindir eklerken seçtiğin <b>Vertices</b> sayısıyla tamamen aynı ödünleşimdir: topoloji yoğunluğu ↔ performans.</p>`,
      exercise: {
        title: 'CirclePoints ve Aabb.Corners',
        prompt: `
<p>1) <code>List&lt;Vec3&gt; CirclePoints(Vec3 center, double r, int n)</code>: XY düzleminde (Z = <code>center.Z</code>) <code>n</code> nokta; ilk nokta +X yönünde, saat yönünün tersine.</p>
<p>2) <code>Aabb.Corners()</code>: yukarıdaki sırayla 8 köşe.</p>
<pre class="expected">CirclePoints((0,0,1), 2, 4) → (2,0,1) (0,2,1) (-2,0,1) (0,-2,1)
Aabb((0,0,0),(1,2,3)).Corners()[6] → (1.00, 2.00, 3.00)</pre>`,
        starter: cs`List<Vec3> CirclePoints(Vec3 center, double r, int n)
{
    var pts = new List<Vec3>();
    return pts;
}

foreach (Vec3 p in CirclePoints(new Vec3(0, 0, 1), 2, 4)) Console.WriteLine(p);

` + AABB_HEAD + AABB_UNION + AABB_INTERSECT + cs`

    public List<Vec3> Corners()
    {
        var c = new List<Vec3>();
        return c;
    }
}

` + IMEAS + '\n\n' + VEC3,
        checks: [
          { type: 'output', expect: '(2.00, 0.00, 1.00)\n(0.00, 2.00, 1.00)\n(-2.00, 0.00, 1.00)\n(0.00, -2.00, 1.00)', msg: '4 parçalı çemberin noktaları doğru olmalı' },
          { type: 'harness', append: cs`var six = CirclePoints(new Vec3(10, 0, -1), 2, 6);
Console.WriteLine(six.Count);
Console.WriteLine(six[1]);
Console.WriteLine(six[3]);
Console.WriteLine(CirclePoints(new Vec3(0, 0, 0), 1, 32).Count);`, expect: '6\n(11.00, 1.73, -1.00)\n(8.00, 0.00, -1.00)\n32', msg: 'Merkez, yarıçap ve n parametreleri doğru kullanılmalı' },
          { type: 'harness', append: cs`var box = new Aabb(new Vec3(0, 0, 0), new Vec3(1, 2, 3));
var cs8 = box.Corners();
Console.WriteLine(cs8.Count);
for (int i = 0; i < cs8.Count; i++) Console.WriteLine(i + " " + cs8[i]);`, expect: '8\n0 (0.00, 0.00, 0.00)\n1 (1.00, 0.00, 0.00)\n2 (1.00, 2.00, 0.00)\n3 (0.00, 2.00, 0.00)\n4 (0.00, 0.00, 3.00)\n5 (1.00, 0.00, 3.00)\n6 (1.00, 2.00, 3.00)\n7 (0.00, 2.00, 3.00)', msg: 'Corners() 8 köşeyi P3 küpüyle aynı sırada döndürmeli' },
        ],
        hints: [
          'Döngü: <code>for (int i = 0; i &lt; n; i++)</code>, açı: <code>double t = 2 * Math.PI * i / n;</code>',
          'Nokta: <code>pts.Add(new Vec3(center.X + r * Math.Cos(t), center.Y + r * Math.Sin(t), center.Z));</code>',
          '<code>Corners</code>: 8 kez <code>c.Add(...)</code>. İlk dördünde Z = <code>Min.Z</code>: <code>(Min.X, Min.Y)</code>, <code>(Max.X, Min.Y)</code>, <code>(Max.X, Max.Y)</code>, <code>(Min.X, Max.Y)</code>; son dördü aynı ama Z = <code>Max.Z</code>.',
        ],
        solution: cs`List<Vec3> CirclePoints(Vec3 center, double r, int n)
{
    var pts = new List<Vec3>();
    for (int i = 0; i < n; i++)
    {
        double t = 2 * Math.PI * i / n;
        pts.Add(new Vec3(center.X + r * Math.Cos(t), center.Y + r * Math.Sin(t), center.Z));
    }
    return pts;
}

foreach (Vec3 p in CirclePoints(new Vec3(0, 0, 1), 2, 4)) Console.WriteLine(p);

` + AABB_HEAD + AABB_UNION + AABB_INTERSECT + cs`

    public List<Vec3> Corners()
    {
        var c = new List<Vec3>();
        c.Add(new Vec3(Min.X, Min.Y, Min.Z));
        c.Add(new Vec3(Max.X, Min.Y, Min.Z));
        c.Add(new Vec3(Max.X, Max.Y, Min.Z));
        c.Add(new Vec3(Min.X, Max.Y, Min.Z));
        c.Add(new Vec3(Min.X, Min.Y, Max.Z));
        c.Add(new Vec3(Max.X, Min.Y, Max.Z));
        c.Add(new Vec3(Max.X, Max.Y, Max.Z));
        c.Add(new Vec3(Min.X, Max.Y, Max.Z));
        return c;
    }
}

` + IMEAS + '\n\n' + VEC3,
        explain: '<code>2 * Math.PI * i / n</code> ifadesinde <code>2 * Math.PI</code> zaten <code>double</code> olduğu için bölme de ondalıklı yapılır. Köşe sırasını P3 ile aynı tutmak, kenar listesini (12 indeks çifti) olduğu gibi yeniden kullanmamızı sağlar: veri biçimi bir <b>sözleşmedir</b>.',
      },
    },
    {
      title: 'Adım 10 — Visual Studio: nesne listesi ve özellik paneli',
      body: `
<p>Arayüz düzeni: solda çizim alanı, sağda üstte <b>ListBox</b> (nesneler), altında <b>PropertyGrid</b> (seçili nesnenin özellikleri), en altta özet.</p>
<ol>
<li>Form1: <code>SplitContainer</code> (sol: <code>Canvas</code>, sağ: kontroller). Sağ panele bir <code>ToolStrip</code>: <b>+ Kutu</b>, <b>+ Küre</b>, <b>+ Silindir</b>, <b>Sil</b>.</li>
<li><code>ListBox lstSolids</code> (<code>Dock = Top</code>, yükseklik ≈ 200). ListBox her öğe için <code>ToString()</code> gösterir; <code>Solid</code>'de <code>ToString()</code>'i "Kutu A (Box)" gibi ezmeyi unutma.</li>
<li><code>PropertyGrid propertyGrid1</code> (<code>Dock = Fill</code>). Visual Studio'nun kendi Properties penceresiyle aynı kontroldür! <code>SelectedObject</code>'e bir nesne verince onun <code>public</code> özelliklerini otomatik listeler ve düzenletir.</li>
<li><code>Label lblSummary</code>: nesne sayısı, toplam hacim, çakışma sayısı.</li>
</ol>
<p>PropertyGrid'in düzenleyebilmesi için özelliklerin <code>set</code>'i olmalı. Tarayıcıdaki sınıflar değişmez (immutable) idi; masaüstü sürümünde <code>Center</code> yerine düzenlenebilir <code>CenterX/Y/Z</code> ve boyutlar için doğrulayan <code>set</code>'ler kullanıyoruz. <code>[Category]</code>, <code>[DisplayName]</code>, <code>[Browsable(false)]</code> gibi <t en="attribute" ja="属性">öznitelikler</t> (attribute) PropertyGrid'e "bu özelliği hangi grupta göster / hiç gösterme" bilgisini verir. Sadece <code>get</code>'i olan özellikler (hacim, alan) gri, salt-okunur görünür.</p>`,
      code: cs`// Model/Solid.cs (masaüstü sürümü)
using System.ComponentModel;

public abstract class Solid : IMeasurable
{
    [Category("Genel")] public string Name { get; set; }
    [Category("Konum")] public double CenterX { get; set; }
    [Category("Konum")] public double CenterY { get; set; }
    [Category("Konum")] public double CenterZ { get; set; }
    [Browsable(false)] public Vec3 Center => new Vec3(CenterX, CenterY, CenterZ);

    [Category("Hesaplanan"), DisplayName("Hacim")] public string VolumeText => Volume().ToString("F3");
    [Category("Hesaplanan"), DisplayName("Alan")] public string AreaText => SurfaceArea().ToString("F3");
    [Category("Hesaplanan"), DisplayName("Sınırlar")] public string BoundsText => GetBounds().ToString();

    protected Solid(string name, Vec3 c) { Name = name; CenterX = c.X; CenterY = c.Y; CenterZ = c.Z; }
    [Browsable(false)] public abstract string Kind { get; }
    public abstract double Volume();
    public abstract double SurfaceArea();
    public abstract Aabb GetBounds();
    public override string ToString() => $"{Name} ({Kind})";
}

// Model/Box.cs — doğrulayan set
private double width;
[Category("Boyut")]
public double Width
{
    get => width;
    set { if (value <= 0) throw new ArgumentException("Genişlik 0'dan büyük olmalı"); width = value; }
}

// Form1.cs
private readonly List<Solid> solids = new List<Solid>();
private int counter = 1;

private void btnAddBox_Click(object sender, EventArgs e) =>
    AddSolid(new Box("Kutu " + counter++, new Vec3(0, 0, 1), 2, 2, 2));
private void btnAddSphere_Click(object sender, EventArgs e) =>
    AddSolid(new Sphere("Küre " + counter++, new Vec3(3, 0, 1), 1));
private void btnAddCylinder_Click(object sender, EventArgs e) =>
    AddSolid(new Cylinder("Silindir " + counter++, new Vec3(-3, 0, 1), 0.5, 2));

private void AddSolid(Solid s)
{
    solids.Add(s);
    lstSolids.Items.Add(s);
    lstSolids.SelectedItem = s;      // yeni nesneyi seç → PropertyGrid'de göster
    RefreshAll();
}

private void lstSolids_SelectedIndexChanged(object sender, EventArgs e)
{
    propertyGrid1.SelectedObject = lstSolids.SelectedItem;
    canvas.Invalidate();
}

private void propertyGrid1_PropertyValueChanged(object s, PropertyValueChangedEventArgs e)
{
    int i = lstSolids.SelectedIndex;
    if (i >= 0) lstSolids.Items[i] = lstSolids.Items[i];   // ad değiştiyse listedeki metni yenile
    RefreshAll();
}

private void btnDelete_Click(object sender, EventArgs e)
{
    if (lstSolids.SelectedItem is not Solid s) return;
    solids.Remove(s);
    lstSolids.Items.Remove(s);
    propertyGrid1.SelectedObject = null;
    RefreshAll();
}

private void RefreshAll()
{
    int clashes = Clash.FindClashes(solids).Count;
    lblSummary.Text = $"Nesne: {solids.Count}   Toplam hacim: {solids.Sum(x => x.Volume()):F2}   Çakışma: {clashes}";
    canvas.Invalidate();
}`,
      runnable: false,
      checklist: [
        'Tarayıcıda test ettiğim Solid, Box, Sphere, Cylinder, Aabb sınıflarını Model klasörüne taşıdım',
        'Masaüstü sürümünde düzenlenebilir CenterX/Y/Z ve doğrulayan set\'ler ekledim',
        'ToolStrip ile Kutu / Küre / Silindir ekleme ve Sil butonlarını bağladım',
        'ListBox nesneleri ToString() ile listeliyor, seçim PropertyGrid\'e yansıyor',
        'PropertyGrid\'de bir boyuta negatif değer girince hata mesajı çıktığını gördüm',
        'Özet etiketinde nesne sayısı, toplam hacim ve çakışma sayısı görünüyor',
      ],
    },
    {
      title: 'Adım 11 — Visual Studio: nesneleri ve sınırlayıcı kutuları çiz',
      body: `
<p>P3'teki <code>DrawLine3D</code>, <code>WorldToView</code> ve orbit kodunu bu projeye taşı. Sonra her nesne türü için bir çizim fonksiyonu yaz:</p>
<ul>
<li><b>Kutu:</b> AABB köşeleri + 12 kenar (siyah).</li>
<li><b>Küre:</b> merkez etrafında üç çember. XY çemberi doğrudan <code>CirclePoints</code>; XZ ve YZ çemberleri için noktaları merkeze göre <code>RotateX(90)</code> / <code>RotateY(90)</code> ile döndür (P3'teki Vec3 metotları).</li>
<li><b>Silindir:</b> alt ve üst kapak çemberi + 4 dikey çizgi.</li>
<li><b>Sınırlayıcı kutular:</b> seçili nesnenin AABB'si turuncu kesikli; çakışan nesnelerin AABB'si kırmızı; "Sahne sınırlarını göster" CheckBox'ı açıksa sahne AABB'si gri kesikli.</li>
</ul>
<p>Son olarak bir <b>"Tümünü göster"</b> butonu: <code>SceneBounds</code>'un merkezini görünümün merkezine al ve boyutuna göre kamera uzaklığını ayarla (Adım 6'daki Zoom Extents).</p>
<div class="callout tip">Neden nesneyi döndürmedik? Döndürülmüş bir kutunun AABB'si kutudan <b>büyüktür</b> (köşeleri eksenlere göre taşar). AABB hızlıdır ama gevşektir; daha sıkı sınır için nesneyle birlikte dönen <b>OBB</b> (oriented bounding box) kullanılır. Bu farkı mülakatta anlatabilmek iyi bir artı.</div>`,
      code: cs`private static readonly int[,] Edges =
{
    { 0, 1 }, { 1, 2 }, { 2, 3 }, { 3, 0 },
    { 4, 5 }, { 5, 6 }, { 6, 7 }, { 7, 4 },
    { 0, 4 }, { 1, 5 }, { 2, 6 }, { 3, 7 },
};

private void DrawAabb(Graphics g, Pen pen, Aabb box)
{
    List<Vec3> c = box.Corners();
    for (int i = 0; i < Edges.GetLength(0); i++)
        DrawLine3D(g, pen, c[Edges[i, 0]], c[Edges[i, 1]]);
}

private void DrawPolyline3D(Graphics g, Pen pen, List<Vec3> pts)
{
    for (int i = 0; i < pts.Count; i++)
        DrawLine3D(g, pen, pts[i], pts[(i + 1) % pts.Count]);   // son nokta → ilk nokta
}

private void DrawSolid(Graphics g, Pen pen, Solid s)
{
    if (s is Box b)
    {
        DrawAabb(g, pen, b.GetBounds());
    }
    else if (s is Sphere sp)
    {
        List<Vec3> ring = Geo.CirclePoints(new Vec3(0, 0, 0), sp.Radius, 32);
        DrawPolyline3D(g, pen, ring.Select(p => p.Add(sp.Center)).ToList());
        DrawPolyline3D(g, pen, ring.Select(p => p.RotateX(90).Add(sp.Center)).ToList());
        DrawPolyline3D(g, pen, ring.Select(p => p.RotateY(90).Add(sp.Center)).ToList());
    }
    else if (s is Cylinder cy)
    {
        var bottom = Geo.CirclePoints(cy.Center.Add(new Vec3(0, 0, -cy.Height / 2)), cy.Radius, 32);
        var top = Geo.CirclePoints(cy.Center.Add(new Vec3(0, 0, cy.Height / 2)), cy.Radius, 32);
        DrawPolyline3D(g, pen, bottom);
        DrawPolyline3D(g, pen, top);
        for (int i = 0; i < 32; i += 8) DrawLine3D(g, pen, bottom[i], top[i]);
    }
}

private void Canvas_Paint(object? sender, PaintEventArgs e)
{
    Graphics g = e.Graphics;
    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
    DrawGridAndAxes(g);   // P3'ten

    var clashing = new HashSet<Solid>();
    for (int i = 0; i < solids.Count; i++)
        for (int j = i + 1; j < solids.Count; j++)
            if (solids[i].GetBounds().Intersects(solids[j].GetBounds()))
            { clashing.Add(solids[i]); clashing.Add(solids[j]); }

    using var solidPen = new Pen(Color.Black, 1.5f);
    using var clashPen = new Pen(Color.Red, 1) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dash };
    using var selPen = new Pen(Color.Orange, 2) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dash };

    foreach (Solid s in solids)
    {
        DrawSolid(g, solidPen, s);
        if (clashing.Contains(s)) DrawAabb(g, clashPen, s.GetBounds());
    }
    if (lstSolids.SelectedItem is Solid sel) DrawAabb(g, selPen, sel.GetBounds());

    if (chkSceneBounds.Checked && solids.Count > 0)
    {
        using var scenePen = new Pen(Color.Gray, 1) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dot };
        DrawAabb(g, scenePen, Scene.SceneBounds(solids));
    }
}`,
      runnable: false,
      checklist: [
        'P3\'teki DrawLine3D / orbit kodunu yeniden kullandım (kopya ya da paylaşılan kütüphane)',
        'Kutu, küre (3 çember) ve silindir (2 çember + dikey çizgiler) tel kafes olarak çiziliyor',
        'Seçili nesnenin AABB\'si turuncu, çakışan nesnelerinki kırmızı görünüyor',
        'Sahne sınırları CheckBox\'ı ve "Tümünü göster" butonu çalışıyor',
        'Bir nesneyi PropertyGrid\'den taşıyıp başka bir nesneye değdirince çakışma vurgusunun anında değiştiğini gördüm',
        'Ekran görüntüleri ve kısa bir GIF aldım',
      ],
    },
  ],
  finalChecklist: [
    'GitHub deposu: "geometry3d-tool" — README\'de özellikler: 3 katı türü, hacim/alan, AABB, sahne sınırları, çakışma kontrolü',
    'README\'ye çakışan nesnelerin kırmızı kutularla gösterildiği bir ekran görüntüsü ve PropertyGrid ile düzenleme GIF\'i ekledim',
    'README\'de formüller tablosu (hacim / alan) ve AABB kesişim kuralının kısa açıklaması',
    'Sınıf diyagramı: IMeasurable ← Solid ← Box / Sphere / Cylinder; Aabb; Scene/Clash yardımcıları (draw.io veya Mermaid)',
    'Hesap sınıfları arayüzden bağımsız; istersen tarayıcıdaki testleri bir xUnit projesine taşıdım',
    'P3 ile ortak kodu kopyalamak yerine paylaşılan bir Class Library\'ye taşıdım (ya da README\'de neden kopyaladığımı yazdım)',
    'README\'ye Japonca özet: 「基本形状の体積・表面積・バウンディングボックスを計算し、干渉チェックを行うツールです。」',
  ],
  extensions: [
    'Koni (Cone) ve Torus ekle: hacim, alan ve AABB formüllerini araştır',
    'Nesneleri döndürülebilir yap ve döndürülmüş kutunun AABB\'sini 8 köşeden hesapla; OBB ile karşılaştır',
    'Raporu CSV dosyasına aktar (SaveFileDialog) ve Excel\'de aç',
    'Çakışma kontrolünü hızlandır: sahneyi düzenli bir ızgaraya böl, sadece aynı/komşu hücredeki nesneleri karşılaştır',
    'Fareyle seçim: ekran noktasından bir ışın (ray) gönder ve ışın–AABB kesişimiyle nesne seç',
    'Malzeme ve yoğunluk özelliği ekleyip ağırlık hesabı yap (ör. beton 2400 kg/m³)',
  ],
  vocab: [
    { en: 'Solid', tr: 'Katı', ja: 'ソリッド', kana: 'ソリッド', romaji: 'soriddo' },
    { en: 'Shape (geometric)', tr: 'Şekil / form', ja: '形状', kana: 'けいじょう', romaji: 'keijō' },
    { en: 'Volume', tr: 'Hacim', ja: '体積', kana: 'たいせき', romaji: 'taiseki' },
    { en: 'Surface area', tr: 'Yüzey alanı', ja: '表面積', kana: 'ひょうめんせき', romaji: 'hyōmenseki' },
    { en: 'Sphere', tr: 'Küre', ja: '球', kana: 'きゅう', romaji: 'kyū' },
    { en: 'Cylinder', tr: 'Silindir', ja: '円柱', kana: 'えんちゅう', romaji: 'enchū' },
    { en: 'Radius', tr: 'Yarıçap', ja: '半径', kana: 'はんけい', romaji: 'hankei' },
    { en: 'Distance', tr: 'Uzaklık', ja: '距離', kana: 'きょり', romaji: 'kyori' },
    { en: 'Bounding box', tr: 'Sınırlayıcı kutu', ja: 'バウンディングボックス', kana: 'バウンディングボックス', romaji: 'baundingu bokkusu' },
    { en: 'Clash detection', tr: 'Çakışma kontrolü', ja: '干渉チェック', kana: 'かんしょうチェック', romaji: 'kanshō chekku' },
    { en: 'Interface', tr: 'Arayüz (interface)', ja: 'インターフェース', kana: 'インターフェース', romaji: 'intāfēsu' },
    { en: 'Property', tr: 'Özellik', ja: 'プロパティ', kana: 'プロパティ', romaji: 'puropati' },
  ],
};
