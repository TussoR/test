// Derleyici ve çalışma zamanı hatalarının Türkçe, yeni başlayan dostu açıklamaları.
// Her kayıt: title (kısa ad), why (ne oldu), fix (nasıl düzeltilir), ja (Japonca terim)

export const DIAGNOSTICS = {
  CS1002: { title: 'Noktalı virgül eksik', why: 'C# her deyimin sonunda <code>;</code> bekler. Noktalı virgül, cümlenin sonundaki nokta gibidir: bilgisayara "bu komut burada bitti" der.', fix: 'Hata gösterilen satırın (ya da bir önceki satırın) sonuna <code>;</code> ekle.' },
  CS1003: { title: 'Sözdizimi hatası', why: 'Derleyici belirli bir sembol bekliyordu ama başka bir şey buldu.', fix: 'Mesajda beklenen sembolü (ör. <code>,</code> veya <code>]</code>) kontrol et ve parantezlerin eşleştiğinden emin ol.' },
  CS1026: { title: 'Kapanış parantezi eksik', why: 'Açtığın bir <code>(</code> kapatılmamış.', fix: 'Her <code>(</code> için bir <code>)</code> olduğundan emin ol. Özellikle iç içe çağrılarda parantezleri say.' },
  CS1513: { title: 'Kapanış süslü parantezi eksik', why: 'Bir <code>{</code> bloğu açılmış ama <code>}</code> ile kapatılmamış.', fix: 'Her <code>{</code> için bir <code>}</code> ekle. Kodu düzgün girintilemek eksik olanı bulmayı kolaylaştırır.' },
  CS1514: { title: 'Açılış süslü parantezi eksik', why: 'Burada bir kod bloğu <code>{</code> bekleniyordu.', fix: 'Sınıf, metot veya koşul gövdesinden önce <code>{</code> koy.' },
  CS1010: { title: 'Metin kapatılmamış', why: 'Bir string (metin) <code>"</code> ile açılmış ama aynı satırda kapatılmamış.', fix: 'Metnin sonuna <code>"</code> ekle: <code>"Merhaba"</code>.' },
  CS1012: { title: 'Karakter sabitinde çok fazla karakter', why: '<code>char</code> tek tırnakla yazılır ve yalnızca TEK karakter tutar.', fix: 'Birden çok karakter için çift tırnak ve <code>string</code> kullan: <code>"abc"</code>.' },
  CS1011: { title: 'Boş karakter sabiti', why: "<code>''</code> içinde hiç karakter yok.", fix: "Bir karakter yaz: <code>'A'</code>." },
  CS1009: { title: 'Tanınmayan kaçış dizisi', why: 'Ters eğik çizgi <code>\\</code> özel bir anlam taşır (ör. <code>\\n</code> yeni satır).', fix: 'Gerçek ters eğik çizgi için <code>\\\\</code> yaz veya metnin başına <code>@</code> koy.' },
  CS1056: { title: 'Beklenmeyen karakter', why: 'C#\'ın tanımadığı bir sembol kullanılmış.', fix: 'Sembolü kaldır veya doğru operatörle değiştir.' },
  CS1001: { title: 'Tanımlayıcı (isim) bekleniyordu', why: 'Burada bir değişken/metot adı olmalıydı.', fix: 'Bir isim yaz (ör. <code>int sayi</code>). İsimler harf veya _ ile başlar.' },
  CS1041: { title: 'Ayrılmış kelime isim olarak kullanılmış', why: '<code>int</code>, <code>class</code>, <code>if</code> gibi anahtar kelimeler değişken adı olamaz.', fix: 'Başka bir isim seç (ör. <code>sinif</code> yerine <code>className</code>).' },
  CS1525: { title: 'Geçersiz ifade', why: 'Bu konumda bir değer/ifade bekleniyordu ama başka bir şey yazılmış.', fix: 'Eksik bir değer, fazladan bir operatör ya da eksik parantez olup olmadığına bak.' },
  CS1733: { title: 'İfade bekleniyordu', why: 'Bir değer yazılması gereken yer boş kalmış.', fix: 'Eksik değeri tamamla (ör. <code>int x = ;</code> → <code>int x = 5;</code>).' },
  CS0201: { title: 'Bu ifade tek başına deyim olamaz', why: '<code>x + 1;</code> gibi bir hesaplama yapıp sonucu hiçbir yere koymamışsın. C# bunun bir hata olduğunu düşünür.', fix: 'Sonucu bir değişkene ata (<code>x = x + 1;</code>) ya da yazdır (<code>Console.WriteLine(x + 1);</code>).' },
  CS0103: { title: 'Bu isim mevcut değil', why: 'Kullandığın isim (değişken, metot veya sınıf) bu kapsamda tanımlı değil. En sık sebepler: yazım hatası, büyük/küçük harf farkı (<code>console</code> ≠ <code>Console</code>) ya da değişkenin başka bir blok içinde tanımlanmış olması.', fix: 'İsmi kontrol et. C# büyük/küçük harfe duyarlıdır. Değişkeni kullanmadan önce tanımladığından ve doğru <code>{ }</code> bloğunda olduğundan emin ol.' },
  CS0117: { title: 'Böyle bir üye yok', why: 'Bu sınıfta o isimde bir metot veya özellik yok. Genelde yazım hatasıdır: <code>Writeline</code> değil <code>WriteLine</code>.', fix: 'İsmin yazımını ve büyük harfleri kontrol et.' },
  CS1061: { title: 'Nesnede böyle bir üye yok', why: 'Bu türdeki bir değerin o isimde bir özelliği veya metodu yok.', fix: 'Doğru üye adını kullan (ör. diziler için <code>Length</code>, listeler için <code>Count</code>).' },
  CS0029: { title: 'Tür dönüştürülemiyor', why: 'C# tür güvenli (type-safe) bir dildir: bir türdeki değeri uyumsuz başka bir türe doğrudan koyamazsın. Örneğin <code>string</code> bir kutuya <code>int</code> konamaz.', fix: 'Doğru türde değer kullan ya da dönüştür: <code>int.Parse(metin)</code>, <code>sayi.ToString()</code>.' },
  CS0266: { title: 'Örtük dönüşüm yok (bilgi kaybı riski)', why: 'Ondalıklı bir sayıyı (<code>double</code>) tam sayıya (<code>int</code>) koymak ondalık kısmı kaybettirir. C# bunu senin yerine sessizce yapmaz.', fix: 'Bilerek yapıyorsan açık dönüşüm (cast) kullan: <code>(int)x</code>. Ya da değişkeni <code>double</code> yap.' },
  CS0019: { title: 'Operatör bu türlere uygulanamaz', why: 'Kullandığın operatör (<code>+</code>, <code>&gt;</code>, <code>&amp;&amp;</code> vb.) bu iki türle çalışmıyor. Örneğin metni sayıyla <code>==</code> ile karşılaştıramazsın.', fix: 'İki tarafın da uyumlu türde olduğundan emin ol; gerekirse dönüştür.' },
  CS0023: { title: 'Operatör bu türe uygulanamaz', why: 'Örneğin <code>!</code> yalnızca <code>bool</code> değerlerle çalışır.', fix: 'Operatörün beklediği türü kullan.' },
  CS0165: { title: 'Atanmamış değişken kullanımı', why: 'Değişkeni tanımladın ama içine hiç değer koymadan okumaya çalıştın. Boş bir kutunun içine bakmak gibi.', fix: 'Değişkeni tanımlarken bir başlangıç değeri ver: <code>int toplam = 0;</code>' },
  CS0128: { title: 'Değişken zaten tanımlı', why: 'Aynı kapsamda aynı isimde iki değişken tanımladın.', fix: 'İkinci tanımda türü kaldır (sadece atama yap: <code>x = 5;</code>) ya da farklı bir isim kullan.' },
  CS0136: { title: 'İsim çakışması', why: 'Bu isim dıştaki bir blokta zaten kullanılıyor.', fix: 'Farklı bir değişken adı seç.' },
  CS0131: { title: 'Atamanın sol tarafı geçersiz', why: 'Eşittir işaretinin solunda bir değişken olmalı. Ayrıca <code>const</code> sabitler değiştirilemez.', fix: 'Atamayı <code>degisken = deger;</code> biçiminde yaz.' },
  CS0161: { title: 'Her yol bir değer döndürmüyor', why: 'Metot bir değer döndürmeyi vaat ediyor (<code>int</code>, <code>string</code>...) ama bazı durumlarda <code>return</code>\'e ulaşmadan bitiyor.', fix: 'Tüm <code>if/else</code> dallarında ya da metodun sonunda bir <code>return</code> olduğundan emin ol.' },
  CS0126: { title: 'return bir değer bekliyor', why: 'Metodun dönüş türü var ama <code>return;</code> boş kullanılmış.', fix: '<code>return deger;</code> yaz.' },
  CS0127: { title: 'void metot değer döndüremez', why: '<code>void</code> "hiçbir şey döndürmez" demektir.', fix: 'Değer döndürmek istiyorsan dönüş türünü değiştir (ör. <code>int</code>), istemiyorsan <code>return</code>\'den sonraki değeri sil.' },
  CS1501: { title: 'Yanlış sayıda argüman', why: 'Metodu, tanımında beklenenden farklı sayıda argümanla çağırdın.', fix: 'Metodun parametre listesine bak ve aynı sayıda değer gönder.' },
  CS7036: { title: 'Eksik argüman', why: 'Metot bir parametre bekliyor ama ona değer gönderilmemiş.', fix: 'Eksik argümanı çağrıya ekle.' },
  CS1503: { title: 'Argüman türü uyumsuz', why: 'Metoda gönderdiğin değerin türü, parametrenin türüyle uyuşmuyor.', fix: 'Doğru türde değer gönder ya da önce dönüştür.' },
  CS0120: { title: 'Nesne referansı gerekli (static sorunu)', why: '<code>static</code> bir metot (ör. <code>Main</code>) içinden, <code>static</code> olmayan bir üyeye erişmeye çalıştın. Static üyeler sınıfa, diğerleri nesneye aittir.', fix: 'Çağırdığın metodu da <code>static</code> yap ya da önce bir nesne oluştur: <code>var p = new Program(); p.Metot();</code>' },
  CS0122: { title: 'Erişim engellendi (koruma seviyesi)', why: 'Bu üye <code>private</code> (veya korumalı). Kapsülleme (encapsulation) gereği sınıf dışından erişilemez.', fix: 'Üyeyi <code>public</code> yap ya da sınıfın sunduğu public bir özellik/metot üzerinden eriş.' },
  CS0200: { title: 'Salt okunur özellik', why: 'Bu özelliğin <code>set</code> erişimcisi yok; değeri değiştirilemez.', fix: 'Değeri kurucuda ver ya da özelliğe <code>set;</code> ekle.' },
  CS0272: { title: 'set erişimcisi erişilemez', why: 'Özelliğin <code>set</code> kısmı <code>private</code>.', fix: 'Değeri sınıfın içindeki bir metotla değiştir.' },
  CS0191: { title: 'readonly alan değiştirilemez', why: '<code>readonly</code> alanlar sadece kurucuda atanabilir.', fix: 'Atamayı kurucuya taşı veya <code>readonly</code>\'yi kaldır.' },
  CS0246: { title: 'Tür bulunamadı', why: 'Bu isimde bir sınıf/tür yok ya da gerekli <code>using</code> eksik.', fix: 'Tür adının yazımını kontrol et; kendi sınıfınsa tanımladığından emin ol.' },
  CS1729: { title: 'Uygun kurucu yok', why: 'Sınıfın, bu sayıda argüman alan bir kurucusu (constructor) yok.', fix: 'Kurucunun parametrelerine bak ya da yeni bir kurucu ekle.' },
  CS0144: { title: 'Soyut sınıftan nesne oluşturulamaz', why: '<code>abstract</code> sınıflar ve <code>interface</code>\'ler eksik bir plan gibidir; doğrudan örneklenemez.', fix: 'Bu sınıftan türeyen somut bir sınıfın nesnesini oluştur.' },
  CS0534: { title: 'Soyut üye uygulanmamış', why: 'Türetilmiş sınıf, temel sınıftaki <code>abstract</code> metodu uygulamak zorundadır.', fix: 'Metodu <code>override</code> ile tanımla.' },
  CS0535: { title: 'Arayüz üyesi uygulanmamış', why: 'Sınıf bir <code>interface</code>\'i uyguladığını söylüyor ama gerekli metotlardan birini tanımlamamış.', fix: 'Eksik metodu aynı imzayla (isim + parametreler) ekle.' },
  CS0115: { title: 'Override edilecek metot yok', why: '<code>override</code> yazdın ama temel sınıfta bu isimde bir metot yok.', fix: 'Temel sınıftaki metot adını ve parametrelerini kontrol et.' },
  CS0506: { title: 'Virtual olmayan metot override edilemez', why: 'Temel sınıftaki metot <code>virtual</code> veya <code>abstract</code> değil.', fix: 'Temel sınıftaki metodu <code>virtual</code> olarak işaretle.' },
  CS0163: { title: 'case bloğu sonuna break eksik', why: 'C#\'ta bir <code>case</code> bloğu bitince bir sonrakine "düşemez".', fix: 'Her <code>case</code> bloğunun sonuna <code>break;</code> ekle.' },
  CS0156: { title: 'Argümansız throw sadece catch içinde', why: '<code>throw;</code> yakalanan hatayı yeniden fırlatır; catch dışında anlamsızdır.', fix: '<code>throw new Exception("mesaj");</code> kullan.' },
  CS1524: { title: 'catch veya finally bekleniyordu', why: '<code>try</code> bloğundan sonra en az bir <code>catch</code> ya da <code>finally</code> gelmeli.', fix: '<code>try { } catch (Exception ex) { }</code> yapısını tamamla.' },
  CS0818: { title: 'var ile tanımlanan değişkene değer verilmeli', why: '<code>var</code> türü, verilen değerden çıkarır. Değer yoksa tür bilinemez.', fix: '<code>var x = 5;</code> gibi bir başlangıç değeri ver.' },
  CS0815: { title: "var'a null atanamaz", why: '<code>null</code>\'dan bir tür çıkarılamaz.', fix: 'Türü açıkça yaz: <code>string ad = null;</code>' },
  CS0820: { title: 'var ile dizi başlatıcı kullanılamaz', why: '<code>{1, 2, 3}</code> tek başına tür bilgisi taşımaz.', fix: '<code>int[] dizi = {1, 2, 3};</code> veya <code>var dizi = new[] {1, 2, 3};</code> yaz.' },
  CS0021: { title: '[] ile indekslenemez', why: 'Bu tür köşeli parantezle eleman erişimini desteklemiyor.', fix: 'Dizi, liste veya dictionary kullandığından emin ol.' },
  CS1579: { title: 'foreach bu türde çalışmaz', why: '<code>foreach</code> yalnızca koleksiyonlar (dizi, liste, string…) üzerinde dolaşabilir.', fix: 'Döngüye bir koleksiyon ver; tek bir sayıysa <code>for</code> kullan.' },
  CS1656: { title: 'foreach değişkenine atama yapılamaz', why: '<code>foreach</code> döngü değişkeni salt okunurdur.', fix: 'Elemanları değiştirmek için <code>for</code> döngüsü ve indeks kullan.' },
  CS0149: { title: 'Metot adı bekleniyordu', why: 'Bir değişkeni metot gibi <code>()</code> ile çağırmaya çalıştın.', fix: 'Parantezleri kaldır ya da doğru metot adını kullan.' },
  CS0176: { title: 'Static üyeye nesne üzerinden erişim', why: 'Static üyeler sınıf adıyla çağrılır.', fix: '<code>nesne.Metot()</code> yerine <code>SinifAdi.Metot()</code> yaz.' },
  CS0026: { title: "Static bağlamda 'this' kullanılamaz", why: 'Static metotların bir nesnesi (this) yoktur.', fix: 'Metodu static olmaktan çıkar veya this kullanma.' },
  CS0030: { title: 'Bu dönüşüm yapılamaz', why: 'Bu iki tür arasında açık dönüşüm bile mümkün değil.', fix: 'Metinden sayıya geçmek için <code>int.Parse</code>, sayıdan metne için <code>.ToString()</code> kullan.' },
  CS5001: { title: 'Main metodu yok', why: 'Program nereden başlayacağını bilmiyor. Ya <code>static void Main()</code> tanımla ya da kodu sınıf dışına (üst düzey deyimler) yaz.', fix: '<code>class Program { static void Main() { ... } }</code> yapısını ekle.' },
  CS0101: { title: 'Aynı isimde iki tür', why: 'Aynı isimli iki sınıf tanımlanmış.', fix: 'Birinin adını değiştir.' },
  CS0106: { title: 'Bu belirleyici burada geçersiz', why: '<code>public</code>/<code>private</code> gibi belirleyiciler yerel değişkenlerde kullanılmaz.', fix: 'Belirleyiciyi kaldır.' },
  CS1023: { title: 'Gömülü deyim bildirim olamaz', why: 'Süslü parantezsiz bir if/while gövdesinde değişken tanımlanamaz.', fix: 'Gövdeyi <code>{ }</code> içine al.' },
  CS8641: { title: "'else' eşleşen 'if' olmadan", why: 'Bir <code>else</code>, hemen önünde bir <code>if</code> bloğu olmadan yazılmış. Çoğunlukla if bloğundan sonra fazladan bir <code>;</code> ya da eksik <code>}</code> sebebiyle olur.', fix: '<code>if (...) { } else { }</code> yapısını kontrol et.' },
  CS0177: { title: 'out parametresi atanmalı', why: 'Metot bitmeden önce her <code>out</code> parametresine değer verilmeli.', fix: 'Metodun tüm yollarında out parametresine atama yap.' },
  CS1620: { title: 'out/ref anahtar kelimesi eksik', why: 'Bu parametre <code>out</code>/<code>ref</code> ile gönderilmeli.', fix: 'Çağrıda <code>out x</code> biçimini kullan.' },
  CS0847: { title: 'Dizi başlatıcı uzunluğu uyuşmuyor', why: 'Belirttiğin boyut ile verdiğin eleman sayısı farklı.', fix: 'Boyutu kaldır veya eleman sayısını eşitle.' },
  CS0622: { title: 'Dizi başlatıcı sadece dizilere', why: '<code>{ }</code> başlatıcısı sadece dizi türlerinde tek başına kullanılabilir.', fix: 'Listeler için <code>new List&lt;int&gt; { 1, 2 }</code> yaz.' },
};

