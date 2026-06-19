/* ============================================================
   Soni Classes Commerce — tasteful progressive enhancement.
   Vanilla JS, no dependencies, loaded with `defer`.
   Respects prefers-reduced-motion. Everything degrades gracefully.
   ============================================================ */
(function () {
  "use strict";

  // Mark JS available (CSS hides reveal flash for no-js via .no-js)
  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky condensing masthead ---- */
  var masthead = document.querySelector(".masthead");
  if (masthead) {
    var condense = function () {
      if (window.scrollY > 60) {
        masthead.classList.add("is-condensed");
      } else {
        masthead.classList.remove("is-condensed");
      }
    };
    condense();
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          condense();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- Accessible mobile nav ---- */
  var toggle = document.querySelector(".nav__toggle");
  var navList = document.querySelector(".nav__list");
  if (toggle && navList) {
    var closeNav = function () {
      navList.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close on link click + Escape
    navList.addEventListener("click", function (e) {
      if (e.target.closest("a")) { closeNav(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("is-open")) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* ---- Smooth anchor scroll (same-page) ---- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) { return; }
    var id = link.getAttribute("href");
    if (id === "#" || id.length < 2) { return; }
    var target = document.getElementById(id.slice(1));
    if (!target) { return; }
    e.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
    // move focus for accessibility
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* ---- Subtle reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }
})();
