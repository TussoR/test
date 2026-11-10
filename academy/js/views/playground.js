// Kod Alanı: serbest C# denemeleri, örnek şablonlar, girdi, bellek ve adım adım yürütme.

import { h, mount, icon, toast } from '../core/dom.js';
import { state, save } from '../core/store.js';
import { createEditor } from '../components/editor.js';
import { createRunner } from '../components/runner.js';
import { setCtx } from '../core/context.js';
import { setCrumbs } from '../main.js';

const SAMPLES = [
  ['Merhaba Dünya', `Console.WriteLine("Merhaba, Dünya!");`],
  ['Değişkenler ve tipler', `int vertexSayisi = 8;
double kenar = 2.5;
string ad = "Cube";
bool gorunur = true;

Console.WriteLine($"{ad}: {vertexSayisi} vertex, kenar {kenar} m, görünür: {gorunur}");
Console.WriteLine($"Hacim: {kenar * kenar * kenar:F2} m³");`],
  ['Girdi okuma (stdin)', `// "Girdi (stdin)" sekmesine bir isim ve yaş yaz, sonra çalıştır.
Console.Write("Adın: ");
string ad = Console.ReadLine();
Console.Write("Yaşın: ");
if (int.TryParse(Console.ReadLine(), out int yas))
    Console.WriteLine($"\\nMerhaba {ad}! 10 yıl sonra {yas + 10} yaşında olacaksın.");
else
    Console.WriteLine("\\nYaş bir sayı olmalı.");`],
  ['Döngü: vertex ızgarası', `// 3x3'lük bir vertex ızgarası (Blender'da Grid primitive gibi)
for (int y = 0; y < 3; y++)
{
    for (int x = 0; x < 3; x++)
    {
        Console.Write($"({x},{y}) ");
    }
    Console.WriteLine();
}`],
  ['Fonksiyonlar: poligon bütçesi', `int UcgenSayisi(int quad) => quad * 2;

string Siniflandir(int tris)
{
    if (tris <= 5000) return "Mobil uygun";
    if (tris <= 50000) return "Konsol uygun";
    return "Çok ağır!";
}

int[] quadlar = { 1200, 30000, 80000 };
foreach (int q in quadlar)
{
    int t = UcgenSayisi(q);
    Console.WriteLine($"{q} quad = {t} üçgen → {Siniflandir(t)}");
}`],
  ['Sınıflar: 3D vektör', `var a = new Vec3(1, 2, 3);
var b = new Vec3(4, 0, -1);
Console.WriteLine($"a + b = {a.Add(b)}");
Console.WriteLine($"a · b = {a.Dot(b)}");
Console.WriteLine($"|a| = {a.Length():F3}");

class Vec3
{
    public double X { get; }
    public double Y { get; }
    public double Z { get; }
    public Vec3(double x, double y, double z) { X = x; Y = y; Z = z; }
    public Vec3 Add(Vec3 o) => new Vec3(X + o.X, Y + o.Y, Z + o.Z);
    public double Dot(Vec3 o) => X * o.X + Y * o.Y + Z * o.Z;
    public double Length() => Math.Sqrt(Dot(this));
    public override string ToString() => $"({X}, {Y}, {Z})";
}`],
  ['LINQ: sahne analizi', `var objeler = new List<string> { "SM_Chair", "SM_Table", "T_Wood", "SM_Lamp", "M_Metal" };
var meshler = objeler.Where(o => o.StartsWith("SM_")).OrderBy(o => o).ToList();
Console.WriteLine($"{meshler.Count} mesh: {string.Join(", ", meshler)}");`],
  ['Hata yakalama', `string[] girdiler = { "12", "abc", "0" };
foreach (string g in girdiler)
{
    try
    {
        int n = int.Parse(g);
        Console.WriteLine($"100 / {n} = {100 / n}");
    }
    catch (FormatException)
    {
        Console.WriteLine($"'{g}' bir sayı değil.");
    }
    catch (DivideByZeroException)
    {
        Console.WriteLine("Sıfıra bölünemez!");
    }
}`],
];

let stdinTimer = null;

