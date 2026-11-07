# Ben Tıkır · Oyunlar (v1 · 6 Kasım 2026)

Bu klasör sitenin kök klasörüne (index.html'in yanına) olduğu gibi kopyalanır: `oyunlar/`.

## İçindekiler
- `_cati/` – Bütün oyunların ortak çatısı: başlangıç ekranı (Oyna; müzik, ses efekti, konuşma, altyazı düğmeleri), Minik/Büyük seviye seçimi, sesli cümle ve altyazı, kısa efektler, sekme değişince duraklatma, kapanış ekranı, çıkartma defteri. Ortak Tıkır sesleri `_cati/ses/` içinde.
- `yolcu-treni/` – İlk oyun. Ev sahibi Pıtır, alan Sayılar, 3-5 dakika.

Oyunlar sitedeki `fonts.css`, `logo.webp`, `favicon-64.png` ve `assets/karakterler/` dosyalarını kullanır; ayrıca kopyalamaya gerek yoktur.

## Siteye eklemek
`ayarlar.js` içindeki `OYUNLAR: [ ]` listesine şu satır eklenir:

```js
{ ad: "Yolcu Treni", aciklama: "Pıtır'la trene yolcu bindir, birlikte sayın.", adres: "oyunlar/yolcu-treni/",
  gorsel: "oyunlar/yolcu-treni/kapak.webp", karakter: "pitir", yas: "3-6 yaş", seri: "sayilar" },
```

## Bakmak için
Klasörü sitenin içine koyduktan sonra `oyunlar/yolcu-treni/index.html` dosyasına çift tıklamak yeterli; internet gerekmez.

## Yeni oyun eklerken
1. `oyunlar/<oyun-adi>/` klasörü açılır (küçük harf, Türkçe karaktersiz).
2. İçine `index.html`, `oyun.js`, `oyun.css`, `cumleler.js`, `kapak.webp` (960×540) ve `ses/` konur.
3. `index.html` sırasıyla `cumleler.js`, `../_cati/cati.js` ve `oyun.js` dosyalarını yükler; `oyun.js` içinde `Cati.baslat({ id, ad, alan, evSahibiGorsel, hazir, oyun })` çağrılır.
4. Bütün konuşmalar `cumleler.js` içinde kimlik numarasıyla durur (`metin`, `kim`, `ses`). Altyazı da buradan gelir. (JSON yerine .js kullanıldı: dosyaya çift tıklayınca da açılsın diye.)

## Kurallar
Ayrıntılı kurallar "Ben Tıkır Oyun Alanı Tasarım Belgesi"nde (claude.ai). Kısaca: yazılı yönerge yok, puan ve süre yok, yanlışta ceza sesi yok, üç basamaklı ipucu, "Haydi" yazımı, Tıkır'ın gözleri açık, reklam ve veri toplama yok (ilerleme yalnız cihazda, localStorage).
