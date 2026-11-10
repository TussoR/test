// Alıştırma denetleyicisi: öğrencinin kodunu çalıştırır, kontrolleri uygular
// ve yanlışlarda çözümü vermeden "neden yanlış" açıklaması üretir.

import { runCSharp } from '../csharp/index.js';
import { explainError } from '../csharp/diagnostics.js';

const HARNESS_MARK = '§§HARNESS§§';

/** Yorumları ve metin sabitlerini temizler (kod kalıbı kontrolleri için). */
export function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

export function normalizeOutput(s) {
  return (s ?? '').replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function show(s) { return s === '' ? '(boş satır)' : `"${esc(s)}"`; }

/** Beklenen ve gerçek çıktı arasındaki farkı insan diliyle açıklar. */
export function explainDiff(expected, actual) {
  const E = normalizeOutput(expected).split('\n');
  const A = normalizeOutput(actual).split('\n');
  if (normalizeOutput(actual) === '') return 'Programın hiçbir şey yazdırmadı. <code>Console.WriteLine(...)</code> ile çıktı üretmeyi unutmuş olabilir misin?';
  for (let i = 0; i < Math.max(E.length, A.length); i++) {
    const e = E[i], a = A[i];
    if (e === a) continue;
    const n = i + 1;
    if (e === undefined) return `Beklenenden fazla satır yazdırdın. ${n}. satırda fazladan ${show(a)} var.`;
    if (a === undefined) return `Çıktın eksik: ${n}. satırda ${show(e)} bekleniyordu ama programın orada bitti.`;
    if (e.toLowerCase() === a.toLowerCase()) return `${n}. satırda <b>büyük/küçük harf</b> farkı var. Beklenen: ${show(e)}, senin: ${show(a)}. Bilgisayar "A" ile "a"yı farklı karakter olarak görür.`;
    if (e.replace(/\s+/g, '') === a.replace(/\s+/g, '')) return `${n}. satırda <b>boşluk</b> farkı var. Beklenen: ${show(e)}, senin: ${show(a)}. Metin içindeki boşlukları ve + ile birleştirirken araya koyduğun boşlukları kontrol et.`;
    const trMap = s => s.replace(/[ıİ]/g, 'i').replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c');
    if (trMap(e).toLowerCase() === trMap(a).toLowerCase()) return `${n}. satırda <b>Türkçe karakter</b> farkı var (ı/i, ş/s, ü/u…). Beklenen: ${show(e)}, senin: ${show(a)}.`;
    if (e.replace(/[.,!?:;]/g, '') === a.replace(/[.,!?:;]/g, '')) return `${n}. satırda <b>noktalama</b> farkı var. Beklenen: ${show(e)}, senin: ${show(a)}.`;
    const ne = e.match(/-?\d+(\.\d+)?/g), na = a.match(/-?\d+(\.\d+)?/g);
    if (ne && na && e.replace(/-?\d+(\.\d+)?/g, '#') === a.replace(/-?\d+(\.\d+)?/g, '#')) {
      const k = ne.findIndex((x, j) => x !== na[j]);
      return `${n}. satırda metin doğru ama <b>sayı farklı</b>: ${esc(ne[k])} bekleniyordu, senin programın ${esc(na[k])} üretti. Hesaplamayı ya da işlem sırasını kontrol et.`;
    }
    if (A.length !== E.length && A.slice(i).includes(e)) return `${n}. satırda fazladan bir satır var gibi görünüyor: ${show(a)}. Beklenen ${show(e)} daha sonra geliyor.`;
    return `${n}. satırda fark var. Beklenen: ${show(e)}, senin: ${show(a)}.`;
  }
  return 'Çıktılar eşit görünüyor.';
}

function matchOutput(actual, expect, mode = 'exact') {
  const a = normalizeOutput(actual);
  if (mode === 'contains') return a.includes(normalizeOutput(expect));
  if (mode === 'regex') return new RegExp(expect, 'm').test(a);
  if (mode === 'lines') {
    const lines = a.split('\n');
    let pos = 0;
    for (const ex of normalizeOutput(expect).split('\n')) {
      const k = lines.indexOf(ex, pos);
      if (k < 0) return false;
      pos = k + 1;
    }
    return true;
  }
  if (mode === 'ci') return a.toLowerCase() === normalizeOutput(expect).toLowerCase();
  return a === normalizeOutput(expect);
}

/**
 * @param {string} code  Öğrencinin kodu
 * @param {object} ex    Alıştırma tanımı (checks, stdin...)
 * @returns {{passed:boolean, results:Array, run:object, feedback:object|null}}
 */
export function checkExercise(code, ex, opts = {}) {
  const results = [];
  const baseRun = runCSharp(code, { stdin: ex.stdin ?? '', files: opts.files });
  if (baseRun.error) {
    const info = explainError(baseRun.error);
    return {
      passed: false, run: baseRun, results: [{ ok: false, msg: 'Kod hatasız çalışmalı' }],
      feedback: { kind: 'error', title: info.title, why: info.why, fix: info.fix, error: baseRun.error },
    };
  }
  const clean = stripComments(code);
  let firstFail = null;
  for (const c of ex.checks || []) {
    let ok = true, detail = null;
    if (c.type === 'output') {
      const run = c.stdin !== undefined && c.stdin !== (ex.stdin ?? '') ? runCSharp(code, { stdin: c.stdin }) : baseRun;
      if (run.error) { ok = false; detail = { kind: 'error', error: run.error, ...explainError(run.error) }; }
      else if (!matchOutput(run.stdout, c.expect, c.mode)) {
        ok = false;
        detail = { kind: 'output', expected: c.expect, actual: run.stdout, stdin: c.stdin, diff: c.mode === 'exact' || !c.mode ? explainDiff(c.expect, run.stdout) : null };
      }
    } else if (c.type === 'code') {
      ok = new RegExp(c.pattern, c.flags ?? '').test(clean);
      if (!ok) detail = { kind: 'code' };
    } else if (c.type === 'notCode') {
      ok = !new RegExp(c.pattern, c.flags ?? '').test(clean);
      if (!ok) detail = { kind: 'code' };
    } else if (c.type === 'harness') {
      const full = `${code}\nConsole.WriteLine("${HARNESS_MARK}");\n${c.append}`;
      const run = runCSharp(full, { stdin: c.stdin ?? ex.stdin ?? '' });
      if (run.error) {
        ok = false;
        detail = { kind: 'error', error: run.error, ...explainError(run.error) };
        if (run.error.kind === 'compile' && run.error.line > code.split('\n').length) {
          detail.why = 'Test kodu senin fonksiyonunu çağıramadı. Fonksiyonun adını, parametrelerini ve dönüş türünü görevdeki gibi yazdığından emin ol.';
        }
      } else {
        const idx = run.stdout.indexOf(HARNESS_MARK + '\n');
        const out = idx >= 0 ? run.stdout.slice(idx + HARNESS_MARK.length + 1) : '';
        if (!matchOutput(out, c.expect, c.mode)) {
          ok = false;
          detail = { kind: 'output', expected: c.expect, actual: out, harness: c.append, diff: explainDiff(c.expect, out) };
        }
      }
    }
    results.push({ ok, msg: c.msg || defaultMsg(c), detail });
    if (!ok && !firstFail) firstFail = { check: c, detail, msg: c.msg || defaultMsg(c) };
  }
  const passed = results.every(r => r.ok);
  let feedback = null;
  if (!passed && firstFail) {
    const d = firstFail.detail || {};
    if (d.kind === 'error') feedback = { kind: 'error', title: d.title, why: d.why, fix: d.fix, error: d.error };
    else if (d.kind === 'output') feedback = { kind: 'output', title: 'Çıktı beklenenden farklı', why: d.diff || firstFail.msg, expected: d.expected, actual: d.actual, stdin: d.stdin, harness: d.harness, msg: firstFail.msg };
    else feedback = { kind: 'code', title: 'Görevin bir gereği eksik', why: firstFail.msg };
  }
  return { passed, results, run: baseRun, feedback };
}

function defaultMsg(c) {
  if (c.type === 'output') return 'Çıktı beklenenle aynı olmalı';
  if (c.type === 'harness') return 'Fonksiyon test girdileriyle doğru sonucu vermeli';
  if (c.type === 'code') return 'Kod gerekli yapıyı içermeli';
  return 'Kod istenmeyen bir yapı içermemeli';
}
