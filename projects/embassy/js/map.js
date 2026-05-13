(function () {
  var mapId = "map_eb7ab2763940fdba25389e10a7118c56";
  var map = L.map(mapId, {
    center: [20.0, 0.0],
    zoom: 3,
    max_bounds: true,
    crs: L.CRS.EPSG3857
  });
  window[mapId] = map;

  L.control.scale().addTo(map);

  var tile_layer_satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Tiles &copy; Esri", maxZoom: 18, minZoom: 1 }
  );

  var tile_layer_voyager = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    { attribution: "&copy; OpenStreetMap contributors &copy; CARTO", subdomains: "abcd", maxZoom: 20, minZoom: 0 }
  );

  tile_layer_voyager.addTo(map);

  function flagImg(code, w, h, alt) {
    return '<img src="https://flagcdn.com/w40/' + code + '.png" width="' + w + '" height="' + h + '" style="vertical-align:middle;border:1px solid #ccc;border-radius:2px;" alt="' + (alt || '') + '">';
  }

  function flagEmoji(code) {
    if (code.length !== 2) return '';
    var c1 = code[0].toUpperCase().charCodeAt(0) - 65 + 0x1F1E6;
    var c2 = code[1].toUpperCase().charCodeAt(0) - 65 + 0x1F1E6;
    return String.fromCodePoint(c1, c2);
  }

  function powerCenterPopup(c) {
    return '<div style="font-family: Arial, sans-serif; min-width: 280px;">' +
      '<h3 style="margin:0 0 8px; color:#333; border-bottom: 2px solid #e74c3c;">' +
      flagImg(c.code, 24, 16, c.name) + ' ' + c.name +
      '</h3>' +
      '<p style="margin:4px 0;"><strong>Power Center:</strong> ' + c.powerCenter + '</p>' +
      '<p style="margin:4px 0;"><strong>Capital:</strong> ' + c.capital + '</p>' +
      '<p style="margin:4px 0;"><a href="https://www.google.com/maps?q=' + c.lat + ',' + c.lon + '" target="_blank" style="color:#1a73e8;text-decoration:none;font-size:12px;">\uD83D\uDCCD Open in Google Maps</a></p>' +
      '<hr style="margin:8px 0;">' +
      '<p style="margin:4px 0; font-size:0.9em;">' +
      '<strong>Avg. embassy distance:</strong> ' + c.avgDist + ' km<br>' +
      '<strong>Closest embassy:</strong> ' + flagImg(c.closest.code, 16, 10, c.closest.name) +
      '\n' + c.closest.name + ' (' + c.closest.dist + ' km)<br>' +
      '<strong>Farthest embassy:</strong> ' + flagImg(c.farthest.code, 16, 10, c.farthest.name) +
      '\n' + c.farthest.name + ' (' + c.farthest.dist + ' km)' +
      '</p></div>';
  }

  function embassyPopup(e, c) {
    var rankLabel = '';
    if (e.rank === 1) rankLabel = '\n                          (closest)';
    else if (e.rank === e.total) rankLabel = '\n                          (farthest)';

    return '<div style="font-family: Arial, sans-serif; min-width: 250px;">' +
      '<h4 style="margin:0 0 6px; color:#333;">' +
      flagImg(e.code, 24, 16, e.name) + ' Embassy of ' + e.name +
      '</h4>' +
      '<p style="margin:4px 0;">' +
      '<strong>Host:</strong> ' + flagImg(c.code, 16, 10, c.name) +
      ' ' + c.name + ' (' + c.capital + ')' +
      '</p>' +
      '<p style="margin:4px 0;">' +
      '<strong>Distance to ' + c.powerCenter + ':</strong>' +
      '\n<span style="color: ' + e.color + '; font-weight: bold;">' + e.dist + ' km</span>' +
      '</p>' +
      '<p style="margin:4px 0;">' +
      '<strong>Rank:</strong> #' + e.rank + ' / ' + e.total + rankLabel +
      '</p>' +
      '<p style="margin:6px 0 0;"><a href="https://www.google.com/maps?q=' + e.lat + ',' + e.lon + '" target="_blank" style="color:#1a73e8;text-decoration:none;font-size:12px;">\uD83D\uDCCD Open in Google Maps</a></p>' +
      '</div>';
  }

  var overlays = {};
  var countryFeatureGroups = {};


  window._goToCountryState = { name: null, close: false };
  window.goToCountry = function (lat, lon, name) {
    var maps = document.querySelectorAll('.folium-map');
    for (var i = 0; i < maps.length; i++) {
      var mId = maps[i].id;
      var m = window[mId];
      if (!m) continue;

      for (var key in window) {
        if (window[key] === m && key !== mId) {
          m = window[key];
          break;
        }
      }

      if (window._goToCountryState.name === name && !window._goToCountryState.close) {
        var bounds = L.latLng(lat, lon).toBounds(2600);
        m.flyToBounds(bounds, { maxZoom: 16, duration: 0.8 });
        window._goToCountryState.close = true;
      } else {
        m.flyTo([lat, lon], 12, { duration: 0.8 });
        window._goToCountryState = { name: name, close: false };
      }

      var inputs = document.querySelectorAll('.leaflet-control-layers-selector');
      for (var j = 0; j < inputs.length; j++) {
        var input = inputs[j];
        var label = input.closest('label') || input.parentElement;
        var text = label ? label.textContent : '';
        if (text.indexOf(name) !== -1) {
          if (!input.checked) input.click();
        } else if (text.indexOf('Overview') === -1 && text.indexOf('spy') === -1) {
          if (input.checked) input.click();
        }
      }
      break;
    }
  };

  fetch('data/manifest.json')
    .then(function (r) {
      if (!r.ok) throw new Error('manifest.json HTTP ' + r.status);
      return r.json();
    })
    .then(function (manifest) {
      var fragmentSet = {};
      manifest.fragments_available.forEach(function (f) { fragmentSet[f] = true; });
      window.__manifestFragments = fragmentSet;
      window.__manifestCountries = manifest.countries;

      var codes = Object.keys(manifest.countries).sort();
      var EMBASSY_DATA = codes.map(function (code) {
        var c = manifest.countries[code];
        var obj = {
          code: code.toLowerCase(),
          name: c.name,
          capital: c.capital,
          powerCenter: c.powerCenter,
          lat: c.lat,
          lon: c.lon,
          avgDist: c.avgDist,
          closest: c.closest,
          farthest: c.farthest,
          embassies: []
        };
        var guestCodes = Object.keys(manifest.embassies[code] || {});
        guestCodes.forEach(function (guestCode) {
          var e = manifest.embassies[code][guestCode];
          obj.embassies.push({
            code: guestCode.toLowerCase(),
            name: e.name,
            lat: e.lat,
            lon: e.lon,
            dist: e.dist,
            rank: e.rank,
            total: e.total,
            color: e.color,
            _hostCode: code,
            _guestCode: guestCode
          });
        });
        return obj;
      });

      EMBASSY_DATA.forEach(function (c) {
        var fg = L.featureGroup();

        var pcMarker = L.marker([c.lat, c.lon], {}).addTo(fg);
        var pcIcon = L.AwesomeMarkers.icon({
          markerColor: "red",
          iconColor: "white",
          icon: "star",
          prefix: "fa",
          extraClasses: "fa-rotate-0"
        });
        var pcPopup = L.popup({ maxWidth: 350 });
        pcPopup.setContent($('<div style="width: 100.0%; height: 100.0%;">' + powerCenterPopup(c) + '</div>')[0]);
        pcMarker.bindPopup(pcPopup);
        pcMarker.bindTooltip('<div>\n                     ' + flagEmoji(c.code) + ' ' + c.powerCenter + ' (' + c.name + ')\n                 </div>', { sticky: true });
        pcMarker.setIcon(pcIcon);

        c.embassies.forEach(function (e) {
          var eMarker = L.marker([e.lat, e.lon], {}).addTo(fg);
          var eDivIcon = L.divIcon({
            html: '<img src="https://flagcdn.com/w40/' + e.code + '.png" width="28" style="border:1px solid rgba(0,0,0,0.2);border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;">',
            iconSize: [28, 18],
            iconAnchor: [14, 9],
            className: "empty"
          });
          var ePopup = L.popup({ maxWidth: 300 });
          ePopup.setContent($('<div style="width: 100.0%; height: 100.0%;">' + embassyPopup(e, c) + '</div>')[0]);
          eMarker.bindPopup(ePopup);
          eMarker.bindTooltip('<div>\n                     ' + flagEmoji(e.code) + ' ' + e.name + ' - ' + e.dist + ' km\n                 </div>', { sticky: true });
          eMarker.setIcon(eDivIcon);

          eMarker.__hostCode = e._hostCode;
          eMarker.__guestCode = e._guestCode;

          var fragKey = e._hostCode + '_' + e._guestCode;
          if (fragmentSet[fragKey]) {
            eMarker.on('click', function () {
              if (window.__enterArchives) {
                window.__enterArchives(e._hostCode, e._guestCode, eMarker);
              }
            });
          }

          L.polyline(
            [[e.lat, e.lon], [c.lat, c.lon]],
            { bubblingMouseEvents: true, color: e.color, dashArray: "5 5", dashOffset: null, fill: false, fillColor: e.color, fillOpacity: 0.2, fillRule: "evenodd", lineCap: "round", lineJoin: "round", noClip: false, opacity: 0.6, smoothFactor: 1.0, stroke: true, weight: 2 }
          ).addTo(fg).bindTooltip('<div>\n                     ' + e.name + ' \u2192 ' + c.powerCenter + ': ' + e.dist + ' km\n                 </div>', { sticky: true });
        });

        var layerLabel = '<img src="https://flagcdn.com/w40/' + c.code + '.png" width="16" height="10" style="vertical-align:middle;border:1px solid #ccc;border-radius:2px;" alt="' + c.name + '"> ' + c.name;
        overlays[layerLabel] = fg;
        countryFeatureGroups[c.name] = fg;
      });

      var overviewFg = L.featureGroup();
      EMBASSY_DATA.forEach(function (c) {
        var m = L.marker([c.lat, c.lon], {}).addTo(overviewFg);
        var icon = L.AwesomeMarkers.icon({
          markerColor: "darkred",
          iconColor: "white",
          icon: "university",
          prefix: "fa",
          extraClasses: "fa-rotate-0"
        });
        m.bindTooltip('<div>\n                     ' + flagEmoji(c.code) + ' ' + c.name + ': ' + c.powerCenter + '\n                 </div>', { sticky: true });
        m.setIcon(icon);
      });
      overviewFg.addTo(map);
      overlays["Overview: All Power Centers"] = overviewFg;

      var lc = L.control.layers(
        { "Voyager": tile_layer_voyager, "Satellite": tile_layer_satellite },
        overlays,
        { position: "topright", collapsed: true, autoZIndex: true }
      ).addTo(map);

      L.control.fullscreen({
        position: "topleft",
        title: "Full Screen",
        titleCancel: "Exit Full Screen",
        forceSeparateButton: false
      }).addTo(map);

      overviewFg.eachLayer(function (marker) {
        var tooltip = marker.getTooltip && marker.getTooltip();
        if (!tooltip) return;
        var raw = String(tooltip.getContent() || '');
        var name = raw.replace(/<[^>]+>/g, '').replace(/[^\x00-\x7F]+/g, '').trim().split(':')[0].trim();
        if (!name) return;
        marker.on('click', function () {
          var ll = marker.getLatLng();
          goToCountry(ll.lat, ll.lng, name);
        });
      });

      var spyingZoneEasy = L.featureGroup();
      var spyingZoneMax = L.featureGroup();
      overviewFg.eachLayer(function (marker) {
        if (!marker.getLatLng) return;
        var ll = marker.getLatLng();
        var tooltip = marker.getTooltip && marker.getTooltip();
        var label = tooltip ? String(tooltip.getContent() || '').replace(/<[^>]+>/g, '').trim() : '';
        L.circle(ll, {
          radius: 1000, color: '#c0392b', weight: 1, opacity: 0.7,
          fillColor: '#e74c3c', fillOpacity: 0.20, interactive: false
        }).bindTooltip('Easy spying zone (~1 km) \u2014 ' + label, { sticky: true }).addTo(spyingZoneEasy);
        L.circle(ll, {
          radius: 5000, color: '#c0392b', weight: 1.5, opacity: 0.8,
          dashArray: '6 6', fill: false, interactive: false
        }).bindTooltip('Max spying zone (~5 km) \u2014 ' + label, { sticky: true }).addTo(spyingZoneMax);
      });
      spyingZoneEasy.addTo(map);
      spyingZoneMax.addTo(map);
      lc.addOverlay(spyingZoneEasy, '<span style="display:inline-block;width:12px;height:12px;background:rgba(231,76,60,0.25);border:1px solid #c0392b;vertical-align:middle;border-radius:50%;margin-right:4px;"></span>Easy spying (~1 km)');
      lc.addOverlay(spyingZoneMax, '<span style="display:inline-block;width:12px;height:12px;background:transparent;border:1.5px dashed #c0392b;vertical-align:middle;border-radius:50%;margin-right:4px;"></span>Max spying (~5 km)');

      (function () {
        var container = lc.getContainer();
        L.DomEvent.off(container, 'mouseenter mouseleave');
        var toggleLink = container.querySelector('.leaflet-control-layers-toggle');
        if (toggleLink) {
          L.DomEvent.off(toggleLink, 'click');
          L.DomEvent.on(toggleLink, 'click', function (e) {
            L.DomEvent.preventDefault(e);
            L.DomEvent.stopPropagation(e);
            if (container.classList.contains('leaflet-control-layers-expanded')) {
              lc.collapse();
            } else {
              lc.expand();
            }
          });
        }
      })();
    })
    .catch(function (err) {
      console.error('Failed to load manifest.json:', err);
    });
})();
