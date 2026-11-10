import { cs } from '../helpers.js';

// Vec3: önceki adımlarda yazılan sürümler, sonraki adımların başlangıç kodlarında hazır verilir.
const VEC3_HEAD = cs`class Vec3
{
    public double X { get; }
    public double Y { get; }
    public double Z { get; }
    public Vec3(double x, double y, double z) { X = x; Y = y; Z = z; }

    public Vec3 Add(Vec3 o) => new Vec3(X + o.X, Y + o.Y, Z + o.Z);
    public Vec3 Sub(Vec3 o) => new Vec3(X - o.X, Y - o.Y, Z - o.Z);
    public Vec3 Scale(double s) => new Vec3(X * s, Y * s, Z * s);
    public double Length() => Math.Sqrt(X * X + Y * Y + Z * Z);
`;

const VEC3_TAIL = cs`
    // -0.00 yazılmasını önler: çok küçük değerleri 0 kabul et
    static string F(double v) => (Math.Abs(v) < 0.005 ? 0.0 : v).ToString("F2");
    public override string ToString() => "(" + F(X) + ", " + F(Y) + ", " + F(Z) + ")";
}`;

const ROT_Z = cs`
    public Vec3 RotateZ(double degrees)
    {
        double a = degrees * Math.PI / 180;
        double c = Math.Cos(a), s = Math.Sin(a);
        return new Vec3(X * c - Y * s, X * s + Y * c, Z);
    }
`;

const ROT_XY = cs`
    public Vec3 RotateX(double degrees)
    {
        double a = degrees * Math.PI / 180;
        double c = Math.Cos(a), s = Math.Sin(a);
        return new Vec3(X, Y * c - Z * s, Y * s + Z * c);
    }

    public Vec3 RotateY(double degrees)
    {
        double a = degrees * Math.PI / 180;
        double c = Math.Cos(a), s = Math.Sin(a);
        return new Vec3(X * c + Z * s, Y, -X * s + Z * c);
    }
`;

const VEC3_FULL = VEC3_HEAD + ROT_Z + ROT_XY + VEC3_TAIL;

const TRANSFORM_FULL = cs`class Transform
{
    public Vec3 Position { get; set; } = new Vec3(0, 0, 0);
    public Vec3 Rotation { get; set; } = new Vec3(0, 0, 0);   // derece (X, Y, Z)
    public Vec3 Scale { get; set; } = new Vec3(1, 1, 1);

    public Vec3 LocalToWorld(Vec3 p)
    {
        Vec3 s = new Vec3(p.X * Scale.X, p.Y * Scale.Y, p.Z * Scale.Z);
        Vec3 r = s.RotateX(Rotation.X).RotateY(Rotation.Y).RotateZ(Rotation.Z);
        return r.Add(Position);
    }
}`;

const VEC2 = cs`class Vec2
{
    public double X { get; }
    public double Y { get; }
    public Vec2(double x, double y) { X = x; Y = y; }
    public override string ToString() => "(" + X.ToString("F1") + ", " + Y.ToString("F1") + ")";
}`;

const PROJECT_FN = cs`// Blender'ın ön görünümü gibi: kamera -Y tarafında, +Y yönüne bakıyor; X sağ, Z yukarı.
Vec2? Project(Vec3 p, double camDist, double focal, double cx, double cy)
{
    double depth = p.Y + camDist;
    if (depth < 0.1) return null;
    return new Vec2(cx + focal * p.X / depth, cy - focal * p.Z / depth);
}`;

