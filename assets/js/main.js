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

  /* Đếm số chạy lên */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var label = el.dataset.label || String(target);
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
    counters.forEach(function (el) { el.textContent = el.dataset.label; });
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
