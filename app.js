/* Ben Tıkır · site davranışları (çerez, takip, dış istek yok) */
(function () {
  'use strict';
  var A = window.BENTIKIR || { KANAL: '', VIDEOLAR: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Ses: tek seferde tek ses ---- */
  var current = null;
  function play(name) {
    try {
      if (current) { current.pause(); current.currentTime = 0; }
      current = new Audio('assets/ses/' + name + '.mp3');
      current.play().catch(function () {});
      return current;
    } catch (e) { return null; }
  }

  /* ---- Menü ---- */
  var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });

  /* ---- YouTube kanal bağlantısı ---- */
  if (A.KANAL) {
    $$('.js-kanal').forEach(function (a) { a.href = A.KANAL + (A.KANAL.indexOf('?') < 0 ? '?sub_confirmation=1' : ''); a.target = '_blank'; a.rel = 'noopener'; });
    $$('.js-kanal-txt').forEach(function (s, i) { s.textContent = i === 0 ? 'YouTube' : "YouTube'da abone ol"; });
    var d = $('.js-kanal-durum'); if (d) d.textContent = 'Yeni şarkılar ve çizgi filmler için Ben Tıkır kanalına abone olun.';
  } else {
    $$('.js-kanal').forEach(function (a) { a.setAttribute('aria-disabled', 'true'); });
  }

  /* ---- Kapıyı çal: klipten kapı sahnesi ---- */
  var vid = $('#kapi');
  function knockPlay() {
    if (current) { current.pause(); }
    try { vid.pause(); vid.currentTime = 0; vid.muted = false; vid.play().catch(function () {}); } catch (e) {}
    vid.closest('.tv').classList.add('playing');
  }
  $('#knock').addEventListener('click', knockPlay);
  $('#tv-sound').addEventListener('click', knockPlay);
  vid.addEventListener('ended', function () { vid.closest('.tv').classList.remove('playing'); vid.muted = true; });
  if (REDUCED) { vid.setAttribute('poster', 'assets/kapi-son.webp'); }
  else {
    // Sayfa açılınca sessiz bir kez oynar, son karede (Tıkır kapıda) durur
    setTimeout(function () { vid.play().catch(function () { vid.setAttribute('poster', 'assets/kapi-son.webp'); }); }, 500);
  }

  /* ---- Klip süzgeci ---- */
  var fbtns = $$('.flt-btn'), clips = $$('.clip');
  function filter(f) {
    fbtns.forEach(function (b) { var on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    clips.forEach(function (c) {
      var show = f === 'hepsi' || c.dataset.seri === f;
      c.classList.toggle('hide', !show);
      if (show) c.classList.add('in');
    });
  }
  fbtns.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });
  $$('[data-go]').forEach(function (a) { a.addEventListener('click', function () { filter(a.dataset.go); }); });

  /* ---- Henüz yüklenmeyen klipler: kartta "Yakında" ---- */
  $$('.clip-btn').forEach(function (b) {
    try { var k = JSON.parse(b.dataset.klip); if (!(A.VIDEOLAR || {})[k.no]) { b.classList.add('is-soon'); var im = $('.clip-img', b); if (im) { var s = document.createElement('span'); s.className = 'soon-tag'; s.textContent = 'Yakında'; im.appendChild(s); } } } catch (e) {}
  });

  /* ---- Klip penceresi ---- */
  var modal = $('#modal'), media = $('#m-media');
  var SERI = { gunler: 'Önemli Günler', rutin: 'Günlük Rutinler', sayilar: 'Sayılar', gunluk: 'Günlük Hayat', duygular: 'Duygular ve Arkadaşlık', tanitim: 'Tanışalım' };
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function openClip(k) {
    var id = (A.VIDEOLAR || {})[k.no];
    if (id) {
      var yt = 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
      if (location.protocol === 'file:') {
        // Bilgisayardan çift tıklayıp açınca YouTube oynatıcı çalışmaz (hata 153); videoyu YouTube'da aç
        media.innerHTML = '<a class="m-yt" href="' + yt + '" target="_blank" rel="noopener"><img src="assets/klipler/' + k.no + '.webp" alt="' + esc(k.ad) + ' kapak görseli" width="960" height="540"><span class="m-yt-btn">▶ YouTube\'da izle</span></a>';
      } else {
        media.innerHTML = '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1&origin=' + encodeURIComponent(location.origin) + '" title="' + esc(k.ad) + ' | Ben Tıkır" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      }
    } else {
      media.innerHTML = '<img src="assets/klipler/' + k.no + '.webp" alt="' + esc(k.ad) + ' kapak görseli" width="960" height="540">';
    }
    $('#m-chips').innerHTML = '<span class="chip st-' + k.seri + '">' + SERI[k.seri] + '</span>' +
      (k.tur !== 'Şarkı' ? '<span class="chip chip-ink">' + esc(k.tur) + '</span>' : '') +
      '<span class="chip">' + esc(k.sure) + '</span><span class="chip">' + esc(k.yas) + '</span>' +
      (id ? '' : '<span class="chip chip-soon">▶ YouTube\'da çok yakında</span>');
    $('#m-title').textContent = k.ad;
    $('#m-ozet').textContent = k.ozet;
    $('#m-ogren').innerHTML = k.ogren.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('');
    $('#m-gorev').textContent = k.gorev;
    $('#m-meb').textContent = 'Okul öncesi programı · ' + k.meb;
    if (modal.showModal) modal.showModal(); else modal.setAttribute('open', '');
  }
  function closeModal() { media.innerHTML = ''; if (modal.close) modal.close(); else modal.removeAttribute('open'); }
  $$('.clip-btn').forEach(function (b) { b.addEventListener('click', function () { openClip(JSON.parse(b.dataset.klip)); }); });
  $('#m-close').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  modal.addEventListener('close', function () { media.innerHTML = ''; });

  /* ---- Karakterler ---- */
  $$('.pal-btn').forEach(function (b) {
    var img = $('img', b), on = img.getAttribute('src'), wave = b.dataset.wave;
    if (wave) { var pre = new Image(); pre.src = wave; }
    b.addEventListener('mouseenter', function () { if (wave) img.src = wave; });
    b.addEventListener('mouseleave', function () { img.src = on; });
    b.addEventListener('click', function () {
      play(b.dataset.ses);
      if (wave) { img.src = wave; setTimeout(function () { img.src = on; }, 1800); }
      b.classList.remove('talk'); void b.offsetWidth; b.classList.add('talk');
    });
  });

  /* ---- Oyunlar (ayarlar.js > OYUNLAR) ---- */
  var games = $('#games'), OY = A.OYUNLAR || [];
  var STC = { sayilar: 'sayilar', gunluk: 'gunluk', duygular: 'duygular', merak: 'merak', ritim: 'ritim' };
  if (OY.length) {
    games.innerHTML = OY.map(function (o) {
      var st = STC[o.seri] || 'tanitim';
      return '<li class="game reveal"><a class="game-card" href="' + encodeURI(o.adres) + '">' +
        '<span class="game-img st-' + st + '">' + (o.gorsel ? '<img src="' + encodeURI(o.gorsel) + '" alt="" loading="lazy">' : '') +
        (o.karakter ? '<img class="game-pal" src="assets/karakterler/' + encodeURIComponent(o.karakter) + '_on.webp" alt="" loading="lazy">' : '') + '</span>' +
        '<span class="game-body"><span class="game-title">' + esc(o.ad) + '</span><span class="game-txt">' + esc(o.aciklama || '') + '</span>' +
        '<span class="game-foot">' + (o.yas ? '<span class="chip">' + esc(o.yas) + '</span>' : '') + '<span class="game-go">Oyna →</span></span></span></a></li>';
    }).join('');
  } else {
    var ph = [['pitir', 'sayilar', 'Sayı oyunları'], ['hisir', 'merak', 'Merak oyunları'], ['sikir', 'ritim', 'Ritim oyunları']];
    games.innerHTML = ph.map(function (p) {
      return '<li class="game reveal"><div class="game-card is-soon"><span class="game-img st-' + p[1] + '"><img class="game-pal" src="assets/karakterler/' + p[0] + '_el_salliyor.webp" alt="" loading="lazy"></span>' +
        '<span class="game-body"><span class="game-title">' + p[2] + '</span><span class="game-txt">Hazırlanıyor.</span><span class="game-foot"><span class="chip chip-ink">Yakında</span></span></span></div></li>';
    }).join('');
  }

  /* ---- Görünme animasyonu ---- */
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en, i) { if (en.isIntersecting) { var el = en.target; setTimeout(function () { el.classList.add('in'); }, (i % 6) * 70); io.unobserve(el); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---- Etkin menü bağlantısı ---- */
  var links = $$('.menu a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { var i = secs.indexOf(en.target); links.forEach(function (l, j) { l.classList.toggle('act', j === i); }); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) so.observe(s); });
  }
})();
