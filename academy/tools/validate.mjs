#!/usr/bin/env node
// İçerik doğrulayıcı: her dersin çözümlerinin gerçekten geçtiğini, başlangıç kodlarının
// geçmediğini, örnek kodların çalıştığını ve "tahmin et" cevaplarının doğru olduğunu denetler.
//
// Kullanım:  node academy/tools/validate.mjs                 (tüm dersler ve projeler)
//            node academy/tools/validate.mjs js/content/m1/l02.js ...

import { readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkExercise, normalizeOutput } from '../js/core/checker.js';
import { runCSharp, formatError } from '../js/csharp/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let files = process.argv.slice(2).map(f => resolve(process.cwd(), f));
if (!files.length) {
  const contentDir = join(root, 'js/content');
  for (const d of readdirSync(contentDir)) {
    const p = join(contentDir, d);
    if (/^m\d$/.test(d) || d === 'projects') {
      for (const f of readdirSync(p)) if (f.endsWith('.js')) files.push(join(p, f));
    }
  }
}

let errors = 0, warnings = 0;
const err = (f, m) => { errors++; console.log(`  ✗ ${m}`); };
const warn = (f, m) => { warnings++; console.log(`  ⚠ ${m}`); };

function checkEx(file, label, ex, { starterMustFail = true } = {}) {
  if (!ex) return;
  for (const k of ['prompt', 'checks', 'hints', 'solution']) if (!ex[k]) err(file, `${label}: '${k}' eksik`);
  if (!ex.checks?.length) return;
  if ((ex.hints || []).length < 2) warn(file, `${label}: en az 2 ipucu önerilir`);
  for (const c of ex.checks) {
    if (c.type === 'code' || c.type === 'notCode') { try { new RegExp(c.pattern, c.flags); } catch (e) { err(file, `${label}: geçersiz regex ${c.pattern}`); } }
  }
  const r = checkExercise(ex.solution, ex);
  if (!r.passed) {
    err(file, `${label}: ÇÖZÜM GEÇMİYOR → ${r.feedback?.title}: ${(r.feedback?.why || '').replace(/<[^>]+>/g, '')}`);
    if (r.feedback?.error) console.log('     ', formatError(r.feedback.error));
    if (r.feedback?.actual !== undefined) console.log('      beklenen:', JSON.stringify(r.feedback.expected), '\n      gerçek:  ', JSON.stringify(r.feedback.actual));
  }
  if (starterMustFail && ex.starter !== undefined) {
    const s = checkExercise(ex.starter, ex);
    if (s.passed) err(file, `${label}: başlangıç kodu (starter) zaten geçiyor — görev anlamsız`);
  }
}

for (const file of files) {
  const rel = file.replace(root + '/', '');
  console.log(`• ${rel}`);
  let mod;
  try { mod = (await import(pathToFileURL(file).href)).default; } catch (e) { err(rel, `içe aktarılamadı: ${e.message}`); continue; }
  if (!mod) { err(rel, 'default export yok'); continue; }

  if (mod.kind === 'project') {
    for (const k of ['id', 'title', 'steps']) if (!mod[k]) err(rel, `'${k}' eksik`);
    (mod.steps || []).forEach((st, i) => {
      if (st.exercise) checkEx(rel, `adım ${i + 1} alıştırması`, st.exercise, { starterMustFail: st.exercise.starterMustFail !== false });
      if (st.code && st.runnable) {
        const r = runCSharp(st.code, { stdin: st.stdin ?? '' });
        if (r.error && !st.expectError) err(rel, `adım ${i + 1} kodu hata veriyor: ${formatError(r.error)}`);
      }
    });
    continue;
  }

  for (const k of ['id', 'module', 'title', 'titleEn', 'titleJa', 'objectives', 'steps', 'exercise', 'quiz', 'challenge', 'vocab', 'summary']) {
    if (!mod[k]) err(rel, `'${k}' alanı eksik`);
  }
  const kinds = new Set((mod.steps || []).map(s => s.kind));
  for (const k of ['concept', 'analogy', 'code']) if (!kinds.has(k)) warn(rel, `'${k}' türünde adım yok`);
  if (!kinds.has('visual')) warn(rel, "'visual' adımı yok (görsel açıklama önerilir)");
  if (!kinds.has('cad')) warn(rel, "'cad' adımı yok (3D/CAD bağlantısı önerilir)");

  (mod.steps || []).forEach((st, i) => {
    const label = `adım ${i + 1} (${st.kind}: ${st.title})`;
    if (!st.title) err(rel, `adım ${i + 1}: başlık yok`);
    if (st.kind === 'code') {
      if (!st.code) { err(rel, `${label}: code yok`); return; }
      const r = runCSharp(st.code, { stdin: st.stdin ?? '' });
      if (st.expectError && !r.error) err(rel, `${label}: hata bekleniyordu ama kod çalıştı`);
      if (!st.expectError && r.error) err(rel, `${label}: ${formatError(r.error)}`);
      const lines = st.code.split('\n').length;
      for (const k of Object.keys(st.explain || {})) if (+k < 1 || +k > lines) err(rel, `${label}: explain satır ${k} kod dışında`);
    }
    if (st.kind === 'predict') {
      if (!(st.answer >= 0 && st.answer < (st.options || []).length)) { err(rel, `${label}: geçersiz answer`); return; }
      const r = runCSharp(st.code, { stdin: st.stdin ?? '' });
      if (r.error) err(rel, `${label}: kod hata veriyor: ${formatError(r.error)}`);
      else if (normalizeOutput(r.stdout) !== normalizeOutput(st.options[st.answer])) err(rel, `${label}: doğru seçenek gerçek çıktıyla uyuşmuyor. Gerçek: ${JSON.stringify(r.stdout)}`);
    }
    if (st.kind === 'visual' && !st.svg && !st.html) err(rel, `${label}: svg/html yok`);
  });

  checkEx(rel, 'alıştırma', mod.exercise);
  checkEx(rel, 'meydan okuma', mod.challenge);
  (mod.extras || []).forEach((x, i) => checkEx(rel, `ek alıştırma ${i + 1}`, x));
  if ((mod.extras || []).length < 2) warn(rel, 'en az 2 ek alıştırma (extras) önerilir');

  (mod.quiz || []).forEach((q, i) => {
    const label = `quiz ${i + 1}`;
    const correct = (q.options || []).filter(o => o.correct);
    if (correct.length !== 1) err(rel, `${label}: tam olarak 1 doğru seçenek olmalı (${correct.length})`);
    for (const o of q.options || []) if (!o.why) err(rel, `${label}: her seçeneğin 'why' açıklaması olmalı`);
    if (q.code && q.verifyOutput) {
      const r = runCSharp(q.code);
      if (r.error) err(rel, `${label}: kod hata veriyor: ${formatError(r.error)}`);
      else if (normalizeOutput(r.stdout) !== normalizeOutput(correct[0]?.t ?? '')) err(rel, `${label}: doğru seçenek gerçek çıktıyla uyuşmuyor. Gerçek: ${JSON.stringify(r.stdout)}`);
    }
  });
  if ((mod.quiz || []).length < 4) warn(rel, 'en az 4 quiz sorusu önerilir');
  for (const v of mod.vocab || []) for (const k of ['en', 'tr', 'ja', 'romaji']) if (!v[k]) err(rel, `vocab '${v.en}': '${k}' eksik`);
}

console.log(`\n${errors ? '✗' : '✓'} ${files.length} dosya, ${errors} hata, ${warnings} uyarı`);
process.exit(errors ? 1 : 0);
