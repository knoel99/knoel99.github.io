(function () {
  var ARCHIVES = { data: null, layer: null, map: null };

  var findMap = window.EmbassyUtils.findMap;
  var walkMarkers = window.EmbassyUtils.walkMarkers;

  function fmtRange(from, to) {
    if (!to) return from + ' \u2192';
    if (from === to) return from;
    return from + '\u2013' + to;
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

  /* Pick a translation for the entry's note in the requested language.
     If the slot exists but contains the French original (untranslated),
     fall back to English. If even English is the French original, fall
     back to the original French. */
  function pickNote(entry, lang) {
    var fr = entry.note || '';
    var ni = entry.note_i18n || {};
    if (lang === 'fr') return fr;
    var t = ni[lang];
    if (t && t !== fr) return t;
    var en = ni.en;
    if (en && en !== fr) return en;
    return fr;
  }

  /* Common French descriptive phrases that appear in the (untranslated)
     `address` and `building` fields. Translated at render time so the
     timeline shows in the user's language. Proper nouns (street names,
     building names) are left alone. */
  var FIELD_PHRASES = {
    en: {
      "adresse précise non établie dans les sources publiques": "exact address not established in public sources",
      "adresse exacte non établie dans les sources publiques": "exact address not established in public sources",
      "adresse exacte non établie dans les sources consultées": "exact address not established in consulted sources",
      "adresse des premières décennies non établie avec certitude": "address of the early decades not established with certainty",
      "adresse transitoire non établie avec certitude": "transitional address not established with certainty",
      "locaux provisoires, adresse précise non établie": "temporary premises, exact address not established",
      "siège provisoire, adresse précise non établie": "temporary headquarters, exact address not established",
      "adresse précise non établie": "exact address not established",
      "adresse exacte non établie": "exact address not established",
      "adresse précise non déterminée": "exact address not determined",
      "résidence dans l'enceinte de l'ambassade": "residence within the embassy compound",
      "locaux provisoires non identifiés": "temporary premises not identified",
      "adresses historiques non établies": "historic addresses not established",
      "représentation interrompue": "representation interrupted",
      "Chancellerie de l'ambassade": "Chancery of the embassy",
      "Résidence de l'ambassadeur": "Ambassador's residence"
    },
    es: {
      "adresse précise non établie dans les sources publiques": "dirección exacta no establecida en fuentes públicas",
      "adresse exacte non établie dans les sources publiques": "dirección exacta no establecida en fuentes públicas",
      "adresse exacte non établie dans les sources consultées": "dirección exacta no establecida en las fuentes consultadas",
      "adresse des premières décennies non établie avec certitude": "dirección de las primeras décadas no establecida con certeza",
      "adresse transitoire non établie avec certitude": "dirección transitoria no establecida con certeza",
      "locaux provisoires, adresse précise non établie": "sede provisional, dirección exacta no establecida",
      "siège provisoire, adresse précise non établie": "sede provisional, dirección exacta no establecida",
      "adresse précise non établie": "dirección exacta no establecida",
      "adresse exacte non établie": "dirección exacta no establecida",
      "adresse précise non déterminée": "dirección exacta no determinada",
      "résidence dans l'enceinte de l'ambassade": "residencia dentro del recinto de la embajada",
      "locaux provisoires non identifiés": "sede provisional no identificada",
      "adresses historiques non établies": "direcciones históricas no establecidas",
      "représentation interrompue": "representación interrumpida",
      "Chancellerie de l'ambassade": "Cancillería de la embajada",
      "Résidence de l'ambassadeur": "Residencia del embajador"
    },
    pt: {
      "adresse précise non établie dans les sources publiques": "endereço exato não estabelecido em fontes públicas",
      "adresse exacte non établie dans les sources publiques": "endereço exato não estabelecido em fontes públicas",
      "adresse exacte non établie dans les sources consultées": "endereço exato não estabelecido nas fontes consultadas",
      "adresse des premières décennies non établie avec certitude": "endereço das primeiras décadas não estabelecido com certeza",
      "adresse transitoire non établie avec certitude": "endereço transitório não estabelecido com certeza",
      "locaux provisoires, adresse précise non établie": "sede provisória, endereço exato não estabelecido",
      "siège provisoire, adresse précise non établie": "sede provisória, endereço exato não estabelecido",
      "adresse précise non établie": "endereço exato não estabelecido",
      "adresse exacte non établie": "endereço exato não estabelecido",
      "adresse précise non déterminée": "endereço exato não determinado",
      "résidence dans l'enceinte de l'ambassade": "residência no recinto da embaixada",
      "locaux provisoires non identifiés": "sede provisória não identificada",
      "adresses historiques non établies": "endereços históricos não estabelecidos",
      "représentation interrompue": "representação interrompida",
      "Chancellerie de l'ambassade": "Chancelaria da embaixada",
      "Résidence de l'ambassadeur": "Residência do embaixador"
    },
    de: {
      "adresse précise non établie dans les sources publiques": "genaue Adresse in öffentlichen Quellen nicht ermittelt",
      "adresse exacte non établie dans les sources publiques": "genaue Adresse in öffentlichen Quellen nicht ermittelt",
      "adresse exacte non établie dans les sources consultées": "genaue Adresse in den eingesehenen Quellen nicht ermittelt",
      "adresse des premières décennies non établie avec certitude": "Adresse der ersten Jahrzehnte nicht sicher ermittelt",
      "adresse transitoire non établie avec certitude": "Übergangsadresse nicht sicher ermittelt",
      "locaux provisoires, adresse précise non établie": "provisorische Räumlichkeiten, genaue Adresse nicht ermittelt",
      "siège provisoire, adresse précise non établie": "vorläufiger Sitz, genaue Adresse nicht ermittelt",
      "adresse précise non établie": "genaue Adresse nicht ermittelt",
      "adresse exacte non établie": "genaue Adresse nicht ermittelt",
      "adresse précise non déterminée": "genaue Adresse nicht bestimmt",
      "résidence dans l'enceinte de l'ambassade": "Residenz auf dem Botschaftsgelände",
      "locaux provisoires non identifiés": "provisorische Räumlichkeiten nicht identifiziert",
      "adresses historiques non établies": "historische Adressen nicht ermittelt",
      "représentation interrompue": "Vertretung unterbrochen",
      "Chancellerie de l'ambassade": "Kanzlei der Botschaft",
      "Résidence de l'ambassadeur": "Residenz des Botschafters"
    },
    it: {
      "adresse précise non établie dans les sources publiques": "indirizzo preciso non stabilito nelle fonti pubbliche",
      "adresse exacte non établie dans les sources publiques": "indirizzo esatto non stabilito nelle fonti pubbliche",
      "adresse exacte non établie dans les sources consultées": "indirizzo esatto non stabilito nelle fonti consultate",
      "adresse des premières décennies non établie avec certitude": "indirizzo dei primi decenni non stabilito con certezza",
      "adresse transitoire non établie avec certitude": "indirizzo transitorio non stabilito con certezza",
      "locaux provisoires, adresse précise non établie": "sede provvisoria, indirizzo preciso non stabilito",
      "siège provisoire, adresse précise non établie": "sede provvisoria, indirizzo preciso non stabilito",
      "adresse précise non établie": "indirizzo preciso non stabilito",
      "adresse exacte non établie": "indirizzo esatto non stabilito",
      "adresse précise non déterminée": "indirizzo preciso non determinato",
      "résidence dans l'enceinte de l'ambassade": "residenza all'interno del complesso dell'ambasciata",
      "locaux provisoires non identifiés": "sede provvisoria non identificata",
      "adresses historiques non établies": "indirizzi storici non stabiliti",
      "représentation interrompue": "rappresentanza interrotta",
      "Chancellerie de l'ambassade": "Cancelleria dell'ambasciata",
      "Résidence de l'ambassadeur": "Residenza dell'ambasciatore"
    }
  };

  function translateField(text, lang) {
    if (!text || lang === 'fr') return text;
    var subs = FIELD_PHRASES[lang];
    if (!subs) {
      /* For languages without a substitution table, fall back to English so
         the user does not see French descriptive phrases mixed in. */
      subs = FIELD_PHRASES.en;
    }
    var out = text;
    /* Apply longest keys first so 'adresse exacte non établie dans les
       sources publiques' wins over 'adresse exacte non établie'. */
    Object.keys(subs).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) {
      out = out.split(k).join(subs[k]);
    });
    return out;
  }

  var ADDR_STATE = { sorted: [], markers: [], current: -1 };

  function sortedAddresses(emb) {
    return emb.addresses.slice().sort(function (a, b) {
      return parseInt(a.from, 10) - parseInt(b.from, 10);
    });
  }

  var PERSON_SVG = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
                 + '<circle cx="8" cy="5" r="2.5" fill="currentColor"/>'
                 + '<path d="M2.8 14 C2.8 10.9, 5.1 8.8, 8 8.8 C10.9 8.8, 13.2 10.9, 13.2 14 Z" fill="currentColor"/>'
                 + '</svg>';

  var LAST_RENDER = { emb: null, hostName: null };

  function renderPanel(emb, hostName) {
    LAST_RENDER.emb = emb;
    LAST_RENDER.hostName = hostName;
    var t = i18nDict();
    var lang = (window.__getLang && window.__getLang()) || 'en';
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
    var titleTpl = t.archivesTitle || 'Two and a half centuries of <em>diplomatic addresses</em>';
    html += '<h2 id="ap-title-h2" class="ap-title">' + titleTpl + '</h2>';
    var ledeTpl = t.archivesLede
      || '{n} successive addresses tell the story of the Embassy of {name} in {host}.';
    html += '<p class="ap-lede">' + ledeTpl
      .replace('{n}', addrs.length)
      .replace('{name}', escapeHtml(emb.name))
      .replace('{host}', escapeHtml(hostName))
      + '</p>';
    html += '<div class="ap-timeline">';
    addrs.forEach(function (e, i) {
      html += '<div class="ap-entry' + (e.current ? ' current' : '') + '" data-index="' + i + '" '
           + 'style="animation-delay:' + (i * 60) + 'ms" '
           + 'role="button" tabindex="0">';
      html += '<div class="ap-date">'
           + '<span>' + escapeHtml(fmtRange(e.from, e.to)) + '</span>'
           + (e.kind ? '<span class="ap-kind">' + escapeHtml(kindLabel(e.kind)) + '</span>' : '')
           + '</div>';
      html += '<h3>' + escapeHtml(translateField(e.address, lang)) + '</h3>';
      if (e.building) html += '<p class="ap-building">' + escapeHtml(translateField(e.building, lang)) + '</p>';
      var noteText = pickNote(e, lang);
      html += '<p class="ap-note">' + escapeHtml(noteText) + '</p>';
      html += '</div>';
    });
    html += '</div>';
    document.getElementById('ap-content').innerHTML = html;
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
      labelEl.textContent = kindLabel(addr.kind) + ' \u00b7 ' + (i + 1) + ' / ' + total;
    } else {
      dateEl.textContent = '\u2014';
      labelEl.textContent = total ? '\u2014 / ' + total : '\u2014';
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

  var _fragmentCache = {};
  var _hostCache = {};

  function loadFragment(hostCode, guestCode) {
    var key = hostCode + '_' + guestCode;
    if (_fragmentCache[key]) return Promise.resolve(_fragmentCache[key]);

    var hostLower = hostCode.toLowerCase();
    var hostPromise = _hostCache[hostLower] || (_hostCache[hostLower] =
      fetch('data/embassy_history/' + hostLower + '.json').then(function (r) {
        if (!r.ok) return null;
        return r.json();
      }).catch(function () { return null; })
    );

    return hostPromise.then(function (hostData) {
      if (hostData && hostData.embassies && hostData.embassies[guestCode]) {
        var data = hostData.embassies[guestCode];
        _fragmentCache[key] = data;
        return data;
      }
      return fetch('data/embassy_history/_fragments/' + key + '.json')
        .then(function (r) {
          if (!r.ok) throw new Error(key + '.json HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          _fragmentCache[key] = data;
          return data;
        });
    });
  }

  function getHostName(code) {
    if (window.__manifestCountries && window.__manifestCountries[code]) {
      return window.__manifestCountries[code].name;
    }
    return code;
  }

  window.__enterArchives = function (hostCode, guestCode, clickedMarker) {
    if (ARCHIVES_MODE.active) exitArchivesMode();

    var t = i18nDict();
    var hostName = getHostName(hostCode);

    var p = document.getElementById('archives-panel');
    p.classList.add('open');
    p.setAttribute('aria-hidden', 'false');
    document.getElementById('ap-content').innerHTML =
      '<p class="ap-eyebrow"><span class="stamp">' + escapeHtml(t.archives || 'Archives') + '</span><span>' + escapeHtml(t.loading || 'Loading\u2026') + '</span></p>';

    loadFragment(hostCode, guestCode).then(function (frag) {
      renderPanel(frag, hostName);
      enterArchivesMode(clickedMarker, frag);
    }).catch(function (err) {
      console.error('Fragment load failed:', err);
      document.getElementById('ap-content').innerHTML =
        '<p class="ap-eyebrow"><span class="stamp">' + escapeHtml(t.archives || 'Archives') + '</span></p>' +
        '<p style="font-family:Fraunces,serif;color:#9e2b25">' + escapeHtml(t.dataUnavailable || 'Data unavailable') + ' (' + escapeHtml(err.message) + ').</p>';
    });
  };

  window.__closeArchives = function () {
    var p = document.getElementById('archives-panel');
    p.classList.remove('open');
    p.setAttribute('aria-hidden', 'true');
    exitArchivesMode();
  };

  window.__refreshArchives = function () {
    if (!LAST_RENDER.emb) return;
    renderPanel(LAST_RENDER.emb, LAST_RENDER.hostName);
    updateNavCaption();
    highlightActiveEntry();
  };

  var ARCHIVES_MODE = { active: false, dimmed: [], dimmedIcons: [] };

  function popupHtml(marker) {
    var p = marker.getPopup && marker.getPopup();
    if (!p) return '';
    var c = p.getContent && p.getContent();
    if (typeof c === 'string') return c;
    if (c && c.outerHTML) return c.outerHTML;
    return '';
  }

  function enterArchivesMode(clickedMarker, fragData) {
    if (ARCHIVES_MODE.active) return;
    ARCHIVES_MODE.active = true;
    var map = findMap();
    if (!map) return;
    walkMarkers(map, function (layer) {
      if (layer === clickedMarker) return;
      if (layer.__archivesHistoric) return;
      try {
        var prev = layer.options.opacity != null ? layer.options.opacity : 1;
        ARCHIVES_MODE.dimmed.push({ marker: layer, prev: prev });
        layer.setOpacity(0.22);
        var el = layer.getElement && layer.getElement();
        if (el) { el.classList.add('archives-dimmed'); ARCHIVES_MODE.dimmedIcons.push(el); }
      } catch (e) {}
    });
    if (clickedMarker) {
      var clickedEl = clickedMarker.getElement && clickedMarker.getElement();
      if (clickedEl) clickedEl.classList.add('archives-focused');
    }
    map.closePopup();
    if (!map.__archivesPopupGuard) {
      map.__archivesPopupGuard = function (e) {
        if (ARCHIVES_MODE.active) setTimeout(function () { map.closePopup(); }, 0);
      };
      map.on('popupopen', map.__archivesPopupGuard);
    }

    if (!ARCHIVES.layer && fragData) {
      ARCHIVES.layer = buildMarkers(fragData);
    }
    if (ARCHIVES.layer) ARCHIVES.layer.addTo(map);

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
    ARCHIVES_MODE.active = false;
    ARCHIVES_MODE.dimmed.forEach(function (entry) {
      try { entry.marker.setOpacity(entry.prev); } catch (e) {}
    });
    ARCHIVES_MODE.dimmed = [];
    ARCHIVES_MODE.dimmedIcons = [];
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
    if (ARCHIVES.layer) {
      var m = findMap();
      if (m) m.removeLayer(ARCHIVES.layer);
      ARCHIVES.layer = null;
    }
    var nav = document.getElementById('archives-nav');
    if (nav) nav.classList.remove('visible');
    ADDR_STATE.current = -1;
  }

  var prevGoToCountry = window.goToCountry;
  window.goToCountry = function (lat, lon, name) {
    if (ARCHIVES_MODE.active) window.__closeArchives();
    if (prevGoToCountry) prevGoToCountry.apply(this, arguments);
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.__closeArchives();
  });
})();
