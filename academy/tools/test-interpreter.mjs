#!/usr/bin/env node
// C# yorumlayıcısı için regresyon testleri.  Kullanım: node academy/tools/test-interpreter.mjs
import { runCSharp } from '../js/csharp/index.js';

const cases = [
  // [ad, kod, beklenen çıktı | { error: 'CSxxxx' | 'ExceptionName' }, stdin]
  ['klasik Main', 'using System; class Program { static void Main() { Console.WriteLine("Merhaba"); } }', 'Merhaba'],
  ['tam sayı bölmesi', 'Console.WriteLine(7 / 2); Console.WriteLine(7 / 2.0); Console.WriteLine(7 % 3);', '3\n3.5\n1'],
  ['kayan nokta', 'Console.WriteLine(0.1 + 0.2);', '0.30000000000000004'],
  ['banker yuvarlaması', 'Console.WriteLine(Math.Round(2.5) + " " + Math.Round(3.5) + " " + Math.Round(2.5, MidpointRounding.AwayFromZero));', '2 4 3'],
  ['biçimlendirme', 'Console.WriteLine($"{3.14159:F2} {1234567.891:N2} {0.256:P1} {42:D5}");', '3.14 1,234,567.89 25.6 % 00042'],
  ['string metotları', 'string s = "SM_Chair_LOD0"; Console.WriteLine(s.ToUpper() + s.Length + s[0] + s.Substring(3, 5) + s.Contains("LOD"));', 'SM_CHAIR_LOD013SChairTrue'],
  ['char aritmetiği', "char c = 'A'; c++; Console.WriteLine(c); Console.WriteLine('A' + 1); Console.WriteLine(\"A\" + 1);", 'B\n66\nA1'],
  ['döngüler', 'int t = 0; for (int i = 1; i <= 10; i++) { if (i % 2 == 0) continue; t += i; } Console.WriteLine(t);', '25'],
  ['yerel fonksiyon', 'int Kare(int n) => n * n; Console.WriteLine(Kare(7));', '49'],
  ['out / TryParse', 'bool ok = int.TryParse("42", out int v); Console.WriteLine($"{ok} {v}"); Console.WriteLine(int.TryParse("x", out int w));', 'True 42\nFalse'],
  ['stdin', 'string ad = Console.ReadLine(); int y = int.Parse(Console.ReadLine()); Console.WriteLine($"{ad} {y + 1}");', 'Ayşe 30', 'Ayşe\n29'],
  ['List + LINQ', 'var l = new List<int> { 3, 1, 2 }; l.Add(10); Console.WriteLine(string.Join(",", l.Where(x => x > 1).OrderBy(x => x))); Console.WriteLine(l.Sum());', '2,3,10\n16'],
  ['Dictionary', 'var d = new Dictionary<string, int>(); d["a"] = 1; d["b"] = 2; foreach (var kv in d) Console.Write($"{kv.Key}{kv.Value} ");', 'a1 b2'],
  ['try/catch', 'try { int.Parse("abc"); } catch (FormatException ex) { Console.WriteLine(ex.Message); } finally { Console.WriteLine("son"); }', "The input string 'abc' was not in a correct format.\nson"],
  ['sınıf + kalıtım', 'abstract class S { public abstract double A(); } class R : S { double w, h; public R(double w, double h) { this.w = w; this.h = h; } public override double A() => w * h; } S s = new R(2, 3); Console.WriteLine(s.A());', '6'],
  ['record eşitliği', 'record P(double X, double Y); Console.WriteLine(new P(1, 2) == new P(1, 2));', 'True'],
  ['enum + switch', 'enum T { A, B } T t = T.B; switch (t) { case T.A: Console.WriteLine("a"); break; case T.B: Console.WriteLine("b"); break; }', 'b'],
  ['2B dizi', 'int[,] g = new int[2, 3]; g[1, 2] = 7; Console.WriteLine(g[1, 2] + g.GetLength(1));', '10'],
  ['new string', "Console.WriteLine(new string('=', 3));", '==='],
  ['Argument exception mesajı', 'Console.WriteLine(new ArgumentException("bad", "kalinlik").Message);', "bad (Parameter 'kalinlik')"],
  // derleme hataları
  ['CS1002', 'Console.WriteLine("a")\nConsole.WriteLine("b");', { error: 'CS1002' }],
  ['CS0103', 'console.WriteLine("a");', { error: 'CS0103' }],
  ['CS0117', 'Console.Writeline("a");', { error: 'CS0117' }],
  ['CS0266', 'int x = 5.5;', { error: 'CS0266' }],
  ['CS0029', 'string s = 5;', { error: 'CS0029' }],
  ['CS0165', 'int x; Console.WriteLine(x);', { error: 'CS0165' }],
  ['CS0029 if', 'int x = 5; if (x = 5) { }', { error: 'CS0029' }],
  ['CS0201', 'int x = 1; x + 1;', { error: 'CS0201' }],
  ['CS0120', 'class Program { void Hi() {} static void Main() { Hi(); } }', { error: 'CS0120' }],
  ['CS0122', 'class A { private int x; } var a = new A(); Console.WriteLine(a.x);', { error: 'CS0122' }],
  ['CS1501', 'int K(int n) => n; Console.WriteLine(K(1, 2));', { error: 'CS1501' }],
  ['CS7036', 'int Add(int a, int b) => a + b; Console.WriteLine(Add(1));', { error: 'CS7036' }],
  ['CS0161', 'int B(int n) { if (n > 0) return 1; } Console.WriteLine(B(-1));', { error: 'CS0161' }],
  ['CS0029 void', 'void Hi() {} int r = Hi();', { error: 'CS0029' }],
  // çalışma zamanı hataları ve sınırlar
  ['DivideByZero', 'int a = 1, b = 0; Console.WriteLine(a / b);', { error: 'DivideByZeroException' }],
  ['IndexOutOfRange', 'int[] a = new int[3]; a[3] = 1;', { error: 'IndexOutOfRangeException' }],
  ['NullReference', 'string s = null; Console.WriteLine(s.Length);', { error: 'NullReferenceException' }],
  ['sonsuz döngü', 'while (true) { }', { error: 'TIMEOUT' }],
  ['sonsuz özyineleme', 'int F(int n) { return F(n + 1); } F(1);', { error: 'STACK' }],
];

let fail = 0;
for (const [name, code, expect, stdin] of cases) {
  const r = runCSharp(code, { stdin: stdin ?? '' });
  let ok;
  if (typeof expect === 'string') ok = !r.error && r.stdout.replace(/\s+$/, '') === expect;
  else ok = r.error && r.error.code === expect.error;
  if (!ok) { fail++; console.log(`✗ ${name}\n   beklenen: ${JSON.stringify(expect)}\n   gerçek:   ${JSON.stringify(r.error ? r.error : r.stdout)}`); }
}
console.log(`${fail ? '✗' : '✓'} ${cases.length - fail}/${cases.length} test geçti`);
process.exit(fail ? 1 : 0);
