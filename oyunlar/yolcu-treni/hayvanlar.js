/* Yolcu Treni · yolcular: klipteki on yolcunun aynısı (klip kodundan, eng_chars.py, çizildi).
   Görseller hayvan/<ad>.webp, 260×412; ayaklar 400. satırda. bas: başın ortası (görsel boyunun oranı), boy: klipteki boy katsayısı. */
window.HAYVANLAR = (function () {
  var L = {
    tavsan: { bas: 0.473, boy: 1 }, kedi: { bas: 0.473, boy: 1 }, kus: { bas: 0.583, boy: 0.78 }, ayi: { bas: 0.443, boy: 1.06 },
    civciv: { bas: 0.563, boy: 0.82 }, zurafa: { bas: 0.267, boy: 1 }, kuzu: { bas: 0.473, boy: 1 }, ordek: { bas: 0.473, boy: 1 },
    penguen: { bas: 0.473, boy: 1 }, fil: { bas: 0.414, boy: 1.12 }
  };
  return {
    adlar: Object.keys(L),
    bilgi: function (ad) { return L[ad]; },
    img: function (ad) { return '<img src="hayvan/' + ad + '.webp" alt="" draggable="false">'; }
  };
})();
