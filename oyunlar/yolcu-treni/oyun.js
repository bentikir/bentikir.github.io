/* Yolcu Treni v9 · Ben Tıkır oyunları (7 Kasım 2026)
   Alan: Sayılar · Ev sahibi: Pıtır
   Okul öncesi sayma öğrenme rotasına göre üç basamak (Clements ve Sarama, Building Blocks; Gelman ve Gallistel'in sayma ilkeleri;
   MEB 2026 Okul Öncesi Programı MAB.1, MAB.2):
     1. Eşle ve say (36-48 ay, 1-5): koltuk sayısı = yolcu sayısı. "Her koltuğa bir yolcu." Boş koltuk ve peronda kalan yolcu yok.
        Tren dolunca birlikte sayılır; ardından "Trende kaç yolcu var?" (asal sayı ilkesi: son söylenen sayı toplamdır).
     2. Bileti olan biner (48-60 ay, 3-10): bilet sayısı = koltuk sayısı. Her koltuğun üstünde bir bilet yeri vardır.
        Bileti olmayan 1-2 yolcu el sallayıp bir sonraki treni bekler; peronda kalmalarının nedeni görünürdür.
     3. N yolcu bindir (60-72 ay): beşli vagonlar, on koltuk. Boş koltuk bilinçli bir öğedir:
        "Yedi yolcu bindi. Üç koltuk boş kaldı. Hepsi birlikte on koltuk." (parça-bütün)
   Geçiş: üst üste iki tur ilk denemede doğruysa bir üst basamak (1. basamakta en az bir "kaç yolcu" sorusu da doğru olmalı);
   üst üste iki tur zorlanırsa sessizce bir alt basamak. Ulaşılan basamak "Tekrar oyna"da başlangıç olur.
   Akış: kapı → seviye → Pıtır gösterir → tur → hareket anı → tur → Kıkır'ın yanlışı → tur → tur → son durak → şarkı. */
