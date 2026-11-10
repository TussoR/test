# Kaihatsu Akademi (開発アカデミー)

Sıfırdan junior yazılım geliştiriciye: **C#, algoritmalar, 2D/3D matematik, yazılım mühendisliği, masaüstü arayüz, CAD/BIM temelleri** ve portfolyo projeleri. 3D sanat (Blender / Maya / ZBrush) geçmişi olan, Japonya'da CAD/BIM yazılımı geliştiren bir şirkette 開発職 hedefleyen bir öğrenci için tasarlandı. Arayüz Türkçe; anahtar kelimeler İngilizce; teknik terimler İngilizce + Japonca ile verilir.

> Bu kurs gerçek temel beceriler ve bir portfolyo kazandırmak içindir; işe kabul garantisi vermez.

## Çalıştırma

Derleme adımı yok — saf HTML/CSS/ES modülleri. Herhangi bir statik sunucu yeterli (ES modülleri `file://` ile çalışmaz):

```bash
cd test            # depo kökü
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000/academy/
```

GitHub Pages ile yayınlanıyorsa `…/academy/` adresinden açılır. İlerleme tarayıcının `localStorage`'ında saklanır (Ayarlar → dışa/içe aktar ile yedeklenir).

## Neler var?

| Bölüm | İçerik |
|---|---|
| **Panel** | Genel ilerleme, mevcut modül, tamamlanan dersler, toplam/bugünkü çalışma süresi, quiz ortalaması, kod alıştırma başarı oranı, seviye (XP), proje tamamlama, günlük seri, son 14 gün grafiği, uyarlanabilir zorluk |
| **Müfredat** | 8 modül. **Modül 1 tamamen etkileşimli (12 ders + modül projesi)**. Modül 2–7: 79 ders taslağı (hedefler, konular, CAD bağlantısı, Japonca kelimeler, modül projesi özeti) |
| **Ders oynatıcı** | Öğren (tek kavramlık kartlar: açıklama, benzetme, SVG görsel, satır satır açıklamalı kod, "tahmin et", sık hatalar, hata avı, 3D/CAD bağlantısı) → **zorunlu alıştırma** → **quiz** → meydan okuma → ek pratik (zorluk 1–3) → özet + Japonca kelimeler. Sıralı kilit: alıştırma + quiz geçilmeden sonraki ders açılmaz |
| **Alıştırmalar** | Kod tarayıcıda çalıştırılıp otomatik kontrol edilir; yanlışta *ne* olduğu ve *neden* yanlış olduğu açıklanır (çıktı farkı analizi, derleyici hatası açıklaması), kademeli ipuçları verilir; örnek çözüm ancak 3 başarısız denemeden sonra açılabilir |
| **Adım adım yürütme** | Kodu satır satır çalıştırıp her adımda bellekteki değişkenleri ve çıktıyı izleme ("bilgisayar kodu nasıl işler?") |
| **AI Eğitmen** | Basitçe anlat, kodumu incele, hatamı açıkla, ipucu ver, ek alıştırma, Japonca terimler. Anahtarsız **çevrimdışı mod** (ders içeriği + kural tabanlı kod incelemesi + Türkçe hata sözlüğü + "bunu mu demek istedin?"); isteğe bağlı **Claude** modu (kullanıcının kendi API anahtarıyla, bağlama duyarlı, ipucu-önce yaklaşımı) |
| **Projeler** | Modül 1 projesi + 5 portfolyo projesi (Hesap Makinesi → 2D Çizim → 3D Koordinat Görselleştirici → 3D Geometri Aracı → Mini CAD). Mantık/geometri adımları tarayıcıda otomatik kontrollü; WinForms adımları Visual Studio için kontrol listeli. Canlı önizlemeler: 2D çizim/mini CAD (katman, yakalama, taşı/döndür, ölçüm, geri al) ve 3D tel kafes görüntüleyici (konum/dönüş/ölçek, yerel/dünya eksenleri, Z-up/Y-up, AABB) |
| **Yol haritası** | 26 hafta / 6 ay, günde ~2 saat: haftalık hedefler, günlük işaretlenebilir görevler, haftalık pratik ve tekrar testi, aylık projeler |
| **Japonca sözlük** | Tüm modüllerden kelimeler; arama, filtre, kelime kartları, "biliyorum" takibi, tarayıcı seslendirmesi (ja-JP) |
| **Arama** | Dersler (tam metin, kart düzeyinde), taslaklar, projeler, yol haritası, kelimeler |

