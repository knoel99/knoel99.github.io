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
