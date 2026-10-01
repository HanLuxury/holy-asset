/* =====================================================================
   EAGLE PHONE v35 — aplikasi utilitas
   Pengaturan · Kamera · Foto · Musik · Catatan · Kalkulator · Jam ·
   Game (X/O & Slot) · App Store
   ===================================================================== */
(function () {
  "use strict";
  var P = window.EPhone; if (!P) return;
  var U = P.ui, h = U.h, ic = U.ic, tap = U.tap, dec = U.dec, enc = U.enc, nameOf = U.nameOf;

  /* ------------------------------------------------------------------ */
  /* PENGATURAN                                                          */
  /* ------------------------------------------------------------------ */
  var WALLS = [[1, "Aurora"], [2, "Senja"], [3, "Marmer"], [4, "Laut"], [5, "Grafit"], [6, "Mint"], [7, "EAGLE"], [8, "Ungu"], [9, "Mentari"]];
  P.app("settings", {
    keys: ["settings"],
    open: function (ctx) {
      ctx.push(function (c) {
        var pr = P.prefs, dev = P.state.dev, net = P.net || { bars:0, carrier:"No Service", nettype:"-", towerName:"Tidak ada" };
        var sw = function (key, fn) { return U.toggle(!!+pr[key], function (v) { P.setPref(key, v ? 1 : 0); if (fn) fn(v); P.applyTheme(); c.refresh(); }); };
        var br = h("input", { type:"range", min:"20", max:"100", value:String(+pr.bright || 100), style:"width:42%;accent-color:#007aff" });
        br.addEventListener("input", function(){ pr.bright=+br.value; P.applyTheme(); });
        br.addEventListener("change", function(){ P.setPref("bright", +br.value); c.refresh(); });
        var netText = pr.air ? "Mode Pesawat" : (+net.bars > 0 ? ((net.carrier || "EAGLE") + " " + (net.nettype || "") + " · " + net.bars + "/4") : "Tidak ada layanan");
        return [U.nav({ large: "Pengaturan" }), U.body([
          U.list([U.row({ av: U.avatar(dev.name, dev.skin ? "skin:" + dev.skin : null, "lg"), title: nameOf(dev.name), sub: "EAGLE ID, No. " + (dev.num || "-"), chev: true, onClick: function () { P.open("id"); } })]),
          U.gap(),
          U.list([
            U.row({ icon: "plane", iconBg: "#ff9500", title: "Mode Pesawat", right: sw("air") }),
            U.row({ icon: "wifi", iconBg: "#007aff", title: "Wi-Fi", sub: pr.air ? "Tidak tersedia saat Mode Pesawat" : "Preferensi koneksi internet", right: sw("wifi") }),
            U.row({ icon: "signal", iconBg: "#34c759", title: "Data Seluler", sub: netText, right: sw("data") }),
            U.row({ icon: "signal", iconBg: "#5ac8fa", title: "Jaringan Seluler", sub: (+net.bars ? (net.towerName + " · radius " + (+net.radius || 0) + "m") : "Dekati dynamic phone tower"), right: netText }),
            U.row({ icon: "moon", iconBg: "#5856d6", title: "Jangan Ganggu", right: sw("dnd") }),
            U.row({ icon: "bell", iconBg: "#ff3b30", title: "Mode Senyap", right: sw("sil") })
          ]),
          U.foot("Panggilan, SMS, WhatsApp, YouTube, Spotify dan aplikasi online mengikuti cakupan dynamic tower server. Tanpa sinyal, data tetap tersimpan dan masuk kembali saat jaringan tersedia."),
          U.gap(),
          U.list([
            U.row({ icon: "sun", iconBg: "#ffcc00", title: "Kecerahan", sub: String(+pr.bright || 100) + "%", right: br }),
            U.row({ icon: "sun", iconBg: "#007aff", title: "Tampilan", right: { light: "Terang", dark: "Gelap", auto: "Otomatis" }[pr.th] || "Terang", chev: true, onClick: function () {
              U.actions("Tampilan", [["light", "Terang"], ["dark", "Gelap"], ["auto", "Otomatis (malam gelap)"]].map(function (o) { return { label: o[1], style: pr.th === o[0] ? "b" : "", fn: function () { P.setPref("th", o[0]); P.applyTheme(); c.refresh(); } }; }));
            } }),
            U.row({ icon: "image", iconBg: "#30b0c7", title: "Wallpaper", chev: true, onClick: function () { wallpapers(c); } }),
            U.row({ icon: "phone", iconBg: "#34c759", title: "Ukuran HP", right: ["Kecil", "Sedang", "Besar"][+pr.sz] || "Sedang", chev: true, onClick: function () {
              U.actions("Ukuran HP di layar", [[0, "Kecil"], [1, "Sedang"], [2, "Besar"]].map(function (o) { return { label: o[1], style: +pr.sz === o[0] ? "b" : "", fn: function () { P.setPref("sz", o[0]); P.layout(); c.refresh(); } }; }));
            } }),
            U.row({ icon: "grid", iconBg: "#5856d6", title: "Atur Layar Utama", chev: true, onClick: function () { P.state.edit = true; P.home(); P.renderHome(); } }),
            U.row({ icon: "refresh", iconBg: "#8e8e93", title: "Reset tata letak ikon", onClick: function () { U.confirm("Reset layar utama?", "Posisi ikon kembali seperti awal.", "Reset", function () { P.setPref("home", null); P.renderHome(); U.toast("Tata letak direset"); }, true); } })
          ]),
          U.gap(),
          U.list([
            U.row({ icon: "note", iconBg: "#ff2d55", title: "Nada dering", right: dev.ring ? "Kustom" : "Bawaan", chev: true, onClick: function () { ringtone(c); } })
          ]),
          U.gap(),
          U.list([
            U.row({ icon: "user", iconBg: "#34c759", title: "Face ID", sub: "Gunakan saat tap/geser lock screen", right: sw("faceid") }),
            U.row({ icon: "lock", iconBg: "#ff3b30", title: pr.pc ? "Ubah Kode Sandi" : "Aktifkan Kode Sandi", chev: true, onClick: function () { passcode(c); } }),
            pr.pc ? U.row({ title: "Matikan Kode Sandi", cls: "danger", onClick: function () { U.confirm("Matikan kode sandi?", null, "Matikan", function () { P.sendJ("set", -1, { pc: "" }); P.prefs.pc = 0; c.refresh(); }, true); } }) : null,
            U.row({ icon: "lock", iconBg: "#8e8e93", title: "Kunci Sekarang", sub: "Kembali ke lock screen tanpa menutup HP", chev: true, onClick: function () { if (P.lock) P.lock(); } })
          ]),
          U.foot("HP selalu tampil di lock screen saat dibuka. Face ID membuka setelah tap/geser; jika Face ID dimatikan dan kode sandi aktif, kode 4 digit akan diminta."),
          U.gap(),
          U.list([
            U.row({ title: "Model", right: "EAGLE Phone 15 Pro" }),
            U.row({ title: "Nomor Telepon", right: dev.num || "-" }),
            U.row({ title: "No. Rekening", right: String(dev.rek || "-") }),
            U.row({ title: "Email", right: dev.mail || "-" }),
            U.row({ title: "Versi", right: "EagleOS 33.0" })
          ]),
          U.gap(true)
        ])];
      }, {});
    }
  });
  function setWallpaper(c, wp, encodedUrl) {
    var values = { wp: +wp || 0, wpurl: encodedUrl || "" };
    if (P.setPrefs) P.setPrefs(values); else { P.setPref("wp", values.wp); P.setPref("wpurl", values.wpurl); }
    P.applyTheme();
    if (c) c.refresh();
  }
  function validateWallpaper(raw, done) {
    raw = String(raw || "").trim();
    if (!U.imgUrl(raw)) { U.toast("Link gambar tidak valid", 1); return; }
    var img = new Image(), finished = false;
    var finish = function (ok) {
      if (finished) return; finished = true;
      if (!ok) return U.toast("Gambar tidak dapat dimuat", 1);
      done(raw);
    };
    var timer = setTimeout(function () { finish(false); }, 8000);
    img.onload = function () { clearTimeout(timer); finish(true); };
    img.onerror = function () { clearTimeout(timer); finish(false); };
    img.src = U.imgUrl(raw);
  }
  function wallpapers(c) {
    c.push(function (c2) {
      var pr = P.prefs;
      var grid = h("div", { class: "ep-wpgrid" }, WALLS.map(function (w) {
        return tap(h("button", { type: "button", class: (+pr.wp === w[0] && !pr.wpurl) ? "on" : "", title:w[1] }, h("div", { class: "wp-" + w[0] })), function () {
          setWallpaper(c2, w[0], "");
        });
      }));
      var custom = U.row({ icon: "link", iconBg: "#007aff", title: "Gambar dari link", sub: pr.wpurl ? dec(pr.wpurl) : "Tempel link gambar (https://...)", chev: true, onClick: function () {
        U.prompt("Wallpaper kustom", "Link gambar (jpg/png/webp)", { ph: "https://", max: 300, value: dec(pr.wpurl || "") }, function (v) {
          validateWallpaper(v, function (url) { setWallpaper(c2, 0, enc(url)); U.toast("Wallpaper diterapkan"); });
        });
      } });
      var gal = U.row({ icon: "image", iconBg: "#ff9500", title: "Pilih dari Foto", sub:"Gunakan foto yang sudah tersimpan/upload", chev: true, onClick: function () {
        P.pickPhoto(function (u) {
          validateWallpaper(u, function (url) { setWallpaper(c2, 0, enc(url)); U.toast("Wallpaper diterapkan"); });
        });
      } });
      var reset = U.row({ icon:"refresh", iconBg:"#8e8e93", title:"Kembalikan Wallpaper Bawaan", onClick:function(){ setWallpaper(c2,1,""); U.toast("Wallpaper direset"); } });
      return [U.nav({ back: "Pengaturan", title: "Wallpaper" }), U.body([U.gap(), grid, U.gap(), U.list([custom, gal, reset]), U.foot("Wallpaper kustom divalidasi sebelum disimpan dan wp/wpurl dikirim dalam satu update agar state client dan database tidak saling menimpa.")])];
    }, {});
  }
  function ringtone(c) {
    var dev = P.state.dev;
    U.actions("Nada dering", [
      { label: "Pakai link MP3…", fn: function () {
        U.prompt("Nada dering", "Link file .mp3 (misal dari Discord). Diputar saat ada panggilan masuk.", { ph: "https://...mp3", max: 120, value: dec(dev.ring || "") }, function (v) {
          v = String(v || "").trim(); if (!/^https?:\/\//i.test(v)) return U.toast("Link tidak valid", 1);
          P.sendJ("set", -1, { ring: enc(v) }); dev.ring = v; c.refresh();
        });
      } },
      dev.ring ? { label: "Kembali ke bawaan", style: "r", fn: function () { P.sendJ("set", -1, { ring: "" }); dev.ring = ""; c.refresh(); } } : null
    ]);
  }
  function passcode(c) {
    P.showPass("set", function (code1) {
      setTimeout(function () {
        P.showPass("set", function (code2) {
          if (code1 !== code2) return U.toast("Kode tidak sama", 1);
          P.sendJ("set", -1, { pc: code1 }); P.prefs.pc = 1; U.toast("Kode sandi aktif"); c.refresh();
        }, "Ulangi kode sandi");
      }, 250);
    }, "Masukkan kode sandi baru");
  }

  /* ------------------------------------------------------------------ */
  /* KAMERA (kamera GTA dikendalikan Pawn)                               */
  /* ------------------------------------------------------------------ */
  P.app("camera", {
    keys: ["cam"], darkBar: true, uses: ["photos"],
    open: function (ctx) {
      ctx.st.front = 1; ctx.st.flash = 0; ctx.st.grid = 0; ctx.st.zoom = 1; ctx.st.mode = 0; ctx.st.busy = 0;
      P.send("cam", 0, "start");
      ctx.push(camView, {});
      if (!P.ctx("photos").cache.photos) P.send("photos_get");
    },
    data: function (ctx, d) { if (d.on === 0) { P.home(); return; } ctx.refresh(); },
    onClose: function () { P.send("cam", 0, "stop"); }
  });
  function camView(c) {
    var s = c.st;
    var view = h("div", { class: "cm-view" + (s.grid ? " grid" : "") + (s.front ? " front" : ""), "data-touch": "1" });
    var flashEl = h("div", { class: "cm-flash" });
    // geser untuk memutar kamera
    var last = null, acc = { x: 0, y: 0 }, tmr = null;
    view.onpointerdown = function (e) { last = [e.clientX, e.clientY]; };
    view.onpointermove = function (e) {
      if (!last) return;
      acc.x += (e.clientX - last[0]); acc.y += (e.clientY - last[1]); last = [e.clientX, e.clientY];
      if (!tmr) tmr = setTimeout(function () { tmr = null; var yaw = Math.round(acc.x / 3), pitch = Math.round(-acc.y / 4); acc.x = 0; acc.y = 0; if (yaw) P.send("cam", yaw, "camera_yaw"); if (pitch) P.send("cam", pitch, "camera_pitch"); }, 90);
    };
    view.onpointerup = view.onpointercancel = function () { last = null; };
    view.style.touchAction = "none";
    var zoom = h("div", { class: "cm-zoom" }, [[1, "1x"], [4, "2x"], [7, "3x"]].map(function (z) {
      return tap(h("button", { type: "button", class: s.zoom === z[0] ? "on" : "", text: z[1] }), function () {
        s.zoom = z[0]; P.send("cam", z[0], "camera_zoom_to"); c.refresh();
      });
    }));
    view.appendChild(zoom);
    var top = h("div", { class: "cm-top" }, [
      tap(h("button", { type: "button", class: s.flash ? "on" : "" }, ic("zap")), function () { s.flash = !s.flash; P.send("cam", 0, "camera_flash"); c.refresh(); }),
      tap(h("button", { type: "button", class: s.grid ? "on" : "" }, ic("grid3")), function () { s.grid = !s.grid; P.send("cam", 0, "camera_grid"); c.refresh(); }),
      tap(h("button", { type: "button" }, ic("x")), function () { P.home(); })
    ]);
    var modes = h("div", { class: "cm-modes" }, [["FOTO", 0], ["POTRET", 1], ["MALAM", 2]].map(function (m) {
      return tap(h("span", { class: s.mode === m[1] ? "on" : "", text: m[0] }), function () { var d = m[1] - s.mode; s.mode = m[1]; P.send("cam", d, "camera_mode"); c.refresh(); });
    }));
    var shot = tap(h("button", { type: "button", class: "cm-shot" + (s.busy ? " busy" : "") }, h("i")), function () {
      if (s.busy) return U.toast("Masih menyimpan foto sebelumnya…");
      P.sfx.shutter(); flashEl.classList.remove("go"); void flashEl.offsetWidth; flashEl.classList.add("go");
      P.send("cam", 0, "camera_capture");
      if (P.media.canCapture()) {
        // client Android memotret layar game (tanpa UI HP) lalu upload
        s.busy = 1; c.refresh(); U.toast("Menyimpan foto…");
        P.media.capture(function (r) {
          s.busy = 0; if (P.cur === c) c.refresh();
          if (+r.ok && r.url) {
            P.sendJ("photo_add", -1, { url: enc(r.url), cap: "", src: 1 });
            if (r.gallery != null && +r.gallery === 0) {
              U.toast("Foto masuk server, tetapi Galeri Android gagal: " + (r.gallery_err || "gagal commit MediaStore"), 1);
            } else if (r.gallery != null && +r.gallery === 1) {
              U.toast("Foto tersimpan di Pictures/EagleRP dan sedang disinkronkan ke server");
            }
          } else if (r.gallery != null && +r.gallery === 1) {
            U.toast("Foto aman di Pictures/EagleRP, tetapi server belum menerima upload: " + (r.err || "koneksi gagal"), 1);
          } else {
            U.toast((r.gallery_err || r.err || "Foto gagal disimpan"), 1);
          }
        });
      } else {
        // aplikasi game lama (belum ada CefMedia): sembunyikan HP untuk screenshot manual
        var ph = document.querySelector(".eph");
        if (ph) { ph.classList.add("peek"); ph.classList.remove("on"); setTimeout(function () { ph.classList.remove("peek"); ph.classList.add("on"); }, 2600); }
        U.toast("Perbarui aplikasi game agar foto tersimpan otomatis", 1);
      }
    });
    var row = h("div", { class: "cm-row" }, [
      tap(h("div", { class: "cm-thumb" }, U.img(((P.ctx("photos").cache.photos || {}).items || [{}])[0] ? ((P.ctx("photos").cache.photos || {}).items || [{}])[0].url : null)), function () { P.open("photos"); }),
      shot,
      tap(h("button", { type: "button", class: "cm-flip" }, ic("flip")), function () { s.front = !s.front; P.send("cam", 0, s.front ? "camera_front" : "camera_rear"); c.refresh(); })
    ]);
    return [h("div", { class: "ep-cam" }, [top, view, h("div", { class: "cm-bot" }, [modes, row]), flashEl])];
  }

  /* ------------------------------------------------------------------ */
  /* FOTO (galeri berbasis link gambar)                                  */
  /* ------------------------------------------------------------------ */
  P.app("photos", {
    keys: ["photos"],
    open: function (ctx) {
      ctx.push(function (c) {
        var d = c.cache.photos;
        var body = !d ? [U.loading()] : (d.items && d.items.length ? [h("div", { class: "ep-grid3" }, d.items.map(function (it) { return tap(h("div", null, U.img(it.url)), function () { photoView(c, it); }); }))] :
          [U.empty("image", "Belum ada foto", "Tambahkan foto dari link gambar, atau simpan foto dari Pesan/Photogram.")]);
        return [U.nav({ large: "Foto", largeSub: d && d.items ? d.items.length + " foto" : null, right: [U.navIcon("plus", function () { addPhotoMenu(); })] }), U.body(body, "flush")];
      }, {});
    },
    data: function (ctx, d) { if (P.pickerCb) { var cb = P.pickerCb; P.pickerCb = null; cb(d); } ctx.refresh(); }
  });
  function addPhotoMenu() {
    U.actions("Tambah foto", [
      { label: "Ambil foto dengan Kamera", fn: function () { P.open("camera"); } },
      P.media.canPick() ? { label: "Unggah dari galeri HP", fn: function () { uploadFromDevice(null); } } : null,
      { label: "Dari link gambar (URL)", fn: function () { addPhoto(); } }
    ]);
  }
  /* pilih foto dari galeri Android -> upload -> simpan ke galeri server */
  function uploadFromDevice(cb) {
    U.toast("Pilih foto di galeri HP…");
    P.media.pick(function (r) {
      if (+r.ok && r.url) {
        P.sendJ("photo_add", -1, { url: enc(r.url), cap: "", src: 2 });
        if (cb) cb(r.url);
      } else if (r.err !== "Dibatalkan") U.toast(r.err || "Upload gagal", 1);
    });
  }
  P.uploadFromDevice = uploadFromDevice;
  function addPhoto() {
    var url = U.input({ ph: "https://... (jpg/png/gif)", max: 300 }), cap = U.input({ ph: "Keterangan (opsional)", max: 60 });
    U.sheet({ title: "Tambah Foto", left: { label: "Batal" }, right: { label: "Simpan", fn: function (close) {
      var v = url.value.trim(); if (!U.imgUrl(v)) return U.toast("Link gambar tidak valid", 1);
      P.sendJ("photo_add", -1, { url: enc(v), cap: enc(cap.value.trim()) }); close();
    } }, body: h("div", { class: "ep-form" }, [U.field("Link gambar", url), U.field("Keterangan", cap), U.foot("Tip: upload foto ke Discord/Imgur lalu salin link gambarnya.")]) });
    setTimeout(function () { url.focus(); }, 350);
  }
  function photoView(c, it) {
    c.push(function (c2) {
      return [U.nav({ back: "Foto", title: U.dayLabel(it.ts), right: [U.navIcon("more", function () {
        U.actions(null, [
          P.shareTo ? { label: "Bagikan ke Photogram", fn: function () { P.shareTo("pg", dec(it.url)); } } : null,
          P.shareTo ? { label: "Bagikan ke Birdy", fn: function () { P.shareTo("bd", dec(it.url)); } } : null,
          { label: "Kirim lewat Pesan", fn: function () { var l = P.contacts.list(); if (!l.length) return U.toast("Belum ada kontak", 1); U.actions("Kirim ke", l.slice(0, 8).map(function (x) { return { label: nameOf(x.n), fn: function () { P.sendJ("msg", -1, { to: x.num, tx: "", at: 1, ad: it.url }); U.toast("Terkirim"); } }; })); } },
          { label: "Jadikan wallpaper", fn: function () { P.setPref("wpurl", it.url); P.setPref("wp", 0); P.applyTheme(); U.toast("Wallpaper diganti"); } },
          { label: "Salin link", fn: function () { try { navigator.clipboard.writeText(dec(it.url)); U.toast("Link disalin"); } catch (e) { U.toast(dec(it.url)); } } },
          { label: "Hapus", style: "r", fn: function () { P.send("photo_del", +it.id); c2.pop(); } }
        ]);
      })] }), U.body([h("div", { class: "ep-imgfull" }, U.img(it.url)),
        h("div", { class: "ep-article", style: "padding-top:calc(var(--u)*1.4)" }, [
          it.cap ? h("div", { text: dec(it.cap) }) : null,
          h("div", { class: "meta", text: (+it.src === 1 ? "📷 Kamera" : +it.src === 2 ? "📱 Galeri HP" : "🔗 Link") + (it.loc ? " · " + dec(it.loc) : "") + " · " + U.dayLabel(it.ts) + " " + U.hhmm(it.ts) })
        ])], "flush")];
    }, {});
  }

  /* ------------------------------------------------------------------ */
  /* MUSIK                                                               */
  /* ------------------------------------------------------------------ */
  P.app("music", {
    keys: ["music"],
    open: function (ctx) {
      ctx.push(function (c) {
        var d = c.cache.music;
        if (!d) return [U.nav({ large: "Musik" }), U.body(U.loading())];
        var playing = dec(d.playing || "");
        var now = h("div", { class: "ep-music-now" }, [h("div", { class: "mn-art" }, ic("note")), h("div", { style: "flex:1;min-width:0" }, [h("b", { text: playing || "Tidak memutar" }), h("small", { text: +d.ear ? "Earphone terhubung" : "Butuh item Earphone" })]),
          playing ? tap(h("button", { type: "button", class: "ep-iconbtn", style: "background:rgba(255,255,255,.25);color:#fff" }, ic("stop")), function () { P.send("music_stop"); }) : null]);
        var list = d.items && d.items.length ? U.list(d.items.map(function (m) {
          return U.row({ icon: "note", iconBg: "#fa233b", title: dec(m.tt), sub: dec(m.url).replace(/^https?:\/\//, "").slice(0, 40), right: h("span", { style: "color:var(--tint)" }, ic("play")), onClick: function () { P.send("music_play", +m.id); }, onHold: function () {
            U.actions(dec(m.tt), [{ label: "Putar", fn: function () { P.send("music_play", +m.id); } }, { label: "Hapus dari playlist", style: "r", fn: function () { P.send("music_del", +m.id); } }]);
          } });
        })) : U.empty("note", "Playlist kosong", "Tambah lagu dari link MP3 / stream radio.");
        return [U.nav({ large: "Musik", right: [U.navIcon("plus", function () { addSong(); })] }), U.body([now, U.sec("Playlist saya"), list,
          +d.vip ? U.gap() : null, +d.vip ? U.list([U.row({ icon: "speaker", iconBg: "#5856d6", title: "Kontrol Boombox (VIP)", sub: "Harus di dekat boombox-mu", chev: true, onClick: function () { P.send("boombox"); } })]) : null,
          U.gap(), U.list([U.row({ icon: "link", iconBg: "#007aff", title: "Putar dari link sekali", chev: true, onClick: function () {
            U.prompt("Putar musik", "Link MP3 / stream (bukan YouTube)", { ph: "https://", max: 200 }, function (v) { v = String(v || "").trim(); if (!/^https?:\/\//i.test(v)) return U.toast("Link tidak valid", 1); P.send("music_url", -1, enc(v)); });
          } })])])];
      }, {});
    }
  });
  function addSong() {
    var tt = U.input({ ph: "Judul lagu", max: 40 }), url = U.input({ ph: "https://...mp3", max: 200 });
    U.sheet({ title: "Tambah Lagu", left: { label: "Batal" }, right: { label: "Simpan", fn: function (close) {
      if (!tt.value.trim()) return U.toast("Judul wajib diisi", 1);
      if (!/^https?:\/\//i.test(url.value.trim())) return U.toast("Link tidak valid", 1);
      P.sendJ("music_add", -1, { tt: enc(tt.value.trim()), url: enc(url.value.trim()) }); close();
    } }, body: h("div", { class: "ep-form" }, [U.field("Judul", tt), U.field("Link", url)]) });
  }

  /* ------------------------------------------------------------------ */
  /* CATATAN                                                             */
  /* ------------------------------------------------------------------ */
  P.app("notes", {
    keys: ["notes"],
    open: function (ctx) {
      ctx.push(function (c, st) {
        var d = c.cache.notes;
        var srch = st.srch || (st.srch = U.search("Cari", "", function (v) { c.st.q = v; c.refresh(); }));
        var q = (c.st.q || "").toLowerCase();
        var items = d ? (d.items || []).filter(function (n) { return !q || (dec(n.tt) + " " + dec(n.tx)).toLowerCase().indexOf(q) >= 0; }) : null;
        var body = !d ? [U.loading()] : (items.length ? [U.list(items.map(function (n) {
          return U.row({ title: dec(n.tt) || "Catatan baru", bold: true, sub: U.whenShort(n.ts) + "  " + dec(n.tx).replace(/\n/g, " ").slice(0, 80), onClick: function () { editNote(c, n); } });
        }))] : [U.empty("edit", "Belum ada catatan")]);
        var fab = tap(h("button", { type: "button", class: "ep-fab", style: "background:#ffcc00" }, ic("compose")), function () { editNote(c, null); });
        return [U.nav({ large: "Catatan", extra: srch }), U.body(body), fab];
      }, {});
    }
  });
  function editNote(c, n) {
    n = n || { id: -1, tt: "", tx: "" };
    var tt = h("input", { type: "text", placeholder: "Judul", maxlength: "60", value: dec(n.tt) });
    var tx = h("textarea", { placeholder: "Mulai menulis…", maxlength: "2000" }); tx.value = dec(n.tx);
    var dirty = false;
    tt.addEventListener("input", function () { dirty = true; }); tx.addEventListener("input", function () { dirty = true; });
    function save() { if (!dirty) return; dirty = false; if (!tt.value.trim() && !tx.value.trim()) return; P.sendJ("note_save", +n.id, { tt: enc(tt.value.trim()), tx: enc(tx.value) }); }
    c.push(function () {
      return [U.nav({ back: "Catatan", right: [+n.id > 0 ? U.navIcon("trash", function () { U.confirm("Hapus catatan?", null, "Hapus", function () { dirty = false; P.send("note_del", +n.id); c.pop(); }, true); }) : null, U.navBtn("Selesai", function () { save(); c.pop(); }, true)] }),
        U.body(h("div", { class: "ep-note-body" }, [tt, tx]))];
    }, { white: true, onLeave: save });
    if (+n.id < 0) setTimeout(function () { tt.focus(); }, 380);
  }

  /* ------------------------------------------------------------------ */
  /* KALKULATOR                                                          */
  /* ------------------------------------------------------------------ */
  P.app("calculator", {
    darkBar: true,
    open: function (ctx) {
      var s = { cur: "0", prev: null, op: null, fresh: true };
      ctx.push(function (c) {
        var out = h("div", { class: "cc-out", text: fmt(s.cur) });
        function fmt(v) { var n = +v; if (!isFinite(n)) return "Error"; if (String(v).indexOf(".") >= 0 && String(v).slice(-1) === ".") return v; var t = String(Math.round(n * 1e8) / 1e8); return t.length > 11 ? n.toExponential(4) : t.replace(".", ","); }
        function calc() { var a = +s.prev, b = +s.cur; var r = s.op === "+" ? a + b : s.op === "-" ? a - b : s.op === "×" ? a * b : s.op === "÷" ? (b === 0 ? NaN : a / b) : b; s.cur = String(r); s.prev = null; s.op = null; }
        function key(k) {
          if (/^[0-9]$/.test(k)) { s.cur = s.fresh || s.cur === "0" ? k : (s.cur.length < 12 ? s.cur + k : s.cur); s.fresh = false; }
          else if (k === ",") { if (s.fresh) { s.cur = "0."; s.fresh = false; } else if (s.cur.indexOf(".") < 0) s.cur += "."; }
          else if (k === "AC") { s.cur = "0"; s.prev = null; s.op = null; s.fresh = true; }
          else if (k === "±") s.cur = String(-(+s.cur));
          else if (k === "%") s.cur = String(+s.cur / 100);
          else if (k === "=") { if (s.op) calc(); s.fresh = true; }
          else { if (s.op && !s.fresh) calc(); s.prev = s.cur; s.op = k; s.fresh = true; }
          c.refresh();
        }
        var keys = [["AC", "fn"], ["±", "fn"], ["%", "fn"], ["÷", "op"], ["7"], ["8"], ["9"], ["×", "op"], ["4"], ["5"], ["6"], ["-", "op"], ["1"], ["2"], ["3"], ["+", "op"], ["0", "zero"], [","], ["=", "op"]];
        var grid = h("div", { class: "cc-grid" }, keys.map(function (k) { return tap(h("button", { type: "button", class: (k[1] || "") + (s.op === k[0] && s.fresh ? " on" : ""), text: k[0] }), function () { key(k[0]); }); }));
        return [h("div", { class: "ep-calc" }, [out, grid])];
      }, {});
    }
  });

  /* ------------------------------------------------------------------ */
  /* JAM (jam kota, stopwatch, timer, alarm tersimpan di MySQL)          */
  /* ------------------------------------------------------------------ */
  var CLK = { sw: 0, swRun: false, swT0: 0, laps: [], tm: 0, tmEnd: 0, tmTick: null, alarms: [] };
  // `last` hanya state runtime supaya alarm tidak berbunyi berkali-kali
  // dalam menit yang sama; daftar alarm utamanya berasal dari server.
  setInterval(function () {
    var t = U.hhmm();
    CLK.alarms.forEach(function (a) {
      if (+a.on && a.t === t && a.last !== t) {
        a.last = t; P.sfx.ring(true); setTimeout(function () { P.sfx.ring(false); }, 8000);
        U.toast("⏰ Alarm " + a.t + (a.l ? " — " + dec(a.l) : ""));
      }
    });
    if (CLK.tmEnd && Date.now() >= CLK.tmEnd) { CLK.tmEnd = 0; P.sfx.ring(true); setTimeout(function () { P.sfx.ring(false); }, 6000); U.toast("⏲ Timer selesai"); }
  }, 1000);
  P.app("clock", {
    open: function (ctx) {
      ctx.st.tab = ctx.st.tab || "world";
      P.send("alarms_get");
      ctx.push(function (c) {
        var tab = c.st.tab, body;
        if (tab === "world") {
          var base = U.now(), cities = [["San Andreas", 0], ["Jakarta", 0], ["London", -7], ["New York", -11], ["Tokyo", 2]];
          body = [U.list(cities.map(function (x) { return U.row({ title: x[0], sub: x[1] === 0 ? "Hari ini" : (x[1] > 0 ? "+" : "") + x[1] + " jam", right: h("span", { style: "font-size:calc(var(--u)*4.4);font-weight:300;color:var(--tx)", text: U.hhmm(base + x[1] * 3600) }) }); }))];
        } else if (tab === "sw") {
          var el = CLK.swRun ? CLK.sw + (Date.now() - CLK.swT0) : CLK.sw;
          var txt = h("div", { class: "ep-clock-big", text: swFmt(el) });
          if (CLK.swRun) { clearTimeout(c.st.t); c.st.t = setTimeout(function () { if (P.cur === c && c.st.tab === "sw") c.refresh(); }, 60); }
          body = [txt, h("div", { class: "ep-sw-btns" }, [
            tap(h("button", { type: "button", text: CLK.swRun ? "Putaran" : "Reset" }), function () { if (CLK.swRun) CLK.laps.unshift(CLK.sw + (Date.now() - CLK.swT0)); else { CLK.sw = 0; CLK.laps = []; } c.refresh(); }),
            tap(h("button", { type: "button", class: CLK.swRun ? "stop" : "go", text: CLK.swRun ? "Stop" : "Mulai" }), function () { if (CLK.swRun) { CLK.sw += Date.now() - CLK.swT0; CLK.swRun = false; } else { CLK.swT0 = Date.now(); CLK.swRun = true; } c.refresh(); })
          ]), CLK.laps.length ? U.list(CLK.laps.map(function (l, i) { return U.row({ title: "Putaran " + (CLK.laps.length - i), right: swFmt(l) }); })) : null];
        } else if (tab === "timer") {
          var left = CLK.tmEnd ? Math.max(0, CLK.tmEnd - Date.now()) : 0;
          if (CLK.tmEnd) { clearTimeout(c.st.t); c.st.t = setTimeout(function () { if (P.cur === c && c.st.tab === "timer") c.refresh(); }, 250); }
          body = [h("div", { class: "ep-clock-big", text: CLK.tmEnd ? U.dur(left / 1000) : "00:00" }), h("div", { class: "ep-sw-btns", style: "justify-content:center;gap:calc(var(--u)*2);flex-wrap:wrap" },
            CLK.tmEnd ? [tap(h("button", { type: "button", class: "stop", text: "Batal" }), function () { CLK.tmEnd = 0; c.refresh(); })] :
              [[1, "1m"], [5, "5m"], [10, "10m"], [30, "30m"]].map(function (m) { return tap(h("button", { type: "button", class: "go", text: m[1] }), function () { CLK.tmEnd = Date.now() + m[0] * 60000; c.refresh(); }); }))];
        } else {
          body = [CLK.alarms.length ? U.list(CLK.alarms.map(function (a) {
            return U.row({ title: a.t, sub: a.l ? dec(a.l) : "Alarm", right: U.toggle(+a.on === 1, function (v) { a.on = v ? 1 : 0; P.send("alarm_toggle", +a.id, v ? "1" : "0"); }), onHold: function () { U.actions(a.t, [{ label: "Hapus alarm", style: "r", fn: function () { P.send("alarm_del", +a.id); } }]); } });
          })) : U.empty("alarm", "Tidak ada alarm", "Alarm tersimpan di server per karakter."), U.foot("Tahan alarm untuk menghapus.")];
        }
        var nav = U.nav({ large: { world: "Jam Dunia", sw: "Stopwatch", timer: "Timer", alarm: "Alarm" }[tab], right: tab === "alarm" ? [U.navIcon("plus", function () {
          U.prompt("Alarm baru", "Format JJ:MM (jam kota)", { ph: "07:30", max: 5 }, function (v) { v = String(v || "").trim(); if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return U.toast("Format salah", 1); P.sendJ("alarm_add", -1, { t: v, l: "" }); });
        })] : null });
        return [nav, U.body(body), U.tabs([["world", "Jam Dunia", "globe"], ["alarm", "Alarm", "alarm"], ["sw", "Stopwatch", "stopwatch"], ["timer", "Timer", "clock"]], tab, function (t) { c.st.tab = t; c.refresh(); })];
      }, {});
    },
    data: function (ctx, d) {
      if (d.kind === "alarms") {
        CLK.alarms = Array.isArray(d.items) ? d.items : [];
        if (P.cur === ctx) ctx.refresh();
      }
    }
  });
  function swFmt(ms) { var cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000); return U.pad2(Math.floor(s / 60)) + ":" + U.pad2(s % 60) + "," + U.pad2(cs); }

  /* ------------------------------------------------------------------ */
  /* GAME (X/O multiplayer & mesin slot — logika lama di server)         */
  /* ------------------------------------------------------------------ */
  P.app("games", {
    keys: ["xo", "xores", "slot"],
    open: function (ctx, arg) {
      ctx.push(function (c) {
        return [U.nav({ large: "Game" }), U.body([
          U.list([
            U.row({ icon: "grid3", iconBg: "#5856d6", title: "Tic-Tac-Toe (X/O)", sub: "Lawan pemain lain dengan taruhan", chev: true, onClick: function () { P.send("xo"); } }),
            U.row({ icon: "money", iconBg: "#ff9500", title: "Mesin Slot", sub: "$500 sekali putar · menang $25.000", chev: true, onClick: function () { slotView(c); } })
          ]),
          U.foot("Game X/O memakai sistem lama server (undang pemain lewat dialog)."),
          U.gap(), U.list([U.row({ icon: "calc", iconBg: "#ff9f0a", title: "Kalkulator", chev: true, onClick: function () { P.open("calculator"); } })])
        ])];
      }, {});
      if (arg === "xo") xoView(ctx);
    },
    data: function (ctx, d) {
      if (d.app === "xo" || d.app === "xores") { var top = ctx.top(); if (!top || !top.st.xo) xoView(ctx); else ctx.refresh(); return; }
      ctx.refresh();
    }
  });
  function xoView(c) {
    c.push(function (c2) {
      var d = c2.cache.xo || { b: "000000000", me: "X", turn: 0 };
      var res = c2.cache.xores;
      var b = String(d.b || "000000000");
      var cells = [];
      for (var i = 0; i < 9; i++) (function (k) {
        var v = b.charAt(k);
        cells.push(tap(h("button", { type: "button", class: v === "1" ? "x" : v === "2" ? "o" : "", text: v === "1" ? "X" : v === "2" ? "O" : "" }), function () { if (v === "0") P.send("xo_cell", k + 1); }));
      })(i);
      var status = res && res.res ? ({ win: "Kamu MENANG! 🎉", lose: "Kamu kalah", draw: "Seri" }[res.res] || res.res) : (+d.turn ? "Giliranmu (" + d.me + ")" : "Menunggu lawan…");
      return [U.nav({ back: "Game", title: "Tic-Tac-Toe" }), U.body([h("div", { class: "ep-center", style: "padding:calc(var(--u)*2) 0 0;font-size:calc(var(--u)*3);font-weight:700", text: status }),
        +d.cash ? h("div", { class: "ep-center ep-muted", text: "Taruhan " + U.money(d.cash) }) : null, h("div", { class: "ep-xo" }, cells)])];
    }, { xo: 1 });
  }
  /* kartu slot: "10c" -> 10 ♣ (c=keriting d=wajik h=hati s=sekop) */
  function slotCard(x) {
    var m = /^(\d+)([cdhs])$/.exec(String(x || ""));
    if (!m) return h("div", { text: x || "?" });
    var r = { 1: "A", 11: "J", 12: "Q", 13: "K" }[+m[1]] || m[1], su = { c: "♣", d: "♦", h: "♥", s: "♠" }[m[2]];
    return h("div", { class: "card" + (m[2] === "d" || m[2] === "h" ? " red" : "") }, [h("b", { text: r }), h("span", { text: su })]);
  }
  function slotView(c) {
    P.send("slot");
    c.push(function (c2) {
      var d = c2.cache.slot || { c: ["?", "?", "?"], spin: 0, res: "" };
      var reels = h("div", { class: "ep-slot" + (+d.spin ? " spin" : "") }, (d.c || []).map(function (x) { return slotCard(dec(x)); }));
      return [U.nav({ back: "Game", title: "Mesin Slot" }), U.body([reels,
        h("div", { class: "ep-center", style: "font-size:calc(var(--u)*3);font-weight:700;min-height:calc(var(--u)*4)", text: dec(d.res || "") }),
        h("div", { class: "ep-form" }, [U.btn(+d.spin ? "Berputar…" : "Putar ($500)", function () { if (!+d.spin) P.send("slot_spin"); }, "full" + (+d.spin ? " gray" : ""))])])];
    }, {});
  }

  /* ------------------------------------------------------------------ */
  /* APP STORE                                                           */
  /* ------------------------------------------------------------------ */
  P.app("appstore", {
    open: function (ctx) {
      ctx.push(function (c) {
        var cats = {};
        P.APPS.forEach(function (a) { (cats[a.cat] = cats[a.cat] || []).push(a); });
        var core = ["phone", "messages", "whatsapp", "contacts", "camera", "photos", "settings", "appstore", "maps", "bank"];
        var body = [];
        Object.keys(cats).forEach(function (k) {
          body.push(U.sec(k));
          body.push(U.list(cats[k].map(function (a) {
            var inst = P.installed(a.id);
            var btn = core.indexOf(a.id) >= 0 ? U.pill("Sistem") : U.btn(inst ? "HAPUS" : "PASANG", function () {
              var hdn = (P.prefs.hidden || []).slice();
              if (inst) { if (hdn.indexOf(a.id) < 0) hdn.push(a.id); } else hdn = hdn.filter(function (x) { return x !== a.id; });
              P.setPref("hidden", hdn); P.renderHome(); c.refresh(); U.toast(a.name + (inst ? " dihapus" : " terpasang"));
            }, "sm " + (inst ? "gray" : "tinted"));
            return U.row({ lead: h("div", { class: "ep-appicon-sm" }, U.appIcon(a.id)), title: a.name, sub: a.cat, right: btn });
          })));
        });
        return [U.nav({ large: "App Store", largeSub: "Semua aplikasi gratis untuk warga EAGLE" }), U.body(body)];
      }, {});
    }
  });
  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("phone_apps_tools");   // v28: modul dimuat sampai selesai
})();
