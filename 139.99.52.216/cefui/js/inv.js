/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : inv.js
   INVENTORY (pengganti textdraw Inv_Textdraw):
     kiri  : nama pemain + berat tas + 20 slot (4 kolom x 5 baris,
             baris pertama bernomor 1-4 seperti hotbar textdraw lama)
     tengah: Amount / Use / Give / Drop / Close
     kanan : "Grounds" 9 slot barang di tanah (muncul saat Drop ditekan)
   Tap slot = pilih; tap slot kosong saat ada item terpilih = pindah.
   Item juga bisa diseret (drag) ke slot kosong.
   Kirim: EAGLE.send("inv", aksi, index, teks)
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var SLOTS = 20, GROUND = 9;

  var st = { show: 0, it: [], gr: [], sel: -1, amt: 0, ground: 0, name: "", w: "0.0", wm: "150.0" };
  var root = h("div", { id: "inv", class: "inv" });
  U.layer("screenlayer").appendChild(root);

  var bag = h("div", { class: "inv-bag glass", "data-touch": "" });
  var mid = h("div", { class: "inv-mid", "data-touch": "" });
  var gnd = h("div", { class: "inv-gnd glass", "data-touch": "" });
  root.appendChild(bag); root.appendChild(mid); root.appendChild(gnd);

  // ---------- kerangka kiri ----------
  var head = h("div", { class: "inv-head" }, [
    h("div", { class: "inv-ava", html: U.icon("user") }),
    h("div", { class: "inv-who" }, [h("b", { class: "inv-name" }), h("small", { class: "inv-wt" })]),
    h("div", { class: "inv-search", html: U.icon("bag") + "<span>Tas</span>" })
  ]);
  var wbar = h("div", { class: "bar inv-wbar" }, h("i"));
  var grid = h("div", { class: "inv-grid" });
  bag.appendChild(head); bag.appendChild(wbar); bag.appendChild(grid);
  var cells = [];
  for (var i = 0; i < SLOTS; i++) {
    var c = h("div", { class: "inv-slot", "data-slot": i });
    if (i < 4) c.appendChild(h("span", { class: "inv-hot", text: String(i + 1) }));
    grid.appendChild(c); cells.push(c);
  }

  // ---------- tombol tengah ----------
  function mbtn(id, icon, label, cls) {
    var b = h("button", { class: "inv-btn " + (cls || ""), type: "button", "data-a": id }, [
      h("span", { class: "ib-i", html: U.icon(icon) }), h("span", { class: "ib-t", text: label })
    ]);
    b.addEventListener("click", function () { E.send("inv", id, st.sel); });
    mid.appendChild(b);
    return b;
  }
  var bAmt = mbtn("amount", "calc", "Amount", "amt");
  mbtn("use", "hand", "Use", "use");
  mbtn("give", "gift", "Give", "give");
  var bDrop = mbtn("drop", "down", "Drop", "drop");
  mbtn("close", "x", "Close", "close");

  // ---------- panel kanan (tanah) ----------
  gnd.appendChild(h("div", { class: "inv-head gh" }, [
    h("div", { class: "inv-ava", html: U.icon("pin") }), h("div", { class: "inv-who" }, [h("b", { text: "Grounds" }), h("small", { text: "Barang di sekitar" })])
  ]));
  var ggrid = h("div", { class: "inv-grid g3" });
  gnd.appendChild(ggrid);
  var gcells = [];
  for (var g = 0; g < GROUND; g++) {
    var gc = h("div", { class: "inv-slot gslot", "data-g": g });
    ggrid.appendChild(gc); gcells.push(gc);
  }
  gnd.appendChild(h("div", { class: "inv-tip", text: "Tap barang untuk mengambil, tap slot kosong untuk menjatuhkan barang terpilih." }));

  function slotHtml(it) {
    return '<span class="is-ic">' + U.esc(U.itemIcon(it.n, it.m)) + '</span>' +
      '<span class="is-q">' + (+it.q || 0) + 'x</span>' +
      '<span class="is-n">' + U.esc(U.plain(it.n || "")) + "</span>";
  }

  function render() {
    root.classList.toggle("on", !!st.show);
    root.classList.toggle("with-ground", !!st.ground);
    if (!st.show) return;
    head.querySelector(".inv-name").textContent = U.plain(st.name || "Player");
    head.querySelector(".inv-wt").textContent = st.w + " / " + st.wm + " kg";
    var pct = Math.max(0, Math.min(100, (parseFloat(st.w) || 0) / (parseFloat(st.wm) || 150) * 100));
    var wi = wbar.querySelector("i");
    wi.style.width = pct + "%";
    wi.className = pct >= 90 ? "c-err" : (pct >= 70 ? "c-warn" : "");

    var bySlot = {};
    (st.it || []).forEach(function (it) { bySlot[+it.s] = it; });
    for (var i = 0; i < SLOTS; i++) {
      var cell = cells[i], it = bySlot[i];
      var key = it ? (it.n + "|" + it.q + "|" + it.m) : "";
      if (cell._k !== key) {
        var hot = cell.querySelector(".inv-hot");
        cell.innerHTML = it ? slotHtml(it) : "";
        if (hot) cell.appendChild(hot);
        if (it && cell._k !== undefined) { cell.classList.remove("pop"); void cell.offsetWidth; cell.classList.add("pop"); }
        cell._k = key;
      }
      cell.classList.toggle("full", !!it);
      cell.classList.toggle("sel", +st.sel === i && !!it);
    }
    bAmt.querySelector(".ib-t").textContent = (+st.amt > 0) ? String(st.amt) : "Amount";
    bAmt.classList.toggle("set", +st.amt > 0);
    bDrop.classList.toggle("on", !!st.ground);

    var gs = {};
    (st.gr || []).forEach(function (it) { gs[+it.s] = it; });
    for (var g = 0; g < GROUND; g++) {
      var gc = gcells[g], gi = gs[g];
      gc.innerHTML = gi ? slotHtml(gi) : "";
      gc.classList.toggle("full", !!gi);
    }
    E.touch();
  }

  E.on("inv", function (d) {
    if (!d.show) { st.show = 0; render(); E.touch(); return; }
    for (var k in d) st[k] = d[k];
    if (!d.ground) { st.ground = 0; st.gr = []; }
    render();
  });

  // ---------- input: tap & drag ----------
  var drag = null;
  function slotFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && el !== document.body) {
      if (el.hasAttribute && el.hasAttribute("data-slot")) return { t: "s", i: +el.getAttribute("data-slot") };
      if (el.hasAttribute && el.hasAttribute("data-g")) return { t: "g", i: +el.getAttribute("data-g") };
      el = el.parentElement;
    }
    return null;
  }
  function onDown(ev) {
    var t = slotFromPoint(ev.clientX, ev.clientY);
    if (!t) return;
    drag = { t: t, x: ev.clientX, y: ev.clientY, moved: false, ghost: null, id: ev.pointerId };
  }
  function onMove(ev) {
    if (!drag || drag.t.t !== "s") return;
    var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.moved && dx * dx + dy * dy > 90) {
      var cell = cells[drag.t.i];
      if (!cell.classList.contains("full")) { drag = null; return; }
      drag.moved = true;
      drag.ghost = h("div", { class: "inv-ghost", html: cell.innerHTML });
      document.body.appendChild(drag.ghost);
      cell.classList.add("dragging");
    }
    if (drag.moved && drag.ghost) {
      drag.ghost.style.transform = "translate(" + (ev.clientX - 28) + "px," + (ev.clientY - 28) + "px)";
      var over = slotFromPoint(ev.clientX, ev.clientY);
      cells.forEach(function (c, i) { c.classList.toggle("over", !!over && over.t === "s" && over.i === i && i !== drag.t.i); });
    }
  }
  function onUp(ev) {
    if (!drag) return;
    var d = drag; drag = null;
    cells.forEach(function (c) { c.classList.remove("over", "dragging"); });
    if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
    var t = slotFromPoint(ev.clientX, ev.clientY);
    if (d.moved) {
      if (t && t.t === "s" && t.i !== d.t.i && !cells[t.i].classList.contains("full")) E.send("inv", "move", d.t.i, String(t.i));
      else if (t && t.t === "g") { E.send("inv", "sel", d.t.i); }
      return;
    }
    if (!t || t.t !== d.t.t || t.i !== d.t.i) return;
    if (t.t === "s") E.send("inv", "sel", t.i);
    else E.send("inv", "ground", t.i);
  }
  root.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", function () {
    if (drag && drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
    cells.forEach(function (c) { c.classList.remove("over", "dragging"); });
    drag = null;
  });
})();
