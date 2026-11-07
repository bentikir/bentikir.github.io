/* Kıtır'ın Simit Fırını · Ben Tıkır oyunu v3 (7 Kasım 2026)
   Mekanik (M11 sipariş, PBS sipariş oyunlarındaki "fiş → hazırla → fırın → teslim" kalıbı):
   müşteri gelir, sipariş fişi asılır; çocuk hamuru yoğurur, tekneden istenen sayıda hamur alıp tepsiye koyar, zile basar,
   birlikte sayılır (oyunda sayma yalnız burada ve kapanışta); hamurlara şekil verir, simitleri pekmeze batırıp susama bular,
   fırına sürer, paket tezgâhında poşete koyar, müşteriye uzatır. Hışır poğaça ister.
   MEB: MAB.1 (sayma, sayı-miktar eşleme), TADB (dinleyip sırayla uygulama), sosyal-duygusal (nezaket, yardım). */
(function () {
  'use strict';
  var C = window.Cati;
  var KR = '../../assets/karakterler/';
  var A;

  /* ---------- konumlar (oyun alanı 1280×720) ---------- */
  var TEPSI = { x: 330, y: 505, w: 430, h: 190 };
  var MERKEZ = { x: 545, y: 600 };            // tepsi ortası (büyük simit)
  var FIRIN_AGIZ = { x: 170, y: 330 };
  var POSET = { x: 985, y: 600 };
  var TEKNE_S = { x: 118, y: 575 }, TEKNE_P = { x: 272, y: 590 };

  /* ---------- çizimler ---------- */
  function susamNoktalar(adet, r, renk, kenar) {
    var s = '';
    for (var i = 0; i < adet; i++) {
      var a = (i / adet) * Math.PI * 2 + 0.3 + (i % 2) * 0.12;
      var rr = r * (i % 2 ? 0.86 : 1.08);
      var x = 50 + Math.cos(a) * rr, y = 50 + Math.sin(a) * rr;
      s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="3.3" ry="2" transform="rotate(' + (a * 57.3 + 90).toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + renk + '" stroke="' + kenar + '" stroke-width=".6"/>';
    }
    return s;
  }
  /* durum: hamur | pekmez | susam | pismis ; susamsiz: susam turu için çıplak simit */
  var SIMIT_RENK = {
    hamur: ['#F6E3BE', '#E8CC97', '#C9A56A'],
    pekmez: ['#B8642E', '#8E4419', '#6A2E0E'],
    susam: ['#B8642E', '#8E4419', '#6A2E0E'],
    pismis: ['#D9893C', '#A9581F', '#77380F']
  };
  var sid = 0;
  function simitSVG(durum, susamsiz) {
    var g = SIMIT_RENK[durum] || SIMIT_RENK.hamur, id = 'sg' + (sid++);
    var tohum = '';
    if (!susamsiz && (durum === 'susam' || durum === 'pismis')) tohum = susamNoktalar(20, 28, durum === 'pismis' ? '#FBE6B4' : '#FFF6DC', durum === 'pismis' ? '#D2A55E' : '#E8D3A2');
    var parla = durum === 'hamur' ? 'rgba(255,255,255,.35)' : 'rgba(255,236,200,.55)';
    return '<svg viewBox="0 0 100 100"><defs><radialGradient id="' + id + '" cx="42%" cy="35%" r="70%"><stop offset="0" stop-color="' + g[0] + '"/><stop offset="1" stop-color="' + g[1] + '"/></radialGradient></defs>' +
      '<ellipse cx="50" cy="57" rx="45" ry="40" fill="rgba(60,30,10,.2)"/>' +
      '<path fill-rule="evenodd" d="M50 8a42 42 0 1 1 0 84a42 42 0 1 1 0-84zM50 36a14 14 0 1 0 0 28a14 14 0 1 0 0-28z" fill="url(#' + id + ')" stroke="' + g[2] + '" stroke-width="3"/>' +
      (durum === 'hamur' ? '<path d="M50 14a36 36 0 0 1 34 26M16 58a36 36 0 0 0 30 30" stroke="' + g[2] + '" stroke-width="2" fill="none" opacity=".35"/>' : '<path d="M30 20a36 36 0 0 1 44 2M18 64a36 36 0 0 0 18 20M70 80a36 36 0 0 0 16-22" stroke="' + g[2] + '" stroke-width="3" fill="none" opacity=".45"/>') +
      '<path d="M24 34q8-14 26-17" stroke="' + parla + '" stroke-width="5" fill="none" stroke-linecap="round"/>' + tohum + '</svg>';
  }
  function pogacaSVG(durum) {
    var g = durum === 'pismis' ? ['#F2B556', '#D98A2B', '#A9621B'] : ['#FBEBC6', '#EED39A', '#C9A35E'];
    var s = '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="76" rx="42" ry="12" fill="rgba(60,30,10,.18)"/>' +
      '<path d="M8 70Q8 22 50 20Q92 22 92 70Q92 80 50 80Q8 80 8 70z" fill="' + g[0] + '" stroke="' + g[2] + '" stroke-width="3"/>' +
      '<path d="M14 68Q50 78 86 68" stroke="' + g[1] + '" stroke-width="4" fill="none"/>' +
      '<path d="M26 40q10-12 26-12" stroke="rgba(255,255,255,.5)" stroke-width="5" fill="none" stroke-linecap="round"/>';
    if (durum === 'susam' || durum === 'pismis') [[40, 38], [56, 34], [64, 46], [46, 52], [32, 54], [70, 58], [54, 60]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.3" fill="#2A2345"/>'; });
    return s + '</svg>';
  }
  function hamurTopu(cx, cy, r, ton) {
    return '<ellipse cx="' + cx + '" cy="' + (cy + r * 0.55) + '" rx="' + r + '" ry="' + (r * 0.35) + '" fill="rgba(90,55,20,.18)"/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 0.82) + '" fill="' + (ton || '#F6E3BE') + '" stroke="#C9A56A" stroke-width="2.5"/>' +
      '<ellipse cx="' + (cx - r * 0.3) + '" cy="' + (cy - r * 0.3) + '" rx="' + (r * 0.35) + '" ry="' + (r * 0.2) + '" fill="rgba(255,255,255,.55)"/>';
  }
  /* dolu hamur teknesi: arkada sıra sıra, üst üste toplar; ön kenar topların önünde → derin ve dolu görünür */
  /* Hamur teknesi üç katman: arka gövde, büyük hamur kitlesi (küçülebilir), ön kenar ve etiket.
     Çocuk her dokunuşta büyük hamurdan bir parça koparır; kitle her parçada biraz küçülür (parça-bütün, MAB.2). */
  function tekneArka() {
    return '<svg viewBox="0 0 220 150" class="t-arka"><ellipse cx="110" cy="142" rx="104" ry="8" fill="rgba(42,35,69,.22)"/>' +
      '<path d="M6 52h208l-20 84H26z" fill="#A9703C" stroke="#6E4220" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M16 60h188" stroke="#7C4C24" stroke-width="3"/></svg>';
  }
  function kitleSVG(tur) {
    var t = tur === 'pogaca' ? ['#FBEBC6', '#EED39A', '#C9A35E'] : ['#F6E3BE', '#E8CC97', '#C9A56A'];
    return '<svg viewBox="0 0 220 150"><defs><radialGradient id="kt' + tur + '" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#FFF8EA"/><stop offset=".55" stop-color="' + t[0] + '"/><stop offset="1" stop-color="' + t[1] + '"/></radialGradient></defs>' +
      '<path d="M14 86Q8 30 62 14Q110 -6 158 12Q212 30 206 86Z" fill="url(#kt' + tur + ')" stroke="' + t[2] + '" stroke-width="3"/>' +
      '<path d="M52 40q24-16 56-14M122 24q28 0 48 18M64 60q22 10 48 4" stroke="' + t[2] + '" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>' +
      '<ellipse cx="76" cy="28" rx="26" ry="9" fill="rgba(255,255,255,.6)" transform="rotate(-12 80 34)"/>' +
      '<g fill="rgba(255,255,255,.85)"><circle cx="140" cy="40" r="2"/><circle cx="104" cy="50" r="1.6"/><circle cx="160" cy="58" r="1.8"/><circle cx="60" cy="58" r="1.5"/></g></svg>';
  }
  function tekneOn(tur) {
    var s = '<svg viewBox="0 0 220 150" class="t-on"><path d="M6 52h208l-6 26H12z" fill="#C0864C" stroke="#6E4220" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M20 64h180" stroke="#E2AE72" stroke-width="3" opacity=".7"/>' +
      '<path d="M12 78h196l-14 58H26z" fill="#B17842" stroke="#6E4220" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M30 96h160M34 116h152" stroke="#8E5A2C" stroke-width="3" opacity=".6"/>';
    if (tur === 'pogaca') s += '<rect x="64" y="96" width="92" height="26" rx="8" fill="#FFF4DC" stroke="#6E4220" stroke-width="3"/><text x="110" y="115" text-anchor="middle" font-size="17" font-weight="800" fill="#6E4220" font-family="Baloo 2, sans-serif">POĞAÇA</text>';
    else s += '<rect x="70" y="96" width="80" height="26" rx="8" fill="#FFF4DC" stroke="#6E4220" stroke-width="3"/><text x="110" y="115" text-anchor="middle" font-size="17" font-weight="800" fill="#6E4220" font-family="Baloo 2, sans-serif">SİMİT</text>';
    return s + '</svg>';
  }
  function tekneSVG(tur) { return tekneArka() + '<div class="kitle">' + kitleSVG(tur) + '</div>' + tekneOn(tur); }
  function kaseSVG(tur) {
    var ic = tur === 'pekmez' ? '<ellipse cx="60" cy="40" rx="46" ry="13" fill="#5A220C"/><ellipse cx="46" cy="37" rx="16" ry="4" fill="#9A4A22" opacity=".8"/>'
      : '<ellipse cx="60" cy="40" rx="46" ry="13" fill="#F3E2B6"/>' + Array(26).join('x').split('').map(function (_, i) { var x = 22 + (i * 37) % 76, y = 33 + (i * 13) % 14; return '<ellipse cx="' + x + '" cy="' + y + '" rx="3" ry="1.8" fill="#FFF8E6" stroke="#C9A35E" stroke-width=".6"/>'; }).join('');
    var renk = tur === 'pekmez' ? ['#3E7CB1', '#2A5A86'] : ['#E85F37', '#B8431F'];
    return '<svg viewBox="0 0 120 100"><ellipse cx="60" cy="92" rx="50" ry="7" fill="rgba(42,35,69,.2)"/>' +
      '<path d="M8 40Q12 88 60 88Q108 88 112 40z" fill="' + renk[0] + '" stroke="' + renk[1] + '" stroke-width="4"/>' +
      '<path d="M20 56Q60 70 100 56" stroke="#fff" stroke-width="5" opacity=".5" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>' +
      '<ellipse cx="60" cy="40" rx="52" ry="16" fill="' + renk[1] + '"/>' + ic + '</svg>';
  }
  function zilSVG() {
    return '<svg viewBox="0 0 120 110"><ellipse cx="60" cy="100" rx="50" ry="8" fill="rgba(42,35,69,.2)"/>' +
      '<rect x="10" y="80" width="100" height="16" rx="8" fill="#8A5A2B"/><rect x="10" y="80" width="100" height="6" rx="3" fill="#B07A43"/>' +
      '<path d="M18 80Q18 30 60 28Q102 30 102 80z" fill="#F4C542" stroke="#C9971B" stroke-width="4"/>' +
      '<path d="M34 64q2-22 22-26" stroke="#FFF1B8" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<rect x="52" y="12" width="16" height="18" rx="6" fill="#C9971B"/><circle cx="60" cy="10" r="8" fill="#F4C542" stroke="#C9971B" stroke-width="3"/></svg>';
  }
  function posetSVG() {
    return '<svg viewBox="0 0 160 190" class="poset-svg">' +
      '<path class="kulp" d="M50 46q0-34 30-34t30 34" stroke="#A8804C" stroke-width="7" fill="none"/>' +
      '<path d="M22 46L138 46L150 182L10 182z" fill="#D9B27C" stroke="#A8804C" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M22 46l-12 136M138 46l12 136" stroke="#C49A62" stroke-width="3"/>' +
      '<g class="ust-simit"><path fill-rule="evenodd" d="M80 18a26 26 0 1 1 0 52a26 26 0 1 1 0-52zM80 36a8 8 0 1 0 0 16a8 8 0 1 0 0-16z" fill="#C97A35" stroke="#77380F" stroke-width="3"/></g>' +
      '<path d="M22 46h116v14H22z" fill="#E8C792" stroke="#A8804C" stroke-width="4"/>' +
      '<circle cx="80" cy="118" r="30" fill="#FFF4E0"/><path fill-rule="evenodd" d="M80 98a20 20 0 1 1 0 40a20 20 0 1 1 0-40zM80 111a7 7 0 1 0 0 14a7 7 0 1 0 0-14z" fill="#C77A35"/>' +
      '<text x="80" y="170" text-anchor="middle" font-size="15" font-weight="800" fill="#8A5A2B" font-family="Baloo 2, sans-serif">KITIR FIRINI</text></svg>';
  }
  function firinSVG() {
    var s = '<svg viewBox="0 0 340 390" class="firin-svg"><defs>' +
      '<radialGradient id="korIc" cx="50%" cy="85%" r="70%"><stop offset="0" stop-color="#FFB040"/><stop offset=".45" stop-color="#C24A1C"/><stop offset="1" stop-color="#2C1712"/></radialGradient>' +
      '<linearGradient id="tas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9774A"/><stop offset="1" stop-color="#B85B34"/></linearGradient></defs>' +
      '<rect x="134" y="0" width="72" height="80" fill="#9C4A2C" stroke="#6E2F1A" stroke-width="4"/><rect x="126" y="0" width="88" height="14" fill="#7E3A22"/>' +
      '<path d="M8 390V186Q8 58 170 58Q332 58 332 186V390z" fill="url(#tas)" stroke="#6E2F1A" stroke-width="5"/>';
    for (var r = 0; r < 10; r++) {
      var y = 86 + r * 30;
      for (var c = 0; c < 7; c++) {
        var x = 16 + c * 48 + (r % 2) * 24;
        if (x > 300) continue;
        s += '<rect x="' + x + '" y="' + y + '" width="42" height="24" rx="5" fill="' + ((r + c) % 3 ? '#C9643B' : '#BC5833') + '" opacity=".75"/>';
      }
    }
    s += '<path d="M44 342V246Q44 168 170 168Q296 168 296 246V342z" fill="#6E2F1A"/>' +
      '<path class="agizlik" d="M60 340V250Q60 184 170 184Q280 184 280 250V340z" fill="url(#korIc)"/>' +
      '<g class="odun"><rect x="86" y="314" width="70" height="16" rx="8" fill="#5A3418" transform="rotate(-8 121 322)"/><rect x="180" y="316" width="72" height="16" rx="8" fill="#6A3E1C" transform="rotate(7 216 324)"/></g>' +
      '<g class="ates"><ellipse cx="130" cy="318" rx="30" ry="16" fill="#FF8A2B"/><ellipse cx="210" cy="318" rx="30" ry="16" fill="#FF8A2B"/><ellipse cx="170" cy="306" rx="40" ry="28" fill="#FFB238"/><ellipse cx="170" cy="314" rx="22" ry="13" fill="#FFE07A"/></g>' +
      '<g class="kivilcim"><circle cx="150" cy="280" r="3" fill="#FFD36A"/><circle cx="196" cy="270" r="2.5" fill="#FFD36A"/><circle cx="172" cy="256" r="2" fill="#FFE9A8"/></g>' +
      '<rect x="0" y="340" width="340" height="50" rx="8" fill="#8E3F24"/><rect x="0" y="340" width="340" height="10" rx="5" fill="#A9502F"/>' +
      '<g class="isi"><circle cx="300" cy="372" r="15" fill="#2A2345"/><circle cx="300" cy="372" r="11" fill="#FFF4E0"/><path class="ibre" d="M300 372l0-9" stroke="#E85F37" stroke-width="3" stroke-linecap="round"/></g></svg>';
    return s;
  }
  function tepsiSVG() {
    return '<svg viewBox="0 0 430 190" preserveAspectRatio="none"><rect x="4" y="14" width="422" height="172" rx="26" fill="rgba(42,35,69,.2)"/>' +
      '<rect x="4" y="4" width="422" height="172" rx="26" fill="#3E3A44" stroke="#24212A" stroke-width="5"/>' +
      '<rect x="18" y="18" width="394" height="144" rx="16" fill="#4E4A55"/><path d="M30 30h370" stroke="rgba(255,255,255,.12)" stroke-width="4"/></svg>';
  }
  function kurekSVG() {
    return '<svg viewBox="0 0 640 80"><rect x="430" y="30" width="210" height="20" rx="10" fill="#B07A43" stroke="#7A4E22" stroke-width="3"/><path d="M0 8h440v64H0z" fill="#D9A866" stroke="#7A4E22" stroke-width="4" rx="10"/></svg>';
  }
  function seviyeCiz(n) {
    var s = '<svg viewBox="0 0 290 130"><rect x="30" y="40" width="230" height="80" rx="16" fill="#4E4A55" stroke="#24212A" stroke-width="4"/>';
    var adet = n === 1 ? 3 : 8;
    for (var i = 0; i < adet; i++) {
      var col = i % 4, row = Math.floor(i / 4), cx = (n === 1 ? 95 + i * 50 : 70 + col * 50), cy = n === 1 ? 80 : 62 + row * 36;
      var rr = n === 1 ? 20 : 15;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="#D9893C" stroke="#77380F" stroke-width="3"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (rr * 0.36) + '" fill="#4E4A55"/>';
    }
    return s + '</svg>';
  }

  /* ---------- sahne ---------- */
  var M = {
    pitir: { img: 'pitir_on.webp', mer: 'p_fr_merhaba', tes: 'p_fr_tesekkur' },
    kikir: { img: 'kikir_on.webp', mer: 'k_fr_merhaba', tes: 'k_fr_tesekkur' },
    likir: { img: 'likir_on.webp', mer: 'l_fr_merhaba', tes: 'l_fr_tesekkur' },
    hisir: { img: 'hisir_on.webp', mer: 'h_fr_merhaba3', tes: 'h_fr_tesekkur3' },
    gicir: { img: 'gicir_on.webp', mer: 'g_fr_merhaba', tes: 'g_fr_tesekkur' }
  };
  var grupEl, kitirEl, firinEl, tepsiEl, zilEl, tekneS, tekneP, fisEl, musteriEl, posetEl, pekmezEl, susamEl, kurekEl;
  var SLOT = [];
  var tepside = [];
  var kilit = true, siparis = null, hata = 0, sonEylem = 0, asama = '';

  function dunyaCiz() {
    var d = C.el('div', 'dunya');
    var raf = '<div class="raf r1">' + [0, 1, 2].map(function (i) { return '<i class="ekmek e' + i + '"></i>'; }).join('') + '</div>' +
''; 
    var un = '<div class="cuval c1"><span>UN</span></div><div class="cuval c2"><span>UN</span></div><div class="cuval c3"><span>UN</span></div>';
    var kara = '<div class="kara-tahta"><div class="kt-baslik">BUGÜN</div><div class="kt-satir"><i class="kt-simit"></i><i class="kt-simit"></i><i class="kt-pogaca"></i></div></div>';
    var toz = ''; for (var i = 0; i < 16; i++) toz += '<i style="left:' + (240 + (i * 97) % 1260) + 'px;top:' + (120 + (i * 53) % 320) + 'px;animation-delay:' + (-i * 0.9).toFixed(1) + 's;animation-duration:' + (9 + (i % 5) * 2) + 's"></i>';
    d.innerHTML = '<div class="duvar"></div><div class="kiris"></div>' +
      '<div class="lamba l1"><i></i></div><div class="lamba l2"><i></i></div>' +
      '<div class="levha">Kıtır\'ın Fırını</div>' + kara + raf +
      '<div class="kapi"><i class="cam"></i><b class="tabela">AÇIK</b><u class="tokmak"></u></div>' +
      '<div class="pencere-d"><div class="sokak"></div><i></i><u></u></div>' + un +
      '<div class="arka-tezgah"></div><div class="odunluk"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<div class="un-tozu">' + toz + '</div><div class="sicak-isik"></div>';
    return d;
  }

  function kur() {
    A = C.oyunAlani;
    A.appendChild(dunyaCiz());
    firinEl = C.el('button', 'firin', firinSVG() + '<div class="kapak"></div><div class="pisme"><i></i></div>');
    firinEl.setAttribute('aria-label', 'Fırın'); A.appendChild(firinEl);
    pekmezEl = C.el('button', 'kase pekmez', kaseSVG('pekmez') + '<span>PEKMEZ</span>'); pekmezEl.setAttribute('aria-label', 'Pekmez kâsesi'); A.appendChild(pekmezEl);
    susamEl = C.el('button', 'kase susamk', kaseSVG('susam') + '<span>SUSAM</span>'); susamEl.setAttribute('aria-label', 'Susam kâsesi'); A.appendChild(susamEl);
    kitirEl = C.karakter('kitir', KR + 'kitir_on.webp', 'kitir'); A.appendChild(kitirEl);
    var tezgah = C.el('div', 'tezgah', '<div class="paket-tezgahi"><i></i><i></i><i></i></div>'); A.appendChild(tezgah);
    tekneS = C.el('button', 'tekne simit-tekne', tekneSVG('simit')); tekneS.setAttribute('aria-label', 'Simit hamuru'); A.appendChild(tekneS);
    tekneP = C.el('button', 'tekne pogaca-tekne gizli', tekneSVG('pogaca')); tekneP.setAttribute('aria-label', 'Poğaça hamuru'); A.appendChild(tekneP);
    /* tepsi, kürek ve tepsideki her şey tek bir grupta: fırına birlikte girip birlikte çıkarlar */
    grupEl = C.el('div', 'tepsi-grup'); A.appendChild(grupEl);
    kurekEl = C.el('div', 'kurek', kurekSVG()); grupEl.appendChild(kurekEl);
    tepsiEl = C.el('div', 'tepsi', tepsiSVG()); grupEl.appendChild(tepsiEl);
    zilEl = C.el('button', 'zil', zilSVG()); zilEl.setAttribute('aria-label', 'Zil'); A.appendChild(zilEl);
    posetEl = C.el('button', 'poset', posetSVG()); posetEl.setAttribute('aria-label', 'Poşet'); A.appendChild(posetEl);
    fisEl = C.el('div', 'fis'); A.appendChild(fisEl);
    var ray = C.el('div', 'fis-rayi'); A.appendChild(ray);
    for (var r = 0; r < 2; r++) for (var c = 0; c < 5; c++) SLOT.push({ x: TEPSI.x + 55 + c * 80, y: TEPSI.y + 55 + r * 80 });

    tekneS.addEventListener('pointerdown', function (e) { tekneDokun(e, 'simit'); });
    tekneP.addEventListener('pointerdown', function (e) { tekneDokun(e, 'pogaca'); });
    zilEl.addEventListener('click', zileBas);
    [firinEl, pekmezEl, susamEl, posetEl].forEach(function (el) { el.addEventListener('click', function () { hedefDokun(el); }); });
  }


  /* ---------- konuşma: hepsi tek sıradan; boştayken yinelenen ipuçları konuşma varken söylenmez ---------- */
  var konusma = 0;
  function S(id) {
    konusma++;
    return C.soyle(id).then(function () { konusma--; }, function () { konusma--; });
  }
  function bosta() { return konusma === 0 && !C.durdumu(); }

  /* ---------- tek dokunuş bekleyen hedefler (fırın, kâseler, poşet) ---------- */
  var hedef = null;
  function hedefDokun(el) {
    if (!hedef || hedef.el !== el || C.durdumu()) return;
    var h = hedef; hedef = null; clearInterval(h.izle); el.classList.remove('nabiz'); h.bitti();
  }
  /* Önce talimat biter, sonra hedef parlar ve dokunuş beklenir. 9 sn boş kalırsa talimat yinelenir. */
  /* soyle=false ise talimat söylenmez, yalnız hedef parlar (ilerleyen turlarda sessiz yönlendirme);
     çocuk 9 sn dokunmazsa talimat yine de söylenir. */
  function hedefIleAnlat(el, ses, soyle) {
    return (ses && soyle !== false ? S(ses) : Promise.resolve()).then(function () {
      return new Promise(function (bitti) {
        el.classList.add('nabiz');
        var h = { el: el, bitti: bitti, zaman: performance.now() }; hedef = h;
        h.izle = setInterval(function () {
          if (hedef !== h) { clearInterval(h.izle); return; }
          if (!bosta()) { h.zaman = performance.now(); return; }
          if (performance.now() - h.zaman > 9000) { h.zaman = performance.now() + 3000; if (ses) S(ses); }
        }, 500);
      });
    });
  }

  /* ---------- tepsi ---------- */
  function yuvaBul(tur) {
    var kullan = {}; tepside.forEach(function (t) { kullan[t.slot] = 1; });
    var bolgeli = siparis && siparis.s > 0 && siparis.p > 0;
    for (var i = 0; i < 10; i++) {
      if (kullan[i]) continue;
      if (bolgeli && tur === 'simit' && i >= 5) continue;
      if (bolgeli && tur === 'pogaca' && i < 5) continue;
      return i;
    }
    return -1;
  }
  function topSVG(tur) {
    return '<svg viewBox="0 0 100 100">' + hamurTopu(50, 52, 34, tur === 'pogaca' ? '#FBEBC6' : '#F6E3BE') + '</svg>';
  }
  function urunCiz(t) {
    if (t.durum === 'top') t.el.innerHTML = topSVG(t.tur);
    else t.el.innerHTML = t.tur === 'simit' ? simitSVG(t.durum) : pogacaSVG(t.durum);
  }
  function koy(tur, nereden) {
    var i = yuvaBul(tur);
    if (i < 0) { C.efekt('geri'); return null; }
    var s = SLOT[i], d = C.el('div', 'urun ' + tur);
    var t = { el: d, tur: tur, slot: i, durum: 'top' }; urunCiz(t);
    d.style.left = (s.x - 39) + 'px'; d.style.top = (s.y - 39) + 'px';
    tepside.push(t); kitleAyarla(tur, true);
    var n = nereden || (tur === 'simit' ? TEKNE_S : TEKNE_P);
    d.style.transition = 'none'; d.style.transform = 'translate(' + (n.x - s.x) + 'px,' + (n.y - s.y) + 'px) scale(.6)';
    grupEl.appendChild(d); d.getBoundingClientRect();
    d.style.transition = ''; d.style.transform = '';
    d.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      if (asama === 'sekil' && t.durum === 'top') { sekillendir(t); return; }
      if (!kilit && asama === 'koy') geriKoy(t);
    });
    C.efekt('pop');
    sonEylem = performance.now();
    return t;
  }
  function geriKoy(t) {
    var i = tepside.indexOf(t); if (i < 0) return;
    tepside.splice(i, 1); kitleAyarla(t.tur, false);
    var n = t.tur === 'simit' ? TEKNE_S : TEKNE_P, s = SLOT[t.slot];
    t.el.style.transform = 'translate(' + (n.x - s.x) + 'px,' + (n.y - s.y) + 'px) scale(.5)'; t.el.style.opacity = '0';
    C.efekt('geri'); setTimeout(function () { t.el.remove(); }, 380);
    sonEylem = performance.now();
  }
  function tepsiTemizle() { tepside.forEach(function (t) { t.el.remove(); }); tepside = []; }
  /* büyük hamurun boyu: tepsiye alınan her parça için biraz küçülür */
  function kitleAyarla(tur, kopar) {
    var tekne = tur === 'pogaca' ? tekneP : tekneS, k = tekne.querySelector('.kitle');
    var n = tepside.filter(function (t) { return t.tur === tur; }).length;
    k.style.setProperty('--olcek', Math.max(0.55, 1 - n * 0.045).toFixed(3));
    if (kopar) { k.classList.remove('kopar'); k.getBoundingClientRect(); k.classList.add('kopar'); }
  }
  function kitleYenile() {
    [['simit', tekneS], ['pogaca', tekneP]].forEach(function (x) {
      var k = x[1].querySelector('.kitle'); k.style.setProperty('--olcek', '1'); k.classList.remove('kopar'); k.getBoundingClientRect(); k.classList.add('yeni');
      setTimeout(function () { k.classList.remove('yeni'); }, 600);
    });
  }
  function hepsi() { return tepside.map(function (t) { return t.el; }); }
  function simitVar() { return tepside.some(function (t) { return t.tur === 'simit'; }); }

  /* tekneye dokunma: yoğurma aşamasında yoğurur, koyma aşamasında tepsiye hamur topu koyar (sürükleme de olur) */
  var yogurBekle = null;
  function tekneDokun(e, tur) {
    if (asama === 'yogur' && yogurBekle) { e.preventDefault(); yogurBekle(tur); return; }
    if (kilit || asama !== 'koy' || !siparis) return;
    if (tur === 'simit' && !(siparis.s > 0)) return;
    if (tur === 'pogaca' && !(siparis.p > 0)) return;
    e.preventDefault();
    var el = tur === 'simit' ? tekneS : tekneP;
    el.classList.remove('bas'); el.getBoundingClientRect(); el.classList.add('bas');
    var p0 = C.nokta(e), surDiv = null, hareket = false;
    function tasi(ev) {
      var p = C.nokta(ev);
      if (!hareket && Math.hypot(p.x - p0.x, p.y - p0.y) > 14) {
        hareket = true; surDiv = C.el('div', 'urun suruk ' + tur, topSVG(tur)); A.appendChild(surDiv);
      }
      if (surDiv) { surDiv.style.left = (p.x - 39) + 'px'; surDiv.style.top = (p.y - 39) + 'px'; }
    }
    function birak(ev) {
      window.removeEventListener('pointermove', tasi); window.removeEventListener('pointerup', birak); window.removeEventListener('pointercancel', birak);
      var p = ev.type === 'pointercancel' ? p0 : C.nokta(ev);
      if (!hareket) { koy(tur); return; }
      surDiv.remove();
      if (p.x > TEPSI.x - 20 && p.x < TEPSI.x + TEPSI.w + 20 && p.y > TEPSI.y - 40) koy(tur, p);
      else C.efekt('geri');
    }
    window.addEventListener('pointermove', tasi); window.addEventListener('pointerup', birak); window.addEventListener('pointercancel', birak);
  }

  /* ---------- aşama 1: yoğurma (sayma yok, yalnız yoğurma sesi ve un tozu) ---------- */
  function yogur(gosteri, soyle) {
    var tekne = siparis && !(siparis.s > 0) ? tekneP : tekneS, nokta = tekne === tekneP ? TEKNE_P : TEKNE_S;
    var k = 0;
    function bir() {
      k++; var kt = tekne.querySelector('.kitle'); kt.classList.remove('yogrul'); kt.getBoundingClientRect(); kt.classList.add('yogrul');
      C.efekt('blop'); un(nokta.x, nokta.y - 30);
    }
    if (gosteri) {
      return S('kt_d_yogur').then(function () {
        var p = Promise.resolve();
        [1, 2, 3].forEach(function () { p = p.then(function () { bir(); return C.bekle(600); }); });
        return p;
      });
    }
    return (soyle ? S('kt_yogur') : Promise.resolve()).then(function () {
      asama = 'yogur';
      return new Promise(function (bitti) {
        tekne.classList.add('nabiz');
        var zaman = performance.now();
        var izle = setInterval(function () {
          if (!bosta()) { zaman = performance.now(); return; }
          if (performance.now() - zaman > 9000) { zaman = performance.now() + 3000; S('kt_yogur'); }
        }, 500);
        yogurBekle = function (tur) {
          if (C.durdumu() || (tekne === tekneP) !== (tur === 'pogaca')) return;
          zaman = performance.now(); bir();
          if (k >= 3) { yogurBekle = null; clearInterval(izle); tekne.classList.remove('nabiz'); setTimeout(bitti, 450); }
        };
      });
    }).then(function () { asama = ''; return soyle ? S('kt_yogur_bitti') : C.bekle(300); });
  }
  function un(x, y) {
    for (var i = 0; i < 7; i++) {
      var d = C.el('i', 'un-puf'); d.style.left = (x + (Math.random() * 80 - 40)) + 'px'; d.style.top = (y + Math.random() * 20) + 'px';
      d.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px'); A.appendChild(d);
      setTimeout(function (e) { e.remove(); }.bind(null, d), 900);
    }
  }

  /* ---------- aşama 3: şekil verme (her hamur topuna bir dokunuş) ---------- */
  var sekilBitti = null;
  function sekillendir(t) {
    if (t.durum !== 'top') return;
    t.el.classList.remove('dokun'); t.el.classList.add('uzat'); C.efekt('pop'); un(SLOT[t.slot].x, SLOT[t.slot].y - 10);
    sonEylem = performance.now();
    t.durum = 'sekilleniyor';
    setTimeout(function () {
      t.durum = 'hamur'; urunCiz(t); t.el.classList.remove('uzat'); t.el.classList.add('oldu');
      setTimeout(function () { t.el.classList.remove('oldu'); }, 400);
      if (sekilBitti && tepside.every(function (x) { return x.durum === 'hamur'; })) { var f = sekilBitti; sekilBitti = null; setTimeout(f, 500); }
    }, 320);
  }
  function sekilVer(gosteri, soyle) {
    if (gosteri) {
      return S('kt_d_sekil').then(function () {
        var p = Promise.resolve();
        tepside.forEach(function (t) { p = p.then(function () { sekillendir(t); return C.bekle(600); }); });
        return p.then(function () { return C.bekle(300); });
      });
    }
    return (soyle ? S('kt_sekil') : Promise.resolve()).then(function () {
      asama = 'sekil';
      tepside.forEach(function (t) { t.el.classList.add('dokun'); });
      return new Promise(function (bitti) {
        sekilBitti = bitti; sonEylem = performance.now();
        var izle = setInterval(function () {
          if (!sekilBitti) { clearInterval(izle); return; }
          if (!bosta()) { sonEylem = performance.now(); return; }
          if (performance.now() - sonEylem > 9000) { sonEylem = performance.now() + 3000; S('kt_sekil'); }
        }, 500);
      });
    }).then(function () { asama = ''; tepside.forEach(function (t) { t.el.classList.remove('dokun'); }); });
  }

  /* ---------- aşama 4-5: pekmez ve susam (yalnız simitler) ---------- */
  function pekmezeBatir(gosteri, soyle) {
    var is = gosteri ? S('kt_d_pekmez').then(function () { pekmezEl.classList.add('bas'); return C.bekle(300); }) : hedefIleAnlat(pekmezEl, 'kt_pekmez', soyle);
    return is.then(function () {
      pekmezEl.classList.remove('bas'); C.efekt('blop');
      var p = Promise.resolve();
      tepside.filter(function (t) { return t.tur === 'simit'; }).forEach(function (t) {
        p = p.then(function () { t.el.classList.add('daldir'); return C.bekle(170); })
          .then(function () { t.durum = 'pekmez'; urunCiz(t); setTimeout(function () { t.el.classList.remove('daldir'); }, 200); });
      });
      return p.then(function () { return C.bekle(400); });
    });
  }
  function susamaBula(gosteri, soyle) {
    var is = gosteri ? S('kt_d_susam').then(function () { susamEl.classList.add('bas'); return C.bekle(300); }) : hedefIleAnlat(susamEl, 'kt_susam_bula', soyle);
    return is.then(function () {
      susamEl.classList.remove('bas');
      serp();
      return C.bekle(500);
    }).then(function () {
      tepside.forEach(function (t) { if (t.tur === 'simit') { t.durum = 'susam'; urunCiz(t); } });
      return C.bekle(500);
    });
  }
  function serp() {
    tepside.filter(function (t) { return t.tur === 'simit'; }).forEach(function (t) {
      var s = SLOT[t.slot];
      for (var i = 0; i < 6; i++) {
        var d = C.el('i', 'serpinti'); d.style.left = (s.x - 30 + Math.random() * 60) + 'px'; d.style.top = (s.y - 120) + 'px';
        d.style.setProperty('--dy', (90 + Math.random() * 40) + 'px'); d.style.animationDelay = (Math.random() * 0.25) + 's'; A.appendChild(d);
        setTimeout(function (e) { e.remove(); }.bind(null, d), 1100);
      }
    });
    C.efekt('serp');
  }

  /* ---------- aşama 6: fırın ---------- */
  function firinla(gosteri, hareketli, soyle) {
    var is = gosteri ? S('kt_d_firin') : hedefIleAnlat(firinEl, 'kt_firin', soyle);
    return is.then(function () {
      kilit = true;
      firinEl.classList.add('acik'); C.efekt('kapak');
      kurekEl.classList.add('gor');
      return C.bekle(300).then(function () {
        grupEl.classList.add('firinda');           // tepsi + ürünler + kürek birlikte içeri
        return C.bekle(900);
      }).then(function () {
        firinEl.classList.remove('acik'); firinEl.classList.add('kapali', 'pisiyor'); C.efekt('firin');
        var bekle = hareketli ? S('kt_hareket') : C.bekle(2400);
        if (hareketli) kitirEl.classList.add('yogur');
        return bekle.then(function () { kitirEl.classList.remove('yogur'); return C.bekle(300); });
      }).then(function () {
        tepside.forEach(function (t) { t.durum = 'pismis'; urunCiz(t); });   // içerideyken (görünmezken) pişer
        firinEl.classList.remove('kapali', 'pisiyor'); C.efekt('kapak');
        return C.bekle(350);
      }).then(function () {
        grupEl.classList.remove('firinda');        // hepsi birlikte dışarı
        return C.bekle(950);
      }).then(function () { kurekEl.classList.remove('gor'); tepsiEl.classList.add('buhar'); return C.bekle(300); });
    }).then(function () { return S('kt_pisti'); });
  }

  /* ---------- aşama 7: paketleme ve teslim (sayma yok) ---------- */
  function paketle(gosteri, soyle) {
    var is = gosteri ? S('kt_d_poset') : hedefIleAnlat(posetEl, 'kt_poset', soyle);
    return is.then(function () {
      tepsiEl.classList.remove('buhar');
      var l = tepside.slice().sort(function (a, b) { return a.slot - b.slot; }).map(function (t) { return t.el; });
      var p = Promise.resolve();
      l.forEach(function (e) {
        p = p.then(function () {
          var r = e.getBoundingClientRect(), a = A.getBoundingClientRect(), olc = a.width / 1280;
          var cx = (r.left - a.left + r.width / 2) / olc, cy = (r.top - a.top + r.height / 2) / olc;
          e.style.transition = 'transform .4s ease-in, opacity .4s ease-in';
          e.style.transform = 'translate(' + (POSET.x - cx) + 'px,' + (POSET.y - 60 - cy) + 'px) scale(.35)'; e.style.opacity = '0';
          posetEl.classList.remove('al'); posetEl.getBoundingClientRect(); posetEl.classList.add('al');
          return C.bekle(200);
        });
      });
      return p.then(function () { return C.bekle(400); }).then(function () { tepsiTemizle(); posetEl.classList.add('dolu'); C.efekt('pop'); return C.bekle(400); });
    }).then(function () {
      return gosteri ? C.bekle(200) : hedefIleAnlat(posetEl, 'kt_ver', soyle);
    }).then(function () {
      posetEl.classList.add('ver'); C.efekt('pop');
      return C.bekle(800);
    });
  }
  function posetSifirla() { posetEl.classList.remove('dolu', 'ver', 'al', 'gidiyor'); }

  /* ---------- müşteri ve fiş ---------- */
  function musteriGetir(kim) {
    musteriEl = C.karakter(kim, KR + M[kim].img, 'musteri'); A.insertBefore(musteriEl, A.querySelector('.tezgah'));
    musteriEl.style.transform = 'translateX(460px)'; musteriEl.getBoundingClientRect();
    musteriEl.classList.add('yuru'); musteriEl.style.transform = '';
    C.efekt('zil');
    return C.bekle(1150).then(function () { musteriEl.classList.remove('yuru'); });
  }
  function musteriGonder() {
    if (!musteriEl) return C.bekle(10);
    var m = musteriEl; m.classList.add('yuru'); m.style.transform = 'translateX(480px)';
    fisEl.classList.add('git');
    if (posetEl.classList.contains('ver')) posetEl.classList.add('gidiyor');
    return C.bekle(1000).then(function () {
      m.remove(); if (musteriEl === m) musteriEl = null; fisEl.className = 'fis';
      posetEl.style.transition = 'none'; posetSifirla(); posetEl.style.opacity = '0'; posetEl.getBoundingClientRect();
      posetEl.style.transition = ''; posetEl.style.opacity = '';
    });
  }
  function fisGoster(sp, kim) {
    var h = '<div class="fis-ust"><img src="' + KR + M[kim].img + '" alt=""><span>SİPARİŞ</span></div>';
    if (sp.s) h += '<div class="satir">' + Array(sp.s + 1).join('<span class="ik">' + simitSVG('pismis') + '</span>') + '</div>';
    if (sp.p) h += '<div class="satir">' + Array(sp.p + 1).join('<span class="ik">' + pogacaSVG('pismis') + '</span>') + '</div>';
    fisEl.innerHTML = h + '<div class="damga">✓</div>';
    fisEl.className = 'fis gor' + ((sp.s || 0) + (sp.p || 0) > 5 ? ' genis' : '');
  }
  function kalpler() {
    for (var i = 0; i < 6; i++) {
      var d = C.el('i', 'kalp'); d.style.left = (1060 + Math.random() * 120) + 'px'; d.style.top = (250 + Math.random() * 40) + 'px';
      d.style.animationDelay = (i * 0.12) + 's'; A.appendChild(d);
      setTimeout(function (e) { e.remove(); }.bind(null, d), 1800);
    }
  }

  /* ---------- aşama 2 sonu: zil, birlikte sayma, denetim ---------- */
  var zilBekle = null;
  function zileBas() {
    if (kilit || !zilBekle) return;
    zilEl.classList.remove('nabiz'); zilEl.classList.add('bas'); setTimeout(function () { zilEl.classList.remove('bas'); }, 300);
    C.efekt('zil');
    var f = zilBekle; zilBekle = null; f();
  }
  function zilBeklet() { return new Promise(function (r) { zilBekle = r; }); }
  function birlikteSay(liste) {
    var p = Promise.resolve();
    liste.forEach(function (el, i) {
      p = p.then(function () {
        el.classList.add('sayildi'); el.appendChild(C.el('div', 'rozet', String(i + 1)));
        C.efekt('say');
        return S('kt_say_' + (i + 1));
      }).then(function () { el.classList.remove('sayildi'); });
    });
    return p.then(function () { return C.bekle(300); }).then(function () { liste.forEach(function (el) { var r = el.querySelector('.rozet'); if (r) r.remove(); }); });
  }
  function say() {
    var s = tepside.filter(function (t) { return t.tur === 'simit'; }).sort(function (a, b) { return a.slot - b.slot; });
    var p = tepside.filter(function (t) { return t.tur === 'pogaca'; }).sort(function (a, b) { return a.slot - b.slot; });
    var ikili = siparis.s > 0 && siparis.p > 0;
    var is = S('kt_sayalim');
    if (ikili) is = is.then(function () { return S('kt_simitler'); });
    if (siparis.s > 0 || s.length) is = is.then(function () { return birlikteSay(s.map(function (t) { return t.el; })); });
    if (ikili) is = is.then(function () { return S('kt_pogacalar'); });
    if (siparis.p > 0 || p.length) is = is.then(function () { return birlikteSay(p.map(function (t) { return t.el; })); });
    return is.then(function () { return { s: s.length, p: p.length }; });
  }
  function birlikteDuzelt() {
    var p = Promise.resolve();
    function duzelt(tur, hedefN) {
      p = p.then(function () {
        var l = tepside.filter(function (t) { return t.tur === tur; }).sort(function (a, b) { return b.slot - a.slot; });
        var is = Promise.resolve();
        for (var i = 0; i < l.length - hedefN; i++) (function (t) { is = is.then(function () { geriKoy(t); return C.bekle(380); }); })(l[i]);
        for (var j = l.length; j < hedefN; j++) is = is.then(function () { koy(tur); return C.bekle(420); });
        return is;
      });
    }
    duzelt('simit', siparis.s || 0); duzelt('pogaca', siparis.p || 0);
    return p;
  }
  function siparisCumlesi() { return 'kt_parca_' + siparis.s; }

  /* Çocuğun hamur toplarını tepsiye koyması: zil → birlikte say → denetle (doğru olana dek) */
  function hazirla(ilk) {
    asama = 'koy'; kilit = false; sonEylem = performance.now();
    var zilSoylendi = false, tasiSoylendi = false;
    var hedefToplam = (siparis.s || 0) + (siparis.p || 0);
    var izle = setInterval(function () {
      if (kilit || !bosta()) { sonEylem = performance.now(); return; }
      var bos = performance.now() - sonEylem, adet = tepside.length;
      if (!zilSoylendi && adet >= hedefToplam && bos > 1500) { zilSoylendi = true; zilEl.classList.add('nabiz'); S('kt_zil'); return; }
      if (ilk && !tasiSoylendi && adet === 1 && bos > 3000) { tasiSoylendi = true; S('kt_tasi2'); return; }
      if (bos > 11000) {
        sonEylem = performance.now();
        fisEl.classList.add('nabiz'); setTimeout(function () { fisEl.classList.remove('nabiz'); }, 1600);
        if (adet > 0) { zilEl.classList.add('nabiz'); S('kt_zil'); } else S(siparisCumlesi());
      }
    }, 400);
    function dongu() {
      return zilBeklet().then(function () {
        kilit = true; zilEl.classList.remove('nabiz');
        return say();
      }).then(function (n) {
        var dogru = n.s === (siparis.s || 0) && n.p === (siparis.p || 0);
        if (dogru) { clearInterval(izle); return; }
        hata++;
        var fazla = n.s > (siparis.s || 0) || n.p > (siparis.p || 0);
        if (hata >= 3) return S('kt_birlikte').then(birlikteDuzelt).then(function () { return say(); }).then(function () { clearInterval(izle); });
        var is = Promise.resolve();
        if (hata === 2) { fisEl.classList.add('nabiz'); is = S('kt_ipucu2').then(function () { fisEl.classList.remove('nabiz'); }); }
        return is.then(function () { return S(fazla ? 'kt_fazla2' : 'kt_eksik'); })
          .then(function () { kilit = false; sonEylem = performance.now(); zilSoylendi = false; return dongu(); });
      });
    }
    return dongu().then(function () { asama = ''; kilit = true; });
  }

  /* ---------- kutlama ---------- */
  var bravoSira = C.karistir([1, 2, 3, 4, 5, 6]), bravoI = 0;
  function bravo() {
    C.efekt('fanfar'); C.konfeti(40, MERKEZ.x, 560);
    kitirEl.classList.add('zipla'); setTimeout(function () { kitirEl.classList.remove('zipla'); }, 600);
    return S('kt_bravo_' + bravoSira[bravoI++ % 6]);
  }
  function teslimKutla() {
    kalpler(); C.efekt('fanfar');
    if (musteriEl) { musteriEl.classList.add('zipla'); setTimeout(function () { if (musteriEl) musteriEl.classList.remove('zipla'); }, 600); }
    fisEl.classList.add('tamam');
  }

  /* ---------- bir müşteri turu: yoğur → hamur al (say) → şekil → pekmez → susam → fırın → paket → teslim ---------- */
  var sayac = { yogur: 0, sekil: 0, pekmez: 0, susam: 0, poset: 0, firin: 0 };
  function tur(kim, sp, ayrinti) {
    siparis = sp; hata = 0; kitleYenile();
    var ilk = ayrinti && ayrinti.ilk, hareketli = ayrinti && ayrinti.hareketli;
    tekneP.classList.toggle('gizli', !sp.p);
    tekneS.classList.toggle('soluk', !sp.s);
    return musteriGetir(kim)
      .then(function () { return S(M[kim].mer); })
      .then(function () { fisGoster(sp, kim); return C.bekle(500); })
      .then(function () { return yogur(false, sayac.yogur++ < 2); })
      .then(function () {
        /* Sipariş cümlesi: ilk üç müşteride söylenir; sonra fiş parlar, çocuk fişten okur (sessiz tur).
           Çocuk 11 sn bir şey yapmazsa hazirla() sipariş cümlesini kendisi söyler. */
        var sesli = ayrinti.sesliSiparis !== false;
        var is = sesli ? S(siparisCumlesi()) : Promise.resolve().then(function () { fisEl.classList.add('nabiz'); return C.bekle(1600); }).then(function () { fisEl.classList.remove('nabiz'); });
        if (!sesli && sp.p) is = is.then(function () { tekneP.classList.add('isaret'); return C.bekle(900); }).then(function () { tekneP.classList.remove('isaret'); });
        if (!sesli) return is;
        if (sp.s && sp.p) is = is.then(function () { tekneP.classList.add('isaret'); return S('kt_pparca_' + sp.p); }).then(function () { tekneP.classList.remove('isaret'); });
        if (ilk) is = is.then(function () { tekneS.classList.add('isaret'); return S('kt_dokun3'); });
        return is;
      })
      .then(function () { return hazirla(ilk); })
      .then(function () { tekneS.classList.remove('isaret'); return bravo(); })
      .then(function () { return sekilVer(false, sayac.sekil++ < 2); })
      .then(function () {
        if (!simitVar()) return null;
        return pekmezeBatir(false, sayac.pekmez++ < 2).then(function () { return susamaBula(false, sayac.susam++ < 2); });
      })
      .then(function () { return firinla(false, hareketli, sayac.firin++ < 2); })
      .then(function () { return paketle(false, sayac.poset++ < 2); })
      .then(function () { teslimKutla(); return S(M[kim].tes); })
      .then(function () { return S('kt_afiyet'); })
      .then(function () { siparis = null; tekneS.classList.remove('soluk'); return musteriGonder(); });
  }

  /* ---------- gösteri turu (Kıtır yapar, adım adım anlatır) ---------- */
  function gosteri() {
    siparis = { s: 3 }; tekneP.classList.add('gizli'); kitleYenile();
    return musteriGetir('pitir')
      .then(function () { return S('p_fr_merhaba'); })
      .then(function () { fisGoster(siparis, 'pitir'); return S('kt_ben_once'); })
      .then(function () { return yogur(true); })
      .then(function () { return S('kt_d_parca'); })
      .then(function () {
        var p = Promise.resolve();
        [1, 2, 3].forEach(function () { p = p.then(function () { tekneS.classList.remove('bas'); tekneS.getBoundingClientRect(); tekneS.classList.add('bas'); koy('simit'); return C.bekle(550); }); });
        return p;
      })
      .then(function () { return S('kt_d_zil'); })
      .then(function () { zilEl.classList.add('bas'); C.efekt('zil'); return C.bekle(500); })
      .then(function () { zilEl.classList.remove('bas'); return sekilVer(true); })
      .then(function () { return pekmezeBatir(true); })
      .then(function () { return susamaBula(true); })
      .then(function () { return firinla(true, false); })
      .then(function () { return paketle(true); })
      .then(function () { teslimKutla(); return S('p_fr_tesekkur'); })
      .then(function () { return S('kt_afiyet'); })
      .then(function () { siparis = null; return musteriGonder(); })
      .then(function () { return S('kt_sira_sende'); });
  }

  /* ---------- kapanış: bugün kaç arkadaş geldi? ---------- */
  var gelenler = [];
  function kapanis() {
    var sira = C.el('div', 'gelenler'); A.appendChild(sira);
    gelenler.forEach(function (kim) { sira.appendChild(C.el('div', 'gelen', '<img src="' + KR + M[kim].img + '" alt=""><b class="gelen-poset"></b>')); });
    sira.getBoundingClientRect(); sira.classList.add('gor');
    return S('kt_kapanis').then(function () { return birlikteSay(Array.prototype.slice.call(sira.children)); })
      .then(function () { C.efekt('fanfar'); C.konfeti(80, 640, 300); kitirEl.classList.add('zipla'); return S('kt_bes_arkadas'); });
  }

  /* Sayılar her oyunda değişir: aralıklar geniş, art arda iki müşteri aynı sayıyı istemez,
     bir müşteri bir önceki oyunda istediği sayıyı yeniden istemez. */
  function oncekiOyun() { try { return JSON.parse(localStorage.getItem('bt_sf_son') || '{}'); } catch (e) { return {}; } }
  function plan(seviye) {
    var once = oncekiOyun(), son = {}, onceki = null;
    function sec(kim, dizi) {
      var aday = dizi.filter(function (n) { return n !== onceki && n !== once[kim]; });
      if (!aday.length) aday = dizi.filter(function (n) { return n !== onceki; });
      var n = C.sec(aday.length ? aday : dizi); onceki = n; son[kim] = n; return n;
    }
    var P = seviye === 'buyuk' ? [
      ['pitir', { s: sec('pitir', [3, 4, 5, 6]) }],
      ['kikir', { s: sec('kikir', [4, 5, 6, 7]) }],
      ['likir', { s: sec('likir', [5, 6, 7, 8]) }],
      ['hisir', { s: sec('hisir', [2, 3, 4]), p: C.sec([2, 3, 4]) }],
      ['gicir', { s: sec('gicir', [6, 7, 8, 9, 10]) }]
    ] : [
      ['pitir', { s: sec('pitir', [1, 2, 3]) }],
      ['kikir', { s: sec('kikir', [1, 2, 3, 4]) }],
      ['likir', { s: sec('likir', [2, 3, 4, 5]) }],
      ['hisir', { s: sec('hisir', [1, 2, 3]), p: C.sec([2, 3]) }],
      ['gicir', { s: sec('gicir', [3, 4, 5]) }]
    ];
    try { localStorage.setItem('bt_sf_son', JSON.stringify(son)); } catch (e) {}
    return P;
  }

  window.__SF = function () { return { kilit: kilit, asama: asama, siparis: siparis, tepsi: tepside.map(function (t) { return t.tur; }), durum: tepside.map(function (t) { return t.durum; }), zil: !!zilBekle, hedef: hedef ? hedef.el.className : null, yogur: !!yogurBekle, sekil: !!sekilBitti, konusma: konusma }; };

  C.baslat({
    id: 'simit-firini',
    ad: "Kıtır'ın Simit Fırını",
    alan: 'sayilar',
    altyaziUstte: true,
    cevirMetni: 'fırın sığsın!',
    evSahibiGorsel: KR + 'kitir_on.webp',
    hazir: function () { kur(); },
    oyun: function () {
      var seviye;
      kitirEl.classList.add('gir');
      return C.bekle(700)
        .then(function () { kitirEl.classList.remove('gir'); return C.tekrar ? null : S('kt_merhaba'); })
        .then(function () { return C.seviyeSec({ ses: 't_fr_secim', ciz: seviyeCiz, ad: 'tepsi' }); })
        .then(function (sv) {
          seviye = sv;
          var p = Promise.resolve();
          var P = plan(seviye);
          if (!C.tekrar) { P.shift(); p = p.then(gosteri); gelenler.push('pitir'); }
          var ilk = true;
          P.forEach(function (t, i) {
            p = p.then(function () {
              gelenler.push(t[0]);
              /* ilk üç müşteride sipariş sesli; sonrakilerde fiş parlar (sessiz yönlendirme) */
              var a = { ilk: ilk, hareketli: t[0] === 'likir', sesliSiparis: i < 3 };
              ilk = false;
              return tur(t[0], t[1], a);
            });
          });
          return p;
        })
        .then(kapanis)
        .then(function () {
          return C.bitis({
            cikartma: KR + 'kitir_on.webp',
            notBaslik: 'Aileye not:',
            aile: "Çocuğunuz siparişleri sırayla hazırladı: hamuru yoğurdu, istenen sayıda hamur aldı, birlikte saydınız; hamurlara şekil verdi, pekmez ve susamdan geçirip fırına verdi, paketleyip teslim etti (MEB okul öncesi MAB.1, dinleyip sırayla uygulama). Evde sofra kurarken tabak ve kaşıkları birlikte sayabilirsiniz.",
            sesler: ['kt_ekransiz', 't_yine_gel']
          });
        });
    }
  });
})();
