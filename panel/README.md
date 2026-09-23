# Düzenleme Paneli

Müşteri siteyi **Siteyi Duzenle.bat** dosyasına çift tıklayarak düzenler ve **🚀 Publish** butonuyla yayınlar.

## Müşteri bilgisayarına kurulum (tek sefer)

1. [Git for Windows](https://git-scm.com/download/win) kurun (varsayılan ayarlar yeterli).
2. Repoyu klonlayın: `git clone https://github.com/TussoR/test.git "Portfolyo"`
3. Klasördeki `Siteyi Duzenle.bat` için masaüstüne bir kısayol oluşturun.
4. İlk yayında Git bir GitHub giriş penceresi açar. Push yetkisi olan bir hesapla giriş yapın
   (müşterinin hesabını repoya **Collaborator** olarak ekleyin). Giriş bilgisi kaydedilir, bir daha sorulmaz.

## Nasıl çalışır

- `.bat`, `panel/server.ps1` dosyasını çalıştırır: son sürümü çeker (`git pull`), `localhost:8787` üzerinde siteyi sunar ve editörü açar.
- **Publish** butonu `index.html` ve `panel/content.json` dosyalarını yazar, ardından commit, pull --rebase ve push yapar. GitHub Pages siteyi 1–2 dakika içinde günceller.
- Panelde yüklenen görseller `assets/works/` klasörüne dosya olarak kaydedilir (HTML'e gömülmez).
- `panel/content.json`, editörün en son yayınlanan halidir. Editör açılırken önce tarayıcıdaki taslağı, yoksa bu dosyayı yükler.
