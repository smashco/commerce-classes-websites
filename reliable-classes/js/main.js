/* =========================================================================
   RELIABLE CLASSES — interactions
   Deferred. Reduced-motion safe. No dependencies.
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky condensing header ---------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-condensed");
      else header.classList.remove("is-condensed");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Accessible mobile nav ------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav.primary");
  var scrim = document.querySelector(".nav-scrim");

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    if (scrim) scrim.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      var first = nav.querySelector("a, button");
      if (first) first.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
    if (scrim) scrim.addEventListener("click", function () { setNav(false); });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false);
        toggle.focus();
      }
    });
    // Reset state if resized back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760 && nav.classList.contains("is-open")) setNav(false);
    });
  }

  /* ---- Smooth anchor scroll (respects reduced motion) ------------------ */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href");
    if (id === "#" || id.length < 2) return;
    var target = document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* ---- On-view reveal + chart draw-in ---------------------------------- */
  var revealables = document.querySelectorAll(".reveal");
  var chartLines = document.querySelectorAll(".chart-line");

  // Prepare chart lines for draw-in (set dash length to path length)
  chartLines.forEach(function (path) {
    if (typeof path.getTotalLength === "function") {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = reduceMotion ? 0 : len;
    }
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
    chartLines.forEach(function (p) { p.classList.add("is-drawn"); p.style.strokeDashoffset = 0; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.classList.contains("chart-line")) {
          entry.target.style.strokeDashoffset = 0;
          entry.target.classList.add("is-drawn");
        }
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    revealables.forEach(function (el) { io.observe(el); });
    chartLines.forEach(function (p) { io.observe(p); });
  }
})();
