/* Ben Tıkır · Oyun çatısı v1 (6 Kasım 2026)
   Her oyun bu dosyayı yükler ve Cati.baslat({...}) çağırır.
   Çatının yaptıkları: sahneyi ekrana sığdırma, başlangıç ekranı (Oyna + müzik/efekt/konuşma/altyazı
   düğmeleri), seviye seçimi (Minik/Büyük, cihazda hatırlanır), sesli cümleler ve altyazı,
   sentezlenmiş kısa efektler, sekme değişince duraklatma, kapanış ekranı ve çıkartma defteri.
   Oyunun kendisi yalnız kendi sahnesini ve mekaniğini yazar. */
(function () {
  'use strict';
  var K = {};
  window.Cati = K;

  /* ---------- küçük yardımcılar ---------- */
  function oku(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function yaz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function el(etiket, sinif, html) { var d = document.createElement(etiket); if (sinif) d.className = sinif; if (html != null) d.innerHTML = html; return d; }
  K.el = el;
  K.sec = function (dizi) { return dizi[Math.floor(Math.random() * dizi.length)]; };
  K.karistir = function (dizi) { var a = dizi.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  var IK = {
    oyna: '<svg viewBox="0 0 40 40"><path d="M12 7l22 13-22 13z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>',
    muzik: '<svg viewBox="0 0 40 40" fill="#fff"><path d="M15 8l17-4v22a5 5 0 1 1-3-4.6V11l-11 2.6V30a5 5 0 1 1-3-4.6z"/></svg>',
    efekt: '<svg viewBox="0 0 40 40" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"><path d="M8 26l9-9 4 4 11-11"/><circle cx="31" cy="9" r="3" fill="#fff"/><path d="M6 33h28"/></svg>',
    konusma: '<svg viewBox="0 0 40 40" fill="#fff"><path d="M6 9a5 5 0 0 1 5-5h18a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H18l-8 7v-7h1a5 5 0 0 1-5-5z"/><circle cx="14" cy="15" r="2.4" fill="#2F7FD6"/><circle cx="20" cy="15" r="2.4" fill="#2F7FD6"/><circle cx="26" cy="15" r="2.4" fill="#2F7FD6"/></svg>',
    altyazi: '<svg viewBox="0 0 40 40"><rect x="4" y="8" width="32" height="24" rx="5" fill="#fff"/><path d="M10 18h8M22 18h8M10 24h14M27 24h3" stroke="#2F7FD6" stroke-width="3" stroke-linecap="round"/></svg>',
    ev: '<svg viewBox="0 0 40 40" fill="none" stroke="#2A2345" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"><path d="M6 19L20 7l14 12"/><path d="M10 16v16h20V16"/><path d="M17 32v-8h6v8"/></svg>',
    ayar: '<svg viewBox="0 0 40 40"><path d="M20 4l3 4.5 5.3-1.3.9 5.4 5.1 2-2.4 4.9 2.4 4.9-5.1 2-.9 5.4-5.3-1.3L20 36l-3-4.5-5.3 1.3-.9-5.4-5.1-2 2.4-4.9-2.4-4.9 5.1-2 .9-5.4 5.3 1.3z" fill="#2A2345"/><circle cx="20" cy="20" r="6" fill="#fff"/></svg>',
    tamekran: '<svg viewBox="0 0 40 40" fill="none" stroke="#2A2345" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15V7h8M33 15V7h-8M7 25v8h8M33 25v8h-8"/></svg>',
    tekrar: '<svg viewBox="0 0 40 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M31 14a12 12 0 1 0 2 9"/><path d="M33 6v8h-8"/></svg>',
    oyunlar: '<svg viewBox="0 0 40 40" fill="#fff"><rect x="5" y="5" width="13" height="13" rx="4"/><rect x="22" y="5" width="13" height="13" rx="4"/><rect x="5" y="22" width="13" height="13" rx="4"/><rect x="22" y="22" width="13" height="13" rx="4"/></svg>',
    klip: '<svg viewBox="0 0 40 40"><rect x="4" y="8" width="32" height="24" rx="7" fill="#fff"/><path d="M17 14l9 6-9 6z" fill="#E85F37"/></svg>'
  };
  K.IK = IK;

  /* ---------- ayarlar ---------- */
  var ayar = Object.assign({ muzik: true, efekt: true, konusma: true, altyazi: true }, oku('bt_ayar') || {});
  K.ayar = ayar;
  function ayarKaydet() { yaz('bt_ayar', ayar); }

  /* ---------- duraklatma ve bekleme ---------- */
  var durdu = false, devamListesi = [];
  function duraklamaBitsin() { return new Promise(function (r) { devamListesi.push(r); }); }
  K.bekle = function (ms) {
    return new Promise(function (bitti) {
      var kalan = ms, son = performance.now();
      (function adim() {
        if (durdu) { duraklamaBitsin().then(function () { son = performance.now(); adim(); }); return; }
        var simdi = performance.now(); kalan -= (simdi - son); son = simdi;
        if (kalan <= 0) bitti(); else setTimeout(adim, Math.min(40, kalan));
      })();
    });
  };
  K.durdumu = function () { return durdu; };

  /* ---------- sesler ---------- */
  var cumleler = {}, onbellek = {}, calan = null;
  function sesNesnesi(src) {
    if (!onbellek[src]) { var a = new Audio(); a.preload = 'auto'; a.src = src + (src.indexOf('?') < 0 ? '?v=' + (window.BT_SURUM || 1) : ''); onbellek[src] = a; }
    return onbellek[src];
  }
  function sesCal(src) {
    return new Promise(function (bitti) {
      var a = sesNesnesi(src), tamam = false;
      function son() { if (tamam) return; tamam = true; a.removeEventListener('ended', son); a.removeEventListener('error', son); if (calan === a) calan = null; bitti(); }
      a.addEventListener('ended', son); a.addEventListener('error', son);
      try { a.currentTime = 0; } catch (e) {}
      calan = a;
      var p = a.play();
      if (p && p.catch) p.catch(function () { setTimeout(son, 900); });
    });
  }

  var altyaziEl, sahne;
  function altyaziGoster(metin) {
    if (!altyaziEl) return;
    if (!metin || !ayar.altyazi) { altyaziEl.classList.remove('gor'); return; }
    altyaziEl.textContent = metin; altyaziEl.classList.add('gor');
  }
  function konusan(kim, acik) {
    if (!sahne || !kim) return;
    var l = sahne.querySelectorAll('[data-kim="' + kim + '"]');
    for (var i = 0; i < l.length; i++) l[i].classList.toggle('konusuyor', acik);
  }

  /* Bir cümleyi seslendirir (dizi verilirse içlerinden birini seçer). Bitince çözülür. */
  K.soyle = function (id) {
    if (Array.isArray(id)) id = K.sec(id);
    var c = cumleler[id];
    if (!c) { console.warn('Cümle yok:', id); return K.bekle(200); }
    var izin = c.muzik ? ayar.muzik : ayar.konusma;
    altyaziGoster(c.metin); konusan(c.kim, true);
    var is = izin ? sesCal(c.ses) : K.bekle(Math.max(1400, c.metin.length * 70));
    if (!c.muzik) dudak(c.kim, izin ? c.zarf : null, izin ? sesNesnesi(c.ses) : null);
    return is.then(function () { dudakDur(c.kim); konusan(c.kim, false); altyaziGoster(''); return K.bekle(140); });
  };
  K.cumle = function (id) { return cumleler[id]; };

  /* ---------- karakterler ve dudak hareketi ----------
     Her karakter görselinde ağzın yeri (görselin kendi pikselleriyle): x0,y0,x1,y1, görsel eni-boyu, ten renkleri, ağız çizgisi.
     Konuşurken asıl ağız (görselden kesilmiş) aşağı doğru açılıp kapanır; arkasında ten rengi ve kapalı ağız çizgisi durur. */
  var AGIZ = {
    pitir_on:          { b: [216, 336, 309, 368], w: 524, h: 600, t1: '#fed97e', t2: '#fed36d', c: '#7A4E1E' },
    pitir_el_salliyor: { b: [216, 335, 308, 380], w: 550, h: 600, t1: '#fed97f', t2: '#fed368', c: '#7A4E1E' },
    kikir_on:          { b: [224, 327, 318, 358], w: 542, h: 600, t1: '#fec1d4', t2: '#feb8ce', c: '#8A3456' },
    tikir_on:          { b: [231, 273, 329, 307], w: 560, h: 571, t1: '#8fe3da', t2: '#86e0d6', c: '#1F6A66' }
  };
  K.AGIZ = AGIZ;
  function agizKur(govde) {
    var img = govde.querySelector('img'), eski = govde.querySelector('.bt-agiz');
    if (eski) eski.remove();
    var ad = (img.getAttribute('src') || '').split('/').pop().replace(/\.(webp|png)$/, ''), a = AGIZ[ad];
    if (!a) return;
    var b = a.b, bw = b[2] - b[0], bh = b[3] - b[1];
    var d = el('div', 'bt-agiz');
    d.style.cssText = 'left:' + (b[0] / a.w * 100) + '%;top:' + (b[1] / a.h * 100) + '%;width:' + (bw / a.w * 100) + '%;height:' + (bh / a.h * 100) + '%';
    d.innerHTML = '<div class="ten" style="background:linear-gradient(' + a.t1 + ',' + a.t2 + ')"></div>' +
      '<svg class="kapali" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M8 10 Q50 40 92 10" fill="none" stroke="' + a.c + '" stroke-width="7" stroke-linecap="round"/></svg>' +
      '<div class="acik" style="background-image:url(' + img.getAttribute('src') + ');background-size:' + (a.w / bw * 100) + '% ' + (a.h / bh * 100) + '%;background-position:' + (b[0] / (a.w - bw) * 100) + '% ' + (b[1] / (a.h - bh) * 100) + '%"></div>';
    govde.appendChild(d);
  }
  /* Konuşabilen karakter kutusu: <div class="bt-kar" data-kim><div class="govde"><img>…</div></div> */
  K.karakter = function (kim, gorsel, sinif) {
    var d = el('div', 'bt-kar ' + (sinif || ''), '<div class="govde"><img src="' + gorsel + '" alt=""></div>');
    d.setAttribute('data-kim', kim);
    var g = d.firstChild, img = g.firstChild;
    img.addEventListener('load', function () { agizKur(g); });
    agizKur(g);
    new MutationObserver(function () { agizKur(g); }).observe(img, { attributes: true, attributeFilter: ['src'] });
    return d;
  };
  var acikDongu = null;
  function dudak(kim, zarf, sesEl) {
    if (acikDongu) cancelAnimationFrame(acikDongu);
    var t0 = performance.now();
    (function adim() {
      var v;
      if (sesEl && zarf) { var i = Math.floor(sesEl.currentTime * 25); v = i < zarf.length ? (+zarf.charAt(i)) / 9 : 0; }
      else { var t = (performance.now() - t0) / 1000; v = Math.max(0, Math.sin(t * 14) * 0.6 + Math.sin(t * 5.3) * 0.4); }
      if (durdu) v = 0;
      var l = sahne.querySelectorAll('[data-kim="' + kim + '"] .bt-agiz');
      var o = v <= 0.02 ? 0.06 : 0.12 + 1.18 * Math.pow(v, 0.75);
      for (var j = 0; j < l.length; j++) l[j].style.setProperty('--ac', o.toFixed(2));
      acikDongu = requestAnimationFrame(adim);
    })();
  }
  function dudakDur(kim) {
    if (acikDongu) cancelAnimationFrame(acikDongu); acikDongu = null;
    var l = sahne.querySelectorAll('[data-kim="' + kim + '"] .bt-agiz');
    for (var j = 0; j < l.length; j++) l[j].style.removeProperty('--ac');
  }

  /* ---------- sentezlenmiş efektler (dosya gerekmez) ---------- */
  var ac = null;
  function baglam() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function ton(t0, frek, sure, tip, kazanc, frek2) {
    var c = ac, o = c.createOscillator(), g = c.createGain();
    o.type = tip || 'sine'; o.frequency.setValueAtTime(frek, t0);
    if (frek2) o.frequency.exponentialRampToValueAtTime(frek2, t0 + sure);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(kazanc || 0.25, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + sure + 0.02);
  }
  function gurultu(t0, sure, kesim, kazanc) {
    var c = ac, n = Math.floor(c.sampleRate * sure), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'lowpass'; f.frequency.value = kesim; g.gain.value = kazanc;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }
  K.efekt = function (ad) {
    if (!ayar.efekt) return;
    var c = baglam(); if (!c) return;
    var t = c.currentTime + 0.01;
    switch (ad) {
      case 'tiktik': [0, 0.2].forEach(function (d) { gurultu(t + d, 0.09, 1100, 0.9); ton(t + d, 170, 0.12, 'sine', 0.5, 90); }); break;
      case 'pop': ton(t, 380, 0.14, 'sine', 0.22, 880); break;
      case 'geri': ton(t, 700, 0.16, 'sine', 0.18, 300); break;
      case 'dogru': [523, 659, 784, 1047].forEach(function (f, i) { ton(t + i * 0.09, f, 0.35, 'triangle', 0.16); }); break;
      case 'say': ton(t, 988, 0.12, 'triangle', 0.12); break;
      case 'secim': ton(t, 660, 0.09, 'sine', 0.15, 990); break;
      case 'duduk': [0, 0.45].forEach(function (d) { ton(t + d, 440, 0.36, 'sawtooth', 0.05); ton(t + d, 554, 0.36, 'sawtooth', 0.05); ton(t + d, 659, 0.36, 'triangle', 0.06); }); break;
      case 'fanfar': [[523,0],[659,.12],[784,.24],[1047,.4],[784,.58],[1047,.7]].forEach(function (n) { ton(t + n[1], n[0], n[1] > .6 ? 0.6 : 0.22, 'triangle', 0.15); ton(t + n[1], n[0] * 2, 0.12, 'sine', 0.04); });
        for (var j = 0; j < 6; j++) ton(t + 0.85 + j * 0.06, 1500 + j * 260, 0.18, 'sine', 0.05); break;
      case 'damga': gurultu(t, 0.12, 700, 1.0); ton(t, 120, 0.18, 'sine', 0.5, 60); ton(t + 0.08, 1320, 0.25, 'triangle', 0.1); break;
      case 'cuf': for (var i = 0; i < 4; i++) gurultu(t + i * 0.22, 0.16, 2400, 0.35); break;
    }
  };

  /* ---------- konfeti: doğru yanıtta renkli kâğıt yağmuru (sadece görsel, puan yok) ---------- */
  K.konfeti = function (adet, x, y) {
    var R = ['#E5484D', '#F8B739', '#3DBE6E', '#3A8DDE', '#B15BD6', '#FF7F57', '#2FC4B2'];
    adet = adet || 60; x = x == null ? 640 : x; y = y == null ? 300 : y;
    for (var i = 0; i < adet; i++) {
      var k = document.createElement('i'); k.className = 'bt-konfeti' + (i % 4 === 0 ? ' yildiz' : '');
      var a = Math.random() * Math.PI * 2, h = 180 + Math.random() * 380;
      k.style.left = x + 'px'; k.style.top = y + 'px'; k.style.background = R[i % R.length];
      k.style.setProperty('--dx', Math.round(Math.cos(a) * h) + 'px');
      k.style.setProperty('--dy', Math.round(Math.sin(a) * h * 0.6 - 160) + 'px');
      k.style.setProperty('--dr', Math.round(Math.random() * 720 - 360) + 'deg');
      k.style.animationDelay = (Math.random() * 0.15) + 's';
      k.style.animationDuration = (1.5 + Math.random() * 0.8) + 's';
      K.oyunAlani.appendChild(k);
      (function (k) { setTimeout(function () { k.remove(); }, 2600); })(k);
    }
  };

  /* ---------- sahne ve ölçek ---------- */
  K.nokta = function (ev) {
    var r = K.oyunAlani.getBoundingClientRect(), p = ev.touches ? ev.touches[0] : ev;
    return { x: (p.clientX - r.left) / r.width * 1280, y: (p.clientY - r.top) / r.height * 720 };
  };
  /* Sahne yüksekliği 720; geniş ekranlarda (yatay telefon) sahne yanlara doğru genişler,
     oyun alanı (1280×720) ortada kalır. Böylece telefonda boş kenar kalmaz ve oyun ekranın boyunu doldurur. */
  K.genislik = 1280;
  function sigdir() {
    var en = window.innerWidth, boy = window.innerHeight;
    if (window.visualViewport) { en = window.visualViewport.width; boy = window.visualViewport.height; }
    var W = Math.max(1280, Math.min(1720, Math.round(720 * en / boy)));
    var s = Math.min(en / W, boy / 720);
    K.genislik = W;
    sahne.style.width = W + 'px'; sahne.style.height = '720px';
    sahne.style.transform = 'scale(' + s + ')';
    if (K.oyunAlani) K.oyunAlani.style.left = ((W - 1280) / 2) + 'px';
  }

  /* ---------- perdeler ---------- */
  function perde(id) { var p = el('div', 'bt-perde'); p.id = id; sahne.appendChild(p); return p; }
  function ac_(p) { p.classList.add('acik'); }
  function kapa(p) { p.classList.remove('acik'); }

  function ayarDugmeleri() {
    var kutu = el('div', 'bt-ayarlar');
    [['muzik', 'Müzik'], ['efekt', 'Ses efekti'], ['konusma', 'Konuşma'], ['altyazi', 'Altyazı']].forEach(function (a) {
      var b = el('button', 'bt-ayar', '<span class="ik">' + IK[a[0]] + '</span>' + a[1]);
      b.setAttribute('aria-pressed', ayar[a[0]] ? 'true' : 'false');
      b.addEventListener('click', function () {
        ayar[a[0]] = !ayar[a[0]]; ayarKaydet(); baglam(); K.efekt('secim');
        b.setAttribute('aria-pressed', ayar[a[0]] ? 'true' : 'false');
        if (a[0] === 'altyazi' && !ayar.altyazi) altyaziGoster('');
        if (calan && a[0] === 'konusma' && !ayar.konusma) calan.muted = true;
        if (calan && a[0] === 'konusma' && ayar.konusma) calan.muted = false;
      });
      kutu.appendChild(b);
    });
    return kutu;
  }

  var cfg, duraklatPerde, ust;
  function duraklat(goster) {
    if (durdu) return;
    durdu = true;
    if (calan) { try { calan.pause(); } catch (e) {} }
    if (ac && ac.state === 'running') ac.suspend();
    if (goster !== false) ac_(duraklatPerde);
  }
  function devam() {
    if (!durdu) return;
    durdu = false; kapa(duraklatPerde);
    if (ac) ac.resume();
    if (calan) { var p = calan.play(); if (p && p.catch) p.catch(function () {}); }
    var l = devamListesi; devamListesi = []; l.forEach(function (f) { f(); });
  }
  K.duraklat = duraklat; K.devam = devam;

  function tamEkran() {
    var d = document, e = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
    else if (e.requestFullscreen) e.requestFullscreen().catch(function () {});
    else if (e.webkitRequestFullscreen) e.webkitRequestFullscreen();
  }

  /* ---------- seviye seçimi ---------- */
  function treneCiz(vagon) {
    var s = '<svg viewBox="0 0 290 130"><rect x="0" y="112" width="290" height="6" rx="3" fill="#B9A58B"/>';
    s += '<rect x="8" y="42" width="62" height="62" rx="12" fill="#E5484D"/><rect x="20" y="52" width="38" height="30" rx="8" fill="#CFEFFF"/><rect x="24" y="22" width="14" height="24" rx="4" fill="#3B3355"/>';
    for (var v = 0; v < vagon; v++) {
      var x = 76 + v * 104;
      s += '<rect x="' + x + '" y="46" width="98" height="58" rx="12" fill="' + (v ? '#4FA9F2' : '#F8C33A') + '"/>';
      for (var k = 0; k < 3; k++) s += '<rect x="' + (x + 10 + k * 28) + '" y="56" width="22" height="24" rx="6" fill="#FFF9F0"/>';
    }
    var tek = [22, 90 + vagon * 104 - 60];
    for (var w = 0; w < 2 + vagon * 2; w++) s += '<circle cx="' + (22 + w * ((62 + vagon * 104) / (1 + vagon * 2))) + '" cy="108" r="9" fill="#3B3355"/>';
    return s + '</svg>';
  }
  K.seviyeSec = function (secenekler) {
    return new Promise(function (bitti) {
      var p = perde('bt-seviye'), kart = el('div', 'bt-kart');
      var onceki = oku('bt_seviye_' + cfg.id);
      var sira = el('div', 'bt-seviyeler');
      [['minik', 'Minik', '3-4 yaş', 1], ['buyuk', 'Büyük', '5-6 yaş', 2]].forEach(function (s) {
        var b = el('button', 'bt-seviye' + (onceki === s[0] ? ' onceki' : ''), treneCiz(s[3]) + '<span class="ad">' + s[1] + '</span><span class="yas">' + s[2] + '</span>');
        b.setAttribute('aria-label', s[1] + ' tren, ' + s[2]);
        b.addEventListener('click', function () { K.efekt('secim'); yaz('bt_seviye_' + cfg.id, s[0]); K.seviye = s[0]; kapa(p); setTimeout(function () { p.remove(); }, 300); bitti(s[0]); });
        sira.appendChild(b);
      });
      kart.appendChild(sira); p.appendChild(kart); ac_(p);
      if (secenekler && secenekler.ses) K.soyle(secenekler.ses);
    });
  };

  /* ---------- çıkartma defteri ---------- */
  K.cikartmaEkle = function () {
    var d = oku('bt_cikartmalar') || {};
    var o = d[cfg.id] || { ad: cfg.ad, kez: 0 };
    o.kez += 1; o.son = new Date().toISOString().slice(0, 10); d[cfg.id] = o; yaz('bt_cikartmalar', d);
    return o.kez;
  };

  /* ---------- kapanış ---------- */
  K.bitis = function (b) {
    return new Promise(function (bitti) {
      var p = perde('bt-bitis'), kart = el('div', 'bt-kart');
      var cik = el('div', 'bt-cikartma', '<img src="' + (b.cikartma || cfg.evSahibiGorsel) + '" alt="">');
      kart.appendChild(cik);
      if (b.aile) kart.appendChild(el('div', 'bt-aile', '<b>Aileye not:</b> ' + b.aile));
      var dg = el('div', 'bt-bitis-dugmeler');
      function dugme(etiket, ik, renk, fn, href) {
        var d = el(href ? 'a' : 'button', 'bt-buyuk-dugme', '<span class="ik" style="background:' + renk + '">' + IK[ik] + '</span>' + etiket);
        if (href) d.href = href; else d.addEventListener('click', fn);
        return d;
      }
      dg.appendChild(dugme('Tekrar oyna', 'tekrar', '#3DBE6E', function () { K.efekt('secim'); try { sessionStorage.setItem('bt_tekrar_' + cfg.id, '1'); } catch (e) {} location.reload(); }));
      dg.appendChild(dugme('Başka oyun', 'oyunlar', '#2F7FD6', null, cfg.oyunlarAdresi || '../../index.html#oyunlar'));
      if (b.klip) dg.appendChild(dugme('Klibi izle', 'klip', '#FF7F57', null, b.klip));
      kart.appendChild(dg); p.appendChild(kart);
      K.cikartmaEkle(); K.efekt('dogru'); ac_(p);
      var sira = Promise.resolve();
      (b.sesler || []).forEach(function (s) { sira = sira.then(function () { return K.soyle(s); }); });
      sira.then(bitti);
    });
  };

  /* ---------- başlangıç ---------- */
  K.baslat = function (c) {
    cfg = c;
    K.tekrar = false;
    try { K.tekrar = sessionStorage.getItem('bt_tekrar_' + c.id) === '1'; sessionStorage.removeItem('bt_tekrar_' + c.id); } catch (e) {}
    K.oncekiSeviye = oku('bt_seviye_' + c.id);
    document.documentElement.style.setProperty('--alan', 'var(--' + (c.alan || 'sayilar') + ')');
    document.documentElement.style.setProperty('--alan-a', 'var(--' + (c.alan || 'sayilar') + '-a)');
    cumleler = Object.assign({}, window.BT_CUMLELER || {});
    Object.keys(cumleler).forEach(function (k) { sesNesnesi(cumleler[k].ses); });

    var kap = el('div'); kap.id = 'bt-kap';
    sahne = el('div'); sahne.id = 'bt-sahne'; kap.appendChild(sahne); document.body.appendChild(kap);
    K.sahne = sahne;
    K.oyunAlani = el('div'); K.oyunAlani.style.cssText = 'position:absolute;top:0;left:0;width:1280px;height:720px'; sahne.appendChild(K.oyunAlani);

    ust = el('div', 'bt-ust');
    var ev = el('a', 'bt-yuvarlak', IK.ev); ev.href = c.oyunlarAdresi || '../../index.html#oyunlar'; ev.setAttribute('aria-label', 'Oyunlara dön');
    var logo = el('img', 'bt-logo'); logo.src = c.logo || '../../logo.webp'; logo.alt = 'Ben Tıkır';
    var ay = el('button', 'bt-yuvarlak', IK.ayar); ay.setAttribute('aria-label', 'Ayarlar');
    ay.addEventListener('click', function () { K.efekt('secim'); duraklat(); });
    var te = el('button', 'bt-yuvarlak', IK.tamekran); te.setAttribute('aria-label', 'Tam ekran');
    te.addEventListener('click', tamEkran);
    ust.appendChild(ev); ust.appendChild(logo); ust.appendChild(el('div', 'bosluk')); ust.appendChild(ay); ust.appendChild(te);
    sahne.appendChild(ust);

    altyaziEl = el('div'); altyaziEl.id = 'bt-altyazi'; if (c.altyaziUstte) altyaziEl.classList.add('ustte'); altyaziEl.setAttribute('aria-live', 'polite'); sahne.appendChild(altyaziEl);

    duraklatPerde = perde('bt-durdu');
    var dk = el('div', 'bt-kart');
    var dv = el('button', 'bt-oyna', IK.oyna + 'Devam'); dv.addEventListener('click', function () { K.efekt('secim'); devam(); });
    dk.appendChild(dv); dk.appendChild(ayarDugmeleri()); duraklatPerde.appendChild(dk);

    var bas = perde('bt-basla');
    var bk = el('div', 'bt-kart');
    if (c.evSahibiGorsel) { var im = el('img'); im.src = c.evSahibiGorsel; im.alt = ''; im.style.cssText = 'width:150px;margin-top:-110px;filter:drop-shadow(0 10px 10px rgba(0,0,0,.25))'; bk.appendChild(im); }
    bk.appendChild(el('h1', 'bt-baslik', c.ad));
    var oy = el('button', 'bt-oyna nabiz', IK.oyna + 'Oyna');
    bk.appendChild(oy); bk.appendChild(ayarDugmeleri()); bas.appendChild(bk); ac_(bas);
    oy.addEventListener('click', function () {
      baglam(); K.efekt('secim');
      Object.keys(onbellek).forEach(function (k) { onbellek[k].load(); });
      kapa(bas); setTimeout(function () { bas.remove(); }, 300);
      Promise.resolve(c.oyun(K)).catch(function (e) { console.error(e); });
    });

    var cev = el('div'); cev.id = 'bt-cevir';
    cev.innerHTML = '<div class="tel"></div><p>Telefonunu yan çevir,<br>tren sığsın!</p>';
    var yine = el('button', null, 'Böyle devam et'); yine.addEventListener('click', function () { document.body.classList.add('bt-dik-tamam'); });
    cev.appendChild(yine); document.body.appendChild(cev);

    document.addEventListener('visibilitychange', function () { if (document.hidden) duraklat(); });
    window.addEventListener('resize', sigdir);
    window.addEventListener('orientationchange', function () { setTimeout(sigdir, 250); setTimeout(sigdir, 700); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', sigdir);
    sigdir();
    if (c.hazir) c.hazir(K);
  };
})();
