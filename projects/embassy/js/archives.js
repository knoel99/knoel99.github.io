(function () {
  var ARCHIVES = { data: null, layer: null, map: null };

  var findMap = window.EmbassyUtils.findMap;
  var walkMarkers = window.EmbassyUtils.walkMarkers;

  function fmtRange(from, to) {
    if (!to) return from + ' →';
    if (from === to) return from;
    return from + '–' + to;
  }

  function i18nDict() {
    var lang = (window.__getLang && window.__getLang()) || 'en';
    return (window.I18N && window.I18N[lang]) || (window.I18N && window.I18N.en) || {};
  }
  function kindLabel(k) {
    var t = i18nDict();
    var map = {
      legation: t.kindLegation, embassy: t.kindEmbassy,
      chancery: t.kindChancery, consulate: t.kindConsulate, residence: t.kindResidence
    };
    return map[k] || k || '';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Sorted-by-date navigation state, populated by renderPanel/buildMarkers.
  var ADDR_STATE = { sorted: [], markers: [], current: -1 };

  function sortedAddresses(emb) {
    return emb.addresses.slice().sort(function (a, b) {
      return parseInt(a.from, 10) - parseInt(b.from, 10);
    });
  }

  // Simple person silhouette — inline SVG renders identically across systems (no emoji font dependency).
  var PERSON_SVG = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
                 + '<circle cx="8" cy="5" r="2.5" fill="currentColor"/>'
                 + '<path d="M2.8 14 C2.8 10.9, 5.1 8.8, 8 8.8 C10.9 8.8, 13.2 10.9, 13.2 14 Z" fill="currentColor"/>'
                 + '</svg>';

  var LAST_RENDER = { emb: null, hostName: null };
  function renderPanel(emb, hostName) {
    LAST_RENDER.emb = emb;
    LAST_RENDER.hostName = hostName;
    var t = i18nDict();
    var addrs = sortedAddresses(emb);
    ADDR_STATE.sorted = addrs;
    var html = '';
    var embassyOf = (t.embassyOf || 'Embassy of {name} in {host}')
      .replace('{name}', escapeHtml(emb.name))
      .replace('{host}', escapeHtml(hostName));
    html += '<p class="ap-eyebrow">'
         + '<span class="stamp">' + escapeHtml(t.archives || 'Archives') + '</span>'
         + '<span>' + embassyOf + '</span>'
         + '</p>';
    var titleTpl = t.archivesTitle || 'Two and a half centuries of <em>Parisian addresses</em>';
    html += '<h2 id="ap-title-h2" class="ap-title">' + titleTpl + '</h2>';
    var ledeTpl = t.archivesLede
      || 'From the Hôtel de Valentinois where Benjamin Franklin signed the Franco-American alliance in 1778, to the chancery on Place de la Concorde — {n} successive addresses tell the story of American diplomacy in France.';
    html += '<p class="ap-lede">' + ledeTpl.replace('{n}', addrs.length) + '</p>';
    html += '<div class="ap-timeline">';
    addrs.forEach(function (e, i) {
      html += '<div class="ap-entry' + (e.current ? ' current' : '') + '" data-index="' + i + '" '
           + 'style="animation-delay:' + (i * 60) + 'ms" '
           + 'role="button" tabindex="0">';
      html += '<div class="ap-date">'
           + '<span>' + escapeHtml(fmtRange(e.from, e.to)) + '</span>'
           + (e.kind ? '<span class="ap-kind">' + escapeHtml(kindLabel(e.kind)) + '</span>' : '')
           + '</div>';
      html += '<h3>' + escapeHtml(e.address) + '</h3>';
      if (e.building) html += '<p class="ap-building">' + escapeHtml(e.building) + '</p>';
      html += '<p class="ap-note">' + escapeHtml(e.note) + '</p>';
      html += '</div>';
    });
    html += '</div>';
    document.getElementById('ap-content').innerHTML = html;
    // Wire click + keyboard on timeline entries
    document.querySelectorAll('#archives-panel .ap-entry').forEach(function (el) {
      el.addEventListener('click', function () {
        flyToIndex(parseInt(el.getAttribute('data-index'), 10));
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flyToIndex(parseInt(el.getAttribute('data-index'), 10));
        }
      });
    });
  }

  function buildMarkers(emb) {
    var group = L.layerGroup();
    var addrs = sortedAddresses(emb);
    ADDR_STATE.markers = [];
    addrs.forEach(function (e, i) {
      var classes = 'historic-flag-icon';
      if (e.current) classes += ' current';
      if (e.kind) classes += ' kind-' + e.kind;
      var inner = '<div class="hfi-wrap">'
                + '<div class="hfi-flag" style="background-image:url(https://flagcdn.com/w40/' + emb.flag + '.png)">'
                + (e.kind === 'residence' ? '<span class="hfi-person" title="' + escapeHtml(kindLabel('residence')) + '">' + PERSON_SVG + '</span>' : '')
                + '</div>'
                + '<div class="hfi-date">' + escapeHtml(fmtRange(e.from, e.to)) + '</div>'
                + '</div>';
      var icon = L.divIcon({
        className: classes,
        iconSize: [70, 52],
        iconAnchor: [35, 38],
        html: inner
      });
      var m = L.marker([e.lat, e.lon], { icon: icon, zIndexOffset: 800 });
      m.__archivesHistoric = true;
      // No popup on historic markers — the side panel carries the full info, and an open popup
      // hides the flag underneath. Clicking the marker just syncs the navigation cursor.
      m.on('click', function () {
        ADDR_STATE.current = i;
        updateNavCaption();
        highlightActiveEntry();
      });
      group.addLayer(m);
      ADDR_STATE.markers[i] = m;
    });
    return group;
  }

  function highlightActiveEntry() {
    document.querySelectorAll('#archives-panel .ap-entry').forEach(function (el) {
      el.classList.remove('active');
    });
    if (ADDR_STATE.current < 0) return;
    var entry = document.querySelector('#archives-panel .ap-entry[data-index="' + ADDR_STATE.current + '"]');
    if (entry) {
      entry.classList.add('active');
      // Scroll only the panel, not the document.
      var panel = document.getElementById('archives-panel');
      var er = entry.getBoundingClientRect();
      var pr = panel.getBoundingClientRect();
      panel.scrollTop += (er.top + er.height / 2) - (pr.top + pr.height / 2);
    }
  }

  function updateNavCaption() {
    var nav = document.getElementById('archives-nav');
    if (!nav) return;
    var i = ADDR_STATE.current;
    var total = ADDR_STATE.sorted.length;
    var addr = ADDR_STATE.sorted[i];
    var dateEl = nav.querySelector('.nc-date');
    var labelEl = nav.querySelector('.nc-label');
    if (addr) {
      dateEl.textContent = fmtRange(addr.from, addr.to);
      labelEl.textContent = kindLabel(addr.kind) + ' · ' + (i + 1) + ' / ' + total;
    } else {
      dateEl.textContent = '—';
      labelEl.textContent = total ? '— / ' + total : '—';
    }
    nav.querySelector('.nav-first').disabled = i <= 0;
    nav.querySelector('.nav-prev').disabled = i <= 0;
    nav.querySelector('.nav-next').disabled = i < 0 || i >= total - 1;
    nav.querySelector('.nav-last').disabled = i < 0 || i >= total - 1;
  }

  function flyToIndex(i) {
    var total = ADDR_STATE.sorted.length;
    if (i < 0 || i >= total) return;
    ADDR_STATE.current = i;
    var addr = ADDR_STATE.sorted[i];
    var map = findMap();
    if (map) {
      map.flyTo([addr.lat, addr.lon], 16, { animate: true, duration: 0.8 });
      map.closePopup();
    }
    highlightActiveEntry();
    updateNavCaption();
  }

  function wireNavButtons() {
    var nav = document.getElementById('archives-nav');
    if (!nav || nav.__wired) return;
    nav.__wired = true;
    nav.querySelector('.nav-first').addEventListener('click', function () { flyToIndex(0); });
    nav.querySelector('.nav-prev').addEventListener('click', function () { flyToIndex(ADDR_STATE.current - 1); });
    nav.querySelector('.nav-next').addEventListener('click', function () { flyToIndex(ADDR_STATE.current + 1); });
    nav.querySelector('.nav-last').addEventListener('click', function () { flyToIndex(ADDR_STATE.sorted.length - 1); });
  }

  function loadFr() {
    if (ARCHIVES.data) return Promise.resolve(ARCHIVES.data);
    if (typeof EMBASSY_HISTORY_FR !== 'undefined') {
      ARCHIVES.data = EMBASSY_HISTORY_FR;
      return Promise.resolve(ARCHIVES.data);
    }
    var inline = document.getElementById('embassy-history-fr');
    if (inline && inline.textContent.trim()) {
      try {
        ARCHIVES.data = JSON.parse(inline.textContent);
        return Promise.resolve(ARCHIVES.data);
      } catch (e) {
        console.warn('Inline embassy-history JSON parse failed, falling back to fetch:', e);
      }
    }
    return fetch('data/embassy_history/fr.json')
      .then(function (r) {
        if (!r.ok) throw new Error('fr.json HTTP ' + r.status);
        return r.json();
      })
      .then(function (j) { ARCHIVES.data = j; return j; });
  }

  window.__openArchives = function () {
    loadFr().then(function (j) {
      renderPanel(j.embassies.US, j.host.name);
      var p = document.getElementById('archives-panel');
      p.classList.add('open');
      p.setAttribute('aria-hidden', 'false');
    }).catch(function (err) {
      console.error('Archives load failed:', err);
      var t = i18nDict();
      document.getElementById('ap-content').innerHTML =
        '<p class="ap-eyebrow"><span class="stamp">' + escapeHtml(t.archives || 'Archives') + '</span></p>' +
        '<p style="font-family:Fraunces,serif;color:#9e2b25">' + escapeHtml(t.dataUnavailable || 'Data unavailable') + ' (' + escapeHtml(err.message) + ').</p>';
      document.getElementById('archives-panel').classList.add('open');
    });
  };

  // Re-render archives panel on language change (only if it has data).
  window.__refreshArchives = function () {
    if (!LAST_RENDER.emb) return;
    renderPanel(LAST_RENDER.emb, LAST_RENDER.hostName);
    updateNavCaption();
    highlightActiveEntry();
  };

  window.__closeArchives = function () {
    var p = document.getElementById('archives-panel');
    p.classList.remove('open');
    p.setAttribute('aria-hidden', 'true');
    exitArchivesMode();
  };

  window.__toggleHistoric = function (on) {
    var map = findMap();
    if (!map) return;
    loadFr().then(function (j) {
      if (on) {
        if (!ARCHIVES.layer) ARCHIVES.layer = buildMarkers(j.embassies.US);
        ARCHIVES.layer.addTo(map);
      } else if (ARCHIVES.layer) {
        map.removeLayer(ARCHIVES.layer);
      }
    });
  };

  // Archives MODE: dim other markers, surface historic flags, open panel.
  // Entered by clicking the US-in-France marker; exited by closing the panel.
  var ARCHIVES_MODE = { active: false, dimmed: [], dimmedIcons: [] };

  // Folium nests markers in FeatureGroups, so map.eachLayer doesn't see them directly. Walk recursively.

  function popupHtml(marker) {
    var p = marker.getPopup && marker.getPopup();
    if (!p) return '';
    var c = p.getContent && p.getContent();
    if (typeof c === 'string') return c;
    if (c && c.outerHTML) return c.outerHTML;
    return '';
  }

  function enterArchivesMode(usMarker) {
    if (ARCHIVES_MODE.active) return;
    ARCHIVES_MODE.active = true;
    var map = findMap();
    if (!map) return;
    walkMarkers(map, function (layer) {
      if (layer === usMarker) return;
      if (layer.__archivesHistoric) return;
      try {
        var prev = layer.options.opacity != null ? layer.options.opacity : 1;
        ARCHIVES_MODE.dimmed.push({ marker: layer, prev: prev });
        layer.setOpacity(0.22);
        // divIcon markers (the embassy flag pins) don't honor setOpacity for inner HTML,
        // so also tag their element for CSS desaturation.
        var el = layer.getElement && layer.getElement();
        if (el) { el.classList.add('archives-dimmed'); ARCHIVES_MODE.dimmedIcons.push(el); }
      } catch (e) {}
    });
    if (usMarker) {
      var usEl = usMarker.getElement && usMarker.getElement();
      if (usEl) usEl.classList.add('archives-focused');
    }
    // Close any popup the click may have just opened (Folium's default G20-marker popup),
    // and keep popups closed for the duration of archives mode so info bubbles never hide flags.
    map.closePopup();
    if (!map.__archivesPopupGuard) {
      map.__archivesPopupGuard = function (e) {
        if (ARCHIVES_MODE.active) setTimeout(function () { map.closePopup(); }, 0);
      };
      map.on('popupopen', map.__archivesPopupGuard);
    }
    window.__toggleHistoric(true);
    window.__openArchives();
    // Default cursor: the current chancery; fall back to the latest entry. No auto-fly so the
    // overview the user just landed on stays visible until they click prev/next or a timeline entry.
    setTimeout(function () {
      wireNavButtons();
      var idx = ADDR_STATE.sorted.findIndex(function (a) { return a.current && a.kind === 'chancery'; });
      if (idx < 0) idx = ADDR_STATE.sorted.length - 1;
      ADDR_STATE.current = idx;
      updateNavCaption();
      highlightActiveEntry();
      var nav = document.getElementById('archives-nav');
      if (nav) nav.classList.add('visible');
    }, 60);
  }

  function exitArchivesMode() {
    // Run unconditionally so a stale state from a previous session still gets cleaned up.
    ARCHIVES_MODE.active = false;
    ARCHIVES_MODE.dimmed.forEach(function (entry) {
      try { entry.marker.setOpacity(entry.prev); } catch (e) {}
    });
    ARCHIVES_MODE.dimmed = [];
    ARCHIVES_MODE.dimmedIcons = [];
    // Belt-and-suspenders: sweep every leftover dimmed/focused element from the DOM, and
    // re-walk the map to reset opacity on any marker whose tracking we may have missed.
    document.querySelectorAll('.archives-dimmed, .archives-focused').forEach(function (el) {
      el.classList.remove('archives-dimmed');
      el.classList.remove('archives-focused');
      el.style.opacity = '';
    });
    var map = findMap();
    if (map) {
      walkMarkers(map, function (m) {
        try { m.setOpacity(1); } catch (e) {}
      });
    }
    window.__toggleHistoric(false);
    var nav = document.getElementById('archives-nav');
    if (nav) nav.classList.remove('visible');
    ADDR_STATE.current = -1;
  }

  // Find the US embassy marker located in France (popup mentions "Embassy of United States" + "France (Paris)").
  function findUsInFranceMarker() {
    var map = findMap();
    if (!map) return null;
    var found = null;
    walkMarkers(map, function (layer) {
      if (found) return;
      var html = popupHtml(layer);
      if (html.indexOf('Embassy of United States') !== -1 &&
          html.indexOf('France (Paris)') !== -1) {
        found = layer;
      }
    });
    return found;
  }

  function attachUsHandler() {
    var marker = findUsInFranceMarker();
    if (!marker || marker.__archivesBound) return marker;
    marker.__archivesBound = true;
    marker.on('click', function () { enterArchivesMode(marker); });
    return marker;
  }

  // Surface the click target whenever France becomes the active host.
  var prevGoToCountry = window.goToCountry;
  window.goToCountry = function (lat, lon, name) {
    if (prevGoToCountry) prevGoToCountry.apply(this, arguments);
    if (name === 'France') {
      // Layer activation runs via input.click() in the existing helper — give it a tick.
      setTimeout(attachUsHandler, 250);
      setTimeout(attachUsHandler, 700);
    } else {
      window.__closeArchives();
    }
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.__closeArchives();
  });
})();
