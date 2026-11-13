/* Only preview_auth.html loads this file. No real accounts or server traffic. */
(function () {
  "use strict";
  var M = window.EagleArrivalPreview = { events: [], auto: true, ucp: "demo_ucp", slot: 0 };
  var slots = [
    { name: "Arga_Pratama", skin: 7, level: 12, job: "Supir Bus", cash: 28500, bank: 147500, gender: 1, age: "25/09/2001", last: "17/10/2026 21:45" },
    { empty: 1 },
    { name: "Nadia_Satria", skin: 193, level: 6, job: "Warga", cash: 4200, bank: 23500, gender: 2, age: "12/04/2002", last: "16/10/2026 19:10" }
  ];
  var options = [
    { id: 5, t: "Lokasi Terakhir", s: "Liberty City", icon: "pin", x: 5100, y: 1500 },
    { id: 2, t: "Rumah", s: "Belum punya rumah", icon: "home", dis: 1 },
    { id: 4, t: "Apartemen", s: "Vice City", icon: "key", x: 4600, y: -3500 },
    { id: 3, t: "Markas Polisi", s: "Faction", icon: "shield", x: 1550, y: -1675 },
    { id: 6, t: "Bandara Liberty City", s: "Francis International", icon: "plane" },
    { id: 7, t: "Bandara Vice City", s: "Escobar International", icon: "plane" },
    { id: 0, t: "Bandara San Andreas", s: "Los Santos International", icon: "plane" }
  ];
  function emit(ev, d) { window.Cef._trigger(ev, JSON.stringify(d)); }
  M.emit = emit;
  M.view = function (screen) {
    var d = { v: screen, ucp: M.ucp, online: 37 };
    if (screen === "chars") { d.slots = slots; d.sel = M.slot; }
    if (screen === "create") { d.slot = 1; M.slot = 1; }
    if (screen === "wait") { d.text = "Menyiapkan penampilan karakter..."; d.skip = true; }
    if (screen === "loading") { emit("auth_lobby_transition", { phase: "start", location: "Liberty City" }); return; }
    if (screen === "lobby" || screen === "spawn") {
      var c = slots[M.slot]; if (!c || c.empty) { M.slot = 0; c = slots[0]; }
      d = { v: "spawn", ucp: M.ucp, name: c.name, level: c.level, money: c.cash, bank: c.bank, job: c.job === "Warga" ? 0 : 3, jobName: c.job,
        online: 37, newchar: M.newchar ? 1 : 0, opt: M.newchar ? options.slice(4) : options };
    }
    emit("auth", d);
  };
  M.receive = function (ev, json) {
    var p; try { p = JSON.parse(json); } catch (_) { return; }
    if (ev !== "ui" || p.v !== "auth") return;
    M.events.push({ a: p.a, i: p.i, s: p.a === "loginpass" || p.a === "regpass" ? "<redacted>" : p.s });
    if (!M.auto) return;
    setTimeout(function () {
      if (p.a === "loginpass" || p.a === "regpass" || p.a === "back" || p.a === "cancel") return M.view("chars");
      if (p.a === "slot") { M.slot = +p.i; return; }
      if (p.a === "play") {
        M.slot = +p.i;
        var c = slots[M.slot];
        if (!c || c.empty) return emit("auth", { v: "create", ucp: M.ucp, slot: M.slot });
        M.newchar = false; return M.view("spawn");
      }
      if (p.a === "spawn" || p.a === "refresh") return M.view("lobby");
      if (p.a === "createform") {
        var draft = JSON.parse(p.s);
        slots[M.slot] = { name: draft.first + "_" + draft.last, level: 1, skin: draft.gender === 2 ? 193 : 59, job: "Warga", cash: 4000, bank: 2000, gender: draft.gender, age: draft.dob, last: "Baru dibuat" };
        M.newchar = true; M.view("wait"); setTimeout(function () { M.view("spawn"); }, 1500); return;
      }
      if (p.a === "loc") {
        var o = options.find(function (a) { return +a.id === +p.i; });
        if (!o || o.dis) return emit("auth_lobby_result", { message: "Lokasi tidak tersedia." });
        emit("auth_lobby_transition", { phase: "start", location: o.t });
        setTimeout(function () { emit("auth_lobby_transition", { phase: "done" }); emit("auth", { v: "none" }); }, 1700);
        return;
      }
      if (p.a === "wardrobe") return emit("auth_result", { message: "Editor pakaian terbuka di dalam game. Pratinjau ini hanya menampilkan alur masuk." });
      if (p.a === "resync") return emit("auth_result", { message: "Status pratinjau diperbarui." });
      if (p.a === "quit") return emit("auth", { v: "none" });
    }, 220);
  };
  window.CefBridge = { sendClientEvent: M.receive, updateInteractiveAreas: function () {}, cefReady: function () {}, log: function () {} };
  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(location.search), screen = params.get("screen") || "login";
    var select = document.querySelector(".erp-preview-tools select");
    if (["spawnnew"].includes(screen)) { M.newchar = true; screen = "spawn"; }
    if (!["login", "register", "chars", "create", "lobby", "spawn", "wait", "loading"].includes(screen)) screen = "login";
    if (params.get("chrome") === "0") document.body.classList.add("erp-preview-clean");
    var bg = params.get("bg"), scene = document.querySelector(".erp-preview-scene");
    if (bg && scene) { scene.style.background = "url('" + bg.replace(/'/g, "") + "') center/cover"; scene.style.opacity = "1"; scene.classList.add("has-bg"); }
    select.value = screen;
    select.addEventListener("change", function () { M.view(select.value); });
    M.view(screen);
  });
})();
