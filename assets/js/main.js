/* Xuống dòng tự chọn: gõ dấu | trong tiêu đề ở CMS = xuống dòng tại đó. Chỗ khác thì dấu | tự ẩn */
(function () {
  var sel = 'h1, h2, h3, h4, .tf-title, .tf-hero__title, .tf-story strong, .tf-story__sum, .tf-card__name, .tf-lead, .tf-hero__tagline, .tf-intro__lead';
  function run() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { var p = n.parentNode; return n.nodeValue.indexOf('|') > -1 && p && !/^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE)$/.test(p.nodeName) ? 1 : 2; }
    }), list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) {
      var host = t.parentNode.closest(sel);
      if (!host) { t.nodeValue = t.nodeValue.replace(/\s*\|\s*/g, ' '); return; }
      var parts = t.nodeValue.split(/\s*\|\s*/), frag = document.createDocumentFragment();
      parts.forEach(function (s, i) { if (i) { var br = document.createElement('br'); br.className = 'tf-br'; frag.appendChild(br); } frag.appendChild(document.createTextNode(s)); });
      t.parentNode.replaceChild(frag, t);
    });
    document.querySelectorAll('[alt*="|"],[aria-label*="|"],[data-recent-t*="|"]').forEach(function (e) {
      ['alt', 'aria-label', 'data-recent-t'].forEach(function (a) { var v = e.getAttribute(a); if (v) e.setAttribute(a, v.replace(/\s*\|\s*/g, ' ')); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
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

/* Trang chi tiết: ảnh lớn tự chạy 2s + bấm ảnh nhỏ để chọn */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var main = g.querySelector('[data-gallery-main]'); if (!main) return;
    var btns = [].slice.call(g.querySelectorAll('.tf-pd__thumbs button'));
    if (btns.length < 2) return;
    var cur = 0, t = null, ms = (parseFloat(g.dataset.giay) || 2) * 1000;
    function go(i) {
      cur = (i + btns.length) % btns.length; var b = btns[cur];
      main.style.opacity = '0';
      setTimeout(function () { main.src = b.dataset.src; main.style.opacity = '1'; }, 180);
      btns.forEach(function (x) { x.classList.toggle('is-on', x === b); });
    }
    function play() { clearInterval(t); if (!reduce) t = setInterval(function () { go(cur + 1); }, ms); }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { go(i); play(); }); });
    g.addEventListener('mouseenter', function () { clearInterval(t); });
    g.addEventListener('mouseleave', play);
    play();
  });
})();

