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

  /* Lọc đối tác: hạng mục (đồng phục / quà tặng) + ngành */
  var grid = document.querySelector('.tf-stories__grid');
  if (grid) {
    var cards = [].slice.call(grid.querySelectorAll('.tf-story'));
    var st = { nhom: '', nganh: '' };
    var empty = document.querySelector('.tf-empty');
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var n = c.dataset.nhom || 'dong-phuc';
        var okN = !st.nhom || n === st.nhom || n === 'ca-hai';
        var okG = !st.nganh || c.dataset.nganh === st.nganh;
        c.hidden = !(okN && okG); c.classList.add('is-in'); if (!c.hidden) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    function press(bar, attr, val) { bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset[attr] === val); }); }
    var pf = document.querySelector('.tf-pfilter'), gf = document.querySelector('.tf-filter');
    if (pf) pf.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.nhom = b.dataset.nhom; press(pf, 'nhom', st.nhom); history.replaceState(null, '', st.nhom ? '#' + st.nhom : location.pathname); apply(); });
    if (gf) gf.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.nganh = b.dataset.f; press(gf, 'f', st.nganh); apply(); });
    function fromHash() { var h = location.hash.slice(1); st.nhom = (h === 'dong-phuc' || h === 'qua-tang') ? h : ''; if (pf) press(pf, 'nhom', st.nhom); apply(); }
    window.addEventListener('hashchange', fromHash); fromHash();
  }
})();

/* Popup Yêu cầu báo giá (gửi qua FormSubmit) */
(function () {
  var modal = document.getElementById('bao-gia-form');
  if (!modal) return;
  var last = null;
  function open(sp) {
    last = document.activeElement;
    modal.hidden = false; document.body.classList.add('tf-lock');
    if (sp) { var f = modal.querySelector('[data-sp-field]'); if (f) f.value = sp; }
    modal.querySelector('[data-trang]').value = location.href;
    setTimeout(function () { modal.querySelector('input:not([type=hidden]):not(.tf-hp)').focus(); }, 50);
  }
  function close() { modal.hidden = true; document.body.classList.remove('tf-lock'); if (last) last.focus(); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-bao-gia], a[href$="#bao-gia-form"]');
    if (a) { e.preventDefault(); open(a.dataset.sp); var nav = document.getElementById('menu'); if (nav) nav.classList.remove('is-open'); return; }
    if (e.target.closest('[data-dong]')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  if (location.hash === '#bao-gia-form') open();
  document.querySelectorAll('form.tf-qform').forEach(function (form) {
    var msg = form.querySelector('.tf-qform__msg'), send = form.querySelector('.tf-qform__send');
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return;
      e.preventDefault();
      var tr = form.querySelector('[data-trang]'); if (tr) tr.value = location.href;
      send.disabled = true; msg.className = 'tf-qform__msg'; msg.textContent = 'Đang gửi…';
      fetch(form.dataset.ajax, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) === 'false') throw j; return j; }); })
        .then(function () { msg.className = 'tf-qform__msg is-ok'; msg.textContent = '✓ Đã gửi! TrueFit sẽ liên hệ bạn sớm nhất.'; form.reset(); send.disabled = false; })
        .catch(function () { msg.className = 'tf-qform__msg is-err'; msg.textContent = 'Chưa gửi được. Bạn nhắn Zalo hoặc gọi hotline giúp TrueFit nhé.'; send.disabled = false; });
    });
  });
})();

/* Khung ảnh tự chuyển ở khối Đến với TrueFit */
(function () {
  document.querySelectorAll('[data-frame]').forEach(function (box) {
    var imgs = [].slice.call(box.querySelectorAll('.tf-frame__img'));
    var dotsBox = box.querySelector('.tf-frame__dots');
    if (imgs.length < 2) return;
    var cur = 0, t = null, ms = (parseFloat(box.dataset.giay) || 4) * 1000;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dots = imgs.map(function (_, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ảnh ' + (i + 1));
      b.addEventListener('click', function () { go(i); play(); }); dotsBox.appendChild(b); return b;
    });
    dotsBox.removeAttribute('aria-hidden');
    function go(i) { cur = (i + imgs.length) % imgs.length; imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === cur); }); dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur); }); }
    function play() { clearInterval(t); if (!reduce) t = setInterval(function () { go(cur + 1); }, ms); }
    go(0); play();
    box.addEventListener('mouseenter', function () { clearInterval(t); });
    box.addEventListener('mouseleave', play);
  });
})();
