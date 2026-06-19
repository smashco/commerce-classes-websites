/* =============================================================
   RELIABLE CLASSES — main.js
   Unobtrusive, progressive-enhancement micro-interactions.
   Loaded with `defer`. Everything respects prefers-reduced-motion.
   -------------------------------------------------------------
   1. Mobile nav toggle (accessible)
   2. Sticky header condense + shadow on scroll
   3. IntersectionObserver scroll reveals
   4. Count-up stats on view
   5. Progress-bar / horizontal-bar / chart animate-on-view
   6. Active section highlight in nav (scroll spy)
   ============================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Mobile nav toggle ---------- */
  (function navToggle() {
    var btn = document.querySelector('.nav__toggle');
    var menu = document.getElementById('primary-nav');
    if (!btn || !menu) return;

    function close() {
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    // Close on Escape, return focus to toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        close();
        btn.focus();
      }
    });
  })();

  /* ---------- 2. Sticky header condense ---------- */
  (function stickyHeader() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var ticking = false;
    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  })();

  /* ---------- helper: run when an element scrolls into view ---------- */
  function onView(els, cb, opts) {
    if (!els.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      // No animation: fire immediately so content is always shown/final.
      Array.prototype.forEach.call(els, function (el) { cb(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          cb(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, opts || { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---------- 3. Scroll reveals ---------- */
  (function reveals() {
    // Auto-tag common content blocks for reveal (keeps HTML clean).
    var selectors = [
      '.section-head', '.hero h1', '.hero .lead', '.hero__cta', '.hero__note',
      '.ledger-card', '.card', '.step', '.quote', '.chart-card',
      '.table-wrap', '.course-block', 'details.faq', '.form', '.info-list',
      '.map-placeholder', '.page-head .lead'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    Array.prototype.forEach.call(nodes, function (el, i) {
      el.classList.add('reveal');
    });
    // Light stagger within grids of cards/steps
    document.querySelectorAll('.grid, .stepper, .results-charts').forEach(function (group) {
      var kids = group.querySelectorAll('.reveal');
      Array.prototype.forEach.call(kids, function (el, i) {
        if (i < 4) el.setAttribute('data-delay', String(i % 4));
      });
    });
    onView(document.querySelectorAll('.reveal'), function (el) {
      el.classList.add('is-visible');
    });
  })();

  /* ---------- 4. Count-up stats ---------- */
  (function countUp() {
    var nums = document.querySelectorAll('[data-countup]');
    onView(nums, function (el) {
      var target = parseFloat(el.getAttribute('data-countup'));
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var decimals = (el.getAttribute('data-decimals') | 0);
      if (prefersReduced || isNaN(target)) {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }
      var dur = 1300, start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (p < 1) window.requestAnimationFrame(frame);
        else el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
      window.requestAnimationFrame(frame);
    });
  })();

  /* ---------- 5a. Ledger / horizontal progress bars ---------- */
  (function progressBars() {
    var bars = document.querySelectorAll('[data-bar]');
    onView(bars, function (el) {
      var pct = el.getAttribute('data-bar');
      // Trigger transition on next frame so the 0 -> pct animates.
      window.requestAnimationFrame(function () {
        el.style.width = pct + '%';
      });
    });
  })();

  /* ---------- 5b. Inline-SVG line chart draw-in ---------- */
  (function trendChart() {
    var charts = document.querySelectorAll('.trend-chart');
    Array.prototype.forEach.call(charts, function (svg) {
      var line = svg.querySelector('.line.animate');
      if (line && typeof line.getTotalLength === 'function') {
        try {
          var len = line.getTotalLength();
          svg.style.setProperty('--len', len);
        } catch (e) { /* ignore */ }
      }
    });
    onView(charts, function (svg) {
      svg.classList.add('in-view');
    }, { threshold: 0.3 });
  })();

  /* ---------- 6. Scroll-spy: active nav link ---------- */
  (function scrollSpy() {
    // Only on pages that have in-page section anchors.
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__links a[href*="#"]')
    ).filter(function (a) {
      var href = a.getAttribute('href') || '';
      // same-page anchors only (index.html#... or #...)
      return href.indexOf('#') !== -1;
    });
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').split('#')[1];
      var sec = id && document.getElementById(id);
      if (sec) sections.push({ link: a, sec: sec });
    });
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.sec === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s.sec); });
  })();
})();
