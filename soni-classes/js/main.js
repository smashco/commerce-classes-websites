/* ============================================================
   Soni Classes Commerce — progressive-enhancement interactions
   Vanilla JS, no dependencies. Loaded with `defer`.
   Respects prefers-reduced-motion. Everything degrades gracefully.
   ============================================================ */
(function () {
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.remove('no-js');
  docEl.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Accessible mobile nav ---------- */
  (function () {
    var nav = document.getElementById('nav');
    var btn = document.getElementById('navToggle');
    if (!nav || !btn) return;

    function setOpen(open) {
      nav.setAttribute('data-open', String(open));
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });

    // Close on Escape, returning focus to the toggle.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });

    // Close after choosing a link (mobile).
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  })();

  /* ---------- Sticky header: condense + shadow on scroll ---------- */
  (function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  (function () {
    if (reduceMotion) return; // native jump is fine; CSS smooth disabled too
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      link.addEventListener('click', function (e) {
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Move focus for accessibility without an extra visual jump.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  })();

  /* ---------- Scroll-reveal via IntersectionObserver ---------- */
  (function () {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Animated count-up for stats ---------- */
  (function () {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    function setFinal(el) { el.textContent = el.getAttribute('data-count-display') || el.getAttribute('data-count'); }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nums.forEach(setFinal);
      return;
    }

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var display = el.getAttribute('data-count-display') || '';
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = (String(target).split('.')[1] || '').length;
      var duration = 1400;
      var start = null;

      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = prefix + val.toFixed(decimals) + suffix;
        if (p < 1) {
          requestAnimationFrame(frame);
        } else if (display) {
          el.textContent = display; // exact formatted final (e.g. "1,200+")
        }
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  })();
})();
