/* ============================================================
   Parab Commerce Classes — progressive enhancement
   Unobtrusive vanilla JS. Every feature degrades gracefully
   and respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Accessible mobile menu --------------------------- */
  (function mobileNav() {
    var nav = document.getElementById("nav");
    var btn = document.getElementById("navToggle");
    if (!nav || !btn) return;

    function close() {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
    }

    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // close on link click (one-page nav) and on Escape
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        close();
        btn.focus();
      }
    });
  })();

  /* ---- Sticky header condense on scroll ----------------- */
  (function stickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 12);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  })();

  /* ---- Scroll-reveal via IntersectionObserver ----------- */
  (function reveals() {
    var targets = document.querySelectorAll(
      ".section-head, .card, .notebook, .batch-row, .quote-tile, .photo-frame, .info-list, .map-placeholder, .form-wrap, .faq details"
    );
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      return; // leave everything visible; CSS only hides when ready
    }

    document.documentElement.classList.add("js-reveal-ready");
    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  })();

  /* ---- Smooth-scroll + active nav state ----------------- */
  (function activeNav() {
    var links = document.querySelectorAll('.nav-links a[href*="#"]');
    var header = document.querySelector(".site-header");
    var sectionMap = [];

    Array.prototype.forEach.call(links, function (link) {
      var hash = link.getAttribute("href").split("#")[1];
      if (!hash) return;
      var section = document.getElementById(hash);
      if (section) sectionMap.push({ link: link, section: section });
    });

    if (!sectionMap.length || !("IntersectionObserver" in window)) return;

    var headerH = header ? header.offsetHeight : 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sectionMap.forEach(function (m) {
            m.link.classList.toggle("is-active", m.section === entry.target);
          });
        }
      });
    }, { rootMargin: "-" + (headerH + 20) + "px 0px -60% 0px", threshold: 0 });

    sectionMap.forEach(function (m) { io.observe(m.section); });
  })();

  /* ---- Subtle count-up on numbers ----------------------- */
  (function countUp() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nums, function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
      return;
    }

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      var dur = 1100;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = prefix + val.toLocaleString("en-IN") + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    Array.prototype.forEach.call(nums, function (el) { io.observe(el); });
  })();

})();
