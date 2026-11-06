/* =====================================================================
   BEN TIKIR · SİTE AYARLARI
   Videolar YouTube'da yayınlandıkça yalnız bu dosyayı düzenlemek yeterli.
   ---------------------------------------------------------------------
   1) KANAL: kanal açılınca adresini tırnak içine yazın.
      Örnek: "https://www.youtube.com/@bentikir"
   2) VIDEOLAR: her klibin YouTube video kimliğini yazın.
      Video adresi https://www.youtube.com/watch?v=AbC123xYz ise
      kimlik "AbC123xYz" kısmıdır.
   Boş bırakılan klipler sitede "YouTube'da çok yakında" olarak görünür.
   ===================================================================== */
window.BENTIKIR = {
  KANAL: "https://www.youtube.com/channel/UCU47JcEsL7il4ERvp_1KV0w",
  VIDEOLAR: {
    "01": "",  // Yolcu Treni
    "02": "sBPyE-N7dpU",  // Göster Bul (Kaç Elma Var?)
    "03": "0fWXvjpQa0o",  // Az Çok
    "04": "",  // Tam Bana Göre
    "05": "hgcQG6iOzZs",  // Sonbahar Sepeti
    "06": "LsW0N0nxzAw",  // Lıkır Lıkır Süt
    "07": "OZIq_-n4rBk",  // Ellerimizi Yıkayalım
    "09": "NThmUFTA7So",  // Tıkır ve Arkadaşları
    "10": "KbstzF6fjKY",  // Günaydın!
    "12": "",  // Burada mısın?
    "11": "nOvb18hwPps",  // Çizgi film 1: Tıkır'la İlk Buluşma
    "13": "",  // Çizgi film 2: Lıkır'ın Bulutu
    "g10k": "CGEb7UeHkrQ" // Önemli günler: 10 Kasım, Atam Her Gün Bizimle
  },

  /* 3) OYUNLAR: "Tıkır ve arkadaşları ile oyunlar" bölümü.
     Her oyunu oyunlar/ klasörüne kendi klasörüyle koyun
     (ör. oyunlar/renk-avi/index.html) ve aşağıya bir satır ekleyin.
     Liste boşken bölümde "Yakında" kartları görünür.
     gorsel: kart resmi (16:9 önerilir, ör. oyunlar/renk-avi/kapak.webp)
     karakter: kartta görünecek arkadaş (tikir, pitir, kikir, likir, kitir, gicir, hisir, sikir)
     Örnek:
     { ad: "Renk Avı", aciklama: "Lıkır'la renkleri bul.", adres: "oyunlar/renk-avi/",
       gorsel: "oyunlar/renk-avi/kapak.webp", karakter: "likir", yas: "3+ yaş", seri: "gunluk" },
  */
  OYUNLAR: [
    { ad: "Yolcu Treni", aciklama: "Pıtır'la trene yolcu bindir, birlikte sayın.", adres: "oyunlar/yolcu-treni/",
      gorsel: "oyunlar/yolcu-treni/kapak.webp", karakter: "pitir", yas: "3-6 yaş", seri: "sayilar" }
  ]
};
