/* =====================================================================
   EAGLE ROLEPLAY - Global CEF Dialog Menu v54
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
  var viewEpoch = 0;
  var closeTimer = 0;
  var lastRowTapIndex = -1;
  var lastRowTapAt = 0;

  function text(v) { return String(v == null ? "" : v); }
  function plain(v) {
    return U.plain(text(v).replace(/~t~/gi, " ").replace(/~\^~/g, " ").replace(/~\|~/g, " ")).replace(/\r/g, "").replace(/\s+/g, " ").trim();
  }
  function structuredText(v, enc) {
    var src = text(v).replace(/\r/g, "");
    // v54/encoding 2: newline dan TAB struktural dikirim dengan token khusus.
    // Ini penting: token ~n~ literal di source adalah formatting, BUKAN listitem baru.
    if ((enc | 0) >= 2) return src.replace(/~\|~/g, "\n");
    // Kompatibilitas payload lama (v51/v52).
    return src.replace(/~n~/gi, "\n");
  }
  function rawLines(v, enc) {
    return structuredText(v, enc).split("\n");
  }
  function dialogLines(v, enc) {
    var src = rawLines(v, enc);
    // Native dialog tidak membuat item tambahan hanya karena string diakhiri \n.
    // Blank line di tengah tetap dipertahankan agar listitem tetap 1:1 dengan Pawn.
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
    { k: "transport", icon: "plane", label: "AIR TRAVEL", rx: /airport|bandara|flight|penerbangan|terbang|vice city|los santos international/i },
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

  function splitCols(line, enc) {
    var a = ((enc | 0) >= 2) ? text(line).split("~^~") : text(line).split(/\t|~t~/gi);
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
    var lines = dialogLines(d.info, d.enc), header = null;
    if (d.style === 5 && lines.length) header = splitCols(lines.shift(), d.enc);
    var rows = [];
    for (var i = 0; i < lines.length; i++) {
      rows.push({ index: i, raw: lines[i], cols: splitCols(lines[i], d.enc) });
    }
    return { header: header, rows: rows };
  }

  function renderInfoBlock(info, enc) {
    var box = document.createElement("div");
    box.className = "edlg-copy";
    var lines = rawLines(info, enc);
    for (var i = 0; i < lines.length; i++) {
      var line = document.createElement("div");
      line.className = "edlg-copy-line";
      line.innerHTML = U.fmt(lines[i].replace(/~\^~/g, "    ").replace(/~t~/gi, "    "));
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

  function selectRow(index, ensureVisible) {
    selected = Math.max(0, index | 0);
    var rows = root.querySelectorAll(".edlg-row-item");
    for (var i = 0; i < rows.length; i++) {
      var active = +(rows[i].getAttribute("data-index") || -1) === selected;
      rows[i].classList.toggle("selected", active);
      rows[i].setAttribute("aria-selected", active ? "true" : "false");
      if (active && ensureVisible) {
        try { rows[i].scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {}
      }
    }
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
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", r.index === selected ? "true" : "false");

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

        row.addEventListener("click", function () {
          var now = Date.now();
          var doubleTap = (lastRowTapIndex === r.index && now - lastRowTapAt <= 360);
          selectRow(r.index, false);
          E.touch();
          lastRowTapIndex = r.index;
          lastRowTapAt = now;
          // WebView Android tidak selalu menghasilkan event dblclick. Deteksi dua tap
          // sendiri supaya perilaku native SA-MP (double-click item = pilih) tetap jalan.
          if (doubleTap) submit(true);
        });
        row.addEventListener("dblclick", function (ev) {
          // Fallback desktop. submit() sudah punya lock sehingga tidak bisa terkirim dua kali.
          if (ev) ev.preventDefault();
          selectRow(r.index, false);
          submit(true);
        });
        list.appendChild(row);
      })(data.rows[i]);
    }

    body.appendChild(list);
    return data.rows.length;
  }

  function renderInput(d, body) {
    var prompt = renderInfoBlock(d.info, d.enc);
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
    var epoch = ++viewEpoch;
    root.classList.remove("on");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cef-dialog-open");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      // Jangan pernah membersihkan DOM milik dialog baru yang datang saat animasi
      // close dialog lama masih berjalan.
      if (epoch === viewEpoch && !state && !root.classList.contains("on")) root.innerHTML = "";
    }, 190);
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
    // Native SA-MP tetap mengembalikan selected listitem / isi input ketika
    // tombol kanan ditekan. Pertahankan payload itu untuk callback lama EAGLE.
    if (isList(current.style)) i = selected;
    if (isInput(current.style)) {
      var inp = document.getElementById("edlg-input");
      s = inp ? inp.value : "";
    }

    closeLocal();
    E.send("dialog", (accept ? "accept" : "cancel") + "|" + current.seq, i, s);
  }

  function render(d) {
    ++viewEpoch;
    clearTimeout(closeTimer);
    state = {
      id: +d.id || 0,
      seq: +d.seq || 0,
      style: +d.style || 0,
      enc: +d.enc || 0,
      title: text(d.title),
      info: text(d.info),
      b1: text(d.b1),
      b2: text(d.b2)
    };
    selected = 0;
    locked = false;
    lastRowTapIndex = -1;
    lastRowTapAt = 0;

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
    meta.textContent = "MENU";

    top.appendChild(glyph);
    top.appendChild(titles);
    top.appendChild(meta);
    shell.appendChild(top);

    var body = document.createElement("div");
    body.className = "edlg-body";
    var rowCount = 0;
    if (isList(state.style)) rowCount = renderList(state, body);
    else if (isInput(state.style)) renderInput(state, body);
    else body.appendChild(renderInfoBlock(state.info, state.enc));
    shell.appendChild(body);
    meta.textContent = isList(state.style) ? (rowCount + " OPSI") : (isInput(state.style) ? "INPUT" : "INFO");

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
    if (!d) return;
    var incomingSeq = +d.seq || 0;
    if (!+d.show) {
      // Abaikan hide terlambat milik dialog lama. Ini membuat chain A -> B aman
      // walau event close A baru dieksekusi setelah B sudah dirender.
      if (state && incomingSeq && state.seq && incomingSeq < state.seq) return;
      state = null;
      locked = false;
      closeLocal();
      return;
    }
    // Jangan izinkan paket show lama menimpa dialog yang lebih baru.
    if (state && incomingSeq && state.seq && incomingSeq < state.seq) return;
    render(d);
  });

  document.addEventListener("keydown", function (ev) {
    if (!state || !root.classList.contains("on")) return;
    if (isList(state.style) && (ev.key === "ArrowDown" || ev.key === "ArrowUp")) {
      var count = root.querySelectorAll(".edlg-row-item").length;
      if (count > 0) {
        ev.preventDefault();
        selectRow(ev.key === "ArrowDown" ? Math.min(count - 1, selected + 1) : Math.max(0, selected - 1), true);
      }
      return;
    }
    if (ev.key === "Enter") { ev.preventDefault(); submit(true); }
    // Native SA-MP tetap mengirim response=0 saat ESC walau button2 kosong.
    else if (ev.key === "Escape") { ev.preventDefault(); submit(false); }
  });

  E.done("dialog_menu");
})();