export default {
  kind: 'project',
  id: 'p3',
  module: 'm8',
  title: 'Proje 3: 3D Koordinat Görselleştirici',
  titleEn: '3D Coordinate Visualizer',
  titleJa: '3D座標ビューア',
  minutes: 900,
  level: 4,
  environment: 'desktop',
  demo: 'transform3d',
  summary: `
<p>Hiçbir 3D kütüphanesi kullanmadan, <b>kendi küçük 3D hattını</b> (<t en="rendering pipeline" ja="レンダリングパイプライン">pipeline</t>) yazacaksın: bir <code>Vec3</code> sınıfı, X/Y/Z etrafında döndürme, ölçekleme, taşıma, perspektif izdüşümüyle 3D noktaları 2D ekrana çevirme. Sonunda WinForms'ta X/Y/Z eksenlerini (Blender gibi kırmızı/yeşil/mavi) ve tel kafes (<t en="wireframe" ja="ワイヤーフレーム">wireframe</t>) bir küpü çizen, küpün konumunu, dönüşünü ve ölçeğini TrackBar ve NumericUpDown ile değiştirebildiğin bir görüntüleyici olacak.</p>
<p>Blender'da her gün kullandığın <b>G / R / S</b>'nin arkasındaki matematiği kendi elinle yazmak, bir CAD/BIM şirketine "3D'yi sadece kullanmıyorum, nasıl çalıştığını da biliyorum" demenin en güçlü yoludur. Matematik kısımları tarayıcıda alıştırmalarla, arayüz Visual Studio'da yapılır.</p>`,
  goals: [
    'Vec3 sınıfıyla vektör toplama, çıkarma, ölçekleme ve uzunluk hesabı yapmak',
    'Bir noktayı X, Y ve Z eksenleri etrafında sinüs/kosinüs ile döndürmek',
    'Ölçek → döndürme → taşıma sırasıyla yerel koordinatları dünya koordinatlarına çevirmek',
    'Perspektif izdüşümüyle 3D noktayı 2D ekran koordinatına çevirmek',
    'Z-up ve Y-up koordinat sistemleri arasında dönüşüm yapabilmek',
    'WinForms\'ta TrackBar / NumericUpDown ile etkileşimli bir 3D tel kafes görüntüleyici yazmak',
  ],
  skills: ['Vektör matematiği', 'Trigonometri (Math.Sin / Math.Cos)', 'Dönüşümler (TRS)', 'Perspektif izdüşüm', 'Yerel / dünya koordinatları', 'Z-up / Y-up', '4×4 matris (isteğe bağlı)', 'WinForms TrackBar, NumericUpDown'],
  steps: [
    {
      title: 'Adım 1 — Koordinat sistemleri: Z-up mı, Y-up mı?',
      body: `
<p>3D'de bir nokta üç sayıdır: <code>(x, y, z)</code>. Ama hangi eksenin "yukarı" olduğu programdan programa değişir ve bu, dosya alışverişinde en sık yaşanan sorunlardan biridir (Maya'dan Blender'a aktarınca yan yatan modelleri hatırla).</p>
<table class="compare">
<tr><th>Z-up (yukarı = +Z)</th><th>Y-up (yukarı = +Y)</th></tr>
<tr><td>Blender, birçok CAD/BIM yazılımı, mimari ve mühendislik çizimleri (XY = zemin planı)</td><td>Maya (varsayılan), Unity, glTF formatı, birçok oyun motoru</td></tr>
</table>
<p>Bu projede <b>Z-up</b> kullanacağız: XY düzlemi zemin, Z yükseklik. Bu, mimari/CAD dünyasına en doğal olanı: bir kat planı XY'de çizilir, kat yüksekliği Z'dir.</p>
<p>Eksen renkleri her yerde aynıdır: <b style="color:var(--x)">X kırmızı</b>, <b style="color:var(--y)">Y yeşil</b>, <b style="color:var(--z)">Z mavi</b> ("RGB = XYZ" diye ezberle).</p>
<p><b>Sağ el kuralı:</b> Sağ elinin başparmağı +X, işaret parmağı +Y gösterirse, orta parmağın +Z'yi gösterir. Blender ve bu projedeki dönüşler sağ el sistemine göredir: bir eksenin ucundan bakınca pozitif açı <b>saat yönünün tersine</b> döndürür.</p>
<p>Visual Studio'da yeni bir <b>Windows Forms App (.NET 8)</b> projesi oluştur: <code>Viewer3D</code>. Bir <code>Math3D</code> klasörü ekle; bu projedeki tüm matematik sınıfları oraya gidecek.</p>`,
      checklist: [
        'Z-up ve Y-up farkını ve hangi programların hangisini kullandığını anladım',
        'RGB = XYZ eksen renk kuralını biliyorum',
        'Sağ el kuralını kendi elimle denedim',
        'Viewer3D adlı Windows Forms App (.NET 8) projesini ve Math3D klasörünü oluşturdum',
      ],
    },
    {
      title: 'Adım 2 — Vec3: üç boyutlu vektör sınıfı',
      body: `
<p>Bir <t en="vector" ja="ベクトル">vektör</t> hem bir <b>konumu</b> (nokta) hem bir <b>yönü ve uzunluğu</b> (ok) temsil edebilir. Blender'da bir vertex'in konumu da, bir normal de vektördür.</p>
<ul>
<li><b>Toplama</b> <code>a + b</code>: bileşen bileşen topla. "a'dan b kadar ilerle" — taşıma (G) budur.</li>
<li><b>Çıkarma</b> <code>b − a</code>: a'dan b'ye giden ok. İki nokta arası uzaklık = bu okun uzunluğu.</li>
<li><b>Ölçekleme</b> <code>a · s</code>: her bileşeni s ile çarp.</li>
<li><b>Uzunluk</b>: <code>√(x² + y² + z²)</code> — Pisagor'un 3D hâli.</li>
</ul>
<p>Sınıfı <t en="immutable" ja="イミュータブル">değişmez</t> (immutable) yapıyoruz: <code>X, Y, Z</code> sadece <code>get</code>; her işlem <b>yeni</b> bir <code>Vec3</code> döndürür. Böylece bir vektörü bir yere verdiğinde başka bir kodun onu gizlice değiştirmesinden korkmazsın.</p>
<div class="callout"><b>-0.00 tuzağı:</b> Kayan nokta hesaplarında sıfır olması gereken bir değer <code>-0.0000000000000001</code> çıkabilir. Gerçek .NET bunu <code>F2</code> ile <b>"-0.00"</b> olarak yazar. Başlangıç kodundaki <code>F</code> yardımcısı, 0.005'ten küçük değerleri 0 kabul ederek çıktıyı temiz tutar. CAD yazılımları da ekranda gösterirken benzer bir <t en="tolerance" ja="許容誤差">tolerans</t> kullanır.</div>
<p class="muted">Not: Gerçek C#'ta <code>a + b</code> yazabilmek için operatör aşırı yükleme (<code>public static Vec3 operator +(Vec3 a, Vec3 b)</code>) kullanılır. Bu platformun yorumlayıcısı bunu desteklemediği için <code>a.Add(b)</code> gibi metotlar yazıyoruz; Visual Studio'da ikisini birden ekleyebilirsin.</p>`,
      exercise: {
        title: 'Vec3 temel işlemleri',
        prompt: `
<p><code>Vec3</code> sınıfındaki <code>Add</code>, <code>Sub</code>, <code>Scale</code> ve <code>Length</code> metotlarını tamamla.</p>
<pre class="expected">new Vec3(1, 2, 3).Add(new Vec3(4, 5, 6))   → (5.00, 7.00, 9.00)
new Vec3(4, 5, 6).Sub(new Vec3(1, 2, 3))   → (3.00, 3.00, 3.00)
new Vec3(1, -2, 0.5).Scale(2)              → (2.00, -4.00, 1.00)
new Vec3(2, 3, 6).Length()                 → 7</pre>`,
        starter: cs`var a = new Vec3(1, 2, 3);
var b = new Vec3(4, 5, 6);
Console.WriteLine(a.Add(b));
Console.WriteLine("Uzaklık: " + b.Sub(a).Length().ToString("F2"));

class Vec3
{
    public double X { get; }
    public double Y { get; }
    public double Z { get; }
    public Vec3(double x, double y, double z) { X = x; Y = y; Z = z; }

    public Vec3 Add(Vec3 o) { return this; }
    public Vec3 Sub(Vec3 o) { return this; }
    public Vec3 Scale(double s) { return this; }
    public double Length() { return 0; }
` + VEC3_TAIL,
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(1, 2, 3).Add(new Vec3(4, 5, 6)));
Console.WriteLine(new Vec3(-1, 0.5, 0).Add(new Vec3(1, 0.25, -2)));`, expect: '(5.00, 7.00, 9.00)\n(0.00, 0.75, -2.00)', msg: 'Add bileşen bileşen toplamalı' },
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(4, 5, 6).Sub(new Vec3(1, 2, 3)));
Console.WriteLine(new Vec3(0, 0, 0).Sub(new Vec3(1, -2, 3)));`, expect: '(3.00, 3.00, 3.00)\n(-1.00, 2.00, -3.00)', msg: 'Sub bileşen bileşen çıkarmalı' },
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(1, -2, 0.5).Scale(2));
Console.WriteLine(new Vec3(3, 6, 9).Scale(1.0 / 3));`, expect: '(2.00, -4.00, 1.00)\n(1.00, 2.00, 3.00)', msg: 'Scale her bileşeni çarpmalı' },
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(2, 3, 6).Length());
Console.WriteLine(new Vec3(1, 1, 1).Length().ToString("F3"));
Console.WriteLine(new Vec3(0, 0, 0).Length());`, expect: '7\n1.732\n0', msg: 'Length üç boyutlu Pisagor ile hesaplanmalı' },
          { type: 'harness', append: cs`var p = new Vec3(1, 1, 1);
var q = p.Add(new Vec3(1, 0, 0));
Console.WriteLine(p + " " + q);`, expect: '(1.00, 1.00, 1.00) (2.00, 1.00, 1.00)', msg: 'İşlemler yeni bir Vec3 döndürmeli, orijinali değiştirmemeli' },
        ],
        hints: [
          'Her metot <code>new Vec3(..., ..., ...)</code> döndürmeli. <code>Add</code> için ilk bileşen <code>X + o.X</code>.',
          '<code>public Vec3 Scale(double s) =&gt; new Vec3(X * s, Y * s, Z * s);</code> — <code>Sub</code> da <code>Add</code>\'e çok benzer.',
          '<code>Length</code>: <code>return Math.Sqrt(X * X + Y * Y + Z * Z);</code>',
        ],
        solution: cs`var a = new Vec3(1, 2, 3);
var b = new Vec3(4, 5, 6);
Console.WriteLine(a.Add(b));
Console.WriteLine("Uzaklık: " + b.Sub(a).Length().ToString("F2"));

` + VEC3_HEAD + VEC3_TAIL,
        explain: 'Vektör işlemleri, tüm 3D yazılımların alfabesidir. İki noktanın uzaklığının <code>b.Sub(a).Length()</code> olması gibi, karmaşık işlemler bu birkaç basit metodun birleşimiyle yazılır.',
      },
    },
    {
      title: 'Adım 3 — Z ekseni etrafında döndürme',
      body: `
<p>Blender'da <b>R → Z → 90</b> yazdığında olan şey: her vertex, Z ekseni etrafında 90° döner. Z değişmez; sadece X ve Y değişir. Yani bu aslında XY düzleminde 2D bir dönüştür:</p>
<pre>x' = x·cos(θ) − y·sin(θ)
y' = x·sin(θ) + y·cos(θ)
z' = z</pre>
<p>Neden bu formül? <code>(1, 0)</code> noktası θ kadar dönünce birim çemberde <code>(cos θ, sin θ)</code>'ya gider; <code>(0, 1)</code> ise <code>(−sin θ, cos θ)</code>'ya. Her nokta bu ikisinin birleşimi olduğu için sonuç yukarıdaki formüldür.</p>
<p><b>Derece ↔ radyan:</b> İnsanlar derece düşünür, <code>Math.Sin</code> / <code>Math.Cos</code> ise <t en="radian" ja="ラジアン">radyan</t> ister. Dönüşüm: <code>radyan = derece × π / 180</code>. Bu dönüşümü unutmak, 3D programlamada en sık yapılan hatadır: <code>Math.Cos(90)</code> sıfır değil, <code>-0.448</code>'dir!</p>`,
      code: cs`Console.WriteLine(Math.Cos(90));                  // yanlış: 90 radyan!
Console.WriteLine(Math.Cos(90 * Math.PI / 180));   // neredeyse 0 (6.1E-17)
double t = 30 * Math.PI / 180;
Console.WriteLine($"sin 30° = {Math.Sin(t):F4}, cos 30° = {Math.Cos(t):F4}");`,
      runnable: true,
      exercise: {
        title: 'RotateZ',
        prompt: `
<p><code>Vec3</code>'e <code>public Vec3 RotateZ(double degrees)</code> metodunu yaz: noktayı orijinden geçen Z ekseni etrafında <code>degrees</code> derece döndürüp <b>yeni</b> bir vektör döndürsün (pozitif açı = yukarıdan bakınca saat yönünün tersi).</p>
<pre class="expected">new Vec3(1, 0, 0).RotateZ(90)    → (0.00, 1.00, 0.00)
new Vec3(2, 1, 0).RotateZ(30)    → (1.23, 1.87, 0.00)
new Vec3(1, 0, 5).RotateZ(180)   → (-1.00, 0.00, 5.00)</pre>`,
        starter: cs`var p = new Vec3(1, 0, 0);
Console.WriteLine(p.RotateZ(90));

` + VEC3_HEAD + cs`
    public Vec3 RotateZ(double degrees)
    {
        // 1) dereceyi radyana çevir
        // 2) formülü uygula; Z değişmez
        return this;
    }
` + VEC3_TAIL,
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(1, 0, 0).RotateZ(90));
Console.WriteLine(new Vec3(0, 1, 0).RotateZ(90));
Console.WriteLine(new Vec3(1, 0, 5).RotateZ(180));`, expect: '(0.00, 1.00, 0.00)\n(-1.00, 0.00, 0.00)\n(-1.00, 0.00, 5.00)', msg: '90° ve 180° dönüşler doğru olmalı (Z korunmalı)' },
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(2, 1, 0).RotateZ(30));
Console.WriteLine(new Vec3(3, 4, -2).RotateZ(-90));`, expect: '(1.23, 1.87, 0.00)\n(4.00, -3.00, -2.00)', msg: 'Ara açılar ve negatif açılar doğru olmalı' },
          { type: 'harness', append: cs`var q = new Vec3(3, 4, 0);
Console.WriteLine(q.RotateZ(37).Length().ToString("F2"));
Console.WriteLine(q.RotateZ(360));
Console.WriteLine(q);`, expect: '5.00\n(3.00, 4.00, 0.00)\n(3.00, 4.00, 0.00)', msg: 'Döndürme uzunluğu korumalı, 360° başa dönmeli, orijinal değişmemeli' },
          { type: 'code', pattern: 'Math\\.PI', msg: 'Dereceyi radyana çevirmek için Math.PI kullanmalısın' },
        ],
        hints: [
          'İlk satır: <code>double a = degrees * Math.PI / 180;</code> Sonra <code>Math.Cos(a)</code> ve <code>Math.Sin(a)</code>\'yı birer değişkene al.',
          'Yeni X: <code>X * c - Y * s</code>. Yeni Y\'yi formülden kendin yaz; Z olduğu gibi kalır.',
          '<code>return new Vec3(X * c - Y * s, X * s + Y * c, Z);</code> — <code>c</code> ve <code>s</code> değişkenlerini tanımladığından emin ol.',
        ],
        solution: cs`var p = new Vec3(1, 0, 0);
Console.WriteLine(p.RotateZ(90));

` + VEC3_HEAD + ROT_Z + VEC3_TAIL,
        explain: 'Döndürme, uzunluğu (orijine uzaklığı) korur; bu yüzden <code>(3, 4, 0)</code> hangi açıyla dönerse dönsün uzunluğu 5 kalır. Bu "korunan şeyler" (invariant) testleri, matematik kodunu doğrulamanın güçlü bir yoludur.',
      },
    },
    {
      title: 'Adım 4 — X ve Y eksenleri etrafında döndürme',
      body: `
<p>Aynı fikir, farklı düzlemler. Hangi eksen etrafında dönüyorsan o bileşen sabit kalır, diğer ikisi 2D dönüş formülüne girer:</p>
<pre>RotateX:  y' = y·cos − z·sin     z' = y·sin + z·cos     (x sabit)
RotateY:  x' = x·cos + z·sin     z' = −x·sin + z·cos    (y sabit)
RotateZ:  x' = x·cos − y·sin     y' = x·sin + y·cos     (z sabit)</pre>
<p><b>RotateY'deki işaretler neden farklı?</b> Sağ el kuralında eksenler döngüsel sıralanır: X → Y → Z → X. X etrafında dönüş "Y'den Z'ye", Z etrafında dönüş "X'ten Y'ye" gider; Y etrafında dönüş ise "<b>Z'den X'e</b>" gider. Formülü <code>(z, x)</code> sırasıyla yazınca diğerleriyle aynı kalıptır; <code>(x, z)</code> sırasıyla yazınca işaretler yer değiştirmiş görünür.</p>
<div class="callout tip">Kontrol yöntemi: <code>(0, 0, 1)</code> noktasını (Z ucunu) Y etrafında +90° döndür. Sağ el kuralına göre +X'e gitmeli. Formül: x' = 0·0 + 1·1 = 1, z' = −0·1 + 1·0 = 0 → <code>(1, 0, 0)</code> ✓. Formül yazınca her zaman böyle bir "bilinen cevap" testi yap.</div>`,
      exercise: {
        title: 'RotateX ve RotateY',
        prompt: `
<p><code>RotateZ</code> hazır. Aynı kalıpla <code>RotateX(double degrees)</code> ve <code>RotateY(double degrees)</code> metotlarını yaz.</p>
<pre class="expected">new Vec3(0, 1, 0).RotateX(90)   → (0.00, 0.00, 1.00)
new Vec3(0, 0, 1).RotateY(90)   → (1.00, 0.00, 0.00)
new Vec3(1, 0, 0).RotateY(90)   → (0.00, 0.00, -1.00)</pre>`,
        starter: cs`Console.WriteLine(new Vec3(0, 1, 0).RotateX(90));
Console.WriteLine(new Vec3(0, 0, 1).RotateY(90));

` + VEC3_HEAD + ROT_Z + cs`
    public Vec3 RotateX(double degrees)
    {
        return this;
    }

    public Vec3 RotateY(double degrees)
    {
        return this;
    }
` + VEC3_TAIL,
        checks: [
          { type: 'output', expect: '(0.00, 0.00, 1.00)\n(1.00, 0.00, 0.00)', msg: 'Başlangıçtaki iki örnek doğru sonuç vermeli' },
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(0, 1, 0).RotateX(90));
Console.WriteLine(new Vec3(0, 0, 1).RotateX(90));
Console.WriteLine(new Vec3(5, 2, 3).RotateX(45));`, expect: '(0.00, 0.00, 1.00)\n(0.00, -1.00, 0.00)\n(5.00, -0.71, 3.54)', msg: 'RotateX: x sabit, y ve z dönmeli' },
          { type: 'harness', append: cs`Console.WriteLine(new Vec3(0, 0, 1).RotateY(90));
Console.WriteLine(new Vec3(1, 0, 0).RotateY(90));
Console.WriteLine(new Vec3(2, 7, 0).RotateY(-30));`, expect: '(1.00, 0.00, 0.00)\n(0.00, 0.00, -1.00)\n(1.73, 7.00, 1.00)', msg: 'RotateY: y sabit, işaretler sağ el kuralına uygun olmalı' },
          { type: 'harness', append: cs`var v = new Vec3(1, 2, 3);
Console.WriteLine(v.RotateX(90).RotateX(-90));
Console.WriteLine(v.RotateY(123).Length().ToString("F2") + " " + v.Length().ToString("F2"));`, expect: '(1.00, 2.00, 3.00)\n3.74 3.74', msg: 'Ters açıyla döndürmek geri getirmeli, uzunluk korunmalı' },
        ],
        hints: [
          'İki metot da <code>RotateZ</code> gibi başlar: dereceyi radyana çevir, <code>c</code> ve <code>s</code>\'yi hesapla.',
          '<code>RotateX</code>: <code>return new Vec3(X, Y * c - Z * s, Y * s + Z * c);</code>',
          '<code>RotateY</code>\'de Y sabit kalır; yeni X <code>X * c + Z * s</code>, yeni Z ise <code>-X * s + Z * c</code>.',
        ],
        solution: cs`Console.WriteLine(new Vec3(0, 1, 0).RotateX(90));
Console.WriteLine(new Vec3(0, 0, 1).RotateY(90));

` + VEC3_FULL,
        explain: 'Üç dönüş aslında aynı 2D formülün üç farklı düzleme uygulanmasıdır. "Ters açıyla geri döner" ve "uzunluk korunur" testleri, işaret hatalarını hemen yakalar.',
      },
    },
    {
      title: 'Adım 5 — Transform: ölçek → döndür → taşı (yerel → dünya)',
      body: `
<p>Blender'da bir objenin <b>Location / Rotation / Scale</b> değerleri vardır. Mesh'in vertex'leri ise objenin kendi <t en="local coordinates" ja="ローカル座標">yerel koordinatlarında</t> saklanır: küpün köşeleri her zaman <code>(±1, ±1, ±1)</code>'dir; obje nereye taşınırsa taşınsın mesh verisi değişmez. Ekrana çizmek için her vertex'i <t en="world coordinates" ja="ワールド座標">dünya koordinatlarına</t> çeviririz.</p>
<p><b>Sıra çok önemli:</b> önce <b>ölçek</b>, sonra <b>döndürme</b>, en son <b>taşıma</b> (TRS — okunuşu tersten: Translate · Rotate · Scale).</p>
<ul>
<li>Önce taşıyıp sonra döndürseydik, obje kendi merkezi etrafında değil <b>dünya orijini</b> etrafında dönerdi (Blender'da pivot noktası "3D Cursor" iken olan şey).</li>
<li>Önce döndürüp sonra ölçekleseydik, eşit olmayan ölçek (ör. 1, 2, 3) eğik eksenlerde uygulanır ve küp çarpılırdı.</li>
</ul>
<p>Döndürme sırası da bir seçimdir. Blender'ın varsayılanı "XYZ Euler": önce X, sonra Y, sonra Z dönüşü uygulanır. Biz de aynısını yapacağız.</p>
<div class="callout tip">Blender'daki <b>Apply → All Transforms</b> (Ctrl+A) tam olarak bu hesabı yapar: her vertex'i dünya koordinatına çevirip mesh'e yazar ve transform'u sıfırlar. Oyun motoruna aktarmadan önce neden "apply" yaptığını artık matematiksel olarak biliyorsun.</div>`,
      exercise: {
        title: 'LocalToWorld',
        prompt: `
<p><code>Transform</code> sınıfının <code>LocalToWorld(Vec3 p)</code> metodunu yaz:</p>
<ol>
<li>Ölçek: bileşen bileşen çarp → <code>(p.X·Scale.X, p.Y·Scale.Y, p.Z·Scale.Z)</code></li>
<li>Döndür: önce <code>RotateX(Rotation.X)</code>, sonra <code>RotateY(Rotation.Y)</code>, sonra <code>RotateZ(Rotation.Z)</code></li>
<li>Taşı: <code>Position</code> ekle</li>
</ol>
<pre class="expected">Position (10, 0, 0), Rotation (0, 0, 90), Scale (2, 2, 2)
LocalToWorld((1, 0, 0)) → (10.00, 2.00, 0.00)</pre>`,
        starter: cs`var t = new Transform();
t.Position = new Vec3(10, 0, 0);
t.Rotation = new Vec3(0, 0, 90);
t.Scale = new Vec3(2, 2, 2);
Console.WriteLine(t.LocalToWorld(new Vec3(1, 0, 0)));

class Transform
{
    public Vec3 Position { get; set; } = new Vec3(0, 0, 0);
    public Vec3 Rotation { get; set; } = new Vec3(0, 0, 0);   // derece (X, Y, Z)
    public Vec3 Scale { get; set; } = new Vec3(1, 1, 1);

    public Vec3 LocalToWorld(Vec3 p)
    {
        // 1) ölçek  2) döndür (X, Y, Z sırasıyla)  3) taşı
        return p;
    }
}

` + VEC3_FULL,
        checks: [
          { type: 'output', expect: '(10.00, 2.00, 0.00)', msg: 'Örnekteki nokta (10.00, 2.00, 0.00) olmalı' },
          { type: 'harness', append: cs`var t2 = new Transform();
t2.Position = new Vec3(0, 0, 1);
t2.Rotation = new Vec3(90, 0, 0);
t2.Scale = new Vec3(1, 2, 3);
Console.WriteLine(t2.LocalToWorld(new Vec3(1, 1, 1)));`, expect: '(1.00, -3.00, 3.00)', msg: 'Eşit olmayan ölçek, döndürmeden ÖNCE uygulanmalı' },
          { type: 'harness', append: cs`var t3 = new Transform();
t3.Rotation = new Vec3(90, 0, 90);
Console.WriteLine(t3.LocalToWorld(new Vec3(0, 1, 0)));
Console.WriteLine(t3.LocalToWorld(new Vec3(1, 0, 0)));`, expect: '(0.00, 0.00, 1.00)\n(0.00, 1.00, 0.00)', msg: 'Dönüşler X, sonra Y, sonra Z sırasıyla uygulanmalı' },
          { type: 'harness', append: cs`var t4 = new Transform();
t4.Position = new Vec3(5, 5, 5);
Console.WriteLine(t4.LocalToWorld(new Vec3(-1, -1, -1)));
var t5 = new Transform();
Console.WriteLine(t5.LocalToWorld(new Vec3(1, 2, 3)));`, expect: '(4.00, 4.00, 4.00)\n(1.00, 2.00, 3.00)', msg: 'Sadece taşıma ve varsayılan transform doğru çalışmalı' },
        ],
        hints: [
          'Ölçek adımı: <code>Vec3 s = new Vec3(p.X * Scale.X, p.Y * Scale.Y, p.Z * Scale.Z);</code>',
          'Metotlar yeni vektör döndürdüğü için zincirleyebilirsin: <code>s.RotateX(Rotation.X).RotateY(...)...</code>',
          'Son satır: <code>return r.Add(Position);</code> — <code>r</code>, üç dönüşün uygulandığı vektör.',
        ],
        solution: cs`var t = new Transform();
t.Position = new Vec3(10, 0, 0);
t.Rotation = new Vec3(0, 0, 90);
t.Scale = new Vec3(2, 2, 2);
Console.WriteLine(t.LocalToWorld(new Vec3(1, 0, 0)));

` + TRANSFORM_FULL + `

` + VEC3_FULL,
        explain: 'Üç basit işlemi doğru sırayla birleştirmek, bir "dönüşüm hattı" oluşturur. GPU\'lar ve CAD çekirdekleri bunu 4×4 matrislerle yapar (Adım 9), ama mantık birebir aynıdır.',
      },
    },
    {
      title: 'Adım 6 — Perspektif izdüşüm: 3D noktadan ekran pikseline',
      body: `
<p>Ekran 2D'dir. 3D bir noktayı ekrana koymak için <t en="projection" ja="投影">izdüşüm</t> gerekir. Perspektifin tek kuralı: <b>uzaktaki şeyler küçük görünür</b>. Matematikte bu, <b>derinliğe bölmek</b> demektir.</p>
<svg viewBox="0 0 560 190" role="img" aria-label="Perspektif izdüşümde benzer üçgenler">
  <g font-size="13">
    <circle cx="40" cy="150" r="6" class="acc"/><text x="20" y="175" class="t2">kamera</text>
    <line x1="40" y1="150" x2="520" y2="150" class="ln"/><text x="470" y="170" class="t3">derinlik (+Y)</text>
    <line x1="200" y1="40" x2="200" y2="160" stroke="var(--accent-2)" stroke-width="3"/><text x="160" y="35" class="t2">ekran (f)</text>
    <line x1="460" y1="150" x2="460" y2="50" stroke="var(--z)" stroke-width="3"/><text x="468" y="60" class="t2">nokta (z)</text>
    <line x1="40" y1="150" x2="460" y2="50" stroke="var(--warn)" stroke-dasharray="5 4"/>
    <circle cx="200" cy="112" r="5" fill="var(--warn)"/><text x="210" y="108" class="t3">ekrandaki yükseklik = f · z / derinlik</text>
  </g>
</svg>
<p>Kameramızı Blender'ın <b>ön görünümü</b> (Numpad 1) gibi kuruyoruz: kamera <code>-Y</code> tarafında, <code>camDist</code> uzaklıkta, <code>+Y</code>'ye bakıyor. Ekranda X sağa, Z yukarı.</p>
<pre>derinlik = p.Y + camDist
ekranX = cx + focal · p.X / derinlik
ekranY = cy − focal · p.Z / derinlik</pre>
<ul>
<li><code>cx, cy</code>: ekranın ortası (piksel). <code>focal</code>: odak uzaklığı — büyüdükçe "zoom" artar (kameradaki mm değeri gibi).</li>
<li><b>Eksi işareti:</b> Ekranda Y aşağı doğru artar, 3D'de Z yukarı. Bu yüzden çıkarıyoruz.</li>
<li><b>Kameranın arkası:</b> Derinlik sıfır ya da negatifse nokta kameranın arkasındadır; bölme anlamsızlaşır. Bu durumda <code>null</code> döndürüp çizmeyeceğiz.</li>
</ul>`,
      exercise: {
        title: 'Project',
        prompt: `
<p><code>Vec2? Project(Vec3 p, double camDist, double focal, double cx, double cy)</code> fonksiyonunu yaz. Derinlik <code>0.1</code>'den küçükse <code>null</code> döndür. Testlerde <code>camDist = 10</code>, <code>focal = 500</code>, ekran merkezi <code>(400, 300)</code>:</p>
<pre class="expected">(0, 0, 0)    → (400.0, 300.0)
(2, 0, 1)    → (500.0, 250.0)
(2, 10, 1)   → (450.0, 275.0)   (iki kat uzakta → yarı boyut)
(0, -12, 0)  → null             (kameranın arkasında)</pre>`,
        starter: cs`Vec2? Project(Vec3 p, double camDist, double focal, double cx, double cy)
{
    // derinliği hesapla, kameranın arkasındaysa null döndür, değilse ekran noktasını döndür
    return new Vec2(0, 0);
}

Console.WriteLine(Project(new Vec3(2, 0, 1), 10, 500, 400, 300));

` + VEC2 + `

` + VEC3_FULL,
        checks: [
          { type: 'output', expect: '(500.0, 250.0)', msg: '(2, 0, 1) noktası (500.0, 250.0)\'a düşmeli' },
          { type: 'harness', append: cs`Console.WriteLine(Project(new Vec3(0, 0, 0), 10, 500, 400, 300));
Console.WriteLine(Project(new Vec3(2, 10, 1), 10, 500, 400, 300));
Console.WriteLine(Project(new Vec3(1, -5, -1), 10, 500, 400, 300));
Console.WriteLine(Project(new Vec3(1, 2, 3), 10, 500, 400, 300));`, expect: '(400.0, 300.0)\n(450.0, 275.0)\n(500.0, 400.0)\n(441.7, 175.0)', msg: 'Derinliğe bölme ve Y ekseninin ters çevrilmesi doğru olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(Project(new Vec3(0, -10, 0), 10, 500, 400, 300) == null);
Console.WriteLine(Project(new Vec3(3, -12, 1), 10, 500, 400, 300) == null);
Console.WriteLine(Project(new Vec3(0, -9, 0), 10, 500, 400, 300) == null);`, expect: 'True\nTrue\nFalse', msg: 'Kameranın arkasındaki (derinlik < 0.1) noktalar için null döndürmeli' },
          { type: 'harness', append: cs`Console.WriteLine(Project(new Vec3(1, 0, 1), 5, 200, 0, 0));`, expect: '(40.0, -40.0)', msg: 'Parametreler (camDist, focal, cx, cy) gerçekten kullanılmalı' },
        ],
        hints: [
          'Önce <code>double depth = p.Y + camDist;</code> ve <code>if (depth &lt; 0.1) return null;</code>',
          'Ekran X: <code>cx + focal * p.X / depth</code>. Ekran Y için Z kullan ve işarete dikkat et.',
          '<code>return new Vec2(cx + focal * p.X / depth, cy - focal * p.Z / depth);</code>',
        ],
        solution: PROJECT_FN + cs`

Console.WriteLine(Project(new Vec3(2, 0, 1), 10, 500, 400, 300));

` + VEC2 + `

` + VEC3_FULL,
        explain: 'Bütün perspektif "sihri" tek bir bölmedir: <code>x / derinlik</code>. Ortografik (paralel) görünümde bu bölme yoktur; CAD programlarında teknik çizimler için ortografik, sunum için perspektif görünüm kullanılır. Bölmeyi kaldırıp sabit bir ölçekle çarparsan ortografik görünüm elde edersin.',
      },
    },
    {
      title: 'Adım 7 — Tel kafes küp: 8 köşe, 12 kenar',
      body: `
<p>Bir tel kafes modeli iki listeden oluşur — tıpkı Blender'daki mesh verisi gibi:</p>
<ul>
<li><b>Köşeler</b> (<t en="vertices" ja="頂点">vertices</t>): <code>List&lt;Vec3&gt;</code></li>
<li><b>Kenarlar</b> (<t en="edges" ja="辺">edges</t>): hangi iki köşenin bağlı olduğu, <b>indeks çiftleri</b> olarak: <code>int[,]</code></li>
</ul>
<p>Kenarlar koordinat değil indeks sakladığı için, köşeleri dönüştürdüğünde kenarlar otomatik olarak doğru yerlere bağlanır. OBJ dosya formatı da tam olarak böyledir: <code>v</code> satırları köşeler, <code>f</code> satırları indeksler.</p>
<p>Köşe sırası (yarı boyut <code>h = size / 2</code>):</p>
<pre>0 (-h,-h,-h)  1 ( h,-h,-h)  2 ( h, h,-h)  3 (-h, h,-h)   ← alt yüz
4 (-h,-h, h)  5 ( h,-h, h)  6 ( h, h, h)  7 (-h, h, h)   ← üst yüz</pre>
<p>Kenarlar: alt <code>0-1, 1-2, 2-3, 3-0</code>; üst <code>4-5, 5-6, 6-7, 7-4</code>; dikey <code>0-4, 1-5, 2-6, 3-7</code>.</p>
<p>Ekrana çizim hattı: <b>yerel köşe → LocalToWorld → Project → her kenar için iki noktayı birleştir</b>.</p>`,
      exercise: {
        title: 'CubeCorners ve TransformAll',
        prompt: `
<p>İki fonksiyon yaz:</p>
<ul>
<li><code>List&lt;Vec3&gt; CubeCorners(double size)</code> — merkezi orijinde, kenar uzunluğu <code>size</code> olan küpün 8 köşesi, <b>yukarıdaki sırayla</b>.</li>
<li><code>List&lt;Vec3&gt; TransformAll(List&lt;Vec3&gt; local, Transform t)</code> — her noktaya <code>t.LocalToWorld</code> uygulayıp yeni liste döndür.</li>
</ul>
<pre class="expected">CubeCorners(2)[0] → (-1.00, -1.00, -1.00)
CubeCorners(2)[6] → (1.00, 1.00, 1.00)</pre>`,
        starter: cs`List<Vec3> CubeCorners(double size)
{
    var list = new List<Vec3>();
    // 8 köşeyi sırasıyla ekle
    return list;
}

List<Vec3> TransformAll(List<Vec3> local, Transform t)
{
    var result = new List<Vec3>();
    return result;
}

int[,] edges =
{
    { 0, 1 }, { 1, 2 }, { 2, 3 }, { 3, 0 },
    { 4, 5 }, { 5, 6 }, { 6, 7 }, { 7, 4 },
    { 0, 4 }, { 1, 5 }, { 2, 6 }, { 3, 7 },
};
var corners = CubeCorners(2);
Console.WriteLine("Köşe: " + corners.Count + ", kenar: " + edges.GetLength(0));

` + TRANSFORM_FULL + `

` + VEC3_FULL,
        checks: [
          { type: 'output', expect: 'Köşe: 8, kenar: 12', msg: 'Küp 8 köşeye sahip olmalı' },
          { type: 'harness', append: cs`var c = CubeCorners(2);
for (int i = 0; i < c.Count; i++) Console.WriteLine(i + " " + c[i]);`, expect: '0 (-1.00, -1.00, -1.00)\n1 (1.00, -1.00, -1.00)\n2 (1.00, 1.00, -1.00)\n3 (-1.00, 1.00, -1.00)\n4 (-1.00, -1.00, 1.00)\n5 (1.00, -1.00, 1.00)\n6 (1.00, 1.00, 1.00)\n7 (-1.00, 1.00, 1.00)', msg: 'Köşeler belirtilen sırada ve ±size/2 koordinatlarında olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(CubeCorners(5)[6]);
Console.WriteLine(CubeCorners(1)[3]);`, expect: '(2.50, 2.50, 2.50)\n(-0.50, 0.50, -0.50)', msg: 'size parametresi kullanılmalı' },
          { type: 'harness', append: cs`var t = new Transform();
t.Position = new Vec3(0, 0, 5);
t.Rotation = new Vec3(0, 0, 45);
var w = TransformAll(CubeCorners(2), t);
Console.WriteLine(w.Count);
Console.WriteLine(w[1]);
Console.WriteLine(w[6]);`, expect: '8\n(1.41, 0.00, 4.00)\n(0.00, 1.41, 6.00)', msg: 'TransformAll her köşeye LocalToWorld uygulamalı' },
          { type: 'harness', append: cs`var loc = CubeCorners(2);
var t = new Transform();
t.Position = new Vec3(3, 0, 0);
TransformAll(loc, t);
Console.WriteLine(loc[0]);`, expect: '(-1.00, -1.00, -1.00)', msg: 'TransformAll yeni liste döndürmeli; yerel köşeler değişmemeli' },
        ],
        hints: [
          'Önce <code>double h = size / 2;</code> Sonra 8 kez <code>list.Add(new Vec3(...));</code> — alt yüzdeki dört köşenin Z\'si <code>-h</code>.',
          'Sıra: <code>(-h,-h,-h)</code>, <code>(h,-h,-h)</code>, <code>(h,h,-h)</code>, <code>(-h,h,-h)</code>; üst yüz aynı X/Y sırasıyla, Z = <code>h</code>.',
          '<code>TransformAll</code>: <code>foreach (Vec3 p in local) result.Add(t.LocalToWorld(p));</code>',
        ],
        solution: cs`List<Vec3> CubeCorners(double size)
{
    double h = size / 2;
    var list = new List<Vec3>();
    list.Add(new Vec3(-h, -h, -h));
    list.Add(new Vec3(h, -h, -h));
    list.Add(new Vec3(h, h, -h));
    list.Add(new Vec3(-h, h, -h));
    list.Add(new Vec3(-h, -h, h));
    list.Add(new Vec3(h, -h, h));
    list.Add(new Vec3(h, h, h));
    list.Add(new Vec3(-h, h, h));
    return list;
}

List<Vec3> TransformAll(List<Vec3> local, Transform t)
{
    var result = new List<Vec3>();
    foreach (Vec3 p in local) result.Add(t.LocalToWorld(p));
    return result;
}

int[,] edges =
{
    { 0, 1 }, { 1, 2 }, { 2, 3 }, { 3, 0 },
    { 4, 5 }, { 5, 6 }, { 6, 7 }, { 7, 4 },
    { 0, 4 }, { 1, 5 }, { 2, 6 }, { 3, 7 },
};
var corners = CubeCorners(2);
Console.WriteLine("Köşe: " + corners.Count + ", kenar: " + edges.GetLength(0));

` + TRANSFORM_FULL + `

` + VEC3_FULL,
        explain: 'Yerel veriyi hiç değiştirmeden her karede yeniden dönüştürmek, 3D programların standart yaklaşımıdır: kullanıcı kaydırıcıyı oynattıkça sadece <code>Transform</code> değişir, mesh aynı kalır. Böylece hatalar birikmez (her seferinde "döndürülmüşü tekrar döndürmek" kayan nokta hatalarını büyütürdü).',
      },
    },
    {
      title: 'Adım 8 — Z-up ↔ Y-up dönüşümü',
      body: `
<p>Bir Y-up programdan (Maya, Unity, glTF) gelen modeli Z-up bir programa (Blender, birçok CAD aracı) aktarırken koordinatları dönüştürmek gerekir. Doğru dönüşüm sadece "Y ile Z'yi yer değiştir" değildir; o zaman sistemin <b>el yönü</b> değişir (sağ el sistemi sol ele döner ve model aynalanır).</p>
<p>Sağ elli iki sistem arasında doğru dönüşüm, X ekseni etrafında 90°'lik bir döndürmedir:</p>
<pre>Y-up → Z-up:   (x, y, z)  →  (x, −z, y)
Z-up → Y-up:   (x, y, z)  →  (x, z, −y)</pre>
<p>Kontrol: Y-up'ta "yukarı" <code>(0, 1, 0)</code> → Z-up'ta <code>(0, 0, 1)</code> ✓. Y-up'ta izleyiciye doğru <code>+Z</code> <code>(0, 0, 1)</code> → Z-up'ta <code>(0, −1, 0)</code>, yani Blender'ın "ön" tarafı ✓.</p>
<div class="callout tip">Blender'ın FBX/glTF aktarıcılarındaki "Forward / Up" ayarları bu dönüşümü yapar. CAD/BIM dünyasında da farklı formatlar (IFC, OBJ, glTF...) arasında veri taşırken bu dönüşüm sürekli karşına çıkar.</div>`,
      exercise: {
        title: 'YUpToZUp ve ZUpToYUp',
        prompt: `
<p>İki fonksiyon yaz: <code>Vec3 YUpToZUp(Vec3 p)</code> ve <code>Vec3 ZUpToYUp(Vec3 p)</code>. Birini uygulayıp diğerini uygulamak noktayı geri getirmeli.</p>
<pre class="expected">YUpToZUp((0, 1, 0)) → (0.00, 0.00, 1.00)
YUpToZUp((1, 2, 3)) → (1.00, -3.00, 2.00)
ZUpToYUp((1, -3, 2)) → (1.00, 2.00, 3.00)</pre>`,
        starter: cs`Vec3 YUpToZUp(Vec3 p)
{
    return p;
}

Vec3 ZUpToYUp(Vec3 p)
{
    return p;
}

Console.WriteLine(YUpToZUp(new Vec3(0, 1, 0)));

` + VEC3_FULL,
        checks: [
          { type: 'harness', append: cs`Console.WriteLine(YUpToZUp(new Vec3(0, 1, 0)));
Console.WriteLine(YUpToZUp(new Vec3(1, 2, 3)));
Console.WriteLine(YUpToZUp(new Vec3(0, 0, 1)));`, expect: '(0.00, 0.00, 1.00)\n(1.00, -3.00, 2.00)\n(0.00, -1.00, 0.00)', msg: 'YUpToZUp (x, y, z) → (x, -z, y) olmalı' },
          { type: 'harness', append: cs`Console.WriteLine(ZUpToYUp(new Vec3(0, 0, 1)));
Console.WriteLine(ZUpToYUp(new Vec3(1, -3, 2)));`, expect: '(0.00, 1.00, 0.00)\n(1.00, 2.00, 3.00)', msg: 'ZUpToYUp (x, y, z) → (x, z, -y) olmalı' },
          { type: 'harness', append: cs`var p = new Vec3(4, -5, 6);
Console.WriteLine(ZUpToYUp(YUpToZUp(p)));
Console.WriteLine(YUpToZUp(ZUpToYUp(p)));`, expect: '(4.00, -5.00, 6.00)\n(4.00, -5.00, 6.00)', msg: 'İki dönüşüm birbirinin tersi olmalı' },
          { type: 'harness', append: cs`var a = new Vec3(1, 2, 3);
Console.WriteLine(YUpToZUp(a).RotateX(-90));`, expect: '(1.00, 2.00, 3.00)', msg: 'Dönüşüm bir X döndürmesine eşdeğer olmalı (aynalama değil)' },
        ],
        hints: [
          'Her iki fonksiyon da tek satır: <code>return new Vec3(..., ..., ...);</code> X hiç değişmez.',
          '<code>YUpToZUp</code>: yeni Y = <code>-p.Z</code>, yeni Z = <code>p.Y</code>.',
          '<code>ZUpToYUp</code>: yeni Y = <code>p.Z</code>, yeni Z = <code>-p.Y</code>. Bir örneği kâğıtta deneyerek kontrol et.',
        ],
        solution: cs`Vec3 YUpToZUp(Vec3 p)
{
    return new Vec3(p.X, -p.Z, p.Y);
}

Vec3 ZUpToYUp(Vec3 p)
{
    return new Vec3(p.X, p.Z, -p.Y);
}

Console.WriteLine(YUpToZUp(new Vec3(0, 1, 0)));

` + VEC3_FULL,
        explain: 'Doğru eksen dönüşümü bir <b>döndürmedir</b>, aynalama değil: üçgenlerin yönü (ve dolayısıyla normaller) korunur. Sadece Y ile Z\'yi takas etseydin model ayna görüntüsüne dönerdi; render\'da yüzlerin "ters" görünmesinin klasik sebeplerinden biri budur.',
      },
    },
    {
      title: 'Adım 9 (isteğe bağlı) — 4×4 matris ile aynı hesap',
      body: `
<p>Gerçek 3D motorları ve CAD çekirdekleri dönüşümleri <t en="matrix" ja="行列">matris</t> ile yapar. 4×4 bir matris; ölçek, döndürme ve taşımayı <b>tek bir nesnede</b> birleştirir. Neden 4×4? Taşıma, 3×3 matrisle ifade edilemez; noktaya 4. bir bileşen (<code>w = 1</code>) ekleyerek (<t en="homogeneous coordinates" ja="同次座標">homojen koordinatlar</t>) taşımayı da çarpmaya dönüştürürüz.</p>
<p>Avantajları: 10.000 vertex'i dönüştürürken her biri için üç ayrı dönüş + ölçek + taşıma yerine <b>tek bir matris çarpımı</b>. Hiyerarşide (parent → child) matrisleri çarparak birleştirirsin — Blender'daki parent ilişkisinin matematiği budur.</p>
<p>Aşağıdaki kod, Adım 5'teki <code>Position (10,0,0), Rotation Z 90°, Scale 2</code> örneğini matrislerle yapıp <b>aynı sonucu</b> veriyor. Çarpım sırasına dikkat: <code>T · R · S</code> — sağdaki önce uygulanır. Çalıştır ve incele; bu adım isteğe bağlı, alıştırması yok.</p>`,
      code: cs`var S = Matrix4.Scaling(2, 2, 2);
var R = Matrix4.RotationZ(90);
var T = Matrix4.Translation(10, 0, 0);
var M = T.Multiply(R).Multiply(S);    // önce S, sonra R, sonra T

Console.WriteLine(M.TransformPoint(1, 0, 0));
Console.WriteLine(M.TransformPoint(0, 1, 0));
Console.WriteLine(M);

class Matrix4
{
    public double[,] M = new double[4, 4];

    public static Matrix4 Identity()
    {
        var r = new Matrix4();
        for (int i = 0; i < 4; i++) r.M[i, i] = 1;
        return r;
    }

    public static Matrix4 Scaling(double sx, double sy, double sz)
    {
        var r = Identity();
        r.M[0, 0] = sx; r.M[1, 1] = sy; r.M[2, 2] = sz;
        return r;
    }

    public static Matrix4 Translation(double tx, double ty, double tz)
    {
        var r = Identity();
        r.M[0, 3] = tx; r.M[1, 3] = ty; r.M[2, 3] = tz;
        return r;
    }

    public static Matrix4 RotationZ(double degrees)
    {
        double a = degrees * Math.PI / 180;
        var r = Identity();
        r.M[0, 0] = Math.Cos(a); r.M[0, 1] = -Math.Sin(a);
        r.M[1, 0] = Math.Sin(a); r.M[1, 1] = Math.Cos(a);
        return r;
    }

    public Matrix4 Multiply(Matrix4 o)
    {
        var r = new Matrix4();
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++)
            {
                double sum = 0;
                for (int k = 0; k < 4; k++) sum += M[i, k] * o.M[k, j];
                r.M[i, j] = sum;
            }
        return r;
    }

    public string TransformPoint(double x, double y, double z)
    {
        double nx = M[0, 0] * x + M[0, 1] * y + M[0, 2] * z + M[0, 3];
        double ny = M[1, 0] * x + M[1, 1] * y + M[1, 2] * z + M[1, 3];
        double nz = M[2, 0] * x + M[2, 1] * y + M[2, 2] * z + M[2, 3];
        return "(" + F(nx) + ", " + F(ny) + ", " + F(nz) + ")";
    }

    static string F(double v) => (Math.Abs(v) < 0.005 ? 0.0 : v).ToString("F2");

    public override string ToString()
    {
        string s = "";
        for (int i = 0; i < 4; i++)
            s += "[" + F(M[i, 0]) + "  " + F(M[i, 1]) + "  " + F(M[i, 2]) + "  " + F(M[i, 3]) + "]\n";
        return s;
    }
}`,
      runnable: true,
    },
    {
      title: 'Adım 10 — Visual Studio: arayüzü kur',
      body: `
<p>Matematik hazır; şimdi pencere. Tarayıcıda yazdığın <code>Vec3</code>, <code>Vec2</code>, <code>Transform</code> sınıflarını ve <code>Project</code> fonksiyonunu (bir <code>static class Camera</code> içine) <code>Math3D</code> klasörüne taşı.</p>
<ol>
<li>Form1'e bir <b>SplitContainer</b> ekle. Sol panel: çizim alanı (P2'deki çift tamponlu <code>Canvas</code>'ı <code>Dock = Fill</code> ile koy). Sağ panel: kontroller (genişlik ≈ 260 px).</li>
<li>Sağ panele bir <b>GroupBox</b> "Konum": 3 <code>NumericUpDown</code> (<code>nudPosX/Y/Z</code>) — <code>Minimum</code> -10, <code>Maximum</code> 10, <code>DecimalPlaces</code> 1, <code>Increment</code> 0.1.</li>
<li>GroupBox "Dönüş (°)": 3 <b>TrackBar</b> (<code>trkRotX/Y/Z</code>) — <code>Minimum</code> -180, <code>Maximum</code> 180, <code>TickFrequency</code> 15. Yanlarına değeri gösteren <code>Label</code>'lar.</li>
<li>GroupBox "Ölçek": 3 <code>NumericUpDown</code> (<code>nudScaleX/Y/Z</code>) — 0.1 ile 5 arası, varsayılan 1.</li>
<li>Hepsinin <code>ValueChanged</code> olayını <b>tek bir</b> işleyiciye bağla: Properties penceresinde ⚡ (Events) → ValueChanged → açılır listeden <code>Controls_ValueChanged</code>'i seç.</li>
</ol>
<p><code>NumericUpDown.Value</code> bir <code>decimal</code>'dır; <code>(double)nudPosX.Value</code> ile çevir. <code>decimal</code> para gibi kesin ondalık hesaplar için, <code>double</code> ise hızlı bilimsel/geometrik hesaplar içindir.</p>`,
      code: cs`// Form1.cs
using Viewer3D.Math3D;

public partial class Form1 : Form
{
    private readonly Transform cube = new Transform();

    public Form1()
    {
        InitializeComponent();
        canvas.Paint += Canvas_Paint;
    }

    // Tüm NumericUpDown ve TrackBar'ların ValueChanged olayı buraya bağlı
    private void Controls_ValueChanged(object? sender, EventArgs e)
    {
        cube.Position = new Vec3((double)nudPosX.Value, (double)nudPosY.Value, (double)nudPosZ.Value);
        cube.Rotation = new Vec3(trkRotX.Value, trkRotY.Value, trkRotZ.Value);
        cube.Scale = new Vec3((double)nudScaleX.Value, (double)nudScaleY.Value, (double)nudScaleZ.Value);

        lblRotX.Text = trkRotX.Value + "°";
        lblRotY.Text = trkRotY.Value + "°";
        lblRotZ.Text = trkRotZ.Value + "°";

        canvas.Invalidate();   // değişti → yeniden çiz
    }
}`,
      runnable: false,
      checklist: [
        'Vec3, Vec2, Transform ve Camera.Project\'i Math3D klasörüne taşıdım ve derledim',
        'SplitContainer ile çizim alanı + kontrol paneli düzenini kurdum',
        'Konum ve ölçek için NumericUpDown, dönüş için TrackBar ekleyip aralıklarını ayarladım',
        'Tüm kontrollerin ValueChanged olayını tek bir işleyiciye bağladım',
        'Kaydırıcıları oynatınca etiketlerin güncellendiğini gördüm',
      ],
    },
    {
      title: 'Adım 11 — Visual Studio: eksenleri ve küpü çiz',
      body: `
<p>Paint işleyicisinde hattın tamamı çalışır: <b>yerel köşeler → LocalToWorld → görünüm döndürmesi → Project → DrawLine</b>.</p>
<p><b>Görünüm döndürmesi (orbit):</b> Kamerayı sabit tutup <b>dünyayı</b> döndürmek daha kolaydır. Önce Z etrafında <code>viewYaw</code>, sonra X etrafında <code>viewPitch</code> kadar döndürürüz. Pozitif pitch, objenin üstünü kameraya doğru eğer; yani sahneye yukarıdan bakarız. Sağ tuşla sürükleyerek bu açıları değiştir (Blender'daki orta tuş orbit gibi).</p>
<ul>
<li>Eksenler: orijinden <code>(3,0,0)</code>, <code>(0,3,0)</code>, <code>(0,0,3)</code>'e; renkler kırmızı / yeşil / mavi.</li>
<li>Zemin ızgarası: XY düzleminde (z = 0), −5..5 arası açık gri çizgiler. Derinlik algısını çok artırır.</li>
<li>Küp: 12 kenar; bir kenarın uçlarından biri kameranın arkasındaysa (<code>null</code>) o kenarı atla.</li>
</ul>
<div class="callout"><b>Not:</b> Bu basit yaklaşımda gizli kenar silme (hidden line removal) yok; arkadaki kenarlar da görünür. Tel kafes için bu normaldir. Gerçek motorlar derinlik tamponu (Z-buffer) kullanır.</div>`,
      code: cs`private double viewYaw = -30, viewPitch = 20;   // derece
private Point lastMouse;

private Vec3 WorldToView(Vec3 p) => p.RotateZ(viewYaw).RotateX(viewPitch);

private void DrawLine3D(Graphics g, Pen pen, Vec3 a, Vec3 b)
{
    float cx = canvas.ClientSize.Width / 2f, cy = canvas.ClientSize.Height / 2f;
    Vec2? pa = Camera.Project(WorldToView(a), 15, 600, cx, cy);
    Vec2? pb = Camera.Project(WorldToView(b), 15, 600, cx, cy);
    if (pa == null || pb == null) return;   // kameranın arkası
    g.DrawLine(pen, (float)pa.X, (float)pa.Y, (float)pb.X, (float)pb.Y);
}

private void Canvas_Paint(object? sender, PaintEventArgs e)
{
    Graphics g = e.Graphics;
    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

    using var gridPen = new Pen(Color.Gainsboro, 1);
    for (int i = -5; i <= 5; i++)
    {
        DrawLine3D(g, gridPen, new Vec3(i, -5, 0), new Vec3(i, 5, 0));
        DrawLine3D(g, gridPen, new Vec3(-5, i, 0), new Vec3(5, i, 0));
    }

    var o = new Vec3(0, 0, 0);
    using (var px = new Pen(Color.Red, 2))   DrawLine3D(g, px, o, new Vec3(3, 0, 0));
    using (var py = new Pen(Color.Green, 2)) DrawLine3D(g, py, o, new Vec3(0, 3, 0));
    using (var pz = new Pen(Color.Blue, 2))  DrawLine3D(g, pz, o, new Vec3(0, 0, 3));

    List<Vec3> world = Mesh.TransformAll(Mesh.CubeCorners(2), cube);
    using var cubePen = new Pen(Color.Black, 1.5f);
    for (int i = 0; i < Mesh.CubeEdges.GetLength(0); i++)
        DrawLine3D(g, cubePen, world[Mesh.CubeEdges[i, 0]], world[Mesh.CubeEdges[i, 1]]);
}

// Sağ tuşla sürükleyerek görünümü döndür
private void Canvas_MouseDown(object? sender, MouseEventArgs e) => lastMouse = e.Location;

private void Canvas_MouseMove(object? sender, MouseEventArgs e)
{
    if (e.Button != MouseButtons.Right) return;
    viewYaw += (e.X - lastMouse.X) * 0.5;
    viewPitch = Math.Clamp(viewPitch + (e.Y - lastMouse.Y) * 0.5, -89, 89);
    lastMouse = e.Location;
    canvas.Invalidate();
}`,
      runnable: false,
      checklist: [
        'CubeCorners, TransformAll ve kenar listesini bir Mesh sınıfına koydum',
        'Kırmızı/yeşil/mavi X/Y/Z eksenlerini ve gri zemin ızgarasını çizdim',
        'Tel kafes küp görünüyor ve kaydırıcılarla taşınıp dönüp ölçekleniyor',
        'Sağ tuşla sürükleyerek görünümü döndürebiliyorum (orbit)',
        'Küpü kameranın arkasına taşıdığımda program çökmüyor (null kontrolü)',
      ],
    },
    {
      title: 'Adım 12 — Yerel eksenler, Z-up / Y-up anahtarı ve son dokunuşlar',
      body: `
<p>Son adımda <b>yerel ve dünya koordinatları</b> farkını görünür yapıyoruz:</p>
<ul>
<li><b>"Yerel eksenleri göster"</b> CheckBox'ı: Küpün kendi eksenlerini, küpün merkezinden çık (kısa ve ince çizgilerle). Yerel X ekseninin ucu = <code>cube.LocalToWorld(new Vec3(1.5, 0, 0))</code> (ölçeğin de uygulandığına dikkat; istersen ölçeksiz bir transform kopyası kullan). Küpü Z etrafında döndürünce yerel eksenlerin döndüğünü, dünya eksenlerinin ise sabit kaldığını göreceksin. Blender'daki <b>Transform Orientation: Global / Local</b> farkının ta kendisi.</li>
<li><b>Z-up / Y-up</b> RadioButton'ları: Y-up seçiliyken sahneyi "Y-up bir dosyadan gelmiş gibi" yorumla: kullanıcının girdiği konumu <code>YUpToZUp</code> ile çevirip öyle çiz. Etiketlerde hangi eksenin yukarı olduğunu yaz.</li>
<li><b>Sıfırla</b> butonu: tüm kontrolleri varsayılan değerlere döndür.</li>
<li><b>Durum çubuğu:</b> Küpün 6 numaralı köşesinin dünya koordinatını canlı göster — kullanıcı yerel → dünya dönüşümünü sayılarla da görsün.</li>
</ul>
<div class="callout tip">Mülakat ipucu: Bu projeyi anlatırken "3D kütüphanesi kullanmadan, dönüşüm hattını kendim yazdım; dönüş sırası ve Z-up/Y-up dönüşümünü şöyle doğruladım" diyebilmek, sadece ekran görüntüsünden çok daha etkileyicidir.</div>`,
      code: cs`private void DrawLocalAxes(Graphics g)
{
    if (!chkLocalAxes.Checked) return;
    Vec3 origin = cube.LocalToWorld(new Vec3(0, 0, 0));
    using var rx = new Pen(Color.IndianRed, 1) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dash };
    using var gy = new Pen(Color.SeaGreen, 1) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dash };
    using var bz = new Pen(Color.SteelBlue, 1) { DashStyle = System.Drawing.Drawing2D.DashStyle.Dash };
    DrawLine3D(g, rx, origin, cube.LocalToWorld(new Vec3(1.5, 0, 0)));
    DrawLine3D(g, gy, origin, cube.LocalToWorld(new Vec3(0, 1.5, 0)));
    DrawLine3D(g, bz, origin, cube.LocalToWorld(new Vec3(0, 0, 1.5)));
}

private Vec3 ReadPosition()
{
    var p = new Vec3((double)nudPosX.Value, (double)nudPosY.Value, (double)nudPosZ.Value);
    return rdoYUp.Checked ? AxisConvert.YUpToZUp(p) : p;
}

private void UpdateStatus()
{
    Vec3 corner = cube.LocalToWorld(new Vec3(1, 1, 1));
    lblStatus.Text = "Köşe 6 (dünya): " + corner;
}

private void btnReset_Click(object sender, EventArgs e)
{
    nudPosX.Value = nudPosY.Value = nudPosZ.Value = 0;
    trkRotX.Value = trkRotY.Value = trkRotZ.Value = 0;
    nudScaleX.Value = nudScaleY.Value = nudScaleZ.Value = 1;
}`,
      runnable: false,
      checklist: [
        'Yerel eksenler CheckBox\'ı ile küpün kendi eksenlerini kesikli çizgiyle gösterdim',
        'Küpü döndürünce yerel eksenlerin döndüğünü, dünya eksenlerinin sabit kaldığını gözlemledim',
        'Z-up / Y-up RadioButton\'ları ile konum girdisini dönüştürdüm',
        'Sıfırla butonu ve durum çubuğundaki canlı köşe koordinatı çalışıyor',
        'Uygulamanın ekran görüntülerini ve kısa bir GIF\'ini aldım',
      ],
    },
  ],
  finalChecklist: [
    'GitHub deposu: "viewer3d-winforms" — README\'de "3D kütüphanesi kullanılmadan" vurgusu',
    'README\'ye kaydırıcılarla küpün döndürüldüğü bir GIF ve orbit yapılmış bir ekran görüntüsü ekledim',
    'README\'de dönüşüm hattını açıklayan bir şema: yerel → ölçek → döndür (X, Y, Z) → taşı → görünüm → izdüşüm → ekran',
    'Dönüş formülleri ve Z-up/Y-up dönüşümü README\'de kısaca açıklandı (kaynak: kendi notlarım)',
    'Math3D sınıfları arayüzden bağımsız; istersen bir test projesiyle Adım 2–8 testlerini xUnit\'e taşıdım',
    'Kod temiz: sihirli sayılar (15, 600 gibi) adlandırılmış sabitlere dönüştürüldü',
    'README\'ye Japonca bir özet ekledim: 「外部の3Dライブラリを使わずに、座標変換と透視投影を自作しました。」',
  ],
  extensions: [
    'Matrix4 sınıfını tamamla (RotationX/Y, Inverse) ve Transform\'u matrisle hesapla; sonuçları vektör sürümüyle karşılaştıran testler yaz',
    'Ortografik / perspektif görünüm anahtarı ve Blender gibi ön/yan/üst görünüm kısayolları (Numpad 1/3/7)',
    'Fare tekerleğiyle zoom (focal veya kamera uzaklığı)',
    'Basit bir OBJ dosyası okuyup (v ve f satırları) tel kafes olarak göster',
    'Yüzleri doldurup "painter\'s algorithm" ile arkadan öne sırala; basit Lambert gölgelendirme ekle',
    'Ebeveyn–çocuk (parent–child) hiyerarşisi: ikinci bir küpü birincinin çocuğu yap ve matrisleri çarp',
  ],
  vocab: [
    { en: 'Coordinate', tr: 'Koordinat', ja: '座標', kana: 'ざひょう', romaji: 'zahyō' },
    { en: 'Coordinate system', tr: 'Koordinat sistemi', ja: '座標系', kana: 'ざひょうけい', romaji: 'zahyōkei' },
    { en: 'Vector', tr: 'Vektör', ja: 'ベクトル', kana: 'ベクトル', romaji: 'bekutoru' },
    { en: 'Matrix', tr: 'Matris', ja: '行列', kana: 'ぎょうれつ', romaji: 'gyōretsu' },
    { en: 'Rotation', tr: 'Döndürme', ja: '回転', kana: 'かいてん', romaji: 'kaiten' },
    { en: 'Translation (move)', tr: 'Taşıma', ja: '移動', kana: 'いどう', romaji: 'idō' },
    { en: 'Scaling', tr: 'Ölçekleme', ja: '拡大縮小', kana: 'かくだいしゅくしょう', romaji: 'kakudai shukushō' },
    { en: 'Projection', tr: 'İzdüşüm', ja: '投影', kana: 'とうえい', romaji: 'tōei' },
    { en: 'Perspective', tr: 'Perspektif', ja: '透視投影', kana: 'とうしとうえい', romaji: 'tōshi tōei' },
    { en: 'Vertex', tr: 'Köşe (vertex)', ja: '頂点', kana: 'ちょうてん', romaji: 'chōten' },
    { en: 'Axis', tr: 'Eksen', ja: '軸', kana: 'じく', romaji: 'jiku' },
    { en: 'World coordinates', tr: 'Dünya koordinatları', ja: 'ワールド座標', kana: 'ワールドざひょう', romaji: 'wārudo zahyō' },
  ],
};
