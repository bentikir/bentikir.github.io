/* Yolcu Treni v1 · Ben Tıkır oyunları (6 Kasım 2026)
   Alan: Sayılar · Ev sahibi: Pıtır · Hedef: 1-10 sayma, birebir eşleme
   Akış: kapı (Tık tık / Kim o / Ben Tıkır / Hoş geldin) → seviye → Pıtır önce yapar →
   çocuk turu → hareket anı → Kıkır'ın turu (bir yolcu fazla bindirir, çocuk düzeltir) →
   çocuk turu (daha zor) → şarkı anı ile tren kalkar → kapanış ve ekransız görev. */
(function () {
  'use strict';
  var KR = '../../assets/karakterler/';
  var H = window.HAYVANLAR;
  var C, A;               // Cati ve oyun alanı
  var tren, trenX = 0, vagonSay = 1, koltuklar = [], peron = [], hedefEl, kapiEl, pitirEl, kikirEl;
  var kilit = true, kapiBekleyen = null, sonHareket = 0;
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

  function trenSVG(n) {
    var W = 236 + n * 414, s = '<svg class="govde" width="' + W + '" height="190" viewBox="0 0 ' + W + ' 190">';
    // lokomotif
    s += '<rect x="56" y="6" width="34" height="46" rx="6" fill="#3B3355"/><rect x="48" y="2" width="50" height="12" rx="5" fill="#3B3355"/>' +
      '<rect x="8" y="56" width="120" height="100" rx="20" fill="#E5484D" stroke="#3B3355" stroke-width="4"/>' +
      '<rect x="80" y="24" width="140" height="132" rx="16" fill="#E5484D" stroke="#3B3355" stroke-width="4"/>' +
      '<rect x="70" y="16" width="160" height="18" rx="8" fill="#3B3355"/>' +
      '<rect x="92" y="40" width="86" height="78" rx="14" fill="#CFEFFF" stroke="#3B3355" stroke-width="4"/>' +
      '<rect x="8" y="120" width="212" height="12" fill="#F8D86A"/>' +
      '<path d="M8 150 L-6 168 H40z" fill="#3B3355"/>';
    [40, 112, 184].forEach(function (cx, i) { s += teker(cx, 162, i === 0 ? 20 : 24, '#E5484D'); });
    for (var v = 0; v < n; v++) {
      var x = 236 + v * 414, renk = v === 0 ? '#F8C33A' : '#4FA9F2', koyu = v === 0 ? '#E0A41C' : '#2F86D6';
      s += '<rect x="' + (x - 14) + '" y="128" width="20" height="10" rx="4" fill="#3B3355"/>';
      s += '<rect x="' + x + '" y="20" width="404" height="134" rx="18" fill="' + renk + '" stroke="#3B3355" stroke-width="4"/>' +
        '<rect x="' + (x - 4) + '" y="12" width="412" height="18" rx="9" fill="' + koyu + '" stroke="#3B3355" stroke-width="4"/>' +
        '<rect x="' + x + '" y="124" width="404" height="10" fill="' + koyu + '"/>';
      for (var k = 0; k < 5; k++) s += '<rect x="' + (x + 22 + k * 76) + '" y="38" width="64" height="76" rx="12" fill="#FFF9F0" stroke="#3B3355" stroke-width="3.5"/>';
      s += teker(x + 60, 162, 20, koyu) + teker(x + 110, 162, 20, koyu) + teker(x + 294, 162, 20, koyu) + teker(x + 344, 162, 20, koyu);
    }
    return s + '</svg>';
    function teker(cx, cy, r, renk) {
      return '<g class="teker"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#3B3355"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 7) + '" fill="' + renk + '"/><circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#3B3355"/></g>';
    }
  }

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
  function trenGetir(n) {
    vagonSay = n; koltuklar = [];
    tren.innerHTML = trenSVG(n);
    var W = 236 + n * 414; trenX = Math.round((1280 - W) / 2);
    tren.style.width = W + 'px'; tren.style.left = trenX + 'px';
    var sur = C.el('div', 'surucu'); sur.appendChild(C.karakter('tikir', KR + 'tikir_on.webp', 'surucu-ic')); tren.appendChild(sur);
    for (var i = 0; i < n * 5; i++) {
      var v = Math.floor(i / 5), k = i % 5;
      var ko = C.el('div', 'koltuk', '<span class="etiket"></span>');
      ko.style.left = (236 + v * 414 + 22 + k * 76) + 'px';
      tren.appendChild(ko); koltuklar.push({ el: ko, yolcu: null });
    }
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

  /* ---------- yolcular ---------- */
  function peronKur(say) {
    peron.forEach(function (y) { if (y.el.parentNode) y.el.remove(); });
    peron = [];
    var adlar = C.karistir(H.adlar).slice(0, say);
    // peron: Pıtır (sol) ile Kıkır/kapı (sağ) arasında; 6'dan fazla yolcu iki sıra
    var alanSol = 214, alanSag = 925, iki = say > 6, sirada = iki ? Math.ceil(say / 2) : say;
    var en = iki ? 100 : 122, adim = Math.min(128, (alanSag - alanSol) / sirada);
    adlar.forEach(function (ad, i) {
      var sira = iki ? (i < sirada ? 0 : 1) : 0, k = iki ? (sira ? i - sirada : i) : i, buSira = iki && sira ? say - sirada : sirada;
      var bas = alanSol + ((alanSag - alanSol) - adim * buSira) / 2 + (iki && sira ? adim * 0.4 : 0);
      var boy = en * 412 / 260;
      var y = { ad: ad, en: en, slot: { x: bas + k * adim + (adim - en) / 2, y: (iki ? (sira ? 714 : 626) : 702) - boy * 400 / 412 }, koltuk: -1 };
      y.el = C.el('div', 'yolcu', '<div class="ic">' + H.img(ad) + '</div>');
      y.el.style.width = en + 'px'; y.el.style.height = boy + 'px'; y.el.style.zIndex = iki && sira ? 12 : 11;
      y.el.style.left = y.slot.x + 'px'; y.el.style.top = y.slot.y + 'px';
      y.el.querySelector('.ic').style.animationDelay = (-Math.random() * 2.6) + 's';
      surukleBagla(y); A.appendChild(y.el); peron.push(y);
    });
  }
  function koltuktakiler() { return koltuklar.filter(function (k) { return k.yolcu; }); }
  function bosKoltuk() { for (var i = 0; i < koltuklar.length; i++) if (!koltuklar[i].yolcu) return i; return -1; }
  function koltukMerkezi(i) { var ko = koltuklar[i].el; return { x: trenX + parseFloat(ko.style.left) + 32, y: 296 + 36 + 40 }; }
  /* koltukta: yalnız baş ve gövdenin üstü pencereden görünür */
  function oturanHTML(ad) {
    var b = H.bilgi(ad), f = 58 / (120 * b.boy) * (ad === 'zurafa' ? 0.95 : 1), w = 260 * f, h = 412 * f;
    return '<div class="pencere"><img src="hayvan/' + ad + '.webp" alt="" draggable="false" style="width:' + w + 'px;left:' + (32 - 130 * f) + 'px;top:' + (40 - b.bas * h) + 'px"></div>';
  }
  /* uçarken: tam boy, başın yeri hedefe gider */
  function ucanHTML(ad) { return H.img(ad); }
  function etiketleriSil() { koltuklar.forEach(function (k) { var e = k.el.querySelector('.etiket'); e.classList.remove('gor', 'parla'); }); }

  /* yolcu uçuşu: (x1,y1) ve (x2,y2) başın ortası; e1/e2 görsel eni */
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
  }
  /* turun başında trende hazır oturan yolcular */
  function hazirOturt(n) {
    peron.slice(0, n).forEach(function (y, i) { koltuklar[i].yolcu = y; y.koltuk = i; y.el.style.opacity = '0'; y.el.style.pointerEvents = 'none'; koltugaKoy(y, i); });
  }
  function bas_(y) { return basNoktasi(y); }

  function bindir(y) {
    var i = bosKoltuk(); if (i < 0 || y.koltuk >= 0) return Promise.resolve(false);
    etiketleriSil(); dokundu();
    koltuklar[i].yolcu = y; y.koltuk = i;
    var r = bas_(y);
    if (y.el.style.transform) { var m = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(y.el.style.transform); if (m) { r.x += +m[1]; r.y += +m[2]; } }
    y.el.style.opacity = '0'; y.el.style.pointerEvents = 'none'; y.el.style.transform = '';
    var h = koltukMerkezi(i), b = H.bilgi(y.ad); C.efekt('pop');
    return uc(y.ad, r.x, r.y, h.x, h.y, y.en, 260 * 58 / (120 * b.boy)).then(function () {
      if (y.koltuk !== i) return true;
      koltugaKoy(y, i); return true;
    });
  }
  function indir(y) {
    if (y.koltuk < 0) return Promise.resolve();
    etiketleriSil(); dokundu();
    var i = y.koltuk, h = koltukMerkezi(i);
    koltuklar[i].yolcu = null; y.koltuk = -1;
    if (y.oturan) { y.oturan.remove(); y.oturan = null; }
    C.efekt('geri');
    var b = H.bilgi(y.ad), p = bas_(y);
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

  /* ---------- pekiştirme: bilet damgası, düdük, buhar ----------
     Her doğru turda: Pıtır sayıyı söyler, tren düdük çalar, bacadan yıldızlı buhar çıkar,
     Tıkır sevinir ve biletteki bir daire damgalanır. Puan ve süre yok; 5 damga dolunca rol övgüsü gelir. */
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
  /* süreç övgüsü: her doğru turda, tekrar etmeden sırayla (karışık) */
  var OVGU = ['p_bravo_1', 'p_bravo_2', 'p_bravo_3', 'p_bravo_4', 'p_bravo_5', 'p_ovgu_1', 'p_ovgu_2', 'p_ovgu_3', 'p_ovgu_4'], ovguSira = [];
  function ovgu() {
    if (!ovguSira.length) { ovguSira = OVGU.slice().sort(function () { return Math.random() - 0.5; }); }
    return C.soyle(ovguSira.shift());
  }
  function sevin(el) { if (!el) return; el.classList.remove('zipla'); void el.offsetWidth; el.classList.add('zipla'); setTimeout(function () { el.classList.remove('zipla'); }, 700); }
  /* büyük damga: ekranın ortasında belirir, basılır, sonra bilete uçar */
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
  /* bilet doldu: büyük final */
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
  function say() {
    var l = koltuktakiler(), sira = C.soyle('p_sayalim');
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

  /* ---------- tur ---------- */
  var kim_ = '';
  function kapiyiBekle(hedef) {
    return new Promise(function (bitti) {
      kapiBekleyen = bitti; kilitle(false); dokundu();
      var hatirlatti = 0;
      (function bak() {
        if (!kapiBekleyen) return;
        var bos = performance.now() - sonHareket;
        if (!C.durdumu() && bos > 13000 && hatirlatti < 3) {
          hatirlatti++; dokundu();
          var n = koltuktakiler().length;
          if (n === hedef) { kapiEl.classList.add('nabiz'); C.soyle('p_tiktik'); }
          else C.soyle(kim_ === 'son' ? 'p_son_' + hedef : kim_ === 'tamamla' ? 'p_olsun_' + hedef : 'p_hedef_' + hedef);
        }
        setTimeout(bak, 500);
      })();
    });
  }

  function birlikteYap(hedef) {
    var s = C.soyle('p_birlikte');
    return s.then(function adim() {
      var l = koltuktakiler();
      if (l.length > hedef) return indir(l[l.length - 1].yolcu).then(function () { return C.bekle(250); }).then(adim);
      if (l.length < hedef) {
        var p = peron.filter(function (y) { return y.koltuk < 0; })[0];
        return bindir(p).then(function () { return C.bekle(250); }).then(adim);
      }
    }).then(say).then(function () { return C.soyle('p_birlikte_bitti'); });
  }

  function tur(hedef, kim, ilkCocukTuru) {
    peronKur(Math.min(koltuklar.length, 10, hedef + 2));
    var deneme = 0; kim_ = kim;
    return C.bekle(400).then(function () {
      if (kim === 'kikir') { kikirEl.classList.add('icerde'); return C.bekle(800).then(function () { return C.soyle('k_sira_ben'); }); }
      if (kim === 'pitir') return C.soyle('p_ben_once');
    }).then(function () { hedefGoster(hedef); return C.soyle(kim === 'son' ? 'p_son_' + hedef : 'p_hedef_' + hedef); })
      .then(function () {
        if (kim === 'pitir') {
          var s = Promise.resolve();
          peron.slice(0, hedef).forEach(function (y) {
            s = s.then(function () { y.el.classList.add('isaret'); return C.bekle(500); })
              .then(function () { y.el.classList.remove('isaret'); return bindir(y); }).then(function () { return C.bekle(300); });
          });
          return s.then(function () { return C.soyle('p_demo_bitti'); })
            .then(function () { kapiEl.classList.add('vur'); C.efekt('tiktik'); return C.bekle(600); })
            .then(function () { kapiEl.classList.remove('vur'); return say(); })
            .then(function () { C.efekt('dogru'); return C.soyle('p_tam_' + hedef); });
        }
        if (kim === 'kikir') {
          var k = Promise.resolve();
          peron.slice(0, hedef + 1).forEach(function (y) { k = k.then(function () { return bindir(y); }).then(function () { return C.bekle(120); }); });
          return k.then(function () { return C.soyle('k_bindirdim'); }).then(function () { kapiEl.classList.add('nabiz'); return dongu(); });
        }
        var t = Promise.resolve();
        if (ilkCocukTuru) t = C.soyle(C.seviye === 'buyuk' ? 'p_tasi' : 'p_dokun').then(function () { return C.soyle('p_tiktik'); });
        return t.then(function () { peron[0].el.classList.add('isaret'); setTimeout(function () { peron.forEach(function (y) { y.el.classList.remove('isaret'); }); }, 2600); return dongu(); });
      })
      .then(function () {
        koltuktakiler().forEach(function (k) { if (k.yolcu.oturan) k.yolcu.oturan.classList.add('selam'); });
        return C.bekle(400);
      });

    function dongu() {
      return kapiyiBekle(hedef).then(say).then(function (n) {
        if (n === hedef) {
          C.efekt('dogru');
          return C.soyle('p_tam_' + hedef).then(kutla).then(function () {
            if (kim === 'kikir') return C.soyle('k_tesekkur');
            return ovgu();
          });
        }
        deneme++;
        var fark = n > hedef ? 'p_fazla' : 'p_eksik', d;
        if (kim === 'kikir' && deneme === 1) d = C.soyle(fark);
        else if (deneme === 1) d = C.soyle('p_ipucu_bak').then(function () { return C.soyle(kim === 'son' ? 'p_olsun_' + hedef : 'p_hedef_' + hedef); });
        else if (deneme === 2) d = C.soyle(fark).then(function () { return C.soyle('p_strateji'); });
        else return birlikteYap(hedef);
        return d.then(dongu);
      });
    }
  }

  /* Turlar arası: önce eski tren gider; yeni tren gelirken (isteğe bağlı) Pıtır konuşur.
     Böylece "Şimdi sıra sende" ya da "Yeni tren geliyor" eski tren hâlâ duruyorken söylenmez. */
  function turArasi(gelirken) {
    hedefGizle(); kilitle(true);
    return C.soyle('p_kalkiyor').then(function () { return trenGonder(); })
      .then(function () {
        peronKur(0); etiketleriSil();
        var gel = trenGetir(vagonSay);
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

  /* ---------- hareket anı ---------- */
  function hareketAni() {
    var s = C.soyle('p_hareket');
    // son üç sözcükte (bir, iki, üç) Pıtır üç kez zıplar
    C.bekle(3600).then(function zipla(i) {
      i = typeof i === 'number' ? i : 0; if (i > 2) return;
      pitirEl.classList.remove('zipla'); void pitirEl.offsetWidth; pitirEl.classList.add('zipla');
      return C.bekle(450).then(function () { return zipla(i + 1); });
    });
    return s.then(function () { return C.bekle(800); }).then(function () { pitirEl.classList.remove('zipla'); });
  }

  /* ---------- "Kaç yolcu var?" turu: trende hazır yolcular, çocuk doğru sayı kartına dokunur ---------- */
  function kacTuru(n) {
    peronKur(Math.min(10, n)); hazirOturt(n);
    var secenek = [n], adaylar = C.karistir([n - 2, n - 1, n + 1, n + 2].filter(function (x) { return x >= 1 && x <= 10; }));
    secenek.push(adaylar[0], adaylar[1]); secenek = C.karistir(secenek);
    var kutu = C.el('div', 'kartlar');
    secenek.forEach(function (s) {
      var nk = ''; for (var i = 0; i < s; i++) nk += '<i></i>';
      var b = C.el('button', 'kart', '<span class="rakam">' + s + '</span><span class="noktalar">' + nk + '</span>');
      b.setAttribute('aria-label', String(s)); b.dataset.s = s; kutu.appendChild(b);
    });
    A.appendChild(kutu);
    var yanlis = 0;
    return C.bekle(500).then(function () { return C.soyle('p_kac_var'); }).then(function bekle() {
      return new Promise(function (sec) {
        kutu.classList.add('acik');
        Array.prototype.forEach.call(kutu.children, function (b) { b.onclick = function () { if (!kutu.classList.contains('acik')) return; kutu.classList.remove('acik'); C.efekt('secim'); sec(b); }; });
      }).then(function (b) {
        if (+b.dataset.s === n) {
          b.classList.add('dogru');
          return say().then(function () { C.efekt('dogru'); return C.soyle('p_tam_' + n); }).then(kutla)
            .then(ovgu);
        }
        yanlis++; b.classList.add('salla'); setTimeout(function () { b.classList.remove('salla'); }, 600);
        return C.soyle('p_bir_daha').then(say).then(function () {
          if (yanlis >= 2) { var d = kutu.querySelector('[data-s="' + n + '"]'); d.classList.add('ipucu'); }
          return bekle();
        });
      });
    }).then(function () { return C.bekle(500); }).then(function () { kutu.remove(); });
  }

  /* ---------- "Tamamla" turu: trende birkaç yolcu var, hedefe tamamlanır ---------- */
  function tamamlaTuru(var_, olsun) {
    peronKur(Math.min(10, olsun + 2)); hazirOturt(var_);
    var deneme = 0; kim_ = 'tamamla';
    return C.bekle(400).then(function () { return C.soyle('p_tamamla'); }).then(say)
      .then(function () { hedefGoster(olsun); return C.soyle('p_olsun_' + olsun); })
      .then(function dongu() {
        return kapiyiBekle(olsun).then(say).then(function (n) {
          if (n === olsun) { C.efekt('dogru'); return C.soyle('p_tam_' + olsun).then(kutla).then(function () { return ovgu(); }); }
          deneme++;
          var fark = n > olsun ? 'p_fazla' : 'p_eksik';
          if (deneme === 1) return C.soyle('p_ipucu_bak').then(function () { return C.soyle('p_olsun_' + olsun); }).then(dongu);
          if (deneme === 2) return C.soyle(fark).then(function () { return C.soyle('p_strateji'); }).then(dongu);
          return birlikteYap(olsun);
        });
      })
      .then(function () { koltuktakiler().forEach(function (k) { if (k.yolcu.oturan) k.yolcu.oturan.classList.add('selam'); }); return C.bekle(400); });
  }

  /* ---------- oyun ----------
     Minik (1 vagon, 1-5) ve Büyük (2 vagon, 1-10) aynı sırayı izler:
     Pıtır gösterir → bindir → hareket anı → Kıkır'ın yanlışı → tamamla → kaç yolcu var → son durak (5 ya da 10) → şarkı. */
  function oyun(Cati) {
    C = Cati; A = C.oyunAlani;
    var buyuk, h;
    var bas = C.tekrar && C.oncekiSeviye ? Promise.resolve(C.oncekiSeviye) :
      giris().then(function () { pitirEl.querySelector('img').src = KR + 'pitir_el_salliyor.webp'; return C.soyle('p_merhaba'); })
        .then(function () { pitirEl.querySelector('img').src = KR + 'pitir_on.webp'; return C.seviyeSec({ ses: 't_secim' }); });
    return bas
      .then(function (sv) {
        buyuk = sv === 'buyuk'; C.seviye = sv;
        var tv = buyuk ? C.sec([3, 4]) : C.sec([1, 2]);
        h = buyuk ? { demo: 3, bindir: C.sec([4, 5, 6]), kikir: 5, tamVar: tv, tamOlsun: C.sec([7, 8, 9]), kac: C.sec([6, 7, 8, 9]), son: 10 }
          : { demo: 2, bindir: C.sec([1, 2, 3]), kikir: 3, tamVar: tv, tamOlsun: C.sec([3, 4]), kac: C.sec([2, 3, 4, 5]), son: 5 };
        if (!buyuk && h.tamOlsun <= h.tamVar) h.tamOlsun = h.tamVar + 2;
        biletKur();
        return trenGetir(buyuk ? 2 : 1);
      })
      .then(function () { return C.tekrar ? null : tur(h.demo, 'pitir').then(function () { return turArasi(function () { return C.soyle('p_sira_sende'); }); }); })
      .then(function () { return tur(h.bindir, 'cocuk', true); })
      .then(function () { return turArasi(hareketAni); })
      .then(function () { return tur(h.kikir, 'kikir'); })
      .then(function () { kikirEl.classList.remove('icerde'); return turArasi(); })
      .then(function () { return tamamlaTuru(h.tamVar, h.tamOlsun); })
      .then(turArasi)
      .then(function () { return kacTuru(h.kac); })
      .then(turArasi)
      .then(function () { return tur(h.son, 'son'); })
      .then(function () {
        hedefGizle(); kilitle(true);
        var sarki = C.soyle(buyuk ? 'sarki_buyuk' : 'sarki_minik');
        var git = C.bekle(1200).then(function () { return trenGonder(buyuk ? 10500 : 9000); });
        return Promise.all([sarki, git]);
      })
      .then(function () { peronKur(0); finalKutla(); return C.bekle(600).then(function () { return C.soyle('t_bilet_doldu'); }); })
      .then(function () { return C.soyle('t_sef'); })
      .then(function () { bilet.classList.remove('merkez'); return C.soyle('p_kapanis'); })
      .then(function () {
        return C.bitis({
          cikartma: KR + 'pitir_el_salliyor.webp',
          aile: 'Evde 5-10 oyuncağı sıraya dizin ve birlikte sayın. Her oyuncağa dokunarak tek bir sayı söylemek (birebir eşleme) sayma becerisinin temelidir. "Tekrar oyna" her seferinde yeni sayılarla başlar.',
          klip: '../../index.html#sarkilar',
          sesler: ['p_ekransiz', 'p_tur_daha']
        });
      });
  }

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