/* Tìm kiếm toàn trang */
(function () {
  var box = document.getElementById('tim-kiem'); if (!box) return;
  var input = box.querySelector('[data-search-input]');
  var idle = box.querySelector('[data-search-idle]');
  var out = box.querySelector('[data-search-results]');
  var recentBox = box.querySelector('[data-search-recent]');
  var recentList = box.querySelector('[data-search-recent-list]');
  var data = null, loading = null, focusIdx = -1, KEY = 'tf_recent';
  var zalo = (document.querySelector('.tf-zalo') || {}).href || '#';

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(box.dataset.src).then(function (r) { return r.json(); }).then(function (j) {
      data = j.map(function (x) { x._t = ' ' + norm(x.t); x._a = ' ' + norm(x.t + ' ' + x.d + ' ' + x.k + ' ' + x.m); return x; }); return data;
    }).catch(function () { data = []; return data; });
    return loading;
  }
  function getRecent() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function showRecent() {
    var r = getRecent(); if (!r.length) { recentBox.hidden = true; return; }
    recentList.innerHTML = r.slice(0, 5).map(function (x) { return '<a class="tf-search__card" href="' + esc(x.u) + '">' + (x.i ? '<img src="' + esc(x.i) + '" alt="" loading="lazy">' : '<span class="ph"></span>') + '<span>' + esc(x.t) + '</span></a>'; }).join('');
    recentBox.hidden = false;
  }
  function score(x, words, q) {
    var s = 0;
    for (var i = 0; i < words.length; i++) { var w = ' ' + words[i]; if (x._a.indexOf(w) < 0) return 0; if (x._t.indexOf(w) >= 0) s += 3; else s += 1; }
    if (x._t.indexOf(' ' + q) === 0) s += 5; if (x.n === 'sp') s += 1; return s;
  }
  function hi(t, words) {
    var out = esc(t), n = norm(t);
    if (n.length !== t.length) return out;
    words.forEach(function (w) { var i = (' ' + n).indexOf(' ' + w); if (i >= 0) out = esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + w.length)) + '</mark>' + esc(t.slice(i + w.length)); });
    return out;
  }
  var GROUPS = [['sp', 'Sản phẩm'], ['kh', 'Đối tác'], ['tt', 'Quy trình & chính sách']];
  function render(q) {
    var nq = norm(q);
    if (!nq) { out.hidden = true; idle.hidden = false; showRecent(); return; }
    idle.hidden = true; out.hidden = false;
    load().then(function (d) {
      if (norm(input.value) !== nq) return;
      var words = nq.split(' ');
      var hits = d.map(function (x) { return { x: x, s: score(x, words, nq) }; }).filter(function (h) { return h.s > 0; }).sort(function (a, b) { return b.s - a.s; });
      if (!hits.length) {
        out.innerHTML = '<div class="tf-search__empty"><p>Không thấy kết quả cho “' + esc(q) + '”. Không thấy mẫu bạn cần? TrueFit làm theo yêu cầu – gửi nhu cầu để được tư vấn.</p><div class="tf-btns"><a class="btn" href="#bao-gia-form" data-bao-gia>Nhận báo giá</a><a class="btn btn--line" href="' + esc(zalo) + '" target="_blank" rel="noopener">Chat Zalo</a></div></div>';
        return;
      }
      out.innerHTML = GROUPS.map(function (g) {
        var list = hits.filter(function (h) { return h.x.n === g[0]; }).slice(0, g[0] === 'sp' ? 8 : 4);
        if (!list.length) return '';
        return '<div class="tf-search__group"><p class="tf-search__h">' + g[1] + ' <small style="color:var(--ink-soft);font-weight:400">(' + list.length + ')</small></p><div class="tf-search__list">' + list.map(function (h) {
          var x = h.x, img = x.i ? '<img src="' + esc(x.i) + '" alt="" loading="lazy">' : '<span class="ph ph--txt">' + (x.m === 'Quy trình' ? '↻' : '§') + '</span>';
          return '<a class="tf-search__row" href="' + esc(x.u) + '">' + img + '<span><strong>' + hi(x.t, words) + '</strong>' + (x.d ? '<small>' + esc(x.d) + '</small>' : '') + '</span><span class="tf-search__tag">' + esc(x.m) + '</span></a>';
        }).join('') + '</div></div>';
      }).join('');
      focusIdx = -1;
    });
  }
  function open() {
    box.hidden = false; document.body.classList.add('is-searching');
    var nav = document.querySelector('.tf-nav.is-open'); if (nav) { var b = document.querySelector('.tf-burger'); if (b) b.click(); }
    showRecent(); load(); setTimeout(function () { input.focus(); }, 30);
  }
  function close() { box.hidden = true; document.body.classList.remove('is-searching'); }
  document.querySelectorAll('[data-search-open]').forEach(function (b) { b.addEventListener('click', open); });
  box.querySelectorAll('[data-search-close]').forEach(function (b) { b.addEventListener('click', close); });
  box.addEventListener('click', function (e) {
    var c = e.target.closest('[data-q]'); if (c) { input.value = c.dataset.q; render(input.value); input.focus(); }
    if (e.target.closest('[data-bao-gia]')) close();
  });
  var t; input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { render(input.value); }, 90); });
  input.addEventListener('keydown', function (e) {
    var rows = [].slice.call(out.querySelectorAll('.tf-search__row'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!rows.length) return; e.preventDefault();
      focusIdx = (focusIdx + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
      rows.forEach(function (r, i) { r.classList.toggle('is-focus', i === focusIdx); }); rows[focusIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') { var r = rows[focusIdx >= 0 ? focusIdx : 0]; if (r) location.href = r.href; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !box.hidden) close();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && box.hidden && !/input|textarea|select/i.test((document.activeElement || {}).tagName)) { e.preventDefault(); open(); }
  });
  /* Lưu trang đã xem (sản phẩm, đối tác) */
  var me = document.querySelector('[data-recent-t]');
  if (me) {
    try {
      var r = getRecent().filter(function (x) { return x.u !== me.dataset.recentU; });
      r.unshift({ t: me.dataset.recentT, u: me.dataset.recentU, i: me.dataset.recentI });
      localStorage.setItem(KEY, JSON.stringify(r.slice(0, 8)));
    } catch (e) {}
  }
})();

/* Tab trong trang chi tiết */
(function () {
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var btns = [].slice.call(box.querySelectorAll('[data-tab]'));
    function show(id) {
      btns.forEach(function (b) {
        var on = b.dataset.tab === id; b.setAttribute('aria-selected', on);
        var p = document.getElementById(b.dataset.tab); if (p) p.hidden = !on;
      });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.tab); }); });
    var h = location.hash.slice(1); show(btns.some(function (b) { return b.dataset.tab === h; }) ? h : btns[0].dataset.tab);
    window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (btns.some(function (b) { return b.dataset.tab === h; })) show(h); });
  });
})();
/* Chống 1 chữ rớt dòng: dính 2 chữ cuối bằng khoảng trắng không ngắt (dòng cuối luôn ≥ 2 chữ) */
(function () {
  var sel = 'h1, h2, h3, h4, .tf-title, .tf-hero__title, .tf-story strong, .tf-story__sum, .tf-card__name, .tf-lead, .tf-hero__tagline, .tf-prose p, .tf-intro__lead';
  function lastText(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, last = null;
    while ((n = w.nextNode())) { if (/\S/.test(n.nodeValue)) last = n; }
    return last;
  }
  function fix(el) {
    if (el.dataset.nw) return; el.dataset.nw = 1;
    var t = lastText(el); if (!t) return;
    var v = t.nodeValue.replace(/\s+$/, ''), tail = t.nodeValue.slice(v.length);
    var i = v.lastIndexOf(' ');
    if (i > 0) { t.nodeValue = v.slice(0, i) + ' ' + v.slice(i + 1) + tail; }
    else if (i === -1) {
      /* chữ cuối nằm riêng trong node (VD sau thẻ <span>): dính với khoảng trắng ở node trước */
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, prev = null;
      while ((n = w.nextNode()) && n !== t) { if (/\S/.test(n.nodeValue) || / $/.test(n.nodeValue)) prev = n; }
      if (prev && / $/.test(prev.nodeValue)) prev.nodeValue = prev.nodeValue.replace(/ $/, ' ');
    }
  }
  function run() { document.querySelectorAll(sel).forEach(fix); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