export const EXCEPTIONS = {
  FormatException: { title: 'Biçim hatası (FormatException)', why: 'Bir metni sayıya çevirmeye çalıştın ama metin geçerli bir sayı değil (ör. <code>int.Parse("abc")</code>). Ondalık sayılarda nokta <code>.</code> kullanıldığını unutma.', fix: 'Kullanıcı girdisi için <code>int.TryParse</code> kullan ya da <code>try/catch</code> ile yakala.' },
  DivideByZeroException: { title: 'Sıfıra bölme', why: 'Bir tam sayıyı sıfıra böldün. Matematikte tanımsız olduğu için program durdu.', fix: 'Bölmeden önce böleni kontrol et: <code>if (b != 0)</code>.' },
  IndexOutOfRangeException: { title: 'Dizi sınırı aşıldı', why: 'Dizide olmayan bir indekse eriştin. Diziler 0\'dan başlar: 3 elemanlı dizinin son indeksi 2\'dir.', fix: 'Döngü koşulunda <code>i &lt; dizi.Length</code> kullan (<code>&lt;=</code> değil).' },
  ArgumentOutOfRangeException: { title: 'Argüman aralık dışında', why: 'Listede/metinde olmayan bir konuma eriştin ya da geçersiz bir aralık verdin.', fix: 'İndeksin <code>0</code> ile <code>Count - 1</code> (veya <code>Length - 1</code>) arasında olduğunu kontrol et.' },
  NullReferenceException: { title: 'Null referans', why: 'Değeri <code>null</code> (hiçbir şey) olan bir değişkenin üyesine eriştin. Sahnede silinmiş bir objeyi seçmeye çalışmak gibi.', fix: 'Kullanmadan önce değişkene değer ata ya da <code>if (x != null)</code> ile kontrol et.' },
  InvalidOperationException: { title: 'Geçersiz işlem', why: 'Nesne şu anki durumunda bu işlemi yapamaz (ör. boş bir yığından <code>Pop</code>, boş listede <code>Max</code>, döngü sırasında listeyi değiştirmek).', fix: 'İşlemden önce durumu kontrol et (ör. <code>Count &gt; 0</code>).' },
  KeyNotFoundException: { title: 'Anahtar bulunamadı', why: 'Dictionary\'de olmayan bir anahtarı okumaya çalıştın.', fix: '<code>ContainsKey</code> veya <code>TryGetValue</code> kullan.' },
  ArgumentException: { title: 'Geçersiz argüman', why: 'Metoda geçersiz bir değer gönderildi (ör. dictionary\'ye aynı anahtarı iki kez eklemek).', fix: 'Gönderdiğin değeri kontrol et.' },
  ArgumentNullException: { title: 'Null argüman', why: 'Metoda <code>null</code> gönderildi (ör. <code>Console.ReadLine()</code> girdi kalmayınca null döner).', fix: 'Değerin null olmadığını kontrol et.' },
  OverflowException: { title: 'Taşma', why: 'Sayı, türün tutabileceği aralığın dışında.', fix: 'Daha büyük bir tür (<code>long</code>, <code>double</code>) kullan.' },
  InvalidCastException: { title: 'Geçersiz dönüşüm', why: 'Nesne, dönüştürülmek istenen türde değil.', fix: '<code>is</code> veya <code>as</code> ile önce türü kontrol et.' },
  FileNotFoundException: { title: 'Dosya bulunamadı', why: 'Okumaya çalıştığın dosya yok.', fix: 'Önce <code>File.Exists(yol)</code> ile kontrol et.' },
  Exception: { title: 'Exception', why: 'Program bir hata fırlattı ve kimse yakalamadı.', fix: 'Hatanın mesajını oku; gerekirse <code>try/catch</code> ile yakala.' },
};

