/* =====================================================================
   EAGLE ROLEPLAY - Global CEF Dialog Menu v51
   Semua dialog Pawn lama dirender sebagai menu FiveM-style tanpa mengubah
   callback server. Mendukung MSGBOX, INPUT, PASSWORD, LIST, TABLIST,
   TABLIST_HEADERS.
   ===================================================================== */
(function () {
  "use strict";

  var E = window.EAGLE, U = window.UI;
  if (!E || !U) return;

  var layer = U.layer("dialoglayer");
  var root = document.createElement("div");
  root.id = "eagle-dialog";
  root.className = "edlg";
  root.setAttribute("aria-hidden", "true");
  layer.appendChild(root);

  var state = null;
  var selected = 0;
  var locked = false;

  function text(v) { return String(v == null ? "" : v); }
  function plain(v) {
    return U.plain(text(v).replace(/~t~/gi, " ")).replace(/\r/g, "").replace(/\s+/g, " ").trim();
  }
  function rawLines(v) {
    return text(v).replace(/~n~/gi, "\n").replace(/\r/g, "").split("\n");
  }
  function dialogLines(v) {
    var src = rawLines(v);
    // Native dialog tidak membuat item tambahan hanya karena string diakhiri \n.
    // Blank line di tengah tetap dipertahankan agar listitem tidak bergeser.
    while (src.length > 1 && src[src.length - 1] === "") src.pop();
    return src;
  }
  function clearColors(v) {
    return text(v)
      .replace(/\{[0-9A-Fa-f]{6}\}/g, "")
      .replace(/~n~/gi, "\n")
      .replace(/~[a-z]~/gi, "")
      .replace(/\r/g, "");
  }
  function titleText(v) {
    var t = clearColors(v).replace(/\s+/g, " ").trim();
    return t || "EAGLE ROLEPLAY";
  }

  var KINDS = [
    { k: "admin", icon: "badge", label: "STAFF CONTROL", rx: /admin|staff|server panel|management|ban|kick|jail|warn|report/i },
    { k: "police", icon: "badge", label: "PUBLIC SERVICE", rx: /police|sapd|lspd|faction|ems|medic|pemerintah|government|mdc|wanted/i },
    { k: "finance", icon: "wallet", label: "FINANCE", rx: /bank|atm|saldo|deposit|withdraw|tarik|setor|transfer|paycheck|uang/i },
    { k: "property", icon: "home", label: "PROPERTY", rx: /rumah|house|rusun|gudang|brankas|garage|garasi|property|door|pintu/i },
    { k: "vehicle", icon: "car", label: "VEHICLE", rx: /vehicle|kendaraan|bagasi|bengkel|workshop|modshop|engine|plate|nomor polisi/i },
    { k: "job", icon: "briefcase", label: "CAREER", rx: /job|pekerjaan|disnaker|taxi|trucker|miner|tambang|nelayan|farmer|delivery/i },
    { k: "shop", icon: "store", label: "COMMERCE", rx: /shop|store|warung|pasar|beli|buy|jual|dealer|showroom|market/i },
    { k: "weapon", icon: "target", label: "EQUIPMENT", rx: /weapon|senjata|ammo|peluru|gun|rifle|pistol|chest/i },
    { k: "character", icon: "user", label: "CHARACTER", rx: /character|skin|clothes|cloth|toy|aksesor|style|appearance/i }
  ];

  function classify(d) {
    var hay = titleText(d.title) + " " + plain(d.info);
    for (var i = 0; i < KINDS.length; i++) if (KINDS[i].rx.test(hay)) return KINDS[i];
    return { k: "general", icon: "list", label: "INTERACTION" };
  }

  function icon(name) {
    try { return U.icon(name); } catch (e) { return U.icon("info"); }
  }

  function escapeAttr(s) {
    return text(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function splitCols(line) {
    var a = text(line).split(/\t|~t~/gi);
    if (!a.length) a = [line];
    return a;
  }

  function buttonLabel(v, fallback) {
    var x = plain(v);
    return x || fallback;
  }

  function isList(style) { return style === 2 || style === 4 || style === 5; }
  function isInput(style) { return style === 1 || style === 3; }

  function listData(d) {
    var lines = dialogLines(d.info), header = null;
    if (d.style === 5 && lines.length) header = splitCols(lines.shift());
    var rows = [];
    for (var i = 0; i < lines.length; i++) rows.push({ index: i, raw: lines[i], cols: splitCols(lines[i]) });
    return { header: header, rows: rows };
  }

  function renderInfoBlock(info) {
    var box = document.createElement("div");
    box.className = "edlg-copy";
    var lines = rawLines(info);
    for (var i = 0; i < lines.length; i++) {
      var line = document.createElement("div");
      line.className = "edlg-copy-line";
      line.innerHTML = U.fmt(lines[i].replace(/~t~/gi, "    "));
      box.appendChild(line);
    }
    return box;
  }

  function renderTableHeader(cols) {
    if (!cols || !cols.length) return null;
    var row = document.createElement("div");
    row.className = "edlg-row edlg-row-head cols-" + Math.min(cols.length, 6);
    for (var i = 0; i < cols.length && i < 6; i++) {
      var c = document.createElement("span");
      c.innerHTML = U.fmt(cols[i]);
      row.appendChild(c);
    }
    return row;
  }

  function selectRow(index) {
    selected = Math.max(0, index | 0);
    var rows = root.querySelectorAll(".edlg-row-item");
    for (var i = 0; i < rows.length; i++) rows[i].classList.toggle("selected", +(rows[i].getAttribute("data-index") || -1) === selected);
  }

  function renderList(d, body) {
    var data = listData(d);
    var list = document.createElement("div");
    list.className = "edlg-list";

    if (data.header) {
      var hh = renderTableHeader(data.header);
      if (hh) list.appendChild(hh);
    }

    if (!data.rows.length) {
      var empty = document.createElement("div");
      empty.className = "edlg-empty";
      empty.textContent = "Tidak ada pilihan tersedia";
      list.appendChild(empty);
    }

    for (var i = 0; i < data.rows.length; i++) {
      (function (r) {
        var row = document.createElement("button");
        row.type = "button";
        row.className = "edlg-row edlg-row-item cols-" + Math.min(r.cols.length, 6) + (r.index === selected ? " selected" : "");
        row.setAttribute("data-index", String(r.index));
        row.setAttribute("data-touch", "1");

        var mark = document.createElement("span");
        mark.className = "edlg-row-mark";
        mark.innerHTML = icon("next");
        row.appendChild(mark);

        for (var c = 0; c < r.cols.length && c < 6; c++) {
          var cell = document.createElement("span");
          cell.className = "edlg-cell" + (c === 0 ? " primary" : "");
          cell.innerHTML = U.fmt(r.cols[c]);
          row.appendChild(cell);
        }

        row.addEventListener("click", function () { selectRow(r.index); E.touch(); });
        row.addEventListener("dblclick", function () { selectRow(r.index); submit(true); });
        list.appendChild(row);
      })(data.rows[i]);
    }

    body.appendChild(list);
    return data.rows.length;
  }

  function renderInput(d, body) {
    var prompt = renderInfoBlock(d.info);
    prompt.classList.add("edlg-prompt");
    body.appendChild(prompt);

    var wrap = document.createElement("label");
    wrap.className = "edlg-input-wrap";
    var cap = document.createElement("span");
    cap.className = "edlg-input-label";
    cap.textContent = d.style === 3 ? "PASSWORD" : "INPUT";
    var input = document.createElement("input");
    input.className = "edlg-input";
    input.id = "edlg-input";
    input.type = d.style === 3 ? "password" : "text";
    input.maxLength = 255;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("data-touch", "1");
    input.placeholder = d.style === 3 ? "Masukkan password..." : "Ketik di sini...";
    wrap.appendChild(cap);
    wrap.appendChild(input);
    body.appendChild(wrap);

    setTimeout(function () { try { input.focus(); } catch (e) {} }, 80);
  }

  function closeLocal() {
    root.classList.remove("on");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cef-dialog-open");
    setTimeout(function () { if (!root.classList.contains("on")) root.innerHTML = ""; }, 190);
    E.touch();
  }

  function submit(accept) {
    if (!state || locked) return;
    locked = true;

    // Snapshot + kosongkan state sebelum event dikirim. Callback server dapat
    // langsung membuka dialog berikutnya tanpa tap ganda dialog lama mengenai
    // listitem pada dialog baru.
    var current = state;
    state = null;

    var s = "", i = -1;
    if (accept) {
      if (isList(current.style)) i = selected;
      if (isInput(current.style)) {
        var inp = document.getElementById("edlg-input");
        s = inp ? inp.value : "";
      }
    }

    closeLocal();
    E.send("dialog", (accept ? "accept" : "cancel") + "|" + current.seq, i, s);
  }

  function render(d) {
    state = {
      id: +d.id || 0,
      seq: +d.seq || 0,
      style: +d.style || 0,
      title: text(d.title),
      info: text(d.info),
      b1: text(d.b1),
      b2: text(d.b2)
    };
    selected = 0;
    locked = false;

    var kind = classify(state);
    root.className = "edlg edlg-" + kind.k;
    root.innerHTML = "";
    root.setAttribute("data-touch", "1");
    root.setAttribute("aria-hidden", "false");

    var shade = document.createElement("div");
    shade.className = "edlg-shade";
    root.appendChild(shade);

    var shell = document.createElement("section");
    shell.className = "edlg-shell style-" + state.style;
    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");

    var top = document.createElement("header");
    top.className = "edlg-top";

    var glyph = document.createElement("div");
    glyph.className = "edlg-glyph";
    glyph.innerHTML = icon(kind.icon);

    var titles = document.createElement("div");
    titles.className = "edlg-titles";
    var eyebrow = document.createElement("div");
    eyebrow.className = "edlg-eyebrow";
    eyebrow.textContent = kind.label;
    var h = document.createElement("h2");
    h.textContent = titleText(state.title);
    titles.appendChild(eyebrow);
    titles.appendChild(h);

    var meta = document.createElement("div");
    meta.className = "edlg-meta";
    meta.textContent = "#" + state.id;

    top.appendChild(glyph);
    top.appendChild(titles);
    top.appendChild(meta);
    shell.appendChild(top);

    var body = document.createElement("div");
    body.className = "edlg-body";
    var rowCount = 0;
    if (isList(state.style)) rowCount = renderList(state, body);
    else if (isInput(state.style)) renderInput(state, body);
    else body.appendChild(renderInfoBlock(state.info));
    shell.appendChild(body);

    var foot = document.createElement("footer");
    foot.className = "edlg-foot";

    if (plain(state.b2)) {
      var cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "edlg-btn secondary";
      cancel.setAttribute("data-touch", "1");
      cancel.innerHTML = '<span class="edlg-btn-icon">' + icon("x") + '</span><span>' + escapeAttr(buttonLabel(state.b2, "Batal")) + '</span>';
      cancel.addEventListener("click", function () { submit(false); });
      foot.appendChild(cancel);
    }

    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "edlg-btn primary";
    ok.setAttribute("data-touch", "1");
    ok.disabled = isList(state.style) && rowCount === 0;
    ok.innerHTML = '<span>' + escapeAttr(buttonLabel(state.b1, "Pilih")) + '</span><span class="edlg-btn-icon">' + icon("next") + '</span>';
    ok.addEventListener("click", function () { submit(true); });
    foot.appendChild(ok);
    shell.appendChild(foot);

    var hint = document.createElement("div");
    hint.className = "edlg-hint";
    hint.textContent = isList(state.style) ? "Pilih salah satu opsi untuk melanjutkan" : (isInput(state.style) ? "Masukkan data lalu konfirmasi" : "Konfirmasi pilihan untuk melanjutkan");
    shell.appendChild(hint);

    root.appendChild(shell);
    document.body.classList.add("cef-dialog-open");
    requestAnimationFrame(function () { root.classList.add("on"); E.touch(); });
  }

  E.on("dialog", function (d) {
    if (!d || !+d.show) { state = null; closeLocal(); return; }
    render(d);
  });

  document.addEventListener("keydown", function (ev) {
    if (!state || !root.classList.contains("on")) return;
    if (ev.key === "Enter") { ev.preventDefault(); submit(true); }
    else if (ev.key === "Escape" && plain(state.b2)) { ev.preventDefault(); submit(false); }
  });

  E.done("dialog_menu");
})();
