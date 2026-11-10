// Eğitmenin (AI tutor) "şu an ne üzerinde çalışıyorum?" bilgisini tuttuğu paylaşılan bağlam.
export const ctx = {
  page: 'dashboard',     // aktif görünüm
  lesson: null,          // yüklü ders içeriği
  lessonMeta: null,
  stepTitle: null,       // aktif adım/kart başlığı
  phase: null,           // learn | exercise | quiz | challenge | summary
  exercise: null,        // aktif alıştırma tanımı
  exerciseState: null,   // { hintsUsed, attempts }
  revealHint: null,      // () => void  (bir sonraki ipucunu açar)
  getCode: null,         // () => string (aktif editördeki kod)
  lastRun: null,         // { code, result }
  lastCheck: null,       // checkExercise sonucu
  openExtra: null,       // (difficulty) => void
};
export function setCtx(patch) { Object.assign(ctx, patch); }