export const LIMITS = {
  TIMEOUT: { title: 'Sonsuz döngü şüphesi', why: 'Program çok fazla adım çalıştı. Genelde döngü koşulu hiç <code>false</code> olmuyordur (ör. sayacı artırmayı unutmak).', fix: 'Döngü değişkeninin her turda değiştiğinden ve koşulun bir gün yanlış olacağından emin ol.' },
  STACK: { title: 'Yığın taşması (Stack overflow)', why: 'Bir fonksiyon kendini durmadan çağırdı. Her özyinelemeli fonksiyonun bir durma koşulu (base case) olmalı.', fix: 'Fonksiyonun başına <code>if (n == 0) return ...;</code> gibi bir durma koşulu ekle.' },
  OUTPUT: { title: 'Çok fazla çıktı', why: 'Program çok büyük miktarda yazı üretti; muhtemelen döngü sonsuz.', fix: 'Döngü koşulunu kontrol et.' },
};

/** Bir hata nesnesi için açıklama kaydını döndürür. */
export function explainError(err) {
  if (!err) return null;
  if (err.kind === 'compile') return { ...(DIAGNOSTICS[err.code] || { title: 'Derleme hatası', why: 'Kod, C# kurallarına uymuyor.', fix: 'Hata mesajındaki satırı dikkatlice incele.' }), code: err.code, kindLabel: 'Derleme hatası — コンパイルエラー' };
  if (err.kind === 'runtime') return { ...(EXCEPTIONS[err.code] || EXCEPTIONS.Exception), code: err.code, kindLabel: 'Çalışma zamanı hatası — 実行時エラー' };
  if (err.kind === 'limit') return { ...(LIMITS[err.code] || LIMITS.TIMEOUT), code: err.code, kindLabel: 'Güvenlik sınırı' };
  return { title: 'Yorumlayıcı hatası', why: 'Bu kod, tarayıcı içi C# yorumlayıcısının desteklemediği bir özellik kullanıyor olabilir.', fix: 'Kodu sadeleştirmeyi dene ya da Visual Studio\'da çalıştır.', code: err.code, kindLabel: 'Sınırlama' };
}
