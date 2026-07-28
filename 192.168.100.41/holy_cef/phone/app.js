*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;width:100%;height:100%;background:transparent;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#fff;overflow:hidden}
body{display:flex;align-items:center;justify-content:flex-end;padding-right:clamp(8px,2vw,18px)}

/* Phone frame */
.phone{position:relative;width:min(300px,86vw);height:min(600px,90vh);border-radius:40px;background:#000;box-shadow:0 24px 70px rgba(0,0,0,.7),inset 0 0 0 3px #1f2937;overflow:hidden;padding:14px 12px 28px;isolation:isolate}

/* Notch / Dynamic Island */
.notch{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:50;pointer-events:none}
.notch-pill{width:96px;height:28px;border-radius:20px;background:#000;box-shadow:inset 0 0 4px rgba(255,255,255,.08)}

/* Status bar */
.status-bar{position:absolute;top:0;left:0;right:0;height:34px;display:flex;justify-content:space-between;align-items:center;padding:0 18px;z-index:40;font-size:12px;font-weight:600;color:#fff;pointer-events:none}
.status-right{display:flex;align-items:center;gap:4px}
.mini-icon{width:14px;height:14px;vertical-align:middle;opacity:.9}

/* Wallpaper */
.wallpaper{position:absolute;inset:0;z-index:0;background:linear-gradient(145deg,#0f0c29,#302b63,#24243e,#1a0b2e,#4a1942);background-size:200% 200%;animation:bgShift 20s ease infinite}
@keyframes bgShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

/* Screens */
.screen{display:none;position:relative;z-index:1;height:100%;overflow:hidden}
.screen.active{display:block}

/* ---------- LOCK SCREEN ---------- */
.lock-overlay{height:100%;display:flex;flex-direction:column;align-items:center;padding:48px 10px 24px;text-align:center}
.lock-top{margin-bottom:12px}
.lock-clock{font-size:56px;font-weight:300;letter-spacing:-1px;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.4)}
.lock-date{font-size:15px;font-weight:500;color:#e2e8f0;margin-top:4px;text-shadow:0 1px 6px rgba(0,0,0,.35)}

.lock-wallet{width:100%;max-width:260px;padding:12px 14px;border-radius:20px;margin-bottom:12px;text-align:left}
.lock-wallet-header{margin-bottom:10px}
.lock-wallet .muted{font-size:9px;letter-spacing:.18em;color:#bfdbfe;text-transform:uppercase;margin-bottom:2px}
.lock-name{font-size:17px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lock-number{font-size:12px;color:#dbeafe;margin-top:1px}
.lock-money{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lock-money div{background:rgba(0,0,0,.25);border-radius:12px;padding:8px 10px}
.lock-money span{display:block;font-size:10px;color:#94a3b8}.lock-money b{font-size:14px}

.lock-notifs{width:100%;max-width:260px;flex:1;overflow:auto;padding-right:2px;display:flex;flex-direction:column;gap:8px}
.notif{padding:10px 12px;border-radius:18px;text-align:left;backdrop-filter:blur(14px)}
.notif-app{font-size:10px;font-weight:700;color:#cbd5e1;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.notif-body{display:flex;align-items:flex-start;gap:10px}
.notif-icon{width:32px;height:32px;border-radius:10px;background:#16a34a;padding:6px;flex-shrink:0}
.notif-text{flex:1;min-width:0}
.notif-title{font-size:13px;font-weight:700;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.notif-preview{font-size:12px;color:#e2e8f0;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.notif-time{font-size:10px;color:#94a3b8;white-space:nowrap;margin-left:4px}

.lock-bottom{margin-top:auto;padding-top:10px}
.lock-hint{cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;color:#e2e8f0;font-size:12px;font-weight:500;letter-spacing:.02em}
.lock-bar{width:120px;height:4px;border-radius:99px;background:rgba(255,255,255,.35);box-shadow:0 0 8px rgba(255,255,255,.15)}

/* Glass card utility */
.card-glass{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(16px);box-shadow:0 8px 24px rgba(0,0,0,.2)}

/* ---------- HOME SCREEN ---------- */
.home-content{height:100%;display:flex;flex-direction:column;padding:36px 6px 86px}
.home-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(6px,1.6vw,10px);padding:6px 4px;overflow:auto}
.home-grid button,.dock button{background:transparent;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;padding:0}
.home-grid button:active,.dock button:active{transform:scale(.92)}
.app-icon-wrap{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.15);transition:transform .15s ease}
.app-icon-wrap img{width:28px;height:28px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))}
.app-label{font-size:10px;font-weight:600;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:64px}
.badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 5px;border-radius:99px;background:#ef4444;color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)}

/* Dock */
.dock{position:absolute;bottom:22px;left:12px;right:12px;height:72px;border-radius:24px;background:rgba(255,255,255,.12);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:space-around;padding:0 8px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.dock button{position:relative}
.dock .app-icon-wrap{width:48px;height:48px}
.dock .app-icon-wrap img{width:26px;height:26px}

/* ---------- iOS SCREENS (Contacts, Business, Twitter, Calc, AppStore) ---------- */
.ios-screen{background:#f2f2f7;color:#111}
.ios-header{height:52px;display:flex;align-items:center;gap:8px;padding:0 4px;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,.06);position:sticky;top:0;z-index:10}
.ios-header h2{flex:1;text-align:center;font-size:17px;font-weight:700;color:#000;margin:0}
.ios-back,.ios-action{background:transparent;border:0;color:#007aff;font-size:15px;font-weight:600;display:inline-flex;align-items:center;gap:4px;padding:6px 8px;border-radius:10px}
.ios-back:active,.ios-action:active{background:rgba(0,0,0,.06)}
.ios-back img,.ios-action img{width:18px;height:18px}

.ios-list{height:calc(100% - 52px);overflow:auto;padding:10px 12px 18px}
.ios-card{background:#fff;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.04)}
.ios-card h3{margin:0 0 4px;font-size:15px;font-weight:700;color:#111}
.ios-card p{font-size:13px;color:#555;margin:0;line-height:1.4}
.actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.actions button{background:#f2f2f7;color:#007aff;border:0;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:5px}
.actions button:active{background:#e5e5ea;transform:scale(.96)}
.actions .red{background:#ffeaea;color:#dc2626}
.actions .green{background:#e6f4ea;color:#16a34a}
.btn-icon{width:14px;height:14px;vertical-align:middle}

/* Empty state */
.empty{text-align:center;padding:40px 20px;color:#888}
.empty h3{font-size:16px;color:#555;margin-bottom:6px}
.empty p{font-size:13px;color:#888;margin:0}

/* Calculator */
.calcbox{padding:16px}
.calcbox input{width:100%;height:48px;border-radius:14px;border:1px solid #d1d5db;background:#fff;color:#111;padding:0 14px;font-size:18px;margin-bottom:12px;outline:none}
#calcBtn{width:100%;height:48px;border-radius:14px;background:#007aff;color:#fff;font-size:17px;font-weight:700;border:0}
#calcBtn:active{background:#0051d5}
#calcResult{margin-top:14px;padding:14px;border-radius:14px;background:#e6f4ea;color:#065f46;font-size:16px;font-weight:600}

/* Bottom nav (Twitter) */
.bottom-nav{position:absolute;bottom:0;left:0;right:0;height:56px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-top:1px solid rgba(0,0,0,.06);display:flex;justify-content:space-around;align-items:center;padding-bottom:4px}
.nav-tab{background:transparent;border:0;display:flex;flex-direction:column;align-items:center;gap:3px;color:#8e8e93;font-size:10px;font-weight:600;padding:4px 10px}
.nav-tab img{width:20px;height:20px;opacity:.6}
.nav-tab.active{color:#111}
.nav-tab.active img{opacity:1}

/* Tweet card */
.tweet-card{background:#fff;border-bottom:1px solid #eee;padding:14px 4px}
.tweet-header{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.tweet-avatar{width:36px;height:36px;border-radius:50%;background:#ddd;display:grid;place-items:center;font-size:14px;font-weight:700;color:#555;flex-shrink:0}
.tweet-meta{flex:1;min-width:0}
.tweet-name{font-size:14px;font-weight:700;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tweet-handle{font-size:13px;color:#555}
.tweet-text{font-size:14px;color:#111;line-height:1.45;margin-bottom:8px;word-break:break-word}
.tweet-actions{display:flex;gap:16px}
.tweet-actions span{font-size:13px;color:#555;display:inline-flex;align-items:center;gap:4px}

/* Toast */
#toast{position:absolute;left:16px;right:16px;bottom:42px;min-height:40px;display:none;border-radius:16px;background:rgba(15,23,42,.96);border:1px solid rgba(255,255,255,.15);padding:12px;font-size:13px;text-align:center;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.35);z-index:60}
#toast.show{display:block;animation:pop .18s ease-out}

/* Home bar */
.homebar{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:110px;height:5px;background:#fff;border-radius:99px;opacity:.9;z-index:50}

/* Scrollbar */
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:10px}

@keyframes pop{from{transform:translateY(10px);opacity:.3}to{transform:none;opacity:1}}

/* App icon brand colors */
.bg-bank{background:linear-gradient(135deg,#2563eb,#1d4ed8)}
.bg-contacts{background:linear-gradient(135deg,#16a34a,#15803d)}
.bg-twitter{background:linear-gradient(135deg,#0ea5e9,#0284c7)}
.bg-business{background:linear-gradient(135deg,#f59e0b,#d97706)}
.bg-gps{background:linear-gradient(135deg,#10b981,#059669)}
.bg-calc{background:linear-gradient(135deg,#f97316,#ea580c)}
.bg-camera{background:linear-gradient(135deg,#64748b,#475569)}
.bg-photo{background:linear-gradient(135deg,#8b5cf6,#7c3aed)}
.bg-unfreeze{background:linear-gradient(135deg,#06b6d4,#0891b2)}
.bg-vehicle{background:linear-gradient(135deg,#ef4444,#dc2626)}
.bg-inventory{background:linear-gradient(135deg,#eab308,#ca8a04)}
.bg-appstore{background:linear-gradient(135deg,#3b82f6,#2563eb)}
.bg-call{background:linear-gradient(135deg,#16a34a,#15803d)}
.bg-sms{background:linear-gradient(135deg,#16a34a,#15803d)}
.bg-settings{background:linear-gradient(135deg,#6b7280,#4b5563)}

/* ---------- RESPONSIVE COMPACT ---------- */
@media(max-height:620px){
  .phone{height:92vh;border-radius:32px;padding:12px 10px 20px;transform:scale(.9);transform-origin:center right}
  .lock-clock{font-size:44px}
  .lock-date{font-size:13px}
  .app-icon-wrap{width:44px;height:44px;border-radius:12px}
  .app-icon-wrap img{width:24px;height:24px}
  .app-label{font-size:9px}
  .dock{height:64px;border-radius:20px}
  .dock .app-icon-wrap{width:42px;height:42px}
  .dock .app-icon-wrap img{width:22px;height:22px}
  .home-content{padding:32px 4px 76px}
  .ios-header{height:46px}
  .ios-list{height:calc(100% - 46px)}
}
@media(max-width:420px){
  body{justify-content:center;padding-right:0}
  .phone{width:86vw;height:88vh;max-height:580px;border-radius:32px;transform:none}
  .home-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:420px) and (max-height:620px){
  .phone{transform:scale(.88)}
}

/* Ensure content sits above wallpaper */
.lock-overlay, .home-content{position:relative;z-index:1}

/* Twitter list needs extra bottom padding for bottom-nav */
#twitter .ios-list{padding-bottom:70px}
