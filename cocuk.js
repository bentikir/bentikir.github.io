/* Ben Tıkır · çocuk alanı (çerez, takip, dış istek yok) */
(function () {
  'use strict';
  var A = window.BENTIKIR || { KANAL: '', VIDEOLAR: {}, OYUNLAR: [] };
  var V = A.VIDEOLAR || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* ---- Ses: aynı anda tek ses ---- */
  var current = null;
  function play(name) {
    try {
      if (current) { current.pause(); current.currentTime = 0; }
      current = new Audio('assets/ses/' + name + '.mp3');
      current.play().catch(function () {});
    } catch (e) {}
  }

  /* ---- Konuşan karakterler: sesin şiddetine göre zıplar, söylediği balonda görünür ---- */
  var SOZ = {
    tikir: [['tikir_karsilama_ilk', 'Tık tık! Kim o?<br>Ben Tıkır! Hoş geldin!'], ['tikir_tanitim', 'Ben Tıkır!<br>Sarı antenler, zıp zıp zıp!'], ['tikir_karsilama_sec', 'Haydi,<br>bir arkadaş seç!']],
    pitir: [['pitir_tanitim', 'Ben Pıtır!<br>Pıtır pıtır, hep sayar!'], ['pitir_klip_yolcu_treni', 'Haydi,<br>yolcuları sayalım!']],
    kikir: [['kikir_tanitim', 'Ben Kıkır!<br>Haydi, arkadaş olalım!'], ['sfx_kikirdama', 'Kıkır kıkır!']],
    likir: [['likir_tanitim', 'Ben Lıkır!<br>Haydi, su içelim!'], ['sfx_damla_likir', 'Şıpır şıpır!']],
    hisir: [['hisir_tanitim', 'Ben Hışır!<br>Haydi, birlikte arayalım!'], ['sfx_yaprak_hisir', 'Hışır hışır!']],
    sikir: [['sikir_tanitim', 'Ben Şıkır!<br>Haydi, dans et!']],
    kitir: [['kitir_tanitim', 'Ben Kıtır!<br>Haydi, kahvaltıya!']],
    gicir: [['gicir_tanitim', 'Ben Gıcır!<br>Haydi, ellerimizi yıkayalım!']]
  };
  var ctx = null, an = null, buf = null, talking = null;
  function level() {
    if (!an) return 0;
    an.getByteTimeDomainData(buf);
    var sum = 0; for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
    return Math.min(1, Math.sqrt(sum / buf.length) * 4);
  }
  /* Ağız: görseldeki gülümsemenin üstüne, sesle açılıp kapanan bir ağız çizilir.
     [sol, üst, sağ (px), görsel genişliği, görsel yüksekliği, kontur rengi] */
  var MOUTH = {
    tikir: [229, 279, 331, 560, 571, '#2f6565'],
    pitir: [214, 341, 310, 524, 600, '#72451a'],
    kikir: [221, 330, 311, 542, 600, '#852f4a'],
    likir: [220, 332, 314, 540, 600, '#2c5a7f'],
    hisir: [206, 354, 300, 507, 600, '#2a581d']
  };
  function mouthFor(el) {
    if (el._mouth !== undefined) return el._mouth;
    var m = MOUTH[el.dataset.who], img = $('img', el); el._mouth = null;
    if (!m || !img) return null;
    var face = document.createElement('span'); face.className = 'k-face';
    img.parentNode.insertBefore(face, img); face.appendChild(img);
    var w = m[2] - m[0];
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('class', 'k-mouth'); svg.setAttribute('aria-hidden', 'true');
    svg.style.left = (m[0] / m[3] * 100) + '%'; svg.style.top = '0'; svg.style.marginTop = (m[1] / m[3] * 100) + '%'; svg.style.width = (w / m[3] * 100) + '%';
    svg.innerHTML = '<defs><clipPath id="mc-' + el.dataset.who + '"><path class="mc"/></clipPath></defs>' +
      '<path class="mf" fill="#6e1426" stroke="' + m[5] + '" stroke-width="6" stroke-linejoin="round"/>' +
      '<ellipse class="mt" cx="50" cy="90" rx="26" ry="16" fill="#f4808f" clip-path="url(#mc-' + el.dataset.who + ')"/>';
    face.appendChild(svg);
    el._mouth = svg; return svg;
  }
  function setMouth(svg, h) {
    if (!svg) return;
    if (h <= 0) { svg.style.visibility = 'hidden'; return; }
    svg.style.visibility = 'visible';
    var b = 8 + h, d = 'M4,8 Q50,15 96,8 C93,' + (8 + h * .85) + ' 72,' + b + ' 50,' + b + ' C28,' + b + ' 7,' + (8 + h * .85) + ' 4,8 Z';
    $('.mf', svg).setAttribute('d', d); $('.mc', svg).setAttribute('d', d);
    $('.mt', svg).setAttribute('cy', b - 4);
  }

  function speak(el) {
    var who = el.dataset.who, list = SOZ[who]; if (!list) return;
    var n = +(el.dataset.n || 0), line = list[n % list.length]; el.dataset.n = n + 1;
    if (current) { current.pause(); }
    if (talking && talking !== el) stopTalk(talking);
    var au = new Audio('assets/ses/' + line[0] + '.mp3'); current = au;
    try {
      if (!ctx && location.protocol !== 'file:') { var AC = window.AudioContext || window.webkitAudioContext; if (AC) { ctx = new AC(); an = ctx.createAnalyser(); an.fftSize = 512; buf = new Uint8Array(an.fftSize); an.connect(ctx.destination); } }
      if (ctx) { ctx.resume(); ctx.createMediaElementSource(au).connect(an); }
    } catch (e) {}
    var mouth = mouthFor(el);
    var say = $('.k-say', el), img = $('img', el), on = img.getAttribute('src'), wave = mouth ? null : img.dataset.wave;
    if (say) { say.innerHTML = line[1]; say.classList.add('show'); }
    el.classList.add('talking'); talking = el;
    var t0 = performance.now(), flip = 0;
    (function loop(t) {
      if (talking !== el) return;
      var lv = ctx ? level() : Math.max(0, Math.sin((t - t0) / 55) * 0.6 + Math.sin((t - t0) / 23) * 0.3);
      setMouth(mouth, lv > 0.07 ? Math.min(62, 30 + lv * 60) : 0);
      el.style.setProperty('--amp', lv.toFixed(3));
      if (wave && t - flip > 260) { flip = t; img.src = (img.getAttribute('src') === on) ? wave : on; }
      requestAnimationFrame(loop);
    })(t0);
    au.addEventListener('ended', function () { stopTalk(el); });
    au.play().catch(function () { setTimeout(function () { stopTalk(el); }, 1500); });
    el._on = on;
  }
  function stopTalk(el) {
    el.classList.remove('talking'); el.style.setProperty('--amp', 0); setMouth(el._mouth, 0);
    var img = $('img', el); if (el._on) img.src = el._on;
    if (talking === el) talking = null;
    var say = $('.k-say', el);
    if (say && !el.classList.contains('k-star')) setTimeout(function () { if (talking !== el) say.classList.remove('show'); }, 1400);
  }
  $$('.k-talker').forEach(function (el) {
    var w = $('img', el).dataset.wave; if (w) { var pre = new Image(); pre.src = w; }
    el.addEventListener('click', function () { speak(el); });
  });
  /* Tıkır ara ara kendiliğinden hareket eder */
  var star = $('.k-star');
  if (star && !REDUCED) setInterval(function () {
    if (talking || document.hidden) return;
    star.classList.remove('wiggle'); void star.offsetWidth; star.classList.add('wiggle');
  }, 5200);

  /* ---- Kapılar: dokununca ses ---- */
  $$('.k-door').forEach(function (d) { d.addEventListener('click', function () { play(/oyun/.test(d.className) ? 'tikir_menu_oyna' : (/sarki|cf/.test(d.className) ? 'tikir_menu_izle' : 'sfx_dokunma')); }); });

  /* ---- Karakter şeridi ---- */
  var strip = $('#strip');
  $$('.k-pal').forEach(function (b) {
    var img = $('img', b), on = img.getAttribute('src');
    var wave = b.dataset.slug === 'tikir' ? '' : 'assets/karakterler/' + b.dataset.slug + '_el_salliyor.webp';
    if (wave) { var pre = new Image(); pre.src = wave; }
    b.addEventListener('click', function () {
      play(b.dataset.ses);
      if (wave) { img.src = wave; setTimeout(function () { img.src = on; }, 1800); }
      b.classList.remove('talk'); void b.offsetWidth; b.classList.add('talk');
    });
  });
  function slide(dir) { strip.scrollBy({ left: dir * strip.clientWidth * 0.7, behavior: REDUCED ? 'auto' : 'smooth' }); }
  var pv = $('.k-prev'), nx = $('.k-next');
  if (pv) pv.addEventListener('click', function () { slide(-1); });
  if (nx) nx.addEventListener('click', function () { slide(1); });

  /* ---- Oyunlar: türlere göre raflar (ayarlar.js > OYUNLAR, her oyunun "seri" alanı) ---- */
  /* Yeni tür eklemek için bu listeye bir satır eklemek yeterli. "hep: true" olanlar oyunu olmasa da "Yakında" olarak görünür. */
  var SERILER = [
    { id: 'sayilar',  ad: 'Sayı oyunları',   kim: 'pitir', renk: '#FFB892', hep: true },
    { id: 'merak',    ad: 'Merak oyunları',  kim: 'hisir', renk: '#AEDD6F', hep: true },
    { id: 'ritim',    ad: 'Ritim oyunları',  kim: 'sikir', renk: '#C7B2F5', hep: true },
    { id: 'gunluk',   ad: 'Günlük işler',    kim: 'gicir', renk: '#96D3FF' },
    { id: 'duygular', ad: 'Duygu oyunları',  kim: 'kikir', renk: '#FFB8D4' },
    { id: 'diger',    ad: 'Başka oyunlar',   kim: 'tikir', renk: '#BFE9A8' }
  ];
  var games = $('#games'), OY = A.OYUNLAR || [];
  function oyunlari(id) {
    return OY.filter(function (o) {
      var s = o.seri && SERILER.some(function (x) { return x.id === o.seri; }) ? o.seri : 'diger';
      return s === id;
    });
  }
  if (games) {
    games.innerHTML = SERILER.filter(function (s) { return s.hep || oyunlari(s.id).length; }).map(function (s) {
      var n = oyunlari(s.id).length;
      var alt = n ? '<span class="k-count">' + n + ' oyun</span>' : '<span class="k-count is-none">Yakında</span>';
      return '<li><button class="k-card k-game k-shelf-btn' + (n ? '' : ' is-soon') + '" type="button" data-seri="' + s.id + '" style="--c:' + s.renk + '"' +
        (n ? '' : ' aria-disabled="true"') + ' aria-label="' + esc(s.ad) + ', ' + (n ? n + ' oyun' : 'yakında') + '">' +
        '<span class="k-thumb"><img src="assets/karakterler/' + s.kim + '_on.webp" alt="" loading="lazy">' +
        (n ? '<span class="k-play" aria-hidden="true"></span>' : '') + '</span>' +
        '<span class="k-title">' + esc(s.ad) + '</span>' + alt + '</button></li>';
    }).join('');

    var shelf = $('#shelf'), sList = $('#s-list'), sTitle = $('#s-title'), sHead = $('#s-head');
    games.addEventListener('click', function (e) {
      var btn = e.target.closest('.k-shelf-btn');
      if (!btn || btn.classList.contains('is-soon') || !shelf) return;
      var s = SERILER.filter(function (x) { return x.id === btn.dataset.seri; })[0];
      var list = oyunlari(s.id);
      shelf.style.setProperty('--c', s.renk);
      sHead.innerHTML = '<img src="assets/karakterler/' + s.kim + '_on.webp" alt="">';
      sTitle.textContent = s.ad;
      sList.innerHTML = list.map(function (o) {
        var art = o.gorsel ? encodeURI(o.gorsel) : 'assets/karakterler/' + encodeURIComponent(o.karakter || s.kim) + '_on.webp';
        return '<li><a class="k-card k-gcard" href="' + encodeURI(o.adres) + '">' +
          '<span class="k-thumb"><img src="' + art + '" alt="" loading="lazy"><span class="k-play" aria-hidden="true"></span></span>' +
          '<span class="k-gname">' + esc(o.ad) + '</span>' +
          (o.aciklama ? '<span class="k-gdesc">' + esc(o.aciklama) + '</span>' : '') + '</a></li>';
      }).join('');
      if (shelf.showModal) shelf.showModal(); else shelf.setAttribute('open', '');
    });
    if (shelf) {
      var sClose = function () { if (shelf.close) shelf.close(); else shelf.removeAttribute('open'); };
      $('#s-close').addEventListener('click', sClose);
      shelf.addEventListener('click', function (e) { if (e.target === shelf) sClose(); });
    }
  }

  /* ---- Klipler: yüklenmemiş olanlar "Yakında" ---- */
  $$('.k-card[data-klip]').forEach(function (b) {
    try {
      var k = JSON.parse(b.dataset.klip);
      if (!V[k.no]) {
        b.classList.add('is-soon');
        var s = document.createElement('span'); s.className = 'k-soon'; s.textContent = 'Yakında';
        $('.k-thumb', b).appendChild(s);
      }
    } catch (e) {}
  });

  /* ---- Video penceresi ---- */
  var modal = $('#modal'), media = $('#m-media');
  function open(k) {
    var id = V[k.no];
    var yt = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
    if (location.protocol === 'file:') {
      media.innerHTML = '<a href="' + yt + '" target="_blank" rel="noopener"><img src="assets/klipler/' + k.no + '.webp" alt=""><span class="k-yt">▶ YouTube\'da izle</span></a>';
    } else {
      media.innerHTML = '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1&origin=' +
        encodeURIComponent(location.origin) + '" title="' + esc(k.ad) + ' | Ben Tıkır" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    }
    $('#m-title').textContent = k.ad;
    if (current) current.pause();
    if (modal.showModal) modal.showModal(); else modal.setAttribute('open', '');
  }
  function close() { media.innerHTML = ''; if (modal.close) modal.close(); else modal.removeAttribute('open'); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.k-card');
    if (!b) return;
    if (b.classList.contains('is-soon')) { play('sfx_secim'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return; }
    if (b.dataset.klip) { try { open(JSON.parse(b.dataset.klip)); } catch (err) {} }
  });
  $('#m-close').addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  modal.addEventListener('close', function () { media.innerHTML = ''; });

  /* ---- YouTube kanalı ---- */
  if (A.KANAL) $$('.js-kanal').forEach(function (a) { a.href = A.KANAL + '?sub_confirmation=1'; a.target = '_blank'; a.rel = 'noopener'; });
})();