## C# kodu nasıl çalışıyor? (güvenli yürütme)

Tarayıcıda gerçek .NET derleyicisi yok; bunun yerine `js/csharp/` altında yazılmış bir **C# alt kümesi yorumlayıcısı** var:

- `lexer.js` → `parser.js` (AST) → `interpreter.js` (ağaç yürüten yorumlayıcı), `values.js` (C# uyumlu değer/biçimlendirme), `diagnostics.js` (Türkçe hata açıklamaları).
- Gerçek derleyicinin hata kodlarını üretir (CS1002, CS0103, CS0029, CS0266, CS0165, CS0120, CS0122, CS0161…), tam sayı bölmesi, banker yuvarlaması, `double` biçimlendirme, exception mesajları gibi davranışları taklit eder.
- **Güvenlik:** kod sunucuya gönderilmez; ağ/dosya sistemi erişimi yok (`File.*` bellek içi sanal dosya sistemi kullanır); adım sınırı (sonsuz döngü), özyineleme derinliği ve çıktı boyutu sınırları vardır.
- **Sınırlamalar:** WinForms/WPF, async/await, tuple, switch ifadeleri, LINQ sorgu sözdizimi, operatör aşırı yükleme, kullanıcı tanımlı generic sınıflar desteklenmez. `float/decimal/long` çalışma zamanında `double/int` olarak tutulur; `int` taşması (overflow) taklit edilmez. Tür hataları kod o satıra ulaştığında yakalanır (gerçek derleyici programı hiç çalıştırmaz). Ciddi çalışmalar için yol haritasının 1. haftasında Visual Studio Community + .NET SDK kurulumu vardır.

## Kod yapısı

```
academy/
  index.html, css/app.css
  js/main.js                 kabuk + hash yönlendirici
  js/core/                   store (localStorage ilerleme), progress (kilitler), checker (alıştırma denetimi), dom, context
  js/csharp/                 C# yorumlayıcısı
  js/components/             editor (renklendirme), runner (çıktı/girdi/bellek/adım adım), exercise, quiz
  js/views/                  dashboard, curriculum, lesson, project, playground, roadmap, vocab, search, settings
  js/tutor/                  tutor (arayüz), offline (çevrimdışı motor), reviewer (kod incelemesi), concepts, claude (API)
  js/demos/                  cad2d, view3d (proje önizlemeleri)
  js/content/                modules (dizin), m1/ (dersler), projects/, outline (M2–M7), roadmap
  tools/validate.mjs         içerik doğrulayıcı
  docs/CONTENT_GUIDE.md      yeni ders/proje yazım rehberi
```

## Yeni içerik eklemek

1. `docs/CONTENT_GUIDE.md`'yi oku (ders şeması, alıştırma kontrolleri, kaçış tuzakları).
2. Dersi `js/content/mN/lXX.js` olarak yaz ve `js/content/modules.js`'te ilgili dersin `src` alanını ekle (taslak ders otomatik olarak etkileşimli derse dönüşür).
3. Doğrula: `node academy/tools/validate.mjs academy/js/content/mN/lXX.js` — çözümler gerçekten çalıştırılır, başlangıç kodlarının geçmediği, "tahmin et" cevaplarının gerçek çıktıyla eşleştiği kontrol edilir.

Tüm içerik: `node academy/tools/validate.mjs`

## AI Eğitmen — Claude modu

Ayarlar → API anahtarı. Anahtar yalnızca tarayıcıda saklanır ve doğrudan `api.anthropic.com`'a gönderilir (resmi `@anthropic-ai/sdk`, CDN'den, `dangerouslyAllowBrowser`). Varsayılan model `claude-opus-5-5`; sunucu tarafı yedek model (`fallbacks: "default"`) açıktır. Eğitmen her mesaja otomatik bağlam ekler: aktif ders/kart, alıştırma, öğrencinin kodu, son çalıştırma sonucu ve performansa dayalı zorluk seviyesi. Anahtar yoksa ya da istek başarısız olursa çevrimdışı eğitmen kullanılır.
