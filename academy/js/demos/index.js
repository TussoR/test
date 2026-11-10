// Proje önizlemeleri (tarayıcıda çalışan etkileşimli modeller).
import { mountCad2d } from './cad2d.js';
import { mountView3d } from './view3d.js';

export const DEMO_INFO = {
  draw2d: { title: '2D çizim uygulaması', desc: 'Çizgi, dikdörtgen ve daire çiz; Seç aracıyla tıklayarak seç (Shift: çoklu), Delete ile sil. Bu davranışı WinForms\'da Shape sınıfları, Paint olayı ve isabet testiyle kendin kuracaksın.' },
  transform3d: { title: '3D koordinat görselleştirici', desc: 'Kaydırıcılarla küpün konum, dönüş ve ölçeğini değiştir; yerel eksenlerin nesneyle döndüğünü, dünya eksenlerinin sabit kaldığını gözlemle. Z-yukarı (Blender) ve Y-yukarı (Maya/Unity) arasında geçiş yap.' },
  geometry3d: { title: '3D geometri aracı', desc: 'Kutu, küre ve silindir ekle; boyut, hacim, yüzey alanı ve dünya uzayındaki sınırlayıcı kutuyu (AABB) gör. İkinci bir nesne seçerek merkezler arası mesafeyi ve AABB kesişimini kontrol et.' },
  minicad: { title: 'Mini CAD', desc: 'Katmanlar, ızgara/uç nokta yakalama, taşıma, döndürme, ölçme ve geri al/yinele (komut deseni). Durum çubuğunda mm cinsinden koordinatlar ve seçili nesnenin ölçüleri görünür. Kısayollar: Del, Ctrl+Z, Ctrl+Y, Esc.' },
};

export function mountDemo(key, container) {
  if (!container) return;
  if (key === 'draw2d') return mountCad2d(container, { mini: false });
  if (key === 'minicad') return mountCad2d(container, { mini: true });
  if (key === 'transform3d') return mountView3d(container, { geometry: false });
  if (key === 'geometry3d') return mountView3d(container, { geometry: true });
}
