window.EmbassyUtils = {
  findMap: function () {
    for (var k in window) {
      try { if (window[k] instanceof L.Map) return window[k]; } catch (e) {}
    }
    return null;
  },
  walkMarkers: function (layer, fn) {
    if (!layer) return;
    if (layer instanceof L.Marker) fn(layer);
    else if (typeof layer.eachLayer === 'function') {
      layer.eachLayer(function (c) { window.EmbassyUtils.walkMarkers(c, fn); });
    }
  }
};

(function () {
  var STORAGE_KEY = 'embassyHintsSeen';
  var AUTO_HIDE_MS = 12000;

  function seen() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  function dismiss(toast) {
    if (!toast || toast.__dismissed) return;
    toast.__dismissed = true;
    toast.classList.remove('visible');
    markSeen();
    setTimeout(function () { toast.hidden = true; }, 300);
  }

  function init() {
    var toast = document.getElementById('hints-toast');
    if (!toast || seen()) return;
    /* Let i18n run first so the toast appears in the user's language. */
    setTimeout(function () { toast.hidden = false; }, 0);
    setTimeout(function () { toast.classList.add('visible'); }, 50);

    var closeBtn = toast.querySelector('.hints-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { dismiss(toast); });

    var autoHide = setTimeout(function () { dismiss(toast); }, AUTO_HIDE_MS);

    function onFirstInteraction(e) {
      if (toast.contains(e.target)) return;
      clearTimeout(autoHide);
      setTimeout(function () { dismiss(toast); }, 400);
      document.removeEventListener('click', onFirstInteraction, true);
      document.removeEventListener('touchstart', onFirstInteraction, true);
    }
    setTimeout(function () {
      document.addEventListener('click', onFirstInteraction, true);
      document.addEventListener('touchstart', onFirstInteraction, true);
    }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   Close the country nav-panel when the user clicks outside it,
   or picks a flag button (after navigation finishes).
   ============================================================ */
(function () {
  function onClick(e) {
    var p = document.getElementById('nav-panel');
    if (!p || p.classList.contains('collapsed')) return;
    if (p.contains(e.target)) {
      if (e.target.closest('.flag-btn')) p.classList.add('collapsed');
      return;
    }
    p.classList.add('collapsed');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('click', onClick);
    });
  } else {
    document.addEventListener('click', onClick);
  }
})();
