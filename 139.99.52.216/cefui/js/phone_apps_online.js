/* =====================================================================
   EAGLE PHONE v48 — WhatsApp + native YouTube/Spotify WebView host
   ===================================================================== */
(function () {
  "use strict";
  var P = window.EPhone; if (!P) return;
  var E = window.EAGLE;
  var U = P.ui, h = U.h, tap = U.tap, dec = U.dec, enc = U.enc, nameOf = U.nameOf;

  function bridge(name) {
    try { return window.CefBridge && typeof window.CefBridge[name] === "function"; } catch (e) { return false; }
  }
  function hasData() {
    var n = P.net || {};
    if (+P.prefs.air) return false;
    // Wi-Fi tidak membutuhkan tower seluler. Mobile Data tetap mengikuti tower.
    if (+P.prefs.wifi) return true;
    return +P.prefs.data && +n.bars > 0;
  }
  function netEmpty(title) {
    var n = P.net || {};
    var msg = +P.prefs.air ? "Matikan Mode Pesawat." :
      (!+P.prefs.wifi && !+P.prefs.data ? "Aktifkan Wi-Fi atau Data Seluler di Pengaturan." :
      (+P.prefs.data && +n.bars < 1 ? "Data Seluler tidak mendapat sinyal. Dekati tower atau aktifkan Wi-Fi." : "Periksa koneksi internet."));
    return U.empty("signal", title || "Tidak ada jaringan", msg);
  }

  /* ------------------------------------------------------------------ */
  /* WHATSAPP                                                            */
  /* ------------------------------------------------------------------ */
  var WA_IMG = 1;
  P.app("whatsapp", {
    keys: ["wa_threads", "wa_thread", "wa_new"], uses: ["contacts"], badgeClear: false,
    open: function (ctx, arg) {
      ctx.st.q = "";
      ctx.push(waList, {});
      if (arg && typeof arg === "string") waOpen(ctx, arg);
    },
    data: function (ctx, d) {
      if (d.app === "wa_new") {
        var t = ctx.cache.wa_thread;
        if (t && String(t.num) === String(d.num) && d.m) t.items = (t.items || []).concat([d.m]);
      }
      ctx.refresh();
    },
    onBadge: function (ctx) { ctx.refresh(); },
    isViewing: function (ctx, n) { var top = ctx.top(); return !!(top && top.st.num && String(top.st.num) === String(n.key) && P.state.open); }
  });

  function waList(c, st) {
    var d = c.cache.wa_threads, net = P.net || {};
    var search = st.srch || (st.srch = U.search("Cari chat", "", function (v) { c.st.q = v; c.refresh(); }));
    var body = [];
    if (!hasData()) body = [netEmpty("WhatsApp offline")];
    else if (!d) body = [U.loading()];
    else {
      var q = (c.st.q || "").toLowerCase();
      var items = (d.items || []).filter(function (x) {
        var nm = waName(x.num, x.n).toLowerCase();
        return !q || nm.indexOf(q) >= 0 || String(x.num).indexOf(q) >= 0 || dec(x.last || "").toLowerCase().indexOf(q) >= 0;
      });
      body = items.length ? [U.list(items.map(function (x) {
        var nm = waName(x.num, x.n), prev = +x.att === WA_IMG ? "📷 Foto" : dec(x.last || "");
        return U.row({
          av: U.avatar(nm, null, "sm"), title: nm, bold: +x.un > 0,
          sub: (+x.mine ? "Kamu: " : "") + prev,
          right: h("div", { style:"display:flex;flex-direction:column;align-items:flex-end;gap:4px" }, [
            h("small", { text: U.whenShort(x.ts) }),
            +x.un ? h("span", { style:"min-width:18px;height:18px;border-radius:10px;background:#25d366;color:#fff;text-align:center;line-height:18px;font-size:11px;padding:0 5px", text:String(x.un) }) : (+x.on ? h("i", { style:"width:8px;height:8px;border-radius:50%;background:#25d366" }) : null)
          ]),
          onClick: function () { waOpen(c, x.num, nm); }
        });
      }))] : [U.empty("message", "Belum ada chat", "Ketuk + untuk memulai WhatsApp dengan player lain.")];
    }
    return [U.nav({ large:"WhatsApp", largeSub: +net.bars ? ((net.carrier || "EAGLE") + " " + (net.nettype || "")) : "Offline", right:[U.navIcon("plus", function(){ waNew(c); })], extra:search }), U.body(body)];
  }

  function waName(num, n) { n = dec(n || ""); return n && n !== num ? nameOf(n) : String(num || "Nomor"); }

  function waNew(c) {
    if (!hasData()) return U.toast("WhatsApp membutuhkan jaringan", 1);
    var cc = P.ctx("contacts").cache.contacts, list = cc && cc.items || [];
    var box = h("div");
    if (!list.length) box.appendChild(U.empty("users", "Kontak kosong", "Tambahkan nomor lewat aplikasi Kontak atau masukkan nomor manual."));
    else box.appendChild(U.list(list.filter(function(x){return !+x.bl;}).map(function (ct) {
      return U.row({ av:U.avatar(ct.n || ct.num, null, "sm"), title:nameOf(ct.n || ct.num), sub:ct.num, onClick:function(){ sh.close(); waOpen(c, ct.num, ct.n); } });
    })));
    var sh = U.sheet({ title:"Chat Baru", tall:true, left:{label:"Batal"}, right:{label:"Nomor", fn:function(close){
      U.prompt("Nomor WhatsApp", "Masukkan nomor player yang terdaftar.", {ph:"08...", max:20}, function(v){ v=String(v||"").replace(/[^0-9+]/g,""); if(!v) return; close(); waOpen(c,v,v); });
    }}, body:box });
  }

  function waOpen(c, num, nm) {
    if (!hasData()) return U.toast("Tidak ada koneksi jaringan", 1);
    num = String(num || "").replace(/[^0-9+]/g, ""); if (!num) return;
    c.cache.wa_thread = null;
    P.send("wa_thread", -1, num);
    c.push(waThread, { num:num, n:nm || num });
  }

  function waBubble(m) {
    var cl = "ep-bub" + (+m.me ? " me" : "");
    if (+m.att === WA_IMG) {
      var url = dec(m.ad || "");
      return tap(h("div", { class:cl + " img" }, [U.img(url), h("small", { text:U.hhmm(m.ts) })]), function(){ if (P.viewImage) P.viewImage(url); });
    }
    return h("div", { class:cl }, [h("span", { text:dec(m.tx || "") }), h("small", { text:U.hhmm(m.ts) })]);
  }

  function waThread(c, st) {
    var t = c.cache.wa_thread && String(c.cache.wa_thread.num) === String(st.num) ? c.cache.wa_thread : null;
    var nm = waName(st.num, t && t.n || st.n), online = !!(t && +t.on);
    var msgs = h("div", { class:"ep-chat", style:"padding-bottom:calc(var(--u)*11)" });
    if (!hasData()) msgs.appendChild(netEmpty("Chat terputus"));
    else if (!t) msgs.appendChild(U.loading());
    else if (!(t.items || []).length) msgs.appendChild(h("div", { class:"ep-daysep", text:"Percakapan terenkripsi roleplay · kirim pesan ke " + nm }));
    else {
      (t.items || []).forEach(function(m){ msgs.appendChild(waBubble(m)); });
      var last=t.items[t.items.length-1]; if(last && +last.me) msgs.appendChild(h("div", {class:"ep-read", text:+last.rd?"Dibaca":"Terkirim"}));
    }

    var input = st.input || (st.input = h("textarea", {class:"cp-in", rows:"1", maxlength:"500", placeholder:"Pesan"}));
    var sendB = h("button", {type:"button", class:"cp-send"}, U.ic("up"));
    tap(sendB, function(){ var v=input.value.trim(); if(!v || !hasData()) return; P.sendJ("wa_send",-1,{to:st.num,tx:enc(v),at:0,ad:""}); input.value=""; P.sfx.sent(); });
    var plus=tap(h("button",{type:"button",class:"cp-plus"},U.ic("plus")),function(){
      if (!hasData()) return U.toast("Tidak ada jaringan",1);
      U.actions("Lampiran WhatsApp", [
        {label:"Foto dari galeri", fn:function(){ if(!P.pickPhoto) return U.toast("Galeri belum siap",1); P.pickPhoto(function(url){ P.sendJ("wa_send",-1,{to:st.num,tx:"",at:WA_IMG,ad:enc(url)}); }); }},
        {label:"Foto dari link", fn:function(){ U.prompt("Kirim foto","Link https://",{ph:"https://",max:300},function(v){ if(!/^https?:\/\//i.test(v))return U.toast("Link tidak valid",1); P.sendJ("wa_send",-1,{to:st.num,tx:"",at:WA_IMG,ad:enc(v)}); }); }}
      ]);
    });
    var comp=h("div",{class:"ep-composer"},[plus,input,sendB]);
    return [U.nav({back:"WhatsApp", title:nm, sub:online?"online":(hasData()?"offline":"tidak ada jaringan"), right:[U.navIcon("phone",function(){P.send("call",-1,st.num);}), U.navIcon("trash",function(){U.confirm("Hapus chat?","Riwayat WhatsApp di HP kamu akan dihapus.","Hapus",function(){P.send("wa_del",-1,st.num);c.pop();},true);})]}), U.body(msgs,"flush"), comp];
  }

  /* ------------------------------------------------------------------ */
  /* NATIVE WEB APPS — Android WebView layered into the phone screen    */
  /* ------------------------------------------------------------------ */
  function webClose(st) {
    try { if (bridge("closePhoneWeb")) window.CefBridge.closePhoneWeb(); } catch (e) {}
    if (st && st.resizeFn) { window.removeEventListener("resize", st.resizeFn); window.removeEventListener("eaglephonemove", st.resizeFn); st.resizeFn = null; }
    if (st && st.ro) { try { st.ro.disconnect(); } catch(e){} st.ro = null; }
    if (st) { st.webOpened = false; st.nativeAck = false; st.host = null; }
  }
  function webBounds(st, open, url, label) {
    var host = st && st.host;
    if (!host || !document.body.contains(host)) return;
    var r = host.getBoundingClientRect();
    if (r.width < 20 || r.height < 20) return;
    var vw = Math.max(1, document.documentElement.clientWidth || window.innerWidth || 1);
    var vh = Math.max(1, document.documentElement.clientHeight || window.innerHeight || 1);
    /* nx/ny/nw/nh are viewport-normalized. Android maps these against the
       actual CEF WebView pixel size, so device density / WebView scale can no
       longer enlarge the child WebView beyond the small phone screen. */
    var o = {
      url:url,
      nx:Math.max(0, Math.min(1, r.left / vw)),
      ny:Math.max(0, Math.min(1, r.top / vh)),
      nw:Math.max(0, Math.min(1, r.width / vw)),
      nh:Math.max(0, Math.min(1, r.height / vh)),
      x:r.left, y:r.top, w:r.width, h:r.height
    };
    try {
      if (open && bridge("openPhoneWeb")) {
        window.CefBridge.openPhoneWeb(JSON.stringify(o));
        st.webOpened = true;
      } else if (bridge("updatePhoneWebBounds")) window.CefBridge.updatePhoneWebBounds(JSON.stringify(o));
    } catch (e) { U.toast("WebView " + label + " gagal dibuka", 1); }
  }
  function webRender(c, st, opt) {
    if (!hasData()) {
      webClose(st);
      return [U.nav({back:true,title:opt.title}), U.body([netEmpty(opt.title + " offline")])];
    }
    if (!bridge("openPhoneWeb")) {
      return [U.nav({back:true,title:opt.title}), U.body([U.empty(opt.icon || "globe", "Native WebView belum tersedia", "Update APK launcher/client ke build v48.")])];
    }
    /* Parent ep-web-body adalah flex container. Sebelumnya host memakai flex:1
       di dalam .ep-body biasa (non-flex), sehingga tinggi host bisa 0px dan
       Android tidak pernah menerima openPhoneWeb(). */
    var host = st.host;
    if (!host) {
      host = h("div", { class:"ep-web-host", "data-touch":"" });
      host.style.background = opt.bg || "#000";
      st.host = host;
    }
    setTimeout(function(){ webBounds(st, !st.nativeAck, opt.url, opt.title); }, 40);
    setTimeout(function(){ webBounds(st, !st.nativeAck, opt.url, opt.title); }, 260);
    setTimeout(function(){ webBounds(st, !st.nativeAck, opt.url, opt.title); }, 700);
    setTimeout(function(){ webBounds(st, !st.nativeAck, opt.url, opt.title); }, 1500);
    if (!st.resizeFn) {
      st.resizeFn = function(){ setTimeout(function(){ webBounds(st, false, opt.url, opt.title); }, 50); };
      window.addEventListener("resize", st.resizeFn);
      window.addEventListener("eaglephonemove", st.resizeFn);
    }
    if (!st.ro && window.ResizeObserver) {
      st.ro = new ResizeObserver(function(){
        if (st.host && document.body.contains(st.host)) webBounds(st, false, opt.url, opt.title);
      });
      try { st.ro.observe(host); } catch(e){}
    }
    return [
      U.nav({
        back:true, title:opt.title,
        sub:(P.net.carrier || "EAGLE") + " " + (P.net.nettype || ""),
        right:[
          U.navIcon("back", function(){ try { if (bridge("phoneWebBack")) window.CefBridge.phoneWebBack(); } catch(e){} }),
          U.navIcon("refresh", function(){ try { if (bridge("phoneWebReload")) window.CefBridge.phoneWebReload(); } catch(e){} })
        ]
      }),
      U.body(host,"flush ep-web-body")
    ];
  }
  function registerNativeWebApp(id, opt) {
    P.app(id, {
      keys:[id], darkBar:false,
      open:function(ctx){
        P.send("net_get");
        ctx.push(function(c, st){ return webRender(c, st, opt); },{});
      },
      data:function(ctx){ ctx.refresh(); },
      onClose:function(ctx){ var top=ctx.top(); webClose(top && top.st); }
    });
  }

  if (E && E.on) E.on("phoneweb", function(d) {
    if (!d || !d.st) return;
    var cur = P.cur, top = cur && cur.top ? cur.top() : null;
    if (cur && (cur.id === "youtube" || cur.id === "spotify") && top && top.st) {
      if (d.st === "loading" || d.st === "ready") top.st.nativeAck = true;
      top.st.webState = d.st;
    }
    if (d.st === "error" && P.state && P.state.open) U.toast(d.msg || "WebView gagal memuat halaman", 1);
  });

  registerNativeWebApp("youtube", {
    title:"YouTube", icon:"video", url:"https://m.youtube.com/", bg:"#000"
  });
  registerNativeWebApp("spotify", {
    title:"Spotify", icon:"music", url:"https://open.spotify.com/", bg:"#121212"
  });

  if (window.EAGLE && window.EAGLE.done) window.EAGLE.done("phone_apps_online");
})();
