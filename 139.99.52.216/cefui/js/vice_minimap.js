/* EAGLE ROLEPLAY - Vice City CEF minimap
   Pawn event: vice_minimap {show, area, x, y, a, city}
   x/y are normalized 0..1 within the current 1-of-15 map tile.
*/
(function () {
  "use strict";
  var E = window.EAGLE;
  if (!E || !E.on) return;

  var root = null, map = null, marker = null, label = null, areaLabel = null;
  var currentArea = 0;

  function make(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function ensure() {
    if (root) return root;
    var hud = document.getElementById("hudlayer") || document.getElementById("app") || document.body;

    root = make("div", "vcmm");
    root.style.display = "none";
    map = make("div", "vcmm-map");
    marker = make("div", "vcmm-marker");
    marker.innerHTML = '<span class="vcmm-arrow"></span>';
    label = make("div", "vcmm-city");
    label.textContent = "VICE CITY";
    areaLabel = make("div", "vcmm-area");

    map.appendChild(marker);
    root.appendChild(map);
    root.appendChild(label);
    root.appendChild(areaLabel);
    hud.appendChild(root);
    return root;
  }

  function setTile(area) {
    if (area === currentArea) return;
    currentArea = area;
    map.className = "vcmm-map vcmm-area-" + area;
    // Tile browser opsional. onerror menghapus image dan CSS fallback tetap tampil.
    var url = "img/vice_minimap/" + area + ".webp" + ((window.__eagleBoot && window.__eagleBoot.q) || "");
    var probe = new Image();
    probe.onload = function () { if (currentArea === area) map.style.backgroundImage = 'url("' + url + '")'; };
    probe.onerror = function () { if (currentArea === area) map.style.backgroundImage = ""; };
    probe.src = url;
    areaLabel.textContent = "SECTOR " + String(area).padStart(2, "0");
  }

  E.on("vice_minimap", function (d) {
    ensure();
    if (!d || !d.show) {
      root.style.display = "none";
      return;
    }

    var area = Math.max(1, Math.min(15, +d.area || 1));
    var x = Math.max(0, Math.min(1, +d.x || 0));
    var y = Math.max(0, Math.min(1, +d.y || 0));
    var a = ((+d.a || 0) % 360 + 360) % 360;

    setTile(area);
    label.textContent = d.city || "VICE CITY";
    marker.style.left = (x * 100) + "%";
    marker.style.top = (y * 100) + "%";
    // GTA heading 0=north; CSS 0deg arrow points north.
    marker.style.transform = "translate(-50%,-50%) rotate(" + (-a) + "deg)";
    root.style.display = "block";
  });

  if (E.done) E.done("vice_minimap");
})();