export function playgroundView(root) {
  setCrumbs([['Kod Alanı']]);
  const pg = state.playground;
  const editor = createEditor({ code: pg.code || SAMPLES[0][1], onChange: (c) => { pg.code = c; save(); }, onRun: () => runner.run(), maxHeight: 620 });
  const runner = createRunner({ editor, stdin: pg.stdin ?? '', stepper: true, extraButtons: [] });
  const sel = h('select', { style: { width: 'auto' }, 'aria-label': 'Örnek kod', onchange: () => {
    const s = SAMPLES[+sel.value];
    if (!s) return;
    if (editor.getValue().trim() && !confirm('Editördeki kod örnekle değiştirilsin mi?')) { sel.value = ''; return; }
    editor.setValue(s[1]); pg.code = s[1];
    if (s[0].includes('stdin')) { runner.setStdin('Ayşe\n29'); pg.stdin = 'Ayşe\n29'; }
    save(); sel.value = '';
  } }, h('option', { value: '' }, 'Örnek yükle…'), SAMPLES.map((s, i) => h('option', { value: i }, s[0])));
  setCtx({ getCode: () => editor.getValue(), page: 'playground' });
  // girdi değişikliklerini kaydet
  clearInterval(stdinTimer);
  stdinTimer = setInterval(() => {
    if (!document.body.contains(editor.el)) { clearInterval(stdinTimer); return; }
    if (runner.getStdin() !== pg.stdin) { pg.stdin = runner.getStdin(); save(); }
  }, 2000);

  mount(root, h('div.page.wide',
    h('div.row.between', h('div', h('div.eyebrow', 'Kod Alanı · Playground'), h('h1', { style: { margin: '4px 0' } }, 'Serbestçe C# dene')),
      h('div.row', sel,
        h('button.btn.sm', { onclick: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'review' } })) }, icon('bot'), 'Kodumu incele'),
        h('button.btn.sm', { onclick: () => { const blob = new Blob([editor.getValue()], { type: 'text/plain' }); const a = h('a', { href: URL.createObjectURL(blob), download: 'Program.cs' }); document.body.append(a); a.click(); a.remove(); toast('Program.cs indirildi'); } }, icon('download'), '.cs indir'))),
    h('div.ex-layout', { style: { gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', marginTop: '12px' } },
      h('div.stack', editor.el, h('div.small.muted', 'Ctrl+Enter: çalıştır · Tab: girinti · Ctrl+/: yorum satırı · Esc sonra Tab: editörden çık')),
      h('div.stack', runner.el,
        h('details.card', h('summary', { style: { cursor: 'pointer', fontWeight: '600' } }, 'Bu yorumlayıcı hakkında (sınırlamalar)'),
          h('div.prose.small', { style: { marginTop: '8px' }, html: `<p>Kodun, tarayıcında güvenli şekilde çalışan bir <b>C# alt kümesi yorumlayıcısı</b> ile yürütülür (sunucuya gönderilmez, dosya/ağ erişimi yoktur, sonsuz döngüler otomatik durdurulur). Gerçek C# derleyicisiyle aynı hata kodlarını (CS1002, CS0103…) üretmeye çalışır.</p>
<p><b>Desteklenenler:</b> üst düzey deyimler ve <code>Main</code>, temel tipler, string işlemleri ve biçimlendirme, if/switch, tüm döngüler, fonksiyonlar (out/ref/params), diziler (2B dahil), List/Dictionary/HashSet/Stack/Queue, LINQ yöntemleri, lambdalar, sınıflar, kalıtım, interface, enum, record, exception'lar, sanal dosya işlemleri.</p>
<p><b>Desteklenmeyenler:</b> WinForms/WPF, async/await, tuple, switch ifadeleri, LINQ sorgu sözdizimi, operatör aşırı yükleme, generic sınıf tanımlama, gerçek dosya sistemi ve ağ. Bunlar için Visual Studio Community + .NET SDK kullan (yol haritasının 1. haftasında kurulum var).</p>
<p class="muted">Not: Derleme türü hataları, gerçek derleyiciden farklı olarak kod o satıra ulaştığında tespit edilir; çalışmayan bir daldaki tür hatası gözden kaçabilir.</p>` })),
      ),
    ),
  ));
}