(function () {
  'use strict';
  var KR = '../../assets/karakterler/';
  var H = window.HAYVANLAR;
  var C, A;
  var tren, trenX = 0, dizi = [5], koltuklar = [], peron = [], hedefEl, kapiEl, pitirEl, kikirEl;
  var kilit = true, kapiBekleyen = null, sonHareket = 0;
  var mod = 'esle';            // 'esle' | 'bilet' | 'olsun': çocuğun bindirme kuralı
  var turHata = 0;             // bu turdaki yanlış sayısı (uyarlama için)
  var kuralSay = {}, biletYokDedi = 0, aktifHedef = 0, kartDogru = 0, turKaydi = [];
  var SAYI = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on'];

  /* ---------- çizimler ---------- */
  function dunyaSVG() {
    // dünya iki yana 220 piksel taşar: geniş ekranlarda (yatay telefon) kenarlar da manzarayla dolar
    var s = '<svg class="dunya" viewBox="-220 0 1720 720" aria-hidden="true"><defs>' +
      '<linearGradient id="gok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FDcff"/><stop offset="1" stop-color="#E4F6FF"/></linearGradient></defs>' +
      '<rect x="-220" width="1720" height="720" fill="url(#gok)"/>' +
      '<circle cx="1195" cy="150" r="44" fill="#FFE07A"/><circle cx="1195" cy="150" r="60" fill="#FFE07A" opacity=".25"/>';
    [[150, 120, 1], [930, 90, .8], [330, 230, .7], [1050, 250, .6]].forEach(function (b) {
      s += '<g transform="translate(' + b[0] + ' ' + b[1] + ') scale(' + b[2] + ')" fill="#fff" opacity=".95"><ellipse cx="0" cy="10" rx="70" ry="24"/><circle cx="-26" cy="-4" r="26"/><circle cx="14" cy="-14" r="34"/><circle cx="46" cy="4" r="22"/></g>';
    });
    s += '<path d="M-220 370 Q-60 320 0 380 Q160 300 330 360 T700 350 T1040 340 T1280 360 T1500 350 V470 H-220z" fill="#B7E39A"/>' +
      '<path d="M-220 410 Q-100 380 0 420 Q220 370 460 410 T900 400 T1280 410 T1500 400 V470 H-220z" fill="#9AD67F"/>';
    // istasyon binası
    s += '<g transform="translate(400 150)">' +
      '<rect x="20" y="96" width="440" height="200" rx="10" fill="#FFF3E3" stroke="#3B3355" stroke-width="4"/>' +
      '<path d="M0 104 L240 10 L480 104z" fill="#FF7F57" stroke="#3B3355" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M40 96 L240 20 L440 96" fill="none" stroke="#FFAA8C" stroke-width="6" opacity=".7"/>' +
      '<circle cx="240" cy="66" r="24" fill="#fff" stroke="#3B3355" stroke-width="4"/><path d="M240 66 v-14 M240 66 h10" stroke="#3B3355" stroke-width="3.5" stroke-linecap="round"/>' +
      '<rect x="78" y="114" width="324" height="46" rx="12" fill="#FFB892" stroke="#3B3355" stroke-width="3.5"/>' +
      '<text x="240" y="146" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="700" font-size="25" fill="#3B3355">MATEMATİK İSTASYONU</text>' +
      '<rect x="60" y="180" width="70" height="80" rx="8" fill="#BFE6FF" stroke="#3B3355" stroke-width="3.5"/><rect x="350" y="180" width="70" height="80" rx="8" fill="#BFE6FF" stroke="#3B3355" stroke-width="3.5"/>' +
      '<rect x="200" y="186" width="80" height="110" rx="8" fill="#C9864F" stroke="#3B3355" stroke-width="3.5"/></g>';
    // ağaçlar
    [[110, 330], [300, 352], [1000, 340], [1180, 330]].forEach(function (t) {
      s += '<rect x="' + (t[0] - 7) + '" y="' + t[1] + '" width="14" height="70" fill="#A8703F"/><circle cx="' + t[0] + '" cy="' + (t[1] - 6) + '" r="40" fill="#6CC46B" stroke="#3B3355" stroke-width="3"/>';
    });
    // ray ve peron
    [[-120, 340], [1400, 336]].forEach(function (t) {
      s += '<rect x="' + (t[0] - 7) + '" y="' + t[1] + '" width="14" height="70" fill="#A8703F"/><circle cx="' + t[0] + '" cy="' + (t[1] - 6) + '" r="40" fill="#6CC46B" stroke="#3B3355" stroke-width="3"/>';
    });
    s += '<rect x="-220" y="472" width="1720" height="14" fill="#7A6A5A"/>';
    for (var x = -214; x < 1500; x += 36) s += '<rect x="' + x + '" y="468" width="22" height="22" rx="3" fill="#8D7B68"/>';
    s += '<rect x="-220" y="462" width="1720" height="7" fill="#5C5048"/>';
    s += '<rect x="-220" y="490" width="1720" height="230" fill="#F3E2C3"/>';
    for (x = -220; x < 1500; x += 40) s += '<rect x="' + x + '" y="490" width="20" height="10" fill="#3B3355"/><rect x="' + (x + 20) + '" y="490" width="20" height="10" fill="#F8D86A"/>';
    s += '<path d="M-220 600 H1500" stroke="#E9D3AD" stroke-width="3"/></svg>';
    return s;
  }

  /* tren: dz = her vagondaki koltuk sayısı, örn. [3] ya da [5, 2] ya da [5, 5] */
  function vagonEni(k) { return 24 + 76 * k; }
  function trenEni(dz) { var w = 236; dz.forEach(function (k) { w += vagonEni(k) + 10; }); return w; }
  function trenSVG(dz) {
    var W = trenEni(dz), s = '<svg class="govde" width="' + W + '" height="190" viewBox="0 0 ' + W + ' 190">';
    s += '<rect x="56" y="6" width="34" height="46" rx="6" fill="#3B3355"/><rect x="48" y="2" width="50" height="12" rx="5" fill="#3B3355"/>' +
      '<rect x="8" y="56" width="120" height="100" rx="20" fill="#E5484D" stroke="#3B3355" stroke-width="4"/>' +
      '<rect x="80" y="24" width="140" height="132" rx="16" fill="#E5484D" stroke="#3B3355" stroke-width="4"/>' +
      '<rect x="70" y="16" width="160" height="18" rx="8" fill="#3B3355"/>' +
      '<rect x="92" y="40" width="86" height="78" rx="14" fill="#CFEFFF" stroke="#3B3355" stroke-width="4"/>' +
      '<rect x="8" y="120" width="212" height="12" fill="#F8D86A"/>' +
      '<path d="M8 150 L-6 168 H40z" fill="#3B3355"/>';
    [40, 112, 184].forEach(function (cx, i) { s += teker(cx, 162, i === 0 ? 20 : 24, '#E5484D'); });
    var x = 236;
    dz.forEach(function (k, v) {
      var w = vagonEni(k), renk = v === 0 ? '#F8C33A' : '#4FA9F2', koyu = v === 0 ? '#E0A41C' : '#2F86D6';
      s += '<rect x="' + (x - 14) + '" y="128" width="20" height="10" rx="4" fill="#3B3355"/>';
      s += '<rect x="' + x + '" y="20" width="' + w + '" height="134" rx="18" fill="' + renk + '" stroke="#3B3355" stroke-width="4"/>' +
        '<rect x="' + (x - 4) + '" y="12" width="' + (w + 8) + '" height="18" rx="9" fill="' + koyu + '" stroke="#3B3355" stroke-width="4"/>' +
        '<rect x="' + x + '" y="124" width="' + w + '" height="10" fill="' + koyu + '"/>';
      for (var i = 0; i < k; i++) s += '<rect x="' + (x + 22 + i * 76) + '" y="38" width="64" height="76" rx="12" fill="#FFF9F0" stroke="#3B3355" stroke-width="3.5"/>';
      if (k >= 4) s += teker(x + 60, 162, 20, koyu) + teker(x + 110, 162, 20, koyu) + teker(x + w - 110, 162, 20, koyu) + teker(x + w - 60, 162, 20, koyu);
      else s += teker(x + w * 0.28, 162, 20, koyu) + teker(x + w * 0.72, 162, 20, koyu);
      x += w + 10;
    });
    return s + '</svg>';
    function teker(cx, cy, r, renk) {
      return '<g class="teker"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#3B3355"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 7) + '" fill="' + renk + '"/><circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#3B3355"/></g>';
    }
  }
  /* seviye kartı çizimi: 1 = kısa vagon, 2 = biletli vagon, 3 = beşli iki vagon */
  function seviyeCiz(n) {
    var vag = n === 3 ? [5, 5] : n === 2 ? [5] : [3], W = 84, s = '';
    vag.forEach(function (k) { W += 12 + k * 22 + 10; });
    s = '<svg viewBox="0 0 ' + Math.max(290, W) + ' 130"><rect x="0" y="112" width="' + Math.max(290, W) + '" height="6" rx="3" fill="#B9A58B"/>';
    s += '<rect x="8" y="42" width="62" height="62" rx="12" fill="#E5484D"/><rect x="20" y="52" width="38" height="30" rx="8" fill="#CFEFFF"/><rect x="24" y="22" width="14" height="24" rx="4" fill="#3B3355"/>';
    var x = 76;
    vag.forEach(function (k, v) {
      var w = 12 + k * 22;
      s += '<rect x="' + x + '" y="46" width="' + w + '" height="58" rx="12" fill="' + (v ? '#4FA9F2' : '#F8C33A') + '"/>';
      for (var i = 0; i < k; i++) {
        s += '<rect x="' + (x + 7 + i * 22) + '" y="58" width="16" height="22" rx="5" fill="#FFF9F0"/>';
        if (n === 2) s += '<rect x="' + (x + 8 + i * 22) + '" y="30" width="14" height="10" rx="2" fill="#FFD85A" stroke="#3B3355" stroke-width="1.5"/>';
      }
      s += '<circle cx="' + (x + 16) + '" cy="108" r="8" fill="#3B3355"/><circle cx="' + (x + w - 16) + '" cy="108" r="8" fill="#3B3355"/>';
      x += w + 10;
    });
    return s + '<circle cx="24" cy="108" r="9" fill="#3B3355"/><circle cx="56" cy="108" r="9" fill="#3B3355"/></svg>';
  }
  var BILET_SVG = '<svg viewBox="0 0 44 30"><path d="M4 2h36a2 2 0 0 1 2 2v7a4 4 0 0 0 0 8v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a4 4 0 0 0 0-8V4a2 2 0 0 1 2-2z" fill="#FFD85A" stroke="#3B3355" stroke-width="2.5"/><path d="M15 4v22" stroke="#E0A41C" stroke-width="2" stroke-dasharray="3 3"/><path d="M29 8.5l1.9 4 4.4.5-3.3 3 .9 4.3-3.9-2.2-3.9 2.2.9-4.3-3.3-3 4.4-.5z" fill="#E5484D"/></svg>';

  function kapiSVG() {
    return '<svg viewBox="0 0 150 180"><rect x="12" y="6" width="126" height="170" rx="16" fill="#C9864F" stroke="#3B3355" stroke-width="5"/>' +
      '<rect x="30" y="24" width="90" height="56" rx="10" fill="none" stroke="#9C5F2E" stroke-width="5"/><rect x="30" y="94" width="90" height="62" rx="10" fill="none" stroke="#9C5F2E" stroke-width="5"/>' +
      '<circle cx="75" cy="52" r="18" fill="#BFE6FF" stroke="#3B3355" stroke-width="4"/>' +
      '<circle cx="112" cy="104" r="9" fill="#F8D86A" stroke="#3B3355" stroke-width="3.5"/>' +
      '<path d="M66 118 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M75 109 v-6" fill="#F8D86A" stroke="#3B3355" stroke-width="3.5"/></svg>';
  }

  /* ---------- yerleşim ---------- */
  function karakter(ad, sinif, gorsel) { var d = C.karakter(ad, KR + gorsel, sinif); A.appendChild(d); return d; }

  function sahneKur() {
    A.innerHTML = dunyaSVG();
    tren = C.el('div', 'tren'); A.appendChild(tren);
    hedefEl = C.el('div', 'hedef', '<div class="rakam"></div><div class="noktalar"></div>'); A.appendChild(hedefEl);
    pitirEl = karakter('pitir', 'pitir', 'pitir_on.webp');
    kikirEl = karakter('kikir', 'kikir', 'kikir_on.webp');
    kapiEl = C.el('button', 'kapi', kapiSVG() + '<span class="yazi">Tık tık!</span>');
    kapiEl.setAttribute('aria-label', 'Tık tık: bitirdim, sayalım');
    kapiEl.disabled = true; A.appendChild(kapiEl);
    kapiEl.addEventListener('click', function () {
      if (kilit || !kapiBekleyen) return;
      C.efekt('tiktik'); kapiEl.classList.remove('nabiz'); kapiEl.classList.add('vur');
      setTimeout(function () { kapiEl.classList.remove('vur'); }, 500);
      var f = kapiBekleyen; kapiBekleyen = null; kilitle(true); f();
    });
  }

  function kilitle(k) { kilit = k; kapiEl.disabled = k; }
  function dokundu() { sonHareket = performance.now(); }

  /* ---------- tren ---------- */
  function trenGetir(dz, biletYerli) {
    dizi = dz.slice(); koltuklar = [];
    tren.innerHTML = trenSVG(dz);
    var W = trenEni(dz); trenX = Math.round((1280 - W) / 2);
    tren.style.width = W + 'px'; tren.style.left = trenX + 'px';
    var sur = C.el('div', 'surucu'); sur.appendChild(C.karakter('tikir', KR + 'tikir_on.webp', 'surucu-ic')); tren.appendChild(sur);
    var x = 236;
    dz.forEach(function (k) {
      for (var i = 0; i < k; i++) {
        var ko = C.el('div', 'koltuk', '<span class="etiket"></span>' + (biletYerli ? '<span class="bilet-yer">' + BILET_SVG + '</span>' : ''));
        ko.style.left = (x + 22 + i * 76) + 'px';
        tren.appendChild(ko); koltuklar.push({ el: ko, yolcu: null });
      }
      x += vagonEni(k) + 10;
    });
    C.efekt('cuf');
    return animasyon(tren, [{ transform: 'translateX(1750px)' }, { transform: 'translateX(0)' }], 1700, 'cubic-bezier(.2,.7,.25,1)');
  }
  function trenGonder(sure) {
    C.efekt('duduk');
    return C.bekle(500).then(function () {
      C.efekt('cuf');
      return animasyon(tren, [{ transform: 'translateX(0)' }, { transform: 'translateX(-1950px)' }], sure || 2200, 'cubic-bezier(.55,0,.75,.4)');
    });
  }
  function animasyon(el, kareler, sure, egri) {
    return new Promise(function (bitti) {
      var a = el.animate(kareler, { duration: sure, easing: egri || 'ease', fill: 'forwards' });
      var dur = setInterval(function () { if (C.durdumu()) a.pause(); else if (a.playState === 'paused') a.play(); }, 100);
      a.onfinish = function () { clearInterval(dur); bitti(); };
    });
  }
  /* koltuk dizisi: n koltuk, beşer beşer vagonlara (7 → [5, 2]) */
  function besli(n) { var d = []; while (n > 0) { d.push(Math.min(5, n)); n -= 5; } return d; }

  /* ---------- yolcular ---------- */
  /* say: perondaki yolcu sayısı; biletli: kaç yolcunun bileti var (null: bilet yok) */
  function peronKur(say, biletli) {
    peron.forEach(function (y) { if (y.el.parentNode) y.el.remove(); });
    peron = [];
    var adlar = C.karistir(H.adlar).slice(0, say);
    var biletler = [];
    for (var b = 0; b < say; b++) biletler.push(biletli == null ? false : b < biletli);
    biletler = C.karistir(biletler);
    var alanSol = 214, alanSag = 925, iki = say > 6, sirada = iki ? Math.ceil(say / 2) : say;
    var en = iki ? 100 : 122, adim = Math.min(128, (alanSag - alanSol) / sirada);
    adlar.forEach(function (ad, i) {
      var sira = iki ? (i < sirada ? 0 : 1) : 0, k = iki ? (sira ? i - sirada : i) : i, buSira = iki && sira ? say - sirada : sirada;
      var bas = alanSol + ((alanSag - alanSol) - adim * buSira) / 2 + (iki && sira ? adim * 0.4 : 0);
      var boy = en * 412 / 260;
      var y = { ad: ad, en: en, bilet: biletler[i], slot: { x: bas + k * adim + (adim - en) / 2, y: (iki ? (sira ? 714 : 626) : 702) - boy * 400 / 412 }, koltuk: -1 };
      var bi = H.bilgi(ad), ust = Math.round(bi.bas * boy - 0.17 * boy - 30);
      y.el = C.el('div', 'yolcu' + (y.bilet ? ' biletli' : ''), '<div class="ic">' + H.img(ad) + '</div>' + (y.bilet ? '<span class="ybilet" style="top:' + ust + 'px">' + BILET_SVG + '</span>' : ''));
      y.el.style.width = en + 'px'; y.el.style.height = boy + 'px'; y.el.style.zIndex = iki && sira ? 12 : 11;
      y.el.style.left = y.slot.x + 'px'; y.el.style.top = y.slot.y + 'px';
      y.el.querySelector('.ic').style.animationDelay = (-Math.random() * 2.6) + 's';
      surukleBagla(y); A.appendChild(y.el); peron.push(y);
    });
  }
  function koltuktakiler() { return koltuklar.filter(function (k) { return k.yolcu; }); }
  function bosKoltuk() { for (var i = 0; i < koltuklar.length; i++) if (!koltuklar[i].yolcu) return i; return -1; }
  function koltukMerkezi(i) { var ko = koltuklar[i].el; return { x: trenX + parseFloat(ko.style.left) + 32, y: 296 + 36 + 40 }; }
  function oturanHTML(ad) {
    var b = H.bilgi(ad), f = 58 / (120 * b.boy) * (ad === 'zurafa' ? 0.95 : 1), w = 260 * f, h = 412 * f;
    return '<div class="pencere"><img src="hayvan/' + ad + '.webp" alt="" draggable="false" style="width:' + w + 'px;left:' + (32 - 130 * f) + 'px;top:' + (40 - b.bas * h) + 'px"></div>';
  }
  function etiketleriSil() { koltuklar.forEach(function (k) { var e = k.el.querySelector('.etiket'); e.classList.remove('gor', 'parla'); k.el.classList.remove('bos-parla'); }); }

  function uc(ad, x1, y1, x2, y2, e1, e2, sure) {
    var b = H.bilgi(ad), u = C.el('div', 'ucan', H.img(ad));
    u.style.width = e1 + 'px'; u.style.height = (e1 * 412 / 260) + 'px'; u.style.left = '0'; u.style.top = '0';
    A.appendChild(u);
    var oy = b.bas * e1 * 412 / 260, ox = e1 / 2, tepe = Math.min(y1, y2) - 90, s2 = e2 / e1;
    function tr(x, y, s) { return 'translate(' + (x - ox) + 'px,' + (y - oy) + 'px) scale(' + s + ')'; }
    u.style.transformOrigin = ox + 'px ' + oy + 'px';
    return animasyon(u, [
      { transform: tr(x1, y1, 1) }, { transform: tr((x1 + x2) / 2, tepe, (1 + s2) / 2), offset: .5 }, { transform: tr(x2, y2, s2) }
    ], sure || 540, 'ease-in-out').then(function () { u.remove(); });
  }
  function basNoktasi(y) { var b = H.bilgi(y.ad), h = y.en * 412 / 260; return { x: y.slot.x + y.en / 2, y: y.slot.y + b.bas * h }; }
  function koltugaKoy(y, i) {
    var o = C.el('div', 'oturan', oturanHTML(y.ad)); o.setAttribute('aria-label', 'Yolcuyu indir');
    o.addEventListener('pointerup', function (e) { e.stopPropagation(); if (!kilit) indir(y); });
    koltuklar[i].el.appendChild(o); y.oturan = o;
    if (y.bilet) koltuklar[i].el.classList.add('bilet-dolu');
  }
  function hazirOturt(n) {
    peron.slice(0, n).forEach(function (y, i) { koltuklar[i].yolcu = y; y.koltuk = i; y.el.style.opacity = '0'; y.el.style.pointerEvents = 'none'; koltugaKoy(y, i); });
  }

  /* zorla: Kıkır ya da Pıtır bindirirken bilet kuralı uygulanmaz */
  function bindir(y, zorla) {
    if (!y || y.koltuk >= 0) return Promise.resolve(false);
    if (mod === 'bilet' && !y.bilet && !zorla) { biletYok(y); return Promise.resolve(false); }
    var i = bosKoltuk(); if (i < 0) { dolu(y); return Promise.resolve(false); }
    etiketleriSil(); dokundu();
    koltuklar[i].yolcu = y; y.koltuk = i;
    var r = basNoktasi(y);
    if (y.el.style.transform) { var m = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(y.el.style.transform); if (m) { r.x += +m[1]; r.y += +m[2]; } }
    y.el.style.opacity = '0'; y.el.style.pointerEvents = 'none'; y.el.style.transform = '';
    var h = koltukMerkezi(i), b = H.bilgi(y.ad); C.efekt('pop');
    return uc(y.ad, r.x, r.y, h.x, h.y, y.en, 260 * 58 / (120 * b.boy)).then(function () {
      if (y.koltuk !== i) return true;
      koltugaKoy(y, i); return true;
    });
  }
  function geriSalla(y) {
    y.el.style.transform = ''; y.el.classList.remove('hayir'); void y.el.offsetWidth; y.el.classList.add('hayir');
    setTimeout(function () { y.el.classList.remove('hayir'); }, 700);
  }
  /* bileti olmayan yolcu: başını sallar; Pıtır ilk iki kez nedenini söyler, sonra yalnızca hareket */
  function biletYok(y) {
    dokundu(); geriSalla(y); C.efekt('geri'); turHata++;
    if (biletYokDedi < 2) { biletYokDedi++; C.soyle('p_bilet_yok'); }
  }
  /* koltuklar dolu: yolcu başını sallar, tren parlar */
  function dolu(y) {
    dokundu(); geriSalla(y); C.efekt('geri');
    tren.classList.remove('dolu-parla'); void tren.offsetWidth; tren.classList.add('dolu-parla');
  }
  function indir(y) {
    if (y.koltuk < 0) return Promise.resolve();
    etiketleriSil(); dokundu();
    var i = y.koltuk, h = koltukMerkezi(i);
    koltuklar[i].yolcu = null; y.koltuk = -1; koltuklar[i].el.classList.remove('bilet-dolu');
    if (y.oturan) { y.oturan.remove(); y.oturan = null; }
    C.efekt('geri');
    var b = H.bilgi(y.ad), p = basNoktasi(y);
    return uc(y.ad, h.x, h.y, p.x, p.y, 260 * 58 / (120 * b.boy), y.en).then(function () {
      y.el.style.left = y.slot.x + 'px'; y.el.style.top = y.slot.y + 'px'; y.el.style.opacity = '1'; y.el.style.pointerEvents = '';
    });
  }

  function surukleBagla(y) {
    var bas = null, tasindi = false;
    y.el.addEventListener('pointerdown', function (e) {
      if (kilit || y.koltuk >= 0) return;
      e.preventDefault(); y.el.setPointerCapture(e.pointerId);
      bas = C.nokta(e); tasindi = false; dokundu();
    });
    y.el.addEventListener('pointermove', function (e) {
      if (!bas) return;
      var p = C.nokta(e), dx = p.x - bas.x, dy = p.y - bas.y;
      if (!tasindi && Math.hypot(dx, dy) > 14) { tasindi = true; y.el.classList.add('surukleniyor'); }
      if (tasindi) y.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    function birak(e) {
      if (!bas) return;
      var p = C.nokta(e), suruklendi = tasindi; bas = null; tasindi = false;
      y.el.classList.remove('surukleniyor');
      if (!suruklendi || p.y < 490) { bindir(y); }
      else { y.el.style.transform = ''; }
    }
    y.el.addEventListener('pointerup', birak);
    y.el.addEventListener('pointercancel', function () { bas = null; tasindi = false; y.el.classList.remove('surukleniyor'); y.el.style.transform = ''; });
  }

  /* ---------- pekiştirme: bilet damgası, düdük, buhar ---------- */
  var bilet, damga = 0, ilkKutlama = true;
  function biletKur() {
    bilet = C.el('div', 'bilet', '<span class="ad">BİLET</span><span class="yerler"></span>');
    for (var i = 0; i < 5; i++) bilet.querySelector('.yerler').appendChild(C.el('i', 'yer'));
    A.appendChild(bilet);
  }
  function buhar() {
    for (var i = 0; i < 5; i++) {
      var p = C.el('span', 'buhar' + (i % 2 ? ' yildiz' : ''));
      p.style.left = (58 + Math.random() * 20) + 'px'; p.style.animationDelay = (i * 0.16) + 's';
      tren.appendChild(p); (function (p) { setTimeout(function () { p.remove(); }, 2400); })(p);
    }
  }
  /* süreç övgüsü: basamağa uygun, tekrar etmeden */
  var OVGU = {
    esle: ['p_doldu', 'p_bravo_1', 'p_bravo_2', 'p_bravo_3', 'p_bravo_4', 'p_ovgu_1', 'p_ovgu_2', 'p_ovgu_3', 'p_ovgu_4'],
    bilet: ['p_bilet_ovgu', 'p_bravo_1', 'p_bravo_3', 'p_bravo_4', 'p_ovgu_1', 'p_ovgu_2', 'p_ovgu_4'],
    olsun: ['p_bravo_1', 'p_bravo_4', 'p_bravo_5', 'p_ovgu_1', 'p_ovgu_2', 'p_ovgu_4']
  }, ovguSira = { esle: [], bilet: [], olsun: [] };
  function ovgu() {
    var o = ovguSira[mod];
    if (!o.length) { o = ovguSira[mod] = C.karistir(OVGU[mod].slice()); }
    return C.soyle(o.shift());
  }
  function sevin(el) { if (!el) return; el.classList.remove('zipla'); void el.offsetWidth; el.classList.add('zipla'); setTimeout(function () { el.classList.remove('zipla'); }, 700); }
  function buyukDamga() {
    return new Promise(function (bitti) {
      if (damga >= 5) { bitti(); return; }
      var y = bilet.querySelectorAll('.yer')[damga++];
      var d = C.el('div', 'buyuk-damga', '<i></i>'); A.appendChild(d);
      C.efekt('damga');
      setTimeout(function () {
        var r = y.getBoundingClientRect(), ra = A.getBoundingClientRect(), o = ra.width / 1280;
        var hx = (r.left + r.width / 2 - ra.left) / o, hy = (r.top + r.height / 2 - ra.top) / o;
        d.style.transform = 'translate(' + (hx - 640) + 'px,' + (hy - 330) + 'px) scale(.2)';
        d.classList.add('uc');
      }, 750);
      setTimeout(function () { d.remove(); y.classList.add('dolu'); C.efekt('pop'); bilet.classList.remove('zipla'); void bilet.offsetWidth; bilet.classList.add('zipla'); bitti(); }, 1350);
    });
  }
  function kutla() {
    C.efekt('fanfar'); buhar(); C.konfeti(70, 640, 330);
    sevin(tren.querySelector('.surucu .bt-kar')); sevin(pitirEl);
    koltuktakiler().forEach(function (k, i) { if (k.yolcu.oturan) setTimeout(function () { k.yolcu.oturan.classList.remove('sevinc'); void k.yolcu.oturan.offsetWidth; k.yolcu.oturan.classList.add('sevinc'); }, i * 70); });
    var damgaBitti = C.bekle(300).then(buyukDamga);
    var s = C.bekle(900).then(function () { C.efekt('duduk'); return C.soyle(ilkKutlama ? 't_bilet' : ['t_dutdut_1', 't_dutdut_2']); });
    ilkKutlama = false;
    return Promise.all([s, damgaBitti]);
  }
  function finalKutla() {
    bilet.classList.add('tam', 'merkez'); C.efekt('fanfar');
    C.konfeti(90, 640, 300);
    setTimeout(function () { C.konfeti(60, 330, 260); C.efekt('dogru'); }, 700);
    setTimeout(function () { C.konfeti(60, 950, 260); }, 1300);
    sevin(pitirEl); setTimeout(function () { sevin(pitirEl); }, 800);
  }

  /* ---------- hedef rozeti ---------- */
  function hedefGoster(n) {
    hedefEl.querySelector('.rakam').textContent = n;
    var nk = ''; for (var i = 0; i < n; i++) nk += '<i></i>';
    hedefEl.querySelector('.noktalar').innerHTML = nk;
    hedefEl.classList.add('gor');
  }
  function hedefGizle() { hedefEl.classList.remove('gor'); }

  /* ---------- sayma ---------- */
  function say(girissiz) {
    var l = koltuktakiler(), sira = girissiz ? Promise.resolve() : C.soyle('p_sayalim');
    l.forEach(function (k, i) {
      sira = sira.then(function () {
        var e = k.el.querySelector('.etiket'); e.textContent = i + 1; e.classList.add('gor', 'parla');
        if (k.yolcu.oturan) { k.yolcu.oturan.classList.remove('sayildi'); void k.yolcu.oturan.offsetWidth; k.yolcu.oturan.classList.add('sayildi'); }
        C.efekt('say');
        return C.soyle('p_say_' + (i + 1)).then(function () { e.classList.remove('parla'); });
      });
    });
    return sira.then(function () { return l.length; });
  }
  /* parça-bütün: boş koltuklar parlar; "N yolcu bindi. M koltuk boş kaldı. Hepsi birlikte on koltuk." */
  function bosAnlat(n) {
    var m = koltuklar.length - n;
    if (m <= 0) return Promise.resolve();
    hedefGizle();
    koltuklar.forEach(function (k) { if (!k.yolcu) k.el.classList.add('bos-parla'); });
    return C.soyle('p_bindi_' + n).then(function () { return C.soyle('p_bos_' + m); })
      .then(function () { return C.soyle('p_hepsi_' + koltuklar.length); });
  }

  function bosSay() {
    var l = koltuklar.filter(function (k) { return !k.yolcu; }), s = Promise.resolve();
    l.forEach(function (k, i) {
      s = s.then(function () {
        var e = k.el.querySelector('.etiket'); e.textContent = i + 1; e.classList.add('gor', 'parla'); C.efekt('say');
        return C.soyle('p_say_' + (i + 1)).then(function () { e.classList.remove('parla'); });
      });
    });
    return s.then(function () { l.forEach(function (k) { k.el.querySelector('.etiket').classList.remove('gor'); }); });
  }
  /* ---------- sayı kartları: "Kaç ... ?" sorusu. Döndürür: yanlış sayısı ---------- */
  function kartSor(dogru, ses, yanlisSonra, ust) {
    var secenek = [dogru], adaylar = C.karistir([dogru - 2, dogru - 1, dogru + 1, dogru + 2].filter(function (x) { return x >= 1 && x <= 10; }));
    secenek.push(adaylar[0], adaylar[1]); secenek = C.karistir(secenek);
    var kutu = C.el('div', 'kartlar' + (ust ? ' ust' : '')); kartDogru = dogru; if (ust) hedefGizle();
    secenek.forEach(function (s) {
      var nk = ''; for (var i = 0; i < s; i++) nk += '<i></i>';
      var b = C.el('button', 'kart', '<span class="rakam">' + s + '</span><span class="noktalar">' + nk + '</span>');
      b.setAttribute('aria-label', String(s)); b.dataset.s = s; kutu.appendChild(b);
    });
    A.appendChild(kutu);
    var yanlis = 0;
    return C.bekle(300).then(function () { return C.soyle(ses); }).then(function bekle() {
      return new Promise(function (sec) {
        kutu.classList.add('acik'); dokundu();
        var hat = 0, t = setInterval(function () {
          if (!kutu.classList.contains('acik')) { clearInterval(t); return; }
          if (!C.durdumu() && performance.now() - sonHareket > 14000 && hat < 2) { hat++; dokundu(); C.soyle(ses); }
        }, 500);
        Array.prototype.forEach.call(kutu.children, function (b) { b.onclick = function () { if (!kutu.classList.contains('acik')) return; kutu.classList.remove('acik'); clearInterval(t); C.efekt('secim'); sec(b); }; });
      }).then(function (b) {
        if (+b.dataset.s === dogru) { b.classList.add('dogru'); C.efekt('dogru'); return yanlis; }
        yanlis++; turHata++; b.classList.add('salla'); setTimeout(function () { b.classList.remove('salla'); }, 600);
        return C.soyle('p_bir_daha').then(yanlisSonra).then(function () {
          if (yanlis >= 2) { var d = kutu.querySelector('[data-s="' + dogru + '"]'); d.classList.add('ipucu'); }
          return bekle();
        });
      });
    }).then(function (y) { return C.bekle(500).then(function () { kutu.remove(); return y; }); });
  }
  /* perondaki biletleri sayar (yanlış kart sonrası) */
  function biletleriSay() {
    var l = peron.filter(function (y) { return y.bilet && y.koltuk < 0; }), s = Promise.resolve();
    l.forEach(function (y, i) {
      s = s.then(function () { y.el.classList.add('isaret'); C.efekt('say'); return C.soyle('p_say_' + (i + 1)); })
        .then(function () { y.el.classList.remove('isaret'); });
    });
    return s;
  }

  /* ---------- kapı bekleme ve deneme döngüsü ---------- */
  function kapiyiBekle(tamMi, hatirlat) {
    return new Promise(function (bitti) {
      kapiBekleyen = bitti; kilitle(false); dokundu();
      var hatirlatti = 0;
      (function bak() {
        if (!kapiBekleyen) return;
        var bos = performance.now() - sonHareket;
        if (!C.durdumu() && bos > 13000 && hatirlatti < 3) {
          hatirlatti++; dokundu();
          if (tamMi()) { kapiEl.classList.add('nabiz'); C.soyle('p_tiktik'); }
          else C.soyle(hatirlat);
        }
        setTimeout(bak, 500);
      })();
    });
  }
  function biletsizOturan() { return koltuktakiler().filter(function (k) { return !k.yolcu.bilet; })[0]; }
  /* tur durumunu denetler: null = doğru, yoksa uygun uyarı sesi */
  function durum(hedef) {
    var n = koltuktakiler().length;
    if (mod === 'bilet' && biletsizOturan()) return 'p_bilet_kontrol';
    if (n === hedef) return null;
    if (n > hedef) return 'p_fazla';
    return mod === 'olsun' ? 'p_az' : 'p_eksik';
  }
  function birlikteYap(hedef) {
    var s = C.soyle('p_birlikte');
    return s.then(function adim() {
      var b = mod === 'bilet' ? biletsizOturan() : null;
      if (b) return indir(b.yolcu).then(function () { return C.bekle(250); }).then(adim);
      var l = koltuktakiler();
      if (l.length > hedef) return indir(l[l.length - 1].yolcu).then(function () { return C.bekle(250); }).then(adim);
      if (l.length < hedef) {
        var p = peron.filter(function (y) { return y.koltuk < 0 && (mod !== 'bilet' || y.bilet); })[0];
        return bindir(p, true).then(function () { return C.bekle(250); }).then(adim);
      }
    }).then(function () { return say(); }).then(function () { return C.soyle('p_birlikte_bitti'); });
  }
  /* çocuk bitirdiğinde kapıyı çalar; doğruysa sayılır, değilse ipucu basamakları:
     1) kuralı hatırlat, 2) farkı söyle ve strateji öner, 3) birlikte yap */
  function deneme(hedef, hatirlat, kikirTuru) {
    var d = 0; aktifHedef = hedef;
    return (function dongu() {
      return kapiyiBekle(function () { return durum(hedef) === null; }, hatirlat).then(function () {
        var uyari = durum(hedef);
        if (uyari === null) return say().then(function (n) { return n; });
        turHata++; d++;
        if (uyari === 'p_bilet_kontrol') return C.soyle(uyari).then(dongu);
        var once = (mod === 'olsun' || d > 1 || kikirTuru) ? say() : Promise.resolve();
        return once.then(function () {
          if (kikirTuru && d === 1) return C.soyle(uyari);
          if (d === 1) return C.soyle(mod === 'olsun' ? 'p_ipucu_bak' : uyari).then(function () { return mod === 'olsun' ? C.soyle(hatirlat) : null; });
          if (d === 2) return C.soyle(uyari).then(function () { return C.soyle('p_strateji'); });
          return 'birlikte';
        }).then(function (r) { if (r === 'birlikte') return birlikteYap(hedef).then(function () { return hedef; }); return dongu(); });
      });
    })();
  }

  /* ---------- turlar ---------- */
  function selam() { koltuktakiler().forEach(function (k) { if (k.yolcu.oturan) k.yolcu.oturan.classList.add('selam'); }); return C.bekle(400); }
  function bekleyenlerElSallar() {
    var l = peron.filter(function (y) { return y.koltuk < 0; });
    l.forEach(function (y, i) { setTimeout(function () { y.el.classList.add('elsalla'); }, i * 150); });
    return l.length;
  }
  function ilkDokunma(t) {
    if (!t.ilk) return Promise.resolve();
    return C.soyle(C.seviye === 'buyuk' ? 'p_tasi' : 'p_dokun').then(function () { return C.soyle('p_tiktik'); });
  }
  function isaretle() {
    var p = peron.filter(function (y) { return y.koltuk < 0 && (mod !== 'bilet' || y.bilet); })[0];
    if (p) { p.el.classList.add('isaret'); setTimeout(function () { p.el.classList.remove('isaret'); }, 2600); }
  }
  var bekleyenDedi = false;
  /* kural cümlesi ilk iki kez söylenir; sonraki turlarda çocuk kuralı görselden izler (sessiz rehberlik) */
  function kural(ses) {
    kuralSay[ses] = (kuralSay[ses] || 0) + 1;
    return kuralSay[ses] <= 2 ? C.soyle(ses) : C.bekle(300);
  }

  /* 1. basamak: eşle ve say. kac: sayıldıktan sonra "Trende kaç yolcu var?" */
  function esleTuru(t) {
    mod = 'esle'; peronKur(t.n); turHata = 0;
    return C.bekle(400).then(function () { return kural('p_her_koltuk'); }).then(function () { return ilkDokunma(t); })
      .then(function () { isaretle(); return deneme(t.n, 'p_her_koltuk'); })
      .then(function () {
        if (!t.kac) { hedefGoster(t.n); return C.soyle('p_tam_' + t.n); }
        return kartSor(t.n, 'p_kac_var', function () { return say(true); }).then(function () { hedefGoster(t.n); return C.soyle('p_tam_' + t.n); });
      })
      .then(kutla).then(ovgu).then(selam);
  }
  /* 2. basamak: bileti olan biner. kac: önce "Kaç yolcunun bileti var?" */
  function biletTuru(t) {
    mod = 'bilet'; peronKur(t.n + t.fazla, t.n); turHata = 0;
    var s = C.bekle(400).then(function () { return kural('p_bilet_kural'); });
    if (t.kac) s = s.then(function () { return kartSor(t.n, 'p_bilet_kac', biletleriSay, true); });
    return s.then(function () { return ilkDokunma(t); })
      .then(function () { isaretle(); return deneme(t.n, 'p_bilet_kural'); })
      .then(function () { hedefGoster(t.n); return C.soyle('p_tam_' + t.n); })
      .then(kutla)
      .then(function () {
        var k = bekleyenlerElSallar();
        if (k && !bekleyenDedi) { bekleyenDedi = true; return C.soyle('p_bilet_bekle').then(ovgu); }
        return ovgu();
      }).then(selam);
  }
  /* 3. basamak: N yolcu bindir (on koltuk); bos: "Kaç koltuk boş kaldı?" sorusu */
  function olsunTuru(t) {
    mod = 'olsun'; peronKur(Math.min(10, t.n + 2)); turHata = 0;
    var s = C.bekle(400);
    if (t.giris) s = s.then(function () { return kural('p_bes_tren'); });
    return s.then(function () { hedefGoster(t.n); return C.soyle(t.son ? 'p_son_' + t.n : 'p_hedef_' + t.n); })
      .then(function () { return ilkDokunma(t); })
      .then(function () { isaretle(); return deneme(t.n, t.son ? 'p_son_' + t.n : 'p_hedef_' + t.n); })
      .then(function () { return C.soyle('p_tam_' + t.n); })
      .then(function () {
        if (!t.bos || t.n >= koltuklar.length) return bosAnlat(t.n);
        koltuklar.forEach(function (k) { if (!k.yolcu) k.el.classList.add('bos-parla'); });
        return kartSor(koltuklar.length - t.n, 'p_bos_kac', bosSay).then(function () { return bosAnlat(t.n); });
      })
      .then(kutla).then(ovgu).then(selam);
  }
  /* 3. basamak: trende yolcu var, hedefe tamamlanır (üzerine sayma) */
  function tamamlaTuru(t) {
    mod = 'olsun'; peronKur(Math.min(10, t.olsun + 2)); hazirOturt(t.var_); turHata = 0;
    return C.bekle(400).then(function () { return C.soyle('p_tamamla'); }).then(function () { return say(true); })
      .then(function () { hedefGoster(t.olsun); return C.soyle('p_olsun_' + t.olsun); })
      .then(function () { return deneme(t.olsun, 'p_olsun_' + t.olsun); })
      .then(function () { return C.soyle('p_tam_' + t.olsun); })
      .then(function () { return bosAnlat(t.olsun); })
      .then(kutla).then(ovgu).then(selam);
  }
  /* Kıkır'ın turu: basamağa göre yanlışı farklıdır.
     1: bir koltuğu boş bırakır · 2: bileti olmayan bir yolcuyu bindirir · 3: bir yolcu fazla bindirir */
  function kikirTuru(bas, n) {
    var s, hatirlat;
    turHata = 0;
    if (bas === 1) { mod = 'esle'; peronKur(n); hatirlat = 'p_her_koltuk'; }
    else if (bas === 2) { mod = 'bilet'; peronKur(n + 2, n); hatirlat = 'p_bilet_kural'; }
    else { mod = 'olsun'; peronKur(7); hatirlat = 'p_hedef_5'; }
    kikirEl.classList.add('icerde');
    s = C.bekle(1200).then(function () { return C.soyle('k_sira_ben'); });
    if (bas === 3) s = s.then(function () { hedefGoster(n); return C.soyle('p_hedef_' + n); });
    return s.then(function () {
      var secilen;
      if (bas === 1) secilen = peron.slice(0, n - 1);
      else if (bas === 2) {
        var bl = peron.filter(function (y) { return y.bilet; }), bs = peron.filter(function (y) { return !y.bilet; });
        secilen = C.karistir(bl.slice(0, n - 1).concat([bs[0]]));
      } else secilen = peron.slice(0, n + 1);
      var k = Promise.resolve();
      secilen.forEach(function (y) { k = k.then(function () { return bindir(y, true); }).then(function () { return C.bekle(140); }); });
      return k;
    }).then(function () { return C.soyle(bas === 1 ? 'k_bos_bitti' : bas === 2 ? 'k_bilet_bitti' : 'k_bindirdim'); })
      .then(function () { kapiEl.classList.add('nabiz'); return deneme(n, hatirlat, true); })
      .then(function () { if (bas !== 3) hedefGoster(n); return C.soyle(bas === 2 ? 'p_bilet_ovgu' : 'p_tam_' + n); })
      .then(function () { return bas === 3 ? bosAnlat(n) : null; })
      .then(kutla).then(function () { return C.soyle('k_tesekkur'); })
      .then(function () { if (bas === 2) bekleyenlerElSallar(); return selam(); })
      .then(function () { kikirEl.classList.remove('icerde'); });
  }

  /* Pıtır'ın gösterisi: basamağın kuralını bir kez yaparak gösterir */
  function gosteri(bas) {
    var n = bas === 1 ? 2 : 3, s; sonN = n;
    turHata = 0;
    if (bas === 1) { mod = 'esle'; peronKur(n); s = C.soyle('p_ben_once').then(function () { kuralSay.p_her_koltuk = 1; return C.soyle('p_esle_ben'); }); }
    else if (bas === 2) { mod = 'bilet'; peronKur(n + 1, n); s = C.soyle('p_ben_once').then(function () { return kural('p_bilet_kural'); }); }
    else { mod = 'olsun'; peronKur(n + 2); s = C.soyle('p_ben_once').then(function () { kuralSay.p_bes_tren = 2; return C.soyle('p_bes_tren'); }).then(function () { hedefGoster(n); return C.soyle('p_hedef_' + n); }); }
    return s.then(function () {
      var k = Promise.resolve(), sira = peron.slice();
      if (bas === 2) {
        var bs = sira.filter(function (y) { return !y.bilet; })[0];
        k = k.then(function () { bs.el.classList.add('isaret'); geriSalla(bs); return C.soyle('p_bilet_yok'); }).then(function () { bs.el.classList.remove('isaret'); });
        sira = sira.filter(function (y) { return y.bilet; });
      }
      sira.slice(0, n).forEach(function (y) {
        k = k.then(function () { y.el.classList.add('isaret'); return C.bekle(450); })
          .then(function () { y.el.classList.remove('isaret'); return bindir(y, true); }).then(function () { return C.bekle(280); });
      });
      return k;
    }).then(function () { return C.soyle('p_demo_bitti'); })
      .then(function () { kapiEl.classList.add('vur'); C.efekt('tiktik'); return C.bekle(600); })
      .then(function () { kapiEl.classList.remove('vur'); return say(); })
      .then(function () { C.efekt('dogru'); hedefGoster(n); return C.soyle('p_tam_' + n); })
      .then(function () {
        if (bas === 3) return bosAnlat(n);
        if (bas === 2) { bekleyenlerElSallar(); bekleyenDedi = true; return C.soyle('p_bilet_bekle'); }
      }).then(selam);
  }

  /* ---------- tur planı ve uyarlama ---------- */
  var bas = 1, dz = 0, seri = 0, zor = 0, kacOk = false, sonN = 0, ilkCocuk = true;
  function farkli(liste) { var l = liste.filter(function (x) { return x !== sonN; }); var n = C.sec(l.length ? l : liste); sonN = n; return n; }
  function planla() {
    var t = { ilk: ilkCocuk, bas: bas }; ilkCocuk = false;
    if (bas === 1) {
      t.tip = 'esle'; t.kac = dz % 2 === 1;
      t.n = farkli(dz === 0 ? [2, 3] : dz === 1 ? [3, 4] : [3, 4, 5]);
      t.dizi = [t.n];
    } else if (bas === 2) {
      t.tip = 'bilet'; t.kac = dz % 2 === 1;
      t.n = farkli(dz === 0 ? [3, 4, 5] : dz === 1 ? [4, 5, 6] : [5, 6, 7, 8]);
      t.fazla = Math.min(2, 10 - t.n); t.dizi = besli(t.n);
    } else {
      var tipler = ['olsun', 'tamamla', 'olsun'];
      t.tip = tipler[dz % 3]; t.giris = dz === 0; t.dizi = [5, 5];
      if (t.tip === 'tamamla') { t.var_ = C.sec([3, 4, 5]); t.olsun = farkli([6, 7, 8]); }
      else { t.n = farkli(dz === 0 ? [4, 5, 6] : [6, 7, 8]); t.bos = dz % 2 === 0; }
    }
    dz++;
    return t;
  }
  function turOynat(t) {
    if (t.tip === 'esle') return esleTuru(t);
    if (t.tip === 'bilet') return biletTuru(t);
    if (t.tip === 'tamamla') return tamamlaTuru(t);
    return olsunTuru(t);
  }
  /* tur sonucu: üst üste iki temiz tur → bir üst basamak; üst üste iki zor tur → bir alt basamak */
  function uyarla(t) {
    var gecis = 0; turKaydi.push([t.tip, bas, t.n || t.olsun, turHata]);
    if (turHata === 0) { seri++; zor = 0; if (t.kac) kacOk = true; }
    else { seri = 0; zor = turHata >= 2 ? zor + 1 : 0; }
    if (seri >= 3 && bas < 3 && (bas !== 1 || kacOk)) { bas++; dz = 0; seri = 0; kacOk = false; gecis = bas; }
    else if (zor >= 2 && bas > 1) { bas--; dz = 1; zor = 0; }
    try { localStorage.setItem('bt_yt_basamak', String(bas)); } catch (e) {}
    return gecis;
  }

  /* turlar arası: eski tren gider, yeni tren (yeni koltuk düzeniyle) gelir; gelirken isteğe bağlı konuşma */
  function turArasi(yeniDizi, biletYerli, gelirken) {
    hedefGizle(); kilitle(true); kapiEl.classList.remove('nabiz');
    return C.soyle('p_kalkiyor').then(function () { return trenGonder(); })
      .then(function () {
        peronKur(0); etiketleriSil();
        var gel = trenGetir(yeniDizi, biletYerli);
        var konus = typeof gelirken === 'function' ? C.bekle(300).then(gelirken) : null;
        return Promise.all([gel, konus]);
      });
  }

  /* ---------- giriş ---------- */
  function giris() {
    var g = C.el('div', 'giris', '<div class="kapi-buyuk"><div class="kasa"></div><div class="kanat">' + kapiSVG() + '</div></div>');
    g.appendChild(C.karakter('pitir', KR + 'pitir_on.webp', 'pitir-g'));
    g.querySelector('.kasa').appendChild(C.karakter('tikir', KR + 'tikir_on.webp', 'tikir-g'));
    A.appendChild(g);
    var kanat = g.querySelector('.kanat');
    return C.bekle(500)
      .then(function () { kanat.classList.add('vur'); C.efekt('tiktik'); return C.soyle('t_tiktik'); })
      .then(function () { kanat.classList.remove('vur'); return C.soyle('p_kimo'); })
      .then(function () { g.classList.add('acildi'); return C.bekle(900); })
      .then(function () { return C.soyle('t_ben_tikir'); })
      .then(function () { return C.soyle('p_hosgeldin'); })
      .then(function () { g.classList.add('git'); return C.bekle(600); })
      .then(function () { g.remove(); });
  }

  function hareketAni() {
    var s = C.soyle('p_hareket');
    C.bekle(3600).then(function zipla(i) {
      i = typeof i === 'number' ? i : 0; if (i > 2) return;
      pitirEl.classList.remove('zipla'); void pitirEl.offsetWidth; pitirEl.classList.add('zipla');
      return C.bekle(450).then(function () { return zipla(i + 1); });
    });
    return s.then(function () { return C.bekle(800); }).then(function () { pitirEl.classList.remove('zipla'); });
  }

  /* ---------- oyun ---------- */
  var SEVIYELER = [['minik', 'Minik', '3-4 yaş', 1], ['orta', 'Orta', '4-5 yaş', 2], ['buyuk', 'Büyük', '5-6 yaş', 3]];
  var BAS = { minik: 1, orta: 2, buyuk: 3 };
  function oyun(Cati) {
    C = Cati; A = C.oyunAlani;
    var sv0 = C.tekrar && C.oncekiSeviye ? Promise.resolve(C.oncekiSeviye) :
      giris().then(function () { pitirEl.querySelector('img').src = KR + 'pitir_el_salliyor.webp'; return C.soyle('p_merhaba'); })
        .then(function () { pitirEl.querySelector('img').src = KR + 'pitir_on.webp'; return C.seviyeSec({ ses: 't_secim3', seviyeler: SEVIYELER, ciz: seviyeCiz }); });
    var siradaki;
    function sonraki(gelirken) {
      siradaki = planla();
      return turArasi(siradaki.dizi, siradaki.tip === 'bilet', gelirken);
    }
    function cocukTuru(gelirken) {
      return sonraki(gelirken).then(function () { return turOynat(siradaki); }).then(function () { return uyarla(siradaki); });
    }
    function gecisSesi(g) { return g ? function () { return C.soyle(g === 2 ? 'p_gecis_2' : 'p_gecis_3'); } : null; }
    return sv0
      .then(function (sv) {
        C.seviye = sv; bas = BAS[sv] || 1;
        if (C.tekrar) { try { var b = +localStorage.getItem('bt_yt_basamak'); if (b >= 1 && b <= 3) bas = b; } catch (e) {} }
        biletKur();
        return trenGetir(bas === 1 ? [2] : bas === 2 ? [3] : [5, 5], bas === 2);
      })
      .then(function () {
        if (C.tekrar) return null;
        return gosteri(bas);
      })
      .then(function () { return cocukTuru(C.tekrar ? null : function () { return C.soyle('p_sira_sende'); }); })
      .then(function (g) { return cocukTuru(g ? gecisSesi(g) : hareketAni); })
      .then(function (g) {
        var gs = gecisSesi(g), b = bas, n = b === 3 ? 5 : C.sec(b === 1 ? [3, 4] : [4, 5]);
        return turArasi(b === 3 ? [5, 5] : [n], b === 2, gs)
          .then(function () { return kikirTuru(b, n); });
      })
      .then(function () { return cocukTuru(); })
      .then(function (g) { return cocukTuru(gecisSesi(g)); })
      .then(function (g) {
        // son durak: 1. basamakta beş koltuk beş yolcu; 2. basamakta on bilet on koltuk; 3. basamakta on yolcu
        var son = bas === 1 ? { tip: 'esle', n: 5, dizi: [5] } : bas === 2 ? { tip: 'bilet', n: 10, fazla: 0, dizi: [5, 5] } : { tip: 'olsun', n: 10, son: true, dizi: [5, 5] };
        return turArasi(son.dizi, son.tip === 'bilet', gecisSesi(g)).then(function () {
          if (son.tip === 'olsun') return olsunTuru(son);
          if (son.tip === 'bilet') return biletTuru(son);
          mod = 'esle'; peronKur(5); turHata = 0;
          return C.bekle(400).then(function () { return C.soyle('p_son_5'); })
            .then(function () { return deneme(5, 'p_her_koltuk'); })
            .then(function () { hedefGoster(5); return C.soyle('p_tam_5'); }).then(kutla).then(selam);
        });
      })
      .then(function () {
        hedefGizle(); kilitle(true);
        var uzun = koltuklar.length === 10;
        var sarki = C.soyle(uzun ? 'sarki_buyuk' : 'sarki_minik');
        var git = C.bekle(1200).then(function () { return trenGonder(uzun ? 10500 : 9000); });
        return Promise.all([sarki, git]);
      })
      .then(function () { peronKur(0); finalKutla(); return C.bekle(600).then(function () { return C.soyle('t_bilet_doldu'); }); })
      .then(function () { return C.soyle('t_sef'); })
      .then(function () { bilet.classList.remove('merkez'); return C.soyle('p_kapanis'); })
      .then(function () {
        return C.bitis({
          cikartma: KR + 'pitir_el_salliyor.webp',
          aile: 'Bu oyunda sayma becerisi üç basamakta ilerler: önce her koltuğa bir yolcu oturtulur (birebir eşleme), sonra bileti olan yolcular biner (iki grubu eşleme), en son istenen sayıda yolcu bindirilir ve boş kalan koltuklar konuşulur (parça-bütün). Çocuk üst üste üç turu ilk denemede doğru yaptığında oyun bir üst basamağa geçer, zorlandığında bir alt basamağa döner. Evde sofrayı kurarken her tabağa bir kaşık koymak, sınıfta her sandalyeye bir çocuk oturtup sonunda "Kaç kişiyiz?" diye sormak aynı beceriyi destekleyebilir. MEB Okul Öncesi Eğitim Programı: MAB.1, MAB.2.',
          klip: '../../index.html#sarkilar',
          sesler: ['p_ekransiz', 'p_tur_daha']
        });
      });
  }

  /* test ve geliştirme için durum özeti (oyunu etkilemez) */
  window.__YT = function () {
    return { bas: bas, mod: mod, hedef: aktifHedef, kart: kartDogru, kapi: !!kapiBekleyen && !kilit, koltuk: koltuklar.length,
      oturan: koltuktakiler().length, biletsiz: koltuktakiler().filter(function (k) { return !k.yolcu.bilet; }).length, kayit: turKaydi };
  };

  Cati.baslat({
    id: 'yolcu-treni',
    ad: 'Yolcu Treni',
    alan: 'sayilar',
    altyaziUstte: true,
    evSahibiGorsel: KR + 'pitir_el_salliyor.webp',
    hazir: function (Cati) { C = Cati; A = C.oyunAlani; sahneKur(); },
    oyun: oyun
  });
})();
