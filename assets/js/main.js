/* TrueFit – animation & menu (không cần thư viện ngoài) */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu mobile */
  var burger = document.querySelector('.tf-burger');
  var nav = document.getElementById('menu');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); }
    });
  }

  /* Header đổ bóng khi cuộn */
  var header = document.querySelector('.tf-top') || document.querySelector('.tf-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Hero trượt ngang */
  document.querySelectorAll('.tf-slider').forEach(function (sl) {
    var track = sl.querySelector('.tf-slider__track');
    var slides = [].slice.call(sl.querySelectorAll('.tf-slide'));
    var dots = [].slice.call(sl.querySelectorAll('.tf-slider__dots button'));
    var cur = 0, timer = null, delay = (parseFloat(sl.dataset.autoplay) || 5) * 1000;
    function mark(i) {
      cur = i;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function go(i) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[i].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      mark(i);
    }
    function play() { stop(); if (!reduce && slides.length > 1) timer = setInterval(function () { go(cur + 1); }, delay); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    mark(0);
    var t;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () { var i = Math.round(track.scrollLeft / track.clientWidth); if (i !== cur) mark(i); }, 80);
    }, { passive: true });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); play(); }); });
    var prev = sl.querySelector('.tf-slider__arrow--prev'), next = sl.querySelector('.tf-slider__arrow--next');
    if (prev) prev.addEventListener('click', function () { go(cur - 1); play(); });
    if (next) next.addEventListener('click', function () { go(cur + 1); play(); });
    sl.addEventListener('mouseenter', stop); sl.addEventListener('mouseleave', play);
    sl.addEventListener('touchstart', stop, { passive: true }); sl.addEventListener('touchend', play);
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(cur + 1); play(); } if (e.key === 'ArrowLeft') { go(cur - 1); play(); } });
    window.addEventListener('resize', function () { track.scrollLeft = slides[cur].offsetLeft; });
    play();
  });

  /* Đếm số chạy lên */
  function countUp(el) {
    var label = el.dataset.label || el.textContent.trim();
    el.dataset.label = label;
    var target = parseFloat(label.replace(/\D/g, ''));
    if (!target || reduce) { el.textContent = label; return; }
    var pad = /^0\d/.test(label) ? label.replace(/\D/g, '').length : 0;
    var suffix = label.replace(/[\d.,\s]/g, '');
    var start = null, dur = 1600;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      var s = v.toLocaleString('vi-VN');
      if (pad) s = String(v).padStart(pad, '0');
      el.textContent = p < 1 ? s + suffix : label;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Hiện dần khi cuộn tới */
  var items = document.querySelectorAll('.reveal');
  var counters = document.querySelectorAll('[data-count]');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); el.classList.remove('reveal'); });
    counters.forEach(function (el) { if (el.dataset.label) el.textContent = el.dataset.label; });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('is-in');
      io.unobserve(el);
      /* xong hiệu ứng thì trả lại hover gốc của thẻ */
      setTimeout(function () { el.classList.remove('reveal'); }, 1400);
      el.querySelectorAll('[data-count]').forEach(countUp);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { io.observe(el); });
})();

/* Trang chủ mới: tab sản phẩm · hàng câu chuyện · lọc dự án */
(function () {
  /* Tab Đồng phục / Quà tặng */
  document.querySelectorAll('.tf-tabs').forEach(function (bar) {
    var tabs = [].slice.call(bar.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on);
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) {
            panel.hidden = !on;
            if (on) panel.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
          }
        });
      });
    });
  });

  /* Nút ‹ › cho hàng câu chuyện khách hàng */
  document.querySelectorAll('.tf-stories').forEach(function (box) {
    var row = box.querySelector('.tf-stories__row');
    if (!row) return;
    box.querySelectorAll('[data-scroll]').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = row.querySelector('.tf-story');
        var step = card ? card.offsetWidth + 20 : row.clientWidth * .8;
        row.scrollBy({ left: step * parseInt(b.dataset.scroll, 10), behavior: 'smooth' });
      });
    });
  });

  /* Lọc dự án theo ngành */
  document.querySelectorAll('.tf-filter').forEach(function (bar) {
    var btns = [].slice.call(bar.querySelectorAll('button'));
    var cards = [].slice.call(document.querySelectorAll('.tf-stories__grid .tf-story'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        cards.forEach(function (c) { c.hidden = b.dataset.f !== '' && c.dataset.nganh !== b.dataset.f; c.classList.add('is-in'); });
      });
    });
  });
})();
