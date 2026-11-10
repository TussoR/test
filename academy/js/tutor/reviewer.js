// Kural tabanlı kod inceleyici (çevrimdışı "code review").
// Yeni başlayan seviyesine uygun, satır numaralı ve "neden" açıklamalı bulgular üretir.

import { runCSharp } from '../csharp/index.js';
import { explainError } from '../csharp/diagnostics.js';
import { stripComments } from '../core/checker.js';

const KNOWN = ['Console', 'WriteLine', 'Write', 'ReadLine', 'Math', 'Sqrt', 'Pow', 'Abs', 'Round', 'Floor', 'Ceiling', 'Max', 'Min', 'PI',
  'Parse', 'TryParse', 'ToString', 'Length', 'Count', 'Add', 'Remove', 'Contains', 'ToUpper', 'ToLower', 'Substring', 'Replace', 'Split', 'Trim',
  'List', 'Dictionary', 'string', 'int', 'double', 'bool', 'char', 'var', 'Convert', 'ToInt32', 'ToDouble', 'Exception', 'FormatException',
  'IndexOf', 'StartsWith', 'EndsWith', 'Join', 'Format', 'IsNullOrEmpty', 'Message', 'Where', 'Select', 'Sum', 'Average', 'OrderBy', 'ToList', 'ToArray'];

function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

/** "Bunu mu demek istedin?" önerisi. */
export function didYouMean(name, code) {
  if (!name) return null;
  const ids = new Set([...KNOWN, ...((code || '').match(/[A-Za-z_][\w]*/g) || [])]);
  ids.delete(name);
  let best = null, bestD = 99;
  for (const c of ids) {
    if (c.toLowerCase() === name.toLowerCase()) return c;
    const d = lev(name, c);
    if (d < bestD && d <= Math.max(1, Math.floor(name.length / 4))) { best = c; bestD = d; }
  }
  return best;
}

