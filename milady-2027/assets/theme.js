/* MilaDy 2027 — habillage des pages.
   1. Theme: light / dark, follows the system until the reader chooses;
      the choice is kept in localStorage ("milady-theme").
   2. Side contents: built from the h2 / h3 headings of <main>; always
      visible on wide screens, a drawer opened from the top bar elsewhere;
      the section being read is highlighted and named in the top bar.
   3. Tables: wrapped so they scroll sideways on phones; two-column
      key / value tables (course fiches) stack on narrow screens.
   4. Langue : textes d'interface en français ou en anglais selon <html lang>,
      bouton FR / EN vers la page homologue (même chemin sous en/).
   Interface strings follow <html lang> (fr or en). */
(function () {
  var KEY = "milady-theme";
  var TOC_KEY = "milady-toc-hidden";
  var root = document.documentElement;
  var LANG = /^en/i.test(root.getAttribute("lang") || "") ? "en" : "fr";
  var T = {
    fr: { toLight: "Passer en mode clair", toDark: "Passer en mode sombre", light: "Clair", dark: "Sombre",
          contents: "Sommaire", skip: "Aller au contenu", close: "✕ Fermer", closeLabel: "Fermer le sommaire",
          top: "↑ Haut de page", other: "EN", otherLabel: "English version" },
    en: { toLight: "Switch to light mode", toDark: "Switch to dark mode", light: "Light", dark: "Dark",
          contents: "Contents", skip: "Skip to content", close: "✕ Close", closeLabel: "Close the contents",
          top: "↑ Top of page", other: "FR", otherLabel: "Version française" }
  }[LANG];

  function store(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ---------- 1. Theme ---------- */
  function systemDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
  function currentTheme() {
    var t = read(KEY);
    if (t === "dark" || t === "light") return t;
    return systemDark() ? "dark" : "light";
  }
  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) store(KEY, theme);
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var dark = theme === "dark";
    btn.setAttribute("aria-label", dark ? T.toLight : T.toDark);
    btn.setAttribute("title", dark ? T.toLight : T.toDark);
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.innerHTML = '<span aria-hidden="true">' + (dark ? "☀" : "☾") + '</span><span class="tb-label">' +
      (dark ? T.light : T.dark) + "</span>";
  }
  applyTheme(currentTheme(), false);

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function headingText(h) {
    var c = h.cloneNode(true);
    c.querySelectorAll(".katex-mathml, .anchorjs-link").forEach(function (x) { x.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }

  /* ---------- top bar for pages written by hand (home page) ---------- */
  function ensureChrome(main) {
    if (document.querySelector(".topbar")) return;
    var bar = el("header", "topbar");
    bar.innerHTML =
      '<button type="button" class="tb-btn" id="toc-toggle" aria-controls="sidetoc" aria-expanded="false">' +
      '<span aria-hidden="true">☰</span><span class="tb-label">' + T.contents + '</span></button>' +
      '<a class="brand" href="#top">MilaDy<span class="brand-sub"> · 2027</span></a>' +
      '<span class="tb-title" id="tb-title"></span>' +
      '<button type="button" class="tb-btn" id="theme-toggle"></button>';
    var skip = el("a", "skip", T.skip);
    skip.href = "#main";
    var layout = el("div", "layout");
    var nav = el("nav", "sidetoc");
    nav.id = "sidetoc";
    nav.setAttribute("aria-label", T.contents);
    main.parentNode.insertBefore(layout, main);
    layout.appendChild(nav);
    layout.appendChild(main);
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.insertBefore(skip, bar);
    if (!main.id) main.id = "main";
    var crumb = document.querySelector(".crumb");
    if (crumb) crumb.remove();
  }

  /* ---------- 2. Side contents ---------- */
  function buildToc(main, nav) {
    var heads = Array.prototype.filter.call(main.querySelectorAll("h2, h3"), function (h) {
      return h.id && h.id !== "contents" && !h.closest(".sidetoc, nav.toc, .tree, .period-card, #title-block-header");
    });
    if (!heads.length) return [];
    nav.innerHTML = "";
    var head = el("div", "sidetoc-head");
    var title = el("p", "sidetoc-title", T.contents);
    var x = el("button", "sidetoc-close", T.close);
    x.type = "button";
    x.setAttribute("aria-label", T.closeLabel);
    head.appendChild(title);
    head.appendChild(x);
    var top = el("a", "sidetoc-top", T.top);
    top.href = "#top";
    nav.appendChild(head);
    var list = el("ol", "sidetoc-list");
    var current = null, items = [];
    heads.forEach(function (h) {
      var a = el("a", null, headingText(h));
      a.href = "#" + h.id;
      var li = el("li", h.tagName === "H2" ? "lvl2" : "lvl3");
      li.appendChild(a);
      if (h.tagName === "H2" || !current) {
        list.appendChild(li);
        if (h.tagName === "H2") { current = li; current.sub = null; }
      } else {
        if (!current.sub) { current.sub = el("ol", "sidetoc-sub"); current.appendChild(current.sub); }
        current.sub.appendChild(li);
      }
      items.push({ h: h, a: a, li: li, parent: h.tagName === "H2" || li.parentNode === list ? li : current });
    });
    nav.appendChild(list);
    nav.appendChild(top);
    return items;
  }

  function setupToc() {
    var main = document.querySelector("main.paper") || document.querySelector("main");
    if (!main) return;
    if (!document.getElementById("top")) {
      var anchor = el("span");
      anchor.id = "top";
      document.body.insertBefore(anchor, document.body.firstChild);
    }
    ensureChrome(main);
    var layout = main.parentNode;
    if (layout.classList.contains("layout") && !main.closest(".content")) {
      var content = el("div", "content");
      layout.insertBefore(content, main);
      content.appendChild(main);
      var foot = document.querySelector(".foot");
      if (foot) content.appendChild(foot);
    }
    var nav = document.getElementById("sidetoc");
    var btn = document.getElementById("toc-toggle");
    var label = document.getElementById("tb-title");
    var items = nav ? buildToc(main, nav) : [];
    if (!items.length) {
      root.classList.add("no-sidetoc");
      if (btn) btn.hidden = true;
      return;
    }
    root.classList.add("has-sidetoc");
    var wide = window.matchMedia("(min-width: 75rem)");
    var backdrop = el("div", "toc-backdrop");
    document.body.appendChild(backdrop);

    function isOpen() {
      return wide.matches ? !root.classList.contains("toc-hidden") : root.classList.contains("toc-open");
    }
    function sync() { if (btn) btn.setAttribute("aria-expanded", isOpen() ? "true" : "false"); }
    function close() { root.classList.remove("toc-open"); sync(); }
    if (read(TOC_KEY) === "1") root.classList.add("toc-hidden");
    sync();
    if (wide.addEventListener) wide.addEventListener("change", function () { close(); });

    btn && btn.addEventListener("click", function () {
      if (wide.matches) {
        var hidden = root.classList.toggle("toc-hidden");
        store(TOC_KEY, hidden ? "1" : null);
      } else {
        root.classList.toggle("toc-open");
        if (root.classList.contains("toc-open")) {
          var act = nav.querySelector("a.active");
          (act || nav.querySelector("a")).focus({ preventScroll: true });
          if (act) act.scrollIntoView({ block: "center" });
        }
      }
      sync();
    });
    backdrop.addEventListener("click", close);
    var xb = nav.querySelector(".sidetoc-close");
    if (xb) xb.addEventListener("click", function () { close(); btn && btn.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("toc-open")) { close(); btn && btn.focus(); }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && !wide.matches) close();
    });

    /* scroll spy: the active heading is the last one above 30 % of the viewport */
    var activeItem = null, ticking = false;
    var progress = el("div", "progress");
    var bar = document.querySelector(".topbar");
    if (bar) bar.appendChild(progress);
    function update() {
      ticking = false;
      var y = window.innerHeight * 0.3, found = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].h.getBoundingClientRect().top <= y) found = items[i]; else break;
      }
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      if (found === activeItem) return;
      if (activeItem) {
        activeItem.a.classList.remove("active");
        activeItem.a.removeAttribute("aria-current");
        activeItem.parent.classList.remove("open");
      }
      activeItem = found;
      if (!found) { if (label) label.textContent = ""; return; }
      found.a.classList.add("active");
      found.a.setAttribute("aria-current", "location");
      found.parent.classList.add("open");
      if (label) label.textContent = headingText(found.parent.firstChild);
      if (wide.matches && !root.classList.contains("toc-hidden")) {
        var r = found.a.getBoundingClientRect(), nr = nav.getBoundingClientRect();
        if (r.top < nr.top + 40 || r.bottom > nr.bottom - 40) {
          nav.scrollTop += r.top - nr.top - nr.height / 3;
        }
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- 3. Tables ---------- */
  function setupTables() {
    var main = document.querySelector("main");
    if (!main) return;
    main.querySelectorAll("table").forEach(function (t) {
      if (!t.closest(".tbl-wrap")) {
        var w = el("div", "tbl-wrap");
        t.parentNode.insertBefore(w, t);
        w.appendChild(t);
      }
      var first = t.querySelector("tr");
      if (!t.tHead && first && first.children.length === 2 && !t.classList.contains("tbl")) {
        t.classList.add("kv");
      }
    });
  }

  /* ---------- 4. Display formulas: shrink to fit narrow screens ---------- */
  function fitFormulas() {
    document.querySelectorAll("main .math.display").forEach(function (m) {
      m.style.fontSize = "";
      var w = m.clientWidth, sw = m.scrollWidth;
      if (w > 0 && sw > w + 1) m.style.fontSize = Math.max(0.6, (w / sw) * 0.98).toFixed(3) + "em";
    });
  }
  var fitTimer = null;
  function scheduleFit() { clearTimeout(fitTimer); fitTimer = setTimeout(fitFormulas, 150); }
  window.addEventListener("load", fitFormulas);
  window.addEventListener("resize", scheduleFit);

  /* ---------- 5. Language toggle: same path under en/ ---------- */
  function siteRoot() {
    var s = document.querySelector('script[src$="assets/theme.js"]');
    if (!s) return null;
    return s.src.replace(/assets\/theme\.js(\?.*)?$/, "");
  }
  function addLangToggle() {
    var bar = document.querySelector(".topbar");
    var rootUrl = siteRoot();
    if (!bar || !rootUrl || document.getElementById("lang-toggle")) return;
    var here = window.location.href.split("#")[0].split("?")[0];
    if (here.indexOf(rootUrl) !== 0) return;
    var rel = here.slice(rootUrl.length);
    var other = /^en\//.test(rel) ? rel.slice(3) : "en/" + rel;
    var a = el("a", "tb-btn lang-btn", null);
    a.id = "lang-toggle";
    a.href = rootUrl + other + window.location.hash;
    a.setAttribute("hreflang", LANG === "fr" ? "en" : "fr");
    a.setAttribute("title", T.otherLabel);
    a.setAttribute("aria-label", T.otherLabel);
    a.innerHTML = '<span class="tb-label-always">' + T.other + "</span>";
    var theme = document.getElementById("theme-toggle");
    if (theme) bar.insertBefore(a, theme); else bar.appendChild(a);
  }

  function mount() {
    addLangToggle();
    setupTables();
    setupToc();
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
      });
    }
    applyTheme(currentTheme(), false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  if (window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        var t = read(KEY);
        if (t !== "dark" && t !== "light") applyTheme(currentTheme(), false);
      });
    } catch (e) {}
  }
})();
