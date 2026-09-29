/* =====================================================================
   EAGLE ROLEPLAY - CEF Mobile : inv.js
   INVENTORY + QUICKBAR ala FiveM/QBCore
   - Inventory 20 slot, 5x4, Player kiri + Drop kanan.
   - Quickbar 6 slot di bawah; tap item = langsung OnPlayerUseItem.
   - Quickbar tetap tampil saat inventory tertutup.
   ===================================================================== */
(function () {
  "use strict";
  var E = window.EAGLE, U = window.UI, h = U.h;
  var SLOTS = 20, GROUND = 9, QUICK = 6;

  var st = { show: 0, it: [], gr: [], sel: -1, amt: 0, ground: 0, name: "", w: "0.0", wm: "150.0" };
  var quickbarTimer = 0, quickbarHasShown = false;
  var root = h("div", { id: "inv", class: "inv", "data-touch": "" });
  U.layer("screenlayer").appendChild(root);

  /* ----------------------------- inventory ----------------------------- */
  var bag = h("div", { class: "inv-bag glass" });
  var mid = h("div", { class: "inv-mid", "data-touch": "" });
  var gnd = h("div", { class: "inv-gnd glass" });
  root.appendChild(bag); root.appendChild(mid); root.appendChild(gnd);

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

  function mbtn(id, icon, label, cls) {
    var b = h("button", { class: "inv-btn " + (cls || ""), type: "button", "data-a": id }, [
      h("span", { class: "ib-i", html: U.icon(icon) }), h("span", { class: "ib-t", text: label })
    ]);
    b.addEventListener("click", function (ev) { ev.stopPropagation(); E.send("inv", id, st.sel); });
    mid.appendChild(b); return b;
  }
  var bAmt = mbtn("amount", "calc", "Amount", "amt");
  mbtn("use", "hand", "Use", "use");
  mbtn("give", "gift", "Give", "give");
  var bDrop = mbtn("drop", "down", "Drop", "drop");
  mbtn("close", "x", "Close", "close");

  /* ------------------------------- ground -------------------------------- */
  gnd.appendChild(h("div", { class: "inv-head" }, [
    h("div", { class: "inv-ava", html: U.icon("pin") }),
    h("div", { class: "inv-who" }, [h("b", { text: "Drop" }), h("small", { text: "Barang di sekitar" })]),
    h("div", { class: "inv-search", text: "0.00 / 100.00" })
  ]));
  var ggrid = h("div", { class: "inv-grid g3" });
  gnd.appendChild(ggrid);
  var gcells = [];
  for (var g = 0; g < GROUND; g++) {
    var gc = h("div", { class: "inv-slot gslot", "data-g": g });
    ggrid.appendChild(gc); gcells.push(gc);
  }
  gnd.appendChild(h("div", { class: "inv-tip", text: "Tap barang untuk mengambil. Pilih item lalu tap slot kosong untuk memindahkan." }));

  /* ------------------------------- quickbar -------------------------------- */
  var qbar = h("div", { id: "inv-quickbar", class: "inv-quickbar", "data-touch": "" });
  U.layer("hudlayer").appendChild(qbar);
  var qpeek = h("button", { id: "inv-quickpeek", class: "inv-quickpeek", type: "button", text: "INVENTORY" });
  U.layer("hudlayer").appendChild(qpeek);
  var qcells = [];
  for (var q = 0; q < QUICK; q++) {
    var qc = h("button", { class: "qs empty", type: "button", "data-q": q });
    qc.appendChild(h("span", { class: "qn", text: String(q + 1) }));
    qc.appendChild(h("span", { class: "qi" }));
    qc.appendChild(h("span", { class: "qq" }));
    qc.appendChild(h("span", { class: "qt" }));
    qbar.appendChild(qc); qcells.push(qc);
  }

  function itemHtml(it) {
    return '<span class="is-ic">' + U.esc(U.itemIcon(it.n, it.m)) + '</span>' +
      '<span class="is-q">' + (+it.q || 0) + 'x</span>' +
      '<span class="is-n">' + U.esc(U.plain(it.n || "")) + "</span>";
  }

  function quickbarDelay() {
    try {
      var keys=["eagle_hud_prefs_v10","eagle_hud_prefs_v9","eagle_hud_prefs_v8","eagle_hud_prefs_v7","eagle_hud_prefs_v6","eagle_hud_prefs_v5"], raw=null;
      for(var n=0;n<keys.length && !raw;n++){ var x=localStorage.getItem(keys[n]); if(x) raw=JSON.parse(x); }
      return raw && raw.quickbarAutoHide != null ? Math.max(0, +raw.quickbarAutoHide) : 5000;
    } catch(e) { return 5000; }
  }
  function setQuickbarAutoHidden(hidden) {
    qbar.classList.toggle("auto-hidden", !!hidden);
    qpeek.classList.toggle("on", !!hidden && qbar.classList.contains("on") && !st.show);
    qpeek.textContent = hidden ? "SHOW ITEMS" : "INVENTORY";
  }
  function clearQuickbarTimer() { if (quickbarTimer) { clearTimeout(quickbarTimer); quickbarTimer = 0; } }
  function wakeQuickbar(delayAgain) {
    clearQuickbarTimer();
    if (!qbar.classList.contains("on") || st.show) { setQuickbarAutoHidden(false); return; }
    setQuickbarAutoHidden(false);
    quickbarHasShown = true;
    var delay = quickbarDelay();
    if (delayAgain !== false && delay > 0) quickbarTimer = setTimeout(function(){
      if (!st.show && qbar.classList.contains("on")) setQuickbarAutoHidden(true);
    }, delay);
  }
  function renderQuickbar(data) {
    var wasOn = qbar.classList.contains("on");
    qbar.classList.toggle("on", !!data.show);
    qbar.classList.toggle("inventory-open", !!st.show);
    if (!data.show) { clearQuickbarTimer(); setQuickbarAutoHidden(false); qpeek.classList.remove("on"); quickbarHasShown=false; return; }
    if (!wasOn) wakeQuickbar(true);
    var bySlot = {};
    (data.it || []).forEach(function (it) { bySlot[+it.s] = it; });
    for (var i = 0; i < QUICK; i++) {
      var c = qcells[i], it = bySlot[i];
      c.className = "qs " + (it ? "filled" : "empty") + ((!it && i === 5) ? " locked" : "");
      c.querySelector(".qi").innerHTML = it ? U.esc(U.itemIcon(it.n, it.m)) : ((!it && i === 5) ? '<span class="qlock">' + U.icon("lock") + '</span>' : "");
      c.querySelector(".qq").textContent = it ? ((+it.q || 0) + "x") : "";
      c.querySelector(".qt").textContent = it ? U.plain(it.n || "") : "";
    }
    E.touch();
  }

  function render() {
    root.classList.toggle("on", !!st.show);
    root.classList.toggle("with-ground", !!st.ground);
    qbar.classList.toggle("inventory-open", !!st.show);
    if (st.show) { clearQuickbarTimer(); setQuickbarAutoHidden(false); qpeek.classList.remove("on"); }
    if (!st.show) { renderQuickbar({ show: qbar.classList.contains("on"), it: quickState.it }); if (qbar.classList.contains("on")) wakeQuickbar(true); return; }

    head.querySelector(".inv-name").textContent = U.plain(st.name || "Player");
    head.querySelector(".inv-wt").textContent = st.w + " / " + st.wm + " kg";

    var bySlot = {};
    (st.it || []).forEach(function (it) { bySlot[+it.s] = it; });
    for (var i = 0; i < SLOTS; i++) {
      var cell = cells[i], it = bySlot[i];
      var key = it ? (it.n + "|" + it.q + "|" + it.m) : "";
      if (cell._k !== key) {
        var hot = cell.querySelector(".inv-hot");
        cell.innerHTML = it ? itemHtml(it) : "";
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
      gc.innerHTML = gi ? itemHtml(gi) : "";
      gc.classList.toggle("full", !!gi);
    }
    E.touch();
  }

  /* Separate state for the always-on quickbar. */
  var quickState = { show: 0, it: [] };
  E.on("invbar", function (d) {
    var wasOn = qbar.classList.contains("on");
    for (var k in d) quickState[k] = d[k];
    renderQuickbar(quickState);
    if (quickState.show && !wasOn) wakeQuickbar(true);
  });

  E.on("inv", function (d) {
    if (!d.show) { st.show = 0; render(); E.touch(); return; }
    for (var k in d) st[k] = d[k];
    if (!d.ground) { st.ground = 0; st.gr = []; }
    render();
  });

  /* ------------------------------- quick use ------------------------------- */
  qbar.addEventListener("pointerdown", function(){ wakeQuickbar(true); });
  qpeek.addEventListener("pointerdown", function(ev){ ev.preventDefault(); ev.stopPropagation(); wakeQuickbar(true); });
  qbar.addEventListener("click", function (ev) {
    wakeQuickbar(true);
    var el = ev.target;
    while (el && el !== qbar && !el.hasAttribute("data-q")) el = el.parentElement;
    if (!el || el === qbar) return;
    var i = +el.getAttribute("data-q");
    var q = null;
    (quickState.it || []).forEach(function (it) { if (+it.s === i) q = it; });
    if (q) E.send("inv", "quickuse", i);
  });

  /* ------------------------------- input inventory ------------------------------- */
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
    if (!st.show) return;
    var t = slotFromPoint(ev.clientX, ev.clientY);
    if (!t) return;
    drag = { t: t, x: ev.clientX, y: ev.clientY, moved: false, ghost: null };
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
      else if (t && t.t === "g") E.send("inv", "sel", d.t.i);
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
