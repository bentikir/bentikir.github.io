# bentikir.com · Site v14 (5 Kasım 2026)

Önceki sürümler (`site\`, `site_v2_2026-11-04\`, `site_v3_2026-11-04\`, `site_v4_2026-11-04\`, `site_v5_2026-11-04\`, `site_v6_2026-11-04\`, `site_v7_2026-11-04\`, `site_v8_2026-11-04\`, `site_v9_2026-11-04\`, `site_v10_2026-11-04\`, `site_v11_2026-11-05\`, `site_v12_2026-11-05\`, `site_v13_2026-11-05\`) olduğu gibi duruyor; bu klasör en yeni sürüm.

## Bakmak için
`index.html` dosyasına çift tıklayın. Sesler ve tüm görseller klasörün içinde, internet gerekmez.

## Videolar yayınlanınca
Yalnız **ayarlar.js** düzenlenir:
- `KANAL:` satırına kanal adresi (ör. `https://www.youtube.com/@bentikir`)
- `VIDEOLAR:` altında her klibin YouTube kimliği (watch?v= sonrasındaki kısım)
- `OYUNLAR:` listesine her yeni oyun için bir satır (ad, açıklama, adres, görsel, karakter). Oyun dosyaları `oyunlar/<oyun-adı>/` klasörüne konur. Liste boşken bölümde "Yakında" kartları görünür.
Kimliği girilen klip, kartına tıklanınca sitede oynar (youtube-nocookie). Boş olanlar "YouTube'da çok yakında" gösterir.

## Bölümler
Giriş (Kapıyı çal: Tık tık! / Kim o? / Ben Tıkır! / Hoş geldin! sesli) · Şarkılar (10 şarkı; el yıkamada yalnız yavaş sürüm; Burada mısın? eklendi) · Çizgi Filmler (Tıkır'la İlk Buluşma, Lıkır'ın Bulutu) · Tıkır ve arkadaşları ile oyunlar · Karakterler (8 kart, dokununca ses) · Seriler · Ekransız görevler ve etkinlik paketleri (hazırlanıyor) · Aileler ve öğretmenler · Araştırmalar · SSS · YouTube bandı.

## Varlıklar
- Kapaklar: `YOUTUBE_4K\<klip>\KAPAK_1920x1080.png` → `assets/klipler/NN.webp` (960) ve `NN-k.webp` (480)
- Karakterler: `YOUTUBE_4K\00_KANAL_VE_KARAKTERLER\Karakterler\` → `assets/karakterler/`. Tıkır yalnız `tikir_on` (gözleri açık) olarak kullanıldı; `Tikir_el_salliyor` ve `Hepsi_birlikte` görsellerinde Tıkır'ın gözleri kapalı olduğu için sitede yok.
- Sesler: `Site_Sesleri_v1_2026-10-11\ses\` içinden seçilenler → `assets/ses/`
- Logo, favicon, paylaşım görseli (og.jpg) kök klasörde.

## Yayına alma
`06_Hesaplar_ve_Altyapi\Hesaplar_ve_DNS.md` adımları aynen geçerli; GitHub deposuna bu klasörün **içindekiler** yüklenir.

## Çerez, analiz ve form yok. Yazı tipleri sitenin içinde.

## Kaynak notu (v4)
- Burada mısın?: `D:\tpt\KMAK_KLIPLER\_TR_YENI_KANAL\Burada_misin\` v4. Kapağı bu sürümde 62. saniyedeki kareden hazırlandı (`KAPAK_Burada_misin_1920x1080.png` aynı klasöre kondu).
- Lıkır'ın Bulutu: `D:\tpt\KMAK_KLIPLER\_TR_YENI_KANAL\Likirin_Bulutu_2026-11-03\v4\` (kapak ve açıklama oradan).
- El yıkama: sitede tek kart; YouTube'a `YOUTUBE_4K\08_El_Yikama_Yavas` yüklenip kimliği ayarlar.js'te "07" satırına yazılır.

## v5 değişiklikleri
- Başlık yazı tipi Fredoka yerine **Baloo 2** (Fredoka'da ş, ğ, İ harfleri yok; başlıklarda bozuk görünüyordu).
- Yeni seri: **Günlük Rutinler** (Günaydın!, Burada mısın?, Ellerimizi Yıkayalım). Şarkılar listesinde tanıtımdan hemen sonra gelir; süzgeçte ayrı düğmesi var.

## v6 değişiklikleri
- "Reklamsız" ifadeleri kaldırıldı (ileride reklam olabilir). Reklam eklenirse kvkk.html gizlilik metni de güncellenmeli.
- "Klipler nasıl hazırlanıyor?" bölümü ve SSS maddesi kaldırıldı.

## v7 değişiklikleri
- Yeni görünüm: girişte gökyüzü, güneş, kayan bulutlar, yeşil tepeler ve çiçekler. Bölümler seri renklerinde bantlar (gök mavisi, güneş sarısı, nane, şeftali, lila) ve dalgalı geçişlerle ayrılıyor. Kartlar kalın konturlu, "çıkartma" tarzı.

## v8 değişiklikleri
- Giriş "Tıkır'ın Evi" oldu: konturlu çizim bahçe sahnesi (ağaçlar, çit, çiçekler, yol), "BEN TIKIR" tabelalı kapı. Sayfa açılınca kapı çalınır ve açılır, Tıkır dışarı çıkar; pencerelerde Pıtır ve Kıkır. "Kapıyı çal" düğmesi aynı sahneyi Tıkır'ın sesiyle oynatır. Sahne tamamen kod (SVG) ile çizildi, ayrı görsel dosyası yok.

## v9 değişiklikleri
- Kodla çizilen ev sahnesi kaldırıldı. Giriş artık sade: solda başlık ve düğmeler, sağda "Burada mısın?" klibinin (v4, 4K) kapı sahnesi (1,95-8,2 sn; assets/kapi.mp4, 1280x720). Sayfa açılınca sessiz bir kez oynar, son karede Tıkır kapıda kalır. "Kapıyı çal" ya da "Sesli izle" sahneyi sesle baştan oynatır; ses ve görüntü klipteki gibi eşzamanlı.
- Bulut, güneş ve zemin desenleri kaldırıldı.

## v10 değişiklikleri
- Kapı sahnesi büyüdü: sağ kenara taşan geniş ekran. Sahne 2,4. saniyeden başlıyor (ev tam görünür), "Hoş geldin!" sesi kesilmesin diye son kare 1,3 sn bekletilip ses yumuşakça bitiriliyor (toplam 7,1 sn).

## v11 değişiklikleri
- Giriş arka planı "Canlı nane" oldu: doygun nane yeşili zemin, arkada eğik ve yavaşça akan şeffaf "Tık tık! Kim o? Ben Tıkır! Hoş geldin!" yazıları, süzülen renkli noktalar. Başlık beyaz, "Ben Tıkır!" sarı.

## v12 değişiklikleri
- Giriş arka planı "Gün batımı bahçesi": klibin şeftali gökyüzü ve yeşil tepeleri girişin tamamına yayıldı; akan yazılar kaldırıldı.
- Yeni bölüm: **Önemli Gün ve Haftalar** (menüde "Önemli Günler"). 10 Kasım "Atam Her Gün Bizimle" (D:\tpt\KMAK_KLIPLER\_TR_YENI_KANAL\10_Kasim_2026-11-04\v4) izlenebilir; Öğretmenler Günü (24 Kasım), Yerli Malı Haftası (12-18 Aralık) ve 23 Nisan "Hazırlanıyor". YouTube kimliği ayarlar.js içinde "g10k" satırına yazılır.

## v13 değişiklikleri
- İletişim adresi admin@bentikir.com oldu (ana sayfa alt bilgisi ve gizlilik sayfası).
- YouTube kanal adresi ayarlar.js içine yazıldı; menüdeki YouTube düğmesi ve alttaki "abone ol" bandı kanala gidiyor.

## v14 değişiklikleri
- YouTube kimlikleri girildi (5 Kasım 2026): 10 Kasım, Tıkır ve Arkadaşları, Kaç Elma Var?, Hangisi Çok?, Sonbahar Sepeti, Lıkır Lıkır Süt, Ellerimizi Yıkayalım, Tıkır'la İlk Buluşma, Günaydın!. Bu kartlara tıklayınca video sitede oynar.
- Henüz yüklenmeyenler (Yolcu Treni, Tam Bana Göre, Burada mısın?, Lıkır'ın Bulutu) kartın köşesinde "Yakında" etiketiyle görünür.

## v15 (5 Kasım 2026)
- Video "yapılandırma hatası" (YouTube hata 153) düzeltildi: oynatıcı youtube.com/embed + origin + referrerpolicy ile açılıyor (Tune4Learn sitesindeki çözümle aynı).
- Site bilgisayardan çift tıklanarak (file://) açılırsa YouTube oynatıcı çalışmaz; bu durumda kart "YouTube'da izle" düğmesi gösterir. Canlı sitede (bentikir.com) video site içinde oynar.

## v16 (6 Kasım 2026) · canlı sitedeki hâli
- Site yayında: https://bentikir.com (GitHub: bentikir/bentikir.github.io, HTTPS açık). Güncel kaynak GitHub'daki depodur.
- robots.txt ve sitemap.xml eklendi; Google Search Console doğrulandı, site haritası gönderildi, ana sayfa için dizine ekleme istendi.
- Geniş ekranda giriş yazısının videonun altına girmesi düzeltildi; üst menü yazıları tek satıra alındı (style.css sonu).

## v17 TASLAK (6 Kasım 2026) · henüz yayında değil
- Ana sayfa (index.html) çocuklar için yeniden yapıldı: kapı videosu, dört resimli bölüm düğmesi (Şarkılar, Çizgi Filmler, Oyunlar, Önemli Günler), sesli karakter şeridi, büyük kartlar. Yazı en aza indirildi. Dosyalar: cocuk.css, cocuk.js.
- Bütün aile ve öğretmen içeriği aileler.html sayfasına taşındı (kazanımlar, seriler, etkinlikler, araştırmalar, SSS). Ana sayfanın sağ üstünde "Aileler ve öğretmenler" bağlantısı var.
- sitemap.xml'e aileler.html eklendi.


## v18 TASLAK (6 Kasım 2026)
- Çocuk alanı daha canlı: doygun renkli bantlar ve yıldız desenleri, bant kenarlarından taşan karakterler (Pıtır, Lıkır, Hışır, Kıkır), kapının yanında Tıkır, zıplayan bölüm düğmeleri, sarı karakter şeridi, kartlarda süre etiketi.

## v19 TASLAK (6 Kasım 2026)
- Çocuk alanı PBS KIDS ilkeleriyle sadeleştirildi: düz gökyüzü, ortada büyük Tıkır (dokununca kapı klibi sesli açılır), çerçevesiz dolgu simgeli bölüm düğmeleri, afiş biçimli karakter kartları, kalın konturları kaldırılmış beyaz çerçeveli video kartları, bant kenarında büyük karakterler.

## v20 TASLAK (6 Kasım 2026)
- Büyük Tıkır sürekli hafifçe sallanıyor, ara ara zıplıyor; dokununca kendi sesiyle konuşuyor (her dokunuşta sıradaki cümle), sesine göre zıplıyor, söylediği balonda görünüyor. Gözleri hep açık (el sallayan görsel kullanılmıyor).
- Bantlardaki Pıtır, Lıkır, Hışır, Kıkır dokununca konuşuyor/ses çıkarıyor. Bölüm düğmeleri Tıkır sesiyle "İzle!" / "Oyna!" diyor.
- Yeni sesler: assets/ses (Site_Sesleri_v1 klasöründen).

## v21 TASLAK (6 Kasım 2026)
- Konuşurken ağız hareket ediyor: Tıkır, Pıtır, Kıkır, Lıkır ve Hışır konuşurken gülümsemelerinin üstünde sesle açılıp kapanan bir ağız (dil dahil) çiziliyor; sustuklarında asıl gülümseme görünüyor. Konuşurken el sallama görseline geçilmiyor, gözler açık kalıyor.