export function errorNameFromMessage(msg) {
  return /'([^']+)'(?: does not| is inaccessible)/.exec(msg)?.[1] || /definition for '([^']+)'/.exec(msg)?.[1] || null;
}

/**
 * @returns {{findings: Array<{sev:'error'|'warn'|'info'|'good', line?:number, msg:string}>, run}}
 */
export function reviewCode(code, opts = {}) {
  const findings = [];
  const run = runCSharp(code, { stdin: opts.stdin ?? '' });
  const lines = code.split('\n');
  const clean = stripComments(code);
  const cleanLines = clean.split('\n');

  if (run.error) {
    const info = explainError(run.error);
    let msg = `<b>${info.title}</b> (${run.error.code}): ${info.why}`;
    const nm = errorNameFromMessage(run.error.message);
    const dym = ['CS0103', 'CS0117', 'CS1061'].includes(run.error.code) ? didYouMean(nm, code) : null;
    if (dym) msg += ` <br>Bunu mu demek istedin: <code>${dym}</code>?`;
    findings.push({ sev: 'error', line: run.error.line, msg });
  }
  if (!clean.trim()) return { findings: [{ sev: 'info', msg: 'Henüz kod yazılmamış.' }], run };

  // isimlendirme
  const declRe = /\b(int|double|string|bool|char|float|decimal|long|var)\s+([A-Za-z_]\w*)\s*(=|;|,)/g;
  const declared = [];
  cleanLines.forEach((ln, i) => {
    let m;
    declRe.lastIndex = 0;
    while ((m = declRe.exec(ln))) {
      const name = m[2];
      declared.push({ name, line: i + 1 });
      if (/^[A-Z]/.test(name) && !/^[A-Z0-9_]+$/.test(name)) findings.push({ sev: 'info', line: i + 1, msg: `Yerel değişken <code>${name}</code> büyük harfle başlıyor. C#\'ta yerel değişkenler <b>camelCase</b> yazılır: <code>${name[0].toLowerCase() + name.slice(1)}</code>.` });
      if (name.length === 1 && !'ijknxyzabtv'.includes(name)) findings.push({ sev: 'info', line: i + 1, msg: `<code>${name}</code> çok kısa bir isim. Ne tuttuğunu anlatan bir isim (ör. <code>toplam</code>, <code>yaricap</code>) kodu okunur yapar.` });
    }
    const mm = /\b(?:static\s+)?(?:void|int|double|string|bool)\s+([a-z]\w*)\s*\([^)]*\)\s*(\{|=>|$)/.exec(ln);
    if (mm && !/\b(if|while|for|return|new)\b/.test(ln.split(mm[1])[0])) findings.push({ sev: 'info', line: i + 1, msg: `Metot adı <code>${mm[1]}</code> küçük harfle başlıyor. C#\'ta metotlar <b>PascalCase</b> yazılır: <code>${mm[1][0].toUpperCase() + mm[1].slice(1)}</code>.` });
  });

  // kullanılmayan değişkenler
  for (const d of declared) {
    const count = (clean.match(new RegExp(`\\b${d.name}\\b`, 'g')) || []).length;
    if (count === 1) findings.push({ sev: 'warn', line: d.line, msg: `<code>${d.name}</code> tanımlanmış ama hiç kullanılmamış. Gereksizse sil; gerekliyse kullanmayı unutmuş olabilirsin.` });
  }

  cleanLines.forEach((ln, i) => {
    const n = i + 1;
    if (/\bif\s*\([^=!<>]*[^=!<>]=[^=][^)]*\)/.test(ln)) findings.push({ sev: 'error', line: n, msg: 'if içinde <code>=</code> (atama) kullanılmış. Karşılaştırma için <code>==</code> kullan.' });
    if (/==\s*true\b|==\s*false\b/.test(ln)) findings.push({ sev: 'info', line: n, msg: '<code>== true</code> gereksiz: <code>if (gorunur)</code> yeterli; <code>== false</code> yerine <code>!gorunur</code> yaz.' });
    if (/\bcatch\s*(\([^)]*\))?\s*\{\s*\}/.test(ln) || (/\bcatch\b/.test(ln) && /^\s*\{\s*$/.test(cleanLines[i + 1] || '') && /^\s*\}\s*$/.test(cleanLines[i + 2] || ''))) findings.push({ sev: 'warn', line: n, msg: 'Boş <code>catch</code> bloğu hatayı sessizce yutar; sorun olduğunda hiçbir şey fark etmezsin. En azından bir mesaj yazdır veya hatayı ele al.' });
    if (/catch\s*\(\s*Exception\b/.test(ln)) findings.push({ sev: 'info', line: n, msg: '<code>catch (Exception)</code> her hatayı yakalar. Mümkünse beklediğin özel türü yakala (ör. <code>FormatException</code>) — beklenmedik hataları gizlemezsin.' });
    if (/int\.Parse\s*\(\s*Console\.ReadLine\(\)\s*\)/.test(ln)) findings.push({ sev: 'info', line: n, msg: 'Kullanıcı sayı yerine harf girerse <code>int.Parse</code> FormatException fırlatır. <code>int.TryParse</code> ile girdiyi doğrulamayı düşün.' });
    if (/\b\d+\.\d+\s*==|==\s*\d+\.\d+\b/.test(ln)) findings.push({ sev: 'warn', line: n, msg: 'Ondalıklı sayılar <code>==</code> ile karşılaştırılmamalı (kayan nokta hassasiyeti). <code>Math.Abs(a - b) &lt; 1e-9</code> gibi bir tolerans kullan — CAD\'de bu kritik.' });
    if (/^\s*(if|for|while|foreach)\b.*\)\s*$/.test(ln) && !/^\s*\{/.test(cleanLines[i + 1] || '') && /^\s*\S/.test(cleanLines[i + 2] || '') && (cleanLines[i + 2] || '').search(/\S/) === (cleanLines[i + 1] || '').search(/\S/) && !/^\s*[{}]/.test(cleanLines[i + 2] || '') && !/^\s*else/.test(cleanLines[i + 2] || '')) {
      findings.push({ sev: 'warn', line: n, msg: 'Süslü parantezsiz bir blok var ve altındaki iki satır aynı girintide. Sadece ilk satır koşula/döngüye aittir! Gövdeyi <code>{ }</code> içine almak bu hatayı önler.' });
    }
    if ((ln.match(/\s{4}/g) || []).length >= 4 && /^\s{16,}\S/.test(lines[i] || '')) findings.push({ sev: 'info', line: n, msg: 'Kod çok derin iç içe geçmiş (4+ seviye). Bir kısmını ayrı bir fonksiyona taşımak veya erken <code>return</code>/<code>continue</code> kullanmak okunabilirliği artırır.' });
  });

  // sihirli sayılar
  const nums = {};
  cleanLines.forEach((ln, i) => {
    if (/\bconst\b/.test(ln)) return;
    for (const m of ln.replace(/"(?:[^"\\]|\\.)*"/g, '""').matchAll(/(?<![\w.])(\d+(?:\.\d+)?)(?![\w.])/g)) {
      const v = m[1];
      if (['0', '1', '2', '10', '100', '0.5', '1.0', '3', '4'].includes(v)) continue;
      (nums[v] ||= []).push(i + 1);
    }
  });
  for (const [v, ls] of Object.entries(nums)) if (ls.length >= 2) findings.push({ sev: 'info', line: ls[0], msg: `<code>${v}</code> sayısı ${ls.length} yerde tekrar ediyor (satır ${ls.join(', ')}). Ona bir isim ver: <code>const int Butce = ${v};</code> — değiştirmek gerektiğinde tek yerden değiştirirsin.` });

  // döngüde string birleştirme
  if (/(for|while|foreach)[\s\S]*\{[\s\S]*\w+\s*\+=\s*("|\$")/.test(clean)) findings.push({ sev: 'info', msg: 'Döngü içinde string\'e <code>+=</code> ile ekleme yapılıyor. Küçük programlarda sorun değil, ama binlerce tekrarda <code>StringBuilder</code> çok daha hızlıdır.' });

  // uzun kod
  if (lines.length > 60 && !/\b(void|int|double|string|bool)\s+[A-Z]\w*\s*\(/.test(clean)) findings.push({ sev: 'info', msg: 'Kod uzun ama hiç fonksiyon yok. Tekrarlanan veya mantıksal olarak ayrı parçaları fonksiyonlara bölmek kodu okunur ve test edilebilir yapar.' });

  // olumlu geri bildirim
  const good = [];
  if (!run.error) good.push('kod hatasız çalışıyor');
  if (/\b(void|int|double|string|bool)\s+[A-Z]\w*\s*\(/.test(clean)) good.push('işi fonksiyonlara bölmüşsün');
  if (/TryParse/.test(clean)) good.push('kullanıcı girdisini TryParse ile doğruluyorsun');
  if (/\bconst\b/.test(clean)) good.push('sabitlere isim vermişsin');
  if (declared.length && declared.every(d => d.name.length > 2)) good.push('değişken isimlerin açıklayıcı');
  if (good.length) findings.push({ sev: 'good', msg: 'İyi: ' + good.join(', ') + '.' });

  // tekrarları temizle
  const seen = new Set();
  return { findings: findings.filter(f => { const k = f.sev + f.line + f.msg; if (seen.has(k)) return false; seen.add(k); return true; }), run };
}
