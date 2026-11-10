// Müfredat dizini. Modül 1 tam etkileşimli; Modül 2–7 taslakları outline.js'den gelir;
// Modül 8 portfolyo projeleridir (projects/).

import OUTLINE from './outline.js';

const M1 = {
  id: 'm1', num: 1,
  title: 'Programlama Temelleri',
  titleEn: 'Programming Fundamentals',
  titleJa: 'プログラミングの基礎',
  icon: 'terminal',
  summary: 'Sıfırdan başlayarak programın ne olduğunu, bilgisayarın kodu nasıl çalıştırdığını ve C# ile değişkenler, koşullar, döngüler, fonksiyonlar, diziler ve hata yönetimini öğren.',
  weeks: '1–5. hafta',
  lessons: [
    { id: 'm1-l01', src: './m1/l01.js', title: 'Programlama nedir? İlk C# programı', titleEn: 'What is programming? First C# program', titleJa: 'プログラミングとは', minutes: 60 },
    { id: 'm1-l02', src: './m1/l02.js', title: 'Değişkenler', titleEn: 'Variables', titleJa: '変数', minutes: 60 },
    { id: 'm1-l03', src: './m1/l03.js', title: 'Veri tipleri', titleEn: 'Data types', titleJa: 'データ型', minutes: 60 },
    { id: 'm1-l04', src: './m1/l04.js', title: 'Metinler (string)', titleEn: 'Strings', titleJa: '文字列', minutes: 60 },
    { id: 'm1-l05', src: './m1/l05.js', title: 'Sayılar ve operatörler', titleEn: 'Numbers & operators', titleJa: '数値と演算子', minutes: 60 },
    { id: 'm1-l06', src: './m1/l06.js', title: 'Boolean ve karşılaştırma', titleEn: 'Booleans & comparison', titleJa: '真偽値と比較', minutes: 50 },
    { id: 'm1-l07', src: './m1/l07.js', title: 'Koşullar: if / else', titleEn: 'Conditions: if / else', titleJa: '条件分岐', minutes: 60 },
    { id: 'm1-l08', src: './m1/l08.js', title: 'Döngüler', titleEn: 'Loops', titleJa: 'ループ', minutes: 70 },
    { id: 'm1-l09', src: './m1/l09.js', title: 'Fonksiyonlar (metotlar)', titleEn: 'Functions (methods)', titleJa: '関数', minutes: 60 },
    { id: 'm1-l10', src: './m1/l10.js', title: 'Parametreler ve dönüş değerleri', titleEn: 'Parameters & return values', titleJa: '引数と戻り値', minutes: 60 },
    { id: 'm1-l11', src: './m1/l11.js', title: 'Diziler ve listeler', titleEn: 'Arrays & lists', titleJa: '配列とリスト', minutes: 70 },
    { id: 'm1-l12', src: './m1/l12.js', title: 'Hata yönetimi', titleEn: 'Error handling', titleJa: 'エラー処理', minutes: 60 },
  ],
  project: { id: 'm1-project', src: './m1/project.js', title: 'Modül projesi: Poligon Bütçesi Denetleyicisi', titleEn: 'Poly Budget Checker' },
};

const M8 = {
  id: 'm8', num: 8,
  title: 'Portfolyo Projeleri',
  titleEn: 'Practical Portfolio Projects',
  titleJa: 'ポートフォリオ制作',
  icon: 'briefcase',
  summary: 'Hesap makinesinden mini CAD uygulamasına uzanan, adım adım zorlaşan beş portfolyo projesi. Her proje önceki modüllerde öğrendiklerini gerçek bir uygulamada birleştirir.',
  weeks: 'Her ay bir proje',
  lessons: [],
  projects: [
    { id: 'p1', src: './projects/p1.js', title: 'Proje 1: Hesap Makinesi', titleEn: 'Calculator', titleJa: '電卓', month: 1 },
    { id: 'p2', src: './projects/p2.js', title: 'Proje 2: 2D Çizim Uygulaması', titleEn: '2D Drawing App', titleJa: '2D作図アプリ', month: 3 },
    { id: 'p3', src: './projects/p3.js', title: 'Proje 3: 3D Koordinat Görselleştirici', titleEn: '3D Coordinate Visualizer', titleJa: '3D座標ビューア', month: 4 },
    { id: 'p4', src: './projects/p4.js', title: 'Proje 4: Basit 3D Geometri Aracı', titleEn: 'Simple 3D Geometry Tool', titleJa: '3D形状ツール', month: 5 },
    { id: 'p5', src: './projects/p5.js', title: 'Proje 5: Mini CAD Uygulaması', titleEn: 'Mini CAD Application', titleJa: 'ミニCAD', month: 6 },
  ],
};

export const MODULES = [M1, ...OUTLINE.filter(m => m.id !== 'm1' && m.id !== 'm8'), M8].sort((a, b) => a.num - b.num);

export function findModule(id) { return MODULES.find(m => m.id === id); }

/** Tüm dersler (sıralı), modül bilgisiyle birlikte. */
export function allLessons() {
  const out = [];
  for (const m of MODULES) for (const l of m.lessons) out.push({ ...l, module: m.id, moduleNum: m.num, interactive: !!l.src });
  return out;
}

export function allProjects() {
  const out = [];
  for (const m of MODULES) {
    if (m.project && m.project.src) out.push({ ...m.project, module: m.id });
    for (const p of m.projects || []) out.push({ ...p, module: m.id });
  }
  return out;
}

export function findLessonMeta(id) { return allLessons().find(l => l.id === id); }
export function findProjectMeta(id) { return allProjects().find(p => p.id === id); }

const cache = new Map();
/** Ders/proje içeriğini (dinamik import ile) yükler. */
export async function loadContent(src) {
  if (!cache.has(src)) cache.set(src, import(new URL(src, import.meta.url).href).then(m => m.default));
  return cache.get(src);
}
